import type { Course, Interaction, InteractionType, Screen } from '../schema/course.schema'
import { screenContainers } from '../schema/traverse'
import { INFORMATIVE, REVEALABLE_TYPES, interactionPlain, itemsOf, plainText, inlinePlain } from '../tts/buildTranscript'
import { extractYoutubeId } from '../media/youtube'

/**
 * Estimación ORIENTATIVA del tiempo que le llevaría a un alumno completar el
 * curso entero: lectura de texto + interacción con cada tipo de actividad
 * (según su tamaño: nº de opciones, pasos, palabras…) + vídeos. Un único
 * algoritmo genérico por TIPO de interacción, no por curso concreto — sirve
 * igual para cualquier SCORM hecho con el editor.
 *
 * No es una medición real (no hay telemetría de alumnos): son heurísticas
 * de diseño instruccional razonables, pensadas para HACERSE UNA IDEA al ir
 * montando el curso, no una cifra exacta. Dos limitaciones asumidas a
 * propósito:
 * - Vídeo de YouTube: el editor es una SPA sin backend (ver CLAUDE.md) y no
 *   hay forma de conocer la duración real sin una llamada a una API externa
 *   con clave — se usa `YOUTUBE_DEFAULT_SECONDS` como duración media asumida.
 * - `html_embed`: contenido a medida del autor, imposible de estimar — usa
 *   `HTML_EMBED_SECONDS` fijo.
 *
 * Partido en dos fases, como `NarrationDurationIndicator`:
 * `estimateScreensSync()` es puro y síncrono (texto + heurística por tipo +
 * vídeo de YouTube); la duración de audio/vídeo de archivo necesita leer
 * metadatos (async, `src/media/probeDuration.ts`) y la combina el componente
 * que la muestra (`CourseTimeIndicator`).
 */

/** Palabras/minuto de lectura silenciosa y comprensiva de contenido educativo
 *  — más lenta que la lectura de ocio (~200-250 ppm): heurística habitual en
 *  diseño instruccional (100-130 ppm «para retener, no solo pasar la vista»).
 */
const READING_WPM = 130

/** Duración asumida de un vídeo de YouTube cuando no se puede saber la real. */
const YOUTUBE_DEFAULT_SECONDS = 4 * 60

/** `html_embed`: contenido a medida, sin forma genérica de estimarlo. */
const HTML_EMBED_SECONDS = 30

function wordCount(s: string): number {
  const t = s.trim()
  return t ? t.split(/\s+/).length : 0
}
function readingSeconds(text: string): number {
  return (wordCount(text) / READING_WPM) * 60
}

/** Heurística BASE + POR UNIDAD (opción/paso/palabra/zona…) de cada tipo
 *  evaluable: el tiempo de «hacer» la actividad, además de leerla (la lectura
 *  del enunciado/instrucciones se añade aparte, igual para todos los tipos).
 *  BASE cubre orientarse en la actividad; POR_UNIDAD, cada opción/paso/zona
 *  que hay que leer y manipular. */
const EVALUABLE: Partial<Record<InteractionType, { base: number; perUnit: number; unit: (it: Interaction) => number }>> = {
  single_choice: { base: 5, perUnit: 6, unit: (it) => (it.options || []).length },
  true_false: { base: 5, perUnit: 6, unit: (it) => (it.options || []).length },
  fill_blanks: {
    base: 8, perUnit: 10,
    unit: (it) => (String((it.config as Record<string, unknown>)?.text || '').match(/\[\[(.+?)\]\]/g) || []).length,
  },
  sort_steps: { base: 8, perUnit: 7, unit: (it) => ((it.config as Record<string, unknown>)?.steps as unknown[] || []).length },
  match_pairs: { base: 10, perUnit: 9, unit: (it) => (it.options || []).length },
  classification: { base: 10, perUnit: 9, unit: (it) => (it.options || []).length },
  hotspots: { base: 8, perUnit: 7, unit: (it) => ((it.config as Record<string, unknown>)?.spots as unknown[] || []).length },
  word_search: { base: 15, perUnit: 20, unit: (it) => ((it.config as Record<string, unknown>)?.words as unknown[] || []).length },
  crossword: { base: 15, perUnit: 16, unit: (it) => ((it.config as Record<string, unknown>)?.entries as unknown[] || []).length },
  hidden_image: { base: 8, perUnit: 14, unit: (it) => ((it.config as Record<string, unknown>)?.questions as unknown[] || []).length },
  az_quiz: { base: 8, perUnit: 14, unit: (it) => ((it.config as Record<string, unknown>)?.items as unknown[] || []).length },
  puzzle: {
    base: 10, perUnit: 5,
    unit: (it) => {
      const cfg = (it.config as Record<string, unknown>) || {}
      const cols = Math.min(5, Math.max(2, Number(cfg.cols) || 3))
      const rows = Math.min(5, Math.max(2, Number(cfg.rows) || 3))
      return cols * rows
    },
  },
  // Contenido a medida del autor: imposible de estimar por tamaño, se usa un
  // tiempo fijo (ver HTML_EMBED_SECONDS).
  html_embed: { base: HTML_EMBED_SECONDS, perUnit: 0, unit: () => 0 },
}

/** Tiempo (s) de la parte «hacer la actividad» de una interacción evaluable
 *  (sin contar la lectura del enunciado/instrucciones, añadida aparte). */
function evaluableActivitySeconds(it: Interaction): number {
  const spec = EVALUABLE[it.type]
  if (!spec) return 0
  return spec.base + spec.perUnit * spec.unit(it)
}

