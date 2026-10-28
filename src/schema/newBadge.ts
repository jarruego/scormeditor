/**
 * Etiqueta «Nueva» de los selectores de recetas («Añadir pantalla» y «Nueva
 * interacción»): una receta con `since` (fecha ISO `AAAA-MM-DD` en que se
 * publicó) la muestra durante `NEW_BADGE_DAYS` días y luego desaparece sola,
 * sin tener que acordarse de quitarla. Es solo UI: no toca `course.json`.
 */
export const NEW_BADGE_DAYS = 30

export function isNewSince(since: string | undefined, now: number = Date.now()): boolean {
  if (!since) return false
  const start = Date.parse(`${since}T00:00:00`)
  if (Number.isNaN(start)) return false
  return now >= start && now < start + NEW_BADGE_DAYS * 86_400_000
}
