import { useCourseStore } from '../store/courseStore'
import type { ScormConfig } from '../schema/course.schema'

/**
 * Sección «Ajustes del curso»: reglas SCORM de finalización y aprobado
 * (`scorm.rules` + `mastery_score`). Se muestra como una pestaña dentro del
 * modal unificado de Ajustes (`SettingsModal`).
 */
export function CourseSettingsSection() {
  const scorm = useCourseStore((s) => s.course.scorm)
  const shell = useCourseStore((s) => s.course.shell)
  const updateScorm = useCourseStore((s) => s.updateScorm)
  const updateShell = useCourseStore((s) => s.updateShell)
  const hasFinal = useCourseStore((s) => !!s.course.assessments.final_test)

  const setRule = (p: Partial<ScormConfig['rules']>) => updateScorm({ rules: { ...scorm.rules, ...p } })
  const r = scorm.rules

  return (
    <>
      <p style={{ margin: '0 0 .75rem', color: 'var(--c-muted)', fontSize: '.9rem' }}>
        Deciden cuándo el alumno queda <strong>completado</strong> y si resulta{' '}
        <strong>APTO / NO APTO</strong>. Se aplican en la Vista estudiante y en el manifiesto SCORM.
      </p>

      <fieldset className="ed-group">
        <legend>Aprobado (nota)</legend>
        <div className="ed-row">
          <label className="ed-field ed-field-narrow">
            <span>Nota mínima para aprobar (%)</span>
            <input type="number" min={0} max={100} value={r.min_score}
              onChange={(e) => setRule({ min_score: Number(e.target.value) })} />
          </label>
          <label className="ed-field ed-field-narrow">
            <span>Nota de superación SCORM (masteryscore)</span>
            <input type="number" min={0} max={100} value={scorm.mastery_score}
              onChange={(e) => updateScorm({ mastery_score: Number(e.target.value) })} />
          </label>
          <label className="ed-field">
            <span>De dónde sale la nota</span>
            <select value={r.score_source} onChange={(e) => setRule({ score_source: e.target.value as any })}>
              <option value="final_test">Solo el test final</option>
              <option value="unit_tests">Solo las actividades evaluables</option>
              <option value="mixed">Mixto (actividades + test final)</option>
            </select>
          </label>
        </div>
        {r.score_source === 'final_test' && !hasFinal && (
          <p style={{ color: '#b3261e', fontSize: '.85rem', margin: '.25rem 0 0' }}>
            ⚠ La nota sale del test final, pero no hay test final. Créalo en «Evaluación → Test final».
          </p>
        )}
        {r.score_source === 'mixed' && (
          <div className="ed-row">
            <label className="ed-field ed-field-narrow">
              <span>Peso del test final (%)</span>
              <input type="number" min={0} max={100} value={r.mixed_final_weight}
                onChange={(e) => setRule({ mixed_final_weight: Number(e.target.value) })} />
            </label>
            <p style={{ fontSize: '.85rem', color: 'var(--c-muted)', alignSelf: 'center', margin: 0 }}>
              Test final <strong>{r.mixed_final_weight}%</strong> · práctica <strong>{100 - r.mixed_final_weight}%</strong>.
              Cada bloque se calcula sobre su propio total y se combinan con este peso.
            </p>
          </div>
        )}
      </fieldset>

      <fieldset className="ed-group">
        <legend>Finalización (completado)</legend>
        <div className="ed-row">
          <label className="ed-field ed-field-narrow">
            <span>% de pantallas que hay que ver</span>
            <input type="number" min={0} max={100} value={r.min_required_screens_pct}
              onChange={(e) => setRule({ min_required_screens_pct: Number(e.target.value) })} />
          </label>
          <label className="ed-check">
            <input type="checkbox" checked={r.require_interactions}
              onChange={(e) => setRule({ require_interactions: e.target.checked })} />
            <span>Exigir completar las interacciones</span>
          </label>
          <label className="ed-check">
            <input type="checkbox" checked={r.allow_resume}
              onChange={(e) => setRule({ allow_resume: e.target.checked })} />
            <span>Permitir reanudar donde lo dejó</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="ed-group">
        <legend>Apariencia (carcasa)</legend>
        <div className="ed-row">
          <label className="ed-field">
            <span>Animaciones</span>
            <select value={shell.motion} onChange={(e) => updateShell({ motion: e.target.value as any })}>
              <option value="subtle">Sutiles (por defecto) — transiciones básicas</option>
              <option value="rich">Llamativas — revelado progresivo del contenido y microanimaciones</option>
              <option value="none">Sin animaciones</option>
            </select>
          </label>
        </div>
        <p style={{ margin: 0, fontSize: '.85rem', color: 'var(--c-muted)' }}>
          En «Llamativas», el contenido de cada pantalla aparece en cascada la primera vez y el
          resto se revela al hacer scroll; las pantallas ya vistas no se re-animan. Si el
          alumno tiene activada la reducción de movimiento en su equipo, no se anima nada.
        </p>
      </fieldset>

      <fieldset className="ed-group">
        <legend>Test e intentos</legend>
        <div className="ed-row">
          <label className="ed-field ed-field-narrow">
            <span>Intentos del test (0 = ∞)</span>
            <input type="number" min={0} value={r.attempts_allowed}
              onChange={(e) => setRule({ attempts_allowed: Number(e.target.value) })} />
          </label>
          <label className="ed-field">
            <span>Navegación</span>
            <select value={r.navigation} onChange={(e) => setRule({ navigation: e.target.value as any })}>
              <option value="free">Libre</option>
              <option value="sequential">Secuencial</option>
              <option value="mixed">Mixta</option>
            </select>
          </label>
        </div>
      </fieldset>
    </>
  )
}
