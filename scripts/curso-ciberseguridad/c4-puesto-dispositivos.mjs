/**
 * Curso 4 · «Mi puesto, mis dispositivos y mi wifi» — programa de ciberseguridad para centros
 * sociosanitarios. Fuente única de datos: docs/curso-ciberseguridad/fuentes/04-puesto-dispositivos-redes.md
 *
 *   node scripts/curso-ciberseguridad/run.mjs c4-puesto-dispositivos.mjs
 */
import { CourseBuilder, ix, fbk } from './lib.mjs'
import * as W from './widgets.mjs'
import * as X from './c4-widgets.mjs'
import * as A from './c4-art.mjs'

const KIT = 'C:/Users/Jose Alberto Arruego/Downloads/kit_concienciacion/kit_concienciacion/RecursosFormativos/'

const OBJ = [
  'Proteger mi puesto: bloquear la pantalla, cerrar sesión y no dejar datos ni claves a la vista.',
  'Mantener los equipos al día y no instalar ni conectar nada que el centro no haya autorizado (USB, programas).',
  'Elegir la wifi adecuada para cada dispositivo y saber qué hacer en una red insegura.',
  'Usar el móvil y la mensajería con criterio y actuar con rapidez si se pierde o se roba un dispositivo.',
  'Guardar, compartir y proteger la información (copias, Drive, teletrabajo, papel) donde y como indica el centro.',
  'Verificar a visitas y técnicos, y saber a quién avisar ante un incidente.',
]

const c = new CourseBuilder({
  id: 'cibersegsoc-c4-puesto-dispositivos', identifier: 'CIBERSEG_C4',
  title: 'Mi puesto, mis dispositivos y mi wifi',
  subtitle: 'Curso 4 · Ciberseguridad en centros sociosanitarios',
  description: 'Cómo proteger tu puesto de trabajo, la tablet de planta, el móvil y la wifi en una residencia o centro sociosanitario: pantallas bloqueadas, USB y programas, redes, WhatsApp, copias, teletrabajo y visitas. Con simuladores, casos por puesto y retos.',
  hours: 1.4, primary: '#0e8f86', accent: '#6DC3C0',
  moduleTitle: 'Cuida tu puesto, tus aparatos y tus redes',
  objectives: OBJ,
})

// ───────────────────────────── Ilustraciones SVG ─────────────────────────────
const IMG = {
  portada: c.asset('assets/img/c4_portada.svg', A.portada()),
  puesto: c.asset('assets/img/c4_puesto.svg', A.puesto()),
  tablet: c.asset('assets/img/c4_tablet.svg', A.tabletPlanta()),
  enfermeria: c.asset('assets/img/c4_enfermeria.svg', A.enfermeria()),
  usb: c.asset('assets/img/c4_usb.svg', A.usb()),
  router: c.asset('assets/img/c4_router.svg', A.router()),
  movil: c.asset('assets/img/c4_movil.svg', A.movil()),
  perdido: c.asset('assets/img/c4_movil_perdido.svg', A.movilPerdido()),
  copias: c.asset('assets/img/c4_copias.svg', A.copias321()),
  tele: c.asset('assets/img/c4_teletrabajo.svg', A.teletrabajo()),
  visita: c.asset('assets/img/c4_visita.svg', A.visita()),
  guardianes: c.asset('assets/img/c4_guardianes.svg', A.guardianes()),
}
const KITIMG = {
  winl: c.assetFile('assets/img/c4_kit_0601.png', KIT + '06_PuestoTrabajo/Consejos/0601_PuestoTrabajo.png'),
  wifi: c.assetFile('assets/img/c4_kit_0801.png', KIT + '08_Móviles/Consejos/0801_Móviles.png'),
}
const top = (src, alt, caption = '') => ({ src, alt, caption, layout: 'top', full: true })

// ───────────────────────────── Portada del curso ─────────────────────────────
c.intro({ type: 'cover', title: 'Mi puesto, mis dispositivos y mi wifi', text: 'Tu puesto, la tablet de planta, el móvil y la wifi: cómo cuidarlos en tu día a día, sin tecnicismos.', img: { src: IMG.portada, alt: 'Una gerocultora con una tablet de planta rodeada de un escudo, un candado, el símbolo wifi y un USB tachado', full: true } })

