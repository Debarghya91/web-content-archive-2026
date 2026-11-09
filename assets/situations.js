
/* ===== 500 Payment Situations page ===== */
/* Gate first, data second: the item data file is requested only after
   paHasSituationsAccess() passes, so a plain view-source of this page
   shows no item content. Honest limit: the data file is a static
   asset, so a determined user who inspects network requests can fetch
   it, and screenshots cannot be prevented. Real server-side
   enforcement needs the Supabase backend. */
var PA_SIT_ITEMS = [];
var PA_SIT_INDEX = 0;
var PA_SIT_MODULE = '';
var PA_SIT_QUERY = '';
function paSitVisibleItems(){
  return PA_SIT_ITEMS.filter(function(it){
    if(PA_SIT_MODULE && (it.module || '') !== PA_SIT_MODULE) return false;
    if(PA_SIT_QUERY && (it.title || '').toLowerCase().indexOf(PA_SIT_QUERY) === -1) return false;
    return true;
  });
}
function paSitRender(){
  var box = document.getElementById('sit-content');
  if(!box) return;
  var list = paSitVisibleItems();
  if(!PA_SIT_ITEMS.length){
    box.innerHTML = '<p class="sit-note">The 500 situations are being prepared.</p>';
    return;
  }
  if(!list.length){
    box.innerHTML = '<p class="sit-note">No situations match this filter.</p>';
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
  paSitFillJump(list);
  paSitApplyDeterrents();
}
function paSitFillJump(list){
  var sel = document.getElementById('sit-jump');
  if(!sel) return;
  var cur = list[PA_SIT_INDEX];
  sel.innerHTML = '';
  list.forEach(function(it, i){
    var o = document.createElement('option');
    o.value = String(i);
    o.textContent = (PA_SIT_ITEMS.indexOf(it) + 1) + '. ' + (it.title || it.id || '');
    if(it === cur) o.selected = true;
    sel.appendChild(o);
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
function paSitFilterModule(m){
  PA_SIT_MODULE = m || '';
  PA_SIT_INDEX = 0;
  paSitRender();
}
function paSitSearch(q){
  PA_SIT_QUERY = (q || '').trim().toLowerCase();
  PA_SIT_INDEX = 0;
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
    if(st) st.textContent = 'Unlocked. Welcome to 500 Payment Situations.';
    paSitShowContent();
  } else {
    if(st) st.textContent = 'That claim id does not match a submitted payment for this product. Check the claim id from your payment submission, or contact the owner with your UTR.';
  }
}
function paSitShowContent(){
  var wall = document.getElementById('sit-paywall');
  var browser = document.getElementById('sit-browser');
  if(wall) wall.style.display = 'none';
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
document.addEventListener('DOMContentLoaded', function(){
  var wall = document.getElementById('sit-paywall');
  var browser = document.getElementById('sit-browser');
  if(!wall || !browser) return;
  var hasAccess = (typeof paHasSituationsAccess === 'function') ? paHasSituationsAccess() : false;
  if(hasAccess){
    paSitShowContent();
  } else {
    wall.style.display = 'block';
    browser.style.display = 'none';
  }
});
