/**
 * Optimización de imágenes al subirlas: recorta las dimensiones a un lado máximo
 * y re-codifica para bajar el peso, de modo que el SCORM no cargue con imágenes
 * enormes innecesariamente. No toca vídeo, audio, VTT, SVG ni GIF.
 *
 * - Lado máximo `MAX_EDGE` (px): las imágenes más grandes se reescalan.
 * - PNG opaco → JPEG (comprime mucho mejor); PNG con transparencia se conserva
 *   como PNG; JPEG/WEBP conservan su formato.
 * - Solo se devuelve el resultado si de verdad pesa menos que el original.
 */

export interface OptimizeResult {
  blob: Blob
  ext: string
  changed: boolean
}

const MAX_EDGE = 1600
const QUALITY = 0.85

function extOf(file: File): string {
  return (file.name.split('.').pop() || 'bin').toLowerCase()
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

// ¿La imagen tiene algún píxel no totalmente opaco?
function hasAlpha(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  const data = ctx.getImageData(0, 0, w, h).data
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true
  }
  return false
}

export async function optimizeImage(file: File): Promise<OptimizeResult> {
  const type = file.type
  // Vectores y animaciones se dejan intactos (perderían calidad/animación).
  if (!type.startsWith('image/') || type === 'image/svg+xml' || type === 'image/gif') {
    return { blob: file, ext: extOf(file), changed: false }
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return { blob: file, ext: extOf(file), changed: false }
  }

  const { width, height } = bitmap
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
  const w = Math.max(1, Math.round(width * scale))
  const h = Math.max(1, Math.round(height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close?.()
    return { blob: file, ext: extOf(file), changed: false }
  }
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  // Formato de salida: PNG opaco pasa a JPEG (mucho más ligero para fotos).
  let outType: string
  if (type === 'image/png') outType = hasAlpha(ctx, w, h) ? 'image/png' : 'image/jpeg'
  else if (type === 'image/webp') outType = 'image/webp'
  else outType = 'image/jpeg'

  const quality = outType === 'image/png' ? undefined : QUALITY
  const out = await canvasToBlob(canvas, outType, quality)
  if (!out) return { blob: file, ext: extOf(file), changed: false }

  const ext = outType === 'image/jpeg' ? 'jpg' : outType === 'image/webp' ? 'webp' : 'png'

  // Si no se ha reescalado y encima pesa más, no merece la pena: usa el original.
  if (scale === 1 && out.size >= file.size) {
    return { blob: file, ext: extOf(file), changed: false }
  }
  return { blob: out, ext, changed: true }
}
