/**
 * Curso 5 — «Datos de las personas residentes: confidencialidad, fotos y brechas».
 *   node scripts/curso-ciberseguridad/run.mjs c5-datos-redes-brechas.mjs
 * Fuente única de datos: docs/curso-ciberseguridad/fuentes/05-datos-redes-incidentes.md
 */
import { CourseBuilder, ix, fbk } from './lib.mjs'
import * as W from './widgets.mjs'
import { swipeSiNo, semaforoDato, relojBrecha, detectivePerfil } from './c5-widgets.mjs'
import { svg, bg, person, icon, bubble, rect, circle, line, path, g, text, caption, C } from './svgkit.mjs'

const NAVY = '#234a8a'
const ROSE = '#F4D6D2'

const c = new CourseBuilder({
  id: 'cibersegsoc-c5-datos-brechas',
  identifier: 'CIBERSEG_C5',
  title: 'Datos de las personas residentes: confidencialidad, fotos y brechas',
  subtitle: 'Qué se puede decir, qué se puede publicar y qué hacer si algo sale mal',
  description: 'Curso práctico para el personal de centros sociosanitarios: datos de salud, necesidad de conocer, llamadas de familias, fotos y vídeos, redes sociales, brechas de datos (plazo de 72 horas) y protocolo de actuación. Pensado para hacerlo desde el móvil.',
  hours: 1.7,
  primary: NAVY,
  accent: ROSE,
  moduleTitle: 'Cuidar los datos de quienes cuidamos',
  scormTitle: 'Datos de residentes: confidencialidad, fotos y brechas',
  objectives: [
    'Distinguir datos personales y datos de salud y explicar por qué se protegen de forma reforzada.',
    'Aplicar la necesidad de conocer y el deber de confidencialidad con compañeros, familias y por teléfono.',
    'Decidir cuándo se puede hacer, guardar y publicar una foto o vídeo de una persona residente.',
    'Cuidar tus redes sociales y tu móvil para no exponer ni a las personas residentes ni al centro.',
    'Reconocer una brecha de datos y saber cuándo y a quién avisar (el plazo de las 72 horas).',
    'Aplicar el protocolo ante un incidente: parar, no borrar, avisar, contener y documentar.',
  ],
})

// ───────────────────────── Ilustraciones SVG ─────────────────────────
const W640 = 640, H360 = 360
const headBar = (x, y, w, fill, r = 18) => rect(x, y, w, 36, fill, { r }) + rect(x, y + 18, w, 18, fill, { r: 0 })

c.asset('assets/img/c5_portada.svg', svg(W640, H360,
  bg(W640, H360, ROSE, '#ffffff') +
  rect(60, 40, 200, 236, '#fff', { r: 16, stroke: NAVY, sw: 3 }) + headBar(60, 40, 200, NAVY, 16) +
  text(160, 64, 'FICHA', { size: 15, fill: '#fff', anchor: 'middle', weight: 800 }) +
  person(160, 146, { scale: 0.68, shirt: C.teal, hairStyle: 'bun', hair: '#a8a8a8' }) +
  rect(84, 224, 152, 9, C.line, { r: 4 }) + rect(84, 242, 110, 9, C.line, { r: 4 }) + rect(84, 260, 130, 9, C.line, { r: 4 }) +
  icon.lock(420, 128, 150, NAVY) + icon.shield(545, 96, 70, C.green) + icon.heart(335, 92, 40, C.red) +
  text(420, 236, 'Tus manos\nguardan secretos', { size: 26, weight: 800, anchor: 'middle', fill: NAVY, lh: 32 }) +
  caption(W640, H360, 'Los datos de las personas residentes son suyos', NAVY),
  'Una ficha de residente protegida por un candado'))

c.asset('assets/img/c5_ficha.svg', svg(W640, H360,
  bg(W640, H360, '#ffffff', ROSE) +
  rect(24, 14, 300, 326, '#fff', { r: 18, stroke: NAVY, sw: 3 }) + headBar(24, 14, 300, NAVY) +
  text(174, 39, 'FICHA DE RESIDENTE', { size: 15, fill: '#fff', anchor: 'middle', weight: 800 }) +
  person(98, 116, { scale: 0.6, shirt: C.teal, hairStyle: 'bun', hair: '#a8a8a8' }) +
  text(160, 104, 'Pilar R.\nHab. 14', { size: 18, weight: 800 }) +
  [['Foto y nombre', C.blue], ['Teléfono de su hija', C.blue], ['Medicación', C.red], ['Diagnóstico', C.red], ['Caídas este mes', C.red]]
    .map(([t, col], i) => { const y = 184 + i * 29; return rect(42, y, 264, 24, '#f2f6fb', { r: 8 }) + rect(42, y, 9, 24, col, { r: 4 }) + text(62, y + 17, t, { size: 14, weight: 700 }) }).join('') +
  circle(366, 62, 11, C.blue) + text(388, 69, 'Dato personal', { size: 20, weight: 800 }) +
  text(350, 100, 'Dice quién es la persona:\nnombre, foto, voz, teléfono.', { size: 16, weight: 500, fill: C.mut, lh: 21 }) +
  circle(366, 168, 11, C.red) + text(388, 175, 'Dato de salud', { size: 20, weight: 800 }) +
  text(350, 206, 'Cuenta algo de su salud:\ndiagnóstico, pastillas, caídas.', { size: 16, weight: 500, fill: C.mut, lh: 21 }) +
  rect(350, 272, 268, 64, NAVY, { r: 14 }) +
  text(484, 297, 'Categoría especial:', { size: 16, fill: '#fff', anchor: 'middle', weight: 800 }) +
  text(484, 320, 'protección reforzada', { size: 16, fill: '#fff', anchor: 'middle', weight: 600 }),
  'Ficha de una residente con sus datos personales marcados en azul y sus datos de salud marcados en rojo'))

c.asset('assets/img/c5_candado.svg', svg(W640, H360,
  bg(W640, H360, '#e8eefb', '#ffffff') +
  rect(24, 50, 172, 190, C.mint, { r: 18, stroke: C.green, sw: 3 }) + icon.check(110, 92, 50, C.green) +
  text(110, 146, 'Cuidar a\nesta persona', { size: 19, weight: 800, anchor: 'middle', lh: 24 }) +
  rect(444, 50, 172, 190, C.rose, { r: 18, stroke: C.red, sw: 3 }) + icon.cross(530, 92, 50, C.red) +
  text(530, 146, 'Curiosear,\ncomentar o\npublicar', { size: 19, weight: 800, anchor: 'middle', lh: 24 }) +
  line(198, 145, 258, 145, C.green, 5, { dash: '2 10' }) + line(442, 145, 382, 145, C.red, 5, { dash: '2 10' }) +
  icon.lock(320, 140, 150, NAVY) +
  text(320, 272, 'Datos de salud', { size: 22, weight: 800, anchor: 'middle', fill: NAVY }) +
  caption(W640, H360, 'Se usan para cuidar, no para otra cosa', NAVY),
  'Un candado entre dos opciones: cuidar a la persona (permitido) y curiosear, comentar o publicar (no permitido)'))

c.asset('assets/img/c5_llamada.svg', svg(W640, H360,
  bg(W640, H360, ROSE, '#ffffff') +
  person(100, 176, { shirt: C.amber, hairStyle: 'long', hair: '#6a4a3a', scale: 1 }) +
  icon.phoneCall(40, 110, 40, C.green) +
  bubble(150, 30, 270, 78, '¿Cómo ha pasado la\nnoche mi madre?', { tail: 'l', size: 17 }) +
  person(548, 176, { shirt: C.teal, hairStyle: 'short', badge: true, scale: 1 }) +
  bubble(244, 148, 252, 82, 'Ahora mismo no puedo\ninformarle; le llama la\nenfermera enseguida.', { tail: 'r', size: 15, fill: '#e3f6f3', stroke: C.teal }) +
  icon.lock(320, 268, 60, NAVY) +
  caption(W640, H360, 'Ante la duda: no des datos de salud y pasa la llamada', NAVY),
  'Una hija llama por teléfono preguntando por su madre y la gerocultora responde que la enfermera la llamará enseguida'))

c.asset('assets/img/c5_foto_movil.svg', svg(W640, H360,
  bg(W640, H360, '#e8eefb', '#ffffff') +
  (() => {
    const inner = rect(0, 0, 154, 170, '#dff1ee', { r: 0 }) +
      person(34, 74, { scale: 0.5, shirt: C.amber, hairStyle: 'bun', hair: '#a8a8a8' }) + person(77, 84, { scale: 0.5, shirt: C.violet, hairStyle: 'bald' }) + person(120, 74, { scale: 0.5, shirt: C.teal, hairStyle: 'long', hair: '#7a5a4a' }) +
      rect(14, 196, 126, 36, NAVY, { r: 10 }) + text(77, 220, 'Compartir', { size: 16, fill: '#fff', anchor: 'middle', weight: 700 })
    return rect(44, 12, 172, 292, C.ink, { r: 22 }) + rect(52, 26, 156, 264, '#fff', { r: 12 }) + g(53, 28, inner)
  })() +
  [[true, 'Consentimiento firmado\npara esa finalidad'], [false, 'Sale alguien\nsin permiso'], [false, 'Se ve una sonda, una\ncura o una pizarra'], [false, 'La subes desde tu móvil\na tu perfil o a un grupo']]
    .map(([ok, t], i) => { const y = 24 + i * 70; return (ok ? icon.check(270, y + 22, 40) : icon.cross(270, y + 22, 40)) + text(304, y + 18, t, { size: 17, weight: 700, lh: 21 }) }).join('') +
  caption(W640, H360, 'Antes de publicar: permiso, canal oficial y nada de salud', NAVY),
  'Un móvil con una foto de grupo y cuatro comprobaciones antes de publicarla'))

c.asset('assets/img/c5_cco.svg', svg(W640, H360,
  bg(W640, H360, '#ffffff', '#eef3fb') +
  rect(18, 18, 292, 280, C.rose, { r: 16, stroke: C.red, sw: 3 }) + icon.cross(46, 48, 30, C.red) + text(70, 56, 'Todos en «Para»', { size: 19, weight: 800, fill: C.red }) +
  rect(34, 82, 260, 110, '#fff', { r: 10 }) +
  text(46, 106, 'Para: ana.gomez@correo.es,\nluis.perez@correo.es,\nm.garcia@correo.es, …', { size: 14, weight: 600, fill: C.mut, lh: 20 }) +
  icon.eye(70, 232, 50, C.red) + text(112, 226, 'Cada familia ve los\nnombres y correos\nde todas las demás', { size: 15, weight: 700, lh: 19 }) +
  rect(330, 18, 292, 280, C.mint, { r: 16, stroke: C.green, sw: 3 }) + icon.check(358, 48, 30, C.green) + text(382, 56, 'Todos en «CCO»', { size: 19, weight: 800, fill: '#0b6b3a' }) +
  rect(346, 82, 260, 110, '#fff', { r: 10 }) +
  text(358, 106, 'Para: centro@centrosolmar.es\nCCO: (oculto)', { size: 14, weight: 600, fill: C.mut, lh: 20 }) +
  icon.lock(382, 232, 40, C.green) + text(424, 226, 'Cada familia solo\nve su propio\nmensaje', { size: 15, weight: 700, lh: 19 }) +
  caption(W640, H360, 'Varias familias en un correo: siempre en CCO (copia oculta)', NAVY),
  'Dos correos comparados: con todas las direcciones visibles en Para y con las direcciones ocultas en copia oculta'))

