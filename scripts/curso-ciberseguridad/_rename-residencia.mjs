// Sustituye «residencia(s)» por «centro (sociosanitario)» en los guiones de los cursos, cuidando el género.
// Uso: node _rename-residencia.mjs [--dry]
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = dirname(fileURLToPath(import.meta.url))
const dry = process.argv.includes('--dry')
const docsDir = join(dir, '..', '..', 'docs', 'curso-ciberseguridad')
const onlyDocs = process.argv.includes('--docs')
const files = onlyDocs
  ? ['../../docs/curso-ciberseguridad/README.md', ...readdirSync(join(docsDir, 'fuentes')).map((f) => '../../docs/curso-ciberseguridad/fuentes/' + f)]
  : [...readdirSync(dir).filter((f) => /^(c\d|widgets|svgkit|lib|build-doc-base|GUIA)/.test(f) && /\.(mjs|md)$/.test(f))]

// Adjetivos femeninos que quedan tras «centro»: se pasan a masculino.
const ADJ = { privada: 'privado', pequeña: 'pequeño', pequeñas: 'pequeños', sancionada: 'sancionado', concreta: 'concreto', española: 'español', públicas: 'públicos', pública: 'público', afectada: 'afectado', grande: 'grande', geriátricas: 'geriátricos', geriátrica: 'geriátrico' }
const fixAdj = (s) => s.replace(/\b(centros? sociosanitari[oa]s?|el centro|un centro|del centro|tu centro) (privada|pequeñas?|sancionada|concreta|española|públicas?|afectada|geriátricas?)\b/gi, (m, a, b) => `${a} ${ADJ[b.toLowerCase()] || b}`)

// Identificadores, dominios y nombres de wifi ficticios (exactos, antes que la regla general).
const P = [
  ['Asistente-Residencia-IA', 'Asistente-Centro-IA'],
  ['RESIDENCIA_PERSONAL_GRATIS', 'CENTRO_PERSONAL_GRATIS'],
  ['RESIDENCIA_PERSONAL', 'CENTRO_PERSONAL'],
  ['RESIDENCIA_VISITAS', 'CENTRO_VISITAS'],
  ['Residencia2026', 'Centro2026'],
  ['centro@residencia.es', 'centro@centrosolmar.es'],
  ['tu-residencia.es', 'tu-centro.es'],
  ['direccion.residencia@gmail.com', 'direccion.centro@gmail.com'],
  ['residencia-centro.com', 'centro-solmar.com'],
  ['residencia-vlda', 'centro-vlda'],
  ['residenciasolrnar', 'centrosolrnar'],
  ['residenciasolmar', 'centrosolmar'],
]

// Orden importa: de lo más específico a lo general. [regex, reemplazo] (mayúscula inicial se conserva).
const R = [
  [/personal de residencias y centros sociosanitarios/gi, 'personal de centros sociosanitarios'],
  [/residencias y centros sociosanitarios/gi, 'centros sociosanitarios'],
  [/residencias o centros sociosanitarios/gi, 'centros sociosanitarios'],
  [/residencias y otros centros/gi, 'centros sociosanitarios y otros centros'],
  [/somos una residencia pequeñ[ao]/gi, 'somos un centro pequeño'],
  [/de la residencia/gi, 'del centro'],
  [/a la residencia/gi, 'al centro'],
  [/en la residencia/gi, 'en el centro'],
  [/(por|con|sin|para|desde|hasta|sobre|entre|hacia|tras|ante|según) la residencia/gi, '$1 el centro'],
  [/de una residencia/gi, 'de un centro sociosanitario'],
  [/en una residencia/gi, 'en un centro sociosanitario'],
  [/a una residencia/gi, 'a un centro sociosanitario'],
  [/una residencia/gi, 'un centro sociosanitario'],
  [/trabajadora de residencia/gi, 'trabajadora de un centro sociosanitario'],
  [/gerocultora en residencia/gi, 'gerocultora en un centro'],
  [/situaciones de residencia/gi, 'situaciones de un centro sociosanitario'],
  [/farmacia de residencias/gi, 'farmacia de centros sociosanitarios'],
  [/en residencias españolas/gi, 'en centros sociosanitarios españoles'],
  [/residencias españolas/gi, 'centros sociosanitarios españoles'],
  [/tu residencia/gi, 'tu centro'],
  [/la residencia/gi, 'el centro'],
  [/las residencias/gi, 'los centros sociosanitarios'],
  [/de residencias/gi, 'de centros sociosanitarios'],
  [/a residencias/gi, 'a centros sociosanitarios'],
  [/en residencias/gi, 'en centros sociosanitarios'],
  [/residencias/gi, 'centros sociosanitarios'],
  [/de residencia/gi, 'de centro sociosanitario'],
  [/en residencia/gi, 'en centro sociosanitario'],
]
const keepCase = (m, rep) => (m[0] === m[0].toUpperCase() && m[0] !== m[0].toLowerCase() ? rep[0].toUpperCase() + rep.slice(1) : rep)

let total = 0
for (const f of files) {
  if (f.startsWith('_rename')) continue
  const p = join(dir, f)
  let s = readFileSync(p, 'utf8')
  const before = s
  // Las URLs (fuentes reales) no se tocan: se enmascaran antes y se restauran después.
  const urls = []
  s = s.replace(/https?:\/\/[^\s)>\]"'`]+/g, (u) => { urls.push(u); return `\u0000U${urls.length - 1}\u0000` })
  for (const [a, b] of P) s = s.split(a).join(b)
  for (const [re, rep] of R) {
    s = s.replace(re, (...a) => {
      const m = a[0]
      let out = rep.replace(/\$(\d)/g, (_, i) => a[Number(i)])
      return keepCase(m, out)
    })
  }
  s = fixAdj(s)
  s = s.replace(/\u0000U(\d+)\u0000/g, (_, i) => urls[Number(i)])
  const left = (s.match(/residencia/gi) || []).length
  const changed = before !== s
  if (changed) { total++; if (!dry) writeFileSync(p, s, 'utf8') }
  if (changed || left) console.log(`${f}: ${changed ? 'cambiado' : 'sin cambios'}${left ? ` · quedan ${left} «residencia»` : ''}`)
}
console.log(dry ? '(dry-run)' : `${total} ficheros modificados`)
