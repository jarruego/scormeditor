# Editor (UI): árbol, superficies de edición, sync e historial

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`.

## Superficies de edición (no todo es «pantalla»)
El panel central (`App.tsx`) muestra `ScreenEditor` salvo cuando el nodo seleccionado en
`CourseTree` es un **id sintético**:
- **`__final__`** (nodo «Evaluación → Test final») → `FinalTestEditor`: edita
  `assessments.final_test` (título, `pass_score`, preguntas/opciones/feedback y
  `learning_objective` por pregunta) vía `setFinalTest` del store.
- **`__glossary__`** y **`__bibliography__`** (sección «Materiales» del árbol, jul 2026) →
  `GlossaryEditor` / `BibliographyEditor` (`MaterialsEditor.tsx`): editan `course.glossary`
  (término+definición, botón «A→Z» de orden alfabético) y `course.bibliography` (cita+URL
  opcional) vía `setGlossary`/`setBibliography` (reemplazo completo, coalescido en el
  historial). Eliminar una entrada con contenido pide confirmación (`confirmDialog`). Los
  avisos `GLOSSARY_EMPTY`/`BIBLIO_EMPTY` de Validación enlazan a estos editores
  (`useIssueTarget`). En la carcasa se ven en los modales «Glosario»/«Recursos».

### Objetivo vinculado = desplegable, no texto libre
El campo «Objetivo vinculado» (interacción del `ScreenEditor` y pregunta del
`FinalTestEditor`) es `ObjectiveSelect` (`src/components/ObjectiveSelect.tsx`): un `<select>`
con los objetivos **declarados en las pantallas** del curso. Motivo: la cobertura
`OBJ_NOT_EVALUATED` (ver `informes-validacion.md`) casa por **texto exacto**, y el texto
libre producía objetivos «casi iguales» que nunca casaban. Si el valor guardado no coincide
con ningún objetivo declarado (curso importado), se conserva como opción extra marcada
«(no declarado en pantallas)». El casado valor↔objetivo declarado es **tolerante**
(`normalizeObjective`, ver `informes-validacion.md`): un valor «casi igual» se muestra como
el objetivo declarado y, al elegir en el desplegable, se guarda el texto canónico. No
volver a texto libre.
En cambio, el campo **«Objetivo de aprendizaje» de la pantalla** (donde *nacen* los
objetivos, incluidas las pantallas sin interacción) no puede ser un desplegable cerrado:
es `ObjectiveInput` (mismo fichero), un input **con `datalist`** que sugiere los objetivos
ya declarados pero admite escribir uno nuevo. Ambos comparten `useDeclaredObjectives()`.
**Prerrelleno** (para no escribir dos veces lo mismo): una interacción nueva hereda el
`objective` de su pantalla, y una pregunta nueva del test final se prerrellena con el
**primer objetivo aún sin evaluación** (`uncoveredObjectives()` en
`src/validation/objectives.ts`) — así «+ Añadir pregunta» va recorriendo solo los
objetivos pendientes. Son valores iniciales editables, no un vínculo automático: el
desplegable sigue mandando.

### Gestor de objetivos (⚙ Ajustes › Objetivos de aprendizaje)
Los objetivos **no son una entidad** del `course.json`: viven como texto repetido en
`screen.objective`, `interaction.learning_objective` y `question.learning_objective`. El
gestor (`src/components/ObjectivesModal.tsx`, `settingsModal: 'objectives'`) los reúne con
`collectObjectives()` (`src/validation/objectives.ts`): por clave normalizada, con las
pantallas que lo declaran y las evaluaciones vinculadas (chips que navegan al editor vía
`goToScreen`, incluido `__final__`). Acciones sobre **todos los usos a la vez** para no
dejar la vinculación rota a medias (`remapObjective` en el store): **renombrar**
(`renameObjective`, se confirma al salir del campo — no tecla a tecla — para no fusionar
por accidente con otro objetivo que normalice igual; renombrar a un texto ya existente
**fusiona** ambos, es deliberado) y **quitar** (`removeObjective`, vacía el campo en todos
los usos, con `confirmDialog`). **Añadir** = declarar el texto en una pantalla elegida
(`updateScreen`), porque un objetivo solo existe si una pantalla lo declara. Los objetivos
vinculados desde evaluaciones pero no declarados en ninguna pantalla (cursos importados)
se listan al final con la marca «no declarado en ninguna pantalla».
- **Ajustes** **no** es un nodo del árbol: es un **menú desplegable ⚙ Ajustes** en la
  `Toolbar` (junto a «Archivo ▾») con tres opciones **independientes**, cada una abre **su
  propia ventana** (decisión jul 2026: menú de Ajustes con ventanas separadas, ya no un modal
  con pestañas; y ya no hay botón «🔊 Narración» suelto en la barra). El estado de qué
  ventana está abierta vive en el store (`settingsModal: SettingsModalKind`):
  - **Curso (Finalización)** → `CourseSettingsModal` con `CourseSettingsSection`
    (antes `CourseSettingsEditor`): `scorm.rules` + `mastery_score` (nota mínima,
    `score_source`, `mixed_final_weight`, % pantallas, `require_interactions`, intentos,
    navegación) vía `updateScorm`. Incluye la herramienta **«Tiempo mínimo por pantalla»**
    (jul 2026): input 0–30 s + «Aplicar a todas las pantallas» → `setAllMinTime` del store
    (un solo paso de deshacer). El valor del input NO se persiste (es una herramienta de
    lote, no un campo de `course.json`); sobrescribe el `min_time_seconds` de cada
    pantalla tras `confirmDialog`.
  - **Interfaz (Apariencia)** → `AppearanceModal` con `AppearanceSection`: preferencias de
    presentación de la carcasa (`shell`) vía `updateShell` — **Marca y color**
    (`shell.brand`, `shell.primary_color` con picker `input[type=color]` + campo hex
    `.ed-color-row`; el runtime ya los aplicaba en `applyShell`) y **Animaciones**
    (`shell.motion`, none/subtle/rich, y `shell.motion_speed`, fast/normal/slow;
    ver `arquitectura-runtime.md`). Decisión: la
    apariencia NO va con finalización — es config de interfaz, con ventana propia.
  - **Narración (Audio IA)** → `NarrationModal` con `NarrationSection` (antes `TtsPanel`):
    config TTS (localStorage) y generación masiva de audio; ver `tts-narracion.md`.
  Ambas ventanas comparten el marco genérico `SettingsWindow` (`SettingsModal.tsx`): cabecera,
  Escape/clic-fuera/✕, y `busy` opcional que bloquea el cierre (la narración lo reporta con
  `onBusyChange` mientras genera). La generación por pantalla del `ScreenEditor` sigue
  existiendo y su aviso remite a «⚙ Ajustes → Narración».

### Layout y jerarquía del `ScreenEditor` (jul 2026)
El formulario (`.ed-form`) ocupa **el 100%** del panel central (`max-width: none`),
pensado para escritorio. Lo primario va siempre visible: título, tipo/tiempo/obligatoria,
objetivo y la **caja de texto principal** (`RichTextArea` de `student_text` a `rows={16}`,
por ser el contenido principal). Las secciones secundarias — **Recurso visual**, **Audio
de locución y transcripción** e **Interacción** — son `<details className="ed-fold">`:
**Recurso visual** va `open` (abierto), los otros dos colapsados por defecto. Se despliegan
al pulsarlos (nativo, sin JS ni estado). No usar la `<fieldset className="ed-group">` para
estas tres (esa sigue en Ajustes/Test final/TTS).

Dentro de **Recurso visual**: Tipo de recurso / Disposición / Proporción van juntos como
**controles segmentados de iconos** (`SegIcons` → `.ed-seg`, `role="group"`), con
`title`+`aria-label` que describen cada opción (no `<select>`); Disposición/Proporción solo
aparecen cuando aplican (recurso visual no-audio; proporción solo con layout left/right).
Debajo, una **vista previa** del recurso (`MediaPreview`): imagen/vídeo-archivo/audio se
resuelven a object URL desde `assets` (hook `useObjectUrl`, que libera con
`revokeObjectURL`); YouTube se incrusta por ID (`/embed/`). Si la ruta aún no tiene binario
subido, muestra un aviso en vez de romper.

### Editor de texto enriquecido (`RichTextArea` + `cmMarkdown`)
`RichTextArea` (`src/components/RichTextArea.tsx`) es la caja de texto de `student_text`
y de otros campos (feedback, escenarios…). Está sobre **CodeMirror 6** en modo **«vista
viva»** (estilo Obsidian): el valor sigue siendo **markdown en texto plano** (la invariante
no cambia — no hay HTML ni WYSIWYG que lo guarde; CodeMirror opera sobre texto plano y se
ve idéntico en «Vista estudiante»), pero la caja **muestra el resultado** y **oculta los
marcadores** de sintaxis salvo en la línea donde está el cursor (para poder editarlos). La
configuración vive en `src/components/cmMarkdown.ts`:
- `mdHighlighting` (`HighlightStyle`): negrita en negrita, `##/###` grandes, enlaces, código.
- `livePreview` (`ViewPlugin`): oculta **siempre** con `Decoration.replace` los marcadores
  (`**`, `#`, `[ ]( )`, `URL`) — nunca se revelan por cursor ni por selección, para que ni el
  clic simple ni el doble clic ni seleccionar un bloque hagan reaparecer los `**`/`:::` ni
  desplacen el contenido — y sustituye la cabecera `::: tipo …` por un **chip** legible (icono
  + título / etiqueta del callout). Sus rangos se exponen como `atomicRanges` para que las
  flechas salten los marcadores ocultos.
  Todo por línea: solo `replace` de **una** línea (nunca cruza saltos → sin decoraciones de
  bloque, más robusto).
