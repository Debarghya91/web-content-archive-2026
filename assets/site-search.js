
(function(){
  var input = document.getElementById('pf-search');
  var box = document.getElementById('pf-search-results');
  if(!input || !box) return;
  var prefix = input.getAttribute('data-prefix') || '';
  var entries = null, haystacks = null, titles = null, loading = false, timer = null;
  var waiters = [], preloaded = false;
  var WS_RE = /\s+/;
  var MAX_RESULTS = 8;
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
  function run(q){
    if(!entries) return;
    var words = q.toLowerCase().split(WS_RE).filter(function(w){ return w; });
    if(words.length === 0){ hide(); return; }
    var top = [];
    var i, j, hay, title, ok, score;
    for(i = 0; i < entries.length; i++){
      hay = haystacks[i];
      ok = true;
      for(j = 0; j < words.length; j++){
        if(hay.indexOf(words[j]) === -1){ ok = false; break; }
      }
      if(!ok) continue;
      score = 0;
      title = titles[i];
      for(j = 0; j < words.length; j++){
        if(title.indexOf(words[j]) !== -1) score += 2;
      }
      if(top.length < MAX_RESULTS){
        insertTop(top, {e: entries[i], score: score});
      } else if(score > top[top.length - 1].score){
        insertTop(top, {e: entries[i], score: score});
        top.length = MAX_RESULTS;
      }
    }
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
  function ensureIndex(cb){
    if(entries){ cb(); return; }
    waiters.push(cb);
    if(loading) return;
    loading = true;
    fetch(prefix + 'assets/search-index.json').then(function(r){ return r.json(); }).then(function(data){
      var list = data.entries || [];
      var hays = new Array(list.length), tls = new Array(list.length), k;
      for(k = 0; k < list.length; k++){
        hays[k] = ((list[k].title || '') + ' ' + (list[k].text || '')).toLowerCase();
        tls[k] = (list[k].title || '').toLowerCase();
      }
      entries = list; haystacks = hays; titles = tls;
      loading = false;
      var pending = waiters; waiters = [];
      var last = pending[pending.length - 1];
      if(last) last();
    }).catch(function(){ loading = false; waiters = []; hide(); });
  }
  input.addEventListener('focus', function(){
    if(preloaded) return;
    preloaded = true;
    ensureIndex(function(){});
  });
  input.addEventListener('input', function(){
    var q = input.value.trim();
    if(q.length < 2){ clearTimeout(timer); hide(); return; }
    clearTimeout(timer);
    timer = setTimeout(function(){
      if(!entries){
        box.innerHTML = '<p class="pf-search-none">Loading search...</p>';
        box.hidden = false;
      }
      ensureIndex(function(){ run(q); });
    }, 150);
  });
  input.addEventListener('keydown', function(ev){
    if(ev.key === 'Escape'){ hide(); input.blur(); }
    if(ev.key === 'Enter'){
      ev.preventDefault();
      var first = box.querySelector('a');
      if(first) window.location.href = first.getAttribute('href');
    }
  });
  document.addEventListener('click', function(ev){
    if(!box.hidden && !input.contains(ev.target) && !box.contains(ev.target)) hide();
  });
})();
