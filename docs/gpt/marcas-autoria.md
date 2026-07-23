# Marcas de autoría en el documento fuente

Complementa `contrato-course-json.md` (referencia normativa) y
`guia-diseno-interacciones.md` (criterio pedagógico automático). Aquí se define una
capa **opcional y aditiva**: el autor del documento (Word/PDF/página de Moodle) puede
marcar directamente en su texto qué interactividad concreta quiere y dónde, sin tocar
el criterio automático del resto del documento. Si el documento no trae ninguna marca,
el comportamiento es **exactamente el actual**: todo se decide con el criterio
automático de `guia-diseno-interacciones.md`.

## 1. Sintaxis

Un bloque marcado se delimita así, con el **alias** (tabla §2) entre llaves dobles:

```
{{alias}}
texto que forma la interactividad
{{/alias}}
```

- El cierre debe repetir el mismo alias (`{{/alias}}`). Si el alias de cierre no
  coincide, o falta el cierre, cierra el bloque en el siguiente encabezado/salto de
  sección y añade un `editor_notes` pidiendo que se revise ese punto del documento.
- Apertura con nota libre para el GPT: `{{alias: nota breve}}` (p. ej.
  `{{acordeon: agrupar por región}}`). La nota es una instrucción adicional, no
  cambia el tipo.
- Alias no reconocido o con typo: intenta el match más cercano de la tabla §2; si no
  hay ninguno razonable, trátalo como `{{interactividad}}` genérica y anota el alias
  original tal cual apareció en `editor_notes`.
- Dos marcas anidadas (una dentro de otra): la interior gana, la exterior se recorta
  a lo que quede fuera y se anota en `editor_notes` (el esquema no admite interacción
  dentro de interacción).
- Dentro de la marca vale exactamente el mismo markdown ligero que en cualquier otro
  bloque de origen (negrita, enlaces, listas): no cambia nada de la Regla Nº1.
- El texto marcado **desaparece como prosa corrida** de `student_text`: se transforma
  en la interactividad indicada. Igual que con las interactividades automáticas, el
  texto que usan sus ítems va también **duplicado en `transcript`** (nada se pierde
  para el cálculo de cobertura del ratio ≥0.95).

## 2. Catálogo de alias → tipo interno

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
del §4.

## 3. Mini-sintaxis opcional dentro de la marca (contenido literal)

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

## 4. Cómo conviven las marcas con el ritmo automático (aditivo)

1. **Antes de montar el guion**, escanea el texto extraído y haz un inventario de
   marcas: cuántas hay, de qué alias, y en qué punto del documento (igual en espíritu
   al inventario de contenido de `flujo-factoria-unidades.md`).
2. Cada marca ocupa su **fila fija** en el guion (§ de `guia-diseno-interacciones.md`
   «El guion de pantallas»): tipo ya decidido, no por la tabla de «forma del bloque
   fuente» — esa tabla solo decide en las filas SIN marca.
3. Con las filas fijas ya colocadas, aplica el **chequeo de ritmo de siempre** sobre
   el guion completo (marcadas + resto): informativas ~1 de cada 3-4 pantallas de
   desarrollo, checkpoints cada 4-5. Las marcas **cuentan** para ese ritmo (una
   `{{acordeon}}` ya satisface el hueco de informativa de su tramo). Solo se **añaden**
   automáticas en los tramos que, con las marcas puestas, sigan incumpliendo el ritmo.
4. **El documento manda por encima del límite aproximado**: si un tramo trae más
   marcas de las que el ritmo habitual pediría (p. ej. varias evaluables seguidas),
   respétalas todas — no se recortan ni se espacian marcas para «no pasarse». El
   límite aproximado (`referencia-rapida.md`) solo rige el relleno automático.
5. Las marcas de tipo **vetado** (§2) no cuentan para el ritmo: no generan
   interacción real, así que ese tramo sigue necesitando su informativa/checkpoint
   automático si corresponde.
6. Documento sin ninguna marca → paso 1 no encuentra nada y el resto del flujo es
   idéntico al actual.

## 5. Ejemplo

Fragmento del documento de origen:

```
Los extintores se clasifican según el tipo de fuego para el que están indicados.

{{acordeon}}
### Extintor de agua
Fuegos de materiales sólidos (clase A): madera, papel, tejidos.

### Extintor de CO2
Fuegos eléctricos y de líquidos inflamables (clase B/C) sin dejar residuo.

### Extintor de polvo ABC
Fuegos de las clases A, B y C; es el más polivalente.
{{/acordeon}}

{{opcion_unica: usar el bloque anterior como contexto}}
¿Qué extintor se usa en un incendio eléctrico?
- Extintor de agua
- *Extintor de CO2
- Manguera de riego
{{/opcion_unica}}
```

Produce: una pantalla de desarrollo con el párrafo introductorio y un `accordion` de
3 ítems (uno por extintor, cuerpo = su párrafo), y la siguiente pantalla (mismo
`title`) con un checkpoint `single_choice` cuya opción correcta es literal
(«Extintor de CO2»), sin que el GPT tenga que inventarla.

## 6. Checklist

Añade a `quality_checklist`: `"Marcas de interactividad del documento respetadas":
true` cuando el documento traía alguna y se han seguido todas (tipo y contenido
literal si lo había). Si alguna marca cayó en un caso especial (vetada, sin cierre,
alias no reconocido), que quede reflejado en `editor_notes`, no solo en el checklist.
