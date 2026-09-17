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

/** `module_cover`/`scorm_cover` se unifican en `cover`: el diseño (banda
 *  sólida o degradada) ya no lo fija el `type` sino el contenedor donde vive
 *  la pantalla en cada momento (introducción/módulo/unidad) — ver «Portada
 *  unificada» en arquitectura-runtime.md. Muta en sitio: `raw` de esta
 *  iteración ya es una copia de `migrate()`, no el original del llamante. */
function fixCoverType(s: any): any {
  if (s && (s.type === 'module_cover' || s.type === 'scorm_cover')) s.type = 'cover'
  return s
}

const migrations: Migration[] = [
  {
    from: '1.0.0', to: '1.1.0',
    up: (raw) => {
      if (Array.isArray(raw.intro_screens)) raw.intro_screens.forEach(fixCoverType)
      if (Array.isArray(raw.modules)) {
        raw.modules.forEach((m: any) => {
          if (Array.isArray(m?.screens)) m.screens.forEach(fixCoverType)
          if (Array.isArray(m?.units)) {
            m.units.forEach((u: any) => {
              if (Array.isArray(u?.screens)) u.screens.forEach(fixCoverType)
            })
          }
        })
      }
      return raw
    },
  },
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
