/**
 * Extrae el id de un vídeo de YouTube de una URL completa (watch, youtu.be,
 * embed, shorts); `null` si la URL no se reconoce como de YouTube. El autor
 * pega el enlace tal cual lo copia del navegador — no hace falta que teclee
 * el id desnudo.
 *
 * Réplica en `src/runtime/assets/js/renderer.js` (`youtubeId`, misma lógica):
 * el runtime es JS plano sin build (ver CLAUDE.md, «una sola fuente para el
 * runtime») y no puede importar este módulo, así que la detección vive
 * duplicada a propósito en los dos sitios.
 */
const YOUTUBE_RE =
  /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/

export function extractYoutubeId(url: string): string | null {
  const m = YOUTUBE_RE.exec(url.trim())
  return m ? m[1] : null
}
