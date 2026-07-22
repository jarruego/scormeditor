-- =============================================================================
-- SCORMEditor · esquema inicial de la nube (Fase 1-3 de docs/internals — ver
-- análisis "SCORMEditor en la nube")
--
-- Cubre: organizaciones, perfiles, membresías, carpetas, documentos
-- (proyectos .scormproj), versiones y bloqueos (estructural / pantalla).
-- No modela el interior de course.json: cada versión es un ZIP completo en
-- Storage, igual que hoy es un archivo en disco. Postgres solo guarda
-- metadatos, permisos y bloqueos.
--
-- ESTE PROYECTO SUPABASE ES COMPARTIDO con el CRM de Mecohisa (academyhub):
-- todo lo de SCORMEditor vive en su propio esquema `scormeditor`, nunca en
-- `public` (ahí están las tablas del CRM). auth.users y storage.buckets SÍ
-- son globales al proyecto — es lo único que no se puede aislar por esquema
-- — por eso los triggers/políticas que los tocan usan nombres con prefijo
-- `scormeditor_` para no chocar si el CRM ya tiene los suyos con nombres
-- parecidos.
--
-- Aplicar pegando el contenido en el SQL Editor del proyecto (o con
-- `supabase db push` si más adelante se usa el CLI). Requiere pgcrypto
-- (ya viene habilitado en cualquier proyecto Supabase).
--
-- Tras aplicarlo, en el dashboard: Project Settings → Data API → "Exposed
-- schemas" → añadir `scormeditor` (por defecto solo expone `public`; sin
-- este paso el cliente no puede consultar nada de aquí).
-- =============================================================================

create extension if not exists pgcrypto;

create schema if not exists scormeditor;

-- -----------------------------------------------------------------------------
-- 1. Organizaciones y perfiles
-- -----------------------------------------------------------------------------

create table scormeditor.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

-- Espejo de auth.users con lo que necesitamos mostrar (nombre, avatar) para
-- presencia y listados de equipo. auth.users no es consultable directamente
-- desde el cliente. Si el CRM ya tiene su propia tabla de perfiles, esta es
-- independiente (vive en scormeditor, no en public) — puede haber dos filas
-- de "perfil" por usuario, una por app, sin conflicto.
create table scormeditor.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

create table scormeditor.memberships (
  user_id    uuid not null references auth.users (id) on delete cascade,
  org_id     uuid not null references scormeditor.organizations (id) on delete cascade,
  role       text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (user_id, org_id)
);

create index memberships_org_id_idx on scormeditor.memberships (org_id);

-- -----------------------------------------------------------------------------
-- 2. Carpetas y documentos (proyectos .scormproj)
-- -----------------------------------------------------------------------------

