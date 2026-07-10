import { useRef } from 'react'
import { useCourseStore } from '../store/courseStore'
import type { GlossaryTerm, BibliographyEntry } from '../schema/course.schema'
import { confirmDialog } from '../store/confirm'
import { Icon, type IconName } from './Icon'
import { TYPE_COLORS } from '../schema/labels'

/** Cabecera con título editable in situ (mismo patrón que ScreenEditor). */
function EditableHead({ value, placeholder, ariaLabel, chipIcon, chipLabel, onChange }: {
  value: string
  placeholder: string
  ariaLabel: string
  chipIcon: IconName
  chipLabel: string
  onChange: (v: string) => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <h2 className="ed-form-head">
      <input ref={ref} className="ed-title-input" value={value} placeholder={placeholder}
        aria-label={ariaLabel} onChange={(e) => onChange(e.target.value)} />
      <button type="button" className="ed-title-pencil" title="Editar título" aria-label="Editar título"
        onClick={() => { ref.current?.focus(); ref.current?.select() }}>
        <Icon name="pencil" size={14} />
      </button>
      <span className="ed-form-type"><Icon name={chipIcon} size={12} color={TYPE_COLORS.materiales} /> {chipLabel}</span>
    </h2>
  )
}

/**
 * Editores de los materiales transversales del curso: Glosario y Recursos/
 * bibliografía. Se abren desde el árbol (entradas sintéticas `__glossary__` y
 * `__bibliography__`, como `__final__`). En la carcasa se muestran en los
 * modales de los botones Glosario/Recursos de la barra superior.
 */

export function GlossaryEditor() {
  const glossary = useCourseStore((s) => s.course.glossary)
  const setGlossary = useCourseStore((s) => s.setGlossary)
  const glossaryTitle = useCourseStore((s) => s.course.glossary_title)
  const setGlossaryTitle = useCourseStore((s) => s.setGlossaryTitle)

  const update = (i: number, patch: Partial<GlossaryTerm>) =>
    setGlossary(glossary.map((t, j) => (j === i ? { ...t, ...patch } : t)))
  const add = () => setGlossary([...glossary, { term: '', definition: '', source_refs: [] }])
  const remove = async (i: number) => {
    const t = glossary[i]
    if ((t.term.trim() || t.definition.trim()) &&
      !(await confirmDialog({
        title: 'Eliminar término',
        message: `Se eliminará «${t.term.trim() || '(sin término)'}» del glosario.`,
        confirmLabel: 'Eliminar',
        danger: true,
      }))) return
    setGlossary(glossary.filter((_, j) => j !== i))
  }
  const sort = () =>
    setGlossary([...glossary].sort((a, b) => a.term.localeCompare(b.term, 'es', { sensitivity: 'base' })))

  return (
    <div className="ed-form">
      <EditableHead value={glossaryTitle} placeholder="Glosario" ariaLabel="Título del glosario"
        chipIcon="book" chipLabel="Glosario" onChange={setGlossaryTitle} />
      <p className="ed-hint">
        El estudiante lo consulta con el botón correspondiente de la barra superior del curso
        (rotulado con este título). Los términos se muestran en el orden de esta lista.
      </p>

      {glossary.length === 0 && <p className="ed-empty">Glosario vacío. Añade el primer término.</p>}

      {glossary.map((t, i) => (
        <div key={i} className="ed-term-row">
          <div className="ed-term-fields">
            <label className="ed-field">
              <span>Término</span>
              <input value={t.term} placeholder="p. ej. SCORM" onChange={(e) => update(i, { term: e.target.value })} />
            </label>
            <label className="ed-field">
              <span>Definición</span>
              <textarea rows={2} value={t.definition} onChange={(e) => update(i, { definition: e.target.value })} />
            </label>
          </div>
          <button type="button" className="ed-icobtn ed-icobtn-danger" onClick={() => void remove(i)} aria-label={`Eliminar término ${t.term || i + 1}`} title="Eliminar término"><Icon name="trash" size={14} /></button>
        </div>
      ))}

      <div className="ed-row">
        <button type="button" className="ed-primary" onClick={add}><Icon name="plus" size={13} /> Añadir término</button>
        {glossary.length > 1 && (
          <button type="button" onClick={sort} title="Reordena los términos alfabéticamente"><Icon name="sort" size={14} /> Ordenar alfabéticamente</button>
        )}
      </div>
    </div>
  )
}

export function BibliographyEditor() {
  const bibliography = useCourseStore((s) => s.course.bibliography)
  const setBibliography = useCourseStore((s) => s.setBibliography)
  const bibliographyTitle = useCourseStore((s) => s.course.bibliography_title)
  const setBibliographyTitle = useCourseStore((s) => s.setBibliographyTitle)

  const update = (i: number, patch: Partial<BibliographyEntry>) =>
    setBibliography(bibliography.map((b, j) => (j === i ? { ...b, ...patch } : b)))
  const add = () => setBibliography([...bibliography, { ref: '' }])
  const remove = async (i: number) => {
    const b = bibliography[i]
    if ((b.ref.trim() || b.url?.trim()) &&
      !(await confirmDialog({
        title: 'Eliminar referencia',
        message: 'Se eliminará esta referencia de la bibliografía.',
        confirmLabel: 'Eliminar',
        danger: true,
      }))) return
    setBibliography(bibliography.filter((_, j) => j !== i))
  }

  return (
    <div className="ed-form">
      <EditableHead value={bibliographyTitle} placeholder="Recursos y bibliografía"
        ariaLabel="Título de recursos y bibliografía" chipIcon="link" chipLabel="Recursos"
        onChange={setBibliographyTitle} />
      <p className="ed-hint">
        El estudiante los consulta con el botón «Recursos» de la barra superior del curso
        (si personalizas el título, el botón lo usa como rótulo).
        Usa un formato de cita homogéneo; el enlace es opcional.
      </p>

      {bibliography.length === 0 && <p className="ed-empty">Sin referencias. Añade la primera.</p>}

      {bibliography.map((b, i) => (
        <div key={i} className="ed-term-row">
          <div className="ed-term-fields">
            <label className="ed-field">
              <span>Referencia (cita)</span>
              <input value={b.ref} placeholder="Autor (año). Título. Editorial."
                onChange={(e) => update(i, { ref: e.target.value })} />
            </label>
            <label className="ed-field">
              <span>Enlace (URL, opcional)</span>
              <input value={b.url || ''} placeholder="https://…"
                onChange={(e) => update(i, { url: e.target.value || undefined })} />
            </label>
          </div>
          <button type="button" className="ed-icobtn ed-icobtn-danger" onClick={() => void remove(i)} aria-label={`Eliminar referencia ${i + 1}`} title="Eliminar referencia"><Icon name="trash" size={14} /></button>
        </div>
      ))}

      <div className="ed-row">
        <button type="button" className="ed-primary" onClick={add}><Icon name="plus" size={13} /> Añadir referencia</button>
      </div>
    </div>
  )
}
