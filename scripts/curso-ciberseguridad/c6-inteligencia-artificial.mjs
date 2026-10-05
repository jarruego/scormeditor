/**
 * Curso 6 · «Inteligencia artificial: nuevas amenazas y uso seguro»
 * Programa de ciberseguridad para centros sociosanitarios (MECOHISA).
 *
 *   node scripts/curso-ciberseguridad/run.mjs c6-inteligencia-artificial.mjs
 *
 * Fuente única de datos: docs/curso-ciberseguridad/fuentes/06-inteligencia-artificial.md
 * (se respetan sus marcas [V]/[V-sec]; lo no verificado se presenta con cautela o se omite).
 */
import { CourseBuilder, ix, fbk } from './lib.mjs'
import * as W from './widgets.mjs'
import * as W6 from './c6-widgets.mjs'
import * as I from './c6-illustrations.mjs'

const OBJ = [
  'Explicar con palabras sencillas qué es la IA generativa y por qué puede equivocarse',
  'Reconocer las estafas que usan IA: mensajes perfectos, voz clonada y deepfakes',
  'Aplicar las defensas básicas: parar, verificar por otro canal, palabra clave y doble confirmación',
  'Decidir qué datos no se comparten nunca con una IA pública y cómo anonimizar',
  'Revisar lo que genera la IA y saber a quién acudir y qué marco la regula, de forma orientativa',
]

const c = new CourseBuilder({
  id: 'cibersegsoc-c6-ia', identifier: 'CIBERSEG_C6',
  title: 'Inteligencia artificial: nuevas amenazas y uso seguro',
  subtitle: 'Voces clonadas, vídeos falsos y qué no pegar nunca en una IA',
  description: 'Curso breve y práctico para el personal de centros sociosanitarios: qué es la IA generativa, cómo la usan los estafadores (mensajes perfectos, voz clonada, deepfakes), cómo defenderte con hábitos sencillos y cómo usar la IA en el trabajo sin dar datos de residentes ni del centro.',
  hours: 1.7, primary: '#7a3fd1', accent: '#6DC3C0',
  moduleTitle: 'La IA en tu día a día: riesgos y buenas prácticas',
  objectives: OBJ,
})

// ---------- Ilustraciones ----------
const A = (n, svgStr) => c.asset(`assets/img/c6_${n}.svg`, svgStr)
const IMG = {
  portada: A('portada', I.portada), l1: A('l1_ia', I.l1), pred: A('predictivo', I.predictivo), correo: A('correo_perfecto', I.correo),
  voz: A('voz_clonada', I.voz), l2: A('l2_estafas', I.l2), video: A('videollamada_falsa', I.videollamada), l3: A('l3_deepfake', I.l3),
  l4: A('l4_defensas', I.l4), ppv: A('parar_pensar_verificar', I.ppv), nube: A('nube_datos', I.nube), sem: A('semaforo_datos', I.semaforo), l6: A('l6_marco', I.l6),
}
const im = (src, alt, extra = {}) => ({ src, alt, layout: 'top', full: true, ...extra })

// ---------- Portada ----------
c.intro({ type: 'cover', title: 'Inteligencia artificial: nuevas amenazas y uso seguro', text: '', img: im(IMG.portada, 'Un robot de inteligencia artificial que imita voces, caras y correos, con el lema: las mismas estafas de siempre, pero más creíbles') })

// =====================================================================
// LECCIÓN 1 · La IA, sin misterios
// =====================================================================
const l1 = c.unit('Lección 1. La IA, sin misterios', 'Qué es la IA generativa, por qué se equivoca con seguridad y qué tienes que vigilar tú según tu puesto.')
l1.add({ type: 'cover', title: 'La IA, sin misterios', text: 'Lección 1', img: im(IMG.l1, 'Un robot amable que escribe, habla, dibuja, traduce, imita voces y a veces inventa cosas') })
 .add({ type: 'objectives', title: 'Lo que vas a conseguir', obj: 0, text: 'Este curso es corto, práctico y sin tecnicismos. Al terminar sabrás:\n\n- Qué es la IA generativa y por qué se equivoca con seguridad.\n- Cómo la usan los estafadores: mensajes perfectos, voces y vídeos falsos.\n- Qué hacer cuando algo te da mala espina.\n- Qué datos no se pegan nunca en una IA.\n- Cómo revisar lo que dice y a quién acudir.' })
 .add({
   title: 'Qué es la IA generativa', obj: 0,
   text: 'Una **IA generativa** es un programa que ha «leído» muchísimos textos, imágenes y audios, y con eso es capaz de **escribir, hablar o dibujar** algo nuevo cuando se lo pides.\n\nSeguro que ya la has usado sin darte cuenta. Toca cada ejemplo.',
   ix: ix.accordion([
     ['ChatGPT, Gemini y Copilot', 'Son asistentes a los que **les escribes** una pregunta y te contestan por escrito: un resumen, una carta, una idea para una actividad.'],
     ['El asistente de voz', 'Siri, Alexa o «Ok Google» entienden lo que dices y **te responden hablando**: ponen una alarma o buscan una receta.'],
     ['El corrector del móvil', 'Cuando el teclado te sugiere la siguiente palabra o te corrige una frase, está usando esta misma idea de predecir lo que viene después.'],
     ['Los filtros de las fotos', 'Los que te «rejuvenecen» o cambian la cara también funcionan con IA. La misma técnica, mal usada, sirve para falsificar caras.'],
     ['También te ayuda a defenderte', 'Los filtros de correo basura, los avisos de pagos extraños del banco o la traducción automática usan IA para protegerte o ahorrarte trabajo. Es una herramienta: su efecto depende de quién la use y cómo.'],
   ]),
 })
 .add({
   title: 'Un predictivo gigante', obj: 0,
   text: 'La IA es como el **predictivo de tu móvil, pero gigante**: elige la palabra que más suele venir detrás de la anterior.\n\n**No comprueba si lo que dice es verdad.** Por eso a veces se inventa datos, cifras o normas con total seguridad. A eso se le llama *alucinación*.',
   img: im(IMG.pred, 'Teclado de móvil que sugiere la palabra más probable tras «Buenos», con barras de más a menos probable'),
 })
 .add({
   title: 'Un predictivo gigante', obj: 0, text: 'Piensa en lo que acabas de ver.',
   ix: ix.tf('Si una IA responde con mucha seguridad y sin dudar, es que ha comprobado que lo que dice es verdad.', false,
     fbk('¡Exacto! Suena segura aunque se equivoque.', 'No: la IA elige lo más probable, no lo verdadero.', 'Una IA puede «alucinar»: inventar cifras, normas o nombres que suenan perfectos. Por eso siempre se revisa lo que dice.')),
 })
 .add({
   title: 'Elige tu puesto', obj: 2, text: 'Cada puesto tiene sus propios riesgos. Toca el tuyo y mira qué te toca vigilar.',
   ix: ix.tabs([
     ['Gerocultor/a', 'Eres quien más contacto tiene con **residentes y familias**.\n- Si una familia te cuenta una llamada rara, no le quites importancia: avisa a dirección.\n- Nunca pegues datos de un residente en una IA pública.\n- Si usas una IA para una duda, contrástala con el protocolo y con enfermería.'],
     ['Auxiliar y enfermería', '- Una pauta o una dosis **no se cambia por un audio**, aunque suene a la doctora: confirma por el canal habitual.\n- Los informes de salud no se pegan en una IA pública.\n- Lo que sugiera una IA es un borrador: lo valida una persona.'],
     ['Administración y dirección', '- Un **cambio de IBAN** o un pago nuevo se confirma llamando al número registrado y con una segunda persona.\n- Una videollamada con el «jefe» no autoriza ningún pago por sí sola.\n- Aclara qué herramientas de IA se pueden usar en el centro.'],
     ['Supervisión', '- Tienes que **dar ejemplo** y ser quien pregunta «¿lo has comprobado?».\n- Recoge los avisos del equipo sin reproches: avisar a tiempo es lo que más ayuda.\n- Asegúrate de que todos saben a quién llamar ante una duda.'],
     ['Mantenimiento', '- Un «asistente» o chat de un proveedor que te pide claves o acceso remoto: **verifica al proveedor** por un canal que ya conocías.\n- No des la clave del wifi ni accesos por una llamada o un chat.\n- Avisa a dirección si algo te parece raro.'],
   ]),
 })
 .add({
   title: 'Palabras que oirás', obj: 0, text: 'Estas palabras saldrán en el curso. Une cada una con su significado.',
   ix: ix.match('Une cada palabra con su significado.', [
     ['IA generativa', 'Programa que crea textos, voces o imágenes nuevas'],
     ['Alucinación', 'Cuando la IA se inventa algo con total seguridad'],
     ['Prompt', 'Lo que le escribes o dices a la IA'],
     ['Deepfake', 'Vídeo o audio falso que imita a una persona real'],
   ], fbk('¡Todas bien!', 'Revisa alguna pareja.', 'Con estas palabras ya puedes seguir el resto del curso.')),
 })
 .add({ type: 'summary', title: 'Lo que te llevas', text: 'La IA generativa **escribe, habla y dibuja**, pero no comprueba si lo que dice es verdad.\n\nTres ideas para recordar:\n- Suena segura aunque se equivoque.\n- Lo que le escribes viaja a una empresa externa.\n- Los delincuentes también la usan: el CCN-CERT señala que grupos criminales ya la integran en sus ataques.' })

