# Curso 3 · «Correo, mensajes y fraudes» — Dossier de fuentes y contenidos

Destinatarios: personal de residencias y centros sociosanitarios (gerocultores/as, auxiliares, enfermería, administración, dirección, supervisión, mantenimiento), sin conocimientos digitales, en móvil. Duración objetivo: ~1 h 40 min.

Fecha de elaboración: 5 oct 2026. Convención de este dossier:
- **[LEÍDO]** = leído por mí en la página/fichero citado.
- **[SOLO BÚSQUEDA]** = visto solo en el resumen de un buscador; hay que confirmarlo antes de publicarlo.
- **[NO CONFIRMADO]** = no he podido verificarlo.
- Los ejemplos de mensajes del apartado 4 son **inventados por mí** (marcas, dominios y números ficticios). No son avisos reales.

---

## 1. Resumen ejecutivo

1. El engaño por mensaje es la puerta de entrada más habitual al fraude: según INCIBE, en 2025 gestionó 122.223 incidentes (+26 %); el fraude online fueron 45.445 (4 de cada 10) y el phishing encabezó con 25.133. Su línea 017 recibió 142.767 consultas (+44,9 %) y el 28 % de quienes llamaron había recibido phishing, vishing o smishing (INCIBE, 9-feb-2026) [LEÍDO].
2. Todo el curso se apoya en **una sola idea**: *los estafadores no fuerzan la puerta, te piden que se la abras*. Y en **un solo hábito**: **PARA – MIRA – VERIFICA por otro canal – AVISA**.
3. Los canales cambian (correo, SMS, llamada, QR, WhatsApp) pero las **palancas psicológicas** son las mismas: autoridad, ganas de ayudar, miedo a perder algo, miedo a quedar mal, urgencia y «regalo» (INCIBE, 5-sep-2019) [LEÍDO].
4. Reglas de oro del sector: (a) nadie legítimo pide contraseñas ni códigos por mensaje o llamada; (b) cambios de IBAN, pagos «urgentes» y datos de residentes **siempre se verifican llamando a un número conocido**; (c) ante la duda, no pulsar, no abrir, no responder y **preguntar** (responsable / TIC / 017).
5. Si ya has pulsado o dado datos: **no es el fin del mundo, es un asunto de rapidez**. Desconectar, avisar al responsable, cambiar contraseñas, avisar al banco si hubo dinero, guardar pruebas (capturas) y denunciar. Avisar pronto es lo que más ayuda; nunca hay que ocultarlo.
6. Dónde pedir ayuda: **INCIBE 017** (teléfono, WhatsApp 900 116 117, Telegram @INCIBE017; 8:00–23:00, todos los días, gratuito y confidencial [LEÍDO, nota de prensa INCIBE de 31-may-2022; confirmar horario vigente]) y las fuerzas de seguridad (Policía Nacional / Guardia Civil).
7. Contexto del sector: ENISA (informe del sector sanitario, ene 2021–mar 2023) sitúa el ransomware en el 54 % de los incidentes y los datos médicos de pacientes como objetivo en el 30 %; el phishing/ingeniería social aparece como vector en un 4 % según el resumen de INCIBE-CERT. **Ojo con no sobredimensionar**: esa cifra del 4 % no dice que el phishing sea poco importante (la mala configuración es el vector dominante, 68 %), y el ransomware suele empezar por un correo. Úsese con matices (ver §3).
8. Hallazgo sobre el kit local: la carpeta `04_Fraudes` **no contiene** el recurso sobre correo/fraudes (ver §6). Hay que bajarlo de INCIBE o usar solo los pósters/consejos y el tríptico `phishing.pdf`.

---

## 2. Contenido didáctico en bloques (listo para pantallas)

Lenguaje llano, frases cortas, pensado para móvil. Cada bloque = 1-3 pantallas. Tiempos orientativos sumando ~100 min con actividades.

### Bloque 0 · Por qué esto va conmigo (5 min)
- «En una residencia hay cosas que interesan a un estafador: **dinero** (facturas, proveedores, nóminas), **datos de salud** de residentes y **familias** que se preocupan y responden rápido.»
- «No hace falta saber de ordenadores. Hace falta **desconfiar con método**.»
- Idea fuerza: *Te engañan a ti, no al aparato.* Se llama **ingeniería social**: manipular a las personas para que hagan algo que no deberían (INCIBE) [LEÍDO].

### Bloque 1 · Los 6 trucos con los que te engañan (8 min)
Resumen de las palancas descritas por INCIBE (5-sep-2019) [LEÍDO] con ejemplos del centro:
| Truco | Cómo suena en la residencia |
|---|---|
| **Autoridad** | «Soy la directora / Policía / la Seguridad Social, haz esto ya.» |
| **Ayudar** | «Soy de informática, dame tu clave para arreglarlo.» «Soy tu compañera, ¿me cubres el turno?» |
| **Miedo a perder algo** | «Tu cuenta de correo se bloqueará en 8 horas.» |
| **Miedo a quedar mal** | «Tengo fotos tuyas…» (sextorsión) |
| **Gratis / premio** | «Has ganado un vale.» |
| **Urgencia** | «Hazlo ahora, no se lo digas a nadie.» (la urgencia sirve para que no tengas tiempo de pensar) |
Mensaje: *si un mensaje te mete prisa, miedo o secreto, ya hay una señal de alarma.*

### Bloque 2 · Los nombres (y los canales) sin jerga (6 min)
- **Phishing**: mensaje falso (normalmente correo) que simula venir de alguien de confianza para robar datos o infectar. Los atacantes pueden usar también SMS, telefonía, redes sociales y mensajería (tríptico INCIBE «Phishing», kit) [LEÍDO].
- **Spear phishing**: el mismo engaño pero **personalizado** (usa tu nombre, tu puesto, tu centro). Es más creíble. *Nota: la definición de spear phishing se ha tomado de conocimiento general; en las fuentes leídas INCIBE habla de «farming» = ataques dirigidos de varias interacciones, p. ej. fraude del CEO (INCIBE, 5-sep-2019) [LEÍDO].*
- **Smishing**: por SMS o mensajería (INCIBE: «SMS + phishing») [LEÍDO].
- **Vishing**: por llamada telefónica; suplantan a un banco, un técnico, etc. [LEÍDO].
- **Quishing**: por **código QR**. INCIBE ha avisado de campañas de correo con QR que llevan a un falso inicio de sesión de Microsoft (aviso 8-ago-2023) y de QR pegados sobre los originales en lugares públicos [LEÍDO].
- **Fraude del CEO / BEC**: un «jefe» pide por correo una transferencia urgente y confidencial; BEC = cuenta de correo comprometida de verdad (INCIBE, 3-jul-2025) [LEÍDO].
- **Sextorsión**: chantaje con «vídeos íntimos» que no existen (INCIBE, act. 27-mar-2025) [LEÍDO].

