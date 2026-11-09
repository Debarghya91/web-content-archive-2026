
/* ===== Payment Situations page ===== */
/* Gate first, data second: the item data file is requested only after
   paHasSituationsAccess() passes, so a plain view-source of this page
   shows no item content. Honest limit: the data file is a static
   asset, so a determined user who inspects network requests can fetch
   it, and screenshots cannot be prevented. Real server-side
   enforcement needs the Supabase backend. */
var PA_SIT_ITEMS = [];
var PA_SIT_INDEX = 0;
var PA_SIT_STAGE = '';
var PA_SIT_DOMAIN = '';
var PA_SIT_MESSAGE = '';
var PA_SIT_FAILURE = '';
var PA_SIT_LEVEL = '';
var PA_SIT_RESOLUTION = '';
var PA_SIT_QUERY = '';
var PA_SIT_BOOKMARKED_ONLY = false;
var PA_SIT_PROGRESS_KEY = 'pa-situations-progress-v1';
function paSitProgress(){
  try {
    var v = JSON.parse(localStorage.getItem(PA_SIT_PROGRESS_KEY));
    if(v && typeof v === 'object'){
      if(!v.completed) v.completed = {};
      if(!v.bookmarked) v.bookmarked = {};
      if(!v.notes) v.notes = {};
      if(!v.review) v.review = {};
      return v;
    }
  } catch(e){}
  return {completed: {}, bookmarked: {}, notes: {}, review: {}, last: ''};
}
function paSitSaveProgress(p){
  try { localStorage.setItem(PA_SIT_PROGRESS_KEY, JSON.stringify(p)); } catch(e){}
}
function paSitVisibleItems(){
  return PA_SIT_ITEMS.filter(function(it){
    if(PA_SIT_STAGE && String(it.stage || '') !== String(PA_SIT_STAGE)) return false;
    if(PA_SIT_DOMAIN && (it.domain || '') !== PA_SIT_DOMAIN) return false;
    if(PA_SIT_MESSAGE && ((it.messages || []).indexOf(PA_SIT_MESSAGE) === -1)) return false;
    if(PA_SIT_FAILURE && (it.failure_category || '') !== PA_SIT_FAILURE) return false;
    if(PA_SIT_LEVEL && (it.level || '') !== PA_SIT_LEVEL) return false;
    if(PA_SIT_RESOLUTION && (it.resolution || '') !== PA_SIT_RESOLUTION) return false;
    if(PA_SIT_BOOKMARKED_ONLY){
      var p = paSitProgress();
      if(!p.bookmarked[it.id]) return false;
    }
    if(PA_SIT_QUERY){
      var hay = ((it.title || '') + ' ' + (it.explain || '') + ' ' + (it.takeaway || '') + ' ' + ((it.messages || []).join(' '))).toLowerCase();
      if(hay.indexOf(PA_SIT_QUERY) === -1) return false;
    }
    return true;
  });
}
/* Stage 6 completion review (ChatGPT review P2#10, 9 Nov 2026).
   A reflection checklist, never a test: this product has no multiple
   choice by design, so there are no questions, no score and no pass
   mark. Each prompt is grounded in a real Stage 6 situation: root
   cause tracing, wrong rule versus wrong data, reject or repair,
   reason codes, incident versus problem, scheme rules into
   requirements, the control that should have caught it, and design
   for failure. The learner ticks a prompt when they can do it from
   their own work through the situations. */
