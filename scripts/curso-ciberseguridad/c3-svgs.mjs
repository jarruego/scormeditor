/**
 * Ilustraciones SVG del curso 3 (hechas con svgkit). `buildSvgs()` devuelve { 'assets/img/c3_x.svg': '<svg…>' }
 * y `spots` con las zonas (en %) del correo falso para el hotspots.
 * Todos los nombres, dominios y números son ficticios (ejemplos didácticos).
 */
import { svg, bg, person, phone, icon, bubble, pill, rect, circle, line, path, g, text, caption, C } from './svgkit.mjs'

const P = '#d9482b' // primario del curso
const A = '#f4c910' // acento
const W = 640
const H = 360
const frame = (body, title, c1 = '#fff1ea') => svg(W, H, bg(W, H, c1, '#ffffff') + body, title)

/** Círculo numerado (1-4) para marcar señales. */
const num = (cx, cy, n, fill = P) => circle(cx, cy, 13, fill, { stroke: '#fff', sw: 2 }) + text(cx, cy + 5, String(n), { size: 15, fill: '#fff', anchor: 'middle', weight: 800 })
const arrowR = (x, y, c = C.mut) => line(x, y, x + 26, y, c, 4) + path(`M${x + 34} ${y} l-12 -9 v18 z`, c)

function qrCells(x, y, n, cell, seed, fill = C.ink) {
  let s = seed
  const r = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  let out = ''
  for (let i = 0; i < n; i++) for (let k = 0; k < n; k++) {
    const eye = (i < 3 && k < 3) || (i < 3 && k >= n - 3) || (i >= n - 3 && k < 3)
    if (eye) continue
    if (r() > 0.5) out += `<rect x="${x + k * cell}" y="${y + i * cell}" width="${cell}" height="${cell}" fill="${fill}"/>`
  }
  const eyeAt = (ex, ey) => `<rect x="${ex}" y="${ey}" width="${cell * 3}" height="${cell * 3}" fill="${fill}"/><rect x="${ex + cell * 0.5}" y="${ey + cell * 0.5}" width="${cell * 2}" height="${cell * 2}" fill="#fff"/><rect x="${ex + cell}" y="${ey + cell}" width="${cell}" height="${cell}" fill="${fill}"/>`
  return out + eyeAt(x, y) + eyeAt(x + (n - 3) * cell, y) + eyeAt(x, y + (n - 3) * cell)
}