// ═════════════════════ Lección 1 · Puesto limpio y pantallas bloqueadas ═════════════════════
const l1 = c.unit('Lección 1. Puesto limpio y pantallas bloqueadas', 'Tu puesto no debe contar nada de nadie cuando te levantas: pantalla bloqueada, claves y papeles fuera de la vista, y sesión cerrada en los equipos compartidos.')
l1.add({ type: 'cover', title: 'Puesto limpio y pantallas bloqueadas', text: '' })
  .add({
    title: 'Tu puesto cuenta', obj: 0,
    text: `Tu **puesto de trabajo** es todo lo que usas para trabajar: el mostrador, el ordenador, la tablet de planta, el móvil, el papel y la wifi.

A veces el peligro no llega por Internet: basta un ordenador sin bloquear, un USB que alguien encontró o una persona con chaleco que dice ser «el técnico».

::: fact
Según ENISA (la agencia de ciberseguridad de la UE, 2023), el 54 % de las amenazas del sector salud europeo son *ransomware*: programas que secuestran los datos. Son cifras de 2021-2023 y de toda la UE, no de tu centro.
:::`,
    img: top(IMG.puesto, 'Un puesto de trabajo con ordenador, tablet de planta, móvil, papel y wifi señalados con etiquetas'),
  })
  .add({
    type: 'objectives', title: 'Qué vas a conseguir', obj: 0,
    text: `Al terminar este curso sabrás:

${OBJ.map((o) => '- ' + o.replace(/\.$/, '')).join('\n')}`,
  })
  .add({
    title: 'Elige tu puesto', obj: 0,
    text: 'Cada puesto tiene sus propios riesgos. Toca el tuyo y verás qué cuidar; el resto del curso sirve para todos.',
    ix: ix.tabs([
      ['Gerocultor/a', `- La **tablet de planta** la usa mucha gente: entra con tu usuario y **cierra sesión** al acabar.
- No hagas fotos de residentes con tu móvil personal (es norma del centro; pregunta cuál es).
- Si algo se pierde o se rompe, **avisa** al responsable.`],
      ['Auxiliar / enfermería', `- La sala de enfermería se queda sola unos minutos: **bloquea** (Windows + L) antes de levantarte.
- Partes y hojas de turno, fuera de la vista de visitas.
- Datos de residentes por WhatsApp: lo mínimo y solo por canales que el centro autorice.`],
      ['Administración / dirección', `- Los listados de residentes que ya no necesitas, a la **trituradora**.
- Ni un USB desconocido, aunque llegue por correo postal «de la mutua».
- Tu Drive es el **del centro**; nunca el personal.`],
      ['Supervisión', `- Predica con el ejemplo: pantalla bloqueada y mesa limpia.
- Las visitas y los técnicos, **acompañados y verificados**.
- Cuando alguien avise de un problema, agradécelo: avisar rápido nunca es motivo de reprimenda.`],
      ['Mantenimiento', `- **Cuartos de comunicaciones** cerrados, sin la llave puesta.
- Cámaras y aparatos nuevos: **cambia la clave de fábrica**.
- No conectes ni muevas equipos médicos conectados sin avisar a informática.
- A los técnicos externos: identificación, confirmación y compañía.`],
    ]),
  })
  .add({
    title: 'Mesa limpia, pantalla bloqueada', obj: 0,
    text: `Al levantarte, tu puesto no debe contar nada de nadie.
- **Bloquea la pantalla**: en Windows, tecla Windows + L. Tarda un segundo.
- **Nada de claves en post-it**: ni en la pantalla ni bajo el teclado.
- **Papeles con datos de residentes** (partes, listados, recetas): fuera de la vista y bajo llave.
- Al acabar la jornada, apaga o cierra sesión.

::: tip
En el móvil y la tablet, pon el bloqueo automático con el menor tiempo posible.
:::`,
    img: { src: KITIMG.winl, alt: 'Cartel que recomienda usar la tecla Windows más L cada vez que te levantes', caption: 'Kit de concienciación de INCIBE.', layout: 'right', width: 33 },
  })
  .add({
    title: 'Bloquea a tiempo', obj: 0,
    text: 'Un turno cualquiera. En cada situación, ¿bloqueas, cierras sesión o no hace falta? Tienes unos segundos (o ve a tu ritmo con la casilla).',
    ix: ix.html({
      ...X.bloqueaATiempo({
        seg: 9, titulo: '',
        situaciones: [
          { e: '🔔', t: 'Suena el timbre de una habitación. Sales del control; en la pantalla se ve la medicación de una residente.', ok: 0, fb: 'Dos minutos bastan para que pase una visita o un residente y lo vea. Windows + L tarda un segundo.' },
          { e: '🧾', t: 'Acabas tu turno en la tablet compartida de la planta. Entra tu compañera de tarde.', ok: 1, fb: 'En un equipo compartido, bloquear no basta: si no cierras sesión, ella entraría como tú. Cierra siempre al terminar.' },
          { e: '☕', t: 'Vas a por un café, solo un minuto. En recepción dejas abierto el listado de visitas.', ok: 0, fb: 'Un minuto es suficiente. Bloquear es tan corto como decir «ahora vengo».' },
          { e: '👵', t: 'Un familiar se acerca al mostrador mientras tienes abierta la ficha de otro residente.', ok: 0, fb: 'Antes de atenderle, bloquea o cambia de pantalla: lo que ve no es suyo.' },
          { e: '📅', t: 'Estás sentado/a leyendo el cuadrante de turnos (sin datos de residentes) y no te vas a mover.', ok: 2, fb: 'No todo exige un gesto: sigues delante, con la pantalla a la vista y sin datos sensibles. Bloquear es para cuando te alejas.' },
          { e: '🏁', t: 'Fin de jornada en el despacho de administración. Te marchas hasta mañana.', ok: 1, fb: 'Al terminar, cierra sesión (y apaga el equipo si el centro lo pide). Bloquear es para ausencias cortas.' },
          { e: '🚶', t: 'Un residente entra en la sala de enfermería mientras estás de espaldas guardando material, medio minuto.', ok: 0, fb: 'Medio minuto de espaldas ya es suficiente para que alguien toque o lea. Bloquea cada vez que dejes de mirar la pantalla.' },
        ],
      }), prompt: '', est_seconds: 480,
    }),
  })
  .add({
    title: 'Tablet de planta compartida', obj: 0,
    text: `En una tablet u ordenador de planta compartido, mucha gente usa el mismo aparato.
- Entra **con tu propio usuario** si el centro lo permite.
- **No marques «Recordar contraseña»**: quien lo coja después entrará como tú.
- **Cierra sesión** al terminar tu turno; bloquear no basta.

::: info
Esto es una buena práctica propuesta: cada centro decide cómo organizarlo. Si no puedes entrar con tu usuario, avisa a tu responsable.
:::`,
    img: top(IMG.tablet, 'Tablet de planta con la sesión de Marta abierta: el registro quedaría a su nombre'),
  })
  .add({
    title: 'Turno de tarde en planta 2', obj: 0,
    text: 'Llegas al turno de tarde. Decide con la tablet de planta en la mano.',
    ix: ix.html({
      ...W.chatStory({
        contacto: { nombre: 'Tablet de la planta 2', emoji: '📟', sub: 'turno de tarde' },
        nodos: {
          n1: { msgs: [['sys', 'Tienes que registrar un cambio postural.'], ['them', 'Sesión abierta: MARTA (turno de mañana)']], choices: [
            { t: 'Registro con su sesión: es un momento', next: 'bad1', q: 'bad', fb: 'El registro quedaría a nombre de Marta: se pierde la trazabilidad de quién hizo qué.' },
            { t: 'Cierro su sesión y entro con mi usuario', next: 'n2', q: 'good', fb: 'Así cada registro queda a nombre de quien lo hace.' },
            { t: 'Lo apunto en una libreta y lo paso luego', next: 'n1', q: 'mid', fb: 'Apuntar datos del residente en papeles sueltos no es buena idea. Registra en la aplicación autorizada con tu usuario.' },
          ] },
          n2: { msgs: [['sys', 'Al entrar, el navegador te ofrece guardar tu contraseña.']], choices: [
            { t: 'Pulso «Guardar», me ahorro escribirla', next: 'bad2', q: 'bad', fb: 'En una tablet compartida, la siguiente persona entraría con tu cuenta.' },
            { t: 'Pulso «Ahora no»', next: 'n3', q: 'good', fb: 'Bien: en un equipo compartido no se recuerdan contraseñas.' },
          ] },
          n3: { msgs: [['sys', 'Terminas tu turno de tarde.']], choices: [
            { t: 'Dejo la tablet con mi sesión abierta, vendrá la de noche', next: 'bad3', q: 'bad', fb: 'La de noche trabajaría con tu sesión.' },
            { t: 'Cierro sesión y aviso si la batería o la pantalla fallan', next: 'good', q: 'good', fb: 'Perfecto.' },
          ] },
          bad1: { msgs: [['sys', 'El cambio postural queda registrado a nombre de Marta.']], fin: { tipo: 'bad', titulo: 'Registro a nombre de otra persona', texto: 'Parece pequeño, pero un registro con el usuario equivocado es un problema de trazabilidad y de responsabilidad. Cierra su sesión y entra con la tuya.' } },
          bad2: { msgs: [['sys', 'La tablet guarda tu contraseña.']], fin: { tipo: 'bad', titulo: 'Cuenta abierta para todos', texto: 'En un aparato compartido, no pulses nunca «Recordar contraseña».' } },
          bad3: { msgs: [['sys', 'La sesión sigue abierta toda la noche.']], fin: { tipo: 'bad', titulo: 'Tu sesión, en manos de otros', texto: 'Cierra sesión al terminar el turno: bloquear no basta en equipos compartidos.' } },
          good: { msgs: [['sys', 'Sesión cerrada.']], fin: { tipo: 'good', titulo: '¡Turno cerrado con buena nota!', texto: 'Tu usuario, tus registros, y la tablet lista para quien venga después.' } },
        },
      }), prompt: '', est_seconds: 330,
    }),
  })
  .add({
    title: 'Fallos en la sala de enfermería', obj: 0,
    text: 'Mira la sala con ojos de ciberseguridad. Hay fallos y también cosas bien hechas.',
    ix: ix.hotspots(IMG.enfermeria, 'Sala de enfermería con ordenador desbloqueado, post-it con clave, tablet con sesión ajena, USB sobre el mostrador, hoja en la pared, puerta de comunicaciones entreabierta, papelera con listados, armario cerrado, ordenador bloqueado y trituradora',
      [
        { x: 9.4, y: 33.3, w: 18.6, h: 23.6, label: 'Ordenador con medicación a la vista', correct: true, feedback: 'Fallo: la pantalla está desbloqueada con medicación de residentes a la vista. Windows + L.' },
        { x: 28.5, y: 31.5, w: 6.5, h: 11, label: 'Post-it con la clave', correct: true, feedback: 'Fallo: la clave pegada en el monitor la ve cualquiera. Nada de post-it.' },
        { x: 48.4, y: 41.7, w: 14.1, h: 17.2, label: 'Tablet con la sesión de otra persona', correct: true, feedback: 'Fallo: sesión ajena abierta. Se cierra y se entra con el usuario propio.' },
        { x: 63, y: 55.5, w: 7.5, h: 8.5, label: 'USB sobre el mostrador', correct: true, feedback: 'Fallo: un USB desconocido. No se conecta; se entrega a informática.' },
        { x: 42.2, y: 11.1, w: 14.1, h: 19.4, label: 'Hoja de cambios posturales en la pared', correct: true, feedback: 'Fallo: datos de residentes colgados donde los ven las visitas.' },
        { x: 78.1, y: 13.9, w: 12.2, h: 69.4, label: 'Puerta de comunicaciones entreabierta, con la llave puesta', correct: true, feedback: 'Fallo: el cuarto de comunicaciones se cierra y la llave no se deja puesta.' },
        { x: 91.3, y: 68.3, w: 7, h: 15.6, label: 'Papelera con listados', correct: true, feedback: 'Fallo: los listados con datos van a la trituradora, no a la papelera.' },
        { x: 35.5, y: 36.1, w: 10.5, h: 20.8, label: 'Ordenador bloqueado', correct: false, feedback: 'Esto está bien: la pantalla está bloqueada. Sigue buscando fallos.' },
        { x: 6.3, y: 8.3, w: 15.6, h: 19.4, label: 'Armario cerrado con llave', correct: false, feedback: 'Esto está bien: el armario está cerrado. Busca otra cosa.' },
        { x: 68.8, y: 70, w: 8.1, h: 13.3, label: 'Trituradora', correct: false, feedback: 'Esto está bien: la trituradora es el destino correcto de los papeles con datos.' },
      ],
      'Toca un fallo de seguridad de la sala.', fbk('¡Bien visto!', 'Ese no es un fallo: está bien así. Sigue buscando.', 'Hay siete fallos: pantalla desbloqueada, post-it con clave, sesión ajena en la tablet, USB desconocido, hoja a la vista, puerta de comunicaciones abierta con la llave puesta y listados en la papelera.'), { scored: true }),
  })
  .add({
    type: 'summary', title: 'Lo que te llevas de la lección 1',
    text: `- Al levantarte: **Windows + L**. En equipos compartidos, **cierra sesión**.
- Nada de claves en post-it ni de datos de residentes a la vista.
- Papel con datos: bajo llave y, cuando ya no haga falta, a la **trituradora**.
- En la tablet de planta: tu usuario y sin «Recordar contraseña».`,
  })

