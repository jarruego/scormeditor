/**
 * Evaluador de fórmulas del «Reto numérico» (`calculator`) para el editor
 * (vista previa del resultado y validadores). Es una copia deliberada de
 * `evalFormula` de `src/runtime/assets/js/interactions.js` — el runtime es JS
 * plano sin build y no puede importar este módulo —, así que si cambia la
 * gramática hay que cambiar los tres (también la copia en Python del preflight
 * `validate_course`, docs/gpt/contrato-course-json.md §11). Sin `eval`:
 * `+ - * / ^`, paréntesis, números con punto decimal, identificadores y las
 * funciones `round(x[, d]) min max abs sqrt floor ceil`.
 */

const FN: Record<string, (...a: number[]) => number> = {
  round: (x, d = 0) => {
    const f = Math.pow(10, d)
    return Math.round(x * f) / f
  },
  min: Math.min,
  max: Math.max,
  abs: Math.abs,
  sqrt: Math.sqrt,
  floor: Math.floor,
  ceil: Math.ceil,
}

/** Identificador válido de variable/resultado (lo que se escribe en la fórmula). */
export const CALC_ID_RE = /^[A-Za-z_][A-Za-z0-9_]*$/

/** Nombres que no pueden usarse como identificador (son funciones). */
export const CALC_RESERVED = Object.keys(FN)

export function evalFormula(src: string, vars: Record<string, number | null | undefined>): number {
  const s = String(src ?? '')
  let i = 0
  const fail = (msg: string): never => {
    throw new Error(msg)
  }
  const ws = () => {
    while (i < s.length && /\s/.test(s.charAt(i))) i++
  }
  const expr = (): number => {
    let v = term()
    for (;;) {
      ws()
      const c = s.charAt(i)
      if (c === '+') { i++; v += term() }
      else if (c === '-') { i++; v -= term() }
      else return v
    }
  }
  const term = (): number => {
    let v = unary()
    for (;;) {
      ws()
      const c = s.charAt(i)
      if (c === '*') { i++; v *= unary() }
      else if (c === '/') { i++; v /= unary() }
      else return v
    }
  }
  const unary = (): number => {
    ws()
    if (s.charAt(i) === '-') { i++; return -unary() }
    if (s.charAt(i) === '+') { i++; return unary() }
    return power()
  }
  const power = (): number => {
    const b = atom()
    ws()
    if (s.charAt(i) === '^') { i++; return Math.pow(b, unary()) }
    return b
  }
  const atom = (): number => {
    ws()
    const rest = s.slice(i)
    let m = /^(\d+\.?\d*|\.\d+)/.exec(rest)
    if (m) { i += m[0].length; return parseFloat(m[0]) }
    m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(rest)
    if (m) {
      const name = m[0]
      i += name.length
      ws()
      if (s.charAt(i) === '(') {
        const key = name.toLowerCase()
        // Solo funciones PROPIAS de FN: nunca heredadas (constructor, toString…).
        const fn = Object.prototype.hasOwnProperty.call(FN, key) ? FN[key] : null
        if (!fn) fail(`Función desconocida: ${name}`)
        i++
        const args = [expr()]
        ws()
        while (s.charAt(i) === ',') { i++; args.push(expr()); ws() }
        if (s.charAt(i) !== ')') fail('Falta un paréntesis de cierre')
        i++
        return fn!(...args)
      }
      if (!Object.prototype.hasOwnProperty.call(vars, name)) fail(`Nombre desconocido: ${name}`)
      const v = vars[name]
      if (typeof v !== 'number' || !isFinite(v)) fail(`Falta el valor de ${name}`)
      return v as number
    }
    if (s.charAt(i) === '(') {
      i++
      const inner = expr()
      ws()
      if (s.charAt(i) !== ')') fail('Falta un paréntesis de cierre')
      i++
      return inner
    }
    return fail(i >= s.length ? 'La fórmula está incompleta' : `Carácter inesperado: ${s.charAt(i)}`)
  }
  const out = expr()
  ws()
  if (i < s.length) fail(`Carácter inesperado: ${s.charAt(i)}`)
  if (typeof out !== 'number' || !isFinite(out)) fail('El resultado no es un número válido')
  return out
}

export type CalcVariable = { id: string; label?: string; unit?: string; value?: number }
export type CalcResult = { id: string; label?: string; formula: string; unit?: string; decimals?: number }

/**
 * Calcula todos los resultados en orden (cada uno puede usar los anteriores)
 * con los valores de las variables. Devuelve el valor o el error de cada uno.
 */
export function computeResults(
  variables: CalcVariable[],
  results: CalcResult[],
): { id: string; value: number | null; error: string | null }[] {
  const scope: Record<string, number | null> = {}
  for (const v of variables) scope[v.id] = typeof v.value === 'number' ? v.value : null
  return results.map((r) => {
    try {
      const value = evalFormula(r.formula, scope)
      scope[r.id] = value
      return { id: r.id, value, error: null }
    } catch (e) {
      scope[r.id] = null
      return { id: r.id, value: null, error: (e as Error).message }
    }
  })
}
