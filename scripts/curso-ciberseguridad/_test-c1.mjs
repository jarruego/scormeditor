// Prueba en Chrome real (móvil 390 px) de TODOS los html_embed del .scormproj del curso 1 + capturas de SVG.
// Uso: node scripts/curso-ciberseguridad/_test-c1.mjs <carpetaSalida>
import { chromium } from 'playwright-core'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'

const HERE = dirname(fileURLToPath(import.meta.url))
const out = process.argv[2]
mkdirSync(out, { recursive: true })
const zip = await JSZip.loadAsync(readFileSync(join(HERE, '..', '..', 'docs', 'curso-ciberseguridad', 'scormproj', 'cibersegsoc-c1-fundamentos.scormproj')))
const course = JSON.parse(await zip.file('course.json').async('string'))
const screens = [...course.intro_screens, ...course.modules.flatMap((m) => [...(m.screens || []), ...m.units.flatMap((u) => u.screens)])]
const embeds = screens.filter((s) => s.interaction?.type === 'html_embed')
console.log('html_embed:', embeds.length, '| pantallas:', screens.length)

const shim = `<script>window.__log=[];window.MeEmbed={version:1,id:'t',completed:false,state:null,stateMax:100,complete:function(){window.__log.push('complete');this.completed=true},saveState:function(o){window.__log.push('save '+JSON.stringify(o))}};</script>`
const page = (w) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${w.css}</style></head><body>${shim}${w.html}<script>${w.js}</script></body></html>`

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1 })
let fails = 0
for (const s of embeds) {
  const cfg = s.interaction.config
  const file = join(out, s.id + '.html')
  writeFileSync(file, page(cfg))
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await p.goto('file:///' + file.replaceAll('\\', '/'))
  await p.waitForTimeout(200)
  p.setDefaultTimeout(4000)
  const t = s.title
  try {
    if (t === 'Mapa de la residencia') {
      for (let i = 0; i < 5; i++) {
        await p.locator('#map g.cell').nth(i).click()
        if (i === 1) await p.screenshot({ path: join(out, 'mapa-zona.png'), fullPage: true })
        await p.locator('button.hab').nth(0).click(); await p.locator('button.hab').nth(1).click()
      }
    } else if (t === 'La cadena de un ataque') {
      await p.click('text=Empezar el ataque')
      await p.click('text=Cortar la cadena aquí'); await p.screenshot({ path: join(out, 'cadena-corte.png'), fullPage: true })
      await p.click('text=Probar otro eslabón')
      await p.click('text=Empezar el ataque'); await p.click('text=Dejar que avance'); await p.click('text=Cortar la cadena aquí')
      await p.click('text=Probar otro eslabón')
      await p.click('text=Empezar el ataque')
      for (let i = 0; i < 5; i++) await p.click('text=Dejar que avance')
    } else if (t === 'Una noche sin tablet') {
      await p.click('text=Paro, apunto'); await p.click('text=Apunto la hora')
    } else if (t === 'La llamada de soporte') {
      await p.click('text=Cuelgo y aviso')
    } else if (t.startsWith('Lunes')) {
      await p.click('text=Que no se toque nada'); await p.click('text=Al responsable de seguridad'); await p.click('text=Apuntamos desde')
    } else if (t === '¿Fraude o legítimo?') {
      const seq = ['bad', 'ok', 'bad', 'bad', 'bad', 'ok']
      for (const b of seq) { await p.click('button.' + b); await p.click('button:has-text("Siguiente")') }
    } else if (t === 'Inspecciona el enlace') {
      for (const [a, b] of [['correos >> nth=0', 'Me fío'], ['.top', 'No me fío'], ['.com', 'No me fío']]) { await p.click('.url button:has-text("' + a.split(' ')[0] + '") >> nth=' + (a.includes('nth=0') ? 0 : 0)); await p.click('text=' + b); await p.click('text=Siguiente') }
    } else if (t === 'Prueba tu contraseña') {
      await p.fill('#pw', 'maria1985'); await p.click('#gen')
    } else if (t === 'Mi compromiso') {
      for (let i = 0; i < 5; i++) await p.locator('label.it').nth(i).click()
    }
  } catch (e) { console.log('FALLO en', t, e.message.split('\n').slice(0, 8).join('\n'), '\nTEXTO:', (await p.evaluate(() => document.body.innerText)).slice(0, 300)) }
  await p.waitForTimeout(300)
  await p.screenshot({ path: join(out, s.id + '.png'), fullPage: true })
  const log = await p.evaluate(() => window.__log)
  const ok = log.includes('complete')
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
  if (!ok || errors.length || overflow) fails++
  console.log(s.id, t, ok ? 'COMPLETA' : 'NO COMPLETA', overflow ? 'OVERFLOW-X' : '', errors.length ? 'ERRORES: ' + errors.join(' | ') : '')
  await p.close()
}
// SVG: capturas
const svgs = Object.keys(zip.files).filter((f) => f.endsWith('.svg'))
for (const f of svgs) {
  const p = await ctx.newPage()
  await p.setViewportSize({ width: 660, height: 380 })
  const data = await zip.file(f).async('string')
  const file = join(out, f.replaceAll('/', '_') + '.html')
  writeFileSync(file, `<!doctype html><body style="margin:10px;background:#fff">${data}</body>`)
  await p.goto('file:///' + file.replaceAll('\\', '/'))
  await p.screenshot({ path: join(out, f.replaceAll('/', '_') + '.png') })
  await p.close()
}
await browser.close()
process.exit(fails ? 1 : 0)
