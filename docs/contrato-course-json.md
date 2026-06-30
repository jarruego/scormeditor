# Contrato de salida `course.json` (SCORMEditor)

Instrucciones para la herramienta/GPT que genera el JSON a partir del documento.
**La salida debe ser exclusivamente un objeto JSON válido** (UTF-8, sin comentarios,
sin texto antes/después, sin ```fences```). Todo `id` debe ser único y estable.

---

## 1. Estructura raíz (claves EXACTAS)

```json
{
  "schema_version": "1.0.0",
  "course": { ... },
  "scorm": { ... },
  "shell": { ... },
  "modules": [ ... ],
  "assessments": { "unit_tests": [], "final_test": null },
  "glossary": [ ... ],
  "bibliography": [ ... ],
  "quality_checklist": { }
}
```

Reglas que NO se pueden romper:

- `schema_version` debe ser **`"1.0.0"`**.
- El contenido va en **`modules[].units[].screens[]`** (jerarquía de 3 niveles).
  **No se admite un array `screens` en la raíz.**
- `quality_checklist` es un **objeto** `{"texto del criterio": true|false}`,
  **no** un array.
- Cualquier clave extra que no esté en este contrato se ignora (no rompe, pero se
  pierde). No metas `parent_course`, `learning_design`, `generation_context`, etc.:
  su información útil debe volcarse en los campos que sí existen (ver §2).

---

## 2. `course`, `scorm`, `shell`

```json
"course": {
  "id": "pai-u01-t01",
  "title": "Tema 1. Definición y propósito del Plan de Apoyos Integrado",
  "subtitle": "",
  "description": "Resumen breve del tema.",
  "authoring_entity": "Nombre de la entidad",
  "source_document": "Curso PAI T.1-4.pdf",
  "estimated_hours": 0.75,
  "language": "es"
}
```

```json
"scorm": {
  "version": "1.2",
  "identifier": "PAI_U01_T01",
  "title": "Tema 1 - PAI",
  "mastery_score": 70,
  "rules": {
    "min_required_screens_pct": 100,
    "require_interactions": true,
    "min_score": 70,
    "attempts_allowed": 2,
    "score_source": "final_test",
    "navigation": "mixed",
    "allow_resume": true
  }
}
```

- `score_source`: `"final_test"` | `"unit_tests"` | `"mixed"` (por defecto
  `"mixed"`: la nota sale de todas las interacciones evaluables + el test final).
- `navigation`: `"free"` | `"sequential"` | `"mixed"` (usa el nombre en inglés).
- `attempts_allowed`: `0` = ilimitados.

```json
"shell": {
  "brand": "Nombre formación",
  "primary_color": "#0b5fff",
  "show_sidebar": true,
  "show_progress": true,
  "language": "es"
}
```

---

## 3. `modules` → `units` → `screens`

```json
"modules": [
  {
    "id": "m1",
    "title": "Unidad 1 - ¿Qué es un Plan de Apoyos Integrado?",
    "units": [
      {
        "id": "u1",
        "title": "Tema 1. Definición y propósito",
        "summary": "Texto de resumen de la unidad (o incluir una pantalla type=summary).",
        "status": "ok",
        "screens": [ /* ver §4 */ ]
      }
    ]
  }
]
```

- `status`: `"ok"` | `"esqueleto_pendiente_desarrollo"`.
- Cada unidad **debe** tener `summary` (o una pantalla `summary`) y **al menos una
  actividad o test**, o el validador avisará.

---

## 4. Pantalla (`screen`)

```json
{
  "id": "s06",
  "type": "content",
  "title": "Definición del Plan de Apoyos Integrado",
  "objective": "Definir el Plan de Apoyos Integrado.",
  "student_text": "Texto para el estudiante. Admite markdown ligero:\n- viñetas con guion\n- **negrita** y *cursiva*.",
  "source_refs": [
    { "doc": "Curso PAI T.1-4.pdf", "locator": "p.8", "transform": "resumen" }
  ],
  "visual_resource": { /* ver §5 */ },
  "interaction": null,
  "required": true,
  "min_time_seconds": 25,
  "audio_src": "",
  "transcript": "",
  "accessibility": { "alt_text_ok": true, "keyboard_ok": true, "contrast_ok": true },
  "scorm": { "counts_for_completion": true },
  "editor_notes": [],
  "status": "ok"
}
```

