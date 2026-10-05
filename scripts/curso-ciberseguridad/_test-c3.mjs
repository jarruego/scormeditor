// Prueba en Chrome real (móvil 390 px) de los html_embed del curso 3 y captura de SVG.
// Uso: node scripts/curso-ciberseguridad/_test-c3.mjs <carpetaSalida>
import { chromium } from 'playwright-core'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import JSZip from 'jszip'

const out = process.argv[2]
mkdirSync(out, { recursive: true })
const zip = await JSZip.loadAsync(readFileSync('docs/curso-ciberseguridad/scormproj/cibersegsoc-c3-correo-fraudes.scormproj'))
const course = JSON.parse(await zip.file('course.json').async('string'))
const screens = []
for (const m of course.modules) for (const u of m.units) for (const s of u.screens) screens.push(s)

const shim = `<script>window.__log=[];window.MeEmbed={version:1,id:'t',completed:false,state:null,stateMax:100,complete:function(){window.__log.push('complete');this.completed=true},saveState:function(o){var t=JSON.stringify(o);if(/[^\\x20-\\x7e]/.test(t))window.__log.push('ESTADO NO ASCII '+t);window.__log.push('save '+t)}};</script>`
const page = (c) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${c.css}</style></head><body>${shim}${c.html}<script>${c.js}</script></body></html>`

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1 })
let fails = 0

const flows = {
  '¿Legítimo o fraude?': async (p) => { for (let i = 0; i < 8; i++) { await p.click(i % 2 ? 'button.ok' : 'button.bad'); await p.click('button:has-text("Siguiente")') } },
  'La supervisora con número nuevo': async (p) => { await p.click('text=Le pregunto'); await p.waitForTimeout(100); await p.screenshot({ path: join(out, 'chat1-mid.png'), fullPage: true }); await p.click('text=No. Llamo a Elena') },
  'La llamada de «Microsoft»': async (p) => { await p.click('text=Qué grave'); await p.click('text=No instalo nada') },
  'La «hija» pide la analítica': async (p) => { await p.click('text=No facilito datos'); await p.click('text=Entiendo su preocupación') },
  'Inspector de enlaces': async (p) => {
    const sel = [['centrosolmar', 'Me fío'], ['.acceso-seguro', 'No me fío'], ['.info', 'No me fío'], ['bit.ly', 'No me fío'], ['mutua-saludlaboral-gestion', 'No me fío']]
    for (const [chunk, v] of sel) { await p.click(`.url button:text-is("${chunk}")`); await p.click(`text=${v}`); await p.click('text=Siguiente') }
  },
  '¿Quién lo envía de verdad?': async (p) => {
    for (let i = 0; i < 6; i++) { if (i === 1) await p.screenshot({ path: join(out, 'compare-q.png'), fullPage: true }); await p.click('.who'); await p.click(i === 0 || i === 5 ? 'button.ok' : 'button.bad'); if (i === 2) await p.screenshot({ path: join(out, 'compare-a.png'), fullPage: true }); await p.click('text=Siguiente') }
  },
  'Marca las señales': async (p) => {
    await p.click('.ln >> nth=0'); await p.click('.ln >> nth=1'); await p.screenshot({ path: join(out, 'inbox-marked.png'), fullPage: true }); await p.click('button:text-is("Comprobar")'); await p.screenshot({ path: join(out, 'inbox-checked.png'), fullPage: true }); await p.click('text=Siguiente correo')
    await p.click('button:text-is("Comprobar")'); await p.click('text=Siguiente correo'); await p.click('button:text-is("Comprobar")'); await p.click('text=Terminar')
  },
  'He picado: ¿qué hago?': async (p) => { const n = await p.locator('.sit').count(); for (let i = 0; i < n; i++) { await p.click(`.sit >> nth=${i}`); if (i === 2) await p.screenshot({ path: join(out, 'triage.png'), fullPage: true }) } },
  'Mi compromiso': async (p) => { for (let i = 0; i < 6; i++) await p.click(`label.it >> nth=${i}`) },
}

for (const s of screens) {
  if (s.interaction?.type !== 'html_embed') continue
  const cfg = s.interaction.config
  const name = s.title
  const file = join(out, s.id + '.html')
  writeFileSync(file, page(cfg))
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await p.goto('file:///' + file.replaceAll('\\', '/'))
  p.setDefaultTimeout(4000)
  await p.waitForTimeout(150)
  try {
    if (!flows[name]) throw new Error('sin flujo para ' + name)
    await p.screenshot({ path: join(out, s.id + '-start.png'), fullPage: true })
    await flows[name](p)
  } catch (e) { errors.push('FLUJO: ' + e.message.split('\n').slice(0, 6).join(' / ')) }
  await p.waitForTimeout(250)
  await p.screenshot({ path: join(out, s.id + '-end.png'), fullPage: true })
  const log = await p.evaluate(() => window.__log)
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  const ok = log.includes('complete') && !errors.length && !log.some((l) => l.startsWith('ESTADO')) && !overflow
  if (!ok) fails++
  const maxState = Math.max(0, ...log.filter((l) => l.startsWith('save ')).map((l) => l.length - 5))
  console.log(ok ? 'OK ' : 'FALLO', s.id, name, '| completa:', log.includes('complete'), '| overflowX:', overflow, '| estado máx', maxState, '/', cfg.state_max, errors.length ? '\n   ERRORES: ' + errors.join(' | ') : '')
  await p.close()
}

// SVG: render de cada asset
for (const f of Object.keys(zip.files).filter((n) => n.endsWith('.svg'))) {
  const svg = await zip.file(f).async('string')
  const p = await ctx.newPage()
  await p.setViewportSize({ width: 660, height: 420 })
  await p.setContent(`<body style="margin:8px;background:#ddd">${svg}</body>`)
  await p.screenshot({ path: join(out, 'svg-' + f.split('/').pop().replace('.svg', '.png')) })
  await p.close()
}
await browser.close()
console.log(fails ? fails + ' embeds con fallo' : 'TODOS los embeds OK')
process.exit(fails ? 1 : 0)
