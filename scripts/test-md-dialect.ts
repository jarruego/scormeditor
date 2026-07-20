/* =============================================================================
 * test-md-dialect.ts — Batería de round-trip del dialecto markdown del editor.
 * Ejecutar:  npx tsx scripts/test-md-dialect.ts
 *
 * Garantías que comprueba (la red de seguridad del editor WYSIWYG):
 *  1) CORPUS CANÓNICO: jsonToMd(mdToJson(x)) === x, byte a byte.
 *  2) IDEMPOTENCIA: una segunda pasada no cambia nada.
 *  3) EQUIVALENCIA DE RENDER: para TODOS los strings del proyecto demo,
 *     el mdToHtml REAL de la carcasa (evaluado desde src/runtime) produce el
 *     mismo HTML antes y después del round-trip. Si esto pasa, editar un texto
 *     con el nuevo editor no puede cambiar lo que ve el alumno.
 * ===========================================================================*/
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import vm from 'node:vm'
import JSZip from 'jszip'
import { mdToJson, jsonToMd } from '../src/text/mdDialect'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// --- mdToHtml real de la carcasa, evaluado en un sandbox -------------------
function loadRuntimeMdToHtml(): (s: string) => string {
  const windowObj: Record<string, unknown> = {}
  const ctx = vm.createContext({ window: windowObj })
  for (const f of ['interactions.js', 'renderer.js']) {
    const src = readFileSync(join(root, 'src', 'runtime', 'assets', 'js', f), 'utf8')
    vm.runInContext(src, ctx, { filename: f })
  }
  const renderer = windowObj.Renderer as { mdToHtml: (s: string) => string }
  if (!renderer?.mdToHtml) throw new Error('No se pudo cargar Renderer.mdToHtml del runtime')
  return renderer.mdToHtml
}

const roundtrip = (s: string) => jsonToMd(mdToJson(s))

let failures = 0
function fail(title: string, detail: string) {
  failures++
  console.error(`✗ ${title}\n${detail}\n`)
}

// --- 1) Corpus canónico: round-trip EXACTO ---------------------------------
const CANONICAL: string[] = [
  '',
  'Hola mundo',
  'Hola **mundo** y *cursiva*',
  '***negrita y cursiva***',
  '## Título\n### Subtítulo',
  'a\n\nb',
  'a\nb\nc',
  '- uno\n- dos\n- tres',
  '1. uno\n2. dos\n3. tres',
  '5. cinco\n6. seis',
  '3. tres\n5. cinco',
  '1. a\n1. b',
  '- lista\n\n1. numerada\n2. sigue',
  '[web](https://example.com) y [correo](mailto:a@b.com)',
  '**[enlace](https://x.example) en negrita**',
  '[**negrita** dentro](https://x.example)',
  '*a **b** c*',
  '![Foto|50](assets/img/x.png)',
  '![](assets/img/y.jpg)',
  '![externa](https://example.com/img.png)',
  '::: tip\nUn consejo\n:::',
  '::: warn\n- item uno\n- item dos\n:::',
  '::: custom | #6DC3C0 | 🎯 | Meta\nCuerpo **fuerte**\n:::',
  '::: custom | #F4C910 |  | \nCuerpo\n:::',
  '::: important\n## Dentro\nTexto\n![img](assets/img/z.png)\n:::',
  'Párrafo antes\n::: fact\n¿Sabías?\n:::\nPárrafo después',
  '**Título en negrita**:',
  'Texto con ::: en medio',
  ':::',
  '2 + 2 = 4',
  'Precio: 10.50 EUR',
  '## Encabezado con **negrita** y [enlace](https://a.b)',
  '- item con **negrita** y [enlace](mailto:x@y.z)',
  '1. numerado con *cursiva*',
]
// La cabecera del custom vacío lleva espacios finales que el corpus de arriba
// no puede expresar sin que el editor los recorte: se comprueba aparte.
for (const src of CANONICAL) {
  const rt = roundtrip(src)
  if (rt !== src) fail('round-trip exacto', `original:\n${JSON.stringify(src)}\nround-trip:\n${JSON.stringify(rt)}`)
  const rt2 = roundtrip(rt)
  if (rt2 !== rt) fail('idempotencia', `1ª pasada:\n${JSON.stringify(rt)}\n2ª pasada:\n${JSON.stringify(rt2)}`)
}

// --- 2) Casos que se NORMALIZAN (permitido): solo exigen render igual ------
const mdToHtml = loadRuntimeMdToHtml()
const NORMALIZED: string[] = [
  '* viñeta con asterisco\n• viñeta con punto\n– viñeta con guión',
  '1) paréntesis\n2) sigue',
  '::: tip texto tras el tipo\ncuerpo\n:::',
  '::: tip\nsin cierre',
  '::: custom | #F4C910 |  | ',
  '[texto **con negrita** y *cursiva*](https://x.example)',
]
for (const src of [...CANONICAL, ...NORMALIZED]) {
  const rt = roundtrip(src)
  const a = mdToHtml(src)
  const b = mdToHtml(rt)
  if (a !== b) fail('equivalencia de render', `original:\n${JSON.stringify(src)}\nhtml original:\n${a}\nround-trip:\n${JSON.stringify(rt)}\nhtml round-trip:\n${b}`)
  const rt2 = roundtrip(rt)
  if (rt2 !== rt) fail('idempotencia (normalizados)', `1ª:\n${JSON.stringify(rt)}\n2ª:\n${JSON.stringify(rt2)}`)
}

// --- 3) Proyecto demo completo: render igual para TODOS los strings --------
async function testDemo() {
  const demoPath = join(root, 'docs', 'internals', 'demo-scormeditor.scormproj')
  const zip = await JSZip.loadAsync(readFileSync(demoPath))
  const entry = zip.file('course.json') ?? zip.file('data/course.json')
  if (!entry) throw new Error('El demo no contiene course.json')
  const course = JSON.parse(await entry.async('string'))

  let checked = 0
  const walk = (v: unknown, path: string) => {
    if (typeof v === 'string') {
      checked++
      const rt = roundtrip(v)
      const a = mdToHtml(v)
      const b = mdToHtml(rt)
      if (a !== b) fail(`render distinto en demo (${path})`, `original:\n${JSON.stringify(v)}\nround-trip:\n${JSON.stringify(rt)}\nhtml original:\n${a}\nhtml round-trip:\n${b}`)
      const rt2 = roundtrip(rt)
      if (rt2 !== rt) fail(`idempotencia en demo (${path})`, `1ª:\n${JSON.stringify(rt)}\n2ª:\n${JSON.stringify(rt2)}`)
    } else if (Array.isArray(v)) {
      v.forEach((x, i) => walk(x, `${path}[${i}]`))
    } else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`)
    }
  }
  walk(course, 'course')
  console.log(`Demo: ${checked} strings comprobados.`)
}

testDemo()
  .then(() => {
    if (failures) {
      console.error(`\n${failures} fallo(s).`)
      process.exit(1)
    }
    console.log(`Corpus canónico: ${CANONICAL.length} casos exactos. Normalizados: ${NORMALIZED.length}. Todo OK ✓`)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
