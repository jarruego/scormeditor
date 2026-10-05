/**
 * Ilustraciones SVG del curso 6 (Inteligencia artificial). Todas con svgkit, 640 px de ancho.
 * Se devuelven como strings SVG para `c.asset('assets/img/c6_*.svg', ...)`.
 */
import { svg, bg, person, phone, laptop, icon, bubble, pill, rect, circle, line, path, g, text, caption, C } from './svgkit.mjs'

const P = '#7a3fd1' // primario del curso
const LAV = '#efe6fb'

/** Barras de «onda de audio» deterministas. */
function wave(x, y, n, gap, w, maxh, color, seed = 0) {
  let out = ''
  for (let i = 0; i < n; i++) {
    const h = Math.round(maxh * (0.22 + 0.78 * Math.abs(Math.sin(i * 0.95 + seed))))
    out += rect(x + i * gap, y - h / 2, w, h, color, { r: w / 2 })
  }
  return out
}
const arrow = (x1, y, x2, color = C.ink) => line(x1, y, x2, y, color, 5) + path(`M${x2 - 12} ${y - 11} L${x2 + 3} ${y} L${x2 - 12} ${y + 11}`, 'none', { stroke: color, sw: 5 })

export const portada = svg(640, 360,
  bg(640, 360, LAV) +
  icon.robot(150, 175, 190, P) +
  bubble(290, 40, 320, 84, 'Puedo imitar una voz,\nuna cara o un correo.', { tail: 'l', size: 17 }) +
  wave(290, 232, 11, 17, 9, 70, C.teal, 1) +
  person(520, 235, { scale: 0.8, hairStyle: 'bun', shirt: C.blue }) +
  pill(505, 160, 'IA', C.red) +
  caption(640, 360, 'Las mismas estafas de siempre, pero más creíbles', '#4b2a8a'),
  'Un robot de inteligencia artificial que imita voces, caras y correos')

export const l1 = svg(640, 360,
  bg(640, 360, LAV) +
  icon.robot(160, 185, 200, P) +
  bubble(300, 34, 310, 62, 'Hola, ¿en qué te ayudo?', { tail: 'l', size: 18 }) +
  pill(300, 130, 'escribe', C.teal) + pill(397, 130, 'habla', C.blue) + pill(482, 130, 'dibuja', P) +
  pill(300, 180, 'resume textos', C.blue) + pill(451, 180, 'imita voces', C.red) +
  pill(300, 230, 'traduce', P) + pill(397, 230, 'inventa cosas', C.red) +
  caption(640, 360, 'Una IA generativa crea textos, voces e imágenes', '#4b2a8a'),
  'Un robot amable que escribe, habla, dibuja, traduce, imita voces y a veces inventa cosas')

// Teclado predictivo
let keys = ''
for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) keys += rect(8 + k * 29, 150 + r * 36, 25, 30, '#dfe6f1', { r: 6 })
export const predictivo = svg(640, 360,
  bg(640, 360, '#e8f0ff') +
  phone(50, 14, 200, 292,
    rect(0, 0, 184, 264, '#f2f6fb', { r: 0 }) +
    text(12, 24, 'Mensaje nuevo', { size: 13, fill: C.mut }) +
    rect(8, 36, 168, 42, '#fff', { r: 10, stroke: C.line }) +
    text(18, 64, 'Buenos', { size: 20 }) +
    rect(8, 96, 56, 36, '#fff', { r: 8, stroke: C.blue }) + text(36, 120, 'días', { size: 15, anchor: 'middle', fill: C.blue, weight: 800 }) +
    rect(68, 96, 56, 36, '#fff', { r: 8, stroke: C.line }) + text(96, 120, 'tardes', { size: 15, anchor: 'middle' }) +
    rect(128, 96, 48, 36, '#fff', { r: 8, stroke: C.line }) + text(152, 120, 'noches', { size: 13, anchor: 'middle' }) +
    keys, { screen: '#fff' }) +
  text(290, 52, 'Elige la palabra\nmás probable', { size: 24, weight: 800 }) +
  text(290, 140, 'días', { size: 18 }) + rect(370, 124, 250, 22, C.teal, { r: 11 }) +
  text(290, 182, 'tardes', { size: 18 }) + rect(370, 166, 90, 22, C.amber, { r: 11 }) +
  text(290, 224, 'noches', { size: 18 }) + rect(370, 208, 40, 22, C.mut, { r: 11 }) +
  text(290, 276, 'No comprueba si es verdad', { size: 20, weight: 800, fill: P }) +
  caption(640, 360, 'Un predictivo gigante: por eso a veces se inventa cosas', '#4b2a8a'),
  'Teclado de móvil que sugiere la palabra más probable, con barras de más a menos probable')

