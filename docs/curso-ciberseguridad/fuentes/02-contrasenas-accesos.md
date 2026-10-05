# Curso 2 · Contraseñas, cuentas y accesos — Dossier de fuentes y contenido

Público: personal de centros sociosanitarios (gerocultores/as, auxiliares, enfermería, administración, dirección, supervisión, mantenimiento), sin conocimientos digitales, formación en móvil. Duración objetivo: ~1 h 40 min.

Fecha de elaboración: 5-oct-2026. Todo lo citado ha sido leído por mí en la fuente indicada; lo que no he podido confirmar se marca como **[NO VERIFICADO]**.

---

## 1. Resumen ejecutivo

1. **Lo que cambió.** Las fuentes oficiales actuales ya no piden «8 caracteres con mayúscula, número y símbolo». El **CCN-CERT BP/35 «Uso y gestión de contraseñas» (mayo 2026)** recomienda *passphrases* (frases de paso) de **al menos 20 caracteres**, una distinta por servicio, 2FA siempre que se pueda y gestor de contraseñas, y afirma que «la longitud es el principal factor de seguridad, incluso más importante que el uso excesivo de símbolos o la rotación constante». **NIST SP 800-63B-4 (26-ago-2025)** exige 15 caracteres mínimo si la contraseña es el único factor, prohíbe imponer reglas de composición y prohíbe forzar cambios periódicos.
2. **Aviso de coherencia entre fuentes.** Los materiales más antiguos de INCIBE/OSI (kit de concienciación, ficha «Crea tu contraseña segura») siguen diciendo 8-10 caracteres y «cámbiala cada 3 meses»; la AEPD (guía sanitaria) dice «como mínimo una vez al año». El curso debe **seguir CCN-CERT BP/35 y NIST** (frase larga, única, sin rotación obligatoria salvo sospecha) y decir a la plantilla: «si tu centro te pide cambiarla, hazlo; si no, no hace falta cambiarla cada mes». Ver §3.2.
3. **Mensaje central para un centro sociosanitario:** *tu contraseña es tuya, como el cepillo de dientes* (cartel INCIBE). Compartirla en turnos rompe la **trazabilidad** (quién vio o tocó qué historial) y puede hacerte responsable de lo que otra persona haga con tu usuario (kit INCIBE, p. 5).
4. **Puestos compartidos** (tablet de planta, PC de sala común): la solución no es una clave común, sino **usuario individual + cierre/bloqueo de sesión + 2FA + perfiles mínimos**. La AEPD cita expresamente como conducta a evitar «no apagar el ordenador» (dejarlo accesible) y «compartir claves y contraseñas» (Guía AEPD sector sanitario, p. 17).
5. **2FA/verificación en dos pasos** explicable en llano: «la contraseña es la llave; el 2FA es el segundo cerrojo». Preferir app autenticadora, aviso en el móvil o llave física antes que SMS (CCN-CERT BP/35, §10.1).
6. **Passkeys** (llaves de acceso): se mencionan como futuro cercano, no como obligación; Google avisa de **no crearlas en dispositivos compartidos**.
7. **Google Workspace/Drive:** 2SV activable por la organización; en Drive, preferir acceso «Restringido» frente a «Cualquier persona con el enlace»; revisar «Personas con acceso» y cerrar sesión en dispositivos.
8. **Si sospechas:** avisa a tu responsable/IT *ya*, cambia la clave desde un dispositivo de confianza, cierra sesiones, activa 2FA, cambia las que repitan; 017 de INCIBE (gratuito y confidencial).
9. **Mínimo privilegio:** cada puesto ve solo lo que necesita; AEPD: el acceso a la historia clínica se limita a datos precisos y el personal administrativo solo a los datos necesarios para sus funciones.
10. **Material kit INCIBE 05_Contraseñas** aprovechable: 2 PNG cuadrados (consejos) y 3 pósteres, más estructura y estilo de su test de 10 preguntas (con los matices de actualización del §5).

Distribución sugerida de tiempo (100 min): ver §2 (cada bloque lleva su duración).

---

## 2. Contenido didáctico estructurado (bloques → pantallas)

Convenciones: lenguaje llano, frases cortas, ejemplos de centro sociosanitario. «Pantalla» = pantalla sugerida del SCORM. Tiempos orientativos incluyen actividad.

### Bloque 0 · Bienvenida y por qué importa (6 min)
- **P0.1 Gancho.** «En el centro, una contraseña abre la puerta a datos de salud de residentes y familias». Los datos de salud son categoría especial y la AEPD pide acceso limitado a quien lo necesita (Guía AEPD, p. 10).
- **P0.2 Idea clave INCIBE:** en el control de accesos «el nombre de usuario nos identifica y la contraseña nos autentica» (kit INCIBE, p. 3). Explicar con un ejemplo: *el nombre del usuario es tu nombre en la puerta; la contraseña es la llave*.
- **P0.3 Tres tipos de «prueba» de identidad** (kit INCIBE p. 3 / pptx d5; CCN-CERT BP/35 §10): algo que **sabes** (contraseña, PIN), algo que **tienes** (móvil, llave), algo que **eres** (huella, cara). Mini-quiz de clasificar: PIN de la tablet (sabes), huella (eres), código del móvil (tienes).
- **Objetivos del curso** (4-5 viñetas).

### Bloque 1 · Qué es una contraseña segura hoy (14 min)
- **P1.1 La longitud manda.** CCN-CERT BP/35: «una contraseña de 8 caracteres (mezclando letras, números y símbolos) puede ser vulnerada por fuerza bruta en minutos u horas»; una *passphrase* de 25 caracteres «incluso compuesta únicamente por letras» podría tardar «miles de años». Ejemplos de tiempo de la propia guía (fuerza bruta, tabla de Hive Systems citada por el CCN): `M4dr1d!25` ≈ 3 horas; `EnunlugardelaMancha!25` ≈ 9.434.088.127.396 siglos (cifra tal cual la da el informe; **no la reproduzcas como dato propio**, atribúyela al CCN).
- **P1.2 Qué es una frase de paso (passphrase).** Varias palabras con sentido para ti, no adivinable. CCN: entre 16 y 100 caracteres; decálogo punto 3: «al menos, 20 caracteres».
- **P1.3 Cómo construirla (en 4 pasos, método propio inspirado en CCN BP/35 y OSI):**
  1. Elige una frase que NO sea pública sobre ti (no mascota, no fechas de nacimiento, no familiares: CCN §3b y OSI).
  2. Júntala con mayúsculas intercaladas: `MiPrimerTurnoFueEnInvierno`.
  3. Añade algún número y símbolo **intercalados** (CCN: «una buena medida es que los símbolos y los números estén intercalados en el texto»): `MiPrimerTurnoFue7EnInvierno!`.
  4. **No reutilices** la frase en otro servicio.
  Ejemplos que da el CCN (para inspirarse, no para copiar): `ElQueLeeMuchoYAnda7MuchoVeMuchoYSabeMucho*`, `LamúsicadeSabinaesmiBSO1999*`. **No uses estos ejemplos exactos en el curso como claves «reales»** y advierte de que ya son públicos.
