// Inventario de imágenes (visual_resource image + imágenes de config: hotspots, etc.) de los 6 .scormproj
import JSZip from 'jszip'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'curso-ciberseguridad', 'scormproj')
const rows = []
for (const f of readdirSync(dir).filter((x) => x.endsWith('.scormproj')).sort()) {
  const z = await JSZip.loadAsync(readFileSync(join(dir, f)))
  const c = JSON.parse(await z.file('course.json').async('string'))
  const cn = f.match(/-c(\d)-/)[1]
  const all = []
  const push = (unit, s) => all.push({ unit, s })
  c.intro_screens.forEach((s) => push('Portada del curso', s))
  c.modules.forEach((m) => { m.screens.forEach((s) => push(m.title, s)); m.units.forEach((u) => u.screens.forEach((s) => push(u.title, s))) })
  for (const { unit, s } of all) {
    const vr = s.visual_resource || {}
    if (vr.kind === 'image' && vr.src) rows.push({ c: cn, id: s.id, type: s.type, unit, title: s.title, src: vr.src, alt: vr.alt, layout: vr.layout, kind: 'visual' })
    const cfg = (s.interaction && s.interaction.config) || {}
    for (const k of ['image', 'before_image', 'after_image']) if (typeof cfg[k] === 'string' && cfg[k].startsWith('assets/')) rows.push({ c: cn, id: s.id, type: s.interaction.type, unit, title: s.title, src: cfg[k], alt: cfg.alt || cfg.before_alt || '', kind: 'config:' + s.interaction.type })
    if (s.interaction && s.interaction.type === 'image_cards') for (const cd of cfg.cards || []) rows.push({ c: cn, id: s.id, type: 'image_cards', unit, title: s.title + ' › ' + cd.title, src: cd.image, alt: cd.alt, kind: 'card' })
  }
}
writeFileSync(process.argv[2] || 'inventario.json', JSON.stringify(rows, null, 1))
const byC = {}
for (const r of rows) byC[r.c] = (byC[r.c] || 0) + 1
console.log('total', rows.length, JSON.stringify(byC))
for (const r of rows) console.log(`C${r.c} ${r.id} [${r.kind}] ${r.src.split('/').pop()} | ${r.unit.slice(0, 40)} | ${r.title} | ${(r.alt || '').slice(0, 110)}`)
