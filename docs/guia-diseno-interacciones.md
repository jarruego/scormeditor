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
2. **Segméntalo en bloques de contenido SUSTANCIALES**, en orden. Una pantalla = un
   **apartado o idea con su desarrollo completo** (varios párrafos, su lista, su
   ejemplo), NO una frase suelta. Un **encabezado va SIEMPRE junto al texto que
   introduce** (título + subtítulo + cuerpo = una pantalla, no tres). Referencia de
   densidad: apunta a **pantallas de varios párrafos** (del orden de ~250-400
   caracteres de media, como mínimo); **evita micro-diapositivas** (una frase). Salen
   las pantallas que el contenido pida (típico: **1-2 por epígrafe**), no el doble.
   - **Nunca una pantalla diminuta ni vacía** (una frase, o solo un título). Si un
     encabezado o un fragmento no da para pantalla propia, **únelo** al contenido
     contiguo.
   - **Nunca partas un título/subtítulo de su contenido** en pantallas distintas.
3. Para presentar contenido **denso o estructurado** (listas, sub-apartados, bloques
   paralelos), **usa una interactividad informativa** (accordion/tabs/flip_cards): así
   la pantalla queda rica sin ser un muro de texto **y sin trocear de más**. Preferir
   esto a partir el mismo contenido en muchas pantallas pequeñas.
4. Cada pantalla lleva su trozo del texto **casi literal**, **visible** en
   `student_text` y/o dentro de una interactividad informativa, y **además duplicado
   íntegro en `transcript`**. Nada de contenido queda solo en `transcript`.

**Objetivo cuantitativo de control:** la suma del texto conservado por tema (visible +
`transcript`, sin contar el duplicado) debe **cubrir ~100%** de la prosa de origen de
ese tema (**mínimo ≥ 0.95**, ideal ≈ 1.0; puede pasar de 1.0 por las frases puente). Si
sale por debajo, **estás resumiendo**: recupera lo omitido. **Ojo**: cubrir el 100% NO
significa muchas pantallas diminutas — se logra con pantallas **sustanciales** y con
interactividades **informativas que contienen** el texto. Menos pantallas y más densas
> muchas micro-pantallas.

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
- **Numeración de epígrafes: todo o nada (coherencia).** Si el documento numera los
  apartados (`3.1`, `3.2`…), **decídelo una vez para toda la unidad**: o **conservas la
  numeración en TODOS** los `title` o la **quitas en TODOS**. Nunca mezcles (unos con
  `3.1` y otros sin número, o saltar de `3.1` a `3.8`). **Por defecto, quítala**: el
  `title` es un rótulo corto y limpio (`"Evaluación y ajuste"`, no `"3.8 Evaluación y
  ajuste"`); el orden ya lo da la secuencia de pantallas.
- **Nunca titules una interacción `"Checkpoint"`, `"Checkpoint de…"`, `"Actividad"` ni
  similar.** El `title` de una pantalla con interacción es **el del tema que se trabaja**
  (`"Áreas clave"`, `"Formatos de recogida"`), igual que una de contenido. La app añade
  **automáticamente** una etiqueta con el tipo de ejercicio (Actividad/Interactivo:
  «Elige la opción correcta», «Ordena los pasos»…), así que **no** hace falta anunciarlo
  en el título.

### Posición de la imagen según su proporción (`visual_resource.layout`)
Coloca cada imagen según su forma, para que el texto respire (SCORMEditor ya lo
soporta; al extraer del PDF conoces `width`/`height`, calcula el ratio):
- **Apaisada** (ancho > alto, ratio ≳ 1.2) → `"layout": "top"` (o `"bottom"`): encima o
  debajo del texto, a lo ancho.
- **Cuadrada o vertical** (alto ≥ ancho) → `"layout": "right"` con `"media_width": "50"`
  (o `"33"` si es muy vertical): la imagen al lado y el texto a su izquierda.
Recuerda (regla estructural): una pantalla con imagen es de **desarrollo**; no metas
además una interacción evaluable en ella.

