/**
 * Empaqueta un SCORM 1.2 desde la línea de comandos, usando el MISMO runtime
 * (src/runtime/**) y la misma estructura que el exportador del editor.
 *
 *   node scripts/build-scorm.mjs <course.json> [salida.zip]
 *
 * Útil para generar un ZIP de prueba (p. ej. para SCORM Cloud) sin abrir el editor.
 * Nota: solo incluye assets si existen como ficheros junto al course.json en una
 * carpeta assets/ hermana (proyecto portable). Si los assets se subieron solo en
 * el navegador, expórtalos desde el editor con «Exportar SCORM ZIP».
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'node:fs'
import { join, relative, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const runtimeDir = join(root, 'src', 'runtime')

const coursePath = process.argv[2]
if (!coursePath || !existsSync(coursePath)) {
  console.error('Uso: node scripts/build-scorm.mjs <course.json> [salida.zip]')
  process.exit(1)
}
const course = JSON.parse(readFileSync(coursePath, 'utf8'))
const id = (course.scorm && course.scorm.identifier) || 'SCORMEDITOR-COURSE'
const outPath = process.argv[3] || join(root, 'dist-scorm', `${id}.zip`)

function walk(dir) {
  let out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out = out.concat(walk(p))
    else out.push(p)
  }
  return out
}

function xml(s) {
  return String(s ?? '').replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]),
  )
}

function manifest(course, extraFiles) {
  const id = (course.scorm && course.scorm.identifier) || 'SCORMEDITOR-COURSE'
  const title = (course.scorm && course.scorm.title) || (course.course && course.course.title) || 'Curso'
  const mastery = (course.scorm && course.scorm.mastery_score) ?? 60
  const baseFiles = [
    'index.html',
    'assets/css/styles.css',
    'assets/js/scorm_api.js',
    'assets/js/accessibility.js',
    'assets/js/interactions.js',
    'assets/js/renderer.js',
    'assets/js/app.js',
    'print/print.css',
    'data/course.json',
  ]
  const files = Array.from(new Set([...baseFiles, ...extraFiles]))
  const fileEls = files.map((f) => `      <file href="${xml(f)}"/>`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${xml(id)}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata><schema>ADL SCORM</schema><schemaversion>1.2</schemaversion></metadata>
  <organizations default="ORG-${xml(id)}">
    <organization identifier="ORG-${xml(id)}">
      <title>${xml(title)}</title>
      <item identifier="ITEM-${xml(id)}" identifierref="RES-${xml(id)}" isvisible="true">
        <title>${xml(title)}</title>
        <adlcp:masteryscore>${mastery}</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-${xml(id)}" type="webcontent" adlcp:scormtype="sco" href="index.html">
${fileEls}
    </resource>
  </resources>
</manifest>
`
}

const zip = new JSZip()

// 1) Carcasa (runtime) en sus rutas relativas
for (const f of walk(runtimeDir)) {
  const rel = relative(runtimeDir, f).split('\\').join('/')
  zip.file(rel, readFileSync(f))
}

// 2) Datos del curso
zip.file('data/course.json', JSON.stringify(course, null, 2))

// 3) Assets desde carpeta hermana assets/ (proyecto portable), si existe
const assetsDir = join(dirname(coursePath), 'assets')
const extra = []
if (existsSync(assetsDir)) {
  for (const f of walk(assetsDir)) {
    const rel = 'assets/' + relative(assetsDir, f).split('\\').join('/')
    zip.file(rel, readFileSync(f))
    extra.push(rel)
  }
}

// 4) Manifiesto
zip.file('imsmanifest.xml', manifest(course, extra))

const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, buf)

// Resumen
let screens = 0, interactions = 0
;(course.modules || []).forEach((m) => (m.units || []).forEach((u) => (u.screens || []).forEach((s) => {
  screens++; if (s.interaction) interactions++
})))
const q = ((course.assessments || {}).final_test || {}).questions || []
console.log(`OK -> ${outPath}`)
console.log(`   ${(course.modules || []).length} módulo(s), ${screens} pantalla(s), ${interactions} interacción(es), ${q.length} pregunta(s) de test`)
console.log(`   ${basename(coursePath)} · id=${id}`)
