import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { getSession, onAuthChange } from './auth'

/**
 * Estado de sesión compartido: una sola suscripción a `onAuthChange` para
 * toda la app (Toolbar la usa para el chip de cuenta, CloudModal para el
 * resto) en vez de que cada componente monte/desmonte la suya. Si la nube no
 * está configurada, `getSession()` resuelve `null` sin tocar la red (ver
 * `src/cloud/client.ts`), así que inicializar esto no tiene coste cuando no
 * se usa la nube.
 */
interface CloudSessionState {
  session: Session | null
  /** true en cuanto se resolvió la comprobación inicial (evita parpadeos «sin sesión» antes de saberlo). */
  checked: boolean
}

export const useCloudSessionStore = create<CloudSessionState>(() => ({ session: null, checked: false }))

let started = false

/** Arranca la comprobación inicial + suscripción. Llamar una vez (en `App.tsx`, junto a `initAutoSave`). */
export async function initCloudSession() {
  if (started) return
  started = true
  const session = await getSession()
  useCloudSessionStore.setState({ session, checked: true })
  await onAuthChange((s) => useCloudSessionStore.setState({ session: s }))
}
