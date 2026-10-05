# Ciberseguridad en centros sociosanitarios — Documento base

> **Programa formativo de ≈ 10 horas, en 6 cursos SCORM interactivos**, para todo el personal de
> centros sociosanitarios (gerocultores/as, auxiliares, enfermería, administración,
> dirección, supervisión, mantenimiento). Pensado para móvil y para personas sin soltura digital.
>
> Este documento reúne **toda la información investigada** (fuentes oficiales, casos, datos, vídeos,
> recursos visuales, escenarios y preguntas) que sirve de base a los 6 paquetes `.scormproj`.
> Los paquetes están en `docs/curso-ciberseguridad/scormproj/`; los guiones de generación, en
> `scripts/curso-ciberseguridad/`.

## Cómo leer este documento

Cada dossier lleva **marcas de verificación** junto a cada dato:

| Marca | Significado |
|---|---|
| `[L]`, `[V]`, `[LEÍDO]` | El dato se leyó directamente en la fuente citada (oficial siempre que se indica). |
| `[S]`, `[SECUNDARIA]`, `[SOLO BÚSQUEDA]`, `[V-sec]` | Solo consta en una fuente secundaria o en un resultado de búsqueda: contrastar antes de citarlo como hecho. |
| `[NC]`, `[NO CONFIRMADO]`, `[SIN CONFIRMAR]`, `[NO VERIFICADO]` | No se ha podido confirmar. **No se usa en los cursos.** |

Regla del programa: **en los cursos solo entra lo leído en fuente oficial o claramente marcado como
recomendación/buena práctica propuesta.** Los ejemplos de mensajes fraudulentos y los casos de aula
son **ficticios y didácticos** y se presentan como tales.

## Programa

| # | Curso (`.scormproj`) | Idea fuerza | Pantallas | Duración estimada* |
|---|---|---|---|---|
| 1 | Fundamentos: por qué importa la ciberseguridad en un centro sociosanitario (`cibersegsoc-c1-fundamentos`) | Cuidas personas y también sus datos; tú eres la defensa | 53 | 1 h 38 |
| 2 | Contraseñas y accesos: las llaves del centro (`cibersegsoc-c2-contrasenas`) | Frases de paso largas, nada de claves compartidas, verificación en dos pasos | 49 | 1 h 18 |
| 3 | Correo, mensajes y llamadas: no piques el anzuelo (`cibersegsoc-c3-correo-fraudes`) | Parar, mirar, preguntar: señales de fraude y qué hacer si ya has picado | 64 | 1 h 42 |
| 4 | Mi puesto, mis dispositivos y mi wifi (`cibersegsoc-c4-puesto-dispositivos`) | Puesto limpio, actualizaciones, wifi, móvil, copias y teletrabajo | 58 | 1 h 49 |
| 5 | Datos de las personas residentes: confidencialidad, fotos y brechas (`cibersegsoc-c5-datos-brechas`) | Qué se puede decir y a quién; fotos; avisar a tiempo de una brecha | 55 | 1 h 44 |
| 6 | Inteligencia artificial: nuevas amenazas y uso seguro (`cibersegsoc-c6-ia`) | Voz y vídeo falsos; verificar por otro canal; qué datos no se dan a una IA | 55 | 1 h 30 |
| | **Total** | | **334** | **≈ 8 h 40** |

*Estimación del editor (chip de duración), con el tiempo de cada interactivo a medida declarado por el
autor en `est_seconds` (a ojo, sin medir con alumnos) y el test final contado a 30 s/pregunta. Los
ritmos reales variarán; el programa se ajusta (ampliando o recortando) tras la revisión del cliente.

**Hilo común de los 6 cursos:** *para, mira, pregunta, avisa.* Ante la duda, nadie es sospechoso por
preguntar; lo grave es callar.

## Criterios pedagógicos del diseño

- **Móvil primero**: pantallas cortas (una idea cada una), botones grandes, ilustraciones vectoriales
  (SVG) ligeras, vídeo por YouTube (no se aloja), sin pósteres ni infografías pesadas.
- **Interactividad con sentido**: baraja deslizable «¿fraude o legítimo?», historias con decisiones
  (llamadas, WhatsApp, videollamada), laboratorios y simuladores a medida (HTML+CSS+JS aislados),
  `hotspots` sobre escenas del centro, ordenar procedimientos, clasificar, emparejar, rosco,
  crucigrama, sopa de letras, tarjetas de repaso y un **compromiso final** por curso.
- **Por puesto**: cada curso incluye escenarios para gerocultor/a, auxiliar y enfermería, administración y
  dirección, supervisión y mantenimiento (los tests «en su puesto» del kit del INCIBE, pero con
  situaciones propias y con explicación de cada respuesta).
- **Evaluación**: actividades puntuables repartidas por el curso + test final de aplicación (10-12
  preguntas, una a una, con explicación); nota mínima 70 %.
- **Tono**: tuteo, lenguaje llano, sin culpabilizar.

## Recursos visuales y de vídeo

- **Ilustraciones**: SVG propios generados por script (`scripts/curso-ciberseguridad/svgkit.mjs`), dentro de
  cada `.scormproj` en `assets/img/`.
- **Kit de concienciación del INCIBE**: solo los PNG pequeños de «Consejos» (se citan como «Kit de
  concienciación de INCIBE»). *Pendiente de confirmar la licencia de reutilización del kit.* Los pósteres
  (hasta 39 MB) y las presentaciones **no** se incorporan: no son aptos para móvil. Algunas carpetas del kit
  están mal etiquetadas (ver cada dossier).
- **Vídeos**: cada dossier lista los vídeos de YouTube **verificados con oEmbed** (existencia e
  incrustabilidad, título y canal). **Su contenido y duración no están verificados**: verlos antes de publicar.
  No hay vídeos oficiales breves para todos los temas (IA, USB, VPN, brechas): donde falta, el curso usa
  piezas visuales propias.

## Verificaciones pendientes antes de publicar

1. Ver los vídeos incrustados y confirmar duración, contenido y subtítulos; ajustar la transcripción de cada pantalla.
2. Confirmar la **licencia de reutilización del kit** del INCIBE.
3. Comprobar el horario y el canal de la línea **017** de INCIBE (el dossier del curso 3 recoge un horario de 2022).
4. Curso 6: leer el texto consolidado del Reglamento (UE) 2024/1689 tras el «Ómnibus» (art. 4, alfabetización en IA) antes de afirmar obligaciones.
5. Curso 5: la aplicabilidad de **NIS2/ENS** y la obligatoriedad de **DPD** a cada centro dependen de su situación; no se afirman. Los contactos internos (responsable, DPD) los define cada centro.
6. Curso 2: el criterio de contraseñas sigue **CCN-CERT BP/35 y NIST 800-63B-4**, más modernos que el kit del INCIBE (que mantiene 8-10 caracteres y cambio trimestral). Si el centro tiene política propia, prevalece.
7. Revisión por el DPD / responsable de seguridad del centro de las «propuestas» (matriz de permisos por puesto, protocolo de 5 pasos, uso de móviles personales).

---


---

<!-- Fuente: fuentes/01-fundamentos.md -->
## Parte Curso 1 · Fundamentos: por qué importa la ciberseguridad en un centro sociosanitario

Documento de fuentes y material didáctico (investigación de octubre de 2026). Pensado para convertirse en pantallas de un SCORM de ~1 h 40 min, a hacer en móvil, para personal sin conocimientos digitales de centros sociosanitarios.

**Convención de fiabilidad** usada en todo el documento:
- **[L]** = leído por mí directamente en la fuente (página web, PDF o informe descargado).
- **[S]** = dato obtenido solo de fuente secundaria (prensa, blog, Wikipedia, resumen de búsqueda). Hay que contrastarlo con la fuente primaria antes de publicarlo tal cual.
- **[NC]** = no confirmado. Se dice expresamente cuando algo no se ha podido verificar.

---

### 1. Resumen ejecutivo

1. **Qué se protege.** En un centro sociosanitario no solo hay «ordenadores»: hay datos de salud y vida privada de personas mayores (historia clínica, medicación, fotos, estado de ánimo, familia), la **continuidad del cuidado** (turnos, pautas, medicación, citas), el **dinero** (cuentas, nóminas, facturas, transferencias) y la **reputación/confianza** de familias y administración. La información está en papel, en digital y en la cabeza de las personas (kit INCIBE 01, pág. 4, 8 [L]).
2. **Tres propiedades.** Disponibilidad (que esté cuando hace falta), integridad (que no se altere) y confidencialidad (que solo la vea quien debe). Se explican con ejemplos de centro sociosanitario en la lección 2 (kit INCIBE 01, págs. 7-9 [L]).
3. **Amenazas actuales.** Según INCIBE, en 2025 se gestionaron **122.223 incidentes** (+26 % que en 2024), de los que 25.133 fueron phishing, 55.411 malware y 392 ransomware [L]. Según ENISA, el **phishing es la puerta de entrada en ~60 % de los casos** y el ransomware es la amenaza de mayor impacto [L]. En el sector salud europeo, el ransomware fue el 54 % de las amenazas analizadas en el informe de ENISA de 2023 [L].
4. **El factor humano es central.** El caso del servicio de salud irlandés (HSE, 2021) lo demuestra con el informe oficial en la mano: **un correo con un Excel abierto por una persona** el 18-mar-2021 acabó, ocho semanas después, cifrando el 80 % de sus sistemas y obligando a trabajar con papel y bolígrafo durante meses [L]. También hay errores no maliciosos (enviar un correo al destinatario equivocado, borrar un archivo) y amenazas internas (acceso curioso a historias clínicas, que la AEPD advierte que puede ser delito) [L].
5. **Casos reales.** Hay casos documentados en hospitales de España (Hospital Clínic, 2023; Consorci Sanitari Integral, 2022; Torrejón, 2020) y de Europa (HSE Irlanda 2021, Synnovis/NHS 2024, Advanced/NHS 111 2022, Vastaamo Finlandia 2020, AZ Monica Bélgica 2026). **No he encontrado ningún ataque con filtración de datos a un centro sociosanitario de mayores en España confirmado en fuente fiable** (solo un «incidente informático» de DomusVi en nov-2022, que la propia empresa dijo que no afectó a datos personales [S]). No se debe inventar uno: el curso debe decir con honestidad que los casos conocidos son sanitarios y que un centro sociosanitario tiene los mismos puntos débiles.
6. **Qué hacer ante un incidente.** Parar, no tocar más, **avisar al responsable del centro** (que decide notificaciones), no pagar rescates, llamar al **017 de INCIBE** (gratuito, confidencial, 8:00-23:00, 365 días) y, si hay datos personales, el responsable del tratamiento debe valorar notificar a la **AEPD en un máximo de 72 horas** desde que tiene constancia (guía AEPD de brechas [L]). Las denuncias de delitos van a Policía Nacional / Guardia Civil.
7. **Higiene digital básica** (kit INCIBE «Decálogo» [L]): bloquear la pantalla al irse, no pinchar enlaces sospechosos, contraseñas únicas y secretas, no instalar apps no autorizadas, destruir el papel con datos, no usar equipos personales para tareas del centro, avisar ante cualquier cosa rara.
8. **Material gratuito reutilizable**: 12 «consejos» y 3 pósteres PNG del kit INCIBE (apartado 6), 6 vídeos verificados (apartado 5).

---

### 2. Contenido didáctico (lecciones listas para pantallas)

Reparto orientativo de tiempos: **L1 10 min · L2 12 · L3 15 · L4 12 · L5 10 · L6 13 · L7 10 · L8 8 · cierre y test 10 = 100 min.**

Pie de estilo: frases cortas, segunda persona del singular, ejemplos de planta. Cada «Pantalla» es una propuesta de unidad del editor.

#### L1. ¿Qué tenemos que proteger en un centro sociosanitario? (10 min)

**Idea clave:** «Proteger la información es proteger a las personas que cuidamos».

**Pantalla 1.1 – Historia de apertura (escenario).** Turno de noche, la tablet de planta no abre las pautas de medicación. Hay que apuntar todo a mano y llamar a la enfermera de guardia. «¿Qué ha pasado? ¿Y si no vuelve en toda la noche?»

**Pantalla 1.2 – Los cuatro tesoros.** (actividad: tarjetas con ejemplos)
- **Datos de salud y de la vida de las personas residentes**: diagnósticos, medicación, caídas, informes, fotos, situación familiar y económica, DNI, tarjeta sanitaria. Son datos que la persona no ha elegido compartir con el mundo.
- **Continuidad del cuidado**: pautas, horarios, alergias, cambios posturales, citas médicas, contacto de familias. Si el sistema cae, el riesgo es clínico, no solo informático.
- **Dinero**: nóminas, facturas, cuentas del centro, pagos de familias, fondos de residentes si los gestiona el centro.
- **Reputación y confianza**: las familias dejan a su ser querido contigo. Una filtración rompe esa confianza.

Apoyo del kit: la información como «activo», con partes **tangibles** (ordenadores, móviles, discos) e **intangibles** (reputación, conocimiento del personal) – kit 01, págs. 3-4; diapositivas 3-7 [L]. Imagen PNG `0101_Información` («Los datos son el pilar de tu empresa, protégelos»).

**Pantalla 1.3 – Dónde vive la información.** Papel (carpetas de planta, libro de incidencias, hojas de medicación impresas), digital (software de gestión, correo, WhatsApp, fotos del móvil, USB) y **en las personas** (lo que sabes de cada residente). «La información confidencial se protege igual en cualquier formato; incluso si se ha comentado de palabra» (tríptico INCIBE «La información» [L]).

**Pantalla 1.4 – Por qué a un centro sociosanitario.** Mensajes (con fuente): los datos de salud valen dinero en el mercado ilegal (INCIBE-CERT cita que un expediente médico se paga entre 30 y 1.000 USD, blog de 25-ene-2024 [L]); los sistemas son heterogéneos y a veces antiguos («legacy»); y la interrupción del servicio presiona a pagar. Importante: **los criminales no «eligen» a un centro sociosanitario concreto por quiénes son; atacan a quien tenga la puerta abierta**. [Matiz: esta frase es redacción didáctica, no cita.]

---

#### L2. Qué tipos de información hay y cómo se clasifica (12 min)

**Idea clave:** «No toda la información pide la misma protección, pero hay que saber cuál es cuál».

**Pantalla 2.1 – Los tres pilares con ejemplos de centro sociosanitario.**
- **Disponibilidad**: poder abrir la pauta de medicación cuando hace falta. Falla con ransomware o con un error de configuración (kit 01, pág. 7 [L]).
- **Integridad**: que la pauta no haya sido cambiada (por error o a propósito) y que el informe diga lo que dijo el médico. Falla con alteraciones o borrados parciales (kit 01, pág. 7 [L]).
- **Confidencialidad**: que solo vea la historia de la Sra. Carmen quien la cuida. Falla con acceso curioso, correo mal enviado, papeles a la vista (kit 01, pág. 8 [L]).
  Actividad: «¿Qué pilar se rompe?» (ver apartado 7).

**Pantalla 2.2 – Tipos de información (propuesta adaptada de los cuatro niveles del kit 02, pág. 4 [L]).** El kit propone, como ejemplo orientativo, confidencial / restringida / uso interno / pública. Adaptación didáctica para un centro sociosanitario (**propuesta de diseño, no texto del INCIBE**):

| Nivel (kit INCIBE) | Ejemplos en un centro sociosanitario |
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

#### L3. Las amenazas de hoy, sin tecnicismos (15 min)

**Idea clave:** «Casi todo empieza con una persona que hace clic, contesta una llamada o se descuida».

Para cada amenaza: «Qué es» + «Cómo se ve en tu día a día» + «Qué hacer».

| Amenaza | Explicación llana (fuente) | Escena de centro sociosanitario | Reflejo correcto |
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

#### L4. Casos reales: cuando pasa de verdad (12 min)

**Idea clave:** «No es ciencia ficción: le ha pasado a hospitales y servicios de salud de nuestro entorno».

Presentar 4-5 casos en tarjetas de «Qué pasó · Cómo empezó · Qué consecuencias tuvo · Qué habría ayudado» (detalle y fuentes en apartado 4). Selección recomendada:
1. **Hospital Clínic de Barcelona (5-mar-2023)** – urgencias, laboratorio y farmacia a mano; datos filtrados.
2. **HSE Irlanda (14-may-2021)** – empezó con un correo y un Excel; el informe oficial lo cuenta paso a paso. Es **el caso ideal para el «factor humano»**.
3. **Synnovis / NHS Londres (3-jun-2024)** – un proveedor de análisis cae y se cancelan miles de citas; un fallecimiento vinculado oficialmente.
4. **Vastaamo (Finlandia, 2020)** – datos de psicoterapia robados y extorsión a pacientes individuales (por qué es tan grave filtrar datos de salud).
5. **Advanced / NHS 111 (UK, 2022)** – un proveedor de software sin doble verificación; multa de 3,07 M£ en 2025.

Cierre honesto: «De centros sociosanitarios españoles con filtración de datos no tenemos casos públicos verificados; sí hay hospitales y centros de salud. Lo que protege a un hospital protege a un centro sociosanitario».

---

#### L5. Impacto en el cuidado de las personas mayores (10 min)

**Idea clave:** «Un ataque informático es también un problema de cuidados».

Mensajes basados en hechos de los casos:
- **Se trabaja a mano**: Clínic (urgencias, laboratorio y farmacia con procedimientos manuales [L]); HSE (papel y bolígrafo [L]). En un centro sociosanitario: pautas de medicación, alergias, cambios posturales, dietas especiales, protocolo de caídas.
- **Retrasos y errores**: Synnovis: el fallo de un laboratorio tuvo como consecuencia citas y operaciones canceladas y, según el hospital King's, un fallecimiento en el que el ciberataque fue «factor contribuyente» [S, vía HIPAA Journal]. Idea para un centro sociosanitario: sin acceso a analíticas o pautas, el riesgo es clínico.
- **Daño a las personas** si los datos salen: Vastaamo (extorsión directa a unas 22.000 personas [S]); una persona mayor con demencia puede ser más fácil de engañar usando datos de su historial.
- **Recuperación lenta**: HSE >4 meses de recuperación [L]; Clínic: a los 5 días, 40 % de la actividad quirúrgica y 70 % de las consultas externas (INCIBE-CERT [L]).

**Pantalla 5.x – Actividad «Sin sistema, ¿qué haría?»** Plan B en papel: cada planta debe saber dónde está la hoja de medicación en papel, el listado de teléfonos de emergencia y familias, y a quién llamar. (Es una buena práctica general; no está citada literalmente en una fuente concreta de esta investigación.)

---

#### L6. El factor humano y la higiene digital (13 min)

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

**Pantalla 6.3 – WhatsApp y fotos (tema muy real en centros sociosanitarios).** Lo que dice la AEPD: se puede avisar al paciente por mensajería (por ejemplo para una cita) siempre que el mensaje llegue solo a la persona y no a un grupo en el que el paciente esté (guía AEPD sanitaria, sección sobre comunicación con pacientes; no anoté la página [L]). Para fotos de residentes en móviles personales, **no he localizado una norma específica leída en esta investigación**: el curso debe remitir al protocolo del centro y al responsable de protección de datos [NC].

**Pantalla 6.4 – Copias de seguridad en lenguaje llano.** Idea de «3-2-1»: 3 copias, 2 soportes distintos, 1 fuera del centro (kit 03, pág. 10; diap. 17 [L]). Mensaje para el personal: «No te toca a ti hacer las copias, pero sí no guardar datos importantes solo en tu móvil o en el escritorio del ordenador». Un backup que nunca se ha probado puede no servir (diap. 5 del kit 03: «no solo hay que hacerlas, hay que comprobar que podemos recuperarlas» [L]).

---

#### L7. Qué hacer ante un incidente y a quién avisar (10 min)

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

**Aviso de rigor:** el kit INCIBE (tríptico y guías) menciona «departamento de informática» o «departamento de seguridad». Un centro sociosanitario pequeño puede no tenerlo: el curso debe pedir al centro que defina **quién es la persona de contacto** antes de lanzar el curso.

---

#### L8. Mapa de roles: qué riesgos son típicos de cada puesto (8 min)

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

### 3. Datos y estadísticas citados

Todas las cifras están marcadas **[L]** o **[S]** según se explica al inicio.

#### A. Fuentes oficiales leídas (fiables)

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

#### B. Datos de fuente secundaria (usar con cautela)

