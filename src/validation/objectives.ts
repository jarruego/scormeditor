import type { Course } from '../schema/course.schema'

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

/**
 * Objetivos declarados en pantallas que ninguna evaluación cubre todavía
 * (interacciones `scored`, test final y tests de unidad; comparación
 * normalizada). En orden de aparición en el curso. Se usa para prerrellenar el
 * objetivo de las preguntas nuevas del test con el primero pendiente.
 */
export function uncoveredObjectives(course: Course): string[] {
  const declared = new Map<string, string>()
  const evaluated = new Set<string>()
  course.modules.forEach((m) => m.units.forEach((u) => u.screens.forEach((s) => {
    const obj = s.objective.trim()
    const key = normalizeObjective(obj)
    if (key && !declared.has(key)) declared.set(key, obj)
    if (s.interaction?.scored && s.interaction.learning_objective)
      evaluated.add(normalizeObjective(s.interaction.learning_objective))
  })))
  course.assessments.final_test?.questions.forEach((q) => q.learning_objective && evaluated.add(normalizeObjective(q.learning_objective)))
  course.assessments.unit_tests.forEach((t) => t.questions.forEach((q) => q.learning_objective && evaluated.add(normalizeObjective(q.learning_objective))))
  return [...declared.entries()].filter(([key]) => !evaluated.has(key)).map(([, obj]) => obj)
}
