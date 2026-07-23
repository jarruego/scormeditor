# Marcas de autoría en el documento fuente

Complementa `contrato-course-json.md` (referencia normativa) y
`guia-diseno-interacciones.md` (criterio pedagógico automático). Aquí se define una
capa **opcional y aditiva**: el autor del documento (Word/PDF/página de Moodle) puede
marcar directamente en su texto qué quiere y dónde, sin tocar el criterio automático
del resto del documento. Si el documento no trae ninguna marca, el comportamiento es
**exactamente el actual**: todo se decide con el criterio automático de
`guia-diseno-interacciones.md`.

Hay **dos familias** de marca, con sintaxis idéntica pero función distinta:

- **Marca de corte** (`{{diapositiva}}…{{/diapositiva}}`, §2): fija el **contenido
  exacto de una pantalla**. El autor decide dónde empieza y acaba, y el GPT no puede
  ni partirla ni fusionarla con texto vecino.
- **Marcas de interactividad** (`{{acordeon}}`, `{{opcion_unica}}`… §3): fijan **qué
  tipo de interactividad** debe salir de un bloque, sin decidir por sí solas los
  límites de la pantalla que la contiene (eso lo sigue decidiendo el criterio
  automático, salvo que estén anidadas dentro de una marca de corte, §4).

## 1. Sintaxis común

Un bloque marcado se delimita así, con el **alias** entre llaves dobles:

```
{{alias}}
texto del bloque
{{/alias}}
```

- El cierre debe repetir el mismo alias (`{{/alias}}`). Si el alias de cierre no
  coincide, o falta el cierre, cierra el bloque en el siguiente encabezado/salto de
  sección y añade un `editor_notes` pidiendo que se revise ese punto del documento.
- Apertura con nota libre para el GPT: `{{alias: nota breve}}` (p. ej.
  `{{acordeon: agrupar por región}}`). La nota es una instrucción adicional, no
  cambia el tipo ni el comportamiento descrito aquí.
- Alias no reconocido o con typo: intenta el match más cercano (¿es `diapositiva` o es
  de la tabla de interactividad, §3?); si no hay ninguno razonable, trátalo como
  `{{interactividad}}` genérica y anota el alias original tal cual apareció en
  `editor_notes`.
- Dentro de la marca vale exactamente el mismo markdown ligero que en cualquier otro
  bloque de origen (negrita, enlaces, listas): no cambia nada de la Regla Nº1.
- Reglas de anidamiento entre familias: ver §4.

## 2. Marca de corte: `{{diapositiva}}` (contenido exacto de una pantalla)

```
{{diapositiva}}
todo este texto, tal cual, es UNA pantalla — ni se parte ni se fusiona
{{/diapositiva}}
```

- El bloque marcado se convierte en el `student_text` **íntegro** de **una sola**
  pantalla: el GPT no aplica sobre él ni el criterio de «unidad de sentido» (cambio de
  intención pedagógica), ni el de longitud (~800 caracteres), ni ningún otro criterio
  de troceo o fusión automático. Ni una coma se mueve fuera del bloque marcado, ni
  entra contenido vecino no marcado dentro de él.
- El GPT sigue redactando el `title` de esa pantalla (2-6 palabras, como siempre): la
  marca no fija el título, solo el cuerpo.
- **El documento NO tiene que estar cubierto de marcas de corte.** Puede no haber
  ninguna (comportamiento 100% automático), una suelta en medio de un tema, o varias:
  cada `{{diapositiva}}` es una isla fija; todo lo que quede **fuera** de las marcas de
  corte se sigue segmentando con el criterio automático de siempre, tanto antes como
  después de cada bloque fijo.
- **La marca manda siempre**, incluso sobre reglas de estructura normalmente estrictas
  del contrato/guía (p. ej. «una evaluable nunca comparte pantalla con teoría»,
  «texto+imagen+interacción nunca en la misma pantalla»): si el bloque marcado las
  incumple, se genera **tal cual** de todos modos — es una decisión editorial del
  autor, no un error de segmentación del GPT. Dejar constancia SIEMPRE en
  `editor_notes` de qué regla se saltó y por qué (porque el bloque venía marcado), para
  que quede documentado y revisable.
- Motivo de esta marca: evitar que el GPT trocee o recomponga a su criterio un
  contenido que el autor ya ha decidido que debe leerse de una sola vez (p. ej. una
  instrucción legal, una lista que pierde sentido partida, un texto con un formato
  interno delicado).

## 3. Marcas de interactividad: catálogo de alias → tipo interno

**Informativas** (no puntúan; `scored: false`):

| Alias | `type` |
|---|---|
| `acordeon` | `accordion` |
| `pestañas` | `tabs` |
| `tarjetas_volteables` | `flip_cards` |
| `linea_tiempo` | `timeline` |
| `tarjetas_imagen` | `image_cards` (deja `image` vacío + `editor_note`: las imágenes las aporta el autor después) |

**Evaluables** (checkpoint, `scored: true`):