// Escena de hotspots: correo perfecto (640 x 640)
const mailRow = (y, h, fill = '#ffffff') => rect(16, y, 608, h, fill, { r: 0 })
export const correo = svg(640, 640,
  rect(0, 0, 640, 640, '#f2f6fb', { r: 20 }) +
  rect(10, 10, 620, 620, '#fff', { r: 16, stroke: C.line, sw: 3 }) +
  rect(16, 16, 608, 84, C.sky, { r: 10 }) +
  text(32, 52, 'De: Gerencia', { size: 26, weight: 800 }) +
  text(32, 84, '<gerencia@centro-vlda.es>', { size: 22, fill: C.mut }) +
  text(32, 150, 'URGENTE y confidencial: cambio de cuenta', { size: 23, weight: 800 }) +
  line(24, 180, 616, 180, C.line, 2) +
  text(32, 216, 'Hola, Marta: te escribo por el albarán', { size: 22 }) +
  text(32, 244, 'de la lavandería de la planta 2.', { size: 22 }) +
  line(24, 260, 616, 260, C.line, 2) +
  text(32, 296, 'Hemos cambiado de banco. Paga ya a:', { size: 22 }) +
  rect(32, 308, 420, 36, '#f2f6fb', { r: 8, stroke: C.line }) +
  text(46, 334, 'ES00 0000 0000 0000 0000 0000', { size: 21, weight: 800 }) +
  line(24, 350, 616, 350, C.line, 2) +
  text(32, 386, 'Hazlo hoy y no se lo cuentes a nadie', { size: 22 }) +
  text(32, 414, 'hasta que cerremos el trato.', { size: 22 }) +
  rect(32, 440, 300, 50, C.blue, { r: 12 }) +
  text(182, 473, 'Ver factura adjunta', { size: 21, fill: '#fff', anchor: 'middle', weight: 700 }) +
  line(24, 510, 616, 510, C.line, 2) +
  circle(70, 556, 32, P) + text(70, 566, 'RV', { size: 24, fill: '#fff', anchor: 'middle', weight: 800 }) +
  text(120, 552, 'Gerencia · Centro Vida', { size: 22, weight: 700 }) +
  text(120, 580, 'Tel. 900 000 000', { size: 18, fill: C.mut }),
  'Correo falso sin faltas de ortografía que pide cambiar la cuenta de un proveedor y pagar hoy en secreto')

