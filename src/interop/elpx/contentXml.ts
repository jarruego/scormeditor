/**
 * Ensamblado del `content.xml` (ODE 2.0) a partir de páginas ya convertidas.
 *
 * Estructura exacta observada en `.elpx` reales: raíz `<ode>` con
 * `odeResources` → `odeProperties` → `odeNavStructures`; cada página
 * (`odeNavStructure`) contiene bloques (`odePagStructure`) y estos, componentes
 * (`odeComponent`). El orden de los hijos de la raíz importa (lo valida el
 * validador oficial).
 */
import { xesc, cdata, kvBlock } from './xml'
import type { ElpxComponent } from './types'

export type ElpxBlock = {
  blockId: string
  components: Array<ElpxComponent & { ideviceId: string }>
}

export type ElpxPage = {
  pageId: string
  parentPageId: string
  name: string
  order: number
  blocks: ElpxBlock[]
}

export type ContentMeta = {
  odeId: string
  odeVersionId: string
  exeVersion: string
  title: string
  lang: string
  author: string
  modified: string
}

function componentXml(
  pageId: string,
  blockId: string,
  c: ElpxComponent & { ideviceId: string },
  order: number,
): string {
  const props = kvBlock(
    'odeComponentsProperty',
    [
      ['visibility', 'true'],
      ['teacherOnly', 'false'],
      ['cssClass', ''],
    ],
    '            ',
  )
  return (
    '        <odeComponent>\n' +
    `          <odePageId>${xesc(pageId)}</odePageId>\n` +
    `          <odeBlockId>${xesc(blockId)}</odeBlockId>\n` +
    `          <odeIdeviceId>${xesc(c.ideviceId)}</odeIdeviceId>\n` +
    `          <odeIdeviceTypeName>${xesc(c.typeName)}</odeIdeviceTypeName>\n` +
    `          <htmlView>${cdata(c.htmlView)}</htmlView>\n` +
    `          <jsonProperties>${cdata(c.jsonProperties)}</jsonProperties>\n` +
    `          <odeComponentsOrder>${order}</odeComponentsOrder>\n` +
    '          <odeComponentsProperties>\n' +
    props +
    '\n          </odeComponentsProperties>\n' +
    '        </odeComponent>\n'
  )
}

function blockXml(pageId: string, b: ElpxBlock, order: number): string {
  const props = kvBlock(
    'odePagStructureProperty',
    [
      ['visibility', 'true'],
      ['teacherOnly', 'false'],
      ['allowToggle', 'true'],
      ['minimized', 'false'],
      ['cssClass', ''],
    ],
    '        ',
  )
  const comps = b.components.map((c, i) => componentXml(pageId, b.blockId, c, i + 1)).join('')
  return (
    '    <odePagStructure>\n' +
    `      <odePageId>${xesc(pageId)}</odePageId>\n` +
    `      <odeBlockId>${xesc(b.blockId)}</odeBlockId>\n` +
    '      <blockName></blockName>\n' +
    '      <iconName></iconName>\n' +
    `      <odePagStructureOrder>${order}</odePagStructureOrder>\n` +
    '      <odePagStructureProperties>\n' +
    props +
    '\n      </odePagStructureProperties>\n' +
    '      <odeComponents>\n' +
    comps +
    '      </odeComponents>\n' +
    '    </odePagStructure>\n'
  )
}

function pageXml(p: ElpxPage): string {
  const props = kvBlock(
    'odeNavStructureProperty',
    [
      ['titlePage', p.name],
      ['visibility', 'true'],
      ['highlight', 'false'],
      ['hidePageTitle', 'false'],
      ['editableInPage', 'false'],
      ['titleNode', p.name],
      ['titleHtml', ''],
      ['description', ''],
    ],
    '    ',
  )
  const blocks = p.blocks.map((b, i) => blockXml(p.pageId, b, i + 1)).join('')
  return (
    '<odeNavStructure>\n' +
    `  <odePageId>${xesc(p.pageId)}</odePageId>\n` +
    `  <odeParentPageId>${xesc(p.parentPageId)}</odeParentPageId>\n` +
    `  <pageName>${xesc(p.name)}</pageName>\n` +
    `  <odeNavStructureOrder>${p.order}</odeNavStructureOrder>\n` +
    '  <odeNavStructureProperties>\n' +
    props +
    '\n  </odeNavStructureProperties>\n' +
    '  <odePagStructures>\n' +
    blocks +
    '  </odePagStructures>\n' +
    '</odeNavStructure>'
  )
}

/** Serializa el documento `content.xml` completo. */
export function buildContentXml(meta: ContentMeta, pages: ElpxPage[]): string {
  const resources = kvBlock(
    'odeResource',
    [
      ['odeId', meta.odeId],
      ['odeVersionId', meta.odeVersionId],
      ['eXeVersion', meta.exeVersion],
      ['exe_version', meta.exeVersion],
    ],
    '  ',
  )
  const properties = kvBlock(
    'odeProperty',
    [
      ['pp_title', meta.title],
      ['pp_lang', meta.lang],
      ['pp_author', meta.author],
      ['pp_license', 'creative commons: attribution - share alike 4.0'],
      ['pp_licenseUrl', 'https://creativecommons.org/licenses/by-sa/4.0/'],
      ['pp_modified', meta.modified],
      ['pp_addExeLink', 'false'],
      ['pp_addPagination', 'false'],
      ['pp_addSearchBox', 'false'],
      ['pp_addAccessibilityToolbar', 'false'],
      ['pp_addMathJax', 'false'],
      ['exportSource', 'true'],
      ['pp_globalFont', 'default'],
    ],
    '  ',
  )
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<!DOCTYPE ode SYSTEM "content.dtd">\n' +
    '<ode xmlns="http://www.intef.es/xsd/ode" version="2.0">\n' +
    '<odeResources>\n' +
    resources +
    '\n</odeResources>\n' +
    '<odeProperties>\n' +
    properties +
    '\n</odeProperties>\n' +
    '<odeNavStructures>\n' +
    pages.map(pageXml).join('\n') +
    '\n</odeNavStructures>\n' +
    '</ode>\n'
  )
}
