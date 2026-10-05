/**
 * Curso 1 · Fundamentos: por qué importa la ciberseguridad en un centro sociosanitario.
 *   node scripts/curso-ciberseguridad/run.mjs c1-fundamentos.mjs
 * Fuente única de datos: docs/curso-ciberseguridad/fuentes/01-fundamentos.md (solo [L]; [S] sin cifras o con cautela).
 */
import { CourseBuilder, ix, fbk } from './lib.mjs'
import * as W from './widgets.mjs'
import { mapaResidencia, cadenaAtaque } from './c1-widgets.mjs'
import * as S from './c1-svgs.mjs'

const OBJ = [
  'Identificar qué información y qué servicios de un centro sociosanitario hay que proteger y por qué',
  'Reconocer las amenazas más habituales (ransomware, phishing, vishing, robo de dispositivos y errores) y cómo empiezan',
  'Aplicar los hábitos básicos de higiene digital en tu puesto de trabajo',
  'Clasificar la información según su sensibilidad y tratarla como corresponde',
  'Saber qué hacer ante un incidente y a quién avisar',
]

const c = new CourseBuilder({
  id: 'cibersegsoc-c1-fundamentos', identifier: 'CIBERSEG_C1',
  title: 'Fundamentos: por qué importa la ciberseguridad en un centro sociosanitario',
  subtitle: 'Qué cuidas, quién te ataca y qué haces tú: el curso de entrada',
  description: 'Curso de entrada del programa de ciberseguridad para centros sociosanitarios. En lenguaje llano y desde el móvil: qué información hay que proteger, cómo empiezan los ataques, los hábitos que te protegen y qué hacer (y a quién avisar) si algo falla.',
  hours: 1.7, primary: '#1d5fd1', accent: '#6DC3C0',
  moduleTitle: 'La ciberseguridad empieza en la planta', objectives: OBJ,
})

const img = (name, svgDoc) => c.asset(`assets/img/c1_${name}.svg`, svgDoc)
const A = {
  portada: img('portada', S.portada), l1: img('centro', S.l1), datos: img('datos_salud', S.datos), l2: img('ransomware', S.ransomware),
  l3: img('equipo', S.equipo), pilares: img('pilares', S.pilares), niveles: img('niveles', S.niveles), l5: img('alerta', S.alerta),
  l6: img('escudo', S.escudo), escena: img('escena_planta', S.escena),
}
// Nota de licencia: no se usan PNG del kit INCIBE (licencia de reutilización sin confirmar).

const EST = [['class="phone"', 240], ['id="stage"', 210], ['id="chain"', 300], ['id="map"', 360], ['id="pw"', 200], ['id="l"', 80]]
const html = (w, extra = {}) => ix.html({ ...w, prompt: '', est_seconds: (EST.find(([k]) => w.html.includes(k)) || [0, 150])[1], ...extra })

// ───────────────────────── Intro ─────────────────────────
c.intro({ type: 'cover', title: 'Ciberseguridad en el centro', text: '', img: { src: A.portada, alt: 'Un centro sociosanitario protegido por un escudo y un candado, con dos trabajadoras a los lados', full: true } })

// ───────────────────────── Lección 1 ─────────────────────────
const l1 = c.unit('Lección 1. Qué cuidas y por qué importa', 'Descubres qué información y qué servicios de un centro sociosanitario hay que proteger y por qué un fallo informático es también un problema de cuidados.')
l1.add({ type: 'cover', title: 'Qué cuidas y por qué importa', text: '', img: { src: A.l1, alt: 'Un centro sociosanitario rodeado de lo que hay que proteger: datos de salud, cuidados, dinero y confianza', full: true } })
  .add({
    title: 'Una noche sin tablet', obj: 0,
    text: 'Este curso es la puerta de entrada al programa: en unos 90 minutos verás qué cuidas, quién intenta atacarlo y qué haces tú. Empezamos con una historia inventada para pensar. Tú decides cada paso.',
    ix: html(W.chatStory({
      contacto: { nombre: 'Marta · turno de noche', emoji: '🌙', sub: 'Planta 2 · 03:10' },
      nodos: {
        n1: {
          msgs: [['sys', 'Son las 3:10. Una residente pide su medicación de la noche.'], ['them', 'La tablet no abre las pautas. Sale un mensaje raro y no me deja entrar. ¿Qué hacemos?']],
          choices: [
            { t: 'Pruebo a reiniciar y a teclear claves al azar hasta que abra', next: 'n2', q: 'bad', fb: 'Probar cosas a ciegas puede empeorar el problema y nadie se entera de que falla.' },
            { t: 'Doy la medicación «de memoria»: seguro que es la de siempre', next: 'finMem', q: 'bad', fb: 'Sin la pauta delante, una dosis o una alergia se pueden pasar por alto.' },
            { t: 'Paro, apunto qué ha pasado y aviso a la enfermera de guardia', next: 'n2', q: 'good', fb: 'Parar y avisar es lo más seguro.' },
          ],
        },
        n2: {
          msgs: [['sys', 'La enfermera de guardia llega con la hoja de pautas en papel de la carpeta de planta.'], ['them', 'Menos mal que está la hoja en papel. Ahora hay que contárselo al responsable del centro. ¿Qué haces?']],
          choices: [
            { t: 'Apunto la hora y lo que veo en pantalla, y se lo comunico', next: 'finGood', q: 'good', fb: 'Con esos datos, el responsable puede actuar rápido.' },
            { t: 'Lo dejo para mañana, a ver si se arregla solo', next: 'finLate', q: 'bad', fb: 'Un aviso tardío da ventaja a quien causó el problema.' },
          ],
        },
        finMem: { msgs: [['sys', 'La residente recibe la pauta sin comprobarla.']], fin: { tipo: 'bad', titulo: 'Un riesgo para la residente', texto: 'Sin una pauta fiable, un fallo informático se convierte en un problema de cuidados. Para eso existe el plan B en papel.' } },
        finLate: { msgs: [['sys', 'Pasan las horas y nadie sabe qué ocurrió.']], fin: { tipo: 'bad', titulo: 'Avisar pronto lo cambia todo', texto: 'Lo grave no es que algo falle, sino no contarlo. Equivocarse es humano; avisar a tiempo es lo que protege.' } },
        finGood: { msgs: [['sys', 'Por la mañana, el responsable ya tiene todo apuntado.']], fin: { tipo: 'good', titulo: '¡Bien resuelto!', texto: 'Pararte, usar el plan B en papel y avisar protegió a la residente. Eso también es ciberseguridad: cuidar cuando falla la tecnología.' } },
      },
    })),
  })
  .add({
    title: 'Lo que vas a lograr', type: 'objectives', obj: 0,
    text: 'Al terminar el curso sabrás:\n' + OBJ.map((o) => `- ${o[0].toLowerCase()}${o.slice(1)}.`).join('\n') + '\n\n::: tip\nVa a tu ritmo: puedes parar y seguir donde lo dejaste.\n:::',
  })
  .add({
    title: 'Los cuatro tesoros', obj: 0,
    text: 'Un centro sociosanitario guarda mucho más que ordenadores. Toca cada carta para ver qué hay detrás.',
    ix: ix.flip([
      ['🩺 **Datos de salud y vida privada**', 'Diagnósticos, medicación, caídas, informes, fotos, DNI, situación familiar. Son datos que la persona no ha elegido compartir con el mundo.'],
      ['⏱️ **Continuidad del cuidado**', 'Pautas, horarios, alergias, cambios posturales, citas, contacto con las familias. Si el sistema cae, el riesgo es clínico, no solo informático.'],
      ['💶 **Dinero**', 'Nóminas, facturas, cuentas del centro, pagos de las familias y, si los gestiona el centro, los fondos de las personas residentes.'],
      ['🤝 **Confianza**', 'Las familias dejan a su ser querido en tus manos. Una filtración de datos rompe esa confianza.'],
    ]),
  })
  .add({
    title: 'Los cuatro tesoros', obj: 0,
    text: 'Ahora tú: cada situación pone en riesgo uno de los cuatro tesoros.',
    ix: ix.match('Une cada situación con el tesoro que amenaza.', [
      ['Se filtra el informe de salud de una residente', 'Datos de salud'],
      ['De madrugada no se puede abrir la pauta de medicación', 'Continuidad del cuidado'],
      ['Un correo falso consigue una transferencia del centro', 'Dinero'],
      ['Las familias dejan de fiarse tras un incidente', 'Confianza'],
    ], fbk('¡Bien! Cada tesoro tiene su forma de romperse.', 'Alguna pareja no encaja. Piensa qué se pierde en cada caso.', 'Un solo incidente puede tocar varios tesoros a la vez: por eso protegerlos es cosa de todo el equipo.')),
  })
  .add({
    title: 'Por qué a un centro sociosanitario', obj: 0,
    text: 'Los criminales no eligen un centro sociosanitario concreto: **atacan a quien deja la puerta abierta**. Y los datos de salud tienen valor: INCIBE-CERT recoge que un expediente médico se paga entre 30 y 1.000 dólares en el mercado ilegal.\n\nAdemás, en el sector sanitario conviven sistemas nuevos y antiguos, y parar el servicio presiona a pagar.\n\n::: info\nNo hay casos públicos verificados de filtración de datos en centros sociosanitarios españoles; sí en hospitales y servicios de salud. Un centro sociosanitario tiene los mismos puntos débiles.\n:::',
    img: { src: A.datos, alt: 'Un expediente de salud protegido por un candado, con un anzuelo y un ojo que intentan llegar a él', layout: 'top', full: true, caption: 'Ilustración propia. Dato: INCIBE-CERT, «Ciberseguridad en el sector sanitario» (2024).' },
  })
  .add({
    title: 'Elige tu puesto', obj: 0,
    text: 'Cada puesto tiene sus riesgos. Toca el tuyo (y echa un vistazo a los demás).',
    ix: ix.tabs([
      ['Gerocultor/a', '- **Riesgo:** tablet o móvil de planta compartido, claves que sabemos todas, fotos de residentes en tu móvil personal, hablar de residentes en el pasillo.\n- **Hábito clave:** sesión personal, bloquear la pantalla, no compartir tu clave y avisar de lo raro.'],
      ['Enfermería', '- **Riesgo:** acceso a historias y a la medicación; un informe que sale a un destinatario equivocado; mirar historias «por curiosidad».\n- **Hábito clave:** entra solo a lo que necesitas para cuidar, revisa el destinatario antes de enviar y ten el plan B en papel.'],
      ['Administración', '- **Riesgo:** correos con facturas falsas, el «director» que pide una transferencia urgente, visitas que piden datos, papeles a la vista.\n- **Hábito clave:** verifica los pagos por otro canal, no abras adjuntos inesperados y usa la destructora.'],
      ['Dirección y supervisión', '- **Riesgo:** ser objetivo del fraude del director, decidir las notificaciones, tener cuentas con muchos permisos.\n- **Hábito clave:** tener claro el protocolo y a quién se llama, y no usar una sola cuenta para todo.'],
      ['Mantenimiento', '- **Riesgo:** acceso físico a salas de equipos y cableado, dispositivos nuevos (cámaras, wifi, domótica), proveedores externos.\n- **Hábito clave:** no conectes nada a la red del centro sin autorización y cambia las claves que vienen de fábrica.'],
    ]),
  })
  .add({
    type: 'summary', title: 'Lo esencial de la lección 1',
    text: '- Un centro sociosanitario protege **datos de salud, continuidad del cuidado, dinero y confianza**.\n- Un fallo informático es también un **problema de cuidados**.\n- Los atacantes buscan puertas abiertas, no centros concretos.\n- Ante un fallo: **para, anota y avisa**. Y ten siempre un plan B en papel.',
  })

