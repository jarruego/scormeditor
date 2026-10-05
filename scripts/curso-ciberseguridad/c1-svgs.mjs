/** Ilustraciones SVG propias del curso 1 (svgkit). Todas 640x360. */
import { svg, bg, person, tablet, laptop, phone, icon, pill, rect, circle, line, path, g, text, caption, C } from './svgkit.mjs'

const W = 640, H = 360
const ttl = (s, y = 40, size = 28) => text(320, y, s, { size, weight: 800, anchor: 'middle' })

function edificio(x, y, w, h, { roof = C.blue, cols = 4, rows = 2 } = {}) {
  let s = rect(x, y, w, h, '#fff', { stroke: roof, sw: 4, r: 8 })
  s += path(`M${x - 14} ${y + 6} L${x + w / 2} ${y - 56} L${x + w + 14} ${y + 6} z`, roof)
  s += circle(x + w / 2, y - 22, 17, '#fff') + path(`M${x + w / 2} ${y - 32} v20 M${x + w / 2 - 10} ${y - 22} h20`, 'none', { stroke: C.red, sw: 5 })
  const cw = (w - 24) / cols
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) s += rect(x + 12 + c * cw + 4, y + 18 + r * 46, cw - 8, 30, (r + c) % 3 === 0 ? C.sand : C.sky, { stroke: '#b9c9e2', sw: 2, r: 5 })
  s += rect(x + w / 2 - 22, y + h - 58, 44, 58, C.teal, { r: 6 }) + circle(x + w / 2 + 12, y + h - 28, 3, '#fff')
  return s
}

export const portada = svg(W, H,
  bg(W, H, '#d6e6ff', '#f1fbfa') + circle(560, 60, 90, '#fff', { op: 0.6 }) + circle(70, 310, 110, '#fff', { op: 0.5 }) +
  rect(0, 300, W, 60, '#cfe3f7', { r: 0 }) +
  edificio(190, 150, 260, 150) +
  icon.wifi(110, 110, 56, C.blue) + icon.wifi(540, 120, 46, C.teal) +
  icon.shield(480, 238, 100, C.teal) + icon.lock(150, 250, 70, C.blue) +
  person(70, 250, { scale: 0.85, shirt: C.blue }) + person(585, 255, { scale: 0.85, shirt: C.violet, hairStyle: 'long', hair: '#6b4423', skin: C.skin2 }) +
  ttl('Ciberseguridad en el centro', 42, 30) + text(320, 72, 'Tú cuidas de las personas. Y también de sus datos.', { size: 18, fill: C.mut, anchor: 'middle' }),
  'Un centro sociosanitario protegido por un escudo y un candado, con dos trabajadoras a los lados')

export const l1 = svg(W, H,
  bg(W, H, '#e8f0ff', '#ffffff') + rect(0, 290, W, 26, '#cfe3f7', { r: 0 }) +
  edificio(215, 130, 210, 160, { cols: 3 }) +
  icon.heart(120, 190, 70) + icon.doc(520, 180, 80) + icon.bed(110, 270, 60) + icon.key(535, 262, 60) +
  pill(60, 70, 'Datos de salud', C.blue) + pill(430, 60, 'Dinero', C.amber, { color: C.ink }) +
  caption(W, H, 'Datos · Cuidados · Dinero · Confianza'),
  'Un centro sociosanitario rodeado de lo que hay que proteger: datos de salud, cuidados, dinero y confianza')

export const datos = svg(W, H,
  bg(W, H, '#eaf3ff', '#fff') +
  rect(210, 40, 220, 250, '#fff', { stroke: C.blue, sw: 4, r: 14 }) +
  rect(228, 60, 184, 34, C.sky, { r: 8 }) + text(320, 84, 'Expediente', { size: 20, weight: 800, anchor: 'middle', fill: C.blue }) +
  icon.heart(260, 135, 52) + line(300, 125, 400, 125, C.line, 7) + line(300, 148, 380, 148, C.line, 7) +
  line(232, 190, 408, 190, C.line, 7) + line(232, 214, 408, 214, C.line, 7) + line(232, 238, 340, 238, C.line, 7) +
  icon.lock(404, 266, 64, C.teal) +
  icon.hook(100, 140, 80, C.red) + text(100, 215, 'Quien roba\nlos datos', { size: 18, anchor: 'middle', fill: C.red, weight: 800 }) +
  line(150, 150, 205, 150, C.red, 4, { dash: '8 8' }) +
  icon.eye(540, 140, 70, C.ink) + text(540, 200, 'Y los ve\nquien no debe', { size: 18, anchor: 'middle', weight: 800 }) +
  line(436, 150, 490, 150, C.ink, 4, { dash: '8 8' }) +
  caption(W, H, 'Los datos de salud tienen valor, también para quien los roba'),
  'Un expediente de salud protegido por un candado, con un anzuelo y un ojo que intentan llegar a él')