### Bloque 3 · Cómo reconocer un correo falso: 7 señales (12 min)
Basado en INCIBE «Día Mundial del Correo» (8-oct-2019) y «Conoce a fondo el phishing» [LEÍDO]. Mnemotecnia propuesta: **R-E-S-U-A-D-O**… mejor una más simple en 7 preguntas:
1. **¿Quién lo envía de verdad?** Mira la dirección completa, no solo el nombre. Dominios casi iguales (una letra cambiada) o `@gmail.com` en nombre de una empresa. (Ver spoofing: la dirección puede incluso falsificarse; INCIBE explica cómo ver las cabeceras, pero para este público basta «si algo no cuadra, verifica por otro canal».)
2. **¿Me llama por mi nombre?** «Estimado cliente / usuario» = señal.
3. **¿Me mete prisa o miedo?** «En 8 horas se bloqueará…» = señal.
4. **¿Hay faltas o frases raras?** Ortografía y redacción extrañas.
5. **¿Qué enlace esconde?** Comprobar el destino antes de pulsar (en ordenador, pasar el ratón por encima; en móvil, **mantener pulsado** el enlace para ver la dirección — *técnica en móvil: conocimiento general, no leída en las fuentes INCIBE; validar con captura en Android/iPhone antes de publicar*). INCIBE añade: una entidad legítima rara vez manda enlaces en sus comunicaciones oficiales.
6. **¿Trae un adjunto que no esperaba?** Extensiones de riesgo citadas por INCIBE: `.exe`, `.vbs`, `.docm` y comprimidos `.zip`/`.rar` de origen desconocido.
7. **¿Pide algo que esa entidad no pide?** Contraseñas, códigos, datos bancarios, «confirmar identidad».
Regla: *una señal = sospecha; dos = no lo toques.*

### Bloque 4 · Comprobar un enlace sin pulsarlo (6 min)
- En ordenador: ratón encima → leer la dirección que aparece abajo (INCIBE) [LEÍDO].
- En móvil: mantener pulsado (validar, ver arriba).
- En vez de pulsar: **escribir tú la dirección** de la entidad en el navegador o usar su app oficial (tríptico INCIBE) [LEÍDO].
- Antes de meter datos: dirección que empiece por `https://` y candado, **pero** INCIBE advierte que «https» también puede ser manipulado: el candado **no** garantiza que sea la web real [LEÍDO, INCIBE «¿Qué es el smishing?»].
- Ojo con enlaces acortados (bit.ly y similares) en SMS (INCIBE lo cita entre las señales del smishing [LEÍDO]).

### Bloque 5 · Adjuntos peligrosos (5 min)
- Un adjunto **inesperado**, aunque venga de un conocido, es sospechoso: su cuenta puede estar comprometida (INCIBE, mensajes de mensajería) [LEÍDO].
- Facturas, «albaranes», «resultados», «burofax», «documento escaneado» son los disfraces típicos. INCIBE ha publicado campañas con «supuestas facturas» y falsos comunicados de la AEAT con `.zip` (aviso 25-mar-2022) [LEÍDO el de la AEAT].
- Si ya lo abriste, ver Bloque 12.

### Bloque 6 · Correo corporativo vs. personal (4 min)
- El correo **del centro** es para el trabajo; el personal (gmail, etc.) no se usa para asuntos del centro ni se reenvían datos de residentes.
- Si llega a tu correo **personal** un mensaje que «es del centro» o «de la dirección» → ya es sospechoso.
- No usar el correo corporativo para darse de alta en webs personales.
- *(Reglas internas concretas dependen de cada centro; el dossier solo propone el principio.)*

### Bloque 7 · SMS y llamadas: smishing y vishing (8 min)
- Paquetería («tu paquete está retenido, pulsa aquí»): INCIBE (29-mar-2023) recomienda verificar con la empresa por su web oficial, no instalar apps desde enlaces del SMS y desconfiar de la urgencia [LEÍDO].
- Falso «soporte técnico»: INCIBE avisa de llamadas de un supuesto técnico (p. ej. de Microsoft) que pide instalar una herramienta de acceso remoto como AnyDesk y darle el código [SOLO BÚSQUEDA; el aviso concreto no lo he leído completo].
- Pretextos de vishing que lista INCIBE (25-ago-2020): concurso o lotería, tarjeta regalo, premio, soporte técnico [LEÍDO]. También hacerse pasar por banco.
- Regla: **cuelga** y llama tú al número oficial de la entidad. Un banco o la Administración no te pide claves por teléfono.
- Suplantación del número de teléfono (spoofing): el número que ves puede ser falso (INCIBE, blog «Spoofing telefónico») [SOLO BÚSQUEDA].

### Bloque 8 · Códigos QR (4 min)
Recomendaciones INCIBE [LEÍDO / SOLO BÚSQUEDA según indicado]: no escanear QR no esperados llegados por correo [LEÍDO]; comprobar que no es una pegatina sobre el original [SOLO BÚSQUEDA]; mirar la dirección que muestra el móvil antes de abrirla [LEÍDO, resumen: «previsualizar»]; sospechar si no es del dominio del servicio [SOLO BÚSQUEDA]. Caso real 017: suscripción premium no deseada tras escanear el QR del menú de un restaurante (INCIBE, casos reales, 04-ago-2026) [LEÍDO el título en el listado; no he leído el caso].

### Bloque 9 · Dinero y proveedores: fraude del CEO y falsa factura (10 min) — *especial administración/dirección/supervisión*
- Fraude del CEO (INCIBE, 3-jul-2025) [LEÍDO]: correo del «jefe» pidiendo transferencia **urgente y confidencial** («hazla antes de las 14:00, confío en tu discreción», «estoy en una reunión, no puedo hablar»). Variantes: tarjetas regalo, whaling, falsa incorporación, deepfake de voz/vídeo.
- Cambio de IBAN: caso real INCIBE «Historias reales: suplantaron a mi proveedor…» [LEÍDO]: correo con PDF pidiendo cambiar la cuenta bancaria; el comprador actualizó el dato, pagó, y el proveedor nunca recibió el dinero. Señal: petición **inusual** de cambiar los datos de pago.
- Medidas de INCIBE: verificar por **otro canal** (llamada a un teléfono ya conocido), comprobar la dirección letra a letra, **doble control** (dos personas autorizan transferencias a partir de cierto importe), procedimiento claro para cambios de IBAN.
- Si ya se pagó: **llamar al banco inmediatamente**, denunciar, llamar al 017 (INCIBE) [LEÍDO]. *(El plazo útil para que el banco intente recuperar el dinero es corto: hacerlo el mismo día; la cifra concreta de horas no la he leído en fuente oficial.)*

### Bloque 10 · WhatsApp y mensajería (10 min)
- **«Hola mamá, mi teléfono se ha roto»**: SMS o WhatsApp de un «hijo/a» desde un número nuevo que acaba pidiendo dinero urgente (transferencia o Bizum). INCIBE (aviso y blog de abr-2026) [LEÍDO]. Señales: número desconocido, faltas y acentos ausentes, urgencia emocional, secreto. Cómo verificar: **llamar al número de siempre** y/o preguntar algo que solo el familiar sabría.
- **Robo de la cuenta de WhatsApp**: te llaman o escriben (falso repartidor, falso «soporte de WhatsApp») y te piden **el código de 6 cifras** que te llega por SMS. Con él se quedan tu cuenta (INCIBE, casos reales, 10-sep-2024 y «Así te roban WhatsApp con la excusa de un paquete urgente») [LEÍDO].
  - **Regla**: *el código de verificación no se da a nadie, nunca.*
  - Activar la **verificación en dos pasos** de WhatsApp (INCIBE) [LEÍDO].
  - Si te la roban: avisar a tus contactos, escribir a support@whatsapp.com, denunciar el número, denuncia policial si hay suplantación [LEÍDO].
