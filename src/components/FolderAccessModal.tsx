import { useEffect, useState } from 'react'
import { SettingsWindow } from './SettingsModal'
import { Icon } from './Icon'
import { confirmDialog } from '../store/confirm'
import { listFolderAccess, grantFolderAccess, revokeFolderAccess } from '../cloud/folders'
import type { CloudFolderAccess, FolderRole } from '../cloud/types'

/**
 * Ventana «Acceso a la carpeta»: quién puede ver/editar los proyectos de esta
 * carpeta, más allá de su rol en la organización (migración
 * `20260723000004_permisos_por_carpeta`). Solo el owner de la organización
 * la abre (gate en `CloudModal.tsx`, igual que `CloudTeamModal`) — el RPC lo
 * exige igualmente, así que esto es solo para no ofrecer un botón que fallaría.
 * Mismo patrón que `CloudTeamModal` (roster + alta por correo), pero por
 * carpeta en vez de por organización, y solo con dos roles ('editor'/'viewer',
 * no 'owner' — ese es exclusivo de la organización entera).
 */
export function FolderAccessModal({
  folderId,
  folderName,
  onClose,
}: {
  folderId: string
  folderName: string
  onClose: () => void
}) {
  const [entries, setEntries] = useState<CloudFolderAccess[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [grantEmail, setGrantEmail] = useState('')
  const [grantRole, setGrantRole] = useState<FolderRole>('editor')

  async function refresh() {
    setBusy(true)
    setError(null)
    try {
      setEntries(await listFolderAccess(folderId))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId])

  async function onGrant() {
    const email = grantEmail.trim()
    if (!email) return
    setBusy(true)
    setError(null)
    try {
      await grantFolderAccess(folderId, email, grantRole)
      setGrantEmail('')
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  async function onChangeRole(userId: string, role: FolderRole) {
    setBusy(true)
    setError(null)
    try {
      // grant_folder_access también sirve para cambiar el rol (upsert) — se
      // necesita el email, no el user_id, así que se reenvía el ya conocido.
      const entry = entries.find((e) => e.user_id === userId)
      if (!entry) return
      await grantFolderAccess(folderId, entry.email, role)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  async function onRevoke(userId: string, email: string) {
    const ok = await confirmDialog({
      title: 'Quitar acceso a la carpeta',
      message: `${email} dejará de ver y editar los proyectos de «${folderName}» (a menos que administre toda la organización). ¿Continuar?`,
      confirmLabel: 'Quitar acceso',
      danger: true,
    })
    if (!ok) return
    setBusy(true)
    setError(null)
    try {
      await revokeFolderAccess(folderId, userId)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  return (
    <SettingsWindow title={`Acceso a «${folderName}»`} onClose={onClose} wide>
      <div className="ed-form ed-form-wide">
        <p className="ed-hint ed-hint-lead">
          Solo quien administra toda la organización ve todas las carpetas. El resto solo ve/edita las carpetas
          que le concedas aquí — independiente de su rol de organización (un «viewer» puede ser «editor» justo
          en esta carpeta).
        </p>
        {error && <p className="ed-hint-warn">{error}</p>}

        <div className="ed-cloud-list">
          {!busy && entries.length === 0 && <p className="ed-hint">Nadie más tiene acceso a esta carpeta todavía.</p>}
          {entries.map((e) => (
            <div key={e.user_id} className="ed-cloud-row">
              <div className="ed-cloud-row-info">
                <strong>{e.email}</strong>
              </div>
              <div className="ed-cloud-row-actions">
                <select
                  value={e.role}
                  disabled={busy}
                  onChange={(ev) => void onChangeRole(e.user_id, ev.target.value as FolderRole)}
                  aria-label={`Rol de ${e.email} en esta carpeta`}
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button className="ed-icobtn ed-icobtn-danger" disabled={busy} onClick={() => void onRevoke(e.user_id, e.email)} title="Quitar acceso a esta carpeta">
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="ed-row">
          <label className="ed-field">
            <span>Conceder acceso por correo (debe ser ya miembro de la organización)</span>
            <input type="email" value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} placeholder="compañero@mecohisa.com"
              onKeyDown={(e) => { if (e.key === 'Enter') void onGrant() }} />
          </label>
          <label className="ed-field ed-field-narrow">
            <span>Rol</span>
            <select value={grantRole} onChange={(e) => setGrantRole(e.target.value as FolderRole)}>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>
          <button disabled={busy || !grantEmail.trim()} onClick={() => void onGrant()}>Conceder</button>
        </div>
      </div>
    </SettingsWindow>
  )
}