export const ransomware = svg(W, H,
  bg(W, H, '#fdeaea', '#ffffff') +
  laptop(170, 50, 300, 200, rect(0, 0, 284, 184, '#2a0f14', { r: 0 }) + icon.lock(142, 62, 76, C.red) + text(142, 122, 'Tus archivos están cifrados', { size: 17, fill: '#fff', anchor: 'middle', weight: 800 }) + text(142, 146, 'Paga o los perderás', { size: 15, fill: '#ffb3b6', anchor: 'middle' }) + text(142, 168, '(ejemplo ilustrativo)', { size: 12, fill: '#9aa6b8', anchor: 'middle', weight: 500 }), { screen: '#2a0f14' }) +
  icon.warn(90, 150, 90, C.amber) + icon.doc(555, 130, 70, C.mut) + path('M530 180 l50 -20', 'none', { stroke: C.red, sw: 5 }) + icon.cross(578, 170, 36, C.red) +
  caption(W, H, 'Ransomware: los datos «secuestrados»'),
  'Un ordenador con un mensaje de rescate de ejemplo que dice que los archivos están cifrados')

export const equipo = svg(W, H,
  bg(W, H, '#e3f6f3', '#ffffff') + rect(0, 296, W, 20, '#cfe9e6', { r: 0 }) +
  icon.shield(110, 92, 62, C.blue) + icon.shield(250, 92, 62, C.teal) + icon.shield(390, 92, 62, C.violet) + icon.shield(530, 92, 62, C.amber) +
  person(110, 200, { shirt: C.blue, scale: 0.95, badge: true }) + person(250, 200, { shirt: C.teal, scale: 0.95, hairStyle: 'long', hair: '#6b4423', skin: C.skin2, badge: true }) +
  person(390, 200, { shirt: C.violet, scale: 0.95, hairStyle: 'bun', hair: '#8a8f98', badge: true }) + person(530, 200, { shirt: C.amber, scale: 0.95, hairStyle: 'bald', skin: C.skin3, badge: true }) +
  caption(W, H, 'Tú eres la mejor defensa'),
  'Cuatro profesionales de un centro sociosanitario, cada una con un escudo de protección sobre la cabeza')

export const pilares = svg(W, H,
  bg(W, H, '#eef3ff', '#fff') +
  [[60, 'Disponibilidad', 'Que esté cuando\nhace falta', C.blue], [235, 'Integridad', 'Que nadie la\naltere', C.teal], [410, 'Confidencialidad', 'Que solo la vea\nquien debe', C.violet]].map(([x, t, s, col], i) =>
    rect(x, 30, 170, 260, '#fff', { stroke: col, sw: 4, r: 16 }) + rect(x, 30, 170, 8, col, { r: 4 }) +
    [tablet(x + 35, 66, 100, 70, text(40, 40, '✓', { size: 30, anchor: 'middle', fill: C.ok || C.green, weight: 800 })), icon.doc(x + 85, 100, 90, C.teal), icon.eye(x + 85, 100, 80, C.violet)][i] +
    text(x + 85, 190, t, { size: 18, weight: 800, anchor: 'middle', fill: col }) + text(x + 85, 222, s, { size: 16, anchor: 'middle', fill: C.mut, lh: 21 })).join('') +
  caption(W, H, 'Los tres pilares de la información'),
  'Tres tarjetas: disponibilidad, integridad y confidencialidad')

