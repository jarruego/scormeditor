/**
 * Utilidades con Chrome real para las imágenes generadas (docs/curso-ciberseguridad/imagenes/):
 *   node imagenes-tools.mjs optimize [nombre...]   → entrada/*.png a optimizadas/*.jpg (1280 px, q.80)
 *   node imagenes-tools.mjs sheet <salida.png> <nombre...>  → hoja de contacto con etiquetas
 *   node imagenes-tools.mjs grid <nombre> <salida.png>      → imagen con rejilla del 10 % (para medir zonas)
 *   node imagenes-tools.mjs boxes <nombre> <salida.png> x,y,w,h,etiqueta ...  → dibuja cajas (en %)
 * `nombre` = nombre base sin extensión (c1_portada).
 */
import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'docs', 'curso-ciberseguridad', 'imagenes')
const IN = join(ROOT, 'entrada')
const OUT = join(ROOT, 'optimizadas')
const [cmd, ...rest] = process.argv.slice(2)

function find(name) {
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) {
    const p = join(IN, `${name}.${ext}`)
    if (existsSync(p)) return p
  }
  return null
}
const dataUrl = (p) => `data:image/${p.endsWith('.png') ? 'png' : 'jpeg'};base64,${readFileSync(p).toString('base64')}`

const b = await chromium.launch({ channel: 'chrome', headless: true })
const page = await b.newPage()
await page.goto('about:blank')

async function render(fn, arg) {
  return page.evaluate(fn, arg)
}

if (cmd === 'optimize') {
  mkdirSync(OUT, { recursive: true })
  const names = rest.length ? rest : readdirSync(IN).filter((f) => /\.(png|jpe?g|webp)$/i.test(f) && !/^ref_/.test(f) && !/_2\.(png|jpe?g|webp)$/i.test(f)).map((f) => f.replace(/\.[^.]+$/, ''))
  let tot = 0
  for (const n of names) {
    const p = find(n)
    if (!p) { console.log('✗ no existe', n); continue }
    const res = await render(async ({ src, W }) => {
      const img = new Image()
      img.src = src
      await img.decode()
      const w = Math.min(W, img.naturalWidth), h = Math.round((img.naturalHeight * w) / img.naturalWidth)
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      const g = c.getContext('2d')
      g.imageSmoothingQuality = 'high'
      g.fillStyle = '#fff'; g.fillRect(0, 0, w, h)
      g.drawImage(img, 0, 0, w, h)
      return { url: c.toDataURL('image/jpeg', 0.8), w, h, ow: img.naturalWidth, oh: img.naturalHeight }
    }, { src: dataUrl(p), W: 1280 })
    const buf = Buffer.from(res.url.split(',')[1], 'base64')
    writeFileSync(join(OUT, `${n}.jpg`), buf)
    tot += buf.length
    console.log(`✓ ${n}  ${res.ow}x${res.oh} → ${res.w}x${res.h}  ${(buf.length / 1024).toFixed(0)} KB`)
  }
  console.log(`total ${(tot / 1048576).toFixed(1)} MB, ${names.length} imágenes`)
} else if (cmd === 'sheet') {
  const [out, ...names] = rest
  const cols = 3, cw = 560, ch = 373
  const imgs = names.map((n) => ({ n, src: find(n) ? dataUrl(find(n)) : null }))
  const url = await render(async ({ imgs, cols, cw, ch }) => {
    const rows = Math.ceil(imgs.length / cols)
    const c = document.createElement('canvas')
    c.width = cols * cw; c.height = rows * (ch + 26)
    const g = c.getContext('2d')
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height)
    g.font = '16px sans-serif'; g.fillStyle = '#111'
    for (let i = 0; i < imgs.length; i++) {
      const x = (i % cols) * cw, y = Math.floor(i / cols) * (ch + 26)
      if (imgs[i].src) {
        const im = new Image(); im.src = imgs[i].src; await im.decode()
        g.drawImage(im, x + 4, y + 22, cw - 8, ch - 4)
      }
      g.fillText(imgs[i].n, x + 6, y + 16)
    }
    return c.toDataURL('image/png')
  }, { imgs, cols, cw, ch })
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'))
  console.log('hoja →', out)
} else if (cmd === 'grid' || cmd === 'boxes') {
  const [name, out, ...boxes] = rest
  const p = find(name)
  const url = await render(async ({ src, boxes, grid }) => {
    const im = new Image(); im.src = src; await im.decode()
    const W = 1200, H = Math.round((im.naturalHeight * W) / im.naturalWidth)
    const c = document.createElement('canvas'); c.width = W; c.height = H
    const g = c.getContext('2d'); g.drawImage(im, 0, 0, W, H)
    if (grid) {
      g.lineWidth = 1; g.font = 'bold 15px sans-serif'
      for (let k = 1; k < 10; k++) {
        g.strokeStyle = k === 5 ? 'rgba(255,0,0,.9)' : 'rgba(255,0,255,.55)'
        g.beginPath(); g.moveTo((W * k) / 10, 0); g.lineTo((W * k) / 10, H); g.stroke()
        g.beginPath(); g.moveTo(0, (H * k) / 10); g.lineTo(W, (H * k) / 10); g.stroke()
        g.fillStyle = '#fff'; g.fillRect((W * k) / 10 + 2, 2, 34, 18); g.fillRect(2, (H * k) / 10 + 2, 34, 18)
        g.fillStyle = '#c0c'; g.fillText(String(k * 10), (W * k) / 10 + 4, 16); g.fillText(String(k * 10), 4, (H * k) / 10 + 16)
      }
    }
    for (const bx of boxes) {
      const [x, y, w, h, ...l] = bx.split(',')
      g.strokeStyle = '#ff2d55'; g.lineWidth = 3
      g.strokeRect((x / 100) * W, (y / 100) * H, (w / 100) * W, (h / 100) * H)
      g.fillStyle = 'rgba(255,45,85,.85)'; g.fillRect((x / 100) * W, (y / 100) * H - 20, 200, 20)
      g.fillStyle = '#fff'; g.font = 'bold 14px sans-serif'; g.fillText(l.join(',').slice(0, 26), (x / 100) * W + 4, (y / 100) * H - 5)
    }
    return c.toDataURL('image/png')
  }, { src: dataUrl(p), boxes: boxes || [], grid: cmd === 'grid' })
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'))
  console.log(cmd, '→', out)
} else {
  console.log('Uso: optimize | sheet | grid | boxes (ver cabecera)')
}
await b.close()