// =====================================================================
// LECCIÓN 2 · Estafas con IA
// =====================================================================
const l2 = c.unit('Lección 2. Estafas con IA: voz clonada, mensajes perfectos y falsos familiares', 'Los mensajes ya no tienen faltas, las voces se copian con muy poco audio y por eso se verifica siempre por otro canal.')
const px = (x, y, w, h) => ({ x: +(x / 6.4).toFixed(1), y: +(y / 6.4).toFixed(1), w: +(w / 6.4).toFixed(1), h: +(h / 6.4).toFixed(1) })
l2.add({ type: 'cover', title: 'Estafas con IA', text: 'Lección 2', img: im(IMG.l2, 'Tres iconos: un correo, un micrófono y una cámara, las tres vías de engaño con IA') })
 .add({
   title: 'Mensajes sin una falta', obj: 1,
   text: 'Antes, muchos correos falsos se delataban por sus **faltas de ortografía**. Hoy la IA los escribe sin errores, en buen español, con tu nombre, tu cargo y detalles reales del centro.\n\n::: warn\nLa ortografía ya no sirve para detectar un fraude. Fíjate en la **urgencia**, en el **remitente real** y en **lo que te piden**: un clic, una clave, dinero o datos.\n:::',
 })
 .add({
   title: 'Otras formas de engañar', obj: 1, text: 'Además de correos y voces, la IA se usa de más maneras. Toca cada una.',
   ix: ix.accordion([
     ['Imágenes y documentos falsos', 'Fotos de facturas, DNI, recetas, justificantes de transferencia o de «familiares en el hospital» generados con IA. **Una imagen o un PDF ya no prueban nada por sí solos.**'],
     ['Chatbots y asistentes falsos', 'Páginas o aplicaciones que se hacen pasar por el «asistente de la residencia», del banco o de un proveedor y te piden datos. También extensiones «gratis» de IA que piden acceso a tu correo o a tus archivos. **Usa solo las herramientas que el centro te ha dado.**'],
     ['Desinformación y suplantación', 'Cadenas sobre medicación, audios «de un médico» o vídeos de personas conocidas «recomendando» productos. Antes de reenviar: ¿quién lo dice? ¿hay otra fuente seria?'],
     ['Textos escondidos que dan órdenes a la IA', 'Se llama *prompt injection*: un texto oculto en un documento o web que «ordena» a la IA que lo lee, por ejemplo, que envíe datos a otro sitio. **No le pidas a una IA que lea documentos o enlaces de origen desconocido** ni le des acceso a tu correo sin autorización.'],
     ['Familiares y residentes, objetivo', 'La llamada del «nieto» que necesita dinero, el falso «médico» que pide una transferencia para un tratamiento o el cobro de la mensualidad con un IBAN nuevo. **Si una familia te cuenta algo así, aplica el protocolo y avisa a dirección.**'],
   ]),
 })
 .add({
   title: 'Encuentra las señales', obj: 1,
   text: 'Este correo está perfectamente escrito, pero tiene señales de alarma. Algunas zonas parecen sospechosas y no lo son. Toca una zona.',
   ix: ix.hotspots(IMG.correo, 'Correo de la gerencia sin faltas de ortografía que pide cambiar la cuenta bancaria de un proveedor y pagar hoy en secreto', [
     { ...px(16, 16, 608, 84), label: 'Remitente del correo', correct: true, feedback: 'Bien visto: el remitente es «residencia-vlda», con una L en lugar de la I. Un correo casi igual al verdadero es una señal de alarma.' },
     { ...px(16, 100, 608, 80), label: 'Asunto urgente y confidencial', correct: true, feedback: '«Urgente y confidencial» es presión. La prisa y el secreto son las señales más fiables de un fraude.' },
     { ...px(16, 182, 608, 78), label: 'Saludo personalizado', correct: false, feedback: 'Que use tu nombre y datos reales del centro no lo hace legítimo: la IA los consigue con facilidad. Aquí no está la señal.' },
     { ...px(16, 262, 608, 88), label: 'Cuenta bancaria nueva', correct: true, feedback: 'Un cambio de cuenta (IBAN) por correo es el fraude más habitual. Se confirma siempre llamando al número registrado del proveedor.' },
     { ...px(16, 352, 608, 80), label: 'Hazlo hoy y no se lo cuentes a nadie', correct: true, feedback: 'Prisa y secreto juntos: la combinación clásica. Si te piden no contárselo a nadie, cuéntaselo a alguien.' },
     { ...px(16, 436, 608, 72), label: 'Botón de factura adjunta', correct: true, feedback: 'Un adjunto o enlace que no esperabas es otra señal. No lo abras sin comprobar antes por otro canal.' },
     { ...px(16, 512, 608, 108), label: 'Firma y logotipo', correct: false, feedback: 'Un logotipo y una firma se copian en segundos. Que se vea «oficial» no demuestra nada.' },
   ], 'Toca una señal de alarma de este correo.', fbk('¡Esa es una señal!', 'Esa zona no es la señal.', ''), { scored: true, instructions: 'Toca una zona de la imagen. Puedes probar varias.' }),
 })
 .add({
   title: 'Voz clonada', obj: 1,
   text: 'Con muy poco audio —un mensaje de voz, un vídeo en redes— se puede **imitar una voz**.\n\nEl INCIBE recogió el caso de una mujer que oyó a su marido decir: «No te puedo llamar, envíame un mensaje a este número». Ella llamó al número de siempre de su marido y comprobó que no había sido él.\n\nFue esa llamada de comprobación la que la salvó.',
   img: im(IMG.voz, 'Una voz real se copia con IA y llega a un móvil como llamada de un hijo que pide dinero'),
 })
 .add({
   title: 'Voz clonada', obj: 1, text: 'Ponte en el lugar de un familiar de una residente: ¿qué harías tú?',
   ix: ix.html({
     ...W.chatStory({
       contacto: { nombre: 'Mamá (número nuevo)', emoji: '🎙️', sub: 'audio de WhatsApp · número desconocido' }, estilo: 'chat',
       nodos: {
         n1: { msgs: [['sys', 'Eres Pablo. Tu madre vive en la residencia. Te llega un audio de un número que no tienes guardado.'], ['them', '🎙️ Audio 0:12\n«Pablo, hijo, me han cambiado de habitación y hay que pagar hoy una factura. Haz una transferencia a la cuenta que te mando. No me llames, que no puedo hablar.»']],
           choices: [
             { t: 'Pago ahora: es la voz de mi madre.', next: 'bad', q: 'bad', fb: 'La voz se puede copiar con muy poco audio. Oírla no demuestra nada.' },
             { t: 'Contesto al audio y le pregunto qué factura es.', next: 'n2', q: 'mid', fb: 'Hablar por el mismo canal es seguir en manos de quien envió el audio.' },
             { t: 'No contesto. Llamo yo a mi madre o a la residencia, al teléfono de siempre.', next: 'ok1', q: 'good', fb: 'Verificar por otro canal conocido es la defensa que recomienda el INCIBE.' },
           ] },
         n2: { msgs: [['them', '🎙️ Audio 0:08\n«Es urgente, hazlo ya. No hagas preguntas y no se lo digas a nadie.»'], ['sys', 'Prisa, secreto y dinero: las tres señales a la vez.']],
           choices: [
             { t: 'Hago el pago para no meterla en un lío.', next: 'bad', q: 'bad', fb: 'Cuanta más presión, más motivo para parar.' },
             { t: 'Paro y llamo a la residencia, al teléfono de siempre.', next: 'ok1', q: 'good', fb: 'Nunca es tarde para cortar y verificar.' },
           ] },
         bad: { msgs: [['sys', 'Transfieres el dinero. Poco después hablas con tu madre: no sabía nada.']], fin: { tipo: 'bad', titulo: 'Era una voz clonada', texto: 'Si ocurre, avisa ya a tu banco para intentar frenar el pago, cuéntalo a la residencia y pide ayuda al 017 de INCIBE. Equivocarse le pasa a cualquiera; lo importante es avisar pronto.' } },
         ok1: { msgs: [['sys', 'Llamas a la residencia. La gerocultora te dice que tu madre está en su habitación, tranquila, y que nadie ha pedido ningún pago.']],
           choices: [
             { t: 'Aviso a la residencia del intento y acordamos una palabra clave familiar.', next: 'fin_good', q: 'good', fb: 'Avisar protege a otras familias; la palabra clave será tu comprobación rápida.' },
             { t: 'Borro el audio y me olvido.', next: 'fin_mid', q: 'mid', fb: 'Mejor avisar: otras familias pueden recibir el mismo audio.' },
           ] },
         fin_good: { msgs: [['sys', 'Ya tenéis una palabra que solo conocéis vosotros.']], fin: { tipo: 'good', titulo: 'Bien hecho', texto: 'Colgar, verificar por un canal conocido y avisar. Eso es exactamente lo que funciona.' } },
         fin_mid: { msgs: [['sys', 'Todo queda en un susto.']], fin: { tipo: 'mid', titulo: 'Evitaste el pago, pero faltó avisar', texto: 'Cuéntalo siempre a la residencia: así pueden avisar a otras familias.' } },
       },
     }), state_max: 20, est_seconds: 270, prompt: '',
   }),
 })
 .add({
   title: 'Legítimo o fraude', obj: 1, text: 'Con todo lo visto, ahora te toca a ti. Desliza o toca los botones.',
   ix: ix.html({
     ...W.swipeDeck({ titulo: '',
       cards: [
         { canal: '✉️ Correo', de: 'administracion@lavanderia-sol.com', asunto: 'Cambio de cuenta bancaria', texto: 'Buenos días, Marta. Desde esta semana nuestra cuenta ha cambiado. Adjuntamos los nuevos datos para el pago de la factura de la planta 2. Rogamos confirmación hoy.', fraude: true, pistas: ['El texto impecable ya no es señal de nada', 'Cambio de cuenta solo por correo', 'Pide respuesta hoy'], porque: 'Un cambio de IBAN por correo se confirma siempre llamando al número registrado del proveedor.' },
         { canal: '💬 WhatsApp', de: 'Dirección (número de la agenda)', texto: 'Mañana cambio de turno a las 15:00 en la planta 2. El cuadrante está en la carpeta de siempre.', fraude: false, pistas: ['Número conocido y canal habitual', 'No pide dinero, claves ni enlaces'], porque: 'Mensaje esperable, por el canal de siempre y sin pedirte nada delicado.' },
         { canal: '📞 Audio', de: 'Número desconocido', texto: '«Mamá, soy yo. Me han robado el móvil, este es mi número nuevo. Hazme un Bizum de 300 euros ahora, es urgente y no se lo digas a papá.»', fraude: true, pistas: ['Número nuevo', 'Urgencia y secreto', 'Pide dinero'], porque: 'Una voz que suena a tu hijo no basta: llama a su número de siempre antes de enviar nada.' },
         { canal: '✉️ Correo', de: 'Dirección (el correo de siempre)', asunto: 'Reunión de equipo, jueves', texto: 'Os convoco el jueves a las 16:00 en la sala común para hablar del nuevo protocolo de visitas.', fraude: false, pistas: ['Remitente y canal habituales', 'Sin enlaces ni peticiones raras'], porque: 'Es una convocatoria normal que no te pide dinero ni datos.' },
         { canal: '💬 WhatsApp', de: 'Grupo «Vecinos del barrio»', texto: '📹 Mira este vídeo: un médico muy conocido recomienda este producto para la memoria de los mayores. Reenvíalo a todos y cómpralo hoy con un 70 % de descuento.', fraude: true, pistas: ['Cara conocida: ya no prueba nada', 'Urgencia comercial', 'Pide reenviar'], porque: 'Un vídeo con una cara famosa se puede fabricar. Antes de reenviar, busca la noticia en una fuente fiable.' },
         { canal: '📱 SMS', de: 'Asistente-Residencia-IA', texto: 'Soy el asistente virtual del centro. Para ayudarte, indícame tu usuario y la clave del programa de gestión.', fraude: true, pistas: ['Nadie legítimo te pide tu clave', 'Asistente que no conoces'], porque: 'Un «asistente» que pide claves es un engaño. Usa solo las herramientas que el centro te ha dado.' },
         { canal: '📞 Llamada', de: 'Proveedor del ascensor (número de la agenda)', texto: 'Te llamo para confirmar la revisión del jueves. Si quieres, cuelga y llama tú al número de siempre para comprobarlo.', fraude: false, pistas: ['Número conocido', 'No tiene prisa', 'Te ofrece comprobarlo'], porque: 'Quien te invita a verificar por otro canal suele ser legítimo.' },
       ],
     }), est_seconds: 270, prompt: '',
   }),
 })
 .add({
   title: 'Un chat de soporte', obj: 1, text: 'Eres técnico de mantenimiento y te escribe un supuesto «asistente» de la empresa de la caldera.',
   ix: ix.html({
     ...W.chatStory({
       contacto: { nombre: 'Asistente de soporte', emoji: '🛠️', sub: 'chat de una web desconocida' }, estilo: 'chat',
       nodos: {
         n1: { msgs: [['sys', 'Eres Raúl, de mantenimiento. La caldera da un aviso y buscas ayuda en internet.'], ['them', 'Hola, soy el asistente de soporte. Para revisar su caldera necesito acceso remoto a su ordenador y la clave del wifi del centro.']],
           choices: [
             { t: 'Le doy la clave del wifi y acepto el acceso remoto.', next: 'bad', q: 'bad', fb: 'Nadie legítimo te pide claves ni acceso remoto por un chat.' },
             { t: 'Le pregunto de qué empresa es exactamente.', next: 'n2', q: 'mid', fb: 'Hablar con él no verifica nada: puede inventarse cualquier nombre.' },
             { t: 'Cierro el chat y llamo al proveedor al teléfono que ya tenía.', next: 'ok1', q: 'good', fb: 'Verificar al proveedor por un canal conocido es lo correcto.' },
           ] },
         n2: { msgs: [['them', 'Somos el servicio técnico oficial. Dame ya el acceso: la avería es urgente.']],
           choices: [
             { t: 'Cedo: parece que sabe de calderas.', next: 'bad', q: 'bad', fb: 'La urgencia y la insistencia son señales de alarma.' },
             { t: 'Corto y llamo al proveedor por su teléfono de siempre.', next: 'ok1', q: 'good', fb: 'Siempre puedes cortar y verificar.' },
           ] },
         bad: { msgs: [['sys', 'Das el acceso. Poco después, el ordenador se comporta de forma extraña.']], fin: { tipo: 'bad', titulo: 'Acceso entregado a un desconocido', texto: 'Avisa ya a dirección y a la persona responsable de informática; cambiarán las claves. Avisar pronto es lo que más ayuda.' } },
         ok1: { msgs: [['sys', 'Tu proveedor te confirma que no tiene ningún asistente de chat y te atiende por teléfono.']], fin: { tipo: 'good', titulo: 'Bien resuelto', texto: 'No des claves ni accesos por un chat. Avisa a dirección del intento.' } },
       },
     }), state_max: 20, est_seconds: 240, prompt: '',
   }),
 })
 .add({
   title: 'Un vídeo en el grupo', obj: 1,
   ix: ix.scenario('Por el grupo de WhatsApp del turno llega un vídeo de un médico muy conocido que recomienda un producto «milagroso» para la memoria. Todo el mundo lo reenvía.', '¿Qué haces?', [
     ['Lo reenvío: es un médico famoso.', false, 'Una cara famosa ya no prueba nada: los vídeos se pueden fabricar.'],
     ['Busco la noticia en una fuente fiable antes de reenviar nada y aviso si es una estafa.', true, 'Correcto: contrastar antes de reenviar es la defensa.'],
     ['Compro el producto, que tiene descuento.', false, 'La prisa comercial es otra señal de alarma.'],
   ], fbk('¡Muy bien! Contrastar antes de reenviar.', 'Piénsalo otra vez: no reenvíes sin comprobar.', 'La desinformación y los vídeos falsos con caras conocidas se usan para estafar. Antes de reenviar: ¿quién lo dice? ¿hay otra fuente seria?')),
 })
 .add({ type: 'summary', title: 'Lo que te llevas', text: 'La IA no inventa estafas nuevas: hace las de siempre **más creíbles**.\n\n- La ortografía impecable ya no es señal de que un mensaje sea bueno.\n- Una voz puede copiarse con muy poco audio.\n- Las señales fiables son la **prisa**, el **secreto** y que te pidan **dinero, claves o datos**.\n- Si un familiar te cuenta una llamada rara, avisa a dirección.' })

