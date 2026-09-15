/**
 * Aviso de «proyecto abierto en otra pestaña»: el autoguardado (`autosave.ts`)
 * persiste en IndexedDB por origen sin coordinación entre pestañas — si hay
 * dos abiertas, la última en autoguardar (aunque sea la más vieja en memoria)
 * puede pisar los cambios de la otra. Esto solo avisa (a diferencia del
 * bloqueo de nube en `cloud/locks.ts`, que sí impide editar): el usuario
 * decide si cierra la pestaña sobrante.
 *
 * Cada pestaña emite un "ping" periódico por `BroadcastChannel` con un id
 * aleatorio propio; si se oye el ping de otro id, hay otra pestaña abierta.
 * Sin heartbeat con expiración (`STALE_MS`) el aviso se quedaría fijo tras
 * cerrar la otra pestaña, ya que no hay evento de "cierre" fiable (el
 * `beforeunload` no siempre llega a disparar el postMessage a tiempo).
 */

const CHANNEL_NAME = 'scormeditor-tabs'
const PING_INTERVAL_MS = 4000
const STALE_MS = 10000

export function initTabSync(onChange: (otherTabOpen: boolean) => void): () => void {
  if (typeof BroadcastChannel === 'undefined') return () => {}

  const tabId = Math.random().toString(36).slice(2)
  const channel = new BroadcastChannel(CHANNEL_NAME)
  const seen = new Map<string, number>()

  function report() {
    const now = Date.now()
    for (const [id, last] of seen) {
      if (now - last > STALE_MS) seen.delete(id)
    }
    onChange(seen.size > 0)
  }

  channel.onmessage = (e: MessageEvent<{ type: 'ping'; id: string }>) => {
    if (e.data?.type === 'ping' && e.data.id !== tabId) {
      seen.set(e.data.id, Date.now())
      report()
    }
  }

  function ping() {
    channel.postMessage({ type: 'ping', id: tabId })
  }
  ping()
  const interval = setInterval(() => {
    ping()
    report()
  }, PING_INTERVAL_MS)

  return () => {
    clearInterval(interval)
    channel.close()
  }
}
