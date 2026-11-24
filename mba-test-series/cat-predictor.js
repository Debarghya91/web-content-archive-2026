/* Payments Training Hub: CAT score predictor.
   Plain vanilla JS, no libraries. Usable in the browser as a classic
   script (window.CatPredictor) and in Node for tests (module.exports).
   CAT mocks only. No em dashes. Brand: Payments Training Hub only.

   What it does
   ------------
   scoreToPercentile(rawScore): maps a CAT raw score (out of 204) to a
   predicted overall CAT percentile, by piecewise-linear interpolation
   on the published CAT 2025 score-to-percentile distribution.
   topColleges(percentile): the top 5 colleges whose CAT cutoff
   percentile (General category, CAT 2025 cycle) the candidate clears.
   difficultyIndexFromItems(items) + normaliseScore(raw, index, max):
   hardness-adjust a mock score against the CAT reference difficulty.
   weightedPrediction(attempts): the performance view for a candidate
   with 2 or more CAT mocks: per-attempt scores, trend, and a
   prediction from the recency-weighted average of hardness-adjusted
   scores.

   Sources (full record in cat-predictor-note-2026-11-24.md)
   ---------------------------------------------------------
   Score-to-percentile anchors from 80 to 100 percentile: InsideIIM
   CAT 2025 scaled-score vs percentile distribution, compiled from
   500+ verified CAT 2025 scorecards
   (insideiim.com/cat-score-percentile-predictor). Cross-checked
   against CAT 2024 (same source; also IMS, iQuanta, LPT). Anchors
   below the 80th percentile are estimated from the CAT 2024
   distribution shape (iQuanta CAT 2024 table: 60th 19.5, 70th 25.3),
   scaled to CAT 2025 levels; the published tables stop at 80.
   College cutoffs: Shiksha CAT 2025 final cutoffs, Manabadi CAT 2026
   cutoff guide, the99percentiler CAT college predictor (checked 25
   Oct 2026), IILM CAT 2026 cutoff guide. Each cutoff is the LOW end
   of the published final-call range for the General category, i.e.
   the percentile at which interview calls usually start.

   Honesty rules (owner's firm constraint, 24 Nov 2026)
   ---------------------------------------------------
   The predicted percentile is the honest output of the mapping. It
   is NEVER inflated by any amount, and no adjustment is hidden from
   the user. The hardness normalisation is shown in the UI (mock
   difficulty index, reference index, adjusted score), so the
   candidate sees exactly how the prediction was reached. To
   encourage the candidate, the UI shows the improvement trend across
   exams and a separate, clearly labelled stretch target (the next
   percentile milestone and the marks needed to reach it). The stretch
   target is never presented as the prediction.

   Caveats the UI must carry
   --------------------------
   This is an estimate, not a guarantee and not an official CAT
   percentile. CAT percentiles come from scaled scores after
   normalisation across slots, so the same raw score can give a
   different percentile in different years and slots. IIMs also apply
   sectional cutoffs (typically 75 to 80 percentile in each section
   for General category), which this predictor does not model: a
   candidate can clear the overall cutoff and still miss a call by
   failing one sectional cutoff. Final calls also depend on the
   composite score (academics, work experience, diversity), so
   clearing a cutoff means a call is plausible, not assured. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
  root.CatPredictor = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  /* ------------------------------------------------------------------
     Score-to-percentile mapping (CAT 2025, InsideIIM scorecard data)
     ------------------------------------------------------------------ */
  /* [raw score, percentile] anchors, ascending by score. Anchors at
     80 and above are the published CAT 2025 scaled-score distribution
     (InsideIIM, from verified CAT 2025 scorecards). Anchors below 80
     are estimated from the CAT 2024 distribution shape (iQuanta:
     60th 19.5 marks, 70th 25.3 marks), scaled by the CAT 2025 / CAT
     2024 ratio at the 80th percentile (37.3 / 43 = 0.87). CAT 2024
     needed about 6 to 11 more marks than CAT 2025 for the same
     percentile at 80 to 99.9, so the mapping is year-sensitive and is
     labelled an estimate wherever it is shown. */
  var SCORE_ANCHORS = [
    [-2, 20],
    [2, 30],
    [6, 40],
    [11, 50],
    [17, 60],
    [22, 70],
    [30, 75],
    [37.3, 80],
    [43.5, 85],
    [50.8, 90],
    [62.3, 95],
    [75.7, 98],
    [84.4, 99],
    [92.6, 99.5],
    [109.5, 99.9],
    [141.1, 100]
  ];
  var MAX_SCORE = 204;
  /* The predictor never claims 100 and never goes below 5: a perfect
     mock score is still only a prediction, and a very low mock score
     still leaves the candidate ahead of the lowest-scoring tail. */
  var PCT_MIN = 5;
  var PCT_MAX = 99.9;

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
  function round1(v) { return Math.round(v * 10) / 10; }
  function round2(v) { return Math.round(v * 100) / 100; }

  /* Piecewise-linear interpolation on SCORE_ANCHORS. Returns a
     percentile with one decimal, clamped to [5, 99.9]. */
  function scoreToPercentile(rawScore) {
    var s = Number(rawScore);
    if (isNaN(s)) { return null; }
    var first = SCORE_ANCHORS[0];
    var last = SCORE_ANCHORS[SCORE_ANCHORS.length - 1];
    if (s <= first[0]) { return PCT_MIN; }
    if (s >= last[0]) { return PCT_MAX; }
    for (var i = 1; i < SCORE_ANCHORS.length; i++) {
      var lo = SCORE_ANCHORS[i - 1];
      var hi = SCORE_ANCHORS[i];
      if (s <= hi[0]) {
        var frac = (s - lo[0]) / (hi[0] - lo[0]);
        return clamp(round1(lo[1] + frac * (hi[1] - lo[1])), PCT_MIN, PCT_MAX);
      }
    }
    return PCT_MAX;
  }

  /* Inverse of the mapping: the whole marks needed to reach a target
     percentile. Used only for the clearly labelled stretch target,
     never to adjust the prediction itself. */
  function scoreForPercentile(percentile) {
    var p = Number(percentile);
    if (isNaN(p)) { return null; }
    if (p <= SCORE_ANCHORS[0][1]) { return 0; }
    if (p >= 100) { return MAX_SCORE; }
    for (var i = 1; i < SCORE_ANCHORS.length; i++) {
      var lo = SCORE_ANCHORS[i - 1];
      var hi = SCORE_ANCHORS[i];
      if (p <= hi[1]) {
        var frac = (p - lo[1]) / (hi[1] - lo[1]);
        return clamp(Math.round(lo[0] + frac * (hi[0] - lo[0])), 0, MAX_SCORE);
      }
    }
    return MAX_SCORE;
  }

  /* Stretch milestones. The stretch target is the first milestone
     strictly above the candidate's predicted percentile, shown
     separately from the prediction and labelled as a target to aim
     for, not as a prediction. */
  var STRETCH_MILESTONES = [90, 95, 97, 99, 99.5, 99.9];
  function stretchTarget(percentile) {
    var p = Number(percentile);
    if (isNaN(p) || p >= 99.9) { return null; }
    for (var i = 0; i < STRETCH_MILESTONES.length; i++) {
      if (STRETCH_MILESTONES[i] > p) {
        var target = STRETCH_MILESTONES[i];
        return { percentile: target, scoreNeeded: scoreForPercentile(target) };
      }
    }
    return null;
  }

  /* ------------------------------------------------------------------
     College cutoff table (General category, CAT 2025 cycle)
     ------------------------------------------------------------------ */
  /* name: college. cutoff: overall CAT percentile at which interview
     calls usually start (low end of the published final-call range).
     rank: prestige order, used only to break ties when two colleges
     share a cutoff, so the more selective college lists first.
     Sources: Shiksha CAT 2025 final cutoffs; Manabadi CAT 2026
     cutoff guide; the99percentiler CAT college predictor (checked 25
     Oct 2026); IILM CAT 2026 cutoff guide. SPJIMR also shortlists on
     academic/work profile, so a 95 may not suffice for a score-based
     call there; the UI caveat says so. IIM Mumbai is the former
     NITIE. Cutoffs are for the General category; reserved categories
     call at lower percentiles. */
  var COLLEGES = [
    { name: 'IIM Ahmedabad', cutoff: 99, rank: 1 },
    { name: 'IIM Bangalore', cutoff: 99, rank: 2 },
    { name: 'IIM Calcutta', cutoff: 99, rank: 3 },
    { name: 'FMS Delhi', cutoff: 98.5, rank: 4 },
    { name: 'IIM Lucknow', cutoff: 97, rank: 5 },
    { name: 'IIM Kozhikode', cutoff: 97, rank: 6 },
    { name: 'IIM Indore', cutoff: 97, rank: 7 },
    { name: 'IIM Mumbai (formerly NITIE)', cutoff: 96, rank: 8 },
    { name: 'SJMSOM, IIT Bombay', cutoff: 97, rank: 9 },
    { name: 'DMS, IIT Delhi', cutoff: 96, rank: 10 },
    { name: 'MDI Gurgaon', cutoff: 95, rank: 11 },
    { name: 'SPJIMR, Mumbai', cutoff: 95, rank: 12 },
    { name: 'IIM Shillong', cutoff: 92, rank: 13 },
    { name: 'JBIMS, Mumbai', cutoff: 96, rank: 14 },
    { name: 'IIFT Delhi', cutoff: 95, rank: 15 },
    { name: 'IIM Amritsar', cutoff: 95, rank: 16 },
    { name: 'IIM Nagpur', cutoff: 95, rank: 17 },
    { name: 'IIM Rohtak', cutoff: 95, rank: 18 },
    { name: 'IIM Sambalpur', cutoff: 95, rank: 19 },
    { name: 'IIM Trichy', cutoff: 94, rank: 20 },
    { name: 'IIM Ranchi', cutoff: 94, rank: 21 },
    { name: 'IIM Raipur', cutoff: 94, rank: 22 },
    { name: 'IIM Udaipur', cutoff: 94, rank: 23 },
    { name: 'IIM Kashipur', cutoff: 92, rank: 24 },
    { name: 'IIM Jammu', cutoff: 92, rank: 25 },
    { name: 'IIM Bodh Gaya', cutoff: 92, rank: 26 },
    { name: 'IIM Sirmaur', cutoff: 90, rank: 27 },
    { name: 'IIM Visakhapatnam', cutoff: 90, rank: 28 },
    { name: 'IMT Ghaziabad', cutoff: 90, rank: 29 },
    { name: 'XIMB, Bhubaneswar', cutoff: 90, rank: 30 },
    { name: 'IMI New Delhi', cutoff: 88, rank: 31 },
    { name: 'K J Somaiya, Mumbai', cutoff: 86, rank: 32 },
    { name: 'TAPMI, Manipal', cutoff: 85, rank: 33 },
    { name: 'GIM, Goa', cutoff: 85, rank: 34 },
    { name: 'FORE, New Delhi', cutoff: 85, rank: 35 },
    { name: 'Great Lakes, Chennai', cutoff: 85, rank: 36 },
    { name: 'Welingkar (WeSchool), Mumbai', cutoff: 75, rank: 37 },
    { name: 'BIMTECH, Greater Noida', cutoff: 75, rank: 38 },
    { name: 'Nirma, Ahmedabad', cutoff: 75, rank: 39 },
    { name: 'IMS Ghaziabad', cutoff: 75, rank: 40 },
    { name: 'XIME, Bangalore', cutoff: 70, rank: 41 }
  ];

  /* The top 5 colleges the candidate can get at this percentile: the
     colleges whose cutoff the percentile clears, most selective first
     (highest cutoff, then prestige rank), up to 5. Returns fewer than
     5 when fewer colleges are in reach, and [] when the percentile is
     below every cutoff in the table (lowest cutoff is 70). */
  function topColleges(percentile) {
    var p = Number(percentile);
    if (isNaN(p)) { return []; }
    var eligible = COLLEGES.filter(function (c) { return p >= c.cutoff; });
    eligible.sort(function (a, b) {
      if (b.cutoff !== a.cutoff) { return b.cutoff - a.cutoff; }
      return a.rank - b.rank;
    });
    return eligible.slice(0, 5).map(function (c) {
      return { name: c.name, cutoff: c.cutoff };
    });
  }

  /* ------------------------------------------------------------------
     Hardness adjustment and weighted average
     ------------------------------------------------------------------ */
  /* Difficulty values match the bank's difficulty labels and the
     engine's mockDifficultyLabel weighting (Easy 1, Medium 2, Hard 3).
     REFERENCE_DIFFICULTY_INDEX is the pooled difficulty index of the
     five CAT mocks (CAT-01 to CAT-05): 697 difficulty points over 340
     questions = 2.05. The mocks are built to CAT level (the
     REBUILD-BAR: never below CAT level), so the pooled series average
     is the CAT-level reference. Per-mock indices, measured 24 Nov
     2026 from the bank files: CAT-01 2.0735, CAT-02 2.0735,
     CAT-03 2.0441, CAT-04 2.0294, CAT-05 2.0294. Because the five
     mocks sit within 0.05 of the reference, the adjustment is small
     (about 1 percent either way); it exists so that as harder or
     easier mocks are added, scores stay comparable. */
  var DIFFICULTY_VALUE = { easy: 1, medium: 2, hard: 3 };
  var REFERENCE_DIFFICULTY_INDEX = 2.05;
  var MAX_RAW_SCORE = 204;

  /* Mean difficulty value of a mock's items. An item with no difficulty
     or an unknown label counts as Medium (2). An empty list returns
     the reference index (no adjustment). */
  function difficultyIndexFromItems(items) {
    if (!items || !items.length) { return REFERENCE_DIFFICULTY_INDEX; }
    var sum = 0;
    var n = 0;
    items.forEach(function (it) {
      var v = DIFFICULTY_VALUE[String(it && it.difficulty || 'medium').toLowerCase()];
      sum += (v === undefined ? 2 : v);
      n += 1;
    });
    return n ? sum / n : REFERENCE_DIFFICULTY_INDEX;
  }

  /* Hardness-adjust a raw score: a mock harder than the CAT reference
     scales the score up, an easier mock scales it down, so scores from
     different mocks are comparable. Factor = reference / mock index.
     Clamped to [-maxScore, maxScore] as a safety rail and rounded to
     one decimal. The adjustment is shown in the UI, never hidden. */
  function normaliseScore(rawScore, mockDifficultyIndex, maxScore) {
    var raw = Number(rawScore);
    var idx = Number(mockDifficultyIndex);
    var max = Number(maxScore) || MAX_RAW_SCORE;
    if (isNaN(raw)) { return null; }
    if (isNaN(idx) || idx <= 0) { idx = REFERENCE_DIFFICULTY_INDEX; }
    var adjusted = raw * (REFERENCE_DIFFICULTY_INDEX / idx);
    return round1(clamp(adjusted, -max, max));
  }

  /* Weighted prediction across a candidate's CAT attempts.
     attempts: [{ mockId, rawScore, mockDifficultyIndex, maxScore,
     submittedAt }], in any order; sorted oldest first by submittedAt.
     Weighting: linear recency, weight of the i-th attempt (0-based,
     oldest first) is i + 1, so the newest attempt counts most and an
     old attempt still counts. Weighted score = sum(weight * adjusted
     score) / sum(weight), rounded to one decimal. The predicted
     percentile is the honest output of scoreToPercentile on that
     weighted score: no boost is added anywhere. Trend compares the
     first and last attempts' predicted percentiles. Returns null
     when there are no usable attempts. */
  function weightedPrediction(attempts) {
    var list = (attempts || []).filter(function (a) {
      return a && isFinite(Number(a.rawScore)) && isFinite(Number(a.maxScore)) && Number(a.maxScore) > 0;
    });
    if (!list.length) { return null; }
    list.sort(function (a, b) {
      return new Date(a.submittedAt || 0).getTime() - new Date(b.submittedAt || 0).getTime();
    });
    var weightSum = 0;
    var weightedSum = 0;
    var perAttempt = list.map(function (a, i) {
      var weight = i + 1;
      var adjusted = normaliseScore(a.rawScore, a.mockDifficultyIndex, a.maxScore);
      var pct = scoreToPercentile(adjusted);
      weightSum += weight;
      weightedSum += weight * adjusted;
      return {
        mockId: a.mockId || '',
        submittedAt: a.submittedAt || '',
        rawScore: Number(a.rawScore),
        maxScore: Number(a.maxScore),
        mockDifficultyIndex: (isFinite(Number(a.mockDifficultyIndex)) && Number(a.mockDifficultyIndex) > 0)
          ? round2(Number(a.mockDifficultyIndex)) : REFERENCE_DIFFICULTY_INDEX,
        normalisedScore: adjusted,
        weight: weight,
        percentile: pct
      };
    });
    var weightedScore = round1(weightedSum / weightSum);
    var percentile = scoreToPercentile(weightedScore);
    var firstPct = perAttempt[0].percentile;
    var lastPct = perAttempt[perAttempt.length - 1].percentile;
    var delta = round1(lastPct - firstPct);
    var direction = delta > 0.5 ? 'improving' : delta < -0.5 ? 'declining' : 'steady';
    return {
      attempts: perAttempt,
      weightedScore: weightedScore,
      percentile: percentile,
      colleges: topColleges(percentile),
      stretch: stretchTarget(percentile),
      trend: { firstPercentile: firstPct, lastPercentile: lastPct, delta: delta, direction: direction }
    };
  }

  /* ------------------------------------------------------------------
     Rendering (pure HTML strings; the pages inject them)
     ------------------------------------------------------------------ */
  function esc(s) {
    if (s === null || s === undefined) { return ''; }
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtPct(p) { return (p === null || p === undefined) ? 'NA' : Number(p).toFixed(1); }
  function fmtScore(v) { return (v === null || v === undefined) ? 'NA' : String(v); }

  var CAVEAT_HTML = '<p class="mba-small mba-muted">This is a prediction, not a guarantee and not an official CAT percentile. ' +
    'It is based on the CAT 2025 score-to-percentile mapping (InsideIIM, from verified CAT 2025 scorecards); CAT percentiles come from ' +
    'scaled scores after normalisation across slots, so the same raw score can give a different percentile in different years and slots. ' +
    'IIMs also apply sectional cutoffs (typically 75 to 80 percentile in each section for General category), which this predictor does not model: ' +
    'you can clear the overall cutoff and still miss a call by failing one sectional cutoff. Final calls also depend on your composite score ' +
    '(academics, work experience, diversity), so clearing a cutoff means a call is plausible, not assured. Cutoffs are for the General category; ' +
    'reserved categories call at lower percentiles. SPJIMR also shortlists on academic and work profile.</p>';

  function collegesHTML(colleges) {
    if (!colleges || !colleges.length) {
      return '<p>Your predicted percentile is below the cutoffs of the colleges in our list (the lowest listed cutoff is 70 percentile). ' +
        'Keep building your score: every additional 5 to 10 marks moves the predicted percentile up noticeably. Retake a mock after focused prep on your weakest section.</p>';
    }
    var rows = colleges.map(function (c) {
      return '<tr><td>' + esc(c.name) + '</td><td>' + fmtPct(c.cutoff) + '</td></tr>';
    }).join('');
    return '<table class="mba-result-table"><thead><tr><th scope="col">College</th><th scope="col">CAT cutoff (percentile)</th></tr></thead><tbody>' +
      rows + '</tbody></table>' +
      (colleges.length < 5
        ? '<p class="mba-small mba-muted">Only ' + colleges.length + ' of the listed colleges are in reach at this percentile; the rest need a higher predicted percentile.</p>'
        : '');
  }

  function stretchHTML(stretch) {
    if (!stretch) { return ''; }
    return '<p><b>Stretch target:</b> aim for ' + fmtPct(stretch.percentile) + ' percentile, which needs about ' +
      stretch.scoreNeeded + ' marks out of 204. That is a target to work towards, not a prediction.</p>';
  }

  /* Single-mock prediction panel. data: { rawScore, maxScore,
     mockDifficultyIndex, normalisedScore, percentile, colleges,
     stretch }. */
  function singlePredictionHTML(data) {
    var html = '<div class="mba-predictor">' +
      '<p class="mba-predictor-label">Predicted CAT percentile (estimate)</p>' +
      '<p class="mba-predictor-pct">' + fmtPct(data.percentile) + '</p>' +
      '<p>Your score: <b>' + fmtScore(data.rawScore) + ' / ' + fmtScore(data.maxScore) + '</b>. ' +
      'This mock\'s difficulty index is ' + fmtScore(round2(data.mockDifficultyIndex)) +
      ' against the CAT reference of ' + REFERENCE_DIFFICULTY_INDEX +
      ', so the hardness-adjusted score is <b>' + fmtScore(data.normalisedScore) + '</b>. ' +
      'The predicted percentile comes from that adjusted score using the CAT 2025 mapping.</p>' +
      '<h3>Top colleges you can get</h3>' +
      collegesHTML(data.colleges) +
      stretchHTML(data.stretch) +
      CAVEAT_HTML +
      '</div>';
    return html;
  }

  /* Performance view for 2 or more CAT mocks. pred is the object
     returned by weightedPrediction. */
  function performanceViewHTML(pred) {
    var rows = pred.attempts.map(function (a) {
      var when = a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '';
      return '<tr><td>' + esc(when) + '</td><td>' + esc(a.mockId) + '</td><td>' +
        fmtScore(a.rawScore) + ' / ' + fmtScore(a.maxScore) + '</td><td>' +
        fmtScore(a.mockDifficultyIndex) + '</td><td>' + fmtScore(a.normalisedScore) +
        '</td><td>' + fmtPct(a.percentile) + '</td></tr>';
    }).join('');
    var trend = pred.trend;
    var trendText;
    if (trend.direction === 'improving') {
      trendText = 'Improving: your predicted percentile rose from ' + fmtPct(trend.firstPercentile) +
        ' to ' + fmtPct(trend.lastPercentile) + ' across these mocks (' + (trend.delta >= 0 ? '+' : '') + trend.delta + ' points).';
    } else if (trend.direction === 'declining') {
      trendText = 'Declining: your predicted percentile fell from ' + fmtPct(trend.firstPercentile) +
        ' to ' + fmtPct(trend.lastPercentile) + ' across these mocks (' + trend.delta + ' points). Revisit your weakest section before the next mock.';
    } else {
      trendText = 'Steady: your predicted percentile is holding around ' + fmtPct(trend.lastPercentile) +
        ' across these mocks (change ' + (trend.delta >= 0 ? '+' : '') + trend.delta + ' points).';
    }
    var html = '<div class="mba-predictor">' +
      '<p class="mba-predictor-label">Your CAT performance across ' + pred.attempts.length + ' mocks (estimate)</p>' +
      '<table class="mba-result-table"><thead><tr><th scope="col">Date</th><th scope="col">Mock</th><th scope="col">Score</th>' +
      '<th scope="col">Mock difficulty</th><th scope="col">Adjusted score</th><th scope="col">Predicted percentile</th></tr></thead><tbody>' +
      rows + '</tbody></table>' +
      '<p class="mba-small mba-muted">Adjusted score = raw score scaled by the mock\'s difficulty against the CAT reference index of ' +
      REFERENCE_DIFFICULTY_INDEX + ' (harder mock scales up, easier mock scales down). Weights: the most recent mock counts most ' +
      '(oldest weight 1, newest weight ' + pred.attempts.length + ').</p>' +
      '<p><b>Weighted average adjusted score: ' + fmtScore(pred.weightedScore) + ' / 204.</b></p>' +
      '<p class="mba-predictor-pct">Predicted CAT percentile: ' + fmtPct(pred.percentile) + '</p>' +
      '<p>' + trendText + '</p>' +
      '<h3>Top colleges you can get</h3>' +
      collegesHTML(pred.colleges) +
      stretchHTML(pred.stretch) +
      CAVEAT_HTML +
      '</div>';
    return html;
  }

  return {
    MAX_SCORE: MAX_SCORE,
    REFERENCE_DIFFICULTY_INDEX: REFERENCE_DIFFICULTY_INDEX,
    SCORE_ANCHORS: SCORE_ANCHORS,
    COLLEGES: COLLEGES,
    scoreToPercentile: scoreToPercentile,
    scoreForPercentile: scoreForPercentile,
    stretchTarget: stretchTarget,
    topColleges: topColleges,
    difficultyIndexFromItems: difficultyIndexFromItems,
    normaliseScore: normaliseScore,
    weightedPrediction: weightedPrediction,
    singlePredictionHTML: singlePredictionHTML,
    performanceViewHTML: performanceViewHTML
  };
});
