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
  empaquetado el curso. Si no coincide con la huella actual, se descartan
  `visited`/`interactions`/`results`/`finalAnswers` (nunca se aplican datos
  posicionales a una estructura que no es la suya) pero se conservan
  `attempts` y `finalScore`, que no dependen de la posición. `decode()` ya
  acepta un tercer parámetro `layouts` (historial de estructuras publicadas)
  para sustituir ese descarte por un remapeo real cuando la estructura
  cambió mid-curso; de momento no se usa.
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
migración del formato antiguo, el descarte seguro ante huella desconocida, y
que el curso demo con **todo** el progreso guardado cabe muy por debajo de
4096 caracteres. También comprueba que todo `InteractionType` del esquema
tiene codec propio en `TYPE_CODECS`.