// =====================================================================
// LECCIÓN 3 · Deepfakes
// =====================================================================
const l3 = c.unit('Lección 3. Deepfakes: cuando ver ya no es creer', 'Se pueden fabricar caras y voces; el caso Arup lo demuestra y la defensa fiable es el procedimiento, no fijarse en la cara.')
l3.add({ type: 'cover', title: 'Deepfakes: cuando ver ya no es creer', text: 'Lección 3', img: im(IMG.l3, 'Una cara dividida: una mitad real y otra generada por IA con una malla') })
 .add({
   title: 'Videollamada falsa', obj: 1,
   text: 'Un **deepfake** es un vídeo o un audio falso hecho con IA que imita a una persona real: su cara (*deepface*) o su voz (*deepvoice*).\n\nPuede ocurrir **en plena videollamada**: ves y oyes a alguien conocido, pero no es él.',
   img: im(IMG.video, 'Videollamada de cuatro personas en la que tres imágenes son falsas, generadas por IA'),
 })
 .add({
   title: 'El caso Arup', obj: 1, text: 'Es un caso real, confirmado por la propia empresa. Toca cada paso.',
   notes: ['Los detalles del correo inicial proceden de prensa (CNN, vía buscador, dossier [V-sec]); cifra y 15 transferencias verificadas en Fortune (17-05-2024).'],
   ix: ix.timeline([
     ['Enero 2024', 'Un correo extraño', 'Según la prensa, un empleado de finanzas de la oficina de Hong Kong de Arup, una empresa de ingeniería, recibió un correo supuestamente del director financiero que pedía una operación confidencial.'],
     ['La videollamada', 'Todos parecían reales', 'Le invitaron a una videollamada donde el director financiero y otros compañeros parecían estar presentes. **Todos eran imágenes y voces falsas** creadas con IA.'],
     ['Las transferencias', '15 pagos', 'Siguiendo las órdenes de la llamada, hizo **15 transferencias** por unos 200 millones de dólares de Hong Kong, unos 25,6 millones de dólares estadounidenses.'],
     ['El descubrimiento', 'Al preguntar a la central', 'El fraude salió a la luz cuando contrastó lo ocurrido con la oficina central del Reino Unido.'],
     ['Mayo 2024', 'Lo que confirmó la empresa', 'Arup confirmó públicamente que se usaron «voces e imágenes falsas». La lección para cualquier centro: **ningún pago se autoriza solo por videollamada**.'],
   ]),
 })
 .add({
   title: 'Detector de pistas', obj: 1,
   text: 'Esta videollamada es falsa. Busca los fallos tocando la imagen.\n\n::: info\nPuedes ampliar con [este artículo del INCIBE sobre deepfakes](https://www.incibe.es/ciudadania/blog/deepfakes-como-se-aprovechan-de-esta-tecnologia-para-enganarnos).\n:::',
   ix: ix.html({ ...W6.detectorDeepfake(), est_seconds: 330, prompt: '' }),
 })
 .add({
   title: 'Tu turno: ¿pagas?', obj: 2, text: 'Imagina que diriges un centro y te llega esta videollamada. Ya sabes que las pistas fallan: ¿qué decides?',
   ix: ix.html({
     ...W.chatStory({
       contacto: { nombre: 'Presidente del grupo', emoji: '🎥', sub: 'videollamada · cámara activada' }, estilo: 'llamada',
       nodos: {
         n1: { msgs: [['sys', 'Te llegó un correo del presidente pidiendo una videollamada confidencial. Aceptas. En pantalla se ve y se oye al presidente.'], ['them', 'Buenas tardes, Elena. Cierro la compra de un proveedor y necesito una transferencia de 48.000 euros hoy mismo a una cuenta nueva. Es confidencial: no lo comentes con nadie.']],
           choices: [
             { t: 'Hago la transferencia: lo estoy viendo y es su voz.', next: 'bad', q: 'bad', fb: 'Una cara y una voz ya no prueban nada: se pueden falsificar en directo.' },
             { t: 'Le pido que me lo confirme por el chat de la propia videollamada.', next: 'n2', q: 'mid', fb: 'Si el engaño está en esa llamada, su chat también lo controla quien engaña.' },
             { t: 'Me desconecto un momento y le llamo yo a su móvil de siempre.', next: 'ok1', q: 'good', fb: 'Verificar por un canal que ya conocías es lo que funciona.' },
           ] },
         n2: { msgs: [['them', 'Ya te lo he escrito en el chat. Date prisa, por favor, hay que cerrar hoy.']],
           choices: [
             { t: 'Hago el pago: ya lo he visto por escrito.', next: 'bad', q: 'bad', fb: 'Escribirlo en el mismo canal no confirma nada.' },
             { t: 'Cuelgo y llamo al presidente a su móvil de siempre.', next: 'ok1', q: 'good', fb: 'Nunca es tarde para cortar y verificar.' },
           ] },
         bad: { msgs: [['sys', 'Haces la transferencia. Horas después, el presidente te dice que nunca pidió una videollamada.']], fin: { tipo: 'bad', titulo: 'Era un deepfake', texto: 'Si ocurre: llama ya al banco para intentar bloquear la transferencia, avisa a dirección y denuncia. El 017 de INCIBE te orienta. Y recuerda: ningún pago se autoriza solo por videollamada.' } },
         ok1: { msgs: [['sys', 'Llamas al número de siempre del presidente. Te dice que no ha pedido ninguna videollamada ni ningún pago.']],
           choices: [
             { t: 'No pago nada y aviso a dirección y a la persona responsable de seguridad o informática.', next: 'fin_good', q: 'good', fb: 'Avisar protege a todo el centro.' },
             { t: 'Lo dejo pasar: al final no ha pasado nada.', next: 'fin_mid', q: 'mid', fb: 'Sin aviso, el siguiente intento puede pillar a otra persona.' },
           ] },
         fin_good: { msgs: [['sys', 'El intento queda registrado y el equipo está alerta.']], fin: { tipo: 'good', titulo: 'Decisión impecable', texto: 'Cortar, verificar por un canal conocido, no pagar y avisar. Además, una segunda persona debería autorizar siempre cualquier pago nuevo.' } },
         fin_mid: { msgs: [['sys', 'Todo sigue como siempre.']], fin: { tipo: 'mid', titulo: 'No pagaste, pero faltó avisar', texto: 'Avisar es lo que permite que el centro se prepare para el siguiente intento.' } },
       },
     }), state_max: 20, est_seconds: 270, prompt: '',
   }),
 })
 .add({
   title: 'Un audio de la doctora', obj: 1,
   ix: ix.scenario('Eres enfermera de planta. Te llega por WhatsApp un audio con la voz de la doctora: «Cambia la pauta de la residente de la 12, ahora mismo, que no hay tiempo. Ya lo apunto yo luego».', '¿Qué haces?', [
     ['Cambio la pauta: es su voz y ella manda.', false, 'Una pauta no se modifica por un audio. La voz se puede copiar.'],
     ['Confirmo con la doctora por el canal habitual y con el registro del centro antes de tocar nada.', true, 'Correcto: una orden clínica se verifica por el canal oficial, aunque haya prisa.'],
     ['Contesto al audio preguntando si está segura.', false, 'Seguirías hablando por el mismo canal que puede estar suplantado.'],
   ], fbk('¡Bien! Verificar por el canal habitual es lo que protege a la residente.', 'Repásalo: ninguna pauta cambia por un audio.', 'Es un escenario didáctico, no un caso real. Con prisa o sin ella, una orden clínica se confirma por el canal oficial y queda registrada.')),
 })
 .add({
   title: '¿Señal o normal?', obj: 1, text: 'Clasifica cada situación de una videollamada o llamada.',
   ix: ix.classify('Arrastra cada situación a su grupo.', [['s', 'Señal de alarma'], ['n', 'Normal']], [
     ['Te piden una transferencia hoy y que no se lo cuentes a nadie', 's'],
     ['Los labios no van con la voz', 's'],
     ['Te piden cambiar de canal: «escríbeme a este número nuevo»', 's'],
     ['Te proponen colgar y que llames tú al número de siempre', 'n'],
     ['Un compañero te llama desde su número habitual para pedirte el cuadrante', 'n'],
     ['La imagen se emborrona alrededor del pelo cuando mueve la cabeza', 's'],
   ], fbk('¡Perfecto!', 'Revisa alguna: la prisa, el secreto y el cambio de canal son las señales más fiables.', 'Recuerda: las pistas visuales cada vez fallan más. Lo que protege es verificar por otro canal.')),
 })
 .add({ type: 'summary', title: 'Lo que te llevas', text: 'Hoy se pueden fabricar **caras y voces** convincentes, incluso en directo.\n\n- El caso Arup (2024): 15 transferencias tras una videollamada con personas falsas.\n- Las pistas visuales ayudan, pero **cada vez fallan más**.\n- Lo que de verdad protege es el **procedimiento**: cortar y verificar por otro canal antes de hacer nada.' })