c.asset('assets/img/c5_brecha.svg', svg(W640, H360,
  bg(W640, H360, '#ffffff', ROSE) +
  text(320, 44, 'BRECHA: a los datos les pasa algo que no debía', { size: 20, weight: 800, anchor: 'middle', fill: NAVY }) +
  [[icon.doc(110, 128, 60, C.blue), 'Se pierden o\nse destruyen', 'Una tablet perdida'], [icon.key(320, 128, 56, C.amber), 'Se cambian\nsin querer', 'Una ficha mal editada'], [icon.eye(530, 128, 62, C.red), 'Los ve quien\nno debe', 'Un correo a la\npersona equivocada']]
    .map(([ic, t, s], i) => rect(20 + i * 210, 70, 180, 206, '#fff', { r: 16, stroke: C.line, sw: 2 }) + ic + text(110 + i * 210, 186, t, { size: 18, weight: 800, anchor: 'middle', lh: 22 }) + text(110 + i * 210, 238, s, { size: 14, weight: 500, fill: C.mut, anchor: 'middle', lh: 17 })).join('') +
  rect(20, 294, 600, 42, C.sky, { r: 14 }) +
  text(320, 321, 'Por accidente o a propósito · También si lo hace alguien de dentro', { size: 16, weight: 700, anchor: 'middle', fill: NAVY }),
  'Tres tipos de brecha: datos que se pierden, que se alteran o que ve quien no debe'))

c.asset('assets/img/c5_72h.svg', svg(W640, H360,
  bg(W640, H360, '#e8eefb', '#ffffff') +
  rect(60, 144, 174, 14, C.green, { r: 7 }) + rect(234, 144, 173, 14, C.amber, { r: 0 }) + rect(407, 144, 173, 14, C.red, { r: 7 }) +
  [60, 233, 407, 580].map((x, i) => circle(x, 151, 11, '#fff', { stroke: NAVY, sw: 4 }) + text(x, 190, ['0 h', '24 h', '48 h', '72 h'][i], { size: 18, weight: 800, anchor: 'middle' })).join('') +
  text(30, 82, 'El centro\n«tiene constancia»', { size: 17, weight: 800, fill: NAVY, lh: 21 }) +
  text(610, 82, 'Límite para avisar a la AEPD\n(si hay riesgo)', { size: 17, weight: 800, fill: C.red, anchor: 'end', lh: 21 }) +
  rect(120, 206, 400, 34, C.sand, { r: 17 }) + text(320, 229, 'Sábados, domingos y festivos también cuentan', { size: 15, weight: 700, anchor: 'middle', fill: '#7a4a00' }) +
  text(60, 266, 'Tú avisas en minutos: el centro conserva casi todo el plazo', { size: 15, weight: 700 }) +
  rect(60, 274, 520, 16, C.line, { r: 8 }) + rect(60, 274, 14, 16, C.green, { r: 8 }) +
  text(60, 316, 'Avisas al tercer día: el plazo casi se agota', { size: 15, weight: 700 }) +
  rect(60, 324, 520, 16, C.line, { r: 8 }) + rect(60, 324, 490, 16, C.red, { r: 8 }),
  'Línea de tiempo de 72 horas con el momento en que el centro se entera y el límite para notificar'))

const MON = rect(40, 115, 130, 80, C.ink, { r: 6 }) + rect(46, 121, 118, 64, '#fff', { r: 3 }) +
  text(52, 138, 'HISTORIA CLÍNICA', { size: 10, weight: 800, fill: NAVY }) + text(52, 155, 'Pilar R. · Hab. 14', { size: 11 }) + text(52, 172, 'Dx: demencia', { size: 11, fill: C.red, weight: 800 })
c.asset('assets/img/c5_sala.svg', svg(W640, H360,
  rect(0, 0, W640, H360, '#eef2f8', { r: 0 }) + rect(0, 285, W640, 75, '#cfd8e6', { r: 0 }) +
  // armario cerrado (bien)
  rect(30, 24, 80, 84, '#9fb0c6', { r: 6 }) + line(70, 24, 70, 108, '#7c8da6', 2) + icon.lock(70, 62, 34, C.green) + text(70, 98, 'Cerrado', { size: 12, anchor: 'middle', fill: '#fff', weight: 700 }) +
  // pizarra con nombres
  rect(230, 24, 170, 106, '#fff', { r: 6, stroke: '#6b7a90', sw: 4 }) +
  text(240, 48, 'HAB 3  Pilar · diabetes', { size: 13, weight: 700 }) + text(240, 68, 'HAB 5  Luis · demencia', { size: 13, weight: 700 }) + text(240, 88, 'HAB 8  Rosa · incontinencia', { size: 13, weight: 700 }) + text(240, 108, 'HAB 9  Juan · disfagia', { size: 13, weight: 700 }) +
  // cartel de visitas
  rect(430, 30, 90, 58, '#fff7e0', { r: 6, stroke: C.amber, sw: 2 }) + text(475, 49, 'VISITAS\n11-13 h y\n17-19 h', { size: 11, weight: 700, anchor: 'middle', lh: 13 }) +
  // mostrador
  rect(20, 200, 460, 85, '#a97c50', { r: 6 }) + rect(14, 196, 472, 12, '#c89b6a', { r: 4 }) +
  MON + rect(95, 195, 20, 4, '#6b7a90', { r: 2 }) +
  // expediente abierto
  rect(230, 184, 110, 24, C.amber, { r: 4 }) + rect(238, 174, 94, 16, '#fff', { r: 2 }) + text(243, 186, 'PAI abierto · Hab. 14', { size: 10, weight: 700 }) +
  // tablet con foto en grupo de planta
  rect(380, 136, 72, 66, C.ink, { r: 8 }) + rect(385, 141, 62, 56, '#e6f6ee', { r: 4 }) + text(416, 154, 'Grupo planta', { size: 9, weight: 800, anchor: 'middle', fill: '#0b6b3a' }) + rect(391, 160, 50, 28, '#f2c9a5', { r: 4 }) + circle(416, 174, 7, C.red) +
  // visita
  person(560, 196, { shirt: C.violet, hairStyle: 'long', hair: '#555', scale: 0.9 }) + text(560, 126, 'Visita', { size: 14, weight: 700, fill: C.mut, anchor: 'middle' }),
  'Sala de planta con una pantalla visible, una pizarra con nombres y diagnósticos, un expediente abierto, una tablet con una foto en el grupo de la planta, un armario cerrado con llave y un cartel de horario de visitas'))

c.asset('assets/img/c5_pasos.svg', svg(W640, H360,
  bg(W640, H360, '#ffffff', ROSE) +
  line(70, 118, 570, 118, C.line, 8) +
  [['1', NAVY, 'Detecta\ny para', '¡Alto! No sigas\n«arreglándolo»'], ['2', C.red, 'No borres\nnada', 'Ni correo, ni\nmensaje, ni archivo'], ['3', C.amber, 'Avisa\nYA', 'Por teléfono si\nes urgente'], ['4', C.teal, 'Contén\nel daño', 'Solo lo que te\nindiquen'], ['5', C.violet, 'Documenta\nqué pasó', 'Hora, qué datos\ny a cuántas personas']]
    .map(([n, col, t, s], i) => { const x = 70 + i * 125; return circle(x, 118, 36, col) + text(x, 130, n, { size: 32, fill: '#fff', anchor: 'middle', weight: 800 }) + text(x, 184, t, { size: 18, weight: 800, anchor: 'middle', lh: 22 }) + text(x, 236, s, { size: 13, weight: 500, fill: C.mut, anchor: 'middle', lh: 16 }) }).join('') +
  caption(W640, H360, 'Ante un incidente: para, no borres, avisa', NAVY),
  'Cinco pasos ante un incidente: detecta y para, no borres nada, avisa ya, contén el daño y documenta qué pasó'))

// ───────────────────────── Intro ─────────────────────────
c.intro({ type: 'cover', title: 'Datos de las personas residentes', text: 'Confidencialidad, fotos y brechas', img: { src: 'assets/img/c5_portada.svg', alt: 'Una ficha de residente protegida por un candado', full: true } })

