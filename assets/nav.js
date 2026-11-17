/* ===== Multi-page navigation (5 Nov 2026) ===== */
/* Overrides the single-page navigation in site.js / studio.js /
   bundles.js with real page loads. Every page links to real
   files; there are no hidden views and no dead ends. */
var PA_CHAPTER_URL = {"ch1": "chapters/ch1-what-is-a-payment", "ch2": "chapters/ch2-payment-instruments-and-types", "ch3": "chapters/ch3-the-payment-ecosystem", "ch4": "chapters/ch4-payment-lifecycle-end-to-end", "ch5": "chapters/ch5-swift-mt-messages", "ch6": "chapters/ch6-iso-20022-fundamentals", "ch7": "chapters/ch7-pacs-008-deep-dive", "ch8": "chapters/ch8-mt-to-mx-migration-and-cbpr", "ch9": "chapters/ch9-india-upi-imps-neft-rtgs", "ch10": "chapters/ch10-us-fedwire-fednow-ach-chips", "ch11": "chapters/ch11-europe-sepa-and-t2", "ch12": "chapters/ch12-uk-faster-payments-chaps-bacs", "ch13": "chapters/ch13-correspondent-banking-and-nostro-vostro", "ch14": "chapters/ch14-serial-vs-cover-payments", "ch15": "chapters/ch15-charges-fx-and-gpi-tracking", "ch16": "chapters/ch16-cross-border-exceptions", "ch17": "chapters/ch17-clearing-concepts-and-netting", "ch18": "chapters/ch18-settlement-models", "ch19": "chapters/ch19-liquidity-management", "ch20": "chapters/ch20-settlement-risk", "ch21": "chapters/ch21-card-authorization-clearing-and-settlement", "ch22": "chapters/ch22-3d-secure-tokenization-and-chargebacks", "ch23": "chapters/ch23-sanctions-screening", "ch24": "chapters/ch24-aml-kyc-and-fraud-prevention", "ch25": "chapters/ch25-payment-hub-architecture", "ch26": "chapters/ch26-api-banking-and-open-banking", "ch27": "chapters/ch27-cbdcs-stablecoins-and-ai-in-payments", "ch28": "chapters/ch28-ba-practical-workshop", "ch29": "chapters/ch29-capstone-project", "ch30": "chapters/ch30-payment-gateway-architecture", "ch31": "chapters/ch31-card-networks-visa-and-mastercard", "ch32": "chapters/ch32-digital-wallets-and-pos-systems", "ch33": "chapters/ch33-indian-payments-deep-dive-nach-bbps-fema", "ch34": "chapters/ch34-recurring-payments-and-3ri", "ch35": "chapters/ch35-payment-platform-architecture-and-your-career", "ch36": "chapters/ch36-system-design-deep-dive", "ch37": "chapters/ch37-how-10-large-banks-do-payments", "ch38": "chapters/ch38-payment-data-model-and-mapping", "ch39": "chapters/ch39-complete-iso-20022-catalogue", "ch40": "chapters/ch40-payment-reconciliation", "ch41": "chapters/ch41-payment-exceptions-and-investigations", "ch42": "chapters/ch42-payment-testing-and-certification", "ch43": "chapters/ch43-payment-security", "ch44": "chapters/ch44-payment-operations", "ch45": "chapters/ch45-payment-product-management", "ch46": "chapters/ch46-real-time-payments-architecture", "ch47": "chapters/ch47-banking-integration-patterns", "ch48": "chapters/ch48-payment-hub-enterprise-architecture", "ch49": "chapters/ch49-standby-letter-of-credit", "ch50": "chapters/ch50-mt101-in-depth", "ch51": "chapters/ch51-documentary-collections-and-swift-category-4", "ch52": "chapters/ch52-swift-reporting-messages-deep-dive", "ch53": "chapters/ch53-mt103-optional-fields-deep-dive", "ch54": "chapters/ch54-swift-fundamentals", "ch55": "chapters/ch55-payments-in-2025-and-beyond", "ch56": "chapters/ch56-target-services-t2-t2s-and-tips", "ch57": "chapters/ch57-addressing-payments-in-t2", "ch58": "chapters/ch58-reject-and-return-in-cbpr", "ch59": "chapters/ch59-tips-in-depth-instant-payments-and-liquidity-transfers", "ch60": "chapters/ch60-pain-001-and-pain-002-in-depth", "ch61": "chapters/ch61-sepa-credit-transfer-deep-dive", "ch62": "chapters/ch62-sepa-direct-debit-deep-dive", "ch63": "chapters/ch63-card-payments-deep-dive", "ch64": "chapters/ch64-cheques-and-paper-instruments", "ch65": "chapters/ch65-open-banking-psd2-and-psd3", "ch66": "chapters/ch66-trade-finance-deep-dive", "ch67": "chapters/ch67-iso-20022-technical-implementation", "ch68": "chapters/ch68-payment-operations-architecture-state-resilience-and-control", "ch69": "chapters/ch69-what-money-is", "ch70": "chapters/ch70-accounts-and-balances", "ch71": "chapters/ch71-ledger-posting-and-reconciliation", "ch72": "chapters/ch72-lifecycle-timelines-and-failure-modes", "ch73": "chapters/ch73-claims-enquiries-and-case-management", "ch74": "chapters/ch74-global-instant-systems", "ch75": "chapters/ch75-cross-border-investigations", "ch76": "chapters/ch76-cash-management", "ch77": "chapters/ch77-settlement-design-and-failure", "ch78": "chapters/ch78-cards-compliance-and-acquiring", "ch79": "chapters/ch79-payment-engine-internals-and-observability", "ch80": "chapters/ch80-api-design-standards-and-integration-patterns", "ch81": "chapters/ch81-gdpr-bsa-aml-and-operational-resilience", "ch82": "chapters/ch82-product-strategy-and-business-models", "ch83": "chapters/ch83-scheme-onboarding-market-expansion-build-versus-buy", "ch84": "chapters/ch84-ba-practice-depth", "ch85": "chapters/ch85-embedded-finance-and-iso-20022-data-analytics", "ch86": "chapters/ch86-regulatory-compliance-in-payments", "ch87": "chapters/ch87-controls-that-keep-payments-safe", "ch88": "chapters/ch88-clearing-and-settlement-mechanisms", "ch89": "chapters/ch89-how-clearing-systems-work", "ch90": "chapters/ch90-ledger-systems-inside-banks", "ch91": "chapters/ch91-uk-payment-systems-in-depth", "ch92": "chapters/ch92-us-payment-systems-in-depth", "ch93": "chapters/ch93-sepa-in-depth", "ch94": "chapters/ch94-cross-border-payments-in-depth", "ch95": "chapters/ch95-screening-fraud-and-sanctions-operations-in-detail", "ch96": "chapters/ch96-ai-foundations-for-the-payments-ba-and-po", "ch97": "chapters/ch97-ai-assisted-ba-work", "ch98": "chapters/ch98-ai-product-ownership-for-payments", "ch99": "chapters/ch99-ai-governance-risk-and-control-in-payments", "ch100": "chapters/ch100-ai-in-payments-operations-and-capstone"};
var PA_BUNDLE_URL = {"part-1": "courses/bundle-part-1-foundations-of-money-and-payments", "part-2": "courses/bundle-part-2-how-payments-move", "part-3": "courses/bundle-part-3-messages-swift-mt-iso-20022-and-standards", "part-4": "courses/bundle-part-4-cross-border-payments-and-correspondent-banking", "part-5": "courses/bundle-part-5-clearing-settlement-liquidity-and-reconciliation", "part-6": "courses/bundle-part-6-exceptions-investigations-returns-and-claims", "part-7": "courses/bundle-part-7-cards-and-customer-payments", "part-8": "courses/bundle-part-8-architecture-apis-hubs-and-engineering", "part-9": "courses/bundle-part-9-the-business-analyst-at-work", "part-10": "courses/bundle-part-10-emerging-payments-and-the-future", "group-1": "courses/bundle-group-1-payments-foundations", "group-2": "courses/bundle-group-2-messages-and-cross-border-payments", "group-3": "courses/bundle-group-3-clearing-settlement-and-exceptions", "group-4": "courses/bundle-group-4-cards-architecture-and-engineering", "group-5": "courses/bundle-group-5-ba-at-work-and-emerging-payments", "studio": "courses/bundle-ba-po-studio", "simulator": "courses/bundle-payment-simulator", "investigation-lab": "courses/bundle-investigation-lab", "practice": "courses/bundle-practice-experiences", "interview": "courses/bundle-interview-ready", "integrated": "courses/bundle-the-integrated-course"};
function paRoot(){ var p = window.location.pathname.replace(/^\/+/,"");
  return (p.indexOf("/") >= 0) ? "../" : ""; }
