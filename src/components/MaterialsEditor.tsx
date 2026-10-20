import { useRef, useState } from 'react'
import { useCourseStore } from '../store/courseStore'
import type { GlossaryTerm, BibliographyEntry, Attachment } from '../schema/course.schema'
import { toBlob, sizeOf as assetSize } from '../media/probeDuration'
import { MAX_ATTACHMENTS, MAX_ATTACHMENT_BYTES, WARN_ATTACHMENT_BYTES, MAX_ATTACHMENTS_TOTAL_BYTES, fmtBytes, isPdfBlob, uniqueAttachmentPath } from '../schema/attachments'
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
  const removeAll = async () => {
    if (!(await confirmDialog({
      title: 'Vaciar glosario',
      message: `Se eliminarán los ${glossary.length} término${glossary.length === 1 ? '' : 's'} del glosario y no podrán recuperarse (salvo con Deshacer). El botón «${glossaryTitle.trim() || 'Glosario'}» dejará de mostrarse al estudiante mientras esté vacío. ¿Deseas continuar?`,
      confirmLabel: 'Vaciar',
      danger: true,
    }))) return
    setGlossary([])
  }

  return (
    <div className="ed-form">
      <EditableHead value={glossaryTitle} placeholder="Glosario" ariaLabel="Título del glosario"
        chipIcon="book" chipLabel="Glosario" onChange={setGlossaryTitle} />
      <p className="ed-hint">
        El estudiante lo consulta con el botón correspondiente del menú lateral del curso
        (rotulado con este título; sin términos, el botón no se muestra). Los términos se
        muestran en el orden de esta lista.
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
        {glossary.length > 0 && (
          <button type="button" className="ed-danger" onClick={() => void removeAll()}>Vaciar glosario</button>
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
  const removeAll = async () => {
    if (!(await confirmDialog({
      title: 'Vaciar recursos',
      message: `Se eliminarán las ${bibliography.length} referencia${bibliography.length === 1 ? '' : 's'} y no podrán recuperarse (salvo con Deshacer). El botón «${bibliographyTitle.trim() || 'Recursos y bibliografía'}» dejará de mostrarse al estudiante mientras esté vacío. ¿Deseas continuar?`,
      confirmLabel: 'Vaciar',
      danger: true,
    }))) return
    setBibliography([])
  }

  return (
    <div className="ed-form">
      <EditableHead value={bibliographyTitle} placeholder="Recursos y bibliografía"
        ariaLabel="Título de recursos y bibliografía" chipIcon="link" chipLabel="Recursos"
        onChange={setBibliographyTitle} />
      <p className="ed-hint">
        El estudiante los consulta con el botón «Recursos» del menú lateral del curso
        (si personalizas el título, el botón lo usa como rótulo; sin referencias, el
        botón no se muestra). Usa un formato de cita homogéneo; el enlace es opcional.
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
        {bibliography.length > 0 && (
          <button type="button" className="ed-danger" onClick={() => void removeAll()}>Vaciar recursos</button>
        )}
      </div>
    </div>
  )
}

/**
 * Documentos PDF adjuntos (Materiales → Documentos). Solo PDF y con límites de
 * tamaño y número (`schema/attachments.ts`). Quitar un documento de la lista no
 * borra el binario del proyecto (así Deshacer lo recupera): queda como recurso
 * huérfano, que no viaja en el SCORM exportado y se puede purgar desde el informe.
 */
export function DocumentsEditor() {
  const docs = useCourseStore((s) => s.course.attachments)
  const setDocs = useCourseStore((s) => s.setAttachments)
  const docsTitle = useCourseStore((s) => s.course.attachments_title)
  const setDocsTitle = useCourseStore((s) => s.setAttachmentsTitle)
  const assets = useCourseStore((s) => s.assets)
  const addAsset = useCourseStore((s) => s.addAsset)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const sizeOf = (d: Attachment) => d.size ?? (assets[d.src] != null ? assetSize(assets[d.src]) : 0)
  const update = (i: number, patch: Partial<Attachment>) =>
    setDocs(docs.map((d, j) => (j === i ? { ...d, ...patch } : d)))
  const move = (i: number, delta: number) => {
    const j = i + delta
    if (j < 0 || j >= docs.length) return
    const next = [...docs]
    ;[next[i], next[j]] = [next[j], next[i]]
    setDocs(next)
  }
  const remove = async (i: number) => {
    if (!(await confirmDialog({
      title: 'Quitar documento',
      message: `Se quitará «${docs[i].title.trim() || docs[i].src}» de los documentos del curso. Puedes recuperarlo con Deshacer.`,
      confirmLabel: 'Quitar',
      danger: true,
    }))) return
    setDocs(docs.filter((_, j) => j !== i))
  }
  const open = (src: string) => {
    const blob = assets[src]
    if (!blob) return
    const url = URL.createObjectURL(toBlob(blob))
    window.open(url, '_blank', 'noopener')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    setBusy(true)
    setMsg(null)
    const added: Attachment[] = []
    const rejected: string[] = []
    try {
      for (const file of files) {
        if (docs.length + added.length >= MAX_ATTACHMENTS) {
          rejected.push(`«${file.name}»: el curso ya tiene el máximo de ${MAX_ATTACHMENTS} documentos.`)
          continue
        }
        if (!(await isPdfBlob(file))) {
          rejected.push(`«${file.name}» no es un PDF: solo se pueden adjuntar documentos PDF.`)
          continue
        }
        if (file.size > MAX_ATTACHMENT_BYTES) {
          rejected.push(`«${file.name}» pesa ${fmtBytes(file.size)} y el máximo es ${fmtBytes(MAX_ATTACHMENT_BYTES)}: redúcelo (por ejemplo, guardándolo de nuevo como PDF optimizado) o enlázalo desde Recursos.`)
          continue
        }
        if (file.size > WARN_ATTACHMENT_BYTES && !(await confirmDialog({
          title: 'Documento pesado',
          message: `«${file.name}» pesa ${fmtBytes(file.size)} (recomendado: menos de ${fmtBytes(WARN_ATTACHMENT_BYTES)}). Un PDF pesado engorda el paquete SCORM y tarda en abrirse en el móvil. ¿Lo adjuntas igualmente?`,
          confirmLabel: 'Adjuntar igualmente',
          cancelLabel: 'Cancelar',
        }))) continue
        const taken = (p: string) => p in assets || added.some((d) => d.src === p)
        const src = uniqueAttachmentPath(file.name, taken)
        addAsset(src, new Blob([file], { type: 'application/pdf' }))
        added.push({ title: file.name.replace(/\.pdf$/i, ''), description: '', src, size: file.size })
      }
      if (added.length) setDocs([...docs, ...added])
      if (rejected.length) setMsg(rejected.join(' '))
    } finally {
      setBusy(false)
    }
  }

  const total = docs.reduce((n, d) => n + sizeOf(d), 0)
  const full = docs.length >= MAX_ATTACHMENTS

  return (
    <div className="ed-form">
      <EditableHead value={docsTitle} placeholder="Documentos" ariaLabel="Título de los documentos"
        chipIcon="file-text" chipLabel="Documentos" onChange={setDocsTitle} />
      <p className="ed-hint">
        Documentos PDF que el estudiante puede abrir o descargar desde el menú lateral del curso
        (con este título; sin documentos, la entrada no se muestra). Solo PDF: hasta {MAX_ATTACHMENTS} documentos
        de {fmtBytes(MAX_ATTACHMENT_BYTES)} como máximo cada uno (recomendado: menos de {fmtBytes(WARN_ATTACHMENT_BYTES)} cada
        uno y menos de {fmtBytes(MAX_ATTACHMENTS_TOTAL_BYTES)} entre todos). Para documentos más pesados, mejor un enlace en Recursos.
      </p>

      {docs.length === 0 && <p className="ed-empty">Sin documentos. Adjunta el primer PDF.</p>}

      {docs.map((d, i) => (
        <div key={d.src} className="ed-term-row">
          <div className="ed-term-fields">
            <label className="ed-field">
              <span>Título (lo ve el estudiante)</span>
              <input value={d.title} placeholder="p. ej. Ficha de ejercicios" onChange={(e) => update(i, { title: e.target.value })} />
            </label>
            <label className="ed-field">
              <span>Descripción (opcional)</span>
              <input value={d.description} placeholder="Para qué sirve o cuándo consultarlo" onChange={(e) => update(i, { description: e.target.value })} />
            </label>
            <p className="ed-hint">
              <Icon name="file-text" size={12} /> {d.src.replace(/^assets\/docs\//, '')} · {fmtBytes(sizeOf(d))}
              {assets[d.src]
                ? <> · <button type="button" className="ed-link" onClick={() => open(d.src)}>Abrir</button></>
                : <strong> · Falta el archivo en el proyecto</strong>}
            </p>
          </div>
          <span className="ed-row">
            <button type="button" className="ed-icobtn" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Subir documento" title="Subir"><Icon name="arrow-up" size={14} /></button>
            <button type="button" className="ed-icobtn" disabled={i === docs.length - 1} onClick={() => move(i, 1)} aria-label="Bajar documento" title="Bajar"><Icon name="arrow-down" size={14} /></button>
            <button type="button" className="ed-icobtn ed-icobtn-danger" onClick={() => void remove(i)} aria-label={`Quitar documento ${d.title || i + 1}`} title="Quitar documento"><Icon name="trash" size={14} /></button>
          </span>
        </div>
      ))}

      <div className="ed-row">
        <label className="ed-file-btn" aria-busy={busy} aria-disabled={full} title={full ? `Máximo ${MAX_ATTACHMENTS} documentos` : undefined}>
          <Icon name="plus" size={13} /> {busy ? 'Procesando…' : 'Adjuntar PDF…'}
          <input type="file" accept="application/pdf,.pdf" multiple hidden disabled={busy || full} onChange={(e) => void onPick(e)} />
        </label>
        {docs.length > 0 && <span className="ed-hint">{docs.length} de {MAX_ATTACHMENTS} · {fmtBytes(total)} en total</span>}
      </div>
      {msg && <p className="ed-hint-warn" role="alert">{msg}</p>}
    </div>
  )
}
