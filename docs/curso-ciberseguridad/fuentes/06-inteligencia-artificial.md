# Curso 6 · Inteligencia artificial: nuevas amenazas y uso seguro

Documento de fuentes y material didáctico (≈ 1 h 40 min, formato móvil). Investigado el 5 de octubre de 2026.

**Convención de fiabilidad** usada en todo el documento:
- **[V]** = leído por mí en la fuente indicada (página web o PDF) durante esta investigación.
- **[V-sec]** = confirmado solo a través de resultados de búsqueda o fuentes secundarias; conviene releer la fuente primaria antes de publicar la cifra.
- **[NO VERIFICADO]** = no he podido confirmarlo; no usar tal cual.

> Nota de método: las páginas se leyeron con una herramienta que resume el contenido, no con lectura literal. Las citas textuales se han evitado salvo las que aparecen entre comillas en el propio resultado. Antes de publicar cifras o artículos concretos, contrastar con el enlace.

---

## 1. Resumen ejecutivo

1. La IA generativa (ChatGPT, Gemini, Copilot…) escribe, habla y crea imágenes y vídeos que parecen reales. No «sabe» cosas: predice la respuesta más probable, por eso puede equivocarse con total seguridad (alucinar).
2. Para los delincuentes la IA **no inventa ataques nuevos: hace los de siempre más rápidos, más baratos y más convincentes**. El CCN-CERT lo resume como la capacidad de «automatizar, acelerar y expandir a gran escala ataques ya conocidos» (guía BP/36, junio 2026) [V-sec: resumen de la AEPD].
3. Tres amenazas centrales para un centro sociosanitario: **correos/mensajes de phishing perfectos y personalizados**, **voz clonada** (el «hijo en apuros», el «director que pide una transferencia») y **videollamadas falsas (deepfake)**.
4. Caso de referencia: **Arup (Hong Kong, 2024)**: un empleado de finanzas hizo 15 transferencias por unos 25,6 millones de dólares tras una videollamada donde «el director financiero» y otros compañeros eran deepfakes [V: Fortune, 17-05-2024; CNN 16-05-2024 vía buscador].
5. Defensa: **desconfiar de la urgencia, verificar por otro canal conocido, colgar y volver a llamar, palabra clave, regla de doble confirmación para pagos y cambios de IBAN.** Funciona igual contra cualquier fraude con o sin IA.
6. Uso seguro de la IA en el trabajo: **no pegar nunca datos de residentes/salud, nombres, contraseñas ni documentos internos en una IA pública**; usar solo herramientas aprobadas por el centro; anonimizar; revisar siempre lo que genera. La AEPD (decálogo, 27-01-2026) y el Ministerio de Sanidad (Orientaciones para profesionales sanitarios) coinciden.
7. Marco legal: Reglamento (UE) 2024/1689 (AI Act). Entró en vigor el 1-08-2024; prohibiciones y alfabetización desde el 2-02-2025; la mayor parte de las normas desde el 2-08-2026; el «Ómnibus digital de IA» (Reglamento (UE) 2026/1744, 8-07-2026) retrasó el alto riesgo a dic-2027 / ago-2028 (ver §3.3).
8. La IA también ayuda (filtros de spam, detección de fraude, asistentes, transcripción), pero con matices: errores, sesgos, privacidad y supervisión humana.
9. Mensaje final para el trabajador: **«Si me presionan, paro. Si es dinero o datos, confirmo por otro canal. Si es un residente, no lo pego en una IA pública.»**

---

## 2. Contenido didáctico en bloques (listos para pantallas)

Tiempos orientativos sumando ≈ 100 min (incluye actividades, vídeos y test).

### Bloque 1 · ¿Qué es la IA generativa? (10 min)
**Pantalla 1.1 – En una frase.** Una IA generativa es un programa que ha «leído» muchísimos textos, imágenes y audios, y que con eso es capaz de **escribir, hablar o dibujar** algo nuevo cuando se lo pides.
**Pantalla 1.2 – Ejemplos que ya usas sin darte cuenta.** ChatGPT, Gemini y Copilot (te contestan por escrito); el asistente de voz del móvil o del altavoz (Siri, Alexa, «Ok Google»); el corrector que te sugiere frases; los filtros que «rejuvenecen» una foto.
**Pantalla 1.3 – Cómo «piensa» (analogía).** Es como el predictivo del móvil, pero gigante: elige la palabra más probable. No comprueba si es verdad. Por eso a veces **se inventa datos con mucha seguridad** («alucinación»).
**Pantalla 1.4 – Tres ideas clave.** (1) Suena segura aunque se equivoque. (2) Lo que le escribes viaja a una empresa externa. (3) Los delincuentes también la usan.
**Pantalla 1.5 – Verdadero/Falso rápido** (ver actividades).

Fuente de apoyo: INCIBE, «Inteligencia Artificial (IA) y ciberseguridad» (ciudadanía) describe la IA como tecnología que «permite a las máquinas imitar el comportamiento humano» y que su beneficio o daño depende del uso [V].

### Bloque 2 · Cómo usan la IA los estafadores (20 min)
**Pantalla 2.1 – Phishing «perfecto».** Antes, muchos correos falsos se delataban por faltas de ortografía. Hoy la IA los escribe sin errores, en buen español, con tu nombre, tu cargo y detalles reales del centro («Hola Marta, te escribo por el albarán de la lavandería de la planta 2…»). **Consejo:** la ortografía ya no sirve para detectar un fraude; fíjate en la **urgencia**, en el **remitente real** y en lo que **piden** (clic, contraseña, dinero, datos).
- Dato: el informe ENISA Threat Landscape 2025 (publicado 1-10-2025, 4.875 incidentes entre 1-07-2024 y 30-06-2025) [V: página oficial de ENISA para fecha y número de incidentes]. La cifra de que más del 80 % de la ingeniería social observada usaba IA procede de resúmenes secundarios del informe y **no he podido confirmarla en el texto original** [V-sec]. Úsese con cautela («según ENISA, la mayor parte…») o verifíquese en el PDF.

