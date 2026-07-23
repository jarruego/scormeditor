-- =============================================================================
-- SCORMEditor · arregla el 403 al crear una carpeta (y el mismo bug latente
-- al crear un documento).
--
-- Diagnóstico (confirmado paso a paso con el usuario, no es una suposición):
-- una consulta directa después de insertar (`select ... from folders where
-- id = ...`) ve la fila y `org_role`/`folder_role`/`can_view_folder` la
-- resuelven bien (`owner`/`owner`/`true`). Pero la MISMA comprobación,
-- evaluada como parte del `INSERT ... RETURNING *` (lo que hace
-- `.insert().select()` de supabase-js), fallaba con «new row violates
-- row-level security policy for table "folders"».
--
-- Causa: `folder_role(p_folder_id)` hace su PROPIA consulta interna a
-- `scormeditor.folders` para resolver `org_id`/`created_by` a partir del id
-- — y esa subconsulta, evaluada en el mismo instante en que Postgres decide
-- si la fila recién insertada pasa la política de SELECT para el RETURNING
-- de esa MISMA sentencia, no ve todavía esa fila. Las políticas originales
-- (`org_role(org_id)`) nunca tuvieron este problema porque `org_id` les
-- llegaba ya resuelto directamente de la fila (columna a secas), sin volver
-- a consultar la tabla que se está insertando.
--
-- Arreglo: nuevas variantes «_direct» de `folder_role`/`document_role` que
-- reciben `org_id`/`created_by`/`folder_id` ya resueltos como argumentos
-- (columnas a secas de la fila, igual que hacía `org_role(org_id)` antes) en
-- vez de volver a consultar su propia tabla. Solo hace falta para las
-- políticas de SELECT de `folders` y `documents` (las que Postgres evalúa
-- también para el RETURNING de su propio INSERT); el resto de sitios
-- (document_versions, document_locks, Storage, el RPC `document_role` que
-- llama el cliente) comprueban una tabla DISTINTA a la que se está
-- insertando, así que no tienen este problema y se quedan igual.
-- =============================================================================

create or replace function scormeditor.folder_role_direct(p_folder_id uuid, p_org_id uuid, p_created_by uuid)
returns text
language plpgsql security definer set search_path = '' stable as $$
declare
  v_role text;
begin
  if p_org_id is null then return null; end if;
  if scormeditor.org_role(p_org_id) = 'owner' then return 'owner'; end if;
  if p_created_by is not null and p_created_by = auth.uid() then return 'editor'; end if;
  select role into v_role from scormeditor.folder_access
    where folder_id = p_folder_id and user_id = auth.uid();
  return v_role;
end;
$$;

-- folders -----------------------------------------------------------------------
drop policy if exists "acceso concedido ve la carpeta" on scormeditor.folders;
create policy "acceso concedido ve la carpeta"
  on scormeditor.folders for select
  using (scormeditor.folder_role_direct(id, org_id, created_by) is not null);

drop policy if exists "acceso de edición renombra/mueve la carpeta" on scormeditor.folders;
create policy "acceso de edición renombra/mueve la carpeta"
  on scormeditor.folders for update
  using (scormeditor.folder_role_direct(id, org_id, created_by) in ('owner', 'editor'));

drop policy if exists "acceso de edición borra la carpeta" on scormeditor.folders;
create policy "acceso de edición borra la carpeta"
  on scormeditor.folders for delete
  using (scormeditor.folder_role_direct(id, org_id, created_by) in ('owner', 'editor'));

-- documents (mismo problema, aquí solo hacía falta para SELECT — la
-- política de INSERT ya recibía `folder_id`/`org_id` como columnas a secas
-- de la fila nueva, sin volver a consultar `documents`, así que nunca tuvo
-- este bug; UPDATE tampoco lo pedía porque el cliente no encadena `.select()`) ---
create or replace function scormeditor.document_role_direct(p_folder_id uuid, p_org_id uuid)
returns text
language plpgsql security definer set search_path = '' stable as $$
begin
  if p_org_id is null then return null; end if;
  if scormeditor.org_role(p_org_id) = 'owner' then return 'owner'; end if;
  if p_folder_id is null then return null; end if;
  return scormeditor.folder_role(p_folder_id); -- OK: folders es otra tabla, ya existe de antes.
end;
$$;

drop policy if exists "acceso concedido ve el documento, papelera solo con edición" on scormeditor.documents;
create policy "acceso concedido ve el documento, papelera solo con edición"
  on scormeditor.documents for select
  using (
    (deleted_at is null and scormeditor.document_role_direct(folder_id, org_id) is not null)
    or (deleted_at is not null and scormeditor.document_role_direct(folder_id, org_id) in ('owner', 'editor'))
  );
