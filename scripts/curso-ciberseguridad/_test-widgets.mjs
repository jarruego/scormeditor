// Prueba visual de los widgets en un Chrome real (móvil 390 px). Uso: node _test-widgets.mjs <carpetaSalida>
import { chromium } from 'playwright-core'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { swipeDeck, chatStory, passwordLab, urlLab, pledge } from './widgets.mjs'

const out = process.argv[2]
mkdirSync(out, { recursive: true })
const shim = `<script>window.__log=[];window.MeEmbed={version:1,id:'t',completed:false,state:null,stateMax:100,complete:function(){window.__log.push('complete');this.completed=true},saveState:function(o){window.__log.push('save '+JSON.stringify(o))}};</script>`
const page = (w) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${w.css}</style></head><body>${shim}${w.html}<script>${w.js}</script></body></html>`

const widgets = {
  swipe: swipeDeck({ cards: [
    { canal: '✉️ Correo', de: 'soporte@residenc1a-vida.com', asunto: 'Su cuenta será bloqueada hoy', texto: 'Pulse aquí para verificar su usuario en 24 h o perderá el acceso.', fraude: true, pistas: ['Dominio con un 1 en lugar de i', 'Urgencia'], porque: 'Ningún servicio serio amenaza con bloquear la cuenta en 24 h.' },
    { canal: '💬 WhatsApp', de: 'Dirección (número de la agenda)', texto: 'Mañana cambio de turno, mira el cuadrante en la carpeta compartida.', fraude: false, pistas: ['Número conocido', 'Sin enlaces raros'], porque: 'Mensaje esperable por el canal habitual.' },
  ] }),
  chat: chatStory({ contacto: { nombre: 'Soporte técnico', emoji: '🎧', sub: 'llamada entrante' }, estilo: 'llamada', nodos: {
    n1: { msgs: [['sys', 'Suena el teléfono de recepción.'], ['them', 'Buenos días, soy del soporte de Microsoft. Su ordenador tiene un virus. Instale esta aplicación para que lo arreglemos.']], choices: [{ t: 'Instalo lo que me pide', next: 'bad', q: 'bad', fb: 'Dar control remoto a un desconocido es peligroso.' }, { t: 'Cuelgo y aviso a mi responsable', next: 'good', q: 'good', fb: 'Microsoft no llama a nadie por sorpresa.' }] },
    bad: { msgs: [['sys', 'Pierdes el control del ordenador.']], fin: { tipo: 'bad', titulo: 'Acceso comprometido', texto: 'Avisa ya a tu responsable.' } },
    good: { msgs: [['sys', 'Llamada finalizada.']], fin: { tipo: 'good', titulo: '¡Bien hecho!', texto: 'Colgar y avisar es lo correcto.' } },
  } }),
  pass: passwordLab(),
  url: urlLab({ urls: [{ partes: ['https://', 'www.', 'agenciatributaria', '.es', '/login'], dominio: 2, fiable: true, porque: 'El dominio es agenciatributaria.es.' }, { partes: ['https://', 'agenciatributaria', '.es', '.cobro-seguro', '.xyz', '/pago'], dominio: 3, fiable: false, porque: 'El dominio real es cobro-seguro.xyz.' }] }),
  pledge: pledge({ items: ['Bloquear la pantalla', 'No compartir contraseñas', 'Avisar ante un correo raro'], minimo: 2 }),
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
  if (name === 'swipe') {
    await p.click('button.bad'); await p.click('button:has-text("Siguiente")'); await p.click('button.ok'); await p.click('button:has-text("Siguiente")')
  } else if (name === 'chat') {
    await p.click('text=Cuelgo y aviso')
  } else if (name === 'pass') {
    await p.fill('#pw', 'maria1985'); await p.screenshot({ path: join(out, name + '-weak.png') })
    await p.click('#gen')
  } else if (name === 'url') {
    await p.click('button:has-text("agenciatributaria") >> nth=0'); await p.click('text=Me fío'); await p.click('text=Siguiente')
    await p.click('button:has-text(".xyz")'); await p.click('text=No me fío'); await p.click('text=Siguiente')
  } else if (name === 'pledge') {
    await p.click('label.it >> nth=0'); await p.click('label.it >> nth=1')
  }
  } catch (e) { console.log('FALLO en', name, e.message.split('\n').slice(0, 14).join('\n'), '\nTEXTO:', (await p.evaluate(() => document.body.innerText)).slice(0, 500)) }
  await p.waitForTimeout(300)
  await p.screenshot({ path: join(out, name + '.png'), fullPage: true })
  const log = await p.evaluate(() => window.__log)
  const ok = log.includes('complete')
  if (!ok || errors.length) fails++
  console.log(name, ok ? 'COMPLETA' : 'NO COMPLETA', JSON.stringify(log).slice(0, 160), errors.length ? 'ERRORES: ' + errors.join(' | ') : '')
  await p.close()
}
await browser.close()
process.exit(fails ? 1 : 0)
