/**
 * Curso 2 · «Contraseñas y accesos: las llaves de la residencia»
 * Programa de ciberseguridad para centros sociosanitarios.
 *   node scripts/curso-ciberseguridad/run.mjs c2-contrasenas-accesos.mjs
 * Fuente única de datos: docs/curso-ciberseguridad/fuentes/02-contrasenas-accesos.md
 * Criterio: CCN-CERT BP/35 (2026) y NIST SP 800-63B-4 (frase de paso larga, sin reglas de
 * composición forzadas, sin cambios periódicos obligatorios salvo sospecha).
 */
import { CourseBuilder, ix, fbk } from './lib.mjs'
import * as W from './widgets.mjs'
import { passLab2, phraseBuilder, crackDuel, twoStepSim, swipeLabeled } from './c2-widgets.mjs'
import { svg, bg, person, phone, laptop, tablet, icon, bubble, pill, rect, circle, line, path, g, text, caption, C } from './svgkit.mjs'

const V = '#5b47c7' // primario del curso
const A = '#b7a8ff' // acento
const KIT = 'C:/Users/Jose Alberto Arruego/Downloads/kit_concienciacion/kit_concienciacion/RecursosFormativos/05_Contraseñas/Consejos/0502_Contraseñas.png'

const OBJ = [
  'Explicar qué abren tu usuario y tu contraseña y por qué una clave robada pone en riesgo a las personas atendidas y al centro.',
  'Crear frases de paso largas, únicas y fáciles de recordar, y saber para qué sirve un gestor de contraseñas.',
  'Aplicar la regla de no compartir usuario ni clave en turnos, tablets de planta y salas comunes.',
  'Activar y usar la verificación en dos pasos sin dar nunca un código a nadie.',
  'Compartir archivos y dar accesos con el permiso mínimo necesario, y cerrar la sesión en los equipos compartidos.',
  'Actuar con rapidez cuando sospechas que te han robado una clave.',
]

const c = new CourseBuilder({
  id: 'cibersegsoc-c2-contrasenas',
  identifier: 'CIBERSEG_C2',
  title: 'Contraseñas y accesos: las llaves de la residencia',
  subtitle: 'Curso 2 del programa de ciberseguridad para centros sociosanitarios',
  description: 'Aprende a crear frases de paso, a no compartir tu clave en los turnos, a activar la verificación en dos pasos y a cuidar los accesos de tu cuenta del centro. Pensado para móvil, para ratos cortos y para personas sin experiencia digital.',
  hours: 1.7,
  primary: V,
  accent: A,
  moduleTitle: 'Llaves, cerrojos y permisos',
  objectives: OBJ,
})

/* ------------------------------------------------------------------ ILUSTRACIONES SVG */
const W6 = 640, H6 = 360
const IMG = (name, alt, o = {}) => ({ src: `assets/img/c2_${name}.svg`, alt, ...o })
const doc = (body, title) => svg(W6, H6, body, title)

// 1. Portada
c.asset('assets/img/c2_portada.svg', doc(
  bg(W6, H6, '#efecfb', '#ffffff') + circle(520, 100, 95, A, { op: 0.35 }) + circle(90, 290, 70, A, { op: 0.3 }) +
  person(120, 150, { shirt: V, hairStyle: 'bun', badge: true, scale: 1.2 }) +
  icon.key(300, 110, 120, V) + icon.key(400, 185, 90, C.amber) + icon.lock(530, 105, 110, V) + icon.shield(520, 235, 76, C.teal) +
  text(330, 268, 'Una llave para cada puerta', { size: 22, anchor: 'middle', weight: 800 }) +
  caption(W6, H6, 'Contraseñas y accesos · tu llave, tu responsabilidad', V),
  'Una trabajadora de residencia con un llavero, un candado y un escudo'))

// 2. Usuario = nombre en la puerta; contraseña = llave
c.asset('assets/img/c2_puerta_llave.svg', doc(
  bg(W6, H6, '#efecfb', '#ffffff') +
  rect(70, 36, 170, 250, '#8a6a4f', { r: 12 }) + rect(88, 52, 134, 96, '#a98664', { r: 6 }) + rect(88, 164, 134, 106, '#a98664', { r: 6 }) +
  rect(100, 90, 110, 34, '#ffffff', { r: 6, stroke: C.line }) + text(155, 113, 'Marta R.', { size: 18, anchor: 'middle', weight: 800 }) + circle(214, 200, 9, C.amber) +
  text(155, 318, 'Tu usuario: tu nombre en la puerta', { size: 15, anchor: 'middle', weight: 700 }) +
  icon.key(440, 130, 130, C.amber) + line(380, 160, 232, 200, V, 3, { dash: '8 8' }) +
  text(440, 232, 'Tu contraseña:', { size: 18, anchor: 'middle', weight: 800 }) + text(440, 256, 'la llave que demuestra', { size: 16, anchor: 'middle', weight: 600, fill: C.mut }) + text(440, 276, 'que eres tú', { size: 16, anchor: 'middle', weight: 600, fill: C.mut }),
  'Una puerta con el nombre de una persona y una llave dorada: el usuario es el nombre y la contraseña es la llave'))

// 3. Longitud
c.asset('assets/img/c2_longitud.svg', doc(
  bg(W6, H6, '#ffffff', '#efecfb') +
  text(320, 44, 'Más larga = muchísimo más trabajo para adivinarla', { size: 21, anchor: 'middle', weight: 800 }) +
  text(40, 100, 'M4dr1d!25  ·  9 caracteres con símbolos', { size: 17, weight: 700, fill: C.ink }) +
  rect(40, 112, 560, 38, C.line, { r: 19 }) + rect(40, 112, 92, 38, C.red, { r: 19 }) + text(150, 138, 'unas horas', { size: 17, weight: 800, fill: C.red }) +
  text(40, 204, 'EnunlugardelaMancha!25  ·  22 caracteres, casi todo letras', { size: 17, weight: 700, fill: C.ink }) +
  rect(40, 216, 560, 38, '#dff5ea', { r: 19 }) + rect(40, 216, 560, 38, C.green, { r: 19 }) + text(320, 242, 'siglos y siglos', { size: 18, anchor: 'middle', weight: 800, fill: '#ffffff' }) +
  text(320, 290, 'La longitud pesa más que los símbolos.', { size: 17, anchor: 'middle', weight: 700, fill: V }) +
  text(320, 326, 'Fuente: tabla de fuerza bruta que cita el CCN-CERT BP/35 (2026). Barras simbólicas, no a escala.', { size: 12.5, anchor: 'middle', weight: 500, fill: C.mut }),
  'Dos barras: una contraseña corta con símbolos tarda unas horas en adivinarse y una frase larga tarda siglos'))

// 4. Llave maestra (misma clave en todo)
c.asset('assets/img/c2_llave_maestra.svg', doc(
  bg(W6, H6, '#efecfb', '#ffffff') + icon.key(320, 80, 120, C.amber) +
  [60, 240, 420].map((x, i) => rect(x, 190, 160, 74, '#ffffff', { r: 14, stroke: V, sw: 3 }) + icon.lock(x + 28, 227, 34, V) + text(x + 52, 222, ['Correo del', 'Tienda', 'Programa de'][i], { size: 14.5, weight: 700 }) + text(x + 52, 240, ['centro', 'online', 'historias'][i], { size: 14.5, weight: 700 })).join('') +
  line(300, 118, 140, 188, C.amber, 3, { dash: '7 7' }) + line(320, 126, 320, 188, C.amber, 3, { dash: '7 7' }) + line(340, 118, 500, 188, C.amber, 3, { dash: '7 7' }) +
  icon.warn(570, 70, 50) + text(570, 112, 'Si se filtra', { size: 13, anchor: 'middle', weight: 700, fill: C.red }) + text(570, 128, 'una, se prueban', { size: 13, anchor: 'middle', weight: 700, fill: C.red }) + text(570, 144, 'todas', { size: 13, anchor: 'middle', weight: 700, fill: C.red }) +
  caption(W6, H6, 'La misma clave en todo = una llave maestra para el ladrón', V),
  'Una sola llave dorada abre tres cajas: correo del centro, tienda online y programa de historias'))

// 5. Tablet de planta compartida
c.asset('assets/img/c2_tablet_planta.svg', doc(
  bg(W6, H6, '#e3f6f3', '#ffffff') +
  person(70, 160, { shirt: C.teal, hairStyle: 'bun', scale: 0.85 }) + person(572, 160, { shirt: V, skin: C.skin2, scale: 0.85 }) +
  tablet(140, 36, 360, 244,
    rect(0, 0, 340, 40, V, { r: 0 }) + text(170, 26, 'Planta 2 · ¿Quién eres?', { size: 17, fill: '#fff', anchor: 'middle', weight: 700 }) +
    [['Marta', C.skin, '#3b2a20'], ['Rocío', C.skin2, '#2a1c14'], ['Tú', C.skin, '#7a4f2a']].map(([n, sk], i) => { const x = 20 + i * 108; return rect(x, 58, 96, 112, '#f2f6fb', { r: 12, stroke: C.line }) + circle(x + 48, 96, 24, sk) + circle(x + 40, 92, 3, C.ink) + circle(x + 56, 92, 3, C.ink) + text(x + 48, 148, n, { size: 16, anchor: 'middle', weight: 800 }) + icon.lock(x + 80, 70, 18, V) }).join('') +
    text(170, 200, 'Una sesión por persona', { size: 17, anchor: 'middle', weight: 800, fill: V }) + text(170, 220, 'Se cierra al terminar el turno', { size: 14, anchor: 'middle', weight: 600, fill: C.mut }),
    { screen: '#ffffff' }) +
  caption(W6, H6, 'Una tablet, varias personas: cada una con su usuario', C.teal ? '#0e6e66' : V),
  'Una tablet de planta que pide elegir quién eres, con tres usuarios individuales y un candado cada uno'))