- En el trabajo: **no se facilita información de residentes por WhatsApp** a «la familia» sin comprobar quién es y sin seguir el protocolo del centro (ver escenarios, §7).

### Bloque 11 · Estafas «de moda»: paquetería, Correos, Seguridad Social, AEAT, DGT, sextorsión (8 min)
- Paquetería/Correos: ver Bloque 7.
- AEAT: INCIBE avisó de correos y SMS que suplantan a la Agencia Tributaria («Comprobante fiscal digital…», «Tu factura está disponible», descarga de `.zip`) (25-mar-2022) [LEÍDO].
- DGT / Seguridad Social: la Policía Nacional ha difundido avisos sobre SMS falsos de la DGT (vídeo en TikTok de @policia) [SOLO BÚSQUEDA; no leído]. **No he leído ningún aviso oficial concreto sobre Seguridad Social**; si se quiere incluir, buscar el aviso actual en INCIBE o en la propia Seguridad Social. Regla general: la Administración no pide datos bancarios por SMS; se entra por su **sede electrónica** escribiendo la dirección.
- **Sextorsión**: correo con «tengo tus vídeos, paga en bitcoin en 48 h». No tienen nada. Si no pagaste: bloquear y borrar. Si pagaste: guardar pruebas, denunciar y llamar al 017 (INCIBE, act. 27-mar-2025) [LEÍDO]. No responder: confirmas que tu cuenta está activa.
- **Estafas a familiares de residentes**: *no he encontrado una fuente oficial específica sobre estafas dirigidas a familiares de residentes de residencias* [NO CONFIRMADO]. Lo que sí está documentado por INCIBE es la estafa del «familiar en apuros» y el vishing a personas mayores con pretexto de herencia (caso real 017, listado, sin leer el caso completo). Para el curso conviene plantearlo como **escenario hipotético** (ej. 6 y 9) y recomendar que el centro avise a las familias de que **nunca** pedirá pagos ni datos por SMS/WhatsApp.

### Bloque 12 · «He picado»: qué hacer (10 min)
Pasos según INCIBE («Conoce a fondo el phishing» y avisos) [LEÍDO / síntesis de búsqueda]:
1. **Tranquilidad y rapidez.** Avisar de inmediato al responsable/TIC. *Nadie se enfada por avisar; sí por callar.*
2. Si **solo abriste el correo** o no descargaste nada: no pasa nada por sí solo; no pulses nada más; avisa, bloquea y borra.
3. Si **pulsaste un enlace** y no pusiste datos: cierra la página; avisa.
4. Si **escribiste usuario/contraseña**: cambia la contraseña (y la de cualquier otro servicio donde fuera igual) desde un dispositivo fiable; avisa al responsable.
5. Si **abriste/ejecutaste un adjunto**: **desconecta el equipo de la red**, no lo apagues a lo loco (según protocolo), avisa; pasa antivirus; si persiste, restaurar de fábrica (INCIBE) [SOLO BÚSQUEDA para el orden exacto].
6. Si **diste datos bancarios o pagaste**: llama al **banco** de inmediato (INCIBE) [LEÍDO].
7. **Guarda pruebas** (capturas del mensaje, número, enlace) para la denuncia [LEÍDO].
8. Si afecta a **datos de residentes**: avisar al responsable de protección de datos del centro. Un incidente con datos personales puede ser una **brecha** que el responsable del tratamiento debe notificar a la AEPD **en un máximo de 72 horas desde que tiene conocimiento** [SOLO BÚSQUEDA, resultado aepd.es; las páginas de la AEPD que intenté leer dieron error: confirmar en la guía AEPD «Guía para la notificación de brechas de datos personales», jun-2021]. Por eso **avisar rápido** es clave.

### Bloque 13 · Dónde consultar y denunciar (5 min)
- **INCIBE 017**: teléfono 017, WhatsApp 900 116 117, Telegram @INCIBE017; gratuito y confidencial; asesoramiento técnico, psicosocial y legal (INCIBE, 31-may-2022) [LEÍDO]. Hay un **formulario de reporte de fraude** (INCIBE-CERT) donde se puede enviar captura/URL sin abrir nada (INCIBE «Reporte de fraude») [LEÍDO]. En la web de INCIBE figura también el horario 8:00–23:00 [LEÍDO]; una web de terceros daba 9:00–21:00 [no oficial, descartada]: confirmar antes de publicar.
- **OSI (Oficina de Seguridad del Internauta)**: sus contenidos están ahora integrados en `incibe.es/ciudadania` (la URL `osi.es/es/campanas/phishing` redirige 301 a INCIBE) [LEÍDO]. Avisos de fraude: `osi.es/es/actualidad/avisos/fraude` [SOLO BÚSQUEDA].
- **Policía Nacional**: portal de denuncias `policia.es/_es/denuncias.php` [LEÍDO: confirma que hay denuncia digital; **plazos de ratificación no confirmados**]; Brigada Central de Investigación Tecnológica [SOLO BÚSQUEDA, web de terceros].
- **Guardia Civil**: Grupo de Delitos Telemáticos, portal `gdt.guardiacivil.es` [NO CONFIRMADO: el dominio no se pudo abrir desde mi herramienta].
- **Banco**: siempre, si hubo dinero.
- **AEPD**: para brechas de datos y para reclamar si WhatsApp no responde (INCIBE) [LEÍDO].

### Bloque 14 · Resumen: PARA – MIRA – VERIFICA – AVISA (3 min)
- **PARA**: no pulses ni respondas.
- **MIRA**: remitente, prisa, enlace, adjunto, qué pide.
- **VERIFICA** por **otro canal** conocido (llamar al número de siempre).
- **AVISA** al responsable y, si hace falta, al 017.

---

## 3. Datos citados (fuente + enlace + fecha)