function showHome(){ if(typeof pauseAllAudio === "function") pauseAllAudio();
  window.location.href = paRoot() || "/"; }
function openChapter(id){ if(typeof pauseAllAudio === "function") pauseAllAudio();
  var u = PA_CHAPTER_URL[id]; if(u) window.location.href = paRoot() + u; }
/* Access guard (7 Nov 2026, Phase 9): bundles.js wraps openChapter
   at load time, but this file redefines openChapter afterwards, which
   discarded the wrapper. Re-apply the guard here, on the definition
   that actually runs, so that if PA_ENFORCE_ACCESS is ever switched
   on, a locked chapter opens its bundle instead of the chapter.
   While enforcement is off, paHasAccess always returns true and
   this changes nothing. */
if(typeof paHasAccess === "function" && typeof showBundleForChapter === "function"){
  var __paNavOpenChapterOrig = openChapter;
  openChapter = function(id){ if(!paHasAccess(id)){ showBundleForChapter(id); return; } __paNavOpenChapterOrig(id); };
}
function goLesson(id){ if(typeof pauseAllAudio === "function") pauseAllAudio();
  window.location.href = paRoot() + "lessons/" + id; }
function goLessonAuto(id){ if(typeof pauseAllAudio === "function") pauseAllAudio();
  window.location.href = paRoot() + "lessons/" + id + "?autoplay=1"; }
