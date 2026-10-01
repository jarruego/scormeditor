import { useCourseStore } from '../store/courseStore'
import type { Course, Screen } from '../schema/course.schema'
import { allScreens } from '../schema/traverse'
import { buildTranscript, contentHash, itemsOf, itemsKeyOf } from './buildTranscript'

/**
 * Narración por voz (TTS) integrada en el editor.
 *
 * SCORMEditor es una SPA sin backend: las llamadas van DIRECTAS desde el
 * navegador al proveedor de TTS. La CLAVE de API se guarda solo en el
 * `localStorage` del navegador del autor y nunca sale del equipo ni viaja en
 * el `.scormproj` (ver `keys`/`LS_KEY` más abajo) — pero el resto de la config
 * (proveedor, modelo, voz, formato, velocidad, tono/«Vibe») sí viaja en el
 * proyecto (`course.narration.tts`, ver `course.schema.ts`): no es secreta, y
 * así todo el equipo locuta con la misma voz al abrir el mismo `.scormproj`,
 * sin tener que reconfigurarla cada uno en su navegador. Sin dependencias:
 * usamos `fetch` contra la API REST.
 *
 * Dos proveedores soportados:
 *  - `openai`: endpoint `/audio/speech`, devuelve audio ya codificado (mp3/…).
 *    Pago por uso (céntimos por curso).
 *  - `gemini`: Google Generative Language API (`:generateContent`), devuelve PCM
 *    crudo (L16, 24 kHz, mono) que envolvemos en WAV. Tiene capa gratuita.
 *
 * El audio generado se guarda como asset (`assets/media/<id>_narracion.<ext>`),
 * igual que un audio subido a mano, y se referencia en `screen.audio_src`, de
 * modo que viaja en el ZIP del proyecto y del SCORM.
 */

export type TtsProvider = 'openai' | 'gemini'

export interface TtsConfig {
  provider: TtsProvider
  /** Una clave por proveedor: cada API es distinta y se conservan por separado. */
  keys: Record<TtsProvider, string>
  /** Base de la API OpenAI (permite Azure/OpenAI-compatibles). Ignorado en Gemini. */
  baseUrl: string
  model: string
  voice: string
  /** Formato de salida OpenAI. Gemini siempre produce WAV. */
  format: 'mp3' | 'wav' | 'opus' | 'aac' | 'flac'
  /** Velocidad de locución OpenAI (0.25–4.0). Ignorado en Gemini. */
  speed: number
  /** Indicaciones de tono/estilo (OpenAI gpt-4o-mini-tts; Gemini como prefijo). */
  instructions: string
}

const LS_KEY = 'scormeditor.tts'

export const PROVIDERS: { value: TtsProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI (pago por uso, céntimos)' },
  { value: 'gemini', label: 'Google Gemini (gratis)' },
]

