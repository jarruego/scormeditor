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
  puntos — el reparto proporcional a los `points` diluía el test final: con puntos por
  defecto la práctica dominaba la nota).

## Finalización (completado)
`evaluateCompletion()`: completado si se ve el `min_required_screens_pct` de pantallas
requeridas Y (si `require_interactions`) se han **completado** las interacciones
evaluables. Una evaluable se marca `completed` al **resolverse** (acertar o agotar
intentos): cuenta para la finalización **responderla**, no acertarla (salvo intentos
ilimitados, donde hay que acertar). `SCORM.setStatus`: `incomplete` / `passed` /
`failed` / `completed` (sin contenido calificable).

- `mastery_score`/`masteryscore` van al manifiesto (`src/scorm/manifest.ts`);
  `rules.min_score` es el umbral APTO en el runtime.
- **Nota mínima única**: `rules.min_score` es el ÚNICO umbral. El banner APTO/NO APTO de
  la pantalla del test también lo usa, y solo aparece con `score_source: 'final_test'`
  (con `mixed`/`unit_tests` el test muestra solo su puntuación y remite a «Resultados»,
  que es quien dicta el veredicto). `final_test.pass_score` queda en el esquema por
  compatibilidad pero **se ignora** (pintaba un APTO propio que podía contradecir al del
  curso).

## Cierre de sesión y modos del LMS
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

## Salir y Reintentar en Resultados
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
  `renderFinalTest()` pinta el formulario; al **Comprobar test**, feedback por pregunta
  y guarda `STATE.results.__final__`. Las **opciones de cada pregunta se barajan**
  (`Interactions.shuffle`, determinista por `q.id`; `true_false` mantiene V/F); las
  preguntas conservan su orden. Seguro para restaurar: las respuestas se guardan por id. No hay texto fijo de instrucciones: solo
  `final_test.instructions` (configurable en el editor, vacío por defecto) y el
  contador de intentos si hay límite. En paginado, al comprobar (y al volver con el
  test ya comprobado) se aterriza en la **vista de resultado** (`showSummary`, `mode:
  'questions'|'summary'` dentro de `renderFinalTest`): puntuación (APTO/NO APTO si
  `score_source: 'final_test'`), aciertos «X de N», **intentos restantes** y acciones
  «Repetir el test» (solo si quedan intentos y <100%; salta a la primera fallada) y
  «Revisar las respuestas». Desde ella «Siguiente» sale de la pantalla y «Anterior» o
  los cuadritos vuelven a las preguntas; revisando, «Siguiente» tras la última vuelve
  a la vista de resultado. Con **respuestas cambiadas sin comprobar** (flag `dirty`),
  la vista de resultado muestra en su lugar la variante «Respuestas modificadas» con
  un botón **«Comprobar test»** (misma `comprobar()` que el submit del formulario).
  En modo clásico el banner inline incluye los intentos.
  Además, `finalLeave` (puente consultado por `goRelative`, limpiado en `goTo` como
  `finalNav`) intercepta «Siguiente» al salir del test según el resultado vigente:
  con **100% o sin intentos restantes**, sale libre; **NO APTO con intentos** (solo
  `score_source: 'final_test'`), **bloquea** — modal sin «Continuar», acciones
  «Repetir el test» (a la primera fallada) / «Seguir revisando»; en modo autor el
  bloqueo se degrada a aviso para conservar la navegación libre. **Aprobado sin 100%**
  (o sin veredicto propio) con intentos: aviso «Quedarme en el test» / «Continuar»
  (`testDialog`, clases `.me-modal`/`.me-exit-*` reutilizadas).
  Con `final_test.one_question_per_screen` (checkbox «Una pregunta por pantalla» en el
  editor del test) el formulario se pagina: todos los fieldsets siguen en el DOM (la
  corrección `paint()` y la restauración no cambian) pero solo se muestra el actual.
  No hay botones propios: los **Anterior/Siguiente de la carcasa** mueven las preguntas
  mientras el test está en pantalla (puente `finalNav`, consultado por `goRelative` y
  `refreshNavState`; `goTo` lo limpia al salir) y solo cambian de diapositiva en los
  extremos. Encima va el **navegador de preguntas** (`.me-qnav-row`: rótulo
  «PREGUNTAS:» + `.me-qnav`, en columna en ≤640px): un cuadrito numerado por pregunta,
  clicable para saltar, con estado gris = sin responder, relleno = respondida,
  verde/rojo = corregida y borde en la actual. El contador «Pregunta X de N»
  (`.me-final-prog`) es solo para lectores de pantalla (`sr-only`, aria-live).
  «Comprobar test» se ve **solo en la última pregunta** (visible en las demás confundía:
  parecía comprobar solo esa pregunta; al repetir, la variante «Respuestas modificadas»
  de la vista de resultado ofrece el suyo); Enter en una intermedia avanza en vez de
  comprobar; comprobar con preguntas sin responder salta a la primera pendiente. Con
  0–1 preguntas no se pagina.
  Al **cambiar una respuesta** (paginado o no) se retira el feedback de esa pregunta y
  el banner de nota del envío anterior (los intentos siguientes parten limpios).
- **Resultados** `__results__` (si hay algo que calificar): `renderResults()` muestra
  nota, **APTO/NO APTO** (o «Curso incompleto») y desglose (test final y/o actividades).
  Estilos `.me-result-*` en `styles.css`.

Ambas se excluyen del postMessage de sync con el editor y no son editables como pantalla
(el test final se edita en `FinalTestEditor`; ver `editor-pantallas.md`).

## Dónde se configura
Todo esto vive en `scorm.rules` + `mastery_score`, editables en **⚙ Ajustes → Curso
(Finalización)** y, para el GPT, en `scorm.rules` del `course.json` (contrato §2).
