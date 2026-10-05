# Curso 4 · «Mi puesto de trabajo, mis dispositivos y mis redes» — Dossier de fuentes y contenido

Programa de ciberseguridad para trabajadores de residencias y centros sociosanitarios. Público: gerocultores/as, auxiliares, enfermería, administración, dirección, supervisión y mantenimiento, sin conocimientos digitales, en móvil. Objetivo de duración: ~1 h 40 min.

Fecha de elaboración: 5 oct 2026. Convención de este dossier:
- **[LEÍDO]** = leído por mí en la fuente (web, PDF o kit local) durante esta investigación.
- **[SECUNDARIA]** = solo visto a través de un resumen de buscador o web de terceros; hay que confirmarlo antes de publicarlo como dato.
- **[SIN CONFIRMAR]** = conocimiento general del sector que no he podido contrastar con una fuente leída. No usar como dato citado.
- Las fechas son las de publicación que muestra la propia página, salvo que se indique otra cosa.

---

## 1. Resumen ejecutivo

1. El curso cubre 12 grandes áreas. La base oficial más sólida es el **kit de concienciación de INCIBE** (carpetas 06, 07 y 08: puesto de trabajo I y II, y móviles/BYOD/teletrabajo), que ya trae contenido, tests y consejos gráficos listos. Cubre bien: mesa limpia, bloqueo de sesión, actualizaciones, antivirus/firewall, documentación sensible, software legítimo, USB, incidentes, móviles, wifi pública, VPN, BYOD, robo/pérdida y teletrabajo doméstico.
2. **Huecos del kit** que hay que cubrir con otras fuentes: tablets/ordenadores compartidos de planta, shadow IT, wifi de invitados vs. corporativa, copias 3-2-1, Google Drive, seguridad física (tailgating, cuartos de comunicaciones, cámaras, domótica, IoMT), destrucción de papel y falsos técnicos. Encontré fuentes oficiales para casi todos (INCIBE, AEPD, ENISA). Para **tablets compartidas de planta** y **tailgating en residencias** no hay una fuente oficial específica leída: el contenido se construye por analogía con las pautas generales y debe llevar la etiqueta «buena práctica propuesta».
3. Mensajes clave (todos con respaldo oficial leído): bloquear siempre al alejarse (Win+L); nada de contraseñas en post-it; actualizar y mantener antivirus y cortafuegos activos; **no usar USB desconocidos** (INCIBE, jul 2022); solo software legítimo y de tiendas oficiales; no usar wifi pública con dispositivos de trabajo, usar datos móviles o VPN; cambiar claves por defecto de router/IoT; separar la wifi de invitados; avisar de inmediato ante pérdida o robo; destruir papel con trituradora; no enviar datos de salud por WhatsApp sin criterio (guía AEPD sector sanitario).
4. Dato de contexto sanitario (ENISA, 5 jul 2023): el 54 % de las amenazas en el sector salud de la UE son ransomware; el 80 % de organizaciones sanitarias encuestadas reportó incidentes relacionados con vulnerabilidades en software o hardware; solo el 27 % tiene un programa específico contra ransomware. Útil para el «por qué importa», con la cautela de que son datos de 2021-2023 y europeos.
5. **Vídeos**: 6 verificados por oEmbed y por la ficha de YouTube (todos de la Oficina de Seguridad del Internauta, canal oficial de INCIBE), de 2:36 a 4:33, más 3 opcionales. No encontré vídeos oficiales cortos y verificables sobre USB, VPN, ingeniería social presencial ni robo de móvil de INCIBE/OSI; se proponen alternativas verificadas de INCIBE (2015-2021) con la advertencia de antigüedad.
6. **Estructura propuesta de ~100 min**: 12 bloques de 6-10 minutos (sección 2), con 5 actividades interactivas y un test final de 12 preguntas (sección 7).
7. Lo que NO se ha podido confirmar está listado en la sección 9.

---

## 2. Contenido didáctico en bloques (listo para pantallas)

Lenguaje llano, frases cortas. Tiempo orientativo por bloque. Los ejemplos de residencia son propuestas didácticas mías, no datos de fuente.
Cada bloque indica en «Respaldo» la fuente que sustenta las afirmaciones normativas o técnicas.

### Bloque 0 · Bienvenida: ¿qué es «mi puesto» y por qué importa? (5 min)
**Texto de pantalla.** Tu puesto de trabajo es todo lo que usas para hacer tu trabajo: la mesa o el mostrador, el ordenador, la tablet de planta, el móvil, el papel y la wifi. Los ciberdelincuentes no siempre atacan desde lejos: a veces basta con un ordenador sin bloquear, un USB que alguien encontró, o una persona con chaleco que dice ser «el técnico».
**Datos de contexto** (citar con fuente, sección 3): ENISA 2023, sector salud.
**Respaldo.** INCIBE, kit 06 p. 3: riesgos del puesto (papel al alcance de cualquiera, accesos no autorizados a dispositivos, malware, robo de información) **[LEÍDO]**.

### Bloque 1 · Puesto limpio y bloqueo de pantalla (8 min)
- **Mesa limpia**: al terminar o al levantarte, guarda lo que tenga datos de residentes (listados, hojas de turno, partes, recetas) fuera de la vista.
- **Sin claves en post-it** (ni en la pantalla, ni bajo el teclado).
- Los USB o discos que se puedan desconectar se guardan fuera del alcance de otros cuando no estás.
- **Bloquea siempre que te levantes**: en Windows, tecla Windows + L (kit 06 p. 5). En móvil/tablet, bloqueo de pantalla con el menor tiempo posible, con contraseña o huella (kit 06 p. 5; kit 08 p. 7).
- Al terminar la jornada: equipos apagados; portátiles y móviles bajo llave.
- **Ejemplo residencia**: la sala de enfermería se queda 2 minutos vacía porque suena una llamada de timbre. En ese rato una visita o un residente con deambulación puede ver la pantalla con la medicación de otra persona. «Win+L» tarda un segundo.
**Respaldo.** Kit 06 pp. 4-5 **[LEÍDO]**.
**Salvedad.** Para ordenadores de planta compartidos hay un compromiso práctico (se bloquea o cierra sesión, ver bloque 2); la solución concreta depende de cada centro.

### Bloque 2 · Ordenadores y tablets de planta compartidos (10 min) — foco gerocultores
> Fuente específica sobre equipos compartidos en residencias: **no encontrada**. Las pautas siguientes derivan de las generales (INCIBE kit 06/08: cuentas con privilegios mínimos, bloqueo, contraseña robusta, no «recordar contraseña»). Etiquetar como «buena práctica propuesta».
- Si el equipo es compartido, cada persona entra **con su propio usuario** (cuando el centro lo permita). El kit 08 p. 7 recomienda cuentas de usuario con los privilegios mínimos necesarios y contraseña robusta **[LEÍDO]**.
- **No marcar «Recordar contraseña»** (kit 08 p. 10 **[LEÍDO]**): en una tablet compartida, quien la coja después entra como tú.
- **Cerrar sesión al terminar tu turno**, no solo bloquear.
- No apuntar datos del residente en notas, fotos o chats del propio aparato.
- Si la tablet tiene el seguimiento de residentes (ducha, cambios posturales, constantes, etc.), usa solo la aplicación autorizada; no instales otras ni uses el navegador para cosas personales.
- Si la tablet se pierde, se rompe o se queda sin batería: avisar al responsable (ver bloque 10).
**Ejemplo residencia**: la tablet de planta tiene abierta la sesión de «Marta» (turno de mañana). El turno de tarde registra cambios posturales con la sesión de Marta: el registro queda a su nombre. Es un problema de **trazabilidad** y de responsabilidad personal.
**Nota**. La afirmación de que el registro queda a nombre del otro es una consecuencia lógica del uso de una sesión ajena, no una cita de fuente.

