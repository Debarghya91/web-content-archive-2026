/* diagram-player: step-by-step animated diagrams for the free short courses.
   Visual system: the deck palette (dark navy panel, teal/blue/orange
   accents). Behaviour: each diagram auto-plays once when scrolled into view,
   advancing one step at a time; the active node, connector and step text
   highlight while the rest dim; a pulse travels along the active connector.
   Controls: Play/Pause, Previous, Next, Replay, click a step to jump.
   Under prefers-reduced-motion there is no auto-play and no pulse motion;
   manual stepping still works. No dependencies. */
(function () {
  'use strict';

  var STEP_MS = 2400;
  var PULSE_MS = 1600;
  var REDUCED = false;
  try {
    REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* no matchMedia: assume motion is fine */ }

  function stepNumbers(box) {
    var nums = [];
    var els = box.querySelectorAll('[data-step]');
    for (var i = 0; i < els.length; i++) {
      var n = parseInt(els[i].getAttribute('data-step'), 10);
      if (!isNaN(n) && nums.indexOf(n) < 0) nums.push(n);
    }
    nums.sort(function (a, b) { return a - b; });
    return nums;
  }

  function setPulse(box, n) {
    var pulses = box.querySelectorAll('.pf-dpulse');
    for (var i = 0; i < pulses.length; i++) {
      var p = pulses[i];
      var on = p.getAttribute('data-pulse-for') === String(n);
      p.classList.toggle('is-active', on);
      p.classList.toggle('is-dim', !on);
    }
  }

  function setStep(box, n) {
    var steps = box._dgSteps;
    if (!steps || steps.indexOf(n) < 0) return;
    box._dgCurrent = n;
    var nodes = box.querySelectorAll('.pf-dnode');
    var conns = box.querySelectorAll('.pf-dconn');
    var items = box.querySelectorAll('.pf-diagram-steps li');
    var i, el, on;
    for (i = 0; i < nodes.length; i++) {
      el = nodes[i];
      on = el.getAttribute('data-step') === String(n);
      el.classList.toggle('is-active', on);
      el.classList.toggle('is-dim', !on);
    }
    for (i = 0; i < conns.length; i++) {
      el = conns[i];
      on = el.getAttribute('data-step') === String(n);
      el.classList.toggle('is-active', on);
      el.classList.toggle('is-dim', !on);
    }
    for (i = 0; i < items.length; i++) {
      el = items[i];
      on = el.getAttribute('data-step') === String(n);
      el.classList.toggle('is-active', on);
      el.classList.toggle('is-dim', !on);
    }
    var count = box.querySelector('.pf-diagram-count');
    if (count) count.textContent = 'Step ' + n + ' of ' + steps.length;
    setPulse(box, n);
    if (!REDUCED) startPulse(box, n);
  }

  function stopPulse(box) {
    if (box._dgRaf) {
      cancelAnimationFrame(box._dgRaf);
      box._dgRaf = null;
    }
  }

  function startPulse(box, n) {
    stopPulse(box);
    var pulse = box.querySelector('.pf-dpulse[data-pulse-for="' + n + '"]');
    var conn = box.querySelector('.pf-dconn[data-step="' + n + '"]');
    if (!pulse || !conn || typeof conn.getTotalLength !== 'function') return;
    var len = conn.getTotalLength();
    if (!len) return;
    var start = null;
    var tick = function (ts) {
      if (box._dgCurrent !== n || box._dgPaused) { box._dgRaf = null; return; }
      if (start === null) start = ts;
      var t = ((ts - start) % PULSE_MS) / PULSE_MS;
      var pt = conn.getPointAtLength(t * len);
      pulse.setAttribute('cx', pt.x.toFixed(1));
      pulse.setAttribute('cy', pt.y.toFixed(1));
      box._dgRaf = requestAnimationFrame(tick);
    };
    box._dgRaf = requestAnimationFrame(tick);
  }

  function setPlayLabel(box) {
    var btn = box.querySelector('[data-dg="play"]');
    if (!btn) return;
    if (box._dgFinished) { btn.textContent = 'Replay'; return; }
    btn.textContent = box._dgPlaying ? 'Pause' : 'Play';
  }

  function stopTimer(box) {
    if (box._dgTimer) {
      clearTimeout(box._dgTimer);
      box._dgTimer = null;
    }
    box._dgPlaying = false;
  }

  function play(box) {
    var steps = box._dgSteps;
    if (!steps) return;
    if (box._dgFinished) {
      box._dgFinished = false;
      setStep(box, steps[0]);
    }
    box._dgPlaying = true;
    box._dgPaused = false;
    setPlayLabel(box);
    if (!REDUCED) startPulse(box, box._dgCurrent);
    var advance = function () {
      if (!box._dgPlaying) return;
      var idx = steps.indexOf(box._dgCurrent);
      if (idx < steps.length - 1) {
        setStep(box, steps[idx + 1]);
        box._dgTimer = setTimeout(advance, STEP_MS);
      } else {
        stopTimer(box);
        box._dgFinished = true;
        box._dgPaused = true;
        stopPulse(box);
        setPlayLabel(box);
      }
    };
    box._dgTimer = setTimeout(advance, STEP_MS);
  }

  function pause(box) {
    stopTimer(box);
    box._dgPaused = true;
    stopPulse(box);
    setPlayLabel(box);
  }

  function goTo(box, n) {
    pause(box);
    box._dgFinished = false;
    setStep(box, n);
    setPlayLabel(box);
  }

  function initBox(box) {
    var steps = stepNumbers(box);
    if (!steps.length) return;
    box._dgSteps = steps;
    box._dgCurrent = steps[0];
    box._dgPlaying = false;
    box._dgPaused = true;
    box._dgFinished = false;
    box._dgPlayed = false;

    var btn = function (name) { return box.querySelector('[data-dg="' + name + '"]'); };
    var playBtn = btn('play');
    var prevBtn = btn('prev');
    var nextBtn = btn('next');
    var replayBtn = btn('replay');

    if (playBtn) playBtn.addEventListener('click', function () {
      if (box._dgPlaying) { pause(box); return; }
      if (box._dgFinished) { box._dgFinished = false; setStep(box, steps[0]); }
      play(box);
    });
    if (prevBtn) prevBtn.addEventListener('click', function () {
      var idx = steps.indexOf(box._dgCurrent);
      goTo(box, steps[Math.max(0, idx - 1)]);
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      var idx = steps.indexOf(box._dgCurrent);
      goTo(box, steps[Math.min(steps.length - 1, idx + 1)]);
    });
    if (replayBtn) replayBtn.addEventListener('click', function () {
      box._dgFinished = false;
      setStep(box, steps[0]);
      play(box);
    });
    var items = box.querySelectorAll('.pf-diagram-steps li');
    for (var i = 0; i < items.length; i++) {
      (function (li) {
        li.addEventListener('click', function () {
          goTo(box, parseInt(li.getAttribute('data-step'), 10));
        });
      })(items[i]);
    }

    // Initial state: step 1 highlighted, everything else dimmed.
    setStep(box, steps[0]);
    pause(box);
    setPlayLabel(box);

    if (!REDUCED && 'IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (entries) {
        for (var j = 0; j < entries.length; j++) {
          if (entries[j].isIntersecting && !box._dgPlayed) {
            box._dgPlayed = true;
            box._dgFinished = false;
            setStep(box, steps[0]);
            play(box);
            seen.disconnect();
          }
        }
      }, { threshold: 0.4 });
      seen.observe(box);
    }
  }

  function init() {
    var boxes = document.querySelectorAll('[data-diagram]');
    for (var i = 0; i < boxes.length; i++) initBox(boxes[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
