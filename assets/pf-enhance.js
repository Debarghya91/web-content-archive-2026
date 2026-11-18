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
/* Scroll rule (15 Nov 2026): every scrollable view opens at the top
   on every entry, and Back navigation lands at the top too. The old
   sidebar auto-scroll to the current lesson is removed, and scroll
   restoration is off, so the browser never re-enters a page
   mid-scroll. Explicit #fragment links still work: this only stops
   automatic restoration. */
(function(){
  try{ if('scrollRestoration' in history) history.scrollRestoration = 'manual'; }catch(e){}
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

/* ===== Collapsible side panels and sticky narration bar (17 Nov 2026) ===== */
/* Task A: the "In this chapter" rail and, on desktop, the left drawer
   collapse fully and the rest of the page reflows into the freed
   width. The collapsed state persists in localStorage across page
   navigation. Task B: a sticky bar at the top of every page with
   narration shows the real playback state and lets the reader stop
   or start the voice from any scroll position. The bar and the
   floating button both read the same audio element, so they can
   never disagree. Locked lessons show no bar: the gating code hides
   the player, and the bar stays hidden with it. All styles are
   injected here, following the paGateStyles precedent, because the
   three-home CSS parity files live outside this tree. */
(function(){
'use strict';
function paUi$(s, r){ try { return (r || document).querySelector(s); } catch(e){ return null; } }
function paUiAll(s, r){ try { return Array.prototype.slice.call((r || document).querySelectorAll(s)); } catch(e){ return []; } }
function paUiLsGet(k){ try { return window.localStorage.getItem(k); } catch(e){ return null; } }
function paUiLsSet(k, v){ try { window.localStorage.setItem(k, v); } catch(e){} }
function paUiStyles(){
  if(document.getElementById('pa-ui-styles')) return;
  var css = [
    'body.pa-ui-rail-hidden .course-rail{display:none;}',
    'body.pa-ui-rail-hidden .lesson-shell{grid-template-columns:minmax(0,1fr) auto;}',
    '.pa-ui-rail-restore{display:none;position:fixed;left:12px;top:148px;z-index:140;width:40px;height:40px;box-sizing:border-box;align-items:center;justify-content:center;background:#FFFFFF;border:1px solid #E8EDF5;border-radius:10px;box-shadow:0 2px 10px rgba(13,28,56,.16);padding:0;color:#0D1C38;cursor:pointer;}',
    'body.pa-ui-rail-hidden .pa-ui-rail-restore{display:inline-flex;}',
    '.pa-ui-rail-collapse{background:none;border:0;color:#0056D2;cursor:pointer;font-size:14px;padding:4px 6px;white-space:nowrap;}',
    '.pa-ui-rail-collapse:hover{text-decoration:underline;}',
    '@media (min-width:1024px){',
    'body.pa-ui-drawer-hidden #pfDrawer.pf-drawer{display:none;}',
    'body.pf-has-drawer.pa-ui-drawer-hidden{padding-left:0;}',
    'body.pa-ui-drawer-hidden .pa-ui-drawer-restore{display:inline-flex;}',
    '.pa-ui-rail-restore{left:372px;}',
    'body.pa-ui-drawer-hidden .pa-ui-rail-restore{left:12px;}',
    '}',
    '.pa-ui-drawer-restore{display:none;position:fixed;left:12px;top:96px;z-index:140;width:40px;height:40px;box-sizing:border-box;align-items:center;justify-content:center;background:#0D1C38;color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:0;cursor:pointer;box-shadow:0 2px 10px rgba(13,28,56,.25);}',
    '.pa-ui-drawer-restore svg,.pa-ui-rail-restore svg{width:20px;height:20px;display:block;}',
    '.pa-ui-drawer-restore:hover,.pa-ui-rail-restore:hover{box-shadow:0 4px 16px rgba(13,28,56,.24);}',
    '.pa-ui-drawer-restore:focus-visible,.pa-ui-rail-restore:focus-visible{outline:2px solid #0056D2;outline-offset:2px;}',
    '.pa-ui-drawer-collapse{margin-left:auto;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.30);color:#fff;border-radius:8px;padding:4px 8px;font-size:12px;cursor:pointer;white-space:nowrap;}',
    '.pa-ui-now-playing{position:sticky;top:0;z-index:140;display:flex;align-items:center;gap:10px;height:44px;box-sizing:border-box;padding:0 12px;background:#0D1C38;color:#FFFFFF;font-size:14px;}',
    '.pa-ui-now-playing[hidden]{display:none;}',
    'body.pa-ui-gated-audio .pf-float-audio{display:none;}',
    '.pa-ui-now-playing .pa-ui-np-toggle{flex:0 0 auto;width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.45);background:rgba(255,255,255,.12);color:#fff;font-size:13px;line-height:1;cursor:pointer;padding:0;}',
    '.pa-ui-now-playing .pa-ui-np-state{flex:0 0 auto;font-weight:700;white-space:nowrap;}',
    '.pa-ui-now-playing .pa-ui-np-title{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#D8E2F5;}',
    'body.pa-ui-np-on .pf-topbar-app{top:44px;}',
    'html.pf-dark .pa-ui-now-playing{background:#111827;color:#E5E7EB;border-bottom:1px solid #374151;}',
    'html.pf-dark .pa-ui-now-playing .pa-ui-np-title{color:#9CA3AF;}',
    'html.pf-dark .pa-ui-rail-collapse{color:#93C5FD;}',
    'html.pf-dark .pa-ui-rail-restore{background:#111827;border-color:#374151;color:#E5E7EB;}',
    'html.pf-dark .pa-ui-drawer-restore{background:#1F2937;border-color:#374151;color:#E5E7EB;}'
  ].join('\n');
  var st = document.createElement('style');
  st.id = 'pa-ui-styles';
  st.type = 'text/css';
  st.appendChild(document.createTextNode(css));
  document.head.appendChild(st);
}
var RAIL_KEY = 'pa-ui-rail-hidden';
var DRAWER_KEY = 'pa-ui-drawer-hidden';
function paUiApplyPanels(){
  document.body.classList.toggle('pa-ui-rail-hidden', paUiLsGet(RAIL_KEY) === '1');
  document.body.classList.toggle('pa-ui-drawer-hidden', paUiLsGet(DRAWER_KEY) === '1');
}
function paUiInitPanels(){
  paUiApplyPanels();
  var railHead = paUi$('.course-rail .rail-head');
  if(railHead && !paUi$('.pa-ui-rail-collapse', railHead)){
    var hide = document.createElement('button');
    hide.type = 'button';
    hide.className = 'pa-ui-rail-collapse';
    hide.textContent = 'Hide';
    hide.setAttribute('aria-label', 'Hide the chapter panel');
    hide.addEventListener('click', function(){
      paUiLsSet(RAIL_KEY, '1');
      document.body.classList.add('pa-ui-rail-hidden');
      document.body.classList.remove('pa-ui-rail-playback-hidden');
    });
    railHead.appendChild(hide);
  }
  /* Restore is a fixed floating icon button, not an in-flow button: the lesson
     title row is hidden on locked lessons and gating hides children
     of .lesson-main, so no in-flow host is reliably visible. The tab
     sits below the drawer restore tab and is reachable from any
     scroll position. */
  if(paUi$('.course-rail') && !paUi$('.pa-ui-rail-restore')){
    var show = document.createElement('button');
    show.type = 'button';
    show.className = 'pa-ui-rail-restore';
    show.innerHTML = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="14" height="12" rx="2"/><path d="M8 4v12" stroke-linecap="round"/></svg>';
    show.setAttribute('aria-label', 'Show the chapter panel');
    show.title = 'Show chapter panel';
    show.addEventListener('click', function(){
      paUiLsSet(RAIL_KEY, '0');
      document.body.classList.remove('pa-ui-rail-hidden');
      document.body.classList.remove('pa-ui-rail-playback-hidden');
    });
    document.body.appendChild(show);
  }
  var drawer = document.getElementById('pfDrawer');
  if(drawer){
    var brand = paUi$('.pf-drawer-brand', drawer);
    if(brand && !paUi$('.pa-ui-drawer-collapse', brand)){
      var dh = document.createElement('button');
      dh.type = 'button';
      dh.className = 'pa-ui-drawer-collapse';
      dh.textContent = 'Hide';
      dh.setAttribute('aria-label', 'Hide the menu panel');
      dh.addEventListener('click', function(){
        paUiLsSet(DRAWER_KEY, '1');
        document.body.classList.add('pa-ui-drawer-hidden');
      });
      brand.appendChild(dh);
    }
    if(!paUi$('.pa-ui-drawer-restore')){
      var dr = document.createElement('button');
      dr.type = 'button';
      dr.className = 'pa-ui-drawer-restore';
      dr.innerHTML = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14"/></svg>';
      dr.setAttribute('aria-label', 'Show the menu panel');
      dr.title = 'Menu';
      dr.addEventListener('click', function(){
        paUiLsSet(DRAWER_KEY, '0');
        document.body.classList.remove('pa-ui-drawer-hidden');
      });
      document.body.appendChild(dr);
    }
  }
}
var paUiNpBar = null, paUiNpBtn = null, paUiNpState = null, paUiNpTitle = null;
var paUiNpCurrent = null;
/* Playback-triggered panel hide (17 Nov 2026, owner rule): on lesson
   pages only, starting playback hides the chapter panel so the content
   expands, using the same body.pa-ui-rail-hidden reflow as the manual
   Hide button. Pausing or ending restores the panel, but only when
   playback hid it: the body marker pa-ui-rail-playback-hidden records
   that, and the manual Hide/Show handlers above clear it, so a manual
   Hide stays hidden and a manual Show during playback stays shown
   until the next fresh play event. The learner can switch the
   behaviour off with the "Hide side panel while playing" option next
   to the lesson style toggle (key pa-ui-hide-panel-while-playing,
   default on); the option lives in assets/bundles.js and shares this
   key and marker. No timer, no pointer watching. */
var PA_UI_PANEL_HIDE_KEY = 'pa-ui-hide-panel-while-playing';
var paUiPlaybackHideWired = false;
function paUiPanelHideEnabled(){ return paUiLsGet(PA_UI_PANEL_HIDE_KEY) !== '0'; }
function paUiAnyMediaPlaying(){
  var m = paUiAll('audio, video');
  for(var i = 0; i < m.length; i++){ if(!m[i].paused && !m[i].ended) return true; }
  return false;
}
function paUiPlaybackHideOnPlay(){
  if(!paUiPanelHideEnabled()) return;
  if(paUiLsGet(RAIL_KEY) === '1') return;
  if(document.body.classList.contains('pa-ui-rail-playback-hidden')) return;
  document.body.classList.add('pa-ui-rail-hidden');
  document.body.classList.add('pa-ui-rail-playback-hidden');
}
function paUiPlaybackHideOnStop(){
  if(!document.body.classList.contains('pa-ui-rail-playback-hidden')) return;
  if(paUiAnyMediaPlaying()) return;
  document.body.classList.remove('pa-ui-rail-playback-hidden');
  document.body.classList.remove('pa-ui-rail-hidden');
}
function paUiInitPlaybackHide(){
  if(paUiPlaybackHideWired) return;
  if(!paUi$('.course-rail')) return;
  paUiPlaybackHideWired = true;
  document.addEventListener('play', paUiPlaybackHideOnPlay, true);
  document.addEventListener('pause', paUiPlaybackHideOnStop, true);
  document.addEventListener('ended', paUiPlaybackHideOnStop, true);
}
/* Sidebar close on learning click (17 Nov 2026, owner rule): the
   side panels close themselves once the user clicks a learning
   link, and not before. There is no close on load, hover, scroll
   or outside click: only a real navigation click closes a panel.
   A link inside the menu drawer closes the drawer; a link inside
   the chapter panel closes the chapter panel; a link to a learning
   destination anywhere on the page closes both, so the content
   opens full width. The closed state persists, exactly like the
   manual Hide buttons, and the Menu / Show chapter panel tabs
   reopen the panels. Modifier-key, middle-button, new-tab,
   download and in-page anchor clicks never close a panel: the
   page stays, so the panels stay. */
function paUiCloseDrawerPanel(){
  paUiLsSet(DRAWER_KEY, '1');
  document.body.classList.add('pa-ui-drawer-hidden');
}
function paUiCloseRailPanel(){
  paUiLsSet(RAIL_KEY, '1');
  document.body.classList.add('pa-ui-rail-hidden');
  document.body.classList.remove('pa-ui-rail-playback-hidden');
}
function paUiClickLink(el){
  while(el && el.nodeType === 1){
    if(el.tagName === 'A') return el;
    el = el.parentNode;
  }
  return null;
}
function paUiIsPlainNavClick(ev){
  if(!ev) return false;
  if(typeof ev.button === 'number' && ev.button !== 0) return false;
  if(ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return false;
  return true;
}
function paUiLinkPath(a){
  var href = '';
  try{ href = a.getAttribute('href') || ''; }catch(e){ return ''; }
  if(!href || href.charAt(0) === '#' || href.indexOf('javascript:') === 0
     || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return '';
  try{
    var u = new URL(href, window.location.href);
    if(u.origin !== window.location.origin) return '';
    return u.pathname || '';
  }catch(e){ return ''; }
}
function paUiIsLearningPath(path){
  if(!path) return false;
  if(path.indexOf('/lessons/') !== -1 || path.indexOf('/chapters/') !== -1
     || path.indexOf('/courses/') !== -1 || path.indexOf('/situations/') !== -1
     || path.indexOf('/practice/') !== -1 || path.indexOf('/tests/') !== -1
     || path.indexOf('/simulators/') !== -1 || path.indexOf('/labs/') !== -1) return true;
  var file = path.split('/').pop() || '';
  return file === 'courses.html' || file === 'curriculum-index.html'
    || file === 'course-map.html' || file === 'situations.html'
    || file === 'situation.html' || file === 'practice.html'
    || file === 'tests.html' || file === 'diagnostic.html'
    || file === 'mission-control.html' || file === 'reconciliation-war-room.html'
    || file === 'labs-simulators.html' || file === 'weekly-case.html'
    || file === 'simulators.html' || file === 'labs.html'
    || file === 'explorer.html' || file === 'iso-lab.html'
    || file === 'mapping-workbench.html' || file === 'investigation-lab.html'
    || file === 'ba-studio.html';
}
var paUiSidebarCloseWired = false;
function paUiInitSidebarClose(){
  if(paUiSidebarCloseWired) return;
  paUiSidebarCloseWired = true;
  document.addEventListener('click', function(ev){
    if(!paUiIsPlainNavClick(ev)) return;
    var t = null;
    try{ t = ev.target || null; }catch(e){ return; }
    var a = paUiClickLink(t);
    if(!a) return;
    try{
      if(a.getAttribute('target') === '_blank' || a.hasAttribute('download')) return;
    }catch(e){}
    var path = paUiLinkPath(a);
    if(!path) return;
    var inDrawer = false, inRail = false;
    var el = a;
    while(el && el.nodeType === 1){
      if(el.id === 'pfDrawer') inDrawer = true;
      if(el.classList && el.classList.contains('course-rail')) inRail = true;
      el = el.parentNode;
    }
    var learning = paUiIsLearningPath(path);
    if(inDrawer || learning) paUiCloseDrawerPanel();
    if(inRail || learning) paUiCloseRailPanel();
  });
}
/* One voice at a time, and voices stop on tab switch (17 Nov 2026,
   owner rule): the flow video voice and the lesson narration must
   never play together. When any audio or video starts, every other
   playing media element on the page is paused first, so at most one
   voice is ever audible. When the user switches tab, the page is
   hidden and every voice stops; nothing resumes on its own when the
   tab returns. Media events do not bubble, so the play listener
   uses the capture phase, like the playback-hide wiring above. */
var paUiSingleVoiceWired = false;
function paUiStopOtherVoices(keep){
  var m = paUiAll('audio, video');
  for(var i = 0; i < m.length; i++){
    if(m[i] !== keep && !m[i].paused){
      try{ m[i].pause(); }catch(e){}
    }
  }
}
function paUiInitSingleVoice(){
  if(paUiSingleVoiceWired) return;
  paUiSingleVoiceWired = true;
  document.addEventListener('play', function(ev){
    paUiStopOtherVoices(ev.target || null);
  }, true);
  document.addEventListener('visibilitychange', function(){
    try{
      if(document.hidden) paUiStopOtherVoices(null);
    }catch(e){}
  });
}
/* Canvas rest state (17 Nov 2026): in the Canvas lesson style the
   studio canvas is a tall dark box that sits empty until the lesson
   first plays. Mark each studio player at rest so CSS hides the box;
   the first play event on its audio clears the mark for good, so
   pausing mid-lesson never collapses the diagram. Players whose audio
   is already playing, or has a saved position, are never marked. */
function paUiCanvasRestMark(){
  paUiAll('.studio').forEach(function(st){
    if(st.getAttribute('data-pa-played') === '1') return;
    var a = null;
    try { a = st.querySelector('audio'); } catch(e){}
    if(!a){
      try { a = document.getElementById('studio-audio-' + String(st.id || '').replace(/^studio-/, '')); } catch(e){}
    }
    if(!a) return;
    try {
      if(!a.paused || (a.currentTime && a.currentTime >= 0.5)){
        st.setAttribute('data-pa-played', '1');
        st.classList.remove('pa-studio-rest');
      } else {
        st.classList.add('pa-studio-rest');
      }
    } catch(e){}
  });
}
function paUiInitCanvasRest(){
  document.addEventListener('play', function(ev){
    var t = ev.target;
    if(!t || !t.closest) return;
    var st = t.closest('.studio');
    if(st){
      st.setAttribute('data-pa-played', '1');
      st.classList.remove('pa-studio-rest');
    }
  }, true);
  paUiCanvasRestMark();
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', paUiCanvasRestMark);
  }
  setTimeout(paUiCanvasRestMark, 2000);
}
function paUiNpAudios(){ return paUiAll('audio'); }
function paUiNpVisible(a){
  /* The audio element itself computes display:none (no controls
     attribute), so judge its ancestors, not itself. Gating hides a
     container, never the bare audio tag, and marks it. */
  if(a.getAttribute && a.getAttribute('data-pa-gate-hidden')) return false;
  var el = a.parentNode;
  while(el && el.nodeType === 1){
    if(el.getAttribute && el.getAttribute('data-pa-gate-hidden')) return false;
    try { if(window.getComputedStyle(el).display === 'none') return false; } catch(e){}
    if(el === document.body) break;
    el = el.parentNode;
  }
  return true;
}
function paUiNpPick(){
  var list = paUiNpAudios();
  var first = null;
  for(var i = 0; i < list.length; i++){
    if(paUiNpVisible(list[i])){ first = list[i]; break; }
  }
  if(paUiNpCurrent && paUiNpVisible(paUiNpCurrent)) return paUiNpCurrent;
  return first;
}
function paUiNpTitleText(){
  var h1 = paUi$('h1');
  var t = h1 ? (h1.textContent || '').replace(/\s+/g, ' ').trim() : '';
  if(!t) t = (document.title || '').replace(/\s+/g, ' ').trim();
  if(t.length > 60) t = t.slice(0, 57) + '...';
  return t || 'Narration';
}
function paUiNpSync(){
  if(!paUiNpBar) return;
  paUiNpCurrent = paUiNpPick();
  /* Gating enforcement (17 Nov 2026): on a locked lesson the gating
     code hides the player, but the per-page floating button script
     reads the hidden player card as "out of view" and shows the
     button, which plays the locked audio. A gating marker on any
     audio hides the floating button and stops gated playback. The
     marker, not display state, is the signal, so a transient hide
     during a scene change never pauses a free lesson. */
  var gated = false;
  paUiNpAudios().forEach(function(a){
    var el = a;
    var marked = false;
    while(el && el.nodeType === 1){
      if(el.getAttribute && el.getAttribute('data-pa-gate-hidden')){ marked = true; break; }
      if(el === document.body) break;
      el = el.parentNode;
    }
    if(marked){
      gated = true;
      if(!a.paused){ try { a.pause(); } catch(e){} }
    }
  });
  document.body.classList.toggle('pa-ui-gated-audio', gated);
  var a = paUiNpCurrent;
  if(!a){
    paUiNpBar.hidden = true;
    document.body.classList.remove('pa-ui-np-on');
    return;
  }
  paUiNpBar.hidden = false;
  document.body.classList.add('pa-ui-np-on');
  var playing = !a.paused && !a.ended;
  paUiNpBtn.textContent = playing ? '\u23F8' : '\u25B6';
  paUiNpBtn.setAttribute('aria-label', playing ? 'Pause the narration' : 'Play the narration');
  paUiNpState.textContent = a.ended ? 'Finished' : (playing ? 'Playing' : 'Paused');
  paUiNpTitle.textContent = paUiNpTitleText();
}
function paUiNpSampleId(a){
  var id = a.id || '';
  if(id.indexOf('studio-audio-') === 0) return id.slice('studio-audio-'.length);
  return '';
}
function paUiNpToggle(){
  var a = paUiNpCurrent;
  if(!a){ paUiNpSync(); a = paUiNpCurrent; }
  if(!a) return;
  var sid = paUiNpSampleId(a);
  if(sid && typeof window.studioTogglePlay === 'function' && window.PA_STUDIOS && window.PA_STUDIOS[sid]){
    window.studioTogglePlay(sid);
  } else if(a.paused){
    try { var p = a.play(); if(p && p.catch) p.catch(function(){}); } catch(e){}
  } else {
    try { a.pause(); } catch(e){}
  }
  paUiNpSync();
}
function paUiNpBind(a){
  if(!a || a.__paUiNpBound) return;
  a.__paUiNpBound = true;
  a.addEventListener('play', function(){ paUiNpCurrent = a; paUiNpSync(); });
  a.addEventListener('pause', paUiNpSync);
  a.addEventListener('ended', paUiNpSync);
  a.addEventListener('loadedmetadata', paUiNpSync);
}
function paUiNpInit(){
  if(paUiNpBar || document.getElementById('paUiNowPlaying')) return;
  var bar = document.createElement('div');
  bar.className = 'pa-ui-now-playing';
  bar.id = 'paUiNowPlaying';
  bar.hidden = true;
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Narration playback');
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pa-ui-np-toggle';
  btn.setAttribute('aria-label', 'Play the narration');
  btn.textContent = '\u25B6';
  btn.addEventListener('click', paUiNpToggle);
  var state = document.createElement('span');
  state.className = 'pa-ui-np-state';
  state.textContent = 'Paused';
  var title = document.createElement('span');
  title.className = 'pa-ui-np-title';
  bar.appendChild(btn);
  bar.appendChild(state);
  bar.appendChild(title);
  document.body.insertBefore(bar, document.body.firstChild);
  paUiNpBar = bar;
  paUiNpBtn = btn;
  paUiNpState = state;
  paUiNpTitle = title;
  paUiNpAudios().forEach(paUiNpBind);
  paUiNpSync();
  /* Gating hides the player asynchronously after the sign-in check,
     and players can arrive late: re-sync on DOM changes and once
     more after gating has had time to settle. */
  var pending = false;
  function schedule(){
    if(pending) return;
    pending = true;
    setTimeout(function(){
      pending = false;
      paUiNpAudios().forEach(paUiNpBind);
      paUiNpSync();
    }, 120);
  }
  if('MutationObserver' in window){
    try {
      var mo = new MutationObserver(schedule);
      mo.observe(document.body, {subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'class', 'data-pa-gate-hidden']});
    } catch(e){}
  }
  setTimeout(paUiNpSync, 2000);
}
paUiStyles();
paUiInitPanels();
paUiInitPlaybackHide();
paUiInitSidebarClose();
paUiInitSingleVoice();
paUiInitCanvasRest();
paUiNpInit();
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', function(){ paUiApplyPanels(); paUiNpSync(); });
}
})();
