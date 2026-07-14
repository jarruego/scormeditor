/**
 * Tipos internos del exportador `.elpx` (no salen del módulo).
 *
 * El editor y eXeLearning modelan el contenido distinto; estas estructuras son
 * la representación intermedia que producimos y que luego se serializa a
 * `content.xml`.
 */
import type { Interaction } from '../../schema/course.schema'

/** Un iDevice ya convertido, listo para incrustarse en un bloque. */
export type ElpxComponent = {
  /** `odeIdeviceTypeName` de eXe (p. ej. `text`, `word-search`, `trueorfalse`). */
  typeName: string
  /** HTML renderizado (con su `*-DataGame` si es un juego). */
  htmlView: string
  /** Estado editable en JSON (string ya serializado). Puede ir vacío. */
  jsonProperties: string
}

/** Contexto que el orquestador entrega a cada conversor de interacción. */
export type ConvertCtx = {
  /**
   * Registra un asset del editor (`assets/img/x.png`) para copiarlo al `.elpx`
   * y devuelve su referencia (`{{context_path}}/x.png`). Devuelve '' si no hay
   * ruta. Deduplica por ruta de origen.
   */
  resolveAsset: (src: string) => string
  /** Id determinista estilo eXe a partir de una semilla estable. */
  newId: (seed: string) => string
  /** Anota una transformación o pérdida para el resumen final. */
  note: (msg: string) => void
}

/** Firma de un conversor de interacción → iDevice. */
export type InteractionConverter = (it: Interaction, ctx: ConvertCtx) => ElpxComponent

/** Resumen de una exportación, para el diálogo previo y el registro. */
export type ExportSummary = {
  pages: number
  components: number
  /** type de interacción → nombre de iDevice destino (o 'text' si degrada). */
  mapped: Record<string, string>
  /** Avisos: reconversiones con pérdida, tipos degradados, etc. */
  notes: string[]
}
