-- =============================================================================
-- SCORMEditor · corrige una condición de carrera al crear una carpeta.
--
-- Síntoma: crear una carpeta daba 403 (Forbidden) en el POST a `folders`.
-- Causa: el cliente pide la fila recién creada de vuelta en la MISMA
-- petición (`INSERT ... RETURNING`, que es lo que hace `.insert().select()`
-- de supabase-js) — esa lectura evalúa la política de SELECT
-- (`can_view_folder`, que mira `folder_access`) ANTES de que el trigger
-- `AFTER INSERT` (`grant_creator_folder_access`, migración anterior) termine
-- de escribir la concesión del creador. El creador queda, por un instante,
-- sin ninguna fila en `folder_access` todavía — y sin ser owner de la
-- organización, `can_view_folder` da `false`.
--
-- Arreglo: `folder_role()` reconoce al creador directamente por
-- `folders.created_by = auth.uid()` (disponible al instante, viene del
-- DEFAULT de la columna, no de un trigger aparte) — sin esperar a que exista
-- la fila de `folder_access`. El trigger de la migración anterior se deja
-- tal cual: sigue siendo útil para que «Gestionar acceso» muestre al creador
-- como una concesión explícita más, no solo como caso especial invisible.
-- =============================================================================

create or replace function scormeditor.folder_role(p_folder_id uuid)
returns text
language plpgsql security definer set search_path = '' stable as $$
declare
  v_org_id uuid;
  v_created_by uuid;
  v_role text;
begin
  select org_id, created_by into v_org_id, v_created_by
    from scormeditor.folders where id = p_folder_id;
  if v_org_id is null then return null; end if;
  if scormeditor.org_role(v_org_id) = 'owner' then return 'owner'; end if;
  if v_created_by is not null and v_created_by = auth.uid() then return 'editor'; end if;
  select role into v_role from scormeditor.folder_access
    where folder_id = p_folder_id and user_id = auth.uid();
  return v_role;
end;
$$;
