-- =============================================================================
-- SCORMEditor · permisos de edición POR CARPETA.
--
-- Hasta ahora el único permiso era el de la organización entera
-- (`memberships.role`): un editor de la organización veía/editaba TODOS los
-- proyectos, sin distinción. Esto añade un segundo nivel, más fino: acceso
-- explícito por carpeta (`folder_access`) — pensado para un centro con
-- varios profesores, donde cada uno debe ver/editar SOLO sus propios cursos,
-- y el propietario de la organización decide (concede/revoca) quién tiene
-- acceso a cada carpeta. Varias personas pueden tener acceso de edición a la
-- misma carpeta a la vez (co-tutoría) — no es "un dueño por carpeta", es una
-- concesión muchos-a-muchos.
--
-- Cómo se combinan los dos niveles:
--   - El `owner` de la organización sigue viendo y editando TODO, siempre
--     (es quien concede/revoca accesos — tiene que poder llegar a todas
--     partes sin que nadie se lo impida).
--   - Un `editor`/`viewer` de la organización YA NO ve automáticamente todos
--     los proyectos: solo ve carpetas donde tenga una concesión explícita en
--     `folder_access` (rol 'editor' o 'viewer' — independiente de su rol de
--     organización, que es justo lo que permite «viewer a nivel de equipo,
--     editor en una carpeta concreta»).
--   - Quien CREA una carpeta se concede automáticamente 'editor' sobre ella
--     (si no, la crearía y no podría volver a usarla) — ver el trigger.
--   - Un documento SIN carpeta (`folder_id is null`) queda solo para el
--     owner: no hay carpeta sobre la que comprobar una concesión. En la
--     práctica, todo proyecto de un profesor debe vivir dentro de una
--     carpeta suya — crear un documento sin carpeta pasa a ser exclusivo
--     del owner.
--
-- IMPORTANTE — migración de datos existentes: los documentos/carpetas ya
-- creados no tienen ninguna fila en `folder_access` (no existía la tabla),
-- así que tras aplicar esto SOLO el owner los verá hasta que conceda acceso
-- explícito a cada profesor sobre su carpeta correspondiente. Es intencional
-- (no hay forma de inferir automáticamente «esta carpeta es de fulano» — no
-- quedaba rastro de quién subió qué en el esquema anterior), pero implica
-- trabajo manual de re-concesión tras aplicar esta migración: entra en
-- ☁ Nube → cada carpeta → «Gestionar acceso» y concede a quien corresponda.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. created_by fiable — hasta ahora nadie lo rellenaba al insertar, así que
--    siempre quedaba a null. Con el default, el trigger de la sección 4 (y
--    cualquier auditoría futura) puede confiar en que viene relleno.
-- -----------------------------------------------------------------------------
alter table scormeditor.folders alter column created_by set default auth.uid();
alter table scormeditor.documents alter column created_by set default auth.uid();
alter table scormeditor.document_versions alter column created_by set default auth.uid();

-- -----------------------------------------------------------------------------
-- 2. Tabla de concesiones por carpeta
-- -----------------------------------------------------------------------------
create table scormeditor.folder_access (
  folder_id  uuid not null references scormeditor.folders (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('editor', 'viewer')),
  granted_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  primary key (folder_id, user_id)
);

create index folder_access_user_id_idx on scormeditor.folder_access (user_id);

alter table scormeditor.folder_access enable row level security;

-- -----------------------------------------------------------------------------
-- 3. Funciones de resolución de permisos (mismo patrón SECURITY DEFINER que
--    `org_role`/`is_org_member`/`document_org` de la migración inicial).
-- -----------------------------------------------------------------------------

create or replace function scormeditor.folder_org(p_folder_id uuid)
returns uuid
language sql security definer set search_path = '' stable as $$
  select org_id from scormeditor.folders where id = p_folder_id;
$$;

-- Rol efectivo de auth.uid() sobre una carpeta: 'owner' (administra la
-- organización entera), el rol concedido en `folder_access` si lo hay, o
-- null (sin acceso — ni se sabe que la carpeta existe).
create or replace function scormeditor.folder_role(p_folder_id uuid)
returns text
language plpgsql security definer set search_path = '' stable as $$
declare
  v_org_id uuid;
  v_role text;