**Pantalla 2.2 – Voz clonada (vishing).** Con unos segundos de audio (un mensaje de voz, un vídeo en redes) se puede imitar una voz. Dos formas típicas:
- **Estafa del hijo/familiar:** «Mamá, estoy en un apuro, necesito dinero ya». INCIBE publicó (18-06-2024) el caso de una mujer que oyó la voz de su marido diciendo «¡Hola! No te puedo llamar, envíame un mensaje a este número»; llamó a su marido por su número habitual y comprobó que no había sido él [V]. Recomendación oficial: verificar por un canal independiente y acordar una **palabra clave** familiar.
- **Fraude del director/CEO:** en 2019 una empresa energética del Reino Unido perdió 220.000 € cuando atacantes imitaron con IA la voz del jefe de la matriz y pidieron una transferencia urgente a una cuenta húngara [V: INCIBE, «¿Qué es el voice hacking?», actualizado 27-11-2024].
- Cuánto audio hace falta: las cifras que circulan varían (3, 10, 15, 30 segundos según la fuente); no hay una cifra oficial citable. Mensaje válido: **«muy poco»** [V-sec].

**Pantalla 2.3 – Videollamada falsa (deepfake).** «Deepface» (cara superpuesta) y «deepvoice» (voz) [V: INCIBE, «Deepfakes, ¿cómo se aprovechan…?»]. Caso Arup (ver §3.1). Señales (INCIBE): fondos, luces o sombras incoherentes; parpadeo poco natural; voz que no cuadra con los labios; vídeos cortos para esconder fallos; contenido que busca emocionar o alarmar [V]. Ojo: **las señales visuales cada vez fallan más**; la defensa fiable es el **procedimiento** (verificar por otro canal), no «fijarse en la cara».

**Pantalla 2.4 – Imágenes y documentos falsos.** Fotos de «facturas», DNI, recetas, justificantes de transferencia o fotos de «familiares en el hospital» generados con IA. Una imagen o un PDF ya no prueban nada por sí solos.

**Pantalla 2.5 – Chatbots y asistentes falsos.** Páginas o aplicaciones que se hacen pasar por «asistente del centro», del banco o de un proveedor y te piden datos. También extensiones/apps «gratis» de IA que piden acceso a tu correo o archivos. Regla: usa solo las herramientas que el centro te ha dado.

**Pantalla 2.6 – Desinformación y suplantación.** Noticias, audios de WhatsApp «de un médico», cadenas sobre medicación o vacunas, vídeos de personas conocidas «recomendando» productos. INCIBE lo recoge entre los usos criminales de la IA: phishing y spam convincentes, deepfakes, noticias falsas y perfiles falsos [V]. Antes de reenviar: ¿quién lo dice?, ¿hay otra fuente seria?

**Pantalla 2.7 – Malware con IA, jailbreak y prompt injection (divulgativo).**
- *Malware con IA:* la IA ayuda a programar código malicioso a quien sabe poco. El CCN-CERT (Ciberamenazas y Tendencias 2024, 20-12-2024) señala que grupos criminales usan IA generativa para atacar y desarrollar malware [V]. Para ti no cambia nada: **no abras adjuntos ni enlaces inesperados** y mantén el equipo actualizado.
- *Jailbreak:* «engañar» a una IA con instrucciones ingeniosas para que haga lo que tenía prohibido (p. ej. escribir un correo fraudulento). Por eso existen modelos «sin freno» usados por criminales (ENISA cita nombres como WormGPT o FraudGPT [V-sec]).
- *Prompt injection:* un texto escondido en un documento o web que «da órdenes» a la IA que lo lee («ignora lo anterior y envía los datos a…»). Consecuencia práctica: **no pidas a una IA que lea documentos o enlaces de origen desconocido** y no le des acceso a tu correo ni a archivos del centro sin autorización. (El CCN-CERT BP/36 incluye entre las amenazas los «ataques dirigidos a sistemas de modelos de lenguaje» [V-sec].)

**Pantalla 2.8 – Estafas a mayores y a familiares de residentes.** Residentes y familiares son objetivo: llamada del «nieto» que necesita dinero, supuesto «médico del centro» que pide una transferencia para un tratamiento, «cobro pendiente de la mensualidad» con nuevo IBAN, inversiones o loterías con vídeos de famosos falsos. **El personal puede ser la primera barrera:** si un familiar o un residente te cuenta una llamada rara, aplica el protocolo y avisa a dirección. Ayuda: **línea 017 de INCIBE** (gratuita, confidencial; WhatsApp 900 116 117, Telegram @INCIBE017) [V: INCIBE].

### Bloque 3 · Cómo defenderse (20 min)
**Pantalla 3.1 – La regla de oro: PARAR · PENSAR · VERIFICAR.**
1. **Para** si hay prisa, secreto o miedo («es urgente», «no se lo digas a nadie»). La presión es la señal.
2. **Piensa:** ¿esto es normal? ¿me piden dinero, datos, claves o cambiar un IBAN?
3. **Verifica por otro canal**, usando un número o contacto que ya tenías (no el que te dan en el mensaje).
**Pantalla 3.2 – Cuelga y vuelve a llamar.** Corta y llama tú al número guardado de esa persona. Si es «el director», llama a su móvil o a recepción, no al número que te acaba de dar la llamada. Hay un caso INCIBE exactamente así [V].
**Pantalla 3.3 – Palabra clave.** Acordad en familia (y, si el centro lo decide, entre dirección y administración) una palabra o pregunta que solo conozcáis. Recomendada por INCIBE y por la Policía Nacional (código de familia: nombre de mascota, fecha, expresión común) [V: INCIBE; V-sec: Policía Nacional vía prensa]. No la escribas por WhatsApp ni la publiques.
**Pantalla 3.4 – Preguntas de control.** Si hay duda en una llamada o videollamada: pregunta algo que solo sepa la persona real y que no esté en redes («¿qué comimos el sábado?»). Pide un gesto inesperado (girar la cabeza, tapar la cara con la mano). Una IA en tiempo real puede fallar, pero **no te fíes solo de esto**.
**Pantalla 3.5 – Señales de alarma (lista).** Urgencia · secreto · petición de dinero o claves · cambio de canal («escríbeme a este número nuevo») · tono «raro»/sin respiraciones · imagen con bordes borrosos o labios descuadrados · dirección de correo casi igual a la real.
**Pantalla 3.6 – Protocolo de pagos y cambios de datos bancarios (propuesta).** *Esto es una propuesta didáctica basada en el caso Arup y en las recomendaciones citadas; cada centro debe adaptarlo a su procedimiento interno.*
1. Ninguna transferencia nueva o cambio de IBAN se hace solo por correo, WhatsApp, llamada o videollamada.
2. Se confirma **siempre** llamando al número registrado del proveedor/familiar/directivo.
3. Importes o cuentas nuevas: **segunda persona** que autoriza (doble firma).
4. Ante la duda se **retiene** el pago y se avisa a dirección/responsable de seguridad.
5. Se deja constancia (quién, cuándo, cómo se verificó).
6. Si ya se pagó: avisar al banco de inmediato (intentar bloquear/recuperar), a dirección y denunciar. INCIBE: 017.
**Pantalla 3.7 – Reduce tu huella de voz e imagen.** Menos audios públicos, perfiles privados, no contestar «sí» a llamadas de números desconocidos que piden confirmar algo (recomendación de las autoridades vía prensa [V-sec]).

