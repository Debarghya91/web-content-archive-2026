
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
      return v;
    }
  } catch(e){}
  return {completed: {}, bookmarked: {}, notes: {}, last: ''};
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
/* Copy deterrents on unlocked paid content only. */
function paSitApplyDeterrents(){
  var box = document.getElementById('sit-content');
  if(!box || box.getAttribute('data-sit-protected')) return;
  box.setAttribute('data-sit-protected', '1');
  box.classList.add('sit-protected');
  box.addEventListener('contextmenu', function(e){ e.preventDefault(); });
  box.addEventListener('dragstart', function(e){ e.preventDefault(); });
  box.addEventListener('copy', function(e){ e.preventDefault(); });
  box.addEventListener('cut', function(e){ e.preventDefault(); });
  document.addEventListener('keydown', function(e){
    if(!box.contains(document.activeElement) && !box.contains(e.target)) return;
    if((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x' || e.key === 'a' || e.key === 's' || e.key === 'p')){
      e.preventDefault();
    }
  });
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
  var hasAccess = (typeof paHasSituationsAccess === 'function') ? paHasSituationsAccess() : false;
  if(hasAccess){
    paSitShowContent();
  } else {
    wall.style.display = 'block';
    browser.style.display = 'none';
  }
});
