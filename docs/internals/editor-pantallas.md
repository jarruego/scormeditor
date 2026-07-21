# Árbol y edición de pantallas (`CourseTree`, `ScreenEditor`, `FinalTestEditor`)

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`. Lo transversal del editor
> (⚙ Ajustes, iconos, sync, historial…) está en `editor-ui.md`; el editor de texto
> enriquecido en `editor-richtext.md`.

## El árbol (`CourseTree.tsx`)
Módulos → unidades → pantallas (reordenables con dnd-kit) + secciones «Evaluación» (test
final) y «Materiales» (glosario/bibliografía). Añadir pantalla por unidad **o por módulo**;
duplicar/eliminar por pantalla (eliminar pide confirmación con `confirmDialog`, nombrando
la pantalla).

- **Pantallas propias del módulo** (`module.screens`, portada/presentación del bloque):
  van **siempre antes de las unidades** del módulo — decisión deliberada: intercalarlas
  entre unidades complicaría el orden lineal y el menú para un caso de uso dudoso. En el
  árbol se listan bajo el título del módulo (`.ed-module-screens`, mismo `ScreenItem` con
  puntos de inserción) con su botón «Añadir pantalla al módulo…» (mismo `AddScreenModal`;
  las recetas evalúan `uniquePerUnit` y `defaultTitle` contra el módulo). El recorrido
  canónico módulo→(pantallas de módulo)→unidades vive en `src/schema/traverse.ts`
  (`screenContainers`/`allScreens`) — cualquier código nuevo que recorra pantallas debe
  usarlo, no el doble bucle. En el store, `addScreen`/`moveScreen` aceptan como
  contenedor el id de una unidad o de un módulo, y `Located.ui === null` señala pantalla
  de módulo.

- **Unidades plegables**: cada unidad es un `<details className="ed-tree-unit">` con
  chevron rotatorio y contador de pantallas (con filtro activo, «visibles/total»). La
  `key` incluye el estado del filtro para remontarse abierta al (des)activarlo. El estado
  plegado/desplegado se guarda por unidad en `useTreeFold` (store zustand de UI local a
  `CourseTree.tsx`): así sobrevive al cambio de pestaña (App desmonta el aside fuera de
  la pestaña Editor). No entra en el historial de deshacer ni en el proyecto; con filtro
  activo la unidad se fuerza abierta sin tocar lo guardado.
- **Filtro** (`.ed-tree-filter`): por título o etiqueta de tipo; oculta unidades sin
  coincidencias y las secciones Evaluación/añadir mientras está activo. El dnd sigue
  funcionando (mueve por id, no por índice visible).
- **Iconos por tipo** en cada pantalla (`screenTypeIcon` en `labels.ts`) + marca de
  interacción: muestra el **icono del tipo de interacción real** (con su color y
  `title`), no un puzzle genérico; si `interaction.scored`, marca «⭐ evaluable»
  (`.ed-eval`, en ámbar).
- **Validación en contexto**: el árbol calcula `validateCourse` (memoizado por curso) y
  muestra badge ⛔/⚠ por pantalla (`IssueBadge`); el `ScreenEditor` muestra la lista de
  issues de la pantalla abierta (`.ed-inline-issues`) encima del formulario. Los `info`
  no se muestran en contexto (solo en la pestaña Validación).
- **Auto-scroll**: al seleccionarse una pantalla (recién creada o vía enlaces de
  Validación/Informe), su `<li>` hace `scrollIntoView({ block: 'nearest' })`.

### Estructura desde el árbol y «Nuevo (vacío)»
Sin esto, borrar la estructura demo era un callejón sin salida (no había forma de crear
módulos/unidades):
- **Store**: `addModule()` (módulo al final con una unidad vacía), `addUnit(moduleId)`,
  `removeUnit(id)` y `removeModule(id)` (limpian `selectedScreenId` si la pantalla
  seleccionada estaba dentro), y `resetEmpty()` (curso mínimo vía `Course.parse`: un
  módulo/unidad con la portada; **vacía también los assets**, a diferencia de
  `resetSample`, para no arrastrar binarios del proyecto anterior).
- **Árbol**: «+ Añadir unidad» al pie de cada módulo, «+ Añadir módulo» tras el último
  (`.ed-add-module`), y junto al nombre de módulo/unidad las herramientas discretas
  `.ed-struct-tools`: **▲/▼ para reordenar** — módulos dentro del curso; unidades dentro
  de su módulo y, desde el extremo, **cruzando al módulo adyacente** (al final del
  anterior subiendo, al principio del siguiente bajando — `moveUnit` del store; los
  botones solo se deshabilitan en los extremos globales y el `title` avisa del cruce) —
  y papelera para eliminar. Cada módulo se presenta como **card suave** (`.ed-module`:
  borde y fondo muy leves) para delimitarlo del siguiente; Evaluación y Materiales
  comparten esa presentación. Todas las herramientas cortan el clic
  (`preventDefault`+`stopPropagation`) para no plegar el `details` ni disparar el rename;
  el borrado pide `confirmDialog` **solo si contienen pantallas** (deshacer siempre
  disponible). Se eligió ▲/▼ y no drag&drop para no anidar sortables con el arrastre de
  pantallas (uso ocasional; teclado de serie). Sin módulos, CTA «+ Crear el primer
  módulo» (`.ed-tree-empty`). Todo oculto con el filtro activo, como el resto de
  acciones de creación.
- **Toolbar → Archivo**: «Nuevo (vacío)» sobre «Nuevo (demo)», con la misma confirmación
  de descarte.

### Renombrado inline de títulos estructurales (`InlineRename`)
Los títulos que no son de pantalla se editan **in situ** con `InlineRename`
(`src/components/InlineRename.tsx`): lápiz ✏ → input; Enter/blur confirma, Escape
restaura. Se usa en el **título del curso** (`.ed-course-name` de la `Toolbar` →
`updateCourseInfo({title})`), en **módulos** (`updateModule`) y en **unidades**
(`updateUnit`); las tres acciones coalescen el tecleo en el historial (claves
`courseinfo`/`module:<id>`/`unit:<id>`). El componente detiene la propagación de los
clics para poder vivir dentro del `<summary>` de la unidad sin plegarla.

### Recetas de creación de pantallas (`AddScreenModal` + `screenRecipes.ts`)
«+ Añadir pantalla…» abre un modal (`AddScreenModal`, reutiliza `SettingsWindow`) con
**tarjetas agrupadas por lo que hace el alumno** — Estructura (armazón) / Contenido
(leer, ver, explorar: incluye las interacciones informativas
acordeón/pestañas/tarjetas/línea de tiempo/hotspots) / Práctica (hacer y recibir
corrección: pregunta, emparejar, ordenar, clasificar, huecos, escenario, caso, fichas,
reflexión, foro) / Evaluación (test de unidad) / Otros (placeholder y en blanco,
discretas). El catálogo vive en `src/schema/screenRecipes.ts` (`SCREEN_RECIPES`): cada
receta fija de golpe `type` + recurso visual + interacción + título inicial, para que el
autor novel no combine a mano las tres decisiones. Es una **capa de UI**: no toca el
esquema ni el contrato de `course.json`, y tras crear todo sigue siendo editable (el
desplegable «Tipo de pantalla» queda como ajuste avanzado). Decisiones:
- **Puntuar es el default del grupo, no una promesa de la tarjeta**: Práctica crea con
  `scored: false`, Evaluación con `scored: true`; el subtítulo del grupo
  (`RECIPE_GROUP_HINTS`) lo comunica y las descripciones no mencionan la nota (la
  decisión real vive en la interacción + `score_source` de Ajustes; el aviso
  `SCORM_ACTIVITIES_IGNORED` de `validators.ts` cierra el círculo). Una línea fija al pie
  del modal (`.ed-recipes-note`) aclara que la receta solo preconfigura.
- **Sin tarjeta a propósito**: `html_embed` (interacción avanzada, sandbox) y
  Verdadero/Falso (variante de Pregunta). Glosario y bibliografía tampoco: son materiales
  únicos a nivel de curso (sección «Materiales» del árbol), no pantallas.
- Las interacciones de las recetas se construyen con `Interaction.parse(...)` — los
  defaults del esquema son la única fuente de verdad (no hay literales duplicados).
- `place?: (screens) => number` coloca la pantalla (portada al principio, objetivos tras
  la portada, resumen antes del test, test al final); para ello `addScreen` acepta un
  cuarto parámetro `atIndex` (si falta: tras `afterId` o al final).
- `uniquePerUnit` **atenúa** la tarjeta si la unidad ya tiene ese tipo (tooltip «Ya
  existe…») pero **no bloquea** — aviso blando.
- Las recetas **no** rellenan `student_text` (acabaría exportado) ni `min_time_seconds`
  (ya hay ajuste masivo en Ajustes).
- Tras crear, el foco salta al input de Título (`data-field="screen-title"` en
  `ScreenEditor`). «En blanco» (tarjeta discreta, borde discontinuo) es la vía de escape
  sin preconfigurar.
- `addScreen(containerId, afterId?, preset?, atIndex?)` tipa el preset como
  `Partial<ScreenInput>` (`z.input` del esquema: los campos con default son opcionales).
- **Puntos de inserción** (`InsertPoint`, `.ed-insert`): entre cada par de pantallas del
  árbol hay una zona fina que al pasar el ratón (o enfocar con Tab) revela un divisor con
  «+»; abre el mismo modal con `atIndex`, que **manda sobre** la colocación automática de
  la receta (`place`). Con el filtro activo no se muestran (los índices de la lista
  filtrada no se corresponden con la unidad).

## `ScreenEditor`: layout y jerarquía
El formulario (`.ed-form`) tiene **ancho máximo legible de 960 px, centrado** (al 100 %
en monitores anchos las líneas se hacían kilométricas). Lo primario va siempre visible:
título, objetivo y la **caja de texto principal** (`RichTextArea` de `student_text` a
`rows={16}`, por ser el contenido principal). Las secciones secundarias — **Recurso
visual**, **Audio de locución y transcripción** e **Interacción** — son
`<details className="ed-fold">`: **Recurso visual** va `open`, los otros dos colapsados
por defecto. Se despliegan al pulsarlos (nativo, sin JS ni estado). No usar la
`<fieldset className="ed-group">` para estas tres (esa sigue en Ajustes/Test final/TTS).

Dentro de **Recurso visual**: Tipo de recurso / Disposición / Proporción / Formato van
juntos como **controles segmentados de iconos** (`SegIcons` → `.ed-seg`, `role="group"`),
con `title`+`aria-label` que describen cada opción (no `<select>`); Disposición/Proporción
solo aparecen cuando aplican (recurso visual no-audio; proporción solo con layout
left/right; **Formato** — `media_ratio` 16:9/4:3/1:1/9:16 — solo con YouTube). Al
**cambiar el tipo de recurso**, cada tipo conserva su propia ruta/ID (memoria por
`id:kind` en `vrMemory`, solo de sesión): así una ruta `assets/…` nunca se arrastra como
«ID de YouTube» ni viceversa. Debajo, una **vista previa** del recurso (`MediaPreview`):
imagen/vídeo-archivo/audio se resuelven a object URL desde `assets` (hook
`useObjectUrl`, que libera con `revokeObjectURL`); YouTube se incrusta por ID
(`/embed/`) con la proporción elegida. Si la ruta aún no tiene binario subido, muestra
un aviso en vez de romper.

## Editor sensible al tipo (`screenTypeUI.ts`)
El `ScreenEditor` adapta el formulario al tipo de pantalla según
`src/schema/screenTypeUI.ts` (`SCREEN_TYPE_UI`). Igual que las recetas, es **solo
presentación** (reordena, pliega y sugiere; nunca restringe — lo incongruente lo señalan
los avisos de `validators.ts`):
- **Orden y plegado**: título → objetivo → texto → recurso visual → interacción → audio →
  «Avanzado». En `video` (`mediaFirst`) el recurso va **antes** del texto; la sección de
  recurso se abre si hay recurso (`kind !== 'none'`) y la de interacción si hay
  interacción o el tipo lo pide (`interactionOpen`, p. ej. `unit_quiz`).
- **Título en la cabecera**: no hay campo «Título» aparte ni rótulo «Editar pantalla»; el
  `h2` del formulario (`.ed-form-head`) es un input con aspecto de encabezado
  (`.ed-title-input`, borde solo al pasar/enfocar) que edita `screen.title` directamente,
  con un lápiz al lado que enfoca+selecciona. Conserva `data-field="screen-title"` como
  diana del foco al crear desde receta. El `FinalTestEditor` usa el mismo patrón (chip
  «📝 Test final» en vez del tipo), y `MaterialsEditor` también (helper `EditableHead`):
  ahí el título edita `glossary_title`/`bibliography_title` del curso (campos del
  contrato, con default «Glosario»/«Recursos y bibliografía»), que la carcasa usa como
  rótulo del botón de la barra y título del modal (con el default, el botón conserva el
  corto «Recursos»). El árbol refleja el título personalizado en las filas de Materiales.
- Las secciones usan el helper `Fold` (details **no controlado**: `defaultOpen` solo
  aplica al montar; la `key` por `id`+`type` remonta la sección al cambiar de pantalla o
  de tipo para re-aplicar el énfasis sin pisar lo que el autor pliegue a mano).
- **«Avanzado»** (plegado): tipo de pantalla, tiempo mínimo y obligatoria. El tipo se
  muestra como chip de solo lectura junto al título del formulario (`.ed-form-type`). El
  selector usa `changeScreenType` del store, que al pasar a `video` sin recurso precarga
  `video_youtube` (congruencia mínima).
- **Objetivo oculto** en `cover`/`summary` (`hideObjective`): son los tipos exentos en
  validación.
- **Interacciones recomendadas** (`recommended`): el selector de tipo de interacción
  destaca «Recomendadas para esta pantalla» (`unit_quiz` → tipos de pregunta; `video` →
  vídeo interactivo). La primera recomendada es además el tipo inicial de «+ Añadir
  interacción» (`blankInteraction`, vía `Interaction.parse`), y su puntuación sigue la
  filosofía de las recetas: `scored: true` solo en `unit_quiz`.

## Sección Interacción

### Catálogo declarativo (`interactionRecipes.ts`)
`src/schema/interactionRecipes.ts` es el catálogo de los tipos de interacción, hermano
de `screenRecipes.ts`: icono, descripción «qué hace el alumno», grupo didáctico
(`presentar`/`preguntar`/`manipular`/`juegos`/`media`/`avanzado`), `gradable` (tiene
corrección real → puede puntuar), `supportsAttempts` (el factory del runtime pasa por
`attemptsOf`), `family` (shapes compatibles para migrar contenido al cambiar de tipo) y
`seed()` (estado inicial útil). Las **etiquetas** siguen viviendo solo en `labels.ts`
(no se duplican). Es capa de UI: no toca el contrato. Consumo en `ScreenEditor`:
- **«Intentos»** se muestra según `supportsAttempts` (no hay lista hardcodeada).
- **«Evaluable»/«Puntos»** solo se muestran si el tipo es `gradable` — o si viene
  `scored: true` de un curso importado, para poder desmarcarlo (el checkbox lleva un
  `title` explicando que el tipo es informativo). «Puntos» se **deshabilita** mientras
  `!scored` (estilo global `input:disabled` en `editor.css`); al activar «Evaluable» con
  0 puntos se pone `points: 1` para que puntuar tenga efecto.
- `blankInteraction()` aplica el `seed()` del tipo inicial (p. ej. `true_false` nace con
  «Verdadero» correcta / «Falso»; `single_choice` con 2 opciones, la 1ª correcta).
Al añadir un tipo nuevo al esquema hay que darle también su entrada en el catálogo
(además de la etiqueta en `labels.ts`); `interactionRecipe()` tiene un fallback permisivo
para tipos sin entrada.

### Jerarquía del bloque Interacción (4 partes)
El bloque cuenta una historia en 4 partes (no una pila plana de campos al mismo nivel):
1. **Cabecera** (`.ed-it-head`, con filete inferior): icono + nombre del tipo, «Cambiar
   tipo…» (abre el selector visual), **posición** top/bottom como `SegIcons` de 2
   opciones, y **eliminar** como icono discreto a la derecha (`.ed-it-del`) que confirma
   con `confirmDialog` solo si `interactionHasContent`.
2. **Actividad** (siempre visible): Enunciado, Instrucciones y el
   `InteractionConfigEditor` del tipo.
3. **Fold «Evaluación»** (solo si el tipo es `gradable` — o `scored` importado):
   Evaluable, Puntos e Intentos. `defaultOpen={it.scored}` y **resumen vivo** en el
   `<summary>`: «Evaluación — evaluable · 2 puntos · 1 intento» / «Evaluación — no puntúa»
   (se recalcula en cada render; el estado abierto/cerrado sigue siendo del autor). No hay
   objetivo propio de la interacción: es siempre el `objective` de su pantalla (ver
   «Objetivos de aprendizaje» más abajo); la cobertura `OBJ_NOT_EVALUATED` solo cuenta
   `scored`.
4. **Fold «Feedback»** (plegado; resumen «personalizado»/«por defecto» — comparado contra
   los defaults del esquema, `FB_DEFAULTS` vía `Interaction.parse`): acierto, error y
   explicación pedagógica, con hint «respaldo general» cuando el tipo tiene además
   feedback por opción (familias `options`/`questions`). La excepción `hotspots`
   (feedback por zona en su modal) se conserva dentro del fold.
Los folds anidados llevan `key` por `id`+`it.type` (misma técnica de remontaje que la
sección).

### Selector visual de tipo (`InteractionTypeModal`) y cambio de tipo
El tipo de interacción no se elige en un `<select>` de 24 entradas sino en
`InteractionTypeModal` (`src/components/InteractionTypeModal.tsx`), calco estructural de
`AddScreenModal`: tarjetas `ed-recipe` con icono + descripción del catálogo, agrupadas
por grupo didáctico, con navegación por flechas, marca ⭐ en las que pueden puntuar y
sección «Recomendadas para esta pantalla» arriba si `SCREEN_TYPE_UI` define `recommended`
(las recomendadas aparecen además en su grupo, duplicación deliberada). La tarjeta del
tipo actual se marca (`.ed-recipe.is-current`). Lo abren dos caminos del `ScreenEditor`
(estado local `typePicker: 'add' | 'change'`):
- **«+ Añadir interacción»** → modo `add`: crea con `blankInteraction(tipo)` (seed del
  catálogo; `scored: true` solo en `unit_quiz` **y** si el tipo es `gradable`).
- **«Cambiar tipo…»** (junto al nombre del tipo actual, `.ed-it-type`) → modo `change`:
  llama a `changeInteractionType` del store.

**`changeInteractionType(screenId, type)`** (`courseStore.ts`): conserva siempre lo común
(id, enunciado, instrucciones, feedback, intentos, objetivo, source_refs;
`scored`/`points` solo si el tipo nuevo es `gradable`) y para options/config aplica
`migrateInteractionData` (`interactionRecipes.ts`):
- **Misma `family`** → migra el contenido compartido (el resto de claves se descarta):
  - `options` (single_choice ↔ true_false ↔ scenario_decision) y `assign`
    (match_pairs ↔ classification): mismo shape en `options`, migran tal cual.
  - `titled-content` (accordion ↔ tabs ↔ flip_cards ↔ flashcards ↔ timeline ↔
    image_cards): patrón «título + detalle» con un shape distinto por tipo
    (`items {title, body}`, `cards {front, back}`, `milestones {label, title,
    body}`, `cards {image, alt, title, text}`); la migración pasa por el ítem
    canónico `{title, body, label, image, alt}` vía `TITLED_ADAPTERS`, y los
    campos que el destino no conserva (label de timeline, image/alt de
    image_cards) se descartan marcando `lossy`. El campo «detalle» de estos
    tipos (`body`/`front`+`back`/`text`) siempre se edita con `RichTextArea`
    completo (negrita, cursiva, listas, bloques personalizados…), porque el
    runtime los renderiza con `block()` (markdown de bloque completo, el mismo
    que el cuerpo del acordeón) — **no** con `rich()` (solo inline). El
    título/etiqueta (`title`/`label`) es un `<input>` plano a propósito en
    todos ellos (encabezado corto, se renderiza con `rich()`, sin formato de
    bloque). En `flip_cards` las dos caras conviven superpuestas dentro de un
    único `<button>` (truco del volteo 3D); `.me-card-front`/`.me-card-back`
    son `flex-direction: column` para que varios bloques (párrafo + lista +
    callout) se apilen en vertical en vez de quedar en fila y recortarse por
    el `overflow: hidden` de la carta.
  - `questions` (video ↔ hidden_image): `config.questions`.
- **Sin familia común** → `options`/`config` parten del `seed()` del tipo nuevo.
  Quedan fuera a propósito: az_quiz/crossword (sus «respuestas» exigen una
  palabra corta — migrar texto libre daría contenido inválido) y
  sort_steps/single_choice (comparten `options` pero la semántica cambia: el
  orden es la respuesta vs. la marca `correct`).
- En ambos casos **nunca quedan claves huérfanas** del tipo anterior en `config` (un
  `{...it, type}` ingenuo acumularía basura exportable).
- Devuelve `lossy`: la UI (`onChangeInteractionType` en `ScreenEditor`) pide
  `confirmDialog` **solo** si se descartaría contenido escrito (`hasText` profundo);
  cambiar entre tipos compatibles o sin contenido es instantáneo. El paso de historial
  usa `snapshot()` sin clave (no se coalesce con el tecleo).

### Vista previa de configuración
- **`fill_blanks`**: bajo el textarea, preview trivial (`.ed-fb-preview`) que pinta los
  `[[huecos]]` como chips `<mark>` + contador «N huecos · M distractores».
- **Descartado por decisión del autor**: la mini-preview de pantalla con el runtime real
  (`ScreenMiniPreview`, curso sintético + iframe) se retiró por redundante con la pestaña
  «Vista estudiante»; y la preview sandbox en vivo de `html_embed` (`EmbedPreview`) se
  retiró por no necesitarse. Si algún día vuelven, el criterio sigue siendo runtime real
  vía `buildPreviewHtml` (nunca un segundo renderizador). Los textareas de `html_embed`
  siguen siendo textareas: CodeMirror exigiría `@codemirror/lang-html/css/javascript`
  (deps nuevas, descartado).

### `ListEditor` unificado
El editor genérico de listas vive en `src/components/ListEditor.tsx`; **todas** las
listas de config de interacciones lo usan con el mismo comportamiento:
- **Reordenar siempre** (▲/▼, deshabilitados en los extremos); no es un privilegio de
  algunos tipos (el renumerado de `sort_steps`/`timeline` sigue viviendo en su
  `onChange`).
- **Duplicar** (⧉): clon profundo; si el ítem tiene `id` de primer nivel se regenera (no
  duplicar identidades: estado del runtime, grupos de radios). Ajustable con la prop
  `clone`.
- **Plegado por ítem**: la prop `summary(item, i)` lo activa — fila plegada = nº +
  resumen pulsable (`.ed-config-sum`), botón ⤒ para plegar; al montar nacen abiertos los
  primeros `collapseFrom` (def. 4) y los añadidos/duplicados nacen abiertos. El estado de
  plegado vive por posición y las mutaciones lo reajustan. Tienen resumen las listas
  «gordas»: accordion/tabs (título), timeline (fecha · título), image_cards (título/alt),
  az_quiz (letra · pista) y las preguntas de vídeo/imagen oculta.
- `confirmRemove(item)` opcional: mensaje → `confirmDialog` antes de borrar la fila.
- **`QuestionListEditor`** (en `InteractionConfigEditor.tsx`): sub-editor común de
  «pregunta + opciones» que unifica los cases de `video` (con campo Segundo, `withTime`)
  y `hidden_image` — evita dos copias casi idénticas anidando ListEditor a mano.
- **Audio por ítem** (accordion/tabs/flip_cards/timeline/image_cards/flashcards):
  `ItemAudioButton`/`BulkItemAudioButton` (`InteractionConfigEditor.tsx`) generan el audio
  de narración de un ítem o de todos los pendientes de la interacción; si el ítem no
  tiene `id` aún se lo asignan en el momento. Detalle del mecanismo (guion, runtime,
  validación) en `tts-narracion.md`.

### Editor visual de zonas de hotspots (`HotspotZonesModal`)
Definir las zonas de `hotspots` a base de números (x/y/w/h en %) era inviable a mano, así
que el case `hotspots` de `InteractionConfigEditor` abre un **editor visual en modal**
(`src/components/HotspotZonesModal.tsx`, reutiliza `SettingsWindow` en modo `wide`):
- La imagen se muestra a tamaño grande (object URL del asset, o la URL http directa) y
  las zonas son rectángulos superpuestos numerados: **arrastrar en vacío dibuja** una
  zona nueva, arrastrar una zona la **mueve** y el tirador de la esquina la
  **redimensiona** (pointer events con `setPointerCapture` sobre el «stage»; un arrastre
  menor del 2 % se descarta como clic). Teclado: flechas mueven la zona con foco (con
  Mayús redimensionan), Supr la elimina.
- Panel lateral: lista de zonas (selección) y, para la seleccionada, etiqueta accesible,
  check «correcta», feedback y borrado. Verde = correcta, rojo = incorrecta.
- Trabaja sobre una **copia local** y solo llama a `setConfig({ spots })` al pulsar
  «Guardar zonas» → una única entrada en el historial; Cancelar/Esc descarta.
- Las coordenadas se redondean a 1 decimal y son el mismo contrato que consume el runtime
  (`spots: [{id,x,y,w,h,label,correct,feedback}]`). El modal es la **única** superficie
  de edición de zonas (bajo el botón queda solo un resumen «N zonas definidas ·
  correcta: …»). El campo imagen tiene su `FileButton` de subida.
- Para `hotspots` el `ScreenEditor` **oculta** «Feedback acierto/error»: el feedback se
  escribe por zona en el modal y los genéricos quedan solo como respaldo interno (el
  runtime hace `s.feedback || data.feedback.correct`, y conservan su texto por defecto
  «Correcto.»/«Revisa tu respuesta.»). «Explicación pedagógica» sí se muestra (es común a
  todos los tipos).

## Objetivos de aprendizaje

### Las interacciones no tienen objetivo propio
El objetivo de aprendizaje de una interacción **es siempre el de su pantalla**
(`screen.objective`): no existe un campo `learning_objective` en la interacción, no hay
selector propio en el `ScreenEditor` y no se valida por separado. Simplifica el modelo (un
objetivo por pantalla, no dos textos que pueden desincronizarse) y es la semántica real:
una interacción evalúa el contenido de la pantalla donde vive.
Las **preguntas de test** (final y de unidad) sí llevan su propio `learning_objective`
—no están ancladas a una pantalla concreta— y su campo «Objetivo vinculado» en
`FinalTestEditor` es `ObjectiveSelect` (`src/components/ObjectiveSelect.tsx`): un
`<select>` con los objetivos **declarados en las pantallas** del curso. Motivo: la
cobertura `OBJ_NOT_EVALUATED` (ver `informes-validacion.md`) casa por **texto exacto**, y
el texto libre producía objetivos «casi iguales» que nunca casaban. Si el valor guardado
no coincide con ningún objetivo declarado (curso importado), se conserva como opción
extra marcada «(no declarado en pantallas)». El casado valor↔objetivo declarado es
**tolerante** (`normalizeObjective`, ver `informes-validacion.md`): un valor «casi igual»
se muestra como el objetivo declarado y, al elegir en el desplegable, se guarda el texto
canónico. No volver a texto libre.
En cambio, el campo **«Objetivo de aprendizaje» de la pantalla** (donde *nacen* los
objetivos, incluidas las pantallas sin interacción) no puede ser un desplegable cerrado:
es `ObjectiveInput` (mismo fichero), un input **con `datalist`** que sugiere los
objetivos ya declarados pero admite escribir uno nuevo. Ambos comparten
`useDeclaredObjectives()`.
**Prerrelleno** de preguntas del test final: la nueva se prerrellena con el **primer
objetivo aún sin evaluación** (`uncoveredObjectives()` en `src/validation/objectives.ts`)
— así «+ Añadir pregunta» va recorriendo solo los objetivos pendientes. Es un valor
inicial editable, no un vínculo automático: el desplegable sigue mandando.

### Gestor de objetivos (⚙ Ajustes › Objetivos de aprendizaje)
Los objetivos **no son una entidad** del `course.json`: viven como texto repetido en
`screen.objective` y `question.learning_objective` (las interacciones no tienen uno
propio: heredan el de su pantalla). El gestor (`src/components/ObjectivesModal.tsx`,
`settingsModal: 'objectives'`) los reúne
con `collectObjectives()` (`src/validation/objectives.ts`): por clave normalizada, con
las pantallas que lo declaran y las evaluaciones vinculadas (chips que navegan al editor
vía `goToScreen`, incluido `__final__`). Acciones sobre **todos los usos a la vez** para
no dejar la vinculación rota a medias (`remapObjective` en el store): **renombrar**
(`renameObjective`, se confirma al salir del campo — no tecla a tecla — para no fusionar
por accidente con otro objetivo que normalice igual; renombrar a un texto ya existente
**fusiona** ambos, es deliberado) y **quitar** (`removeObjective`, vacía el campo en
todos los usos, con `confirmDialog`). **Añadir** = declarar el texto en una pantalla
elegida (`updateScreen`), porque un objetivo solo existe si una pantalla lo declara. Los
objetivos vinculados desde evaluaciones pero no declarados en ninguna pantalla (cursos
importados) se listan al final con la marca «no declarado en ninguna pantalla».

## `FinalTestEditor` compacto
Construido sobre `ListEditor` (no una página kilométrica de `fieldset.ed-group` todos
expandidos):
- **Preguntas plegadas por defecto** (`collapseFrom: 1`: la primera abierta al montar)
  con resumen = enunciado, prefijado con «⛔ sin opción correcta ·» si ninguna opción
  está marcada. Reordenar y **duplicar pregunta** de serie; `cloneQuestion` regenera el
  id de la pregunta **y de cada opción** (el grupo de radios usa `correct-${q.id}` y el
  runtime guarda por id de opción — duplicar identidades los rompería). Eliminar con
  contenido pide confirmación (`confirmRemove`).
- **Opciones también con ListEditor** (reordenar/duplicar/eliminar): el radio «correcta»
  exclusivo se mantiene; el `clone` de opción pone `correct: false` para no acabar con
  dos correctas.
- Cabecera con contador vivo «N preguntas · M puntos» junto a la nota mínima.
- `blankQuestion`/prerrelleno de objetivo (`uncoveredObjectives`) sin cambios respecto a
  lo descrito arriba.