- `calloutDecorations`: fondo/filete de color por línea para los bloques `:::`. El color
  sale de `calloutColor(type, rest)`: los `custom` con su hex validado y los predefinidos con
  su color de paleta (`CALLOUT_COLORS`, **alineado con `runtime/styles.css`** para que en el
  editor se vea el MISMO color que de verdad, no gris). Se expone como `--cm-callout-color`.
- `editorTheme(rows*1.5)`: aspecto alineado con las variables del editor; `rows` → alto mínimo.

Botón **🖼 Imagen** (jul 2026): es un `<label>` con `<input type="file">` oculto (vestido de
botón, `.ed-rta-imgbtn`); sube la imagen con `optimizeImage`, la guarda como asset
(`assets/img/txt-<ts>.<ext>`) e inserta `![](ruta)` en línea propia con el cursor sobre
ella. El render y sus invariantes, en `interacciones.md` / `arquitectura-runtime.md`.
Las líneas `![alt|ancho](ruta)` se **sustituyen enteras** por la imagen (`ImgWidget` en
`cmMarkdown.ts`; el markdown nunca se ve — decisión tras probar la variante con el texto
visible, que confundía porque el alt parecía un enlace). Al clicar la imagen se selecciona
(contorno + `selectionSet` en el plugin) y aparece la **barra contextual «Imagen»** bajo el
editor (mismo patrón que la barra de bloque): campo de **alt** (se sanea `]`/`|`), select
de **tamaño** (Tamaño real / 25–100 % → sufijo `|NN` en el markdown), **↻ Sustituir…**
(sube otra y borra el binario anterior si nadie más lo usa) y **🗑 Quitar** (borra la línea
y el asset vía `removeAsset`, que respeta referencias). El detector de enlaces de
`analyze()` ignora los `[…](…)` precedidos de `!` para no ofrecer «Editar enlace» sobre
una imagen. Los blobs de assets se resuelven a object URLs cacheadas (`imageUrl`); si la
ruta no existe en assets el widget muestra «imagen no encontrada».

