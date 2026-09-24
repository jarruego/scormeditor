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

## Protección de tamaño (`encodeWithBudget`)

Incluso con el formato v2, un curso lo bastante grande —o con mucho detalle
acumulado en interacciones tipo crucigrama/rosco/HTML a medida— puede seguir
sin caber en 4096. `app.js` (`persist()`) no llama a `StateCodec.encode()`
directamente: llama a `StateCodec.encodeWithBudget(STATE, COURSE, 4096)`, que
prueba niveles de degradación crecientes (`degradeDetail` en
`state_codec.js`) hasta que el string quepa. **Nunca se toca `visited`,
`results`, `attempts` ni `finalScore`** — solo se recorta detalle de
interacciones que ya es redundante para el comportamiento del runtime:

1. **Interacciones exploratorias sin nota ya completadas** (`accordion`,
   `tabs`, `flip_cards`, `timeline`, `image_cards`, `case_practice`): su
   detalle (qué se ha abierto/marcado) es redundante una vez completas — si
   no estuviera todo visto/marcado, no estarían completas.
2. **Respuestas escritas ya acertadas del todo** en `crossword` y `az_quiz`
   (las dos interacciones con texto libre real, ver más abajo): el texto en
   sí no hace falta para nada — ni se vuelve a mostrar al alumno, ni afecta
   al bloqueo por intentos, que lee `correct`/`attempts` directamente. Se
   conservan esos dos campos (vacíos si no aplican) para que la interacción
   siga apareciendo bloqueada al restaurar, en vez de "sin responder".
   (El encargo original hablaba de "huecos/crucigramas"; `fill_blanks` ya es
   compacto por índice —son `<select>`, no texto libre— así que el par
   equivalente de interacciones con texto realmente libre es `crossword` y
   `az_quiz`, y son las que se degradan aquí.)
3. **`data` de `html_embed` ya completados**: se pierde el estado interno del
   interactivo del autor (`MeEmbed.state`), pero `done` —y por tanto el
   bloqueo de navegación— se conserva intacto.

Si ni con la degradación máxima cabe, `persist()` **no escribe nada**: es
preferible conservar la última escritura válida del LMS que guardar un
`suspend_data` cortado o corrupto. Se registra un aviso en consola con el
tamaño y un desglose por segmento (`console.warn`, `budget.breakdown`).

Si `LMSSetValue` devuelve error (por cualquier motivo, no solo tamaño),
`scorm_api.js` ya lo registra con `LMSGetLastError`/`LMSGetErrorString` en su
`set()` genérico — no es específico de `suspend_data`.

## Medidor del editor (`estimateSuspendSize`)

`StateCodec.estimateSuspendSize(course)` simula el **peor caso plausible**
(todas las pantallas vistas, toda interacción resuelta con el detalle más
grande que su tipo permite, todas las preguntas del test final respondidas)
y lo pasa por el mismo `encode()` (sin degradar: el medidor avisa del tamaño
real del contenido, la degradación de arriba es la red de seguridad en
tiempo de ejecución, no la referencia para diseñar el curso). Devuelve
`{ worstCase, limit: 4096, breakdown, perInteraction, missingEstimator }`.

La mayoría de tipos ya están acotados por su propio codec compacto (índices,
permutaciones, máscaras de bits: el "peor caso" es básicamente su tamaño
real, no depende de lo que escriba el alumno). Las excepciones son las dos
únicas interacciones con texto libre real — `html_embed` y `az_quiz` — y para
ambas **el runtime garantiza ASCII**, así que su estimación no lleva NINGÚN
factor de escape (antes lo llevaba, asumiendo el peor caso de contenido no
ASCII; sobrestimaba el peor caso real varias veces):

- **`html_embed`**: `MeEmbed.saveState()` (`interactions.js`) rechaza, con
  `console.warn`, cualquier JSON con caracteres fuera de ASCII imprimible
  (0x20-0x7E) o con el carácter `~` — la carcasa vuelve a comprobarlo al
  recibir el `postMessage`, nunca se fía del iframe. El peor caso es
  exactamente `state_max` caracteres ASCII.
- **`az_quiz`**: desde que se normaliza lo que se guarda (ver abajo), una
  respuesta correcta no guarda texto y una incorrecta guarda
  `normLetters(dado)` recortado a su `maxlength`, con la Ñ (lo único no-ASCII
  que deja `normLetters`) sustituida por N — el peor caso es todas
  incorrectas al límite de su `maxlength` (`Math.min(120, Math.max(40,
  respuesta.length + 10))`, nunca por debajo de la propia respuesta
  correcta).
- **`crossword`**: sigue siendo la excepción con cota aproximada, no exacta —
  no se reproduce el algoritmo de colocación (Fase 1), así que se usa una
  cota honesta: la suma de las longitudes de sus palabras es un límite
  superior real del número de casillas (los cruces solo pueden REDUCIR ese
  número).

Un tipo sin entrada en `worstCaseDetail` (futuro, sin estimador todavía) usa
una cota conservadora fija y se lista en `missingEstimator`, para avisar en
vez de subestimar en silencio.

