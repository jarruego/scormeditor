import { useEffect, useState } from 'react'
import { SettingsWindow } from './SettingsModal'
import { Icon } from './Icon'
import { confirmDialog } from '../store/confirm'
import { listFolderAccess, grantFolderAccess, revokeFolderAccess } from '../cloud/folders'
import { listMembers } from '../cloud/members'
import type { CloudFolderAccess, CloudMember, FolderRole } from '../cloud/types'

/**
 * Ventana «Acceso a la carpeta»: quién puede ver/editar los proyectos de esta
 * carpeta, más allá de su rol en la organización (`docs/internals/
 * nube-sincronizacion.md`). Solo el owner de la organización la abre (gate en
 * `CloudModal.tsx`, igual que `CloudTeamModal`) — el RPC lo exige igualmente,
 * así que esto es solo para no ofrecer un botón que fallaría. Mismo patrón
 * que `CloudTeamModal` (roster + alta), pero por carpeta en vez de por
 * organización, y solo con dos roles ('editor'/'viewer', no 'owner' — ese es
 * exclusivo de la organización entera, se muestra aparte y no es editable
 * aquí).
 */
export function FolderAccessModal({
  folderId,
  folderName,
  orgId,
  onClose,
}: {
  folderId: string
  folderName: string
  orgId: string
  onClose: () => void
}) {
  const [entries, setEntries] = useState<CloudFolderAccess[]>([])
  const [members, setMembers] = useState<CloudMember[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [grantUserId, setGrantUserId] = useState('')
  const [grantRole, setGrantRole] = useState<FolderRole>('editor')

  async function refresh() {
    setBusy(true)
    setError(null)
    try {
      const [access, roster] = await Promise.all([listFolderAccess(folderId), listMembers(orgId)])
      setEntries(access)
      setMembers(roster)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId, orgId])

  const owner = members.find((m) => m.role === 'owner')
  // Candidatos a conceder: miembros de la organización que no sean ya el
  // owner (siempre tiene acceso a todo, no hace falta concederle nada) ni
  // tengan ya una fila de concesión (esa se edita con su propio selector,
  // no se duplica aquí).
  const candidates = members.filter((m) => m.role !== 'owner' && !entries.some((e) => e.user_id === m.user_id))

  useEffect(() => {
    // Si el candidato seleccionado deja de serlo (se le concedió acceso
    // desde otra pestaña, o ya no es miembro), cae al primero disponible.
    if (grantUserId && candidates.some((c) => c.user_id === grantUserId)) return
    setGrantUserId(candidates[0]?.user_id ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, entries])

  async function onGrant() {
    const member = candidates.find((c) => c.user_id === grantUserId)
    if (!member) return
    setBusy(true)
    setError(null)
    try {
      await grantFolderAccess(folderId, member.email, grantRole)
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
          {owner && (
            <div className="ed-cloud-row">
              <div className="ed-cloud-row-info">
                <strong>{owner.email}</strong>
              </div>
              <div className="ed-cloud-row-actions">
                <span className="ed-hint" title="Administra toda la organización: ve y edita todas las carpetas, siempre.">
                  Owner · acceso total
                </span>
              </div>
            </div>
          )}
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

        {candidates.length > 0 ? (
          <div className="ed-row">
            <label className="ed-field">
              <span>Conceder acceso a</span>
              <select value={grantUserId} onChange={(e) => setGrantUserId(e.target.value)}>
                {candidates.map((m) => <option key={m.user_id} value={m.user_id}>{m.email}</option>)}
              </select>
            </label>
            <label className="ed-field ed-field-narrow">
              <span>Rol</span>
              <select value={grantRole} onChange={(e) => setGrantRole(e.target.value as FolderRole)}>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </label>
            <button disabled={busy || !grantUserId} onClick={() => void onGrant()}>Conceder</button>
          </div>
        ) : (
          <p className="ed-hint">
            Ya has concedido acceso a todos los miembros de la organización. Añade a alguien nuevo desde
            «Gestionar equipo» para poder concedérselo aquí.
          </p>
        )}
      </div>
    </SettingsWindow>
  )
}