La **barra** conmuta de verdad: `B`/`I` usan el árbol de sintaxis (`syntaxTree`) para, si la
selección ya está dentro de `StrongEmphasis`/`Emphasis`, **quitar** los marcadores en vez de
añadirlos. Edición **contextual** (según lo que hay bajo el cursor, recalculado en
`updateListener`): si el cursor está en un enlace, el botón pasa a «Editar enlace» y abre un
popover (texto/URL, con «Quitar»); si está dentro de un bloque `:::`, aparece una **barra de
bloque** con un `<select>` para **cambiar el tipo** —incluye los tipos estándar, los **presets
personalizados guardados** (valor `preset:<id>`, que reescriben la cabecera con su
color/icono/título) y «Personalizado a medida…» que abre el diálogo precargado— y
**«Quitar formato»** (`unwrapBlock`), que **conserva el texto**: elimina solo la línea de
cabecera `::: …` y la de cierre `:::` (cada una con su salto de línea; se despachan en
coordenadas del documento original, sin solaparse), dejando el contenido interior como texto
plano. No es un borrado destructivo, así que no lleva estilo `ed-danger`. Las
barras contextuales (bloque, imagen y enlace) **flotan** sobre la parte superior de la caja
(`.ed-rta-floats`, `position:absolute` dentro de `.ed-rta-editwrap`), de modo que aparecer o
desaparecer **no empuja** el editor; el contenedor lleva `pointer-events:none` (salvo las
propias barras) para no bloquear los clics del editor. **Esc** cierra los paneles flotantes
visibles (`handleEscClose` en el `onKeyDown` de `.ed-rta`): el diálogo personalizado, el
enlace (Cancelar) y las barras de bloque/imagen (ocultadas por firma con `dismissedBlock`/
`dismissedImg`, que se reactivan al salir y volver). El editor de **enlace se
abre automáticamente** al entrar el cursor en un `[texto](url)` (sin pulsar «Editar enlace») y
se cierra al salir; «Cancelar» lo descarta hasta salir y volver a entrar (`dismissedLinkRef`).
La barra de formato lleva `onMouseDown={preventDefault}` para **no robar el foco**
al editor (si no, el botón pulsado se quedaba resaltado y con foco). **Aviso importante:**
`RichTextArea` **no debe envolverse en un `<label>`** (usar `<div className="ed-field">`). Un
`<label>` asocia su primer control etiquetable y le reenvía **clics** y **:hover**; como
CodeMirror no es un control etiquetable, el label apuntaría al **primer botón de la barra**
(la «B»), de modo que pasar el ratón la resaltaba y clicar en cualquier parte del campo
aplicaba negrita. El editor añade además `onClick={preventDefault}` en su contenedor como
salvaguarda. El
componente es controlado: sincroniza el valor externo (deshacer global, carga de proyecto)
comparando el doc actual antes de despachar, para no entrar en bucle ni mover el cursor.
Como los marcadores no se revelan nunca, **editar el crudo** (URL de un enlace, color/icono/
título de un bloque, quitar negrita…) se hace siempre por los controles de la barra —no
tecleando entre los `**`—; para casos límite el texto plano subyacente sigue ahí (deshacer,
seleccionar todo, etc.). Un WYSIWYG «puro» alternativo (ProseMirror/Lexical) se descartó por
peso y por crear un segundo renderizador que divergiría del runtime.