// ───────────────────────── Lección 1 ─────────────────────────
const l1 = c.unit('Lección 1. Qué datos manejas y por qué son tan delicados', 'Qué es un dato personal, qué es un dato de salud y por qué los protege la ley con más fuerza.')
l1.add({ type: 'cover', title: 'Qué datos manejas', text: 'Lección 1' })
  .add({ type: 'objectives', title: 'Qué vas a lograr', obj: 0, text: 'Al terminar este curso sabrás:\n- Distinguir datos personales y de salud, y por qué se protegen más.\n- Decidir qué puedes decir, a quién y por qué canal.\n- Saber cuándo se puede hacer y publicar una foto.\n- Cuidar tus redes y tu móvil.\n- Reconocer una brecha y avisar a tiempo.\n- Seguir el protocolo si algo sale mal.\n\nSon unos 100 minutos, a tu ritmo y desde el móvil.' })
  .add({ title: 'Los datos son suyos', obj: 0, text: 'Cada día manejas información de personas que confían en ti: su nombre, su cara en una foto, su medicación, cómo ha pasado la noche.\n\nEsa información **es de ellas**, no del centro ni de quien la ve. Tú puedes usarla para **cuidarlas**, y para nada más.\n\n::: fact\nUn dato personal es cualquier información que permite saber de quién se trata: nombre, cara en una foto, voz, DNI, o hasta un número de habitación junto a un nombre.\n:::', img: { src: 'assets/img/c5_ficha.svg', alt: 'Ficha de una residente con datos personales en azul y datos de salud en rojo', layout: 'top', full: true } })
  .add({ title: '¿Dato de salud o no?', obj: 0, text: 'Un **dato de salud** cuenta algo sobre la salud física o mental de una persona: un diagnóstico, una pastilla, que usa pañal, una caída. Hasta saber que vive en un centro sociosanitario concreto puede ser delicado.', ix: ix.classify('Clasifica cada ejemplo.',
    [['salud', 'Dato de salud'], ['personal', 'Dato personal (no de salud)'], ['no', 'No es un dato de una persona']],
    [['Que doña Rosa toma una pastilla para la tensión cada mañana', 'salud'], ['Su nombre y apellidos', 'personal'], ['Una foto suya sonriendo en la fiesta', 'personal'], ['Que se ha caído dos veces este mes', 'salud'], ['Su dieta triturada por problemas para tragar', 'salud'], ['El color del uniforme de la gerocultora', 'no'], ['La hora de apertura del comedor', 'no'], ['El teléfono de su hija', 'personal']],
    fbk('¡Bien clasificado!', 'Revisa los que fallaron.', 'Dato de salud: lo que revela algo sobre su salud (medicación, caídas, dieta por disfagia). Dato personal: lo que identifica a la persona. Una foto es dato personal, y de salud si se ve una sonda o una cura.')) })
  .add({ title: 'Protección reforzada', obj: 0, text: 'Los datos de salud son una **categoría especial**: la ley los protege más que al resto.\n\nEl centro puede usarlos para darte asistencia, pero quien los trate debe guardar secreto. En una frase: **tienes permiso para usarlos para cuidar, no para otra cosa**.\n\n::: important\nMuchas personas residentes no pueden defenderse ni darse cuenta de que algo va mal. Por eso nos toca hacerlo a nosotros, por ellas.\n:::', img: { src: 'assets/img/c5_candado.svg', alt: 'Un candado entre dos opciones: cuidar a la persona, permitido, y curiosear, comentar o publicar, no permitido', layout: 'top', full: true } })
  .add({ title: 'Cinco reglas básicas', obj: 0, text: 'La ley pide cinco cosas básicas con los datos. Gira cada tarjeta y piensa un ejemplo de tu planta.', ix: ix.flip([
    ['Finalidad', 'Usa los datos solo para lo que se recogieron. La foto de la ficha médica no es para el álbum de la fiesta.'],
    ['Minimización', 'Solo los datos necesarios. A la familia, la cita (día y hora), no «el motivo».'],
    ['Exactitud', 'Datos correctos y al día: revisa la medicación y los contactos.'],
    ['No guardar de más', 'No conserves datos más tiempo del necesario: nada de capturas en tu móvil.'],
    ['Integridad y confidencialidad', 'Que nadie no autorizado los vea ni se pierdan: pantalla bloqueada, papeles guardados, correo con copia oculta.'],
  ]) })
  .add({ title: 'Elige tu puesto', obj: 0, text: 'Pulsa tu puesto y mira qué datos tienes a mano y qué no debes hacer con ellos.', ix: ix.tabs([
    ['Gerocultor/a', 'Ves a diario hábitos, caídas, dietas y estados de ánimo. Úsalos para cuidar y anótalos donde el centro indica.\n\n**No** los cuentes en el pasillo, a otra planta ni por tu móvil personal.'],
    ['Auxiliar / enfermería', 'Manejas medicación, curas e informes. Accede solo a las fichas de las personas que atiendes.\n\n**No** envíes fotos de heridas ni hojas de medicación por WhatsApp.'],
    ['Administración / dirección', 'Tienes contratos, datos bancarios y contactos de familias. Accedes solo a lo que pide tu función.\n\nLos correos a varias familias, siempre con **copia oculta (CCO)**.'],
    ['Supervisión', 'Reparte turnos y ves incidencias. Das ejemplo: usas el canal oficial para fotos y mensajes, y sabes a quién se avisa si algo sale mal.'],
    ['Mantenimiento', 'Entras en despachos y salas con papeles y pantallas. **No** leas lo que no es tuyo.\n\nSi encuentras un papel o un pendrive con datos, entrégalo a tu responsable.'],
  ]) })
  .add({ type: 'summary', title: 'Lo que te llevas', text: '- Un dato personal permite saber de quién se trata; un dato de salud cuenta algo de su salud.\n- Los datos de salud son una categoría especial: se usan para cuidar, no para otra cosa.\n- Las personas residentes confían en ti y a menudo no pueden defenderse: hazlo tú por ellas.' })

// ───────────────────────── Lección 2 ─────────────────────────
const l2 = c.unit('Lección 2. Confidencialidad en el día a día', 'Tu deber de callar, la necesidad de conocer y cómo atender a familias y compañeros.')
l2.add({ type: 'cover', title: 'Confidencialidad en el día a día', text: 'Lección 2' })
  .add({ title: 'Tu deber de callar', obj: 1, text: 'Todo lo que sabes de las personas residentes por tu trabajo es **confidencial**. Vale para todo el personal (cuidados, cocina, limpieza, administración…) y **dura aunque dejes el centro**.\n\n::: reflect\nAntes de abrir, comentar o pasar un dato: ¿lo necesito para mi trabajo con esta persona, ahora?\n:::\n\nSi no, no lo abras, no lo comentes, no lo pases. Es la **necesidad de conocer**: curiosidad no es necesidad. Los accesos quedan registrados y tu clave es personal.\n\n::: warn\nRevelar secretos de tu trabajo o entrar sin permiso en datos reservados puede tener consecuencias laborales e incluso penales (Código Penal, arts. 197 y 199).\n:::' })
  .add({ title: '¿Quién puede verlo?', obj: 1, text: 'Esta es una ficha inventada. Dato a dato, marca quién necesita verlo para su trabajo.', ix: ix.html({ ...semaforoDato({ titulo: '', datos: [
    { t: 'Que vive en el centro y en qué planta', sub: 'Dónde está ingresada', ok: [0, 1, 2], porque: 'La familia autorizada puede saber que está ingresada y dónde, si la persona no se opone y sin datos de salud. El equipo y administración lo necesitan para trabajar.' },
    { t: 'Diagnóstico', sub: 'Por ejemplo, demencia', ok: [0], porque: 'Es un dato de salud: solo lo necesita el equipo que la cuida. A la familia se lo cuenta quien corresponde (médico o enfermería) y con permiso; administración no lo necesita para facturar.' },
    { t: 'Hoja de medicación', sub: 'Pautas y dosis', ok: [0], porque: 'Dato de salud: lo necesita quien administra o supervisa la medicación. Nunca por WhatsApp ni en una foto suelta.' },
    { t: 'Cuenta bancaria para el recibo mensual', sub: 'Datos de pago', ok: [1], porque: 'Es un dato de gestión: lo necesita administración. El equipo asistencial no lo necesita para cuidar.' },
    { t: 'Día y hora de la cita con el especialista', sub: 'Sin el motivo de la cita', ok: [0, 1, 2], porque: 'Con la familia basta el mínimo: día, hora y lugar, sin causas ni diagnósticos. Lo necesitan quienes organizan la cita y el traslado.' },
    { t: 'Foto de una herida', sub: 'Hecha durante la cura', ok: [0], porque: 'Dato de salud que además identifica. Va a la historia clínica por el canal del centro, no a otras manos.' },
    { t: 'Teléfono de su hija', sub: 'Contacto de familia', ok: [0, 1], porque: 'Lo usa el equipo para avisar y administración para gestiones. No se da a terceros.' },
  ] }), est_seconds: 360, prompt: '' }) })
  .add({ title: '¿Cómo está mi madre?', obj: 1, text: 'Es la pregunta que más te harán. Con carácter general, para informar a un familiar hace falta el **permiso del residente** (o de su representante), y el centro debe tener un procedimiento escrito.\n\n- Comprueba quién llama con **varios datos** que coincidan con la ficha.\n- Sin permiso claro, **no des datos de salud**: pasa la llamada a enfermería o dirección.\n- Como mucho, y si no hay oposición: que está ingresado y dónde.', img: { src: 'assets/img/c5_llamada.svg', alt: 'Una hija pregunta por su madre por teléfono y la gerocultora responde que la enfermera la llamará enseguida', layout: 'top', full: true } })
  .add({ title: 'Una hija llama de noche', obj: 1, text: 'Turno de noche, suena el teléfono de la planta. Elige qué respondes.', ix: ix.html({ ...W.chatStory({ contacto: { nombre: 'Llamada entrante', emoji: '📞', sub: 'Planta 2 · 22:15' }, estilo: 'llamada', nodos: {
    n1: { msgs: [['sys', 'Suena el teléfono de la planta.'], ['them', 'Buenas noches, soy la hija de la señora Pilar, de la 14. ¿Cómo ha pasado la tarde? ¿Le han cambiado la medicación?']], choices: [
      { t: 'Sí, le han subido la dosis de la tensión, pero está tranquila', next: 'malo', q: 'bad', fb: 'Has dado datos de salud sin comprobar quién llama.' },
      { t: 'Le pido varios datos para comprobar quién es y miro si consta como autorizada', next: 'n2', q: 'good', fb: 'Primero, comprobar. Es lo que recomienda la AEPD.' },
      { t: 'Le digo que no puedo decir nada a nadie y cuelgo', next: 'seco', q: 'mid', fb: 'Prudente, pero la familia se queda sin respuesta.' }] },
    malo: { msgs: [['sys', 'Más tarde descubres que esa persona no constaba como autorizada.']], fin: { tipo: 'bad', titulo: 'Datos de salud a quien no consta', texto: 'Diste información de salud sin comprobar identidad ni permiso. Avisa a tu responsable: puede ser una brecha, y el centro necesita saberlo cuanto antes.' } },
    seco: { msgs: [['sys', 'La familia se queda preocupada y sin respuesta.']], fin: { tipo: 'mid', titulo: 'Prudente, pero mejorable', texto: 'No dar datos fue prudente. Mejor: comprobar quién es y ofrecer que le llame enfermería o dirección, que son quienes informan.' } },
    n2: { msgs: [['them', 'Soy Marta García, la hija. Mi madre es Pilar Ruiz, habitación 14.'], ['sys', 'En la ficha consta Marta García como persona autorizada y los datos coinciden.']], choices: [
      { t: 'Le leo lo que pone la hoja de medicación', next: 'n3', q: 'mid', fb: 'Aunque conste, la información clínica la da quien corresponde.' },
      { t: '«Ahora mismo no puedo informarle; enseguida le llama la enfermera»', next: 'bien', q: 'good', fb: 'Perfecto: comprobaste y pasaste la consulta clínica.' }] },
    n3: { msgs: [['sys', 'La enfermera te comenta después que ella lo habría explicado con más contexto.']], fin: { tipo: 'mid', titulo: 'Casi', texto: 'Era una persona autorizada, pero una consulta clínica la responde enfermería o el médico, según el procedimiento del centro.' } },
    bien: { msgs: [['sys', 'Anotas quién llamó y qué pidió. La enfermera llama en un momento.']], fin: { tipo: 'good', titulo: '¡Bien hecho!', texto: 'Comprobaste la identidad, miraste la autorización y pasaste la consulta clínica a quien corresponde. Anotar la llamada completa el trabajo.' } },
  } }), est_seconds: 270, prompt: '' }) })
  .add({ title: 'Antes de dar un dato por teléfono', obj: 1, text: 'Ordena lo que haces cuando alguien pide información por teléfono.', ix: ix.sort('Pon los pasos en el orden correcto.', [
    'Mantengo la calma: nadie puede meterme prisa para dar datos',
    'Compruebo quién llama con varios datos que coincidan con la ficha',
    'Miro si consta como persona autorizada (o dice la contraseña del centro)',
    'Doy solo lo mínimo (día, hora, lugar) o paso la llamada a enfermería o dirección',
    'Anoto quién llamó y qué pidió',
  ], fbk('¡Ese es el orden!', 'Casi: piensa primero en comprobar, después en dar.', 'Primero calma, luego comprobar identidad y autorización; después, solo lo mínimo o pasar la llamada, y siempre anotar. Sin causas, síntomas ni diagnósticos.')) })
  .add({ title: 'Una llamada «del hospital»', obj: 1, text: 'Eres enfermera y estás sola en la planta.', ix: ix.scenario('Llama alguien que dice ser médico de urgencias de otro hospital y pide por teléfono la hoja de medicación completa de un residente.', '¿Qué haces?', [
    ['Se la leo entera: es un médico y suena urgente', false, 'No sabes quién es de verdad. La urgencia es justo lo que usa el engaño para que no verifiques.'],
    ['Pido nombre, centro y teléfono, no doy nada y paso la petición al médico responsable o a dirección, que verifican por un canal oficial', true, 'Exacto: verificar antes de compartir. Quien corresponde comprobará la identidad y decidirá qué se facilita.'],
    ['Le pido que me la pida por WhatsApp y se la mando en foto', false, 'Un WhatsApp no es un canal seguro ni verifica a nadie.'],
  ], fbk('¡Bien hecho!', 'No era esa.', 'Los datos de salud se facilitan tras comprobar la identidad y por el canal del centro, y decide quien corresponde, no quien llama con prisa.')) })
  .add({ title: 'El WhatsApp de planta', obj: 1, text: 'En el grupo de tu planta alguien sube una foto. Elige cómo respondes.', ix: ix.html({ ...W.chatStory({ contacto: { nombre: 'Grupo Planta 2', emoji: '👥', sub: 'WhatsApp · 14 participantes' }, nodos: {
    n1: { msgs: [['them', 'Rosa: [foto de una herida en la pierna de un residente] ¿Creéis que hay que llamar al médico?']], choices: [
      { t: 'Contesto: «Yo la veo infectada, que tome antibiótico»', next: 'malo', q: 'bad', fb: 'Opinión clínica y datos de salud en un grupo.' },
      { t: 'Sigo la conversación, pero sin decir el nombre', next: 'medio', q: 'mid', fb: 'La foto ya está en el grupo y la herida identifica.' },
      { t: 'Escribo: «Mejor por el canal del centro: llamo a enfermería ahora»', next: 'n2', q: 'good', fb: 'Canal oficial y aviso a quien corresponde.' }] },
    malo: { msgs: [['sys', 'Tres compañeros más comentan la foto. Alguien la reenvía a otro grupo.']], fin: { tipo: 'bad', titulo: 'Los datos se esparcen', texto: 'Un grupo no es privado ni seguro: la AEPD declaró infracción de la confidencialidad por comentar una historia clínica en un chat de compañeros. Avisa a tu supervisor/a.' } },
    medio: { msgs: [['sys', 'La conversación sigue y la foto queda en los móviles de 14 personas.']], fin: { tipo: 'mid', titulo: 'Sin nombre no es anónimo', texto: 'Una herida concreta, en una planta concreta, identifica. Lo correcto: dejar de usar el grupo para esto y avisar al supervisor.' } },
    n2: { msgs: [['them', 'Rosa: Es que por aquí es más rápido…']], choices: [
      { t: 'Tienes razón, mando también la foto de la otra herida', next: 'malo', q: 'bad', fb: 'Más datos de salud en el grupo.' },
      { t: 'Lo sé, pero aquí no hay garantía de confidencialidad. Aviso también a la supervisora', next: 'bien', q: 'good', fb: 'Y así el centro puede ofrecer un canal mejor.' }] },
    bien: { msgs: [['sys', 'Enfermería atiende la herida. La supervisora recuerda a todo el equipo qué canal usar.']], fin: { tipo: 'good', titulo: '¡Muy bien!', texto: 'Evitaste más datos en el grupo, avisaste a enfermería y avisaste a tu supervisora de cómo se está usando el grupo.' } },
  } }), est_seconds: 270, prompt: '' }) })
  .add({ title: '¿Puedo decirlo o no?', obj: 1, text: 'Ocho situaciones de un turno cualquiera. Decide rápido, y mira por qué.', ix: ix.html({ ...swipeSiNo({ titulo: '', ayuda: 'Desliza a la derecha si SÍ puedes y a la izquierda si NO. También puedes usar los botones.', cards: [
    { canal: '📞 Llamada', de: 'Una señora que dice ser hija de un residente', texto: '«¿Qué diagnóstico tiene mi padre?»', fraude: true, pistas: ['No sabes si consta como autorizada', 'Es información clínica'], porque: 'Los diagnósticos los da quien corresponde, tras comprobar identidad y autorización.' },
    { canal: '🗣️ En persona', de: 'Una compañera de otra planta', texto: '«¿Cómo le salió la analítica a don Manuel? Es mi vecino.»', fraude: true, pistas: ['Ser vecino no es necesidad de atención'], porque: 'Necesidad de conocer: el deber de confidencialidad también vale entre compañeros.' },
    { canal: '🗣️ En persona', de: 'La hija de la señora Pilar (la conoces y es la autorizada)', texto: '«¿A qué hora puedo pasar a verla esta tarde?»', fraude: false, pistas: ['El horario de visitas no es un dato de salud'], porque: 'Informar del horario de visitas no revela nada de su salud.' },
    { canal: '💬 WhatsApp', de: 'Grupo de la planta', texto: 'Una compañera sube la foto de una herida: «¿Llamo al médico?»', fraude: true, pistas: ['Un grupo de WhatsApp no garantiza confidencialidad', 'Una herida identifica y es dato de salud'], porque: 'Para esto está el canal del centro: parte clínico o llamada a enfermería.' },
    { canal: '📞 Llamada', de: 'La enfermera de otra planta que atiende hoy a la residente', texto: '«Necesito su pauta de medicación para esta tarde.»', fraude: false, pistas: ['Tiene necesidad de conocer', 'Es del equipo asistencial'], porque: 'Quien atiende a la persona necesita el dato; dalo por el canal del centro.' },
    { canal: '🗣️ Pasillo', de: 'Una enfermera y tú, con visitas de otra familia cerca', texto: 'Empezáis a comentar en voz alta el tratamiento de una residente.', fraude: true, pistas: ['Las visitas oyen'], porque: 'Se informa a la familia en la entrevista o por el canal acordado, no en el pasillo.' },
    { canal: '🗣️ En persona', de: 'Tu supervisora', texto: '«Dime quién necesita dieta triturada para el menú de hoy.»', fraude: false, pistas: ['Lo necesita para organizar la comida', 'Solo lo imprescindible'], porque: 'Es información necesaria para cuidar y organizar el servicio.' },
    { canal: '💬 WhatsApp', de: 'Un número desconocido', texto: '«Soy el técnico del programa de residentes. Dime tu contraseña para arreglar un fallo.»', fraude: true, pistas: ['Número desconocido', 'Nadie debe saber tu contraseña'], porque: 'Es ingeniería social: nunca compartas tu contraseña y verifica con tu responsable por un canal conocido.' },
  ] }), est_seconds: 270, prompt: '' }) })
  .add({ type: 'summary', title: 'Lo que te llevas', text: '- Todo lo que sabes de los residentes es confidencial, también al dejar el centro.\n- Pregúntate siempre: ¿lo necesito para mi trabajo con esta persona, ahora?\n- Con familias: comprueba quién es, mira si consta autorizada y, ante la duda, pasa la llamada.\n- Nada de datos de salud en grupos de WhatsApp ni en el pasillo.' })

