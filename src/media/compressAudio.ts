import { Mp3Encoder } from '@breezystack/lamejs'

export interface CompressAudioOptions {
  /** Bitrate de salida (constante), en kbps. Pensado para VOZ hablada, no
   *  música — 64 kbps mono es prácticamente indistinguible del original para
   *  locución; bajar a 48/32 comprime más a cambio de algo de aspereza. */
  kbps: number
}

// Tamaño de bloque recomendado por lamejs (una trama MP3 = 1152 muestras).
const BLOCK_SIZE = 1152

function float32ToInt16(input: Float32Array): Int16Array {
  const out = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return out
}

/** Mezcla a mono promediando canales (la locución generada por TTS ya suele
 *  ser mono de origen; esto cubre el caso de un audio subido a mano en
 *  estéreo). La locución no se beneficia de estéreo, así que mono siempre. */
function toMonoInt16(buffer: AudioBuffer): Int16Array {
  const len = buffer.length
  const mono = new Float32Array(len)
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < len; i++) mono[i] += data[i] / buffer.numberOfChannels
  }
  return float32ToInt16(mono)
}

/**
 * Recomprime un audio (cualquier formato que el navegador sepa decodificar:
 * mp3, wav, aac, opus, flac…) a MP3 mono a un bitrate bajo. El navegador sabe
 * REPRODUCIR mp3 de serie pero no CODIFICARLO — de ahí el codificador en JS
 * puro (`@breezystack/lamejs`, sin dependencias propias), la única vía para
 * hacer esto enteramente en el cliente, sin backend.
 *
 * Pensado específicamente para locución (voz hablada): la pérdida de un
 * bitrate bajo apenas se nota en voz y sí mucho en música, así que esto NO es
 * un compresor de audio de propósito general.
 */
export async function compressToMp3(blob: Blob, opts: CompressAudioOptions): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer()
  const AudioCtxCtor = window.AudioContext
    || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtxCtor) throw new Error('Este navegador no soporta Web Audio API.')
  const ctx = new AudioCtxCtor()
  try {
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
    const samples = toMonoInt16(audioBuffer)
    const encoder = new Mp3Encoder(1, audioBuffer.sampleRate, opts.kbps)
    const chunks: Uint8Array[] = []
    for (let i = 0; i < samples.length; i += BLOCK_SIZE) {
      const block = samples.subarray(i, i + BLOCK_SIZE)
      const enc = encoder.encodeBuffer(block)
      if (enc.length) chunks.push(enc)
    }
    const end = encoder.flush()
    if (end.length) chunks.push(end)
    return new Blob(chunks as BlobPart[], { type: 'audio/mpeg' })
  } finally {
    void ctx.close()
  }
}
