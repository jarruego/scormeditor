# Guía de diseño instruccional e interacciones (SCORMEditor)

Complemento pedagógico de `contrato-course-json.md` (la referencia estructural) y de
`ejemplo-course-json.md` (la forma exacta). Aquí va el **criterio**: cómo trocear el
contenido, qué interacción elegir y cómo evaluar. Ante conflicto, **manda el
contrato**.

## Principio rector: una idea por pantalla
Si una pantalla necesita dos párrafos largos de `student_text` o un `transcript` que
explica dos conceptos distintos, **divídela**. Señales de que hay que trocear:
- El `transcript` cambia de tema a mitad.
- Hay más de una pregunta posible sobre la pantalla.
- El `student_text` supera ~5–6 líneas visibles.

Ritmo recomendado por tema: portada → objetivos → ruta → 4–8 pantallas de desarrollo
(intercalando informativas y evaluables) → casos → resumen → autoevaluación →
glosario/bibliografía (van en sus arrays raíz, no como pantallas).

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