`CourseTree` (`src/components/CourseTree.tsx`): módulos → unidades → pantallas
(reordenables con dnd-kit) + secciones «Evaluación» (test final) y «Materiales»
(glosario/bibliografía). Añadir pantalla por unidad; duplicar/eliminar por pantalla
(eliminar pide confirmación con `confirmDialog`, nombrando la pantalla).

### Renombrado inline de títulos estructurales (jul 2026)
Los títulos que no son de pantalla se editan **in situ** con `InlineRename`
(`src/components/InlineRename.tsx`): lápiz ✏ → input; Enter/blur confirma, Escape
restaura. Se usa en el **título del curso** (`.ed-course-name` de la `Toolbar` →
`updateCourseInfo({title})`), en **módulos** (`updateModule`) y en **unidades**
(`updateUnit`); las tres acciones coalescen el tecleo en el historial (claves
`courseinfo`/`module:<id>`/`unit:<id>`). El componente detiene la propagación de los
clics para poder vivir dentro del `<summary>` de la unidad sin plegarla.

### Árbol: plegado, filtro, iconos y plantillas (fase 3, jul 2026)
- **Unidades plegables**: cada unidad es un `<details className="ed-tree-unit" open>` con
  chevron rotatorio y **contador** de pantallas (con filtro activo, «visibles/total»). La
  `key` incluye el estado del filtro para remontarse abierta al (des)activarlo.
