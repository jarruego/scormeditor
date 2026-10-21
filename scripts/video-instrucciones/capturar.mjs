// Captura la carcasa REAL (curso de demo-course.ts exportado con build-scorm.mjs) en los
// estados que enseña el vídeo, y anota dónde está cada control.
// Uso (desde la raíz del repo): node scripts/video-instrucciones/capturar.mjs
// Salida: scripts/video-instrucciones/_tmp/capturas/<estado>.png + rects.json
//   Escritorio: 1280×720 CSS a 2.25× (nítido al hacer zoom). Móvil: 390×844 a 3×.
//   rects.json va en px CSS.
import { chromium } from 'playwright-core'
import JSZip from 'jszip'
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { createServer } from 'node:http'
import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'

const AQUI = dirname(fileURLToPath(import.meta.url))
const RAIZ = join(AQUI, '../..')
const TMP = join(AQUI, '_tmp')
const OUT = join(TMP, 'capturas')
const PROJ = join(TMP, 'proj')
rmSync(PROJ, { recursive: true, force: true })
for (const d of [OUT, join(PROJ, 'assets')]) mkdirSync(d, { recursive: true })

// 1) Curso de ejemplo validado con el esquema real + narración muda de 48 s (solo
//    hace falta que exista para que la barra muestre el reproductor).
execFileSync(join(RAIZ, 'node_modules/.bin/esbuild' + (process.platform === 'win32' ? '.cmd' : '')),
  [join(AQUI, 'demo-course.ts'), '--bundle', '--platform=node', '--format=esm', '--outfile=' + join(TMP, 'demo-course.mjs'), '--log-level=warning'],
  { stdio: 'inherit', shell: process.platform === 'win32' })
const { demoCourse, NARRACION_DEMO } = await import(pathToFileURL(join(TMP, 'demo-course.mjs')).href + '?' + Date.now())
writeFileSync(join(PROJ, 'course.json'), JSON.stringify(demoCourse()))
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-t', '48', '-i', 'anullsrc=r=22050:cl=mono', '-b:a', '32k', join(PROJ, NARRACION_DEMO)])

// 2) SCORM exportado, servido desde memoria
const zipOut = join(TMP, 'demo.zip')
const r = spawnSync('node', [join(RAIZ, 'scripts/build-scorm.mjs'), join(PROJ, 'course.json'), zipOut], { encoding: 'utf8' })
if (r.status !== 0) { console.error(r.stdout, r.stderr); process.exit(1) }
const zip = await JSZip.loadAsync(readFileSync(zipOut))
const files = {}
for (const [name, f] of Object.entries(zip.files)) if (!f.dir) files[name] = await f.async('nodebuffer')
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.mp3': 'audio/mpeg' }
const server = createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]).replace(/^\//, '') || 'index.html'
  if (!files[p]) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' })
  res.end(files[p])
})
await new Promise((ok) => server.listen(0, '127.0.0.1', ok))
const URL_CURSO = `http://127.0.0.1:${server.address().port}/index.html`

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] })
const rects = {}

