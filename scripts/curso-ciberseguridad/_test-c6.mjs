// Prueba en Chrome real (móvil 390 px) de TODOS los html_embed del curso 6 y captura de las ilustraciones SVG.
// Uso: node scripts/curso-ciberseguridad/_test-c6.mjs <carpetaSalida>
import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import JSZip from 'jszip'

const out = process.argv[2]
mkdirSync(out, { recursive: true })
const zip = await JSZip.loadAsync(readFileSync('docs/curso-ciberseguridad/scormproj/cibersegsoc-c6-ia.scormproj'))
const course = JSON.parse(await zip.file('course.json').async('string'))
const shim = `<script>window.__log=[];window.MeEmbed={version:1,id:'t',completed:false,state:null,stateMax:100,complete:function(){window.__log.push('complete');this.completed=true},saveState:function(o){var s=JSON.stringify(o);window.__log.push('save '+s);if(!/^[\\x20-\\x7e]*$/.test(s)||s.length>${'__MAX__'})window.__log.push('BADSTATE '+s)}};</script>`

const embeds = []
const walk = (s) => { if (s.interaction?.type === 'html_embed') embeds.push({ title: s.title, id: s.id, cfg: s.interaction.config }) }
course.intro_screens.forEach(walk); course.modules.forEach((m) => { (m.screens || []).forEach(walk); m.units.forEach((u) => u.screens.forEach(walk)) })
console.log('html_embed encontrados:', embeds.length, embeds.map((e) => e.id + ':' + e.title).join(' | '))

const page = (e) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${e.cfg.css}</style></head><body>${shim.replace('__MAX__', e.cfg.state_max)}${e.cfg.html}<script>${e.cfg.js}</script></body></html>`

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1 })
let fails = 0

async function clickAll(p, sel, n = 40) { for (let i = 0; i < n; i++) { const b = p.locator(sel).first(); if (!(await b.count())) break; try { await b.click({ timeout: 1500 }) } catch { break } } }

for (const e of embeds) {
  const name = e.id + '_' + e.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  const file = join(out, name + '.html')
  writeFileSync(file, page(e))
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', (x) => errors.push(x.message))
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await p.goto('file:///' + file.replaceAll('\\', '/'))
  await p.waitForTimeout(250)
  p.setDefaultTimeout(4000)
  try {
    if (e.title === 'Detector de pistas') {
      await p.screenshot({ path: join(out, name + '-0.png'), fullPage: true })
      for (const lab of ['Contorno de la cara y el pelo', 'Sombra de la cara', 'Ojos', 'Boca']) { await p.locator(`[aria-label="${lab}"]`).dispatchEvent('click') }
      await p.screenshot({ path: join(out, name + '-1.png'), fullPage: true })
    } else if (e.title === 'El semáforo de datos') {
      // 1.ª tarjeta (roja): arrastre real con ratón sobre el botón rojo
      const card = p.locator('.card'); const box = await card.boundingBox(); const tgt = await p.locator('button.z.r').boundingBox()
      await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down()
      await p.mouse.move(tgt.x + tgt.width / 2, tgt.y + tgt.height / 2, { steps: 8 }); await p.screenshot({ path: join(out, name + '-drag.png') }); await p.mouse.up()
      await p.screenshot({ path: join(out, name + '-1.png'), fullPage: true })
      await p.click('text=Siguiente')
      // resto por toque, contestando siempre «verde» (algunas fallarán a propósito)
      for (let i = 0; i < 9; i++) { await p.click('button.z.v'); await p.click('button:has-text("›")') }
    } else if (e.title === 'Quita lo que identifica') {
      await p.click('text=Comprobar'); await p.screenshot({ path: join(out, name + '-0.png'), fullPage: true })
      const n = await p.locator('.chip').count()
      for (let i = 0; i < n; i++) { const t = await p.locator('.chip').nth(i).innerText(); if (!/en el pasillo|qué hacer/.test(t)) await p.locator('.chip').nth(i).click() }
      await p.click('text=Comprobar')
    } else if (e.title === 'Mi compromiso') {
      for (let i = 0; i < 6; i++) await p.click(`label.it >> nth=${i}`)
    } else if (e.title === 'Legítimo o fraude') {
      for (let i = 0; i < 7; i++) { await p.click('button.bad'); await p.click('button:has-text("›")') }
    } else if (e.title === 'Voz clonada') {
      await p.click('text=No contesto'); await p.click('text=palabra clave')
    } else if (e.title === 'Tu turno: ¿pagas?') {
      await p.click('text=Me desconecto'); await p.click('text=No pago nada')
    } else if (e.title === 'Tu turno: el informe') {
      await p.click('text=Quito solo el nombre'); await p.click('text=Mejor no lo pego')
    }
  } catch (x) { console.log('FALLO en', name, x.message.split('\n').slice(0, 8).join('\n'), '\nTEXTO:', (await p.evaluate(() => document.body.innerText)).slice(0, 400)) }
  await p.waitForTimeout(300)
  await p.screenshot({ path: join(out, name + '.png'), fullPage: true })
  const log = await p.evaluate(() => window.__log)
  const ok = log.includes('complete'); const bad = log.filter((l) => l.startsWith('BADSTATE'))
  const sw = await p.evaluate(() => document.documentElement.scrollWidth)
  if (!ok || errors.length || bad.length || sw > 392) fails++
  console.log(name, ok ? 'COMPLETA' : 'NO COMPLETA', 'scrollW=' + sw, errors.length ? 'ERRORES: ' + errors.join(' | ') : '', bad.length ? bad.join(' ') : '', JSON.stringify(log).slice(0, 100))
  await p.close()
}

// Ilustraciones SVG
const ctx2 = await browser.newContext({ viewport: { width: 640, height: 360 } })
for (const f of Object.keys(zip.files).filter((k) => k.endsWith('.svg'))) {
  const svg = await zip.file(f).async('string')
  const p = await ctx2.newPage()
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/)
  await p.setViewportSize({ width: +vb[1], height: +vb[2] })
  await p.setContent(`<body style="margin:0">${svg}</body>`)
  await p.screenshot({ path: join(out, 'svg_' + f.split('/').pop().replace('.svg', '.png')) })
  await p.close()
}
await browser.close()
process.exit(fails ? 1 : 0)