export function buildSvgs() {
  const a = {}

  // 1 · Portada
  a['assets/img/c3_portada.svg'] = frame(
    text(40, 118, 'No piques', { size: 52, weight: 800 }) + text(40, 176, 'el anzuelo', { size: 52, weight: 800, fill: P }) +
    text(40, 226, 'Correo, mensajes y llamadas', { size: 21, fill: C.mut, weight: 600 }) +
    pill(40, 258, 'PARA · MIRA · VERIFICA · AVISA', P, { size: 15 }) +
    line(520, 0, 520, 150, C.ink, 4) + path('M520 150 V196 a30 30 0 0 1 -60 0 v-16', 'none', { stroke: C.ink, sw: 6 }) + path('M460 176 l-11 15 h22 z', C.ink) +
    icon.envelope(470, 262, 84, P) + icon.warn(575, 88, 60, A) + circle(572, 300, 22, '#fff', { stroke: C.line }) + icon.shield(572, 300, 34, C.teal),
    'Un anzuelo con un sobre como cebo: el correo falso'
  )

  // 2 · La idea: no fuerzan la puerta
  a['assets/img/c3_anzuelo.svg'] = frame(
    rect(60, 44, 150, 252, C.sand, { r: 12, stroke: C.ink, sw: 5 }) + rect(78, 62, 114, 216, '#fff', { r: 8, stroke: C.line, sw: 3 }) + icon.lock(135, 150, 64, C.teal) + circle(180, 190, 8, C.ink) +
    person(330, 190, { shirt: C.red, hairStyle: 'short', scale: 0.95 }) +
    bubble(255, 38, 205, 74, '«Ábreme, soy de\ninformática»', { size: 17, tail: 'b' }) +
    person(560, 190, { shirt: C.teal, hairStyle: 'bun', skin: C.skin2, scale: 0.95 }) +
    bubble(480, 38, 140, 74, '¿Y si es\nde verdad…?', { size: 17, tail: 'b' }) +
    caption(W, H, 'No fuerzan la puerta: te piden que la abras'),
    'Un desconocido pide que le abran la puerta; una trabajadora duda'
  )

  // 3 · Remitente: nombre vs dirección
  a['assets/img/c3_remitente.svg'] = frame(
    phone(34, 14, 236, 298,
      text(12, 26, 'Bandeja de entrada', { size: 14, fill: C.mut, weight: 700 }) + line(0, 40, 220, 40, C.line, 2) +
      rect(0, 48, 220, 78, C.rose, { r: 0 }) + circle(30, 86, 18, P) + text(30, 92, 'E', { size: 18, fill: '#fff', anchor: 'middle', weight: 800 }) +
      text(58, 80, 'Directora Elena Ruiz', { size: 15, weight: 800 }) + text(58, 100, '(sin asunto)', { size: 13, fill: C.mut }) +
      text(12, 150, 'Marta, estoy en una reunión\ny no puedo hablar. Necesito\nque hagas una transferencia…', { size: 13, fill: C.mut, lh: 17 }) +
      pill(12, 220, 'Toca el nombre ›', C.blue, { size: 13 })),
    '') .replace('</svg>', '') +
    rect(310, 44, 306, 112, '#fff', { r: 16, stroke: C.line, sw: 2 }) + text(326, 74, 'Lo que ves: el NOMBRE', { size: 17, weight: 800, fill: C.blue }) +
    text(326, 100, 'Lo escribe quien envía.\nCualquiera puede poner\n«Directora».', { size: 16, fill: C.ink, weight: 500, lh: 21 }) +
    rect(310, 176, 306, 122, '#fff', { r: 16, stroke: P, sw: 3 }) + text(326, 206, 'Lo que cuenta: la DIRECCIÓN', { size: 17, weight: 800, fill: P }) +
    text(326, 234, 'direccion.centro@gmail.com', { size: 15, weight: 700, fill: C.red }) +
    text(326, 262, 'Una cuenta personal, no la\ndel centro. Aquí está el engaño.', { size: 16, fill: C.ink, weight: 500, lh: 21 }) +
    line(272, 92, 308, 92, C.mut, 3, { dash: '6 6' }) + line(272, 228, 308, 228, P, 3, { dash: '6 6' }) +
    caption(W, H, 'Toca el nombre y mira la dirección real') + '</svg>'

  // 4 · Candado
  a['assets/img/c3_candado.svg'] = frame(
    rect(40, 40, 560, 60, '#fff', { r: 14, stroke: C.green, sw: 3 }) + icon.lock(78, 70, 28, C.green) + text(106, 78, 'https://tu-banco.es', { size: 22, weight: 700 }) + pill(462, 55, 'Web real', C.green, { size: 15 }) +
    rect(40, 128, 560, 60, '#fff', { r: 14, stroke: C.red, sw: 3 }) + icon.lock(78, 158, 28, C.green) + text(106, 166, 'https://tu-banco.acceso-seguro.top', { size: 20, weight: 700 }) + pill(500, 143, 'Falsa', C.red, { size: 15 }) +
    text(320, 236, 'Las dos tienen candado', { size: 24, weight: 800, anchor: 'middle' }) +
    text(320, 270, 'El candado no garantiza que la web sea la verdadera', { size: 17, weight: 600, fill: C.mut, anchor: 'middle' }) +
    caption(W, H, 'Mira siempre el dominio, no solo el candado'),
    'Dos barras de navegador, ambas con candado: una web real y una falsa'
  )

  // 5 · SMS falso
  a['assets/img/c3_sms.svg'] = frame(
    phone(34, 14, 212, 298,
      rect(0, 0, 196, 34, C.sky, { r: 0 }) + text(98, 22, 'Correos', { size: 15, weight: 800, anchor: 'middle' }) +
      rect(8, 44, 172, 192, '#eef1f6', { r: 14 }) +
      text(16, 66, 'Correos: Su paquete\n#ES48392 no pudo\nentregarse. Confirme\nla dirección y pague\n1,29 € de tasa en:', { size: 13, lh: 17 }) +
      text(16, 160, 'https://correos-envios\n.info/pago', { size: 13, fill: C.red, weight: 800, lh: 17 }) +
      num(180, 62, 1) + num(180, 97, 2) + num(180, 130, 3) + num(180, 166, 4)),
    '') .replace('</svg>', '') +
    [['No esperabas ningún paquete', 'Si nadie te avisó, desconfía'], ['Te piden «confirmar» tus datos', 'Datos de tarjeta o dirección'], ['Pagar una cantidad pequeña', 'Es el cebo para robar la tarjeta'], ['Dominio ajeno: «.info»', 'No es el de la empresa de envíos']]
      .map(([t1, t2], i) => circle(284, 52 + i * 62, 14, P) + text(284, 57 + i * 62, String(i + 1), { size: 15, fill: '#fff', anchor: 'middle', weight: 800 }) + text(310, 50 + i * 62, t1, { size: 17, weight: 800 }) + text(310, 72 + i * 62, t2, { size: 15, fill: C.mut, weight: 500 })).join('') +
    caption(W, H, 'SMS de «paquetería»: cuatro señales') + '</svg>'

  // 6 · WhatsApp falso
  a['assets/img/c3_whatsapp.svg'] = frame(
    phone(34, 14, 212, 298,
      rect(0, 0, 196, 46, C.teal, { r: 0 }) + circle(22, 23, 14, '#ffffff66') + text(46, 20, 'Número nuevo', { size: 14, fill: '#fff', weight: 800 }) + text(46, 37, '+34 6xx xxx xxx', { size: 12, fill: '#fff', weight: 500 }) +
      rect(0, 46, 196, 230, '#efe7dd', { r: 0 }) +
      rect(8, 56, 150, 52, '#fff', { r: 12 }) + text(16, 76, 'Hola Marta, soy Elena,\nhe cambiado de móvil.', { size: 13, lh: 17 }) +
      rect(8, 116, 172, 98, '#fff', { r: 12 }) + text(16, 136, 'Envíame el código de 6\ncifras que te llegue por\nSMS. ¡Rápido, porfa,\nque llego tarde!', { size: 13, lh: 17 }) +
      num(176, 36, 1) + num(172, 90, 2) + num(172, 134, 3) + num(172, 200, 4)),
    '') .replace('</svg>', '') +
    [['Número que no tienes guardado', 'Aunque lleve la foto de tu jefa'], ['«He cambiado de móvil»', 'La excusa para escribirte'], ['Pide el código del SMS', 'Es la llave de tu WhatsApp'], ['Prisa: «rápido, porfa»', 'Para que no pienses']]
      .map(([t1, t2], i) => circle(284, 52 + i * 62, 14, P) + text(284, 57 + i * 62, String(i + 1), { size: 15, fill: '#fff', anchor: 'middle', weight: 800 }) + text(310, 50 + i * 62, t1, { size: 17, weight: 800 }) + text(310, 72 + i * 62, t2, { size: 15, fill: C.mut, weight: 500 })).join('') +
    caption(W, H, 'El código de WhatsApp no se da a nadie') + '</svg>'

  // 7 · QR pegatina
  a['assets/img/c3_qr.svg'] = frame(
    rect(60, 22, 250, 280, '#fff', { r: 14, stroke: C.line, sw: 3 }) + text(185, 56, 'WIFI INVITADOS', { size: 20, weight: 800, anchor: 'middle' }) +
    qrCells(105, 76, 9, 18, 7) +
    g(0, 0, rect(118, 100, 120, 120, '#fff', { r: 8, stroke: C.red, sw: 4 }) + qrCells(130, 112, 8, 12, 99, C.red) + pill(120, 226, 'QR falso pegado', C.red, { size: 14 })) +
    text(340, 66, 'Un QR puede ser una pegatina', { size: 19, weight: 800, fill: P }) + text(340, 90, 'puesta encima del original.', { size: 19, weight: 800, fill: P }) +
    text(340, 134, '1. ¿Se nota una pegatina encima?', { size: 17, weight: 600 }) +
    text(340, 170, '2. Mira la dirección que te\n    muestra el móvil antes de abrir', { size: 17, weight: 600, lh: 22 }) +
    text(340, 224, '3. ¿Llegó en un correo que no\n    esperabas? No lo escanees', { size: 17, weight: 600, lh: 22 }) +
    caption(W, H, 'Código QR: primero mira, después escanea'),
    'Un cartel con un código QR y una pegatina falsa pegada encima'
  )

  // 8 · Llamada soporte
  a['assets/img/c3_llamada.svg'] = frame(
    phone(36, 30, 130, 270,
      rect(0, 0, 114, 242, '#14304f', { r: 0 }) + circle(57, 60, 28, '#223a5a') + text(57, 68, '🎧', { size: 26, anchor: 'middle', weight: 400 }) +
      text(57, 118, 'Soporte técnico', { size: 13, fill: '#fff', anchor: 'middle', weight: 700 }) + text(57, 136, 'Llamada entrante', { size: 12, fill: '#9fb3cf', anchor: 'middle', weight: 500 }) +
      circle(30, 200, 20, C.red) + circle(84, 200, 20, C.green)) +
    bubble(200, 26, 410, 66, 'Soy del soporte técnico de Microsoft.\nSu ordenador está infectado.', { size: 18, stroke: C.red }) +
    bubble(200, 110, 410, 66, 'Instale esta aplicación de control remoto\ny dígame el código que le aparece.', { size: 18, stroke: C.red }) +
    pill(190, 214, 'No la pediste', P, { size: 14 }) + pill(334, 214, 'Miedo', P, { size: 14 }) + pill(414, 214, 'Control remoto', P, { size: 14 }) + pill(190, 256, 'Prisa', P, { size: 14 }) + pill(274, 256, 'Pide un código', P, { size: 14 }) +
    caption(W, H, 'Llamada falsa de «soporte técnico»'),
    'Un móvil recibe una llamada de un falso soporte técnico que pide instalar una app remota'
  )

  // 9 · Fraude del jefe
  a['assets/img/c3_ceo.svg'] = frame(
    rect(24, 16, 592, 288, '#fff', { r: 16, stroke: C.line, sw: 3 }) + rect(24, 16, 592, 62, C.rose, { r: 16 }) + rect(24, 50, 592, 28, C.rose, { r: 0 }) +
    text(44, 42, 'De: Directora Elena Ruiz <direccion.centro@gmail.com>', { size: 15, weight: 700, fill: C.red }) + text(44, 66, 'Asunto: (sin asunto)', { size: 15, fill: C.mut }) +
    text(44, 112, 'Marta, estoy en una reunión\ny no puedo hablar. Necesito que\nhagas una transferencia de\n4.800 € ahora mismo. Es\nconfidencial: no lo comentes.\nTe paso el IBAN por aquí.', { size: 16, lh: 25, weight: 500 }) +
    [['Cuenta personal (gmail)', 100], ['«No puedo hablar»', 148], ['Urgencia: «ahora mismo»', 196], ['Secreto: «no lo comentes»', 244]]
      .map(([t, y]) => path(`M338 ${y + 16} l14 -10 v20 z`, P) + pill(352, y, t, P, { size: 14 })).join('') +
    caption(W, H, 'Fraude del jefe: prisa + secreto + canal raro'),
    'Correo falso de la directora desde una cuenta personal que pide una transferencia urgente y secreta'
  )

  // 10 · Cambio de IBAN
  const box = (x, label, ic, stroke = C.line) => rect(x, 40, 136, 116, '#fff', { r: 16, stroke, sw: 3 }) + ic + text(x + 68, 146, label, { size: 15, weight: 800, anchor: 'middle' })
  const cap4 = (x, n, t) => circle(x + 14, 196, 14, P) + text(x + 14, 201, String(n), { size: 15, fill: '#fff', anchor: 'middle', weight: 800 }) + text(x + 36, 201, t.split('\n')[0], { size: 14, weight: 700 }) + text(x + 4, 226, t.split('\n').slice(1).join('\n'), { size: 14, weight: 500, fill: C.mut, lh: 18 })
  a['assets/img/c3_iban.svg'] = frame(
    box(14, 'Proveedor real', icon.doc(82, 88, 52, C.blue)) + box(168, 'Correo falso', icon.envelope(236, 88, 60, C.red), C.red) + box(322, 'Administración', icon.key(390, 88, 52, C.amber)) + box(476, 'Cuenta ajena', icon.warn(544, 88, 56, C.red), C.red) +
    arrowR(146, 98, P) + arrowR(300, 98, P) + arrowR(454, 98, P) +
    cap4(14, 1, 'Se hacen pasar\npor tu proveedor.') + cap4(168, 2, 'Piden cambiar\nel IBAN por correo.') + cap4(322, 3, 'Lo cambian y\npagan la factura.') + cap4(476, 4, 'El proveedor\nreal nunca\ncobra.') +
    caption(W, H, 'Cambio de IBAN por correo: se verifica llamando'),
    'Cuatro pasos del fraude del cambio de cuenta bancaria del proveedor'
  )

  // 11 · Correo falso (escena para hotspots) 640x400
  const R = {
    from: [16, 50, 608, 40], asunto: [16, 96, 608, 36], saludo: [16, 140, 608, 28], intro: [16, 172, 608, 28], plazo: [16, 204, 608, 36], enlace: [16, 246, 608, 70], adj: [16, 322, 300, 36], firma: [16, 366, 608, 28],
  }
  const [bx, by] = [16, 252]
  a['assets/img/c3_correo_falso.svg'] = svg(640, 400,
    rect(0, 0, 640, 400, '#fff', { r: 18, stroke: C.line, sw: 3 }) + rect(0, 0, 640, 40, C.sky, { r: 18 }) + rect(0, 22, 640, 18, C.sky, { r: 0 }) + text(16, 26, '✉  Bandeja de entrada', { size: 15, weight: 700, fill: C.mut }) +
    text(16, 76, 'De: Mutua Salud Laboral <avisos@mutua-saludlaboral-gestion.com>', { size: 14, weight: 700 }) +
    text(16, 120, 'URGENTE: Su baja será anulada en 24 h', { size: 18, weight: 800 }) +
    text(16, 160, 'Estimado trabajador:', { size: 16 }) +
    text(16, 192, 'Hemos detectado un error en los datos de su parte de baja.', { size: 15, weight: 500, fill: C.mut }) +
    text(16, 228, 'Si no lo corrige en 24 horas su prestación quedará suspendida.', { size: 15, weight: 700 }) +
    rect(bx, by, 250, 38, C.blue, { r: 10 }) + text(bx + 125, by + 25, 'Actualizar datos y DNI', { size: 16, fill: '#fff', anchor: 'middle', weight: 700 }) +
    text(16, 308, 'mutua-saludlaboral-gestion.com/verifica', { size: 13, fill: C.blue, weight: 500 }) +
    rect(16, 324, 250, 34, C.sand, { r: 8, stroke: C.amber, sw: 2 }) + text(30, 346, '📎 Formulario_baja.zip', { size: 14, weight: 700 }) +
    text(16, 386, 'Atentamente, Departamento de Prestaciones', { size: 13, fill: C.mut, weight: 500 }),
    'Un correo falso de una mutua con varias señales de alarma'
  )
  const pc = ([x, y, w, h]) => ({ x: +(x / 640 * 100).toFixed(1), y: +(y / 400 * 100).toFixed(1), w: +(w / 640 * 100).toFixed(1), h: +(h / 400 * 100).toFixed(1) })
  const spots = [
    { ...pc(R.from), label: 'Dirección del remitente', correct: true, feedback: 'La dirección no es la de la mutua que conoces: el dominio «mutua-saludlaboral-gestion.com» es un disfraz.' },
    { ...pc(R.asunto), label: 'Asunto con prisa', correct: true, feedback: 'Mayúsculas, «URGENTE» y un plazo de 24 horas: quieren que actúes sin pensar.' },
    { ...pc(R.saludo), label: 'Saludo genérico', correct: true, feedback: '«Estimado trabajador» sirve para cualquiera. Un aviso real suele llamarte por tu nombre.' },
    { ...pc(R.plazo), label: 'Amenaza con plazo', correct: true, feedback: 'Amenaza con suspender tu prestación en 24 horas: miedo a perder algo.' },
    { ...pc(R.enlace), label: 'Botón y enlace que piden el DNI', correct: true, feedback: 'Pide tus datos y el DNI en un enlace. Ninguna entidad seria te los pide así: entra tú por su web o app.' },
    { ...pc(R.adj), label: 'Adjunto comprimido', correct: true, feedback: 'Un «.zip» inesperado es de riesgo: puede esconder un programa malicioso.' },
    { ...pc(R.intro), label: 'Primera frase', correct: false, feedback: 'Esta frase sola no delata nada; fíjate en lo que te piden y en quién lo envía.' },
    { ...pc(R.firma), label: 'Firma', correct: false, feedback: 'Una firma la puede copiar cualquiera: no demuestra nada, ni a favor ni en contra.' },
  ]

  // 12 · Para · Mira · Verifica · Avisa
  const card = (x, color, ic, title, body) => rect(x, 30, 146, 268, '#fff', { r: 18, stroke: color, sw: 4 }) + rect(x, 30, 146, 66, color, { r: 18 }) + rect(x, 72, 146, 24, color, { r: 0 }) + text(x + 73, 76, title, { size: 22, fill: '#fff', anchor: 'middle', weight: 800 }) + ic + text(x + 73, 214, body, { size: 15, anchor: 'middle', weight: 600, lh: 20 })
  const stop = (cx, cy) => g(cx, cy, `<path d="M-14 -34 h28 l20 20 v28 l-20 20 h-28 l-20 -20 v-28 z" fill="${C.red}"/><text x="0" y="6" font-size="15" font-weight="800" fill="#fff" text-anchor="middle">STOP</text>`)
  a['assets/img/c3_pasos.svg'] = frame(
    card(10, C.red, stop(83, 152), 'PARA', 'No pulses\nni respondas') + card(166, C.blue, icon.eye(239, 152, 70, C.ink), 'MIRA', 'Remitente, prisa,\nenlace, adjunto\ny qué te piden') + card(322, C.teal, icon.phoneCall(395, 152, 70, C.teal), 'VERIFICA', 'Por otro canal:\nllama al número\nde siempre') + card(478, P, icon.shield(551, 152, 74, P, 'check'), 'AVISA', 'A tu responsable\ny, si hace falta,\nal 017') +
    caption(W, H, 'Ante la duda: Para · Mira · Verifica · Avisa'),
    'Los cuatro pasos: Para, Mira, Verifica, Avisa'
  )

  return { svgs: a, spots }
}