// =====================================================================
// LECCIÓN 4 · Defensas
// =====================================================================
const l4 = c.unit('Lección 4. Defensas: palabra clave, verificar por otro canal y protocolo de pagos', 'Parar, pensar y verificar por otro canal; palabra clave y doble confirmación en pagos y cambios de IBAN.')
l4.add({ type: 'cover', title: 'Defensas que siempre funcionan', text: 'Lección 4', img: im(IMG.l4, 'Un teléfono que se cuelga, otro que se vuelve a llamar y un escudo: las defensas básicas') })
 .add({
   title: 'Parar, pensar, verificar', obj: 2,
   text: 'Una sola regla vale para cualquier estafa, con IA o sin ella:\n\n1. **Para** si hay prisa, secreto o miedo. La presión es la señal.\n2. **Piensa**: ¿me piden dinero, claves, datos o cambiar un IBAN?\n3. **Verifica** por otro canal, con un número que ya tenías, no con el que te dan en el mensaje.',
   img: im(IMG.ppv, 'Tres pasos: una señal de stop, un signo de interrogación y un teléfono: parar, pensar y verificar'),
 })
 .add({
   title: 'Cuatro hábitos que protegen', obj: 2, text: 'Dale la vuelta a cada tarjeta.',
   ix: ix.flip([
     ['Cuelga y vuelve a llamar', 'Corta y llama tú al número guardado de esa persona. Si es «el director», a su móvil de siempre o a recepción, no al número que te acaba de dar la llamada.'],
     ['Palabra clave', 'Acuerda con tu familia una palabra o pregunta que solo conozcáis y que no esté en redes. No la escribas por WhatsApp.'],
     ['Pregunta de control', 'Pregunta algo que solo sepa la persona real y que no esté en redes. Ayuda, pero no te fíes solo de esto.'],
     ['Cuida tu voz y tu imagen', 'Menos audios públicos, perfiles privados y no contestes «sí» a un desconocido que te pide confirmar algo.'],
   ]),
 })
 .add({
   title: 'Tu palabra clave', obj: 2, text: 'Piensa con quién acordarías una palabra clave y qué tipo de palabra elegirías. **No la escribas aquí ni en ningún mensaje.**',
   ix: ix.casep('¿Con quién acordarías una palabra clave y cómo sería?', [
     'He pensado con quién la acordaría: familia, pareja, dirección o compañeros de confianza',
     'Mi palabra no aparece en mis redes ni se puede adivinar fácilmente',
     'Sé que no la escribiré por WhatsApp ni la publicaré',
   ], { explanation: 'Una buena palabra clave es algo que solo conocéis vosotros y que no está en redes: un recuerdo compartido, una expresión familiar o una pregunta cuya respuesta no se pueda buscar. Se acuerda en persona y no se escribe en ningún mensaje.' }),
 })
 .add({
   title: 'Protocolo de pagos', obj: 2, text: 'Un pago nuevo o un cambio de IBAN sigue siempre el mismo camino. Es una propuesta de trabajo: cada centro la adapta a su procedimiento.',
   ix: ix.sort('Ordena el camino de un cambio de IBAN.', [
     'Paro: no toco el pago ni los datos del proveedor',
     'Llamo al número registrado, no al del mensaje',
     'Pido una segunda firma si el importe o la cuenta son nuevos',
     'Dejo constancia: quién, cuándo y cómo lo verifiqué',
     'Solo entonces hago el pago o el cambio',
   ], fbk('¡Ese es el orden!', 'Casi: primero se para y se verifica, y solo al final se paga.', 'Si algo no cuadra en cualquier paso, se retiene el pago y se avisa a dirección. Si ya se pagó, avisa al banco de inmediato y denuncia; el 017 de INCIBE te orienta.')),
 })
 .add({
   title: 'Un IBAN nuevo', obj: 2,
   ix: ix.scenario('Trabajas en administración. Llega un correo impecable, con firma y logotipo, que informa del nuevo IBAN del proveedor de alimentación y pide pagar hoy.', '¿Qué haces?', [
     ['Cambio el IBAN en la ficha: el correo está perfecto.', false, 'Que esté bien escrito no prueba nada: la IA escribe sin faltas.'],
     ['Respondo al correo para que me lo confirmen.', false, 'Respondes a quien puede ser el estafador.'],
     ['Llamo al teléfono registrado del proveedor, lo confirmo con una segunda persona y dejo constancia.', true, 'Correcto: otro canal, doble confirmación y registro.'],
     ['Llamo al teléfono que aparece en la firma del correo.', false, 'Ese número también puede ser del estafador.'],
   ], fbk('¡Bien! Es el protocolo de pagos al completo.', 'No: aquí falta verificar por un canal que ya conocías.', 'Un cambio de IBAN es el fraude más habitual. Por correo, WhatsApp, llamada o videollamada, nunca se cambia sin confirmar.')),
 })
 .add({
   title: 'Tu turno: la familia llama', obj: 2, text: 'Eres gerocultora y una hija te llama muy nerviosa a la planta.',
   ix: ix.html({
     ...W.chatStory({
       contacto: { nombre: 'Marta, hija de una residente', emoji: '📞', sub: 'llamada a la planta' }, estilo: 'llamada',
       nodos: {
         n1: { msgs: [['sys', 'Eres Ana, gerocultora de noche.'], ['them', 'Ana, me ha llamado mi madre llorando, por una videollamada, pidiéndome 500 euros para una operación. Se le veía en la cara. ¡No sé qué hacer!']],
           choices: [
             { t: 'Le digo que pague: si se le veía en la cara, será verdad.', next: 'bad', q: 'bad', fb: 'Una cara y una voz se pueden fabricar. Y tu madre estaba tranquila en su habitación.' },
             { t: 'Le digo que no pague, que respire, que cuelgue y que nos llame al centro, y aviso a dirección.', next: 'good', q: 'good', fb: 'Parar, verificar por otro canal y avisar: exactamente.' },
             { t: 'Le digo que no pasa nada y cuelgo.', next: 'mid', q: 'mid', fb: 'Se queda sola con el miedo y sin ayuda.' },
           ] },
         good: { msgs: [['sys', 'Comprobáis que su madre está bien, dormida. Dirección avisa a las demás familias.']], fin: { tipo: 'good', titulo: 'Gran reacción', texto: 'Has sido la primera barrera. Recomienda a la familia el 017 de INCIBE, gratuito y confidencial.' } },
         mid: { msgs: [['sys', 'Marta, sin ayuda, duda toda la noche.']], fin: { tipo: 'mid', titulo: 'Faltó acompañar', texto: 'Cuando una familia te cuenta una llamada rara, no le quites importancia: tranquilízala, comprueba por el canal habitual y avisa a dirección.' } },
         bad: { msgs: [['sys', 'Marta hace el pago. Más tarde, su madre le dice que no sabía nada.']], fin: { tipo: 'bad', titulo: 'Era un fraude con videollamada falsa', texto: 'Si ocurre, avisa a dirección y que la familia contacte con su banco y con el 017 de INCIBE. Equivocarse le pasa a cualquiera.' } },
       },
     }), state_max: 20, est_seconds: 270, prompt: '',
   }),
 })
 .add({
   title: 'Completa la regla', obj: 2, text: 'Rellena la regla de oro.',
   ix: ix.fill('Completa la frase.', 'Si hay [[prisa]] o secreto, [[paro]]. Si me piden dinero, claves o datos, [[verifico]] por otro canal usando un número que ya [[tenía]].', ['corro', 'contesto', 'olvidaba'],
     fbk('¡Regla aprendida!', 'Casi: repasa la regla de oro.', 'Parar, pensar y verificar sirve contra cualquier estafa, con IA o sin ella.')),
 })
 .add({
   title: 'Un aviso del equipo', obj: 2,
   ix: ix.scenario('Eres supervisora de planta. Una gerocultora te cuenta que una familia recibió una llamada con la voz de su padre residente pidiéndole dinero. Ya no hay riesgo inmediato.', '¿Qué haces?', [
     ['Le digo que no es nada: a la familia ya se le ha pasado el susto.', false, 'Sin aviso, otras familias pueden recibir la misma llamada.'],
     ['Agradezco el aviso, lo comunico a dirección y recomiendo a la familia el 017 de INCIBE.', true, 'Correcto: recoger el aviso sin reproches y escalarlo protege a todos.'],
     ['Le pido que no lo comente para no alarmar.', false, 'El secreto es justo lo que buscan los estafadores.'],
   ], fbk('¡Muy bien! Avisar protege a todos.', 'Piénsalo: avisar a dirección es lo que ayuda.', 'El personal puede ser la primera barrera: si un familiar cuenta una llamada rara, se aplica el protocolo y se avisa a dirección.')),
 })
 .add({ type: 'summary', title: 'Lo que te llevas', text: 'Las defensas son sencillas y sirven contra cualquier fraude:\n\n- **Parar, pensar, verificar** por otro canal.\n- Colgar y **volver a llamar tú** al número de siempre.\n- Una **palabra clave** familiar.\n- Pagos y cambios de IBAN con **doble confirmación**.\n- Si dudas, pregunta o llama al **017** de INCIBE: es gratuito y confidencial.' })

