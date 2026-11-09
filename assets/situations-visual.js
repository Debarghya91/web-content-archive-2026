/* PaymentForge situations visual component.
 *
 * One reusable library for the Payment Situations product. Every
 * situation renders through these components; no bespoke implementation
 * per item. The visuals are inline SVG and DOM, never image or video
 * files, so there is nothing to download.
 *
 * Three visual types, chosen per item by item.visual.type:
 *   flow    - a flow diagram with a reveal sequence. Nodes appear one
 *             by one, by clicking Reveal next or by Play auto-advance.
 *             Decision nodes are diamonds. The current node is
 *             highlighted in gold, finished nodes in royal blue.
 *   stacked - a stacked bar for a factual comparison. Segments are
 *             sized by value and normalised to 100, with a legend
 *             carrying the label, value and note of each segment.
 *   diagram - a labelled diagram for one concept: a centre box with
 *             its parts arranged below it, each part labelled with a
 *             short note, connected by lines.
 *
 * Usage:
 *   1. Client-rendered: put the item JSON in a
 *      <script type="application/json"> blob inside a
 *      <div data-sit-visual> container, then call
 *      PFSituations.renderAll(document) to render every container.
 *   2. Direct: PFSituations.render(item) returns the HTML string.
 *   The library initialises itself on load, so flow controls work
 *   wherever it is included. PFSituations.init() is idempotent and
 *   can also be called directly. Interactions are wired by event
 *   delegation, so content added later works without a second init
 *   call.
 *
 * Design tokens come from pf-theme.css variables (royal blue primary,
 * premium gold accents, deep executive navy). All SVG styling is by
 * CSS class, so the theme tokens apply.
 *
 * Accessibility: every interaction is a real button, keyboard operable,
 * with aria-live status. Reduced motion: when prefers-reduced-motion
 * is set, the flow shows all steps statically and never auto-plays.
 *
 * Attribution: the item source is shown only as a short evidence-type
 * label (for example "Source: Public post"). No person names appear
 * in learner-facing text; the source id and URL stay in the internal
 * source_ref field of the item data.
 *
 * No em dashes anywhere in this file.
 */
