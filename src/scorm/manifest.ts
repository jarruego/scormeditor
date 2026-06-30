import type { Course } from '../schema/course.schema'

/** Escapa texto para XML. */
function xml(s: string): string {
  return String(s ?? '').replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string),
  )
}

/**
 * Genera imsmanifest.xml para SCORM 1.2 (un único SCO).
 * Incluye la organización con un item por curso y el listado de ficheros
 * del recurso. `extraFiles` son rutas adicionales (assets de media, etc.).
 */
export function generateManifest(course: Course, extraFiles: string[] = []): string {
  const id = course.scorm.identifier || 'SCORMEDITOR-COURSE'
  const title = course.scorm.title || course.course.title || 'Curso'
  const mastery = course.scorm.mastery_score ?? 60

  // Ficheros base de la carcasa (deben existir en el ZIP)
  const baseFiles = [
    'index.html',
    'assets/css/styles.css',
    'assets/js/scorm_api.js',
    'assets/js/accessibility.js',
    'assets/js/interactions.js',
    'assets/js/renderer.js',
    'assets/js/app.js',
    'print/print.css',
    'data/course.json',
  ]
  const files = Array.from(new Set([...baseFiles, ...extraFiles]))
  const fileEls = files.map((f) => `      <file href="${xml(f)}"/>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${xml(id)}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                      http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                      http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
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