// 6. Escena para hotspots: sala de enfermería
c.asset('assets/img/c2_sala_enfermeria.svg', doc(
  rect(0, 0, W6, H6, '#e8f0ff', { r: 0 }) + rect(0, 250, W6, 110, '#c9a77c', { r: 0 }) + rect(0, 250, W6, 8, '#a98664', { r: 0 }) +
  circle(95, 85, 32, '#ffffff', { stroke: C.ink, sw: 4 }) + line(95, 85, 95, 64, C.ink, 4) + line(95, 85, 110, 92, C.ink, 4) +
  rect(466, 36, 148, 92, '#ffffff', { r: 6, stroke: C.mut, sw: 3 }) + text(540, 62, 'USUARIO COMÚN', { size: 12.5, anchor: 'middle', weight: 800, fill: C.mut }) + text(540, 88, 'usuario: enfermeria', { size: 13, anchor: 'middle', weight: 700 }) + text(540, 108, 'clave: enfermeria', { size: 13, anchor: 'middle', weight: 700 }) +
  laptop(230, 118, 200, 118,
    rect(0, 0, 184, 24, V, { r: 0 }) + text(8, 17, 'Historias clínicas', { size: 12.5, fill: '#fff', weight: 700 }) + circle(166, 12, 5, C.green) +
    text(8, 46, 'Sesión de Marta · abierta', { size: 13, weight: 800 }) + rect(8, 58, 150, 8, C.line, { r: 4 }) + rect(8, 74, 120, 8, C.line, { r: 4 }) + rect(8, 90, 140, 8, C.line, { r: 4 })) +
  g(0, 0, `<g transform="rotate(-6 489 232)">${rect(452, 200, 74, 64, '#ffe45c', { r: 4 })}${text(489, 226, 'Clave:', { size: 14, anchor: 'middle', weight: 800 })}${text(489, 248, 'Resid2024', { size: 15, anchor: 'middle', weight: 800 })}</g>`) +
  tablet(40, 206, 150, 92, rect(0, 0, 130, 20, C.teal, { r: 0 }) + text(8, 15, 'Ficha de residente', { size: 11.5, fill: '#fff', weight: 700 }) + text(8, 40, 'Hab. 12', { size: 13, weight: 800 }) + rect(8, 50, 100, 6, C.line, { r: 3 }) + rect(8, 62, 80, 6, C.line, { r: 3 })) +
  phone(551, 206, 52, 96, icon.lock(18, 34, 26, C.green)) +
  text(320, 340, 'Sala de enfermería · turno de noche', { size: 14, anchor: 'middle', weight: 700, fill: '#7a5a38' }),
  'Sala de enfermería con un portátil con sesión abierta, una nota con una clave, una tablet sin bloqueo, un cartel con usuario común, un reloj y un móvil bloqueado'))

// 7. Dos cerrojos
c.asset('assets/img/c2_dos_pasos.svg', doc(
  bg(W6, H6, '#efecfb', '#ffffff') +
  laptop(30, 64, 220, 136, rect(0, 0, 204, 24, V, { r: 0 }) + text(8, 17, 'Entrar', { size: 13, fill: '#fff', weight: 700 }) + text(10, 52, 'Contraseña  ••••••••••', { size: 14, weight: 700 }) + icon.check(160, 54, 26) + rect(10, 80, 184, 32, C.line, { r: 8 }) + text(102, 101, 'Falta el segundo paso…', { size: 13, anchor: 'middle', weight: 700, fill: C.mut })) +
  text(140, 242, 'Cerrojo 1: lo que sabes', { size: 16, anchor: 'middle', weight: 800 }) + text(140, 262, '(tu contraseña)', { size: 14, anchor: 'middle', weight: 600, fill: C.mut }) +
  text(320, 150, '+', { size: 60, anchor: 'middle', weight: 800, fill: V }) +
  phone(430, 36, 130, 230, text(57, 40, 'Aviso', { size: 14, anchor: 'middle', weight: 800, fill: V }) + rect(8, 54, 98, 70, '#efecfb', { r: 10 }) + text(57, 82, '¿Eres tú?', { size: 14, anchor: 'middle', weight: 800 }) + rect(14, 94, 40, 22, C.green, { r: 6 }) + text(34, 110, 'Sí', { size: 13, anchor: 'middle', weight: 800, fill: '#fff' }) + rect(60, 94, 40, 22, C.red, { r: 6 }) + text(80, 110, 'No', { size: 13, anchor: 'middle', weight: 800, fill: '#fff' }) + icon.lock(57, 168, 30, V)) +
  text(495, 292, 'Cerrojo 2: lo que tienes', { size: 16, anchor: 'middle', weight: 800 }) + text(495, 310, '(tu móvil)', { size: 14, anchor: 'middle', weight: 600, fill: C.mut }) +
  caption(W6, H6, 'Con dos cerrojos, una clave robada no basta para entrar', V),
  'Un portátil que ya tiene la contraseña y un móvil que pide confirmar: dos cerrojos'))

// 8. Gestor de contraseñas
c.asset('assets/img/c2_gestor.svg', doc(
  bg(W6, H6, '#e3f6f3', '#ffffff') +
  rect(50, 50, 220, 220, '#5b6b82', { r: 18 }) + rect(66, 66, 188, 188, '#8d9bb0', { r: 12 }) + circle(160, 160, 44, '#e8f0ff', { stroke: C.ink, sw: 4 }) + line(160, 160, 160, 128, C.ink, 5) + circle(160, 160, 8, C.ink) +
  rect(236, 150, 14, 40, C.amber, { r: 5 }) +
  line(274, 160, 320, 160, V, 4, { dash: '8 8' }) +
  rect(320, 50, 270, 220, '#ffffff', { r: 16, stroke: C.line }) + text(334, 82, 'Tus claves, guardadas', { size: 16, weight: 800, fill: V }) +
  [['Correo del centro', 118], ['Programa de historias', 168], ['Drive', 218]].map(([t, y]) => text(334, y, t, { size: 15, weight: 700 }) + text(334, y + 20, '••••••••••••••••••', { size: 15, weight: 700, fill: C.mut })).join('') +
  icon.key(90, 294, 40, C.amber) + text(124, 302, 'Una sola contraseña maestra: larga y solo tuya', { size: 15, weight: 800 }) +
  caption(W6, H6, 'Gestor de contraseñas: una caja fuerte digital', '#0e6e66').replace('M0', 'M0'),
  'Una caja fuerte que guarda las claves de varios servicios y se abre con una sola contraseña maestra'))

// 9. Drive: restringido vs cualquiera con el enlace
c.asset('assets/img/c2_drive.svg', doc(
  bg(W6, H6, '#ffffff', '#efecfb') +
  rect(24, 36, 288, 270, '#ffffff', { r: 18, stroke: C.green, sw: 4 }) + icon.lock(60, 78, 44, C.green) + text(92, 86, 'Restringido', { size: 22, weight: 800, fill: '#157347' }) +
  text(44, 126, 'Solo las personas que tú añades', { size: 14.5, weight: 600 }) +
  circle(70, 170, 20, C.skin) + circle(64, 166, 3, C.ink) + circle(76, 166, 3, C.ink) + text(100, 168, 'Gestoría', { size: 15, weight: 800 }) + pill(100, 176, 'Lector', C.green, { size: 12 }) +
  circle(70, 236, 20, C.skin2) + circle(64, 232, 3, C.ink) + circle(76, 232, 3, C.ink) + text(100, 234, 'Supervisora', { size: 15, weight: 800 }) + pill(100, 242, 'Comentador', C.blue, { size: 12 }) +
  icon.check(278, 280, 34) +
  rect(328, 36, 288, 270, '#ffffff', { r: 18, stroke: C.red, sw: 4 }) + icon.wifi(364, 80, 40, C.red) + text(392, 88, 'Cualquiera con el enlace', { size: 17, weight: 800, fill: '#b3262d' }) +
  text(348, 126, 'Quien tenga el enlace entra,', { size: 14.5, weight: 600 }) + text(348, 144, 'aunque no tenga cuenta', { size: 14.5, weight: 600 }) +
  [0, 1, 2, 3, 4, 5].map((i) => circle(362 + (i % 3) * 66, 196 + Math.floor(i / 3) * 56, 20, '#c9d3e3') + text(362 + (i % 3) * 66, 204 + Math.floor(i / 3) * 56, '?', { size: 22, anchor: 'middle', weight: 800, fill: C.mut })).join('') +
  icon.cross(590, 280, 34) +
  text(320, 340, 'Con datos de residentes: siempre «Restringido»', { size: 16, anchor: 'middle', weight: 800, fill: V }),
  'Dos tarjetas: Restringido, solo personas concretas, frente a Cualquiera con el enlace, que cualquiera puede abrir'))

// 10. Clave robada: avisa primero
c.asset('assets/img/c2_robada.svg', doc(
  bg(W6, H6, '#fdeaea', '#ffffff') +
  phone(40, 28, 150, 258, icon.warn(65, 50, 44) + text(65, 96, 'Nuevo inicio', { size: 14, anchor: 'middle', weight: 800 }) + text(65, 114, 'de sesión', { size: 14, anchor: 'middle', weight: 800 }) + text(65, 142, '¿Has sido tú?', { size: 14, anchor: 'middle', weight: 700, fill: C.red }) + rect(12, 160, 106, 30, C.red, { r: 8 }) + text(65, 180, 'No fui yo', { size: 14, anchor: 'middle', weight: 800, fill: '#fff' })) +
  bubble(216, 40, 190, 70, 'Hay algo raro\ncon mi cuenta…', { tail: 'l', size: 17 }) +
  person(470, 150, { shirt: V, hairStyle: 'short', skin: C.skin2, scale: 1.1 }) +
  [[icon.phoneCall, 'Avisa', C.green], [icon.key, 'Cambia', C.amber], [icon.shield, 'Protege', C.teal]].map(([fn, t, col], i) => fn(250 + i * 100, 214, 44, col) + text(250 + i * 100, 262, t, { size: 15, anchor: 'middle', weight: 800 })).join('') +
  line(290, 214, 310, 214, C.mut, 3) + line(390, 214, 410, 214, C.mut, 3) +
  caption(W6, H6, 'Si dudas: avisa primero, cambia después', C.red),
  'Un móvil con un aviso de inicio de sesión sospechoso y tres pasos: avisar, cambiar la clave y proteger la cuenta'))