| Dato | Fuente | Estado |
|---|---|---|
| El CCN-CERT señala (informe *Ciberamenazas y Tendencias 2025*, IA-04/25) que sanidad y manufactura fueron los sectores más atacados a nivel mundial en 2024. | Resumen de búsqueda sobre el informe del CCN-CERT (https://www.ccn-cert.cni.es) | **[S]/[NC]**: no leí el informe; no usar sin comprobar. |
| El sector sanitario habría recibido ~2.400 ciberataques semanales por organización (+17 %) en 2026. | Notas de prensa/blogs comerciales | **[NC]**: fuente comercial, no oficial. No usar. |
| «Más de 300.000 ciberdelitos en España en 2021». | Gestión y Dependencia (cita a INCIBE) | **[S]**: no usar; mejor emplear el Balance INCIBE 2025 [L]. |

**Lo que no he podido confirmar:** estadística oficial específica de **centros sociosanitarios** o centros sociosanitarios españoles (número de ataques, tipos). No existe en las fuentes consultadas; no se debe afirmar una cifra.

---

### 4. Casos reales (con fecha, fuente y enlace)

#### España

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

**4.4 DomusVi (grupo de centros sociosanitarios) – «incidente informático» (finales de noviembre de 2022)** [S]
- La empresa lo reconoció, de «afectación muy limitada», y afirmó que no se habían vulnerado datos personales de clientes, empleados ni proveedores. Es el único caso relacionado con centros sociosanitarios que encontré y **no hay datos de impacto ni detalles técnicos**. Fuente: https://gestionydependencia.com/noticia/4662/innovacion/alerta.-las-residencias-de-mayores-no-estan-exentas-de-un-ciberataque.html (31-dic-2022). Usar solo como «ejemplo reconocido de incidente», nunca como «ataque con filtración».

#### Europa

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

### 5. Vídeos verificados

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

### 6. Material del kit INCIBE utilizable

Ruta base: `C:\Users\Jose Alberto Arruego\Downloads\kit_concienciacion\kit_concienciacion\`. Todos los PNG de «Consejos» son 801×801 salvo `0202` (3333×3333). Los pósteres son de alta resolución (≈4961×7017). Licencia/uso: **comprobar condiciones de reutilización del kit INCIBE antes de publicar** (no la he revisado).

#### Imágenes (carpeta `RecursosFormativos`)

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

#### PDF y PPTX con contenido citable

| Recurso | Qué contiene | Uso |
|---|---|---|
| `01_Información\01_Informacion.pdf` | La información como activo (pág. 3-6), tres pilares (7-9), privacidad y ley (10-11), referencias (12) | L1, L2, L7 |
| `01_Información\Presentacion\01_Informacion.pptx` | 20 diapositivas: diap. 3-7 importancia, 8-9 incidentes (accidentales, internos, ciberdelincuentes), 10-13 pilares, 14-19 RGPD/LOPDGDD | Estructura didáctica de L1-L2 |
| `01_Información\Ficha\01_Informacion.pdf` | Resumen de una hoja | Ficha descargable |
| `02_Información\02_Información.pdf` + PPTX (18 diap.) | Clasificación en 4 pasos (págs. 3-5), cifrado (6), metadatos (7-8) | L2 |
| `03_Información\03_Información.pdf` + PPTX (26 diap.) | Copias (págs. 3-10, regla 3-2-1 pág. 10), borrado seguro (11-12), local/red/nube (13) | L6 (copias), L2 (papel/destrucción) |
| `Tripticos\informacion.pdf`, `phishing.pdf`, `concienciacion.pdf` (Decálogo), `contraseñas.pdf`, `dispositivos_moviles.pdf`, `puesto_trabajo.pdf`, `redes_sociales.pdf`, `soportes.pdf`, `byod.pdf` | Resúmenes en tríptico (leí `informacion`, `phishing` y `concienciacion`) | Hojas de refuerzo descargables por tema |
| `Manual_implantacion.pdf`, `Encuesta_satisfaccion.pdf`, `Manual_Gophish`, `Ataques_dirigidos` | Manual del kit, encuesta y simulador de phishing | **No usar en este curso** (no revisados; el simulador de phishing es una herramienta aparte de la organización). |

Advertencia: el contenido del kit se dirige a **empresas/pymes en general** (habla de ventas, clientes, comerciales). Hay que traducir los ejemplos al mundo del centro (residente, familia, planta, turno). Los kits mencionan la «LOPD»; la norma vigente que citan los textos del kit en págs. 10-11 es el RGPD y la **LOPDGDD** (ya correcto en el pdf 01), pero el tríptico `informacion.pdf` aún habla de LOPD y RDLOPD: **no copiar esa parte del tríptico**.

#### Estructura de los tests de autoevaluación del kit (para inspirarnos sin copiar)

- **3 tests de 10 preguntas** (uno por documento: información / clasificación-cifrado-metadatos / backups-borrado-almacenamiento). Ficheros: `0X_Información\Test_evaluacion\0X_Test_Información.pdf`.
- **Formato**: elección múltiple con **4 opciones (a-d), una sola correcta**; instrucción «Selecciona para cada pregunta la respuesta correcta»; las **soluciones** aparecen en una tabla al final (pág. 6), no tras cada pregunta; **no hay explicación** de por qué es correcta.
- **Tipo de preguntas**: casi todas de **definición/recuerdo** («¿qué es un metadato?», «¿en qué consiste la estrategia 3-2-1?», «¿qué normativa regula…?»). Muy pocas de aplicación en un caso.
- **Distractores**: suelen usar absolutos («solo», «siempre», «nunca», «exclusivamente») y frases largas; en algún caso hay opciones de tipo «todas las respuestas» o la correcta es la más completa. Algunas preguntas son ambiguas (por ejemplo, la 3 del test 1).
- **Qué mejorar en nuestro curso**: preguntas más cortas, en situación («Un señor llama diciendo que es del soporte técnico…»), retroalimentación con explicación breve, opciones sin trampas de redacción, lenguaje apto para móvil.

---

### 7. Ideas de actividades interactivas y escenarios por rol

#### Actividades (tipos de interacción posibles en el editor; ajustar al catálogo real)

1. **Clasificar tarjetas (arrastrar y soltar):** ¿Restringida, confidencial, uso interno o pública? (historia clínica, menú de la semana, nómina, cuadrante, foto de una herida, teléfono del centro…). Lección L2.
2. **¿Qué pilar se rompe?** (relacionar): «La tablet no abre» → disponibilidad; «alguien cambió la dosis» → integridad; «el correo llegó a otra familia» → confidencialidad. Lección L2.
3. **Verdadero o falso rápido** con mitos: «Mi centro es pequeño, a nadie le interesa» (falso); «Si no hago clic no pasa nada» (matizar: también hay llamadas y personas); «Un correo con el logo del banco es del banco» (falso).
4. **Phishing a ciegas (3-4 mensajes en pantalla de móvil simulada):** señalar qué es sospechoso (remitente, urgencia, enlace, adjunto inesperado). Lección L3/L6.
5. **Llamada de «soporte técnico» (escenario ramificado):** opciones: dar la clave, colgar, pedir nombre y llamar al responsable. Con consecuencias y explicación. Lección L3.
6. **Línea de tiempo del HSE:** ordenar los hitos (16 mar correo; 18 mar clic; 8 semanas; 14 may ransomware; papel y bolígrafo). Lección L4. Muy buena para «el factor humano».
7. **Mapa de decisiones ante un incidente:** «Aparece un mensaje pidiendo dinero» → ¿Qué haces primero? (avisar al responsable); ¿qué no haces? (pagar, apagar sin preguntar, borrar). Lección L7.
8. **Emparejar contactos:** «Banco / 017 / AEPD / responsable del centro / Policía» con «cuándo». Lección L7.
9. **Checklist de planta (autoevaluación):** «Hoy en mi planta… ¿bloqueamos pantalla? ¿hay claves en post-it? ¿hay papeles con datos a la vista?». Sin nota; cierre del curso con compromiso personal.
10. **Plan B en papel:** arrastrar a una «caja de emergencia» qué debe haber en papel si el sistema cae (listado de medicación, teléfonos, alergias).

#### Escenarios cortos por rol (guion para pantallas con decisión)

- **Gerocultora, turno de noche:** la tablet de planta está bloqueada por el cambio de clave; una compañera dice «yo me sé la de todas». ¿Qué haces? (usar tu sesión; avisar a supervisión; no compartir).
- **Auxiliar:** una persona dice ser de mantenimiento informático y pide enchufar un USB «para actualizar el programa». (No; pedir identificación y avisar a dirección).
- **Enfermería:** ves en la historia de una conocida del pueblo que ha ingresado; sientes curiosidad. (No; solo acceso para cuidar; consecuencias que indica la AEPD).
- **Enfermería / administración:** vas a enviar un informe a una familia y el autocompletado propone otro nombre. (Revisar destinatarios; copia oculta).
- **Administración:** correo «del director» a las 18:00 pidiendo una transferencia urgente a una cuenta nueva. (Llamar por teléfono conocido; no por el correo).
- **Dirección:** el lunes por la mañana aparece un mensaje de rescate; ¿cuáles son las primeras llamadas? (017; informar a quien proceda; valorar notificación a la AEPD en 72 h; denuncia).
- **Mantenimiento:** el proveedor de cámaras pide conectar un equipo a la red del centro. (Autorización, cambiar claves por defecto; revisar con el responsable).
- **Todos:** has perdido tu móvil con fotos de residentes. (Avisar ya; es un incidente; no esperar a «ver si aparece»).

---

### 8. Preguntas de ejemplo (12) con respuesta y explicación

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

Extra posibles: **13.** «¿Qué significa 3-2-1?» (3 copias, 2 soportes, 1 fuera); **14.** «¿Dónde se tira un papel con datos de un residente?» (destructora); **15.** «Verdadero o falso: los centros sociosanitarios son pequeñas y nadie las ataca» (falso: los atacantes buscan puertas abiertas; el sector sanitario es objetivo habitual según ENISA).

---

### 9. Lista de fuentes con URL

#### Oficiales
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

#### Secundarias
- Gestión y Dependencia (DomusVi): https://gestionydependencia.com/noticia/4662/innovacion/alerta.-las-residencias-de-mayores-no-estan-exentas-de-un-ciberataque.html
- PSN Sercon (Torrejón): https://blog.psnsercon.com/el-hospital-de-torrejon-sufre-el-primer-caso-de-ransomware-a-un-hospital-en-espana/
- Bitlife Media (CSI): https://bitlifemedia.com/2022/10/ciberataque-ransomware-hospitales-cataluna/
- HIPAA Journal (Synnovis): https://www.hipaajournal.com/patient-death-linked-to-ransomware-attack/
- The Record / The Register (Vastaamo): https://therecord.media/julius-kivimaki-hacker-finland-psychotherapy-center-sentencing · https://www.theregister.com/2024/04/30/finnish_psychotherapy_center_crook_sentenced/
- Wikipedia / databreaches.net (AZ Monica): https://en.wikipedia.org/wiki/2026_Belgian_hospital_cyberattack · https://databreaches.net/2026/01/13/antwerps-az-monica-hospital-hit-by-cyber-attack/

#### Vídeos (YouTube)
`https://www.youtube.com/watch?v=` + ID: `vqwtLVfg7ns`, `SSjdJgINu2E`, `t-Btf1-8-Lw`, `sWWV3QgVcCk`, `TWKvYnz6mL0`, `vTEs11IdvYE` (principales); `uhzV5-iFb5E`, `xwdqT8u7w4I`, `o_GRQYiNRsk`, `dp6bF3DPvN4`, `7T32WBQRrBA`, `YH_4JWKfzIk` (alternativos).

---

### Anexo. Limitaciones y verificaciones pendientes

1. No hay estadísticas oficiales específicas de centros sociosanitarios españoles; no hay caso verificado de filtración de datos de residentes en España.
2. Los casos 4.2, 4.3, 4.6, 4.8 y 4.9 están apoyados en fuentes secundarias; buscar nota oficial (Agencia de Ciberseguridad de Cataluña, King's College Hospital/NHS England, fiscalía y hospital belga, tribunal finlandés) antes de dar cifras concretas.
3. No he visto el contenido de los vídeos, solo verificado existencia, título, canal y que se pueden incrustar.
4. Confirmar en la guía AEPD si procede afirmar que los datos de salud son «categoría especial» (norma general RGPD, no leída aquí literalmente) y qué dice sobre fotos/WhatsApp de residentes.
5. Revisar condiciones de uso/licencia del kit INCIBE para reutilizar las imágenes dentro de un curso comercial.
6. El tríptico `informacion.pdf` y algunas guías del kit citan la LOPD antigua; el curso debe citar RGPD + LOPDGDD.
7. Las tablas de roles, la clasificación adaptada y los reflejos de la lección 7 son propuestas didácticas coherentes con las fuentes, no citas.



---

<!-- Fuente: fuentes/02-contrasenas-accesos.md -->
## Parte Curso 2 · Contraseñas, cuentas y accesos — Dossier de fuentes y contenido

Público: personal de centros sociosanitarios (gerocultores/as, auxiliares, enfermería, administración, dirección, supervisión, mantenimiento), sin conocimientos digitales, formación en móvil. Duración objetivo: ~1 h 40 min.

Fecha de elaboración: 5-oct-2026. Todo lo citado ha sido leído por mí en la fuente indicada; lo que no he podido confirmar se marca como **[NO VERIFICADO]**.

---

### 1. Resumen ejecutivo

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

### 2. Contenido didáctico estructurado (bloques → pantallas)

Convenciones: lenguaje llano, frases cortas, ejemplos de centro sociosanitario. «Pantalla» = pantalla sugerida del SCORM. Tiempos orientativos incluyen actividad.

#### Bloque 0 · Bienvenida y por qué importa (6 min)
- **P0.1 Gancho.** «En el centro, una contraseña abre la puerta a datos de salud de residentes y familias». Los datos de salud son categoría especial y la AEPD pide acceso limitado a quien lo necesita (Guía AEPD, p. 10).
- **P0.2 Idea clave INCIBE:** en el control de accesos «el nombre de usuario nos identifica y la contraseña nos autentica» (kit INCIBE, p. 3). Explicar con un ejemplo: *el nombre del usuario es tu nombre en la puerta; la contraseña es la llave*.
- **P0.3 Tres tipos de «prueba» de identidad** (kit INCIBE p. 3 / pptx d5; CCN-CERT BP/35 §10): algo que **sabes** (contraseña, PIN), algo que **tienes** (móvil, llave), algo que **eres** (huella, cara). Mini-quiz de clasificar: PIN de la tablet (sabes), huella (eres), código del móvil (tienes).
- **Objetivos del curso** (4-5 viñetas).

#### Bloque 1 · Qué es una contraseña segura hoy (14 min)
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

#### Bloque 2 · Errores comunes, reutilización y credential stuffing (9 min)
- **P2.1 Los 6 errores típicos** (OSI «Típicos errores que cometemos al usar nuestras contraseñas», 20-feb-2019): reciclar la misma con pequeñas variaciones; patrones de teclado (`123456`, `qwerty`); frases predecibles (`teamo`, `iloveyou`); intereses personales (equipo, grupo, marca); anotarlas en cuadernos o post-it visibles; seguir una fórmula previsible (Mayúscula + minúsculas + números + signo). Para un centro sociosanitario: el post-it bajo el teclado del control de enfermería; el nombre del centro + año.
- **P2.2 Reutilizar = «llave maestra».** Kit INCIBE p. 5: reutilizar es «uno de los errores más comunes»; si se filtra una, «todos los servicios que utilizan la misma contraseña se verían comprometidos».
- **P2.3 Credential stuffing en llano.** INCIBE («Con estos ataques nos roban las contraseñas…», 5-may-2022): los atacantes prueban de forma automática pares usuario/contraseña robados en filtraciones en muchos servicios. CCN BP/35: «uso automatizado de credenciales filtradas para acceder a otros servicios». Ejemplo: la contraseña de tu tienda online se filtra → la prueban en el correo y en el software del centro.
- **P2.4 Cómo te roban una contraseña** (resumen INCIBE 2022): ataque de fuerza bruta, de diccionario, credential stuffing, *phishing* (correo falso), *smishing* (SMS), *vishing* (llamada), *shoulder surfing* (mirarte teclear en sitios públicos; en centro sociosanitario, delante de otros trabajadores o familiares), *keylogger*. Que el alumno reconozca 3: phishing, shoulder surfing, reutilización.

#### Bloque 3 · Contraseñas compartidas en turnos (14 min)
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

#### Bloque 4 · Gestores de contraseñas (7 min)
- **P4.1 Qué es:** una caja fuerte digital protegida por **una sola contraseña maestra** (kit INCIBE p. 6; OSI «Gestores de contraseñas: ¿cómo funcionan?», 27-ene-2021). Genera claves aleatorias, guarda y autorrellena, puede avisar de claves débiles o filtradas, y funciona en varios dispositivos.
- **P4.2 Riesgo clave:** la contraseña maestra: «si esta no es lo suficientemente segura el resto de servicios tampoco lo serán» (kit p. 6). CCN BP/35 (§9): pasos para cambiarla; usar una passphrase mnemotécnica.
- **P4.3 Tipos:** en la nube (cómodos, dependen de la seguridad del proveedor) frente a locales (más seguros, menos cómodos) — OSI 2021. OSI ofrece herramientas gratuitas (KeePass y KeeWeb figuran en su sección de «herramientas gratuitas»: https://osi.es/es/herramientas-gratuitas/keepass).
- **P4.4 Qué decir a la plantilla de centro sociosanitario:** «el gestor de contraseñas lo decide la empresa; no instales el tuyo en el PC del centro sin permiso». Un gestor corporativo permite además compartir credenciales de equipo y revocarlas al irse alguien (afirmación recogida de un resultado de búsqueda sobre una guía técnica; **[no leída en fuente oficial INCIBE completa, tratar como orientación]**).
- **No hacer:** guardar contraseñas en notas del móvil, en WhatsApp a ti mismo, en un Excel «contraseñas.xlsx» en el escritorio.

#### Bloque 5 · Verificación en dos pasos, MFA y passkeys en llano (11 min)
- **P5.1 Idea:** «Aunque alguien tenga tu contraseña, no puede entrar sin tu móvil». Palabras de Google: «un hacker podría robar o adivinar una contraseña, pero no puede reproducir algo que solo tú tienes» (Google Workspace, ayuda del administrador, versión en español).
- **P5.2 Métodos** (Google Workspace/INCIBE/CCN): aviso en el móvil («Google prompt»: un toque), app autenticadora (código de 6 dígitos que cambia cada 30 s), llave de seguridad física/NFC (la más resistente al phishing), huella/cara como segundo factor, códigos de respaldo; SMS aceptable pero **menos recomendable** (CCN: vulnerable a *SIM swapping*; «priorizar aplicaciones autenticadoras o llaves de seguridad físicas frente al uso de SMS»).
- **P5.3 Buenas prácticas** (CCN BP/35 §10.1): activarlo en correo, gestor, banca, plataformas de trabajo; **guardar los códigos de respaldo** en lugar seguro (no en capturas ni correo); ¡**nunca dar el código a nadie**! «Ningún servicio legítimo pedirá esos datos por correo, SMS o llamada». Antes de cambiar de móvil, transferir la app autenticadora.
- **P5.4 Fatiga de aviso / «prompt bombing»:** **[no leído en las fuentes consultadas; no incluir como dato; si se menciona, hacerlo sin cifras]**. Regla simple y segura: si te llega un aviso de inicio de sesión que no has iniciado tú, **di «No» y avisa**.
- **P5.5 Pasos para activar 2SV en una cuenta Google** (Google, «Activar la verificación en dos pasos»): entra en la cuenta → Seguridad e inicio de sesión → «Cómo inicias sesión en Google» → activar verificación en dos pasos → elegir método (Google recomienda la notificación en el móvil: «es más fácil tocar una notificación que introducir un código»). Para cuentas gestionadas de Workspace, quien lo habilita/obliga es el administrador de la organización: Admin > Seguridad > Autenticación > Verificación en dos pasos.
- **P5.6 Passkeys (llaves de acceso)** en 3 frases: se entra con huella, cara o el PIN del móvil, **sin escribir contraseña**; no hay contraseña que robar ni que se pueda dar por error («no pueden compartirse, copiarse ni facilitarse a otra persona», Google); no todos los servicios las admiten aún (INCIBE blog «Passkeys: inicia sesión sin contraseñas de forma segura»). **Advertencia Google:** «no crees una llave de acceso en un dispositivo compartido»; si la creas, «cualquier persona que pueda desbloquear tu dispositivo podrá acceder a tu cuenta». Esto enlaza directamente con la tablet de planta.
- **Terminología para el alumno:** «verificación en dos pasos», «segundo factor», «2FA» y «MFA» (varios factores) se usan casi como sinónimos; en el curso, usar **«verificación en dos pasos»** y explicar «2FA» una vez.

#### Bloque 6 · Cuenta de Google Workspace y Drive del centro (11 min)
- **P6.1 Qué es:** tu cuenta del centro (`nombre@centro…`) abre correo, Drive y documentos de residentes. Tiene más valor que tu cuenta personal.
- **P6.2 Compartir en Drive** (Ayuda de Google Drive): roles **Lector** (ver y descargar), **Comentador** (comentar), **Editor** (editar y compartir; no cambia el propietario). Acceso general: **Restringido** (solo quien tú añadas) o **Cualquier persona con el enlace** (cualquiera con el enlace, sin cuenta Google). Regla para el curso: con datos de residentes, siempre **Restringido** y a personas concretas; «cualquiera con el enlace» solo para material sin datos personales y con permiso del centro.
- **P6.3 Revisar «Personas con acceso»** desde el cuadro Compartir; quitar el acceso cuando ya no haga falta (fin de un turno extra, suplencia que termina, familiar que ya no debe ver un documento).
- **P6.4 Cerrar sesión y dispositivos** (Ayuda de Cuenta de Google): en `myaccount.google.com` → Seguridad → «Tus dispositivos / Gestionar todos los dispositivos» → elegir dispositivo → Cerrar sesión; si no reconoces un dispositivo, ciérralo y revisa tu seguridad. En dispositivo que no es tuyo: usar **ventana privada o perfil de invitado** y cerrar sesión al acabar; no marcar «No volver a preguntar en este dispositivo» en equipos compartidos.
- **P6.5 Administrador:** puede cerrar la sesión de un usuario (p. ej., dispositivo perdido o persona que se va) — Google Workspace, ayuda del administrador. Dirigida a dirección/IT.
- **P6.6 Phishing de Google/Drive:** antes de introducir la clave, comprobar la dirección y la conexión HTTPS (CCN §3f). Recordar curso de phishing (otro módulo del programa).

#### Bloque 7 · Si sospechas que te han robado la contraseña / filtraciones (7 min)
- **P7.1 Señales** (inventadas por el curso a partir de la lógica de las fuentes; **no cuantificar**): no puedes entrar, te llegan avisos de inicio de sesión que no has hecho, aparecen correos enviados que no recuerdas, un compañero ve cambios que «tú» hiciste.
- **P7.2 Pasos (INCIBE «Me robaron la cuenta, ¿qué hago?», 18-nov-2020 + CCN BP/35):** 1) seguir las indicaciones de recuperación del servicio; 2) poner una contraseña robusta nueva y activar 2FA; 3) **comprobar si otras cuentas se han visto afectadas** y cambiar las que repitan la contraseña (todas distintas); 4) guardar pruebas (capturas); 5) denunciar si hay fraude. **Para el trabajador de centro sociosanitario añadir:** «avisa a tu responsable / informática **inmediatamente**» (el centro debe valorar una posible brecha de datos: ver curso de incidentes). Línea **017** de INCIBE, gratuita y confidencial (también WhatsApp 900 116 117 y Telegram @INCIBE017, según INCIBE).
- **P7.3 Comprobar filtraciones.** OSI/INCIBE recomiendan **HAVE I BEEN PWNED** en sus artículos (OSI «Típicos errores…», 2019; INCIBE «Me robaron la cuenta», 2020); CCN BP/35 §3e recomienda «comprobar filtraciones mediante servicios especializados». HIBP es un servicio gratuito creado por Troy Hunt (haveibeenpwned.com/About). **Cómo funciona la comprobación de contraseñas sin enviar la clave:** la API «Pwned Passwords» usa *k-anonymity*: solo se envían los 5 primeros caracteres de un hash. Para la plantilla: comprobar el **correo** (no la contraseña) en haveibeenpwned.com; **nunca escribas tu contraseña real** en webs de terceros (CCN BP/35). Con correo del trabajo, avisar primero al centro (política interna).
- **P7.4 Actualizar tras incidente:** «renovarse inmediatamente si hay sospechas de acceso no autorizado» (CCN §3).

#### Bloque 8 · Biometría, bloqueo de pantalla y cierre de sesión en puestos compartidos (7 min)
- **P8.1 Bloqueo de pantalla** (INCIBE «Bloqueo de dispositivos: patrón, contraseña, PIN, código y biometría»): patrón (pocas combinaciones, se ve al desbloquear), PIN, contraseña, huella/cara («muy precisas»; pueden fallar con heridas o envejecimiento). **Combinar al menos dos medidas** (p. ej. cara + PIN). Bloqueo automático lo antes posible.
- **P8.2 En el puesto** (kit INCIBE 06 «Puesto de trabajo», p. 5): bloquear siempre que te levantes: Windows **Win + L**; en móviles y tablets bloqueo de pantalla «en el menor tiempo posible y preferiblemente por contraseña o biométrico»; bloqueo automático por inactividad con ayuda de informática; al terminar la jornada, apagar los equipos y guardar portátiles/móviles bajo llave.
- **P8.3 Biometría en tablet compartida:** ojo. Si varias personas registran su huella en la misma tablet, **todas** abren esa tablet. **[Consejo propio, no extraído de fuente: validar con el responsable de IT del centro]**. En tablets de planta, las huellas deben ser de uso individual o, si es compartida, usar sesiones/usuarios separados.
- **P8.4 Si dejas la sesión abierta:** cualquiera puede actuar a tu nombre (kit puesto de trabajo, p. 5: «enviado un correo electrónico haciéndose pasar por quien no es»).
- **P8.5 Cierre de sesión:** fin de turno = cerrar sesión (no solo bloquear) en equipos compartidos; no guardar contraseñas en el navegador de un equipo compartido.

#### Bloque 9 · Perfiles de acceso y mínimo privilegio en un centro sociosanitario (7 min)
- **P9.1 Definición** (INCIBE): reducir al mínimo el impacto de posibles fallos «reduciendo los permisos de las cuentas de usuario a los necesarios»; «no todos los empleados tienen que poder acceder a toda la información»; revisar periódicamente los permisos; al causar baja, retirar accesos con la misma rigor que se devuelven las llaves (INCIBE, 12-sep-2019).
- **P9.2 Qué dice la AEPD para salud** (Guía profesionales del sector sanitario): acceso a la historia clínica limitado al profesional o equipo directamente implicado en la asistencia; los profesionales de centros sociosanitarios «deben poder acceder a las HC de los pacientes que están tratando»; el acceso «estará limitado únicamente a los datos que sean precisos»; el personal administrativo accede solo a los datos necesarios para su función; estudiantes con perfil limitado (consulta, tiempo). **Además**, guardar registros de acceso (identificación, fecha y hora, qué se accedió, tipo y si fue autorizado o denegado) (p. 16).
- **P9.3 Propuesta de matriz «quién ve qué»** (ilustrativa, **no normativa**; adaptar a cada centro con su DPD): ver tabla en §6.4.
- **P9.4 Qué hacer si ves más de lo que necesitas:** avísalo; no lo uses. Y si cambias de puesto, pide actualizar el perfil.
- **P9.5 Cuentas de administración:** Google exige 2SV para administradores («las cuentas de administrador representan el punto de acceso con mayor privilegio»). Dirección/IT: separar cuenta de administrador y de uso diario (idea INCIBE de limitar administradores «a los estrictamente necesarios»).

#### Bloque 10 · Casos por rol y cierre (7 min)
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

### 3. Datos citados (fuente · enlace · fecha)

#### 3.1 Datos y afirmaciones verificadas

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

#### 3.2 Discrepancias entre fuentes (importante para el redactor)

| Tema | INCIBE/OSI (material antiguo) | AEPD | CCN-CERT BP/35 (2026) | NIST 800-63B-4 (2025) | Recomendación del curso |
|---|---|---|---|---|---|
| Longitud | 8-10 mín. | — | ≥20 (frase) | ≥15 si único factor; ≥8 con MFA | Frase de **16-20+** caracteres |
| Complejidad | mezclar tipos | — | longitud y naturalidad, símbolos intercalados | **prohibido imponer** | No obsesionarse con símbolos; frase larga |
| Cambios | cada 3 meses (OSI 2019/ficha), 6 meses (INCIBE web) | mín. una vez al año | solo si sospecha; política interna por criticidad | **no cambios periódicos** | Cambiar **tras sospecha**; seguir la política del centro si la tiene (ej. anual) |
| Compartir | nunca | evitar | no por correo/mensajería | — | Nunca |
| SMS como 2FA | citado como opción | — | no recomendable | — | Mejor app/aviso/llave |

---

### 4. Vídeos verificados (YouTube)

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

### 5. Material del kit INCIBE utilizable

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

#### Formato del test de INCIBE (para inspirarnos sin copiar)
- 10 preguntas, **tipo test de 4 opciones (a-d), una sola correcta**; sin puntuación ponderada; **tabla de soluciones al final** (p. 6), sin explicación por respuesta.
- Mezcla de estilos: «indica la correcta», «¿cuál es falsa?» (P10), «todas las anteriores» como opción (P1, P6), definiciones («los gestores son…»), y un par de «caso» breve (¿cuál es la contraseña más robusta?).
- Distractores plausibles: confundir «difícil de recordar» con robusto; «compartir si el servicio no es crítico»; «cambiar cada tres meses» como regla; «2FA es dos contraseñas».
- **Puntos del test ya desfasados** que NO conviene heredar: P2 da por correcta «mín. 8 caracteres con números, mayúsculas, minúsculas y símbolos» (hoy: longitud/frase); P7 trata una clave corta con símbolos (`0cT4€Dro1990?`) como «la más robusta» (hoy la frase larga lo sería); P5 d) sugiere cambio cada tres meses como distractor aunque otros materiales INCIBE lo recomiendan (inconsistencia propia del kit).
- Lo que sí mejorar: **añadir explicación a cada respuesta** y feedback inmediato (el SCORM debe tenerlo).

---

### 6. Ideas de actividades interactivas y escenarios

#### 6.1 Actividades