export const OPENAI_MODELS = ['gpt-4o-mini-tts', 'tts-1', 'tts-1-hd'] as const
// Las 13 voces del modelo más nuevo (gpt-4o-mini-tts; OpenAI recomienda
// marin/cedar para la mejor calidad). Los modelos heredados tts-1/tts-1-hd
// solo soportan las 9 de OPENAI_VOICES_LEGACY (sin ballad/verse/marin/cedar):
// voicesFor() ya filtra según el modelo.
// Fuente: https://platform.openai.com/docs/guides/text-to-speech (sep. 2026).
export const OPENAI_VOICES = [
  'alloy', 'ash', 'ballad', 'cedar', 'coral', 'echo', 'fable', 'marin', 'nova', 'onyx', 'sage', 'shimmer', 'verse',
] as const
const OPENAI_VOICES_LEGACY = new Set<string>(['alloy', 'ash', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer'])

// Percepción de género MÁS REPETIDA en foros/artículos de la comunidad — NO
// es un dato oficial de OpenAI (que deliberadamente no lo publica: varias
// voces están pensadas como neutras) y para varias voces la percepción se
// contradice entre fuentes. Se muestra en el editor con un aviso de que es
// orientativa (ver TtsPanel.tsx). Las 4 voces más nuevas (ballad, verse,
// marin, cedar) no tienen aún consenso documentado: se omiten a propósito en
// vez de arriesgar una etiqueta sin base.
export const OPENAI_VOICE_GENDER: Partial<Record<(typeof OPENAI_VOICES)[number], 'm' | 'f' | 'n'>> = {
  alloy: 'n',
  ash: 'm',
  coral: 'f',
  echo: 'm',
  fable: 'm',
  nova: 'f',
  onyx: 'm',
  sage: 'f',
  shimmer: 'f',
}

export const GEMINI_MODELS = ['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts'] as const
// Subconjunto curado de voces preconstruidas de Gemini (hay ~30 disponibles).
export const GEMINI_VOICES = [
  'Kore', 'Puck', 'Zephyr', 'Charon', 'Aoede', 'Leda', 'Orus', 'Fenrir', 'Callirrhoe', 'Enceladus',
] as const

export function modelsFor(provider: TtsProvider): readonly string[] {
  return provider === 'gemini' ? GEMINI_MODELS : OPENAI_MODELS
}
/** Voces disponibles; en OpenAI depende también del modelo (tts-1/tts-1-hd
 *  soportan menos que gpt-4o-mini-tts). */
export function voicesFor(provider: TtsProvider, model?: string): readonly string[] {
  if (provider === 'gemini') return GEMINI_VOICES
  if (model === 'tts-1' || model === 'tts-1-hd') return OPENAI_VOICES.filter((v) => OPENAI_VOICES_LEGACY.has(v))
  return OPENAI_VOICES
}
/** Etiqueta de una voz para el desplegable: nombre + género orientativo entre
 *  paréntesis cuando hay consenso de comunidad suficiente (ver OPENAI_VOICE_GENDER). */
export function voiceLabel(provider: TtsProvider, voice: string): string {
  if (provider !== 'openai') return voice
  const g = OPENAI_VOICE_GENDER[voice as (typeof OPENAI_VOICES)[number]]
  return g ? `${voice} (${g === 'm' ? 'hombre' : g === 'f' ? 'mujer' : 'neutra'})` : voice
}
/** Valores que deben restablecerse al cambiar de proveedor (modelo y voz válidos). */
export function providerDefaults(provider: TtsProvider): Partial<TtsConfig> {
  const model = modelsFor(provider)[0]
  return { provider, model, voice: voicesFor(provider, model)[0] }
}

/** Límite de caracteres por petición; margen bajo el máximo de OpenAI (4096). */
const MAX_CHARS = 3800

// Vibe por defecto (tono/estilo para narración educativa) — mismo texto que
// el default de `course.schema.ts` (`narration.tts.instructions`); duplicado
// a propósito (zod no puede importar de aquí sin acoplar el esquema a este
// módulo), mantener los dos en sync. En inglés deliberadamente: es el propio
// contenido que se envía tal cual a la API como instrucciones de estilo, no
// texto de interfaz — traducirlo cambiaría lo que de verdad lee el modelo.
export const DEFAULT_VIBE = `Voice Affect: Educative, clear, engaging. Articulate and structured, instilling focus and curiosity.

Tone: Pedagogical, friendly, and professional. Conversational and approachable, avoiding monotonous delivery.

Pacing: Moderate to measured. Balanced rhythm for taking notes and processing complex concepts. Slower for new definitions; normal for everyday examples.

Emotions: Enthusiasm for learning, patience, and encouraging clarity.

Pronunciation: Flawless, precise, neutral Spanish accent. Perfect articulation of consonants so diverse audiences understand. Emphasis on key technical words.

Pauses: Short, natural pauses at sentences and commas. Longer, deliberate pauses after a question or definition, giving the student a moment to process the information.`

const DEFAULTS: TtsConfig = {
  provider: 'openai',
  keys: { openai: '', gemini: '' },
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini-tts',
  voice: 'marin',
  format: 'mp3',
  speed: 1,
  instructions: DEFAULT_VIBE,
}
// DEFAULTS sin `keys`: base de la config de PROYECTO — nunca debe llevar
// claves, ni siquiera vacías (se filtran aquí una sola vez para que ningún
// `{ ...PROJECT_DEFAULTS, ... }` pueda colar `keys` en `course.narration.tts`).
const { keys: _defaultKeys, ...PROJECT_DEFAULTS } = DEFAULTS

/** Lee SOLO las claves de API guardadas en este navegador (nunca en el
 *  proyecto). Conserva el formato histórico de `LS_KEY` por compatibilidad,
 *  aunque desde que el resto de la config vive en el proyecto este
 *  `localStorage` ya solo guarda `keys`. */
function readLocalKeys(): Record<TtsProvider, string> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      const keys = { ...DEFAULTS.keys, ...(saved.keys || {}) }
      // Migración: versiones antiguas guardaban una única `apiKey` compartida.
      if (typeof saved.apiKey === 'string' && saved.apiKey && !keys[saved.provider as TtsProvider]) {
        keys[saved.provider as TtsProvider] = saved.apiKey
      }
      return keys
    }
  } catch {
    /* localStorage no disponible o JSON corrupto: usamos defaults */
  }
  return { ...DEFAULTS.keys }
}