// ═════════════════════ Lección 2 · Actualizar, antivirus y lo que no se instala ═════════════════════
const l2 = c.unit('Lección 2. Actualizar, antivirus y lo que no se instala', 'Equipos al día con antivirus y cortafuegos activos; y nada de USB desconocidos ni programas instalados por tu cuenta.')
l2.add({ type: 'cover', title: 'Actualizar, antivirus y lo que no se instala', text: '' })
  .add({
    title: 'Los tres guardianes del equipo', obj: 1,
    text: `Un equipo sin actualizar tiene **puertas abiertas** que los delincuentes ya conocen.
- En un equipo del centro, lo gestiona informática: **no pospongas indefinidamente** el aviso de reinicio.
- El **antivirus** detecta y elimina el código malicioso; el **cortafuegos** vigila lo que entra y sale de Internet. Hacen falta los dos.
- Si salta un aviso de virus: **no lo cierres sin más**, avisa a informática.

::: warn
Nunca desactives el antivirus para que «deje de molestar».
:::`,
    img: top(IMG.guardianes, 'Tres guardianes del equipo: actualizar, antivirus y cortafuegos'),
  })
  .add({
    title: 'Actualizar paso a paso', obj: 1,
    text: 'Mira cómo se comprueba si hay actualizaciones pendientes. En un equipo del centro lo hace informática; en tu móvil o tablet personal, hazlo tú.',
    video: {
      id: 'whjCYP4afwo', caption: 'Oficina de Seguridad del Internauta (INCIBE): «Pasos para actualizar tu ordenador Windows y Mac».',
      transcript: 'Resumen orientativo del vídeo de la Oficina de Seguridad del Internauta (INCIBE): explica, paso a paso, cómo comprobar si un ordenador con Windows o con Mac tiene actualizaciones pendientes y cómo instalarlas, y por qué conviene mantener el sistema siempre al día.',
    },
    notes: ['Verificar la transcripción viendo el vídeo (whjCYP4afwo): el dossier solo confirma título, canal y duración, no el contenido.'],
  })
  .add({
    title: 'Comprueba tu antivirus', obj: 1,
    text: 'Así se comprueba que el antivirus está activo. En un equipo del centro, si algo no cuadra, avisa a informática.',
    video: {
      id: 'hbmpmMWoElk', caption: 'Oficina de Seguridad del Internauta (INCIBE): «Comprueba si tienes activado el antivirus en tu ordenador Windows y Mac».',
      transcript: 'Resumen orientativo del vídeo de la Oficina de Seguridad del Internauta (INCIBE): enseña cómo comprobar que el antivirus está activado en un ordenador con Windows o con Mac.',
    },
    notes: ['Verificar la transcripción viendo el vídeo (hbmpmMWoElk): el dossier solo confirma título, canal y duración.'],
  })
  .add({
    title: 'Un USB que aparece', obj: 1,
    text: `Un pendrive «perdido» en el aparcamiento o un USB «de regalo» puede traer **malware** puesto a propósito. Al conectarlo, el virus puede entrar en la red del centro.

::: important
Según INCIBE (2022), los USB desconocidos no deben utilizarse en el ámbito laboral bajo ningún concepto, en especial los promocionales o de origen desconocido.
:::

Si encuentras uno: **no lo conectes** ni lo «pruebes para ver de quién es». Entrégalo a informática o a tu responsable.`,
    img: top(IMG.usb, 'Un USB desconocido con un aviso: no se conecta, se entrega a informática'),
  })
  .add({
    title: '¿Qué hago con este USB?', obj: 1,
    text: 'Tres situaciones de una residencia. Elige y mira qué pasaría.',
    ix: ix.html({
      ...X.usbSim({ titulo: '',
        regla: 'Regla de INCIBE: ningún USB desconocido en el trabajo, bajo ningún concepto. Se entrega, no se prueba.',
        casos: [
          { e: '💾', lugar: 'Aparcamiento', t: 'Al llegar al turno de noche ves un pendrive en el suelo, junto a tu coche. Lleva un llavero con el logo de una marca.', pasos: [
            { q: '¿Qué haces?', op: [
              { t: 'Lo conecto al ordenador de recepción: así sé de quién es', v: 'bad', fb: 'Justo eso es lo que busca quien lo dejó. Si trae malware, entra en la red del centro, con datos de residentes.' },
              { t: 'Lo dejo ahí y sigo, no es asunto mío', v: 'mid', fb: 'No lo has conectado, bien; pero otra persona puede recogerlo y conectarlo. Avisar protege a todos.' },
              { t: 'Lo recojo sin conectarlo y lo entrego a informática o a mi responsable', v: 'good', fb: 'Perfecto: no se conecta y lo revisa quien sabe. Cuenta dónde y cuándo lo viste.' },
            ] },
            { ctx: 'Lo tienes en la mano. Un compañero bromea: «Ya lo pruebo yo en mi portátil personal, que no pasa nada».', q: '¿Qué le dices?', op: [
              { t: 'Vale, es su portátil, no el del centro', v: 'bad', fb: 'El portátil personal también se conecta a la wifi y a cuentas del trabajo. El virus no distingue.' },
              { t: 'Lo tiramos a la basura y listo', v: 'mid', fb: 'Mejor entregarlo: quien lo revise puede saber si fue un intento de ataque y avisar al resto.' },
              { t: 'No: se entrega para que lo revisen quienes saben', v: 'good', fb: 'Eso es. Ni portátiles personales, ni «solo un momento».' },
            ] },
          ] },
          { e: '🎁', lugar: 'Recepción', t: 'Un comercial deja en recepción un USB «de regalo» con el logo de su empresa y un catálogo.', pasos: [
            { q: '¿Qué haces?', op: [
              { t: 'Lo uso para guardar mis cuadrantes, ¡regalado!', v: 'bad', fb: 'Los USB promocionales son justo los que INCIBE cita como especial riesgo. Y mezclarías cuadrantes con un aparato desconocido.' },
              { t: 'Lo conecto un momentito solo para ver el catálogo', v: 'bad', fb: 'Con un momento basta para que el malware se ejecute. Si quieres el catálogo, pídelo por correo.' },
              { t: 'No lo conecto y se lo paso a informática; el catálogo, que lo envíen por correo', v: 'good', fb: 'Bien: un regalo no es un permiso. Y el catálogo no necesita ningún USB.' },
            ] },
          ] },
          { e: '📮', lugar: 'Administración', t: 'Llega por correo postal un sobre «de la mutua» con una factura y un USB que dice «detalle de la factura».', pasos: [
            { q: '¿Qué haces?', op: [
              { t: 'Lo conecto: viene de un sobre oficial', v: 'bad', fb: 'Que llegue por correo postal no lo hace fiable: el origen de un USB desconocido no se puede comprobar.' },
              { t: 'Lo guardo en el cajón y ya veré', v: 'mid', fb: 'No lo conectas, bien; pero queda sin revisar. Mejor avisar.' },
              { t: 'Llamo a la mutua por un teléfono que ya tenía y aviso a informática antes de usarlo', v: 'good', fb: 'Verificar por un canal que tú eliges, no el del sobre, y avisar. Así se hace.' },
            ] },
          ] },
        ],
      }), prompt: '', est_seconds: 540,
    }),
  })
  .add({
    title: '¿Lo hago yo o lo pido?', obj: 1,
    text: 'Los programas «de por libre» (apps, conversores de PDF online, un Drive personal…) se llaman *shadow IT*: nadie del centro los ha aprobado. Clasifica estos gestos.',
    ix: ix.classify('Arrastra cada gesto a su grupo.',
      [['yo', 'Puedo hacerlo yo'], ['pido', 'Lo pido a informática'], ['no', 'No se hace nunca']],
      [
        ['Reiniciar cuando sale el aviso de actualizaciones', 'yo'],
        ['Bloquear la pantalla al levantarme', 'yo'],
        ['Instalar un programa gratuito «para ir más rápido»', 'pido'],
        ['Necesitar una herramienta nueva para el trabajo', 'pido'],
        ['Conectar un USB encontrado para ver de quién es', 'no'],
        ['Desactivar el antivirus porque avisa mucho', 'no'],
        ['Bajar una app del trabajo de una web que no es la oficial', 'no'],
      ],
      fbk('¡Bien clasificado!', 'Alguno está en otro grupo. Revisa los marcados.', 'Si necesitas algo nuevo, se pide; solo software legítimo y de fuentes oficiales. Lo que abre puertas a virus (USB desconocidos, antivirus apagado), nunca.')),
  })
  .add({
    type: 'summary', title: 'Lo que te llevas de la lección 2',
    text: `- Actualizaciones, antivirus y cortafuegos: **siempre activos**. Si avisa, no lo ignores.
- **USB desconocido**: no se conecta, se entrega.
- Programas y apps: **solo lo autorizado**; lo nuevo, se pide.`,
  })