1. **«Simulador de fortaleza» (local, sin enviar datos).** El alumno escribe una clave *de prueba* (no real) y ve una barra con tiempo orientativo y consejos («más larga», «evita tu nombre»). Reglas: cálculo en el navegador, sin red; avisar «no escribas tu contraseña real» (CCN: no verificar claves reales en webs). Comparar 4 casos fijos: `Maria1234`, `M4r14!`, `MiPrimerTurnoFue7EnInvierno!`, `correcto caballo ...` (frases del propio curso). Mostrar *por qué* la larga gana. (Evitar cifras exactas de tiempos; usar «segundos / días / siglos» cualitativos y atribuir.)
2. **«Construye tu frase de paso» (arrastrar y soltar).** Piezas: frase base, número, símbolo, nombre de servicio; el alumno compone y el sistema valida longitud ≥16 y que no use datos personales (lista de «palabras prohibidas»: nombre de mascota, año de nacimiento…). No guardar nada.
3. **«Ordena los pasos para activar la verificación en dos pasos»** (5 pasos de Google: entrar a la cuenta → Seguridad → «Cómo inicias sesión en Google» → activar → elegir método y guardar códigos de respaldo). Tipo `ordenar` del editor.
4. **«Tablet de planta»: decidir qué hacer** (árbol de decisiones): el turno de noche deja la tablet abierta con la sesión de una compañera; ¿qué haces? Opciones: usarla; cerrarla y entrar con tu usuario y avisar; mandarle un WhatsApp con tu clave… Feedback con regla de oro.
5. **Clasificar «algo que sabes / tienes / eres»** (arrastrar a tres cajas): PIN, huella, SMS al móvil, app autenticadora, pregunta secreta, llave USB, cara.
6. **Verdadero/falso rápido «Mitos»:** «Una clave con @ y 1 es siempre segura», «Si tengo 2FA puedo usar 1234», «Compartir clave está bien si es de confianza», «El gestor guarda mi clave en un papel».
7. **Semáforo de Drive:** 6 situaciones de compartir (ficha de residente con «cualquiera con el enlace» = rojo; informe de turno a 3 compañeras concretas con permiso de lector = verde; cuadrante de turnos sin datos personales = amarillo/depende).
8. **«¿Quién ve qué?»:** emparejar rol ↔ permiso mínimo (tabla 6.4).
9. **Test final** con feedback (§7).

#### 6.2 Escenarios por rol (breves, con decisión)

- **Gerocultor/a (turno de noche):** la tablet de planta tiene la sesión de otra compañera abierta; hay una incidencia de un residente a las 3:00. *Respuesta buena:* no actuar con su sesión; cerrar, entrar con la tuya, anotar con tu usuario y avisar a la compañera.
- **Auxiliar de enfermería:** compañera pide «tu clave un momento» porque no ha recibido su alta de usuario. *Buena:* no dar; avisar a supervisión/IT para dar de alta urgente.
- **Enfermería:** recibe «aviso de la dirección» por correo con enlace para «verificar tu contraseña del programa de historias». *Buena:* no abrir; reenviar a IT/seguridad; si hay duda, llamar por teléfono al centro.
- **Administración:** necesita enviar a una gestoría un listado con datos de residentes por Drive. *Buena:* compartir con acceso Restringido a esa persona concreta, rol Lector, y quitar acceso al terminar; nunca «cualquiera con el enlace».
- **Dirección:** una trabajadora que se marcha sigue con acceso. *Buena:* baja inmediata de usuario, retirada de permisos y cierre de sesiones (INCIBE: revocar accesos a las bajas); revisar permisos periódicamente.
- **Supervisión:** descubre un post-it con la clave del PC de la sala común. *Buena:* retirarlo, hablar con el equipo y pedir a IT que cree usuarios individuales; no culpar, corregir el sistema.
- **Mantenimiento:** no usa ordenador del centro, solo un móvil personal con mensajería del centro y el acceso al panel de las cámaras/aire. *Buena:* PIN/bloqueo + 2FA en la app; no compartir el acceso del panel con el proveedor sin autorización; contraseña por defecto del equipo → cambiar (kit INCIBE: «las contraseñas por defecto no son seguras»).
- **Familiar/visita en la sala común:** cuando termines en el PC de la sala común, ¿qué haces? *Buena:* cerrar sesión, borrar descargas, no guardar la clave en el navegador, no dejar abierta la sesión.
- **Personal de suplencias:** primer día; le pasan un papel con un usuario genérico. *Buena:* pedir usuario nombrado en su primer día.

#### 6.3 Mini-casos con trampa (para decisión inmediata)

1. «Tu clave de la tienda online ha salido en una filtración y usabas la misma para el correo del centro.» → cambiar las dos; 2SV; avisar.
2. «Te llega un código de Google que no has pedido.» → no darlo, no pulsar; cambiar clave; avisar.
3. «Te piden por teléfono “el código que te acaba de llegar para confirmar tu identidad”.» → es un fraude; ningún servicio legítimo lo pide (CCN §10.1).

#### 6.4 Matriz propuesta de perfiles mínimos (ilustrativa; **requiere validación por el DPD / responsable de seguridad del centro**)

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

### 7. Preguntas de ejemplo (15) con respuesta y explicación

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

### 8. Lista de fuentes (con URL)

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



---

<!-- Fuente: fuentes/03-correo-fraudes.md -->
## Parte Curso 3 · «Correo, mensajes y fraudes» — Dossier de fuentes y contenidos

Destinatarios: personal de centros sociosanitarios (gerocultores/as, auxiliares, enfermería, administración, dirección, supervisión, mantenimiento), sin conocimientos digitales, en móvil. Duración objetivo: ~1 h 40 min.

Fecha de elaboración: 5 oct 2026. Convención de este dossier:
- **[LEÍDO]** = leído por mí en la página/fichero citado.
- **[SOLO BÚSQUEDA]** = visto solo en el resumen de un buscador; hay que confirmarlo antes de publicarlo.
- **[NO CONFIRMADO]** = no he podido verificarlo.
- Los ejemplos de mensajes del apartado 4 son **inventados por mí** (marcas, dominios y números ficticios). No son avisos reales.

---

### 1. Resumen ejecutivo

1. El engaño por mensaje es la puerta de entrada más habitual al fraude: según INCIBE, en 2025 gestionó 122.223 incidentes (+26 %); el fraude online fueron 45.445 (4 de cada 10) y el phishing encabezó con 25.133. Su línea 017 recibió 142.767 consultas (+44,9 %) y el 28 % de quienes llamaron había recibido phishing, vishing o smishing (INCIBE, 9-feb-2026) [LEÍDO].
2. Todo el curso se apoya en **una sola idea**: *los estafadores no fuerzan la puerta, te piden que se la abras*. Y en **un solo hábito**: **PARA – MIRA – VERIFICA por otro canal – AVISA**.
3. Los canales cambian (correo, SMS, llamada, QR, WhatsApp) pero las **palancas psicológicas** son las mismas: autoridad, ganas de ayudar, miedo a perder algo, miedo a quedar mal, urgencia y «regalo» (INCIBE, 5-sep-2019) [LEÍDO].
4. Reglas de oro del sector: (a) nadie legítimo pide contraseñas ni códigos por mensaje o llamada; (b) cambios de IBAN, pagos «urgentes» y datos de residentes **siempre se verifican llamando a un número conocido**; (c) ante la duda, no pulsar, no abrir, no responder y **preguntar** (responsable / TIC / 017).
5. Si ya has pulsado o dado datos: **no es el fin del mundo, es un asunto de rapidez**. Desconectar, avisar al responsable, cambiar contraseñas, avisar al banco si hubo dinero, guardar pruebas (capturas) y denunciar. Avisar pronto es lo que más ayuda; nunca hay que ocultarlo.
6. Dónde pedir ayuda: **INCIBE 017** (teléfono, WhatsApp 900 116 117, Telegram @INCIBE017; 8:00–23:00, todos los días, gratuito y confidencial [LEÍDO, nota de prensa INCIBE de 31-may-2022; confirmar horario vigente]) y las fuerzas de seguridad (Policía Nacional / Guardia Civil).
7. Contexto del sector: ENISA (informe del sector sanitario, ene 2021–mar 2023) sitúa el ransomware en el 54 % de los incidentes y los datos médicos de pacientes como objetivo en el 30 %; el phishing/ingeniería social aparece como vector en un 4 % según el resumen de INCIBE-CERT. **Ojo con no sobredimensionar**: esa cifra del 4 % no dice que el phishing sea poco importante (la mala configuración es el vector dominante, 68 %), y el ransomware suele empezar por un correo. Úsese con matices (ver §3).
8. Hallazgo sobre el kit local: la carpeta `04_Fraudes` **no contiene** el recurso sobre correo/fraudes (ver §6). Hay que bajarlo de INCIBE o usar solo los pósters/consejos y el tríptico `phishing.pdf`.

---

### 2. Contenido didáctico en bloques (listo para pantallas)

Lenguaje llano, frases cortas, pensado para móvil. Cada bloque = 1-3 pantallas. Tiempos orientativos sumando ~100 min con actividades.

#### Bloque 0 · Por qué esto va conmigo (5 min)
- «En un centro sociosanitario hay cosas que interesan a un estafador: **dinero** (facturas, proveedores, nóminas), **datos de salud** de residentes y **familias** que se preocupan y responden rápido.»
- «No hace falta saber de ordenadores. Hace falta **desconfiar con método**.»
- Idea fuerza: *Te engañan a ti, no al aparato.* Se llama **ingeniería social**: manipular a las personas para que hagan algo que no deberían (INCIBE) [LEÍDO].

#### Bloque 1 · Los 6 trucos con los que te engañan (8 min)
Resumen de las palancas descritas por INCIBE (5-sep-2019) [LEÍDO] con ejemplos del centro:
| Truco | Cómo suena en el centro |
|---|---|
| **Autoridad** | «Soy la directora / Policía / la Seguridad Social, haz esto ya.» |
| **Ayudar** | «Soy de informática, dame tu clave para arreglarlo.» «Soy tu compañera, ¿me cubres el turno?» |
| **Miedo a perder algo** | «Tu cuenta de correo se bloqueará en 8 horas.» |
| **Miedo a quedar mal** | «Tengo fotos tuyas…» (sextorsión) |
| **Gratis / premio** | «Has ganado un vale.» |
| **Urgencia** | «Hazlo ahora, no se lo digas a nadie.» (la urgencia sirve para que no tengas tiempo de pensar) |
Mensaje: *si un mensaje te mete prisa, miedo o secreto, ya hay una señal de alarma.*

#### Bloque 2 · Los nombres (y los canales) sin jerga (6 min)
- **Phishing**: mensaje falso (normalmente correo) que simula venir de alguien de confianza para robar datos o infectar. Los atacantes pueden usar también SMS, telefonía, redes sociales y mensajería (tríptico INCIBE «Phishing», kit) [LEÍDO].
- **Spear phishing**: el mismo engaño pero **personalizado** (usa tu nombre, tu puesto, tu centro). Es más creíble. *Nota: la definición de spear phishing se ha tomado de conocimiento general; en las fuentes leídas INCIBE habla de «farming» = ataques dirigidos de varias interacciones, p. ej. fraude del CEO (INCIBE, 5-sep-2019) [LEÍDO].*
- **Smishing**: por SMS o mensajería (INCIBE: «SMS + phishing») [LEÍDO].
- **Vishing**: por llamada telefónica; suplantan a un banco, un técnico, etc. [LEÍDO].
- **Quishing**: por **código QR**. INCIBE ha avisado de campañas de correo con QR que llevan a un falso inicio de sesión de Microsoft (aviso 8-ago-2023) y de QR pegados sobre los originales en lugares públicos [LEÍDO].
- **Fraude del CEO / BEC**: un «jefe» pide por correo una transferencia urgente y confidencial; BEC = cuenta de correo comprometida de verdad (INCIBE, 3-jul-2025) [LEÍDO].
- **Sextorsión**: chantaje con «vídeos íntimos» que no existen (INCIBE, act. 27-mar-2025) [LEÍDO].

#### Bloque 3 · Cómo reconocer un correo falso: 7 señales (12 min)
Basado en INCIBE «Día Mundial del Correo» (8-oct-2019) y «Conoce a fondo el phishing» [LEÍDO]. Mnemotecnia propuesta: **R-E-S-U-A-D-O**… mejor una más simple en 7 preguntas:
1. **¿Quién lo envía de verdad?** Mira la dirección completa, no solo el nombre. Dominios casi iguales (una letra cambiada) o `@gmail.com` en nombre de una empresa. (Ver spoofing: la dirección puede incluso falsificarse; INCIBE explica cómo ver las cabeceras, pero para este público basta «si algo no cuadra, verifica por otro canal».)
2. **¿Me llama por mi nombre?** «Estimado cliente / usuario» = señal.
3. **¿Me mete prisa o miedo?** «En 8 horas se bloqueará…» = señal.
4. **¿Hay faltas o frases raras?** Ortografía y redacción extrañas.
5. **¿Qué enlace esconde?** Comprobar el destino antes de pulsar (en ordenador, pasar el ratón por encima; en móvil, **mantener pulsado** el enlace para ver la dirección — *técnica en móvil: conocimiento general, no leída en las fuentes INCIBE; validar con captura en Android/iPhone antes de publicar*). INCIBE añade: una entidad legítima rara vez manda enlaces en sus comunicaciones oficiales.
6. **¿Trae un adjunto que no esperaba?** Extensiones de riesgo citadas por INCIBE: `.exe`, `.vbs`, `.docm` y comprimidos `.zip`/`.rar` de origen desconocido.
7. **¿Pide algo que esa entidad no pide?** Contraseñas, códigos, datos bancarios, «confirmar identidad».
Regla: *una señal = sospecha; dos = no lo toques.*

#### Bloque 4 · Comprobar un enlace sin pulsarlo (6 min)
- En ordenador: ratón encima → leer la dirección que aparece abajo (INCIBE) [LEÍDO].
- En móvil: mantener pulsado (validar, ver arriba).
- En vez de pulsar: **escribir tú la dirección** de la entidad en el navegador o usar su app oficial (tríptico INCIBE) [LEÍDO].
- Antes de meter datos: dirección que empiece por `https://` y candado, **pero** INCIBE advierte que «https» también puede ser manipulado: el candado **no** garantiza que sea la web real [LEÍDO, INCIBE «¿Qué es el smishing?»].
- Ojo con enlaces acortados (bit.ly y similares) en SMS (INCIBE lo cita entre las señales del smishing [LEÍDO]).

#### Bloque 5 · Adjuntos peligrosos (5 min)
- Un adjunto **inesperado**, aunque venga de un conocido, es sospechoso: su cuenta puede estar comprometida (INCIBE, mensajes de mensajería) [LEÍDO].
- Facturas, «albaranes», «resultados», «burofax», «documento escaneado» son los disfraces típicos. INCIBE ha publicado campañas con «supuestas facturas» y falsos comunicados de la AEAT con `.zip` (aviso 25-mar-2022) [LEÍDO el de la AEAT].
- Si ya lo abriste, ver Bloque 12.

#### Bloque 6 · Correo corporativo vs. personal (4 min)
- El correo **del centro** es para el trabajo; el personal (gmail, etc.) no se usa para asuntos del centro ni se reenvían datos de residentes.
- Si llega a tu correo **personal** un mensaje que «es del centro» o «de la dirección» → ya es sospechoso.
- No usar el correo corporativo para darse de alta en webs personales.
- *(Reglas internas concretas dependen de cada centro; el dossier solo propone el principio.)*

#### Bloque 7 · SMS y llamadas: smishing y vishing (8 min)
- Paquetería («tu paquete está retenido, pulsa aquí»): INCIBE (29-mar-2023) recomienda verificar con la empresa por su web oficial, no instalar apps desde enlaces del SMS y desconfiar de la urgencia [LEÍDO].
- Falso «soporte técnico»: INCIBE avisa de llamadas de un supuesto técnico (p. ej. de Microsoft) que pide instalar una herramienta de acceso remoto como AnyDesk y darle el código [SOLO BÚSQUEDA; el aviso concreto no lo he leído completo].
- Pretextos de vishing que lista INCIBE (25-ago-2020): concurso o lotería, tarjeta regalo, premio, soporte técnico [LEÍDO]. También hacerse pasar por banco.
- Regla: **cuelga** y llama tú al número oficial de la entidad. Un banco o la Administración no te pide claves por teléfono.
- Suplantación del número de teléfono (spoofing): el número que ves puede ser falso (INCIBE, blog «Spoofing telefónico») [SOLO BÚSQUEDA].

#### Bloque 8 · Códigos QR (4 min)
Recomendaciones INCIBE [LEÍDO / SOLO BÚSQUEDA según indicado]: no escanear QR no esperados llegados por correo [LEÍDO]; comprobar que no es una pegatina sobre el original [SOLO BÚSQUEDA]; mirar la dirección que muestra el móvil antes de abrirla [LEÍDO, resumen: «previsualizar»]; sospechar si no es del dominio del servicio [SOLO BÚSQUEDA]. Caso real 017: suscripción premium no deseada tras escanear el QR del menú de un restaurante (INCIBE, casos reales, 04-ago-2026) [LEÍDO el título en el listado; no he leído el caso].

#### Bloque 9 · Dinero y proveedores: fraude del CEO y falsa factura (10 min) — *especial administración/dirección/supervisión*
- Fraude del CEO (INCIBE, 3-jul-2025) [LEÍDO]: correo del «jefe» pidiendo transferencia **urgente y confidencial** («hazla antes de las 14:00, confío en tu discreción», «estoy en una reunión, no puedo hablar»). Variantes: tarjetas regalo, whaling, falsa incorporación, deepfake de voz/vídeo.
- Cambio de IBAN: caso real INCIBE «Historias reales: suplantaron a mi proveedor…» [LEÍDO]: correo con PDF pidiendo cambiar la cuenta bancaria; el comprador actualizó el dato, pagó, y el proveedor nunca recibió el dinero. Señal: petición **inusual** de cambiar los datos de pago.
- Medidas de INCIBE: verificar por **otro canal** (llamada a un teléfono ya conocido), comprobar la dirección letra a letra, **doble control** (dos personas autorizan transferencias a partir de cierto importe), procedimiento claro para cambios de IBAN.
- Si ya se pagó: **llamar al banco inmediatamente**, denunciar, llamar al 017 (INCIBE) [LEÍDO]. *(El plazo útil para que el banco intente recuperar el dinero es corto: hacerlo el mismo día; la cifra concreta de horas no la he leído en fuente oficial.)*

#### Bloque 10 · WhatsApp y mensajería (10 min)
- **«Hola mamá, mi teléfono se ha roto»**: SMS o WhatsApp de un «hijo/a» desde un número nuevo que acaba pidiendo dinero urgente (transferencia o Bizum). INCIBE (aviso y blog de abr-2026) [LEÍDO]. Señales: número desconocido, faltas y acentos ausentes, urgencia emocional, secreto. Cómo verificar: **llamar al número de siempre** y/o preguntar algo que solo el familiar sabría.
- **Robo de la cuenta de WhatsApp**: te llaman o escriben (falso repartidor, falso «soporte de WhatsApp») y te piden **el código de 6 cifras** que te llega por SMS. Con él se quedan tu cuenta (INCIBE, casos reales, 10-sep-2024 y «Así te roban WhatsApp con la excusa de un paquete urgente») [LEÍDO].
  - **Regla**: *el código de verificación no se da a nadie, nunca.*
  - Activar la **verificación en dos pasos** de WhatsApp (INCIBE) [LEÍDO].
  - Si te la roban: avisar a tus contactos, escribir a support@whatsapp.com, denunciar el número, denuncia policial si hay suplantación [LEÍDO].
- En el trabajo: **no se facilita información de residentes por WhatsApp** a «la familia» sin comprobar quién es y sin seguir el protocolo del centro (ver escenarios, §7).

#### Bloque 11 · Estafas «de moda»: paquetería, Correos, Seguridad Social, AEAT, DGT, sextorsión (8 min)
- Paquetería/Correos: ver Bloque 7.
- AEAT: INCIBE avisó de correos y SMS que suplantan a la Agencia Tributaria («Comprobante fiscal digital…», «Tu factura está disponible», descarga de `.zip`) (25-mar-2022) [LEÍDO].
- DGT / Seguridad Social: la Policía Nacional ha difundido avisos sobre SMS falsos de la DGT (vídeo en TikTok de @policia) [SOLO BÚSQUEDA; no leído]. **No he leído ningún aviso oficial concreto sobre Seguridad Social**; si se quiere incluir, buscar el aviso actual en INCIBE o en la propia Seguridad Social. Regla general: la Administración no pide datos bancarios por SMS; se entra por su **sede electrónica** escribiendo la dirección.
- **Sextorsión**: correo con «tengo tus vídeos, paga en bitcoin en 48 h». No tienen nada. Si no pagaste: bloquear y borrar. Si pagaste: guardar pruebas, denunciar y llamar al 017 (INCIBE, act. 27-mar-2025) [LEÍDO]. No responder: confirmas que tu cuenta está activa.
- **Estafas a familiares de residentes**: *no he encontrado una fuente oficial específica sobre estafas dirigidas a familiares de residentes de centros sociosanitarios* [NO CONFIRMADO]. Lo que sí está documentado por INCIBE es la estafa del «familiar en apuros» y el vishing a personas mayores con pretexto de herencia (caso real 017, listado, sin leer el caso completo). Para el curso conviene plantearlo como **escenario hipotético** (ej. 6 y 9) y recomendar que el centro avise a las familias de que **nunca** pedirá pagos ni datos por SMS/WhatsApp.

#### Bloque 12 · «He picado»: qué hacer (10 min)
Pasos según INCIBE («Conoce a fondo el phishing» y avisos) [LEÍDO / síntesis de búsqueda]:
1. **Tranquilidad y rapidez.** Avisar de inmediato al responsable/TIC. *Nadie se enfada por avisar; sí por callar.*
2. Si **solo abriste el correo** o no descargaste nada: no pasa nada por sí solo; no pulses nada más; avisa, bloquea y borra.
3. Si **pulsaste un enlace** y no pusiste datos: cierra la página; avisa.
4. Si **escribiste usuario/contraseña**: cambia la contraseña (y la de cualquier otro servicio donde fuera igual) desde un dispositivo fiable; avisa al responsable.
5. Si **abriste/ejecutaste un adjunto**: **desconecta el equipo de la red**, no lo apagues a lo loco (según protocolo), avisa; pasa antivirus; si persiste, restaurar de fábrica (INCIBE) [SOLO BÚSQUEDA para el orden exacto].
6. Si **diste datos bancarios o pagaste**: llama al **banco** de inmediato (INCIBE) [LEÍDO].
7. **Guarda pruebas** (capturas del mensaje, número, enlace) para la denuncia [LEÍDO].
8. Si afecta a **datos de residentes**: avisar al responsable de protección de datos del centro. Un incidente con datos personales puede ser una **brecha** que el responsable del tratamiento debe notificar a la AEPD **en un máximo de 72 horas desde que tiene conocimiento** [SOLO BÚSQUEDA, resultado aepd.es; las páginas de la AEPD que intenté leer dieron error: confirmar en la guía AEPD «Guía para la notificación de brechas de datos personales», jun-2021]. Por eso **avisar rápido** es clave.

#### Bloque 13 · Dónde consultar y denunciar (5 min)
- **INCIBE 017**: teléfono 017, WhatsApp 900 116 117, Telegram @INCIBE017; gratuito y confidencial; asesoramiento técnico, psicosocial y legal (INCIBE, 31-may-2022) [LEÍDO]. Hay un **formulario de reporte de fraude** (INCIBE-CERT) donde se puede enviar captura/URL sin abrir nada (INCIBE «Reporte de fraude») [LEÍDO]. En la web de INCIBE figura también el horario 8:00–23:00 [LEÍDO]; una web de terceros daba 9:00–21:00 [no oficial, descartada]: confirmar antes de publicar.
- **OSI (Oficina de Seguridad del Internauta)**: sus contenidos están ahora integrados en `incibe.es/ciudadania` (la URL `osi.es/es/campanas/phishing` redirige 301 a INCIBE) [LEÍDO]. Avisos de fraude: `osi.es/es/actualidad/avisos/fraude` [SOLO BÚSQUEDA].
- **Policía Nacional**: portal de denuncias `policia.es/_es/denuncias.php` [LEÍDO: confirma que hay denuncia digital; **plazos de ratificación no confirmados**]; Brigada Central de Investigación Tecnológica [SOLO BÚSQUEDA, web de terceros].
- **Guardia Civil**: Grupo de Delitos Telemáticos, portal `gdt.guardiacivil.es` [NO CONFIRMADO: el dominio no se pudo abrir desde mi herramienta].
- **Banco**: siempre, si hubo dinero.
- **AEPD**: para brechas de datos y para reclamar si WhatsApp no responde (INCIBE) [LEÍDO].

#### Bloque 14 · Resumen: PARA – MIRA – VERIFICA – AVISA (3 min)
- **PARA**: no pulses ni respondas.
- **MIRA**: remitente, prisa, enlace, adjunto, qué pide.
- **VERIFICA** por **otro canal** conocido (llamar al número de siempre).
- **AVISA** al responsable y, si hace falta, al 017.

---

### 3. Datos citados (fuente + enlace + fecha)

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

### 4. Ejemplos de mensajes fraudulentos y legítimos (inventados)

> Todos los nombres, dominios y teléfonos son **ficticios**. Para la actividad «¿legítimo o fraude?» y «marca las señales». Señales: 🚩 = presente. Los textos están pensados para pantalla de móvil.

#### Ejemplo 1 — Correo «de la mutua» (FRAUDE)
**De:** Mutua Salud Laboral <avisos@mutua-saludlaboral-gestion.com>
**Asunto:** URGENTE: Su baja será anulada en 24 h
> Estimado trabajador:
> Hemos detectado un error en los datos de su parte de baja. Si no lo corrige en 24 horas su prestación quedará **suspendida**.
> Acceda aquí para actualizar sus datos y su DNI: https://mutua-saludlaboral-gestion.com/verifica
> Adjuntamos formulario (Formulario_baja.zip)
> Atentamente, Departamento de Prestaciones

Señales: 🚩 dominio que no es el de la mutua · 🚩 «Estimado trabajador» (genérico) · 🚩 plazo de 24 h / amenaza · 🚩 pide DNI y datos · 🚩 adjunto `.zip` · 🚩 enlace que no es la web oficial.
Cómo se haría bien: la mutua te contacta por su **app/web** que tú ya usas, o llamas tú al teléfono oficial.

