# Curso 1 · Fundamentos: por qué importa la ciberseguridad en una residencia

Documento de fuentes y material didáctico (investigación de octubre de 2026). Pensado para convertirse en pantallas de un SCORM de ~1 h 40 min, a hacer en móvil, para personal sin conocimientos digitales de residencias y centros sociosanitarios.

**Convención de fiabilidad** usada en todo el documento:
- **[L]** = leído por mí directamente en la fuente (página web, PDF o informe descargado).
- **[S]** = dato obtenido solo de fuente secundaria (prensa, blog, Wikipedia, resumen de búsqueda). Hay que contrastarlo con la fuente primaria antes de publicarlo tal cual.
- **[NC]** = no confirmado. Se dice expresamente cuando algo no se ha podido verificar.

---

## 1. Resumen ejecutivo

1. **Qué se protege.** En una residencia no solo hay «ordenadores»: hay datos de salud y vida privada de personas mayores (historia clínica, medicación, fotos, estado de ánimo, familia), la **continuidad del cuidado** (turnos, pautas, medicación, citas), el **dinero** (cuentas, nóminas, facturas, transferencias) y la **reputación/confianza** de familias y administración. La información está en papel, en digital y en la cabeza de las personas (kit INCIBE 01, pág. 4, 8 [L]).
2. **Tres propiedades.** Disponibilidad (que esté cuando hace falta), integridad (que no se altere) y confidencialidad (que solo la vea quien debe). Se explican con ejemplos de residencia en la lección 2 (kit INCIBE 01, págs. 7-9 [L]).
3. **Amenazas actuales.** Según INCIBE, en 2025 se gestionaron **122.223 incidentes** (+26 % que en 2024), de los que 25.133 fueron phishing, 55.411 malware y 392 ransomware [L]. Según ENISA, el **phishing es la puerta de entrada en ~60 % de los casos** y el ransomware es la amenaza de mayor impacto [L]. En el sector salud europeo, el ransomware fue el 54 % de las amenazas analizadas en el informe de ENISA de 2023 [L].
4. **El factor humano es central.** El caso del servicio de salud irlandés (HSE, 2021) lo demuestra con el informe oficial en la mano: **un correo con un Excel abierto por una persona** el 18-mar-2021 acabó, ocho semanas después, cifrando el 80 % de sus sistemas y obligando a trabajar con papel y bolígrafo durante meses [L]. También hay errores no maliciosos (enviar un correo al destinatario equivocado, borrar un archivo) y amenazas internas (acceso curioso a historias clínicas, que la AEPD advierte que puede ser delito) [L].
5. **Casos reales.** Hay casos documentados en hospitales de España (Hospital Clínic, 2023; Consorci Sanitari Integral, 2022; Torrejón, 2020) y de Europa (HSE Irlanda 2021, Synnovis/NHS 2024, Advanced/NHS 111 2022, Vastaamo Finlandia 2020, AZ Monica Bélgica 2026). **No he encontrado ningún ataque con filtración de datos a una residencia de mayores en España confirmado en fuente fiable** (solo un «incidente informático» de DomusVi en nov-2022, que la propia empresa dijo que no afectó a datos personales [S]). No se debe inventar uno: el curso debe decir con honestidad que los casos conocidos son sanitarios y que una residencia tiene los mismos puntos débiles.
6. **Qué hacer ante un incidente.** Parar, no tocar más, **avisar al responsable del centro** (que decide notificaciones), no pagar rescates, llamar al **017 de INCIBE** (gratuito, confidencial, 8:00-23:00, 365 días) y, si hay datos personales, el responsable del tratamiento debe valorar notificar a la **AEPD en un máximo de 72 horas** desde que tiene constancia (guía AEPD de brechas [L]). Las denuncias de delitos van a Policía Nacional / Guardia Civil.
7. **Higiene digital básica** (kit INCIBE «Decálogo» [L]): bloquear la pantalla al irse, no pinchar enlaces sospechosos, contraseñas únicas y secretas, no instalar apps no autorizadas, destruir el papel con datos, no usar equipos personales para tareas del centro, avisar ante cualquier cosa rara.
8. **Material gratuito reutilizable**: 12 «consejos» y 3 pósteres PNG del kit INCIBE (apartado 6), 6 vídeos verificados (apartado 5).

---

## 2. Contenido didáctico (lecciones listas para pantallas)

Reparto orientativo de tiempos: **L1 10 min · L2 12 · L3 15 · L4 12 · L5 10 · L6 13 · L7 10 · L8 8 · cierre y test 10 = 100 min.**

Pie de estilo: frases cortas, segunda persona del singular, ejemplos de planta. Cada «Pantalla» es una propuesta de unidad del editor.

### L1. ¿Qué tenemos que proteger en una residencia? (10 min)

**Idea clave:** «Proteger la información es proteger a las personas que cuidamos».

**Pantalla 1.1 – Historia de apertura (escenario).** Turno de noche, la tablet de planta no abre las pautas de medicación. Hay que apuntar todo a mano y llamar a la enfermera de guardia. «¿Qué ha pasado? ¿Y si no vuelve en toda la noche?»

**Pantalla 1.2 – Los cuatro tesoros.** (actividad: tarjetas con ejemplos)
- **Datos de salud y de la vida de las personas residentes**: diagnósticos, medicación, caídas, informes, fotos, situación familiar y económica, DNI, tarjeta sanitaria. Son datos que la persona no ha elegido compartir con el mundo.
- **Continuidad del cuidado**: pautas, horarios, alergias, cambios posturales, citas médicas, contacto de familias. Si el sistema cae, el riesgo es clínico, no solo informático.
- **Dinero**: nóminas, facturas, cuentas del centro, pagos de familias, fondos de residentes si los gestiona el centro.
- **Reputación y confianza**: las familias dejan a su ser querido contigo. Una filtración rompe esa confianza.

Apoyo del kit: la información como «activo», con partes **tangibles** (ordenadores, móviles, discos) e **intangibles** (reputación, conocimiento del personal) – kit 01, págs. 3-4; diapositivas 3-7 [L]. Imagen PNG `0101_Información` («Los datos son el pilar de tu empresa, protégelos»).

**Pantalla 1.3 – Dónde vive la información.** Papel (carpetas de planta, libro de incidencias, hojas de medicación impresas), digital (software de gestión, correo, WhatsApp, fotos del móvil, USB) y **en las personas** (lo que sabes de cada residente). «La información confidencial se protege igual en cualquier formato; incluso si se ha comentado de palabra» (tríptico INCIBE «La información» [L]).

**Pantalla 1.4 – Por qué a una residencia.** Mensajes (con fuente): los datos de salud valen dinero en el mercado ilegal (INCIBE-CERT cita que un expediente médico se paga entre 30 y 1.000 USD, blog de 25-ene-2024 [L]); los sistemas son heterogéneos y a veces antiguos («legacy»); y la interrupción del servicio presiona a pagar. Importante: **los criminales no «eligen» a una residencia concreta por quiénes son; atacan a quien tenga la puerta abierta**. [Matiz: esta frase es redacción didáctica, no cita.]

---

### L2. Qué tipos de información hay y cómo se clasifica (12 min)

**Idea clave:** «No toda la información pide la misma protección, pero hay que saber cuál es cuál».

**Pantalla 2.1 – Los tres pilares con ejemplos de residencia.**
- **Disponibilidad**: poder abrir la pauta de medicación cuando hace falta. Falla con ransomware o con un error de configuración (kit 01, pág. 7 [L]).
- **Integridad**: que la pauta no haya sido cambiada (por error o a propósito) y que el informe diga lo que dijo el médico. Falla con alteraciones o borrados parciales (kit 01, pág. 7 [L]).
- **Confidencialidad**: que solo vea la historia de la Sra. Carmen quien la cuida. Falla con acceso curioso, correo mal enviado, papeles a la vista (kit 01, pág. 8 [L]).
  Actividad: «¿Qué pilar se rompe?» (ver apartado 7).

**Pantalla 2.2 – Tipos de información (propuesta adaptada de los cuatro niveles del kit 02, pág. 4 [L]).** El kit propone, como ejemplo orientativo, confidencial / restringida / uso interno / pública. Adaptación didáctica para residencia (**propuesta de diseño, no texto del INCIBE**):

| Nivel (kit INCIBE) | Ejemplos en una residencia |
|---|---|
| Restringida / especialmente protegida | Historia clínica, diagnósticos, medicación, informes de psicología/salud mental, fotos de heridas o de aseo, datos de familiares en conflicto, incapacitaciones, datos de salud en general |
| Confidencial | Nóminas, contratos, cuentas bancarias del centro, expedientes disciplinarios, contraseñas |
| Uso interno | Cuadrantes, protocolos internos, planificación de actividades, listados de habitaciones sin datos de salud |
| Pública | Web del centro, menú semanal, folleto de precios autorizado |

