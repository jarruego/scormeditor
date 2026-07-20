/**
 * Orquestador del exportador `.elpx` (eXeLearning ≥ 4.0.1).
 *
 * Recorre el `course.json` del editor y produce un paquete `.elpx` mínimo pero
 * válido: `content.xml` (ODE 2.0) + `content.dtd` + `content/resources/` con los
 * binarios referenciados. Es cuanto necesita eXe para IMPORTAR y seguir editando
 * (theme/libs/index.html/screenshot solo hacen falta para visualización offline,
 * que aquí no aplica). Módulo aislado: no toca el runtime ni el esquema; se carga
 * bajo demanda desde el menú Archivo.
 *
 * Mapa de la jerarquía: módulo → página raíz; unidad → subpágina; pantalla →
 * subpágina de la unidad, con un bloque de contenido (`text`) y, si la hay, un
 * bloque con la interacción convertida. Glosario, bibliografía y test final van
 * como páginas raíz al final.
 */
import JSZip from 'jszip'
import type { Course, Screen, Interaction } from '../../schema/course.schema'
import type { AssetMap } from '../../export/exportScorm'
import type { ConvertCtx, ExportSummary } from './types'
import { odeId, pageId, nowStamp } from './ids'
import { mdToHtml, esc, stripInline } from './mdToHtml'
import { textIdevice, degradeToTextHtml } from './idevices'
import { convertInteraction, NATIVE_IDEVICE } from './mapping'
import { buildContentXml, type ElpxPage, type ElpxBlock } from './contentXml'
import { CONTENT_DTD } from './contentDtd'

/** Nombre de fichero seguro para `content/resources/` (ASCII, sin colisiones). */
function safeName(src: string, used: Set<string>): string {
  let base = src.split('/').pop() || 'recurso'
  base = base.replace(/[^A-Za-z0-9._-]/g, '_')
  if (!/\.[A-Za-z0-9]+$/.test(base)) base += '.bin'
  let name = base
  let n = 1
  while (used.has(name)) {
    const dot = base.lastIndexOf('.')
    name = base.slice(0, dot) + '-' + n + base.slice(dot)
    n++
  }
  used.add(name)
  return name
}

/** Imagen de `visual_resource` como HTML, o cadena vacía si no procede. */
function visualHtml(s: Screen, resolve: (src: string) => string): string {
  const vr = s.visual_resource
  if (!vr || vr.kind === 'none' || !vr.src) return ''
  if (vr.kind === 'image') {
    const src = resolve(vr.src)
    return src
      ? `<p><img src="${esc(src)}" alt="${esc(vr.alt || '')}"${vr.caption ? ` title="${esc(vr.caption)}"` : ''}></p>`
      : ''
  }
  if (vr.kind === 'video_youtube') {
    const url = `https://www.youtube.com/watch?v=${vr.src}`
    return `<p><a href="${esc(url)}" target="_blank" rel="noopener">${esc(vr.caption || 'Ver vídeo')}</a></p>`
  }
  // video_file / audio: enlace al recurso copiado.
  const src = resolve(vr.src)
  return src ? `<p><a href="${esc(src)}">${esc(vr.caption || 'Recurso multimedia')}</a></p>` : ''
}

export type ElpxExportResult = { blob: Blob; summary: ExportSummary; filename: string }

/**
 * Construye el `.elpx` en memoria y devuelve el Blob + un resumen de conversión.
 */