### Bloque 4 · Uso seguro de la IA en el trabajo (25 min)
**Pantalla 4.1 – La IA pública no es un cajón cerrado.** Lo que escribes se envía a una empresa externa, puede guardarse y, según la herramienta, usarse para entrenar el sistema. La AEPD recuerda que, al usar IA, se envían además cookies, IP, datos del dispositivo, metadatos y ubicación [V-sec: resumen de su decálogo].
**Caso real: Samsung (2023).** Empleados de Samsung pegaron en ChatGPT código fuente y datos internos para que les ayudase con tareas; la compañía acabó prohibiendo las herramientas de IA generativa (Bloomberg, 2-05-2023) [V-sec: varios medios].
**Pantalla 4.2 – Qué NUNCA se pega en una IA pública.** Nombres, DNI, fotos o direcciones de residentes y familiares · diagnósticos, medicación, historias clínicas, informes · contraseñas y claves · documentos internos (contratos, protocolos no públicos, actas, nóminas, cuadrantes con datos personales) · datos bancarios · imágenes de personas (la AEPD lo desaconseja expresamente).
Base oficial: el decálogo AEPD «Cuidado con lo que le confIAs» (27-01-2026) recomienda no compartir datos personales, ni información sensible (médica, financiera, contractual), ni imágenes de otras personas, ni información confidencial de tu empleador, y seguir las normas de seguridad de tu organización [V]. El Ministerio de Sanidad (Orientaciones para profesionales sanitarios en el uso de la IA, Secretaría General de Salud Digital, Información e Innovación del SNS) indica que **no se deben introducir datos personales de pacientes, especialmente de salud, en herramientas de IA no diseñadas, validadas y autorizadas para uso sanitario o sin garantías RGPD**, y que hacerlo «constituiría una infracción grave» [V: PDF leído]. Sí admite el uso de información **anonimizada**.
**Pantalla 4.3 – Anonimización básica (receta).**
- Quita nombre y apellidos, DNI, nº de historia, habitación, fechas exactas, teléfono, dirección, nombre de familiares y de otros trabajadores.
- Cambia «Doña Carmen López, 87 años, habitación 214» por «una persona mayor».
- Cuidado: **la combinación de detalles raros también identifica** (en un centro sociosanitario pequeño, «el único residente con X enfermedad y 102 años» se reconoce). Ante la duda, no lo uses.
- Mejor aún: describe un **caso ficticio** (la AEPD recomienda describir un supuesto ficticio) [V-sec].
**Pantalla 4.4 – Herramientas aprobadas por el centro.** Si el centro ha contratado una herramienta de IA con garantías (contrato, RGPD, datos no usados para entrenar), usa esa y solo para lo permitido. Si no hay política, **pregunta antes**. La propia AEPD en su política interna de IA generativa fija como principios: respeto a la protección de datos, uso de plataformas autorizadas y supervisión humana [V-sec: PDF resumido].
**Pantalla 4.5 – Revisa siempre lo que sale (alucinaciones).** La IA puede inventar dosis, normas, nombres o citas. Caso real: en Moffatt v. Air Canada (tribunal de Columbia Británica, 14-02-2024) el chatbot de la aerolínea dio información falsa sobre reembolsos y el tribunal consideró responsable a la empresa [V-sec: varias fuentes]. Moraleja: **quien usa y firma el resultado es responsable**. El Ministerio de Sanidad: la IA nunca sustituye el juicio clínico; hay que validar sus recomendaciones y tratar lo que genera como **borrador** [V].
**Pantalla 4.6 – Sesgos y trato justo.** La IA aprende de datos del pasado y puede discriminar (por edad, género, origen, discapacidad). No la uses para decidir sobre personas (quién recibe qué cuidado, a quién se contrata) sin supervisión humana. El Ministerio de Sanidad lista como no aceptable «tomar decisiones que afecten a las personas sin supervisión humana» [V].
**Pantalla 4.7 – Transparencia.** Si una comunicación o imagen la ha generado una IA, dilo. El Ministerio de Sanidad considera no aceptable «generar imágenes o vídeos realistas sin identificar que se han generado mediante IA» ni usar IA para comunicaciones automáticas sin avisar al interlocutor [V]. Y si la IA influye en la atención a un residente, la regla es informar (ver doc. de Sanidad).
**Pantalla 4.8 – Derechos de autor y fotos.** No uses imágenes de residentes ni de compañeros para «crearles» fotos o vídeos con IA; no copies textos protegidos como si fueran tuyos. Lo que la IA genera puede parecerse a obras existentes: **revisa y cita**.
**Pantalla 4.9 – Usos aceptables (según Sanidad).** Traducir texto sin datos personales, buscar ideas, preparar material informativo o educativo sin datos sensibles (con supervisión), analizar información no sensible o bien anonimizada [V].