Nota de rigor: el kit solo da los cuatro nombres de nivel y un ejemplo con ficheros ([confidencial]Proyectos_2020.docx, [restringido]nóminas_2018.xlsx, [interno]Cuadrantes_mes.xlsx, [publico]…). Que los «datos de salud» sean categoría especial de datos personales con protección reforzada es norma general del RGPD, pero **no lo he leído literalmente en las fuentes de esta investigación**: confirmarlo en la guía AEPD para el sector sanitario antes de afirmarlo en el curso.

**Pantalla 2.3 – Qué es un dato personal.** «Cualquier información sobre una persona identificada o identificable» (kit 01, pág. 10 [L]). El DNI, una foto o hasta la estatura de alguien lo son si se puede saber de quién es. Un nombre en una pizarra de planta también.

**Pantalla 2.4 – Quién puede ver qué (need-to-know).** El kit lo llama «política need-to-know»: cada persona accede solo a lo que necesita para su trabajo (kit 02, pág. 5; tríptico «La información» [L]). Ejemplo: el personal de mantenimiento no necesita la historia clínica; administración no necesita el informe de psicología.

**Pantalla 2.5 – Papel y metadatos (dos pequeños peligros).** Papel con datos: destructora, no papelera (imagen `0302_Información`; kit 03, págs. 11-12 [L]). Metadatos: los archivos esconden quién los creó, cuándo y a veces dónde se hizo la foto (kit 02, págs. 7-8 [L]); antes de enviar un documento o foto fuera, conviene quitarlos (imagen `0202_Información`). Mantener sencillo: «una foto del móvil puede llevar guardada la ubicación».

---

### L3. Las amenazas de hoy, sin tecnicismos (15 min)

**Idea clave:** «Casi todo empieza con una persona que hace clic, contesta una llamada o se descuida».

Para cada amenaza: «Qué es» + «Cómo se ve en tu día a día» + «Qué hacer».

| Amenaza | Explicación llana (fuente) | Escena de residencia | Reflejo correcto |
|---|---|---|---|
| **Malware / virus** | Programa dañino que roba información o toma control del equipo (kit 01, pág. 6 [L]). | Un USB que alguien trae «con fotos de la fiesta» al ordenador de recepción. | No conectar USB ajenos. Avisar. |
| **Ransomware** («secuestro de datos») | Impide acceder a los archivos, generalmente cifrándolos, y pide un rescate (INCIBE empresas [L]). En 2025: 392 incidentes gestionados por INCIBE [L]. La AEPD advierte que a menudo además roban datos y extorsionan a los afectados (guía AEPD sanitaria, pág. 13 [L]). | El programa de gestión no abre y aparece un mensaje pidiendo dinero. | No apagar a lo bruto ni «probar cosas»: desconectar el cable/wifi si te lo indican, avisar ya. Nunca pagar por tu cuenta (INCIBE: «en ningún caso el pago del rescate es una opción aconsejada» [L]). |
| **Phishing** | Suplantación de una empresa/persona de confianza por correo para sacar datos (INCIBE Balance [L]); ENISA 2025: ~60 % de las intrusiones [L]. | Correo «de Correos, del banco o de Recursos Humanos» con un enlace. | No pinchar; mirar remitente; preguntar por otra vía. |
| **Smishing / vishing** | Lo mismo por SMS o por llamada (tríptico INCIBE Phishing [L]). | «Soy del soporte técnico, necesito que me dé la clave para arreglar su tablet.» | Colgar. El soporte real no pide contraseñas. Llamar tú al número que conoces. |
| **Ingeniería social** | Engañar a personas, no a máquinas (vídeo OSI). | Alguien con chaleco dice que viene «de mantenimiento informático» y pide que le abras el despacho. | Pedir identificación, confirmar con la dirección. |
| **Fraude del CEO / cambio de cuenta bancaria** | Alguien que se hace pasar por el director para pedir una transferencia urgente (Guardia Civil, vídeo; INCIBE 017: 9 % de las consultas de empresas son «fraude CEO», 12 % phishing y 18 % suplantación [L]). | «Soy el director, haz una transferencia hoy, no se lo cuentes a nadie.» | Verificar por teléfono conocido; la urgencia + secreto es la señal. |
| **Robo o pérdida de dispositivos** | Móvil/tablet/portátil/USB robado o perdido con datos dentro (tríptico «Decálogo»: cifrar y proteger los dispositivos [L]). | Móvil personal con fotos de residentes olvidado en el vestuario. | Bloqueo con clave; no guardar fotos de residentes en el móvil personal; avisar si se pierde. |
| **Errores humanos** | Sucesos no intencionados: borrar un archivo, enviar un correo al destinatario equivocado, una avería (kit 01, pág. 6 [L]). La AEPD lo cita como brecha frecuente: «envío de documentación con datos de salud a destinatarios incorrectos» (guía sanitaria, pág. 12 [L]). | Mandar el informe de la Sra. X a la familia de otro residente. | Releer destinatario, copia oculta para varios (imagen `0401_Fraudes`). |
| **Amenazas internas (insiders)** | Empleados que, por motivos propios o sobornados, se llevan información, causan infecciones o facilitan el acceso a terceros (kit 01, pág. 6 [L]). Acceso indebido a historias clínicas: la AEPD constata brechas por este motivo y recuerda que puede ser delito (pena de hasta cinco años según los casos), sanción disciplinaria, indemnización e incluso inhabilitación (guía sanitaria, págs. 12-13 [L]). | Mirar «por curiosidad» la historia de una persona conocida o de un famoso del pueblo. | Se accede solo si es necesario para tu trabajo con esa persona. |

**Pantalla 3.x – Cifras que ponen en contexto** (ver apartado 3 para fuentes completas): INCIBE 2025; ENISA salud 2023; AEPD (en el sector asistencial, 15 % de las notificaciones de brechas del segundo semestre de 2021 y al menos una brecha al mes con más de 200.000 personas afectadas [L]).

**Mensaje de cierre de L3:** «Los atacantes no suelen forzar la cerradura: te piden la llave con una excusa convincente».

---

### L4. Casos reales: cuando pasa de verdad (12 min)

**Idea clave:** «No es ciencia ficción: le ha pasado a hospitales y servicios de salud de nuestro entorno».

Presentar 4-5 casos en tarjetas de «Qué pasó · Cómo empezó · Qué consecuencias tuvo · Qué habría ayudado» (detalle y fuentes en apartado 4). Selección recomendada:
1. **Hospital Clínic de Barcelona (5-mar-2023)** – urgencias, laboratorio y farmacia a mano; datos filtrados.
2. **HSE Irlanda (14-may-2021)** – empezó con un correo y un Excel; el informe oficial lo cuenta paso a paso. Es **el caso ideal para el «factor humano»**.
3. **Synnovis / NHS Londres (3-jun-2024)** – un proveedor de análisis cae y se cancelan miles de citas; un fallecimiento vinculado oficialmente.
4. **Vastaamo (Finlandia, 2020)** – datos de psicoterapia robados y extorsión a pacientes individuales (por qué es tan grave filtrar datos de salud).
5. **Advanced / NHS 111 (UK, 2022)** – un proveedor de software sin doble verificación; multa de 3,07 M£ en 2025.

Cierre honesto: «De residencias españolas con filtración de datos no tenemos casos públicos verificados; sí hay hospitales y centros de salud. Lo que protege a un hospital protege a una residencia».

---

### L5. Impacto en el cuidado de las personas mayores (10 min)

**Idea clave:** «Un ataque informático es también un problema de cuidados».

Mensajes basados en hechos de los casos:
- **Se trabaja a mano**: Clínic (urgencias, laboratorio y farmacia con procedimientos manuales [L]); HSE (papel y bolígrafo [L]). En una residencia: pautas de medicación, alergias, cambios posturales, dietas especiales, protocolo de caídas.
- **Retrasos y errores**: Synnovis: el fallo de un laboratorio tuvo como consecuencia citas y operaciones canceladas y, según el hospital King's, un fallecimiento en el que el ciberataque fue «factor contribuyente» [S, vía HIPAA Journal]. Idea para residencia: sin acceso a analíticas o pautas, el riesgo es clínico.
- **Daño a las personas** si los datos salen: Vastaamo (extorsión directa a unas 22.000 personas [S]); una persona mayor con demencia puede ser más fácil de engañar usando datos de su historial.
- **Recuperación lenta**: HSE >4 meses de recuperación [L]; Clínic: a los 5 días, 40 % de la actividad quirúrgica y 70 % de las consultas externas (INCIBE-CERT [L]).

