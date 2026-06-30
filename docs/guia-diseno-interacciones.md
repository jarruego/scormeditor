# Guía de diseño instruccional e interacciones (SCORMEditor)

Complemento pedagógico de `contrato-course-json.md` (la referencia estructural) y de
`ejemplo-course-json.md` (la forma exacta). Aquí va el **criterio**: cómo trocear el
contenido, qué interacción elegir y cómo evaluar. Ante conflicto, **manda el
contrato**.

## Regla nº 1: disección sin pérdida de contenido (NO resumir)
El error más grave y más frecuente es **resumir**: quedarse con la idea general y
tirar frases, ejemplos, datos, definiciones, matices o ítems de lista. **No se hace
eso.** El curso debe contener **todo** el contenido del documento; lo que cambia es la
*presentación* (troceada en pantallas cortas + interacción), no la *cantidad* de
información.

**Método obligatorio (con Code Interpreter):**
1. **Extrae el texto** de la unidad del PDF/DOC (no trabajes de memoria ni «de un
   vistazo»: trabaja sobre el texto real extraído).
2. **Segméntalo por epígrafes/ideas** en orden. Cada segmento → **una pantalla**.
3. Para cada pantalla: `transcript` = ese segmento **reescrito para e-learning**
   (más claro, mejor hilado) **conservando todo**: cada concepto, ejemplo, dato,
   cifra, definición y elemento de lista del origen. `student_text` = la versión
   breve y visual de esa misma idea (titulares, viñetas, un callout si procede).
4. Si un segmento es muy largo o mezcla ideas, **pártelo en más pantallas**; nunca lo
   comprimas para que «quepa».

**Objetivo cuantitativo de control:** la suma de los `transcript` de un tema debe ser
**del mismo orden que la prosa de origen de ese tema** (orientativo: ≥ 80 %). Si tu
salida es mucho más corta que el documento, **estás resumiendo**: añade pantallas. Un
tema denso puede necesitar 12–20+ pantallas; eso es correcto, no un problema.

**Marca el control** en `quality_checklist`:
`"Contenido del documento trazado sin pérdidas": true`.

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
Los documentos suelen traer ya «cajas» o frases con intención de aviso, consejo,
dato curioso, caso o reflexión. **Reconócelas y vuélcalas como callout** en
`student_text` (sintaxis `::: tipo … :::`, ver §4.1 del contrato), para que lleguen
ya formateadas a SCORMEditor en vez de como texto plano. Heurística de mapeo:

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
Cada pantalla de desarrollo debería tener su práctica. Criterio rápido:

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
