# Arquitectura y runtime (carcasa)

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`. Invariantes (una sola fuente,
> anti-XSS) viven en `CLAUDE.md`; aquí va el **detalle** del render de la carcasa.

## Dos mundos
- **Editor** (`src/` salvo `src/runtime/`): SPA React+TS+Vite+Zustand+Zod.
- **Carcasa/Runtime** (`src/runtime/`): HTML/CSS/JS **plano, sin framework ni build**,
  se copia *verbatim* dentro del ZIP SCORM. El editor la carga con
  `import.meta.glob('../runtime/**', { query:'?raw' })` (`src/scorm/runtimeAssets.ts`);
  Vista estudiante (`buildPreview.ts`) y export ZIP consumen los mismos strings.
- ⚠ Un fichero JS nuevo del runtime hay que añadirlo en DOS sitios: `index.html` y
  `jsOrder` de `buildPreview.ts` (el glob del ZIP lo copia solo y el manifiesto deriva su
  lista de ese mismo glob).
- La app se llamó MecoSCORM; no deben quedar referencias a «mecoscorm» en el código.

### Excepción deliberada: pantallas «pendiente de revisión»
`screen.review.flagged` (+ `review.note`) es la única excepción hoy a «Vista estudiante
= export» (ver CLAUDE.md). No es una rama de comportamiento del runtime — es el mismo
`.js`/`.css` en los dos sitios — sino que el export recibe **menos datos**:
`stripFlaggedForReview` (`src/schema/review.ts`) quita esas pantallas de `course.json`
antes de `buildScormZip`/`buildElpx` (y antes de `collectAssetPaths`, así sus assets
exclusivos tampoco se empaquetan). Como el `course.json` real nunca las contiene, la
carcasa exportada no necesita saber nada de `review`: el aviso visual
(`.me-screen-review` borde rojo grueso + `.me-review-banner` con la nota, `render()` en
`renderer.js`) solo se ejerce en la práctica dentro de Vista estudiante, sin `if` de
entorno en el runtime. Detalle de la UI de marcado en `editor-pantallas.md` («Revisión
pendiente»).

## Manifiesto y metadatos SCORM
- **La lista de `<file>` del manifiesto se deriva de `getRuntimeFiles()`** (el mismo glob
  que alimenta el ZIP) + `data/course.json` + `imslrm.xml` + los assets referenciados:
  un fichero nuevo en `src/runtime/` entra solo, imposible desincronizarse
  (`src/scorm/manifest.ts`).
- **`imslrm.xml`** (`generateLomMetadata`): metadatos LOM (IMS MD 1.2) con título,
  idioma, descripción y autoría desde `course.json`, referenciado con
  `<adlcp:location>` en el `<metadata>` del manifiesto. Moodle los muestra al importar.
- **Sin `xsi:schemaLocation`**: declaraba XSDs que no viajan en el paquete; los
  validadores estrictos (ADL) piden coherencia — o se incluyen los XSD o no se declaran.
- El `manifest identifier` es `course.scorm.identifier` (estable entre re-exportaciones:
  el LMS conserva el tracking al re-subir el paquete; misma decisión que eXeLearning
  #1785). No regenerarlo nunca automáticamente.

## Texto enriquecido (markdown ligero)
Editor: `src/components/RichTextArea.tsx` (ver `editor-richtext.md`).
Render: `mdToHtml`/`blocksToHtml` en `src/runtime/assets/js/renderer.js`.

Sintaxis soportada:
- `## ` / `### ` encabezados (H1 reservado al título de pantalla). Además, una línea que
  es **solo negrita** (`**Título**`, con `:` opcional) se renderiza como `<h3>` (para
  títulos que el origen trae en negrita en vez de con `##`).
- `**negrita**`, `*cursiva*`, `[texto](url)` (http(s) o mailto). Los enlaces se abren en
  otra pestaña (`target="_blank" rel="noopener noreferrer"`, ver `rich()`).
- `- ` listas con viñetas (también acepta `*`, `•`, `·`, `–`, `—` al inicio de línea,
  porque los PDF/DOC suelen usarlos); `1. ` / `1) ` listas numeradas (honra el número
  escrito con `<ol start>`/`<li value>` cuando no van consecutivos).