### Bloque 3 · Actualizaciones y antivirus (8 min)
- Un equipo sin actualizar tiene «puertas abiertas» conocidas que los delincuentes explotan.
- Activa las **actualizaciones automáticas** (kit 06 p. 6). Si el aparato es del centro, las gestiona informática: **no cierres ni pospongas indefinidamente** el aviso de reinicio.
- El **antivirus** detecta y elimina el código malicioso; el **cortafuegos** controla lo que entra y sale de Internet. Se necesitan los dos y no se estorban (kit 06 p. 7).
- «Cuando el antivirus suena, el malware llega»: si salta un aviso, **no lo ignores**: avisa a informática (cartel INCIBE 0701).
- También en el móvil: el kit 08 p. 6 recomienda antivirus en el móvil con detección de webs fraudulentas **[LEÍDO]**.
**Respaldo.** Kit 06 pp. 6-7; kit 08 p. 6; OSI (vídeos «Pasos para actualizar tu ordenador Windows y Mac» y «Pasos para actualizar tu móvil y tablet Android e iOS»).

### Bloque 4 · USB y dispositivos externos desconocidos (8 min)
- **No conectar USB desconocidos** al trabajo: INCIBE (blog, 19 jul 2022) dice que no deben utilizarse en el ámbito laboral bajo ningún concepto, en especial los promocionales o de origen desconocido, porque podrían contener malware deliberadamente **[LEÍDO]**.
- Si encuentras un USB (en el aparcamiento, en la sala de personal, en una mesa): **no lo conectes**, no lo «pruebes para ver de quién es». Se entrega al responsable o a informática.
- Si el centro permite USB propios, información sensible **cifrada** (kit 07 p. 7) y avisar de inmediato si se pierde (kit 07 p. 7).
- Cargar el móvil: usar el cargador propio y enchufe, no puertos USB desconocidos. **[SECUNDARIA]** (la noticia de Merca2 de 12 sep 2025 atribuye este aviso a INCIBE; no lo he podido leer en INCIBE, no citarlo como dato oficial hasta confirmarlo).
**Respaldo.** INCIBE blog «¡La seguridad en movimiento! Protege tus dispositivos extraíbles», 19 jul 2022 **[LEÍDO]**; kit 07 p. 7 **[LEÍDO]**.

### Bloque 5 · Descargas y software no autorizado («shadow IT») (7 min)
- «Shadow IT» en llano: **usar programas, apps o servicios que nadie del centro ha aprobado** (p. ej. una app de mensajería, un conversor de PDF online, un Drive personal) porque «es más cómodo».
- El kit 07 p. 6: instalar software sin licencia o «pirata» puede acarrear sanciones y suele traer malware (anuncios, programas modificados o «cracks» infectados) **[LEÍDO]**. El kit 08 p. 9: apps solo de la tienda oficial (App Store o Play Store) y en ordenador desde la web oficial del fabricante **[LEÍDO]**.
- Los equipos del centro se usan solo para trabajo (kit 07 p. 5): no webs de descargas, juegos ni contenido dudoso **[LEÍDO]**.
- Una app pide demasiados permisos (cámara, contactos, ficheros)? Desconfía (kit 08 p. 5).
- Si necesitas una herramienta nueva: **pídela a informática o a dirección**, no la instales por tu cuenta.
**Respaldo.** Kit 07 pp. 5-6; kit 08 pp. 5 y 9; cartel INCIBE 0702 «Siempre software legítimo. No seas pirata».

### Bloque 6 · Wifi: del centro, de invitados, públicas y hotspot (10 min)
- **Wifi corporativa**: la del trabajo, para dispositivos del centro. **Wifi de invitados**: para visitas, familiares y personal con móvil personal; debe estar **separada** de la red interna. INCIBE (blog 27 feb 2017) lista entre sus consejos «configurar una red wifi separada para invitados» si el router lo permite **[LEÍDO]**.
- **Wifi pública** (cafeterías, estaciones, hoteles): no usarla con dispositivos de trabajo; no sabes quién la controla ni si es legítima (kit 08 p. 11). Mejor la **conexión de datos móviles** 4G/5G (kit 08 p. 11) **[LEÍDO]**.
- **Compartir datos del móvil (hotspot)**: contraseña robusta, cifrado WPA2 o superior, comprobar quién está conectado, compartir solo con personas de confianza y apagar cuando no se usa (INCIBE OSI, 19 feb 2021) **[LEÍDO]**.
- Si te conectaste a una red insegura: desconéctate, olvídala y cambia contraseñas importantes (INCIBE Ciudadanía, «Conexiones seguras») **[LEÍDO]**.
- Desactiva la conexión automática a redes abiertas **[SECUNDARIA]**.
**Respaldo.** Kit 08 p. 11 y póster 0801 «Desconfía de redes wifi abiertas»; AEPD-INCIBE «Privacidad y seguridad en Internet» (ficha 1: en wifi públicas no intercambies información privada ni confidencial, no banca online, no compras) **[LEÍDO]**.

### Bloque 7 · VPN, en llano (4 min)
- Una **VPN** es «un túnel privado y cifrado» entre tu aparato y la red del trabajo, aunque estés en una red no fiable.
- Solo se usa la VPN **que te da el centro**. Una VPN «gratuita» descargada por tu cuenta es shadow IT y puede ser peor (hay que elegir proveedores con buena reputación; INCIBE Ciudadanía).
- La VPN **no te protege de un virus** ni de un correo falso (kit 08 test pregunta 8: protege la conexión, no es antimalware).
- Evitar usar escritorio remoto contra servidores del centro sin VPN (kit 08 p. 11) **[LEÍDO]**.
**Respaldo.** Kit 08 p. 11; INCIBE «Conexiones seguras» **[LEÍDO]**.

### Bloque 8 · Móvil personal para trabajar (BYOD), WhatsApp y fotos de residentes (10 min)
- **BYOD** («Bring Your Own Device»): usar tu móvil personal para cosas del trabajo (kit 08 p. 13). Ventaja: comodidad. Riesgo: lo usas para todo y se lo prestas a familiares; si se pierde, se pierde también información del centro.
- Medidas (kit 08 p. 14): no hacer root/jailbreak, tener el móvil siempre bajo custodia, seguir la normativa del centro (qué apps y configuraciones se permiten); y que el centro tenga una **normativa** de uso. Al terminar el contrato, no conservar información de la empresa (kit 08 p. 13).
- **WhatsApp y datos de salud**: la guía de la AEPD para profesionales del sector sanitario (publicada jun 2022, revisión oct 2024) indica, sobre mensajería instantánea, que hay que asegurarse de que el mensaje va solo al paciente y no a un grupo, aplicar la **minimización de datos** (la mínima información necesaria), valorar si la aplicación cifra y si es fácil suplantar al usuario, y que «es probable que no sea aconsejable» comunicarse con el paciente por estos medios cuando se trate de datos sensibles **[LEÍDO, p. 17 del PDF]**.
- **Fotos y vídeos de residentes**: no hacerlas con el móvil personal ni enviarlas por WhatsApp. **[SIN CONFIRMAR como cita]**: la regla se apoya en el principio de minimización de la AEPD arriba citado y en la política de cada centro; no he leído una norma oficial específica sobre fotos de residentes. Presentar como «norma del centro» y consultar al delegado de protección de datos (DPD) del cliente.
- Posible sanción: la búsqueda indicó que la AEPD ha sancionado el envío de fotos y vídeos de pacientes por WhatsApp **[SECUNDARIA]**; no citar casos concretos sin leer la resolución.
**Respaldo.** Kit 08 pp. 13-14 **[LEÍDO]**; AEPD, Guía para profesionales del sector sanitario, jun 2022 (rev. oct 2024) **[LEÍDO]**.

