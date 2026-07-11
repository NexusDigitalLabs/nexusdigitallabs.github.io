/**
 * NDL Game State — Centralized username gate and score persistence.
 * Self-contained IIFE. No dependencies. Exposes window.NDLGameState.
 *
 * Usage on any game page:
 *   <script src="/components/game-state.js"></script>
 *   NDLGameState.requireUsername(function(name) { startGame(name); });
 */
(function () {
  'use strict';

  /* ── Storage keys ──────────────────────────────────────────────── */
  var KEYS = {
    username : 'ndl_game_username',
    scores   : 'ndl_game_scores',
  };

  /* ── Storage helpers (swallow quota / private-mode errors) ──────── */
  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; } catch (e) { return null; }
  }
  function writeJSON(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
  }
  function readStr(key) {
    try { return localStorage.getItem(key) || null; } catch (e) { return null; }
  }
  function writeStr(key, val) {
    try { localStorage.setItem(key, val); } catch (e) {}
  }

  /* ═══════════════════════════════════════════════════════════════════
   * USERNAME
   * ═══════════════════════════════════════════════════════════════════ */

  /** @returns {string|null} */
  function getUsername() { return readStr(KEYS.username); }

  /**
   * Persist a username. If raw is blank, generates Player_XXXX.
   * @param {string} raw
   * @returns {string}
   */
  function setUsername(raw) {
    var name = (raw || '').trim().replace(/[<>&"]/g, '').slice(0, 20);
    if (!name) name = 'Player_' + (1000 + Math.floor(Math.random() * 8999));
    writeStr(KEYS.username, name);
    return name;
  }

  /** Clear stored username (allows re-gate) */
  function clearUsername() {
    try { localStorage.removeItem(KEYS.username); } catch (e) {}
  }

  /* ═══════════════════════════════════════════════════════════════════
   * SCORES
   * ═══════════════════════════════════════════════════════════════════
   * Storage shape: { [gameId]: { [username]: highScore } }
   */

  function _allScores() { return readJSON(KEYS.scores) || {}; }
  function _saveAll(data) { writeJSON(KEYS.scores, data); }

  /**
   * Save a score if it beats the current personal best.
   * @param {string} gameId
   * @param {number} score
   */
  function saveScore(gameId, score) {
    var user = getUsername();
    if (!user || !score || score <= 0) return;
    var all = _allScores();
    if (!all[gameId]) all[gameId] = {};
    if (score > (all[gameId][user] || 0)) {
      all[gameId][user] = score;
      _saveAll(all);
    }
  }

  /**
   * @param {string} gameId
   * @returns {number}
   */
  function getHighScore(gameId) {
    var user = getUsername();
    if (!user) return 0;
    var all = _allScores();
    return (all[gameId] && all[gameId][user]) || 0;
  }

  /**
   * Top-N leaderboard for a game.
   * @param {string} gameId
   * @param {number} [limit=5]
   * @returns {Array<{name:string, score:number, isMe:boolean}>}
   */
  function getLeaderboard(gameId, limit) {
    var me  = getUsername();
    var all = _allScores();
    var entries = Object.keys(all[gameId] || {}).map(function (name) {
      return { name: name, score: all[gameId][name], isMe: name === me };
    });
    return entries
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, limit || 5);
  }

  /* ═══════════════════════════════════════════════════════════════════
   * USERNAME GATE OVERLAY
   * ═══════════════════════════════════════════════════════════════════ */

  /**
   * If a username is already stored, calls callback immediately.
   * Otherwise renders a modal gate and calls callback after submission.
   * @param {function(string):void} callback
   */
  function requireUsername(callback) {
    var existing = getUsername();
    if (existing) { callback(existing); return; }
    _injectGate(callback);
  }

  function _injectGate(callback) {
    /* Inject gate stylesheet once */
    if (!document.getElementById('ndl-gate-css')) {
      var st = document.createElement('style');
      st.id = 'ndl-gate-css';
      st.textContent = [
        '#ndl-gate{position:fixed;inset:0;background:rgba(15,23,42,0.88);z-index:99999;',
          'display:flex;align-items:center;justify-content:center;padding:1rem;',
          'font-family:"Inter",ui-sans-serif,system-ui,sans-serif;}',
        '#ndl-gate-card{background:#fff;border:1px solid #e2e8f0;padding:2.5rem;',
          'width:100%;max-width:380px;}',
        '#ndl-gate-eyebrow{font-size:0.6875rem;font-weight:700;letter-spacing:0.1em;',
          'text-transform:uppercase;color:#94a3b8;margin:0 0 0.5rem;}',
        '#ndl-gate-title{font-size:1.25rem;font-weight:700;color:#0f172a;margin:0 0 0.375rem;}',
        '#ndl-gate-sub{font-size:0.8125rem;color:#64748b;font-weight:300;margin:0 0 1.75rem;line-height:1.5;}',
        '#ndl-gate-input{display:block;width:100%;box-sizing:border-box;',
          'border:1px solid #e2e8f0;border-radius:0;',
          'padding:0.625rem 0.75rem;font-size:0.875rem;',
          'font-family:"Inter",ui-sans-serif,system-ui,sans-serif;',
          'color:#0f172a;outline:none;margin-bottom:0.75rem;transition:border-color 0.15s;}',
        '#ndl-gate-input:focus{border-color:#000;}',
        '#ndl-gate-input::placeholder{color:#94a3b8;}',
        '#ndl-gate-btn{width:100%;padding:0.75rem;background:#0f172a;color:#fff;',
          'border:none;border-radius:0;font-size:0.8125rem;font-weight:600;',
          'letter-spacing:0.04em;text-transform:uppercase;cursor:pointer;',
          'font-family:"Inter",ui-sans-serif,system-ui,sans-serif;transition:background 0.15s;}',
        '#ndl-gate-btn:hover{background:#1e293b;}',
        '#ndl-gate-hint{font-size:0.6875rem;color:#94a3b8;text-align:center;margin-top:0.625rem;}',
      ].join('');
      document.head.appendChild(st);
    }

    var overlay = document.createElement('div');
    overlay.id  = 'ndl-gate';
    overlay.innerHTML = [
      '<div id="ndl-gate-card">',
        '<p id="ndl-gate-eyebrow">NexusDigitalLabs · Games</p>',
        '<h2 id="ndl-gate-title">What\'s your name?</h2>',
        '<p id="ndl-gate-sub">Your scores will be saved locally to this browser. No account needed.</p>',
        '<input id="ndl-gate-input" type="text" maxlength="20" placeholder="Your name…" autocomplete="off" spellcheck="false" />',
        '<button id="ndl-gate-btn">Start Playing</button>',
        '<p id="ndl-gate-hint">Leave blank for a random name</p>',
      '</div>',
    ].join('');
    document.body.appendChild(overlay);

    function submit() {
      var val  = document.getElementById('ndl-gate-input').value;
      var name = setUsername(val);
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s';
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        callback(name);
      }, 200);
    }

    document.getElementById('ndl-gate-btn').addEventListener('click', submit);
    document.getElementById('ndl-gate-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') submit();
    });

    setTimeout(function () {
      var inp = document.getElementById('ndl-gate-input');
      if (inp) inp.focus();
    }, 60);
  }

  /* ═══════════════════════════════════════════════════════════════════
   * PUBLIC API
   * ═══════════════════════════════════════════════════════════════════ */
  window.NDLGameState = {
    getUsername    : getUsername,
    setUsername    : setUsername,
    clearUsername  : clearUsername,
    saveScore      : saveScore,
    getHighScore   : getHighScore,
    getLeaderboard : getLeaderboard,
    requireUsername: requireUsername,
  };

})();