- **P1.4 Qué NO hacer con «las trampas de siempre»:** sustituir TODAS las letras por números/símbolos de forma predecible (`E→3`, `a→@`): «patrones ampliamente conocidos por los atacantes»; sustituir solo algunas (CCN p. 13-14). El método antiguo del kit (`EuldlMCd2019!` por iniciales) y el de OSI («Mi cuenta segura» → `M1Cu3nt4S3gur4!`) funcionan como idea mnemotécnica pero el curso debe presentar la frase larga como preferida.
- **P1.5 Dónde NO comprobar tu contraseña real.** CCN BP/35: no verificar la robustez en webs de «medidores» porque «nuestra passphrase pasará a formar parte de diccionarios»; «se podrá probar con una similar». Esto es **clave para el simulador** del curso (ver §6: el simulador debe ejecutarse en local, sin enviar nada, y avisar de no escribir la clave real).
- **P1.6 Para las claves que no puedes recordar:** gestor de contraseñas (bloque 4) o generador. Las respuestas a «olvidé mi contraseña» tampoco deben ser reales: poner «cosas aleatorias no predecibles» (CCN decálogo 9).
- **P1.7 PIN del puesto/tablet.** El PIN corto es una excepción: se usa junto con el dispositivo físico, bloqueo tras intentos, etc. (CCN BP/35 usa el ejemplo del PIN de 4 dígitos del cajero: seguro por el contexto: tarjeta + límite de intentos + vigilancia). No lo extrapoles a una cuenta en internet.

### Bloque 2 · Errores comunes, reutilización y credential stuffing (9 min)
- **P2.1 Los 6 errores típicos** (OSI «Típicos errores que cometemos al usar nuestras contraseñas», 20-feb-2019): reciclar la misma con pequeñas variaciones; patrones de teclado (`123456`, `qwerty`); frases predecibles (`teamo`, `iloveyou`); intereses personales (equipo, grupo, marca); anotarlas en cuadernos o post-it visibles; seguir una fórmula previsible (Mayúscula + minúsculas + números + signo). Para un centro sociosanitario: el post-it bajo el teclado del control de enfermería; el nombre del centro + año.
- **P2.2 Reutilizar = «llave maestra».** Kit INCIBE p. 5: reutilizar es «uno de los errores más comunes»; si se filtra una, «todos los servicios que utilizan la misma contraseña se verían comprometidos».
- **P2.3 Credential stuffing en llano.** INCIBE («Con estos ataques nos roban las contraseñas…», 5-may-2022): los atacantes prueban de forma automática pares usuario/contraseña robados en filtraciones en muchos servicios. CCN BP/35: «uso automatizado de credenciales filtradas para acceder a otros servicios». Ejemplo: la contraseña de tu tienda online se filtra → la prueban en el correo y en el software del centro.
- **P2.4 Cómo te roban una contraseña** (resumen INCIBE 2022): ataque de fuerza bruta, de diccionario, credential stuffing, *phishing* (correo falso), *smishing* (SMS), *vishing* (llamada), *shoulder surfing* (mirarte teclear en sitios públicos; en centro sociosanitario, delante de otros trabajadores o familiares), *keylogger*. Que el alumno reconozca 3: phishing, shoulder surfing, reutilización.

### Bloque 3 · Contraseñas compartidas en turnos (14 min)
- **P3.1 Por qué no se comparte** (fuentes):
  - Responsabilidad: si otra persona hace algo con tus credenciales, «aparecerá registrado como si lo has hecho tú» (kit INCIBE p. 5).
  - Trazabilidad: INCIBE («Menos es más, controla el acceso a la información», 12-sep-2019) y su política de control de acceso: la prohibición de compartir claves es esencial «para garantizar la confidencialidad y trazabilidad de las acciones»; los usuarios genéricos «impiden rastrear» lo que se hace (extracto de resultados leídos en búsqueda INCIBE; ver §8 URL).
  - AEPD (Guía profesionales sector sanitario, p. 17): deben evitarse conductas como «compartir claves y contraseñas» o «no apagar el ordenador» dejando acceso a cualquiera.
  - Cartel INCIBE «Las contraseñas, como el cepillo de dientes, son solo para TU USO».
- **P3.2 Caso real citado (AEPD):** en la resolución **PS/00587/2021**, la AEPD apercibió a una Consejería de Sanidad por accesos indebidos a una historia clínica: una profesional accedió a la historia clínica de una compañera con **sus propias claves** y sin relación asistencial; la AEPD apreció infracción del art. 5.1.f y del art. 32 RGPD. La administración alegó segregación de perfiles y registro de accesos. Mensaje: **los accesos quedan registrados con tu nombre**; entrar «por curiosidad» a un expediente que no atiendes es una infracción aunque tengas permiso técnico. (Fuente: PDF de la resolución leído en local; **[URL pública exacta no verificada]**, citar por número de expediente.)
- **P3.3 Alternativas reales para el turno:** (a) usuario individual para cada trabajador en el software del centro y en Google Workspace; (b) cierre de sesión al terminar el turno y cambio de usuario rápido; (c) inicio rápido por PIN/biometría de la tablet y credenciales de la aplicación personales; (d) si el centro tiene una cuenta genérica de sala por necesidad técnica, solo para tareas sin datos personales y gestionada por la dirección, con contraseña guardada en un gestor de equipo (no en un papel); (e) si una persona no tiene usuario aún: pedirlo a su responsable, no «prestarse» el de una compañera.
- **P3.4 Compartir información que necesitas** (kit INCIBE p. 5: «cuando necesitamos un documento que se encuentra en nuestro ordenador o en el correo»): compartir **el archivo**, no la clave: enlace de Drive a una persona concreta con permiso de lector (bloque 6). CCN BP/35 §3d: no enviar credenciales por correo/mensajería; si no hay medio seguro, no mandar usuario y contraseña por el mismo canal.
- **P3.5 «Si me lo pide mi jefe/una compañera de confianza»:** guion corto: «Te creo, pero no puedo; te ayudo a pedirte tu usuario / a compartirte el documento». Y avisar al responsable de seguridad/IT.
- Actividad: «Tablet de planta» (ver §6).

