# Contrato de salida `.scormproj` (SCORMEditor)

Instrucciones para la herramienta/GPT que genera el material a partir del documento.

**La salida es un archivo `.scormproj`** (un ZIP con `course.json` + `assets/`
dentro; ver §11) generado con Code Interpreter y entregado como enlace de descarga.
El `course.json` que va dentro debe ser un **objeto JSON válido** (UTF-8, sin
comentarios, sin texto antes/después, sin ```fences```) y cumplir TODO este
contrato. Todo `id` debe ser único y estable.

> Compatibilidad: si Code Interpreter no estuviera disponible, se admite como
> fallback devolver **solo** el `course.json` en texto plano (sin fences); el
> usuario lo empaquetaría a mano. El formato preferido es siempre `.scormproj`.

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

- `score_source`: `"final_test"` | `"unit_tests"` | `"mixed"`.
- `mixed_final_weight` (opcional, def. `70`): solo con `score_source:"mixed"`, peso (%)
  del test final en la nota; la práctica pesa el resto. Cada bloque se calcula sobre su
  propio total (no por suma de puntos). También editable en «Ajustes del curso».
- `navigation`: `"free"` | `"sequential"` | `"mixed"` (usa el nombre en inglés).
- `attempts_allowed`: `0` = ilimitados.

```json
"shell": {
  "brand": "Nombre formación",
  "primary_color": "#0b5fff",
  "show_sidebar": true,
  "show_progress": true,
  "language": "es",
  "motion": "subtle"
}
```

- `motion` (opcional; def. `"subtle"`): animaciones de la carcasa. `"none"` (sin),
  `"subtle"` (transiciones básicas) o `"rich"` (revelado progresivo del contenido
  al entrar/hacer scroll y microanimaciones). Es una preferencia de presentación:
  déjalo en `"subtle"` salvo que se pida otra cosa.

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
  "transcript": "",
  "accessibility": { "alt_text_ok": true, "keyboard_ok": true, "contrast_ok": true },
  "scorm": { "counts_for_completion": true },
  "editor_notes": [],
  "status": "ok"
}
```

- `type` (enum cerrado): `cover`, `objectives`, `route`, `content`, `summary`,
  `video`, `reflection`, `forum_prompt`, `unit_quiz`, `content_placeholder`.
- **`cover` = solo portada**: `title` + `subtitle` (y una imagen si procede), **sin
  contenido didáctico**. Los párrafos de introducción («En la unidad anterior vimos…»)
  van en la **primera pantalla `content`** del tema, nunca en la `cover`. En la `cover`
  **sí debe figurar el número del tema** («Tema 1», «Tema 2»…): ponlo en el `subtitle`
  o antepuesto al título («Tema 1. Herramientas…»), para que el alumno sepa dónde está.
- **Los ejercicios prácticos van en su propia pantalla.** `case_practice`, `reflection`
  y los callouts con tarea (`::: case`, `::: reflect` que proponen un ejercicio) **no se
  pegan al final de una pantalla de contenido** (mal: «Errores y práctica» = lista de
  errores + caso en la misma pantalla). El contenido va en su pantalla y el ejercicio en
  la **siguiente**, cuyo `student_text` es solo el enunciado/introducción del propio
  ejercicio.
- `objective`: texto libre (NO `objective_id`). Si tu herramienta maneja
  micro‑objetivos por id, **vuelca aquí el texto del objetivo**. Los objetivos del
  curso forman un **conjunto reducido y controlado**: derívalos del contenido real, de
  los objetivos que el usuario indique en su petición y de la normativa/ficha
  facilitada; su número lo manda el contenido (tantos como aprendizajes evaluables
  distintos haya), **no una cuota fija ni uno por pantalla**. Todas las pantallas que
  desarrollan el mismo objetivo **repiten su texto EXACTO, carácter a carácter** (cada
  pantalla declara solo su objetivo principal). Los `learning_objective` de
  interacciones y preguntas del test se **copian literalmente** de ese conjunto: así el
  editor traza objetivo ↔ pantalla ↔ evaluación.
- `min_time_seconds`: control de permanencia mínima (no antifraude duro).
- `interaction`: un objeto (ver §6) **o `null`**. Máximo **una interacción por
  pantalla**, y **entera en una sola pantalla** (no partas un accordion/tabs ni una
  actividad en varias).
- `interaction_layout`: `"top"` | `"bottom"` (def. `"bottom"`). Posición de la
  interacción respecto al texto: encima o debajo. Las listas dentro de un `item`/`tab`
  se renderizan como lista si cada elemento va en su línea con `- `.
- `source_refs[]` (trazabilidad, recomendado en cada pantalla):
  `{ "doc": "...", "locator": "p.8" , "quote": "...", "transform": "resumen|reescritura|..." }`
  (solo `doc` es obligatorio).

### 4.1 Markdown ligero y bloques destacados (callouts) en `student_text`

`student_text` se escribe en **texto plano con markdown ligero** (NO HTML). El
editor SCORMEditor lo renderiza. Sintaxis admitida:

- `## ` y `### ` encabezados (el `#`/H1 se reserva al título de pantalla).
- `**negrita**`, `*cursiva*`, `[texto](url)` (http(s) o mailto).
- `- ` listas con viñetas; `1. ` listas numeradas.
- **Bloques destacados (callouts)**: una línea `::: tipo`, el contenido en las
  líneas siguientes, y una línea `:::` para cerrar. Usa `\n` en el JSON:

```json
"student_text": "Texto normal.\n\n::: tip\nEste es un consejo para el alumnado.\n:::\n\nMás texto."
```

Tipos de callout disponibles (escribe el **keyword**, no el icono ni la etiqueta;
el editor pone icono y título automáticamente):

| keyword | Resultado en SCORMEditor |
|---|---|
| `tip` | 💡 Consejo |
| `warn` | ⚠️ Atención |
| `important` | 📌 Importante |
| `fact` | 🧠 ¿Sabías que…? |
| `reflect` | 💭 Reflexiona |
| `case` | 🧪 Caso práctico |
| `info` | ℹ️ Información |

- **Bloque personalizado** (cuando ninguno encaje):
  `::: custom | #color | icono | título` … `:::` (color en hex; p. ej.
  `::: custom | #7787BF | 📖 | Glosario`). Úsalo con moderación.
- Dentro de un callout vale markdown ligero (viñetas, negrita…). **No** anides un
  callout dentro de otro.
- **El cuerpo del callout es contenido real** (la frase destacada del original), **nunca
  la etiqueta ni el keyword**: `::: important\nImportante\n:::` está **mal** (callout
  vacío; el editor ya pone el título «📌 Importante» solo).
- **No pongas dos callouts del mismo tipo en una misma pantalla.** Si un apartado tiene
  varios destacados iguales, cada uno acompaña a su párrafo → **repártelos entre las
  pantallas** correspondientes, uno por pantalla.
- El contenido de un callout va **escapado** por el runtime: escribe texto plano,
  nunca HTML.

Reglas de formato (para que el editor lo renderice bien):
- **Una lista = un elemento por línea** empezando por `- ` (o `1. `). NO la pongas en
  una sola línea (`a • b • c`) ni con viñeta `•`/`*` embebida: saldría como párrafo.
- **Encabezados con `## `/`### `** en una línea con SOLO el título (el cuerpo, en la
  línea siguiente); NO metas el título dentro del párrafo, ni el cuerpo en la misma
  línea del `##`, ni como línea suelta en negrita.
- **Nunca truncar con «…»/«...».** `student_text` lleva el texto completo del trozo
  (regla 9.11); si es largo, más pantallas.
- **Sin rótulos por diapositiva** (`Idea clave:`, `Claves:`, `Objetivo:`, `Resumen:`):
  la diapositiva es solo el contenido.
- **`title` corto y descriptivo** (2-6 palabras), NO un fragmento del contenido cortado
  a mitad de frase, y **no repetido como primera línea del `student_text`** (el `title`
  ya es la cabecera; si el original repite el epígrafe al abrir el cuerpo, elimínalo).
  Si un apartado se parte en varias pantallas, todas mantienen el mismo `title`
  (continuación).