// =====================================================================
// LECCIÓN 5 · Usar la IA en el trabajo
// =====================================================================
const l5 = c.unit('Lección 5. Usar la IA en el trabajo sin dar datos', 'Semáforo de datos, anonimización básica y revisión de lo que dice la IA: quien usa y firma el resultado es responsable.')
const SEM = [
  { t: 'Doña Carmen López, 87 años, habitación 214, con demencia y disfagia', c: 'r', p: 'Es un dato de salud de una persona identificable. Nunca en una IA pública.' },
  { t: 'Pedir ideas de juegos de memoria para la animación', c: 'v', p: 'No hay datos de nadie. Verde, y revisa el resultado.' },
  { t: 'El informe de alta de un residente, para que lo resuma', c: 'r', p: 'Aunque sea solo para resumir, los datos salen a una empresa externa. Rojo.' },
  { t: 'Redactar un comunicado a las familias, sin nombres ni datos de nadie', c: 'a', p: 'Ámbar: sin datos, con la herramienta que permita el centro y revisando el texto.' },
  { t: 'La contraseña del correo del centro, para que la IA entre a ordenarlo', c: 'r', p: 'Las claves no se comparten con nadie, y menos con una IA.' },
  { t: 'Preguntar qué es la deshidratación en mayores y contrastarlo luego con una fuente oficial', c: 'v', p: 'Duda general sin datos, y contrastada. Verde.' },
  { t: 'Foto de un compañero para «mejorarla» o hacerle un vídeo', c: 'r', p: 'Las imágenes de personas no se suben a una IA pública.' },
  { t: 'Un caso ficticio: «una persona mayor con riesgo de caídas», para pedir ideas de prevención', c: 'a', p: 'Ámbar: caso inventado, sin datos reales, y después se contrasta con el protocolo y con enfermería.' },
  { t: 'Cómo se hace una tabla en Excel', c: 'v', p: 'Aprender una función de Word o Excel no implica ningún dato. Verde.' },
  { t: 'El cuadrante de turnos con nombres, bajas y motivos', c: 'r', p: 'Contiene datos personales de compañeros. Rojo.' },
]
l5.add({ type: 'cover', title: 'Usar la IA en el trabajo sin dar datos', text: 'Lección 5', img: im(IMG.sem, 'Semáforo con rojo (nunca), ámbar (con cuidado) y verde (sí) para decidir qué datos se pueden pegar en una IA') })
 .add({
   title: 'La IA pública no es un cajón cerrado', obj: 3,
   text: 'Lo que escribes en una IA pública se envía a **una empresa externa**. Puede guardarse y, según la herramienta, usarse para entrenarla.\n\n::: case\nSegún informó la prensa en 2023, empleados de Samsung pegaron en ChatGPT código y datos internos para que les ayudase, y la compañía acabó prohibiendo estas herramientas.\n:::\n\nLa AEPD y el Ministerio de Sanidad coinciden: nada de datos personales ni de salud en una IA pública.',
   notes: ['El caso Samsung (Bloomberg, 2-05-2023) está marcado [V-sec] en el dossier: releer la fuente primaria antes de publicar.'],
   img: im(IMG.nube, 'Un móvil envía un informe a una nube de empresa externa: se envía fuera, puede guardarse y puede usarse para entrenar'),
 })
 .add({
   title: 'El semáforo de datos', obj: 3, text: 'Antes de pegar nada en una IA, decide qué luz tiene. Arrastra cada dato a su luz.',
   ix: ix.html({ ...W6.semaforoDatos({ items: SEM }), est_seconds: 360, prompt: '' }),
 })
 .add({
   title: 'Quita lo que identifica', obj: 3,
   text: '**Anonimizar** es quitar o cambiar lo que permite reconocer a alguien. Ojo: la **combinación** de detalles raros también identifica. Lo mejor es describir un **caso ficticio**.',
   ix: ix.html({
     ...W6.anonimizador({
       partes: [
         { txt: '«' }, { t: 'Doña Carmen López', id: true, why: 'el nombre y los apellidos identifican a la persona' }, { txt: ', de ' },
         { t: '87 años', id: true, why: 'la edad exacta, junto con otros datos, ayuda a reconocerla' }, { txt: ', ' },
         { t: 'habitación 214', id: true, why: 'el número de habitación señala a una persona concreta' }, { txt: ', con ' },
         { t: 'demencia y disfagia', id: true, why: 'son datos de salud y, unidos al resto, la identifican' }, { txt: ', se cayó ' },
         { t: 'el martes 3', id: true, why: 'una fecha exacta ayuda a reconocer el caso' }, { txt: ' ' },
         { t: 'en el pasillo', id: false, why: 'la IA necesita este detalle para ayudarte y no identifica a nadie' }, { txt: '. Su hija ' },
         { t: 'Pilar', id: true, why: 'el nombre de un familiar también identifica' }, { txt: ' (tel. ' },
         { t: '600 000 000', id: true, why: 'un teléfono identifica a una persona' }, { txt: ') quiere saber ' },
         { t: 'qué hacer para evitar caídas', id: false, why: 'es justo la pregunta: la IA la necesita' }, { txt: '.»' },
       ],
       limpio: 'Una persona mayor con riesgo de caídas se cayó en un pasillo. ¿Qué ideas generales hay para evitar caídas?',
     }), est_seconds: 330, prompt: '',
   }),
 })
 .add({
   title: 'Tu turno: el informe', obj: 3, text: 'Eres administrativa y tienes que resumir un informe para la familia. Tienes una IA abierta en el navegador.',
   ix: ix.html({
     ...W.chatStory({
       contacto: { nombre: 'Asistente de IA público', emoji: '🤖', sub: 'chat abierto en el navegador' }, estilo: 'chat',
       nodos: {
         n1: { msgs: [['sys', 'Eres Lucía. Tienes que resumir para la familia el informe de una residente.'], ['them', 'Hola, ¿en qué te ayudo?']],
           choices: [
             { t: 'Pego el informe entero, con su nombre y sus diagnósticos, y pido que lo resuma.', next: 'bad', q: 'bad', fb: 'Son datos de salud identificables y salen a una empresa externa.' },
             { t: 'Quito solo el nombre y pego el resto.', next: 'n2', q: 'mid', fb: 'Quitar el nombre no basta: quedan edad, habitación, fechas y diagnósticos.' },
             { t: 'No pego nada. Pido una plantilla de comunicado con huecos y la relleno yo.', next: 'good', q: 'good', fb: 'Así la IA no ve ningún dato real.' },
           ] },
         n2: { msgs: [['sys', 'Repasas lo que queda: edad, habitación, fechas exactas, diagnósticos. La combinación sigue identificando a la residente.']],
           choices: [
             { t: 'Pego igualmente el resto: ya no lleva el nombre.', next: 'bad', q: 'bad', fb: 'La combinación de detalles también identifica.' },
             { t: 'Mejor no lo pego. Prefiero pedir una plantilla con huecos.', next: 'good', q: 'good', fb: 'Rectificar a tiempo es lo correcto.' },
           ] },
         bad: { msgs: [['sys', 'Pulsas enviar. Los datos ya están fuera del centro.']], fin: { tipo: 'bad', titulo: 'Datos de salud en una IA pública', texto: 'Si ya ocurrió, avisa de inmediato a dirección y a la persona delegada de protección de datos. Avisar pronto es lo que más ayuda. La próxima vez: plantilla con huecos, o la herramienta que haya aprobado el centro.' } },
         good: { msgs: [['them', 'Claro. Aquí tienes una plantilla: «Estimada familia: les escribimos para informarles de [asunto]». Rellena los huecos tú.']], fin: { tipo: 'good', titulo: 'Bien resuelto', texto: 'Una plantilla sin datos y tú rellenando a mano. Si el centro tiene una herramienta de IA aprobada, usa solo esa y solo para lo permitido.' } },
       },
     }), state_max: 20, est_seconds: 270, prompt: '',
   }),
 })
 .add({
   title: '¿Qué luz tiene?', obj: 3, text: 'Otra ronda del semáforo, esta vez para ordenar situaciones del día a día.',
   ix: ix.classify('Arrastra cada situación a su luz.', [['r', 'Rojo: nunca'], ['a', 'Ámbar: con cuidado'], ['v', 'Verde: sí']], [
     ['Lista de residentes con DNI y teléfonos de los familiares', 'r'],
     ['Acta de la reunión de dirección o expediente de un trabajador', 'r'],
     ['Un resumen de un protocolo genérico de higiene de manos, no confidencial', 'a'],
     ['Traducir un texto no confidencial para un familiar extranjero', 'a'],
     ['Un borrador de cartel para la fiesta del centro, con información pública', 'v'],
     ['Un ejemplo de lista de comprobación genérica, sin datos del centro', 'v'],
   ], fbk('¡Semáforo dominado!', 'Revisa: ¿identifica a alguien o es interno?', 'Criterio rápido: ¿puede identificar a una persona real o al centro? ¿lo dejarías en el tablón de la calle? Si no, no lo pegues.')),
 })
 .add({
   title: 'Revisa lo que dice la IA', obj: 4,
   text: 'La IA puede inventar dosis, normas, nombres o citas. Trata lo que genera como **un borrador**.\n\n::: case\nEn 2024, un tribunal canadiense (Moffatt contra Air Canada) consideró responsable a una aerolínea por la información falsa que dio su chatbot sobre reembolsos.\n:::\n\nQuien usa y firma el resultado es responsable. Y la IA nunca sustituye al juicio profesional, como recuerda el Ministerio de Sanidad.',
   notes: ['El caso Moffatt v. Air Canada está marcado [V-sec] en el dossier: contrastar con la fuente jurídica antes de publicar.'],
 })
 .add({
   title: 'Una duda con un protocolo', obj: 4,
   ix: ix.scenario('Eres gerocultora y quieres saber cómo movilizar a una residente con riesgo de caída. Tienes una IA pública abierta en el móvil.', '¿Cómo lo haces?', [
     ['Escribo su nombre y su habitación para que la respuesta sea más precisa.', false, 'Con datos de la residente, saldrían fuera del centro. No hace falta.'],
     ['Pregunto en general, sin datos de nadie, y lo contrasto con el protocolo del centro y con enfermería.', true, 'Correcto: consulta general, borrador y contraste con quien sabe.'],
     ['Sigo lo que diga la IA: para eso está.', false, 'La IA puede equivocarse. Quien aplica el resultado es responsable.'],
   ], fbk('¡Muy bien! Sin datos y contrastando.', 'Revisa: sin datos de la residente y contrastando con el protocolo.', 'La IA puede ayudarte con ideas generales, pero la decisión y la responsabilidad son tuyas y de tu equipo.')),
 })
 .add({
   title: 'Usos buenos y límites', obj: 4, text: 'La IA ayuda, pero con reglas. Toca cada apartado.',
   ix: ix.accordion([
     ['Usos aceptables', 'Según el Ministerio de Sanidad: traducir texto sin datos personales, buscar ideas, preparar material informativo o educativo sin datos sensibles (con supervisión) y analizar información no sensible o bien anonimizada.'],
     ['Sesgos y trato justo', 'La IA aprende de datos del pasado y puede discriminar por edad, género, origen o discapacidad. **No la uses para decidir sobre personas** (quién recibe qué cuidado, a quién se contrata) sin supervisión humana.'],
     ['Transparencia', 'Si una comunicación o una imagen realista la ha generado una IA, dilo. Y no uses fotos de residentes ni de compañeros para crear imágenes o vídeos con IA.'],
     ['Derechos de autor', 'Lo que genera una IA puede parecerse a obras existentes. No copies textos protegidos como si fueran tuyos: **revisa y cita**.'],
   ]),
 })
 .add({
   title: 'Una imagen hecha con IA', obj: 4,
   ix: ix.scenario('Quieres un cartel realista para el taller de memoria y se te ocurre generar con IA una foto de «residentes felices» a partir de fotos reales del centro.', '¿Qué haces?', [
     ['Subo las fotos de los residentes a una IA pública para que la imagen salga más real.', false, 'Las imágenes de personas no se suben a una IA pública.'],
     ['Genero una imagen sin personas reales y la marco claramente como creada con IA.', true, 'Correcto: sin fotos de personas y con transparencia sobre su origen.'],
     ['La genero y la publico sin decir nada: nadie lo notará.', false, 'Las imágenes realistas generadas con IA deben identificarse como tales.'],
   ], fbk('¡Bien! Sin fotos de personas y avisando.', 'Revisa: ni fotos de personas ni ocultar el origen.', 'El Ministerio de Sanidad considera no aceptable generar imágenes o vídeos realistas sin identificar que se han generado con IA.')),
 })
 .add({ type: 'summary', title: 'Lo que te llevas', text: 'Usar la IA en el trabajo es posible si sigues unas reglas:\n\n- **Semáforo**: rojo nunca, ámbar con cuidado, verde sí.\n- **Anonimiza** y, mejor, usa casos ficticios.\n- Solo las **herramientas que el centro te ha dado**.\n- **Revisa** todo lo que dice: es un borrador y tú eres responsable.\n- No uses fotos de personas ni de compañeros.' })

