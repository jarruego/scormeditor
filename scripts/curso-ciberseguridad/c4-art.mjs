/** Ilustraciones SVG del curso 4 (hechas con svgkit). Cada función devuelve el documento SVG (string). */
import { svg, bg, person, phone, laptop, tablet, icon, bubble, pill, rect, circle, line, path, g, text, caption, C } from './svgkit.mjs'

const W = 640, H = 360

/** Portada del curso. */
export function portada() {
  const inner = `${rect(0, 0, 200, 26, C.mint, { r: 0 })}${text(10, 18, 'Planta 2 · Registro', { size: 13, weight: 800, fill: C.teal })}${rect(12, 40, 176, 18, C.sky, { r: 6 })}${rect(12, 66, 176, 18, C.sky, { r: 6 })}${rect(12, 92, 120, 18, C.sky, { r: 6 })}${icon.check(168, 99, 20)}`
  return svg(W, H,
    bg(W, H, '#d9f3ef', '#ffffff') +
    circle(520, 120, 150, '#6DC3C0', { op: 0.18 }) +
    person(105, 150, { shirt: C.teal, hairStyle: 'bun', badge: true, scale: 1.35 }) +
    tablet(190, 120, 200, 138, inner) +
    icon.wifi(470, 110, 96, C.teal) +
    icon.shield(560, 205, 92, C.teal) +
    icon.lock(430, 215, 70, C.blue) +
    icon.usb(305, 80, 60, C.ink) + icon.cross(335, 60, 30, C.red) +
    caption(W, H, 'Mi puesto, mis dispositivos y mi wifi', C.ink),
    'Una gerocultora con una tablet de planta rodeada de un escudo, un candado, el símbolo wifi y un USB tachado')
}

/** Mapa del puesto: qué es «mi puesto». */
export function puesto() {
  const lap = laptop(200, 150, 190, 110, `${rect(0, 0, 174, 94, '#f2f6fb', { r: 4 })}${rect(10, 12, 100, 10, C.line, { r: 4 })}${rect(10, 32, 140, 10, C.line, { r: 4 })}${rect(10, 52, 90, 10, C.line, { r: 4 })}`)
  return svg(W, H,
    bg(W, H, C.mint, '#ffffff') +
    rect(0, 282, W, 78, '#e7edf5', { r: 0 }) +
    lap +
    tablet(430, 190, 120, 80, `${rect(8, 8, 90, 8, C.line, { r: 3 })}${rect(8, 24, 70, 8, C.line, { r: 3 })}${icon.check(86, 50, 22)}`) +
    phone(60, 170, 56, 100, icon.lock(18, 40, 30, C.teal)) +
    rect(150, 236, 46, 46, '#fff', { r: 3, stroke: C.line }) + line(158, 250, 188, 250, C.mut, 3) + line(158, 260, 188, 260, C.mut, 3) + line(158, 270, 176, 270, C.mut, 3) +
    icon.wifi(320, 70, 70, C.teal) +
    pill(232, 108, 'Ordenador', C.blue) + pill(420, 140, 'Tablet de planta', C.violet) + pill(34, 122, 'Móvil', C.teal) + pill(104, 283, 'Papel', C.amber, { color: C.ink }) + pill(366, 56, 'Wifi', C.ink) +
    caption(W, H, 'Tu puesto es todo lo que usas para trabajar', C.ink),
    'Un puesto de trabajo con ordenador, tablet de planta, móvil, papel y wifi señalados con etiquetas')
}