// ───────────────────────── Lección 2 ─────────────────────────
const l2 = c.unit('Lección 2. Quién ataca y cómo', 'Conoces las amenazas más habituales, cómo avanza un ataque paso a paso y dos casos reales de servicios de salud.')
l2.add({ type: 'cover', title: 'Quién ataca y cómo', text: '', img: { src: A.l2, alt: 'Un ordenador con un mensaje de rescate de ejemplo que dice que los archivos están cifrados', full: true } })
  .add({
    title: 'Las amenazas de hoy', obj: 1,
    text: 'Casi todo empieza con una persona que hace clic, contesta una llamada o se descuida. Toca cada amenaza.',
    ix: ix.accordion([
      ['Phishing: el correo trampa', 'Un mensaje que se hace pasar por alguien de confianza (banco, Correos, Recursos Humanos) para que pinches o des datos. Según ENISA, es la puerta de entrada en cerca del 60 % de las intrusiones.\n\n**Qué haces:** no pinchas, miras quién lo envía y preguntas por otra vía.'],
      ['Vishing y smishing: la llamada o el SMS', 'Lo mismo, pero por teléfono o por mensaje de texto. Ejemplo: «Soy del soporte técnico, dame tu clave para arreglar la tablet».\n\n**Qué haces:** cuelgas y llamas tú al número que conoces.'],
      ['Ransomware: el secuestro de datos', 'Un programa impide abrir los archivos (los cifra) y pide dinero por devolverlos. INCIBE gestionó 392 incidentes de ransomware en 2025. A veces, además, roban los datos.\n\n**Qué haces:** no tocas más y avisas ya. Nunca pagas por tu cuenta.'],
      ['Virus y USB ajenos', 'Programas dañinos que roban información o toman el control del equipo. Un USB «con las fotos de la fiesta» puede traer uno.\n\n**Qué haces:** no conectas USB que no conoces y avisas.'],
      ['Robo o pérdida de dispositivos', 'Un móvil, tablet, portátil o USB con datos dentro que se pierde o se roba.\n\n**Qué haces:** bloqueo con clave, sin fotos de residentes en el móvil personal y avisas si lo pierdes.'],
      ['Errores humanos', 'Borrar un archivo o enviar un informe a la familia equivocada. La AEPD cita el envío de documentación con datos de salud a destinatarios incorrectos como una brecha frecuente.\n\n**Qué haces:** relees el destinatario antes de enviar y, si te equivocas, avisas.'],
    ]),
  })
  .add({
    title: 'Ransomware en un minuto', obj: 1,
    text: 'Mira este vídeo breve de INCIBE. Después verás cómo avanza un ataque de este tipo.',
    video: { id: 'vqwtLVfg7ns', caption: '«¿Qué es el ransomware?» · INCIBE (#AprendeCiberseguridad)', transcript: 'Vídeo breve de INCIBE (aproximadamente 1 minuto y 20 segundos) que explica qué es el ransomware: un tipo de programa dañino que impide acceder a los archivos, normalmente cifrándolos, y pide un rescate para devolverlos.' },
    notes: ['Verificar la transcripción viendo el vídeo (vqwtLVfg7ns): el dossier solo confirma título, canal y duración, no el contenido.'],
  })
  .add({
    title: 'La cadena de un ataque', obj: 1,
    text: 'Un ataque no es un golpe: es una **cadena**. Si cortas un eslabón, se rompe.',
    ix: html(cadenaAtaque({
      titulo: '',
      eslabones: [
        { t: 'Llega un correo trampa', d: 'Parece una factura o un aviso de Recursos Humanos, y trae un Excel adjunto.', corte: 'Ves algo raro: no abres el adjunto y avisas a tu responsable. El ataque muere antes de empezar. Es el corte más fácil y más barato.' },
        { t: 'Alguien abre el archivo', d: 'Un clic basta para que se instale un programa espía en ese ordenador.', corte: 'Abriste el archivo, pero te das cuenta enseguida y avisas. Se aísla ese equipo a tiempo. Equivocarse es humano; avisar pronto es lo que protege.' },
        { t: 'El atacante se queda a mirar', d: 'Durante días o semanas explora la red sin hacer ruido. En el caso del servicio de salud irlandés pasaron ocho semanas entre el clic y el cifrado.', corte: 'Alguien nota que un equipo va raro o salta una alerta, y se avisa: el equipo técnico puede cortar la entrada. En el caso irlandés hubo alertas que no se escalaron.' },
        { t: 'Se hace con las claves', d: 'Roba contraseñas y salta de un equipo a otro hasta llegar a los datos importantes.', corte: 'Claves personales y únicas, y cada persona con acceso solo a lo suyo: el atacante no consigue la llave de los datos de salud.' },
        { t: 'Cifra (y a veces copia) los datos', d: 'De golpe, los archivos dejan de abrirse. A veces antes se llevan una copia.', corte: 'Con copias de seguridad probadas y guardadas fuera de la red se puede recuperar sin pagar. Eso depende de que el centro lo tenga previsto.' },
        { t: 'Mensaje de rescate', d: 'Piden dinero. El centro vuelve al papel y al bolígrafo.' },
      ],
      cierre: 'Cada eslabón que pasó fue una oportunidad perdida de cortar. INCIBE aconseja que en ningún caso se pague el rescate.',
    })),
  })
  .add({
    title: 'Cuando pasa en España', obj: 1,
    text: 'No es ciencia ficción. En marzo de 2023, un ataque de ransomware golpeó el **Hospital Clínic de Barcelona**: urgencias, laboratorio y farmacia tuvieron que trabajar con procedimientos manuales.\n\nLos atacantes pidieron 4,5 millones de dólares y las autoridades dijeron que no pagarían. Cinco días después se había recuperado el 40 % de la actividad quirúrgica y el 70 % de las consultas externas.\n\n::: reflect\nSi le pasa a un gran hospital, ¿qué le puede pasar a un centro más pequeño sin plan B?\n:::\n\n::: info\nSon casos de hospitales; no hay casos públicos verificados de filtración de datos en centros sociosanitarios españoles.\n:::',
  })
  .add({
    title: 'Un clic, ocho semanas después', obj: 1,
    text: 'El servicio de salud irlandés (HSE) publicó un informe independiente sobre su ataque de 2021. Toca cada hito.',
    ix: ix.timeline([
      ['16 mar 2021', 'Llega un correo', 'Un correo de phishing con un archivo Excel adjunto llega a un equipo del HSE.'],
      ['18 mar 2021', 'Alguien abre el archivo', 'Una persona abre el Excel y ese equipo se infecta. El informe lo llama «paciente cero».'],
      ['8 semanas', 'El atacante, dentro y callado', 'Pasa ocho semanas en la red. Hubo alertas que no llegaron a escalarse.'],
      ['14 may 2021', 'El ransomware se activa', 'Según la dirección del HSE, el 80 % de su entorno quedó cifrado.'],
      ['Meses', 'Papel y bolígrafo', 'El personal volvió al papel y la recuperación llevó más de cuatro meses.'],
    ], 'Fuente: informe independiente encargado por la Junta del HSE (3 de diciembre de 2021).'),
  })
  .add({
    title: 'La llamada de soporte', obj: 1,
    text: 'Estás en recepción y suena el teléfono. Es un ejemplo inventado, pero muy parecido a lo real.',
    ix: html(W.chatStory({
      estilo: 'llamada', contacto: { nombre: 'Soporte técnico', emoji: '🎧', sub: 'llamada entrante' },
      nodos: {
        n1: {
          msgs: [['sys', 'Suena el teléfono de recepción.'], ['them', 'Buenos días, soy del soporte técnico. Hemos detectado un virus en la tablet de su planta. Necesito su usuario y su contraseña para arreglarlo ahora mismo.']],
          choices: [
            { t: 'Se las doy: es soporte técnico y quiero que se arregle', next: 'bad', q: 'bad', fb: 'Quien llama por sorpresa pidiendo claves no es soporte legítimo.' },
            { t: 'Le pido su nombre y que me explique qué ha detectado', next: 'n2', q: 'mid', fb: 'Bien preguntar, pero fíjate cómo reacciona.' },
            { t: 'Cuelgo y aviso a mi responsable', next: 'good', q: 'good', fb: 'Este es el reflejo correcto.' },
          ],
        },
        n2: {
          msgs: [['them', 'No hay tiempo para explicaciones. Si no me da la clave ahora, bloqueamos el equipo y se perderán los datos de los residentes.']],
          choices: [
            { t: 'Cedo: no quiero que se pierdan los datos', next: 'bad', q: 'bad', fb: 'Prisa y amenaza son justo las señales de alarma.' },
            { t: 'Cuelgo: la prisa y la amenaza son señales de alarma', next: 'good', q: 'good', fb: '¡Muy bien visto!' },
          ],
        },
        bad: { msgs: [['sys', 'Les has dado acceso.']], fin: { tipo: 'bad', titulo: 'Acceso comprometido', texto: 'Dar tu clave a un desconocido le abre la puerta a los datos de las personas residentes. Si te pasa, avisa enseguida: cuanto antes, menos daño.' } },
        good: { msgs: [['sys', 'Llamada finalizada.']], fin: { tipo: 'good', titulo: 'Reflejo correcto', texto: 'El soporte legítimo no te llama por sorpresa para pedirte la contraseña. Cuelga, llama tú al número que conoces y avisa a tu responsable.' } },
      },
    })),
  })
  .add({
    title: '¿Fraude o legítimo?', obj: 1,
    text: 'Seis mensajes de un día cualquiera. Desliza o usa los botones.',
    ix: html(W.swipeDeck({
      titulo: '',
      cards: [
        { canal: '✉️ Correo', de: 'Recursos Humanos <rrhh@residenc1a-sol.com>', asunto: 'Actualiza tu nómina hoy', texto: 'Pulsa aquí en 24 horas o perderás el cobro de este mes.', fraude: true, pistas: ['El dominio lleva un 1 en lugar de una i', 'Urgencia y amenaza', 'Te piden «actualizar» datos con un enlace'], porque: 'Ningún servicio serio te amenaza con perder el cobro en 24 horas.' },
        { canal: '💬 WhatsApp', de: 'Supervisora (número de tu agenda)', texto: 'El cuadrante de la semana que viene está en la carpeta compartida de siempre. Si hay cambios, dímelo.', fraude: false, pistas: ['Número conocido y canal habitual', 'Sin enlaces ni peticiones de datos'], porque: 'Es lo que esperas, por el canal de siempre y sin pedirte nada raro.' },
        { canal: '📞 Llamada', de: 'Número desconocido', texto: 'Soy del soporte técnico. Su tablet está infectada. Dígame su contraseña y se lo arreglo.', fraude: true, pistas: ['Llamada inesperada', 'Te piden la contraseña'], porque: 'El soporte real no necesita tu contraseña. Cuelga y llama tú al número que conoces.' },
        { canal: '📱 SMS', de: 'Correos', texto: 'Tu paquete está retenido. Paga 1,99 € de tasas aquí: correos-envio.top/pago', fraude: true, pistas: ['Pide un pago pequeño con un enlace', 'El dominio acaba en .top y no es el de Correos'], porque: 'Es smishing: un pago pequeño para robarte los datos de la tarjeta.' },
        { canal: '✉️ Correo', de: 'Dirección <direccion@centro-solmar.com>', asunto: 'Urgente', texto: 'Necesito hoy una transferencia a esta cuenta nueva. No se lo cuentes a nadie.', fraude: true, pistas: ['Urgencia + secreto + dinero', 'Cuenta nueva'], porque: 'Es el «fraude del director». Verifica por teléfono, con un número que ya conozcas.' },
        { canal: '✉️ Correo', de: 'Tu responsable de planta', asunto: 'Reunión de equipo el jueves', texto: 'Recordad que el jueves a las 16:00 tenemos reunión en la sala de personal.', fraude: false, pistas: ['Sin enlaces, urgencia ni dinero', 'Es lo esperable'], porque: 'No pide nada raro y encaja con tu rutina. No todo es un fraude.' },
      ],
    })),
  })
  .add({
    title: 'Phishing en un minuto', obj: 1,
    text: 'Un repaso rápido del correo trampa, y luego practicas con enlaces.',
    video: { id: 'uhzV5-iFb5E', caption: '«¿Qué es el phishing?» · INCIBE (#AprendeCiberseguridad)', transcript: 'Vídeo breve de INCIBE (aproximadamente 1 minuto y 25 segundos) que explica qué es el phishing: el engaño que suplanta a una entidad o persona de confianza, normalmente por correo, para conseguir datos o que la víctima pinche un enlace.' },
    notes: ['Verificar la transcripción viendo el vídeo (uhzV5-iFb5E).'],
  })
  .add({
    title: 'Inspecciona el enlace', obj: 1,
    text: 'Lo que importa de un enlace es el dominio: lo que va justo antes de la primera barra.',
    ix: html(W.urlLab({ titulo: '', urls: [
      { partes: ['https://', 'www.', 'correos', '.es', '/seguimiento'], dominio: 2, fiable: true, porque: 'El dominio es correos.es y el enlace va directo a la web.' },
      { partes: ['https://', 'correos', '.es', '.envio-seguro', '.top', '/pago'], dominio: 3, fiable: false, porque: 'El dominio real es envio-seguro.top: «correos.es» es solo un disfraz delante.' },
      { partes: ['https://', 'rrhh', '.mi-residenc1a', '.com', '/nomina'], dominio: 2, fiable: false, porque: 'El dominio mi-residenc1a.com lleva un 1 en lugar de una i: imita al del centro. Pregunta por otra vía.' },
    ] })),
  })
  .add({
    title: 'Cada caso, su amenaza', obj: 1,
    text: 'Ponemos a prueba lo visto.',
    ix: ix.classify('Arrastra cada situación a su amenaza.', [['r', 'Ransomware'], ['p', 'Phishing o vishing'], ['e', 'Error humano'], ['d', 'Pérdida o robo']], [
      ['Aparece un mensaje que exige dinero para devolver los archivos', 'r'],
      ['«Soy del soporte técnico, dame tu clave»', 'p'],
      ['Envías el informe a la familia equivocada', 'e'],
      ['Pierdes el móvil con fotos de residentes', 'd'],
      ['Un correo falso de RR. HH. con un enlace', 'p'],
      ['El programa de gestión no abre y sale una nota de rescate', 'r'],
    ], fbk('¡Muy bien! Reconoces cada amenaza.', 'Alguna situación está en otro grupo. Revisa cuál.', 'Reconocer la amenaza ayuda a elegir el reflejo correcto: colgar, no tocar y avisar, releer el destinatario o avisar de la pérdida.')),
  })
  .add({
    type: 'summary', title: 'Lo esencial de la lección 2',
    text: '- Casi todo empieza con una **persona**: un clic, una llamada, un descuido.\n- Un ataque es una **cadena**: cada eslabón es una oportunidad de cortarla.\n- Los casos reales (Hospital Clínic, HSE) obligaron a trabajar con **papel y bolígrafo**.\n- Ante una llamada o un mensaje raro: **para y pregunta por otra vía**.',
  })

