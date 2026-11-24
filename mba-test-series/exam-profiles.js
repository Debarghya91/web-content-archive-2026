/* Payments Training Hub: MBA Test Series exam profiles.
   Plain vanilla JS, no libraries. Usable in the browser as a classic
   script (window.MbaExamProfiles) and in Node for tests (module.exports).
   No em dashes. Brand: Payments Training Hub only. No exam-body logos.
   Per-exam navigation, timing, calculator, marking and review rules,
   checked against the real exam patterns (ChatGPT-corrected audit,
   24 Nov 2026): XAT has a calculator in QADI only; GMAT is not one-way,
   it has end-of-section review with max 3 answer changes, but no
   Previous button and no backward movement inside a section; GRE has an
   in-section Review screen. This file holds data and pure functions
   only; it does not touch the DOM or localStorage. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  root.MbaExamProfiles = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  /* Every profile carries exactly the same fields. Fields that do not
     apply to an exam use null, false, 0, [] or {} as appropriate. */
  function mk(o) {
    return {
      examName: o.examName,
      navigation: o.navigation,
      sectionOrder: o.sectionOrder,
      sectionTimer: o.sectionTimer,
      parts: o.parts || null,
      allowPrevious: o.allowPrevious !== false,
      palette: o.palette,
      calculatorSections: o.calculatorSections || [],
      titaWrongMark: (o.titaWrongMark === undefined || o.titaWrongMark === null) ? null : o.titaWrongMark,
      sectionMarkingOverrides: o.sectionMarkingOverrides || {},
      unattemptedPenalty: o.unattemptedPenalty || null,
      reviewAndEdit: o.reviewAndEdit || null,
      breakMinutes: o.breakMinutes || 0,
      bookmark: !!o.bookmark,
      nmatModes: o.nmatModes || null,
      simulationDisclosure: o.simulationDisclosure || null,
      scaledScoreNote: o.scaledScoreNote || null,
      essayWorkspace: !!o.essayWorkspace,
      /* Fidelity save model (round 3, per-exam fidelity spec; corrected
         round 4: IBSAT is save-next, not commit-on-move):
         'save-next' (TCS/NTA: CAT, XAT, MAT, CMAT; IBSAT): an answer is
         saved only on the commit control (Save & Next / Mark for Review &
         Next, or Next / Mark for Review for IBSAT); a palette jump
         without it does not save. 'commit-on-move' (NMAT): the answer is
         recorded when the candidate moves on with Next / Previous / Mark
         for Review. 'autosave' (GRE, SNAP, GMAT): the answer is recorded
         the moment it is selected; GRE and SNAP autosave matches the real
         console, GMAT has no unsaved state because there is no backward
         move and no palette jump. */
      saveModel: o.saveModel || 'autosave',
      primaryLabel: o.primaryLabel || 'Next',
      markLabel: (o.markLabel === undefined || o.markLabel === null) ? null : o.markLabel,
      markAdvances: !!o.markAdvances,
      showPrevious: o.showPrevious !== false,
      prevLabel: o.prevLabel || 'Previous',
      clearLabel: o.clearLabel || 'Clear Response',
      showQuestionPaper: o.showQuestionPaper !== false,
      showScratchpad: !!o.showScratchpad,
      paletteSide: o.paletteSide || 'right'
    };
  }

  var PROFILES = {
    CAT: mk({
      examName: 'CAT - Computer Based Test',
      navigation: 'sequential-lock',
      sectionOrder: 'fixed',
      sectionTimer: 'per-section',
      palette: 'section-aware',
      calculatorSections: ['*'],
      titaWrongMark: 0,
      saveModel: 'save-next',
      primaryLabel: 'Save & Next',
      markLabel: 'Mark for Review & Next',
      markAdvances: true,
      showPrevious: false,
      showQuestionPaper: true,
      showScratchpad: false
    }),
    XAT: mk({
      examName: 'XAT - Xavier Aptitude Test',
      navigation: 'part-based',
      sectionOrder: 'fixed',
      sectionTimer: 'shared-part',
      parts: [
        { id: 'PART1', sections: ['VALR', 'DM', 'QADI'], minutes: 170 },
        { id: 'PART2', sections: ['GK'], minutes: 10, lockedUntilPreviousEnds: true }
      ],
      palette: 'section',
      calculatorSections: ['QADI'],
      sectionMarkingOverrides: { GK: { correct: 1, wrong: 0, unattempted: 0 } },
      unattemptedPenalty: { threshold: 8, penalty: 0.10, scope: 'PART1' },
      saveModel: 'save-next',
      primaryLabel: 'Save & Next',
      markLabel: 'Mark for Review & Next',
      markAdvances: true,
      showPrevious: false,
      showQuestionPaper: true,
      showScratchpad: false
    }),
    NMAT: mk({
      examName: 'NMAT by GMAC',
      navigation: 'one-way',
      sectionOrder: 'candidate-choice',
      sectionTimer: 'per-section',
      allowPrevious: false,
      palette: 'none',
      calculatorSections: [],
      nmatModes: ['standard', 'simulation'],
      simulationDisclosure: 'This simulation is not adaptively generated. Questions are fixed; the real NMAT adapts to your answers. Like the real exam, you must answer each question before Next will move on.',
      scaledScoreNote: 'Practice score out of 108. The real NMAT reports a scaled score from 36 to 360 (12 to 120 per section) from an adaptive algorithm; this raw score is not on that scale.',
      saveModel: 'commit-on-move',
      primaryLabel: 'Next',
      markLabel: 'Mark for Review',
      markAdvances: false,
      showPrevious: true,
      showQuestionPaper: true,
      showScratchpad: false
    }),
    SNAP: mk({
      examName: 'SNAP',
      navigation: 'free',
      sectionOrder: 'candidate-choice',
      sectionTimer: 'none',
      palette: 'section',
      calculatorSections: [],
      saveModel: 'autosave',
      primaryLabel: 'Next',
      markLabel: 'Mark for Review',
      markAdvances: false,
      showPrevious: false,
      prevLabel: 'Previous',
      clearLabel: 'Clear',
      showQuestionPaper: true,
      showScratchpad: false,
      paletteSide: 'left'
      /* Ethics, Morality and Values is 10 questions / 10 marks, listed
         last (official SNAP 2026 syllabus, snaptest.org). A secondary
         article claims 5 questions; that figure must never replace the
         official 10. Guarded by an engine test on data/SNAP/SNAP-01.json. */
    }),
    MAT: mk({
      examName: 'MAT',
      navigation: 'free',
      sectionOrder: 'candidate-choice',
      sectionTimer: 'none',
      palette: 'section',
      calculatorSections: [],
      saveModel: 'save-next',
      primaryLabel: 'Save & Next',
      markLabel: 'Mark for Review & Next',
      markAdvances: true,
      showPrevious: false,
      showQuestionPaper: true,
      showScratchpad: false
    }),
    CMAT: mk({
      examName: 'CMAT',
      navigation: 'free',
      sectionOrder: 'candidate-choice',
      sectionTimer: 'none',
      palette: 'section',
      calculatorSections: [],
      saveModel: 'save-next',
      primaryLabel: 'Save & Next',
      markLabel: 'Mark for Review & Next',
      markAdvances: true,
      showPrevious: false,
      showQuestionPaper: true,
      showScratchpad: false
    }),
    IBSAT: mk({
      examName: 'IBSAT',
      navigation: 'free',
      sectionOrder: 'candidate-choice',
      sectionTimer: 'none',
      /* MeritTrac palette semantics: green answered, red not
         answered, orange marked, blue answered-and-marked, white
         not visited (the manual's own screenshots show white Not
         Visited tiles with a live legend count; the manual text
         paragraph that lists grey "skipped" instead disagrees with
         its screenshots, and the screenshots are the visual truth).
         The palette sits on the LEFT, as on the real console. */
      palette: 'merittrac',
      paletteSide: 'left',
      calculatorSections: [],
      saveModel: 'save-next',
      primaryLabel: 'Next',
      markLabel: 'Mark for Review',
      markAdvances: false,
      showPrevious: true,
      prevLabel: 'Previous',
      clearLabel: 'Clear',
      showQuestionPaper: true,
      showScratchpad: false
    }),
    GMAT: mk({
      examName: 'GMAT',
      navigation: 'order-choice-review',
      sectionOrder: 'candidate-choice',
      sectionTimer: 'per-section',
      allowPrevious: false,
      palette: 'none',
      calculatorSections: ['DI'],
      reviewAndEdit: { enabled: true, maxChanges: 3 },
      breakMinutes: 10,
      bookmark: true,
      saveModel: 'autosave',
      primaryLabel: 'Next',
      markLabel: null,
      markAdvances: false,
      showPrevious: false,
      showQuestionPaper: false,
      showScratchpad: true,
      /* The real GMAT reports an adaptive scaled score; this mock
         reports a raw count only. Shown in the instructions and on the
         results page, mirroring the NMAT scaled-score disclosure. */
      scaledScoreNote: 'The real GMAT reports an adaptive scaled score. This mock reports a raw count of correct answers only; no scaled score is shown here because the real scale cannot be computed from a fixed mock.'
    }),
    GRE: mk({
      examName: 'GRE General Test',
      navigation: 'within-section-review',
      sectionOrder: 'fixed',
      sectionTimer: 'per-section',
      palette: 'none',
      calculatorSections: ['QR'],
      essayWorkspace: true,
      saveModel: 'autosave',
      primaryLabel: 'Next',
      markLabel: 'Mark',
      markAdvances: false,
      showPrevious: true,
      prevLabel: 'Back',
      showQuestionPaper: false,
      showScratchpad: false
    })
  };

  var DEFAULT = mk({
    examName: 'MBA Test',
    navigation: 'free',
    sectionOrder: 'fixed',
    sectionTimer: 'none',
    palette: 'section',
    calculatorSections: [],
    saveModel: 'save-next',
    primaryLabel: 'Save & Next',
    markLabel: 'Mark for Review & Next',
    markAdvances: true,
    showPrevious: true,
    showQuestionPaper: true,
    showScratchpad: false
  });

  function getProfile(examKey) {
    var key = String(examKey || '').trim().toUpperCase();
    return PROFILES[key] || DEFAULT;
  }

  /* A calculator entry matches its own section id, or a section id that
     starts with it, so GRE 'QR' covers the mock sections QR1 and QR2.
     '*' matches every section. */
  function calculatorAllowed(profile, sectionId) {
    if (!profile || !sectionId) { return false; }
    var list = profile.calculatorSections || [];
    for (var i = 0; i < list.length; i++) {
      var entry = list[i];
      if (entry === '*') { return true; }
      if (sectionId === entry) { return true; }
      if (String(sectionId).indexOf(entry) === 0) { return true; }
    }
    return false;
  }

  /* Returns (item) => {correct, wrong, unattempted}. Starts from the
     mock marking, applies a per-section override for the item's section,
     then applies the TITA wrong-mark override for TITA items. */
  function makeMarkingResolver(profile, mockMarking) {
    var base = mockMarking || {};
    function num(v, fallback) {
      return (v === undefined || v === null) ? fallback : Number(v);
    }
    return function (item) {
      var correct = num(base.correct, 0);
      var wrong = num(base.wrong, 0);
      var unattempted = num(base.unattempted, 0);
      var overrides = (profile && profile.sectionMarkingOverrides) || {};
      if (item && item.section && overrides[item.section]) {
        var o = overrides[item.section];
        correct = num(o.correct, correct);
        wrong = num(o.wrong, wrong);
        unattempted = num(o.unattempted, unattempted);
      }
      if (item && item.type === 'tita' && profile &&
          profile.titaWrongMark !== null && profile.titaWrongMark !== undefined) {
        wrong = Number(profile.titaWrongMark);
      }
      return { correct: correct, wrong: wrong, unattempted: unattempted };
    };
  }

  function isAnsweredValue(item, ans) {
    if (!ans || ans.value === null || ans.value === undefined) { return false; }
    if (item && item.type === 'mcq') { return ans.value !== ''; }
    return String(ans.value).trim() !== '';
  }

  /* XAT rule (2026 cycle: -0.10 per unattempted question beyond the
     first 8 in Part 1; XLRI raised the allowance to 12 for XAT 2027
     only, so 12 must never be used for these 2026-cycle mocks).
     Part-1-wide (fix round 6): the penalty is defined over Part 1 as
     a whole, so it applies only on a full run, never on a
     sectional/topic run; isFullRun false returns 0. Returns 0 or a
     negative number; 0 for every other exam. */
  function computeUnattemptedPenalty(profile, mock, answers, isFullRun) {
    if (!profile || !profile.unattemptedPenalty) { return 0; }
    if (isFullRun === false) { return 0; }
    var rule = profile.unattemptedPenalty;
    var threshold = Number(rule.threshold || 0);
    var penalty = Number(rule.penalty || 0);
    var scopeSections = null;
    if (rule.scope === 'PART1' && profile.parts) {
      for (var i = 0; i < profile.parts.length; i++) {
        if (profile.parts[i].id === 'PART1') { scopeSections = profile.parts[i].sections || []; }
      }
    } else if (Array.isArray(rule.scope)) {
      scopeSections = rule.scope;
    }
    if (!scopeSections || penalty <= 0) { return 0; }
    var count = 0;
    (mock && mock.items || []).forEach(function (item) {
      if (scopeSections.indexOf(item.section) === -1) { return; }
      var ans = (answers || {})[item.id];
      if (!isAnsweredValue(item, ans)) { count += 1; }
    });
    var excess = count - threshold;
    if (excess <= 0) { return 0; }
    return -Math.round(excess * penalty * 100) / 100;
  }

  function canGoPrevious(profile) {
    if (!profile) { return true; }
    return profile.allowPrevious !== false;
  }

  function paletteMode(profile) {
    return (profile && profile.palette) || 'section';
  }

  function permutations(arr) {
    var out = [];
    function build(prefix, rest) {
      if (rest.length === 0) { out.push(prefix.slice()); return; }
      for (var i = 0; i < rest.length; i++) {
        prefix.push(rest[i]);
        build(prefix, rest.slice(0, i).concat(rest.slice(i + 1)));
        prefix.pop();
      }
    }
    build([], arr.slice());
    return out;
  }

  /* NMAT and GMAT let the candidate choose the section order once:
     all 6 orders of their 3 sections. Every other exam returns a single
     order: the sections in mock order. Accepts section ids or section
     objects with an id field. */
  function sectionOrderOptions(profile, sections) {
    var ids = (sections || []).map(function (s) {
      return typeof s === 'string' ? s : s.id;
    });
    var isNmat = profile && (profile.examName === 'NMAT by GMAC' ||
      (profile.navigation === 'one-way' && profile.sectionOrder === 'candidate-choice'));
    var isGmat = profile && (profile.examName === 'GMAT' ||
      profile.navigation === 'order-choice-review');
    if (isNmat) { return permutations(['LS', 'QS', 'LR']); }
    if (isGmat) { return permutations(['QR', 'VR', 'DI']); }
    return [ids];
  }

  function partForSection(profile, sectionId) {
    if (!profile || !profile.parts || !sectionId) { return null; }
    for (var i = 0; i < profile.parts.length; i++) {
      var part = profile.parts[i];
      if ((part.sections || []).indexOf(sectionId) !== -1) { return part.id; }
    }
    return null;
  }

  function partClockMinutes(profile, partId) {
    if (!profile || !profile.parts || !partId) { return null; }
    for (var i = 0; i < profile.parts.length; i++) {
      if (profile.parts[i].id === partId) { return profile.parts[i].minutes; }
    }
    return null;
  }

  return {
    PROFILES: PROFILES,
    DEFAULT: DEFAULT,
    getProfile: getProfile,
    calculatorAllowed: calculatorAllowed,
    makeMarkingResolver: makeMarkingResolver,
    computeUnattemptedPenalty: computeUnattemptedPenalty,
    canGoPrevious: canGoPrevious,
    paletteMode: paletteMode,
    sectionOrderOptions: sectionOrderOptions,
    partForSection: partForSection,
    partClockMinutes: partClockMinutes
  };
});
