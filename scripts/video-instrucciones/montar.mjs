// Monta el vídeo demo de la pantalla «Instrucciones de uso» (receta `guide`).
//  1. Voz: ElevenLabs (clave y voz del .env de la raíz), una pista por frase de guion.mjs
//     con el instante de cada palabra (caché en _tmp/voz).
//  2. anim.html anima las capturas REALES de la carcasa (capturar.mjs: ejecutarlo antes)
//     con cámara, foco y cursor sincronizados con la voz; se captura fotograma a fotograma.
//  3. Se codifica a MP4 ligero (1280×720) y se generan los subtítulos VTT y la
//     transcripción con los tiempos reales de la voz.
// Salida: src/assets/instrucciones/{instrucciones-uso.mp4, .jpg (póster), .vtt, transcripcion.txt}
// Uso (desde la raíz del repo): node scripts/video-instrucciones/capturar.mjs
//                               node scripts/video-instrucciones/montar.mjs
//   PRUEBA=1 → solo fotogramas sueltos en _tmp/prueba_*.png (TIEMPOS=3,10.5 para elegirlos)
import { chromium } from 'playwright-core'
import { execFileSync, spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { FRASES } from './guion.mjs'

const AQUI = path.dirname(fileURLToPath(import.meta.url))
const RAIZ = path.resolve(AQUI, '../..')
const TMP = path.join(AQUI, '_tmp')
const VOZ = path.join(TMP, 'voz')
const CAPT = path.join(TMP, 'capturas')
const SALIDA = path.join(RAIZ, 'src/assets/instrucciones')
for (const d of [TMP, VOZ, SALIDA]) mkdirSync(d, { recursive: true })
if (!existsSync(path.join(CAPT, 'rects.json'))) { console.error('Faltan las capturas: ejecuta antes capturar.mjs'); process.exit(1) }

const ENV = path.join(RAIZ, '.env')
if (existsSync(ENV)) process.loadEnvFile(ENV)
const EL = {
  clave: process.env.ELEVENLABS_API_KEY?.trim() || '',
  voz: process.env.ELEVENLABS_VOICE_ID?.trim() || '',
  modelo: process.env.ELEVENLABS_MODEL?.trim() || 'eleven_multilingual_v2',
  velocidad: Number(process.env.ELEVENLABS_SPEED || 1),
}
if (!EL.clave || !EL.voz) { console.error('Falta ELEVENLABS_API_KEY / ELEVENLABS_VOICE_ID en .env'); process.exit(1) }

const FPS = 30
const LEAD = 2.6, GAP = 0.45, TAIL = 1.8 // LEAD: el rótulo de apertura se ve antes de la primera frase
const PRUEBA = !!process.env.PRUEBA
const run = (cmd, args) => execFileSync(cmd, args, { cwd: TMP, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 })
const durOf = (f) => parseFloat(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString())
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36)

// 1) Voz con marcas de palabra (ElevenLabs with-timestamps)
async function vozEL (texto, anterior, siguiente) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${EL.voz}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': EL.clave, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      text: texto, model_id: EL.modelo, previous_text: anterior || undefined, next_text: siguiente || undefined,
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true, speed: EL.velocidad },
    }),
  })
  if (!r.ok) throw new Error(`ElevenLabs: ${r.status} ${(await r.text()).slice(0, 300)}`)
  const j = await r.json()
  const al = j.alignment || j.normalized_alignment
  const words = []
  let cur = null
  al.characters.forEach((c, i) => {
    if (/\s/.test(c)) { cur = null; return }
    if (!cur) { cur = { w: '', t: al.character_start_times_seconds[i], d: 0 }; words.push(cur) }
    cur.w += c
    cur.d = al.character_end_times_seconds[i] - cur.t
  })
  return { mp3: Buffer.from(j.audio_base64, 'base64'), words }
}
console.log(`Voz: ElevenLabs (${EL.voz}, ${EL.modelo})`)
const frases = []
for (const [j, texto] of FRASES.entries()) {
  const base = `el_${j}_${hash(EL.voz + EL.modelo + EL.velocidad + texto)}`
  const mp3 = path.join(VOZ, base + '.mp3'), json = path.join(VOZ, base + '.json')
  if (!existsSync(mp3) || !existsSync(json)) {
    const r = await vozEL(texto, FRASES[j - 1], FRASES[j + 1])
    writeFileSync(mp3, r.mp3); writeFileSync(json, JSON.stringify(r.words))
  }
  frases.push({ texto, mp3, dur: durOf(mp3), words: JSON.parse(readFileSync(json, 'utf8')) })
}

// 2) Línea de tiempo + pista de voz
let cursor = LEAD
for (const f of frases) { f.ini = cursor; f.fin = cursor + f.dur; cursor += f.dur + GAP }
const DUR = cursor - GAP + TAIL
if (!PRUEBA) {
  const sil = (s) => ['-f', 'lavfi', '-t', s.toFixed(3), '-i', 'anullsrc=r=44100:cl=mono']
  const entradas = sil(LEAD)
  frases.forEach((f, k) => entradas.push('-i', f.mp3, ...sil(k === frases.length - 1 ? TAIL : GAP)))
  const n = entradas.filter((x) => x === '-i').length
  const partes = Array.from({ length: n }, (_, k) => `[${k}:a]aresample=44100,aformat=channel_layouts=mono[p${k}]`)
  run('ffmpeg', ['-y', ...entradas, '-filter_complex', `${partes.join(';')};${Array.from({ length: n }, (_, k) => `[p${k}]`).join('')}concat=n=${n}:v=0:a=1[a]`,
    '-map', '[a]', 'voz.wav'])
}

