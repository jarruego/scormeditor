import type { SupabaseClient } from '@supabase/supabase-js'

// Sin tipos generados de Postgres (no hay `Database` type): el genérico de
// esquema de supabase-js por defecto asume "public", así que se fija a mano
// a "scormeditor" (todas nuestras tablas viven ahí, nunca en "public").
export type CloudClient = SupabaseClient<any, 'scormeditor', any>

/**
 * Cliente Supabase del proyecto compartido de Mecohisa (ver
 * `docs/internals/persistencia-scormproj.md` y el análisis de arquitectura de
 * nube). Todo lo de SCORMEditor vive en el esquema `scormeditor` — nunca en
 * `public`, que es del CRM (academyhub) en el mismo proyecto.
 *
 * `@supabase/supabase-js` se carga con import dinámico (mismo patrón que
 * `src/interop/elpx/`): si el editor no tiene credenciales configuradas o
 * nadie usa la nube, ni el paquete ni una sola llamada de red entran en
 * juego. Invariante: sin sesión, cero diferencia con el editor 100% local.
 */

export const CLOUD_SCHEMA = 'scormeditor'
export const CLOUD_BUCKET = 'scormeditor-projects'

function config(): { url: string; anonKey: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  return url && anonKey ? { url, anonKey } : null
}

/** true si hay credenciales de Supabase configuradas (build-time), independientemente de si hay sesión. */
export function isCloudConfigured(): boolean {
  return !!config()
}

let clientPromise: Promise<CloudClient> | null = null

/** Devuelve el cliente (cacheado tras la primera llamada) o `null` si la nube no está configurada. */
export async function getSupabase(): Promise<CloudClient | null> {
  const cfg = config()
  if (!cfg) return null
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(cfg.url, cfg.anonKey, { db: { schema: CLOUD_SCHEMA } }),
    )
  }
  return clientPromise
}