// ───────────────────────── Lección 3 ─────────────────────────
const l3 = c.unit('Lección 3. Fotos y vídeos de residentes', 'Cuándo hace falta permiso, quién lo da y por qué canal se publica.')
l3.add({ type: 'cover', title: 'Fotos y vídeos de residentes', text: 'Lección 3' })
  .add({ title: 'Una foto es un dato', obj: 2, text: 'La cara, la voz y hasta el contexto (una silla de ruedas, una sonda, el pijama, la habitación) **identifican** a una persona y pueden contar algo de su salud.\n\nHacer y publicar fotos es **tratar datos**: hace falta una base legal. En fiestas y actividades suele ser el **consentimiento**, y no se presume.\n\n::: info\nSi una persona sale de forma meramente casual al fondo, no hace falta pedir permiso aparte. Si es el objeto de la foto, sí.\n:::', img: { src: 'assets/img/c5_foto_movil.svg', alt: 'Un móvil con una foto de grupo y cuatro comprobaciones antes de publicarla', layout: 'top', full: true } })
  .add({ title: '¿Publico esta foto?', obj: 2, text: 'Antes de publicar: ¿hay permiso **para esa finalidad**? ¿sale alguien sin permiso? ¿se ve algo de salud? ¿la subes desde tu móvil personal?', ix: ix.html({ ...swipeSiNo({ titulo: '', ayuda: 'Desliza a la derecha si SÍ se puede publicar y a la izquierda si NO. También puedes usar los botones.', cards: [
    { canal: '📷 Foto', de: 'Fiesta de verano', texto: 'Grupo de residentes sonriendo a cámara. Todos tienen consentimiento firmado para la web del centro y la publica la persona autorizada, desde el canal del centro.', fraude: false, pistas: ['Consentimiento para esa finalidad', 'Canal oficial'], porque: 'Cumple lo que hace falta: permiso específico y canal del centro.' },
    { canal: '📷 Foto', de: 'Taller de manualidades', texto: 'Una foto preciosa de doña Rosa. No consta que su familia haya firmado el consentimiento para redes.', fraude: true, pistas: ['Sin consentimiento'], porque: 'Sin consentimiento para esa finalidad, no se publica, por bonita que sea.' },
    { canal: '📷 Foto', de: 'Hora del almuerzo', texto: 'Una residente con la sonda y el material de la cura a la vista.', fraude: true, pistas: ['Se ve información de salud'], porque: 'Se ve información de salud: ni se publica ni se comparte.' },
    { canal: '📷 Foto', de: 'Pizarra de la planta', texto: 'Foto de la pizarra con nombres, habitaciones y dietas para mandarla al grupo.', fraude: true, pistas: ['Nombres y datos de salud', 'Grupo de mensajería'], porque: 'Son nombres con datos de salud, y un grupo no garantiza confidencialidad.' },
    { canal: '📷 Foto', de: 'Coro de Navidad', texto: 'Ha quedado preciosa y quieres subirla a TU Instagram.', fraude: true, pistas: ['Tu perfil personal'], porque: 'El centro decide el canal. Tu perfil personal, nunca.' },
    { canal: '📷 Foto', de: 'Foto de grupo con consentimiento', texto: 'Salen cuatro residentes con permiso para la revista del centro y alguien pasa de espaldas al fondo, sin ser el objeto de la foto.', fraude: false, pistas: ['Presencia casual y accesoria'], porque: 'Salir de forma casual al fondo no exige permiso aparte; si la persona fuese protagonista, sí.' },
    { canal: '🎥 Vídeo', de: 'Cumpleaños de una residente', texto: 'Un vídeo para enviarlo solo a su hija, con el permiso de la residente, por el canal del centro.', fraude: false, pistas: ['Permiso concreto', 'Canal oficial'], porque: 'Hay permiso y el destino es concreto: su propia familia, por el canal del centro.' },
    { canal: '📷 Foto', de: 'Recuerdo «por si acaso»', texto: 'Haces una foto con tu móvil y la guardas en tu galería.', fraude: true, pistas: ['Móvil personal', 'Guardada sin motivo'], porque: 'No la guardes: envíala por el canal oficial y bórrala del móvil según el procedimiento del centro.' },
  ] }), est_seconds: 270, prompt: '' }) })
  .add({ title: 'Foto en la fiesta de Navidad', obj: 2, text: 'Eres gerocultor/a. La fiesta de Navidad ha salido genial y una compañera te presiona un poco.', ix: ix.html({ ...W.chatStory({ contacto: { nombre: 'Carmen · compañera', emoji: '🎄', sub: 'WhatsApp' }, nodos: {
    n1: { msgs: [['sys', 'Fiesta de Navidad. Has hecho una foto al coro de residentes con tu móvil.'], ['them', '¡Qué foto tan buena del coro y el árbol! Súbela a tu Instagram y etiquetamos al centro 😍']], choices: [
      { t: 'La subo a mi Instagram, qué bonita ha quedado', next: 'malo', q: 'bad', fb: 'Sin consentimiento para esa finalidad y desde tu perfil.' },
      { t: 'La subo, pero solo para mis amigos', next: 'amigos', q: 'bad', fb: 'Sigue siendo tu perfil personal.' },
      { t: 'Mejor no: en las fiestas hace falta consentimiento y lo publica el centro, por su canal', next: 'n2', q: 'good', fb: 'Eso es: el consentimiento no se presume.' }] },
    malo: { msgs: [['sys', 'Al día siguiente, una hija pregunta por qué sale su madre en tu perfil.']], fin: { tipo: 'bad', titulo: 'La foto ya es pública', texto: 'Has publicado datos de residentes sin permiso y desde tu perfil. Bórrala y avisa a dirección: puede ser una brecha y el centro necesita saberlo cuanto antes.' } },
    amigos: { msgs: [['sys', 'Uno de tus amigos la comparte en su perfil.']], fin: { tipo: 'bad', titulo: 'Fuera de tu control', texto: 'En cuanto se publica, cualquiera puede reenviarla o capturarla. Bórrala, avisa a dirección y no discutas en comentarios.' } },
    n2: { msgs: [['them', 'Pero es una foto preciosa, nadie se va a quejar…']], choices: [
      { t: 'Vale, la mando al grupo de familias, que les hará ilusión', next: 'grupo', q: 'bad', fb: 'Un grupo de familias necesita consentimiento específico.' },
      { t: 'Se la paso a dirección para que decidan por el canal del centro y compruebo el consentimiento', next: 'bien', q: 'good', fb: 'Canal oficial y consentimiento, en ese orden.' }] },
    grupo: { msgs: [['sys', 'Una familia responde: «¿Han pedido permiso para publicar a mi padre?».']], fin: { tipo: 'bad', titulo: 'Sin permiso para esa finalidad', texto: 'Aunque el grupo sea de confianza, el contenido sale de tu control. Avisa a dirección: es un posible incidente.' } },
    bien: { msgs: [['sys', 'Dirección revisa los consentimientos. Tú no guardas la foto en tu galería.']], fin: { tipo: 'good', titulo: 'Foto bien gestionada', texto: 'Si el centro la quiere publicar, lo hará su canal oficial y solo si hay consentimiento para esa finalidad. Y tú no la guardas en tu móvil.' } },
  } }), est_seconds: 270, prompt: '' }) })
  .add({ title: '¿Quién da el permiso?', obj: 2, text: 'Une cada situación con lo que hace falta.', ix: ix.match('Une cada situación con su pareja.', [
    ['La residente decide por sí misma', 'Lo da ella misma'],
    ['La residente está incapacitada judicialmente', 'Lo da su tutor o representante legal'],
    ['Alguien sale al fondo de forma casual', 'No hace falta permiso aparte'],
    ['Fotos de una fiesta para las redes del centro', 'Hace falta consentimiento para esa finalidad'],
  ], fbk('¡Todo emparejado!', 'Revisa las parejas.', 'El consentimiento debe ser claro y concreto, con una acción afirmativa. Si la persona no puede consentir, lo hace su tutor o representante. Y si alguien te pide retirar una foto, avisa a dirección: es un derecho.')) })
  .add({ title: 'Si piden retirar una foto', obj: 2, text: 'Si un residente o su familia pide que se retire una foto, es un **derecho** (oposición o supresión): atiéndelo con amabilidad, anótalo y avisa a dirección o al DPD. No lo discutas.\n\nTambién pueden pedir ver sus datos o corregirlos. Tú no resuelves esas peticiones: las pasas a quien corresponde.', video: { id: 'VxgFRCL6nP4', caption: 'AEPD: Cómo ejercer tus derechos de protección de datos personales (1 min 52 s)', transcript: 'Vídeo de la Agencia Española de Protección de Datos (1 min 52 s) sobre cómo ejercer los derechos de protección de datos personales: qué derechos tiene cada persona sobre sus datos y cómo pedirlos.' }, notes: ['Verificar la transcripción viendo el vídeo (no visionado al redactar; título y canal verificados por oEmbed).'] })
  .add({ title: 'Piden quitar las fotos', obj: 2, text: 'Eres supervisora de planta.', ix: ix.scenario('La hija de un residente te pide que sus fotos dejen de aparecer en el álbum del grupo de familias. «Ya firmó el permiso en su día», te dicen otras compañeras.', '¿Qué haces?', [
    ['Le digo que ya firmó y que no se puede quitar', false, 'El consentimiento puede retirarse: oposición y supresión son derechos.'],
    ['La atiendo con amabilidad, anoto la petición y aviso a dirección o al DPD para retirar las fotos', true, 'Exacto: no lo discutes, lo anotas y lo gestiona quien corresponde.'],
    ['Borro yo las fotos de la web sin decir nada a nadie', false, 'Bienintencionado, pero sin anotarlo ni avisar el centro no puede demostrar que lo atendió.'],
  ], fbk('¡Bien resuelto!', 'No era esa.', 'Ante una petición de derechos: amabilidad, anotar y pasar a dirección o al DPD. Tú no la resuelves.')) })
  .add({ type: 'summary', title: 'Lo que te llevas', text: '- Una foto es un dato personal, y de salud si se ve algo de la salud.\n- En fiestas y actividades hace falta consentimiento para cada finalidad.\n- Las fotos se publican por el canal del centro, nunca desde tu móvil a tu perfil.\n- Si alguien pide retirar una foto, avisa a dirección: es un derecho.' })

