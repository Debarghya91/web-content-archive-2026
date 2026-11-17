/* Payments Training Hub situations visual component.
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
        html += '<line x1="' + cx + '" y1="' + n.y1 + '" x2="' + cx + '" y2="' + nodes[i + 1].y0 + '" class="sit-connector" data-sit-step="' + (i + 1) + '" marker-end="url(#' + esc(id) + '-arrow)"/>';
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
     Possible explanations, SME analysis, Resolution and Real-world
     examples render only when the item carries those optional
     fields. One thing to remember is the takeaway. */
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
  /* ---------- App-parity helpers (12 Nov 2026, website redesign) ----------
     Read time matches the iOS ReadTime rule exactly: words split on
     whitespace, one minute per 200 words, minimum one minute, labelled
     "About N min read". The scheme comes from the title only, with
     the same candidates and match order as the iOS scheme(for:),
     whole-word match, never invented. Explain paragraphs split on
     blank lines only: one narrative paragraph per <p>, never split
     into checklist items. */
  function wordCount(text) {
    return String(text || '').split(/\s+/).filter(function (w) { return w; }).length;
  }
  function readTimeLabel(text) {
    var words = wordCount(text);
    if (!words) return '';
    var mins = Math.max(1, Math.ceil(words / 200));
    return 'About ' + mins + ' min read';
  }
  var SCHEME_CANDIDATES = [
    ['UPI', 'upi'], ['SEPA', 'sepa'], ['SWIFT', 'swift'], ['Cards', 'cards?'],
    ['Direct Debit', 'direct debit'], ['ACH', 'ach'],
    ['Faster Payments', 'faster payments'], ['CHAPS', 'chaps'],
    ['TARGET2', 'target2'], ['Fedwire', 'fedwire'], ['CHIPS', 'chips'],
    ['RuPay', 'rupay'], ['Visa', 'visa'], ['Mastercard', 'mastercard'],
    ['NEFT', 'neft'], ['RTGS', 'rtgs'], ['IMPS', 'imps'], ['BACS', 'bacs'],
    ['FedNow', 'fednow']
  ];
  function schemeFor(title) {
    var t = String(title || '');
    for (var i = 0; i < SCHEME_CANDIDATES.length; i++) {
      var re = new RegExp('\\b' + SCHEME_CANDIDATES[i][1] + '\\b', 'i');
      if (re.test(t)) return SCHEME_CANDIDATES[i][0];
    }
    return '';
  }
  function explainParas(text) {
    return String(text || '').split(/\n\s*\n/).map(function (p) {
      return p.trim();
    }).filter(function (p) { return p; });
  }
  function paraHtml(text, cls) {
    var paras = explainParas(text);
    if (!paras.length) paras = [String(text || '')];
    return paras.map(function (p) {
      return '<p class="' + cls + '">' + esc(p) + '</p>';
    }).join('');
  }
  /* ---------- Explain section labels (17 Nov 2026) ----------
     The explain text of every situation is written in labelled
     parts: a flow label before the arrow sequence, a quote label
     before the requirement or assumption, "Why?" before the
     reason, "BA Takeaway" before the takeaway, and "Keep these
     controls separate:" before the takeaway list. The labels are
     literal paragraphs in the data, so they render as small bold
     italic headings; nothing is added where the data carries no
     label, and no situation text is changed. The quote label
     shares its paragraph with the quote, so only the label words
     take the bold italic treatment and the quote stays untouched. */
  var SIT_FLOW_LABELS = [
    "Here's how that happens:",
    'Here is how that happens:',
    'Here is how it happens:',
    "Here's how it happened:",
    'Here is what happened:'
  ];
  var SIT_PART_LABELS = SIT_FLOW_LABELS.concat(['Why?', 'BA Takeaway', 'Keep these controls separate:']);
  var SIT_QUOTE_PREFIXES = ['The requirement said:', 'The assumption was:', 'The assumption said:', 'The instruction was:'];
  function isSitPartLabel(p) {
    return SIT_PART_LABELS.indexOf(p) !== -1;
  }
  function sitQuotePrefix(p) {
    for (var i = 0; i < SIT_QUOTE_PREFIXES.length; i++) {
      if (p.indexOf(SIT_QUOTE_PREFIXES[i]) === 0) return SIT_QUOTE_PREFIXES[i];
    }
    return '';
  }
  function explainHtml(text) {
    var paras = explainParas(text);
    if (!paras.length) paras = [String(text || '')];
    return paras.map(function (p) {
      if (isSitPartLabel(p)) return '<h5 class="sit-explain-label">' + esc(p) + '</h5>';
      var q = sitQuotePrefix(p);
      if (q) return '<p class="sit-explain"><b><i>' + esc(q) + '</i></b>' + esc(p.slice(q.length)) + '</p>';
      return '<p class="sit-explain">' + esc(p) + '</p>';
    }).join('');
  }
  function capFirst(s) {
    s = String(s || '');
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }
  /* ---------- Ledger impact (11 Nov 2026, top-20 item 16) ----------
     Double-entry ledger impact for every situation, so a learner sees
     what moves where, not just what message was sent. The settlement
     model is detected from the situation's own text (messages, title,
     explanation); when no model can be pinned down, both models are
     shown with a note that it depends on the rail. */
  function ledgerModel(item) {
    var hay = ((item.title || '') + ' ' + (item.explain || '') + ' ' + ((item.messages || []).join(' '))).toLowerCase();
    if (/\b(rtgs|fedwire|chaps|target2|\bt2\b)\b/.test(hay)) return 'RTGS';
    if (/\b(upi|imps|faster payments|\bfps\b|tips|pix|paynow|promptpay|instant)\b/.test(hay)) return 'Instant';
    if (/\b(nostro|vostro|correspondent|cover payment|serial payment)\b/.test(hay)) return 'Correspondent';
    if (/\b(netting|net settlement|deferred|batch|\bach\b|bacs|nach|clearing house)\b/.test(hay)) return 'DNS';
    return 'Both';
  }
  function ledgerHtml(item) {
    var model = ledgerModel(item);
    var note = '';
    if (model === 'RTGS') note = 'This situation runs on an RTGS rail: each payment settles gross, in real time, in central bank money.';
    else if (model === 'Instant') note = 'This situation runs on an instant rail: settlement is immediate, in central bank money or prefunded funds.';
    else if (model === 'Correspondent') note = 'This situation moves through correspondent banking: the nostro and vostro accounts carry the funds between the two banks.';
    else if (model === 'DNS') note = 'This situation settles by deferred net settlement: payments net to one position per bank per cycle, and only the net amount moves.';
    else note = 'The settlement model depends on the rail used. Both models are shown so you can compare them.';
    var h = '<h4 class="sit-case-label">Ledger impact: what moves where</h4>';
    h += '<p class="sit-explain">' + esc(note) + ' Every payment is double entry: the customer leg and the settlement leg must balance. If the customer account moves but the settlement leg does not, the payment is not complete.</p>';
    h += '<table class="pf-table"><thead><tr><th>Account</th><th>RTGS (gross, real time)</th><th>Deferred net settlement (DNS)</th></tr></thead><tbody>';
    h += '<tr><td><b>Customer account</b></td><td>Debited at once when the payment is released; credited at once when it arrives. No value-date gap.</td><td>Debited or credited at the clearing cut-off, not at instruction time. Value dating follows the scheme rules.</td></tr>';
    h += '<tr><td><b>Nostro / vostro account</b></td><td>Debited at the correspondent or central bank settlement account at the same moment as the customer leg. No intraday float between the banks.</td><td>No nostro movement until the net settlement. The bilateral position builds up through the cycle and is settled once.</td></tr>';
    h += '<tr><td><b>Clearing house / settlement account</b></td><td>Settlement in central bank money at the moment of the payment. No net position, no settlement risk between the two banks.</td><td>Individual payments net to one position per bank per cycle. A single net settlement entry moves between settlement accounts at the cycle time.</td></tr>';
    h += '</tbody></table>';
    return h;
  }

  function render(item) {
    item = item || {};
    var id = item.id ? 'sit-' + String(item.id).replace(/[^A-Za-z0-9_-]/g, '') : nextId('sit');
    var type = (item.visual && item.visual.type) || 'diagram';
    var visual = '';
    if (type === 'flow') visual = renderFlow(item, id);
    else if (type === 'stacked') visual = renderStacked(item, id);
    else visual = renderDiagram(item, id);
    var html = '<section class="sit-item pf-card" id="' + esc(id) + '" data-sit-item="' + esc(item.id || '') + '">';
    var eyebrow = [];
    if (item.id) eyebrow.push('Case ' + esc(item.id));
    if (item.stage) eyebrow.push('Stage ' + esc(item.stage) + ': ' + esc(item.stage_name || ''));
    if (item.seq) eyebrow.push('Situation ' + esc(item.seq));
    if (item.domain) eyebrow.push(esc(item.domain));
    if (item.level) eyebrow.push(esc(item.level));
    html += '<p class="sit-eyebrow">' + (eyebrow.length ? eyebrow.join(' &middot; ') : 'Payment Situations') + '</p>';
    html += '<p class="sit-case-label">Situation</p>';
    html += '<h3 class="sit-title">' + esc(item.title || 'Untitled situation') + '</h3>';
    /* Agenda (15 Nov 2026 review wave): why take this case, with its
       thumbnail. The fields arrive in the shipped payload from
       agendas.json; an item without them shows nothing extra. */
    if (item.agenda || item.thumbnail) {
      html += '<div class="pf-agenda">';
      if (item.thumbnail) html += '<img class="pf-thumb pf-thumb-lg" src="' + esc(item.thumbnail) + '" alt="" loading="lazy">';
      html += '<div class="pf-agenda-text"><span class="pf-agenda-label">Why take this case</span><p>' + esc(item.agenda || '') + '</p></div></div>';
    }
    var label = sourceLabel(item);
    if (label) html += '<p class="sit-source">Source: ' + esc(label) + '</p>';
    /* App detail pills: stage, level (gold) and scheme, as in the iOS
       SituationDetailView header. Only fields the item carries are
       shown; nothing is invented. */
    var pills = [];
    if (item.stage_name) pills.push('<span class="pf-pill">' + esc(item.stage_name) + '</span>');
    else if (item.stage) pills.push('<span class="pf-pill">Stage ' + esc(item.stage) + '</span>');
    if (item.level) pills.push('<span class="pf-pill accent-gold">' + esc(capFirst(item.level)) + '</span>');
    var scheme = schemeFor(item.title);
    if (scheme) pills.push('<span class="pf-pill">' + esc(scheme) + '</span>');
    if (pills.length) html += '<p class="sit-meta">' + pills.join(' ') + '</p>';
    var readLabel = readTimeLabel((item.explain || '') + ' ' + (item.takeaway || ''));
    if (readLabel) html += '<p data-readtime>' + esc(readLabel) + '</p>';
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
      html += explainHtml(item.explain);
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
      html += paraHtml(item.sme_analysis, 'sit-explain');
    }
    if (item.resolution_text) {
      html += '<h4 class="sit-case-label">Resolution</h4>';
      html += paraHtml(item.resolution_text, 'sit-explain');
    }
    /* Real-world examples (item 7, 12 Nov 2026): reading cards, never
       a checklist. No item in the current data carries an example
       field, so this block is inert today; it exists so example
       content can never fall back to a selectable list. Each example
       is one plain card, title before text, with no input, no click
       handler and no checked state. */
    var examples = null;
    if (Array.isArray(item.examples)) examples = item.examples;
    else if (typeof item.examples === 'string' && item.examples) examples = [item.examples];
    else if (item.example) examples = [item.example];
    if (examples && examples.length) {
      html += '<h4 class="sit-case-label">' + (examples.length > 1 ? 'Real-world examples' : 'Real-world example') + '</h4>';
      examples.forEach(function (ex) {
        if (typeof ex === 'string') {
          if (ex) html += '<div class="sit-example"><p class="sit-example-text">' + esc(ex) + '</p></div>';
        } else if (ex) {
          var exText = ex.text || ex.body || ex.description || '';
          html += '<div class="sit-example">';
          if (ex.title) html += '<p class="sit-example-title">' + esc(ex.title) + '</p>';
          if (exText) html += '<p class="sit-example-text">' + esc(exText) + '</p>';
          html += '</div>';
        }
      });
    }
    if (item.takeaway) html += '<p class="sit-takeaway"><strong>One thing to remember:</strong> ' + esc(item.takeaway) + '</p>';
    html += ledgerHtml(item);
    /* Go deeper (ChatGPT review P1#7, 9 Nov 2026): a related lesson
       and a related simulator for this situation, computed at build
       time from the situation's own domain and messages. A link
       renders only when the build found a genuine match; an item
       without one shows no link rather than a wrong one. */
    if (item.related) {
      var goLinks = [];
      if (item.related.lesson) goLinks.push('<a href="' + esc(item.related.lesson.url) + '">' + esc(item.related.lesson.label) + '</a>');
      if (item.related.simulator) goLinks.push('<a href="' + esc(item.related.simulator.url) + '">' + esc(item.related.simulator.label) + '</a>');
      if (goLinks.length) {
        html += '<h4 class="sit-case-label">Go deeper</h4>';
        html += '<p class="sit-related-links">' + goLinks.join(' &middot; ') + '</p>';
      }
    }
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
      observeFlowAutoplay(node);
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
    block.querySelectorAll('.sit-connector[data-sit-step]').forEach(function (c) {
      var step = parseInt(c.getAttribute('data-sit-step') || '0', 10);
      c.classList.toggle('sit-shown', step <= idx);
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
    block.querySelectorAll('.sit-connector[data-sit-step]').forEach(function (c) {
      c.classList.remove('sit-shown');
    });
    applyFlowState(block);
  }

  /* Autoplay on scroll: when a flow visual scrolls into view, start
     its Play auto-advance once. Never auto-plays when reduced motion
     is set, never replays a flow that is already fully shown, and
     never restarts a flow the learner already finished. */
  var flowObserver = null;
  function observeFlowAutoplay(block) {
    if (reducedMotion) return;
    if (typeof IntersectionObserver === 'undefined') return;
    if (!block.querySelector('.sit-node')) return;
    if (block.getAttribute('data-sit-observed') === '1') return;
    block.setAttribute('data-sit-observed', '1');
    if (!flowObserver) {
      flowObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var b = entry.target;
          flowObserver.unobserve(b);
          if (b.getAttribute('data-sit-autoplayed') === '1') return;
          b.setAttribute('data-sit-autoplayed', '1');
          var steps = flowSteps(b);
          var shown = 0;
          steps.forEach(function (s) { if (s.classList.contains('sit-shown')) shown += 1; });
          if (shown >= steps.length) return;
          flowPlay(b);
        });
      }, { threshold: 0.5 });
    }
    flowObserver.observe(block);
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