// 3) Fotogramas
const navegador = await chromium.launch({ channel: 'chrome', headless: true, args: ['--allow-file-access-from-files'] })
const pag = await navegador.newPage({ viewport: { width: 1920, height: 1080 } })
const errores = []
pag.on('pageerror', (e) => errores.push(e.message))
await pag.goto(pathToFileURL(path.join(AQUI, 'anim.html')).href)
await pag.evaluate((d) => window.__go(d), {
  dur: DUR,
  capturas: pathToFileURL(CAPT).href + '/',
  rects: JSON.parse(readFileSync(path.join(CAPT, 'rects.json'), 'utf8')),
  s: frases.map((f) => ({ a: f.ini, b: f.fin, words: f.words.map((w) => ({ ...w, t: f.ini + w.t })) })),
})
await pag.evaluate(() => Promise.all([...document.images].map((i) => i.complete ? 0 : new Promise((ok) => { i.onload = i.onerror = ok }))))
if (errores.length) throw new Error(errores.join(' | '))

if (PRUEBA) {
  const tiempos = process.env.TIEMPOS ? process.env.TIEMPOS.split(',').map(Number) : frases.map((f) => f.ini + f.dur * 0.6)
  for (const tt of tiempos) {
    await pag.evaluate((t) => window.__frame(t), tt)
    await pag.screenshot({ path: path.join(TMP, `prueba_${tt.toFixed(1)}.png`) })
  }
  console.log(`Duración ${DUR.toFixed(1)} s · frases: ${frases.map((f) => f.ini.toFixed(1)).join(', ')}`)
  console.log('Pruebas en ' + TMP)
  await navegador.close(); process.exit(0)
}

const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', 'voz.wav',
  '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-tune', 'stillimage', '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '96k', '-ac', '1', '-ar', '44100', '-movflags', '+faststart', '-shortest', 'instrucciones-uso.mp4'],
{ cwd: TMP, stdio: ['pipe', 'ignore', 'ignore'] })
const fin = new Promise((ok) => ff.on('close', ok))
const n = Math.round(DUR * FPS)
for (let k = 0; k < n; k++) {
  await pag.evaluate((t) => window.__frame(t), k / FPS)
  const buf = await pag.screenshot({ type: 'jpeg', quality: 92 })
  if (!ff.stdin.write(buf)) await once(ff.stdin, 'drain')
  if (k % 300 === 0) console.log(`  ${k}/${n}`)
}
ff.stdin.end()
const codigo = await fin
await navegador.close()
if (codigo !== 0) throw new Error('ffmpeg falló al codificar')
if (errores.length) throw new Error(errores.join(' | '))
writeFileSync(path.join(SALIDA, 'instrucciones-uso.mp4'), readFileSync(path.join(TMP, 'instrucciones-uso.mp4')))
// Póster: el rótulo de apertura (lo que se ve antes de darle a reproducir).
run('ffmpeg', ['-y', '-ss', '1.6', '-i', 'instrucciones-uso.mp4', '-frames:v', '1', '-q:v', '4', path.join(SALIDA, 'instrucciones-uso.jpg')])

// 4) Subtítulos (trozos cortos cortados en la puntuación) y transcripción
const ts = (s) => {
  const ms = Math.round(s * 1000)
  const h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`
}
const cues = []
for (const f of frases) {
  let trozo = []
  const cierra = (finT) => { if (trozo.length) cues.push({ a: f.ini + trozo[0].t, b: finT, tx: trozo.map((w) => w.w).join(' ') }); trozo = [] }
  f.words.forEach((w, i) => {
    trozo.push(w)
    const largo = trozo.map((x) => x.w).join(' ').length
    const sig = f.words[i + 1]
    if (sig && ((largo > 38 && /[.,:;!?]$/.test(w.w)) || largo > 70)) cierra(f.ini + w.t + w.d + 0.15)
  })
  cierra(f.fin + 0.3)
}
cues.forEach((c, i) => { if (cues[i + 1] && c.b > cues[i + 1].a) c.b = cues[i + 1].a - 0.02 })
writeFileSync(path.join(SALIDA, 'instrucciones-uso.vtt'),
  'WEBVTT\n\n' + cues.map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(c.b)}\n${c.tx}\n`).join('\n'))
writeFileSync(path.join(SALIDA, 'transcripcion.txt'), FRASES.join('\n\n') + '\n')
const kb = Math.round(readFileSync(path.join(SALIDA, 'instrucciones-uso.mp4')).length / 1024)
console.log(`Vídeo listo: ${DUR.toFixed(1)} s, ${kb} KB → ${SALIDA}`)