/** Tablet de planta con la sesión de otra compañera abierta. */
export function tabletPlanta() {
  const inner = `${rect(0, 0, 420, 38, C.mint, { r: 0 })}${text(14, 25, 'Cambios posturales', { size: 16, weight: 800, fill: C.teal })}${rect(250, 6, 160, 26, C.rose, { r: 13, stroke: C.red })}${text(330, 24, 'Sesión: MARTA', { size: 15, weight: 800, fill: C.red, anchor: 'middle' })}${rect(14, 52, 392, 26, C.sky, { r: 8 })}${text(24, 71, 'Hab. 14 · 10:00 · Decúbito lateral', { size: 14 })}${rect(14, 86, 392, 26, C.sky, { r: 8 })}${text(24, 105, 'Hab. 16 · 10:15 · Decúbito supino', { size: 14 })}${rect(14, 120, 392, 26, '#fff', { r: 8, stroke: C.line })}${text(24, 139, 'Nuevo registro…', { size: 14, fill: C.mut })}`
  return svg(W, H,
    bg(W, H, C.sand, '#ffffff') +
    tablet(100, 28, 440, 216, inner) +
    icon.warn(578, 70, 52, C.amber) +
    bubble(60, 262, 520, 44, '¿A nombre de quién quedaría tu registro? Del de Marta.', { size: 17, tail: 'b', fill: '#fff' }) +
    caption(W, H, 'Antes de registrar: cierra su sesión y entra con la tuya', C.ink),
    'Tablet de planta con la sesión de Marta abierta: el registro quedaría a su nombre')
}

/** Escena de la sala de enfermería (hotspots). Coordenadas = las de los spots del curso (ver c4-puesto-dispositivos). */
export function enfermeria() {
  // pared y suelo
  let s = `<rect width="${W}" height="${H}" rx="24" fill="#eaf3f6"/>` + rect(0, 300, W, 60, '#d3dde6', { r: 0 }) + rect(0, 296, W, 6, '#b9c6d3', { r: 0 })
  // armario cerrado con llave (OK)
  s += rect(40, 30, 100, 70, '#9fb3c8', { r: 6 }) + line(90, 34, 90, 96, '#7f94ab', 2) + rect(96, 58, 8, 14, '#fff', { r: 3 }) + rect(66, 58, 8, 14, '#fff', { r: 3 }) + g(122, 82, icon.lock(0, 0, 22, C.green))
  // reloj
  s += circle(200, 52, 20, '#fff', { stroke: C.ink, sw: 3 }) + line(200, 52, 200, 40, C.ink, 3) + line(200, 52, 210, 56, C.ink, 3)
  // hoja de cambios posturales en la pared (fallo)
  s += rect(270, 40, 90, 70, '#fff', { r: 4, stroke: C.line }) + text(315, 56, 'CAMBIOS POSTURALES', { size: 8.5, weight: 800, anchor: 'middle', fill: C.red })
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) s += rect(276 + c * 20, 64 + r * 11, 17, 8, (r + c) % 2 ? C.sky : '#fde8c8', { r: 2 })
  // mostrador
  s += rect(30, 225, 395, 14, '#c9a57a', { r: 4 }) + rect(40, 239, 375, 61, '#a9855a', { r: 4 }) + line(165, 241, 165, 298, '#8c6b44', 2) + line(290, 241, 290, 298, '#8c6b44', 2)
  // monitor 1 sin bloquear (fallo) + post-it con clave (fallo)
  s += rect(100, 205, 22, 20, '#6b7a90', { r: 3 }) + rect(60, 120, 120, 85, C.ink, { r: 8 }) + rect(66, 126, 108, 73, '#fff', { r: 4 })
  s += text(72, 141, 'MEDICACIÓN', { size: 9.5, weight: 800, fill: C.blue }) + text(72, 157, 'Sra. G. R. · Metformina', { size: 9.5, weight: 600 }) + text(72, 171, 'Sr. P. M. · Sintrom', { size: 9.5, weight: 600 }) + text(72, 185, 'Sra. A. L. · Insulina', { size: 9.5, weight: 600 })
  // monitor 2 bloqueado (OK)
  s += rect(238, 205, 20, 20, '#6b7a90', { r: 3 }) + rect(205, 130, 90, 75, C.ink, { r: 8 }) + rect(211, 136, 78, 63, '#1f3b73', { r: 4 }) + icon.lock(250, 166, 30, '#fff')
  s += g(180, 112, rect(0, 0, 34, 32, '#ffe45e', { r: 3 }) + text(17, 14, 'clave', { size: 8.5, weight: 800, anchor: 'middle' }) + text(17, 26, '1234', { size: 9.5, weight: 800, anchor: 'middle', fill: C.red }))
  // tablet con sesión ajena (fallo)
  s += rect(335, 205, 40, 20, '#6b7a90', { r: 3 }) + rect(310, 150, 90, 62, C.ink, { r: 8 }) + rect(316, 156, 78, 50, '#fff', { r: 4 }) + rect(316, 156, 78, 14, C.rose, { r: 4 }) + text(355, 167, 'Sesión: MARTA', { size: 8.5, weight: 800, anchor: 'middle', fill: C.red }) + rect(322, 178, 66, 7, C.line, { r: 3 }) + rect(322, 190, 50, 7, C.line, { r: 3 })
  // USB desconocido en el mostrador (fallo)
  s += rect(398, 211, 30, 13, '#6b7a90', { r: 3 }) + rect(425, 214, 10, 7, '#c9d2dd', { r: 1 }) + rect(405, 214, 8, 7, C.red, { r: 1 })
  // trituradora (OK)
  s += rect(440, 252, 52, 48, '#5f7389', { r: 6 }) + rect(448, 258, 36, 6, C.ink, { r: 2 }) + circle(484, 280, 4, C.green) + text(466, 292, 'TRITURA', { size: 7.5, weight: 800, anchor: 'middle', fill: '#fff' })
  // puerta de comunicaciones entreabierta con llave puesta (fallo)
  s += rect(500, 50, 78, 250, '#7b8da3', { r: 4 }) + rect(560, 50, 18, 250, '#1d2b3f', { r: 2 }) + rect(563, 70, 4, 4, C.green) + rect(570, 70, 4, 4, C.green) + rect(563, 82, 4, 4, C.amber) + rect(570, 82, 4, 4, C.green)
  s += rect(508, 74, 46, 14, '#fff', { r: 3 }) + text(531, 84, 'COMUNIC.', { size: 7, weight: 800, anchor: 'middle' }) + circle(548, 180, 6, '#d9a441') + g(540, 188, icon.key(0, 0, 22, C.amber))
  // papelera con listados (fallo)
  s += path('M590 262 h40 l-5 40 h-30 z', '#8a98a9') + rect(592, 246, 18, 22, '#fff', { r: 2, stroke: C.line }) + rect(608, 250, 18, 20, '#fff', { r: 2, stroke: C.line }) + line(595, 252, 606, 252, C.red, 2) + line(611, 256, 623, 256, C.red, 2)
  return svg(W, H, s, 'Sala de enfermería con varios fallos de seguridad: ordenador desbloqueado con medicación a la vista, clave en un post-it, tablet con sesión de otra persona, USB desconocido, hoja de cambios posturales en la pared, puerta de comunicaciones entreabierta con la llave puesta y listados en la papelera; y tres cosas bien hechas')
}

