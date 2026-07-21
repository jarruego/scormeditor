# Importador de backups Moodle → `.scormproj`

Convierte un backup Moodle (formato `moodle2`, el que produce «Copia de
seguridad» en un curso) a uno o varios `.scormproj` de SCORMEditor, **sin
pasar por el flujo GPT+PDF** (`docs/internals/ingesta-gpt.md`). Pensado para
cursos que solo existen en Moodle (no hay PDF/Word fuente) y cuyas actividades
relevantes son **lecciones** (`mod_lesson`, páginas de contenido simple) y
**cuestionarios** (`mod_quiz`, preguntas multichoice/truefalse).

## Qué NO hace
- No toca ningún otro tipo de actividad (foro, etiqueta, página, recurso,
  certificado…): se ignoran.
- No soporta lecciones con ramificación/preguntas embebidas (`qtype` distinto
  de 20 en Moodle Lesson) ni preguntas de quiz de tipo distinto a
  multichoice/truefalse — si el backup las tiene, hay que extenderlo primero
  (ver «Limitaciones» más abajo).
- No rediseña pedagógicamente el contenido: no genera portada/objetivos/
  recorrido/resumen ni varía el tipo de interacción por pantalla, a diferencia
  del flujo GPT+PDF. Es un mapeo **literal**, página de lección → pantalla
  `content`, pregunta de quiz → `QuizQuestion` del test final.

## Uso

```bash
# 1) Descomprimir el backup (tar.gz o mbz-como-zip) a una carpeta:
tar -xzf Copia-curso.tar.gz -C carpeta-backup/

# 2) Generar los .scormproj (uno por sección de Moodle con lecciones + quiz):
node scripts/moodle-import/moodle-to-scormproj.mjs carpeta-backup/ carpeta-salida/ --prefix miprefijo

# 3) (opcional pero recomendado) validar contra el schema Zod real del editor:
npx tsx scripts/moodle-import/validate-scormproj.mjs carpeta-salida/
```

No requiere descomprimir con una herramienta concreta: solo que
`carpeta-backup/` tenga la estructura estándar de un backup moodle2
(`moodle_backup.xml`, `activities/`, `sections/`, `files/`, `files.xml`,
`questions.xml`).

## Convención de salida (1 `.scormproj` por sección de Moodle)

Replica la convención ya usada a mano en los `.scormproj` del flujo GPT+PDF
para que ambos catálogos convivan sin choque de estilo:

- Cada **sección** de Moodle con ≥1 lección y ≥1 quiz se auto-detecta como
  «Unidad» → 1 SCO independiente (`course.id` = `<prefix>-u<NN>-<slug>`,
  `scorm.identifier` en MAYÚSCULAS, `score_source: "final_test"`).
- Cada **lección** de esa sección → una `Unit` del editor (`id: u<NN>_t<MM>`),
  con sus páginas de contenido en el **orden real de Moodle**
  (`<sequence>` de `section.xml`, no el título "Tema N").
- Cada **página** de la lección (qtype 20, contenido simple) → una pantalla
  `content` (`id: sNNN` correlativo dentro del proyecto).
- El **quiz** de la sección → `assessments.final_test` (preguntas resueltas
  contra el banco `questions.xml` por `questionbankentryid`, en orden de
  `slot`); nunca `assessments.unit_tests[]` (mismo criterio que el contrato
  GPT: «el test calificable solo en `final_test`»).
- Los títulos de lección/página con marca de trabajo interno
  (`(MODIFICAR)`, `(BORRAR)`, `(REVISAR)`, `(PENDIENTE)`) se limpian del
  título visible pero dejan rastro: `screen.status: "borrador"` +
  `editor_notes` — para no perder la señal de «esto está pendiente de
  revisión» sin ensuciar lo que vería el alumno.

## Imágenes
Se resuelven desde `files.xml` (`component: mod_lesson`, `filearea:
page_contents`, `itemid` = id interno de la página) al fichero físico
`files/<hash[0:2]>/<hash>`, deduplicadas por `contenthash` y renombradas
`assets/img/<slug>-<hash6>.<ext>`. Heurística de colocación (sin dato de
maquetación en el origen para decidir mejor):
- **1 imagen en la página** → `visual_resource` (recurso visual destacado,
  `layout: top`).
- **2+ imágenes** → todas quedan **inline** en `student_text` como
  `![alt](assets/img/...)`, en la posición donde aparecían en el HTML
  original.

`alt` no existe en el origen (Moodle lo deja vacío en las imágenes de
contenido): se usa el nombre de fichero como aproximación y
`accessibility.alt_text_ok` queda en `false` — el validador del editor lo
señalará como pendiente, correctamente.

