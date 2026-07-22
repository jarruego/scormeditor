import { getSupabase } from './client'
import type { CloudFolder } from './types'

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
