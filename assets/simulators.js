simB_hubData = [{"name": "Payment Channels", "inn": "A customer instruction from online banking, a mobile app, a branch terminal, a host to host file, an API call from a corporate treasury system. An incoming interbank payment from another bank is NOT a customer channel: it arrives separately through the messaging and clearing interface, is not authenticated as a customer, and its debtor is another bank, not a customer.", "does": "Authenticates the user or system, captures the instruction, and hands it to the hub in a standard internal format.", "out": "A captured instruction with a channel identifier, a timestamp, and an audit reference.", "calls": "API Gateway for API traffic, Payment Ingestion Layer, identity and authentication service, core banking for account lookup.", "data": "Customer identifier, channel identifier, instruction reference, timestamp, authentication result.", "fails": "Customers cannot submit payments at all, so the bank loses transactions immediately. For example, a failed mobile channel on payroll day can block many salary payments at once.", "recovery": "Switch customers to an alternate channel, then replay captured instructions from the channel log once the channel returns, confirming that no instruction was lost or duplicated."}, {"name": "API Gateway", "inn": "An API request, for example a corporate client calling a payment initiation endpoint with an OAuth token and a signed payload.", "does": "Authenticates the caller, enforces rate limits and quotas, validates the token scope, logs the call, and routes it to the right internal service.", "out": "An authorised and logged request, or a clear rejection such as a 401 for a bad token or a 429 for excess volume.", "calls": "Identity provider, rate limit store, Payment Ingestion Layer, audit logging service.", "data": "Caller identifier, token scope, request payload, rate limit counters, call log.", "fails": "Partner systems cannot reach the hub and legitimate traffic is blocked. For example, a gateway outage during a peak trading window can halt many treasury payments per hour.", "recovery": "Fail over to a standby gateway for new traffic. An API gateway is normally stateless and does not queue partner requests for replay: requests in flight are the caller's responsibility to retry with the same idempotency key, and the hub deduplicates on that key."}, {"name": "Payment Ingestion Layer", "inn": "A mix of formats, including pain.001 files, ISO 20022 pacs.008 messages, SWIFT MT103 messages, JSON API payloads, and flat files.", "does": "Parses each format, deduplicates on the idempotency key (channel/API), on MsgId + InstrId for ISO 20022 files, and on the UETR end to end for SWIFT/gpi payments, assigns a unique payment identifier, and stores the original instruction unchanged for audit. An instruction reference alone is a business reference, not a uniqueness guarantee: the same reference can legitimately recur, and different channels can assign colliding references.", "out": "One normalised payment record that every later component can read.", "calls": "Original instruction, format type, instruction reference, idempotency key, MsgId, InstrId, EndToEndId, UETR, assigned payment identifier.", "data": "Original instruction, format type, instruction reference, assigned payment identifier.", "fails": "Payments are lost, duplicated, or misread. For example, a parsing error on a 50,000 item bulk file can corrupt an entire payroll run.", "recovery": "Quarantine the failed items, reparse from the stored original instruction, and use the deduplication check to drop any item that was already accepted."}, {"name": "Payment Validation Engine", "inn": "The normalised payment record with debtor, creditor, amount, currency, value date, and charges details.", "does": "Runs structural checks such as the ISO 13616 MOD 97-10 IBAN check (remainder must be 1), currency and country rules, cut off time checks, mandatory field checks, and account status checks against core banking. Technical validation (ACTC: the message is well formed) is distinct from business and customer-profile validation (ACCP: the instruction passes customer-profile checks). Where the jurisdiction requires it, Confirmation of Payee / Verification of Payee (name to account matching) is also checked here.", "out": "A validated payment, or a rejection with a specific reason code such as missing beneficiary account or value date in the past.", "calls": "Core Banking Integration, reference data service, calendar and cut off service.", "data": "IBAN, BIC, amount, currency, value date, account status, mandatory field set.", "fails": "Invalid payments slip through and fail later at clearing, causing expensive returns, or valid payments are wrongly rejected, which damages client trust and creates manual repair work.", "recovery": "Return the payment to the channel with the exact reason code, let the customer correct the data, and treat the corrected instruction as a new payment rather than a silent retry."}, {"name": "Enrichment Services", "inn": "A validated payment that may lack a BIC, a clearing code, a charge bearer, a purpose code, or a regulatory reporting field.", "does": "Looks up reference data, looks up the BIC in the BIC directory using the bank identifier in the IBAN where the IBAN country format carries one (a BIC is not embedded in an IBAN and cannot be derived from it by algorithm; resolving it needs a directory lookup, and it fails for non-IBAN countries such as the US, where accounts use routing numbers), resolves the beneficiary bank clearing route, adds the correct charge option, and attaches country and currency rules. If no BIC can be resolved, the payment is held for repair.", "out": "A complete payment ready for screening, routing, and settlement.", "calls": "Reference data service, BIC directory, clearing directory, regulatory rules service.", "data": "IBAN, beneficiary bank identifier, country, currency, purpose, charge bearer.", "fails": "Payments go out with wrong routing codes or missing regulatory data, so for example a 750,000 dollar payment to India may be delayed for manual repair, or a payment may be rejected by the receiving bank for incomplete information.", "recovery": "Hold the payment in the enrichment queue, refresh the reference data, re-enrich from the stored original instruction, and release only when every required field is present."}, {"name": "Sanctions and AML Screening", "inn": "The enriched payment with full debtor, creditor, and intermediary details, including names, addresses, and countries.", "does": "Matches those details against sanctions lists from OFAC (US), the European Union, the United Nations, and UK HMT/OFSI, plus internal watchlists, using fuzzy matching for name variations and transliterations. The applicable lists depend on the bank's jurisdictions. Screening also uses PEP, adverse-media and transaction-monitoring context, not list matching alone. A fuzzy match only holds the payment; a confirmed match blocks it.", "out": "A clear pass, a hold for manual review, or a block with a case reference.", "calls": "Sanctions list provider, internal watchlist, case management system, Exception Management.", "data": "Debtor and creditor names and addresses, countries, intermediary banks, payment amount and purpose.", "fails": "A missed match can mean processing a payment for a sanctioned entity, which brings regulatory fines, licence risk, and reputational damage. Illustratively, fines in past enforcement cases have run into hundreds of millions of dollars; the amount depends on the breach and the bank.", "recovery": "Quarantine the payment, re-screen against the latest lists once the service recovers, and never release a payment that has not produced a recorded screening result."}, {"name": "Fraud Detection Engine", "inn": "The screened payment plus behavioural context, including device data, login history, typical amounts, payee history, and velocity over the last 24 hours.", "does": "Runs rules and machine learning models, compares the payment against the customer normal pattern, and produces a risk score with reasons.", "out": "An approval, a step up authentication challenge, or a block with a fraud case.", "calls": "Fraud rules engine, device intelligence service, customer behaviour store, case management system.", "data": "Risk score, device fingerprint, payee history, transaction velocity, amount versus normal pattern.", "fails": "A false negative lets, for example, a 90,000 pound authorised push payment fraud through, while a false positive blocks genuine payments and drives customers to call the bank in frustration.", "recovery": "Hold the payment for manual fraud review, apply stricter step up authentication, and re-score once the engine returns before any release."}, {"name": "Payment Orchestrator", "inn": "A screened and fraud checked payment plus the state of every downstream service.", "does": "Coordinates the payment as a state machine over asynchronous events, not as one synchronous call chain. Channel and API calls are synchronous (immediate accept or reject), but screening, fraud, clearing and settlement are typically asynchronous and event-driven (message queues, pub/sub, callbacks), with long waits for manual review, clearing windows and value dates that cannot be a synchronous call. The UETR or payment ID is carried as the correlation ID on every event and call. The durable event log is the source of truth; the workflow state is a projection of it. Each step carries its own idempotency key, retries are bounded with backoff and a dead-letter queue, and a timeout with no confirmation moves the payment to Unknown for investigation, never to an assumed outcome.", "out": "A sequence of state transitions driven by events, and a single consistent payment status that channels, operations, and customers can all read.", "calls": "Workflow state store, durable event log, message queue, every hub component (by event, not by synchronous call).", "data": "Payment status, workflow step, component results, retry counters, correlation ID (UETR / payment ID), idempotency keys per step.", "fails": "Payments stall in unknown states, duplicate processing becomes likely, and operations teams cannot tell a customer whether, for example, a 1 million dollar payment is sent, held, or lost.", "recovery": "Rebuild the payment state from the durable event log, resume the workflow from the last confirmed step, and use the idempotency key to avoid repeating any step that already completed. This sentence is kept verbatim from the audited version because it is correct."}, {"name": "Routing Engine", "inn": "The payment with amount, currency, destination country, urgency, cost limits, and the beneficiary bank details.", "does": "Applies routing tables and business rules, choosing for example between an SCT/SCT Inst route via a clearing house or TIPS, Faster Payments, CHAPS/T2/Fedwire, or correspondent banking (serial or cover method), based on cost, speed, cut off times, and availability. SWIFT gpi is NOT a route: it is a tracking and rules layer (Tracker plus UETR) on top of the existing SWIFT network, and the money still travels through the correspondent chain or clearing system. gpi tracking and confirmation apply on cross-border SWIFT payments.", "out": "A selected route with the next hop, the expected arrival time, and the fee estimate.", "calls": "Routing tables, clearing calendar, correspondent bank directory, Liquidity Management.", "data": "Amount, currency, destination, urgency, cut off times, route costs, correspondent availability.", "fails": "Payments take expensive or slow routes, miss cut off times, or fail entirely, so for example a time critical 5 million euro treasury payment may arrive a day late and breach a contract.", "recovery": "Re-route only where the routing policy and the customer instruction permit it. A route change can change the value date, cut off, charges (OUR/SHA/BEN), FX and scheme rules, and can breach the customer's instructed rail: an SCT Inst payment cannot silently become a next-day SCT, and a CHAPS payment cannot silently become Faster Payments above its limit. Where the value date or charges change, they must be re-disclosed, and high-value or time-critical re-routes need operations approval. Never present automatic re-routing as the default."}, {"name": "Payment Processing Engine", "inn": "A routed payment with the correct message format specification for its rail.", "does": "Builds the outbound message, such as a pacs.008 for an ISO 20022 rail or an MT103 for a SWIFT payment, sends it, waits for acknowledgements, and handles timeouts, retries, and confirmations. A retry must reuse the same MsgId and UETR: a retry with a new MsgId is a new payment. MT103 is being retired for in-scope cross-border customer payments under CBPR+ (ISO 20022 migration); it remains only in defined coexistence and non-CBPR+ contexts. The pacs.008 settlement method (SttlmMtd CLRG/INDA/INGA/COVE) determines the settlement leg.", "out": "A transmitted message plus a delivery acknowledgement or a failure notice.", "calls": "Clearing Connectivity, message queue, acknowledgement store, Exception Management.", "data": "Message format, route, acknowledgement status, retry count, idempotency key.", "fails": "Payments may be sent twice, never sent at all, or sent without confirmation, and a processing failure during a peak hour can leave many payments in an unconfirmed state that operations must resolve manually.", "recovery": "Check the acknowledgement store before any resend, confirm with the next bank whether the original message arrived, and resend only when the original is confirmed as not received."}, {"name": "Liquidity Management", "inn": "The queue of outgoing payments plus the bank positions at central banks, correspondent banks, and clearing accounts.", "does": "Forecasts intraday liquidity, prioritises urgent payments, holds lower priority payments when funds are short, and moves funds between accounts to cover shortfalls. Liquidity is checked BEFORE a payment is released to clearing or settlement: a payment is not built and sent that cannot settle.", "out": "A funding decision for each payment: release, hold, or queue with a scheduled release time.", "calls": "Settlement Engine, nostro account balances, central bank account, treasury funding service.", "data": "Payment queue, account balances, settlement timetable, payment priorities.", "fails": "The bank may have insufficient funds in its RTGS settlement account, so payments queue or are rejected at the cut-off, or it may miss a central bank deadline and delay critical payments. A central-bank (RTGS) settlement account cannot be casually overdrawn: RTGS payments settle only if funded, or against intraday liquidity pre-arranged against eligible collateral. For example, a liquidity shortfall of 200 million pounds sterling at a CHAPS cut-off can trigger regulatory attention and penalty interest. CHAPS is sterling-only; the US large-value analogue is Fedwire (USD, RTGS).", "recovery": "Hold lower priority payments, move funds from another account to cover the shortfall, and release the queue in priority order once funding is restored."}, {"name": "Clearing Connectivity", "inn": "A formatted payment message ready for a specific rail, such as Faster Payments in the United Kingdom, SEPA credit transfer in Europe, or a cross-border payment via correspondent banking.", "does": "Manages secure connections, certificates, message queues, acknowledgements, and end of day files, in three distinct layers that must not be confused: (a) messaging (SWIFT FIN / FINplus, APIs) - SWIFT is a messaging network, it does not clear or settle funds; (b) clearing / clearing house (for example Pay.UK Faster Payments, EBA Clearing STEP2, a local ACH); (c) settlement (CHAPS/T2/Fedwire RTGS, TIPS, nostro). Fedwire is NOT a clearing system: it is a Federal Reserve RTGS settlement system (individual, gross, final, in central-bank money). SEPA is a scheme area, not a single system: SCT/SCT Inst clear via clearing houses and settle via T2/TIPS.", "out": "A submitted clearing instruction and a clearing reference that proves submission.", "calls": "Messaging networks (SWIFT), clearing houses and networks, certificate store, message queues.", "data": "Connection status, certificates, queue depth, clearing reference, acknowledgements.", "fails": "The bank is cut off from that rail entirely, so every payment for that system queues up, customers see delays, and for example a four hour SWIFT connectivity outage can strand many pending cross-border payments.", "recovery": "Queue payments for the affected rail, switch to an alternate route only where the rules allow and only after proving the original was not accepted by the first rail (submission reference / pacs.002 status, or a pacs.028 status investigation); otherwise the alternate-route send is a duplicate. A switch also needs a new message, often a new MsgId with the UETR linkage kept, a new value date, and scheme permission. Submit the queued items in order once connectivity returns."}, {"name": "Settlement Engine", "inn": "A cleared payment instruction plus the bank settlement account positions and the settlement timetable for that rail.", "does": "Settles the payment according to its settlement model, and the model must be stated, because the three models are different postings. RTGS (CHAPS/T2/Fedwire): the central bank debits the sending bank's RTGS settlement account and credits the receiving bank's RTGS account; settlement is final and irrevocable on posting, and there is no reversal. Deferred net settlement: payments are netted and the net position settles at the scheduled time. Nostro (correspondent): the bank debits its nostro account with the correspondent (an asset), and the correspondent pays onward. The customer debit is a core-banking posting, normally done before and independently of interbank settlement, not by the settlement engine, and there is no generic 'credits the settlement account' step and no 'settlement instruction to a clearing house' for RTGS rails. For correspondent settlement there is no central-bank instruction at all.", "out": "A settled payment with a settlement timestamp, a settlement reference, and updated account balances, under the stated settlement model.", "calls": "Core Banking Integration, central bank settlement system, clearing house, General Ledger.", "data": "Settlement model (RTGS / deferred net / nostro), settlement account balance, settlement timetable, settlement reference, value date.", "fails": "Money may be debited from a customer without reaching the beneficiary, or settlement may be delayed past the value date, which creates interest claims, breaks, and regulatory reporting errors that take days to untangle.", "recovery": "A customer re-credit is lawful only when the payment never settled or was rejected pre-settlement. A finally-settled RTGS payment is final and irrevocable and cannot be undone by re-crediting the customer. 'Saga compensation' is a distributed-systems workflow pattern, not a settlement mechanism, and is not used here: an unsettled queued payment is held or released, and a payment that cannot settle is rejected at the cut-off with the customer re-credited and told why. Unexplained funds are parked in a suspense account only with a named owner and ageing, never as a routine settlement step."}, {"name": "Core Banking Integration", "inn": "A request to debit or credit an account, check a balance, verify an account holder, or post a fee.", "does": "Translates the hub payment event into a core banking transaction, applies it to the correct account, and returns the new balance and posting confirmation.", "out": "A confirmed account posting that the customer can see in online banking.", "calls": "Core banking system, account master, balance service.", "data": "Account number, amount, currency, value date, posting reference, new balance.", "fails": "Payments settle in the clearing system but never appear on customer accounts, or debits are applied twice, so a customer who sent 25,000 dollars sees the money leave twice and calls the bank to complain about a duplicate debit.", "recovery": "Retry the posting with the same posting reference for that leg, so a completed posting is never applied twice. Idempotency keys are scoped: the hub payment idempotency key identifies the payment, and the posting reference identifies the ledger entry. The same key with a different instruction must be rejected (key-reuse guard). Reconcile postings against the hub record, and reverse any duplicate posting with a correcting entry."}, {"name": "General Ledger", "inn": "A posting event from settlement or core banking, with debit and credit legs, currency, value date, and cost centre.", "does": "Applies double entry rules, posts to the correct ledger accounts, enforces that debits equal credits, proves the daily trial balance, and posts in the bank's reporting currency with FX revaluation. Formal period close (monthly/quarterly financial statements) is separate from the daily trial balance. Suspense and clearing accounts must be proven to zero or aged with a named owner, not merely posted.", "out": "A balanced ledger entry and a daily trial balance that finance teams rely on.", "calls": "Settlement Engine, Core Banking Integration, finance close process.", "data": "Debit and credit legs, ledger account codes, currency, value date, cost centre.", "fails": "The bank books are wrong, financial statements misstate payment volumes and fees, and for example a ledger posting failure on a day with 800,000 payments can block the daily close and delay regulatory reporting.", "recovery": "Hold the failed postings in a retry queue, post from the stored payment events once the ledger returns, and prove the trial balance before the day is closed."}, {"name": "Reconciliation Engine", "inn": "Three sets of records: hub payment records, clearing confirmations, and bank statements from nostro accounts and settlement accounts.", "does": "Matches records by reference, amount, currency, and value date, flags unmatched items, and ages open breaks by days outstanding. Break types: amount, value-date, missing entry, duplicate, fee, FX and timing breaks. Matching on amount alone, without value date, reference and status, creates false matches.", "out": "A matched position plus a list of breaks with owners and ageing.", "calls": "Clearing reports, nostro statements (camt.053), settlement account statements, hub payment store.", "data": "Payment reference, amount, currency, value date, statement lines, matching rules.", "fails": "Breaks accumulate unseen, so for example a missing 1.4 million dollar credit from a correspondent bank may sit unnoticed for weeks, and the bank cannot prove its payment position to auditors or regulators.", "recovery": "Work each break to its root cause, post the missing entry or request the missing statement, and escalate any break above the threshold or older than the ageing limit to the operations manager. Both the threshold and the ageing limit are example bank-policy values (for example a bank might set an escalation after five business days); they are set by each bank's operational-risk and reconciliation policy, not by any scheme rule."}, {"name": "Exception Management", "inn": "A payment flagged by any component, with the reason code, the payment details, and the component that raised the flag.", "does": "Routes the case to the right operations queue, presents the full payment history on one screen, supports repair, release, return, or cancel actions, and tracks service level deadlines. Repair (same payment, corrected data) is distinct from return or cancel (a new pacs.004 return or camt.056 cancellation flow). Release of a held sanctions or fraud payment needs a four-eyes approval control. A confirmed sanctions match is a block plus compliance escalation, not an operations repair.", "out": "A resolved case with a decision, an audit trail, and a repaired payment or a returned payment.", "calls": "Every hub component, case management system, operations queues, customer notification service.", "data": "Reason code, payment history, case owner, service level deadline, resolution action.", "fails": "Exceptions pile up without owners, customer payments sit in limbo for days, and for example a broken exception queue after a sanctions screening surge can leave 3,000 payments awaiting review with no clear priority.", "recovery": "Restore the queue from the event log, assign every open case a named owner and a deadline, and work the highest value and oldest cases first."}, {"name": "Reporting and Audit", "inn": "The complete event history of every payment, including who submitted it, who approved it, every status change, every screening result, and every posting.", "does": "Stores immutable, tamper-evident audit records (retained under the bank's retention policy), generates operational dashboards, regulatory reports (for example BoE/FCA payment statistics and sanctions screening attestations, as examples only for a UK bank; the exact reports depend on the regime), and supports ad hoc investigation queries. The audit trail must be reconstructable without the live hub, from the stored original instruction plus the event log.", "out": "A dashboard, a regulatory filing, or an audit extract that can reconstruct any payment end to end.", "calls": "Event log, data warehouse, regulatory reporting service, dashboard service.", "data": "Event history, screening results, status changes, posting records, report definitions.", "fails": "The bank cannot prove what happened to a payment, cannot file accurate regulatory reports, and an audit gap during a regulatory review can lead to findings, fines, and enforced remediation.", "recovery": "Rebuild the audit trail from the immutable event log and the stored original instructions, re-run the affected reports, and file a corrected report with the regulator."}];
var simB_xmlInfo = {"pain.001": {"GrpHdr": {"meaning": "Group header. Identifies the file, its creation time, transaction count, and control sum.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PAIN001-20261105-001", "mt": "No MT equivalent, file header", "errors": "Duplicate MsgId causes the file to be rejected as a duplicate."}, "MsgId": {"meaning": "Unique message identification assigned by the sender. Used for duplicate detection and tracking.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PAIN001-20261105-001", "mt": "No MT equivalent (file-level identifier; MT103 field :20: is the transaction reference, i.e. InstrId, not the message identifier).", "errors": "A repeated MsgId is rejected as a duplicate file."}, "CreDtTm": {"meaning": "Creation date and time of the message.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "2026-11-05T09:00:00", "mt": "No MT equivalent", "errors": "A date in the future or in the wrong format fails validation."}, "NbOfTxs": {"meaning": "Number of transactions in the group.", "card": "[0..1]", "mand": "Schema optional [0..1]; CBPR+ usage guideline restricts it to [1..1] (a CBPR+ pacs.008 carries exactly one transaction)", "example": "1", "mt": "No MT equivalent", "errors": "A count that does not match the actual transactions rejects the file."}, "CtrlSum": {"meaning": "Control sum: the total of all transaction amounts in the group.", "card": "[0..1]", "mand": "Schema optional [0..1]; business mandatory in most usage guidelines", "example": "25000.00", "mt": "No MT equivalent", "errors": "A control sum that does not equal the sum of the amounts rejects the file."}, "InitgPty": {"meaning": "Initiating party: the customer or system that created the file.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "Acme Manufacturing Ltd", "mt": "No MT equivalent", "errors": "A missing initiating party fails validation."}, "PmtInf": {"meaning": "Payment information block grouping payments that share debtor, debtor account, execution date, and charge bearer.", "card": "[1..n]", "mand": "Schema mandatory, business mandatory", "example": "One block per debtor and execution date", "mt": "No MT equivalent", "errors": "Mixing different execution dates in one block is rejected."}, "PmtInfId": {"meaning": "Unique identification for the payment information block.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PMTINF-001", "mt": "No MT equivalent", "errors": "A duplicate PmtInfId is treated as a duplicate block."}, "PmtMtd": {"meaning": "Payment method, normally TRF for a credit transfer.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "TRF", "mt": "No MT equivalent", "errors": "A value other than TRF, TRA, or CHK is rejected."}, "ReqdExctnDt": {"meaning": "Requested execution date: the date the customer asks the bank to execute the payment.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "2026-11-06", "mt": "MT103 field :32A: value date", "errors": "A past date or a non business day is moved or rejected."}, "Dbtr": {"meaning": "Debtor: the customer ordering the payment, with name and address.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "Acme Manufacturing Ltd", "mt": "MT103 field :50a:", "errors": "A missing debtor name fails screening and validation."}, "DbtrAcct": {"meaning": "Debtor account from which the payment is debited.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "GB29NWBK60161331926819", "mt": "MT103 field :50a: account", "errors": "An IBAN that fails the modulus check rejects the file."}, "DbtrAgt": {"meaning": "Debtor agent: the bank holding the debtor account.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "NWBKGB2L", "mt": "MT103 field :52a:", "errors": "A missing or invalid BIC rejects the file."}, "CdtTrfTxInf": {"meaning": "Credit transfer transaction information: one payment instruction inside the block.", "card": "[1..n]", "mand": "Schema mandatory, business mandatory", "example": "One per payment", "mt": "No MT equivalent", "errors": "A missing transaction block fails validation."}, "PmtId": {"meaning": "Payment identification: instruction, end to end, and transaction identification.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "INSTR-20261105-001", "mt": "MT103 field :20:", "errors": "A missing end to end identification breaks tracking through the chain."}, "InstrId": {"meaning": "Instruction identification, unique per instructing agent.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "INSTR-20261105-001", "mt": "MT103 field :20:", "errors": "A duplicate InstrId is rejected as a duplicate payment."}, "EndToEndId": {"meaning": "End to end identification, unchanged through the whole payment chain.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "INV-8841", "mt": "No MT equivalent", "errors": "Changing it mid chain breaks reconciliation and tracking."}, "Amt": {"meaning": "Amount block holding the instructed amount and currency.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "USD 25000.00", "mt": "MT103 field :32A:", "errors": "An amount of zero or a non ISO currency code is rejected."}, "InstdAmt": {"meaning": "Instructed amount and currency of the individual payment.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "USD 25000.00", "mt": "MT103 field :32A:", "errors": "A negative amount or more than two decimals for USD is rejected."}, "CdtrAgt": {"meaning": "Creditor agent: the bank holding the creditor account.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "DBSSSGSG", "mt": "MT103 field :57a:", "errors": "A wrong BIC routes the payment to the wrong bank."}, "Cdtr": {"meaning": "Creditor: the beneficiary of the payment, with name and address.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "Tanaka Trading Pte Ltd", "mt": "MT103 field :59a:", "errors": "A missing creditor name fails screening at the creditor agent."}, "CdtrAcct": {"meaning": "Creditor account to be credited.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "7171000123456789 (bank code 7171 + account number, Singapore)", "mt": "MT103 field :59a: account", "errors": "Singapore has no IBAN. The creditor account is shown as bank code 7171 (DBS) plus account number 000123456789, with BIC DBSSSGSG. The invalid Singapore 'IBAN' used in the old version fails ISO 13616 MOD 97-10 and must never be copied."}, "Purp": {"meaning": "Coded purpose of the payment, for example SUPP for supplier payment.", "card": "[0..1]", "mand": "Schema optional, business recommended", "example": "SUPP", "mt": "No MT equivalent", "errors": "An unknown purpose code is rejected by the receiving bank."}, "RmtInf": {"meaning": "Remittance information explaining what the payment is for.", "card": "[0..1]", "mand": "Schema optional, business recommended", "example": "Invoice INV-8841", "mt": "MT103 field :70:", "errors": "Text longer than the allowed length is truncated or rejected."}, "ChrgBr": {"meaning": "Charge bearer at payment-information level: the source of the pacs.008 ChrgBr. DEBT, CRED or SHAR under CBPR+; SLEV only under SEPA.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "SHAR", "mt": "MT103 field :71A:", "errors": "A charge bearer the rail does not allow is rejected."}, "PstlAdr": {"meaning": "Postal address of the debtor or creditor, structured with street, town, postcode and country.", "card": "[0..1]", "mand": "Schema optional, business mandatory under CBPR+", "example": "1 Manufacturing Way, London, EC2A 4DP, GB", "mt": "MT103 field :50a: / :59a: address", "errors": "An unstructured address, or a country of residence (CtryOfRes) in place of a postal address, does not satisfy the CBPR+ address rule."}}, "pacs.008": {"GrpHdr": {"meaning": "Group header. Identifies the message, its creation time, transaction count, and control sum.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PACS008-20261105-001", "mt": "No MT equivalent", "errors": "Duplicate MsgId causes duplicate processing checks to fire."}, "MsgId": {"meaning": "Unique message identification assigned by the sender.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PACS008-20261105-001", "mt": "No MT equivalent (file-level identifier; MT103 field :20: is the transaction reference, i.e. InstrId, not the message identifier).", "errors": "A repeated MsgId is rejected as a duplicate message."}, "CreDtTm": {"meaning": "Creation date and time of the message.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "2026-11-05T09:05:00", "mt": "No MT equivalent", "errors": "A date in the future or in the wrong format fails validation."}, "NbOfTxs": {"meaning": "Number of transactions in the group.", "card": "[0..1]", "mand": "Schema optional [0..1]; CBPR+ usage guideline restricts it to [1..1]", "example": "1", "mt": "No MT equivalent", "errors": "A count that does not match the actual transactions rejects the message."}, "CtrlSum": {"meaning": "Control sum: the total of all transaction amounts in the group.", "card": "[0..1]", "mand": "Schema optional [0..1]; business mandatory in most usage guidelines", "example": "25000.00", "mt": "No MT equivalent", "errors": "A control sum that does not equal the sum of the amounts rejects the message."}, "CdtTrfTxInf": {"meaning": "Credit transfer transaction information: the single payment instruction.", "card": "[1..n]", "mand": "Schema mandatory, business mandatory", "example": "One per payment", "mt": "No MT equivalent", "errors": "A missing transaction block fails validation."}, "PmtId": {"meaning": "Payment identification: instruction, end to end, and transaction identification.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "INSTR-20261105-001", "mt": "MT103 field :20:", "errors": "A missing end to end identification breaks tracking."}, "InstrId": {"meaning": "Instruction identification, unique per instructing agent.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "INSTR-20261105-001", "mt": "MT103 field :20:", "errors": "A duplicate InstrId is rejected as a duplicate payment."}, "EndToEndId": {"meaning": "End to end identification, unchanged through the whole payment chain.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "INV-8841", "mt": "No MT equivalent", "errors": "Changing it mid chain breaks reconciliation."}, "TxId": {"meaning": "Transaction identification assigned by the instructing agent.", "card": "[0..1]", "mand": "Schema optional, business optional", "example": "TX-20261105-000147", "mt": "No MT equivalent", "errors": "A missing TxId is allowed but weakens matching."}, "IntrBkSttlmAmt": {"meaning": "Interbank settlement amount and currency settled between banks.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "USD 25000.00", "mt": "MT103 field :32A:", "errors": "An amount that does not match the instructed amount after charges breaks reconciliation."}, "IntrBkSttlmDt": {"meaning": "Interbank settlement date, the value date for the interbank leg.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "2026-11-06", "mt": "MT103 field :32A: value date", "errors": "A non business day for the currency is rejected."}, "SttlmInf": {"meaning": "Settlement information: how settlement will occur. It lives in GrpHdr ONLY in pacs.008.001.08; CdtTrfTxInf has no SttlmInf.", "card": "[0..1]", "mand": "Schema optional [0..1] in GrpHdr; CBPR+ usage guideline makes it [1..1] in GrpHdr", "example": "CLRG (in GrpHdr)", "mt": "MT103 fields :53a: and :54a:", "errors": "An invalid settlement method code is rejected."}, "SttlmMtd": {"meaning": "Settlement method: INDA, INGA, CLRG, or COVE. The method determines the settlement leg.", "card": "[1..1]", "mand": "Schema mandatory inside SttlmInf", "example": "CLRG", "mt": "No MT equivalent", "errors": "A method that does not match the route is rejected."}, "Dbtr": {"meaning": "Debtor: the customer who ordered the payment, with structured name and address.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "Acme Manufacturing Ltd", "mt": "MT103 field :50a:", "errors": "Truncated debtor data can stop the payment at screening."}, "DbtrAcct": {"meaning": "Debtor account from which the payment is debited.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "GB29NWBK60161331926819", "mt": "MT103 field :50a: account", "errors": "A missing debtor account blocks debit posting."}, "DbtrAgt": {"meaning": "Debtor agent: the bank sending the payment onward.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "NWBKGB2L", "mt": "MT103 field :52a:", "errors": "A missing or invalid BIC rejects the message."}, "CdtrAgt": {"meaning": "Creditor agent: the bank receiving the payment for onward credit.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "DBSSSGSG", "mt": "MT103 field :57a:", "errors": "A wrong BIC routes the payment to the wrong bank."}, "Cdtr": {"meaning": "Creditor: the final beneficiary, with structured name and address.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "Tanaka Trading Pte Ltd", "mt": "MT103 field :59a:", "errors": "Incomplete creditor data causes a return for missing information."}, "CdtrAcct": {"meaning": "Creditor account to be credited.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "7171000123456789 (bank code 7171 + account number, Singapore)", "mt": "MT103 field :59a: account", "errors": "Singapore has no IBAN. The creditor account is shown as bank code 7171 (DBS) plus account number 000123456789, with BIC DBSSSGSG. The invalid Singapore 'IBAN' used in the old version fails ISO 13616 MOD 97-10 and must never be copied."}, "ChrgsInf": {"meaning": "Charges information: amount and bearer of charges applied. This payment carries two entries: USD 20.00 from correspondent 1 (CHASUS33) and USD 22.00 from correspondent 2 (UOVBSGSG), USD 42.00 in total, so the beneficiary receives USD 24,958.", "card": "[0..n]", "mand": "Schema optional, business recommended", "example": "USD 20.00 + USD 22.00 = USD 42.00 total", "mt": "MT103 field :71A:", "errors": "Missing charges data leaves the beneficiary unable to explain a deduction."}, "Purp": {"meaning": "Coded purpose of the payment, for example SUPP for supplier payment.", "card": "[0..1]", "mand": "Schema optional, business recommended", "example": "SUPP", "mt": "No MT equivalent", "errors": "An unknown purpose code is rejected."}, "RmtInf": {"meaning": "Remittance information explaining what the payment is for.", "card": "[0..1]", "mand": "Schema optional, business recommended", "example": "Invoice INV-8841", "mt": "MT103 field :70:", "errors": "Text longer than the allowed length is truncated or rejected."}, "UETR": {"meaning": "Universal End-to-End Transaction Reference: a UUID v4 that stays with the payment through every bank in the chain and is the tracking key for SWIFT gpi. CBPR+ business mandatory; SEPA optional.", "card": "[0..1]", "mand": "Schema optional, CBPR+ business mandatory", "example": "a3e1f2b4-5c6d-4a7e-9b1c-2d3e4f5a6b7c", "mt": "No MT equivalent", "errors": "A missing or malformed UETR (not a UUID v4) is rejected under CBPR+."}, "ChrgBr": {"meaning": "Charge bearer: who pays the charges. DEBT, CRED or SHAR under CBPR+; SLEV only under SEPA. SHAR means intermediaries may deduct from the principal.", "card": "[0..1]", "mand": "Schema optional, CBPR+ business mandatory", "example": "SHAR", "mt": "MT103 field :71A:", "errors": "A charge bearer the rail does not allow (for example SHAR on a SEPA payment) is rejected."}, "AppHdr": {"meaning": "Business Application Header (head.001.001.02): routing information that travels with the message. Under CBPR+ BizSvc is mandatory and must carry swift.cbprplus.03.", "card": "[1..1]", "mand": "CBPR+ business mandatory", "example": "Fr NWBKGB2L, To DBSSSGSG, BizSvc swift.cbprplus.03", "mt": "No MT equivalent", "errors": "A header without BizSvc fails CBPR+ validation."}, "BizSvc": {"meaning": "Business service: under CBPR+ it must carry the value swift.cbprplus.03.", "card": "[0..1]", "mand": "CBPR+ business mandatory", "example": "swift.cbprplus.03", "mt": "No MT equivalent", "errors": "A missing or wrong BizSvc fails CBPR+ validation."}, "BizMsgIdr": {"meaning": "Business message identifier in the AppHdr: the same identifier as the message MsgId.", "card": "[1..1]", "mand": "CBPR+ business mandatory", "example": "PACS008-20261105-001", "mt": "No MT equivalent", "errors": "A BizMsgIdr that does not match the MsgId breaks tracking."}, "MsgDefIdr": {"meaning": "Message definition identifier in the AppHdr, for example pacs.008.001.08.", "card": "[1..1]", "mand": "CBPR+ business mandatory", "example": "pacs.008.001.08", "mt": "No MT equivalent", "errors": "A wrong MsgDefIdr routes the message to the wrong validation."}, "PstlAdr": {"meaning": "Postal address of the debtor or creditor, structured with street, town, postcode and country. CBPR+ requires a structured or hybrid address with at least town name (TwnNm) and country (Ctry).", "card": "[0..1]", "mand": "Schema optional, business mandatory under CBPR+", "example": "8 Harbour Drive, Singapore, 018981, SG", "mt": "MT103 field :50a: / :59a: address", "errors": "CtryOfRes (country of residence) is not a postal address and does not satisfy the requirement."}}, "pacs.009": {"GrpHdr": {"meaning": "Group header. Identifies the message, its creation time, transaction count, and control sum.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PACS009-20261105-001", "mt": "No MT equivalent", "errors": "Duplicate MsgId causes duplicate processing checks to fire."}, "MsgId": {"meaning": "Unique message identification assigned by the sender.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PACS009-20261105-001", "mt": "No MT equivalent (file-level identifier; MT103 field :20: is the transaction reference, i.e. InstrId, not the message identifier).", "errors": "A repeated MsgId is rejected as a duplicate message."}, "CreDtTm": {"meaning": "Creation date and time of the message.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "2026-11-05T09:05:00", "mt": "No MT equivalent", "errors": "A date in the future or in the wrong format fails validation."}, "NbOfTxs": {"meaning": "Number of transactions in the group.", "card": "[0..1]", "mand": "Schema optional [0..1]; CBPR+ usage guideline restricts it to [1..1] (a CBPR+ pacs.008 carries exactly one transaction)", "example": "1", "mt": "No MT equivalent", "errors": "A count that does not match the actual transactions rejects the message."}, "CtrlSum": {"meaning": "Control sum: the total of all transaction amounts in the group.", "card": "[0..1]", "mand": "Schema optional [0..1]; business mandatory in most usage guidelines", "example": "25000.00", "mt": "No MT equivalent", "errors": "A control sum that does not equal the sum of the amounts rejects the message."}, "CdtTrfTxInf": {"meaning": "Credit transfer transaction information: the bank to bank payment.", "card": "[1..n]", "mand": "Schema mandatory, business mandatory", "example": "One per payment", "mt": "No MT equivalent", "errors": "A missing transaction block fails validation."}, "PmtId": {"meaning": "Payment identification linking this cover to the customer payment.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "COVER-20261105-001", "mt": "MT202 field :20:", "errors": "A missing link to the pacs.008 leaves the cover unmatched."}, "InstrId": {"meaning": "Instruction identification, unique per instructing agent.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "COVER-20261105-001", "mt": "MT202 field :20:", "errors": "A duplicate InstrId is rejected as a duplicate payment."}, "EndToEndId": {"meaning": "End to end identification linking this cover to the customer payment.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "INV-8841", "mt": "MT202 field :21: related reference", "errors": "A mismatch with the pacs.008 end to end identification breaks the cover match."}, "TxId": {"meaning": "Transaction identification assigned by the instructing agent.", "card": "[0..1]", "mand": "Schema optional, business optional", "example": "TX-20261105-000148", "mt": "No MT equivalent", "errors": "A missing TxId is allowed but weakens matching."}, "IntrBkSttlmAmt": {"meaning": "Interbank settlement amount and currency settled between banks.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "USD 25000.00", "mt": "MT202 field :32A:", "errors": "An amount that does not match the customer payment after charges breaks the cover match."}, "IntrBkSttlmDt": {"meaning": "Interbank settlement date, the value date for the interbank leg.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "2026-11-06", "mt": "MT202 field :32A: value date", "errors": "A non business day for the currency is rejected."}, "SttlmInf": {"meaning": "Settlement information in GrpHdr ONLY (pacs.009.001.08 has no transaction-level SttlmInf).", "card": "[0..1]", "mand": "Schema optional [0..1] in GrpHdr; CBPR+ usage guideline makes it [1..1] in GrpHdr", "example": "INDA (in GrpHdr)", "mt": "MT202 fields :53a: and :54a:", "errors": "An invalid settlement method code is rejected."}, "SttlmMtd": {"meaning": "Settlement method. INDA/INGA are the settling methods for pacs.009 CORE and COV. COVE is the advice-only variant (pacs.009 ADV): it carries information only, does not move funds, and must be accompanied by a CORE or COV that settles.", "card": "[1..1]", "mand": "Schema mandatory inside SttlmInf", "example": "INDA", "mt": "No MT equivalent", "errors": "A method that does not match the route is rejected."}, "DbtrAgt": {"meaning": "Debtor agent: the bank sending the funds.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "NWBKGB2L", "mt": "MT202 field :52a:", "errors": "A missing or invalid BIC rejects the message."}, "CdtrAgt": {"meaning": "Creditor agent: the bank receiving the funds.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "DBSSSGSG", "mt": "MT202 field :57a:", "errors": "A wrong BIC routes the funds to the wrong bank."}, "RltdPmtInf": {"meaning": "Related payment information linking this cover to the customer payment.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "INV-8841", "mt": "MT202 field :21:", "errors": "A missing link leaves the cover as an unmatched receipt."}, "Purp": {"meaning": "Coded purpose of the bank transfer. COVE is NOT a value in ExternalPurpose1Code, so a cover payment uses a valid purpose code such as TREA.", "card": "[0..1]", "mand": "Schema optional, business recommended", "example": "TREA", "mt": "No MT equivalent", "errors": "Purp/Cd COVE is invalid: COVE is a settlement method, not a purpose code."}}, "pacs.002": {"GrpHdr": {"meaning": "Group header. Identifies the status report and its creation time.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PACS002-20261105-014", "mt": "No MT equivalent", "errors": "Duplicate MsgId causes duplicate processing checks to fire."}, "MsgId": {"meaning": "Unique message identification assigned by the sender.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PACS002-20261105-014", "mt": "No MT equivalent", "errors": "A repeated MsgId is rejected as a duplicate message."}, "CreDtTm": {"meaning": "Creation date and time of the message.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "2026-11-05T09:20:00", "mt": "No MT equivalent", "errors": "A date in the future or in the wrong format fails validation."}, "OrgnlGrpInfAndSts": {"meaning": "Original group information and status: which message this report answers and its overall status.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "PACS008-20261105-001", "mt": "No MT equivalent", "errors": "A missing original message reference makes the report unmatchable."}, "OrgnlMsgId": {"meaning": "Message identification of the original payment message.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PACS008-20261105-001", "mt": "No MT equivalent", "errors": "A wrong original MsgId means the status cannot be matched."}, "OrgnlMsgNmId": {"meaning": "Message name identification of the original message, for example pacs.008.001.08.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "pacs.008.001.08", "mt": "No MT equivalent", "errors": "A wrong message name means the status refers to the wrong message type."}, "GrpSts": {"meaning": "Group status. Full ladder: ACTC, ACCP, ACSP, ACSC, ACCC, PART, PDNG, RJCT. Under CBPR+ only RJCT is mandatory for all agents; positive statuses are by bilateral agreement. SEPA SCT uses pacs.002 for rejects only.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "ACSC", "mt": "No MT equivalent", "errors": "An invalid status code is rejected."}, "TxInfAndSts": {"meaning": "Transaction information and status: the status of one payment.", "card": "[0..n]", "mand": "Schema optional, business mandatory", "example": "One per reported payment", "mt": "No MT equivalent", "errors": "A missing transaction block leaves the sender guessing which payment failed."}, "OrgnlInstrId": {"meaning": "Instruction identification of the original payment.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "INSTR-20261105-001", "mt": "MT103 field :20:", "errors": "A wrong InstrId means the status is matched to the wrong payment."}, "OrgnlEndToEndId": {"meaning": "End to end identification of the original payment.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "INV-8841", "mt": "No MT equivalent", "errors": "A missing end to end identification weakens matching."}, "TxSts": {"meaning": "Transaction status. Full ladder: ACTC (technical validation passed), ACCP (customer-profile checks passed, accepted for processing), ACSP (settlement in process), ACSC (settlement completed on the debtor account), ACCC (settlement completed on the creditor account), PDNG, RJCT.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "ACSC", "mt": "No MT equivalent", "errors": "An invalid status code is rejected."}, "StsRsnInf": {"meaning": "Status reason information: the coded reason for the status.", "card": "[0..n]", "mand": "Schema optional, business mandatory for rejections", "example": "AC01", "mt": "No MT equivalent", "errors": "A rejection with no reason code cannot be actioned."}, "Rsn": {"meaning": "Reason block holding the reason code.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory for rejections", "example": "AC01", "mt": "No MT equivalent", "errors": "A missing reason code on a rejection is a validation failure."}, "Cd": {"meaning": "Reason code, for example AC01 incorrect account number, AM04 insufficient funds, AM05 duplicate payment.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory for rejections", "example": "AC01", "mt": "No MT equivalent", "errors": "An unknown reason code is rejected."}, "AddtlInf": {"meaning": "Additional free text information about the reason.", "card": "[0..1]", "mand": "Schema optional, business recommended", "example": "Incorrect account number", "mt": "No MT equivalent", "errors": "Text longer than the allowed length is truncated or rejected."}}, "pacs.004": {"GrpHdr": {"meaning": "Group header. Identifies the return message, its creation time, transaction count, and control sum.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PACS004-20261106-002", "mt": "No MT equivalent", "errors": "Duplicate MsgId causes duplicate processing checks to fire."}, "MsgId": {"meaning": "Unique message identification assigned by the sender.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PACS004-20261106-002", "mt": "No MT equivalent", "errors": "A repeated MsgId is rejected as a duplicate message."}, "CreDtTm": {"meaning": "Creation date and time of the message.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "2026-11-06T10:15:00", "mt": "No MT equivalent", "errors": "A date in the future or in the wrong format fails validation."}, "NbOfTxs": {"meaning": "Number of transactions in the group.", "card": "[0..1]", "mand": "Schema optional [0..1]; business mandatory in most usage guidelines", "example": "1", "mt": "No MT equivalent", "errors": "A count that does not match the actual transactions rejects the message."}, "CtrlSum": {"meaning": "Control sum: the total of all returned amounts in the group.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "84980.00", "mt": "No MT equivalent", "errors": "A control sum that does not equal the sum of the returns rejects the message."}, "TxInf": {"meaning": "Transaction information: one returned payment.", "card": "[1..n]", "mand": "Schema mandatory, business mandatory", "example": "One per return", "mt": "No MT equivalent", "errors": "A missing transaction block fails validation."}, "OrgnlGrpInf": {"meaning": "Original group information linking the return to the original message.", "card": "[0..1]", "mand": "Schema optional, business recommended", "example": "PACS008-20261105-001", "mt": "No MT equivalent", "errors": "A missing link forces manual matching of the return."}, "OrgnlMsgId": {"meaning": "Message identification of the original payment message.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PACS008-20261105-001", "mt": "No MT equivalent", "errors": "A wrong original MsgId means the return cannot be matched."}, "OrgnlMsgNmId": {"meaning": "Message name identification of the original message.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "pacs.008.001.08", "mt": "No MT equivalent", "errors": "A wrong message name means the return refers to the wrong message type."}, "OrgnlInstrId": {"meaning": "Instruction identification of the original payment.", "card": "[0..1]", "mand": "Schema optional [0..1]; business mandatory", "example": "INSTR-20261105-001", "mt": "MT103 field :20:", "errors": "A wrong InstrId means the return is matched to the wrong payment."}, "OrgnlEndToEndId": {"meaning": "End to end identification of the original payment.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "INV-8841", "mt": "No MT equivalent", "errors": "A missing end to end identification weakens matching."}, "RtrdIntrBkSttlmAmt": {"meaning": "Returned interbank settlement amount and currency.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "USD 84980.00 (against an original USD 85,000, payment INV-9021)", "mt": "MT103 field :32A:", "errors": "An amount larger than the original payment is rejected."}, "RtrdIntrBkSttlmDt": {"meaning": "Returned interbank settlement date, the value date of the return.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "2026-11-06", "mt": "MT103 field :32A: value date", "errors": "A non business day for the currency is rejected."}, "RtrRsnInf": {"meaning": "Return reason information: the coded reason for the return.", "card": "[0..1]", "mand": "Schema optional [0..1]; business mandatory for a return", "example": "AC04", "mt": "No MT equivalent", "errors": "A return with no reason code cannot be explained to the customer."}, "Rsn": {"meaning": "Reason block holding the reason code.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "AC04", "mt": "No MT equivalent", "errors": "A missing reason code on a return is a validation failure."}, "Cd": {"meaning": "Return reason code, for example AC04 closed account, AC01 incorrect account number, BE04 missing creditor address.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "AC04", "mt": "No MT equivalent", "errors": "An unknown reason code is rejected."}, "AddtlInf": {"meaning": "Additional free text information about the reason.", "card": "[0..1]", "mand": "Schema optional, business recommended", "example": "Closed account", "mt": "No MT equivalent", "errors": "Text longer than the allowed length is truncated or rejected."}, "CdtrAgt": {"meaning": "Creditor agent returning the payment.", "card": "[0..1]", "mand": "Schema optional, business recommended", "example": "DBSSSGSG", "mt": "MT103 field :57a:", "errors": "A wrong BIC means the return appears to come from the wrong bank."}, "DbtrAgt": {"meaning": "Debtor agent receiving the returned funds.", "card": "[0..1]", "mand": "Schema optional, business recommended", "example": "NWBKGB2L", "mt": "MT103 field :52a:", "errors": "A wrong BIC means the return is credited to the wrong bank."}}, "camt.053": {"GrpHdr": {"meaning": "Group header. Identifies the statement and its creation time.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "CAMT053-20261106-001", "mt": "No MT equivalent", "errors": "Duplicate MsgId causes duplicate processing checks to fire."}, "MsgId": {"meaning": "Unique message identification assigned by the sender.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "CAMT053-20261106-001", "mt": "No MT equivalent", "errors": "A repeated MsgId is rejected as a duplicate statement."}, "CreDtTm": {"meaning": "Creation date and time of the message.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "2026-11-06T06:00:00", "mt": "No MT equivalent", "errors": "A date in the future or in the wrong format fails validation."}, "Stmt": {"meaning": "Statement block holding the account, balances, and entries for one account.", "card": "[1..n]", "mand": "Schema mandatory, business mandatory", "example": "One per account", "mt": "No MT equivalent", "errors": "A missing statement block fails validation."}, "Id": {"meaning": "Statement identification.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "STMT-20261106-001", "mt": "No MT equivalent", "errors": "A duplicate statement Id is treated as a duplicate statement."}, "Acct": {"meaning": "Account the statement covers, identified by IBAN.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "GB29NWBK60161331926819", "mt": "No MT equivalent", "errors": "A statement for the wrong account breaks reconciliation."}, "Ccy": {"meaning": "Currency of the account.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "USD", "mt": "No MT equivalent", "errors": "A currency that does not match the account is rejected."}, "Bal": {"meaning": "Balance information: opening, closing, or interim balance.", "card": "[1..n]", "mand": "Schema mandatory, business mandatory", "example": "OPBD and CLBD", "mt": "No MT equivalent", "errors": "A closing balance that does not equal opening plus entries breaks the statement."}, "Tp": {"meaning": "Balance type block.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "OPBD", "mt": "No MT equivalent", "errors": "A missing balance type makes the balance unusable."}, "Cd": {"meaning": "Balance type code: OPBD opening, CLBD closing, ITBD interim.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "OPBD", "mt": "No MT equivalent", "errors": "An unknown balance code is rejected."}, "Amt": {"meaning": "Amount and currency of the balance or entry.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "USD 1250000.00", "mt": "No MT equivalent", "errors": "An amount that does not match the entries breaks the statement."}, "CdtDbtInd": {"meaning": "Credit debit indicator: CRDT for a credit, DBIT for a debit.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "CRDT", "mt": "No MT equivalent", "errors": "A wrong indicator reverses the meaning of the entry."}, "Dt": {"meaning": "Date of the balance. Bal/Dt, BookgDt and ValDt are DateAndDateTimeChoice types: they must contain a nested Dt (or DtTm) child, never a flat date.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "2026-11-05 (nested as <Dt><Dt>2026-11-05</Dt></Dt>)", "mt": "No MT equivalent", "errors": "A flat date directly under Bal, BookgDt or ValDt fails schema validation."}, "Ntry": {"meaning": "One entry in the statement, a single debit or credit.", "card": "[0..n]", "mand": "Schema optional, business mandatory", "example": "One per transaction", "mt": "No MT equivalent", "errors": "A missing entry means the statement is incomplete."}, "Sts": {"meaning": "Status of the entry: BOOK for booked, PDNG for pending.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "BOOK", "mt": "No MT equivalent", "errors": "A pending entry must not be counted in the closing balance."}, "BookgDt": {"meaning": "Booking date: the date the entry was booked. A DateAndDateTimeChoice: it must contain a nested Dt (or DtTm) child.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "2026-11-06 (nested as <BookgDt><Dt>2026-11-06</Dt></BookgDt>)", "mt": "No MT equivalent", "errors": "A flat date fails schema validation."}, "ValDt": {"meaning": "Value date: the date the funds count as moved for interest. A DateAndDateTimeChoice: it must contain a nested Dt (or DtTm) child. A value date that differs from the booking date without explanation creates a timing break.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "2026-11-06 (nested as <ValDt><Dt>2026-11-06</Dt></ValDt>)", "mt": "No MT equivalent", "errors": "A flat date fails schema validation."}, "NtryDtls": {"meaning": "Entry details: debtor, creditor, remittance, and charges for the entry.", "card": "[0..n]", "mand": "Schema optional, business recommended", "example": "Payment INV-8841", "mt": "No MT equivalent", "errors": "Missing details force manual matching of the entry."}, "AddtlNtryInf": {"meaning": "Additional free text information about the entry.", "card": "[0..1]", "mand": "Schema optional, business optional", "example": "Payment INV-8841 to Tanaka Trading Pte Ltd", "mt": "No MT equivalent", "errors": "Text longer than the allowed length is truncated."}, "FrToDt": {"meaning": "From-to date: the statement period. Mandatory [1..1] in camt.053.001.08.", "card": "[1..1]", "mand": "Schema mandatory", "example": "2026-11-05 to 2026-11-06", "mt": "No MT equivalent", "errors": "A missing FrToDt fails schema validation."}, "FrDtTm": {"meaning": "Start of the statement period, as a date-time.", "card": "[1..1]", "mand": "Schema mandatory inside FrToDt", "example": "2026-11-05T00:00:00", "mt": "No MT equivalent", "errors": "A start after the end of the period is rejected."}, "ToDtTm": {"meaning": "End of the statement period, as a date-time.", "card": "[1..1]", "mand": "Schema mandatory inside FrToDt", "example": "2026-11-06T23:59:59", "mt": "No MT equivalent", "errors": "An end before the start of the period is rejected."}}, "camt.056": {"Assgnmt": {"meaning": "Assignment block holding the cancellation request identification, assigner, and assignee.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "CXL-20261106-001", "mt": "No MT equivalent", "errors": "A missing assignment block fails validation."}, "Id": {"meaning": "Cancellation request identification.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "CXL-20261106-001", "mt": "No MT equivalent", "errors": "A duplicate Id is treated as a duplicate request."}, "Assgnr": {"meaning": "Assigner: the bank requesting the cancellation.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "NWBKGB2L", "mt": "No MT equivalent", "errors": "A missing assigner means the request has no sender."}, "Assgne": {"meaning": "Assignee: the bank asked to return the funds.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "DBSSSGSG", "mt": "No MT equivalent", "errors": "A wrong assignee sends the request to the wrong bank."}, "CreDtTm": {"meaning": "Creation date and time of the request.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "2026-11-06T11:00:00", "mt": "No MT equivalent", "errors": "A date in the future or in the wrong format fails validation."}, "Undrlyg": {"meaning": "Underlying transaction block holding the original payment details.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "INSTR-20261105-001", "mt": "No MT equivalent", "errors": "A missing underlying block means the request refers to no payment."}, "OrgnlGrpInf": {"meaning": "Original group information linking the request to the original message.", "card": "[0..1]", "mand": "Schema optional, business recommended", "example": "PACS008-20261105-001", "mt": "No MT equivalent", "errors": "A missing link forces manual matching of the request."}, "OrgnlMsgId": {"meaning": "Message identification of the original payment message.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PACS008-20261105-001", "mt": "No MT equivalent", "errors": "A wrong original MsgId means the request cannot be matched."}, "OrgnlMsgNmId": {"meaning": "Message name identification of the original message.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "pacs.008.001.08", "mt": "No MT equivalent", "errors": "A wrong message name means the request refers to the wrong message type."}, "OrgnlInstrId": {"meaning": "Instruction identification of the original payment.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "INSTR-20261105-001", "mt": "MT103 field :20:", "errors": "A wrong InstrId means the request targets the wrong payment."}, "OrgnlEndToEndId": {"meaning": "End to end identification of the original payment.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "INV-8841", "mt": "No MT equivalent", "errors": "A missing end to end identification weakens matching."}, "OrgnlTxId": {"meaning": "Transaction identification of the original payment.", "card": "[0..1]", "mand": "Schema optional, business optional", "example": "TX-20261105-000147", "mt": "No MT equivalent", "errors": "A missing TxId is allowed but weakens matching."}, "OrgnlIntrBkSttlmAmt": {"meaning": "Original interbank settlement amount of the payment to cancel.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "USD 25000.00", "mt": "MT103 field :32A:", "errors": "An amount that does not match the original payment is rejected."}, "OrgnlIntrBkSttlmDt": {"meaning": "Original interbank settlement date of the payment to cancel.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "2026-11-06", "mt": "MT103 field :32A: value date", "errors": "A date that does not match the original payment is rejected."}, "CxlRsnInf": {"meaning": "Cancellation reason information: the coded reason for the request.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "DUPL", "mt": "No MT equivalent", "errors": "A request with no reason code cannot be actioned."}, "Rsn": {"meaning": "Reason block holding the reason code.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "DUPL", "mt": "No MT equivalent", "errors": "A missing reason code on a cancellation is a validation failure."}, "Cd": {"meaning": "Cancellation reason code. The ISO external list is wider (CUST, DUPL, FRAD, TECH plus CUTA, COVR, CURR, AGNT, AM09, NARR, UPAY). The DUPL/TECH/FRAD-only restriction is EPC SCT bank-initiated recall, not universal: EPC recall must be made within 10 banking business days (13 months for fraud), the beneficiary bank answers within 15 banking business days, positively by pacs.004 with reason FOCR, negatively by camt.029. The customer-requested route (CUST) is a separate procedure.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "DUPL", "mt": "No MT equivalent", "errors": "An unknown reason code is rejected."}, "AddtlInf": {"meaning": "Additional free text information about the reason.", "card": "[0..1]", "mand": "Schema optional, business recommended", "example": "Duplicate payment, please return the funds", "mt": "No MT equivalent", "errors": "Text longer than the allowed length is truncated or rejected."}, "Agt": {"meaning": "Agent: the bank acting as assigner or assignee. In camt.056.001.08 the assigner and assignee are wrapped as Assgnr/Agt and Assgne/Agt; a bare FinInstnId directly under Assgnr or Assgne is schema-invalid.", "card": "[1..1]", "mand": "Schema mandatory", "example": "NWBKGB2L / DBSSSGSG", "mt": "No MT equivalent", "errors": "A missing Agt wrapper fails schema validation."}, "TxInf": {"meaning": "Transaction information under Undrlyg: the original payment details, including the case identification, live inside TxInf, not directly under Undrlyg.", "card": "[1..1]", "mand": "Schema mandatory", "example": "One per cancellation request", "mt": "No MT equivalent", "errors": "Original-payment references outside TxInf fail schema validation."}, "Case": {"meaning": "Case block holding the cancellation case identification.", "card": "[1..1]", "mand": "Schema mandatory", "example": "CASE-20261107-001", "mt": "No MT equivalent", "errors": "A missing case identification fails schema validation."}, "AppHdr": {"meaning": "Business Application Header (head.001.001.02): routing information that travels with the message. Under CBPR+ BizSvc is mandatory and must carry swift.cbprplus.03.", "card": "[1..1]", "mand": "CBPR+ business mandatory", "example": "Fr NWBKGB2L, To DBSSSGSG, BizSvc swift.cbprplus.03", "mt": "No MT equivalent", "errors": "A header without BizSvc fails CBPR+ validation."}, "BizSvc": {"meaning": "Business service: under CBPR+ it must carry the value swift.cbprplus.03.", "card": "[0..1]", "mand": "CBPR+ business mandatory", "example": "swift.cbprplus.03", "mt": "No MT equivalent", "errors": "A missing or wrong BizSvc fails CBPR+ validation."}}, "pain.002": {"GrpHdr": {"meaning": "Group header. Identifies the message and its creation time.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PAIN002-20261106-001", "mt": "No MT equivalent", "errors": "Duplicate MsgId causes duplicate processing checks to fire."}, "MsgId": {"meaning": "Unique message identification assigned by the sender.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PAIN002-20261106-001", "mt": "No MT equivalent (file-level identifier; MT103 field :20: is the transaction reference, i.e. InstrId, not the message identifier).", "errors": "A repeated MsgId is rejected as a duplicate message."}, "CreDtTm": {"meaning": "Creation date and time of the message.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "2026-11-06T06:00:00", "mt": "No MT equivalent", "errors": "A date in the future or in the wrong format fails validation."}, "OrgnlGrpInfAndSts": {"meaning": "Original group information and status: which customer instruction this report answers and its overall status.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "PAIN001-20261105-001", "mt": "No MT equivalent", "errors": "A missing original message reference makes the report unmatchable."}, "OrgnlMsgId": {"meaning": "Message identification of the original customer instruction.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "PAIN001-20261105-001", "mt": "No MT equivalent", "errors": "A wrong original MsgId means the status cannot be matched."}, "OrgnlMsgNmId": {"meaning": "Message name identification of the original message, for example pain.001.001.09.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "pain.001.001.09", "mt": "No MT equivalent", "errors": "A wrong message name means the status refers to the wrong message type."}, "GrpSts": {"meaning": "Group status. Full ladder: ACTC, ACCP, ACSP, ACSC, ACCC, PART, PDNG, RJCT.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "ACSC", "mt": "No MT equivalent", "errors": "An invalid status code is rejected."}, "TxInfAndSts": {"meaning": "Transaction information and status: the status of one payment.", "card": "[0..n]", "mand": "Schema optional, business mandatory", "example": "One per reported payment", "mt": "No MT equivalent", "errors": "A missing transaction block leaves the customer guessing which payment failed."}, "OrgnlInstrId": {"meaning": "Instruction identification of the original payment.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "INSTR-20261105-001", "mt": "MT103 field :20:", "errors": "A wrong InstrId means the status is matched to the wrong payment."}, "OrgnlEndToEndId": {"meaning": "End to end identification of the original payment.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "INV-8841", "mt": "No MT equivalent", "errors": "A missing end to end identification weakens matching."}, "TxSts": {"meaning": "Transaction status: ACTC, ACCP, ACSP, ACSC, ACCC, PDNG, RJCT.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "ACSC", "mt": "No MT equivalent", "errors": "An invalid status code is rejected."}}, "camt.052": {"GrpHdr": {"meaning": "Group header. Identifies the message and its creation time.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "CAMT052-20261106-001", "mt": "No MT equivalent", "errors": "Duplicate MsgId causes duplicate processing checks to fire."}, "MsgId": {"meaning": "Unique message identification assigned by the sender.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "CAMT052-20261106-001", "mt": "No MT equivalent (file-level identifier; MT103 field :20: is the transaction reference, i.e. InstrId, not the message identifier).", "errors": "A repeated MsgId is rejected as a duplicate message."}, "CreDtTm": {"meaning": "Creation date and time of the message.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "2026-11-06T06:00:00", "mt": "No MT equivalent", "errors": "A date in the future or in the wrong format fails validation."}, "Rpt": {"meaning": "Report block holding the account, balances, and entries for one account, intraday.", "card": "[1..n]", "mand": "Schema mandatory, business mandatory", "example": "One per account", "mt": "No MT equivalent", "errors": "A missing report block fails validation."}, "Id": {"meaning": "Report identification.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "RPT-20261106-001", "mt": "No MT equivalent", "errors": "A duplicate report Id is treated as a duplicate report."}, "FrToDt": {"meaning": "From-to date: the report period. Mandatory [1..1] in camt.052.001.08.", "card": "[1..1]", "mand": "Schema mandatory", "example": "2026-11-05 to 2026-11-06", "mt": "No MT equivalent", "errors": "A missing FrToDt fails schema validation."}, "Acct": {"meaning": "Account the report covers, identified by IBAN.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "GB29NWBK60161331926819", "mt": "No MT equivalent", "errors": "A report for the wrong account breaks reconciliation."}, "Ccy": {"meaning": "Currency of the account.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "USD", "mt": "No MT equivalent", "errors": "A currency that does not match the account is rejected."}, "Bal": {"meaning": "Balance information: opening, closing, or interim balance.", "card": "[1..n]", "mand": "Schema mandatory, business mandatory", "example": "OPBD and ITBD", "mt": "No MT equivalent", "errors": "A balance that does not equal opening plus entries breaks the report."}, "Tp": {"meaning": "Balance type block.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "OPBD", "mt": "No MT equivalent", "errors": "A missing balance type makes the balance unusable."}, "Cd": {"meaning": "Balance type code: OPBD opening, CLBD closing, ITBD interim.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "OPBD", "mt": "No MT equivalent", "errors": "An unknown balance code is rejected."}, "Amt": {"meaning": "Amount and currency of the balance or entry.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "USD 1250000.00", "mt": "No MT equivalent", "errors": "An amount that does not match the entries breaks the report."}, "CdtDbtInd": {"meaning": "Credit debit indicator: CRDT for a credit, DBIT for a debit.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "CRDT", "mt": "No MT equivalent", "errors": "A wrong indicator reverses the meaning of the entry."}, "Dt": {"meaning": "Date of the balance. A DateAndDateTimeChoice: it must contain a nested Dt (or DtTm) child, never a flat date.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "2026-11-05 (nested)", "mt": "No MT equivalent", "errors": "A flat date fails schema validation."}, "Ntry": {"meaning": "One entry in the report, a single debit or credit.", "card": "[0..n]", "mand": "Schema optional, business mandatory", "example": "One per transaction", "mt": "No MT equivalent", "errors": "A missing entry means the report is incomplete."}, "Sts": {"meaning": "Status of the entry: BOOK for booked, PDNG for pending.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "BOOK", "mt": "No MT equivalent", "errors": "A pending entry must not be counted in the closing balance."}, "BookgDt": {"meaning": "Booking date, as a DateAndDateTimeChoice with a nested Dt child.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "2026-11-06 (nested)", "mt": "No MT equivalent", "errors": "A flat date fails schema validation."}, "ValDt": {"meaning": "Value date, as a DateAndDateTimeChoice with a nested Dt child.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "2026-11-06 (nested)", "mt": "No MT equivalent", "errors": "A flat date fails schema validation."}, "NtryDtls": {"meaning": "Entry details: debtor, creditor, remittance, and charges for the entry.", "card": "[0..n]", "mand": "Schema optional, business recommended", "example": "Payment INV-8841", "mt": "No MT equivalent", "errors": "Missing details force manual matching of the entry."}, "AddtlNtryInf": {"meaning": "Additional free text information about the entry.", "card": "[0..1]", "mand": "Schema optional, business optional", "example": "Payment INV-8841 to Tanaka Trading Pte Ltd", "mt": "No MT equivalent", "errors": "Text longer than the allowed length is truncated."}}, "camt.054": {"GrpHdr": {"meaning": "Group header. Identifies the message and its creation time.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "CAMT054-20261106-001", "mt": "No MT equivalent", "errors": "Duplicate MsgId causes duplicate processing checks to fire."}, "MsgId": {"meaning": "Unique message identification assigned by the sender.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "CAMT054-20261106-001", "mt": "No MT equivalent (file-level identifier; MT103 field :20: is the transaction reference, i.e. InstrId, not the message identifier).", "errors": "A repeated MsgId is rejected as a duplicate message."}, "CreDtTm": {"meaning": "Creation date and time of the message.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "2026-11-06T06:00:00", "mt": "No MT equivalent", "errors": "A date in the future or in the wrong format fails validation."}, "Ntfctn": {"meaning": "Notification block holding the account and entries for one account.", "card": "[1..n]", "mand": "Schema mandatory, business mandatory", "example": "One per account", "mt": "No MT equivalent", "errors": "A missing notification block fails validation."}, "Id": {"meaning": "Notification identification.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "NTF-20261106-001", "mt": "No MT equivalent", "errors": "A duplicate notification Id is treated as a duplicate notification."}, "Acct": {"meaning": "Account the notification covers. Here the creditor account in Singapore: bank code 7171 plus account number, not an IBAN.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "7171000123456789", "mt": "No MT equivalent", "errors": "A notification for the wrong account breaks reconciliation."}, "Ccy": {"meaning": "Currency of the account.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "USD", "mt": "No MT equivalent", "errors": "A currency that does not match the account is rejected."}, "Ntry": {"meaning": "One entry in the notification: the credit of USD 24,958 to Tanaka Trading Pte Ltd for INV-8841.", "card": "[0..n]", "mand": "Schema optional, business mandatory", "example": "One per transaction", "mt": "No MT equivalent", "errors": "A missing entry means the notification is incomplete."}, "Amt": {"meaning": "Amount and currency of the entry.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "USD 24958.00", "mt": "No MT equivalent", "errors": "An amount that does not match the statement breaks reconciliation."}, "CdtDbtInd": {"meaning": "Credit debit indicator: CRDT for a credit, DBIT for a debit.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "CRDT", "mt": "No MT equivalent", "errors": "A wrong indicator reverses the meaning of the entry."}, "Sts": {"meaning": "Status of the entry: BOOK for booked, PDNG for pending.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "BOOK", "mt": "No MT equivalent", "errors": "A pending entry must not be counted in the closing balance."}, "BookgDt": {"meaning": "Booking date, as a DateAndDateTimeChoice with a nested Dt child.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "2026-11-06 (nested)", "mt": "No MT equivalent", "errors": "A flat date fails schema validation."}, "ValDt": {"meaning": "Value date, as a DateAndDateTimeChoice with a nested Dt child.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "2026-11-06 (nested)", "mt": "No MT equivalent", "errors": "A flat date fails schema validation."}, "NtryDtls": {"meaning": "Entry details for the notification.", "card": "[0..n]", "mand": "Schema optional, business recommended", "example": "Credit INV-8841", "mt": "No MT equivalent", "errors": "Missing details force manual matching of the entry."}, "AddtlNtryInf": {"meaning": "Additional free text information about the entry.", "card": "[0..1]", "mand": "Schema optional, business optional", "example": "Credit INV-8841, USD 24,958 after USD 42 charges", "mt": "No MT equivalent", "errors": "Text longer than the allowed length is truncated."}}, "camt.029": {"GrpHdr": {"meaning": "Group header. Identifies the message and its creation time.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "RSI-20261108-001", "mt": "No MT equivalent", "errors": "Duplicate MsgId causes duplicate processing checks to fire."}, "MsgId": {"meaning": "Unique message identification assigned by the sender.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "RSI-20261108-001", "mt": "No MT equivalent (file-level identifier; MT103 field :20: is the transaction reference, i.e. InstrId, not the message identifier).", "errors": "A repeated MsgId is rejected as a duplicate message."}, "CreDtTm": {"meaning": "Creation date and time of the resolution.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "2026-11-08T09:00:00", "mt": "No MT equivalent", "errors": "A date in the future or in the wrong format fails validation."}, "Assgnmt": {"meaning": "Assignment block holding the investigation resolution identification, assigner, and assignee.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "RSI-20261108-001", "mt": "No MT equivalent", "errors": "A missing assignment block fails validation."}, "Id": {"meaning": "Resolution identification.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "RSI-20261108-001", "mt": "No MT equivalent", "errors": "A duplicate Id is treated as a duplicate resolution."}, "Assgnr": {"meaning": "Assigner: the bank answering the investigation, here the creditor agent.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "DBSSSGSG", "mt": "No MT equivalent", "errors": "A missing assigner means the resolution has no sender."}, "Assgne": {"meaning": "Assignee: the bank that asked for the investigation.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "NWBKGB2L", "mt": "No MT equivalent", "errors": "A wrong assignee sends the resolution to the wrong bank."}, "Agt": {"meaning": "Agent: the bank acting as assigner or assignee, wrapped as Assgnr/Agt and Assgne/Agt.", "card": "[1..1]", "mand": "Schema mandatory", "example": "DBSSSGSG / NWBKGB2L", "mt": "No MT equivalent", "errors": "A missing Agt wrapper fails schema validation."}, "Sts": {"meaning": "Status block: the outcome of the investigation. RJCT here means the recall is refused.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "RJCT", "mt": "No MT equivalent", "errors": "A missing status leaves the investigation unanswered."}, "Cd": {"meaning": "Status or reason code for the resolution.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "RJCT", "mt": "No MT equivalent", "errors": "An unknown code is rejected."}, "AddtlInf": {"meaning": "Additional free text information about the outcome.", "card": "[0..1]", "mand": "Schema optional, business recommended", "example": "Beneficiary account already debited", "mt": "No MT equivalent", "errors": "Text longer than the allowed length is truncated."}, "Undrlyg": {"meaning": "Underlying transaction block holding the original payment details.", "card": "[1..1]", "mand": "Schema mandatory, business mandatory", "example": "INV-9100", "mt": "No MT equivalent", "errors": "A missing underlying block means the resolution refers to no payment."}, "TxInf": {"meaning": "Transaction information under Undrlyg, including the case identification.", "card": "[1..1]", "mand": "Schema mandatory", "example": "One per resolution", "mt": "No MT equivalent", "errors": "Original-payment references outside TxInf fail schema validation."}, "Case": {"meaning": "Case block holding the investigation case identification.", "card": "[1..1]", "mand": "Schema mandatory", "example": "CASE-20261107-001", "mt": "No MT equivalent", "errors": "A missing case identification fails schema validation."}, "OrgnlEndToEndId": {"meaning": "End to end identification of the original payment.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "INV-9100", "mt": "No MT equivalent", "errors": "A missing end to end identification weakens matching."}, "OrgnlInstrId": {"meaning": "Instruction identification of the original payment.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "INSTR-20261106-007", "mt": "MT103 field :20:", "errors": "A wrong InstrId means the resolution targets the wrong payment."}, "OrgnlIntrBkSttlmAmt": {"meaning": "Original interbank settlement amount of the payment under investigation.", "card": "[0..1]", "mand": "Schema optional, business mandatory", "example": "USD 12500.00", "mt": "MT103 field :32A:", "errors": "An amount that does not match the original payment is rejected."}}};
var simB_smStates = {"Received": {"meaning": "The payment instruction has arrived at the hub and is recorded, but nothing has been checked yet.", "entry": "Customer submits the instruction through a channel. The hub records it with a payment ID.", "data": "Instruction reference, debtor and creditor details, amount, currency, value date, idempotency key.", "next": "Validation runs. A pass moves it to Validated, a fail moves it to Rejected, a duplicate match moves it to Duplicate.", "risk": "An unvalidated payment could carry a wrong account or amount, so no funds move from this state.", "note": ""}, "Validated": {"meaning": "The instruction passed structural and business validation and is ready for screening.", "entry": "validate OK.", "data": "Validated instruction, validation results, account status, balance check.", "next": "Screening runs. A clear result moves it to Accepted, a hit moves it to Held.", "risk": "Validation checks format and accounts, not sanctions, so a validated payment can still be held by screening.", "note": ""}, "Accepted": {"meaning": "Accepted for processing: the payment passed technical validation (ACTC) and customer-profile checks (ACCP), and is accepted for processing. The next agent confirmed the message is well formed, usually with pacs.002 ACCP.", "entry": "screening clear.", "data": "Accepted instruction, screening result, routing choice, UETR.", "next": "Routing and transmission, then clearing acceptance. If the correspondent is offline it queues.", "risk": "An accepted payment can still be rejected by clearing or fail at settlement, so acceptance must never be reported to the customer as money sent.", "note": "This is acceptance for processing (ACCP), not settlement. No money has moved. The full status ladder is ACTC, ACCP, ACSP, ACSC, ACCC, in that order."}, "Queued": {"meaning": "The payment is waiting because a downstream service is unavailable or a cut off was missed.", "entry": "correspondent offline.", "data": "Queued instruction, queue position, retry count, deadline.", "next": "When the correspondent returns it goes back to Accepted. If the deadline passes it moves to Unknown.", "risk": "A payment can sit in the queue past its value date, so queue ageing must be watched.", "note": ""}, "Clearing Accepted": {"meaning": "Settlement in process: the clearing system accepted the message and settlement is in process, usually confirmed by pacs.002 ACSP. ACSP is the later stage, not the earlier one: ACCP (accepted for processing) comes before ACSP (settlement in process).", "entry": "clearing accept.", "data": "Clearing reference, clearing cycle, value date, pacs.002 ACSP.", "next": "Settlement. A settlement confirmation moves it to Settled, a timeout moves it to Unknown.", "risk": "Clearing acceptance does not move money. A payment accepted by clearing can still fail to settle.", "note": "This is settlement in process (ACSP), not settlement. No money has moved yet."}, "Settled": {"meaning": "Settlement finality (ACSC): value moved finally and irrevocably between banks through a settlement account. The sending bank obligation is discharged. For correspondent settlement this is the nostro debit; for RTGS it is the central-bank posting.", "entry": "settlement confirm.", "data": "Settlement reference, settlement timestamp, debit and credit legs, settlement account balances.", "next": "Beneficiary credit. A credit confirmation moves it to Credited. If the creditor agent cannot credit, the payment is returned via pacs.004 and moves to Returned. A recall (camt.056) sent before credit can also return it to Returned.", "risk": "Settlement is final, so an error after this point needs a return or recall, not a cancellation.", "note": "This is settlement finality, not beneficiary credit. The beneficiary account may not be credited yet."}, "Credited": {"meaning": "Beneficiary credit (ACCC): the beneficiary bank posted the funds to the beneficiary customer account, so the customer can see the money. Settlement on the creditor's account is complete.", "entry": "beneficiary credit confirm.", "data": "Credit posting reference, beneficiary account, credit advice, value date.", "next": "Reconciliation matches it to Reconciled. A recall (camt.056) moves it to Recalled, but only with the beneficiary bank's agreement; a return cannot happen after credit, because a return (pacs.004) is what the creditor agent sends when it cannot credit, i.e. before credit.", "risk": "A credit can still be returned or recalled, so the money is not unconditionally the beneficiary until reconciliation and the return window close.", "note": "This is beneficiary credit, not settlement. Settlement already happened in the Settled state."}, "Reconciled": {"meaning": "End of day reconciliation matched the instruction, clearing, settlement and ledger records. No break is open.", "entry": "reconciliation match.", "data": "Matched records, UETR, end to end reference, reconciliation date, no-break confirmation.", "next": "None. Reconciled is terminal. The payment is complete and closed.", "risk": "None for this payment. A break found later reopens an investigation, not the payment state.", "note": ""}, "Held": {"meaning": "The payment is held for manual review, usually after a screening hit, and no funds move while it is held.", "entry": "screening hit.", "data": "Screening case reference, matched list entry, party details under review, hold timestamp.", "next": "Compliance clears it to Accepted or confirms the hit and rejects it.", "risk": "A held payment can miss its value date, so held cases need a service level deadline and an owner.", "note": ""}, "Rejected": {"meaning": "The payment was refused, by validation, screening, or clearing, and will not proceed in its current form.", "entry": "validation fail, screening hit confirmed, or clearing reject.", "data": "Rejection reason code, rejecting party, rejection timestamp, original instruction.", "next": "None. Rejected is terminal for this instruction. A new instruction is normally needed after an interbank RJCT. But an internal validation or screening hold that is repaired (for example a corrected BIC or a completed mandatory field) is a different case: the repaired instruction is re-released as a new instruction with a fresh InstrId and the same EndToEndId, it is not a revival of the rejected message.", "risk": "A rejected payment must never be retried silently, or it can be rejected again or duplicated.", "note": "Distinguish an internal hold that can be repaired and re-released from an interbank RJCT after sending, which normally needs a new instruction."}, "Returned": {"meaning": "Funds that reached the beneficiary bank were sent back by the creditor agent via pacs.004, because the creditor agent could not credit the beneficiary, for example because the account was closed. A return happens after settlement and before credit, never after credit.", "entry": "return received.", "data": "Return message pacs.004, return reason code, return amount, return timestamp.", "next": "None. Returned is terminal. The funds are back with the originator.", "risk": "The customer still needs to know why the payment came back and what to correct.", "note": ""}, "Recalled": {"meaning": "The originator asked for the payment back with a camt.056 and the beneficiary bank agreed, so the funds were returned after credit, via pacs.004 with reason FOCR, or the recall was refused via camt.029.", "entry": "recall received.", "data": "Recall message camt.056, recall reason, beneficiary bank agreement, return of funds.", "next": "None. Recalled is terminal.", "risk": "A recall needs the beneficiary bank agreement. It is not automatic, and a spent credit cannot be recalled.", "note": ""}, "Failed": {"meaning": "The payment did not complete and the payment is closed as failed, for example because the investigation of an Unknown payment proved settlement never posted.", "entry": "investigation finds failed, or a queued payment expires before it was ever sent.", "data": "Failure reason, failed stage, original instruction, any funds recovered.", "next": "None. Failed is terminal. A new instruction is needed.", "risk": "Failed payments need a named owner and a customer message, or the customer waits for money that will never arrive.", "note": ""}, "Unknown": {"meaning": "The payment passed a deadline with no confirmation AFTER it was sent, so the bank does not know whether it settled. This is the most dangerous state because the money may have moved.", "entry": "timeout, or settlement timeout.", "data": "Last confirmed state, UETR, missing confirmation, deadline that passed.", "next": "Investigation: send a pacs.028 status request with the UETR, check the UETR status on the SWIFT tracker, check the settlement account. It resolves to Settled or Failed. For SCT Inst the originator bank sends pacs.028 if no response arrives after 25 seconds.", "risk": "Acting as if an Unknown payment failed can double-pay the beneficiary. Acting as if it settled can leave the beneficiary unpaid.", "note": ""}, "Expired": {"meaning": "The payment window closed with no answer and nothing was ever sent, so the payment is closed without money moving. This state is scoped to a named scheme rule, not a generic 10-second rule: for SCT Inst the maximum execution time is 10 seconds (5-7-9 second subtimeline from 5 Oct 2025), and a timeout there triggers a pacs.028 investigation, not an automatic closure. UK Faster Payments has no 10-second expiry: a single immediate payment usually completes in seconds and can take up to 2 hours, with an automatic scheme reversal on timeout.", "entry": "The payment's deadline passed before it was sent (for example a queued payment whose value-date window closed), or an SCT Inst payment passed its maximum execution time with no confirmation and the pacs.028 investigation found nothing was sent.", "data": "Expiry timestamp, deadline, original instruction, released reservation.", "next": "None. Expired is terminal. A new instruction is needed.", "risk": "An expired payment releases any reserved funds, so the customer balance must be checked after expiry.", "note": ""}, "Duplicate": {"meaning": "This instruction is a copy of a payment that already exists, so it was dropped before any money moved.", "entry": "duplicate detected.", "data": "Idempotency key, original payment ID, matching reference and amount, UETR.", "next": "None. Duplicate is terminal. The original payment continues on its own.", "risk": "Dropping the wrong instruction would lose a genuine second payment, so the match must be proven from the idempotency key and the full instruction.", "note": ""}};
var simB_smTerminal = ["Duplicate", "Rejected", "Returned", "Recalled", "Failed", "Expired", "Reconciled"];

