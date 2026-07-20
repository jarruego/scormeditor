import type { Course, UnitTest } from '../schema/course.schema'
import { allScreens } from '../schema/traverse'

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

/** Un objetivo del curso con todos sus usos, para el gestor de objetivos. */
export type ObjectiveInfo = {
  /** Clave normalizada (identidad del objetivo). */
  key: string
  /** Texto canónico: el de la primera pantalla que lo declara. */
  text: string
  /** Pantallas que lo declaran como su «Objetivo de aprendizaje». */
  declaredIn: { id: string; title: string }[]
  /** Interacciones y preguntas de test vinculadas a él. `screenId` es la
   *  pantalla del editor a la que navegar (`__final__` para el test final;
   *  null si el test de unidad no tiene pantallas donde aterrizar). */
  usedBy: { screenId: string | null; label: string; evaluative: boolean }[]
}

/**
 * Recorre el curso y agrupa por clave normalizada todos los objetivos:
 * declarados en pantallas y/o vinculados desde interacciones y preguntas de
 * test. Devuelve primero los declarados (en orden de aparición) y después los
 * huérfanos (vinculados pero sin pantalla que los declare).
 */
export function collectObjectives(course: Course): ObjectiveInfo[] {
  const byKey = new Map<string, ObjectiveInfo>()
  const entry = (raw: string): ObjectiveInfo | null => {
    const text = raw.trim()
    const key = normalizeObjective(text)
    if (!key) return null
    let info = byKey.get(key)
    if (!info) {
      info = { key, text, declaredIn: [], usedBy: [] }
      byKey.set(key, info)
    }
    return info
  }

  allScreens(course).forEach((s) => {
    const decl = entry(s.objective)
    if (decl) {
      decl.declaredIn.push({ id: s.id, title: s.title || s.id })
      // El objetivo de la interacción es siempre el de su pantalla (no tiene
      // uno propio): si es evaluable, cuenta como evaluación de este objetivo.
      if (s.interaction?.scored)
        decl.usedBy.push({
          screenId: s.id,
          label: `Interacción en «${s.title || s.id}»`,
          evaluative: true,
        })
    }
  })

  const addTest = (test: UnitTest | null, screenId: string | null, origin: string) => {
    if (!test) return
    const counts = new Map<string, { text: string; n: number }>()
    for (const q of test.questions) {
      const text = (q.learning_objective ?? '').trim()
      const key = normalizeObjective(text)
      if (!key) continue
      const c = counts.get(key) ?? { text, n: 0 }
      c.n += 1
      counts.set(key, c)
    }
    for (const { text, n } of counts.values()) {
      entry(text)?.usedBy.push({
        screenId,
        label: `${n} pregunta${n === 1 ? '' : 's'} ${origin}`,
        evaluative: true,
      })
    }
  }
  addTest(course.assessments.final_test, '__final__', 'del test final')
  for (const t of course.assessments.unit_tests) {
    const unit = course.modules.flatMap((m) => m.units).find((u) => u.id === t.unit_id)
    addTest(t, unit?.screens[0]?.id ?? null, `del test «${t.title}»`)
  }

  const all = [...byKey.values()]
  return [...all.filter((o) => o.declaredIn.length > 0), ...all.filter((o) => o.declaredIn.length === 0)]
}

/**
 * Objetivos declarados en pantallas que ninguna evaluación cubre todavía
 * (interacciones `scored`, test final y tests de unidad; comparación
 * normalizada). En orden de aparición en el curso. Se usa para prerrellenar el
 * objetivo de las preguntas nuevas del test con el primero pendiente.
 */
export function uncoveredObjectives(course: Course): string[] {
  return collectObjectives(course)
    .filter((o) => o.declaredIn.length > 0 && !o.usedBy.some((u) => u.evaluative))
    .map((o) => o.text)
}