/** USB encontrado. */
export function usb() {
  return svg(W, H,
    bg(W, H, '#fff4de', '#ffffff') +
    circle(320, 170, 120, C.amber, { op: 0.18 }) +
    icon.usb(320, 150, 190, C.ink) +
    icon.warn(430, 70, 70, C.amber) +
    bubble(30, 40, 200, 70, '«Seguro que es\nde alguien… lo pruebo»', { size: 15, tail: 'r' }) + icon.cross(250, 112, 34, C.red) +
    bubble(372, 238, 243, 64, 'Se entrega a informática\nsin conectarlo', { size: 15, tail: 'l', stroke: C.green }) + icon.check(600, 246, 34, C.green) +
    caption(W, H, 'USB desconocido: no se conecta, se entrega', C.ink),
    'Un USB desconocido con un aviso: no se conecta, se entrega a informática')
}

/** Router con tres redes. */
export function router() {
  const arcs = (x, y, c) => path(`M${x - 22} ${y} a30 30 0 0 1 44 0 M${x - 12} ${y + 10} a16 16 0 0 1 24 0`, 'none', { stroke: c, sw: 5 })
  return svg(W, H,
    bg(W, H, C.sky, '#ffffff') +
    rect(250, 150, 140, 46, C.ink, { r: 10 }) + line(270, 150, 262, 100, C.ink, 6) + line(370, 150, 378, 100, C.ink, 6) + circle(280, 173, 5, C.green) + circle(298, 173, 5, C.green) + circle(316, 173, 5, C.amber) +
    // centro
    rect(34, 214, 140, 82, '#fff', { r: 12, stroke: C.teal, sw: 3 }) + icon.lock(70, 250, 36, C.teal) + text(124, 246, 'Wifi del\ncentro', { size: 15, weight: 800, anchor: 'middle', fill: C.teal }) + text(104, 312, 'personal · equipos del centro', { size: 12, anchor: 'middle', fill: C.mut }) +
    // invitados
    rect(250, 232, 140, 64, '#fff', { r: 12, stroke: C.blue, sw: 3 }) + icon.lock(284, 264, 32, C.blue) + text(340, 258, 'Wifi de\ninvitados', { size: 15, weight: 800, anchor: 'middle', fill: C.blue }) + text(320, 312, 'visitas y móviles personales', { size: 12, anchor: 'middle', fill: C.mut }) +
    // pública
    rect(466, 214, 140, 82, '#fff', { r: 12, stroke: C.amber, sw: 3 }) + icon.warn(500, 250, 36, C.amber) + text(562, 241, 'Wifi'+String.fromCharCode(92)+'npública', { size: 15, weight: 800, anchor: 'middle', fill: '#b86e00' }) + text(536, 312, 'cafeterías, estaciones…', { size: 12, anchor: 'middle', fill: C.mut }) +
    arcs(320, 80, C.blue) +
    path('M300 200 L120 214', 'none', { stroke: C.teal, sw: 4 }) + path('M320 200 L320 232', 'none', { stroke: C.blue, sw: 4 }) + path('M340 200 L536 214', 'none', { stroke: C.amber, sw: 4 }) +
    pill(30, 20, 'Tres redes, tres usos', C.ink),
    'Un router en el centro y tres redes: la wifi del centro para equipos del centro, la de invitados para visitas y móviles personales, y las públicas con cautela')
}