// =====================================================================
// LECCIÓN 6 · Marco legal + Repaso y reto
// =====================================================================
const l6 = c.unit('Lección 6. Marco legal orientativo, repaso y reto', 'Qué regula la IA en Europa, a quién acudir, repaso con tarjetas, rosco y compromiso personal.')
l6.add({ type: 'cover', title: 'Marco legal, repaso y reto', text: 'Lección 6', img: im(IMG.l6, 'Un círculo de estrellas europeas con las letras IA y tres niveles de reglas: Europa, España y tu centro') })
 .add({
   title: 'Europa tiene una ley de IA', obj: 4,
   text: 'Es una **visión orientativa**: el Reglamento (UE) 2024/1689 regula la IA en la Unión Europea y se aplica por fases. Los plazos se han ajustado en 2026, así que **consulta siempre las fuentes oficiales**.',
   notes: ['Verificar el texto consolidado del art. 4 (alfabetización en IA) tras el Ómnibus (Reglamento (UE) 2026/1744) antes de afirmar obligaciones concretas de formación. El curso no afirma ninguna.'],
   ix: ix.timeline([
     ['Ago 2024', 'Entra en vigor', 'El Reglamento de IA entró en vigor el 1 de agosto de 2024.'],
     ['Feb 2025', 'Primeras normas', 'Empezaron a aplicarse las prácticas prohibidas y las disposiciones generales, que incluyen la «alfabetización en IA», es decir, saber usarla con criterio. El alcance exacto de esa formación puede haberse matizado: consulta el texto actual antes de afirmar qué se exige.'],
     ['Ago 2026', 'Aplicación general', 'Según la Comisión Europea, desde agosto de 2026 se aplica la mayor parte del Reglamento, incluida la **transparencia**: avisar de que un contenido ha sido generado por IA, por ejemplo los deepfakes.'],
     ['2027 y 2028', 'Alto riesgo', 'Un reglamento de 2026 (el «Ómnibus digital de IA») aplazó las normas para los sistemas de «alto riesgo» a diciembre de 2027 y agosto de 2028.'],
   ]),
 })
 .add({
   title: 'A quién acudir', obj: 4,
   text: 'Ante un fraude o una duda, no estás solo. La **línea 017 del INCIBE** es gratuita y confidencial; también por WhatsApp (900 116 117) y por Telegram (@INCIBE017).',
   ix: ix.match('Une cada organismo con lo que puede hacer por ti.', [
     ['INCIBE (017)', 'Ayuda gratuita ante fraudes y dudas de ciberseguridad'],
     ['AEPD', 'Protección de datos personales; tiene un decálogo para usar la IA'],
     ['Ministerio de Sanidad', 'Orientaciones para profesionales sanitarios sobre el uso de la IA'],
     ['CCN-CERT', 'Informes de ciberamenazas y guías de buenas prácticas'],
   ], fbk('¡Todo emparejado!', 'Revisa alguna pareja.', 'En la bibliografía tienes los enlaces oficiales de cada uno.')),
 })
 .add({
   title: 'Repaso exprés', obj: 2, text: 'Repasa los diez hábitos clave. Toca para ver la respuesta.',
   ix: ix.flash([
     ['¿Qué haces si hay prisa, secreto o miedo?', 'Paro. La presión es la señal de alarma.'],
     ['¿Cómo verificas una llamada o un audio sospechoso?', 'Cuelgo y llamo yo, por otro canal, a un número que ya tenía.'],
     ['¿Para qué sirve una palabra clave?', 'Para comprobar que quien llama es quien dice ser. Debe ser algo que no esté en redes.'],
     ['¿Se puede pagar solo porque se ve y se oye al jefe?', 'No. Una videollamada no autoriza ningún pago.'],
     ['¿Cómo se hace un pago nuevo o un cambio de IBAN?', 'Confirmando por un canal conocido y con una segunda persona.'],
     ['¿Qué datos no se pegan en una IA pública?', 'Los de residentes, familias y compañeros, claves, informes y documentos internos.'],
     ['¿Qué herramientas de IA puedo usar?', 'Solo las que el centro me ha dado. Si no sé, pregunto antes.'],
     ['¿Qué hago con lo que escribe una IA?', 'Lo reviso: es un borrador y el responsable soy yo.'],
     ['¿Puedo subir fotos de personas a una IA?', 'No. Ni de residentes ni de compañeros.'],
     ['Si dudo, ¿a quién llamo?', 'Pregunto a dirección o llamo al 017 de INCIBE.'],
   ]),
 })
 .add({
   title: 'El rosco de la IA', obj: 1, text: 'Un último juego: adivina la palabra que empieza por cada letra.',
   ix: ix.az([
     ['Quitar los datos que identifican a una persona antes de usar una IA', 'Anonimizar'],
     ['Noticia o cadena falsa que se reenvía sin comprobar', 'Bulo'],
     ['La palabra ___ que solo conoces tú y tu familia', 'Clave'],
     ['Vídeo o audio falso creado con IA que imita a una persona real', 'Deepfake'],
     ['Engaño para sacarte dinero o datos', 'Fraude'],
     ['La persona que debe revisar y decidir: supervisión ___', 'Humana'],
     ['Número de cuenta bancaria que los estafadores intentan cambiar', 'IBAN'],
     ['Lo que le escribes a una IA para que responda', 'Prompt'],
     ['Lo que debes hacer siempre con lo que escribe una IA', 'Revisar'],
     ['Rojo, ámbar y verde: sirve para decidir qué datos pegar', 'Semáforo'],
     ['La prisa que te meten los estafadores para que no pienses', 'Urgencia'],
     ['Estafa por llamada de voz', 'Vishing'],
   ]),
 })
 .add({
   title: 'Mi compromiso', obj: 2, text: 'Para cerrar, marca lo que te comprometes a hacer a partir de hoy.',
   ix: ix.html({
     ...W.pledge({
       titulo: '',
       items: [
         'Si me presionan con prisa o secreto, paro y respiro.',
         'Si me piden dinero, claves o cambiar un IBAN, confirmo llamando a un número que ya tenía.',
         'Acordaré una palabra clave con mi familia.',
         'Ningún pago ni cambio de IBAN se hace solo por mensaje, llamada o videollamada.',
         'No pego datos de residentes, familias ni compañeros en una IA pública.',
         'Uso solo las herramientas de IA que el centro me ha dado.',
         'Reviso lo que dice la IA: es un borrador y quien lo firma soy yo.',
         'Si dudo, pregunto o llamo al 017 de INCIBE.',
       ], minimo: 6, final: '¡Compromiso firmado! Gracias por cuidar también de los datos y de la confianza de las personas que cuidas.',
     }), est_seconds: 90, prompt: '',
   }),
 })
 .add({ type: 'summary', title: 'Lo que te llevas', text: 'La IA es una **buena ayudante** si la usas con cabeza.\n\n- Los delincuentes la usan para hacer las estafas de siempre más creíbles.\n- Tu defensa: **parar, pensar y verificar** por otro canal.\n- Ningún dato de residentes en una IA pública.\n- Revisa siempre lo que dice: tú eres responsable.\n\nAhora, el test final.' })

