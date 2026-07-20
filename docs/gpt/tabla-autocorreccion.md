# Tabla de autocorrección (informe de validación → corrección)

Instrucciones para la herramienta/GPT cuando el usuario pega un **informe de
validación de SCORMEditor**: líneas con la forma
`- ⛔ [CODIGO] mensaje — ubicación` (⛔ error · ⚠ aviso · ℹ informativo), que el
editor genera con el botón «Copiar informe» de la pestaña Validación o exporta en el
informe de revisión.

## Protocolo

1. **LEE este documento** con Code Interpreter (no trabajes de memoria).
2. Recorre el informe línea a línea: busca cada `[CODIGO]` en la tabla y aplica su
   **corrección canónica** sobre el `course.json` del proyecto. La `ubicación`
   (módulo › unidad › «pantalla») te dice dónde. Si no tienes el proyecto en la
   sesión, pide el `.scormproj`.
3. **Respeta la columna «Quién»**: lo marcado **Editor** es trabajo del editor humano
   en SCORMEditor — **no lo toques ni inventes contenido o rutas `assets/` para
   «resolverlo»**. En **Según**, lee el criterio de la corrección.
4. Corrige **solo lo señalado** (no reescribas nada más: Regla Nº1), reempaqueta el
   `.scormproj` (contrato §11, sin rutas rotas) y entrega el enlace.
5. Cierra con dos listas: **qué corregiste** (código → pantalla) y **qué queda para
   el editor humano**.
6. Un código que no esté en esta tabla: guíate por el mensaje del aviso y el
   contrato (`contrato-course-json.md`, que manda en caso de conflicto).

## Pantallas y contenido

| Código | Sev | Causa raíz | Corrección canónica | Quién |
|---|:-:|---|---|:-:|
| `NO_TITLE` | ⛔ | Pantalla con `title` vacío | Ponle un título corto (2-6 palabras) descriptivo del contenido | GPT |
| `ID_DUPLICATE` | ⛔ | Dos entidades (pantalla, interacción, módulo, unidad, test o pregunta) comparten `id` | Renombra una a un `id` único: el runtime guarda el progreso y la nota por `id`, y un duplicado los corrompe | GPT |
| `NO_OBJECTIVE` | ⚠ | Pantalla (no `cover`/`summary`) sin `objective` | Copia **carácter a carácter** el objetivo declarado del curso que la pantalla desarrolla (no inventes uno nuevo) | GPT |
| `SKELETON` | ⚠ | Pantalla `content_placeholder` o `status` esqueleto | Solo si el usuario pide desarrollarla: complétala desde el texto fuente. Si es un esqueleto deliberado, no tocar | Según |
| `CALLOUT_EMPTY` | ⚠ | Emitiste `::: tipo` sin cuerpo, o con la etiqueta («Importante») como cuerpo | El cuerpo es la **frase destacada del original**; si no hay texto real para la caja, elimina el callout | GPT |
| `COVER_INTERACTION` | ⚠ | Pusiste una interacción en la portada (`cover`) | Muévela a una pantalla propia después de la portada; la `cover` queda solo con título/subtítulo | GPT |
| `VIDEO_NO_MEDIA` | ⚠ | Pantalla `type:"video"` sin recurso de vídeo | Añade el `visual_resource` (`video_youtube` con el ID del fuente) o, si no hay vídeo, cambia `type` a `content` | GPT |
| `QUIZ_NO_SCORED` | ⚠ | Pantalla `unit_quiz` sin interacción evaluable | Añade la interacción `scored:true` o cambia el `type` de la pantalla | GPT |
| `FORUM_SCORED` | ⚠ | `forum_prompt` con interacción puntuable | Pon `scored:false`: el foro es actividad externa del campus, no puntúa en el SCORM | GPT |

## Unidades y curso