- **Filtro** (`.ed-tree-filter`): por título o etiqueta de tipo; oculta unidades sin
  coincidencias y las secciones Evaluación/añadir mientras está activo. El dnd sigue
  funcionando (mueve por id, no por índice visible).
- **Iconos por tipo** en cada pantalla (`screenTypeIcon` en `labels.ts`) + marca de
  interacción: «· 🧩» informativa (no puntúa) o «· ⭐ evaluable» (`.ed-eval`, en ámbar) si
  `interaction.scored`.
- **Validación en contexto**: el árbol calcula `validateCourse` (memoizado por curso) y
  muestra badge ⛔/⚠ por pantalla (`IssueBadge`); el `ScreenEditor` muestra la lista de
  issues de la pantalla abierta (`.ed-inline-issues`) encima del formulario. Los `info` no
  se muestran en contexto (solo en la pestaña Validación).
- **Recetas de creación** (jul 2026, sustituye al menú de plantillas): «+ Añadir
  pantalla…» abre un modal (`AddScreenModal`, reutiliza `SettingsWindow`) con **tarjetas
  agrupadas por lo que hace el alumno** — Estructura (armazón) / Contenido (leer, ver,
  explorar: incluye las interacciones informativas acordeón/pestañas/tarjetas/línea de
  tiempo/hotspots) / Práctica (hacer y recibir corrección: pregunta, emparejar, ordenar,
  clasificar, huecos, escenario, caso, fichas, reflexión, foro) / Evaluación (test de
  unidad) / Otros (placeholder y en blanco, discretas). El catálogo vive en
  `src/schema/screenRecipes.ts` (`SCREEN_RECIPES`): cada receta fija de golpe `type` +
  recurso visual + interacción + título inicial, para que el autor novel no combine a
  mano las tres decisiones. Es una **capa de UI**: no toca el esquema ni el contrato de
  `course.json`, y tras crear todo sigue siendo editable (el desplegable «Tipo de
  pantalla» queda como ajuste avanzado). Decisiones:
  - **Puntuar es el default del grupo, no una promesa de la tarjeta**: Práctica crea con
    `scored: false`, Evaluación con `scored: true`; el subtítulo del grupo
    (`RECIPE_GROUP_HINTS`) lo comunica y las descripciones no mencionan la nota (la
    decisión real vive en la interacción + `score_source` de Ajustes; el aviso
    `SCORM_ACTIVITIES_IGNORED` de `validators.ts` cierra el círculo). Una línea fija al
    pie del modal (`.ed-recipes-note`) aclara que la receta solo preconfigura.
  - **Sin tarjeta a propósito**: `html_embed` (interacción avanzada, sandbox) y
    Verdadero/Falso (variante de Pregunta). Glosario y bibliografía tampoco: son
    materiales únicos a nivel de curso (sección «Materiales» del árbol), no pantallas.
  - Las interacciones de las recetas se construyen con `Interaction.parse(...)` — los
    defaults del esquema son la única fuente de verdad (no hay literales duplicados).
  - `place?: (screens) => number` coloca la pantalla (portada al principio, objetivos tras
    la portada, resumen antes del test, test al final); para ello `addScreen` acepta un
    cuarto parámetro `atIndex` (si falta: tras `afterId` o al final, como antes).
  - `uniquePerUnit` **atenúa** la tarjeta si la unidad ya tiene ese tipo (tooltip «Ya
    existe…») pero **no bloquea** — aviso blando.
  - Las recetas **no** rellenan `student_text` (acabaría exportado) ni `min_time_seconds`
    (ya hay ajuste masivo en Ajustes).
  - Tras crear, el foco salta al input de Título (`data-field="screen-title"` en
    `ScreenEditor`). «En blanco» (tarjeta discreta, borde discontinuo) es la vía de
    escape sin preconfigurar.
  - `addScreen(unitId, afterId?, preset?, atIndex?)` tipa el preset como
    `Partial<ScreenInput>` (`z.input` del esquema: los campos con default son opcionales),
    lo que elimina los `as any` que llevaban los presets antiguos.
  - **Puntos de inserción** (`InsertPoint`, `.ed-insert`): entre cada par de pantallas del
    árbol hay una zona fina que al pasar el ratón (o enfocar con Tab) revela un divisor
    con «+»; abre el mismo modal con `atIndex`, que **manda sobre** la colocación
    automática de la receta (`place`). Con el filtro activo no se muestran (los índices
    de la lista filtrada no se corresponden con la unidad).
  - **Auto-scroll**: al seleccionarse una pantalla (recién creada o vía enlaces de
    Validación/Informe), su `<li>` hace `scrollIntoView({ block: 'nearest' })` para
    quedar a la vista en el árbol.