var PA_SIT_REVIEW_PROMPTS = [
  {id: 'r1', text: 'Trace a payment failure from the symptom upstream to the root cause, hop by hop, with timestamps and message copies.'},
  {id: 'r2', text: 'Tell whether a wrong outcome came from a wrong rule or wrong data, by tracing the chain before blaming one component.'},
  {id: 'r3', text: 'Decide reject or repair from the business context, not from the error alone.'},
  {id: 'r4', text: 'Read a reason code and say what to investigate first.'},
  {id: 'r5', text: 'Separate restoring service from finding the cause, and report both timelines.'},
  {id: 'r6', text: 'Turn a scheme rule into a buildable requirement a developer can implement.'},
  {id: 'r7', text: 'Name the control that should have caught a failure, and what changes so it catches it next time.'},
  {id: 'r8', text: 'Explain a design choice by its failure modes, not only by its happy path.'}
];
function paSitRenderReview(){
  var box = document.getElementById('sit-review');
  if(!box || box.getAttribute('data-sit-rendered')) return;
  box.setAttribute('data-sit-rendered', '1');
  var p = paSitProgress();
  var html = '<h3>Stage 6 completion review</h3>'
    + '<p class="sit-note">No test, no score. Work through the prompts below and tick each one you can do from your own experience of the situations. They cover what Stage 6 asks of you: root cause, competing resolutions, and the control that should have caught it.</p>'
    + '<p class="sit-review-count" id="sit-review-count" aria-live="polite"></p>'
    + '<ul class="sit-review-list">';
  PA_SIT_REVIEW_PROMPTS.forEach(function(pr){
    var on = p.review && p.review[pr.id];
    html += '<li><label class="sit-review-item"><input type="checkbox" data-sit-review="' + pr.id + '"' + (on ? ' checked' : '') + ' onchange="paSitToggleReview(this)"> ' + escHtml(pr.text) + '</label></li>';
  });
  html += '</ul>';
  box.innerHTML = html;
  paSitUpdateReviewCount();
}
function paSitToggleReview(cb){
  var p = paSitProgress();
  if(!p.review) p.review = {};
  var id = cb.getAttribute('data-sit-review');
  if(cb.checked) p.review[id] = true;
  else delete p.review[id];
  paSitSaveProgress(p);
  paSitUpdateReviewCount();
}
function paSitUpdateReviewCount(){
  var el = document.getElementById('sit-review-count');
  if(!el) return;
  var p = paSitProgress();
  var n = Object.keys(p.review || {}).length;
  el.textContent = 'You have reflected on ' + n + ' of ' + PA_SIT_REVIEW_PROMPTS.length + ' prompts.';
}
/* Stage-completion report (ChatGPT review P2#10, 9 Nov 2026):
   per-stage completed counts, and the strongest and weakest
   operational areas, computed from local progress data. An area is
   a domain with at least 3 situations, so a single item cannot make
   an area look strong or weak. When nothing is completed yet, the
   report says so instead of naming areas. */
