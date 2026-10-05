/**
 * Curso 3 · «Correo, mensajes y llamadas: no piques el anzuelo»
 *   node scripts/curso-ciberseguridad/run.mjs c3-correo-fraudes.mjs
 * Fuente única de datos: docs/curso-ciberseguridad/fuentes/03-correo-fraudes.md
 * Todos los mensajes, nombres, dominios y teléfonos de ejemplo son inventados (ficticios).
 */
import { CourseBuilder, ix, fbk } from './lib.mjs'
import * as W from './widgets.mjs'
import * as M from './c3-widgets.mjs'
import { buildSvgs } from './c3-svgs.mjs'

const OBJ = [
  'Reconocer los trucos psicológicos (prisa, miedo, autoridad, premio) con los que te engañan por mensaje o llamada',
  'Detectar las señales de un correo, SMS o código QR falso y comprobar un enlace o un remitente sin pulsar',
  'Responder con seguridad a llamadas y WhatsApp que piden códigos, claves o datos de residentes',
  'Aplicar la verificación por otro canal ante peticiones de dinero, cambios de IBAN o pagos urgentes',
  'Actuar con rapidez si has picado: avisar, limitar el daño y saber a quién acudir',
]

const c = new CourseBuilder({
  id: 'cibersegsoc-c3-correo-fraudes',
  identifier: 'CIBERSEG_C3',
  title: 'Correo, mensajes y llamadas: no piques el anzuelo',
  subtitle: 'Cómo reconocer y frenar fraudes por correo, SMS, WhatsApp y teléfono en un centro sociosanitario',
  description: 'Curso práctico para el personal de residencias y centros sociosanitarios: aprende a detectar correos, SMS, mensajes de WhatsApp, códigos QR y llamadas fraudulentas, a verificar antes de actuar y a reaccionar con rapidez si has picado. Pensado para el móvil, sin jerga técnica.',
  hours: 1.7,
  primary: '#d9482b',
  accent: '#f4c910',
  moduleTitle: 'Detectar y parar los fraudes por mensaje',
  objectives: OBJ,
})

// ───────────────────────────── Ilustraciones ─────────────────────────────
const { svgs, spots } = buildSvgs()
for (const [p, s] of Object.entries(svgs)) c.asset(p, s)
const IMG = (n, alt, caption = '') => ({ src: `assets/img/c3_${n}.svg`, alt, caption, layout: 'top', full: true })

// ───────────────────────────── Interactivos a medida ─────────────────────────────
const swipe = W.swipeDeck({
  titulo: '',
  cards: [
    { canal: '📱 SMS', de: 'Correos', texto: 'Su paquete #ES48392 no pudo entregarse. Confirme la dirección y pague 1,29 € de tasa en: https://correos-envios.info/pago', fraude: true, pistas: ['No esperabas ningún paquete', 'Pide pagar una tasa pequeña', 'Dominio «.info» ajeno a la empresa', 'Pide datos de tarjeta'], porque: 'Es smishing de paquetería. Si dudas, entra tú en la web o app oficial de la empresa de envíos y comprueba si hay un envío a tu nombre.' },
    { canal: '✉️ Correo', de: 'coordinacion@tu-residencia.es (la dirección de siempre)', asunto: 'Formación de mañana', texto: 'Recordatorio: mañana a las 10:00 formación en la sala 2. Si tienes dudas, llama a coordinación.', fraude: false, pistas: ['Dominio conocido', 'Sin enlaces ni adjuntos', 'No pide datos'], porque: 'Canal habitual, remitente correcto, nada que pulsar y nada que te pidan. Un correo legítimo existe y no hay que ver fantasmas en todo.' },
    { canal: '💬 WhatsApp', de: 'Número no guardado, con la foto de tu supervisora', texto: 'Hola Marta, soy Elena, he cambiado de móvil. ¿Me envías el código que te llegue por SMS? Es para entrar en la app de turnos. Rápido porfa, que llego tarde.', fraude: true, pistas: ['Número nuevo y foto copiada', 'Pide un código de SMS', 'Prisa'], porque: 'Es el patrón de robo de cuenta de WhatsApp: el código de 6 cifras es la llave. Verifica llamando al número de siempre de tu supervisora.' },
    { canal: '📱 SMS', de: 'Tu banco', texto: 'Compra de 45 € en un comercio. Si no la reconoces, llama al teléfono de la tarjeta (el de la parte de atrás).', fraude: false, pistas: ['No trae enlace', 'No pide claves', 'Te manda a un número que ya tienes'], porque: 'Llega por el hilo habitual, no te pide nada y te invita a llamar a un número que ya conoces. Eso es verificar bien.' },
    { canal: '📱 SMS', de: 'Agencia Tributaria', texto: 'Tiene una devolución pendiente de 312,45 €. Solicítela en https://aeat-devoluciones.top/ver antes del viernes.', fraude: true, pistas: ['Dinero «gratis»', 'Dominio «.top»', 'Plazo corto'], porque: 'La Administración no pide datos bancarios por un enlace de SMS: se entra escribiendo tú su dirección en el navegador.' },
    { canal: '📞 Llamada', de: 'Una hija llama al teléfono de la residencia', texto: 'Pregunta por el horario de visitas. Tras identificarla según el protocolo, el centro le explica lo que está permitido.', fraude: false, pistas: ['Llama ella al número del centro', 'El centro controla el canal', 'Identificación según protocolo'], porque: 'Aquí el canal lo controla el centro y la identidad se comprueba. Es justo lo contrario del WhatsApp que pide datos de salud.' },
    { canal: '✉️ Correo', de: 'Servicio de Seguridad TI <seguridad@centro-sociosanitario.net>', asunto: 'Verificación obligatoria de su cuenta', texto: 'Para mantener su acceso debe verificar su identidad. Escanee el código QR de este correo con su móvil antes de las 18:00.', fraude: true, pistas: ['Dominio parecido, pero no igual', 'QR en lugar de enlace', 'Plazo de pocas horas'], porque: 'Es quishing: el QR esconde el destino y salta filtros. Un QR inesperado por correo no se escanea.' },
    { canal: '📞 Llamada', de: 'Un proveedor llama a administración', texto: 'Le avisa de que enviará un cambio de datos. Administración le devuelve la llamada al número del contrato; luego llega el correo desde su dominio habitual y un segundo responsable lo valida.', fraude: false, pistas: ['Doble canal', 'Llamada de vuelta a un número conocido', 'Segundo responsable'], porque: 'Es un cambio verificado por otro canal y con doble control. Así debe hacerse.' },
  ],
})

const chatWhats = W.chatStory({
  contacto: { nombre: 'Elena (¿supervisora?)', emoji: '👩', sub: 'número nuevo · +34 6xx xxx xxx' },
  nodos: {
    n1: {
      msgs: [['sys', 'Estás de turno de tarde. Te escribe un número que no tienes guardado, con la foto de tu supervisora.'], ['them', 'Hola Marta, soy Elena, he cambiado de móvil.'], ['them', 'Necesito que me ayudes con el cuadrante: ¿me envías el código que te llegue por SMS? Es para entrar en la app de turnos. Rápido porfa, que llego tarde.']],
      choices: [
        { t: 'Te lo paso ahora mismo, ¡que llegas tarde!', next: 'bad', q: 'bad', fb: 'Ese código es la llave de tu cuenta de WhatsApp.' },
        { t: 'Le pregunto: «¿Qué turno hice ayer?»', next: 'n2', q: 'mid', fb: 'Buena idea preguntar algo que solo ella sabría, pero mejor aún es no jugársela por el mismo canal.' },
        { t: 'No envío nada. Llamo a Elena a su número de siempre.', next: 'good', q: 'good', fb: 'Verificar por otro canal es lo correcto.' },
      ],
    },
    n2: {
      msgs: [['them', 'Jaja, no me acuerdo ahora. Pásame el código y ya está, que es urgente.']],
      choices: [
        { t: 'Vale, ahí va el código.', next: 'bad', q: 'bad', fb: 'Evita la pregunta y mete prisa: dos señales.' },
        { t: 'No. Llamo a Elena a su número de siempre y aviso a mi responsable.', next: 'good', q: 'good', fb: 'Esquivar tu pregunta y apurarte es la señal definitiva.' },
      ],
    },
    bad: { msgs: [['sys', 'Minutos después tu WhatsApp se cierra solo. Tus contactos reciben mensajes «tuyos» pidiendo dinero.']], fin: { tipo: 'bad', titulo: 'Te han quitado el WhatsApp', texto: 'Si te pasa: avisa a tus contactos y a tu responsable, activa la verificación en dos pasos y escribe a support@whatsapp.com. Y nunca sientas vergüenza: lo grave es no avisar.' } },
    good: { msgs: [['sys', 'Llamas a Elena. Contesta desde su móvil de siempre: no ha cambiado de número.']], fin: { tipo: 'good', titulo: '¡Bien cortado!', texto: 'Ante un número nuevo que pide un código: no se lo des, llama al número de siempre y avisa. Con eso has parado el fraude.' } },
  },
})