### Bloque 9 · Pérdida o robo de dispositivos (6 min)
Pasos del kit 08 p. 15 y de INCIBE (blog 25 jul 2018):
1. **Avisar a la empresa de inmediato** (para que bloqueen cuentas y accesos).
2. Si es robo, **denunciar** (Policía/Guardia Civil) aportando el IMEI.
3. Bloquear en remoto, localizar («Encuentra mi dispositivo» / «Buscar mi iPhone») y, si no se recupera, **borrado remoto**.
4. Bloqueo de la tarjeta SIM y de IMEI con la operadora (INCIBE 2018). El IMEI se ve marcando `*#06#`.
5. **Tip**: apuntar el IMEI al comprar el móvil **[SECUNDARIA]**.
El kit 08 p. 15 añade que la geolocalización en equipos de empresa debe comunicarse a los empleados de forma «clara, expresa e inequívoca» (LOPDGDD 3/2018) **[LEÍDO]**.
**Mensaje clave de actitud**: avisar rápido nunca es motivo de reprimenda; tarde, sí es un problema.

### Bloque 10 · Copias de seguridad y Google Drive de empresa (8 min)
- **Regla 3-2-1 en llano**: *3 copias* de lo importante (la original + 2 copias), en *2 tipos de soporte* distintos (p. ej. disco y nube), y *1 copia fuera* del centro. INCIBE, guía de copias (30 oct 2018) la formula así: «tres copias, en dos tipos de soporte distintos y una de ellas fuera» **[LEÍDO]**.
- Para el personal no técnico: **las copias las hace informática**; tu parte es guardar el trabajo **donde el centro indique** (carpeta compartida o Drive de empresa), no en el escritorio ni en un USB. El kit 08 p. 12 pide copias periódicas en teletrabajo **[LEÍDO]**.
- **Drive de empresa**: usa solo la cuenta corporativa, nunca tu Gmail personal. Compartir: opción **«Restringido»** (solo personas concretas) y no «Cualquier persona con el enlace»: Google lo dice así: con enlace público cualquiera puede abrir el archivo sin iniciar sesión, y recomienda no compartir información privada o sensible así; además los permisos de una carpeta se heredan a lo que contiene **[LEÍDO, ayuda de Google Drive]**.
- Antes de compartir: ¿quién lo recibe?, ¿lo necesita?, ¿solo ver o editar?
**Respaldo.** INCIBE guía copias 2018; Google Drive Ayuda; OSI vídeo «Cómo utilizar un servicio en la nube para hacer copias de seguridad» (jun 2023).
**No encontrada**: fuente oficial española específica sobre «Google Drive en empresas»; solo la ayuda de Google.

### Bloque 11 · Teletrabajo seguro desde casa (8 min)
- **Wifi de casa** (kit 08 p. 12; INCIBE «Conexiones seguras»): cifrado WPA2/WPA3, clave robusta, desactivar WPS, cambiar nombre y contraseña por defecto del router y actualizar su firmware.
- **Familiares**: nadie más usa el equipo de trabajo para juegos, descargas ni deberes (kit 08 p. 12).
- **Pantalla**: bloquear al levantarte; si hay otros en casa, que no vean datos de residentes.
- **Papel**: no sacar documentos con datos de residentes; si es imprescindible, guardarlos bajo llave y destruirlos con trituradora.
- **VPN** del centro; copias periódicas; contraseñas robustas y doble factor (INCIBE, 20 mar 2020).
- Documento técnico para el servicio de informática: CCN-CERT BP/18, mar 2020 **[LEÍDO, orientado a TI]**.
**Respaldo.** Kit 08 p. 12; INCIBE «Pautas para teletrabajar seguro» (20 mar 2020) **[LEÍDO]**.
**Nota**. En residencias el teletrabajo afecta sobre todo a administración y dirección.

### Bloque 12 · Seguridad física, papel e ingeniería social presencial (12 min) — foco mantenimiento
- **Accesos y visitas**: control de acceso (tarjeta, PIN, llave o biometría) y cámaras/sensores son medidas de seguridad física (INCIBE-CERT, 17 abr 2019, en entorno industrial) **[LEÍDO]**. Aplicado a la residencia: puertas del personal cerradas; las visitas, **acompañadas y registradas** (buena práctica propuesta).
- **Cuartos de comunicaciones y servidores**: acceso solo del personal autorizado. «Conseguir acceso físico a un centro de control implica ganar acceso lógico al sistema» (INCIBE-CERT 2019). Mantenimiento: no dejes la puerta abierta ni la llave puesta.
- **Cámaras, domótica y otros dispositivos IoT** (cámaras de pasillos, control de accesos, sensores, domótica): INCIBE (blog 6 jun 2017) advierte de claves por defecto sin obligación de cambiarlas, falta de actualizaciones y acceso remoto inseguro; recomienda cambiar contraseñas de fábrica, elegir dispositivos con actualizaciones, no conectarlos a la wifi corporativa y deshabilitar el acceso remoto si no se necesita **[LEÍDO]**.
- **Equipos médicos conectados (IoMT)**: INCIBE-CERT (10 ene 2019) los describe como equipos conectados a la red del hospital con riesgos de acceso no autorizado y dificultad de aplicar parches por su criticidad; recomienda monitorizar el tráfico y separar accesos operativos de los de configuración **[LEÍDO]**. Para el personal de planta: **no conectar nada a esos equipos ni moverlos de enchufe/red sin avisar** (buena práctica propuesta). El artículo es de 2019: comprobar si hay material INCIBE-CERT más reciente.
- **Papel**: guardar bajo llave al acabar; **destruir con trituradora** lo que ya no se necesite (kit 07 p. 3); INCIBE (blog 23 ago 2018) dice que para documentos físicos «se deberá utilizar el triturado» y que conviene contratar servicios que emitan certificado de destrucción **[LEÍDO]**. Cuidado con lo que queda en impresoras y escáneres (kit 07 p. 3).
- **Ingeniería social presencial**: INCIBE (blog 8 oct 2020) pone como ejemplo la **suplantación presencial**: dejar acceder a personas externas (fontanero, repartidor) sin verificar credenciales **[LEÍDO]**. Recomienda procedimientos verificables antes de actuar.
  - **Tailgating** (colarse detrás de alguien): INCIBE no lo desarrolla en lo que he leído; la definición («seguir de cerca a un empleado autorizado para entrar») procede de páginas de empresas de seguridad **[SECUNDARIA]**. Presentarla como concepto de apoyo.
  - **Falsos técnicos**: regla práctica propuesta: «un técnico sin cita, sin identificación o que nadie conoce **no pasa a solas**; pregunta a quién te lo avisó y confírmalo con la dirección o informática por un canal que tú elijas, no el que te da él».
