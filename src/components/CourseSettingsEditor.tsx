import { useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import { confirmDialog } from '../store/confirm'
import type { ScormConfig } from '../schema/course.schema'

/**
 * Sección «Ajustes del curso»: reglas SCORM de finalización y aprobado
 * (`scorm.rules` + `mastery_score`). Se muestra como una pestaña dentro del
 * modal unificado de Ajustes (`SettingsModal`).
 */
/**
 * Sección «Interfaz (Apariencia)»: preferencias de presentación de la carcasa
 * (`shell`), separadas de las reglas de finalización. Ventana propia en el menú
 * ⚙ Ajustes.
 */
export function AppearanceSection() {
  const shell = useCourseStore((s) => s.course.shell)
  const updateShell = useCourseStore((s) => s.updateShell)

  return (
    <>
      <p style={{ margin: '0 0 .75rem', color: 'var(--c-muted)', fontSize: '.9rem' }}>
        Preferencias de presentación de la carcasa del curso (Vista estudiante y SCORM exportado).
      </p>

      <fieldset className="ed-group">
        <legend>Marca y color</legend>
        <div className="ed-row">
          <label className="ed-field">
            <span>Marca (texto de la esquina superior izquierda)</span>
            <input value={shell.brand} placeholder="p. ej. Mecohisa Formación"
              onChange={(e) => updateShell({ brand: e.target.value })} />
          </label>
          <label className="ed-field ed-field-narrow">
            <span>Color corporativo</span>
            <div className="ed-color-row">
              <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(shell.primary_color) ? shell.primary_color : '#0b5fff'}
                aria-label="Elegir color corporativo"
                onChange={(e) => updateShell({ primary_color: e.target.value })} />
              <input value={shell.primary_color} placeholder="#0b5fff" style={{ maxWidth: 110 }}
                aria-label="Color corporativo en hexadecimal"
                onChange={(e) => updateShell({ primary_color: e.target.value })} />
            </div>
          </label>
        </div>
        <p style={{ margin: 0, fontSize: '.85rem', color: 'var(--c-muted)' }}>
          El color se aplica a botones, enlaces y elementos de acción de la carcasa. La marca
          aparece en la barra superior del curso; si la dejas vacía, la cabecera muestra
          únicamente el título del curso.
        </p>
      </fieldset>

      <fieldset className="ed-group">
        <legend>Animaciones</legend>
        <div className="ed-row">
          <label className="ed-field">
            <span>Nivel de animación</span>
            <select value={shell.motion} onChange={(e) => updateShell({ motion: e.target.value as any })}>
              <option value="subtle">Sutiles (por defecto) — transiciones básicas</option>
              <option value="rich">Llamativas — revelado progresivo del contenido y microanimaciones</option>
              <option value="none">Sin animaciones</option>
            </select>
          </label>
          <label className="ed-field ed-field-narrow">
            <span>Velocidad</span>
            <select value={shell.motion_speed} disabled={shell.motion === 'none'}
              onChange={(e) => updateShell({ motion_speed: e.target.value as any })}>
              <option value="fast">Rápida</option>
              <option value="normal">Normal (por defecto)</option>
              <option value="slow">Lenta</option>
            </select>
          </label>
        </div>
        <p style={{ margin: 0, fontSize: '.85rem', color: 'var(--c-muted)' }}>
          En «Llamativas», el contenido de cada pantalla aparece en cascada la primera vez y el
          resto se revela al hacer scroll; las pantallas ya vistas no se re-animan. La velocidad
          alarga o acorta las entradas del nivel elegido. Si el alumno tiene activada la
          reducción de movimiento en su equipo, no se anima nada.
        </p>
      </fieldset>
    </>
  )
}

export function CourseSettingsSection() {
  const scorm = useCourseStore((s) => s.course.scorm)
  const updateScorm = useCourseStore((s) => s.updateScorm)
  const hasFinal = useCourseStore((s) => !!s.course.assessments.final_test)
  const screenCount = useCourseStore((s) =>
    s.course.modules.reduce((n, m) => n + m.units.reduce((k, u) => k + u.screens.length, 0), 0))
  const setAllMinTime = useCourseStore((s) => s.setAllMinTime)
  // Tiempo a aplicar en lote (no se persiste: es una herramienta, no un ajuste).
  const [bulkTime, setBulkTime] = useState(0)

  const setRule = (p: Partial<ScormConfig['rules']>) => updateScorm({ rules: { ...scorm.rules, ...p } })
  const r = scorm.rules

  async function onApplyMinTime() {
    const secs = Math.max(0, Math.min(30, Math.round(bulkTime)))
    setBulkTime(secs)
    const ok = await confirmDialog({
      title: 'Aplicar tiempo mínimo a todas',
      message: `Se pondrá un tiempo mínimo de ${secs} segundo${secs === 1 ? '' : 's'} en las ${screenCount} pantallas del curso, sustituyendo el valor que tenga cada una. Puedes deshacerlo con Ctrl+Z.`,
      confirmLabel: 'Aplicar a todas',
    })
    if (ok) setAllMinTime(secs)
  }

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
        <legend>Tiempo mínimo por pantalla</legend>
        <div className="ed-row">
          <label className="ed-field ed-field-narrow">
            <span>Segundos (0–30)</span>
            <input type="number" min={0} max={30} value={bulkTime}
              onChange={(e) => setBulkTime(Number(e.target.value))} />
          </label>
          <button type="button" style={{ alignSelf: 'flex-end' }} onClick={() => void onApplyMinTime()}>
            Aplicar a todas las pantallas
          </button>
        </div>
        <p style={{ margin: 0, fontSize: '.85rem', color: 'var(--c-muted)' }}>
          Pone el mismo «Tiempo mín. (s)» en las {screenCount} pantallas del curso (el alumno no
          puede avanzar hasta agotarlo). Sustituye el valor individual de cada pantalla; después
          puedes afinar pantallas concretas en su editor.
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
