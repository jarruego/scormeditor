/**
 * Metadatos de los bloques destacados (callouts) para el editor.
 * Iconos y etiquetas ALINEADOS con la carcasa (runtime/assets/js/renderer.js) y
 * colores con runtime/assets/css/styles.css: el bloque se ve en el editor con el
 * mismo aspecto que tendrá de verdad en el SCORM.
 */
export type CalloutMeta = { icon: string; label: string; color: string }

export const CALLOUT_META: Record<string, CalloutMeta> = {
  tip: { icon: '💡', label: 'Consejo', color: '#6dc3c0' },
  info: { icon: 'ℹ️', label: 'Información', color: '#7787bf' },
  warn: { icon: '⚠️', label: 'Atención', color: '#f4c910' },
  important: { icon: '📌', label: 'Importante', color: '#6dc3c0' },
  fact: { icon: '🧠', label: '¿Sabías que…?', color: '#6dc3c0' },
  reflect: { icon: '💭', label: 'Reflexiona', color: '#f4c910' },
  case: { icon: '🧪', label: 'Caso práctico', color: '#f4c910' },
}

/** Tipos que se ofrecen en los selectores del editor (orden de la barra). */
export const CALLOUT_ORDER = ['tip', 'warn', 'important', 'fact', 'reflect', 'case'] as const

export const HEX_RE = /^#[0-9a-fA-F]{3,8}$/

/** Color efectivo de un bloque (mismo fallback que la carcasa: violeta). */
export function calloutColor(ctype: string, color: string): string {
  if (ctype === 'custom') return HEX_RE.test(color) ? color : '#7787BF'
  return CALLOUT_META[ctype]?.color ?? CALLOUT_META.info.color
}
