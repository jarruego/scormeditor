import type { Screen, Interaction } from '../schema/course.schema'

/**
 * Genera la transcripción de una pantalla a partir de su contenido: el texto
 * del estudiante (markdown ligero → texto plano legible) más el contenido de
 * la interacción si es informativa (accordion/tabs/flip_cards/timeline/
 * flashcards, que CONTIENEN texto del curso). Las interacciones evaluables se
 * excluyen: leer las opciones/respuestas en voz alta no tiene sentido.
 *
 * El resultado es texto plano pensado para el botón «Transcripción» de la
 * carcasa y como entrada del TTS (sin marcas ** * [], sin fences :::).
 */

/** Tipos de interacción cuyo contenido forma parte de la transcripción/narración. */
export const INFORMATIVE = new Set(['accordion', 'tabs', 'flip_cards', 'timeline', 'flashcards'])

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
  const cfg = (it.config || {}) as Record<string, any>
  if (it.type === 'accordion' || it.type === 'tabs') {
    for (const item of cfg.items || []) {
      push(item.title ? `${inlinePlain(item.title)}.` : '')
      const body = plainText(item.body || '')
      if (body) parts.push(body)
    }
  } else if (it.type === 'flip_cards' || it.type === 'flashcards') {
    for (const c of cfg.cards || []) {
      const front = inlinePlain(c.front || '')
      const back = inlinePlain(c.back || '')
      if (front || back) parts.push([front, back].filter(Boolean).join('. '))
    }
  } else if (it.type === 'timeline') {
    for (const m of cfg.milestones || []) {
      const head = [inlinePlain(m.label || ''), inlinePlain(m.title || '')].filter(Boolean).join('. ')
      if (head) parts.push(`${head}.`)
      const body = plainText(m.body || '')
      if (body) parts.push(body)
    }
  }
  return parts.join('\n')
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