/* ------------------------------------------------------------------ PORTADA */
c.intro({ type: 'cover', title: 'Contraseñas y accesos: las llaves de la residencia', text: '', img: IMG('portada', 'Una trabajadora de residencia con un llavero, un candado y un escudo', { full: true }) })

/* ================================================================== LECCIÓN 1 */
const l1 = c.unit('Lección 1. Por qué te interesa a ti la llave', 'Tu usuario y tu clave abren la puerta a datos de salud de personas. Si se pierden o se roban, el problema llega a residentes, familias y al centro. Tú eres la mejor defensa.')
l1.add({ type: 'cover', title: 'Por qué te interesa a ti la llave', text: 'Lección 1' })
  .add({
    type: 'objectives', title: 'Lo que vas a conseguir', obj: 0,
    text: 'Este curso se hace a ratos y desde el móvil. No necesitas saber de informática. Al terminar, sabrás:\n- ' + OBJ.map((o) => o.replace(/\.$/, '')).join('\n- ') + '\n\n::: tip\nSi te equivocas en una actividad, no pasa nada: puedes repetir. Aquí se aprende.\n:::',
  })
  .add({
    title: 'Tu usuario y tu clave', obj: 0,
    text: 'En el trabajo entras en sitios con **usuario** y **contraseña**. El usuario es tu nombre en la puerta: dice quién eres. La contraseña es la llave: demuestra que eres tú.\n\nEn una residencia esa llave abre algo muy delicado: **datos de salud** de las personas que cuidas. La AEPD pide que solo accedan quienes lo necesitan para su trabajo.\n\n::: info\nEl usuario te **identifica**; la contraseña te **autentica**. Son dos cosas distintas.\n:::',
    img: IMG('puerta_llave', 'Una puerta con el nombre de una persona y una llave dorada: el usuario es el nombre y la contraseña es la llave', { layout: 'top', full: true }),
  })
  .add({
    title: 'Una clave robada en la residencia', obj: 0,
    text: 'Imagina esta historia. Es un **ejemplo inventado**, no un caso real. Toca cada momento.',
    ix: ix.timeline([
      ['1', 'Una compra online', 'Marta usa en una tienda la misma contraseña que en el correo del centro. La tienda sufre una filtración y sus datos salen a la luz.'],
      ['2', 'Prueban su clave por todas partes', 'Programas automáticos prueban las claves filtradas en muchos servicios. Se llama *credential stuffing*. En el correo del centro, funciona.'],
      ['3', 'Entran con su nombre', 'Desde dentro ven correos con datos de residentes y pueden escribir **como si fueran Marta**.'],
      ['4', 'Las consecuencias', 'Datos de salud expuestos, familias preocupadas y el centro obligado a investigar. Y en los registros todo aparece **a nombre de Marta**.'],
      ['5', 'Lo que lo habría evitado', 'Una clave distinta para cada servicio y la verificación en dos pasos. Las dos cosas las aprenderás en este curso.'],
    ]),
  })
  .add({
    title: 'Sabes, tienes, eres', obj: 0,
    text: 'Para demostrar quién eres hay tres tipos de «prueba».',
    ix: ix.classify('Clasifica cada prueba según sea algo que **sabes**, que **tienes** o que **eres**.',
      [['sabes', 'Algo que sabes'], ['tienes', 'Algo que tienes'], ['eres', 'Algo que eres']],
      [['PIN de la tablet', 'sabes'], ['Código que llega al móvil', 'tienes'], ['Huella dactilar', 'eres'], ['Contraseña del correo', 'sabes'], ['Llave de seguridad USB', 'tienes'], ['Reconocimiento de la cara', 'eres']],
      fbk('¡Bien clasificado! Una clave es algo que sabes; el móvil o una llave, algo que tienes; la huella o la cara, algo que eres.', 'Casi. Piensa: ¿lo recuerdas (sabes), lo llevas encima (tienes) o es parte de tu cuerpo (eres)?', 'Más adelante usaremos dos de estas pruebas a la vez: es la verificación en dos pasos.')),
  })
  .add({
    title: 'Elige tu puesto', obj: 0,
    text: 'Cada puesto tiene su riesgo más típico. Toca el tuyo. Son recomendaciones del curso; tu centro puede tener normas propias.',
    ix: ix.tabs([
      ['Gerocultor/a', 'Tu mayor riesgo es el **turno de noche y las prisas**: la tablet de planta abierta con la sesión de otra persona.\n- Entra siempre con *tu* usuario.\n- Al terminar, **cierra sesión**, no solo bloquees.\n- Si una compañera te pide tu clave: no, y avisa a tu responsable para que le den la suya.'],
      ['Auxiliar / enfermería', 'Manejas historias y registros de cuidados.\n- Abre solo los de tu unidad y los residentes que atiendes: **tus accesos quedan registrados con tu nombre**.\n- Un «aviso de la dirección» con enlace para «verificar tu clave» es una trampa: no lo abras y avisa a informática.\n- Activa la verificación en dos pasos.'],
      ['Administración y dirección', 'Manejas datos de contacto, facturación, altas y bajas.\n- Comparte archivos con acceso **Restringido** y a personas concretas, nunca «cualquiera con el enlace».\n- Dirección: cuando alguien se va, retira sus accesos y cierra sus sesiones el mismo día.\n- Las cuentas de administrador, aparte y con verificación en dos pasos.'],
      ['Supervisión', 'Ves lo que pasa en el equipo.\n- Si encuentras un post-it con una clave, retíralo, **habla con el equipo sin culpar** y pide usuarios individuales.\n- Pide altas y bajas de usuarios a tiempo: ni suplencias con claves prestadas ni cuentas de quien ya se fue.'],
      ['Mantenimiento', 'A veces solo usas el móvil y paneles del edificio.\n- Bloquea el móvil con PIN o huella y activa la verificación en dos pasos en la app del centro.\n- Cambia las contraseñas que traen los equipos **por defecto**.\n- No des el acceso de un panel a un proveedor sin permiso de la dirección.'],
    ]),
  })
  .add({
    type: 'summary', title: 'Lo esencial de la lección 1',
    text: '- Tu usuario dice quién eres; tu contraseña lo demuestra.\n- En una residencia, esa llave abre datos de salud de personas.\n- Una clave repetida y filtrada puede abrir muchas puertas a la vez.\n- Hay tres pruebas de identidad: lo que sabes, lo que tienes y lo que eres.\n\n::: tip\nTú eres la mejor defensa: ante la duda, para y pregunta.\n:::',
  })