| Dato | Fuente | Fecha | Estado |
|---|---|---|---|
| INCIBE-CERT gestionó 122.223 incidentes en 2025 (+26 %); fraude 45.445 (+19 %, «4 de cada 10»); phishing 25.133; malware 55.411; 392 ransomware; 017: 142.767 consultas (+44,9 %), 28 % relacionadas con phishing | INCIBE, nota de prensa «INCIBE detectó más de 122.000 incidentes…» https://www.incibe.es/incibe/sala-de-prensa/incibe-detecto-mas-de-122000-incidentes-de-ciberseguridad-en-2025 | 9-feb-2026 | LEÍDO |
| Del 017: 49 % consultas preventivas, 51 % reactivas; 16 % compras fraudulentas; 14 % suplantación de identidad | misma fuente (resumen del buscador del PDF Balance 2025) | feb-2026 | SOLO BÚSQUEDA |
| 017: horario 8–23 h, 365 días; canales; 69.211 consultas en 2021 (+68 % vs 2020) | https://www.incibe.es/incibe/sala-de-prensa/incibe-amplia-el-horario-del-servicio-tu-ayuda-ciberseguridad | 31-may-2022 | LEÍDO (cifra antigua; no usarla como dato actual) |
| Sector salud (ENISA, ene-2021 a mar-2023): ransomware 54 %; hurto de datos 46 % de casos; 43 % de los ransomware con exfiltración; mala configuración 68 %, error humano/interno 16 %, phishing/ingeniería social 4 %; salud = 8 % de incidentes (informe ENISA 2023) | INCIBE-CERT «Cibersecurity in the healthcare sector…» https://www.incibe.es/en/incibe-cert/blog/cibersecurity-healthcare-sector-features-threats-and-recommendations (cita a ENISA, https://www.enisa.europa.eu/sites/default/files/publications/Health%20Threat%20Landscape.pdf) | jul-2023 (informe) | LEÍDO el resumen de INCIBE; el PDF de ENISA no pude leerlo (binario). Citar «según ENISA vía INCIBE-CERT» |
| «El 93 % de las brechas empiezan en un correo electrónico» | INCIBE, citando Verizon DBIR 2018 https://www.incibe.es/ciudadania/blog/sabias-que-los-ataques-de-ingenieria-social-suponen-el-93-de-las-brechas | (dato 2018) | LEÍDO — **dato antiguo; no recomendado**; si se usa, decir «en 2018» |
| 6 técnicas de persuasión; «hunting» vs «farming» | INCIBE «Ingeniería social: técnicas utilizadas…» https://www.incibe.es/empresas/blog/ingenieria-social-tecnicas-utilizadas-los-ciberdelincuentes-y-protegerse | 5-sep-2019 | LEÍDO |
| Señales de correo fraudulento y extensiones | INCIBE https://www.incibe.es/empresas/blog/dia-mundial-del-correo-detectar-correos-fraudulentos | 8-oct-2019 | LEÍDO |
| Fraude del CEO: frases típicas, variantes, qué hacer | https://www.incibe.es/empresas/blog/fraude-del-ceo-el-engano-que-puede-vaciar-la-cuenta-de-tu-pyme | 3-jul-2025 | LEÍDO (fecha vía buscador) |
| Falsa suplantación de proveedor (cambio de cuenta) | https://www.incibe.es/empresas/blog/historias-reales-suplantaron-mi-proveedor-y-mi-empresa-estafaron | s/f | LEÍDO |
| Phishing por QR a falso login Microsoft; efectivo incluso con doble factor | https://www.incibe.es/empresas/avisos/nueva-campana-de-phishing-utilizando-codigos-qr | 8-ago-2023 | LEÍDO |
| QR fraudulentos en lugares públicos | https://www.incibe.es/node/494006 | s/f | LEÍDO |
| Smishing paquetería: 4 comprobaciones | https://www.incibe.es/ciudadania/blog/como-detectar-mensajes-fraudulentos-que-suplantan-servicios-de-mensajeria | 29-mar-2023 | LEÍDO |
| Familiar en apuros («Hola mamá…») | https://www.incibe.es/ciudadania/avisos/has-recibido-un-mensaje-desde-un-numero-desconocido-que-dice-ser-tu-hijo y https://www.incibe.es/ciudadania/blog/la-estafa-del-familiar-en-apuros | aviso s/f; blog abr-2026 | LEÍDO |
| Robo de WhatsApp con falso soporte (código de 6 cifras) | https://www.incibe.es/linea-de-ayuda-en-ciberseguridad/casos-reales/nueva-variante-del-robo-de-cuenta-de-whatsapp-suplantando-al-soporte-tecnico | 10-sep-2024 | LEÍDO |
| Robo de WhatsApp con falso repartidor | https://www.incibe.es/linea-de-ayuda-en-ciberseguridad/casos-reales/asi-te-roban-whatsapp-con-la-excusa-de-un-paquete-urgente | s/f | LEÍDO |
| Sextorsión: qué hacer | https://www.incibe.es/ciudadania/avisos/has-recibido-un-correo-chantajeandote-con-que-publicaran-contenido-de-caracter | act. 27-mar-2025 | LEÍDO |
| Vishing: pretextos y qué hacer | https://www.incibe.es/ciudadania/avisos/intento-de-fraude-traves-de-llamadas-telefonicas-vishing | 25-ago-2020 | LEÍDO |
| Smishing: señales y pasos | https://www.incibe.es/ciudadania/blog/smishing-el-fraude-de-los-sms y https://www.incibe.es/ciudadania/blog/que-es-el-smishing | s/f | LEÍDO |
| AEAT suplantada (correo y SMS, .zip) | https://www.incibe.es/ciudadania/avisos/phishing-suplantando-la-agencia-tributaria-con-riesgo-de-infeccion-por | 25-mar-2022 | LEÍDO |
| Reporte de fraude a INCIBE-CERT | https://www.incibe.es/en/ciudadania/ayuda/reporte-de-fraude | s/f | LEÍDO |
| Spoofing de correo: ver cabeceras | https://www.incibe.es/ciudadania/blog/email-spoofing-comprueba-quien-te-envia-un-correo-sospechoso | s/f | LEÍDO |
| Brecha de datos: notificación a AEPD ≤ 72 h | https://www.aepd.es/guias/guia-brechas-seguridad.pdf (guía jun-2021) | 2021 | SOLO BÚSQUEDA |
| OSI: 10.449 denuncias de suplantación de identidad en 2023 (+23 %) | resultado de buscador (osi.es) | 2023 | SOLO BÚSQUEDA — no usar sin leer |
| CCN-CERT: campaña de phishing contra el sector salud (credenciales) | https://www.ccn-cert.cni.es/es/seguridad-al-dia/avisos-ccn-cert/6957-ccn-cert-av-34-18-campana-de-phishing-contra-el-sector-salud | sept-2018 | SOLO BÚSQUEDA (no leído) |
| Europol | No se ha consultado ninguna fuente de Europol que aporte datos concretos; **no incluido**. |

---

## 4. Ejemplos de mensajes fraudulentos y legítimos (inventados)

> Todos los nombres, dominios y teléfonos son **ficticios**. Para la actividad «¿legítimo o fraude?» y «marca las señales». Señales: 🚩 = presente. Los textos están pensados para pantalla de móvil.

### Ejemplo 1 — Correo «de la mutua» (FRAUDE)
**De:** Mutua Salud Laboral <avisos@mutua-saludlaboral-gestion.com>
**Asunto:** URGENTE: Su baja será anulada en 24 h
> Estimado trabajador:
> Hemos detectado un error en los datos de su parte de baja. Si no lo corrige en 24 horas su prestación quedará **suspendida**.
> Acceda aquí para actualizar sus datos y su DNI: https://mutua-saludlaboral-gestion.com/verifica
> Adjuntamos formulario (Formulario_baja.zip)
> Atentamente, Departamento de Prestaciones