### Editor sensible al tipo (capa 2 de la guía al autor, jul 2026)
El `ScreenEditor` adapta el formulario al tipo de pantalla según la config de
`src/schema/screenTypeUI.ts` (`SCREEN_TYPE_UI`). Igual que las recetas, es **solo
presentación** (reordena, pliega y sugiere; nunca restringe — lo incongruente lo señalan
los avisos de `validators.ts`):
- **Orden y plegado**: título → objetivo → texto → recurso visual → interacción → audio →
  «Avanzado». En `video` (`mediaFirst`) el recurso va **antes** del texto; la sección de
  recurso se abre si hay recurso (`kind !== 'none'`) y la de interacción si hay
  interacción o el tipo lo pide (`interactionOpen`, p. ej. `unit_quiz`).
- **Título en la cabecera (jul 2026)**: no hay campo «Título» aparte ni rótulo «Editar
  pantalla»; el `h2` del formulario (`.ed-form-head`) es un input con aspecto de
  encabezado (`.ed-title-input`, borde solo al pasar/enfocar) que edita `screen.title`
  directamente, con un lápiz al lado que enfoca+selecciona. Conserva
  `data-field="screen-title"` como diana del foco al crear desde receta. El
  `FinalTestEditor` usa el mismo patrón (chip «📝 Test final» en vez del tipo), y
  `MaterialsEditor` también (helper `EditableHead`): ahí el título edita
  `glossary_title`/`bibliography_title` del curso (campos del contrato, con default
  «Glosario»/«Recursos y bibliografía»), que la carcasa usa como rótulo del botón de la
  barra y título del modal (con el default, el botón conserva el corto «Recursos»). El
  árbol refleja el título personalizado en las filas de Materiales.
- Las secciones usan el helper `Fold` (details **no controlado**: `defaultOpen` solo
  aplica al montar; la `key` por `id`+`type` remonta la sección al cambiar de pantalla o
  de tipo para re-aplicar el énfasis sin pisar lo que el autor pliegue a mano).
- **«Avanzado»** (plegado): tipo de pantalla, tiempo mínimo y obligatoria. El tipo se
  muestra como chip de solo lectura junto al título del formulario (`.ed-form-type`).
  El selector usa `changeScreenType` del store, que al pasar a `video` sin recurso
  precarga `video_youtube` (congruencia mínima).
- **Objetivo oculto** en `cover`/`summary` (`hideObjective`): son los tipos exentos en
  validación.
