import { getSupabase } from './client'

function requireSupabase() {
  return getSupabase().then((s) => {
    if (!s) throw new Error('La nube no está configurada en este editor.')
    return s
  })
}

export interface DocumentLockInfo {
  holderId: string
  holderEmail: string
  expiresAt: string
}

/** Adquiere (o renueva, si ya la tienes) el bloqueo blando de todo el documento. */
export async function acquireDocumentLock(documentId: string, ttlSeconds = 60): Promise<boolean> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.rpc('acquire_document_lock', {
    p_document_id: documentId, p_scope: 'structural', p_scope_ref: '', p_ttl_seconds: ttlSeconds,
  })
  if (error) throw error
  return data as boolean
}

export async function releaseDocumentLock(documentId: string): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.rpc('release_document_lock', { p_document_id: documentId, p_scope: 'structural', p_scope_ref: '' })
  if (error) throw error
}

/**
 * «Tomar el control»: a diferencia de `acquireDocumentLock` (que nunca roba un
 * bloqueo ajeno todavía vivo, solo renueva el tuyo o toma uno ya caducado),
 * esta SÍ lo fuerza — pensada para el botón explícito de la banda de solo
 * lectura, nunca para el latido silencioso. Quien lo tenía se entera solo
 * (Realtime sobre `document_locks`, ver `src/cloud/watch.ts`), no hace falta
 * avisarle desde aquí.
 */
export async function forceTakeDocumentLock(documentId: string, ttlSeconds = 60): Promise<void> {
  const supabase = await requireSupabase()
  const { error } = await supabase.rpc('force_take_document_lock', {
    p_document_id: documentId, p_scope: 'structural', p_scope_ref: '', p_ttl_seconds: ttlSeconds,
  })
  if (error) throw error
}

/** Quién tiene el documento abierto ahora mismo (null = nadie, o ya caducó). */
export async function getDocumentLock(documentId: string): Promise<DocumentLockInfo | null> {
  const supabase = await requireSupabase()
  const { data, error } = await supabase.rpc('get_document_lock', { p_document_id: documentId, p_scope: 'structural', p_scope_ref: '' })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null
  return { holderId: row.holder_id, holderEmail: row.holder_email, expiresAt: row.expires_at }
}
