import { create } from 'zustand'

/**
 * Diálogo de confirmación promisificado. Sustituye a `window.confirm` por un modal
 * propio y bonito: `const ok = await confirmDialog({ ... })`. El modal se renderiza
 * una sola vez en `App` (`ConfirmModal`).
 */
export interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  /** Aviso solo-informativo: oculta el botón Cancelar (queda solo «Aceptar»). */
  hideCancel?: boolean
}

interface ConfirmStore {
  current: (ConfirmOptions & { id: number }) | null
  resolver: ((v: boolean) => void) | null
  request: (opts: ConfirmOptions) => Promise<boolean>
  resolve: (v: boolean) => void
}

let counter = 0

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  current: null,
  resolver: null,
  request: (opts) =>
    new Promise<boolean>((resolve) => {
      // Si hubiera otro pendiente, se cancela (resuelve false).
      const prev = get().resolver
      if (prev) prev(false)
      set({ current: { ...opts, id: ++counter }, resolver: resolve })
    }),
  resolve: (v) => {
    const r = get().resolver
    set({ current: null, resolver: null })
    if (r) r(v)
  },
}))

export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().request(opts)
}