- **Quita la numeración de epígrafes del PDF** (`1.3`, `1.3.1`, `1.4.2`…) en **todo el
  texto**, no solo en el `title`: también en encabezados `##`/`###`, en los **títulos de
  los ítems** de `accordion`/`tabs`/`flip_cards` y en la primera línea del cuerpo. Es
  rótulo de maquetación del documento, no contenido. (Criterio «todo o nada»; por
  defecto, **fuera**.)
- **Epígrafes hermanos, mismo nivel de encabezado.** Si un apartado tiene una serie de
  sub-epígrafes paralelos (p. ej. tres «momentos»: desde el ingreso / de forma
  progresiva / en el día a día), **todos** llevan el mismo marcado (`###`). No dejes
  uno como línea numerada en negrita (`3. **En el día a día**`) mientras sus hermanos
  van con `###`: rompe la jerarquía y arrastra numeración residual.
- **Cada pantalla empieza por su propio contenido.** Al segmentar por epígrafes, no
  arrastres al inicio de una pantalla la lista o los párrafos finales del epígrafe
  anterior (p. ej. una lista de «errores frecuentes» abriendo la pantalla «Evaluación
  y ajuste»). Si ese contenido tiene entidad propia, dale **su propia pantalla previa**
  con su `title`; si no, ciérralo en la pantalla a la que pertenece.
- **Pantallas sustanciales, ninguna vacía ni diminuta.** Cada pantalla = un apartado
  con su desarrollo (varios párrafos), no una frase. Un encabezado + su subtítulo + su
  cuerpo van en **una** pantalla, no en tres. **Evita micro-diapositivas** y **no
  elimines interactividades** informativas convirtiéndolas en varias pantallas de
  texto: unifica el contenido denso en un `accordion`/`tabs`.
- **Conserva las negritas del documento fuente** (`**...**`) y los **bloques marcados**
  (Importante, ¿Sabías que?, Consejo…) como callouts (§4.1). Extrae con formato, no en
  plano: el texto plano pierde negritas y cajas.
- **Enlaces externos**: presérvalos como `[texto](url)` (http/https/mailto); las URLs
  sueltas, envuélvelas igual. El runtime los abre en otra pestaña (`target="_blank"
  rel="noopener"`) automáticamente; no pongas HTML.

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
- Si `kind="image"` → `alt` **obligatorio y no vacío**.
- **`layout` según la proporción de la imagen** (`layout`: `top`|`bottom`|`left`|
  `right`, def. `top`; `media_width`: `33`|`50`|`66`, solo aplica en `left`/`right`):
  - Imagen **apaisada** (ancho > alto, ratio ≳ 1.2) → `"layout": "top"` (o `"bottom"`):
    encima/debajo del texto, a lo ancho.
  - Imagen **cuadrada o vertical** (alto ≥ ancho) → `"layout": "right"` con
    `"media_width": "50"` (o `"33"` si es muy vertical), para que el texto quede al lado.
  - Al extraer del PDF ya conoces las dimensiones (`extract_image` da `width`/`height`);
    calcula el ratio y fija `layout` en consecuencia.