- `type` (enum cerrado): `cover`, `objectives`, `route`, `content`, `summary`,
  `video`, `reflection`, `forum_prompt`, `unit_quiz`, `content_placeholder`.
- `objective`: texto libre (NO `objective_id`). Si tu herramienta maneja
  micro‑objetivos por id, **vuelca aquí el texto del objetivo**.
- `min_time_seconds`: control de permanencia mínima (no antifraude duro).
- `interaction`: un objeto (ver §6) **o `null`**. Máximo **una interacción por
  pantalla**.
- `audio_src`: ruta del **audio de locución** de la diapositiva
  (`assets/media/…`), opcional. Se reproduce arriba del contenido.
- `transcript`: transcripción de la diapositiva. **Se muestra SOLO en el botón
  «Transcripción»** (nunca dentro del contenido) y es la alternativa textual del
  audio/vídeo. Si rellenas `audio_src`, **`transcript` es obligatorio**.
- `source_refs[]` (trazabilidad, recomendado en cada pantalla):
  `{ "doc": "...", "locator": "p.8" , "quote": "...", "transform": "resumen|reescritura|..." }`
  (solo `doc` es obligatorio).

---

## 5. `visual_resource`

```json
"visual_resource": {
  "kind": "image",
  "src": "assets/img/u01_t01_modelo_pai.png",
  "alt": "Descripción accesible de la imagen.",
  "caption": "",
  "poster": "",
  "tracks": [],
  "has_voice": false,
  "layout": "top",
  "media_width": "50"
}
```

- `kind`: `"none"` | `"image"` | `"video_youtube"` | `"video_file"` | `"audio"`.
- `layout`: posición del recurso respecto al texto en pantallas de contenido:
  `"top"` (arriba, por defecto) | `"bottom"` (debajo) | `"left"` (izquierda) |
  `"right"` (derecha). No aplica a `audio`.
- `media_width`: ancho del recurso en disposiciones laterales `left`/`right`:
  `"33"` | `"50"` (por defecto) | `"66"` (% del ancho; el texto ocupa el resto).
- Si `kind="image"` → `alt` **obligatorio y no vacío**.
- Si `kind="video_youtube"` → `src` = **ID de YouTube** (no la URL completa).
- Si `kind="video_file"`/`"audio"` y hay voz → `has_voice: true` **y** `tracks` con
  subtítulos VTT:
  ```json
  "tracks": [
    { "lang": "es", "label": "Español", "src": "assets/media/clip.es.vtt", "kind": "subtitles" }
  ]
  ```
- Todo vídeo/audio debe llevar además `transcript` en la pantalla (§4).

---

## 6. Interacción (`interaction`)

Estructura común a TODAS:

```json
{
  "id": "s05_i01",
  "type": "single_choice",
  "prompt": "Enunciado claro.",
  "instructions": "Instrucción breve de qué hacer.",
  "options": [],
  "config": {},
  "feedback": { "correct": "Texto de acierto.", "incorrect": "Texto de error.", "explanation": "Explicación pedagógica." },
  "scored": true,
  "points": 1,
  "attempts": 1,
  "learning_objective": "Texto del objetivo vinculado.",
  "source_refs": []
}
```

- `type` (enum cerrado): `accordion`, `tabs`, `flip_cards`, `match_pairs`,
  `sort_steps`, `single_choice`, `true_false`, `classification`,
  `scenario_decision`, `case_practice`, `hotspots`, `video`.
