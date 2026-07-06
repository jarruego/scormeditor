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
  roto. Los enums de presentación de `visual_resource` (`layout`, `media_width`,
  `media_align`) **toleran `""`** en el esquema (jul 2026, `course.schema.ts`,
  `z.preprocess` → default): los GPT a veces lo emiten y rompía la carga; aun así el
  contrato les ordena **omitir la clave** en vez de emitir `""`.
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
    cobertura y helper `merge_unit`. Incluye el **prompt reforzado** recomendado para
    el usuario (en «Órdenes de trabajo típicas»): re-ancla en el mensaje las reglas
    más incumplidas como bloqueantes; probado con buen resultado (jul 2026).
  - `referencia-rapida.md`: modos, valores por defecto, accesibilidad, SEPE, evaluación y
    checklist de validación.
- **Criterios de contenido acordados (jul 2026), viven en esos docs:** (1) **Regla Nº1**
  — conservar el texto de origen **casi al 100%** (ratio ≥0.95), sin resumir ni reescribir;
  extraer **con formato** (negritas, cajas→callouts) vía PyMuPDF `get_text("dict")`, no en
  plano. (2) **Modo factoría** para unidades: nunca en una pasada (no cabe → resume), tema
  a tema con parciales. **Autónomo por defecto** (jul 2026): la orden habitual del
  usuario es directa («genera el `.scormproj` de X»); el GPT encadena las fases solo,
  sin preguntar entre temas (para solo ante incidencia bloqueante o falta de espacio:
  guarda parciales y pide «continúa»). Paso a paso solo si se pide expresamente.
  Existe además el **análisis previo**: inventario global con volumen por unidad/tema
  y propuesta de empaquetado en `.scormproj` (SCOs de Moodle), sin generar nada. (3) Formato: `title` corto (no fragmento del texto ni repetido en
  el cuerpo), sin pantallas vacías/diminutas, listas con `- ` una por línea, encabezados
  solo-título, sin rótulos por diapositiva, negritas/enlaces del original conservados,
  imágenes colocadas por proporción (`layout`). **Quitar la numeración de epígrafes del
  PDF** (`1.3`, `1.3.1`…) en TODO el texto (title, encabezados, títulos de ítems de
  accordion/tabs, 1ª línea del cuerpo): es maquetación, no contenido. **Jerarquía**:
  sub-epígrafes hermanos con el mismo nivel `###` (ninguno degradado a línea numerada
  en negrita) y ninguna pantalla arranca con contenido residual del epígrafe anterior.
  **`cover` = solo portada** (título/subtítulo; la intro va en la 1ª de contenido)
  pero **con el número del tema visible** («Tema 1», «Tema 2»… en `subtitle` o
  antepuesto al título). **Ejercicios prácticos en pantalla propia**: `case_practice`/
  `reflection` y callouts con tarea (`::: case`/`::: reflect`) nunca pegados al final
  de una pantalla de contenido; el ejercicio va en la pantalla siguiente con solo su
  enunciado, y **la solución** («Resolución propuesta»/«Clave de reflexión») en el
  `feedback.explanation` de la interacción, **nunca visible** en `student_text`.
  **Limpieza de extracción** (jul 2026, del contraste OK/KO de dos generaciones del
  mismo PDF): reagrupar las frases partidas por la maquetación del PDF, ítems de lista
  en líneas consecutivas sin línea en blanco entre ellos, espacio tras cerrar negrita
  (`**útil** y`), y dos callouts del mismo tipo en una pantalla = dos apartados
  fusionados → dividir en dos pantallas. **`min_time_seconds: 0` siempre** (jul 2026):
  el tiempo mínimo por pantalla lo fija a mano el editor humano en SCORMEditor, el GPT
  no lo estima. **Bibliografía solo en `bibliography[]`** (la carcasa la muestra en el
  modal «Recursos y bibliografía», `app.js`; nunca pantalla «Referencias»), una entrada
  limpia por referencia y **todas con formato homogéneo** (`Autor/Entidad (año).
  Título. Fuente.`), normalizando aunque el original sea desordenado. **Negritas**: la
  extracción con `get_text("dict")` debe detectar la negrita por `span.flags & 16` o
  fuente con `Bold`/`Black`/`Semibold` y re-emitirla como `**...**` (helper
  `extract_text_markdown` en el contrato §11); el texto plano las pierde. (4) Interacciones
  repartidas cada 4-8 pantallas (no al final); una interacción entera en una pantalla (no
  partir accordion/actividad); **`accordion`/`tabs` solo para ítems paralelos, NUNCA para
  prosa corrida ni para texto que acompaña a una imagen**; **variar los tipos
  informativos** (no todo accordion; `tabs`/`flip_cards` solo con ≤4 ítems cortos); **texto + imagen = UNA pantalla**
  (`student_text` visible + `visual_resource`), sin fragmentar cada imagen en su propia
  pantalla; no juntar imagen+texto+interacción en una pantalla; **callout con cuerpo real
  (no la etiqueta) y no dos del mismo tipo en la misma pantalla**; el test calificable solo
  en `assessments.final_test` (no una pantalla `unit_quiz` con el test en texto).
  (5) **Objetivos** (jul 2026): conjunto reducido derivado del contenido + petición del
  usuario + normativa facilitada (NO un micro-objetivo por pantalla, sin cuota fija);
  texto **exacto** reutilizado entre las pantallas del mismo objetivo (`objective` = solo
  el principal de cada pantalla) y copiado literal en cada `learning_objective`
  (interacciones y test); cada objetivo con al menos una evaluación; en `objectives`/
  `route` el objetivo principal del tema, no meta-objetivos («Presentar el recorrido»).
  Casa con la cobertura normalizada `OBJ_NOT_EVALUATED` del editor
  (`informes-validacion.md`). (6) **Revisión de fidelidad** (jul 2026): el ratio de
  palabras ≥0.95 mide cantidad, no fidelidad; el flujo factoría añade en la Fase 3 una
  revisión final obligatoria contra la fuente (cada epígrafe con su pantalla, mismo
  orden y jerarquía, fronteras limpias, mismo mensaje didáctico) antes de entregar.
- El GPT también lee una copia del contrato en el `Downloads` del usuario; al tocar el de
  `docs/gpt/` hay que **sincronizarla** (`cp`). La subida al GPT se hace desde estos
  ficheros. Dentro de las Instructions, los docs se referencian por **nombre de fichero
  suelto** (así los ve el Knowledge del GPT), no por ruta: mover la carpeta en el repo no
  afecta al GPT.
