import { useMemo, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { validateCourse, type Issue, type Severity } from '../validation/validators'
import { IssueItem } from './IssueList'

const FINAL_GROUP = 'Test final'
const GLOBAL_GROUP = 'Curso y SCORM'

/**
 * Agrupa los issues por unidad (módulo › unidad) usando sus ids, no el texto de
 * `location`. Los del test final van a su propio grupo y los globales al final.
 */
function groupIssues(issues: Issue[], pathByScreen: Map<string, string>, pathByUnit: Map<string, string>) {
  const groups = new Map<string, Issue[]>()
  const push = (key: string, i: Issue) => {
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(i)
  }
  issues.forEach((i) => {
    if (i.screenId === '__final__') push(FINAL_GROUP, i)
    else if (i.screenId && pathByScreen.has(i.screenId)) push(pathByScreen.get(i.screenId)!, i)
    else if (i.unitId && pathByUnit.has(i.unitId)) push(pathByUnit.get(i.unitId)!, i)
    else push(GLOBAL_GROUP, i)
  })
  return groups
}

export function ValidationPanel() {
  const course = useCourseStore((s) => s.course)
  const result = useMemo(() => validateCourse(course), [course])
  // Severidades ocultas por el usuario (los recuadros del resumen actúan de filtro).
  const [hidden, setHidden] = useState<Set<Severity>>(new Set())

  const toggle = (sev: Severity) =>
    setHidden((h) => {
      const next = new Set(h)
      if (next.has(sev)) next.delete(sev)
      else next.add(sev)
      return next
    })

  const { pathByScreen, pathByUnit, groupOrder } = useMemo(() => {
    const pathByScreen = new Map<string, string>()
    const pathByUnit = new Map<string, string>()
    const groupOrder: string[] = []
    course.modules.forEach((m) =>
      m.units.forEach((u) => {
        const path = `${m.title || m.id} › ${u.title || u.id}`
        pathByUnit.set(u.id, path)
        groupOrder.push(path)
        u.screens.forEach((s) => pathByScreen.set(s.id, path))
      }),
    )
    groupOrder.push(FINAL_GROUP, GLOBAL_GROUP)
    return { pathByScreen, pathByUnit, groupOrder }
  }, [course])

  const visible = result.issues.filter((i) => !hidden.has(i.severity))
  const groups = groupIssues(visible, pathByScreen, pathByUnit)

  const filterPill = (sev: Severity, label: string, cls: string) => (
    <button
      className={`ed-pill ${cls} ${hidden.has(sev) ? 'is-off' : ''}`}
      onClick={() => toggle(sev)}
      title={hidden.has(sev) ? `Mostrar ${label}` : `Ocultar ${label}`}
      aria-pressed={!hidden.has(sev)}
    >
      {sev === 'error' ? result.errors : sev === 'warning' ? result.warnings : result.infos} {label}
    </button>
  )

  return (
    <div className="ed-validation">
      <h2>Validación del curso</h2>
      <div className="ed-val-summary">
        {filterPill('error', 'errores', 'err')}
        {filterPill('warning', 'avisos', 'warn')}
        {filterPill('info', 'informativos', 'info')}
        <span className={`ed-pill ${result.ok ? 'ok' : 'err'}`}>
          {result.ok ? 'Apto para exportar' : 'Hay errores bloqueantes'}
        </span>
      </div>

      {result.issues.length === 0 ? (
        <p>✅ Sin incidencias.</p>
      ) : visible.length === 0 ? (
        <p>Sin incidencias con los filtros activos.</p>
      ) : (
        groupOrder
          .filter((g) => groups.has(g))
          .map((g) => (
            <section key={g} className="ed-val-group">
              <h3>
                {g} <span className="ed-val-count">({groups.get(g)!.length})</span>
              </h3>
              <ul className="ed-issues">
                {groups.get(g)!.map((i, idx) => (
                  <IssueItem key={`${i.code}-${idx}`} issue={i} />
                ))}
              </ul>
            </section>
          ))
      )}
      <p className="ed-disclaimer">
        Esta validación es de apoyo editorial y técnico. <strong>No constituye homologación ni
        cumplimiento oficial</strong> ante el SEPE u otra administración; la conformidad normativa
        debe confirmarla la entidad responsable.
      </p>
    </div>
  )
}
