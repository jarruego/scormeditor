# CLAUDE.md

Guía para trabajar en SCORMEditor. La visión general (arranque, fases, tipos
soportados) está en `README.md`; aquí van las **invariantes** y las decisiones de
diseño que no se deducen leyendo el código.

## Arquitectura en una frase

Dos mundos desacoplados: el **Editor** (`src/` salvo `src/runtime/`) es una SPA
React+TS+Vite+Zustand+Zod; la **Carcasa/Runtime** (`src/runtime/`) es HTML/CSS/JS
**plano, sin framework ni build**, que se copia *verbatim* dentro del ZIP SCORM.

### Invariante crítica: una sola fuente para el runtime
El editor carga la carcasa con `import.meta.glob('../runtime/**', { query:'?raw' })`
(`src/scorm/runtimeAssets.ts`). Tanto la **Vista estudiante** (iframe,
`buildPreview.ts`) como el **export ZIP** consumen esos mismos strings. → **Lo que
se ve en Vista estudiante es exactamente lo que se exporta.** Para cambiar el
comportamiento del SCORM se editan los `.js`/`.css` de `src/runtime/`, no hay que
duplicar nada.

### Invariante de seguridad (anti-XSS en la carcasa)
El runtime **escapa siempre** el texto del usuario y luego aplica un subconjunto
controlado de formato. `esc()` y `rich()` viven en
`src/runtime/assets/js/interactions.js`. Cualquier formato nuevo debe pasar por
ese pipeline (escapar primero, formatear después). No se almacena HTML en
`course.json`: el contenido es **markdown ligero en texto plano** (campo
`student_text` y similares), portable y versionable. Nunca introducir un editor
WYSIWYG que guarde HTML ni un sanitizador en el paquete SCORM.

## Texto enriquecido (markdown ligero)

Editor: `src/components/RichTextArea.tsx` (barra de botones, sin dependencias).
Render: `mdToHtml`/`blocksToHtml` en `src/runtime/assets/js/renderer.js`.

Sintaxis soportada:
- `## ` / `### ` encabezados (H1 reservado al título de pantalla). Además, una línea
  que es **solo negrita** (`**Título**`, con `:` opcional) se renderiza como `<h3>`
  (para títulos que el origen trae en negrita en vez de con `##`).
- `**negrita**`, `*cursiva*`, `[texto](url)` (http(s) o mailto). Los enlaces se abren
  en otra pestaña (`target="_blank" rel="noopener noreferrer"`, ver `rich()`).
- `- ` listas con viñetas (también acepta `*`, `•`, `·`, `–`, `—` al inicio de línea,
  porque los PDF/DOC suelen usarlos); `1. ` / `1) ` listas numeradas
- Bloques destacados (callouts): `::: tipo` … `:::`
- Bloque personalizado: `::: custom | #color | icono | título` … `:::`

La plantilla `content` (`renderer.js`) **no** muestra `objective` como banner en cada
pantalla (queda como metadato de trazabilidad; el validador sigue exigiéndolo salvo en
`cover`/`summary`); solo la pantalla `objectives` presenta los objetivos al alumno.

