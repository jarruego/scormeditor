# Motor de interacciones (`src/runtime/assets/js/interactions.js`)

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`.

Cada interacción se construye con una *factory* que devuelve un **controlador** con el
contrato `{ result(), check(), hasAnswer() }`. El orquestador (`app.js`) solo habla con
ese contrato; no conoce el tipo concreto.

- **Restauración**: todo controlador se repinta desde `ctx.state` al volver a la pantalla
  (el progreso se guarda en `STATE` y en `suspend_data`). Es obligatorio: una interacción
  que no restaura su estado visual rompe la vuelta atrás del alumno.
- **Botón «Comprobar»** (decisión revertida y vuelta a poner): las evaluables
  (`single_choice`, `true_false`, `sort_steps`, `match_pairs`, `classification`) muestran
  un botón `.me-check` que llama a `check()`. Al agotar intentos, `lock()` deshabilita el
  botón pero **siempre se puede avanzar**.
- **Intentos**: campo `attempts` por interacción (`attemptsOf(data)`: `null`/ausente ⇒ 1;
  `0` ⇒ ilimitados; `n` ⇒ n). `retries` quedó **DEPRECATED**, no usar. Editor: input de
  intentos en `ScreenEditor.tsx` para los tipos evaluables. Por defecto **1 intento**.
- `result()` de una evaluable → `{ completed, scored, correct, score: acierto?points:0,
  maxScore: points }`. `completed` (done) = **resuelta**: acierto **o** intentos agotados
  (con 1 intento, se completa al responder aunque falles; con ilimitados, solo al
  acertar). Cómo puntúa/finaliza: ver `evaluacion-finalizacion.md`.
- **Drag&drop** (sin dnd-kit; el runtime es plano): `sort_steps` reordena; `match_pairs`
  y `classification` usan `dragAssignFactory` (chips `.me-chip` sobre zonas `.me-dnd`).
- **Layout de `dragAssignFactory`** (jul 2026): pool «Sin asignar» a la **izquierda** y
  categorías a la derecha, **apiladas en vertical** (grid 2 columnas al 50%; se apilan
  a ≤640px). El `<select>` por chip se
  **eliminó**: la alternativa al arrastre es **tocar y colocar** (clic/Enter en el chip lo
  selecciona `.is-picked`/`aria-pressed`, clic/Enter en una zona lo coloca; las zonas son
  focusables con `role=button` y todo se anuncia vía `ctx.announce`). Sirve igual para
  táctil, teclado y ratón; `lockAssign` retira roles/tabindex al resolverse.
- **Informativas** (`accordion`, `tabs`, `flip_cards`, `video`, `hotspots`,
  `case_practice`) **no** fijan `STATE.results`; su avance se captura al entrar (ver sync
  en `editor-ui.md`) para no bloquear «Siguiente».
- **Cuerpos de `accordion`/`tabs` en bloque**: usan `block()` (→ `Renderer.mdToHtml`, no
  `rich()`), así una lista `- ` dentro de un `item` sale como `<ul>`, no en línea. El
  resto de textos cortos (títulos, opciones, cards) siguen con `rich()` (inline).
- **Desplegables exclusivos** (jul 2026): en `accordion` y `timeline`, abrir un ítem
  cierra los demás de la misma interacción (el clic recorre los `heads` hermanos). No
  afecta a la impresión: `setupPrint` abre todos tocando atributos, sin disparar clics.
- **`flip_cards` exclusivas** (jul 2026): girar una carta devuelve las demás a su anverso
  (mismo criterio que los desplegables exclusivos).
- **`case_practice` sin campo de texto** (jul 2026): decisión deliberada — el alumno
  piensa/escribe su respuesta **en papel** (hint `.me-case-hint`) y se autoevalúa con la
  rúbrica; así la respuesta no gasta `suspend_data` (límite 4096 en SCORM 1.2). El estado
  guarda solo `{rubric: [índices marcados]}` y se restaura al volver. La rúbrica es una
  **card desplegable** que reutiliza las clases del accordion (`me-acc-head`/`me-acc-body`:
  «+», pulso-glow hasta el primer clic y expansión al imprimir heredados); con marcas
  guardadas se restaura abierta. Tampoco se escribe
  nada en `cmi.interactions` (write-only en 1.2, soporte irregular); si algún día se
  quiere trazabilidad, esa es la vía. Validador: `CP_NO_RUBRIC` (warning sin rúbrica).
- **Affordance «hay que clicar»** (jul 2026), en `accordion`, `flip_cards`, `tabs`,
  `timeline`, `flashcards` (lengüeta «+» → «✓» verde al revelar, pulso solo con el repaso
  sin empezar, y **la carta entera es clicable** para revelar además del botón) y
  `hotspots` (marca «+» en disco blanco centrada en cada zona; el pulso va en **todas**
  las zonas —señalar solo una sesgaría la respuesta— y se apaga al primer intento)
  (en tabs: conjunto envuelto en bloque `.me-tabs-box`, check verde por pestaña — la
  primera nace vista —, pulso en la **segunda** pestaña hasta cambiar): icono «+»
  (rota a «×» al abrir en accordion; lengüeta `.me-flip-tab` en la esquina de la carta),
  pulso-glow (`.me-pulse`, keyframes `me-pulse-glow`) en el **primer** ítem/carta mientras
  no se haya abierto ninguno, y **check verde** al abrir (`.is-seen`; en la carta la
  lengüeta pasa a «✓» verde). Lo visto se persiste como `{seen: {idx: true}}` vía
  `ctx.save`.
- **Los interactivos de exploración bloquean hasta verlo todo** (jul 2026): `accordion`,
  `tabs`, `flip_cards`, `timeline` y `flashcards` devuelven `completed` solo cuando el
  alumno ha abierto/girado **todos** los apartados (flashcards: al terminar el repaso una
  vez; «Repetir repaso» no la des-completa, se persiste `done: true`). Con la regla
  `require_interactions` activa y la pantalla `required`, el gating de navegación
  (`interactionOk`, app.js) no deja avanzar hasta entonces. Siguen sin puntuar
  (`scored: false`). `video`, `case_practice` y `html_embed` completan al renderizarse
  (no hay señal fiable de «visto entero»).
- **Posición respecto al texto**: `screen.interaction_layout` (`top`/`bottom`, def.
  `bottom`). `render()` (renderer.js) mueve `.me-interaction` tras el `<h1>` cuando es
  `top`. Editable en `ScreenEditor`.
- **`flip_cards` con volteo 3D** (jul 2026): ambas caras viven **siempre en el DOM**
  (`.me-flip-inner` gira con `rotateY`; caras apiladas en la misma celda de grid para que
  la altura sea la del contenido mayor; `backface-visibility` oculta el reverso). El lector
  de pantalla usa `aria-hidden` alternado, **no** el atributo `hidden`. La impresión ya no
  las expande por JS (`setupPrint`): `print.css` aplana el giro y muestra las dos caras.
- **Botón Comprobar con affordance** (jul 2026): helper `wireCheck(el, ready)` compartido
  por `choiceFactory`, `sort_steps`, `dragAssignFactory` y `fill_blanks`. El botón nace
  **desactivado**; cuando `ready()` se cumple por acción del usuario se activa **con
  pulso-glow** (en sort, «responder» = primer movimiento). El pulso se apaga al clicar y
  vuelve si se cambia la respuesta; al restaurar respuesta sin resolver se activa sin
  pulso. De paso, `move()` de sort ignora el teclado cuando la interacción está resuelta.
- **Feedback marcado en la opción** (fase 1): `choiceFactory` y `scenario_decision` marcan
  el elemento elegido con `.is-right`/`.is-wrong` (color + icono ✔/✖), también al
  restaurar; `replay()` reinicia las animaciones (shake/pop) entre intentos.

## Tipos añadidos en fase 4 (jul 2026)
Tres tipos nuevos en el enum (`course.schema.ts`), con etiqueta (`labels.ts`), editor de
config (`InteractionConfigEditor`), validación y contrato GPT
(`docs/gpt/contrato-course-json.md`) sincronizados. (La coletilla `TYPE_LABELS`
«Actividad/Interactivo» que encabezaba cada interacción se retiró en jul 2026 a petición
del autor: la instrucción de cada ejercicio ya la da su `prompt`/`instructions`.)
- **`fill_blanks`** (evaluable): `config.text` con huecos `[[respuesta]]` +
  `config.distractors` opcional. Cada hueco → `<select>` con pool barajado (determinista,
  `shuffle` por id). Comprobar marca cada select `.is-right`/`.is-wrong`; intentos y
  restauración como `choiceFactory` (`{values, correct, attempts}`). Validador:
  `FB_NO_BLANKS` (sin huecos) y feedback obligatorio. Campo Intentos visible en el editor.
- **`timeline`** (informativa): `config.milestones` `[{label, title, body}]` → `<ol
  class="me-tl">` con línea/puntos de acento; cada hito se despliega como accordion
  (mismo patrón `aria-expanded`+`hidden` → `setupPrint` los expande al imprimir y
  `print.css` muestra `.me-tl-body[hidden]`). Validador: `TL_EMPTY`.
- **`flashcards`** (autoevaluación, **no puntúa**): `config.cards` `{front, back}` (mismo
  shape que `flip_cards`). Flujo una carta cada vez: «Mostrar respuesta» → «¿La sabías?»
  → resumen «X de N» + repetir. Estado `{idx, known[]}` restaurable. Validador: `FC_EMPTY`
  y `FC_SCORED` (warning si `scored: true`). `completed: true` siempre (no bloquea).

## `html_embed` — HTML/CSS/JS a medida (jul 2026)
Tipo informativo para animaciones e interactivos ad hoc que el **autor pega a mano** en el
editor (tres textareas de código + alto opcional). `config: { html, css, js, height? }`.
- **Excepción controlada a la invariante anti-XSS**: es el único tipo que guarda código en
  `course.json`, y por eso corre en un `<iframe sandbox="allow-scripts">` **sin**
  `allow-same-origin` (origen opaco): no puede tocar la API SCORM, `suspend_data` ni el DOM
  de la carcasa. Nada del autor se inyecta en nuestro DOM — el documento interno viaja
  **escapado** dentro del atributo `srcdoc` (y `</script>`/`</style>` internos se neutralizan
  para no romper el documento del iframe).
- **Alto**: fijo si `config.height` (px); si no, **auto-resize** — el doc interno reporta
  `scrollHeight` por `postMessage` (`{meEmbed: id, height}`, único canal con origen opaco)
  y la carcasa ajusta el iframe filtrando por id de interacción.
- No puntúa ni guarda estado (`completed: true, scored: false`); el sandbox no tiene acceso
  a `ctx`. El código debe ser **autocontenido** (sin CDN si el curso puede verse offline).
- Validadores: `EMBED_EMPTY` (error sin html ni js) y `EMBED_SCORED` (warning si `scored`).
- No participa en TTS (`buildTranscript` no lo lista como informativa narrable: es código).

## Roadmap (acordado, no implementado)
- **Animación secuencial** del contenido: revelar bloques en cascada. Encaja porque cada
  bloque (`<p>`, `<li>`, callout) ya sale como elemento independiente; se marcarían con
  `data-reveal` y se revelarían desde `app.js`.
