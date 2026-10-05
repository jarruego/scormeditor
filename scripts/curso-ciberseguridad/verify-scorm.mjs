/**
 * QA visual de un .scormproj con la carcasa REAL, en Chrome móvil (390×844):
 *   node scripts/curso-ciberseguridad/verify-scorm.mjs <ruta.scormproj> [carpetaCapturas] [--shots=N]
 * - Descomprime, relaja la navegación (free + sin exigir interacciones) SOLO para recorrerlo,
 *   construye el SCORM con scripts/build-scorm.mjs y lo sirve en local.
 * - Recorre todas las pantallas con «Siguiente», capturando cada una y anotando errores de
 *   consola, imágenes rotas, iframes html_embed sin contenido y desbordes horizontales.
 */
import { chromium } from 'playwright-core'
import JSZip from 'jszip'
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { createServer } from 'node:http'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const args = process.argv.slice(2)
const src = args.find((a) => a.endsWith('.scormproj'))
const shotsDir = args.find((a) => !a.endsWith('.scormproj') && !a.startsWith('--'))
const every = Number((args.find((a) => a.startsWith('--shots=')) || '--shots=1').split('=')[1])
if (!src) { console.error('Uso: verify-scorm.mjs <x.scormproj> [carpetaCapturas]'); process.exit(1) }

const work = join(tmpdir(), 'verify-' + Date.now())
const projDir = join(work, 'proj')
mkdirSync(projDir, { recursive: true })
const zip = await JSZip.loadAsync(readFileSync(src))
for (const [name, f] of Object.entries(zip.files)) {
  if (f.dir) continue
  const out = join(projDir, name)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, await f.async('nodebuffer'))
}
const course = JSON.parse(readFileSync(join(projDir, 'course.json'), 'utf8'))
course.scorm.rules.navigation = 'free'
course.scorm.rules.require_interactions = false
writeFileSync(join(projDir, 'course.json'), JSON.stringify(course))
const zipOut = join(work, 'scorm.zip')
const r = spawnSync('node', ['scripts/build-scorm.mjs', join(projDir, 'course.json'), zipOut], { encoding: 'utf8' })
if (r.status !== 0) { console.error(r.stdout, r.stderr); process.exit(1) }
const site = join(work, 'site')
const sz = await JSZip.loadAsync(readFileSync(zipOut))
const files = {}
for (const [name, f] of Object.entries(sz.files)) if (!f.dir) files[name] = await f.async('nodebuffer')

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg' }
const server = createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '') || 'index.html'
  const d = files[p]
  if (!d) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' })
  res.end(d)
})
await new Promise((ok) => server.listen(0, '127.0.0.1', ok))
const url = `http://127.0.0.1:${server.address().port}/index.html`

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
const page = await ctx.newPage()
const problems = []
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text().slice(0, 200)) })
page.on('requestfailed', (q) => { if (!q.url().includes('youtube')) problems.push('requestfailed: ' + q.url().slice(0, 120)) })
page.on('response', (q) => { if (q.status() >= 400 && !q.url().includes('youtube')) problems.push(`HTTP ${q.status()}: ${q.url().slice(0, 120)}`) })
await page.goto(url)
await page.waitForTimeout(800)
if (shotsDir) mkdirSync(shotsDir, { recursive: true })

const total = course.intro_screens.length + course.modules.reduce((n, m) => n + m.screens.length + m.units.reduce((k, u) => k + u.screens.length, 0), 0) + (course.assessments.final_test ? 2 : 0)
let i = 0
for (; i < total + 4; i++) {
  await page.waitForTimeout(350)
  const info = await page.evaluate(() => {
    const h1 = document.querySelector('h1')
    const imgs = [...document.querySelectorAll('img')].filter((im) => im.getAttribute('src') && im.complete && im.naturalWidth === 0).map((im) => im.getAttribute('src'))
    const frames = [...document.querySelectorAll('iframe')].map((f) => ({ src: (f.getAttribute('src') || '').slice(0, 60), hasDoc: !!f.getAttribute('srcdoc'), h: f.getBoundingClientRect().height }))
    return { title: h1 ? h1.textContent.trim() : '', overflowX: document.documentElement.scrollWidth > window.innerWidth + 2, imgs, frames, last: /fin/i.test(document.getElementById('me-next')?.textContent || '') }
  })
  const tag = String(i + 1).padStart(2, '0')
  if (info.overflowX) problems.push(`[${tag}] «${info.title}»: desborde horizontal`)
  for (const b of info.imgs) problems.push(`[${tag}] «${info.title}»: imagen rota ${b}`)
  for (const f of info.frames) if (f.hasDoc && f.h < 40) problems.push(`[${tag}] «${info.title}»: iframe html_embed con altura ${f.h}`)
  if (shotsDir && i % every === 0) await page.screenshot({ path: join(shotsDir, `${tag}.png`), fullPage: true })
  console.log(`${tag} ${info.title}${info.frames.some((f) => f.hasDoc) ? ' [embed]' : ''}${info.frames.some((f) => f.src.includes('youtube')) ? ' [vídeo]' : ''}`)
  if (info.last) break
  await page.click('#me-next').catch(() => problems.push(`[${tag}] no se pudo pulsar Siguiente`))
}
console.log(`\nPantallas recorridas: ${i + 1} (esperadas ≈ ${total}) · problemas: ${problems.length}`)
for (const p of [...new Set(problems)].slice(0, 40)) console.log('  ⚠', p)
await browser.close()
server.close()
rmSync(work, { recursive: true, force: true })