### Bloque 5 · Marco legal y guías oficiales (10 min)
Ver §3.3 (calendario) y §9 (enlaces). Mensajes sencillos para el alumnado:
- **Europa tiene una ley de IA** (Reglamento (UE) 2024/1689). Prohíbe prácticas inaceptables (p. ej. manipulación subliminal dañina, explotar la vulnerabilidad por edad o discapacidad, puntuación social, reconocimiento de emociones en el trabajo y la escuela [V: art. 5 según texto consolidado BOE]) y obliga a **informar de los contenidos falsos generados con IA** (art. 50, deepfakes) y a formar al personal que usa IA (art. 4).
- **AESIA** (Agencia Española de Supervisión de la IA) es el organismo español de supervisión; entre sus funciones, supervisar la aplicación del Reglamento y promover la alfabetización en IA [V-sec].
- **AEPD:** la IA no exime de cumplir el RGPD; decálogo de uso seguro (27-01-2026) [V].
- **INCIBE (017), CCN-CERT (BP/36 «IA ofensiva», jun-2026; «Ciberamenazas y Tendencias 2024»), ENISA (Threat Landscape 2025).**
- **Sanidad/OMS:** Orientaciones del Ministerio de Sanidad para profesionales en el uso de la IA [V]; Estrategia de IA del SNS aprobada por el Consejo Interterritorial (nov-2025, la fecha 12-11-2025 se deduce de la URL de La Moncloa; no pude abrir la página) [V-sec]; guía de la OMS sobre modelos multimodales grandes en salud, edición web de 25-03-2025 [V].

### Bloque 6 · La IA como aliada, con matices (5 min)
Ayuda: filtros antispam y antiphishing, detección de pagos extraños en bancos, asistentes que transcriben reuniones o resumen documentos **no sensibles**, traducción, ideas para actividades de animación sociocultural, borradores de comunicados genéricos.
Matices: (1) pueden fallar (falsos positivos/negativos), (2) llevan sesgos, (3) la privacidad depende de la herramienta, (4) siempre debe haber una persona que decida. El CCN-CERT BP/36 plantea usar la IA como «actor defensivo gobernado» [V-sec].

### Cierre (5 min)
Decálogo final del alumno (ver actividad 7.8) + test (§8).

---

## 3. Datos y casos reales verificados

### 3.1 Caso Arup (Hong Kong, 2024) — estafa por videollamada deepfake
- **Qué ocurrió:** a principios de 2024 (enero) un empleado de finanzas de la oficina de Hong Kong de Arup recibió un correo supuestamente del director financiero (CFO) en Londres pidiendo una transacción confidencial; le invitaron a una videollamada en la que el CFO y otros compañeros eran **imágenes y voces falsas**. Hizo **15 transferencias por 200 millones de dólares de Hong Kong (≈ 25,6 millones de USD)** a 5 cuentas bancarias [V: Fortune 17-05-2024 (cifra, 15 transferencias, descubrimiento al verificar con la oficina central del Reino Unido); V-sec: CNN y otros para el correo inicial y las 5 cuentas].
- **Confirmación de la empresa:** Arup confirmó el 16-05-2024, en un comunicado a CNN, que se usaron «voces e imágenes falsas»; la policía de Hong Kong había publicado el caso en febrero de 2024 sin nombrar a la víctima [V-sec]. Rob Greig (director de información de Arup) lo describió como un problema creciente de «industria, negocios y sociedad» [V: Fortune].
- **Matiz:** el nombre «Arup» y la cifra están confirmados por la propia empresa; los detalles técnicos (qué herramienta usaron) **no son públicos**.
- Enlaces: https://fortune.com/europe/2024/05/17/arup-deepfake-fraud-scam-victim-hong-kong-25-million-cfo · https://www.cnn.com/2024/05/16/tech/arup-deepfake-scam-loss-hong-kong-intl-hnk (CNN devolvió error 451 al leerla directamente; datos tomados del resultado de búsqueda).
- **Lección paral centro:** da igual cuánto se parezca el director: **ningún pago se autoriza solo por videollamada**.

### 3.2 Otros casos y datos
| Hecho | Fecha | Fuente | Estado |
|---|---|---|---|
| Empresa energética del Reino Unido pierde 220.000 € por voz clonada del CEO (cuenta en Hungría) | 2019 | INCIBE, «¿Qué es el voice hacking?», act. 27-11-2024 | [V] |
| Mujer recibe llamada con la voz de su marido clonada («envíame un mensaje a este número») | 18-06-2024 | INCIBE, Línea de Ayuda, casos reales | [V] |
| ENISA Threat Landscape 2025: 4.875 incidentes (1-07-2024 a 30-06-2025); phishing como vector principal (≈ 60 %) | 1-10-2025 | ENISA | Fecha e incidentes [V]; 60 % y «80 % con IA» [V-sec] |
| CCN-CERT «Ciberamenazas y Tendencias 2024»: grupos cibercriminales integran IA generativa y la usan para malware | 20-12-2024 | CCN-CERT | [V] |
| CCN-CERT BP/36 «Guía de buenas prácticas frente al modelo de IA ofensiva» | jun-2026 (23 o 25 de junio según la fuente) | CCN-CERT / AEPD laboratorio | [V-sec]; el PDF no se pudo descargar |
| Samsung prohíbe la IA generativa tras filtraciones por ChatGPT | 2-05-2023 | Bloomberg y otros | [V-sec] |
| Moffatt v. Air Canada, 2024 BCCRT 149: empresa responsable de lo que dice su chatbot | 14-02-2024 | Tribunal de Resolución Civil de Columbia Británica (vía McCarthy Tétrault, ABA…) | [V-sec] |
| AEPD publica el decálogo «Cuidado con lo que le confIAs» | 27-01-2026 | AEPD | [V] |
| OMS: «Ethics and governance of AI for health: Guidance on large multi-modal models» (98 págs.) | edición web 25-03-2025 | WHO | [V]; la edición original es anterior (enero 2024, no confirmado) |

Cifras que **NO** se recomienda citar: porcentajes de aumento de deepfakes o pérdidas globales de blogs comerciales; segundos exactos de audio necesarios para clonar una voz.

