/* ==========================================================================
   Payments Training Hub Insights and Scenarios browse page
   (Excel integration, 7 Nov 2026)
   --------------------------------------------------------------------------
   Client-side search, filters and progress for the Insights and Scenarios
   browse page (insights.html). No server, no sign-in. All filtering runs
   in the browser over the data embedded by the build.

   DATA: window.PA_INSIGHTS_DATA, written by the build from the canonical
   records (content/insights.json and the Excel scenario records). Each
   record is:
     { id, kind, title, topic, theme, text, domain, area, depth,
       difficulty, evidence, messages, lesson }
   Level 3 insights also carry `case`, the full ten-part case, which the
   card renders through PFInsight.renderLevel behind a "Show full case"
   toggle. The text search matches case detail text too.
   kind is "insight" or "scenario". depth is 1, 2 or 3. lesson is null
   until the mapping worker links the record to a lesson, or
   { id, title, url }.

   ATTRIBUTION: no person names appear anywhere on this page. There is no
   filter by person. Records carry an evidence label only, such as
   "Public post" or "Independently authored practice
   scenario". Source URLs live in the internal source register only,
   because the URL slugs contain profile names.

   PROGRESS: reuses the site-wide key "payments-academy-progress-v1"
   (same key and shape as the lesson progress in site.js and
   academy_sections.py). This page adds "insights" and "scenarios"
   sub-objects and preserves every existing field. Progress is stored in
   this browser only and does not follow the learner to another device.

   The pure filter functions are exported for node testing when the file
   is loaded as a module; in the browser they run inside the IIFE only.
   ========================================================================== */