/** Config de voz del proyecto actual (todo salvo `keys`) — vive en
 *  `course.narration.tts`, así que viaja en el `.scormproj`/ZIP y la comparte
 *  todo el equipo. Proyectos de antes de este campo reciben los valores por
 *  defecto de `course.schema.ts` (los mismos que `DEFAULTS` aquí) al cargar. */
function readProjectTts(): Omit<TtsConfig, 'keys'> {
  try {
    const tts = useCourseStore.getState().course?.narration?.tts as Partial<TtsConfig> | undefined
    // Se copian los campos UNO A UNO (nunca `{ ...tts }`) a propósito: así, si
    // algún proyecto llegase a tener un `keys` colado en `narration.tts` (p.
    // ej. un `.scormproj` de una build con un bug ya corregido), se descarta
    // aquí en vez de propagarse al guardar — `keys` JAMÁS debe salir de este
    // módulo hacia el proyecto.
    if (tts) {
      return {
        provider: tts.provider ?? PROJECT_DEFAULTS.provider,
        baseUrl: tts.baseUrl ?? PROJECT_DEFAULTS.baseUrl,
        model: tts.model ?? PROJECT_DEFAULTS.model,
        voice: tts.voice ?? PROJECT_DEFAULTS.voice,
        format: tts.format ?? PROJECT_DEFAULTS.format,
        speed: tts.speed ?? PROJECT_DEFAULTS.speed,
        instructions: tts.instructions ?? PROJECT_DEFAULTS.instructions,
      }
    }
  } catch {
    /* fuera de un store montado (tests, etc.): usamos defaults */
  }
  return { ...PROJECT_DEFAULTS }
}

export function getTtsConfig(): TtsConfig {
  return { ...readProjectTts(), keys: readLocalKeys() }
}

/** Actualiza la config de voz. Las claves de API (`patch.keys`) se guardan
 *  SOLO en `localStorage`, nunca en el proyecto; el resto (proveedor, modelo,
 *  voz, formato, velocidad, instrucciones) se guarda en
 *  `course.narration.tts` con un paso de deshacer que agrupa ediciones
 *  seguidas (p. ej. tecleando el «Vibe»), igual que un campo de texto normal. */
export function setTtsConfig(patch: Partial<TtsConfig>): TtsConfig {
  const { keys: keyPatch, ...rest } = patch
  if (keyPatch) {
    const keys = { ...readLocalKeys(), ...keyPatch }
    try { localStorage.setItem(LS_KEY, JSON.stringify({ keys })) } catch { /* ignorar */ }
  }
  if (Object.keys(rest).length) {
    const next = { ...readProjectTts(), ...rest }
    useCourseStore.getState().updateNarration({ tts: next }, 'tts-config')
  }
  return getTtsConfig()
}

/** Clave activa según el proveedor seleccionado (sin espacios). */
export function keyFor(cfg: TtsConfig): string {
  return (cfg.keys[cfg.provider] || '').trim()
}

/** Guarda la clave de un proveedor concreto sin tocar la del otro. */
export function setProviderKey(provider: TtsProvider, key: string): TtsConfig {
  return setTtsConfig({ keys: { [provider]: key } as Record<TtsProvider, string> })
}