- **Interacciones recomendadas** (`recommended`): el desplegable de tipo de interacción
  se agrupa en «Recomendadas para este tipo» / «Otras» (`unit_quiz` → tipos de pregunta;
  `video` → vídeo interactivo). La primera recomendada es además el tipo inicial de
  «+ Añadir interacción» (`blankInteraction`, ahora vía `Interaction.parse`), y su
  puntuación sigue la filosofía de las recetas: `scored: true` solo en `unit_quiz`.

### Editor visual de zonas de hotspots (jul 2026)
Definir las zonas de `hotspots` a base de números (x/y/w/h en %) era inviable a mano, así
que el caso `hotspots` de `InteractionConfigEditor` abre un **editor visual en modal**
(`src/components/HotspotZonesModal.tsx`, reutiliza `SettingsWindow` en modo `wide`):
- La imagen se muestra a tamaño grande (object URL del asset, o la URL http directa) y las
  zonas son rectángulos superpuestos numerados: **arrastrar en vacío dibuja** una zona
  nueva, arrastrar una zona la **mueve** y el tirador de la esquina la **redimensiona**
  (pointer events con `setPointerCapture` sobre el «stage»; un arrastre menor del 2 % se
  descarta como clic). Teclado: flechas mueven la zona con foco (con Mayús redimensionan),
  Supr la elimina.
- Panel lateral: lista de zonas (selección) y, para la seleccionada, etiqueta accesible,
  check «correcta», feedback y borrado. Verde = correcta, rojo = incorrecta.
- Trabaja sobre una **copia local** y solo llama a `setConfig({ spots })` al pulsar
  «Guardar zonas» → una única entrada en el historial; Cancelar/Esc descarta.
- Las coordenadas se redondean a 1 decimal y son el mismo contrato que consume el runtime
  (`spots: [{id,x,y,w,h,label,correct,feedback}]`). El `ListEditor` numérico de
  coordenadas se **eliminó** (el modal es la única superficie de edición de zonas; bajo
  el botón queda solo un resumen «N zonas definidas · correcta: …»). El campo imagen
  ganó además su `FileButton` de subida (antes solo admitía escribir la ruta a mano).
- Para `hotspots` el `ScreenEditor` **oculta** «Feedback acierto/error»: el feedback se
  escribe por zona en el modal y los genéricos quedan solo como respaldo interno (el
  runtime hace `s.feedback || data.feedback.correct`, y conservan su texto por defecto
  «Correcto.»/«Revisa tu respuesta.»). «Explicación pedagógica» sí se muestra (es común
  a todos los tipos).

### Etiquetas en español (no exponer identificadores del esquema)
La UI del editor **nunca muestra los valores internos en crudo** (`content_placeholder`,
`single_choice`…): pasa por `src/schema/labels.ts` (`screenTypeLabel`/
`interactionTypeLabel`, con fallback al valor crudo si aparece un tipo nuevo sin etiqueta).
Se aplica en los selects del `ScreenEditor` y en el tipo de pantalla del árbol. Los valores
internos del `course.json` no cambian (contrato). Al añadir un tipo al esquema, añade su
etiqueta aquí.

## Confirmaciones (modal propio, no `window.confirm`)
Diálogo de confirmación promisificado: `confirmDialog({ title, message, confirmLabel,
cancelLabel, danger })` (`src/store/confirm.ts`, store zustand) devuelve `Promise<boolean>`
para usar con `await` desde código imperativo. El modal (`ConfirmModal`, montado una vez en
`App`) se centra, tiene Aceptar/Cancelar, Enter=aceptar/Esc=cancelar y variante `danger`
(icono ⚠️, botón rojo). Lo usan los borrados irreversibles de assets (sustituir recurso en
`FileButton`, «Sin recurso» en `ScreenEditor`). Preferir esto a `window.confirm`.