const chatLlamada = W.chatStory({
  estilo: 'llamada',
  contacto: { nombre: 'Soporte técnico', emoji: '🎧', sub: 'llamada entrante · número desconocido' },
  nodos: {
    n1: {
      msgs: [['sys', 'Estás en el cuarto de mantenimiento. Te suena el móvil.'], ['them', 'Buenos días, le llamo del servicio técnico de Microsoft. Hemos detectado que el ordenador de recepción está infectado y enviando datos de residentes.']],
      choices: [
        { t: '¡Qué grave! ¿Qué tengo que hacer?', next: 'n2', q: 'mid', fb: 'Normal asustarse: es justo lo que buscan.' },
        { t: 'Yo no he llamado a nadie. ¿Quién es usted?', next: 'n3', q: 'good', fb: 'Una llamada que no pediste ya es una señal.' },
        { t: 'Cuelgo y aviso a mi responsable.', next: 'good', q: 'good', fb: 'La decisión más rápida y segura.' },
      ],
    },
    n2: {
      msgs: [['them', 'Descargue esta aplicación de control remoto y dígame el código que aparece. Si no lo hacemos hoy, le bloquearán el equipo.']],
      choices: [
        { t: 'Vale, la descargo.', next: 'bad', q: 'bad', fb: 'Dar el control del equipo a un desconocido es entregarle la casa.' },
        { t: 'No instalo nada. Cuelgo y aviso al responsable de TIC.', next: 'good', q: 'good', fb: 'Miedo + prisa + control remoto: patrón completo.' },
      ],
    },
    n3: {
      msgs: [['them', 'No importa, es por su seguridad. Instale la aplicación y dígame el código, es urgente.']],
      choices: [
        { t: 'Cuelgo y aviso al responsable.', next: 'good', q: 'good', fb: 'Insistir y apurarte confirma el engaño.' },
        { t: 'Está bien, dígame cómo se instala.', next: 'bad', q: 'bad', fb: 'No des ni un paso más.' },
      ],
    },
    bad: { msgs: [['sys', 'La persona del otro lado ya controla el ordenador y ve todo lo que hay en pantalla.']], fin: { tipo: 'bad', titulo: 'Acceso comprometido', texto: 'Si te pasa: desconecta el equipo de la red, avisa ya a tu responsable o a TIC y no vuelvas a usarlo hasta que lo revisen. Avisar pronto limita el daño.' } },
    good: { msgs: [['sys', 'Llamada finalizada. Avisas a tu responsable, que lo anota por si llaman a más compañeros.']], fin: { tipo: 'good', titulo: '¡Bien hecho!', texto: 'Colgar, no instalar nada y avisar es la respuesta correcta. Nadie legítimo te llama por sorpresa para controlar tu ordenador.' } },
  },
})

const chatFamilia = W.chatStory({
  contacto: { nombre: 'Número desconocido', emoji: '👤', sub: '+34 6xx xxx xxx · «hija del Sr. Gil»' },
  nodos: {
    n1: {
      msgs: [['sys', 'Estás en enfermería. Te escribe un número desconocido.'], ['them', 'Buenas tardes, soy la hija del Sr. Pedro Gil, de la habitación 12. Mi padre me ha dicho que ayer lo vio el médico.'], ['them', '¿Me puedes pasar la analítica y la medicación que toma por aquí? Estoy en el extranjero y no puedo llamar. Es urgente.']],
      choices: [
        { t: 'Le envío la analítica ahora mismo.', next: 'bad', q: 'bad', fb: 'No puedes saber quién hay al otro lado.' },
        { t: 'Le mando solo la medicación, que es poco.', next: 'bad', q: 'bad', fb: 'La medicación también es un dato de salud.' },
        { t: 'No facilito datos por aquí. Le explico que dirección o enfermería la atenderán por el canal autorizado, tras identificarla.', next: 'n2', q: 'good', fb: 'Dato de salud + canal no verificable = no.' },
      ],
    },
    n2: {
      msgs: [['them', 'Pero es mi padre, ¡es urgente! ¿Cómo que no? Dime al menos si está bien.']],
      choices: [
        { t: 'Entiendo su preocupación. Aviso ahora a dirección para que contacten con usted por el canal autorizado.', next: 'good', q: 'good', fb: 'Empatía sin ceder datos.' },
        { t: 'Vale, dime tu DNI por aquí y te lo envío.', next: 'bad', q: 'bad', fb: 'Un DNI escrito en un chat no demuestra nada.' },
      ],
    },
    bad: { msgs: [['sys', 'Los datos de salud del residente salen del centro sin que nadie sepa a quién.']], fin: { tipo: 'bad', titulo: 'Datos de salud filtrados', texto: 'Si crees que has dado datos de un residente, avisa de inmediato al responsable de protección de datos del centro: es quien decide los siguientes pasos.' } },
    good: { msgs: [['sys', 'Avisas a dirección, que gestiona el contacto según el protocolo del centro.']], fin: { tipo: 'good', titulo: '¡Bien gestionado!', texto: 'Los datos de salud son especialmente sensibles: no se dan a quien no se ha podido identificar. Escuchar con empatía y pasar el caso al canal correcto protege al residente y a su familia.' } },
  },
})

const urlLab = W.urlLab({
  titulo: '',
  urls: [
    { partes: ['https://', 'intranet.', 'residenciasolmar', '.es', '/cuadrante'], dominio: 2, fiable: true, porque: 'El dominio es residenciasolmar.es, el del centro. «intranet.» solo es una sección de ese dominio.' },
    { partes: ['https://', 'residenciasolmar', '.es', '.acceso-seguro', '.top', '/login'], dominio: 3, fiable: false, porque: 'Se lee «residenciasolmar.es», pero el dominio real es lo último antes de la barra: acceso-seguro.top. Lo anterior es el disfraz.' },
    { partes: ['https://', 'correos-envios', '.info', '/pago'], dominio: 1, fiable: false, porque: 'No esperabas ningún paquete, te piden pagar y el dominio «.info» no es el de la empresa de envíos. Verifica en su web o app oficial.' },
    { partes: ['https://', 'bit.ly', '/4kLm2'], dominio: 1, fiable: false, porque: 'Un enlace acortado esconde el destino. En un SMS que no esperabas, no lo pulses.' },
    { partes: ['https://', 'mutua-saludlaboral-gestion', '.com', '/verifica'], dominio: 1, fiable: false, porque: 'Pide «verificar» tus datos y su dominio no es el de la mutua que conoces. Entra tú por su app o su web.' },
  ],
})

const inbox = M.inboxSim({
  titulo: '',
  emails: [
    {
      canal: '✉️ Correo 1 · Mutua', cierre: 'Ni los pocos datos que sabe de ti ni el logo lo hacen real: lo delatan el dominio, el miedo a perder la baja y el .zip. Lo correcto es entrar tú en la app o web de la mutua, o llamarles.',
      partes: [
        { l: 'De:', t: 'Mutua Salud Laboral <avisos@mutua-saludlaboral-gestion.com>', s: true, why: 'El dominio no es el de tu mutua: se le han añadido palabras.' },
        { l: 'Asunto:', t: 'URGENTE: Su baja será anulada en 24 h', s: true, why: 'Prisa y miedo a perder algo.' },
        { l: '', t: 'Estimado trabajador:', s: true, why: 'Saludo genérico: no saben cómo te llamas.' },
        { l: '', t: 'Hemos detectado un error en los datos de su parte de baja.', s: false, why: 'Por sí sola no delata nada: es el gancho.' },
        { l: '', t: 'Si no lo corrige en 24 horas su prestación quedará suspendida.', s: true, why: 'Amenaza con un plazo corto.' },
        { l: '', t: 'Acceda aquí para actualizar sus datos y su DNI: mutua-saludlaboral-gestion.com/verifica', s: true, why: 'Pide datos y DNI en un enlace.' },
        { l: 'Adjunto:', t: 'Formulario_baja.zip', s: true, why: 'Un comprimido inesperado es de riesgo.' },
        { l: '', t: 'Atentamente, Departamento de Prestaciones', s: false, why: 'Una firma la copia cualquiera: no prueba nada.' },
      ],
    },
    {
      canal: '✉️ Correo 2 · Proveedor', cierre: 'La clave es el cambio de IBAN por correo con prisa. Aunque sepa tu nombre y use un hilo «RE:», no se cambia ningún IBAN sin llamar a un teléfono conocido y sin segundo responsable.',
      partes: [
        { l: 'De:', t: 'Rosa Mena <rosa.mena@suministros-delnorte.co>', s: true, why: 'Tu proveedor real usa «.es»; este acaba en «.co».' },
        { l: 'Asunto:', t: 'RE: Factura septiembre – NUEVOS DATOS BANCARIOS', s: true, why: 'Cambio de cuenta por correo: petición inusual. El «RE:» puede ser falso.' },
        { l: '', t: 'Buenos días Marta,', s: false, why: 'Saber tu nombre no prueba nada: se averigua fácil.' },
        { l: '', t: 'Por cambio de entidad, a partir de hoy el pago de nuestras facturas debe hacerse a la cuenta ES00 0000 0000 00 0000000000 (IBAN de ejemplo).', s: true, why: 'Nuevo IBAN por correo, sin verificación.' },
        { l: '', t: 'Por favor confirme hoy la actualización para no retrasar el servicio.', s: true, why: 'Prisa para que no compruebes.' },
        { l: 'Adjunto:', t: 'Factura_0924.pdf.exe', s: true, why: 'Doble extensión: parece un PDF pero es un programa (.exe).' },
      ],
    },
    {
      canal: '✉️ Correo 3 · Coordinación', cierre: 'Este correo era legítimo: dominio de siempre, canal habitual, sin enlaces ni adjuntos y sin pedir nada. Desconfiar con método no es desconfiar de todo.',
      partes: [
        { l: 'De:', t: 'Coordinación <coordinacion@tu-residencia.es>', s: false, why: 'Es la dirección de siempre.' },
        { l: 'Asunto:', t: 'Formación de mañana', s: false, why: 'Un asunto normal, sin prisa ni miedo.' },
        { l: '', t: 'Hola Marta, mañana a las 10:00 hay formación en la sala 2.', s: false, why: 'Te llama por tu nombre y habla de algo esperable.' },
        { l: '', t: 'Si tienes dudas, llama a coordinación.', s: false, why: 'Te manda a llamar a un número que ya conoces: verificación por otro canal.' },
      ],
    },
  ],
})