### Bloque 4 · Gestores de contraseñas (7 min)
- **P4.1 Qué es:** una caja fuerte digital protegida por **una sola contraseña maestra** (kit INCIBE p. 6; OSI «Gestores de contraseñas: ¿cómo funcionan?», 27-ene-2021). Genera claves aleatorias, guarda y autorrellena, puede avisar de claves débiles o filtradas, y funciona en varios dispositivos.
- **P4.2 Riesgo clave:** la contraseña maestra: «si esta no es lo suficientemente segura el resto de servicios tampoco lo serán» (kit p. 6). CCN BP/35 (§9): pasos para cambiarla; usar una passphrase mnemotécnica.
- **P4.3 Tipos:** en la nube (cómodos, dependen de la seguridad del proveedor) frente a locales (más seguros, menos cómodos) — OSI 2021. OSI ofrece herramientas gratuitas (KeePass y KeeWeb figuran en su sección de «herramientas gratuitas»: https://osi.es/es/herramientas-gratuitas/keepass).
- **P4.4 Qué decir a la plantilla de centro sociosanitario:** «el gestor de contraseñas lo decide la empresa; no instales el tuyo en el PC del centro sin permiso». Un gestor corporativo permite además compartir credenciales de equipo y revocarlas al irse alguien (afirmación recogida de un resultado de búsqueda sobre una guía técnica; **[no leída en fuente oficial INCIBE completa, tratar como orientación]**).
- **No hacer:** guardar contraseñas en notas del móvil, en WhatsApp a ti mismo, en un Excel «contraseñas.xlsx» en el escritorio.

### Bloque 5 · Verificación en dos pasos, MFA y passkeys en llano (11 min)
- **P5.1 Idea:** «Aunque alguien tenga tu contraseña, no puede entrar sin tu móvil». Palabras de Google: «un hacker podría robar o adivinar una contraseña, pero no puede reproducir algo que solo tú tienes» (Google Workspace, ayuda del administrador, versión en español).
- **P5.2 Métodos** (Google Workspace/INCIBE/CCN): aviso en el móvil («Google prompt»: un toque), app autenticadora (código de 6 dígitos que cambia cada 30 s), llave de seguridad física/NFC (la más resistente al phishing), huella/cara como segundo factor, códigos de respaldo; SMS aceptable pero **menos recomendable** (CCN: vulnerable a *SIM swapping*; «priorizar aplicaciones autenticadoras o llaves de seguridad físicas frente al uso de SMS»).
- **P5.3 Buenas prácticas** (CCN BP/35 §10.1): activarlo en correo, gestor, banca, plataformas de trabajo; **guardar los códigos de respaldo** en lugar seguro (no en capturas ni correo); ¡**nunca dar el código a nadie**! «Ningún servicio legítimo pedirá esos datos por correo, SMS o llamada». Antes de cambiar de móvil, transferir la app autenticadora.
- **P5.4 Fatiga de aviso / «prompt bombing»:** **[no leído en las fuentes consultadas; no incluir como dato; si se menciona, hacerlo sin cifras]**. Regla simple y segura: si te llega un aviso de inicio de sesión que no has iniciado tú, **di «No» y avisa**.
- **P5.5 Pasos para activar 2SV en una cuenta Google** (Google, «Activar la verificación en dos pasos»): entra en la cuenta → Seguridad e inicio de sesión → «Cómo inicias sesión en Google» → activar verificación en dos pasos → elegir método (Google recomienda la notificación en el móvil: «es más fácil tocar una notificación que introducir un código»). Para cuentas gestionadas de Workspace, quien lo habilita/obliga es el administrador de la organización: Admin > Seguridad > Autenticación > Verificación en dos pasos.
- **P5.6 Passkeys (llaves de acceso)** en 3 frases: se entra con huella, cara o el PIN del móvil, **sin escribir contraseña**; no hay contraseña que robar ni que se pueda dar por error («no pueden compartirse, copiarse ni facilitarse a otra persona», Google); no todos los servicios las admiten aún (INCIBE blog «Passkeys: inicia sesión sin contraseñas de forma segura»). **Advertencia Google:** «no crees una llave de acceso en un dispositivo compartido»; si la creas, «cualquier persona que pueda desbloquear tu dispositivo podrá acceder a tu cuenta». Esto enlaza directamente con la tablet de planta.
- **Terminología para el alumno:** «verificación en dos pasos», «segundo factor», «2FA» y «MFA» (varios factores) se usan casi como sinónimos; en el curso, usar **«verificación en dos pasos»** y explicar «2FA» una vez.

### Bloque 6 · Cuenta de Google Workspace y Drive del centro (11 min)
- **P6.1 Qué es:** tu cuenta del centro (`nombre@centro…`) abre correo, Drive y documentos de residentes. Tiene más valor que tu cuenta personal.
- **P6.2 Compartir en Drive** (Ayuda de Google Drive): roles **Lector** (ver y descargar), **Comentador** (comentar), **Editor** (editar y compartir; no cambia el propietario). Acceso general: **Restringido** (solo quien tú añadas) o **Cualquier persona con el enlace** (cualquiera con el enlace, sin cuenta Google). Regla para el curso: con datos de residentes, siempre **Restringido** y a personas concretas; «cualquiera con el enlace» solo para material sin datos personales y con permiso del centro.
- **P6.3 Revisar «Personas con acceso»** desde el cuadro Compartir; quitar el acceso cuando ya no haga falta (fin de un turno extra, suplencia que termina, familiar que ya no debe ver un documento).
- **P6.4 Cerrar sesión y dispositivos** (Ayuda de Cuenta de Google): en `myaccount.google.com` → Seguridad → «Tus dispositivos / Gestionar todos los dispositivos» → elegir dispositivo → Cerrar sesión; si no reconoces un dispositivo, ciérralo y revisa tu seguridad. En dispositivo que no es tuyo: usar **ventana privada o perfil de invitado** y cerrar sesión al acabar; no marcar «No volver a preguntar en este dispositivo» en equipos compartidos.
- **P6.5 Administrador:** puede cerrar la sesión de un usuario (p. ej., dispositivo perdido o persona que se va) — Google Workspace, ayuda del administrador. Dirigida a dirección/IT.
- **P6.6 Phishing de Google/Drive:** antes de introducir la clave, comprobar la dirección y la conexión HTTPS (CCN §3f). Recordar curso de phishing (otro módulo del programa).

### Bloque 7 · Si sospechas que te han robado la contraseña / filtraciones (7 min)
- **P7.1 Señales** (inventadas por el curso a partir de la lógica de las fuentes; **no cuantificar**): no puedes entrar, te llegan avisos de inicio de sesión que no has hecho, aparecen correos enviados que no recuerdas, un compañero ve cambios que «tú» hiciste.
- **P7.2 Pasos (INCIBE «Me robaron la cuenta, ¿qué hago?», 18-nov-2020 + CCN BP/35):** 1) seguir las indicaciones de recuperación del servicio; 2) poner una contraseña robusta nueva y activar 2FA; 3) **comprobar si otras cuentas se han visto afectadas** y cambiar las que repitan la contraseña (todas distintas); 4) guardar pruebas (capturas); 5) denunciar si hay fraude. **Para el trabajador de centro sociosanitario añadir:** «avisa a tu responsable / informática **inmediatamente**» (el centro debe valorar una posible brecha de datos: ver curso de incidentes). Línea **017** de INCIBE, gratuita y confidencial (también WhatsApp 900 116 117 y Telegram @INCIBE017, según INCIBE).
- **P7.3 Comprobar filtraciones.** OSI/INCIBE recomiendan **HAVE I BEEN PWNED** en sus artículos (OSI «Típicos errores…», 2019; INCIBE «Me robaron la cuenta», 2020); CCN BP/35 §3e recomienda «comprobar filtraciones mediante servicios especializados». HIBP es un servicio gratuito creado por Troy Hunt (haveibeenpwned.com/About). **Cómo funciona la comprobación de contraseñas sin enviar la clave:** la API «Pwned Passwords» usa *k-anonymity*: solo se envían los 5 primeros caracteres de un hash. Para la plantilla: comprobar el **correo** (no la contraseña) en haveibeenpwned.com; **nunca escribas tu contraseña real** en webs de terceros (CCN BP/35). Con correo del trabajo, avisar primero al centro (política interna).
- **P7.4 Actualizar tras incidente:** «renovarse inmediatamente si hay sospechas de acceso no autorizado» (CCN §3).

### Bloque 8 · Biometría, bloqueo de pantalla y cierre de sesión en puestos compartidos (7 min)
- **P8.1 Bloqueo de pantalla** (INCIBE «Bloqueo de dispositivos: patrón, contraseña, PIN, código y biometría»): patrón (pocas combinaciones, se ve al desbloquear), PIN, contraseña, huella/cara («muy precisas»; pueden fallar con heridas o envejecimiento). **Combinar al menos dos medidas** (p. ej. cara + PIN). Bloqueo automático lo antes posible.
- **P8.2 En el puesto** (kit INCIBE 06 «Puesto de trabajo», p. 5): bloquear siempre que te levantes: Windows **Win + L**; en móviles y tablets bloqueo de pantalla «en el menor tiempo posible y preferiblemente por contraseña o biométrico»; bloqueo automático por inactividad con ayuda de informática; al terminar la jornada, apagar los equipos y guardar portátiles/móviles bajo llave.
- **P8.3 Biometría en tablet compartida:** ojo. Si varias personas registran su huella en la misma tablet, **todas** abren esa tablet. **[Consejo propio, no extraído de fuente: validar con el responsable de IT del centro]**. En tablets de planta, las huellas deben ser de uso individual o, si es compartida, usar sesiones/usuarios separados.
- **P8.4 Si dejas la sesión abierta:** cualquiera puede actuar a tu nombre (kit puesto de trabajo, p. 5: «enviado un correo electrónico haciéndose pasar por quien no es»).
- **P8.5 Cierre de sesión:** fin de turno = cerrar sesión (no solo bloquear) en equipos compartidos; no guardar contraseñas en el navegador de un equipo compartido.

