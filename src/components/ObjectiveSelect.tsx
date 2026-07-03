import { useMemo } from 'react'
import { useCourseStore } from '../store/courseStore'
import { normalizeObjective } from '../validation/objectives'

/**
 * Selector de objetivo de aprendizaje vinculado. Lista los objetivos declarados
 * en las pantallas del curso para que la vinculación evaluación↔objetivo no
 * falle por texto no idéntico. Un valor guardado que normaliza igual que un
 * objetivo declarado (acentos, mayúsculas, puntuación final…) se muestra como
 * ese objetivo; al elegir una opción se guarda el texto canónico declarado.
 * Solo si no casa con ninguno (p. ej. curso importado) se conserva como opción
 * extra marcada «(no declarado en pantallas)».
 */
export function ObjectiveSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const course = useCourseStore((s) => s.course)
  const declared = useMemo(() => {
    const byKey = new Map<string, string>()
    course.modules.forEach((m) => m.units.forEach((u) => u.screens.forEach((s) => {
      const obj = s.objective.trim()
      const key = normalizeObjective(obj)
      if (key && !byKey.has(key)) byKey.set(key, obj)
    })))
    return byKey
  }, [course])

  // Valor a mostrar: el objetivo declarado equivalente si lo hay (casado con
  // tolerancia), o el texto guardado tal cual si no casa con ninguno.
  const current = declared.get(normalizeObjective(value)) ?? value.trim()
  const isUndeclared = !!current && !declared.has(normalizeObjective(current))
  return (
    <select value={current} onChange={(e) => onChange(e.target.value)}>
      <option value="">— Sin objetivo —</option>
      {[...declared.values()].map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
      {isUndeclared && <option value={current}>{current} (no declarado en pantallas)</option>}
    </select>
  )
}