**Pantalla 5.x – Actividad «Sin sistema, ¿qué haría?»** Plan B en papel: cada planta debe saber dónde está la hoja de medicación en papel, el listado de teléfonos de emergencia y familias, y a quién llamar. (Es una buena práctica general; no está citada literalmente en una fuente concreta de esta investigación.)

---

### L6. El factor humano y la higiene digital (13 min)

**Idea clave:** «Tú eres la mejor defensa… y el objetivo preferido».

**Pantalla 6.1 – Por qué se engaña a las personas.** Urgencia, miedo, autoridad, curiosidad, ayuda/amabilidad. «Si es demasiado bueno para ser cierto, no lo es» (tríptico Phishing [L]). Prisa + secreto + petición de datos o dinero = parar.

**Pantalla 6.2 – Hábitos mínimos (la «lista de la planta»)**, tomados del Decálogo y los trípticos del kit [L]:
1. **Bloquea la pantalla** cuando te levantes (tecla Windows+L en ordenador; imagen `0601_PuestoTrabajo`).
2. **No pinches** en enlaces sospechosos; escribe la dirección tú (imagen `0402_Fraudes`).
3. **Tu contraseña es personal**: secreta, única, no anotada ni compartida (imágenes `0501`/`0502_Contraseñas`). Tentación típica: «la clave de la tablet de planta que sabemos todas». Explicar el riesgo y que lo correcto es acceso individual (propuesta didáctica; lo que dice la fuente es «secretas y únicas, no debemos anotarlas, compartirlas o reutilizarlas»).
4. **No instales apps** ni modifiques la configuración de los móviles del centro; nada de software pirata (imagen `0702_PuestoTrabajo`).
5. **Actualiza**: los parches cierran puertas (imagen `0602_PuestoTrabajo`); no ignores los avisos de antivirus (imagen `0701_PuestoTrabajo`).
6. **Móvil con bloqueo** y desconfianza de wifis abiertas (imágenes `0801`/`0802_Móviles`).
7. **No uses equipos personales** para datos del centro; si accedes al correo desde casa, no descargues ficheros (Decálogo).
8. **Destruye el papel** con datos; mesa «limpia» (Decálogo; imagen `0302_Información`).
9. **No hables de residentes en sitios donde puedan oírte** (Decálogo: «No mantengamos conversaciones confidenciales en lugares donde puedan ser oídas por terceros»).
10. **Avisa** ante cualquier actividad sospechosa: «Todos somos seguridad» (Decálogo).

**Pantalla 6.3 – WhatsApp y fotos (tema muy real en residencias).** Lo que dice la AEPD: se puede avisar al paciente por mensajería (por ejemplo para una cita) siempre que el mensaje llegue solo a la persona y no a un grupo en el que el paciente esté (guía AEPD sanitaria, sección sobre comunicación con pacientes; no anoté la página [L]). Para fotos de residentes en móviles personales, **no he localizado una norma específica leída en esta investigación**: el curso debe remitir al protocolo del centro y al responsable de protección de datos [NC].

**Pantalla 6.4 – Copias de seguridad en lenguaje llano.** Idea de «3-2-1»: 3 copias, 2 soportes distintos, 1 fuera del centro (kit 03, pág. 10; diap. 17 [L]). Mensaje para el personal: «No te toca a ti hacer las copias, pero sí no guardar datos importantes solo en tu móvil o en el escritorio del ordenador». Un backup que nunca se ha probado puede no servir (diap. 5 del kit 03: «no solo hay que hacerlas, hay que comprobar que podemos recuperarlas» [L]).

---

### L7. Qué hacer ante un incidente y a quién avisar (10 min)

**Idea clave:** «Detecta, para, avisa. Cuanto antes se avise, menos daño».

**Pantalla 7.1 – Señales de que algo va mal.** Archivos que no abren o con extensiones raras; mensaje pidiendo dinero; el ordenador va lentísimo o hace cosas solo; te pidieron la clave y se la diste; has enviado datos a quien no era; has perdido un móvil/USB/papeles con datos; has visto a alguien curioseando historias.

**Pantalla 7.2 – Los cuatro reflejos (propuesta didáctica coherente con las fuentes):**
1. **No sigas** (no pagues, no contestes, no borres «para disimular», no formatees).
2. **Haz una captura o anota** lo que ves (hora, mensaje, remitente) si es seguro hacerlo. INCIBE pide evidencias: descripción, captura o URL (INCIBE reporte de fraude [L]).
3. **Avisa a tu responsable inmediato / responsable del centro o quien esté designado como responsable de seguridad/protección de datos.** Tú no decides las notificaciones externas.
4. **Si es un fraude de dinero**: llamar al banco cuanto antes para frenar la transferencia (INCIBE [S, vía resumen de búsqueda]; confirmar en la página de INCIBE «Qué hacer si eres víctima de un fraude»).

**Pantalla 7.3 – ¿A quién avisa el centro? (mapa de contactos)**

| Quién | Para qué | Cómo (verificado) |
|---|---|---|
| **Responsable del centro / de seguridad / protección de datos** | Siempre el primero. Decide y notifica. | Teléfono/ extensión del centro (rellenar con los datos reales). |
| **INCIBE – Línea de Ayuda en Ciberseguridad 017** | Dudas y ayuda técnica, psicosocial y legal ante un incidente. Gratuita y confidencial. Empresas y ciudadanía. | **017**; WhatsApp **900 116 117**; Telegram **@INCIBE017**; **8:00-23:00, todos los días del año**; no se graban las llamadas ni se piden datos personales [L, incibe.es/linea-de-ayuda-en-ciberseguridad]. |
| **INCIBE-CERT** (respuesta a incidentes) | Reportar fraude/phishing/ransomware con evidencias. | **incidencias@incibe-cert.es** o formulario web; para ransomware: nota de rescate y dos ficheros cifrados (<1 MB, no personales) [L, incibe.es/ciudadania/ayuda/reporte-de-fraude]. |
| **AEPD (Agencia Española de Protección de Datos)** | Si el incidente afecta a **datos personales** (brecha). Notifica el **responsable del tratamiento**, no cada trabajador. Plazo: **sin dilación y como máximo 72 horas desde que tiene constancia**, contando fines de semana y festivos; si hay alto riesgo para las personas, también hay que comunicárselo a las personas afectadas (guía AEPD de brechas, ver 3.A [L]). El plazo de 72 h puede cumplirse con una notificación inicial y completar después. Algunas comunidades tienen autoridad propia (ej. la catalana APDCAT, a la que notificó el Clínic [L]). |
| **Policía Nacional (BCIT/BIT) / Guardia Civil (GDT)** | Denuncia de delito (estafa, extorsión, acceso ilegal). | Comisaría/cuartel, o web oficial de cada cuerpo. La Guardia Civil indica que los delitos «relacionados con nuevas tecnologías» no se presentan por el trámite de denuncia electrónica general sino a través de su unidad de delitos telemáticos [S, resumen de búsqueda de web.guardiacivil.es]. |
| **Banco** | Fraude con transferencias o tarjetas. | Teléfono de la entidad. |

**Mensaje clave del 017 y la OSI:** la Oficina de Seguridad del Internauta (OSI) fue el servicio de INCIBE para ciudadanía; la web osi.es **redirige ahora a incibe.es/ciudadania** (comprobado en octubre de 2026 [L]); sus vídeos siguen en YouTube.

**Aviso de rigor:** el kit INCIBE (tríptico y guías) menciona «departamento de informática» o «departamento de seguridad». Una residencia pequeña puede no tenerlo: el curso debe pedir al centro que defina **quién es la persona de contacto** antes de lanzar el curso.

---

### L8. Mapa de roles: qué riesgos son típicos de cada puesto (8 min)

Propuesta didáctica a partir de las amenazas verificadas (no es una cita de una fuente concreta; cada riesgo se apoya en el apartado indicado).