// ═════════════════════ Lección 3 · Wifi ═════════════════════
const l3 = c.unit('Lección 3. La wifi del centro, la de invitados y las públicas', 'Cada red tiene su uso: la del centro para los equipos del centro, la de invitados para visitas y móviles personales, y las públicas, mejor evitarlas con aparatos de trabajo.')
l3.add({ type: 'cover', title: 'La wifi del centro, la de invitados y las públicas', text: '' })
  .add({
    title: 'Tres tipos de wifi', obj: 2,
    text: `En un centro suele haber varias redes, y cada una tiene su uso.
- **Wifi del centro**: para los equipos del centro.
- **Wifi de invitados**: para visitas, familiares y móviles personales; va **separada** de la red interna.
- **Wifi pública** (cafeterías, estaciones, hoteles): no la uses con dispositivos de trabajo.

::: info
Que la red de invitados esté separada es una recomendación de INCIBE si el router lo permite; cada centro lo monta a su manera.
:::`,
    img: top(IMG.router, 'Un router y tres redes: la del centro, la de invitados y las públicas'),
  })
  .add({
    title: 'Proteger tu wifi', obj: 2,
    text: 'Una wifi bien configurada protege la del centro y también la de tu casa.',
    video: {
      id: 'nV9zOtHDmcA', caption: 'Oficina de Seguridad del Internauta (INCIBE): «Cómo proteger tu red wifi».',
      transcript: 'Resumen orientativo del vídeo de la Oficina de Seguridad del Internauta (INCIBE): explica cómo proteger una red wifi, por ejemplo cambiando el nombre y la contraseña que trae el router de fábrica y usando un cifrado seguro.',
    },
    notes: ['Verificar la transcripción viendo el vídeo (nV9zOtHDmcA): el dossier solo confirma título, canal y duración.'],
  })
  .add({
    title: '¿Qué red o qué gesto?', obj: 2,
    text: 'Une cada situación con lo que corresponde.',
    ix: ix.match('Une cada situación con su respuesta.', [
      ['Tablet de planta del centro', 'Wifi del centro'],
      ['Tu móvil personal, en el descanso', 'Wifi de invitados'],
      ['Móvil de trabajo en una estación', 'Datos móviles (4G/5G)'],
      ['Te conectaste a una red dudosa', 'Desconectar, olvidar la red y cambiar claves'],
    ], fbk('¡Todo emparejado!', 'Alguna pareja no encaja. Revisa las marcadas.', 'Cada aparato, a su red; fuera del centro, datos móviles; y si te conectaste a una red insegura, desconéctate, olvídala y cambia las claves importantes.')),
  })
  .add({
    title: 'Radar de wifi', obj: 2,
    text: 'Tu móvil detecta varias redes. Elige a cuál te conectas; a veces la mejor es ninguna.',
    ix: ix.html({
      ...X.radarWifi({ titulo: '',
        rondas: [
          { e: '🏥', lugar: 'Planta 2, con la tablet del centro', quien: 'La tablet de planta necesita conexión.', redes: [
            { n: 'RESIDENCIA_PERSONAL', lock: true, sig: 4, ok: true, fb: 'Es la red del centro, para los equipos del centro.' },
            { n: 'RESIDENCIA_VISITAS', lock: true, sig: 3, ok: false, fb: 'Es la de invitados: para visitas y móviles personales, no para equipos del centro.' },
            { n: 'RESIDENCIA_PERSONAL_GRATIS', lock: false, sig: 4, ok: false, fb: 'Abierta y con un nombre que imita a la del centro: puede ser un clon para espiar. Nunca.' },
            { n: 'Vecino_5G', lock: true, sig: 2, ok: false, fb: 'Una red ajena: ni es del centro ni sabes quién la controla.' },
          ], ninguna: { ok: false, fb: 'Dentro del centro tienes una red adecuada; los datos móviles no son lo previsto para la tablet.' }, porque: 'Si no sabes cuál es la del centro, pregunta a informática: es mejor que adivinar.' },
          { e: '☕', lugar: 'Sala de descanso, con tu móvil personal', quien: 'Quieres ver el tiempo en tu móvil personal.', redes: [
            { n: 'RESIDENCIA_PERSONAL', lock: true, sig: 4, ok: false, fb: 'Es la red de trabajo: no es para móviles personales.' },
            { n: 'RESIDENCIA_VISITAS', lock: true, sig: 3, ok: true, fb: 'La de invitados está para esto: visitas, familiares y móviles personales, separada de la red interna.' },
            { n: 'Linksys_hogar', lock: true, sig: 1, ok: false, fb: 'Una red ajena que casualmente llega: no.' },
          ], ninguna: { ok: false, fb: 'No hace falta gastar datos: tienes la red de invitados.' }, porque: '' },
          { e: '🚉', lugar: 'Estación, con el móvil del trabajo', quien: 'Esperas un tren y necesitas mirar un dato del trabajo.', redes: [
            { n: 'ESTACION_FREE', lock: false, sig: 4, ok: false, fb: 'Abierta: no sabes quién la controla ni si es la legítima.' },
            { n: 'Cafeteria_Estacion', lock: true, sig: 3, ok: false, fb: 'Tener contraseña no basta: la clave la tiene todo el mundo (suele ir en el ticket) y puede ser una red que suplanta a otra.' },
            { n: 'Estacion_Wifi_Gratis_Rapida', lock: false, sig: 2, ok: false, fb: 'Abierta y con nombre «tentador»: justo lo que usan los estafadores.' },
          ], ninguna: { ok: true, fb: 'Con el móvil del trabajo y fuera del centro, lo más seguro son los datos móviles 4G/5G (o la VPN del centro).' }, porque: 'Una wifi pública no se puede verificar; los datos móviles, sí son tuyos.' },
        ],
      }), prompt: '', est_seconds: 480,
    }),
  })
  .add({
    title: 'Fuera del centro: datos, VPN y hotspot', obj: 2,
    text: `Con un dispositivo de trabajo fuera del centro:
- **No uses wifi pública**; usa **datos móviles** o la **VPN** que te dé el centro.
- Una **VPN** es un túnel cifrado hacia la red del trabajo; no te protege de virus ni de correos falsos.
- Si compartes datos desde tu móvil (*hotspot*): clave robusta, apágalo al terminar y mira quién está conectado.
- ¿Te conectaste a una red dudosa? Desconéctate, olvídala y cambia las claves importantes.`,
    img: { src: KITIMG.wifi, alt: 'Cartel que desaconseja usar redes wifi abiertas para operaciones como la banca', caption: 'Kit de concienciación de INCIBE.', layout: 'right', width: 33 },
  })
  .add({
    title: 'Un proveedor pide la clave wifi', obj: 2,
    text: 'Eres de dirección o supervisión.',
    ix: ix.scenario('Un proveedor viene a hacer una entrega y te pide la clave de la wifi del centro para conectar su portátil durante la visita.', '¿Qué haces?', [
      ['Le doy la clave de la wifi del centro: es solo un momento', false, 'Esa red es para los equipos del centro. Un portátil ajeno dentro de ella es una puerta abierta.'],
      ['Le doy la wifi de invitados (o le digo que la pida en recepción) y alguien le acompaña', true, 'La de invitados está separada de la red interna. Que alguien le acompañe es una buena práctica propuesta.'],
      ['Le conecto yo mismo a la red de trabajo para que no toque nada', false, 'Seguiría dentro de la red interna. Aunque lo hagas tú, el riesgo es el mismo.'],
    ], fbk('¡Bien resuelto!', 'Piensa en qué red está pensada cada cosa.', 'Visitas y proveedores, a la wifi de invitados. La red del centro es solo para equipos del centro.')),
  })
  .add({
    type: 'summary', title: 'Lo que te llevas de la lección 3',
    text: `- Equipos del centro, a la **wifi del centro**; visitas y móviles personales, a la de **invitados**.
- Con aparatos de trabajo fuera: **datos móviles** o la VPN del centro, nunca wifi pública.
- Un candado no basta: importa quién ofrece la red.`,
  })

