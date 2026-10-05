// Busca una palabra dentro de todos los .scormproj (course.json y assets de texto). Uso: node _grep-zip.mjs residencia
import JSZip from 'jszip'
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const word = new RegExp(process.argv[2] || 'residencia', 'gi')
const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'curso-ciberseguridad', 'scormproj')
for (const f of readdirSync(dir).filter((x) => x.endsWith('.scormproj'))) {
  const z = await JSZip.loadAsync(readFileSync(join(dir, f)))
  let n = 0
  const hits = []
  for (const [name, e] of Object.entries(z.files)) {
    if (e.dir || !/\.(json|svg|html|vtt|txt)$/.test(name)) continue
    const s = await e.async('string')
    for (const m of s.matchAll(new RegExp('.{0,40}' + word.source + '.{0,40}', 'gi'))) { n++; hits.push(`${name}: …${m[0].replace(/\s+/g, ' ')}…`) }
  }
  console.log(f, n, hits.slice(0, 5).join('\n   '))
}