// ───────────────────────── Lección 3 ─────────────────────────
const l3 = c.unit('Lección 3. El factor humano: tú eres la defensa', 'Entiendes por qué funcionan los engaños y adoptas los hábitos básicos que te protegen en tu puesto.')
l3.add({ type: 'cover', title: 'Tú eres la defensa', text: '', img: { src: A.l3, alt: 'Cuatro profesionales de un centro sociosanitario, cada una con un escudo de protección sobre la cabeza', full: true } })
  .add({
    title: 'Por qué funciona el engaño', obj: 2,
    text: 'Los atacantes rara vez fuerzan la cerradura: **te piden la llave** con una excusa convincente. Juegan con la urgencia, el miedo, la autoridad, la curiosidad y tu amabilidad.\n\n::: tip\nPrisa + secreto + petición de datos o dinero = **para y pregunta**.\n:::',
    video: { id: 'SSjdJgINu2E', caption: '«¿Qué es la ingeniería social?» · Oficina de Seguridad del Internauta (INCIBE)', transcript: 'Vídeo de la Oficina de Seguridad del Internauta (INCIBE), de unos 3 minutos, sobre qué es la ingeniería social: engañar a las personas, no a las máquinas, para conseguir información o acceso.' },
    notes: ['Verificar la transcripción viendo el vídeo (SSjdJgINu2E): el dossier solo confirma título, canal y duración.'],
  })
  .add({
    title: 'Los hábitos de la planta', obj: 2,
    text: 'Seis hábitos sencillos que cubren casi todo. Toca cada uno.',
    ix: ix.accordion([
      ['Bloquea la pantalla', 'Cada vez que te levantes, aunque sea un minuto. En el ordenador, pulsa la tecla **Windows + L**; en la tablet, el botón de bloqueo.'],
      ['Tu clave es personal', 'Secreta, única, sin anotar ni compartir. La típica «clave de la tablet de planta que sabemos todas» es un riesgo: cada persona, su acceso.'],
      ['No pinches: escribe tú la dirección', 'Ante un enlace sospechoso, no pinches. Escribe tú la dirección de la web o pregunta antes.'],
      ['No instales ni uses software pirata', 'No instales apps ni cambies la configuración de los móviles del centro. Actualiza cuando se te pida y no ignores los avisos del antivirus.'],
      ['Equipos y papeles', 'No uses equipos personales para datos del centro. El papel con datos va a la **destructora**, no a la papelera, y la mesa se queda limpia al terminar.'],
      ['Boca cerrada y, ante la duda, avisa', 'No hables de residentes donde puedan oírte (pasillo, cafetería). Y ante cualquier cosa rara, avisa: **todos somos seguridad**.'],
    ]),
  })
  .add({
    title: 'Prueba tu contraseña', obj: 2,
    text: 'Prueba con contraseñas **inventadas** y mira cuánto tardaría un programa en adivinarlas.',
    ix: html(W.passwordLab()),
  })
  .add({
    title: 'Mapa del centro', obj: 2,
    text: 'Cada zona tiene su riesgo. Descúbrelos y aplica hábitos hasta bajar el riesgo global.',
    ix: html(mapaResidencia({
      titulo: '',
      zonas: [
        { n: 'Recepción', l: 'Recepción', e: '🛎️', riesgos: ['Visitas que piden datos o un favor «rápido»', 'Llamadas de falso «soporte técnico»', 'Papeles y USB que llegan de fuera'], habitos: ['Bloqueo la pantalla cada vez que me levanto', 'No conecto USB que no conozco y aviso'] },
        { n: 'Planta y habitaciones', l: 'Planta', e: '🛏️', riesgos: ['Tablet o móvil compartido con la clave pegada', 'Fotos de residentes en el móvil personal', 'Hablar de residentes donde pueden oírte'], habitos: ['Uso mi sesión personal y no comparto mi clave', 'Nada de fotos de residentes en mi móvil personal'] },
        { n: 'Cuarto técnico', l: 'Cuarto\ntécnico', e: '🖥️', riesgos: ['Cualquiera con acceso físico a equipos y cables', 'Equipos antiguos sin actualizar', 'Dispositivos nuevos conectados sin permiso'], habitos: ['Mantengo la puerta cerrada y solo entra personal autorizado', 'No conecto nada a la red sin autorización y cambio las claves de fábrica'] },
        { n: 'Despacho', l: 'Despacho', e: '🗂️', riesgos: ['Facturas falsas y adjuntos inesperados', 'El «director» que pide una transferencia urgente', 'Papeles con datos sobre la mesa'], habitos: ['Verifico pagos y cambios de cuenta por teléfono, con un número conocido', 'El papel con datos va a la destructora'] },
        { n: 'Casa del trabajador', l: 'Casa y\nmóvil propio', e: '🏠', riesgos: ['Móvil perdido con datos del centro', 'Wifi abierta de una cafetería', 'Equipos personales con documentos del centro'], habitos: ['Mi móvil lleva bloqueo y desconfío de las wifis abiertas', 'No uso equipos personales para datos del centro y aviso si pierdo algo'] },
      ],
    })),
  })
  .add({
    title: 'Encuentra los fallos', obj: 2,
    text: 'Esta sala de enfermería tiene cinco fallos de seguridad y dos cosas bien hechas. Toca los objetos para descubrirlos.',
    ix: ix.hotspots(A.escena, 'Sala de enfermería con una tablet con una clave pegada, un ordenador con la sesión abierta y sin nadie, papeles sobre el mostrador, un USB suelto, un móvil personal con una foto, una destructora de papel y una carpeta de pautas en papel', S.escenaSpots, 'Toca los objetos de la sala: ¿fallo o está bien?', fbk('¡Bien visto!', 'Fíjate de nuevo.', 'Cinco fallos: clave pegada, sesión abierta, papeles a la vista, USB desconocido y foto en móvil personal.')),
  })
  .add({
    title: 'Tablet de planta', obj: 2,
    text: 'Un caso de planta.',
    ix: ix.scenario('Gerocultora, turno de tarde. La tablet de planta está bloqueada por un cambio de clave. Una compañera te dice: «Tranquila, yo me sé la de todas, usa la mía».', '¿Qué haces?', [
      ['Uso la sesión de mi compañera para no perder tiempo', false, 'Lo que hagas quedará a nombre de ella, y compartir claves es un riesgo.'],
      ['Pido a supervisión que me dé acceso con mi usuario y mientras sigo con la hoja en papel', true, 'Cada persona con su acceso y el plan B en papel mientras tanto.'],
      ['Anoto la clave en un post-it para la próxima vez', false, 'Un post-it con la clave la deja a la vista de cualquiera.'],
    ], fbk('¡Correcto!', 'No es la mejor opción.', 'La clave es personal: así se sabe quién hizo qué y se protege a las personas residentes. Si el acceso no funciona, se avisa a supervisión.')),
  })
  .add({
    title: 'El fraude del director', obj: 2,
    text: 'La Guardia Civil explica cómo funciona este fraude y cómo evitarlo.',
    video: { id: 'o_GRQYiNRsk', caption: '«¿Cómo evitar el fraude del CEO?» · Guardia Civil', transcript: 'Vídeo de la Guardia Civil (aproximadamente 1 minuto y 30 segundos) sobre el fraude del CEO: alguien se hace pasar por la dirección de una empresa para pedir una transferencia urgente, y cómo evitarlo verificando la petición por otra vía.' },
    notes: ['Verificar la transcripción viendo el vídeo (o_GRQYiNRsk).'],
  })
  .add({
    title: 'Un proveedor con prisa', obj: 2,
    text: 'Ahora, desde mantenimiento.',
    ix: ix.scenario('Mantenimiento. Un proveedor de cámaras llega con un equipo y te pide conectarlo ya a la red del centro «para no perder la mañana».', '¿Qué haces?', [
      ['Lo conecto: viene recomendado y tiene prisa', false, 'Un equipo nuevo en la red puede abrir una puerta sin que nadie lo sepa.'],
      ['Le pido que espere y consulto a mi responsable antes de conectar nada', true, 'Nada se conecta a la red sin autorización.'],
      ['Lo conecto pero dejo la clave de fábrica para que sea fácil', false, 'Las claves de fábrica son las primeras que prueban los atacantes.'],
    ], fbk('¡Correcto!', 'No es la mejor opción.', 'Todo dispositivo nuevo pasa por autorización, y se cambian las claves de fábrica.')),
  })
  .add({
    title: 'Correo del director', obj: 2,
    text: 'Ahora, desde administración.',
    ix: ix.scenario('Administración. Son las 18:00 y llega un correo de «dirección»: pide una transferencia urgente a una cuenta nueva y que no se lo cuentes a nadie.', '¿Qué haces?', [
      ['Hago la transferencia: viene de dirección', false, 'Urgencia, secreto y dinero juntos son la señal clásica del fraude.'],
      ['Llamo a dirección por teléfono, a un número que ya tengo, antes de hacer nada', true, 'Verificar por otro canal conocido desbarata el engaño.'],
      ['Contesto al correo pidiendo que me lo confirme', false, 'Si el correo es falso, quien responde es el mismo estafador.'],
    ], fbk('¡Muy bien!', 'Piénsalo de nuevo.', 'Verifica siempre por un canal que ya conozcas, no por el mismo correo. Y avisa a tu responsable.')),
  })
  .add({
    type: 'summary', title: 'Lo esencial de la lección 3',
    text: '- Los engaños juegan con la **prisa, el miedo, la autoridad y tu amabilidad**.\n- Seis hábitos: bloquear, clave personal, no pinchar, no instalar, destructora y **avisar**.\n- El riesgo **nunca llega a cero**: por eso se avisa ante la duda.\n- Verifica por **otro canal** lo que te pidan con prisa o en secreto.',
  })

