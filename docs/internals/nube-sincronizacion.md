# Nube y sincronización (`src/cloud/`)

> Doc interno de SCORMEditor. Índice en `CLAUDE.md`.

## Invariante de aislamiento: sin nube configurada, cero diferencia
`isCloudConfigured()` (`src/cloud/client.ts`) mira solo si `VITE_SUPABASE_URL`/
`VITE_SUPABASE_ANON_KEY` existen en build-time. `@supabase/supabase-js` se carga con
`import()` dinámico (mismo patrón que `src/interop/elpx/`): sin credenciales, ni el
paquete ni una sola llamada de red entran en juego — el editor es exactamente el mismo
100% local descrito en `persistencia-scormproj.md`. Un documento vive **siempre** en uno
de los dos mundos, nunca los dos (`courseStore.cloudDocumentId` no-nulo = nube;
`linkedFileName` no-nulo = local): `setCloudLink(null, null, null)` y `setLinked(handle)`
se desvincula mutuamente entre ellos.

Un documento-nube es **el mismo ZIP** que un `.scormproj` (`buildProjectBlob`/
`loadProjectFromBlob` de `autosave.ts`, reutilizados tal cual) — solo cambia dónde vive.
Nada del formato de `course.json` sabe que existe la nube.

## Modelo de datos (Supabase, esquema `scormeditor`)
Proyecto Supabase **compartido** con el CRM de academyhub: todo SCORMEditor vive en el
esquema `scormeditor`, nunca en `public` (ese es del CRM). Migraciones en
`supabase/migrations/`, aplicadas **a mano** en el SQL Editor del dashboard — este repo
no tiene el CLI de Supabase enlazado ni ningún pipeline que las despliegue solo. Tras
crear o tocar una migración, hay que pegarla y ejecutarla ahí para que surta efecto (si
no, el cliente ve un 404/PGRST202 al llamar al RPC nuevo).

- `organizations` / `memberships` (`role`: `owner`/`editor`/`viewer`) / `folders` /
  `documents` / `document_versions` / `document_locks`.
- **Versiones inmutables**: cada subida (`uploadVersion`) es un ZIP completo nuevo en
  Storage (bucket `scormeditor-projects`) + una fila en `document_versions`; nunca se
  sobrescribe ni se genera un diff. Se conservan todas — el único borrado es manual y
  en firme (`purgeDocument`, papelera aparte con `documents.deleted_at`). Esta
  inmutabilidad es la razón de que el bloqueo de edición pueda permitirse ser informal
  (ver más abajo): aunque dos personas suban «a la vez», nunca se pierde ningún
  contenido, solo quedan dos versiones en el historial.
- **Auth**: enlace mágico (`signInWithMagicLink`, `shouldCreateUser: false`) — la
  restricción real de acceso es esa (`false`): sin ella, Supabase Auth crearía la cuenta
  al vuelo. Las cuentas se dan de alta a mano desde el dashboard (Authentication → Users
  → «Invite user»), nunca desde el editor.
- **Crear organizaciones**: restringido a una lista aparte,
  `scormeditor.org_creators` (migración `20260723000001`), sin RLS que la exponga al
  cliente — se gestiona solo desde el SQL Editor (`insert`/`delete` a mano). Cualquier
  otra cuenta autenticada que llame a `create_organization()` recibe un error explícito.
- **Roles** (`OrgRole` en `src/cloud/types.ts`): `owner` administra la organización
  (invita/expulsa, borra en firme); `owner`/`editor` pueden subir versiones, mover/crear
  carpetas y tomar el control de la edición; `viewer` solo lee. Aplicado por RLS en cada
  tabla — el cliente (`canEdit` en `CloudModal.tsx`, `cloudMyRole` en el store) solo
  oculta acciones que fallarían igualmente en el servidor, nunca es la barrera real.

## Guardado: un único orquestador, dos disparadores
`saveCurrentProject()` (`src/cloud/sync.ts`) es el **único** camino para subir a la
nube — lo llaman por igual Ctrl+S, el indicador `.ed-docstate` de la Toolbar, el menú
Archivo y el auto-sync. Mirar `cloudDocumentId`/`cloudOrgId` le basta para saber qué
sistema manda; si el documento está `cloudStale` (ver debajo) no sube a ciegas, abre
☁ Nube para decidir con conocimiento de causa.

- **Manual**: el de siempre — Ctrl+S o clic en la pastilla.
- **Automático con debounce de inactividad** (`src/cloud/watch.ts`,
  `AUTOSYNC_DEBOUNCE_MS = 2 min`): cada cambio en `course`/`assets` reinicia un
  temporizador; al expirar sin más cambios, sube sola. Deliberadamente por
  **inactividad**, no por intervalo fijo mientras editas sin parar: cada subida es un
  ZIP completo a Storage (no un diff), así que auto-subir en cada pulsación multiplicaría
  el consumo de Storage y llenaría el historial de versiones de ruido en vez de
  checkpoints con sentido. Se salta la subida si mientras tanto quedó `cloudStale` o se
  desvinculó el documento.
