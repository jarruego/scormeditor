/**
 * Valida todos los .scormproj de una carpeta contra el schema Zod REAL del
 * editor (así que necesita tsx: no es opcional, `Course.parse` vive en TS).
 *
 *   npx tsx scripts/moodle-import/validate-scormproj.mjs <carpeta>
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import JSZip from 'jszip'
import { Course } from '../../src/schema/course.schema.ts'

const dir = process.argv[2]
for (const name of readdirSync(dir).filter((n) => n.endsWith('.scormproj'))) {
  const buf = readFileSync(join(dir, name))
  const zip = await JSZip.loadAsync(buf)
  const courseJsonText = await zip.file('course.json').async('string')
  const raw = JSON.parse(courseJsonText)
  // Ojo: los asset paths pueden vivir como subcadena dentro de texto libre
  // (student_text con imágenes inline en markdown, no solo en visual_resource.src).
  const referencedAssets = new Set([...courseJsonText.matchAll(/assets\/img\/[^\s"'()\\]+/g)].map((m) => m[0]))
  const zipAssetPaths = new Set(Object.keys(zip.files).filter((f) => f.startsWith('assets/')))
  const missing = [...referencedAssets].filter((p) => !zipAssetPaths.has(p))

  const result = Course.safeParse(raw)
  if (!result.success) {
    console.log(`✗ ${name}: ZOD ERROR`)
    console.log(JSON.stringify(result.error.issues.slice(0, 10), null, 2))
  } else {
    console.log(`✓ ${name}: válido (${zipAssetPaths.size} assets en zip, ${referencedAssets.size} referenciados, ${missing.length} faltantes)`)
    if (missing.length) console.log('   FALTAN:', missing)
  }
}
