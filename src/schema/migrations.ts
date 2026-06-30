import { SCHEMA_VERSION } from './course.schema'

/**
 * Migraciones de schema. Cada función transforma un objeto crudo de una
 * versión a la inmediatamente superior. migrate() las encadena hasta llegar
 * a SCHEMA_VERSION antes de validar con Zod.
 *
 * Para añadir una versión nueva:
 *  1. Sube SCHEMA_VERSION en course.schema.ts
 *  2. Añade aquí { from: 'x.y.z', to: 'a.b.c', up: (raw) => raw }
 */
type Migration = { from: string; to: string; up: (raw: any) => any }

const migrations: Migration[] = [
  // Ejemplo de futura migración:
  // { from: '1.0.0', to: '1.1.0', up: (raw) => ({ ...raw, schema_version: '1.1.0' }) },
]

export function migrate(raw: any): any {
  if (raw == null || typeof raw !== 'object') return raw
  let current = { ...raw }
  let version: string = current.schema_version ?? '1.0.0'
  // eslint-disable-next-line no-constant-condition
  while (version !== SCHEMA_VERSION) {
    const m = migrations.find((x) => x.from === version)
    if (!m) break // No hay ruta: dejamos que Zod valide y reporte
    current = m.up(current)
    version = m.to
    current.schema_version = version
  }
  return current
}
