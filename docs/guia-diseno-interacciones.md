# Guía de diseño instruccional e interacciones (SCORMEditor)

Complemento pedagógico de `contrato-course-json.md` (la referencia estructural) y de
`ejemplo-course-json.md` (la forma exacta). Aquí va el **criterio**: cómo trocear el
contenido, qué interacción elegir y cómo evaluar. Ante conflicto, **manda el
contrato**.

## Regla nº 1: conservar el texto original (NO resumir, NI reescribir)
El error más grave es **resumir o parafrasear**: quedarse con la idea general y tirar
frases, ejemplos, datos, definiciones, matices o ítems de lista. **No se hace eso.** El
curso debe contener el texto original **prácticamente al 100%**. Lo que cambia es la
*presentación* (repartir el texto en más pantallas cortas + interacción), **no** el
texto en sí. **No reescribas «para e-learning»**: usa las palabras del documento; solo
se permiten **retoques mínimos de conexión** para que los cortes entre pantallas sean
coherentes (partir una frase larga, añadir un titular o una frase puente, resolver un
«como se vio antes»). Ante la duda, **más pantallas** antes que recortar.

**Método obligatorio (con Code Interpreter):**
1. **Extrae el texto CON su formato**, no en plano: el texto plano pierde negritas y
   cajas destacadas. Con PyMuPDF usa `page.get_text("dict")` y, por cada `span`, mira
   `flags` (bit `16` = negrita) y el nombre de la fuente (contiene «Bold»/«Semibold»)
   para **conservar las negritas como `**...**`**; usa tamaño/color/recuadro para
   detectar **encabezados** (→ `## `/`### `) y **cajas destacadas** (→ callouts, ver
   abajo). Trabaja sobre lo extraído, no de memoria.
2. **Segméntalo en bloques de contenido autónomos**, en orden. Un **encabezado va
   SIEMPRE junto al texto que introduce**: título + subtítulo + su cuerpo son **una
   sola pantalla**, no tres. La granularidad (más pantallas) viene de **partir cuerpos
   largos**, NO de aislar encabezados. Un tema denso puede necesitar **20-40+
   pantallas**; es correcto, pero cada una debe llevar **cuerpo real**.
   - **Nunca una pantalla vacía** (solo un título/encabezado sin texto). Si un
     encabezado no tiene cuerpo propio, va con el contenido que encabeza.
   - **Nunca partas un título/subtítulo de su contenido** en pantallas distintas.
3. Cada pantalla lleva su trozo del texto **casi literal**, **visible** en
   `student_text` y/o dentro de una interactividad informativa (ver «Presentar el
   texto…» más abajo), y **además duplicado íntegro en `transcript`** (accesibilidad/
   narración). Nada de contenido queda solo en `transcript`: el alumno lo ve en pantalla.
4. Si un trozo es largo o mezcla ideas, **pártelo en más pantallas**; nunca lo
   comprimas para que «quepa».

**Objetivo cuantitativo de control:** la suma del texto conservado por tema (visible +
`transcript`, sin contar el duplicado) debe **cubrir ~100%** de la prosa de origen de
ese tema (**mínimo ≥ 0.95**, ideal ≈ 1.0; puede pasar de 1.0 por las frases puente). Si
sale por debajo, **estás resumiendo**: añade pantallas y recupera lo omitido.

**Marca el control** en `quality_checklist`:
`"Contenido del documento trazado sin pérdidas": true`.

### Formato de `student_text` (cómo escribir el texto de la diapositiva)
La diapositiva es **solo el contenido**: un texto normal con su formato. **NO** añadas
por diapositiva rótulos tipo `**Idea clave:**`, `**Claves:**`, `Resumen`, `Objetivo:`
ni cajitas de «lo importante»: eso ensucia y repite. Solo el contenido.
- **Nunca truncar con «…» o «...».** El `student_text` lleva el texto **completo** del
  trozo, no una vista previa recortada. Si es largo, **más pantallas**, no puntos
  suspensivos.
- **Listas**: cada elemento en **su propia línea**, empezando por `- ` (guion +
  espacio). No pongas la lista en una sola línea (`a • b • c`) ni con viñeta `•`: el
  editor la mostraría como un párrafo corrido. Numeradas: `1. `, `2. `…