## Sincronización Editor ↔ Vista estudiante (bidireccional)
- **Editor → Vista:** al abrir la pestaña, la vista arranca en la pantalla seleccionada.
  `buildPreviewHtml(course, assets, startScreenId)` inyecta `window.__START_SCREEN_ID__`;
  `app.js` lo respeta en modo autor. El id de arranque se congela con `useRef` al montar
  (`StudentPreview.tsx`) para no recargar el iframe al navegar dentro de la vista.
- **Vista → Editor:** `app.js` emite `postMessage({type:'me-screen-change'})` en cada
  `goTo` (solo en previsualización, condicionado a `__AUTHOR_MODE__` — no al conmutador
  de modo autor —; excluye el test final `__final__` y la pantalla de resultados
  `__results__`); `StudentPreview` escucha y llama a `selectScreen(id)`. Al volver a
  Editar, se sitúa donde quedaste.
- **Conmutador de modo autor (jul 2026):** píldora `.me-author-toggle` anclada a
  `.me-body`, sobre la esquina superior derecha del área de contenido
  (`setupAuthorToggle` en app.js; persistente, no la afecta el re-render de las
  diapositivas ni el scroll) que activa o
  desactiva en vivo la variable `AUTHOR` para probar el comportamiento real (gating de
  navegación, tiempo mínimo —se reinicia `screenEnter` al desactivar—, interacciones
  obligatorias). Por defecto activado. Solo se crea si existe `__AUTHOR_MODE__`: el
  SCORM exportado nunca lo lleva. Oculto en impresión.
- **Endurecimiento de la vista previa:** el iframe `srcDoc` comparte origen con el editor
  (no lleva `sandbox` porque rompería las blob URLs de los assets), así que cualquier dato
  del curso interpolado en el HTML de `buildPreviewHtml` debe escaparse o validarse.
  `language` se valida dos veces: en el schema (`LanguageCode`, regex tipo BCP-47 con
  `catch('es')`) y de nuevo antes de interpolarlo en `lang=…`. El listener de `postMessage`
  solo acepta mensajes cuyo `e.source` sea el `contentWindow` del propio iframe.
  Ojo: la CSP desplegada (`netlify.toml`) la **hereda** el iframe `srcdoc`, por eso debe
  mantener `'unsafe-inline'` en `script-src`/`style-src` y `blob:` en `img/media-src`;
  endurecerla sin probar la Vista estudiante la deja en blanco.

## Historial deshacer/rehacer
Implementado a mano en `src/store/courseStore.ts` (sin librerías). Pilas `past`/`future`
de instantáneas `{ course, selectedScreenId }`, tope 50 pasos.
- `snapshot(coalesceKey?)` apila el estado **antes** de cada mutación e invalida
  `future`. Las mutaciones de contenido lo invocan (`updateScreen`, `addScreen`,
  `duplicateScreen`, `deleteScreen`, `moveScreen`, `setFinalTest`, `updateScorm`).
- **Coalescencia de tecleo**: ediciones seguidas en la misma pantalla (`update:<id>`)
  dentro de 400 ms se agrupan en un solo paso. → `Ctrl+Z` mientras escribes deshace todo
  el bloque de tecleo reciente, no carácter a carácter (decisión aceptada).
- El historial se **vacía** al cargar otro documento (`hydrate`, `importJson`,
  `resetSample`, `setCourse`). La navegación (`selectScreen`) **no** genera pasos.
- UI: botones ↶/↷ en `Toolbar.tsx`; atajos en `App.tsx` (`Ctrl/Cmd+Z`,
  `Ctrl/Cmd+Mayús+Z` o `Ctrl+Y`). El autosave persiste los cambios solos.

## Pestañas y toolbar
`courseStore.activeTab: Tab` (`'editor'|'preview'|'validation'|'report'`) es la fuente
única de la pestaña activa (también para que el badge de validación navegue a ella). La
`Toolbar` muestra el indicador de guardado (ver `persistencia-scormproj.md`), el menú
«Archivo ▾», el botón «🔊 Narración» (ver `tts-narracion.md`), «⚙ Ajustes» y el badge de
validación `.ed-status`. Clases del editor con prefijo `ed-`.