- `attempts`: intentos permitidos para comprobar la respuesta. **`1` por
  defecto**, `0` = ilimitados, o un número N. El alumno pulsa el botón
  «Comprobar» para ver acierto/error; cuando la respuesta es correcta o se
  agotan los intentos, queda resuelta y puede avanzar igualmente. Aplica a
  `single_choice`, `true_false`, `sort_steps`, `match_pairs`, `classification`.
- `learning_objective`: rellénalo siempre (el validador lo pide).
- Reglas del validador para preguntas evaluables: deben tener **respuesta
  correcta** y **feedback** (acierto/error).

### Forma del `config` y `options` por tipo

> Cada tipo lee campos concretos. Respétalos o la interacción no se renderiza bien.

**`single_choice` / `true_false`** — usan `options` (sin `config`):
```json
"options": [
  { "id": "a", "text": "Opción A", "correct": false, "feedback": "..." },
  { "id": "b", "text": "Opción B", "correct": true,  "feedback": "..." }
]
```
Para `true_false` usa dos opciones (Verdadero/Falso) con `correct`.

**`classification` / `match_pairs`** — asignar cada elemento a un grupo/categoría.
`config.groups` define las categorías; cada `option` lleva su `group` correcto:
```json
"config": { "groups": [ { "id": "pu", "label": "Persona usuaria" }, { "id": "ep", "label": "Equipo profesional" } ] },
"options": [
  { "id": "o1", "text": "Expresa preferencias.", "group": "pu" },
  { "id": "o2", "text": "Propone opciones y facilita apoyos.", "group": "ep" }
]
```
> Para “emparejar” en 2 columnas, modela cada elemento de la columna derecha como
> un `group` y cada elemento de la izquierda como `option` con su `group`.

**`sort_steps`** — ordenar pasos. `config.steps` con `order` (1..n):
```json
"config": { "steps": [
  { "id": "p1", "text": "Primer paso", "order": 1 },
  { "id": "p2", "text": "Segundo paso", "order": 2 }
] }
```

**`scenario_decision`** — caso con decisión. `config.scenario` (texto) + `options`
con `correct` y `feedback` por opción:
```json
"config": { "scenario": "Una persona prefiere ducharse por la tarde..." },
"options": [
  { "id": "a", "text": "Mantener la rutina del centro.", "correct": false, "feedback": "..." },
  { "id": "b", "text": "Ajustar el horario del apoyo.", "correct": true,  "feedback": "..." }
]
```

**`accordion` / `tabs`** — informativas (no evalúan; `scored: false`).
`config.items` con `title` + `body`:
```json
"config": { "items": [ { "title": "Dar coherencia", "body": "Todo el equipo actúa..." } ] }
```

**`flip_cards`** — `config.cards` con `front` + `back`:
```json
"config": { "cards": [ { "front": "Concepto", "back": "Definición" } ] }
```

**`case_practice`** — respuesta abierta (no evaluable salvo rúbrica simple).
`config.rubric` opcional:
```json
"config": { "rubric": [ { "label": "Menciona la preferencia de la persona" } ] }, "scored": false
```

**`hotspots`** — zonas activas accesibles sobre una imagen:
```json
"config": {
  "image": "assets/img/escena.png",
  "alt": "Descripción de la escena.",
  "spots": [ { "id": "z1", "x": 30, "y": 40, "w": 10, "h": 10, "label": "Zona correcta", "correct": true, "feedback": "..." } ]
}
```
(`x,y,w,h` en % sobre la imagen.)

**`video`** (interacción con transcripción/subtítulos):
```json
"config": {
  "youtube": "VIDEOID",
  "transcript": "Transcripción completa del vídeo.",
  "tracks": [ { "kind": "subtitles", "src": "assets/media/v.es.vtt", "lang": "es", "label": "Español" } ]
}
```
(usa `"src": "assets/media/v.mp4"` en vez de `youtube` si es vídeo propio.)