// Controles que señala el vídeo (selector → nombre).
const CONTROLES = {
  prev: '#me-prev', next: '#me-next', progreso: '.me-progress', menu: '#me-toggle-menu',
  play: '#me-btn-playpause', seek: '.me-audio-seek', sonido: '#me-btn-audio', volumen: '#me-audio-volume', velocidad: '.me-rate',
  transcripcion: '#me-btn-transcript', menos: '#me-btn-text-smaller', mas: '#me-btn-text-larger', imprimir: '#me-btn-print',
  ayuda: '#me-btn-help', cerrar: '#me-btn-close', completa: '#me-btn-fullscreen', barra: '.me-toolbar', topbar: '.me-topbar-right',
  materiales: '.me-menu-materials', indice: '#me-menu', comprobar: '.me-check', feedback: '.me-feedback', opcion: '.me-interaction label:nth-of-type(2)',
  modal: '#me-modal .me-modal-card', contenido: '#me-content',
}
async function anota (page, estado, escala) {
  rects[estado] = await page.evaluate(([ctl, k]) => {
    const o = {}
    for (const [n, sel] of Object.entries(ctl)) {
      const el = document.querySelector(sel)
      if (!el) continue
      const b = el.getBoundingClientRect()
      if (!b.width || !b.height) continue
      o[n] = { x: b.left * k, y: b.top * k, w: b.width * k, h: b.height * k }
    }
    return o
  }, [CONTROLES, escala])
}
// Narración «a mitad»: el servidor de memoria no admite Range, así que el <audio> no se
// puede adelantar; basta con dejar la barra del reproductor como si fuera por ese punto.
async function audioA (page, seg) {
  await page.evaluate(() => { const a = document.querySelector('#me-content .me-narration-audio'); if (a) a.pause() })
  await page.waitForTimeout(400) // que el reproductor procese la pausa antes de retocar la barra
  await page.evaluate((s) => {
    const total = 48
    const fmt = (x) => Math.floor(x / 60) + ':' + String(Math.floor(x % 60)).padStart(2, '0')
    const seek = document.getElementById('me-audio-seek')
    if (seek) seek.value = String(Math.round(s / total * 1000))
    const tx = document.getElementById('me-audio-time')
    if (tx) tx.textContent = fmt(s) + ' / ' + fmt(total)
  }, seg)
  await page.waitForTimeout(200)
}
async function foto (page, estado, escala) {
  await page.mouse.move(-10, -10)
  await page.waitForTimeout(500)
  await page.screenshot({ path: join(OUT, estado + '.png') })
  await anota(page, estado, escala)
  console.log('  ' + estado)
}

// --- Escritorio ---------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2.25 })
  const page = await ctx.newPage()
  const errores = []
  page.on('pageerror', (e) => errores.push(e.message))
  await page.goto(URL_CURSO)
  await page.waitForTimeout(1500)
  await foto(page, 'portada', 1)
  await page.click('#me-next'); await page.waitForTimeout(1200)
  await audioA(page, 14)
  await foto(page, 'contenido', 1)
  // Transcripción
  await page.click('#me-btn-transcript'); await page.waitForTimeout(600)
  await foto(page, 'transcripcion', 1)
  await page.keyboard.press('Escape'); await page.click('#me-modal .me-modal-close').catch(() => {}); await page.waitForTimeout(400)
  // Letra más grande (150 %)
  await page.click('#me-btn-text-larger'); await page.click('#me-btn-text-larger'); await page.waitForTimeout(500)
  await audioA(page, 14)
  await foto(page, 'letra', 1)
  await page.click('#me-btn-text-smaller'); await page.click('#me-btn-text-smaller'); await page.waitForTimeout(400)
  // Índice abierto (en la misma pantalla) y siguiente pantalla
  await page.click('#me-toggle-menu'); await page.waitForTimeout(700)
  await audioA(page, 14)
  await foto(page, 'menu', 1)
  await page.click('#me-toggle-menu'); await page.waitForTimeout(500)
  await page.click('#me-next'); await page.waitForTimeout(1200)
  await foto(page, 'siguiente', 1)
  // Actividad: antes y después de comprobar
  await page.click('#me-next'); await page.waitForTimeout(1200)
  await foto(page, 'actividad', 1)
  await page.locator('.me-interaction label').nth(1).click(); await page.waitForTimeout(300)
  await foto(page, 'actividad-marcada', 1)
  await page.click('.me-check'); await page.waitForTimeout(900)
  await foto(page, 'actividad-comprobada', 1)
  if (errores.length) throw new Error(errores.join(' | '))
  await ctx.close()
}

// --- Móvil --------------------------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto(URL_CURSO)
  await page.waitForTimeout(1500)
  await page.click('#me-next'); await page.waitForTimeout(1200)
  await audioA(page, 14)
  await foto(page, 'movil', 1)
  await ctx.close()
}

writeFileSync(join(OUT, 'rects.json'), JSON.stringify(rects, null, 1))
await browser.close()
server.close()
console.log('Capturas en ' + OUT)
