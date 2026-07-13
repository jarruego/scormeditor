# Ingesta: el GPT generador y los ficheros de conocimiento (`docs/gpt/`)

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`. **Ojo:** los ficheros de `docs/gpt/`
> son EXTERNOS — se suben a ChatGPT. No confundir con la doc interna de `docs/internals/`.

El contenido de los cursos **no se teclea a mano**: lo genera un **GPT de ChatGPT**
(diseñador instruccional) a partir de un PDF/Word, y SCORMEditor lo abre. Ese GPT es la
«fuente» del documento, así que su contrato de salida y el formato que abre el editor
**deben ir sincronizados**.

- **Salida del GPT = `.scormproj`** (no un `course.json` suelto): con Code Interpreter
  empaqueta el `course.json` + las imágenes extraídas del PDF en el ZIP `.scormproj`.
  Fallback (sin Code Interpreter): solo `course.json` en texto.
- **Invariante de ingesta:** las claves de las entradas `assets/…` del ZIP que produce el
  GPT deben **coincidir literalmente** con las rutas que el `course.json` referencia
  (`visual_resource.src`, `hotspots.image`, `tracks[].src`, `audio_src`). Es el mismo
  contrato que `loadProjectFromBlob()` espera (ver `persistencia-scormproj.md`). Si una
  imagen no existe, el GPT pone `kind:"none"` + nota en `editor_notes`, nunca un `src`
  roto. Los enums de presentación de `visual_resource` (`layout`, `media_width`,
  `media_align`, `media_ratio`) **toleran `""`** en el esquema (`course.schema.ts`, `z.preprocess` →
  default): los GPT a veces lo emiten y rompía la carga; aun así el contrato les ordena
  **omitir la clave** en vez de emitir `""`.
- **Arquitectura de los docs:** las Instructions llevan solo los **guardarraíles siempre
  activos**; el detalle es **material de referencia** en los ficheros de Knowledge. Las
  Instructions ordenan al GPT **leer** esos docs con Code Interpreter antes de generar
  (así el Knowledge se consulta de verdad, no solo por RAG). Motivo: el campo
  Instructions tiene un **límite duro de 8000 caracteres** (verificar con `wc -m` tras
  editar `instrucciones-gpt.md`).
- **7 ficheros de conocimiento en `docs/gpt/`** (mantenerlos al día si cambia el formato
  `.scormproj`, el esquema de `course.json`, `autosave.ts` o el `renderer.js`):
  - `instrucciones-gpt.md`: system prompt (Instructions). Solo guardarraíles.
  - `contrato-course-json.md`: referencia normativa del `course.json`; §1 incluye la
    regla de **IDs deterministas** (secuenciales por orden: `m1/u1/s01…`, `sNN_i01`,
    `A01/Q01…`; al corregir se conservan los existentes — los IDs «inventados»
    duplicaban en cursos largos); §4.1 markdown/callouts/formato, **§11 Empaquetado
    `.scormproj`** (builder Python `build_scormproj` / `extract_pdf_images` /
    **`validate_course`**, preflight que replica en Python las reglas §9 y los
    guardas duros del esquema Zod — enums cerrados de pantalla/interacción (el GPT
    emitía `interaction.type: "reflection"`, que es tipo de pantalla) y `unit_id`
    obligatorio en `final_test`/`unit_tests`, errores que solo afloraban al abrir
    el proyecto en el editor;
    `build_scormproj` lo ejecuta y aborta con ERRORes, de modo que el GPT corrige en
    origen lo que antes solo afloraba al abrir el proyecto en el editor — idea tomada
    del flujo «valida y regenera con el error» de eXeLearning). **Manda en caso de
    conflicto.**
  - `ejemplo-course-json.md`: ejemplo dorado (few-shot) de un `course.json` válido.
  - `guia-diseno-interacciones.md`: criterio pedagógico (segmentación, formato,
    interacciones, callouts, antipatrones).
  - `flujo-factoria-unidades.md`: procedimiento por fases para **unidades grandes**
    (inventario → temas parciales auditables `.scormpart` → fusión), con control de
    cobertura y helper `merge_unit`. Incluye el **prompt reforzado** recomendado para
    el usuario (en «Órdenes de trabajo típicas»): re-ancla en el mensaje las reglas
    más incumplidas como bloqueantes; probado con buen resultado. También la orden
    **«con guion previo»** («…y enséñame antes el guion de pantallas»): una sola
    parada para aprobar/corregir el guion antes de la producción autónoma.
  - `referencia-rapida.md`: modos, valores por defecto, accesibilidad, SEPE, evaluación y
    checklist de validación.
  - `tabla-autocorreccion.md`: cierra el ciclo generar→validar→corregir. Mapa **código
    del validador → causa raíz → corrección canónica → quién corrige** (GPT / editor
    humano / según caso). El usuario pega el informe que produce el botón «Copiar
    informe» de la pestaña Validación (`- ⛔ [CODE] mensaje — ubicación`) y el GPT
    corrige por código, sin que el usuario tenga que diagnosticar (ciclo probado con un
    informe real, con buen resultado). La columna «Quién»
    evita que el GPT «resuelva» inventando lo que es tarea del editor humano
    (`NARR_NO_AUDIO`, imágenes de tipos vetados, `EDITOR_NOTE`…). **Invariante de
    mantenimiento**: todo validador nuevo o cambiado en `validators.ts` añade/actualiza
    su fila en esta tabla (misma disciplina que sincronizar el contrato); y si una
    conversación con el usuario fija un criterio de corrección nuevo, se vuelca a la
    fila correspondiente al cerrar la tarea.
- **Criterios de contenido acordados, viven en esos docs:** (1) **Regla Nº1** —
  conservar el texto de origen **casi al 100%** (ratio ≥0.95), sin resumir ni reescribir;
  extraer **con formato** (negritas, cajas→callouts) vía PyMuPDF `get_text("dict")`, no en
  plano. (2) **Modo factoría** para unidades: nunca en una pasada (no cabe → resume), tema
  a tema con parciales. **Autónomo por defecto**: la orden habitual del usuario es
  directa («genera el `.scormproj` de X»); el GPT encadena las fases solo, sin preguntar
  entre temas (para solo ante incidencia bloqueante o falta de espacio: guarda parciales
  y pide «continúa»). Paso a paso solo si se pide expresamente. Existe además el
  **análisis previo**: inventario global con volumen por unidad/tema y propuesta de
  empaquetado en `.scormproj` (SCOs de Moodle), sin generar nada. (3) Formato: `title`
  corto (no fragmento del texto ni repetido en el cuerpo), sin pantallas vacías/diminutas,
  listas con `- ` una por línea, encabezados solo-título, sin rótulos por diapositiva,
  negritas/enlaces del original conservados, imágenes colocadas por proporción
  (`layout`). **Quitar la numeración de epígrafes del PDF** (`1.3`, `1.3.1`…) en TODO el
  texto (title, encabezados, títulos de ítems de accordion/tabs, 1ª línea del cuerpo): es
  maquetación, no contenido. **Jerarquía**: sub-epígrafes hermanos con el mismo nivel
  `###` (ninguno degradado a línea numerada en negrita) y ninguna pantalla arranca con
  contenido residual del epígrafe anterior. **`cover` = solo portada** (título/subtítulo;
  la intro va en la 1ª de contenido) pero **con el número del tema visible** («Tema 1»,
  «Tema 2»… en `subtitle` o antepuesto al título). **Ejercicios prácticos en pantalla
  propia**: `case_practice`/`reflection` y callouts con tarea (`::: case`/`::: reflect`)
  nunca pegados al final de una pantalla de contenido; el ejercicio va en la pantalla
  siguiente con solo su enunciado, y **la solución** («Resolución propuesta»/«Clave de
  reflexión») en el `feedback.explanation` de la interacción, **nunca visible** en
  `student_text`. **Limpieza de extracción** (del contraste OK/KO de dos generaciones del
  mismo PDF): reagrupar las frases partidas por la maquetación del PDF, ítems de lista
  en líneas consecutivas sin línea en blanco entre ellos, espacio tras cerrar negrita
  (`**útil** y`), y dos callouts del mismo tipo en una pantalla = dos apartados
  fusionados → dividir en dos pantallas. **`min_time_seconds: 0` siempre**: el tiempo
  mínimo por pantalla lo fija a mano el editor humano en SCORMEditor, el GPT no lo
  estima. **Bibliografía solo en `bibliography[]`** (la carcasa la muestra en el modal
  «Recursos y bibliografía», `app.js`; nunca pantalla «Referencias»), una entrada limpia
  por referencia y **todas con formato homogéneo** (`Autor/Entidad (año). Título.
  Fuente.`), normalizando aunque el original sea desordenado. **Negritas**: la extracción
  con `get_text("dict")` debe detectar la negrita por `span.flags & 16` o fuente con
  `Bold`/`Black`/`Semibold` y re-emitirla como `**...**` (helper `extract_text_markdown`
  en el contrato §11); el texto plano las pierde. **Enlaces**: en un PDF son
  anotaciones, no texto — el mismo helper cruza `page.get_links()` con los spans y
  los emite como `[texto](url)` (verificado con PyMuPDF 1.28, incluida negrita dentro
  del enlace); sin eso se perdían los enlaces cuyo texto visible no es la URL. La
  carcasa los abre **siempre** en pestaña nueva: `rich()` (`interactions.js`) emite
  `target="_blank" rel="noopener noreferrer"` y el renderer de `student_text` delega
  en esa misma función; el GPT no debe añadir HTML ni `target`. **Excepción — vídeos
  de YouTube** (jul 2026): un enlace a YouTube en el fuente no se deja como enlace de
  texto; se crea pantalla con `visual_resource.kind="video_youtube"` (ID en `src`),
  que la carcasa embebe vía `youtube-nocookie.com` (`renderer.js` `mediaBlock`) sin
  sacar al alumno del SCORM. (4) **Guion de pantallas** obligatorio
  antes de producir cada tema (jul 2026, tras calibrar el troceo con el usuario):
  tabla bloque→pantalla→interacción donde la **forma del bloque fuente** decide el
  patrón (tabla de mapeo en la guía), con el **nº de caracteres por pantalla**
  (contado en Python, no a ojo) y con **chequeo de ritmo** — informativa ~1 de
  cada 3-4 pantallas de desarrollo (nunca >3 seguidas de solo texto), **ninguna
  pantalla de >~800 caracteres sin interactividad informativa** (repartir el texto en
  una que lo contenga, o dividir), checkpoint aplicado cada 4-5 (mín. ⌈N/5⌉)
  prefiriendo decidir/clasificar/ordenar a `single_choice`, tipos variados sin
  repetir dos seguidos. El guion es interno por
  defecto (va al informe final); la orden «enséñame el guion» añade una única parada
  de aprobación antes de producir. Motivo: decidir pantalla a pantalla mientras se
  escribe producía ritmo desigual y deriva entre generaciones. **Micro-transiciones
  aditivas** permitidas (1-2 frases puente propias por pantalla; nunca sustituyen
  texto fuente — por eso el ratio puede superar 1.0). **Toda evaluable o pregunta
  directa en pantalla propia** (jul 2026): nunca comparte pantalla con teoría; su
  `student_text` lleva como mucho una frase de contexto y el desarrollo va en la
  pantalla anterior (mismo `title`) — el ejemplo dorado lo modela (s04 teoría+imagen
  → s05 pregunta). **Alternar todo el repertorio evaluable** (choice, V/F, huecos,
  parejas, clasificar, ordenar, escenario, caso) sin repetir tipo dos seguidos; ante
  la duda, un checkpoint de más (al usuario le es más fácil borrar/retocar en
  SCORMEditor que crear). **Cierre de cada tema**: `flashcards` + una lúdica
  (`word_search`/`crossword`/`az_quiz`, alternando entre temas, `scored: false`) —
  ejemplo dorado s08-s09. **Tipos vetados al GPT** (reservados al editor humano:
  piden ajustar a mano imagen/medio/código): `hotspots`, `before_after`,
  `hidden_image`, `puzzle`, `video` (vídeo interactivo; el `visual_resource`
  `video_youtube` sí se genera) y `html_embed`. Una interacción entera en una
  pantalla (no partir accordion/actividad); **`accordion`/`tabs` solo para ítems paralelos, NUNCA para prosa
  corrida ni para texto que acompaña a una imagen**; **variar los tipos informativos**
  (no todo accordion; `tabs`/`flip_cards` solo con ≤4 ítems cortos); **sustancia tras el
  clic** (jul 2026): el cuerpo de cada ítem/tarjeta/hito claramente más extenso que su
  título, nunca un eco del rótulo — solo rótulos sin desarrollo → lista en
  `student_text`, no desplegable; **texto + imagen =
  UNA pantalla** (`student_text` visible + `visual_resource`), sin fragmentar cada imagen
  en su propia pantalla; **máximo UNA imagen por pantalla y siempre como
  `visual_resource`** — nunca `![...]` en `student_text` (esa sintaxis es del editor
  humano; jul 2026, del análisis de pai-u02 (9)); serie de figuras → una pantalla por
  punto (mismo `title`); **pantalla con texto+imagen sin NINGUNA interacción**
  (tampoco informativa): la interactividad va a la pantalla siguiente con solo una
  frase introductoria; los rótulos/flechas de una infografía no se vuelcan como
  párrafos sueltos (van en `alt`/`caption`/`transcript`); **callout
  con cuerpo real (no la etiqueta) y no dos del mismo tipo en la misma pantalla**;
  **nunca un callout vacío** (`::: tipo` sin cuerpo; el editor avisa con
  `CALLOUT_EMPTY`, `validators.ts`); el
  test calificable solo en `assessments.final_test` (no una pantalla `unit_quiz` con el
  test en texto). (5) **Objetivos**: conjunto reducido derivado del contenido + petición
  del usuario + normativa facilitada (NO un micro-objetivo por pantalla, sin cuota fija);
  texto **exacto** reutilizado entre las pantallas del mismo objetivo (`objective` = solo
  el principal de cada pantalla) y copiado literal en cada `learning_objective`
  (interacciones y test); cada objetivo con al menos una evaluación; en `objectives`/
  `route` el objetivo principal del tema, no meta-objetivos («Presentar el recorrido»).
  Casa con la cobertura normalizada `OBJ_NOT_EVALUATED` del editor
  (`informes-validacion.md`). (6) **Revisión de fidelidad**: el ratio de palabras ≥0.95
  mide cantidad, no fidelidad; el flujo factoría añade en la Fase 3 una revisión final
  obligatoria contra la fuente (cada epígrafe con su pantalla, mismo orden y jerarquía,
  fronteras limpias, mismo mensaje didáctico) antes de entregar.
- El GPT también lee una copia del contrato en el `Downloads` del usuario; al tocar el de
  `docs/gpt/` hay que **sincronizarla** (`cp`). La subida al GPT se hace desde estos
  ficheros. Dentro de las Instructions, los docs se referencian por **nombre de fichero
  suelto** (así los ve el Knowledge del GPT), no por ruta: mover la carpeta en el repo no
  afecta al GPT.
- **`llms.txt` en la raíz del repo**: índice de los docs de `docs/gpt/` para que un
  asistente **distinto de ChatGPT** (Claude, Gemini, un script con API…) pueda generar
  `.scormproj` válidos partiendo de ese punto de entrada. Mientras el repo sea privado
  es inerte de puertas afuera (solo sirve a agentes con acceso local); si algún día se
  publica, revisar antes que el contrato lleva datos internos (entidad por defecto,
  criterios SEPE). Mantener: solo cambia si se añade/renombra un doc de `docs/gpt/`.