| Código | Sev | Causa raíz | Corrección canónica | Quién |
|---|:-:|---|---|:-:|
| `UNIT_SKELETON` | ⚠ | Unidad marcada como esqueleto | Como `SKELETON`: desarrollar solo si el usuario lo pide | Según |
| `UNIT_NO_SUMMARY` | ⚠ | Unidad sin `summary` ni pantalla `summary` | Redacta el `summary` a partir del cierre del tema en el texto fuente | GPT |
| `UNIT_NO_ACTIVITY` | ⚠ | Unidad sin ninguna interacción ni test | Añade checkpoints evaluables según el ritmo de la guía (cada 4-5 pantallas) | GPT |
| `EDITOR_NOTE` | ℹ | Nota editorial — es el **canal previsto** para dejar tareas al humano | No es un defecto: no corregir. Solo actúa si el usuario aporta el material que la nota pide | Editor |
| `GLOSSARY_EMPTY` | ⚠ | `glossary` vacío | Extrae términos y definiciones del texto fuente (`{term, definition, source_refs}`) | GPT |
| `BIBLIO_EMPTY` | ⚠ | `bibliography` vacía | Vuelca las referencias del fuente: una entrada por referencia, formato homogéneo (`Autor/Entidad (año). Título. Fuente.`) | GPT |

## Accesibilidad y medios

| Código | Sev | Causa raíz | Corrección canónica | Quién |
|---|:-:|---|---|:-:|
| `IMG_NO_ALT` | ⛔ | Imagen sin texto alternativo (en `visual_resource`, `image_cards`, `before_after`, `hidden_image` o `puzzle`) | Si la imagen la incluiste tú: redacta un `alt` que describa lo que muestra. Si la subió el editor humano (no puedes verla): déjala y díselo — **no inventes** qué muestra | Según |
| `VIDEO_NO_TRANSCRIPT` | ⛔ | Vídeo sin `transcript` | Si el fuente da la información, redáctala; si no, deja `editor_note` pidiéndola | Según |
| `AUDIO_NO_TRANSCRIPT` | ⛔ | Pantalla con locución (`audio_src`) sin `transcript` | Duplica el contenido de la pantalla en `transcript` (Regla Nº1: el texto ya existe) | GPT |
| `MEDIA_NO_SUBS` | ⛔ | Medio con `has_voice:true` sin `tracks` VTT | Si no tienes el VTT no marques `has_voice:true`; el fichero de subtítulos lo aporta el editor humano (deja `editor_note`) | Según |
| `NARR_NO_TRANSCRIPT` | ⚠ | Curso narrado y pantalla sin `transcript` | Duplica el contenido de la pantalla en `transcript` (es la entrada del TTS) | GPT |
| `NARR_NO_AUDIO` | ℹ | Hay transcripción pero falta el audio de locución | Pendiente del TTS: lo genera el editor humano en SCORMEditor. **No tocar** | Editor |
| `NARR_ITEM_NO_AUDIO` | ℹ | Curso narrado: un ítem de accordion/tabs/flip_cards/timeline/image_cards/flashcards tiene texto pero no audio propio | Estos tipos ocultan su contenido tras el revelado y se narran por ítem (no en el audio de pantalla): pendiente del TTS por ítem, lo genera el editor humano en SCORMEditor. **No tocar** | Editor |

## Interacciones y preguntas

