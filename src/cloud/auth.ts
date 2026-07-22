import type { Session } from '@supabase/supabase-js'
import { getSupabase } from './client'

/**
 * Envía el enlace mágico al correo. `shouldCreateUser: false` es la
 * restricción real de acceso: SIN ella, cualquiera que llegara al editor
 * podría registrarse solo (Supabase Auth crea la cuenta al vuelo si el
 * correo no existía). Con ella, solo entra quien ya tenga cuenta — que se da
 * de alta desde el dashboard de Supabase, Authentication → Users → «Invite
 * user», nunca desde el propio editor. No se toca ningún interruptor global
 * de Supabase Auth (ese proyecto es compartido con el CRM de academyhub;
 * esto queda acotado a esta llamada, no afecta a su login).
 */
export async function signInWithMagicLink(email: string): Promise<{ error?: string }> {
  const supabase = await getSupabase()
  if (!supabase) return { error: 'La nube no está configurada en este editor.' }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin, shouldCreateUser: false },
  })
  return error ? { error: error.message } : {}
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabase()
  await supabase?.auth.signOut()
}

export async function getSession(): Promise<Session | null> {
  const supabase = await getSupabase()
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

/** Se suscribe a cambios de sesión (login/logout/refresco de token). Devuelve función para desuscribirse. */
export async function onAuthChange(cb: (session: Session | null) => void): Promise<() => void> {
  const supabase = await getSupabase()
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session))
  return () => data.subscription.unsubscribe()
}
