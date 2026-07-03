# Navegación, gating, evaluación y finalización (`app.js`)

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`.

## Navegación y gating
- **Modo autor** (`window.__AUTHOR_MODE__`): navegación **libre y sin gating** para
  probar sin completar cada pantalla. En modo alumno, «Siguiente» exige
  `screenSatisfied(current)` (pantalla requerida vista / interacción respondida +
  `min_time_seconds`).

## Nota (`computeScore()`)
Depende de `scorm.rules.score_source`:
- `final_test`: nota **solo** del test final (`__final__`). Las interacciones evaluables
  de contenido NO puntúan (son práctica + requisito de finalización).
- `unit_tests`: nota **solo** de las interacciones evaluables.
- `mixed`: **media ponderada** de práctica y test final por `rules.mixed_final_weight`
  (% del test final, def. 70; cada bloque se normaliza a su propio %, **no** por suma de
  puntos). Añadido jul 2026 (antes era proporcional a los `points`, que diluía el test
  final: con puntos por defecto la práctica dominaba la nota).

## Finalización (completado)
`evaluateCompletion()`: completado si se ve el `min_required_screens_pct` de pantallas
requeridas Y (si `require_interactions`) se han **completado** las interacciones
evaluables. Una evaluable se marca `completed` al **resolverse** (acertar o agotar
intentos): cuenta para la finalización **responderla**, no acertarla (salvo intentos
ilimitados, donde hay que acertar). `SCORM.setStatus`: `incomplete` / `passed` /
`failed` / `completed` (sin contenido calificable).

- `mastery_score`/`masteryscore` van al manifiesto (`src/scorm/manifest.ts`);
  `rules.min_score` es el umbral APTO en el runtime.

## Pantallas sintéticas (no están en `course.json`)
`flatten()` añade al final de `SCREENS`:
- **Test final** `__final__` (si `assessments.final_test` tiene preguntas):
  `renderFinalTest()` pinta el formulario; al enviar, feedback por pregunta + nota; guarda
  `STATE.results.__final__`.
- **Resultados** `__results__` (si hay algo que calificar): `renderResults()` muestra
  nota, **APTO/NO APTO** (o «Curso incompleto») y desglose (test final y/o actividades).
  Estilos `.me-result-*` en `styles.css`.

Ambas se excluyen del postMessage de sync con el editor y no son editables como pantalla
(el test final se edita en `FinalTestEditor`; ver `editor-ui.md`).

## Dónde se configura
Todo esto vive en `scorm.rules` + `mastery_score`, editables en el modal **⚙ Ajustes**
(`CourseSettingsEditor`) y, para el GPT, en `scorm.rules` del `course.json` (contrato §2).
