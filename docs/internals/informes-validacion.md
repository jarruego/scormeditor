# Validación e informes

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`.

## Validación (`src/validation/validators.ts`)
`validateCourse(course)` recorre el curso y devuelve una lista de `Issue`
(`{ code, severity: 'error'|'warning'|'info', message, location, screenId?, unitId? }`).
Reglas por pantalla / unidad / curso, p. ej.:
- Pantalla marcada como esqueleto/`content_placeholder` → `warning`.
- `type` distinto de `cover`/`summary` **sin** `objective` → aviso (por eso el editor
  rellena `objective` aunque no se muestre como banner; ver `arquitectura-runtime.md`).
- Imagen sin `alt`, vídeo sin `transcript`, interacción sin `learning_objective`, etc.
- **Preguntas de tests** (final y de unidad): mismas exigencias que las interacciones de
  pantalla — enunciado, respuesta correcta y feedback (`checkQuizQuestions`). Las del test
  final llevan `screenId: '__final__'`; las de tests de unidad llevan `unitId`.
- **Cobertura de objetivos**: un issue `OBJ_NOT_EVALUATED` **por objetivo** no evaluado,
  enlazado (`screenId`) a la primera pantalla que lo declara. Cuentan como evaluación las
  interacciones `scored`, el test final y los tests de unidad. La comparación es
  **normalizada** (`normalizeObjective` en `src/validation/objectives.ts`: sin acentos,
  minúsculas, espacios colapsados, sin puntuación final) porque la vinculación histórica
  era texto libre y abundan pares «casi iguales»; `ObjectiveSelect` usa el mismo
  normalizador. No endurecer a comparación exacta.
- **Origen de la nota** (`score_source`): ojo a la semántica real del runtime
  (`computeScore` en `app.js`): `'unit_tests'` = **actividades evaluables** (interacciones
  de pantalla con `scored`), no `assessments.unit_tests`. Reglas: `SCORM_NO_FINAL`
  (final_test sin preguntas, `screenId '__final__'`), `SCORM_NO_ACTIVITIES` (unit_tests sin
  interacciones puntuadas), `SCORM_MIXED_EMPTY`/`SCORM_MIXED_NO_FINAL`/
  `SCORM_MIXED_NO_ACTIVITIES` (mixed sin uno u otro bloque).

Uso en UI:
- `Toolbar` muestra el badge `.ed-status` con el recuento `errores ⛔ · avisos ⚠`
  (memoizado con `useMemo(course)`); al pulsarlo navega a la pestaña de validación.
- `ValidationPanel` (`src/components/ValidationPanel.tsx`): issues **agrupados por
  módulo › unidad** (por ids, no parseando `location`), más grupos «Test final» y «Curso y
  SCORM». Los recuadros de severidad del resumen actúan de **filtro** (clic = ocultar/
  mostrar; clase `.is-off`).

### Enlaces al editor (invariante de navegación)
Todo issue con destino editable **enlaza a su superficie de edición**. La resolución vive
en `src/components/IssueList.tsx` (`useIssueTarget` + `IssueItem`, compartidos por
Validación e Informe):
- `screenId` → `goToScreen(id)` del store (= `selectScreen` **+** `activeTab: 'editor'`);
  `'__final__'` abre el `FinalTestEditor`.
- `unitId` → primera pantalla de la unidad (no hay editor de unidad).
- Códigos de origen de la nota (`SCORM_NO_ACTIVITIES`, `SCORM_MIXED_*`) → abren el modal
  de Ajustes; su estado (`settingsModal`) vive en el store para poder abrirse desde aquí
  (antes era estado local de `Toolbar`).
- Sin superficie de edición en la UI (glosario, bibliografía, `scorm.identifier`) → sin
  enlace: solo se editan vía JSON/GPT.

## Informe (`src/report/report.ts`, `ReportPanel`)
Pestaña «report». `buildReport(course)` devuelve el **modelo estructurado** (`ReportData`):
recuentos, matriz de trazabilidad (con columna «Ubicación» módulo › unidad y `screenId`
por fila), tabla de preguntas/respuestas (con columna «Origen» y `screenId`), checklists,
riesgos (errores) y pendientes (avisos). Incluye pantallas, **tests de unidad** y test
final; los tests de unidad enlazan a la primera pantalla de su unidad.

Ese modelo alimenta **dos renderizadores** (única fuente):
- `ReportPanel` (`src/components/ReportPanel.tsx`): render **nativo React** con enlaces al
  editor en matriz, preguntas, riesgos y pendientes (reutiliza `IssueItem`), y «ver en
  Validación» en los criterios fallidos de las checklists. Ya no usa iframe.
- `generateReportMarkdown` / `generateReportHtml`: exportaciones (descarga MD/HTML e
  Imprimir/PDF), sin enlaces. Las celdas pasan por `mdCell()` (sustituye `|` por `¦` y
  aplana saltos de línea) porque el conversor MD→HTML propio parte las filas por `|`.