/* ================================================================== LECCIÓN 2 */
const l2 = c.unit('Lección 2. Contraseñas buenas: frases de paso', 'La longitud manda: una frase larga, con sentido para ti y distinta en cada servicio, gana a una clave corta llena de símbolos.')
l2.add({ type: 'cover', title: 'Contraseñas buenas: frases de paso', text: 'Lección 2', img: IMG('llave_maestra', 'Una sola llave dorada abre tres cajas: correo del centro, tienda online y programa de historias', { full: true }) })
  .add({
    title: 'La longitud manda', obj: 1,
    text: 'Antes te decían: «8 caracteres, con mayúscula, número y símbolo». Hoy las guías oficiales dicen que **lo que más cuenta es la longitud**.\n\nEl **CCN-CERT** (2026) recomienda *frases de paso* de al menos 20 caracteres. El **NIST** de EE. UU. pide mínimo 15 si la clave es el único paso, y desaconseja obligar a mezclar símbolos.\n\n::: info\nUna clave de 8 caracteres puede caer en minutos u horas. Una frase de 25, aunque sea solo de letras, puede aguantar miles de años (CCN-CERT).\n:::',
    img: IMG('longitud', 'Dos barras: una contraseña corta con símbolos tarda unas horas en adivinarse y una frase larga tarda siglos', { layout: 'top', full: true }),
  })
  .add({
    title: 'Duelo de contraseñas', obj: 1,
    text: 'Un programa prueba combinaciones sin parar. Elige en cada duelo la que **más tarda** en adivinarse.',
    ix: ix.html({ ...crackDuel(), prompt: '' }),
  })
  .add({
    title: 'Laboratorio de contraseñas', obj: 1,
    text: 'Prueba ejemplos y mira cómo pesan la longitud, las palabras y lo previsible.\n\n::: warn\nNunca escribas tu clave real en una web «medidora»: pasa a las listas de los atacantes (CCN-CERT).\n:::',
    ix: ix.html({ ...passLab2(), prompt: '' }),
  })
  .add({
    title: 'Tu frase de paso', obj: 1,
    text: 'Una **frase de paso** son varias palabras con sentido para ti, que nadie pueda adivinar. Si la intercalas con un número y un símbolo, mejor. Constrúyela por ladrillos.',
    ix: ix.html({ ...phraseBuilder(), prompt: '' }),
  })
  .add({
    title: 'Los errores de siempre', obj: 1,
    text: '',
    ix: ix.flip([
      ['Reciclar la misma clave', 'Si una web la pierde, los atacantes la prueban en todas las demás (*credential stuffing*). **Una distinta por servicio.**'],
      ['Teclas seguidas', '*123456*, *qwerty*… están en todas las listas de claves que prueban los programas.'],
      ['Frases de siempre', '*teamo*, *iloveyou*… son de las primeras que se intentan.'],
      ['Tus gustos', 'Tu equipo, tu grupo, tu marca favorita… se averiguan en redes. No los uses.'],
      ['Un post-it a la vista', 'Una nota bajo el teclado del control de enfermería la ve cualquiera que pase.'],
      ['Una fórmula previsible', 'Mayúscula + minúsculas + números + signo: los atacantes conocen la fórmula. Mejor **larga**.'],
    ], 'Toca cada tarjeta para darle la vuelta: son los seis errores más típicos (OSI-INCIBE).'),
  })
  .add({
    title: '¿Buena o mala?', obj: 1,
    text: 'Desliza la tarjeta a la derecha si la clave es buena y a la izquierda si es mala.',
    ix: ix.html({
      ...swipeLabeled({
        titulo: '', ayuda: 'Desliza a la derecha si es buena y a la izquierda si es mala. También puedes usar los botones.',
        cards: [
          { canal: '🔑 Contraseña de ejemplo', de: 'Residencia2026', texto: 'Para el programa de historias.', fraude: true, pistas: ['Lleva el nombre del centro', 'Y el año actual'], porque: 'Es lo primero que probaría alguien que quiera entrar.' },
          { canal: '🔑 Contraseña de ejemplo', de: 'mi cafe de las seis y media', texto: 'Para el correo del centro.', fraude: false, pistas: ['27 caracteres', 'Tiene sentido para quien la crea'], porque: 'Es larga y se recuerda. Mejor aún con un número intercalado.' },
          { canal: '🔑 Contraseña de ejemplo', de: '123456', texto: 'Para entrar «rápido» en la tablet.', fraude: true, pistas: ['Teclas seguidas'], porque: 'Está en todas las listas: cae al instante.' },
          { canal: '🔑 Contraseña de ejemplo', de: 'bufanda cometa tortuga montaña', texto: 'Para la cuenta de Drive.', fraude: false, pistas: ['Cuatro palabras sin relación', '30 caracteres'], porque: 'Larga y sin datos tuyos. Es el estilo que recomiendan las guías.' },
          { canal: '🔑 Contraseña de ejemplo', de: 'M4r14!', texto: 'Con símbolos, «muy segura».', fraude: true, pistas: ['Solo 6 caracteres', 'Cambios típicos: a por 4, i por 1'], porque: 'Corta y con trucos que los atacantes ya conocen.' },
          { canal: '🔑 Contraseña de ejemplo', de: 'Marta1985', texto: 'Nombre y año de nacimiento.', fraude: true, pistas: ['Nombre propio', 'Año de nacimiento'], porque: 'Datos que otras personas pueden saber o encontrar.' },
        ],
      }, { izq: 'mala', der: 'buena', btnIzq: '👎 Es mala', btnDer: '👍 Es buena', resIzq: 'una contraseña MALA.', resDer: 'una contraseña BUENA.', tarjeta: 'Clave ', finBien: 'Muy buen ojo: largas, con sentido y sin datos tuyos.', finMal: 'No pasa nada. Repite y fíjate en las pistas: longitud primero, datos personales fuera.' }),
      prompt: '',
    }),
  })
  .add({
    title: 'Completa la idea', obj: 1,
    text: '',
    ix: ix.fill('Completa lo que has aprendido sobre contraseñas buenas.',
      'Hoy lo que más cuenta en una contraseña es la [[longitud]]. Una buena idea es una [[frase]] de varias palabras, de al menos [[20]] caracteres, y una [[distinta]] para cada servicio.',
      ['símbolos', 'nombre', '8', 'misma'],
      fbk('¡Eso es! Longitud, frase, 20 caracteres y una distinta por servicio.', 'Revisa: ¿qué pesa más, los símbolos o la longitud? ¿Puede repetirse la misma clave?', 'Criterio de CCN-CERT BP/35 (2026) y NIST SP 800-63B-4 (2025).')),
  })
  .add({
    type: 'summary', title: 'Lo esencial de la lección 2',
    text: '- La longitud pesa más que los símbolos.\n- Una frase de paso: varias palabras con sentido para ti, de 20 caracteres o más.\n- Una clave distinta en cada servicio.\n- Nada de nombres, fechas, el centro o secuencias.\n- Nunca pruebes tu clave real en webs «medidoras».\n\n::: tip\nSi tu clave real la has usado en estos juegos o en una web, cámbiala.\n:::',
  })

/* ================================================================== LECCIÓN 3 */
const l3 = c.unit('Lección 3. No se comparten: turnos, tablet de planta y sala común', 'Tu usuario y tu clave son solo tuyos. Lo que se comparte es el archivo, no la clave. En equipos comunes, cada persona con su sesión, y la sesión se cierra al terminar.')
l3.add({ type: 'cover', title: 'No se comparten: turnos y tablet de planta', text: 'Lección 3', img: IMG('tablet_planta', 'Una tablet de planta que pide elegir quién eres, con tres usuarios individuales y un candado cada uno', { full: true }) })
  .add({
    title: 'Como el cepillo de dientes', obj: 2,
    text: 'Tu contraseña es **solo tuya**, como el cepillo de dientes. Si otra persona actúa con tu usuario, en el registro **aparecerá como si lo hubieras hecho tú**.\n\n::: case\nEn un expediente de la AEPD (PS/00587/2021), una profesional entró en la historia de una compañera con **sus propias claves** y sin relación asistencial: hubo apercibimiento. Tus accesos quedan registrados con tu nombre.\n:::',
    img: { src: 'assets/img/c2_kit_0502.png', alt: 'Cartel: las contraseñas, como el cepillo de dientes, son solo para tu uso, con un portátil, un candado y un escudo', caption: 'Imagen del Kit de concienciación de INCIBE', layout: 'right', width: 50 },
  })
  .add({
    title: '¿Se comparte o no?', obj: 2,
    text: 'Desliza a la derecha lo que **sí** se puede compartir y a la izquierda lo que **no**.',
    ix: ix.html({
      ...swipeLabeled({
        titulo: '', ayuda: 'Desliza a la derecha si se puede compartir y a la izquierda si NO se comparte. También puedes usar los botones.',
        cards: [
          { canal: '📌 Situación', de: 'Tu contraseña del programa de historias', texto: 'Una compañera de confianza la pide «solo por hoy».', fraude: true, pistas: ['Lo que haga quedará a tu nombre', 'Se pierde la trazabilidad'], porque: 'Ayúdala a pedir su propio usuario a tu responsable.' },
          { canal: '📌 Situación', de: 'El informe de turno', texto: 'Quieres que tu compañera lo lea.', fraude: false, pistas: ['Se comparte el archivo', 'No la clave'], porque: 'Se comparte el archivo, con enlace restringido a ella. Nunca tu clave.' },
          { canal: '📌 Situación', de: 'El código que te llega al móvil', texto: 'Te lo pide «informática» por teléfono.', fraude: true, pistas: ['Es solo tuyo', 'Ningún servicio legítimo lo pide'], porque: 'Cuelga y avisa a tu responsable.' },
          { canal: '📌 Situación', de: 'El protocolo de limpieza de la planta', texto: 'No contiene datos de personas.', fraude: false, pistas: ['Sin datos personales'], porque: 'Se puede compartir con el equipo con el permiso adecuado.' },
          { canal: '📌 Situación', de: 'La clave de la tablet de planta', texto: 'Escrita en un papel pegado «para el turno de noche».', fraude: true, pistas: ['Un papel a la vista', 'Una clave común'], porque: 'Mejor un usuario por persona. Una clave pegada la ve cualquiera.' },
          { canal: '📌 Situación', de: 'Tu PIN', texto: 'Un familiar de un residente te pide que se lo prestes para «mirar algo».', fraude: true, pistas: ['Una visita no es personal del centro'], porque: 'Tu usuario y tu PIN abren datos de salud. No se prestan a nadie.' },
        ],
      }, { izq: 'no se comparte', der: 'se puede compartir', btnIzq: '🚫 No se comparte', btnDer: '✅ Se puede', resIzq: 'algo que NO se comparte.', resDer: 'algo que se puede compartir.', tarjeta: 'Situación ', finBien: 'Muy bien: se comparten archivos con permiso, nunca claves.', finMal: 'Repite y fíjate: ¿es una clave o un código (no se comparte) o un archivo sin datos (sí, con permiso)?' }),
      prompt: '',
    }),
  })
  .add({
    title: 'Te piden tu usuario', obj: 2,
    text: 'Es la noche. Una compañera te pide tu usuario. Decide tú.',
    ix: ix.html({
      est_seconds: 240, ...W.chatStory({
        contacto: { nombre: 'Rocío · turno de tarde', emoji: '🧑‍⚕️', sub: 'en la sala de enfermería' },
        nodos: {
          n1: { msgs: [['sys', 'Son las 22:50. Estás en la tablet de planta.'], ['them', 'Oye, aún no me ha llegado mi usuario nuevo y tengo que anotar una toma. ¿Me dejas el tuyo un momento? Solo hoy, te lo prometo.']], choices: [
            { t: 'Claro, te lo digo: eres de confianza', next: 'bad1', q: 'bad', fb: 'La confianza no cambia lo que pasa en el registro.' },
            { t: 'Entra con mi sesión, yo me aparto', next: 'bad1', q: 'bad', fb: 'Lo que hagas quedará a tu nombre… y al mío.' },
            { t: 'Te creo, pero no puedo. Aviso a la supervisora para que te den tu usuario ya', next: 'n2', q: 'good', fb: 'Eso es: no se presta y se resuelve el problema de fondo.' },
          ] },
          bad1: { msgs: [['sys', 'A la mañana siguiente, el registro de accesos muestra una anotación hecha con TU usuario.']], fin: { tipo: 'bad', titulo: 'Tu nombre en el registro', texto: 'Quedó escrito a tu nombre algo que tú no hiciste. Lo mejor es no prestar nunca el usuario y avisar a tu responsable para que lo dé de alta.' } },
          n2: { msgs: [['them', 'Vale, pero el residente de la 12 necesita su toma ahora y no quiero dejarlo sin anotar.']], choices: [
            { t: 'Te presto mi sesión solo para esa toma', next: 'bad1', q: 'bad', fb: 'Sigue siendo mi usuario: aparecería a mi nombre.' },
            { t: 'Anótala en el papel de planta y la pasas luego con tu usuario, cuando te lo den', next: 'good', q: 'good', fb: 'Se atiende al residente y cada anotación queda con su autora.' },
            { t: 'Yo anoto lo que me digas con mi usuario', next: 'mid', q: 'mid', fb: 'Mejor no: figuraría a mi nombre algo que no he hecho.' },
          ] },
          mid: { msgs: [['sys', 'Funciona, pero en el registro consta que la toma la hiciste tú.']], fin: { tipo: 'mid', titulo: 'Casi', texto: 'Lo importante era atender al residente, bien. Pero el registro de cada persona debe ser suyo: se hace con su propio usuario.' } },
          good: { msgs: [['them', 'Tienes razón. Hablo con la supervisora ahora mismo.'], ['sys', 'En una hora, Rocío ya tiene su usuario.']], fin: { tipo: 'good', titulo: 'Tu usuario, solo tuyo', texto: 'Ayudar no es prestar la clave: es hacer que cada persona tenga la suya.' } },
        },
      }),
      prompt: '',
    }),
  })
  .add({
    title: 'Encuentra los fallos', obj: 2,
    text: '',
    ix: ix.hotspots('assets/img/c2_sala_enfermeria.svg', 'Sala de enfermería con un portátil con sesión abierta, una nota con una clave, una tablet sin bloqueo, un cartel con usuario común, un reloj y un móvil bloqueado', [
      { x: 35.6, y: 32.2, w: 32.2, h: 37.8, label: 'Portátil con la sesión abierta', correct: true, feedback: 'La sesión de Marta sigue abierta con nadie delante: cualquiera actuaría a su nombre. Hay que bloquear (Win + L) o cerrar sesión.' },
      { x: 70, y: 54.4, w: 13.1, h: 20.6, label: 'Post-it con una clave', correct: true, feedback: 'Una clave escrita y a la vista la lee cualquiera que pase.' },
      { x: 5.6, y: 56.1, w: 24.7, h: 27.8, label: 'Tablet sin bloqueo', correct: true, feedback: 'Muestra la ficha de un residente sin pedir nada: debe bloquearse sola y pedir identificarse.' },
      { x: 72.8, y: 10, w: 23.1, h: 26.1, label: 'Cartel con usuario y clave comunes', correct: true, feedback: 'Un usuario común impide saber quién hizo qué. Mejor un usuario por persona.' },
      { x: 86.1, y: 56.7, w: 9.1, h: 27.8, label: 'Móvil bloqueado', correct: false, feedback: 'Este móvil está bloqueado: está bien.' },
      { x: 9.4, y: 13.9, w: 10.9, h: 19.4, label: 'Reloj de pared', correct: false, feedback: 'Un reloj no es un fallo de seguridad.' },
    ], 'Toca los **4 fallos de seguridad** de esta sala de enfermería de noche.', fbk('¡Bien visto! Esos cuatro fallos son habituales. Corregirlos es fácil.', 'Mira de nuevo: busca claves a la vista, sesiones abiertas y equipos sin bloqueo.', 'Quien deja una clave a la vista o la sesión abierta no suele ser descuidado: suele tener prisa. Por eso conviene que todo el equipo lo vigile.'), { scored: true }),
  })
  .add({
    title: 'Tablet abierta a las 3:00', obj: 2,
    text: '',
    ix: ix.scenario('A las 3:00 has atendido a una residente que se encontraba mal y tienes que anotarlo. La tablet de planta sigue abierta con la sesión de Marta, del turno anterior.', '¿Qué haces para anotarlo?', [
      ['Anoto la incidencia en esa sesión: es lo más rápido', false, 'Quedaría registrado a nombre de Marta, que ni estaba.'],
      ['Cierro la sesión de Marta, entro con mi usuario, anoto, y aviso a Marta y a supervisión de que la tablet estaba abierta', true, 'Correcto: cada anotación con su autora, y se corrige el fallo sin culpar.'],
      ['Dejo la tablet como está y lo apunto en un post-it', false, 'Un papel con datos de salud a la vista es otro riesgo.'],
      ['Uso la clave de Marta, que está apuntada en un cajón', false, 'Una clave apuntada no autoriza a usarla: sigue siendo la de Marta.'],
    ], fbk('¡Eso es! Tu usuario, tu anotación; y se avisa para que no se repita.', 'No: lo que hagas con la sesión de otra persona queda a su nombre.', 'En equipos compartidos: cierra la sesión al terminar el turno, no solo bloquees.')),
  })
  .add({
    type: 'summary', title: 'Lo esencial de la lección 3',
    text: '- Tu usuario y tu clave son solo tuyos: no se prestan, ni «solo por hoy».\n- Si otra persona los usa, lo hecho queda a tu nombre.\n- Se comparte el archivo, con permiso; nunca la clave.\n- En la tablet de planta: cada persona con su sesión, y se cierra al terminar el turno.\n\n::: fact\nLa AEPD cita entre las conductas a evitar «compartir claves y contraseñas» y dejar el ordenador accesible a cualquiera.\n:::',
  })