// ───────────────────────── Lección 4 ─────────────────────────
const l4 = c.unit('Lección 4. Tus redes sociales y el centro', 'Qué no publicar, cómo te estudian los estafadores y cómo cuidar tu privacidad.')
l4.add({ type: 'cover', title: 'Tus redes y el centro', text: 'Lección 4' })
  .add({ title: 'Lo del trabajo, en el trabajo', obj: 3, text: 'No publiques nada del trabajo: ni fotos de residentes, ni nombres, ni turnos, ni claves, ni quejas. Una anécdota «sin nombre» con el nombre de tu centro en el perfil **sí es identificable**.\n\nUn estafador estudia tus redes para preparar una llamada creíble. Eso es la **ingeniería social**: ganarse tu confianza para que hagas lo que él quiere.', video: { id: 'TentnM1-lg0', caption: 'INCIBE: ¿Qué es la ingeniería social? (1 min 33 s)', transcript: 'Vídeo de INCIBE (1 min 33 s) que explica qué es la ingeniería social: el engaño que intenta ganarse la confianza de una persona para que haga algo bajo su manipulación, por ejemplo dar datos o pulsar un enlace.' }, notes: ['Verificar la transcripción viendo el vídeo (no visionado al redactar; título y canal verificados por oEmbed).'] })
  .add({ title: 'Detective de perfiles', obj: 3, text: 'Mira este perfil inventado y piensa como un estafador.', ix: ix.html({ ...detectivePerfil({ titulo: '', nombre: 'Lucía G.', usuario: '@lucia.cuida · perfil público', lineas: [
    { k: 'bio', t: 'Gerocultora en un centro Los Almendros · siempre de noches 🌙', pista: true, porque: 'Dice dónde trabajas y en qué turno estás.' },
    { k: 'post', t: 'Hoy la señora de la 14 me ha hecho llorar de risa, ¡qué mujer!', pista: true, porque: 'Una anécdota con la habitación: identifica a una residente.' },
    { k: 'foto', t: 'Foto de mi gato Mochi dormido en el sofá', pista: false, porque: 'Nada que ver con el trabajo.' },
    { k: 'post', t: 'Mi supervisora Marisa me ha vuelto a cambiar el turno…', pista: true, porque: 'Da el nombre de tu supervisora: sirve para decir «me envía Marisa».' },
    { k: 'foto', t: 'Yo con el uniforme y la tarjeta del centro bien visible', pista: true, porque: 'Se ve el logotipo y la tarjeta: sirve para fabricar una identidad falsa.' },
    { k: 'post', t: 'Receta de croquetas de la abuela, ¡quedan de lujo!', pista: false, porque: 'Una receta no ayuda a nadie a engañarte.' },
    { k: 'post', t: 'Mañana libro y me voy a la playa todo el día 🏖️', pista: true, porque: 'Dice cuándo no estás: y cuándo no puedes comprobar nada.' },
  ] }), est_seconds: 180, prompt: '' }) })
  .add({ title: 'Internet tiene memoria', obj: 3, text: 'Lo que publicas puede copiarse y reenviarse, aunque lo borres después. Antes de publicar o comentar, piensa si hace daño a alguien, si cuenta algo del trabajo o si te daría apuro que lo leyera tu jefa o una residente.\n\nAlgunos comentarios (acoso, difundir información confidencial) pueden incluso ser delito.', video: { id: 'WMEk-bua9vA', caption: 'OSI: ¿Hacemos buen uso de las redes sociales? (2 min 35 s)', transcript: 'Vídeo de la Oficina de Seguridad del Internauta (2 min 35 s) sobre el uso responsable de las redes sociales: pensar lo que se publica y quién puede verlo.' }, notes: ['Verificar la transcripción viendo el vídeo (no visionado al redactar; título y canal verificados por oEmbed).'] })
  .add({ title: 'Cuida tu privacidad', obj: 3, text: 'Pon las opciones de privacidad **lo más cerradas posible**, usa una contraseña distinta en cada servicio y activa el **doble factor** cuando puedas. Revisa quién ve tus publicaciones y a qué apps diste permisos.\n\nY si ya has publicado algo que no debías: **bórralo y avisa a dirección**. No es para pillarte: así el centro puede reaccionar a tiempo.', video: { id: 'qio3yImjSEA', caption: 'AEPD: Configura tu privacidad en WhatsApp (1 min 45 s)', transcript: 'Vídeo de la Agencia Española de Protección de Datos (1 min 45 s) sobre cómo configurar la privacidad de WhatsApp: qué opciones revisar para decidir quién puede ver tu información.' }, notes: ['Verificar la transcripción viendo el vídeo (no visionado al redactar; título y canal verificados por oEmbed).'] })
  .add({ title: 'Un familiar te escribe', obj: 3, text: 'Un familiar que conoces te escribe a tu móvil personal.', ix: ix.html({ ...W.chatStory({ contacto: { nombre: 'Javier', emoji: '👨', sub: 'WhatsApp personal · hijo de un residente' }, nodos: {
    n1: { msgs: [['them', 'Hola, soy Javier, el hijo de don Manuel. Como te conozco, ¿me mandas una foto de su hoja de medicación? Es para llevarla al médico.']], choices: [
      { t: 'Se la mando: lo conozco y es su hijo', next: 'malo', q: 'bad', fb: 'Sin verificar autorización y por un canal inseguro.' },
      { t: 'No contesto y lo ignoro', next: 'medio', q: 'mid', fb: 'No das datos, pero la familia se queda sin respuesta.' },
      { t: 'Le explico con amabilidad que debe pedirlo por el canal del centro y aviso a quien corresponde', next: 'bien', q: 'good', fb: 'Canal oficial, sin enfadar a nadie.' }] },
    malo: { msgs: [['sys', 'La foto de la hoja de medicación queda en un móvil personal y en un chat.']], fin: { tipo: 'bad', titulo: 'Datos de salud por WhatsApp', texto: 'Sin comprobar autorización, por un canal sin garantías y desde tu móvil. Avisa a tu responsable: puede ser una brecha.' } },
    medio: { msgs: [['sys', 'Javier insiste dos días después, un poco molesto.']], fin: { tipo: 'mid', titulo: 'Casi', texto: 'No enviaste nada, y eso es lo importante. Mejor: responder con amabilidad e indicar el canal del centro (enfermería o dirección).' } },
    bien: { msgs: [['sys', 'Enfermería contacta con Javier y comprueba que consta como autorizado.']], fin: { tipo: 'good', titulo: '¡Bien hecho!', texto: 'Los datos de salud no se mandan por WhatsApp personal. La información clínica la da quien corresponde, por el canal del centro.' } },
  } }), est_seconds: 270, prompt: '' }) })
  .add({ title: 'La llamada de «la inspección»', obj: 3, text: 'Eres administrativa. Suena el teléfono en recepción.', ix: ix.scenario('«Soy de la inspección sanitaria de la Junta. Necesito ahora mismo, por correo, la lista de residentes con diabetes y su medicación para un control.»', '¿Qué haces?', [
    ['Se la mando por correo para no entorpecer la inspección', false, 'Una petición urgente por teléfono es una técnica clásica de engaño. No facilites nada sin verificar.'],
    ['Pido nombre, cargo y teléfono, no facilito nada y paso la petición a dirección, que verificará por canales oficiales', true, 'Exacto: verifica la identidad antes de compartir. La inspección existe, pero se gestiona con dirección y por vías oficiales.'],
    ['Le doy solo los nombres, sin la medicación', false, 'Los nombres con una enfermedad siguen siendo datos de salud.'],
  ], fbk('¡Bien resuelto!', 'No era esa.', 'Ante una petición inesperada de datos: no contestes en el momento, verifica quién es y pasa la petición a quien corresponde.')) })
  .add({ type: 'summary', title: 'Lo que te llevas', text: '- Nada del trabajo en tus redes: ni fotos, ni nombres, ni anécdotas reconocibles, ni turnos.\n- Un estafador reúne pistas sueltas para parecer creíble.\n- Privacidad cerrada, contraseñas distintas y doble factor.\n- Ante una petición inesperada de datos: verifica y pasa la petición.' })

