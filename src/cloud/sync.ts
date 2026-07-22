import { useCourseStore } from '../store/courseStore'
import { saveProject as saveLocalProject, buildProjectBlob, persistToIndexedDb } from '../store/autosave'
import { uploadVersion } from './documents'
import { confirmDialog } from '../store/confirm'
import { useCloudSessionStore } from './session'

/**
 * Guarda el proyecto activo con el sistema que le corresponda — un único
 * gesto (Ctrl+S, el indicador de la Toolbar, Archivo → Guardar) para que
 * nunca haya ambigüedad sobre qué sistema manda: local y nube son
 * mutuamente excluyentes (`courseStore.cloudDocumentId`/`linkedFileName`),
 * así que este orquestador solo necesita mirar cuál está activo.
 */
export async function saveCurrentProject(): Promise<void> {
  const { cloudDocumentId, cloudOrgId, projectDirty, linkedFileName, cloudStale } = useCourseStore.getState()

  if (cloudDocumentId && cloudOrgId) {
    if (cloudStale) {
      // No subir a ciegas encima de una versión que no has visto: se abre
      // ☁ Nube para decidir con conocimiento de causa (bajarla primero, o
      // subir de todas formas si sabes que tu cambio debe ganar — ninguna
      // versión se pierde nunca, quedan todas en el historial).
      useCourseStore.getState().setSettingsModal('cloud')
      return
    }
    if (!projectDirty) return // ya sincronizado, nada que subir
    try {
      const blob = await buildProjectBlob()
      const versionId = await uploadVersion(cloudOrgId, cloudDocumentId, blob)
      useCourseStore.getState().setCloudVersion(versionId)
      useCourseStore.getState().setProjectDirty(false)
      await persistToIndexedDb()
    } catch (e) {
      await confirmDialog({
        title: 'No se pudo subir a la nube',
        message: `${e instanceof Error ? e.message : String(e)}\n\nTu trabajo sigue a salvo en este navegador; puedes reintentarlo cuando quieras (Ctrl+S o el indicador de guardado).`,
        confirmLabel: 'Entendido',
        hideCancel: true,
      })
    }
    return
  }

  // Proyecto todavía sin decidir dónde vive (nunca vinculado ni a un archivo
  // local ni a la nube): con sesión de nube activa, el primer guardado abre
  // el flujo de subida (elegir organización/carpeta/título) en vez de ir
  // directo al selector de archivo — el equivalente-nube de «pedir destino
  // la primera vez que se guarda». Sin sesión, sigue siendo local de siempre.
  if (!linkedFileName && useCloudSessionStore.getState().session) {
    useCourseStore.getState().setSettingsModal('cloud')
    return
  }

  await saveLocalProject()
}
