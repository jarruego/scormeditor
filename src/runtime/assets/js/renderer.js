/* =============================================================================
 * renderer.js — Renderizadores de pantalla (uno por tipo de screen)
 * Renderer.render(container, screen, ctx) -> { interaction: controller|null }
 *   ctx = { state, save(state), announce(msg) }  (para la interacción)
 * Convierte student_text (markdown ligero) a HTML seguro.
 * ===========================================================================*/
(function (global) {
  'use strict';

  var esc = global.Interactions.esc;
  var asset = global.Interactions.asset;

  // Markdown ligero y SEGURO -> HTML. Soporta:
  //   ## / ### encabezados, **negrita**, *cursiva*, [texto](url),
  //   listas con "- ", listas numeradas con "1. ",
  //   bloques destacados:  ::: tip|warn|important|info ... :::
  // Todo el texto pasa por inline()/rich() que escapa antes de aplicar formato.
  // Colores alineados con la paleta corporativa de teleformación:
  //   #6DC3C0 turquesa · #F4C910 naranja · #F4D6D2 rosa · #7787BF violeta.
  var CALLOUTS = {
    tip:       { cls: 'me-callout-tip',       icon: '💡', label: 'Consejo' },
    info:      { cls: 'me-callout-info',      icon: 'ℹ️', label: 'Información' },
    warn:      { cls: 'me-callout-warn',      icon: '⚠️', label: 'Atención' },
    important: { cls: 'me-callout-important', icon: '📌', label: 'Importante' },
    fact:      { cls: 'me-callout-fact',      icon: '🧠', label: '¿Sabías que…?' },
    reflect:   { cls: 'me-callout-reflect',   icon: '💭', label: 'Reflexiona' },
    case:      { cls: 'me-callout-case',      icon: '🧪', label: 'Caso práctico' }
  };
  function renderCallout(type, innerHtml) {
    var c = CALLOUTS[type] || CALLOUTS.info;
    return '<aside class="me-callout ' + c.cls + '" role="note">' +
      '<p class="me-callout-title"><span class="me-callout-ico" aria-hidden="true">' + c.icon +
      '</span>' + c.label + '</p>' +
      '<div class="me-callout-body">' + innerHtml + '</div></aside>';
  }
  // Bloque personalizado: "::: custom | #color | icono | título". El color se
  // valida (solo hex) para evitar inyección en el atributo style; icono y título
  // se escapan como el resto del texto.
  function renderCustomCallout(params, innerHtml) {
    var parts = String(params).split('|');
    var color = (parts[0] || '').trim();
    var icon = (parts[1] || '').trim();
    var title = (parts[2] || '').trim();
    var safe = /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : '#7787BF';
    var style = 'border-left-color:' + safe + ';background:color-mix(in srgb,' + safe + ' 18%,white);';
    return '<aside class="me-callout me-callout-custom" role="note" style="' + style + '">' +
      '<p class="me-callout-title">' +
      (icon ? '<span class="me-callout-ico" aria-hidden="true">' + esc(icon) + '</span>' : '') +
      esc(title) + '</p>' +
      '<div class="me-callout-body">' + innerHtml + '</div></aside>';
  }

  function mdToHtml(text) {
    if (!text) return '';
    return blocksToHtml(String(text).split(/\r?\n/));
  }
  function blocksToHtml(lines) {
    var html = '', inUl = false, inOl = false, i;
    function closeLists() {
      if (inUl) { html += '</ul>'; inUl = false; }
      if (inOl) { html += '</ol>'; inOl = false; }
    }
    for (i = 0; i < lines.length; i++) {
      var ln = lines[i];
      // Apertura de bloque destacado: "::: tipo" o "::: custom | #color | icono | título".
      var open = /^\s*:::\s*([A-Za-z]+)\s*(.*)$/.exec(ln);
      if (open) {
        closeLists();
        var type = open[1].toLowerCase();
        var rest = open[2] || '';
        var inner = [];
        for (i++; i < lines.length && !/^\s*:::\s*$/.test(lines[i]); i++) inner.push(lines[i]);
        var innerHtml = blocksToHtml(inner);
        html += type === 'custom' ? renderCustomCallout(rest, innerHtml) : renderCallout(type, innerHtml);
        continue;
      }
      var h = /^(#{2,3})\s+(.*)$/.exec(ln); // ## y ### (h1 es el título)
      if (h) { closeLists(); var lv = h[1].length; html += '<h' + lv + '>' + inline(h[2]) + '</h' + lv + '>'; continue; }
      // Línea que es SOLO negrita (con dos puntos opcionales) => encabezado.
      // Cubre títulos que el origen trae como "**Título**" en vez de "## Título".
      var bh = /^\s*\*\*(.+?)\*\*\s*:?\s*$/.exec(ln);
      if (bh) { closeLists(); html += '<h3>' + inline(bh[1]) + '</h3>'; continue; }
      var oli = /^\s*\d+[.)]\s+(.*)/.exec(ln);
      if (oli) {
        if (inUl) { html += '</ul>'; inUl = false; }
        if (!inOl) { html += '<ol>'; inOl = true; }
        html += '<li>' + inline(oli[1]) + '</li>';
        continue;
      }
      // Viñetas: además de "-", admite "*", "•", "·", "–", "—" (los que suelen
      // aparecer en PDF/DOC), para que las listas no queden como párrafo corrido.
      var uli = /^\s*[-*•·–—]\s+(.*)/.exec(ln);
      if (uli) {
        if (inOl) { html += '</ol>'; inOl = false; }
        if (!inUl) { html += '<ul>'; inUl = true; }
        html += '<li>' + inline(uli[1]) + '</li>';
        continue;
      }
      closeLists();
      if (ln.trim() !== '') html += '<p>' + inline(ln) + '</p>';
    }
    closeLists();
    return html;
  }
  function inline(s) {
    // Texto enriquecido: **negrita**, *cursiva* y enlaces [texto](url).
    return global.Interactions.rich(s);
  }

  function mediaBlock(vr) {
    if (!vr || vr.kind === 'none' || !vr.src) return '';
    if (vr.kind === 'image') {
      return '<figure class="me-figure"><img src="' + esc(asset(vr.src)) + '" alt="' + esc(vr.alt || '') +
        '" class="me-zoomable" tabindex="0" role="button" aria-label="Ampliar imagen">' +
        (vr.caption ? '<figcaption>' + esc(vr.caption) + '</figcaption>' : '') + '</figure>';
    }
    if (vr.kind === 'video_youtube') {
      return '<div class="me-video"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(vr.src) +
        '" title="' + esc(vr.caption || 'Vídeo') + '" allowfullscreen loading="lazy"></iframe></div>';
    }
    if (vr.kind === 'video_file') {
      var t = (vr.tracks || []).map(function (tr) {
        return '<track kind="' + esc(tr.kind || 'subtitles') + '" src="' + esc(asset(tr.src)) + '" srclang="' + esc(tr.lang) + '" label="' + esc(tr.label) + '" default>';
      }).join('');
      return '<video class="me-video" controls preload="metadata"' + (vr.poster ? ' poster="' + esc(asset(vr.poster)) + '"' : '') + '><source src="' + esc(asset(vr.src)) + '">' + t + '</video>';
    }
    if (vr.kind === 'audio') {
      return '<audio class="me-audio" controls preload="metadata"><source src="' + esc(asset(vr.src)) + '"></audio>';
    }
    return '';
  }

  // Coloca media y texto según visual_resource.layout (top|bottom|left|right).
  function mediaTextLayout(s, mediaHtml, proseHtml, proseClass) {
    var pc = 'me-prose' + (proseClass ? ' ' + proseClass : '');
    var prose = '<div class="' + pc + '">' + proseHtml + '</div>';
    if (!mediaHtml) return prose;
    var layout = (s.visual_resource && s.visual_resource.layout) || 'top';
    var media = '<div class="me-media">' + mediaHtml + '</div>';
    var inner = (layout === 'bottom' || layout === 'right') ? (prose + media) : (media + prose);
    var mw = (s.visual_resource && s.visual_resource.media_width) || '50';
    return '<div class="me-layout me-layout-' + layout + ' me-mw-' + mw + '">' + inner + '</div>';
  }

  // Plantillas por tipo de pantalla. Todas respetan la posición del recurso
  // (visual_resource.layout) a través de mediaTextLayout.
  var templates = {
    cover: function (s) {
      return '<header class="me-cover"><h1>' + esc(s.title) + '</h1>' +
        mediaTextLayout(s, mediaBlock(s.visual_resource), mdToHtml(s.student_text)) + '</header>';
    },
    objectives: function (s) {
      return '<h1>' + esc(s.title) + '</h1>' +
        (s.objective ? '<p class="me-objective"><strong>Objetivo:</strong> ' + esc(s.objective) + '</p>' : '') +
        mediaTextLayout(s, mediaBlock(s.visual_resource), mdToHtml(s.student_text));
    },
    route: function (s) { return templates.content(s); },
    summary: function (s) {
      return '<h1>' + esc(s.title) + '</h1>' +
        mediaTextLayout(s, mediaBlock(s.visual_resource), mdToHtml(s.student_text), 'me-summary');
    },
    reflection: function (s) {
      return '<h1>' + esc(s.title) + '</h1>' +
        mediaTextLayout(s, mediaBlock(s.visual_resource), mdToHtml(s.student_text), 'me-reflection');
    },
    forum_prompt: function (s) {
      return '<h1>' + esc(s.title) + '</h1><div class="me-forum"><p class="me-forum-tag">Actividad de foro</p>' +
        mediaTextLayout(s, mediaBlock(s.visual_resource), mdToHtml(s.student_text)) + '</div>';
    },
    content_placeholder: function (s) {
      return '<h1>' + esc(s.title) + '</h1><div class="me-placeholder" role="note"><strong>⚠ Contenido pendiente de desarrollo.</strong>' +
        mediaTextLayout(s, mediaBlock(s.visual_resource), mdToHtml(s.student_text)) + '</div>';
    },
    video: function (s) {
      return '<h1>' + esc(s.title) + '</h1>' + mediaTextLayout(s, mediaBlock(s.visual_resource), mdToHtml(s.student_text));
    },
    content: function (s) {
      // El `objective` NO se muestra como banner en cada pantalla de contenido
      // (queda como metadato de trazabilidad); los objetivos se presentan al alumno
      // en la pantalla dedicada `objectives`.
      return '<h1>' + esc(s.title) + '</h1>' +
        mediaTextLayout(s, mediaBlock(s.visual_resource), mdToHtml(s.student_text));
    },
    unit_quiz: function (s) {
      return '<h1>' + esc(s.title) + '</h1>' + mediaTextLayout(s, mediaBlock(s.visual_resource), mdToHtml(s.student_text));
    },
  };

  // Reproductor compacto de la locución de la diapositiva (si la hay).
  function narrationBlock(s) {
    if (!s.audio_src) return '';
    return '<div class="me-narration">' +
      '<span class="me-narration-label" aria-hidden="true">🔊 Audio de la diapositiva</span>' +
      '<audio class="me-narration-audio" controls preload="none" aria-label="Audio de locución de la diapositiva">' +
      '<source src="' + esc(asset(s.audio_src)) + '"></audio></div>';
  }

  function render(container, screen, ctx) {
    var tpl = templates[screen.type] || templates.content;
    var html = tpl(screen);
    container.innerHTML = '<article class="me-screen me-screen-' + esc(screen.type) + '">' +
      narrationBlock(screen) + html +
      (screen.interaction ? '<section class="me-interaction" aria-label="Actividad"></section>' : '') + '</article>';

    var controller = null;
    if (screen.interaction) {
      var mount = container.querySelector('.me-interaction');
      controller = global.Interactions.render(mount, screen.interaction, ctx);
    }
    return { interaction: controller };
  }

  global.Renderer = { render: render, mdToHtml: mdToHtml };
})(window);
