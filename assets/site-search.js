
(function(){
  var input = document.getElementById('pf-search');
  var box = document.getElementById('pf-search-results');
  if(!input || !box) return;
  var prefix = input.getAttribute('data-prefix') || '';
  var entries = null, loading = false, timer = null;
  function esc(s){
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function hide(){ box.hidden = true; box.innerHTML = ''; }
  function run(q){
    if(!entries) return;
    var words = q.toLowerCase().split(/\s+/).filter(function(w){ return w; });
    if(words.length === 0){ hide(); return; }
    var scored = [];
    entries.forEach(function(e){
      var hay = ((e.title || '') + ' ' + (e.text || '')).toLowerCase();
      var ok = true;
      words.forEach(function(w){ if(hay.indexOf(w) === -1) ok = false; });
      if(!ok) return;
      var score = 0;
      var title = (e.title || '').toLowerCase();
      words.forEach(function(w){ if(title.indexOf(w) !== -1) score += 2; });
      scored.push({e: e, score: score});
    });
    scored.sort(function(a, b){ return b.score - a.score; });
    var top = scored.slice(0, 8);
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
    if(loading) return;
    loading = true;
    fetch(prefix + 'assets/search-index.json').then(function(r){ return r.json(); }).then(function(data){
      entries = data.entries || [];
      loading = false;
      cb();
    }).catch(function(){ loading = false; });
  }
  input.addEventListener('input', function(){
    var q = input.value.trim();
    if(q.length < 2){ hide(); return; }
    clearTimeout(timer);
    timer = setTimeout(function(){ ensureIndex(function(){ run(q); }); }, 150);
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
