// Dibuja las zonas de hotspots.json sobre cada escena para revisarlas a ojo. Uso: node _check-zonas.mjs <carpetaSalida>
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const z = JSON.parse(readFileSync(join(here, '..', '..', 'docs', 'curso-ciberseguridad', 'imagenes', 'hotspots.json'), 'utf8'))
for (const [name, spots] of Object.entries(z)) {
  if (name.startsWith('_')) continue
  const boxes = Object.entries(spots).map(([label, [x, y, w, h]]) => `${x},${y},${w},${h},${label}`)
  const r = spawnSync('node', [join(here, 'imagenes-tools.mjs'), 'boxes', name, join(process.argv[2], `zonas_${name}.png`), ...boxes], { encoding: 'utf8' })
  console.log(r.stdout.trim() || r.stderr.slice(0, 200))
}