- El indicador «Subiendo…» de la Toolbar usa un flag **global** (`courseStore.cloudSyncing`,
  no local al componente) precisamente para que se refleje igual si lo dispara el propio
  auto-sync en segundo plano.

## Detectar que hay una versión más reciente (`cloudStale`)
`courseStore.cloudVersionId` guarda el id de `document_versions` que corresponde al
contenido cargado. `cloudStale` es `true` cuando la última versión en la nube no
coincide con ese id (subida por cualquiera, incluido tú mismo desde otra pestaña).
Aviso una sola vez por transición (`staleNotified`, evita repetir el modal en cada
comprobación) con un `confirmDialog` que manda a ☁ Nube → «Descargar la última versión»
(`onPullLatest`, `CloudModal.tsx`) — el único sitio, junto con la subida inicial
(`onUploadNew`) y `saveCurrentProject`, que debe llamar a `setCloudVersion(id)`. **Bug ya
sufrido**: olvidar esa llamada deja `cloudVersionId` en `null` para siempre → falso
«hay una versión más reciente» en cada recarga, sin converger nunca.

Doble vía de detección, no solo Realtime: Realtime sobre `document_versions` (evento
`INSERT`) es la vía rápida, pero el latido del bloqueo (cada 25s, ver debajo) también
repite la comprobación como respaldo por sondeo — si Realtime fallara en silencio (canal
caído, RLS que no deja pasar el evento…), cualquier cliente converge solo en ≤25s en vez
de quedarse esperando un aviso que nunca llega. Si el canal de Realtime falla de verdad
(`CHANNEL_ERROR`/`TIMED_OUT`), queda un `console.error` para poder diagnosticarlo.

## Bloqueo de edición (`document_locks`, scope `'structural'`)
Un único bloqueo por documento (no hay edición granular por pantalla todavía) con dos
capas:

1. **Blando, de servidor** (`acquireDocumentLock`/`releaseDocumentLock`/
   `getDocumentLock` en `src/cloud/locks.ts`): un latido cada 25s
   (`HEARTBEAT_MS`, bien por debajo del TTL de 60s del RPC) mientras la pestaña está
   visible; en background no renueva y se deja caducar solo — no hace falta liberarlo a
   mano para que se cure. `acquire_document_lock` (RPC) **nunca** roba un bloqueo todavía
   vivo de otra persona, solo renueva el tuyo o toma uno ya caducado.
2. **Estricto, de cliente** (`App.tsx` + `cloudLockHolderEmail` en el store): mientras
   `document_locks` diga que lo tiene otro, el árbol y el editor de pantallas quedan en
   solo lectura (cristal `position:absolute` sobre `.ed-main`, sin tocar su grid; Deshacer/
   Rehacer también bloqueados, botón y atajo). Vista estudiante/Validación/Informe se
   pueden seguir consultando con normalidad — leer no es editar. Cualquier `owner`/`editor`
   puede **«Tomar el control»** (`forceTakeDocumentLock`, RPC `force_take_document_lock`,
   migración `20260723000003`) — esta sí roba un bloqueo vivo. El botón no se ofrece a los
   `viewer` (`cloudMyRole` en el store, ver arriba), aunque la barrera real es el RPC.

Deliberadamente **sin ceremonia de servidor** (sin «solicitar turno», sin cola): para un
equipo pequeño y de confianza, cualquiera con permiso de edición puede tomar el control
cuando quiera, con un aviso previo (`confirmDialog`) antes de actuar. Es seguro porque las
versiones son inmutables — no hay forma de perder trabajo aunque se abuse del botón.

Al desposeído se le avisa con un modal («Has perdido el control…») en el instante en que
se detecta la transición «lo tenía yo → ahora lo tiene otro» (`lockBaselineSet` distingue
esa transición real de la primera comprobación al abrir un documento ya bloqueado, que no
debe disparar el aviso) — mismo canal de Realtime que ya escuchaba `document_locks`, sin
mecanismo aparte de notificación. Se le quita el foco a cualquier campo activo para que la
solo-lectura no deje un input a medio escribir. Quien toma el control ve su propio cambio
al instante por actualización **optimista** del store (no espera a Realtime/latido).

Si el otro cierra la pestaña o dejar de renovar (TTL 60s), el control vuelve solo al
siguiente latido — no hace falta pulsar nada.

## Lista de migraciones (orden cronológico, aplicar a mano en el SQL Editor)
- `20260721000000_esquema_inicial.sql` — todo el esquema base: tablas, RLS, RPCs de
  organización/miembros/bloqueo blando, bucket de Storage.
- `20260722000000_gestion_miembros.sql` — invitar/quitar miembros, cambiar rol.
- `20260723000000_folders_updated_at.sql` — trigger de `updated_at` en `folders`.
- `20260723000001_restringir_crear_organizacion.sql` — tabla `org_creators`.
- `20260723000002_realtime_y_bloqueo.sql` — `get_document_lock` (resuelve email del
  titular) + publicación Realtime sobre `document_versions`/`document_locks`.
- `20260723000003_bloqueo_estricto.sql` — `force_take_document_lock` («tomar el
  control»).
