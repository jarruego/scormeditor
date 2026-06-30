import { useCourseStore } from '../store/courseStore'
import { validateCourse, type Severity } from '../validation/validators'

const ICON: Record<Severity, string> = { error: '⛔', warning: '⚠️', info: 'ℹ️' }

export function ValidationPanel() {
  const course = useCourseStore((s) => s.course)
  const select = useCourseStore((s) => s.selectScreen)
  const result = validateCourse(course)

  return (
    <div className="ed-validation">
      <h2>Validación del curso</h2>
      <div className="ed-val-summary">
        <span className="ed-pill err">{result.errors} errores</span>
        <span className="ed-pill warn">{result.warnings} avisos</span>
        <span className="ed-pill info">{result.infos} informativos</span>
        <span className={`ed-pill ${result.ok ? 'ok' : 'err'}`}>
          {result.ok ? 'Apto para exportar' : 'Hay errores bloqueantes'}
        </span>
      </div>

      {result.issues.length === 0 ? (
        <p>✅ Sin incidencias.</p>
      ) : (
        <ul className="ed-issues">
          {result.issues.map((i, idx) => (
            <li key={idx} className={`ed-issue sev-${i.severity}`}>
              <span className="ed-issue-icon">{ICON[i.severity]}</span>
              <span className="ed-issue-body">
                <strong>{i.message}</strong>
                <span className="ed-issue-loc">
                  {i.location} · <code>{i.code}</code>
                  {i.screenId && (
                    <button className="ed-link" onClick={() => select(i.screenId!)}>ir a pantalla</button>
                  )}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <p className="ed-disclaimer">
        Esta validación es de apoyo editorial y técnico. <strong>No constituye homologación ni
        cumplimiento oficial</strong> ante el SEPE u otra administración; la conformidad normativa
        debe confirmarla la entidad responsable.
      </p>
    </div>
  )
}