### Bloques destacados y paleta corporativa
Los tipos viven en `CALLOUTS` (`renderer.js`) y su color en
`src/runtime/assets/css/styles.css` (`.me-callout-*`). Colores alineados con la
**paleta oficial de teleformación** (tabla "Tabla de Elementos Clave para
Formación Online.odt" en Google Drive; ver memoria `paleta-teleformacion`):

| Color | Hex | Bloques |
|---|---|---|
| Turquesa | `#6DC3C0` | 💡 Consejo (`tip`), 🧠 ¿Sabías que…? (`fact`), 📌 Importante (`important`) |
| Naranja | `#F4C910` | ⚠️ Atención (`warn`), 💭 Reflexiona (`reflect`), 🧪 Caso práctico (`case`) |
| Violeta | `#7787BF` | ℹ️ Información (`info`) |
| Rosa | `#F4D6D2` | (color por defecto del bloque personalizado) |

Decisiones tomadas (con margen para ajustar si se pide):
- Se adoptó la paleta de 4 colores; como en la tabla original, **varios bloques
  comparten color** (no se buscó un color único por bloque).
- **No** se añadieron como bloques fijos todos los elementos de la tabla
  (Tablas, Actividad, Referencias, Glosario, Debate, Tests): quedan cubiertos por
  el bloque personalizado.

### Bloque personalizado
Botón **✚ Personalizado** en la barra: elige título, icono y color (muestras de la
paleta + selector libre). "Insertar" lo mete una vez; "Guardar y usar" además lo
persiste como **preset reutilizable**. Presets en `localStorage`
(`src/store/customBlocks.ts`, clave `scormeditor.customBlocks`), **no** en
`course.json` (cada bloque se exporta ya resuelto en el texto). El color se valida
como hex antes de inyectarlo en `style` (anti-inyección CSS); icono y título se
escapan con `esc()`.

## Sincronización Editor ↔ Vista estudiante (bidireccional)
- **Editor → Vista:** al abrir la pestaña, la vista arranca en la pantalla
  seleccionada. `buildPreviewHtml(course, assets, startScreenId)` inyecta
  `window.__START_SCREEN_ID__`; `app.js` lo respeta en modo autor. El id de
  arranque se congela con `useRef` al montar (`StudentPreview.tsx`) para no
  recargar el iframe al navegar dentro de la vista.
- **Vista → Editor:** `app.js` emite `postMessage({type:'me-screen-change'})` en
  cada `goTo` (modo autor, excluye el test final `__final__`); `StudentPreview`
  escucha y llama a `selectScreen(id)`. Al volver a Editar, se sitúa donde quedaste.

## Historial deshacer/rehacer
Implementado a mano en `src/store/courseStore.ts` (sin librerías). Pilas
`past`/`future` de instantáneas `{ course, selectedScreenId }`, tope 50 pasos.
- `snapshot(coalesceKey?)` apila el estado **antes** de cada mutación e invalida
  `future`. Las mutaciones de contenido (`updateScreen`, `addScreen`,
  `duplicateScreen`, `deleteScreen`, `moveScreen`) lo invocan.
- **Coalescencia de tecleo**: ediciones seguidas en la misma pantalla
  (`update:<id>`) dentro de 400 ms se agrupan en un solo paso. → Al pulsar
  `Ctrl+Z` mientras escribes se deshace **todo el bloque de tecleo reciente**, no
  carácter a carácter (decisión aceptada).
- El historial se **vacía** al cargar otro documento (`hydrate`, `importJson`,
  `resetSample`, `setCourse`).
- La navegación (`selectScreen`) **no** genera pasos.
- UI: botones ↶/↷ en `Toolbar.tsx`; atajos en `App.tsx` (`Ctrl/Cmd+Z`,
  `Ctrl/Cmd+Mayús+Z` o `Ctrl+Y`). El autosave existente persiste los cambios solos.

## Motor de interacciones (`src/runtime/assets/js/interactions.js`)
Cada interacción se construye con una *factory* que devuelve un **controlador**
con el contrato `{ result(), check(), hasAnswer() }`. El orquestador (`app.js`)
solo habla con ese contrato; no conoce el tipo concreto.
- **Restauración**: todo controlador se repinta desde `ctx.state` al volver a la
  pantalla (el progreso se guarda en `STATE` y en `suspend_data`). Esto es
  obligatorio: una interacción que no restaura su estado visual rompe la vuelta
  atrás del alumno.
- **Botón «Comprobar»** (decisión revertida y vuelta a poner): las interacciones
  evaluables (`single_choice`, `true_false`, `sort_steps`, `match_pairs`,
  `classification`) muestran un botón `.me-check` que llama a `check()`. Al agotar
  intentos, `lock()` deshabilita el botón pero **siempre se puede avanzar**.
- **Intentos**: campo `attempts` por interacción (`attemptsOf(data)`:
  `null`/ausente ⇒ 1; `0` ⇒ ilimitados; `n` ⇒ n). `retries` quedó **DEPRECATED**,
  no usar. Editor: input de intentos en `ScreenEditor.tsx` para los tipos
  evaluables. Por defecto **1 intento**.
- Drag&drop (sin dnd-kit; el runtime es plano): `sort_steps` reordena; `match_pairs`
  y `classification` usan `dragAssignFactory` (chips `.me-chip` sobre zonas
  `.me-dnd`). Las informativas (`accordion`, `tabs`, `flip_cards`, `video`,
  `hotspots`, `case_practice`) **no** fijan `STATE.results`; su avance se captura al
  entrar (ver sync más abajo) para no bloquear «Siguiente».
- **Cuerpos de `accordion`/`tabs` en bloque**: usan `block()` (→ `Renderer.mdToHtml`,
  no `rich()`), así una lista `- ` dentro de un `item` sale como `<ul>`, no en línea.
  El resto de textos cortos (títulos, opciones, cards) siguen con `rich()` (inline).
- **Posición de la interacción respecto al texto**: `screen.interaction_layout`
  (`top`/`bottom`, def. `bottom`). `render()` mueve `.me-interaction` tras el `<h1>`
  cuando es `top`. Editable en `ScreenEditor`.

## Recursos visuales, narración y transcripción
- `visual_resource` admite `layout` (`top`/`bottom`/`left`/`right`, def. `top`) y
  `media_width` (`33`/`50`/`66`, def. `50`). La maquetación texto+media
  (`.me-layout`/`.me-media`/`.me-mw-*`) aplica en **todas** las plantillas, no solo
  en content/route/video (un fallo histórico fue limitarlo).
- **Narración por diapositiva**: campo `audio_src` (audio propio de la pantalla),
  separado del media visual.
- **Transcripción**: se muestra como **botón fuera del contenido**, nunca
  duplicada dentro del cuerpo.
- **Lightbox**: las imágenes son ampliables al 100% al hacer clic
  (`setupLightbox()`, `.me-lightbox`/`.me-zoomable`).
- **Assets en preview**: blobs vía `window.__ASSETS__` (mapa id→blobURL);
  `assetUrl()`/`asset` resuelve. En export, los ficheros van al ZIP y al manifiesto.

## Navegación, gating y evaluación final
- **Modo autor** (`window.__AUTHOR_MODE__`): navegación **libre y sin gating** para
  poder probar sin completar cada pantalla. En modo alumno, «Siguiente» exige
  `screenSatisfied(current)` (pantalla requerida vista / interacción respondida).
- **Evaluación** (`computeScore()` en `app.js`): la nota depende de `score_source`:
  - `final_test`: nota **solo** del test final (`__final__`). Las interacciones
    evaluables de contenido NO puntúan (son práctica + requisito de finalización).
  - `unit_tests`: nota **solo** de las interacciones evaluables.
  - `mixed`: **media ponderada** de práctica y test final por
    `rules.mixed_final_weight` (% del test final, def. 70; cada bloque se normaliza a
    su propio %, **no** por suma de puntos). Añadido jul 2026 (antes era proporcional
    a los `points`, que diluía el test final).
- Una interacción evaluable se marca `completed` cuando se **resuelve** (acierto o
  intentos agotados); con `require_interactions` cuenta para la finalización (hay que
  **responderla**, no acertarla, salvo intentos ilimitados → hay que acertar).
- **Pantallas sintéticas** al final de `SCREENS` (no están en `course.json`, las añade
  `flatten()`): el **test final** (`__final__`, si hay `assessments.final_test` con
  preguntas) y una **pantalla de Resultados** (`__results__`, si hay algo que calificar)
  con nota, APTO/NO APTO y desglose (`renderResults()`). Ambas excluidas del
  postMessage de sync con el editor.
- `mastery_score`/`masteryscore` van al manifiesto; `rules.min_score` es el umbral
  APTO en el runtime.

## Superficies de edición del editor (no todo es «pantalla»)
El panel central (`App.tsx`) muestra `ScreenEditor` salvo cuando el nodo seleccionado
es un **id sintético**:
- **`__final__`** (nodo «Evaluación → Test final» del `CourseTree`) → `FinalTestEditor`:
  edita `assessments.final_test` (título, `pass_score`, preguntas/opciones/feedback)
  vía `setFinalTest` del store.
- **Ajustes del curso** (`CourseSettingsEditor`) NO es un nodo del árbol: es un **modal**
  que se abre con el botón **⚙ Ajustes** de la `Toolbar` (junto a «Archivo ▾»). Edita
  `scorm.rules` + `mastery_score` (nota mínima, `score_source`, `mixed_final_weight`,
  % pantallas, `require_interactions`, intentos, navegación) vía `updateScorm`.
  Decisión (jul 2026): los ajustes son config del curso, no una «diapositiva» del árbol.

## Persistencia y modelo de documento (`src/store/persistence.ts`, `autosave.ts`)

### Un único concepto de «guardado»: el archivo de proyecto `.scormproj`
Decisión de jun 2026 (revertido el modelo anterior de archivo/carpeta JSON +
varios estados de guardado, que confundía). Ahora hay **un solo documento**: un
archivo `.scormproj` (constante `PROJECT_EXT`) que es un **ZIP** con
`course.json` + `assets/` dentro (`buildProjectBlob()`, `compression: 'STORE'`
para reempaquetar casi instantáneo; los media ya vienen comprimidos). Modelo
mental tipo `.docx`/`.fig`/`.sb3`: «editar → Sin guardar → Ctrl+S → Guardado».
- **Abrir** (`openProject` con File System Access; `openProjectFromFile` como
  fallback): `loadProjectFromBlob()` lee el ZIP, exige `course.json` (si falta,
  error), llama a `importJson` (parsea+migra+valida) y vuelca el resto de
  entradas a `AssetMap` por su `entry.name` (las claves ya incluyen `assets/`).
- **Guardar** (`saveProject` / Ctrl+S / clic en el indicador): construye el blob
  y, si hay `projectHandle`, reescribe el mismo archivo; si no, abre
  `showSaveFilePicker` (sugerido `<courseId>.scormproj`) y lo vincula.
  `saveProjectAs()` fuerza destino nuevo (`projectHandle = null`).
- **Guardado manual, no automático al disco.** El archivo solo se escribe cuando
  el usuario guarda. Diálogos rotulados «Proyecto SCORMEditor».

### Recuperación automática (IndexedDB) — invisible, NO es «el guardado»
Copia interna continua en IndexedDB (`DB_NAME = 'scormeditor'`, store `kv`,
clave `project`) con `{ course, assets, dirty }` vía structured clone; debounce
800 ms (`scheduleSave`/`doSave`). Solo evita perder trabajo si se cierra sin
guardar; **nunca se presenta al usuario como «guardado»** (ese es siempre el
`.scormproj`). El flag `dirty` se persiste para que, tras recargar, el indicador
diga la verdad y no afirme «Guardado» si los últimos cambios no llegaron al
archivo. `initAutoSave()` (llamado una vez desde `App.tsx`) restaura esa copia,
re-vincula el `projectHandle` guardado y se suscribe a cambios de `course`/
`assets` → marca `projectDirty` y agenda recuperación.

### Permisos del File System Access — transparentes (sin botón «Reconectar»)
Los permisos del handle no sobreviven a un reload. **No** hay botón de reconectar:
al **Guardar**, `ensurePermission(handle, true)` re-pide permiso en ese momento;
si el usuario lo deniega/cancela, el documento simplemente sigue «Sin guardar».
Sin File System Access (Firefox/Safari), abrir usa `<input file>` y guardar
descarga el blob (`downloadBlob`).

### Estado en el store y UI
`courseStore`: `activeTab: Tab` (`'editor'|'preview'|'validation'|'report'`,
fuente única de la pestaña activa, también para que el badge de validación
navegue a ella), `linkedFileName`, `projectDirty` + `setProjectDirty`,
`setLinked(name)`. La toolbar (`Toolbar.tsx`) muestra **un único indicador**
`.ed-docstate` (`✓ Guardado · archivo` / `● Sin guardar`) que es un botón =
guardar; un menú **«Archivo ▾»** (`.ed-menu`) agrupa Abrir / Guardar /
Guardar como… / Nuevo (demo) / Exportar SCORM ZIP; y el badge de validación
`.ed-status` enlaza a la pestaña de validación.

## Responsive / móvil
La carcasa es 100% responsive. En `max-width:760px` el menú lateral pasa a
**slide-over** absoluto y el cuerpo ocupa una sola columna
(`.me-body, #me-app.me-menu-hidden .me-body { grid-template-columns: 1fr; }`;
ojo a la especificidad: un conflicto en `grid-template-columns` dejó la pantalla en
blanco en móvil). En vista alumno **no** se muestra el árbol de pantallas del editor.

## Renombrado MecoSCORM → SCORMEditor (jun 2026)
La app se llamaba MecoSCORM. Se renombró **todo** a SCORMEditor: carpeta del repo,
`package.json` (`name: scormeditor`), id por defecto del manifiesto/CLI
(`SCORMEDITOR-COURSE`), `brand`, diálogos de guardado, docs y la base IndexedDB
(`DB_NAME = 'scormeditor'`). No deben quedar referencias a «mecoscorm» en el código.

## Ingesta: el GPT generador y los ficheros de conocimiento (`docs/`)
El contenido de los cursos **no se teclea a mano**: lo genera un **GPT de ChatGPT**
(diseñador instruccional) a partir de un PDF/Word, y SCORMEditor lo abre. Ese GPT es
la «fuente» del documento, así que su contrato de salida y el formato que abre el
editor **deben ir sincronizados**.

- **Salida del GPT = `.scormproj`** (no un `course.json` suelto). Decidido jun 2026:
  antes «escupía» un JSON; ahora, con Code Interpreter, empaqueta el mismo
  `course.json` + las imágenes extraídas del PDF en el ZIP `.scormproj` que abre el
  editor. Fallback (sin Code Interpreter): solo `course.json` en texto.
- **Invariante de ingesta (la que importa al mantener el formato):** las claves de
  las entradas `assets/…` del ZIP que produce el GPT deben **coincidir literalmente**
  con las rutas que el `course.json` referencia (`visual_resource.src`,
  `hotspots.image`, `tracks[].src`, `audio_src`). Es el mismo contrato que
  `loadProjectFromBlob()` espera (ver sección de Persistencia). Si una imagen no
  existe, el GPT pone `kind:"none"` + nota en `editor_notes`, nunca un `src` roto.
- **Arquitectura de los docs (jul 2026):** las Instructions llevan solo los
  **guardarraíles siempre activos**; el detalle es **material de referencia** en los
  archivos de Knowledge. Las Instructions ordenan al GPT **leer** esos docs con Code
  Interpreter antes de generar (así el Knowledge se consulta de verdad, no solo por
  RAG). Motivo: el campo Instructions tiene un **límite duro de 8000 caracteres**
  (verificar con `wc -m` tras editar `instrucciones-gpt.md`).
- **6 ficheros de conocimiento en `docs/`** (mantenerlos al día si cambia el formato
  `.scormproj`, el esquema de `course.json`, `autosave.ts` o el `renderer.js`):
  - `instrucciones-gpt.md`: system prompt (Instructions). Solo guardarraíles.
  - `contrato-course-json.md`: referencia normativa del `course.json`; §4.1 markdown/
    callouts/formato, **§11 Empaquetado `.scormproj`** (builder Python `build_scormproj`
    / `extract_pdf_images`). **Manda en caso de conflicto.**
  - `ejemplo-course-json.md`: ejemplo dorado (few-shot) de un `course.json` válido.
  - `guia-diseno-interacciones.md`: criterio pedagógico (segmentación, formato,
    interacciones, callouts, antipatrones).
  - `flujo-factoria-unidades.md`: procedimiento por fases para **unidades grandes**
    (inventario → temas parciales auditables `.scormpart` → fusión), con control de
    cobertura y helper `merge_unit`.
  - `referencia-rapida.md`: modos, valores por defecto, accesibilidad, SEPE, evaluación
    y checklist de validación.
- **Criterios de contenido acordados (jul 2026), viven en esos docs:** (1) **Regla
  Nº1** — conservar el texto de origen **casi al 100%** (ratio ≥0.95), sin resumir ni
  reescribir; extraer **con formato** (negritas, cajas→callouts) vía PyMuPDF
  `get_text("dict")`, no en plano. (2) **Modo factoría** para unidades: nunca en una
  pasada (no cabe → resume), tema a tema con parciales. (3) Formato: `title` corto (no
  fragmento del texto ni repetido en el cuerpo), sin pantallas vacías, listas con `- `
  una por línea, encabezados solo-título, sin rótulos por diapositiva. (4) Interacciones
  repartidas cada 4-8 pantallas (no al final).
- El GPT también lee una copia del contrato en el `Downloads` del usuario; al tocar
  el de `docs/` hay que **sincronizarla** (`cp`). La subida al GPT se hace desde estos
  ficheros.

## Convenciones del repo
- Idioma de UI, comentarios y commits: **español** (con acentos correctos).
- Sin dependencias nuevas salvo necesidad real (hoy: React, zustand, zod, JSZip,
  dnd-kit). Preferir soluciones ligeras y propias.
- Verificar con `npm run build` (corre `tsc -b` + `vite build`) antes de dar por
  hecho un cambio.
- Clases CSS de la carcasa con prefijo `me-`; clases del editor con prefijo `ed-`.

## Roadmap inmediato (acordado)
- **Animación secuencial** del contenido: revelar bloques en cascada. Encaja
  limpiamente porque cada bloque (`<p>`, `<li>`, callout) ya sale como elemento
  independiente; se haría marcándolos con `data-reveal` y revelándolos desde
  `app.js`. Aún no implementado.