### 3.3 Reglamento (UE) 2024/1689 (AI Act): calendario actualizado a octubre de 2026
Fuentes: Servicio de Ayuda del AI Act de la Comisión Europea (línea temporal, que declara reflejar el Ómnibus) [V]; BOE, DOUE-L-2026-81147, Reglamento (UE) 2026/1744 de 8-07-2026 («Ómnibus digital sobre IA») [V]; Cuatrecasas (nota sobre la aprobación) [V]; BOE DOUE-L-2024-81079 para el texto original [V parcial].

| Fecha | Qué se aplica |
|---|---|
| 1-08-2024 | Entrada en vigor del Reglamento |
| **2-02-2025** | Disposiciones generales (definiciones y **alfabetización en IA, art. 4**) y **prácticas prohibidas (art. 5)** |
| 2-08-2025 | Obligaciones para modelos de IA de propósito general; los Estados designan autoridades |
| **2-08-2026** | Aplicación general del Reglamento, incluida la **transparencia del art. 50** (avisar de contenidos sintéticos, deepfakes) y el régimen de supervisión/sanciones |
| 2-12-2026 | Nuevas prohibiciones introducidas por el Ómnibus: sistemas que generan desnudos de personas reales / material íntimo no consentido y abuso sexual infantil; también fecha citada para soluciones de transparencia de contenidos generados |
| 2-08-2027 | Los Estados deben contar con al menos un «sandbox» regulatorio |
| **2-12-2027** | Sistemas de **alto riesgo del Anexo III** (aplazado por el Ómnibus) |
| **2-08-2028** | Alto riesgo integrado en productos regulados (Anexo I) (aplazado) |

Puntos delicados que deben revisarse antes de publicar:
- **Art. 4 (alfabetización):** el resumen del BOE sobre el Ómnibus indica que pasa de ser una obligación estricta a «medidas para apoyar la promoción» de la alfabetización [V-sec: resumen automático]. **Hay que leer el texto consolidado del art. 4 modificado antes de afirmar «el centro está obligado a formar»**. Mensaje seguro para el curso: la formación en IA es una **buena práctica reconocida y un objetivo de la norma**; no afirmar sanción concreta.
- Una de las lecturas automáticas del texto del BOE original (art. 113) salió incoherente (mezclaba fechas); **no usar** ese resumen; vale la tabla de la Comisión Europea.
- Un centro sociosanitario que usa un chatbot genérico como herramienta de oficina normalmente no es «proveedor» de IA, sino **«responsable del despliegue» (deployer)**; la clasificación exacta de cada herramienta no se ha verificado: [NO VERIFICADO].
- El documento del Ministerio de Sanidad indica que el Reglamento se aplica gradualmente entre 2025 y 2027, con plazos hasta 2031 para completarlo [V], pero se redactó antes del Ómnibus.

---

## 4. Vídeos

**Resultado honesto de la búsqueda:** no he encontrado en YouTube vídeos oficiales breves en español de INCIBE, OSI, AEPD, Policía o Guardia Civil dedicados a IA/deepfakes que pudiera verificar. Los que siguen **sí existen y su ID, título y canal están verificados con oEmbed**; son de medios o instituciones fiables, pero **no oficiales de ciberseguridad española**. **Duración y contenido exacto NO verificados** (oEmbed no devuelve duración y no pude leer la página): hay que **ver cada vídeo y medir la duración (<6 min) antes de incluirlo**. Descartados: vídeos de canales sin garantías (blogueros, academias).

| # | ID | Título (oEmbed) | Canal | Pantalla donde podría ilustrar | Verificado |
|---|---|---|---|---|---|
| 1 | `S2IUl50Fb60` | Los deepfakes inundan tus redes: Por qué los videos de IA son peligrosos y cómo detectarlos | DW Tecnología y mundo digital | Bloque 2, pantalla 2.3 (deepfakes y señales) | oEmbed OK |
| 2 | `hSxXpr2vyio` | Descubriendo un ciberfraude \| Ep. 4 – La amenaza del deepfake | CaixaBank | Bloque 2/3: deepfake y fraude en una entidad financiera (pagos) | oEmbed OK |
| 3 | `WCYP-D5Kf9E` | ¡Cuidado con la IA! Sesgos, voces falsas y estafas que parecen reales | ADICAE Consumidores | Bloque 2.2 (voz falsa) y 4.6 (sesgos) | oEmbed OK |
| 4 | `mnoSbNXswt4` | 'Deepfakes': así usan la inteligencia artificial en estafas digitales \| Noticias Telemundo | Noticias Telemundo | Bloque 2.1–2.3 introducción a estafas con IA | oEmbed OK (medio estadounidense en español) |
| 5 | `77EulRV_2tk` | ¡Fraudes con voz echa por IA! Así debes reaccionar para no caer | Grupo Fórmula | Bloque 2.2 / 3.1 (voz clonada y reacción) | oEmbed OK (medio mexicano; acento y ejemplos latinoamericanos) |