const compare = M.senderCompare({
  titulo: '',
  casos: [
    { nombre: 'Elena Ruiz (Directora)', conocida: 'elena.ruiz@residenciasolmar.es', recibida: 'elena.ruiz@residenciasolmar.es', impostor: false, porque: 'La dirección coincide letra por letra con la que tienes guardada. Aun así, si te pide dinero con prisa, verifica por otro canal.' },
    { nombre: 'Rosa Mena · Suministros', conocida: 'rosa.mena@suministros-delnorte.es', recibida: 'rosa.mena@suministros-delnorte.co', impostor: true, porque: 'Cambia solo la terminación: «.co» en lugar de «.es». Una letra basta para suplantar a tu proveedor.' },
    { nombre: 'Recepción', conocida: 'recepcion@residenciasolmar.es', recibida: 'recepcion@residenciasolrnar.es', impostor: true, porque: 'Han sustituido «m» por «rn» (una erre y una ene juntas): a simple vista se leen igual.' },
    { nombre: 'Directora Elena Ruiz', conocida: 'elena.ruiz@residenciasolmar.es', recibida: 'direccion.residencia@gmail.com', impostor: true, porque: 'Una cuenta personal de gmail a nombre de la directora. El nombre lo escribe cualquiera; la dirección no es la del centro.' },
    { nombre: 'Mutua Salud Laboral', conocida: 'avisos@mutua-saludlaboral.es', recibida: 'avisos@mutua-saludlaboral-gestion.com', impostor: true, porque: 'Le han añadido «-gestion» y cambiado la terminación. Los dominios «casi iguales» son el disfraz favorito.' },
    { nombre: 'Soporte TIC', conocida: 'tic@residenciasolmar.es', recibida: 'tic@residenciasolmar.es', impostor: false, porque: 'Es la dirección correcta. No todo mensaje es un fraude: se comprueba y se sigue.' },
  ],
})

const triage = M.triage({
  titulo: '',
  siempre: 'Pase lo que pase: avisa pronto a tu responsable o a TIC. Nadie se enfada por avisar; sí por callar.',
  situaciones: [
    { icon: '📧', t: 'Solo he abierto el correo', pasos: ['No pulses nada más ni descargues nada', 'Avisa a tu responsable o a TIC', 'Bloquea al remitente y borra el correo'], nota: 'Abrirlo, por sí solo, no suele pasar de ahí. Lo importante es no seguir interactuando con él.' },
    { icon: '🔗', t: 'He pulsado un enlace, sin poner datos', pasos: ['Cierra la página', 'No introduzcas nada si vuelve a pedírtelo', 'Avisa a tu responsable'] },
    { icon: '🔑', t: 'He escrito mi usuario y contraseña', pasos: ['Avisa de inmediato a tu responsable o a TIC', 'Cambia la contraseña desde un dispositivo fiable', 'Cámbiala también en otros servicios donde fuera igual', 'Guarda capturas del mensaje y del enlace'], nota: 'Si hay datos de residentes en juego, avisa al responsable de protección de datos del centro.' },
    { icon: '📎', t: 'He abierto un adjunto', pasos: ['Desconecta el equipo de la red (wifi o cable)', 'No sigas usándolo y avisa ya a TIC', 'Sigue el protocolo del centro: lo revisarán ellos'], nota: 'No intentes arreglarlo tú. Rapidez primero.' },
    { icon: '💳', t: 'He dado datos bancarios o he pagado', pasos: ['Llama a tu banco de inmediato', 'Avisa a tu responsable', 'Guarda pruebas: capturas, número, enlace', 'Denuncia (Policía Nacional o Guardia Civil) y consulta al 017'], nota: 'Cuanto antes se avise al banco, más opciones hay.' },
    { icon: '🔢', t: 'He dado un código (WhatsApp o SMS)', pasos: ['Avisa a tus contactos de que alguien se hace pasar por ti', 'Activa la verificación en dos pasos en cuanto recuperes la cuenta', 'Escribe a support@whatsapp.com', 'Denuncia si hay suplantación'] },
  ],
})

const pledge = W.pledge({
  titulo: '',

  intro: 'Marca lo que te comprometes a hacer a partir de hoy.',
  items: [
    'Antes de pulsar, miraré quién lo envía de verdad y a dónde lleva.',
    'No daré nunca un código de verificación a nadie.',
    'Ante una petición de dinero o un cambio de IBAN, llamaré a un número ya conocido.',
    'No daré datos de residentes por WhatsApp ni a quien no pueda identificar.',
    'Si algo me parece raro, pararé y preguntaré.',
    'Si pico, avisaré enseguida y sin vergüenza.',
    'Ayudaré, sin regañar, a quien me diga «creo que he pulsado algo».',
    'Guardaré el 017 de INCIBE para pedir ayuda gratuita.',
  ],
  minimo: 6,
  final: '¡Compromiso firmado! Gracias por cuidar también de los datos de las personas que cuidas.',
})

c.assetFile('assets/img/c3_kit_0402.png', 'C:/Users/Jose Alberto Arruego/Downloads/kit_concienciacion/kit_concienciacion/RecursosFormativos/04_Fraudes/Consejos/0402_Fraudes.png')

// ───────────────────────────── Portada e introducción ─────────────────────────────
c.intro({ type: 'cover', title: 'Correo, mensajes y llamadas: no piques el anzuelo', text: 'Cómo reconocer y frenar fraudes en tu centro', img: { src: 'assets/img/c3_portada.svg', alt: 'Un anzuelo del que cuelga un sobre de correo como cebo', full: true } })

// ───────────────────────────── Lección 1 ─────────────────────────────
const l1 = c.unit('Lección 1. Cómo piensa el estafador', 'Los estafadores no fuerzan la puerta: te piden que se la abras. Conoces los seis trucos que usan y el hábito que los frena.')
l1.add({ type: 'cover', title: 'Cómo piensa el estafador', text: 'Lección 1' })
  .add({ type: 'objectives', title: 'Lo que vas a lograr', obj: 0, text: 'No hace falta saber de ordenadores: hace falta **desconfiar con método**. Al terminar sabrás:\n- **Reconocer** los trucos con los que te engañan.\n- **Detectar** un correo, SMS o QR falso y comprobar un enlace sin pulsar.\n- **Responder** a llamadas y WhatsApp que piden códigos o datos.\n- **Verificar** por otro canal el dinero y los cambios de IBAN.\n- **Actuar rápido** si ya has picado.' })
  .add({ title: 'Te engañan a ti, no al aparato', obj: 0, img: IMG('anzuelo', 'Un desconocido dice «ábreme, soy de informática» ante una puerta cerrada, mientras una trabajadora duda'), text: 'Los estafadores no fuerzan la puerta: **te piden que se la abras**. Se llama **ingeniería social**: manipular a las personas para que hagan algo que no deberían.\n\nEn una residencia hay cosas que les interesan: **dinero** (facturas, proveedores, nóminas), **datos de salud** de residentes y **familias** que se preocupan y responden rápido.\n\n::: fact\nEl 28 % de las personas que llamaron en 2025 a la línea 017 de INCIBE había recibido phishing, vishing o smishing.\n:::' })
  .add({ title: 'Seis trucos para tu cabeza', obj: 0, text: 'Cambian el canal, pero tocan siempre las mismas emociones. Da la vuelta a cada carta.', ix: ix.flip([
    ['**Autoridad**', '«Soy la directora, la Policía o la Seguridad Social: haz esto ya.»'],
    ['**Ayudar**', '«Soy de informática, dame tu clave para arreglarlo.» «Soy tu compañera, ¿me cubres el turno?»'],
    ['**Miedo a perder algo**', '«Tu cuenta de correo se bloqueará en 8 horas.»'],
    ['**Miedo a quedar mal**', '«Tengo vídeos tuyos…» Es chantaje (sextorsión): no tienen nada.'],
    ['**Premio o «gratis»**', '«Has ganado un vale.»'],
    ['**Urgencia**', '«Hazlo ahora y no se lo digas a nadie.» La prisa sirve para que **no tengas tiempo de pensar**.'],
  ]) })
  .add({ type: 'video', title: 'Un caso real de phishing', obj: 0, text: 'Un vídeo de INCIBE, de la serie «Casos reales» de su Línea de Ayuda 017.', video: { id: '7T32WBQRrBA', caption: 'Phishing · Línea de Ayuda en Ciberseguridad 017 – Casos reales (INCIBE)', transcript: 'Vídeo de la serie «Casos reales» de la Línea de Ayuda en Ciberseguridad 017 de INCIBE, dedicado al phishing: el engaño por mensaje que aparenta venir de alguien de confianza para que facilites datos o pulses un enlace. Refuerza la idea de esta lección: ante la duda, no pulses y consulta.' }, notes: ['Verificar la transcripción viendo el vídeo (7T32WBQRrBA) y comprobar que dura menos de 5 min.'] })
  .add({ title: '¿Qué truco es?', obj: 0, text: 'Cada frase usa un truco. Arrástrala al grupo que le corresponde.', ix: ix.classify('Clasifica cada frase según el truco que usa.', [['aut', 'Autoridad o «ayudar»'], ['urg', 'Prisa o secreto'], ['mie', 'Miedo a perder algo'], ['gra', 'Premio o «gratis»']], [
    ['«Soy la directora, haz esto ya»', 'aut'], ['«Soy de informática, dame tu clave para arreglarlo»', 'aut'],
    ['«Hazlo ahora y no se lo cuentes a nadie»', 'urg'], ['«Rápido porfa, que llego tarde»', 'urg'],
    ['«Tu cuenta de correo se bloqueará en 8 horas»', 'mie'], ['«Su prestación quedará suspendida»', 'mie'],
    ['«Has ganado un vale»', 'gra'], ['«Tiene una devolución pendiente: solicítela»', 'gra'],
  ], fbk('¡Los has pillado!', 'Alguna frase está en otro grupo. Piensa qué emoción busca provocar.', 'Cada truco busca una emoción: respeto a la autoridad, ganas de ayudar, miedo, ilusión o prisa. Reconocerla ya es medio camino para frenar el engaño.')) })
  .add({ title: 'Elige tu puesto', obj: 1, text: 'Cada puesto tiene su estafa favorita. Mira la tuya.', ix: ix.tabs([
    ['Gerocultor/a', 'Tu móvil personal y el del turno son blanco de **SMS y WhatsApp** falsos (paquetería, «cambio de turno»).\n- Si alguien con **número nuevo** te pide un código, no se lo des: llama tú a esa persona.\n- Nada de fotos ni datos de residentes por WhatsApp.'],
    ['Auxiliar / enfermería', 'Cuidado con correos de «**resultados de analítica**» con adjuntos raros.\n- Si un «familiar» te pide datos de salud por WhatsApp, no los facilites: avisa a enfermería o a dirección.\n- Un adjunto inesperado, aunque parezca clínico, se comprueba con el laboratorio por su teléfono de siempre.'],
    ['Administración / dirección', 'Tu estafa favorita: **falsa factura, cambio de IBAN y fraude del jefe**.\n- Verifica toda petición de dinero llamando a un número que ya tengas.\n- Pagos importantes con **doble control**: dos personas los autorizan.'],
    ['Supervisión', 'Pueden **suplantarte** para pedir códigos a tu equipo: cuéntales por qué canal y cómo trabajas.\n- Si alguien te dice «creo que he pulsado algo», **ayuda, no regañes**: lo grave es callar.'],
    ['Mantenimiento', 'Las llamadas de falso **soporte técnico** que piden instalar una aplicación de control remoto.\n- Presupuestos de «proveedor» con archivos **.zip** o doble extensión.\n- Códigos QR pegados sobre los originales en carteles y tablones.'],
  ]) })
  .add({ title: 'Tu propia experiencia', obj: 0, text: 'Seguro que alguna vez te han intentado engañar. Piénsalo un momento.', ix: ix.casep('Recuerda un mensaje o una llamada raros que hayas recibido, en el trabajo o fuera. ¿Qué truco usaban? ¿Qué harías ahora de otra manera?', ['Identifico qué emoción buscaban provocar (prisa, miedo, premio…)', 'Sé por qué canal llegaba (correo, SMS, WhatsApp, llamada)', 'Sé qué haré la próxima vez: parar, mirar, verificar y avisar'], { explanation: 'Casi todo el mundo ha recibido alguno. Ponerle nombre al truco (prisa, miedo, autoridad…) es lo que te permite frenar la próxima vez: Para, Mira, Verifica, Avisa.' }) })
  .add({ type: 'summary', title: 'En resumen: los trucos', text: 'Te engañan a ti, no al aparato. Los seis trucos —autoridad, ayudar, miedo a perder, miedo a quedar mal, premio y urgencia— son los mismos en cualquier canal.\n\nSi un mensaje te mete **prisa, miedo o secreto**, ya hay una señal de alarma.' })

