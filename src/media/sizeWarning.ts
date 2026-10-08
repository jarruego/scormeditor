import { confirmDialog } from '../store/confirm'

/** Umbrales a partir de los cuales se avisa al subir (peso del fichero ya guardado
 *  en el paquete: en imágenes, el resultado tras optimizar). Solo avisan: el autor
 *  puede continuar. */
export const MAX_IMAGE_BYTES = 1024 * 1024
export const MAX_VIDEO_BYTES = 5 * 1024 * 1024

function fmtSize(n: number): string {
  if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB'
  return Math.round(n / 1024) + ' KB'
}

/** Devuelve `true` si el recurso es ligero o el autor decide usarlo igualmente. */
export async function confirmMediaSize(kind: 'image' | 'video', size: number): Promise<boolean> {
  const max = kind === 'image' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES
  if (size <= max) return true
  return confirmDialog({
    title: kind === 'image' ? 'Imagen pesada' : 'Vídeo pesado',
    message: kind === 'image'
      ? `La imagen pesa ${fmtSize(size)} (recomendado: menos de 1 MB). Una imagen pesada ralentiza la carga del curso, sobre todo en móvil. Puedes reducirla o recortarla antes de subirla.`
      : `El vídeo pesa ${fmtSize(size)} (recomendado: menos de 5 MB). Un vídeo pesado ralentiza la carga y engorda el paquete SCORM; para vídeos largos es mejor enlazar uno de YouTube.`,
    confirmLabel: 'Usar igualmente',
    cancelLabel: 'Cancelar',
  })
}
