/* Reconciliation War Room.
   One business day (value date 5 November 2026), four synthetic sources:
   payment instructions, clearing records, settlement records and bank
   statement entries. 24 instructions plus 2 clearing records with no
   instruction: 26 reconciliation items, 12 matched, 14 exceptions.
   Matching is deterministic and computed from the data by the rules
   stated on the page (reference first, exact amount, currency, value
   date within one business day, duplicate and missing detection).
   Scoring: 10 points per correct categorisation, 10 per correct
   resolution. 14 exceptions x 20 = 280 total. All data is synthetic. */
(function(){
  "use strict";
  var FEATURE_ID = "reconciliation-war-room";
  var TOTAL = 280;
  var CAT_POINTS = 10;
  var RES_POINTS = 10;
  var BASE_DATE = "2026-11-05";
  var NEXT_DATE = "2026-11-06";

  var LABELS = {
    matched: "Matched",
    missing: "Missing",
    duplicate: "Duplicate",
    amount: "Amount mismatch",
    currency: "Currency mismatch",
    timing: "Timing difference",
    settlement: "Settlement discrepancy"
  };
  var TAG_CLASS = {
    matched: "", missing: "red", duplicate: "amber", amount: "red",
    currency: "amber", timing: "amber", settlement: "red"
  };

  function uetr(n){
    var h = ("0000" + n.toString(16)).slice(-4);
    return "a1b2c3d4-5e6f-4a7b-8c9d-" + h + h + "e5f60708";
  }
  function rec(amount, currency, valueDate, status){
    return { amount: amount, currency: currency, valueDate: valueDate, status: status };
  }
  function full(amount, currency, valueDate){
    return {
      instruction: rec(amount, currency, BASE_DATE, "Sent to clearing"),
      clearing: [rec(amount, currency, valueDate || BASE_DATE, "Cleared")],
      settlement: rec(amount, currency, valueDate || BASE_DATE, "Settled"),
      statement: rec(amount, currency, valueDate || BASE_DATE, "Posted")
    };
  }
  function item(n, creditor, amount, currency, sources, resolution){
    var ref = "PFT-2026-1105-" + ("00" + n).slice(-3);
    return {
      ref: ref,
      n: n,
      e2e: "PFT-E2E-20261105-" + ("00" + n).slice(-3),
      uetr: uetr(n),
      debtor: "Halcyon Trading Ltd",
      creditor: creditor,
      iban: "GB29 NWBK 6016 1331 9268 " + ("00" + (10 + n)).slice(-2),
      bic: "NWBKGB2L",
      sources: sources,
      resolution: resolution
    };
  }

  var RESOLUTIONS = {
    missingInstruction: {
      options: [
        "Raise an enquiry with the source system and trace the instruction; do not post a manual clearing entry",
        "Ignore it; it will probably clear tomorrow on its own",
        "Post a manual clearing entry so the item matches",
        "Cancel the instruction immediately without checking"
      ],
      correct: 0,
      why: "Correct. An instruction with no clearing record must be traced at the source before anything is posted. A manual clearing entry would create a false match and hide the real break, and cancelling without checking could stop a genuine payment."
    },
    missingClearing: {
      options: [
        "Query the clearing agent and the source system to find the origin; hold any onward action until the instruction is found",
        "Accept the clearing record as a valid payment and settle it",
        "Delete the clearing record so the books balance",
        "Post a matching instruction from the clearing details"
      ],
      correct: 0,
      why: "Correct. A clearing record with no instruction has no authorised source. It must be traced with the clearing agent and the source system, and nothing should be settled or posted until the origin is confirmed."
    },
    duplicate: {
      options: [
        "Reject the duplicate clearing entry and keep the original; confirm only one settlement is made",
        "Settle both clearing entries; the beneficiary can return the extra funds",
        "Cancel the original instruction and keep the duplicate",
        "Merge the two clearing entries into one larger payment"
      ],
      correct: 0,
      why: "Correct. A duplicate must never settle twice. Reject the duplicate, keep the original, and confirm with the settlement agent that only one settlement is made, so the beneficiary is not paid twice."
    },
    amount: {
      options: [
        "Raise a query with the clearing agent and hold settlement until the correct amount is confirmed",
        "Settle the clearing amount; the difference is small enough to ignore",
        "Amend the instruction amount to match clearing without asking anyone",
        "Split the difference and settle the average of the two amounts"
      ],
      correct: 0,
      why: "Correct. Amounts must match exactly, with no tolerance. When they do not, settlement must be held and the correct amount confirmed with the clearing agent, because settling the wrong amount pays the wrong value."
    },
    currency: {
      options: [
        "Raise a query with the clearing agent to confirm the intended currency; hold settlement until it is confirmed",
        "Settle in the clearing currency; currency does not matter if the number matches",
        "Convert the amount at today's rate and settle the converted value",
        "Change the instruction currency to match clearing and close the item"
      ],
      correct: 0,
      why: "Correct. A currency mismatch means the two records describe different payment obligations, even if the number looks the same. Settlement must wait until the intended currency is confirmed with the clearing agent."
    },
    timing: {
      options: [
        "Confirm the one-day value date difference is expected, accept it as a timing difference, and record it as explained",
        "Reject the clearing record and demand same-day value",
        "Raise a settlement query; a one-day difference is always a break",
        "Amend the instruction value date silently to match clearing"
      ],
      correct: 0,
      why: "Correct. The matching rules allow a value date difference of one business day. Once the one-day difference is confirmed as expected, it is a timing difference, not a break, and it is recorded as explained with no further action."
    },
    settlementMissing: {
      options: [
        "Chase the settlement agent for the missing settlement and keep the item open until it settles",
        "Close the item; clearing is enough and settlement will follow eventually",
        "Post a manual settlement entry so the item matches",
        "Recall the payment from clearing"
      ],
      correct: 0,
      why: "Correct. A payment that cleared but did not settle has not completed. The settlement agent must be chased and the item kept open until settlement is confirmed; a manual settlement entry would be a false record."
    },
    settlementAmount: {
      options: [
        "Raise a query with the settlement agent and keep the item open until the settled amount is agreed",
        "Accept the settled amount; settlement is final either way",
        "Post an adjustment for the difference without asking anyone",
        "Reverse the settlement and settle again tomorrow"
      ],
      correct: 0,
      why: "Correct. When the settled amount differs from the cleared amount, the difference must be agreed with the settlement agent before the item can close. Accepting it or posting an unexplained adjustment would leave the books wrong."
    }
  };

  var CREDITORS = {
    1: "Alder Consulting BV", 2: "Fournier et Cie SARL", 3: "Kessler GmbH",
    4: "Nordvik Shipping AS", 5: "Bramley Foods Ltd", 6: "Costa Verde SA",
    7: "Tanaka Precision KK", 8: "Okafor Logistics Ltd", 9: "Lindqvist AB",
    10: "Moreau Textiles SAS", 11: "Varga Metals Kft", 12: "Sorensen Dairy A/S",
    13: "Alder Consulting BV", 14: "Kessler GmbH", 15: "Nordvik Shipping AS",
    16: "Bramley Foods Ltd", 17: "Tanaka Precision KK", 18: "Okafor Logistics Ltd",
    19: "Lindqvist AB", 20: "Moreau Textiles SAS", 21: "Varga Metals Kft",
    22: "Sorensen Dairy A/S", 25: "Unknown origin", 26: "Unknown origin"
  };

  var ITEMS = [];
  var i, s;
  /* 12 matched items, 001 to 012. */
  var matchedData = [
    [1, "12,400.00", "EUR"], [2, "8,750.50", "GBP"], [3, "25,000.00", "EUR"],
    [4, "41,200.00", "USD"], [5, "6,930.75", "GBP"], [6, "18,400.00", "EUR"],
    [7, "52,600.00", "USD"], [8, "9,850.00", "GBP"], [9, "33,300.00", "EUR"],
    [10, "14,275.25", "USD"], [11, "7,640.00", "EUR"], [12, "21,900.00", "GBP"]
  ];
  matchedData.forEach(function(d){ ITEMS.push(item(d[0], CREDITORS[d[0]], d[1], d[2], full(d[1], d[2]), null)); });

  /* 013, 014: instruction with no clearing record (missing). */
  [13, 14].forEach(function(n){
    var amt = n === 13 ? "11,250.00" : "29,800.00";
    var cur = n === 13 ? "EUR" : "USD";
    s = { instruction: rec(amt, cur, BASE_DATE, "Sent to clearing"), clearing: [], settlement: null, statement: null };
    ITEMS.push(item(n, CREDITORS[n], amt, cur, s, RESOLUTIONS.missingInstruction));
  });

  /* 015, 016: same instruction twice in clearing (duplicate). */
  [15, 16].forEach(function(n){
    var amt = n === 15 ? "16,700.00" : "44,150.00";
    var cur = n === 15 ? "GBP" : "EUR";
    s = full(amt, cur);
    s.clearing = [rec(amt, cur, BASE_DATE, "Cleared"), rec(amt, cur, BASE_DATE, "Cleared (duplicate)")];
    ITEMS.push(item(n, CREDITORS[n], amt, cur, s, RESOLUTIONS.duplicate));
  });

  /* 017, 018: amount mismatch, clearing amount differs from instruction. */
  (function(){
    s = full("12,500.00", "EUR");
    s.clearing = [rec("12,750.00", "EUR", BASE_DATE, "Cleared")];
    s.settlement = rec("12,750.00", "EUR", BASE_DATE, "Settled");
    s.statement = rec("12,750.00", "EUR", BASE_DATE, "Posted");
    ITEMS.push(item(17, CREDITORS[17], "12,500.00", "EUR", s, RESOLUTIONS.amount));
    s = full("38,400.00", "USD");
    s.clearing = [rec("38,040.00", "USD", BASE_DATE, "Cleared")];
    s.settlement = rec("38,040.00", "USD", BASE_DATE, "Settled");
    s.statement = rec("38,040.00", "USD", BASE_DATE, "Posted");
    ITEMS.push(item(18, CREDITORS[18], "38,400.00", "USD", s, RESOLUTIONS.amount));
  })();

  /* 019, 020: currency mismatch, clearing currency differs from instruction. */
  (function(){
    s = full("19,600.00", "EUR");
    s.clearing = [rec("19,600.00", "USD", BASE_DATE, "Cleared")];
    s.settlement = rec("19,600.00", "USD", BASE_DATE, "Settled");
    s.statement = rec("19,600.00", "USD", BASE_DATE, "Posted");
    ITEMS.push(item(19, CREDITORS[19], "19,600.00", "EUR", s, RESOLUTIONS.currency));
    s = full("27,300.00", "USD");
    s.clearing = [rec("27,300.00", "GBP", BASE_DATE, "Cleared")];
    s.settlement = rec("27,300.00", "GBP", BASE_DATE, "Settled");
    s.statement = rec("27,300.00", "GBP", BASE_DATE, "Posted");
    ITEMS.push(item(20, CREDITORS[20], "27,300.00", "USD", s, RESOLUTIONS.currency));
  })();

  /* 021, 022: timing difference, clearing value date one day later. */
  [21, 22].forEach(function(n){
    var amt = n === 21 ? "15,900.00" : "63,250.00";
    var cur = n === 21 ? "EUR" : "USD";
    s = full(amt, cur, NEXT_DATE);
    ITEMS.push(item(n, CREDITORS[n], amt, cur, s, RESOLUTIONS.timing));
  });

  /* 023: cleared but not settled. 024: settled for a different amount. */
  (function(){
    s = full("22,800.00", "GBP");
    s.settlement = null; s.statement = null;
    ITEMS.push(item(23, CREDITORS[23], "22,800.00", "GBP", s, RESOLUTIONS.settlementMissing));
    s = full("47,500.00", "EUR");
    s.settlement = rec("47,450.00", "EUR", BASE_DATE, "Settled");
    s.statement = rec("47,450.00", "EUR", BASE_DATE, "Posted");
    ITEMS.push(item(24, CREDITORS[24], "47,500.00", "EUR", s, RESOLUTIONS.settlementAmount));
  })();

  /* 025, 026: clearing records with no instruction (missing). */
  [25, 26].forEach(function(n){
    var amt = n === 25 ? "10,400.00" : "31,750.00";
    var cur = n === 25 ? "USD" : "EUR";
    s = {
      instruction: null,
      clearing: [rec(amt, cur, BASE_DATE, "Cleared")],
      settlement: null,
      statement: rec(amt, cur, BASE_DATE, "Posted")
    };
    ITEMS.push(item(n, CREDITORS[n], amt, cur, s, RESOLUTIONS.missingClearing));
  });

  /* Deterministic matching, computed from the data by the stated rules. */
  function categoryOf(it){
    var src = it.sources;
    if(!src.instruction) return "missing";
    if(src.clearing.length === 0) return "missing";
    if(src.clearing.length > 1) return "duplicate";
    var c = src.clearing[0], ins = src.instruction;
    if(c.amount !== ins.amount) return "amount";
    if(c.currency !== ins.currency) return "currency";
    if(c.valueDate !== ins.valueDate) return "timing";
    if(!src.settlement) return "settlement";
    if(src.settlement.amount !== ins.amount || src.settlement.currency !== ins.currency) return "settlement";
    return "matched";
  }
  ITEMS.forEach(function(it){ it.category = categoryOf(it); });

  var state = {}; /* ref -> {cat: bool, res: bool} */
  var currentRef = null;

  function esc(s){ return window.PFFeatures.esc(s); }
  function el(id){ return document.getElementById(id); }
  function getItem(ref){
    for(var k = 0; k < ITEMS.length; k++) if(ITEMS[k].ref === ref) return ITEMS[k];
    return null;
  }
  function score(){
    var total = 0;
    Object.keys(state).forEach(function(r){
      if(state[r].cat) total += CAT_POINTS;
      if(state[r].res) total += RES_POINTS;
    });
    return total;
  }
  function resolvedCount(){
    var n = 0;
    Object.keys(state).forEach(function(r){ if(state[r].cat && state[r].res) n++; });
    return n;
  }
  function exceptionCount(){
    return ITEMS.filter(function(it){ return it.category !== "matched"; }).length;
  }

  function renderStats(){
    var counts = { matched: 0, missing: 0, duplicate: 0, amount: 0, currency: 0, timing: 0, settlement: 0 };
    var nIns = 0, nClr = 0, nSet = 0, nStmt = 0, outstanding = 0;
    ITEMS.forEach(function(it){
      counts[it.category]++;
      if(it.sources.instruction) nIns++;
      nClr += it.sources.clearing.length;
      if(it.sources.settlement) nSet++;
      if(it.sources.statement) nStmt++;
      if(it.category !== "matched" && !(state[it.ref] && state[it.ref].cat && state[it.ref].res)) outstanding++;
    });
    var resolved = resolvedCount();
    var total = ITEMS.length;
    var matchRate = Math.round((counts.matched + resolved) / total * 100);
    el("statInstructions").textContent = nIns;
    el("statClearing").textContent = nClr;
    el("statSettlement").textContent = nSet;
    el("statStatement").textContent = nStmt;
    el("statMatched").textContent = counts.matched + resolved;
    el("statExceptions").textContent = outstanding;
    el("statResolved").textContent = resolved;
    el("statMatchRate").textContent = matchRate + "%";
    var rows = "";
    ["matched", "missing", "duplicate", "amount", "currency", "timing", "settlement"].forEach(function(k){
      var remaining = 0;
      ITEMS.forEach(function(it){
        if(it.category === k && !(state[it.ref] && state[it.ref].cat && state[it.ref].res)) remaining++;
      });
      var detail = k === "matched" ? "Clean matches across all four sources" :
        (remaining === 0 && counts[k] > 0 ? "All resolved" : remaining + " still open");
      rows += "<tr><td>" + LABELS[k] + "</td><td>" + counts[k] + "</td><td>" + esc(detail) + "</td></tr>";
    });
    el("statsTableBody").innerHTML = rows;
    el("progressLine").textContent = resolved === 0
      ? "No exceptions resolved yet. Resolve exceptions below to raise the match rate."
      : resolved + " of " + exceptionCount() + " exceptions resolved. Match rate is now " + matchRate + "% (was " + Math.round(counts.matched / total * 100) + "% before resolution). " + outstanding + " exception" + (outstanding === 1 ? "" : "s") + " still open.";
  }

  function renderScore(){
    var sc = score();
    window.PFFeatures.renderScoreBar("scoreBar", sc, TOTAL);
    el("scoreText").textContent = "Score " + sc + " of " + TOTAL + " points. Each correct categorisation earns 10 points and each correct resolution earns 10 points.";
    if(sc > 0) window.PFFeatures.recordScore(FEATURE_ID, sc, TOTAL, "Reconciliation War Room");
    var best = window.PFFeatures.getScore(FEATURE_ID);
    el("bestLine").textContent = best
      ? "Best score: " + best.best + " of " + best.bestTotal + " points"
      : "Best score: not attempted yet";
  }

  function renderTable(){
    var filter = el("filterStatus").value;
    var q = el("searchInput").value.trim().toLowerCase();
    var shown = 0;
    var html = "";
    ITEMS.forEach(function(it){
      if(filter !== "all" && it.category !== filter) return;
      var amountText = (it.sources.instruction || it.sources.clearing[0] || {}).amount || "";
      var currencyText = (it.sources.instruction || it.sources.clearing[0] || {}).currency || "";
      var hay = (it.ref + " " + amountText + " " + currencyText + " " + it.creditor + " " + it.debtor).toLowerCase();
      if(q && hay.indexOf(q) === -1) return;
      shown++;
      var st = state[it.ref] || {};
      var doneTag = (st.cat && st.res) ? ' <span class="pf-tag">Resolved</span>' : "";
      var dateText = (it.sources.instruction || it.sources.clearing[0] || {}).valueDate || "";
      html += "<tr><td>" + esc(it.ref) + "</td><td class=\"wrap\">" + esc(it.creditor) + "</td>" +
        "<td>" + esc(currencyText + " " + amountText) + "</td>" +
        "<td>" + esc(dateText) + "</td>" +
        "<td><span class=\"pf-tag " + TAG_CLASS[it.category] + "\">" + LABELS[it.category] + "</span>" + doneTag + "</td>" +
        "<td><button type=\"button\" class=\"pf-btn secondary\" data-view=\"" + esc(it.ref) + "\">Compare</button></td></tr>";
    });
    if(shown === 0){
      html = "<tr><td colspan=\"6\">No items match this filter and search. Clear the filters to see all items.</td></tr>";
    }
    el("reconTableBody").innerHTML = html;
    el("filterCount").textContent = "Showing " + shown + " of " + ITEMS.length + " items.";
    el("reconTableBody").querySelectorAll("[data-view]").forEach(function(btn){
      btn.addEventListener("click", function(){ openItem(btn.getAttribute("data-view")); });
    });
  }

  function diffCell(value, baseValue, present){
    if(!present) return "<td>No record</td>";
    if(baseValue !== null && value !== baseValue){
      return "<td data-diff=\"true\" style=\"background:#FBE9E9;font-weight:700\">" + esc(value) + "</td>";
    }
    return "<td>" + esc(value) + "</td>";
  }
  function recordCell(rec, field, baseValue){
    if(!rec) return "<td>No record</td>";
    return diffCell(rec[field], baseValue, true);
  }

  function openItem(ref){
    var it = getItem(ref);
    if(!it) return;
    currentRef = ref;
    var src = it.sources;
    var ins = src.instruction;
    var clr = src.clearing[0] || null;
    var set = src.settlement;
    var stmt = src.statement;
    var baseAmount = ins ? ins.amount : null;
    var baseCurrency = ins ? ins.currency : null;
    var baseDate = ins ? ins.valueDate : null;
    el("cmpTitle").textContent = "Comparison: " + it.ref + " (" + LABELS[it.category] + ")";
    el("cmpIntro").textContent = it.category === "matched"
      ? "This item matches across all four sources. Debtor " + it.debtor + ", creditor " + it.creditor + "."
      : "Compare the four records for " + it.ref + ". Debtor " + it.debtor + ", creditor " + it.creditor + ". Find what differs, then categorise and resolve it below.";
    var rows = "";
    function row(label, cells){ rows += "<tr><td><b>" + label + "</b></td>" + cells + "</tr>"; }
    row("Reference", "<td>" + esc(it.ref) + "</td><td>" + esc(it.ref) + "</td><td>" + esc(it.ref) + "</td><td>" + esc(it.ref) + "</td>");
    row("EndToEndId", "<td>" + esc(it.e2e) + "</td><td>" + esc(it.e2e) + "</td><td>" + esc(it.e2e) + "</td><td>" + esc(it.e2e) + "</td>");
    row("UETR", "<td>" + esc(it.uetr) + "</td><td>" + esc(it.uetr) + "</td><td>" + esc(it.uetr) + "</td><td>" + esc(it.uetr) + "</td>");
    row("Amount", recordCell(ins, "amount", null) + recordCell(clr, "amount", baseAmount) + recordCell(set, "amount", baseAmount) + recordCell(stmt, "amount", baseAmount));
    row("Currency", recordCell(ins, "currency", null) + recordCell(clr, "currency", baseCurrency) + recordCell(set, "currency", baseCurrency) + recordCell(stmt, "currency", baseCurrency));
    row("Value date", recordCell(ins, "valueDate", null) + recordCell(clr, "valueDate", baseDate) + recordCell(set, "valueDate", baseDate) + recordCell(stmt, "valueDate", baseDate));
    row("Debtor IBAN", "<td>" + esc(it.iban) + "</td><td>" + esc(it.iban) + "</td><td>" + esc(it.iban) + "</td><td>" + esc(it.iban) + "</td>");
    row("Creditor BIC", "<td>" + esc(it.bic) + "</td><td>" + esc(it.bic) + "</td><td>" + esc(it.bic) + "</td><td>" + esc(it.bic) + "</td>");
    row("Status",
      (ins ? "<td>" + esc(ins.status) + "</td>" : "<td>No record</td>") +
      (clr ? "<td>" + esc(src.clearing.map(function(r){ return r.status; }).join(", ")) + "</td>" : "<td>No record</td>") +
      (set ? "<td>" + esc(set.status) + "</td>" : "<td>No record</td>") +
      (stmt ? "<td>" + esc(stmt.status) + "</td>" : "<td>No record</td>"));
    if(src.clearing.length > 1){
      rows += "<tr><td><b>Clearing entries</b></td><td colspan=\"4\">This reference appears " + src.clearing.length + " times in clearing: a duplicate entry.</td></tr>";
    }
    el("cmpTableBody").innerHTML = rows;
    var st = state[ref] || {};
    var isMatched = it.category === "matched";
    el("matchedBox").style.display = isMatched ? "" : "none";
    el("workBox").style.display = isMatched ? "none" : "";
    if(!isMatched){
      el("catSelect").value = st.cat ? it.category : "";
      el("catSelect").disabled = !!st.cat;
      el("checkCatBtn").disabled = !!st.cat;
      window.PFFeatures.hideFeedback("catFeedback");
      window.PFFeatures.hideFeedback("resFeedback");
      el("explainBox").style.display = "none";
      if(st.cat){
        window.PFFeatures.showFeedback("catFeedback", "ok", "Correct. Category recorded: " + LABELS[it.category] + " (10 points).");
      }
      if(st.res){
        window.PFFeatures.showFeedback("resFeedback", "ok", "Correct resolution recorded (10 points).");
        el("explainBox").innerHTML = "<b>Why this is right.</b> " + esc(it.resolution.why);
        el("explainBox").style.display = "";
      }
      var opts = "";
      it.resolution.options.forEach(function(opt, idx){
        var checked = st.res && idx === it.resolution.correct ? " checked" : "";
        var dis = st.res ? " disabled" : "";
        opts += "<div class=\"pf-field\"><label><input type=\"radio\" name=\"resOption\" value=\"" + idx + "\"" + checked + dis + "> " + esc(opt) + "</label></div>";
      });
      el("resOptions").innerHTML = opts;
      el("submitResBtn").disabled = !!st.res;
    }
    el("comparePanel").style.display = "";
    el("comparePanel").scrollIntoView({ behavior: "smooth", block: "start" });
    /* Test handle: exposes the current item and its correct answers. */
    window.__reconTest = { ref: ref, category: it.category, correctResolution: it.resolution ? it.resolution.correct : null };
  }

  function checkCategory(){
    var it = getItem(currentRef);
    if(!it || it.category === "matched") return;
    var st = state[currentRef] || {};
    if(st.cat){
      window.PFFeatures.showFeedback("catFeedback", "ok", "Category already recorded: " + LABELS[it.category] + ".");
      return;
    }
    var chosen = el("catSelect").value;
    if(!chosen){
      window.PFFeatures.showFeedback("catFeedback", "warn", "Choose a category first.");
      return;
    }
    if(chosen === it.category){
      st.cat = true;
      state[currentRef] = st;
      window.PFFeatures.showFeedback("catFeedback", "ok", "Correct. This is an " + LABELS[it.category] + ". 10 points.");
      el("catSelect").disabled = true;
      el("checkCatBtn").disabled = true;
      renderScore(); renderStats(); renderTable();
    } else {
      window.PFFeatures.showFeedback("catFeedback", "err", "Not quite. Look again at the four records: check whether a record is missing, repeated, or differs in amount, currency, value date or settlement. Try again.");
    }
  }

  function submitResolution(){
    var it = getItem(currentRef);
    if(!it || it.category === "matched") return;
    var st = state[currentRef] || {};
    if(st.res){
      window.PFFeatures.showFeedback("resFeedback", "ok", "Resolution already recorded for this item.");
      return;
    }
    var picked = document.querySelector("input[name=\"resOption\"]:checked");
    if(!picked){
      window.PFFeatures.showFeedback("resFeedback", "warn", "Pick a resolution action first.");
      return;
    }
    var idx = parseInt(picked.value, 10);
    if(idx === it.resolution.correct){
      st.res = true;
      state[currentRef] = st;
      window.PFFeatures.showFeedback("resFeedback", "ok", "Correct resolution. 10 points.");
      el("explainBox").innerHTML = "<b>Why this is right.</b> " + esc(it.resolution.why);
      el("explainBox").style.display = "";
      el("submitResBtn").disabled = true;
      el("resOptions").querySelectorAll("input").forEach(function(r){ r.disabled = true; });
      renderScore(); renderStats(); renderTable();
    } else {
      window.PFFeatures.showFeedback("resFeedback", "err", "That action would not fix this break safely. Think about what must be confirmed or held before the item can close, and try again.");
    }
  }

  function resetAll(){
    state = {};
    currentRef = null;
    window.PFFeatures.resetFeature(FEATURE_ID);
    el("comparePanel").style.display = "none";
    el("bestLine").textContent = "Best score: not attempted yet";
    renderStats(); renderScore(); renderTable();
    window.PFFeatures.showFeedback("catFeedback", "warn", "");
  }

  el("filterStatus").addEventListener("change", renderTable);
  el("searchInput").addEventListener("input", renderTable);
  el("clearFiltersBtn").addEventListener("click", function(){
    el("filterStatus").value = "all";
    el("searchInput").value = "";
    renderTable();
  });
  el("checkCatBtn").addEventListener("click", checkCategory);
  el("submitResBtn").addEventListener("click", submitResolution);
  el("closePanelBtn").addEventListener("click", function(){
    el("comparePanel").style.display = "none";
    currentRef = null;
  });
  el("resetBtn").addEventListener("click", resetAll);

  renderStats();
  renderScore();
  renderTable();
})();
