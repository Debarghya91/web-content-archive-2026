/* Payments Mystery Investigation Experience (website).
   Pure derivation plus rendering for the situations workspace and the
   weekly-case page. The derivation rules and template wording match
   the implementation plan sections 6 and 7 exactly, so the website
   experience and the app experience derive the same case from the
   same item. Derivation functions are pure: no DOM access, so this
   file loads and runs under Node for validation. All window and
   document access is guarded and lives in the rendering section.
   No new network calls. No new data file. Results persist under
   localStorage key pth-investigation-v1 only. */
(function (global) {
  'use strict';

  /* ================= Pure derivation (no DOM) ================= */

  var SAMPLE_IDS = ['ABH-01', 'ABH-04', 'JEB-C01', 'ABH-10', 'INS-086',
    'ABH-03', 'INS-033', 'INS-135', 'SCN-26', 'SCN-28'];
  var STORAGE_KEY = 'pth-investigation-v1';
  var CURRENCIES = ['EUR', 'USD', 'GBP', 'INR', 'JPY', 'CHF', 'AUD',
    'CAD', 'SGD', 'HKD', 'AED'];
  var EXPERT_PARTIAL_REASON = 'available only after a targeted status request';

  var OBJECTIVES = [
    'Establish what happened to the payment.',
    'Identify the root cause from the evidence.',
    'Recommend the corrective action and the control that prevents recurrence.'
  ];

  /* Template tables, shared wording with the app engine. */
  var CATEGORY_ALTERNATIVES = {
    rejected: 'A downstream system rejected the payment for a reason unrelated to the instruction.',
    duplicate: 'The payment was sent twice because the first attempt timed out.',
    sanctions: 'A sanctions list update held the payment after it was sent.',
    reconciliation: 'A timing difference between systems created a false break.',
    default: 'A fault in a downstream system stopped the payment after it left the sending bank.'
  };
  var IMPACT_SENTENCES = {
    rejected: 'The customer expected the payment to arrive and had to chase its status.',
    duplicate: 'The customer was debited more than once for the same payment.',
    sanctions: "The customer's payment was held without an explanation the customer could act on.",
    reconciliation: "The customer's balance and the bank's records did not agree.",
    default: 'The customer could not confirm whether the payment had completed.'
  };
  /* The plan names a category template assumption as the third
     fallback for the flawed requirement, but gives no table text
     for it. These generic templates fill that gap, one per
     category key, with no case facts in them. */
  var ASSUMPTION_TEMPLATES = {
    rejected: 'The team assumed the payment would be accepted because it passed validation.',
    duplicate: 'The team assumed a retry was safe because the first attempt had timed out.',
    sanctions: 'The team assumed the payment would pass screening because similar payments had passed.',
    reconciliation: 'The team assumed the records agreed because the totals matched.',
    default: 'The team assumed the payment had completed because the first step looked successful.'
  };
  var CORRECTIVE_DISTRACTORS = [
    'Ask the customer to send the payment again.',
    'Wait for the next processing window and check again.',
    'Raise a manual adjustment without investigating the cause.'
  ];
  var HINT_TEMPLATES = {
    'first-check': 'Start with the timeline, then check the message evidence.',
    message: 'Open the message evidence and compare what was sent with what was expected.',
    action: 'The evidence points to the next action; check what the last message actually said.',
    resolution: 'The real requirement in the case text states the fix.'
  };
  /* Catalogue purposes, first sentences from the message explorer
     content, plus pacs.028 and pacs.029 as the case texts describe
     them (status request, investigation). Codes with no verified
     catalogue entry use the honest fallback sentence, never an
     invented purpose. */
  var MESSAGE_PURPOSES = {
    'MT103': 'MT103 carries a single customer credit transfer instruction from one bank to another through SWIFT.',
    'MT202': 'MT202 carries a bank to bank transfer between financial institutions, with no customer beneficiary named in the message.',
    'MT101': 'MT101 is a request for transfer that a customer sends to its bank to instruct one or more payments from its account.',
    'MT900': 'MT900 is a confirmation that a bank has debited an account, sent to the account owner.',
    'MT910': 'MT910 is a confirmation that a bank has credited an account, sent to the account owner.',
    'MT940': 'MT940 is a customer statement message that a bank sends to its account owner at the end of a statement period.',
    'MT950': 'MT950 is a statement message that a bank sends to its account owner at the end of a statement period.',
    'pacs.008': 'pacs.008 is the ISO 20022 message that replaces MT103 for customer credit transfers between financial institutions.',
    'pacs.009': 'pacs.009 is the ISO 20022 Financial Institution Credit Transfer message for the bank to bank leg of a payment.',
    'pacs.002': 'pacs.002 is the ISO 20022 message one financial institution sends to another to report the status of a payment instruction it received.',
    'pacs.004': 'pacs.004 is the ISO 20022 message used to return a payment that was already settled but cannot be credited to the beneficiary.',
    'pacs.003': 'pacs.003 is the ISO 20022 message a creditor agent sends to a debtor agent to collect a direct debit.',
    'pacs.028': 'pacs.028 is the ISO 20022 message a bank sends to request the status of a payment instruction.',
    'pacs.029': 'pacs.029 is the ISO 20022 message that carries the resolution of a payment investigation.',
    'pain.001': 'pain.001 is the ISO 20022 message a corporate customer or payment initiator sends to its bank to instruct a credit transfer.',
    'pain.002': 'pain.002 is the ISO 20022 message a bank sends to its customer to report the status of payments instructed in a pain.001 file.',
    'pain.008': 'pain.008 is the ISO 20022 message a creditor customer sends to its bank to instruct direct debit collections.',
    'camt.052': 'camt.052 is the ISO 20022 bank to customer account report that a bank sends during the day, between final statements.',
    'camt.053': 'camt.053 is the ISO 20022 message a bank sends to its customer as an account statement.',
    'camt.054': 'camt.054 is the ISO 20022 bank to customer debit credit notification that a bank sends when a single entry is posted to an account.',
    'camt.056': 'camt.056 is the ISO 20022 message one bank sends to another to request cancellation of a payment instruction it already sent.',
    'camt.029': 'camt.029 is the ISO 20022 message a bank sends to resolve an investigation into a payment.'
  };

  function str(value) {
    return (value === null || value === undefined) ? '' : String(value);
  }
  function trim(value) {
    return str(value).replace(/^\s+|\s+$/g, '');
  }
  function firstSentence(text) {
    var t = trim(text);
    if (!t) return '';
    var m = t.match(/^.*?[.!?](\s|$)/);
    return m ? trim(m[0]) : t;
  }
  function categoryKey(failureCategory) {
    var c = trim(failureCategory).toLowerCase();
    if (!c) return 'default';
    if (c.indexOf('reject') !== -1 || c.indexOf('return') !== -1) return 'rejected';
    if (c.indexOf('duplicat') !== -1) return 'duplicate';
    if (c.indexOf('sanction') !== -1 || c.indexOf('fraud') !== -1) return 'sanctions';
    if (c.indexOf('reconcil') !== -1) return 'reconciliation';
    return 'default';
  }
  /* FNV-1a hash plus a small seeded PRNG, driving the deterministic
     Fisher-Yates shuffle. Same approach as the app: the same case id
     always produces the same order. */
  function fnv1a(text) {
    var hash = 0x811c9dc5;
    var s = str(text);
    for (var i = 0; i < s.length; i++) {
      hash ^= s.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return hash >>> 0;
  }
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function deterministicShuffle(list, seedText) {
    var out = list.slice();
    var rand = mulberry32(fnv1a(seedText));
    for (var i = out.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }
  function escapeHtml(value) {
    return str(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* Explain parsing. Blank-line paragraphs only, never single
     newlines. Markers follow the app parser: flow headers start
     with Here, end with a colon and contain happen (covers Here
     is what happened, Here is how, and the Here is how that
     happens variants); flawed-requirement headers use the listed
     prefixes; Why? and BA Takeaway match exactly; the real
     requirement matches by prefix; the closing question starts
     with Have you or Did you know. */
  function parseExplain(explain) {
    var paragraphs = str(explain).split(/\n\s*\n/)
      .map(function (p) { return trim(p); })
      .filter(function (p) { return !!p; });
    var parsed = {
      opening: [], flowSteps: [], flawedRequirement: [], rootCause: [],
      insight: '', baBody: [], controls: [], realRequirement: [],
      closingQuestion: '', hasWhy: false, hasFlowHeader: false
    };
    if (!paragraphs.length) return parsed;
    function isFlowHeader(para) {
      return para.indexOf('Here') === 0 && para.slice(-1) === ':' &&
        para.indexOf('happen') !== -1;
    }
    function isFlawedHeader(para) {
      var prefixes = ['The requirement said:', 'The assumption was:',
        'The assumption said:', 'The requirement says',
        'The requirement is written', 'The instruction was:'];
      for (var i = 0; i < prefixes.length; i++) {
        if (para.indexOf(prefixes[i]) === 0) return true;
      }
      return false;
    }
    function arrowLines(para) {
      var out = [];
      str(para).split('\n').forEach(function (line) {
        var t = trim(line);
        if (t.charAt(0) === '\u2192') {
          var body = trim(t.slice(1));
          if (body) out.push(body);
        }
      });
      return out;
    }
    function firstIndex(pred) {
      for (var i = 0; i < paragraphs.length; i++) {
        if (pred(paragraphs[i])) return i;
      }
      return -1;
    }
    var flowIndex = firstIndex(isFlowHeader);
    var flawedIndex = firstIndex(isFlawedHeader);
    var whyIndex = firstIndex(function (p) { return p === 'Why?'; });
    var baIndex = firstIndex(function (p) { return p === 'BA Takeaway'; });
    var realIndex = firstIndex(function (p) { return p.indexOf('The real requirement') === 0; });
    parsed.hasWhy = whyIndex !== -1;
    parsed.hasFlowHeader = flowIndex !== -1;
    var bodyEnd = paragraphs.length;
    var last = paragraphs[paragraphs.length - 1];
    if (last.indexOf('Have you') === 0 || last.indexOf('Did you know') === 0) {
      parsed.closingQuestion = last;
      bodyEnd -= 1;
    }
    var openingEnd;
    if (flowIndex !== -1) openingEnd = flowIndex;
    else if (flawedIndex !== -1) openingEnd = flawedIndex;
    else openingEnd = Math.min(2, bodyEnd);
    parsed.opening = paragraphs.slice(0, openingEnd);
    if (flowIndex !== -1 && flowIndex + 1 < paragraphs.length) {
      parsed.flowSteps = arrowLines(paragraphs[flowIndex + 1]);
    }
    if (flawedIndex !== -1) {
      if (whyIndex !== -1) {
        parsed.flawedRequirement = paragraphs.slice(flawedIndex, whyIndex);
      } else if (baIndex !== -1 && baIndex > flawedIndex + 1) {
        parsed.flawedRequirement = [paragraphs[flawedIndex]];
      } else {
        parsed.flawedRequirement = paragraphs.slice(flawedIndex, Math.min(bodyEnd, paragraphs.length));
      }
    }
    if (baIndex !== -1 && baIndex > 0) {
      var candidate = paragraphs[baIndex - 1];
      if (candidate.indexOf('\u2192') === -1 && !isFlowHeader(candidate)) {
        parsed.insight = candidate;
      }
      var causeStart = -1;
      if (whyIndex !== -1) causeStart = whyIndex + 1;
      else if (flawedIndex !== -1) causeStart = flawedIndex + 1;
      if (causeStart !== -1 && causeStart < baIndex - 1) {
        var causeEnd = parsed.insight ? baIndex - 1 : baIndex;
        parsed.rootCause = paragraphs.slice(causeStart, causeEnd);
      }
    }
    if (baIndex !== -1) {
      var solutionEnd = realIndex !== -1 ? realIndex : bodyEnd;
      for (var s = baIndex + 1; s < solutionEnd; s++) {
        var para = paragraphs[s];
        var lines = arrowLines(para);
        if (lines.length) {
          parsed.controls = parsed.controls.concat(lines);
        } else if (para.slice(-10) === 'separate:' || para.indexOf('keep them separate:') !== -1) {
          continue;
        } else {
          parsed.baBody.push(para);
        }
      }
      parsed.baSection = paragraphs.slice(baIndex + 1, solutionEnd).join(' ');
    }
    if (realIndex !== -1 && realIndex < bodyEnd) {
      parsed.realRequirement = paragraphs.slice(realIndex, bodyEnd);
    }
    return parsed;
  }

  function paymentHeader(title, explain) {
    var header = {
      amountText: 'Amount not stated in the case',
      currencyText: 'Not stated in the case',
      amountValue: 'NOT STATED',
      currencyValue: 'NOT STATED',
      partiesText: 'The customer and the beneficiary, through the sending bank and the beneficiary bank.',
      referenceText: 'Reference not stated in the case'
    };
    var currencyPattern = new RegExp('\\b(' + CURRENCIES.join('|') + ')\\s?([0-9][0-9,]*(?:\\.[0-9]+)?)');
    var rsPattern = /(Rs\.?|₹)\s?([0-9][0-9,]*(?:\.[0-9]+)?)/;
    var sources = [str(title), str(explain)];
    var match = null;
    var currency = '';
    for (var i = 0; i < sources.length && !match; i++) {
      match = currencyPattern.exec(sources[i]);
      if (match) currency = match[1];
      if (!match) {
        match = rsPattern.exec(sources[i]);
        if (match) currency = match[1];
      }
    }
    if (match) {
      header.amountText = trim(match[0]);
      header.currencyText = currency;
      header.amountValue = trim(match[0]);
      header.currencyValue = currency;
    }
    var refMatch = /\breference\b[^A-Za-z0-9]{0,3}([A-Za-z0-9\-]*\d[A-Za-z0-9\-]{5,})/i.exec(str(explain));
    if (refMatch) header.referenceText = refMatch[1];
    return header;
  }

  function severityLabel(level, failureCategory) {
    var lvl = trim(level).toLowerCase();
    var hasCategory = !!trim(failureCategory);
    if (lvl === 'advanced' && hasCategory) return 'High';
    if (lvl === 'core' && hasCategory) return 'Medium';
    return 'Moderate';
  }

  var CODE_PATTERN = /\b(?:pacs|pain|camt)\.\d{3}\b|\bMT\d{3}\b/gi;
  function normalizeCode(code) {
    var c = trim(code);
    if (/^MT/i.test(c)) return c.toUpperCase();
    return c.toLowerCase();
  }
  function isCodeShaped(value) {
    return /^(?:pacs|pain|camt)\.\d{3}$/i.test(trim(value)) || /^MT\d{3}$/i.test(trim(value));
  }
  function regexCodes(title, explain) {
    var found = [];
    var seen = {};
    var text = str(title) + ' ' + str(explain);
    var m;
    CODE_PATTERN.lastIndex = 0;
    while ((m = CODE_PATTERN.exec(text)) !== null) {
      var code = normalizeCode(m[0]);
      if (!seen[code]) {
        seen[code] = true;
        found.push(code);
      }
      if (found.length >= 6) break;
    }
    return found;
  }
  /* Rule 10: stage-map messages when present, else codes found by
     regex, deduplicated, in order of first mention, capped at 6.
     The stage map carries a few non-code entries (for example
     RespPay and MT0xx); those stay in the case messages list, but
     message evidence is generated only for code-shaped entries,
     falling back to the regex scan when no stage-map entry is a
     code. No message evidence is generated when no code is found
     anywhere. */
  function messageCodes(item, title, explain) {
    var listed = [];
    if (Array.isArray(item.messages)) {
      item.messages.forEach(function (m) {
        var v = trim(m);
        if (v) listed.push(v);
      });
    }
    var shaped = listed.filter(isCodeShaped).map(normalizeCode);
    var deduped = [];
    var seen = {};
    shaped.forEach(function (c) {
      if (!seen[c]) { seen[c] = true; deduped.push(c); }
    });
    if (deduped.length) return { listed: listed, codes: deduped.slice(0, 6) };
    var scanned = regexCodes(title, explain);
    if (listed.length) return { listed: listed, codes: scanned };
    return { listed: scanned, codes: scanned };
  }

  function visualFlowSteps(item) {
    var visual = item.visual || {};
    if (visual.type === 'flow' && visual.flow && Array.isArray(visual.flow.steps)) {
      return visual.flow.steps.map(function (s) {
        return { kind: str(s.kind || 'step'), title: trim(s.title), note: trim(s.note) };
      }).filter(function (s) { return !!s.title; });
    }
    return [];
  }
  function stripQuotes(text) {
    return trim(text).replace(/^["\u201C]+/, '').replace(/["\u201D]+$/, '').replace(/^["']+|["']+$/g, '');
  }
  function flawedRequirementText(parsed, catKey) {
    if (parsed.flawedRequirement.length) {
      var first = parsed.flawedRequirement[0];
      var lines = str(first).split('\n');
      var rest = lines.length > 1 ? trim(lines.slice(1).join(' ')) : '';
      if (!rest) {
        var colon = first.indexOf(':');
        rest = colon !== -1 ? trim(first.slice(colon + 1)) : '';
      }
      var quoted = stripQuotes(rest);
      if (quoted) return quoted;
    }
    if (parsed.rootCause.length) {
      var sentence = firstSentence(parsed.rootCause[0]);
      if (sentence) return sentence;
    }
    return ASSUMPTION_TEMPLATES[catKey] || ASSUMPTION_TEMPLATES.default;
  }
  function rootCauseText(parsed, takeaway, realText) {
    if (parsed.rootCause.length) return parsed.rootCause.join(' ');
    var combined = trim(trim(takeaway) + ' ' + trim(realText));
    return combined || trim(takeaway) || 'The case does not state a root cause in the text provided.';
  }
  function realRequirementText(parsed, takeaway) {
    if (parsed.realRequirement.length) return parsed.realRequirement.join(' ');
    return trim(takeaway);
  }
  function correctiveActionText(parsed, takeaway) {
    var paras = parsed.realRequirement;
    for (var i = paras.length - 1; i >= 0; i--) {
      var p = trim(paras[i]);
      if (p.indexOf('It is') === 0 || p.indexOf("It's") === 0) return p;
    }
    var full = realRequirementText(parsed, takeaway);
    return full || trim(takeaway);
  }
  function controlsList(parsed, takeaway) {
    if (parsed.controls.length) return parsed.controls.slice();
    if (parsed.baSection) return [trim(parsed.baSection)];
    if (parsed.baBody.length) return [parsed.baBody.join(' ')];
    if (trim(takeaway)) return [trim(takeaway)];
    return ['Keep each check separate and require evidence before marking a payment complete.'];
  }

  /* Evidence builders. Rule 17 triggers, rule 18 vocabulary: only
     message codes, domain, failure category, derived amount and
     currency, generic parties, and the words SAMPLE and NOT STATED.
     Sequence markers (T+0, Step 1), never clock times. */
  function evidenceId(prefix, suffix) {
    return 'ev-' + prefix + '-' + str(suffix).replace(/[^A-Za-z0-9]+/g, '').toLowerCase();
  }
  function makeEvidence(id, kind, title, body, structuredLines, sourceField, index) {
    return {
      id: id, kind: kind, title: title, body: body,
      structuredLines: structuredLines || [], sourceField: sourceField,
      revealedAfterStep: index, completeness: { status: 'complete', reason: '' },
      isRedHerring: false, authored: false
    };
  }
  function messagePurpose(code) {
    if (MESSAGE_PURPOSES[code]) return MESSAGE_PURPOSES[code];
    return 'This message code is named in the case. Its catalogue entry is not in the message explorer on this site.';
  }
  function buildEvidence(ctx) {
    var items = [];
    var index = 0;
    function push(ev) {
      ev.revealedAfterStep = index;
      index += 1;
      items.push(ev);
    }
    var i, step;
    for (i = 0; i < ctx.flowSteps.length; i++) {
      step = ctx.flowSteps[i];
      push(makeEvidence(
        evidenceId('timeline', i), 'timeline', step.title,
        step.note || step.title,
        ['Step ' + (i + 1), step.title].concat(step.note ? [step.note] : []),
        ctx.flowSource, 0));
    }
    for (i = 0; i < ctx.codes.length; i++) {
      var code = ctx.codes[i];
      push(makeEvidence(
        evidenceId('message', code), 'message', code,
        messagePurpose(code) + ' Case instance values below are derived only from the case text; anything the case does not state is marked NOT STATED.',
        ['Message: ' + code,
          'Amount: ' + ctx.header.amountValue,
          'Currency: ' + ctx.header.currencyValue,
          'From: the sending bank',
          'To: the beneficiary bank',
          'Reference: NOT STATED',
          'Note: SAMPLE instance, derived only from the case text.'],
        ctx.codesFromStageMap ? 'messages' : 'explain', 0));
    }
    if (ctx.hasLedger) {
      push(makeEvidence('ev-ledger', 'ledger', 'Ledger record',
        'Double entry record for this payment. The customer leg and the settlement leg must balance; the case states the amount below, and anything else is NOT STATED.',
        ['Customer account: ' + ctx.header.amountValue,
          'Settlement account: ' + ctx.header.amountValue,
          'Balance check: both legs must agree; a difference is a break. Detail: NOT STATED in the case text.'],
        'domain', 0));
    }
    if (ctx.hasRecon) {
      push(makeEvidence('ev-recon', 'recon', 'Reconciliation record',
        'A reconciliation break is a difference between two records that should agree. The case text states the break in the incident report; the record below carries only the derived amount and NOT STATED fields.',
        ['Bank record: amount ' + ctx.header.amountValue,
          'Counterparty record: NOT STATED',
          'Break: see the incident report; amount ' + ctx.header.amountValue],
        'failure_category', 0));
    }
    /* One log item per case. ABH-01 replaces the template with the
       single hand-written log item (see buildCase). */
    var logLines;
    if (ctx.itemId === 'ABH-01') {
      logLines = [
        'T+0 pacs.008 sent to the beneficiary bank. Amount: ' + ctx.header.amountValue + '. (SAMPLE)',
        'T+1 pacs.002 status report never checked. (SAMPLE)',
        'T+2 pacs.028 status request never sent. (SAMPLE)',
        'T+3 pacs.004 return never arrived. (SAMPLE)'
      ];
      var abhLog = makeEvidence('ev-log', 'log', 'Processing log',
        'Hand-written for this case from the case text. Illustrative sequence log (SAMPLE). Sequence numbers only; no clock times.',
        logLines, 'authored', 0);
      abhLog.authored = true;
      push(abhLog);
    } else {
      var firstCode = ctx.codes[0] || '';
      var secondCode = ctx.codes[1] || '';
      logLines = [
        'T+0 Instruction received from the customer. Amount: ' + ctx.header.amountValue + '. (SAMPLE)',
        'T+1 ' + (firstCode ? firstCode + ' sent to the beneficiary bank.' : 'Outbound message sent to the beneficiary bank; no message code is named in the case.') + ' (SAMPLE)',
        'T+2 ' + (secondCode ? secondCode + ' status: see the message evidence.' : 'Status check: no status message is named in the case.') + ' (SAMPLE)',
        'T+3 Case opened for investigation. Reference: NOT STATED. (SAMPLE)'
      ];
      push(makeEvidence('ev-log', 'log', 'Processing log',
        'Illustrative sequence log (SAMPLE). Sequence numbers only; no clock times. Lines use only the message codes named in the case, the derived amount, and generic parties.',
        logLines, 'template', 0));
    }
    if (ctx.hasApi) {
      push(makeEvidence('ev-api', 'api', 'API record',
        'Request and response for the API call named in the case. Acceptance proves the instruction was received; it does not prove the payment posted.',
        ['Request: payment instruction submitted through the API (SAMPLE)',
          'Response: accepted for processing (SAMPLE)',
          'Amount: ' + ctx.header.amountValue,
          'Reference: NOT STATED'],
        'explain', 0));
    }
    if (ctx.hasClearing) {
      push(makeEvidence('ev-clearing', 'clearing', 'Clearing record',
        'Clearing status for this payment. The case text does not state a clearing response; the record below carries only the derived amount and NOT STATED fields.',
        ['Clearing status: NOT STATED in the case text',
          'Amount: ' + ctx.header.amountValue,
          'Settlement: NOT STATED in the case text',
          'Reference: NOT STATED'],
        'explain', 0));
    }
    return items;
  }

  function buildHypotheses(ctx, caseId) {
    var list = [
      { text: 'The team assumed: ' + ctx.flawed, isCorrect: false, source: 'flawed requirement' },
      { text: 'The root cause is: ' + firstSentence(ctx.rootCause), isCorrect: true, source: 'root cause' },
      { text: CATEGORY_ALTERNATIVES[ctx.catKey] || CATEGORY_ALTERNATIVES.default, isCorrect: false, source: 'category alternative' }
    ];
    var shuffled = deterministicShuffle(list, str(caseId));
    return shuffled.map(function (h, i) {
      return { id: 'hyp-' + i, text: h.text, isCorrect: h.isCorrect, source: h.source };
    });
  }

  function shuffledOptions(entries, seedText) {
    var shuffled = deterministicShuffle(entries, seedText);
    var bestIndex = 0;
    shuffled.forEach(function (o, i) { if (o.isBest) bestIndex = i; });
    return { options: shuffled, bestOptionIndex: bestIndex };
  }
  function makeDecision(id, type, prompt, bestText, whyCorrect, consequence, evidenceNote, caseId, decIndex, includeHypothesisPrompt) {
    var entries = [{ text: bestText, isBest: true, feedback: whyCorrect, consequence: '', evidenceNote: evidenceNote }];
    CORRECTIVE_DISTRACTORS.forEach(function (d) {
      entries.push({ text: d, isBest: false, feedback: consequence, consequence: consequence, evidenceNote: evidenceNote });
    });
    var built = shuffledOptions(entries, str(caseId) + ':dec:' + decIndex);
    return {
      id: id, type: type, prompt: prompt, options: built.options,
      bestOptionIndex: built.bestOptionIndex, whyCorrect: whyCorrect,
      wrongTurnCost: 5, evidenceNote: evidenceNote,
      hypothesisPrompt: includeHypothesisPrompt ? 'Does this change your leading hypothesis? You can revise it before the diagnosis.' : '',
      hint: HINT_TEMPLATES[type] || HINT_TEMPLATES.action,
      isTechnical: type === 'message', gatedOn: ''
    };
  }
  function evidenceKindLabel(kind) {
    var labels = { timeline: 'timeline', message: 'message evidence', log: 'processing log',
      ledger: 'ledger record', recon: 'reconciliation record', api: 'API record',
      clearing: 'clearing record', note: 'note' };
    return labels[kind] || kind;
  }
  function buildDecisions(ctx, caseId) {
    var decisions = [];
    var steps = ctx.decisionSteps.slice(0, 4);
    var i;
    if (!steps.length) {
      /* Fallback first decision: options built from the evidence
         types present, timeline first as the best option, padded
         with generic distractors to four options. */
      var kinds = [];
      var seenKinds = {};
      ctx.evidence.forEach(function (ev) {
        if (!seenKinds[ev.kind]) { seenKinds[ev.kind] = true; kinds.push(ev.kind); }
      });
      var entries = [{
        text: 'The timeline: establish what happened, in order.',
        isBest: true,
        feedback: 'The timeline comes first: it fixes the order of events before any single record is interpreted.',
        consequence: '', evidenceNote: 'See the evidence list.'
      }];
      var optionTexts = {
        message: 'The message evidence: see what was sent.',
        log: 'The processing log: see the sequence of events.',
        ledger: 'The ledger record: see what moved.',
        recon: 'The reconciliation record: see what did not agree.',
        api: 'The API record: see the request and response.',
        clearing: 'The clearing record: see the clearing status.'
      };
      kinds.forEach(function (k) {
        if (k === 'timeline' || !optionTexts[k] || entries.length >= 3) return;
        entries.push({ text: optionTexts[k], isBest: false,
          feedback: 'That record helps later; the timeline comes first.',
          consequence: 'Starting elsewhere leaves the order of events unclear.',
          evidenceNote: 'See the evidence list.' });
      });
      var di = 0;
      while (entries.length < 4 && di < CORRECTIVE_DISTRACTORS.length) {
        entries.push({ text: CORRECTIVE_DISTRACTORS[di], isBest: false,
          feedback: 'Starting elsewhere leaves the order of events unclear.',
          consequence: 'Starting elsewhere leaves the order of events unclear.',
          evidenceNote: 'See the evidence list.' });
        di += 1;
      }
      var built = shuffledOptions(entries, str(caseId) + ':dec:0');
      decisions.push({
        id: 'dec-0', type: 'first-check',
        prompt: 'What should the investigator check first?',
        options: built.options, bestOptionIndex: built.bestOptionIndex,
        whyCorrect: 'The timeline comes first: it fixes the order of events before any single record is interpreted.',
        wrongTurnCost: 5, evidenceNote: 'See the evidence list.',
        hypothesisPrompt: 'Does this change your leading hypothesis? You can revise it before the diagnosis.',
        hint: HINT_TEMPLATES['first-check'], isTechnical: false, gatedOn: ''
      });
    } else {
      for (i = 0; i < steps.length; i++) {
        var step = steps[i];
        var stepText = step.title + (step.note ? ' ' + step.note : '');
        var codeInStep = null;
        CODE_PATTERN.lastIndex = 0;
        var cm = CODE_PATTERN.exec(stepText);
        if (cm) codeInStep = normalizeCode(cm[0]);
        var type = codeInStep ? 'message' : 'action';
        var bestText, why, consequence, note;
        if (type === 'message') {
          bestText = 'Open the ' + codeInStep + ' message evidence and compare what was sent with what was expected.';
          why = step.note || ('The ' + codeInStep + ' evidence shows what was actually sent.');
          consequence = 'Without the message evidence, the sent-versus-expected comparison stays undone and the trail goes cold.';
          note = 'See the ' + codeInStep + ' message evidence.';
        } else {
          bestText = 'Investigate this step against the evidence before moving on: ' + step.title;
          why = step.note || firstSentence(ctx.rootCause);
          consequence = 'Moving on without checking leaves the assumption in this step untested.';
          note = 'See the timeline event for this step.';
        }
        var promptHead = step.title;
        if (promptHead.slice(-1) !== '?' && promptHead.slice(-1) !== '.') promptHead += '.';
        decisions.push(makeDecision(
          'dec-' + i, type,
          'Decision point: ' + promptHead + ' What should the investigator do next?',
          bestText, why, consequence, note, caseId, i, true));
      }
    }
    var closingIndex = decisions.length;
    decisions.push(makeDecision(
      'dec-' + closingIndex, 'resolution',
      'What is the right corrective action?',
      ctx.correctiveAction,
      'This is the fix the real requirement in the case states.',
      'The wrong fix leaves the root cause in place.',
      'See the real requirement in the case text.',
      caseId, closingIndex, false));
    return decisions;
  }

  var DIFFICULTIES = {
    rookie: { id: 'rookie', displayName: 'Rookie',
      guidance: 'Guided: evidence reveals in order, with hints before each decision.' },
    professional: { id: 'professional', displayName: 'Professional',
      guidance: 'Independent: all evidence is available, hints only after a wrong pick.' },
    expert: { id: 'expert', displayName: 'Expert',
      guidance: 'One evidence item starts partial until you request its status, and the second decision unlocks only after the first.' }
  };
  function normalizeDifficulty(difficulty) {
    var d = trim(difficulty).toLowerCase();
    if (d === 'rookie' || d === 'professional' || d === 'expert') return d;
    return 'rookie';
  }

  function buildCase(item, difficulty) {
    item = item || {};
    var diff = normalizeDifficulty(difficulty);
    var id = str(item.id || 'unknown');
    var title = trim(item.title) || 'Untitled case';
    var explain = str(item.explain || '');
    var takeaway = trim(item.takeaway);
    var level = trim(item.level);
    var domain = trim(item.domain);
    var failureCategory = trim(item.failure_category);
    var resolution = trim(item.resolution);
    var parsed = parseExplain(explain);
    var catKey = categoryKey(failureCategory);
    var header = paymentHeader(title, explain);
    var severity = severityLabel(level, failureCategory);
    var msgInfo = messageCodes(item, title, explain);
    var codes = msgInfo.codes;
    var codesFromStageMap = Array.isArray(item.messages) && item.messages.length > 0 &&
      item.messages.some(isCodeShaped);
    var visualSteps = visualFlowSteps(item);
    var flowSteps, flowSource;
    if (visualSteps.length) {
      flowSteps = visualSteps;
      flowSource = 'visual.flow.steps';
    } else if (parsed.flowSteps.length) {
      flowSteps = parsed.flowSteps.map(function (line) {
        return { kind: 'step', title: line, note: '' };
      });
      flowSource = 'explain';
    } else {
      flowSteps = [{ kind: 'step', title: title, note: 'The case as stated in the incident report.' }];
      flowSource = 'title';
    }
    /* Decision steps: visual decision steps when present, else
       parsed arrow lines containing a question mark or decided.
       Extra steps beyond four are folded into the timeline, which
       already carries every flow step as an event. */
    var decisionSteps = [];
    var visualDecisions = visualSteps.filter(function (s) { return s.kind === 'decision'; });
    if (visualDecisions.length) {
      decisionSteps = visualDecisions;
    } else {
      parsed.flowSteps.forEach(function (line) {
        if (line.indexOf('?') !== -1 || line.toLowerCase().indexOf('decided') !== -1) {
          decisionSteps.push({ kind: 'decision', title: line, note: '' });
        }
      });
    }
    var realText = realRequirementText(parsed, takeaway);
    var rootCause = rootCauseText(parsed, takeaway, realText);
    var flawed = flawedRequirementText(parsed, catKey);
    var insight = parsed.insight || takeaway;
    var controls = controlsList(parsed, takeaway);
    var correctiveAction = correctiveActionText(parsed, takeaway);
    var opening = parsed.opening.length ? parsed.opening :
      (explain ? [firstSentence(explain)] : [title]);
    var incidentReport = opening.join('\n\n');
    var impactSentence = IMPACT_SENTENCES[catKey] || IMPACT_SENTENCES.default;
    var businessContext;
    if (domain && opening.length) businessContext = domain + '. ' + opening[0];
    else if (opening.length) businessContext = opening[0];
    else if (trim(item.module)) businessContext = 'A payment case in ' + trim(item.module) + '.';
    else businessContext = title;
    var explainLower = explain.toLowerCase();
    var domainLower = domain.toLowerCase();
    var hasLedger = domainLower.indexOf('clearing') !== -1 ||
      domainLower.indexOf('settlement') !== -1 ||
      domainLower.indexOf('reconciliation') !== -1 ||
      /\bledger\b/i.test(explain) || /\bsettlement\b/i.test(explain);
    var hasRecon = failureCategory.toLowerCase().indexOf('reconcil') !== -1 ||
      /\breconcil/i.test(explain);
    var hasApi = /\bAPIs?\b/.test(explain);
    var hasClearing = /\bclearing\b/i.test(explain) ||
      /\b(SEPA|Faster Payments|CHAPS|TARGET2|Fedwire|TIPS|Bacs)\b/.test(explain);
    var ctx = {
      itemId: id, flowSteps: flowSteps, flowSource: flowSource, codes: codes,
      codesFromStageMap: codesFromStageMap, header: header,
      hasLedger: hasLedger, hasRecon: hasRecon, hasApi: hasApi,
      hasClearing: hasClearing, flawed: flawed, rootCause: rootCause,
      catKey: catKey, correctiveAction: correctiveAction,
      decisionSteps: decisionSteps, evidence: []
    };
    var evidence = buildEvidence(ctx);
    ctx.evidence = evidence;
    if (diff === 'expert' && evidence.length) {
      var partialIndex = -1;
      for (var pi = evidence.length - 1; pi >= 0; pi--) {
        if (evidence[pi].kind === 'message') { partialIndex = pi; break; }
      }
      if (partialIndex === -1) partialIndex = evidence.length - 1;
      evidence[partialIndex].completeness = { status: 'partial', reason: EXPERT_PARTIAL_REASON };
    }
    var hypotheses = buildHypotheses(ctx, id);
    var decisions = buildDecisions(ctx, id);
    if (diff === 'expert' && decisions.length > 1) {
      decisions[1].gatedOn = decisions[0].id;
    }
    var supporting = [];
    evidence.forEach(function (ev) {
      if (ev.kind === 'timeline' || ev.kind === 'message') supporting.push(ev.id);
    });
    var lessons = [];
    if (insight && lessons.indexOf(insight) === -1) lessons.push(insight);
    if (takeaway && lessons.indexOf(takeaway) === -1) lessons.push(takeaway);
    if (!lessons.length) lessons.push(correctiveAction);
    var correctHypothesis = null;
    hypotheses.forEach(function (h) { if (h.isCorrect) correctHypothesis = h; });
    return {
      id: id, situationID: id, title: title, severity: severity,
      incidentType: failureCategory || 'Payment exception',
      businessContext: businessContext,
      customerImpact: incidentReport + ' ' + impactSentence,
      impactSentence: impactSentence,
      incidentReport: incidentReport,
      objectives: OBJECTIVES.slice(),
      paymentHeader: header,
      timeline: evidence.filter(function (ev) { return ev.kind === 'timeline'; }),
      evidence: evidence,
      hypotheses: hypotheses,
      decisions: decisions,
      correctDiagnosis: correctHypothesis ? correctHypothesis.text : ('The root cause is: ' + firstSentence(rootCause)),
      supportingEvidenceIDs: supporting,
      correctiveAction: correctiveAction,
      preventiveControls: controls,
      lessons: lessons,
      source: 'derived',
      difficulty: diff,
      flawedRequirement: flawed,
      rootCause: rootCause,
      insight: insight,
      realRequirement: realText,
      closingQuestion: parsed.closingQuestion,
      messages: msgInfo.listed,
      messageCodes: codes,
      failureCategory: failureCategory,
      domain: domain,
      resolution: resolution,
      level: level,
      isFreeSample: SAMPLE_IDS.indexOf(id) !== -1,
      isWeeklyCase: item.week !== undefined && item.week !== null,
      fallbacks: {
        noMessage: codes.length === 0,
        noWhy: !parsed.hasWhy,
        noDecisionStep: decisionSteps.length === 0,
        notStatedAmount: header.amountValue === 'NOT STATED'
      },
      sourceItem: item
    };
  }

  /* Scoring. Dimension rules from the plan: evidence interpretation
     from relevant evidence opened, efficiency from wrong picks with
     the Lab bonus mapping, technical accuracy from message and
     system decisions, root-cause identification from the diagnosis
     pick plus citation, resolution quality from resolution picks.
     Overall is the mean, rounded. */
  function score(run) {
    run = run || {};
    var inv = run.investigation;
    if (!inv || !Array.isArray(inv.decisions) || !Array.isArray(inv.hypotheses)) {
      throw new Error('score requires a run with an investigation built by buildCase');
    }
    var opened = run.openedEvidenceIds || [];
    var cited = run.citedEvidenceIds || [];
    var supporting = inv.supportingEvidenceIDs || [];
    var relevantMap = {};
    supporting.forEach(function (id) { relevantMap[id] = true; });
    cited.forEach(function (id) { relevantMap[id] = true; });
    var relevantIds = Object.keys(relevantMap);
    var openedSet = {};
    opened.forEach(function (id) { openedSet[id] = true; });
    var relevantOpened = 0;
    relevantIds.forEach(function (id) { if (openedSet[id]) relevantOpened += 1; });
    var evidenceInterpretation = relevantIds.length ?
      Math.round(100 * relevantOpened / relevantIds.length) : 100;
    var picks = {};
    (run.decisionPicks || []).forEach(function (p) {
      if (p) picks[p.decisionId] = p.pickedIndex;
    });
    var results = run.decisionResults || null;
    var decisionsCorrect = 0;
    var decisionsTotal = inv.decisions.length;
    var technicalCorrect = 0;
    var technicalTotal = 0;
    var resolutionResults = run.resolutionResults || null;
    var closingCorrect = null;
    inv.decisions.forEach(function (d) {
      var correct;
      if (results) {
        var found = null;
        results.forEach(function (r) { if (r && r.decisionId === d.id) found = r; });
        correct = !!(found && found.correct);
      } else {
        correct = picks[d.id] === d.bestOptionIndex;
      }
      if (correct) decisionsCorrect += 1;
      if (d.isTechnical) {
        technicalTotal += 1;
        if (correct) technicalCorrect += 1;
      }
      if (d.type === 'resolution') closingCorrect = correct;
    });
    var wrongPicks = decisionsTotal - decisionsCorrect;
    var redHerringPicks = run.redHerringPicks || 0;
    var efficiency;
    if (wrongPicks === 0) efficiency = 100;
    else if (wrongPicks === 1) efficiency = Math.max(0, 90 - 10 * redHerringPicks);
    else efficiency = Math.max(0, 100 - 5 * wrongPicks - 10 * redHerringPicks);
    var technicalAccuracy = technicalTotal ?
      Math.round(100 * technicalCorrect / technicalTotal) : 100;
    var diagnosis = null;
    inv.hypotheses.forEach(function (h) {
      if (h.id === run.diagnosisHypothesisId) diagnosis = h;
    });
    var diagnosisCorrect = !!(diagnosis && diagnosis.isCorrect);
    var citedSet = {};
    cited.forEach(function (id) { citedSet[id] = true; });
    var citedSupports = supporting.some(function (id) { return !!citedSet[id]; });
    var rootCauseIdentification = 0;
    if (diagnosisCorrect && citedSupports) rootCauseIdentification = 100;
    else if (diagnosisCorrect) rootCauseIdentification = 50;
    var resolutionQuality;
    if (resolutionResults && resolutionResults.length) {
      var resCorrect = 0;
      resolutionResults.forEach(function (r) { if (r && r.correct) resCorrect += 1; });
      resolutionQuality = Math.round(100 * resCorrect / resolutionResults.length);
    } else if (closingCorrect !== null) {
      resolutionQuality = closingCorrect ? 100 : 0;
    } else {
      resolutionQuality = 100;
    }
    var overall = Math.round((evidenceInterpretation + efficiency +
      technicalAccuracy + rootCauseIdentification + resolutionQuality) / 5);
    var incorrectAssumptions = [];
    (run.hypothesisRevisions || []).forEach(function (rev) {
      if (rev && !rev.isCorrect && rev.text && incorrectAssumptions.indexOf(rev.text) === -1) {
        incorrectAssumptions.push(rev.text);
      }
    });
    if (diagnosis && !diagnosis.isCorrect && incorrectAssumptions.indexOf(diagnosis.text) === -1) {
      incorrectAssumptions.push(diagnosis.text);
    }
    return {
      caseID: inv.id, situationID: inv.situationID, difficulty: inv.difficulty,
      completedAt: new Date().toISOString(),
      dimensionScores: {
        evidenceInterpretation: evidenceInterpretation,
        efficiency: efficiency,
        technicalAccuracy: technicalAccuracy,
        rootCauseIdentification: rootCauseIdentification,
        resolutionQuality: resolutionQuality,
        overall: overall
      },
      incorrectAssumptions: incorrectAssumptions,
      citedEvidenceIDs: cited.slice(),
      wrongPicks: wrongPicks,
      evidenceOpenedCount: opened.length,
      decisionsCorrect: decisionsCorrect,
      decisionsTotal: decisionsTotal
    };
  }

  /* ============== Rendering (DOM only, guarded) ============== */

  function doc() {
    return (typeof global.document !== 'undefined') ? global.document : null;
  }
  function loadStore() {
    try {
      var raw = global.localStorage ? global.localStorage.getItem(STORAGE_KEY) : null;
      var parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object' && parsed.results) return parsed;
    } catch (e) { /* storage unavailable: results stay in memory only */ }
    return { version: 1, results: {} };
  }
  function saveResult(investigation, report) {
    try {
      if (!global.localStorage) return;
      var store = loadStore();
      var prev = store.results[investigation.id] || { completions: 0, bestOverall: 0 };
      store.results[investigation.id] = {
        caseID: investigation.id, situationID: investigation.situationID,
        difficulty: investigation.difficulty,
        bestOverall: Math.max(prev.bestOverall || 0, report.dimensionScores.overall),
        completions: (prev.completions || 0) + 1,
        lastCompletedAt: report.completedAt,
        lastReport: report
      };
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) { /* storage unavailable */ }
  }
  function hasAccess() {
    try {
      if (typeof global.paHasSituationsAccess === 'function') {
        return !!global.paHasSituationsAccess();
      }
    } catch (e) { /* fail closed */ }
    return false;
  }
  function severityClass(severity) {
    if (severity === 'High') return 'is-high';
    if (severity === 'Medium') return 'is-medium';
    return 'is-moderate';
  }
  var STEP_LABELS = [
    ['briefing', 'Briefing'], ['evidence', 'Evidence'], ['hypotheses', 'Hypotheses'],
    ['decisions', 'Decisions'], ['diagnosis', 'Diagnosis'], ['report', 'Report']
  ];

  function renderInto(container, investigation, callbacks) {
    var d = doc();
    if (!d) return false;
    if (typeof container === 'string') container = d.querySelector(container);
    if (!container || !investigation) return false;
    callbacks = callbacks || {};
    /* Gating: free samples and the weekly case always render. Any
       other case renders only when the existing browser check
       passes; otherwise the locked pattern shows zero case text. */
    var isFree = !!(investigation.isFreeSample || investigation.isWeeklyCase);
    if (!isFree && !hasAccess()) {
      var wall = d.getElementById('sit-paywall');
      if (wall) wall.style.display = 'block';
      container.innerHTML =
        '<div class="pf-card inv-locked"><h2 class="inv-locked-title">This case is locked</h2>' +
        '<p>Payment Situations is a paid product. Cases open in full once you have access.</p>' +
        '<p><a class="pf-btn-primary" href="payment.html">How to buy</a> ' +
        '<button type="button" class="pf-btn-secondary" data-action="inv-exit">Back to case</button></p></div>';
      bindLockedExit(container, callbacks);
      return false;
    }
    var state = {
      step: 'briefing', reached: 0, investigation: investigation,
      difficulty: investigation.difficulty || 'rookie',
      opened: {}, selectedEvidenceId: '', statusRequested: false,
      leadingId: '', revisions: [], answers: {}, decisionIndex: 0,
      diagnosisId: '', cited: {}, diagnosisError: '',
      report: null, persisted: false, started: false
    };
    if (state.investigation.evidence.length) {
      state.selectedEvidenceId = state.investigation.evidence[0].id;
    }
    function stepIndex(name) {
      for (var i = 0; i < STEP_LABELS.length; i++) {
        if (STEP_LABELS[i][0] === name) return i;
      }
      return 0;
    }
    function gotoStep(name) {
      state.step = name;
      state.reached = Math.max(state.reached, stepIndex(name));
      render();
    }
    function stepsNav() {
      var h = '<div class="inv-steps" role="navigation" aria-label="Investigation steps">';
      STEP_LABELS.forEach(function (pair, i) {
        var cls = 'inv-step' + (pair[0] === state.step ? ' is-current' : '') +
          (i <= state.reached ? ' is-reached' : '');
        var disabled = i > state.reached ? ' disabled' : '';
        h += '<button type="button" class="' + cls + '" data-action="inv-goto" data-step="' +
          pair[0] + '"' + disabled + '>' + escapeHtml(pair[1]) + '</button>';
      });
      return h + '</div>';
    }
    function headerBand() {
      var inv = state.investigation;
      return '<div class="inv-header"><p class="sit-eyebrow inv-header-eyebrow">Investigation</p>' +
        '<h2 class="inv-header-title">' + escapeHtml(inv.title) + '</h2>' +
        '<p class="inv-header-pills"><span class="pf-pill inv-severity ' + severityClass(inv.severity) +
        '">Severity: ' + escapeHtml(inv.severity) + '</span> ' +
        '<span class="pf-pill">' + escapeHtml(inv.incidentType) + '</span> ' +
        (inv.level ? '<span class="pf-pill accent-gold">' + escapeHtml(inv.level) + '</span> ' : '') +
        '<span class="pf-pill accent-navy">' + escapeHtml(DIFFICULTIES[state.difficulty].displayName) + '</span></p>' +
        '<p class="inv-header-note">Severity is derived from the case level and failure category.</p></div>';
    }
    function actionsBar(inner) {
      return '<div class="inv-actions">' + inner +
        '<button type="button" class="pf-btn-secondary" data-action="inv-exit">Back to case</button></div>';
    }
    function renderBriefing() {
      var inv = state.investigation;
      var h = headerBand() + stepsNav();
      h += '<div class="pf-card inv-briefing"><h3>Incident briefing</h3>';
      h += '<p class="sit-case-label">Business context</p><p>' + escapeHtml(inv.businessContext) + '</p>';
      h += '<p class="sit-case-label">Initial incident report</p>';
      inv.incidentReport.split('\n\n').forEach(function (p) {
        if (trim(p)) h += '<p>' + escapeHtml(p) + '</p>';
      });
      h += '<p class="sit-case-label">Customer impact</p><p>' + escapeHtml(inv.impactSentence) + '</p>';
      h += '<p class="sit-case-label">Payment header</p>';
      h += '<table class="inv-pay-table"><tbody>' +
        '<tr><th>Amount</th><td>' + escapeHtml(inv.paymentHeader.amountText) + '</td></tr>' +
        '<tr><th>Currency</th><td>' + escapeHtml(inv.paymentHeader.currencyText) + '</td></tr>' +
        '<tr><th>Parties</th><td>' + escapeHtml(inv.paymentHeader.partiesText) + '</td></tr>' +
        '<tr><th>Reference</th><td>' + escapeHtml(inv.paymentHeader.referenceText) + '</td></tr>' +
        '</tbody></table>';
      h += '<p class="sit-case-label">Investigation objectives</p><ol class="inv-objectives">';
      inv.objectives.forEach(function (o) { h += '<li>' + escapeHtml(o) + '</li>'; });
      h += '</ol>';
      h += '<p class="sit-case-label">Difficulty</p><div class="inv-difficulty">';
      ['rookie', 'professional', 'expert'].forEach(function (key) {
        var diff = DIFFICULTIES[key];
        var sel = key === state.difficulty ? ' is-selected' : '';
        h += '<button type="button" class="inv-difficulty-card' + sel + '" data-action="inv-difficulty" data-value="' +
          key + '" aria-pressed="' + (key === state.difficulty) + '"><strong>' +
          escapeHtml(diff.displayName) + '</strong><span>' + escapeHtml(diff.guidance) + '</span></button>';
      });
      h += '</div></div>';
      h += actionsBar('<button type="button" class="pf-btn-primary" data-action="inv-start">Start the investigation</button>');
      return h;
    }
    function evidenceAvailable(ev, index) {
      if (state.difficulty !== 'rookie') return true;
      if (index === 0) return true;
      var prev = state.investigation.evidence[index - 1];
      return !!(prev && state.opened[prev.id]);
    }
    function renderEvidence() {
      var inv = state.investigation;
      var h = headerBand() + stepsNav();
      var openedCount = Object.keys(state.opened).length;
      h += '<div class="pf-card inv-evidence-card"><h3>Evidence workspace</h3>' +
        '<p class="inv-note">Evidence opened: ' + openedCount + ' of ' + inv.evidence.length +
        '. Choose what to inspect' + (state.difficulty === 'rookie' ? ', in order' : ', in any order') + '.</p>';
      h += '<div class="inv-workspace"><div class="inv-evidence-list" role="listbox" aria-label="Evidence">';
      inv.evidence.forEach(function (ev, i) {
        var avail = evidenceAvailable(ev, i);
        var cls = 'inv-evidence-item' + (ev.id === state.selectedEvidenceId ? ' is-selected' : '') +
          (state.opened[ev.id] ? ' is-opened' : '') + (!avail ? ' is-locked' : '') +
          (ev.completeness.status === 'partial' ? ' is-partial' : '');
        h += '<button type="button" class="' + cls + '" data-action="inv-evidence" data-id="' +
          escapeHtml(ev.id) + '"' + (avail ? '' : ' disabled') + '>' +
          '<span class="inv-evidence-kind">' + escapeHtml(ev.kind) + '</span>' +
          '<span class="inv-evidence-title">' + escapeHtml(ev.title) + '</span>' +
          (ev.completeness.status === 'partial' ? '<span class="inv-evidence-flag">Partial</span>' : '') +
          '</button>';
      });
      h += '</div><div class="inv-evidence-detail">';
      var selected = null;
      inv.evidence.forEach(function (ev) { if (ev.id === state.selectedEvidenceId) selected = ev; });
      if (!selected && inv.evidence.length) selected = inv.evidence[0];
      if (selected) h += renderEvidenceDetail(selected);
      h += '</div></div></div>';
      h += actionsBar('<button type="button" class="pf-btn-primary" data-action="inv-next">Continue to hypotheses</button>');
      return h;
    }
    function renderEvidenceDetail(ev) {
      var h = '<h4>' + escapeHtml(ev.title) + '</h4>';
      h += '<p><span class="pf-pill">' + escapeHtml(ev.kind) + '</span>' +
        (ev.authored ? ' <span class="pf-pill accent-gold">Hand-written for this case</span>' : '') + '</p>';
      if (ev.completeness.status === 'partial' && !state.statusRequested) {
        h += '<p class="inv-partial-note">This evidence is partial: ' +
          escapeHtml(ev.completeness.reason) + '.</p>' +
          '<p><button type="button" class="pf-btn-gold" data-action="inv-request-status">Request status</button></p>' +
          '<p class="inv-note">Requesting the status is recorded as an investigation action. It is not scored as a decision.</p>';
        return h;
      }
      h += '<p>' + escapeHtml(ev.body) + '</p>';
      if (ev.kind === 'log') {
        h += '<div class="inv-mono">' + ev.structuredLines.map(function (l) {
          return escapeHtml(l);
        }).join('<br>') + '</div>';
      } else if (ev.kind === 'message') {
        h += '<table class="inv-field-table"><tbody>' + ev.structuredLines.map(function (l) {
          var parts = l.split(': ');
          return '<tr><th>' + escapeHtml(parts[0]) + '</th><td>' + escapeHtml(parts.slice(1).join(': ')) + '</td></tr>';
        }).join('') + '</tbody></table>';
        h += '<p><a class="pf-btn-secondary" href="explorer.html">Open in the message explorer</a></p>';
      } else if (ev.structuredLines.length) {
        h += '<ul class="inv-structured">' + ev.structuredLines.map(function (l) {
          return '<li>' + escapeHtml(l) + '</li>';
        }).join('') + '</ul>';
      }
      if (ev.kind === 'api') {
        h += '<p class="inv-note">Acceptance proves the instruction was received; it does not prove the payment posted.</p>';
      }
      return h;
    }
    function hypothesisLabel(hyp, index) {
      if (state.difficulty !== 'rookie') return '';
      var supportingOpened = state.investigation.supportingEvidenceIDs.some(function (id) {
        return !!state.opened[id];
      });
      if (hyp.isCorrect) return supportingOpened ? 'Most likely' : 'Possible';
      var incorrectBefore = 0;
      for (var i = 0; i < index; i++) {
        if (!state.investigation.hypotheses[i].isCorrect) incorrectBefore += 1;
      }
      return incorrectBefore === 0 ? 'Possible' : 'Unlikely';
    }
    function renderHypotheses() {
      var inv = state.investigation;
      var h = headerBand() + stepsNav();
      h += '<div class="pf-card"><h3>Hypotheses</h3>' +
        '<p class="inv-note">Pick a leading hypothesis. You can revise it at any time before the diagnosis; revisions are recorded for the report.</p>';
      inv.hypotheses.forEach(function (hyp, i) {
        var label = hypothesisLabel(hyp, i);
        var sel = hyp.id === state.leadingId ? ' is-selected' : '';
        h += '<button type="button" class="inv-hypothesis' + sel + '" data-action="inv-hypothesis" data-id="' +
          escapeHtml(hyp.id) + '" aria-pressed="' + (hyp.id === state.leadingId) + '">' +
          '<span class="inv-hypothesis-text">' + escapeHtml(hyp.text) + '</span>' +
          (label ? '<span class="pf-pill inv-confidence">' + escapeHtml(label) + '</span>' : '') +
          '</button>';
      });
      h += '</div>';
      var nextDisabled = state.leadingId ? '' : ' disabled';
      h += actionsBar('<button type="button" class="pf-btn-primary" data-action="inv-next"' + nextDisabled + '>Continue to decisions</button>');
      return h;
    }
    function renderDecisions() {
      var inv = state.investigation;
      var dec = inv.decisions[state.decisionIndex];
      var h = headerBand() + stepsNav();
      h += '<div class="pf-card inv-decision-card"><h3>Decision ' + (state.decisionIndex + 1) +
        ' of ' + inv.decisions.length + '</h3>';
      h += '<p class="inv-decision-prompt">' + escapeHtml(dec.prompt) + '</p>';
      if (dec.gatedOn) {
        h += '<p class="inv-note">This decision unlocks after the first decision is answered.</p>';
      }
      var answered = state.answers[dec.id] !== undefined;
      var pickedIndex = state.answers[dec.id];
      var showHint = false;
      if (state.difficulty === 'rookie') showHint = true;
      else if (state.difficulty === 'professional' && answered && pickedIndex !== dec.bestOptionIndex) showHint = true;
      if (showHint) h += '<p class="inv-hint">Hint: ' + escapeHtml(dec.hint) + '</p>';
      dec.options.forEach(function (opt, i) {
        var cls = 'inv-option';
        if (answered) {
          if (i === dec.bestOptionIndex) cls += ' is-correct';
          if (i === pickedIndex && i !== dec.bestOptionIndex) cls += ' is-wrong';
          if (i === pickedIndex) cls += ' is-picked';
        }
        h += '<button type="button" class="' + cls + '" data-action="inv-decision-pick" data-index="' +
          i + '"' + (answered ? ' disabled' : '') + '>' + escapeHtml(opt.text) + '</button>';
      });
      if (answered) {
        var picked = dec.options[pickedIndex];
        var correct = pickedIndex === dec.bestOptionIndex;
        h += '<div class="inv-feedback' + (correct ? ' is-correct' : ' is-wrong') + '">';
        h += '<p><strong>' + (correct ? 'Correct.' : 'Not the best pick. Efficiency minus 5.') + '</strong> ' +
          escapeHtml(picked.feedback) + '</p>';
        if (!correct) h += '<p>' + escapeHtml(dec.whyCorrect) + '</p>';
        h += '<p class="inv-note">' + escapeHtml(dec.evidenceNote) + '</p></div>';
        if (dec.hypothesisPrompt) {
          h += '<p><button type="button" class="pf-btn-secondary" data-action="inv-reconsider">Reconsider leading hypothesis</button></p>';
        }
      }
      h += '</div>';
      var isLast = state.decisionIndex >= inv.decisions.length - 1;
      var nextLabel = isLast ? 'Continue to diagnosis' : 'Next decision';
      var nextDisabled = answered ? '' : ' disabled';
      h += actionsBar('<button type="button" class="pf-btn-primary" data-action="inv-decision-next"' + nextDisabled + '>' + nextLabel + '</button>');
      return h;
    }
    function renderDiagnosis() {
      var inv = state.investigation;
      var h = headerBand() + stepsNav();
      h += '<div class="pf-card"><h3>Diagnosis</h3>';
      h += '<p class="inv-note">Pick the root cause from the hypothesis set and cite at least one evidence item you opened as support.' +
        (state.difficulty === 'rookie' ? ' Cite timeline or message evidence: the timeline fixes what happened, and the message evidence shows what was sent.' : '') + '</p>';
      inv.hypotheses.forEach(function (hyp) {
        var sel = hyp.id === state.diagnosisId ? ' is-selected' : '';
        h += '<button type="button" class="inv-hypothesis' + sel + '" data-action="inv-diagnosis-pick" data-id="' +
          escapeHtml(hyp.id) + '" aria-pressed="' + (hyp.id === state.diagnosisId) + '">' +
          '<span class="inv-hypothesis-text">' + escapeHtml(hyp.text) + '</span></button>';
      });
      var openedItems = inv.evidence.filter(function (ev) { return !!state.opened[ev.id]; });
      h += '<p class="sit-case-label">Cite supporting evidence</p>';
      if (!openedItems.length) {
        h += '<p class="inv-note">No evidence opened yet. Open evidence first, then cite it here.</p>' +
          '<p><button type="button" class="pf-btn-secondary" data-action="inv-goto" data-step="evidence">Back to evidence</button></p>';
      } else {
        openedItems.forEach(function (ev) {
          var checked = state.cited[ev.id] ? ' checked' : '';
          h += '<label class="inv-cite"><input type="checkbox" data-cite="' + escapeHtml(ev.id) + '"' +
            checked + '> <span><strong>' + escapeHtml(ev.title) + '</strong> (' + escapeHtml(ev.kind) + ')</span></label>';
        });
      }
      if (state.diagnosisError) h += '<p class="inv-error">' + escapeHtml(state.diagnosisError) + '</p>';
      h += '</div>';
      h += actionsBar('<button type="button" class="pf-btn-primary" data-action="inv-submit-diagnosis">Submit diagnosis and see the report</button>');
      return h;
    }
    function scoreBar(label, value) {
      return '<div class="inv-score-row"><span class="inv-score-label">' + escapeHtml(label) +
        '</span><span class="inv-score-bar"><span class="inv-score-fill" style="width:' +
        Math.max(0, Math.min(100, value)) + '%"></span></span><span class="inv-score-value">' + value + '</span></div>';
    }
    function renderReport() {
      var inv = state.investigation;
      var rep = state.report;
      var dims = rep.dimensionScores;
      var h = headerBand() + stepsNav();
      h += '<div class="pf-card inv-report"><h3>Investigation report</h3>';
      h += '<div class="inv-report-section"><h4>Incident summary</h4><p>' + escapeHtml(inv.businessContext) + '</p></div>';
      h += '<div class="inv-report-section"><h4>Correct root cause</h4><p>' + escapeHtml(inv.correctDiagnosis) + '</p></div>';
      h += '<div class="inv-report-section"><h4>Evidence supporting the diagnosis</h4>';
      if (rep.citedEvidenceIDs.length) {
        h += '<ul>' + rep.citedEvidenceIDs.map(function (id) {
          var found = null;
          inv.evidence.forEach(function (ev) { if (ev.id === id) found = ev; });
          return '<li>' + escapeHtml(found ? found.title + ' (' + found.kind + ')' : id) + '</li>';
        }).join('') + '</ul>';
      } else {
        h += '<p>None cited.</p>';
      }
      h += '</div>';
      h += '<div class="inv-report-section"><h4>Incorrect assumptions made</h4>';
      if (rep.incorrectAssumptions.length) {
        h += '<ul>' + rep.incorrectAssumptions.map(function (t) {
          return '<li>' + escapeHtml(t) + '</li>';
        }).join('') + '</ul>';
      } else {
        h += '<p>None recorded.</p>';
      }
      h += '</div>';
      h += '<div class="inv-report-section"><h4>Corrective action</h4><p>' + escapeHtml(inv.correctiveAction) + '</p></div>';
      h += '<div class="inv-report-section"><h4>Customer and operational impact</h4><p>' + escapeHtml(inv.customerImpact) + '</p></div>';
      h += '<div class="inv-report-section"><h4>Preventive controls</h4><ul>' +
        inv.preventiveControls.map(function (c) { return '<li>' + escapeHtml(c) + '</li>'; }).join('') + '</ul></div>';
      h += '<div class="inv-report-section"><h4>Technical and architectural lessons</h4><ul>' +
        inv.lessons.map(function (l) { return '<li>' + escapeHtml(l) + '</li>'; }).join('') + '</ul></div>';
      if (inv.closingQuestion) {
        h += '<div class="inv-report-section inv-reflection"><h4>Reflection</h4><p>' + escapeHtml(inv.closingQuestion) + '</p></div>';
      }
      h += '<div class="inv-report-section"><h4>Overall investigation score: ' + dims.overall + ' out of 100</h4>';
      h += scoreBar('Evidence interpretation', dims.evidenceInterpretation);
      h += scoreBar('Efficiency', dims.efficiency);
      h += scoreBar('Technical accuracy', dims.technicalAccuracy);
      h += scoreBar('Root-cause identification', dims.rootCauseIdentification);
      h += scoreBar('Resolution quality', dims.resolutionQuality);
      h += '<p class="inv-note">Decisions correct: ' + rep.decisionsCorrect + ' of ' + rep.decisionsTotal +
        '. Wrong picks: ' + rep.wrongPicks + '. Evidence opened: ' + rep.evidenceOpenedCount + '.</p></div>';
      h += '</div>';
      h += actionsBar('<button type="button" class="pf-btn-gold" data-action="inv-again">Investigate again</button>');
      return h;
    }
    function render() {
      var html = '';
      if (state.step === 'briefing') html = renderBriefing();
      else if (state.step === 'evidence') html = renderEvidence();
      else if (state.step === 'hypotheses') html = renderHypotheses();
      else if (state.step === 'decisions') html = renderDecisions();
      else if (state.step === 'diagnosis') html = renderDiagnosis();
      else if (state.step === 'report') html = renderReport();
      container.innerHTML = '<div class="inv-shell">' + html + '</div>';
    }
    function finishDiagnosis() {
      var citedIds = Object.keys(state.cited).filter(function (id) { return !!state.cited[id]; });
      if (!state.diagnosisId) {
        state.diagnosisError = 'Pick the root cause before submitting the diagnosis.';
        render();
        return;
      }
      if (!citedIds.length) {
        state.diagnosisError = 'Cite at least one evidence item you opened. A diagnosis without cited evidence is not scored as a guess.';
        render();
        return;
      }
      var inv = state.investigation;
      var run = {
        investigation: inv,
        openedEvidenceIds: Object.keys(state.opened),
        citedEvidenceIds: citedIds,
        diagnosisHypothesisId: state.diagnosisId,
        decisionPicks: inv.decisions.map(function (d) {
          return { decisionId: d.id, pickedIndex: state.answers[d.id] };
        }),
        hypothesisRevisions: state.revisions,
        redHerringPicks: 0,
        statusRequested: state.statusRequested
      };
      state.report = score(run);
      if (!state.persisted) {
        saveResult(inv, state.report);
        state.persisted = true;
      }
      if (typeof callbacks.onComplete === 'function') {
        try { callbacks.onComplete(state.report); } catch (e) { /* callback errors stay local */ }
      }
      gotoStep('report');
    }
    function onClick(event) {
      var target = event.target && event.target.closest ? event.target.closest('[data-action]') : null;
      if (!target || !container.contains(target)) return;
      var action = target.getAttribute('data-action');
      if (action === 'inv-exit') {
        if (typeof callbacks.onExit === 'function') {
          try { callbacks.onExit(); } catch (e) { /* callback errors stay local */ }
        }
        return;
      }
      if (action === 'inv-difficulty') {
        var diff = target.getAttribute('data-value') || 'rookie';
        if (diff !== state.difficulty && !state.started) {
          state.difficulty = diff;
          state.investigation = buildCase(state.investigation.sourceItem, diff);
          state.opened = {};
          state.statusRequested = false;
          state.selectedEvidenceId = state.investigation.evidence.length ?
            state.investigation.evidence[0].id : '';
        }
        render();
        return;
      }
      if (action === 'inv-start') {
        state.started = true;
        gotoStep('evidence');
        return;
      }
      if (action === 'inv-goto') {
        var step = target.getAttribute('data-step') || 'briefing';
        if (stepIndex(step) <= state.reached) gotoStep(step);
        return;
      }
      if (action === 'inv-next') {
        var order = ['briefing', 'evidence', 'hypotheses', 'decisions', 'diagnosis', 'report'];
        var next = order[Math.min(order.length - 1, stepIndex(state.step) + 1)];
        gotoStep(next);
        return;
      }
      if (action === 'inv-evidence') {
        var evId = target.getAttribute('data-id') || '';
        state.selectedEvidenceId = evId;
        var ev = null;
        state.investigation.evidence.forEach(function (e) { if (e.id === evId) ev = e; });
        if (ev && !(ev.completeness.status === 'partial' && !state.statusRequested)) {
          state.opened[evId] = true;
        }
        render();
        return;
      }
      if (action === 'inv-request-status') {
        state.statusRequested = true;
        if (state.selectedEvidenceId) state.opened[state.selectedEvidenceId] = true;
        render();
        return;
      }
      if (action === 'inv-hypothesis') {
        var hypId = target.getAttribute('data-id') || '';
        if (state.leadingId && state.leadingId !== hypId) {
          var prev = null;
          state.investigation.hypotheses.forEach(function (hp) { if (hp.id === state.leadingId) prev = hp; });
          if (prev) state.revisions.push({ hypothesisId: prev.id, text: prev.text, isCorrect: prev.isCorrect });
        }
        state.leadingId = hypId;
        render();
        return;
      }
      if (action === 'inv-reconsider') {
        gotoStep('hypotheses');
        return;
      }
      if (action === 'inv-decision-pick') {
        var dec = state.investigation.decisions[state.decisionIndex];
        if (dec && state.answers[dec.id] === undefined) {
          state.answers[dec.id] = parseInt(target.getAttribute('data-index') || '0', 10);
          render();
        }
        return;
      }
      if (action === 'inv-decision-next') {
        if (state.decisionIndex < state.investigation.decisions.length - 1) {
          state.decisionIndex += 1;
          render();
        } else {
          gotoStep('diagnosis');
        }
        return;
      }
      if (action === 'inv-diagnosis-pick') {
        state.diagnosisId = target.getAttribute('data-id') || '';
        state.diagnosisError = '';
        render();
        return;
      }
      if (action === 'inv-submit-diagnosis') {
        finishDiagnosis();
        return;
      }
      if (action === 'inv-again') {
        state.investigation = buildCase(state.investigation.sourceItem, state.difficulty);
        state.step = 'briefing';
        state.reached = 0;
        state.opened = {};
        state.statusRequested = false;
        state.leadingId = '';
        state.revisions = [];
        state.answers = {};
        state.decisionIndex = 0;
        state.diagnosisId = '';
        state.cited = {};
        state.diagnosisError = '';
        state.report = null;
        state.persisted = false;
        state.started = false;
        state.selectedEvidenceId = state.investigation.evidence.length ?
          state.investigation.evidence[0].id : '';
        render();
        return;
      }
    }
    function onChange(event) {
      var target = event.target;
      if (!target || !target.getAttribute) return;
      var citeId = target.getAttribute('data-cite');
      if (citeId) {
        state.cited[citeId] = !!target.checked;
        state.diagnosisError = '';
      }
    }
    if (container._pfInvClick) container.removeEventListener('click', container._pfInvClick);
    if (container._pfInvChange) container.removeEventListener('change', container._pfInvChange);
    container._pfInvClick = onClick;
    container._pfInvChange = onChange;
    container.addEventListener('click', onClick);
    container.addEventListener('change', onChange);
    render();
    return true;
  }
  function bindLockedExit(container, callbacks) {
    function onClick(event) {
      var target = event.target && event.target.closest ? event.target.closest('[data-action="inv-exit"]') : null;
      if (target && typeof callbacks.onExit === 'function') {
        try { callbacks.onExit(); } catch (e) { /* callback errors stay local */ }
      }
    }
    if (container._pfInvClick) container.removeEventListener('click', container._pfInvClick);
    container._pfInvClick = onClick;
    container.addEventListener('click', onClick);
  }

  /* ============== Button injection (guarded, no-op when absent) ============== */

  function findItem(kind, id) {
    var list = kind === 'weekly' ? global.PA_WEEKLY_CASES : global.PA_SITUATIONS;
    if (!Array.isArray(list)) return null;
    for (var i = 0; i < list.length; i++) {
      if (str(list[i] && list[i].id) === str(id)) return list[i];
    }
    return null;
  }
  function openInvestigation(root, kind, id) {
    var d = doc();
    if (!d || !root) return;
    var item = findItem(kind, id);
    if (!item) return;
    var savedHtml = root.innerHTML;
    var savedScroll = null;
    try { savedScroll = global.scrollY || 0; } catch (e) { savedScroll = null; }
    function onExit() {
      if (kind === 'situations' && typeof global.paSitRender === 'function') {
        try { global.paSitRender(); } catch (e) { root.innerHTML = savedHtml; }
      } else {
        root.innerHTML = savedHtml;
        if (global.PFSituations && typeof global.PFSituations.renderAll === 'function') {
          try { global.PFSituations.renderAll(root); } catch (e) { /* restore already done */ }
        }
      }
      if (savedScroll !== null && typeof global.scrollTo === 'function') {
        try { global.scrollTo(0, savedScroll); } catch (e) { /* scroll restore is best effort */ }
      }
      scanContainer(root, kind);
    }
    var investigation = buildCase(item, 'rookie');
    renderInto(root, investigation, { onExit: onExit });
  }
  function scanContainer(root, kind) {
    if (!root || typeof root.querySelectorAll !== 'function') return;
    var d = doc();
    if (!d) return;
    var nodes = root.querySelectorAll('.sit-item[data-sit-item]');
    Array.prototype.forEach.call(nodes, function (node) {
      var id = node.getAttribute('data-sit-item');
      if (!id || node.querySelector('[data-inv-button]')) return;
      var btn = d.createElement('button');
      btn.type = 'button';
      btn.className = 'pf-btn-primary inv-entry-btn';
      btn.setAttribute('data-inv-button', id);
      btn.textContent = 'Investigate this case';
      btn.addEventListener('click', function () { openInvestigation(root, kind, id); });
      node.appendChild(btn);
    });
  }
  function initInvestigationButtons() {
    var d = doc();
    if (!d) return;
    var roots = [];
    var pane = d.getElementById('sit-content');
    if (pane) roots.push({ root: pane, kind: 'situations' });
    var weekly = d.querySelector('[data-weekly-case]');
    if (weekly) roots.push({ root: weekly, kind: 'weekly' });
    if (!roots.length) return;
    roots.forEach(function (entry) { scanContainer(entry.root, entry.kind); });
    if (typeof global.MutationObserver === 'function') {
      roots.forEach(function (entry) {
        var observer = new global.MutationObserver(function () {
          scanContainer(entry.root, entry.kind);
        });
        observer.observe(entry.root, { childList: true, subtree: true });
      });
    }
  }
  if (typeof global.document !== 'undefined') {
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', initInvestigationButtons);
    } else {
      initInvestigationButtons();
    }
  }

  /* ================= Export ================= */

  var api = {
    buildCase: buildCase,
    score: score,
    difficulties: DIFFICULTIES,
    renderInto: renderInto,
    SAMPLE_IDS: SAMPLE_IDS,
    STORAGE_KEY: STORAGE_KEY
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.PFInvestigation = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
