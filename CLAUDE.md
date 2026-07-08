# CLAUDE.md

Guía para trabajar en SCORMEditor. La visión general (arranque, fases, tipos
soportados) está en `README.md`. Aquí van solo las **invariantes** siempre activas y un
**índice** de la documentación interna: lee bajo demanda el fichero de `docs/internals/`
que corresponda al área que toques (no hace falta cargarlos todos).

## Arquitectura en una frase
Dos mundos desacoplados: el **Editor** (`src/` salvo `src/runtime/`) es una SPA
React+TS+Vite+Zustand+Zod; la **Carcasa/Runtime** (`src/runtime/`) es HTML/CSS/JS
**plano, sin framework ni build**, que se copia *verbatim* dentro del ZIP SCORM.

### Invariante crítica: una sola fuente para el runtime
El editor carga la carcasa con `import.meta.glob('../runtime/**', { query:'?raw' })`
(`src/scorm/runtimeAssets.ts`). Tanto la **Vista estudiante** (iframe, `buildPreview.ts`)
como el **export ZIP** consumen esos mismos strings. → **Lo que se ve en Vista estudiante
es exactamente lo que se exporta.** Para cambiar el comportamiento del SCORM se editan los
`.js`/`.css` de `src/runtime/`, no hay que duplicar nada.

### Invariante de seguridad (anti-XSS en la carcasa)
El runtime **escapa siempre** el texto del usuario y luego aplica un subconjunto
controlado de formato. `esc()` y `rich()` viven en `src/runtime/assets/js/
interactions.js`. Cualquier formato nuevo debe pasar por ese pipeline (escapar primero,
formatear después). No se almacena HTML en `course.json`: el contenido es **markdown
ligero en texto plano** (`student_text` y similares), portable y versionable. Nunca
introducir un editor WYSIWYG que guarde HTML ni un sanitizador en el paquete SCORM.
**Única excepción**: la interacción `html_embed` (código a medida pegado por el autor),
que se aísla en un `<iframe sandbox="allow-scripts">` sin `allow-same-origin` — nunca
se inyecta en el DOM de la carcasa (ver `docs/internals/interacciones.md`).

## Índice de documentación interna (`docs/internals/`)
Lee el que corresponda al tocar esa área:
- `arquitectura-runtime.md` — carcasa/runtime, render markdown ligero, callouts + paleta,
  bloque personalizado, recursos visuales/lightbox, responsive, renombrado histórico.
- `editor-ui.md` — árbol (`CourseTree`), superficies de edición (ScreenEditor /
  FinalTestEditor / modal de Ajustes), sync Editor↔Vista, historial deshacer/rehacer,
  pestañas y toolbar.
- `interacciones.md` — motor `interactions.js` (factory/contrato, restauración, Comprobar/
  intentos, drag&drop, render en bloque de accordion/tabs, `interaction_layout`).
- `evaluacion-finalizacion.md` — navegación/gating, `computeScore` por `score_source`
  (incl. `mixed_final_weight`), finalización, pantallas sintéticas `__final__`/
  `__results__`.
- `persistencia-scormproj.md` — el documento `.scormproj`, autosave/IndexedDB, File System
  Access, indicador de guardado.
- `tts-narracion.md` — transcripción, `audio_src`, generación TTS (panel y por pantalla).
- `informes-validacion.md` — `validators.ts` (errores/avisos) y el informe (`report.ts`).
- `ingesta-gpt.md` — el GPT generador y los **6 docs de conocimiento** de `docs/gpt/` (los
  que se suben a ChatGPT), la invariante de ingesta y los criterios de contenido acordados.

> `docs/gpt/*.md` son **externos**: material de conocimiento que se sube al GPT de ChatGPT.
> `docs/internals/*.md` es doc interna del código. No mezclar.

> `docs/internals/demo-scormeditor.scormproj` es el **proyecto de demostración** (todos
> los tipos de pantalla e interactividad). Al añadir un tipo nuevo de contenido o
> interacción, actualízalo también (detalle en `persistencia-scormproj.md`).

## Convenciones del repo
- Idioma de UI, comentarios y commits: **español** (con acentos correctos).
- Sin dependencias nuevas salvo necesidad real (hoy: React, zustand, zod, JSZip, dnd-kit).
  Preferir soluciones ligeras y propias.
- Verificar con `npm run build` (`tsc -b` + `vite build`) antes de dar por hecho un cambio.
- Clases CSS de la carcasa con prefijo `me-`; clases del editor con prefijo `ed-`.

## Mantenimiento de la documentación (convención)
Al terminar una tarea que cambie el comportamiento o una decisión de diseño, **actualiza
el fichero de `docs/internals/` del área afectada** (y este índice si aparece/desaparece
un área). Mantén cada fichero centrado en su tema; el detalle exhaustivo está en el código
— aquí van invariantes y decisiones no deducibles leyéndolo. Si el cambio afecta al formato
`.scormproj`/`course.json`, sincroniza también los docs del GPT (`ingesta-gpt.md`) y la
copia del contrato en `Downloads`. Ante trabajo largo, actualiza al cierre de cada tarea,
no lo dejes acumular.