/** Móvil personal y trabajo (BYOD). */
export function movil() {
  const inner = `${rect(0, 0, 154, 280, '#1b2a41', { r: 0 })}${icon.lock(77, 110, 90, '#6DC3C0')}${text(77, 190, 'Bloqueo con huella\no PIN', { size: 14, weight: 700, fill: '#fff', anchor: 'middle' })}`
  return svg(W, H,
    bg(W, H, C.mint, '#ffffff') +
    phone(245, 24, 170, 300, inner) +
    bubble(26, 60, 190, 64, 'Familia, amigos,\njuegos, fotos…', { size: 15, tail: 'r', fill: C.sand }) +
    bubble(26, 160, 190, 64, 'Correo del centro,\ncuadrantes…', { size: 15, tail: 'r', fill: C.sky }) +
    icon.camera(560, 90, 70, C.ink) + icon.cross(596, 66, 30, C.red) + text(530, 138, 'Fotos de\nresidentes', { size: 14, weight: 700, anchor: 'middle', lh: 17 }) +
    icon.doc(530, 236, 56, C.blue) + icon.check(562, 218, 28, C.green) + text(530, 290, 'Solo lo que\nautoriza el centro', { size: 13, weight: 700, anchor: 'middle', lh: 16 }) +
    pill(30, 20, 'Un móvil, dos vidas', C.teal),
    'Un móvil personal con bloqueo de pantalla; a un lado lo personal y al otro el correo del centro; las fotos de residentes están tachadas')
}

