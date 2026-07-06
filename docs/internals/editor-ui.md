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
- **Ajustes** **no** es un nodo del árbol: es un **menú desplegable ⚙ Ajustes** en la
  `Toolbar` (junto a «Archivo ▾») con tres opciones **independientes**, cada una abre **su
  propia ventana** (decisión jul 2026: menú de Ajustes con ventanas separadas, ya no un modal
  con pestañas; y ya no hay botón «🔊 Narración» suelto en la barra). El estado de qué
  ventana está abierta vive en el store (`settingsModal: SettingsModalKind`):
  - **Curso (Finalización)** → `CourseSettingsModal` con `CourseSettingsSection`
    (antes `CourseSettingsEditor`): `scorm.rules` + `mastery_score` (nota mínima,
    `score_source`, `mixed_final_weight`, % pantallas, `require_interactions`, intentos,
    navegación) vía `updateScorm`.
  - **Interfaz (Apariencia)** → `AppearanceModal` con `AppearanceSection`: preferencias de
    presentación de la carcasa (`shell`) vía `updateShell` — **Marca y color**
    (`shell.brand`, `shell.primary_color` con picker `input[type=color]` + campo hex
    `.ed-color-row`; el runtime ya los aplicaba en `applyShell`) y **Animaciones**
    (`shell.motion`, none/subtle/rich; ver `arquitectura-runtime.md`). Decisión: la
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
- **Plantillas**: «+ Añadir pantalla…» abre un menú (`AddScreenMenu`) con presets — Texto,
  Texto + imagen (imagen a la derecha 50%), Actividad (interacción `single_choice` en
  blanco) y Vídeo (YouTube). `addScreen(unitId, afterId?, preset?)` acepta un
  `Partial<Screen>` que `blankScreen` funde y pasa por `ScreenSchema.parse` (defaults).

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
  `goTo` (modo autor; excluye el test final `__final__` y la pantalla de resultados
  `__results__`); `StudentPreview` escucha y llama a `selectScreen(id)`. Al volver a
  Editar, se sitúa donde quedaste.
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