## HTML → markdown ligero (`html-to-md.mjs`)
Cubre el subconjunto de etiquetas realmente presente en el corpus de origen
(`p`, `div.caja*`, `h4`, `strong/b`, `em/i`, `u`, `ul/li`, `br`, `a`, `img`,
`span` con estilos inline descartados). Decisiones:
- Colapsa los saltos de línea de maquetación manual del editor Atto de Moodle
  (el autor pulsaba Intro para no pasarse de ancho) a un espacio — si no, cada
  frase quedaba partida a mitad de palabra en el editor. Los saltos
  **con significado** (párrafo, `<br>`, lista) sí se conservan.
- `<div class="caja caja-COLOR">` → callout del editor o bloque personalizado,
  decidido por **(clase, título del `<h4>`)** contra las 9 combinaciones
  observadas en el contenido real de las 8 unidades (no en la lección
  plantilla, que solo trae relleno `xxxxxxx`): `Importante`→`important`,
  `¿Sabías que...?`→`fact`, `Actividad práctica`→`case`,
  `Reflexiona`/`Clave de Reflexión`/`Resolución propuesta`→`reflect`,
  `Referencias` (caja rosa)→bloque personalizado 📚. Cualquier combinación no
  vista cae a un bloque personalizado por color (aproximado, sin CSS de
  origen para calcarlo exacto).
- **Decisión deliberada de fidelidad, no de rediseño**: cuando una caja
  «Actividad práctica»/«Reflexiona» va seguida de su «Resolución propuesta» en
  la misma página, ambas quedan como texto visible (tal cual en Moodle) — el
  contrato GPT pediría mover la solución a `feedback.explanation` de una
  interacción oculta, pero eso es una decisión pedagógica que este conversor
  mecánico no toma por su cuenta.

## Validado contra
`Course.safeParse()` real (`src/schema/course.schema.ts`) vía
`validate-scormproj.mjs` — no es una aproximación del contrato, es el mismo
parser que usa el editor al abrir un proyecto.

## Limitaciones conocidas / próximos pasos si se reutiliza en otro curso
- Si el backup tiene lecciones con ramificación (Moodle Lesson con qtype
  distinto de 20: preguntas embebidas, saltos condicionales) el script las
  ignora silenciosamente en el conteo de páginas — falta añadir soporte o al
  menos un aviso explícito.
- **Preguntas de quiz de tipo distinto a multichoice/truefalse** (`match`,
  `shortanswer`, `essay`, `numerical`…) se **descartan con aviso explícito**
  en consola (tabla `⚠ N pregunta(s) de tipo no soportado, EXCLUIDAS`) —
  añádelas a mano en el editor tras importar. **Antes** (hasta jul 2026) no se
  filtraban: una pregunta `match` colaba un `single_choice` con `options: []`
  (sin respuesta correcta, inválida) — se detectó al probar contra un curso
  real («manipulador de alimentos») con preguntas de emparejar.
- Preguntas de quiz `multichoice` con `single: 0` (multi-respuesta) se
  mapean a `multiple_choice`, sin probar contra un caso real (el corpus de
  origen solo tenía `single: 1`).
- `objective` y `learning_objective` quedan vacíos: no hay dato fuente fiable
  en Moodle para inferirlos; a rellenar a mano en el editor tras importar.
- El mapeo de color de caja→callout está calibrado sobre el vocabulario de
  h4 del curso PAI; en un curso sin cajas de diseño (probado con
  «manipulador de alimentos»: 0 divs `caja-*`) simplemente no se activa, sin
  romper nada. En otro curso con otros rótulos, revisar/ampliar
  `CALLOUT_BY_TITLE` en `html-to-md.mjs`.
- **`mod_scorm`** (paquetes SCORM ya empaquetados y subidos como actividad
  Moodle, p. ej. un curso con «Tema 12» hecho de 4 SCORM sueltos en vez de
  lección+quiz): **fuera de alcance total**, ni el script ni `ingesta-moodle.md`
  lo tocan — la sección se excluye automáticamente (no tiene lesson+quiz). Esos
  paquetes ya son SCORM: hay que decidir aparte si se importan tal cual a
  Moodle/otro LMS o se rehacen.
- El nombre del curso (`course.source_document`, `source_refs[].doc`) se lee
  de `original_course_shortname`/`_fullname` en `moodle_backup.xml`
  (`parseCourseInfo`); `--course-name` lo sobreescribe. **Antes** (hasta
  jul 2026) tenía como *fallback* el literal `'PAI_2026'` hardcodeado del
  primer curso de prueba — pasaba desapercibido porque coincidía con ese
  curso; se detectó y corrigió al probar contra un curso distinto.