/* ===== Payments Training Hub simulators JS ===== */

/* ===== Simulators A: lifecycle animation, cross-border maths, T2/TIPS ===== */
/* Lifecycle stage data: ONE correspondent cross-border variant (19 stages).
   Ledger posting is not a separate stage after beneficiary credit: each
   bank posts its own legs when its own step happens (A-16). */
var simA_LIFE = [
{"name":"Initiation", "event":"Initiation", "time":"09:00:00", "msg":"Customer enters the instruction in online banking: pay USD 25,000 to Tanaka Trading Pte Ltd, Singapore, reference INV-8841, value date 5 November 2026. The debtor agent assigns the UETR here, at initiation, and it is carried unchanged through the chain in pacs.008, pacs.009 and pacs.002.", "check":"Form complete. Beneficiary name, account number and BIC all present. Customer approves with a one time code.", "money":"No debit yet. Balance check: the account holds enough to cover USD 25,000 plus charges.", "status":"Instruction received.", "incoming":"Customer instruction entered in online banking: beneficiary, amount USD 25,000, currency USD, value date, remittance INV-8841.", "outgoing":"Approved instruction with a one time code confirmation, sent to the channel.", "data":"Debtor account number, creditor name Tanaka Trading Pte Ltd, creditor account number and BIC, amount, currency, value date, remittance reference INV-8841, UETR assigned by the debtor agent.", "system":"Online banking channel.", "failure":"Customer abandons the instruction or the one time code fails, so no instruction is created and no payment exists.", "recovery":"Customer re-enters the instruction and approves it again. Nothing was sent, so there is nothing to unwind. The one time code is an illustrative channel control, not a payment-system rule: channel authentication is governed by the channel and by regulation, and is distinct from payment authorisation and from debtor-agent acceptance."},
{"name":"Authentication", "event":"Authentication", "time":"09:00:02", "msg":"Channel authenticates the customer session and forwards the approved instruction to the API gateway with an OAuth token.", "check":"Session valid, one time code matched, customer authorised for this account and amount.", "money":"No debit yet.", "status":"Customer authenticated, instruction accepted by the channel.", "incoming":"Approved instruction plus the customer session token and one time code result.", "outgoing":"Authenticated payment order, passed to the API gateway.", "data":"Customer identifier, session token, one time code result, authorisation limit.", "system":"Channel authentication service and API gateway.", "failure":"Authentication fails, so the instruction is rejected at the channel and the customer is asked to sign in again.", "recovery":"Customer re-authenticates. The failed attempt is logged and no duplicate instruction is created."},
{"name":"Ingestion", "event":"Payment acceptance", "time":"09:00:05", "msg":"Customer-to-bank initiation message pain.001 Customer Credit Transfer Initiation, received from the channel (in this example carried over a channel API as POST /v1/payments with an idempotency key; the API is a channel binding, not the ISO 20022 initiation message). Status is reported back to the customer with pain.002 Customer Payment Status Report.", "check":"Authentication passed. Schema valid. Amount greater than zero, two decimal places, currency USD is a valid ISO code.", "money":"No debit yet. Idempotency key recorded, so a retry returns the same result instead of a duplicate payment. Idempotency is an API control, not an ISO 20022 message field.", "status":"ACCEPTED, payment ID PAY-20261105-8841.", "incoming":"Authenticated payment order from the channel, with an idempotency key.", "outgoing":"Accepted payment record with payment ID PAY-20261105-8841, sent to the pre-processor.", "data":"Idempotency key, payment ID, debtor and creditor details, amount USD 25,000, currency USD, value date.", "system":"API gateway and payment ingestion layer.", "failure":"Schema validation fails or the idempotency key is missing, so the order is rejected with a 400 error and no payment is created.", "recovery":"Channel corrects the payload and resubmits. A retry with the same idempotency key returns the original acceptance, never a second payment."},
{"name":"Validation", "event":"Payment processing", "time":"09:00:09", "msg":"Structural validation of the payment order: debtor-side UK IBAN modulus-97 check where a UK IBAN is used, creditor-side Singapore bank code plus account number (Singapore does not use IBAN), BIC directory check, mandatory fields, value date and cut off checks. The US business day must also be checked, because USD settlement depends on a US business day.", "check":"All structural checks passed. Debtor UK IBAN passes modulus 97. Creditor Singapore bank code and account number are valid, and the BIC is an 8- or 11-character entry in the SWIFT BIC directory. Value date 5 November 2026 is a Thursday and a business day in London and Singapore; the US business-day check is required before USD settlement.", "money":"No debit yet.", "status":"Structurally valid, passed to duplicate checks.", "incoming":"Accepted payment record from ingestion.", "outgoing":"Validated payment record, passed to duplicate checks.", "data":"Debtor UK IBAN, creditor Singapore bank code plus account number, BIC, amount, currency, value date, mandatory field set, cut off calendar.", "system":"Pre-processor and reference data service.", "failure":"A check fails, for example an invalid BIC, so the payment is rejected to the channel with a specific reason code.", "recovery":"Correct the data from the reference directory or the customer, then treat the corrected instruction as a new payment. Teaching note: IBAN applies only in IBAN countries; Singapore has no IBAN."},
{"name":"Duplicate checks", "event":"Payment processing", "time":"09:00:10", "msg":"Duplicate check by idempotency key, instruction reference and amount: no identical payment found.", "check":"No duplicate found. Idempotency key is new, and no earlier payment carries the same reference, amount and beneficiary. The duplicate window used here is 24 hours, which is an illustrative bank policy, not a standard: duplicate windows are a bank policy choice. A duplicate rejection uses reason code AM05 Duplication.", "money":"No debit yet. No earlier debit exists for this instruction.", "status":"Not a duplicate, passed to account validation.", "incoming":"Validated payment record with idempotency key and end to end reference.", "outgoing":"Cleared payment record, passed to account validation.", "data":"Idempotency key, instruction reference, amount USD 25,000, beneficiary account, payment history over the illustrative 24-hour window.", "system":"Pre-processor and payment store.", "failure":"A matching payment is found, so the instruction is flagged as a duplicate (AM05) and stopped before any debit.", "recovery":"Return the original payment ID to the channel. If the customer genuinely meant a second payment, they submit a new instruction with a new reference."},
{"name":"Account validation", "event":"Payment processing", "time":"09:00:14", "msg":"Account validation: debtor account exists, is open, and holds enough to cover USD 25,000 plus the USD 25 fee.", "check":"Debtor account confirmed open. Balance sufficient. No account freeze or restriction.", "money":"Funds reserved / earmarked (a hold, not a debit): USD 25,000 plus the USD 25 fee is set aside on the London corporate account. No debit posts yet. The customer account is debited when the payment is executed, and the USD 25 fee is charged at execution.", "status":"Account validated, funds earmarked.", "incoming":"Cleared payment record from duplicate checks.", "outgoing":"Account-validated instruction with earmarked funds, passed to enrichment.", "data":"Debtor account number, account status, available balance, earmark amount USD 25,025.", "system":"Payment engine and core banking.", "failure":"Insufficient funds (reason AM04) or a closed account (AC01), so the payment is rejected and the earmark is released.", "recovery":"Customer funds the account or corrects the account details, then submits a new instruction. The rejected payment is never retried silently."},
{"name":"Enrichment", "event":"Payment processing", "time":"09:00:18", "msg":"Enriched instruction: customer and account data added, end to end reference LON-SIN-25000-01 assigned, charge option SHA applied. In pacs.008 the charge bearer is ChrgBr SHAR (SHA); DEBT is OUR and CRED is BEN.", "check":"Enrichment complete. Debtor account confirmed. Charge rule applied: SHA, so each bank bears its own charges.", "money":"No debit yet. Charge estimate: USD 25 originator fee, correspondent charges to be deducted in transit.", "status":"Validated and enriched, ready for screening.", "incoming":"Account-validated instruction.", "outgoing":"Enriched instruction with end to end reference LON-SIN-25000-01, passed to screening.", "data":"Debtor and creditor address data, BIC directory entry, charge bearer SHA (ChrgBr SHAR), purpose code supplier payment, end to end reference.", "system":"Pre-processor and reference data service.", "failure":"A required field cannot be enriched, for example a missing BIC, so the payment waits in the enrichment queue.", "recovery":"Refresh the reference data, re-enrich from the stored original instruction, and release only when every required field is present."},
{"name":"Screening", "event":"Payment processing", "time":"09:00:27", "msg":"Instruction sent to the screening engine with debtor, creditor, banks, countries and purpose, supplier payment. Screening is repeated at each agent in the chain, not only at origin and at credit: every correspondent screens the payment, and in a cover payment the cover chain must carry the underlying customer data (MT202 COV / pacs.009 COV) precisely so correspondents can screen.", "check":"Sanctions lists: no match. AML rules: no alert. Fraud score: low. Result: clear.", "money":"No money moves at screening. The debit stays earmarked.", "status":"Screened, released for the FX check.", "incoming":"Enriched instruction with full debtor, creditor and bank details.", "outgoing":"Screening result clear, passed to the FX check.", "data":"Debtor and creditor names and addresses, countries, intermediary banks, amount, purpose.", "system":"Sanctions and AML screening engine, case management.", "failure":"A sanctions match or AML alert holds the payment for manual review. No funds move while it is held. A confirmed match does not simply block the payment: depending on the regime it may require freezing or blocking of funds and reporting, and the exact duty is regime-specific (OFAC, EU, UN, MAS), so no specific freeze or report rule is stated here. A pre-settlement rejection is a pacs.002 RJCT with a reason code; funds already settled must be returned by pacs.004.", "recovery":"Compliance compares the full party details against the list entry, records a clear or confirm decision, and releases or blocks the payment on that decision."},
{"name":"FX", "event":"Payment processing", "time":"09:00:30", "msg":"FX check: payment currency USD and settlement currency USD are the same, so no conversion occurs and no exchange rate is applied or recorded. There are no FX fields to validate for a same-currency payment.", "check":"FX check passed explicitly. Same currency, no conversion needed, no rate, no spread, no rounding difference.", "money":"No conversion, no FX charge. Amount stays USD 25,000 end to end.", "status":"FX check complete, passed to routing.", "incoming":"Screened instruction with currency USD and amount USD 25,000.", "outgoing":"FX-checked instruction, passed to routing.", "data":"Source currency USD, target currency USD, value date. No rate is recorded for a same-currency payment.", "system":"Payment engine and FX rate service.", "failure":"If conversion were needed and the FX rate service returns no rate, the payment cannot be priced and waits in the FX queue.", "recovery":"Retry the rate request. If conversion were needed, re-price once a rate is available, and release only with a recorded rate. A converted-currency variant is a separate example, not this payment."},
{"name":"Routing", "event":"Payment processing", "time":"09:00:38", "msg":"Routed instruction sent to the routing engine with the correspondent chain and charge bearer SHA.", "check":"Cut off times checked. Route selected: London to New York correspondent, then to Singapore.", "money":"Nostro funding confirmed: USD 25,000 available in the New York USD nostro account.", "status":"Routed, passed to correspondent selection.", "incoming":"FX-checked instruction with amount, currency, destination and urgency.", "outgoing":"Selected route with next hop and expected arrival time, passed to correspondent selection.", "data":"Amount, currency, destination country Singapore, urgency, cut off times, route costs, correspondent availability.", "system":"Routing engine, routing tables, clearing calendar.", "failure":"No route meets the cut off, so the payment waits for the next routing window or a fallback route.", "recovery":"Fall back to the next best available route in the routing table and notify operations of the route change."},
{"name":"Correspondent selection", "event":"Payment processing", "time":"09:00:45", "msg":"New York correspondent selected. Nostro balance checked: USD 25,000 available. Cut off checked: instruction is inside the New York cut off. Alternative correspondent named: a second New York correspondent held as fallback.", "check":"Correspondent selected and available. Nostro balance sufficient. Cut off met. Alternative correspondent recorded.", "money":"Nostro funding confirmed in the selected New York correspondent account.", "status":"Correspondent selected, passed to message generation.", "incoming":"Routed instruction with the selected route.", "outgoing":"Correspondent choice with nostro balance and cut off confirmation, passed to the SWIFT service.", "data":"Correspondent BIC, nostro account balance, cut off time, alternative correspondent BIC, charge bearer SHA.", "system":"Routing engine and correspondent bank directory.", "failure":"The selected correspondent is offline or its nostro balance is short, so the payment holds at correspondent selection. This is a correspondent-availability failure, not a routing-table failure.", "recovery":"Switch to the named alternative correspondent, recheck its nostro balance and cut off, then generate a new message and transmit it: the recovery replays message generation, transmission and acknowledgements in order, it does not jump to settlement."},
{"name":"Message generation", "event":"Payment processing", "time":"09:01:05", "msg":"pacs.008 generated for the USD 25,000 payment. The UETR was assigned by the debtor agent at initiation and is carried unchanged here; the business application header is head.001.", "check":"pacs.008 passes schema validation. UETR is unique. Business application header head.001 carries sender, receiver and message type.", "money":"No money moves at message generation. Amount in the message is USD 25,000.", "status":"Message generated, ready for transmission.", "incoming":"Correspondent instruction with full debtor, creditor, amount and route data.", "outgoing":"pacs.008 message with UETR and head.001 business application header, passed to transmission.", "data":"UETR, end to end reference LON-SIN-25000-01, debtor and creditor details, amount USD 25,000, charge bearer SHA.", "system":"SWIFT service and message builder.", "failure":"Schema validation fails, for example a missing mandatory element, so the message is not sent.", "recovery":"Read the schema error, fix the message build, revalidate, and generate the message again."},
{"name":"Transmission", "event":"Payment processing", "time":"09:01:20", "msg":"pacs.008 transmitted via SWIFT to the New York correspondent. SWIFT network delivery acknowledgement received. That is a network acknowledgement, distinct from the business pacs.002 ACSP from the next agent.", "check":"Transmission confirmed. SWIFT delivery acknowledgement received. Message stored in the acknowledgement store.", "money":"No money moves at transmission. The nostro debit is still to be posted at settlement.", "status":"Transmitted, awaiting processing acknowledgement.", "incoming":"Generated pacs.008 with UETR and head.001 business application header.", "outgoing":"Transmitted pacs.008 plus delivery acknowledgement, passed to acknowledgement handling.", "data":"UETR, SWIFT message reference, delivery acknowledgement, transmission timestamp.", "system":"SWIFT service and acknowledgement store.", "failure":"Transmission fails, a technical outage occurs, or no delivery acknowledgement arrives, so the payment waits and the message is not assumed sent.", "recovery":"Check the acknowledgement store before any resend, confirm with the correspondent whether the original arrived, and resend only when it is confirmed as not received."},
{"name":"Acknowledgements", "event":"Payment processing", "time":"09:01:40", "msg":"pacs.002 ACSP received: instruction accepted for processing by the next agent.", "check":"pacs.002 matched to the original pacs.008 by UETR and references. Status ACSP confirms acceptance for processing, not settlement.", "money":"No money moves on acknowledgement. Acceptance is not settlement.", "status":"Accepted for processing by the next agent, passed to correspondent receipt.", "incoming":"pacs.002 ACSP from the next agent, matched by UETR.", "outgoing":"Acknowledged instruction with ACSP recorded, passed to correspondent receipt.", "data":"UETR, pacs.002 status ACSP, accepting agent BIC, acknowledgement timestamp.", "system":"SWIFT service and acknowledgement store.", "failure":"A rejection arrives instead of ACSP, or no acknowledgement arrives before the timeout, so the payment moves to Unknown and investigation starts.", "recovery":"Query the correspondent and check the UETR status. Resend only if the original is confirmed as not received."},
{"name":"Correspondent receipt", "event":"Correspondent receipt", "time":"09:12:00", "msg":"pacs.008 received by the creditor agent in Singapore and validated. There is no Singapore local clearing cycle for this USD payment: USD settles through the US correspondent chain, in practice through CHIPS or Fedwire between US correspondents, and the creditor agent credits from its own nostro position. SWIFT is messaging only and does not clear or settle.", "check":"pacs.008 valid under CBPR+ rules. Creditor account exists. Value date is a business day in Singapore, and the US business day has been checked for USD settlement.", "money":"No debit or credit yet at correspondent receipt. Amount confirmed: USD 25,000 to be settled.", "status":"Received by the creditor agent, passed to settlement.", "incoming":"Transmitted pacs.008 with ACSP acknowledgement.", "outgoing":"Creditor-agent receipt with a settlement reference, passed to settlement.", "data":"pacs.008, creditor agent BIC, settlement reference, value date.", "system":"Creditor agent in Singapore and the US correspondent chain (CHIPS / Fedwire).", "failure":"The creditor agent rejects the message, for example an invalid account, with a pacs.002 RJCT and a reason code (for example AC01 invalid account, AC04 closed account, BE01 inconsistent creditor). This is a pre-settlement rejection: no funds moved, so there are no funds to return and no pacs.004 applies.", "recovery":"Repair the cause from the rejection reason code and resend as a new instruction."},
{"name":"Settlement", "event":"Settlement finality", "time":"09:28:00", "msg":"Interbank settlement in the US correspondent chain (CHIPS or Fedwire): the originator bank USD nostro at its New York correspondent is debited USD 25,000, and the creditor agent USD nostro at its New York correspondent is credited USD 25,000. Each leg is a nostro debit on one side and the matching vostro credit on the other. The debtor customer account is debited USD 25,000 plus the USD 25 fee at execution, as its own posting at the debtor bank.", "check":"Both legs balance. Ledger check passed at each bank. Settlement reference recorded.", "money":"Debit USD 25,000 to the originator bank nostro at its New York correspondent. Credit USD 25,000 to the creditor agent nostro at its New York correspondent. Debit USD 25,000 plus USD 25 fee to the London corporate account at execution.", "status":"Settlement final.", "incoming":"Creditor-agent receipt with settlement reference and USD 25,000 instruction.", "outgoing":"Settlement confirmation with settlement reference and timestamp, passed to beneficiary credit.", "data":"Originator bank nostro account and balance, creditor agent nostro account, settlement reference, value date.", "system":"Settlement engine and CHIPS / Fedwire settlement between US correspondents.", "failure":"Nostro shortfall means the debit cannot post, so the payment queues at settlement and waits for funding.", "recovery":"Treasury funds the nostro, for example by Fedwire or CHIPS funding of the nostro account, and the queued payment is released. The debit and credit then post in full. Same-value-date settlement after a funding delay is not guaranteed: if funding arrives after the correspondent or CHIPS/Fedwire cut-off, the value date slips to the next business day. The USD 30,000 funding figure in the repair example is an illustrative amount covering the USD 25,000 payment plus a buffer for other queued payments, not a standard amount."},
{"name":"Beneficiary credit", "event":"Beneficiary credit", "time":"09:41:00", "msg":"Settled funds plus pacs.008 received by the beneficiary bank in Singapore. The supplier account of Tanaka Trading Pte Ltd is credited USD 25,000 and a credit advice is sent.", "check":"Creditor-agent account and name match passed: creditor account number matches the account name. Remittance INV-8841 matched. Credit posted on value date 5 November 2026. This account and name match is a creditor-agent control, distinct from sanctions screening, which is repeated at each agent in the chain.", "money":"Credit USD 25,000 to the supplier account. Supplier balance up by USD 25,000. London corporate account down by USD 25,000 plus a USD 25 fee (debited at execution).", "status":"Beneficiary credited.", "incoming":"Settlement confirmation plus pacs.008 at the beneficiary bank.", "outgoing":"Credit posting on the supplier account and a credit advice to the supplier, passed to notifications.", "data":"Creditor account number and name, settlement reference, remittance INV-8841, credit advice details.", "system":"Beneficiary bank core banking and credit advice service.", "failure":"The creditor account is closed (AC04) or the name does not match, so the credit fails and the payment is returned.", "recovery":"Return the settled funds with a pacs.004 and the correct reason code. Any resend is a separate new payment with a new instruction and a new UETR, not a continuation of the returned payment. The returned amount is the settled amount, not necessarily the original instructed amount."},
{"name":"Notifications", "event":"Notification", "time":"09:42:00", "msg":"Status reports flow hop by hop along the chain back to the originator. The creditor-credit confirmation is pacs.002 ACCC, meaning settlement on the creditor account has been completed. ACSC, meaning settlement completed, is used only for settlement completion at the interbank leg, never as the beneficiary-credit confirmation. Credit advice sent to the supplier. Status notifications sent to the channel.", "check":"ACCC matched by UETR to the original instruction. Credit advice delivered to Tanaka Trading Pte Ltd. Channel status updated to credited.", "money":"No money moves at notification. Balances are unchanged.", "status":"Originator and supplier notified, passed to reconciliation.", "incoming":"Beneficiary credit confirmation and settlement record.", "outgoing":"pacs.002 ACCC to the originator (hop by hop), credit advice to the supplier, status update to the channel.", "data":"UETR, pacs.002 status ACCC, credit advice reference, channel notification record.", "system":"Notification service, SWIFT service and channel.", "failure":"A notification fails to deliver, so the customer sees a stale status even though the payment settled.", "recovery":"Retry delivery from the stored notification record. The payment itself needs no repair because settlement already completed."},
{"name":"Reconciliation", "event":"Reconciliation", "time":"17:30:00", "msg":"End of day reconciliation: the payment is matched against the instruction record, the correspondent settlement record and the ledger entries using the UETR and the end to end reference LON-SIN-25000-01, against the camt.053 bank to customer statement and camt.054 debit credit notifications.", "check":"All records match: instruction, correspondent settlement and ledger. Amount USD 25,000, value date 5 November 2026, no break.", "money":"No money moves at reconciliation. The nostro balance is confirmed USD 25,000 lower, and the suspense account is untouched because nothing is unmatched.", "status":"Reconciled, no break.", "incoming":"Instruction record, correspondent settlement record, ledger entries, nostro statement (camt.053) and notifications (camt.054).", "outgoing":"Matched position with no open break, filed to the audit trail.", "data":"UETR, end to end reference LON-SIN-25000-01, amount USD 25,000, value date, statement lines.", "system":"Reconciliation engine and nostro statement feed.", "failure":"A record does not match, so a break is opened with an owner and an ageing clock.", "recovery":"Work the break to its root cause, post the missing entry or request the missing statement, and escalate any break older than five business days. Five business days is an illustrative bank policy, not a standard."}
];
/* Stage indices below are positions in simA_LIFE (the cross-border variant).
   simA_LIFE_RAILS maps each rail to the subset of simA_LIFE it uses. */