// ───────────────────────── Lección 4 ─────────────────────────
const l4 = c.unit('Lección 4. Tipos de información y cómo tratarla', 'Distingues los tres pilares de la información y los cuatro niveles de protección, y sabes a qué información puedes acceder.')
l4.add({ type: 'cover', title: 'Tipos de información', text: '', img: { src: A.pilares, alt: 'Tres tarjetas: disponibilidad, integridad y confidencialidad', full: true } })
  .add({
    title: 'Los tres pilares', obj: 3,
    text: 'Proteger la información es cuidar tres cosas, con ejemplos de la planta:\n\n- **Disponibilidad:** poder abrir la pauta cuando hace falta.\n- **Integridad:** que la pauta no haya sido cambiada.\n- **Confidencialidad:** que solo la vea quien la cuida.\n\nAhora, ponlos a prueba.',
    ix: ix.match('¿Qué pilar se rompe en cada caso?', [
      ['La tablet no abre la pauta de medicación', 'Disponibilidad'],
      ['Alguien cambia la dosis escrita en un informe', 'Integridad'],
      ['El informe de una residente llega a otra familia', 'Confidencialidad'],
    ], fbk('¡Correcto!', 'Revisa alguna pareja.', 'Una misma situación puede romper más de un pilar, pero en cada caso hay uno que es el principal.')),
  })
  .add({
    title: 'Cuatro niveles', obj: 3,
    text: 'No toda la información pide la misma protección. Esta propuesta de cuatro niveles está inspirada en el kit de concienciación de INCIBE y adaptada a un centro sociosanitario.\n\n::: fact\n**Dato personal** es cualquier información sobre una persona identificada o identificable: el DNI, una foto o un nombre en la pizarra de la planta.\n:::',
    img: { src: A.niveles, alt: 'Cuatro niveles de información de mayor a menor protección con ejemplos de un centro sociosanitario', layout: 'top', full: true, caption: 'Propuesta didáctica adaptada de los niveles del kit de concienciación de INCIBE.' },
  })
  .add({
    title: 'Cuatro niveles', obj: 3,
    text: 'Ahora clasifica tú.',
    ix: ix.classify('Arrastra cada elemento a su nivel de protección.', [['r', 'Restringida'], ['c', 'Confidencial'], ['i', 'Uso interno'], ['p', 'Pública']], [
      ['Historia clínica de una residente', 'r'], ['Foto de una herida', 'r'], ['Informe de psicología', 'r'],
      ['Nómina de una trabajadora', 'c'], ['Cuentas bancarias del centro', 'c'],
      ['Cuadrante del mes', 'i'], ['Protocolo interno de limpieza', 'i'],
      ['Menú semanal publicado', 'p'], ['Web del centro', 'p'],
    ], fbk('¡Muy bien!', 'Alguno está en otro nivel.', 'Cuanto más daño haría una filtración a las personas, más protección necesita.')),
  })
  .add({
    title: 'Solo lo que necesitas', obj: 3,
    text: 'Cada persona debe acceder solo a la información que necesita para su trabajo: ni más ni menos.',
    ix: ix.scenario('Enfermería. En la lista de ingresos ves el nombre de una vecina del pueblo. Te pica la curiosidad por abrir su historia, aunque no es tu residente.', '¿Qué haces?', [
      ['Entro un momento: no se lo voy a contar a nadie', false, 'Aunque no lo cuentes, el simple acceso injustificado ya puede traer consecuencias.'],
      ['No entro: solo accedo a las historias de las personas a las que cuido', true, 'Acceso solo por necesidad de tu trabajo.'],
      ['Entro y dejo la sesión abierta para que no se note', false, 'Dejar la sesión abierta empeora la situación.'],
    ], fbk('¡Correcto!', 'No es la opción adecuada.', 'La AEPD advierte de que el acceso indebido a historias clínicas puede suponer sanción, indemnización y, según los casos, responsabilidad penal. No hace falta contarlo a nadie para que haya consecuencias.')),
  })
  .add({
    type: 'summary', title: 'Lo esencial de la lección 4',
    text: '- Tres pilares: **que esté, que sea cierta y que solo la vea quien debe**.\n- Cuatro niveles: **restringida, confidencial, uso interno y pública**.\n- Accedes **solo a lo que necesitas** para tu trabajo.\n- Papel con datos a la **destructora**, y cuidado con los datos ocultos de archivos y fotos.',
  })