begin
  select org_id into v_org_id from scormeditor.folders where id = p_folder_id;
  if v_org_id is null then return null; end if;
  if scormeditor.org_role(v_org_id) = 'owner' then return 'owner'; end if;
  select role into v_role from scormeditor.folder_access
    where folder_id = p_folder_id and user_id = auth.uid();
  return v_role;
end;
$$;

create or replace function scormeditor.can_view_folder(p_folder_id uuid)
returns boolean
language sql stable as $$
  select scormeditor.folder_role(p_folder_id) is not null;
$$;

create or replace function scormeditor.can_edit_folder(p_folder_id uuid)
returns boolean
language sql stable as $$
  select scormeditor.folder_role(p_folder_id) in ('owner', 'editor');
$$;

-- Documento SIN carpeta: solo el owner. Con carpeta: hereda el rol de esa carpeta.
create or replace function scormeditor.document_role(p_document_id uuid)
returns text
language plpgsql security definer set search_path = '' stable as $$
declare
  v_folder_id uuid;
  v_org_id uuid;
begin
  select folder_id, org_id into v_folder_id, v_org_id from scormeditor.documents where id = p_document_id;
  if v_org_id is null then return null; end if;
  if scormeditor.org_role(v_org_id) = 'owner' then return 'owner'; end if;
  if v_folder_id is null then return null; end if;
  return scormeditor.folder_role(v_folder_id);
end;
$$;

create or replace function scormeditor.can_view_document(p_document_id uuid)
returns boolean
language sql stable as $$
  select scormeditor.document_role(p_document_id) is not null;
$$;

create or replace function scormeditor.can_edit_document(p_document_id uuid)
returns boolean
language sql stable as $$
  select scormeditor.document_role(p_document_id) in ('owner', 'editor');
$$;

