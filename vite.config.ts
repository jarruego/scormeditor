import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command, mode }) => {
  // ElevenLabs desde el .env (sin prefijo VITE_, así que Vite no lo expone solo):
  // voz y modelo son valores por defecto del proveedor; la CLAVE solo se inyecta
  // con el servidor de desarrollo — nunca acaba en un build publicado. Lo que se
  // configure en Ajustes → Narración tiene siempre prioridad (ver src/tts/tts.ts).
  const env = loadEnv(mode, process.cwd(), 'ELEVENLABS_')
  const elevenlabs = {
    key: command === 'serve' ? (env.ELEVENLABS_API_KEY || '').trim() : '',
    voice: (env.ELEVENLABS_VOICE_ID || '').trim(),
    model: (env.ELEVENLABS_MODEL || '').trim(),
  }
  return {
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    define: { __ELEVENLABS_ENV__: JSON.stringify(elevenlabs) },
  }
})
