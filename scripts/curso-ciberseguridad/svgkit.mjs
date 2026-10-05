/**
 * Kit de ilustraciones SVG planas y ligeras (2-6 KB cada una) para los cursos.
 * Cada pieza devuelve un fragmento SVG; `svg(w, h, ...piezas)` lo envuelve en un documento.
 * Se usan como `assets/img/*.svg` (visual_resource, image_cards, hotspots…) o incrustadas.
 *
 * Paleta común: tinta #1b2a41, azul #2f6fed, turquesa #14a39a, ámbar #f5a623, rojo #e5484d,
 * verde #2fb36d, violeta #7c5cd6. Texto con fuentes del sistema (un <img> SVG no carga webfonts).
 */
export const C = {
  ink: '#1b2a41', mut: '#5b6b82', blue: '#2f6fed', teal: '#14a39a', amber: '#f5a623', red: '#e5484d', green: '#2fb36d', violet: '#7c5cd6',
  sky: '#e8f0ff', mint: '#e3f6f3', sand: '#fff4de', rose: '#fdeaea', paper: '#ffffff', line: '#d9e2ee', skin: '#f2c9a5', skin2: '#c68a5e', skin3: '#8d5a3b',
}

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Documento SVG. `title` = texto accesible (role=img). */
export function svg(w, h, body, title = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img"${title ? ` aria-label="${esc(title)}"` : ''} font-family="system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif">${title ? `<title>${esc(title)}</title>` : ''}${body}</svg>`
}

/** Fondo con degradado y esquinas redondeadas. */
export const bg = (w, h, c1 = C.sky, c2 = '#ffffff', r = 24) =>
  `<defs><linearGradient id="bgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="${w}" height="${h}" rx="${r}" fill="url(#bgg)"/>`

export const rect = (x, y, w, h, fill, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 8}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 2}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}/>`
export const circle = (cx, cy, r, fill, o = {}) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 2}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}/>`
export const line = (x1, y1, x2, y2, stroke = C.ink, sw = 3, o = {}) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`
export const path = (d, fill = 'none', o = {}) => `<path d="${d}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 3}" stroke-linecap="round" stroke-linejoin="round"` : ''}${o.op ? ` opacity="${o.op}"` : ''}/>`
export const g = (x, y, inner, s = 1) => `<g transform="translate(${x} ${y})${s !== 1 ? ` scale(${s})` : ''}">${inner}</g>`

/** Texto (admite varias líneas con \n). */
export function text(x, y, str, o = {}) {
  const lines = String(str).split('\n')
  const size = o.size ?? 18
  const lh = o.lh ?? size * 1.25
  const tspans = lines.map((l, i) => `<tspan x="${x}" dy="${i === 0 ? 0 : lh}">${esc(l)}</tspan>`).join('')
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${o.weight ?? 600}" fill="${o.fill ?? C.ink}" text-anchor="${o.anchor ?? 'start'}">${tspans}</text>`
}

/** Etiqueta tipo «pastilla». */
export function pill(x, y, str, fill = C.blue, o = {}) {
  const size = o.size ?? 15
  const w = Math.round(str.length * size * 0.6 + 24)
  return `${rect(x, y, w, size + 16, fill, { r: (size + 16) / 2 })}${text(x + w / 2, y + size + 3, str, { size, fill: o.color ?? '#fff', anchor: 'middle', weight: 700 })}`
}

/** Globo de diálogo. tail: 'l' | 'r' | 'b' */
export function bubble(x, y, w, h, lines, o = {}) {
  const fill = o.fill ?? '#fff'
  const tail = o.tail === 'r' ? path(`M${x + w - 4} ${y + h - 18} l22 14 l-30 -2 z`, fill) : o.tail === 'b' ? path(`M${x + 30} ${y + h - 2} l10 18 l12 -18 z`, fill) : path(`M${x + 4} ${y + h - 18} l-22 14 l30 -2 z`, fill)
  return `${rect(x, y, w, h, fill, { r: 16, stroke: o.stroke ?? C.line, sw: 2 })}${tail}${text(x + 16, y + 28, lines, { size: o.size ?? 16, fill: o.color ?? C.ink, weight: o.weight ?? 600 })}`
}

