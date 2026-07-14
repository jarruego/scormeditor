/**
 * Utilidades para construir el `content.xml` del `.elpx` a mano.
 *
 * eXe genera XML plano (no usamos DOM builder para no depender del entorno).
 * Todo texto que va como valor de elemento se escapa; el HTML de `htmlView`/
 * `jsonProperties` va SIEMPRE dentro de CDATA (puede contener `<`, `&`, `"`).
 */

/** Escapa texto para contenido de elemento o atributo XML. */
export function xesc(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Envuelve una cadena en CDATA, neutralizando cualquier `]]>` interno. */
export function cdata(s: string): string {
  return '<![CDATA[' + String(s ?? '').replace(/]]>/g, ']]]]><![CDATA[>') + ']]>'
}

/** Serie de `<tag><key>…</key><value>…</value></tag>` a partir de pares. */
export function kvBlock(
  tag: string,
  pairs: Array<[string, string | number | boolean]>,
  indent = '  ',
): string {
  return pairs
    .map(
      ([k, v]) =>
        `${indent}<${tag}>\n${indent}  <key>${xesc(k)}</key>\n` +
        `${indent}  <value>${xesc(String(v))}</value>\n${indent}</${tag}>`,
    )
    .join('\n')
}