| Alias | `type` |
|---|---|
| `opcion_unica` | `single_choice` |
| `verdadero_falso` | `true_false` |
| `huecos` | `fill_blanks` |
| `parejas` | `match_pairs` |
| `clasificar` | `classification` |
| `ordenar` | `sort_steps` |
| `decision` | `scenario_decision` |
| `caso_practico` | `case_practice` |

**Abierta** (sin puntuar, ver «De reflexión pasiva a actividad corregible» de la
guía): `reflexion` → pantalla `reflection`, o `scenario_decision`/`case_practice` si
el propio contenido marcado admite una respuesta defendible o una rúbrica.

**Lúdicas de cierre** (`scored: false` u opcional según tipo):

| Alias | `type` |
|---|---|
| `tarjetas_repaso` | `flashcards` |
| `sopa_letras` | `word_search` |
| `crucigrama` | `crossword` |
| `rosco` | `az_quiz` |

**Genéricas** (el autor fija el lugar; el GPT elige el tipo exacto dentro de la
familia según la forma del bloque, tabla de `guia-diseno-interacciones.md`):

| Alias | Familia |
|---|---|
| `interactividad` | informativa |
| `evaluacion` | evaluable |
| `cierre` | lúdica |

**Vetadas — el GPT las reconoce pero NUNCA las genera** (reservadas al editor
humano, ver contrato §6 y `guia-diseno-interacciones.md`): `puntos_calientes`
(`hotspots`), `antes_despues` (`before_after`), `imagen_oculta` (`hidden_image`),
`rompecabezas` (`puzzle`), `video_interactivo` (`video`), `codigo_incrustado`
(`html_embed`). Si el documento marca una de estas: **no generes interacción**, deja
el texto como pantalla normal (con su `visual_resource` si aplica) y añade un
`editor_notes` pidiendo que se añada a mano en SCORMEditor. No cuentan para el ritmo
del §6.

El texto marcado con cualquiera de estos alias **desaparece como prosa corrida** de
`student_text`: se transforma en la interactividad indicada. Igual que con las
interactividades automáticas, el texto que usan sus ítems va también **duplicado en
`transcript`** (nada se pierde para el cálculo de cobertura del ratio ≥0.95).

## 4. Anidamiento entre las dos familias

- **`{{diapositiva}}` puede contener, anidada dentro, COMO MUCHO una marca de
  interactividad** (§3) — el esquema solo admite un `interaction` por pantalla. Esa
  interactividad se convierte en el `interaction` de la pantalla fija; cualquier texto
  del bloque de corte que quede fuera de la marca anidada va a `student_text` tal
  cual (introducción, desarrollo…), sin recortarlo ni resumirlo.
  ```
  {{diapositiva}}
  Los extintores se clasifican según el tipo de fuego para el que están indicados.

  {{acordeon}}
  ### Extintor de agua
  Fuegos de materiales sólidos (clase A): madera, papel, tejidos.

  ### Extintor de CO2
  Fuegos eléctricos y de líquidos inflamables (clase B/C) sin dejar residuo.
  {{/acordeon}}
  {{/diapositiva}}
  ```
  produce una única pantalla con el párrafo introductorio + el `accordion` como su
  interacción — el GPT no la separa en dos pantallas aunque su criterio automático
  normalmente lo haría (informativa que acompaña a un párrafo de intro extenso).
- **Dos o más marcas de interactividad anidadas dentro de la misma `{{diapositiva}}`**:
  el esquema no lo permite (una pantalla, un `interaction`). Se honra la **primera**
  como interacción de la pantalla fija; a partir de la segunda, ese contenido se saca
  y se trata como una pantalla automática normal inmediatamente después (ya no fija),
  con un `editor_notes` explicando que se dividió por el límite del esquema, no por
  criterio propio.
- **Una marca de interactividad NUNCA contiene una `{{diapositiva}}` anidada dentro**
  (una pantalla no cabe dentro de una interacción): si aparece, ignora esos
  delimitadores como texto literal dentro de la interactividad y anótalo en
  `editor_notes`.
- **`{{diapositiva}}` no se anida dentro de otra `{{diapositiva}}`**: si aparece,
  la interior se ignora como texto literal (queda dentro de la exterior) y se anota.
- Dos marcas de interactividad anidadas entre sí (fuera de un corte, `{{acordeon}}`
  con un `{{opcion_unica}}` dentro, etc.): tampoco válido: la interior gana, la
  exterior se recorta a lo que quede fuera, con `editor_notes`.

## 5. Mini-sintaxis opcional dentro de una marca de interactividad (contenido literal)

Por defecto, dentro de una marca evaluable el GPT **redacta** la pregunta/opciones/
feedback a partir del bloque marcado, igual que hace con un checkpoint automático (el
autor solo decide tipo y lugar). Si el autor **ya** escribe el contenido en un formato
reconocible, el GPT lo usa **literal** en vez de inventarlo:

- `{{opcion_unica}}`/`{{decision}}`: una línea de enunciado + opciones en líneas `- `;
  la opción correcta lleva `*` delante (`- *CO2`). Sin `*`, el GPT decide la correcta
  por el contenido.
