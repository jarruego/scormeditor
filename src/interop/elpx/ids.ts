/**
 * IDs con el formato que usa eXeLearning en el `.elpx`.
 *
 * eXe identifica recursos e iDevices con `YYYYMMDDHHmmss` (14 dígitos) + 6
 * caracteres `[A-Z0-9]` (el validador oficial exige ese patrón en `odeId`/
 * `odeVersionId`). Las páginas usan otro estilo (`page-xxx-yyy`), libre.
 *
 * Aquí los generamos DETERMINISTAS a partir de una semilla (el id estable del
 * editor: pantalla `s01`, interacción `s01_i01`…) para que reexportar el mismo
 * curso produzca el mismo `.elpx` — igual criterio de reproducibilidad que la
 * carcasa (tableros sembrados por id) y el contrato del GPT (IDs deterministas).
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/** Hash entero de 32 bits (FNV-1a-ish) de una cadena, estable entre sesiones. */
function hash32(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Sufijo de 6 caracteres `[A-Z0-9]` derivado determinista de la semilla. */
function suffix6(seed: string): string {
  let h = hash32(seed)
  let out = ''
  for (let i = 0; i < 6; i++) {
    out += ALPHABET[h % ALPHABET.length]
    h = Math.floor(h / ALPHABET.length) ^ Math.imul(h, 2654435761) >>> 0
    h = h >>> 0
  }
  return out
}

/**
 * Genera un id estilo eXe (`timestamp14` + 6 alfanum) determinista por `seed`.
 * El `timestamp` es fijo por exportación (se pasa desde el orquestador) para que
 * todos los ids de un mismo `.elpx` compartan marca temporal, como hace eXe.
 */
export function odeId(stamp: string, seed: string): string {
  return stamp + suffix6(seed)
}

/** Id de página con el estilo libre de eXe (`page-<a>-<b>`), determinista. */
export function pageId(seed: string): string {
  const a = suffix6('pa-' + seed).toLowerCase()
  const b = suffix6('pb-' + seed).toLowerCase()
  return `page-${a}-${b}`
}

/** Marca temporal de 14 dígitos (`YYYYMMDDHHmmss`) del momento actual. */
export function nowStamp(d = new Date()): string {
  const p = (n: number, w = 2) => String(n).padStart(w, '0')
  return (
    d.getFullYear().toString() +
    p(d.getMonth() + 1) +
    p(d.getDate()) +
    p(d.getHours()) +
    p(d.getMinutes()) +
    p(d.getSeconds())
  )
}

/** Fecha ISO con milisegundos y `Z`, como `pp_modified` de eXe. */
export function nowIso(d = new Date()): string {
  return d.toISOString().replace(/\.\d+Z$/, (m) => m) // ya viene en el formato correcto
}