- **Texto + imagen = UNA pantalla.** Un párrafo o apartado acompañado de una figura se
  entrega como **una sola pantalla de contenido** con `student_text` visible **y** su
  `visual_resource`. **No** conviertas ese texto expositivo en un `accordion`/`tabs`, ni
  pongas cada imagen en una pantalla suelta con un pie de foto: eso fragmenta el
  contenido y lo empobrece. Reserva `accordion`/`tabs` para conjuntos de **ítems
  paralelos** (lista de herramientas, categorías…), no para prosa corrida. Si varias
  figuras ilustran sub-puntos distintos, empareja **cada figura con su texto** en su
  pantalla (mismo `title`), en vez de una ristra de imágenes sin texto.
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
  "retries": 2,
  "learning_objective": "Texto del objetivo vinculado.",
  "source_refs": []
}
```

- `type` (enum cerrado): `accordion`, `tabs`, `flip_cards`, `match_pairs`,
  `sort_steps`, `single_choice`, `true_false`, `classification`,
  `scenario_decision`, `case_practice`, `hotspots`, `video`, `fill_blanks`,
  `timeline`, `flashcards`.
- `retries`: `0` = ilimitados.
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

**`fill_blanks`** — completar huecos (evaluable). `config.text` con cada respuesta
correcta entre dobles corchetes `[[...]]`; el runtime convierte cada hueco en un
desplegable cuyas opciones son todas las respuestas + `config.distractors`
(opcional). El validador exige al menos un hueco y feedback:
```json
"config": {
  "text": "El paquete SCORM se sube a [[Moodle]] en formato [[ZIP]].",
  "distractors": ["PDF", "Wordpress"]
}
```

**`timeline`** — línea de tiempo (informativa; `scored: false`). `config.milestones`
en orden, cada hito con `label` (fecha/fase, opcional), `title` y `body` (admite
markdown ligero). El alumno despliega cada hito:
```json
"config": { "milestones": [
  { "label": "1995", "title": "Primer estándar", "body": "Texto del hito..." },
  { "label": "2004", "title": "SCORM 2004", "body": "..." }
] }
```

**`flashcards`** — tarjetas de repaso con autoevaluación (`scored: false`
obligatorio; el validador avisa si puntúa). Mismo shape que `flip_cards`
(`config.cards` con `front`/`back`), pero el flujo es una tarjeta cada vez:
«Mostrar respuesta» → «¿La sabías?» → resumen final «X de N». Úsalo para repaso
al cierre de un tema; `flip_cards` para explorar contenido:
```json
"config": { "cards": [ { "front": "¿Qué es cmi.core.lesson_status?", "back": "El estado del alumno..." } ] }
```

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

> **NO crees una pantalla `unit_quiz`** (ni ninguna pantalla) con el test escrito como
> texto: duplicaría el test (una versión en texto + la interactiva). El test vive
> **solo** en `assessments.final_test`; el runtime ya añade automáticamente la pantalla
> interactiva del test **y una pantalla final de Resultados** (nota + APTO/NO APTO).
> Tampoco crees una pantalla de «Resultados»/«Calificaciones»: la pone la app sola.

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
- **La bibliografía va SOLO en `bibliography[]`**: la carcasa ya la muestra al alumno
  en el modal «Recursos y bibliografía» (una entrada por línea). **NO crees una
  pantalla `content` «Referencias»** con las citas apelotonadas en un párrafo.
- **Una entrada de `bibliography[]` por referencia** (nunca varias citas en un mismo
  `ref`), con el texto limpio y los espacios correctos: nada de `«(2010):La atención»`
  sin espacio ni citas pegadas.
- **Formato homogéneo en TODAS las entradas**, mismo orden y puntuación:
  `Autor/Entidad (año). Título. Revista/Editorial, datos.` Si el original no trae el
  año, omítelo manteniendo el resto del patrón (`Entidad. Título.`). No mezcles estilos
  (unas con `(año):`, otras con el título entre comillas, otras empezando por el
  título): **normaliza todas al mismo patrón** aunque la fuente sea desordenada.
- `quality_checklist`: **objeto** `criterio → booleano`.

---

## 9. Reglas que el JSON debe cumplir para pasar el validador

1. Toda pantalla con `title` no vacío.
2. Pantallas `content`/`objectives`/`route` con `objective` (las `cover` y `summary`
   están exentas). Los objetivos son un **conjunto reducido reutilizado** entre
   pantallas (texto idéntico), no uno distinto por pantalla; en `objectives`/`route`
   usa el objetivo principal del tema (no meta-objetivos tipo «Presentar el
   recorrido»).
3. Toda imagen (`kind="image"`) con `alt`.
4. Todo vídeo con `transcript`; medios con voz (`has_voice:true`) con `tracks` VTT.
5. Toda pregunta evaluable con **respuesta correcta** y **feedback**.
6. Toda interacción con `learning_objective` **copiado literalmente** de un
   `objective` declarado en pantallas; cada objetivo declarado con al menos una
   evaluación (interacción `scored` o pregunta del test) que lo mida.
7. Cada unidad con `summary` (o pantalla `summary`) y al menos una actividad/test.
8. `glossary` y `bibliography` no vacíos.
9. Si `score_source="final_test"` → `assessments.final_test` con preguntas.
10. `scorm.identifier` no vacío.
11. **Texto original conservado (~100%)**: el curso reproduce el texto de origen casi
    literal (mínimo ~0.95, ideal ≈1.0), NO un resumen ni una reescritura. Solo se
    permiten retoques mínimos de conexión para cortar entre pantallas. El texto va
    **visible** (`student_text` y/o dentro de interactividades informativas) y
    **duplicado en `transcript`**. Se reparte en pantallas **sustanciales** (no
    micro-diapositivas) e interactividades informativas; la información NO se recorta
    (ver guía).

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
- [ ] **Texto original conservado ~100%** (regla 9.11): casi literal (≥0.95), visible
      + en `transcript`, sin resumir ni reescribir.
      `quality_checklist`: `"Contenido del documento trazado sin pérdidas": true`.
- [ ] Empaquetado como `.scormproj` (§11): `course.json` en la raíz del ZIP +
      `assets/` con TODOS los binarios referenciados; ninguna ruta `assets/…` del
      `course.json` apunta a un fichero ausente.

---

## 11. Empaquetado `.scormproj` (entrega final)

El editor SCORMEditor abre **archivos de proyecto `.scormproj`**: un **ZIP** que
contiene `course.json` en la raíz y una carpeta `assets/` con los binarios. Modelo
mental tipo `.docx`/`.sb3`: un solo archivo que el usuario abre con doble clic o
desde *Archivo ▸ Abrir*.

### Reglas del paquete (no se pueden romper)

1. **`course.json` en la raíz** del ZIP (nombre exacto, en minúsculas). Es el
   mismo objeto JSON que define este contrato (§1–§10), serializado UTF-8 con
   sangría de 2 espacios.
2. **Carpeta `assets/`**: cada binario va bajo `assets/…`. Las **claves de las
   entradas del ZIP coinciden EXACTAMENTE** con las rutas que el `course.json`
   referencia. Es decir, si una pantalla lleva
   `"visual_resource": { "src": "assets/img/s06.png" }`, dentro del ZIP **debe
   existir** la entrada `assets/img/s06.png`. Lo mismo para `hotspots.image`,
   `tracks[].src` y `audio_src`.
3. **Sin rutas rotas**: toda ruta `assets/…` referenciada en `course.json` debe
   tener su fichero real en el ZIP. Si no hay binario para una imagen, **no la
   referencies**: pon `kind:"none"` en esa pantalla y anótalo en `editor_notes`
   (`"Imagen pendiente de subir: figura p.8"`), en vez de dejar un `src` que apunte
   a la nada.
4. **Vídeo de YouTube**: `kind:"video_youtube"` usa el **ID** en `src` y **no**
   genera ningún fichero en `assets/` (no es un binario local).
5. **Convención de nombres**: `assets/img/…` imágenes, `assets/media/…` audio/
   vídeo/subtítulos VTT. Nombres en minúsculas, sin espacios ni acentos
   (`u01_t01_modelo.png`).
6. **Nombre del archivo**: `<course.id>.scormproj`.

### Imágenes a partir del PDF de origen

Cuando el documento de origen sea un PDF, **extrae sus imágenes** e inclúyelas en
`assets/img/` con un nombre estable, referenciándolas desde la pantalla
correspondiente (usa el `source_refs[].locator` —p. ej. `p.8`— para saber de qué
página sale cada figura). Para cada imagen incluida, rellena `alt` (obligatorio) y,
si procede, `caption`. Las figuras decorativas o de baja calidad: omítelas
(`kind:"none"`) antes que ensuciar el curso.

### Builder en Code Interpreter (Python)

Construye el `course.json` como `dict`, reúne los binarios en un `dict`
`ruta → bytes` y empaqueta con esta función. Valida que no haya rutas rotas
**antes** de devolver el archivo.

```python
import json, zipfile, os, re

