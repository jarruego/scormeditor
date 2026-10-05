// Prueba en Chrome real (móvil 390 px) de los interactivos a medida del curso 2.
// Uso: node scripts/curso-ciberseguridad/_test-c2.mjs <carpetaSalida>
import { chromium } from 'playwright-core'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { passLab2, phraseBuilder, crackDuel, twoStepSim, swipeLabeled } from './c2-widgets.mjs'

const out = process.argv[2] || 'tmp-c2'
mkdirSync(out, { recursive: true })
const shim = `<script>window.__log=[];window.MeEmbed={version:1,id:'t',completed:false,state:null,stateMax:100,complete:function(){window.__log.push('complete');this.completed=true},saveState:function(o){var s=JSON.stringify(o);if(/[^\\x20-\\x7e]/.test(s)||s.length>this.stateMax){window.__log.push('BADSTATE '+s)}else window.__log.push('save '+s)}};</script>`
const page = (w) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${w.css}</style></head><body>${shim}${w.html}<script>${w.js}</script></body></html>`

const widgets = {
  lab: passLab2(),
  builder: phraseBuilder(),
  duel: crackDuel(),
  sim: twoStepSim(),
  swipe: swipeLabeled({ titulo: '¿Contraseña buena o mala?', ayuda: 'Desliza a la derecha si es buena y a la izquierda si es mala.', cards: [
    { canal: '🔑 Contraseña', de: 'Maria1234', texto: 'Nombre + números.', fraude: true, pistas: ['Nombre propio', 'Secuencia'], porque: 'Corta y previsible.' },
    { canal: '🔑 Contraseña', de: 'mi cafe de las seis y media', texto: 'Frase larga.', fraude: false, pistas: ['Larga'], porque: 'Longitud y sentido.' },
  ] }, { izq: 'mala', der: 'buena', btnIzq: '👎 Es mala', btnDer: '👍 Es buena', resIzq: 'una contraseña MALA.', resDer: 'una contraseña BUENA.', finBien: 'Bien.', finMal: 'Repite.' }),
}

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1 })
let fails = 0
for (const [name, w] of Object.entries(widgets)) {
  const file = join(out, name + '.html')
  writeFileSync(file, page(w))
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await p.goto('file:///' + file.replaceAll('\\', '/'))
  await p.waitForTimeout(200)
  p.setDefaultTimeout(4000)
  try {
    if (name === 'lab') {
      await p.click('#ex button >> nth=0'); await p.screenshot({ path: join(out, 'lab-weak.png'), fullPage: true })
      const l0 = await p.textContent('#lv'); await p.click('#ex button >> nth=1'); const l1 = await p.textContent('#lv')
      await p.click('#ex button >> nth=3'); const l3 = await p.textContent('#lv')
      await p.click('#ex button >> nth=2'); const l2 = await p.textContent('#lv')
      await p.fill('#pw', 'Residencia2026'); const l4 = await p.textContent('#lv')
      console.log('niveles:', l0, '|', l1, '|', l3, '|', l2, '|', l4)
      await p.click('#gen'); console.log('gen:', await p.inputValue('#pw'), await p.textContent('#lv'))
    } else if (name === 'builder') {
      const chips = await p.$$('.chips')
      await (await chips[0].$$('button'))[3].click()
      await p.screenshot({ path: join(out, 'builder-trap.png'), fullPage: true })
      for (let g = 0; g < 3; g++) await (await chips[g].$$('button'))[0].click()
      await p.click('#bn'); await p.click('#bs'); await p.click('#go')
    } else if (name === 'duel') {
      for (let k = 0; k < 5; k++) { await p.click('.duel button >> nth=1'); if (k === 0) await p.screenshot({ path: join(out, 'duel.png'), fullPage: true }); await p.click('button:has-text("Siguiente")') }
    } else if (name === 'sim') {
      const seq = [['🔒 Seguridad'], ['Verificación en dos pasos · desactivada'], ['Activar'], ['Aviso en el móvil'], ['En un lugar seguro'], ['Continuar a las pruebas'], ['No, no soy yo'], ['Cuelgo y aviso']]
      for (let k = 0; k < seq.length; k++) {
        if (k === 2) { await p.click('button:has-text("Ahora no")'); }
        if (k === 4) { await p.click('button:has-text("captura")') }
        await p.click(`.its button:has-text("${seq[k][0]}")`)
        if (k === 3) await p.screenshot({ path: join(out, 'sim.png'), fullPage: true })
        await p.click('button.nx')
      }
    } else if (name === 'swipe') {
      await p.click('button.bad'); await p.click('button:has-text("Siguiente")'); await p.click('button.ok'); await p.click('button:has-text("Siguiente")')
    }
  } catch (e) { console.log('FALLO en', name, e.message.split('\n').slice(0, 8).join('\n'), '\nTEXTO:', (await p.evaluate(() => document.body.innerText)).slice(0, 400)) }
  await p.waitForTimeout(300)
  await p.screenshot({ path: join(out, name + '.png'), fullPage: true })
  const log = await p.evaluate(() => window.__log)
  const sw = await p.evaluate(() => document.documentElement.scrollWidth)
  const ok = log.includes('complete')
  if (!ok || errors.length || sw > 392 || log.some((l) => l.startsWith('BAD'))) fails++
  console.log(name, ok ? 'COMPLETA' : 'NO COMPLETA', 'scrollW', sw, JSON.stringify(log).slice(0, 140), errors.length ? 'ERRORES: ' + errors.join(' | ') : '')
  await p.close()
}
await browser.close()
process.exit(fails ? 1 : 0)