// ───────────────────────── Lección 5 ─────────────────────────
const l5 = c.unit('Lección 5. Brechas: qué son y cómo se avisa', 'Qué es una brecha, cómo reconocerla, el plazo de 72 horas y casos reales.')
l5.add({ type: 'cover', title: 'Brechas de datos', text: 'Lección 5', img: { src: 'assets/img/c5_72h.svg', alt: 'Línea de tiempo de 72 horas con el momento en que el centro se entera y el límite para notificar', full: true } })
  .add({ title: 'Qué es una brecha', obj: 4, text: 'Una **brecha** es cualquier cosa que hace que los datos de alguien se **pierdan, cambien o los vea quien no debe**, por accidente o a propósito.\n\nNo hace falta un hacker: un correo mal enviado, un papel olvidado o un compañero que mira una ficha por curiosidad también lo son.\n\n::: fact\nLa AEPD recibió **2.765 notificaciones de brechas en 2025**; el 81 % del sector privado (Memoria AEPD 2025).\n:::', img: { src: 'assets/img/c5_brecha.svg', alt: 'Tres tipos de brecha: datos que se pierden, que se alteran o que ve quien no debe', layout: 'top', full: true } })
  .add({ title: '¿Es una brecha?', obj: 4, text: 'Clasifica estas situaciones de un centro sociosanitario.', ix: ix.classify('Arrastra cada situación.', [['si', 'Es una brecha'], ['no', 'No es brecha en sí, pero se avisa']], [
    ['Mandas el informe de una residente a otra persona por error', 'si'], ['Subes por error la foto de una cura al grupo de familias', 'si'], ['Pierdes la tablet del centro con datos de residentes', 'si'], ['Un virus cifra los archivos de administración y piden un rescate', 'si'], ['Un compañero mira la ficha de un residente por curiosidad', 'si'], ['Recibes un correo sospechoso y no lo abres', 'no'], ['Te llega un mensaje con un enlace raro y no lo pulsas', 'no'],
  ], fbk('¡Muy bien!', 'Revisa los que fallaron.', 'Es brecha cuando los datos se pierden, se alteran o los ve quien no debe, también si lo hace alguien de dentro. Un correo sospechoso que no abres no es brecha en sí, pero se avisa como incidente.')) })
  .add({ title: 'Sala de planta', obj: 4, text: 'Esta sala tiene datos expuestos. Toca los fallos que veas; ojo, no todo está mal.', ix: ix.hotspots('assets/img/c5_sala.svg', 'Sala de planta con pantalla, pizarra, expediente, tablet, armario y cartel', [
    { x: 5.9, y: 31.4, w: 20.9, h: 23.3, label: 'Pantalla con la historia a la vista', correct: true, feedback: 'La historia clínica está abierta y una visita puede verla. Bloquea la pantalla al irte.' },
    { x: 35.6, y: 6.1, w: 27.2, h: 30.6, label: 'Pizarra con nombres y diagnósticos', correct: true, feedback: 'Nombres con diagnósticos en una pared a la vista de todos: no.' },
    { x: 35.6, y: 48.3, w: 17.8, h: 10, label: 'Expediente abierto en el mostrador', correct: true, feedback: 'Un PAI abierto sobre el mostrador lo ve cualquiera. Guárdalo.' },
    { x: 59.1, y: 37.2, w: 11.9, h: 19.4, label: 'Tablet con una foto en el grupo de planta', correct: true, feedback: 'Una foto de un residente en un grupo de WhatsApp: no es un canal seguro.' },
    { x: 4.4, y: 6.1, w: 13.1, h: 24, label: 'Armario cerrado con llave', correct: false, feedback: 'Eso está bien: los papeles bajo llave.' },
    { x: 66.9, y: 7.8, w: 14.7, h: 17.2, label: 'Cartel de horario de visitas', correct: false, feedback: 'Un horario no contiene datos personales.' },
  ], 'Encuentra los 4 fallos de la sala.', fbk('¡Buen ojo!', 'Mira de nuevo: hay cuatro fallos.', 'Pantalla visible, pizarra con nombres, expediente abierto y fotos en el grupo de planta: cada uno puede acabar en una brecha.'), { scored: true }) })
  .add({ title: 'Copia oculta, no copia', obj: 4, text: 'Cuando escribes a **varias familias a la vez**, los nombres y correos de todas se pueden ver si los pones en «Para» o en «CC».\n\nUsa siempre **CCO** (copia oculta): cada familia solo ve su mensaje. Y antes de pulsar «Enviar», mira los **adjuntos**.', img: { src: 'assets/img/c5_cco.svg', alt: 'Dos correos comparados: con todas las direcciones visibles en Para y con las direcciones ocultas en copia oculta', layout: 'top', full: true } })
  .add({ title: 'Correo a las familias', obj: 4, text: 'Eres de administración. Hay que avisar a unas 50 familias de un cambio en las visitas.', ix: ix.html({ ...W.chatStory({ contacto: { nombre: 'Dirección', emoji: '🧑‍💼', sub: 'Lunes · 9:00' }, nodos: {
    n1: { msgs: [['them', 'Mándales ya el aviso del nuevo horario de visitas a todas las familias, por favor. Son unas 50.']], choices: [
      { t: 'Pongo todas las direcciones en «Para» y lo envío', next: 'malo', q: 'bad', fb: 'Todas las familias verán los correos de las demás.' },
      { t: 'Pongo todas en «CC», así saben a quién más se ha mandado', next: 'malo', q: 'bad', fb: 'CC también es visible para todos.' },
      { t: 'Pongo la dirección del centro en «Para» y las familias en «CCO»', next: 'n2', q: 'good', fb: 'CCO: nadie ve las direcciones de los demás.' }] },
    malo: { msgs: [['sys', 'Llega una queja: una familia ve los nombres y correos de todas las demás.']], fin: { tipo: 'bad', titulo: 'Direcciones visibles', texto: 'Un centro sociosanitario fue sancionado por la AEPD por enviar correos a unos 50 familiares con las direcciones visibles (600 € tras reducciones), y siguió haciéndolo tras avisos. Repetirlo agrava.' } },
    n2: { msgs: [['sys', 'Envías el correo. Después de pulsar «Enviar» te das cuenta de que has adjuntado la hoja de cálculo con los datos de los residentes en lugar del cartel de visitas.']], choices: [
      { t: 'Borro el correo de enviados y no digo nada', next: 'f_borra', q: 'bad', fb: 'Borrar impide saber qué pasó.' },
      { t: 'Escribo a las familias pidiéndoles que lo borren, sin avisar a nadie', next: 'f_solo', q: 'mid', fb: 'Sin avisar al centro, pierde tiempo.' },
      { t: 'Aviso ya a dirección y al DPD, sin borrar nada, y apunto qué adjunté y a cuántas familias', next: 'f_bien', q: 'good', fb: 'Avisar rápido nunca es el error.' }] },
    f_borra: { msgs: [['sys', 'Nadie sabe qué datos salieron ni a quién.']], fin: { tipo: 'bad', titulo: 'Pruebas borradas', texto: 'Sin pruebas, el centro no puede saber qué datos se enviaron. Ocultarlo es el error; avisar nunca lo es.' } },
    f_solo: { msgs: [['sys', 'Pasan horas hasta que alguien se entera.']], fin: { tipo: 'mid', titulo: 'Casi', texto: 'Pedir que lo borren puede hacerse, pero solo si tu responsable te lo indica. Lo primero es avisar: el reloj del centro ya corre.' } },
    f_bien: { msgs: [['sys', 'El centro puede valorar si debe notificar a la AEPD dentro de las 72 horas.']], fin: { tipo: 'good', titulo: 'Brecha bien gestionada', texto: 'Avisaste en minutos y sin borrar pruebas. Con lo que apuntaste, el centro puede documentar la brecha y decidir.' } },
  } }), est_seconds: 270, prompt: '' }) })
  .add({ title: 'El reloj de las 72 horas', obj: 4, text: 'Simula un viernes por la tarde: cada decisión gasta horas del plazo del centro.', ix: ix.html({ ...relojBrecha({ titulo: '',
    ayuda: 'Simulación didáctica con tres decisiones. El reloj muestra las horas que le quedan al centro para valorar la brecha y, si hay riesgo, notificarla.',
    inicio: { dia: 4, hora: 18.67, etiqueta: 'viernes 18:40' },
    etapas: [
      { titulo: 'Viernes, 18:40', texto: 'Acabas de enviar por correo el informe de una residente a otra «Marta». Te das cuenta del error. ¿Qué haces?', opciones: [
        { t: 'Llamo ya a mi responsable', h: 0.2, q: 'good', fb: 'En 12 minutos el centro ya lo sabe. Es lo que cuenta.' },
        { t: 'Espero al lunes a ver si Marta contesta', h: 62, q: 'bad', fb: 'Los fines de semana cuentan para el plazo. Tardar tanto no es un detalle: el centro puede llegar tarde sin saberlo.' },
        { t: 'Borro el correo de enviados', h: 0.5, q: 'bad', fb: 'Borrar impide saber qué pasó. Mejor no tocar nada.' }] },
      { titulo: 'Tu responsable contesta', texto: '«Gracias por avisar. No borres nada y apunta qué ha pasado». ¿Qué haces?', opciones: [
        { t: 'Apunto la hora, a quién fue, qué datos y de cuántas personas', h: 0.3, q: 'good', fb: 'Con eso el centro documenta la brecha.' },
        { t: 'Escribo a Marta por WhatsApp personal para que lo borre, sin decir nada a nadie', h: 1, q: 'bad', fb: 'Eso solo si te lo indica tu responsable, y por el canal del centro.' },
        { t: 'Lo apunto mañana, que ahora tengo turno', h: 14, q: 'mid', fb: 'Los detalles se olvidan y el reloj sigue corriendo.' }] },
      { titulo: 'El centro y el DPD preguntan', texto: 'Quieren saber exactamente qué pasó, incluido por qué canal lo enviaste.', opciones: [
        { t: 'Les cuento todo, incluido que fue un despiste mío', h: 0.2, q: 'good', fb: 'Sin culpabilizar: equivocarse es humano.' },
        { t: 'Digo que fue otro compañero quien se equivocó', h: 3, q: 'bad', fb: 'Confunde la investigación y retrasa las decisiones.' },
        { t: 'Me callo un detalle que me deja mal', h: 6, q: 'bad', fb: 'Un detalle callado puede cambiar la valoración del riesgo.' }] },
    ],
    final: {
      good: ['El centro llega con casi todo el plazo', 'Con eso puede valorar si hay riesgo y, si lo hay, notificar a la AEPD y, en su caso, avisar a las personas.'],
      mid: ['Plazo justo', 'El centro aún puede actuar, pero con prisas y con menos margen para valorar con calma.'],
      bad: ['El plazo casi se agota', 'Tardar en avisar le quita margen al centro. Avisar rápido nunca es el error; esconderlo, sí.'],
      nota: 'Plazo (RGPD, art. 33): el centro debe notificar a la AEPD sin dilación y, si es posible, a más tardar 72 horas después de tener constancia, salvo que sea improbable que haya riesgo. La brecha se documenta siempre.',
    } }), est_seconds: 360, prompt: '' }) })
  .add({ title: 'Completa el plazo', obj: 4, text: 'Completa lo que debe hacer el centro ante una brecha.', ix: ix.fill('Elige la palabra correcta en cada hueco.', 'El centro debe notificar a la AEPD una brecha con riesgo, si es posible, en [[72 horas]] desde que tiene [[constancia]]. Los fines de semana [[cuentan]]. Si el riesgo es alto, también hay que avisar a [[las personas afectadas]].', ['24 horas', 'sospechas', 'no cuentan', 'los vecinos'],
    fbk('¡Plazo claro!', 'Revisa los huecos.', 'RGPD arts. 33 y 34: unas 72 horas desde que el centro tiene constancia, fines de semana incluidos; y si hay alto riesgo, avisar también a las personas afectadas.')) })
  .add({ title: 'Un compañero te lo cuenta', obj: 4, text: 'Eres supervisora.', ix: ix.scenario('Un compañero te cuenta que ayer comentó el caso de una residente en un grupo de Telegram con su familia. Ya lo ha borrado.', '¿Qué haces?', [
    ['Le digo que no pasa nada, ya lo borró', false, 'Borrarlo no deshace la brecha: la información ya salió y el centro no sabe nada.'],
    ['Registro lo ocurrido, aviso al DPD y valoro con él si hay que notificar: el reloj de las 72 horas corre desde que yo lo sé', true, 'Eso es: ahora el centro «tiene constancia». Registrar, valorar el riesgo y activar el protocolo.'],
    ['Espero a fin de mes y lo incluyo en el informe', false, 'Esperar gasta el plazo del centro. Avisar rápido nunca es el error.'],
  ], fbk('¡Muy bien!', 'No era esa.', 'Quien supervisa convierte el aviso en acción: documenta, consulta al DPD y valora la notificación dentro del plazo.')) })
  .add({ title: 'Qué pasa después de avisar', obj: 4, text: 'Tu aviso pone en marcha al centro. Recorre los pasos.', ix: ix.timeline([
    ['1', 'Tú avisas', 'Cuentas lo que has visto o hecho, sin culpas. A partir de aquí el centro «tiene constancia».'],
    ['2', 'El centro documenta', 'Se apunta qué pasó, cuándo, qué datos y cuántas personas. Toda brecha se documenta, también las que no se notifican.'],
    ['3', 'Se valora el riesgo', 'Con el DPD, el centro decide si es improbable que haya riesgo para las personas o no.'],
    ['4', 'Notificación a la AEPD', 'Si hay riesgo, se notifica sin dilación y, si es posible, en 72 horas. Si hay retraso, hay que justificarlo.'],
    ['5', 'Aviso a las personas', 'Si el riesgo es alto, se les comunica también a ellas, en lenguaje claro y sencillo.'],
  ]) })
  .add({ title: 'Casos reales', obj: 4, text: 'Casos recogidos por la AEPD. No son para asustar: muestran que los errores cotidianos tienen consecuencias.', ix: ix.accordion([
    ['Centro: correo sin copia oculta', 'Un centro sociosanitario envió correos a unos 50 familiares con **todas las direcciones visibles**, y siguió haciéndolo tras avisos. La AEPD la sancionó (PS/00208-2024): 1.000 €, reducidos a 600 € por pago voluntario.\n\nUn error pequeño y repetido sale caro.'],
    ['Farmacia de centros sociosanitarios: Excel sin cifrar', 'Una farmacia que servía a centros sociosanitarios recibía y enviaba hojas de Excel con nombres y datos de salud por correo normal, sin cifrar. Sanción de 11.000 €, reducida a 6.600 € (PS/00177-2025).\n\nEl eslabón débil puede ser un **proveedor**.'],
    ['Historia clínica comentada en un WhatsApp', 'En un hospital público se comentó la historia clínica de un profesional en un grupo de WhatsApp de personal médico y un celador. La AEPD declaró la infracción de la confidencialidad (PS/00187/2024) y ordenó medidas.\n\nEl grupo de planta no es privado ni seguro.'],
    ['Mirar por curiosidad', 'La AEPD ha resuelto casos de personal sanitario que accedió a historias clínicas sin relación asistencial. En uno (PS/00587/2021), una enfermera miró la de una compañera: apercibimiento y medidas. En otro (PS/00097/2023) propuso actuaciones disciplinarias contra los facultativos.'],
    ['Una foto en Instagram', 'No es un centro sociosanitario, pero enseña mucho: una empresa publicó la foto de una clienta con la cara tapada con un círculo negro; la AEPD impuso 10.000 € (PS/00066/2022). Sin base legal, una foto es un riesgo, y tapar la cara puede no bastar.'],
  ]) })
  .add({ type: 'summary', title: 'Lo que te llevas', text: '- Una brecha es perder, cambiar o dejar ver datos a quien no debe, por accidente o a propósito.\n- El centro tiene unas 72 horas desde que lo sabe; los fines de semana cuentan.\n- Avisa en minutos u horas, no en días.\n- Avisar rápido nunca es el error; esconderlo, sí.' })

