/* Payments Training Hub practical-learning features: shared helpers.
   Loaded on every feature page after site.js / nav.js. No dependencies.
   Progress is stored in this browser only (localStorage). No server, no real banking systems. All data is synthetic. */
(function(){
  "use strict";
  var KEY = "pf-features-progress-v1";
  function readStore(){
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch(e){ return {}; }
  }
  function writeStore(s){
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e){}
  }
  function esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function el(id){ return document.getElementById(id); }
  function showFeedback(targetId, kind, html){
    var t = el(targetId);
    if(!t) return;
    t.className = "pf-fb " + (kind === "ok" ? "ok" : kind === "warn" ? "warn" : "err");
    t.innerHTML = html;
    t.style.display = "block";
  }
  function hideFeedback(targetId){
    var t = el(targetId);
    if(t){ t.style.display = "none"; t.innerHTML = ""; }
  }
  function recordScore(featureId, score, total, label){
    var s = readStore();
    var prev = s[featureId];
    var entry = { score: score, total: total, label: label || "",
      when: new Date().toISOString(), attempts: (prev ? prev.attempts + 1 : 1) };
    if(!prev || score > prev.score) entry.best = score; else entry.best = prev.best;
    entry.bestTotal = total;
    s[featureId] = entry;
    writeStore(s);
    return entry;
  }
  function getScore(featureId){
    return readStore()[featureId] || null;
  }
  function getAllScores(){
    return readStore();
  }
  function resetFeature(featureId){
    var s = readStore();
    delete s[featureId];
    writeStore(s);
  }
  function resetAllFeatures(){
    try { localStorage.removeItem(KEY); } catch(e){}
  }
  function renderScoreBar(targetId, score, total){
    var t = el(targetId);
    if(!t) return;
    var pct = total > 0 ? Math.round(score / total * 100) : 0;
    t.innerHTML = "<b>" + score + " / " + total + "</b><span>" + pct + "%</span>" +
      "<div class=\"bar\"><i style=\"width:" + pct + "%\"></i></div>";
  }
  /* Simple tab switching: buttons with data-pf-tab, panels with data-pf-panel. */
  function initTabs(scope){
    var root = scope || document;
    var btns = root.querySelectorAll("[data-pf-tab]");
    btns.forEach(function(btn){
      btn.addEventListener("click", function(){
        var name = btn.getAttribute("data-pf-tab");
        btns.forEach(function(b){ b.setAttribute("aria-selected", b === btn ? "true" : "false"); });
        root.querySelectorAll("[data-pf-panel]").forEach(function(p){
          p.style.display = (p.getAttribute("data-pf-panel") === name) ? "" : "none";
        });
      });
    });
  }
  function downloadText(filename, text){
    var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  window.PFFeatures = {
    esc: esc, el: el, showFeedback: showFeedback, hideFeedback: hideFeedback,
    recordScore: recordScore, getScore: getScore, getAllScores: getAllScores,
    resetFeature: resetFeature, resetAllFeatures: resetAllFeatures,
    renderScoreBar: renderScoreBar, initTabs: initTabs, downloadText: downloadText
  };
  document.addEventListener("DOMContentLoaded", function(){ initTabs(document); });
})();