Recomendación: si el equipo puede, sustituir por vídeos propios o por los de INCIBE (canal https://www.youtube.com/c/INCIBE) tras revisarlos manualmente. Otras piezas oficiales no en vídeo pero muy útiles: casos reales de INCIBE (texto) enlazados en §9.

---

## 5. Semáforo de datos con una IA pública (actividad de clasificación)

### ROJO — NUNCA se comparte con una IA pública
1. «Doña Carmen López, 87 años, habitación 214, con demencia y disfagia».
2. La historia clínica o el informe de alta de un residente (aunque sea «solo para resumir»).
3. Foto de un residente o de un compañero para «mejorarla» o «hacerle un vídeo».
4. Contraseña del correo del centro, PIN del programa de gestión, claves de la caja fuerte de medicación.
5. IBAN del centro o de un proveedor, y el contrato con las tarifas.
6. Lista de residentes con DNI y teléfonos de los familiares.
7. Acta de la reunión de dirección o expediente disciplinario de un trabajador.
8. Cuadrante de turnos con nombres, bajas y motivos.
9. Protocolo interno de seguridad / planos con accesos y alarmas.

### ÁMBAR — Solo con anonimización, herramienta aprobada y revisión
1. Pedir ayuda para redactar un comunicado a familias **sin nombres ni datos** de nadie.
2. Pedir un resumen de un protocolo **genérico** (p. ej. «higiene de manos») pegando texto que no es interno ni confidencial.
3. «Una persona mayor con riesgo de caídas…»: describir un **caso ficticio** para pedir ideas de prevención (después se contrasta con el protocolo del centro y la supervisión de enfermería).
4. Traducir un texto no confidencial para un familiar extranjero.
5. Mejorar la redacción de un correo propio sin datos personales de terceros.
6. Usar la herramienta de IA que **el centro** ha contratado, para algo concreto autorizado.

### VERDE — Se puede hacer con una IA pública (con revisión humana)
1. Pedir ideas para actividades de animación (juegos de memoria, manualidades de temporada) sin datos de personas reales.
2. Explicar un concepto general («¿qué es la deshidratación en mayores?») y contrastar luego con una fuente oficial.
3. Pedir un borrador de cartel o texto de una fiesta del centro con información pública.
4. Pedir un ejemplo de tabla o lista de comprobación genérica (sin datos del centro).
5. Aprender a usar una función de Word/Excel.

Criterio rápido para el alumno: **«¿Puede identificar a una persona real o al centro? ¿Lo dejaría en el tablón de la calle? Si la respuesta es sí/no, no lo pego.»** Basado en AEPD (decálogo) y Ministerio de Sanidad (usos aceptables/no aceptables) [V].

---

## 6. Escenarios por rol

**E1 · Directora/director — videollamada falsa.** Recibe un correo del «presidente del grupo» pidiendo una videollamada urgente y confidencial; en la llamada, la imagen y voz son las del presidente y piden una transferencia a un proveedor nuevo «para cerrar hoy». *Respuesta correcta:* no pagar; colgar; llamar al presidente a su móvil de siempre; exigir doble autorización; avisar a la persona responsable de seguridad/IT y, si hay intento, al 017 o a la Policía/Guardia Civil. *Distractores:* «Se le ve y se le oye, es él» / «Pido confirmación por el mismo chat».

**E2 · Familiar de un residente — audio clonado.** Un hijo recibe un audio de WhatsApp con la voz de su madre residente: «Me han cambiado a otra habitación, necesito que pagues hoy esta factura». *Respuesta:* no pagar; llamar a su madre/al centro por el teléfono habitual; usar la palabra clave. La **gerocultora** a la que se lo cuente debe avisar a dirección y recomendar el 017.

**E3 · Administrativa — pega un informe de un residente en ChatGPT.** Quiere que «lo resuma para la familia». *Error:* datos de salud identificables en una IA pública. *Cómo hacerlo bien:* no pegarlo; si el centro tiene herramienta aprobada, usarla; si no, redactar a mano un texto genérico sin datos o pedir a la IA solo una plantilla con huecos y rellenarla ella. Avisar al delegado/a de protección de datos si ya ocurrió.

**E4 · Gerocultora — pide ayuda a la IA con un protocolo.** Quiere saber cómo movilizar a un residente con riesgo de caída. *Bien:* consulta general sin datos y **contrasta con el protocolo del centro y con enfermería**; la IA puede equivocarse. *Mal:* seguir la respuesta de la IA sin revisar o poner el nombre del residente.

**E5 · Administración/contabilidad — cambio de IBAN de un proveedor.** Llega un correo impecable (sin faltas, con firma y logo) que informa del nuevo IBAN del proveedor de alimentación. *Respuesta:* llamar al proveedor a su teléfono registrado, confirmar con una segunda persona del centro y registrar la verificación antes de modificar la ficha.

**E6 · Enfermería/supervisión — audio de «la doctora».** Recibe un audio con la voz de la doctora: «Cambia la dosis de X, ahora, no hay tiempo». *Respuesta:* **no se modifican pautas por un audio**; confirmar con la médica por el canal habitual y el registro del centro. (Escenario didáctico, no basado en un caso real.)

**E7 · Mantenimiento — «asistente» que pide datos.** Un chat de «soporte» de un proveedor de la caldera/ascensor pide acceso remoto o la clave del wifi. *Respuesta:* verificar al proveedor por un canal conocido; no dar claves; avisar a dirección.

**E8 · Cualquier trabajador/a — vídeo viral falso.** Le llega por el grupo de WhatsApp un vídeo de un «médico famoso» recomendando un producto para la memoria. *Respuesta:* no reenviar; buscar la noticia en una fuente fiable; avisar si es una estafa.

---

## 7. Ideas de actividades interactivas

1. **Clasificar en el semáforo** (arrastrar tarjetas: §5) con retroalimentación inmediata por tarjeta. (~8 min)
2. **¿Real o IA?** Pares de imágenes o audios (generados por el equipo con herramientas propias, no de personas reales) para votar cuál es falso; luego explicar que **las pistas fallan** y que el procedimiento es lo que protege. (~7 min)
3. **Detecta las señales de un correo perfecto:** el correo no tiene faltas; marcar en el texto los puntos de alarma (urgencia, secreto, IBAN, remitente casi igual). (~8 min)
4. **Escenarios ramificados** (E1, E3, E5): decisión en 3 pasos, con consecuencias. (~15 min)
5. **Ordena el protocolo de confirmación de pagos** (orden correcto de los 6 pasos de la pantalla 3.6). (~5 min)
6. **Emparejar:** término ↔ explicación en llano (alucinación, deepfake, vishing, jailbreak, prompt injection, anonimizar). (~5 min)
7. **Palabra clave:** actividad de reflexión (sin escribir la palabra real): «con quién acordarías una palabra clave y qué tipo de palabra elegirías». Respuesta modelo: algo que no esté en redes. (~3 min)
8. **Decálogo final (tarjetas):** 1) Paro si hay prisa. 2) Verifico por otro canal. 3) Cuelgo y vuelvo a llamar. 4) Palabra clave. 5) Pagos con doble confirmación. 6) Nada de datos de residentes en IA pública. 7) Solo herramientas aprobadas. 8) Reviso lo que dice la IA. 9) No uso fotos de personas. 10) Si dudo, pregunto o llamo al 017.
9. **Mejora un prompt (anonimización):** dado un mensaje con datos reales, tachar lo que sobra y reescribirlo.
10. **Verdadero/Falso rápido** para el bloque 1 (ver preguntas 1, 2, 12).

