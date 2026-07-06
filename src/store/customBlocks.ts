/**
 * Presets de "Bloque personalizado" (título + icono + color) que el usuario crea
 * en el editor. Se guardan en localStorage para reutilizarlos entre sesiones; no
 * forman parte del course.json (cada bloque se exporta ya resuelto en el texto).
 */
export type CustomBlockPreset = { id: string; title: string; icon: string; color: string }

const KEY = 'scormeditor.customBlocks'

/** Paleta corporativa de teleformación (referencia para los selectores). */
export const PALETTE: { value: string; label: string }[] = [
  { value: '#6DC3C0', label: 'Turquesa' },
  { value: '#F4C910', label: 'Naranja' },
  { value: '#F4D6D2', label: 'Rosa' },
  { value: '#7787BF', label: 'Violeta' },
]

export function loadPresets(): CustomBlockPreset[] {
  try {
    const raw = localStorage.getItem(KEY)
    const arr = raw ? JSON.parse(raw) : []
    // Un preset vale si tiene color y algo que lo etiquete (título o icono).
    return Array.isArray(arr) ? arr.filter((p) => p && p.color && (p.title || p.icon)) : []
  } catch {
    return []
  }
}

export function savePresets(presets: CustomBlockPreset[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(presets))
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
}