- `{{verdadero_falso}}`: el enunciado, y opcionalmente `(V)`/`(F)` al final para fijar
  la respuesta; si no está, el GPT la decide.
- `{{parejas}}`/`{{clasificar}}`: líneas `término → correspondencia` (una por línea);
  sin ese formato, el GPT arma las parejas/categorías del bloque.
- `{{ordenar}}`: líneas `- ` ya en el orden correcto (el orden de escritura ES la
  respuesta).
- `{{huecos}}`: si el autor ya marca la palabra a ocultar con `[[palabra]]` (mismo
  marcador que usa el propio `course.json` para huecos, contrato §6), el GPT respeta
  esos huecos tal cual; si no hay ninguno, elige términos clave del bloque como
  siempre.

Si el bloque no sigue ninguna de estas convenciones, se comporta exactamente como un
checkpoint automático: el GPT redacta todo a partir del texto marcado.

## 6. Cómo conviven las marcas con el ritmo automático (aditivo)

1. **Antes de montar el guion**, escanea el texto extraído y haz un inventario de
   marcas: cuántas hay, de qué alias (corte o interactividad), y en qué punto del
   documento (igual en espíritu al inventario de contenido de
   `flujo-factoria-unidades.md`).
2. Cada marca ocupa su **fila fija** en el guion (§ de `guia-diseno-interacciones.md`
   «El guion de pantallas», paso 0): tipo y/o límites ya decididos, no por la tabla de
   «forma del bloque fuente» — esa tabla solo decide en las filas SIN marca.
3. Con las filas fijas ya colocadas, aplica el **chequeo de ritmo de siempre** sobre
   el guion completo (marcadas + resto): informativas ~1 de cada 3-4 pantallas de
   desarrollo, checkpoints cada 4-5. Las marcas **cuentan** para ese ritmo (una
   `{{acordeon}}` ya satisface el hueco de informativa de su tramo; una
   `{{diapositiva}}` sin interactividad anidada cuenta como pantalla de solo texto a
   efectos del «máx. 3 seguidas»). Solo se **añaden** automáticas en los tramos que,
   con las marcas puestas, sigan incumpliendo el ritmo — nunca DENTRO de una
   `{{diapositiva}}`, solo antes o después de ella.
4. **El documento manda por encima del límite aproximado**: si un tramo trae más
   marcas de las que el ritmo habitual pediría (p. ej. varias evaluables seguidas, o
   varias `{{diapositiva}}` de solo texto seguidas), respétalas todas — no se recortan
   ni se espacian marcas para «no pasarse». El límite aproximado
   (`referencia-rapida.md`) solo rige el relleno automático.
5. Las marcas de tipo **vetado** (§3) no cuentan para el ritmo: no generan
   interacción real, así que ese tramo sigue necesitando su informativa/checkpoint
   automático si corresponde.
6. Documento sin ninguna marca → el paso 1 no encuentra nada y el resto del flujo es
   idéntico al actual.

## 7. Ejemplos

**Solo corte, sin interactividad** — evita que el GPT reparta este párrafo en dos
pantallas o lo fusione con el contenido vecino:

```
{{diapositiva}}
Antes de manipular cualquier extintor, comprueba SIEMPRE que el precinto y el
manómetro están en la zona verde. Un extintor fuera de rango de presión, aunque
parezca íntegro, puede no funcionar cuando se necesite.
{{/diapositiva}}
```

**Corte con interactividad anidada** — una sola pantalla con intro + accordion +,
en la siguiente pantalla (ya no fija), un checkpoint con la respuesta literal:

```
{{diapositiva}}
Los extintores se clasifican según el tipo de fuego para el que están indicados.

{{acordeon}}
### Extintor de agua
Fuegos de materiales sólidos (clase A): madera, papel, tejidos.

### Extintor de CO2
Fuegos eléctricos y de líquidos inflamables (clase B/C) sin dejar residuo.

### Extintor de polvo ABC
Fuegos de las clases A, B y C; es el más polivalente.
{{/acordeon}}
{{/diapositiva}}

{{opcion_unica: usar el bloque anterior como contexto}}
¿Qué extintor se usa en un incendio eléctrico?
- Extintor de agua
- *Extintor de CO2
- Manguera de riego
{{/opcion_unica}}
```

Produce: una pantalla fija con el párrafo introductorio y el `accordion` de 3 ítems
como interacción (tal como el autor la delimitó, sin partirla), y la siguiente
pantalla (mismo `title`, ya automática) con el checkpoint `single_choice` cuya opción
correcta es literal («Extintor de CO2»).

## 8. Checklist

Añade a `quality_checklist`: `"Marcas de interactividad del documento respetadas":
true` cuando el documento traía alguna marca (de corte y/o de interactividad) y se
han seguido todas (límites exactos, tipo y contenido literal si lo había). Cualquier
marca que haya caído en un caso especial (vetada, sin cierre, alias no reconocido,
anidamiento no válido, regla de estructura saltada por una `{{diapositiva}}`) debe
quedar reflejada en `editor_notes`, no solo en el checklist.
