/* Payments Business Analyst Studio (Feature 5).
   Five realistic payments scenarios. For each scenario the learner fills
   editable templates for eight BA artefacts, compares with a reference
   solution, and gets deterministic feedback on their actual submission.
   Feedback analyses the submitted text only: completeness, clarity,
   testability, business alignment, exception handling and integration
   dependencies. Scoring: 100 points per scenario, weighted across the
   six criteria (see WEIGHTS). Scores are stored with the shared
   PFFeatures progress key only. All data is synthetic and educational.
   No real banking systems, no real money. */
(function(){
  "use strict";
  var P = window.PFFeatures;
  var FEATURE_ID = "ba-studio";
  var TOTAL = 100;

  /* Criterion weights, out of 100 per scenario. Stated on the page. */
  var WEIGHTS = {
    completeness: 25, clarity: 15, testability: 20,
    alignment: 15, exceptions: 15, integration: 10
  };

  var VAGUE_WORDS = ["etc", "somehow", "as appropriate", "tbd",
    "to be confirmed", "to be decided", "various", "as needed",
    "and so on", "stuff", "things", "etc."];

  var MEASURABLE = ["within", "by ", "must", "at least", "at most",
    "no later than", "no more than", "per ", "%", "second", "seconds",
    "minute", "minutes", "hour", "hours", "status", "code", "reject",
    "accept", "confirm", "notify", "record", "log", "validate"];

  /* ---------------- Artefact definitions ---------------- */
  /* kind "rows": add/remove table rows. kind "sections": labelled textareas. */
  var ARTEFACTS = [
    { id: "requirements", label: "Business requirements", kind: "rows", min: 3,
      hint: "One requirement per row. Write each requirement so it can be tested: state what must happen and by when, or to what value.",
      cols: [
        { key: "text", label: "Requirement", type: "text", ph: "e.g. Same-day payments submitted before the cut-off must reach clearing the same business day." },
        { key: "priority", label: "Priority", type: "select", options: ["Must have", "Should have", "Could have"] },
        { key: "rationale", label: "Rationale", type: "text", ph: "Why does the business need this?" }
      ] },
    { id: "funcspec", label: "Functional specification", kind: "sections", min: 4,
      hint: "Fill all four sections. Name the inputs, the processing steps, the outputs and the rules, including error rules.",
      sections: [
        { key: "inputs", label: "Inputs", ph: "What data, files, messages or screens start this flow?" },
        { key: "processing", label: "Processing", ph: "What does the system do, step by step?" },
        { key: "outputs", label: "Outputs", ph: "What is produced: messages, records, screens, notifications?" },
        { key: "rules", label: "Rules", ph: "Business rules, limits, cut-offs, validation and error rules." }
      ] },
    { id: "stories", label: "User stories", kind: "rows", min: 2,
      hint: "Write stories in the form: As a (role), I want (capability), so that (business benefit).",
      cols: [
        { key: "role", label: "As a...", type: "text", ph: "e.g. Corporate payments user" },
        { key: "want", label: "I want...", type: "text", ph: "e.g. to see the status of my payment" },
        { key: "benefit", label: "So that...", type: "text", ph: "e.g. I know whether it was accepted before the cut-off" }
      ] },
    { id: "gherkin", label: "Gherkin acceptance criteria", kind: "rows", min: 2,
      hint: "One scenario per row. Given is the starting state, When is the action, Then is the expected, checkable outcome.",
      cols: [
        { key: "title", label: "Scenario", type: "text", ph: "e.g. Payment submitted before cut-off" },
        { key: "given", label: "Given", type: "text", ph: "e.g. a valid payment instruction exists" },
        { key: "when", label: "When", type: "text", ph: "e.g. the user submits it at 10:00" },
        { key: "then", label: "Then", type: "text", ph: "e.g. the payment is accepted and a pacs.002 status is returned" }
      ] },
    { id: "flow", label: "Process flow", kind: "rows", min: 4, isFlow: true,
      hint: "List the steps in order. The diagram below the table renders your steps as a simple flow.",
      cols: [
        { key: "step", label: "Step", type: "text", ph: "e.g. Customer submits the payment instruction" },
        { key: "owner", label: "Owner / system", type: "text", ph: "e.g. Customer portal" },
        { key: "output", label: "Output", type: "text", ph: "e.g. Validated instruction stored" }
      ] },
    { id: "mapping", label: "Field mapping", kind: "rows", min: 3,
      hint: "Map each source field to its target. State the transformation and whether the field is mandatory.",
      cols: [
        { key: "source", label: "Source field", type: "text", ph: "e.g. MT101 field 32A value date" },
        { key: "target", label: "Target field", type: "text", ph: "e.g. pain.001 requested execution date" },
        { key: "transform", label: "Transformation", type: "text", ph: "e.g. Direct copy, reformat date to YYYY-MM-DD" },
        { key: "mandatory", label: "Mandatory?", type: "select", options: ["Mandatory", "Optional", "Conditional"] }
      ] },
    { id: "api", label: "API validation scenarios", kind: "rows", min: 2,
      hint: "One validation scenario per row. State the request, the expected response and what you would check.",
      cols: [
        { key: "endpoint", label: "Endpoint", type: "text", ph: "e.g. POST /payments" },
        { key: "request", label: "Request", type: "text", ph: "e.g. Valid payment JSON with amount and currency" },
        { key: "expected", label: "Expected response", type: "text", ph: "e.g. 202 Accepted with payment reference" },
        { key: "checks", label: "Validation checks", type: "text", ph: "e.g. Response code, reference present, status stored" }
      ] },
    { id: "negative", label: "Negative test cases", kind: "rows", min: 2,
      hint: "Test what must go wrong safely. Each case needs an invalid input and the exact error handling you expect.",
      cols: [
        { key: "input", label: "Invalid input", type: "text", ph: "e.g. Amount missing, currency code invalid" },
        { key: "expected", label: "Expected error handling", type: "text", ph: "e.g. Rejected with error code and reason, no payment created" },
        { key: "handling", label: "Operator / customer handling", type: "text", ph: "e.g. Customer sees the reason and can correct and resubmit" }
      ] }
  ];

  /* ---------------- Scenarios ---------------- */
  var SCENARIOS = [
    {
      id: "same-day", num: 1,
      title: "Same-day cross-border payments with status tracking",
      goal: "A corporate client can send same-day cross-border payments and track each payment status until it is settled.",
      brief: "Meridian Trading Ltd, a corporate client, asks the bank for same-day cross-border payments. The client wants to know, for every payment, whether it was accepted, rejected or settled, and it wants a clear cut-off time rule: payments sent before the cut-off go the same day, payments after it go the next business day. Status updates arrive as pacs.002 messages from the banks handling the payment. All names, amounts and times are synthetic examples for teaching.",
      context: "Stakeholders: corporate client, payments operations, correspondent banking, customer portal team. Constraints: a daily cut-off time agreed with the client, status updates depend on the banks in the payment chain, and a payment can be rejected after it was first accepted.",
      keywords: ["same-day", "cut-off", "cutoff", "pacs.002", "status", "tracking", "track", "cross-border", "value date", "beneficiary", "currency", "settlement", "corporate"],
      exceptions: ["cut-off", "rejected", "rejection", "timeout", "delayed", "delay", "returned", "return", "insufficient funds", "failed"],
      integrations: ["pacs.002", "pacs.008", "core banking", "clearing", "correspondent", "portal", "payment hub"],
      reference: {
        requirements: "<ol><li><b>Must have:</b> Payments submitted before the agreed cut-off time must be released to clearing the same business day. Rationale: the client plans cash around same-day value.</li><li><b>Must have:</b> Every payment must return a pacs.002 status update when it is accepted, rejected or settled, and the status must be shown in the client portal within 5 minutes of receipt. Rationale: the client cannot chase payments it cannot see.</li><li><b>Must have:</b> Payments submitted after the cut-off must be queued for the next business day and the client must be told the new value date at submission. Rationale: no silent next-day drift.</li><li><b>Should have:</b> The portal must show the full status history for each payment, including the time of each status change.</li></ol>",
        funcspec: "<p><b>Inputs:</b> payment instruction from the client portal or file upload (debtor, creditor, amount, currency, value date, EndToEndId). <b>Processing:</b> validate the instruction, check the cut-off, release to clearing or queue for the next business day, listen for pacs.002 status updates and match each one to the original payment by EndToEndId. <b>Outputs:</b> pacs.008 to the next bank, status shown in the portal, pacs.002 updates stored with timestamps. <b>Rules:</b> cut-off applies per currency and per payment route; a payment with no pacs.002 within the agreed wait time is flagged as status overdue; a rejected payment is never retried automatically.</p>",
        stories: "<ul><li>As a corporate payments user, I want to see the status of each payment I sent, so that I know whether it was accepted before I promise the beneficiary.</li><li>As a corporate treasurer, I want payments after the cut-off to show the next business day value date at submission, so that I can plan cash without surprises.</li><li>As a payments operator, I want payments with no status update within the agreed wait time to be flagged, so that I can chase them before the client does.</li></ul>",
        gherkin: "<ul><li><b>Payment before cut-off:</b> Given a valid instruction submitted before the cut-off, When it is validated, Then it is released to clearing the same business day and the portal shows Accepted.</li><li><b>Payment after cut-off:</b> Given a valid instruction submitted after the cut-off, When it is validated, Then it is queued for the next business day and the portal shows the new value date.</li><li><b>Status update received:</b> Given an accepted payment, When a pacs.002 with status RJCT arrives, Then the portal shows Rejected with the reason and the client is notified.</li></ul>",
        flow: "<ol><li>Client submits the payment instruction in the portal.</li><li>Bank validates the instruction (fields, amount, currency, account).</li><li>Bank checks the cut-off time for the currency and route.</li><li>Payment is released to clearing the same day, or queued for the next business day.</li><li>Bank sends pacs.008 onward and stores the EndToEndId.</li><li>Bank receives pacs.002 status updates and matches them to the payment.</li><li>Portal shows the latest status and the status history; overdue statuses are flagged.</li></ol>",
        mapping: "<p>Instruction fields to pacs.008: EndToEndId maps directly; instructed amount and currency map to the interbank settlement amount; debtor name, account and agent map to the debtor block; creditor name, account and agent map to the creditor block; remittance information maps unchanged. The pacs.002 status and reason map to the portal status display and to the client notification.</p>",
        api: "<ul><li><b>POST /payments:</b> valid instruction returns 202 Accepted with a payment reference and the value date. Checks: reference present, value date matches the cut-off rule, status stored as Accepted.</li><li><b>GET /payments/{reference}/status:</b> returns the latest pacs.002 status and the status history. Checks: status matches the stored status, history is in time order.</li><li><b>POST /payments with a payment after the cut-off:</b> returns 202 with the next business day value date. Checks: value date is the next business day, client sees the new date in the response.</li></ul>",
        negative: "<ul><li><b>Missing amount:</b> instruction with no amount is rejected at validation with an error code and reason, no payment is created, and the client sees the reason.</li><li><b>Invalid currency code:</b> instruction with an unknown currency is rejected with an error code, no payment is created.</li><li><b>pacs.002 for an unknown payment:</b> a status update that matches no EndToEndId is logged, quarantined and raised to operations, never shown against the wrong payment.</li><li><b>Status update arrives twice:</b> a duplicate pacs.002 is recognised by its message reference and ignored, so the status history shows one entry.</li></ul>"
      }
    },
    {
      id: "mt101-migration", num: 2,
      title: "Bulk payment file migration from MT101 to pain.001",
      goal: "A bank migrates corporate bulk payment files from MT101 to pain.001 without losing payments, changing amounts or hiding rejections.",
      brief: "The bank's corporate clients still send bulk payment files in MT101 format. The bank is migrating them to pain.001, the ISO 20022 customer credit transfer initiation message. Every MT101 field must map to pain.001, invalid files must be rejected with a clear reason, and a rejected payment inside an otherwise valid file must not block the good payments. All file contents, field values and client names are synthetic examples for teaching.",
      context: "Stakeholders: corporate clients, file gateway team, payments operations, client support. Constraints: clients cannot all migrate on the same day, so both formats run in parallel for a period; a file can contain hundreds of payments; one bad payment must not lose the rest of the file.",
      keywords: ["MT101", "pain.001", "bulk", "file", "mapping", "validation", "rejection", "migration", "field", "corporate"],
      exceptions: ["rejected", "rejection", "invalid", "duplicate", "missing field", "format error", "timeout", "failed", "error"],
      integrations: ["MT101", "pain.001", "pain.002", "core banking", "file gateway", "portal", "payment hub"],
      reference: {
        requirements: "<ol><li><b>Must have:</b> Every MT101 field used by clients must map to a pain.001 element, and any MT101 field with no pain.001 equivalent must be listed and agreed with the client before migration. Rationale: silent data loss is not acceptable.</li><li><b>Must have:</b> A file that fails validation must be rejected as a whole with a pain.002 status report naming the failed payments and the reason for each. Rationale: the client must be able to fix and resend.</li><li><b>Must have:</b> A single rejected payment inside a valid file must not block the other payments in that file. Rationale: one bad payment must not stop hundreds of good ones.</li><li><b>Should have:</b> During the parallel run, the bank must accept both MT101 and pain.001 files and report the same statuses for both.</li></ol>",
        funcspec: "<p><b>Inputs:</b> bulk file upload (MT101 during the parallel run, pain.001 after migration) with a file reference and a client identifier. <b>Processing:</b> parse the file, map each field to the bank's canonical payment model, validate each payment (mandatory fields, amounts, dates, accounts), accept valid payments and reject invalid ones individually, build the pain.001 for onward processing. <b>Outputs:</b> pain.001 per accepted payment, pain.002 status report per file, rejection list with reasons, file receipt to the client. <b>Rules:</b> amounts must be positive and in a supported currency; value dates must not be in the past; duplicate file references are rejected; the file is processed in the order received.</p>",
        stories: "<ul><li>As a corporate client, I want to upload a bulk file and get a clear receipt showing which payments were accepted and which were rejected, so that I can fix only the failed ones.</li><li>As a payments operator, I want a rejected payment to be isolated from the rest of its file, so that one bad payment never blocks hundreds of good ones.</li><li>As a migration lead, I want a report of every MT101 field with no pain.001 equivalent, so that nothing is lost silently during migration.</li></ul>",
        gherkin: "<ul><li><b>Valid file:</b> Given a pain.001 file with 100 valid payments, When it is uploaded, Then all 100 are accepted and a pain.002 confirms 100 accepted.</li><li><b>One bad payment:</b> Given a file with 99 valid payments and 1 payment with a missing creditor account, When it is uploaded, Then 99 are accepted, 1 is rejected with a named reason, and the pain.002 lists the rejected payment.</li><li><b>Duplicate file:</b> Given a file reference already processed, When the same file is uploaded again, Then the file is rejected as a duplicate and no payment is processed twice.</li></ul>",
        flow: "<ol><li>Client uploads the bulk file through the file gateway.</li><li>Gateway checks the file reference for duplicates.</li><li>Each payment in the file is parsed and mapped to the canonical model.</li><li>Each payment is validated (mandatory fields, amount, currency, date, account).</li><li>Valid payments are accepted and converted to pain.001.</li><li>Rejected payments are recorded with a reason code.</li><li>A pain.002 status report is sent to the client listing accepted and rejected payments.</li><li>Operations reviews rejections that repeat for the same client.</li></ol>",
        mapping: "<p>MT101 to pain.001 examples: the MT101 value date and amount map to the pain.001 instructed amount and requested execution date; the ordering customer maps to the debtor block; the beneficiary maps to the creditor block; the remittance information maps to the pain.001 remittance block. Fields with no equivalent, such as some MT101 free-text fields, are listed as unmapped and agreed with the client. This mapping is an educational example: real mappings depend on the bank's canonical model and its implementation guidelines.</p>",
        api: "<ul><li><b>POST /files:</b> valid pain.001 file returns 202 Accepted with a file reference. Checks: file reference present, receipt shows the payment count, file status stored as Received.</li><li><b>GET /files/{reference}/status:</b> returns accepted and rejected counts with reasons. Checks: counts add up to the file total, each rejection names a payment and a reason.</li><li><b>POST /files with a duplicate reference:</b> returns 409 Conflict. Checks: no payment processed twice, error names the original file reference.</li></ul>",
        negative: "<ul><li><b>Missing creditor account:</b> payment with no creditor account is rejected individually with an error code, the rest of the file is accepted, and the pain.002 names the rejected payment.</li><li><b>Negative amount:</b> payment with a negative amount is rejected with an error code and reason, no payment is created.</li><li><b>Value date in the past:</b> payment with a past value date is rejected with an error code, the client is told the earliest accepted date.</li><li><b>Corrupt file:</b> a file that cannot be parsed is rejected as a whole, the client receives a file-level error, and no partial payments are created.</li></ul>"
      }
    },
    {
      id: "duplicate-detection", num: 3,
      title: "Duplicate payment detection before release to clearing",
      goal: "A fintech stops duplicate payments reaching clearing, while letting an operator release a genuine repeat payment on purpose.",
      brief: "A fintech's customers sometimes submit the same payment twice, for example by double-clicking submit or retrying after a timeout. The fintech wants duplicate detection before any payment is released to clearing. A payment that matches an earlier payment on amount, currency, creditor and a short time window is held as a suspected duplicate. An operator can release it as genuine or reject it as a duplicate. An idempotency key supplied by the customer must also prevent a retry from creating a second payment. All data is synthetic and for teaching.",
      context: "Stakeholders: fintech product team, payments operations, customer support, clearing team. Constraints: a genuine repeat payment (same amount to the same creditor) must still be possible with an operator override; detection must happen before clearing, not after; every override must be recorded.",
      keywords: ["duplicate", "idempotency", "clearing", "override", "operator", "release", "detection", "retry", "held", "hold"],
      exceptions: ["duplicate", "timeout", "override", "false positive", "system error", "failed", "rejected", "held"],
      integrations: ["clearing", "core banking", "payment hub", "operator console", "idempotency", "portal"],
      reference: {
        requirements: "<ol><li><b>Must have:</b> A payment that matches an earlier payment on amount, currency, creditor account and time window must be held as a suspected duplicate before release to clearing. Rationale: duplicates caught after clearing are far harder to recover.</li><li><b>Must have:</b> A retry that carries the same idempotency key as an earlier request must return the original result and must not create a second payment. Rationale: retries after a timeout are normal and must be safe.</li><li><b>Must have:</b> An operator must be able to release a held payment as genuine or reject it as a duplicate, and the decision, the operator and the time must be recorded. Rationale: genuine repeats exist and overrides need an audit trail.</li><li><b>Should have:</b> The customer must be told when their payment is held for duplicate review and what happens next.</li></ol>",
        funcspec: "<p><b>Inputs:</b> payment instruction with an idempotency key, amount, currency, creditor account and EndToEndId. <b>Processing:</b> check the idempotency key store, then run duplicate detection against recent payments (same amount, currency and creditor within the agreed window), hold suspected duplicates, route held payments to the operator queue, release or reject on operator decision. <b>Outputs:</b> payment released to clearing, held payment in the operator queue, rejection notice, audit record of every decision. <b>Rules:</b> detection runs before clearing, never after; the time window and the matching fields are configurable per product; an operator release requires a reason; a rejected duplicate is never sent to clearing.</p>",
        stories: "<ul><li>As a customer, I want my retry after a timeout to return the original result instead of sending the money twice, so that I can retry safely.</li><li>As a payments operator, I want suspected duplicates held in a queue with the matching earlier payment shown beside them, so that I can decide quickly and correctly.</li><li>As a product manager, I want every override recorded with the operator and the reason, so that duplicate decisions can be audited.</li></ul>",
        gherkin: "<ul><li><b>Retry with the same key:</b> Given a payment already accepted with idempotency key K, When the same request with key K arrives again, Then the original result is returned and no second payment is created.</li><li><b>Suspected duplicate:</b> Given a payment with the same amount, currency and creditor as one sent 10 minutes ago, When it is submitted, Then it is held for review and not released to clearing.</li><li><b>Operator release:</b> Given a held payment, When an operator releases it as genuine with a reason, Then it goes to clearing and the release is recorded with the operator name and time.</li></ul>",
        flow: "<ol><li>Customer submits the payment with an idempotency key.</li><li>System checks the idempotency key store for an earlier request.</li><li>If the key matches, the original result is returned and no new payment is created.</li><li>If the key is new, duplicate detection compares the payment with recent payments.</li><li>Suspected duplicates are held and placed in the operator queue.</li><li>Operator reviews the held payment against the earlier payment.</li><li>Operator releases it as genuine or rejects it as a duplicate, with a reason.</li><li>Released payments go to clearing; rejected duplicates are closed with a notice to the customer.</li></ol>",
        mapping: "<p>Detection fields: amount and currency map to the comparison amount; creditor account maps to the comparison account; EndToEndId maps to the payment identity used in the audit record; the idempotency key maps to the key store lookup; the operator decision maps to the payment status (released or rejected) and to the audit record. The matching window and the matching fields are configurable, not fixed by any scheme rule.</p>",
        api: "<ul><li><b>POST /payments with an idempotency key:</b> first request returns 202 Accepted with a payment reference. Checks: reference present, payment stored once.</li><li><b>POST /payments with the same key again:</b> returns the original result with the original reference. Checks: no second payment created, same reference returned.</li><li><b>POST /operator/duplicates/{id}/release:</b> operator release returns 200 with the new status. Checks: status changes to Released, audit record created with operator and reason.</li></ul>",
        negative: "<ul><li><b>Missing idempotency key:</b> a request with no key is accepted but flagged as not protected against duplicate retry, and the customer is warned that a retry may duplicate the payment.</li><li><b>Duplicate submitted twice in one second:</b> the second submission is held, not cleared, and the operator queue shows both payments side by side.</li><li><b>Operator rejects a genuine payment by mistake:</b> the rejection is recorded, the payment is not sent to clearing, and a supervisor can reopen the case from the audit record.</li><li><b>Detection service times out:</b> when duplicate detection does not answer in time, the payment is held for manual review rather than released unchecked.</li></ul>"
      }
    },
    {
      id: "sanctions-hold", num: 4,
      title: "Sanctions screening hold workflow",
      goal: "A bank holds payments flagged by sanctions screening, and releases or rejects each one with a full audit trail and a clear customer message.",
      brief: "The bank's sanctions screening system flags some payments for review, for example when a name or a country matches a screening list. Flagged payments must be held, never released automatically. A compliance operator reviews each held payment and either releases it or rejects it. Every decision, and the reason for it, must be written to an audit trail. The customer must be told that the payment is held, and later whether it was released or rejected. All names, countries and list matches are synthetic examples for teaching. This scenario does not describe any real sanctions list or rule.",
      context: "Stakeholders: compliance team, payments operations, customer support, the customer. Constraints: a held payment must never reach clearing automatically; a rejected payment must never be retried automatically; the audit trail must record who decided, when, and why.",
      keywords: ["sanctions", "screening", "hold", "held", "release", "reject", "audit", "notification", "customer", "compliance", "review"],
      exceptions: ["held", "false positive", "timeout", "rejected", "screening failure", "failed", "error", "escalated"],
      integrations: ["screening", "core banking", "case management", "notification", "audit", "payment hub", "clearing"],
      reference: {
        requirements: "<ol><li><b>Must have:</b> A payment flagged by sanctions screening must be held immediately and must never be released to clearing automatically. Rationale: an unchecked release is the failure this workflow exists to prevent.</li><li><b>Must have:</b> A compliance operator must be able to release or reject each held payment, and the decision, the operator, the time and the reason must be written to the audit trail. Rationale: every decision must be explainable afterwards.</li><li><b>Must have:</b> The customer must be notified when a payment is held, and again when it is released or rejected, with a clear message and a next step. Rationale: a customer left in the dark will chase, complain and resubmit.</li><li><b>Should have:</b> Held payments older than an agreed time must be escalated to a senior reviewer.</li></ol>",
        funcspec: "<p><b>Inputs:</b> payment instruction, screening result (flagged or clear) with the matched screening details. <b>Processing:</b> screen each payment before release, hold flagged payments, place them in the compliance queue, record the operator decision, release cleared payments to clearing or reject them, send customer notifications at each step. <b>Outputs:</b> held payment in the compliance queue, released payment to clearing, rejected payment closed with a reason, audit records, customer notifications. <b>Rules:</b> only a compliance operator can release a held payment; a rejected payment is never retried automatically; the audit trail is append-only; a payment held longer than the agreed time is escalated.</p>",
        stories: "<ul><li>As a compliance operator, I want held payments listed with the screening match details beside them, so that I can decide without hunting through systems.</li><li>As a customer, I want to be told promptly when my payment is held and why it is delayed, so that I can plan and avoid resubmitting it.</li><li>As a compliance manager, I want every release and rejection recorded with the operator, time and reason, so that I can evidence each decision in an audit.</li></ul>",
        gherkin: "<ul><li><b>Flagged payment:</b> Given a payment that screening flags, When it is processed, Then it is held, it is not released to clearing, and the customer is notified it is under review.</li><li><b>Operator release:</b> Given a held payment, When a compliance operator releases it with a reason, Then it goes to clearing and the audit trail records the operator, time and reason.</li><li><b>Operator rejection:</b> Given a held payment, When a compliance operator rejects it with a reason, Then the payment is closed, the customer is told it was rejected with a next step, and it is never retried automatically.</li></ul>",
        flow: "<ol><li>Customer submits the payment instruction.</li><li>Screening system checks the payment against the screening lists.</li><li>Clear payments continue to clearing.</li><li>Flagged payments are held and placed in the compliance queue.</li><li>Customer is notified the payment is held for review.</li><li>Compliance operator reviews the screening match details.</li><li>Operator releases the payment or rejects it, with a reason.</li><li>Released payments go to clearing; rejected payments are closed.</li><li>Customer is notified of the outcome and the audit trail records the decision.</li></ol>",
        mapping: "<p>Payment fields to the screening case: debtor and creditor names map to the screened name fields; the payment countries map to the screened country fields; amount and currency map to the case value; the screening result maps to the payment status (held, released or rejected); the operator decision and reason map to the audit record and to the customer notification text.</p>",
        api: "<ul><li><b>POST /screening/check:</b> payment details return a screening result of clear or flagged with the matched details. Checks: result present, matched details stored with the payment.</li><li><b>POST /cases/{id}/release:</b> operator release returns 200 with the new status. Checks: status changes to Released, audit record created, payment proceeds to clearing.</li><li><b>POST /cases/{id}/reject:</b> operator rejection returns 200 with the new status. Checks: status changes to Rejected, customer notification queued, payment never sent to clearing.</li></ul>",
        negative: "<ul><li><b>Screening system times out:</b> when screening does not answer in time, the payment is held for manual review rather than released unchecked.</li><li><b>Screening returns an error:</b> a screening error holds the payment and raises an alert to operations, so the payment is never released on an unknown result.</li><li><b>Customer resubmits a held payment:</b> a resubmission of a held payment is recognised and linked to the original case, not processed as a new payment.</li><li><b>Operator tries to release without a reason:</b> a release with no reason is refused, and the operator is asked to record a reason before the release is accepted.</li></ul>"
      }
    },
    {
      id: "liquidity-dashboard", num: 5,
      title: "Liquidity dashboard for corporate treasury",
      goal: "A corporate treasury sees expected settlements by value date and currency, and gets an intraday alert when expected funds will not cover expected payments.",
      brief: "A corporate treasury team wants a dashboard that shows expected settlements by value date and currency, built from payment instructions, clearing records and settlement records. The dashboard must show, for each value date and currency, expected money in, expected money out and the resulting balance. When the expected balance for a value date goes negative, or below an agreed threshold, the dashboard must raise an intraday alert so the treasury team can act before the value date arrives. All figures, dates and company names are synthetic examples for teaching.",
      context: "Stakeholders: corporate treasury, payments operations, liquidity management, settlement team. Constraints: data arrives from several systems at different times, so the dashboard must show how fresh each figure is; an alert must name the value date, currency and shortfall amount.",
      keywords: ["liquidity", "settlement", "value date", "currency", "intraday", "alert", "dashboard", "expected", "treasury", "balance"],
      exceptions: ["shortfall", "delayed settlement", "missing data", "alert failure", "currency mismatch", "failed", "stale", "error"],
      integrations: ["core banking", "clearing", "settlement", "treasury", "payment hub", "dashboard", "market data"],
      reference: {
        requirements: "<ol><li><b>Must have:</b> The dashboard must show expected settlements grouped by value date and currency, with money in, money out and the resulting balance for each group. Rationale: treasury plans funding by date and currency, not by single payments.</li><li><b>Must have:</b> When the expected balance for a value date and currency goes below the agreed threshold, an intraday alert must be raised naming the value date, the currency and the shortfall amount. Rationale: an alert without the shortfall is not actionable.</li><li><b>Must have:</b> Every figure on the dashboard must show how fresh it is, including the time of the last update from each source system. Rationale: treasury must know whether it is looking at live data or yesterday's data.</li><li><b>Should have:</b> The treasury team must be able to filter the dashboard by currency, value date and business unit.</li></ol>",
        funcspec: "<p><b>Inputs:</b> payment instructions, clearing records and settlement records from the source systems, each with value date, currency, amount and direction (in or out). <b>Processing:</b> group expected settlements by value date and currency, sum money in and money out, compute the expected balance, compare the balance with the agreed threshold, raise an alert when the balance falls below it. <b>Outputs:</b> dashboard by value date and currency, intraday alert with value date, currency and shortfall, data freshness stamps per source system. <b>Rules:</b> a settlement counts as expected until it is confirmed settled; a delayed settlement stays in its original value date and is flagged as delayed; alerts are raised once per breach until the balance recovers or the threshold is changed.</p>",
        stories: "<ul><li>As a corporate treasurer, I want to see expected settlements by value date and currency, so that I can see which day and which currency needs funding.</li><li>As a treasury analyst, I want an intraday alert that names the value date, currency and shortfall, so that I can act without re-running the numbers myself.</li><li>As a liquidity manager, I want to see how fresh each figure is, so that I never fund on stale data.</li></ul>",
        gherkin: "<ul><li><b>Balance shown:</b> Given expected settlements for EUR on 12 November, When the dashboard loads, Then it shows money in, money out and the expected balance for EUR on 12 November.</li><li><b>Shortfall alert:</b> Given an expected balance of minus EUR 500,000 for 12 November, When the balance is computed, Then an intraday alert is raised naming 12 November, EUR and the shortfall of EUR 500,000.</li><li><b>Stale data shown:</b> Given no settlement update for 2 hours, When the dashboard loads, Then the affected figures show a stale warning with the time of the last update.</li></ul>",
        flow: "<ol><li>Source systems send payment instructions, clearing records and settlement records.</li><li>Dashboard ingests each record with its value date, currency, amount and direction.</li><li>Records are grouped by value date and currency.</li><li>Money in and money out are summed per group and the expected balance is computed.</li><li>Each balance is compared with the agreed threshold.</li><li>A breach raises an intraday alert naming the value date, currency and shortfall.</li><li>Dashboard shows the balances, the alerts and the freshness of each source feed.</li><li>Treasury acts on the alert and the dashboard records the acknowledgement.</li></ol>",
        mapping: "<p>Source fields to the dashboard model: the instruction value date maps to the dashboard value date; the instruction currency maps to the dashboard currency; the amount maps to money in or money out by direction; the settlement status maps to expected or confirmed; the source system name maps to the freshness stamp for that feed. A record with no value date or no currency is quarantined and counted as missing data, never silently dropped.</p>",
        api: "<ul><li><b>GET /liquidity?valueDate=2026-11-12&amp;currency=EUR:</b> returns money in, money out and expected balance. Checks: figures match the source records, balance equals money in minus money out.</li><li><b>GET /liquidity/alerts:</b> returns active alerts with value date, currency and shortfall. Checks: each alert names all three, no alert for a balance above the threshold.</li><li><b>POST /settlements:</b> a settlement update returns 202 and refreshes the dashboard. Checks: dashboard balance changes by the settlement amount, freshness stamp updates to the current time.</li></ul>",
        negative: "<ul><li><b>Missing value date:</b> a record with no value date is quarantined, counted as missing data and shown on the dashboard as an exception, not silently dropped.</li><li><b>Currency mismatch:</b> a record whose currency does not match the account currency is flagged and excluded from the balance until corrected.</li><li><b>Delayed settlement:</b> a settlement that misses its value date stays in that date, is flagged as delayed, and the alert logic uses the delayed figure.</li><li><b>Alert system down:</b> when alerts cannot be sent, the dashboard shows a warning that alerts are unavailable, so treasury does not assume silence means all is well.</li></ul>"
      }
    }
  ];

  /* ---------------- State ---------------- */
  var state = {};
  var currentScenario = SCENARIOS[0].id;
  var currentArtefact = ARTEFACTS[0].id;
  var scores = {}; /* scenario id -> last score */

  function blankRow(art){
    var r = {};
    art.cols.forEach(function(c){ r[c.key] = (c.type === "select") ? c.options[0] : ""; });
    return r;
  }
  function blankSections(art){
    var s = {};
    art.sections.forEach(function(sec){ s[sec.key] = ""; });
    return s;
  }
  function initState(){
    SCENARIOS.forEach(function(sc){
      state[sc.id] = {};
      ARTEFACTS.forEach(function(art){
        state[sc.id][art.id] = (art.kind === "sections") ? blankSections(art) : [blankRow(art)];
      });
    });
  }
  function scenarioById(id){
    for(var i = 0; i < SCENARIOS.length; i++) if(SCENARIOS[i].id === id) return SCENARIOS[i];
    return SCENARIOS[0];
  }
  function artefactById(id){
    for(var i = 0; i < ARTEFACTS.length; i++) if(ARTEFACTS[i].id === id) return ARTEFACTS[i];
    return ARTEFACTS[0];
  }

  /* ---------------- Rendering ---------------- */
  function renderScenarioPicker(){
    var wrap = P.el("ba-scenarios");
    if(!wrap) return;
    wrap.innerHTML = SCENARIOS.map(function(sc){
      var scScore = scores[sc.id];
      var label = sc.num + ". " + P.esc(sc.title) +
        (scScore !== undefined ? " (" + scScore + "/100)" : "");
      return '<button type="button" class="pf-btn' + (sc.id === currentScenario ? "" : " secondary") +
        '" data-ba-scenario="' + sc.id + '"' +
        (sc.id === currentScenario ? ' aria-current="true"' : "") + ">" + label + "</button>";
    }).join("");
  }
  function renderBrief(){
    var sc = scenarioById(currentScenario);
    var box = P.el("ba-brief");
    if(!box) return;
    box.innerHTML = "<h2>" + sc.num + ". " + P.esc(sc.title) + "</h2>" +
      "<p><b>Business goal:</b> " + P.esc(sc.goal) + "</p>" +
      "<p>" + P.esc(sc.brief) + "</p>" +
      "<p>" + P.esc(sc.context) + "</p>" +
      "<p class=\"hint\">Your work is kept in this browser tab only. Download it before you leave the page, or it is lost when the tab closes.</p>";
  }
  function renderTabs(){
    var tabs = P.el("ba-tabs");
    if(!tabs) return;
    tabs.innerHTML = ARTEFACTS.map(function(a){
      return '<button type="button" data-ba-tab="' + a.id + '"' +
        ' aria-selected="' + (a.id === currentArtefact ? "true" : "false") + '">' +
        P.esc(a.label) + "</button>";
    }).join("");
  }
  function fieldInput(art, rowIdx, col, val){
    var name = art.id + "-" + rowIdx + "-" + col.key;
    if(col.type === "select"){
      var opts = col.options.map(function(o){
        return '<option value="' + P.esc(o) + '"' + (val === o ? " selected" : "") + ">" + P.esc(o) + "</option>";
      }).join("");
      return '<select data-ba-field="' + col.key + '" data-ba-row="' + rowIdx + '" aria-label="' + P.esc(col.label) + '">' + opts + "</select>";
    }
    return '<textarea data-ba-field="' + col.key + '" data-ba-row="' + rowIdx + '" rows="2" placeholder="' + P.esc(col.ph || "") + '" aria-label="' + P.esc(col.label) + '">' + P.esc(val || "") + "</textarea>";
  }
  function renderPanels(){
    var wrap = P.el("ba-panels");
    if(!wrap) return;
    var sc = scenarioById(currentScenario);
    wrap.innerHTML = ARTEFACTS.map(function(art){
      var s = state[currentScenario][art.id];
      var body = "";
      if(art.kind === "sections"){
        body = art.sections.map(function(sec){
          return '<div class="pf-field"><label for="ba-sec-' + art.id + "-" + sec.key + '">' + P.esc(sec.label) + '</label>' +
            '<textarea id="ba-sec-' + art.id + "-" + sec.key + '" data-ba-section="' + sec.key + '" placeholder="' + P.esc(sec.ph) + '">' + P.esc(s[sec.key] || "") + "</textarea></div>";
        }).join("");
      } else {
        var head = "<tr>" + art.cols.map(function(c){ return "<th class=\"wrap\">" + P.esc(c.label) + "</th>"; }).join("") + "<th>Remove</th></tr>";
        var rows = s.map(function(row, i){
          var cells = art.cols.map(function(c){
            return '<td class="wrap">' + fieldInput(art, i, c, row[c.key]) + "</td>";
          }).join("");
          return "<tr>" + cells + '<td><button type="button" class="pf-btn danger" data-ba-remove="' + i + '" aria-label="Remove row ' + (i + 1) + '">Remove</button></td></tr>';
        }).join("");
        body = '<div class="pf-tablewrap"><table><thead>' + head + "</thead><tbody>" + rows + "</tbody></table></div>" +
          '<div class="pf-btnrow"><button type="button" class="pf-btn secondary" data-ba-addrow>Add row</button></div>';
        if(art.isFlow){
          var flowSteps = s.map(function(r, i){
            return { text: (r.step || "").trim(), owner: (r.owner || "").trim(), idx: i };
          }).filter(function(st){ return st.text; });
          if(flowSteps.length){
            body += '<div class="ba-flow-wrap"><h3>Your flow</h3><div class="pf-flow">' + flowSteps.map(function(st, i){
              return '<div class="node"><b>Step ' + (st.idx + 1) + "</b><span>" + P.esc(st.text) + (st.owner ? " (" + P.esc(st.owner) + ")" : "") + "</span></div>" +
                (i < flowSteps.length - 1 ? '<div class="arrow">&rarr;</div>' : "");
            }).join("") + "</div></div>";
          } else {
            body += '<div class="ba-flow-wrap"><p class="hint">Add steps above and the flow diagram appears here.</p></div>';
          }
        }
      }
      var ref = sc.reference[art.id] || "";
      body += '<div class="pf-btnrow"><button type="button" class="pf-btn secondary" data-ba-ref-toggle>Show reference solution</button></div>' +
        '<div class="ba-ref" data-ba-ref style="display:none"><h3>Reference solution: ' + P.esc(art.label) + '</h3>' + ref +
        '<p class="hint">This is one good answer, not the only answer. It shows the shape and the level of detail expected. Your work above is not changed by opening it.</p></div>';
      return '<div data-ba-panel="' + art.id + '" style="display:' + (art.id === currentArtefact ? "" : "none") + '">' +
        "<h2>" + P.esc(art.label) + "</h2>" +
        '<p class="lede">' + P.esc(art.hint) + "</p>" + body + "</div>";
    }).join("");
  }
  function renderAll(){
    renderScenarioPicker();
    renderBrief();
    renderTabs();
    renderPanels();
    renderScoreLine();
  }
  function renderScoreLine(){
    var saved = P.getScore(FEATURE_ID);
    var best = P.el("ba-best");
    if(best){
      best.textContent = saved ? ("Best BA Studio score: " + saved.best + " / " + saved.bestTotal + " (" + (saved.label || "") + ")") : "Best BA Studio score: not attempted yet";
    }
    var scScore = scores[currentScenario];
    var line = P.el("ba-score-text");
    if(line){
      line.textContent = (scScore === undefined)
        ? "Scenario " + scenarioById(currentScenario).num + " not scored yet. Fill the templates, then run the feedback."
        : "Scenario " + scenarioById(currentScenario).num + " score: " + scScore + " of 100 points. " +
          (scScore >= 80 ? "Strong submission." : scScore >= 50 ? "A solid start. Read the suggestions below and improve the weakest criteria." : "A first draft. Read the suggestions below and fill the gaps.");
    }
    P.renderScoreBar("ba-score-bar", scScore === undefined ? 0 : scScore, TOTAL);
  }

  /* ---------------- Text collection ---------------- */
  function artefactText(sid, aid){
    var art = artefactById(aid);
    var s = state[sid][aid];
    var parts = [];
    if(art.kind === "sections"){
      art.sections.forEach(function(sec){ parts.push(s[sec.key] || ""); });
    } else {
      s.forEach(function(row){
        art.cols.forEach(function(c){ parts.push(row[c.key] || ""); });
      });
    }
    return parts.join("\n");
  }
  function allText(sid){
    return ARTEFACTS.map(function(a){ return artefactText(sid, a.id); }).join("\n");
  }
  function countFilledRows(sid, aid){
    var art = artefactById(aid);
    var s = state[sid][aid];
    if(art.kind === "sections"){
      var n = 0;
      art.sections.forEach(function(sec){ if((s[sec.key] || "").trim().length >= 10) n++; });
      return n;
    }
    var count = 0;
    s.forEach(function(row){
      /* Selects always carry a default value, so only free-text columns
         count toward "filled". A blank row must not count as filled. */
      var filled = art.cols.some(function(c){ return c.type !== "select" && (row[c.key] || "").trim().length > 0; });
      if(filled) count++;
    });
    return count;
  }
  function countWords(t){ return (t || "").trim().split(/\s+/).filter(Boolean).length; }

  /* ---------------- Feedback engine ---------------- */
  function analyse(sid){
    var sc = scenarioById(sid);
    var lower = allText(sid).toLowerCase();
    var totalWords = countWords(allText(sid));
    var crit = {};
    var suggestions = [];

    /* 1. Completeness (25): each artefact meets its minimum filled count. */
    var compPoints = 0, compMax = ARTEFACTS.length;
    var compMissing = [];
    ARTEFACTS.forEach(function(art){
      var n = countFilledRows(sid, art.id);
      if(n >= art.min){ compPoints++; }
      else compMissing.push(art.label + " has " + n + " filled item" + (n === 1 ? "" : "s") + ", needs at least " + art.min);
    });
    crit.completeness = Math.round(compPoints / compMax * WEIGHTS.completeness);
    if(compMissing.length){
      suggestions.push("Completeness: " + compMissing.join("; ") + ".");
    } else {
      suggestions.push("Completeness: every artefact meets its minimum item count. Good.");
    }

    /* 2. Clarity (15): vague words and very long sentences. */
    var vagueFound = [];
    VAGUE_WORDS.forEach(function(w){
      if(lower.indexOf(w) !== -1) vagueFound.push(w);
    });
    var sentences = allText(sid).split(/[.!?\n]+/).map(function(x){ return x.trim(); }).filter(Boolean);
    var longSentences = sentences.filter(function(x){ return countWords(x) > 35; }).length;
    var clarityScore = WEIGHTS.clarity;
    if(vagueFound.length) clarityScore -= Math.min(9, vagueFound.length * 3);
    if(longSentences) clarityScore -= Math.min(6, longSentences * 2);
    crit.clarity = Math.max(0, clarityScore);
    if(vagueFound.length){
      suggestions.push("Clarity: vague wording found: " + vagueFound.map(function(w){ return "'" + w + "'"; }).join(", ") + ". Replace each one with the exact list, value or rule.");
    }
    if(longSentences){
      suggestions.push("Clarity: " + longSentences + " sentence" + (longSentences === 1 ? " is" : "s are") + " longer than 35 words. Split long sentences so each requirement says one thing.");
    }
    if(!vagueFound.length && !longSentences){
      suggestions.push("Clarity: no vague words and no over-long sentences found. Good.");
    }

    /* 3. Testability (20): requirements with a measurable outcome. */
    var reqArt = artefactById("requirements");
    var reqRows = state[sid].requirements.filter(function(r){ return (r.text || "").trim(); });
    var measurableRows = 0;
    reqRows.forEach(function(r){
      var t = (r.text || " " + (r.rationale || "")).toLowerCase();
      var hasNumber = /\d/.test(t);
      var hasMarker = MEASURABLE.some(function(m){ return t.indexOf(m) !== -1; });
      if(hasNumber || hasMarker) measurableRows++;
    });
    var gherkinRows = countFilledRows(sid, "gherkin");
    var testScore = 0;
    if(reqRows.length){
      testScore += Math.round(measurableRows / reqRows.length * 12);
    }
    if(gherkinRows >= 2) testScore += 8;
    else if(gherkinRows === 1) testScore += 4;
    crit.testability = Math.min(WEIGHTS.testability, testScore);
    if(reqRows.length === 0){
      suggestions.push("Testability: you have no business requirements yet, so nothing can be tested. Add at least 3 requirements with a measurable outcome.");
    } else if(measurableRows < reqRows.length){
      suggestions.push("Testability: " + (reqRows.length - measurableRows) + " of your " + reqRows.length + " requirement(s) state no measurable outcome. Add a number, a time limit, a status value or an acceptance result to each one, for example 'within 5 minutes' or 'status RJCT'.");
    }
    if(gherkinRows < 2){
      suggestions.push("Testability: add at least 2 Gherkin scenarios with a checkable Then step, so each requirement has an acceptance test.");
    }

    /* 4. Business alignment (15): scenario keywords present. */
    var missingKw = sc.keywords.filter(function(k){ return lower.indexOf(k.toLowerCase()) === -1; });
    var foundKw = sc.keywords.length - missingKw.length;
    crit.alignment = Math.round(foundKw / sc.keywords.length * WEIGHTS.alignment);
    if(missingKw.length){
      suggestions.push("Business alignment: your submission does not mention: " + missingKw.slice(0, 6).join(", ") + ". These are central to the scenario goal (" + sc.goal + "). Weave them into the requirements and the functional specification.");
    } else {
      suggestions.push("Business alignment: your submission names the scenario's key entities and constraints. Good.");
    }

    /* 5. Exception handling (15): scenario exception terms present. */
    var missingEx = sc.exceptions.filter(function(k){ return lower.indexOf(k.toLowerCase()) === -1; });
    var foundEx = sc.exceptions.length - missingEx.length;
    crit.exceptions = Math.round(foundEx / sc.exceptions.length * WEIGHTS.exceptions);
    var negRows = countFilledRows(sid, "negative");
    if(negRows < 2){
      suggestions.push("Exception handling: you have " + negRows + " negative test case(s), need at least 2. Add cases for the failure modes in this scenario, for example: " + missingEx.slice(0, 3).join(", ") + ".");
    }
    if(missingEx.length){
      suggestions.push("Exception handling: your submission does not cover: " + missingEx.slice(0, 5).join(", ") + ". Name what happens in each case: is the payment held, rejected, retried or escalated, and who is told?");
    }
    if(!missingEx.length && negRows >= 2){
      suggestions.push("Exception handling: the scenario's failure modes are covered and you have negative tests. Good.");
    }

    /* 6. Integration dependencies (10): upstream/downstream systems named. */
    var missingInt = sc.integrations.filter(function(k){ return lower.indexOf(k.toLowerCase()) === -1; });
    var foundInt = sc.integrations.length - missingInt.length;
    crit.integration = Math.round(foundInt / sc.integrations.length * WEIGHTS.integration);
    if(missingInt.length){
      suggestions.push("Integration dependencies: your submission does not name: " + missingInt.slice(0, 5).join(", ") + ". Name the systems, message types and handoffs your flow depends on, in the functional specification and the field mapping.");
    } else {
      suggestions.push("Integration dependencies: the upstream and downstream systems and handoffs are named. Good.");
    }

    var total = crit.completeness + crit.clarity + crit.testability + crit.alignment + crit.exceptions + crit.integration;
    return { crit: crit, suggestions: suggestions, total: total, totalWords: totalWords, missingKw: missingKw, missingEx: missingEx, missingInt: missingInt };
  }

  function criterionLabel(id){
    return { completeness: "Completeness", clarity: "Clarity", testability: "Testability",
      alignment: "Business alignment", exceptions: "Exception handling", integration: "Integration dependencies" }[id];
  }

  function runFeedback(){
    var sid = currentScenario;
    var sc = scenarioById(sid);
    var a = analyse(sid);
    scores[sid] = a.total;
    P.recordScore(FEATURE_ID, a.total, TOTAL, "Scenario " + sc.num + ": " + sc.title);
    renderScoreLine();
    renderScenarioPicker();

    var perArt = ARTEFACTS.map(function(art){
      var n = countFilledRows(sid, art.id);
      var ok = n >= art.min;
      return "<li><span class=\"" + (ok ? "pf-check" : "pf-cross") + "\">" + (ok ? "Done" : "Missing") + "</span> " +
        P.esc(art.label) + ": " + n + " filled, minimum " + art.min + "</li>";
    }).join("");

    var critRows = Object.keys(WEIGHTS).map(function(id){
      return "<tr><td>" + criterionLabel(id) + "</td><td>" + a.crit[id] + " / " + WEIGHTS[id] + "</td></tr>";
    }).join("");

    var sugg = a.suggestions.map(function(s){ return "<li>" + P.esc(s) + "</li>"; }).join("");
    var kind = a.total >= 80 ? "ok" : a.total >= 50 ? "warn" : "err";
    var html = "<p><b>Scenario " + sc.num + " feedback: " + a.total + " of 100 points.</b> " +
      (a.totalWords === 0 ? "Your submission is empty. Fill the templates first, then run the feedback again." :
       "Your submission has " + a.totalWords + " words across the eight artefacts.") + "</p>" +
      "<h3>Score by criterion</h3>" +
      '<div class="pf-tablewrap"><table><thead><tr><th>Criterion</th><th>Score</th></tr></thead><tbody>' + critRows + "</tbody></table></div>" +
      "<h3>Per artefact</h3><ul>" + perArt + "</ul>" +
      "<h3>What to fix, specifically</h3><ol>" + sugg + "</ol>";
    P.showFeedback("ba-feedback", kind, html);
    var fb = P.el("ba-feedback");
    if(fb) fb.scrollIntoView({ block: "start" });
  }

  /* ---------------- Download ---------------- */
  function buildDownload(sid){
    var sc = scenarioById(sid);
    var lines = [];
    lines.push("Payments Academy: Business Analyst Studio");
    lines.push("Scenario " + sc.num + ": " + sc.title);
    lines.push("Business goal: " + sc.goal);
    lines.push("");
    lines.push(sc.brief);
    lines.push("");
    ARTEFACTS.forEach(function(art){
      lines.push("==== " + art.label + " ====");
      lines.push(artefactText(sid, art.id) || "(empty)");
      lines.push("");
    });
    if(scores[sid] !== undefined) lines.push("Feedback score: " + scores[sid] + " of 100 points.");
    lines.push("Synthetic educational data only. Not real banking advice.");
    return lines.join("\n");
  }
  function downloadCurrent(){
    var sc = scenarioById(currentScenario);
    P.downloadText("ba-studio-scenario-" + sc.num + "-submission.txt", buildDownload(currentScenario));
    P.showFeedback("ba-feedback", "ok", "Submission for scenario " + sc.num + " downloaded as a text file.");
  }
  function downloadAll(){
    var text = SCENARIOS.map(function(sc){ return buildDownload(sc.id); }).join("\n\n----------\n\n");
    P.downloadText("ba-studio-all-scenarios-submission.txt", text);
    P.showFeedback("ba-feedback", "ok", "All five scenario submissions downloaded as one text file.");
  }

  /* ---------------- Reset ---------------- */
  function resetScenario(){
    var sc = scenarioById(currentScenario);
    ARTEFACTS.forEach(function(art){
      state[currentScenario][art.id] = (art.kind === "sections") ? blankSections(art) : [blankRow(art)];
    });
    delete scores[currentScenario];
    renderAll();
    P.showFeedback("ba-feedback", "ok", "Scenario " + sc.num + " cleared. Fill the templates again to try for 100.");
  }
  function resetAll(){
    initState();
    scores = {};
    currentScenario = SCENARIOS[0].id;
    currentArtefact = ARTEFACTS[0].id;
    P.resetFeature(FEATURE_ID);
    renderAll();
    P.showFeedback("ba-feedback", "ok", "BA Studio reset. All five scenarios cleared and the stored best score removed.");
  }

  /* ---------------- Events ---------------- */
  function bind(){
    document.addEventListener("click", function(e){
      var t = e.target;
      var scBtn = t.closest ? t.closest("[data-ba-scenario]") : null;
      if(scBtn){
        currentScenario = scBtn.getAttribute("data-ba-scenario");
        currentArtefact = ARTEFACTS[0].id;
        renderAll();
        return;
      }
      var tabBtn = t.closest ? t.closest("[data-ba-tab]") : null;
      if(tabBtn){
        currentArtefact = tabBtn.getAttribute("data-ba-tab");
        renderTabs();
        renderPanels();
        return;
      }
      var addBtn = t.closest ? t.closest("[data-ba-addrow]") : null;
      if(addBtn){
        var art = artefactById(currentArtefact);
        state[currentScenario][currentArtefact].push(blankRow(art));
        renderPanels();
        return;
      }
      var remBtn = t.closest ? t.closest("[data-ba-remove]") : null;
      if(remBtn){
        var rows = state[currentScenario][currentArtefact];
        var idx = parseInt(remBtn.getAttribute("data-ba-remove"), 10);
        if(rows.length > 1) rows.splice(idx, 1);
        else rows[0] = blankRow(artefactById(currentArtefact));
        renderPanels();
        return;
      }
      var refBtn = t.closest ? t.closest("[data-ba-ref-toggle]") : null;
      if(refBtn){
        var panel = refBtn.closest("[data-ba-panel]");
        var ref = panel ? panel.querySelector("[data-ba-ref]") : null;
        if(ref){
          var open = ref.style.display !== "none";
          ref.style.display = open ? "none" : "";
          refBtn.textContent = open ? "Show reference solution" : "Hide reference solution";
        }
        return;
      }
    });
    var panels = P.el("ba-panels");
    if(panels){
      panels.addEventListener("input", function(e){
        var t = e.target;
        var art = artefactById(currentArtefact);
        if(t.hasAttribute("data-ba-section")){
          state[currentScenario][currentArtefact][t.getAttribute("data-ba-section")] = t.value;
        } else if(t.hasAttribute("data-ba-field")){
          var row = parseInt(t.getAttribute("data-ba-row"), 10);
          var key = t.getAttribute("data-ba-field");
          if(state[currentScenario][currentArtefact][row]) state[currentScenario][currentArtefact][row][key] = t.value;
          if(art.isFlow) renderFlowOnly();
        }
      });
      panels.addEventListener("change", function(e){
        var t = e.target;
        if(t.hasAttribute("data-ba-field")){
          var row = parseInt(t.getAttribute("data-ba-row"), 10);
          var key = t.getAttribute("data-ba-field");
          if(state[currentScenario][currentArtefact][row]) state[currentScenario][currentArtefact][row][key] = t.value;
        }
      });
    }
    var runBtn = P.el("ba-run-feedback");
    if(runBtn) runBtn.addEventListener("click", runFeedback);
    var dlBtn = P.el("ba-download");
    if(dlBtn) dlBtn.addEventListener("click", downloadCurrent);
    var dlAllBtn = P.el("ba-download-all");
    if(dlAllBtn) dlAllBtn.addEventListener("click", downloadAll);
    var resetScBtn = P.el("ba-reset-scenario");
    if(resetScBtn) resetScBtn.addEventListener("click", function(){
      if(confirm("Clear this scenario's work?")) resetScenario();
    });
    var resetAllBtn = P.el("ba-reset-all");
    if(resetAllBtn) resetAllBtn.addEventListener("click", function(){
      if(confirm("Clear all BA Studio work and the stored best score?")) resetAll();
    });
  }
  function renderFlowOnly(){
    var panel = document.querySelector('[data-ba-panel="flow"]');
    if(!panel || panel.style.display === "none") return;
    var wrap = panel.querySelector(".ba-flow-wrap");
    if(!wrap) return;
    var s = state[currentScenario].flow;
    var flowSteps = s.map(function(r, i){
      return { text: (r.step || "").trim(), owner: (r.owner || "").trim(), idx: i };
    }).filter(function(st){ return st.text; });
    if(flowSteps.length){
      wrap.innerHTML = '<h3>Your flow</h3><div class="pf-flow">' + flowSteps.map(function(st, i){
        return '<div class="node"><b>Step ' + (st.idx + 1) + "</b><span>" + P.esc(st.text) + (st.owner ? " (" + P.esc(st.owner) + ")" : "") + "</span></div>" +
          (i < flowSteps.length - 1 ? '<div class="arrow">&rarr;</div>' : "");
      }).join("") + "</div>";
    } else {
      wrap.innerHTML = '<p class="hint">Add steps above and the flow diagram appears here.</p>';
    }
  }

  /* ---------------- Init ---------------- */
  document.addEventListener("DOMContentLoaded", function(){
    initState();
    renderAll();
    bind();
  });
})();