var simA_LIFE_RAILS = {
crossborder:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18],
domestic:[0,1,2,3,4,5,6,7,9,14,15,16,17,18],
instant:[0,1,2,3,4,5,6,7,15,16,17,18],
rtgs:[0,1,2,3,4,5,6,7,9,15,16,17,18],
onus:[0,1,2,3,4,5,6,7,15,16,17,18]
};
var simA_LIFE_RAIL_NOTES = {
crossborder:"Cross-border correspondent variant: the full 19 stages shown. USD settles through the US correspondent chain (CHIPS / Fedwire); SWIFT is messaging only.",
domestic:"Domestic credit transfer: no FX, no correspondent selection, no pacs.008 hop and no cross-border correspondent chain. Clearing here is the domestic clearing system, and settlement is in the domestic system, not through a US correspondent.",
instant:"Instant payment: no FX, correspondent selection, pacs.008 hop or clearing cycle. Funds are reserved on the payer account pending the beneficiary reply, and the SCT Inst scheme maximum execution timeline is 10 seconds end to end. The settlement stage below stands in for reservation plus settlement.",
rtgs:"High-value RTGS: no correspondent chain and no clearing cycle. After validation the payment is settled at entry disposition if liquidity and FIFO conditions allow, otherwise queued with offsetting and optimisation, and settled or rejected at the cut-off.",
onus:"On-us payment, same bank for debtor and creditor: no SWIFT, no correspondent, no clearing and no interbank settlement, only an internal book transfer between two accounts at the same bank."
};
var simA_LIFE_FAIL = {
screening:{stage:7, title:"Screening hit: payment held", text:"The screening engine finds a close name match between the beneficiary and a sanctions list entry. The payment is held at Screening and no funds move. This is a hold, not a rejection: the payment waits while compliance reviews the match.", fix:"Compliance reviews the match, confirms it is a false positive because the beneficiary address, country and business type do not match the listed entry, and releases the payment. The screening result is recorded as clear after review, and the payment continues. If the match were confirmed, the outcome depends on the regime (freeze, block or report duties are regime-specific) and a pre-settlement rejection would be a pacs.002 RJCT with a reason code, while funds already settled would be returned by pacs.004."},
fraud:{stage:7, title:"Fraud rejection", text:"The fraud engine scores the payment as high risk, for example an unusual beneficiary or amount pattern for this customer. The payment is rejected at Screening before any funds move.", fix:"Fraud operations review the case with the customer. If the payment is genuine, the customer confirms it and submits a new instruction; the rejected payment is never retried silently."},
insufficient:{stage:5, title:"Insufficient funds (AM04)", text:"The debtor account does not hold enough to cover USD 25,000 plus the USD 25 fee, so the payment is rejected at Account validation with reason AM04 and the earmark is released. No funds move.", fix:"The customer funds the account and submits a new instruction. The rejected payment is never retried silently."},
duplicate:{stage:4, title:"Duplicate payment (AM05)", text:"An identical payment with the same reference, amount and beneficiary is already in the store, so the instruction is flagged as a duplicate (AM05) and stopped before any debit.", fix:"Return the original payment ID to the channel. If the customer genuinely meant a second payment, they submit a new instruction with a new reference."},
invalidbene:{stage:16, title:"Invalid beneficiary account (AC01)", text:"The creditor account number does not match any account at the beneficiary bank, so the credit cannot post. The payment is rejected with reason AC01 before settlement, so no funds moved and no pacs.004 return applies.", fix:"Correct the account details from the reference directory or the customer, then submit a new instruction as a new payment with a new UETR."},
routing:{stage:10, title:"Correspondent offline", text:"The routing engine selected the New York correspondent, but the correspondent is offline and cannot accept the pacs.008. The payment is held at Correspondent selection and the value date is at risk if no alternative route is found.", fix:"Select the alternative correspondent in New York, recheck its nostro balance and cut off time, then generate a new message and transmit it. The recovery replays message generation, transmission and acknowledgements in order before the payment reaches correspondent receipt."},
timeout:{stage:13, title:"Transmission timeout, no acknowledgement", text:"No pacs.002 acknowledgement arrives before the timeout, so the payment moves to Unknown and investigation starts. The message is not assumed sent.", fix:"Query the correspondent and check the UETR status. Resend only if the original is confirmed as not received."},
outage:{stage:12, title:"Technical outage at transmission", text:"The SWIFT service is unavailable, so the pacs.008 cannot be transmitted. The payment waits at Transmission and no funds move.", fix:"Once the service returns, check the acknowledgement store to confirm the message was not sent, then transmit it. Do not resend blindly."},
settlement:{stage:15, title:"Settlement delay: nostro shortfall", text:"At settlement time the New York nostro account holds less than USD 25,000, so the debit cannot post. The payment queues at Settlement and waits for funding. Nothing is credited in Singapore yet.", fix:"Treasury is alerted and funds the nostro, for example by Fedwire or CHIPS funding, with an illustrative USD 30,000 covering the USD 25,000 payment plus a buffer for other queued payments. The queued payment is released and the debit and credit post in full. Same-value-date settlement is not guaranteed: if funding arrives after the cut-off, the value date slips to the next business day."},
benebank:{stage:16, title:"Beneficiary bank rejects the credit (AC04)", text:"The creditor account is closed (AC04), so the credit fails after settlement. The settled funds must be returned.", fix:"Return the settled funds with a pacs.004 and reason code AC04. Any resend is a separate new payment with a new instruction and a new UETR, and the returned amount is the settled amount."}
};

