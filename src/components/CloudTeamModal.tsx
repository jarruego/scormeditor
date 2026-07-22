import { useEffect, useState } from 'react'
import { SettingsWindow } from './SettingsModal'
import { Icon } from './Icon'
import { confirmDialog } from '../store/confirm'
import { useCloudSessionStore } from '../cloud/session'
import { listMembers, inviteMember, updateMemberRole, removeMember } from '../cloud/members'
import type { CloudMember, OrgRole } from '../cloud/types'

/**
 * Ventana «Equipo»: roster de la organización, alta por correo (solo cuentas
 * que ya existen — ver `src/cloud/auth.ts`) y cambio de rol. Independiente
 * de CloudModal (se abre desde el botón junto a «Nube de <organización>»)
 * para no recargar esa pantalla con la gestión de personas.
 */
export function CloudTeamModal({
  orgId,
  orgName,
  isOwner,
  onClose,
}: {
  orgId: string
  orgName: string
  isOwner: boolean
  onClose: () => void
}) {
  const session = useCloudSessionStore((s) => s.session)
  const [members, setMembers] = useState<CloudMember[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<OrgRole>('editor')

  async function refresh() {
    setBusy(true)
    setError(null)
    try {
      setMembers(await listMembers(orgId))
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

  async function onInvite() {
    if (!inviteEmail.trim()) return
    setBusy(true)
    setError(null)
    try {
      await inviteMember(orgId, inviteEmail.trim(), inviteRole)
      setInviteEmail('')
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  async function onChangeRole(userId: string, role: OrgRole) {
    setBusy(true)
    setError(null)
    try {
      await updateMemberRole(orgId, userId, role)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  async function onRemove(userId: string) {
    const ok = await confirmDialog({
      title: 'Quitar de la organización',
      message: 'Esta persona perderá el acceso a todos los proyectos de la organización. ¿Continuar?',
      confirmLabel: 'Quitar',
      danger: true,
    })
    if (!ok) return
    setBusy(true)
    setError(null)
    try {
      await removeMember(orgId, userId)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setBusy(false)
    }
  }

  return (
    <SettingsWindow title={`Equipo de ${orgName}`} onClose={onClose} wide>
      <div className="ed-form ed-form-wide">
        {error && <p className="ed-hint-warn">{error}</p>}

        <div className="ed-cloud-list">
          {members.map((m) => {
            // Nadie cambia su propio rol aquí: si el único owner se lo
            // quitara a sí mismo, nadie podría revertirlo desde la app.
            const isSelf = m.user_id === session?.user.id
            return (
              <div key={m.user_id} className="ed-cloud-row">
                <div className="ed-cloud-row-info">
                  <strong>{m.email}{isSelf ? ' (tú)' : ''}</strong>
                </div>
                <div className="ed-cloud-row-actions">
                  {isOwner && !isSelf ? (
                    <select
                      value={m.role}
                      disabled={busy}
                      onChange={(e) => void onChangeRole(m.user_id, e.target.value as OrgRole)}
                      aria-label={`Rol de ${m.email}`}
                    >
                      <option value="owner">Owner</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  ) : (
                    <span className="ed-hint">{m.role}</span>
                  )}
                  {isOwner && !isSelf && (
                    <button className="ed-icobtn ed-icobtn-danger" disabled={busy} onClick={() => void onRemove(m.user_id)} title="Quitar de la organización">
                      <Icon name="trash" size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {isOwner ? (
          <div className="ed-row">
            <label className="ed-field">
              <span>Añadir por correo (debe tener ya cuenta creada en Supabase)</span>
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="compañero@mecohisa.com"
                onKeyDown={(e) => { if (e.key === 'Enter') void onInvite() }} />
            </label>
            <label className="ed-field ed-field-narrow">
              <span>Rol</span>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as OrgRole)}>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
                <option value="owner">Owner</option>
              </select>
            </label>
            <button disabled={busy || !inviteEmail.trim()} onClick={() => void onInvite()}>Añadir</button>
          </div>
        ) : (
          <p className="ed-hint">Solo el owner de la organización puede añadir, quitar o cambiar el rol de miembros.</p>
        )}
      </div>
    </SettingsWindow>
  )
}