export const voz = svg(640, 360,
  bg(640, 360, LAV) +
  rect(20, 24, 190, 262, '#fff', { r: 18, stroke: C.line }) +
  text(115, 54, 'Voz real', { size: 20, weight: 800, anchor: 'middle' }) +
  person(115, 126, { scale: 0.75, hairStyle: 'bun', shirt: C.blue }) +
  wave(40, 250, 12, 13.5, 8, 50, C.blue, 0.5) +
  arrow(218, 150, 246) +
  icon.robot(300, 140, 100, P) +
  text(300, 214, 'copia\nla voz', { size: 18, anchor: 'middle', weight: 700 }) +
  arrow(352, 150, 384) +
  phone(404, 20, 170, 270,
    rect(0, 0, 154, 242, '#14304f', { r: 0 }) +
    text(77, 28, 'Llamada entrante', { size: 13, fill: '#9fb3cf', anchor: 'middle' }) +
    text(77, 56, 'Hijo', { size: 22, fill: '#fff', anchor: 'middle', weight: 800 }) +
    text(77, 76, '(número nuevo)', { size: 13, fill: '#9fb3cf', anchor: 'middle' }) +
    rect(10, 92, 134, 60, '#2f6fed', { r: 12 }) +
    text(77, 118, 'Mamá, necesito\ndinero ya', { size: 15, fill: '#fff', anchor: 'middle', weight: 700 }) +
    circle(46, 200, 22, C.red) + circle(108, 200, 22, C.green)) +
  caption(640, 360, 'Suena igual. Por eso verificas por otro canal', '#4b2a8a'),
  'Una voz real se copia con IA y llega a un móvil como llamada de un hijo que pide dinero')

export const l2 = svg(640, 360,
  bg(640, 360, LAV) +
  circle(120, 150, 70, '#fff', { stroke: C.line, sw: 3 }) + icon.envelope(120, 150, 80, C.blue) +
  circle(320, 150, 70, '#fff', { stroke: C.line, sw: 3 }) + icon.mic(320, 150, 70, C.red) +
  circle(520, 150, 70, '#fff', { stroke: C.line, sw: 3 }) + icon.camera(520, 150, 80, C.ink) +
  text(120, 258, 'Texto\nperfecto', { size: 20, weight: 800, anchor: 'middle' }) +
  text(320, 258, 'Voz\nclonada', { size: 20, weight: 800, anchor: 'middle' }) +
  text(520, 258, 'Vídeo\nfalso', { size: 20, weight: 800, anchor: 'middle' }) +
  caption(640, 360, 'Tres formas de engañar con IA', '#4b2a8a'),
  'Tres iconos: un correo, un micrófono y una cámara, las tres vías de engaño con IA')

// Videollamada falsa (caso Arup)
function tile(x, y, label, fake, shirt, hair) {
  return rect(x, y, 198, 118, '#dfe8f6', { r: 8 }) +
    person(x + 99, y + 58, { scale: 0.5, shirt, hairStyle: hair }) +
    rect(x, y + 98, 198, 20, '#1b2a41cc', { r: 0 }) +
    text(x + 8, y + 113, label, { size: 12, fill: '#fff', weight: 700 }) +
    (fake ? circle(x + 178, y + 20, 14, C.red) + text(x + 178, y + 25, 'IA', { size: 12, fill: '#fff', anchor: 'middle', weight: 800 }) : circle(x + 178, y + 20, 14, C.green) + text(x + 178, y + 25, 'tú', { size: 12, fill: '#fff', anchor: 'middle', weight: 800 }))
}
export const videollamada = svg(640, 360,
  bg(640, 360, '#e8f0ff') +
  laptop(110, 18, 420, 262,
    tile(0, 0, 'Director financiero', true, C.ink, 'short') +
    tile(206, 0, 'Compañera', true, C.teal, 'long') +
    tile(0, 124, 'Compañero', true, '#c2410c', 'short') +
    tile(206, 124, 'Tú', false, C.blue, 'bun'), { screen: '#101c2e' }) +
  caption(640, 360, 'Todos parecen compañeros. Salvo tú, eran falsos.'),
  'Videollamada de cuatro personas en la que tres imágenes son falsas, generadas por IA')

