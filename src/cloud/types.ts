/**
 * Tipos del esquema `scormeditor` en Supabase (ver
 * `supabase/migrations/20260721000000_esquema_inicial.sql`). Reflejan las
 * columnas reales; nada aquí modela el interior de `course.json` — cada
 * versión sigue siendo el ZIP completo, igual que hoy en disco.
 */

export type OrgRole = 'owner' | 'editor' | 'viewer'

/** Rol de una concesión de `folder_access` — independiente de `OrgRole`: un
 *  'viewer' de la organización puede tener 'editor' concedido en una carpeta
 *  concreta (y viceversa, un 'editor' de la organización puede no tener
 *  ninguna concesión y no ver esa carpeta). */
export type FolderRole = 'editor' | 'viewer'

/** Rol EFECTIVO sobre una carpeta/documento concretos: 'owner' si administra
 *  toda la organización (ve/edita todo, sin necesitar concesión), el rol de
 *  `folder_access` si lo hay, o null si no hay acceso en absoluto. */
export type EffectiveRole = OrgRole | null

/** Fila de `list_folder_access()`: una concesión con el email resuelto. */
export interface CloudFolderAccess {
  user_id: string
  email: string
  role: FolderRole
  created_at: string
}

export interface CloudOrganization {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface CloudMembership {
  user_id: string
  org_id: string
  role: OrgRole
  created_at: string
}

/** Fila de `list_members()`: una membresía con el email resuelto (ver `src/cloud/members.ts`). */
export interface CloudMember {
  user_id: string
  email: string
  role: OrgRole
  created_at: string
}

export interface CloudFolder {
  id: string
  org_id: string
  parent_folder_id: string | null
  name: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CloudDocument {
  id: string
  org_id: string
  folder_id: string | null
  course_slug: string
  title: string
  size_bytes: number
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CloudDocumentVersion {
  id: string
  document_id: string
  version_no: number
  storage_path: string
  size_bytes: number
  created_by: string | null
  created_at: string
}
