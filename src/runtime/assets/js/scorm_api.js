/* =============================================================================
 * scorm_api.js — Wrapper SCORM 1.2 autocontenido (sin dependencias)
 * Compatible con Moodle. Busca la API en window.parent / opener.
 * Expone window.SCORM con una API de alto nivel usada por app.js.
 * Si no encuentra LMS, entra en MODO STANDALONE (logs en consola) para que la
 * carcasa sea probable fuera de Moodle (vista estudiante del editor).
 * ===========================================================================*/
(function (global) {
  'use strict';

  var api = null;
  var initialized = false;
  var standalone = false;
  var mode = 'normal'; // cmi.core.lesson_mode: normal | review | browse
  var store = {}; // espejo local de cmi.*

  // --- Localización de la API del LMS (recorre frames hasta 7 niveles) -------
  function findAPI(win) {
    var tries = 0;
    while (win.API == null && win.parent != null && win.parent !== win && tries < 7) {
      tries++;
      win = win.parent;
    }
    return win.API || null;
  }
  function getAPI() {
    var theAPI = null;
    if (global.parent && global.parent !== global) theAPI = findAPI(global.parent);
    if (theAPI == null && global.opener) theAPI = findAPI(global.opener);
    return theAPI;
  }

  function log() {
    if (global.console && console.log) {
      console.log.apply(console, ['[SCORM]'].concat([].slice.call(arguments)));
    }
  }

  var SCORM = {
    isStandalone: function () { return standalone; },

    initialize: function () {
      if (initialized) return true;
      api = getAPI();
      if (api == null) {
        standalone = true;
        initialized = true;
        log('API no encontrada → modo STANDALONE (sin LMS).');
        return true;
      }
      var ok = api.LMSInitialize('') === 'true';
      initialized = ok;
      if (!ok) log('LMSInitialize falló:', this.lastError());
      // En modo review/browse el alumno repasa contenido ya calificado: no se
      // sobreescriben estado, nota ni progreso (ver guardas en los setters).
      if (ok) {
        mode = this.get('cmi.core.lesson_mode') || 'normal';
        if (mode !== 'normal') log('lesson_mode=' + mode + ' → tracking en solo lectura.');
      }
      return ok;
    },

    /** true si el LMS abrió el SCO en modo repaso (review/browse). */
    isReview: function () { return mode === 'review' || mode === 'browse'; },

    get: function (key) {
      if (!initialized) return '';
      if (standalone) return store[key] != null ? store[key] : '';
      var v = api.LMSGetValue(key);
      var err = this.lastErrorCode();
      if (err !== '0' && err !== '403') log('LMSGetValue(' + key + ') error', err, this.lastError());
      return v;
    },

    set: function (key, value) {
      if (!initialized) return false;
      if (standalone) { store[key] = String(value); return true; }
      var ok = api.LMSSetValue(key, String(value)) === 'true';
      if (!ok) log('LMSSetValue(' + key + ') falló:', this.lastError());
      return ok;
    },

    commit: function () {
      if (!initialized || standalone) return true;
      var ok = api.LMSCommit('') === 'true';
      if (!ok) log('LMSCommit falló:', this.lastError());
      return ok;
    },

    finish: function () {
      if (!initialized) return true;
      if (standalone) { initialized = false; return true; }
      this.commit();
      var ok = api.LMSFinish('') === 'true';
      initialized = false;
      return ok;
    },

    lastErrorCode: function () { return standalone ? '0' : (api ? api.LMSGetLastError() : '0'); },
    lastError: function () {
      if (standalone || !api) return '';
      var code = api.LMSGetLastError();
      return code + ' ' + api.LMSGetErrorString(code) + ' ' + api.LMSGetDiagnostic(code);
    },

    // --- Helpers de alto nivel -------------------------------------------
    // Los setters de tracking son no-op en modo review/browse: el intento ya
    // está calificado y el repaso no debe alterarlo.
    getStatus: function () { return this.get('cmi.core.lesson_status') || 'not attempted'; },
    setStatus: function (s) { if (!this.isReview()) this.set('cmi.core.lesson_status', s); },
    setScore: function (raw, min, max) {
      if (this.isReview()) return;
      this.set('cmi.core.score.raw', Math.round(raw));
      if (min != null) this.set('cmi.core.score.min', min);
      if (max != null) this.set('cmi.core.score.max', max);
    },
    getLocation: function () { return this.get('cmi.core.lesson_location'); },
    setLocation: function (loc) { if (!this.isReview()) this.set('cmi.core.lesson_location', loc); },

    // Cómo registra el LMS la salida: 'suspend' conserva el intento para
    // reanudarlo; '' (vacío) lo da por cerrado. Moodle es permisivo, pero
    // otros LMS descartan el progreso si no se marca suspend.
    setExit: function (v) { if (!this.isReview()) this.set('cmi.core.exit', v); },

    getSuspend: function () {
      var raw = this.get('cmi.suspend_data');
      if (!raw) return {};
      try { return JSON.parse(raw); } catch (e) { log('suspend_data corrupto'); return {}; }
    },
    setSuspend: function (obj) {
      if (this.isReview()) return;
      try { this.set('cmi.suspend_data', JSON.stringify(obj)); } catch (e) { log('No se pudo serializar suspend_data'); }
    },

    // Formatea segundos a CMITimespan HHHH:MM:SS.SS
    setSessionTime: function (totalSeconds) {
      var h = Math.floor(totalSeconds / 3600);
      var m = Math.floor((totalSeconds % 3600) / 60);
      var s = (totalSeconds % 60).toFixed(2);
      function pad(n) { return (n < 10 ? '0' : '') + n; }
      this.set('cmi.core.session_time', pad(h) + ':' + pad(m) + ':' + (s < 10 ? '0' + s : s));
    },
  };

  global.SCORM = SCORM;
})(window);