function paSitRenderReport(){
  var box = document.getElementById('sit-report');
  if(!box) return;
  var p = paSitProgress();
  var done = p.completed || {};
  var totalDone = Object.keys(done).length;
  var stageTotals = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0};
  var stageDone = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0};
  var domTotals = {};
  var domDone = {};
  var stageNames = {1: 'Payment mechanics', 2: 'Processing decisions', 3: 'Operational exceptions', 4: 'Cross-system consequences', 5: 'Complex banking scenarios', 6: 'Senior SME judgement'};
  PA_SIT_ITEMS.forEach(function(it){
    var s = it.stage || 3;
    stageTotals[s] = (stageTotals[s] || 0) + 1;
    if(done[it.id]) stageDone[s] = (stageDone[s] || 0) + 1;
    var d = it.domain || 'Uncategorised';
    domTotals[d] = (domTotals[d] || 0) + 1;
    if(done[it.id]) domDone[d] = (domDone[d] || 0) + 1;
  });
  var html = '<h3>Your stage completion report</h3>';
  [1, 2, 3, 4, 5, 6].forEach(function(s){
    var t = stageTotals[s] || 0;
    var dn = stageDone[s] || 0;
    var pct = t ? Math.round(dn / t * 100) : 0;
    html += '<div class="sit-report-row"><span>Stage ' + s + ': ' + escHtml(stageNames[s]) + '</span>'
      + '<span class="sit-report-bar"><span class="sit-report-fill" style="width:' + pct + '%"></span></span>'
      + '<span>' + dn + ' of ' + t + '</span></div>';
  });
  html += '<div class="sit-report-areas">';
  if(!totalDone){
    html += '<p>Complete a few situations and your strongest and weakest areas will appear here.</p>';
  } else {
    var areas = Object.keys(domTotals).filter(function(d){ return domTotals[d] >= 3; }).map(function(d){
      var dn = domDone[d] || 0;
      return {name: d, total: domTotals[d], done: dn, rate: dn / domTotals[d]};
    });
    areas.sort(function(a, b){ return (b.rate - a.rate) || (b.done - a.done) || (a.name < b.name ? -1 : 1); });
    if(areas.length){
      var best = areas[0];
      var worst = areas[areas.length - 1];
      if(best.rate > 0){
        html += '<p><strong>Strongest area:</strong> ' + escHtml(best.name) + ' (' + best.done + ' of ' + best.total + ' complete).</p>';
      }
      if(worst !== best){
        html += '<p><strong>Weakest area:</strong> ' + escHtml(worst.name) + ' (' + worst.done + ' of ' + worst.total + ' complete). Work through its situations next.</p>';
      }
    } else {
      html += '<p>Complete a few situations and your strongest and weakest areas will appear here.</p>';
    }
  }
  html += '</div>';
  box.innerHTML = html;
}
function paSitUpdateProgressLine(){
  var line = document.getElementById('sit-progress-line');
  if(!line) return;
  var p = paSitProgress();
  var done = Object.keys(p.completed || {}).length;
  var marks = Object.keys(p.bookmarked || {}).length;
  var notes = Object.keys(p.notes || {}).filter(function(k){ return (p.notes[k] || '').trim(); }).length;
  var last = '';
  if(p.last){
    var li = PA_SIT_ITEMS.filter(function(it){ return it.id === p.last; })[0];
    if(li) last = ' Continue where you left off: ' + li.title + '.';
  }
  line.textContent = 'You have completed ' + done + ' of ' + PA_SIT_ITEMS.length + ' situations. ' + marks + ' bookmarked. ' + notes + ' with notes.' + last;
}
function paSitRenderCatalogue(list){
  var cat = document.getElementById('sit-catalogue');
  if(!cat) return;
  var cur = list[PA_SIT_INDEX];
  var html = '<p class="sit-catalogue-count">' + list.length + ' of ' + PA_SIT_ITEMS.length + ' situations</p>';
  list.forEach(function(it, i){
    var pos = PA_SIT_ITEMS.indexOf(it) + 1;
    var p = paSitProgress();
    var mark = p.bookmarked[it.id] ? ' \u2605 ' : '';
    var done = p.completed[it.id] ? ' \u2713 ' : '';
    html += '<button type="button" class="sit-catalogue-item' + (it === cur ? ' active' : '') + '" data-sit-cat="' + i + '" onclick="paSitJump(' + i + ')">'
      + '<span class="sit-cat-stage">Stage ' + (it.stage || '') + ' &middot; ' + pos + ' of ' + PA_SIT_ITEMS.length + mark + done + '</span>'
      + escHtml(it.title || it.id || '') + '</button>';
  });
  cat.innerHTML = html;
}
function escHtml(s){
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function paSitRelated(item){
  var rel = [];
  if(!item) return rel;
  PA_SIT_ITEMS.forEach(function(it){
    if(it.id === item.id || rel.length >= 3) return;
    var sameStage = it.stage === item.stage;
    var sharedMsg = (it.messages || []).some(function(m){ return (item.messages || []).indexOf(m) !== -1; });
    var sameDomain = it.domain && item.domain && it.domain === item.domain;
    if((sameStage && (sharedMsg || sameDomain)) || (sharedMsg && sameDomain)) rel.push(it);
  });
  if(rel.length < 3){
    PA_SIT_ITEMS.forEach(function(it){
      if(it.id === item.id || rel.length >= 3) return;
      if(it.stage === item.stage && rel.indexOf(it) === -1) rel.push(it);
    });
  }
  return rel;
}
function paSitRenderRelated(item){
  var box = document.getElementById('sit-related');
  if(!box) return;
  var rel = paSitRelated(item);
  if(!rel.length){ box.innerHTML = ''; return; }
  var html = '<h4>Related situations</h4>';
  rel.forEach(function(it){
    var pos = PA_SIT_ITEMS.indexOf(it);
    html += '<button type="button" onclick="paSitOpenByIndex(' + pos + ')">' + escHtml(it.title || it.id) + ' (Stage ' + (it.stage || '') + ')</button>';
  });
  box.innerHTML = html;
}
function paSitSyncActionButtons(item){
  var p = paSitProgress();
  var bm = document.getElementById('sit-bookmark');
  if(bm){
    bm.setAttribute('aria-pressed', item && p.bookmarked[item.id] ? 'true' : 'false');
    bm.textContent = (item && p.bookmarked[item.id]) ? 'Bookmarked \u2605' : 'Bookmark';
  }
  var dn = document.getElementById('sit-done');
  if(dn){
    dn.setAttribute('aria-pressed', item && p.completed[item.id] ? 'true' : 'false');
    dn.textContent = (item && p.completed[item.id]) ? 'Completed \u2713' : 'Mark complete';
  }
}
function paSitRenderNote(item){
  var box = document.getElementById('sit-note-box');
  if(!box) return;
  if(!item){ box.innerHTML = ''; return; }
  var p = paSitProgress();
  var saved = (p.notes && p.notes[item.id]) || '';
  box.innerHTML = '<h4>Your note on this situation</h4>'
    + '<p class="sit-note">Private to this browser. Notes are stored with your bookmarks and progress, and clearing browser data wipes them.</p>'
    + '<textarea id="sit-note-text" rows="3" aria-label="Your note on this situation">' + escHtml(saved) + '</textarea>'
    + '<p><button type="button" class="sit-btn sit-btn-primary" onclick="paSitSaveNote()">Save note</button> '
    + '<span class="sit-note-status" id="sit-note-status"></span></p>';
}
function paSitSaveNote(){
  var list = paSitVisibleItems();
  var item = list[PA_SIT_INDEX];
  if(!item) return;
  var ta = document.getElementById('sit-note-text');
  var st = document.getElementById('sit-note-status');
  var text = ta ? ta.value : '';
  var p = paSitProgress();
  if(!p.notes) p.notes = {};
  if(text.trim()) p.notes[item.id] = text;
  else delete p.notes[item.id];
  paSitSaveProgress(p);
  if(st) st.textContent = 'Note saved.';
  paSitUpdateProgressLine();
}
function paSitRender(){
  var box = document.getElementById('sit-content');
  if(!box) return;
  var list = paSitVisibleItems();
  paSitUpdateProgressLine();
  paSitRenderReport();
  paSitRenderReview();
  if(!PA_SIT_ITEMS.length){
    box.innerHTML = '<p class="sit-note">The situations are being prepared.</p>';
    return;
  }
  if(!list.length){
    box.innerHTML = '<p class="sit-note">No situations match this filter. Clear a filter to see more.</p>';
    paSitRenderCatalogue(list);
    paSitRenderRelated(null);
    paSitRenderNote(null);
    return;
  }
  if(PA_SIT_INDEX >= list.length) PA_SIT_INDEX = list.length - 1;
  if(PA_SIT_INDEX < 0) PA_SIT_INDEX = 0;
  var item = list[PA_SIT_INDEX];
  var pos = PA_SIT_ITEMS.indexOf(item) + 1;
  var prog = document.getElementById('sit-progress');
  if(prog) prog.textContent = 'Situation ' + pos + ' of ' + PA_SIT_ITEMS.length + (list.length !== PA_SIT_ITEMS.length ? ' (filtered)' : '');
  var prev = document.getElementById('sit-prev');
  var next = document.getElementById('sit-next');
  if(prev) prev.disabled = PA_SIT_INDEX <= 0;
  if(next) next.disabled = PA_SIT_INDEX >= list.length - 1;
  box.innerHTML = window.PFSituations ? window.PFSituations.render(item) : '';
  if(window.PFSituations) window.PFSituations.renderAll(box);
  paSitRenderCatalogue(list);
  paSitRenderRelated(item);
  paSitRenderNote(item);
  paSitSyncActionButtons(item);
  paSitApplyDeterrents();
  var p = paSitProgress();
  p.last = item.id;
  paSitSaveProgress(p);
}
function paSitOpenByIndex(i){
  var idx = parseInt(i, 10);
  if(isNaN(idx)) return;
  var list = paSitVisibleItems();
  var item = PA_SIT_ITEMS[idx];
  var at = list.indexOf(item);
  if(at === -1){
    PA_SIT_STAGE = ''; PA_SIT_DOMAIN = ''; PA_SIT_MESSAGE = ''; PA_SIT_FAILURE = '';
    PA_SIT_LEVEL = ''; PA_SIT_RESOLUTION = ''; PA_SIT_QUERY = ''; PA_SIT_BOOKMARKED_ONLY = false;
    paSitSyncFilterControls();
    PA_SIT_INDEX = idx;
  } else {
    PA_SIT_INDEX = at;
  }
  paSitRender();
}
function paSitSyncFilterControls(){
  var map = [['sit-domain-filter', PA_SIT_DOMAIN], ['sit-message-filter', PA_SIT_MESSAGE],
             ['sit-failure-filter', PA_SIT_FAILURE], ['sit-level-filter', PA_SIT_LEVEL],
             ['sit-resolution-filter', PA_SIT_RESOLUTION]];
  map.forEach(function(pair){
    var el = document.getElementById(pair[0]);
    if(el) el.value = pair[1];
  });
  var q = document.getElementById('sit-search');
  if(q) q.value = PA_SIT_QUERY;
  var bo = document.getElementById('sit-bookmarked-only');
  if(bo) bo.checked = PA_SIT_BOOKMARKED_ONLY;
  document.querySelectorAll('.sit-stage-tab').forEach(function(t){
    var on = String(t.getAttribute('data-stage') || '') === String(PA_SIT_STAGE || '');
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
  });
}
function paSitPrev(){
  if(PA_SIT_INDEX > 0){ PA_SIT_INDEX -= 1; paSitRender(); }
}
function paSitNext(){
  if(PA_SIT_INDEX < paSitVisibleItems().length - 1){ PA_SIT_INDEX += 1; paSitRender(); }
}
function paSitJump(v){
  var i = parseInt(v, 10);
  if(!isNaN(i)){ PA_SIT_INDEX = i; paSitRender(); }
}
function paSitStageTab(stage, btn){
  PA_SIT_STAGE = stage || '';
  PA_SIT_INDEX = 0;
  paSitSyncFilterControls();
  paSitRender();
}
function paSitFilterDomain(v){ PA_SIT_DOMAIN = v || ''; PA_SIT_INDEX = 0; paSitRender(); }
function paSitFilterMessage(v){ PA_SIT_MESSAGE = v || ''; PA_SIT_INDEX = 0; paSitRender(); }
function paSitFilterFailure(v){ PA_SIT_FAILURE = v || ''; PA_SIT_INDEX = 0; paSitRender(); }
function paSitFilterLevel(v){ PA_SIT_LEVEL = v || ''; PA_SIT_INDEX = 0; paSitRender(); }
function paSitFilterResolution(v){ PA_SIT_RESOLUTION = v || ''; PA_SIT_INDEX = 0; paSitRender(); }
function paSitFilterBookmarked(on){ PA_SIT_BOOKMARKED_ONLY = !!on; PA_SIT_INDEX = 0; paSitRender(); }
function paSitSearch(q){
  PA_SIT_QUERY = (q || '').trim().toLowerCase();
  PA_SIT_INDEX = 0;
  paSitRender();
}
function paSitToggleBookmark(){
  var list = paSitVisibleItems();
  var item = list[PA_SIT_INDEX];
  if(!item) return;
  var p = paSitProgress();
  if(p.bookmarked[item.id]) delete p.bookmarked[item.id];
  else p.bookmarked[item.id] = true;
  paSitSaveProgress(p);
  paSitRender();
}
function paSitToggleDone(){
  var list = paSitVisibleItems();
  var item = list[PA_SIT_INDEX];
  if(!item) return;
  var p = paSitProgress();
  if(p.completed[item.id]) delete p.completed[item.id];
  else p.completed[item.id] = true;
  paSitSaveProgress(p);
  paSitRender();
}
/* Copy deterrents on protected content. The same protection applies
   to the unlocked paid content and to the free samples: no
   right-click menu, no text selection, no drag, no copy or cut keys
   inside the protected area. */
var PA_SIT_KEYS_WIRED = false;
function paSitProtectElement(box){
  if(!box || box.getAttribute('data-sit-protected')) return;
  box.setAttribute('data-sit-protected', '1');
  box.classList.add('sit-protected');
  box.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  box.addEventListener('dragstart', function(e){ e.preventDefault(); });
  box.addEventListener('copy', function(e){ e.preventDefault(); });
  box.addEventListener('cut', function(e){ e.preventDefault(); });
  if(!PA_SIT_KEYS_WIRED){
    PA_SIT_KEYS_WIRED = true;
    document.addEventListener('keydown', function(e){
      var t = e.target;
      var inside = (t && t.closest) ? t.closest('.sit-protected') : null;
      if(!inside) return;
      if((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x' || e.key === 'a' || e.key === 's' || e.key === 'p')){
        e.preventDefault();
      }
    });
  }
}
function paSitApplyDeterrents(){
  var box = document.getElementById('sit-content');
  paSitProtectElement(box);
}
/* Export and restore of the buyer own data (ChatGPT review P1#4,
   9 Nov 2026). The export is user data only: completed, bookmarked,
   notes, the Stage 6 review and where they left off. Situation
   content is never included. Restore replaces the stored progress
   in this browser with the imported file after validation, and
   reports the result in the workspace bar. */
function paSitExportData(){
  var st = document.getElementById('sit-data-status');
  var p = paSitProgress();
  var payload = {
    format: 'payment-situations-user-data',
    version: 1,
    exported_at: new Date().toISOString(),
    product: 'situations-500',
    data: {
      completed: p.completed || {},
      bookmarked: p.bookmarked || {},
      notes: p.notes || {},
      last: p.last || '',
      review: p.review || {}
    }
  };
  var blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'payment-situations-my-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  if(st) st.textContent = 'Exported your notes, bookmarks and progress. Situation content is never included.';
}
function paSitImportFile(input){
  var st = document.getElementById('sit-data-status');
  var file = input && input.files && input.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(){
    var ok = false;
    try {
      var parsed = JSON.parse(reader.result);
      if(parsed && parsed.format && parsed.format !== 'payment-situations-user-data') throw new Error('wrong file');
      var d = (parsed && parsed.data) ? parsed.data : parsed;
      if(!d || typeof d !== 'object' || Array.isArray(d)) throw new Error('bad shape');
      var clean = {completed: {}, bookmarked: {}, notes: {}, last: '', review: {}};
      ['completed', 'bookmarked'].forEach(function(k){
        var v = d[k];
        if(v && typeof v === 'object' && !Array.isArray(v)){
          Object.keys(v).forEach(function(id){ if(v[id]) clean[k][id] = true; });
        }
      });
      if(d.notes && typeof d.notes === 'object' && !Array.isArray(d.notes)){
        Object.keys(d.notes).forEach(function(id){
          if(typeof d.notes[id] === 'string' && d.notes[id].trim()) clean.notes[id] = d.notes[id];
        });
      }
      if(typeof d.last === 'string') clean.last = d.last;
      if(d.review && typeof d.review === 'object' && !Array.isArray(d.review)){
        Object.keys(d.review).forEach(function(id){ if(d.review[id]) clean.review[id] = true; });
      }
      paSitSaveProgress(clean);
      ok = true;
    } catch(e){
      ok = false;
    }
    if(ok){
      var rv = document.getElementById('sit-review');
      if(rv) rv.removeAttribute('data-sit-rendered');
      if(st) st.textContent = 'Imported. Your notes, bookmarks, progress and review are restored in this browser.';
      paSitRender();
    } else {
      if(st) st.textContent = 'That file is not a Payment Situations export. Nothing was changed.';
    }
    input.value = '';
  };
  reader.readAsText(file);
}
/* Free samples (ChatGPT review P1#2, 9 Nov 2026). The samples file
   holds ONLY the 10 sample items and loads ungated, unlike the full
   data file, which loads only after the access gate passes. Each
   sample renders through the same PFSituations component as the paid
   items, and the samples area carries the same copy protection. */
function paSitLoadSamples(){
  var box = document.getElementById('sit-samples-list');
  if(!box) return;
  if(window.PA_SITUATION_SAMPLES && window.PA_SITUATION_SAMPLES.length){
    paSitRenderSamples(window.PA_SITUATION_SAMPLES);
    return;
  }
  var s = document.createElement('script');
  s.src = 'assets/situations-samples.js';
  s.onload = function(){
    paSitRenderSamples(window.PA_SITUATION_SAMPLES || []);
  };
  s.onerror = function(){
    box.innerHTML = '<p class="sit-note">The free samples could not be loaded. Please refresh the page.</p>';
  };
  document.head.appendChild(s);
}
function paSitRenderSamples(samples){
  var box = document.getElementById('sit-samples-list');
  if(!box) return;
  if(!samples.length){
    box.innerHTML = '<p class="sit-note">The free samples are being prepared.</p>';
    return;
  }
  var html = '';
  samples.forEach(function(it){
    var payload = JSON.stringify(it).replace(/</g, '\u003c').replace(/>/g, '\u003e');
    html += '<div class="sit-sample-item" data-sit-visual><script type="application/json">' + payload + '<\/script></div>';
  });
  box.innerHTML = html;
  if(window.PFSituations){
    window.PFSituations.renderAll(box);
    if(window.PFSituations.init) window.PFSituations.init();
  }
  paSitProtectElement(box);
}
function paUnlockSituations(){
  var st = document.getElementById('sit-unlock-status');
  var input = document.getElementById('sit-claim-id');
  var claimId = input ? (input.value || '').trim() : '';
  if(!claimId){ if(st) st.textContent = 'Enter your claim id first.'; return; }
  if(typeof paGrantSituationsAccess !== 'function'){
    if(st) st.textContent = 'Unlock is not available on this page yet. Please refresh and try again.';
    return;
  }
  if(paGrantSituationsAccess(claimId)){
    if(st) st.textContent = 'Unlocked. Welcome to Payment Situations.';
    paSitShowContent();
  } else {
    if(st) st.textContent = 'That claim id does not match a submitted payment for this product. Check the claim id from your payment submission, or contact the owner with your UTR.';
  }
}
function paSitShowContent(){
  var wall = document.getElementById('sit-paywall');
  var owned = document.getElementById('sit-owned');
  var browser = document.getElementById('sit-browser');
  if(wall) wall.style.display = 'none';
  if(owned) owned.style.display = 'block';
  if(browser) browser.style.display = 'block';
  if(window.PA_SITUATIONS && window.PA_SITUATIONS.length){
    PA_SIT_ITEMS = window.PA_SITUATIONS;
    paSitRender();
  } else {
    paSitLoadData();
  }
}
function paSitLoadData(){
  if(window.PA_SITUATIONS && window.PA_SITUATIONS.length){
    PA_SIT_ITEMS = window.PA_SITUATIONS;
    paSitRender();
    return;
  }
  var s = document.createElement('script');
  s.src = 'assets/situations-data.js';
  s.onload = function(){
    PA_SIT_ITEMS = window.PA_SITUATIONS || [];
    paSitRender();
  };
  s.onerror = function(){
    var box = document.getElementById('sit-content');
    if(box) box.innerHTML = '<p class="sit-note">The situations data could not be loaded. Please refresh the page.</p>';
  };
  document.head.appendChild(s);
}
function paSitReadUrlParams(){
  var params = {};
  try { params = new URLSearchParams(window.location.search); } catch(e){ return; }
  var stage = params.get('stage');
  if(stage && ['1','2','3','4','5','6'].indexOf(stage) !== -1) PA_SIT_STAGE = stage;
  var msg = params.get('message');
  if(msg) PA_SIT_MESSAGE = msg;
  var q = params.get('q');
  if(q) PA_SIT_QUERY = q.trim().toLowerCase();
  var domain = params.get('domain');
  if(domain) PA_SIT_DOMAIN = domain;
  paSitSyncFilterControls();
}
document.addEventListener('DOMContentLoaded', function(){
  var wall = document.getElementById('sit-paywall');
  var browser = document.getElementById('sit-browser');
  if(!wall || !browser) return;
  paSitReadUrlParams();
  paSitLoadSamples();
  var hasAccess = (typeof paHasSituationsAccess === 'function') ? paHasSituationsAccess() : false;
  if(hasAccess){
    paSitShowContent();
  } else {
    wall.style.display = 'block';
    browser.style.display = 'none';
  }
});