#### Ejemplo 2 — Correo «factura del proveedor de pañales» con cambio de IBAN (FRAUDE)
**De:** Rosa Mena <rosa.mena@suministros-delnorte.co> (el proveedor real usa `.es`)
**Asunto:** RE: Factura septiembre – NUEVOS DATOS BANCARIOS
> Buenos días Marta, por cambio de entidad, a partir de hoy el pago de nuestras facturas debe hacerse a la cuenta ES00 0000 0000 00 0000000000 (IBAN ficticio). Adjunto factura (Factura_0924.pdf.exe) y certificado. Por favor confirme hoy la actualización para no retrasar el servicio. Gracias.

Señales: 🚩 dominio distinto (`.co` vs `.es`) · 🚩 **cambio de IBAN por correo** · 🚩 prisa «hoy» · 🚩 adjunto con doble extensión `.pdf.exe` · 🚩 el hilo «RE:» puede ser falso.
Correcto: llamar al proveedor a su teléfono **conocido** y que un segundo responsable valide el cambio (INCIBE: verificación por otro canal + doble control).

#### Ejemplo 3 — Correo «de la directora» (fraude del CEO) (FRAUDE)
**De:** Directora Elena Ruiz <direccion.centro@gmail.com>
**Asunto:** (sin asunto)
> Marta, estoy en una reunión y no puedo hablar. Necesito que hagas una transferencia de 4.800 € ahora mismo a un proveedor. Es confidencial, no lo comentes con nadie. Te paso el IBAN por aquí. Te lo agradezco, confío en tu discreción. Enviado desde mi iPhone

Señales: 🚩 cuenta personal (`gmail`) en lugar de la corporativa · 🚩 «no puedo hablar» · 🚩 urgencia · 🚩 secreto · 🚩 salta el procedimiento de pagos. (Frases tomadas del patrón descrito por INCIBE.)

#### Ejemplo 4 — SMS de paquetería (FRAUDE)
> Correos: Su paquete #ES48392 no pudo entregarse. Confirme la dirección y pague 1,29 € de tasa en: https://correos-envios.info/pago

Señales: 🚩 pide un pago pequeño · 🚩 dominio `.info` ajeno a Correos · 🚩 no esperabas ningún paquete · 🚩 pide datos de tarjeta · 🚩 prisa implícita.

#### Ejemplo 5 — WhatsApp «cambio de turno» desde número desconocido (FRAUDE)
Número no guardado, +34 6xx xxx xxx, foto de perfil de la supervisora:
> Hola Marta, soy Elena, he cambiado de móvil. Necesito que me ayudes con una cosa del cuadrante, ¿me puedes enviar el código que te llegue por SMS? Es para entrar en la app de turnos. Rápido porfa que llego tarde

Señales: 🚩 número nuevo · 🚩 foto copiada · 🚩 **pide un código de SMS** · 🚩 prisa · 🚩 favor «pequeño». (Patrón de robo de cuenta: INCIBE, 10-sep-2024.) Verificación: llamar al número de siempre de la supervisora.

#### Ejemplo 6 — WhatsApp «hija de un residente» pide información (FRAUDE / dudoso)
Número desconocido:
> Buenas tardes, soy la hija del Sr. Pedro Gil de la habitación 12. Mi padre me ha dicho que ayer lo vio el médico. ¿Me puedes pasar la analítica y la medicación que toma por aquí? Estoy en el extranjero y no puedo llamar. Es urgente.

Señales: 🚩 no se puede verificar la identidad · 🚩 pide **datos de salud** por WhatsApp · 🚩 urgencia/emoción · 🚩 «no puedo llamar». Actuación: no facilitar nada; seguir el protocolo del centro (identificación y canal autorizado, dirección/enfermería). *Es un escenario plausible, no un aviso oficial documentado.*

#### Ejemplo 7 — Llamada «soporte técnico» (vishing) (FRAUDE)
Voz amable, número que parece de Madrid:
> Buenos días, le llamo del servicio técnico de Microsoft. Hemos detectado que el ordenador de recepción está infectado y enviando datos de residentes. Para arreglarlo ahora, descargue esta aplicación (AnyDesk) y dígame el código que aparece. Si no lo hacemos hoy, le bloquearán el equipo.

Señales: 🚩 llamada **no solicitada** · 🚩 miedo («infectado») · 🚩 pide **instalar acceso remoto** · 🚩 prisa/amenaza. (Patrón descrito por INCIBE.)

#### Ejemplo 8 — Correo con QR (quishing) (FRAUDE)
**De:** Servicio de Seguridad TI <seguridad@centro-sociosanitario.net> (el centro usa `.es`)
**Asunto:** Verificación obligatoria de su cuenta de correo
> Para mantener su acceso debe verificar su identidad. Escanee el siguiente código QR con su móvil antes de las 18:00. *[imagen de un QR]*

Señales: 🚩 dominio parecido pero no igual · 🚩 QR en vez de enlace (para saltar filtros) · 🚩 plazo · 🚩 pide verificar la cuenta. (Patrón INCIBE, 8-ago-2023.)

#### Ejemplo 9 — Correo «resultados de analítica de un residente» (FRAUDE)
**De:** Laboratorio Clínico Regional <resultados@lab-clinico-resultados.com>
**Asunto:** Resultados analítica residente J.M.G. – confidencial
> Adjuntamos los resultados de la analítica del residente. Para visualizarlos, habilite el contenido del documento adjunto y use la contraseña que figura en el siguiente mensaje. Resultados.docm

Señales: 🚩 no esperabas resultados / no es el canal habitual del laboratorio · 🚩 adjunto `.docm` (macros; extensión de riesgo citada por INCIBE) · 🚩 «habilitar contenido» · 🚩 dominio no corporativo · 🚩 asunto con inicial de residente (usa datos para parecer real).

#### Ejemplo 10 — SMS «Seguridad Social/AEAT» + sextorsión (FRAUDE)
SMS: > Agencia Tributaria: tiene una devolución pendiente de 312,45 €. Solicítela en https://aeat-devoluciones.top/ver antes del viernes.
Señales: 🚩 la AEAT no pide datos por enlace de SMS · 🚩 dominio `.top` · 🚩 dinero «gratis» · 🚩 plazo. (INCIBE documentó correos y SMS suplantando a la AEAT, 25-mar-2022.)

#### Mensajes LEGÍTIMOS para contraste
**L1 — Aviso interno del centro (legítimo).** De: `coordinacion@[dominio-del-centro]` (el real, conocido). «Recordatorio: mañana a las 10:00 formación en la sala 2. Sin enlaces ni adjuntos. Si tienes dudas, llama a coordinación.» → Canal habitual, dominio correcto, nada que pulsar, no pide datos.
**L2 — Banco/mutua que NO pide datos (legítimo).** SMS de tu banco con un aviso de operación: «Compra 45 € en [comercio]. Si no la reconoces, llama al teléfono de la tarjeta (el de la parte de atrás)». → Llega por el hilo habitual, **no trae enlace**, no pide claves, invita a llamar a un número que ya tienes.
**L3 — Proveedor real con cambio verificado.** El proveedor llama por teléfono a administración y avisa de que enviará un cambio de datos; administración **devuelve la llamada al número del contrato**; después llega el correo desde el dominio habitual y un segundo responsable valida. → Verificación por doble canal.
**L4 — Llamada de la familia que sí es real.** Una hija llama al **teléfono del centro**, pregunta por la dirección y es el centro quien, tras identificarla según protocolo, le explica lo que está permitido. → El centro controla el canal y la identidad.
**Idea para la actividad «¿legítimo o fraude?»**: mezclar 4 legítimos y 6-8 fraudes; añadir **un legítimo con apariencia sospechosa** (p. ej., correo interno con enlace corto) para enseñar que la decisión se toma **verificando**, no «a ojo».

---

### 5. Vídeos verificados (oEmbed)

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

### 6. Material del kit utilizable (rutas)

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

### 7. Ideas de actividades interactivas y escenarios por rol

#### Actividades (encajan con interacciones habituales de SCORMEditor)
1. **«¿Legítimo o fraude?»** (clasificar tarjeta a tarjeta) con los 10 fraudes + 4 legítimos del §4. 8-10 min.
2. **«Marca las señales»** sobre una imagen/captura simulada del correo (zonas pulsables: remitente, saludo, plazo, enlace, adjunto). Usar ejemplos 1, 2, 8, 9. 10 min.
3. **Ordenar los pasos «He picado»**: avisar → desconectar → cambiar clave → banco → guardar pruebas → denunciar. 5 min.
4. **Emparejar** canal ↔ nombre (correo=phishing, SMS=smishing, llamada=vishing, QR=quishing) y truco ↔ ejemplo (autoridad, urgencia…). 5 min.
5. **Escenario ramificado «El correo de la directora»** (administración): 3 decisiones (pagar / llamar / avisar) con consecuencias. 8 min.
6. **Escenario ramificado «La familia pide la analítica por WhatsApp»** (enfermería/supervisión). 8 min.
7. **Rellenar huecos**: «El código de WhatsApp que te llega por SMS no se da a _______.» 3 min.
8. **Verdadero/falso** de mitos (el candado = web segura; «si el remitente es conocido, es seguro»; «solo los ordenadores se infectan»). 5 min.
9. **Autoevaluación final**: 10 preguntas del §8.

#### Escenarios por rol
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

### 8. Preguntas de ejemplo (12) con respuesta y explicación

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

### 9. Fuentes (URL)

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



---

<!-- Fuente: fuentes/04-puesto-dispositivos-redes.md -->
## Parte Curso 4 · «Mi puesto de trabajo, mis dispositivos y mis redes» — Dossier de fuentes y contenido

Programa de ciberseguridad para trabajadores de centros sociosanitarios. Público: gerocultores/as, auxiliares, enfermería, administración, dirección, supervisión y mantenimiento, sin conocimientos digitales, en móvil. Objetivo de duración: ~1 h 40 min.

Fecha de elaboración: 5 oct 2026. Convención de este dossier:
- **[LEÍDO]** = leído por mí en la fuente (web, PDF o kit local) durante esta investigación.
- **[SECUNDARIA]** = solo visto a través de un resumen de buscador o web de terceros; hay que confirmarlo antes de publicarlo como dato.
- **[SIN CONFIRMAR]** = conocimiento general del sector que no he podido contrastar con una fuente leída. No usar como dato citado.
- Las fechas son las de publicación que muestra la propia página, salvo que se indique otra cosa.

---

### 1. Resumen ejecutivo

1. El curso cubre 12 grandes áreas. La base oficial más sólida es el **kit de concienciación de INCIBE** (carpetas 06, 07 y 08: puesto de trabajo I y II, y móviles/BYOD/teletrabajo), que ya trae contenido, tests y consejos gráficos listos. Cubre bien: mesa limpia, bloqueo de sesión, actualizaciones, antivirus/firewall, documentación sensible, software legítimo, USB, incidentes, móviles, wifi pública, VPN, BYOD, robo/pérdida y teletrabajo doméstico.
2. **Huecos del kit** que hay que cubrir con otras fuentes: tablets/ordenadores compartidos de planta, shadow IT, wifi de invitados vs. corporativa, copias 3-2-1, Google Drive, seguridad física (tailgating, cuartos de comunicaciones, cámaras, domótica, IoMT), destrucción de papel y falsos técnicos. Encontré fuentes oficiales para casi todos (INCIBE, AEPD, ENISA). Para **tablets compartidas de planta** y **tailgating en centros sociosanitarios** no hay una fuente oficial específica leída: el contenido se construye por analogía con las pautas generales y debe llevar la etiqueta «buena práctica propuesta».
3. Mensajes clave (todos con respaldo oficial leído): bloquear siempre al alejarse (Win+L); nada de contraseñas en post-it; actualizar y mantener antivirus y cortafuegos activos; **no usar USB desconocidos** (INCIBE, jul 2022); solo software legítimo y de tiendas oficiales; no usar wifi pública con dispositivos de trabajo, usar datos móviles o VPN; cambiar claves por defecto de router/IoT; separar la wifi de invitados; avisar de inmediato ante pérdida o robo; destruir papel con trituradora; no enviar datos de salud por WhatsApp sin criterio (guía AEPD sector sanitario).
4. Dato de contexto sanitario (ENISA, 5 jul 2023): el 54 % de las amenazas en el sector salud de la UE son ransomware; el 80 % de organizaciones sanitarias encuestadas reportó incidentes relacionados con vulnerabilidades en software o hardware; solo el 27 % tiene un programa específico contra ransomware. Útil para el «por qué importa», con la cautela de que son datos de 2021-2023 y europeos.
5. **Vídeos**: 6 verificados por oEmbed y por la ficha de YouTube (todos de la Oficina de Seguridad del Internauta, canal oficial de INCIBE), de 2:36 a 4:33, más 3 opcionales. No encontré vídeos oficiales cortos y verificables sobre USB, VPN, ingeniería social presencial ni robo de móvil de INCIBE/OSI; se proponen alternativas verificadas de INCIBE (2015-2021) con la advertencia de antigüedad.
6. **Estructura propuesta de ~100 min**: 12 bloques de 6-10 minutos (sección 2), con 5 actividades interactivas y un test final de 12 preguntas (sección 7).
7. Lo que NO se ha podido confirmar está listado en la sección 9.

---

### 2. Contenido didáctico en bloques (listo para pantallas)

Lenguaje llano, frases cortas. Tiempo orientativo por bloque. Los ejemplos de centro sociosanitario son propuestas didácticas mías, no datos de fuente.
Cada bloque indica en «Respaldo» la fuente que sustenta las afirmaciones normativas o técnicas.

#### Bloque 0 · Bienvenida: ¿qué es «mi puesto» y por qué importa? (5 min)
**Texto de pantalla.** Tu puesto de trabajo es todo lo que usas para hacer tu trabajo: la mesa o el mostrador, el ordenador, la tablet de planta, el móvil, el papel y la wifi. Los ciberdelincuentes no siempre atacan desde lejos: a veces basta con un ordenador sin bloquear, un USB que alguien encontró, o una persona con chaleco que dice ser «el técnico».
**Datos de contexto** (citar con fuente, sección 3): ENISA 2023, sector salud.
**Respaldo.** INCIBE, kit 06 p. 3: riesgos del puesto (papel al alcance de cualquiera, accesos no autorizados a dispositivos, malware, robo de información) **[LEÍDO]**.

#### Bloque 1 · Puesto limpio y bloqueo de pantalla (8 min)
- **Mesa limpia**: al terminar o al levantarte, guarda lo que tenga datos de residentes (listados, hojas de turno, partes, recetas) fuera de la vista.
- **Sin claves en post-it** (ni en la pantalla, ni bajo el teclado).
- Los USB o discos que se puedan desconectar se guardan fuera del alcance de otros cuando no estás.
- **Bloquea siempre que te levantes**: en Windows, tecla Windows + L (kit 06 p. 5). En móvil/tablet, bloqueo de pantalla con el menor tiempo posible, con contraseña o huella (kit 06 p. 5; kit 08 p. 7).
- Al terminar la jornada: equipos apagados; portátiles y móviles bajo llave.
- **Ejemplo de centro**: la sala de enfermería se queda 2 minutos vacía porque suena una llamada de timbre. En ese rato una visita o un residente con deambulación puede ver la pantalla con la medicación de otra persona. «Win+L» tarda un segundo.
**Respaldo.** Kit 06 pp. 4-5 **[LEÍDO]**.
**Salvedad.** Para ordenadores de planta compartidos hay un compromiso práctico (se bloquea o cierra sesión, ver bloque 2); la solución concreta depende de cada centro.

#### Bloque 2 · Ordenadores y tablets de planta compartidos (10 min) — foco gerocultores
> Fuente específica sobre equipos compartidos en centros sociosanitarios: **no encontrada**. Las pautas siguientes derivan de las generales (INCIBE kit 06/08: cuentas con privilegios mínimos, bloqueo, contraseña robusta, no «recordar contraseña»). Etiquetar como «buena práctica propuesta».
- Si el equipo es compartido, cada persona entra **con su propio usuario** (cuando el centro lo permita). El kit 08 p. 7 recomienda cuentas de usuario con los privilegios mínimos necesarios y contraseña robusta **[LEÍDO]**.
- **No marcar «Recordar contraseña»** (kit 08 p. 10 **[LEÍDO]**): en una tablet compartida, quien la coja después entra como tú.
- **Cerrar sesión al terminar tu turno**, no solo bloquear.
- No apuntar datos del residente en notas, fotos o chats del propio aparato.
- Si la tablet tiene el seguimiento de residentes (ducha, cambios posturales, constantes, etc.), usa solo la aplicación autorizada; no instales otras ni uses el navegador para cosas personales.
- Si la tablet se pierde, se rompe o se queda sin batería: avisar al responsable (ver bloque 10).
**Ejemplo de centro**: la tablet de planta tiene abierta la sesión de «Marta» (turno de mañana). El turno de tarde registra cambios posturales con la sesión de Marta: el registro queda a su nombre. Es un problema de **trazabilidad** y de responsabilidad personal.
**Nota**. La afirmación de que el registro queda a nombre del otro es una consecuencia lógica del uso de una sesión ajena, no una cita de fuente.

#### Bloque 3 · Actualizaciones y antivirus (8 min)
- Un equipo sin actualizar tiene «puertas abiertas» conocidas que los delincuentes explotan.
- Activa las **actualizaciones automáticas** (kit 06 p. 6). Si el aparato es del centro, las gestiona informática: **no cierres ni pospongas indefinidamente** el aviso de reinicio.
- El **antivirus** detecta y elimina el código malicioso; el **cortafuegos** controla lo que entra y sale de Internet. Se necesitan los dos y no se estorban (kit 06 p. 7).
- «Cuando el antivirus suena, el malware llega»: si salta un aviso, **no lo ignores**: avisa a informática (cartel INCIBE 0701).
- También en el móvil: el kit 08 p. 6 recomienda antivirus en el móvil con detección de webs fraudulentas **[LEÍDO]**.
**Respaldo.** Kit 06 pp. 6-7; kit 08 p. 6; OSI (vídeos «Pasos para actualizar tu ordenador Windows y Mac» y «Pasos para actualizar tu móvil y tablet Android e iOS»).

#### Bloque 4 · USB y dispositivos externos desconocidos (8 min)
- **No conectar USB desconocidos** al trabajo: INCIBE (blog, 19 jul 2022) dice que no deben utilizarse en el ámbito laboral bajo ningún concepto, en especial los promocionales o de origen desconocido, porque podrían contener malware deliberadamente **[LEÍDO]**.
- Si encuentras un USB (en el aparcamiento, en la sala de personal, en una mesa): **no lo conectes**, no lo «pruebes para ver de quién es». Se entrega al responsable o a informática.
- Si el centro permite USB propios, información sensible **cifrada** (kit 07 p. 7) y avisar de inmediato si se pierde (kit 07 p. 7).
- Cargar el móvil: usar el cargador propio y enchufe, no puertos USB desconocidos. **[SECUNDARIA]** (la noticia de Merca2 de 12 sep 2025 atribuye este aviso a INCIBE; no lo he podido leer en INCIBE, no citarlo como dato oficial hasta confirmarlo).
**Respaldo.** INCIBE blog «¡La seguridad en movimiento! Protege tus dispositivos extraíbles», 19 jul 2022 **[LEÍDO]**; kit 07 p. 7 **[LEÍDO]**.

#### Bloque 5 · Descargas y software no autorizado («shadow IT») (7 min)
- «Shadow IT» en llano: **usar programas, apps o servicios que nadie del centro ha aprobado** (p. ej. una app de mensajería, un conversor de PDF online, un Drive personal) porque «es más cómodo».
- El kit 07 p. 6: instalar software sin licencia o «pirata» puede acarrear sanciones y suele traer malware (anuncios, programas modificados o «cracks» infectados) **[LEÍDO]**. El kit 08 p. 9: apps solo de la tienda oficial (App Store o Play Store) y en ordenador desde la web oficial del fabricante **[LEÍDO]**.
- Los equipos del centro se usan solo para trabajo (kit 07 p. 5): no webs de descargas, juegos ni contenido dudoso **[LEÍDO]**.
- Una app pide demasiados permisos (cámara, contactos, ficheros)? Desconfía (kit 08 p. 5).
- Si necesitas una herramienta nueva: **pídela a informática o a dirección**, no la instales por tu cuenta.
**Respaldo.** Kit 07 pp. 5-6; kit 08 pp. 5 y 9; cartel INCIBE 0702 «Siempre software legítimo. No seas pirata».

#### Bloque 6 · Wifi: del centro, de invitados, públicas y hotspot (10 min)
- **Wifi corporativa**: la del trabajo, para dispositivos del centro. **Wifi de invitados**: para visitas, familiares y personal con móvil personal; debe estar **separada** de la red interna. INCIBE (blog 27 feb 2017) lista entre sus consejos «configurar una red wifi separada para invitados» si el router lo permite **[LEÍDO]**.
- **Wifi pública** (cafeterías, estaciones, hoteles): no usarla con dispositivos de trabajo; no sabes quién la controla ni si es legítima (kit 08 p. 11). Mejor la **conexión de datos móviles** 4G/5G (kit 08 p. 11) **[LEÍDO]**.
- **Compartir datos del móvil (hotspot)**: contraseña robusta, cifrado WPA2 o superior, comprobar quién está conectado, compartir solo con personas de confianza y apagar cuando no se usa (INCIBE OSI, 19 feb 2021) **[LEÍDO]**.
- Si te conectaste a una red insegura: desconéctate, olvídala y cambia contraseñas importantes (INCIBE Ciudadanía, «Conexiones seguras») **[LEÍDO]**.
- Desactiva la conexión automática a redes abiertas **[SECUNDARIA]**.
**Respaldo.** Kit 08 p. 11 y póster 0801 «Desconfía de redes wifi abiertas»; AEPD-INCIBE «Privacidad y seguridad en Internet» (ficha 1: en wifi públicas no intercambies información privada ni confidencial, no banca online, no compras) **[LEÍDO]**.

#### Bloque 7 · VPN, en llano (4 min)
- Una **VPN** es «un túnel privado y cifrado» entre tu aparato y la red del trabajo, aunque estés en una red no fiable.
- Solo se usa la VPN **que te da el centro**. Una VPN «gratuita» descargada por tu cuenta es shadow IT y puede ser peor (hay que elegir proveedores con buena reputación; INCIBE Ciudadanía).
- La VPN **no te protege de un virus** ni de un correo falso (kit 08 test pregunta 8: protege la conexión, no es antimalware).
- Evitar usar escritorio remoto contra servidores del centro sin VPN (kit 08 p. 11) **[LEÍDO]**.
**Respaldo.** Kit 08 p. 11; INCIBE «Conexiones seguras» **[LEÍDO]**.

#### Bloque 8 · Móvil personal para trabajar (BYOD), WhatsApp y fotos de residentes (10 min)
- **BYOD** («Bring Your Own Device»): usar tu móvil personal para cosas del trabajo (kit 08 p. 13). Ventaja: comodidad. Riesgo: lo usas para todo y se lo prestas a familiares; si se pierde, se pierde también información del centro.
- Medidas (kit 08 p. 14): no hacer root/jailbreak, tener el móvil siempre bajo custodia, seguir la normativa del centro (qué apps y configuraciones se permiten); y que el centro tenga una **normativa** de uso. Al terminar el contrato, no conservar información de la empresa (kit 08 p. 13).
- **WhatsApp y datos de salud**: la guía de la AEPD para profesionales del sector sanitario (publicada jun 2022, revisión oct 2024) indica, sobre mensajería instantánea, que hay que asegurarse de que el mensaje va solo al paciente y no a un grupo, aplicar la **minimización de datos** (la mínima información necesaria), valorar si la aplicación cifra y si es fácil suplantar al usuario, y que «es probable que no sea aconsejable» comunicarse con el paciente por estos medios cuando se trate de datos sensibles **[LEÍDO, p. 17 del PDF]**.
- **Fotos y vídeos de residentes**: no hacerlas con el móvil personal ni enviarlas por WhatsApp. **[SIN CONFIRMAR como cita]**: la regla se apoya en el principio de minimización de la AEPD arriba citado y en la política de cada centro; no he leído una norma oficial específica sobre fotos de residentes. Presentar como «norma del centro» y consultar al delegado de protección de datos (DPD) del cliente.
- Posible sanción: la búsqueda indicó que la AEPD ha sancionado el envío de fotos y vídeos de pacientes por WhatsApp **[SECUNDARIA]**; no citar casos concretos sin leer la resolución.
**Respaldo.** Kit 08 pp. 13-14 **[LEÍDO]**; AEPD, Guía para profesionales del sector sanitario, jun 2022 (rev. oct 2024) **[LEÍDO]**.

#### Bloque 9 · Pérdida o robo de dispositivos (6 min)
Pasos del kit 08 p. 15 y de INCIBE (blog 25 jul 2018):
1. **Avisar a la empresa de inmediato** (para que bloqueen cuentas y accesos).
2. Si es robo, **denunciar** (Policía/Guardia Civil) aportando el IMEI.
3. Bloquear en remoto, localizar («Encuentra mi dispositivo» / «Buscar mi iPhone») y, si no se recupera, **borrado remoto**.
4. Bloqueo de la tarjeta SIM y de IMEI con la operadora (INCIBE 2018). El IMEI se ve marcando `*#06#`.
5. **Tip**: apuntar el IMEI al comprar el móvil **[SECUNDARIA]**.
El kit 08 p. 15 añade que la geolocalización en equipos de empresa debe comunicarse a los empleados de forma «clara, expresa e inequívoca» (LOPDGDD 3/2018) **[LEÍDO]**.
**Mensaje clave de actitud**: avisar rápido nunca es motivo de reprimenda; tarde, sí es un problema.