/** Persona (busto). o: { skin, shirt, hair, hairStyle:'short'|'long'|'bun'|'bald', mask?, scale } */
export function person(x, y, o = {}) {
  const skin = o.skin ?? C.skin, shirt = o.shirt ?? C.teal, hair = o.hair ?? '#3b2a20', s = o.scale ?? 1
  const hs = o.hairStyle ?? 'short'
  const hairBack = hs === 'long' ? `<path d="M-30 -8 q0 -48 30 -48 q30 0 30 48 l0 44 l-60 0 z" fill="${hair}"/>` : hs === 'bun' ? `<circle cx="0" cy="-62" r="14" fill="${hair}"/>` : ''
  const hairTop = hs === 'bald' ? '' : `<path d="M-27 -14 q-2 -40 27 -40 q29 0 27 40 q-8 -16 -27 -16 q-19 0 -27 16 z" fill="${hair}"/>`
  const mask = o.mask ? `<path d="M-20 -6 q20 22 40 0 l-4 22 q-16 10 -32 0 z" fill="#bfe3ef" stroke="#8fc3d4" stroke-width="2"/>` : ''
  const badge = o.badge ? `<rect x="10" y="48" width="22" height="14" rx="3" fill="#fff" stroke="${C.line}"/><rect x="14" y="52" width="14" height="3" fill="${C.mut}"/>` : ''
  return g(x, y, `${hairBack}<path d="M-46 100 q0 -50 46 -50 q46 0 46 50 z" fill="${shirt}"/><rect x="-9" y="28" width="18" height="26" rx="8" fill="${skin}"/><ellipse cx="0" cy="-8" rx="28" ry="32" fill="${skin}"/>${hairTop}${mask}<circle cx="-10" cy="-8" r="3" fill="${C.ink}"/><circle cx="10" cy="-8" r="3" fill="${C.ink}"/>${o.mask ? '' : `<path d="M-9 8 q9 8 18 0" stroke="${C.ink}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`}${badge}`, s)
}

/** Móvil vertical con pantalla. inner = SVG dentro de la pantalla (0,0 = esquina sup. izq. de la pantalla, ancho w-20). */
export function phone(x, y, w, h, inner = '', o = {}) {
  return `${rect(x, y, w, h, o.body ?? C.ink, { r: 22 })}${rect(x + 8, y + 14, w - 16, h - 28, o.screen ?? '#fff', { r: 12 })}${rect(x + w / 2 - 18, y + 5, 36, 5, '#ffffff55', { r: 3 })}${g(x + 8, y + 14, inner)}`
}
/** Portátil. */
export function laptop(x, y, w, h, inner = '', o = {}) {
  return `${rect(x, y, w, h, o.body ?? C.ink, { r: 12 })}${rect(x + 8, y + 8, w - 16, h - 16, o.screen ?? '#fff', { r: 6 })}${g(x + 8, y + 8, inner)}${rect(x - 14, y + h, w + 28, 12, '#aab6c8', { r: 6 })}`
}
/** Tablet apaisada. */
export function tablet(x, y, w, h, inner = '', o = {}) {
  return `${rect(x, y, w, h, o.body ?? C.ink, { r: 18 })}${rect(x + 10, y + 10, w - 20, h - 20, o.screen ?? '#fff', { r: 8 })}${g(x + 10, y + 10, inner)}`
}

/** Iconos sencillos centrados en (cx, cy), tamaño ≈ s. */
export const icon = {
  lock: (cx, cy, s = 60, c = C.blue) => g(cx, cy, `<path d="M-14 -4 v-12 a14 14 0 0 1 28 0 v12" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/><rect x="-22" y="-6" width="44" height="36" rx="8" fill="${c}"/><circle cx="0" cy="10" r="5" fill="#fff"/><rect x="-2" y="12" width="4" height="9" rx="2" fill="#fff"/>`, s / 60),
  shield: (cx, cy, s = 60, c = C.teal, mark = 'check') => g(cx, cy, `<path d="M0 -30 l26 9 v18 c0 18 -12 28 -26 34 c-14 -6 -26 -16 -26 -34 v-18 z" fill="${c}"/>${mark === 'check' ? '<path d="M-11 2 l8 9 l16 -19" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' : mark === 'x' ? '<path d="M-10 -8 l20 20 M10 -8 l-20 20" stroke="#fff" stroke-width="6" stroke-linecap="round"/>' : ''}`, s / 60),
  warn: (cx, cy, s = 60, c = C.amber) => g(cx, cy, `<path d="M0 -30 l30 52 h-60 z" fill="${c}" stroke="${c}" stroke-width="6" stroke-linejoin="round"/><rect x="-3" y="-12" width="6" height="20" rx="3" fill="#fff"/><circle cx="0" cy="15" r="3.5" fill="#fff"/>`, s / 60),
  envelope: (cx, cy, s = 60, c = C.blue) => g(cx, cy, `<rect x="-30" y="-20" width="60" height="40" rx="7" fill="#fff" stroke="${c}" stroke-width="4"/><path d="M-28 -17 l28 22 l28 -22" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/>`, s / 60),
  hook: (cx, cy, s = 60, c = C.red) => g(cx, cy, `<path d="M0 -30 v38 a14 14 0 0 1 -28 0 M-28 8 l-8 -8 M-28 8 l8 -8" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="0" cy="-32" r="5" fill="${c}"/>`, s / 60),
  wifi: (cx, cy, s = 60, c = C.blue) => g(cx, cy, `<path d="M-30 -8 a42 42 0 0 1 60 0 M-20 4 a28 28 0 0 1 40 0 M-10 16 a14 14 0 0 1 20 0" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><circle cx="0" cy="26" r="5" fill="${c}"/>`, s / 60),
  usb: (cx, cy, s = 60, c = C.ink) => g(cx, cy, `<rect x="-14" y="-30" width="28" height="30" rx="4" fill="${c}"/><rect x="-8" y="-24" width="6" height="10" fill="#fff"/><rect x="2" y="-24" width="6" height="10" fill="#fff"/><rect x="-18" y="0" width="36" height="32" rx="8" fill="#6b7a90"/>`, s / 60),
  key: (cx, cy, s = 60, c = C.amber) => g(cx, cy, `<circle cx="-14" cy="0" r="14" fill="none" stroke="${c}" stroke-width="7"/><path d="M0 0 h32 M22 0 v10 M30 0 v8" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`, s / 60),
  eye: (cx, cy, s = 60, c = C.ink) => g(cx, cy, `<path d="M-32 0 q32 -34 64 0 q-32 34 -64 0 z" fill="#fff" stroke="${c}" stroke-width="4"/><circle cx="0" cy="0" r="11" fill="${c}"/><circle cx="4" cy="-4" r="3.5" fill="#fff"/>`, s / 60),
  robot: (cx, cy, s = 60, c = C.violet) => g(cx, cy, `<line x1="0" y1="-34" x2="0" y2="-24" stroke="${c}" stroke-width="4"/><circle cx="0" cy="-36" r="4" fill="${c}"/><rect x="-28" y="-24" width="56" height="44" rx="12" fill="${c}"/><circle cx="-11" cy="-4" r="6" fill="#fff"/><circle cx="11" cy="-4" r="6" fill="#fff"/><rect x="-12" y="8" width="24" height="5" rx="2.5" fill="#fff"/>`, s / 60),
  check: (cx, cy, s = 40, c = C.green) => g(cx, cy, `<circle r="22" fill="${c}"/><path d="M-10 1 l8 9 l14 -17" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`, s / 44),
  cross: (cx, cy, s = 40, c = C.red) => g(cx, cy, `<circle r="22" fill="${c}"/><path d="M-9 -9 l18 18 M9 -9 l-18 18" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`, s / 44),
  heart: (cx, cy, s = 40, c = C.red) => g(cx, cy, `<path d="M0 22 C-34 -4 -22 -30 -2 -20 C4 -17 0 -14 0 -14 C0 -14 -4 -17 2 -20 C22 -30 34 -4 0 22 z" fill="${c}"/>`, s / 56),
  doc: (cx, cy, s = 50, c = C.blue) => g(cx, cy, `<path d="M-20 -28 h26 l14 14 v42 h-40 z" fill="#fff" stroke="${c}" stroke-width="4" stroke-linejoin="round"/><path d="M6 -28 v14 h14" fill="none" stroke="${c}" stroke-width="4"/><path d="M-12 0 h24 M-12 10 h24 M-12 20 h14" stroke="${c}" stroke-width="3.5" stroke-linecap="round"/>`, s / 56),
  camera: (cx, cy, s = 50, c = C.ink) => g(cx, cy, `<rect x="-30" y="-16" width="60" height="40" rx="9" fill="${c}"/><rect x="-14" y="-24" width="28" height="12" rx="4" fill="${c}"/><circle cx="0" cy="4" r="12" fill="#fff"/><circle cx="0" cy="4" r="6" fill="#6b7a90"/>`, s / 60),
  cloud: (cx, cy, s = 60, c = C.sky, stroke = C.blue) => g(cx, cy, `<path d="M-26 18 a16 16 0 0 1 2 -32 a22 22 0 0 1 42 -4 a16 16 0 0 1 4 36 z" fill="${c}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`, s / 64),
  phoneCall: (cx, cy, s = 60, c = C.green) => g(cx, cy, `<path d="M-20 -22 q-8 0 -8 8 q4 36 36 40 q8 0 8 -8 l-2 -8 l-12 -2 l-6 6 q-12 -6 -16 -18 l6 -6 l-2 -12 z" fill="${c}"/><path d="M12 -26 a26 26 0 0 1 14 14 M14 -14 a14 14 0 0 1 8 8" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>`, s / 60),
  bed: (cx, cy, s = 60, c = C.teal) => g(cx, cy, `<rect x="-32" y="-6" width="64" height="22" rx="5" fill="${c}"/><rect x="-32" y="-22" width="14" height="38" rx="4" fill="${C.ink}"/><rect x="-16" y="-14" width="22" height="12" rx="6" fill="#fff"/><rect x="-32" y="16" width="5" height="10" fill="${C.ink}"/><rect x="27" y="16" width="5" height="10" fill="${C.ink}"/>`, s / 64),
  mic: (cx, cy, s = 60, c = C.red) => g(cx, cy, `<rect x="-11" y="-28" width="22" height="38" rx="11" fill="${c}"/><path d="M-20 0 a20 20 0 0 0 40 0 M0 20 v10 M-10 30 h20" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`, s / 60),
}

/** Pantalla de correo falso/legítimo (para mockups): cabecera + asunto + cuerpo + botón. */
export function mailMock(w, h, { de, asunto, cuerpo, boton, fraude = false }) {
  return `${rect(0, 0, w, h, '#fff', { r: 0 })}${rect(0, 0, w, 44, fraude ? C.rose : C.sky, { r: 0 })}${text(12, 20, de, { size: 12, weight: 700, fill: fraude ? C.red : C.blue })}${text(12, 36, asunto, { size: 12, fill: C.ink })}${text(12, 66, cuerpo, { size: 12, fill: C.mut, lh: 16 })}${boton ? rect(12, h - 50, w - 24, 32, fraude ? C.red : C.blue, { r: 8 }) + text(w / 2, h - 29, boton, { size: 13, fill: '#fff', anchor: 'middle', weight: 700 }) : ''}`
}

/** Banda inferior con rótulo (títulos de ilustración). */
export const caption = (w, h, str, fill = C.ink) => `${rect(0, h - 44, w, 44, fill, { r: 0 })}${text(w / 2, h - 16, str, { size: 16, fill: '#fff', anchor: 'middle', weight: 700 })}`