- **Encabezados**: el título de un apartado va con `## ` o `### ` en una línea con
  **solo el título** (el cuerpo, en la línea siguiente). **No** metas el título dentro
  del párrafo («TítuloTexto que sigue…»), ni el cuerpo en la misma línea del `##`
  (`### Título ¿…? El texto sigue aquí…` → saldría todo como un encabezado gigante),
  ni como una línea suelta en negrita.
- **Negrita** `**así**`, **cursiva** `*así*`. **Conserva las negritas del documento
  fuente**: si una palabra o frase va en negrita en el original, mantenla en negrita
  (`**...**`). No inventes negritas donde no las hay.
- **Enlaces externos**: detéctalos en el origen y **presérvalos** como `[texto](url)`
  (http/https o mailto). Una **URL suelta** del documento (`https://…`) envuélvela
  también como `[texto](url)`, si no, no se renderiza como enlace. El editor los abre
  **en otra pestaña** automáticamente (`target="_blank"`); no añadas tú ese atributo,
  es texto plano.

### El `title` de la pantalla (cabecera): corto y descriptivo
El campo `title` se muestra como cabecera (`<h1>`) de la diapositiva. Es un **rótulo
corto** (2-6 palabras) de lo que trata la pantalla: `"Qué información recoger"`,
`"Áreas clave de la historia de vida"`. **NO** un fragmento del contenido cortado a
mitad de frase (errores reales: `title = "Se va elaborando:"`, `title = "Pero para
poder diseñar apoyos realmente pers…"`, `title = "- Religión"`).
- **No dupliques el `title` en el contenido.** El `title` ya sale como cabecera; el
  `student_text` **empieza por el cuerpo**, NO por un `## `/`### ` que repita el título.
  Usa `### ` dentro del contenido **solo** para sub-secciones reales distintas del
  título (y con solo el título en su línea; el cuerpo, en la siguiente).
- **Continuación**: si un apartado/subtema se parte en **varias pantallas**, todas
  **mantienen el mismo `title`** (la diapositiva es continuación de la anterior); no
  pongas de título el primer ítem de la lista que continúa.

### Presentar el texto de forma amena (interactividades informativas)
Cuando un trozo sea denso, **repártelo en una interactividad informativa que lo
contiene** (no lo resume), como **alternativa** a un bloque largo — no en todas las
pantallas, solo cuando ayude:
- **`accordion`**: sub-apartados o lista de puntos con desarrollo → cada `item` = un
  apartado con su texto original.
- **`tabs`**: 2-4 bloques paralelos (tipos, fases, enfoques) → una pestaña por bloque.
- **`flip_cards`**: pares término→definición, concepto→ejemplo → `front`/`back`.
El texto de cada `item`/`tab`/`card` es el **texto fuente** de esa parte. En
`transcript` va igualmente el trozo completo.

**Una interacción = UNA pantalla, con TODOS sus ítems.** No la partas en varias
pantallas: un accordion «Áreas clave» con 8 apartados es **un** accordion en **una**
pantalla, no «Áreas clave (1)» / «(2)». Lo mismo con `tabs`/`flip_cards`. Dentro de un
`item`/`tab`/`card`, si hay una lista, cada elemento en **su propia línea** con `- `
(el editor la renderiza como lista dentro del bloque).

**Posición respecto al texto (`interaction_layout`):** por defecto la interacción va
**debajo** del texto (`"bottom"`); pon `"interaction_layout": "top"` en la pantalla
para colocarla **encima** del texto, cuando el manual fuente presente antes la actividad
y luego el desarrollo (también ajustable en el editor).

### Cadencia de interactividades
No metas una interacción en cada pantalla. La mayoría son **solo texto**. Usa:
- **Informativas** (accordion/tabs/flip_cards) **solo** cuando el trozo sea denso y se
  presente mejor así.
