import { useCourseStore } from '../store/courseStore'
import { useCloudSessionStore } from './session'
import { getSupabase, CLOUD_SCHEMA } from './client'
import { getLatestVersion } from './documents'
import { acquireDocumentLock, releaseDocumentLock, getDocumentLock } from './locks'
import { saveCurrentProject } from './sync'
import { listMyRoles } from './members'
import { confirmDialog } from '../store/confirm'

/**
 * Sigue el documento-nube vinculado (`courseStore.cloudDocumentId`) mientras
 * esté abierto: avisa si alguien sube una versión nueva o cambia quién tiene
 * el bloqueo de edición («structural», ver las migraciones), y mantiene ese
 * bloqueo para que solo una persona edite las diapositivas a la vez. El
 * bloqueo es ESTRICTO en el cliente (App.tsx pone en solo lectura el
 * árbol/editor mientras `cloudLockHolderEmail` diga que lo tiene otro) pero
 * sin ceremonia de servidor: cualquier editor puede «tomar el control» cuando
 * quiera (`forceTakeDocumentLock`).
 *
 * Doble vía de aviso, no solo Realtime: Realtime sobre `document_versions`/
 * `document_locks` es la vía rápida (casi al instante) cuando el canal está
 * sano, pero cada latido del bloqueo (cada 25s, ya es una conexión que se
 * abre igualmente) hace también de respaldo por sondeo — así, si Realtime
 * fallara en silencio (canal caído, RLS que no deja pasar el evento…),
 * cualquier cliente converge solo en ≤25s en vez de quedarse esperando un
 * aviso que nunca llega hasta que alguien recarga la página.
 */

// Latido bien por debajo del TTL (60s) del RPC de bloqueo: si el latido
// falla un par de ciclos seguidos (pestaña en background, red caída), el
// bloqueo caduca solo — no hace falta liberarlo a mano para que se cure.
const HEARTBEAT_MS = 25_000

// Debounce del auto-sync a la nube: sube sola tras unos minutos SIN cambios
// nuevos (no cada X tiempo mientras editas sin parar) — mismo patrón que el
// autoguardado local (`scheduleSave` en autosave.ts), solo que con una espera
// mucho mayor porque aquí cada subida es un ZIP completo a Storage, no una
// escritura local gratis (ver conversación: coste de Supabase Storage si se
// subiera en cada cambio).
const AUTOSYNC_DEBOUNCE_MS = 2 * 60_000

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let channel: any = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let staleNotified = false
let autoSyncTimer: ReturnType<typeof setTimeout> | null = null
let autoSyncUnsub: (() => void) | null = null
// Distingue «primera comprobación tras abrir» (nunca hubo control que perder,
// aunque otro ya lo tuviera) de una transición real «lo tenía yo → me lo han
// quitado» — sin esto, abrir un documento ya bloqueado por otra persona
// mostraría por error el aviso de «te han apartado». Se reinicia en `attach`.
let lockBaselineSet = false

async function refreshLockPresence(documentId: string) {
  try {
    const lock = await getDocumentLock(documentId)
    const myId = useCloudSessionStore.getState().session?.user.id
    const otherEmail = lock && lock.holderId !== myId ? lock.holderEmail : null
    const hadControl = lockBaselineSet && useCourseStore.getState().cloudLockHolderEmail === null
    useCourseStore.getState().setCloudLockHolder(otherEmail)
    lockBaselineSet = true
    // Transición «lo tenía yo → ahora lo tiene otro»: alguien ha pulsado
    // «Tomar el control» sobre mi bloqueo todavía vivo. Se avisa con un
    // modal (no basta con que la pastilla/banda cambien en silencio — a
    // media edición conviene que sea imposible no darse cuenta) y se quita
    // el foco de cualquier campo, para que la solo-lectura que va a aparecer
    // no deje un input editable a medio escribir.
    if (hadControl && otherEmail) {
      ;(document.activeElement as HTMLElement | null)?.blur?.()
      await confirmDialog({
        title: 'Has perdido el control de este documento',
        message: `${otherEmail} ha tomado el control. Ahora ves las diapositivas en solo lectura — pulsa «Tomar el control» cuando quieras recuperarlo. Tus cambios de este navegador no se han perdido.`,
        confirmLabel: 'Entendido',
        hideCancel: true,
      })
    }
  } catch {
    // Fallo puntual comprobando quién lo tiene abierto: no interrumpe la edición.
  }
}

/** Tu rol en `cloudOrgId` — determina si puedes «tomar el control» (solo
 *  'owner'/'editor'; ver la comprobación equivalente en el RPC
 *  `force_take_document_lock`, que es la que de verdad hace cumplir esto). */
async function refreshMyRole() {
  try {
    const orgId = useCourseStore.getState().cloudOrgId
    if (!orgId) return
    const roles = await listMyRoles()
    useCourseStore.getState().setCloudMyRole(roles[orgId] ?? null)
  } catch {
    // Fallo puntual: se reintenta en el próximo `attach` (abrir/recargar el documento).
  }
}