> Tipos de tu GPT que NO existen aquí y su equivalencia:
> `match_to_category` → `classification`; `classify` → `classification`;
> `decision` → `scenario_decision`; `accordion_with_check` → `accordion`
> (informativo) **+** una `single_choice` aparte si quieres puntuarlo;
> `reflection_note`/`open_reflection` → `case_practice` o pantalla `reflection`;
> `checklist_acknowledgement`/`completion_acknowledgement` → **omitir** (la
> compleción la gestionan las reglas SCORM, no hace falta una interacción de
> “confirmo que terminé”).

---

## 7. Evaluación (`assessments`)

El **test calificable** va aquí, NO como interacción de una pantalla.
Si `scorm.rules.score_source = "final_test"`, **debe** existir `final_test` con
preguntas.

```json
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
        "prompt": "El Plan de Apoyos Integrado es principalmente:",
        "type": "single_choice",
        "options": [
          { "id": "a", "text": "Un documento administrativo.", "correct": false },
          { "id": "b", "text": "Un conjunto organizado de apoyos y decisiones.", "correct": true }
        ],
        "feedback": { "correct": "Correcto.", "incorrect": "Revisa la definición.", "explanation": "..." },
        "points": 1,
        "learning_objective": "Definir el Plan de Apoyos Integrado.",
        "source_refs": [ { "doc": "Curso PAI T.1-4.pdf", "locator": "p.8" } ]
      }
    ]
  }
}
```

- Pregunta `type`: usa **`"single_choice"`** o **`"true_false"`**. (El renderizador
  del test usa botones de opción única; `multiple_choice` se admite en el esquema
  pero se comportaría como selección única, evítalo de momento.)
- Para `true_false`, da dos opciones (`Verdadero`/`Falso`) con `correct`.

---

## 8. `glossary`, `bibliography`, `quality_checklist`

```json
"glossary": [
  { "term": "Plan de Apoyos Integrado", "definition": "Conjunto organizado de apoyos...", "source_refs": [ { "doc": "Curso PAI T.1-4.pdf", "locator": "p.8" } ] }
],
"bibliography": [
  { "ref": "Ley 8/2021, sobre el apoyo en la toma de decisiones.", "url": "" }
],
"quality_checklist": {
  "Objetivo del tema definido": true,
  "Contenido trazado a fuente": true,
  "Imágenes con texto alternativo": false
}
```

- `glossary[]`: `{ term, definition, source_refs[] }` (NO uses `id`/`source_ref`).
- `bibliography[]`: `{ ref, url? }` (el campo es **`ref`**, NO `reference`).
- `quality_checklist`: **objeto** `criterio → booleano`.

---

## 9. Reglas que el JSON debe cumplir para pasar el validador

1. Toda pantalla con `title` no vacío.
2. Pantallas `content`/`objectives`/`route` con `objective` (las `cover` y `summary`
   están exentas).
3. Toda imagen (`kind="image"`) con `alt`.
4. Todo vídeo con `transcript`; medios con voz (`has_voice:true`) con `tracks` VTT.
   Toda pantalla con `audio_src` debe tener `transcript`.
5. Toda pregunta evaluable con **respuesta correcta** y **feedback**.
6. Toda interacción con `learning_objective`.
7. Cada unidad con `summary` (o pantalla `summary`) y al menos una actividad/test.
8. `glossary` y `bibliography` no vacíos.
9. Si `score_source="final_test"` → `assessments.final_test` con preguntas.
10. `scorm.identifier` no vacío.

---

## 10. Checklist final para la herramienta antes de devolver el JSON

- [ ] Es un único objeto JSON válido (sin texto extra, sin fences).
- [ ] `schema_version` = `"1.0.0"`.
- [ ] Contenido en `modules[].units[].screens[]` (no array plano).
- [ ] `type` de pantalla e interacción dentro de los enums permitidos.
- [ ] Cada interacción usa el `config`/`options` correcto de su tipo (§6).
- [ ] Test calificable en `assessments.final_test`.
- [ ] `bibliography` usa `ref`; `quality_checklist` es objeto de booleanos.
- [ ] Sin afirmaciones de homologación SEPE; nota normativa como "pendiente de
      revisión por la entidad".
```
