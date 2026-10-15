import type { TtsConfig } from './tts'

/**
 * Estimación ORIENTATIVA del coste de generar la narración, antes de lanzarla.
 *
 * Se parte de los caracteres que se van a enviar (lo único que se sabe con
 * certeza de antemano) y de las tarifas públicas de cada proveedor, que cambian
 * con el tiempo: están juntas en `TARIFAS` para actualizarlas en un solo sitio.
 * Los proveedores que cobran por AUDIO generado (OpenAI gpt-4o-mini-tts, Gemini)
 * se estiman por minutos, a partir de una velocidad media de locución en
 * español; ElevenLabs y los modelos heredados de OpenAI cobran por carácter.
 */

/** Fecha de referencia de las tarifas (para que el panel avise de su antigüedad). */
export const TARIFAS_FECHA = 'junio de 2026'

/** Caracteres por minuto de locución en español a velocidad 1 (≈150 palabras/min). */
const CHARS_POR_MINUTO = 900

type Tarifa =
  | { tipo: 'minuto'; usdPorMinuto: number; usdPorMTokensTexto: number }
  | { tipo: 'caracter'; usdPorMChars: number }
  | { tipo: 'creditos'; creditosPorChar: number }

const TARIFAS: Record<string, Tarifa> = {
  // OpenAI: texto de entrada + audio de salida (~0,015 $/min según OpenAI).
  'openai:gpt-4o-mini-tts': { tipo: 'minuto', usdPorMinuto: 0.015, usdPorMTokensTexto: 0.6 },
  'openai:tts-1': { tipo: 'caracter', usdPorMChars: 15 },
  'openai:tts-1-hd': { tipo: 'caracter', usdPorMChars: 30 },
  // Gemini (capa de pago; la gratuita no cobra pero limita peticiones/día):
  // 25 tokens de audio por segundo → 1.500/min.
  'gemini:gemini-2.5-flash-preview-tts': { tipo: 'minuto', usdPorMinuto: 1500 * 10 / 1e6, usdPorMTokensTexto: 0.5 },
  'gemini:gemini-2.5-pro-preview-tts': { tipo: 'minuto', usdPorMinuto: 1500 * 20 / 1e6, usdPorMTokensTexto: 1 },
  // ElevenLabs: créditos de la suscripción por carácter (flash/turbo, la mitad).
  'elevenlabs:eleven_multilingual_v2': { tipo: 'creditos', creditosPorChar: 1 },
  'elevenlabs:eleven_v3': { tipo: 'creditos', creditosPorChar: 1 },
  'elevenlabs:eleven_turbo_v2_5': { tipo: 'creditos', creditosPorChar: 0.5 },
  'elevenlabs:eleven_flash_v2_5': { tipo: 'creditos', creditosPorChar: 0.5 },
}

/** Precio por defecto de 1.000 créditos de ElevenLabs (plan Creator: 22 $ / 100.000). */
export const EL_USD_POR_MIL_CREDITOS = 0.22

export interface EstimacionCoste {
  chars: number
  /** Minutos de audio aproximados. */
  minutos: number
  /** Coste en dólares (null si el modelo no tiene tarifa conocida). */
  usd: number | null
  /** Créditos de ElevenLabs que consumirá (solo ese proveedor). */
  creditos?: number
  /** Gemini: dentro de la capa gratuita no se cobra. */
  gratisPosible?: boolean
}

export function estimarCoste(cfg: Pick<TtsConfig, 'provider' | 'model' | 'speed'>, chars: number, usdPorMilCreditos = EL_USD_POR_MIL_CREDITOS): EstimacionCoste {
  const velocidad = cfg.provider === 'gemini' ? 1 : Math.max(0.25, cfg.speed || 1)
  const minutos = chars / CHARS_POR_MINUTO / velocidad
  const t = TARIFAS[`${cfg.provider}:${cfg.model}`]
  if (!t) return { chars, minutos, usd: null }
  if (t.tipo === 'caracter') return { chars, minutos, usd: (chars / 1e6) * t.usdPorMChars }
  if (t.tipo === 'creditos') {
    const creditos = Math.ceil(chars * t.creditosPorChar)
    return { chars, minutos, usd: (creditos / 1000) * usdPorMilCreditos, creditos }
  }
  const tokensTexto = chars / 4
  return {
    chars,
    minutos,
    usd: minutos * t.usdPorMinuto + (tokensTexto / 1e6) * t.usdPorMTokensTexto,
    gratisPosible: cfg.provider === 'gemini',
  }
}

/** «0,42 $», con al menos un céntimo visible y separador decimal español. */
export function formatoUsd(usd: number): string {
  if (usd > 0 && usd < 0.01) return '< 0,01 $'
  return `${usd.toFixed(2).replace('.', ',')} $`
}