var simA_lifeIdx = -1;
var simA_lifeTimer = null;
var simA_lifeSpeed = 1;
var simA_lifeFailure = "none";
var simA_lifeFailed = false;
var simA_lifeDone = false;
var simA_lifeRail = "crossborder";
var simA_lifeMax = -1;
function simA_lifeStages(){ return simA_LIFE_RAILS[simA_lifeRail] || simA_LIFE_RAILS.crossborder; }
function simA_lifeStageAt(pos){ var list = simA_lifeStages(); return simA_LIFE[list[pos]]; }
function simA_lifeBuildNodes(){
  var wrap = document.getElementById("simA-lifeNodes");
  if(!wrap) return;
  wrap.innerHTML = "";
  var list = simA_lifeStages();
  for(var p = 0; p < list.length; p++){
    (function(pos){
      var b = document.createElement("button");
      b.className = "simA-node";
      b.id = "simA-lifeNode-" + pos;
      b.textContent = (pos + 1) + ". " + simA_LIFE[list[pos]].name;
      b.onclick = function(){ simA_lifeJump(pos); };
      wrap.appendChild(b);
    })(p);
  }
}
function simA_lifeStopTimer(){ if(simA_lifeTimer){ clearInterval(simA_lifeTimer); simA_lifeTimer = null; } }
function simA_lifeLog(text){ var log = document.getElementById("simA-lifeLog"); if(log){ var li = document.createElement("li"); li.textContent = text; log.appendChild(li); } }
function simA_lifeRender(){
  var panel = document.getElementById("simA-lifePanel");
  var fill = document.getElementById("simA-lifeFill");
  var dot = document.getElementById("simA-lifeDot");
  var list = simA_lifeStages();
  if(simA_lifeIdx < 0){
    if(panel){ panel.innerHTML = "<h3>Ready</h3><p>Press Start to send the USD 25,000 payment from London to Singapore, or press Step to move through the stages one at a time.</p>"; }
    if(fill) fill.style.width = "0%";
    if(dot) dot.style.left = "0%";
    return;
  }
  var st = simA_lifeStageAt(simA_lifeIdx);
  var pct = Math.round((simA_lifeIdx + 1) / list.length * 100);
  if(fill) fill.style.width = pct + "%";
  if(dot) dot.style.left = pct + "%";
  for(var i = 0; i < list.length; i++){
    var node = document.getElementById("simA-lifeNode-" + i);
    if(node){ node.classList.remove("active"); node.classList.remove("failed"); if(i < simA_lifeIdx || (i === simA_lifeIdx && simA_lifeDone)) node.classList.add("done"); if(i === simA_lifeIdx && !simA_lifeDone) node.classList.add("active"); }
  }
  if(panel){
    panel.innerHTML = "<h3>Stage " + (simA_lifeIdx + 1) + " of " + list.length + ": " + st.name + "</h3>"
      + "<p><b>Payment event.</b> " + st.event + " &nbsp;|&nbsp; <b>Time.</b> " + st.time + "</p>"
      + "<p><b>Message exchanged.</b> " + st.msg + "</p>"
      + "<p><b>Validation result.</b> " + st.check + "</p>"
      + "<p><b>Debits and credits.</b> " + st.money + "</p>"
      + "<p><b>Status change.</b> " + st.status + "</p>"
      + "<p><b>What comes in.</b> " + st.incoming + "</p>"
      + "<p><b>What goes out.</b> " + st.outgoing + "</p>"
      + "<p><b>What data is used.</b> " + st.data + "</p>"
      + "<p><b>Which system.</b> " + st.system + "</p>"
      + "<p><b>What happens on failure.</b> " + st.failure + "</p>"
      + "<p><b>How it recovers.</b> " + st.recovery + "</p>";
  }
}
function simA_lifeShowFail(kind){
  simA_lifeStopTimer();
  simA_lifeFailed = true;
  var info = simA_LIFE_FAIL[kind];
  var list = simA_lifeStages();
  var pos = list.indexOf(info.stage);
  var node = document.getElementById("simA-lifeNode-" + pos);
  if(node){ node.classList.add("failed"); }
  var box = document.getElementById("simA-lifeFail");
  if(box){
    box.style.display = "block";
    box.innerHTML = "<h3>" + info.title + "</h3><p>" + info.text + "</p>"
      + "<p><b>Repair path.</b> The payment moves to the repair queue. Operations own it from here: they fix the cause, record the action, and the failed stage is re-run before the payment advances. The payment is never sent twice and no funds move while it is in repair.</p>"
      + "<button class=\"simA-btn' onclick=\"simA_lifeResolve()'>Resolve and re-run this stage</button>";
  }
  simA_lifeLog("Failure at " + simA_LIFE[info.stage].name + ": " + info.title + ". Payment sent to repair queue.");
}
function simA_lifeResolve(){
  var kind = simA_lifeFailure;
  var info = simA_LIFE_FAIL[kind];
  if(!info) return;
  var box = document.getElementById("simA-lifeFail");
  if(box){ box.style.display = "none"; box.innerHTML = ""; }
  var list = simA_lifeStages();
  var pos = list.indexOf(info.stage);
  var node = document.getElementById("simA-lifeNode-" + pos);
  if(node){ node.classList.remove("failed"); }
  simA_lifeLog("Repair: " + info.fix);
  simA_lifeFailed = false;
  simA_lifeFailure = "none";
  var sel = document.getElementById("simA-lifeFailure");
  if(sel) sel.value = "none";
  var panel = document.getElementById("simA-lifePanel");
  if(panel){
    panel.innerHTML = "<h3>Stage " + (pos + 1) + " of " + list.length + ": " + simA_LIFE[info.stage].name + " resolved</h3>"
      + "<p><b>What happened.</b> " + info.fix + "</p>"
      + "<p>Press Start to re-run this stage and continue the payment.</p>";
  }
  /* Re-run the failed stage: step back one position so Start advances into it again. */
  simA_lifeIdx = pos - 1;
  simA_lifeDone = false;
  if(simA_lifeIdx >= 0 && simA_lifeIdx > simA_lifeMax) simA_lifeMax = simA_lifeIdx;
  simA_lifeRender();
}
function simA_lifeAdvance(){
  if(simA_lifeFailed) return;
  var list = simA_lifeStages();
  if(simA_lifeIdx >= list.length - 1){ simA_lifeStopTimer(); simA_lifeDone = true; simA_lifeRender(); simA_lifeLog("All " + list.length + " stages done. Beneficiary credited USD 25,000, reconciliation matched."); return; }
  var next = simA_lifeIdx + 1;
  if(simA_lifeFailure !== "none"){
    var info = simA_LIFE_FAIL[simA_lifeFailure];
    if(info){
      var pos = list.indexOf(info.stage);
      if(pos === -1){
        simA_lifeLog("Failure " + simA_lifeFailure + " does not apply to the " + simA_lifeRail + " rail, so it was not injected.");
        simA_lifeFailure = "none";
        var sel2 = document.getElementById("simA-lifeFailure");
        if(sel2) sel2.value = "none";
      } else if(next === pos){
        simA_lifeIdx = next;
        simA_lifeDone = false;
        if(simA_lifeIdx > simA_lifeMax) simA_lifeMax = simA_lifeIdx;
        simA_lifeRender();
        simA_lifeLog("Stage " + (next + 1) + ": " + simA_lifeStageAt(next).name + " reached.");
        simA_lifeShowFail(simA_lifeFailure);
        return;
      }
    }
  }
  simA_lifeIdx = next;
  simA_lifeDone = (simA_lifeIdx === list.length - 1);
  if(simA_lifeIdx > simA_lifeMax) simA_lifeMax = simA_lifeIdx;
  simA_lifeRender();
  simA_lifeLog("Stage " + (simA_lifeIdx + 1) + ": " + simA_lifeStageAt(simA_lifeIdx).name + " done at " + simA_lifeStageAt(simA_lifeIdx).time + ". Event: " + simA_lifeStageAt(simA_lifeIdx).event + ". Status: " + simA_lifeStageAt(simA_lifeIdx).status);
  if(simA_lifeIdx === list.length - 1){ simA_lifeStopTimer(); }
}
function simA_lifeStart(){
  if(simA_lifeFailed){ return; }
  var list = simA_lifeStages();
  if(simA_lifeIdx >= list.length - 1 && simA_lifeDone){ return; }
  simA_lifeStopTimer();
  var delay = Math.round(1600 / simA_lifeSpeed);
  simA_lifeTimer = setInterval(simA_lifeAdvance, delay);
  simA_lifeAdvance();
}
function simA_lifePause(){ simA_lifeStopTimer(); simA_lifeLog("Paused at stage " + (simA_lifeIdx + 1) + " of " + simA_lifeStages().length + "."); }
function simA_lifeStep(){ simA_lifeStopTimer(); simA_lifeAdvance(); }
function simA_lifeReset(){
  simA_lifeStopTimer();
  simA_lifeIdx = -1;
  simA_lifeFailed = false;
  simA_lifeDone = false;
  simA_lifeFailure = "none";
  simA_lifeMax = -1;
  var sel = document.getElementById("simA-lifeFailure");
  if(sel) sel.value = "none";
  var box = document.getElementById("simA-lifeFail");
  if(box){ box.style.display = "none"; box.innerHTML = ""; }
  var log = document.getElementById("simA-lifeLog");
  if(log) log.innerHTML = "<li>Payment created. Awaiting start.</li>";
  simA_lifeBuildNodes();
  simA_lifeRender();
}
function simA_lifeSetSpeed(){
  var sel = document.getElementById("simA-lifeSpeed");
  simA_lifeSpeed = sel ? parseFloat(sel.value) || 1 : 1;
  if(simA_lifeTimer){ simA_lifeStopTimer(); simA_lifeTimer = setInterval(simA_lifeAdvance, Math.round(1600 / simA_lifeSpeed)); }
}
function simA_lifeSetFailure(){
  var sel = document.getElementById("simA-lifeFailure");
  simA_lifeFailure = sel ? sel.value : "none";
  simA_lifeFailed = false;
  var box = document.getElementById("simA-lifeFail");
  if(box){ box.style.display = "none"; box.innerHTML = ""; }
}
function simA_lifeSetRail(){
  var sel = document.getElementById("simA-lifeRail");
  simA_lifeRail = sel ? sel.value : "crossborder";
  var note = document.getElementById("simA-lifeRailNote");
  if(note) note.innerHTML = "<h3>Rail: " + (sel ? sel.options[sel.selectedIndex].text : simA_lifeRail) + "</h3><p>" + simA_LIFE_RAIL_NOTES[simA_lifeRail] + "</p>";
  simA_lifeReset();
  if(note) note.innerHTML = "<h3>Rail: " + (sel ? sel.options[sel.selectedIndex].text : simA_lifeRail) + "</h3><p>" + simA_LIFE_RAIL_NOTES[simA_lifeRail] + "</p>";
}
function simA_lifeJump(i){
  var list = simA_lifeStages();
  if(i > simA_lifeMax + 1){
    var panel = document.getElementById("simA-lifePanel");
    if(panel) panel.innerHTML = "<h3>Cannot jump ahead to stage " + (i + 1) + "</h3><p>A payment cannot reach " + simA_LIFE[list[i]].name + " before the earlier stages: it cannot be credited before it is settled, and cannot be settled before it is transmitted and acknowledged. Run the payment in order, or jump only to a stage already reached or the next one.</p>";
    simA_lifeLog("Jump to stage " + (i + 1) + " refused: earlier stages not yet reached.");
    return;
  }
  simA_lifeStopTimer();
  simA_lifeFailed = false;
  var box = document.getElementById("simA-lifeFail");
  if(box){ box.style.display = "none"; box.innerHTML = ""; }
  simA_lifeIdx = i;
  simA_lifeDone = false;
  simA_lifeRender();
  simA_lifeLog("Jumped to stage " + (i + 1) + ": " + simA_lifeStageAt(i).name + ".");
}