// ═════════════════════ Lección 4 · Mi móvil y el trabajo ═════════════════════
const l4 = c.unit('Lección 4. Mi móvil y el trabajo', 'Tu móvil personal, WhatsApp y las fotos: qué hacer con los datos de salud y cómo actuar con calma si se pierde o se roba un dispositivo.')
l4.add({ type: 'cover', title: 'Mi móvil y el trabajo', text: '' })
  .add({
    title: 'Un móvil, dos vidas', obj: 3,
    text: `Usar tu móvil personal para cosas del trabajo se llama **BYOD** (*Bring Your Own Device*). Es cómodo, pero lo usas para todo y a veces lo presta la familia: si se pierde, se pierde también información del centro.
- Bloqueo con PIN o huella, siempre.
- Apps solo de la tienda oficial (Play Store o App Store).
- Nada de *root* ni *jailbreak* (saltarte las protecciones del móvil).
- Sigue la normativa del centro sobre apps y configuraciones.`,
    img: top(IMG.movil, 'Un móvil personal con bloqueo de pantalla; a un lado lo personal y al otro el correo del centro; las fotos de residentes están tachadas'),
  })
  .add({
    title: 'Apps maliciosas en el móvil', obj: 3,
    text: 'Una app maliciosa se cuela como si fuera legítima. Mira cómo protegerte.',
    video: {
      id: 'IHkhdDH-JoM', caption: 'Oficina de Seguridad del Internauta (INCIBE): «Cómo protegerte de aplicaciones maliciosas en tu móvil o tablet Android e iOS».',
      transcript: 'Resumen orientativo del vídeo de la Oficina de Seguridad del Internauta (INCIBE): explica cómo protegerte de aplicaciones maliciosas en el móvil o la tablet, con Android e iOS.',
    },
    notes: ['Verificar la transcripción viendo el vídeo (IHkhdDH-JoM): el dossier solo confirma título, canal y duración.'],
  })
  .add({
    title: 'WhatsApp y datos de salud', obj: 3,
    text: `La guía de la AEPD para profesionales sanitarios (2022, revisada en 2024) dice que, con mensajería instantánea, hay que:
- asegurarse de que el mensaje va **solo a la persona** y no a un grupo,
- enviar la **mínima información** necesaria,
- valorar si la app cifra y si es fácil suplantar a alguien.

Con datos sensibles, «es probable que no sea aconsejable» usar estos medios.

::: warn
Fotos de residentes con tu móvil personal: es **norma del centro**; consulta su política y al delegado de protección de datos.
:::`,
  })
  .add({
    title: 'Un grupo para los partes', obj: 3,
    text: 'Eres de enfermería.',
    ix: ix.scenario('Una compañera propone crear un grupo de WhatsApp con los partes de turno «para ir más rápido». Incluiría nombres de residentes y su medicación.', '¿Qué respondes?', [
      ['¡Genial, lo creo ahora mismo!', false, 'Un grupo de WhatsApp con datos de salud es justo lo que la AEPD desaconseja: se pierde el control de quién lo ve.'],
      ['Mejor usar los canales que el centro haya autorizado y pasar solo lo imprescindible', true, 'Minimizar datos y usar canales autorizados: la pauta de la AEPD.'],
      ['Lo creo, pero sin poner apellidos', false, 'Quitar apellidos no basta: nombre o habitación más medicación siguen siendo datos de salud.'],
    ], fbk('¡Bien respondido!', 'Piensa en quién podría ver ese grupo.', 'La minimización de datos y los canales autorizados son la clave. Si el centro no tiene uno, plantéaselo a tu responsable.')),
  })
  .add({
    title: '¿Legítimo o fraude?', obj: 3,
    text: 'Estos mensajes de ejemplo llegan al móvil. Desliza o toca los botones.',
    ix: ix.html({
      ...W.swipeDeck({ titulo: 'Mensajes en tu móvil', cards: [
        { canal: '📱 SMS', de: 'CORREOS', texto: 'Tu paquete está retenido. Paga 1,20 € de tasas aquí: bit.ly/xx-paquete', fraude: true, pistas: ['Enlace acortado', 'Te piden un pago', 'Urgencia'], porque: 'Los enlaces acortados esconden el destino real. Un mensaje así se borra; no se pincha.' },
        { canal: '💬 WhatsApp', de: 'Dirección (número de tu agenda)', texto: 'Mañana cambia el cuadrante. Míralo en la carpeta compartida de siempre.', fraude: false, pistas: ['Número guardado', 'Canal y carpeta habituales', 'Sin enlaces raros'], porque: 'Mensaje esperable por el canal de siempre. Ante la duda, pregúntale en persona.' },
        { canal: '💬 WhatsApp', de: 'Número desconocido', texto: 'Hola, soy del soporte del centro. Dime el código que te acaba de llegar por SMS para arreglar tu cuenta.', fraude: true, pistas: ['Número que no conoces', 'Te piden un código'], porque: 'Un código que llega por SMS es personal: nadie del soporte lo necesita. Es un intento de robarte la cuenta.' },
        { canal: '📞 Llamada', de: 'Supervisora (número guardado)', texto: '¿Puedes cubrirme el viernes de noche? Dime si puedes y lo apunto.', fraude: false, pistas: ['Persona y número conocidos', 'Petición normal'], porque: 'Petición normal de una persona conocida. No pide nada raro.' },
        { canal: '📱 SMS', de: 'Soporte del centro', texto: 'Actualiza ya la app del centro desde este enlace: app-centro.apk-descarga.xyz', fraude: true, pistas: ['Enlace fuera de una tienda oficial', 'Archivo .apk', 'Urgencia'], porque: 'Las apps se descargan solo de la tienda oficial. Un enlace con un archivo de instalación no lo es.' },
        { canal: '📱 SMS', de: 'Tu banco', texto: 'Detectamos un acceso raro. Confirma tu clave en: banco-seguro-acceso.com', fraude: true, pistas: ['Piden tu clave', 'Dominio que no es el del banco'], porque: 'Tu banco no te pide la clave por un SMS con enlace. Si dudas, llama al número de la tarjeta.' },
      ] }), prompt: '', est_seconds: 330,
    }),
  })
  .add({
    title: 'Si pierdes el móvil', obj: 3,
    text: `Si se pierde o te roban el móvil o la tablet, **el orden importa**: lo primero es avisar al centro para que bloqueen tus accesos.

::: info
El **IMEI** es el número de serie del móvil. Se ve marcando *#06#. Apúntalo al comprar el móvil: te lo pedirán para denunciar.
:::

Avisar rápido nunca es motivo de reprimenda; avisar tarde, sí es un problema.`,
    img: top(IMG.perdido, 'Un móvil perdido localizado en un mapa y cuatro pasos para actuar'),
  })
  .add({
    title: 'Si pierdes el móvil', obj: 3,
    text: 'Pon los pasos en el orden en que los darías.',
    ix: ix.sort('Ordena los pasos.', [
      'Aviso al centro de inmediato',
      'Bloqueo y localizo el móvil («Encuentra mi dispositivo» o «Buscar»)',
      'Si no aparece, lo borro a distancia',
      'Si es robo, denuncio aportando el IMEI y pido a la operadora bloquear SIM e IMEI',
    ], fbk('¡Orden correcto!', 'Casi: piensa qué hay que hacer antes de que alguien use tus accesos.', 'Primero, avisar para cortar accesos; luego bloquear y localizar; borrar a distancia si no se recupera; y, si es robo, denunciar con el IMEI y bloquear SIM e IMEI.')),
  })
  .add({
    title: 'Una foto para la familia', obj: 3,
    text: 'Eres gerocultor/a.',
    ix: ix.scenario("Una hija te pide que le mandes con tu móvil una foto de su madre, «que ha salido muy guapa en la fiesta».", '¿Qué haces?', [["Se la mando: es su madre y está contenta",false,"Con tu móvil personal y por WhatsApp saltas la norma del centro y la minimización de datos."],["Le explico que no puedo y le propongo preguntar en dirección cómo se hace en el centro",true,"Las fotos de residentes siguen la política del centro; si hay un canal autorizado, lo decidirá dirección."],["Se la mando, pero solo si no sale nadie más",false,"Quitar a otras personas no resuelve el problema: sigue siendo tu móvil personal y un canal no autorizado."]], fbk("¡Bien resuelto!", "Piensa en qué canal y qué norma aplica.", "La regla sobre fotos es una norma del centro; consúltala y, ante la duda, pregunta a dirección o al delegado de protección de datos.")),
  })
  .add({
    title: 'Móvil perdido en el autobús', obj: 3,
    text: 'Vale para cualquier puesto.',
    ix: ix.scenario("Vuelves del trabajo y te das cuenta de que has perdido el móvil personal, donde recibes el cuadrante del centro.", '¿Qué haces?', [["Espero a ver si alguien lo encuentra",false,"Cada hora cuenta: alguien podría acceder a tus apps del trabajo."],["Aviso al centro, intento bloquearlo y localizarlo, y lo borro a distancia si no aparece",true,"Avisar primero y luego bloquear, localizar y borrar si no se recupera."],["Cambio la contraseña de WhatsApp y ya",false,"Es insuficiente: el móvil sigue abierto a tus correos y apps. Avisa al centro y bloquéalo."]], fbk("¡Bien hecho!", "Piensa qué haces primero.", "Avisa al centro, bloquea y localiza, borra si no aparece y denuncia si es robo.")),
  })
  .add({
    type: 'summary', title: 'Lo que te llevas de la lección 4',
    text: `- Móvil siempre con bloqueo; apps solo de tiendas oficiales.
- Datos de salud: **lo mínimo**, por canales autorizados y nunca en grupos de WhatsApp.
- Si se pierde: **avisa primero**, bloquea y localiza, borra si no aparece y denuncia si es robo.`,
  })