(function (global) {
  'use strict';

  var reducedMotion = false;
  try {
    if (typeof window !== 'undefined' && window.matchMedia) {
      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  } catch (e) { reducedMotion = false; }

  var uid = 0;
  function nextId(prefix) {
    uid += 1;
    return (prefix || 'sit') + '-' + uid;
  }

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* Split a string into lines of at most maxChars characters, breaking
     on word boundaries, for SVG <text> elements. */
  function wrapLines(s, maxChars) {
    var words = String(s || '').split(/\s+/).filter(function (w) { return w; });
    var lines = [];
    var cur = '';
    words.forEach(function (w) {
      if (!cur) { cur = w; return; }
      if ((cur + ' ' + w).length <= maxChars) { cur += ' ' + w; return; }
      lines.push(cur);
      cur = w;
    });
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  }

  /* SVG text lines as <tspan> elements, centred on x, first line at y. */
  function svgText(x, y, lines, lineHeight, cls) {
    var out = '<text x="' + x + '" y="' + y + '" class="' + cls + '">';
    lines.forEach(function (ln, i) {
      out += '<tspan x="' + x + '" dy="' + (i === 0 ? 0 : lineHeight) + '">' + esc(ln) + '</tspan>';
    });
    return out + '</text>';
  }

  /* ---------- Flow diagram with reveal sequence ---------- */
  /* Steps are laid out vertically: one node per step, a connector line
     with an arrow between nodes. Node height grows with the note text.
     The SVG viewBox is computed from the step count, so any number of
     steps fits. */
  function renderFlow(item, id) {
    var steps = (item.visual && item.visual.flow && item.visual.flow.steps) || [];
    if (!steps.length) return renderFallback(item, id, 'No steps supplied for this flow.');
    var W = 720;
    var x0 = 60, x1 = W - 60, cx = W / 2;
    var y = 16;
    var nodes = [];
    steps.forEach(function (s, i) {
      var titleLines = wrapLines(s.title || '', 46);
      var noteLines = wrapLines(s.note || '', 52);
      var h = 18 + titleLines.length * 24 + noteLines.length * 20 + 16;
      if (s.kind === 'decision') h = Math.max(h, 92);
      nodes.push({ step: s, y0: y, y1: y + h, cy: y + h / 2, titleLines: titleLines, noteLines: noteLines, h: h });
      y += h + 34;
    });
    var H = y - 34 + 16;
    var seconds = (item.visual.flow.stepSeconds) || 3;
    var html = '<div class="sit-flow-controls">'
      + '<button type="button" class="sit-btn sit-btn-primary" data-sit-action="flow-play" data-sit-block="' + esc(id) + '">Play</button> '
      + '<button type="button" class="sit-btn sit-btn-secondary" data-sit-action="flow-next" data-sit-block="' + esc(id) + '">Reveal next</button> '
      + '<button type="button" class="sit-btn sit-btn-secondary" data-sit-action="flow-reset" data-sit-block="' + esc(id) + '">Restart</button> '
      + '<span class="sit-flow-status" id="' + esc(id) + '-status" aria-live="polite">Step 0 of ' + steps.length + '</span></div>';
    html += '<div class="sit-visual-wrap"><svg class="sit-svg sit-flow-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(item.title || 'Flow diagram') + '" data-sit-step-seconds="' + seconds + '">';
    html += '<defs><marker id="' + esc(id) + '-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="sit-arrow-head"/></marker></defs>';
    nodes.forEach(function (n, i) {
      if (i < nodes.length - 1) {
        html += '<line x1="' + cx + '" y1="' + n.y1 + '" x2="' + cx + '" y2="' + nodes[i + 1].y0 + '" class="sit-connector" marker-end="url(#' + esc(id) + '-arrow)"/>';
      }
    });
    nodes.forEach(function (n, i) {
      var s = n.step;
      var cls = 'sit-node' + (s.kind === 'decision' ? ' sit-node-decision' : '');
      html += '<g class="' + cls + '" data-sit-step="' + i + '">';
      if (s.kind === 'decision') {
        var hw = (x1 - x0) / 2, hh = n.h / 2;
        html += '<polygon points="' + cx + ',' + n.y0 + ' ' + x1 + ',' + n.cy + ' ' + cx + ',' + n.y1 + ' ' + x0 + ',' + n.cy + '" class="sit-node-shape"/>';
        html += svgText(cx, n.cy - ((n.titleLines.length - 1) * 12), n.titleLines, 24, 'sit-node-title');
        if (n.noteLines.length && n.noteLines[0]) {
          html += svgText(cx, n.cy + n.titleLines.length * 12 + 6, n.noteLines, 20, 'sit-node-note');
        }
      } else {
        html += '<rect x="' + x0 + '" y="' + n.y0 + '" width="' + (x1 - x0) + '" height="' + n.h + '" rx="10" class="sit-node-shape"/>';
        html += '<circle cx="' + (x0 + 26) + '" cy="' + n.cy + '" r="17" class="sit-node-num"/>';
        html += '<text x="' + (x0 + 26) + '" y="' + (n.cy + 6) + '" class="sit-node-num-text" text-anchor="middle">' + (i + 1) + '</text>';
        var tx = x0 + 56;
        html += svgText(tx, n.y0 + 30, n.titleLines, 24, 'sit-node-title-left');
        if (n.noteLines.length && n.noteLines[0]) {
          html += svgText(tx, n.y0 + 30 + n.titleLines.length * 24 + 4, n.noteLines, 20, 'sit-node-note-left');
        }
      }
      html += '</g>';
    });
    html += '</svg></div>';
    return html;
  }

  /* ---------- Stacked chart ---------- */
  /* One horizontal stacked bar, segments sized by value and normalised
     to 100. A legend below carries the label, value and note of each
     segment. Segment colours come from a fixed palette so the same
     segment position always has the same colour. */
  var STACK_COLORS = ['sit-seg-0', 'sit-seg-1', 'sit-seg-2', 'sit-seg-3', 'sit-seg-4', 'sit-seg-5', 'sit-seg-6', 'sit-seg-7'];
  function renderStacked(item, id) {
    var st = (item.visual && item.visual.stacked) || {};
    var segs = st.segments || [];
    if (!segs.length) return renderFallback(item, id, 'No segments supplied for this chart.');
    var total = 0;
    segs.forEach(function (s) { total += Number(s.value) || 0; });
    if (total <= 0) total = segs.length;
    var W = 720, H = 64, x = 0;
    var html = '<div class="sit-visual-wrap"><svg class="sit-svg sit-stacked-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(item.title || 'Stacked chart') + '">';
    segs.forEach(function (s, i) {
      var w = (Number(s.value) || 0) / total * W;
      if (w <= 0) return;
      html += '<rect x="' + x.toFixed(1) + '" y="8" width="' + w.toFixed(1) + '" height="48" rx="4" class="sit-seg ' + STACK_COLORS[i % STACK_COLORS.length] + '"/>';
      if (w >= 64) {
        var label = String(s.label || '');
        if (label.length > Math.floor(w / 9)) label = label.slice(0, Math.max(0, Math.floor(w / 9) - 1)) + '..';
        html += '<text x="' + (x + w / 2).toFixed(1) + '" y="38" class="sit-seg-label" text-anchor="middle">' + esc(label) + '</text>';
      }
      x += w;
    });
    html += '</svg></div>';
    html += '<ul class="sit-legend">';
    segs.forEach(function (s, i) {
      var pct = ((Number(s.value) || 0) / total * 100);
      html += '<li><span class="sit-swatch ' + STACK_COLORS[i % STACK_COLORS.length] + '" aria-hidden="true"></span>'
        + '<span class="sit-legend-label">' + esc(s.label || '') + '</span>'
        + '<span class="sit-legend-value">' + pct.toFixed(pct % 1 ? 1 : 0) + (st.unit ? esc(st.unit) : '%') + '</span>'
        + (s.note ? '<span class="sit-legend-note">' + esc(s.note) + '</span>' : '')
        + '</li>';
    });
    html += '</ul>';
    if (st.note) html += '<p class="sit-note">' + esc(st.note) + '</p>';
    /* The bar is normalised to 100, so a percentage chart totals 100%.
       A money chart totals the raw sum in its own unit. */
    var totalText = (!st.unit || st.unit === '%')
      ? 'Total: 100%. Amounts are illustrative unless the note says otherwise.'
      : 'Total: ' + total + ' ' + esc(st.unit) + '. Amounts are illustrative unless the note says otherwise.';
    html += '<p class="sit-total">' + totalText + '</p>';
    return html;
  }

  /* ---------- Simple labelled diagram ---------- */
  /* A centre box holding the concept, with its parts arranged in rows
     below it, each part a labelled box with a short note, connected to
     the centre by a line. Any number of parts fits: rows hold up to
     three boxes. */
  function renderDiagram(item, id) {
    var dg = (item.visual && item.visual.diagram) || {};
    var parts = dg.parts || [];
    if (!parts.length) return renderFallback(item, id, 'No parts supplied for this diagram.');
    var W = 720;
    var centreLines = wrapLines(dg.centre || item.title || '', 44);
    var centreH = 20 + centreLines.length * 26 + 18;
    var boxW = 216, boxH = 92, gapX = 12, gapY = 44;
    var perRow = 3;
    var rows = Math.ceil(parts.length / perRow);
    var totalW = perRow * boxW + (perRow - 1) * gapX;
    var xStart = (W - totalW) / 2;
    var H = 16 + centreH + 30 + rows * boxH + (rows - 1) * gapY + 16;
    var cx = W / 2;
    var centreY0 = 16, centreY1 = 16 + centreH;
    var html = '<div class="sit-visual-wrap"><svg class="sit-svg sit-diagram-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(item.title || 'Diagram') + '">';
    html += '<rect x="' + (cx - 200) + '" y="' + centreY0 + '" width="400" height="' + centreH + '" rx="10" class="sit-centre-shape"/>';
    html += svgText(cx, centreY0 + 32, centreLines, 26, 'sit-centre-title');
    parts.forEach(function (p, i) {
      var r = Math.floor(i / perRow), c = i % perRow;
      var inRow = Math.min(perRow, parts.length - r * perRow);
      var rowW = inRow * boxW + (inRow - 1) * gapX;
      var rx = (W - rowW) / 2 + c * (boxW + gapX);
      var ry = centreY1 + 30 + r * (boxH + gapY);
      var px = rx + boxW / 2;
      html += '<line x1="' + cx + '" y1="' + centreY1 + '" x2="' + px + '" y2="' + ry + '" class="sit-connector"/>';
      html += '<rect x="' + rx + '" y="' + ry + '" width="' + boxW + '" height="' + boxH + '" rx="10" class="sit-part-shape"/>';
      var labelLines = wrapLines(p.label || '', 22);
      html += svgText(px, ry + 28, labelLines, 20, 'sit-part-label');
      if (p.note) {
        var noteLines = wrapLines(p.note, 26);
        html += svgText(px, ry + 28 + labelLines.length * 20 + 6, noteLines.slice(0, 2), 17, 'sit-part-note');
      }
    });
    html += '</svg></div>';
    return html;
  }

  function renderFallback(item, id, msg) {
    return '<p class="sit-note">' + esc(msg) + '</p>';
  }

  /* ---------- Item shell: the case format ---------- */
  /* Every situation is presented as one professional case, in the
     same order every time. Blocks come from the item's own fields;
     a block is left out when the item has no field for it, never
     filled with invented text. Situation is the title. What is
     happening is the explanation. Visual investigation is the visual.
     Possible explanations, SME analysis and Resolution render only
     when the item carries those optional fields. One thing to
     remember is the takeaway. */
  function sourceLabel(item) {
    /* Learner-facing source labels show the evidence type only, never
       a person name. The shipped data already carries the evidence
       type; the name check below covers raw data used in development.
       The source id and URL stay in the internal source_ref field. */
    var s = String(item.source || '').toLowerCase();
    if (s === 'article and reader comments') return 'Article and reader comments';
    if (s === 'public post') return 'Public post';
    if (s.indexOf('paiementor') !== -1) return 'Article and reader comments';
    if (s) return 'Public post';
    return '';
  }
  function render(item) {
    item = item || {};
    var id = item.id ? 'sit-' + String(item.id).replace(/[^A-Za-z0-9_-]/g, '') : nextId('sit');
    var type = (item.visual && item.visual.type) || 'diagram';
    var visual = '';
    if (type === 'flow') visual = renderFlow(item, id);
    else if (type === 'stacked') visual = renderStacked(item, id);
    else visual = renderDiagram(item, id);
    var html = '<section class="sit-item" id="' + esc(id) + '" data-sit-item="' + esc(item.id || '') + '">';
    var eyebrow = [];
    if (item.stage) eyebrow.push('Stage ' + esc(item.stage) + ': ' + esc(item.stage_name || ''));
    if (item.seq) eyebrow.push('Situation ' + esc(item.seq));
    if (item.domain) eyebrow.push(esc(item.domain));
    if (item.level) eyebrow.push(esc(item.level));
    html += '<p class="sit-eyebrow">' + (eyebrow.length ? eyebrow.join(' &middot; ') : 'Payment Situations') + '</p>';
    html += '<p class="sit-case-label">Situation</p>';
    html += '<h3 class="sit-title">' + esc(item.title || 'Untitled situation') + '</h3>';
    var label = sourceLabel(item);
    if (label) html += '<p class="sit-source">Source: ' + esc(label) + '</p>';
    var chips = [];
    (item.messages || []).forEach(function (m) { chips.push(m); });
    if (item.failure_category) chips.push(item.failure_category);
    if (item.resolution) chips.push('Resolution: ' + item.resolution);
    if (chips.length) {
      html += '<p class="sit-meta">' + chips.map(function (c) {
        return '<span class="sit-chip">' + esc(c) + '</span>';
      }).join(' ') + '</p>';
    }
    if (item.explain) {
      html += '<h4 class="sit-case-label">What is happening</h4>';
      html += '<p class="sit-explain">' + esc(item.explain) + '</p>';
    }
    html += '<h4 class="sit-case-label">Visual investigation</h4>';
    html += '<div class="sit-visual" data-sit-type="' + esc(type) + '">' + visual + '</div>';
    if (item.explanations && item.explanations.length) {
      html += '<h4 class="sit-case-label">Possible explanations</h4><ul class="sit-case-list">';
      item.explanations.forEach(function (e) {
        html += '<li>' + esc(e) + '</li>';
      });
      html += '</ul>';
    }
    if (item.sme_analysis) {
      html += '<h4 class="sit-case-label">SME analysis</h4>';
      html += '<p class="sit-explain">' + esc(item.sme_analysis) + '</p>';
    }
    if (item.resolution_text) {
      html += '<h4 class="sit-case-label">Resolution</h4>';
      html += '<p class="sit-explain">' + esc(item.resolution_text) + '</p>';
    }
    if (item.takeaway) html += '<p class="sit-takeaway"><strong>One thing to remember:</strong> ' + esc(item.takeaway) + '</p>';
    html += '</section>';
    return html;
  }

  function renderAll(root) {
    root = root || document;
    var nodes = root.querySelectorAll('[data-sit-visual]');
    nodes.forEach(function (node) {
      if (node.getAttribute('data-sit-rendered')) return;
      var blob = node.querySelector('script[type="application/json"]');
      if (!blob) return;
      var item = null;
      try { item = JSON.parse(blob.textContent); } catch (e) { return; }
      node.innerHTML = render(item);
      node.setAttribute('data-sit-rendered', '1');
      applyFlowState(node);
    });
  }

  /* ---------- Flow reveal state ---------- */
  function flowSteps(block) {
    return block.querySelectorAll('.sit-node');
  }
  function applyFlowState(block) {
    var steps = flowSteps(block);
    if (!steps.length) return;
    var shown = 0;
    steps.forEach(function (s) {
      if (s.classList.contains('sit-shown')) shown += 1;
    });
    var status = block.querySelector('.sit-flow-status');
    if (status) status.textContent = 'Step ' + shown + ' of ' + steps.length;
    var playBtn = block.querySelector('[data-sit-action="flow-play"]');
    if (playBtn) playBtn.textContent = block.getAttribute('data-sit-playing') === '1' ? 'Pause' : 'Play';
    var nextBtn = block.querySelector('[data-sit-action="flow-next"]');
    if (nextBtn) nextBtn.disabled = shown >= steps.length;
  }
  function flowReveal(block, idx) {
    var steps = flowSteps(block);
    steps.forEach(function (s, i) {
      s.classList.toggle('sit-shown', i <= idx);
      s.classList.toggle('sit-now', i === idx);
      if (i < idx) s.classList.add('sit-done');
      else s.classList.remove('sit-done');
    });
    applyFlowState(block);
  }
  function flowPlay(block) {
    if (reducedMotion) return;
    var steps = flowSteps(block);
    if (!steps.length) return;
    if (block.getAttribute('data-sit-playing') === '1') {
      flowStop(block);
      return;
    }
    var shown = 0;
    steps.forEach(function (s) { if (s.classList.contains('sit-shown')) shown += 1; });
    if (shown >= steps.length) { flowReset(block); shown = 0; }
    block.setAttribute('data-sit-playing', '1');
    applyFlowState(block);
    var svg = block.querySelector('.sit-flow-svg');
    var seconds = svg ? (parseFloat(svg.getAttribute('data-sit-step-seconds')) || 3) : 3;
    var timer = setInterval(function () {
      var cur = 0;
      steps.forEach(function (s) { if (s.classList.contains('sit-shown')) cur += 1; });
      if (cur >= steps.length) { flowStop(block); return; }
      flowReveal(block, cur);
    }, seconds * 1000);
    block.setAttribute('data-sit-timer', String(timer));
  }
  function flowStop(block) {
    var t = block.getAttribute('data-sit-timer');
    if (t) { try { clearInterval(parseInt(t, 10)); } catch (e) {} }
    block.removeAttribute('data-sit-timer');
    block.removeAttribute('data-sit-playing');
    applyFlowState(block);
  }
  function flowReset(block) {
    flowStop(block);
    flowSteps(block).forEach(function (s) {
      s.classList.remove('sit-shown', 'sit-now', 'sit-done');
    });
    applyFlowState(block);
  }

  function init() {
    if (init.done) return;
    init.done = true;
    document.addEventListener('click', function (ev) {
      var btn = ev.target && ev.target.closest ? ev.target.closest('[data-sit-action]') : null;
      if (!btn) return;
      var block = btn.closest('.sit-item') || btn.closest('[data-sit-visual]');
      if (!block) return;
      var action = btn.getAttribute('data-sit-action');
      if (action === 'flow-next') {
        var steps = flowSteps(block);
        var shown = 0;
        steps.forEach(function (s) { if (s.classList.contains('sit-shown')) shown += 1; });
        if (shown < steps.length) flowReveal(block, shown);
      } else if (action === 'flow-play') {
        flowPlay(block);
      } else if (action === 'flow-reset') {
        flowReset(block);
      }
    });
    renderAll(document);
  }

  /* Auto-init on load so the flow controls work wherever this
     library is included. Before this, init() was never called by
     the built site, so the Play and Reveal next buttons did
     nothing. init() is idempotent, so calling it directly as well
     is harmless. */
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  global.PFSituations = {
    render: render,
    renderAll: renderAll,
    init: init,
    flowReveal: flowReveal,
    flowReset: flowReset
  };
})(typeof window !== 'undefined' ? window : this);
