import { getSupabase, CLOUD_BUCKET } from './client'
import type { CloudOrganization, CloudDocument, CloudDocumentVersion } from './types'

function requireSupabase() {
  return getSupabase().then((s) => {
    if (!s) throw new Error('La nube no está configurada en este editor.')
    return s
  })
}

export async function listOrganizations(): Promise<CloudOrganization[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('organizations').select('*').order('name')
  if (error) throw error
  return data
}

/** Crea la organización y te hace `owner` (RPC: ver comentario en la migración sobre por qué no es un INSERT directo). */
export async function createOrganization(name: string, slug: string): Promise<string> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.rpc('create_organization', { p_name: name, p_slug: slug })
  if (error) throw error
  return data as string
}

/** Documentos vivos (sin papelera) de una organización, más recientes primero. */
export async function listDocuments(orgId: string): Promise<CloudDocument[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getLatestVersion(documentId: string): Promise<CloudDocumentVersion | null> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version_no', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function downloadVersionBlob(storagePath: string): Promise<Blob> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.storage.from(CLOUD_BUCKET).download(storagePath)
  if (error) throw error
  return data
}

/**
 * Sube una versión nueva de un documento ya existente. La ruta de Storage usa
 * un id de versión generado en el cliente (no `version_no`, que lo asigna un
 * trigger en el servidor y no se conoce todavía cuando hace falta subir el
 * blob) — así se sube primero al Storage y se registra la fila después, sin
 * ida y vuelta extra. Si el registro en Postgres fallara tras subir el
 * blob, queda un objeto huérfano en Storage (caso raro, sin limpieza
 * automática todavía).
 */
export async function uploadVersion(orgId: string, documentId: string, blob: Blob): Promise<string> {
  const supabase = await requireSupabase()
  const versionId = crypto.randomUUID()
  const storagePath = `${orgId}/${documentId}/${versionId}.zip`
  const { error: upErr } = await supabase.storage.from(CLOUD_BUCKET).upload(storagePath, blob, {
    contentType: 'application/zip',
    upsert: false,
  })
  if (upErr) throw upErr
  const { error: dbErr } = await supabase
    .from('document_versions')
    .insert({ id: versionId, document_id: documentId, storage_path: storagePath, size_bytes: blob.size })
  if (dbErr) throw dbErr
  return versionId
}

/** Crea el documento (fila) y sube su primera versión. Devuelve el id del documento y de esa versión. */
export async function createCloudDocument(opts: {
  orgId: string
  folderId: string | null
  title: string
  courseSlug: string
  blob: Blob
}): Promise<{ documentId: string; versionId: string }> {
  const supabase = await requireSupabase()
  const { data: doc, error: docErr } = await supabase
    .from('documents')
    .insert({ org_id: opts.orgId, folder_id: opts.folderId, title: opts.title, course_slug: opts.courseSlug })
    .select()
    .single()
  if (docErr) throw docErr
  const versionId = await uploadVersion(opts.orgId, doc.id, opts.blob)
  return { documentId: doc.id as string, versionId }
}

/** Mueve un documento a otra carpeta (o a «sin carpeta» con `null`). */
export async function moveDocumentToFolder(documentId: string, folderId: string | null): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.from('documents').update({ folder_id: folderId }).eq('id', documentId)
  if (error) throw error
}

export async function renameDocument(documentId: string, title: string): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.from('documents').update({ title }).eq('id', documentId)
  if (error) throw error
}

/** Papelera: no borra en firme, solo marca `deleted_at` (se oculta de `listDocuments`). */
export async function trashDocument(documentId: string): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase
    .from('documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', documentId)
  if (error) throw error
}

/** Documentos en la papelera de una organización, más recientes primero. */
export async function listTrashedDocuments(orgId: string): Promise<CloudDocument[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('org_id', orgId)
    .not('deleted_at', 'is', null)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

/** Saca un documento de la papelera (vuelve a aparecer en `listDocuments`). */
export async function restoreDocument(documentId: string): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.from('documents').update({ deleted_at: null }).eq('id', documentId)
  if (error) throw error
}

export async function listVersions(documentId: string): Promise<CloudDocumentVersion[]> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.from('document_versions').select('*').eq('document_id', documentId)
  if (error) throw error
  return data
}

/**
 * Borra el documento EN FIRME: primero los ZIP de Storage (Postgres no los
 * conoce, así que un `ON DELETE CASCADE` sobre `document_versions` no los
 * tocaría) y después la fila (que arrastra sus versiones por cascade).
 * Irreversible — solo lo permite RLS al owner.
 */
export async function purgeDocument(documentId: string): Promise<void> {
  const supabase = await requireSupabase()
  const versions = await listVersions(documentId)
  if (versions.length > 0) {
    const { error: storageErr } = await supabase.storage.from(CLOUD_BUCKET).remove(versions.map((v) => v.storage_path))
    if (storageErr) throw storageErr
  }
  const { error } = await supabase.from('documents').delete().eq('id', documentId)
  if (error) throw error
}