// ═════════════════════ Lección 5 · Copias, Drive, teletrabajo y seguridad física ═════════════════════
const l5 = c.unit('Lección 5. Copias, Drive, teletrabajo y quién entra', 'Guardar donde indica el centro, compartir con cabeza, teletrabajar con la casa a punto y no abrir la puerta a quien no toca.')
l5.add({ type: 'cover', title: 'Copias, Drive, teletrabajo y quién entra', text: '' })
  .add({
    title: 'La regla 3-2-1', obj: 4,
    text: `Las copias de seguridad las hace informática; **tu parte** es guardar el trabajo **donde el centro indique** (carpeta compartida o Drive de empresa), no en el escritorio ni en un USB.

La regla **3-2-1** (INCIBE): *tres* copias, en *dos* tipos de soporte distintos y *una* de ellas fuera del centro.`,
    img: top(IMG.copias, 'Regla 3-2-1: tres copias, dos tipos de soporte distintos y una fuera del centro'),
  })
  .add({
    title: 'Copias en la nube', obj: 4,
    text: 'Una forma habitual de tener esa copia «fuera» es un servicio en la nube.',
    video: {
      id: 'Qf8ORcBSWvQ', caption: 'Oficina de Seguridad del Internauta (INCIBE): «Cómo utilizar un servicio en la nube para hacer copias de seguridad».',
      transcript: 'Resumen orientativo del vídeo de la Oficina de Seguridad del Internauta (INCIBE): muestra cómo usar un servicio en la nube para guardar copias de seguridad de tus archivos.',
    },
    notes: ['Verificar la transcripción viendo el vídeo (Qf8ORcBSWvQ): el dossier solo confirma título, canal y duración.'],
  })
  .add({
    title: 'Compartir con cabeza', obj: 4,
    text: `En el Drive del centro:
- Usa solo la **cuenta del centro**, nunca tu Gmail personal.
- Al compartir, elige **«Restringido»**: solo las personas que añades.
- **«Cualquier persona con el enlace»** permite abrirlo a cualquiera sin iniciar sesión: no es para datos privados (lo dice la propia ayuda de Google).
- Los permisos de una carpeta se heredan a lo que contiene.

Antes de compartir, pregúntate: ¿quién lo recibe?, ¿lo necesita?, ¿solo ver o editar?`,
  })
  .add({
    title: 'Completa la regla', obj: 4,
    text: 'Elige la palabra correcta en cada hueco.',
    ix: ix.fill('Completa los huecos.', 'La regla 3-2-1 dice: [[tres]] copias, en [[dos]] tipos de soporte distintos y [[una]] fuera del centro. Al compartir un archivo del centro en Drive, elijo «[[Restringido]]» y no «Cualquier persona con el enlace».', ['cinco', 'cuatro', 'Público'],
      fbk('¡Completado!', 'Revisa los huecos marcados.', 'Tres copias, dos soportes, una fuera; y «Restringido» al compartir datos del centro.')),
  })
  .add({
    title: 'Teletrabajo desde casa', obj: 4,
    text: `En teletrabajo (sobre todo administración y dirección), tu casa es parte de tu puesto.
- **Wifi**: cifrado WPA2/WPA3, clave robusta y propia, WPS desactivado.
- **Familia**: nadie más usa el equipo de trabajo.
- **Pantalla** bloqueada al levantarte; que no la vean los demás.
- **Papel** con datos de residentes: no se saca; si hace falta, bajo llave y a la trituradora.
- **VPN** del centro y documentos solo donde el centro indique.`,
    img: top(IMG.tele, 'Un puesto de teletrabajo en casa con portátil bloqueado, router con cifrado seguro y papel guardado bajo llave'),
  })
  .add({
    title: 'Mi semáforo de teletrabajo', obj: 4,
    text: 'Marca lo que ya cumples en casa y pulsa el botón para ver tu semáforo.',
    ix: ix.html({
      ...X.teleCheck({ titulo: '', items: [
        { t: 'Mi wifi de casa tiene clave propia y cifrado WPA2/WPA3', tip: 'Entra en el router y activa WPA2 o WPA3 con una clave robusta propia.' },
        { t: 'He cambiado el nombre y la clave que traía el router', tip: 'Cambia el nombre y la clave de fábrica del router (y actualiza su firmware).' },
        { t: 'Nadie más usa el equipo de trabajo', tip: 'Que nadie más use el equipo del trabajo: ni juegos, ni descargas, ni deberes.' },
        { t: 'Se me bloquea la pantalla sola al levantarme', tip: 'Activa el bloqueo automático y bloquea tú (Windows + L) cada vez que te levantes.' },
        { t: 'Uso la VPN del centro, si me la ha facilitado', tip: 'Pregunta a informática si hay VPN y úsala; no instales una «gratuita» por tu cuenta.' },
        { t: 'Los documentos con datos de residentes los guardo solo donde indica el centro', tip: 'Guarda los documentos solo en la carpeta o Drive del centro, no en el escritorio ni en un USB.' },
        { t: 'Papel con datos de residentes: no lo saco; si hace falta, bajo llave', tip: 'No saques papel con datos de residentes; si es imprescindible, guárdalo bajo llave y tritúralo.' },
        { t: 'Sé a quién avisar si algo va mal', tip: 'Apunta en tu móvil a quién avisar (informática o tu responsable) si algo falla.' },
      ] }), prompt: '', est_seconds: 270,
    }),
  })
  .add({
    title: 'Quién entra al centro', obj: 5,
    text: `La seguridad también es física: quien llega al cuarto de comunicaciones llega a los sistemas.
- Puertas del personal cerradas; las visitas, **acompañadas y registradas** (buena práctica propuesta).
- Un técnico sin cita ni identificación **no pasa a solas**: pregunta quién le avisó y confírmalo con informática o dirección por un teléfono **que tú elijas**, no el que te da él.

::: fact
INCIBE (2020) cita la suplantación presencial: dejar pasar a un fontanero o a un repartidor sin verificar sus credenciales.
:::`,
    img: top(IMG.visita, 'Un supuesto técnico con chaleco pide entrar al cuarto de comunicaciones; la trabajadora lo confirmará con informática'),
  })
  .add({
    title: 'El técnico sin cita', obj: 5,
    text: 'Eres de mantenimiento y estás en la puerta del cuarto de comunicaciones.',
    ix: ix.html({
      ...W.chatStory({
        contacto: { nombre: 'Técnico «del fabricante»', emoji: '🧰', sub: 'en la puerta de comunicaciones' },
        nodos: {
          n1: { msgs: [['them', 'Buenas, soy del fabricante de las cámaras. Vengo a revisar el equipo del cuarto de comunicaciones. No me han dado cita, pero es urgente.']], choices: [
            { t: 'Le abro y le dejo solo: tiene aspecto profesional', next: 'bad1', q: 'bad', fb: 'El aspecto no verifica nada.' },
            { t: 'Le pido identificación y que espere; llamo a informática por el teléfono que yo conozco', next: 'n2', q: 'good', fb: 'Verificar por un canal que tú eliges es la clave.' },
            { t: 'Le doy la llave para que no pierda tiempo', next: 'bad1', q: 'bad', fb: 'Una llave en manos de un desconocido es acceso total.' },
          ] },
          n2: { msgs: [['them', 'Tengo prisa. Llama a este número, es mi jefe, él te lo confirma.']], choices: [
            { t: 'Llamo a ese número que me da', next: 'n2', q: 'mid', fb: 'Ese teléfono lo controla él: puede contestar un cómplice. Llama a un número que tú ya tuvieras.' },
            { t: 'Llamo al teléfono de informática que ya tenía guardado', next: 'n3', q: 'good', fb: 'Así sí.' },
          ] },
          n3: { msgs: [['sys', 'Informática te confirma que no hay ninguna visita prevista.']], choices: [
            { t: 'Le digo que no hay cita y que lo gestione con dirección; aviso a mi responsable', next: 'good', q: 'good', fb: 'Verificar y avisar: las dos cosas.' },
            { t: 'Total, ya está aquí: le dejo pasar, pero yo con él', next: 'bad2', q: 'mid', fb: 'Si nadie le ha avisado, no pasa: la compañía no arregla que no tenga permiso.' },
          ] },
          bad1: { msgs: [['sys', 'El técnico entra solo al cuarto de comunicaciones.']], fin: { tipo: 'bad', titulo: 'Una puerta abierta de par en par', texto: 'Conseguir acceso físico a un cuarto de comunicaciones es ganar acceso a los sistemas. Verifica antes de abrir.' } },
          bad2: { msgs: [['sys', 'Entráis; no había cita.']], fin: { tipo: 'mid', titulo: 'Casi', texto: 'Hacerlo acompañado es mejor que solo, pero sin cita ni confirmación no pasa nadie.' } },
          good: { msgs: [['sys', 'El técnico se marcha; tu responsable lo anota.']], fin: { tipo: 'good', titulo: '¡Puerta cerrada, buen trabajo!', texto: 'Sin cita ni identificación verificada, no pasa. Y avisar a tu responsable es parte del trabajo.' } },
        },
      }), prompt: '', est_seconds: 330,
    }),
  })
  .add({
    title: 'Una cámara nueva en el pasillo', obj: 5,
    text: 'Sigues siendo de mantenimiento.',
    ix: ix.scenario('Te toca instalar una cámara nueva en un pasillo. Llega con la clave de fábrica «admin / admin» y quieres conectarla a la wifi del personal para que funcione rápido.', '¿Qué haces?', [
      ['Dejo la clave de fábrica y la conecto a la wifi del personal', false, 'Las claves de fábrica son públicas, y un aparato así dentro de la red del personal es una puerta abierta.'],
      ['Cambio la clave de fábrica, desactivo el acceso remoto si no hace falta y pido a informática que la conecte a la red adecuada', true, 'Es lo que recomienda INCIBE para aparatos conectados (IoT): cambiar claves de fábrica, no conectarlos a la wifi corporativa y deshabilitar el acceso remoto si no se necesita.'],
      ['Cambio la clave, pero la conecto yo mismo a la wifi del personal', false, 'La clave nueva ayuda, pero aun así no debe ir a la wifi del personal. Consúltalo con informática.'],
    ], fbk('¡Muy bien!', 'Piensa en qué pasa si alguien conoce la clave de fábrica.', 'Cambia las claves de fábrica, no conectes estos aparatos a la red del personal y, con equipos médicos conectados, no los muevas ni los toques sin avisar a informática.')),
  })
  .add({
    title: 'Un monitor que pide wifi', obj: 5,
    text: 'Sigues siendo de mantenimiento.',
    ix: ix.scenario("El monitor de telemetría de una cama pide conectarse a la wifi del personal «para enviar los datos».", '¿Qué haces?', [["Lo conecto: es solo un monitor",false,"Un equipo médico conectado en la wifi del personal amplía la puerta de entrada."],["No lo conecto ni lo muevo y aviso a informática para que decida cómo se conecta",true,"Con equipos médicos conectados no se toca nada sin avisar a informática (buena práctica propuesta, en línea con INCIBE-CERT)."],["Le pongo la clave de la wifi de invitados",false,"Tampoco: la red de invitados es para visitas y móviles personales, no para equipos médicos."]], fbk("¡Muy bien!", "Piensa quién debe decidir cómo se conecta un equipo médico.", "Los equipos médicos conectados se tratan con cuidado: avisa a informática antes de conectar o mover nada.")),
  })
  .add({
    type: 'summary', title: 'Lo que te llevas de la lección 5',
    text: `- Guarda **donde indica el centro**; la regla 3-2-1 la aplica informática.
- Drive: cuenta del centro y **«Restringido»**.
- En casa: wifi bien configurada, equipo solo tuyo, papel bajo llave.
- Visitas y técnicos: **verificados y acompañados**.`,
  })

