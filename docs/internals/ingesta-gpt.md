# Ingesta: el GPT generador y los ficheros de conocimiento (`docs/gpt/`)

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`. **Ojo:** los ficheros de `docs/gpt/`
> son EXTERNOS — se suben a ChatGPT. No confundir con la doc interna de `docs/internals/`.

El contenido de los cursos **no se teclea a mano**: lo genera un **GPT de ChatGPT**
(diseñador instruccional) a partir de un PDF/Word, y SCORMEditor lo abre. Ese GPT es la
«fuente» del documento, así que su contrato de salida y el formato que abre el editor
**deben ir sincronizados**.

- **Salida del GPT = `.scormproj`** (no un `course.json` suelto). Decidido jun 2026: con
  Code Interpreter empaqueta el `course.json` + las imágenes extraídas del PDF en el ZIP
  `.scormproj`. Fallback (sin Code Interpreter): solo `course.json` en texto.
- **Invariante de ingesta:** las claves de las entradas `assets/…` del ZIP que produce el
  GPT deben **coincidir literalmente** con las rutas que el `course.json` referencia
  (`visual_resource.src`, `hotspots.image`, `tracks[].src`, `audio_src`). Es el mismo
  contrato que `loadProjectFromBlob()` espera (ver `persistencia-scormproj.md`). Si una
  imagen no existe, el GPT pone `kind:"none"` + nota en `editor_notes`, nunca un `src`
  roto.
- **Arquitectura de los docs (jul 2026):** las Instructions llevan solo los
  **guardarraíles siempre activos**; el detalle es **material de referencia** en los
  ficheros de Knowledge. Las Instructions ordenan al GPT **leer** esos docs con Code
  Interpreter antes de generar (así el Knowledge se consulta de verdad, no solo por RAG).
  Motivo: el campo Instructions tiene un **límite duro de 8000 caracteres** (verificar con
  `wc -m` tras editar `instrucciones-gpt.md`).
- **6 ficheros de conocimiento en `docs/gpt/`** (mantenerlos al día si cambia el formato
  `.scormproj`, el esquema de `course.json`, `autosave.ts` o el `renderer.js`):
  - `instrucciones-gpt.md`: system prompt (Instructions). Solo guardarraíles.
  - `contrato-course-json.md`: referencia normativa del `course.json`; §4.1 markdown/
    callouts/formato, **§11 Empaquetado `.scormproj`** (builder Python `build_scormproj` /
    `extract_pdf_images`). **Manda en caso de conflicto.**
  - `ejemplo-course-json.md`: ejemplo dorado (few-shot) de un `course.json` válido.
  - `guia-diseno-interacciones.md`: criterio pedagógico (segmentación, formato,
    interacciones, callouts, antipatrones).
  - `flujo-factoria-unidades.md`: procedimiento por fases para **unidades grandes**
    (inventario → temas parciales auditables `.scormpart` → fusión), con control de
    cobertura y helper `merge_unit`.
  - `referencia-rapida.md`: modos, valores por defecto, accesibilidad, SEPE, evaluación y
    checklist de validación.
- **Criterios de contenido acordados (jul 2026), viven en esos docs:** (1) **Regla Nº1**
  — conservar el texto de origen **casi al 100%** (ratio ≥0.95), sin resumir ni reescribir;
  extraer **con formato** (negritas, cajas→callouts) vía PyMuPDF `get_text("dict")`, no en
  plano. (2) **Modo factoría** para unidades: nunca en una pasada (no cabe → resume), tema
  a tema con parciales. (3) Formato: `title` corto (no fragmento del texto ni repetido en
  el cuerpo), sin pantallas vacías/diminutas, listas con `- ` una por línea, encabezados
  solo-título, sin rótulos por diapositiva, negritas/enlaces del original conservados,
  imágenes colocadas por proporción (`layout`). (4) Interacciones repartidas cada 4-8
  pantallas (no al final); una interacción entera en una pantalla (no partir accordion/
  actividad); no juntar imagen+texto+interacción en una pantalla; el test calificable solo
  en `assessments.final_test` (no una pantalla `unit_quiz` con el test en texto).
- El GPT también lee una copia del contrato en el `Downloads` del usuario; al tocar el de
  `docs/gpt/` hay que **sincronizarla** (`cp`). La subida al GPT se hace desde estos
  ficheros. Dentro de las Instructions, los docs se referencian por **nombre de fichero
  suelto** (así los ve el Knowledge del GPT), no por ruta: mover la carpeta en el repo no
  afecta al GPT.
