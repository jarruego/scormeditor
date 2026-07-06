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
- **Posición respecto al texto**: `screen.interaction_layout` (`top`/`bottom`, def.
  `bottom`). `render()` (renderer.js) mueve `.me-interaction` tras el `<h1>` cuando es
  `top`. Editable en `ScreenEditor`.
- **`flip_cards` con volteo 3D** (jul 2026): ambas caras viven **siempre en el DOM**
  (`.me-flip-inner` gira con `rotateY`; caras apiladas en la misma celda de grid para que
  la altura sea la del contenido mayor; `backface-visibility` oculta el reverso). El lector
  de pantalla usa `aria-hidden` alternado, **no** el atributo `hidden`. La impresión ya no
  las expande por JS (`setupPrint`): `print.css` aplana el giro y muestra las dos caras.
- **Feedback marcado en la opción** (fase 1): `choiceFactory` y `scenario_decision` marcan
  el elemento elegido con `.is-right`/`.is-wrong` (color + icono ✔/✖), también al
  restaurar; `replay()` reinicia las animaciones (shake/pop) entre intentos.

## Tipos añadidos en fase 4 (jul 2026)
Tres tipos nuevos en el enum (`course.schema.ts`), con etiqueta (`labels.ts`), coletilla
(`TYPE_LABELS`), editor de config (`InteractionConfigEditor`), validación y contrato GPT
(`docs/gpt/contrato-course-json.md`) sincronizados:
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

## Roadmap (acordado, no implementado)
- **Animación secuencial** del contenido: revelar bloques en cascada. Encaja porque cada
  bloque (`<p>`, `<li>`, callout) ya sale como elemento independiente; se marcarían con
  `data-reveal` y se revelarían desde `app.js`.