**`az_quiz`, lo que cambia al guardar** (`interactions.js`): una respuesta
correcta ya no se guarda en absoluto (`{correct: true}` — nunca se reexpone
al alumno, el feedback siempre usa la respuesta correcta del propio
contenido); una incorrecta guarda su forma normalizada y ASCII, recortada a
`maxlength` (`{given, correct: false}`). Un `suspend_data` del formato
anterior (texto en bruto, acierto derivado por comparación) se sigue leyendo
igual — se reescribe en el nuevo formato en el siguiente guardado. La
distinción usa un marcador (`'~_'`) que `asciiEscape()` nunca produce sobre
texto real (tras un `~` literal siempre escribe 4 dígitos hex en minúscula),
así que es indistinguible del formato antiguo sin ambigüedad.

**Desglose por interacción** (`perInteraction`, ordenado de mayor a menor):
`{ id, type, screenId, screenTitle, chars, motivo }` — exactamente lo que
esa interacción aporta al total (sumarlo todo junto con
visited/finalAnswers/attempts/finalScore da el mismo `worstCase`), con un
motivo legible («html_embed: state_max 30», «az_quiz: 5 preguntas × hasta 40
caracteres», «crossword: 58 casillas»…). Alimenta la lista «Lo que más
consume» del medidor (con enlace a la pantalla) y el badge «Actual: N» que
`CourseTree` pinta junto a cada interacción en el árbol.

**UI** (`SuspendSizeIndicator`, siempre visible en la barra de herramientas):
«Memoria: 1.180 / 4.096 (29%)», recalculado con debounce al cambiar el curso;
verde por debajo del 75%, ámbar 75-100%, rojo por encima del 100%. Al
desplegarlo, muestra el desglose por segmento y las 5 interacciones que más
consumen. **Validador** (mismo `estimateSuspendSize`, así que siempre
coincide con el medidor): aviso `SUSPEND_NEAR_LIMIT` desde el 75%, error
`SUSPEND_OVER_LIMIT` por encima del 100%, e informativo
`EMBED_STATE_MAX_DEFAULT` si un `html_embed` no fija `state_max` explícito
(usa 100 por defecto). Exportar con `SUSPEND_OVER_LIMIT` activo pide
confirmación explícita (`Toolbar.tsx`).

## Migración desde el formato antiguo
Antes de la v2, `scorm_api.js` guardaba `JSON.stringify(STATE)` tal cual
(por ids). Si `decode()` recibe un string que no empieza por `"2|"`, intenta
`JSON.parse` directamente: como ese formato ya tenía el shape exacto de
`STATE`, la migración es un simple `JSON.parse` con valores por defecto para
las claves que falten — sin pérdida de progreso.

## Verificación
`scripts/test-state-codec.ts` (`npx tsx scripts/test-state-codec.ts`) comprueba,
contra el curso demo (`sample-course.ts`, que cubre los 23 tipos de
interacción):
- Troceado ciego y round-trip completo por tipo (incluidas las interacciones
  sin resolver todavía).
- Migración del formato antiguo (JSON por ids), sin pérdida.
- Descarte seguro ante huella desconocida (sin entrada en `layouts`).
- Remapeo real contra `layouts`: reordenar e insertar pantallas sin perder
  nada; eliminar una pantalla/interacción descarta solo lo suyo; eliminar o
  insertar una pregunta del test final igual; cambiar el tipo de una
  interacción descarta su resultado Y su detalle.
- Config de interacción cambiada con la MISMA huella (mismo id y tipo, config
  distinta — no pasa por `layouts`, es la validación por tipo de la Fase 1):
  el detalle incompatible se descarta sin afectar a nada más.
- Exportar dos veces sin cambios no duplica el historial; una estructura
  distinta sí añade una entrada.
- Degradación por tamaño: un estado inflado a propósito hasta no caber ni de
  lejos en 4096 se degrada en el orden documentado hasta caber, sin tocar
  resultados.
- Un curso sintético de 150 pantallas y 54 interacciones (la proporción del
  problema original: 20 exploratorias, 15 huecos, 10 elección, 5 ordenar, 4
  HTML a medida) da un peor caso por debajo de 1500 caracteres — el problema
  original eran ~10.000 caracteres frente al límite de 4096.
- `estimateSuspendSize` del curso demo no señala ningún tipo sin estimador y
  da un peor caso mayor o igual que su progreso real completo sin degradar.
- Todo `InteractionType` del esquema tiene codec y estimador propios en
  `TYPE_CODECS`/`worstCaseDetail`.
- `html_embed` con `state_max` 0/30/100 da un peor caso de unos pocos
  caracteres / ~35 / ~105; el shim `MeEmbed` REAL (extraído del HTML que
  genera `interactions.js` y evaluado, no reimplementado) acepta ASCII
  dentro de presupuesto y rechaza tildes, `~` y lo que se pasa de tamaño.
- `az_quiz`: una respuesta correcta no guarda texto, una incorrecta guarda su
  forma normalizada, y un `suspend_data` del formato anterior (sin
  normalizar) se sigue leyendo y reanudando bien.
- Invariante por tipo: un estado real alcanzable nunca pesa más que la
  estimación de peor caso; para `html_embed` y `az_quiz` (los dos únicos con
  texto libre real) la estimación no se pasa de un 10% sobre el mayor estado
  real alcanzable — de hecho coincide con un 2-4% de margen, porque ya no
  lleva ningún factor de escape.
