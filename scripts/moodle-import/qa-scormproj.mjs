/**
 * Pasa el validador REAL del editor (`validateCourse`, el de la pestaña
 * «Validación») sobre uno o varios .scormproj y lista los avisos por código.
 *
 *   node scripts/moodle-import/qa-scormproj.mjs <fichero.scormproj|carpeta> [--all]
 *
 * Por defecto omite los `info` (EDITOR_NOTE…); --all los incluye.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import JSZip from 'jszip'
import { createServer } from 'vite'

// El validador importa módulos que usan `import.meta.glob` (solo existe bajo Vite):
// se carga con el loader SSR de Vite en vez de importarlo directamente.
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const { Course } = await vite.ssrLoadModule('/src/schema/course.schema.ts')
const { validateCourse } = await vite.ssrLoadModule('/src/validation/validators.ts')

const target = process.argv[2]
const showAll = process.argv.includes('--all')
const files = statSync(target).isDirectory()
  ? readdirSync(target).filter((n) => n.endsWith('.scormproj')).map((n) => join(target, n))
  : [target]

for (const f of files) {
  const zip = await JSZip.loadAsync(readFileSync(f))
  const parsed = Course.safeParse(JSON.parse(await zip.file('course.json').async('string')))
  console.log(`\n== ${f.split(/[\\/]/).pop()}`)
  if (!parsed.success) {
    console.log('ZOD ERROR', JSON.stringify(parsed.error.issues.slice(0, 8), null, 1))
    continue
  }
  const r = validateCourse(parsed.data)
  console.log(`errores ${r.errors} · avisos ${r.warnings} · info ${r.infos}`)
  const by = new Map()
  for (const i of r.issues) {
    if (i.severity === 'info' && !showAll) continue
    if (!by.has(i.code)) by.set(i.code, [])
    by.get(i.code).push(i)
  }
  for (const [code, list] of [...by].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${list[0].severity === 'error' ? '⛔' : list[0].severity === 'warning' ? '⚠' : 'ℹ'} ${code} ×${list.length}`)
    for (const i of list.slice(0, process.argv.includes("--full") ? 999 : 4)) console.log(`      ${i.message.slice(0, 140)} — ${i.location}`)
  }
}

await vite.close()
