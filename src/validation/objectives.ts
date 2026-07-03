/**
 * Normaliza un objetivo de aprendizaje para compararlo con tolerancia: sin
 * acentos, en minúsculas, espacios colapsados y sin puntuación final. La
 * vinculación evaluación↔objetivo histórica era texto libre y produjo pares
 * «casi iguales» («Conocer X.» vs «conocer x»); comparar normalizado evita
 * darlos por desvinculados. El texto canónico sigue siendo el declarado en la
 * pantalla.
 */
export function normalizeObjective(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // marcas diacríticas tras NFD
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,;:!?…]+$/g, '')
    .trim()
}