- **Aplicadas y evaluables** (`scenario_decision`, `classification`, `single_choice`,
  `case_practice`) como **checkpoints repartidos a lo largo del tema, uno cada 4-8
  pantallas** de contenido. Es **obligatorio el reparto**: **NO las acumules al final**.
  Regla práctica: un tema de N pantallas lleva **al menos ⌈N/8⌉ checkpoints**
  intercalados (un tema de 30 → ~4-6, hacia las pantallas 6, 12, 18, 24, 30), no dos
  seguidas en la 28-29. **Si con las que salen no llegas a esa densidad, añade más**
  donde el contenido se pueda aplicar/decidir. Cada checkpoint, tras un bloque aplicable.
- **Una sola interacción por pantalla** (contrato): el checkpoint es su propia
  pantalla. Y si una interacción **repite conceptos** ya vistos, llévala a la
  **siguiente** pantalla o suprímela; no dupliques.

### Evitar el truncado por límite de respuesta (clave)
Un `course.json` con transcripts completos pesa mucho (cientos de KB). **No lo
generes tecleándolo entero en el chat**: ahí es donde el modelo comprime para que
quepa. En su lugar, **constrúyelo en Python por partes** (un `dict` por tema, los vas
acumulando) y **vuelca el resultado al `.scormproj`** con el builder del contrato
(§11). Si aun así es enorme, genera la unidad **tema a tema** y combina los `dict`
antes de empaquetar. El usuario solo recibe el archivo, no el JSON.

## Principio rector: una idea por pantalla
Si una pantalla necesita dos párrafos largos de `student_text` o un `transcript` que
explica dos conceptos distintos, **divídela**. Señales de que hay que trocear:
- El `transcript` cambia de tema a mitad.
- Hay más de una pregunta posible sobre la pantalla.
- El `student_text` supera ~5–6 líneas visibles.

Ritmo recomendado por tema: portada → objetivos → ruta → **tantas pantallas de
desarrollo como ideas tenga el tema** (intercalando informativas y evaluables) →
casos → resumen → autoevaluación → glosario/bibliografía (van en sus arrays raíz, no
como pantallas). No hay tope: lo manda la cantidad de contenido del documento.

## Detectar bloques destacados (callouts) en el documento de origen
Los documentos suelen traer ya «cajas», recuadros de color o frases con intención de
aviso, consejo, dato curioso, caso o reflexión. **Es obligatorio reconocerlas y
volcarlas como callout** en `student_text` (sintaxis `::: tipo … :::`, ver §4.1 del
contrato) en vez de perderlas como texto plano. Detéctalas por su **etiqueta**
(«Importante», «¿Sabías que?»…) y, cuando extraigas con formato (ver Regla Nº1, paso 1),
también por su **recuadro/color de fondo** aunque no lleven etiqueta. Heurística de
mapeo:

| Señal en el origen | Callout |
|---|---|
| «Consejo», «Truco», «Recomendación», «Buena práctica» | `tip` |
| «Atención», «Cuidado», «Aviso», «Importante evitar», «¡Ojo!» | `warn` |
| «Importante», «Recuerda», «Clave», «No olvides» | `important` |
| «¿Sabías que…?», «Dato», «Curiosidad» | `fact` |
| «Reflexiona», «Piensa en…», «Para reflexionar» | `reflect` |
| «Caso práctico», «Ejemplo», «Situación», «Supuesto» | `case` |
| Nota informativa general que no encaja arriba | `info` |
| Una caja recurrente del documento sin equivalente (p. ej. «Glosario», «Normativa») | `custom` con icono/color |

Pautas:
- No fuerces callouts: un párrafo normal de desarrollo va como texto, no como caja.
- Si un «Caso práctico» del documento admite una decisión, valora convertirlo en
  interacción `scenario_decision` en vez de (o además de) un callout `case`.
- No abuses: 1–2 callouts por pantalla como mucho; si hay más, probablemente toque
  trocear la pantalla.

## Elegir la interacción adecuada
Cuando toque una interacción (no en cada pantalla; ver «Cadencia»), este es el criterio
rápido para elegir el tipo:

| Objetivo cognitivo | Interacción sugerida | Evalúa |
|---|---|---|
| Recordar/identificar | `single_choice`, `true_false` | Sí |
| Comprender relaciones | `match_pairs`, `classification` | Sí |
| Ordenar un proceso | `sort_steps` | Sí |
| Aplicar a un caso / decidir | `scenario_decision`, `case_practice` | Sí / abierta |
| Explorar información densa | `accordion`, `tabs`, `flip_cards` | No |
| Localizar en una imagen | `hotspots` | Sí |
| Ver y comprender un vídeo | `video` | No |

