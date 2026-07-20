# Ejemplo dorado de `course.json` (SCORMEditor)

Ejemplo **completo y válido** que cumple `contrato-course-json.md`. Úsalo como
plantilla de la **forma exacta** (claves, anidación, shape de cada interacción).
**No copies el contenido**, solo la estructura. El `course.json` final va dentro del
`.scormproj` (ver §11 del contrato); las imágenes referenciadas (`assets/img/…`)
deben existir como ficheros reales en el ZIP.

Fíjate en los **objetivos**: son un conjunto pequeño y su texto se repite **idéntico**
allí donde aparece (en `objective` de las pantallas que lo desarrollan y en el
`learning_objective` de las preguntas del test; la interacción de una pantalla no
lleva objetivo propio, evalúa el `objective` de esa pantalla). En un curso real, varias
pantallas de desarrollo compartirán el mismo `objective`.

```json
{
  "schema_version": "1.0.0",
  "course": {
    "id": "ejemplo-u01-t01",
    "title": "Tema 1. Atención centrada en la persona",
    "subtitle": "SCO independiente del Tema 1",
    "description": "Tema introductorio. Material preparado para revisión por la entidad.",
    "authoring_entity": "MECOHISA S.L.",
    "source_document": "Curso ACP T.1.pdf",
    "estimated_hours": 0.75,
    "language": "es"
  },
  "scorm": {
    "version": "1.2",
    "identifier": "EJEMPLO_U01_T01",
    "title": "Tema 1 - ACP",
    "mastery_score": 70,
    "rules": {
      "min_required_screens_pct": 100,
      "require_interactions": true,
      "min_score": 70,
      "attempts_allowed": 2,
      "score_source": "mixed",
      "mixed_final_weight": 70,
      "navigation": "mixed",
      "allow_resume": true
    }
  },
  "shell": {
    "brand": "",
    "primary_color": "#0b5fff",
    "show_sidebar": true,
    "show_progress": true,
    "language": "es"
  },
  "modules": [
    {
      "id": "m1",
      "title": "Unidad 1 - Fundamentos de la atención centrada en la persona",
      "units": [
        {
          "id": "u1",
          "title": "Tema 1. Atención centrada en la persona",
          "summary": "Qué es la ACP, sus principios y cómo se traduce en la práctica diaria.",
          "status": "ok",
          "screens": [
            {
              "id": "s01",
              "type": "cover",
              "title": "Tema 1. Atención centrada en la persona",
              "required": true,
              "status": "ok"
            },
            {
              "id": "s02",
              "type": "objectives",
              "title": "Objetivos del tema",
              "objective": "Definir la atención centrada en la persona.",
              "student_text": "Al terminar serás capaz de:\n- Definir la atención centrada en la persona (ACP).\n- Reconocer sus principios.\n- Aplicarlos a una situación práctica.",
              "required": true,
              "status": "ok"
            },
            {
              "id": "s03",
              "type": "route",
              "title": "Cómo vamos a trabajar",
              "objective": "Definir la atención centrada en la persona.",
              "student_text": "Recorreremos la definición, los principios y un caso práctico, y cerraremos con una autoevaluación.",
              "required": true,
              "status": "ok"
            },
            {
              "id": "s04",
              "type": "content",
              "title": "¿Qué es la ACP?",
              "objective": "Definir la atención centrada en la persona.",
              "student_text": "La **atención centrada en la persona** organiza los apoyos a partir de las preferencias, valores y proyecto de vida de cada persona, no de la rutina del servicio.",
              "source_refs": [
                { "doc": "Curso ACP T.1.pdf", "locator": "p.5" }
              ],
              "visual_resource": {
                "kind": "image",
                "src": "assets/img/u01_t01_modelo_acp.png",
                "alt": "Diagrama con la persona en el centro rodeada de sus apoyos.",
                "caption": "",
                "poster": "",
                "tracks": [],
                "has_voice": false
              },
              "required": true,
              "min_time_seconds": 0,
              "transcript": "La atención centrada en la persona es un enfoque que organiza los apoyos partiendo de la persona: sus preferencias, valores, historia y proyecto de vida. Frente a modelos centrados en el servicio, la ACP adapta el apoyo a la persona y no al revés.",
              "accessibility": { "alt_text_ok": true, "keyboard_ok": true, "contrast_ok": true },
              "scorm": { "counts_for_completion": true },
              "editor_notes": [],
              "status": "ok"
            },
            {
              "id": "s05",
              "type": "content",
              "title": "¿Qué es la ACP?",
              "objective": "Definir la atención centrada en la persona.",
              "student_text": "Comprueba que la idea clave ha quedado clara.",
              "interaction": {
                "id": "s05_i01",
                "type": "single_choice",
                "prompt": "¿Qué pone la ACP en el centro de la organización de los apoyos?",
                "instructions": "Elige la opción correcta.",
                "options": [
                  { "id": "a", "text": "La rutina del servicio.", "correct": false, "feedback": "La rutina es del servicio, no de la persona." },
                  { "id": "b", "text": "Las preferencias y el proyecto de vida de la persona.", "correct": true, "feedback": "Correcto: ese es el eje de la ACP." }
                ],
                "config": {},
                "feedback": { "correct": "Correcto: la ACP organiza los apoyos desde la persona, no desde la rutina del servicio.", "incorrect": "Revisa la definición de ACP.", "explanation": "La ACP parte de la persona, no del servicio." },
                "scored": true,
                "points": 1,
                "retries": 2,
                "source_refs": [ { "doc": "Curso ACP T.1.pdf", "locator": "p.5" } ]
              },
              "required": true,
              "min_time_seconds": 0,
              "accessibility": { "alt_text_ok": true, "keyboard_ok": true, "contrast_ok": true },
              "scorm": { "counts_for_completion": true },
              "status": "ok"
            },
            {
              "id": "s06",
              "type": "content",
              "title": "Principios de la ACP",
              "objective": "Reconocer los principios de la ACP.",
              "student_text": "Despliega cada principio para conocerlo.",
              "interaction": {
                "id": "s06_i01",
                "type": "accordion",
                "prompt": "Principios de la ACP",
                "instructions": "Despliega cada apartado.",
                "options": [],
                "config": { "items": [
                  { "title": "Autonomía", "body": "La persona decide sobre su vida en la medida de sus capacidades." },
                  { "title": "Individualización", "body": "Cada apoyo se ajusta a la persona concreta." },
                  { "title": "Participación", "body": "La persona y su entorno participan en las decisiones." }
                ] },
                "feedback": { "correct": "", "incorrect": "", "explanation": "" },
                "scored": false,
                "points": 0,
                "retries": 0,
                "source_refs": [ { "doc": "Curso ACP T.1.pdf", "locator": "p.7" } ]
              },
              "required": true,
              "transcript": "Los principios fundamentales de la ACP son la autonomía, la individualización y la participación. La autonomía implica respetar las decisiones de la persona; la individualización, ajustar cada apoyo; la participación, incluir a la persona y su entorno en las decisiones.",
              "accessibility": { "alt_text_ok": true, "keyboard_ok": true, "contrast_ok": true },
              "scorm": { "counts_for_completion": true },
              "status": "ok"
            },
            {
              "id": "s07",
              "type": "content",
              "title": "Caso práctico: el horario de la ducha",
              "objective": "Aplicar la ACP a una decisión cotidiana.",
              "student_text": "Lee la situación y decide la respuesta más coherente con la ACP.",
              "interaction": {
                "id": "s07_i01",
                "type": "scenario_decision",
                "prompt": "¿Qué harías?",
                "instructions": "Elige la opción más adecuada.",
                "config": { "scenario": "Una persona prefiere ducharse por la tarde, pero el horario del centro fija la ducha por la mañana." },
                "options": [
                  { "id": "a", "text": "Mantener la rutina del centro.", "correct": false, "feedback": "Eso prioriza el servicio sobre la persona." },
                  { "id": "b", "text": "Ajustar el horario del apoyo a su preferencia.", "correct": true, "feedback": "Correcto: el apoyo se adapta a la persona." }
                ],
                "feedback": { "correct": "Bien razonado.", "incorrect": "Recuerda el principio de individualización.", "explanation": "La ACP adapta el apoyo a la preferencia de la persona siempre que sea viable." },
                "scored": true,
                "points": 1,
                "retries": 2,
                "source_refs": [ { "doc": "Curso ACP T.1.pdf", "locator": "p.9" } ]
              },
              "required": true,
              "transcript": "Ante un conflicto entre la rutina del servicio y la preferencia de la persona, la ACP busca soluciones que respeten la preferencia siempre que sean viables y seguras.",
              "accessibility": { "alt_text_ok": true, "keyboard_ok": true, "contrast_ok": true },
              "scorm": { "counts_for_completion": true },
              "status": "ok"
            },
            {
              "id": "s08",
              "type": "content",
              "title": "Repasa lo aprendido",
              "objective": "Reconocer los principios de la ACP.",
              "student_text": "Antes de terminar, repasa las ideas clave del tema.",
              "interaction": {
                "id": "s08_i01",
                "type": "flashcards",
                "prompt": "Tarjetas de repaso",
                "instructions": "Lee cada tarjeta, muestra la respuesta y marca si la sabías.",
                "options": [],
                "config": { "cards": [
                  { "front": "¿Qué pone la ACP en el centro?", "back": "Las preferencias, valores y proyecto de vida de la persona." },
                  { "front": "Principio de autonomía", "back": "La persona decide sobre su vida en la medida de sus capacidades." },
                  { "front": "Principio de individualización", "back": "Cada apoyo se ajusta a la persona concreta." }
                ] },
                "feedback": { "correct": "", "incorrect": "", "explanation": "" },
                "scored": false,
                "points": 0,
                "retries": 0,
                "source_refs": [ { "doc": "Curso ACP T.1.pdf", "locator": "p.5-9" } ]
              },
              "required": true,
              "status": "ok"
            },
            {
              "id": "s09",
              "type": "content",
              "title": "Sopa de letras del tema",
              "objective": "Reconocer los principios de la ACP.",
              "student_text": "Encuentra los conceptos clave del tema.",
              "interaction": {
                "id": "s09_i01",
                "type": "word_search",
                "prompt": "Conceptos de la ACP",
                "instructions": "Toca la primera y la última letra de cada palabra.",
                "options": [],
                "config": { "words": ["PERSONA", "AUTONOMIA", "APOYOS", "PARTICIPAR"] },
                "feedback": { "correct": "", "incorrect": "", "explanation": "" },
                "scored": false,
                "points": 0,
                "retries": 0,
                "source_refs": [ { "doc": "Curso ACP T.1.pdf", "locator": "p.5-9" } ]
              },
              "required": true,
              "status": "ok"
            },
            {
              "id": "s10",
              "type": "summary",
              "title": "Resumen del tema",
              "student_text": "La ACP organiza los apoyos desde la persona. Sus principios son autonomía, individualización y participación, y se aplican a las decisiones cotidianas.",
              "required": true,
              "status": "ok"
            }
          ]
        }
      ]
    }
  ],
  "assessments": {
    "unit_tests": [],
    "final_test": {
      "id": "A01",
      "unit_id": "u1",
      "title": "Autoevaluación del Tema 1",
      "pass_score": 70,
      "questions": [
        {
          "id": "Q01",
          "prompt": "La atención centrada en la persona organiza los apoyos a partir de:",
          "type": "single_choice",
          "options": [
            { "id": "a", "text": "La rutina del servicio.", "correct": false },
            { "id": "b", "text": "Las preferencias y el proyecto de vida de la persona.", "correct": true }
          ],
          "feedback": { "correct": "Correcto.", "incorrect": "Revisa la definición.", "explanation": "La ACP parte de la persona." },
          "points": 1,
          "learning_objective": "Definir la atención centrada en la persona.",
          "source_refs": [ { "doc": "Curso ACP T.1.pdf", "locator": "p.5" } ]
        },
        {
          "id": "Q02",
          "prompt": "La individualización significa que cada apoyo se ajusta a la persona concreta.",
          "type": "true_false",
          "options": [
            { "id": "v", "text": "Verdadero", "correct": true },
            { "id": "f", "text": "Falso", "correct": false }
          ],
          "feedback": { "correct": "Correcto.", "incorrect": "Repasa los principios.", "explanation": "La individualización ajusta el apoyo a cada persona." },
          "points": 1,
          "learning_objective": "Reconocer los principios de la ACP.",
          "source_refs": [ { "doc": "Curso ACP T.1.pdf", "locator": "p.7" } ]
        }
      ]
    }
  },
  "glossary": [
    { "term": "Atención centrada en la persona", "definition": "Enfoque que organiza los apoyos desde las preferencias y el proyecto de vida de la persona.", "source_refs": [ { "doc": "Curso ACP T.1.pdf", "locator": "p.5" } ] }
  ],
  "bibliography": [
    { "ref": "Rodríguez, P. (2013). La atención integral y centrada en la persona.", "url": "" }
  ],
  "quality_checklist": {
    "Objetivo del tema definido": true,
    "Contenido trazado a fuente": true,
    "Imágenes con texto alternativo": true,
    "Autoevaluación con feedback": true
  }
}
```