// ───────────────────────── Lección 5 ─────────────────────────
const l5 = c.unit('Lección 5. Reflejos ante un incidente: qué hago y a quién aviso', 'Reconoces las señales de que algo va mal, aplicas los reflejos básicos y sabes a quién se avisa.')
l5.add({ type: 'cover', title: 'Reflejos ante un incidente', text: '', img: { src: A.l5, alt: 'Un móvil con el número 017, un aviso de alerta y tres pasos: para, anota, avisa', full: true } })
  .add({
    title: 'Señales de que algo va mal', obj: 4,
    text: 'Si dudas, **ya es motivo para avisar**. Equivocarse es humano; lo grave es no contarlo.',
    ix: ix.accordion([
      ['En tu equipo', 'Archivos que no se abren o con extensiones raras. Un mensaje que pide dinero. El ordenador va lentísimo o hace cosas solo.'],
      ['En lo que has hecho', 'Diste una clave a quien no debías, enviaste datos a quien no era, o pinchaste un enlace y luego dudaste.'],
      ['Pérdidas', 'Has perdido un móvil, un USB o papeles con datos.'],
      ['En lo que ves', 'Alguien curioseando historias que no le tocan, o una persona en una zona donde no debería estar.'],
    ]),
  })
  .add({
    title: 'Los cuatro reflejos', obj: 4,
    text: 'Esta secuencia es una propuesta didáctica: pon en orden qué haces.',
    ix: ix.sort('Ordena los reflejos ante un incidente.', [
      '**Para:** no pagues, no contestes y no borres «para disimular»',
      '**Anota:** haz una captura o apunta hora, mensaje y remitente, si es seguro',
      '**Avisa** a tu responsable inmediato o a la persona de contacto del centro',
      '**Colabora:** sigue sus indicaciones; las notificaciones externas las decide el centro',
    ], fbk('¡Orden correcto!', 'Alguno va antes. Piensa qué haces primero.', 'Primero se evita empeorar, luego se recoge lo que ves, se avisa y se colabora. Tú no decides las notificaciones externas.')),
  })
  .add({
    title: 'Lunes, 8:00 en dirección', obj: 4,
    text: 'Ahora te toca estar al otro lado: eres quien dirige el centro. Historia inventada.',
    ix: html(W.chatStory({
      contacto: { nombre: 'Marta · administración', emoji: '💻', sub: 'Lunes · 8:00' },
      nodos: {
        n1: {
          msgs: [['them', 'Buenos días. Los ordenadores del despacho enseñan un mensaje: «tus archivos están cifrados, paga o los perderás». ¿Qué hacemos?']],
          choices: [
            { t: 'Que lo arreglen reiniciando todo cuanto antes', next: 'finMal', q: 'bad', fb: 'Tocar más puede propagar el daño y borrar pistas.' },
            { t: 'Que no se toque nada más y que se avise a quien lleva la protección de datos', next: 'n2', q: 'good', fb: 'Primero, no empeorar y avisar.' },
            { t: 'Seguimos trabajando como si nada', next: 'finMal', q: 'bad', fb: 'Ignorarlo da ventaja a quien ataca.' },
          ],
        },
        n2: {
          msgs: [['them', 'Hecho. ¿A quién avisamos ahora?']],
          choices: [
            { t: 'Al responsable de seguridad o de protección de datos y al 017 de INCIBE para que nos orienten', next: 'n3', q: 'good', fb: 'El 017 es gratuito y confidencial.' },
            { t: 'A las familias, antes de saber qué ha pasado', next: 'n3', q: 'mid', fb: 'Habrá que informar, pero primero hay que saber qué ha ocurrido.' },
          ],
        },
        n3: {
          msgs: [['them', 'Nos dicen que, si hay datos personales afectados, hay que valorar notificarlo a la AEPD en un máximo de 72 horas. ¿Cómo lo hacemos?']],
          choices: [
            { t: 'Apuntamos desde cuándo lo sabemos: las 72 horas cuentan también en fin de semana', next: 'finBien', q: 'good', fb: 'El plazo corre desde que se tiene constancia.' },
            { t: 'Esperamos a la semana que viene para tener más información', next: 'finMal2', q: 'bad', fb: 'El plazo cuenta fines de semana y festivos.' },
          ],
        },
        finBien: { msgs: [['sys', 'El centro tiene un registro claro y sabe a quién llamar.']], fin: { tipo: 'good', titulo: 'Buena respuesta', texto: 'No pagar por impulso, parar, avisar a quien corresponde (incluido el 017) y vigilar el plazo de la AEPD si hay datos personales. Cuanto antes se avise, menos daño.' } },
        finMal: { msgs: [['sys', 'El problema se extiende por más equipos.']], fin: { tipo: 'bad', titulo: 'Se complica', texto: 'Ante un mensaje de rescate: no tocar más y avisar a quien corresponde. Tampoco se paga por impulso.' } },
        finMal2: { msgs: [['sys', 'Se pasa el plazo sin decidir.']], fin: { tipo: 'bad', titulo: 'Plazo en riesgo', texto: 'La notificación a la AEPD, si procede, es como máximo a las 72 horas desde que se tiene constancia, y cuentan los fines de semana.' } },
      },
    })),
  })
  .add({
    title: 'A quién se avisa', obj: 4,
    text: '- **Tu responsable o la persona de contacto del centro:** siempre el primero. Pregunta quién es.\n- **017 (INCIBE):** ayuda gratuita y confidencial, de 8:00 a 23:00 todos los días. También por WhatsApp (900 116 117) y Telegram (@INCIBE017).\n- **AEPD:** si hay datos personales afectados, lo notifica el centro como máximo en 72 horas desde que lo sabe.\n- **Policía Nacional o Guardia Civil:** para denunciar un delito (estafa, extorsión).\n\n::: warn\nPara una emergencia de salud o de seguridad física, sigue siendo el **112**.\n:::',
    video: { id: 'TWKvYnz6mL0', caption: '«Tu Ayuda en Ciberseguridad - Línea 017» · INCIBE', transcript: 'Vídeo de INCIBE, de unos 40 segundos, que presenta la Línea de Ayuda en Ciberseguridad 017, un servicio gratuito y confidencial al que se puede recurrir ante dudas o incidentes de ciberseguridad.' },
    notes: ['Verificar la transcripción viendo el vídeo (TWKvYnz6mL0).', 'Pedir al centro que defina la persona de contacto antes de lanzar el curso.'],
  })
  .add({
    title: 'Brechas de datos', obj: 4,
    text: 'Una brecha es cuando datos personales se pierden, se alteran o los ve quien no debe. La AEPD publica este vídeo con medidas para evitarlas.',
    video: { id: 'vTEs11IdvYE', caption: '«5 medidas técnicas para evitar brechas de datos personales» · AEPD', transcript: 'Vídeo de la Agencia Española de Protección de Datos (aproximadamente 1 minuto) con cinco medidas técnicas para evitar brechas de datos personales.' },
    notes: ['Verificar la transcripción viendo el vídeo (vTEs11IdvYE): el dossier solo confirma título, canal y duración.'],
  })
  .add({
    title: 'El plazo de las 72 horas', obj: 4,
    text: 'Una pieza clave para quien dirige el centro, y que conviene que todos conozcan.',
    ix: ix.fill('Completa la frase.', 'Si hay una brecha con datos personales y riesgo para las personas, el centro la notifica a la [[AEPD]] como máximo en [[72 horas]] desde que tiene constancia, [[incluso]] en fines de semana y festivos.', ['INCIBE', '24 horas', 'excepto', 'siete días'], fbk('¡Correcto!', 'Revisa alguna palabra.', 'Lo notifica el centro (el responsable del tratamiento), no cada trabajador. Tu papel: avisar ya.')),
  })
  .add({
    title: '¿A quién llamo?', obj: 4,
    text: 'Une cada situación con a quién se avisa.',
    ix: ix.match('Une cada situación con quién interviene.', [
      ['Veo un mensaje de rescate en mi ordenador', 'Mi responsable, de inmediato'],
      ['Tengo una duda de ciberseguridad y quiero ayuda gratuita y confidencial', '017 de INCIBE'],
      ['El centro sufre una brecha con datos personales', 'AEPD, avisada por el centro'],
      ['Me han estafado o extorsionado', 'Policía Nacional o Guardia Civil'],
    ], fbk('¡Muy bien!', 'Alguna pareja no encaja.', 'Tú avisas siempre primero a tu responsable; el centro decide qué otras notificaciones hacen falta.')),
  })
  .add({
    title: 'Un móvil perdido', obj: 4,
    text: 'Un último caso.',
    ix: ix.scenario('Llegas a casa y ves que has perdido tu móvil personal, donde tenías fotos de residentes hechas «para la familia».', '¿Qué haces?', [
      ['Espero unos días a ver si aparece', false, 'Cada hora que pasa es una oportunidad para quien lo encuentre.'],
      ['Aviso a mi responsable ya: es un incidente', true, 'Avisar pronto permite al centro decidir qué hacer.'],
      ['Lo borro a distancia y no digo nada para no liarla', false, 'Callarlo impide que el centro valore el daño.'],
    ], fbk('¡Correcto!', 'No es la mejor opción.', 'Perder un dispositivo con datos es un incidente: se avisa cuanto antes. Y, para que no vuelva a pasar, sigue el protocolo del centro sobre fotos de residentes.')),
  })
  .add({
    type: 'summary', title: 'Lo esencial de la lección 5',
    text: '- Detecta, **para y avisa**: cuanto antes se avise, menos daño.\n- Anota lo que ves y **no pagues** ni borres nada por tu cuenta.\n- Siempre avisas **primero a tu responsable**.\n- Ayuda gratuita y confidencial: **017** de INCIBE. Con datos personales afectados, el centro valora notificar a la AEPD en **72 horas**.',
  })