### Bloque 9 · Perfiles de acceso y mínimo privilegio en un centro sociosanitario (7 min)
- **P9.1 Definición** (INCIBE): reducir al mínimo el impacto de posibles fallos «reduciendo los permisos de las cuentas de usuario a los necesarios»; «no todos los empleados tienen que poder acceder a toda la información»; revisar periódicamente los permisos; al causar baja, retirar accesos con la misma rigor que se devuelven las llaves (INCIBE, 12-sep-2019).
- **P9.2 Qué dice la AEPD para salud** (Guía profesionales del sector sanitario): acceso a la historia clínica limitado al profesional o equipo directamente implicado en la asistencia; los profesionales de centros sociosanitarios «deben poder acceder a las HC de los pacientes que están tratando»; el acceso «estará limitado únicamente a los datos que sean precisos»; el personal administrativo accede solo a los datos necesarios para su función; estudiantes con perfil limitado (consulta, tiempo). **Además**, guardar registros de acceso (identificación, fecha y hora, qué se accedió, tipo y si fue autorizado o denegado) (p. 16).
- **P9.3 Propuesta de matriz «quién ve qué»** (ilustrativa, **no normativa**; adaptar a cada centro con su DPD): ver tabla en §6.4.
- **P9.4 Qué hacer si ves más de lo que necesitas:** avísalo; no lo uses. Y si cambias de puesto, pide actualizar el perfil.
- **P9.5 Cuentas de administración:** Google exige 2SV para administradores («las cuentas de administrador representan el punto de acceso con mayor privilegio»). Dirección/IT: separar cuenta de administrador y de uso diario (idea INCIBE de limitar administradores «a los estrictamente necesarios»).

### Bloque 10 · Casos por rol y cierre (7 min)
- Escenarios por rol (§6.2), resumen de 8 reglas de oro, test final (§7), enlace a 017 y a la política interna.

**8 reglas de oro (resumen final):**
1. Tu usuario y tu clave son tuyos. No se prestan.
2. Frase larga (mínimo 16-20 caracteres), única para cada servicio.
3. Verificación en dos pasos en la cuenta del centro y en tu correo.
4. Nunca des un código que te llegue al móvil.
5. Termina el turno: cierra sesión. Te levantas: bloquea (Win+L / bloqueo móvil).
6. Comparte archivos, no contraseñas. En Drive, acceso restringido.
7. Solo miras lo que necesitas para tu trabajo.
8. Si dudas o sospechas: avisa ya al responsable y, si hace falta, llama al 017.

---

## 3. Datos citados (fuente · enlace · fecha)

### 3.1 Datos y afirmaciones verificadas

| # | Dato | Fuente | Enlace | Fecha |
|---|---|---|---|---|
| 1 | Passphrase ≥20 caracteres (decálogo 3); «la longitud es el principal factor de seguridad, incluso más importante que el uso excesivo de símbolos o la rotación constante de contraseñas»; passphrase entre 16 y 100 caracteres | CCN-CERT BP/35 *Uso y gestión de contraseñas*, §4 y §11 | https://angeles.ccn-cert.cni.es/es/docman/documentos-publicos/informes-de-buenas-practicas/432-ccn-cert-bp-35-informe-contrasenas/file | mayo 2026 (portada) |
| 2 | Ejemplos de tiempo para romper por fuerza bruta: `M4dr1d!25` ≈ 3 horas; `EnunlugardelaMancha!25` ≈ 9.434.088.127.396 siglos (tabla Hive Systems, citada con autorización) | CCN-CERT BP/35, §3b y fig. 1 | ídem | mayo 2026 |
| 3 | «Una contraseña de 8 caracteres ... puede ser vulnerada ... en minutos u horas»; passphrase de 25 caracteres solo letras, «miles de años» | CCN-CERT BP/35, §4a | ídem | mayo 2026 |
| 4 | No usar SMS como 2FA por *SIM swapping*; preferir apps autenticadoras o tokens; guardar códigos de respaldo fuera de correo/capturas; no dar códigos 2FA a nadie | CCN-CERT BP/35, §10.1 | ídem | mayo 2026 |
| 5 | Renovar passphrases solo si hay sospecha o exposición; las largas «no requieren una rotación frecuente» | CCN-CERT BP/35, §3 | ídem | mayo 2026 |
| 6 | Credential stuffing = «uso automatizado de credenciales filtradas para acceder a otros servicios» | CCN-CERT BP/35, §2 | ídem | mayo 2026 |
| 7 | Contraseñas ≥15 caracteres si son único factor; ≥8 si solo se usan en MFA; admitir hasta 64; **sin reglas de composición**; **sin cambios periódicos obligatorios** (sí si hay compromiso); comparar con lista de claves comprometidas; permitir pegar y gestores | NIST SP 800-63B-4, §3.1.1.2 | https://pages.nist.gov/800-63-4/sp800-63b.html | Rev. 4, 26-ago-2025 |
| 8 | NIST: los autenticadores sincronizables (passkeys sincronizadas) no se permiten en AAL3 pero sí en niveles inferiores | NIST SP 800-63B-4, §2.3.2 | ídem | 26-ago-2025 |
| 9 | Pasos de contraseña de OSI/INCIBE: frase → mayúsculas → cifras por letras → símbolos → personalizar por servicio; «longitud mínima recomendada es de 10 caracteres»; consejos: gestor, no repetir, cambiar «cada cierto tiempo (3 meses)», no compartir, verificación en dos pasos, ocultar caracteres al teclear | OSI/INCIBE, *Crea tu contraseña segura paso a paso* (PDF) | https://www.incibe.es/sites/default/files/docs/osi-crear_contrasena-robusta.pdf | s. f. (**fecha no figura**) |
| 10 | Kit INCIBE: longitud mínima 8; mezcla de mayúsculas/minúsculas/números/símbolos; no compartida; no repetida; 2FA «siempre que sea posible»; gestor; contraseña maestra robusta | Kit de concienciación INCIBE, 05_Contraseñas (pp. 4-6) | ruta local, ver §5 | s. f. (ejemplo con año 2019 en el texto) |
| 11 | Errores típicos de contraseñas (6) y recomendación de Have I Been Pwned | OSI, *Típicos errores que cometemos al usar nuestras contraseñas, y cómo corregirlos* | https://www.incibe.es/ciudadania/blog/tipicos-errores-que-cometemos-al-usar-nuestras-contrasenas-y-como | 20-feb-2019 |
| 12 | Gestores: base cifrada con contraseña maestra; nube vs. local; alertas de contraseñas débiles; riesgo en la nube | OSI/INCIBE, *Gestores de contraseñas: ¿cómo funcionan?* | https://www.incibe.es/ciudadania/blog/gestores-de-contrasenas-como-funcionan | 27-ene-2021 |
| 13 | Tipos de ataque a contraseñas: fuerza bruta, diccionario, credential stuffing, password spraying, phishing, smishing, vishing, shoulder surfing, keylogger… | INCIBE, *Con estos ataques nos roban las contraseñas, ¡aprende a evitarlos!* | https://www.incibe.es/empresas/blog/estos-ataques-nos-roban-las-contrasenas-aprende-evitarlos | 5-may-2022 |
| 14 | Pasos si te roban una cuenta: recuperar con el servicio, nueva clave + 2FA, comprobar otras cuentas (HaveIBeenPwned), cambiar claves repetidas, denunciar con pruebas | INCIBE, *Me robaron la cuenta, ¿qué hago?* | https://www.incibe.es/ciudadania/blog/me-robaron-la-cuenta-que-hago | 18-nov-2020 |
| 15 | Línea de Ayuda en Ciberseguridad **017** (gratuita, confidencial); WhatsApp 900 116 117; Telegram @INCIBE017 | INCIBE (infografía y resultados de «robo de cuentas») | https://www.incibe.es/ciudadania/blog/me-robaron-la-cuenta-que-hago | — |
| 16 | Principio de mínimo privilegio; gestión por grupos; revisiones periódicas; revocar accesos a las bajas | INCIBE, *Menos es más, controla el acceso a la información* | https://www.incibe.es/empresas/blog/menos-mas-controla-el-acceso-informacion | 12-sep-2019 |
| 17 | Acceso a historia clínica limitado a datos precisos; centros sociosanitarios pueden acceder a HC de pacientes que tratan; evitar «compartir claves y contraseñas» y dejar el ordenador accesible; registro de accesos; «cambiar las contraseñas ... como mínimo una vez al año» | AEPD, *Guía para profesionales del sector sanitario* (pp. 10, 16, 17) | https://www.aepd.es/guias/guia-profesionales-sector-sanitario.pdf | **fecha de edición no localizada en el texto leído** |
| 18 | Caso de acceso indebido a una HC con claves propias; apercibimiento por arts. 5.1.f y 32 RGPD; el organismo alegó segregación de perfiles y principio de mínimo privilegio (ENS op.acc.3) | AEPD, resolución PS/00587/2021 | **URL pública no verificada** (PDF leído en local) | **fecha exacta no confirmada** (el pie del documento incluye un código «938-120722») |
| 19 | Passkey = acceso con huella, rostro o PIN; clave pública en el servidor, privada en tu dispositivo; antiphishing; no todos los servicios la admiten | INCIBE, *Passkeys: inicia sesión sin contraseñas de forma segura* | https://www.incibe.es/ciudadania/blog/passkeys-inicia-sesion-sin-contrasenas-de-forma-segura | la página muestra 30-sep-2026 (lectura de herramienta; verificar al publicar) |
| 20 | Passkey de Google: no crear en dispositivo compartido; aunque cierres sesión, quien desbloquee el dispositivo accede | Google Cuenta, *Iniciar sesión con una llave de acceso* | https://support.google.com/accounts/answer/13548313?hl=es | consultado 5-oct-2026 |
| 21 | Métodos 2SV de Google (notificación, passkey, llave física, app, SMS, códigos de respaldo de 8 dígitos); no dar los códigos de respaldo | Google Cuenta, *Activar la verificación en dos pasos* | https://support.google.com/accounts/answer/185839?hl=es | consultado 5-oct-2026 |
| 22 | Workspace: 2SV, llaves de seguridad «la forma más segura», administrador puede exigirla; Google exige 2SV a administradores | Google Workspace Admin | https://support.google.com/a/answer/175197?hl=es (redirige a knowledge.workspace.google.com/admin/security/protect-your-business-with-2-step-verification) | consultado 5-oct-2026 |
| 23 | Drive: roles Lector/Comentador/Editor; acceso Restringido vs. Cualquier persona con el enlace; ver y gestionar «Personas con acceso» | Ayuda de Google Drive | https://support.google.com/drive/answer/2494822?hl=es | consultado 5-oct-2026 |
| 24 | Ver y cerrar sesión de dispositivos con acceso a la cuenta | Ayuda de Cuenta de Google | https://support.google.com/accounts/answer/3067630?hl=es | consultado 5-oct-2026 |
| 25 | Dispositivo ajeno: ventana privada/perfil de invitado y cerrar sesión | Ayuda de Cuenta de Google | https://support.google.com/accounts/answer/2917834?hl=es | consultado 5-oct-2026 |
| 26 | Métodos de bloqueo: patrón, PIN, contraseña, código (Apple), biometría; combinar al menos dos | INCIBE, *Bloqueo de dispositivos* | https://www.incibe.es/ciudadania/tematicas/dispositivos-moviles/bloqueo-dispositivos | — |
| 27 | Win+L; bloqueo automático por inactividad; apagar y guardar bajo llave al fin de jornada | Kit INCIBE 06_PuestoTrabajo, p. 5 | ruta local | s. f. |
| 28 | HIBP: servicio gratuito de Troy Hunt; API Pwned Passwords con *k-anonymity* (5 primeros caracteres del hash) | haveibeenpwned.com | https://haveibeenpwned.com/About y https://haveibeenpwned.com/API/v3 | consultado 5-oct-2026 |

