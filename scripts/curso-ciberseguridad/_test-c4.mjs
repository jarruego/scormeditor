// Prueba en Chrome real (móvil 390 px) de todos los html_embed del curso 4, leídos del .scormproj generado.
// Uso: node scripts/curso-ciberseguridad/_test-c4.mjs <carpetaSalida>
import { chromium } from 'playwright-core'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import JSZip from 'jszip'

const out = process.argv[2]
mkdirSync(out, { recursive: true })
const zip = await JSZip.loadAsync(readFileSync('docs/curso-ciberseguridad/scormproj/cibersegsoc-c4-puesto-dispositivos.scormproj'))
const course = JSON.parse(await zip.file('course.json').async('string'))
const embeds = {}
for (const u of course.modules.flatMap((m) => m.units)) for (const s of u.screens) if (s.interaction?.type === 'html_embed') embeds[s.title] = s.interaction.config
console.log('html_embed:', Object.keys(embeds).join(' | '))

const shim = `<script>window.__log=[];window.MeEmbed={version:1,id:'t',completed:false,state:null,stateMax:300,complete:function(){window.__log.push('complete');this.completed=true},saveState:function(o){var t=JSON.stringify(o);if(/[^\\x20-\\x7e]/.test(t)||t.length>300)window.__log.push('BADSTATE '+t);else window.__log.push('save '+t)}};</script>`
const page = (w) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${w.css}</style></head><body>${shim}${w.html}<script>${w.js}</script></body></html>`

const T = {
  'Bloquea a tiempo': async (p, shot) => {
    await p.check('#nl'); await shot('1')
    const ok = [0, 1, 0, 0, 2, 1, 0]
    for (let i = 0; i < 7; i++) { await p.locator('.col > button').nth(ok[i]).click(); if (i === 4) await shot('fb'); await p.click('text=Siguiente') }
  },
  'Turno de tarde en planta 2': async (p, shot) => { await p.click('text=Cierro su sesión'); await p.click('text=Ahora no'); await shot('mid'); await p.click('text=Cierro sesión y aviso') },
  '¿Qué hago con este USB?': async (p, shot) => {
    await p.click('text=Lo conecto al ordenador de recepción'); await shot('bad')
    await p.click('text=Lo recojo sin conectarlo'); await p.click('text=Siguiente')
    await p.click('text=No: se entrega'); await p.click('text=Siguiente')
    await p.click('text=No lo conecto y se lo paso'); await p.click('text=Siguiente')
    await shot('c3'); await p.click('text=Llamo a la mutua'); await p.click('text=Siguiente')
  },
  'Radar de wifi': async (p, shot) => {
    await shot('r1'); await p.locator('button.net').nth(0).click(); await shot('r1fb'); await p.click('text=Siguiente')
    await p.locator('button.net').nth(1).click(); await p.click('text=Siguiente')
    await shot('r3'); await p.locator('button.net').nth(3).click(); await shot('r3fb'); await p.click('text=Siguiente')
  },
  '¿Legítimo o fraude?': async (p, shot) => {
    const fr = [1, 0, 1, 0, 1, 1]
    for (let i = 0; i < 6; i++) { if (i === 0) await shot('1'); await p.click(fr[i] ? 'button.bad' : 'button.ok'); await p.click('text=Siguiente') }
  },
  'Mi semáforo de teletrabajo': async (p, shot) => {
    for (const k of [0, 1, 2, 3, 5]) await p.locator('label.it').nth(k).click()
    await p.click('#go'); await shot('res')
  },
  'El técnico sin cita': async (p, shot) => {
    await p.click('text=Le pido identificación'); await p.click('text=Llamo a ese número'); await shot('mid')
    await p.click('text=Llamo al teléfono de informática'); await p.click('text=Le digo que no hay cita')
  },
  'Mi compromiso': async (p) => { for (let k = 0; k < 5; k++) await p.locator('label.it').nth(k).click() },
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1 })
let fails = 0
let n = 0
for (const [name, w] of Object.entries(embeds)) {
  n++
  const slug = 'w' + n
  const file = join(out, slug + '.html')
  writeFileSync(file, page(w))
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await p.goto('file:///' + file.replaceAll('\\', '/'))
  await p.waitForTimeout(200)
  p.setDefaultTimeout(4000)
  const shot = async (s) => { await p.waitForTimeout(150); await p.screenshot({ path: join(out, `${slug}-${s}.png`), fullPage: true }) }
  try { await (T[name] || (async () => { throw new Error('sin guion de prueba') }))(p, shot) } catch (e) { errors.push('FALLO: ' + e.message.split('\n').slice(0, 6).join(' / ') + ' | TEXTO: ' + (await p.evaluate(() => document.body.innerText)).slice(0, 300).replace(/\n/g, ' / ')) }
  await shot('fin')
  const log = await p.evaluate(() => window.__log)
  const ok = log.includes('complete')
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  if (!ok || errors.length || overflow || log.some((l) => l.startsWith('BADSTATE'))) fails++
  console.log(name, '=>', ok ? 'COMPLETA' : 'NO COMPLETA', overflow ? 'DESBORDE-X' : '', JSON.stringify(log).slice(0, 140), errors.length ? '\n   ERRORES: ' + errors.join(' | ') : '')
  await p.close()
}
await browser.close()
process.exit(fails ? 1 : 0)