/* ===== Cross-border configurator ===== */
var simA_CB_CHARGES = {USD:[20, 22], EUR:[18, 20], GBP:[16, 18]};
var simA_CB_ORIG_FEE = {USD:25, EUR:22, GBP:20};
var simA_CB_CORR = {USD:["Wells Fargo, New York", "Bank of New York Mellon, New York"], EUR:["Deutsche Bank, Frankfurt", "BNP Paribas, Paris"], GBP:["Barclays, London", "HSBC, London"]};
function simA_cbFmt(n, ccy){ return ccy + " " + n.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2}); }
function simA_cbChargeValue(){
  var radios = document.getElementsByName("simA-cbCharge");
  for(var i = 0; i < radios.length; i++){ if(radios[i].checked) return radios[i].value; }
  return "SHA";
}
function simA_cbMethodValue(){
  var radios = document.getElementsByName("simA-cbMethod");
  for(var i = 0; i < radios.length; i++){ if(radios[i].checked) return radios[i].value; }
  return "serial";
}
function simA_cbMethodChange(){
  var method = simA_cbMethodValue();
  var box = document.getElementById("simA-cbCoverFirst");
  if(box) box.disabled = (method !== "cover");
  simA_cbRender();
}
function simA_cbClassic(){
  var amt = document.getElementById("simA-cbAmt"); if(amt) amt.value = "25000";
  var ccy = document.getElementById("simA-cbCcy"); if(ccy) ccy.value = "USD";
  var beneCcy = document.getElementById("simA-cbBeneCcy"); if(beneCcy) beneCcy.value = "USD";
  var fx = document.getElementById("simA-cbFx"); if(fx) fx.value = "1.27";
  var vd = document.getElementById("simA-cbValueDate"); if(vd) vd.value = "2026-11-05";
  var orig = document.getElementById("simA-cbOrig"); if(orig) orig.value = "Meridian Bank London";
  var bene = document.getElementById("simA-cbBene"); if(bene) bene.value = "Harbour Bank Singapore";
  var corr = document.getElementById("simA-cbCorr"); if(corr) corr.value = "2";
  var route = document.getElementById("simA-cbRoute"); if(route) route.value = "newyork";
  var bal1 = document.getElementById("simA-cbBal1"); if(bal1) bal1.value = "500000";
  var bal2 = document.getElementById("simA-cbBal2"); if(bal2) bal2.value = "500000";
  var scr = document.getElementById("simA-cbScreen"); if(scr) scr.value = "clear";
  var coverFirst = document.getElementById("simA-cbCoverFirst"); if(coverFirst) coverFirst.checked = false;
  var radios = document.getElementsByName("simA-cbCharge");
  for(var i = 0; i < radios.length; i++){ radios[i].checked = (radios[i].value === "SHA"); }
  var methods = document.getElementsByName("simA-cbMethod");
  for(var j = 0; j < methods.length; j++){ methods[j].checked = (methods[j].value === "serial"); }
  simA_cbMethodChange();
}
function simA_cbRender(){
  var origEl = document.getElementById("simA-cbOrig");
  var beneEl = document.getElementById("simA-cbBene");
  var ccyEl = document.getElementById("simA-cbCcy");
  var beneCcyEl = document.getElementById("simA-cbBeneCcy");
  var fxEl = document.getElementById("simA-cbFx");
  var amtEl = document.getElementById("simA-cbAmt");
  var corrEl = document.getElementById("simA-cbCorr");
  var routeEl = document.getElementById("simA-cbRoute");
  var coverEl = document.getElementById("simA-cbCoverFirst");
  var vdEl = document.getElementById("simA-cbValueDate");
  var bal1El = document.getElementById("simA-cbBal1");
  var bal2El = document.getElementById("simA-cbBal2");
  var scrEl = document.getElementById("simA-cbScreen");
  if(!origEl || !beneEl || !ccyEl || !amtEl) return;
  var orig = origEl.value, bene = beneEl.value, ccy = ccyEl.value;
  var beneCcy = beneCcyEl ? beneCcyEl.value : ccy;
  var fxRate = fxEl ? parseFloat(fxEl.value) : 1;
  if(!isFinite(fxRate) || fxRate <= 0) fxRate = 1;
  var amount = parseFloat(amtEl.value);
  var chainEl = document.getElementById("simA-cbChain");
  var lanesEl = document.getElementById("simA-cbLanes");
  var orderEl = document.getElementById("simA-cbOrder");
  var fieldsEl = document.getElementById("simA-cbFields");
  var chargesEl = document.getElementById("simA-cbCharges");
  var noteEl = document.getElementById("simA-cbNote");
  function clearAll(){
    if(chainEl) chainEl.innerHTML = "";
    if(lanesEl) lanesEl.innerHTML = "";
    if(orderEl) orderEl.innerHTML = "";
    if(fieldsEl) fieldsEl.innerHTML = "";
    if(chargesEl) chargesEl.innerHTML = "";
  }
  if(!isFinite(amount) || amount <= 0){
    clearAll();
    if(noteEl) noteEl.innerHTML = "<h3>Enter an amount</h3><p>Enter an amount greater than zero to build the payment chain.</p>";
    return;
  }
  var nCorr = corrEl ? parseInt(corrEl.value, 10) : 2;
  var route = routeEl ? routeEl.value : "newyork";
  var method = simA_cbMethodValue();
  var chargeOpt = simA_cbChargeValue();
  var valueDate = vdEl && vdEl.value ? vdEl.value : "2026-11-05";
  var bal1 = bal1El ? parseFloat(bal1El.value) : 500000;
  var bal2 = bal2El ? parseFloat(bal2El.value) : 500000;
  if(!isFinite(bal1) || bal1 < 0) bal1 = 0;
  if(!isFinite(bal2) || bal2 < 0) bal2 = 0;
  var screening = scrEl ? scrEl.value : "clear";
  var fxApplied = (beneCcy !== ccy);
  /* FX: the instructed amount is in the debtor currency; conversion to the
     beneficiary currency happens at the originator at the illustrative rate.
     Same-currency payments have no conversion, no rate and no field 36. */
  var chainAmt = fxApplied ? amount * fxRate : amount;
  var charges = simA_CB_CHARGES[beneCcy] || simA_CB_CHARGES.USD;
  var origFee = simA_CB_ORIG_FEE[ccy] || 25;
  var origFeeBene = fxApplied ? origFee * fxRate : origFee;
  var corrNames = simA_CB_CORR[beneCcy] || simA_CB_CORR.USD;
  var isOnUs = (orig === bene);
  var c1 = (isOnUs || route === "nostro") ? 0 : charges[0];
  var c2 = (isOnUs || route === "nostro" || nCorr < 2) ? 0 : charges[1];
  /* Charge-bearer maths, in the beneficiary currency for the chain.
     32A = 33B + 71G - 71F. OUR: 71F none, 71G = correspondent charges prepaid,
     so the running amount is never reduced. SHA: 71F = correspondent charges
     deducted in transit. BEN: 71F = originator fee (as a sender charge) plus
     correspondent charges. The chain running total always equals the
     beneficiary receipt. Debtor total is in the instructed currency. */
  var f71 = 0, g71 = 0, delivered, debtorPays;
  if(chargeOpt === "OUR"){
    delivered = chainAmt;
    g71 = c1 + c2;
    debtorPays = amount + origFee + (fxApplied ? (c1 + c2) / fxRate : (c1 + c2));
  } else if(chargeOpt === "BEN"){
    f71 = origFeeBene + c1 + c2;
    delivered = chainAmt - f71;
    debtorPays = amount;
  } else {
    f71 = c1 + c2;
    delivered = chainAmt - f71;
    debtorPays = amount + origFee;
  }
  if(delivered < 0) delivered = 0;
  var chrgBr = chargeOpt === "OUR" ? "DEBT" : (chargeOpt === "BEN" ? "CRED" : "SHAR");
  var interbank32A = chainAmt + g71 - f71;
  function simA_box(title, sub, amtText){
    return "<div class='simA-box'><b>" + title + "</b>" + sub + (amtText ? "<br><span class='simA-amt'>" + amtText + "</span>" : "") + "</div>";
  }
  var arrow = "<div class='simA-arrow'>&rarr;</div>";
  /* Nostro sufficiency and screening are checked before any credit. */
  var nostroFail = "";
  if(!isOnUs && route !== "nostro" && chainAmt > bal1) nostroFail = "Correspondent 1 (" + corrNames[0] + ") nostro balance " + simA_cbFmt(bal1, beneCcy) + " is less than the settlement amount " + simA_cbFmt(chainAmt, beneCcy) + ".";
  else if(!isOnUs && route !== "nostro" && nCorr >= 2 && (chainAmt - (chargeOpt === "OUR" ? 0 : c1)) > bal2) nostroFail = "Correspondent 2 (" + corrNames[1] + ") nostro balance " + simA_cbFmt(bal2, beneCcy) + " is less than the amount reaching it.";
  var held = (screening === "hold") || nostroFail !== "";
  var chainHtml = "";
  if(isOnUs){
    chainHtml = "<div class='simA-chain'>"
      + simA_box(orig + " (Debtor Agent and Creditor Agent)", "On-us payment: the same bank holds both accounts, so this is an internal book transfer. No correspondent, no SWIFT interbank message, no interbank settlement.", simA_cbFmt(amount, ccy) + " debited, " + simA_cbFmt(delivered, ccy) + " credited")
      + "</div>";
  } else if(method === "cover" && route !== "nostro"){
    /* Cover: two separate lanes, each with its own amounts (B-07, B-08, B-19). */
    var runA = chainAmt;
    var fundsHtml = "<div class='simA-chain'>";
    fundsHtml += simA_box(orig + " (Debtor Agent)", "Cover lane, instructing agent. Sends the pacs.009 COV cover.", simA_cbFmt(runA, beneCcy) + " out");
    var out1 = (chargeOpt === "OUR") ? runA : runA - c1;
    fundsHtml += arrow + simA_box(corrNames[0] + " (Intermediary Agent 1)", "Cover lane, instructed agent. " + (chargeOpt === "OUR" ? "No deduction: charges are prepaid under OUR (71G)." : "Deducts its 71F charge of " + simA_cbFmt(c1, beneCcy) + "."), simA_cbFmt(runA, beneCcy) + " in, " + simA_cbFmt(out1, beneCcy) + " out");
    runA = out1;
    if(nCorr >= 2){
      var out2 = (chargeOpt === "OUR") ? runA : runA - c2;
      fundsHtml += arrow + simA_box(corrNames[1] + " (Intermediary Agent 2)", "Cover lane, instructed agent. " + (chargeOpt === "OUR" ? "No deduction: charges are prepaid under OUR (71G)." : "Deducts its 71F charge of " + simA_cbFmt(c2, beneCcy) + "."), simA_cbFmt(runA, beneCcy) + " in, " + simA_cbFmt(out2, beneCcy) + " out");
      runA = out2;
    }
    if(chargeOpt === "BEN"){
      fundsHtml += arrow + simA_box(bene + " (Creditor Agent)", "Cover lane. Originator fee carried as a 71F sender charge of " + simA_cbFmt(origFeeBene, beneCcy) + " is deducted here.", simA_cbFmt(runA, beneCcy) + " in, " + simA_cbFmt(delivered, beneCcy) + " received");
    } else {
      fundsHtml += arrow + simA_box(bene + " (Creditor Agent)", "Cover lane. Receives the cover funds.", simA_cbFmt(delivered, beneCcy) + " received");
    }
    fundsHtml += "</div>";
    chainHtml = "<div class='simA-lane'><h3>Announcement lane: pacs.008 (legacy MT103), no funds</h3><p>" + orig + " (Debtor Agent) sends the customer payment directly to " + bene + " (Creditor Agent) for " + simA_cbFmt(amount, ccy) + " instructed. It carries the debtor, creditor, remittance information and charges " + chargeOpt + ", and the UETR shared with the cover.</p></div>"
      + "<div class='simA-lane'><h3>Funds lane: pacs.009 COV (legacy MT202 COV), the funds</h3></div>" + fundsHtml;
  } else {
    chainHtml = "<div class='simA-chain'>";
    var run = chainAmt;
    var origOut = (chargeOpt === "BEN") ? run - origFeeBene : run;
    chainHtml += simA_box(orig + " (Debtor Agent)", "Originating bank. Sends the payment instruction." + (chargeOpt === "BEN" ? " Originator fee of " + simA_cbFmt(origFeeBene, beneCcy) + " is carried as a 71F sender charge." : ""), simA_cbFmt(run, beneCcy) + " in, " + simA_cbFmt(origOut, beneCcy) + " out");
    run = origOut;
    if(route === "nostro"){
      chainHtml += arrow + simA_box(bene + " (Creditor Agent)", "Beneficiary bank. Direct nostro account: " + orig + " holds a nostro with " + bene + ", so no intermediary bank is involved.", simA_cbFmt(delivered, beneCcy) + " received");
    } else {
      var outC1 = (chargeOpt === "OUR") ? run : run - c1;
      chainHtml += arrow + simA_box(corrNames[0] + " (Intermediary Agent 1)", "Correspondent 1. " + (chargeOpt === "OUR" ? "No deduction: charges are prepaid under OUR (71G)." : "Deducts its 71F charge of " + simA_cbFmt(c1, beneCcy) + " and passes the payment on."), simA_cbFmt(run, beneCcy) + " in, " + simA_cbFmt(outC1, beneCcy) + " out");
      run = outC1;
      if(nCorr >= 2){
        var outC2 = (chargeOpt === "OUR") ? run : run - c2;
        chainHtml += arrow + simA_box(corrNames[1] + " (Intermediary Agent 2)", "Correspondent 2. " + (chargeOpt === "OUR" ? "No deduction: charges are prepaid under OUR (71G)." : "Deducts its 71F charge of " + simA_cbFmt(c2, beneCcy) + " and passes the payment on."), simA_cbFmt(run, beneCcy) + " in, " + simA_cbFmt(outC2, beneCcy) + " out");
        run = outC2;
      }
      if(route === "chips"){
        chainHtml += arrow + simA_box("CHIPS / Fedwire", "US interbank settlement between the correspondents. No separate charge is deducted here.", simA_cbFmt(run, beneCcy) + " settled");
      }
      chainHtml += arrow + simA_box(bene + " (Creditor Agent)", "Beneficiary bank. Credits the beneficiary account.", held ? "Held, not credited" : simA_cbFmt(delivered, beneCcy) + " received");
    }
    chainHtml += "</div>";
  }
  if(held){
    var holdText = nostroFail !== "" ? nostroFail + " Settlement cannot proceed: the nostro must be funded or the payment rerouted. A pre-settlement rejection is a pacs.002 RJCT with a reason code; a return of settled funds would be a pacs.004." : "Sanctions hold at Correspondent 1: every agent in the chain screens the payment, and the cover method exists in its current form so every bank in the cover chain can screen the underlying customer data (pacs.009 COV CoverDetails). No funds move while the payment is held. If the match is confirmed, the outcome depends on the regime; no specific freeze or report rule is stated here.";
    chainHtml += "<div class='simA-fail'><h3>Payment held, nothing credited</h3><p>" + holdText + "</p></div>";
  }
  if(chainEl) chainEl.innerHTML = chainHtml;
  var lanesHtml = "";
  var orderHtml = "";
  if(isOnUs){
    lanesHtml = "<div class='simA-lane'><h3>On-us: one bank, one internal transfer</h3><p>Debtor and creditor accounts are at the same bank, so there is no correspondent chain, no interbank message and no interbank settlement. The bank debits one account and credits the other internally.</p></div>";
  } else if(method === "cover"){
    var coverFirst = coverEl ? coverEl.checked : false;
    lanesHtml = "<div class='simA-lane'><h3>Customer payment message lane: pacs.008 announcement (legacy MT103)</h3>"
      + "<p>The announcement travels directly from " + orig + " to " + bene + ". It tells the beneficiary bank that a payment is coming, but it carries no funds. The announcement carries the instructed amount " + simA_cbFmt(amount, ccy) + ".</p>"
      + "<p>Message: pacs.008 for " + simA_cbFmt(amount, ccy) + ", with debtor, creditor, remittance information and charges " + chargeOpt + " (ChrgBr " + chrgBr + ").</p></div>"
      + "<div class='simA-lane'><h3>Funds movement lane: pacs.009 COV cover (legacy MT202 COV)</h3>"
      + "<p>The cover is a separate bank-to-bank settlement instruction, not the customer payment. It moves the funds through the correspondent chain, each hop carrying its own interbank settlement amount reduced by that hop deduction, as shown in the funds lane above. The cover and the announcement carry the same UETR, and the cover carries a related reference linking it to the announcement.</p>"
      + "<p>Message: pacs.009 COV, per-hop amounts as shown above, ending at " + simA_cbFmt(delivered, beneCcy) + ".</p></div>";
    if(coverFirst){
      orderHtml = "<div class='simA-panel'><h3>Arrival order</h3><p>1. The cover (pacs.009 COV) arrives first, with the funds.</p><p>2. The announcement (pacs.008) arrives second, with the customer payment details.</p><p>The beneficiary bank matches the cover to the announcement by the UETR and the related reference before it credits the beneficiary. If the two never match, the funds are held, investigated and returned. A bank may credit on the announcement alone before the cover arrives, but that is a bank discretion and risk decision, not a scheme rule.</p></div>";
    } else {
      orderHtml = "<div class='simA-panel'><h3>Arrival order</h3><p>1. The announcement (pacs.008) arrives first, with the customer payment details.</p><p>2. The cover (pacs.009 COV) arrives second, with the funds.</p><p>The beneficiary bank matches the announcement to the cover by the UETR and the related reference before it credits the beneficiary. If the two never match, the funds are held, investigated and returned. A bank may credit on the announcement alone before the cover arrives, but that is a bank discretion and risk decision, not a scheme rule.</p></div>";
    }
  } else {
    lanesHtml = "<div class='simA-lane'><h3>Serial method: one message, one chain</h3>"
      + "<p>A single pacs.008 (legacy MT103) travels hop by hop: " + orig + " to " + (route === "nostro" ? bene : corrNames[0] + (nCorr >= 2 ? " to " + corrNames[1] : "") + " to " + bene) + ". SWIFT is messaging only: the money moves as nostro/vostro debits and credits instructed by the message at each hop. Each hop validates, screens and acknowledges the payment, and each hop may deduct charges.</p></div>";
    orderHtml = "";
  }
  if(lanesEl) lanesEl.innerHTML = lanesHtml;
  if(orderEl) orderEl.innerHTML = orderHtml;
  /* Message-fields panel: MT103 fields and the pacs.008 mapping, with C14/C15. */
  var fieldsHtml = "<table class='simA-table'><tr><th>Message field</th><th>Value</th><th>Meaning</th></tr>";
  fieldsHtml += "<tr><td>71A Details of Charges</td><td>" + chargeOpt + "</td><td>Charge bearer. OUR forbids 71F and allows 71G (C14); SHA allows 71F and forbids 71G (C14); BEN requires at least one 71F and forbids 71G (C14).</td></tr>";
  fieldsHtml += "<tr><td>71F Sender charges</td><td>" + (f71 > 0 ? simA_cbFmt(f71, beneCcy) : "None") + "</td><td>Charges deducted from the amount in transit. Field 71F, not 71G, records chain deductions under SHA and BEN.</td></tr>";
  fieldsHtml += "<tr><td>71G Receiver charges</td><td>" + (g71 > 0 ? simA_cbFmt(g71, beneCcy) : "None") + "</td><td>Receiver charges, prepaid under OUR only. Included in the interbank settled amount.</td></tr>";
  fieldsHtml += "<tr><td>33B Currency / Instructed Amount</td><td>" + simA_cbFmt(amount, ccy) + "</td><td>Instructed amount. 33B is mandatory when 71F or 71G is present (C15).</td></tr>";
  fieldsHtml += "<tr><td>32A Value Date / Currency / Interbank Settled Amount</td><td>" + valueDate + ", " + simA_cbFmt(interbank32A, beneCcy) + "</td><td>Interbank settled amount at the final hop. Formula: 33B + 71G - 71F = 32A.</td></tr>";
  fieldsHtml += "<tr><td>36 Exchange Rate</td><td>" + (fxApplied ? fxRate.toFixed(4) + " " + beneCcy + " per 1 " + ccy : "Not applicable: same currency, no conversion") + "</td><td>Field 36 is mandatory when the 32A and 33B currencies differ. FX is not simulated beyond this illustrative rate: no live rate, no spread and no converted-amount rounding beyond the rate shown.</td></tr>";
  fieldsHtml += "<tr><td>pacs.008 ChrgBr / ChrgsInf / InstdAmt / IntrBkSttlmAmt / XchgRate</td><td>" + chrgBr + " / " + (f71 > 0 || g71 > 0 ? "charges as in 71F/71G above" : "no charges") + " / " + simA_cbFmt(amount, ccy) + " / " + simA_cbFmt(interbank32A, beneCcy) + " / " + (fxApplied ? fxRate.toFixed(4) : "not applicable") + "</td><td>pacs.008 equivalents of 71A, 71F/71G, 33B, 32A and field 36.</td></tr></table>";
  fieldsHtml += "<p>C14/C15 check for this option: " + (chargeOpt === "OUR" ? "OUR, no 71F present, 71G present, 33B present: valid." : (chargeOpt === "SHA" ? "SHA, 71F present, no 71G, 33B present: valid." : "BEN, at least one 71F present, no 71G, 33B present: valid.")) + "</p>";
  if(fieldsEl) fieldsEl.innerHTML = fieldsHtml;
  var chargesHtml = "<table class='simA-table'><tr><th>Item</th><th>Amount</th><th>Paid by</th></tr>";
  chargesHtml += "<tr><td>Customer payment amount, instructed (33B / InstdAmt)</td><td>" + simA_cbFmt(amount, ccy) + "</td><td>Debtor</td></tr>";
  if(fxApplied){
    chargesHtml += "<tr><td>FX conversion amount at illustrative rate " + fxRate.toFixed(4) + "</td><td>" + simA_cbFmt(chainAmt, beneCcy) + "</td><td>Converted at the originator; rate is illustrative, not a live rate</td></tr>";
  } else {
    chargesHtml += "<tr><td>FX conversion amount</td><td>None: same currency, no conversion</td><td></td></tr>";
  }
  chargesHtml += "<tr><td>Originator fee (71F sender charge under BEN only)</td><td>" + simA_cbFmt(origFee, ccy) + "</td><td>" + (chargeOpt === "BEN" ? "Beneficiary, deducted as 71F" : "Debtor, on top") + "</td></tr>";
  if(!isOnUs && route !== "nostro"){
    chargesHtml += "<tr><td>Correspondent 1 charge, " + corrNames[0] + " (71F under SHA/BEN, 71G prepaid under OUR)</td><td>" + simA_cbFmt(c1, beneCcy) + "</td><td>" + (chargeOpt === "OUR" ? "Debtor, prepaid on top" : "Deducted in transit") + "</td></tr>";
    chargesHtml += "<tr><td>Correspondent 1 nostro balance before / after</td><td>" + simA_cbFmt(bal1, beneCcy) + " / " + simA_cbFmt(bal1 - chainAmt, beneCcy) + "</td><td>Illustrative balance</td></tr>";
    if(nCorr >= 2){
      chargesHtml += "<tr><td>Correspondent 2 charge, " + corrNames[1] + " (71F under SHA/BEN, 71G prepaid under OUR)</td><td>" + simA_cbFmt(c2, beneCcy) + "</td><td>" + (chargeOpt === "OUR" ? "Debtor, prepaid on top" : "Deducted in transit") + "</td></tr>";
      chargesHtml += "<tr><td>Correspondent 2 nostro balance before / after</td><td>" + simA_cbFmt(bal2, beneCcy) + " / " + simA_cbFmt(bal2 - (chainAmt - (chargeOpt === "OUR" ? 0 : c1)), beneCcy) + "</td><td>Illustrative balance</td></tr>";
    }
  }
  chargesHtml += "<tr><td>Interbank settlement amount, final hop (32A / IntrBkSttlmAmt)</td><td>" + simA_cbFmt(interbank32A, beneCcy) + "</td><td></td></tr>";
  chargesHtml += "<tr><td><b>Beneficiary bank receives</b></td><td><b>" + simA_cbFmt(delivered, beneCcy) + "</b></td><td></td></tr>";
  chargesHtml += "<tr><td><b>Amount credited to the beneficiary account</b></td><td><b>" + (held ? "Held, not credited" : simA_cbFmt(delivered, beneCcy)) + "</b></td><td>Beneficiary bank own fee excluded from this simplified model</td></tr>";
  chargesHtml += "<tr><td><b>Debtor pays in total</b></td><td><b>" + simA_cbFmt(debtorPays, ccy) + "</b></td><td></td></tr></table>";
  if(chargesEl) chargesEl.innerHTML = chargesHtml;
  if(noteEl){
    var noteText;
    if(chargeOpt === "OUR"){
      noteText = "OUR (ChrgBr DEBT): the debtor pays all charges. The beneficiary receives the full amount, and correspondent charges are prepaid by the debtor and included in the interbank settled amount as 71G, not deducted from the amount in transit.";
    } else if(chargeOpt === "BEN"){
      noteText = "BEN (ChrgBr CRED): the beneficiary bears all charges. The originator fee is carried as a 71F sender charge and every correspondent charge is deducted as 71F, so the beneficiary receives less.";
    } else {
      noteText = "SHA (ChrgBr SHAR): each party pays its own charges. The debtor pays the originator fee on top, and each correspondent deducts its charge (71F) from the amount in transit. The beneficiary bank own fee, which the beneficiary also bears, is excluded from this simplified model.";
    }
    var vdNote = " Value date " + valueDate + ": settlement is same day only if the instruction meets the US correspondent cut-off and the value date is a business day in London, New York and Singapore. The exact cut-off time is scheme- and bank-specific and is not stated here.";
    var routeNote = "";
    if(isOnUs) routeNote = " On-us: no correspondent charges apply.";
    else if(route === "nostro") routeNote = " Direct nostro settlement: " + orig + " holds a nostro with " + bene + ", so no correspondent charges apply. Under SHA and OUR the beneficiary bank receives the full amount on the interbank leg; under BEN the receipt is the amount minus the originator fee carried as 71F. The originator fee still applies under SHA and OUR, paid by the debtor on top.";
    else if(route === "chips") routeNote = " CHIPS / Fedwire settlement between the US correspondents: USD interbank settlement runs through CHIPS or Fedwire, not through a regional clearing hub. No regional clearing hub is modelled here because no such mechanism is defined for a USD London to Singapore payment.";
    noteEl.innerHTML = "<h3>What this means</h3><p>" + noteText + vdNote + routeNote + "</p><p>Method: " + (method === "cover" ? "cover, so the announcement and the funds travel separately and must be matched by UETR and related reference." : "serial, so one pacs.008 travels hop by hop, instructing a nostro/vostro debit and credit at each hop.") + "</p><p>Screening: every agent in the chain screens the payment. A pre-settlement rejection is a pacs.002 RJCT with a reason code; a return of settled funds is a pacs.004.</p>";
  }
}

