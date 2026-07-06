import { useCourseStore } from '../store/courseStore'
import type { GlossaryTerm, BibliographyEntry } from '../schema/course.schema'
import { confirmDialog } from '../store/confirm'

/**
 * Editores de los materiales transversales del curso: Glosario y Recursos/
 * bibliografía. Se abren desde el árbol (entradas sintéticas `__glossary__` y
 * `__bibliography__`, como `__final__`). En la carcasa se muestran en los
 * modales de los botones 📖/🔗 de la barra superior.
 */

export function GlossaryEditor() {
  const glossary = useCourseStore((s) => s.course.glossary)
  const setGlossary = useCourseStore((s) => s.setGlossary)

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
      <h2>Glosario</h2>
      <p className="ed-hint">
        El estudiante lo consulta con el botón «Glosario» de la barra superior del curso.
        Los términos se muestran en el orden de esta lista.
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
          <button type="button" onClick={() => void remove(i)} aria-label={`Eliminar término ${t.term || i + 1}`} title="Eliminar término">✕</button>
        </div>
      ))}

      <div className="ed-row">
        <button type="button" className="ed-primary" onClick={add}>+ Añadir término</button>
        {glossary.length > 1 && (
          <button type="button" onClick={sort} title="Reordena los términos alfabéticamente">A→Z Ordenar alfabéticamente</button>
        )}
      </div>
    </div>
  )
}

export function BibliographyEditor() {
  const bibliography = useCourseStore((s) => s.course.bibliography)
  const setBibliography = useCourseStore((s) => s.setBibliography)

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
      <h2>Recursos y bibliografía</h2>
      <p className="ed-hint">
        El estudiante los consulta con el botón «Recursos» de la barra superior del curso.
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
          <button type="button" onClick={() => void remove(i)} aria-label={`Eliminar referencia ${i + 1}`} title="Eliminar referencia">✕</button>
        </div>
      ))}

      <div className="ed-row">
        <button type="button" className="ed-primary" onClick={add}>+ Añadir referencia</button>
      </div>
    </div>
  )
}
