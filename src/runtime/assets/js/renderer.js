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

  // Markdown muy ligero: **negrita**, *cursiva*, listas con "- ", saltos de línea.
  function mdToHtml(text) {
    if (!text) return '';
    var lines = String(text).split(/\r?\n/);
    var html = '', inList = false;
    lines.forEach(function (ln) {
      var li = /^\s*-\s+(.*)/.exec(ln);
      if (li) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += '<li>' + inline(li[1]) + '</li>';
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        if (ln.trim() === '') html += '';
        else html += '<p>' + inline(ln) + '</p>';
      }
    });
    if (inList) html += '</ul>';
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
      var html = '<h1>' + esc(s.title) + '</h1>';
      if (s.objective) html += '<p class="me-objective"><strong>Objetivo:</strong> ' + esc(s.objective) + '</p>';
      html += mediaTextLayout(s, mediaBlock(s.visual_resource), mdToHtml(s.student_text));
      return html;
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
