import { useCourseStore } from '../store/courseStore'
import { useCloudSessionStore } from './session'
import { getSupabase, CLOUD_SCHEMA } from './client'
import { getLatestVersion } from './documents'
import { acquireDocumentLock, releaseDocumentLock, getDocumentLock } from './locks'
import { confirmDialog } from '../store/confirm'

/**
 * Sigue el documento-nube vinculado (`courseStore.cloudDocumentId`) mientras
 * esté abierto: avisa casi al instante si alguien sube una versión nueva
 * (Realtime sobre `document_versions`, no sondeo — una sola conexión que
 * solo habla cuando cambia algo de verdad) y mantiene un bloqueo blando
 * («structural», ver la migración) para que el resto del equipo sepa que lo
 * tienes abierto. Blando a propósito: informa, no impide — el modelo de
 * versiones inmutables ya evita perder trabajo si dos personas suben a la vez.
 */

// Latido bien por debajo del TTL (60s) del RPC de bloqueo: si el latido
// falla un par de ciclos seguidos (pestaña en background, red caída), el
// bloqueo caduca solo — no hace falta liberarlo a mano para que se cure.
const HEARTBEAT_MS = 25_000

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let channel: any = null
let heartbeatTimer: ReturnType<typeof setInterval> | null = null
let staleNotified = false

async function refreshLockPresence(documentId: string) {
  try {
    const lock = await getDocumentLock(documentId)
    const myId = useCloudSessionStore.getState().session?.user.id
    useCourseStore.getState().setCloudLockHolder(lock && lock.holderId !== myId ? lock.holderEmail : null)
  } catch {
    // Fallo puntual comprobando quién lo tiene abierto: no interrumpe la edición.
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
    .subscribe()
}

async function unsubscribeRealtime() {
  if (!channel) return
  const supabase = await getSupabase()
  await supabase?.removeChannel(channel)
  channel = null
}

async function attach(documentId: string) {
  staleNotified = false
  await subscribeRealtime(documentId)
  await refreshStaleness(documentId)
  await refreshLockPresence(documentId)
  await startHeartbeat(documentId)
}

async function detach(documentId: string | null) {
  stopHeartbeat()
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