/** Vídeo embebido en la interacción `video` (`config.src` o `config.youtube`)
 *  + tiempo de las preguntas de pausa, si las hay. La duración del archivo se
 *  resuelve aparte (async, ver `videoRefs`); aquí solo la de YouTube (fija, no
 *  hay forma de conocer la real) y las preguntas. */
function videoInteractionSeconds(it: Interaction): { seconds: number; filePath?: string } {
  const cfg = (it.config as Record<string, unknown>) || {}
  const questions = (cfg.questions as { prompt?: string }[] | undefined || []).filter((q) => (q.prompt || '').trim())
  const questionsSeconds = questions.length * 12
  if (typeof cfg.src === 'string' && cfg.src) return { seconds: questionsSeconds, filePath: cfg.src }
  if (typeof cfg.youtube === 'string' && cfg.youtube) return { seconds: YOUTUBE_DEFAULT_SECONDS + questionsSeconds }
  return { seconds: questionsSeconds }
}

/** Tiempo (s) de leer+hacer la interacción de una pantalla (sin el texto de
 *  `student_text`, que se cuenta aparte): enunciado + instrucciones (todos
 *  los tipos) + la parte específica del tipo. */
function interactionSeconds(it: Interaction): { seconds: number; filePath?: string } {
  let seconds = readingSeconds(inlinePlain(it.prompt)) + readingSeconds(inlinePlain(it.instructions))
  if (it.type === 'video') {
    const v = videoInteractionSeconds(it)
    return { seconds: seconds + v.seconds, filePath: v.filePath }
  }
  if (INFORMATIVE.has(it.type)) {
    if (REVEALABLE_TYPES.has(it.type)) {
      // Revelable: el enunciado ya se contó arriba; el cuerpo de cada ítem
      // SOLO se lee al revelarlo (no entra en `interactionPlain`, a
      // propósito — ver buildTranscript.ts), así que se suma aparte con el
      // texto REAL de cada ítem (label + cuerpo) más un pequeño margen por
      // el propio gesto de abrir/girar cada uno.
      const items = itemsOf(it)
      seconds += items.reduce((a, x) => a + readingSeconds(x.text), 0) + items.length * 4
    } else {
      // No revelable (before_after/case_practice/scenario_decision):
      // `interactionPlain` YA incluye el enunciado, así que se resta el que
      // se sumó arriba para no contarlo dos veces.
      seconds += readingSeconds(interactionPlain(it)) - readingSeconds(inlinePlain(it.prompt))
      if (it.type === 'case_practice') seconds += 90 // pensar/escribir en papel antes de autoevaluarse
      else if (it.type === 'scenario_decision') seconds += 15 // decidir entre las opciones
      else if (it.type === 'before_after') seconds += 10 // comparar las dos caras
    }
    return { seconds }
  }
  return { seconds: seconds + evaluableActivitySeconds(it) }
}

export interface ScreenTimeEstimate {
  screenId: string
  /** Segundos calculables sin leer ningún archivo: título + `student_text` +
   *  interacción (enunciado/instrucciones/actividad) + vídeo de YouTube. */
  syncSeconds: number
  /** Parte de `syncSeconds` que es «leer la pantalla» (título + texto):
   *  si la pantalla tiene audio de locución, el que la muestra sustituye esto
   *  por la duración REAL del audio en vez de sumar las dos cosas (se
   *  escuchan a la vez que se mira la pantalla, no una detrás de otra). */
  textSeconds: number
  /** Ruta del audio de locución, si tiene (para medir su duración real). */
  audioPath?: string
  /** Rutas de vídeo/archivo (no YouTube) que hay que medir aparte (async). */
  videoPaths: string[]
}

/** Estimación síncrona (sin leer ningún archivo) de cada pantalla narrable
 *  del curso. Excluye esqueletos/pendientes de desarrollo (no son contenido
 *  real, mismo criterio que el resto de agregados del curso). */
export function estimateScreensSync(course: Course): ScreenTimeEstimate[] {
  const out: ScreenTimeEstimate[] = []
  for (const { screens } of screenContainers(course)) {
    for (const s of screens) {
      if (s.type === 'content_placeholder' || s.status === 'esqueleto_pendiente_desarrollo') continue
      out.push(estimateScreen(s))
    }
  }
  return out
}

function estimateScreen(s: Screen): ScreenTimeEstimate {
  const textSeconds = readingSeconds(inlinePlain(s.title)) + readingSeconds(plainText(s.student_text))
  let seconds = textSeconds
  const videoPaths: string[] = []
  if (s.visual_resource) {
    if (s.visual_resource.kind === 'video_file' && s.visual_resource.src) videoPaths.push(s.visual_resource.src)
    else if (s.visual_resource.kind === 'video_youtube' && extractYoutubeId(s.visual_resource.src)) seconds += YOUTUBE_DEFAULT_SECONDS
  }
  let audioPath: string | undefined
  if (s.interaction) {
    const it = interactionSeconds(s.interaction)
    seconds += it.seconds
    if (it.filePath) videoPaths.push(it.filePath)
  }
  if (s.audio_src.trim()) audioPath = s.audio_src.trim()
  return { screenId: s.id, syncSeconds: seconds, textSeconds, audioPath, videoPaths }
}

/** Formatea segundos como «Xh Ym»/«X min»/«X s», igual criterio que el resto
 *  de indicadores de duración del editor. */
export function formatEstimatedDuration(totalSeconds: number): string {
  const s = Math.round(totalSeconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h} h ${m} min`
  if (m > 0) return `${m} min`
  return `${sec} s`
}