export function hasApiKey(): boolean {
  return keyFor(getTtsConfig()).length > 0
}

/** Extensión del archivo de salida según el proveedor/formato. */
function outputExt(cfg: TtsConfig): string {
  return cfg.provider === 'gemini' ? 'wav' : cfg.format
}

/** MIME aproximado por formato OpenAI (por si la respuesta no trae content-type). */
function mimeFor(format: TtsConfig['format']): string {
  switch (format) {
    case 'mp3': return 'audio/mpeg'
    case 'wav': return 'audio/wav'
    case 'opus': return 'audio/ogg'
    case 'aac': return 'audio/aac'
    case 'flac': return 'audio/flac'
  }
}

/** Trocea un texto largo en fragmentos <= MAX_CHARS respetando frases. */
function splitText(text: string): string[] {
  const clean = text.trim()
  if (clean.length <= MAX_CHARS) return clean ? [clean] : []
  const sentences = clean.split(/(?<=[.!?…])\s+/)
  const chunks: string[] = []
  let cur = ''
  for (const s of sentences) {
    if ((cur ? cur.length + 1 : 0) + s.length > MAX_CHARS) {
      if (cur) { chunks.push(cur); cur = '' }
      if (s.length > MAX_CHARS) {
        for (let i = 0; i < s.length; i += MAX_CHARS) chunks.push(s.slice(i, i + MAX_CHARS))
      } else {
        cur = s
      }
    } else {
      cur = cur ? `${cur} ${s}` : s
    }
  }
  if (cur) chunks.push(cur)
  return chunks
}

/** Mensaje de error legible a partir de una respuesta HTTP fallida. */
async function errorFromResponse(res: Response): Promise<Error> {
  let detail = `${res.status} ${res.statusText}`
  try {
    const j = await res.json()
    if (j?.error?.message) detail = j.error.message
  } catch {
    /* cuerpo no-JSON: nos quedamos con el status */
  }
  if (res.status === 401 || res.status === 403) return new Error(`Clave de API rechazada (${res.status}). Revisa la clave. — ${detail}`)
  if (res.status === 429) return new Error(`Límite de uso o cuota agotada (429). — ${detail}`)
  return new Error(detail)
}

// ---- OpenAI -----------------------------------------------------------------

/** Tope de tiempo por petición a la API de TTS. Sin esto, una petición que se
 *  quede colgada sin responder NI fallar (red inestable, servidor que no
 *  contesta) deja la generación en bloque parada en esa pantalla para
 *  siempre — el síntoma es «se queda en una diapositiva y no avanza», y no
 *  hay forma de distinguirlo de verdad estar generando algo largo sin esto. */
const FETCH_TIMEOUT_MS = 60000

/** Combina el `signal` del llamante (botón «Cancelar») con un tope de tiempo
 *  propio: lo que dispare primero aborta el `fetch`. Un aborto por tiempo se
 *  distingue de uno por cancelación explícita en el `name` del error
 *  resultante (`TimeoutError` vs `AbortError`) — `generateAll`/
 *  `generateAllItems` solo cortan el bucle entero con `AbortError`
 *  (cancelación del usuario); un `TimeoutError` se trata como un error más de
 *  ESE archivo, se apunta en el resultado y el bucle sigue con el siguiente. */
function withTimeout(signal: AbortSignal | undefined, ms: number): { signal: AbortSignal; cleanup: () => void } {
  const ctrl = new AbortController()
  const onAbort = () => ctrl.abort(signal!.reason)
  if (signal) {
    if (signal.aborted) ctrl.abort(signal.reason)
    else signal.addEventListener('abort', onAbort)
  }
  const timer = setTimeout(
    () => ctrl.abort(new DOMException(`Sin respuesta del servidor tras ${Math.round(ms / 1000)} s.`, 'TimeoutError')),
    ms,
  )
  return {
    signal: ctrl.signal,
    cleanup: () => { clearTimeout(timer); if (signal) signal.removeEventListener('abort', onAbort) },
  }
}