### 3.2 Discrepancias entre fuentes (importante para el redactor)

| Tema | INCIBE/OSI (material antiguo) | AEPD | CCN-CERT BP/35 (2026) | NIST 800-63B-4 (2025) | Recomendación del curso |
|---|---|---|---|---|---|
| Longitud | 8-10 mín. | — | ≥20 (frase) | ≥15 si único factor; ≥8 con MFA | Frase de **16-20+** caracteres |
| Complejidad | mezclar tipos | — | longitud y naturalidad, símbolos intercalados | **prohibido imponer** | No obsesionarse con símbolos; frase larga |
| Cambios | cada 3 meses (OSI 2019/ficha), 6 meses (INCIBE web) | mín. una vez al año | solo si sospecha; política interna por criticidad | **no cambios periódicos** | Cambiar **tras sospecha**; seguir la política del centro si la tiene (ej. anual) |
| Compartir | nunca | evitar | no por correo/mensajería | — | Nunca |
| SMS como 2FA | citado como opción | — | no recomendable | — | Mejor app/aviso/llave |

---

## 4. Vídeos verificados (YouTube)

Verificación: oEmbed (`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json`) realizada para cada ID el 5-oct-2026 (título y canal exactos). **Limitaciones:** no he podido reproducirlos; la **duración** solo la he podido leer para los 2 marcados (el resto: no verificada porque YouTube bloqueó las consultas automáticas), y **no he podido comprobar el contenido** de ninguno. Verificar duración y contenido manualmente antes de incrustar.

| ID | Título exacto (oEmbed) | Canal | Duración | Pantalla que ilustraría |
|---|---|---|---|---|
| `Fd87JLBz5Ac` | Ventajas de utilizar un gestor de contraseñas | Oficina de Seguridad del Internauta | **174 s (2 min 54 s)** leída | Bloque 4 (gestores). Mejor candidato. |
| `fm6zRlkljWo` | El Comisario Tito Valverde te recomienda usar contraseñas fuertes | Policía Nacional | no verificada | Bloque 1 (gancho de contraseñas fuertes). Tono ameno. |
| `vQiXPOASpZs` | Campaña de ciberseguridad: Contraseñas seguras. Día Internacional de la Seguridad Informática. | Guardia Civil | no verificada | Bloque 1 o 2 (consejos de contraseñas). |
| `FDaYYuoss4A` | 🔐 ¿Protege tus cuentas con la doble verificación? #guardiacivil #062 | Guardia Civil | no verificada (formato vertical/corto por sus etiquetas, sin confirmar) | Bloque 5 (verificación en dos pasos). |
| `vqmsasBXbVg` | Utiliza contraseñas robustas. #juntosportuseguridaddigital | Guardia Civil | no verificada (formato corto, sin confirmar) | Bloque 1 (recordatorio). |
| `8eYY8kvd0l8` | Línea 017 de INCIBE - Tu ayuda en #ciberseguridad para ciudadanos | INCIBE | no verificada | Bloque 7 (qué hacer si sospechas: llamar al 017). |
| `4RJkZAeN8aM` | Campaña PROTÉGETE INCIBE - OSI | INCIBE | **22 s** leída | Cierre o portada del curso (spot general). |
| `k6_7ZH4Rx-8` | "Despierta" - Oficina de Seguridad del Internauta | INCIBE | **40 s** leída | Portada/gancho del curso (spot de concienciación general). |

