/* icons.js — Mini-set de iconos SVG de la carcasa. Sin dependencias.
 *
 * Paths tomados de Feather Icons (MIT, feathericons.com): trazo 2px redondeado
 * sobre caja 24×24, `stroke: currentColor` (heredan el color del texto). Se
 * incrustan aquí los que se usan; para añadir uno nuevo basta copiar su path.
 *
 * Uso declarativo: cualquier elemento con data-icon="nombre" se rellena al
 * cargar este script (hydrate). Uso programático: MEIcons.svg('printer').
 * El tamaño se controla por CSS sobre la clase .me-ico del propio <svg>.
 */
(function (global) {
  'use strict';

  var PATHS = {
    // ☰ índice / menú lateral
    'menu': '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    // Transcripción (documento con líneas de texto)
    'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
    // Audio activado / desactivado
    'volume-on': '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>',
    'volume-off': '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>',
    // Glosario (libro abierto)
    'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    // Recursos bibliográficos (clip de adjuntos)
    'paperclip': '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
    // Imprimir
    'printer': '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    // Ayuda
    'help-circle': '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    // Pestaña de plegado del índice
    'chevron-left': '<polyline points="15 18 9 12 15 6"/>',
    'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
  };

  function svg(name) {
    var body = PATHS[name] || '';
    return '<svg class="me-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  // Rellena todos los [data-icon] del subárbol (por defecto, el documento).
  function hydrate(root) {
    (root || document).querySelectorAll('[data-icon]').forEach(function (el) {
      el.innerHTML = svg(el.getAttribute('data-icon'));
    });
  }

  global.MEIcons = { svg: svg, hydrate: hydrate };
  // Los scripts van al final del <body>: el markup estático ya existe.
  hydrate(document);
})(window);
