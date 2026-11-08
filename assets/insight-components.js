/* PaymentForge insight components.
 *
 * One reusable library for the integrated profile insights and payment
 * scenarios. Every insight and scenario renders through these components;
 * no bespoke implementation per insight.
 *
 * Usage (two modes, both supported):
 *   1. Server-rendered: the build writes PFInsight.render() HTML into the
 *      lesson page, then calls PFInsight.init() once on load. All
 *      interactions are wired by event delegation, so content added later
 *      works without a second init call.
 *   2. Client-rendered: put a JSON blob in the page and call
 *      PFInsight.renderAll(root) to render every [data-ic-type] container.
 *
 * Design tokens come from pf-theme.css variables (royal blue primary,
 * premium gold accents, deep executive navy). Components render on the
 * light page surface by default; add class "ic-dark" (or place inside a
 * .fw-card) for the dark framework-card context.
 *
 * Accessibility: every interaction is a real button, keyboard operable,
 * with aria-expanded / aria-controls / aria-live where state changes.
 * Reduced motion: when prefers-reduced-motion is set, the flow player
 * shows all steps statically and never auto-advances; all transitions
 * are disabled in the companion CSS.
 *
 * Attribution rule (owner order, 7 Nov 2026): no person names anywhere
 * in learner-facing content. Evidence is shown only as an evidence type
 * (see PFInsight.evidenceLabel). Never a profile name, never a link.
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
    return (prefix || 'ic') + '-' + uid;
  }

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* Serialise an object into a <script type="application/json"> blob.
     Do NOT use esc() here: esc turns " into &quot; and ' into &#39;,
     which is not valid JSON, so JSON.parse of the blob fails and the
     feedback text comes back empty. Escaping only < and > keeps the
     JSON valid and stops a </script> sequence breaking out of the tag. */
  function jsonBlob(obj) {
    return JSON.stringify(obj || {})
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e');
  }

  /* Normalise depth to 1, 2 or 3. Accepts 1, "1", "Level 1", "Level 1 - Quick insight". */
  function normDepth(d) {
    var m = String(d === undefined || d === null ? '' : d).match(/[123]/);
    return m ? parseInt(m[0], 10) : 2;
  }

  /* Data attributes every component root carries, so a later search and
     filter page can index components by domain, topic, difficulty and
     depth without parsing the text. */
  function dataAttrs(meta, component, recordId) {
    meta = meta || {};
    var out = ' data-ic data-component="' + esc(component) + '"';
    if (meta.domain) out += ' data-domain="' + esc(meta.domain) + '"';
    if (meta.topic) out += ' data-topic="' + esc(meta.topic) + '"';
    if (meta.difficulty) out += ' data-difficulty="' + esc(meta.difficulty) + '"';
    out += ' data-depth="' + normDepth(meta.depth) + '"';
    if (recordId) out += ' data-record-id="' + esc(recordId) + '"';
    if (meta.insightId) out += ' data-insight-id="' + esc(meta.insightId) + '"';
    if (meta.scenarioId) out += ' data-scenario-id="' + esc(meta.scenarioId) + '"';
    return out;
  }

  function metaLine(meta) {
    meta = meta || {};
    var bits = [];
    if (meta.domain) bits.push(esc(meta.domain));
    if (meta.topic) bits.push(esc(meta.topic));
    var depth = normDepth(meta.depth);
    var depthName = depth === 1 ? 'Quick insight' : (depth === 2 ? 'Applied scenario' : 'Deep-dive case');
    bits.push('Level ' + depth + ' ' + depthName);
    if (meta.difficulty) bits.push(esc(meta.difficulty));
    if (!bits.length) return '';
    return '<p class="ic-meta">' + bits.join(' &middot; ') + '</p>';
  }

  /* ------------------------------------------------ Evidence label ---
   * Shows ONLY the evidence type, with a small verification indicator.
   * Types: public-post, follower-reported, derived, practice-scenario,
   * url-pending. Never a person name, never a profile link. */
  var EVIDENCE = {
    'public-post': {
      label: 'Public post',
      note: 'Indexed public post',
      cls: 'ic-ev-verified',
      mark: '&#10003;'
    },
    'follower-reported': {
      label: 'Follower-reported interview experience',
      note: 'Reported by a follower, not verified as an employer question',
      cls: 'ic-ev-reported',
      mark: '!'
    },
    'derived': {
      label: 'Derived learning insight',
      note: 'Teaching point derived from the indexed material',
      cls: 'ic-ev-derived',
      mark: 'i'
    },
    'practice-scenario': {
      label: 'Independently authored practice scenario',
      note: 'Written for practice, not a real employer case',
      cls: 'ic-ev-practice',
      mark: '&#9998;'
    },
    'url-pending': {
      label: 'Source URL pending verification',
      note: 'Exact source link not yet verified',
      cls: 'ic-ev-pending',
      mark: '?'
    }
  };

  function evidenceLabel(type) {
    var e = EVIDENCE[type] || EVIDENCE['derived'];
    return '<p class="ic-evidence ' + e.cls + '"><span class="ic-ev-mark" aria-hidden="true">' +
      e.mark + '</span><span><strong>' + e.label + '</strong> ' +
      '<span class="ic-ev-note">' + esc(e.note) + '</span></span></p>';
  }

  function evidenceLabelFor(excelStatus) {
    /* Map the workbook evidence status to the learner-facing type. */
    var s = String(excelStatus || '').toLowerCase();
    if (s.indexOf('not recovered') !== -1 || s.indexOf('pending') !== -1) return evidenceLabel('url-pending');
    if (s.indexOf('follower') !== -1) return evidenceLabel('follower-reported');
    if (s.indexOf('public post') !== -1 || s.indexOf('indexed') !== -1) return evidenceLabel('public-post');
    return evidenceLabel('derived');
  }

  /* ------------------------------------------- 1. Pause and think ---
   * Question, a Think then reveal button, model answer plus takeaway.
   * data: { meta, question, context?, answer, takeaway, recordId? } */
  function pauseThink(data) {
    data = data || {};
    var id = data.id || nextId('ic-pause');
    var html = '<section class="ic-block ic-pause"' + dataAttrs(data.meta, 'pause-think', data.recordId || data.id) + ' id="' + esc(id) + '">';
    html += '<p class="ic-label">Pause and think</p>';
    if (data.context) html += '<p class="ic-context">' + esc(data.context) + '</p>';
    html += '<p class="ic-question">' + esc(data.question || '') + '</p>';
    html += '<button type="button" class="ic-btn ic-btn-primary" data-ic-action="reveal" data-ic-target="' +
      esc(id) + '-answer" aria-expanded="false" aria-controls="' + esc(id) + '-answer">' +
      'Think, then reveal the model answer</button>';
    html += '<div class="ic-reveal" id="' + esc(id) + '-answer" hidden>';
    html += '<p class="ic-answer-label">Model answer</p>';
    html += '<p>' + esc(data.answer || '') + '</p>';
    if (data.takeaway) html += '<p class="ic-takeaway"><strong>Takeaway:</strong> ' + esc(data.takeaway) + '</p>';
    html += '</div></section>';
    return html;
  }

  /* ------------------------------------------ 2. Decision branch ---
   * Learner decision with 2 to 4 options. Clicking an option reveals
   * whether it is the recommended path and why, plus what happens on
   * the other branches.
   * data: { meta, question, context?, options: [{label, detail?,
   *   correct, why, outcome}], recordId? } */
  function decisionBranch(data) {
    data = data || {};
    var id = data.id || nextId('ic-decision');
    var options = data.options || [];
    var html = '<section class="ic-block ic-decision"' + dataAttrs(data.meta, 'decision-branch', data.recordId || data.id) + ' id="' + esc(id) + '">';
    html += '<p class="ic-label">Your decision</p>';
    if (data.context) html += '<p class="ic-context">' + esc(data.context) + '</p>';
    html += '<p class="ic-question">' + esc(data.question || '') + '</p>';
    html += '<div class="ic-options" role="group" aria-label="Decision options">';
    for (var i = 0; i < options.length; i++) {
      var o = options[i] || {};
      html += '<button type="button" class="ic-option" data-ic-action="decision" data-ic-block="' +
        esc(id) + '" data-ic-idx="' + i + '" data-ic-correct="' + (o.correct ? '1' : '0') + '">' +
        '<span class="ic-option-label">' + esc(o.label || '') + '</span>' +
        (o.detail ? '<span class="ic-option-detail">' + esc(o.detail) + '</span>' : '') +
        '</button>';
    }
    html += '</div>';
    html += '<div class="ic-decision-result" id="' + esc(id) + '-result" aria-live="polite" hidden></div>';
    /* The "what happens on each branch" list only makes sense when the
       options carry distinct per-option outcomes. When every option
       shares one rationale (Level 3 cases carry a single rationale
       for the whole decision), the list would repeat the same paragraph
       once per option, so it is left out and the rationale is shown
       once, below the decision block. */
    var hasOutcomes = false;
    for (var k = 0; k < options.length; k++) {
      var ok = options[k] || {};
      if ((ok.outcome && String(ok.outcome).replace(/\s/g, '')) ||
          (ok.why && String(ok.why).replace(/\s/g, ''))) {
        hasOutcomes = true;
        break;
      }
    }
    if (hasOutcomes) {
      html += '<div class="ic-branches" id="' + esc(id) + '-branches" hidden><p class="ic-answer-label">What happens on each branch</p><ul class="ic-branch-list">';
      for (var j = 0; j < options.length; j++) {
        var oj = options[j] || {};
        html += '<li><strong>' + esc(oj.label || '') + ':</strong> ' + esc(oj.outcome || oj.why || '') + '</li>';
      }
      html += '</ul></div>';
    }
    /* The reset control is always rendered, even when the options share
       one rationale and there is no per-branch list. Without it a wrong
       pick locks the block with no way to try again. */
    html += '<div class="ic-decision-reset" id="' + esc(id) + '-reset" hidden><button type="button" class="ic-btn ic-btn-secondary" data-ic-action="decision-reset" data-ic-block="' +
      esc(id) + '">Choose again</button></div>';
    /* Option data lives in a JSON blob so the why text is not duplicated
       in the markup. */
    html += '<script type="application/json" id="' + esc(id) + '-data">' +
      jsonBlob({ options: options }) + '</script>';
    html += '</section>';
    return html;
  }

  /* ------------------------------------ 3. Animated end-to-end flow ---
   * Renders a step flow from a simple JSON step list. Play advances the
   * highlight from step to step; pause stops it. With reduced motion the
   * flow is static (all steps shown, play hidden). Each step is a button
   * so keyboard users can jump to any step.
   * data: { meta, title?, steps: [{title, actor?, note?}],
   *   stepSeconds?, recordId? } */
  function flowPlayer(data) {
    data = data || {};
    var id = data.id || nextId('ic-flow');
    var steps = data.steps || [];
    var seconds = data.stepSeconds || 1.8;
    var html = '<section class="ic-block ic-flow"' + dataAttrs(data.meta, 'flow', data.recordId || data.id) + ' id="' + esc(id) + '">';
    html += '<p class="ic-label">End-to-end flow</p>';
    if (data.title) html += '<h3 class="ic-title">' + esc(data.title) + '</h3>';
    if (reducedMotion) {
      html += '<p class="ic-note">Motion is off on this device, so the flow is shown as a static step list.</p>';
    } else {
      html += '<div class="ic-flow-controls"><button type="button" class="ic-btn ic-btn-primary" data-ic-action="flow-play" data-ic-block="' +
        esc(id) + '" aria-controls="' + esc(id) + '-steps">Play the flow</button>' +
        '<button type="button" class="ic-btn ic-btn-secondary" data-ic-action="flow-pause" data-ic-block="' +
        esc(id) + '" disabled>Pause</button>' +
        '<span class="ic-flow-status" id="' + esc(id) + '-status" aria-live="polite">Step 0 of ' + steps.length + '</span></div>';
    }
    html += '<ol class="ic-flow-steps" id="' + esc(id) + '-steps" data-ic-step-seconds="' + esc(seconds) + '">';
    for (var i = 0; i < steps.length; i++) {
      var s = steps[i] || {};
      html += '<li class="ic-flow-step" data-ic-step="' + i + '"><button type="button" class="ic-flow-step-btn" data-ic-action="flow-step" data-ic-block="' +
        esc(id) + '" data-ic-idx="' + i + '" aria-label="Step ' + (i + 1) + ': ' + esc(s.title || '') + '">' +
        '<span class="ic-flow-num" aria-hidden="true">' + (i + 1) + '</span>' +
        '<span class="ic-flow-body"><span class="ic-flow-title">' + esc(s.title || '') + '</span>' +
        (s.actor ? '<span class="ic-flow-actor">' + esc(s.actor) + '</span>' : '') +
        (s.note ? '<span class="ic-flow-note">' + esc(s.note) + '</span>' : '') +
        '</span></button>' +
        (i < steps.length - 1 ? '<span class="ic-flow-arrow" aria-hidden="true">&#8595;</span>' : '') +
        '</li>';
    }
    html += '</ol></section>';
    return html;
  }

  /* ------------------------------ 4. Happy path vs negative paths ---
   * Two columns on desktop, stacked on mobile.
   * data: { meta, title?, happy: [string|{title, detail}],
   *   negative: [{title, detail}], recordId? } */
  function happyNegative(data) {
    data = data || {};
    var id = data.id || nextId('ic-paths');
    function steps(list) {
      var out = '<ol class="ic-path-list">';
      for (var i = 0; i < (list || []).length; i++) {
        var item = list[i];
        if (typeof item === 'string') {
          out += '<li>' + esc(item) + '</li>';
        } else {
          out += '<li><strong>' + esc(item.title || '') + ':</strong> ' + esc(item.detail || '') + '</li>';
        }
      }
      return out + '</ol>';
    }
    var html = '<section class="ic-block ic-paths"' + dataAttrs(data.meta, 'happy-negative', data.recordId || data.id) + ' id="' + esc(id) + '">';
    html += '<p class="ic-label">Happy path and negative paths</p>';
    if (data.title) html += '<h3 class="ic-title">' + esc(data.title) + '</h3>';
    /* A column with no items is not rendered, so a case with only
       negative paths shows no empty happy-path column. */
    var cols = '';
    if ((data.happy || []).length) cols += '<div class="ic-path-col ic-path-happy"><h4>Happy path</h4>' + steps(data.happy) + '</div>';
    if ((data.negative || []).length) cols += '<div class="ic-path-col ic-path-negative"><h4>Negative paths and edge cases</h4>' + steps(data.negative) + '</div>';
    html += '<div class="ic-path-cols">' + cols + '</div></section>';
    return html;
  }

  /* -------------------------------------------- 5. Message viewer ---
   * Renders a message with its fields in a readable table, highlighting
   * the fields relevant to the case.
   * data: { meta, message: 'pacs.008', title?, fields: [{tag, name,
   *   value?, relevant?, note?}], recordId? } */
  function messageViewer(data) {
    data = data || {};
    var id = data.id || nextId('ic-msg');
    var fields = data.fields || [];
    /* The Value and Note columns only render when at least one field
       carries a value or a note. The authored message fields carry
       field names only, so rendering the two empty columns left a
       blank grid on every message table. */
    var hasValue = false;
    var hasNote = false;
    for (var h = 0; h < fields.length; h++) {
      var fh = fields[h] || {};
      if (fh.value && String(fh.value).replace(/\s/g, '')) hasValue = true;
      if (fh.note && String(fh.note).replace(/\s/g, '')) hasNote = true;
    }
    var html = '<section class="ic-block ic-message"' + dataAttrs(data.meta, 'message-viewer', data.recordId || data.id) + ' id="' + esc(id) + '">';
    html += '<p class="ic-label">Message viewer</p>';
    html += '<h3 class="ic-title">' + esc(data.message || 'Message') + (data.title ? ' ' + esc(data.title) : '') + '</h3>';
    html += '<table class="ic-msg-table"><thead><tr><th scope="col">Field</th><th scope="col">Name</th>' +
      (hasValue ? '<th scope="col">Value</th>' : '') + (hasNote ? '<th scope="col">Note</th>' : '') + '</tr></thead><tbody>';
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i] || {};
      html += '<tr class="' + (f.relevant ? 'ic-msg-hl' : '') + '">' +
        '<td><code>' + esc(f.tag || '') + '</code></td>' +
        '<td>' + esc(f.name || '') + (f.relevant ? ' <span class="ic-msg-tag">Relevant to this case</span>' : '') + '</td>' +
        (hasValue ? '<td><code>' + esc(f.value || '') + '</code></td>' : '') +
        (hasNote ? '<td>' + esc(f.note || '') + '</td>' : '') + '</tr>';
    }
    html += '</tbody></table></section>';
    return html;
  }

  /* ------------------------------------------------ 6. Gherkin ---
   * Given / When / Then acceptance criteria in a clean code-style block.
   * data: { meta, title?, scenarios: [{title?, given, when, then}] }.
   * Accepts a single criteria string as data.criteria for one scenario. */
  function gherkin(data) {
    data = data || {};
    var id = data.id || nextId('ic-gherkin');
    var scenarios = data.scenarios || [];
    if (!scenarios.length && data.criteria) {
      scenarios = [{ given: '', when: '', then: data.criteria }];
    }
    var html = '<section class="ic-block ic-gherkin"' + dataAttrs(data.meta, 'gherkin', data.recordId || data.id) + ' id="' + esc(id) + '">';
    html += '<p class="ic-label">Acceptance criteria</p>';
    if (data.title) html += '<h3 class="ic-title">' + esc(data.title) + '</h3>';
    for (var i = 0; i < scenarios.length; i++) {
      var s = scenarios[i] || {};
      html += '<div class="ic-gherkin-scenario">';
      if (s.title) html += '<p class="ic-gherkin-name">' + esc(s.title) + '</p>';
      html += '<pre class="ic-code"><code>' +
        (s.given ? '<span class="ic-kw-given">Given</span>&nbsp;' + esc(s.given) + '\n' : '') +
        (s.when ? '<span class="ic-kw-when">When</span>&nbsp;' + esc(s.when) + '\n' : '') +
        (s.then ? '<span class="ic-kw-then">Then</span>&nbsp;' + esc(s.then) : '') +
        '</code></pre></div>';
    }
    html += '</section>';
    return html;
  }

  /* -------------------------------------------- 7. Knowledge check ---
   * 3 to 5 multiple-choice questions with immediate Correct / Incorrect
   * feedback plus explanation. Same interaction pattern as the lesson
   * framework quiz (pfCheckAnswer), namespaced so the two never clash.
   * data: { meta, title?, questions: [{question, options: [4],
   *   answer: idx, explanation, whyWrong: [4]}], recordId? } */
  function knowledgeCheck(data) {
    data = data || {};
    var id = data.id || nextId('ic-quiz');
    var questions = data.questions || [];
    var html = '<section class="ic-block ic-quiz"' + dataAttrs(data.meta, 'knowledge-check', data.recordId || data.id) + ' id="' + esc(id) + '">';
    html += '<p class="ic-label">Knowledge check</p>';
    if (data.title) html += '<h3 class="ic-title">' + esc(data.title) + '</h3>';
    for (var i = 0; i < questions.length; i++) {
      var q = questions[i] || {};
      var qid = id + '-q' + i;
      html += '<div class="ic-quiz-q" id="' + esc(qid) + '" data-ic-answer="' + esc(q.answer || 0) + '">';
      html += '<p class="ic-quiz-question"><strong>Q' + (i + 1) + '.</strong> ' + esc(q.question || '') + '</p>';
      var opts = q.options || [];
      for (var j = 0; j < opts.length; j++) {
        html += '<button type="button" class="ic-quiz-opt" data-ic-action="quiz-opt" data-ic-block="' +
          esc(qid) + '" data-ic-idx="' + j + '">' + esc(opts[j]) + '</button>';
      }
      html += '<p class="ic-quiz-feedback" id="' + esc(qid) + '-fb" aria-live="polite" hidden></p>';
      html += '<script type="application/json" id="' + esc(qid) + '-data">' +
        jsonBlob({ explanation: q.explanation || '', whyWrong: q.whyWrong || [] }) + '</script>';
      html += '</div>';
    }
    html += '<p class="ic-quiz-score" id="' + esc(id) + '-score" aria-live="polite" hidden></p>';
    html += '<p><button type="button" class="ic-btn ic-btn-secondary" data-ic-action="quiz-reset" data-ic-block="' +
      esc(id) + '" id="' + esc(id) + '-retry" hidden>Try the knowledge check again</button></p>';
    html += '</section>';
    return html;
  }

  /* -------------------------------------- Level composer (1, 2, 3) ---
   * Assembles the primitives into the Learning Depth Framework layouts.
   * Level 1: context, pause-and-think, one knowledge check.
   * Level 2: problem, pause-and-think, decision, solution, flow, paths, assessment.
   * Level 3: all ten parts in order. */
  function renderLevel(level, data) {
    data = data || {};
    level = normDepth(level);
    var meta = data.meta || {};
    var id = data.id || nextId('ic-level');
    var out = '<div class="ic-level"' + dataAttrs(meta, 'level-' + level, data.recordId || data.id) + ' id="' + esc(id) + '">';
    out += metaLine(meta);
    if (data.evidence) out += evidenceLabel(data.evidence);
    else if (data.evidenceStatus) out += evidenceLabelFor(data.evidenceStatus);

    function section(label, bodyHtml) {
      if (!bodyHtml) return '';
      return '<div class="ic-level-part"><p class="ic-part-label">' + label + '</p>' + bodyHtml + '</div>';
    }
    function paras(text) {
      if (!text) return '';
      return '<p>' + esc(text) + '</p>';
    }
    function list(items) {
      if (!items || !items.length) return '';
      var h = '<ul class="ic-list">';
      for (var i = 0; i < items.length; i++) h += '<li>' + esc(items[i]) + '</li>';
      return h + '</ul>';
    }

    if (level === 1) {
      out += section('1. Context', paras(data.context));
      out += pauseThink({
        meta: meta, question: data.question, answer: data.answer,
        takeaway: data.takeaway, recordId: data.recordId
      });
      if (data.check) {
        out += knowledgeCheck({ meta: meta, questions: [data.check], recordId: data.recordId });
      }
      out += '</div>';
      return out;
    }

    /* Levels 2 and 3 share the opening parts; Level 3 adds the rest. */
    out += section('1. Business problem', paras(data.problem || data.context));
    /* Pause and think (Level 2 only): the learner thinks about the
       decision question first, then reveals the model answer. The
       question is the decision exercise question, or an authored pause
       question when the record carries one; the model answer is the
       recommended solution. Blocks with no decision exercise and no
       authored pause question (the cross-linked scenarios) get no pause
       block, so nothing is invented. The reveal stays hidden until the
       learner clicks it; part 3 below stays the canonical solution. */
    if (level === 2) {
      var pauseQ = data.pauseQuestion || (data.decision && data.decision.question) || '';
      var pauseA = data.pauseAnswer || data.solution || '';
      if (pauseQ && pauseA) {
        out += pauseThink({
          meta: meta, question: pauseQ,
          context: data.pauseContext || (data.decision && data.decision.context) || '',
          answer: pauseA, recordId: data.recordId
        });
      }
    }
    /* The recommended solution and the decision rationale stay hidden
       until the learner makes a choice, so the exercise is not spoiled
       by the answer sitting on the page. The decision handler reveals
       the container whose id is the decision block id plus '-solution'.
       When there is no decision exercise the solution shows normally. */
    var decId = null;
    if (data.decision) {
      decId = nextId('ic-decision');
      out += decisionBranch({
        id: decId, meta: meta, question: data.decision.question, context: data.decision.context,
        options: data.decision.options, recordId: data.recordId
      });
    }
    var solHtml = section('Decision rationale', paras(data.decisionRationale)) +
      section('3. Recommended solution', paras(data.solution));
    if (solHtml) {
      if (decId) out += '<div id="' + esc(decId) + '-solution" hidden>' + solHtml + '</div>';
      else out += solHtml;
    }
    if (data.flow) out += flowPlayer({ meta: meta, title: 'End-to-end flow', steps: data.flow.steps || data.flow, recordId: data.recordId });
    if (data.happy || data.negative) {
      out += happyNegative({ meta: meta, happy: data.happy, negative: data.negative, recordId: data.recordId });
    }
    if (level === 2) {
      /* Scenarios carry technical notes, Gherkin and a workshop question
         as well; render them when the record has them, skip when not. */
      out += section('Technical and data considerations', list(data.technical) + paras(data.technicalText));
      if (data.gherkin) {
        out += gherkin({ meta: meta, title: 'Gherkin acceptance criteria', scenarios: data.gherkin.scenarios, criteria: data.gherkin.criteria, recordId: data.recordId });
      }
      out += section('Workshop question', paras(data.workshopQuestion));
      if (data.check) out += knowledgeCheck({ meta: meta, questions: data.check.questions || [data.check], recordId: data.recordId });
      out += '</div>';
      return out;
    }

    /* Level 3 only, parts 6 to 10. */
    out += section('6. Technical and data considerations', list(data.technical) + paras(data.technicalText));
    if (data.messages) {
      for (var m = 0; m < data.messages.length; m++) {
        out += messageViewer({ meta: meta, message: data.messages[m].message, title: data.messages[m].title, fields: data.messages[m].fields, recordId: data.recordId });
      }
    }
    out += section('8. Accounting and operational impact', list(data.accounting) + paras(data.accountingText));
    if (data.gherkin) {
      out += gherkin({ meta: meta, title: 'Gherkin acceptance criteria', scenarios: data.gherkin.scenarios || [{ given: data.gherkin.given, when: data.gherkin.when, then: data.gherkin.then }], recordId: data.recordId });
    }
    if (data.check) out += knowledgeCheck({ meta: meta, questions: data.check.questions || [data.check], recordId: data.recordId });
    out += '</div>';
    return out;
  }

  /* ------------------------------------------------------- Render ---
   * render(type, data) returns the HTML string for one component.
   * renderAll(root) renders every [data-ic-type] container whose JSON
   * blob sits in a child <script type="application/json">. */
  var RENDERERS = {
    'pause-think': pauseThink,
    'decision-branch': decisionBranch,
    'flow': flowPlayer,
    'happy-negative': happyNegative,
    'message-viewer': messageViewer,
    'gherkin': gherkin,
    'knowledge-check': knowledgeCheck,
    'evidence': function (data) { return evidenceLabel(data.type || data.evidence); },
    'level': function (data) { return renderLevel(data.level || data.depth, data); }
  };

  function render(type, data) {
    var fn = RENDERERS[type];
    if (!fn) return '';
    return fn(data || {});
  }

  function renderAll(root) {
    if (typeof document === 'undefined') return 0;
    root = root || document;
    var nodes = root.querySelectorAll('[data-ic-type]');
    var done = 0;
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.getAttribute('data-ic-rendered') === '1') continue;
      var script = node.querySelector('script[type="application/json"]');
      if (!script) continue;
      var data = null;
      try { data = JSON.parse(script.textContent); } catch (e) { data = null; }
      if (!data) continue;
      node.innerHTML = render(node.getAttribute('data-ic-type'), data);
      node.setAttribute('data-ic-rendered', '1');
      done += 1;
    }
    return done;
  }

  /* --------------------------------------------------- Interactions ---
   * One delegated click listener covers every component on the page, so
   * server-rendered and client-rendered content behave the same. */
  var flowTimers = {};

  function flowSetStep(blockId, idx) {
    if (typeof document === 'undefined') return;
    var block = document.getElementById(blockId);
    if (!block) return;
    var steps = block.querySelectorAll('.ic-flow-step');
    var status = document.getElementById(blockId + '-status');
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.remove('ic-flow-now', 'ic-flow-done');
      if (i < idx) steps[i].classList.add('ic-flow-done');
      if (i === idx) steps[i].classList.add('ic-flow-now');
    }
    if (status) {
      status.textContent = idx >= steps.length
        ? 'Flow complete: ' + steps.length + ' of ' + steps.length + ' steps'
        : 'Step ' + (idx + 1) + ' of ' + steps.length;
    }
  }

  function flowStop(blockId) {
    if (flowTimers[blockId]) {
      clearInterval(flowTimers[blockId]);
      delete flowTimers[blockId];
    }
    if (typeof document === 'undefined') return;
    var block = document.getElementById(blockId);
    if (!block) return;
    var play = block.querySelector('[data-ic-action="flow-play"]');
    var pause = block.querySelector('[data-ic-action="flow-pause"]');
    if (play) { play.disabled = false; play.textContent = 'Play the flow'; }
    if (pause) pause.disabled = true;
  }

  function flowPlay(blockId) {
    if (typeof document === 'undefined' || reducedMotion) return;
    var block = document.getElementById(blockId);
    if (!block) return;
    var steps = block.querySelectorAll('.ic-flow-step');
    if (!steps.length) return;
    var list = block.querySelector('.ic-flow-steps');
    var seconds = list ? parseFloat(list.getAttribute('data-ic-step-seconds') || '1.8') : 1.8;
    var current = 0;
    var now = block.querySelector('.ic-flow-now');
    if (now) current = parseInt(now.getAttribute('data-ic-step'), 10) || 0;
    var done = block.querySelectorAll('.ic-flow-done').length;
    if (done >= steps.length) { current = 0; }
    flowSetStep(blockId, current);
    var play = block.querySelector('[data-ic-action="flow-play"]');
    var pause = block.querySelector('[data-ic-action="flow-pause"]');
    if (play) { play.disabled = true; play.textContent = 'Playing...'; }
    if (pause) pause.disabled = false;
    flowTimers[blockId] = setInterval(function () {
      current += 1;
      if (current >= steps.length) {
        flowSetStep(blockId, steps.length);
        flowStop(blockId);
        return;
      }
      flowSetStep(blockId, current);
    }, Math.max(600, seconds * 1000));
  }

  /* Knowledge-check answers persist across reloads in localStorage, so
     a learner who answers a check and reloads the page sees their
     answers and score again instead of a blank check. One entry per
     quiz, keyed by page path and quiz id. */
  function icQuizKey(quizId) {
    var path = '';
    try { path = (typeof location !== 'undefined' && location.pathname) ? location.pathname : ''; } catch (e) { path = ''; }
    return 'pf-ic-quiz:' + path + ':' + quizId;
  }
  function icQuizSave(quizId) {
    try {
      if (typeof localStorage === 'undefined') return;
      var quiz = document.getElementById(quizId);
      if (!quiz) return;
      var state = {};
      var qs = quiz.querySelectorAll('.ic-quiz-q');
      for (var i = 0; i < qs.length; i++) {
        var q = qs[i];
        var chosen = q.querySelector('.ic-quiz-opt[data-ic-chosen="1"]');
        if (chosen) {
          state[q.getAttribute('id')] = {
            chosen: parseInt(chosen.getAttribute('data-ic-idx'), 10),
            correct: q.getAttribute('data-ic-user-correct') === '1'
          };
        }
      }
      localStorage.setItem(icQuizKey(quizId), JSON.stringify(state));
    } catch (e) { /* storage unavailable: answers still work in-session */ }
  }
  function icQuizRestore(root) {
    try {
      if (typeof localStorage === 'undefined' || !root) return;
      var quizzes = root.querySelectorAll ? root.querySelectorAll('.ic-quiz') : [];
      for (var qi = 0; qi < quizzes.length; qi++) {
        var quiz = quizzes[qi];
        var raw = localStorage.getItem(icQuizKey(quiz.getAttribute('id')));
        if (!raw) continue;
        var state = JSON.parse(raw);
        var qs = quiz.querySelectorAll('.ic-quiz-q');
        var allAnswered = true;
        for (var i = 0; i < qs.length; i++) {
          var q = qs[i];
          var saved = state[q.getAttribute('id')];
          if (!saved) { allAnswered = false; continue; }
          var answer = parseInt(q.getAttribute('data-ic-answer'), 10);
          var chosen = saved.chosen;
          var qopts = q.querySelectorAll('.ic-quiz-opt');
          for (var m = 0; m < qopts.length; m++) {
            qopts[m].disabled = true;
            if (m === answer) qopts[m].classList.add('ic-quiz-correct');
            if (m === chosen && chosen !== answer) qopts[m].classList.add('ic-quiz-wrong');
            if (m === chosen) qopts[m].setAttribute('data-ic-chosen', '1');
          }
          q.setAttribute('data-ic-user-correct', saved.correct ? '1' : '0');
          var fb = document.getElementById(q.getAttribute('id') + '-fb');
          var qdataEl = document.getElementById(q.getAttribute('id') + '-data');
          var qdata = {};
          try { qdata = JSON.parse(qdataEl ? qdataEl.textContent : '{}'); } catch (e) { qdata = {}; }
          if (fb) {
            var why = (qdata && qdata.whyWrong && qdata.whyWrong[chosen]) ? qdata.whyWrong[chosen] : '';
            fb.innerHTML = '<strong>' + (chosen === answer ? 'Correct.' : 'Not quite.') + '</strong> ' +
              esc(qdata && qdata.explanation ? qdata.explanation : '') +
              (why ? '<br><br>' + esc(why) : '');
            fb.removeAttribute('hidden');
          }
        }
        if (allAnswered) {
          var questions = qs.length;
          var correctCount = quiz.querySelectorAll('.ic-quiz-q[data-ic-user-correct="1"]').length;
          var score = document.getElementById(quiz.getAttribute('id') + '-score');
          if (score) {
            score.textContent = 'You answered ' + correctCount + ' of ' + questions + ' correctly.';
            score.removeAttribute('hidden');
          }
          var retry = document.getElementById(quiz.getAttribute('id') + '-retry');
          if (retry) retry.removeAttribute('hidden');
        }
      }
    } catch (e) { /* restore is best-effort */ }
  }

  function init(root) {
    if (typeof document === 'undefined') return;
    if (document.__pfInsightInit) return;
    document.__pfInsightInit = true;
    document.addEventListener('click', function (ev) {
      var t = ev.target && ev.target.closest ? ev.target.closest('[data-ic-action]') : null;
      if (!t) return;
      var action = t.getAttribute('data-ic-action');

      if (action === 'reveal') {
        var target = document.getElementById(t.getAttribute('data-ic-target'));
        if (!target) return;
        var open = target.hasAttribute('hidden');
        if (open) target.removeAttribute('hidden');
        else target.setAttribute('hidden', '');
        t.setAttribute('aria-expanded', open ? 'true' : 'false');
        t.textContent = open ? 'Hide the model answer' : 'Think, then reveal the model answer';
        return;
      }

      if (action === 'decision') {
        var blockId = t.getAttribute('data-ic-block');
        var block = document.getElementById(blockId);
        if (!block) return;
        var dataEl = document.getElementById(blockId + '-data');
        var data = null;
        try { data = JSON.parse(dataEl ? dataEl.textContent : '{}'); } catch (e) { data = null; }
        var idx = parseInt(t.getAttribute('data-ic-idx'), 10);
        var correct = t.getAttribute('data-ic-correct') === '1';
        var opts = block.querySelectorAll('.ic-option');
        for (var i = 0; i < opts.length; i++) {
          opts[i].disabled = true;
          if (opts[i].getAttribute('data-ic-correct') === '1') opts[i].classList.add('ic-option-correct');
        }
        if (!correct) t.classList.add('ic-option-wrong');
        var opt = data && data.options ? data.options[idx] : null;
        var result = document.getElementById(blockId + '-result');
        if (result) {
          result.innerHTML = '<p><strong>' + (correct ? 'Recommended path.' : 'Not the recommended path.') + '</strong> ' +
            esc(opt && opt.why ? opt.why : '') + '</p>';
          result.removeAttribute('hidden');
        }
        var branches = document.getElementById(blockId + '-branches');
        if (branches) branches.removeAttribute('hidden');
        var rst = document.getElementById(blockId + '-reset');
        if (rst) rst.removeAttribute('hidden');
        var sol = document.getElementById(blockId + '-solution');
        if (sol) sol.removeAttribute('hidden');
        return;
      }

      if (action === 'decision-reset') {
        var bid = t.getAttribute('data-ic-block');
        var b = document.getElementById(bid);
        if (!b) return;
        var o2 = b.querySelectorAll('.ic-option');
        for (var k = 0; k < o2.length; k++) {
          o2[k].disabled = false;
          o2[k].classList.remove('ic-option-correct', 'ic-option-wrong');
        }
        var r2 = document.getElementById(bid + '-result');
        if (r2) r2.setAttribute('hidden', '');
        var br2 = document.getElementById(bid + '-branches');
        if (br2) br2.setAttribute('hidden', '');
        var rst2 = document.getElementById(bid + '-reset');
        if (rst2) rst2.setAttribute('hidden', '');
        var sol2 = document.getElementById(bid + '-solution');
        if (sol2) sol2.setAttribute('hidden', '');
        return;
      }

      if (action === 'flow-play') { flowPlay(t.getAttribute('data-ic-block')); return; }
      if (action === 'flow-pause') { flowStop(t.getAttribute('data-ic-block')); return; }

      if (action === 'flow-step') {
        var fbid = t.getAttribute('data-ic-block');
        flowStop(fbid);
        flowSetStep(fbid, parseInt(t.getAttribute('data-ic-idx'), 10) || 0);
        return;
      }

      if (action === 'quiz-opt') {
        var qid = t.getAttribute('data-ic-block');
        var q = document.getElementById(qid);
        if (!q) return;
        var answer = parseInt(q.getAttribute('data-ic-answer'), 10);
        var chosen = parseInt(t.getAttribute('data-ic-idx'), 10);
        var qopts = q.querySelectorAll('.ic-quiz-opt');
        for (var m = 0; m < qopts.length; m++) {
          qopts[m].disabled = true;
          if (m === answer) qopts[m].classList.add('ic-quiz-correct');
          if (m === chosen && chosen !== answer) qopts[m].classList.add('ic-quiz-wrong');
          if (m === chosen) qopts[m].setAttribute('data-ic-chosen', '1');
        }
        /* Record whether the learner picked the right option. The score
           must count questions the learner got right, not options marked
           correct: the correct option is highlighted on every answered
           question, so counting highlighted options always equals the
           question count. */
        q.setAttribute('data-ic-user-correct', chosen === answer ? '1' : '0');
        icQuizSave(q.closest('.ic-quiz') ? q.closest('.ic-quiz').getAttribute('id') : '');
        var fb = document.getElementById(qid + '-fb');
        var qdata = null;
        var qdataEl = document.getElementById(qid + '-data');
        try { qdata = JSON.parse(qdataEl ? qdataEl.textContent : '{}'); } catch (e) { qdata = {}; }
        if (fb) {
          var why = (qdata && qdata.whyWrong && qdata.whyWrong[chosen]) ? qdata.whyWrong[chosen] : '';
          fb.innerHTML = '<strong>' + (chosen === answer ? 'Correct.' : 'Not quite.') + '</strong> ' +
            esc(qdata && qdata.explanation ? qdata.explanation : '') +
            (why ? '<br><br>' + esc(why) : '');
          fb.removeAttribute('hidden');
        }
        /* Score line for the whole check, once every question is answered. */
        var quiz = q.closest('.ic-quiz');
        if (quiz) {
          var questions = quiz.querySelectorAll('.ic-quiz-q').length;
          var correctCount = quiz.querySelectorAll('.ic-quiz-q[data-ic-user-correct="1"]').length;
          var answeredQs = 0;
          var qs = quiz.querySelectorAll('.ic-quiz-q');
          for (var n = 0; n < qs.length; n++) {
            if (qs[n].querySelector('.ic-quiz-opt:disabled')) answeredQs += 1;
          }
          if (answeredQs === questions) {
            var score = document.getElementById(quiz.getAttribute('id') + '-score');
            if (score) {
              score.textContent = 'You answered ' + correctCount + ' of ' + questions + ' correctly.';
              score.removeAttribute('hidden');
            }
            var retry = document.getElementById(quiz.getAttribute('id') + '-retry');
            if (retry) retry.removeAttribute('hidden');
          }
        }
        return;
      }

      if (action === 'quiz-reset') {
        var qbid = t.getAttribute('data-ic-block');
        var qb = document.getElementById(qbid);
        if (!qb) return;
        var qo = qb.querySelectorAll('.ic-quiz-opt');
        for (var p = 0; p < qo.length; p++) {
          qo[p].disabled = false;
          qo[p].classList.remove('ic-quiz-correct', 'ic-quiz-wrong');
          qo[p].removeAttribute('data-ic-chosen');
        }
        var qqs = qb.querySelectorAll('.ic-quiz-q');
        for (var r = 0; r < qqs.length; r++) {
          qqs[r].removeAttribute('data-ic-user-correct');
        }
        var qfbs = qb.querySelectorAll('.ic-quiz-feedback');
        for (var s = 0; s < qfbs.length; s++) {
          qfbs[s].setAttribute('hidden', '');
          qfbs[s].innerHTML = '';
        }
        var qscore = document.getElementById(qbid + '-score');
        if (qscore) qscore.setAttribute('hidden', '');
        var qretry = document.getElementById(qbid + '-retry');
        if (qretry) qretry.setAttribute('hidden', '');
        try { if (typeof localStorage !== 'undefined') localStorage.removeItem(icQuizKey(qbid)); } catch (e) { /* ignore */ }
        return;
      }
    });
    if (root) renderAll(root);
    else renderAll(document);
    icQuizRestore(root || document);
  }

  var api = {
    esc: esc,
    normDepth: normDepth,
    evidenceLabel: evidenceLabel,
    evidenceLabelFor: evidenceLabelFor,
    pauseThink: pauseThink,
    decisionBranch: decisionBranch,
    flowPlayer: flowPlayer,
    happyNegative: happyNegative,
    messageViewer: messageViewer,
    gherkin: gherkin,
    knowledgeCheck: knowledgeCheck,
    renderLevel: renderLevel,
    render: render,
    renderAll: renderAll,
    init: init,
    flowSetStep: flowSetStep,
    flowPlay: flowPlay,
    flowStop: flowStop,
    EVIDENCE_TYPES: Object.keys(EVIDENCE),
    reducedMotion: reducedMotion
  };

  global.PFInsight = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