- **Qué hacer ante un incidente** (kit 07 p. 6-7): primero entender qué ha pasado; avisar a la persona responsable; si se afectan datos personales, informar a quien deba comunicarlo a los afectados y a la AEPD; si es delito, denuncia; ayuda de INCIBE: **017** (antes 900 116 117; ver sección 9) **[LEÍDO]**.

### Cierre (3 min)
Decálogo de 10 gestos y recordatorio de a quién avisar (responsable de seguridad / informática del centro). Reservar para el SCORM una pantalla con «a quién llamo» editable por centro.

**Reparto de tiempo (~100 min)**: Bloques 0-12 ≈ 99 min de contenido y actividades; el test final cabe dentro del tiempo si se simplifican los bloques 6, 10 y 12. Ajustar a partir de las pruebas con usuarios.

---

## 3. Datos citados (fuente, enlace, fecha)

| Dato | Fuente | Enlace | Fecha | Estado |
|---|---|---|---|---|
| 54 % de las amenazas en salud son ransomware; 215 incidentes públicos analizados; 53 % afectaron a proveedores de servicios de salud; 42 % a hospitales; 30 % buscaban datos de pacientes; 46 % robo/filtración de datos; 27 % de organizaciones tienen programa de defensa contra ransomware; 80 % reportó incidentes relacionados con vulnerabilidades; mediana de coste de un incidente grave: 300.000 € | ENISA, «Checking-up on Health: Ransomware Accounts for 54% of Cybersecurity Threats» (periodo ene 2021-mar 2023) | https://www.enisa.europa.eu/news/checking-up-on-health-ransomware-accounts-for-54-of-cybersecurity-threats | 5 jul 2023 | LEÍDO (nota de prensa) |
| USB desconocidos no deben usarse en el trabajo bajo ningún concepto; riesgos: pérdida, acceso no autorizado, malware | INCIBE, «¡La seguridad en movimiento! Protege tus dispositivos extraíbles» | https://www.incibe.es/empresas/blog/seguridad-movimiento-protege-dispositivos-extraibles-empresas | 19 jul 2022 | LEÍDO |
| Regla 3-2-1: tres copias, dos soportes distintos, una fuera | INCIBE, «Copias de seguridad: una guía de aproximación para el empresario» | https://www.incibe.es/empresas/blog/copias-seguridad-guia-aproximacion-el-empresario | 30 oct 2018 | LEÍDO |
| Pérdida/robo de móvil: localizar, bloquear, borrar, bloquear SIM, denunciar con IMEI, bloqueo IMEI | INCIBE, «¿Cómo actuar si me han robado o he perdido el teléfono móvil?» | https://www.incibe.es/ciudadania/blog/como-actuar-si-me-han-robado-o-he-perdido-el-telefono-movil | 25 jul 2018 | LEÍDO |
| Hotspot: contraseña robusta, WPA2 o superior, controlar dispositivos conectados, apagar cuando no se use; wifi públicas «gran amenaza» para la privacidad; VPN si no hay otra opción | INCIBE-OSI, «Cómo compartir tu conexión móvil y evitar las redes públicas» | https://www.incibe.es/ciudadania/blog/como-compartir-tu-conexion-movil-y-evitar-las-redes-publicas | 19 feb 2021 | LEÍDO |
| Pautas de teletrabajo seguro (contraseñas robustas + doble factor, actualizar, cifrar USB, copias, solo wifi privadas, VPN) | INCIBE, «Pautas para teletrabajar seguro» | https://www.incibe.es/empresas/blog/pautas-teletrabajar-seguro | 20 mar 2020 | LEÍDO |
| Suplantación presencial: dejar pasar a un externo (fontanero, repartidor) sin verificar credenciales | INCIBE, «Ingeniería social, ¡Mantente informado y aléjate del engaño!» | https://www.incibe.es/empresas/blog/ingenieria-social-mantente-informado-y-alejate-del-engano-protege-tu-empresa | 8 oct 2020 | LEÍDO |
| IoT: claves por defecto, sin cifrado, sin actualizaciones; botnet Mirai 2016; recomendaciones | INCIBE, «IoT: riesgos del internet de los trastos» | https://www.incibe.es/empresas/blog/iot-riesgos-del-internet-los-trastos | 6 jun 2017 | LEÍDO |
| Equipos médicos conectados (IoMT): riesgos y recomendaciones | INCIBE-CERT, «Ciberseguridad en la medicina, curando en todos los sentidos» | https://www.incibe.es/incibe-cert/blog/ciberseguridad-medicina-curando-todos-los-sentidos | 10 ene 2019 | LEÍDO |
| Seguridad física: control de acceso, cámaras/sensores; acceso físico = acceso lógico | INCIBE-CERT, «El punto en el que la seguridad y la ciberseguridad convergen» (entorno industrial) | https://www.incibe.es/incibe-cert/blog/el-punto-el-seguridad-y-ciberseguridad-convergen | 17 abr 2019 | LEÍDO |
| Red de invitados separada; WPS desactivado; cambiar clave del panel del router; clave de 12+ caracteres | INCIBE, «7 atributos que debe tener tu wifi y 9 consejos para configurarla» | https://www.incibe.es/empresas/blog/7-atributos-debe-tener-tu-wifi-y-9-consejos-configurarla | 27 feb 2017 | LEÍDO (técnicamente anticuado en cifrado: citar WPA2/WPA3 de INCIBE Ciudadanía) |
| Wifi propia: cambiar nombre y clave, actualizar firmware, WPA2/WPA3, desactivar admin remota; wifi pública: VPN, no datos sensibles | INCIBE, «Conexiones seguras» | https://www.incibe.es/ciudadania/tematicas/conexiones | sin fecha en la página | LEÍDO |
| Destrucción: trituradora para papel; certificado de destrucción si es externa | INCIBE, «Si la información ya no es necesaria, bórrala de forma segura» | https://www.incibe.es/empresas/blog/si-informacion-no-necesaria-borrala-forma-segura | 23 ago 2018 | LEÍDO |
| WhatsApp y sanidad: mensaje solo al paciente, minimización, valorar cifrado y suplantación; «probablemente no aconsejable» con datos sensibles | AEPD, «Guía para profesionales del sector sanitario» (jun 2022; rev. oct 2024) | https://www.aepd.es/documento/guia-profesionales-sector-sanitario.pdf | jun 2022 / oct 2024 | LEÍDO (p. 17 del PDF) |
| Wifi públicas (aeropuertos, cafeterías, bibliotecas) pueden no cifrar la información; no intercambiar datos confidenciales, ni banca online ni compras | AEPD-INCIBE, «Privacidad y seguridad en Internet» (ficha 1) | https://www.aepd.es/guias/guia-privacidad-y-seguridad-en-internet.pdf | metadatos del PDF: ene-feb 2017 | LEÍDO |
| Drive: «Restringido» vs. «Cualquier persona con el enlace»; herencia de permisos de carpeta | Ayuda de Google Drive | https://support.google.com/drive/answer/2494822?hl=es | actual | LEÍDO |
| Recomendaciones AEPD de movilidad/teletrabajo: política de protección, perfiles y responsabilidades, no almacenar localmente, red segregada para dispositivos personales | AEPD (documento de 2020 con CCN-CERT) | (documento original no localizado; ver sección 9) | abr 2020 | SECUNDARIA |
| CCN-CERT BP/18: recomendaciones de teletrabajo y vigilancia (orientado a TI: acceso remoto, doble factor, estado del equipo remoto) | CCN-CERT, BP/18 (mar 2020) | https://www.famp.es/export/sites/famp/.galleries/documentos-general/CCN-CERT_BP-18-Recomendaciones-para-Teletrabajo-1.pdf (copia alojada por tercero) | mar 2020 | LEÍDO (copia); el original en ccn-cert.cni.es dio 403 |