Señales: 🚩 dominio que no es el de la mutua · 🚩 «Estimado trabajador» (genérico) · 🚩 plazo de 24 h / amenaza · 🚩 pide DNI y datos · 🚩 adjunto `.zip` · 🚩 enlace que no es la web oficial.
Cómo se haría bien: la mutua te contacta por su **app/web** que tú ya usas, o llamas tú al teléfono oficial.

### Ejemplo 2 — Correo «factura del proveedor de pañales» con cambio de IBAN (FRAUDE)
**De:** Rosa Mena <rosa.mena@suministros-delnorte.co> (el proveedor real usa `.es`)
**Asunto:** RE: Factura septiembre – NUEVOS DATOS BANCARIOS
> Buenos días Marta, por cambio de entidad, a partir de hoy el pago de nuestras facturas debe hacerse a la cuenta ES00 0000 0000 00 0000000000 (IBAN ficticio). Adjunto factura (Factura_0924.pdf.exe) y certificado. Por favor confirme hoy la actualización para no retrasar el servicio. Gracias.

Señales: 🚩 dominio distinto (`.co` vs `.es`) · 🚩 **cambio de IBAN por correo** · 🚩 prisa «hoy» · 🚩 adjunto con doble extensión `.pdf.exe` · 🚩 el hilo «RE:» puede ser falso.
Correcto: llamar al proveedor a su teléfono **conocido** y que un segundo responsable valide el cambio (INCIBE: verificación por otro canal + doble control).

### Ejemplo 3 — Correo «de la directora» (fraude del CEO) (FRAUDE)
**De:** Directora Elena Ruiz <direccion.residencia@gmail.com>
**Asunto:** (sin asunto)
> Marta, estoy en una reunión y no puedo hablar. Necesito que hagas una transferencia de 4.800 € ahora mismo a un proveedor. Es confidencial, no lo comentes con nadie. Te paso el IBAN por aquí. Te lo agradezco, confío en tu discreción. Enviado desde mi iPhone

Señales: 🚩 cuenta personal (`gmail`) en lugar de la corporativa · 🚩 «no puedo hablar» · 🚩 urgencia · 🚩 secreto · 🚩 salta el procedimiento de pagos. (Frases tomadas del patrón descrito por INCIBE.)

### Ejemplo 4 — SMS de paquetería (FRAUDE)
> Correos: Su paquete #ES48392 no pudo entregarse. Confirme la dirección y pague 1,29 € de tasa en: https://correos-envios.info/pago

Señales: 🚩 pide un pago pequeño · 🚩 dominio `.info` ajeno a Correos · 🚩 no esperabas ningún paquete · 🚩 pide datos de tarjeta · 🚩 prisa implícita.

### Ejemplo 5 — WhatsApp «cambio de turno» desde número desconocido (FRAUDE)
Número no guardado, +34 6xx xxx xxx, foto de perfil de la supervisora:
> Hola Marta, soy Elena, he cambiado de móvil. Necesito que me ayudes con una cosa del cuadrante, ¿me puedes enviar el código que te llegue por SMS? Es para entrar en la app de turnos. Rápido porfa que llego tarde

Señales: 🚩 número nuevo · 🚩 foto copiada · 🚩 **pide un código de SMS** · 🚩 prisa · 🚩 favor «pequeño». (Patrón de robo de cuenta: INCIBE, 10-sep-2024.) Verificación: llamar al número de siempre de la supervisora.

### Ejemplo 6 — WhatsApp «hija de un residente» pide información (FRAUDE / dudoso)
Número desconocido:
> Buenas tardes, soy la hija del Sr. Pedro Gil de la habitación 12. Mi padre me ha dicho que ayer lo vio el médico. ¿Me puedes pasar la analítica y la medicación que toma por aquí? Estoy en el extranjero y no puedo llamar. Es urgente.

Señales: 🚩 no se puede verificar la identidad · 🚩 pide **datos de salud** por WhatsApp · 🚩 urgencia/emoción · 🚩 «no puedo llamar». Actuación: no facilitar nada; seguir el protocolo del centro (identificación y canal autorizado, dirección/enfermería). *Es un escenario plausible, no un aviso oficial documentado.*

### Ejemplo 7 — Llamada «soporte técnico» (vishing) (FRAUDE)
Voz amable, número que parece de Madrid:
> Buenos días, le llamo del servicio técnico de Microsoft. Hemos detectado que el ordenador de recepción está infectado y enviando datos de residentes. Para arreglarlo ahora, descargue esta aplicación (AnyDesk) y dígame el código que aparece. Si no lo hacemos hoy, le bloquearán el equipo.

Señales: 🚩 llamada **no solicitada** · 🚩 miedo («infectado») · 🚩 pide **instalar acceso remoto** · 🚩 prisa/amenaza. (Patrón descrito por INCIBE.)

### Ejemplo 8 — Correo con QR (quishing) (FRAUDE)
**De:** Servicio de Seguridad TI <seguridad@centro-sociosanitario.net> (el centro usa `.es`)
**Asunto:** Verificación obligatoria de su cuenta de correo
> Para mantener su acceso debe verificar su identidad. Escanee el siguiente código QR con su móvil antes de las 18:00. *[imagen de un QR]*

Señales: 🚩 dominio parecido pero no igual · 🚩 QR en vez de enlace (para saltar filtros) · 🚩 plazo · 🚩 pide verificar la cuenta. (Patrón INCIBE, 8-ago-2023.)

### Ejemplo 9 — Correo «resultados de analítica de un residente» (FRAUDE)
**De:** Laboratorio Clínico Regional <resultados@lab-clinico-resultados.com>
**Asunto:** Resultados analítica residente J.M.G. – confidencial
> Adjuntamos los resultados de la analítica del residente. Para visualizarlos, habilite el contenido del documento adjunto y use la contraseña que figura en el siguiente mensaje. Resultados.docm

Señales: 🚩 no esperabas resultados / no es el canal habitual del laboratorio · 🚩 adjunto `.docm` (macros; extensión de riesgo citada por INCIBE) · 🚩 «habilitar contenido» · 🚩 dominio no corporativo · 🚩 asunto con inicial de residente (usa datos para parecer real).

### Ejemplo 10 — SMS «Seguridad Social/AEAT» + sextorsión (FRAUDE)
SMS: > Agencia Tributaria: tiene una devolución pendiente de 312,45 €. Solicítela en https://aeat-devoluciones.top/ver antes del viernes.
Señales: 🚩 la AEAT no pide datos por enlace de SMS · 🚩 dominio `.top` · 🚩 dinero «gratis» · 🚩 plazo. (INCIBE documentó correos y SMS suplantando a la AEAT, 25-mar-2022.)