// ───────────────────────── Lección 6 ─────────────────────────
const l6 = c.unit('Lección 6. Repaso y reto', 'Repasas lo aprendido, juegas con las palabras clave y firmas tu compromiso.')
l6.add({ type: 'cover', title: 'Repaso y reto', text: '', img: { src: A.l6, alt: 'Un gran escudo con una marca de verificación rodeado de confeti', full: true } })
  .add({
    title: 'Repasa con tarjetas', obj: 0,
    text: 'Piensa la respuesta y toca para comprobarla.',
    ix: ix.flash([
      ['¿Cuáles son los cuatro tesoros de un centro sociosanitario?', '**Datos de salud**, **continuidad del cuidado**, **dinero** y **confianza**.'],
      ['¿Cómo empezó el ataque al servicio de salud irlandés?', 'Con un **correo de phishing** y un archivo Excel adjunto que abrió una persona.'],
      ['Te llaman del «soporte técnico» y te piden la clave. ¿Qué haces?', '**Cuelgas** y avisas a tu responsable.'],
      ['¿Qué señal común tienen muchos fraudes?', '**Prisa + secreto + petición de datos o dinero.**'],
      ['¿Cuáles son los tres pilares de la información?', '**Disponibilidad, integridad y confidencialidad.**'],
      ['¿A qué información puedes acceder?', '**Solo a la que necesitas** para tu trabajo con esa persona.'],
      ['¿Qué haces ante un mensaje de rescate?', '**No tocas más, anotas y avisas** a tu responsable. No se paga por impulso.'],
      ['¿Qué número de ayuda gratuita y confidencial conoces?', 'El **017** de INCIBE, de 8:00 a 23:00, todos los días.'],
    ]),
  })
  .add({
    title: 'Sopa de palabras', obj: 1,
    text: 'Un descanso con palabras del curso.',
    ix: ix.wordsearch(['PHISHING', 'RANSOMWARE', 'VISHING', 'CLAVE', 'AVISAR', 'DATOS', 'BLOQUEO', 'INCIBE'], 'Encuentra ocho palabras del curso.'),
  })
  .add({
    title: 'Mi compromiso', obj: 2,
    text: 'Para cerrar, marca lo que te comprometes a hacer a partir de hoy.',
    ix: html(W.pledge({
      titulo: '',
      items: ['Bloquear la pantalla cada vez que me levante', 'No compartir mi clave ni apuntarla a la vista', 'Parar y preguntar ante un mensaje o una llamada con prisa', 'No conectar USB que no conozco', 'Acceder solo a la información que necesito para cuidar', 'Echar el papel con datos a la destructora', 'Avisar a mi responsable ante cualquier cosa rara, aunque me equivoque'],
      minimo: 5,
      final: '¡Compromiso firmado! Gracias por cuidar también de los datos de las personas que cuidas.',
    })),
  })
  .add({
    type: 'summary', title: 'Lo que te llevas',
    text: '- Cuidas a las personas **y a sus datos**.\n- Un ataque es una cadena y **tú puedes cortarla**.\n- Equivocarse es humano; lo importante es **avisar a tiempo**.\n- Ahora toca el test final: son 12 preguntas de situaciones reales de tu día a día.',
  })