// ───────────────────────────── Lección 2 ─────────────────────────────
const l2 = c.unit('Lección 2. Anatomía de un correo falso', 'Aprendes a mirar el remitente, el enlace y el adjunto de un correo, y a marcar sus señales de alarma.')
l2.add({ type: 'cover', title: 'Anatomía de un correo falso', text: 'Lección 2', img: IMG('remitente', 'Un móvil muestra el nombre «Directora Elena Ruiz» y, al lado, la dirección real de gmail que hay detrás') })
  .add({ title: 'Siete preguntas antes de pulsar', obj: 1, text: 'Ante un correo raro, hazte estas siete preguntas. **Una señal es sospecha; dos, no lo toques.**', ix: ix.accordion([
    ['1. ¿Quién lo envía de verdad?', 'Mira la **dirección completa**, no solo el nombre. Sospecha de dominios casi iguales (una letra cambiada) o de un @gmail.com a nombre de una empresa.'],
    ['2. ¿Me llama por mi nombre?', '«Estimado cliente» o «Estimado usuario» es una señal: quien escribe no sabe quién eres.'],
    ['3. ¿Me mete prisa o miedo?', '«En 8 horas se bloqueará tu cuenta». La urgencia está pensada para que no tengas tiempo de pensar.'],
    ['4. ¿Hay faltas o frases raras?', 'Una ortografía o una redacción extrañas delatan muchos fraudes.'],
    ['5. ¿Qué enlace esconde?', 'Comprueba el destino antes de pulsar. En ordenador, pasa el ratón por encima; en muchos móviles puedes mantener pulsado el enlace para ver la dirección. Mejor aún: **escribe tú la dirección** de la entidad o usa su aplicación oficial.'],
    ['6. ¿Trae un adjunto que no esperaba?', 'Desconfía de los archivos .exe, .vbs y .docm y de los comprimidos .zip o .rar de origen desconocido. Facturas, albaranes, «resultados» o «burofax» son los disfraces típicos. Un adjunto inesperado es sospechoso incluso si viene de un conocido: su cuenta puede estar comprometida.'],
    ['7. ¿Pide algo que esa entidad no pide?', 'Contraseñas, códigos, datos bancarios, «confirmar tu identidad». Una entidad legítima rara vez manda enlaces en sus comunicaciones oficiales.'],
  ]) })
  .add({ title: '¿Quién lo envía de verdad?', obj: 1, text: 'El **nombre** que ves lo escribe quien envía. Lo que cuenta es la **dirección**, y a veces cambia solo una letra. Las direcciones de este ejemplo son inventadas.', ix: ix.html({ ...compare, est_seconds: 300, prompt: '' }) })
  .add({ title: 'Enlaces: mira antes de pulsar', obj: 1, img: IMG('candado', 'Dos barras de navegador con candado: una web real y una falsa'), text: 'Antes de pulsar, mira a dónde lleva. Lo que decide el destino es el **dominio**: lo que va justo antes de la primera barra «/».\n\n::: warn\nEl candado y el «https» **no garantizan** que la web sea la real: también se pueden manipular.\n:::\n\nEn un SMS, desconfía de los enlaces acortados (como bit.ly): esconden el destino.' })
  .add({ title: 'Inspector de enlaces', obj: 1, text: 'Practica con cinco enlaces de ejemplo: toca el trozo que decide el destino y di si te fías.', ix: ix.html({ ...urlLab, est_seconds: 210, prompt: '' }) })
  .add({ title: 'Correo sospechoso: no pinches', obj: 1, img: { src: 'assets/img/c3_kit_0402.png', alt: 'Cartel de INCIBE: ante un correo sospechoso, no pinches en los enlaces', caption: 'Kit de concienciación de INCIBE', layout: 'top', width: 50 }, text: 'Un recordatorio del **kit de concienciación de INCIBE**: ante un correo sospechoso, **no pinches en los enlaces**. Comprueba por otro canal y avisa.', notes: ['Imagen del Kit de concienciación de INCIBE (0402_Fraudes.png). Licencia de reutilización sin confirmar: verificar antes de publicar.'] })
  .add({ title: 'Adjuntos con disfraz', obj: 1, text: 'El adjunto es la otra puerta de entrada. Abre cada disfraz típico.', ix: ix.accordion([
    ['Facturas, albaranes y «burofax»', 'Son los disfraces más usados: un documento que parece cotidiano en un centro, con prisa por abrirlo. INCIBE ha publicado campañas con supuestas facturas y falsos comunicados de la Agencia Tributaria con un archivo .zip.'],
    ['«Habilite el contenido» (.docm)', 'Un documento de Word con extensión .docm que te pide **habilitar el contenido** puede ejecutar macros maliciosas. Si no lo esperabas, no lo abras ni habilites nada.'],
    ['Comprimidos .zip y .rar', 'Esconden otros archivos y saltan algunos filtros. De origen desconocido, ni abrirlos.'],
    ['Doble extensión (.pdf.exe)', 'Parece un PDF, pero lo último es .exe: un programa. Si el nombre acaba en .exe, .vbs o .docm, desconfía siempre.'],
    ['El de un conocido', 'Un adjunto **inesperado** es sospechoso aunque venga de alguien que conoces: su cuenta puede estar comprometida. Pregúntale por otro canal.'],
  ]) })
  .add({ title: '¿Señal o normal?', obj: 1, text: 'Ya sabes mirar. Separa lo que es una señal de alarma de lo que es normal.', ix: ix.classify('Clasifica cada detalle de un correo.', [['sen', 'Señal de alarma'], ['nor', 'Es normal']], [
    ['Remitente @gmail.com en nombre de una empresa', 'sen'], ['Te llama por tu nombre y habla de algo que esperabas', 'nor'],
    ['«Su cuenta se bloqueará en 24 horas»', 'sen'], ['Adjunto llamado Factura.pdf.exe', 'sen'],
    ['La dirección de siempre del centro, sin enlaces', 'nor'], ['Te piden la contraseña para «verificar tu cuenta»', 'sen'],
    ['Aviso de formación que te invita a llamar a coordinación', 'nor'], ['Una factura en .zip que no esperabas', 'sen'],
  ], fbk('¡Muy bien!', 'Algún detalle está en el grupo equivocado.', 'Una señal es sospecha; dos, no lo toques. Y un correo normal, de la dirección de siempre y sin pedir nada, no hay que temerlo.')) })
  .add({ title: 'Encuentra los fallos', obj: 1, text: 'Este correo falso tiene varias señales de alarma. Toca las partes que te hagan sospechar; alguna zona es inocente.', ix: ix.hotspots('assets/img/c3_correo_falso.svg', 'Un correo falso de una mutua que pide actualizar datos y el DNI en 24 horas, con un adjunto .zip', spots, 'Toca cada parte del correo que te parezca una señal de alarma.', fbk('¡Bien visto!', 'Esa zona no es la clave. Prueba con otra.'), { scored: false, instructions: 'Toca las zonas del correo.' }) })
  .add({ type: 'video', title: 'Cuidado con el phishing', obj: 1, text: 'Un vídeo del Ministerio del Interior, de la campaña #AyúdanosAProtegerte.', video: { id: 'iBTDsKRT8F0', caption: '¡Cuidado con el phishing! · Ministerio del Interior (#AyúdanosAProtegerte)', transcript: 'Vídeo de la campaña #AyúdanosAProtegerte del Ministerio del Interior sobre el phishing, con consejos de las fuerzas de seguridad para no caer en este engaño.' }, notes: ['Verificar la transcripción viendo el vídeo (iBTDsKRT8F0) y comprobar que dura menos de 5 min.'] })
  .add({ title: 'Marca las señales', obj: 1, text: 'Tres correos en la bandeja del móvil. Toca las líneas sospechosas; uno de ellos es legítimo.', ix: ix.html({ ...inbox, est_seconds: 420, prompt: '' }) })
  .add({ type: 'summary', title: 'En resumen: el correo', text: 'Mira la **dirección** del remitente, el **enlace** y el **adjunto**. Comprueba el dominio, no el candado, y desconfía del saludo genérico, la prisa y lo que no esperabas.\n\nSi dudas, entra tú en la web o app oficial en vez de pulsar.' })

