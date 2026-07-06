import { useCourseStore } from '../store/courseStore'
import type { Issue, Severity } from '../validation/validators'

export const SEVERITY_ICON: Record<Severity, string> = { error: '⛔', warning: '⚠️', info: 'ℹ️' }

/** Códigos globales cuyo arreglo pasa por el modal de Ajustes (origen de la nota). */
const SETTINGS_CODES = new Set(['SCORM_NO_ACTIVITIES', 'SCORM_MIXED_EMPTY', 'SCORM_MIXED_NO_ACTIVITIES'])

export interface IssueTarget {
  label: string
  go: () => void
}

/**
 * Devuelve un resolutor de destino para un `Issue`: a qué superficie de edición
 * lleva su enlace (pantalla, test final, primera pantalla de la unidad o modal
 * de Ajustes). `null` si el issue no tiene destino editable en la UI.
 */
export function useIssueTarget(): (i: Issue) => IssueTarget | null {
  const goToScreen = useCourseStore((s) => s.goToScreen)
  const setSettingsModal = useCourseStore((s) => s.setSettingsModal)
  const course = useCourseStore((s) => s.course)

  return (i: Issue) => {
    if (i.screenId) {
      const isFinal = i.screenId === '__final__'
      const id = i.screenId
      return { label: isFinal ? 'Abrir test final' : 'Abrir en el editor', go: () => goToScreen(id) }
    }
    if (i.unitId) {
      for (const m of course.modules)
        for (const u of m.units)
          if (u.id === i.unitId && u.screens.length > 0) {
            const first = u.screens[0].id
            return { label: 'Ir a la unidad', go: () => goToScreen(first) }
          }
      return null
    }
    if (SETTINGS_CODES.has(i.code))
      return { label: 'Abrir ajustes', go: () => setSettingsModal('course') }
    if (i.code === 'GLOSSARY_EMPTY')
      return { label: 'Abrir glosario', go: () => goToScreen('__glossary__') }
    if (i.code === 'BIBLIO_EMPTY')
      return { label: 'Abrir bibliografía', go: () => goToScreen('__bibliography__') }
    return null
  }
}

/** Fila de issue con icono, mensaje, ubicación y enlace a su superficie de edición. */
export function IssueItem({ issue }: { issue: Issue }) {
  const targetFor = useIssueTarget()
  const target = targetFor(issue)
  return (
    <li
      className={`ed-issue sev-${issue.severity} ${target ? 'is-clickable' : ''}`}
      onClick={target ? target.go : undefined}
      title={target ? target.label : undefined}
    >
      <span className="ed-issue-icon">{SEVERITY_ICON[issue.severity]}</span>
      <span className="ed-issue-body">
        <strong>{issue.message}</strong>
        <span className="ed-issue-loc">
          {issue.location} · <code>{issue.code}</code>
          {target && (
            <button className="ed-link" onClick={(e) => { e.stopPropagation(); target.go() }}>
              {target.label}
            </button>
          )}
        </span>
      </span>
    </li>
  )
}
