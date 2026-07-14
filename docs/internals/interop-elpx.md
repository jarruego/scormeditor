# Exportador `.elpx` (eXeLearning)

Herramienta **aparte y opcional**: exporta el curso a un paquete `.elpx` para
seguir editándolo en **eXeLearning ≥ 4.0.1**. Vive aislada en `src/interop/elpx/`
y se carga con `import()` dinámico desde el menú **Archivo » Exportar a
eXeLearning (.elpx)** (`Toolbar.tsx`, `onExportElpx`), así que su código —con el
`content.dtd` y los textos de interfaz de los juegos incrustados— no pesa en el
bundle principal si no se usa. **No toca** el runtime, ni el esquema de
`course.json`, ni el flujo de export SCORM.

## Qué produce
Un ZIP `.elpx` **mínimo pero válido** para importar: `content.xml` (formato ODE
2.0) + `content.dtd` + `content/resources/` con los binarios referenciados. Es
cuanto necesita eXe para importar y seguir editando; `theme/`, `libs/`,
`index.html`, `screenshot.png` solo hacen falta para *visualizar* el paquete sin
abrirlo en eXe, y por eso se omiten (el validador oficial solo avisa de ello, no
es error). El resultado pasa el
[elp-validator oficial](https://github.com/ateeducacion/elp-validator) con **cero
errores** (probado con el proyecto demo completo: 57 páginas, 80 componentes,
todos los tipos de interacción).

## Formato ODE 2.0 (lo esencial)
- Raíz `<!DOCTYPE ode SYSTEM "content.dtd">` + `<ode
  xmlns="http://www.intef.es/xsd/ode" version="2.0">`; hijos **en orden**:
  `odeResources` (odeId/odeVersionId con patrón `YYYYMMDDHHmmss`+6 alfanum.
  mayúsculas, eXeVersion), `odeProperties` (pp_title, pp_lang…),
  `odeNavStructures`.
- Jerarquía: **página** (`odeNavStructure`, lista plana con `odeParentPageId`) →
  **bloque** (`odePagStructure`) → **iDevice** (`odeComponent` con
  `odeIdeviceTypeName` + `htmlView` + `jsonProperties`, ambos en CDATA).
- Recursos: layout **plano** en `content/resources/<fichero>`, referenciados en el
  HTML como `{{context_path}}/<fichero>` (el placeholder absorbe la ruta).
- **Juegos**: su estado va en un `<div class="<tipo>-DataGame js-hidden">` dentro
  del `htmlView`, en dos variantes: **cifrada** (JSON → XOR `0x92` por carácter →
  `escape()`; word-search, crossword, complete, quick-questions) o **plana** (JSON
  tal cual; relate, flipcards, beforeafter). Ver `datagame.ts`.

## Mapa de la conversión
Cada **pantalla** del editor → una **página** eXe (módulo→página raíz,
unidad→subpágina, pantalla→subpágina de la unidad; las **pantallas propias del
módulo** cuelgan directamente del nodo módulo, ordenadas antes de sus unidades)
con un bloque de contenido (iDevice `text` con el `student_text` convertido a
HTML + el recurso visual) y, si la hay, un bloque con la interacción (helper
`addScreenPage`, común a pantallas de módulo y de unidad). El **test final** va
como página raíz con una pregunta `quick-questions` por bloque; **glosario** y
**bibliografía**, como páginas raíz de texto.

`mapping.ts` (`NATIVE_IDEVICE`) decide iDevice por tipo de interacción:

| Interacción del editor | iDevice eXe | Estrategia |
|---|---|---|
| `word_search` | `word-search` | nativo (DataGame cifrado) |
| `crossword` | `crossword` | nativo (cifrado) |
| `fill_blanks` | `complete` | nativo (cifrado); huecos `[[x]]` → `@@x|distractores@@` |
| `single_choice`, `true_false`, `scenario_decision` | `quick-questions` | nativo (cifrado); `solution` es 1-based |
| `match_pairs` | `relate` | nativo (plano); label de `config.groups` ↔ `text` de la opción |
| `flip_cards`, `flashcards` | `flipcards` | nativo (plano); front→`eText`, back→`eTextBk` |
| `before_after` | `beforeafter` | nativo (plano); 2 imágenes url/urlBk |
| accordion, tabs, timeline, image_cards, classification, sort_steps, az_quiz, hidden_image, puzzle, hotspots, case_practice, video, html_embed, progress_report | `text` | **degradación**: el contenido se vuelca a HTML legible y editable (títulos, ítems, preguntas con la correcta marcada, imágenes…). No se pierde contenido |

Lo que **no** viaja a eXe (lo gestiona de otro modo): la nota SCORM, el gating,
los intentos, el peso de la nota. Se avisa en el resumen de la exportación.

Los `msgs` (textos de interfaz i18n de cada juego, `gameMessages.ts`) y los flags
por defecto de los DataGame se tomaron **verbatim** de un `.elpx` real (corpus
«Manual de eXeLearning 3.0» del repo oficial), no se inventan.

## Ficheros
- `index.ts` — API pública: `downloadElpx(course, assets)` (genera y descarga) y
  `buildElpx` (devuelve `{ blob, summary, filename }`).
- `exportElpx.ts` — orquestador: recorre el curso, resuelve/copia assets, arma
  páginas y ensambla el ZIP. Produce un `ExportSummary` (páginas, componentes,
  mapeo, notas de reconversión) que el menú muestra al terminar.
- `mapping.ts` — tabla tipo→iDevice y `convertInteraction`.
- `idevices.ts` — constructores de cada iDevice (nativos + degradación a `text`).
- `contentXml.ts` — serialización del `content.xml` (páginas/bloques/componentes).
- `mdToHtml.ts` — markdown ligero → HTML (port del `renderer.js` de la carcasa,
  misma invariante anti-XSS: escapar antes, formatear después; los callouts van a
  cajas HTML con filete de color).
- `datagame.ts` — cifrado/plano de los DataGame. `ids.ts` — IDs deterministas
  estilo eXe. `xml.ts` — escapado y CDATA. `contentDtd.ts` / `gameMessages.ts` —
  datos incrustados del formato de destino.

## Reproducibilidad y pruebas
Los IDs se derivan **deterministas** de los ids estables del editor (`ids.ts`), de
modo que reexportar el mismo curso produce el mismo `.elpx` (mismo criterio que
los tableros sembrados de la carcasa). La verificación funcional (bundle del
módulo con esbuild + `elp-validator` en Node sobre el proyecto demo) confirma cero
errores y el round-trip de cada DataGame; el guion de prueba y el corpus quedaron
en el scratchpad de trabajo, no en el repo.

> Diana **única**: eXeLearning ≥ 4.0.1 (formato `.elpx`). El `.elp` legacy 2.x no
> se soporta (eXe lo migra solo). El **importador** `.elpx → .scormproj` no está
> hecho: es trabajo futuro (lo laborioso sería HTML de TinyMCE → markdown ligero y
> el troceo de páginas multi-iDevice).