## Notas de uso
- Una unidad real suele tener **más pantallas de desarrollo** e interacciones
  variadas: alterna las informativas (`accordion`/`tabs`/`flip_cards`/`timeline`) y
  **todo el repertorio evaluable** (`single_choice`, `true_false`, `fill_blanks`,
  `match_pairs`, `classification`, `sort_steps`, `scenario_decision`,
  `case_practice`) sin repetir tipo dos veces seguidas.
- Fíjate en **s04→s05**: la teoría (con su imagen) y la pregunta van en pantallas
  **separadas** con el mismo `title`. Una evaluable nunca comparte pantalla con
  teoría.
- Fíjate en el **cierre del tema (s08–s09)**: `flashcards` + una lúdica con
  `scored: false`. La lúdica **alterna entre temas**: `word_search`, `crossword`,
  `az_quiz`.
- **Nota (`score_source: "mixed"`)**: como los checkpoints van `scored: true`
  (s05, s07), la nota es **mixta** (`mixed_final_weight: 70` → 70 % test final,
  30 % práctica). Si dejaras `score_source: "final_test"` con checkpoints
  evaluables, el editor avisaría (`SCORM_ACTIVITIES_IGNORED`): esos checkpoints
  no contarían. Elige `mixed` cuando la práctica puntúe, `final_test` solo si los
  checkpoints van `scored: false`.
- **Marca (`shell.brand: ""`)**: vacía por defecto (la cabecera muestra solo el
  título). `authoring_entity` sí lleva la entidad (MECOHISA S.L.) porque es
  metadato de autoría, no la marca visible. Rellena `brand` solo si se pide.
- **No generes** `hotspots`, `before_after`, `hidden_image`, `puzzle`, `video`
  (vídeo interactivo) ni `html_embed`: los añade el editor humano desde SCORMEditor.
- Mantén **una sola interacción por pantalla**; no le añadas `learning_objective`, ese
  campo solo existe en las preguntas de test.
- Si una pantalla referencia una imagen pero no tienes el binario, pon
  `visual_resource.kind = "none"` y anótalo en `editor_notes`.
- Para las formas concretas de `sort_steps`, `classification`, `match_pairs`,
  `flip_cards`, `tabs`, `word_search`, `crossword` y `az_quiz`, consulta §6 del
  contrato.