// ───────────────────────────── Lección 3 ─────────────────────────────
const l3 = c.unit('Lección 3. SMS, WhatsApp y códigos QR', 'El mismo engaño por otros canales: SMS, WhatsApp y códigos QR. El código de verificación no se da a nadie.')
l3.add({ type: 'cover', title: 'SMS, WhatsApp y códigos QR', text: 'Lección 3' })
  .add({ title: 'Smishing: el SMS con prisa', obj: 1, img: IMG('sms', 'Un SMS falso de paquetería con cuatro señales de alarma numeradas'), text: 'El **smishing** es el phishing por **SMS** o mensajería. El clásico: «tu paquete está retenido, paga una tasa».\n- Verifica en la **web o app oficial** de la empresa, nunca en el enlace.\n- No instales aplicaciones desde enlaces de un SMS.\n- Desconfía de la urgencia y de lo que no esperabas.\n- No respondas: confirmas que tu número está activo.' })
  .add({ title: 'WhatsApp: el código de 6 cifras', obj: 2, img: IMG('whatsapp', 'Un WhatsApp falso desde un número nuevo que pide el código de 6 cifras del SMS'), text: 'Te escribe alguien con el nombre y la foto de tu supervisora, o un falso repartidor o «soporte de WhatsApp», y te pide el **código de 6 cifras** que te llega por SMS. Con él se quedan con tu cuenta.\n\n::: important\nEl código de verificación **no se da a nadie, nunca**.\n:::\n\nActiva la **verificación en dos pasos** de WhatsApp para protegerte mejor.' })
  .add({ title: 'La supervisora con número nuevo', obj: 2, text: 'Estás de turno. Vive la situación y elige qué haces: puedes probar otras decisiones.', ix: ix.html({ ...chatWhats, est_seconds: 300, prompt: '' }) })
  .add({ title: 'El falso repartidor', obj: 2, text: 'Estás en recepción.', ix: ix.scenario('Te llama alguien: «Soy el repartidor, tengo un paquete urgente para usted. Le va a llegar un código por SMS; léamelo para poder entregárselo».', '¿Qué haces?', [
    ['Le leo el código: así llega el paquete.', false, 'Con ese código se quedan con tu cuenta de WhatsApp. INCIBE ha documentado este engaño.'],
    ['No le doy el código. Cuelgo y compruebo en la web de la empresa de envíos si hay un paquete a mi nombre.', true, 'El código de verificación no se da a nadie, y se comprueba por el canal oficial.'],
    ['Le doy solo tres cifras.', false, 'Ni una: te irán sacando el resto.'],
    ['Le pido que me escriba el código en un mensaje.', false, 'Seguirías en su canal y compartiendo el código.'],
  ], fbk('¡Correcto!', 'Piensa: ¿quién necesita de verdad ese código?', 'Un repartidor no necesita ningún código de tu cuenta. El código de verificación es la llave de tu WhatsApp y no se da a nadie.')) })
  .add({ title: 'La regla del código', obj: 2, text: 'Una regla que merece repetirse.', ix: ix.fill('Completa la regla de oro.', 'El código de verificación de WhatsApp que llega por SMS no se da a [[nadie]]. Si una persona con número nuevo me lo pide, la compruebo llamando a su número de [[siempre]].', ['todos', 'nuevo', 'nunca'], fbk('¡Regla aprendida!', 'Revisa los huecos.', 'El código es la llave de tu cuenta: no se da a nadie. Y si dudas de quién escribe, llamas tú a su número de siempre.')) })
  .add({ title: 'Quishing: el QR que no conoces', obj: 1, img: IMG('qr', 'Un cartel con un código QR y una pegatina falsa pegada encima'), text: 'El **quishing** usa códigos **QR**. INCIBE avisó de correos con un QR que llevaba a un falso inicio de sesión de Microsoft y de QR pegados sobre los originales en lugares públicos.\n- No escanees un QR que llegue por correo sin esperarlo.\n- Mira la dirección que te enseña el móvil antes de abrirla.\n- Si es el QR de un cartel, comprueba que no sea una pegatina.' })
  .add({ title: 'Cada engaño, su nombre', obj: 1, text: 'Los nombres suenan raros, pero son fáciles: el canal por el que te engañan.', ix: ix.match('Une cada engaño con su nombre.', [['Correo falso', 'Phishing'], ['SMS falso', 'Smishing'], ['Llamada falsa', 'Vishing'], ['Código QR falso', 'Quishing']], fbk('¡Todo emparejado!', 'Alguna pareja no es correcta.', 'Phishing es el engaño por correo (y, en general, por mensaje); smishing es por SMS; vishing, por llamada; quishing, por código QR.')) })
  .add({ title: '«Hola, mamá, se me ha roto el móvil»', obj: 2, text: 'Un engaño muy repetido, también fuera del trabajo: un SMS o WhatsApp de un «hijo» o «hija» desde un número nuevo que acaba pidiendo dinero urgente por transferencia o Bizum. INCIBE lo documenta como la estafa del familiar en apuros.\n\n- Señales: número desconocido, faltas de ortografía, urgencia y secreto.\n- Cómo verificar: **llama al número de siempre** o pregunta algo que solo esa persona sabría.\n\n::: tip\nCuéntalo en casa: la misma regla protege a tu familia.\n:::' })
  .add({ title: '¿Qué le respondes?', obj: 2, text: 'Te llega un mensaje a tu móvil personal.', ix: ix.scenario('«Hola mamá, se me ha roto el móvil y este es mi número nuevo. Necesito que me hagas un Bizum de 300 € ahora mismo, te lo explico luego».', '¿Qué haces?', [['Hago el Bizum: es mi hijo y está apurado.', false, 'La urgencia emocional y el número nuevo son justo el patrón.'], ['Llamo a mi hijo a su número de siempre antes de enviar nada.', true, 'Verificar por el canal de siempre desmonta el engaño.'], ['Le respondo preguntando quién es.', false, 'Mejor no entrar en su juego: llama al número de siempre.'], ['Le envío la mitad, por si acaso.', false, 'Cualquier cantidad alimenta el fraude.']], fbk('¡Bien!', 'Piensa en quién controla el canal.', 'Número nuevo, urgencia, secreto y dinero: llama tú al número de siempre antes de enviar nada.')) })
  .add({ title: 'Sextorsión: no tienen nada', obj: 0, text: 'Te llega un correo que dice: «Tengo vídeos íntimos tuyos. Paga 500 € en bitcoin en 48 horas o los publico». Es **sextorsión**, un chantaje con vídeos que **no existen**.\n\n- **No pagues** y **no respondas**: confirmarías que tu cuenta está activa.\n- Bloquea y borra el correo.\n- Si ya pagaste, guarda pruebas, denuncia y llama al 017 de INCIBE.\n\n::: tip\nApela a un miedo muy humano: el de quedar mal. Reconocerlo le quita el poder.\n:::' })
  .add({ title: '¿Pago o no pago?', obj: 0, text: 'Un último vistazo a la sextorsión.', ix: ix.tf('Si un correo dice que tienen vídeos íntimos tuyos y pide dinero en bitcoin, lo más seguro es pagar rápido para que no los publiquen.', false, fbk('¡Exacto!', 'No: pagar no te protege.', 'No tienen ningún vídeo. No se paga ni se responde: se bloquea y se borra. Si ya pagaste, denuncia y llama al 017.')) })
  .add({ title: '¿Legítimo o fraude?', obj: 1, text: 'Ocho mensajes de ejemplo, todos inventados. Desliza la tarjeta o toca los botones.', ix: ix.html({ ...swipe, est_seconds: 300, prompt: '' }) })
  .add({ type: 'summary', title: 'En resumen: SMS, WhatsApp y QR', text: 'Un SMS inesperado con prisa se comprueba en la web o app oficial, nunca en el enlace.\n\nEl **código de 6 cifras** de WhatsApp no se da a nadie. Y un **QR** inesperado no se escanea sin mirar antes a dónde lleva.' })

