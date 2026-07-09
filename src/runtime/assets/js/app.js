/* =============================================================================
 * app.js — Orquestador de la carcasa SCORM
 * Carga data/course.json, monta menú/contenido, aplica reglas SCORM 1.2,
 * persiste en suspend_data y reanuda sesión. Depende de:
 *   scorm_api.js, accessibility.js, interactions.js, renderer.js
 * ===========================================================================*/
(function (global) {
  'use strict';

  var COURSE = null;
  var SCREENS = [];          // lista plana { unit, screen, isFinalTest }
  var current = 0;
  var startTotalSeconds = 0; // tiempo de sesión acumulado al entrar a la pantalla
  var sessionStart = Date.now();
  var screenEnter = Date.now();
  var activeController = null;

  var STATE = { visited: {}, interactions: {}, results: {}, attempts: 0, finalScore: 0 };

  // Locución: activada por defecto. La preferencia se recuerda entre sesiones si
  // el navegador lo permite (localStorage puede fallar en algún LMS: try/catch).
  var audioEnabled = true;
  try { if (global.localStorage && localStorage.getItem('me-audio-enabled') === '0') audioEnabled = false; } catch (e) {}

  // Modo autor (previsualización del editor): navegación libre sin restricciones
  // de tiempo mínimo, interacciones obligatorias ni secuencia. En el SCORM real
  // (sin este flag) se aplican todas las reglas configuradas. En la Vista
  // estudiante se puede desactivar temporalmente con el conmutador flotante
  // (setupAuthorToggle) para probar el comportamiento real del curso.
  var AUTHOR = !!global.__AUTHOR_MODE__;

  // ---- Carga -------------------------------------------------------------
  function boot() {
    SCORM.initialize();
    restore();
    // Modo previsualización del editor: datos inyectados en memoria.
    if (global.__COURSE_DATA__) { COURSE = global.__COURSE_DATA__; setup(); return; }
    fetch('data/course.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (data) { COURSE = data; setup(); })
      .catch(function (e) {
        document.getElementById('me-content').innerHTML = '<p class="me-warn">No se pudo cargar el curso: ' + esc(e) + '</p>';
      });
  }

  function restore() {
    var s = SCORM.getSuspend();
    if (s && typeof s === 'object') STATE = Object.assign(STATE, s);
  }
  function persist() {
    SCORM.setSuspend(STATE);
    SCORM.setLocation(String(current));
    SCORM.commit();
  }

  function flatten() {
    SCREENS = [];
    (COURSE.modules || []).forEach(function (m) {
      (m.units || []).forEach(function (u) {
        (u.screens || []).forEach(function (sc) { SCREENS.push({ unit: u, module: m, screen: sc, isFinalTest: false }); });
      });
    });
    if (COURSE.assessments && COURSE.assessments.final_test && (COURSE.assessments.final_test.questions || []).length) {
      SCREENS.push({ unit: null, module: null, screen: { id: '__final__', type: 'final_test', title: COURSE.assessments.final_test.title || 'Test final', required: true }, isFinalTest: true });
    }
    // Pantalla de resultados al final, si hay algo que calificar (test final o
    // interacciones evaluables). Muestra la nota, APTO/NO APTO y el desglose.
    var hasFinal = COURSE.assessments && COURSE.assessments.final_test && (COURSE.assessments.final_test.questions || []).length;
    var hasScoredInter = SCREENS.some(function (e) { return !e.isFinalTest && e.screen.interaction && e.screen.interaction.scored; });
    if (hasFinal || hasScoredInter) {
      SCREENS.push({ unit: null, module: null, screen: { id: '__results__', type: 'results', title: 'Resultados', required: false }, isResults: true });
    }
  }

  // ---- Setup UI ----------------------------------------------------------
  function setup() {
    flatten();
    applyBranding();
    buildMenu();
    bindChrome();
    var rules = COURSE.scorm.rules || {};
    if (rules.allow_resume) {
      var loc = parseInt(SCORM.getLocation(), 10);
      if (!isNaN(loc) && loc >= 0 && loc < SCREENS.length) current = loc;
    }
    // En modo autor (Vista estudiante) arranca en la diapositiva activa del editor.
    if (AUTHOR && global.__START_SCREEN_ID__) {
      for (var si = 0; si < SCREENS.length; si++) {
        if (SCREENS[si].screen && SCREENS[si].screen.id === global.__START_SCREEN_ID__) { current = si; break; }
      }
    }
    if (SCORM.getStatus() === 'not attempted') SCORM.setStatus('incomplete');
    // En móvil el menú lateral arranca cerrado para no tapar el contenido.
    if (isMobile()) document.getElementById('me-app').classList.add('me-menu-hidden');
    reflectMenuUI();
    goTo(current, true);
  }

  function isMobile() { return global.matchMedia && global.matchMedia('(max-width: 760px)').matches; }
  function closeMenuIfMobile() {
    if (isMobile()) {
      document.getElementById('me-app').classList.add('me-menu-hidden');
      reflectMenuUI();
    }
  }

  function applyBranding() {
    var shell = COURSE.shell || {};
    if (shell.primary_color) document.documentElement.style.setProperty('--me-primary', shell.primary_color);
    // Nivel de animación de la carcasa (shell.motion): none | subtle | rich.
    MOTION = shell.motion === 'none' || shell.motion === 'rich' ? shell.motion : 'subtle';
    document.body.classList.add('me-motion-' + MOTION);
    // Velocidad (shell.motion_speed): fast | normal | slow. La clase alimenta
    // la variable CSS --me-speed; SPEED escala los delays de la cascada JS.
    var spd = shell.motion_speed === 'fast' || shell.motion_speed === 'slow' ? shell.motion_speed : 'normal';
    SPEED = spd === 'fast' ? 1 : spd === 'slow' ? 3 : 1.5;
    document.body.classList.add('me-speed-' + spd);
    // La marca solo se muestra si el autor la configuró: sin marca, la cabecera
    // lleva únicamente el título del curso (con estilo destacado, .me-no-brand).
    // 'SCORMEditor' era el default histórico del schema: se trata como «sin marca».
    var brand = (shell.brand || '').trim();
    if (!brand || brand === 'SCORMEditor') {
      document.getElementById('me-brand').hidden = true;
      document.querySelector('.me-topbar').classList.add('me-no-brand');
    } else {
      document.getElementById('me-brand').textContent = brand;
    }
    document.getElementById('me-course-title').textContent = COURSE.course.title || '';
    document.title = COURSE.course.title || 'Curso SCORM';
    document.documentElement.lang = (shell.language || COURSE.course.language || 'es');
    // Rótulos personalizados de glosario y recursos (glossary_title /
    // bibliography_title): re-rotulan el botón de la barra. Con el valor por
    // defecto el botón conserva su texto corto de fábrica («Recursos»).
    var gt = glossaryTitle();
    if (gt !== 'Glosario') relabelTool('me-btn-glossary', gt);
    var bt = bibliographyTitle();
    if (bt !== 'Recursos y bibliografía') relabelTool('me-btn-resources', bt);
  }

  function glossaryTitle() {
    return (COURSE.glossary_title || '').trim() || 'Glosario';
  }
  function bibliographyTitle() {
    return (COURSE.bibliography_title || '').trim() || 'Recursos y bibliografía';
  }
  function relabelTool(id, label) {
    var btn = document.getElementById(id);
    btn.querySelector('.me-tool-txt').textContent = label;
    btn.title = label;
    btn.setAttribute('aria-label', label);
  }

  function buildMenu() {
    var nav = document.getElementById('me-menu');
    var html = '';
    var idx = 0;
    (COURSE.modules || []).forEach(function (m) {
      html += '<div class="me-menu-module"><p class="me-menu-mtitle">' + esc(m.title) + '</p>';
      (m.units || []).forEach(function (u) {
        // data-start/data-count delimitan las pantallas de la unidad para el
        // contador y la mini-barra de progreso (refreshMenuChecks los rellena).
        var count = (u.screens || []).length;
        html += '<div class="me-menu-unit" data-start="' + idx + '" data-count="' + count + '">' +
          '<p class="me-menu-utitle"><span>' + esc(u.title) + '</span>' +
          '<span class="me-menu-count"></span></p>' +
          '<div class="me-menu-uprog" aria-hidden="true"><div class="me-menu-uprog-fill"></div></div><ul>';
        (u.screens || []).forEach(function (sc) {
          html += '<li><button class="me-menu-link" data-idx="' + idx + '">' + esc(sc.title || sc.type) +
            '<span class="me-menu-check" aria-hidden="true"></span></button></li>';
          idx++;
        });
        html += '</ul></div>';
      });
      html += '</div>';
    });
    // Pantallas sintéticas finales (test final y/o resultados), que van tras los
    // módulos en SCREENS a partir del índice acumulado.
    for (var k = idx; k < SCREENS.length; k++) {
      html += '<div class="me-menu-unit"><ul><li><button class="me-menu-link" data-idx="' + k + '">' +
        esc(SCREENS[k].screen.title) + '<span class="me-menu-check" aria-hidden="true"></span></button></li></ul></div>';
    }
    nav.innerHTML = html;
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('.me-menu-link'); if (!b) return;
      var target = parseInt(b.getAttribute('data-idx'), 10);
      if (canNavigateTo(target)) { goTo(target); closeMenuIfMobile(); }
      else A11Y.announce('Esa pantalla aún no está disponible. Completa las anteriores.');
    });
  }

  function bindChrome() {
    document.getElementById('me-prev').addEventListener('click', function () { goRelative(-1); });
    document.getElementById('me-next').addEventListener('click', function () { goRelative(1); });
    document.getElementById('me-toggle-menu').addEventListener('click', toggleMenu);
    document.getElementById('me-menu-tab').addEventListener('click', toggleMenu);
    document.getElementById('me-btn-transcript').addEventListener('click', toggleTranscript);
    document.getElementById('me-btn-audio').addEventListener('click', toggleAudio);
    reflectAudioButton();
    document.getElementById('me-btn-print').addEventListener('click', function () { window.print(); });
    document.getElementById('me-btn-glossary').addEventListener('click', function () { openModal('glossary'); });
    document.getElementById('me-btn-resources').addEventListener('click', function () { openModal('resources'); });
    document.getElementById('me-btn-help').addEventListener('click', function () { openModal('help'); });
    setupFullscreen();
    document.querySelectorAll('.me-modal-close').forEach(function (b) { b.addEventListener('click', closeModals); });
    A11Y.bindShortcuts({ next: function () { goRelative(1); }, prev: function () { goRelative(-1); }, menu: toggleMenu, transcript: toggleTranscript });
    // pagehide además de beforeunload: Safari/iOS no dispara beforeunload de
    // forma fiable. finishSession es idempotente, así que oír ambos es seguro.
    global.addEventListener('beforeunload', function () { finishSession(); });
    global.addEventListener('pagehide', function () { finishSession(); });
    setupLightbox();
    setupPrint();
    setupAuthorToggle();
  }

  // ---- Conmutador de modo autor (solo previsualización) --------------------
  // Píldora flotante que permite desactivar el modo autor para ver el
  // comportamiento real de la diapositiva (tiempo mínimo, interacciones
  // obligatorias, navegación). Solo se crea si __AUTHOR_MODE__ existe: en el
  // SCORM exportado no aparece. Por defecto el modo autor está activado.
  function setupAuthorToggle() {
    if (!global.__AUTHOR_MODE__) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'me-author-toggle';
    // Anclada a .me-body: queda sobre la esquina superior derecha del área de
    // contenido (persistente: no la borra el re-render de cada diapositiva).
    document.querySelector('.me-body').appendChild(btn);
    function reflect() {
      btn.classList.toggle('is-on', AUTHOR);
      btn.setAttribute('aria-pressed', String(AUTHOR));
      btn.innerHTML = '<span class="me-author-dot" aria-hidden="true"></span>Modo autor: ' +
        (AUTHOR ? 'activado' : 'desactivado');
      btn.title = AUTHOR
        ? 'Navegación libre, sin reglas. Pulsa para probar el comportamiento real del curso.'
        : 'Se aplican las reglas reales del curso. Pulsa para volver a la navegación libre.';
    }
    btn.addEventListener('click', function () {
      AUTHOR = !AUTHOR;
      // Al pasar a modo real, el tiempo mínimo de la pantalla actual cuenta
      // desde ahora (si no, llevaría ya consumido el rato de edición previa).
      if (!AUTHOR) { screenEnter = Date.now(); startMinTimer(); }
      reflect();
      refreshMenuChecks();
      refreshNavState();
      A11Y.announce(AUTHOR
        ? 'Modo autor activado: navegación libre.'
        : 'Modo autor desactivado: se aplican las reglas del curso.');
    });
    reflect();
  }

  // Impresión: solo se imprime la pantalla actual (ver print/print.css). Las
  // interactividades informativas (desplegables, pestañas, tarjetas) ocultan
  // contenido tras un clic; al imprimir lo mostramos todo para que el papel sea
  // completo, y lo restauramos al terminar. Se engancha a los eventos nativos
  // beforeprint/afterprint, así funciona igual con el botón Imprimir y con Ctrl+P.
  function setupPrint() {
    var undo = [];
    global.addEventListener('beforeprint', function () {
      undo = [];
      var content = document.getElementById('me-content');
      if (!content) return;

      // Desplegables (accordion y línea de tiempo): abrir todos los apartados.
      content.querySelectorAll('.me-acc-head[aria-expanded="false"], .me-tl-head[aria-expanded="false"]').forEach(function (head) {
        head.setAttribute('aria-expanded', 'true');
        var body = document.getElementById(head.getAttribute('aria-controls'));
        if (body) body.hidden = false;
        undo.push(function () {
          head.setAttribute('aria-expanded', 'false');
          if (body) body.hidden = true;
        });
      });

      // Pestañas (tabs): mostrar todos los paneles, cada uno rotulado con el
      // título de su pestaña (el orden del DOM es tablist + paneles seguidos).
      content.querySelectorAll('[role=tabpanel]').forEach(function (panel) {
        var wasHidden = panel.hidden;
        panel.hidden = false;
        var tab = document.getElementById(panel.getAttribute('aria-labelledby') || '');
        var label = null;
        if (tab) {
          label = document.createElement('p');
          label.className = 'me-print-tablabel';
          label.textContent = tab.textContent;
          panel.parentNode.insertBefore(label, panel);
        }
        undo.push(function () {
          panel.hidden = wasHidden;
          if (label) label.remove();
        });
      });

      // Tarjetas (flip cards): con el volteo 3D ambas caras están siempre en el
      // DOM; el aplanado (anverso y reverso a la vez) lo hace print.css.
    });
    global.addEventListener('afterprint', function () {
      undo.forEach(function (fn) { fn(); });
      undo = [];
    });
  }

  // Ampliación de imágenes (lightbox) accesible. Funciona por delegación, así
  // que cubre cualquier imagen .me-zoomable renderada en cada pantalla.
  function setupLightbox() {
    if (document.getElementById('me-lightbox')) return;
    var lb = document.createElement('div');
    lb.id = 'me-lightbox';
    lb.className = 'me-lightbox';
    lb.hidden = true;
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Imagen ampliada');
    lb.innerHTML = '<button class="me-lightbox-close" aria-label="Cerrar (Esc)">✕</button><img class="me-lightbox-img" alt="">';
    document.body.appendChild(lb);
    var img = lb.querySelector('.me-lightbox-img');
    var lastFocus = null;

    function open(src, alt) {
      lastFocus = document.activeElement;
      img.src = src; img.alt = alt || '';
      lb.hidden = false;
      lb.querySelector('.me-lightbox-close').focus();
    }
    function close() {
      lb.hidden = true; img.removeAttribute('src');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('me-lightbox-close')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.hidden && e.key === 'Escape') close();
      else if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('me-zoomable')) {
        e.preventDefault(); open(e.target.getAttribute('src'), e.target.getAttribute('alt'));
      }
    });
    document.addEventListener('click', function (e) {
      var z = e.target.closest && e.target.closest('.me-zoomable');
      if (z) open(z.getAttribute('src'), z.getAttribute('alt'));
    });
  }

  // ---- Navegación --------------------------------------------------------
  function canNavigateTo(target) {
    if (AUTHOR) return true;
    var nav = (COURSE.scorm.rules || {}).navigation || 'mixed';
    if (nav === 'free') return true;
    if (target <= current) return true;            // volver atrás siempre
    if (nav === 'mixed') {
      // permitido si todas las pantallas previas obligatorias están "ok"
      for (var i = 0; i < target; i++) if (isRequired(i) && !screenSatisfied(i)) return false;
      return true;
    }
    // sequential: solo la siguiente y si la actual está satisfecha
    return target === current + 1 && screenSatisfied(current);
  }

  function goRelative(delta) {
    var t = current + delta;
    if (t < 0 || t >= SCREENS.length) return;
    if (delta > 0 && !AUTHOR && !screenSatisfied(current)) { A11Y.announce(blockReason(current)); return; }
    if (!canNavigateTo(t)) { A11Y.announce('Pantalla no disponible todavía.'); return; }
    goTo(t, false, true);
  }

  function goTo(idx, isRestore, fromNav) {
    saveTime();
    if (activeController) activeController = null;
    current = idx;
    screenEnter = Date.now();
    var entry = SCREENS[idx];
    // En la previsualización avisa al editor de la pantalla actual, para que al
    // volver a la pestaña «Editar» se sitúe en la misma diapositiva (test final
    // excluido). Depende de estar en la Vista estudiante (__AUTHOR_MODE__), no
    // del conmutador de modo autor: sigue sincronizando aunque se desactive.
    if (global.__AUTHOR_MODE__ && entry.screen && !entry.isFinalTest && !entry.isResults && global.parent && global.parent !== global) {
      try { global.parent.postMessage({ type: 'me-screen-change', screenId: entry.screen.id }, '*'); } catch (e) {}
    }
    var content = document.getElementById('me-content');

    if (entry.isResults) {
      renderResults(content);
    } else if (entry.isFinalTest) {
      renderFinalTest(content, entry.screen);
    } else {
      var sc = entry.screen;
      var ctx = {
        state: (STATE.interactions[sc.interaction ? sc.interaction.id : ''] || null),
        save: function (st) {
          if (!sc.interaction) return;
          STATE.interactions[sc.interaction.id] = st;
          var r = activeController ? activeController.result() : null;
          if (r) STATE.results[sc.interaction.id] = r;
          recomputeAndPersist();
          refreshNavState();
        },
        announce: A11Y.announce,
        // La etiqueta «Evaluable» solo tiene sentido si las actividades cuentan
        // para la nota; con score_source 'final_test' puntúa solo el test final.
        showScoredBadge: (COURSE.scorm.rules || {}).score_source !== 'final_test',
      };
      var rendered = Renderer.render(content, sc, ctx);
      activeController = rendered.interaction;
      applyReveal(sc.id, content);
      // Captura el estado inicial. Las de exploración (accordion, tabs,
      // flip_cards, timeline, flashcards) devuelven completed solo cuando se ha
      // visto TODO su contenido; video, case_practice y html_embed se consideran
      // completadas al renderizarse. Las evaluables devuelven completed:false
      // hasta que el usuario las resuelve. No se sobrescribe un resultado ya
      // guardado (reanudación de sesión).
      if (activeController && sc.interaction && !STATE.results[sc.interaction.id]) {
        STATE.results[sc.interaction.id] = activeController.result();
      }
    }

    markVisited(idx);
    playCurrentNarration();
    updateProgress();
    refreshMenuChecks();
    refreshNavState();
    document.getElementById('me-position').textContent = (idx + 1) + ' / ' + SCREENS.length;
    // Al navegar con Anterior/Siguiente, si el menú lateral está visible el foco
    // se mueve al tema actual del menú (para orientarse en el índice); si no,
    // al contenido. En restauración no se roba el foco.
    if (!isRestore) {
      if (fromNav && menuVisible()) focusCurrentMenuLink();
      else A11Y.focusMain();
    }
    recomputeAndPersist();
    startMinTimer();
  }

  function startMinTimer() {
    refreshNavState();
    var entry = SCREENS[current];
    var min = entry.isFinalTest ? 0 : (entry.screen.min_time_seconds || 0);
    if (min > 0) {
      setTimeout(function () { refreshNavState(); }, min * 1000 + 100);
    }
  }

  // ---- Reglas de "pantalla satisfecha" -----------------------------------
  function isRequired(idx) {
    var e = SCREENS[idx];
    return e.isFinalTest ? true : !!e.screen.required;
  }
  function minTimeOk(idx) {
    var e = SCREENS[idx];
    if (e.isFinalTest) return true;
    var min = e.screen.min_time_seconds || 0;
    if (min <= 0) return true;
    if (idx !== current) return true; // ya pasada
    return (Date.now() - screenEnter) / 1000 >= min;
  }
  function interactionOk(idx) {
    var e = SCREENS[idx];
    if (e.isFinalTest) return !!STATE.results.__final__;
    var sc = e.screen;
    if (!sc.interaction) return true;
    if (!(COURSE.scorm.rules || {}).require_interactions) return true;
    var r = STATE.results[sc.interaction.id];
    return !!(r && r.completed);
  }
  function screenSatisfied(idx) {
    if (!isRequired(idx)) return true;
    return minTimeOk(idx) && interactionOk(idx);
  }
  function blockReason(idx) {
    if (!minTimeOk(idx)) return 'Permanece un poco más en esta pantalla antes de continuar.';
    if (!interactionOk(idx)) return 'Completa la actividad de esta pantalla para continuar.';
    return 'Pantalla no disponible.';
  }

  function markVisited(idx) {
    var e = SCREENS[idx];
    STATE.visited[e.screen.id] = true;
  }

  // ---- Progreso y finalización -------------------------------------------
  function requiredScreens() {
    return SCREENS.filter(function (_, i) { return isRequired(i) && SCREENS[i].screen.scorm && SCREENS[i].screen.scorm.counts_for_completion !== false; });
  }
  function updateProgress() {
    var total = SCREENS.length;
    var visited = SCREENS.filter(function (e) { return STATE.visited[e.screen.id]; }).length;
    var donePct = total ? Math.round((visited / total) * 100) : 0;   // completado (tono tenue)
    var posPct = total ? Math.round(((current + 1) / total) * 100) : 0; // posición actual (tono sólido)
    var bar = document.getElementById('me-progress-bar');
    bar.style.width = posPct + '%';
    document.getElementById('me-progress-done').style.width = donePct + '%';
    bar.parentElement.setAttribute('aria-valuenow', String(donePct));
  }

  function computeScore() {
    var rules = COURSE.scorm.rules || {};
    var src = rules.score_source || 'final_test';
    var got = 0, max = 0;
    function addResult(r) { if (r && r.scored) { got += r.score || 0; max += r.maxScore || 0; } }
    if (src === 'final_test') {
      var fr = STATE.results.__final__;
      if (fr) { got = fr.score; max = fr.maxScore; }
    } else if (src === 'unit_tests') {
      SCREENS.forEach(function (e) { if (!e.isFinalTest && e.screen.interaction) addResult(STATE.results[e.screen.interaction.id]); });
    } else { // mixed: media PONDERADA entre práctica y test final (no por puntos).
      // Cada bloque se normaliza a su propio % y se combinan con `mixed_final_weight`.
      var pg = 0, pm = 0;
      SCREENS.forEach(function (e) {
        if (e.isFinalTest || !e.screen.interaction) return;
        var r = STATE.results[e.screen.interaction.id];
        if (r && r.scored) { pg += r.score || 0; pm += r.maxScore || 0; }
      });
      var f = STATE.results.__final__;
      var practicePct = pm > 0 ? (pg / pm) * 100 : null;
      var finalPct = (f && f.maxScore > 0) ? (f.score / f.maxScore) * 100 : null;
      var w = Math.min(100, Math.max(0, rules.mixed_final_weight == null ? 70 : rules.mixed_final_weight)) / 100;
      if (practicePct != null && finalPct != null) return Math.round(finalPct * w + practicePct * (1 - w));
      if (finalPct != null) return Math.round(finalPct);
      if (practicePct != null) return Math.round(practicePct);
      return 0;
    }
    return max > 0 ? Math.round((got / max) * 100) : 0;
  }

  function evaluateCompletion() {
    var rules = COURSE.scorm.rules || {};
    var req = requiredScreens();
    var seenReq = req.filter(function (e) { return STATE.visited[e.screen.id]; }).length;
    var pctSeen = req.length ? (seenReq / req.length) * 100 : 100;
    var screensOk = pctSeen >= (rules.min_required_screens_pct || 100);

    var interactionsOk = true;
    if (rules.require_interactions) {
      SCREENS.forEach(function (e, i) {
        if (!e.isFinalTest && isRequired(i) && e.screen.interaction) {
          var r = STATE.results[e.screen.interaction.id];
          if (!(r && r.completed)) interactionsOk = false;
        }
      });
    }

    var score = computeScore();
    STATE.finalScore = score;
    var hasScoredContent = (function () {
      if ((rules.score_source) === 'final_test') return !!(COURSE.assessments && COURSE.assessments.final_test && COURSE.assessments.final_test.questions.length);
      return SCREENS.some(function (e) { return e.screen.interaction && e.screen.interaction.scored; });
    })();
    var scoreOk = !hasScoredContent || score >= (rules.min_score || 0);

    SCORM.setScore(score, 0, 100);

    var status;
    if (!screensOk || !interactionsOk) status = 'incomplete';
    else if (hasScoredContent) status = scoreOk ? 'passed' : 'failed';
    else status = 'completed';
    SCORM.setStatus(status);
    return status;
  }

  function recomputeAndPersist() {
    evaluateCompletion();
    persist();
  }

  // ---- Chrome / paneles --------------------------------------------------
  function toggleMenu() {
    document.getElementById('me-app').classList.toggle('me-menu-hidden');
    reflectMenuUI();
  }
  // Sincroniza los dos controles de plegado del índice (botón ☰ de la barra
  // superior y pestaña lateral): aria-expanded y sentido de la flecha.
  function reflectMenuUI() {
    var visible = menuVisible();
    document.getElementById('me-toggle-menu').setAttribute('aria-expanded', String(visible));
    var tab = document.getElementById('me-menu-tab');
    tab.setAttribute('aria-expanded', String(visible));
    tab.querySelector('.me-menu-tab-arrow').innerHTML = global.MEIcons.svg(visible ? 'chevron-left' : 'chevron-right');
  }
  // ---- Pantalla completa ---------------------------------------------------
  // Botón de la cabecera que pone el curso a pantalla completa (Fullscreen API,
  // con fallback webkit para navegadores/LMS antiguos). Si el entorno no lo
  // permite (p. ej. un iframe de LMS sin allowfullscreen, o iPhone), el botón
  // permanece oculto: nunca se muestra un control muerto.
  function fullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }
  function setupFullscreen() {
    var btn = document.getElementById('me-btn-fullscreen');
    var root = document.documentElement;
    var supported = (document.fullscreenEnabled || document.webkitFullscreenEnabled) &&
      (root.requestFullscreen || root.webkitRequestFullscreen);
    if (!supported) return;
    btn.hidden = false;
    btn.addEventListener('click', function () {
      if (fullscreenElement()) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } else {
        var p = (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
        if (p && p.catch) p.catch(function () {});
      }
    });
    // El estado puede cambiar también por Esc o por el propio navegador: el
    // icono/etiqueta se sincronizan en el evento, no en el clic.
    document.addEventListener('fullscreenchange', reflectFullscreenButton);
    document.addEventListener('webkitfullscreenchange', reflectFullscreenButton);
  }
  function reflectFullscreenButton() {
    var btn = document.getElementById('me-btn-fullscreen');
    var on = !!fullscreenElement();
    btn.querySelector('[data-icon]').innerHTML = global.MEIcons.svg(on ? 'minimize' : 'maximize');
    var label = on ? 'Salir de pantalla completa' : 'Pantalla completa';
    btn.title = label;
    btn.setAttribute('aria-label', label);
  }

  function toggleTranscript() {
    var entry = SCREENS[current];
    var t = entry && !entry.isFinalTest ? entry.screen.transcript : '';
    if (!t) { A11Y.announce('Esta pantalla no tiene transcripción.'); return; }
    openModalHtml('Transcripción', '<div class="me-prose">' + Renderer.mdToHtml(t) + '</div>');
  }

  // ---- Locución de la diapositiva ----------------------------------------
  // Elemento <audio> oculto que el renderer inyecta en la pantalla actual.
  function currentNarration() {
    return document.querySelector('#me-content .me-narration-audio');
  }
  // Reproduce la locución de la pantalla actual desde el principio (si está
  // activada). El navegador puede bloquear el autoplay hasta que haya una
  // interacción del usuario: en ese caso se ignora el rechazo silenciosamente.
  function playCurrentNarration() {
    var a = currentNarration();
    if (!a) return;
    if (!audioEnabled) { a.pause(); return; }
    try { a.currentTime = 0; } catch (e) {}
    var p = a.play();
    if (p && p.catch) p.catch(function () {});
  }
  function reflectAudioButton() {
    var btn = document.getElementById('me-btn-audio');
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(audioEnabled));
    btn.classList.toggle('is-on', audioEnabled);
    btn.querySelector('.me-tool-ico').innerHTML = global.MEIcons.svg(audioEnabled ? 'volume-on' : 'volume-off');
  }
  function toggleAudio() {
    audioEnabled = !audioEnabled;
    try { if (global.localStorage) localStorage.setItem('me-audio-enabled', audioEnabled ? '1' : '0'); } catch (e) {}
    reflectAudioButton();
    if (audioEnabled) { playCurrentNarration(); A11Y.announce('Audio activado.'); }
    else { var a = currentNarration(); if (a) a.pause(); A11Y.announce('Audio desactivado.'); }
  }
  function openModal(which) {
    if (which === 'glossary') {
      var g = (COURSE.glossary || []).map(function (t) { return '<dt>' + esc(t.term) + '</dt><dd>' + esc(t.definition) + '</dd>'; }).join('');
      openModalHtml(glossaryTitle(), g ? '<dl class="me-glossary">' + g + '</dl>' : '<p>Glosario vacío.</p>');
    } else if (which === 'resources') {
      var b = (COURSE.bibliography || []).map(function (e) {
        return '<li>' + esc(e.ref) + (e.url ? ' — <a href="' + esc(e.url) + '" target="_blank" rel="noopener">enlace</a>' : '') + '</li>';
      }).join('');
      openModalHtml(bibliographyTitle(), b ? '<ul>' + b + '</ul>' : '<p>Sin recursos.</p>');
    } else if (which === 'help') {
      openModalHtml('Ayuda', '<ul><li><strong>Alt + →</strong> Siguiente</li><li><strong>Alt + ←</strong> Anterior</li><li><strong>Alt + M</strong> Menú</li><li><strong>Alt + T</strong> Transcripción</li></ul><p>Usa Tab para navegar por los controles.</p>');
    }
  }
  function openModalHtml(title, bodyHtml) {
    var modal = document.getElementById('me-modal');
    modal.querySelector('.me-modal-title').textContent = title;
    modal.querySelector('.me-modal-body').innerHTML = bodyHtml;
    modal.hidden = false;
    modal.querySelector('.me-modal-close').focus();
  }
  function closeModals() { document.getElementById('me-modal').hidden = true; A11Y.focusMain(); }

  function refreshNavState() {
    var prev = document.getElementById('me-prev');
    var next = document.getElementById('me-next');
    prev.disabled = current <= 0;
    var last = current >= SCREENS.length - 1;
    next.disabled = last || (!AUTHOR && !screenSatisfied(current));
    next.textContent = last ? 'Fin' : 'Siguiente ▸';
  }
  // El menú lateral está visible cuando #me-app NO lleva la clase me-menu-hidden
  // (cubre tanto el plegado de escritorio como el slide-over cerrado en móvil).
  function menuVisible() {
    return !document.getElementById('me-app').classList.contains('me-menu-hidden');
  }
  // Lleva el foco al tema actual del menú lateral y lo hace visible en el scroll.
  function focusCurrentMenuLink() {
    var link = document.querySelector('.me-menu-link.is-current');
    if (!link) { A11Y.focusMain(); return; }
    link.focus();
    if (link.scrollIntoView) link.scrollIntoView({ block: 'nearest' });
  }

  function refreshMenuChecks() {
    document.querySelectorAll('.me-menu-link').forEach(function (b) {
      var i = parseInt(b.getAttribute('data-idx'), 10);
      var e = SCREENS[i];
      var done = STATE.visited[e.screen.id] && screenSatisfied(i);
      b.classList.toggle('is-done', !!done);
      b.classList.toggle('is-current', i === current);
      var chk = b.querySelector('.me-menu-check');
      if (chk) chk.textContent = done ? '✓' : '';
    });
    // Contador «hechas/total» y mini-barra de progreso de cada unidad.
    document.querySelectorAll('.me-menu-unit[data-count]').forEach(function (unit) {
      var start = parseInt(unit.getAttribute('data-start'), 10);
      var count = parseInt(unit.getAttribute('data-count'), 10);
      var done = 0;
      for (var i = start; i < start + count; i++) {
        var e = SCREENS[i];
        if (e && STATE.visited[e.screen.id] && screenSatisfied(i)) done++;
      }
      var c = unit.querySelector('.me-menu-count');
      if (c) c.textContent = done + '/' + count;
      var f = unit.querySelector('.me-menu-uprog-fill');
      if (f) f.style.width = (count ? Math.round((done / count) * 100) : 0) + '%';
    });
  }

  // ---- Test final --------------------------------------------------------
  function renderFinalTest(content, screen) {
    var test = COURSE.assessments.final_test;
    var saved = STATE.finalAnswers || {};
    var allowed = (COURSE.scorm.rules || {}).attempts_allowed || 0;
    var attemptsUsed = STATE.attempts || 0;
    var exhausted = allowed > 0 && attemptsUsed >= allowed;

    var html = '<article class="me-screen"><h1>' + esc(screen.title) + '</h1>' +
      '<p class="me-instructions">Responde a todas las preguntas y pulsa «Enviar test».' +
      (allowed > 0 ? ' Intentos: ' + Math.min(attemptsUsed, allowed) + '/' + allowed + '.' : '') + '</p><form id="me-final">';
    (test.questions || []).forEach(function (q, qi) {
      html += '<fieldset class="me-q"><legend>' + (qi + 1) + '. ' + rich(q.prompt) + '</legend>';
      (q.options || []).forEach(function (o) {
        var checked = saved[q.id] === o.id ? ' checked' : '';
        html += '<label class="me-choice"><input type="radio" name="q-' + esc(q.id) + '" value="' + esc(o.id) + '"' + checked + (exhausted ? ' disabled' : '') + '> <span>' + rich(o.text) + '</span></label>';
      });
      html += '<div class="me-feedback" data-q="' + esc(q.id) + '" role="status" aria-live="polite" hidden></div></fieldset>';
    });
    html += '<button type="submit" class="me-btn me-primary"' + (exhausted ? ' disabled' : '') + '>Enviar test</button>' +
      '</form><div id="me-final-result" aria-live="polite"></div></article>';
    content.innerHTML = html;

    // Pinta el feedback por pregunta y la nota a partir de un mapa de respuestas.
    function paint(answers) {
      var got = 0, max = 0;
      (test.questions || []).forEach(function (q) {
        max += q.points || 1;
        var chosen = answers[q.id];
        var box = content.querySelector('.me-feedback[data-q="' + q.id + '"]');
        if (chosen != null) {
          var opt = (q.options || []).filter(function (o) { return o.id === chosen; })[0];
          var ok = !!(opt && opt.correct);
          if (ok) got += q.points || 1;
          box.className = 'me-feedback ' + (ok ? 'is-ok' : 'is-error');
          box.innerHTML = '<strong>' + (ok ? '✔ ' : '✖ ') + rich(ok ? q.feedback.correct : q.feedback.incorrect) + '</strong>' +
            (q.feedback.explanation ? '<p class="me-expl">' + rich(q.feedback.explanation) + '</p>' : '');
          box.hidden = false;
        }
      });
      var score = max ? Math.round((got / max) * 100) : 0;
      var pass = score >= (test.pass_score || 60);
      document.getElementById('me-final-result').innerHTML =
        '<div class="me-feedback ' + (pass ? 'is-ok' : 'is-error') + '"><strong>Puntuación: ' + score + '% — ' + (pass ? 'APTO' : 'NO APTO') + '</strong></div>';
      return { got: got, max: max, score: score, pass: pass };
    }

    // Restaura el resultado si ya se había enviado (mismo intento u otra sesión).
    if (STATE.results.__final__ && Object.keys(saved).length) paint(saved);

    document.getElementById('me-final').addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (exhausted) return;
      var answers = {}, answered = 0;
      (test.questions || []).forEach(function (q) {
        var sel = content.querySelector('input[name="q-' + q.id + '"]:checked');
        if (sel) { answers[q.id] = sel.value; answered++; }
      });
      if (answered < (test.questions || []).length) { A11Y.announce('Responde a todas las preguntas.'); return; }

      var res = paint(answers);
      STATE.attempts = attemptsUsed = (STATE.attempts || 0) + 1;
      STATE.finalAnswers = answers;
      STATE.results.__final__ = { completed: true, scored: true, correct: res.pass, score: res.got, maxScore: res.max };
      A11Y.announce('Puntuación ' + res.score + ' por ciento. ' + (res.pass ? 'Apto.' : 'No apto.'));

      if (allowed > 0 && attemptsUsed >= allowed) {
        content.querySelector('button[type=submit]').disabled = true;
        content.querySelectorAll('#me-final input').forEach(function (i) { i.disabled = true; });
      }
      recomputeAndPersist();
      refreshMenuChecks();
      refreshNavState();
    });
  }

  // Pantalla final de resultados: nota, APTO/NO APTO y desglose de calificaciones.
  function renderResults(content) {
    var rules = COURSE.scorm.rules || {};
    var status = evaluateCompletion();      // actualiza SCORM + STATE.finalScore
    var score = STATE.finalScore;
    var src = rules.score_source || 'final_test';
    var ft = COURSE.assessments && COURSE.assessments.final_test;
    var min = rules.min_score || (ft && ft.pass_score) || 0;
    var incomplete = status === 'incomplete';
    var pass = status === 'passed';
    function pct(g, m) { return m ? Math.round((g / m) * 100) : 0; }

    var rows = [];
    if (ft && (ft.questions || []).length && (src === 'final_test' || src === 'mixed')) {
      var fr = STATE.results.__final__;
      rows.push({ label: ft.title || 'Test final',
        detail: fr ? (fr.score + '/' + fr.maxScore + ' (' + pct(fr.score, fr.maxScore) + '%)') : 'Sin realizar' });
    }
    if (src === 'unit_tests' || src === 'mixed') {
      SCREENS.forEach(function (e) {
        if (e.isFinalTest || e.isResults) return;
        var it = e.screen.interaction;
        if (it && it.scored) {
          var r = STATE.results[it.id];
          rows.push({ label: e.screen.title || 'Actividad',
            detail: r ? (r.correct ? '✔ Correcta' : '✖ Incorrecta') : 'Sin responder' });
        }
      });
    }

    var cls = incomplete ? 'is-warn' : (pass ? 'is-ok' : 'is-error');
    var estado = incomplete ? '⚠ Curso incompleto' : (pass ? '✔ APTO' : '✖ NO APTO');
    var html = '<article class="me-screen me-screen-results"><h1>Resultados</h1>' +
      '<div class="me-result-hero ' + cls + '">' +
      '<div class="me-result-score" aria-label="' + score + '%">' + score + '%</div>' +
      '<div class="me-result-state">' + estado + '</div>' +
      '<div class="me-result-min">Nota mínima para aprobar: ' + min + '%</div></div>';
    if (rows.length) {
      html += '<table class="me-result-table"><caption>Desglose de calificaciones</caption><tbody>';
      rows.forEach(function (r) {
        html += '<tr><th scope="row">' + esc(r.label) + '</th><td>' + esc(r.detail) + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    if (incomplete) html += '<p class="me-instructions">Completa todas las pantallas y actividades requeridas para obtener la calificación final.</p>';
    html += '</article>';
    content.innerHTML = html;

    // Refuerzo del logro: la nota sube animada y, si está APTO, confeti (una
    // vez por sesión). Con prefers-reduced-motion no se anima nada.
    var scoreEl = content.querySelector('.me-result-score');
    if (scoreEl) animateNumber(scoreEl, score, '%');
    if (pass && !incomplete) celebrate();
  }

  function prefersReducedMotion() {
    return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // ---- Revelado progresivo del contenido (shell.motion = 'rich') -----------
  // Primera visita a una pantalla: los bloques visibles entran en cascada
  // (delays cortos, con tope) y los que quedan bajo el pliegue aparecen al
  // hacer scroll (IntersectionObserver). El alumno marca el ritmo con su
  // scroll: NUNCA se retiene contenido por temporizador. Pantallas ya vistas
  // en la sesión no se re-animan. Sin IntersectionObserver (navegador muy
  // antiguo) todo se muestra al instante. El contenido siempre está en el DOM
  // (solo opacity/transform): lectores de pantalla e impresión intactos.
  var MOTION = 'subtle';
  var SPEED = 1.5; // multiplicador de shell.motion_speed (fast 1 / normal 1.5 / slow 3)
  var REVEALED = {};
  var revealObserver = null;

  function applyReveal(screenId, content) {
    if (revealObserver) { revealObserver.disconnect(); revealObserver = null; }
    if (MOTION !== 'rich' || prefersReducedMotion() || REVEALED[screenId]) return;
    REVEALED[screenId] = true;
    var blocks = [].slice.call(content.querySelectorAll(
      '.me-prose > *, .me-media, .me-interaction, .me-transcript'));
    if (!blocks.length) return;
    var fold = content.getBoundingClientRect().bottom;
    var delay = 0;
    var below = [];
    blocks.forEach(function (b) {
      if (b.getBoundingClientRect().top < fold) {
        b.classList.add('me-rv');
        b.style.animationDelay = Math.round(Math.min(delay, 560 * SPEED)) + 'ms'; // tope de cascada
        delay += 70 * SPEED;
      } else {
        below.push(b);
      }
    });
    if (!below.length || !('IntersectionObserver' in global)) return;
    below.forEach(function (b) { b.classList.add('me-rv-wait'); });
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.remove('me-rv-wait');
        en.target.classList.add('me-rv');
        revealObserver.unobserve(en.target);
      });
    }, { root: content, rootMargin: '0px 0px -8% 0px' });
    below.forEach(function (b) { revealObserver.observe(b); });
  }

  // Cuenta de 0 al valor final con easing (para la nota de Resultados).
  function animateNumber(el, target, suffix) {
    if (prefersReducedMotion()) { el.textContent = target + suffix; return; }
    var t0 = null, dur = 900;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) global.requestAnimationFrame(step);
    }
    global.requestAnimationFrame(step);
  }

  // Confeti ligero propio (canvas efímero, paleta corporativa, sin dependencias).
  var celebrated = false;
  function celebrate() {
    if (celebrated || prefersReducedMotion() || MOTION === 'none') return;
    celebrated = true;
    var canvas = document.createElement('canvas');
    canvas.className = 'me-confetti';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.width = global.innerWidth;
    canvas.height = global.innerHeight;
    document.body.appendChild(canvas);
    var c2d = canvas.getContext('2d');
    if (!c2d) { canvas.remove(); return; }
    var colors = ['#6DC3C0', '#F4C910', '#7787BF', '#F4D6D2'];
    var parts = [];
    for (var i = 0; i < 120; i++) {
      parts.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        w: 6 + Math.random() * 5, h: 8 + Math.random() * 6,
        vx: -1.2 + Math.random() * 2.4, vy: 2 + Math.random() * 3,
        rot: Math.random() * Math.PI, vr: -0.12 + Math.random() * 0.24,
        color: colors[i % colors.length],
      });
    }
    var t0 = Date.now(), DURATION = 2400;
    function frame() {
      var elapsed = Date.now() - t0;
      c2d.clearRect(0, 0, canvas.width, canvas.height);
      c2d.globalAlpha = elapsed > DURATION - 500 ? Math.max(0, (DURATION - elapsed) / 500) : 1;
      parts.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        c2d.save();
        c2d.translate(p.x, p.y);
        c2d.rotate(p.rot);
        c2d.fillStyle = p.color;
        c2d.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        c2d.restore();
      });
      if (elapsed < DURATION) global.requestAnimationFrame(frame);
      else canvas.remove();
    }
    global.requestAnimationFrame(frame);
  }

  // ---- Tiempo / cierre ---------------------------------------------------
  function saveTime() {}
  var sessionFinished = false;
  function finishSession() {
    if (sessionFinished) return; // puede llegar por pagehide Y beforeunload
    sessionFinished = true;
    var secs = Math.round((Date.now() - sessionStart) / 1000);
    SCORM.setSessionTime(secs);
    // Si se cierra antes de cargar el curso no hay nada que evaluar.
    var status = COURSE ? evaluateCompletion() : SCORM.getStatus();
    // Salida sin terminar → exit=suspend para que LMS estrictos conserven el
    // intento y permitan reanudar (salvo que el curso desactive allow_resume).
    var rules = (COURSE && COURSE.scorm && COURSE.scorm.rules) || {};
    SCORM.setExit(status === 'incomplete' && rules.allow_resume !== false ? 'suspend' : '');
    SCORM.finish();
  }

  var esc = function (s) { return global.Interactions.esc(s); };
  var rich = function (s) { return global.Interactions.rich(s); };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
