import { getSupabase } from './client'
import type { CloudMember, OrgRole } from './types'

function requireSupabase() {
  return getSupabase().then((s) => {
    if (!s) throw new Error('La nube no está configurada en este editor.')
    return s
  })
}

/** Roster de una organización, con email resuelto (RPC: auth.users no es consultable directamente). */
export async function listMembers(orgId: string): Promise<CloudMember[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.rpc('list_members', { p_org_id: orgId })
  if (error) throw error
  return data as CloudMember[]
}

/** Tu rol en cada organización a la que perteneces: { org_id: role }. */
export async function listMyRoles(): Promise<Record<string, OrgRole>> {
  const supabase = await requireSupabase()
  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user.id
  if (!userId) return {}
  const { data, error } = await supabase.from('memberships').select('org_id, role').eq('user_id', userId)
  if (error) throw error
  const map: Record<string, OrgRole> = {}
  for (const row of data) map[row.org_id] = row.role as OrgRole
  return map
}

/** Añade (o cambia de rol) a alguien que YA tiene cuenta de Supabase, por email. */
export async function inviteMember(orgId: string, email: string, role: OrgRole): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.rpc('invite_member', { p_org_id: orgId, p_email: email, p_role: role })
  if (error) throw error
}

/** Cambia el rol de alguien que ya es miembro (RLS: solo el owner puede). */
export async function updateMemberRole(orgId: string, userId: string, role: OrgRole): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.from('memberships').update({ role }).eq('org_id', orgId).eq('user_id', userId)
  if (error) throw error
}

export async function removeMember(orgId: string, userId: string): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.from('memberships').delete().eq('org_id', orgId).eq('user_id', userId)
  if (error) throw error
}