// ───────────────────────────── Lección 4 ─────────────────────────────
const l4 = c.unit('Lección 4. Llamadas y falsos «soporte técnico»', 'Cuándo una llamada es un fraude (vishing), cómo cortarla y qué hacer después.')
l4.add({ type: 'cover', title: 'Llamadas y falsos «soporte técnico»', text: 'Lección 4' })
  .add({ title: 'Vishing: la voz amable', obj: 2, img: IMG('llamada', 'Un móvil recibe la llamada de un falso soporte técnico que pide instalar una aplicación remota'), text: 'El **vishing** es el phishing por **llamada**. INCIBE lista pretextos como un concurso o lotería, una tarjeta regalo, un premio o el soporte técnico. También se hacen pasar por un banco.\n\nEl falso «soporte técnico» te llama sin que lo pidas, te asusta con un virus y te pide instalar una **aplicación de control remoto**.\n\n::: tip\nUn banco o la Administración no te pide claves por teléfono. **Cuelga** y llama tú al número oficial.\n:::' })
  .add({ title: 'La llamada de «Microsoft»', obj: 2, text: 'Estás en mantenimiento y te suena el móvil. Elige qué haces; prueba también las otras opciones.', ix: ix.html({ ...chatLlamada, est_seconds: 300, prompt: '' }) })
  .add({ title: 'Una llamada falsa, paso a paso', obj: 2, text: 'Así suele desarrollarse una llamada de falso soporte técnico.', ix: ix.timeline([
    ['1', 'Te llaman sin que lo pidas', 'Una voz amable, un número que parece de tu ciudad y un nombre conocido: «Microsoft», «su banco», «el soporte».'],
    ['2', 'Te asustan', 'Te dicen que tu ordenador está infectado o que hay un cargo raro. Lo que buscan es el miedo, para que pienses poco.'],
    ['3', 'Te ofrecen la solución', 'Te piden instalar una aplicación de control remoto o que les dictes una clave que te acaba de llegar.'],
    ['4', 'Te meten prisa', '«Si no lo hacemos hoy, se bloqueará el equipo». La prisa impide que verifiques.'],
    ['5', 'Tú cortas', 'Cuelgas, no das nada y llamas tú al número oficial. Después, avisas a tu responsable.'],
  ]) })
  .add({ title: 'El banco te llama', obj: 2, text: 'Estás en administración.', ix: ix.scenario('Suena el teléfono. «Buenos días, llamo de su banco. Hemos detectado un cargo raro. Para anularlo, dígame la clave que le acaba de llegar por SMS.»', '¿Qué haces?', [
    ['Le digo la clave: es para anular el cargo.', false, 'Esa clave es justo lo que necesitan para hacer el cargo ellos.'],
    ['Cuelgo y llamo yo al teléfono oficial de mi banco.', true, 'El teléfono que figura en tu tarjeta o en tu contrato es el canal seguro.'],
    ['Le digo solo las dos primeras cifras.', false, 'Ni una cifra: poco a poco te sacan el resto.'],
    ['Le pido que me llame luego, cuando tenga tiempo.', false, 'Seguirías en su canal: lo que tienes que hacer es colgar y llamar tú.'],
  ], fbk('¡Correcto!', 'Esa no es. Un banco no pide claves por teléfono.', 'Un banco o la Administración no te pide claves por teléfono. Cuelga y llama tú al número oficial.')) })
  .add({ title: 'Si te llaman y dudas', obj: 2, text: 'Tienes una llamada rara en la línea. Ordena los pasos.', ix: ix.sort('Ordena lo que haces ante una llamada sospechosa.', ['Mantén la calma: no des datos, códigos ni instales nada', 'Cuelga la llamada', 'Si dudas, llama tú al número oficial de la entidad', 'Avisa a tu responsable o a TIC'], fbk('¡En orden!', 'Revisa el orden: primero cortas, luego verificas y avisas.', 'Primero no entregas nada y cuelgas; después verificas llamando tú a un número oficial y, por último, avisas para que otros compañeros estén alerta.')) })
  .add({ title: 'Presupuesto con archivo .zip', obj: 1, text: 'Estás en mantenimiento.', ix: ix.scenario('Te llega un correo de un «proveedor» con el asunto «Presupuesto de la reforma» y un archivo Presupuesto.zip. Esperabas un presupuesto, pero la dirección del remitente no te suena.', '¿Qué haces?', [
    ['Abro el .zip: seguro que es el presupuesto.', false, 'Un comprimido de una dirección que no conoces es de riesgo, aunque coincida con lo que esperabas.'],
    ['No abro el archivo y llamo al proveedor a su teléfono de siempre para preguntar si lo ha enviado; aviso a TIC.', true, 'Verificar por otro canal conocido antes de abrir nada es la clave.'],
    ['Respondo al correo para pedir que lo reenvíen en PDF.', false, 'Responderías al posible estafador.'],
    ['Lo reenvío a mi responsable para que lo abra él.', false, 'Estarías pasando el riesgo a otra persona.'],
  ], fbk('¡Muy bien!', 'Piensa: ¿has verificado quién lo envía?', 'Que coincida con algo que esperabas es justo lo que hace creíble el engaño. Un .zip de una dirección desconocida no se abre sin verificar.')) })
  .add({ type: 'summary', title: 'En resumen: las llamadas', text: 'Una llamada **que no has pedido**, con miedo, prisa y petición de códigos o de instalar algo, es un fraude.\n\n**Cuelga**, llama tú al número oficial y avisa a tu responsable.' })

// ───────────────────────────── Lección 5 ─────────────────────────────
const l5 = c.unit('Lección 5. Fraudes que van contra el centro', 'El fraude del jefe, el cambio de IBAN y las familias que piden datos: siempre se verifica por otro canal.')
l5.add({ type: 'cover', title: 'Fraudes que van contra el centro', text: 'Lección 5' })
  .add({ title: 'El fraude del jefe', obj: 3, img: IMG('ceo', 'Correo falso de la directora desde una cuenta personal que pide una transferencia urgente y secreta'), text: 'En el **fraude del CEO** (o «del jefe»), un correo de la dirección pide una transferencia **urgente y confidencial**: «estoy en una reunión, no puedo hablar». Es un patrón que describe INCIBE.\n\nHay variantes: tarjetas regalo, falsas incorporaciones, incluso voz o vídeo falsos (deepfake).\n\n::: important\nSolo hay una respuesta: **verificar por otro canal**, llamando a un teléfono que ya tengas.\n:::' })
  .add({ title: 'Correo de la directora', obj: 3, text: 'Eres de administración.', ix: ix.scenario('Recibes este correo: «Marta, estoy en una reunión y no puedo hablar. Necesito que hagas una transferencia de 4.800 € ahora mismo a un proveedor. Es confidencial, no lo comentes con nadie. Te paso el IBAN por aquí.» Viene de direccion.residencia@gmail.com.', '¿Qué haces?', [
    ['Hago la transferencia: es la directora y es urgente.', false, 'La urgencia y el secreto son justo el patrón del fraude del jefe.'],
    ['Respondo al correo para preguntar si es ella.', false, 'Responderías al propio estafador. Hay que cambiar de canal.'],
    ['Llamo a la directora a su teléfono de siempre y aviso según el procedimiento de pagos.', true, 'Verificar por otro canal conocido y respetar el procedimiento de pagos es lo correcto.'],
    ['Le pido que me lo confirme por WhatsApp.', false, 'Otro canal que controla quien escribe, no uno que ya conocías.'],
  ], fbk('¡Muy bien!', 'Piensa: ¿quién controla el canal por el que verificas?', 'Cuenta personal + «no puedo hablar» + urgencia + secreto + salto del procedimiento de pagos. Se verifica por teléfono, con un número conocido.')) })
  .add({ title: 'La factura que cambió de cuenta', obj: 3, img: IMG('iban', 'Cuatro pasos del fraude del cambio de cuenta bancaria del proveedor'), text: 'Un correo con un PDF pide cambiar la cuenta bancaria de un proveedor. Se actualiza el dato, se paga… y el proveedor real nunca cobra. Es un caso real recogido por INCIBE.\n- Verifica llamando a un **teléfono ya conocido** del proveedor.\n- Comprueba la dirección **letra a letra**.\n- **Doble control**: dos personas autorizan los cambios de IBAN y los pagos importantes.\n\n::: tip\nSi ya has pagado: **llama al banco ya**, denuncia y consulta al 017.\n:::' })
  .add({ title: '¿Esto verifica o no?', obj: 3, text: 'Un proveedor te pide cambiar su IBAN. Clasifica cada reacción.', ix: ix.classify('¿Estas acciones verifican bien el cambio de IBAN?', [['ok', 'Verifica bien'], ['no', 'No sirve']], [
    ['Llamar al proveedor a un teléfono que ya tenías', 'ok'], ['Responder al propio correo preguntando si es cierto', 'no'],
    ['Que un segundo responsable valide el cambio', 'ok'], ['Fiarme porque el correo trae logo y firma', 'no'],
    ['Comprobar la dirección del remitente letra a letra', 'ok'], ['Pagar esta vez y mirarlo luego', 'no'],
  ], fbk('¡Perfecto!', 'Alguna reacción está en el grupo equivocado.', 'Verifica de verdad lo que usa un canal distinto y conocido (teléfono de siempre, segundo responsable). Responder al mismo correo o fiarse del logo no sirve: lo controla quien te engaña.')) })
  .add({ title: 'La «hija» pide la analítica', obj: 2, text: 'Estás en enfermería. Un WhatsApp de alguien que dice ser familiar. (Es un caso de ejemplo, no un aviso oficial.)', ix: ix.html({ ...chatFamilia, est_seconds: 300, prompt: '' }) })
  .add({ title: 'Resultados que llegan por correo', obj: 1, text: 'Un correo con un adjunto clínico.', ix: ix.scenario('Enfermería recibe un correo de «Laboratorio Clínico Regional» (resultados@lab-clinico-resultados.com): «Adjuntamos los resultados de la analítica del residente J.M.G. Para visualizarlos, habilite el contenido del documento adjunto». El archivo es Resultados.docm. No esperabas ninguna analítica.', '¿Qué haces?', [
    ['Abro el documento y habilito el contenido para verlo.', false, 'Habilitar contenido en un .docm es lo que activa las macros maliciosas.'],
    ['No abro nada; aviso a TIC o a mi responsable y compruebo con el laboratorio por su teléfono habitual.', true, 'Un adjunto inesperado con extensión de riesgo se verifica por otro canal antes de tocarlo.'],
    ['Lo reenvío a mis compañeras para que lo miren.', false, 'Estarías repartiendo el riesgo.'],
    ['Respondo pidiendo la contraseña que menciona.', false, 'Responder al estafador no verifica nada.'],
  ], fbk('¡Correcto!', 'Fíjate en el adjunto y en quién lo envía.', 'Dominio no corporativo, adjunto .docm con «habilitar contenido», resultados que no esperabas y el dato de un residente en el asunto para parecer real: cuatro señales.')) })
  .add({ title: 'Cuando suplantan a la dirección', obj: 3, text: 'Eres director/a del centro.', ix: ix.scenario('Una administrativa te cuenta que ha recibido un correo con tu nombre pidiéndole una transferencia urgente. No la ha hecho: ha dudado y te lo ha dicho.', '¿Qué haces?', [
    ['La regaño por haber perdido tiempo en dudar.', false, 'Castigar el aviso hace que la próxima vez no avise.'],
    ['Le doy las gracias, aviso a todo el equipo de cómo se piden los pagos y refuerzo el doble control.', true, 'Agradecer, avisar al equipo y reforzar el procedimiento de pagos con doble control.'],
    ['Lo ignoro: como no ha pagado, no ha pasado nada.', false, 'Otro compañero podría recibir el mismo correo y caer.'],
    ['Le pido que haga el pago por si acaso era real.', false, 'Si es real, se confirma llamando a tu número de siempre.'],
  ], fbk('¡Muy bien!', 'Piensa en cómo reaccionará la próxima persona que dude.', 'Desde dirección se protege al centro dejando claro el procedimiento de pagos, el doble control y que avisar de una duda siempre es bien recibido.')) })
  .add({ title: 'Tu procedimiento de pagos', obj: 3, text: 'Un momento para pensar en tu centro.', ix: ix.casep('¿Cómo se autorizan hoy los pagos y los cambios de IBAN en tu centro? ¿Hay doble control? ¿Qué cambiarías para que un correo falso no pudiera colar una transferencia?', ['Sé quién autoriza los pagos y los cambios de IBAN en mi centro', 'Sé qué número llamaría para verificar un cambio de cuenta', 'Tengo claro qué propondría para reforzar el doble control'], { explanation: 'Un buen procedimiento no depende de que alguien detecte el engaño: exige verificación por otro canal conocido y la firma de una segunda persona a partir de cierto importe.' }) })
  .add({ title: 'Un compañero que ha pulsado', obj: 4, text: 'Eres supervisor/a.', ix: ix.scenario('Una gerocultora te dice, nerviosa: «Creo que he pulsado el enlace de un correo raro y he puesto mi contraseña. Por favor, no se lo digas a nadie».', '¿Qué haces?', [
    ['Le digo que no pasa nada y lo dejamos así.', false, 'Sí pasa: sin aviso, nadie puede proteger sus cuentas ni las del centro.'],
    ['Le agradezco que me lo cuente, aviso ya a TIC o a dirección y le ayudo a cambiar la contraseña.', true, 'Ayudar sin culpar y avisar pronto es lo que más limita el daño.'],
    ['La regaño: tendría que haber tenido más cuidado.', false, 'Si la regañas, la próxima vez callará, y lo grave es callar.'],
    ['Esperamos unos días a ver si hay consecuencias.', false, 'La rapidez es lo que más ayuda; esperar solo da ventaja al estafador.'],
  ], fbk('¡Muy bien!', 'Piensa en la próxima vez que alguien tenga que contarte algo así.', 'Equivocarse es humano; lo grave es no avisar. Agradecer el aviso, actuar rápido y ayudar a limitar el daño crea el clima en el que la gente avisa.')) })
  .add({ type: 'summary', title: 'En resumen: fraudes al centro', text: 'Dinero, IBAN y datos de residentes se verifican **por otro canal**, llamando a un número que ya tengas.\n\n**Doble control** en los pagos, y los datos de salud no se dan por WhatsApp a quien no puedas identificar.' })