// ───────────────────────── Glosario y bibliografía ─────────────────────────
c.glossary('Ransomware', 'Programa dañino que impide acceder a los archivos, normalmente cifrándolos, y pide un rescate.')
  .glossary('Phishing', 'Engaño por correo que imita a una empresa o persona de confianza para conseguir datos o que pinches un enlace.')
  .glossary('Vishing', 'Engaño por llamada telefónica, como el falso «soporte técnico» que pide tu contraseña.')
  .glossary('Smishing', 'Engaño por SMS o mensaje de texto, normalmente con un enlace.')
  .glossary('Ingeniería social', 'Engañar a las personas, no a las máquinas, para conseguir información o acceso.')
  .glossary('Malware', 'Programa dañino que roba información o toma el control de un equipo.')
  .glossary('Dato personal', 'Cualquier información sobre una persona identificada o identificable.')
  .glossary('Brecha de datos', 'Incidente en el que datos personales se pierden, se alteran o los ve quien no debe.')
  .glossary('Disponibilidad', 'Que la información esté accesible cuando hace falta.')
  .glossary('Integridad', 'Que la información no haya sido alterada, por error o a propósito.')
  .glossary('Confidencialidad', 'Que la información solo la vea quien debe.')
  .glossary('Copia de seguridad', 'Copia de los datos guardada aparte para poder recuperarlos si se pierden o se cifran.')
  .glossary('AEPD', 'Agencia Española de Protección de Datos: la autoridad a la que se notifican las brechas de datos personales.')
  .glossary('INCIBE', 'Instituto Nacional de Ciberseguridad; gestiona la Línea de Ayuda en Ciberseguridad 017.')

