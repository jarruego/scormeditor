import type { Screen, Interaction, InteractionType } from '../schema/course.schema'

/**
 * Genera la transcripción de una pantalla a partir de su contenido: el texto
 * del estudiante (markdown ligero → texto plano legible) más el enunciado de
 * la interacción si es informativa. Las interacciones evaluables se excluyen:
 * leer las opciones/respuestas en voz alta no tiene sentido.
 *
 * `accordion`/`tabs`/`flip_cards`/`timeline`/`image_cards`/`flashcards`
 * OCULTAN el CUERPO de cada ítem tras un gesto de revelado (desplegar/
 * pestañear/girar): ese cuerpo NO entra aquí (se narraría en voz antes de que
 * el alumno lo vea, chafando el propio mecanismo de descubrimiento) — se narra
 * por ítem, con audio propio que suena al revelar cada uno (ver `itemsOf()`/
 * `itemsKeyOf()` y `src/tts/tts.ts::generateForItem`). El TÍTULO/etiqueta de
 * cada ítem, en cambio, **es visible sin clicar** (cabecera del accordion,
 * pestaña, anverso de la tarjeta…), así que sí entra en la transcripción
 * general junto al `prompt` — funciona como un «índice hablado» de lo que hay
 * para explorar, sin desvelar el contenido.
 *
 * El resultado es texto plano pensado para el botón «Transcripción» de la
 * carcasa y como entrada del TTS (sin marcas ** * [], sin fences :::).
 */

/** Tipos de interacción cuyo contenido forma parte de la transcripción/narración. */
export const INFORMATIVE = new Set(['accordion', 'tabs', 'flip_cards', 'timeline', 'flashcards', 'image_cards', 'before_after'])

/** Tipos cuyo contenido se oculta tras un gesto de revelado y por eso se narra
 *  por ítem (audio propio) en vez de en la transcripción general. */
export const REVEALABLE_TYPES = new Set<InteractionType>([
  'accordion', 'tabs', 'flip_cards', 'timeline', 'image_cards', 'flashcards',
])

/** Clave de `config` donde vive la lista de ítems de un tipo revelable
 *  (`undefined` si el tipo no lo es). Única fuente de esta correspondencia:
 *  la reutilizan `itemsOf()` y `tts.ts` para localizar/parchear un ítem. */
const ITEM_KEY: Partial<Record<InteractionType, 'items' | 'cards' | 'milestones'>> = {
  accordion: 'items',
  tabs: 'items',
  flip_cards: 'cards',
  flashcards: 'cards',
  image_cards: 'cards',
  timeline: 'milestones',
}

export function itemsKeyOf(type: InteractionType): 'items' | 'cards' | 'milestones' | undefined {
  return ITEM_KEY[type]
}

// Etiquetas habladas de los callouts (mismas que renderer.js).
const CALLOUT_LABELS: Record<string, string> = {
  tip: 'Consejo',
  info: 'Información',
  warn: 'Atención',
  important: 'Importante',
  fact: '¿Sabías que…?',
  reflect: 'Reflexiona',
  case: 'Caso práctico',
}

/** Quita las marcas inline del markdown ligero (negrita, cursiva, enlaces). */
function inlinePlain(s: string): string {
  return String(s || '')
    // Imágenes ![alt](ruta): no se narran (el alt describe, no cuenta).
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .trim()
}

/** Markdown ligero (student_text, cuerpos de items) → texto plano por líneas. */
export function plainText(md: string): string {
  const out: string[] = []
  const lines = String(md || '').split(/\r?\n/)
  for (const raw of lines) {
    // Cierre de callout: se omite.
    if (/^\s*:::\s*$/.test(raw)) continue
    // Apertura de callout: se habla su etiqueta (o el título del bloque custom).
    const open = /^\s*:::\s*([A-Za-z]+)\s*(.*)$/.exec(raw)
    if (open) {
      const type = open[1].toLowerCase()
      if (type === 'custom') {
        const title = (open[2] || '').split('|')[2]?.trim()
        if (title) out.push(`${inlinePlain(title)}.`)
      } else if (CALLOUT_LABELS[type]) {
        out.push(`${CALLOUT_LABELS[type]}.`)
      }
      continue
    }
    let ln = raw
    const h = /^(#{2,3})\s+(.*)$/.exec(ln)
    if (h) ln = h[2]
    else {
      const bh = /^\s*\*\*(.+?)\*\*\s*:?\s*$/.exec(ln) // línea solo-negrita = encabezado
      if (bh) ln = bh[1]
      else {
        ln = ln.replace(/^\s*[-*•·–—]\s+/, '') // viñeta
        ln = ln.replace(/^\s*(\d+)[.)]\s+/, '$1. ') // lista numerada: conserva el número
      }
    }
    const t = inlinePlain(ln)
    if (t) out.push(t)
  }
  return out.join('\n')
}

