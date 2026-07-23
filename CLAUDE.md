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
- `arquitectura-runtime.md` — carcasa (`src/runtime/`): render markdown ligero, callouts
  + paleta, bloque personalizado, recursos visuales/lightbox, lenguaje visual y
  animaciones, impresión, responsive, manifiesto SCORM.
- `carcasa-navegacion.md` — chrome de navegación de la carcasa: topbar, menú lateral
  (bloques diferenciados, Materiales, Evaluación), barra inferior (reproductor de
  audio, Anterior/Siguiente, Pantalla completa), punto de corte de la versión móvil.
- `editor-ui.md` — lo transversal del editor: superficies de edición, iconos, ⚙ Ajustes,
  sync Editor↔Vista, historial deshacer/rehacer, pestañas y toolbar.
- `editor-pantallas.md` — árbol (`CourseTree`), recetas de creación, `ScreenEditor`
  (formulario por tipo, sección Interacción, `ListEditor`), objetivos, `FinalTestEditor`.
- `editor-richtext.md` — `RichTextArea` (WYSIWYG sobre TipTap/ProseMirror) + `mdDialect.ts`
  (puente markdown ligero ↔ ProseMirror), nodos callout/imagen, barra contextual.
- `interacciones.md` — motor `interactions.js` (factory/contrato, restauración,
  Comprobar/intentos, drag&drop, `interaction_layout`) y notas por tipo.
- `evaluacion-finalizacion.md` — navegación/gating, `computeScore` por `score_source`
  (incl. `mixed_final_weight`), finalización, pantallas sintéticas `__final__`/
  `__results__`.
- `persistencia-scormproj.md` — el documento `.scormproj`, autosave/IndexedDB, File System
  Access, ciclo de vida de los assets, indicador de guardado.
- `nube-sincronizacion.md` — `src/cloud/`: organizaciones/roles en Supabase, guardado en
  la nube (orquestador único + auto-sync con debounce), detección de versión más reciente
  (Realtime + respaldo por sondeo) y bloqueo de edición (blando de servidor + estricto de
  cliente, «tomar el control»). Migraciones SQL (aplicación manual, sin CLI enlazado).
- `tts-narracion.md` — transcripción, `audio_src`, generación TTS (panel y por pantalla).
- `informes-validacion.md` — `validators.ts` (errores/avisos) y el informe (`report.ts`).
- `ingesta-gpt.md` — el GPT generador y los **9 docs de conocimiento** de `docs/gpt/` (los
  que se suben a ChatGPT), la invariante de ingesta, los criterios de contenido acordados,
  las **marcas de autoría** (`{{alias}}…{{/alias}}`) con las que el propio documento
  fuente puede pedir una interactividad concreta, y la ingesta alternativa desde backup
  Moodle (`ingesta-moodle.md`, vs. el importador determinista `scripts/moodle-import/`).
- `interop-elpx.md` — exportador `.elpx` (eXeLearning ≥ 4.0.1) en `src/interop/elpx/`:
  herramienta aparte y opcional (menú Archivo, `import()` dinámico), formato ODE 2.0,
  mapa de conversión de interacciones a iDevices y degradaciones. **No** toca runtime,
  esquema ni export SCORM.

### Flujos típicos (qué leer según la tarea)
- **Añadir/cambiar un tipo de interacción** → `interacciones.md` +
  `editor-pantallas.md` (catálogo `interactionRecipes`) + `informes-validacion.md`
  (validadores) + `ingesta-gpt.md` si cambia el contrato + actualizar el proyecto demo.
- **UX del editor** (árbol, formularios, modales) → `editor-pantallas.md`; añade
  `editor-ui.md` si toca Ajustes/toolbar/sync y `editor-richtext.md` si toca la caja de
  texto.
- **Comportamiento o aspecto del SCORM/carcasa** → `arquitectura-runtime.md`
  (+ `interacciones.md` si es una interacción; + `evaluacion-finalizacion.md` si toca
  nota/gating; + `carcasa-navegacion.md` si es topbar/menú/barra inferior).
- **Guardar/abrir/exportar/assets** → `persistencia-scormproj.md`.
- **Nube: sincronización, bloqueo de edición, organizaciones/roles** →
  `nube-sincronizacion.md` (+ `persistencia-scormproj.md`, porque un documento-nube es el
  mismo ZIP que el `.scormproj`).
- **Exportar a eXeLearning (`.elpx`)** → `interop-elpx.md` (+ `interacciones.md` si el
  cambio afecta al `config` de una interacción, porque el mapeo lee ese shape).
- **Contenido generado por GPT / criterios de ingesta** → `ingesta-gpt.md`.
- **Preguntas conceptuales** (sin tocar código) → normalmente basta un doc; no cargues
  varios «por si acaso».

> `docs/gpt/*.md` son **externos**: material de conocimiento que se sube al GPT de ChatGPT.
> `docs/internals/*.md` es doc interna del código. No mezclar.

> `src/schema/sample-course.ts` (`sampleCourse`) es el **curso demo por defecto** y el
> proyecto de referencia exhaustivo (todos los tipos de pantalla e interactividad,
> autorreferencial sobre el propio editor). Al añadir un tipo nuevo de contenido o
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
copia del contrato en `Downloads`. Si tocas `validators.ts` (código nuevo, regla cambiada
o eliminada), sincroniza su fila en `docs/gpt/tabla-autocorreccion.md`; y si una
conversación fija un criterio de corrección nuevo, vuélcalo a esa tabla al cerrar. Ante
trabajo largo, actualiza al cierre de cada tarea, no lo dejes acumular.

**Estilo de los docs** (para que no vuelvan a engordar): describen el **estado actual, en
presente**, sin fechas, fases ni «antes era…» — la cronología ya la cuenta git; el
**porqué** de cada decisión sí se conserva (es lo no deducible del código). Al actualizar
una sección, **consolida** en vez de añadir un apéndice. Si un doc pasa de ~300 líneas,
divídelo por flujo de trabajo (y actualiza este índice) o poda detalle que ya cuenta el
código.
