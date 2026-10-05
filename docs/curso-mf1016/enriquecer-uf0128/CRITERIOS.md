# Criterios para enriquecer UF0128 (síntesis de las instrucciones del GPT)

Fuente de verdad: `docs/gpt/guia-diseno-interacciones.md` y `contrato-course-json.md`.
Aquí, solo las decisiones concretas de este trabajo.

## Regla de oro: no cambiar el contenido
- Todo el texto original debe seguir en el curso (el informe de `build.py` mide la
  cobertura de palabras y lista las que faltan; objetivo ≥ 98 %). **No resumas ni
  reescribas.** No teclees de nuevo párrafos: trocea el original con `lib.B(id)`
  (bloques), `lib.text_of(id)` y `lib.join(...)`; para retoques puntuales, `.replace()`.
- Cambios permitidos (solo de forma): quitar numeración de epígrafes («1.2.», «2.3»),
  quitar encabezados `##` que repiten el título de la pantalla, quitar rótulos de
  actividad («Reflexiona (actividad no evaluable)»), arreglar defectos de extracción
  (palabras partidas «sani taria», espacios que faltan «una**perspectiva», listas
  pegadas a un párrafo «Residencias Los tres primeros…», negritas rotas, callouts
  pegados, `##` huérfanos), mover un pie de foto («*Fig. 2.1. …*») a `caption`.
  Anota en el informe cada retoque de redacción que hagas.
- Micro-transiciones aditivas permitidas (1-2 frases puente, p. ej. introducir una
  actividad). Nunca sustituyen texto del original.

## Estructura de cada tema (en este orden)
1. `cover` (portada): `title` = «Tema N. …» (el de `UNIT_TITLES` de build.py), `student_text` vacío.
2. `objectives`: `student_text` = lista `- ` de los 2-4 objetivos del tema (verbo de
   acción + contenido). `objective` = el principal.
3. Desarrollo: pantallas `content` (+ interacciones), siguiendo el orden del original.
4. Cierre: `flashcards` (repaso) + UNA lúdica con `scored:false`. Tema 1 →
   `az_quiz`, Tema 2 → `word_search`, Tema 3 → `crossword` (cada una en su pantalla).
5. `summary`: recapitulación (viñetas con frases del propio tema) y/o las imágenes de
   «Síntesis» del original (una imagen por pantalla, `type:'summary'`).
El test de cada tema (`assessments.unit_tests`) y el test final ya existen: no se tocan.

## Títulos (menú del alumno)
- 2-6 palabras, sin numeración, específicos, no un trozo de frase. Varias pantallas de
  una misma idea comparten título; una serie de elementos con nombre propio
  (un profesional, un principio, un factor…) se titula con **cada elemento**.
- Nunca «Checkpoint», «Actividad», «Reflexiona…». La app ya rotula las actividades.

## Segmentación
- Una idea y una acción mental por pantalla. Divide donde cambia la idea o la intención
  (definición → aplicación, explicación → actividad, cómo → para qué). Pantalla > ~800
  caracteres sin interacción informativa: divídela por sentido (o vuelca parte en un
  accordion/tabs que **contenga** el texto). Un sub-epígrafe con texto propio = su pantalla.
- Evita micro-pantallas (< ~250 caracteres) salvo imagen + caption.
- Un encabezado va con su texto. `###` dentro del texto solo para sub-secciones reales
  (sólo título en su línea). No dos callouts del mismo tipo en una pantalla.
- Ejercicios/«Reflexiona» **nunca pegados** al final de una pantalla de contenido: van en
  la pantalla siguiente (solo enunciado). La solución, si existe, en
  `feedback.explanation`, nunca visible.

## Imágenes
- Máximo UNA por pantalla, siempre `visual_resource` (nunca `![](…)` en el texto).
  Serie de figuras → una pantalla por figura, titulada con su punto.
- `layout`: apaisada (ancho > ~1.2·alto) → `top`; cuadrada/vertical → `right` con
  `media_width` `'50'` (o `'33'` si muy vertical). Texto + imagen → **sin interacción**
  en esa pantalla (la interacción va en la siguiente, con una frase de introducción).
- `alt` descriptivo **mirando la imagen** (herramienta Read sobre el PNG; están en
  `<scratchpad>/uf0128/assets/img/`). Para tablas-imagen, el alt resume qué contiene.
  El pie de foto original va en `caption` (sin «Fig. X.Y» si queda redundante, a tu criterio).
- Series de tablas-imagen sin texto propio (p. ej. funciones de cada profesional) pueden
  ir juntas en una `image_cards` (informativa) con el pie como `text`, en vez de N
  pantallas de 120 caracteres.

## Interacciones (usar lib.py; respetar los shapes del contrato §6)
- Informativas (`accordion`, `tabs`, `flip_cards`, `timeline`, `image_cards`): ~1 de cada
  3-4 pantallas de desarrollo; nunca > 3 pantallas seguidas de solo texto. `accordion`
  para ítems largos o 5+; `tabs`/`flip_cards` solo 2-4 ítems cortos. **Detrás del clic
  hay sustancia** (cuerpo claramente más largo que el título); el cuerpo es texto
  ORIGINAL (se mueve, no se duplica). Una interacción = una pantalla entera. Campos
  cortos (prompt, opciones, front/back, feedback): solo **negrita**/*cursiva*/enlaces.
  `body` de accordion/tabs sí admite listas y párrafos.
- Evaluables (checkpoints): uno cada 4-5 pantallas (mín. ⌈N/5⌉), en **pantalla propia**
  (student_text = 0-1 frases de contexto), tras el bloque que evalúan, alternando
  `single_choice`, `true_false`, `fill_blanks`, `match_pairs`, `classification`,
  `sort_steps`, `scenario_decision`, `case_practice` sin repetir tipo seguido. Prefiere
  decidir/clasificar/ordenar a reconocer. Distractores plausibles. Todo con
  `feedback` (acierto/error) y `explanation` con la razón **según el texto del tema**.
  **No inventes datos**: solo lo que el tema dice. `scored=True, points=1, attempts=2`
  (los constructores ya lo hacen). Las «Reflexiona» con respuesta determinable
  (verdadero/falso, identificar quién hace qué…) se convierten en evaluables; las
  abiertas, en pantalla `type:'reflection'` (interaction null, solo enunciado) o
  `case_practice` con `rubric` derivada del texto.
- Prohibidos (reservados al editor humano): hotspots, before_after, hidden_image,
  puzzle, video, html_embed.

## Objetivos
- 2-4 por tema. Texto EXACTO repetido en `objective` de las pantallas que lo desarrollan
  (cada pantalla, su objetivo principal; `cover` sin objetivo no es necesario pero sí
  `objectives`, contenido, interacciones y `summary`). Cada objetivo con ≥ 1 interacción
  evaluable en una pantalla con ese `objective`.

## Glosario
- `GLOSSARY = [(término, definición)]` con las cajas «Vocabulario» del tema (texto
  original). Las cajas se mantienen también en la pantalla.

## Formato de entrega de cada tema
`temaN.py` con `SCREENS` (lista de `lib.screen(...)`), `OBJECTIVES` (lista de str) y
`GLOSSARY`. Los ids de pantalla/interacción los pone `build.py`. Prueba con:
`python build.py --out <scratchpad>/temaN-prueba.scormproj` (el informe da lint,
cobertura de texto y el validador del editor). Objetivo: 0 LINT, cobertura ≥ 98 %,
0 errores y 0 avisos del validador en tu tema (ignora los de los otros temas).
