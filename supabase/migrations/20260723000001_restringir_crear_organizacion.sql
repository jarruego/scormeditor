-- =============================================================================
-- SCORMEditor · restringe quién puede crear organizaciones nuevas.
--
-- Antes: cualquier cuenta autenticada (ya de por sí solo cuentas dadas de
-- alta a mano por vosotros — ver signInWithMagicLink) podía crear una
-- organización y hacerse owner. Ahora hace falta estar en la lista
-- `scormeditor.org_creators`.
--
-- Gestión de la lista (sin tocar código ni redesplegar nada — solo SQL
-- Editor del dashboard de Supabase):
--   Añadir a alguien:  insert into scormeditor.org_creators (email) values ('nuevo@mecohisa.com');
--   Quitar a alguien:  delete from scormeditor.org_creators where email = 'nuevo@mecohisa.com';
--   Ver quién está:    select * from scormeditor.org_creators;
--
-- Deliberadamente SIN política RLS que la exponga a `authenticated`: nadie
-- puede leerla ni escribirla desde el cliente, solo se consulta por dentro
-- de create_organization() (SECURITY DEFINER) o a mano desde el SQL Editor.
-- =============================================================================

create table scormeditor.org_creators (
  email text primary key
);

alter table scormeditor.org_creators enable row level security;
-- Sin "grant" a authenticated y sin políticas: acceso cero desde el cliente.

insert into scormeditor.org_creators (email) values ('jarruego@mecohisa.com');

create or replace function scormeditor.create_organization(p_name text, p_slug text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_org_id uuid;
  v_email text;
begin
  select email into v_email from auth.users where id = auth.uid();
  if v_email is null or not exists (select 1 from scormeditor.org_creators where email = v_email) then
    raise exception 'No tienes permiso para crear organizaciones. Pide a quien administre SCORMEditor que te añada a la lista.';
  end if;

  insert into scormeditor.organizations (name, slug) values (p_name, p_slug)
  returning id into v_org_id;

  insert into scormeditor.memberships (user_id, org_id, role)
  values (auth.uid(), v_org_id, 'owner');

  return v_org_id;
end;
$$;