// Portada L3: media cara «de malla»
let mesh = ''
for (let i = 0; i <= 8; i++) mesh += line(250 + i * 8, 80, 250 + i * 8, 290, C.teal, 1.5)
for (let j = 0; j <= 10; j++) mesh += line(250, 80 + j * 21, 314, 80 + j * 21, C.teal, 1.5)
export const l3 = svg(640, 360,
  bg(640, 360, '#e8f0ff') +
  person(320, 170, { scale: 1.4, hairStyle: 'short', shirt: C.ink }) +
  `<defs><clipPath id="hf"><rect x="200" y="60" width="120" height="260"/></clipPath><clipPath id="shp"><ellipse cx="320" cy="159" rx="40" ry="46"/><path d="M256 310 Q256 240 320 240 Q384 240 384 310 Z"/><rect x="307" y="198" width="26" height="46"/></clipPath></defs><g clip-path="url(#hf)"><g clip-path="url(#shp)" opacity=".7">${mesh}</g></g>` +
  line(320, 70, 320, 300, '#fff', 4, { dash: '8 8' }) +
  pill(40, 120, 'generada por IA', P) + line(190, 138, 250, 150, P, 3) +
  pill(450, 120, 'persona real', C.green) + line(448, 138, 392, 150, C.green, 3) +
  caption(640, 360, 'Deepfake: la cara y la voz se pueden fabricar'),
  'Una cara dividida: una mitad real y otra generada por IA con una malla')

export const l4 = svg(640, 360,
  bg(640, 360, '#e3f6f3') +
  icon.phoneCall(100, 140, 110, C.red) + text(100, 232, 'Cuelga', { size: 21, weight: 800, anchor: 'middle' }) +
  arrow(168, 140, 210) +
  icon.phoneCall(320, 140, 110, C.green) + text(320, 232, 'Llama tú al\nnúmero de siempre', { size: 20, weight: 800, anchor: 'middle' }) +
  arrow(392, 140, 440) +
  icon.shield(540, 140, 110, C.teal) + text(540, 232, 'Palabra clave', { size: 21, weight: 800, anchor: 'middle' }) +
  caption(640, 360, 'Defensas sencillas que funcionan siempre', '#0b6b64'),
  'Un teléfono que se cuelga, otro que se vuelve a llamar y un escudo: las defensas básicas')

// Parar · Pensar · Verificar
const oct = (cx, cy, r) => {
  const pts = []
  for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; pts.push(`${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`) }
  return `M${pts.join(' L')} Z`
}
export const ppv = svg(640, 360,
  bg(640, 360, '#e8f0ff') +
  path(oct(110, 110, 62), C.red) + text(110, 120, 'PARA', { size: 26, fill: '#fff', anchor: 'middle', weight: 900 }) +
  circle(320, 110, 60, C.amber) + text(320, 135, '?', { size: 76, fill: '#fff', anchor: 'middle', weight: 900 }) +
  circle(530, 110, 60, C.teal) + icon.phoneCall(530, 110, 84, '#fff') +
  text(110, 218, '1 · Para', { size: 22, weight: 800, anchor: 'middle' }) + text(110, 246, 'Si hay prisa, secreto\no miedo', { size: 16, anchor: 'middle', fill: C.mut }) +
  text(320, 218, '2 · Piensa', { size: 22, weight: 800, anchor: 'middle' }) + text(320, 246, '¿Piden dinero, claves\no datos?', { size: 16, anchor: 'middle', fill: C.mut }) +
  text(530, 218, '3 · Verifica', { size: 22, weight: 800, anchor: 'middle' }) + text(530, 246, 'Por otro canal\nque ya conocías', { size: 16, anchor: 'middle', fill: C.mut }) +
  caption(640, 360, 'Parar · Pensar · Verificar'),
  'Tres pasos: una señal de stop, un signo de interrogación y un teléfono: parar, pensar y verificar')

