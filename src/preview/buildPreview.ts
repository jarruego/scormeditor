import type { Course } from '../schema/course.schema'
import { getRuntimeFiles } from '../scorm/runtimeAssets'

/**
 * Construye un documento HTML autocontenido (mismos CSS/JS de la carcasa)
 * con los datos del curso inyectados en window.__COURSE_DATA__.
 * Se usa como srcdoc del iframe de "Vista estudiante". Sin LMS → SCORM entra
 * en modo standalone automáticamente.
 *
 * Los assets subidos al editor se inyectan como blob URLs en window.__ASSETS__
 * (mapa rutaRelativa -> blob:), de modo que imágenes, vídeo, audio de locución y
 * subtítulos se reproducen también en la previsualización.
 */
export function buildPreviewHtml(course: Course, assetUrls: Record<string, string> = {}, startScreenId?: string): string {
  const files = getRuntimeFiles()
  const get = (p: string) => files.find((f) => f.path === p)?.content ?? ''

  const css = get('assets/css/styles.css')
  // print.css ya viene envuelto en @media print; se inyecta para que "Imprimir"
  // en Vista estudiante limite la salida a la pantalla actual igual que el ZIP.
  const printCss = get('print/print.css')
  // Orden de carga idéntico al index.html de la carcasa
  const jsOrder = [
    'assets/js/scorm_api.js',
    'assets/js/accessibility.js',
    'assets/js/icons.js',
    'assets/js/interactions.js',
    'assets/js/renderer.js',
    'assets/js/app.js',
  ]
  const js = jsOrder.map(get).join('\n;\n')

  // Extraemos el <body> de la carcasa para reutilizar el markup exacto
  const indexHtml = get('index.html')
  const bodyMatch = /<body>([\s\S]*?)<\/body>/i.exec(indexHtml)
  let body = bodyMatch ? bodyMatch[1] : ''
  // Quitamos los <script src> (los inlineamos nosotros)
  body = body.replace(/<script\s+src=[^>]*><\/script>/gi, '')

  // Las tres se interpolan en un <script> inline del mismo origen que el editor:
  // hay que neutralizar </script> en TODAS (los ids de pantalla son texto libre).
  const data = JSON.stringify(course).replace(/<\/script>/gi, '<\\/script>')
  const assetsJson = JSON.stringify(assetUrls).replace(/<\/script>/gi, '<\\/script>')
  const startJson = JSON.stringify(startScreenId || null).replace(/<\/script>/gi, '<\\/script>')

  // Se interpola en un atributo HTML: solo se acepta un código de idioma válido
  // (defensa en profundidad además de la validación del schema).
  const lang = /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(course.shell.language) ? course.shell.language : 'es'

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${css}</style>
<style>${printCss}</style></head>
<body>${body}
<script>window.__COURSE_DATA__ = ${data}; window.__AUTHOR_MODE__ = true; window.__ASSETS__ = ${assetsJson}; window.__START_SCREEN_ID__ = ${startJson};</script>
<script>${js}</script>
</body></html>`
}