/* ===== T2 and TIPS simulator ===== */
var simA_tipsTimer = null;
var simA_tipsRunning = false;
var simA_TIPS_PARTS = [
["direct", "Participant (holds its own TIPS DCA)"],
["reachable", "Reachable Party (no TIPS DCA of its own)"],
["ancillary", "Ancillary System"],
["instructing", "Instructing Party (instructs on behalf of a participant or reachable party)"]
];
var simA_T2_PARTS = [
["direct", "Direct participant (holds its own RTGS DCA)"],
["multi", "Multi-addressee access"],
["addressable", "Addressable BIC holder"]
];
function simA_tipsFmt(n){ return "EUR " + n.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2}); }
function simA_tipsSetState(text){
  var el = document.getElementById("simA-tipsState");
  if(el) el.textContent = text;
}
function simA_tipsPartChange(){
  var sysEl = document.getElementById("simA-tipsSystem");
  var partEl = document.getElementById("simA-tipsPart");
  var noteEl = document.getElementById("simA-tipsPartNote");
  if(!sysEl || !partEl || !noteEl) return;
  var sys = sysEl.value;
  var prevPart = partEl.value;
  var parts = sys === "TIPS" ? simA_TIPS_PARTS : simA_T2_PARTS;
  partEl.innerHTML = "";
  for(var i = 0; i < parts.length; i++){
    var opt = document.createElement("option");
    opt.value = parts[i][0];
    opt.textContent = parts[i][1];
    partEl.appendChild(opt);
  }
  var keep = false;
  for(var j = 0; j < parts.length; j++){ if(parts[j][0] === prevPart) keep = true; }
  partEl.value = keep ? prevPart : parts[0][0];
  var part = partEl.value;
  var payeeRow = document.getElementById("simA-tipsPayeeRow");
  var t2Row = document.getElementById("simA-tipsT2Row");
  var cmbRow = document.getElementById("simA-tipsCmbRow");
  if(payeeRow) payeeRow.style.display = (sys === "TIPS") ? "" : "none";
  if(t2Row) t2Row.style.display = (sys === "T2") ? "" : "none";
  if(cmbRow) cmbRow.style.display = (sys === "TIPS" && part === "reachable") ? "" : "none";
  var text = "";
  if(sys === "TIPS"){
    text = "TIPS settles instant payments in central bank money, around the clock (24/7/365), primarily SCT Inst. The payment instruction is pacs.008.001.08 and the status report is pacs.002.001.10. Funds are reserved on the payer TIPS DCA while the payee bank decides. The SCT Inst scheme maximum execution timeline is 10 seconds end to end (5-7-9 second sub-timelines); the TIPS beneficiary-reply timeout is a separate, configurable TIPS system parameter. ";
  } else {
    text = "T2 RTGS settles euro payments one by one, in real time gross settlement, in central bank money, typically large-value and interbank payments; there is no minimum value. The payment instruction is pacs.008.001.08 (the customer credit transfer; bank-to-bank T2 payments use pacs.009). A payment with enough liquidity settles at entry disposition without entering the queue. RTGS runs 02:30 to 18:00 CET on TARGET business days, customer cut-off 17:00 CET, interbank cut-off 18:00 CET. Every RTGS DCA holder must hold at least one main cash account in CLM. There is no beneficiary-PSP accept/reject reply step and no 10-second payee deadline in T2. ";
  }
  if(sys === "TIPS"){
    if(part === "direct"){
      text += "Participant: the bank holds its own TIPS DCA and settles in its own name.";
    } else if(part === "reachable"){
      text += "Reachable Party: an entity holding a BIC, designated by a TIPS DCA holder, addressable through the TIPS platform. It holds no TIPS DCA and settles on the participant TIPS DCA, subject to its Credit Memorandum Balance (CMB): a limit set by the DCA holder for that reachable party use of the account liquidity. It may instruct directly to the platform if authorised by the DCA holder, or act through an instructing party. Example direct participant: Meridian Bank Frankfurt.";
    } else if(part === "ancillary"){
      text += "Ancillary System: a system (for example a clearing system) that settles in TIPS through its technical account, under its own access arrangement.";
    } else {
      text += "Instructing Party: instructs on behalf of a participant or reachable party and holds no account of its own.";
    }
  } else {
    if(part === "direct"){
      text += "Direct participant: the bank holds its own RTGS DCA and settles in its own name. Direct participation is for institutions established in the EEA; a London bank participates via its EEA entity or as a correspondent. Example: Meridian Bank Frankfurt.";
    } else if(part === "multi"){
      text += "Multi-addressee access: branches or subsidiaries channel payments through the direct participant RTGS DCA, in some cases without the direct participant involvement.";
    } else {
      text += "Addressable BIC holder: an indirectly connected party, addressable in T2 through a direct participant BIC. It holds no RTGS DCA of its own.";
    }
  }
  noteEl.innerHTML = "<p>" + text + "</p>";
}
function simA_tipsReset(){
  if(simA_tipsTimer){ clearTimeout(simA_tipsTimer); simA_tipsTimer = null; }
  simA_tipsRunning = false;
  simA_tipsSetState("Not started");
  var steps = document.getElementById("simA-tipsSteps");
  if(steps) steps.innerHTML = "";
  var res = document.getElementById("simA-tipsResult");
  if(res) res.innerHTML = "<p>Press Run payment to step through the flow for the selected system.</p>";
}
function simA_tipsRun(){
  if(simA_tipsRunning) return;
  var sysEl = document.getElementById("simA-tipsSystem");
  var partEl = document.getElementById("simA-tipsPart");
  var liqEl = document.getElementById("simA-tipsLiq");
  var amtEl = document.getElementById("simA-tipsAmt");
  var payeeEl = document.getElementById("simA-tipsPayee");
  var cmbEl = document.getElementById("simA-tipsCmb");
  var prioEl = document.getElementById("simA-tipsPrio");
  var timedEl = document.getElementById("simA-tipsTimed");
  var res = document.getElementById("simA-tipsResult");
  if(!sysEl || !partEl || !liqEl || !amtEl) return;
  var sys = sysEl.value, part = partEl.value;
  var payee = payeeEl ? payeeEl.value : "accept";
  var liq = parseFloat(liqEl.value);
  var amt = parseFloat(amtEl.value);
  var cmb = cmbEl ? parseFloat(cmbEl.value) : 0;
  if(!isFinite(cmb) || cmb < 0) cmb = 0;
  var prio = prioEl ? prioEl.value : "normal";
  var timed = timedEl ? timedEl.value : "none";
  var stepsEl = document.getElementById("simA-tipsSteps");
  if(stepsEl) stepsEl.innerHTML = "";
  /* Immediate feedback on the first click: the run takes several seconds
     (one step every 900ms), so say so at once and disable the button
     while it runs, or the learner thinks nothing happened. */
  simA_tipsSetState("Running...");
  if(res) res.innerHTML = "<p><b>Running...</b> The payment is moving through the flow. Steps appear below as they complete.</p>";
  var runBtn = document.getElementById("simA-tipsRunBtn");
  if(runBtn) runBtn.disabled = true;
  if(!isFinite(amt) || amt <= 0){
    simA_tipsSetState("Failed (TIPS internal transaction status)");
    if(res) res.innerHTML = "<h3>Payment failed at validation</h3><p>The payment amount must be greater than zero. No instruction was sent, no funds moved, and no reservation was made.</p>";
    if(runBtn) runBtn.disabled = false;
    return;
  }
  if(!isFinite(liq) || liq < 0){
    simA_tipsSetState("Failed (TIPS internal transaction status)");
    if(res) res.innerHTML = "<h3>Payment failed at validation</h3><p>The liquidity amount must be zero or more. No instruction was sent and no funds moved.</p>";
    if(runBtn) runBtn.disabled = false;
    return;
  }
  var via = sys === "TIPS"
    ? (part === "direct" ? "Meridian Bank Frankfurt, participant" : (part === "reachable" ? "reachable party, settling on the participant TIPS DCA of Meridian Bank Frankfurt" : (part === "ancillary" ? "ancillary system" : "instructing party, on behalf of a participant")))
    : (part === "direct" ? "Meridian Bank Frankfurt, direct participant" : (part === "multi" ? "multi-addressee access, through the direct participant RTGS DCA" : "addressable BIC holder, through a direct participant"));
  var msg = "pacs.008.001.08";
  var steps = [];
  var enough = liq >= amt;
  if(sys === "TIPS"){
    steps.push({state:"Received (TIPS internal transaction status)", title:"1. Submission", detail:"The payer bank sends " + msg + " for " + simA_tipsFmt(amt) + " to TIPS. Submitted by " + via + ". TIPS records the payment as Received."});
    steps.push({state:"Validated (TIPS internal transaction status)", title:"2. Validation", detail:"TIPS checks the message format, the references, the participant details and the currency. Everything passes, so the payment becomes Validated. A validation failure is reported to the originator participant by pacs.002 with an error code, and is a different failure point from a reservation failure."});
    if(part === "reachable" && amt > cmb){
      steps.push({state:"Failed (TIPS internal transaction status)", title:"3. Reservation fails: CMB headroom insufficient", detail:"The reachable party Credit Memorandum Balance limit is " + simA_tipsFmt(cmb) + " but the payment needs " + simA_tipsFmt(amt) + ", a shortfall of " + simA_tipsFmt(amt - cmb) + ". The payer TIPS DCA itself holds " + simA_tipsFmt(liq) + ", but the reachable party can only use liquidity up to its CMB headroom, so the payment fails. TIPS sends a pacs.002 to the originator participant reporting the rejection with an error code. No funds move.", bad:true});
    } else if(!enough){
      steps.push({state:"Failed (TIPS internal transaction status)", title:"3. Reservation fails: insufficient liquidity", detail:"The payer TIPS DCA holds " + simA_tipsFmt(liq) + " but the payment needs " + simA_tipsFmt(amt) + ", a shortfall of " + simA_tipsFmt(amt - liq) + ". TIPS cannot reserve funds it does not hold, so the payment fails. TIPS sends a pacs.002 to the originator participant reporting the rejection with an error code. No funds move, the reservation is never made, and the payer bank must fund its TIPS DCA before it tries again.", bad:true});
    } else {
      steps.push({state:"Reserved (TIPS internal transaction status)", title:"3. Reservation", detail:simA_tipsFmt(amt) + " is reserved on the payer TIPS DCA. The money is set aside and cannot be used for another payment while this one is in flight. The payment is forwarded to the payee bank."});
      if(payee === "reject-ac04" || payee === "reject-ac01"){
        var code = payee === "reject-ac04" ? "AC04 (closed account)" : "AC01 (incorrect account number)";
        steps.push({state:"Rejected (TIPS internal transaction status)", title:"4. Payee rejects", detail:"The payee bank sends pacs.002.001.10 with RJCT and mandatory reason code " + code + ". A reason code is mandatory on RJCT. TIPS releases the reservation of " + simA_tipsFmt(amt) + " back to the payer TIPS DCA. No funds move and the payment is closed as Rejected.", bad:true});
      } else if(payee === "noreply"){
        steps.push({state:"Expired (TIPS internal transaction status)", title:"4. Payee does not reply in time", detail:"The beneficiary reply timeout expires with no answer from the payee bank. Two pacs.002 messages are sent: one to the originator PSP with reason AB05 (time-out creditor agent) or AB06 (time-out instructed agent), and one to the beneficiary PSP with reason TM01. The SCT Inst scheme maximum is 10 seconds end to end (5-7-9 second sub-timelines); the TIPS beneficiary-reply timeout is a separate, configurable TIPS system parameter, and its value is not stated here. TIPS releases the reservation of " + simA_tipsFmt(amt) + " back to the payer TIPS DCA. No funds move and the payment is closed as Expired. The originator PSP can investigate with pacs.028 (Payment Status Request), answered by pacs.002.", bad:true});
      } else {
        steps.push({state:"Settled (TIPS internal transaction status)", title:"4. Settlement", detail:"The payee bank accepts with pacs.002.001.10 carrying ACCP. TIPS debits the reserved " + simA_tipsFmt(amt) + " from the payer TIPS DCA and credits the payee PSP TIPS DCA in central bank money. Settlement is final and irrevocable in central bank money under the TARGET rules (Settlement Finality Directive 98/26/EC)."});
        steps.push({state:"Settled (TIPS internal transaction status)", title:"5. Confirmation", detail:"TIPS sends pacs.002.001.10 with ACCP to both the originator participant and the beneficiary participant as the settlement confirmation. This is interbank settlement only: the beneficiary PSP must then credit the beneficiary own account, within the SCT Inst 10-second maximum from receipt of the payment order, and the payer PSP informs the payer that the payment executed."});
        steps.push({state:"Settled (TIPS internal transaction status)", title:"6. Beneficiary posting", detail:"The beneficiary PSP credits the beneficiary own account with " + simA_tipsFmt(amt) + ". Payer TIPS DCA balance after settlement: " + simA_tipsFmt(liq - amt) + ". A settled customer payment can still be returned later by pacs.004, for example on a recall (camt.056)."});
      }
    }
  } else {
    steps.push({state:"Validated (simulator outcome label, not an official T2 status sequence)", title:"1. Submission and validation", detail:"The payer bank sends " + msg + " for " + simA_tipsFmt(amt) + " to T2 RTGS. Submitted by " + via + ". T2 checks the message format, references, participant details and currency. Priority: " + prio + ". T2 has no Reserved or Expired state and no published universal status sequence like TIPS."});
    if(!enough){
      steps.push({state:"Queued (simulator outcome label)", title:"2. Entry disposition: queued", detail:"Liquidity is not sufficient, so the payment cannot settle at entry disposition and is queued. The payer RTGS account holds " + simA_tipsFmt(liq) + " but the payment needs " + simA_tipsFmt(amt) + ", a shortfall of " + simA_tipsFmt(amt - liq) + ". While queued it is subject to offsetting checks and optimisation algorithms, and the participant can amend its priority or queue position, revoke it, or fund the account."});
      var rejectAt = timed === "reject" ? "its RejectTime of 16:00 CET" : (timed === "till" ? "the interbank cut-off of 18:00 CET (a TillTime of 17:30 CET keeps it queued instead of rejecting it at that time)" : "the applicable cut-off: customer payments 17:00 CET, interbank payments 18:00 CET");
      steps.push({state:"Rejected (simulator outcome label)", title:"3. Rejected at the cut-off", detail:"No liquidity arrives before " + rejectAt + ", so T2 rejects the queued payment. There is no undefined queue resolves event: rejection happens at the cut-off or RejectTime, after the last optimisation algorithm has run. T2 sends a pacs.002 with RJCT, which is mandatory on rejection; positive pacs.002 reporting is optional and agreed bilaterally. No funds move. The payer bank must fund its RTGS account and send a new payment. In live T2 a queued payment can still settle if liquidity arrives in time, but here none arrived.", bad:true});
    } else {
      steps.push({state:"Settled (simulator outcome label)", title:"2. Entry disposition: settled at once", detail:"Liquidity is sufficient, so the payment settles at entry disposition and is not queued. Queueing is what happens when settlement is not possible. FIFO by-passing and offsetting rules apply: a payment settles only if no higher-priority payment is queued on the same account to be debited, subject to the offsetting exception."});
      steps.push({state:"Settled (simulator outcome label)", title:"3. Settlement", detail:"T2 debits " + simA_tipsFmt(amt) + " from the payer RTGS Dedicated Cash Account and credits the payee PSP RTGS Dedicated Cash Account, in full, in real time, in central bank money. Settlement is final and irrevocable under the TARGET rules (Settlement Finality Directive 98/26/EC)."});
      steps.push({state:"Settled (simulator outcome label)", title:"4. Confirmation and beneficiary posting", detail:"Positive pacs.002 reporting is optional and agreed bilaterally in T2, so no routine pacs.002 Settled confirmation is shown: there is no ISO 20022 pacs.002 status code Settled. This is interbank settlement only: the beneficiary PSP must then credit the beneficiary own account, and the payer PSP informs the payer that the payment executed. Payer RTGS account balance after settlement: " + simA_tipsFmt(liq - amt) + ". A settled customer payment can still be returned later by pacs.004."});
    }
  }
  simA_tipsRunning = true;
  var i = 0;
  function simA_tipsShowNext(){
    if(i >= steps.length){
      simA_tipsRunning = false;
      var runBtn = document.getElementById("simA-tipsRunBtn");
      if(runBtn) runBtn.disabled = false;
      var last = steps[steps.length - 1];
      simA_tipsSetState(last.state);
      if(res){
        if(last.bad){
          res.innerHTML = "<h3>Payment " + last.state + "</h3><p>" + last.detail + "</p>";
        } else {
          res.innerHTML = "<h3>Payment Settled</h3><p>The payment of " + simA_tipsFmt(amt) + " settled in " + sys + " (interbank settlement in central bank money). Payer account balance after settlement: " + simA_tipsFmt(liq - amt) + ". The beneficiary PSP then credits the beneficiary own account.</p>";
        }
      }
      return;
    }
    var st = steps[i];
    simA_tipsSetState(st.state);
    if(stepsEl){
      var li = document.createElement("li");
      li.textContent = st.title + ": " + st.detail;
      if(st.bad) li.className = "simA-bad";
      stepsEl.appendChild(li);
    }
    i = i + 1;
    simA_tipsTimer = setTimeout(simA_tipsShowNext, 900);
  }
  simA_tipsShowNext();
}
function simA_tipsLiquidity(){
  var balEl = document.getElementById("simA-tipsLtBal");
  var rtgsEl = document.getElementById("simA-tipsLtRtgs");
  var dcaEl = document.getElementById("simA-tipsLtDca");
  var amtEl = document.getElementById("simA-tipsLtAmt");
  var dirEl = document.getElementById("simA-tipsLtDir");
  var routeEl = document.getElementById("simA-tipsLtRoute");
  var out = document.getElementById("simA-tipsLtOut");
  if(!balEl || !rtgsEl || !dcaEl || !amtEl || !dirEl || !routeEl || !out) return;
  var mca = parseFloat(balEl.value);
  var rtgs = parseFloat(rtgsEl.value);
  var dca = parseFloat(dcaEl.value);
  var amt = parseFloat(amtEl.value);
  var dir = dirEl.value;
  var route = routeEl.value;
  if(!isFinite(amt) || amt <= 0 || !isFinite(mca) || mca < 0 || !isFinite(rtgs) || rtgs < 0 || !isFinite(dca) || dca < 0){
    out.innerHTML = "<div class='simA-fail'><h3>Transfer rejected at validation</h3><p>Enter a transfer amount greater than zero and balances of zero or more. Nothing moved.</p></div>";
    return;
  }
  var sourceName = route === "mca" ? "main cash account (CLM)" : "RTGS DCA";
  var sourceBal = route === "mca" ? mca : rtgs;
  var html = "";
  if(dir === "in"){
    html += "<div class='simA-msg'><b>Step 1, camt.050 Liquidity Credit Transfer.</b> The bank instructs a transfer of " + simA_tipsFmt(amt) + " from its " + sourceName + " to its TIPS DCA. This is two linked legs: leg 1 in CLM debits the " + sourceName + " and credits the TIPS-dedicated transit account in CLM; leg 2 in TIPS debits the CLM-dedicated transit account in TIPS and credits the TIPS DCA. Same currency only. " + (route === "rtgs" ? "The transfer goes via CLM and the main cash account is not involved." : "") + "</div>";
    if(amt > sourceBal){
      html += "<div class='simA-fail'><h3>Step 2, camt.025 Receipt: RJCT (rejected)</h3><p>The " + sourceName + " holds " + simA_tipsFmt(sourceBal) + " but the transfer needs " + simA_tipsFmt(amt) + ", a shortfall of " + simA_tipsFmt(amt - sourceBal) + ". A liquidity transfer settles or is rejected immediately, so it is rejected at once. No camt.054 is sent and no balance changes.</p></div>";
    } else {
      var newSource = sourceBal - amt, newDca = dca + amt;
      html += "<div class='simA-ok'><h3>Step 2, camt.025 Receipt: RCON (confirmed)</h3><p>The transfer settled immediately. " + sourceName + ": " + simA_tipsFmt(sourceBal) + " to " + simA_tipsFmt(newSource) + ". TIPS DCA: " + simA_tipsFmt(dca) + " to " + simA_tipsFmt(newDca) + ".</p></div>";
      html += "<div class='simA-msg'><b>Step 3, camt.054 Bank to Customer Debit Credit Notification.</b> A camt.054 is sent to the owner of each debited or credited account, optionally on subscription: CLM reports the " + sourceName + " debit and TIPS reports the TIPS DCA credit. The bank can now use the extra " + simA_tipsFmt(amt) + " in its TIPS DCA for instant payments.</div>";
      if(route === "mca") balEl.value = newSource.toFixed(2); else rtgsEl.value = newSource.toFixed(2);
      dcaEl.value = newDca.toFixed(2);
    }
  } else {
    html += "<div class='simA-msg'><b>Step 1, camt.050 Liquidity Credit Transfer.</b> The bank instructs a transfer of " + simA_tipsFmt(amt) + " from its TIPS DCA back to its " + sourceName + ". This is two linked legs: leg 1 in TIPS debits the TIPS DCA and credits the CLM-dedicated transit account in TIPS; leg 2 in CLM debits the TIPS-dedicated transit account in CLM and credits the " + sourceName + ". Same currency only. " + (route === "rtgs" ? "The transfer goes via CLM and the main cash account is not involved." : "") + "</div>";
    if(amt > dca){
      html += "<div class='simA-fail'><h3>Step 2, camt.025 Receipt: RJCT (rejected)</h3><p>The TIPS DCA holds " + simA_tipsFmt(dca) + " but the transfer needs " + simA_tipsFmt(amt) + ", a shortfall of " + simA_tipsFmt(amt - dca) + ". A liquidity transfer settles or is rejected immediately, so it is rejected at once. No camt.054 is sent and no balance changes.</p></div>";
    } else {
      var newDca2 = dca - amt, newSource2 = sourceBal + amt;
      html += "<div class='simA-ok'><h3>Step 2, camt.025 Receipt: RCON (confirmed)</h3><p>The transfer settled immediately. TIPS DCA: " + simA_tipsFmt(dca) + " to " + simA_tipsFmt(newDca2) + ". " + sourceName + ": " + simA_tipsFmt(sourceBal) + " to " + simA_tipsFmt(newSource2) + ".</p></div>";
      html += "<div class='simA-msg'><b>Step 3, camt.054 Bank to Customer Debit Credit Notification.</b> A camt.054 is sent to the owner of each debited or credited account, optionally on subscription: TIPS reports the TIPS DCA debit and CLM reports the " + sourceName + " credit.</div>";
      if(route === "mca") balEl.value = newSource2.toFixed(2); else rtgsEl.value = newSource2.toFixed(2);
      dcaEl.value = newDca2.toFixed(2);
    }
  }
  out.innerHTML = html;
}
document.addEventListener("DOMContentLoaded", function(){ simA_lifeBuildNodes(); simA_lifeSetRail(); simA_cbRender(); simA_tipsPartChange(); });


