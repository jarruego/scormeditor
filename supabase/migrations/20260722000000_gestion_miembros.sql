-- =============================================================================
-- SCORMEditor · gestión de equipo desde la app (panel «Miembros»)
--
-- Sigue sin poder CREAR cuentas de acceso (auth.users) desde el navegador —
-- eso exige la service_role key, que no tiene sitio seguro sin un backend
-- propio; se hace desde el dashboard de Supabase (Authentication → Users).
-- Lo que SÍ se puede hacer con seguridad desde la app es decidir quién de
-- las cuentas YA existentes entra a qué organización y con qué rol: eso lo
-- cubren estas dos funciones.
-- =============================================================================

-- Lista los miembros de una organización con su email (auth.users no es
-- consultable directamente desde el cliente — de ahí SECURITY DEFINER).
-- Cualquier miembro puede ver el resto del equipo (igual que ya permite la
-- política de SELECT sobre `memberships`); aquí solo se añade el email.
create or replace function scormeditor.list_members(p_org_id uuid)
returns table (user_id uuid, email text, role text, created_at timestamptz)
language plpgsql security definer set search_path = '' stable as $$
begin
  if not scormeditor.is_org_member(p_org_id) then
    raise exception 'No perteneces a esta organización.';
  end if;
  return query
    select m.user_id, u.email::text, m.role, m.created_at
    from scormeditor.memberships m
    join auth.users u on u.id = m.user_id
    where m.org_id = p_org_id
    order by m.created_at;
end;
$$;

-- Añade (o cambia de rol) a alguien que YA tiene cuenta, por email. Si el
-- correo no existe todavía en auth.users, falla con un mensaje accionable
-- en vez de crear la cuenta al vuelo (eso sería la puerta de autorregistro
-- que se cerró en signInWithMagicLink con shouldCreateUser: false).
create or replace function scormeditor.invite_member(p_org_id uuid, p_email text, p_role text default 'editor')
returns void
language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid;
begin
  if scormeditor.org_role(p_org_id) is distinct from 'owner' then
    raise exception 'Solo el owner de la organización puede añadir miembros.';
  end if;
  if p_role not in ('owner', 'editor', 'viewer') then
    raise exception 'Rol no válido: %', p_role;
  end if;

  select id into v_user_id from auth.users where lower(email) = lower(p_email);
  if v_user_id is null then
    raise exception 'No existe ninguna cuenta con el correo %. Créala primero en Supabase (Authentication → Users → Add user) y vuelve a intentarlo.', p_email;
  end if;

  insert into scormeditor.memberships (user_id, org_id, role)
  values (v_user_id, p_org_id, p_role)
  on conflict (user_id, org_id) do update set role = excluded.role;
end;
$$;

grant execute on function scormeditor.list_members(uuid) to authenticated;
grant execute on function scormeditor.invite_member(uuid, text, text) to authenticated;