def build_scormproj(course: dict, asset_files: dict, out_dir="/mnt/data"):
    """
    course      -> dict del course.json (ya conforme a §1–§10).
    asset_files -> { "assets/img/s06.png": b"...bytes...", ... }
                   Claves con prefijo "assets/" que COINCIDEN EXACTAMENTE con las
                   rutas referenciadas en course.json.
    Devuelve (ruta_del_scormproj, lista_de_huerfanos).
    """
    blob = json.dumps(course, ensure_ascii=False)
    referenced = set(re.findall(r'"(assets/[^"]+)"', blob))

    # Toda ruta referenciada debe tener su binario (regla 3: sin rutas rotas).
    missing = sorted(referenced - set(asset_files))
    if missing:
        raise ValueError(
            "Faltan binarios para rutas referenciadas en course.json:\n  - "
            + "\n  - ".join(missing)
            + "\nIncluye el fichero o cambia la pantalla a kind:'none'."
        )

    # Assets incluidos pero NO referenciados: no rompen, pero conviene revisarlos.
    orphans = sorted(set(asset_files) - referenced)

    course_id = (course.get("course") or {}).get("id") or "curso"
    out_path = os.path.join(out_dir, f"{course_id}.scormproj")
    # STORE (sin comprimir), igual que la app: el reempaquetado es instantáneo y
    # los media ya vienen comprimidos. (DEFLATE también lo abriría sin problema.)
    with zipfile.ZipFile(out_path, "w", compression=zipfile.ZIP_STORED) as z:
        z.writestr("course.json", json.dumps(course, ensure_ascii=False, indent=2))
        for path, data in asset_files.items():
            z.writestr(path, data)
    return out_path, orphans