---

## 8. Preguntas de ejemplo (con respuesta y explicación)

**P1.** ¿Por qué una IA como ChatGPT puede dar una respuesta falsa con mucha seguridad?
a) Porque está conectada a internet y copia mal. b) Porque predice la respuesta más probable, pero no comprueba si es verdad. c) Porque se lo ordena su dueño. d) Porque solo funciona en inglés.
**Respuesta: b.** Funciona como un predictivo gigante; puede «alucinar» datos que suenan bien.

**P2.** Ya no hay faltas de ortografía en los correos fraudulentos. ¿Qué debo mirar?
a) Nada, ya no se puede saber. b) La urgencia, el remitente real y lo que me piden. c) Si tiene logo. d) Si es largo.
**Respuesta: b.** La IA escribe sin errores; la señal está en la presión y en la petición (dinero, claves, datos).

**P3.** Recibes un audio con la voz de tu hijo pidiéndote dinero urgente desde un número nuevo. ¿Qué haces?
a) Hago el pago porque es su voz. b) Contesto al audio. c) Llamo yo a su número de siempre antes de hacer nada. d) Lo reenvío a la familia.
**Respuesta: c.** La voz se puede clonar con muy poco audio; la verificación por otro canal conocido es la defensa (INCIBE).

**P4.** Para qué sirve una palabra clave familiar.
a) Para entrar en el wifi. b) Para confirmar que quien llama es de verdad quien dice ser. c) Para firmar contratos. d) Para bloquear llamadas.
**Respuesta: b.** Debe ser algo que solo conozcáis y que no esté en redes. Lo recomienda INCIBE.

**P5.** Una videollamada con el director, que se ve y se oye perfectamente, te pide una transferencia urgente. ¿Qué haces?
a) Hago la transferencia: lo estoy viendo. b) Pido que escriba por chat y hago el pago. c) Corto y confirmo llamando al número habitual y con una segunda persona. d) Hago solo la mitad.
**Respuesta: c.** Es el esquema del caso Arup (15 transferencias, unos 25,6 M$, 2024).

**P6.** En el caso Arup, ¿qué falló según lo publicado?
a) No había antivirus. b) Un empleado confió en una videollamada con personas falsas y no verificó por otro canal. c) Se perdió un portátil. d) Hubo un virus en el servidor.
**Respuesta: b.** La empresa confirmó que se usaron voces e imágenes falsas; el fraude se descubrió al contrastar con la oficina central.

**P7.** ¿Cuál de estos datos puedes pegar en ChatGPT público?
a) Nombre y diagnóstico de una residente. b) Contraseña del programa de gestión. c) Una pregunta general sobre qué actividades de memoria existen para personas mayores. d) Un informe de alta.
**Respuesta: c.** No contiene datos personales ni confidenciales; contrasta el resultado.

**P8.** ¿Por qué no debes pegar datos de residentes en una IA pública?
a) Porque es lenta. b) Porque los datos salen a una empresa externa, sin garantías de RGPD, y puede constituir una infracción grave. c) Porque gasta batería. d) Porque no entiende español.
**Respuesta: b.** Así lo señalan la AEPD y el Ministerio de Sanidad.

**P9.** «Una persona mayor con riesgo de caídas» frente a «Doña Carmen López, hab. 214, 87 años». ¿Qué es la anonimización?
a) Borrar el mensaje. b) Quitar o cambiar los datos que permiten identificar a una persona, incluso combinados. c) Ponerle una contraseña. d) Traducirlo.
**Respuesta: b.** Y cuidado: la combinación de detalles raros también identifica.

**P10.** La IA te sugiere una dosis para un medicamento. ¿Qué haces?
a) La aplico. b) La uso como borrador y la contrasto con el protocolo y con enfermería/medicina. c) La imprimo. d) La envío a la familia.
**Respuesta: b.** La IA nunca sustituye el juicio profesional; su resultado es un borrador.

**P11.** ¿Qué es un «prompt injection»? (nivel divulgativo)
a) Un virus de impresora. b) Un texto escondido en un documento o web que «da órdenes» a la IA que lo lee. c) Una contraseña. d) Una foto falsa.
**Respuesta: b.** Por eso no se debe pedir a una IA que lea contenido de origen desconocido ni darle acceso al correo sin autorización.

**P12.** Verdadero o falso: «Si la IA lo ha escrito, ya es responsabilidad de la IA».
**Respuesta: falso.** Quien usa y firma el resultado es responsable (ejemplo Moffatt v. Air Canada: la empresa respondió por lo que dijo su chatbot).

**P13.** ¿Cuál es la fecha en la que, según el calendario de la Comisión Europea, se aplica la mayor parte del Reglamento de IA, incluida la transparencia de contenidos generados por IA (art. 50)?
a) 2-02-2025 b) 2-08-2026 c) 2-12-2027 d) 2-08-2028.
**Respuesta: b.** (El alto riesgo del Anexo III se retrasó a dic-2027 y el Anexo I a ago-2028 con el Ómnibus de 2026.)

**P14.** ¿Qué teléfono gratuito de INCIBE ayuda ante un posible fraude?
a) 112 b) 017 c) 016 d) 091.
**Respuesta: b.** Línea de ayuda en ciberseguridad de INCIBE (gratuita y confidencial).

**P15.** ¿Cuál es una buena regla para pagos y cambios de IBAN?
a) Por correo y rápido. b) Solo por videollamada. c) Confirmar por un canal conocido y con una segunda persona. d) Nunca hace falta confirmar a un proveedor habitual.
**Respuesta: c.** Un cambio de IBAN es el fraude más habitual; el correo puede estar perfectamente escrito por IA.

---

## 9. Fuentes (con URL)