// ───────────────────────────── Lección 6 ─────────────────────────────
const l6 = c.unit('Lección 6. Si has picado y repaso final', 'Qué hacer si ya has pulsado o dado datos, a quién pedir ayuda, y repaso con flashcards, crucigrama y compromiso.')
l6.add({ type: 'cover', title: 'Si has picado, y repaso final', text: 'Lección 6' })
  .add({ title: 'He picado: ¿qué hago?', obj: 4, text: 'No es el fin del mundo: es cuestión de **rapidez**. Elige qué ha pasado y verás qué hacer.', ix: ix.html({ ...triage, est_seconds: 300, prompt: '' }) })
  .add({ title: 'El orden de la respuesta', obj: 4, text: 'Has pulsado un enlace, has escrito tu contraseña y no hubo dinero de por medio.', ix: ix.sort('Ordena lo que haces ahora.', ['Avisa de inmediato a tu responsable o a TIC', 'Cambia la contraseña desde un dispositivo fiable', 'Guarda capturas del mensaje y del enlace', 'Si hay daño, denuncia y consulta al 017'], fbk('¡En orden!', 'Piensa qué es lo más urgente.', 'Lo primero es avisar: cuanto antes lo sepan, antes pueden actuar. Después limitas el daño (contraseña), guardas pruebas y, si hay daño, denuncias y pides ayuda.')) })
  .add({ type: 'video', title: 'Dónde pedir ayuda', obj: 4, video: { id: 'ffAxyd7ASMk', caption: 'Línea 017 de INCIBE – Tu ayuda en ciberseguridad para empresas', transcript: 'Vídeo de INCIBE que presenta la Línea 017 como ayuda gratuita y confidencial en ciberseguridad para empresas.' }, notes: ['Verificar la transcripción viendo el vídeo (ffAxyd7ASMk) y comprobar que dura menos de 5 min. Confirmar el horario vigente del 017 en la web de INCIBE antes de publicarlo (no se cita aquí).'], text: '**INCIBE 017**: teléfono 017, WhatsApp 900 116 117 y Telegram @INCIBE017. Gratuito y confidencial.\n\nPuedes enviar una captura o un enlace sin abrir nada con el formulario de reporte de fraude de INCIBE.\n\nSi hubo dinero: **primero tu banco**. Después, denuncia en la Policía Nacional o la Guardia Civil.' })
  .add({ title: '¿Mito o verdad?', obj: 1, text: 'Antes del repaso final, separa los mitos de las verdades.', ix: ix.classify('Clasifica cada afirmación.', [['ver', 'Verdad'], ['mit', 'Mito']], [
    ['El candado del navegador garantiza que la web es la real', 'mit'], ['Un adjunto inesperado de un conocido también puede ser peligroso', 'ver'],
    ['Si el remitente se llama como mi jefa, es ella', 'mit'], ['Un QR pegado sobre otro puede llevar a una web falsa', 'ver'],
    ['Responder «STOP» a un SMS fraudulento es seguro', 'mit'], ['Un banco no te pide claves por teléfono', 'ver'],
    ['Solo los ordenadores se infectan: el móvil no', 'mit'], ['Avisar pronto de un error ayuda más que callarlo', 'ver'],
  ], fbk('¡Mitos fuera!', 'Alguna afirmación está en el grupo contrario.', 'El candado no basta, el nombre lo escribe cualquiera, responder confirma que tu número está activo y los móviles también se infectan. Y avisar pronto es siempre lo mejor.')) })
  .add({ title: 'Repaso relámpago', obj: 0, text: 'Da la vuelta a cada tarjeta y responde antes de verla.', ix: ix.flash([
    ['¿Qué haces primero con un mensaje raro?', '**PARA**: no pulses ni respondas.'],
    ['¿En qué te fijas?', '**MIRA**: remitente, prisa, enlace, adjunto y qué te piden.'],
    ['¿Cómo compruebas que es real?', '**VERIFICA** por otro canal: llama al número de siempre.'],
    ['¿A quién cuentas lo que ha pasado?', '**AVISA** a tu responsable y, si hace falta, al 017.'],
    ['¿Quién te pide un código de verificación?', 'Nadie legítimo: el código **no se da a nadie**.'],
    ['¿Garantiza el candado que la web es real?', '**No**: mira siempre el dominio.'],
    ['¿Qué haces con un cambio de IBAN por correo?', 'Llamas a un teléfono **ya conocido** y lo valida un segundo responsable.'],
    ['¿Qué haces si has picado?', 'Avisar pronto y sin vergüenza: lo grave es **callar**.'],
  ]) })
  .add({ title: 'Crucigrama del anzuelo', obj: 1, text: 'Un último reto para repasar el vocabulario del curso.', ix: ix.crossword([
    ['ANZUELO', 'Lo que no debes picar'], ['REMITENTE', 'Quien envía el correo: mira su dirección'], ['ENLACE', 'No lo pulses sin comprobar a dónde lleva'],
    ['ADJUNTO', 'Archivo que viaja en un correo'], ['CODIGO', 'Lo de 6 cifras de WhatsApp: no se da a nadie'], ['VERIFICA', 'Lo que haces por otro canal'],
    ['PRISA', 'La urgencia sirve para que no pienses'], ['VISHING', 'Engaño por llamada'], ['SMISHING', 'Engaño por SMS'],
  ]) })
  .add({ title: 'Mi compromiso', obj: 4, text: 'Para cerrar, un compromiso contigo.', ix: ix.html({ ...pledge, est_seconds: 75, prompt: '' }) })
  .add({ type: 'summary', title: 'Tú eres la mejor defensa', img: IMG('pasos', 'Las cuatro tarjetas: Para, Mira, Verifica, Avisa'), text: 'Los estafadores no fuerzan la puerta: te piden que la abras. Tú puedes no hacerlo.\n\n**Para. Mira. Verifica. Avisa.** Ante la duda, pregunta; y si picas, avisa sin vergüenza.\n\nAhora toca el test final.' })