---

## 4. Vídeos verificados

Verificación realizada el 5 oct 2026 con `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json` (título y canal exactos) y con la ficha del vídeo en YouTube (duración y fecha de subida). Todos los IDs tienen 11 caracteres. **No he visionado los vídeos**: el encaje con cada pantalla se basa en el título y en la lista del canal; hay que verlos antes de integrarlos.

### Recomendados (6)

| # | ID | Título exacto | Canal | Duración | Subido | URL | Pantalla que ilustra |
|---|---|---|---|---|---|---|---|
| 1 | `whjCYP4afwo` | Pasos para actualizar tu ordenador Windows y Mac | Oficina de Seguridad del Internauta | 3:24 | 8 oct 2025 | https://www.youtube.com/watch?v=whjCYP4afwo | Bloque 3, actualizaciones |
| 2 | `6OSJ4U4mQWo` | Pasos para actualizar tu móvil y tablet Android e iOS | Oficina de Seguridad del Internauta | 4:33 | 15 oct 2025 | https://www.youtube.com/watch?v=6OSJ4U4mQWo | Bloque 3 y tablets de planta |
| 3 | `hbmpmMWoElk` | Comprueba si tienes activado el antivirus en tu ordenador Windows y Mac | Oficina de Seguridad del Internauta | 3:25 | 8 oct 2025 | https://www.youtube.com/watch?v=hbmpmMWoElk | Bloque 3, antivirus |
| 4 | `nV9zOtHDmcA` | Cómo proteger tu red wifi | Oficina de Seguridad del Internauta | 2:36 | 13 may 2024 | https://www.youtube.com/watch?v=nV9zOtHDmcA | Bloque 6 (wifi) y bloque 11 (wifi doméstica del teletrabajo) |
| 5 | `IHkhdDH-JoM` | Cómo protegerte de aplicaciones maliciosas en tu móvil o tablet Android e iOS. | Oficina de Seguridad del Internauta | 4:02 | 15 oct 2025 | https://www.youtube.com/watch?v=IHkhdDH-JoM | Bloque 5 (descargas y apps) y bloque 8 (BYOD) |
| 6 | `Qf8ORcBSWvQ` | Cómo utilizar un servicio en la nube para hacer copias de seguridad | Oficina de Seguridad del Internauta | 3:28 | 14 jun 2023 | https://www.youtube.com/watch?v=Qf8ORcBSWvQ | Bloque 10, copias y nube |

### Opcionales / de apoyo (verificados igualmente)

| ID | Título exacto | Canal | Duración | Subido | Nota |
|---|---|---|---|---|---|
| `W_W6Rz8gRQ8` | Protección para el puesto de trabajo: un caso de éxito de una clínica (actualización) | INCIBE | 2:35 | 28 feb 2022 | Encaja con el bloque 1 por título; contenido sin comprobar (la ficha dio error 429). Verlo antes de usar. |
| `sWWV3QgVcCk` | Así trabaja el ciberdelincuente ¿se lo vas a permitir? (actualización) | INCIBE | 3:42 | 23 mar 2021 | Concienciación general; encaja con el bloque 0 o 12. |
| `TentnM1-lg0` | ¿Qué es el Ingeniería social? \| #AprendeCiberseguridad con INCIBE | INCIBE | 1:32 | 26 ago 2020 | Píldora corta para el bloque 12 (el título es literal, con la errata). |
| `uKNcqM0ZBEw` | Ciberconsejos - Buenas prácticas en el empleo de tecnología | CCN | 2:08 | 18 sep 2019 | Canal del CCN; antiguo, comprobar vigencia. |
| `VxrUaPFiiHc` | Cómo hacer una copia de seguridad y restaurarla en Windows, macOS, Android e iOS | Oficina de Seguridad del Internauta | 5:16 | 19 jun 2023 | Supera un poco los 5 min. |

**Huecos**: no hallé un vídeo oficial breve y verificable de INCIBE/OSI/CCN/AEPD sobre USB desconocidos, VPN, pérdida de móvil o tailgating. Las búsquedas devolvieron vídeos de terceros (p. ej. un vídeo de VPNpro), que no cumplen el criterio de fuente oficial y **se descartan**.

---

## 5. Material del kit INCIBE utilizable