c.bib('INCIBE (2026). Balance de ciberseguridad 2025. INCIBE.', 'https://www.incibe.es/sites/default/files/2026-02/Balance%20de%20ciberseguridad%202025%20INCIBE/BalanceCiberseguridad2025_INCIBE.pdf')
  .bib('INCIBE. Línea de Ayuda en Ciberseguridad (017). INCIBE.', 'https://www.incibe.es/linea-de-ayuda-en-ciberseguridad')
  .bib('INCIBE. Reporte de fraude. INCIBE-CERT.', 'https://www.incibe.es/ciudadania/ayuda/reporte-de-fraude')
  .bib('INCIBE. El ransomware y recupero mi información. INCIBE Empresas.', 'https://www.incibe.es/empresas/blog/el-ransomware-y-recupero-mi-informacion')
  .bib('INCIBE-CERT (2024). Ciberseguridad en el sector sanitario: características, amenazas y recomendaciones. INCIBE-CERT.', 'https://www.incibe.es/en/incibe-cert/blog/cibersecurity-healthcare-sector-features-threats-and-recommendations')
  .bib('INCIBE-CERT (2023). Ciberataque ransomware paraliza la actividad del hospital. Bitácora de seguridad.', 'https://www.incibe.es/en/incibe-cert/publicaciones/bitacora-de-seguridad/ciberataque-ransomware-paraliza-actividad-del-hospital')
  .bib('ENISA (2025). ENISA Threat Landscape 2025 (booklet). ENISA.', 'https://www.enisa.europa.eu/sites/default/files/2025-10/ENISA%20Threat%20Landscape%202025%20Booklet.pdf')
  .bib('ENISA (2023). Threat Landscape: Health Sector. ENISA.', 'https://www.enisa.europa.eu/news/checking-up-on-health-ransomware-accounts-for-54-of-cybersecurity-threats')
  .bib('AEPD (2021). Guía para la notificación de brechas de datos personales. AEPD.', 'https://www.aepd.es/guias/guia-brechas-seguridad.pdf')
  .bib('AEPD (2024). Guía para profesionales del sector sanitario. AEPD.', 'https://www.aepd.es/documento/guia-profesionales-sector-sanitario.pdf')
  .bib('HSE Irlanda (2021). Conti cyber attack on the HSE: Independent Post Incident Review. Informe independiente.', 'https://regmedia.co.uk/2021/12/10/ireland_hse_ransomware_full_pwc_report.pdf')

// ───────────────────────── Test final ─────────────────────────
c.finalTest('Test final', [
  ['En el turno de noche, la tablet de planta no abre la pauta de medicación. ¿Por qué es también un problema de cuidados y no solo de informática?', [['Porque sin una pauta fiable hay riesgo clínico para la residente', true], ['Porque la tablet cuesta dinero', false], ['Porque hay que rellenar un parte más', false]], 'Si falla la información de la que depende el cuidado (dosis, alergias, horarios), el riesgo es clínico. Por eso hace falta un plan B en papel.', 0],
  ['Una compañera dice: «Somos un centro pequeño, a nadie le interesamos». ¿Qué le respondes?', [['Tiene razón: los atacantes solo van a los grandes', false], ['Los atacantes buscan puertas abiertas, y los datos de salud valen dinero', true], ['Solo pasa en hospitales', false]], 'Los criminales no eligen centros concretos: atacan a quien deja la puerta abierta. Y los datos de salud tienen valor en el mercado ilegal.', 0],
  ['Te llaman del «soporte técnico» y te piden la contraseña de la tablet para arreglarla. ¿Qué haces?', [['Se la doy, es de la empresa', false], ['La doy y luego la cambio', false], ['Cuelgo y aviso a mi responsable', true], ['La doy si suena muy seguro', false]], 'El soporte legítimo no te llama por sorpresa para pedirte tu contraseña. Es vishing.', 1],
  ['En el caso del servicio de salud irlandés (HSE), ¿cómo empezó el ataque?', [['Con un técnico que actualizó mal un programa', false], ['Con una persona que abrió el Excel adjunto de un correo de phishing', true], ['Con alguien que entró en el edificio', false]], 'Según el informe independiente, una persona abrió un Excel adjunto el 18 de marzo de 2021; el ransomware se activó semanas después.', 1],
  ['Un correo del «director» pide una transferencia urgente a una cuenta nueva y que no se lo cuentes a nadie. ¿Cuál es la señal de alarma más clara?', [['El logo del correo', false], ['Urgencia + secreto + dinero', true], ['Que llegue en lunes', false], ['Que no lleve adjunto', false]], 'Urgencia, secreto y dinero juntos son la señal clásica del fraude del director. Verifica por un teléfono que ya conozcas.', 1],
  ['Tienes que salir un momento de la sala de enfermería y en la pantalla hay historias abiertas. ¿Qué haces?', [['Doy la vuelta a la pantalla', false], ['Bloqueo la pantalla', true], ['Dejo una nota de «no tocar»', false]], 'Bloquear la pantalla (Windows + L en el ordenador) es el hábito más simple y eficaz.', 2],
  ['En tu planta todos usan la misma clave de la tablet «para ir más rápido». ¿Qué es lo correcto?', [['Seguir igual: es lo habitual', false], ['Pedir acceso individual a supervisión y no compartir claves', true], ['Pegar la clave en un post-it para que no se olvide', false]], 'La clave es personal: así se sabe quién hizo qué y se protege a las personas residentes.', 2],
  ['Envías por error el informe de una residente a la familia de otra. ¿Qué haces?', [['Nada: fue un despiste', false], ['Aviso a mi responsable: es un incidente', true], ['Solo aviso si la familia se queja', false], ['Borro el correo enviado', false]], 'Enviar datos de salud a un destinatario equivocado es una brecha frecuente según la AEPD. Hay que avisar para que el centro valore qué hacer.', 3],
  ['¿Cuál de estos elementos necesita el nivel de protección más alto (restringida)?', [['El menú de la semana', false], ['El cuadrante del mes', false], ['El informe de psicología de una residente', true], ['La web del centro', false]], 'Los informes de salud son lo más sensible: una filtración dañaría directamente a la persona.', 3],
  ['En tu ordenador aparece un mensaje: «tus archivos están cifrados, paga para recuperarlos». ¿Qué haces primero?', [['Pago para que no se pierdan', false], ['Reinicio todo varias veces', false], ['No toco más y aviso a mi responsable', true]], 'INCIBE indica que en ningún caso es aconsejable pagar el rescate. Lo primero es no empeorar y avisar.', 4],
  ['Si el centro sufre una brecha con datos personales y hay riesgo para las personas, ¿en cuánto tiempo, como máximo, debe notificarlo a la AEPD?', [['24 horas', false], ['7 días', false], ['72 horas desde que lo sabe', true], ['Un mes', false]], 'El plazo es de 72 horas desde que se tiene constancia, incluidos fines de semana y festivos. Lo notifica el centro, no cada trabajador.', 4],
  ['¿Qué número gratuito y confidencial de INCIBE puedes llamar ante una duda o un fraude?', [['112', false], ['061', false], ['017', true], ['091', false]], 'El 017 atiende de 8:00 a 23:00 todos los días. Para una emergencia de salud o de seguridad física, sigue siendo el 112.', 4],
])

await c.build()