async function refreshStaleness(documentId: string) {
  try {
    const latest = await getLatestVersion(documentId)
    const { cloudVersionId } = useCourseStore.getState()
    const stale = !!latest && latest.id !== cloudVersionId
    useCourseStore.getState().setCloudStale(stale)
    if (stale && !staleNotified) {
      staleNotified = true
      await confirmDialog({
        title: 'Hay una versión más reciente en la nube',
        message: 'Alguien ha subido cambios de este proyecto después de tu última sincronización. Ábrelo desde ☁ Nube (botón «Descargar la última versión») cuando quieras traerlos — tus cambios locales no se tocan hasta entonces.',
        confirmLabel: 'Entendido',
        hideCancel: true,
      })
    } else if (!stale) {
      staleNotified = false
    }
  } catch {
    // Fallo puntual comprobando versión: se reintenta en el próximo evento.
  }
}

async function startHeartbeat(documentId: string) {
  stopHeartbeat()
  const tick = async () => {
    if (document.visibilityState !== 'visible') return // pestaña en segundo plano: no renueva, se deja caducar
    try {
      await acquireDocumentLock(documentId)
    } catch {
      // red intermitente: se reintenta en el siguiente latido, sin avisar
    }
    // Respaldo de sondeo sobre el mismo latido (no una conexión nueva): si
    // Realtime no ha entregado el evento — canal caído en silencio, RLS que
    // no deja pasar el postgres_changes, lo que sea — esto garantiza que en
    // ≤25s cualquier cliente se entera igual de un «tomar el control» o de
    // una versión nueva, sin depender solo de Realtime para converger.
    await refreshLockPresence(documentId)
    await refreshStaleness(documentId)
  }
  await tick()
  heartbeatTimer = setInterval(() => void tick(), HEARTBEAT_MS)
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

async function runAutoSync(documentId: string) {
  const { cloudDocumentId, projectDirty, cloudStale } = useCourseStore.getState()
  // Puede haber cambiado (o desvinculado) el documento mientras esperábamos,
  // o haber quedado obsoleto (cloudStale): en ese caso no se auto-sube — se
  // deja en manos del usuario resolverlo desde ☁ Nube, no se le insiste solo
  // cada dos minutos con el mismo modal.
  if (cloudDocumentId !== documentId || !projectDirty || cloudStale) return
  await saveCurrentProject()
}

function scheduleAutoSync(documentId: string) {
  if (autoSyncTimer) clearTimeout(autoSyncTimer)
  autoSyncTimer = setTimeout(() => void runAutoSync(documentId), AUTOSYNC_DEBOUNCE_MS)
}

function startAutoSync(documentId: string) {
  stopAutoSync()
  autoSyncUnsub = useCourseStore.subscribe((state, prev) => {
    if (state.course !== prev.course || state.assets !== prev.assets) scheduleAutoSync(documentId)
  })
}

function stopAutoSync() {
  if (autoSyncTimer) {
    clearTimeout(autoSyncTimer)
    autoSyncTimer = null
  }
  autoSyncUnsub?.()
  autoSyncUnsub = null
}

async function subscribeRealtime(documentId: string) {
  const supabase = await getSupabase()
  if (!supabase) return
  channel = supabase
    .channel(`doc:${documentId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: CLOUD_SCHEMA, table: 'document_versions', filter: `document_id=eq.${documentId}` },
      () => void refreshStaleness(documentId),
    )
    .on(
      'postgres_changes',
      { event: '*', schema: CLOUD_SCHEMA, table: 'document_locks', filter: `document_id=eq.${documentId}` },
      () => void refreshLockPresence(documentId),
    )
    .subscribe((status, err) => {
      // Si el canal falla (error/timeout), no queda constancia en ningún
      // sitio por defecto: el latido (arriba) sigue haciendo de respaldo,
      // pero esto deja rastro en consola para poder diagnosticarlo.
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('[cloud/watch] Realtime no disponible, usando solo el respaldo por latido (25s):', status, err)
      }
    })
}

async function unsubscribeRealtime() {
  if (!channel) return
  const supabase = await getSupabase()
  await supabase?.removeChannel(channel)
  channel = null
}

async function attach(documentId: string) {
  staleNotified = false
  lockBaselineSet = false
  await subscribeRealtime(documentId)
  await refreshMyRole()
  await refreshStaleness(documentId)
  await refreshLockPresence(documentId)
  await startHeartbeat(documentId)
  startAutoSync(documentId)
}

async function detach(documentId: string | null) {
  stopHeartbeat()
  stopAutoSync()
  await unsubscribeRealtime()
  if (documentId) {
    try {
      await releaseDocumentLock(documentId)
    } catch {
      // best-effort: si falla, el TTL de 60s lo libera solo
    }
  }
  useCourseStore.getState().setCloudStale(false)
  useCourseStore.getState().setCloudLockHolder(null)
  useCourseStore.getState().setCloudMyRole(null)
}

let started = false

/** Arranca el seguimiento del vínculo de nube. Llamar una vez (App.tsx). */
export function startCloudWatch() {
  if (started) return
  started = true

  useCourseStore.subscribe((state, prev) => {
    if (state.cloudDocumentId === prev.cloudDocumentId) return
    const previous = prev.cloudDocumentId
    const next = state.cloudDocumentId
    void (async () => {
      if (previous) await detach(previous)
      if (next) await attach(next)
    })()
  })

  // La app puede arrancar ya con un documento vinculado (restaurado de IndexedDB).
  const initial = useCourseStore.getState().cloudDocumentId
  if (initial) void attach(initial)
}