(function () {
  'use strict';

  var PROGRESS_KEY = 'payments-academy-progress-v1';

  var DIFFICULTY_BY_DEPTH = {1: 'Foundation', 2: 'Intermediate', 3: 'Advanced'};
  var DEPTH_NAMES = {1: 'Quick insight', 2: 'Applied scenario', 3: 'Deep-dive case'};

  /* Difficulty is derived from learning depth unless the record carries
     an explicit difficulty. Level 1 is Foundation, Level 2 is
     Intermediate, Level 3 is Advanced. Scenarios carry depth 2, so they
     are Intermediate unless the lesson-embedding worker promotes one. */
  function deriveDifficulty(rec) {
    if (rec && rec.difficulty) return rec.difficulty;
    var d = rec && rec.depth ? rec.depth : 2;
    return DIFFICULTY_BY_DEPTH[d] || 'Intermediate';
  }

  /* Evidence status from the workbook, mapped to the five learner-facing
     source-transparency labels. Anything unrecognised is treated as a
     derived learning insight rather than inventing a stronger claim. */
  function evidenceLabel(status) {
    var s = (status || '').toLowerCase();
    if (s.indexOf('pending verification') >= 0 || s.indexOf('not recovered') >= 0) {
      return 'Source URL pending verification';
    }
    if (s.indexOf('follower') >= 0) return 'Follower-reported interview experience';
    if (s.indexOf('independently authored') >= 0 || s.indexOf('practice scenario') >= 0) {
      return 'Independently authored practice scenario';
    }
    if (s.indexOf('public post') >= 0 || s.indexOf('indexed') >= 0) {
      return 'Public post';
    }
    if (s.indexOf('derived') >= 0) return 'Derived learning insight';
    return 'Derived learning insight';
  }

  function norm(s) {
    return (s === null || s === undefined) ? '' : String(s).toLowerCase();
  }

  function haystack(rec) {
    return [rec.id, rec.title, rec.topic, rec.theme, rec.text, rec.domain,
      rec.area, rec.evidence, rec.messages, caseText(rec)].join(' ');
  }

  /* Flatten a Level 3 case to searchable text, so a search for a word
     inside the case detail (a message name, a failure mode, a field)
     finds the card. The case carries no internal keys: source ids are
     stripped at build time, so nothing here can leak one. */
  function caseText(rec) {
    var c = rec && rec.case;
    if (!c || typeof c !== 'object') return '';
    var bits = [];
    function walk(v) {
      if (typeof v === 'string') {
        bits.push(v);
      } else if (Array.isArray(v)) {
        for (var i = 0; i < v.length; i++) walk(v[i]);
      } else if (v && typeof v === 'object') {
        for (var k in v) {
          if (k !== 'status') walk(v[k]);
        }
      }
    }
    walk(c);
    return bits.join(' ');
  }

  /* One record against the current filter state. All filters combine
     with AND. The text search matches every word (AND) against the
     title, topic, theme, text, domain, evidence and messages. */
  function recordMatches(rec, state) {
    if (state.type && state.type !== 'all' && rec.kind !== state.type) return false;
    if (state.domain && state.domain !== 'all' && rec.domain !== state.domain) return false;
    if (state.topic) {
      var t = norm(state.topic).replace(/^\s+|\s+$/g, '');
      if (t && norm(rec.topic).indexOf(t) < 0 && norm(rec.title).indexOf(t) < 0) return false;
    }
    if (state.difficulty && state.difficulty !== 'all' && deriveDifficulty(rec) !== state.difficulty) return false;
    if (state.depth && state.depth !== 'all' && String(rec.depth) !== String(state.depth)) return false;
    if (state.q) {
      var q = norm(state.q).replace(/^\s+|\s+$/g, '');
      if (q) {
        var words = q.split(/\s+/);
        /* The haystack is precomputed once at init (rec._hay) because
           case detail text is long; records without it (node tests)
           fall back to computing it here. */
        var hay = rec._hay || norm(haystack(rec));
        for (var i = 0; i < words.length; i++) {
          if (hay.indexOf(words[i]) < 0) return false;
        }
      }
    }
    return true;
  }

  function applyFilters(records, state) {
    var out = [];
    for (var i = 0; i < records.length; i++) {
      if (recordMatches(records[i], state)) out.push(records[i]);
    }
    return out;
  }

  /* ---- progress: same key and shape as the lesson progress ---- */
  function progressLoad() {
    try {
      var p = JSON.parse(localStorage.getItem(PROGRESS_KEY));
      if (p && typeof p === 'object') {
        if (!p.lessons) p.lessons = {};
        if (!p.quiz) p.quiz = {};
        if (!p.capstone) p.capstone = {};
        if (!p.insights) p.insights = {};
        if (!p.scenarios) p.scenarios = {};
        return p;
      }
    } catch (e) {}
    return {lessons: {}, quiz: {}, capstone: {}, insights: {}, scenarios: {}};
  }

  function progressSave(p) {
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch (e) {}
  }

  /* ---- DOM wiring (browser only) ---- */
  function init() {
    if (typeof document === 'undefined') return;
    var data = (typeof window !== 'undefined') ? window.PA_INSIGHTS_DATA : null;
    var grid = document.getElementById('ib-results');
    var countEl = document.getElementById('ib-count');
    var emptyEl = document.getElementById('ib-empty');
    var summaryEl = document.getElementById('ib-progress-summary');
    var barEl = document.getElementById('ib-progress-bar');
    if (!grid || !countEl) return;

    if (!data || (!data.insights && !data.scenarios)) {
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.textContent = 'The insights and scenarios library is still being prepared. Please check back after the next site update.';
      }
      countEl.textContent = 'Showing 0 items.';
      return;
    }

    var records = [];
    var i;
    for (i = 0; i < (data.insights || []).length; i++) records.push(data.insights[i]);
    for (i = 0; i < (data.scenarios || []).length; i++) records.push(data.scenarios[i]);

    /* Precompute each record's search haystack once, including Level 3
       case detail text, so typing in the search box never re-flattens
       the cases. */
    for (i = 0; i < records.length; i++) records[i]._hay = norm(haystack(records[i]));

    var totalInsights = (data.insights || []).length;
    var totalScenarios = (data.scenarios || []).length;

    /* Card elements, keyed by record id. Cards are server-rendered by
       the build; this script only shows, hides and marks them. */
    var cards = {};
    var cardEls = grid.querySelectorAll('.ib-card');
    for (i = 0; i < cardEls.length; i++) {
      cards[cardEls[i].getAttribute('data-record-id')] = cardEls[i];
    }

    var searchEl = document.getElementById('ib-search');
    var typeEl = document.getElementById('ib-type');
    var domainEl = document.getElementById('ib-domain');
    var topicEl = document.getElementById('ib-topic');
    var diffEl = document.getElementById('ib-difficulty');
    var depthEl = document.getElementById('ib-depth');
    var clearBtn = document.getElementById('ib-clear');

    /* Populate the domain select and the topic datalist from the data,
       with counts, so the options always match the records on the page. */
    if (domainEl) {
      var domainCounts = {};
      for (i = 0; i < records.length; i++) {
        var d = records[i].domain || 'Other';
        domainCounts[d] = (domainCounts[d] || 0) + 1;
      }
      var domains = Object.keys(domainCounts).sort();
      for (i = 0; i < domains.length; i++) {
        var opt = document.createElement('option');
        opt.value = domains[i];
        opt.textContent = domains[i] + ' (' + domainCounts[domains[i]] + ')';
        domainEl.appendChild(opt);
      }
    }
    var topicList = document.getElementById('ib-topic-list');
    if (topicList) {
      var topics = {};
      for (i = 0; i < records.length; i++) {
        if (records[i].topic) topics[records[i].topic] = true;
      }
      var topicNames = Object.keys(topics).sort();
      for (i = 0; i < topicNames.length; i++) {
        var topt = document.createElement('option');
        topt.value = topicNames[i];
        topicList.appendChild(topt);
      }
    }

    var progress = progressLoad();

    function readState() {
      return {
        q: searchEl ? searchEl.value : '',
        type: typeEl ? typeEl.value : 'all',
        domain: domainEl ? domainEl.value : 'all',
        topic: topicEl ? topicEl.value : '',
        difficulty: diffEl ? diffEl.value : 'all',
        depth: depthEl ? depthEl.value : 'all'
      };
    }

    function renderProgress() {
      var doneI = 0, doneS = 0;
      var k;
      for (k in progress.insights) { if (progress.insights[k]) doneI++; }
      for (k in progress.scenarios) { if (progress.scenarios[k]) doneS++; }
      var total = totalInsights + totalScenarios;
      var done = doneI + doneS;
      if (summaryEl) {
        summaryEl.textContent = 'Your progress: ' + doneI + ' of ' + totalInsights +
          ' insights done, ' + doneS + ' of ' + totalScenarios + ' scenarios done.';
      }
      if (barEl) {
        barEl.style.width = (total > 0 ? Math.round(done * 100 / total) : 0) + '%';
        barEl.setAttribute('aria-valuenow', String(done));
        barEl.setAttribute('aria-valuemax', String(total));
      }
    }

    function render() {
      var state = readState();
      var visible = applyFilters(records, state);
      var visibleIds = {};
      for (i = 0; i < visible.length; i++) visibleIds[visible[i].id] = true;
      for (i = 0; i < records.length; i++) {
        var el = cards[records[i].id];
        if (el) el.hidden = !visibleIds[records[i].id];
      }
      var nI = 0, nS = 0;
      for (i = 0; i < visible.length; i++) {
        if (visible[i].kind === 'insight') nI++; else nS++;
      }
      countEl.textContent = 'Showing ' + visible.length + ' of ' + records.length +
        ' items (' + nI + ' insights, ' + nS + ' scenarios).';
      if (emptyEl) emptyEl.hidden = visible.length !== 0;
    }

    /* Mark-as-done buttons. The button text and pressed state follow
       the stored progress, and the summary updates immediately. */
    function syncDoneButtons() {
      var btns = grid.querySelectorAll('.ib-done-btn');
      for (var j = 0; j < btns.length; j++) {
        var btn = btns[j];
        var id = btn.getAttribute('data-done-id');
        var kind = btn.getAttribute('data-done-kind');
        var done = kind === 'scenario' ? !!progress.scenarios[id] : !!progress.insights[id];
        btn.setAttribute('aria-pressed', done ? 'true' : 'false');
        btn.classList.toggle('ib-done', done);
        btn.textContent = done ? 'Done' : 'Mark as done';
      }
    }

    /* In-panel error for a case whose JSON file could not be loaded.
       The panel stays open showing the message; the case is left
       unrendered and unfetched, so the next open retries the fetch. */
    function showCaseError(body, toggle) {
      if (body) {
        body.removeAttribute('data-ic-loading');
        body.innerHTML = '<p class="ib-case-error">This case could not be loaded. Please check your connection, then close and reopen it to try again.</p>';
      }
      if (toggle) toggle.textContent = 'Hide full case';
    }

    /* "Show full case" toggles on Level 3 insight cards. The case body
       carries no data-ic-type until first opened, so PFInsight.init()
       at page load leaves it alone. The case JSON lives in a per-case
       file (data-ic-case-src) instead of inline in the page: opening
       fetches it once, injects it as the JSON blob PFInsight.renderAll
       reads, and renders the case; later toggles just show and hide
       the rendered case. A failed fetch shows an in-panel error and
       leaves the case unfetched, so closing and reopening retries. */
    grid.addEventListener('click', function (ev) {
      var toggle = ev.target;
      while (toggle && toggle !== grid && !(toggle.classList && toggle.classList.contains('ib-case-btn'))) {
        toggle = toggle.parentNode;
      }
      if (toggle && toggle !== grid) {
        var detailId = toggle.getAttribute('aria-controls');
        var detail = detailId ? document.getElementById(detailId) : null;
        if (detail) {
          var body = detail.querySelector('[data-ic-case]');
          if (body && body.getAttribute('data-ic-loading') === '1') return;
          var open = detail.hasAttribute('hidden');
          if (open) {
            var src = body ? body.getAttribute('data-ic-case-src') : null;
            var hasBlob = !!(body && body.querySelector('script[type="application/json"]'));
            if (body && src && !hasBlob && !body.hasAttribute('data-ic-type')) {
              body.setAttribute('data-ic-loading', '1');
              detail.removeAttribute('hidden');
              toggle.setAttribute('aria-expanded', 'true');
              toggle.textContent = 'Loading full case...';
              if (typeof fetch !== 'function') {
                showCaseError(body, toggle);
                return;
              }
              fetch(src).then(function (r) {
                if (!r.ok) throw new Error('Case failed to load');
                return r.text();
              }).then(function (text) {
                JSON.parse(text);
                var script = document.createElement('script');
                script.type = 'application/json';
                script.textContent = text;
                body.appendChild(script);
                body.removeAttribute('data-ic-loading');
                if (window.PFInsight && window.PFInsight.renderAll) {
                  body.setAttribute('data-ic-type', 'level');
                  window.PFInsight.renderAll(detail);
                }
                toggle.textContent = 'Hide full case';
              }).catch(function () {
                showCaseError(body, toggle);
              });
              return;
            }
            if (body && !body.hasAttribute('data-ic-type') && window.PFInsight && window.PFInsight.renderAll) {
              body.setAttribute('data-ic-type', 'level');
              window.PFInsight.renderAll(detail);
            }
            detail.removeAttribute('hidden');
            toggle.setAttribute('aria-expanded', 'true');
            toggle.textContent = 'Hide full case';
          } else {
            detail.setAttribute('hidden', '');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.textContent = 'Show full case';
          }
        }
        return;
      }
      var btn = ev.target;
      while (btn && btn !== grid && !(btn.classList && btn.classList.contains('ib-done-btn'))) {
        btn = btn.parentNode;
      }
      if (!btn || btn === grid) return;
      var id = btn.getAttribute('data-done-id');
      var kind = btn.getAttribute('data-done-kind');
      var store = kind === 'scenario' ? progress.scenarios : progress.insights;
      if (store[id]) delete store[id]; else store[id] = true;
      progressSave(progress);
      syncDoneButtons();
      renderProgress();
    });

    var timer = null;
    function scheduleRender() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(render, 150);
    }
    if (searchEl) searchEl.addEventListener('input', scheduleRender);
    if (topicEl) topicEl.addEventListener('input', scheduleRender);
    var changeEls = [typeEl, domainEl, diffEl, depthEl];
    for (i = 0; i < changeEls.length; i++) {
      if (changeEls[i]) changeEls[i].addEventListener('change', render);
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (searchEl) searchEl.value = '';
        if (topicEl) topicEl.value = '';
        if (typeEl) typeEl.value = 'all';
        if (domainEl) domainEl.value = 'all';
        if (diffEl) diffEl.value = 'all';
        if (depthEl) depthEl.value = 'all';
        render();
        if (searchEl) searchEl.focus();
      });
    }
    var form = document.getElementById('ib-filter-form');
    if (form) {
      form.addEventListener('submit', function (ev) { ev.preventDefault(); render(); });
    }

    syncDoneButtons();
    renderProgress();
    render();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      deriveDifficulty: deriveDifficulty,
      evidenceLabel: evidenceLabel,
      caseText: caseText,
      recordMatches: recordMatches,
      applyFilters: applyFilters,
      DEPTH_NAMES: DEPTH_NAMES,
      PROGRESS_KEY: PROGRESS_KEY
    };
  }
})();