/* ================================================================== LECCIÓN 4 */
const l4 = c.unit('Lección 4. Segundo cerrojo, llaves de acceso y gestor de contraseñas', 'La verificación en dos pasos pone un segundo cerrojo a tu cuenta. El código es solo tuyo. Un gestor guarda tus claves con una sola contraseña maestra, larga y tuya.')
l4.add({ type: 'cover', title: 'Segundo cerrojo y gestor de claves', text: 'Lección 4' })
  .add({
    title: 'El segundo cerrojo', obj: 3,
    text: 'La contraseña es la llave. La **verificación en dos pasos** es el segundo cerrojo: aunque alguien tenga tu clave, **no entra sin tu móvil** (algo que tienes) o tu huella (algo que eres). La verás también como «2FA» o «segundo factor»: es lo mismo.\n\n::: warn\nEl código que te llega es **solo tuyo**. Ningún servicio legítimo lo pide por correo, SMS o teléfono (CCN-CERT).\n:::',
    img: IMG('dos_pasos', 'Un portátil que ya tiene la contraseña y un móvil que pide confirmar: dos cerrojos', { layout: 'top', full: true }),
  })
  .add({
    title: 'Actívala paso a paso', obj: 3,
    text: '',
    ix: ix.html({ ...twoStepSim(), prompt: '' }),
  })
  .add({
    title: 'Qué método elegir', obj: 3,
    text: 'Todos los métodos son mejores que ninguno. Toca cada uno para ver cuándo usarlo.',
    ix: ix.tabs([
      ['Aviso en el móvil', 'Te llega un aviso y tocas «Sí, soy yo». Es el más cómodo y el que Google recomienda: tocar es más fácil que copiar un código.\n\n**Regla:** si te llega un aviso y no has iniciado sesión tú, di **«No»** y avisa a tu responsable.'],
      ['App autenticadora', 'Una app del móvil te da un código de 6 cifras que **cambia cada 30 segundos**. Funciona sin cobertura.\n\nAntes de cambiar de móvil, pasa la app al nuevo. **Nunca des ese código**.'],
      ['Llave física', 'Una pequeña llave (USB o NFC) que conectas o acercas. Es la más resistente al *phishing*. Google Workspace la llama la forma más segura.\n\nTiene un precio y hay que cuidarla: se decide en el centro.'],
      ['Mensaje SMS', 'Te llega un código por mensaje. Es **la opción menos recomendable**: se puede interceptar con el llamado *SIM swapping* (CCN-CERT).\n\nSigue siendo mejor que no tener segundo paso.'],
      ['Llaves de acceso', 'En inglés *passkeys*. Entras con tu **huella, cara o PIN del móvil**, sin escribir contraseña: no hay clave que robar ni que dar por error. No todos los servicios las admiten aún.\n\n**Ojo:** Google avisa de no crearlas en un dispositivo compartido, como la tablet de planta: quien lo desbloquee podría entrar en tu cuenta.'],
      ['Códigos de respaldo', 'Códigos de un solo uso por si pierdes el móvil. **No** los guardes en capturas de pantalla ni en el correo: un lugar seguro, como el gestor de contraseñas o un papel bajo llave en casa. No los des a nadie.'],
    ]),
  })
  .add({
    title: 'La caja fuerte de claves', obj: 1,
    text: 'Un **gestor de contraseñas** es una caja fuerte digital. Guarda todas tus claves y se abre con **una sola contraseña maestra**. Crea claves aleatorias, las rellena por ti y avisa si alguna es débil o está filtrada.\n\n- La maestra: una frase larga, solo tuya.\n- En el trabajo lo decide la empresa: no instales uno propio en el PC del centro sin permiso.\n- Mejor que un Excel, las notas del móvil o un WhatsApp a ti mismo.',
    img: IMG('gestor', 'Una caja fuerte que guarda las claves de varios servicios y se abre con una sola contraseña maestra', { layout: 'top', full: true }),
  })
  .add({
    title: 'El gestor en vídeo', obj: 1,
    text: '',
    video: { id: 'Fd87JLBz5Ac', caption: 'Ventajas de utilizar un gestor de contraseñas · Oficina de Seguridad del Internauta (INCIBE), unos 3 minutos', transcript: 'Vídeo de la Oficina de Seguridad del Internauta (INCIBE), de unos 3 minutos, titulado «Ventajas de utilizar un gestor de contraseñas». Explica por qué conviene usar un gestor para guardar las claves de distintos servicios. (Resumen basado en el título; transcripción pendiente de contrastar viendo el vídeo.)' },
    notes: ['Verificar la transcripción viendo el vídeo (Fd87JLBz5Ac). El dossier solo confirma título, canal y duración (174 s).'],
  })
  .add({
    title: 'Un aviso de la dirección', obj: 3,
    text: '',
    ix: ix.scenario('Eres de enfermería. Te llega al correo del centro un aviso que parece de la dirección: «Verifica tu contraseña del programa de historias pulsando aquí o tu cuenta se bloqueará hoy». Al pulsar te pedirían usuario, contraseña y el código del móvil.', '¿Qué haces?', [
      ['Pulso y lo relleno todo: no quiero que me bloqueen', false, 'Entregarías tu clave y tu código a un desconocido.'],
      ['No pulso nada, lo reenvío a informática y, si dudo, llamo yo al centro por teléfono', true, 'Correcto: se verifica por otro canal, sin pulsar.'],
      ['Pulso, pero solo pongo el usuario, no la clave', false, 'Pulsar ya es el primer paso del engaño.'],
      ['Se lo reenvío a mis compañeras para que estén alerta', false, 'Reenviar el enlace a más gente extiende el riesgo. Se avisa a informática.'],
    ], fbk('¡Bien! Sin pulsar, avisar y verificar por otro canal.', 'No: nadie legítimo te pide la clave y el código por correo.', 'La verificación en dos pasos solo protege si el código no se entrega a nadie.')),
  })
  .add({
    title: 'Une cada concepto', obj: 3,
    text: '',
    ix: ix.match('Une cada concepto con lo que significa.', [
      ['Verificación en dos pasos', 'Un segundo cerrojo: la clave y algo que tienes o eres'],
      ['Gestor de contraseñas', 'Caja fuerte con una sola contraseña maestra'],
      ['Llave de acceso', 'Entras con huella, cara o PIN, sin escribir clave'],
      ['Código de respaldo', 'De un solo uso, por si pierdes el móvil'],
      ['Código que llega al móvil', 'Solo tuyo: no se da a nadie'],
    ], fbk('¡Todo emparejado!', 'Repasa: el código que llega nunca se da, y la caja fuerte se abre con una sola maestra.', 'Resumen: dos cerrojos, una caja fuerte y ningún código compartido.')),
  })
  .add({
    type: 'summary', title: 'Lo esencial de la lección 4',
    text: '- Verificación en dos pasos: el segundo cerrojo.\n- Mejor un aviso en el móvil, una app o una llave física que un SMS.\n- El código que te llega es solo tuyo.\n- Un aviso de inicio de sesión que no has pedido: «No» y avisa.\n- Las llaves de acceso no se crean en dispositivos compartidos.\n- Un gestor: una sola maestra, larga y tuya.',
  })

