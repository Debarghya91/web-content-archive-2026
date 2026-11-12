(function(){
  /* Input lookup: prefer the input inside <main> (the search page),
     so the page input wins while the old header search box is still
     present during the chrome transition. After the header box is
     gone, only the page input exists and the fallback never runs.
     Same rule for the results container. */
  var input = null, box = null;
  try {
    if(document.querySelector){
      input = document.querySelector('main #pf-search');
      box = document.querySelector('main #pf-search-results');
    }
  } catch(e){}
  if(!input) input = document.getElementById('pf-search');
  if(!box) box = document.getElementById('pf-search-results');
  if(!input || !box) return;
  var prefix = input.getAttribute('data-prefix') || '';
  var browse = document.getElementById('pf-search-browse');
  var levelsEl = document.getElementById('pf-search-levels');
  var countEl = document.getElementById('pf-search-count');
  var clearBtn = document.getElementById('pf-search-clear');
  var pageMode = !!browse;
  var entries = null, haystacks = null, titles = null, texts = null, loading = false, timer = null;
  var waiters = [], preloaded = false;
  var WS_RE = /\s+/;
  var MAX_RESULTS = 8;
  var PAGE_SIZE = 20;
  var RECENT_KEY = 'pf.search.recent.v1';
  var MAX_RECENT = 10;
  var TYPE_ORDER = ['lesson', 'guide', 'situation', 'lab', 'test', 'faq'];
  var TYPE_LABEL = {lesson: 'Lesson', guide: 'Guide', situation: 'Situation', lab: 'Lab', test: 'Test', faq: 'FAQ'};
  var TYPE_ICON = {
    lesson: '<path d="M8 5v14l11-7z" fill="currentColor"/>',
    guide: '<path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M5 18a2 2 0 0 1 2-2h12" fill="none" stroke="currentColor" stroke-width="2"/>',
    situation: '<rect x="3" y="7" width="18" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18" fill="none" stroke="currentColor" stroke-width="2"/>',
    lab: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    test: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8.5 12.5l2.5 2.5 4.5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    faq: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.8.3-.9 1-.9 1.7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1.2" fill="currentColor"/>'
  };
  var POPULAR = ['MT103', 'pacs.008', 'ISO 20022', 'SEPA', 'OUR SHA BEN', 'chargeback', 'nostro', 'UPI', 'beneficiary not credited', 'RRN'];
  var LEVEL_LABEL = {foundation: 'Foundation', core: 'Core', advanced: 'Advanced'};
  var selectedLevel = null, visibleCount = PAGE_SIZE, browseType = null, loadFailed = false, typeCounts = null;
  function esc(s){
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function hide(){ box.hidden = true; box.innerHTML = ''; }
  function insertTop(top, r){
    var j;
    for(j = top.length - 1; j >= 0; j--){
      if(top[j].score >= r.score){ top.splice(j + 1, 0, r); return; }
    }
    top.unshift(r);
  }
  /* The level of an entry, ported from the app's SearchView
     levelForEntry: situations use a text hint and default to Core,
     other types only get a level when their text names one. The
     app also consults the full situations data file; the website
     search index carries no level field, so only the text-hint
     rule runs here. Title and text are never conflated: the hint
     is read from the body text only, as in the app. */
  function levelForEntry(e, lowerText){
    var t = lowerText || '';
    if(e.type === 'situation'){
      if(t.indexOf('foundation') !== -1) return 'foundation';
      if(t.indexOf('advanced') !== -1) return 'advanced';
      return 'core';
    }
    if(t.indexOf('foundation') !== -1) return 'foundation';
    if(t.indexOf('advanced') !== -1) return 'advanced';
    return null;
  }
  /* The matcher, unchanged from the parity-batch version: every
     query word must appear in the precomputed lowercase haystack,
     title matches score 2 per word, and only the top `cap` results
     are kept via insertTop, so typing never blocks on a full
     rescan. With level null and cap 8 this is exactly the old
     dropdown matcher; the page view calls it with a larger cap
     and an optional level filter, which can only extend or narrow
     the same ranked list, never reorder it. An empty word list
     matches every entry (the filter-only view), in index order. */
  function scan(words, cap, level){
    var top = [], totals = {}, total = 0;
    var i, j, hay, title, ok, score, e;
    for(i = 0; i < entries.length; i++){
      e = entries[i];
      if(level && levelForEntry(e, texts[i]) !== level) continue;
      hay = haystacks[i];
      ok = true;
      for(j = 0; j < words.length; j++){
        if(hay.indexOf(words[j]) === -1){ ok = false; break; }
      }
      if(!ok) continue;
      total++;
      totals[e.type] = (totals[e.type] || 0) + 1;
      score = 0;
      title = titles[i];
      for(j = 0; j < words.length; j++){
        if(title.indexOf(words[j]) !== -1) score += 2;
      }
      if(top.length < cap){
        insertTop(top, {e: e, score: score, i: i});
      } else if(score > top[top.length - 1].score){
        insertTop(top, {e: e, score: score, i: i});
        top.length = cap;
      }
    }
    return {top: top, totals: totals, total: total};
  }
  function wordsOf(q){
    return q.toLowerCase().split(WS_RE).filter(function(w){ return w; });
  }
  /* Dropdown results (the old header search behaviour, kept
     exactly for any page that still carries the header box). */
  function run(q){
    if(!entries) return;
    var words = wordsOf(q);
    if(words.length === 0){ hide(); return; }
    var top = scan(words, MAX_RESULTS, null).top;
    if(!top.length){
      box.innerHTML = '<p class="pf-search-none">No results for &quot;' + esc(q) + '&quot;. Try fewer words, or browse the <a href="' + prefix + 'courses.html">Courses</a> page.</p>';
      box.hidden = false;
      return;
    }
    var html = '<ul>';
    top.forEach(function(r){
      html += '<li><a href="' + prefix + r.e.url + '"><b>' + esc(r.e.title || r.e.id) + '</b><span>' + esc(r.e.type || '') + '</span></a></li>';
    });
    html += '</ul>';
    box.innerHTML = html;
    box.hidden = false;
  }
  /* ---------- search page ---------- */
  function iconTile(type){
    var path = TYPE_ICON[type] || TYPE_ICON.lesson;
    return '<span class="pf-icon-tile" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" focusable="false">' + path + '</svg></span>';
  }
  function preview(text){
    var t = String(text || '').replace(/\s+/g, ' ').trim();
    if(t.length <= 140) return t;
    return t.slice(0, 140) + '...';
  }
  function highlightTitle(title, words){
    var lower = String(title || '').toLowerCase(), best = -1, bestLen = 0, k, w, idx;
    for(k = 0; k < words.length; k++){
      w = words[k];
      idx = lower.indexOf(w);
      if(idx !== -1 && (best === -1 || idx < best)){ best = idx; bestLen = w.length; }
    }
    if(best === -1) return esc(title);
    return esc(title.slice(0, best)) + '<mark>' + esc(title.slice(best, best + bestLen)) + '</mark>' + esc(title.slice(best + bestLen));
  }
  function rowHtml(r, words){
    var e = r.e;
    var level = levelForEntry(e, texts[r.i]);
    var h = '<li><a href="' + prefix + e.url + '">' + iconTile(e.type) + '<span><b>' +
      highlightTitle(e.title || e.id, words) + '</b> ' +
      '<span class="pf-pill">' + esc(TYPE_LABEL[e.type] || e.type || '') + '</span>';
    if(e.type === 'situation' && e.id) h += ' <span class="pf-pill">' + esc(e.id) + '</span>';
    if(level) h += ' <span class="pf-pill">' + esc(LEVEL_LABEL[level]) + '</span>';
    h += '<span>' + esc(preview(e.text)) + '</span></span><span aria-hidden="true">&rsaquo;</span></a></li>';
    return h;
  }
  function groupsHtml(res, words){
    var html = '';
    TYPE_ORDER.forEach(function(t){
      var list = res.top.filter(function(r){ return r.e.type === t; });
      if(!list.length) return;
      html += '<h3>' + TYPE_LABEL[t] + 's (' + (res.totals[t] || 0) + ')</h3><ul>';
      list.forEach(function(r){ html += rowHtml(r, words); });
      html += '</ul>';
    });
    return html;
  }
  function countText(total, shown, q){
    var noun = total === 1 ? 'result' : 'results';
    var range = total > visibleCount ? 'Showing ' + shown + ' of ' + total + ' ' + noun : total + ' ' + noun;
    if(!q) return range + ' matching your filters';
    return range + ' for "' + q + '"';
  }
  function getRecents(){
    try {
      var raw = localStorage.getItem(RECENT_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.filter(function(s){ return typeof s === 'string' && s; }).slice(0, MAX_RECENT) : [];
    } catch(e){ return []; }
  }
  function recordRecent(q){
    var trimmed = String(q || '').trim();
    if(!trimmed) return;
    try {
      var recents = getRecents();
      if(recents.length && recents[0].toLowerCase() === trimmed.toLowerCase()) return;
      recents = recents.filter(function(s){ return s.toLowerCase() !== trimmed.toLowerCase(); });
      recents.unshift(trimmed);
      localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, MAX_RECENT)));
    } catch(e){}
  }
  function chipHtml(q){
    return '<button type="button" class="pf-chip" data-action="run-query" data-q="' + esc(q) + '">' + esc(q) + '</button>';
  }
  function browseHtml(){
    var h = '';
    var recents = getRecents();
    if(recents.length){
      h += '<h2 class="pf-section-header">Recent searches</h2><p>';
      h += recents.map(chipHtml).join(' ');
      h += '</p><p><button type="button" class="pf-btn-secondary" data-action="clear-recents">Clear recent searches</button></p>';
    }
    h += '<h2 class="pf-section-header">Popular searches</h2><p>';
    h += POPULAR.map(chipHtml).join(' ');
    h += '</p><h2 class="pf-section-header">Browse by type</h2><ul>';
    TYPE_ORDER.forEach(function(t){
      var c = typeCounts ? typeCounts[t] : null;
      h += '<li><button type="button" data-action="browse-type" data-type="' + t + '">' + iconTile(t) +
        '<span>' + TYPE_LABEL[t] + 's</span>' +
        (c == null ? '' : '<span>' + c + ' ' + (c === 1 ? 'item' : 'items') + '</span>') +
        '<span aria-hidden="true">&rsaquo;</span></button></li>';
    });
    h += '</ul>';
    return h;
  }
  function syncPills(){
    if(!levelsEl || !levelsEl.querySelectorAll) return;
    var btns = levelsEl.querySelectorAll('[data-level]');
    var k;
    for(k = 0; k < btns.length; k++){
      var lv = btns[k].getAttribute('data-level') || null;
      btns[k].setAttribute('aria-pressed', String(lv === selectedLevel));
    }
  }
  function renderBrowse(){
    hide();
    if(countEl) countEl.textContent = '';
    browse.hidden = false;
    browse.innerHTML = browseHtml();
    syncPills();
  }
  function renderSearchError(){
    browse.hidden = true;
    if(countEl) countEl.textContent = '';
    box.innerHTML = '<div class="pf-error"><p class="pf-error-title">Could not load search</p>' +
      '<p>The course catalogue could not be loaded. Check your connection and try again.</p>' +
      '<p><button type="button" class="pf-btn-secondary" data-action="retry">Try again</button></p></div>';
    box.hidden = false;
  }
  function renderResults(q){
    browse.hidden = true;
    if(loadFailed){ renderSearchError(); return; }
    if(!entries){
      box.innerHTML = '<p>Loading the course catalogue...</p>';
      box.hidden = false;
      ensureIndex(function(){ renderResults(input.value.trim()); });
      return;
    }
    var words = wordsOf(q);
    var res = scan(words, visibleCount, selectedLevel);
    if(!res.total){
      var title = words.length ? 'No results for "' + q + '"' : 'No results match this filter';
      var hint = 'Try a different word, for example MT103, SEPA or chargeback' +
        (selectedLevel ? ', or clear the difficulty filter.' : '.');
      var h = '<div class="pf-empty"><p class="pf-empty-title">' + esc(title) + '</p><p>' + esc(hint) + '</p>';
      if(selectedLevel) h += '<p><button type="button" class="pf-btn-secondary" data-action="clear-filter">Clear filter</button></p>';
      h += '<p>Try a popular search</p><p>' + ['MT103', 'SEPA', 'chargeback'].map(chipHtml).join(' ') + '</p>';
      h += '<p><button type="button" class="pf-btn-secondary" data-action="browse-by-type">Browse by type</button></p></div>';
      box.innerHTML = h;
      box.hidden = false;
      if(countEl) countEl.textContent = '';
      return;
    }
    var shown = Math.min(visibleCount, res.total);
    if(countEl) countEl.textContent = countText(res.total, shown, q);
    var html = groupsHtml(res, words);
    if(res.total > visibleCount) html += '<p><button type="button" class="pf-btn-secondary" data-action="load-more">Load more results</button></p>';
    box.innerHTML = html;
    box.hidden = false;
  }
  function renderTypeList(){
    browse.hidden = true;
    if(loadFailed){ renderSearchError(); return; }
    if(!entries){
      box.innerHTML = '<p>Loading the course catalogue...</p>';
      box.hidden = false;
      ensureIndex(function(){ renderTypeList(); });
      return;
    }
    var label = TYPE_LABEL[browseType] || browseType;
    var list = [];
    var i;
    for(i = 0; i < entries.length; i++){
      if(entries[i].type === browseType) list.push({e: entries[i], score: 0, i: i});
    }
    if(!list.length){
      box.innerHTML = '<div class="pf-empty"><p class="pf-empty-title">Nothing here yet</p><p>There are no ' +
        esc(label.toLowerCase()) + 's in the catalogue.</p>' +
        '<p><button type="button" class="pf-btn-secondary" data-action="browse-by-type">Back to browse</button></p></div>';
      box.hidden = false;
      if(countEl) countEl.textContent = '';
      return;
    }
    var shown = list.slice(0, visibleCount);
    var noun = label.toLowerCase() + 's';
    if(countEl) countEl.textContent = list.length > visibleCount ?
      'Showing ' + shown.length + ' of ' + list.length + ' ' + noun : list.length + ' ' + noun;
    var html = '<h3>' + esc(label) + 's (' + list.length + ')</h3><ul>';
    shown.forEach(function(r){ html += rowHtml(r, []); });
    html += '</ul><p><button type="button" class="pf-btn-secondary" data-action="browse-by-type">Back to browse</button></p>';
    if(list.length > visibleCount) html += '<p><button type="button" class="pf-btn-secondary" data-action="load-more">Load more results</button></p>';
    box.innerHTML = html;
    box.hidden = false;
  }
  function render(){
    syncPills();
    if(browseType){ renderTypeList(); return; }
    var q = input.value.trim();
    if(!q && !selectedLevel){ renderBrowse(); return; }
    renderResults(q);
  }
  function runSearch(q){
    input.value = q;
    recordRecent(q);
    visibleCount = PAGE_SIZE;
    browseType = null;
    render();
  }
  function ensureIndex(cb){
    if(entries){ cb(); return; }
    waiters.push(cb);
    if(loading) return;
    loading = true;
    fetch(prefix + 'assets/search-index.json').then(function(r){ return r.json(); }).then(function(data){
      var list = data.entries || [];
      var hays = new Array(list.length), tls = new Array(list.length), txs = new Array(list.length), k;
      var counts = {};
      for(k = 0; k < list.length; k++){
        hays[k] = ((list[k].id || '') + ' ' + (list[k].title || '') + ' ' + (list[k].text || '')).toLowerCase();
        tls[k] = (list[k].title || '').toLowerCase();
        txs[k] = (list[k].text || '').toLowerCase();
        counts[list[k].type] = (counts[list[k].type] || 0) + 1;
      }
      entries = list; haystacks = hays; titles = tls; texts = txs; typeCounts = counts;
      loadFailed = false;
      loading = false;
      var pending = waiters; waiters = [];
      var last = pending[pending.length - 1];
      if(last) last();
      if(pageMode && browse && !browse.hidden) renderBrowse();
    }).catch(function(){ loading = false; waiters = []; loadFailed = true; hide(); if(pageMode) renderSearchError(); });
  }
  input.addEventListener('focus', function(){
    if(preloaded) return;
    preloaded = true;
    ensureIndex(function(){});
  });
  input.addEventListener('input', function(){
    var q = input.value.trim();
    if(q.length < 2){
      clearTimeout(timer);
      if(pageMode){ visibleCount = PAGE_SIZE; browseType = null; render(); }
      else hide();
      return;
    }
    clearTimeout(timer);
    timer = setTimeout(function(){
      if(!entries && !pageMode){
        box.innerHTML = '<p class="pf-search-none">Loading search...</p>';
        box.hidden = false;
      }
      ensureIndex(function(){
        if(pageMode){ visibleCount = PAGE_SIZE; renderResults(input.value.trim()); }
        else run(q);
      });
    }, 150);
  });
  input.addEventListener('keydown', function(ev){
    if(ev.key === 'Escape'){
      if(pageMode){ input.value = ''; browseType = null; visibleCount = PAGE_SIZE; render(); }
      else hide();
      input.blur();
    }
    if(ev.key === 'Enter'){
      ev.preventDefault();
      if(pageMode){
        clearTimeout(timer);
        var q = input.value.trim();
        if(q.length >= 2) recordRecent(q);
        visibleCount = PAGE_SIZE;
        browseType = null;
        render();
        input.blur();
      } else {
        var first = box.querySelector('a');
        if(first) window.location.href = first.getAttribute('href');
      }
    }
  });
  if(!pageMode){
    document.addEventListener('click', function(ev){
      if(!box.hidden && !input.contains(ev.target) && !box.contains(ev.target)) hide();
    });
  }
  if(pageMode){
    if(levelsEl){
      levelsEl.addEventListener('click', function(ev){
        var btn = ev.target && ev.target.closest ? ev.target.closest('[data-level]') : null;
        if(!btn) return;
        selectedLevel = btn.getAttribute('data-level') || null;
        visibleCount = PAGE_SIZE;
        browseType = null;
        render();
      });
    }
    browse.addEventListener('click', function(ev){
      var el = ev.target && ev.target.closest ? ev.target.closest('[data-action]') : null;
      if(!el) return;
      var action = el.getAttribute('data-action');
      if(action === 'run-query'){ runSearch(el.getAttribute('data-q') || ''); }
      else if(action === 'browse-type'){
        browseType = el.getAttribute('data-type');
        visibleCount = PAGE_SIZE;
        renderTypeList();
      }
      else if(action === 'clear-recents'){
        var ok = false;
        try { ok = window.confirm('This removes all recent searches from this device. It cannot be undone.'); } catch(e){}
        if(!ok) return;
        try { localStorage.removeItem(RECENT_KEY); } catch(e){}
        renderBrowse();
      }
    });
    box.addEventListener('click', function(ev){
      var el = ev.target && ev.target.closest ? ev.target.closest('[data-action]') : null;
      if(!el) return;
      var action = el.getAttribute('data-action');
      if(action === 'load-more'){
        visibleCount += PAGE_SIZE;
        if(browseType) renderTypeList(); else renderResults(input.value.trim());
      }
      else if(action === 'clear-filter'){
        selectedLevel = null;
        visibleCount = PAGE_SIZE;
        render();
      }
      else if(action === 'browse-by-type'){
        input.value = '';
        selectedLevel = null;
        browseType = null;
        visibleCount = PAGE_SIZE;
        renderBrowse();
        input.blur();
      }
      else if(action === 'run-query'){ runSearch(el.getAttribute('data-q') || ''); }
      else if(action === 'retry'){
        loadFailed = false;
        ensureIndex(function(){ render(); });
      }
    });
    if(clearBtn){
      clearBtn.addEventListener('click', function(){
        input.value = '';
        visibleCount = PAGE_SIZE;
        browseType = null;
        render();
        try { input.focus(); } catch(e){}
      });
    }
    renderBrowse();
    var initialQ = '';
    try {
      if(typeof window !== 'undefined' && window.location && window.URLSearchParams){
        initialQ = (new window.URLSearchParams(window.location.search || '').get('q') || '').trim();
      }
    } catch(e){}
    if(initialQ){
      input.value = initialQ.slice(0, 200);
      renderResults(initialQ);
    }
  }
})();