**Descartados:**
- `TDeKmByhOYg` «Vídeo formativo: contraseñas/passwords/passcode» (OSI): oficial pero dura **2576 s (≈43 min)**; no cumple <5 min.
- `n0vvSJJCFbs` «Contraseñas robustas OSI-INCIBE»: canal «JusticiaDigital@Learning» (no oficial de INCIBE).
- `dWmPIFkRHp4` «¿Tu contraseña es el nombre de tu mascota?» (INCIBE): oEmbed responde, pero yt-dlp devuelve «This video is not available» → no se incluye.
- Vídeos de 2FA encontrados de otros canales (Cespi UNLP, Conexion Segura, Arsys…): no oficiales para este fin.

**Carencia:** no he localizado vídeo oficial breve en español sobre *passkeys* ni sobre «Drive/Workspace». Para Google, usar capturas propias o Google Workspace Learning Center (no verificado).

---

## 5. Material del kit INCIBE utilizable

Ruta base: `C:\Users\Jose Alberto Arruego\Downloads\kit_concienciacion\kit_concienciacion\RecursosFormativos\05_Contraseñas\`

| Recurso | Ruta relativa | Uso propuesto |
|---|---|---|
| Contenido formativo (PDF, 8 págs.) | `05_Contraseñas.pdf` | Fuente: importancia de contraseñas (p. 3), robustez y ejemplo mnemotécnico (p. 4), no compartida/no repetir (p. 5), 2FA y gestores (p. 6), referencias (p. 7). |
| Ficha (PDF, 1 pág.) | `Ficha\05_Contraseñas.pdf` | Resumen descargable al final del curso (solo si el logo/licencia lo permiten). |
| Presentación (PPTX, 17 diapositivas) | `Presentacion\05_Contraseñas.pptx` | d4 (usuario/identificación/contraseña/autenticación), d5 (factores), d8-d11 (robustez y regla mnemotécnica), d13-d16 (compartida, única, 2FA, gestores). Inspiración de estructura. |
| Test de evaluación (PDF) | `Test_evaluacion\05_Test_Contraseñas.pdf` | Ver formato y matices más abajo. |
| Consejos PNG 801×801 | `Consejos\0501_Contraseñas.png` («Tu CONTRASEÑA es la puerta de entrada a tu información») | Portada o P0.1. |
| | `Consejos\0502_Contraseñas.png` («Las contraseñas, como el cepillo de dientes, son sólo para TU USO») | **Bloque 3** (no compartir). Imagen muy didáctica. |
| Póster 4962×7016 vertical | `Posters\0501_Contraseñas.png` («¿Una contraseña robusta para cada servicio? Muy buena idea»: tres puertas) | Bloque 2 (reutilización/una por servicio). |
| Póster vertical | `Posters\0502_Contraseñas.png` («Una contraseña robusta te evitará muchos dolores de cabeza») | Bloque 1. |
| Póster apaisado 7016×4962 | `Posters\0503_Contraseñas.png` (mismo mensaje, horizontal) | Banner horizontal; en móvil usar el vertical. |
| Tríptico | `..\..\Tripticos\contraseñas.pdf` (ruta: `kit_concienciacion\Tripticos\`) | Resumen: contraseñas robustas, por defecto inseguras, 2FA en servicios críticos, personales e intransferibles, una por servicio, gestor. |
| Póster 017 | `..\..\Posters_presentacion\017_Linea_ayuda.jpg` | Bloque 7 (llamar al 017). **[No abierto en esta sesión.]** |
| Kit 06 Puesto de trabajo | `..\06_PuestoTrabajo\06_PuestoTrabajo.pdf` (p. 5) | Win+L, bloqueo y fin de jornada (P8.2). |

**Derechos:** los materiales llevan logos «Protege tu empresa / INCIBE»; revisar condiciones de reutilización (no comprobadas aquí) antes de incrustar en un SCORM.

### Formato del test de INCIBE (para inspirarnos sin copiar)
- 10 preguntas, **tipo test de 4 opciones (a-d), una sola correcta**; sin puntuación ponderada; **tabla de soluciones al final** (p. 6), sin explicación por respuesta.
- Mezcla de estilos: «indica la correcta», «¿cuál es falsa?» (P10), «todas las anteriores» como opción (P1, P6), definiciones («los gestores son…»), y un par de «caso» breve (¿cuál es la contraseña más robusta?).
- Distractores plausibles: confundir «difícil de recordar» con robusto; «compartir si el servicio no es crítico»; «cambiar cada tres meses» como regla; «2FA es dos contraseñas».
- **Puntos del test ya desfasados** que NO conviene heredar: P2 da por correcta «mín. 8 caracteres con números, mayúsculas, minúsculas y símbolos» (hoy: longitud/frase); P7 trata una clave corta con símbolos (`0cT4€Dro1990?`) como «la más robusta» (hoy la frase larga lo sería); P5 d) sugiere cambio cada tres meses como distractor aunque otros materiales INCIBE lo recomiendan (inconsistencia propia del kit).
- Lo que sí mejorar: **añadir explicación a cada respuesta** y feedback inmediato (el SCORM debe tenerlo).

---

## 6. Ideas de actividades interactivas y escenarios

### 6.1 Actividades

1. **«Simulador de fortaleza» (local, sin enviar datos).** El alumno escribe una clave *de prueba* (no real) y ve una barra con tiempo orientativo y consejos («más larga», «evita tu nombre»). Reglas: cálculo en el navegador, sin red; avisar «no escribas tu contraseña real» (CCN: no verificar claves reales en webs). Comparar 4 casos fijos: `Maria1234`, `M4r14!`, `MiPrimerTurnoFue7EnInvierno!`, `correcto caballo ...` (frases del propio curso). Mostrar *por qué* la larga gana. (Evitar cifras exactas de tiempos; usar «segundos / días / siglos» cualitativos y atribuir.)
2. **«Construye tu frase de paso» (arrastrar y soltar).** Piezas: frase base, número, símbolo, nombre de servicio; el alumno compone y el sistema valida longitud ≥16 y que no use datos personales (lista de «palabras prohibidas»: nombre de mascota, año de nacimiento…). No guardar nada.
3. **«Ordena los pasos para activar la verificación en dos pasos»** (5 pasos de Google: entrar a la cuenta → Seguridad → «Cómo inicias sesión en Google» → activar → elegir método y guardar códigos de respaldo). Tipo `ordenar` del editor.
4. **«Tablet de planta»: decidir qué hacer** (árbol de decisiones): el turno de noche deja la tablet abierta con la sesión de una compañera; ¿qué haces? Opciones: usarla; cerrarla y entrar con tu usuario y avisar; mandarle un WhatsApp con tu clave… Feedback con regla de oro.
5. **Clasificar «algo que sabes / tienes / eres»** (arrastrar a tres cajas): PIN, huella, SMS al móvil, app autenticadora, pregunta secreta, llave USB, cara.
6. **Verdadero/falso rápido «Mitos»:** «Una clave con @ y 1 es siempre segura», «Si tengo 2FA puedo usar 1234», «Compartir clave está bien si es de confianza», «El gestor guarda mi clave en un papel».
7. **Semáforo de Drive:** 6 situaciones de compartir (ficha de residente con «cualquiera con el enlace» = rojo; informe de turno a 3 compañeras concretas con permiso de lector = verde; cuadrante de turnos sin datos personales = amarillo/depende).
8. **«¿Quién ve qué?»:** emparejar rol ↔ permiso mínimo (tabla 6.4).
9. **Test final** con feedback (§7).

### 6.2 Escenarios por rol (breves, con decisión)

- **Gerocultor/a (turno de noche):** la tablet de planta tiene la sesión de otra compañera abierta; hay una incidencia de un residente a las 3:00. *Respuesta buena:* no actuar con su sesión; cerrar, entrar con la tuya, anotar con tu usuario y avisar a la compañera.
- **Auxiliar de enfermería:** compañera pide «tu clave un momento» porque no ha recibido su alta de usuario. *Buena:* no dar; avisar a supervisión/IT para dar de alta urgente.
- **Enfermería:** recibe «aviso de la dirección» por correo con enlace para «verificar tu contraseña del programa de historias». *Buena:* no abrir; reenviar a IT/seguridad; si hay duda, llamar por teléfono al centro.
- **Administración:** necesita enviar a una gestoría un listado con datos de residentes por Drive. *Buena:* compartir con acceso Restringido a esa persona concreta, rol Lector, y quitar acceso al terminar; nunca «cualquiera con el enlace».
- **Dirección:** una trabajadora que se marcha sigue con acceso. *Buena:* baja inmediata de usuario, retirada de permisos y cierre de sesiones (INCIBE: revocar accesos a las bajas); revisar permisos periódicamente.
- **Supervisión:** descubre un post-it con la clave del PC de la sala común. *Buena:* retirarlo, hablar con el equipo y pedir a IT que cree usuarios individuales; no culpar, corregir el sistema.
- **Mantenimiento:** no usa ordenador del centro, solo un móvil personal con mensajería del centro y el acceso al panel de las cámaras/aire. *Buena:* PIN/bloqueo + 2FA en la app; no compartir el acceso del panel con el proveedor sin autorización; contraseña por defecto del equipo → cambiar (kit INCIBE: «las contraseñas por defecto no son seguras»).
- **Familiar/visita en la sala común:** cuando termines en el PC de la sala común, ¿qué haces? *Buena:* cerrar sesión, borrar descargas, no guardar la clave en el navegador, no dejar abierta la sesión.
- **Personal de suplencias:** primer día; le pasan un papel con un usuario genérico. *Buena:* pedir usuario nombrado en su primer día.

### 6.3 Mini-casos con trampa (para decisión inmediata)

1. «Tu clave de la tienda online ha salido en una filtración y usabas la misma para el correo del centro.» → cambiar las dos; 2SV; avisar.
2. «Te llega un código de Google que no has pedido.» → no darlo, no pulsar; cambiar clave; avisar.
3. «Te piden por teléfono “el código que te acaba de llegar para confirmar tu identidad”.» → es un fraude; ningún servicio legítimo lo pide (CCN §10.1).

### 6.4 Matriz propuesta de perfiles mínimos (ilustrativa; **requiere validación por el DPD / responsable de seguridad del centro**)

| Puesto | Historia clínica / datos de salud | Datos administrativos y contables | Drive del centro | Ajustes y usuarios |
|---|---|---|---|---|
| Gerocultor/a | Solo residentes de su unidad; los datos necesarios para sus cuidados | No | Su carpeta de planta (Lector/Comentador) | No |
| Auxiliar de enfermería | Su unidad; registro de cuidados | No | Carpeta de planta/protocolos | No |
| Enfermería | Su unidad con más funciones clínicas | No | Carpeta clínica | No |
| Administración | Solo lo necesario para sus funciones (p. ej. datos de contacto y facturación) | Sí | Carpetas administrativas | No |
| Supervisión | Ampliado a su ámbito de coordinación | Parcial | Carpetas de turnos | Solicita altas/bajas |
| Dirección | Según función y necesidad de conocer | Sí | Todas las de gestión | Responsable de aprobar altas/bajas |
| Mantenimiento | No | No | Carpeta de mantenimiento | No |
| IT/administrador | Sin uso diario (acceso técnico) | No | Administración técnica | Sí, con cuenta separada y 2SV |

Base: AEPD (Guía sanitaria, p. 10: acceso limitado a datos precisos; personal administrativo solo a lo necesario) e INCIBE (mínimo privilegio, revisiones y bajas). La **tabla en sí es una propuesta del autor, no una cita**.

---

## 7. Preguntas de ejemplo (15) con respuesta y explicación

(Marcadas con * las basadas en el estilo del test INCIBE, redactadas de nuevo.)

1. **¿Qué hace que una contraseña sea más difícil de adivinar hoy?**
   a) Cambiar letras por símbolos conocidos (a→@) b) **Que sea una frase larga y única** c) Que incluya tu fecha de nacimiento d) Cambiarla cada semana
   *Correcta: b.* La longitud es el principal factor (CCN-CERT BP/35); a) es un patrón conocido por atacantes; c) es información personal predecible.

2. **Elige la frase de paso más adecuada para tu cuenta del centro:**
   a) `Centro2026` b) `Maria1234!` c) `MiPrimerTurnoFue7EnInvierno!` d) `Contraseña`
   *Correcta: c.* Es larga, con sentido personal y no es pública. Las demás son cortas y predecibles.

3. **Una compañera te pide tu usuario y contraseña porque aún no tiene los suyos. Lo mejor es:**
   a) Dárselos solo por hoy b) Dárselos si es de confianza c) **No darlos y avisar a tu responsable para que le den su usuario** d) Escribirlos en un papel
   *Correcta: c.* Lo que haga con tu usuario figurará a tu nombre y se pierde la trazabilidad (kit INCIBE p. 5; AEPD p. 17).

4. **Termina tu turno y la tablet de planta sigue abierta con la sesión de otra persona. ¿Qué haces?**
   a) Seguir usándola b) **Cerrar la sesión, entrar con tu usuario y avisar a esa persona/supervisión** c) Dejarla como está d) Apagar el wifi
   *Correcta: b.* Actuar con la sesión ajena hace que tus acciones queden a nombre de otra persona; dejarla abierta expone datos.

5. **¿Qué significa «credential stuffing»?**
   a) Probar de forma automática usuarios y contraseñas filtrados en otros servicios b) Llamar para pedir tu clave c) Rellenar formularios d) Guardar claves en el navegador
   *Correcta: a.* Por eso no se debe reutilizar la contraseña (CCN BP/35; INCIBE 2022).

6. **Tu contraseña de una tienda online se ha filtrado. ¿Qué haces?**
   a) Nada, es solo una tienda b) **Cambiarla y cambiar cualquier otra cuenta donde la repitieses, y activar 2SV** c) Cambiar solo la tienda d) Borrar el correo
   *Correcta: b.* Si repites claves, los atacantes las prueban en otros servicios (INCIBE, «Me robaron la cuenta»).

7. **Verificación en dos pasos significa que, además de tu clave, necesitas:**
   a) Otra clave igual b) **Algo que tienes (como el móvil) o algo que eres (huella)** c) Que otra persona confirme d) Dos usuarios
   *Correcta: b.* Es «algo que sabes» + «algo que tienes o eres» (CCN BP/35 §10).

8. **Alguien te llama diciendo ser de informática y te pide el código que te acaba de llegar por SMS. ¿Qué haces?**
   a) Darlo b) **Colgar y avisar; ningún servicio legítimo lo pide por teléfono** c) Darlo si suena educado d) Reenviárselo a un compañero
   *Correcta: b.* CCN BP/35 §10.1.

9. **¿Qué método de segundo factor se considera menos recomendable?**
   a) App autenticadora b) Llave de seguridad física c) **Códigos por SMS** d) Aviso de confirmación en la app
   *Correcta: c.* Vulnerable a SIM swapping (CCN BP/35). Sigue siendo mejor que no tener 2SV.

10. **¿Qué es una llave de acceso (passkey)?**
    a) Una contraseña muy larga b) **Un método para entrar con huella, cara o el PIN del móvil sin escribir contraseña** c) Una llave de la habitación d) Una copia de seguridad de Drive
    *Correcta: b.* No hay contraseña que robar (INCIBE; Google). Pero no se crea en dispositivos compartidos.

11. **En Drive, ¿qué ajuste es más seguro para compartir un archivo con datos de residentes?**
    a) Cualquier persona con el enlace, rol Editor b) Cualquier persona con el enlace, rol Lector c) **Acceso restringido a personas concretas, rol Lector** d) Enviar el archivo por WhatsApp
    *Correcta: c.* (Google Drive, ayuda; AEPD: acceso limitado a lo necesario.)

12. **¿Qué debes hacer al terminar de usar el ordenador de la sala común?**
    a) Dejarlo encendido b) **Cerrar tu sesión y no guardar tu clave en el navegador** c) Solo bajar la pantalla d) Dejar una nota con tu contraseña
    *Correcta: b.* Google recomienda ventana privada/invitado y cerrar sesión en dispositivos compartidos.

13. **Un gestor de contraseñas necesita sobre todo…**
    a) Un dispositivo muy caro b) **Una contraseña maestra muy robusta** c) Ser gratuito d) Guardar las claves en un papel
    *Correcta: b.* Kit INCIBE p. 6: si la maestra es débil, el resto de servicios tampoco serán seguros.

14. **Trabajas en administración. ¿A qué datos de salud de los residentes deberías tener acceso?**
    a) A todos b) **Solo a los necesarios para tus funciones** c) A los de tu familia d) A los que pida un familiar
    *Correcta: b.* AEPD: el personal administrativo accede solo a los datos necesarios; principio de mínimo privilegio (INCIBE).

15. **Sospechas que alguien conoce tu contraseña del software del centro. Lo primero:**
    a) Esperar a ver si pasa algo b) **Avisar a tu responsable/informática y cambiar la clave desde un dispositivo de confianza** c) Cambiar solo el nombre de usuario d) Comentarlo en el grupo de WhatsApp
    *Correcta: b.* INCIBE («Me robaron la cuenta») + CCN (renovar inmediatamente si hay sospecha). Se puede llamar al 017.

Extra (formato V/F, para repaso): «Una contraseña con símbolos es siempre más segura que una frase larga» → **Falso** (CCN: longitud ante todo).

---

## 8. Lista de fuentes (con URL)

**Oficiales (leídas)**
1. CCN-CERT BP/35, *Uso y gestión de contraseñas* (mayo 2026): https://angeles.ccn-cert.cni.es/es/docman/documentos-publicos/informes-de-buenas-practicas/432-ccn-cert-bp-35-informe-contrasenas/file (reseña: https://seguretat.uib.es/2026/05/07/uso-y-gestion-de-contrasenas-nuevo-informe-de-buenas-practicas-del-centro-criptologico-nacional/)
2. NIST SP 800-63B-4 *Digital Identity Guidelines: Authentication and Authenticator Management* (26-ago-2025): https://pages.nist.gov/800-63-4/sp800-63b.html
3. INCIBE/OSI, *Crea tu contraseña segura paso a paso* (PDF): https://www.incibe.es/sites/default/files/docs/osi-crear_contrasena-robusta.pdf
4. INCIBE/OSI, *Comprueba la seguridad de tus cuentas y protégelas* (hoja de autoevaluación, lleva 017): https://www.incibe.es/sites/default/files/docs/senior/osi_comprueba_la_seguridad_de_tus_cuentas_y_protegelas.pdf
5. OSI, *Típicos errores que cometemos al usar nuestras contraseñas, y cómo corregirlos* (20-feb-2019): https://www.incibe.es/ciudadania/blog/tipicos-errores-que-cometemos-al-usar-nuestras-contrasenas-y-como
6. OSI, *Gestores de contraseñas: ¿cómo funcionan?* (27-ene-2021): https://www.incibe.es/ciudadania/blog/gestores-de-contrasenas-como-funcionan
7. INCIBE, *Con estos ataques nos roban las contraseñas, ¡aprende a evitarlos!* (5-may-2022): https://www.incibe.es/empresas/blog/estos-ataques-nos-roban-las-contrasenas-aprende-evitarlos
8. INCIBE, *Me robaron la cuenta, ¿qué hago?* (18-nov-2020): https://www.incibe.es/ciudadania/blog/me-robaron-la-cuenta-que-hago
9. INCIBE, *Autenticación de dos factores (2FA)*: https://www.incibe.es/ciudadania/tematicas/contrasenas-seguras/autenticacion-de-dos-factores
10. INCIBE, *Passkeys: inicia sesión sin contraseñas de forma segura*: https://www.incibe.es/ciudadania/blog/passkeys-inicia-sesion-sin-contrasenas-de-forma-segura
11. INCIBE, *Bloqueo de dispositivos: patrón, contraseña, PIN, código y biometría*: https://www.incibe.es/ciudadania/tematicas/dispositivos-moviles/bloqueo-dispositivos
12. INCIBE, *Menos es más, controla el acceso a la información* (12-sep-2019): https://www.incibe.es/empresas/blog/menos-mas-controla-el-acceso-informacion
13. INCIBE, política de control de acceso (listada en búsqueda; **no leída directamente**): https://www.incibe.es/sites/default/files/contenidos/politicas/documentos/control-de-acceso.pdf
14. INCIBE, *Contraseñas seguras* (temática ciudadanía): https://www.incibe.es/ciudadania/tematicas/contrasenas-seguras
15. AEPD, *Guía para profesionales del sector sanitario*: https://www.aepd.es/guias/guia-profesionales-sector-sanitario.pdf
16. AEPD, resolución PS/00587/2021 (acceso indebido a historia clínica): URL no verificada; citar por expediente.
17. Google Cuenta, *Activar la verificación en dos pasos*: https://support.google.com/accounts/answer/185839?hl=es
18. Google Cuenta, *Iniciar sesión con una llave de acceso*: https://support.google.com/accounts/answer/13548313?hl=es
19. Google Cuenta, *Ver los dispositivos con acceso a la cuenta*: https://support.google.com/accounts/answer/3067630?hl=es
20. Google Cuenta, *Iniciar sesión en un dispositivo que no es tuyo*: https://support.google.com/accounts/answer/2917834?hl=es
21. Google Drive, *Compartir archivos desde Google Drive*: https://support.google.com/drive/answer/2494822?hl=es
22. Google Workspace Admin, *Protege tu empresa con la verificación en dos pasos*: https://support.google.com/a/answer/175197?hl=es
23. Google Workspace Admin, *Cerrar la sesión de un usuario* (listada; **no leída directamente**): https://support.google.com/a/answer/178854?hl=es-419
24. Have I Been Pwned: https://haveibeenpwned.com/About · API: https://haveibeenpwned.com/API/v3
25. Kit de concienciación INCIBE, 05_Contraseñas y 06_PuestoTrabajo (archivos locales; rutas en §5). Enlace de contraseñas del kit: https://www.incibe.es/protege-tu-empresa/blog/dia-mundial-las-contrasenas-aun-utilizas-123456
26. OSI, KeePass (herramienta gratuita): https://osi.es/es/herramientas-gratuitas/keepass

**Vídeos (oEmbed verificado):** ver §4.

**No confirmado en esta investigación (no incluir como hecho):**
- Cifras de «uso de contraseñas débiles» o de estadísticas de brechas en sanidad: no leídas.
- Contenido de los vídeos; duración de 6 de los 8 vídeos listados.
- Fecha de edición de la Guía AEPD sanitaria y de la ficha OSI de contraseñas.
- Política concreta del centro (usuarios genéricos, gestor corporativo, tipo de software): debe aportarla el centro.
- Condiciones de reutilización de los materiales del kit INCIBE.
- Pantallas exactas de Google Workspace pueden variar con las actualizaciones de Google (revisar capturas antes de publicar).
