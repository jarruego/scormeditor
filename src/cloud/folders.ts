import { getSupabase } from './client'
import type { CloudFolder, CloudFolderAccess, FolderRole } from './types'

function requireSupabase() {
  return getSupabase().then((s) => {
    if (!s) throw new Error('La nube no está configurada en este editor.')
    return s
  })
}

/** Carpetas de una organización (sin anidar por ahora: agrupan `.scormproj` de un mismo curso/proyecto). */
export async function listFolders(orgId: string): Promise<CloudFolder[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('folders').select('*').eq('org_id', orgId).order('name')
  if (error) throw error
  return data
}

export async function createFolder(orgId: string, name: string): Promise<CloudFolder> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('folders').insert({ org_id: orgId, name }).select().single()
  if (error) throw error
  return data
}

export async function renameFolder(folderId: string, name: string): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.from('folders').update({ name }).eq('id', folderId)
  if (error) throw error
}

/** Borra la carpeta; sus documentos NO se borran, quedan sin carpeta (ver `documents.folder_id ON DELETE SET NULL`). */
export async function deleteFolder(folderId: string): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.from('folders').delete().eq('id', folderId)
  if (error) throw error
}

/**
 * Permisos por carpeta (migración `20260723000004_permisos_por_carpeta`):
 * segundo nivel más fino que el rol de organización — un `viewer` de la
 * organización puede tener 'editor' concedido en una carpeta concreta (y un
 * documento sin carpeta queda siempre exclusivo del `owner`). Quien crea una
 * carpeta se concede 'editor' sobre ella automáticamente (trigger en el
 * servidor); estas funciones son para que el `owner` conceda/quite acceso a
 * los demás.
 */

/** Tu rol concedido en cada carpeta a la que tienes acceso EXPLÍCITO (no
 *  incluye las carpetas que ves solo por ser owner de la organización — para
 *  eso ya basta `isOwner`). Mismo patrón que `listMyRoles()` en members.ts. */
export async function listMyFolderRoles(): Promise<Record<string, FolderRole>> {
  const supabase = await requireSupabase()
  const { data: session } = await supabase.auth.getSession()
  const userId = session.session?.user.id
  if (!userId) return {}
  const { data, error } = await supabase.from('folder_access').select('folder_id, role').eq('user_id', userId)
  if (error) throw error
  const map: Record<string, FolderRole> = {}
  for (const row of data) map[row.folder_id] = row.role as FolderRole
  return map
}

/** Quién tiene acceso a una carpeta (solo lo puede consultar el owner de la organización). */
export async function listFolderAccess(folderId: string): Promise<CloudFolderAccess[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.rpc('list_folder_access', { p_folder_id: folderId })
  if (error) throw error
  return data as CloudFolderAccess[]
}

/** Concede (o cambia el rol de) el acceso de alguien YA miembro de la organización, por email. */
export async function grantFolderAccess(folderId: string, email: string, role: FolderRole): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.rpc('grant_folder_access', { p_folder_id: folderId, p_email: email, p_role: role })
  if (error) throw error
}

export async function revokeFolderAccess(folderId: string, userId: string): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.rpc('revoke_folder_access', { p_folder_id: folderId, p_user_id: userId })
  if (error) throw error
}