export const niveles = svg(W, H,
  bg(W, H, '#f4f8ff', '#fff') +
  [['Restringida', 'Historia clínica, medicación,\nfotos de heridas', C.red], ['Confidencial', 'Nóminas, contratos,\ncuentas del centro', '#b86e00'], ['Uso interno', 'Cuadrantes y\nprotocolos internos', C.blue], ['Pública', 'Menú semanal,\nweb del centro', '#1b8a50']].map(([t, e, col], i) =>
    rect(24, 20 + i * 70, 592, 62, '#fff', { stroke: C.line, sw: 2, r: 12 }) + rect(24, 20 + i * 70, 200, 62, col, { r: 12 }) + text(124, 59 + i * 70, t, { size: 21, weight: 800, anchor: 'middle', fill: '#fff' }) +
    text(244, 46 + i * 70, e, { size: 17, weight: 600, lh: 21 })).join('') +
  caption(W, H, 'De más a menos protegida'),
  'Cuatro niveles de información de mayor a menor protección con ejemplos de un centro sociosanitario')

export const alerta = svg(W, H,
  bg(W, H, '#fff4de', '#ffffff') +
  icon.warn(110, 150, 110, C.amber) + text(110, 235, 'Algo no\ncuadra', { size: 20, weight: 800, anchor: 'middle' }) +
  phone(245, 28, 150, 270, rect(0, 0, 134, 242, '#eaf7f5', { r: 0 }) + text(67, 80, 'Línea de Ayuda', { size: 15, anchor: 'middle', weight: 700, fill: C.mut }) + text(67, 140, '017', { size: 58, weight: 800, anchor: 'middle', fill: C.teal }) + text(67, 175, 'gratuita y\nconfidencial', { size: 14, anchor: 'middle', fill: C.ink, weight: 600 }) + icon.phoneCall(67, 214, 40, C.green)) +
  pill(450, 80, '1 · Para', C.red) + pill(450, 140, '2 · Anota', C.blue) + pill(450, 200, '3 · Avisa', C.teal) +
  caption(W, H, 'Detecta, para, avisa'),
  'Un móvil con el número 017, un aviso de alerta y tres pasos: para, anota, avisa')

export const escudo = svg(W, H,
  bg(W, H, '#e3f6f3', '#eef3ff') +
  [[70, 70, 14, C.amber], [560, 60, 12, C.red], [120, 250, 10, C.blue], [520, 250, 16, C.violet], [330, 40, 8, C.teal], [250, 300, 9, C.amber], [420, 305, 11, C.red], [40, 160, 9, C.teal], [600, 160, 10, C.blue]].map(([x, y, r, c]) => circle(x, y, r, c, { op: 0.8 })).join('') +
  icon.shield(320, 160, 230, C.teal) + text(320, 322, 'Repaso y reto', { size: 24, weight: 800, anchor: 'middle', fill: C.ink }),
  'Un gran escudo con una marca de verificación rodeado de confeti')

const px = (x, y, w, h) => ({ x: +(x / 6.4).toFixed(1), y: +(y / 3.6).toFixed(1), w: +(w / 6.4).toFixed(1), h: +(h / 3.6).toFixed(1) })