// ───────────────────────────── Glosario y bibliografía ─────────────────────────────
c.glossary('Ingeniería social', 'Manipular a las personas para que hagan algo que no deberían, como dar una contraseña o pulsar un enlace.')
  .glossary('Phishing', 'Mensaje falso, normalmente un correo, que aparenta venir de alguien de confianza para robar datos o infectar un equipo.')
  .glossary('Smishing', 'Phishing por SMS o mensajería: «SMS + phishing».')
  .glossary('Vishing', 'Phishing por llamada telefónica: se hacen pasar por un banco, un técnico u otra entidad.')
  .glossary('Quishing', 'Phishing mediante códigos QR, por ejemplo en un correo o en una pegatina sobre otro QR.')
  .glossary('Remitente', 'La persona o cuenta que envía un mensaje. Lo que cuenta es su dirección, no el nombre que muestra.')
  .glossary('Dominio', 'La parte de una dirección web o de correo que identifica a su dueño: lo que va justo antes de la primera barra «/» en un enlace, o tras la «@» en un correo.')
  .glossary('Suplantación', 'Hacerse pasar por otra persona o entidad: la directora, un proveedor, un banco…')
  .glossary('Fraude del CEO', 'Correo en el que un «jefe» pide una transferencia urgente y confidencial; suele venir de una cuenta suplantada o comprometida.')
  .glossary('Verificación en dos pasos', 'Medida que añade un segundo paso (como un PIN) para entrar en una cuenta, además del código de verificación.')
  .glossary('Enlace acortado', 'Dirección corta (por ejemplo bit.ly) que esconde a dónde lleva realmente.')
  .glossary('Sextorsión', 'Chantaje con «vídeos íntimos» que no existen, para que pagues. No se paga ni se responde.')
  .glossary('Línea 017', 'Servicio gratuito y confidencial de INCIBE de ayuda en ciberseguridad (teléfono 017, WhatsApp 900 116 117, Telegram @INCIBE017).')

c.bib('INCIBE (2026). INCIBE detectó más de 122.000 incidentes de ciberseguridad en 2025. Sala de prensa de INCIBE.', 'https://www.incibe.es/incibe/sala-de-prensa/incibe-detecto-mas-de-122000-incidentes-de-ciberseguridad-en-2025')
  .bib('INCIBE (2019). Día Mundial del Correo: cómo detectar correos fraudulentos. Blog de INCIBE para empresas.', 'https://www.incibe.es/empresas/blog/dia-mundial-del-correo-detectar-correos-fraudulentos')
  .bib('INCIBE (2019). Ingeniería social: técnicas utilizadas por los ciberdelincuentes y cómo protegerse. Blog de INCIBE para empresas.', 'https://www.incibe.es/empresas/blog/ingenieria-social-tecnicas-utilizadas-los-ciberdelincuentes-y-protegerse')
  .bib('INCIBE (2025). Fraude del CEO: el engaño que puede vaciar la cuenta de tu pyme. Blog de INCIBE para empresas.', 'https://www.incibe.es/empresas/blog/fraude-del-ceo-el-engano-que-puede-vaciar-la-cuenta-de-tu-pyme')
  .bib('INCIBE. Historias reales: suplantaron a mi proveedor y mi empresa estafaron. Blog de INCIBE para empresas.', 'https://www.incibe.es/empresas/blog/historias-reales-suplantaron-mi-proveedor-y-mi-empresa-estafaron')
  .bib('INCIBE (2023). Cómo detectar mensajes fraudulentos que suplantan servicios de mensajería. Blog de INCIBE para la ciudadanía.', 'https://www.incibe.es/ciudadania/blog/como-detectar-mensajes-fraudulentos-que-suplantan-servicios-de-mensajeria')
  .bib('INCIBE (2023). Nueva campaña de phishing utilizando códigos QR. Avisos de INCIBE para empresas.', 'https://www.incibe.es/empresas/avisos/nueva-campana-de-phishing-utilizando-codigos-qr')
  .bib('INCIBE (2024). Nueva variante del robo de cuenta de WhatsApp suplantando al soporte técnico. Casos reales de la Línea de Ayuda en Ciberseguridad.', 'https://www.incibe.es/linea-de-ayuda-en-ciberseguridad/casos-reales/nueva-variante-del-robo-de-cuenta-de-whatsapp-suplantando-al-soporte-tecnico')
  .bib('INCIBE (2020). Intento de fraude a través de llamadas telefónicas (vishing). Avisos de INCIBE para la ciudadanía.', 'https://www.incibe.es/ciudadania/avisos/intento-de-fraude-traves-de-llamadas-telefonicas-vishing')
  .bib('INCIBE. Conoce a fondo el phishing. Protege tu empresa, INCIBE.', 'https://www.incibe.es/incibe/protegete-conoce-a-fondo-phishing')

// ───────────────────────────── Test final ─────────────────────────────
c.finalTest('Test final', [
  ['Recibes un correo de «Mutua Salud Laboral» desde avisos@mutua-saludlaboral-gestion.com: pide actualizar tu DNI en 24 horas. ¿Qué haces?', [['Pulso el enlace y lo hago rápido, para no perder la baja.', false], ['No pulso; llamo yo a la mutua por su teléfono oficial y aviso a mi responsable.', true], ['Respondo con mi DNI.', false], ['Lo reenvío a mis compañeras por si les ha llegado.', false]], 'Pedir datos con prisa y desde un dominio dudoso son señales de alarma. Se verifica por otro canal: llamando tú a un teléfono oficial.', 1],
  ['Un mensaje te mete prisa, te asusta con perder algo y te pide que no se lo cuentes a nadie. ¿Qué indica?', [['Que es un mensaje importante y hay que atenderlo ya.', false], ['Que ya hay señales de alarma: prisa, miedo y secreto son los trucos del estafador.', true], ['Que viene de dirección.', false]], 'La prisa, el miedo y el secreto buscan que no tengas tiempo de pensar. Es el momento de parar y verificar.', 0],
  ['Administración recibe de un proveedor un correo con nuevos datos bancarios. Lo correcto es:', [['Cambiar el IBAN para no retrasar los pagos.', false], ['Responder al correo para confirmar el cambio.', false], ['Llamar al proveedor a un teléfono ya conocido y que otra persona valide el cambio.', true], ['Pedirle que lo mande también por WhatsApp.', false]], 'Se verifica por otro canal conocido y con doble control. Responder al mismo correo no sirve: puede ser del estafador.', 3],
  ['«La directora» escribe desde una cuenta de gmail y pide una transferencia urgente y secreta. Es:', [['Normal, si es la directora.', false], ['Un fallo informático.', false], ['El patrón del fraude del jefe: urgencia, confidencialidad y canal inusual.', true], ['Un error del banco.', false]], 'Frases como «estoy en una reunión y no puedo hablar» o «es confidencial» son típicas del fraude del CEO.', 3],
  ['En el móvil te llega un SMS: «Su paquete está retenido, pague 1,29 €». No esperabas nada. Haces:', [['Pago: es poco dinero.', false], ['Compruebo en la web o app oficial de la empresa, no en el enlace; si no hay envío, borro y bloqueo.', true], ['Respondo «STOP».', false], ['Lo reenvío a un grupo de compañeras.', false]], 'Se verifica en el canal oficial y se desconfía de la urgencia. Responder confirma que tu número está activo.', 1],
  ['Una llamada de «Microsoft» te pide instalar una aplicación de control remoto para arreglar el equipo. Lo correcto:', [['Instalarla: es de Microsoft.', false], ['Darle solo el código que aparece.', false], ['Colgar, no instalar nada y avisar al responsable de TIC.', true], ['Pedirle un número de teléfono personal.', false]], 'Es vishing: una llamada no solicitada, con miedo y prisa. No se instala nada ni se da ningún código.', 2],
  ['Una «compañera» te escribe desde un número desconocido: «he cambiado de móvil, ¿me pasas el código que te llegue por SMS?». Si lo das:', [['No pasa nada.', false], ['Se borra el chat.', false], ['Pueden robarte tu cuenta de WhatsApp.', true], ['Solo verán tu foto.', false]], 'El código de 6 cifras es la llave de tu cuenta. No se da a nadie y conviene activar la verificación en dos pasos.', 2],
  ['Alguien dice ser familiar de un residente y te pide por WhatsApp su analítica. Tú:', [['Se la envío: está preocupado.', false], ['Le envío solo el diagnóstico.', false], ['No facilito datos; sigo el protocolo del centro y aviso a enfermería o dirección.', true], ['Le pido el DNI por WhatsApp y se la envío.', false]], 'Los datos de salud son especialmente sensibles y no se dan a quien no se ha podido identificar. El centro decide el canal.', 2],
  ['Has pulsado un enlace raro y has escrito tu contraseña. Lo primero:', [['No decir nada: a lo mejor no pasa nada.', false], ['Avisar al responsable, cambiar la contraseña (y las que fueran iguales) y guardar pruebas.', true], ['Apagar el móvil y olvidarlo.', false], ['Borrar el correo y ya.', false]], 'Avisar pronto es lo que más ayuda. Cambiar contraseñas y guardar capturas limita el daño y sirve para la denuncia.', 4],
  ['¿Cuál de estas afirmaciones es FALSA?', [['Un SMS puede ser un intento de estafa.', false], ['Un QR pegado sobre otro puede llevarte a una web falsa.', false], ['El candado del navegador garantiza que la web es la real.', true], ['Un banco no te pide claves por teléfono.', false]], 'El «https» y el candado también se pueden manipular. Hay que mirar el dominio.', 1],
  ['Un compañero te dice: «creo que he abierto algo raro». Lo mejor:', [['Reñirle por haber picado.', false], ['Decirle que avise ya al responsable y desconecte el equipo según el protocolo.', true], ['Esperar a mañana a ver qué pasa.', false], ['Reenviar el correo al grupo para avisar.', false]], 'La rapidez limita el daño y una cultura de avisar sin culpar hace que la gente avise.', 4],
  ['¿Dónde puedes pedir ayuda gratuita y confidencial si dudas de un mensaje?', [['En un foro de internet.', false], ['A quien te ha llamado.', false], ['En la línea 017 de INCIBE (teléfono, WhatsApp 900 116 117 o Telegram @INCIBE017).', true]], 'La línea 017 de INCIBE es un servicio gratuito y confidencial de ayuda en ciberseguridad.', 4],
])

await c.build()
