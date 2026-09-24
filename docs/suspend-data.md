# Persistencia de progreso (`cmi.suspend_data`)

SCORM 1.2 limita `cmi.suspend_data` a 4096 caracteres para **todo** el progreso
guardado del curso (no por pantalla). `src/runtime/assets/js/state_codec.js`
(`StateCodec`) codifica el objeto `STATE` de `app.js` en un string compacto,
**por posición** en vez de por id, para que un curso grande quepa con margen.

## Invariante
`STATE` (`{ visited, interactions, results, attempts, finalScore,
finalAnswers }`) es el mismo objeto de siempre — este módulo solo cambia cómo
se serializa. `app.js` no sabe nada del formato: `restore()` llama a
`StateCodec.decode(SCORM.getSuspend(), COURSE, COURSE.scorm.layouts || [])` y
`persist()` a `StateCodec.encode(STATE, COURSE)`; `scorm_api.js` solo lee/
escribe el string crudo en el LMS (`getSuspend`/`setSuspend`), sin tocar su
contenido.

## Formato v2
`"2|" + huella(6) + "|" + 7 segmentos`. Los 7 segmentos (visited, estado de
resultados, puntuaciones, detalle de interacciones, respuestas del test
final, intentos, nota final) van uno detrás de otro con
`packChunks`/`unpackChunks`: cada segmento se antepone de su propia longitud
(`"<len_base36>:<contenido>"`), así que se trocean por longitud, no por
delimitador — ningún contenido (barras, dos puntos, Unicode) puede romper el
troceado. El detalle de cada interacción y cada pregunta del test final es a
su vez un segmento independiente dentro de esos 7, así que se puede separar
en "segmento nº k" sin conocer su tipo ni su config; solo al interpretarlo se
consulta la config ACTUAL de esa posición (ver `scripts/test-state-codec.ts`,
prueba de troceado ciego).

- **Huella**: hash corto (6 caracteres) del orden de ids de pantallas,
  interacciones (con su tipo) y preguntas del test final tal como está
  empaquetado el curso.
- **`visited`**: mapa de bits sobre el índice de pantalla (mismo orden que
  `flatten()` en `app.js`), en base64url.
- **`results`**: un carácter por interacción — `.` pendiente, `d` completada
  sin nota, `c` acierto (nota = la máxima, no hace falta guardarla, se deriva
  de `interaction.points`), `f` completada evaluable sin acierto pleno
  (guarda la puntuación real, puede ser parcial). El test final es la única
  excepción: su "acierto" es un apto/no-apto por nota mínima, no una nota
  perfecta, así que siempre guarda la puntuación cuando completa.
- **`interactions`**: un segmento por interacción con un carácter de modo —
  vacío (sin detalle todavía), `0` + codec compacto del tipo (índices en vez
  de ids de opción, permutaciones, máscaras de bits…), o `1` + JSON genérico
  como último recurso. Cada decoder de tipo valida el segmento contra la
  config actual (número de opciones, casillas, preguntas…): si no encaja, se
  descarta solo el detalle de esa interacción — el `result` ya decodificado
  aparte no se pierde. Añadir un tipo nuevo implica añadir su codec en
  `TYPE_CODECS` dentro de `state_codec.js` (`encode(detalle, interaction)` /
  `decode(segmento, interaction)`); si no tiene uno, cae automáticamente al
  fallback JSON genérico (funciona, pero gasta más espacio).
- **`finalAnswers`**: un segmento por pregunta con el índice de la opción
  elegida (orden de autor de `question.options`), o vacío si no se respondió.
- Todo el contenido va en ASCII imprimible: los pocos puntos por los que
  puede viajar texto libre real (lo que escribe el alumno en `az_quiz`, el
  JSON de estado de `html_embed`, el fallback JSON genérico) se escapa
  carácter a carácter fuera de `0x20-0x7E`.

## Historial de estructuras y remapeo (`scorm.layouts`)