/* ===== Simulators B: hub, accounting, exceptions, XML explorer ===== */
var simB_hubData = (typeof simB_hubData !== 'undefined' && simB_hubData.length) ? simB_hubData : [];
document.addEventListener('DOMContentLoaded', function(){ if(simB_hubData.length) simB_hubSelect(0); });
function simB_hubSelect(i){
  var d = simB_hubData[i];
  if(!d) return;
  document.querySelectorAll('.simb-hub-card').forEach(function(b){b.classList.remove('active')});
  var card = document.getElementById('simb-hub-card-' + i);
  if(card) card.classList.add('active');
  var el = document.getElementById('simb-hub-detail');
  if(!el) return;
  el.innerHTML = '<h3>' + (i + 1) + '. ' + d.name + '</h3>'
    + '<p><b>What comes in.</b> ' + d.inn + '</p>'
    + '<p><b>What it does.</b> ' + d.does + '</p>'
    + '<p><b>What goes out.</b> ' + d.out + '</p>'
    + '<p><b>Which systems it calls.</b> ' + d.calls + '</p>'
    + '<p><b>What data it uses.</b> ' + d.data + '</p>'
    + '<p><b>What happens if it fails.</b> ' + d.fails + '</p>'
    + '<p><b>How the payment recovers.</b> ' + d.recovery + '</p>'
    + '<p><b>Representative reference architecture.</b> Real banks implement these functions differently; component boundaries, names and order vary by bank, vendor and rail. This list is a catalogue in rough flow order, not a strict sequence: the orchestrator is present throughout, liquidity is checked before release to clearing or settlement, and screening points vary by bank.</p>';
  /* Show the detail beside the grid (side panel on desktop, bottom sheet
     on mobile) so it is visible without scrolling past the component grid. */
  if(typeof pfOpenDetail === 'function') pfOpenDetail((i + 1) + '. ' + d.name, el.innerHTML);
}
var simB_hubFlows = {
  outgoing: {ids: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17], text: '<b>Outgoing payment.</b> The customer instructs the bank, the hub validates, screens, routes and sends it, and settlement discharges the bank obligation. Touches most components. Timing and settlement model depend on the rail chosen by routing.'},
  incoming: {ids: [2,3,4,5,6,7,9,10,11,12,13,14,15,16,17], text: '<b>Incoming payment.</b> A pacs.008 or MT103 arrives from another bank through the messaging and clearing interface, not through a customer channel. There is no debtor debit and no channel capture: the payment is screened, the creditor is credited, and the books are reconciled. Skips Payment Channels, the API Gateway and the Routing Engine.'},
  onus: {ids: [0,2,3,5,6,7,13,14,15,16,17], text: '<b>On-us payment.</b> Debtor and creditor hold accounts at the same bank, so there is no interbank message at all: internal posting only. Skips routing, processing, liquidity, clearing connectivity and the settlement engine entirely.'},
  instant: {ids: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17], text: '<b>Instant payment (SCT Inst / Faster Payments / TIPS).</b> Sub-10-second execution, 24/7, credit before or simultaneous with interbank settlement in central-bank money. It cannot wait for a batch clearing cycle, and a payment that cannot be credited in time is rejected and the payer restored, not queued.'},
  highvalue: {ids: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17], text: '<b>High-value payment (CHAPS / T2 / Fedwire).</b> RTGS: individual, gross settlement in central-bank money, final and irrevocable on posting. CHAPS is sterling-only. Funding (liquidity) must be in place before release, and payments unsettled at the cut-off are rejected, not carried to a next window.'},
  crossborder: {ids: [0,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17], text: '<b>Cross-border payment.</b> Correspondent chain with nostro funding, serial or cover method, and SWIFT gpi tracking (Tracker plus UETR) on top of the messaging, not as a rail. Charges depend on the charge bearer (DEBT/CRED/SHAR); the beneficiary receives the amount less any deductions the charge bearer permits.'}
};
function simB_hubFlow(flow){
  var box = document.getElementById('simb-hub-flow');
  if(flow === 'all'){
    document.querySelectorAll('.simb-hub-card').forEach(function(b){ b.classList.remove('simb-hub-dim'); });
    if(box){ box.style.display = 'none'; box.innerHTML = ''; }
    return;
  }
  var f = simB_hubFlows[flow];
  if(!f) return;
  document.querySelectorAll('.simb-hub-card').forEach(function(b, i){
    if(f.ids.indexOf(i) >= 0) b.classList.remove('simb-hub-dim'); else b.classList.add('simb-hub-dim');
  });
  if(box){ box.style.display = 'block'; box.innerHTML = '<p>' + f.text + '</p>'; }
}
var simB_acctIdx = {};
function simB_acctScenario(i){
  document.querySelectorAll('.simb-acct-scen').forEach(function(d){d.style.display='none'});
  var el = document.getElementById('simb-acct-' + i);
  if(el) el.style.display='block';
  var scope = document.querySelector('#sim-accounting');
  if(scope){
    scope.querySelectorAll('.explorer-tab').forEach(function(b){b.classList.remove('active')});
    var btns = scope.querySelectorAll('.explorer-tab');
    if(btns[i]) btns[i].classList.add('active');
  }
  simB_acctReset(i);
}
function simB_acctStep(si){
  var idx = simB_acctIdx[si] || 0;
  var next = idx + 1;
  var stepEl = document.getElementById('simb-acct-' + si + '-' + next);
  if(stepEl){
    stepEl.style.display='block';
    simB_acctIdx[si] = next;
    var total = document.querySelectorAll('[id^="simb-acct-' + si + '-"]').length;
    var prog = document.getElementById('simb-acct-prog-' + si);
    if(prog) prog.textContent = 'Step ' + (next + 1) + ' of ' + total;
    var prevBtn = document.getElementById('simb-acct-prev-' + si);
    if(prevBtn) prevBtn.disabled = false;
    if(!document.getElementById('simb-acct-' + si + '-' + (next + 1))){
      var fin = document.getElementById('simb-acct-final-' + si);
      if(fin) fin.style.display='block';
      var nextBtn = document.getElementById('simb-acct-next-' + si);
      if(nextBtn) nextBtn.disabled = true;
    }
  }
}
function simB_acctPrev(si){
  var idx = simB_acctIdx[si] || 0;
  if(idx <= 0) return;
  var cur = document.getElementById('simb-acct-' + si + '-' + idx);
  if(cur) cur.style.display='none';
  simB_acctIdx[si] = idx - 1;
  var total = document.querySelectorAll('[id^="simb-acct-' + si + '-"]').length;
  var prog = document.getElementById('simb-acct-prog-' + si);
  if(prog) prog.textContent = 'Step ' + idx + ' of ' + total;
  var fin = document.getElementById('simb-acct-final-' + si);
  if(fin) fin.style.display='none';
  var nextBtn = document.getElementById('simb-acct-next-' + si);
  if(nextBtn) nextBtn.disabled = false;
  var prevBtn = document.getElementById('simb-acct-prev-' + si);
  if(prevBtn) prevBtn.disabled = (idx - 1 <= 0);
}
function simB_acctReset(si){
  simB_acctIdx[si] = 0;
  var n = 0;
  while(true){
    var el = document.getElementById('simb-acct-' + si + '-' + n);
    if(!el) break;
    el.style.display = n === 0 ? 'block' : 'none';
    n += 1;
  }
  var prog = document.getElementById('simb-acct-prog-' + si);
  if(prog) prog.textContent = 'Step 1 of ' + n;
  var fin = document.getElementById('simb-acct-final-' + si);
  if(fin) fin.style.display='none';
  var nextBtn = document.getElementById('simb-acct-next-' + si);
  if(nextBtn) nextBtn.disabled = false;
  var prevBtn = document.getElementById('simb-acct-prev-' + si);
  if(prevBtn) prevBtn.disabled = true;
}
var simB_excDone = {};
var simB_excCorrect = 0;
function simB_excTab(i){
  document.querySelectorAll('.simb-exc-scen').forEach(function(d){d.style.display='none'});
  var el = document.getElementById('simb-exc-' + i);
  if(el) el.style.display='block';
  var scope = document.querySelector('#sim-exception');
  if(scope){
    scope.querySelectorAll('.explorer-tab').forEach(function(b){b.classList.remove('active')});
    var btns = scope.querySelectorAll('.explorer-tab');
    if(btns[i]) btns[i].classList.add('active');
  }
}
function simB_excAction(i, j, correct){
  if(simB_excDone[i]) return;
  simB_excDone[i] = true;
  var dataBox = document.getElementById('simb-exc-data-' + i);
  var rows = dataBox ? dataBox.querySelectorAll('p') : [];
  var row = rows[j];
  var why = row ? row.getAttribute('data-why') : '';
  var ev = row ? row.getAttribute('data-ev') : '';
  var nx = row ? row.getAttribute('data-nx') : '';
  for(var k = 0; k < 3; k++){
    var btn = document.getElementById('simb-exc-' + i + '-' + k);
    if(btn){
      btn.disabled = true;
      if(k === j) btn.classList.add(correct ? 'simb-ok' : 'simb-bad');
    }
  }
  if(correct) simB_excCorrect += 1;
  var fb = document.getElementById('simb-exc-fb-' + i);
  if(fb){
    var totalExc = document.querySelectorAll('.simb-exc-scen').length;
    fb.style.display='block';
    fb.innerHTML = '<p class="' + (correct ? 'simb-ok' : 'simb-bad') + '">'
      + (correct ? 'Correct first action.' : 'Not the best first action.') + '</p>'
      + '<p><b>Why.</b> ' + why + '</p>'
      + '<p><b>Evidence this produces.</b> ' + ev + '</p>'
      + '<p><b>Next step.</b> ' + nx + '</p>'
      + (i + 1 < totalExc
        ? '<p><button class="api-btn" onclick="simB_excTab(' + (i + 1) + ')">Next scenario</button></p>'
        : '<p><b>That was the last scenario.</b> Your score is shown at the top.</p>');
  }
  var done = Object.keys(simB_excDone).length;
  var s = document.getElementById('simb-exc-score');
  if(s) s.textContent = simB_excCorrect;
  var d = document.getElementById('simb-exc-done');
  if(d) d.textContent = done;
}
function simB_excReset(){
  simB_excDone = {};
  simB_excCorrect = 0;
  document.querySelectorAll('.simb-exc-btn').forEach(function(b){
    b.disabled = false;
    b.classList.remove('simb-ok', 'simb-bad');
  });
  document.querySelectorAll('[id^="simb-exc-fb-"]').forEach(function(f){f.style.display='none'});
  var s = document.getElementById('simb-exc-score');
  if(s) s.textContent = '0';
  var d = document.getElementById('simb-exc-done');
  if(d) d.textContent = '0';
}
function simB_xmlTab(i){
  document.querySelectorAll('.simb-xml-msg').forEach(function(d){d.style.display='none'});
  var el = document.getElementById('simb-xml-' + i);
  if(el) el.style.display='block';
  var scope = document.querySelector('#sim-xml');
  if(scope){
    scope.querySelectorAll('.explorer-tab').forEach(function(b){b.classList.remove('active')});
    var btns = scope.querySelectorAll('.explorer-tab');
    if(btns[i]) btns[i].classList.add('active');
  }
}
function simB_xmlToggle(btn){
  var node = btn.closest('.simb-xml-node');
  if(!node) return;
  var kids = node.querySelector(':scope > .simb-xml-children');
  if(!kids) return;
  if(kids.style.display === 'none'){
    kids.style.display='block';
    btn.textContent='-';
  } else {
    kids.style.display='none';
    btn.textContent='+';
  }
}
function simB_xmlField(msg, tag, el){
  document.querySelectorAll('.simb-xml-sel').forEach(function(n){n.classList.remove('simb-xml-sel')});
  if(el) el.classList.add('simb-xml-sel');
  var box = el ? el.closest('.simb-xml-msg') : null;
  var panel = box ? box.querySelector('.simb-panel') : null;
  if(!panel) return;
  var info = (typeof simB_xmlInfo !== 'undefined' && simB_xmlInfo[msg]) ? simB_xmlInfo[msg][tag] : null;
  if(!info){
    panel.innerHTML = '<p><b>' + tag + '.</b> This element is part of the ' + msg
      + ' structure. It carries data the receiving bank needs to process or report on the payment.</p>';
    if(typeof pfRevealDetail === 'function') pfRevealDetail(panel);
    return;
  }
  panel.innerHTML = '<h3>' + tag + '</h3>'
    + '<p><b>Business meaning.</b> ' + info.meaning + '</p>'
    + '<p><b>Cardinality.</b> ' + info.card + '</p>'
    + '<p><b>Mandatory status.</b> ' + info.mand + '</p>'
    + '<p><b>Example value.</b> ' + info.example + '</p>'
    + '<p><b>MT equivalent.</b> ' + info.mt + '</p>'
    + '<p><b>Common validation errors.</b> ' + info.errors + '</p>';
  if(typeof pfRevealDetail === 'function') pfRevealDetail(panel);
}
function simB_xmlExpandAll(i){
  var root = document.getElementById('simb-xml-' + i);
  if(!root) return;
  root.querySelectorAll('.simb-xml-children').forEach(function(c){c.style.display='block'});
  root.querySelectorAll('.simb-xml-toggle').forEach(function(b){b.textContent='-'});
}
function simB_xmlCollapseAll(i){
  var root = document.getElementById('simb-xml-' + i);
  if(!root) return;
  root.querySelectorAll('.simb-xml-children').forEach(function(c){c.style.display='none'});
  root.querySelectorAll('.simb-xml-toggle').forEach(function(b){b.textContent='+'});
}
function simB_xmlVersion(){
  var el = document.getElementById('simb-xml-version');
  if(!el) return;
  var show = el.style.display === 'none';
  el.style.display = show ? 'block' : 'none';
  if(show && el.scrollIntoView) el.scrollIntoView({behavior:'smooth',block:'start'});
}
/* ===== Payment state machine simulator ===== */
var simB_smOrder = ['Received', 'Validated', 'Accepted', 'Queued', 'Clearing Accepted', 'Settled', 'Credited', 'Reconciled', 'Held', 'Rejected', 'Returned', 'Recalled', 'Failed', 'Unknown', 'Expired', 'Duplicate'];
var simB_smState = 'Received';
var simB_smLabels = {validate_ok:'validate OK', validation_fail:'validation fail', duplicate:'duplicate detected', screening_hit:'screening hit', screening_clear:'screening clear', screening_confirmed:'screening hit confirmed', corr_offline:'correspondent offline', corr_online:'correspondent back online', clearing_accept:'clearing accept', clearing_reject:'clearing reject', settlement_confirm:'settlement confirm', settlement_timeout:'settlement timeout', credit_confirm:'beneficiary credit confirm', credit_fail:'credit fail', recall:'recall received', return:'return received', timeout:'timeout', recon_match:'reconciliation match', inv_settled:'investigation finds settled', inv_failed:'investigation finds failed'};
var simB_smTrans = {
'Received':{validate_ok:{to:'Validated', why:'The instruction passes structural and business validation, so the payment can move to screening.'}, validation_fail:{to:'Rejected', why:'A validation check fails, for example an invalid BIC, so the payment is rejected before any funds move.'}, duplicate:{to:'Duplicate', why:'The idempotency key or reference matches an earlier payment, so this instruction is a duplicate and is dropped.'}},
'Validated':{screening_clear:{to:'Accepted', why:'Screening returns clear, so the payment is accepted for processing.'}, screening_hit:{to:'Held', why:'Screening finds a possible match, so the payment is held for manual review.'}, validation_fail:{to:'Rejected', why:'A late business validation fails, so the payment is rejected.'}},
'Held':{screening_clear:{to:'Accepted', why:'Compliance reviews the match and clears it as a false positive, so the payment is accepted.'}, screening_confirmed:{to:'Rejected', why:'Compliance confirms the match, so the payment is blocked and rejected.'}},
'Accepted':{corr_offline:{to:'Queued', why:'The selected correspondent cannot accept the message, so the payment waits in the queue.'}, clearing_accept:{to:'Clearing Accepted', why:'The clearing system accepts the message for its clearing cycle.'}, clearing_reject:{to:'Rejected', why:'Clearing rejects the message, so the payment is rejected.'}},
'Queued':{corr_online:{to:'Accepted', why:'The correspondent returns, so the queued payment goes back to Accepted and is sent on.'}, timeout:{to:'Expired', why:'The queued payment window closed before it was ever sent, so nothing moved and the outcome is known: it expired un-sent. Unknown is only possible after transmission.'}},
'Clearing Accepted':{settlement_confirm:{to:'Settled', why:'Settlement posts finally and irrevocably, so the payment is Settled.'}, settlement_timeout:{to:'Unknown', why:'No settlement confirmation arrives in time, so the outcome is unknown.'}, clearing_reject:{to:'Rejected', why:'Clearing withdraws its acceptance, so the payment is rejected.'}},
'Settled':{credit_confirm:{to:'Credited', why:'The beneficiary bank posts the funds to the supplier account.'}, credit_fail:{to:'Returned', why:'The beneficiary bank cannot credit the account, so the creditor agent returns the funds via pacs.004 and the payment is Returned, with the funds back with the originator.'}, recall:{to:'Returned', why:'The originator sends a camt.056 cancellation request before the beneficiary is credited, and the creditor agent returns the funds via pacs.004, so the payment is Returned.'}},
'Credited':{recon_match:{to:'Reconciled', why:'End of day reconciliation matches instruction, clearing, settlement and ledger, so the payment is Reconciled.'}, recall:{to:'Recalled', why:'The originator recalls the payment and the beneficiary bank agrees, so the payment is Recalled.'}},
'Unknown':{inv_settled:{to:'Settled', why:'The investigation proves settlement posted, so the payment is Settled.'}, inv_failed:{to:'Failed', why:'The investigation proves settlement never posted, so the payment is Failed.'}}
};
function simB_smIsTerminal(state){
  var terms = (typeof simB_smTerminal !== 'undefined' && simB_smTerminal.length) ? simB_smTerminal : ['Duplicate', 'Rejected', 'Returned', 'Recalled', 'Failed', 'Expired', 'Reconciled'];
  return terms.indexOf(state) >= 0;
}
function simB_smLog(text){
  var log = document.getElementById('simb-sm-log');
  if(log){ var li = document.createElement('li'); li.textContent = text; log.appendChild(li); }
}
function simB_smShowDetail(state){
  var d = (typeof simB_smStates !== 'undefined') ? simB_smStates[state] : null;
  var el = document.getElementById('simb-sm-detail');
  if(!el) return;
  if(!d){ el.innerHTML = '<h3>' + state + '</h3><p>No detail recorded for this state.</p>'; return; }
  var term = simB_smIsTerminal(state) ? ' (terminal state)' : '';
  var html = '<h3>' + state + term + '</h3>'
    + '<p><b>What it means.</b> ' + d.meaning + '</p>'
    + '<p><b>What caused entry.</b> ' + d.entry + '</p>'
    + '<p><b>What data is held.</b> ' + d.data + '</p>'
    + '<p><b>What happens next.</b> ' + d.next + '</p>'
    + '<p><b>What can go wrong.</b> ' + d.risk + '</p>';
  if(d.note) html += '<p><b>Note.</b> ' + d.note + '</p>';
  el.innerHTML = html;
  document.querySelectorAll('.simb-sm-state').forEach(function(b){ b.classList.remove('viewed'); });
  var idx = simB_smOrder.indexOf(state);
  var btn = document.getElementById('simb-sm-st-' + idx);
  if(btn) btn.classList.add('viewed');
}
function simB_smShowState(){
  var cur = document.getElementById('simb-sm-state');
  if(cur) cur.textContent = simB_smState;
  document.querySelectorAll('.simb-sm-state').forEach(function(b){ b.classList.remove('active'); });
  var idx = simB_smOrder.indexOf(simB_smState);
  var btn = document.getElementById('simb-sm-st-' + idx);
  if(btn) btn.classList.add('active');
  simB_smShowDetail(simB_smState);
}
function simB_smSelect(state){
  simB_smShowDetail(state);
  /* Show the state detail beside the state grid (side panel on desktop,
     bottom sheet on mobile) so it is visible without scrolling past it. */
  var el = document.getElementById('simb-sm-detail');
  if(el && typeof pfOpenDetail === 'function') pfOpenDetail(state, el.innerHTML);
  /* Viewing a state is a learner action, not a payment event: it is not logged in the payment event log. */
}
function simB_smInvalidReason(state, ev){
  if(ev === 'settlement_confirm' && (state === 'Received' || state === 'Validated' || state === 'Accepted' || state === 'Queued' || state === 'Held')){
    return 'Cannot settle a payment that has not been accepted by clearing. Clearing acceptance must come first.';
  }
  if(ev === 'clearing_accept' && (state === 'Received' || state === 'Validated')){
    return 'Clearing accepts only a payment that has been accepted for processing. Validation alone is not acceptance.';
  }
  if(ev === 'clearing_accept' && (state === 'Queued' || state === 'Unknown')){
    return 'Clearing acceptance needs an Accepted payment. This payment must return to Accepted first.';
  }
  if(ev === 'clearing_accept' && (state === 'Settled' || state === 'Credited')){
    return 'The payment is already past clearing. Clearing acceptance belongs before settlement, not after it.';
  }
  if(ev === 'credit_confirm' && state !== 'Settled'){
    return 'Beneficiary credit needs settlement finality first. This payment has not settled.';
  }
  if(ev === 'settlement_confirm' && state === 'Credited'){
    return 'The payment already settled before it was credited. Settlement cannot happen twice.';
  }
  if(ev === 'recon_match' && state !== 'Credited'){
    return 'Reconciliation match needs a credited payment first. Only a Credited payment can be reconciled.';
  }
  if((ev === 'inv_settled' || ev === 'inv_failed') && state !== 'Unknown'){
    return 'Investigation results apply only to a payment in Unknown. This payment is not under investigation.';
  }
  if(ev === 'corr_online' && state !== 'Queued'){
    return 'There is no correspondent outage to recover from in this state.';
  }
  if((ev === 'screening_clear' || ev === 'screening_hit') && state !== 'Validated' && state !== 'Held'){
    return 'Screening applies only while the payment is Validated or Held.';
  }
  if(ev === 'screening_confirmed' && state !== 'Held'){
    return 'A confirmed screening hit applies only to a Held payment.';
  }
  if((ev === 'validate_ok' || ev === 'validation_fail') && state !== 'Received' && state !== 'Validated'){
    return 'Validation happens at the start of the payment, not from this state.';
  }
  if(ev === 'duplicate' && state !== 'Received'){
    return 'Duplicate detection happens when the instruction first arrives.';
  }
  if(ev === 'corr_offline' && state !== 'Accepted'){
    return 'Correspondent outage queues only an Accepted payment waiting to be sent.';
  }
  if(ev === 'clearing_reject' && state !== 'Accepted' && state !== 'Clearing Accepted'){
    return 'Clearing can only reject a payment that reached clearing.';
  }
  if(ev === 'credit_fail' && state !== 'Settled'){
    return 'Credit can only fail after settlement.';
  }
  if(ev === 'return'){
    return 'A return is not an event to fire: it is the outcome when the creditor agent cannot credit (before credit) and sends a pacs.004. Fire "credit fail" from Settled to see it, or "recall received" after credit for a recall.';
  }
  if(ev === 'recall' && state !== 'Credited' && state !== 'Settled'){
    return 'A recall (camt.056) applies only after settlement: from Settled (before credit, the funds are returned via pacs.004) or from Credited (after credit, with the beneficiary bank agreement).';
  }
  if(ev === 'timeout' && (state === 'Received' || state === 'Validated' || state === 'Held')){
    return 'Timeout to Unknown is impossible from ' + state + ': nothing has been sent, so the outcome is known (not sent).';
  }
  if(ev === 'settlement_timeout' && state !== 'Clearing Accepted'){
    return 'Settlement timeout applies only while the payment waits for settlement after clearing acceptance.';
  }
  return '';
}
function simB_smFire(ev){
  var label = simB_smLabels[ev] || ev;
  var out = document.getElementById('simb-sm-event-out');
  var from = simB_smState;
  if(simB_smIsTerminal(from)){
    var msgT = 'Event "' + label + '" rejected. ' + from + ' is a terminal state. No event can move it. A new instruction is needed for a new payment.';
    if(out) out.innerHTML = '<p><b>Invalid event.</b> ' + msgT + '</p>';
    simB_smLog(msgT);
    return;
  }
  var trans = simB_smTrans[from] ? simB_smTrans[from][ev] : null;
  if(trans){
    simB_smState = trans.to;
    var msgV = 'Event "' + label + '" accepted. ' + from + ' to ' + trans.to + '. ' + trans.why;
    if(out) out.innerHTML = '<p><b>Valid transition: ' + from + ' to ' + trans.to + '.</b> ' + trans.why + '</p>';
    simB_smLog(msgV);
    simB_smShowState();
    return;
  }
  if(ev === 'timeout'){
    if(from === 'Clearing Accepted'){
      simB_smState = 'Unknown';
      var msgU = 'Event "timeout" accepted. ' + from + ' to Unknown. The payment was sent and no settlement confirmation arrived, so its outcome is unknown until a pacs.028 investigation proves it.';
      if(out) out.innerHTML = '<p><b>Valid transition: ' + from + ' to Unknown.</b> The payment was sent and no settlement confirmation arrived, so its outcome is unknown until a pacs.028 investigation proves it.</p>';
      simB_smLog(msgU);
      simB_smShowState();
      return;
    }
    if(from === 'Accepted' || from === 'Queued'){
      simB_smState = 'Expired';
      var msgE = 'Event "timeout" accepted. ' + from + ' to Expired. The payment window closed before anything was sent, so nothing moved and the outcome is known: it expired un-sent. Unknown is only possible after transmission.';
      if(out) out.innerHTML = '<p><b>Valid transition: ' + from + ' to Expired.</b> The payment window closed before anything was sent, so nothing moved and the outcome is known.</p>';
      simB_smLog(msgE);
      simB_smShowState();
      return;
    }
    var msgTI = 'Event "timeout" rejected from ' + from + '. Timeout to Unknown is impossible from ' + from + ': nothing has been sent, so the outcome is known (not sent).';
    if(out) out.innerHTML = '<p><b>Invalid event.</b> ' + msgTI + '</p>';
    simB_smLog(msgTI);
    return;
  }
  var reason = simB_smInvalidReason(from, ev);
  if(!reason){
    var valid = simB_smTrans[from] ? Object.keys(simB_smTrans[from]).map(function(k){ return simB_smLabels[k]; }).join(', ') : '';
    reason = 'This event cannot fire from ' + from + '.' + (valid ? ' Valid events from ' + from + ' are: ' + valid + '.' : ' No events are valid from this state.');
  }
  var msgI = 'Event "' + label + '" rejected from ' + from + '. ' + reason;
  if(out) out.innerHTML = '<p><b>Invalid event.</b> ' + reason + '</p>';
  simB_smLog(msgI);
}
function simB_smOOO(kind){
  var box = document.getElementById('simb-sm-ooo-out');
  if(!box) return;
  box.style.display = 'block';
  if(kind === 'ack'){
    box.innerHTML = '<h3>Acknowledgement arrives before instruction</h3>'
      + '<p>A pacs.002 acknowledgement (ACTC/ACCP) arrives, but no pacs.008 instruction with that UETR is on file yet.</p>'
      + '<p><b>What the system does.</b> It does NOT advance the payment, because there is no payment to advance. It holds the acknowledgement in an unmatched acknowledgement queue, logs an anomaly (acknowledgement before instruction), and waits for the missing instruction.</p>'
      + '<p><b>What happens next.</b> When the pacs.008 arrives, the system matches it by UETR, applies the held acknowledgement, and the payment moves to Accepted. If no instruction arrives before the wait expires, operations investigate the unmatched acknowledgement.</p>';
    simB_smLog('Out-of-order demo: acknowledgement arrived before its instruction. Held in the unmatched acknowledgement queue, anomaly logged, waiting for the instruction.');
  } else {
    box.innerHTML = '<h3>Settlement confirmation arrives before clearing acceptance</h3>'
      + '<p>A settlement confirmation arrives, but the payment has not been accepted by clearing yet.</p>'
      + '<p><b>What the system does.</b> It does NOT mark the payment Settled. It queues the confirmation as an early settlement notice, logs an anomaly (settlement confirmation before clearing acceptance), and waits for the missing clearing acceptance.</p>'
      + '<p><b>What happens next.</b> When clearing acceptance arrives, the system replays the queued confirmation and the payment moves to Settled. If clearing rejects instead, the queued confirmation is discarded and investigated.</p>';
    simB_smLog('Out-of-order demo: settlement confirmation arrived before clearing acceptance. Queued as an early settlement notice, anomaly logged, waiting for clearing acceptance.');
  }
}
function simB_smDup(){
  var box = document.getElementById('simb-sm-dup-out');
  if(!box) return;
  box.style.display = 'block';
  box.innerHTML = '<h3>Duplicate instruction demo: idempotency key check</h3>'
    + '<p><b>First submission.</b> Idempotency key IDEM-8841, instruction: pay USD 25,000 to Tanaka Trading Pte Ltd, reference INV-8841. Key is new, so the payment is created as PAY-20261105-8841 and the debit posts once.</p>'
    + '<p><b>Second submission.</b> Same idempotency key IDEM-8841 and the same instruction, after a channel retry. The key lookup finds PAY-20261105-8841 already exists.</p>'
    + '<p><b>Result.</b> Duplicate dropped. No second payment is created, no second debit posts, and the channel receives the original payment ID PAY-20261105-8841 again. The beneficiary is paid once, not twice.</p>'
    + '<p><b>Guard rail.</b> The same key with a different instruction is rejected as key reuse, so a key can never silently pay a different payment.</p>';
  simB_smLog('Duplicate demo: same idempotency key IDEM-8841 and same instruction. Duplicate dropped, no double posting, original payment ID PAY-20261105-8841 returned.');
}
function simB_smUnknown(){
  simB_smState = 'Unknown';
  simB_smShowState();
  var box = document.getElementById('simb-sm-unknown-out');
  if(box){
    box.style.display = 'block';
    box.innerHTML = '<h3>Timeout and unknown outcome demo</h3>'
      + '<p><b>What happened.</b> The payment waited for a settlement confirmation past its deadline and none arrived. The machine is now at Unknown. The money may have moved, so nobody acts on an assumption.</p>'
      + '<p><b>Investigation path.</b> 1. Send a pacs.028 status request with the UETR and ask whether the pacs.008 was received and processed (for SCT Inst, pacs.028 goes out if no response arrives after 25 seconds). 2. Check the UETR status on the SWIFT tracker. 3. Check the settlement account: did the nostro debit post? The answer arrives as a pacs.002, or as a camt.029 for a camt.056 recall.</p>'
      + '<p><b>Resolution.</b> Fire "investigation finds settled" from the injector if the checks prove settlement posted, and the payment moves to Settled. Fire "investigation finds failed" if the checks prove settlement never posted, and the payment moves to Failed. Never resend or re-credit while the payment is Unknown.</p>';
  }
  simB_smLog('Timeout demo: no settlement confirmation arrived, payment moved to Unknown. Investigation started: query correspondent, check UETR status, check settlement account.');
}
function simB_smReset(){
  simB_smState = 'Received';
  var out = document.getElementById('simb-sm-event-out');
  if(out) out.innerHTML = '<p><b>No event fired yet.</b> The machine is at Received. Try "validate OK" to move to Validated, or try "settlement confirm" to see an invalid event rejected with its reason.</p>';
  var log = document.getElementById('simb-sm-log');
  if(log) log.innerHTML = '<li>Machine starts at Received. Payment PAY-20261105-8841 created.</li>';
  ['simb-sm-ooo-out', 'simb-sm-dup-out', 'simb-sm-unknown-out'].forEach(function(id){
    var b = document.getElementById(id);
    if(b){ b.style.display = 'none'; b.innerHTML = ''; }
  });
  simB_smShowState();
}
document.addEventListener('DOMContentLoaded', function(){ simB_smShowState(); });