/** Móvil perdido. */
export function movilPerdido() {
  const map = `${rect(0, 0, 154, 280, '#e8f4ee', { r: 0 })}${path('M0 70 L150 110 M40 0 L70 280 M0 200 L150 160', 'none', { stroke: '#fff', sw: 9 })}${g(78, 118, `<path d="M0 0 c-16 -22 -22 -34 -22 -46 a22 22 0 1 1 44 0 c0 12 -6 24 -22 46z" fill="${C.red}"/><circle cx="0" cy="-46" r="8" fill="#fff"/>`)}${text(75, 230, 'Último lugar\nconocido', { size: 13, weight: 700, anchor: 'middle', fill: C.ink })}`
  return svg(W, H,
    bg(W, H, '#fdeaea', '#ffffff') +
    phone(60, 24, 170, 300, map) +
    pill(280, 40, '1 · Avisa al centro', C.red) +
    pill(280, 100, '2 · Bloquea y localiza', C.blue) +
    pill(280, 160, '3 · Borra a distancia', C.violet) +
    pill(280, 220, '4 · Denuncia si es robo', C.ink) +
    text(280, 290, 'Avisar rápido nunca es motivo de reprimenda.', { size: 15, weight: 700, fill: C.ink }),
    'Un móvil perdido localizado en un mapa y cuatro pasos para actuar: avisar, bloquear y localizar, borrar a distancia y denunciar si es robo')
}

/** Regla 3-2-1. */
export function copias321() {
  const card = (x, n, title, sub, ic) => rect(x, 60, 180, 230, '#fff', { r: 18, stroke: C.line, sw: 2 }) + text(x + 90, 130, n, { size: 64, weight: 900, anchor: 'middle', fill: C.teal }) + ic + text(x + 90, 236, title, { size: 17, weight: 800, anchor: 'middle' }) + text(x + 90, 258, sub, { size: 13, weight: 600, anchor: 'middle', fill: C.mut })
  return svg(W, H,
    bg(W, H, C.sky, '#ffffff') +
    card(24, '3', 'copias', 'la original + 2 más', icon.doc(114, 180, 50, C.blue)) +
    card(230, '2', 'tipos de soporte', 'p. ej. disco y nube', icon.cloud(114 + 206, 178, 66, C.sky, C.blue)) +
    card(436, '1', 'copia fuera', 'lejos del centro', `${rect(496, 164, 60, 44, '#dfe8f5', { r: 4 })}${rect(510, 148, 32, 16, C.blue, { r: 3 })}${rect(502, 174, 12, 12, '#fff', { r: 2 })}${rect(522, 174, 12, 12, '#fff', { r: 2 })}${rect(540, 174, 12, 12, '#fff', { r: 2 })}`) +
    pill(30, 14, 'Regla 3-2-1', C.teal) +
    caption(W, H, 'Tú guardas donde indica el centro; informática hace las copias', C.ink),
    'Regla 3-2-1: tres copias, en dos tipos de soporte distintos y una fuera del centro')
}

/** Teletrabajo en casa. */
export function teletrabajo() {
  return svg(W, H,
    bg(W, H, '#fff4de', '#ffffff') +
    rect(0, 290, W, 70, '#e0c9a6', { r: 0 }) +
    // ventana
    rect(40, 40, 120, 130, '#cfeaf7', { r: 8, stroke: '#fff', sw: 6 }) + line(100, 40, 100, 170, '#fff', 5) + line(40, 105, 160, 105, '#fff', 5) +
    // mesa y portátil
    rect(200, 230, 300, 16, '#a9855a', { r: 5 }) + rect(220, 246, 12, 44, '#8c6b44', { r: 3 }) + rect(468, 246, 12, 44, '#8c6b44', { r: 3 }) +
    laptop(260, 140, 150, 90, `${rect(0, 0, 134, 74, '#f2f6fb', { r: 3 })}${icon.lock(67, 38, 36, C.teal)}`) +
    // router
    rect(430, 200, 60, 30, C.ink, { r: 6 }) + circle(444, 215, 3.5, C.green) + circle(458, 215, 3.5, C.green) + path('M440 192 a26 26 0 0 1 40 0', 'none', { stroke: C.teal, sw: 4 }) + pill(404, 110, 'WPA2/WPA3 · clave propia', C.teal, { size: 12 }) +
    // papel bajo llave
    rect(540, 200, 60, 90, '#8a98a9', { r: 6 }) + icon.lock(570, 245, 34, C.amber) + text(570, 190, 'Papel bajo llave', { size: 12, weight: 800, anchor: 'middle' }) +
    person(210, 175, { shirt: C.teal, hairStyle: 'long', scale: 0.85, hair: '#6b3b1f' }) +
    caption(W, H, 'En casa, el puesto de trabajo sigue siendo tu responsabilidad', C.ink),
    'Un puesto de teletrabajo en casa con portátil bloqueado, router con cifrado WPA2 o WPA3 y papel guardado bajo llave')
}