// ───────────────────────── Lección 6 ─────────────────────────
const l6 = c.unit('Lección 6. Si algo sale mal, repaso y reto', 'El protocolo de cinco pasos, a quién avisar y un repaso final con compromiso.')
l6.add({ type: 'cover', title: 'Si algo sale mal', text: 'Lección 6 · Repaso y reto' })
  .add({ title: 'Cinco pasos ante un incidente', obj: 5, text: 'Es una síntesis de buenas prácticas; tu centro fijará sus contactos y canales. **Pregunta hoy** quién es tu responsable y quién es el DPD (delegado de protección de datos), la persona que asesora al centro y es su punto de contacto con la AEPD.\n\n::: info\nSi es un ciberataque (equipo bloqueado, mensaje de rescate): no pagues ni contactes con el atacante, avisa, y si necesitas ayuda técnica, la Línea de Ayuda en Ciberseguridad de INCIBE es el **017**, gratuita y confidencial.\n:::', img: { src: 'assets/img/c5_pasos.svg', alt: 'Cinco pasos ante un incidente: detecta y para, no borres nada, avisa ya, contén el daño y documenta qué pasó', layout: 'top', full: true } })
  .add({ title: 'Ordena el protocolo', obj: 5, text: 'Ordena los cinco pasos que sigues si algo sale mal.', ix: ix.sort('Pon los pasos en orden.', [
    'Detecto y paro: no sigo «arreglándolo» por mi cuenta',
    'No borro nada: ni el correo, ni el mensaje, ni el archivo',
    'Aviso ya a mi responsable, también si fue error mío',
    'Contengo solo lo que me indiquen (desconectar, retirar una publicación…)',
    'Documento qué pasó, cuándo, qué datos y a cuántas personas',
  ], fbk('¡Protocolo dominado!', 'Casi: piensa qué haces primero y qué no debes hacer nunca.', 'Primero parar y no borrar; después avisar; contener solo lo indicado, y documentar para que el centro cumpla con sus obligaciones.')) })
  .add({ title: 'Un pendrive en el despacho', obj: 5, text: 'Eres de mantenimiento y estás arreglando el aire acondicionado de un despacho.', ix: ix.scenario('Sobre la mesa hay un pendrive y una hoja que parece una lista de residentes con su medicación. No hay nadie más.', '¿Qué haces?', [
    ['Lo recojo, no leo más de lo necesario y se lo entrego a mi responsable diciendo dónde y cuándo lo encontré', true, 'Perfecto: lo recoges, avisas y no lo tiras ni te lo llevas. Es una posible brecha y hay que documentarla.'],
    ['Lo enchufo en mi móvil para ver de quién es', false, 'Puede ser un riesgo para tu móvil y supone acceder a datos que no necesitas.'],
    ['Lo dejo donde estaba para no meterme en líos', false, 'Si alguien más lo ve, los datos siguen expuestos. Avisar nunca es meterte en líos.'],
    ['Lo tiro a la basura para que no lo vea nadie', false, 'Tirarlo borra el rastro de lo ocurrido y puede acabar en manos equivocadas.'],
  ], fbk('¡Eso es!', 'No era la mejor opción.', 'Un pendrive o un papel con datos de residentes es una posible brecha: recógelo, entrégalo a tu responsable y cuéntale dónde y cuándo lo hallaste.')) })
  .add({ title: 'Repasa con tarjetas', obj: 5, text: 'Pulsa cada tarjeta, piensa la respuesta y dale la vuelta.', ix: ix.flash([
    ['Dato de salud', 'Todo lo que cuenta algo de la salud física o mental de alguien. Categoría especial.'],
    ['Necesidad de conocer', '¿Lo necesito para mi trabajo con esta persona, ahora? Si no, no lo abras, no lo comentes, no lo pases.'],
    ['Llamada de un familiar', 'Compruebo quién es, miro si consta autorizado y, ante la duda o consulta clínica, no doy datos: «le llama la enfermera».'],
    ['Fotos de residentes', 'Consentimiento para esa finalidad y canal oficial del centro. Nunca desde tu móvil a tu perfil.'],
    ['Correo a varias familias', 'Siempre en **CCO** (copia oculta).'],
    ['Brecha', 'Perder, cambiar o dejar ver datos a quien no debe, por accidente o a propósito.'],
    ['Las 72 horas', 'Plazo del centro para notificar a la AEPD si hay riesgo, desde que tiene constancia. Cuentan los fines de semana. Tú avisa en minutos.'],
    ['Primeros pasos', 'Detecta y para, no borres pruebas y avisa YA.'],
    ['DPD', 'Delegado de protección de datos: asesora, supervisa y es el contacto con la AEPD. Pregunta quién es el de tu centro.'],
    ['017', 'Línea de Ayuda en Ciberseguridad de INCIBE: gratuita y confidencial. Ayuda técnica; no sustituye avisar a tu responsable.'],
  ]) })
  .add({ title: 'Sopa de letras', obj: 5, text: 'Encuentra las palabras clave del curso.', ix: ix.wordsearch(['CONFIDENCIAL', 'BRECHA', 'PERMISO', 'AVISA', 'CCO', 'DPD', 'AEPD', 'DATOS', 'SALUD', 'FOTO']) })
  .add({ title: 'Mi compromiso', obj: 5, text: 'Marca lo que te comprometes a hacer a partir de hoy.', ix: ix.html({ ...W.pledge({ titulo: '', intro: 'Marca lo que te comprometes a hacer desde hoy.', minimo: 5, items: [
    'No miro ni comento datos de residentes que no necesito para mi trabajo',
    'Antes de informar a una familia, compruebo quién es; ante la duda, paso la llamada',
    'Las fotos y vídeos, solo por el canal del centro y con consentimiento',
    'Los correos a varias familias, siempre en CCO',
    'No publico nada del trabajo en mis redes',
    'Si algo sale mal, aviso YA y no borro nada',
    'Sé quién es mi responsable y quién es el DPD de mi centro',
  ], final: '¡Compromiso firmado! Gracias por cuidar también de los datos de las personas que cuidas.' }), est_seconds: 90, prompt: '' }) })
  .add({ type: 'summary', title: '¡Lo has conseguido!', text: 'Has recorrido las seis lecciones: datos, confidencialidad, fotos, redes, brechas y protocolo.\n\n- Los datos de salud se usan para cuidar, no para otra cosa.\n- Ante la duda, para y pregunta.\n- Si algo sale mal, avisa ya y no borres nada.\n\nAhora, el test final.' })

