-- =============================================================================
-- SCORMEditor · arregla Realtime: "invalid column for filter document_id".
--
-- Causa: Postgres Changes de Supabase Realtime solo permite filtrar
-- (`filter: document_id=eq.<uuid>`, ver src/cloud/watch.ts) por una columna
-- que forme parte de la REPLICA IDENTITY de la tabla (por defecto, su clave
-- primaria). La PK de `document_versions` es solo `id` — `document_id` no
-- forma parte de ella, así que esa suscripción se rechazaba desde el
-- principio. No es un problema de hoy: es el motivo real (ahora confirmado
-- por el log de Realtime) de que el aviso de «hay una versión más reciente»
-- nunca llegara al instante y dependiera siempre del respaldo por sondeo del
-- latido (hasta 25s) añadido en `src/cloud/watch.ts`.
--
-- `document_locks` no debería tener este problema (su PK es
-- `(document_id, scope, scope_ref)`, así que `document_id` SÍ es parte de su
-- replica identity por defecto) — se incluye igualmente por seguridad/
-- consistencia, coste insignificante.
--
-- FULL es seguro en ambas tablas: `document_versions` es inmutable (nunca
-- se actualiza, solo se inserta o se purga en firme) y `document_locks`
-- tiene poquísimas filas (una por documento) — el coste extra en el WAL de
-- incluir la fila completa en cada cambio es despreciable aquí.
-- =============================================================================

alter table scormeditor.document_versions replica identity full;
alter table scormeditor.document_locks replica identity full;
