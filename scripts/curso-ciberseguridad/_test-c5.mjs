// Prueba en Chrome real (390 px) de TODOS los html_embed del .scormproj del curso 5, y capturas de los SVG.
// Uso: node scripts/curso-ciberseguridad/_test-c5.mjs <carpetaSalida>
import { chromium } from 'playwright-core'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import JSZip from 'jszip'

const out = process.argv[2]
mkdirSync(out, { recursive: true })
const zip = await JSZip.loadAsync(readFileSync('docs/curso-ciberseguridad/scormproj/cibersegsoc-c5-datos-brechas.scormproj'))
const course = JSON.parse(await zip.file('course.json').async('string'))
const screens = [...course.intro_screens, ...course.modules.flatMap((m) => [...m.screens, ...m.units.flatMap((u) => u.screens)])]
const embeds = screens.filter((s) => s.interaction?.type === 'html_embed')
const shim = `<script>window.__log=[];window.MeEmbed={version:1,id:'t',completed:false,state:null,stateMax:100,complete:function(){window.__log.push('complete');this.completed=true},saveState:function(o){var j=JSON.stringify(o);if(j.length>this.stateMax||/[^\\x20-\\x7e]/.test(j)||j.indexOf('~')>-1){window.__log.push('BADSTATE '+j);return}window.__log.push('save '+j)}};</script>`
const page = (c) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${c.css}</style></head><body>${shim}${c.html}<script>${c.js}</script></body></html>`

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1 })
let fails = 0
for (const s of embeds) {
  const c = s.interaction.config
  const name = s.id + '-' + s.title.replace(/[^a-z0-9]+/gi, '_').slice(0, 24)
  const file = join(out, name + '.html')
  writeFileSync(file, page(c))
  const p = await ctx.newPage()
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  await p.goto('file:///' + file.replaceAll('\\', '/'))
  await p.waitForTimeout(150)
  p.setDefaultTimeout(3000)
  let note = ''
  try {
    const t = s.title
    if (t.includes('Quién puede verlo')) {
      for (let k = 0; k < 7; k++) {
        await p.click('.aud button >> nth=0'); await p.click('button:has-text("Comprobar")')
        if (k === 0) await p.screenshot({ path: join(out, name + '-fb.png'), fullPage: true })
        await p.click('button:has-text("Siguiente")')
      }
    } else if (t.includes('Detective')) {
      await p.click('.ln >> nth=0'); await p.click('.ln >> nth=2'); await p.click('button:has-text("Comprobar")')
    } else if (t.includes('72 horas')) {
      for (let k = 0; k < 3; k++) { await p.click('.opt >> nth=' + (k === 0 ? 1 : 0)); if (k === 0) await p.screenshot({ path: join(out, name + '-mid.png'), fullPage: true }); await p.click('button:has-text("Seguir"), button:has-text("Ver el resultado")') }
    } else if (t.includes('compromiso')) {
      for (let k = 0; k < 5; k++) await p.click('label.it >> nth=' + k)
    } else if (c.js.includes("'hint l")) {
      const n = (c.js.match(/"fraude"/g) || []).length
      for (let k = 0; k < n; k++) { await p.click(k % 2 ? 'button.ok' : 'button.bad'); if (k === 0) await p.screenshot({ path: join(out, name + '-fb.png'), fullPage: true }); await p.click('button:has-text("Siguiente")') }
    } else {
      // Chat: 25 partidas aleatorias; comprobar que siempre se completa
      for (let run = 0; run < 25; run++) {
        for (let step = 0; step < 12; step++) {
          const opts = await p.$$('.opts button:not(.ghost)')
          if (!opts.length) break
          await opts[Math.floor(Math.random() * opts.length)].click()
        }
        if (run === 0) await p.screenshot({ path: join(out, name + '-end.png'), fullPage: true })
        const again = await p.$('.opts button.ghost')
        if (again) await again.click(); else { note += ' (sin final en run ' + run + ')'; break }
      }
    }
  } catch (e) { note += ' FALLO: ' + e.message.split('\n')[0] + ' | TEXTO: ' + (await p.evaluate(() => document.body.innerText)).slice(0, 200).replace(/\n/g, ' / ') }
  await p.waitForTimeout(200)
  await p.screenshot({ path: join(out, name + '.png'), fullPage: true })
  const log = await p.evaluate(() => window.__log)
  const ok = log.includes('complete')
  const bad = log.filter((l) => l.startsWith('BADSTATE'))
  if (!ok || errors.length || bad.length || note.includes('FALLO')) fails++
  console.log(s.id, s.title, '→', ok ? 'COMPLETA' : 'NO COMPLETA', bad.length ? 'ESTADO MALO ' + bad[0] : '', errors.length ? 'ERRORES: ' + errors.join(' | ') : '', note)
  await p.close()
}
// SVG: capturas a 390 px de ancho (como se verían en móvil)
for (const f of Object.keys(zip.files).filter((x) => x.endsWith('.svg'))) {
  const p = await ctx.newPage()
  const svgText = await zip.file(f).async('string')
  await p.setContent(`<body style="margin:0;background:#fff"><div style="width:390px">${svgText.replace(/width="640" height="360"/, 'width="390" style="display:block;height:auto"')}</div></body>`)
  await p.screenshot({ path: join(out, 'svg_' + f.split('/').pop().replace('.svg', '') + '.png'), fullPage: true })
  await p.close()
}
await browser.close()
console.log(embeds.length, 'embeds;', fails, 'fallos')
process.exit(fails ? 1 : 0)