#### Bloque 10 · Copias de seguridad y Google Drive de empresa (8 min)
- **Regla 3-2-1 en llano**: *3 copias* de lo importante (la original + 2 copias), en *2 tipos de soporte* distintos (p. ej. disco y nube), y *1 copia fuera* del centro. INCIBE, guía de copias (30 oct 2018) la formula así: «tres copias, en dos tipos de soporte distintos y una de ellas fuera» **[LEÍDO]**.
- Para el personal no técnico: **las copias las hace informática**; tu parte es guardar el trabajo **donde el centro indique** (carpeta compartida o Drive de empresa), no en el escritorio ni en un USB. El kit 08 p. 12 pide copias periódicas en teletrabajo **[LEÍDO]**.
- **Drive de empresa**: usa solo la cuenta corporativa, nunca tu Gmail personal. Compartir: opción **«Restringido»** (solo personas concretas) y no «Cualquier persona con el enlace»: Google lo dice así: con enlace público cualquiera puede abrir el archivo sin iniciar sesión, y recomienda no compartir información privada o sensible así; además los permisos de una carpeta se heredan a lo que contiene **[LEÍDO, ayuda de Google Drive]**.
- Antes de compartir: ¿quién lo recibe?, ¿lo necesita?, ¿solo ver o editar?
**Respaldo.** INCIBE guía copias 2018; Google Drive Ayuda; OSI vídeo «Cómo utilizar un servicio en la nube para hacer copias de seguridad» (jun 2023).
**No encontrada**: fuente oficial española específica sobre «Google Drive en empresas»; solo la ayuda de Google.

#### Bloque 11 · Teletrabajo seguro desde casa (8 min)
- **Wifi de casa** (kit 08 p. 12; INCIBE «Conexiones seguras»): cifrado WPA2/WPA3, clave robusta, desactivar WPS, cambiar nombre y contraseña por defecto del router y actualizar su firmware.
- **Familiares**: nadie más usa el equipo de trabajo para juegos, descargas ni deberes (kit 08 p. 12).
- **Pantalla**: bloquear al levantarte; si hay otros en casa, que no vean datos de residentes.
- **Papel**: no sacar documentos con datos de residentes; si es imprescindible, guardarlos bajo llave y destruirlos con trituradora.
- **VPN** del centro; copias periódicas; contraseñas robustas y doble factor (INCIBE, 20 mar 2020).
- Documento técnico para el servicio de informática: CCN-CERT BP/18, mar 2020 **[LEÍDO, orientado a TI]**.
**Respaldo.** Kit 08 p. 12; INCIBE «Pautas para teletrabajar seguro» (20 mar 2020) **[LEÍDO]**.
**Nota**. En centros sociosanitarios el teletrabajo afecta sobre todo a administración y dirección.

#### Bloque 12 · Seguridad física, papel e ingeniería social presencial (12 min) — foco mantenimiento
- **Accesos y visitas**: control de acceso (tarjeta, PIN, llave o biometría) y cámaras/sensores son medidas de seguridad física (INCIBE-CERT, 17 abr 2019, en entorno industrial) **[LEÍDO]**. Aplicado al centro: puertas del personal cerradas; las visitas, **acompañadas y registradas** (buena práctica propuesta).
- **Cuartos de comunicaciones y servidores**: acceso solo del personal autorizado. «Conseguir acceso físico a un centro de control implica ganar acceso lógico al sistema» (INCIBE-CERT 2019). Mantenimiento: no dejes la puerta abierta ni la llave puesta.
- **Cámaras, domótica y otros dispositivos IoT** (cámaras de pasillos, control de accesos, sensores, domótica): INCIBE (blog 6 jun 2017) advierte de claves por defecto sin obligación de cambiarlas, falta de actualizaciones y acceso remoto inseguro; recomienda cambiar contraseñas de fábrica, elegir dispositivos con actualizaciones, no conectarlos a la wifi corporativa y deshabilitar el acceso remoto si no se necesita **[LEÍDO]**.
- **Equipos médicos conectados (IoMT)**: INCIBE-CERT (10 ene 2019) los describe como equipos conectados a la red del hospital con riesgos de acceso no autorizado y dificultad de aplicar parches por su criticidad; recomienda monitorizar el tráfico y separar accesos operativos de los de configuración **[LEÍDO]**. Para el personal de planta: **no conectar nada a esos equipos ni moverlos de enchufe/red sin avisar** (buena práctica propuesta). El artículo es de 2019: comprobar si hay material INCIBE-CERT más reciente.
- **Papel**: guardar bajo llave al acabar; **destruir con trituradora** lo que ya no se necesite (kit 07 p. 3); INCIBE (blog 23 ago 2018) dice que para documentos físicos «se deberá utilizar el triturado» y que conviene contratar servicios que emitan certificado de destrucción **[LEÍDO]**. Cuidado con lo que queda en impresoras y escáneres (kit 07 p. 3).
- **Ingeniería social presencial**: INCIBE (blog 8 oct 2020) pone como ejemplo la **suplantación presencial**: dejar acceder a personas externas (fontanero, repartidor) sin verificar credenciales **[LEÍDO]**. Recomienda procedimientos verificables antes de actuar.
  - **Tailgating** (colarse detrás de alguien): INCIBE no lo desarrolla en lo que he leído; la definición («seguir de cerca a un empleado autorizado para entrar») procede de páginas de empresas de seguridad **[SECUNDARIA]**. Presentarla como concepto de apoyo.
  - **Falsos técnicos**: regla práctica propuesta: «un técnico sin cita, sin identificación o que nadie conoce **no pasa a solas**; pregunta a quién te lo avisó y confírmalo con la dirección o informática por un canal que tú elijas, no el que te da él».
- **Qué hacer ante un incidente** (kit 07 p. 6-7): primero entender qué ha pasado; avisar a la persona responsable; si se afectan datos personales, informar a quien deba comunicarlo a los afectados y a la AEPD; si es delito, denuncia; ayuda de INCIBE: **017** (antes 900 116 117; ver sección 9) **[LEÍDO]**.

#### Cierre (3 min)
Decálogo de 10 gestos y recordatorio de a quién avisar (responsable de seguridad / informática del centro). Reservar para el SCORM una pantalla con «a quién llamo» editable por centro.

**Reparto de tiempo (~100 min)**: Bloques 0-12 ≈ 99 min de contenido y actividades; el test final cabe dentro del tiempo si se simplifican los bloques 6, 10 y 12. Ajustar a partir de las pruebas con usuarios.

---

### 3. Datos citados (fuente, enlace, fecha)

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

### 4. Vídeos verificados

Verificación realizada el 5 oct 2026 con `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json` (título y canal exactos) y con la ficha del vídeo en YouTube (duración y fecha de subida). Todos los IDs tienen 11 caracteres. **No he visionado los vídeos**: el encaje con cada pantalla se basa en el título y en la lista del canal; hay que verlos antes de integrarlos.

#### Recomendados (6)

| # | ID | Título exacto | Canal | Duración | Subido | URL | Pantalla que ilustra |
|---|---|---|---|---|---|---|---|
| 1 | `whjCYP4afwo` | Pasos para actualizar tu ordenador Windows y Mac | Oficina de Seguridad del Internauta | 3:24 | 8 oct 2025 | https://www.youtube.com/watch?v=whjCYP4afwo | Bloque 3, actualizaciones |
| 2 | `6OSJ4U4mQWo` | Pasos para actualizar tu móvil y tablet Android e iOS | Oficina de Seguridad del Internauta | 4:33 | 15 oct 2025 | https://www.youtube.com/watch?v=6OSJ4U4mQWo | Bloque 3 y tablets de planta |
| 3 | `hbmpmMWoElk` | Comprueba si tienes activado el antivirus en tu ordenador Windows y Mac | Oficina de Seguridad del Internauta | 3:25 | 8 oct 2025 | https://www.youtube.com/watch?v=hbmpmMWoElk | Bloque 3, antivirus |
| 4 | `nV9zOtHDmcA` | Cómo proteger tu red wifi | Oficina de Seguridad del Internauta | 2:36 | 13 may 2024 | https://www.youtube.com/watch?v=nV9zOtHDmcA | Bloque 6 (wifi) y bloque 11 (wifi doméstica del teletrabajo) |
| 5 | `IHkhdDH-JoM` | Cómo protegerte de aplicaciones maliciosas en tu móvil o tablet Android e iOS. | Oficina de Seguridad del Internauta | 4:02 | 15 oct 2025 | https://www.youtube.com/watch?v=IHkhdDH-JoM | Bloque 5 (descargas y apps) y bloque 8 (BYOD) |
| 6 | `Qf8ORcBSWvQ` | Cómo utilizar un servicio en la nube para hacer copias de seguridad | Oficina de Seguridad del Internauta | 3:28 | 14 jun 2023 | https://www.youtube.com/watch?v=Qf8ORcBSWvQ | Bloque 10, copias y nube |

#### Opcionales / de apoyo (verificados igualmente)

| ID | Título exacto | Canal | Duración | Subido | Nota |
|---|---|---|---|---|---|
| `W_W6Rz8gRQ8` | Protección para el puesto de trabajo: un caso de éxito de una clínica (actualización) | INCIBE | 2:35 | 28 feb 2022 | Encaja con el bloque 1 por título; contenido sin comprobar (la ficha dio error 429). Verlo antes de usar. |
| `sWWV3QgVcCk` | Así trabaja el ciberdelincuente ¿se lo vas a permitir? (actualización) | INCIBE | 3:42 | 23 mar 2021 | Concienciación general; encaja con el bloque 0 o 12. |
| `TentnM1-lg0` | ¿Qué es el Ingeniería social? \| #AprendeCiberseguridad con INCIBE | INCIBE | 1:32 | 26 ago 2020 | Píldora corta para el bloque 12 (el título es literal, con la errata). |
| `uKNcqM0ZBEw` | Ciberconsejos - Buenas prácticas en el empleo de tecnología | CCN | 2:08 | 18 sep 2019 | Canal del CCN; antiguo, comprobar vigencia. |
| `VxrUaPFiiHc` | Cómo hacer una copia de seguridad y restaurarla en Windows, macOS, Android e iOS | Oficina de Seguridad del Internauta | 5:16 | 19 jun 2023 | Supera un poco los 5 min. |

**Huecos**: no hallé un vídeo oficial breve y verificable de INCIBE/OSI/CCN/AEPD sobre USB desconocidos, VPN, pérdida de móvil o tailgating. Las búsquedas devolvieron vídeos de terceros (p. ej. un vídeo de VPNpro), que no cumplen el criterio de fuente oficial y **se descartan**.

---

### 5. Material del kit INCIBE utilizable