/* ================================================================== LECCIÓN 5 */
const l5 = c.unit('Lección 5. Cuenta del centro, permisos mínimos y cierre de sesión', 'Tu cuenta del centro vale más que una personal. Comparte archivos con acceso restringido, ve solo lo que necesitas y cierra la sesión en los equipos comunes.')
l5.add({ type: 'cover', title: 'Cuenta del centro, permisos y cierre de sesión', text: 'Lección 5' })
  .add({
    title: 'Compartir archivos, no claves', obj: 4,
    text: 'Tu cuenta del centro (correo, Drive, documentos) abre datos de residentes. En Drive hay dos modos de compartir:\n- **Restringido**: solo las personas que tú añades.\n- **Cualquier persona con el enlace**: entra quien lo tenga, aunque no tenga cuenta.\n\nCon datos de residentes: siempre **Restringido** y a personas concretas. Los roles son **Lector** (ve), **Comentador** (comenta) y **Editor** (cambia y comparte). Revisa «Personas con acceso» y retira lo que ya no haga falta.',
    img: IMG('drive', 'Dos tarjetas: Restringido, solo personas concretas, frente a Cualquiera con el enlace, que cualquiera puede abrir', { layout: 'top', full: true }),
  })
  .add({
    title: 'Un listado para la gestoría', obj: 4,
    text: '',
    ix: ix.scenario('Eres de administración. Necesitas pasar a la gestoría un listado con datos de residentes. Ya tienes su correo.', '¿Cómo lo compartes?', [
      ['Cualquiera con el enlace, como Editor, y se lo mando por WhatsApp', false, 'El enlace puede acabar en manos de cualquiera, y como Editor podría cambiarlo.'],
      ['Lo subo a Drive, lo comparto como Restringido solo con su correo, como Lector, y quito el acceso cuando terminen', true, 'Correcto: persona concreta, permiso mínimo y retirada al acabar.'],
      ['Lo dejo en una carpeta abierta a todo el equipo', false, 'No todo el equipo necesita ver datos de salud.'],
      ['Se lo envío con la clave de mi cuenta en el mismo correo', false, 'Nunca se manda una clave, y menos junto al archivo.'],
    ], fbk('¡Eso es! Restringido, persona concreta, Lector y retirada al terminar.', 'No: con datos de residentes, siempre acceso restringido.', 'Se comparte el archivo, no la clave; y con el permiso mínimo.')),
  })
  .add({
    title: 'Quién ve qué', obj: 4,
    text: 'El **mínimo privilegio** es que cada puesto vea solo lo que necesita. Esta tabla es una **propuesta orientativa**: cada centro debe validarla con su responsable de protección de datos (DPD).',
    ix: ix.accordion([
      ['Gerocultor/a', '- **Historia y cuidados:** solo los residentes de su unidad, los datos necesarios para sus cuidados.\n- **Datos administrativos:** no.\n- **Drive:** su carpeta de planta (lector o comentador).\n- **Ajustes y usuarios:** no.'],
      ['Auxiliar de enfermería y enfermería', '- **Historia y cuidados:** su unidad; enfermería, con más funciones clínicas.\n- **Datos administrativos:** no.\n- **Drive:** carpeta de planta y protocolos (carpeta clínica, en enfermería).\n- **Ajustes y usuarios:** no.'],
      ['Administración', '- **Historia y cuidados:** solo lo necesario para sus funciones (por ejemplo, contacto y facturación).\n- **Datos administrativos y contables:** sí.\n- **Drive:** carpetas administrativas.\n- **Ajustes y usuarios:** no.'],
      ['Supervisión', '- **Historia y cuidados:** ampliado a su ámbito de coordinación.\n- **Datos administrativos:** parcial.\n- **Drive:** carpetas de turnos.\n- **Ajustes y usuarios:** solicita altas y bajas.'],
      ['Dirección', '- **Historia y cuidados:** según su función y la necesidad de conocer.\n- **Datos administrativos:** sí.\n- **Drive:** carpetas de gestión.\n- **Ajustes y usuarios:** aprueba altas y bajas. Cuando alguien se va, retira sus accesos y cierra sus sesiones.'],
      ['Mantenimiento', '- **Historia y cuidados:** no.\n- **Datos administrativos:** no.\n- **Drive:** su carpeta de mantenimiento.\n- **Ajustes y usuarios:** no. Cambia las contraseñas por defecto de los equipos.'],
      ['Informática / administrador', '- **Historia y cuidados:** sin uso diario; acceso técnico.\n- **Datos administrativos:** no.\n- **Drive:** administración técnica.\n- **Ajustes y usuarios:** sí, con una cuenta separada de la de uso diario y con verificación en dos pasos.'],
    ]),
  })
  .add({
    title: 'Permiso mínimo por puesto', obj: 4,
    text: '',
    ix: ix.match('Une cada puesto con el acceso mínimo que le corresponde (propuesta orientativa).', [
      ['Gerocultor/a', 'Solo los residentes de su unidad'],
      ['Administración', 'Contacto y facturación, no la historia clínica'],
      ['Mantenimiento', 'Su carpeta, sin datos de salud'],
      ['Dirección', 'Según su función; aprueba altas y bajas'],
      ['Informática', 'Acceso técnico con cuenta separada'],
    ], fbk('¡Todo en su sitio! Cada puesto, lo mínimo que necesita.', 'Piensa: ¿qué necesita ese puesto para hacer su trabajo, y nada más?', 'Si ves más de lo que necesitas: avísalo y no lo uses. Si cambias de puesto, pide actualizar tu perfil.')),
  })
  .add({
    title: 'El ordenador de la sala común', obj: 4,
    text: 'En un aparato compartido o que no es tuyo, usa una **ventana privada** o un perfil de invitado y cierra sesión al acabar. En tu cuenta puedes ver y cerrar sesiones en «Tus dispositivos».',
    ix: ix.scenario('Acabas de usar el ordenador de la sala común, donde también entran familiares y visitas. Entraste en tu cuenta del centro.', '¿Qué haces al terminar?', [
      ['Cierro mi sesión y no dejo guardada mi clave en el navegador', true, 'Correcto: al terminar, se cierra la sesión.'],
      ['Bajo la pantalla y ya', false, 'La sesión sigue abierta: quien suba la pantalla entra como tú.'],
      ['Marco «No volver a preguntar en este dispositivo»', false, 'En equipos compartidos nunca se marca: dejaría pasar a la siguiente persona.'],
      ['Dejo una nota con mi clave para el siguiente turno', false, 'Una clave no se pasa a nadie, y menos escrita.'],
    ], fbk('¡Bien! Cerrar sesión, y nada de guardar claves en equipos comunes.', 'No: en un equipo compartido la sesión se cierra, no se deja abierta.', 'Bloquear (Win + L) sirve para un momento; al terminar el turno, cierra la sesión.')),
  })
  .add({
    type: 'summary', title: 'Lo esencial de la lección 5',
    text: '- Con datos de residentes: Drive en modo **Restringido**, a personas concretas, rol Lector si basta.\n- Revisa «Personas con acceso» y retira lo que ya no haga falta.\n- Mínimo privilegio: cada puesto ve solo lo que necesita (propuesta a validar con el DPD).\n- Equipos comunes: ventana privada o invitado, y cerrar sesión al acabar.\n- Nada de «No volver a preguntar» ni claves guardadas en el navegador.',
  })