**Leídas por mí [V] (cuando la página se pudo abrir):**
1. INCIBE — «Deepfakes, ¿cómo se aprovechan de esta tecnología para engañarnos?» — https://www.incibe.es/ciudadania/blog/deepfakes-como-se-aprovechan-de-esta-tecnologia-para-enganarnos
2. INCIBE — «Nuevo método de fraude usando la voz de un familiar creada con inteligencia artificial» (18-06-2024) — https://www.incibe.es/linea-de-ayuda-en-ciberseguridad/casos-reales/nuevo-metodo-de-fraude-usando-la-voz-de-un-familiar-creada-con-inteligencia-artificial
3. INCIBE — «¿Qué es el voice hacking?» (act. 27-11-2024) — https://www.incibe.es/ciudadania/blog/que-es-el-voice-hacking
4. INCIBE — Inteligencia Artificial (IA) y ciberseguridad — https://www.incibe.es/ciudadania/tematicas/inteligencia-artificial
5. Fortune — Arup (17-05-2024) — https://fortune.com/europe/2024/05/17/arup-deepfake-fraud-scam-victim-hong-kong-25-million-cfo
6. CNN — Arup (16-05-2024) (solo vía resultado de búsqueda; acceso directo bloqueado) — https://www.cnn.com/2024/05/16/tech/arup-deepfake-scam-loss-hong-kong-intl-hnk
7. AEPD — decálogo «Cuidado con lo que le confIAs» (27-01-2026) — https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/aepd-publica-decalogo-recomendaciones-proteger-privacidad-al-usar-ia
8. AEPD — Política general para el uso de IA generativa en procesos (PDF) — https://www.aepd.es/documento/politica-iag-aepd.pdf
9. Ministerio de Sanidad — Orientaciones para profesionales sanitarios en el uso de la IA (PDF; leído en texto) — https://www.sanidad.gob.es/areas/saludDigital/estrategiaIASNS/doc/IASNS_Orientaciones_para_profesionales_sanitarios_en_el_uso_de_la_IA.pdf
10. Ministerio de Sanidad — Estrategia de IA en el SNS — https://www.sanidad.gob.es/areas/saludDigital/estrategiaIASNS/home.htm
11. OMS — Guidance on large multi-modal models — https://www.who.int/publications/i/item/9789240084759
12. BOE — Reglamento (UE) 2026/1744, Ómnibus digital sobre IA (8-07-2026) — https://www.boe.es/buscar/doc.php?id=DOUE-L-2026-81147
13. BOE — Reglamento (UE) 2024/1689 (texto) — https://www.boe.es/buscar/doc.php?id=DOUE-L-2024-81079 ; EUR-Lex: https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32024R1689 (no se pudo leer)
14. Comisión Europea, AI Act Service Desk — línea temporal — https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act
15. Cuatrecasas — El Consejo de la UE aprueba el Ómnibus Digital de IA — https://www.cuatrecasas.com/en/global/intellectual-property/art/council-eu-approves-digital-omnibus-ai
16. ENISA Threat Landscape 2025 — https://www.enisa.europa.eu/publications/enisa-threat-landscape-2025
17. CCN-CERT — Ciberamenazas y Tendencias 2024 (20-12-2024) — https://www.ccn.cni.es/es/actualidad-ccn/1237-ciberespionaje-hacktivismo-y-ransomware-el-ccn-cert-advierte-de-las-tacticas-tecnicas-y-procedimientos-de-las-principales-ciberamenazas
18. AEPD Laboratorio — Guía práctica del CCN-CERT para hacer frente a la IA ofensiva (BP/36) — https://laboratorio.aepd.es/novedades/guia-practica-del-ccn-cert-para-hacer-frente-la-ia-ofensiva

**Solo por resultados de búsqueda [V-sec] (releer antes de citar):**
- CCN-CERT BP/36 (PDF; la descarga devolvió HTML) — https://www.ccn-cert.cni.es/es/informes/informes-de-buenas-practicas-bp/7469-ccn-cert-bp-36-buenas-practicas-ia-ofensiva/file.html
- CCN-CERT BP/30 Aproximación a la IA y la ciberseguridad — https://www.ccn-cert.cni.es/es/seguridad-al-dia/novedades-ccn-cert/12852-nuevo-informe-de-buenas-practicas-bp-30-sobre-aproximacion-a-la-inteligencia-artificial-y-la-ciberseguridad.html
- La Moncloa — Estrategia de IA del SNS (nov-2025) — https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/sanidad14/paginas/2025/121125-consejo-interterritorial-estrategia-ia.aspx
- La Moncloa — AESIA — https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/transformacion-digital-y-funcion-publica/paginas/2024/190624-escriva-aesia-ia.aspx
- Bloomberg — Samsung prohíbe la IA generativa (2-05-2023) — https://www.bloomberg.com/news/articles/2023-05-02/samsung-prohibe-a-personal-usar-ia-tras-fuga-de-datos-en-chatgpt
- McCarthy Tétrault — Moffatt v. Air Canada — https://www.mccarthy.ca/en/insights/blogs/techlex/moffatt-v-air-canada-misrepresentation-ai-chatbot
- INCIBE (otros casos, sin leer): https://www.incibe.es/linea-de-ayuda-en-ciberseguridad/casos-reales/suplantacion-del-ceo-utilizando-la-tecnica-de-inteligencia-artificial-deepvoice · https://www.incibe.es/incibe/blog/intento-de-desvio-de-pagos-mediante-la-clonacion-de-voz-con-ia-de-un-empresario (esta devolvió 404 al leerla)

**Kit local de INCIBE:** se buscó «deepfake», «inteligencia artificial» y «clonaci» en `Downloads\kit_concienciacion\...\RecursosFormativos` sin resultados en texto plano (los módulos pueden ser PDF/PPT no indexables por la búsqueda); no se profundizó.

**Pendiente de verificar antes de publicar:** texto consolidado del art. 4 tras el Ómnibus; cifra ENISA «80 % con IA»; PDF de CCN-CERT BP/36; duración y contenido de los vídeos; fecha exacta de la Estrategia de IA del SNS; textos de AESIA sobre alfabetización (no hay guía oficial leída).