/** Sintetiza un fragmento con OpenAI y devuelve el audio ya codificado. */
async function openaiChunk(text: string, cfg: TtsConfig, signal?: AbortSignal): Promise<Blob> {
  const body: Record<string, unknown> = {
    model: cfg.model,
    voice: cfg.voice,
    input: text,
    response_format: cfg.format,
    speed: cfg.speed,
  }
  if (cfg.model === 'gpt-4o-mini-tts' && cfg.instructions.trim()) {
    body.instructions = cfg.instructions.trim()
  }
  const url = `${cfg.baseUrl.replace(/\/+$/, '')}/audio/speech`
  const { signal: fetchSignal, cleanup } = withTimeout(signal, FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${keyFor(cfg)}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: fetchSignal,
    })
    if (!res.ok) throw await errorFromResponse(res)
    return await res.blob()
  } finally {
    cleanup()
  }
}

// ---- Gemini -----------------------------------------------------------------

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

/** Frecuencia de muestreo del mimeType L16 (p. ej. "audio/L16;codec=pcm;rate=24000"). */
function rateFromMime(mime: string): number {
  const m = /rate=(\d+)/.exec(mime || '')
  return m ? Number(m[1]) : 24000
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const p of parts) { out.set(p, off); off += p.length }
  return out
}

/** Envuelve PCM 16-bit mono en una cabecera WAV para que sea reproducible/guardable. */
function pcmToWavBlob(pcm: Uint8Array, sampleRate: number): Blob {
  const numChannels = 1
  const bitsPerSample = 16
  const blockAlign = (numChannels * bitsPerSample) / 8
  const byteRate = sampleRate * blockAlign
  const buffer = new ArrayBuffer(44 + pcm.length)
  const view = new DataView(buffer)
  const writeStr = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)) }
  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + pcm.length, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true) // tamaño del bloque fmt
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  writeStr(36, 'data')
  view.setUint32(40, pcm.length, true)
  new Uint8Array(buffer, 44).set(pcm)
  return new Blob([buffer], { type: 'audio/wav' })
}

