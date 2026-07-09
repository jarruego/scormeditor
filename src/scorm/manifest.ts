import type { Course } from '../schema/course.schema'
import { getRuntimeFiles } from './runtimeAssets'

/** Escapa texto para XML. */
function xml(s: string): string {
  return String(s ?? '').replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string),
  )
}

/**
 * Genera imsmanifest.xml para SCORM 1.2 (un único SCO).
 * Incluye la organización con un item por curso y el listado de ficheros
 * del recurso. La lista base se deriva de la carcasa real (runtimeAssets),
 * de modo que no puede desincronizarse al añadir ficheros a `src/runtime/`.
 * `extraFiles` son rutas adicionales (assets de media, etc.).
 */
export function generateManifest(course: Course, extraFiles: string[] = []): string {
  const id = course.scorm.identifier || 'SCORMEDITOR-COURSE'
  const title = course.scorm.title || course.course.title || 'Curso'
  const mastery = course.scorm.mastery_score ?? 60

  // Ficheros base: la carcasa completa (misma fuente que el ZIP y la vista
  // estudiante) + los datos del curso + los metadatos LOM.
  const baseFiles = [
    ...getRuntimeFiles().map((f) => f.path),
    'data/course.json',
    'imslrm.xml',
  ]
  const files = Array.from(new Set([...baseFiles, ...extraFiles])).sort()
  const fileEls = files.map((f) => `      <file href="${xml(f)}"/>`).join('\n')

  // Sin xsi:schemaLocation: los XSD no se incluyen en el paquete y declararlos
  // sin adjuntarlos es lo único que objetan los validadores estrictos.
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${xml(id)}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
    <adlcp:location>imslrm.xml</adlcp:location>
  </metadata>
  <organizations default="ORG-${xml(id)}">
    <organization identifier="ORG-${xml(id)}">
      <title>${xml(title)}</title>
      <item identifier="ITEM-${xml(id)}" identifierref="RES-${xml(id)}" isvisible="true">
        <title>${xml(title)}</title>
        <adlcp:masteryscore>${mastery}</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-${xml(id)}" type="webcontent" adlcp:scormtype="sco" href="index.html">
${fileEls}
    </resource>
  </resources>
</manifest>
`
}

/**
 * Genera imslrm.xml: metadatos LOM (IMS Learning Resource Metadata 1.2) del
 * curso. Los LMS que los leen (Moodle entre ellos) muestran título, idioma,
 * descripción y autoría al importar el paquete. Referenciado desde el
 * manifiesto vía <adlcp:location>.
 */
export function generateLomMetadata(course: Course): string {
  const title = course.scorm.title || course.course.title || 'Curso'
  const lang = course.course.language || 'es'
  const description = course.course.description || ''
  const author = course.course.authoring_entity || ''

  const langstring = (s: string) => `<langstring xml:lang="${xml(lang)}">${xml(s)}</langstring>`

  const contribute = author
    ? `
    <contribute>
      <role>
        <source><langstring xml:lang="x-none">LOMv1.0</langstring></source>
        <value><langstring xml:lang="x-none">Author</langstring></value>
      </role>
      <centity><vcard>BEGIN:VCARD\nVERSION:3.0\nFN:${xml(author)}\nEND:VCARD</vcard></centity>
    </contribute>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<lom xmlns="http://www.imsglobal.org/xsd/imsmd_rootv1p2p1">
  <general>
    <title>${langstring(title)}</title>
    <language>${xml(lang)}</language>
    <description>${langstring(description)}</description>
  </general>
  <lifecycle>${contribute}
  </lifecycle>
  <metametadata>
    <metadatascheme>ADL SCORM 1.2</metadatascheme>
    <language>${xml(lang)}</language>
  </metametadata>
</lom>
`
}