// =====================================================================
// Test final (12 preguntas)
// =====================================================================
c.finalTest('Test final: IA y ciberseguridad', [
  ['Una IA como ChatGPT te da una respuesta muy segura, pero falsa. ¿Por qué ocurre?', [['Porque está conectada a internet y copia mal', false], ['Porque predice la respuesta más probable, pero no comprueba si es verdad', true], ['Porque se lo ordena su dueño', false], ['Porque solo funciona en inglés', false]], 'Funciona como un predictivo gigante: puede «alucinar» datos que suenan bien.', 0],
  ['Un correo fraudulento ya no tiene faltas de ortografía. ¿En qué te fijas?', [['En nada: ya no se puede saber', false], ['Si lleva logotipo', false], ['En la urgencia, el remitente real y lo que me piden', true], ['En si es largo', false]], 'La IA escribe sin errores. La señal está en la presión y en la petición: dinero, claves, datos o un clic.', 1],
  ['Un familiar de una residente te cuenta que le llegó un audio con su voz pidiéndole dinero desde un número nuevo. ¿Qué le aconsejas?', [['Que haga el pago, porque es su voz', false], ['Que conteste al audio para asegurarse', false], ['Que reenvíe el audio a toda la familia', false], ['Que llame él mismo a su madre o a la residencia, al teléfono de siempre, y que avise', true]], 'La voz se puede copiar con muy poco audio: se verifica por otro canal conocido y se avisa a dirección.', 1],
  ['Una videollamada con el director, que se ve y se oye perfectamente, te pide una transferencia urgente. ¿Qué haces?', [['La hago: lo estoy viendo', false], ['Pido que lo escriba en el chat de la llamada y pago', false], ['Hago solo la mitad', false], ['Corto, llamo a su número habitual y lo confirmo con una segunda persona', true]], 'Es el esquema del caso Arup. Ningún pago se autoriza solo por videollamada.', 2],
  ['¿Qué enseña el caso Arup (2024)?', [['Que un virus puede borrar un servidor', false], ['Que hay que cambiar el antivirus', false], ['Que un empleado confió en una videollamada con personas falsas y que hace falta verificar por otro canal', true], ['Que los portátiles se pierden', false]], 'La empresa confirmó que se usaron voces e imágenes falsas; el fraude se descubrió al contrastar con la oficina central.', 1],
  ['¿Para qué sirve una palabra clave familiar?', [['Para entrar en el wifi', false], ['Para firmar contratos', false], ['Para comprobar que quien llama es quien dice ser', true], ['Para bloquear llamadas', false]], 'Debe ser algo que solo conozcáis y que no esté en redes. Lo recomienda el INCIBE.', 2],
  ['Llega un correo perfecto del proveedor de alimentación con un IBAN nuevo. ¿Cuál es la mejor práctica?', [['Cambiarlo cuanto antes por correo', false], ['Pedir confirmación solo por videollamada', false], ['No hace falta confirmar a un proveedor habitual', false], ['Confirmar por un canal conocido y con una segunda persona', true]], 'Un cambio de IBAN es un fraude habitual, y el correo puede estar escrito por una IA.', 2],
  ['¿Qué puedes pegar en una IA pública?', [['El nombre y el diagnóstico de una residente', false], ['Una pregunta general sobre actividades de memoria para mayores', true], ['La contraseña del programa de gestión', false], ['Un informe de alta', false]], 'Solo lo que no identifica a nadie ni es confidencial, y revisando el resultado.', 3],
  ['¿Por qué no debes pegar datos de residentes en una IA pública?', [['Porque es lenta', false], ['Porque los datos salen a una empresa externa, sin garantías de protección de datos', true], ['Porque gasta batería', false], ['Porque no entiende español', false]], 'Así lo señalan la AEPD y el Ministerio de Sanidad: los datos de salud no se introducen en herramientas sin garantías.', 3],
  ['«Una persona mayor con riesgo de caídas» frente a «Doña Carmen López, hab. 214, 87 años». ¿Qué es anonimizar?', [['Borrar el mensaje', false], ['Ponerle una contraseña', false], ['Quitar o cambiar los datos que permiten identificar a una persona, también combinados', true], ['Traducirlo', false]], 'Y cuidado: la combinación de detalles raros también identifica.', 3],
  ['La IA te sugiere una pauta para un residente. ¿Qué haces?', [['La aplico', false], ['La uso como borrador y la contrasto con el protocolo y con enfermería o medicina', true], ['La imprimo', false], ['La envío a la familia', false]], 'La IA nunca sustituye el juicio profesional: su resultado es un borrador y el responsable es quien lo aplica.', 4],
  ['Has recibido un posible fraude y no sabes qué hacer. ¿Qué teléfono gratuito y confidencial del INCIBE te orienta?', [['112', false], ['016', false], ['017', true], ['091', false]], 'La línea 017 es la de ayuda en ciberseguridad del INCIBE.', 4],
])