| Código | Sev | Causa raíz | Corrección canónica | Quién |
|---|:-:|---|---|:-:|
| `Q_NO_PROMPT` | ⛔ | Pregunta sin enunciado | Redáctalo a partir del contenido que evalúa | GPT |
| `Q_NO_CORRECT` | ⛔ | Ninguna opción con `correct:true` (o, en `classification`/`match_pairs`, opciones sin `group`) | Marca la correcta; en clasificación, asigna a cada `option` su `group` | GPT |
| `Q_NO_FEEDBACK` | ⛔ | `feedback.correct` e `incorrect` vacíos | Escribe ambos, pedagógicos: por qué es correcta / qué repasar. Nunca un «¡Bien!» vacío | GPT |
| `FB_NO_BLANKS` | ⛔ | `fill_blanks` sin ningún hueco en `config.text` | Marca cada respuesta correcta entre dobles corchetes `[[respuesta]]` | GPT |
| `TL_EMPTY` | ⛔ | `timeline` sin hitos | Añade `config.milestones` (`label`/`title`/`body`) con el contenido del fuente, o cambia el tipo | GPT |
| `CP_NO_RUBRIC` | ⚠ | `case_practice` sin rúbrica | Añade `config.rubric` con criterios de autoevaluación verificables | GPT |
| `FC_EMPTY` | ⛔ | `flashcards` sin tarjetas | Añade `config.cards` (`front`/`back`) con conceptos del tema, o elimina la interacción | GPT |
| `FC_SCORED` | ⚠ | `flashcards` con `scored:true` | Pon `scored:false`: es autoevaluación de repaso | GPT |
| `IC_EMPTY` | ⛔ | `image_cards` sin tarjetas | Añade las `cards` (`alt`, `title`, `text`); `image` vacío + `editor_note` describiendo cada imagen | GPT |
| `IC_NO_IMAGE` | ⛔ | Tarjeta de imagen sin `image` | **Esperado** si generaste el tipo: las imágenes las sube el editor humano. **No inventes rutas `assets/`** | Editor |

## Tipos reservados al editor humano

Si aparecen estos códigos, o bien emitiste un **tipo vetado** (`hotspots`,
`before_after`, `hidden_image`, `puzzle`, `video` interactivo, `html_embed`) — y la
corrección de fondo es **reconvertirlo** a un tipo permitido (equivalencias en el
contrato §6) o dejar `editor_note` — o bien el aviso pertenece al trabajo manual del
editor.

| Código | Sev | Causa raíz | Corrección canónica | Quién |
|---|:-:|---|---|:-:|
| `EMBED_EMPTY` | ⛔ | `html_embed` sin código | Si lo emitiste tú: elimínalo y deja `editor_note` describiendo el interactivo deseado (escribir código no es tu tarea) | Editor |
| `EMBED_SCORED` | ⚠ | `html_embed` con `scored:true` | Pon `scored:false`: corre aislado en sandbox y no puede puntuar | GPT |
| `BA_NO_IMAGES` | ⛔ | `before_after` sin las dos imágenes | Las imágenes las elige y sube el editor humano. No inventes rutas | Editor |
| `BA_SCORED` | ⚠ | `before_after` con `scored:true` | Pon `scored:false`: es un comparador informativo | GPT |
| `HI_NO_IMAGE` | ⛔ | `hidden_image` sin imagen | La imagen la sube el editor humano | Editor |
| `HI_NO_QUESTIONS` | ⛔ | `hidden_image` sin preguntas | Las preguntas sí puedes completarlas desde el contenido (opción única, ≥2 opciones, una correcta) | Según |
| `HI_Q_NO_PROMPT` / `HI_Q_FEW_OPTIONS` / `HI_Q_NO_CORRECT` | ⛔ | Pregunta de imagen oculta incompleta | Completa enunciado / ≥2 opciones / opción correcta | GPT |
| `PZ_NO_IMAGE` | ⛔ | `puzzle` sin imagen | La imagen la sube el editor humano | Editor |
| `IV_Q_NO_PROMPT` / `IV_Q_FEW_OPTIONS` / `IV_Q_NO_CORRECT` | ⛔ | Pregunta de vídeo interactivo incompleta | Completa enunciado / ≥2 opciones / correcta, si el contenido del vídeo lo permite | Según |
| `IV_YT_BRIDGE` | ℹ | Informativo técnico: el LMS puede bloquear la comunicación con YouTube | Nada que corregir | — |

## Juegos

