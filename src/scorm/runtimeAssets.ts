/**
 * Carga la plantilla de la carcasa (src/runtime/**) como strings en tiempo de
 * build. Vite inlinea el contenido con la query ?raw. Las claves se normalizan
 * a la ruta destino dentro del ZIP (sin el prefijo de runtime).
 *
 * Garantía: lo que se prueba en "Vista estudiante" es EXACTAMENTE lo que se
 * exporta, porque ambos consumen estos mismos strings.
 */
const modules = import.meta.glob('../runtime/**/*.{html,css,js}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

export type RuntimeFile = { path: string; content: string }

export function getRuntimeFiles(): RuntimeFile[] {
  return Object.entries(modules).map(([key, content]) => {
    // '../runtime/assets/js/app.js' -> 'assets/js/app.js'
    const path = key.replace(/^.*\/runtime\//, '')
    return { path, content }
  })
}