/** Contenido hablable de una interacción informativa. */
function interactionPlain(it: Interaction): string {
  const parts: string[] = []
  const push = (s?: string) => {
    const t = inlinePlain(s || '')
    if (t) parts.push(t)
  }
  push(it.prompt)
  // Revelables: el enunciado + el título/etiqueta visible de cada ítem (un
  // «índice hablado»). El cuerpo oculto de cada ítem se narra aparte (itemsOf()).
  if (REVEALABLE_TYPES.has(it.type)) {
    for (const item of itemsOf(it)) if (item.label) parts.push(`${item.label}.`)
    return parts.join('\n')
  }
  const cfg = (it.config || {}) as Record<string, any>
  if (it.type === 'before_after') {
    // Lo único textual del comparador: etiqueta + descripción (alt) de cada cara.
    const face = (label: string, def: string, alt: string) => {
      const l = inlinePlain(label || def)
      const a = inlinePlain(alt || '')
      if (a) parts.push(`${l}: ${a}`)
    }
    face(cfg.before_label, 'Antes', cfg.before_alt)
    face(cfg.after_label, 'Después', cfg.after_alt)
  }
  return parts.join('\n')
}

export interface NarratableItem {
  /** Id estable del ítem (backfill al cargar/crear, ver `interactionRecipes`/editor). */
  id: string
  /** Título/cara/hito — visible SIN revelar el ítem; entra en la transcripción
   *  general de pantalla (ver `interactionPlain`). */
  label: string
  /** Guion hablado del audio de ítem: el propio texto visible (label + cuerpo). */
  text: string
  /** `audio_src` ya generado para este ítem, si lo hay. */
  audioSrc: string
}

/** Ítems narrables de una interacción revelable, con su guion (= texto visible,
 *  sin campo de locución aparte) y su `audio_src` si ya se generó. Devuelve
 *  `[]` para tipos no revelables. */
export function itemsOf(it: Interaction): NarratableItem[] {
  const key = ITEM_KEY[it.type]
  if (!key) return []
  const list = ((it.config || {}) as Record<string, any>)[key]
  if (!Array.isArray(list)) return []
  return list.map((raw: any, i: number) => {
    const id = typeof raw?.id === 'string' && raw.id ? raw.id : String(i)
    let label = ''
    let body = ''
    switch (it.type) {
      case 'flip_cards':
      case 'flashcards':
        label = raw?.front || ''
        body = raw?.back || ''
        break
      case 'timeline':
        label = [raw?.label, raw?.title].filter(Boolean).join(' · ')
        body = raw?.body || ''
        break
      case 'image_cards':
        label = raw?.title || ''
        body = raw?.text || ''
        break
      default: // accordion, tabs
        label = raw?.title || ''
        body = raw?.body || ''
    }
    const head = inlinePlain(label)
    const rest = plainText(body)
    const text = [head ? `${head}.` : '', rest].filter(Boolean).join('\n')
    const audioSrc = typeof raw?.audio_src === 'string' ? raw.audio_src : ''
    return { id, label: head, text, audioSrc }
  })
}

/** Transcripción completa de la pantalla (título + texto + interacción informativa). */
export function buildTranscript(screen: Screen): string {
  const parts: string[] = []
  const body = plainText(screen.student_text)
  if (body) parts.push(body)
  if (screen.interaction && INFORMATIVE.has(screen.interaction.type)) {
    const it = interactionPlain(screen.interaction)
    if (it) parts.push(it)
  }
  return parts.join('\n\n')
}