/* ================================================================== LECCIÓN 6 */
const l6 = c.unit('Lección 6. Si sospechas que te han robado la clave, y repaso', 'Si sospechas, avisa primero y cambia después. Repasa las reglas de oro y firma tu compromiso.')
l6.add({ type: 'cover', title: 'Si sospechas, y repaso final', text: 'Lección 6 · Repaso y reto', img: IMG('robada', 'Un móvil con un aviso de inicio de sesión sospechoso y tres pasos: avisar, cambiar la clave y proteger la cuenta', { full: true }) })
  .add({
    title: 'Señales y primeros pasos', obj: 5,
    text: 'Equivocarse es humano: lo grave es no avisar. Toca cada apartado.',
    ix: ix.accordion([
      ['Cómo darte cuenta', '- No puedes entrar con tu clave de siempre.\n- Te llegan avisos de inicio de sesión que no has hecho.\n- Aparecen correos enviados que no recuerdas.\n- Un compañero ve cambios que «tú» hiciste y no hiciste.'],
      ['Qué hacer ya', '1. **Avisa a tu responsable o a informática enseguida**: el centro debe valorar si hay una brecha de datos.\n2. Cambia la clave desde un dispositivo de confianza y activa la verificación en dos pasos.\n3. Cambia también las cuentas donde repetías esa clave.\n4. Guarda pruebas (capturas) y, si hay fraude, denuncia.'],
      ['Comprobar si se ha filtrado', 'INCIBE recomienda comprobar si tu **correo** aparece en filtraciones en *Have I Been Pwned* (haveibeenpwned.com), un servicio gratuito.\n\n**Nunca escribas tu contraseña real** en webs de terceros. Con el correo del trabajo, avisa antes al centro.'],
      ['¿Hay que cambiarla cada mes?', 'No. Las guías actuales (CCN-CERT, NIST) dicen que **no hace falta cambiarla cada poco**, sino cuando hay sospecha de que otra persona la conoce. Si tu centro tiene su propia norma (por ejemplo, una vez al año), síguela.'],
    ]),
  })
  .add({
    title: 'La llamada de «soporte»', obj: 5,
    text: 'Suena el teléfono del control. Decide tú.',
    ix: ix.html({
      est_seconds: 240, ...W.chatStory({
        estilo: 'llamada', contacto: { nombre: 'Soporte técnico', emoji: '🎧', sub: 'llamada entrante · número desconocido' },
        nodos: {
          n1: { msgs: [['sys', 'Suena el teléfono del control de enfermería.'], ['them', 'Buenas, soy Pablo, de soporte informático. Hemos detectado accesos raros en tu cuenta del programa de historias. Para protegerla necesito que me digas ahora tu usuario y tu contraseña.']], choices: [
            { t: 'Se la digo, no quiero que me roben la cuenta', next: 'bad', q: 'bad', fb: 'Acabas de entregar tu llave a un desconocido.' },
            { t: 'Dudo, pero le pregunto cómo puedo estar seguro de que es de informática', next: 'n2', q: 'mid', fb: 'Hacer preguntas es buena idea, pero aún sigues en la llamada.' },
            { t: 'Cuelgo y aviso a mi responsable', next: 'good', q: 'good', fb: 'Nadie legítimo te pide tu clave por teléfono.' },
          ] },
          n2: { msgs: [['them', 'Es urgente. Si no, se bloquea tu cuenta. Entonces dime solo el código que te va a llegar al móvil, nada más.']], choices: [
            { t: 'Está bien, te lo digo', next: 'bad', q: 'bad', fb: 'Ese código es el segundo cerrojo: dárselo es abrirle la puerta.' },
            { t: 'No. Cuelgo y aviso a mi responsable', next: 'good', q: 'good', fb: 'Eso es: ningún servicio legítimo lo pide por teléfono.' },
          ] },
          bad: { msgs: [['sys', 'La llamada se corta. Minutos después te llega un aviso de inicio de sesión que no has hecho.']], fin: { tipo: 'bad', titulo: 'Han entrado en tu cuenta', texto: 'Qué hacer ahora: avisa a tu responsable o a informática enseguida y cambia tu clave desde un dispositivo de confianza.' } },
          good: { msgs: [['sys', 'Llamada finalizada. Avisas a tu responsable, que lo comunica a informática.']], fin: { tipo: 'good', titulo: '¡Bien hecho!', texto: 'Colgar y avisar es lo correcto. Con la duda, avisa siempre: nunca es una molestia.' } },
        },
      }),
      prompt: '',
    }),
  })
  .add({
    title: 'Qué hago, paso a paso', obj: 5,
    text: '',
    ix: ix.sort('Sospechas que alguien conoce tu contraseña del programa de historias. Ordena lo que haces, desde lo primero.', [
      'Aviso a mi responsable o a informática, enseguida',
      'Cambio la contraseña desde un dispositivo de confianza',
      'Cierro las sesiones abiertas y activo la verificación en dos pasos',
      'Cambio las demás cuentas donde repetía esa clave',
      'Guardo pruebas (capturas) y, si hay fraude, denuncio',
    ], fbk('¡Orden correcto! Avisar primero es lo más importante.', 'Casi. Lo primero siempre es avisar: el centro tiene que saberlo ya.', 'INCIBE (Me robaron la cuenta) y CCN-CERT: renovar inmediatamente si hay sospecha, activar 2FA y revisar el resto de cuentas.')),
  })
  .add({
    title: 'El 017, tu ayuda', obj: 5,
    text: 'El **017** es la Línea de Ayuda en Ciberseguridad de INCIBE: **gratuita y confidencial**. También atiende por WhatsApp (900 116 117) y Telegram (@INCIBE017).',
    video: { id: '8eYY8kvd0l8', caption: 'Línea 017 de INCIBE · Tu ayuda en ciberseguridad', transcript: 'Vídeo de INCIBE que presenta la Línea de Ayuda en Ciberseguridad 017, un servicio de ayuda en ciberseguridad para la ciudadanía. (Resumen basado en el título; transcripción pendiente de contrastar viendo el vídeo.)' },
    notes: ['Verificar la transcripción y la duración viendo el vídeo (8eYY8kvd0l8): el dossier no los pudo comprobar.'],
  })
  .add({
    title: 'Repaso: reglas de oro', obj: 1,
    text: '',
    ix: ix.flash([
      ['Tu usuario y tu clave', 'Son tuyos. No se prestan, ni «solo por hoy».'],
      ['Frase larga', 'Frase de paso de 20 caracteres o más, y una distinta para cada servicio.'],
      ['Segundo cerrojo', 'Verificación en dos pasos en la cuenta del centro y en tu correo.'],
      ['El código del móvil', 'Nunca se da a nadie, ni por teléfono ni por mensaje.'],
      ['Fin de turno', 'Cierra sesión. Si te levantas un momento, bloquea (Win + L).'],
      ['Archivos, no claves', 'Se comparte el archivo, con Drive en modo Restringido.'],
      ['Solo lo necesario', 'Miras solo lo que necesitas para tu trabajo.'],
      ['Ante la duda', 'Avisa ya a tu responsable. Y si hace falta, llama al 017.'],
    ], 'Toca cada tarjeta, lee la regla y pasa a la siguiente.'),
  })
  .add({
    title: 'Rosco de repaso', obj: 1,
    text: '',
    ix: ix.az([
      ['Lo que más cuenta en una contraseña', 'Longitud'],
      ['Contraseña de varias palabras con sentido', 'Frase'],
      ['Caja fuerte digital de claves', 'Gestor'],
      ['Tu nombre en la puerta: el ...', 'Usuario'],
      ['Segundo cerrojo: verificación en dos ...', 'Pasos'],
      ['Contraseña única que abre el gestor', 'Maestra'],
      ['Rastro de quién hizo qué, que se pierde si se comparte la clave', 'Trazabilidad'],
      ['Al terminar el turno hay que cerrar la ...', 'Sesión'],
      ['Drive: «Cualquiera con el ...»', 'Enlace'],
      ['Número de 6 cifras que llega al móvil y no se da a nadie', 'Código'],
      ['Códigos de ... por si pierdes el móvil', 'Respaldo'],
      ['Programa donde no debes guardar tu clave en un equipo compartido', 'Navegador'],
    ], 'Rosco: escribe la respuesta que empieza por la letra, o pasa palabra.'),
  })
  .add({
    title: 'Mi compromiso', obj: 1,
    text: 'Para terminar, tu compromiso. Marca lo que vas a hacer a partir de hoy.',
    ix: ix.html({
      est_seconds: 75, ...W.pledge({
        titulo: 'Mis ocho reglas de oro', intro: 'Marca lo que te comprometes a hacer.',
        items: ['Mi usuario y mi clave no se prestan a nadie', 'Mi clave será una frase larga y distinta en cada servicio', 'Activaré la verificación en dos pasos', 'Nunca daré un código que me llegue al móvil', 'Al terminar el turno, cerraré sesión; si me levanto, bloquearé', 'Compartiré archivos, no claves, y con Drive en modo Restringido', 'Miraré solo lo que necesito para mi trabajo', 'Ante la duda, avisaré enseguida a mi responsable'],
        minimo: 6, final: '¡Compromiso firmado! Gracias por cuidar también de los datos de las personas que cuidas.',
      }),
      prompt: '',
    }),
  })
  .add({
    type: 'summary', title: 'Lo esencial del curso',
    text: '- Tu usuario y tu clave son tuyos: no se prestan.\n- Una frase larga y distinta en cada servicio; un gestor si te ayuda.\n- Verificación en dos pasos, y el código no se da nunca.\n- Archivos con acceso restringido, mínimo permiso, y cerrar sesión en equipos comunes.\n- Si sospechas: **avisa primero**, cambia después. El 017 te ayuda.\n\n::: tip\nLas recomendaciones por puesto y la tabla de permisos son propuestas del curso: tu centro y su responsable de protección de datos tienen la última palabra.\n:::',
  })

/* ------------------------------------------------------------------ ASSETS DEL KIT */
c.assetFile('assets/img/c2_kit_0502.png', KIT)

