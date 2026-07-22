-- =============================================================================
-- SCORMEditor · bloqueo ESTRICTO de edición («tomar el control»).
--
-- El bloqueo blando (migración anterior) ya avisa de quién tiene el documento
-- abierto, pero no impide editar en paralelo. Esta función añade la única
-- pieza que faltaba para hacerlo estricto: robar un bloqueo todavía VIVO (no
-- solo uno caducado, que ya cubre `acquire_document_lock`). El resto del
-- comportamiento estricto vive en el cliente (`src/cloud/watch.ts` +
-- `src/App.tsx`): mientras `document_locks` diga que lo tiene otro, la
-- pantalla de edición queda en solo lectura; el desposeído se entera al
-- instante por el mismo canal de Realtime que ya escuchaba esa tabla, sin
-- nada nuevo que suscribir.
--
-- Deliberadamente sin ceremonia (sin "solicitar turno", sin cola): para un
-- equipo pequeño y de confianza, cualquier editor puede tomar el control
-- cuando quiera, con un aviso previo en el cliente. No hay pérdida de datos
-- posible aunque se abuse del botón — el modelo de versiones inmutables ya
-- garantiza eso.
-- =============================================================================

create or replace function scormeditor.force_take_document_lock(
  p_document_id uuid, p_scope text, p_scope_ref text default '', p_ttl_seconds int default 60
)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if scormeditor.org_role(scormeditor.document_org(p_document_id)) not in ('owner', 'editor') then
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

grant execute on function scormeditor.force_take_document_lock(uuid, text, text, int) to authenticated;