// ═════════════════════ Lección 6 · Qué hago si… y Repaso y reto ═════════════════════
const l6 = c.unit('Lección 6. Qué hago si… Repaso y reto', 'Qué hacer ante un incidente, un repaso con tarjetas, un pasatiempo y tu compromiso personal.')
l6.add({ type: 'cover', title: 'Qué hago si… Repaso y reto', text: '' })
  .add({
    title: 'Qué hago si algo falla', obj: 5,
    text: 'Pasos a seguir cuando algo no va bien. Toca cada uno.',
    ix: ix.timeline([
      ['1', 'Para y respira', 'Deja de usar el equipo y no intentes arreglarlo tú. Equivocarse es humano; lo grave es no avisar.'],
      ['2', 'Entiende qué ha pasado', 'Fíjate: ¿un enlace?, ¿un USB?, ¿un aviso del antivirus? Anota la hora y qué hacías.'],
      ['3', 'Avisa ya', 'A tu responsable o a informática. Avisar rápido nunca es motivo de reprimenda; avisar tarde, sí es un problema.'],
      ['4', 'El resto lo decide el centro', 'Si se ven afectados datos de personas, es el centro quien decide cómo comunicarlo. Tú solo tienes que avisar de inmediato.'],
      ['5', 'Ayuda externa', 'INCIBE tiene una línea de ayuda en ciberseguridad: **017**. Si es un delito, se denuncia.'],
    ]),
  })
  .add({
    title: 'Llevarte trabajo a casa', obj: 4,
    text: 'Eres de administración.',
    ix: ix.scenario('Tienes que acabar un trabajo en casa y necesitas un listado de residentes. Se te ocurre copiarlo en tu pendrive personal.', '¿Qué haces?', [
      ['Lo copio en mi pendrive: voy más rápido', false, 'Un pendrive personal con datos de residentes se puede perder o infectar.'],
      ['No saco datos de residentes en soportes personales: uso lo que el centro me facilite (VPN, Drive del centro) y lo hablo con mi responsable', true, 'Los datos van solo por los medios del centro, y tu responsable decide qué es posible.'],
      ['Me lo envío a mi Gmail personal', false, 'Tu cuenta personal no es la del centro: los datos de residentes no pueden estar ahí.'],
    ], fbk('¡Bien decidido!', 'Piensa dónde queda la copia del listado.', 'Datos de residentes solo en los medios del centro; si no puedes con eso, se habla con el responsable.')),
  })
  .add({
    title: 'Repaso con tarjetas', obj: 0,
    text: 'Piensa la respuesta y toca para ver si coincide.',
    ix: ix.flash([
      ['¿Qué haces al levantarte del ordenador?', 'Bloqueo la pantalla: Windows + L.'],
      ['¿Y en una tablet compartida al terminar el turno?', 'Cierro sesión y no guardo mi contraseña.'],
      ['¿Qué haces con un USB encontrado?', 'No lo conecto; lo entrego a informática o al responsable.'],
      ['¿Dónde se conecta la tablet del centro?', 'A la wifi del centro; las visitas, a la de invitados.'],
      ['¿Y con el móvil del trabajo en una cafetería?', 'Datos móviles o la VPN del centro; nunca wifi pública.'],
      ['¿Qué haces si pierdes el móvil?', 'Aviso al centro primero; bloqueo, localizo, borro si no aparece y denuncio si es robo.'],
      ['¿Cómo se comparte en el Drive del centro?', 'Con «Restringido», no «Cualquier persona con el enlace».'],
      ['¿Qué haces con un técnico sin cita?', 'Pido identificación, lo confirmo con informática por un teléfono mío y no pasa solo.'],
    ]),
  })
  .add({
    title: 'Sopa de letras de la lección', obj: 1,
    text: 'Encuentra las palabras ocultas.',
    ix: ix.wordsearch(['BLOQUEO', 'SESION', 'ANTIVIRUS', 'WIFI', 'COPIAS', 'INVITADOS', 'CLAVE', 'SIM', 'USB', 'VPN', 'IMEI', 'ROUTER'], 'Encuentra 12 palabras del curso.'),
  })
  .add({
    title: 'Crucigrama de seguridad', obj: 2,
    text: 'Otro pasatiempo para cerrar el repaso.',
    ix: ix.crossword([
      ['BLOQUEAR', 'Lo que haces con la pantalla al levantarte (Windows + L)'],
      ['USB', 'Pendrive desconocido que no se conecta'],
      ['INVITADOS', 'Wifi para visitas y móviles personales'],
      ['VPN', 'Túnel cifrado hacia la red del trabajo'],
      ['ANTIVIRUS', 'Detecta y elimina el código malicioso'],
      ['COPIAS', 'Las hace informática: regla 3-2-1'],
      ['IMEI', 'Número de serie del móvil, se ve con *#06#'],
      ['RESTRINGIDO', 'Opción al compartir en Drive datos del centro'],
      ['TRITURADORA', 'Destino de los papeles con datos que ya no hacen falta'],
      ['CORTAFUEGOS', 'Vigila lo que entra y sale a Internet'],
    ], 'Resuelve el crucigrama.'),
  })
  .add({
    title: 'Mi compromiso', obj: 0,
    text: 'Elige lo que te comprometes a hacer a partir de mañana.',
    ix: ix.html({
      ...W.pledge({
        titulo: '', intro: 'Marca lo que te comprometes a hacer.',
        items: [
          'Bloquear la pantalla cada vez que me levante (Windows + L)',
          'Cerrar sesión en equipos compartidos y no recordar contraseñas',
          'No conectar ningún USB desconocido: lo entrego',
          'Instalar solo lo que el centro autorice',
          'Conectar mis equipos a la red que corresponde y no usar wifi públicas con aparatos de trabajo',
          'No enviar datos de residentes por WhatsApp salvo canales autorizados',
          'Avisar enseguida si pierdo un dispositivo o veo algo raro',
          'Pedir identificación a quien no conozco',
        ], minimo: 5, final: '¡Compromiso firmado! Cuidas tu puesto, y con él a las personas que cuidas.',
      }), prompt: '', est_seconds: 90,
    }),
  })
  .add({
    type: 'summary', title: 'Cierre del curso',
    text: `Has recorrido tu puesto, tus aparatos y tus redes. Si te quedas con una sola idea: **ante la duda, para y pregunta**. Tú eres la mejor defensa.

Pregunta a tu responsable a quién avisar en tu centro (informática o responsable de seguridad) y apunta el teléfono en tu móvil. Ahora, el test final.`,
  })

// ═════════════════════ Glosario, bibliografía y test ═════════════════════
c.glossary('Bloqueo de pantalla', 'Pantalla protegida con contraseña, PIN o huella que impide usar el equipo mientras no estás. En Windows se activa con la tecla Windows + L.')
 .glossary('Cerrar sesión', 'Salir de tu usuario en un equipo para que nadie lo use como tú. En equipos compartidos, hay que hacerlo al terminar.')
 .glossary('Actualización', 'Versión nueva de un programa o del sistema que corrige fallos y «puertas abiertas» conocidas.')
 .glossary('Antivirus', 'Programa que detecta y elimina el código malicioso.')
 .glossary('Cortafuegos', 'Programa o dispositivo que vigila lo que entra y sale del equipo hacia Internet.')
 .glossary('Dispositivo extraíble (USB)', 'Pendrive o disco que se conecta a un equipo. Si es desconocido, puede traer malware a propósito.')
 .glossary('Shadow IT', 'Usar programas, apps o servicios que nadie del centro ha aprobado, por comodidad.')
 .glossary('Wifi de invitados', 'Red separada de la interna, pensada para visitas, familiares y móviles personales.')
 .glossary('Wifi pública', 'Red abierta de cafeterías, estaciones u hoteles. No se puede verificar quién la controla.')
 .glossary('VPN', 'Túnel cifrado entre tu aparato y la red del trabajo. Protege la conexión, no es un antivirus.')
 .glossary('Hotspot', 'Compartir los datos móviles de tu teléfono con otro aparato, como si fuera una wifi.')
 .glossary('BYOD', 'Siglas de «Bring Your Own Device»: usar tu móvil personal para cosas del trabajo.')
 .glossary('IMEI', 'Número de serie del móvil; se ve marcando *#06#. Sirve para denunciar y bloquear el aparato.')
 .glossary('Regla 3-2-1', 'Tres copias, en dos tipos de soporte distintos y una fuera del centro.')
 .glossary('Suplantación presencial', 'Hacerse pasar por técnico, repartidor o similar para entrar donde no se debe.')

