import { chromium } from 'playwright-core'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import * as K from './svgkit.mjs'
const { svg, bg, person, phone, laptop, icon, bubble, pill, mailMock, text, caption, C, g } = K

const out = process.argv[2]
mkdirSync(out, { recursive: true })
const W = 640, H = 360
const scene = svg(W, H, bg(W, H, C.sky, '#fff') +
  person(110, 150, { shirt: C.teal, hairStyle: 'bun', badge: true }) +
  person(520, 150, { shirt: C.violet, skin: C.skin2, hairStyle: 'short', scale: 0.95 }) +
  phone(240, 40, 150, 270, mailMock(130, 242, { de: 'soporte@banco-seguro.xyz', asunto: 'Cuenta bloqueada', cuerpo: 'Pulse aquí en 24 h\no perderá el acceso.', boton: 'VERIFICAR', fraude: true })) +
  icon.warn(420, 90, 56) + icon.hook(420, 200, 56) + icon.lock(190, 60, 44) + icon.shield(560, 60, 50) +
  bubble(20, 20, 150, 56, 'Hola, soy\ndel banco', { tail: 'b', size: 14 }) +
  pill(230, 322, 'Correo falso', C.red) + icon.wifi(80, 300, 40) + icon.usb(140, 300, 40) + icon.robot(590, 300, 44) + icon.eye(520, 300, 44) + icon.mic(40, 220, 36) + icon.bed(300, 340, 30),
  'Escena de prueba')
writeFileSync(join(out, 'scene.svg'), scene)
const b = await chromium.launch({ channel: 'chrome', headless: true })
const p = await b.newPage({ viewport: { width: W, height: H } })
await p.goto('file:///' + join(out, 'scene.svg').replaceAll('\\', '/'))
await p.screenshot({ path: join(out, 'scene.png') })
await b.close()
console.log('svg bytes', scene.length)