/* ------------------------------------------------------------------ GLOSARIO Y BIBLIOGRAFÍA */
c.glossary('Usuario', 'Tu nombre en el sistema. Dice quién eres; la contraseña lo demuestra.')
  .glossary('Contraseña', 'La clave secreta con la que demuestras que eres tú. Es personal e intransferible.')
  .glossary('Frase de paso', 'Contraseña formada por varias palabras con sentido para ti, de 20 caracteres o más. Larga y fácil de recordar.')
  .glossary('Verificación en dos pasos (2FA)', 'Un segundo cerrojo: además de la clave, algo que tienes (el móvil) o que eres (la huella). También se llama «segundo factor».')
  .glossary('Aviso en el móvil', 'Método de segundo paso: te llega un aviso y tocas «Sí, soy yo». Si no has iniciado sesión tú, se contesta «No».')
  .glossary('Llave de acceso (passkey)', 'Forma de entrar con huella, cara o PIN del móvil sin escribir contraseña. No hay clave que robar. No se crea en dispositivos compartidos.')
  .glossary('Gestor de contraseñas', 'Caja fuerte digital que guarda tus claves y se abre con una sola contraseña maestra.')
  .glossary('Contraseña maestra', 'La única clave que abre el gestor. Tiene que ser una frase larga y solo tuya.')
  .glossary('Credential stuffing', 'Ataque automático que prueba en muchos servicios las claves robadas de otro. Por eso no se repite la misma clave.')
  .glossary('Phishing', 'Mensaje o correo falso que intenta que entregues tu clave o pulses un enlace.')
  .glossary('SIM swapping', 'Engaño en el que alguien consigue una copia de tu tarjeta SIM para recibir tus SMS y los códigos que llegan por ahí.')
  .glossary('Códigos de respaldo', 'Códigos de un solo uso para entrar si pierdes el móvil. Se guardan en un lugar seguro, no en capturas ni en el correo.')
  .glossary('Trazabilidad', 'Poder saber quién hizo qué y cuándo. Se pierde si varias personas comparten un usuario.')
  .glossary('Mínimo privilegio', 'Cada persona ve y hace solo lo que necesita para su trabajo, y nada más.')
  .glossary('Cierre de sesión', 'Salir de tu cuenta para que nadie más pueda usarla. En equipos compartidos, al terminar el turno.')

c.bib('CCN-CERT (2026). Uso y gestión de contraseñas (CCN-CERT BP/35). Centro Criptológico Nacional.', 'https://angeles.ccn-cert.cni.es/es/docman/documentos-publicos/informes-de-buenas-practicas/432-ccn-cert-bp-35-informe-contrasenas/file')
  .bib('NIST (2025). SP 800-63B-4. Digital Identity Guidelines: Authentication and Authenticator Management. National Institute of Standards and Technology.', 'https://pages.nist.gov/800-63-4/sp800-63b.html')
  .bib('OSI-INCIBE (2019). Típicos errores que cometemos al usar nuestras contraseñas, y cómo corregirlos. INCIBE.', 'https://www.incibe.es/ciudadania/blog/tipicos-errores-que-cometemos-al-usar-nuestras-contrasenas-y-como')
  .bib('INCIBE (2020). Me robaron la cuenta, ¿qué hago? INCIBE.', 'https://www.incibe.es/ciudadania/blog/me-robaron-la-cuenta-que-hago')
  .bib('INCIBE (2026). Passkeys: inicia sesión sin contraseñas de forma segura. INCIBE.', 'https://www.incibe.es/ciudadania/blog/passkeys-inicia-sesion-sin-contrasenas-de-forma-segura')
  .bib('INCIBE (2019). Menos es más, controla el acceso a la información. INCIBE.', 'https://www.incibe.es/empresas/blog/menos-mas-controla-el-acceso-informacion')
  .bib('AEPD (s. f.). Guía para profesionales del sector sanitario. Agencia Española de Protección de Datos.', 'https://www.aepd.es/guias/guia-profesionales-sector-sanitario.pdf')
  .bib('Google (s. f.). Activar la verificación en dos pasos. Ayuda de la Cuenta de Google.', 'https://support.google.com/accounts/answer/185839?hl=es')
  .bib('Google (s. f.). Iniciar sesión con una llave de acceso. Ayuda de la Cuenta de Google.', 'https://support.google.com/accounts/answer/13548313?hl=es')
  .bib('Google (s. f.). Compartir archivos desde Google Drive. Ayuda de Google Drive.', 'https://support.google.com/drive/answer/2494822?hl=es')

/* ------------------------------------------------------------------ TEST FINAL */
c.finalTest('Test final: contraseñas y accesos', [
  ['Una tienda online ha sufrido una filtración y tu contraseña de allí es la misma que usas en el correo del centro. ¿Qué haces?', [
    ['Nada: es solo una tienda', false], ['Cambio solo la clave de la tienda', false],
    ['Cambio la clave del correo y de cualquier otra cuenta donde la repitiera, activo la verificación en dos pasos y aviso a mi responsable', true],
    ['Borro el correo de la tienda', false]],
    'Si repites claves, los atacantes prueban la filtrada en otros servicios (credential stuffing). Se cambian todas, se activa el segundo cerrojo y se avisa.', 0],
  ['Tu usuario y tu contraseña, en una residencia, sirven sobre todo para…', [
    ['Poder entrar más rápido', false], ['Que el centro sepa quién ha hecho cada acceso y proteger datos de salud', true],
    ['Que tus compañeras te puedan sustituir', false], ['Cumplir un trámite sin importancia', false]],
    'El usuario te identifica y la contraseña lo demuestra: de ahí la trazabilidad y la protección de datos de salud.', 0],
  ['¿Cuál de estas claves sería la mejor opción para tu cuenta del centro?', [
    ['Gerocultor1!', false], ['Ana1965*', false], ['bufanda gris sobre el piano viejo', true], ['P@ssw0rd!', false]],
    'La longitud pesa más que los símbolos: una frase de paso larga y sin datos tuyos gana a una clave corta con trucos (CCN-CERT BP/35).', 1],
  ['Hoy, ¿qué hace más difícil de adivinar una contraseña?', [
    ['Sustituir a por @ y e por 3', false], ['Que sea una frase larga y distinta en cada servicio', true],
    ['Incluir tu fecha de nacimiento', false], ['Cambiarla cada semana', false]],
    'Las guías actuales (CCN-CERT, NIST) dan prioridad a la longitud. Los cambios típicos de letras los conocen los atacantes y la fecha de nacimiento es previsible.', 1],
  ['Para abrir un gestor de contraseñas, lo más importante es…', [
    ['Que sea de pago', false], ['Una contraseña maestra larga y solo tuya', true], ['Apuntar la maestra en un papel junto al ordenador', false], ['Compartir el gestor con todo el turno', false]],
    'Si la contraseña maestra es débil, todo lo que guarda el gestor lo será. Y en el trabajo, lo decide el centro.', 1],
  ['Una compañera te pide tu usuario y clave «solo por hoy» porque aún no tiene los suyos. ¿Qué haces?', [
    ['Se los doy: es de confianza', false], ['No se los doy y aviso a mi responsable para que le den su usuario', true],
    ['Se los apunto en un papel', false], ['Se los doy y luego cambio la clave', false]],
    'Lo que haga con tu usuario quedará a tu nombre. Ayudar es conseguir que tenga el suyo.', 2],
  ['Terminas tu turno y la tablet de planta sigue abierta con la sesión de otra persona. ¿Qué haces?', [
    ['La sigo usando para ir más rápido', false], ['Cierro su sesión, entro con la mía y aviso a esa persona o a supervisión', true],
    ['La dejo como está', false], ['Le pongo encima un papel que diga «ocupada»', false]],
    'Actuar con la sesión ajena haría que tus acciones queden a su nombre; dejarla abierta expone los datos.', 2],
  ['Te llaman diciendo ser de informática y te piden el código que acabas de recibir por SMS. ¿Qué haces?', [
    ['Se lo digo si suena educado', false], ['Se lo reenvío a un compañero', false], ['Cuelgo y aviso a mi responsable', true], ['Se lo digo, pero solo la mitad', false]],
    'Ningún servicio legítimo pide ese código por teléfono, correo o SMS. Es solo tuyo (CCN-CERT).', 3],
  ['¿Qué método de segundo paso es el menos recomendable?', [
    ['Una app autenticadora', false], ['Una llave de seguridad física', false], ['Códigos por SMS', true], ['Un aviso de confirmación en el móvil', false]],
    'El SMS puede interceptarse con el «SIM swapping». Sigue siendo mejor que no tener segundo paso, pero es el menos recomendable.', 3],
  ['Compartes con una gestoría un archivo con datos de residentes en Drive. ¿Qué ajuste eliges?', [
    ['Cualquier persona con el enlace, como Editor', false], ['Cualquier persona con el enlace, como Lector', false],
    ['Restringido, solo con su correo, como Lector', true], ['Se lo envío por WhatsApp con la clave de mi cuenta', false]],
    'Con datos de residentes: acceso restringido a una persona concreta y el permiso mínimo.', 4],
  ['Trabajas en administración. ¿A qué datos de salud de los residentes deberías tener acceso?', [
    ['A todos', false], ['Solo a los necesarios para tus funciones', true], ['A los de tu familia', false], ['A los que te pida un familiar', false]],
    'El personal administrativo accede solo a los datos necesarios (AEPD) y se aplica el mínimo privilegio.', 4],
  ['Sospechas que alguien conoce tu contraseña del programa de historias. Lo primero que haces es…', [
    ['Esperar a ver qué pasa', false], ['Comentarlo en el grupo de WhatsApp', false],
    ['Avisar a tu responsable o a informática y cambiar la clave desde un dispositivo de confianza', true], ['Cambiar solo tu nombre de usuario', false]],
    'Avisar enseguida es lo más importante. Después, nueva clave, verificación en dos pasos y revisar las cuentas con la misma clave. También puedes llamar al 017.', 5],
], 'Elige la mejor respuesta en cada situación. Todas son casos de tu día a día.')

await c.build()