c.bib('INCIBE. Kit de concienciación: 06 Puesto de trabajo (Medidas de protección I), 07 Puesto de trabajo (Medidas de protección II) y 08 Móviles (BYOD y teletrabajo). INCIBE.')
 .bib('INCIBE (2022). ¡La seguridad en movimiento! Protege tus dispositivos extraíbles. Blog de INCIBE.', 'https://www.incibe.es/empresas/blog/seguridad-movimiento-protege-dispositivos-extraibles-empresas')
 .bib('INCIBE (2018). Copias de seguridad: una guía de aproximación para el empresario. Blog de INCIBE.', 'https://www.incibe.es/empresas/blog/copias-seguridad-guia-aproximacion-el-empresario')
 .bib('INCIBE (2018). ¿Cómo actuar si me han robado o he perdido el teléfono móvil? Blog de INCIBE.', 'https://www.incibe.es/ciudadania/blog/como-actuar-si-me-han-robado-o-he-perdido-el-telefono-movil')
 .bib('INCIBE-OSI (2021). Cómo compartir tu conexión móvil y evitar las redes públicas. Oficina de Seguridad del Internauta.', 'https://www.incibe.es/ciudadania/blog/como-compartir-tu-conexion-movil-y-evitar-las-redes-publicas')
 .bib('INCIBE. Conexiones seguras. Ciudadanía, INCIBE.', 'https://www.incibe.es/ciudadania/tematicas/conexiones')
 .bib('INCIBE (2020). Pautas para teletrabajar seguro. Blog de INCIBE.', 'https://www.incibe.es/empresas/blog/pautas-teletrabajar-seguro')
 .bib('INCIBE (2020). Ingeniería social, ¡Mantente informado y aléjate del engaño! Blog de INCIBE.', 'https://www.incibe.es/empresas/blog/ingenieria-social-mantente-informado-y-alejate-del-engano-protege-tu-empresa')
 .bib('INCIBE (2017). 7 atributos que debe tener tu wifi y 9 consejos para configurarla. Blog de INCIBE.', 'https://www.incibe.es/empresas/blog/7-atributos-debe-tener-tu-wifi-y-9-consejos-configurarla')
 .bib('INCIBE (2017). IoT: riesgos del internet de los trastos. Blog de INCIBE.', 'https://www.incibe.es/empresas/blog/iot-riesgos-del-internet-los-trastos')
 .bib('AEPD (2022, rev. 2024). Guía para profesionales del sector sanitario. Agencia Española de Protección de Datos.', 'https://www.aepd.es/documento/guia-profesionales-sector-sanitario.pdf')
 .bib('Google. Ayuda de Google Drive: compartir archivos y carpetas. Google Drive.', 'https://support.google.com/drive/answer/2494822?hl=es')
 .bib('ENISA (2023). Checking-up on Health: Ransomware Accounts for 54% of Cybersecurity Threats. Nota de prensa de ENISA.', 'https://www.enisa.europa.eu/news/checking-up-on-health-ransomware-accounts-for-54-of-cybersecurity-threats')

c.finalTest('Test final', [
  ['Te levantas cinco minutos de la sala de enfermería y el ordenador tiene datos de residentes en pantalla. ¿Qué haces?', [['Bajo el brillo de la pantalla', false], ['Lo dejo así: la sala es del personal', false], ['Lo bloqueo (Windows + L) antes de irme', true]], 'Bloquear tarda un segundo y evita que otros vean o usen tu sesión. Bajar el brillo no protege nada.', 0],
  ['La tablet de planta tiene abierta la sesión de la compañera del turno anterior y tienes que registrar un cambio postural. ¿Qué haces?', [['Cierro su sesión y entro con mi usuario', true], ['Registro con su sesión: es un momento', false], ['Lo apunto en una libreta y lo paso después', false]], 'Cada registro debe quedar a nombre de quien lo hace; una libreta suelta tampoco es adecuada.', 0],
  ['Encuentras un pendrive en el suelo del aparcamiento. ¿Qué haces?', [['Lo conecto a un ordenador viejo para ver de quién es', false], ['Lo conecto a mi portátil personal, no al del trabajo', false], ['Lo entrego a informática o al responsable sin conectarlo', true]], 'INCIBE: los USB desconocidos no deben usarse en el trabajo bajo ningún concepto; pueden llevar malware a propósito.', 1],
  ['El antivirus del ordenador de dirección muestra un aviso de «virus detectado». ¿Qué haces?', [['Cierro la ventana y sigo trabajando', false], ['Aviso a informática y no sigo con ese equipo hasta que lo revisen', true], ['Desactivo el antivirus para que deje de avisar', false]], 'Un aviso de virus no se ignora: se avisa a informática. El antivirus y el cortafuegos deben estar siempre activos.', 1],
  ['Un compañero instala por su cuenta un programa gratuito en el ordenador de recepción «para ir más rápido». ¿Qué opinas?', [['Está bien si lo descarga de cualquier web', false], ['Está bien si es gratis', false], ['No se instala nada sin autorización: se pide a informática', true]], 'Solo software legítimo y autorizado; lo que haga falta, se pide.', 1],
  ['Estás en una cafetería con el móvil del trabajo y necesitas mirar un dato. ¿Qué es lo más seguro?', [['Usar los datos móviles del teléfono (4G/5G)', true], ['Conectarme a una wifi abierta que se llame «Cafetería_Free»', false], ['Conectarme a la wifi gratuita de la cafetería', false]], 'Las wifi públicas no se pueden verificar y pueden estar suplantadas; los datos móviles son más seguros.', 2],
  ['Un familiar de un residente te pide la clave wifi del centro para su portátil. ¿Qué haces?', [['Se la doy: es una visita', false], ['Le conecto yo mismo a la red de trabajo', false], ['Le doy la wifi de invitados, separada de la red de trabajo, o le digo que la pida en recepción', true]], 'La red de invitados está separada de la interna; la del centro es para equipos del centro.', 2],
  ['Quieres hacer una foto de una herida de una residente con tu móvil personal para consultarla por WhatsApp con una compañera. ¿Qué es lo adecuado?', [['Hacerla: es por el bien de la residente', false], ['Usar los canales que el centro autorice y compartir solo lo imprescindible', true], ['Mandarla a un grupo, así la ven más personas', false]], 'La AEPD pide minimizar datos, no enviar a grupos y advierte de que la mensajería puede no ser adecuada para datos sensibles. La regla sobre fotos la fija cada centro.', 3],
  ['Pierdes el móvil con el que consultas el correo del trabajo. ¿Qué haces primero?', [['Espero un par de días por si aparece', false], ['Aviso de inmediato al centro y bloqueo o localizo el móvil', true], ['Compro otro y no digo nada', false]], 'Avisar al centro permite bloquear accesos; después, bloquear, localizar, borrar si no aparece y denunciar si es robo.', 3],
  ['Vas a compartir un documento con datos de residentes en el Drive del centro. ¿Qué opción eliges?', [['«Cualquier persona con el enlace», es más rápido', false], ['Lo envío desde mi Drive personal', false], ['«Restringido», añadiendo solo a quien lo necesita', true]], 'Con enlace público cualquiera lo abre sin cuenta. Y los datos del centro no deben ir a cuentas personales.', 4],
  ['En casa, para teletrabajar, ¿qué configuración de wifi es la adecuada?', [['La clave que viene en la pegatina del router, no hace falta cambiarla', false], ['Cifrado WPA2/WPA3, clave robusta propia y WPS desactivado', true], ['Sin contraseña, así no se me olvida', false]], 'INCIBE recomienda cambiar el nombre y la clave de fábrica y usar cifrado WPA2/WPA3.', 4],
  ['Llega un «técnico» sin cita a revisar el router y pide pasar al cuarto de comunicaciones. ¿Qué haces?', [['Le dejo pasar: tiene aspecto profesional', false], ['Pido identificación, lo verifico con informática o dirección por un teléfono que yo conozco y no le dejo solo', true], ['Le doy la llave y que avise al acabar', false]], 'Dejar pasar a externos sin verificar es la suplantación presencial de la que avisa INCIBE.', 5],
])

await c.build()