- Bloques destacados (callouts): `::: tipo` … `:::`
- Bloque personalizado: `::: custom | #color | icono | título` … `:::`
- Imagen en línea propia: `![alt](assets/img/… | https://…)` → `<figure class="me-md-img">`
  ampliable con el lightbox. Ancho opcional en % con `![alt|50](ruta)` (clamp 10–100,
  `style="width:NN%"`). Solo bloque (no inline) y solo rutas `assets/` o http(s).
  Botón 🖼 en la barra del editor y barra contextual «Imagen» (ver `editor-richtext.md`).

Ninguna plantilla de `renderer.js` muestra `objective` como banner — tampoco la pantalla
`objectives`: su `student_text` ya presenta los objetivos al alumno y pintarlo duplicaba
el contenido. `objective` queda como **metadato de trazabilidad** (el validador sigue
exigiéndolo salvo en `scorm_cover`/`cover`/`module_cover`/`summary`).

### Bloques destacados y paleta corporativa
Los tipos viven en `CALLOUTS` (`renderer.js`) y su color en
`src/runtime/assets/css/styles.css` (`.me-callout-*`). Colores alineados con la
**paleta oficial de teleformación** (tabla "Tabla de Elementos Clave para Formación
Online.odt" en Google Drive; ver memoria `paleta-teleformacion`):

| Color | Hex | Bloques |
|---|---|---|
| Turquesa | `#6DC3C0` | 💡 Consejo (`tip`), 🧠 ¿Sabías que…? (`fact`), 📌 Importante (`important`) |
| Naranja | `#F4C910` | ⚠️ Atención (`warn`), 💭 Reflexiona (`reflect`), 🧪 Caso práctico (`case`) |
| Violeta | `#7787BF` | ℹ️ Información (`info`) |
| Rosa | `#F4D6D2` | (color por defecto del bloque personalizado) |

Decisiones: se adoptó la paleta de 4 colores (varios bloques **comparten color**, como
en la tabla original); **no** se añadieron como bloques fijos todos los elementos
(Tablas, Actividad, Referencias, Glosario, Debate, Tests): quedan cubiertos por el
bloque personalizado.

### Bloque personalizado
Botón **✚ Personalizado** en la barra abre un panel con **icono, título y color**
(el icono va a la izquierda del título). Acciones: **Cancelar** (cierra y limpia el
borrador), **Insertar** (lo mete una vez) y **Guardar y usar** (lo persiste como **preset
reutilizable**; deshabilitado si no hay ni título ni icono, porque un preset necesita algo
que lo etiquete).

- **Icono opcional, elegible con un clic**: no se pega texto; hay un botón tamaño-icono
  (muestra el icono o `＋`) que abre una **rejilla de emojis** curada (`ICONS` en
  `RichTextArea.tsx`, ~100 iconos de formación) más la opción **∅ Sin icono**. Se cierra al
  elegir o al hacer clic fuera.
- **Arranca vacío**: sin icono ni título por defecto. Si **ambos** quedan vacíos, el runtime
  (`renderCustomCallout`) **no pinta cabecera**: solo el filete de color + el cuerpo. Si hay
  solo uno, se muestra ese.
- **Formato de la valla**: `::: custom | #color | icono | título`. Ojo: tras `::: custom` el
  resto empieza por `|`, así que el primer segmento del `split('|')` llega vacío y
  `renderCustomCallout` lo descarta (`parts.shift()`) para que color/icono/título caigan en
  su sitio.
- **Presets** en `localStorage` (`src/store/customBlocks.ts`, clave
  `scormeditor.customBlocks`), **no** en `course.json` (cada bloque se exporta ya resuelto en
  el texto). Un preset vale si tiene `color` y al menos `title` **o** `icon`.
- **Seguridad**: el color se valida como hex antes de inyectarlo en `style` (anti-inyección
  CSS); icono y título se escapan con `esc()`.
- **Editar / quitar** un bloque ya escrito se hace desde la **barra de bloque** (con el cursor
  dentro): **✎ Editar** reabre el diálogo precargado y reescribe **solo la cabecera** (respeta
  el contenido); **⤯ Quitar formato** (`unwrapBlock`) borra cabecera y cierre y deja el texto
  plano, sin borrar contenido. Detalle en `editor-richtext.md`.

## Recursos visuales
- `visual_resource` admite `layout` (`top`/`bottom`/`left`/`right`, def. `top`) y
  `media_width` (`33`/`50`/`66`, def. `50`). La maquetación texto+media
  (`.me-layout`/`.me-media`/`.me-mw-*`) aplica en **todas** las plantillas, no solo en
  content/route/video (un fallo histórico fue limitarlo).
- Solo en `top`/`bottom`: `media_align` (`left`/`center`, def. `left`) y `media_full`
  (bool, def. `false`) → clases `.me-media-center` / `.me-media-full` que centran o estiran
  el recurso al 100% del ancho. Defaults = comportamiento previo (izquierda, tamaño
  intrínseco hasta el 100%). En el editor es un **único control segmentado «Ajuste»**
  (iconos ◧/▣/▬ = Izquierda/Centrada/Ancho 100%, estados excluyentes) que solo aparece con
  disposición arriba/abajo y mapea a esos dos campos (glifos de texto para alinear en
  altura con Disposición/Proporción; `.ed-seg button` tiene tamaño fijo).
- **Vídeo embebido (YouTube)**: el marco `.me-video` fija la proporción con
  `aspect-ratio` y el `<iframe>` la llena en absoluto (`inset:0; height:100%` — sin alto
  explícito un iframe se queda en sus 150px por defecto, fallo histórico). Alto mínimo de
  seguridad 240px solo en el marco `div.me-video` (el `<video>` de archivo conserva su
  alto intrínseco). `media_ratio` (`16x9` def./`4x3`/`1x1`/`9x16`) elige la proporción
  vía clase `me-ratio-*`; el vertical 9:16 se acota a 380px de ancho y `.me-media-center`
  lo centra con `margin-inline:auto` (text-align no centra bloques con max-width). El
  mismo CSS cubre el YouTube de la interacción `video` (comparte `.me-video`).
- **Assets en preview**: blobs vía `window.__ASSETS__` (mapa id→blobURL);
  `assetUrl()`/`asset` resuelve. En export, los ficheros van al ZIP y al manifiesto.
  **La caché de blob URLs (`assetUrlCache` en `StudentPreview.tsx`) vive a nivel de
  MÓDULO, no dentro del componente** — bug real ya sufrido: las imágenes se veían bien en
  el Editor (mismo `assets` del store) pero nunca en Vista estudiante, con
  `net::ERR_FILE_NOT_FOUND` sobre la propia blob URL en la consola del iframe. Causa:
  `React.StrictMode` (activo en desarrollo) monta cada componente, ejecuta la limpieza de
  sus efectos una vez de más y vuelve a montarlo (para detectar fugas); si las blob URLs
  se crean y revocan dentro de un efecto propio del componente, esa limpieza extra revoca
  las URLs recién insertadas en el `<iframe>` sin volver a crearlas. La caché de módulo
  (`resolveAssetUrls`, idempotente: misma entrada → mismo resultado, solo revoca cuando un
  asset cambia o desaparece del proyecto) sobrevive intacta a ese doble montaje porque no
  depende del ciclo de vida del componente.

## Lenguaje visual de la carcasa
- **Acento** `--me-accent` (turquesa `#6DC3C0` de serie) para **estructura**: filo
  superior de la tarjeta `.me-screen`, pantalla actual del menú (fondo + barra izquierda),
  pestaña activa, accordion abierto, flip-card pulsada, portadas (más abajo) y barra de
  progreso (`.me-progress-bar`/`-done`; no hay ya una variable `--me-progress` aparte —
  se consolidó en `--me-accent`, siempre eran el mismo valor). El azul `--me-primary`
  (de serie) queda para **acciones** (botones, enlaces, focus, hover de opciones).
- **Paleta configurable por curso** (`shell.primary_color`/`shell.accent_color`,
  `course.schema.ts`): ambos son hex libres, sin restricción a una lista cerrada —
  `applyBranding()` (app.js) los vuelca como *inline style* sobre `documentElement`
  (`--me-primary`/`--me-accent`), así que pisan el valor de `:root` en styles.css sin
  tocar el fichero. Editor: sección **Marca y color** de ⚙ Ajustes → Interfaz
  (Apariencia) (`AppearanceSection`, `editor-ui.md`) — un selector de **paletas típicas**
  (`PALETTES` en `CourseSettingsEditor.tsx`: la corporativa de serie, «Mecohisa» —
  `#8492b6`/`#f5ca00`, la de la empresa — y 4 combinaciones más) aplica ambos colores de
  un clic, y dos pickers libres debajo permiten desviarse de cualquier preset. Como son
  dos variables CSS y no un tema empaquetado, cualquier color que el autor elija llega a
  los mismos sitios que el turquesa/azul de serie — no hay que mantener una lista de
  reglas por paleta.
  - **Símbolos «+» de expandir → color de acción, no de estructura**:
    `.me-acc-head::before`/`.me-tl-head::before` (accordion/timeline) y `.me-flip-tab`
    (flip_cards/flashcards/image_cards) usaban `--me-accent`; con un acento claro (p. ej.
    el amarillo de «Mecohisa») el símbolo perdía contraste sobre fondo blanco, o el
    blanco encima del propio `.me-flip-tab` lo perdía sobre el acento. Los tres se
    pasaron a `--me-primary` — mismo color que ya usaba `.me-hotspot::after` desde
    siempre.
  - **Botón de volumen → sin color de tema, como el resto de controles** (imprimir,
    ayuda, transcripción…): tuvo brevemente color de acento y luego de acción, pero el
    estado on/off ya lo marca el icono (`volume-on`/`volume-off`) y `aria-pressed`; un
    color encima solo lo hacía destacar sin necesidad y además dependía de que el color
    de turno contrastara bien. `#me-btn-audio` no lleva regla de color propia.
  - Al elegir los dos colores de una paleta, el más oscuro/saturado de los dos conviene
    como **acción** (soporta texto blanco encima en botones, `.me-check`, `.me-flip-tab`…
    y ahora también estos símbolos) y el más claro como **estructura** (solo se usa en
    fondos tenues o se oscurece automáticamente, como en la portada de módulo) — con
    «Mecohisa» el azul grisáceo `#8492b6` es la acción y el amarillo `#f5ca00` la
    estructura, no al revés, precisamente por esto.
  - Único cuidado restante: `.me-module-cover` deriva su fondo oscuro directamente de
    `--me-accent` (ver la portada de módulo, más abajo), así que un acento muy claro
    reduce ese margen de contraste (mitigado con un mix generoso hacia negro, no
    garantizado al 100% para cualquier hex).
- **Elevación** con sombras (`--me-shadow-1`/`-2`) en vez de solo bordes: tarjeta de
  pantalla, cards (hover se eleva), botones (hover sombra, active se hunde 1px).
- **Tipografía**: H1 1.9rem/800/track -.015em; H2 1.35; body line-height 1.6.
- **Transición de pantalla**: `.me-screen` entra con fade+slide (`me-screen-in`, 220 ms);
  funciona sola porque `renderScreen` recrea el nodo. `prefers-reduced-motion` desactiva
  `transition` **y** `animation`.
- **Portada unificada (`type: 'cover'`) — el diseño lo decide el NIVEL, no el
  tipo**: un solo tipo de pantalla para las tres portadas (paquete SCORM, módulo,
  unidad); ninguna es un campo fijo del esquema. `render()` (`app.js`) calcula
  `ctx.coverLevel` (`'course'`/`'module'`/`'unit'`) mirando `entry.module`/`entry.unit`
  de **esta** pantalla en `SCREENS` y lo pasa a la plantilla como segundo argumento
  (`tpl(screen, ctx)`, solo la plantilla `cover` lo usa) — mover la pantalla de sitio
  (botón «Subir de nivel», arrastre en el árbol, editar `course.json` a mano) le cambia
  el diseño sin retipar nada, porque el nivel se recalcula en cada render. Dos
  registros, no tres:
  - **`'unit'`** — hero **contenido** en la tarjeta `.me-screen`: título grande
    centrado sobre banda degradada suave del acento, prose centrada a 560 px. Kicker
    `.me-cover-kicker` con el rótulo personalizable de unidad (`ctx.unitLabel`, por
    defecto «Unidad» — `course.unit_label`, ver «Terminología» en `editor-pantallas.md`).
  - **`'module'`/`'course'`** — mismo tratamiento a sangre completa (`.me-module-cover`):
    **rompe el margen de la tarjeta** con márgenes negativos que igualan el padding de
    `.me-screen` en cada punto de corte (bordes a ras en los cuatro lados, como el
    separador de capítulo de un libro de texto) y usa un **fondo sólido oscurecido**
    (`color-mix(in srgb, --me-accent 50%, black)`, no el acento a secas — con texto
    blanco encima no llega a contraste AA) con texto y enlaces en blanco
    (`.me-module-cover a`, subrayado: el azul `--me-primary` del resto del runtime
    queda casi invisible sobre ese fondo). `'module'` lleva kicker con
    `ctx.moduleLabel` (por defecto «Módulo»); `'course'` (portada del paquete SCORM,
    entre `course.intro_screens`) va **sin** kicker — un paquete SCORM puede
    representar un curso entero, un módulo, una unidad o un tema suelto según el
    contenido, y esa portada no debe presuponerlo (ni siquiera con el rótulo
    personalizable, que es por módulo/unidad, no por paquete).

  Impresión: `print-color-adjust: exact` en `print.css` conserva el fondo oscuro de
  `'module'`/`'course'` — sin eso, con «gráficos de fondo» desactivado en el diálogo de
  impresión, el texto blanco desaparecería sobre papel blanco. Ninguno de los tres
  niveles pinta la miga «Módulo › Unidad» (rompería el hero) ni exige `objective` ni
  recomienda interacción (`COVER_INTERACTION` en `validators.ts`) — comprobado por
  `type === 'cover'` a secas, ya no hace falta enumerar tres tipos.
  `SCHEMA_VERSION` `1.1.0` migra `module_cover`/`scorm_cover` a `cover`
  (`src/schema/migrations.ts`) para proyectos guardados antes de la unificación.
- **Accordion/tabs animados**: chevron `▸` rotatorio en `.me-acc-head::before`; cuerpos y
  paneles aparecen con `me-reveal` (corre al pasar de `display:none` a visible).
- **Feedback de interacciones**: la opción elegida se marca en el propio elemento
  (`.is-right`/`.is-wrong`: color + icono ✔/✖, no solo color), también al **restaurar**.
  Error hace `me-shake`; la caja `.me-feedback` aparece con `me-pop`. Como los nodos
  persisten entre intentos, `replay()` (interactions.js) reinicia la animación forzando
  reflow. Flip 3D: ver `interacciones.md` (afecta también a `print.css`).
- **Resultados**: la nota sube animada (`animateNumber`, rAF + easing) y al quedar APTO
  suena **confeti propio** (`celebrate()` en app.js: canvas efímero `.me-confetti`, paleta
  corporativa, ~2,4 s, una vez por sesión). Todo respeta `prefers-reduced-motion`.
- **Menú con progreso por unidad**: `buildMenu` marca cada unidad con
  `data-start`/`data-count`; `refreshMenuChecks` rellena el contador «hechas/total»
  (`.me-menu-count`) y la mini-barra (`.me-menu-uprog`).
- **Curso sin pantallas** (estructura vacía en el editor, sin test final): `setup()`
  corta antes de `goTo` con un mensaje amable en `#me-content` y navegación
  deshabilitada (`refreshNavState` y `startMinTimer` toleran `SCREENS` vacío) — antes
  rompía leyendo `SCREENS[0]`.
- **Pantallas propias del módulo** (`module.screens`): `flatten()` las inserta en la
  lista plana **antes** de las de sus unidades (con `unit: null` — el resto del runtime
  ya tolera ese null: crumb, progressSnapshot, gating). En el menú cuelgan del título
  del módulo en un bloque `.me-menu-modscreens` sin rótulo de unidad ni mini-barra
  (`refreshMenuChecks` tolera la ausencia de contador/barra). Ese orden replica el de
  `screenContainers()` en el editor (`src/schema/traverse.ts`) — mantener ambos en
  sincronía.
- **Cabecera sin marca por defecto**: `shell.brand` tiene default vacío; sin marca,
  `applyBranding` oculta `#me-brand`, añade `.me-no-brand` a la topbar y el título del
  curso pasa a ser el único texto (destacado; en móvil deja de ocultarse). El valor
  histórico `'SCORMEditor'` se trata como «sin marca» para proyectos antiguos.
- **Iconos SVG propios** (`assets/js/icons.js`): mini-set con paths de **Feather Icons**
  (MIT), trazo 2px, 24×24, `stroke: currentColor`. Declarativo: cualquier
  `[data-icon="nombre"]` se rellena al cargar (`MEIcons.hydrate`); programático:
  `MEIcons.svg('printer')`. Tamaño por CSS sobre `.me-ico`. Pensado para reutilizarse
  (p. ej. futuros iconos de callouts).
- **Dimensiones de la tarjeta**: `.me-screen` se estira hasta llenar TODO el alto
  disponible del área de contenido (`.me-content` es columna flex; la tarjeta lleva
  `flex: 1 0 auto` — crece, nunca encoge: con contenido largo hay scroll normal). El
  `min-height: clamp(360px, 60vh, 540px)` (móvil: `clamp(260px, 50vh, 440px)`) queda como
  red de seguridad. `max-width: 960px` para aprovechar pantallas grandes y el modo
  pantalla completa (formato clásico 960×540 de las herramientas de autor). En impresión
  se anulan flex y altura mínima (print.css).
- **Pantalla evaluable — tarjeta amarilla, icono, prefijo y etiqueta, todo en el
  título**: cuando `interaction.scored` es true y las actividades cuentan para la nota
  (`ctx.showScoredBadge` desde app.js, `score_source !== 'final_test'`), `render()`
  (renderer.js, flag `isScored`) añade la clase `.me-screen-scored` al `<article>` y
  reescribe el `<h1>` ya renderizado (DOM, no toca `course.json`: el GPT/autor siguen
  escribiendo el título del tema tal cual, sin anunciar el tipo — ver
  `guia-diseno-interacciones.md`) con tres piezas:
  - `.me-h1-text`: icono lápiz (`MEIcons.svg('edit-3')`, icons.js — mismo icono que
    «Actividad ✏️» en la paleta corporativa) + `"Actividad: "` + el título original.
  - `.me-scored-badge`: la píldora «Evaluable» (antes flotaba absoluta sobre toda la
    tarjeta `.me-screen`; ahora vive **dentro** del `<h1>`, empujada al lado opuesto por
    `display:flex` en `.me-screen-scored > h1`). Azul `--me-primary` diluido para que no
    se funda con el amarillo.
  - El propio `<h1>` y el `.me-prose` (descripción/`student_text`) se pintan como una
    sola pieza visual —mismo amarillo corporativo de acción/actividad que los callouts
    `::: warn`/`reflect`/`case` (`--me-warn`, `#F4C910`), bordes que se tocan sin hueco
    entre ambos—; el recurso visual (imagen/vídeo), si lo hay, queda **fuera** de la
    tarjeta.

  Es una señal a nivel de **pantalla**, no de interacción: `header()` en
  `interactions.js` (enunciado/`instructions` de la interacción en sí) no cambia, ver
  `interacciones.md`.
- **Miga «Módulo › Unidad»**: rótulo `.me-crumb` sobre el título de cada pantalla con el
  módulo y la unidad a los que pertenece (uppercase pequeño en `--me-muted`, como los
  rótulos del menú), para que el alumno se ubique aunque el menú lateral esté plegado o
  en móvil. app.js pasa `ctx.crumb` (títulos de `entry.module`/`entry.unit`) y `render()`
  (renderer.js) lo pinta. No sale en ninguna portada (`cover`/`module_cover`, rompería el
  hero), ni en test final/resultados (pantallas sintéticas sin unidad), y si módulo y
  unidad repiten título solo se muestra uno. Lleva `padding-right` para no pisar la
  píldora «Evaluable».

> El chrome de navegación (topbar, menú lateral, barra inferior) vive en
> `carcasa-navegacion.md`, doc hermano de este.

### Niveles de animación (`shell.motion`)
`shell.motion` (`none`/`subtle` def./`rich`; editable en ⚙ Ajustes → Interfaz
(Apariencia)) pone `body.me-motion-<nivel>` en `applyShell`:
- **`none`**: mata toda animación/transición por CSS (y `celebrate()` no lanza confeti).
- **`subtle`** (defecto): el lenguaje visual base tal cual.
- **`rich`**: además, **revelado progresivo** (`applyReveal` en app.js): en la **primera
  visita** de cada pantalla los bloques visibles (`.me-prose > *`, `.me-media`,
  `.me-interaction`, `.me-transcript`) entran en cascada (70 ms/bloque, tope 560 ms) y
  los que quedan bajo el pliegue esperan (`.me-rv-wait`, `opacity:0`) hasta entrar en el
  viewport (`IntersectionObserver` con `root` = `#me-content`) → clase `.me-rv`. Extras
  CSS bajo `body.me-motion-rich`: cada bloque entra con un **gesto propio** (fade +
  transform, nunca solo fade): callouts deslizan desde su borde (`me-rv-callout`),
  encabezados h2/h3 desde la izquierda (`me-rv-heading`), el media —imágenes/vídeo—
  con zoom pronunciado (`me-rv-media`, scale .8), y los ítems de
  accordion/cards/timeline/chips en cascada `nth-child` **solo** si su `.me-interaction`
  lleva `.me-rv` (primera visita). En `rich` las entradas van **más lentas**: las
  duraciones viven en dos variables CSS (`--me-anim-dur` entrada de pantalla,
  `--me-rv-dur` revelado) que `body.me-motion-rich` sube a .45s/.55s (defecto
  `subtle`: .22s/.32s); los retardos de la cascada `nth-child` van aparte (90 ms/ítem
  en rich).

**Velocidad** (`shell.motion_speed`): `fast`/`normal` def./`slow`, editable en ⚙ Ajustes
→ Interfaz (Apariencia), deshabilitado con `motion: none`. `applyBranding` pone
`body.me-speed-<v>` → variable `--me-speed` (fast 1 / normal 1.5 / slow 3, calibrado a
ojo con el usuario) que **multiplica** con `calc()` todas las duraciones y retardos de
entrada; los delays JS de `applyReveal` (70 ms/bloque, tope 560 ms) escalan con el mismo
factor (`SPEED`). Afecta solo a las **entradas** (pantalla y revelado), no a
hovers/feedback, que deben seguir siendo inmediatos.
Decisiones deliberadas: **nunca temporizar por tiempo de lectura** (el ritmo lo pone el
alumno con el scroll); `REVEALED` (por sesión) evita re-animar pantallas ya vistas; sin
`IntersectionObserver` o con `prefers-reduced-motion` todo se muestra al instante; solo
`opacity`/`transform` (contenido siempre en el DOM → lectores de pantalla OK) y
`print.css` fuerza todo visible en papel. Compatible con cualquier navegador que use
Moodle (IO es 2019+; hay degradación).

## Impresión
El botón **Imprimir** llama a `window.print()`. `src/runtime/print/print.css` reduce la
salida a **solo la pantalla actual**: oculta topbar (transcripción/audio/glosario/recursos/
imprimir), menú lateral, toolbar (anterior/siguiente), modales y botones «Comprobar». En el
ZIP se enlaza con `media="print"` (`index.html`); en **Vista estudiante** `buildPreview.ts`
lo inyecta como `<style>` en el `srcdoc` del iframe (ya viene envuelto en `@media print`),
porque si no el preview imprimía toda la interfaz. Las interactividades **informativas**
ocultan contenido tras un clic; para que el papel sea completo, `setupPrint()` (`app.js`)
se engancha a `beforeprint`/`afterprint` (así vale igual con el botón y con Ctrl+P) y,
solo durante la impresión, **expande** desplegables (`accordion`), pestañas (`tabs`) y
tarjetas (`flip_cards`), restaurando el estado al terminar. En pestañas, como el DOM lista
primero todos los botones y luego los paneles, se **oculta la barra de pestañas** y se
inyecta un rótulo (`.me-print-tablabel`) con el título de cada pestaña sobre su panel. Las
interactividades **evaluables** no se expanden (no se imprimen respuestas correctas).

## Responsive / móvil
La carcasa es 100% responsive. El menú lateral pasa a **slide-over** absoluto y el cuerpo
ocupa una sola columna (`.me-body, #me-app.me-menu-hidden .me-body {
grid-template-columns: 1fr; }`; ojo a la especificidad: un conflicto en
`grid-template-columns` dejó la pantalla en blanco en móvil) por debajo del punto de corte
documentado en `carcasa-navegacion.md` («Punto de corte de la versión móvil»). En vista
alumno **no** se muestra el árbol de pantallas del editor.