### Mensajes LEGÍTIMOS para contraste
**L1 — Aviso interno del centro (legítimo).** De: `coordinacion@[dominio-del-centro]` (el real, conocido). «Recordatorio: mañana a las 10:00 formación en la sala 2. Sin enlaces ni adjuntos. Si tienes dudas, llama a coordinación.» → Canal habitual, dominio correcto, nada que pulsar, no pide datos.
**L2 — Banco/mutua que NO pide datos (legítimo).** SMS de tu banco con un aviso de operación: «Compra 45 € en [comercio]. Si no la reconoces, llama al teléfono de la tarjeta (el de la parte de atrás)». → Llega por el hilo habitual, **no trae enlace**, no pide claves, invita a llamar a un número que ya tienes.
**L3 — Proveedor real con cambio verificado.** El proveedor llama por teléfono a administración y avisa de que enviará un cambio de datos; administración **devuelve la llamada al número del contrato**; después llega el correo desde el dominio habitual y un segundo responsable valida. → Verificación por doble canal.
**L4 — Llamada de la familia que sí es real.** Una hija llama al **teléfono de la residencia**, pregunta por la dirección y es el centro quien, tras identificarla según protocolo, le explica lo que está permitido. → El centro controla el canal y la identidad.
**Idea para la actividad «¿legítimo o fraude?»**: mezclar 4 legítimos y 6-8 fraudes; añadir **un legítimo con apariencia sospechosa** (p. ej., correo interno con enlace corto) para enseñar que la decisión se toma **verificando**, no «a ojo».

---

## 5. Vídeos verificados (oEmbed)

Verificados con `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json` (título y canal literales). **Duración y fecha NO verificadas** (oEmbed no las devuelve y YouTube bloqueó la lectura de la página): comprobar a mano que son < 5 min antes de incrustar.

| ID | Título exacto | Canal | Pantalla donde encajaría |
|---|---|---|---|
| `7T32WBQRrBA` | Phishing  \| Línea de Ayuda en Ciberseguridad 017 - Casos Reales | INCIBE | Bloque 3 (reconocer correo falso) / Bloque 12 |
| `hpPi9CW6Z10` | Estafa \| Línea de Ayuda en Ciberseguridad 017 - Casos Reales | INCIBE | Bloque 9 o 11 (caso real de fraude); comprobar de qué estafa trata |
| `iBTDsKRT8F0` | ¡Cuidado con el phishing! #AyúdanosAProtegerte | Ministerio del Interior | Bloque 2/3 (introducción al phishing, voz de Policía/Guardia Civil) |
| `ffAxyd7ASMk` | Línea 017 de INCIBE - Tu ayuda en #ciberseguridad para empresas | INCIBE | Bloque 13 (dónde pedir ayuda) |
| `I2bI9lBy_cU` | Tu Ayuda En Ciberseguridad 017 - Línea 017 de INCIBE | INCIBE | Bloque 13 (alternativa para ciudadanía) |

Descartados (no oficiales): `8tbx9ab-71M` (JusticiaDigital@Learning), `snKcIwQJZpw` (CaixaBank, «Descubriendo un ciberfraude | Ep. 1 - La trampa del phishing», entidad bancaria), `TB349UfIp9w` y `0WNhaglKONM` (canales no oficiales).
No he conseguido verificar vídeos oficiales de **OSI, CCN, AEPD o Guardia Civil** específicos sobre smishing/vishing/sextorsión: la campaña «Uno de cada cinco delitos… #AyúdanosAProtegerte» del Ministerio del Interior existe (vídeos de un policía y un guardia civil, web unodecadacincodelitos.com) [SOLO BÚSQUEDA], pero no he obtenido IDs verificables más allá de `iBTDsKRT8F0`. Hay un vídeo de Guardia Civil sobre fraude del CEO, pero solo lo he visto en TikTok (no incrustable de forma fiable).
**Conclusión**: 3 vídeos con tema útil verificados (7T32WBQRrBA, hpPi9CW6Z10, iBTDsKRT8F0) + 2 de apoyo (017). **No llegamos a 4-6 de calidad temática**; recomiendo completar con una búsqueda manual en el canal de INCIBE y el del Ministerio del Interior.

---

## 6. Material del kit utilizable (rutas)