/** Técnico desconocido en la puerta. */
export function visita() {
  return svg(W, H,
    bg(W, H, C.sand, '#ffffff') +
    rect(0, 296, W, 64, '#d3dde6', { r: 0 }) +
    rect(250, 40, 140, 256, '#8aa0b8', { r: 6 }) + rect(266, 56, 108, 224, '#9fb3c8', { r: 4 }) + circle(360, 170, 7, C.amber) + rect(280, 70, 80, 22, '#fff', { r: 4 }) + text(320, 86, 'COMUNICACIONES', { size: 10.5, weight: 800, anchor: 'middle' }) +
    person(120, 170, { shirt: C.amber, hairStyle: 'short', scale: 1.3, hair: '#2a2018' }) +
    bubble(14, 24, 200, 64, '«Vengo a revisar el router.\nÁbrame, voy con prisa»', { size: 13.5, tail: 'b' }) +
    person(500, 170, { shirt: C.teal, hairStyle: 'bun', badge: true, scale: 1.3 }) +
    bubble(410, 24, 216, 64, '«¿Quién te avisó? Lo confirmo\ncon informática y paso contigo»', { size: 13.5, tail: 'b', stroke: C.green }) +
    icon.phoneCall(570, 300, 36, C.green) +
    caption(W, H, 'Sin cita ni identificación, no pasa solo', C.ink),
    'Un supuesto técnico con chaleco pide entrar al cuarto de comunicaciones; la trabajadora responde que lo confirmará con informática y le acompañará')
}

/** Guardianes del equipo: actualizar, antivirus, cortafuegos. */
export function guardianes() {
  const card = (x, col, ttl, sub, ic) => rect(x, 50, 190, 240, '#fff', { r: 18, stroke: col, sw: 3 }) + ic + text(x + 95, 210, ttl, { size: 18, weight: 800, anchor: 'middle', fill: col }) + text(x + 95, 234, sub, { size: 13, weight: 600, anchor: 'middle', fill: C.mut, lh: 16 })
  const upd = path('M-24 -6 a26 26 0 0 1 46 -12 M24 6 a26 26 0 0 1 -46 12', 'none', { stroke: C.blue, sw: 8 }) + path('M12 -30 l14 12 l-18 6 z', C.blue) + path('M-12 30 l-14 -12 l18 -6 z', C.blue)
  const wall = [0, 1, 2].map((r) => [0, 1, 2].map((c) => rect(-30 + c * 21 + (r % 2 ? 8 : 0), -26 + r * 20, 19, 17, '#e08a5a', { r: 2 })).join('')).join('')
  return svg(W, H,
    bg(W, H, C.sky, '#ffffff') +
    card(18, C.blue, 'Actualizar', 'cierra «puertas\nabiertas» conocidas', g(113, 130, upd, 1.6)) +
    card(225, C.teal, 'Antivirus', 'detecta y elimina\nel código malicioso', icon.shield(320, 130, 110, C.teal)) +
    card(432, '#c4571f', 'Cortafuegos', 'vigila lo que entra\ny sale a Internet', g(527, 130, wall, 1.4)) +
    caption(W, H, 'Los tres, siempre activos. Si el antivirus avisa: no lo ignores', C.ink),
    'Tres guardianes del equipo: actualizar, antivirus y cortafuegos')
}