Ruta base: `C:\Users\Jose Alberto Arruego\Downloads\kit_concienciacion\kit_concienciacion\RecursosFormativos\`
Extraje el texto de los PDF y de los PPTX con PyMuPDF y python-pptx. **Leí a fondo los PDF largos y los tests; los PPTX los extraje, pero no los he revisado diapositiva a diapositiva** (se asume que repiten el PDF; confirmar).
Las imágenes de «Consejos» las vi una a una. Los «Posters» (hasta 22 MB) no los abrí; por nombre, son versiones de póster de los consejos.
Licencia: no he revisado las condiciones de uso del kit. Comprobar antes de incluir imágenes en el SCORM (créditos «INCIBE», logotipo visible en las imágenes).

### 06_PuestoTrabajo (Medidas de protección I)
- `06_PuestoTrabajo\06_PuestoTrabajo.pdf` (y `Ficha\06_PuestoTrabajo.pdf`): 8 páginas de contenido. p. 3 riesgos del puesto; p. 4 mesas limpias; p. 5 bloqueo de sesión (Win+L, macOS Ctrl+Opción+Q, Linux Ctrl+Alt+L, móvil con tiempo mínimo, apagar equipos al terminar); p. 6 software actualizado; p. 7 antivirus y firewall; p. 8 referencias. → **Bloques 1 y 3**.
- `Consejos\0601_PuestoTrabajo.png`: «¡Utiliza WIN+L cada vez que te levantes!» → **Bloque 1**, pantalla de bloqueo.
- `Consejos\0602_PuestoTrabajo.png`: «Practica el PARCHEADO y evita problemas» (actualización OK) → **Bloque 3**.
- `Posters\0601…png`, `0602…png`: versiones póster.
- `Presentacion\06_Puesto_trabajo.pptx`: presentación.
- `Test_evaluacion\06_Test_Puesto_trabajo.pdf`: 10 preguntas.

### 07_PuestoTrabajo (Medidas de protección II)
- `07_PuestoTrabajo\07_PuestoTrabajo.pdf`: p. 3 documentación sensible, impresoras/escáneres, custodia externa, destrucción segura (trituradoras); p. 4 contrato de confidencialidad; p. 5 uso adecuado de Internet y sistemas; p. 6 software legítimo y cómo/cuándo reportar un incidente (tipos de incidente; INCIBE 900 116 117); p. 7 dispositivos extraíbles (cifrar, avisar si se pierden, borrado seguro) y denuncia. → **Bloques 4, 5 y 12**.
- `Consejos\0701_PuestoTrabajo.png`: «Cuando el ANTIVIRUS SUENA, malware llega» (aviso «Virus detectado») → **Bloque 3**.
- `Consejos\0702_PuestoTrabajo.png`: «Siempre software legítimo. NO SEAS PIRATA» → **Bloque 5**.
- `Presentacion\07_Puesto_trabajo.pptx`; `Test_evaluacion\07_Test_Puesto_trabajo.pdf` (10 preguntas). No tiene carpetas Ficha ni Posters.

### 08_Móviles (BYOD y teletrabajo)
- `08_Móviles\08_BYOD_teletrabajo.pdf` (y `Ficha\08_BYOD_teletrabajo.pdf`): p. 4-5 riesgos (robo/pérdida, malware, webs fraudulentas, wifi insegura, permisos excesivos, patrón débil, root/jailbreak, «recordar contraseña», nube); p. 6 antimalware; p. 7 control de acceso (cuentas con mínimos privilegios, bloqueo); p. 8 cifrado; p. 9 apps legítimas (tiendas oficiales); p. 10 no recordar contraseña; p. 11 wifi inseguras y VPN; p. 12 teletrabajo (WPA2/WPA3, clave robusta, desactivar WPS, copias, nadie más usa el equipo); p. 13-14 BYOD (riesgos y medidas); p. 15 robo o pérdida. → **Bloques 6-9 y 11**.
- `Consejos\0801_Móviles.png`: «Yo no sabía que esto NO SE PODÍA hacer. Desconfía de redes WiFi abiertas» (banca en wifi abierta) → **Bloque 6**.
- `Consejos\0802_Móviles.png`: «Tu smartphone, siempre con BLOQUEO» → **Bloques 1 y 8**.
- `Posters\0801…png`, `0802…png`, `0803_Móviles.png` (este último sin consejo equivalente; no lo abrí).
- `Presentacion\08_BYOD_teletrabajo.pptx`; `Test_evaluacion\08_Test_BYOD_teletrabajo.pdf` (10 preguntas).

**Qué falta en el kit**: nada sobre tablets compartidas, wifi de invitados, 3-2-1, Drive, seguridad física, IoMT, domótica, tailgating ni WhatsApp/fotos de pacientes.

### Formato de los tests del kit (para inspirarnos, sin copiar)
- 10 preguntas de **opción múltiple con 4 opciones (a-d)**, con **una sola correcta**, y tabla de soluciones al final del PDF.
- Muchas preguntas usan el patrón «**todas las anteriores / todas son ciertas / la a y la b**» (06: P1, P6, P10; 07: P2, P3, P5, P6; 08: P7, P8, P9), que facilita acertar por descarte y no distingue conocimiento. En nuestro curso **evitar** ese patrón.
- Enunciados largos y técnicos; abundan los distractores absurdos («los USB pueden estar siempre conectados»).
- Una pregunta con «cuál de estas afirmaciones **no** es cierta» (07 P10), que desorienta si se lee con prisa.
- Sin retroalimentación explicativa. Nosotros añadimos explicación a cada respuesta.
- Tema recurrente a reutilizar como situación (reformulada): Win+L, post-it, antivirus+cortafuegos a la vez, wifi pública, «recordar contraseña», root/jailbreak, BYOD, qué hacer ante pérdida.
- Un punto a revisar antes de copiar la idea: 07 P7 da como correcta «comunicarlo a los afectados y a la AEPD», pero la comunicación la hace el **responsable del tratamiento**, no cada trabajador. Nuestro enunciado debe decir «avisar de inmediato al responsable».

---

## 6. Actividades interactivas y escenarios por rol

### Actividades (adaptables al editor SCORM; todas con uso táctil)
1. **«Encuentra los fallos» en una sala de enfermería ilustrada** (imagen con puntos tocables; 8-10 fallos): post-it con clave en el monitor; ordenador de enfermería sin bloquear con la medicación visible; pendrive desconocido en la mesa; hoja de cambios posturales a la vista de las visitas; móvil personal haciendo fotos de una herida; tablet de planta con sesión de otra compañera abierta; puerta del cuarto de comunicaciones entreabierta con la llave puesta; papelera con listados sin triturar; wifi de invitados «Residencia» sin contraseña igual que la del personal; técnico desconocido con chaleco manipulando el router. Puntuación: tocar cada fallo y elegir qué hacer. Mismo concepto sirve para **«la mesa del despacho de administración»**.
2. **Qué hago con este USB** (árbol de decisiones de 4 pasos): lo encuentro en la sala de personal → ¿lo conecto para ver de quién es? (no) → ¿se lo doy a un compañero? (no, a informática o al responsable) → ¿lo tiro? (no, se entrega) → refuerzo con la regla INCIBE.
3. **Checklist de teletrabajo** (7-8 casillas): wifi con WPA2/WPA3 y clave propia; router con clave cambiada; nadie más usa el equipo; pantalla se bloquea al levantarme; VPN del centro; papel bajo llave; documentos solo en la carpeta del centro; sé a quién avisar. Resultado: semáforo y consejos.
4. **¿Wifi del centro, de invitados o pública?** Arrastrar dispositivos y tareas a la red correcta (el ordenador de dirección → corporativa; el móvil personal de una visita → invitados; el portátil en una cafetería → datos móviles/VPN; la tablet de planta → corporativa).
5. **«¿Quién entra?» (ingeniería social presencial)**: 4 personas llegan a la puerta (técnico sin cita, repartidor, familiar de un residente, supuesto inspector). Para cada una, elegir qué hacer. Final: la regla «verifica por otro canal».
6. **Ordena los pasos si se pierde el móvil/tablet** (ordenar 5 pasos: avisar, bloquear, localizar, borrar, denunciar).
7. **Carpeta compartida: ¿con quién la comparto?** Simulación de pantalla de «compartir» con «Restringido» vs. «Cualquiera con el enlace».

### Escenarios por rol (breves, para decidir A/B/C)
- **Gerocultor/a (tablet de planta)**: la tablet de la planta 2 tiene la sesión abierta de la compañera del turno anterior y debes registrar un cambio postural. ¿Qué haces? (cerrar su sesión, entrar con tu usuario, avisar si no puedes). Segunda situación: un familiar te pide que le pases una foto de su madre «que ha salido muy bien» con tu móvil; decide con la política del centro.
- **Auxiliar / enfermería**: un compañero te propone un grupo de WhatsApp con los partes de turno. Responder según la AEPD: evitar datos sensibles, mínimo imprescindible, no usar grupos.
- **Administración**: te llega un USB «de la mutua» por correo postal con la factura; o necesitas llevarte trabajo a casa. ¿Qué haces?
- **Dirección / supervisión**: un proveedor pide la clave wifi corporativa para su portátil durante una visita. ¿Qué red les das? ¿Quién los acompaña?
- **Mantenimiento** (atención específica): (a) un «técnico del fabricante» dice que viene a revisar el equipo médico/la caldera con control remoto y pide que le dejes entrar al cuarto de comunicaciones; (b) tienes que instalar una cámara o un sensor de domótica nuevo y viene con la clave de fábrica `admin`: ¿qué haces? (c) el equipo de telemetría de una cama o un monitor pide conectarlo a la wifi del personal; ¿lo conectas? (d) te dan un USB con el firmware de un aparato. Ideas clave para ese perfil, ver bloque 12: cambiar claves de fábrica, no conectar IoT a la wifi corporativa, no abrir cuartos sin necesidad, no manipular equipos médicos conectados sin avisar a informática, acompañar y verificar a los externos.
- **Cualquier rol**: tu móvil personal se ha perdido en la playa/transporte con la app del centro; llamas al responsable; ¿qué haces antes y después?

---

## 7. Preguntas de ejemplo (12) con respuesta y explicación

Formato propuesto: 3 opciones plausibles (no «todas las anteriores»), una correcta; explicación breve visible tras responder.

1. **Te levantas 5 minutos de la sala de enfermería y el ordenador tiene datos de residentes en pantalla. ¿Qué haces?**
 a) Lo dejo así, la sala es del personal. b) **Lo bloqueo (Windows + L) antes de irme.** c) Bajo el brillo de la pantalla.
 *Correcta: b.* Bloquear tarda un segundo y evita que otros vean o usen tu sesión (INCIBE, kit 06 p. 5). Bajar el brillo no protege nada.
2. **Una compañera tiene la clave pegada en un post-it en el monitor. ¿Qué es lo correcto?**
 a) Está bien si el post-it queda dentro del cajón. b) **No se anotan usuarios ni claves en post-it; se sugiere otra forma de recordarla y se cambia la clave.** c) Está bien si la sala está cerrada.
 *Correcta: b.* El kit 06 p. 4 pide que no haya usuarios ni contraseñas en post-it.
3. **Encuentras un pendrive en el suelo del aparcamiento. ¿Qué haces?**
 a) Lo conecto a un ordenador viejo para ver de quién es. b) **Lo entrego a informática o al responsable sin conectarlo.** c) Lo conecto al portátil personal, no al del trabajo.
 *Correcta: b.* INCIBE (19 jul 2022): los USB desconocidos no deben utilizarse en el ámbito laboral bajo ningún concepto, pueden llevar malware a propósito.
4. **El antivirus del ordenador de dirección muestra un aviso de «virus detectado». ¿Qué haces?**
 a) Cierro la ventana y sigo trabajando. b) **Aviso a informática y no sigo trabajando con ese equipo hasta que lo revise.** c) Desactivo el antivirus para que deje de avisar.
 *Correcta: b.* Cartel INCIBE «Cuando el antivirus suena, malware llega»; el antivirus y el cortafuegos deben estar siempre activados (kit 06 p. 7).
5. **Estás en una cafetería con el móvil del trabajo y necesitas mirar un dato. ¿Qué es lo más seguro?**
 a) Conectarme a la wifi gratuita de la cafetería. b) **Usar los datos móviles del teléfono (4G/5G).** c) Conectarme a cualquier wifi abierta que se llame «Cafetería_Free».
 *Correcta: b.* Kit 08 p. 11: las wifi públicas no se pueden verificar y pueden estar suplantadas; es mejor la conexión de datos. Hay riesgo de redes que suplantan a otras (kit 08 p. 4).
6. **¿Para qué sirve una VPN?**
 a) Para que el ordenador vaya más rápido. b) **Para crear un «túnel» cifrado hacia la red del trabajo cuando usas una red que no es de confianza.** c) Para eliminar virus.
 *Correcta: b.* Kit 08, test pregunta 8 (la VPN establece una conexión cifrada en redes inseguras; no es un antivirus ni acelera la conexión).
7. **Un familiar de un residente te pide la clave wifi del centro para su portátil. ¿Qué haces?**
 a) Se la doy, es una visita. b) **Le doy la wifi de invitados, que está separada de la red de trabajo (si existe), o le digo que la consulte en recepción.** c) Le conecto yo mismo a la red de trabajo.
 *Correcta: b.* INCIBE recomienda una red wifi separada para invitados (blog 27 feb 2017).
8. **Quieres hacer una foto de una herida de una residente con tu móvil personal para consultarla con una compañera por WhatsApp. ¿Qué es lo adecuado?**
 a) Hacerlo, es por el bien de la residente. b) **No. Usar los medios y canales que el centro haya autorizado y compartir la mínima información imprescindible.** c) Mandarla a un grupo, así la ven más personas.
 *Correcta: b.* La guía AEPD del sector sanitario (2022, rev. 2024) exige minimizar datos, no enviar a grupos y advierte de que la mensajería puede no ser adecuada para datos sensibles. La regla concreta sobre fotos depende de la política del centro.
9. **Pierdes el móvil con el que consultas el correo del trabajo. ¿Qué haces primero?**
 a) Espero un par de días por si aparece. b) **Aviso de inmediato al centro para que bloqueen accesos, y bloqueo/localizo el móvil.** c) Compro otro y no digo nada.
 *Correcta: b.* Kit 08 p. 15: informar a la empresa, bloquear en remoto, geolocalizar y, si no se recupera, borrar; denunciar si es robo.
10. **¿Qué significa «regla 3-2-1» en copias de seguridad?**
 a) 3 ordenadores, 2 contraseñas y 1 usuario. b) **3 copias, en 2 tipos de soporte distintos y 1 fuera del centro.** c) 3 copias al día, 2 a la semana y 1 al mes.
 *Correcta: b.* INCIBE, guía de copias (2018). Para el personal: guardar donde indique el centro; informática hace las copias.
11. **Vas a compartir un documento con datos de residentes en el Drive del centro. ¿Qué opción eliges?**
 a) «Cualquier persona con el enlace», más rápido. b) **«Restringido», añadiendo solo a las personas que lo necesitan.** c) Lo envío desde mi Drive personal.
 *Correcta: b.* Con enlace público cualquiera puede abrirlo sin cuenta (ayuda de Google Drive); y los datos del centro no deben ir a cuentas personales (política recomendada por INCIBE para teletrabajo y software autorizado; la regla concreta es del centro).
12. **Llega un «técnico» sin cita a revisar el router y pide pasar al cuarto de comunicaciones. ¿Qué haces?**
 a) Le dejo pasar, tiene aspecto profesional. b) **Pido identificación, lo verifico con informática o dirección por un teléfono que yo conozca, y no le dejo solo.** c) Le doy la llave y que avise cuando acabe.
 *Correcta: b.* INCIBE (8 oct 2020): la suplantación presencial consiste en dejar pasar a externos sin verificar credenciales. Acceso físico a infraestructura = acceso lógico (INCIBE-CERT 2019).
13. **En casa, para teletrabajar, ¿qué configuración de wifi es la adecuada?**
 a) Sin contraseña para que no se me olvide. b) **Cifrado WPA2/WPA3, clave robusta propia y WPS desactivado.** c) La clave que viene en la pegatina, que es muy larga.
 *Correcta: b.* Kit 08 p. 12. (Dejar la clave de fábrica puede servir; INCIBE recomienda cambiar nombre y clave por defecto: «Conexiones seguras».)
14. **¿Qué haces con unos listados de residentes que ya no necesitas?**
 a) Los tiro a la papelera. b) **Los destruyo con trituradora o el contenedor de destrucción certificada del centro.** c) Los uso de borrador.
 *Correcta: b.* Kit 07 p. 3 e INCIBE (23 ago 2018): el triturado es el modo seguro de eliminación.
15. **Un compañero instala por su cuenta un programa gratuito en el ordenador de recepción «para ir más rápido». ¿Qué opinas?**
 a) Está bien si es gratis. b) **No se instala nada sin autorización; se pide a informática.** c) Está bien si lo descarga de cualquier web.
 *Correcta: b.* Kit 07 p. 6 y kit 08 p. 9: solo software legítimo y de fuentes oficiales.

(15 preguntas para poder elegir 12; las 1-12 serían el test final mínimo.)

---

## 8. Lista de fuentes con URL

**INCIBE / OSI / INCIBE-CERT**
- Kit de concienciación INCIBE, carpetas 06, 07 y 08 (archivos locales; ver sección 5). Referencias del kit: https://www.incibe.es/protege-tu-empresa/blog/trabajas-tu-dispositivo-movil-implementa-las-mismas-medidas-seguridad-tu ; https://www.incibe.es/protege-tu-empresa/blog/bondades-y-riesgos-del-byod ; https://www.incibe.es/protege-tu-empresa/guias/borrado-seguro-informacion-aproximacion-el-empresario ; https://www.incibe.es/protege-tu-empresa/guias/seguridad-redes-wifi-guia-aproximacion-el-empresario (no abiertas por mí, solo citadas por el kit).
- https://www.incibe.es/empresas/blog/seguridad-movimiento-protege-dispositivos-extraibles-empresas
- https://www.incibe.es/empresas/blog/copias-seguridad-guia-aproximacion-el-empresario
- https://www.incibe.es/ciudadania/blog/como-actuar-si-me-han-robado-o-he-perdido-el-telefono-movil
- https://www.incibe.es/ciudadania/blog/como-compartir-tu-conexion-movil-y-evitar-las-redes-publicas
- https://www.incibe.es/ciudadania/tematicas/conexiones
- https://www.incibe.es/empresas/blog/pautas-teletrabajar-seguro
- https://www.incibe.es/empresas/blog/ingenieria-social-mantente-informado-y-alejate-del-engano-protege-tu-empresa
- https://www.incibe.es/empresas/blog/7-atributos-debe-tener-tu-wifi-y-9-consejos-configurarla
- https://www.incibe.es/empresas/blog/iot-riesgos-del-internet-los-trastos
- https://www.incibe.es/empresas/blog/si-informacion-no-necesaria-borrala-forma-segura
- https://www.incibe.es/incibe-cert/blog/ciberseguridad-medicina-curando-todos-los-sentidos
- https://www.incibe.es/incibe-cert/blog/el-punto-el-seguridad-y-ciberseguridad-convergen
- Aparecidas en búsquedas (no leídas): https://www.incibe.es/ciudadania/tematicas/configuraciones-dispositivos/actualizaciones-de-seguridad ; https://www.incibe.es/sites/default/files/contenidos/politicas/documentos/control-de-acceso.pdf ; https://www.incibe.es/empresas/blog/el-router-defensa-inicial-las-comunicaciones-tu-negocio ; https://www.incibe.es/incibe-cert/blog/dispositivos-extraibles-entornos-industriales-amenazas-y-buenas-practicas ; https://www.incibe.es/empresas/blog/ingenieria-social-mantente-informado-y-alejate-del-engano-protege-tu-empresa
- Canal OSI en YouTube: https://www.youtube.com/@OSIseguridad

**AEPD**
- Guía para profesionales del sector sanitario (jun 2022; rev. oct 2024): https://www.aepd.es/documento/guia-profesionales-sector-sanitario.pdf
- Privacidad y seguridad en Internet (AEPD-INCIBE): https://www.aepd.es/guias/guia-privacidad-y-seguridad-en-internet.pdf

**CCN-CERT**
- BP/18 Recomendaciones de seguridad para situaciones de teletrabajo y refuerzo en vigilancia (mar 2020), copia: https://www.famp.es/export/sites/famp/.galleries/documentos-general/CCN-CERT_BP-18-Recomendaciones-para-Teletrabajo-1.pdf ; página oficial: https://www.ccn-cert.cni.es/es/comunicacion-eventos/comunicados-ccn-cert/9941-como-teletrabajar-de-forma-segura-sin-poner-en-riesgo-a-usuarios-y-organizaciones (403, no leída).

**ENISA**
- https://www.enisa.europa.eu/news/checking-up-on-health-ransomware-accounts-for-54-of-cybersecurity-threats (nota de prensa, 5 jul 2023). Informe completo: https://www.enisa.europa.eu/sites/default/files/publications/Health%20Threat%20Landscape.pdf (no leído).

**Otras**
- Ayuda de Google Drive: https://support.google.com/drive/answer/2494822?hl=es
- Para el contexto IoMT: https://www.juntadeandalucia.es/sites/default/files/inline-files/2026/02/Ciberseguridad%20en%20IoMT%20Retos%20y%20Amenazas.pdf (Junta de Andalucía, nov 2025; aparecido en búsqueda, **no leído**).

---

## 9. Lo que NO he podido confirmar (para revisar antes de publicar)

1. **Guía CCN-STIC de móviles**: no la he localizado ni leído. Para móviles me apoyo en el kit INCIBE. Sí leí el CCN-CERT BP/18 (orientado a personal de TI).
2. **Documento AEPD de teletrabajo/movilidad (2020)**: solo visto en resúmenes de terceros; no localicé el PDF original en aepd.es. No citar textualmente.
3. **Teléfono de ayuda INCIBE**: el kit 07 p. 6 dice 900 116 117 e `incidencias@incibe-cert.es`; en las búsquedas aparece la «línea 017» (vídeo INCIBE «Línea 017 de INCIBE - Tu ayuda en #ciberseguridad», 2020) y el blog de INCIBE de 8 oct 2020 también menciona la 017. **Comprobar en incibe.es cuál es el número vigente** antes de ponerlo en pantalla.
4. **Wifi de invitados, tailgating, tablets compartidas, fotos de residentes**: sin norma o guía oficial específica leída (ver bloques 2, 6, 8 y 12). Hay que marcarlas como «norma del centro» o «buena práctica».
5. **Cargar el móvil en USB público**: solo noticia secundaria (Merca2, 12 sep 2025). No leí la fuente de INCIBE.
6. **Obligación de notificar brechas**: el kit dice que se comunique a afectados y AEPD; el trabajador solo debe **avisar de inmediato** al responsable. No he leído el RGPD (arts. 33-34) para este dossier; es conocimiento general **[SIN CONFIRMAR]**.
7. **Antigüedad**: varias fuentes INCIBE son de 2017-2020 (wifi 2017, IoT 2017, IoMT 2019, USB y borrado 2018-2022). Los principios siguen vigentes, pero los detalles técnicos (p. ej. «WPA2», filtrado MAC como medida) pueden estar desfasados: preferir WPA2/WPA3 de la página «Conexiones seguras».
8. **ENISA**: cifras de 2021-2023 sobre la UE, no sobre España ni sobre residencias.
9. **Vídeos**: verificados por metadatos, no visionados. La ficha del vídeo `W_W6Rz8gRQ8` (clínica) no pude leerla por límite de peticiones de YouTube.
10. **Duración del curso**: la suma de bloques (~99 min) es estimada, sin prueba con usuarios.
11. **Licencia del kit INCIBE** para reutilizar las imágenes: sin revisar.