Base: `C:\Users\Jose Alberto Arruego\Downloads\kit_concienciacion\kit_concienciacion\`

**IMPORTANTE — incoherencia en `RecursosFormativos\04_Fraudes\`**: los ficheros llevan nombre «Fraudes_correo_electrónico» pero **su contenido es otro**:
| Fichero | Nombre | Contenido real (leído) |
|---|---|---|
| `04_Fraudes\04_Fraudes_correo_electrónico.pdf` (10 pp) | Guía | «REDES SOCIALES – Medidas de seguridad para los perfiles de empresa» (INCIBE). Su pág. 9-10 remite al «recurso formativo 4, El correo electrónico, principales fraudes y riesgos», que **no está en la carpeta**. |
| `04_Fraudes\Ficha\04_Fraudes_correo_electrónico.pdf` | Ficha | «CONTRASEÑAS – Buenas prácticas» (1 pág.) |
| `04_Fraudes\Presentacion\04_Fraudes_correo_electrónico.pptx` (13 diap.) | Presentación | Redes sociales (idéntico a la guía) |
| `04_Fraudes\Test_evaluacion\04_Test_Fraudes_correo_electrónico.pdf` | Test | «TEST DE EVALUACIÓN – CONTRASEÑAS» (10 preguntas) |

Lo que **sí** sirve para este curso:
- `RecursosFormativos\04_Fraudes\Consejos\0401_Fraudes.png` — «Envíos a múltiples destinatarios, siempre en COPIA OCULTA» (INCIBE Protege tu empresa). Útil como tarjeta de buena práctica de correo (bloque 6/3).
- `RecursosFormativos\04_Fraudes\Consejos\0402_Fraudes.png` — «Correo SOSPECHOSO: No pinches en los enlaces» (#CulturaDeSeguridad). Útil como imagen de cabecera del bloque 3-4.
- `RecursosFormativos\04_Fraudes\Posters\0403_Fraudes.png` — «Precaución con los correos electrónicos, pueden ser lobos con piel de cordero» (con QR a incibe.es/protege-tu-empresa y logo 017). Útil como portada del curso.
- `Posters\0401_Fraudes.png` y `0402_Fraudes.png`: iguales/similares a los de Consejos (no los revisé uno a uno).
- `Tripticos\phishing.pdf` — **el recurso más valioso**: define phishing/smishing/vishing, riesgos (robo de identidad y datos, pérdida de productividad), y 10 buenas prácticas: verificar la fuente; escribir la dirección en el navegador en vez de usar el enlace; «tu banco no te va a solicitar tus datos o claves por correo»; `https://` y candado; actualizar equipo y antivirus; atención a la redacción; «si es demasiado bueno para ser cierto, es que no es cierto»; no dar cuenta bancaria/tarjeta/DNI/móvil salvo pago real; informar a la empresa suplantada y a las autoridades. (Codificación del PDF defectuosa al extraer; el texto se entiende.)
- `Ataques_dirigidos\` (zips con archivos maliciosos/herramienta de seguimiento) y `Manual_Gophish\Manual_implantacion_Gophish.pdf`: no los he abierto; son para simulacros de phishing, **fuera del alcance** de este curso (y los zips con «archivos maliciosos» no deben abrirse).
- `Tripticos\redes_sociales.pdf`, `contraseñas.pdf`, `dispositivos_moviles.pdf`: complementarios.

**Formato del test del kit (para inspirarnos, sin copiar)**: 10 preguntas de **opción múltiple con 4 opciones (a–d)**, **una sola correcta**, con soluciones en la última página en forma «pregunta → letra»; incluye distractores tipo «todas las anteriores», «ninguna de las anteriores» y una pregunta «¿cuál es falsa?». Sin explicación de las respuestas. **Para nuestro curso**: añadir explicación por respuesta, escenarios breves en lugar de definiciones, y evitar «todas las anteriores».

---

## 7. Ideas de actividades interactivas y escenarios por rol

### Actividades (encajan con interacciones habituales de SCORMEditor)
1. **«¿Legítimo o fraude?»** (clasificar tarjeta a tarjeta) con los 10 fraudes + 4 legítimos del §4. 8-10 min.
2. **«Marca las señales»** sobre una imagen/captura simulada del correo (zonas pulsables: remitente, saludo, plazo, enlace, adjunto). Usar ejemplos 1, 2, 8, 9. 10 min.
3. **Ordenar los pasos «He picado»**: avisar → desconectar → cambiar clave → banco → guardar pruebas → denunciar. 5 min.
4. **Emparejar** canal ↔ nombre (correo=phishing, SMS=smishing, llamada=vishing, QR=quishing) y truco ↔ ejemplo (autoridad, urgencia…). 5 min.
5. **Escenario ramificado «El correo de la directora»** (administración): 3 decisiones (pagar / llamar / avisar) con consecuencias. 8 min.
6. **Escenario ramificado «La familia pide la analítica por WhatsApp»** (enfermería/supervisión). 8 min.
7. **Rellenar huecos**: «El código de WhatsApp que te llega por SMS no se da a _______.» 3 min.
8. **Verdadero/falso** de mitos (el candado = web segura; «si el remitente es conocido, es seguro»; «solo los ordenadores se infectan»). 5 min.
9. **Autoevaluación final**: 10 preguntas del §8.

### Escenarios por rol
| Rol | Escenario |
|---|---|
| Gerocultores/as, auxiliares | WhatsApp «de la supervisora» desde número nuevo pide código SMS (ej. 5); SMS de paquetería en el móvil personal (ej. 4); QR pegado en el tablón de la sala del personal. |
| Enfermería | Correo «resultados de analítica» con adjunto `.docm` (ej. 9); WhatsApp de un «familiar» pidiendo medicación/diagnóstico (ej. 6). |
| Administración | Falsa factura y cambio de IBAN (ej. 2); fraude del CEO (ej. 3); falsa AEAT (ej. 10). |
| Dirección | Fraude del CEO desde el otro lado (suplantan **su** identidad: avisar a los empleados del procedimiento de pagos); decisión de doble control de pagos. |
| Supervisión | Cambio de turno por WhatsApp (ej. 5); qué hacer cuando un trabajador te dice «he pulsado» (ayudar, sin culpar). |
| Mantenimiento | Llamada de «soporte técnico» (ej. 7); correo «presupuesto del proveedor» con `.zip`; SMS paquetería. |

Mensaje para el cierre: *cada rol tiene su estafa favorita; el hábito es el mismo.*

---

## 8. Preguntas de ejemplo (12) con respuesta y explicación

1. Recibes un correo de «Mutua Salud Laboral» desde `avisos@mutua-saludlaboral-gestion.com` que pide actualizar tu DNI en 24 h. ¿Qué haces?
   a) Pulso el enlace y lo hago rápido. b) Respondo con mi DNI. c) No pulso; llamo yo a la mutua por su teléfono oficial y aviso al responsable. d) Lo reenvío a mis compañeras.
   **Respuesta: c.** Pedir datos con prisa y desde un dominio dudoso son señales; se verifica por otro canal (INCIBE: contactar con la entidad por canales oficiales).
2. ¿Cuál es una señal típica de correo fraudulento según INCIBE?
   a) Trato por tu nombre y apellidos. b) «Estimado cliente», faltas de ortografía y prisa. c) Que no lleve adjuntos. d) Que llegue por la mañana.
   **Respuesta: b.** Comunicación impersonal, mala redacción y urgencia (INCIBE).
3. Administración recibe de un proveedor un correo con nuevos datos bancarios. Lo correcto es:
   a) Cambiar el IBAN para no retrasar pagos. b) Llamar al proveedor a un teléfono ya conocido y que otra persona valide el cambio. c) Responder al correo para confirmar. d) Pedir que lo manden por WhatsApp.
   **Respuesta: b.** Verificar por otro canal y doble control (INCIBE, fraude del CEO e historia real del proveedor suplantado). Responder al mismo correo no sirve: puede ser del estafador.
4. «Directora» escribe desde una cuenta `gmail` pidiendo una transferencia urgente y secreta. Es:
   a) Normal si es la directora. b) Un patrón de fraude del CEO: urgencia + confidencialidad + canal inusual. c) Un fallo informático. d) Un error del banco.
   **Respuesta: b.** Frases como «estoy en una reunión y no puedo hablar» y «es confidencial» son típicas (INCIBE).
5. ¿Qué extensión de adjunto debe hacerte sospechar especialmente?
   a) `.txt` b) `.docm`, `.exe`, `.vbs` o archivos `.zip` desconocidos c) `.jpg` de tu familia d) Ninguna.
   **Respuesta: b.** INCIBE cita `.exe`, `.vbs`, `.docm` y comprimidos de origen desconocido. (Matiz: cualquier adjunto inesperado merece verificación.)
6. En el móvil te llega un SMS: «Su paquete está retenido, pague 1,29 €». No esperabas nada. Haces:
   a) Pago, es poco dinero. b) Compruebo en la web o app oficial de la empresa, no en el enlace; si no hay envío, borro y bloqueo. c) Lo reenvío a un grupo. d) Respondo «STOP».
   **Respuesta: b.** INCIBE: verificar con la empresa por su canal oficial y desconfiar de la urgencia. Responder confirma que tu número está activo.
7. Una llamada de «Microsoft» te pide instalar una aplicación de acceso remoto para arreglar tu equipo. Lo correcto:
   a) Instalarla, es de Microsoft. b) Colgar; no instalar nada; avisar al responsable de TIC. c) Dar solo el código. d) Pedir su teléfono personal.
   **Respuesta: b.** Es vishing; INCIBE señala que estas llamadas no solicitadas son un fraude conocido.
8. Una «compañera» te escribe desde un número desconocido: «he cambiado de móvil, ¿me pasas el código que te llegue por SMS?». ¿Qué ocurre si lo das?
   a) Nada. b) Pueden **robarte tu cuenta de WhatsApp**. c) Solo se ve tu foto. d) Se borra el chat.
   **Respuesta: b.** El código de 6 cifras es la llave de tu cuenta (INCIBE, casos reales). Activa la verificación en dos pasos.
9. Una persona dice ser familiar de un residente y pide por WhatsApp su analítica. Tú:
   a) Se la envío. b) No facilito datos; sigo el protocolo del centro (identificación y canal autorizado) y aviso a enfermería/dirección. c) Le envío solo el diagnóstico. d) Pido su DNI por WhatsApp y se lo envío.
   **Respuesta: b.** Los datos de salud son especialmente sensibles y no se pueden dar a quien no se ha podido identificar. (Es el criterio del curso; la normativa de detalle la aplica el responsable de protección de datos del centro.)
10. Pulsaste un enlace de un correo raro y escribiste tu contraseña. Lo primero:
   a) No decir nada. b) Avisar al responsable, cambiar la contraseña (y las que fueran iguales) y guardar pruebas. c) Apagar el móvil y olvidarlo. d) Borrar el correo y ya.
   **Respuesta: b.** INCIBE: cambiar las contraseñas afectadas y guardar evidencias. Avisar pronto es clave, además, por si hubiera datos de residentes.
11. Un correo dice «tengo vídeos íntimos tuyos; paga 500 € en bitcoin en 48 h». Es:
   a) Una amenaza real. b) Sextorsión: no tienen nada; no pagar, bloquear y borrar. c) Una prueba de la empresa. d) Una factura.
   **Respuesta: b.** INCIBE (act. 27-mar-2025): no hay grabación; no se paga ni se responde. Si ya pagaste, denuncia y llama al 017.
12. ¿Dónde puedes pedir ayuda gratuita y confidencial si dudas?
   a) INCIBE, llamando al 017 (también WhatsApp 900 116 117 y Telegram @INCIBE017). b) Un foro. c) Pagando a quien te llamó. d) En ningún sitio.
   **Respuesta: a.** Servicio de INCIBE (comprobar horario vigente).
13. ¿Cuál de estas afirmaciones es FALSA?
   a) Un SMS puede ser un intento de estafa. b) El candado `https` garantiza que la web es la real. c) Un QR pegado sobre otro puede llevarte a una web falsa. d) Un banco no te pide claves por teléfono.
   **Respuesta: b.** INCIBE advierte de que https también puede manipularse; el candado no basta.
14. Un compañero te dice «creo que he abierto algo raro». Lo mejor:
   a) Reñirle. b) Decirle que avise ya al responsable y desconecte el equipo según el protocolo. c) Esperar a mañana. d) Reenviar el correo al grupo.
   **Respuesta: b.** Cultura de avisar sin culpar; la rapidez limita el daño.

(Se pueden usar 10-12 para la evaluación final y reservar el resto para actividades.)

---

## 9. Fuentes (URL)

**Leídas (INCIBE)**
- https://www.incibe.es/incibe/sala-de-prensa/incibe-detecto-mas-de-122000-incidentes-de-ciberseguridad-en-2025
- https://www.incibe.es/incibe/sala-de-prensa/incibe-amplia-el-horario-del-servicio-tu-ayuda-ciberseguridad
- https://www.incibe.es/empresas/blog/dia-mundial-del-correo-detectar-correos-fraudulentos
- https://www.incibe.es/empresas/blog/fraude-del-ceo-el-engano-que-puede-vaciar-la-cuenta-de-tu-pyme
- https://www.incibe.es/empresas/blog/historias-reales-suplantaron-mi-proveedor-y-mi-empresa-estafaron
- https://www.incibe.es/empresas/blog/ingenieria-social-tecnicas-utilizadas-los-ciberdelincuentes-y-protegerse
- https://www.incibe.es/ciudadania/blog/sabias-que-los-ataques-de-ingenieria-social-suponen-el-93-de-las-brechas
- https://www.incibe.es/incibe/protegete-conoce-a-fondo-phishing
- https://www.incibe.es/ciudadania/blog/email-spoofing-comprueba-quien-te-envia-un-correo-sospechoso
- https://www.incibe.es/ciudadania/blog/como-detectar-mensajes-fraudulentos-que-suplantan-servicios-de-mensajeria
- https://www.incibe.es/ciudadania/blog/smishing-el-fraude-de-los-sms
- https://www.incibe.es/ciudadania/blog/que-es-el-smishing
- https://www.incibe.es/ciudadania/blog/la-estafa-del-familiar-en-apuros
- https://www.incibe.es/ciudadania/avisos/has-recibido-un-mensaje-desde-un-numero-desconocido-que-dice-ser-tu-hijo
- https://www.incibe.es/ciudadania/avisos/has-recibido-un-correo-chantajeandote-con-que-publicaran-contenido-de-caracter
- https://www.incibe.es/ciudadania/avisos/intento-de-fraude-traves-de-llamadas-telefonicas-vishing
- https://www.incibe.es/ciudadania/avisos/phishing-suplantando-la-agencia-tributaria-con-riesgo-de-infeccion-por
- https://www.incibe.es/empresas/avisos/nueva-campana-de-phishing-utilizando-codigos-qr
- https://www.incibe.es/node/494006
- https://www.incibe.es/linea-de-ayuda-en-ciberseguridad/casos-reales/nueva-variante-del-robo-de-cuenta-de-whatsapp-suplantando-al-soporte-tecnico
- https://www.incibe.es/linea-de-ayuda-en-ciberseguridad/casos-reales/asi-te-roban-whatsapp-con-la-excusa-de-un-paquete-urgente
- https://www.incibe.es/linea-de-ayuda-en-ciberseguridad/casos-reales (listado)
- https://www.incibe.es/en/ciudadania/ayuda/reporte-de-fraude
- https://www.incibe.es/en/incibe-cert/blog/cibersecurity-healthcare-sector-features-threats-and-recommendations

**Solo vistas en buscador / no leídas (confirmar)**
- https://www.incibe.es/ciudadania/avisos/vuelven-las-llamadas-fraudulentas-del-supuesto-soporte-tecnico-de (falso soporte Microsoft)
- https://www.incibe.es/empresas/blog/spoofing-telefonico-cuando-una-llamada-pone-en-riesgo-la-confianza-de-tu-empresa
- https://www.incibe.es/sites/default/files/2026-02/Balance%20de%20ciberseguridad%202025%20INCIBE/BalanceCiberseguridad2025_INCIBE.pdf
- https://www.aepd.es/guias/guia-brechas-seguridad.pdf (AEPD, brechas, 72 h)
- https://www.ccn-cert.cni.es/es/seguridad-al-dia/avisos-ccn-cert/6957-ccn-cert-av-34-18-campana-de-phishing-contra-el-sector-salud
- https://www.enisa.europa.eu/sites/default/files/publications/Health%20Threat%20Landscape.pdf (ENISA, no legible por la herramienta)
- https://www.osi.es/es/actualidad/avisos/fraude
- https://www.interior.gob.es/opencms/es/detalle/articulo/Interior-alerta-sobre-las-ciberestafas-del-phishing-y-de-las-falsas-tiendas-de-venta-online/ (403 al leer)
- https://www.policia.es/_es/denuncias.php (leída solo la portada: confirma que existe denuncia digital)

**Kit local**: ver §6.

**Vacíos reconocidos**: Europol (sin datos); estafas específicas a familiares de residentes (sin fuente oficial); Seguridad Social (sin aviso leído); duración de los vídeos; denuncia de la Guardia Civil (portal no accesible); datos de AEPD de primera mano.