Ruta base: `C:\Users\Jose Alberto Arruego\Downloads\kit_concienciacion\kit_concienciacion\RecursosFormativos\`
Extraje el texto de los PDF y de los PPTX con PyMuPDF y python-pptx. **Leí a fondo los PDF largos y los tests; los PPTX los extraje, pero no los he revisado diapositiva a diapositiva** (se asume que repiten el PDF; confirmar).
Las imágenes de «Consejos» las vi una a una. Los «Posters» (hasta 22 MB) no los abrí; por nombre, son versiones de póster de los consejos.
Licencia: no he revisado las condiciones de uso del kit. Comprobar antes de incluir imágenes en el SCORM (créditos «INCIBE», logotipo visible en las imágenes).

#### 06_PuestoTrabajo (Medidas de protección I)
- `06_PuestoTrabajo\06_PuestoTrabajo.pdf` (y `Ficha\06_PuestoTrabajo.pdf`): 8 páginas de contenido. p. 3 riesgos del puesto; p. 4 mesas limpias; p. 5 bloqueo de sesión (Win+L, macOS Ctrl+Opción+Q, Linux Ctrl+Alt+L, móvil con tiempo mínimo, apagar equipos al terminar); p. 6 software actualizado; p. 7 antivirus y firewall; p. 8 referencias. → **Bloques 1 y 3**.
- `Consejos\0601_PuestoTrabajo.png`: «¡Utiliza WIN+L cada vez que te levantes!» → **Bloque 1**, pantalla de bloqueo.
- `Consejos\0602_PuestoTrabajo.png`: «Practica el PARCHEADO y evita problemas» (actualización OK) → **Bloque 3**.
- `Posters\0601…png`, `0602…png`: versiones póster.
- `Presentacion\06_Puesto_trabajo.pptx`: presentación.
- `Test_evaluacion\06_Test_Puesto_trabajo.pdf`: 10 preguntas.

#### 07_PuestoTrabajo (Medidas de protección II)
- `07_PuestoTrabajo\07_PuestoTrabajo.pdf`: p. 3 documentación sensible, impresoras/escáneres, custodia externa, destrucción segura (trituradoras); p. 4 contrato de confidencialidad; p. 5 uso adecuado de Internet y sistemas; p. 6 software legítimo y cómo/cuándo reportar un incidente (tipos de incidente; INCIBE 900 116 117); p. 7 dispositivos extraíbles (cifrar, avisar si se pierden, borrado seguro) y denuncia. → **Bloques 4, 5 y 12**.
- `Consejos\0701_PuestoTrabajo.png`: «Cuando el ANTIVIRUS SUENA, malware llega» (aviso «Virus detectado») → **Bloque 3**.
- `Consejos\0702_PuestoTrabajo.png`: «Siempre software legítimo. NO SEAS PIRATA» → **Bloque 5**.
- `Presentacion\07_Puesto_trabajo.pptx`; `Test_evaluacion\07_Test_Puesto_trabajo.pdf` (10 preguntas). No tiene carpetas Ficha ni Posters.

#### 08_Móviles (BYOD y teletrabajo)
- `08_Móviles\08_BYOD_teletrabajo.pdf` (y `Ficha\08_BYOD_teletrabajo.pdf`): p. 4-5 riesgos (robo/pérdida, malware, webs fraudulentas, wifi insegura, permisos excesivos, patrón débil, root/jailbreak, «recordar contraseña», nube); p. 6 antimalware; p. 7 control de acceso (cuentas con mínimos privilegios, bloqueo); p. 8 cifrado; p. 9 apps legítimas (tiendas oficiales); p. 10 no recordar contraseña; p. 11 wifi inseguras y VPN; p. 12 teletrabajo (WPA2/WPA3, clave robusta, desactivar WPS, copias, nadie más usa el equipo); p. 13-14 BYOD (riesgos y medidas); p. 15 robo o pérdida. → **Bloques 6-9 y 11**.
- `Consejos\0801_Móviles.png`: «Yo no sabía que esto NO SE PODÍA hacer. Desconfía de redes WiFi abiertas» (banca en wifi abierta) → **Bloque 6**.
- `Consejos\0802_Móviles.png`: «Tu smartphone, siempre con BLOQUEO» → **Bloques 1 y 8**.
- `Posters\0801…png`, `0802…png`, `0803_Móviles.png` (este último sin consejo equivalente; no lo abrí).
- `Presentacion\08_BYOD_teletrabajo.pptx`; `Test_evaluacion\08_Test_BYOD_teletrabajo.pdf` (10 preguntas).

**Qué falta en el kit**: nada sobre tablets compartidas, wifi de invitados, 3-2-1, Drive, seguridad física, IoMT, domótica, tailgating ni WhatsApp/fotos de pacientes.

#### Formato de los tests del kit (para inspirarnos, sin copiar)
- 10 preguntas de **opción múltiple con 4 opciones (a-d)**, con **una sola correcta**, y tabla de soluciones al final del PDF.
- Muchas preguntas usan el patrón «**todas las anteriores / todas son ciertas / la a y la b**» (06: P1, P6, P10; 07: P2, P3, P5, P6; 08: P7, P8, P9), que facilita acertar por descarte y no distingue conocimiento. En nuestro curso **evitar** ese patrón.
- Enunciados largos y técnicos; abundan los distractores absurdos («los USB pueden estar siempre conectados»).
- Una pregunta con «cuál de estas afirmaciones **no** es cierta» (07 P10), que desorienta si se lee con prisa.
- Sin retroalimentación explicativa. Nosotros añadimos explicación a cada respuesta.
- Tema recurrente a reutilizar como situación (reformulada): Win+L, post-it, antivirus+cortafuegos a la vez, wifi pública, «recordar contraseña», root/jailbreak, BYOD, qué hacer ante pérdida.
- Un punto a revisar antes de copiar la idea: 07 P7 da como correcta «comunicarlo a los afectados y a la AEPD», pero la comunicación la hace el **responsable del tratamiento**, no cada trabajador. Nuestro enunciado debe decir «avisar de inmediato al responsable».

---

### 6. Actividades interactivas y escenarios por rol

#### Actividades (adaptables al editor SCORM; todas con uso táctil)
1. **«Encuentra los fallos» en una sala de enfermería ilustrada** (imagen con puntos tocables; 8-10 fallos): post-it con clave en el monitor; ordenador de enfermería sin bloquear con la medicación visible; pendrive desconocido en la mesa; hoja de cambios posturales a la vista de las visitas; móvil personal haciendo fotos de una herida; tablet de planta con sesión de otra compañera abierta; puerta del cuarto de comunicaciones entreabierta con la llave puesta; papelera con listados sin triturar; wifi de invitados «Centro» sin contraseña igual que la del personal; técnico desconocido con chaleco manipulando el router. Puntuación: tocar cada fallo y elegir qué hacer. Mismo concepto sirve para **«la mesa del despacho de administración»**.
2. **Qué hago con este USB** (árbol de decisiones de 4 pasos): lo encuentro en la sala de personal → ¿lo conecto para ver de quién es? (no) → ¿se lo doy a un compañero? (no, a informática o al responsable) → ¿lo tiro? (no, se entrega) → refuerzo con la regla INCIBE.
3. **Checklist de teletrabajo** (7-8 casillas): wifi con WPA2/WPA3 y clave propia; router con clave cambiada; nadie más usa el equipo; pantalla se bloquea al levantarme; VPN del centro; papel bajo llave; documentos solo en la carpeta del centro; sé a quién avisar. Resultado: semáforo y consejos.
4. **¿Wifi del centro, de invitados o pública?** Arrastrar dispositivos y tareas a la red correcta (el ordenador de dirección → corporativa; el móvil personal de una visita → invitados; el portátil en una cafetería → datos móviles/VPN; la tablet de planta → corporativa).
5. **«¿Quién entra?» (ingeniería social presencial)**: 4 personas llegan a la puerta (técnico sin cita, repartidor, familiar de un residente, supuesto inspector). Para cada una, elegir qué hacer. Final: la regla «verifica por otro canal».
6. **Ordena los pasos si se pierde el móvil/tablet** (ordenar 5 pasos: avisar, bloquear, localizar, borrar, denunciar).
7. **Carpeta compartida: ¿con quién la comparto?** Simulación de pantalla de «compartir» con «Restringido» vs. «Cualquiera con el enlace».

#### Escenarios por rol (breves, para decidir A/B/C)
- **Gerocultor/a (tablet de planta)**: la tablet de la planta 2 tiene la sesión abierta de la compañera del turno anterior y debes registrar un cambio postural. ¿Qué haces? (cerrar su sesión, entrar con tu usuario, avisar si no puedes). Segunda situación: un familiar te pide que le pases una foto de su madre «que ha salido muy bien» con tu móvil; decide con la política del centro.
- **Auxiliar / enfermería**: un compañero te propone un grupo de WhatsApp con los partes de turno. Responder según la AEPD: evitar datos sensibles, mínimo imprescindible, no usar grupos.
- **Administración**: te llega un USB «de la mutua» por correo postal con la factura; o necesitas llevarte trabajo a casa. ¿Qué haces?
- **Dirección / supervisión**: un proveedor pide la clave wifi corporativa para su portátil durante una visita. ¿Qué red les das? ¿Quién los acompaña?
- **Mantenimiento** (atención específica): (a) un «técnico del fabricante» dice que viene a revisar el equipo médico/la caldera con control remoto y pide que le dejes entrar al cuarto de comunicaciones; (b) tienes que instalar una cámara o un sensor de domótica nuevo y viene con la clave de fábrica `admin`: ¿qué haces? (c) el equipo de telemetría de una cama o un monitor pide conectarlo a la wifi del personal; ¿lo conectas? (d) te dan un USB con el firmware de un aparato. Ideas clave para ese perfil, ver bloque 12: cambiar claves de fábrica, no conectar IoT a la wifi corporativa, no abrir cuartos sin necesidad, no manipular equipos médicos conectados sin avisar a informática, acompañar y verificar a los externos.
- **Cualquier rol**: tu móvil personal se ha perdido en la playa/transporte con la app del centro; llamas al responsable; ¿qué haces antes y después?

---

### 7. Preguntas de ejemplo (12) con respuesta y explicación

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

### 8. Lista de fuentes con URL

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

### 9. Lo que NO he podido confirmar (para revisar antes de publicar)

1. **Guía CCN-STIC de móviles**: no la he localizado ni leído. Para móviles me apoyo en el kit INCIBE. Sí leí el CCN-CERT BP/18 (orientado a personal de TI).
2. **Documento AEPD de teletrabajo/movilidad (2020)**: solo visto en resúmenes de terceros; no localicé el PDF original en aepd.es. No citar textualmente.
3. **Teléfono de ayuda INCIBE**: el kit 07 p. 6 dice 900 116 117 e `incidencias@incibe-cert.es`; en las búsquedas aparece la «línea 017» (vídeo INCIBE «Línea 017 de INCIBE - Tu ayuda en #ciberseguridad», 2020) y el blog de INCIBE de 8 oct 2020 también menciona la 017. **Comprobar en incibe.es cuál es el número vigente** antes de ponerlo en pantalla.
4. **Wifi de invitados, tailgating, tablets compartidas, fotos de residentes**: sin norma o guía oficial específica leída (ver bloques 2, 6, 8 y 12). Hay que marcarlas como «norma del centro» o «buena práctica».
5. **Cargar el móvil en USB público**: solo noticia secundaria (Merca2, 12 sep 2025). No leí la fuente de INCIBE.
6. **Obligación de notificar brechas**: el kit dice que se comunique a afectados y AEPD; el trabajador solo debe **avisar de inmediato** al responsable. No he leído el RGPD (arts. 33-34) para este dossier; es conocimiento general **[SIN CONFIRMAR]**.
7. **Antigüedad**: varias fuentes INCIBE son de 2017-2020 (wifi 2017, IoT 2017, IoMT 2019, USB y borrado 2018-2022). Los principios siguen vigentes, pero los detalles técnicos (p. ej. «WPA2», filtrado MAC como medida) pueden estar desfasados: preferir WPA2/WPA3 de la página «Conexiones seguras».
8. **ENISA**: cifras de 2021-2023 sobre la UE, no sobre España ni sobre centros sociosanitarios.
9. **Vídeos**: verificados por metadatos, no visionados. La ficha del vídeo `W_W6Rz8gRQ8` (clínica) no pude leerla por límite de peticiones de YouTube.
10. **Duración del curso**: la suma de bloques (~99 min) es estimada, sin prueba con usuarios.
11. **Licencia del kit INCIBE** para reutilizar las imágenes: sin revisar.



---

<!-- Fuente: fuentes/05-datos-redes-incidentes.md -->
## Parte Curso 5 — Datos de las personas residentes, redes sociales y qué hacer si algo sale mal

> Documento de fuentes para el diseño del curso (programa de ciberseguridad para trabajadores de centros sociosanitarios). Investigación realizada el 5 de octubre de 2026.
> **Criterio de rigor:** cada dato, artículo, sanción o enlace de este documento fue leído directamente en la fuente citada durante la investigación. Lo que NO se pudo confirmar se marca con **[NO CONFIRMADO]** o se explica en la sección «Lo que no se pudo confirmar».
> Público: gerocultores/as, auxiliares, enfermería, administración, dirección, supervisión y mantenimiento, sin conocimientos digitales, que harán el curso en el móvil. Duración objetivo: ~1 h 40 min.

---

### 1. Resumen ejecutivo

**Idea fuerza del curso:** los datos de las personas residentes son *de ellas*, no del centro ni de quien los ve. Lo más habitual en centros sociosanitarios no es un hacker: es una foto que se comparte, un comentario en el WhatsApp de planta, un correo al destinatario equivocado, o mirar una ficha por curiosidad.

**Cinco mensajes que el trabajador debe llevarse:**

1. **Los datos de salud son «categoría especial»** (RGPD art. 9): están protegidos con más fuerza. Los tienes a mano por tu trabajo, no para otra cosa.
2. **Regla de oro: «necesidad de conocer».** Accedes y cuentas solo lo que necesitas para cuidar a esa persona, y solo a quien también lo necesita. Curiosidad ≠ necesidad. (Ley 41/2002 art. 16; AEPD).
3. **Por teléfono y WhatsApp no se da información de salud sin saber a quién se la das y sin permiso del residente** (o de su representante). Lo que dice la AEPD: con carácter general se exige el consentimiento del usuario para dar información a familiares o terceros (Plan de inspección sociosanitaria, apdo. 7.7).
4. **Fotos y vídeos: antes de publicar, consentimiento.** En fiestas y actividades hay que pedirlo; sin él, ni redes del centro, ni grupos de familias, ni tu perfil personal.
5. **Si algo sale mal, avisa YA y no borres nada.** El centro tiene solo **72 horas** (RGPD art. 33) desde que se entera para notificar a la AEPD si hay riesgo. Si tú tardas en contarlo, el reloj corre igual. Avisar rápido nunca es el error; esconderlo, sí.

**Datos reales que anclan el curso (todos verificados, ver §3):**
- Centro sancionado por la AEPD por enviar correos a ~50 familiares **sin copia oculta** (PS/00208-2024; multa 1.000 € reducida a 600 € por pago voluntario).
- Farmacia sancionada (11.000 € reducidos a 6.600 €) por tratar datos de residentes de geriátricos sin base legal y enviar Excel con datos de salud sin cifrar (PS/00177-2025).
- Tres resoluciones de la AEPD por accesos indebidos a historias clínicas y comentarios en un grupo de WhatsApp de trabajo (hospitales públicos).
- 2.765 brechas notificadas a la AEPD en 2025 (Memoria 2025).
- Delito: revelar secretos conocidos por la relación laboral/profesional puede ser delito (Código Penal arts. 197 y 199).

**Honestidad normativa (importante para no sobrevender):** ENS y NIS2 se tratan a nivel orientativo. El ENS obliga al sector público y a sus proveedores; **no hay base leída para afirmar que un centro sociosanitario privado esté obligada**. NIS2 incluye a «prestadores de asistencia sanitaria» (anexo I), pero **no se ha podido confirmar** que un centro sociosanitario lo sea ni que España haya transpuesto ya la directiva. Ver §2.11.

**Estructura temporal propuesta (100 min):**

| Bloque | Tema | Min |
|---|---|---|
| A | Qué son datos personales y de salud; por qué importan | 10 |
| B | Secreto profesional, confidencialidad y necesidad de conocer | 12 |
| C | Principios del RGPD y derechos de las personas (en llano) | 8 |
| D | Familias: teléfono, WhatsApp, visitas | 12 |
| E | Fotos y vídeos de residentes | 12 |
| F | Tus redes sociales personales y la ingeniería social | 12 |
| G | Brechas: qué son, ejemplos, plazo de 72 h | 12 |
| H | Protocolo de actuación ante incidente + a quién avisar + DPD | 10 |
| I | Consecuencias (casos reales) + ENS/NIS2 orientativo | 6 |
| J | Test final | 6 |
| | **Total** | **100** |

---

### 2. Contenido didáctico en bloques listos para pantallas

> Notación: **[Pantalla]** = propuesta de pantalla. Cada texto está en lenguaje llano; entre paréntesis, la base legal por si se quiere una nota «Para saber más» desplegable. Textos pensados para móvil (frases cortas).

#### Bloque A — Qué son los datos y por qué importan (10 min)

**[Pantalla A1] ¿Qué es un dato personal?**
Cualquier información sobre una persona que permita saber quién es. Nombre, cara en una foto, DNI, voz, número de habitación junto a su nombre, firma… (RGPD art. 4.1: «información sobre una persona física identificada o identificable»; las fotos y vídeos son datos personales).

**[Pantalla A2] ¿Y un dato de salud?**
Todo lo que cuenta algo sobre la salud física o mental de una persona: un diagnóstico, una medicación, que usa pañal, que tiene demencia, que se ha caído, que le han puesto una sonda, su dieta por disfagia, una analítica… También el simple hecho de que **esté ingresada en un centro sociosanitario concreto** puede ser sensible. (RGPD art. 4.15: «datos personales relativos a la salud física o mental de una persona física, incluida la prestación de servicios de atención sanitaria, que revelen información sobre su estado de salud»).

**[Pantalla A3] «Categoría especial»: protección reforzada**
El RGPD (art. 9.1) **prohíbe** tratar datos de salud, salvo excepciones. Una de ellas permite al centro usarlos para dar la asistencia sanitaria o social (art. 9.2.h), **pero** quien los trate debe estar sujeto a secreto profesional o actuar bajo la responsabilidad de quien lo está (art. 9.3, citado por la AEPD en su Plan de inspección sociosanitaria, apdo. 7.4). Traducción: **tienes permiso para usarlos para cuidar, no para otra cosa.**

**[Pantalla A4] Qué datos manejas tú (adaptar al rol)**
Historia clínica / historia sociosanitaria, Plan de Atención Individual (PAI), hoja de medicación, registro de caídas, informes del médico, ficha de ingreso, datos de contacto de familiares, fotos de actividades, listados de dietas/alergias en comedor.
(La AEPD recoge como contenido de la historia sociosanitaria datos clínicos, historia social, datos de familiares de contacto, etc.: Plan de inspección, apdo. 7.1–7.2.)

**[Pantalla A5] Las personas residentes son especialmente vulnerables**
Muchas no pueden defenderse ni darse cuenta de que algo va mal. Por eso nos toca a nosotros hacerlo por ellas. (Idea para enmarque emocional; no requiere cita legal.)

**Mini-actividad A (autoevaluación, sin nota):** «Marca cuáles son datos de salud»: una foto del residente en la sala (dato personal, y de salud si se ve la sonda/la situación), el menú «dieta turmix», el nombre de pila de un residente (dato personal), la hora a la que toma su pastilla (sí), el color del uniforme (no).

#### Bloque B — Secreto profesional, confidencialidad y «necesidad de conocer» (12 min)

**[Pantalla B1] Tu deber de callar**
Tienes **deber de confidencialidad** sobre todo lo que sabes de los residentes por tu trabajo. Aplica a todas las personas que intervienen en el tratamiento de los datos (LOPDGDD art. 5.1) y **dura aunque dejes de trabajar en el centro** (LOPDGDD art. 5.3).

**[Pantalla B2] Secreto profesional vs. deber de confidencialidad**
El secreto profesional es el de las profesiones sanitarias y sociales; el deber de confidencialidad del RGPD alcanza a **todo el personal** (también administración, mantenimiento, limpieza…). La LOPDGDD dice que el segundo es «complementario» del primero (art. 5.2).
La AEPD recomienda además un **compromiso de confidencialidad por escrito** firmado por todo el personal, becarios, estudiantes en prácticas y personal externo, con prohibición expresa de acceder a datos que no sean necesarios y de copiarlos por iniciativa propia (Plan de inspección, apdo. 7.4).

**[Pantalla B3] «Necesidad de conocer»: la regla práctica**
> *«¿Necesito este dato para hacer mi trabajo con esta persona, ahora?»* Si no → no lo abras, no lo comentes, no lo pases.

Base legal:
- Los profesionales que atienden al paciente acceden a su historia clínica para su asistencia (Ley 41/2002 art. 16.1).
- **El personal de administración y gestión solo accede a los datos de la historia clínica relacionados con sus propias funciones** (art. 16.4).
- Quien accede a la historia clínica en el ejercicio de sus funciones queda sujeto al deber de secreto (art. 16.6).
- Toda persona tiene derecho a que se respete el carácter confidencial de los datos de su salud y a que nadie acceda a ellos sin autorización amparada por la ley (art. 7.1).

**[Pantalla B4] «Pero si yo tengo la clave…»**
Que el sistema te deje abrir una ficha no significa que puedas. Los accesos **quedan registrados**. La AEPD ha resuelto casos de personal sanitario que accedió a historias clínicas sin relación asistencial (ver §3: PS/00587/2021, EXP202201746, PS/00187/2024).
Y: **tu clave es personal e intransferible.** La AEPD desaconseja los usuarios genéricos compartidos (por ejemplo, uno para todo el comedor) porque impiden saber quién accedió a qué (Plan de inspección, apdo. 7.3).

**[Pantalla B5] Las consecuencias personales (no solo del centro)**
- **Penal:** el Código Penal castiga a quien, sin estar autorizado, acceda a datos reservados de carácter personal registrados en ficheros o soportes informáticos (art. 197.2: prisión de 1 a 4 años y multa de 12 a 24 meses), con pena mayor si además se difunden o revelan (art. 197.3: de 2 a 5 años). Y a quien revele secretos ajenos conocidos por su oficio o relaciones laborales (art. 199.1: prisión de 1 a 3 años y multa de 6 a 12 meses); si es un **profesional** que incumple su obligación de sigilo (art. 199.2: prisión de 1 a 4 años, multa e inhabilitación especial de 2 a 6 años).
  *Nota docente:* son los textos del Código Penal leídos en BOE; la calificación de un caso concreto corresponde a los tribunales. No presentar como «te van a meter en la cárcel por una foto», sino como el límite máximo.
- **Laboral/disciplinario:** en una de las resoluciones leídas la AEPD propone expresamente «el inicio de actuaciones disciplinarias contra los facultativos que accedieron a la historia clínica» (EXP202201746, Servicio Canario de la Salud).

**Mini-actividad B (arrastrar a «puedo» / «no puedo»):** consultar la medicación del residente que tengo asignado hoy (puedo); mirar la historia de una compañera ingresada «por si está bien» (no); administración mirando el diagnóstico de un residente para «completar una factura» (no, solo los datos de su función: art. 16.4); decir a un familiar «tranquila, no ha pasado nada» tras una caída leve cuando no tengo autorización (ver bloque D).

#### Bloque C — Principios del RGPD y derechos de las personas, en llano (8 min)

**[Pantalla C1] Los principios, sin jerga (RGPD art. 5.1)**

| Principio (art. 5.1) | En llano | En el centro |
|---|---|---|
| Finalidad (b) | Usar los datos solo para lo que se recogieron | La foto de la ficha médica no es para el álbum de la fiesta |
| Minimización (c) | Solo los datos necesarios | Al familiar, la cita (día y hora), no «el motivo» |
| Exactitud (d) | Datos correctos y actualizados | Revisar medicación y contactos |
| Conservación limitada (e) | No guardar más tiempo del necesario | No guardar capturas en tu móvil |
| Integridad y confidencialidad (f) | Que nadie no autorizado los vea ni se pierdan | Pantalla bloqueada, papeles guardados, correo con copia oculta |

Más: el responsable debe poder demostrar que cumple («responsabilidad proactiva», art. 5.2).

**[Pantalla C2] Por qué se pueden tratar los datos de salud**
El centro puede tratarlos para prestar la asistencia (art. 9.2.h RGPD) y la LOPDGDD (art. 9.2) admite tratamientos de salud amparados en una norma con rango de ley cuando lo exija la gestión de servicios de asistencia sanitaria y social. Para **otras finalidades** (fotos publicitarias, publicar en redes, dar información a terceros…) hace falta otra base, normalmente el **consentimiento** libre, específico, informado e inequívoco (LOPDGDD art. 6.1; RGPD art. 4.11 por remisión).

**[Pantalla C3] Derechos de las personas (qué hacer si te los piden)**
Los residentes (o sus representantes) pueden pedir: **acceso** (art. 15), **rectificación** (art. 16), **supresión** (art. 17), **limitación** (art. 18), **portabilidad** (art. 20) y **oposición** (art. 21). Además, el paciente tiene derecho de acceso a su historia clínica y a obtener copia (Ley 41/2002 art. 18.1), y el acceso a la de un fallecido se limita a personas vinculadas por razones familiares o de hecho, salvo prohibición expresa del fallecido (art. 18.4).
**Mensaje para el trabajador:** *tú no resuelves estas peticiones*: las anotas y las pasas a la persona responsable / DPD (§2.9). No digas «no se puede» ni «sí, toma»; di «lo gestiono con la dirección y le contestamos».
Vídeo de apoyo (AEPD): «Cómo ejercer tus derechos de protección de datos personales» (§5).

#### Bloque D — Familias: teléfono, WhatsApp, visitas (12 min)

**[Pantalla D1] La pregunta que más te harán: «¿Cómo está mi madre?»**
Lo que dice la AEPD (Plan de inspección sociosanitaria, apdo. 7.7):
- Con carácter general, **para dar información a familiares o terceros se exige el consentimiento del residente** (o de su tutor/representante si está incapacitado). Excepciones: las que prevé la Ley 41/2002 (p. ej., cuando el paciente, según el médico, no pueda entender la información por su estado físico o psíquico, la información se pone en conocimiento de las personas vinculadas por razones familiares o de hecho: art. 5.3).
- El centro debe tener un **procedimiento escrito** que diga al personal cómo actuar ante estas peticiones, y recabar en el ingreso a quién se autoriza a informar. Hay centros que dan una **contraseña** al ingreso que los familiares autorizados deben decir por teléfono.
- Sin oposición del residente, en urgencia vital o si la presencia de allegados es necesaria para la atención, el centro puede informar de **si la persona está ingresada y su ubicación, sin datos de categorías especiales ni sobre la atención prestada.**

**[Pantalla D2] Nota fina para los centros que se fían del «consentimiento tácito»**
La Ley 41/2002 (art. 5.1) dice que se informa a las personas vinculadas «en la medida que el paciente lo permita de manera expresa o tácita». La AEPD, en su Plan de inspección, indica que desde el RGPD el consentimiento tácito **no es posible** y que debe recabarse el consentimiento explícito (art. 9.2.a RGPD). *Para el trabajador:* sigue el procedimiento del centro; no improvises ni «se lo imaginas».

**[Pantalla D3] Decálogo de llamadas (propuesta de texto para el SCORM, inspirado en la guía de la AEPD para profesionales sanitarios)**
1. ¿Quién llama? Comprueba identidad con **varios datos** que coincidan con los del centro (la AEPD lo recomienda para identificar al interesado por teléfono).
2. ¿Está en la lista/consta como persona autorizada, o tiene la contraseña? Si no sabes → **no des datos** y pasa la llamada a quien corresponda (enfermería/dirección/trabajo social).
3. Si el centro llama: usar los teléfonos facilitados por el residente/familia.
4. Mínimo necesario: día, hora, lugar. **Sin causas, síntomas, diagnósticos ni tratamientos** (criterio aplicado por la AEPD a citas por teléfono).
5. Ante duda: «Ahora mismo no puedo informarle, le llama la enfermera en un momento».
6. Anota la petición y quién la atendió.

**[Pantalla D4] WhatsApp con familias y el «WhatsApp de planta»**
- La AEPD, para centros sanitarios, indica que si usas una app de mensajería, debes asegurarte de que el mensaje va **solo al paciente y no a un grupo del que forme parte**, aplicar minimización («revelando por estos cauces la mínima información necesaria») y ofrecer siempre medios alternativos de comunicación (Guía para profesionales del sector sanitario de la AEPD, revisión de octubre de 2024).
- **Grupos de trabajo:** no es un lugar para historias clínicas ni capturas. En PS/00187/2024 la AEPD declaró infracción del art. 5.1.f RGPD cuando se comentó la historia clínica de una persona en un chat de compañeros (personal médico y al menos un celador) (ver §3).
- **Móvil personal:** el centro debe indicar qué canal oficial usar. Si no lo hay, pregunta a dirección. **[NO CONFIRMADO]** una norma general que prohíba cualquier uso de WhatsApp en centros sociosanitarios: lo que sí está claro es que no se deben mandar datos de salud a grupos ni a personas no identificadas.
- **Correos a varias familias:** usar siempre **«CCO» (copia oculta)**. Caso real: PS/00208-2024.

**[Pantalla D5] Visitas y presencial**
El mismo criterio: a la familia se le informa en la entrevista o por el canal acordado; no en el pasillo con otras visitas delante, no en voz alta en el comedor. La AEPD recoge entrevistas presenciales con familiares como mecanismo habitual de información (Plan de inspección, apdo. 7.7).

**Mini-actividad D (simulación de llamada, ver §4 caso 1 y 2).**

#### Bloque E — Fotos y vídeos de residentes (12 min)

**[Pantalla E1] Una foto es un dato personal… y, si se ve algo de la salud, de salud**
La cara, la voz, y el contexto (silla, sonda, pijama, habitación) identifican y pueden revelar la situación de salud. Publicar una foto es **tratar** datos personales y requiere una base legal (la AEPD lo aplica en sus resoluciones: p. ej. PS/00066/2022, ver §3).

**[Pantalla E2] Lo que dice la AEPD para centros sociosanitarios (Plan de inspección, apdo. 7.6)**
- **Si el residente posa voluntariamente ante una cámara visible,** puede entenderse como acción afirmativa, siempre que se le haya informado antes sobre protección de datos y pueda realmente evitar salir en la foto.
- **En eventos, fiestas, grabaciones y fotos generales** (cuando salir no depende de su voluntad), **hay que pedir el consentimiento**, salvo que la persona salga de forma meramente casual o accesoria (alguien pasando al fondo sin ser el objeto de la foto).
- **Si el residente no puede consentir** (incapacitado judicialmente), el consentimiento lo dan **el tutor o representante legal**.
- Los consentimientos deben ser claros y concretos (no valen fórmulas genéricas), con acción afirmativa (no casillas premarcadas).

**[Pantalla E3] Esquema de decisión «¿puedo publicar esta foto?» (para pantalla interactiva)**
1. ¿Hay consentimiento **para esta finalidad** (redes del centro / web / revista / grupo de familias) firmado y vigente?  → Si no, **no se publica**.
2. ¿Sale alguien sin consentimiento? → recortar/desenfocar no siempre es suficiente: **mejor no publicar**.
3. ¿Se ve información de salud (sondas, curas, situación de dependencia, pizarras con nombres y diagnósticos)? → **no**.
4. ¿La subes **desde tu móvil personal** a tu perfil o a un grupo? → **nunca**: el centro no te ha autorizado a ello; el canal debe ser el del centro.
5. ¿Es una foto «por si acaso» para el recuerdo? → No la guardes en tu galería; envíala por el canal oficial y bórrala del móvil **según el procedimiento del centro**.

**[Pantalla E4] Grupos de familias y redes del centro**
Aunque el grupo sea «de confianza», el contenido sale de tu control en cuanto se publica (cualquiera puede reenviar o capturar). Las redes sociales del centro solo las gestionan las personas autorizadas, con consentimientos específicos para esa finalidad. (La guía del INCIBE recomienda que solo publiquen empleados autorizados y conocedores del tono y los criterios: Kit 09, apdo. 2.3.)

**[Pantalla E5] Derecho a la imagen**
Además del RGPD, existe el derecho a la propia imagen (Ley Orgánica 1/1982). **[NO CONFIRMADO en esta investigación]**: no se leyó el articulado en BOE; antes de citar artículos concretos en pantalla, verificar en el BOE (LO 1/1982, de 5 de mayo). En pantalla puede decirse solo: «Existe también el derecho a la propia imagen, que protege a cada persona frente a usos no consentidos».

**[Pantalla E6] Si te piden retirar una foto**
Si un residente o familiar pide que se retire una foto: avisa a dirección/DPD de inmediato; es un derecho (oposición o supresión, arts. 21 y 17 RGPD) y no debes discutirlo.

#### Bloque F — Tus redes sociales personales y la ingeniería social (12 min)

**[Pantalla F1] Regla simple: lo del trabajo, se queda en el trabajo**
No publiques (ni en el perfil, ni en historias, ni en comentarios, ni en grupos): fotos de residentes, nombres, anécdotas «sin nombre» pero reconocibles, detalles de turnos, de claves o accesos, ni quejas sobre la empresa.
La guía de INCIBE lo dice así: entre los errores que causan incidentes está «hacer pública información que debería ser privada» y «publicar detalles sobre la empresa donde se trabaja o del evento al que se va a acudir», porque pueden ser usados por un ciberdelincuente (Kit 09, apdo. 2.1). INCIBE recuerda que lo publicado «puede ser constitutivo de delito» en ciertos casos (comentarios inapropiados, difundir información confidencial, acoso…; Kit 09, apdo. 3.2) y que **«internet tiene memoria»** (póster del kit).

**[Pantalla F2] Anécdota sin nombre ≠ anónima**
«Hoy una señora de la habitación 12 de mi planta me ha dicho…» + tu perfil con el nombre del centro = identificable. En una población pequeña, hasta sin nombre.

**[Pantalla F3] Tu perfil, tu escaparate para el delincuente (OSINT sencillo)**
OSINT = «inteligencia de fuentes abiertas»: reunir información pública sobre alguien. Un estafador puede mirar tus redes para saber: dónde trabajas, quién es tu supervisora, en qué turno estás, qué residentes cuidas, a qué hora sales. Con eso prepara una **llamada o mensaje creíble** («soy el hijo de la señora X de tu planta…», «soy del servicio técnico y tu jefa me ha dicho…»).
INCIBE define la ingeniería social como la técnica con la que se intenta «ganarse la confianza del usuario y conseguir así que haga algo bajo su manipulación y engaño», y entre los canales cita phishing, smishing, **vishing (llamadas)** y **redes sociales** (INCIBE, «Ingeniería social»).

**[Pantalla F4] Cómo reconocerlo y qué hacer (consejos de INCIBE adaptados)**
- **Verifica la identidad** antes de compartir información.
- **Desconfía** de solicitudes inesperadas de datos.
- **No abras archivos** de desconocidos (adjuntos o enlaces: pueden llevar a páginas falsas o malware; Kit 09, apdo. 3.4: «Ante la menor duda no se ejecutará el archivo adjunto»).
- Si te escribe «un familiar», «un inspector», «el médico» o «un técnico» pidiendo datos de residentes: **no contestes en el momento; pregunta a tu supervisor/a.**

**[Pantalla F5] Cuida tu privacidad (cosas concretas para móvil)**
- Opciones de privacidad **lo más restrictivas posible** (Kit 09, apdo. 3.3).
- Contraseña robusta, distinta en cada servicio y **doble factor** cuando se pueda (Kit 09, apdo. 3.1 y ficha de contraseñas).
- Revisa quién ve tus publicaciones y a qué apps diste permisos.
- Vídeos AEPD de apoyo: «Configura tu privacidad en WhatsApp» (1:45) y «en Instagram» (2:30) (ver §5).

**[Pantalla F6] Ya has publicado algo que no debías**
Bórralo, **avisa a dirección** (es una posible brecha, ver bloque G), no discutas en comentarios. Si alguien lo ha compartido, informa también. No es «pillar» al trabajador: así el centro puede reaccionar a tiempo.

#### Bloque G — Brechas de seguridad (12 min)

**[Pantalla G1] ¿Qué es una brecha?**
Definición del RGPD (art. 4.12): «toda violación de la seguridad que ocasione la destrucción, pérdida o alteración accidental o ilícita de datos personales transmitidos, conservados o tratados de otra forma, o la comunicación o acceso no autorizados a dichos datos».
En llano: **cualquier cosa que haga que los datos de alguien se pierdan, cambien, o los vea quien no debe — por accidente o a propósito.**
La AEPD aclara: también es brecha **el acceso no autorizado hecho por alguien de la propia organización**, y el acceso autorizado si se excede de sus funciones (AEPD, «Brechas de datos personales en el sector de la salud»). Y que **no solo los ciberataques**: también un papel perdido o un correo mal enviado (Guía de brechas AEPD, apdo. II.A).

**[Pantalla G2] Ejemplos de centro sociosanitario (clasificar)**
- Correo con datos de residentes enviado al destinatario equivocado → brecha (comunicación no autorizada).
- Mensaje con foto de una cura al grupo de familias por error → brecha.
- Informe/PAI olvidado en el mostrador y visto por visitas → posible brecha (acceso no autorizado).
- Móvil/tablet del centro perdido con datos de residentes → brecha (pérdida).
- Un compañero mira la historia de otro residente «por curiosidad» → brecha (acceso no autorizado por personal propio).
- Ordenador de administración cifrado por **ransomware** («secuestro» de archivos) → brecha (indisponibilidad/pérdida de acceso) y además puede paralizar el centro.
- Recibir un correo sospechoso y **no abrirlo** → **no** es en sí una brecha, pero hay que reportarlo como incidente (la AEPD indica que recibir correos con malware sin ejecutarlo no es en sí una brecha, aunque debe gestionarse como incidente: Guía de brechas, apdo. II.A).

**[Pantalla G3] El reloj de las 72 horas (RGPD art. 33.1)**
- Quien tiene que **notificar** a la AEPD es el **responsable del tratamiento** (el centro/empresa), «sin dilación indebida y, de ser posible, a más tardar 72 horas después de que haya tenido constancia de ella», **salvo que sea improbable que suponga un riesgo** para los derechos y libertades de las personas.
- Cuentan **también fines de semana y festivos** (Guía de brechas AEPD, apdo. IV.A).
- Si se pasa el plazo, hay que justificar el retraso (art. 33.1).
- El centro debe **documentar toda brecha**, también las que no notifica (art. 33.5).
- Si hay **alto riesgo** para las personas, hay que **comunicárselo también a ellas** «sin dilación indebida» y en lenguaje claro y sencillo (art. 34.1 y 34.2) (con excepciones del art. 34.3: p. ej., datos cifrados, medidas posteriores que eliminan el riesgo, o esfuerzo desproporcionado).
- Un **encargado del tratamiento** (proveedor externo, p. ej. software o gestoría) debe avisar al responsable «sin dilación indebida» (art. 33.2).

**Mensaje clave para el trabajador:** *el plazo de 72 h empieza cuando el centro «tiene constancia»*. Si tú lo sabes y callas, el centro puede llegar tarde sin saberlo. **Tu trabajo es avisar en cuanto lo detectes, en minutos u horas, no en días.**

**[Pantalla G4] ¿Qué se notifica? (solo orientativo)**
La notificación a la AEPD incluye: naturaleza de la brecha, categorías y número aproximado de afectados y de registros, datos de contacto del DPD, consecuencias probables y medidas adoptadas o propuestas (art. 33.3). La AEPD dispone de un formulario y de las herramientas **Asesora-Brecha** y **Comunica-Brecha** para ayudar a los responsables a decidir (fuente: notas de prensa de la AEPD; ver §9).

**[Pantalla G5] El dato que impresiona**
La AEPD recibió **2.765 notificaciones de brechas en 2025**, el 81 % del sector privado y el 19 % del público (Memoria AEPD 2025). En el sector salud, según su página temática, el 15 % de las notificaciones del 2.º semestre de 2021 provinieron de responsables del ámbito asistencial en salud (cifra antigua; usar con la fecha).

#### Bloque H — Protocolo de actuación ante un incidente (10 min)

**[Pantalla H1] Los 5 pasos (propuesta de síntesis; no es un protocolo oficial único, son buenas prácticas coherentes con la Guía de la AEPD y el RGPD)**

1. **DETECTA y para.** Si has enviado algo mal o has visto algo raro, no sigas «arreglándolo» por tu cuenta.
2. **NO BORRES PRUEBAS.** No elimines el correo, el mensaje ni el archivo; no apagues el equipo infectado si no te lo dicen (hacer una captura o apuntar hora, qué, a quién). Borrar impide saber qué pasó. *(Criterio de buena práctica; el RGPD exige documentar los hechos y sus efectos, art. 33.5.)*
3. **AVISA YA** al contacto que fije el centro (supervisor/a, dirección, responsable de protección de datos/DPD, informática). Por teléfono si es urgente, y luego por escrito. Dilo todo, incluso si es un error tuyo.
4. **CONTÉN.** Solo lo que tú puedas hacer sin riesgo: desconectar el Wi-Fi/cable del equipo si te lo indican, pedir al destinatario equivocado que **no lo abra y lo elimine** (si te lo indica el responsable), cambiar tu contraseña si crees que está comprometida, retirar una publicación.
5. **DOCUMENTA.** Qué pasó, cuándo, qué datos y de cuántas personas, qué hiciste. Con esto el centro cumple el art. 33.5.

**[Pantalla H2] ¿A quién avisar internamente? (rellenar con datos reales del centro)**
Plantilla: «Mi contacto en caso de incidente: ________ (nombre, teléfono, correo). Fuera de horario: ________». **[Dato local]**: en el SCORM, dejar campo configurable por cliente (ver §7).

**[Pantalla H3] ¿Y si se trata de un ciberataque (equipo bloqueado, mensaje de rescate)?**
Desconecta el equipo de la red **si te lo indican**, **no pagues nada ni contactes con el atacante**, avisa. INCIBE ofrece la **Línea de Ayuda en Ciberseguridad 017** (gratuita, confidencial; 8:00–23:00, 365 días; también WhatsApp 900 116 117 y Telegram @INCIBE017; atiende a ciudadanía, empresas y menores) — fuente: incibe.es, leída el 5/10/2026. **Es una ayuda técnica, no sustituye a avisar al responsable del centro.**

**[Pantalla H4] El DPD / DPO, tu aliado**
El **delegado de protección de datos** asesora al centro, supervisa el cumplimiento y es el **punto de contacto con la AEPD** y con las personas (la notificación de brecha debe incluir sus datos de contacto: art. 33.3.b). Es obligatorio en ciertos casos: cuando se tratan **a gran escala categorías especiales de datos** (RGPD art. 37.1.c) y, según la LOPDGDD art. 34.1.l, en «los centros sanitarios legalmente obligados al mantenimiento de las historias clínicas de los pacientes» (excepto profesionales que ejerzan a título individual).
**[NO CONFIRMADO]** si un centro sociosanitario concreto está obligada a tenerlo: depende de su naturaleza (si es centro sanitario obligado a historias clínicas) y del volumen. Mensaje seguro: *«pregunta quién es el DPD de tu centro; si hay dudas, tu dirección lo sabe».*

#### Bloque I — Consecuencias, ENS y NIS2 (6 min)

**[Pantalla I1] Sanciones: lo que dice el RGPD**
- Infracciones del art. 5 (principios, incl. confidencialidad), art. 6, art. 9: multas de hasta **20 millones de euros o el 4 % del volumen de negocio mundial** (art. 83.5).
- Infracciones de, entre otras, los arts. 32 (seguridad), 33 y 34 (brechas): hasta **10 millones o el 2 %** (art. 83.4).
- La AEPD también puede **apercibir**, ordenar medidas y, en la Administración pública, sanciona con apercibimiento (LOPDGDD art. 77, tal como aplican las resoluciones leídas).
- La LOPDGDD clasifica las infracciones en muy graves, graves y leves (arts. 72–74).
- Importante para el trabajador: **las multas van contra el centro**, pero existen vías disciplinarias y penales sobre la persona (ver B5).

**[Pantalla I2] Ejemplos reales (ver §3)**: un centro sociosanitario sancionado con 600 €, una farmacia con 6.600 €, hospitales públicos con apercibimiento y orden de medidas, una empresa con 10.000 € por una foto en Instagram. *No son cifras «para asustar»: muestran que los errores cotidianos (CCO, Excel sin cifrar, foto) tienen consecuencias.*

**[Pantalla I3] ENS y NIS2: lo que conviene saber (orientativo)**
- **ENS** (Esquema Nacional de Seguridad, RD 311/2022): se aplica a **todo el sector público** (art. 2.1) y también a entidades del sector privado que, por contrato, presten servicios o provean soluciones a entidades del sector público para el ejercicio de sus competencias (art. 2.3). *Si tu centro es pública, o presta un servicio contratado por la administración, puede afectarle; si es privada sin ese vínculo, **no hay base leída para afirmar que lo esté**.*
- **NIS2** (Directiva (UE) 2022/2555): su anexo I incluye en el sector sanitario a los «prestadores de asistencia sanitaria» (tal como los define el art. 3.g de la Directiva 2011/24/UE) y se aplica a entidades públicas o privadas **medianas o mayores** (art. 2.1). España debía transponerla antes del 17 de octubre de 2024 (art. 41.1). **[NO CONFIRMADO]**: (a) que un centro sociosanitario sea «prestador de asistencia sanitaria» a efectos de NIS2; (b) que la transposición española esté ya en vigor. Fuentes secundarias consultadas indican que a mediados/finales de 2026 el anteproyecto de ley de coordinación y gobernanza de la ciberseguridad seguía en tramitación y no estaba publicado en el BOE, y que la Comisión Europea habría remitido a España al TJUE el 8/7/2026; **no se leyó esa información en una fuente oficial**, así que debe revisarse antes de publicar.
- *Mensaje para el trabajador:* «El centro puede tener obligaciones adicionales de seguridad; tu parte es seguir sus normas y avisar de los incidentes».

---

### 3. Datos y casos reales (fuente + enlace + fecha)

> Todos los PDF de resoluciones se descargaron de aepd.es y se leyeron directamente el 5/10/2026. Las resoluciones están anonimizadas en parte. Las fechas de resolución exactas no aparecen en el texto extraído de algunos PDF: se indica lo que sí figura. Para citar en pantalla, usar el número de expediente.

#### 3.1 Casos en centros sociosanitarios y entorno sociosanitario

**Caso R1 — Centro sociosanitario: correos a familias sin copia oculta (PS/00208-2024, expediente EXP202401115)**
- Entidad: Asilo de Ancianos Santo Domingo y Santa Eloísa (la resolución la nombra).
- Hechos: reclamación de un familiar el 23/11/2023. El centro enviaba correos masivos a familiares de residentes con **las direcciones y los nombres visibles**, de forma reiterada, y siguió haciéndolo pese a avisos. Ejemplo documentado: correo del 17/11/2023 «cambios y pautas en relación a las visitas» a **51 destinatarios**; otro del 6/10/2023 «vacunación y gripe» a 50; otro del 1/9/2023 «nueva directora» a 23.
- Infracciones: art. 5.1.f RGPD (confidencialidad) y art. 32 RGPD (seguridad). Inicialmente se propuso 600 € + 400 € = 1.000 €. El 8/11/2024 la entidad pagó **600 €** acogiéndose a las dos reducciones (reconocimiento de responsabilidad y pago voluntario). Se ordenaron además medidas correctivas.
- Acuerdo de inicio: 30/10/2024. Resolución de terminación firmada en 2025 (el PDF no muestra la fecha textual; una fuente secundaria la sitúa el 7/03/2025).
- Enlace: https://www.aepd.es/documento/ps-00208-2024.pdf
- Lección: «Copia oculta» (CCO). Un error pequeño y repetido sale caro, y **repetir tras un aviso agrava**.

**Caso R2 — Farmacia que dispensa a centros sociosanitarios: datos de residentes sin base legal y Excel sin cifrar (PS/00177-2025, expediente EXP202414356)**
- Origen: denuncia de la Direcció General d'Ordenació i Regulació Sanitària de Cataluña, remitida por la Autoritat Catalana de Protecció de Dades (entrada en la AEPD el 7/09/2023), tras inspecciones a farmacias.
- Hechos: una oficina de farmacia trató datos de residentes en geriátricos para dispensar absorbentes de incontinencia y **recibía/enviaba hojas Excel con nombres y datos de salud por correo electrónico sin cifrar**.
- Infracciones propuestas: art. 6 (5.000 €), art. 14 (3.000 €) y art. 32 (3.000 €) = 11.000 €; con las dos reducciones quedó en **6.600 €** (resolución de terminación por reconocimiento y pago voluntario; acuerdo de inicio 12/04/2025).
- Enlace: https://www.aepd.es/documento/ps-00177-2025.pdf
- Lección: el eslabón débil puede ser el **proveedor**; y los **Excel con datos de residentes por correo normal** no son seguros.

**Caso R3 — Plan de inspección de oficio de la atención sociosanitaria (AEPD, publicado en 2020; inspecciones presenciales desde septiembre de 2018 hasta finales de diciembre de 2018)**
- Primer análisis sistemático de la AEPD de este sector (centros sociosanitarios, centros sociosanitarios, etc.). Carácter preventivo. Recomendaciones clave usadas en este curso: perfiles de acceso diferenciados, no usar usuarios genéricos compartidos, compromiso de confidencialidad escrito, procedimiento escrito para informar a familias, consentimiento específico para imágenes.
- Enlace: https://www.aepd.es/sites/default/files/2020-06/plan-inspeccion-oficio-atencion-sociosanitaria.pdf

#### 3.2 Casos de acceso indebido y WhatsApp en el sistema sanitario (aplicables por analogía)

**Caso S1 — Hospital La Paz: enfermera accede a la historia clínica de una compañera (PS/00587/2021)**
- Hechos: el 13/05/2020, una enfermera de quirófano, con sus claves personales, accedió **sin relación asistencial** a la historia clínica de una compañera; la afectada reclamó el 22/11/2020.
- Resolución: **apercibimiento** a la Consejería de Sanidad de la Comunidad de Madrid por infracción del art. 5.1.f RGPD y del art. 32 RGPD; se le requirió implantar medidas en un mes.
- Enlace: https://www.aepd.es/documento/ps-00587-2021.pdf
- Lección: la compañera/o también es una persona cuya historia no puedes mirar.

**Caso S2 — Servicio Canario de la Salud (expediente EXP202201746, PS/00097/2023)**
- Hechos: accesos indebidos a una historia clínica y revelación a terceros del diagnóstico (hechos del 2/11/2021). Reclamación 27/01/2022; se estimó el recurso de reposición el 6/10/2022 y se tramitó el procedimiento sancionador.
- Resolución: **apercibimiento** por art. 5.1.f y art. 32 RGPD y **propuesta de inicio de actuaciones disciplinarias** contra los facultativos que accedieron.
- Enlace: https://www.aepd.es/documento/ps-00097-2023.pdf

**Caso S3 — Conselleria de Sanidad de la Generalitat Valenciana: historia clínica comentada en un grupo de WhatsApp (PS/00187/2024, expediente EXP202311056)**
- Hechos: un profesional sanitario denunció accesos indebidos a su historia clínica y su divulgación en un chat de compañeros de trabajo; en el expediente constan capturas de un grupo de WhatsApp formado por personal médico y al menos un celador, en el que se discutían elementos de su historia clínica.
- Resolución: se **declara la infracción del art. 5.1.f RGPD** y se ordena (art. 58.2.d RGPD) acreditar medidas técnicas y organizativas en 3 meses.
- Enlace: https://www.aepd.es/documento/ps-00187-2024.pdf
- Lección: «el grupo de planta» no es privado ni seguro.

#### 3.3 Fotos en redes sociales (caso no sanitario, pero ilustrativo de imagen y consentimiento)

**Caso F1 — Foto en Instagram sin base legal (PS/00066/2022, expediente EXP202104917)**
- Una empresa (tienda de novias) publicó en Instagram una foto de una clienta con su traje de boda; alegó que la cara estaba tapada con un círculo negro y que no se identificaba. La AEPD impuso **10.000 €** por infracción del art. 6 RGPD.
- Enlace: https://www.aepd.es/documento/ps-00066-2022.pdf
- Lección: «taparle la cara» puede no bastar si sigue siendo identificable; **no es un caso de centros sociosanitarios** y no se debe presentar como tal. [Resultado leído en la resolución; la afirmación de que la AEPD descartó el argumento de la cara tapada se deduce de que impuso la sanción propuesta; para una cita textual, releer el fundamento correspondiente.]

#### 3.4 Datos agregados y contexto

| Dato | Fuente | Fecha / nota |
|---|---|---|
| 2.765 notificaciones de brechas recibidas por la AEPD en 2025; 81 % sector privado, 19 % público; 11 trasladadas a investigación; 6 resoluciones obligando a comunicar al interesado (art. 34) | Memoria AEPD 2025, https://www.aepd.es/memorias/memoria-aepd-2025.pdf | Memoria del año 2025 |
| 15 % de las notificaciones de brechas del 2.º semestre de 2021 vinieron de responsables del ámbito asistencial de salud; al menos una brecha al mes con más de 200.000 afectados en este sector | AEPD, https://www.aepd.es/areas-de-actuacion/salud/brechas-de-datos-personales-en-el-sector-de-la-salud | Página actualizada el 24/04/2025 (dato de 2021) |
| Ciberataque con ransomware al Hospital Clínic de Barcelona: ataque el 5/03/2023; paralizó urgencias, laboratorio y farmacia, forzando a trabajar en papel; los atacantes pidieron 4,5 millones de dólares y se hablaba de unos 4,5 TB de datos | INCIBE-CERT, «Ciberataque ransomware paraliza actividad del Hospital», https://www.incibe.es/en/incibe-cert/publicaciones/bitacora-de-seguridad/ciberataque-ransomware-paraliza-actividad-del-hospital | Publicación 14/03/2023. Datos leídos en resumen de la página |

**No se encontró** (y por tanto no se incluye): una resolución de la AEPD que sancione a un centro sociosanitario por publicar fotos de residentes; un caso verificable de ciberataque a un centro sociosanitario español con fuente oficial; estadísticas oficiales de brechas específicas de centros sociosanitarios. Hay referencias en medios (p. ej. «Alerta. Los centros sociosanitarios de mayores no están exentas de un ciberataque», gestionydependencia.com, sobre un «incidente informático» de DomusVi) que **no se leyeron en profundidad y no se usan como dato**.

---

### 4. Mini-casos de situaciones cotidianas (10)

> Formato: Situación → Decisión correcta → Por qué → (Fuente). Pensados como escenarios de «elige qué haces» con 3 opciones, una correcta.

**Caso 1 — Una hija llama pidiendo el estado de su madre**
Eres gerocultora; llama una mujer que dice ser la hija de la señora Pilar y pregunta qué tal ha pasado la noche y si le han cambiado la medicación.
- **Correcta:** No dar información de salud por tu cuenta. Comprobar quién es (datos que coincidan con la ficha, o la contraseña si el centro la usa) y si consta como persona autorizada; si no estás seguro/a o es una consulta clínica, «ahora le llama la enfermera / trabajo social». Como máximo, el centro puede confirmar ubicación si no hay oposición, sin datos de salud.
- **Por qué:** con carácter general hace falta el consentimiento del residente para informar a familiares; la información de salud la da quien corresponda (AEPD, Plan de inspección 7.7; Ley 41/2002 art. 5).

**Caso 2 — «Soy el hijo, dime la medicación de mi padre por WhatsApp»**
Un familiar que conoces te escribe al móvil personal pidiendo una foto de la hoja de medicación.
- **Correcta:** No enviar. Responder que debe pedirlo por el canal del centro (enfermería/dirección) y avisar a quien corresponda.
- **Por qué:** datos de salud, canal inseguro y sin verificación; la AEPD recomienda minimización y canales adecuados para mensajería (Guía sector sanitario).

**Caso 3 — Foto en la fiesta de Navidad**
Quieres subir a tu Instagram una foto bonita del coro de residentes y el árbol.
- **Correcta:** No subirla a tu perfil. Si el centro la quiere publicar, que lo haga su canal oficial solo con consentimiento para esa finalidad.
- **Por qué:** en eventos y fiestas hay que pedir consentimiento salvo captación meramente casual; el consentimiento de la imagen no se presume (Plan de inspección 7.6).

**Caso 4 — Un compañero pregunta por la analítica de un residente**
Un auxiliar de otra planta te pregunta cómo le ha salido la analítica a don Manuel «porque es mi vecino».
- **Correcta:** No contar nada. Si tiene una necesidad real de atención, que lo consulte con enfermería/dirección.
- **Por qué:** necesidad de conocer; el deber de confidencialidad abarca a todo el personal y se mantiene entre compañeros (LOPDGDD art. 5; Ley 41/2002 art. 16).

**Caso 5 — Has enviado un correo al destinatario equivocado**
Mandaste el informe de seguimiento de una residente a «Marta G.» en lugar de a «Marta L.» (otro centro/otra familia).
- **Correcta:** No intentes «arreglarlo» en silencio: avisar inmediatamente a tu responsable/DPD, **no borrar** el correo enviado, y si se te indica, pedir al destinatario que no lo abra y lo elimine. Se documenta; el centro valora si notifica en 72 h.
- **Por qué:** es una brecha (comunicación no autorizada) y el plazo corre desde que el centro lo sabe (RGPD arts. 4.12, 33).

**Caso 6 — El «WhatsApp de planta»**
En el grupo de tu planta, una compañera pone una foto de la herida de un residente para preguntar si hay que llamar al médico.
- **Correcta:** No continuar la conversación con datos del residente; indicar el canal oficial (aplicación del centro, parte clínico, llamada a enfermería) y avisar a tu supervisor/a de que el grupo se está usando así.
- **Por qué:** un grupo de WhatsApp no garantiza la confidencialidad; una foto de una herida identifica y es dato de salud (AEPD, PS/00187/2024: historia comentada en un chat de compañeros).

**Caso 7 — Tu perfil de Facebook y «el mejor trabajo del mundo»**
Pones en una historia: «Hoy en mi centro, la señora de la 14 me ha hecho llorar de risa» con una foto de la mano de una residente.
- **Correcta:** Borrar la publicación y comunicarlo a dirección. En adelante, nada del trabajo en tu perfil.
- **Por qué:** identificable por contexto; es un posible tratamiento sin base legal y puede tener consecuencias laborales; además «internet tiene memoria» (INCIBE).

**Caso 8 — Una llamada de «inspección sanitaria» pide la lista de residentes con diabetes**
Alguien llama diciendo ser de la inspección y pide un listado por correo para «un control de la Junta».
- **Correcta:** No facilitar nada en el momento. Pedir nombre, cargo y teléfono, y pasar la petición a dirección, que verificará por canales oficiales.
- **Por qué:** técnica clásica de ingeniería social (vishing): «verifica identidades» (INCIBE). El acceso para inspección existe pero para personal acreditado en el cumplimiento de sus funciones (Ley 41/2002 art. 16.5), y se gestiona por dirección.

**Caso 9 — Cuando un familiar te pide que le quites de un grupo de WhatsApp «de familias»**
Un residente (o su hija) pide que ya no salga en el álbum del grupo.
- **Correcta:** Atenderlo con amabilidad, anotarlo y comunicarlo a dirección/DPD para retirar las fotos.
- **Por qué:** derechos de oposición y supresión (RGPD arts. 21, 17); el consentimiento debe poder retirarse.

**Caso 10 — Encuentras un papel con el listado de medicación y diagnósticos en el aula/pasillo, o un pendrive**
- **Correcta:** Recogerlo, no leerlo más de lo necesario, y entregarlo a tu responsable informando de dónde y cuándo; **no tirarlo ni llevártelo**.
- **Por qué:** posible brecha (pérdida o acceso no autorizado); hay que documentarla (art. 33.5).

**Caso 11 (extra, rol dirección/supervisión) — Un compañero te cuenta que ayer comentó un caso en un grupo de Telegram con su familia**
- **Correcta:** Registrar, valorar si hay riesgo, y activar el protocolo: notificar al DPD y valorar la notificación (72 h desde que lo sabe el centro).

---

### 5. Vídeos verificados

> Verificación realizada el 5/10/2026 con `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=ID&format=json` (título y canal leídos de la respuesta). La **duración** procede de los resultados de la búsqueda de YouTube y no de oEmbed. **No se pudo visionar el contenido:** antes de incluirlos en pantalla, ver cada vídeo y confirmar que encaja. ID de 11 caracteres en todos los casos.

| # | ID | Título exacto (oEmbed) | Canal | Duración | Pantalla donde encajaría |
|---|---|---|---|---|---|
| 1 | `TentnM1-lg0` | ¿Qué es el Ingeniería social? \| #AprendeCiberseguridad con INCIBE | INCIBE | 1:33 | F3 (ingeniería social / OSINT). Nota: el título contiene el error «el Ingeniería» tal cual lo publica INCIBE |
| 2 | `SSjdJgINu2E` | ¿Qué es la ingeniería social? | Oficina de Seguridad del Internauta | 3:15 | F3–F4, alternativa más extensa |
| 3 | `WMEk-bua9vA` | ¿Hacemos buen uso de las redes sociales? | Oficina de Seguridad del Internauta | 2:35 | F1 (uso responsable de redes) |
| 4 | `qio3yImjSEA` | Configura tu privacidad en WhatsApp | Agencia Española de Protección de Datos | 1:45 | F5 / D4 (WhatsApp) |
| 5 | `tOqajyDd4UE` | Configura tu privacidad en Instagram | Agencia Española de Protección de Datos | 2:30 | F5 (privacidad del perfil) |
| 6 | `VxgFRCL6nP4` | Cómo ejercer tus derechos de protección de datos personales | Agencia Española de Protección de Datos | 1:52 | C3 (derechos) |

Enlaces: https://www.youtube.com/watch?v=TentnM1-lg0 · https://www.youtube.com/watch?v=SSjdJgINu2E · https://www.youtube.com/watch?v=WMEk-bua9vA · https://www.youtube.com/watch?v=qio3yImjSEA · https://www.youtube.com/watch?v=tOqajyDd4UE · https://www.youtube.com/watch?v=VxgFRCL6nP4

Descartado: «¿Tienes privacidad de verdad en las redes sociales?» (`MXf-YGQr6jI`, canal PantallasAmigas, verificado en oEmbed, pero no es AEPD/INCIBE/OSI). No se encontró un vídeo oficial breve de la AEPD específico sobre «brechas de datos»: por eso el bloque G se apoya en texto y casos; no se incluyó ningún vídeo de terceros sobre brechas.

---

### 6. Material del kit del INCIBE utilizable (carpeta 09_RedesSociales)

Ruta base: `C:\Users\Jose Alberto Arruego\Downloads\kit_concienciacion\kit_concienciacion\RecursosFormativos\09_RedesSociales\`

| Archivo | Contenido leído | Uso propuesto |
|---|---|---|
| `09_Redes_sociales.pdf` (11 págs.) | «Redes sociales: medidas de seguridad para los perfiles de empresa». Índice: 1. El valor de las redes sociales; 2. Riesgos (error humano, configuraciones de privacidad débiles, campañas de fraude: suplantación, malware y phishing); 3. Medidas (contraseña de acceso, sentido común, privacidad, malware y enlaces); 4. Referencias | Base del bloque F. Está pensado para **perfiles de empresa**, no para uso personal del trabajador: adaptar el texto. Ideas utilizables: errores humanos habituales (juicios de valor, tono elevado, hacer pública información privada), «solo empleados autorizados y conocedores deben publicar», 2FA, privacidad restrictiva, adjuntos y enlaces con sospecha |
| `Consejos\0901_RedesSociales.png` / `Posters\0901_RedesSociales.png` | Póster «Vamos a aplicar el SENTIDO COMÚN. Recuerda, internet tiene MEMORIA. #CulturaDeSeguridad» | Imagen de cabecera del bloque F (pantalla F1) |
| `Consejos\0902_RedesSociales.png` / `Posters\0902_RedesSociales.png` | Póster «Comprueba la PRIVACIDAD y SEGURIDAD de tus RRSS» (iconos de redes pasando por un arco de seguridad) | Pantalla F5 |
| `Presentacion\09_Redes_sociales.pptx` (13 diapositivas) | Esquema muy esquemático: usos y ventajas, riesgos (error humano, privacidad débil, fraude), medidas (contraseña/2FA, sentido común, privacidad, malware y enlaces) | Referencia de estructura; poco texto reutilizable |
| `Ficha\09_Redes_sociales.pdf` (1 pág.) | **Ojo:** por su contenido es la ficha de **CONTRASEÑAS** («Buenas prácticas en el uso de las contraseñas»): no compartir, no repetir, doble factor, longitud mínima de 8 caracteres, regla mnemotécnica con una frase | Reutilizable para el bloque F5 (contraseñas y 2FA); **el contenido no corresponde al nombre de la carpeta** |
| `Test_evaluacion\09_Test_Redes_sociales.pdf` (6 págs.) | **Ojo:** es el test de **CONTRASEÑAS y medidas complementarias**, no de redes sociales. 10 preguntas, 4 opciones (a–d) cada una, una sola correcta, soluciones al final en tabla | Ver «Formato del test» abajo |

**Formato de sus tests (para inspirarnos sin copiar):** 10 preguntas de opción única con cuatro respuestas (a–d); mezcla de (i) definiciones («El doble factor de autenticación es…»), (ii) «¿cuál es falsa?» (negación), (iii) elegir la mejor entre cuatro ejemplos (contraseñas), y (iv) el recurso de «todas las anteriores». Cada pregunta es de enunciado largo y sin escenario; **no hay explicación de la respuesta**, solo la clave al final. *Para nuestro curso:* preguntas cortas, basadas en situaciones cotidianas de centro sociosanitario, con **retroalimentación explicativa** inmediata, sin «todas las anteriores» (mal en móvil) y con 3 opciones.

**Otros materiales de INCIBE útiles (leídos en web):** página «Ingeniería social» (https://www.incibe.es/aprendeciberseguridad/ingenieria-social) con infografías, vídeos y el juego «Detecta el fraude». Resto del kit: no explorado en esta tarea.

---

### 7. Ideas de actividades interactivas y escenarios por rol

#### 7.1 Actividades (tipos que encajan en un SCORM móvil)

1. **«¿Dato de salud o no?» (clasificar):** tarjetas arrastrables a dos columnas. (Bloque A)
2. **Semáforo de la necesidad de conocer:** lista de situaciones (mirar la ficha de un residente que no es mío, hacer la cura que me han encargado…) → verde/rojo. (Bloque B)
3. **Simulador de llamada de familia:** conversación ramificada con 3 respuestas; cada una abre el efecto («la hija se enfada», «has dado datos de salud sin comprobar…»). (Bloque D; casos 1, 2, 8)
4. **Tinder de fotos:** muestra 6 fotos imaginarias (fiesta con todos mirando a cámara, foto con el residente con sonda, foto de grupo con una persona de fondo, captura de pizarra con diagnósticos…) y el usuario decide «publicar / no publicar» según el esquema E3. (Bloque E)
5. **Perfil «detective» (OSINT):** captura ficticia de un perfil de Instagram de una gerocultora; el usuario toca las pistas que ayudarían a un estafador (nombre del centro, turnos, fotos de uniforme con logotipo…). (Bloque F)
6. **«¿Es una brecha?» (sí/no/duda):** 8 situaciones de G2, con feedback. (Bloque G)
7. **Cronómetro de 72 horas:** línea de tiempo que muestra qué pasa si avisas en 1 hora vs. 3 días. (Bloque G)
8. **Ordenar el protocolo:** ordenar los 5 pasos (detecta, no borres, avisa, contén, documenta). (Bloque H)
9. **Rellena tu directorio de incidentes:** ficha configurable por centro con contacto interno/DPD (esto se personaliza por cliente). (Bloque H)
10. **Test final** de 12–15 preguntas, con feedback. (Bloque J)

#### 7.2 Escenarios por rol (variantes del mismo caso)

| Rol | Escenario específico |
|---|---|
| Gerocultor/a, auxiliar | Familia que pregunta por la noche; foto en actividad; compañero que pregunta por un residente; WhatsApp de planta con foto de una herida |
| Enfermería | Llamada de una farmacia/«médico» pidiendo datos; pase de planta en voz alta con visitas cerca; envío de informe por correo a un destinatario equivocado |
| Administración | Correo masivo a familias (CCO); Excel con datos de residentes enviado a proveedor sin cifrar; llamada de «el banco/inspección» pidiendo datos |
| Dirección / supervisión | Notificar a la AEPD en 72 h; decidir si se comunica a los afectados; gestionar una petición de derechos; criterio de fotos y consentimientos |
| Mantenimiento / limpieza | Acceso a despachos con papeles; documento encontrado; técnico externo que «viene a arreglar el ordenador» (ingeniería social) |

---

### 8. Preguntas de ejemplo (14) con respuesta y explicación

> Formato propuesto: 3 opciones, una correcta. Se incluye explicación para el feedback.

**P1.** ¿Cuál de estos es un dato de salud?
a) El color del uniforme de la gerocultora
b) Que doña Rosa toma una pastilla para la tensión cada mañana
c) La hora de apertura del comedor
**Correcta: b.** Es información sobre su salud; por tanto categoría especial (RGPD art. 4.15 y art. 9).

**P2.** Una persona de otra planta te pide mirar la ficha de un residente «solo por curiosidad». ¿Qué haces?
a) La miro, es rápido
b) No, solo accedo a lo que necesito para mi trabajo
c) La miro si no se entera nadie
**Correcta: b.** Necesidad de conocer; los accesos se registran y pueden ser infracción (Ley 41/2002 art. 16; casos de la AEPD).

**P3.** Dejas de trabajar en el centro. ¿Sigue el deber de confidencialidad?
a) No, se acaba con el contrato
b) Sí, se mantiene aunque finalice la relación
c) Solo un año
**Correcta: b.** LOPDGDD art. 5.3.

**P4.** Llama una persona que dice ser la hija de un residente y pide su diagnóstico. ¿Qué haces?
a) Se lo digo, suena preocupada
b) No doy datos de salud; compruebo la identidad y la autorización, y paso la petición a quien corresponde
c) Le digo que mi compañera me lo ha contado
**Correcta: b.** Con carácter general hace falta consentimiento del residente; el centro debe tener procedimiento (AEPD, Plan de inspección 7.7).

**P5.** Tienes que informar por correo a las familias de un cambio de visitas. ¿Cómo pones los destinatarios?
a) Todos en «Para»
b) Todos en «CCO» (copia oculta)
c) En «CC», para que sepan quién más lo recibe
**Correcta: b.** Si no, se muestran correos y nombres de familiares de residentes. Caso real: PS/00208-2024.

**P6.** En la fiesta de verano alguien hace una foto de grupo. ¿Puede publicarse en la web del centro?
a) Sí, es una fiesta pública
b) Solo si hay consentimiento de quienes salen para esa finalidad (o de sus representantes)
c) Sí, si se tapa la cara de uno
**Correcta: b.** En eventos y fiestas hay que pedir consentimiento (AEPD, Plan de inspección 7.6).

**P7.** Un residente no puede decidir por sí mismo por su deterioro cognitivo. ¿Quién debe dar el consentimiento para fotos si está incapacitado judicialmente?
a) Cualquier trabajador
b) Su tutor o representante legal
c) Nadie, no hace falta
**Correcta: b.** (AEPD, Plan de inspección 7.6).

**P8.** ¿Puedes subir a tu Instagram una foto de tu planta de trabajo en la que no se ve ninguna cara?
a) Sí, si no se ve ninguna cara
b) No: puede revelar información del centro y de las personas; no publiques nada del trabajo
c) Sí, si la borras al día siguiente
**Correcta: b.** INCIBE alerta de que publicar detalles de la empresa puede ser usado por ciberdelincuentes; además, el contexto puede identificar.

**P9.** ¿Qué es una brecha de datos personales?
a) Solo un ataque de hackers
b) Cualquier violación de la seguridad que cause pérdida, alteración, destrucción o acceso/comunicación no autorizados de datos, aunque sea por error
c) Solo la pérdida de un ordenador
**Correcta: b.** RGPD art. 4.12. También es brecha el acceso indebido por personal propio.

**P10.** Has mandado un informe de una residente a la persona equivocada. ¿Cuál es la mejor actuación?
a) Esperar a ver si no pasa nada
b) Avisar de inmediato a tu responsable/DPD, sin borrar nada
c) Borrar el correo para que no se vea
**Correcta: b.** El centro tiene 72 h desde que lo sabe para valorar la notificación; si lo ocultas, pierde tiempo (RGPD art. 33).

**P11.** ¿Cuánto tiempo tiene el responsable para notificar una brecha con riesgo a la AEPD, si es posible?
a) 72 horas desde que tiene constancia
b) 1 mes
c) 10 días laborables
**Correcta: a.** RGPD art. 33.1; cuentan fines de semana y festivos (Guía AEPD).

**P12.** Tu ordenador muestra un mensaje que dice que sus archivos están cifrados y piden un rescate. ¿Qué haces?
a) Pago el rescate para recuperar los datos
b) No toco más, no pago, aviso inmediatamente al responsable (y sigo sus instrucciones)
c) Reinicio el ordenador varias veces
**Correcta: b.** Protocolo: detecta, no manipules, avisa. INCIBE ofrece la línea 017 como ayuda técnica.

**P13.** Recibes un WhatsApp de un número desconocido: «Soy el técnico, dime la contraseña del programa de residentes». ¿Qué haces?
a) Se la doy, parece de confianza
b) No la doy; verifico con mi responsable por un canal conocido
c) Le doy solo la mitad
**Correcta: b.** Es ingeniería social; nunca compartas tu contraseña (Kit INCIBE, ficha de contraseñas: «nadie bajo ningún concepto debe saber cuál es»).

**P14.** ¿Quién es el delegado de protección de datos (DPD)?
a) Quien asesora y supervisa el cumplimiento y es punto de contacto con la AEPD y con las personas
b) El director de recursos humanos
c) Un trabajador que revisa las fotografías
**Correcta: a.** RGPD arts. 33.3.b y 37 (funciones; designación según el caso).

**Pregunta de verdadero/falso extra:** «Si he subido una foto a un grupo de WhatsApp de familias, ya no puedo hacer nada». **Falso:** avisa a dirección/DPD; se puede pedir su retirada y valorar si hay brecha.

---

### 9. Lista de fuentes con URL

#### Fuentes normativas oficiales (leídas en BOE/EUR-Lex/BOE-DOUE)
- **Reglamento (UE) 2016/679 (RGPD)**, texto en BOE-DOUE: https://www.boe.es/doue/2016/119/L00001-00088.pdf (arts. 4, 5, 9, 15–21, 33, 34, 37, 83). Versión EUR-Lex: https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=CELEX:32016R0679
- **Ley Orgánica 3/2018 (LOPDGDD)**: https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673 (arts. 5, 6, 9, 34, 72–74)
- **Ley 41/2002**, de autonomía del paciente: https://www.boe.es/buscar/act.php?id=BOE-A-2002-22188 (arts. 5, 7, 16, 17, 18)
- **Código Penal (LO 10/1995)**: https://www.boe.es/buscar/act.php?id=BOE-A-1995-25444 (arts. 197, 199; leídos textualmente)
- **Real Decreto 311/2022 (ENS)**: https://www.boe.es/buscar/act.php?id=BOE-A-2022-7191 (art. 2)
- **Directiva (UE) 2022/2555 (NIS2)**, texto en BOE-DOUE: https://www.boe.es/doue/2022/333/L00080-00152.pdf (arts. 2 y 41; anexo I punto 5)
- Ley Orgánica 1/1982 (derecho a la propia imagen): **no leída**; verificar en BOE antes de citar artículos.

#### AEPD
- Guía para la notificación de brechas de datos personales (v. junio 2021): https://www.aepd.es/guias/guia-brechas-seguridad.pdf
- Brechas de datos personales en el sector de la salud: https://www.aepd.es/areas-de-actuacion/salud/brechas-de-datos-personales-en-el-sector-de-la-salud
- Plan de inspección de oficio de la atención sociosanitaria: https://www.aepd.es/sites/default/files/2020-06/plan-inspeccion-oficio-atencion-sociosanitaria.pdf
- Guía para profesionales del sector sanitario (junio 2022, rev. octubre 2024): https://www.aepd.es/guias/guia-profesionales-sector-sanitario.pdf
- Memoria AEPD 2025: https://www.aepd.es/memorias/memoria-aepd-2025.pdf
- Resoluciones: https://www.aepd.es/documento/ps-00208-2024.pdf · https://www.aepd.es/documento/ps-00177-2025.pdf · https://www.aepd.es/documento/ps-00587-2021.pdf · https://www.aepd.es/documento/ps-00097-2023.pdf · https://www.aepd.es/documento/ps-00187-2024.pdf · https://www.aepd.es/documento/ps-00066-2022.pdf
- Canal prioritario (contenido sensible: sexual o violento difundido sin consentimiento): https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/presentacion-del-canal-prioritario-para-comunicar-la-difusion (visto solo en resultados de búsqueda; relevante si alguien difunde imágenes humillantes de un residente)
- Herramientas Asesora-Brecha y Comunica-Brecha: https://www.aepd.es/prensa-y-comunicacion/notas-de-prensa/la-aepd-renueva-asesora-brecha-y-comunica-brecha-herramientas (visto solo en resultados de búsqueda)

#### INCIBE / OSI
- Ingeniería social: https://www.incibe.es/aprendeciberseguridad/ingenieria-social
- Línea de Ayuda en Ciberseguridad 017: https://www.incibe.es/linea-de-ayuda-en-ciberseguridad
- INCIBE-CERT, ransomware Hospital Clínic: https://www.incibe.es/en/incibe-cert/publicaciones/bitacora-de-seguridad/ciberataque-ransomware-paraliza-actividad-del-hospital
- INCIBE-CERT, cómo afecta NIS2 al sector salud (25/04/2024): https://www.incibe.es/incibe-cert/blog/como-afecta-la-directiva-europea-nis2-al-sector-salud
- OSI: https://www.osi.es/ (guía de privacidad y seguridad en Internet, referenciada en el kit)
- Kit de concienciación INCIBE, carpeta 09_RedesSociales (local, ver §6).

#### Fuentes secundarias (NO oficiales; usadas solo como pista, no como fundamento)
- Fecha de la resolución PS/00208-2024: https://miguelortego.com/sancion-por-envio-masivo-de-correos-a-familiares-de-una-residencia-de-ancianos/
- Estado de la transposición de NIS2 en España (mediados/finales de 2026): https://nisd2.eu/es/wiki/timelines-and-status/nis2-status-spain · https://www.legiscope.com/blog/nis2-espana-transposicion.html
- Cobertura de DomusVi: https://gestionydependencia.com/noticia/4662/innovacion/alerta.-las-residencias-de-mayores-no-estan-exentas-de-un-ciberataque.html

---

### Lo que no se pudo confirmar (resumen de lagunas)

1. **Centros sociosanitarios y NIS2/ENS:** no consta (en lo leído) que un centro sociosanitario privado esté en el ámbito de NIS2 o del ENS. El ENS aplica al sector público y a sus proveedores (RD 311/2022 art. 2). NIS2 incluye «prestadores de asistencia sanitaria»; no se confirmó el encaje de los centros sociosanitarios.
2. **Transposición de NIS2 en España:** solo fuentes secundarias (no oficiales) indican que sigue en tramitación; verificar en el BOE y en el Congreso antes de afirmar nada en el SCORM.
3. **DPD en centros sociosanitarios:** la obligación depende de que el centro sea «centro sanitario legalmente obligado a mantener historias clínicas» (LOPDGDD art. 34.1.l) o trate categorías especiales a gran escala (RGPD art. 37.1.c); no se confirmó para cada centro.
4. **Sanciones a centros sociosanitarios por fotos:** no se encontró ninguna resolución de la AEPD con ese objeto. El caso F1 es de otro sector.
5. **Fechas exactas de resolución:** no aparecen en el texto de varios PDF; se citan por expediente.
6. **Derecho a la propia imagen (LO 1/1982):** no se leyó en BOE.
7. **Vídeos:** verificados título/canal por oEmbed pero **no visionados**; duración tomada del listado de YouTube.
8. **Protocolo H1:** es una síntesis de buenas prácticas coherente con RGPD y Guía AEPD, no un protocolo oficial único; cada centro debe fijar el suyo (contactos, canales).
9. **Datos agregados del sector salud (15 %, 200.000 afectados):** son de 2021; usar con fecha.
10. **Cifras de ransomware Hospital Clínic:** leídas en un resumen de la página de INCIBE-CERT, no en el texto íntegro.



---

<!-- Fuente: fuentes/06-inteligencia-artificial.md -->
## Parte Curso 6 · Inteligencia artificial: nuevas amenazas y uso seguro

Documento de fuentes y material didáctico (≈ 1 h 40 min, formato móvil). Investigado el 5 de octubre de 2026.

**Convención de fiabilidad** usada en todo el documento:
- **[V]** = leído por mí en la fuente indicada (página web o PDF) durante esta investigación.
- **[V-sec]** = confirmado solo a través de resultados de búsqueda o fuentes secundarias; conviene releer la fuente primaria antes de publicar la cifra.
- **[NO VERIFICADO]** = no he podido confirmarlo; no usar tal cual.

> Nota de método: las páginas se leyeron con una herramienta que resume el contenido, no con lectura literal. Las citas textuales se han evitado salvo las que aparecen entre comillas en el propio resultado. Antes de publicar cifras o artículos concretos, contrastar con el enlace.

---

### 1. Resumen ejecutivo

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

### 2. Contenido didáctico en bloques (listos para pantallas)

Tiempos orientativos sumando ≈ 100 min (incluye actividades, vídeos y test).

#### Bloque 1 · ¿Qué es la IA generativa? (10 min)
**Pantalla 1.1 – En una frase.** Una IA generativa es un programa que ha «leído» muchísimos textos, imágenes y audios, y que con eso es capaz de **escribir, hablar o dibujar** algo nuevo cuando se lo pides.
**Pantalla 1.2 – Ejemplos que ya usas sin darte cuenta.** ChatGPT, Gemini y Copilot (te contestan por escrito); el asistente de voz del móvil o del altavoz (Siri, Alexa, «Ok Google»); el corrector que te sugiere frases; los filtros que «rejuvenecen» una foto.
**Pantalla 1.3 – Cómo «piensa» (analogía).** Es como el predictivo del móvil, pero gigante: elige la palabra más probable. No comprueba si es verdad. Por eso a veces **se inventa datos con mucha seguridad** («alucinación»).
**Pantalla 1.4 – Tres ideas clave.** (1) Suena segura aunque se equivoque. (2) Lo que le escribes viaja a una empresa externa. (3) Los delincuentes también la usan.
**Pantalla 1.5 – Verdadero/Falso rápido** (ver actividades).

Fuente de apoyo: INCIBE, «Inteligencia Artificial (IA) y ciberseguridad» (ciudadanía) describe la IA como tecnología que «permite a las máquinas imitar el comportamiento humano» y que su beneficio o daño depende del uso [V].

#### Bloque 2 · Cómo usan la IA los estafadores (20 min)
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

#### Bloque 3 · Cómo defenderse (20 min)
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

#### Bloque 4 · Uso seguro de la IA en el trabajo (25 min)
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

#### Bloque 5 · Marco legal y guías oficiales (10 min)
Ver §3.3 (calendario) y §9 (enlaces). Mensajes sencillos para el alumnado:
- **Europa tiene una ley de IA** (Reglamento (UE) 2024/1689). Prohíbe prácticas inaceptables (p. ej. manipulación subliminal dañina, explotar la vulnerabilidad por edad o discapacidad, puntuación social, reconocimiento de emociones en el trabajo y la escuela [V: art. 5 según texto consolidado BOE]) y obliga a **informar de los contenidos falsos generados con IA** (art. 50, deepfakes) y a formar al personal que usa IA (art. 4).
- **AESIA** (Agencia Española de Supervisión de la IA) es el organismo español de supervisión; entre sus funciones, supervisar la aplicación del Reglamento y promover la alfabetización en IA [V-sec].
- **AEPD:** la IA no exime de cumplir el RGPD; decálogo de uso seguro (27-01-2026) [V].
- **INCIBE (017), CCN-CERT (BP/36 «IA ofensiva», jun-2026; «Ciberamenazas y Tendencias 2024»), ENISA (Threat Landscape 2025).**
- **Sanidad/OMS:** Orientaciones del Ministerio de Sanidad para profesionales en el uso de la IA [V]; Estrategia de IA del SNS aprobada por el Consejo Interterritorial (nov-2025, la fecha 12-11-2025 se deduce de la URL de La Moncloa; no pude abrir la página) [V-sec]; guía de la OMS sobre modelos multimodales grandes en salud, edición web de 25-03-2025 [V].

#### Bloque 6 · La IA como aliada, con matices (5 min)
Ayuda: filtros antispam y antiphishing, detección de pagos extraños en bancos, asistentes que transcriben reuniones o resumen documentos **no sensibles**, traducción, ideas para actividades de animación sociocultural, borradores de comunicados genéricos.
Matices: (1) pueden fallar (falsos positivos/negativos), (2) llevan sesgos, (3) la privacidad depende de la herramienta, (4) siempre debe haber una persona que decida. El CCN-CERT BP/36 plantea usar la IA como «actor defensivo gobernado» [V-sec].

#### Cierre (5 min)
Decálogo final del alumno (ver actividad 7.8) + test (§8).

---

### 3. Datos y casos reales verificados

#### 3.1 Caso Arup (Hong Kong, 2024) — estafa por videollamada deepfake
- **Qué ocurrió:** a principios de 2024 (enero) un empleado de finanzas de la oficina de Hong Kong de Arup recibió un correo supuestamente del director financiero (CFO) en Londres pidiendo una transacción confidencial; le invitaron a una videollamada en la que el CFO y otros compañeros eran **imágenes y voces falsas**. Hizo **15 transferencias por 200 millones de dólares de Hong Kong (≈ 25,6 millones de USD)** a 5 cuentas bancarias [V: Fortune 17-05-2024 (cifra, 15 transferencias, descubrimiento al verificar con la oficina central del Reino Unido); V-sec: CNN y otros para el correo inicial y las 5 cuentas].
- **Confirmación de la empresa:** Arup confirmó el 16-05-2024, en un comunicado a CNN, que se usaron «voces e imágenes falsas»; la policía de Hong Kong había publicado el caso en febrero de 2024 sin nombrar a la víctima [V-sec]. Rob Greig (director de información de Arup) lo describió como un problema creciente de «industria, negocios y sociedad» [V: Fortune].
- **Matiz:** el nombre «Arup» y la cifra están confirmados por la propia empresa; los detalles técnicos (qué herramienta usaron) **no son públicos**.
- Enlaces: https://fortune.com/europe/2024/05/17/arup-deepfake-fraud-scam-victim-hong-kong-25-million-cfo · https://www.cnn.com/2024/05/16/tech/arup-deepfake-scam-loss-hong-kong-intl-hnk (CNN devolvió error 451 al leerla directamente; datos tomados del resultado de búsqueda).
- **Lección paral centro:** da igual cuánto se parezca el director: **ningún pago se autoriza solo por videollamada**.

#### 3.2 Otros casos y datos
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

#### 3.3 Reglamento (UE) 2024/1689 (AI Act): calendario actualizado a octubre de 2026
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

### 4. Vídeos

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

### 5. Semáforo de datos con una IA pública (actividad de clasificación)

#### ROJO — NUNCA se comparte con una IA pública
1. «Doña Carmen López, 87 años, habitación 214, con demencia y disfagia».
2. La historia clínica o el informe de alta de un residente (aunque sea «solo para resumir»).
3. Foto de un residente o de un compañero para «mejorarla» o «hacerle un vídeo».
4. Contraseña del correo del centro, PIN del programa de gestión, claves de la caja fuerte de medicación.
5. IBAN del centro o de un proveedor, y el contrato con las tarifas.
6. Lista de residentes con DNI y teléfonos de los familiares.
7. Acta de la reunión de dirección o expediente disciplinario de un trabajador.
8. Cuadrante de turnos con nombres, bajas y motivos.
9. Protocolo interno de seguridad / planos con accesos y alarmas.

#### ÁMBAR — Solo con anonimización, herramienta aprobada y revisión
1. Pedir ayuda para redactar un comunicado a familias **sin nombres ni datos** de nadie.
2. Pedir un resumen de un protocolo **genérico** (p. ej. «higiene de manos») pegando texto que no es interno ni confidencial.
3. «Una persona mayor con riesgo de caídas…»: describir un **caso ficticio** para pedir ideas de prevención (después se contrasta con el protocolo del centro y la supervisión de enfermería).
4. Traducir un texto no confidencial para un familiar extranjero.
5. Mejorar la redacción de un correo propio sin datos personales de terceros.
6. Usar la herramienta de IA que **el centro** ha contratado, para algo concreto autorizado.

#### VERDE — Se puede hacer con una IA pública (con revisión humana)
1. Pedir ideas para actividades de animación (juegos de memoria, manualidades de temporada) sin datos de personas reales.
2. Explicar un concepto general («¿qué es la deshidratación en mayores?») y contrastar luego con una fuente oficial.
3. Pedir un borrador de cartel o texto de una fiesta del centro con información pública.
4. Pedir un ejemplo de tabla o lista de comprobación genérica (sin datos del centro).
5. Aprender a usar una función de Word/Excel.

Criterio rápido para el alumno: **«¿Puede identificar a una persona real o al centro? ¿Lo dejaría en el tablón de la calle? Si la respuesta es sí/no, no lo pego.»** Basado en AEPD (decálogo) y Ministerio de Sanidad (usos aceptables/no aceptables) [V].

---

### 6. Escenarios por rol

**E1 · Directora/director — videollamada falsa.** Recibe un correo del «presidente del grupo» pidiendo una videollamada urgente y confidencial; en la llamada, la imagen y voz son las del presidente y piden una transferencia a un proveedor nuevo «para cerrar hoy». *Respuesta correcta:* no pagar; colgar; llamar al presidente a su móvil de siempre; exigir doble autorización; avisar a la persona responsable de seguridad/IT y, si hay intento, al 017 o a la Policía/Guardia Civil. *Distractores:* «Se le ve y se le oye, es él» / «Pido confirmación por el mismo chat».

**E2 · Familiar de un residente — audio clonado.** Un hijo recibe un audio de WhatsApp con la voz de su madre residente: «Me han cambiado a otra habitación, necesito que pagues hoy esta factura». *Respuesta:* no pagar; llamar a su madre/al centro por el teléfono habitual; usar la palabra clave. La **gerocultora** a la que se lo cuente debe avisar a dirección y recomendar el 017.

**E3 · Administrativa — pega un informe de un residente en ChatGPT.** Quiere que «lo resuma para la familia». *Error:* datos de salud identificables en una IA pública. *Cómo hacerlo bien:* no pegarlo; si el centro tiene herramienta aprobada, usarla; si no, redactar a mano un texto genérico sin datos o pedir a la IA solo una plantilla con huecos y rellenarla ella. Avisar al delegado/a de protección de datos si ya ocurrió.

**E4 · Gerocultora — pide ayuda a la IA con un protocolo.** Quiere saber cómo movilizar a un residente con riesgo de caída. *Bien:* consulta general sin datos y **contrasta con el protocolo del centro y con enfermería**; la IA puede equivocarse. *Mal:* seguir la respuesta de la IA sin revisar o poner el nombre del residente.

**E5 · Administración/contabilidad — cambio de IBAN de un proveedor.** Llega un correo impecable (sin faltas, con firma y logo) que informa del nuevo IBAN del proveedor de alimentación. *Respuesta:* llamar al proveedor a su teléfono registrado, confirmar con una segunda persona del centro y registrar la verificación antes de modificar la ficha.

**E6 · Enfermería/supervisión — audio de «la doctora».** Recibe un audio con la voz de la doctora: «Cambia la dosis de X, ahora, no hay tiempo». *Respuesta:* **no se modifican pautas por un audio**; confirmar con la médica por el canal habitual y el registro del centro. (Escenario didáctico, no basado en un caso real.)

**E7 · Mantenimiento — «asistente» que pide datos.** Un chat de «soporte» de un proveedor de la caldera/ascensor pide acceso remoto o la clave del wifi. *Respuesta:* verificar al proveedor por un canal conocido; no dar claves; avisar a dirección.

**E8 · Cualquier trabajador/a — vídeo viral falso.** Le llega por el grupo de WhatsApp un vídeo de un «médico famoso» recomendando un producto para la memoria. *Respuesta:* no reenviar; buscar la noticia en una fuente fiable; avisar si es una estafa.

---

### 7. Ideas de actividades interactivas

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

### 8. Preguntas de ejemplo (con respuesta y explicación)

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

### 9. Fuentes (con URL)

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

