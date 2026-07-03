# Editor (UI): árbol, superficies de edición, sync e historial

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`.

## Superficies de edición (no todo es «pantalla»)
El panel central (`App.tsx`) muestra `ScreenEditor` salvo cuando el nodo seleccionado en
`CourseTree` es un **id sintético**:
- **`__final__`** (nodo «Evaluación → Test final») → `FinalTestEditor`: edita
  `assessments.final_test` (título, `pass_score`, preguntas/opciones/feedback) vía
  `setFinalTest` del store.
- **Ajustes del curso** (`CourseSettingsEditor`) **no** es un nodo del árbol: es un
  **modal** que abre el botón **⚙ Ajustes** de la `Toolbar` (junto a «Archivo ▾»). Edita
  `scorm.rules` + `mastery_score` (nota mínima, `score_source`, `mixed_final_weight`,
  % pantallas, `require_interactions`, intentos, navegación) vía `updateScorm`.
  Decisión (jul 2026): los ajustes son config del curso, no una «diapositiva» del árbol.

`CourseTree` (`src/components/CourseTree.tsx`): módulos → unidades → pantallas
(reordenables con dnd-kit) + una sección «Evaluación» con el nodo del test final. Añadir
pantalla por unidad; duplicar/eliminar por pantalla.

## Sincronización Editor ↔ Vista estudiante (bidireccional)
- **Editor → Vista:** al abrir la pestaña, la vista arranca en la pantalla seleccionada.
  `buildPreviewHtml(course, assets, startScreenId)` inyecta `window.__START_SCREEN_ID__`;
  `app.js` lo respeta en modo autor. El id de arranque se congela con `useRef` al montar
  (`StudentPreview.tsx`) para no recargar el iframe al navegar dentro de la vista.
- **Vista → Editor:** `app.js` emite `postMessage({type:'me-screen-change'})` en cada
  `goTo` (modo autor; excluye el test final `__final__` y la pantalla de resultados
  `__results__`); `StudentPreview` escucha y llama a `selectScreen(id)`. Al volver a
  Editar, se sitúa donde quedaste.

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
