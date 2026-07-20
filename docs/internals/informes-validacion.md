# Validación e informes

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`.

## Validación (`src/validation/validators.ts`)
`validateCourse(course)` recorre el curso y devuelve una lista de `Issue`
(`{ code, severity: 'error'|'warning'|'info', message, location, screenId?, unitId? }`).
Reglas por pantalla / unidad / curso, p. ej.:
- Pantalla marcada como esqueleto/`content_placeholder` → `warning`.
- **Unicidad de IDs** (`checkIds`): `ID_DUPLICATE` (`error`) si dos entidades cualesquiera
  —pantalla, interacción, módulo, unidad, test o pregunta— comparten `id`. El esquema Zod
  no comprueba unicidad, pero el runtime guarda el estado del alumno por `id`
  (`STATE.results[interaction.id]`, `STATE.visited[screen.id]`): un id repetido mezcla
  progreso y nota. El preflight del GPT (`validate_course`, contrato §11) ya lo bloqueaba;
  esto iguala la paridad en el editor.
- `type` distinto de `cover`/`summary` **sin** `objective` → aviso (por eso el editor
  rellena `objective` aunque no se muestre como banner; ver `arquitectura-runtime.md`).
- Imagen sin `alt`, vídeo sin `transcript`, etc.
- **Preguntas de tests** (final y de unidad): mismas exigencias que las interacciones de
  pantalla — enunciado, respuesta correcta y feedback (`checkQuizQuestions`). Las del test
  final llevan `screenId: '__final__'`; las de tests de unidad llevan `unitId`.
- **Cobertura de objetivos**: un issue `OBJ_NOT_EVALUATED` **por objetivo** no evaluado,
  enlazado (`screenId`) a la primera pantalla que lo declara. El objetivo de una
  interacción es siempre el `objective` de su propia pantalla (no tiene uno propio ni se
  valida por separado); cuentan como evaluación las interacciones `scored` de esa pantalla,
  el test final y los tests de unidad. La comparación es **normalizada**
  (`normalizeObjective` en `src/validation/objectives.ts`: sin acentos, minúsculas,
  espacios colapsados, sin puntuación final) porque la vinculación de las preguntas de
  test era texto libre y abundan pares «casi iguales»; `ObjectiveSelect` (preguntas de
  test) usa el mismo normalizador. No endurecer a comparación exacta.
- **Origen de la nota** (`score_source`): ojo a la semántica real del runtime
  (`computeScore` en `app.js`): `'unit_tests'` = **actividades evaluables** (interacciones
  de pantalla con `scored`), no `assessments.unit_tests`. Reglas: `SCORM_NO_FINAL`
  (final_test sin preguntas, `screenId '__final__'`), `SCORM_NO_ACTIVITIES` (unit_tests sin
  interacciones puntuadas), `SCORM_MIXED_EMPTY`/`SCORM_MIXED_NO_FINAL`/
  `SCORM_MIXED_NO_ACTIVITIES` (mixed sin uno u otro bloque), y
  `SCORM_ACTIVITIES_IGNORED` (aviso: hay interacciones `scored` pero
  `score_source: 'final_test'` → no contarán; hace visible que «puntúa o no» se decide
  en Ajustes, no en la pantalla). El curso de ejemplo usa `score_source: 'mixed'`
  precisamente para arrancar sin este aviso.
- **Narración pendiente**: solo se activa en **cursos narrados** (`Ctx.narrated`). Manda
  el ajuste explícito **`course.narration.mode`** (`'on'`/`'off'`, editable en Ajustes →
  Narración, se guarda en el proyecto); su default `'auto'` mantiene la heurística:
  narrado si alguna pantalla tiene `audio_src` (sin locución un curso sin transcripciones
  es legítimo y no genera ruido). El campo es **opcional en `course.json`** y el GPT debe
  omitirlo (anotado en `contrato-course-json.md`). En pantallas sin `audio_src` (los
  casos con audio/vídeo sin transcripción ya son errores) y que no sean esqueleto:
  `NARR_NO_TRANSCRIPT` (`warning`) si falta transcripción y la pantalla tiene **contenido
  narrable** — mismo criterio que el botón «Generar transcripción»: `buildTranscript(s)`
  no vacío —; `NARR_NO_AUDIO` (`info`, solo pestaña Validación) si hay transcripción pero
  falta el audio. No se duplican: el info solo salta con la transcripción ya resuelta,
  creando el flujo «primero transcripciones (warnings), luego narrar (infos como lista de
  pendientes del TTS)».
- **Congruencia tipo ↔ recurso ↔ interacción** (complemento de las recetas de creación;
  ver `editor-pantallas.md`): avisos —nunca errores— para combinaciones que casi siempre
  son un despiste. `COVER_INTERACTION` (portada con actividad), `VIDEO_NO_MEDIA`
  (pantalla `video` sin recurso de vídeo **ni** interacción `video`), `QUIZ_NO_SCORED`
  (`unit_quiz` sin interacción `scored`), `FORUM_SCORED` (`forum_prompt` con interacción
  puntuable — el foro es actividad externa del campus), `CALLOUT_EMPTY` (un
  `::: tipo` … `:::` sin cuerpo en `student_text` — caja vacía en pantalla; los GPT a
  veces lo emiten). La filosofía: las recetas guían
  al crear, el editor permite todo, y estos avisos señalan lo incongruente sin bloquear.

Uso en UI:
- El badge `.ed-status` con el recuento `errores ⛔ · avisos ⚠` vive **dentro de la
  pestaña «Validación»** (`App.tsx`, memoizado con `useMemo(course)`) y **solo se muestra
  si hay algún error o aviso** (rojo con errores, ámbar solo con avisos); los `info` no
  cuentan. La pestaña Validación se muestra a ancho completo, sin el árbol lateral.
- `ValidationPanel` (`src/components/ValidationPanel.tsx`): issues **agrupados por
  módulo › unidad** (por ids, no parseando `location`), más grupos «Test final» y «Curso y
  SCORM». Los recuadros de severidad del resumen actúan de **filtro** (clic = ocultar/
  mostrar; clase `.is-off`).
- Botón **«Copiar informe»** (en el resumen, solo si hay issues): copia TODOS los issues
  (ignora los filtros, para que el resultado sea determinista) como markdown
  `- ⛔ [CODE] mensaje — ubicación` con cabecera de título y recuentos. Es la entrada del
  ciclo de **autocorrección por el GPT**: el usuario lo pega en ChatGPT y el GPT corrige
  cada código según `docs/gpt/tabla-autocorreccion.md`. Por eso los códigos son parte del
  contrato con el GPT: **todo validador nuevo o cambiado en `validators.ts` debe
  añadir/actualizar su fila en esa tabla** (convención también en `CLAUDE.md`). El
  informe exportado (`report.ts`) imprime igualmente `[CODE]` en riesgos y pendientes.

### Enlaces al editor (invariante de navegación)
Todo issue con destino editable **enlaza a su superficie de edición**. La resolución vive
en `src/components/IssueList.tsx` (`useIssueTarget` + `IssueItem`, compartidos por
Validación e Informe):
- `screenId` → `goToScreen(id)` del store (= `selectScreen` **+** `activeTab: 'editor'`);
  `'__final__'` abre el `FinalTestEditor`.
- `unitId` → primera pantalla de la unidad (no hay editor de unidad).
- Códigos de origen de la nota (`SCORM_NO_ACTIVITIES`, `SCORM_MIXED_*`) → abren la
  ventana de Ajustes correspondiente; su estado (`settingsModal`) vive en el store para
  poder abrirse desde aquí.
- Sin superficie de edición en la UI (`scorm.identifier`…) → sin enlace: solo se editan
  vía JSON/GPT.

## Informe (`src/report/report.ts`, `ReportPanel`)
Pestaña «report». `buildReport(course)` devuelve el **modelo estructurado** (`ReportData`):
recuentos, matriz de trazabilidad (con columna «Ubicación» módulo › unidad y `screenId`
por fila), tabla de preguntas/respuestas (con columna «Origen» y `screenId`), checklists,
riesgos (errores) y pendientes (avisos). Incluye pantallas, **tests de unidad** y test
final; los tests de unidad enlazan a la primera pantalla de su unidad.

Ese modelo alimenta **dos renderizadores** (única fuente):
- `ReportPanel` (`src/components/ReportPanel.tsx`): render **nativo React** con enlaces al
  editor en matriz, preguntas, riesgos y pendientes (reutiliza `IssueItem`), y «ver en
  Validación» en los criterios fallidos de las checklists. No usa iframe.
- `generateReportMarkdown` / `generateReportHtml`: exportaciones (descarga MD/HTML e
  Imprimir/PDF), sin enlaces. Las celdas pasan por `mdCell()` (sustituye `|` por `¦` y
  aplana saltos de línea) porque el conversor MD→HTML propio parte las filas por `|`.
