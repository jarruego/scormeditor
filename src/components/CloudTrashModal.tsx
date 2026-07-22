import { useEffect, useState } from 'react'
import { SettingsWindow } from './SettingsModal'
import { Icon } from './Icon'
import { confirmDialog } from '../store/confirm'
import { listTrashedDocuments, restoreDocument, purgeDocument } from '../cloud/documents'
import type { CloudDocument } from '../cloud/types'

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/**
 * Ventana «Papelera»: proyectos eliminados (borrado suave, `documents.deleted_at`).
 * Restaurar solo cambia esa marca (editor+, misma RLS que renombrar/mover).
 * Borrar en firme quita también los ZIP de Storage y es irreversible — RLS
 * lo deja solo al owner, y aquí se oculta ese botón a quien no lo sea.
 */
export function CloudTrashModal({ orgId, orgName, isOwner, onClose }: {
  orgId: string
  orgName: string
  isOwner: boolean
  onClose: () => void
}) {
  const [docs, setDocs] = useState<CloudDocument[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setBusy(true)
    setError(null)
    try {
      setDocs(await listTrashedDocuments(orgId))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId])

  async function onRestore(d: CloudDocument) {
    setBusy(true)
    setError(null)
    try {
      await restoreDocument(d.id)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  async function onPurge(d: CloudDocument) {
    const ok = await confirmDialog({
      title: 'Borrar en firme',
      message: `«${d.title}» y todas sus versiones se borrarán para siempre, incluidos los archivos en Supabase Storage. No se puede deshacer. ¿Continuar?`,
      confirmLabel: 'Borrar para siempre',
      danger: true,
    })
    if (!ok) return
    setBusy(true)
    setError(null)
    try {
      await purgeDocument(d.id)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  return (
    <SettingsWindow title={`Papelera de ${orgName}`} onClose={onClose} wide>
      <div className="ed-form ed-form-wide">
        <p className="ed-hint">
          Los proyectos eliminados quedan aquí — no ocupan sitio en el explorador, pero siguen consumiendo
          espacio en Supabase hasta que se restauren o se borren en firme.
        </p>
        {error && <p className="ed-hint-warn">{error}</p>}
        <div className="ed-cloud-list">
          {!busy && docs.length === 0 && <p className="ed-hint">La papelera está vacía.</p>}
          {docs.map((d) => (
            <div key={d.id} className="ed-cloud-row">
              <div className="ed-cloud-row-info">
                <strong>{d.title}</strong>
                <span className="ed-hint">{fmtDate(d.updated_at)} · {fmtBytes(d.size_bytes)}</span>
              </div>
              <div className="ed-cloud-row-actions">
                <button className="ed-btn-ghost" disabled={busy} onClick={() => void onRestore(d)} title="Restaurar (vuelve a aparecer en el explorador)">
                  <Icon name="undo" size={13} /> Restaurar
                </button>
                {isOwner && (
                  <button className="ed-icobtn ed-icobtn-danger" disabled={busy} onClick={() => void onPurge(d)} title="Borrar en firme (irreversible)">
                    <Icon name="trash" size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SettingsWindow>
  )
}