def extract_pdf_images(pdf_path):
    """Extrae las imágenes incrustadas de un PDF. Devuelve
    [(pagina_1based, ext, bytes), ...]. Requiere PyMuPDF (import fitz)."""
    import fitz
    doc = fitz.open(pdf_path)
    out = []
    for pno in range(len(doc)):
        for img in doc.get_page_images(pno):
            base = doc.extract_image(img[0])
            out.append((pno + 1, base["ext"], base["image"]))
    return out


def extract_text_markdown(pdf_path, pages=None):
    """Extrae el texto de un PDF CONSERVANDO la negrita como markdown `**...**`.
    NO uses get_text('text'): pierde la negrita. Aquí se usa get_text('dict'), donde
    cada 'span' trae 'flags' y 'font': el bit 4 (16) de flags y/o un nombre de fuente
    con 'Bold'/'Black'/'Semibold' indican negrita. Devuelve texto plano con markdown
    ligero, listo para segmentar en pantallas (Regla Nº1). Requiere PyMuPDF."""
    import fitz
    doc = fitz.open(pdf_path)
    nums = range(len(doc)) if pages is None else pages
    out = []
    for pno in nums:
        for block in doc[pno].get_text("dict")["blocks"]:
            for line in block.get("lines", []):
                buf, open_b = "", False
                for span in line["spans"]:
                    t = span["text"]
                    bold = bool(span["flags"] & 16) or any(
                        k in span["font"] for k in ("Bold", "Black", "Semibold"))
                    if t.strip() and bold != open_b:   # abre/cierra ** en la transición
                        buf += "**"
                        open_b = bold
                    buf += t
                if open_b:
                    buf += "**"
                out.append(buf)
            out.append("")                              # línea en blanco entre bloques
    return "\n".join(out)
```

Uso típico:

```python
# 1) course = { "schema_version": "1.0.0", "course": {...}, ... }  (§1–§10)
# 2) Elegir, de las imágenes extraídas, las que se usan y asignarles ruta+alt:
asset_files = {
    "assets/img/s06.png": img_bytes_de_la_figura_pagina_8,
    # ...
}
# 3) Las rutas de asset_files deben aparecer tal cual en course.json (visual_resource.src, etc.)
path, orphans = build_scormproj(course, asset_files)
print("Generado:", path, "| huérfanos:", orphans)
```

Devuelve al usuario **el enlace de descarga del `.scormproj`** y, si los hubo,
menciona los assets huérfanos o las imágenes que dejaste como `kind:"none"`.
```