| Puesto | Riesgos típicos | Hábito clave |
|---|---|---|
| **Gerocultor/a, auxiliar** | Tablet o móvil de planta compartido; claves compartidas; fotos de residentes en móvil personal; hablar de residentes en pasillos; vishing («soporte técnico»); USB o móvil ajeno. | Sesión personal, bloquear, no compartir clave, no fotos en móvil personal, avisar. |
| **Enfermería** | Acceso a historias clínicas y medicación: confidencialidad e integridad (alteración de pautas); acceso indebido (AEPD); correos con informes a destinatarios equivocados; dependencia de sistemas para medicar. | Solo accede a lo que necesitas; revisa destinatarios; plan B en papel. |
| **Administración / recepción** | Phishing con adjuntos (facturas falsas); fraude del CEO y cambio de cuenta bancaria; visitas que piden datos; papel con datos; metadatos al enviar documentos. | Verifica pagos por otra vía; no abras adjuntos inesperados; destructora. |
| **Dirección / supervisión** | Decide notificaciones (AEPD 72 h); objetivo del fraude del CEO y de phishing dirigido; responsable de planes de respaldo y contactos; accesos con muchos privilegios. | Tener definido el protocolo y los contactos; no usar una única cuenta para todo. |
| **Mantenimiento** | Acceso físico a salas de equipos y cableado; instalación de dispositivos (cámaras, wifi, domótica, equipos «inteligentes»); proveedores externos. INCIBE: 85 % de los sistemas infectados que forman botnets están relacionados con dispositivos inteligentes IoT (televisores, decodificadores, reproductores) [L, Balance 2025]. | No conectar nada a la red del centro sin autorización; cambiar claves por defecto. |
| **Personal de cocina, limpieza, voluntariado** (si aplica) | Móviles personales, tablets compartidas, papel olvidado; ingeniería social presencial. | Aplicar las reglas básicas y avisar de lo raro. |

---

## 3. Datos y estadísticas citados

Todas las cifras están marcadas **[L]** o **[S]** según se explica al inicio.

### A. Fuentes oficiales leídas (fiables)

| Dato | Fuente | Fecha | Enlace |
|---|---|---|---|
| **122.223 incidentes** gestionados por INCIBE en 2025 (+26 % vs. 2024); 25.133 phishing; 45.445 fraude online («4 de cada 10 incidentes»); 55.411 malware; **392 ransomware**; 3.849 robos de información; 237.028 sistemas vulnerables; 85 % de sistemas infectados que forman botnets son dispositivos IoT. Línea de Ayuda: **142.767 consultas** (+45 %); 28 % de usuarios que consultaron recibieron algún intento de phishing/vishing/smishing. Consultas de empresas: 18 % suplantación por imitación, 12 % phishing, 9 % fraude CEO. [L] | INCIBE, *Balance de ciberseguridad 2025* (datos consolidados a 09/02/2026) | feb-2026 | https://www.incibe.es/sites/default/files/2026-02/Balance%20de%20ciberseguridad%202025%20INCIBE/BalanceCiberseguridad2025_INCIBE.pdf |
| **215 incidentes públicos** analizados en el sector salud de la UE y países vecinos; **54 % ransomware**; solo **27 %** de las organizaciones tiene un programa específico contra ransomware; **46 %** de los incidentes buscaban robar/filtrar datos; hospitales 42 %; datos de pacientes/historias electrónicas = activo más atacado (30 %); consecuencias: brechas/robo de datos 43 %, interrupción de servicios sanitarios 22 %; coste mediano de un incidente grave: 300.000 €. [L] | ENISA, *Threat Landscape: Health Sector* (ene-2021 a mar-2023) | 5-jul-2023 | https://www.enisa.europa.eu/news/checking-up-on-health-ransomware-accounts-for-54-of-cybersecurity-threats |
| **Phishing ≈ 60 %** de las intrusiones iniciales (incluye malspam, vishing y malvertising); explotación de vulnerabilidades 21,3 %; el ransomware sigue siendo la amenaza de mayor impacto. En el reparto por sectores del informe, salud aparece con el 1,2 % de los incidentes registrados (los datos de ENISA son los reportados públicamente, no el total real). [L] | ENISA, *Threat Landscape 2025* (booklet, págs. 3-4) | oct-2025 | https://www.enisa.europa.eu/sites/default/files/2025-10/ENISA%20Threat%20Landscape%202025%20Booklet.pdf |
| Sector sanitario: ransomware 54 %, robo de datos 46 %; el expediente médico se vende entre 30 y 1.000 USD; sistemas «legacy» conviven con nuevos; recomendaciones: concienciación, plan de continuidad, auditorías. [L] (INCIBE-CERT cita datos de ENISA de jun-2022 a jul-2023: salud 8 % de incidentes.) | INCIBE-CERT, blog «Ciberseguridad en el sector sanitario» | 25-ene-2024 | https://www.incibe.es/en/incibe-cert/blog/cibersecurity-healthcare-sector-features-threats-and-recommendations |
| **15 %** de las notificaciones de brechas recibidas por la AEPD (2.º semestre de 2021) las hicieron responsables del ámbito asistencial en salud; en el sector, **al menos una brecha al mes afecta a más de 200.000 personas**; riesgos emergentes: ransomware y acceso indebido interno a historias clínicas. [L] | AEPD, «Brechas de datos personales en el sector de la salud» | (sin fecha visible) | https://www.aepd.es/areas-de-actuacion/salud/brechas-de-datos-personales-en-el-sector-de-la-salud |
| Plazo: notificar a la autoridad **sin dilación y a más tardar 72 h** desde que se tiene constancia, **incluyendo fines de semana y festivos**; el criterio para notificar es el riesgo para los derechos y libertades de las personas; el RGPD no obliga a notificar si es improbable que haya riesgo; denuncias de terceros: formulario de reclamaciones. [L] | AEPD, *Guía para la notificación de brechas de datos personales* (v. junio 2021) | jun-2021 | https://www.aepd.es/guias/guia-brechas-seguridad.pdf |
| Acceso indebido a la historia clínica: puede ser delito de descubrimiento y revelación de secretos (hasta cinco años de prisión según los casos), sanción administrativa/disciplinaria, indemnización civil e inhabilitación profesional; el simple acceso injustificado ya puede acarrear consecuencias; ransomware «capaz de paralizar por completo la actividad». [L] | AEPD, *Guía para profesionales del sector sanitario* (publicada jun-2022; última revisión oct-2024), págs. 12-13 | oct-2024 | https://www.aepd.es/documento/guia-profesionales-sector-sanitario.pdf |
| Estrategia de Ciberseguridad del Sistema Nacional de Salud 2025-2028, aprobada en el Consejo Interterritorial el **12 de noviembre de 2025**; 12 ejes y 8 objetivos; menciona malware, intrusiones, robo de datos y ransomware como ataques más frecuentes en 2024. [L] | Ministerio de Sanidad, nota de prensa | 12-nov-2025 | https://www.sanidad.gob.es/gabinete/notasPrensa.do?id=6789 |
| Línea 017: gratuita, confidencial, WhatsApp 900 116 117, Telegram @INCIBE017, 8:00-23:00, 365 días; sin grabación de llamadas ni petición de datos personales. [L] | INCIBE | consultada oct-2026 | https://www.incibe.es/linea-de-ayuda-en-ciberseguridad |
| Reportar fraude: incidencias@incibe-cert.es o formulario; requisitos de ransomware (nota de rescate + dos ficheros cifrados <1 MB no personales). [L] | INCIBE-CERT | consultada oct-2026 | https://www.incibe.es/ciudadania/ayuda/reporte-de-fraude |
| Ransomware: vías de infección (correo con adjunto, RDP, servicios expuestos, vulnerabilidades, dispositivos externos); pasos: herramientas de descifrado (nomoreransom.org), restaurar copias, conservar los ficheros cifrados; **no pagar**. [L] | INCIBE empresas | consultada oct-2026 | https://www.incibe.es/empresas/blog/el-ransomware-y-recupero-mi-informacion |

### B. Datos de fuente secundaria (usar con cautela)