Republicar un curso (reordenar, añadir o quitar pantallas/interacciones/
preguntas) cambia la huella. Sin más, eso dejaría sin progreso reanudable a
cualquier alumno con un intento a medias de la versión anterior. Para
evitarlo, `course.scorm.layouts` (`CourseLayout[]`, `course.schema.ts`) guarda
una entrada por cada estructura distinta que se ha **exportado como SCORM**
(nunca en Vista previa): `{ fp, screens: [ids], interactions: [{id,type}],
final_questions: [ids], exported_at }`. `Toolbar.tsx` (`onExportScorm`)
calcula la huella actual con `StateCodec.buildLayoutEntry(course)` al pulsar
«Exportar SCORM ZIP»; si no está ya en el historial, añade la entrada
(dedupe por `fp`) antes de generar el paquete — así el historial completo
viaja dentro del `course.json` del propio ZIP, no en `suspend_data`.

`decode()` no distingue "huella igual" de "huella conocida pero distinta": en
ambos casos resuelve una **lista de referencia** (ids de pantallas, `{id,
type}` de interacciones, ids de preguntas) — la del curso actual si la huella
coincide, o la de la entrada de `layouts` que coincida si no — y decodifica
cada posición contra esa lista:
- Si el id de la pantalla/interacción/pregunta de esa posición **ya no
  existe** en el curso actual, se descarta (pantalla eliminada, interacción
  eliminada…). Si sigue existiendo, se traduce esa posición antigua a su id y
  se decodifica contra la config **actual** de ese id, con la misma
  validación por tipo de la Fase 1.
- Si una interacción **cambió de tipo** (mismo id, tipo distinto), se
  descartan tanto su detalle como su resultado — ninguno de los dos es de
  fiar contra un tipo distinto al que se guardó.
- Huella **desconocida** (ni coincide ni está en `layouts`) → se descarta
  todo lo posicional (`visited`/`interactions`/`results`/`finalAnswers`) pero
  se conservan `attempts` y `finalScore`, que no dependen de la posición; se
  registra un aviso en consola (`console.warn`).

En el siguiente `persist()` el estado se reescribe con la huella actual —el
remapeo solo ocurre en la lectura de un intento antiguo, nunca se arrastra.

**Límite conocido, aceptado por diseño**: `layouts` guarda ids y tipos, no la
config completa de cada interacción (por eso es ligero y cabe en el propio
`course.json`). Si una interacción conserva su id y su tipo pero su config
interna cambia de forma que las mismas posiciones significan algo distinto
(p. ej. se reordenan las opciones de un `single_choice` sin cambiar el número
de opciones), la validación por tipo no puede detectarlo — decodificará un
valor estructuralmente válido pero semánticamente distinto. Es el mismo
límite que ya existe dentro de una única estructura (Fase 1): la validación
comprueba forma (cardinalidad, rango), no significado.

**Editor** (Ajustes del curso → «Versiones publicadas»): lista las entradas
de `layouts` con su fecha, permite borrar entradas antiguas (con aviso: los
alumnos con progreso de esa versión dejan de poder remapearse, aunque
conservan intentos y nota). Validadores: `LAYOUT_CHANGED` (info) si la
estructura actual difiere de la última publicada; `LAYOUT_IDS_REPLACED`
(aviso) si menos de la mitad de los ids de la última versión publicada
siguen existiendo.

## Migración desde el formato antiguo
Antes de la v2, `scorm_api.js` guardaba `JSON.stringify(STATE)` tal cual
(por ids). Si `decode()` recibe un string que no empieza por `"2|"`, intenta
`JSON.parse` directamente: como ese formato ya tenía el shape exacto de
`STATE`, la migración es un simple `JSON.parse` con valores por defecto para
las claves que falten — sin pérdida de progreso.

## Verificación
`scripts/test-state-codec.ts` (`npx tsx scripts/test-state-codec.ts`) comprueba,
contra el curso demo (`sample-course.ts`, que cubre los 23 tipos de
interacción): el troceado ciego, el round-trip completo por tipo, la
migración del formato antiguo, el descarte seguro ante huella desconocida, el
remapeo real (reordenar/insertar/eliminar pantallas e interacciones, cambiar
el tipo de una interacción) y que el curso demo con **todo** el progreso
guardado cabe muy por debajo de 4096 caracteres. También comprueba que todo
`InteractionType` del esquema tiene codec propio en `TYPE_CODECS`.