/** Sintetiza un fragmento con Gemini y devuelve el PCM crudo + su sample rate. */
async function geminiChunk(text: string, cfg: TtsConfig, signal?: AbortSignal): Promise<{ pcm: Uint8Array; rate: number }> {
  const prompt = cfg.instructions.trim() ? `${cfg.instructions.trim()}: ${text}` : text
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cfg.model)}:generateContent`
  const { signal: fetchSignal, cleanup } = withTimeout(signal, FETCH_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'x-goog-api-key': keyFor(cfg), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: cfg.voice } } },
        },
      }),
      signal: fetchSignal,
    })
  } finally {
    cleanup()
  }
  if (!res.ok) throw await errorFromResponse(res)
  const json = await res.json()
  const part = json?.candidates?.[0]?.content?.parts?.[0]
  const b64 = part?.inlineData?.data
  if (!b64) throw new Error('La API de Gemini no devolvió audio (revisa el modelo TTS y la voz).')
  return { pcm: base64ToBytes(b64), rate: rateFromMime(part.inlineData.mimeType) }
}

// ---- Síntesis (multi-proveedor, con troceado) -------------------------------

/**
 * Sintetiza un texto de cualquier longitud. Trocea si excede el límite y
 * combina: en Gemini concatena el PCM y escribe una única cabecera WAV; en
 * OpenAI concatena los blobs codificados (los frames MP3/AAC se reproducen bien).
 */
export async function synthesize(
  text: string,
  cfgOverride?: Partial<TtsConfig>,
  signal?: AbortSignal,
): Promise<Blob> {
  const cfg = { ...getTtsConfig(), ...cfgOverride }
  if (!keyFor(cfg)) throw new Error('Falta la clave de API. Configúrala en «Narración por voz».')
  const chunks = splitText(text)
  if (chunks.length === 0) throw new Error('No hay texto que locutar.')

  if (cfg.provider === 'gemini') {
    const pcms: Uint8Array[] = []
    let rate = 24000
    for (const chunk of chunks) {
      const r = await geminiChunk(chunk, cfg, signal)
      pcms.push(r.pcm)
      rate = r.rate
    }
    return pcmToWavBlob(concatBytes(pcms), rate)
  }

  const parts: Blob[] = []
  for (const chunk of chunks) parts.push(await openaiChunk(chunk, cfg, signal))
  if (parts.length === 1) return parts[0]
  return new Blob(parts, { type: parts[0].type || mimeFor(cfg.format) })
}

// ---- Aplicación al curso ----------------------------------------------------

/** Recorre todas las pantallas del curso en orden. */
export function eachScreen(): Screen[] {
  return allScreens(useCourseStore.getState().course)
}

export interface NarratableScreen {
  id: string
  title: string
  hasTranscript: boolean
  hasAudio: boolean
  /** Tiene contenido narrable (mismo criterio que `buildTranscript`/validación). */
  hasContent: boolean
  /** Esqueleto/pendiente de desarrollo: se excluye del trabajo de narración. */
  skeleton: boolean
  /** El contenido cambió desde que se escribió/regeneró la transcripción
   *  (huella no coincide; sin huella sellada nunca se marca, ver NARR_TRANSCRIPT_STALE). */
  staleTranscript: boolean
  /** La transcripción cambió desde que se generó el audio (mismo criterio, NARR_AUDIO_STALE). */
  staleAudio: boolean
}

/** Lista las pantallas con datos relevantes para narración. */
export function listNarratable(): NarratableScreen[] {
  return eachScreen().map((s) => ({
    id: s.id,
    title: s.title || s.id,
    hasTranscript: s.transcript.trim().length > 0,
    hasAudio: s.audio_src.trim().length > 0,
    hasContent: buildTranscript(s).trim().length > 0,
    skeleton: s.type === 'content_placeholder' || s.status === 'esqueleto_pendiente_desarrollo',
    staleTranscript: !!s.transcript_content_hash && s.transcript_content_hash !== contentHash(buildTranscript(s)),
    staleAudio: !!s.audio_src.trim() && !!s.audio_transcript_hash && s.audio_transcript_hash !== contentHash(s.transcript),
  }))
}

/** Guarda el audio generado como asset y lo enlaza en la pantalla. */
function applyAudio(screenId: string, blob: Blob, cfg: TtsConfig) {
  const path = `assets/media/${screenId}_narracion.${outputExt(cfg)}`
  const st = useCourseStore.getState()
  st.addAsset(path, blob)
  st.updateScreen(screenId, { audio_src: path })
  return path
}

export interface NarratableItemEntry {
  screenId: string
  screenTitle: string
  interactionId: string
  itemId: string
  hasAudio: boolean
  hasText: boolean
}

/** Lista los ítems narrables por separado (accordion/tabs/flip_cards/timeline/
 *  image_cards/flashcards, y las zonas de hotspots) de todo el curso, con su
 *  estado de audio — para el contador de narración masiva y la pestaña
 *  Validación. */
export function listNarratableItems(): NarratableItemEntry[] {
  const out: NarratableItemEntry[] = []
  for (const s of eachScreen()) {
    if (!s.interaction) continue
    for (const item of itemsOf(s.interaction)) {
      out.push({
        screenId: s.id,
        screenTitle: s.title || s.id,
        interactionId: s.interaction.id,
        itemId: item.id,
        hasAudio: item.audioSrc.trim().length > 0,
        hasText: item.text.trim().length > 0,
      })
    }
  }
  return out
}

/** Rutas de TODOS los audios de narración ya generados (de pantalla y de
 *  ítem/zona), sin duplicados — la usan `TtsPanel` (suma de duración) y la
 *  compresión de audio (`exportScorm.ts`/`StudentPreview.tsx`, ver
 *  «Compresión de audio de locución» en `tts-narracion.md`). No incluye
 *  audio visual (vídeo, `visual_resource` de tipo audio): solo narración.
 *  Por defecto lee el curso en vivo del store; `exportScorm.ts` pasa su
 *  propio `course` (tras `stripFlaggedForReview`) para no acoplarse al
 *  store. */
export function listNarrationAudioPaths(course?: Course): string[] {
  const paths = new Set<string>()
  for (const s of (course ? allScreens(course) : eachScreen())) {
    if (s.audio_src.trim()) paths.add(s.audio_src.trim())
    if (s.interaction) {
      for (const item of itemsOf(s.interaction)) {
        if (item.audioSrc.trim()) paths.add(item.audioSrc.trim())
      }
    }
  }
  return [...paths]
}

/** Prefijo del generador de ids por clave de `config` — mismo criterio que
 *  `rid()` en `InteractionConfigEditor.tsx` (no se reutiliza literalmente esa
 *  función porque vive en un componente de UI; el formato del id es lo único
 *  que importa, nunca se parsea). */
const ID_PREFIX: Record<string, string> = { items: 'it', cards: 'cd', milestones: 'ms', spots: 'sp' }

/** Asegura que TODOS los ítems narrables de una interacción tienen un `id`
 *  propio persistido, asignándoselo ya mismo si falta. Necesario antes de
 *  generar en bloque: `itemsOf()` (buildTranscript.ts) da, a un ítem SIN
 *  `id`, uno de usar y tirar (su posición en el array) solo para poder
 *  listarlo/leer su texto — si se generase el audio con ese id efímero,
 *  `applyItemAudio` nunca encontraría con qué ítem emparejarlo (compara por
 *  `id` real) y el audio se perdería en silencio: se sintetiza (gasta la
 *  llamada a la API) pero no se guarda, y la pantalla sigue «sin audio» para
 *  siempre por mucho que se regenere. Los botones de audio por ítem del
 *  editor (`InteractionConfigEditor.tsx`) ya se cubren solos con su propio
 *  `ensureId`/`ensureIds`; esta es la misma protección para la generación
 *  masiva de `generateAllItems`, que parte de `listNarratableItems()` y no
 *  pasa por esos componentes. */
function ensureItemIds(screenId: string, interactionId: string): void {
  const st = useCourseStore.getState()
  const screen = st.getScreen(screenId)
  const it = screen?.interaction
  if (!it || it.id !== interactionId) return
  const key = itemsKeyOf(it.type)
  if (!key) return
  const cfgObj = (it.config || {}) as Record<string, any>
  const list: any[] = Array.isArray(cfgObj[key]) ? cfgObj[key] : []
  if (!list.length || list.every((raw) => typeof raw?.id === 'string' && raw.id)) return
  const prefix = ID_PREFIX[key] || 'it'
  const nextList = list.map((raw) => (raw?.id ? raw : { ...raw, id: `${prefix}-${Math.random().toString(36).slice(2, 7)}` }))
  st.updateScreen(screenId, { interaction: { ...it, config: { ...cfgObj, [key]: nextList } } })
}

/** Guarda el audio de un ítem como asset y lo enlaza en `config.items[].audio_src`
 *  (o `cards`/`milestones` según el tipo). */
function applyItemAudio(screenId: string, interactionId: string, itemId: string, blob: Blob, cfg: TtsConfig) {
  const path = `assets/media/${screenId}_${interactionId}_${itemId}_narracion.${outputExt(cfg)}`
  const st = useCourseStore.getState()
  st.addAsset(path, blob)
  const screen = st.getScreen(screenId)
  const it = screen?.interaction
  const key = it ? itemsKeyOf(it.type) : undefined
  if (it && key && it.id === interactionId) {
    const cfgObj = (it.config || {}) as Record<string, any>
    const list: any[] = Array.isArray(cfgObj[key]) ? cfgObj[key] : []
    const nextList = list.map((raw) => (raw?.id === itemId ? { ...raw, audio_src: path } : raw))
    st.updateScreen(screenId, { interaction: { ...it, config: { ...cfgObj, [key]: nextList } } })
  }
  return path
}

/**
 * Genera (o regenera) el audio de un ítem narrable por separado (accordion/
 * tabs/flip_cards/timeline/image_cards/flashcards, y las zonas de hotspots) a
 * partir de su propio texto visible — no hay transcripción de ítem aparte
 * (ver `itemsOf` en `buildTranscript.ts`). Devuelve la ruta del asset creado.
 */
export async function generateForItem(
  screenId: string,
  interactionId: string,
  itemId: string,
  signal?: AbortSignal,
): Promise<string> {
  const screen = useCourseStore.getState().getScreen(screenId)
  if (!screen?.interaction || screen.interaction.id !== interactionId) throw new Error('Interacción no encontrada.')
  const item = itemsOf(screen.interaction).find((i) => i.id === itemId)
  if (!item || !item.text.trim()) throw new Error('El ítem no tiene texto que locutar.')
  const cfg = getTtsConfig()
  const blob = await synthesize(item.text.trim(), undefined, signal)
  return applyItemAudio(screenId, interactionId, itemId, blob, cfg)
}

/**
 * Genera (o regenera) el audio de una pantalla a partir de su transcripción.
 * Devuelve la ruta del asset creado.
 */
export async function generateForScreen(screenId: string, signal?: AbortSignal): Promise<string> {
  const screen = useCourseStore.getState().getScreen(screenId)
  if (!screen) throw new Error('Pantalla no encontrada.')
  const text = screen.transcript.trim()
  if (!text) throw new Error('La pantalla no tiene transcripción que locutar.')
  const cfg = getTtsConfig()
  const blob = await synthesize(text, undefined, signal)
  return applyAudio(screenId, blob, cfg)
}

export interface BulkResult {
  done: number
  skipped: number
  errors: { id: string; title: string; message: string }[]
}

export interface BulkOptions {
  /** Si true, salta las pantallas que ya tienen `audio_src`. */
  onlyMissing: boolean
  onProgress?: (info: { index: number; total: number; title: string }) => void
  signal?: AbortSignal
}

/** Genera el audio de todas las pantallas con transcripción (secuencial). */
export async function generateAll(opts: BulkOptions): Promise<BulkResult> {
  const cfg = getTtsConfig()
  if (!keyFor(cfg)) throw new Error('Falta la clave de API. Configúrala en «Narración por voz».')

  const targets = eachScreen().filter((s) => s.transcript.trim().length > 0)
  const result: BulkResult = { done: 0, skipped: 0, errors: [] }
  let index = 0
  for (const s of targets) {
    if (opts.signal?.aborted) break
    index++
    if (opts.onlyMissing && s.audio_src.trim()) { result.skipped++; continue }
    opts.onProgress?.({ index, total: targets.length, title: s.title || s.id })
    try {
      const blob = await synthesize(s.transcript.trim(), undefined, opts.signal)
      applyAudio(s.id, blob, cfg)
      result.done++
    } catch (e) {
      if ((e as Error).name === 'AbortError') break
      result.errors.push({ id: s.id, title: s.title || s.id, message: (e as Error).message })
    }
  }
  return result
}

/** Genera el audio de todos los ítems narrables (accordion/tabs/flip_cards/
 *  timeline/image_cards/flashcards, y zonas de hotspots) con texto, de todo
 *  el curso (secuencial). Mismo patrón que `generateAll` pero por ítem, no
 *  por pantalla. */
export async function generateAllItems(opts: BulkOptions): Promise<BulkResult> {
  const cfg = getTtsConfig()
  if (!keyFor(cfg)) throw new Error('Falta la clave de API. Configúrala en «Narración por voz».')

  // Primero, sanear ids que falten (ver `ensureItemIds`): si no, el audio de
  // esos ítems se generaría y se perdería en silencio, sin quedar nunca
  // guardado por mucho que se regenere — el síntoma es «siempre faltan los
  // mismos N, aunque los genere».
  for (const s of eachScreen()) {
    if (s.interaction && itemsKeyOf(s.interaction.type)) ensureItemIds(s.id, s.interaction.id)
  }

  const targets = listNarratableItems().filter((it) => it.hasText)
  const result: BulkResult = { done: 0, skipped: 0, errors: [] }
  let index = 0
  for (const item of targets) {
    if (opts.signal?.aborted) break
    index++
    if (opts.onlyMissing && item.hasAudio) { result.skipped++; continue }
    opts.onProgress?.({ index, total: targets.length, title: item.screenTitle })
    try {
      await generateForItem(item.screenId, item.interactionId, item.itemId, opts.signal)
      result.done++
    } catch (e) {
      if ((e as Error).name === 'AbortError') break
      result.errors.push({ id: item.itemId, title: item.screenTitle, message: (e as Error).message })
    }
  }
  return result
}
