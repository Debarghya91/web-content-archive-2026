/* Payments Training Hub test engine. Plain JavaScript, no dependencies.
   Used by every test page and by the diagnostic (placement) test page.
   Each page supplies a TEST_DATA block and calls paStartTest.
   No em dashes are used in any user-facing string in this file.
   Storage keys:
     tests:       payments-academy-tests-v1
     diagnostic:  payments-academy-diagnostic-v1
     lessons:     payments-academy-progress-v1 (read only, never written here)
*/
(function (root) {
  "use strict";

  var TESTS_KEY = "payments-academy-tests-v1";
  var DIAGNOSTIC_KEY = "payments-academy-diagnostic-v1";
  var PROGRESS_KEY = "payments-academy-progress-v1";
  var PASS_MARK = 80;

  /* ---------- small helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function pct(correct, total) {
    if (!total) return 0;
    return Math.round((correct / total) * 100);
  }
  function formatTime(totalSeconds) {
    var s = Math.max(0, totalSeconds);
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? "0" + m : "" + m) + ":" + (r < 10 ? "0" + r : "" + r);
  }
  function safeStore(storage) {
    if (storage) return storage;
    try {
      if (typeof root.localStorage !== "undefined" && root.localStorage) return root.localStorage;
    } catch (e) { /* storage unavailable */ }
    var mem = {};
    return {
      getItem: function (k) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; },
      setItem: function (k, v) { mem[k] = String(v); },
      removeItem: function (k) { delete mem[k]; }
    };
  }
  function readJson(storage, key) {
    try {
      var raw = storage.getItem(key);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
      return null;
    } catch (e) { return null; }
  }
  function isEmptyProgress(value) {
    if (!value) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") {
      if (Array.isArray(value.completed)) return value.completed.length === 0;
      if (typeof value.completedCount === "number") return value.completedCount === 0;
      return Object.keys(value).length === 0;
    }
    return false;
  }

  /* ---------- diagnostic recommendation ---------- */
  var AREA_BUNDLE = {
    "foundations": { bundle_id: "foundations", bundle_name: "Payment Foundations" },
    "messaging": { bundle_id: "messaging", bundle_name: "ISO 20022 and SWIFT Messaging" },
    "rails": { bundle_id: "rails", bundle_name: "Global Payment Rails" },
    "crossborder": { bundle_id: "crossborder", bundle_name: "Cross-Border and Correspondent Banking" },
    "clearing": { bundle_id: "clearing", bundle_name: "Clearing, Settlement and Liquidity" },
    "cards": { bundle_id: "cards", bundle_name: "Cards and Domestic Payments" },
    "compliance": { bundle_id: "compliance-ops", bundle_name: "Compliance, Risk, Operations and Reconciliation" },
    "architecture-apis": { bundle_id: "architecture-apis", bundle_name: "Payment Architecture and APIs" },
    "ba-practice": { bundle_id: "ba-practice", bundle_name: "AI Product Owner and Product Manager for Payments" }
  };

  /* ---------- competency feedback (10/10 plan, Priority 1) ----------
     Chapter, domain and practice data below are copied from the real
     source data: chapter titles and first-lesson headings from
     content/part*.json, chapter page files from dist/chapters, domain
     names from content/test-series.json, practice links from the real
     simulator, lab and practice pages in dist. The acceptance suite
     (scripts/test-acceptance.js) re-checks every entry against those
     sources, so a stale entry fails the build check instead of
     reaching a learner. No em dashes are used in any string here. */
  var CHAPTER_INFO = {
  "ch1": { t: "What is a Payment", s: "ch1-what-is-a-payment.html", n: 7, l: "A payment, in plain words" },
  "ch2": { t: "Payment Instruments and Types", s: "ch2-payment-instruments-and-types.html", n: 7, l: "Credit transfers, the default business payment" },
  "ch3": { t: "The Payment Ecosystem", s: "ch3-the-payment-ecosystem.html", n: 8, l: "Debtor and creditor, the two ends of every payment" },
  "ch4": { t: "Payment Lifecycle End to End", s: "ch4-payment-lifecycle-end-to-end.html", n: 9, l: "Initiation, where every payment begins" },
  "ch5": { t: "SWIFT MT Messages", s: "ch5-swift-mt-messages.html", n: 13, l: "What SWIFT MT is, and why it lasted so long" },
  "ch6": { t: "ISO 20022 Fundamentals", s: "ch6-iso-20022-fundamentals.html", n: 10, l: "What ISO 20022 is" },
  "ch7": { t: "pacs.008 Deep Dive", s: "ch7-pacs-008-deep-dive.html", n: 8, l: "What pacs.008 is, and when it is used" },
  "ch8": { t: "MT to MX Migration and CBPR+", s: "ch8-mt-to-mx-migration-and-cbpr.html", n: 10, l: "Why migration was needed, and how coexistence ended" },
  "ch9": { t: "India: UPI, IMPS, NEFT, RTGS", s: "ch9-india-upi-imps-neft-rtgs.html", n: 9, l: "The Indian payments landscape at a glance" },
  "ch10": { t: "US: Fedwire, FedNow, ACH, CHIPS", s: "ch10-us-fedwire-fednow-ach-chips.html", n: 11, l: "The US payments landscape at a glance" },
  "ch11": { t: "Europe: SEPA and T2", s: "ch11-europe-sepa-and-t2.html", n: 11, l: "What SEPA is and why it was created" },
  "ch12": { t: "UK: Faster Payments, CHAPS, BACS", s: "ch12-uk-faster-payments-chaps-bacs.html", n: 7, l: "The UK payments landscape at a glance" },
  "ch13": { t: "Correspondent Banking and Nostro Vostro", s: "ch13-correspondent-banking-and-nostro-vostro.html", n: 11, l: "What correspondent banking is" },
  "ch14": { t: "Serial vs Cover Payments", s: "ch14-serial-vs-cover-payments.html", n: 7, l: "Why there are two methods" },
  "ch15": { t: "Charges, FX and gpi Tracking", s: "ch15-charges-fx-and-gpi-tracking.html", n: 8, l: "OUR, SHA and BEN: who pays the charges" },
  "ch16": { t: "Cross-Border Exceptions", s: "ch16-cross-border-exceptions.html", n: 7, l: "Why cross border payments fail" },
  "ch17": { t: "Clearing Concepts and Netting", s: "ch17-clearing-concepts-and-netting.html", n: 10, l: "What Clearing Really Means" },
  "ch18": { t: "Settlement Models", s: "ch18-settlement-models.html", n: 7, l: "What Settlement Means After Clearing" },
  "ch19": { t: "Liquidity Management", s: "ch19-liquidity-management.html", n: 7, l: "Why Liquidity Is the Lifeblood of Settlement" },
  "ch20": { t: "Settlement Risk", s: "ch20-settlement-risk.html", n: 8, l: "What Settlement Risk Really Is" },
  "ch21": { t: "Card Authorization, Clearing and Settlement", s: "ch21-card-authorization-clearing-and-settlement.html", n: 8, l: "The Four Parties and the Card Transaction" },
  "ch22": { t: "3D Secure, Tokenization and Chargebacks", s: "ch22-3d-secure-tokenization-and-chargebacks.html", n: 7, l: "Why Card Payments Need Extra Protection" },
  "ch23": { t: "Sanctions Screening", s: "ch23-sanctions-screening.html", n: 7, l: "Why Sanctions Exist" },
  "ch24": { t: "AML, KYC and Fraud Prevention", s: "ch24-aml-kyc-and-fraud-prevention.html", n: 8, l: "What Money Laundering Really Looks Like" },
  "ch25": { t: "Payment Hub Architecture", s: "ch25-payment-hub-architecture.html", n: 8, l: "What a Payment Hub Is and Why Banks Build One" },
  "ch26": { t: "API Banking and Open Banking", s: "ch26-api-banking-and-open-banking.html", n: 9, l: "From Files and SWIFT to Real Time APIs" },
  "ch27": { t: "CBDCs, Stablecoins and AI in Payments", s: "ch27-cbdcs-stablecoins-and-ai-in-payments.html", n: 9, l: "Central Bank Digital Currencies" },
  "ch28": { t: "BA Practical Workshop", s: "ch28-ba-practical-workshop.html", n: 7, l: "Requirements Gathering for Payments Projects" },
  "ch29": { t: "Capstone Project", s: "ch29-capstone-project.html", n: 9, l: "Capstone Brief: BA on a SWIFT MT to ISO 20022 Migration" },
  "ch30": { t: "Payment Gateway Architecture", s: "ch30-payment-gateway-architecture.html", n: 7, l: "What a Payment Gateway Does" },
  "ch31": { t: "Card Networks: Visa and Mastercard", s: "ch31-card-networks-visa-and-mastercard.html", n: 8, l: "Card Network Roles" },
  "ch32": { t: "Digital Wallets and POS Systems", s: "ch32-digital-wallets-and-pos-systems.html", n: 7, l: "Digital Wallet Architecture: Where the Money Actually Sits" },
  "ch33": { t: "Indian Payments Deep Dive: NACH, BBPS, FEMA", s: "ch33-indian-payments-deep-dive-nach-bbps-fema.html", n: 9, l: "NACH Mandate Processing in Depth: From Creation to Activation" },
  "ch34": { t: "Recurring Payments and 3RI", s: "ch34-recurring-payments-and-3ri.html", n: 7, l: "Recurring Payments Explained" },
  "ch35": { t: "Payment Platform Architecture and Your Career", s: "ch35-payment-platform-architecture-and-your-career.html", n: 7, l: "End-to-End Payment Platform Design" },
  "ch36": { t: "System Design Deep Dive", s: "ch36-system-design-deep-dive.html", n: 7, l: "Payment Hub Architecture Inside a Bank" },
  "ch37": { t: "How 10 Large Banks Do Payments", s: "ch37-how-10-large-banks-do-payments.html", n: 7, l: "JPMorgan Chase and Citibank" },
  "ch38": { t: "Payment Data Model and Mapping", s: "ch38-payment-data-model-and-mapping.html", n: 7, l: "Why Banks Need a Canonical Payment Model" },
  "ch39": { t: "Complete ISO 20022 Catalogue", s: "ch39-complete-iso-20022-catalogue.html", n: 8, l: "The Catalogue at a Glance: pain, pacs, camt, admi and head" },
  "ch40": { t: "Payment Reconciliation", s: "ch40-payment-reconciliation.html", n: 7, l: "Why Reconciliation Is the Last Line of Defence" },
  "ch41": { t: "Payment Exceptions and Investigations", s: "ch41-payment-exceptions-and-investigations.html", n: 7, l: "The Exception Landscape: What Can Go Wrong" },
  "ch42": { t: "Payment Testing and Certification", s: "ch42-payment-testing-and-certification.html", n: 7, l: "Why Payment Testing Is Different" },
  "ch43": { t: "Payment Security", s: "ch43-payment-security.html", n: 8, l: "The Threat Model for Payment Systems" },
  "ch44": { t: "Payment Operations", s: "ch44-payment-operations.html", n: 7, l: "A Day in Payment Operations" },
  "ch45": { t: "Payment Product Management", s: "ch45-payment-product-management.html", n: 7, l: "What a Payment Product Manager Actually Does" },
  "ch46": { t: "Real-Time Payments Architecture", s: "ch46-real-time-payments-architecture.html", n: 8, l: "What Real-Time Really Means" },
  "ch47": { t: "Banking Integration Patterns", s: "ch47-banking-integration-patterns.html", n: 10, l: "The Integration Landscape Inside a Bank" },
  "ch48": { t: "Payment Hub: Enterprise Architecture", s: "ch48-payment-hub-enterprise-architecture.html", n: 10, l: "Hub components: what a hub is and what it contains" },
  "ch49": { t: "Standby Letter of Credit", s: "ch49-standby-letter-of-credit.html", n: 7, l: "What a Standby Letter of Credit Is" },
  "ch50": { t: "MT101 in Depth", s: "ch50-mt101-in-depth.html", n: 7, l: "What MT101 Is and When Corporations Use It" },
  "ch51": { t: "Documentary Collections and SWIFT Category 4", s: "ch51-documentary-collections-and-swift-category-4.html", n: 7, l: "What a Documentary Collection Is" },
  "ch52": { t: "SWIFT Reporting Messages Deep Dive", s: "ch52-swift-reporting-messages-deep-dive.html", n: 8, l: "Why Reporting Messages Matter" },
  "ch53": { t: "MT103 Optional Fields Deep Dive", s: "ch53-mt103-optional-fields-deep-dive.html", n: 7, l: "A Basic MT103 Decrypted: Mandatory Fields Only" },
  "ch54": { t: "SWIFT Fundamentals", s: "ch54-swift-fundamentals.html", n: 10, l: "What SWIFT Is and What It Is Not" },
  "ch55": { t: "Payments in 2025 and Beyond", s: "ch55-payments-in-2025-and-beyond.html", n: 7, l: "ISO 20022 and One Leg Out: What Changes Next" },
  "ch56": { t: "TARGET Services: T2, T2S and TIPS", s: "ch56-target-services-t2-t2s-and-tips.html", n: 7, l: "TARGET2 Does Not Exist Anymore: What Went Live on 20 March 2023" },
  "ch57": { t: "Addressing Payments in T2", s: "ch57-addressing-payments-in-t2.html", n: 7, l: "How Addressing Works in the RTGS Component of T2" },
  "ch58": { t: "Reject and Return in CBPR+", s: "ch58-reject-and-return-in-cbpr.html", n: 7, l: "Reject vs Return: The One Rule That Decides" },
  "ch59": { t: "TIPS in Depth: Instant Payments and Liquidity Transfers", s: "ch59-tips-in-depth-instant-payments-and-liquidity-transfers.html", n: 8, l: "What TIPS Is and How It Fits TARGET Services" },
  "ch60": { t: "pain.001 and pain.002 in Depth", s: "ch60-pain-001-and-pain-002-in-depth.html", n: 9, l: "pain.001.001.09 Customer Credit Transfer Initiation: What It Is and What It Carries" },
  "ch61": { t: "SEPA Credit Transfer Deep Dive", s: "ch61-sepa-credit-transfer-deep-dive.html", n: 7, l: "The Four-Corner SCT Model and the EUR 48,250 Worked Example" },
  "ch62": { t: "SEPA Direct Debit Deep Dive", s: "ch62-sepa-direct-debit-deep-dive.html", n: 7, l: "SDD Core and B2B: Two Schemes, Two Risk Profiles" },
  "ch63": { t: "Card Payments Deep Dive", s: "ch63-card-payments-deep-dive.html", n: 7, l: "Types of Payment Cards and Their Services" },
  "ch64": { t: "Cheques and Paper Instruments", s: "ch64-cheques-and-paper-instruments.html", n: 7, l: "What a Cheque Is and Why Cheques Still Exist" },
  "ch65": { t: "Open Banking, PSD2 and PSD3", s: "ch65-open-banking-psd2-and-psd3.html", n: 7, l: "What Open Banking Is and Why Regulators Forced It" },
  "ch66": { t: "Trade Finance Deep Dive", s: "ch66-trade-finance-deep-dive.html", n: 7, l: "Trade Finance Basics: Why Exporters and Importers Need Banks" },
  "ch67": { t: "ISO 20022 Technical Implementation", s: "ch67-iso-20022-technical-implementation.html", n: 8, l: "Reading an ISO 20022 Schema: XSD Patterns" },
  "ch68": { t: "Payment Operations Architecture: State, Resilience and Control", s: "ch68-payment-operations-architecture-state-resilience-and-control.html", n: 8, l: "Payment State Machines and Correlation" },
  "ch69": { t: "What money is", s: "ch69-what-money-is.html", n: 6, l: "Functions of money" },
  "ch70": { t: "Accounts and balances", s: "ch70-accounts-and-balances.html", n: 4, l: "Account taxonomy: current, savings, nostro, vostro, suspense, settlement, clearing, transit and wash" },
  "ch71": { t: "Ledger, posting and reconciliation", s: "ch71-ledger-posting-and-reconciliation.html", n: 7, l: "Double-entry bookkeeping" },
  "ch72": { t: "Lifecycle timelines and failure modes", s: "ch72-lifecycle-timelines-and-failure-modes.html", n: 5, l: "Minute-by-minute timeline for one instant payment" },
  "ch73": { t: "Claims, enquiries and case management", s: "ch73-claims-enquiries-and-case-management.html", n: 11, l: "admi messages: the administration layer of ISO 20022" },
  "ch74": { t: "Global instant systems", s: "ch74-global-instant-systems.html", n: 13, l: "NPP: Australia instant payments and PayID" },
  "ch75": { t: "Cross-border investigations", s: "ch75-cross-border-investigations.html", n: 10, l: "Investigation: the missing MT103" },
  "ch76": { t: "Cash management", s: "ch76-cash-management.html", n: 7, l: "Cash management services: what a bank offers a corporate treasurer" },
  "ch77": { t: "Settlement design and failure", s: "ch77-settlement-design-and-failure.html", n: 8, l: "Settlement cycle design: choosing when and how often to settle" },
  "ch78": { t: "Cards compliance and acquiring", s: "ch78-cards-compliance-and-acquiring.html", n: 8, l: "EMV chip and ARQC: how a chip card proves it is genuine" },
  "ch79": { t: "Payment engine internals and observability", s: "ch79-payment-engine-internals-and-observability.html", n: 7, l: "Payment engine modules: the anatomy of an engine" },
  "ch80": { t: "API design standards and integration patterns", s: "ch80-api-design-standards-and-integration-patterns.html", n: 7, l: "API versioning and lifecycle: how to change an API without breaking clients" },
  "ch81": { t: "GDPR, BSA/AML and operational resilience", s: "ch81-gdpr-bsa-aml-and-operational-resilience.html", n: 7, l: "GDPR and payment data: what counts as personal data in a payment" },
  "ch82": { t: "Product strategy and business models", s: "ch82-product-strategy-and-business-models.html", n: 7, l: "Payment product strategy: choosing who you serve and how you win" },
  "ch83": { t: "Scheme onboarding, market expansion, build versus buy", s: "ch83-scheme-onboarding-market-expansion-build-versus-buy.html", n: 7, l: "Joining a payment scheme: membership, adherence and the application" },
  "ch84": { t: "BA practice depth", s: "ch84-ba-practice-depth.html", n: 8, l: "Requirements gathering for payments: workshops, elicitation and the domain language" },
  "ch85": { t: "Embedded finance and ISO 20022 data analytics", s: "ch85-embedded-finance-and-iso-20022-data-analytics.html", n: 7, l: "Embedded finance: payments inside another company's product" },
  "ch86": { t: "Regulatory compliance in payments", s: "ch86-regulatory-compliance-in-payments.html", n: 7, l: "PSD2 vs PSD3 vs the Payment Services Regulation: what changes and when" },
  "ch87": { t: "Controls that keep payments safe", s: "ch87-controls-that-keep-payments-safe.html", n: 7, l: "Fraud typologies in payments: APP scams, mule accounts and business email compromise" },
  "ch88": { t: "Clearing and settlement mechanisms", s: "ch88-clearing-and-settlement-mechanisms.html", n: 6, l: "What a clearing and settlement mechanism is, and where it sits between banks and schemes" },
  "ch89": { t: "How clearing systems work", s: "ch89-how-clearing-systems-work.html", n: 6, l: "Netting versus gross settlement: bilateral and multilateral netting with worked numbers" },
  "ch90": { t: "Ledger systems inside banks", s: "ch90-ledger-systems-inside-banks.html", n: 8, l: "The core banking ledger, the chart of accounts and double entry" },
  "ch91": { t: "UK payment systems in depth", s: "ch91-uk-payment-systems-in-depth.html", n: 7, l: "BACS in depth: Direct Debit, Direct Credit and the three-day cycle" },
  "ch92": { t: "US payment systems in depth", s: "ch92-us-payment-systems-in-depth.html", n: 7, l: "Fedwire in depth: real-time gross settlement, the Federal Reserve and daylight overdraft" },
  "ch93": { t: "SEPA in depth", s: "ch93-sepa-in-depth.html", n: 7, l: "SCT in depth: the credit transfer scheme, timelines, execution and the rulebook" },
  "ch94": { t: "Cross-border payments in depth", s: "ch94-cross-border-payments-in-depth.html", n: 8, l: "Correspondent banking in depth: how the network really works" },
  "ch95": { t: "Screening, fraud and sanctions operations in detail", s: "ch95-screening-fraud-and-sanctions-operations-in-detail.html", n: 9, l: "AML screening in detail: name screening, transaction screening and false positives" },
  };
  /* Book numbers (15 Nov 2026, display numbering): sequential
     display numbers from the reading-order map. ch37 has no
     book number (null) and sorts last in revision lists.
     Regenerated by reshuffle-1115/patches/refresh_tests_chapter_info.py;
     never hand-edit. */
  var BOOK_NUMBER = {
  "ch1": 1,
  "ch2": 2,
  "ch3": 3,
  "ch4": 4,
  "ch5": 22,
  "ch6": 23,
  "ch7": 24,
  "ch8": 25,
  "ch9": 8,
  "ch10": 9,
  "ch11": 10,
  "ch12": 11,
  "ch13": 36,
  "ch14": 37,
  "ch15": 38,
  "ch16": 39,
  "ch17": 44,
  "ch18": 45,
  "ch19": 49,
  "ch20": 50,
  "ch21": 46,
  "ch22": 68,
  "ch23": 58,
  "ch24": 59,
  "ch25": 73,
  "ch26": 74,
  "ch27": 98,
  "ch28": 87,
  "ch29": 92,
  "ch30": 75,
  "ch31": 69,
  "ch32": 70,
  "ch33": 12,
  "ch34": 71,
  "ch35": 76,
  "ch36": 77,
  "ch37": null,
  "ch38": 26,
  "ch39": 28,
  "ch40": 51,
  "ch41": 60,
  "ch42": 78,
  "ch43": 79,
  "ch44": 52,
  "ch45": 88,
  "ch46": 80,
  "ch47": 81,
  "ch48": 82,
  "ch49": 41,
  "ch50": 29,
  "ch51": 30,
  "ch52": 31,
  "ch53": 32,
  "ch54": 27,
  "ch55": 97,
  "ch56": 13,
  "ch57": 14,
  "ch58": 33,
  "ch59": 15,
  "ch60": 34,
  "ch61": 16,
  "ch62": 17,
  "ch63": 72,
  "ch64": 5,
  "ch65": 83,
  "ch66": 42,
  "ch67": 35,
  "ch68": 85,
  "ch69": 6,
  "ch70": 7,
  "ch71": 47,
  "ch72": 57,
  "ch73": 64,
  "ch74": 18,
  "ch75": 43,
  "ch76": 53,
  "ch77": 54,
  "ch78": 65,
  "ch79": 86,
  "ch80": 84,
  "ch81": 66,
  "ch82": 89,
  "ch83": 90,
  "ch84": 91,
  "ch85": 99,
  "ch86": 61,
  "ch87": 62,
  "ch88": 55,
  "ch89": 56,
  "ch90": 48,
  "ch91": 19,
  "ch92": 20,
  "ch93": 21,
  "ch94": 40,
  "ch95": 63,
  "ch96": 93,
  "ch97": 94,
  "ch98": 95,
  "ch99": 67,
  "ch100": 96
  };
  function bookNumber(chapterId) {
    var b = BOOK_NUMBER[chapterId];
    return (typeof b === 'number') ? b : 9999;
  }
  var DOMAIN_INFO = {
    "foundations": { name: "Payment Foundations" },
    "messaging": { name: "Payment Messaging" },
    "rails": { name: "Global Payment Rails" },
    "crossborder": { name: "Cross-Border Payments" },
    "clearing": { name: "Clearing and Settlement" },
    "cards": { name: "Card Payments" },
    "compliance": { name: "Compliance and Risk" },
    "architecture": { name: "Payment Architecture" },
    "apis": { name: "APIs and Integration" },
    "operations": { name: "Payment Operations" },
    "emerging": { name: "Emerging Technologies" },
    "professional": { name: "Professional Masterclass" }
  };
  var DOMAIN_PRACTICE = {
    "foundations": [
      { label: "Payment Lifecycle Simulator", url: "simulators/lifecycle.html" },
      { label: "Payment State Machine Simulator", url: "simulators/state-machine.html" },
      { label: "Scenario Simulator", url: "simulators/scenario.html" }
    ],
    "messaging": [
      { label: "ISO 20022 Message Explorer", url: "simulators/message-explorer.html" },
      { label: "ISO 20022 Message and Mapping Lab", url: "iso-lab.html" },
      { label: "LAB-03: Map MT103 to pacs.008 for a Migration", url: "labs/lab-03.html" },
      { label: "ISO 20022 Mapping Workbench", url: "mapping-workbench.html" }
    ],
    "rails": [
      { label: "T2 and TIPS Simulator", url: "simulators/t2-tips.html" },
      { label: "Payment Lifecycle Simulator", url: "simulators/lifecycle.html" }
    ],
    "crossborder": [
      { label: "Cross-Border Payment Configurator", url: "simulators/cross-border.html" },
      { label: "FLOW-01: Deliver a Cross-Border Correspondent Payment in US Dollars", url: "labs/flow-01.html" },
      { label: "Payment Failure Investigation Lab", url: "investigation-lab.html" }
    ],
    "clearing": [
      { label: "Payment Accounting Simulator", url: "simulators/accounting.html" },
      { label: "FLOW-04: Reconcile Payments Across Messages, Statements, and Ledger", url: "labs/flow-04.html" }
    ],
    "cards": [
      { label: "FLOW-03: Deliver a Card Payment from Authorisation to Dispute", url: "labs/flow-03.html" },
      { label: "Scenario Simulator", url: "simulators/scenario.html" }
    ],
    "compliance": [
      { label: "Payment Exception Investigation Simulator", url: "simulators/exception.html" },
      { label: "Payment Failure Investigation Lab", url: "investigation-lab.html" }
    ],
    "architecture": [
      { label: "Payment Hub Architecture Simulator", url: "simulators/hub.html" },
      { label: "LAB-06: Write a UAT Plan for a Payment Hub Go-Live", url: "labs/lab-06.html" }
    ],
    "apis": [
      { label: "API Playground", url: "simulators/api-playground.html" },
      { label: "LAB-04: Specify a Payment Initiation API for a Corporate Channel", url: "labs/lab-04.html" }
    ],
    "operations": [
      { label: "Reconciliation War Room", url: "reconciliation-war-room.html" },
      { label: "Payment Exception Investigation Simulator", url: "simulators/exception.html" },
      { label: "Mission Control", url: "mission-control.html" }
    ],
    "emerging": [
      { label: "FLOW-02: Deliver an Instant Payment with Timeout and Duplicate Controls", url: "labs/flow-02.html" },
      { label: "LAB-05: Deliver an Instant Payments Feature in Three Sprints", url: "labs/lab-05.html" }
    ],
    "professional": [
      { label: "Payments Business Analyst Studio", url: "ba-studio.html" },
      { label: "LAB-01: Write Requirements for Same-Day Cross-Border Payments for SMEs", url: "labs/lab-01.html" },
      { label: "LAB-02: Redesign the Payment Exception Repair Process", url: "labs/lab-02.html" }
    ]
  };

  /* Relative prefix from the current page back to the site root.
     Test pages live in tests/, so their links need "../". The
     diagnostic page and the homepage sit at the root, so they need
     nothing. In Node (no window) this returns "". */
  function paBasePrefix() {
    try {
      if (typeof window !== "undefined" && window.location && window.location.pathname) {
        if (window.location.pathname.indexOf("/tests/") !== -1) return "../";
      }
    } catch (e) { /* no location available */ }
    return "";
  }

  /* Pure feedback builder: given a scored result and the questions,
     return the area breakdown, the weakest five areas, the revision
     list (each chapter linked to its real first lesson and chapter
     page, plus related practice), the previous attempt and the
     improvement since that attempt. No DOM, no storage, so the
     acceptance suite can run it under Node. Every link it returns is
     checked against dist by the suite. */
  function buildFeedback(result, questions, opts) {
    opts = opts || {};
    var base = opts.basePrefix != null ? opts.basePrefix : paBasePrefix();
    var perQuestion = (result && result.per_question) || [];
    var areaScores = (result && result.area_scores) || {};
    var areas = [];
    Object.keys(areaScores).forEach(function (id) {
      var a = areaScores[id];
      var wrong = (a.total || 0) - (a.correct || 0);
      areas.push({ id: id, name: (DOMAIN_INFO[id] && DOMAIN_INFO[id].name) || id,
        correct: a.correct || 0, total: a.total || 0,
        percent: a.percent != null ? a.percent : pct(a.correct || 0, a.total || 0),
        wrong: wrong });
    });
    areas.sort(function (x, y) {
      if (x.percent !== y.percent) return x.percent - y.percent;
      if (x.wrong !== y.wrong) return y.wrong - x.wrong;
      return x.name < y.name ? -1 : 1;
    });
    var weakest = areas.filter(function (a) { return a.percent < 100; }).slice(0, 5);
    var byChapter = {};
    var qByIndex = {};
    (questions || []).forEach(function (q, i) { qByIndex[i] = q; });
    perQuestion.forEach(function (item) {
      var q = qByIndex[item.index] || {};
      var ch = q.chapter || null;
      if (!ch || !CHAPTER_INFO[ch]) return;
      if (!byChapter[ch]) byChapter[ch] = { chapter: ch, wrong: 0, total: 0, domain: q.domain || q.area || null };
      byChapter[ch].total++;
      if (!item.is_correct) byChapter[ch].wrong++;
    });
    var revision = Object.keys(byChapter).filter(function (ch) {
      return byChapter[ch].wrong > 0;
    }).map(function (ch) {
      var info = CHAPTER_INFO[ch];
      var entry = byChapter[ch];
      var lessonId = ch + "s1";
      var practice = [];
      if (entry.domain && DOMAIN_PRACTICE[entry.domain]) {
        DOMAIN_PRACTICE[entry.domain].forEach(function (p) {
          practice.push({ label: p.label, url: base + p.url });
        });
      }
      return { chapter: ch, chapter_number: bookNumber(ch),
        book_number: (typeof BOOK_NUMBER[ch] === 'number' ? BOOK_NUMBER[ch] : null),
        chapter_title: info.t, chapter_url: base + "chapters/" + info.s,
        lesson_id: lessonId, lesson_title: info.l,
        lesson_url: base + "lessons/" + lessonId + ".html",
        lessons_in_chapter: info.n, wrong: entry.wrong, total: entry.total,
        domain: entry.domain, practice: practice };
    });
    revision.sort(function (x, y) {
      if (x.wrong !== y.wrong) return y.wrong - x.wrong;
      return x.chapter_number - y.chapter_number;
    });
    var prev = opts.previousAttempt || (result && result.previous_attempt) || null;
    var improvement = null;
    if (prev && typeof prev.percent === "number" && result) {
      improvement = result.percent - prev.percent;
    }
    var relatedPractice = [];
    var seen = {};
    revision.forEach(function (r) {
      r.practice.forEach(function (p) {
        if (!seen[p.url]) { seen[p.url] = true; relatedPractice.push(p); }
      });
    });
    return { percent: result ? result.percent : 0,
      passed: result ? result.passed : null,
      pass_mark_percent: result ? result.pass_mark_percent : PASS_MARK,
      correct: result ? result.correct : 0, total: result ? result.total : 0,
      areas: areas, weakest: weakest, revision: revision,
      previous_attempt: prev, improvement: improvement,
      related_practice: relatedPractice };
  }

  /* Downloadable test completion receipt. A learning record only:
     it is not an accredited qualification and not an independently
     verified certificate. */
  function buildReceipt(meta, result, feedback) {
    meta = meta || {};
    return { product: "Payments Training Hub",
      kind: meta.mode === "diagnostic" ? "placement-test-receipt" : "test-receipt",
      test_id: meta.testId || "",
      title: meta.title || "",
      completed_at: meta.completedAt || new Date().toISOString(),
      score: result ? result.correct : 0, total: result ? result.total : 0,
      percent: result ? result.percent : 0,
      passed: result ? result.passed : null,
      pass_mark_percent: result ? result.pass_mark_percent : PASS_MARK,
      auto_submitted: !!meta.autoSubmitted,
      area_scores: (feedback && feedback.areas ? feedback.areas : []).map(function (a) {
        return { area: a.id, name: a.name, correct: a.correct, total: a.total, percent: a.percent };
      }),
      weakest_areas: (feedback && feedback.weakest ? feedback.weakest : []).map(function (a) { return a.id; }),
      revision_chapters: (feedback && feedback.revision ? feedback.revision : []).map(function (r) {
        return { chapter: r.chapter, title: r.chapter_title, wrong: r.wrong, total: r.total,
          lesson: r.lesson_id, lesson_url: r.lesson_url, chapter_url: r.chapter_url };
      }),
      previous_attempt_percent: feedback && feedback.previous_attempt ? feedback.previous_attempt.percent : null,
      improvement_points: feedback ? feedback.improvement : null,
      note: "This receipt records your own attempt on this device. It is a learning record, not an accredited qualification or an independently verified certificate." };
  }

  /* Renders the feedback section of a submitted result: score by
     area, weakest five areas, revision list with lesson and practice
     links, improvement since the last attempt, a retake-after-revision
     callout for timed tests, and receipt download and print buttons. */
  function renderFeedbackHtml(fb, opts) {
    opts = opts || {};
    var testLabel = opts.mode === "diagnostic" ? "placement test" : "test";
    var h = "";
    h += '<h2>Your score by area</h2>';
    h += '<table class="pa-feedback-table"><thead><tr><th>Area</th><th>Score</th><th>Percent</th></tr></thead><tbody>';
    fb.areas.forEach(function (a) {
      var weak = fb.weakest.indexOf(a) !== -1;
      h += '<tr' + (weak ? ' class="pa-weakest"' : '') + '><td>' + esc(a.name) + (weak ? ' (weakest area)' : '') +
        '</td><td>' + a.correct + ' of ' + a.total + '</td><td>' + a.percent + '%</td></tr>';
    });
    h += '</tbody></table>';
    if (fb.weakest.length) {
      h += '<h2>Your weakest areas</h2><ol>';
      fb.weakest.forEach(function (a) {
        h += '<li><strong>' + esc(a.name) + '</strong>: ' + a.percent + '% (' + a.correct + ' of ' + a.total + ' correct)</li>';
      });
      h += '</ol>';
    } else {
      h += '<p>No weak areas: every area is at 100%.</p>';
    }
    if (fb.revision.length) {
      h += '<h2>What to revise</h2><p>Each chapter below is one you missed questions from. Read the lesson, then try the related practice.</p><ol>';
      fb.revision.forEach(function (rev) {
        var _blabel = (rev.book_number == null) ? 'Outside the main reading path' : 'Book chapter ' + rev.book_number;
        h += '<li><strong>' + _blabel + ': ' + esc(rev.chapter_title) + '</strong> - you missed ' +
          rev.wrong + ' of ' + rev.total + ' question(s) from this chapter.<br>' +
          'Start here: <a href="' + esc(rev.lesson_url) + '">' + esc(rev.lesson_title) + '</a> ' +
          '(<a href="' + esc(rev.chapter_url) + '">whole chapter</a>)';
        if (rev.practice.length) {
          h += '<br>Related practice: ' + rev.practice.map(function (p) {
            return '<a href="' + esc(p.url) + '">' + esc(p.label) + '</a>';
          }).join(', ');
        }
        h += '</li>';
      });
      h += '</ol>';
    } else {
      h += '<p>Nothing to revise: you answered every question correctly.</p>';
    }
    if (fb.previous_attempt) {
      var d = fb.improvement;
      var dir = d > 0 ? 'Up ' + d + ' points' : (d < 0 ? 'Down ' + Math.abs(d) + ' points' : 'Same score');
      h += '<p>Compared with your last attempt (' + fb.previous_attempt.percent + '%): <strong>' + dir + '</strong>.</p>';
    } else {
      h += '<p>This was your first attempt at this ' + testLabel + '.</p>';
    }
    if (opts.mode === "test") {
      h += '<p>Work through the revision list above, then retake the test to check the gaps are closed.</p>' +
        '<p><button type="button" data-pa="retake">Retake this test after revision</button></p>';
    }
    h += '<p><button type="button" data-pa="download-receipt">Download your result receipt</button> ' +
      '<button type="button" data-pa="print-result">Print this result</button></p>';
    return h;
  }

  function recommendCourse(areaScores, rules) {
    var areas = Object.keys(areaScores);
    var total = 0, correct = 0, i, a;
    for (i = 0; i < areas.length; i++) {
      a = areaScores[areas[i]];
      total += a.total || 0;
      correct += a.correct || 0;
    }
    var overall = pct(correct, total);
    function areaPct(id) {
      var s = areaScores[id];
      return s ? pct(s.correct, s.total) : 0;
    }
    function noAreaBelow(n) {
      for (var j = 0; j < areas.length; j++) {
        if (areaPct(areas[j]) < n) return false;
      }
      return true;
    }
    // Rules are evaluated in priority order. The fallback (lowest area) is last.
    if (overall >= 85 && noAreaBelow(50)) {
      return { rule_id: "strong-everywhere", bundle_id: "full",
        bundle_name: "The Integrated Course", overall_percent: overall,
        reason: "You scored strongly across every area, so starting at the beginning would repeat what you already know. The Integrated Course fills the remaining gaps and gives you the full academy for completeness." };
    }
    if (overall < 40) {
      return { rule_id: "complete-beginner", bundle_id: "foundations",
        bundle_name: "Payment Foundations", overall_percent: overall,
        reason: "Your scores are low across most areas, which means the foundations are the right place to start. Payment Foundations builds the ground floor solid before you touch messages or rails." };
    }
    if (areaPct("foundations") >= 75 && areaPct("messaging") < 50) {
      return { rule_id: "messaging-weak", bundle_id: "messaging",
        bundle_name: "ISO 20022 and SWIFT Messaging", overall_percent: overall,
        reason: "Your foundations are strong, but messaging is your weakest area. The ISO 20022 and SWIFT Messaging bundle takes you through MT and MX messages field by field." };
    }
    if (areaPct("crossborder") < 50) {
      return { rule_id: "crossborder-weak", bundle_id: "crossborder",
        bundle_name: "Cross-Border and Correspondent Banking", overall_percent: overall,
        reason: "Cross-border is your weakest area. The Cross-Border and Correspondent Banking bundle covers correspondent banking, serial versus cover, charges, FX and exceptions end to end." };
    }
    if (areaPct("architecture-apis") < 50) {
      return { rule_id: "architecture-weak", bundle_id: "architecture-apis",
        bundle_name: "Payment Architecture and APIs", overall_percent: overall,
        reason: "Architecture and APIs is your weakest area. The Payment Architecture and APIs bundle covers hubs, platforms, gateways and integration, the engineering view of payments." };
    }
    if (areaPct("rails") < 50) {
      return { rule_id: "rails-weak", bundle_id: "rails",
        bundle_name: "Global Payment Rails", overall_percent: overall,
        reason: "Global rails is your weakest area. The Global Payment Rails bundle covers India, US, Europe and UK rails, plus TARGET and TIPS." };
    }
    if (areaPct("clearing") < 50) {
      return { rule_id: "clearing-weak", bundle_id: "clearing",
        bundle_name: "Clearing, Settlement and Liquidity", overall_percent: overall,
        reason: "Clearing and settlement is your weakest area. The Clearing, Settlement and Liquidity bundle covers netting, settlement models, liquidity and settlement risk." };
    }
    if (areaPct("cards") < 50) {
      return { rule_id: "cards-weak", bundle_id: "cards",
        bundle_name: "Cards and Domestic Payments", overall_percent: overall,
        reason: "Cards is your weakest area. The Cards and Domestic Payments bundle covers authorisation, clearing, settlement, wallets and POS." };
    }
    if (areaPct("compliance") < 50) {
      return { rule_id: "compliance-weak", bundle_id: "compliance-ops",
        bundle_name: "Compliance, Risk, Operations and Reconciliation", overall_percent: overall,
        reason: "Compliance and operations is your weakest area. The Compliance, Risk, Operations and Reconciliation bundle covers sanctions, AML, exceptions, returns and daily operations." };
    }
    if (areaPct("ba-practice") < 50) {
      return { rule_id: "ba-practice-weak", bundle_id: "ba-practice",
        bundle_name: "AI Product Owner and Product Manager for Payments", overall_percent: overall,
        reason: "AI product ownership is your weakest area. The AI Product Owner and Product Manager for Payments bundle covers AI for the payments BA and PO, AI-assisted work, product ownership, governance and the capstone." };
    }
    // Fallback: recommend the bundle for the lowest scoring area.
    var worst = null, worstPct = 101;
    for (var k = 0; k < areas.length; k++) {
      var p = areaPct(areas[k]);
      if (p < worstPct) { worstPct = p; worst = areas[k]; }
    }
    var bundle = AREA_BUNDLE[worst] || { bundle_id: "full", bundle_name: "The Integrated Course" };
    return { rule_id: "weakest-area-fallback", bundle_id: bundle.bundle_id,
      bundle_name: bundle.bundle_name, overall_percent: overall,
      reason: "Your lowest scoring area is the best place to start, so we recommend the bundle that covers it." };
  }

  /* ---------- first-visit diagnostic prompt ---------- */
  function paDiagnosticPrompt(storage) {
    var store = safeStore(storage);
    var progress = readJson(store, PROGRESS_KEY);
    var diagnostic = readJson(store, DIAGNOSTIC_KEY);
    var hasProgress = !isEmptyProgress(progress);
    var hasDiagnostic = !!diagnostic;
    if (hasDiagnostic) {
      var rec = diagnostic.recommendation || null;
      return { state: "has-diagnostic", showBigPrompt: false, hasProgress: hasProgress,
        hasDiagnostic: true, recommendation: rec,
        message: "Your placement test result is saved. Your recommended starting course is shown below, and you can retake the test any time." };
    }
    if (hasProgress) {
      return { state: "has-progress", showBigPrompt: false, hasProgress: true,
        hasDiagnostic: false, recommendation: null,
        message: "You have already started learning. Your placement test recommendation is available in the Courses section, and you can take the test any time." };
    }
    return { state: "first-visit", showBigPrompt: true, hasProgress: false,
      hasDiagnostic: false, recommendation: null,
      message: "New here? Take the 10-minute placement test and we will tell you exactly which course to start with." };
  }

  /* ---------- test runner (works in the browser and in Node) ---------- */
  function createRunner(testData, storage) {
    var store = safeStore(storage);
    var mode = testData.mode || "test"; // "test" or "diagnostic"
    var test = testData.test || {};
    var questions = testData.questions || [];
    var passMark = test.pass_mark_percent != null ? test.pass_mark_percent : PASS_MARK;
    var durationSeconds = mode === "diagnostic" ? 0 : (test.duration_minutes || questions.length) * 60;
    var state = {
      mode: mode, testId: test.id || "diagnostic", title: test.title || "Placement Test",
      status: "intro", // intro, running, confirm, submitted
      current: 0, answers: {}, marked: {}, secondsLeft: durationSeconds,
      autoSubmitted: false, result: null, reviewIndex: 0, reviewMode: false,
      startedAt: null, submittedAt: null
    };
    var timerId = null;

    function stopTimer() {
      if (timerId) { try { clearInterval(timerId); } catch (e) { /* ignore */ } timerId = null; }
    }
    function score() {
      var correct = 0, i, q;
      var perQuestion = [];
      for (i = 0; i < questions.length; i++) {
        q = questions[i];
        var chosen = state.answers[i];
        var ok = chosen != null && chosen === q.answer;
        if (ok) correct++;
        perQuestion.push({ index: i, question_id: q.id, area: q.area || q.domain || null,
          chosen: chosen == null ? null : chosen, correct_answer: q.answer,
          is_correct: ok, explanation: q.explanation });
      }
      var areaScores = {};
      for (i = 0; i < questions.length; i++) {
        var area = questions[i].area || questions[i].domain || "general";
        if (!areaScores[area]) areaScores[area] = { correct: 0, total: 0 };
        areaScores[area].total++;
        if (perQuestion[i].is_correct) areaScores[area].correct++;
      }
      Object.keys(areaScores).forEach(function (k) {
        areaScores[k].percent = pct(areaScores[k].correct, areaScores[k].total);
      });
      return { correct: correct, total: questions.length, percent: pct(correct, questions.length),
        passed: mode === "diagnostic" ? null : pct(correct, questions.length) >= passMark,
        pass_mark_percent: passMark, per_question: perQuestion, area_scores: areaScores };
    }
    function saveAttempt(result) {
      try {
        if (mode === "diagnostic") {
          var rec = recommendCourse(result.area_scores, testData.recommendation_rules || []);
          var record = { test_id: "diagnostic", title: "Placement Test",
            completed_at: new Date().toISOString(), score: result.correct,
            total: result.total, percent: result.percent,
            area_scores: result.area_scores, recommendation: rec };
          store.setItem(DIAGNOSTIC_KEY, JSON.stringify(record));
          result.recommendation = rec;
          /* Signed-in dashboard sync (12 Nov 2026): best effort only. */
          if(typeof PALearnerSync !== 'undefined' && PALearnerSync.recordResult){
            try { PALearnerSync.recordResult('diagnostic', 'diagnostic',
              { score_percent: result.percent, correct_count: result.correct,
                total_questions: result.total }); } catch(e){}
          }
          return record;
        }
        var attempts = readJson(store, TESTS_KEY) || { attempts: [] };
        if (!Array.isArray(attempts.attempts)) attempts.attempts = [];
        var attempt = { test_id: state.testId, title: state.title,
          completed_at: new Date().toISOString(), score: result.correct,
          total: result.total, percent: result.percent, passed: result.passed,
          pass_mark_percent: passMark, auto_submitted: state.autoSubmitted };
        attempts.attempts.push(attempt);
        store.setItem(TESTS_KEY, JSON.stringify(attempts));
        /* Signed-in dashboard sync (12 Nov 2026): best effort only.
           No-op when signed out, offline, or the sync script is absent. */
        if(typeof PALearnerSync !== 'undefined' && PALearnerSync.recordResult){
          try { PALearnerSync.recordResult('test', state.testId,
            { score_percent: result.percent, correct_count: result.correct,
              total_questions: result.total }); } catch(e){}
        }
        return attempt;
      } catch (e) { return null; }
    }
    function previousAttemptFor(testId, mode, store) {
      try {
        if (mode === "diagnostic") {
          var d = readJson(store, DIAGNOSTIC_KEY);
          if (!d) return null;
          return { percent: d.percent, passed: null, completed_at: d.completed_at || null };
        }
        var attempts = getAttempts(store);
        var mine = attempts.filter(function (a) { return a.test_id === testId; });
        if (!mine.length) return null;
        var last = mine[mine.length - 1];
        return { percent: last.percent, passed: last.passed, completed_at: last.completed_at || null };
      } catch (e) { return null; }
    }
    function doSubmit(auto) {
      if (state.status === "submitted") return state.result;
      stopTimer();
      state.autoSubmitted = !!auto;
      var result = score();
      /* Capture the previous attempt BEFORE saveAttempt stores this
         one, so the result can show the improvement since last time. */
      result.previous_attempt = previousAttemptFor(state.testId, mode, store);
      result.improvement = (result.previous_attempt && typeof result.previous_attempt.percent === "number")
        ? result.percent - result.previous_attempt.percent : null;
      state.result = result;
      state.status = "submitted";
      state.submittedAt = new Date().toISOString();
      saveAttempt(result);
      return result;
    }
    var api = {
      state: state,
      questions: questions,
      start: function () {
        state.status = "running";
        state.startedAt = new Date().toISOString();
        state.current = 0;
        if (mode !== "diagnostic" && typeof root.setInterval === "function") {
          stopTimer();
          timerId = root.setInterval(function () { api.tick(1); }, 1000);
        }
        return state;
      },
      answer: function (optionIndex) {
        if (state.status !== "running") return false;
        if (optionIndex < 0 || optionIndex >= questions[state.current].options.length) return false;
        state.answers[state.current] = optionIndex;
        return true;
      },
      goTo: function (index) {
        if (index < 0 || index >= questions.length) return false;
        state.current = index;
        return true;
      },
      next: function () { return api.goTo(Math.min(state.current + 1, questions.length - 1)); },
      prev: function () { return api.goTo(Math.max(state.current - 1, 0)); },
      toggleMark: function (index) {
        var i = index == null ? state.current : index;
        if (i < 0 || i >= questions.length) return false;
        state.marked[i] = !state.marked[i];
        if (!state.marked[i]) delete state.marked[i];
        return !!state.marked[i];
      },
      palette: function () {
        var out = [];
        for (var i = 0; i < questions.length; i++) {
          var answered = Object.prototype.hasOwnProperty.call(state.answers, i);
          out.push({ index: i, answered: answered, marked: !!state.marked[i],
            status: state.marked[i] ? "marked" : (answered ? "answered" : "unanswered"),
            current: i === state.current });
        }
        return out;
      },
      tick: function (seconds) {
        if (state.status !== "running" || mode === "diagnostic") return false;
        state.secondsLeft -= seconds;
        if (state.secondsLeft <= 0) {
          state.secondsLeft = 0;
          doSubmit(true);
          return true; // auto-submitted
        }
        return false;
      },
      requestSubmit: function () {
        if (state.status !== "running") return false;
        state.status = "confirm";
        return true;
      },
      cancelSubmit: function () {
        if (state.status !== "confirm") return false;
        state.status = "running";
        return true;
      },
      confirmSubmit: function () { return doSubmit(false); },
      submit: function () { return doSubmit(false); },
      retake: function () {
        stopTimer();
        state.status = "intro";
        state.current = 0; state.answers = {}; state.marked = {};
        state.secondsLeft = durationSeconds; state.autoSubmitted = false;
        state.result = null; state.reviewIndex = 0; state.reviewMode = false;
        state.startedAt = null; state.submittedAt = null;
        return state;
      },
      review: function (index) {
        if (state.status !== "submitted") return null;
        state.reviewMode = true;
        state.reviewIndex = Math.max(0, Math.min(index || 0, questions.length - 1));
        return state.result.per_question[state.reviewIndex];
      },
      reviewNext: function () {
        if (!state.reviewMode) return null;
        state.reviewIndex = Math.min(state.reviewIndex + 1, questions.length - 1);
        return state.result.per_question[state.reviewIndex];
      },
      reviewPrev: function () {
        if (!state.reviewMode) return null;
        state.reviewIndex = Math.max(state.reviewIndex - 1, 0);
        return state.result.per_question[state.reviewIndex];
      },
      getResult: function () { return state.result; },
      timeLeft: function () { return formatTime(state.secondsLeft); },
      durationSeconds: durationSeconds,
      durationMinutes: mode === "diagnostic" ? 0 : (test.duration_minutes || questions.length)
    };
    return api;
  }

  /* ---------- attempt / dashboard helpers ---------- */
  function getAttempts(storage) {
    var store = safeStore(storage);
    var data = readJson(store, TESTS_KEY);
    if (data && Array.isArray(data.attempts)) return data.attempts;
    return [];
  }
  function getDiagnosticResult(storage) {
    var store = safeStore(storage);
    return readJson(store, DIAGNOSTIC_KEY);
  }
  function dashboardSummary(storage) {
    var attempts = getAttempts(storage);
    var passed = attempts.filter(function (a) { return a.passed; }).length;
    var best = {};
    attempts.forEach(function (a) {
      if (!best[a.test_id] || a.percent > best[a.test_id].percent) best[a.test_id] = a;
    });
    return { attempts: attempts, total_attempts: attempts.length, passed_count: passed,
      best_by_test: best, diagnostic: getDiagnosticResult(storage) };
  }

  /* ---------- DOM rendering (browser only) ---------- */
  function renderDiagnosticPrompt(container, storage) {
    if (!container || typeof document === "undefined") return null;
    var decision = paDiagnosticPrompt(storage);
    if (decision.showBigPrompt) {
      container.innerHTML =
        '<div class="pa-diagnostic-banner" style="border:2px solid #1d4ed8;border-radius:12px;padding:20px;margin:16px 0;background:#eff6ff;">' +
        '<h2 style="margin:0 0 8px;">New here? Take the 10-minute placement test</h2>' +
        '<p style="margin:0 0 12px;">' + esc(decision.message) + ' Free, no account, no payment.</p>' +
        '<a href="diagnostic.html" class="pa-cta" style="display:inline-block;padding:10px 18px;background:#1d4ed8;color:#fff;border-radius:8px;text-decoration:none;">Take the placement test</a> ' +
        '<a href="courses.html" style="margin-left:12px;">Browse courses instead</a></div>';
    } else if (decision.hasDiagnostic && decision.recommendation) {
      container.innerHTML =
        '<div class="pa-diagnostic-saved" style="border:1px solid #cbd5e1;border-radius:12px;padding:16px;margin:16px 0;background:#f8fafc;">' +
        '<p style="margin:0 0 6px;"><strong>Your recommended starting course: ' + esc(decision.recommendation.bundle_name) + '</strong></p>' +
        '<p style="margin:0 0 10px;">' + esc(decision.recommendation.reason) + '</p>' +
        '<a href="courses.html#' + esc(decision.recommendation.bundle_id) + '">View this course</a> ' +
        '<a href="diagnostic.html" style="margin-left:12px;">Retake the placement test</a></div>';
    } else {
      container.innerHTML =
        '<div class="pa-diagnostic-quiet" style="margin:16px 0;">' +
        '<p style="margin:0;">Not sure where to start? <a href="diagnostic.html">Take the 10-minute placement test</a> and we will tell you exactly which course to start with.</p></div>';
    }
    return decision;
  }

  function paStartTest(containerId, testData, storage) {
    if (typeof document === "undefined") return createRunner(testData, storage);
    var container = typeof containerId === "string" ? document.getElementById(containerId) : containerId;
    if (!container) throw new Error("Test container not found: " + containerId);
    var runner = createRunner(testData, storage);
    var questions = runner.questions;
    function optionLetter(i) { return String.fromCharCode(65 + i); }
    function render() {
      var s = runner.state;
      if (s.status === "intro") {
        var intro = '<div class="pa-test-intro"><h1>' + esc(s.title) + '</h1>' +
          '<p>' + questions.length + ' questions, one at a time.</p>';
        if (s.mode === "diagnostic") {
          intro += '<p>This placement test is untimed. Take your time, there is no countdown and no pressure. It takes about 15 minutes.</p>' +
            '<p>When you finish, you will see a score for each area and one recommended starting course, with the reason.</p>';
        } else {
          intro += '<p>Time limit: ' + esc(String(runner.durationMinutes)) + ' minutes. The timer runs throughout and never pauses, and the time left counts down at the top of every question.</p>' +
            '<p>Pass mark: 80%. When the timer reaches zero, the test submits automatically.</p>' +
            '<p>Answers are not revealed during the test. After you submit, you will see the correct answer and the explanation for every question, and you can retake the test.</p>';
        }
        intro += '<p><button type="button" data-pa="start">Start the test</button></p></div>';
        container.innerHTML = intro;
        return;
      }
      if (s.status === "submitted") {
        var r = s.result;
        var fb = buildFeedback(r, questions, {});
        var html = '<div class="pa-test-result"><h1>Your result</h1>';
        if (s.mode === "diagnostic") {
          html += '<p>You scored ' + r.correct + ' out of ' + r.total + ' (' + r.percent + '%).</p>';
          html += renderFeedbackHtml(fb, { mode: "diagnostic" });
          if (r.recommendation) {
            html += '<h2>Your recommended starting course</h2><p><strong>' + esc(r.recommendation.bundle_name) + '</strong></p>' +
              '<p>' + esc(r.recommendation.reason) + '</p>' +
              '<p><a href="courses.html#' + esc(r.recommendation.bundle_id) + '">View this course and payment page</a></p>';
          }
          html += '<p><a href="tests.html">Take the full test series next</a></p>' +
            '<p><button type="button" data-pa="review">Review every question</button> ' +
            '<button type="button" data-pa="retake">Retake the placement test</button></p>';
        } else {
          html += '<p>You scored ' + r.correct + ' out of ' + r.total + ' (' + r.percent + '%).</p>' +
            '<p><strong>' + (r.passed ? 'Pass' : 'Not yet a pass') + '</strong> (pass mark ' + r.pass_mark_percent + '%)</p>' +
            (s.autoSubmitted ? '<p>The timer ran out, so the test was submitted automatically.</p>' : '') +
            renderFeedbackHtml(fb, { mode: "test" }) +
            '<p><button type="button" data-pa="review">Review every question</button> ' +
            '<button type="button" data-pa="retake">Retake this test</button></p>';
        }
        if (s.reviewMode) {
          var item = r.per_question[s.reviewIndex];
          var q = questions[item.index];
          html += '<div class="pa-review"><h2>Question ' + (item.index + 1) + ' of ' + questions.length + '</h2>' +
            '<p>' + esc(q.question) + '</p><ul class="pa-options">';
          q.options.forEach(function (opt, i) {
            var cls = "";
            if (i === item.correct_answer) cls = ' style="font-weight:bold;color:green;"';
            else if (i === item.chosen) cls = ' style="color:#b91c1c;"';
            html += '<li' + cls + '>' + optionLetter(i) + '. ' + esc(opt) +
              (i === item.correct_answer ? ' (correct answer)' : '') +
              (i === item.chosen && i !== item.correct_answer ? ' (your answer)' : '') + '</li>';
          });
          html += '</ul><p><strong>Why:</strong> ' + esc(q.explanation) + '</p>' +
            (q.why_wrong ? '<p><strong>Why the other options are wrong:</strong></p><ul>' +
              q.why_wrong.map(function (w, i) {
                return w ? '<li><strong>' + optionLetter(i) + '.</strong> ' + esc(w) + '</li>' : '';
              }).join('') + '</ul>' : '') +
            '<p><button type="button" data-pa="review-prev">Previous</button> ' +
            '<button type="button" data-pa="review-next">Next</button></p></div>';
        } else {
          html += '<h2>Question by question</h2><ol>';
          r.per_question.forEach(function (item) {
            var qq = questions[item.index];
            html += '<li><p>' + esc(qq.question) + '</p><p>Your answer: ' +
              (item.chosen == null ? 'Not answered' : esc(qq.options[item.chosen])) + ' - ' +
              (item.is_correct ? 'Correct' : 'Wrong') + '. Correct answer: ' + esc(qq.options[item.correct_answer]) + '</p>' +
              '<p><strong>Why:</strong> ' + esc(qq.explanation) + '</p>' +
              (qq.why_wrong ? '<p><strong>Why the other options are wrong:</strong></p><ul>' +
                qq.why_wrong.map(function (w, i) {
                  return w ? '<li><strong>' + optionLetter(i) + '.</strong> ' + esc(w) + '</li>' : '';
                }).join('') + '</ul>' : '') + '</li>';
          });
          html += '</ol>';
        }
        html += '</div>';
        container.innerHTML = html;
        return;
      }
      // running or confirm
      var q = questions[s.current];
      var palette = runner.palette();
      var h = '<div class="pa-test-run">';
      if (s.mode !== "diagnostic") {
        h += '<p>Time left: <strong id="pa-time-left" aria-live="polite">' + runner.timeLeft() + '</strong> of ' +
          esc(String(runner.durationMinutes)) + ' minutes</p>' +
          '<div class="pa-timebar" role="progressbar" aria-label="Time remaining"><div class="pa-timebar-fill" id="pa-timebar-fill" style="width:' +
          (runner.durationSeconds ? Math.max(0, Math.round(runner.state.secondsLeft / runner.durationSeconds * 100)) : 100) + '%"></div></div>';
      }
      h += '<div class="pa-palette">';
      palette.forEach(function (p) {
        var cls = (p.current ? ' current' : '') + (p.answered ? ' answered' : '') + (p.marked ? ' marked' : '');
        h += '<button type="button" class="' + cls.trim() + '" data-pa-goto="' + p.index + '" aria-pressed="' + (p.current ? 'true' : 'false') + '" aria-label="Question ' + (p.index + 1) + ', ' + p.status + '">' +
          (p.index + 1) + (p.marked ? '*' : '') + '</button>';
      });
      h += '</div><p>Answered: ' + palette.filter(function (p) { return p.answered; }).length +
        ' of ' + questions.length + '. Marked for review: ' + palette.filter(function (p) { return p.marked; }).length + '.</p>';
      h += '<h2>Question ' + (s.current + 1) + ' of ' + questions.length + '</h2><p>' + esc(q.question) + '</p><ul class="pa-options">';
      q.options.forEach(function (opt, i) {
        var checked = s.answers[s.current] === i ? ' checked' : '';
        h += '<li><label><input type="radio" name="pa-option" value="' + i + '"' + checked + '> ' + optionLetter(i) + '. ' + esc(opt) + '</label></li>';
      });
      h += '</ul><p><button type="button" data-pa="prev">Previous</button> ' +
        '<button type="button" data-pa="next">Next</button> ' +
        '<button type="button" data-pa="mark">' + (s.marked[s.current] ? 'Unmark for review' : 'Mark for review') + '</button></p>';
      if (s.status === "confirm") {
        var unanswered = palette.filter(function (p) { return !p.answered; }).length;
        h += '<div class="pa-confirm"><p>Submit this test now? You have ' + unanswered + ' unanswered question(s). You cannot change answers after submitting.</p>' +
          '<p><button type="button" data-pa="confirm-submit">Yes, submit</button> ' +
          '<button type="button" data-pa="cancel-submit">Keep working</button></p></div>';
      } else {
        h += '<p><button type="button" data-pa="request-submit">Submit test</button></p>';
      }
      h += '</div>';
      container.innerHTML = h;
    }
    /* Downloads the current result as a JSON receipt file. Browser
       only; in Node there is no document, so this is never called. */
    function downloadReceipt() {
      var res = runner.getResult();
      if (!res) return;
      var fb2 = buildFeedback(res, questions, { basePrefix: paBasePrefix() });
      var receipt = buildReceipt({ mode: runner.state.mode, testId: runner.state.testId,
        title: runner.state.title, completedAt: runner.state.submittedAt,
        autoSubmitted: runner.state.autoSubmitted }, res, fb2);
      try {
        var blob = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "paymentforge-" + runner.state.testId + "-result.json";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 500);
      } catch (e) { /* download unavailable */ }
    }
    container.addEventListener("click", function (ev) {
      var t = ev.target;
      if (!t) return;
      var action = t.getAttribute && t.getAttribute("data-pa");
      var goto = t.getAttribute && t.getAttribute("data-pa-goto");
      /* Advancing to another question must show the new question from its
         top: the page keeps the old scroll position otherwise, and the
         question stem is cut off above the viewport. Scroll the test
         block to just below the sticky header after every navigation. */
      function scrollToQuestion() {
        var y = container.getBoundingClientRect().top + window.scrollY - 70;
        window.scrollTo(0, Math.max(0, y));
      }
      if (goto != null) { runner.goTo(parseInt(goto, 10)); render(); scrollToQuestion(); return; }
      if (action === "start") { runner.start(); render(); return; }
      if (action === "prev") { runner.prev(); render(); scrollToQuestion(); return; }
      if (action === "next") { runner.next(); render(); scrollToQuestion(); return; }
      if (action === "mark") { runner.toggleMark(); render(); return; }
      if (action === "request-submit") { runner.requestSubmit(); render(); return; }
      if (action === "cancel-submit") { runner.cancelSubmit(); render(); return; }
      if (action === "confirm-submit") { runner.confirmSubmit(); render(); return; }
      if (action === "retake") { runner.retake(); render(); return; }
      if (action === "download-receipt") { downloadReceipt(); return; }
      if (action === "print-result") { try { window.print(); } catch (e) { /* ignore */ } return; }
      if (action === "review") { runner.review(0); render(); return; }
      if (action === "review-next") { runner.reviewNext(); render(); scrollToQuestion(); return; }
      if (action === "review-prev") { runner.reviewPrev(); render(); scrollToQuestion(); return; }
    });
    container.addEventListener("change", function (ev) {
      var t = ev.target;
      if (t && t.name === "pa-option") {
        runner.answer(parseInt(t.value, 10));
        render();
      }
    });
    /* Live countdown: the runner ticks state every second, but nothing in
       the DOM moved with it, so the displayed time never counted down and
       an auto-submit left the running view on screen. This interval keeps
       the time text and the time bar moving, and re-renders the moment an
       auto-submit lands, so the result appears without another click. */
    var lastStatus = runner.state.status;
    setInterval(function () {
      var st = runner.state;
      if (st.status === "running" || st.status === "confirm") {
        var t = document.getElementById("pa-time-left");
        if (t) t.textContent = runner.timeLeft();
        var fill = document.getElementById("pa-timebar-fill");
        if (fill && runner.durationSeconds) {
          var leftPct = Math.max(0, Math.round(st.secondsLeft / runner.durationSeconds * 100));
          fill.style.width = leftPct + "%";
          fill.style.background = st.secondsLeft <= 60 ? "#F87171" : "";
        }
      }
      if (st.status === "submitted" && lastStatus !== "submitted") {
        lastStatus = st.status;
        render();
        return;
      }
      lastStatus = st.status;
    }, 500);
    render();
    return runner;
  }

  var api = {
    TESTS_KEY: TESTS_KEY, DIAGNOSTIC_KEY: DIAGNOSTIC_KEY, PROGRESS_KEY: PROGRESS_KEY,
    PASS_MARK: PASS_MARK, createRunner: createRunner, recommendCourse: recommendCourse,
    paDiagnosticPrompt: paDiagnosticPrompt, getAttempts: getAttempts,
    getDiagnosticResult: getDiagnosticResult, dashboardSummary: dashboardSummary,
    renderDiagnosticPrompt: renderDiagnosticPrompt, paStartTest: paStartTest,
    formatTime: formatTime, pct: pct,
    buildFeedback: buildFeedback, buildReceipt: buildReceipt,
    renderFeedbackHtml: renderFeedbackHtml, paBasePrefix: paBasePrefix,
    CHAPTER_INFO: CHAPTER_INFO, BOOK_NUMBER: BOOK_NUMBER, DOMAIN_INFO: DOMAIN_INFO, DOMAIN_PRACTICE: DOMAIN_PRACTICE
  };
  root.PaymentForgeTests = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