export const nube = svg(640, 360,
  bg(640, 360, LAV) +
  phone(36, 50, 130, 236,
    rect(0, 0, 114, 208, '#f2f6fb', { r: 0 }) +
    rect(8, 30, 98, 56, '#d4ecff', { r: 10 }) +
    text(57, 54, 'Resume el informe\nde un residente', { size: 11.5, anchor: 'middle', weight: 600 }) +
    rect(8, 100, 98, 36, '#fff', { r: 10, stroke: C.line }) + text(57, 123, 'Enviar', { size: 14, anchor: 'middle', weight: 800, fill: C.blue })) +
  arrow(174, 156, 204) +
  icon.cloud(310, 150, 150, '#fff', P) +
  text(310, 152, 'Empresa\nexterna', { size: 19, anchor: 'middle', weight: 800 }) +
  arrow(414, 156, 440) +
  rect(446, 50, 176, 50, '#fff', { r: 12, stroke: C.line }) + text(534, 82, 'Se envía fuera', { size: 17, anchor: 'middle', weight: 700 }) +
  rect(446, 112, 176, 50, '#fff', { r: 12, stroke: C.line }) + text(534, 144, 'Puede guardarse', { size: 17, anchor: 'middle', weight: 700 }) +
  rect(446, 174, 176, 64, '#fff', { r: 12, stroke: C.line }) + text(534, 202, 'Puede usarse para\nentrenar la IA', { size: 16, anchor: 'middle', weight: 700 }) +
  caption(640, 360, 'Lo que escribes sale de tu pantalla', '#4b2a8a'),
  'Un móvil envía un informe a una nube de empresa externa: se envía fuera, puede guardarse y puede usarse para entrenar')

export const semaforo = svg(640, 360,
  bg(640, 360, '#f2f6fb') +
  rect(46, 22, 120, 280, C.ink, { r: 30 }) +
  circle(106, 84, 30, C.red) + circle(106, 162, 30, C.amber) + circle(106, 240, 30, C.green) +
  rect(190, 34, 430, 78, C.rose, { r: 14 }) + text(208, 66, 'ROJO · Nunca', { size: 21, weight: 800, fill: '#a4262c' }) + text(208, 96, 'Nombres, salud, claves, documentos', { size: 17 }) +
  rect(190, 124, 430, 78, C.sand, { r: 14 }) + text(208, 156, 'ÁMBAR · Con cuidado', { size: 21, weight: 800, fill: '#8a5200' }) + text(208, 186, 'Sin datos, con permiso y revisando', { size: 17 }) +
  rect(190, 214, 430, 78, C.mint, { r: 14 }) + text(208, 246, 'VERDE · Sí', { size: 21, weight: 800, fill: '#146c43' }) + text(208, 276, 'Ideas y dudas generales, sin datos', { size: 17 }) +
  caption(640, 360, 'Antes de pegar nada en una IA, mira el semáforo'),
  'Semáforo con rojo (nunca), ámbar (con cuidado) y verde (sí) para decidir qué datos se pueden pegar en una IA')

let stars = ''
for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; stars += circle(170 + 68 * Math.cos(a), 160 + 68 * Math.sin(a), 7, C.amber) }
export const l6 = svg(640, 360,
  bg(640, 360, LAV) +
  circle(170, 160, 104, C.blue) + stars + text(170, 182, 'IA', { size: 56, fill: '#fff', anchor: 'middle', weight: 900 }) +
  rect(320, 40, 300, 72, '#fff', { r: 14, stroke: C.line }) + text(338, 70, 'Europa', { size: 20, weight: 800, fill: P }) + text(338, 96, 'Reglamento de IA, por fases', { size: 16, fill: C.mut }) +
  rect(320, 124, 300, 72, '#fff', { r: 14, stroke: C.line }) + text(338, 154, 'España', { size: 20, weight: 800, fill: P }) + text(338, 180, 'AEPD e INCIBE te orientan', { size: 16, fill: C.mut }) +
  rect(320, 208, 300, 72, '#fff', { r: 14, stroke: C.line }) + text(338, 238, 'Tu centro', { size: 20, weight: 800, fill: P }) + text(338, 264, 'Normas internas de uso', { size: 16, fill: C.mut }) +
  caption(640, 360, 'Reglas para usar la IA con garantías', '#4b2a8a'),
  'Un círculo de estrellas europeas con las letras IA y tres niveles de reglas: Europa, España y tu centro')