export async function buildElpx(course: Course, assets: AssetMap = {}): Promise<ElpxExportResult> {
  const stamp = nowStamp()
  const usedNames = new Set<string>()
  const toCopy = new Map<string, string>() // nombre en resources → clave en assets
  const summary: ExportSummary = { pages: 0, components: 0, mapped: {}, notes: [] }

  const resolveAsset = (src: string): string => {
    if (!src) return ''
    if (/^https?:\/\//i.test(src)) return src
    // Ya registrado (mismo origen → misma referencia).
    for (const [name, key] of toCopy) if (key === src) return `{{context_path}}/${name}`
    const name = safeName(src, usedNames)
    toCopy.set(name, src)
    return `{{context_path}}/${name}`
  }
  const ctx: ConvertCtx = {
    resolveAsset,
    newId: (seed: string) => odeId(stamp, seed),
    note: (msg: string) => {
      if (!summary.notes.includes(msg)) summary.notes.push(msg)
    },
  }

  const pages: ElpxPage[] = []
  let rootOrder = 0

  const addInteraction = (blocks: ElpxBlock[], it: Interaction, screenId: string) => {
    const comp = convertInteraction(it, ctx)
    summary.mapped[it.type] = NATIVE_IDEVICE[it.type] || 'text'
    summary.components++
    blocks.push({
      blockId: odeId(stamp, screenId + '_blk_int'),
      components: [{ ...comp, ideviceId: odeId(stamp, it.id) }],
    })
  }

  // Página de una pantalla (compartida por pantallas de módulo y de unidad).
  const addScreenPage = (screen: Screen, parentPageId: string, order: number) => {
    const blocks: ElpxBlock[] = []
    // Bloque de contenido: recurso visual + texto de la diapositiva.
    const contentHtml = visualHtml(screen, resolveAsset) + mdToHtml(screen.student_text, resolveAsset)
    if (contentHtml.trim()) {
      blocks.push({
        blockId: odeId(stamp, screen.id + '_blk_txt'),
        components: [
          {
            ...textIdevice(odeId(stamp, screen.id + '_txt'), contentHtml),
            ideviceId: odeId(stamp, screen.id + '_txt'),
          },
        ],
      })
      summary.components++
    }
    // Bloque de interacción.
    if (screen.interaction) addInteraction(blocks, screen.interaction, screen.id)

    pages.push({
      pageId: pageId('scr_' + screen.id),
      parentPageId,
      name: screen.title || 'Pantalla',
      order,
      blocks,
    })
    summary.pages++
  }

  for (const mod of course.modules) {
    const modPageId = pageId('mod_' + mod.id)
    pages.push({
      pageId: modPageId,
      parentPageId: '',
      name: mod.title || 'Módulo',
      order: rootOrder++,
      blocks: [],
    })
    summary.pages++

    // Hijos del nodo módulo: primero sus pantallas propias, después las unidades.
    let childOrder = 0
    for (const screen of mod.screens) addScreenPage(screen, modPageId, childOrder++)

    for (const unit of mod.units) {
      const unitPageId = pageId('unit_' + unit.id)
      const unitBlocks: ElpxBlock[] = []
      if (unit.summary && unit.summary.trim()) {
        unitBlocks.push({
          blockId: odeId(stamp, unit.id + '_blk_sum'),
          components: [
            {
              ...textIdevice(odeId(stamp, unit.id + '_sum'), mdToHtml(unit.summary, resolveAsset)),
              ideviceId: odeId(stamp, unit.id + '_sum'),
            },
          ],
        })
      }
      pages.push({
        pageId: unitPageId,
        parentPageId: modPageId,
        name: unit.title || 'Unidad',
        order: childOrder++,
        blocks: unitBlocks,
      })
      summary.pages++

      let scrOrder = 0
      for (const screen of unit.screens) addScreenPage(screen, unitPageId, scrOrder++)
    }
  }

  // --- Test final → página raíz con una pregunta (quick-questions) por bloque ---
  const finalTest = course.assessments?.final_test
  if (finalTest && finalTest.questions.length) {
    const testPageId = pageId('final_test')
    const blocks: ElpxBlock[] = finalTest.questions.map((q) => {
      // Reutiliza el conversor de preguntas de opción (interacción sintética).
      const synthetic: Interaction = {
        id: 'final_' + q.id,
        type: 'single_choice',
        prompt: q.prompt,
        instructions: '',
        options: q.options,
        config: {},
        feedback: q.feedback,
        scored: true,
        points: q.points,
        attempts: 1,
        retries: 0,
        source_refs: [],
      }
      const comp = convertInteraction(synthetic, ctx)
      summary.components++
      return {
        blockId: odeId(stamp, 'final_blk_' + q.id),
        components: [{ ...comp, ideviceId: odeId(stamp, 'final_' + q.id) }],
      }
    })
    pages.push({
      pageId: testPageId,
      parentPageId: '',
      name: finalTest.title || 'Evaluación final',
      order: rootOrder++,
      blocks,
    })
    summary.pages++
    summary.notes.push('Test final → preguntas de opción (quick-questions), una por bloque')
  }

  // --- Glosario y bibliografía → páginas raíz de texto ---
  if (course.glossary.length) {
    const html = course.glossary
      .map((g) => `<h3>${esc(g.term)}</h3>${mdToHtml(g.definition, resolveAsset)}`)
      .join('')
    pages.push(simpleTextPage(stamp, 'glossary', course.glossary_title || 'Glosario', html, rootOrder++))
    summary.pages++
    summary.components++
  }
  if (course.bibliography.length) {
    const html =
      '<ul>' +
      course.bibliography
        .map((b) => `<li>${b.url ? `<a href="${esc(b.url)}" target="_blank" rel="noopener">${esc(b.ref)}</a>` : esc(b.ref)}</li>`)
        .join('') +
      '</ul>'
    pages.push(
      simpleTextPage(stamp, 'biblio', course.bibliography_title || 'Recursos y bibliografía', html, rootOrder++),
    )
    summary.pages++
    summary.components++
  }

  // --- Ensamblado del content.xml ---
  const meta = {
    odeId: odeId(stamp, 'odeId_' + course.course.id),
    odeVersionId: odeId(stamp, 'odeVer_' + course.course.id),
    exeVersion: '4.0.1',
    title: course.course.title || 'Curso',
    lang: course.course.language || 'es',
    author: course.course.authoring_entity || '',
    modified: new Date().toISOString(),
  }
  const contentXml = buildContentXml(meta, pages)

  // --- Empaquetado ZIP ---
  const zip = new JSZip()
  zip.file('content.xml', contentXml)
  zip.file('content.dtd', CONTENT_DTD)
  for (const [name, key] of toCopy) {
    const bin = assets[key]
    if (bin != null) zip.file(`content/resources/${name}`, bin as Blob | Uint8Array | ArrayBuffer | string)
    else summary.notes.push(`Recurso no encontrado, referencia rota evitada: ${key}`)
  }

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  const filename = (course.course.title || 'curso').replace(/[^A-Za-z0-9._-]+/g, '_') + '.elpx'
  return { blob, summary, filename }
}

/** Página raíz con un único iDevice `text` (glosario, bibliografía). */
function simpleTextPage(
  stamp: string,
  key: string,
  name: string,
  innerHtml: string,
  order: number,
): ElpxPage {
  const pid = pageId(key)
  return {
    pageId: pid,
    parentPageId: '',
    name,
    order,
    blocks: [
      {
        blockId: odeId(stamp, key + '_blk'),
        components: [
          {
            ...textIdevice(odeId(stamp, key + '_txt'), innerHtml),
            ideviceId: odeId(stamp, key + '_txt'),
          },
        ],
      },
    ],
  }
}

// Reexport para pruebas/uso externo.
export { degradeToTextHtml, stripInline }