### Presentar el texto de forma amena (interactividades informativas)
**Úsalas de forma habitual** para el contenido denso o estructurado: son la forma de
tener pantallas ricas sin muros de texto ni trocear de más. Meten el texto fuente en un
formato ameno (**lo contienen**, no lo resumen). Un tema suele llevar **varias** (de
referencia, el resultado que buscamos tenía ~6 informativas + ~15 aplicadas en la
unidad). **No las elimines convirtiéndolas en pantallas de texto pequeñas.** Cuándo:
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
No en cada pantalla, pero **sí con frecuencia**. Usa:
- **Informativas** (accordion/tabs/flip_cards) para el contenido denso/estructurado
  (habituales; **no las suprimas** en favor de micro-pantallas de texto).
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

## Principio rector: una idea por pantalla (una idea, no una frase)
Cada pantalla desarrolla **una idea/apartado completo** (varios párrafos, su lista, su
ejemplo). Divide una pantalla **solo** cuando mezcle **dos ideas distintas** o el
cuerpo sea **realmente largo** (más de lo que se lee cómodo de una vez). **No** dividas
por dividir: un apartado corto pero completo es **una** pantalla, no tres frases en
tres pantallas. Si un apartado es denso o va en lista, preséntalo con una interactividad
informativa antes que trocearlo.

**Un sub-epígrafe con texto suficiente = su propia pantalla.** No metas **dos
sub-apartados numerados** distintos (p. ej. `3.8` y `3.9`) en una misma pantalla si cada
uno tiene desarrollo propio: cada uno va en su diapositiva. Solo se agrupan si son muy
breves y comparten idea.

**No juntes texto + imagen + interacción en una misma pantalla.** Cuando un apartado
tenga contenido sustancial **con imagen** *y además* pida una interacción, **sepáralo en
dos pantallas**: (1) el desarrollo con su `visual_resource` (texto + imagen) y (2) la
interacción (misma temática, sin repetir la imagen). Una pantalla con texto largo,
imagen y actividad a la vez queda saturada y obliga al alumno a hacer scroll. La
interacción puede llevar un `prompt` breve que la contextualice. (Sí es correcto que una
interacción **informativa** —accordion/tabs/flip_cards— sea el cuerpo de la pantalla sin
imagen aparte.)

Ritmo recomendado por tema: portada → objetivos → ruta → pantallas de desarrollo
**sustanciales** (intercalando informativas y checkpoints) → casos → resumen →
autoevaluación → glosario/bibliografía (en sus arrays raíz). Las pantallas las manda el
contenido, pero **densas**: como referencia, el resultado buscado tenía ~80 pantallas
en una unidad, no ~160.

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
  - **Micro-diapositivas**: trocear en pantallas de una frase. Cada pantalla es un
    apartado con su desarrollo (varios párrafos); menos pantallas y más densas.
  - **Eliminar interactividades informativas** convirtiendo un accordion/tabs en varias
    pantallas de texto pequeñas: al revés, **unifica** el contenido denso EN un
    accordion/tabs.
  - Pantalla **vacía o diminuta**: solo un título, o una frase suelta.
  - **Aislar un encabezado** en su propia pantalla y el cuerpo en otra: van juntos.
  - **Partir título + subtítulo + contenido en 3 pantallas**: son **una** pantalla.
  - **`title` = fragmento del texto** (mitad de frase) o repetido como primera línea
    del `student_text`: el `title` es un rótulo corto y el cuerpo NO lo repite.
  - **Partir una interacción en dos pantallas** (un accordion/tabs «(1)»/«(2)»): una
    interacción va entera en una pantalla, con todos sus ítems.
  - **Partir una actividad/reflexión/caso** (`case_practice`, `reflection`,
    `forum_prompt`) en varias pantallas: la actividad completa (tareas + cómo
    realizarla + preguntas) es **una sola** pantalla, aunque sea larga.
  - **Titular una interacción `"Checkpoint…"`** (o `"Actividad"`): el `title` es el del
    tema; la app ya rotula el tipo de ejercicio.
  - **Numeración de epígrafes inconsistente** en los `title` (unos con `3.1`, otros sin
    número, saltos como `3.1`→`3.8`): o en todos o en ninguno (por defecto, en ninguno).
  - **Texto + imagen + interacción en la misma pantalla**: separa el desarrollo con
    imagen (una pantalla) de la interacción (otra).
  - **Dos sub-epígrafes con desarrollo (`3.8` y `3.9`) en una sola pantalla**: uno por
    pantalla.
