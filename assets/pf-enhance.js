/* ===== Learning activity log (10 Nov 2026): one browser-local record
   of which days had real learning activity, so the dashboard can show
   a streak and a weekly goal. Stored under
   payments-academy-activity-v1 as {days: {YYYY-MM-DD: {lessons: n,
   quizzes: n}}, recorded: {lessonId: YYYY-MM-DD}}. A lesson completion
   is recorded once per lesson id. Nothing leaves the browser. ===== */
function paRecordActivity(kind, lessonId){
  try{
    var key = 'payments-academy-activity-v1';
    var raw = null;
    try { raw = localStorage.getItem(key); } catch(e){ return; }
    var data = raw ? JSON.parse(raw) : {};
    if(!data.days) data.days = {};
    if(!data.recorded) data.recorded = {};
    if(lessonId && data.recorded[lessonId]) return;
    var today = new Date();
    var iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    if(!data.days[iso]) data.days[iso] = {};
    data.days[iso][kind] = (data.days[iso][kind] || 0) + 1;
    if(lessonId) data.recorded[lessonId] = iso;
    try { localStorage.setItem(key, JSON.stringify(data)); } catch(e){}
  }catch(e){}
}

/* Payments Training Hub enhancements: additive, no behaviour replaced */
(function(){
  try{var cur=document.querySelector('.side .lesson-list li.current');
    if(cur&&cur.scrollIntoView){var l=cur.parentNode;l.scrollTop=cur.offsetTop-l.offsetTop-60;}}catch(e){}
  document.addEventListener('keydown',function(e){
    if(/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||''))return;
    if(e.key==='Escape'){pfCloseDetail();return;}
    if(!document.querySelector('.studio'))return;
    var q=function(s){return document.querySelector(s)};
    if(e.key==='ArrowRight'&&e.shiftKey){var n=q('.upnext a, .studio-btn.primary');if(n&&n.href)location.href=n.href;}
  });
  /* FAQ: when a question opens, scroll it into view so the answer is
     visible without the user hunting for it. */
  document.addEventListener('toggle',function(e){
    var t=e.target;
    if(t&&t.classList&&t.classList.contains('faq-item')&&t.open){
      setTimeout(function(){if(t.scrollIntoView)t.scrollIntoView({behavior:'smooth',block:'start'});},30);
    }
  },true);
})();

/* ===== Homepage animated counters (7 Nov 2026): numbers with
   data-count count up when scrolled into view. Respects
   prefers-reduced-motion (sets the final value at once). ===== */
(function(){
  var els = document.querySelectorAll('[data-count]');
  if(!els.length) return;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function run(el){
    var target = parseInt(el.getAttribute('data-count'), 10);
    if(isNaN(target)) return;
    if(reduced){ el.textContent = target; return; }
    var start = null, dur = 1200;
    function step(ts){
      if(!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ run(en.target); io.unobserve(en.target); }
      });
    }, {threshold: 0.4});
    els.forEach(function(el){ io.observe(el); });
  } else {
    els.forEach(run);
  }
})();

/* ===== Shared detail drawer (6 Nov 2026): detail opens BESIDE the clicked
   item (right-side panel on desktop) or as a bottom sheet (mobile), never
   below the fold. Called from explorer, trace, playground, simulators and
   the ISO lab. ===== */
function pfEnsureDrawer(){
  var d=document.getElementById('pf-detail-drawer');
  if(d)return d;
  d=document.createElement('aside');
  d.id='pf-detail-drawer';
  d.className='pf-drawer';
  d.setAttribute('role','dialog');
  d.setAttribute('aria-modal','true');
  d.innerHTML='<div class="pf-drawer-head"><h2 id="pf-drawer-title">Details</h2>'+
    '<button type="button" class="pf-drawer-close" onclick="pfCloseDetail()">Close</button></div>'+
    '<div class="pf-drawer-body" id="pf-drawer-body"></div>';
  document.body.appendChild(d);
  var b=document.createElement('div');
  b.id='pf-detail-backdrop';
  b.className='pf-drawer-backdrop';
  b.addEventListener('click',pfCloseDetail);
  document.body.appendChild(b);
  return d;
}
function pfOpenDetail(title,html){
  var d=pfEnsureDrawer();
  var t=document.getElementById('pf-drawer-title');
  var body=document.getElementById('pf-drawer-body');
  if(t)t.textContent=title||'Details';
  if(body)body.innerHTML=html||'';
  d.classList.add('open');
  var b=document.getElementById('pf-detail-backdrop');
  if(b)b.classList.add('open');
  if(window.innerWidth<=900)document.body.classList.add('pf-drawer-open');
  if(body)body.scrollTop=0;
}
function pfCloseDetail(){
  var d=document.getElementById('pf-detail-drawer');
  if(d)d.classList.remove('open');
  var b=document.getElementById('pf-detail-backdrop');
  if(b)b.classList.remove('open');
  document.body.classList.remove('pf-drawer-open');
}
/* Scroll a detail pane into view on narrow screens, where the two-pane
   layout stacks (list on top, detail below). On desktop the detail is
   already beside the item, so this is a no-op there. */
function pfRevealDetail(el){
  if(!el)return;
  if(window.innerWidth<=900&&el.scrollIntoView){
    el.scrollIntoView({behavior:'smooth',block:'start'});
  }
}

/* Copy protection (11 Nov 2026): copy guards on content
   pages only (lessons, situations, guides, FAQ). The CSS in
   pf-theme.css already disables text selection on the same containers;
   this layer blocks the right-click menu and the Copy/Cut commands (keyboard, menu and Edit menu) when the selection
   sits inside protected content. Form fields, links, buttons and the
   header search are never blocked. This stops casual copying only:
   screenshots, OCR and view-source still work, so it is friction,
   not a guarantee. The faint watermark overlay was removed 12 Nov 2026
   on his order: no watermark div is injected any more. */
(function(){
  var PROTECTED = '.lesson-main, .sit-case, .sit-catalogue, .guide-page, .faq-answer, .pf-search-results';
  function inProtected(node){
    if(!node) return false;
    if(node.nodeType === 3) node = node.parentNode;
    if(!node || !node.closest) return false;
    return !!node.closest(PROTECTED);
  }
  function isFormField(el){
    return el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName || '');
  }
  document.addEventListener('contextmenu', function(e){
    if(inProtected(e.target) && !isFormField(e.target)) e.preventDefault();
  });
  document.addEventListener('copy', function(e){
    if(isFormField(e.target)) return;
    var sel = window.getSelection && window.getSelection();
    if(sel && sel.rangeCount && inProtected(sel.anchorNode)) e.preventDefault();
  });
  document.addEventListener('cut', function(e){
    if(isFormField(e.target)) return;
    var sel = window.getSelection && window.getSelection();
    if(sel && sel.rangeCount && inProtected(sel.anchorNode)) e.preventDefault();
  });
  document.addEventListener('keydown', function(e){
    if(!(e.ctrlKey || e.metaKey)) return;
    var k = (e.key || '').toLowerCase();
    if(k !== 'c' && k !== 'x') return;
    if(isFormField(e.target)) return;
    var sel = window.getSelection && window.getSelection();
    if(sel && sel.rangeCount && !sel.isCollapsed && inProtected(sel.anchorNode)) e.preventDefault();
  });
})();