Reglas de oro:
- **Máximo una interacción por pantalla.**
- Las informativas (`accordion`, `tabs`, `flip_cards`, `video`, `case_practice`)
  llevan `scored: false`.
- Las evaluables llevan respuesta correcta + `feedback` (acierto/error) +
  `explanation`. Siempre `learning_objective` y `source_refs`.
- No abuses de `single_choice`: si puedes pedir **clasificar, ordenar o decidir**,
  el aprendizaje es más profundo que reconocer una opción.

## De reflexión pasiva a actividad corregible
Convierte «reflexiona sobre…» en algo accionable siempre que puedas:
- ¿Hay una respuesta razonable y defendible? → `scenario_decision` con feedback.
- ¿Es debate humano sin respuesta única? → pantalla `reflection` o `forum_prompt`,
  y nota en `editor_notes` de que el foro va como actividad Moodle externa.
- ¿Respuesta abierta con criterios? → `case_practice` con `config.rubric`.

## Diseño de la autoevaluación (`assessments.final_test`)
- Solo `single_choice` o `true_false` (el test usa selección única).
- Prioriza **comprensión y aplicación** sobre memorización: pregunta por casos,
  consecuencias y decisiones, no por definiciones literales.
- Cada pregunta: respuesta correcta, `feedback` acierto/error, `explanation`,
  `learning_objective`, `points` y `source_refs`.
- Cubre los objetivos del tema: si un objetivo no tiene pregunta que lo mida, falta
  una pregunta.
- Distractores plausibles (errores típicos reales), no opciones absurdas de relleno.

## Accesibilidad (no negociable)
- Toda imagen con `alt` descriptivo (no «imagen» ni el nombre del fichero).
- Audio/vídeo con `transcript`; medios con voz (`has_voice:true`) con `tracks` VTT.
- No transmitas información solo por color; refuerza con texto.
- Feedback siempre textual.

## Trazabilidad y rigor
- `source_refs` en pantallas, interacciones, preguntas, glosario.
- No inventes normativa ni datos. Lo derivado del documento se marca con `transform`
  (`resumen`, `reescritura`…).
- Nada de afirmaciones de homologación SEPE: «preparado para revisión por la entidad».

## Errores frecuentes a evitar (antipatrones)
- `screens` en la raíz → SIEMPRE en `modules[].units[].screens[]`.
- Inventar claves (`metadata`, `risks`, `compliance`…) → solo las del contrato.
- `quality_checklist` como array → es **objeto** de booleanos.
- `bibliography` con `reference` → la clave es **`ref`**.
- Usar `retries` pensando en intentos del editor: el contrato usa `retries`
  (`0` = ilimitados); no mezcles con otros nombres.
- Tipos inexistentes: `match_to_category`/`classify` → `classification`;
  `decision` → `scenario_decision`; `reflection_note` → `case_practice` o pantalla
  `reflection`; `*_acknowledgement` → omitir.
- Notas internas («este SCO», «esta pantalla») dentro de `student_text`/`transcript`.
- Dejar un `visual_resource.src` apuntando a una imagen que **no** está en el ZIP.
- **Fallos de análisis estructural** (frecuentes, evítalos):
  - Pantalla **vacía**: solo un título/encabezado sin cuerpo. Toda pantalla lleva
    contenido real.
  - **Aislar un encabezado** en su propia pantalla y el cuerpo en otra: van juntos.
  - **Partir título + subtítulo + contenido en 3 pantallas**: son **una** pantalla.
  - **`title` = fragmento del texto** (mitad de frase) o repetido como primera línea
    del `student_text`: el `title` es un rótulo corto y el cuerpo NO lo repite.
  - **Partir una interacción en dos pantallas** (un accordion/tabs «(1)»/«(2)»): una
    interacción va entera en una pantalla, con todos sus ítems.
  - **Partir una actividad/reflexión/caso** (`case_practice`, `reflection`,
    `forum_prompt`) en varias pantallas: la actividad completa (tareas + cómo
    realizarla + preguntas) es **una sola** pantalla, aunque sea larga.
