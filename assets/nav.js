/* ===== Multi-page navigation (5 Nov 2026) ===== */
/* Overrides the single-page navigation in site.js / studio.js /
   bundles.js with real page loads. Every page links to real
   files; there are no hidden views and no dead ends. */
var PA_CHAPTER_URL = {"ch1": "chapters/ch1-what-is-a-payment.html", "ch2": "chapters/ch2-payment-instruments-and-types.html", "ch3": "chapters/ch3-the-payment-ecosystem.html", "ch4": "chapters/ch4-payment-lifecycle-end-to-end.html", "ch5": "chapters/ch5-swift-mt-messages.html", "ch6": "chapters/ch6-iso-20022-fundamentals.html", "ch7": "chapters/ch7-pacs-008-deep-dive.html", "ch8": "chapters/ch8-mt-to-mx-migration-and-cbpr.html", "ch9": "chapters/ch9-india-upi-imps-neft-rtgs.html", "ch10": "chapters/ch10-us-fedwire-fednow-ach-chips.html", "ch11": "chapters/ch11-europe-sepa-and-t2.html", "ch12": "chapters/ch12-uk-faster-payments-chaps-bacs.html", "ch13": "chapters/ch13-correspondent-banking-and-nostro-vostro.html", "ch14": "chapters/ch14-serial-vs-cover-payments.html", "ch15": "chapters/ch15-charges-fx-and-gpi-tracking.html", "ch16": "chapters/ch16-cross-border-exceptions.html", "ch17": "chapters/ch17-clearing-concepts-and-netting.html", "ch18": "chapters/ch18-settlement-models.html", "ch19": "chapters/ch19-liquidity-management.html", "ch20": "chapters/ch20-settlement-risk.html", "ch21": "chapters/ch21-card-authorization-clearing-and-settlement.html", "ch22": "chapters/ch22-3d-secure-tokenization-and-chargebacks.html", "ch23": "chapters/ch23-sanctions-screening.html", "ch24": "chapters/ch24-aml-kyc-and-fraud-prevention.html", "ch25": "chapters/ch25-payment-hub-architecture.html", "ch26": "chapters/ch26-api-banking-and-open-banking.html", "ch27": "chapters/ch27-cbdcs-stablecoins-and-ai-in-payments.html", "ch28": "chapters/ch28-ba-practical-workshop.html", "ch29": "chapters/ch29-capstone-project.html", "ch30": "chapters/ch30-payment-gateway-architecture.html", "ch31": "chapters/ch31-card-networks-visa-and-mastercard.html", "ch32": "chapters/ch32-digital-wallets-and-pos-systems.html", "ch33": "chapters/ch33-indian-payments-deep-dive-nach-bbps-fema.html", "ch34": "chapters/ch34-recurring-payments-and-3ri.html", "ch35": "chapters/ch35-payment-platform-architecture-and-your-career.html", "ch36": "chapters/ch36-system-design-deep-dive.html", "ch37": "chapters/ch37-how-10-large-banks-do-payments.html", "ch38": "chapters/ch38-payment-data-model-and-mapping.html", "ch39": "chapters/ch39-complete-iso-20022-catalogue.html", "ch40": "chapters/ch40-payment-reconciliation.html", "ch41": "chapters/ch41-payment-exceptions-and-investigations.html", "ch42": "chapters/ch42-payment-testing-and-certification.html", "ch43": "chapters/ch43-payment-security.html", "ch44": "chapters/ch44-payment-operations.html", "ch45": "chapters/ch45-payment-product-management.html", "ch46": "chapters/ch46-real-time-payments-architecture.html", "ch47": "chapters/ch47-banking-integration-patterns.html", "ch48": "chapters/ch48-payment-hub-enterprise-architecture.html", "ch49": "chapters/ch49-standby-letter-of-credit.html", "ch50": "chapters/ch50-mt101-in-depth.html", "ch51": "chapters/ch51-documentary-collections-and-swift-category-4.html", "ch52": "chapters/ch52-swift-reporting-messages-deep-dive.html", "ch53": "chapters/ch53-mt103-optional-fields-deep-dive.html", "ch54": "chapters/ch54-swift-fundamentals.html", "ch55": "chapters/ch55-payments-in-2025-and-beyond.html", "ch56": "chapters/ch56-target-services-t2-t2s-and-tips.html", "ch57": "chapters/ch57-addressing-payments-in-t2.html", "ch58": "chapters/ch58-reject-and-return-in-cbpr.html", "ch59": "chapters/ch59-tips-in-depth-instant-payments-and-liquidity-transfers.html", "ch60": "chapters/ch60-pain-001-and-pain-002-in-depth.html", "ch61": "chapters/ch61-sepa-credit-transfer-deep-dive.html", "ch62": "chapters/ch62-sepa-direct-debit-deep-dive.html", "ch63": "chapters/ch63-card-payments-deep-dive.html", "ch64": "chapters/ch64-cheques-and-paper-instruments.html", "ch65": "chapters/ch65-open-banking-psd2-and-psd3.html", "ch66": "chapters/ch66-trade-finance-deep-dive.html", "ch67": "chapters/ch67-iso-20022-technical-implementation.html", "ch68": "chapters/ch68-payment-operations-architecture-state-resilience-and-control.html", "ch69": "chapters/ch69-what-money-is.html", "ch70": "chapters/ch70-accounts-and-balances.html", "ch71": "chapters/ch71-ledger-posting-and-reconciliation.html", "ch72": "chapters/ch72-lifecycle-timelines-and-failure-modes.html", "ch73": "chapters/ch73-claims-enquiries-and-case-management.html", "ch74": "chapters/ch74-global-instant-systems.html", "ch75": "chapters/ch75-cross-border-investigations.html", "ch76": "chapters/ch76-cash-management.html", "ch77": "chapters/ch77-settlement-design-and-failure.html", "ch78": "chapters/ch78-cards-compliance-and-acquiring.html", "ch79": "chapters/ch79-payment-engine-internals-and-observability.html", "ch80": "chapters/ch80-api-design-standards-and-integration-patterns.html", "ch81": "chapters/ch81-gdpr-bsa-aml-and-operational-resilience.html", "ch82": "chapters/ch82-product-strategy-and-business-models.html", "ch83": "chapters/ch83-scheme-onboarding-market-expansion-build-versus-buy.html", "ch84": "chapters/ch84-ba-practice-depth.html", "ch85": "chapters/ch85-embedded-finance-and-iso-20022-data-analytics.html", "ch86": "chapters/ch86-regulatory-compliance-in-payments.html", "ch87": "chapters/ch87-controls-that-keep-payments-safe.html", "ch88": "chapters/ch88-clearing-and-settlement-mechanisms.html", "ch89": "chapters/ch89-how-clearing-systems-work.html", "ch90": "chapters/ch90-ledger-systems-inside-banks.html", "ch91": "chapters/ch91-uk-payment-systems-in-depth.html", "ch92": "chapters/ch92-us-payment-systems-in-depth.html", "ch93": "chapters/ch93-sepa-in-depth.html", "ch94": "chapters/ch94-cross-border-payments-in-depth.html", "ch95": "chapters/ch95-screening-fraud-and-sanctions-operations-in-detail.html", "ch96": "chapters/ch96-ai-foundations-for-the-payments-ba-and-po.html", "ch97": "chapters/ch97-ai-assisted-ba-work.html", "ch98": "chapters/ch98-ai-product-ownership-for-payments.html", "ch99": "chapters/ch99-ai-governance-risk-and-control-in-payments.html", "ch100": "chapters/ch100-ai-in-payments-operations-and-capstone.html"};
var PA_BUNDLE_URL = {"part-1": "courses/bundle-part-1-foundations-of-money-and-payments.html", "part-2": "courses/bundle-part-2-how-payments-move.html", "part-3": "courses/bundle-part-3-messages-swift-mt-iso-20022-and-standards.html", "part-4": "courses/bundle-part-4-cross-border-payments-and-correspondent-banking.html", "part-5": "courses/bundle-part-5-clearing-settlement-liquidity-and-reconciliation.html", "part-6": "courses/bundle-part-6-exceptions-investigations-returns-and-claims.html", "part-7": "courses/bundle-part-7-cards-and-customer-payments.html", "part-8": "courses/bundle-part-8-architecture-apis-hubs-and-engineering.html", "part-9": "courses/bundle-part-9-the-business-analyst-at-work.html", "part-10": "courses/bundle-part-10-emerging-payments-and-the-future.html", "studio": "courses/bundle-ba-po-studio.html", "simulator": "courses/bundle-payment-simulator.html", "investigation-lab": "courses/bundle-investigation-lab.html", "practice": "courses/bundle-practice-experiences.html", "interview": "courses/bundle-interview-ready.html", "integrated": "courses/bundle-the-integrated-course.html"};
function paRoot(){ var p = window.location.pathname.replace(/^\/+/,"");
  return (p.indexOf("/") >= 0) ? "../" : ""; }
function showHome(){ if(typeof pauseAllAudio === "function") pauseAllAudio();
  window.location.href = paRoot() + "index.html"; }
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
  window.location.href = paRoot() + "lessons/" + id + ".html"; }
function goLessonAuto(id){ if(typeof pauseAllAudio === "function") pauseAllAudio();
  window.location.href = paRoot() + "lessons/" + id + ".html?autoplay=1"; }
function goChapterContents(chid){ if(typeof pauseAllAudio === "function") pauseAllAudio();
  var u = PA_CHAPTER_URL[chid]; if(u) window.location.href = paRoot() + u; }
function showCourses(){ if(typeof pauseAllAudio === "function") pauseAllAudio();
  window.location.href = paRoot() + "courses.html"; }
function showBundle(bid){ if(typeof pauseAllAudio === "function") pauseAllAudio();
  var u = PA_BUNDLE_URL[bid]; if(u) window.location.href = paRoot() + u; }
function enrolBundle(bid){ if(typeof pauseAllAudio === "function") pauseAllAudio();
  var dest = paRoot() + "payment.html?bundle=" + encodeURIComponent(bid);
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
