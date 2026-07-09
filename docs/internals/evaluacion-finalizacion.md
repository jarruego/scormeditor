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

## Cierre de sesión y modos del LMS (jul 2026, inspirado en eXeLearning)
- `finishSession()` (app.js) es **idempotente** (flag `sessionFinished`) y se engancha a
  `beforeunload` **y** `pagehide` (Safari/iOS no dispara beforeunload de forma fiable).
  Si se cierra antes de cargar `course.json`, no evalúa nada.
- Al salir **sin terminar** se setea `cmi.core.exit = "suspend"` (`SCORM.setExit`), salvo
  `rules.allow_resume: false`. Moodle reanuda igualmente, pero otros LMS **descartan** el
  intento (y el `suspend_data`) si no se marca suspend.
- **Modo repaso**: el wrapper (`scorm_api.js`) lee `cmi.core.lesson_mode` al inicializar;
  con `review`/`browse` (`SCORM.isReview()`) los setters de tracking (`setStatus`,
  `setScore`, `setLocation`, `setSuspend`, `setExit`) son **no-op**: un alumno ya
  calificado puede repasar el curso sin machacar su estado ni su nota. La guarda vive en
  el wrapper a propósito: ninguna llamada de `app.js` puede saltársela.

## Salir y Reintentar en Resultados (jul 2026)
`renderResults()` añade acciones al pie:
- **Salir del curso** (siempre visible; botón centrado con el color de acento):
  `finishSession()` (nota/tiempo/exit registrados) + intento de `window.close()`; si el
  navegador no deja cerrar (ventana no abierta por script), se muestra una **despedida
  a pantalla completa** (`.me-exit-done`: «Sesión finalizada… cierra la pestaña») que
  cubre la carcasa — la sesión SCORM ya está cerrada (LMSFinish) y navegar detrás no
  persistiría nada. Con el curso **incompleto** pide confirmación primero
  (`confirmExitIncomplete`, modal propia con clases `.me-modal`): avisa de que no habrá
  calificación y de que el progreso queda guardado para reanudar (mensaje adaptado si
  `allow_resume: false`).
- El **desglose de calificaciones** va plegado en un accordion (`foldHtml`/`wireFolds`,
  app.js — mismas clases `.me-acc-*` que las interacciones, así `setupPrint` lo expande
  al imprimir). El informe de progreso pliega igual su «Detalle de actividades».
- **Reintentar el curso** (solo **NO APTO** y si quedan intentos): `retryCourse()` limpia
  `STATE.interactions`/`results`/`finalScore` (práctica Y test final) pero **conserva
  `visited`** (el contenido ya se estudió; lo que se repite es la evaluación), vuelve a
  la primera pantalla y marca `incomplete`. `rules.attempts_allowed` (0 = ilimitados)
  se compara con `STATE.attempts` (intentos consumidos, persistido en `suspend_data`);
  se muestra cuántos quedan o que se agotaron.

## Informe de progreso (`progress_report`)
El snapshot que consume la interacción (`progressSnapshot()` en app.js, expuesto vía
`ctx.progress`) vive aquí porque reutiliza `computeScore`/`requiredScreens`/`isRequired`.
Detalle de qué muestra: `interacciones.md`.

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