-- -----------------------------------------------------------------------------
-- 4. Concesión automática al crear una carpeta: quien la crea (si no es ya
--    owner, que no la necesita) se convierte en 'editor' de esa carpeta —
--    si no, la crearía y se quedaría sin poder volver a usarla.
-- -----------------------------------------------------------------------------
create or replace function scormeditor.grant_creator_folder_access()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.created_by is not null and scormeditor.org_role(new.org_id) is distinct from 'owner' then
    insert into scormeditor.folder_access (folder_id, user_id, role, granted_by)
    values (new.id, new.created_by, 'editor', new.created_by)
    on conflict (folder_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists folders_grant_creator_access on scormeditor.folders;
create trigger folders_grant_creator_access
  after insert on scormeditor.folders
  for each row execute function scormeditor.grant_creator_folder_access();

-- -----------------------------------------------------------------------------
-- 5. RLS de `folder_access`: el owner de la organización gestiona todas las
--    concesiones de sus carpetas; cualquiera puede ver las suyas propias
--    (para que el cliente sepa qué carpetas puede editar sin depender de una
--    llamada aparte de administrador).
-- -----------------------------------------------------------------------------
create policy "el owner gestiona las concesiones de su organización"
  on scormeditor.folder_access for all
  using (scormeditor.org_role(scormeditor.folder_org(folder_id)) = 'owner')
  with check (scormeditor.org_role(scormeditor.folder_org(folder_id)) = 'owner');

create policy "cada uno ve sus propias concesiones"
  on scormeditor.folder_access for select
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 6. RPCs para gestionar accesos desde la app (mismo patrón que
--    list_members/invite_member, pero por carpeta en vez de por organización).
-- -----------------------------------------------------------------------------
create or replace function scormeditor.list_folder_access(p_folder_id uuid)
returns table (user_id uuid, email text, role text, created_at timestamptz)
language plpgsql security definer set search_path = '' stable as $$
begin
  if scormeditor.org_role(scormeditor.folder_org(p_folder_id)) is distinct from 'owner' then
    raise exception 'Solo el propietario de la organización puede ver los accesos de esta carpeta.';
  end if;
  return query
    select fa.user_id, u.email::text, fa.role, fa.created_at
    from scormeditor.folder_access fa
    join auth.users u on u.id = fa.user_id
    where fa.folder_id = p_folder_id
    order by fa.created_at;
end;
$$;

create or replace function scormeditor.grant_folder_access(p_folder_id uuid, p_email text, p_role text default 'editor')
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_org_id uuid;
  v_user_id uuid;
begin
  select org_id into v_org_id from scormeditor.folders where id = p_folder_id;
  if v_org_id is null then
    raise exception 'La carpeta no existe.';
  end if;
  if scormeditor.org_role(v_org_id) is distinct from 'owner' then
    raise exception 'Solo el propietario de la organización puede conceder acceso a esta carpeta.';
  end if;
  if p_role not in ('editor', 'viewer') then
    raise exception 'Rol no válido: %', p_role;
  end if;

  select id into v_user_id from auth.users where lower(email) = lower(p_email);
  if v_user_id is null then
    raise exception 'No existe ninguna cuenta con el correo %.', p_email;
  end if;
  if not exists (select 1 from scormeditor.memberships where user_id = v_user_id and org_id = v_org_id) then
    raise exception 'Esa persona no pertenece todavía a la organización. Añádela primero desde «Gestionar equipo».';
  end if;

  insert into scormeditor.folder_access (folder_id, user_id, role, granted_by)
  values (p_folder_id, v_user_id, p_role, auth.uid())
  on conflict (folder_id, user_id) do update
    set role = excluded.role, granted_by = excluded.granted_by, created_at = now();
end;
$$;

create or replace function scormeditor.revoke_folder_access(p_folder_id uuid, p_user_id uuid)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if scormeditor.org_role(scormeditor.folder_org(p_folder_id)) is distinct from 'owner' then
    raise exception 'Solo el propietario de la organización puede quitar accesos de esta carpeta.';
  end if;
  delete from scormeditor.folder_access where folder_id = p_folder_id and user_id = p_user_id;
end;
$$;

grant execute on function
  scormeditor.list_folder_access(uuid),
  scormeditor.grant_folder_access(uuid, text, text),
  scormeditor.revoke_folder_access(uuid, uuid),
  scormeditor.document_role(uuid)
  to authenticated;

grant select, insert, update, delete on scormeditor.folder_access to authenticated;

-- -----------------------------------------------------------------------------
-- 7. Sustituir las políticas que antes miraban solo el rol de organización.
--    (Crear carpetas NO cambia — sigue siendo un permiso de organización, no
--    hay carpeta todavía sobre la que comprobar una concesión.)
-- -----------------------------------------------------------------------------

-- folders -----------------------------------------------------------------------
drop policy if exists "miembros ven las carpetas" on scormeditor.folders;
create policy "acceso concedido ve la carpeta"
  on scormeditor.folders for select
  using (scormeditor.can_view_folder(id));

drop policy if exists "editor+ renombra/mueve carpetas" on scormeditor.folders;
create policy "acceso de edición renombra/mueve la carpeta"
  on scormeditor.folders for update
  using (scormeditor.can_edit_folder(id));

drop policy if exists "editor+ borra carpetas" on scormeditor.folders;
create policy "acceso de edición borra la carpeta"
  on scormeditor.folders for delete
  using (scormeditor.can_edit_folder(id));

-- documents -----------------------------------------------------------------------
drop policy if exists "miembros ven los documentos, papelera solo editor+" on scormeditor.documents;
create policy "acceso concedido ve el documento, papelera solo con edición"
  on scormeditor.documents for select
  using (
    (deleted_at is null and scormeditor.can_view_document(id))
    or (deleted_at is not null and scormeditor.can_edit_document(id))
  );

drop policy if exists "editor+ crea documentos" on scormeditor.documents;
create policy "acceso de edición crea documentos en su carpeta"
  on scormeditor.documents for insert
  with check (
    (folder_id is not null and scormeditor.can_edit_folder(folder_id))
    or scormeditor.org_role(org_id) = 'owner'
  );

drop policy if exists "editor+ edita documentos (incluida papelera)" on scormeditor.documents;
create policy "acceso de edición edita el documento"
  on scormeditor.documents for update
  using (scormeditor.can_edit_document(id))
  with check (
    (folder_id is not null and scormeditor.can_edit_folder(folder_id))
    or scormeditor.org_role(org_id) = 'owner'
  );

-- "el owner purga documentos en firme" no cambia (sigue siendo solo owner).

-- document_versions -----------------------------------------------------------
drop policy if exists "miembros ven las versiones" on scormeditor.document_versions;
create policy "acceso concedido ve las versiones"
  on scormeditor.document_versions for select
  using (scormeditor.can_view_document(document_id));

drop policy if exists "editor+ sube versiones nuevas" on scormeditor.document_versions;
create policy "acceso de edición sube versiones nuevas"
  on scormeditor.document_versions for insert
  with check (scormeditor.can_edit_document(document_id));

-- "el owner purga versiones antiguas" no cambia.

-- document_locks ----------------------------------------------------------------
drop policy if exists "miembros ven quién tiene el bloqueo" on scormeditor.document_locks;
create policy "acceso concedido ve quién tiene el bloqueo"
  on scormeditor.document_locks for select
  using (scormeditor.can_view_document(document_id));

drop policy if exists "editor+ adquiere bloqueos a su propio nombre" on scormeditor.document_locks;
create policy "acceso de edición adquiere bloqueos a su propio nombre"
  on scormeditor.document_locks for insert
  with check (scormeditor.can_edit_document(document_id) and holder_id = auth.uid());

drop policy if exists "editor+ renueva su bloqueo o toma uno caducado" on scormeditor.document_locks;
create policy "acceso de edición renueva su bloqueo o toma uno caducado"
  on scormeditor.document_locks for update
  using (
    scormeditor.can_edit_document(document_id)
    and (holder_id = auth.uid() or expires_at < now())
  )
  with check (holder_id = auth.uid());

-- "el titular libera su bloqueo" no cambia.

-- -----------------------------------------------------------------------------
-- 8. RPCs existentes que también miraban org_role/is_org_member directamente
--    (mismas firmas que ya tenían — create or replace no exige recrearlas).
-- -----------------------------------------------------------------------------
create or replace function scormeditor.get_document_lock(
  p_document_id uuid, p_scope text default 'structural', p_scope_ref text default ''
)
returns table (holder_id uuid, holder_email text, expires_at timestamptz)
language plpgsql security definer set search_path = '' stable as $$
begin
  if not scormeditor.can_view_document(p_document_id) then
    raise exception 'No tienes acceso a este documento.';
  end if;
  return query
    select l.holder_id, u.email::text, l.expires_at
    from scormeditor.document_locks l
    join auth.users u on u.id = l.holder_id
    where l.document_id = p_document_id
      and l.scope = p_scope
      and l.scope_ref = coalesce(p_scope_ref, '')
      and l.expires_at > now();
end;
$$;

create or replace function scormeditor.force_take_document_lock(
  p_document_id uuid, p_scope text, p_scope_ref text default '', p_ttl_seconds int default 60
)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not scormeditor.can_edit_document(p_document_id) then
    raise exception 'No tienes permiso de edición sobre este documento.';
  end if;

  insert into scormeditor.document_locks (document_id, scope, scope_ref, holder_id, acquired_at, expires_at)
  values (
    p_document_id, p_scope, coalesce(p_scope_ref, ''), auth.uid(), now(),
    now() + make_interval(secs => p_ttl_seconds)
  )
  on conflict (document_id, scope, scope_ref) do update
    set holder_id = excluded.holder_id,
        acquired_at = excluded.acquired_at,
        expires_at = excluded.expires_at;
end;
$$;

-- -----------------------------------------------------------------------------
-- 9. Storage: las dos políticas que miraban org_role sobre el primer
--    segmento de la ruta ({org_id}/{document_id}/{version_id}.zip) pasan a
--    mirar el acceso sobre el DOCUMENTO (segundo segmento) — es la única
--    forma de que el permiso por carpeta también aplique a Storage.
-- -----------------------------------------------------------------------------
drop policy if exists "scormeditor: miembros descargan los ZIP de su organización" on storage.objects;
create policy "scormeditor: acceso concedido descarga el ZIP"
  on storage.objects for select
  using (
    bucket_id = 'scormeditor-projects'
    and scormeditor.can_view_document(((storage.foldername(name))[2])::uuid)
  );

drop policy if exists "scormeditor: editor+ sube ZIP a su organización" on storage.objects;
create policy "scormeditor: acceso de edición sube el ZIP"
  on storage.objects for insert
  with check (
    bucket_id = 'scormeditor-projects'
    and scormeditor.can_edit_document(((storage.foldername(name))[2])::uuid)
  );

-- "scormeditor: el owner borra ZIP de su organización" no cambia (purgar en
-- firme sigue siendo exclusivo del owner de la organización).
