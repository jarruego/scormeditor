-- =============================================================================
-- SCORMEditor · avisos casi en tiempo real + bloqueo blando de edición.
--
-- Elegido Realtime (Postgres Changes) en vez de sondeo periódico a propósito:
-- una única conexión persistente por pestaña que solo habla cuando algo
-- cambia de verdad, en vez de peticiones HTTP repetidas cada N segundos
-- venga o no venga a cuento — gasta menos cuota de Supabase, no solo se
-- "siente" mejor. No toca Vercel (la app sigue siendo estática).
--
-- El bloqueo reutiliza `document_locks` (ya existía desde la primera
-- migración, sin usar todavía): scope='structural' representa "todo el
-- documento", porque hoy no hay edición granular por pantalla (esa es la
-- Fase 4 del análisis de arquitectura, más adelante si hace falta). Es
-- deliberadamente BLANDO — informa de quién lo tiene abierto, no bloquea
-- por la fuerza: para un equipo pequeño y de confianza, avisar es más útil
-- que impedir, y el modelo de versiones inmutables ya evita perder trabajo.
-- =============================================================================

-- Resuelve el email de quien tiene un bloqueo activo (auth.users no es
-- consultable directamente desde el cliente — mismo motivo que list_members).
create or replace function scormeditor.get_document_lock(
  p_document_id uuid, p_scope text default 'structural', p_scope_ref text default ''
)
returns table (holder_id uuid, holder_email text, expires_at timestamptz)
language plpgsql security definer set search_path = '' stable as $$
begin
  if not scormeditor.is_org_member(scormeditor.document_org(p_document_id)) then
    raise exception 'No perteneces a esta organización.';
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

grant execute on function scormeditor.get_document_lock(uuid, text, text) to authenticated;

-- Publicación de Realtime: sin esto, `postgres_changes` no recibe nada
-- aunque las políticas RLS ya lo permitieran. RLS sigue aplicando por
-- encima (cada cliente solo recibe los cambios de las filas que ya podría
-- leer igualmente vía SELECT).
alter publication supabase_realtime add table scormeditor.document_versions;
alter publication supabase_realtime add table scormeditor.document_locks;
