/**
 * Ejecuta uno o varios scripts de curso con el cargador SSR de Vite (necesario porque
 * el validador del editor importa la carcasa vía `import.meta.glob`, solo de Vite).
 *
 *   node scripts/curso-ciberseguridad/run.mjs c1-fundamentos.mjs [c2-....mjs]
 */
import { createServer } from 'vite'

const files = process.argv.slice(2)
if (!files.length) {
  console.error('Uso: node scripts/curso-ciberseguridad/run.mjs <curso.mjs> [...]')
  process.exit(1)
}
const vite = await createServer({
  configFile: false,
  appType: 'custom',
  server: { middlewareMode: true, hmr: false, watch: null },
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true },
})
let code = 0
try {
  for (const f of files) await vite.ssrLoadModule('/scripts/curso-ciberseguridad/' + f)
} catch (e) {
  console.error(e)
  code = 1
} finally {
  await vite.close()
}
process.exit(process.exitCode || code)