// ───────────────────────── Glosario, bibliografía y test ─────────────────────────
c.glossary('Dato personal', 'Información que permite saber quién es una persona: nombre, cara en una foto, voz, DNI, teléfono…')
  .glossary('Dato de salud', 'Información sobre la salud física o mental de una persona: diagnóstico, medicación, caídas, dietas…')
  .glossary('Categoría especial', 'Tipo de datos (como los de salud) que la ley protege con más fuerza.')
  .glossary('Confidencialidad', 'Deber de no contar lo que sabes por tu trabajo. Dura aunque dejes de trabajar en el centro.')
  .glossary('Necesidad de conocer', 'Regla práctica: solo accedes y cuentas lo que necesitas para tu trabajo con esa persona, y solo a quien también lo necesita.')
  .glossary('Consentimiento', 'Permiso libre, claro y concreto para una finalidad, dado con una acción afirmativa. Si la persona no puede darlo, lo da su representante legal.')
  .glossary('Brecha de datos', 'Pérdida, alteración, destrucción o acceso o comunicación no autorizados de datos personales, por accidente o a propósito.')
  .glossary('72 horas', 'Plazo en el que el centro debe notificar a la AEPD una brecha con riesgo, a ser posible, desde que tiene constancia de ella.')
  .glossary('CCO (copia oculta)', 'Campo del correo para poner destinatarios sin que los demás los vean.')
  .glossary('DPD', 'Delegado de protección de datos: asesora al centro, supervisa el cumplimiento y es el punto de contacto con la AEPD y con las personas.')
  .glossary('AEPD', 'Agencia Española de Protección de Datos: autoridad que vela por el cumplimiento de la normativa de datos.')
  .glossary('Ingeniería social', 'Técnica de engaño que busca ganarse tu confianza para que hagas algo, como dar datos o pulsar un enlace.')
  .glossary('Ransomware', 'Virus que «secuestra» los archivos de un equipo y pide un rescate. Si ocurre: no pagues, no toques más y avisa.')

c.bib('Parlamento Europeo y Consejo (2016). Reglamento (UE) 2016/679 (RGPD). Diario Oficial de la Unión Europea.', 'https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016R0679')
  .bib('Jefatura del Estado (2018). Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales. BOE.', 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673')
  .bib('Jefatura del Estado (2002). Ley 41/2002, básica reguladora de la autonomía del paciente. BOE.', 'https://www.boe.es/buscar/act.php?id=BOE-A-2002-22188')
  .bib('Jefatura del Estado (1995). Ley Orgánica 10/1995, del Código Penal (arts. 197 y 199). BOE.', 'https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444')
  .bib('AEPD (2020). Plan de inspección de oficio de la atención sociosanitaria. Agencia Española de Protección de Datos.', 'https://www.aepd.es/sites/default/files/2020-06/plan-inspeccion-oficio-atencion-sociosanitaria.pdf')
  .bib('AEPD (2021). Guía para la notificación de brechas de datos personales. Agencia Española de Protección de Datos.', 'https://www.aepd.es/guias/guia-brechas-seguridad.pdf')
  .bib('AEPD (2025). Memoria de la AEPD 2025. Agencia Española de Protección de Datos.', 'https://www.aepd.es/memorias/memoria-aepd-2025.pdf')
  .bib('AEPD. Resolución del procedimiento sancionador PS/00208-2024. Agencia Española de Protección de Datos.', 'https://www.aepd.es/documento/ps-00208-2024.pdf')
  .bib('INCIBE. Ingeniería social. Aprende Ciberseguridad, Instituto Nacional de Ciberseguridad.', 'https://www.incibe.es/aprendeciberseguridad/ingenieria-social')
  .bib('INCIBE. Línea de Ayuda en Ciberseguridad 017. Instituto Nacional de Ciberseguridad.', 'https://www.incibe.es/linea-de-ayuda-en-ciberseguridad')

c.finalTest('Test final', [
  ['¿Cuál de estos es un dato de salud?', [['El color del uniforme de la gerocultora', false], ['Que doña Rosa toma una pastilla para la tensión cada mañana', true], ['La hora de apertura del comedor', false]], 'Es información sobre su salud, por tanto categoría especial. El uniforme y el horario del comedor no son datos de una persona.', 0],
  ['¿Por qué los datos de salud tienen una protección reforzada?', [['Porque la ley los considera categoría especial: se usan para cuidar, no para otra cosa', true], ['Porque solo puede verlos dirección', false], ['Porque no se pueden anotar en ningún sitio', false]], 'Tienes permiso para usarlos para cuidar, no para otra cosa. Los profesionales que atienden a la persona sí los consultan.', 0],
  ['Una persona de otra planta te pide mirar la ficha de un residente «solo por curiosidad». ¿Qué haces?', [['La miro, es solo un momento', false], ['La miro si no se entera nadie', false], ['No: solo accedo a lo que necesito para mi trabajo', true]], 'Necesidad de conocer: curiosidad no es necesidad. Los accesos quedan registrados y pueden ser una infracción.', 1],
  ['Dejas de trabajar en el centro. ¿Sigue el deber de confidencialidad?', [['No, se acaba con el contrato', false], ['Sí, se mantiene aunque finalice la relación', true], ['Solo durante un año', false]], 'El deber de confidencialidad se mantiene aunque dejes el centro.', 1],
  ['Llama una persona que dice ser la hija de un residente y pide su diagnóstico. ¿Qué haces?', [['Se lo digo: suena preocupada', false], ['Compruebo identidad y autorización, no doy datos de salud y paso la llamada a quien corresponde', true], ['Le digo que una compañera me lo ha contado', false]], 'Con carácter general se necesita el permiso del residente, y la información clínica la da quien corresponde según el procedimiento del centro.', 1],
  ['En la fiesta de verano se hace una foto de grupo. ¿Puede publicarse en la web del centro?', [['Sí, es una fiesta y todos lo saben', false], ['Sí, si se tapa la cara de uno', false], ['Solo si hay consentimiento de quienes salen para esa finalidad (o de sus representantes)', true]], 'En eventos y fiestas hay que pedir consentimiento específico, salvo presencia meramente casual al fondo.', 2],
  ['Un residente está incapacitado judicialmente. ¿Quién da el consentimiento para sus fotos?', [['Cualquier trabajador del centro', false], ['Nadie: no hace falta', false], ['Su tutor o representante legal', true]], 'Si la persona no puede consentir, lo hace su tutor o representante legal.', 2],
  ['Un número desconocido te escribe por WhatsApp: «Soy el técnico, dime la contraseña del programa de residentes». ¿Qué haces?', [['Se la doy, parece de confianza', false], ['No la doy y lo verifico con mi responsable por un canal conocido', true], ['Le doy solo la mitad', false]], 'Es ingeniería social: nadie debe conocer tu contraseña. Verifica siempre por otro canal.', 3],
  ['¿Qué es una brecha de datos personales?', [['Solo un ataque de hackers', false], ['Solo la pérdida de un ordenador', false], ['Cualquier pérdida, alteración o acceso no autorizado a datos, aunque sea por error', true]], 'Un correo mal enviado o un papel olvidado también son brechas, y el acceso indebido de alguien de dentro también.', 4],
  ['¿Cuánto tiempo tiene el centro para notificar a la AEPD una brecha con riesgo, a ser posible?', [['Unas 72 horas desde que tiene constancia; cuentan también fines de semana y festivos', true], ['Un mes', false], ['Diez días laborables', false]], 'Es el plazo del RGPD (art. 33), por eso hay que avisar en minutos u horas.', 4],
  ['Has mandado por correo el informe de una residente a la persona equivocada. ¿Qué haces?', [['Borro el correo para que no se vea', false], ['Aviso de inmediato a mi responsable o al DPD, sin borrar nada', true], ['Espero a ver si pasa algo', false]], 'Avisar rápido nunca es el error. Borrar impide saber qué pasó y esperar gasta el plazo del centro.', 5],
  ['Tu ordenador muestra un mensaje que dice que sus archivos están cifrados y piden un rescate. ¿Qué haces?', [['Pago el rescate para recuperar los datos', false], ['Reinicio el ordenador varias veces', false], ['No toco más, no pago y aviso al responsable, siguiendo sus instrucciones', true]], 'Detecta, no manipules y avisa. La Línea de Ayuda de INCIBE (017) puede orientar técnicamente, pero no sustituye avisar a tu responsable.', 5],
], 'Responde con calma: son situaciones reales de tu turno. Una pregunta por pantalla.')

await c.build()
