/**
 * Documentos PDF adjuntos al curso (Materiales → Documentos): límites y utilidades
 * compartidas por el editor (al subir) y por los validadores.
 *
 * Límites de sentido común para un paquete SCORM que se sube a un LMS y se abre
 * también en móvil: solo PDF (formato universal que el navegador abre sin
 * instalar nada), pocos documentos y ligeros. Un PDF más pesado suele ser un
 * escaneado o un libro entero: mejor enlazarlo desde Recursos.
 */

/** Tamaño máximo de un documento (bloquea la subida). */
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
/** A partir de este tamaño se avisa al subir (se puede continuar). */
export const WARN_ATTACHMENT_BYTES = 5 * 1024 * 1024
/** Número máximo de documentos por curso. */
export const MAX_ATTACHMENTS = 10
/** Peso total recomendado de todos los documentos (aviso del validador). */
export const MAX_ATTACHMENTS_TOTAL_BYTES = 25 * 1024 * 1024
/** Carpeta de los documentos dentro de `assets/`. */
export const ATTACHMENTS_DIR = 'assets/docs/'

/** Tamaño legible en español (coma decimal). */
export function fmtBytes(n: number): string {
  if (n >= 1024 * 1024) return (n / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB'
  if (n >= 1024) return Math.round(n / 1024) + ' KB'
  return n + ' B'
}

/** ¿El binario es un PDF? Se comprueba la firma «%PDF-» de los primeros bytes,
 *  no la extensión ni el tipo MIME (que dependen del sistema del autor). */
export async function isPdfBlob(blob: Blob): Promise<boolean> {
  const head = new Uint8Array(await blob.slice(0, 1024).arrayBuffer())
  const sig = [0x25, 0x50, 0x44, 0x46, 0x2d] // %PDF-
  for (let i = 0; i + sig.length <= head.length; i++) {
    if (sig.every((b, k) => head[i + k] === b)) return true
  }
  return false
}

/** Nombre de fichero seguro a partir del original (sin acentos ni espacios). */
export function attachmentFileName(original: string): string {
  const base = original.replace(/\.pdf$/i, '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'documento'
  return base + '.pdf'
}

/** Ruta libre en `assets/docs/` (añade -2, -3… si ya existe). */
export function uniqueAttachmentPath(original: string, taken: (path: string) => boolean): string {
  const name = attachmentFileName(original).replace(/\.pdf$/, '')
  let path = `${ATTACHMENTS_DIR}${name}.pdf`
  for (let n = 2; taken(path); n++) path = `${ATTACHMENTS_DIR}${name}-${n}.pdf`
  return path
}