create table scormeditor.folders (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references scormeditor.organizations (id) on delete cascade,
  parent_folder_id  uuid references scormeditor.folders (id) on delete cascade,
  name              text not null,
  created_by        uuid references auth.users (id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index folders_org_id_idx on scormeditor.folders (org_id);
create index folders_parent_idx on scormeditor.folders (parent_folder_id);

create table scormeditor.documents (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references scormeditor.organizations (id) on delete cascade,
  -- una carpeta que se borra "suelta" sus documentos en vez de arrastrarlos:
  folder_id    uuid references scormeditor.folders (id) on delete set null,
  -- course.course.id (slug editable por el autor); NO es la clave primaria,
  -- solo sirve para sugerir el nombre de archivo al exportar/descargar.
  course_slug  text not null,
  title        text not null,
  size_bytes   bigint not null default 0,
  created_by   uuid references auth.users (id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- papelera de 30 días en vez de borrado inmediato; ver política de SELECT.
  deleted_at   timestamptz
);

create index documents_org_id_idx on scormeditor.documents (org_id);
create index documents_folder_id_idx on scormeditor.documents (folder_id);

create table scormeditor.document_versions (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references scormeditor.documents (id) on delete cascade,
  version_no    int not null,
  -- ruta dentro del bucket 'scormeditor-projects': {org_id}/{document_id}/{id}.zip
  -- (el propio uuid de esta fila, generado en el cliente ANTES de insertarla:
  -- así se puede subir el blob al Storage sin depender todavía de version_no,
  -- que asigna un trigger del servidor — ver src/cloud/documents.ts)
  storage_path  text not null,
  size_bytes    bigint not null default 0,
  created_by    uuid references auth.users (id),
  created_at    timestamptz not null default now(),
  unique (document_id, version_no)
);

create index document_versions_document_id_idx on scormeditor.document_versions (document_id);

-- Bloqueos: 'structural' (árbol completo: añadir/mover/borrar pantallas) o
-- 'screen' (exclusivo y corto, solo para operaciones destructivas dentro de
-- una pantalla, p. ej. changeKind). La coedición normal de contenido NO pasa
-- por esta tabla: va por Yjs + Realtime broadcast (ver Fase 4 del análisis).
-- scope_ref = '' (no NULL) para bloqueos estructurales, así la PK compuesta
-- garantiza como mucho una fila activa por (documento, scope, referencia).
create table scormeditor.document_locks (
  document_id uuid not null references scormeditor.documents (id) on delete cascade,
  scope       text not null check (scope in ('structural', 'screen')),
  scope_ref   text not null default '',
  holder_id   uuid not null references auth.users (id),
  acquired_at timestamptz not null default now(),
  expires_at  timestamptz not null,
  primary key (document_id, scope, scope_ref)
);

-- -----------------------------------------------------------------------------
-- 3. Funciones auxiliares para las políticas RLS
--
-- SECURITY DEFINER aquí es la excepción deliberada, no la norma: sin ella,
-- una política en `memberships` que consulta `memberships` para saber si el
-- usuario pertenece a la organización cae en recursión/rendimiento pobre
-- (patrón documentado por Supabase). Estas funciones son de solo lectura,
-- deterministas sobre auth.uid() y no exponen nada que el propio usuario no
-- pueda ya pedir sobre sí mismo.
--
-- `set search_path = ''` + todo cualificado con su esquema: en un proyecto
-- compartido con otra app no basta con `search_path = public`, porque en
-- este proyecto `public` es del CRM. Cualificar todo explícitamente también
-- evita el clásico ataque de secuestro de search_path en funciones
-- SECURITY DEFINER, así que es la práctica correcta aquí igualmente.
-- -----------------------------------------------------------------------------

create or replace function scormeditor.is_org_member(p_org_id uuid)
returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from scormeditor.memberships m
    where m.org_id = p_org_id and m.user_id = auth.uid()
  );
$$;

create or replace function scormeditor.org_role(p_org_id uuid)
returns text
language sql security definer set search_path = '' stable as $$
  select role from scormeditor.memberships m
  where m.org_id = p_org_id and m.user_id = auth.uid();
$$;

create or replace function scormeditor.document_org(p_document_id uuid)
returns uuid
language sql security definer set search_path = '' stable as $$
  select org_id from scormeditor.documents where id = p_document_id;
$$;

-- -----------------------------------------------------------------------------
-- 4. Triggers de mantenimiento
-- -----------------------------------------------------------------------------

-- Crea el perfil automáticamente al registrarse (magic link ya crea la fila
-- en auth.users antes de que exista ninguna sesión con la que insertar desde
-- el cliente). Nombre de función con prefijo `scormeditor_` a propósito: el
-- CRM puede tener su propio trigger sobre auth.users y los nombres de
-- trigger son únicos por tabla, no por esquema — sin el prefijo, si el CRM
-- ya usara literalmente "handle_new_user"/"on_auth_user_created", esta
-- migración fallaría al chocar.
create or replace function scormeditor.handle_new_user()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into scormeditor.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger scormeditor_on_auth_user_created
  after insert on auth.users
  for each row execute function scormeditor.handle_new_user();

-- Asigna version_no de forma atómica (bloquea la fila del documento para
-- serializar inserts concurrentes de dos dispositivos subiendo a la vez).
create or replace function scormeditor.next_version_no()
returns trigger
language plpgsql set search_path = '' as $$
begin
  perform 1 from scormeditor.documents where id = new.document_id for update;
  select coalesce(max(version_no), 0) + 1 into new.version_no
  from scormeditor.document_versions where document_id = new.document_id;
  return new;
end;
$$;

create trigger trg_next_version_no
  before insert on scormeditor.document_versions
  for each row when (new.version_no is null)
  execute function scormeditor.next_version_no();

-- Cada versión nueva actualiza el documento (última modificación + peso),
-- igual que hoy actualizar un .scormproj en disco cambia su fecha y tamaño.
create or replace function scormeditor.touch_document_on_new_version()
returns trigger
language plpgsql set search_path = '' as $$
begin
  update scormeditor.documents
  set updated_at = new.created_at, size_bytes = new.size_bytes
  where id = new.document_id;
  return new;
end;
$$;

create trigger trg_touch_document_on_new_version
  after insert on scormeditor.document_versions
  for each row execute function scormeditor.touch_document_on_new_version();

-- -----------------------------------------------------------------------------
-- 5. Alta de organización (RPC, no INSERT directo)
--
-- Crear una organización y hacerse `owner` son dos inserts con dependencia
-- circular de RLS (la política de `memberships` exige ya ser miembro para
-- poder insertar en `memberships`). Se resuelve con una única función
-- SECURITY DEFINER que hace ambos inserts en la misma transacción; el
-- cliente la llama vía RPC (`supabase.schema('scormeditor').rpc('create_organization', …)`)
-- y nunca escribe en `organizations`/`memberships` directamente al crear.
-- -----------------------------------------------------------------------------

create or replace function scormeditor.create_organization(p_name text, p_slug text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_org_id uuid;
begin
  insert into scormeditor.organizations (name, slug) values (p_name, p_slug)
  returning id into v_org_id;

  insert into scormeditor.memberships (user_id, org_id, role)
  values (auth.uid(), v_org_id, 'owner');

  return v_org_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- 6. Bloqueos: adquirir / liberar (RPC)
--
-- SECURITY INVOKER (por defecto): las políticas RLS de document_locks se
-- aplican también dentro de la función, así que solo owner/editor pueden
-- llegar a adquirir un bloqueo — no hace falta duplicar esa comprobación aquí.
-- -----------------------------------------------------------------------------

create or replace function scormeditor.acquire_document_lock(
  p_document_id uuid,
  p_scope text,
  p_scope_ref text default '',
  p_ttl_seconds int default 25
)
returns boolean
language plpgsql set search_path = '' as $$
declare
  v_acquired boolean;
begin
  insert into scormeditor.document_locks (document_id, scope, scope_ref, holder_id, acquired_at, expires_at)
  values (
    p_document_id, p_scope, coalesce(p_scope_ref, ''), auth.uid(), now(),
    now() + make_interval(secs => p_ttl_seconds)
  )
  on conflict (document_id, scope, scope_ref) do update
    set holder_id = excluded.holder_id,
        acquired_at = excluded.acquired_at,
        expires_at = excluded.expires_at
    where scormeditor.document_locks.expires_at < now()
       or scormeditor.document_locks.holder_id = excluded.holder_id;

  select (holder_id = auth.uid() and expires_at > now()) into v_acquired
  from scormeditor.document_locks
  where document_id = p_document_id and scope = p_scope and scope_ref = coalesce(p_scope_ref, '');

  return coalesce(v_acquired, false);
end;
$$;

create or replace function scormeditor.release_document_lock(
  p_document_id uuid,
  p_scope text,
  p_scope_ref text default ''
)
returns void
language sql set search_path = '' as $$
  delete from scormeditor.document_locks
  where document_id = p_document_id
    and scope = p_scope
    and scope_ref = coalesce(p_scope_ref, '')
    and holder_id = auth.uid();
$$;

-- =============================================================================
-- 7. Row Level Security
--
-- Regla de fondo: nada de acceso anónimo (todo exige auth.uid()); dentro de
-- una organización, `viewer` solo lee, `editor`/`owner` escriben contenido,
-- solo `owner` gestiona miembros y borra en firme. Todo esto vive en el
-- esquema `scormeditor`: no se toca ningún privilegio del esquema `public`
-- (CRM), ni de sus tablas.
-- =============================================================================

alter table scormeditor.organizations     enable row level security;
alter table scormeditor.profiles          enable row level security;
alter table scormeditor.memberships       enable row level security;
alter table scormeditor.folders           enable row level security;
alter table scormeditor.documents         enable row level security;
alter table scormeditor.document_versions enable row level security;
alter table scormeditor.document_locks    enable row level security;

-- Ni siquiera USAGE en el esquema para anon: sin sesión, no hay ni
-- visibilidad de que este esquema existe.
grant usage on schema scormeditor to authenticated;
grant usage on schema scormeditor to service_role;

grant select, insert, update, delete on
  scormeditor.organizations, scormeditor.profiles, scormeditor.memberships, scormeditor.folders,
  scormeditor.documents, scormeditor.document_versions, scormeditor.document_locks
  to authenticated;
grant execute on function
  scormeditor.create_organization(text, text),
  scormeditor.acquire_document_lock(uuid, text, text, int),
  scormeditor.release_document_lock(uuid, text, text)
  to authenticated;

grant all on all tables in schema scormeditor to service_role;
grant all on all functions in schema scormeditor to service_role;

-- organizations ---------------------------------------------------------------
create policy "miembros ven su organización"
  on scormeditor.organizations for select
  using (scormeditor.is_org_member(id));
-- Sin política de INSERT: el alta pasa siempre por create_organization().
create policy "el owner administra la organización"
  on scormeditor.organizations for update
  using (scormeditor.org_role(id) = 'owner');
create policy "el owner borra la organización"
  on scormeditor.organizations for delete
  using (scormeditor.org_role(id) = 'owner');

-- profiles ----------------------------------------------------------------------
-- Nombre/avatar no son sensibles y hacen falta para presencia entre
-- organizaciones distintas de un mismo usuario; visibles a cualquier
-- autenticado, editables solo por su dueño.
create policy "perfiles visibles para cualquier autenticado"
  on scormeditor.profiles for select
  using (true);
create policy "cada cual edita su propio perfil"
  on scormeditor.profiles for update
  using (id = auth.uid());

-- memberships ---------------------------------------------------------------
create policy "miembros ven el resto de la organización"
  on scormeditor.memberships for select
  using (scormeditor.is_org_member(org_id));
create policy "el owner invita miembros"
  on scormeditor.memberships for insert
  with check (scormeditor.org_role(org_id) = 'owner');
create policy "el owner cambia roles"
  on scormeditor.memberships for update
  using (scormeditor.org_role(org_id) = 'owner');
create policy "el owner expulsa, cualquiera se va"
  on scormeditor.memberships for delete
  using (scormeditor.org_role(org_id) = 'owner' or user_id = auth.uid());

-- folders ---------------------------------------------------------------------
create policy "miembros ven las carpetas"
  on scormeditor.folders for select
  using (scormeditor.is_org_member(org_id));
create policy "editor+ crea carpetas"
  on scormeditor.folders for insert
  with check (scormeditor.org_role(org_id) in ('owner', 'editor'));
create policy "editor+ renombra/mueve carpetas"
  on scormeditor.folders for update
  using (scormeditor.org_role(org_id) in ('owner', 'editor'));
create policy "editor+ borra carpetas"
  on scormeditor.folders for delete
  using (scormeditor.org_role(org_id) in ('owner', 'editor'));

-- documents ---------------------------------------------------------------------
-- viewer no ve la papelera (deleted_at) para no confundir "borrado" con
-- "no aparece en mi lista".
create policy "miembros ven los documentos, papelera solo editor+"
  on scormeditor.documents for select
  using (
    scormeditor.is_org_member(org_id)
    and (deleted_at is null or scormeditor.org_role(org_id) in ('owner', 'editor'))
  );
create policy "editor+ crea documentos"
  on scormeditor.documents for insert
  with check (scormeditor.org_role(org_id) in ('owner', 'editor'));
create policy "editor+ edita documentos (incluida papelera)"
  on scormeditor.documents for update
  using (scormeditor.org_role(org_id) in ('owner', 'editor'));
create policy "el owner purga documentos en firme"
  on scormeditor.documents for delete
  using (scormeditor.org_role(org_id) = 'owner');

-- document_versions -----------------------------------------------------------
-- Inmutables: sin política de UPDATE (nadie reescribe una versión ya subida).
create policy "miembros ven las versiones"
  on scormeditor.document_versions for select
  using (scormeditor.is_org_member(scormeditor.document_org(document_id)));
create policy "editor+ sube versiones nuevas"
  on scormeditor.document_versions for insert
  with check (scormeditor.org_role(scormeditor.document_org(document_id)) in ('owner', 'editor'));
create policy "el owner purga versiones antiguas"
  on scormeditor.document_versions for delete
  using (scormeditor.org_role(scormeditor.document_org(document_id)) = 'owner');

-- document_locks ----------------------------------------------------------------
create policy "miembros ven quién tiene el bloqueo"
  on scormeditor.document_locks for select
  using (scormeditor.is_org_member(scormeditor.document_org(document_id)));
create policy "editor+ adquiere bloqueos a su propio nombre"
  on scormeditor.document_locks for insert
  with check (
    scormeditor.org_role(scormeditor.document_org(document_id)) in ('owner', 'editor')
    and holder_id = auth.uid()
  );
-- USING se evalúa contra la fila EXISTENTE: además de renovar lo propio, debe
-- permitir tomar un bloqueo ajeno ya caducado (si no, INSERT ... ON CONFLICT
-- DO UPDATE nunca podría robar un lock expirado de otro usuario).
create policy "editor+ renueva su bloqueo o toma uno caducado"
  on scormeditor.document_locks for update
  using (
    scormeditor.org_role(scormeditor.document_org(document_id)) in ('owner', 'editor')
    and (holder_id = auth.uid() or expires_at < now())
  )
  with check (holder_id = auth.uid());
create policy "el titular libera su bloqueo"
  on scormeditor.document_locks for delete
  using (holder_id = auth.uid());

-- =============================================================================
-- 8. Storage: bucket 'scormeditor-projects' + políticas
--
-- Nombre de bucket específico (no "scormproj" a secas) para que se
-- distinga a simple vista de los buckets del CRM en el mismo panel de
-- Storage. Convención de ruta: {org_id}/{document_id}/{id-de-la-versión}.zip —
-- storage.foldername(name) devuelve la ruta partida en segmentos; el
-- primero es el org_id, así que las políticas se apoyan en las mismas
-- funciones que las tablas de arriba. storage.objects/storage.buckets son
-- globales al proyecto (no se pueden mover a `scormeditor`), pero las
-- políticas de aquí solo entran en juego cuando bucket_id = esta bucket,
-- así que no afectan a los buckets del CRM.
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('scormeditor-projects', 'scormeditor-projects', false)
on conflict (id) do nothing;

create policy "scormeditor: miembros descargan los ZIP de su organización"
  on storage.objects for select
  using (
    bucket_id = 'scormeditor-projects'
    and scormeditor.is_org_member(((storage.foldername(name))[1])::uuid)
  );

create policy "scormeditor: editor+ sube ZIP a su organización"
  on storage.objects for insert
  with check (
    bucket_id = 'scormeditor-projects'
    and scormeditor.org_role(((storage.foldername(name))[1])::uuid) in ('owner', 'editor')
  );

create policy "scormeditor: el owner borra ZIP de su organización"
  on storage.objects for delete
  using (
    bucket_id = 'scormeditor-projects'
    and scormeditor.org_role(((storage.foldername(name))[1])::uuid) = 'owner'
  );