function goChapterContents(chid){ if(typeof pauseAllAudio === "function") pauseAllAudio();
  var u = PA_CHAPTER_URL[chid]; if(u) window.location.href = paRoot() + u; }
function showCourses(){ if(typeof pauseAllAudio === "function") pauseAllAudio();
  window.location.href = paRoot() + "courses"; }
function showBundle(bid){ if(typeof pauseAllAudio === "function") pauseAllAudio();
  var u = PA_BUNDLE_URL[bid]; if(u) window.location.href = paRoot() + u; }
function enrolBundle(bid){ if(typeof pauseAllAudio === "function") pauseAllAudio();
  var dest = paRoot() + "payment?bundle=" + encodeURIComponent(bid);
  /* Buy-only sign-in prompt: a signed-out tap shows the prompt and
     returns here after sign-in instead of navigating straight to
     checkout. If the prompt module is absent, navigate as before;
     the checkout page gates its pay controls while signed out. */
  if(typeof paBuyPromptGuard === "function" && !paBuyPromptGuard(dest)) return;
  window.location.href = dest; }
/* Course rail progress (Nov 2026, Coursera-style sidebar): on a
   lesson page, read the completed lessons from localStorage, mark
   the done lessons in this chapter's list with a green check, and
   fill the Today's goal card. The studio tries to autoplay on
   every lesson open, so the ?autoplay=1 parameter documents intent
   rather than changing it. */
(function(){
  var list = document.querySelector(".course-rail .lesson-list");
  if(!list) return;
  var done = {};
  try { var p = JSON.parse(localStorage.getItem("payments-academy-progress-v1"));
    if(p && p.lessons) done = p.lessons; } catch(e){}
  var items = list.querySelectorAll("li[data-lesson]");
  var n = 0;
  items.forEach(function(li){
    if(done[li.getAttribute("data-lesson")]){ li.classList.add("done"); n++; }
  });
  var txt = document.getElementById("side-progress-text");
  if(txt) txt.textContent = n > 0 ? (n + " of " + items.length + " items") : "Your progress in this chapter will show here.";
  var body = document.getElementById("side-goal-body");
  if(body){
    var left = items.length - n;
    if(left <= 0){ body.textContent = "You are all caught up for today!"; }
    else { var k = Math.min(3, left);
      body.textContent = "Complete " + k + " item" + (k > 1 ? "s" : "") + " today to stay at a good pace!"; }
  }
})();
