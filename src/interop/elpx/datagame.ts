/**
 * Codificación del estado de los juegos de eXeLearning (`*-DataGame`).
 *
 * eXe guarda el estado de sus juegos en un `<div class="tipo-DataGame js-hidden">`
 * dentro del `htmlView`. Hay dos variantes observadas en `.elpx` reales:
 *  - **cifrada** (word-search, crossword, complete, classify, sort, quick-questions,
 *    hidden-image, puzzle, az-quiz, identify): `JSON → XOR 0x92 por carácter →
 *    escape()` (percent-encoding sobre bytes latin-1).
 *  - **plana** (before/after, flipcards, relate): el JSON va tal cual, sin cifrar.
 *
 * `escape()` de JavaScript (el que usa eXe) codifica como `%XX` los bytes fuera
 * de `[A-Za-z0-9@*_+-./]` y como `%uXXXX` los code points > 255. Como el XOR deja
 * todo en 0..255, aquí basta con `%XX`. Se replica `escape()` fielmente.
 */

/** Equivalente a `escape()` de JavaScript para cadenas con code points 0..255. */
function jsEscape(s: string): string {
  const safe = /[A-Za-z0-9@*_+\-./]/
  let out = ''
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    const code = s.charCodeAt(i)
    if (safe.test(ch)) out += ch
    else if (code < 256) out += '%' + code.toString(16).toUpperCase().padStart(2, '0')
    else out += '%u' + code.toString(16).toUpperCase().padStart(4, '0')
  }
  return out
}

/** Cifra un objeto de juego al blob `*-DataGame` cifrado (XOR 0x92 + escape). */
export function encodeDataGame(obj: unknown): string {
  const json = JSON.stringify(obj)
  let xored = ''
  for (let i = 0; i < json.length; i++) {
    xored += String.fromCharCode((json.charCodeAt(i) ^ 0x92) & 0xff)
  }
  return jsEscape(xored)
}

/** Estado de juego en claro (before/after, flipcards, relate): JSON sin cifrar. */
export function plainDataGame(obj: unknown): string {
  return JSON.stringify(obj)
}