| Código | Sev | Causa raíz | Corrección canónica | Quién |
|---|:-:|---|---|:-:|
| `WS_EMPTY` | ⛔ | Sopa de letras sin palabras | Añade 4-10 términos clave del tema (3-12 letras útiles) | GPT |
| `WS_WORD_LONG` | ⛔ | Palabra con más de 12 letras útiles: no cabe en el tablero | Sustitúyela por otro término clave de 3-12 letras (acentos y espacios no cuentan) | GPT |
| `WS_WORD_SHORT` | ⛔ | Palabra con menos de 3 letras útiles | Ídem: otro término de 3-12 letras | GPT |
| `CW_EMPTY` | ⛔ | Crucigrama sin palabras | Añade `entries` (`word` + `clue`) con términos que **compartan letras** | GPT |
| `CW_FEW` | ⚠ | Crucigrama con una sola palabra: sin cruces | Añade más palabras que crucen con la existente | GPT |
| `CW_INCOMPLETE` | ⛔ | Entrada sin palabra o sin pista | Completa `word` y `clue` | GPT |
| `AZ_EMPTY` | ⛔ | Rosco sin definiciones | Añade `items` (`clue` + `answer`); la letra del rosco es la **inicial de la respuesta** | GPT |
| `AZ_INCOMPLETE` | ⛔ | Entrada del rosco sin definición o sin respuesta | Completa `clue` y `answer` | GPT |
| `AZ_DUP_LETTER` | ⚠ | Varias respuestas empiezan por la misma inicial | Cambia una por un sinónimo o término del tema con otra inicial | GPT |

## Test y nota (SCORM)

| Código | Sev | Causa raíz | Corrección canónica | Quién |
|---|:-:|---|---|:-:|
| `SCORM_NO_FINAL` | ⛔ | `score_source:"final_test"` sin preguntas en `assessments.final_test` | Genera el test final (preguntas `single_choice`/`true_false` con correcta y feedback). **Nunca** como pantalla de texto | GPT |
| `SCORM_NO_ACTIVITIES` | ⛔ | `score_source:"unit_tests"` sin interacciones `scored` | Marca `scored:true` en las evaluables o cambia `score_source` | GPT |
| `SCORM_MIXED_EMPTY` | ⛔ | Nota mixta sin test final ni actividades evaluables | Genera ambos bloques | GPT |
| `SCORM_MIXED_NO_FINAL` | ⚠ | Nota mixta sin test final | Genera el test final (o propón cambiar `score_source` a `"unit_tests"`) | GPT |
| `SCORM_MIXED_NO_ACTIVITIES` | ⚠ | Nota mixta sin actividades evaluables | Marca `scored:true` en los checkpoints (o añádelos) | GPT |
| `SCORM_ACTIVITIES_IGNORED` | ⚠ | Hay actividades `scored` pero la nota sale solo del test final: no contarán | Decisión del autor: propón `score_source:"mixed"` y aplica lo que él decida | Según |
| `SCORM_NO_ID` | ⛔ | `scorm.identifier` vacío | Genera uno estable a partir de `course.id` (MAYÚSCULAS y guiones bajos) | GPT |
| `OBJ_NOT_EVALUATED` | ℹ | Objetivo declarado sin evaluación que lo mida. Causa 1 (la habitual): el `learning_objective` de una pregunta de test no está copiado **carácter a carácter** del `objective`. Causa 2: falta la evaluación (ni una interacción `scored` en una pantalla con ese `objective`, ni una pregunta de test) | Causa 1: corrige el texto para que coincida exactamente. Causa 2: añade una pregunta al test, o marca `scored` una interacción de una pantalla con ese objetivo | GPT |

> Esta tabla se deriva de los validadores de SCORMEditor (`validators.ts`) y se
> mantiene sincronizada con ellos. Si un informe trae un código que no figura aquí,
> avisa al usuario de que la tabla puede estar desactualizada y corrige guiándote
> por el mensaje y el contrato.