// ---------- Glosario y bibliografía ----------
c.glossary('IA generativa', 'Programa que ha aprendido de muchísimos textos, imágenes y audios y puede crear contenido nuevo cuando se lo pides.')
 .glossary('Alucinación', 'Cuando una IA se inventa un dato, una cifra o una norma con total seguridad, porque elige lo más probable y no lo verdadero.')
 .glossary('Prompt', 'Lo que le escribes o le dices a una IA para que responda.')
 .glossary('Phishing', 'Mensaje falso (correo, SMS, WhatsApp) que intenta que pinches un enlace, des una clave o pagues.')
 .glossary('Vishing', 'Estafa por llamada de voz: alguien se hace pasar por otra persona o entidad para sacarte dinero o datos.')
 .glossary('Voz clonada', 'Voz imitada con IA a partir de muy poco audio de una persona real.')
 .glossary('Deepfake', 'Vídeo, imagen o audio falso hecho con IA que imita a una persona real: su cara (deepface) o su voz (deepvoice).')
 .glossary('Palabra clave', 'Palabra o pregunta secreta que solo conocéis tú y tu familia, para comprobar que quien llama es quien dice ser.')
 .glossary('Doble confirmación', 'Regla por la que un pago o un cambio de IBAN lo confirma por otro canal y autoriza una segunda persona.')
 .glossary('Anonimizar', 'Quitar o cambiar los datos que permiten reconocer a una persona, también cuando se combinan varios detalles.')
 .glossary('Prompt injection', 'Texto escondido en un documento o web que «da órdenes» a la IA que lo lee. Por eso no se le pide a una IA que lea contenido de origen desconocido.')
 .glossary('Jailbreak', 'Truco para engañar a una IA con instrucciones ingeniosas y que haga algo que tenía prohibido.')
 .glossary('Herramienta aprobada', 'Herramienta de IA que el centro ha contratado con garantías y que puedes usar solo para lo permitido.')
 .glossary('RGPD', 'Reglamento europeo de protección de datos personales. Usar IA no exime de cumplirlo.')
c.bib('INCIBE (s. f.). Deepfakes, ¿cómo se aprovechan de esta tecnología para engañarnos? INCIBE.', 'https://www.incibe.es/ciudadania/blog/deepfakes-como-se-aprovechan-de-esta-tecnologia-para-enganarnos')
 .bib('INCIBE (2024). Nuevo método de fraude usando la voz de un familiar creada con inteligencia artificial. Línea de Ayuda en Ciberseguridad.', 'https://www.incibe.es/linea-de-ayuda-en-ciberseguridad/casos-reales/nuevo-metodo-de-fraude-usando-la-voz-de-un-familiar-creada-con-inteligencia-artificial')
 .bib('INCIBE (2024). ¿Qué es el voice hacking? INCIBE.', 'https://www.incibe.es/ciudadania/blog/que-es-el-voice-hacking')
 .bib('INCIBE (s. f.). Inteligencia Artificial (IA) y ciberseguridad. INCIBE.', 'https://www.incibe.es/ciudadania/tematicas/inteligencia-artificial')
 .bib('Fortune (2024). Arup lost $25 million in Hong Kong deepfake scam. Fortune, 17 de mayo.', 'https://fortune.com/europe/2024/05/17/arup-deepfake-fraud-scam-victim-hong-kong-25-million-cfo')
 .bib('AEPD (2026). La AEPD publica un decálogo de recomendaciones para proteger la privacidad al usar IA. AEPD, 27 de enero.', 'https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/aepd-publica-decalogo-recomendaciones-proteger-privacidad-al-usar-ia')
 .bib('Ministerio de Sanidad (s. f.). Orientaciones para profesionales sanitarios en el uso de la IA. Estrategia de IA en el SNS.', 'https://www.sanidad.gob.es/areas/saludDigital/estrategiaIASNS/doc/IASNS_Orientaciones_para_profesionales_sanitarios_en_el_uso_de_la_IA.pdf')
 .bib('Comisión Europea (s. f.). Línea temporal de aplicación del Reglamento de IA. AI Act Service Desk.', 'https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act')
 .bib('Unión Europea (2026). Reglamento (UE) 2026/1744, Ómnibus digital sobre IA. BOE (DOUE-L-2026-81147).', 'https://www.boe.es/buscar/doc.php?id=DOUE-L-2026-81147')
 .bib('CCN-CERT (2024). Ciberamenazas y Tendencias 2024. Centro Criptológico Nacional.', 'https://www.ccn.cni.es/es/actualidad-ccn/1237-ciberespionaje-hacktivismo-y-ransomware-el-ccn-cert-advierte-de-las-tacticas-tecnicas-y-procedimientos-de-las-principales-ciberamenazas')

await c.build()