export const escena = svg(W, H,
  bg(W, H, '#eef4fb', '#ffffff') + rect(0, 250, W, 110, '#e8d9bd', { r: 0 }) + rect(0, 246, W, 8, '#cdb892', { r: 0 }) +
  rect(470, 30, 130, 90, '#cfe6f7', { stroke: '#a9c4de', r: 8 }) + line(535, 30, 535, 120, '#a9c4de', 3) + line(470, 75, 600, 75, '#a9c4de', 3) +
  text(30, 52, 'ENFERMERÍA · PLANTA 2', { size: 15, weight: 800, fill: C.mut }) +
  // estantería con carpeta de pautas en papel
  rect(40, 128, 150, 6, '#a98c5a', { r: 2 }) + rect(62, 74, 106, 54, C.blue, { r: 6 }) + text(115, 106, 'Pautas en papel', { size: 14, fill: '#fff', anchor: 'middle', weight: 700 }) +
  // monitor con sesión abierta y silla vacía
  rect(255, 90, 160, 104, C.ink, { r: 8 }) + rect(263, 98, 144, 88, '#fff', { r: 4 }) + rect(263, 98, 144, 20, C.sky, { r: 4 }) + text(272, 113, 'Historias · sesión abierta', { size: 11, weight: 700, fill: C.blue }) +
  line(274, 134, 396, 134, C.line, 6) + line(274, 152, 380, 152, C.line, 6) + line(274, 170, 340, 170, C.line, 6) +
  rect(325, 194, 20, 28, '#9aa7ba', { r: 3 }) + rect(298, 222, 74, 10, '#9aa7ba', { r: 5 }) +
  rect(428, 200, 40, 26, '#b4c2d6', { r: 6 }) + rect(428, 228, 40, 8, '#b4c2d6', { r: 4 }) + text(448, 252, '(nadie)', { size: 11, fill: C.mut, anchor: 'middle', weight: 600 }) +
  // tablet con post-it
  tablet(48, 150, 150, 98, text(10, 22, 'Pautas · Planta 2', { size: 12, weight: 800, fill: C.blue }) + line(10, 40, 120, 40, C.line, 6) + line(10, 58, 100, 58, C.line, 6)) +
  rect(160, 212, 54, 46, '#ffe066', { r: 3, stroke: '#e0b92a', sw: 1 }) + text(187, 231, 'clave:', { size: 11, anchor: 'middle', weight: 700 }) + text(187, 247, '1234', { size: 14, anchor: 'middle', weight: 800 }) +
  // papeles en el mostrador
  rect(476, 214, 64, 40, '#fff', { stroke: C.line, r: 3 }) + rect(486, 208, 64, 40, '#fff', { stroke: C.line, r: 3 }) + line(494, 222, 540, 222, C.mut, 3) + line(494, 232, 534, 232, C.mut, 3) + line(494, 242, 520, 242, C.mut, 3) +
  // usb
  icon.usb(292, 285, 62, C.ink) + text(292, 335, 'USB suelto', { size: 12, anchor: 'middle', weight: 700, fill: C.mut }) +
  // móvil personal con foto
  phone(566, 172, 56, 96, rect(0, 6, 40, 40, '#cfe6f7', { r: 4 }) + icon.bed(20, 28, 26, C.teal) + line(4, 60, 36, 60, C.line, 4), { body: '#7c5cd6' }) +
  // destructora
  rect(22, 268, 82, 62, '#6b7a90', { r: 10 }) + rect(34, 276, 58, 8, C.ink, { r: 4 }) + text(63, 312, 'destructora', { size: 12, fill: '#fff', anchor: 'middle', weight: 700 }),
  'Sala de enfermería con una tablet con una clave pegada, un ordenador con la sesión abierta y sin nadie, papeles sobre el mostrador, un USB suelto, un móvil personal con una foto, una destructora de papel y una carpeta de pautas en papel')

export const escenaSpots = [
  { ...px(40, 140, 190, 130), label: 'Tablet con la clave pegada en un post-it', correct: true, feedback: '¡Fallo encontrado! La clave es personal y secreta: pegada en un post-it, la ve cualquiera.' },
  { ...px(250, 84, 175, 156), label: 'Ordenador con la sesión abierta y sin nadie', correct: true, feedback: '¡Fallo encontrado! Si te levantas, bloquea la pantalla (Windows + L): las historias quedan a la vista.' },
  { ...px(462, 196, 100, 66), label: 'Papeles con datos sobre el mostrador', correct: true, feedback: '¡Fallo encontrado! El papel con datos no se deja a la vista ni va a la papelera: va a la destructora.' },
  { ...px(250, 250, 90, 70), label: 'USB sin dueño sobre el mostrador', correct: true, feedback: '¡Fallo encontrado! Un USB que no conoces no se enchufa: puede traer un virus. Avisa.' },
  { ...px(552, 160, 84, 120), label: 'Móvil personal con una foto de una residente', correct: true, feedback: '¡Fallo encontrado! Las fotos de residentes no van en el móvil personal: sigue el protocolo del centro.' },
  { ...px(14, 260, 100, 80), label: 'Destructora de papel', correct: false, feedback: 'Esto está bien: la destructora es el sitio del papel con datos.' },
  { ...px(48, 62, 130, 80), label: 'Carpeta de pautas en papel en su sitio', correct: false, feedback: 'Esto está bien: es el plan B por si la tablet falla (como pasó en el turno de noche).' },
]