| Dato | Fuente | Estado |
|---|---|---|
| El CCN-CERT señala (informe *Ciberamenazas y Tendencias 2025*, IA-04/25) que sanidad y manufactura fueron los sectores más atacados a nivel mundial en 2024. | Resumen de búsqueda sobre el informe del CCN-CERT (https://www.ccn-cert.cni.es) | **[S]/[NC]**: no leí el informe; no usar sin comprobar. |
| El sector sanitario habría recibido ~2.400 ciberataques semanales por organización (+17 %) en 2026. | Notas de prensa/blogs comerciales | **[NC]**: fuente comercial, no oficial. No usar. |
| «Más de 300.000 ciberdelitos en España en 2021». | Gestión y Dependencia (cita a INCIBE) | **[S]**: no usar; mejor emplear el Balance INCIBE 2025 [L]. |

**Lo que no he podido confirmar:** estadística oficial específica de **residencias** o centros sociosanitarios españoles (número de ataques, tipos). No existe en las fuentes consultadas; no se debe afirmar una cifra.

---

## 4. Casos reales (con fecha, fuente y enlace)

### España

**4.1 Hospital Clínic de Barcelona – ransomware (5 de marzo de 2023)**
- Ataque de ransomware que afectó a urgencias, laboratorio y farmacia, obligando a trabajar con procedimientos manuales. Los atacantes pidieron 4,5 millones de dólares; el Govern dijo que no pagaría. A 10 de marzo se había recuperado el 40 % de la actividad quirúrgica y el 70 % de las consultas externas [L, INCIBE-CERT].
- El Clínic y la FRCB-IDIBAPS comunicaron el ataque a la autoridad catalana de protección de datos (APDCAT) el 17 de marzo de 2023 y colaboraron con la Agencia de Ciberseguridad de Cataluña y los Mossos d'Esquadra [L].
- Otros detalles (grupo Ransom House, ~4,5 TB, cifras de cirugías suspendidas) vienen de prensa y blogs [S]; contrastar con las notas oficiales del Clínic antes de usar.
- Fuentes: https://www.incibe.es/en/incibe-cert/publicaciones/bitacora-de-seguridad/ciberataque-ransomware-paraliza-actividad-del-hospital · https://www.clinicbarcelona.org/en/news/computer-attack-on-the-frcb-idibaps

**4.2 Consorci Sanitari Integral (Cataluña) – ransomware (7-10 de octubre de 2022)** [S]
- Hospital Dos de Maig, Moisès Broggi (Sant Joan Despí), Hospital General de l'Hospitalet y ocho ambulatorios con sistemas inoperativos unos tres días; solo se atendían urgencias, sin acceso a historiales ni a la agenda. Era el segundo incidente del CSI en dos años (septiembre de 2020, Moisès Broggi).
- Fuente: https://bitlifemedia.com/2022/10/ciberataque-ransomware-hospitales-cataluna/ (secundaria; buscar nota de la Agencia de Ciberseguridad de Cataluña).

**4.3 Hospital Universitario de Torrejón (Madrid) – ransomware (17 de enero de 2020)** [S]
- Sistemas inutilizados; sin acceso a historias electrónicas, trabajaron con papel y bolígrafo. Presentado como primer ransomware confirmado contra un hospital español. Fuente: blog de PSN Sercon (21-ene-2020) que cita a El Mundo: https://blog.psnsercon.com/el-hospital-de-torrejon-sufre-el-primer-caso-de-ransomware-a-un-hospital-en-espana/

**4.4 DomusVi (grupo de residencias) – «incidente informático» (finales de noviembre de 2022)** [S]
- La empresa lo reconoció, de «afectación muy limitada», y afirmó que no se habían vulnerado datos personales de clientes, empleados ni proveedores. Es el único caso relacionado con residencias que encontré y **no hay datos de impacto ni detalles técnicos**. Fuente: https://gestionydependencia.com/noticia/4662/innovacion/alerta.-las-residencias-de-mayores-no-estan-exentas-de-un-ciberataque.html (31-dic-2022). Usar solo como «ejemplo reconocido de incidente», nunca como «ataque con filtración».

### Europa

**4.5 HSE (Servicio de Salud de Irlanda) – ransomware Conti (14 de mayo de 2021)** [L, informe oficial]
- Informe independiente encargado por la Junta del HSE (3-dic-2021). Cadena: el **16-mar-2021** llegó un correo de phishing con un Excel adjunto; el **18-mar-2021** una persona abrió el archivo y se infectó ese equipo («Patient Zero»); el atacante estuvo **ocho semanas** en la red; el 14-may-2021 detonó el ransomware. Según la dirección del HSE, **el 80 %** de su entorno quedó cifrado; el personal tuvo que volver al **papel y bolígrafo**; la recuperación se prolongó **más de cuatro meses**.
- Fuente: *Conti cyber attack on the HSE – Independent Post Incident Review*, 3-dic-2021: https://regmedia.co.uk/2021/12/10/ireland_hse_ransomware_full_pwc_report.pdf (copia pública del informe; págs. de introducción y cronología).
- Lección: **un solo clic + alertas no escaladas = semanas después, crisis**. Ideal para la lección del factor humano.

**4.6 Synnovis / NHS (Londres) – ransomware Qilin (3 de junio de 2024)** [S]
- Proveedor de análisis clínicos de varios hospitales; más de 10.000 citas ambulatorias y más de 1.700 operaciones electivas canceladas; escasez de sangre del grupo O negativo; el hospital King's confirmó que el ciberataque fue «factor contribuyente» en el fallecimiento de un paciente; datos de más de 900.000 pacientes potencialmente expuestos (estimación de una empresa de seguridad). Fuente (secundaria): https://www.hipaajournal.com/patient-death-linked-to-ransomware-attack/ – verificar en notas oficiales de NHS England / King's College Hospital.

**4.7 Advanced Computer Software Group (Reino Unido) – ransomware (agosto de 2022)** [L]
- Los atacantes accedieron a sistemas de su filial de salud y cuidados «a través de una cuenta de cliente sin autenticación multifactor (MFA)»; afectó a NHS 111 y el personal sanitario no pudo acceder a historias. La autoridad británica (ICO) multó a la empresa con **3,07 millones de libras el 26 de marzo de 2025**; 79.404 personas estaban en riesgo.
- Fuente: https://ico.org.uk/action-weve-taken/enforcement/2025/03/advanced-computer-software-group-limited/ [L]. La conexión con servicios de cuidados sociales aparece en el título de la nota del ICO de agosto de 2024 («...disrupted NHS and social care services»), https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2024/08/provisional-decision-to-impose-6m-fine-on-software-provider-following-2022-ransomware-attack/ [S, título leído en buscador].
- Lección: **doble verificación (MFA)** y proveedores. Es el caso europeo más cercano a «cuidados».

**4.8 Vastaamo (Finlandia) – robo de datos de psicoterapia (anuncio 21-oct-2020)** [S]
- Notas de sesiones de unos 33.000 pacientes robadas; ante la negativa de la empresa a pagar, el atacante extorsionó a pacientes uno a uno (200-500 € cada uno) y unas 22.000 personas denunciaron haber recibido esa extorsión. En abril de 2024 un tribunal condenó a Aleksanteri Kivimäki a seis años y tres meses. Fuentes: https://therecord.media/julius-kivimaki-hacker-finland-psychotherapy-center-sentencing · https://www.theregister.com/2024/04/30/finnish_psychotherapy_center_crook_sentenced/
- Lección: por qué la **confidencialidad de los datos de salud** importa más allá de la empresa (afecta a las personas).

**4.9 AZ Monica (Amberes, Bélgica) – ciberataque (13 de enero de 2026)** [S]
- El hospital detectó una caída grave de sistemas, apagó servidores en sus dos sedes; canceladas al menos 70 intervenciones; siete pacientes trasladados; servicios móviles de urgencia no disponibles. La fiscalía abrió investigación y no consta petición de rescate. Fuentes: https://en.wikipedia.org/wiki/2026_Belgian_hospital_cyberattack (cita a The Brussels Times y The Register, 13-14 ene 2026); https://databreaches.net/2026/01/13/antwerps-az-monica-hospital-hit-by-cyber-attack/ – comprobar en medios belgas oficiales. Útil como ejemplo reciente.

---

## 5. Vídeos verificados

Verificación realizada con `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json`: **respuesta HTTP 200 en todos** (YouTube devuelve error si el vídeo no existe o no permite incrustación). La duración procede del listado de YouTube (no la he comprobado reproduciendo). **No he podido ver los vídeos**: la descripción de «qué ilustra» se deduce del título y del canal; el equipo debe verlos antes de publicar.

| # | ID | Título exacto (oEmbed) | Canal | Duración aprox. | Pantalla que ilustra |
|---|---|---|---|---|---|
| 1 | `vqwtLVfg7ns` | ¿Qué es el ransomware? \| #AprendeCiberseguridad con INCIBE | INCIBE | 1:20 | L3, tarjeta ransomware |
| 2 | `SSjdJgINu2E` | ¿Qué es la ingeniería social? | Oficina de Seguridad del Internauta | 3:15 | L3 «ingeniería social» y L6 «por qué se engaña a las personas» |
| 3 | `t-Btf1-8-Lw` | ¿Qué es el vishing? \| #AprendeCiberseguridad con INCIBE | INCIBE | 1:05 | L3, llamada de «soporte técnico» |
| 4 | `sWWV3QgVcCk` | Así trabaja el ciberdelincuente ¿se lo vas a permitir? (actualización) | INCIBE | 3:42 | L3 introducción o L6 factor humano |
| 5 | `TWKvYnz6mL0` | Tu Ayuda en Ciberseguridad - Línea 017 de INCIBE | INCIBE | 0:40 | L7, a quién avisar |
| 6 | `vTEs11IdvYE` | 5 medidas técnicas para evitar brechas de datos personales | Agencia Española de Protección de Datos | 1:00 | L7/L6, brechas de datos y AEPD |

Alternativos verificados (200 en oEmbed):
- `uhzV5-iFb5E` · ¿Qué es el phishing? | #AprendeCiberseguridad con INCIBE · INCIBE · 1:24 (phishing).
- `xwdqT8u7w4I` · ¡Protégete ante phishing! Piénsalo antes de pinchar #EnlacesSospechosos #juntosportuseguridaddigital · Guardia Civil · 1:11.
- `o_GRQYiNRsk` · ¿Cómo evitar el fraude del CEO? · Guardia Civil · 1:31 (administración/dirección).
- `dp6bF3DPvN4` · Ejemplo de fraude telefónico · INCIBE · 2:24 (vishing; antiguo, hace ~7 años).
- `7T32WBQRrBA` · Phishing | Línea de Ayuda en Ciberseguridad 017 - Casos Reales · INCIBE · 1:45.
- `YH_4JWKfzIk` · Cómo proteger nuestros datos haciendo copias de seguridad · Oficina de Seguridad del Internauta · 2:04 (aprox. 11 años de antigüedad).

Todos son vídeos de tipo «píldora» muy breves. No encontré en la búsqueda un vídeo oficial breve específico sobre ciberataques a hospitales (Policía Nacional, CCN, AEPD o Ministerio de Sanidad); no incluyo nada que no pueda verificar.

---

## 6. Material del kit INCIBE utilizable

Ruta base: `C:\Users\Jose Alberto Arruego\Downloads\kit_concienciacion\kit_concienciacion\`. Todos los PNG de «Consejos» son 801×801 salvo `0202` (3333×3333). Los pósteres son de alta resolución (≈4961×7017). Licencia/uso: **comprobar condiciones de reutilización del kit INCIBE antes de publicar** (no la he revisado).

### Imágenes (carpeta `RecursosFormativos`)

| Fichero | Mensaje (leído en la imagen) | Pantalla sugerida |
|---|---|---|
| `01_Información\Consejos\0101_Información.png` | «Los datos son el pilar de tu empresa, protégelos» (#InformaciónSegura) | L1, portada «qué se protege» |
| `01_Información\Consejos\0102_Información.png` | «Dale a tus DATOS el valor que tienen» | L1/L2, valor de la información |
| `02_Información\Consejos\0201_Información.png` | «C.I.F.R.A.D.O. (la seguridad de tus datos)» | L2/L6 (cifrado: pantalla de móvil con candado) |
| `02_Información\Consejos\0202_Información.png` | «METADATOS, cuidado con la información que no se ve» | L2, pantalla 2.5 |
| `03_Información\Consejos\0301_Información.png` | «Para tu tranquilidad, HAZ COPIAS de seguridad» | L6, pantalla copias |
| `03_Información\Consejos\0302_Información.png` | «Destructoras de papel, las protectoras de la información» (papel «CONFIDENCIAL») | L2/L6, papel con datos |
| `01_Información\Posters\0101_Información.png` | «Protege el mayor activo de tu empresa» (póster vertical, cabecera) | Portada del curso |
| `01_Información\Posters\0102_Información.png` | «Protege el mayor activo de tu empresa, la información» (horizontal) | Portada/banner |
| `01_Información\Posters\0103_Información.png` | «Nunca se valora lo suficiente la información… hasta que se pierde» (tubería rota) | L5, impacto |
| `04_Fraudes\Consejos\0401_Fraudes.png` | «Envíos a múltiples destinatarios, siempre en COPIA OCULTA» | L3 errores humanos |
| `04_Fraudes\Consejos\0402_Fraudes.png` | «Correo SOSPECHOSO: no pinches en los enlaces» | L3 phishing / L6 |
| `05_Contraseñas\Consejos\0501_Contraseñas.png` | «Tu CONTRASEÑA es la puerta de entrada a tu información» | L6 hábito 3 |
| `05_Contraseñas\Consejos\0502_Contraseñas.png` | «Las contraseñas, como el cepillo de dientes, son solo para TU USO» | L6 hábito 3 / claves compartidas en planta |
| `06_PuestoTrabajo\Consejos\0601_PuestoTrabajo.png` | «¡Utiliza WIN+L cada vez que te levantes!» | L6 hábito 1 |
| `06_PuestoTrabajo\Consejos\0602_PuestoTrabajo.png` | «Practica el PARCHEADO y evita problemas» | L6 hábito 5 |
| `07_PuestoTrabajo\Consejos\0701_PuestoTrabajo.png` | «Cuando el ANTIVIRUS suena, malware llega» | L6 hábito 5 |
| `07_PuestoTrabajo\Consejos\0702_PuestoTrabajo.png` | «Siempre software legítimo, NO SEAS PIRATA» | L6 hábito 4 |
| `08_Móviles\Consejos\0801_Móviles.png` | «Yo no sabía que esto NO SE PODÍA hacer… Desconfía de redes WiFi abiertas» | L6 hábito 6 (móvil/wifi) |
| `08_Móviles\Consejos\0802_Móviles.png` | «Tu smartphone, siempre con BLOQUEO» | L6 hábito 6 |
| `09_RedesSociales\Consejos\0901_RedesSociales.png` | «Vamos a aplicar el SENTIDO COMÚN… internet tiene MEMORIA» | L6 (fotos/mensajes de residentes en redes) |
| `09_RedesSociales\Consejos\0902_RedesSociales.png` | «Comprueba la PRIVACIDAD y SEGURIDAD de tus RRSS» | L6 |
| `..\Posters_presentacion\017_Linea_ayuda.jpg` | Cartel de la línea 017 (3508×4967) **[no revisado visualmente en detalle]** | L7, a quién avisar |

Las carpetas `04`-`09` también tienen pósteres (`Posters\…`) que no he inspeccionado uno a uno.

### PDF y PPTX con contenido citable

| Recurso | Qué contiene | Uso |
|---|---|---|
| `01_Información\01_Informacion.pdf` | La información como activo (pág. 3-6), tres pilares (7-9), privacidad y ley (10-11), referencias (12) | L1, L2, L7 |
| `01_Información\Presentacion\01_Informacion.pptx` | 20 diapositivas: diap. 3-7 importancia, 8-9 incidentes (accidentales, internos, ciberdelincuentes), 10-13 pilares, 14-19 RGPD/LOPDGDD | Estructura didáctica de L1-L2 |
| `01_Información\Ficha\01_Informacion.pdf` | Resumen de una hoja | Ficha descargable |
| `02_Información\02_Información.pdf` + PPTX (18 diap.) | Clasificación en 4 pasos (págs. 3-5), cifrado (6), metadatos (7-8) | L2 |
| `03_Información\03_Información.pdf` + PPTX (26 diap.) | Copias (págs. 3-10, regla 3-2-1 pág. 10), borrado seguro (11-12), local/red/nube (13) | L6 (copias), L2 (papel/destrucción) |
| `Tripticos\informacion.pdf`, `phishing.pdf`, `concienciacion.pdf` (Decálogo), `contraseñas.pdf`, `dispositivos_moviles.pdf`, `puesto_trabajo.pdf`, `redes_sociales.pdf`, `soportes.pdf`, `byod.pdf` | Resúmenes en tríptico (leí `informacion`, `phishing` y `concienciacion`) | Hojas de refuerzo descargables por tema |
| `Manual_implantacion.pdf`, `Encuesta_satisfaccion.pdf`, `Manual_Gophish`, `Ataques_dirigidos` | Manual del kit, encuesta y simulador de phishing | **No usar en este curso** (no revisados; el simulador de phishing es una herramienta aparte de la organización). |

Advertencia: el contenido del kit se dirige a **empresas/pymes en general** (habla de ventas, clientes, comerciales). Hay que traducir los ejemplos al mundo de la residencia (residente, familia, planta, turno). Los kits mencionan la «LOPD»; la norma vigente que citan los textos del kit en págs. 10-11 es el RGPD y la **LOPDGDD** (ya correcto en el pdf 01), pero el tríptico `informacion.pdf` aún habla de LOPD y RDLOPD: **no copiar esa parte del tríptico**.

### Estructura de los tests de autoevaluación del kit (para inspirarnos sin copiar)

- **3 tests de 10 preguntas** (uno por documento: información / clasificación-cifrado-metadatos / backups-borrado-almacenamiento). Ficheros: `0X_Información\Test_evaluacion\0X_Test_Información.pdf`.
- **Formato**: elección múltiple con **4 opciones (a-d), una sola correcta**; instrucción «Selecciona para cada pregunta la respuesta correcta»; las **soluciones** aparecen en una tabla al final (pág. 6), no tras cada pregunta; **no hay explicación** de por qué es correcta.
- **Tipo de preguntas**: casi todas de **definición/recuerdo** («¿qué es un metadato?», «¿en qué consiste la estrategia 3-2-1?», «¿qué normativa regula…?»). Muy pocas de aplicación en un caso.
- **Distractores**: suelen usar absolutos («solo», «siempre», «nunca», «exclusivamente») y frases largas; en algún caso hay opciones de tipo «todas las respuestas» o la correcta es la más completa. Algunas preguntas son ambiguas (por ejemplo, la 3 del test 1).
- **Qué mejorar en nuestro curso**: preguntas más cortas, en situación («Un señor llama diciendo que es del soporte técnico…»), retroalimentación con explicación breve, opciones sin trampas de redacción, lenguaje apto para móvil.

---

## 7. Ideas de actividades interactivas y escenarios por rol

### Actividades (tipos de interacción posibles en el editor; ajustar al catálogo real)

1. **Clasificar tarjetas (arrastrar y soltar):** ¿Restringida, confidencial, uso interno o pública? (historia clínica, menú de la semana, nómina, cuadrante, foto de una herida, teléfono de la residencia…). Lección L2.
2. **¿Qué pilar se rompe?** (relacionar): «La tablet no abre» → disponibilidad; «alguien cambió la dosis» → integridad; «el correo llegó a otra familia» → confidencialidad. Lección L2.
3. **Verdadero o falso rápido** con mitos: «Mi residencia es pequeña, a nadie le interesa» (falso); «Si no hago clic no pasa nada» (matizar: también hay llamadas y personas); «Un correo con el logo del banco es del banco» (falso).
4. **Phishing a ciegas (3-4 mensajes en pantalla de móvil simulada):** señalar qué es sospechoso (remitente, urgencia, enlace, adjunto inesperado). Lección L3/L6.
5. **Llamada de «soporte técnico» (escenario ramificado):** opciones: dar la clave, colgar, pedir nombre y llamar al responsable. Con consecuencias y explicación. Lección L3.
6. **Línea de tiempo del HSE:** ordenar los hitos (16 mar correo; 18 mar clic; 8 semanas; 14 may ransomware; papel y bolígrafo). Lección L4. Muy buena para «el factor humano».
7. **Mapa de decisiones ante un incidente:** «Aparece un mensaje pidiendo dinero» → ¿Qué haces primero? (avisar al responsable); ¿qué no haces? (pagar, apagar sin preguntar, borrar). Lección L7.
8. **Emparejar contactos:** «Banco / 017 / AEPD / responsable del centro / Policía» con «cuándo». Lección L7.
9. **Checklist de planta (autoevaluación):** «Hoy en mi planta… ¿bloqueamos pantalla? ¿hay claves en post-it? ¿hay papeles con datos a la vista?». Sin nota; cierre del curso con compromiso personal.
10. **Plan B en papel:** arrastrar a una «caja de emergencia» qué debe haber en papel si el sistema cae (listado de medicación, teléfonos, alergias).

### Escenarios cortos por rol (guion para pantallas con decisión)

- **Gerocultora, turno de noche:** la tablet de planta está bloqueada por el cambio de clave; una compañera dice «yo me sé la de todas». ¿Qué haces? (usar tu sesión; avisar a supervisión; no compartir).
- **Auxiliar:** una persona dice ser de mantenimiento informático y pide enchufar un USB «para actualizar el programa». (No; pedir identificación y avisar a dirección).
- **Enfermería:** ves en la historia de una conocida del pueblo que ha ingresado; sientes curiosidad. (No; solo acceso para cuidar; consecuencias que indica la AEPD).
- **Enfermería / administración:** vas a enviar un informe a una familia y el autocompletado propone otro nombre. (Revisar destinatarios; copia oculta).
- **Administración:** correo «del director» a las 18:00 pidiendo una transferencia urgente a una cuenta nueva. (Llamar por teléfono conocido; no por el correo).
- **Dirección:** el lunes por la mañana aparece un mensaje de rescate; ¿cuáles son las primeras llamadas? (017; informar a quien proceda; valorar notificación a la AEPD en 72 h; denuncia).
- **Mantenimiento:** el proveedor de cámaras pide conectar un equipo a la red del centro. (Autorización, cambiar claves por defecto; revisar con el responsable).
- **Todos:** has perdido tu móvil con fotos de residentes. (Avisar ya; es un incidente; no esperar a «ver si aparece»).

---

## 8. Preguntas de ejemplo (12) con respuesta y explicación

Formato propuesto: elección única con 3-4 opciones, retroalimentación inmediata. Son originales (no copiadas del kit).

1. **En la tablet de planta no abre la pauta de medicación porque un virus ha cifrado los archivos. ¿Qué propiedad de la información falla?**
   a) Confidencialidad b) **Disponibilidad** c) Integridad d) Ninguna
   *Respuesta: b.* La información sigue existiendo pero no se puede acceder a ella cuando hace falta (kit 01, pág. 7).

2. **Alguien cambia sin querer la dosis escrita en un informe digital. ¿Qué se ha roto?**
   a) Disponibilidad b) Confidencialidad c) **Integridad** d) Privacidad
   *Respuesta: c.* La información ya no es fiable porque se ha modificado.

3. **Envías por error el informe de la Sra. A a la familia de la Sra. B. ¿Es un incidente?**
   a) No, porque fue un despiste b) **Sí: es un error humano que afecta a la confidencialidad y debe comunicarse** c) Solo si la familia se queja d) Solo si el informe era largo
   *Respuesta: b.* La AEPD cita este tipo de envío a destinatario incorrecto como brecha frecuente en el ámbito sanitario (guía AEPD sanitaria, pág. 12). Tiene que saberlo el responsable.

4. **Te llaman diciendo que son del «soporte técnico» y te piden la contraseña de la tablet para arreglarla. ¿Qué haces?**
   a) Se la doy, es de la empresa b) La doy si suena muy seguro c) **Cuelgo y aviso a mi responsable** d) La doy pero luego la cambio
   *Respuesta: c.* Es vishing; el soporte legítimo no necesita tu contraseña (tríptico Phishing, vishing).

5. **Un correo del «director» pide una transferencia urgente y «que no se lo cuentes a nadie». ¿Cuál es la señal de alarma más clara?**
   a) El logo b) **Urgencia + secreto + dinero** c) Que sea de lunes d) Que tenga adjunto
   *Respuesta: b.* Patrón del fraude del CEO; hay que verificar por una vía conocida (vídeo de la Guardia Civil; Balance INCIBE: 9 % de las consultas de empresas).

6. **¿Cuál de estos hábitos protege más al dejar la tablet de planta un momento?**
   a) Dejarla con la pantalla hacia abajo b) **Bloquear la pantalla** c) Poner una nota con «no tocar» d) Apagar el wifi
   *Respuesta: b.* Es el primer hábito del Decálogo y la imagen `0601_PuestoTrabajo`.

7. **¿Cuántas personas empiezan un ataque de ransomware según el caso del HSE irlandés?**
   a) Ninguna, entra sola b) **Una persona abrió un archivo adjunto de un correo de phishing** c) Un técnico al actualizar d) No se sabe
   *Respuesta: b.* En el informe oficial, una persona abrió un Excel malicioso adjunto el 18-mar-2021 y el ransomware llegó el 14-may (apartado 4.5).

8. **Si ves un mensaje en tu ordenador que dice que tus archivos están cifrados y exige un pago, ¿qué haces primero?**
   a) Pago para que no se pierdan b) Reinicio todo c) **No toco más y aviso al responsable** d) Lo apunto en la hoja de la planta y sigo
   *Respuesta: c.* No se paga (INCIBE: «en ningún caso el pago del rescate es una opción aconsejada») y la decisión de qué hacer corresponde al responsable.

9. **El centro sufre una brecha de datos personales. ¿En cuánto tiempo, como máximo, debería el responsable notificarlo a la AEPD si hay riesgo para las personas?**
   a) 7 días b) 24 horas c) **72 horas desde que tiene constancia** d) Un mes
   *Respuesta: c.* Incluye fines de semana y festivos (guía AEPD de brechas). Dato para recordar a quien dirige, no a quien cuida.

10. **¿Quién notifica normalmente la brecha a la AEPD?**
    a) Cualquier trabajador por su cuenta b) **El responsable del tratamiento (el centro), con ayuda del delegado de protección de datos** c) Los residentes d) La policía
    *Respuesta: b.* La AEPD indica que el DPD es el punto de contacto de la entidad con la autoridad de control. Tu papel: avisar ya.

11. **Quieres mirar la historia clínica de un vecino que ha ingresado «solo por curiosidad». ¿Qué dice la AEPD?**
    a) Nada, si no se lo cuentas a nadie b) **El mero acceso injustificado puede acarrear sanciones y hasta responsabilidad penal** c) Solo es falta si lo publicas d) Es normal si trabajas en el centro
    *Respuesta: b.* La guía AEPD sanitaria (págs. 12-13) explica que no hace falta revelar a terceros para que haya consecuencias.

12. **¿Qué número de ayuda gratuito y confidencial de INCIBE puedes usar ante un fraude o duda de ciberseguridad?**
    a) 112 b) 061 c) **017** d) 091
    *Respuesta: c.* Atiende de 8:00 a 23:00 todos los días del año; también por WhatsApp (900 116 117) y Telegram (@INCIBE017). Aclarar que ante una emergencia de salud o de seguridad física se sigue llamando al 112.

Extra posibles: **13.** «¿Qué significa 3-2-1?» (3 copias, 2 soportes, 1 fuera); **14.** «¿Dónde se tira un papel con datos de un residente?» (destructora); **15.** «Verdadero o falso: las residencias son pequeñas y nadie las ataca» (falso: los atacantes buscan puertas abiertas; el sector sanitario es objetivo habitual según ENISA).

---

## 9. Lista de fuentes con URL

### Oficiales
- INCIBE, *Balance de ciberseguridad 2025*: https://www.incibe.es/sites/default/files/2026-02/Balance%20de%20ciberseguridad%202025%20INCIBE/BalanceCiberseguridad2025_INCIBE.pdf [L]
- INCIBE, Línea de Ayuda en Ciberseguridad (017): https://www.incibe.es/linea-de-ayuda-en-ciberseguridad [L]
- INCIBE, reporte de fraude / INCIBE-CERT: https://www.incibe.es/ciudadania/ayuda/reporte-de-fraude [L]
- INCIBE empresas, ransomware: https://www.incibe.es/empresas/blog/el-ransomware-y-recupero-mi-informacion [L]
- INCIBE-CERT, sector sanitario: https://www.incibe.es/incibe-cert/sectores-estrategicos/sanitario [L] y blog: https://www.incibe.es/en/incibe-cert/blog/cibersecurity-healthcare-sector-features-threats-and-recommendations [L]
- INCIBE-CERT, Hospital Clínic: https://www.incibe.es/en/incibe-cert/publicaciones/bitacora-de-seguridad/ciberataque-ransomware-paraliza-actividad-del-hospital [L]
- INCIBE, guía para mayores con la Policía Nacional (no leída): https://www.incibe.es/ciudadania/formacion/guias/guia-de-ciberseguridad-la-ciberseguridad-al-alcance-de-todos [NC]
- OSI (osi.es), redirige a https://www.incibe.es/ciudadania [L]
- Kit de concienciación INCIBE (archivos locales, apartado 6) [L]
- ENISA, *Threat Landscape: Health Sector* (nota de prensa 5-jul-2023): https://www.enisa.europa.eu/news/checking-up-on-health-ransomware-accounts-for-54-of-cybersecurity-threats [L]
- ENISA, *Threat Landscape 2025* (booklet): https://www.enisa.europa.eu/sites/default/files/2025-10/ENISA%20Threat%20Landscape%202025%20Booklet.pdf [L]
- AEPD, brechas en el sector salud: https://www.aepd.es/areas-de-actuacion/salud/brechas-de-datos-personales-en-el-sector-de-la-salud [L]
- AEPD, *Guía para la notificación de brechas de datos personales*: https://www.aepd.es/guias/guia-brechas-seguridad.pdf [L]
- AEPD, *Guía para profesionales del sector sanitario*: https://www.aepd.es/documento/guia-profesionales-sector-sanitario.pdf [L]
- Ministerio de Sanidad, Estrategia de Ciberseguridad del SNS 2025-2028: https://www.sanidad.gob.es/gabinete/notasPrensa.do?id=6789 [L]
- Hospital Clínic, comunicado FRCB-IDIBAPS: https://www.clinicbarcelona.org/en/news/computer-attack-on-the-frcb-idibaps [L]
- HSE Irlanda, informe PwC (copia pública): https://regmedia.co.uk/2021/12/10/ireland_hse_ransomware_full_pwc_report.pdf [L]
- ICO (Reino Unido), Advanced: https://ico.org.uk/action-weve-taken/enforcement/2025/03/advanced-computer-software-group-limited/ [L]
- Guardia Civil, denuncias: https://web.guardiacivil.es/es/tramites/denuncias/index.html [S, resumen de búsqueda]
- Policía Nacional, BCIT: https://www.policia.es/_es/tupolicia_conocenos_estructura_dao_cgpoliciajudicial_bcit.php [S, resumen]
- CCN-CERT: https://www.ccn-cert.cni.es/ (no leí el informe *Ciberamenazas y Tendencias 2025*; [NC])
- Ministerio del Interior, *Informe sobre la cibercriminalidad en España 2024*: https://www.interior.gob.es/opencms/export/sites/default/.galleries/galeria-de-prensa/documentos-y-multimedia/balances-e-informes/2024/Informe-sobre-la-cibercriminalidad-en-Espana-2024.pdf (**no accesible: HTTP 403**; no usar cifras hasta leerlo) [NC]

### Secundarias
- Gestión y Dependencia (DomusVi): https://gestionydependencia.com/noticia/4662/innovacion/alerta.-las-residencias-de-mayores-no-estan-exentas-de-un-ciberataque.html
- PSN Sercon (Torrejón): https://blog.psnsercon.com/el-hospital-de-torrejon-sufre-el-primer-caso-de-ransomware-a-un-hospital-en-espana/
- Bitlife Media (CSI): https://bitlifemedia.com/2022/10/ciberataque-ransomware-hospitales-cataluna/
- HIPAA Journal (Synnovis): https://www.hipaajournal.com/patient-death-linked-to-ransomware-attack/
- The Record / The Register (Vastaamo): https://therecord.media/julius-kivimaki-hacker-finland-psychotherapy-center-sentencing · https://www.theregister.com/2024/04/30/finnish_psychotherapy_center_crook_sentenced/
- Wikipedia / databreaches.net (AZ Monica): https://en.wikipedia.org/wiki/2026_Belgian_hospital_cyberattack · https://databreaches.net/2026/01/13/antwerps-az-monica-hospital-hit-by-cyber-attack/

### Vídeos (YouTube)
`https://www.youtube.com/watch?v=` + ID: `vqwtLVfg7ns`, `SSjdJgINu2E`, `t-Btf1-8-Lw`, `sWWV3QgVcCk`, `TWKvYnz6mL0`, `vTEs11IdvYE` (principales); `uhzV5-iFb5E`, `xwdqT8u7w4I`, `o_GRQYiNRsk`, `dp6bF3DPvN4`, `7T32WBQRrBA`, `YH_4JWKfzIk` (alternativos).

---

## Anexo. Limitaciones y verificaciones pendientes

1. No hay estadísticas oficiales específicas de residencias españolas; no hay caso verificado de filtración de datos de residentes en España.
2. Los casos 4.2, 4.3, 4.6, 4.8 y 4.9 están apoyados en fuentes secundarias; buscar nota oficial (Agencia de Ciberseguridad de Cataluña, King's College Hospital/NHS England, fiscalía y hospital belga, tribunal finlandés) antes de dar cifras concretas.
3. No he visto el contenido de los vídeos, solo verificado existencia, título, canal y que se pueden incrustar.
4. Confirmar en la guía AEPD si procede afirmar que los datos de salud son «categoría especial» (norma general RGPD, no leída aquí literalmente) y qué dice sobre fotos/WhatsApp de residentes.
5. Revisar condiciones de uso/licencia del kit INCIBE para reutilizar las imágenes dentro de un curso comercial.
6. El tríptico `informacion.pdf` y algunas guías del kit citan la LOPD antigua; el curso debe citar RGPD + LOPDGDD.
7. Las tablas de roles, la clasificación adaptada y los reflejos de la lección 7 son propuestas didácticas coherentes con las fuentes, no citas.
