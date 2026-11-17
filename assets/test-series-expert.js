// Payments Expert Test Series: 30 tests x 10 questions = 300 questions.
// Test topics in order:
// 1. SEPA Rulebooks in Depth
// 2. SCT Scheme Rules and Timelines
// 3. SDD Core and B2B in Depth
// 4. TARGET Services: T2 in Depth
// 5. TIPS Instant Payments in Depth
// 6. ISO 20022 Message Versions and Supplementary Data
// 7. Structured Addresses and Party Identification
// 8. CBPR+ Usage Guidelines and Message Design
// 9. Reject vs Return Rules in CBPR+
// 10. pacs and pain Messages in Depth
// 11. Intraday Liquidity Management
// 12. Queues, Gridlock and Liquidity Optimisation
// 13. Liquidity Funding and Collateral
// 14. PSD2 and PSD3 in Depth
// 15. FEMA and Cross-Border Regulation
// 16. GDPR for Payment Data
// 17. Operational Resilience and Regulatory Expectations
// 18. Payment Hub Design and State Machines
// 19. Idempotency and Duplicate Handling
// 20. Resilience Patterns and Failure Design
// 21. API Design for Payment Initiation
// 22. Multi-Leg Investigations and Case Management
// 23. Nostro Breaks and Reconciliation Depth
// 24. Timeout, Reversal and Uncertainty Design
// 25. Settlement Design and Failure Modes
// 26. Correspondent Banking Depth
// 27. Card Scheme Depth: EMV and Tokenisation
// 28. 3D Secure, 3RI and Authentication
// 29. Chargeback Rules and Dispute Strategy
// 30. Expert Judgment: Design Trade-offs and Regulatory Edge Cases
window.PA_TEST_SERIES_EXPERT = {
  "series_id": "expert",
  "series_title": "Payments Expert Test Series",
  "tests": [
    {
      "mode": "test",
      "test": {
        "id": "px-01",
        "title": "Payments Expert Test 1: SEPA Rulebooks in Depth",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-01-01",
          "domain": "rails",
          "chapter": "ch93",
          "question": "A bank is joining a SEPA scheme and its legal team asks what the rulebook actually governs. Which statement best describes the role of a SEPA scheme rulebook?",
          "options": [
            "It sets the technical file format only and leaves all business rules to each bank.",
            "It is a voluntary code that banks may follow only for cross-border payments.",
            "It defines the business rules, roles, timelines and exception handling all participants must follow.",
            "It replaces national law for every payment made inside the euro area."
          ],
          "answer": 2,
          "explanation": "A scheme rulebook is the binding set of business rules for participants. It defines roles, timelines, message usage and how exceptions such as rejects, returns and recalls are handled. That shared rule set is what makes a payment behave the same way whichever scheme banks are involved.",
          "why_wrong": [
            "The rulebook covers far more than file formats, including timelines and exception duties.",
            "Rulebooks are binding on scheme participants, not voluntary guidance.",
            "",
            "Rulebooks operate within the law and do not replace national or EU law."
          ]
        },
        {
          "id": "px-01-02",
          "domain": "rails",
          "chapter": "ch93",
          "question": "Two SEPA banks disagree about who bears a loss after a recall. Where should the operations team look first to settle the dispute?",
          "options": [
            "The bilateral correspondent agreement between the two banks.",
            "The SWIFT user handbook for the message type used.",
            "The payer's account terms and conditions alone.",
            "The scheme rulebook provisions on recalls, returns and participant liability."
          ],
          "answer": 3,
          "explanation": "Recall rights, time limits and the duties of each party are defined in the scheme rulebook. The rulebook is the common contract all participants accepted when they joined the scheme. Bilateral agreements and account terms sit underneath it for scheme payments.",
          "why_wrong": [
            "A correspondent agreement does not govern scheme recall duties between SEPA participants.",
            "SWIFT documentation covers message usage, not scheme liability for recalls.",
            "Account terms bind the bank and its own customer, not the other scheme participant.",
            ""
          ]
        },
        {
          "id": "px-01-03",
          "domain": "clearing",
          "chapter": "ch93",
          "question": "A SEPA payment is cleared through a clearing mechanism but settles in central bank money. Why does the scheme separate clearing from settlement in its design?",
          "options": [
            "Because clearing and settlement must always happen at the same instant.",
            "Because separation lets many banks exchange instructions efficiently before final funds move once.",
            "Because settlement in central bank money is optional for SEPA payments.",
            "Because clearing mechanisms are only used for card payments."
          ],
          "answer": 1,
          "explanation": "Clearing is the exchange and sorting of payment instructions, while settlement is the final movement of funds. Separating them lets a clearing mechanism net or batch instructions and then settle efficiently, often in central bank money. This reduces the number of fund movements and the liquidity each bank needs.",
          "why_wrong": [
            "Clearing and settlement are distinct steps and are often separated in time.",
            "",
            "Settlement arrangements are a core part of scheme design, not an optional extra.",
            "Clearing mechanisms serve credit transfers and direct debits as well as cards."
          ]
        },
        {
          "id": "px-01-04",
          "domain": "rails",
          "chapter": "ch61",
          "question": "A corporate customer asks why its SEPA credit transfer to another euro area country costs the same as a domestic one. What is the best explanation?",
          "options": [
            "Cross-border SEPA payments are subsidised by the central bank.",
            "SEPA harmonised the rules and formats so a euro payment works the same across participating countries.",
            "All euro area banks share one account at the central bank.",
            "Domestic payments are priced higher to fund cross-border ones."
          ],
          "answer": 1,
          "explanation": "SEPA created one set of schemes, formats and rules for euro payments across participating countries. A payment to another SEPA country therefore follows the same scheme process as a domestic one. Pricing is a commercial decision by each bank, but the underlying scheme treatment is harmonised.",
          "why_wrong": [
            "There is no general central bank subsidy for SEPA payments.",
            "",
            "Banks hold their own settlement accounts; they do not share one account.",
            "Cross-subsidy between domestic and cross-border pricing is not how SEPA works."
          ]
        },
        {
          "id": "px-01-05",
          "domain": "compliance",
          "chapter": "ch93",
          "question": "A new SEPA participant fails to meet a rulebook obligation and another bank suffers a loss. What does scheme adherence normally imply for the failing bank?",
          "options": [
            "It may face scheme compliance measures and liability under the scheme rules it accepted.",
            "It faces no consequence because rulebooks are advisory only.",
            "Only its national regulator can act, never the scheme.",
            "It is automatically expelled with no right to respond."
          ],
          "answer": 0,
          "explanation": "Joining a scheme means accepting its rulebook as binding, including compliance and liability provisions. Schemes typically have defined processes for handling breaches, which may include remediation, penalties or escalation. This accountability is what gives other participants confidence in the scheme.",
          "why_wrong": [
            "",
            "Rulebooks are binding on participants, not merely advisory.",
            "Scheme compliance processes exist alongside regulatory supervision.",
            "Expulsion is an extreme step and schemes normally follow a defined process first."
          ]
        },
        {
          "id": "px-01-06",
          "domain": "rails",
          "chapter": "ch93",
          "question": "A bank's SEPA implementation team is debating whether the SCT and SDD schemes can share one processing engine. What is the strongest argument that they need distinct rule handling?",
          "options": [
            "SCT and SDD use completely different currencies.",
            "SDD payments never settle in central bank money.",
            "SCT is a push payment and SDD is a pull payment, so mandates, consent and refund rights differ fundamentally.",
            "SCT has no exception handling while SDD has extensive rules."
          ],
          "answer": 2,
          "explanation": "In SCT the payer pushes funds, while in SDD the payee pulls funds under a mandate given by the payer. That difference drives mandate management, pre-notification, consent checks and the distinct refund rights for direct debits. A shared engine is possible, but the scheme rule handling must reflect these different models.",
          "why_wrong": [
            "Both schemes operate in euro; currency is not the distinguishing factor.",
            "SDD settlement arrangements follow scheme design like other SEPA payments.",
            "",
            "Both schemes have detailed exception handling, including rejects, returns and refunds."
          ]
        },
        {
          "id": "px-01-07",
          "domain": "operations",
          "chapter": "ch93",
          "question": "A SEPA rulebook change cycle introduces a new version of the implementation guidelines. What should a participating bank do first?",
          "options": [
            "Assess the impact on messages, validations, timelines and testing, then plan adoption before the effective date.",
            "Ignore it until a customer complains about a failed payment.",
            "Apply it immediately on the announcement date without testing.",
            "Wait for its clearing mechanism to force the change at the last minute."
          ],
          "answer": 0,
          "explanation": "Rulebook changes have fixed effective dates and affect message usage, validations and processing timelines. Banks must assess the impact, update systems, test with counterparties and be ready by the effective date. Waiting until the deadline or ignoring the change risks rejects and scheme non-compliance.",
          "why_wrong": [
            "",
            "Ignoring a rulebook change risks failed payments and non-compliance.",
            "Untested immediate adoption risks production failures across the payment chain.",
            "Relying on the clearing mechanism alone leaves the bank's own systems unprepared."
          ]
        },
        {
          "id": "px-01-08",
          "domain": "rails",
          "chapter": "ch11",
          "question": "A payment from a SEPA country to a non-SEPA country is routed outside the SEPA schemes. Why can the bank not simply apply SEPA rulebook timelines to that payment?",
          "options": [
            "Because the destination bank has not adhered to the SEPA scheme and its rules do not bind it.",
            "Because SEPA messages cannot carry non-euro amounts.",
            "Because correspondent banking is always faster than SEPA.",
            "Because the payment must be converted to cash first."
          ],
          "answer": 0,
          "explanation": "Scheme rules bind only participants that have adhered to the scheme. A bank outside SEPA has no obligation to follow SEPA timelines, return rules or formats. Such payments follow correspondent banking arrangements and the rules of the systems they actually use.",
          "why_wrong": [
            "",
            "Message capability is not the reason; scheme adherence is what creates the obligation.",
            "Correspondent banking is not inherently faster; speed depends on the route and systems used.",
            "Conversion to cash is not part of cross-border electronic payment routing."
          ]
        },
        {
          "id": "px-01-09",
          "domain": "clearing",
          "chapter": "ch93",
          "question": "A bank is choosing between two clearing mechanisms for its SEPA volumes. Which factor is most important for scheme compliance?",
          "options": [
            "The marketing brand of the clearing mechanism.",
            "The number of offices the mechanism operator has.",
            "That the mechanism offers the lowest fee regardless of capability.",
            "That the mechanism supports the scheme rules, formats and settlement arrangements the bank needs."
          ],
          "answer": 3,
          "explanation": "A clearing mechanism must correctly apply the scheme's message standards, validation rules, timelines and settlement model. If it cannot support the scheme requirements, the bank cannot meet its scheme obligations through it. Cost and brand matter commercially, but scheme compliance depends on capability.",
          "why_wrong": [
            "Brand does not determine whether scheme rules are applied correctly.",
            "Office locations are irrelevant to scheme processing capability.",
            "The lowest fee is a false economy if the mechanism cannot meet scheme requirements.",
            ""
          ]
        },
        {
          "id": "px-01-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is writing requirements for a SEPA scheme change. Which requirement is most precise for developers and testers?",
          "options": [
            "The system should handle SEPA payments better.",
            "The system must validate the new mandatory field, reject non-compliant instructions with the scheme reason code, and log the rejection.",
            "The system should be modern and fast.",
            "The system must support all future rulebooks."
          ],
          "answer": 1,
          "explanation": "Good requirements name the specific validation, the behaviour on failure, the reason code and the audit trail. That precision lets developers build the change and testers verify each outcome. Vague goals like better or modern cannot be built or tested reliably.",
          "why_wrong": [
            "This is too vague to build or test.",
            "",
            "Modern and fast are not testable requirements for a scheme change.",
            "No system can be specified against unknown future rulebooks."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-02",
        "title": "Payments Expert Test 2: SCT Scheme Rules and Timelines",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-02-01",
          "domain": "rails",
          "chapter": "ch61",
          "question": "A customer sends an SCT payment late on a Friday. The payer bank accepts it but the beneficiary bank credits the account on Monday. What most likely explains the timing?",
          "options": [
            "The scheme execution timeline counts business days, and weekends are not scheme business days.",
            "The payment was lost over the weekend.",
            "The beneficiary bank deliberately delayed the credit to earn interest.",
            "SCT payments are only processed once a week."
          ],
          "answer": 0,
          "explanation": "SCT execution timelines are defined in business days under the scheme rules, and the scheme calendar determines which days count. A payment accepted late on Friday may therefore be credited on the next business day. This is normal scheme timing, not a loss or a deliberate delay.",
          "why_wrong": [
            "",
            "A Monday credit after a Friday instruction is consistent with business-day timelines.",
            "There is no evidence of deliberate delay; the timeline follows the scheme calendar.",
            "SCT operates on business days, not weekly batches."
          ]
        },
        {
          "id": "px-02-02",
          "domain": "rails",
          "chapter": "ch61",
          "question": "An SCT payment is rejected by the beneficiary bank because the account number is invalid. Who must be told, and what happens to the funds?",
          "options": [
            "Nobody is told and the funds are kept by the beneficiary bank.",
            "The payer must discover the failure from a statement weeks later.",
            "The funds are credited to a suspense account permanently.",
            "The payer bank is informed through the scheme reject flow and the funds are not credited to the wrong account."
          ],
          "answer": 3,
          "explanation": "A reject means the payment instruction could not be processed and the beneficiary bank does not credit the account. The scheme defines a reject flow so the payer bank learns of the failure and can inform its customer. The payer can then correct the details and resend.",
          "why_wrong": [
            "Scheme rules require the failure to be communicated back through the chain.",
            "The reject flow exists precisely so the payer bank learns promptly.",
            "Suspense handling is an internal matter; the scheme outcome is rejection, not permanent retention.",
            ""
          ]
        },
        {
          "id": "px-02-03",
          "domain": "operations",
          "chapter": "ch61",
          "question": "A corporate sends the same SCT file twice by mistake. The payer bank's system processes both files. What is the correct expert assessment?",
          "options": [
            "Duplicate detection is the beneficiary bank's problem only.",
            "Duplicates are impossible in SCT because the scheme prevents them.",
            "The customer must accept the double payment as final.",
            "The payer bank should have duplicate controls, and the duplicate payment may need a recall request to recover funds."
          ],
          "answer": 3,
          "explanation": "Duplicate file and payment detection is a key control at the originating bank, using references, amounts and value dates. Once a duplicate has been credited, recovery normally requires a recall request to the beneficiary bank, which depends on the beneficiary's consent. Prevention through controls is far better than recovery after the event.",
          "why_wrong": [
            "The originating bank has the first opportunity and duty to detect duplicates.",
            "The scheme does not make duplicates impossible; controls must catch them.",
            "Recall provides a route to request recovery; the outcome depends on the beneficiary bank and customer.",
            ""
          ]
        },
        {
          "id": "px-02-04",
          "domain": "rails",
          "chapter": "ch61",
          "question": "An SCT payment carries an incorrect beneficiary name but a correct IBAN. Under the scheme's general approach, which element normally drives routing and crediting?",
          "options": [
            "The IBAN is the key identifier used to route and credit the payment.",
            "The name alone determines the account to credit.",
            "The remittance information determines the beneficiary account.",
            "The payer's instruction reference determines the account."
          ],
          "answer": 0,
          "explanation": "In SEPA credit transfers the IBAN identifies the account to be credited. Name matching services may help the payer check details before sending, but the IBAN remains the account identifier for processing. That is why IBAN validation before release is a critical control.",
          "why_wrong": [
            "",
            "The name is supporting information, not the account identifier.",
            "Remittance information explains the purpose of the payment, not the destination account.",
            "The reference identifies the instruction, not the beneficiary account."
          ]
        },
        {
          "id": "px-02-05",
          "domain": "operations",
          "chapter": "ch41",
          "question": "A payer claims an SCT payment never arrived. The payer bank's trace shows it was sent and accepted by the beneficiary bank. What is the right next step?",
          "options": [
            "Tell the payer the payment is lost and refund immediately without checking.",
            "Raise a scheme investigation to confirm the credit status with the beneficiary bank before deciding on next steps.",
            "Send the payment again immediately without any check.",
            "Close the case because the trace proves delivery to the customer."
          ],
          "answer": 1,
          "explanation": "Acceptance by the beneficiary bank does not by itself prove the customer account was credited. A scheme investigation or status query establishes what happened at the beneficiary bank, including whether the payment was credited, held or returned. Only with that evidence can the bank decide whether to refund, resend or explain.",
          "why_wrong": [
            "A refund without evidence may pay twice if the original was in fact credited.",
            "",
            "Resending without checking risks a duplicate credit.",
            "The trace shows interbank acceptance, not final credit to the beneficiary account."
          ]
        },
        {
          "id": "px-02-06",
          "domain": "rails",
          "chapter": "ch61",
          "question": "A bank is designing its SCT cutoff handling. Why do cutoff times matter so much for SCT execution?",
          "options": [
            "Cutoffs decide the currency of the payment.",
            "Cutoffs decide whether an instruction counts as received today or on the next business day.",
            "Cutoffs are only relevant for paper cheques.",
            "Cutoffs determine the beneficiary's account type."
          ],
          "answer": 1,
          "explanation": "The time an instruction is received relative to the cutoff determines the value date and the start of the execution timeline. An instruction received after cutoff is treated as received on the next business day. Clear cutoff communication prevents customer disputes about when funds should arrive.",
          "why_wrong": [
            "Currency is determined by the instruction, not by the cutoff.",
            "",
            "Cutoffs apply to electronic payment schemes as well as paper instruments.",
            "Account type is a property of the beneficiary account, not of the cutoff."
          ]
        },
        {
          "id": "px-02-07",
          "domain": "compliance",
          "chapter": "ch61",
          "question": "An SCT payment is stopped for sanctions screening and the screening result is a genuine match. What should the bank do?",
          "options": [
            "Release the payment to avoid breaching the scheme timeline.",
            "Return the payment without recording the screening outcome.",
            "Ask the payer to resend with a different beneficiary name.",
            "Follow sanctions obligations, which override scheme timing, and handle the payment per the sanctions regime."
          ],
          "answer": 3,
          "explanation": "Sanctions obligations are legal duties that override scheme execution timelines. A genuine match must be handled according to the applicable sanctions regime, which may require blocking or reporting. Releasing the payment to meet a timeline would breach the law.",
          "why_wrong": [
            "Scheme timelines never justify releasing a sanctioned payment.",
            "Screening outcomes must be recorded for audit and compliance.",
            "Altering beneficiary details to evade screening is a serious compliance breach.",
            ""
          ]
        },
        {
          "id": "px-02-08",
          "domain": "rails",
          "chapter": "ch93",
          "question": "A fintech wants to offer SCT payments but is not a bank. What is the normal route for it to participate in the scheme?",
          "options": [
            "It must become a central bank.",
            "It can join the scheme with no bank relationship at all.",
            "It participates through a scheme participant bank or as a payment institution that meets scheme eligibility and uses a sponsor or direct arrangement as allowed.",
            "It can only offer SCT through card networks."
          ],
          "answer": 2,
          "explanation": "Non-bank payment institutions can access SEPA schemes where eligibility allows, often through sponsorship or agency arrangements with a participant bank that handles clearing and settlement. The arrangement must satisfy scheme rules on safeguarding, settlement and compliance. Direct participation depends on the scheme's eligibility criteria.",
          "why_wrong": [
            "Becoming a central bank is not the route to scheme participation.",
            "Settlement and clearing require banking arrangements; no relationship at all is not viable.",
            "",
            "SCT is an account-to-account scheme, not a card network product."
          ]
        },
        {
          "id": "px-02-09",
          "domain": "operations",
          "chapter": "ch61",
          "question": "An SCT return arrives after the beneficiary account was closed. What does the return signify?",
          "options": [
            "The payment was rejected before any credit attempt.",
            "The payer cancelled the payment before it was sent.",
            "The payment could not remain credited and the funds are being sent back under the scheme return rules.",
            "The clearing mechanism lost the payment."
          ],
          "answer": 2,
          "explanation": "A return happens after the payment has been processed and the beneficiary bank cannot complete the credit, for example because the account is closed. The funds are returned to the payer bank under the scheme return rules with a reason code. This differs from a reject, which happens before credit.",
          "why_wrong": [
            "A pre-credit failure is a reject, not a return.",
            "A payer cancellation before sending would prevent the payment from entering the scheme.",
            "",
            "A return is a defined scheme flow, not evidence of a lost payment."
          ]
        },
        {
          "id": "px-02-10",
          "domain": "rails",
          "chapter": "ch61",
          "question": "A bank's SCT recall request is refused by the beneficiary bank. What is the most accurate statement about the payer bank's position?",
          "options": [
            "The payer bank can force the debit from the beneficiary account.",
            "The recall depends on the beneficiary bank and beneficiary; refusal means the payer bank must pursue other remedies and explain the position to its customer.",
            "The scheme guarantees recall success in all cases.",
            "The payer bank must absorb the loss automatically."
          ],
          "answer": 1,
          "explanation": "A recall is a request, not a right to debit another bank's customer. The beneficiary bank checks with its customer, and consent is normally required before funds are returned. If the recall is refused, the payer bank must explain the outcome and consider legal or other remedies available to its customer.",
          "why_wrong": [
            "No bank can unilaterally debit another bank's customer account.",
            "",
            "Recall success is never guaranteed; it depends on consent and the circumstances.",
            "Loss allocation depends on the facts and the scheme rules, not automatic absorption."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-03",
        "title": "Payments Expert Test 3: SDD Core and B2B in Depth",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-03-01",
          "domain": "rails",
          "chapter": "ch62",
          "question": "A company wants to collect recurring payments by SDD Core. What must it hold before the first collection?",
          "options": [
            "Only the debtor's IBAN, with no authorisation needed.",
            "A signed mandate from the debtor authorising the collections.",
            "A credit card number for the debtor.",
            "Approval from the debtor's employer."
          ],
          "answer": 1,
          "explanation": "SDD is a pull payment: the creditor may only collect under a mandate given by the debtor. The mandate authorises the creditor to collect and the debtor bank to debit the account. Without a valid mandate, the collection has no basis under the scheme.",
          "why_wrong": [
            "An IBAN alone does not authorise a debit; the mandate is the authorisation.",
            "",
            "Card details are irrelevant to a direct debit mandate.",
            "An employer has no role in a debtor's direct debit mandate."
          ]
        },
        {
          "id": "px-03-02",
          "domain": "rails",
          "chapter": "ch62",
          "question": "A debtor disputes an SDD Core collection, saying the amount was higher than expected. What refund right does the Core scheme generally give the debtor?",
          "options": [
            "No refund right at all once the debit is made.",
            "A no-questions-asked refund right for authorised collections within the scheme refund period.",
            "A refund only if the creditor admits fraud.",
            "A refund only through a court order."
          ],
          "answer": 1,
          "explanation": "SDD Core gives debtors a broad refund right for authorised collections within the defined period, without needing to prove the collection was wrong. This consumer protection is a defining feature of the Core scheme. Unauthorised collections carry a longer refund period.",
          "why_wrong": [
            "Core debtors do have refund rights after a debit.",
            "",
            "The Core refund right does not depend on the creditor admitting fraud.",
            "The scheme refund route does not require court action."
          ]
        },
        {
          "id": "px-03-03",
          "domain": "rails",
          "chapter": "ch62",
          "question": "How does the SDD B2B scheme differ most importantly from SDD Core for the debtor?",
          "options": [
            "B2B debtors waive the no-questions-asked refund right and the debtor bank must verify the mandate before debiting.",
            "B2B is only for consumer debtors.",
            "B2B has no mandates at all.",
            "B2B collections are always in cash."
          ],
          "answer": 0,
          "explanation": "SDD B2B is designed for business debtors who agree to stronger controls and give up the Core no-questions-asked refund right. The debtor bank must check the mandate data against what the debtor has agreed before debiting. This makes B2B suited to business-to-business relationships with agreed terms.",
          "why_wrong": [
            "",
            "B2B is for business debtors, not consumers.",
            "Mandates are central to B2B; the debtor bank verifies them.",
            "B2B is an electronic scheme, not a cash arrangement."
          ]
        },
        {
          "id": "px-03-04",
          "domain": "operations",
          "chapter": "ch62",
          "question": "A creditor changes its bank but keeps collecting from the same debtors. What must happen to the mandates?",
          "options": [
            "All mandates become void and every debtor must sign a new paper mandate.",
            "Mandates transfer automatically with no action or notification at all.",
            "The old bank keeps collecting on the creditor's behalf forever.",
            "The mandates can normally continue with the creditor identifier and mandate references handled per scheme rules, with debtors informed as required."
          ],
          "answer": 3,
          "explanation": "A change of creditor bank does not automatically void mandates, but the creditor identifier and collection arrangements must be handled correctly under the scheme rules. Debtors must be informed as required so they recognise the new collections. Careful migration avoids rejects and disputes.",
          "why_wrong": [
            "Mandates do not automatically become void on a bank change.",
            "Migration requires correct handling and debtor notification, not no action.",
            "The old bank does not keep collecting indefinitely after the creditor moves.",
            ""
          ]
        },
        {
          "id": "px-03-05",
          "domain": "rails",
          "chapter": "ch62",
          "question": "A debtor bank receives an SDD collection with a mandate reference that does not match any mandate it holds. What should it do?",
          "options": [
            "Reject or return the collection under the scheme rules, since no valid mandate supports the debit.",
            "Debit the account anyway and check later.",
            "Pay the creditor from its own funds.",
            "Ignore the mismatch because the amount is small."
          ],
          "answer": 0,
          "explanation": "The mandate is the authority for the debit. If no matching mandate exists, the debtor bank must not debit the account and must handle the collection through the scheme reject or return flow. Debiting without authority would breach the debtor's rights and the scheme rules.",
          "why_wrong": [
            "",
            "Debiting without a mandate breaches the debtor's rights.",
            "The bank must not pay from its own funds for an unauthorised collection.",
            "Amount size does not remove the need for a valid mandate."
          ]
        },
        {
          "id": "px-03-06",
          "domain": "operations",
          "chapter": "ch62",
          "question": "A creditor sends SDD collections without pre-notifying debtors of the amount and date. What risk does this create?",
          "options": [
            "No risk, because pre-notification is optional decoration.",
            "Debtors may dispute the collections, and the creditor breaches the scheme duty to pre-notify.",
            "The collections will settle twice as fast.",
            "The debtor bank will pay the creditor extra compensation."
          ],
          "answer": 1,
          "explanation": "Pre-notification lets the debtor know what will be debited and when, so they can ensure funds are available and spot errors. The scheme requires the creditor to pre-notify, and failure to do so increases disputes, returns and refund claims. It is a core creditor obligation, not an optional courtesy.",
          "why_wrong": [
            "Pre-notification is a scheme duty, not decoration.",
            "",
            "Skipping pre-notification does not speed up settlement.",
            "There is no compensation for skipping pre-notification; the opposite risk applies."
          ]
        },
        {
          "id": "px-03-07",
          "domain": "rails",
          "chapter": "ch62",
          "question": "An SDD collection is returned with reason code for insufficient funds. The creditor wants to retry. What is the correct approach?",
          "options": [
            "Retry immediately dozens of times on the same day.",
            "Convert the collection into an SCT payment without consent.",
            "Retry in line with the mandate terms, pre-notification and any agreed retry approach, considering the debtor's position.",
            "Debit a different account belonging to the debtor without a mandate."
          ],
          "answer": 2,
          "explanation": "Retries must respect the mandate, the agreed collection terms and pre-notification duties. Repeated same-day retries can cause repeated charges and disputes, and may breach the agreement with the debtor. A measured retry, often after contacting the debtor, is the professional approach.",
          "why_wrong": [
            "Excessive same-day retries harm the debtor and risk disputes.",
            "An SCT is a payer push; the creditor cannot convert a debit into one without consent.",
            "",
            "A mandate covers a specific account; debiting another account has no authority."
          ]
        },
        {
          "id": "px-03-08",
          "domain": "compliance",
          "chapter": "ch62",
          "question": "A debtor claims an SDD collection was never authorised. The creditor produces a mandate, but the debtor says the signature is forged. What is the right handling?",
          "options": [
            "The creditor's word settles the matter with no investigation.",
            "The debtor bank must refuse all future mandates from that creditor.",
            "The claim must be investigated as an unauthorised transaction, with the mandate evidence examined and the scheme refund rules applied.",
            "The debtor must prove forgery in court before any refund."
          ],
          "answer": 2,
          "explanation": "An unauthorised claim triggers the scheme and legal protections for the debtor, including extended refund rights for unauthorised collections. The mandate evidence must be examined rather than assumed valid. The bank and creditor must follow the defined investigation and refund process.",
          "why_wrong": [
            "A produced mandate must be examined; the creditor's word alone does not settle it.",
            "A blanket refusal of all future mandates is not the defined response to one dispute.",
            "",
            "Scheme refund processes operate without requiring the debtor to litigate first."
          ]
        },
        {
          "id": "px-03-09",
          "domain": "operations",
          "chapter": "ch62",
          "question": "A creditor's SDD file contains a first collection and a recurring collection with the same mandate reference. Why does the scheme distinguish sequence types?",
          "options": [
            "Sequence types are decorative and have no processing effect.",
            "They determine the currency of the collection.",
            "They tell the debtor bank whether this is the first, a recurring, a final or a one-off collection, which affects validation and mandate handling.",
            "They set the interest rate on the debtor account."
          ],
          "answer": 2,
          "explanation": "Sequence types (first, recurring, final, one-off) help the debtor bank validate the collection against the mandate lifecycle. A first collection triggers mandate checks, while a final collection signals the end of a series. Correct sequence handling prevents rejects and mandate mismatches.",
          "why_wrong": [
            "Sequence types drive validation and mandate handling.",
            "Currency is carried in the amount fields, not the sequence type.",
            "",
            "Sequence types have no effect on account interest rates."
          ]
        },
        {
          "id": "px-03-10",
          "domain": "rails",
          "chapter": "ch62",
          "question": "A business debtor signed up for SDD B2B but its bank debited an amount above the agreed maximum. What protection does B2B give the debtor here?",
          "options": [
            "None, because B2B debtors have no rights at all.",
            "The debtor bank should have verified the collection against the agreed mandate terms, and the debtor can raise the breach through the bank and scheme processes.",
            "The debtor must pay and cannot raise the issue.",
            "Only the creditor can complain about the amount."
          ],
          "answer": 1,
          "explanation": "B2B protection comes upfront: the debtor bank verifies mandate data, which can include agreed limits, before debiting. If a collection exceeds the agreed terms, the verification should have caught it, and the debtor can raise the failure through the bank. Waiving the no-questions-asked refund does not remove all protections.",
          "why_wrong": [
            "B2B debtors retain protections through upfront mandate verification.",
            "",
            "The debtor can raise a collection that breaches the agreed terms.",
            "The debtor is the party harmed and can raise the issue."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-04",
        "title": "Payments Expert Test 4: TARGET Services: T2 in Depth",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-04-01",
          "domain": "rails",
          "chapter": "ch56",
          "question": "A bank's treasurer asks why T2 settlement is described as settlement in central bank money. What does that mean in practice?",
          "options": [
            "The central bank guarantees every commercial payment in full.",
            "The payment is settled in physical cash at the central bank.",
            "The payment bypasses all bank accounts entirely.",
            "The payment settles across accounts held at the central bank, giving finality with the lowest credit risk."
          ],
          "answer": 3,
          "explanation": "Central bank money means the settlement asset is a claim on the central bank, held as balances in central bank accounts. Settlement across those accounts is final and carries no commercial bank credit risk on the settlement leg. This is why large-value systems settle in central bank money.",
          "why_wrong": [
            "The central bank does not guarantee the underlying commercial obligation.",
            "Settlement is electronic across accounts, not physical cash.",
            "Settlement moves balances between central bank accounts held for banks.",
            ""
          ]
        },
        {
          "id": "px-04-02",
          "domain": "rails",
          "chapter": "ch56",
          "question": "T2 processes payments on a real-time gross settlement basis. What is the key consequence for a bank's liquidity?",
          "options": [
            "Payments are netted so no liquidity is ever needed.",
            "Liquidity needs are identical to a deferred net settlement system.",
            "Banks never need to monitor intraday balances in T2.",
            "Each payment settles individually and in full, so the bank needs sufficient funds for each payment when it settles."
          ],
          "answer": 3,
          "explanation": "In gross settlement each payment is settled individually for its full value, in real time, if funds are available. The bank must therefore have enough liquidity at the moment each payment is presented. Queuing and optimisation tools help, but the gross nature drives intraday liquidity demand.",
          "why_wrong": [
            "Netting is the opposite model; gross settlement does not net payments.",
            "Gross settlement typically needs more intraday liquidity than net settlement.",
            "Intraday monitoring is essential precisely because settlement is gross and real time.",
            ""
          ]
        },
        {
          "id": "px-04-03",
          "domain": "operations",
          "chapter": "ch56",
          "question": "A T2 payment is queued because the sending bank lacks funds at that moment. What happens next in a well-run operation?",
          "options": [
            "The payment is cancelled immediately with no retry.",
            "The central bank pays it from its own funds as a gift.",
            "The payment waits in the queue and may settle when funds arrive or through optimisation, while the bank monitors and manages liquidity.",
            "The payment is converted into a card transaction."
          ],
          "answer": 2,
          "explanation": "Queuing holds a payment that cannot settle yet, giving the bank time to fund its account or benefit from incoming payments. Optimisation mechanisms can resolve queues by finding offsetting payments. Active monitoring ensures the bank funds the queue before cutoffs.",
          "why_wrong": [
            "Queued payments are held for settlement, not cancelled at once.",
            "The central bank does not fund queued payments as a gift.",
            "",
            "A queued RTGS payment is not converted into a card transaction."
          ]
        },
        {
          "id": "px-04-04",
          "domain": "architecture",
          "chapter": "ch57",
          "question": "A bank is implementing T2 addressing and must choose how to identify parties. Why does correct addressing matter so much in T2?",
          "options": [
            "Addressing only affects the font used on statements.",
            "Addressing determines the payment amount.",
            "Correct BIC and account identification routes the payment to the right participant and settlement account.",
            "Addressing is only needed for paper instructions."
          ],
          "answer": 2,
          "explanation": "T2 routing and settlement depend on identifying the correct participant and account. Errors in BICs or account references can misroute payments, cause rejects or delay settlement. Addressing data must be maintained accurately and validated before release.",
          "why_wrong": [
            "Addressing drives routing and settlement, not statement formatting.",
            "The amount is carried separately from addressing data.",
            "",
            "Electronic RTGS payments depend heavily on correct addressing."
          ]
        },
        {
          "id": "px-04-05",
          "domain": "rails",
          "chapter": "ch56",
          "question": "A bank holds both a main cash account and dedicated cash accounts in TARGET services. Why would it separate liquidity across accounts?",
          "options": [
            "To make reconciliation impossible.",
            "To avoid all liquidity reporting.",
            "To increase the total amount of money it holds.",
            "To ring-fence liquidity for different services, such as T2 payments, T2S securities settlement and TIPS instant payments."
          ],
          "answer": 3,
          "explanation": "Dedicated cash accounts let a bank allocate liquidity to each TARGET service according to its needs. This separation supports control, monitoring and the different operating hours and purposes of each service. Liquidity can be transferred between accounts as needs change during the day.",
          "why_wrong": [
            "Separation supports control and reporting; it does not aim to prevent reconciliation.",
            "Liquidity reporting still applies across all accounts.",
            "Separating accounts does not create additional money; it allocates existing liquidity.",
            ""
          ]
        },
        {
          "id": "px-04-06",
          "domain": "operations",
          "chapter": "ch56",
          "question": "Near the T2 end-of-day cutoff, a bank still has queued payments and a low balance. What is the most urgent action?",
          "options": [
            "Ignore the queue until tomorrow.",
            "Actively fund the account, prioritise critical payments and escalate to treasury before the cutoff.",
            "Cancel all customer payments without telling anyone.",
            "Send the payments again as new instructions."
          ],
          "answer": 1,
          "explanation": "Queued payments that cannot settle by cutoff will fail, with consequences for customers and counterparties. Treasury must fund the account or reprioritise, and operations must escalate early enough to act. Waiting until after cutoff removes the chance to settle.",
          "why_wrong": [
            "Ignoring the queue guarantees settlement failures at cutoff.",
            "",
            "Cancelling without communication breaches customer and counterparty duties.",
            "Resending duplicates the queue problem and does not create funds."
          ]
        },
        {
          "id": "px-04-07",
          "domain": "rails",
          "chapter": "ch56",
          "question": "A payment settles in T2 and the sending bank later discovers an error in the amount. What does settlement finality imply?",
          "options": [
            "The settled payment cannot be unilaterally reversed; recovery requires agreement or a separate return flow.",
            "The central bank will automatically reverse any erroneous settlement.",
            "Finality only applies on business days and lapses overnight.",
            "The receiving bank must return the funds without being asked."
          ],
          "answer": 0,
          "explanation": "Settlement finality means a settled payment is irrevocable and unconditional at the point defined by the system rules. Errors must be corrected through agreed mechanisms, such as a return or a new compensating payment, not by unilaterally undoing settlement. This certainty is fundamental to RTGS design.",
          "why_wrong": [
            "",
            "The central bank does not automatically reverse settled payments for amount errors.",
            "Finality does not lapse overnight; it is a legal property of the settlement.",
            "Return requires a request and the receiving bank's action under the applicable rules."
          ]
        },
        {
          "id": "px-04-08",
          "domain": "architecture",
          "chapter": "ch56",
          "question": "A bank is connecting to T2 through a new interface. Why is ISO 20022 message compliance critical for this connection?",
          "options": [
            "ISO 20022 is only a recommendation for T2.",
            "T2 accepts any file format without validation.",
            "Message standards only matter for customer statements.",
            "T2 uses ISO 20022 messages, so non-compliant messages will be rejected or misprocessed."
          ],
          "answer": 3,
          "explanation": "TARGET services operate on ISO 20022 messages with defined usage guidelines and validations. Messages that do not comply with the required version and rules will fail validation and be rejected. Compliance must be proven through testing and certification before go-live.",
          "why_wrong": [
            "ISO 20022 usage in T2 is mandatory, not a recommendation.",
            "T2 validates messages strictly; arbitrary formats are not accepted.",
            "Message standards govern the payment instructions themselves, not only statements.",
            ""
          ]
        },
        {
          "id": "px-04-09",
          "domain": "operations",
          "chapter": "ch57",
          "question": "A bank's T2 reference data for a counterparty BIC is outdated. What is the most likely operational impact?",
          "options": [
            "No impact, because BICs never change.",
            "Payments will automatically find the new BIC.",
            "Only the statement narrative will be affected.",
            "Payments may be rejected, misrouted or delayed until the reference data is corrected."
          ],
          "answer": 3,
          "explanation": "BICs and participant data change over time as banks merge, rename or restructure. Outdated reference data causes validation failures, misrouting or delays. Reference data must be refreshed from authoritative sources and validated before payments are released.",
          "why_wrong": [
            "BICs and participant data do change and must be maintained.",
            "There is no automatic correction; the sending bank must hold correct data.",
            "Routing and settlement depend on correct reference data, not only narratives.",
            ""
          ]
        },
        {
          "id": "px-04-10",
          "domain": "rails",
          "chapter": "ch56",
          "question": "T2, T2S and TIPS are all TARGET services. What best distinguishes TIPS from T2 in purpose?",
          "options": [
            "TIPS settles instant payments continuously, while T2 is the RTGS system for large-value and time-critical payments.",
            "TIPS is only for securities settlement.",
            "T2 handles only retail card payments.",
            "There is no difference; they are the same system."
          ],
          "answer": 0,
          "explanation": "TIPS is designed for instant payments with continuous, round-the-clock settlement in central bank money. T2 is the real-time gross settlement system for large-value payments, including time-critical and interbank flows. T2S handles securities settlement. Each service has a distinct purpose within TARGET services.",
          "why_wrong": [
            "",
            "Securities settlement is the role of T2S, not TIPS.",
            "T2 is a large-value RTGS system, not a retail card system.",
            "The three services have distinct purposes and operating models."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-05",
        "title": "Payments Expert Test 5: TIPS Instant Payments in Depth",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-05-01",
          "domain": "rails",
          "chapter": "ch59",
          "question": "A customer sends an instant payment at 2am on a Sunday through TIPS. Why can it settle immediately?",
          "options": [
            "Because Sunday payments are processed manually by central bank staff.",
            "Because TIPS operates continuously, including outside normal banking hours.",
            "Because instant payments do not need settlement.",
            "Because the payment is settled the following Monday but shown early."
          ],
          "answer": 1,
          "explanation": "TIPS is designed for continuous operation so instant payments can settle at any time, including nights, weekends and holidays. Settlement happens in central bank money in real time. This continuous availability is what makes the payment truly instant for the end customer.",
          "why_wrong": [
            "TIPS settlement is automated, not manual.",
            "",
            "Instant payments do settle; TIPS provides the settlement.",
            "The settlement is real and immediate, not a display advance."
          ]
        },
        {
          "id": "px-05-02",
          "domain": "rails",
          "chapter": "ch59",
          "question": "An instant payment via TIPS times out with no confirmation. The payer bank does not know if the beneficiary was credited. What is the correct handling?",
          "options": [
            "Assume the payment failed and resend immediately.",
            "Assume it succeeded and close the case.",
            "Use the scheme investigation and status query process to establish the outcome before resending or refunding.",
            "Debit the payer again to be safe."
          ],
          "answer": 2,
          "explanation": "A timeout creates uncertainty: the payment may have settled, failed or still be processing. Resending blindly risks a duplicate credit, and assuming success risks leaving the payer without funds. The investigation process establishes the true outcome so the bank can act correctly.",
          "why_wrong": [
            "Resending without checking risks duplicating the payment.",
            "Assuming success without evidence leaves uncertainty unresolved.",
            "",
            "Debiting again compounds the problem and may double-charge the payer."
          ]
        },
        {
          "id": "px-05-03",
          "domain": "operations",
          "chapter": "ch59",
          "question": "A bank's TIPS dedicated cash account runs low on a Saturday night. Why is this more urgent than a low balance on a weekday morning?",
          "options": [
            "Because liquidity transfers may be harder outside T2 operating hours, so the bank must pre-fund for continuous operation.",
            "Because TIPS does not need liquidity at weekends.",
            "Because customers never pay at weekends.",
            "Because the central bank tops up accounts automatically at weekends."
          ],
          "answer": 0,
          "explanation": "TIPS settles continuously, but funding it depends on liquidity transfers that may follow T2 hours and processes. Banks must therefore plan and pre-fund their TIPS accounts to cover weekend and overnight instant payment flows. Running dry stops the bank from settling outgoing instant payments.",
          "why_wrong": [
            "",
            "TIPS settlement always needs funded accounts, including at weekends.",
            "Instant payment demand continues at weekends and overnight.",
            "There is no automatic weekend top-up; the bank must manage its own funding."
          ]
        },
        {
          "id": "px-05-04",
          "domain": "rails",
          "chapter": "ch59",
          "question": "A TIPS payment is rejected by the beneficiary bank within seconds. What does the payer bank owe its customer?",
          "options": [
            "Nothing, because instant payments have no customer communication duty.",
            "Prompt notification that the payment failed and that funds were not transferred, with the reason where appropriate.",
            "A refund after a month-long investigation.",
            "A new payment sent without the customer's consent."
          ],
          "answer": 1,
          "explanation": "Instant payment schemes require fast feedback: the payer must learn quickly whether the payment succeeded or failed. The payer bank should notify the customer promptly so they can correct details or choose another route. Delayed or missing feedback defeats the purpose of instant payments.",
          "why_wrong": [
            "Customer communication is a core duty for instant payments.",
            "",
            "A month-long wait contradicts the instant payment proposition.",
            "Sending a new payment without consent would be unauthorised."
          ]
        },
        {
          "id": "px-05-05",
          "domain": "architecture",
          "chapter": "ch59",
          "question": "A bank is designing its instant payment platform. Why must its fraud and sanctions checks run in milliseconds rather than batch?",
          "options": [
            "Because instant payments settle in seconds, so checks must complete within the scheme timeout or payments will fail.",
            "Because batch checks are illegal for all payments.",
            "Because fraud checks are not needed for instant payments.",
            "Because sanctions lists only update in real time."
          ],
          "answer": 0,
          "explanation": "Instant payment schemes impose short end-to-end timeouts. Screening, fraud scoring and balance checks must all complete within that window, or the payment times out. This forces real-time, highly available check designs rather than overnight batch processing.",
          "why_wrong": [
            "",
            "Batch checks remain valid for many payment types; instant payments specifically need real-time checks.",
            "Fraud and sanctions checks are essential for instant payments.",
            "List update frequency is separate from the need for real-time screening."
          ]
        },
        {
          "id": "px-05-06",
          "domain": "rails",
          "chapter": "ch59",
          "question": "A beneficiary bank receives a TIPS payment but its core banking system is down. What should happen to the payment?",
          "options": [
            "It is rejected or timed out per scheme rules, since the beneficiary bank cannot credit the account, and the payer bank is informed.",
            "It is accepted anyway and the credit is invented later.",
            "It is held indefinitely with no response.",
            "It is credited to a random account."
          ],
          "answer": 0,
          "explanation": "If the beneficiary bank cannot credit the account, it must reject the payment or let it time out under the scheme rules, so the payer bank learns the outcome. Accepting without the ability to credit would create a liability the bank cannot fulfil. Prompt rejection protects both the payer and the integrity of the scheme.",
          "why_wrong": [
            "",
            "Accepting without the ability to credit creates an unfulfilled liability.",
            "Holding indefinitely breaches scheme timeouts and leaves the payer in uncertainty.",
            "Crediting a random account would be a serious error."
          ]
        },
        {
          "id": "px-05-07",
          "domain": "operations",
          "chapter": "ch59",
          "question": "A bank wants to offer instant payments to corporates with high-value transactions. What must it check first?",
          "options": [
            "Whether the corporate likes the colour of the app.",
            "Whether the scheme and its own limits support the transaction amounts it plans to offer.",
            "Whether the payment can bypass all controls.",
            "Whether the central bank will process it manually."
          ],
          "answer": 1,
          "explanation": "Instant payment schemes and bank implementations carry amount limits and risk controls. A bank must confirm the scheme maximum, its own configured limits and its liquidity capacity before promising high-value instant payments. Offering amounts above the supported limits guarantees rejects.",
          "why_wrong": [
            "App appearance is irrelevant to scheme amount limits.",
            "",
            "Controls cannot be bypassed for high-value payments.",
            "TIPS processing is automated; manual central bank processing is not the model."
          ]
        },
        {
          "id": "px-05-08",
          "domain": "rails",
          "chapter": "ch74",
          "question": "How does TIPS differ from a deferred net settlement instant scheme in terms of settlement risk?",
          "options": [
            "TIPS builds up more settlement risk because it is faster.",
            "Deferred net settlement has no risk at all.",
            "TIPS settles only once a day.",
            "TIPS settles each payment in central bank money immediately, so interbank settlement risk does not build up between cycles."
          ],
          "answer": 3,
          "explanation": "Immediate gross settlement in central bank money means each payment is final as it settles, with no exposure building up between settlement cycles. Deferred net systems accumulate exposures until the net settlement occurs. The trade-off is higher intraday liquidity demand for immediate settlement.",
          "why_wrong": [
            "Speed with immediate settlement reduces, not increases, interbank exposure.",
            "Deferred net settlement carries exposure until the net settles.",
            "TIPS settles continuously, not once a day.",
            ""
          ]
        },
        {
          "id": "px-05-09",
          "domain": "operations",
          "chapter": "ch59",
          "question": "A bank's TIPS liquidity transfer from its main account fails. What is the immediate operational risk?",
          "options": [
            "The bank may be unable to settle outgoing instant payments until funding is restored.",
            "No risk, because TIPS works without liquidity.",
            "Only incoming payments are affected.",
            "The bank's card portfolio stops working."
          ],
          "answer": 0,
          "explanation": "Outgoing TIPS payments settle from the dedicated cash account. If funding fails and the balance is insufficient, outgoing payments will be rejected or queued. Incoming payments can still arrive, but the bank cannot send until liquidity is restored.",
          "why_wrong": [
            "",
            "TIPS settlement requires funded accounts.",
            "Incoming payments credit the account; outgoing payments are the ones blocked by low funds.",
            "Card processing is a separate system from TIPS liquidity."
          ]
        },
        {
          "id": "px-05-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is documenting TIPS timeout handling. Which requirement best captures the expert approach?",
          "options": [
            "On timeout, always assume failure.",
            "On timeout, delete the payment record.",
            "On timeout, wait for the customer to complain.",
            "On timeout, mark the payment as uncertain, trigger an automated status investigation, and block duplicate resends until the outcome is known."
          ],
          "answer": 3,
          "explanation": "Timeout means unknown, not failed. The system must preserve the payment state as uncertain, investigate automatically and prevent duplicate resends that could double-pay. This design protects the customer and the bank from the most damaging timeout outcome, an accidental duplicate.",
          "why_wrong": [
            "Assuming failure without evidence risks a duplicate if the original settled.",
            "Deleting the record destroys the audit trail and the ability to resolve the payment.",
            "Waiting for complaints leaves the payer in uncertainty and breaches service expectations.",
            ""
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-06",
        "title": "Payments Expert Test 6: ISO 20022 Message Versions and Supplementary Data",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-06-01",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "A bank receives a pacs.008 in a newer ISO 20022 version than its system supports. What is the safest handling?",
          "options": [
            "Process it anyway and ignore unknown elements.",
            "Convert it to an MT message automatically.",
            "Reject or hold it per the usage guidelines, since version mismatch can change meaning and validation.",
            "Strip all new elements and process the remainder."
          ],
          "answer": 2,
          "explanation": "Message versions define the exact schema, fields and rules. Processing a newer version as if it were an older one risks misreading data or missing mandatory information. The safe handling is to reject or hold under the agreed guidelines until the version is supported.",
          "why_wrong": [
            "Ignoring unknown elements risks missing data that changes the payment meaning.",
            "Automatic MT conversion loses ISO 20022 structured data and is not a safe fallback.",
            "",
            "Stripping elements destroys information the sender intended to convey."
          ]
        },
        {
          "id": "px-06-02",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "A scheme allows supplementary data in an ISO 20022 message. What is supplementary data designed for?",
          "options": [
            "Replacing all standard message elements.",
            "Carrying additional information agreed between parties that does not fit the standard message elements.",
            "Hiding payment details from the beneficiary bank.",
            "Carrying the payment amount in a second currency."
          ],
          "answer": 1,
          "explanation": "Supplementary data is an extension point that lets communities carry extra agreed information without changing the base message definition. It must be used under agreed rules so receivers know how to interpret it. It supplements the standard elements rather than replacing them.",
          "why_wrong": [
            "Standard elements remain mandatory; supplementary data adds to them.",
            "",
            "Supplementary data is visible to processing parties; it is not a hiding mechanism.",
            "Amounts belong in the standard amount elements, not in supplementary data."
          ]
        },
        {
          "id": "px-06-03",
          "domain": "messaging",
          "chapter": "ch39",
          "question": "Two banks agree to use a newer pacs.008 version bilaterally, but the clearing system supports only the older version. What must happen?",
          "options": [
            "The banks can ignore the clearing system version.",
            "The clearing system must accept any version.",
            "Messages sent through the clearing system must use the version the clearing system supports, with any conversion handled explicitly and safely.",
            "The banks should stop using the clearing system entirely."
          ],
          "answer": 2,
          "explanation": "Every system in the chain must support the version used. A bilateral agreement between two banks does not bind the clearing system. Version differences require explicit, tested conversion or a common agreed version across the whole chain.",
          "why_wrong": [
            "The clearing system validates what it receives; its version support cannot be ignored.",
            "Clearing systems validate against supported versions and reject others.",
            "",
            "Abandoning the clearing system is not a proportionate response to a version difference."
          ]
        },
        {
          "id": "px-06-04",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "A developer proposes putting unstructured free text into a structured ISO 20022 element to save effort. Why is this a poor design?",
          "options": [
            "It is actually the recommended approach.",
            "Structured elements exist so systems can validate, screen and process data automatically; free text defeats that purpose.",
            "Structured elements cannot hold any text.",
            "Free text is always rejected by all systems."
          ],
          "answer": 1,
          "explanation": "Structured data lets downstream systems validate formats, run sanctions screening on discrete fields, reconcile automatically and apply business rules. Dumping free text into structured elements breaks validation and screening and creates manual work. The effort saved upstream is paid many times downstream.",
          "why_wrong": [
            "Using structured elements correctly is the recommended approach.",
            "",
            "Structured elements hold defined text values; the issue is misuse, not incapacity.",
            "Free text is not always rejected, but it degrades automation and control."
          ]
        },
        {
          "id": "px-06-05",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "An ISO 20022 usage guideline marks an element as mandatory for a scheme, although the base message marks it optional. What must the sender do?",
          "options": [
            "Follow the base message and omit it.",
            "Follow the usage guideline and always populate it for that scheme.",
            "Populate it only when convenient.",
            "Ask the beneficiary to supply it later."
          ],
          "answer": 1,
          "explanation": "Usage guidelines constrain the base message for a specific community or scheme. Where a guideline makes an element mandatory, senders must populate it and receivers may validate against it. The guideline is the operative rule for that scheme, not the looser base definition.",
          "why_wrong": [
            "The usage guideline overrides the base optionality for that scheme.",
            "",
            "Mandatory means always, not when convenient.",
            "The sender is responsible for populating mandatory elements at origination."
          ]
        },
        {
          "id": "px-06-06",
          "domain": "messaging",
          "chapter": "ch39",
          "question": "A bank is migrating from MT to MX messages. Why is field-level mapping documentation critical?",
          "options": [
            "It proves the bank owns the messages.",
            "It is only needed for marketing.",
            "Mapping documents replace testing.",
            "It records how each MT field maps to MX elements, including where data is transformed, dropped or enriched, so behaviour is predictable and testable."
          ],
          "answer": 3,
          "explanation": "MT and MX structures differ, so data must be mapped, transformed or enriched deliberately. Mapping documentation makes those decisions explicit, reviewable and testable. Without it, truncation, loss of remittance data and screening gaps appear without warning.",
          "why_wrong": [
            "Ownership is not the purpose of mapping documentation.",
            "Mapping documents are technical specifications, not marketing material.",
            "Mapping documents support testing; they do not replace it.",
            ""
          ]
        },
        {
          "id": "px-06-07",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "A message fails schema validation because an element contains an invalid code. What is the correct response?",
          "options": [
            "Correct the code silently and process the payment.",
            "Reject the message with a validation error so the sender can fix and resend correctly.",
            "Process it and hope the beneficiary bank fixes it.",
            "Delete the element and process the rest."
          ],
          "answer": 1,
          "explanation": "Schema validation failures mean the message does not conform to the agreed standard. The receiver must reject with a clear error so the sender can correct the source data. Silently fixing or deleting data hides errors and creates inconsistent records across the chain.",
          "why_wrong": [
            "Silent correction hides a sender error and creates inconsistent data.",
            "",
            "Hoping a downstream party fixes the error is not a control.",
            "Deleting validated elements destroys information and breaks the audit trail."
          ]
        },
        {
          "id": "px-06-08",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "A corporate sends a pain.001 with an unsupported character set in the remittance information. What is the most likely consequence?",
          "options": [
            "The payment settles faster.",
            "The message may be rejected or the characters may be corrupted downstream, so character rules must be enforced at origination.",
            "Character sets never matter in ISO 20022.",
            "The beneficiary bank will translate the characters automatically."
          ],
          "answer": 1,
          "explanation": "ISO 20022 usage guidelines define permitted character sets, and characters outside them can cause rejects or corruption as the message passes through systems. Enforcing character rules at origination, with clear feedback to the sender, prevents downstream failures. This is a common and avoidable source of payment errors.",
          "why_wrong": [
            "Unsupported characters cause failures, not faster settlement.",
            "",
            "Character sets matter greatly for validation and downstream processing.",
            "Automatic translation cannot be assumed; corruption is the likely outcome."
          ]
        },
        {
          "id": "px-06-09",
          "domain": "messaging",
          "chapter": "ch39",
          "question": "Why do ISO 20022 messages separate the business application header from the message payload?",
          "options": [
            "To separate routing, identity and processing metadata from the business content, so infrastructure can route and validate without parsing business data.",
            "To make messages longer for no reason.",
            "To hide the sender identity.",
            "To allow duplicate payloads."
          ],
          "answer": 0,
          "explanation": "The header carries metadata such as sender, receiver, message identity and creation time, while the payload carries the business instruction. Infrastructure can route, deduplicate and log using the header alone. This separation supports clean architecture and consistent processing across message types.",
          "why_wrong": [
            "",
            "The separation serves routing and processing, not message length.",
            "The header identifies the sender; it does not hide identity.",
            "Duplication is prevented by message identity, not enabled by the header."
          ]
        },
        {
          "id": "px-06-10",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "A scheme publishes a new version of its usage guidelines with a future effective date. What should a bank's change plan include?",
          "options": [
            "Only a note to the marketing team.",
            "Impact analysis, development, testing with counterparties, reference data updates and a cutover plan before the effective date.",
            "No action until the first reject arrives.",
            "Immediate production deployment on the publication date."
          ],
          "answer": 1,
          "explanation": "Usage guideline changes affect validation, mapping, screening and reconciliation. A proper change plan covers impact analysis, build, testing with counterparties and a controlled cutover before the effective date. This prevents rejects and failed payments when the new rules take effect.",
          "why_wrong": [
            "A marketing note does not prepare systems for a guideline change.",
            "",
            "Waiting for rejects means production failures.",
            "Deploying on publication without testing risks widespread failures."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-07",
        "title": "Payments Expert Test 7: Structured Addresses and Party Identification",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-07-01",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "A cross-border payment carries the beneficiary address as unstructured free text. Why do modern usage guidelines prefer structured addresses?",
          "options": [
            "Structured elements let systems validate, screen and match address components reliably, reducing manual repair.",
            "Structured addresses look nicer on statements.",
            "Unstructured addresses are illegal in all cases.",
            "Structured addresses remove the need for an account number."
          ],
          "answer": 0,
          "explanation": "Structured addresses separate town, country, postcode and street into discrete elements that systems can validate and screen. Free text forces manual interpretation and increases screening false positives and repair rates. Structured data is a foundation for straight-through processing.",
          "why_wrong": [
            "",
            "Appearance is not the reason; automated processing is.",
            "Unstructured addresses remain permitted in some contexts, but structured is preferred.",
            "The account number remains essential; the address does not replace it."
          ]
        },
        {
          "id": "px-07-02",
          "domain": "compliance",
          "chapter": "ch95",
          "question": "A sanctions screening engine flags a payment because the beneficiary town name matches a sanctioned location. The structured country code shows a different, unsanctioned country. What should the analyst do?",
          "options": [
            "Release the payment immediately without review.",
            "Block the payment permanently with no investigation.",
            "Delete the town field and rescreen.",
            "Investigate using all structured fields together, since town names repeat across countries and the full address context matters."
          ],
          "answer": 3,
          "explanation": "Town names are ambiguous across countries, which is exactly why structured addresses carry country codes and other components. The analyst must consider the full address context, the party identity and other evidence before deciding. Neither automatic release nor automatic blocking is sound without that review.",
          "why_wrong": [
            "A screening alert always requires review before release.",
            "Permanent blocking without investigation is disproportionate and may breach customer duties.",
            "Deleting data to force a clean screen is a compliance breach.",
            ""
          ]
        },
        {
          "id": "px-07-03",
          "domain": "messaging",
          "chapter": "ch38",
          "question": "A bank's customer master holds party names in mixed formats with abbreviations. Why does this create payment risk?",
          "options": [
            "It has no effect on payments.",
            "Abbreviations always improve screening.",
            "Inconsistent names cause screening mismatches, failed beneficiary checks and reconciliation breaks.",
            "Customer masters are never used in payments."
          ],
          "answer": 2,
          "explanation": "Payment messages draw party names from customer and reference data. Inconsistent naming produces screening false positives and false negatives, breaks beneficiary verification and complicates reconciliation. Clean, standardised party data is a prerequisite for reliable payment processing.",
          "why_wrong": [
            "Party data quality directly affects payment processing.",
            "Abbreviations increase ambiguity and matching difficulty.",
            "",
            "Customer masters feed payment origination and screening."
          ]
        },
        {
          "id": "px-07-04",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "An ISO 20022 message offers both a structured and a hybrid address option. What is the key rule for using the hybrid option?",
          "options": [
            "Follow the usage guideline rules for which combinations are allowed, so receivers can parse the address predictably.",
            "Mix structured and unstructured elements freely with no rules.",
            "Always prefer hybrid over fully structured.",
            "Hybrid addresses must never include a country code."
          ],
          "answer": 0,
          "explanation": "Hybrid addresses combine structured elements with unstructured lines under defined rules. Usage guidelines specify exactly which combinations are valid so that receivers can parse them consistently. Free mixing creates addresses that fail validation or mislead screening.",
          "why_wrong": [
            "",
            "Hybrid use is governed by rules, not free mixing.",
            "Fully structured addresses are generally preferred where data allows.",
            "Country codes remain important in hybrid addresses."
          ]
        },
        {
          "id": "px-07-05",
          "domain": "messaging",
          "chapter": "ch38",
          "question": "A payment identifies the debtor agent by BIC and the creditor agent by a national clearing code. Why might a chain need both identifier types?",
          "options": [
            "Because different systems and markets use different identifiers, and the message must carry what each processing system needs.",
            "Because BICs are being abolished.",
            "Because national codes are decorative.",
            "Because identifiers are interchangeable with no effect."
          ],
          "answer": 0,
          "explanation": "Global payments cross systems that identify participants differently. BICs serve international routing, while national clearing codes serve domestic systems. Carrying the right identifier for each leg prevents routing failures and manual repair.",
          "why_wrong": [
            "",
            "BICs remain the standard international identifier.",
            "National codes drive domestic routing; they are functional.",
            "Identifiers are not freely interchangeable; each system expects its own."
          ]
        },
        {
          "id": "px-07-06",
          "domain": "compliance",
          "chapter": "ch95",
          "question": "A payment carries a legal entity identifier (LEI) for the corporate payer. What value does the LEI add beyond the company name?",
          "options": [
            "It replaces the need for an account number.",
            "It uniquely identifies the legal entity, reducing ambiguity from similar names and supporting screening and reporting.",
            "It guarantees the payment will settle.",
            "It removes the need for sanctions screening."
          ],
          "answer": 1,
          "explanation": "Company names are ambiguous: similar names, subsidiaries and spelling variants confuse matching. An LEI is a globally unique identifier for a legal entity, which sharpens screening, reporting and reconciliation. It complements, rather than replaces, account and name data.",
          "why_wrong": [
            "The account number remains necessary for crediting.",
            "",
            "An LEI does not affect settlement certainty.",
            "Screening is still required; the LEI improves its accuracy."
          ]
        },
        {
          "id": "px-07-07",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "A bank truncates a long beneficiary name to fit a legacy field limit. What risk does truncation create?",
          "options": [
            "The truncated name may fail screening, mismatch the account holder or cause the beneficiary bank to reject or repair the payment.",
            "No risk, because names are not important.",
            "Truncation always improves processing speed safely.",
            "Truncation is required by all schemes."
          ],
          "answer": 0,
          "explanation": "Truncated names lose information that screening engines and beneficiary banks rely on. A cut-off name may not match the account holder, may screen differently and may trigger repair or rejection. Systems should carry full names within the standard limits and flag data that exceeds them.",
          "why_wrong": [
            "",
            "Names are critical for screening and beneficiary identification.",
            "Any speed gain is outweighed by repair and rejection risk.",
            "Schemes define field limits; silent truncation is not a scheme requirement."
          ]
        },
        {
          "id": "px-07-08",
          "domain": "operations",
          "chapter": "ch38",
          "question": "A corporate customer changes its registered address. The bank updates the core system but not the payment template store. What is the likely consequence?",
          "options": [
            "Payment templates will keep sending the old address until they are refreshed, causing data quality and screening issues.",
            "Payments will automatically use the new address.",
            "Templates are never used for addresses.",
            "The change will be picked up by the clearing system."
          ],
          "answer": 0,
          "explanation": "Payment templates often hold copies of party and address data. If they are not refreshed when master data changes, outgoing messages carry stale addresses. This creates screening mismatches and reconciliation confusion, so template refresh must be part of the master data change process.",
          "why_wrong": [
            "",
            "Templates hold copies and do not update automatically.",
            "Templates commonly store beneficiary and address data.",
            "The clearing system processes what it receives; it does not fix stale addresses."
          ]
        },
        {
          "id": "px-07-09",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "A usage guideline requires the town name and country code as a minimum for structured addresses. Why set a minimum rather than requiring every element?",
          "options": [
            "To make addresses useless.",
            "To balance data quality with what senders can realistically provide, while ensuring the elements most needed for screening and routing are present.",
            "To avoid all validation.",
            "To force senders to use unstructured addresses."
          ],
          "answer": 1,
          "explanation": "Minimum requirements ensure the most critical elements are always present without demanding data senders may not hold. Town and country support screening and geographic checks. Over-demanding requirements would cause widespread rejects from senders with incomplete data.",
          "why_wrong": [
            "Minimum requirements improve address quality; they do not make addresses useless.",
            "",
            "Minimum requirements are themselves a form of validation.",
            "The minimum applies within structured addressing; it does not force unstructured use."
          ]
        },
        {
          "id": "px-07-10",
          "domain": "messaging",
          "chapter": "ch38",
          "question": "A BA is specifying party identification for a new payment product. Which design is most robust?",
          "options": [
            "Name only, with no identifiers.",
            "Free text only, with no validation.",
            "Account number only, with no party data.",
            "Name plus structured address plus standard identifiers where available, validated at entry and stored in a governed master."
          ],
          "answer": 3,
          "explanation": "Robust party identification combines the name, structured address and standard identifiers, all validated when captured and maintained under data governance. This supports screening, routing, reconciliation and reporting. Single-field designs fail as soon as names are ambiguous or data is incomplete.",
          "why_wrong": [
            "Name alone is ambiguous and insufficient for screening and routing.",
            "Unvalidated free text defeats automation and control.",
            "An account number alone cannot support screening or party identification duties.",
            ""
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-08",
        "title": "Payments Expert Test 8: CBPR+ Usage Guidelines and Message Design",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-08-01",
          "domain": "messaging",
          "chapter": "ch8",
          "question": "What is the primary purpose of the CBPR+ usage guidelines for cross-border payments?",
          "options": [
            "To replace all domestic payment systems.",
            "To set foreign exchange rates.",
            "To define how ISO 20022 messages must be used consistently for cross-border payments on the SWIFT network.",
            "To define card interchange fees."
          ],
          "answer": 2,
          "explanation": "CBPR+ usage guidelines constrain the base ISO 20022 messages for cross-border use, defining mandatory elements, code lists and validation rules. Consistent usage across banks enables straight-through processing and reliable screening. Without them, each bank would interpret the base messages differently.",
          "why_wrong": [
            "Domestic systems have their own rules; CBPR+ governs cross-border usage.",
            "Exchange rates are commercial matters, not usage guideline content.",
            "",
            "Card fees are set by card schemes, not CBPR+."
          ]
        },
        {
          "id": "px-08-02",
          "domain": "messaging",
          "chapter": "ch8",
          "question": "A bank sends a CBPR+ payment that omits a mandatory element. What is the expected result?",
          "options": [
            "The receiving bank will invent the missing data.",
            "The payment will settle normally.",
            "The SWIFT network will hold it indefinitely without feedback.",
            "The message will fail validation and be rejected, with an error identifying the problem."
          ],
          "answer": 3,
          "explanation": "Mandatory elements are validated against the usage guidelines. A missing mandatory element causes a validation failure and rejection, with feedback so the sender can correct the instruction. This strictness protects downstream processing and screening.",
          "why_wrong": [
            "Receiving banks must not invent missing payment data.",
            "Validation failure prevents normal settlement.",
            "Rejection feedback is a defined part of the process.",
            ""
          ]
        },
        {
          "id": "px-08-03",
          "domain": "messaging",
          "chapter": "ch8",
          "question": "A payment chain includes an intermediary bank. Why must the original instruction preserve the full payment information through each hop?",
          "options": [
            "Because intermediaries need the data for marketing.",
            "Because the information is decorative.",
            "Because each bank must be able to screen, process and pass on the payment with complete and accurate data.",
            "Because the beneficiary bank ignores it anyway."
          ],
          "answer": 2,
          "explanation": "Every bank in the chain has screening, processing and record-keeping duties. Truncating or altering payment information breaks screening, causes repair and can breach transparency requirements. Complete data must flow end to end, with charges and deductions handled transparently.",
          "why_wrong": [
            "Intermediaries need the data for processing and compliance, not marketing.",
            "Payment information drives processing and compliance decisions.",
            "",
            "The beneficiary bank relies on the information to credit and report correctly."
          ]
        },
        {
          "id": "px-08-04",
          "domain": "messaging",
          "chapter": "ch39",
          "question": "A developer asks which message carries the customer credit transfer instruction in CBPR+. Which is correct?",
          "options": [
            "pain.001, the customer to bank initiation message.",
            "camt.053, the bank to customer statement.",
            "pacs.002, the payment status report.",
            "pacs.008, the financial institution to financial institution customer credit transfer."
          ],
          "answer": 3,
          "explanation": "In CBPR+, pacs.008 carries the interbank customer credit transfer instruction. pain.001 is the customer-to-bank initiation message, camt.053 is the statement, and pacs.002 reports status. Knowing which message serves which leg prevents design errors in the payment chain.",
          "why_wrong": [
            "pain.001 is customer to bank, not interbank.",
            "camt.053 reports account activity; it does not instruct a transfer.",
            "pacs.002 reports the status of a payment; it does not instruct it.",
            ""
          ]
        },
        {
          "id": "px-08-05",
          "domain": "messaging",
          "chapter": "ch8",
          "question": "A bank is testing CBPR+ messages with a counterparty. Why is bilateral testing important even after both banks pass network validation?",
          "options": [
            "It is not important; network validation is enough.",
            "Testing is only needed for domestic payments.",
            "Bilateral testing replaces the need for usage guidelines.",
            "Bilateral testing proves the two banks interpret the guidelines, codes and business rules the same way in real flows."
          ],
          "answer": 3,
          "explanation": "Network validation checks message structure, but business interpretation can still differ between banks. Bilateral testing exercises real scenarios, including charges, returns and status reporting, and surfaces differences before production. It is a critical step in any migration or onboarding.",
          "why_wrong": [
            "Network validation alone does not prove shared business interpretation.",
            "Cross-border flows need testing as much as domestic ones.",
            "Testing verifies guideline implementation; it does not replace the guidelines.",
            ""
          ]
        },
        {
          "id": "px-08-06",
          "domain": "messaging",
          "chapter": "ch8",
          "question": "A CBPR+ payment uses an incorrect charge bearer code. What is the practical consequence?",
          "options": [
            "No consequence; charge codes are ignored.",
            "Charges may be applied differently from what the payer intended, causing disputes and reconciliation breaks.",
            "The payment amount automatically doubles.",
            "The beneficiary bank pays all charges."
          ],
          "answer": 1,
          "explanation": "The charge bearer code tells the chain who bears the charges: the debtor, the creditor, or shared. An incorrect code changes who pays and can lead to deductions the payer did not expect, disputes and reconciliation differences. Charge codes must be set deliberately and validated.",
          "why_wrong": [
            "Charge codes drive real deductions in the chain.",
            "",
            "The amount does not double; the charge allocation changes.",
            "Who pays depends on the code used, not a default rule."
          ]
        },
        {
          "id": "px-08-07",
          "domain": "messaging",
          "chapter": "ch39",
          "question": "A bank receives a pacs.002 with a rejected status for a payment it sent. What should its system do?",
          "options": [
            "Ignore it, because status reports are informational only.",
            "Resend the original payment automatically without review.",
            "Update the payment state to rejected, record the reason code, notify the originating channel and release any held funds or limits as appropriate.",
            "Delete the original payment record."
          ],
          "answer": 2,
          "explanation": "A pacs.002 status report is an actionable instruction to update the payment lifecycle. The system must reflect the rejection, preserve the reason, inform the customer or channel and unwind any holds. Ignoring or blindly resending creates duplicate and reconciliation risks.",
          "why_wrong": [
            "Status reports drive state changes and customer communication.",
            "Automatic resend without fixing the cause repeats the failure or duplicates.",
            "",
            "The original record must be preserved for audit and reconciliation."
          ]
        },
        {
          "id": "px-08-08",
          "domain": "messaging",
          "chapter": "ch8",
          "question": "Why do CBPR+ guidelines restrict the use of certain free-text fields that were common in MT messages?",
          "options": [
            "To make messages harder to read.",
            "To reduce message size for aesthetic reasons.",
            "To prevent banks from communicating at all.",
            "To force data into structured elements that can be validated, screened and processed automatically."
          ],
          "answer": 3,
          "explanation": "Free text in MT messages caused manual repair, screening difficulty and inconsistent interpretation. CBPR+ pushes data into structured, coded elements so systems can process payments automatically and consistently. Restriction is a deliberate quality and automation measure.",
          "why_wrong": [
            "The goal is machine processing, not readability difficulty.",
            "Size is not the driver; structured processing is.",
            "Banks communicate through structured data and defined messages, not less.",
            ""
          ]
        },
        {
          "id": "px-08-09",
          "domain": "messaging",
          "chapter": "ch8",
          "question": "A bank's CBPR+ implementation truncates remittance information when converting from a legacy format. What should the BA insist on?",
          "options": [
            "Accept truncation silently.",
            "Remove remittance information entirely.",
            "Put the excess data in the amount field.",
            "Define truncation rules explicitly, warn the sender where data will be lost, and prefer structured remittance data that fits the standard."
          ],
          "answer": 3,
          "explanation": "Remittance information is how the beneficiary reconciles the payment. Silent truncation breaks the beneficiary's reconciliation and creates disputes. Truncation rules must be explicit, senders must be warned, and structured remittance data should be used to preserve the information that matters.",
          "why_wrong": [
            "Silent truncation hides data loss from the sender.",
            "Removing remittance data destroys reconciliation information.",
            "The amount field must hold only the amount.",
            ""
          ]
        },
        {
          "id": "px-08-10",
          "domain": "messaging",
          "chapter": "ch8",
          "question": "A new joiner asks why CBPR+ migration took years across the industry. What is the best expert answer?",
          "options": [
            "Because every bank, system and counterparty in the chain must upgrade, test and cut over consistently, with no break in live payment flows.",
            "Because banks were lazy.",
            "Because the messages are identical to MT messages.",
            "Because only one bank needed to change."
          ],
          "answer": 0,
          "explanation": "Cross-border payments involve thousands of banks and systems that must all interpret the same messages consistently. Migration requires coordinated upgrades, testing, coexistence handling and cutover planning while live payments continue. That coordination, not the message design alone, drives the timeline.",
          "why_wrong": [
            "",
            "The timeline reflects coordination complexity, not effort.",
            "MX messages differ structurally from MT messages.",
            "Every participant in the chain must migrate for end-to-end consistency."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-09",
        "title": "Payments Expert Test 9: Reject vs Return Rules in CBPR+",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-09-01",
          "domain": "messaging",
          "chapter": "ch58",
          "question": "A payment fails validation before any funds move. Is this a reject or a return, and why does the distinction matter?",
          "options": [
            "A return, because the payment came back.",
            "Both terms mean the same thing.",
            "A reject, because no settlement or credit occurred, so no funds need to move back.",
            "Neither, because failed payments are deleted."
          ],
          "answer": 2,
          "explanation": "A reject happens before settlement or credit, so the instruction is refused without funds moving. A return happens after funds have moved and requires funds to be sent back. The distinction determines the message used, the accounting entries and the customer communication.",
          "why_wrong": [
            "A return requires funds to have moved; here none did.",
            "Reject and return are distinct flows with different fund movements.",
            "",
            "Failed payments are recorded with reasons, not deleted."
          ]
        },
        {
          "id": "px-09-02",
          "domain": "messaging",
          "chapter": "ch58",
          "question": "A beneficiary bank credits an account, then discovers the account was closed before the credit. What flow applies?",
          "options": [
            "A reject, because the account is closed.",
            "No flow; the bank keeps the funds.",
            "A new payment from the beneficiary.",
            "A return, because funds were already processed and must now be sent back to the payer bank."
          ],
          "answer": 3,
          "explanation": "Once funds have been processed and the credit cannot stand, the return flow sends the funds back with a reason code. A reject is no longer possible because the payment has already moved through processing. The return preserves the audit trail and the original payment references.",
          "why_wrong": [
            "A reject applies before processing; this payment was already processed.",
            "The bank cannot keep funds for a closed account.",
            "A return is the defined flow; it is not a new beneficiary payment.",
            ""
          ]
        },
        {
          "id": "px-09-03",
          "domain": "operations",
          "chapter": "ch58",
          "question": "A return arrives with a reason code the payer bank's system does not recognise. What should the system do?",
          "options": [
            "Drop the return silently.",
            "Record the return with the unrecognised code, flag it for operations review and do not lose the funds movement.",
            "Reject the return automatically.",
            "Credit the payer without recording the reason."
          ],
          "answer": 1,
          "explanation": "An unrecognised reason code must never cause a return to be lost. The system should record the funds movement, preserve the original code and flag the case for human review. Dropping or auto-rejecting a return breaks reconciliation and the audit trail.",
          "why_wrong": [
            "Dropping a return loses the funds movement record.",
            "",
            "Auto-rejecting a valid funds return creates a reconciliation break.",
            "The reason must be recorded even if the code is unfamiliar."
          ]
        },
        {
          "id": "px-09-04",
          "domain": "messaging",
          "chapter": "ch58",
          "question": "Why must a return carry the original payment references, such as the original instruction identification?",
          "options": [
            "For decoration only.",
            "Because returns must look identical to new payments.",
            "So the payer bank can match the return to the original payment, update its state and reconcile automatically.",
            "To confuse the reconciliation system."
          ],
          "answer": 2,
          "explanation": "Returns are matched to originals by reference. Without the original identifiers, the payer bank cannot link the funds to the original instruction, update the customer position or reconcile. Reference linkage is what makes returns processable without manual investigation.",
          "why_wrong": [
            "References are functional, not decorative.",
            "Returns are distinct from new payments and must be identifiable as such.",
            "",
            "References exist to help reconciliation, not confuse it."
          ]
        },
        {
          "id": "px-09-05",
          "domain": "operations",
          "chapter": "ch58",
          "question": "A payment is rejected for an invalid account format. The payer corrects the format and resends. What reference discipline should apply?",
          "options": [
            "Use a new instruction identification for the corrected payment, keeping the original rejection record linked by business reference.",
            "Reuse the exact same instruction identification so the two attempts look like one.",
            "Use no identification at all.",
            "Reuse the rejection message as the new instruction."
          ],
          "answer": 0,
          "explanation": "Each payment instruction needs a unique identification so duplicates can be detected and each attempt tracked separately. The corrected payment is a new instruction, while the business reference links it to the original intent. Reusing the identification would make the new payment look like a duplicate.",
          "why_wrong": [
            "",
            "Reusing the identification creates a duplicate detection problem.",
            "Every instruction needs identification for tracking and deduplication.",
            "A rejection message is a status report, not a payment instruction."
          ]
        },
        {
          "id": "px-09-06",
          "domain": "messaging",
          "chapter": "ch58",
          "question": "An intermediary bank rejects a payment for a compliance concern. What must it consider before simply passing the payment onward?",
          "options": [
            "Nothing; intermediaries never screen payments.",
            "Only the fee it will earn.",
            "Its own screening and legal duties, which may require it to reject or hold the payment even if other banks in the chain would accept it.",
            "Whether the beneficiary will complain."
          ],
          "answer": 2,
          "explanation": "Every bank in the chain, including intermediaries, has its own compliance obligations. An intermediary cannot pass on a payment it has reason to hold or reject under its own duties. Chain processing does not transfer compliance responsibility to other banks.",
          "why_wrong": [
            "Intermediaries do screen and hold compliance duties.",
            "Fees never override compliance duties.",
            "",
            "Complaint risk does not determine compliance handling."
          ]
        },
        {
          "id": "px-09-07",
          "domain": "operations",
          "chapter": "ch58",
          "question": "A return is received but the original payment was already reconciled and the customer was told it succeeded. What is the correct handling?",
          "options": [
            "Hide the return from the customer.",
            "Ignore the return because the customer was already told.",
            "Send the funds back to the beneficiary bank without recording.",
            "Process the return, update the payment state, inform the customer promptly and explain what happens next."
          ],
          "answer": 3,
          "explanation": "Returns can arrive after an initial success message, and the bank must correct the record and inform the customer. Hiding the return would leave the customer with a false position and create a reconciliation break. Prompt, honest communication with next steps is the professional standard.",
          "why_wrong": [
            "Hiding a return misleads the customer and breaks reconciliation.",
            "The return is a real funds movement and must be processed.",
            "Unrecorded funds movements break the audit trail.",
            ""
          ]
        },
        {
          "id": "px-09-08",
          "domain": "messaging",
          "chapter": "ch58",
          "question": "What is the role of the reason code in a reject or return message?",
          "options": [
            "It tells the receiving bank why the payment failed, enabling correct customer communication and fixing the root cause.",
            "It is optional decoration.",
            "It sets the exchange rate.",
            "It identifies the bank's marketing campaign."
          ],
          "answer": 0,
          "explanation": "Reason codes standardise failure explanations across banks. They let the payer bank tell the customer what went wrong, decide whether a corrected resend is possible and fix systemic issues. Without coded reasons, every failure becomes a manual investigation.",
          "why_wrong": [
            "",
            "Reason codes are essential structured data, not decoration.",
            "Exchange rates are unrelated to reason codes.",
            "Reason codes describe payment failures, not marketing."
          ]
        },
        {
          "id": "px-09-09",
          "domain": "operations",
          "chapter": "ch58",
          "question": "A bank's reject rate suddenly doubles after a system change. What is the most likely cause to investigate first?",
          "options": [
            "Customers suddenly sending worse instructions.",
            "The time of year.",
            "A change in the bank's logo.",
            "A validation, mapping or reference data change introduced by the system change."
          ],
          "answer": 3,
          "explanation": "A sudden change in reject rates that coincides with a system change points to the change itself: a new validation, a mapping error or stale reference data. Investigating the change first is faster and more likely to find the cause than assuming customer behaviour changed overnight.",
          "why_wrong": [
            "Customer behaviour rarely changes abruptly in step with a system release.",
            "Seasonality does not explain a sudden doubling tied to a release.",
            "Branding has no effect on payment validation.",
            ""
          ]
        },
        {
          "id": "px-09-10",
          "domain": "messaging",
          "chapter": "ch58",
          "question": "A payment is returned after the payer bank has already released the payer's funds hold. What accounting care is needed?",
          "options": [
            "None, because returns never affect accounting.",
            "The return should be credited twice to be safe.",
            "The return must be matched to the original, the customer account credited correctly and any duplicate credit prevented.",
            "The return should be written off immediately."
          ],
          "answer": 2,
          "explanation": "A return after hold release must still be accounted for precisely: the original debit, the hold release and the return credit must reconcile without double-crediting the customer. Careful matching prevents the customer receiving funds twice or the bank carrying a break. Accounting entries must reflect the actual funds flow.",
          "why_wrong": [
            "Returns are funds movements and always affect accounting.",
            "Double crediting would create a loss and a customer overpayment.",
            "",
            "Writing off a return without matching hides a real funds movement."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-10",
        "title": "Payments Expert Test 10: pacs and pain Messages in Depth",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-10-01",
          "domain": "messaging",
          "chapter": "ch60",
          "question": "A corporate uploads a pain.001 file with 500 payments. One payment has an invalid account number. What is the best file-level handling?",
          "options": [
            "Reject the entire file with no detail.",
            "Reject only the invalid payment where the design allows, accept the valid ones, and report the failure precisely in a pain.002.",
            "Process the invalid payment anyway.",
            "Hold all 500 payments indefinitely."
          ],
          "answer": 1,
          "explanation": "Granular handling protects the valid payments while giving the corporate precise feedback on the one failure. The pain.002 status report identifies the failed instruction and the reason so it can be corrected. Rejecting the whole file for one error creates unnecessary rework and delays.",
          "why_wrong": [
            "Whole-file rejection for one error is disproportionate and unhelpful.",
            "",
            "Processing an invalid payment guarantees a downstream failure.",
            "Holding all payments penalises 499 valid instructions."
          ]
        },
        {
          "id": "px-10-02",
          "domain": "messaging",
          "chapter": "ch60",
          "question": "What does a pain.002 message report?",
          "options": [
            "The bank's marketing offers.",
            "The beneficiary's account balance.",
            "Foreign exchange rates for the day.",
            "The status of a customer payment initiation, including acceptance, rejection or pending state, at file, batch or instruction level."
          ],
          "answer": 3,
          "explanation": "pain.002 is the customer payment status report. It tells the originator whether their pain.001 file or individual instructions were accepted, rejected or are pending, with reasons. This feedback loop is essential for corporate straight-through processing.",
          "why_wrong": [
            "pain.002 is a status report, not a marketing message.",
            "Balances are reported in account statements, not pain.002.",
            "Exchange rates are not carried in pain.002.",
            ""
          ]
        },
        {
          "id": "px-10-03",
          "domain": "messaging",
          "chapter": "ch7",
          "question": "A pacs.008 carries a payment that must be processed as a cover payment. What distinguishes cover handling from serial handling?",
          "options": [
            "Cover payments have no intermediary banks.",
            "In cover handling, the payment instruction and the funds movement travel by different routes, with the cover carrying the settlement.",
            "Cover payments are always in cash.",
            "Serial and cover handling are identical."
          ],
          "answer": 1,
          "explanation": "In serial handling, the instruction and funds pass through each bank in sequence. In cover handling, the instruction goes directly to the beneficiary bank while the funds move separately through correspondent accounts. The cover message links the funds movement to the underlying instruction.",
          "why_wrong": [
            "Cover payments commonly involve correspondent banks for the funds leg.",
            "",
            "Cover payments are electronic interbank flows, not cash.",
            "The routing of instruction versus funds is the key difference."
          ]
        },
        {
          "id": "px-10-04",
          "domain": "messaging",
          "chapter": "ch60",
          "question": "A pain.001 file uses duplicate instruction identifications across two batches. What should the bank's validation do?",
          "options": [
            "Accept both, since duplicates are harmless.",
            "Detect the duplicates and reject or hold the repeated instructions to prevent double payment.",
            "Merge the two batches silently.",
            "Process the second batch a week later."
          ],
          "answer": 1,
          "explanation": "Instruction identifications must be unique so the bank can detect accidental resubmission. Duplicate identifications within or across files are a classic double-payment risk. The bank must detect them and handle them explicitly rather than processing both.",
          "why_wrong": [
            "Duplicates are a double-payment risk, not harmless.",
            "",
            "Silent merging hides a potential duplicate payment.",
            "Delaying does not resolve the duplication risk."
          ]
        },
        {
          "id": "px-10-05",
          "domain": "messaging",
          "chapter": "ch7",
          "question": "A pacs.008 includes structured remittance information with an invoice reference. Why does the beneficiary value this?",
          "options": [
            "It has no value to the beneficiary.",
            "It increases the payment amount.",
            "It replaces the need for an invoice.",
            "It lets the beneficiary's systems match the payment to the open invoice automatically, without manual allocation."
          ],
          "answer": 3,
          "explanation": "Structured remittance data carries references the beneficiary's receivables system can match automatically. This drives auto-allocation, reduces manual cash application and speeds up reconciliation. Rich remittance data is one of the main business benefits of ISO 20022.",
          "why_wrong": [
            "Remittance data is central to beneficiary reconciliation.",
            "Remittance data does not change the amount.",
            "The invoice remains the commercial document; remittance data links the payment to it.",
            ""
          ]
        },
        {
          "id": "px-10-06",
          "domain": "messaging",
          "chapter": "ch60",
          "question": "A corporate's pain.001 requests an execution date that has already passed. What should the bank do?",
          "options": [
            "Process it as if the date were in the future.",
            "Backdate the payment silently.",
            "Reject or query the instruction, since a past execution date cannot be honoured as requested.",
            "Ignore the date entirely."
          ],
          "answer": 2,
          "explanation": "A past execution date is an invalid instruction that cannot be executed as requested. The bank must reject or query it so the corporate can confirm the intended date. Silent backdating would misrepresent when the payment was instructed and executed.",
          "why_wrong": [
            "Treating a past date as future misrepresents the instruction.",
            "Backdating falsifies the execution record.",
            "",
            "The execution date drives value dating and cannot be ignored."
          ]
        },
        {
          "id": "px-10-07",
          "domain": "messaging",
          "chapter": "ch7",
          "question": "A pacs.008 payment is sent with an intermediary agent specified. What is the intermediary agent's role?",
          "options": [
            "To receive the funds as the final beneficiary.",
            "To set the exchange rate for the payer.",
            "To issue the customer's statement.",
            "To pass the payment onward in the chain, using its correspondent relationships to reach the next bank."
          ],
          "answer": 3,
          "explanation": "An intermediary agent sits between the debtor agent and the creditor agent when there is no direct relationship or route. It forwards the instruction and the funds toward the beneficiary bank. Each intermediary adds a hop, with its own processing and potential charges.",
          "why_wrong": [
            "The final beneficiary is the creditor, not the intermediary.",
            "Exchange rates are agreed separately; the intermediary does not set them for the payer.",
            "Statements are issued by the account-holding bank.",
            ""
          ]
        },
        {
          "id": "px-10-08",
          "domain": "messaging",
          "chapter": "ch60",
          "question": "A bank offers both pain.001 upload and an API for payment initiation. Why must both channels apply the same validation rules?",
          "options": [
            "They need not; API payments can skip validation.",
            "Consistent validation ensures the same instruction is treated the same way regardless of channel, preventing control gaps and customer confusion.",
            "File upload is legacy and needs no rules.",
            "APIs are inherently safe without validation."
          ],
          "answer": 1,
          "explanation": "Channel should not determine control strength. If the API skips validations the file channel applies, customers will route around controls and the bank will face inconsistent rejects and risks. A single validation service shared by channels is the robust design.",
          "why_wrong": [
            "API payments need the same validation as file payments.",
            "",
            "File upload needs full validation like any channel.",
            "APIs need validation just as files do."
          ]
        },
        {
          "id": "px-10-09",
          "domain": "messaging",
          "chapter": "ch39",
          "question": "A pacs.002 reports a payment as pending. The corporate asks whether the payment has settled. What is the correct answer?",
          "options": [
            "No, pending means the payment is still being processed and has not reached a final state.",
            "Yes, pending means settled.",
            "Pending means the payment was rejected.",
            "Pending means the payment will never settle."
          ],
          "answer": 0,
          "explanation": "Pending is an intermediate state: the payment has been accepted for processing but has not yet reached acceptance, rejection or settlement. The corporate must wait for a final status before treating the payment as complete. Clear status semantics prevent premature reconciliation.",
          "why_wrong": [
            "",
            "Pending is not a final settled state.",
            "Rejection is a distinct final status.",
            "Pending does not mean permanent failure; processing continues."
          ]
        },
        {
          "id": "px-10-10",
          "domain": "messaging",
          "chapter": "ch60",
          "question": "A BA is writing acceptance criteria for pain.002 generation. Which criterion is most testable?",
          "options": [
            "The system should send good status reports.",
            "For each rejected instruction, pain.002 must carry the instruction identification, a rejection status and a reason code within the agreed timeframe.",
            "The system should be fast.",
            "Status reports should look nice."
          ],
          "answer": 1,
          "explanation": "Testable criteria name the exact data, the status value, the reason code and the timing. Testers can then verify each element in the generated message. Vague criteria about goodness, speed or appearance cannot be verified reliably.",
          "why_wrong": [
            "Good is not a testable criterion.",
            "",
            "Fast without a defined timeframe cannot be tested.",
            "Appearance is not the measure of a status report."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-11",
        "title": "Payments Expert Test 11: Intraday Liquidity Management",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-11-01",
          "domain": "rails",
          "chapter": "ch19",
          "question": "A bank ends every day with a healthy balance but repeatedly fails morning payments. What does this pattern indicate?",
          "options": [
            "An intraday liquidity timing problem: funds arrive too late in the day for morning outflows.",
            "The bank has no liquidity problem at all.",
            "The bank's customers are at fault.",
            "Morning payments are always impossible."
          ],
          "answer": 0,
          "explanation": "End-of-day balances hide intraday timing. If outflows cluster in the morning and inflows arrive later, the bank can be short intraday despite ending the day in surplus. Intraday liquidity management focuses on the timing profile, not only the closing balance.",
          "why_wrong": [
            "",
            "Repeated morning failures are a liquidity timing problem even with healthy closing balances.",
            "Customer behaviour is only part of the picture; the bank must manage timing.",
            "Morning payments settle routinely when liquidity is managed."
          ]
        },
        {
          "id": "px-11-02",
          "domain": "operations",
          "chapter": "ch19",
          "question": "A treasurer wants an early warning of intraday liquidity stress. Which indicator is most useful?",
          "options": [
            "Last month's average balance.",
            "The number of staff on duty.",
            "The bank's annual profit.",
            "Real-time projected balance through the day, showing expected inflows, outflows and queue depth."
          ],
          "answer": 3,
          "explanation": "Intraday management needs a forward view: projected balances at each point in the day, driven by scheduled and expected flows plus the current queue. Averages and historical figures cannot warn of a shortfall in the next hour. Real-time projection enables timely funding action.",
          "why_wrong": [
            "A monthly average cannot warn of an intraday shortfall.",
            "Staffing does not measure liquidity.",
            "Annual profit does not reflect intraday cash timing.",
            ""
          ]
        },
        {
          "id": "px-11-03",
          "domain": "rails",
          "chapter": "ch19",
          "question": "A bank delays releasing low-priority payments when liquidity is tight. What is this technique called in spirit, and why is it used?",
          "options": [
            "Throttling, to preserve liquidity for time-critical and high-priority payments.",
            "Abandoning, to cancel all payments.",
            "Netting, to merge payments into one.",
            "Hoarding, to keep funds forever."
          ],
          "answer": 0,
          "explanation": "Prioritised release, or throttling, holds lower-priority payments while liquidity is scarce so critical payments can settle. It is a deliberate liquidity management choice, not abandonment. The held payments are released as liquidity becomes available.",
          "why_wrong": [
            "",
            "Payments are held and released later, not cancelled.",
            "Netting offsets payments; throttling sequences their release.",
            "Funds are preserved for priority use, not kept forever."
          ]
        },
        {
          "id": "px-11-04",
          "domain": "operations",
          "chapter": "ch76",
          "question": "A bank's intraday liquidity report shows heavy reliance on incoming payments to fund outgoing ones. What risk does this create?",
          "options": [
            "No risk, because incoming payments always arrive on time.",
            "The bank will earn extra interest.",
            "The risk is only reputational, never operational.",
            "Recycling risk: if an expected inflow is delayed, outgoing payments queue or fail."
          ],
          "answer": 3,
          "explanation": "Recycling means outgoing payments depend on inflows arriving as expected. Any delay in a large expected inflow leaves the bank short and queues its own payments, which can then delay other banks. Buffers and contingency funding reduce this dependency.",
          "why_wrong": [
            "Inflows can be delayed by counterparties, systems or queues.",
            "Reliance on recycling does not earn extra interest.",
            "The risk is operational: queued and failed payments.",
            ""
          ]
        },
        {
          "id": "px-11-05",
          "domain": "rails",
          "chapter": "ch19",
          "question": "Why do regulators expect banks to monitor intraday liquidity, not only end-of-day liquidity?",
          "options": [
            "Because regulators enjoy extra reporting.",
            "Because intraday failures can disrupt the payment system even when end-of-day positions look sound.",
            "Because end-of-day liquidity is irrelevant.",
            "Because intraday monitoring replaces capital requirements."
          ],
          "answer": 1,
          "explanation": "Payment systems depend on timely intraday settlement. A bank that cannot pay intraday can cause queues and delays across the system, even if it ends the day funded. Intraday monitoring and buffers are therefore a financial stability concern, not just an internal matter.",
          "why_wrong": [
            "Reporting serves stability, not administrative preference.",
            "",
            "End-of-day liquidity still matters; intraday adds the timing dimension.",
            "Intraday monitoring complements, not replaces, capital and liquidity rules."
          ]
        },
        {
          "id": "px-11-06",
          "domain": "operations",
          "chapter": "ch19",
          "question": "A bank sets an intraday liquidity buffer. What should determine the size of the buffer?",
          "options": [
            "A random number chosen each morning.",
            "The colour of the treasury dashboard.",
            "The profile of expected flows, the size of large payments, historical volatility and stress scenarios.",
            "The number of branches the bank has."
          ],
          "answer": 2,
          "explanation": "Buffers must reflect the actual risk: large payment sizes, flow volatility, concentration of outflows and plausible stress events such as a delayed inflow. A buffer sized to the real profile protects settlement without tying up excessive funds. Random or cosmetic sizing provides no protection.",
          "why_wrong": [
            "Random sizing provides no risk-based protection.",
            "Dashboard appearance is irrelevant to buffer sizing.",
            "",
            "Branch count does not determine payment flow risk."
          ]
        },
        {
          "id": "px-11-07",
          "domain": "rails",
          "chapter": "ch19",
          "question": "A large time-critical payment is due at a specific time. What should the bank do in advance?",
          "options": [
            "Hope funds arrive by chance.",
            "Reserve or earmark liquidity and confirm the funding plan before the deadline.",
            "Send it early without checking funds.",
            "Cancel it and hope the counterparty forgets."
          ],
          "answer": 1,
          "explanation": "Time-critical payments, such as CLS or settlement obligations, have hard deadlines with serious consequences for failure. The bank must plan funding explicitly, reserve liquidity if needed and confirm the plan ahead of time. Hoping for coincidental inflows is not a control.",
          "why_wrong": [
            "Chance is not a funding plan for a hard deadline.",
            "",
            "Sending without funds guarantees a queue or failure.",
            "Cancelling a time-critical obligation creates default and reputational risk."
          ]
        },
        {
          "id": "px-11-08",
          "domain": "operations",
          "chapter": "ch76",
          "question": "A bank operates in several currencies. Why is intraday liquidity management harder across currencies?",
          "options": [
            "Because currencies never change value.",
            "Because liquidity in one currency cannot automatically fund payments in another, and each currency has its own systems, hours and funding routes.",
            "Because all currencies settle in one system.",
            "Because FX markets are always closed."
          ],
          "answer": 1,
          "explanation": "Each currency has its own settlement system, operating hours, accounts and funding mechanisms. Surplus in one currency does not fund a shortfall in another without an FX or funding transaction, which takes time. Multi-currency operations therefore need per-currency monitoring and planning.",
          "why_wrong": [
            "Currency values do change, but the core issue is separate funding per currency.",
            "",
            "Currencies settle in their own systems, not one shared system.",
            "FX markets have hours and cutoffs; they are not always closed or always open."
          ]
        },
        {
          "id": "px-11-09",
          "domain": "rails",
          "chapter": "ch19",
          "question": "A bank's payment queue grows sharply after a counterparty's system outage. What is the correct interpretation?",
          "options": [
            "The bank's own systems must have failed.",
            "Queues only grow when the bank is insolvent.",
            "The outage delayed expected inflows, so the bank's liquidity recycling is disrupted and its own payments queue.",
            "The queue growth is meaningless."
          ],
          "answer": 2,
          "explanation": "Payment systems are interconnected: one bank's outage delays inflows to others, which then queue their own payments. This contagion is a normal systemic feature of intraday liquidity. The bank must manage its own funding and communicate, not assume its own systems failed.",
          "why_wrong": [
            "A counterparty outage can queue a healthy bank's payments through delayed inflows.",
            "Queues grow for timing reasons, not only insolvency.",
            "",
            "Queue growth is a meaningful liquidity signal."
          ]
        },
        {
          "id": "px-11-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is specifying an intraday liquidity dashboard. Which requirement adds the most operational value?",
          "options": [
            "Show live balance, projected balance by hour, queue value, largest expected flows and breach alerts for agreed thresholds.",
            "Show last year's balances in a large font.",
            "Show only the closing balance.",
            "Show staff holiday schedules."
          ],
          "answer": 0,
          "explanation": "Operators need the live position, the forward projection, the queue and the large flows that will move the balance, plus alerts when thresholds are breached. That combination supports timely funding decisions. Historical or closing-only views cannot drive intraday action.",
          "why_wrong": [
            "",
            "Historical balances do not support intraday decisions.",
            "A closing-only view hides the intraday timing risk.",
            "Holiday schedules do not measure liquidity."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-12",
        "title": "Payments Expert Test 12: Queues, Gridlock and Liquidity Optimisation",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-12-01",
          "domain": "rails",
          "chapter": "ch77",
          "question": "In an RTGS system, several banks each wait for incoming funds from another bank before their own payments can settle. What is this situation called?",
          "options": [
            "Gridlock, where circular payment dependencies prevent settlement even though the system as a whole has enough liquidity.",
            "Netting, which always resolves itself.",
            "Finality, which guarantees settlement.",
            "Insolvency, which means all banks have failed."
          ],
          "answer": 0,
          "explanation": "Gridlock occurs when each bank's queued payments depend on inflows from another bank in the circle, so nothing settles despite sufficient total liquidity. Resolution mechanisms find offsetting payments that can settle together. Gridlock is a coordination problem, not necessarily a solvency problem.",
          "why_wrong": [
            "",
            "Netting is a different mechanism; gridlock needs active resolution.",
            "Finality describes settled payments, not queued ones.",
            "Gridlock can occur among solvent banks; it is a timing and coordination issue."
          ]
        },
        {
          "id": "px-12-02",
          "domain": "rails",
          "chapter": "ch88",
          "question": "How does a gridlock resolution mechanism typically work?",
          "options": [
            "It identifies a set of offsetting queued payments that can settle simultaneously, unlocking the queue.",
            "It cancels all queued payments.",
            "It lends money to all banks permanently.",
            "It shuts down the payment system."
          ],
          "answer": 0,
          "explanation": "Gridlock resolution searches the queue for payments that offset each other and settles them as a group. Because the group nets out, it can settle with less liquidity than sequential settlement would need. This unlocks the circular dependency without new funding.",
          "why_wrong": [
            "",
            "Cancellation would destroy valid payment instructions.",
            "Resolution uses existing queued payments, not permanent lending.",
            "Shutdown would worsen the problem, not resolve it."
          ]
        },
        {
          "id": "px-12-03",
          "domain": "operations",
          "chapter": "ch77",
          "question": "A bank's payment is stuck behind a large queued payment to a different counterparty. What queue management feature could help?",
          "options": [
            "No feature can help; queues are always strictly first in, first out.",
            "Deleting the large payment.",
            "Bypass or priority mechanisms that let a payment settle if funds allow, even when an earlier payment is blocked.",
            "Sending the payment by post."
          ],
          "answer": 2,
          "explanation": "Strict FIFO can block many payments behind one large one. Bypass mechanisms let later payments settle when funds are sufficient, improving throughput. Priority settings also let urgent payments overtake less urgent ones under defined rules.",
          "why_wrong": [
            "Many RTGS systems offer bypass and priority features beyond strict FIFO.",
            "Deleting a valid payment is not a queue management feature.",
            "",
            "Postal delivery is not a payment system queue feature."
          ]
        },
        {
          "id": "px-12-04",
          "domain": "rails",
          "chapter": "ch88",
          "question": "A bank repeatedly queues payments because it releases them in a large batch each morning. What change would most improve its liquidity efficiency?",
          "options": [
            "Release even larger batches.",
            "Stop sending payments in the morning.",
            "Send all payments at the end of the day.",
            "Smooth the release profile through the day and prioritise time-critical payments, so inflows can fund later outflows."
          ],
          "answer": 3,
          "explanation": "Batching creates a liquidity spike that exceeds available funds, causing queues. Smoothing releases through the day lets incoming funds recycle and fund later payments. Prioritisation ensures the most important payments settle first within the smoothed profile.",
          "why_wrong": [
            "Larger batches worsen the liquidity spike.",
            "Stopping morning payments delays customer service unnecessarily.",
            "End-of-day bunching creates the same spike later.",
            ""
          ]
        },
        {
          "id": "px-12-05",
          "domain": "operations",
          "chapter": "ch77",
          "question": "A payment system offers bilateral and multilateral offsetting. What is the difference?",
          "options": [
            "There is no difference.",
            "Bilateral offsetting is only for cards.",
            "Bilateral offsetting matches payments between two banks, while multilateral offsetting matches payments across many banks simultaneously.",
            "Multilateral offsetting never works."
          ],
          "answer": 2,
          "explanation": "Bilateral offsetting finds pairs of payments between two participants that can settle together. Multilateral offsetting considers the whole queue across many participants, finding larger offsetting sets. Multilateral mechanisms can resolve more complex gridlocks but need more computation.",
          "why_wrong": [
            "The scope of matching is the key difference.",
            "Offsetting applies to RTGS queues generally, not only cards.",
            "",
            "Multilateral offsetting is a proven resolution technique."
          ]
        },
        {
          "id": "px-12-06",
          "domain": "rails",
          "chapter": "ch19",
          "question": "A bank sets payment priorities in the RTGS queue. Why must priority use be governed, not left to individual operators?",
          "options": [
            "Because ungoverned priority inflation defeats the system: if everything is urgent, nothing is, and liquidity is misallocated.",
            "Because priorities have no effect.",
            "Because operators never make mistakes.",
            "Because priorities are illegal."
          ],
          "answer": 0,
          "explanation": "Priority mechanisms only work if urgent truly means urgent. If operators mark everything high priority, the queue loses differentiation and time-critical payments may still miss deadlines. Governance, with defined criteria and monitoring, keeps priorities meaningful.",
          "why_wrong": [
            "",
            "Priorities directly affect settlement order.",
            "Operators need guidance and oversight for priority decisions.",
            "Priorities are a standard, legitimate queue feature."
          ]
        },
        {
          "id": "px-12-07",
          "domain": "operations",
          "chapter": "ch77",
          "question": "During a stress event, a bank's queue grows and its funding options narrow. What is the most appropriate escalation?",
          "options": [
            "Escalate to treasury and senior management early, with queue data and funding options, and communicate with affected counterparties as needed.",
            "Wait silently and hope the queue clears.",
            "Cancel all queued payments without notice.",
            "Blame the payment system operator publicly."
          ],
          "answer": 0,
          "explanation": "Early escalation gives treasury time to arrange funding and management time to make decisions before cutoffs. Queue data and options make the escalation actionable. Silence wastes the window in which action is possible.",
          "why_wrong": [
            "",
            "Silent waiting wastes the funding window.",
            "Cancelling without notice breaches duties to customers and counterparties.",
            "Blame does not resolve the queue."
          ]
        },
        {
          "id": "px-12-08",
          "domain": "rails",
          "chapter": "ch88",
          "question": "Why do RTGS systems run optimisation cycles at intervals rather than continuously?",
          "options": [
            "Because each cycle needs a stable snapshot of the queue to compute offsetting sets, and too-frequent cycles would disrupt live settlement.",
            "Because optimisation is never useful.",
            "Because computers cannot run continuously.",
            "Because optimisation is only a reporting exercise."
          ],
          "answer": 0,
          "explanation": "Optimisation algorithms compute over a snapshot of queued payments. Running cycles at intervals balances the benefit of unlocking queues against the cost of repeatedly recomputing while new payments arrive. The interval is a design trade-off between responsiveness and stability.",
          "why_wrong": [
            "",
            "Optimisation unlocks queues and saves liquidity.",
            "Computers run continuously; the interval is a design choice.",
            "Optimisation settles real payments, not only reports."
          ]
        },
        {
          "id": "px-12-09",
          "domain": "operations",
          "chapter": "ch19",
          "question": "A bank measures its queue performance. Which metric best shows whether its liquidity management is improving?",
          "options": [
            "The number of payment system logos on the wall.",
            "The number of staff in operations.",
            "The bank's share price.",
            "Average queue time and value, the share of payments settling without queuing, and the number of cutoff failures."
          ],
          "answer": 3,
          "explanation": "Queue time, queue value, straight-through settlement rates and cutoff failures directly measure liquidity and queue performance. Trends in these metrics show whether funding, prioritisation and release smoothing are working. Unrelated measures cannot show operational improvement.",
          "why_wrong": [
            "Wall decoration does not measure queue performance.",
            "Staff numbers do not measure liquidity efficiency.",
            "Share price reflects many factors, not queue performance.",
            ""
          ]
        },
        {
          "id": "px-12-10",
          "domain": "rails",
          "chapter": "ch77",
          "question": "A small bank argues that gridlock cannot affect it because its volumes are low. What is the flaw in this argument?",
          "options": [
            "Gridlock depends on payment dependencies across the system, so even a small bank can be caught in a circle or cause one with a single large payment.",
            "There is no flaw; small banks are immune.",
            "Small banks do not use RTGS systems.",
            "Gridlock only affects central banks."
          ],
          "answer": 0,
          "explanation": "Gridlock is about dependency structure, not volume. A single large payment from a small bank can block a chain, and a small bank's payments can be blocked by others' queues. All participants share the systemic queue dynamics regardless of size.",
          "why_wrong": [
            "",
            "Size does not confer immunity from system-wide dependencies.",
            "Small banks do use RTGS systems.",
            "Gridlock affects participants, not only central banks."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-13",
        "title": "Payments Expert Test 13: Liquidity Funding and Collateral",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-13-01",
          "domain": "rails",
          "chapter": "ch19",
          "question": "A bank needs intraday liquidity from the central bank. What does the central bank normally require in return?",
          "options": [
            "Nothing; intraday credit is always unsecured.",
            "A promise to lend to the government.",
            "Eligible collateral, so the central bank is protected if the credit is not repaid intraday.",
            "Payment in physical gold only."
          ],
          "answer": 2,
          "explanation": "Central bank intraday credit is normally collateralised with eligible assets. Collateral protects the central bank and the payment system if the borrowing bank fails to repay. The bank must therefore hold and manage a pool of eligible collateral.",
          "why_wrong": [
            "Unsecured intraday credit is not the normal model.",
            "Lending promises are not the requirement; collateral is.",
            "",
            "Collateral is normally securities and eligible assets, not physical gold only."
          ]
        },
        {
          "id": "px-13-02",
          "domain": "operations",
          "chapter": "ch76",
          "question": "A bank's eligible collateral pool shrinks because securities mature. What operational risk follows?",
          "options": [
            "No risk, because collateral is decorative.",
            "Increased profits automatically.",
            "Reduced capacity to draw intraday credit, which can constrain payment settlement if liquidity tightens.",
            "The bank must close its branches."
          ],
          "answer": 2,
          "explanation": "Collateral capacity determines how much intraday credit the bank can draw. A shrinking pool reduces that capacity, leaving the bank more exposed if inflows are delayed. Collateral management must anticipate maturities and replenish the pool.",
          "why_wrong": [
            "Collateral determines intraday credit capacity.",
            "A shrinking pool constrains funding; it does not raise profits.",
            "",
            "Branch closure is unrelated to collateral maturity."
          ]
        },
        {
          "id": "px-13-03",
          "domain": "rails",
          "chapter": "ch19",
          "question": "What is a haircut in the context of collateral for central bank credit?",
          "options": [
            "A fee charged to customers.",
            "A discount applied to the value of collateral to protect the lender against price falls.",
            "A type of payment message.",
            "A reduction in staff numbers."
          ],
          "answer": 1,
          "explanation": "A haircut reduces the lending value of collateral below its market value, creating a buffer against price movements before the collateral could be sold. Riskier or more volatile assets carry larger haircuts. This protects the central bank if it must realise the collateral.",
          "why_wrong": [
            "Haircuts apply to collateral valuation, not customer fees.",
            "",
            "A haircut is a valuation concept, not a message type.",
            "Staffing is unrelated to collateral haircuts."
          ]
        },
        {
          "id": "px-13-04",
          "domain": "operations",
          "chapter": "ch76",
          "question": "A bank holds collateral in one location but needs intraday credit in another currency system. Why might it not be usable?",
          "options": [
            "Collateral eligibility, location and mobilisation rules differ by central bank and system, and moving collateral takes time.",
            "Collateral is always usable everywhere instantly.",
            "Collateral never expires.",
            "All central banks accept identical collateral."
          ],
          "answer": 0,
          "explanation": "Each central bank defines eligible collateral, acceptable locations and mobilisation procedures. Collateral held in the wrong place or in an ineligible form cannot be used until it is moved and accepted, which takes time. Pre-positioning collateral where it will be needed is therefore essential.",
          "why_wrong": [
            "",
            "Collateral usability depends on eligibility and location rules.",
            "Securities mature and eligibility can change.",
            "Eligibility frameworks differ across central banks."
          ]
        },
        {
          "id": "px-13-05",
          "domain": "rails",
          "chapter": "ch19",
          "question": "A bank repays its intraday credit late, after the central bank's repayment deadline. What is the likely consequence?",
          "options": [
            "No consequence at all.",
            "The credit may convert to overnight borrowing with associated costs and potential penalties, and the incident will be recorded.",
            "The bank is automatically closed.",
            "The credit is forgiven."
          ],
          "answer": 1,
          "explanation": "Intraday credit must be repaid within the day. Failure to repay by the deadline typically converts it to overnight borrowing, which carries interest and may attract penalties or supervisory attention. Banks must manage end-of-day funding to avoid unintended overnight use.",
          "why_wrong": [
            "Late repayment has cost and reporting consequences.",
            "",
            "Closure is not the automatic consequence of one late repayment.",
            "Intraday credit is not forgiven on late repayment."
          ]
        },
        {
          "id": "px-13-06",
          "domain": "operations",
          "chapter": "ch76",
          "question": "A treasurer is planning liquidity for a day with unusually large settlement obligations. What is the most prudent preparation?",
          "options": [
            "Assume normal inflows will cover everything.",
            "Reduce the buffer to save costs.",
            "Pre-fund, pre-position collateral, confirm funding lines and brief operations on priorities and escalation.",
            "Ignore the obligations until they arrive."
          ],
          "answer": 2,
          "explanation": "Known large obligations allow advance planning: funding, collateral and clear priorities. Preparation reduces the risk of queues and failures on the day. Assuming normal flows will cope leaves the bank exposed to any delay.",
          "why_wrong": [
            "Normal inflows may not cover unusual obligations.",
            "Reducing the buffer increases risk on a high-obligation day.",
            "",
            "Ignoring known obligations guarantees unpreparedness."
          ]
        },
        {
          "id": "px-13-07",
          "domain": "rails",
          "chapter": "ch77",
          "question": "How does prefunding differ from intraday credit as a liquidity source?",
          "options": [
            "They are identical.",
            "Prefunding is always free.",
            "Intraday credit never needs repayment.",
            "Prefunding uses the bank's own balances held in advance, while intraday credit is borrowed during the day against collateral and repaid by close."
          ],
          "answer": 3,
          "explanation": "Prefunding means holding sufficient own balances before payments are due. Intraday credit is borrowed liquidity that must be repaid the same day. Both support settlement, but prefunding ties up the bank's own funds while credit depends on collateral and central bank facilities.",
          "why_wrong": [
            "The source and repayment differ fundamentally.",
            "Prefunding has an opportunity cost; it is not free.",
            "Intraday credit must be repaid within the day.",
            ""
          ]
        },
        {
          "id": "px-13-08",
          "domain": "operations",
          "chapter": "ch76",
          "question": "A bank's collateral management system fails to update after a securities settlement. What is the immediate risk?",
          "options": [
            "The bank will have too much collateral.",
            "The bank may overstate or understate its available collateral, leading to failed credit draws or unnecessarily constrained payments.",
            "No risk, because collateral data is never used.",
            "The payment system will fix the data automatically."
          ],
          "answer": 1,
          "explanation": "Collateral availability data drives credit decisions. Stale data can make the bank believe it has capacity it lacks, causing failed draws, or believe it lacks capacity it has, constraining payments unnecessarily. Accurate, timely collateral data is an operational necessity.",
          "why_wrong": [
            "Stale data can overstate or understate; excess is only one possible error.",
            "",
            "Collateral data drives intraday credit capacity.",
            "The payment system relies on the bank's data; it does not fix it."
          ]
        },
        {
          "id": "px-13-09",
          "domain": "rails",
          "chapter": "ch19",
          "question": "A bank is considering using less liquid assets as collateral to preserve its high-quality assets. What trade-off must it weigh?",
          "options": [
            "There is no trade-off.",
            "Less liquid assets always provide more credit.",
            "Less liquid assets carry larger haircuts and may be ineligible, so they provide less usable credit per unit of value.",
            "Haircuts do not exist for less liquid assets."
          ],
          "answer": 2,
          "explanation": "Collateral frameworks apply larger haircuts to less liquid and more volatile assets, and some assets may be ineligible altogether. Preserving high-quality assets by using weaker collateral therefore yields less usable intraday capacity. The bank must balance asset preservation against funding capacity.",
          "why_wrong": [
            "Haircuts and eligibility create a real trade-off.",
            "Weaker collateral provides less, not more, usable credit.",
            "",
            "Haircuts are larger, not absent, for less liquid assets."
          ]
        },
        {
          "id": "px-13-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is documenting a contingency funding plan for payments. Which element is most important?",
          "options": [
            "A list of nice restaurants near the office.",
            "A statement that funding will always be available.",
            "Defined triggers, funding actions, decision owners, escalation paths and communication steps, tested through exercises.",
            "A copy of last year's plan with no updates."
          ],
          "answer": 2,
          "explanation": "A contingency funding plan must be actionable: clear triggers for action, the funding steps to take, who decides, how escalation works and who must be told. Testing through exercises proves the plan works under pressure. An untested assertion of availability is not a plan.",
          "why_wrong": [
            "Restaurants are irrelevant to funding contingency.",
            "An assertion is not a plan.",
            "",
            "An outdated untested plan may fail when needed."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-14",
        "title": "Payments Expert Test 14: PSD2 and PSD3 in Depth",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-14-01",
          "domain": "compliance",
          "chapter": "ch65",
          "question": "A third-party provider wants to initiate payments from a customer's bank account under PSD2. What must the customer do first?",
          "options": [
            "Nothing; the provider can initiate freely.",
            "Share their bank password with the provider.",
            "Open a new account with the provider.",
            "Give explicit consent for the provider to initiate payments, with strong customer authentication as required."
          ],
          "answer": 3,
          "explanation": "PSD2 open banking requires the customer's explicit consent for payment initiation, and strong customer authentication must be applied as required. The provider must not hold the customer's bank credentials. Consent and authentication protect the customer while enabling the service.",
          "why_wrong": [
            "Initiation without consent would be unauthorised.",
            "Sharing passwords with third parties is prohibited by the PSD2 model.",
            "The provider initiates from the existing account; no new account is needed.",
            ""
          ]
        },
        {
          "id": "px-14-02",
          "domain": "compliance",
          "chapter": "ch65",
          "question": "What is strong customer authentication (SCA) in the PSD2 sense?",
          "options": [
            "Authentication using two or more independent factors: knowledge, possession and inherence.",
            "A single password chosen by the customer.",
            "A signature on paper.",
            "A phone call to the bank."
          ],
          "answer": 0,
          "explanation": "SCA requires at least two independent elements from different categories: something the customer knows, something they possess, and something they are. The elements must be independent so breaching one does not compromise the others. This multi-factor standard is central to PSD2 security.",
          "why_wrong": [
            "",
            "A single password is single-factor, not strong authentication.",
            "A paper signature is not SCA in the PSD2 sense.",
            "A phone call alone does not meet the SCA standard."
          ]
        },
        {
          "id": "px-14-03",
          "domain": "compliance",
          "chapter": "ch65",
          "question": "A bank refuses to let a licensed third-party provider access a customer's account data, citing security concerns. What does PSD2 generally require?",
          "options": [
            "Banks must provide access through secure interfaces where the provider is authorised and the customer has consented, subject to the regulatory framework.",
            "Banks may refuse all third-party access at will.",
            "Third parties must pay the bank a fee per access.",
            "Access is only allowed for large banks."
          ],
          "answer": 0,
          "explanation": "PSD2 created a right of access for authorised third-party providers with customer consent, through dedicated interfaces. Banks must not obstruct lawful access, though they must ensure security and apply the regulatory requirements. Refusal at will would defeat the open banking framework.",
          "why_wrong": [
            "",
            "PSD2 limits banks' ability to refuse lawful third-party access.",
            "PSD2 does not generally permit per-access charging for this access.",
            "The framework applies across in-scope institutions, not only large banks."
          ]
        },
        {
          "id": "px-14-04",
          "domain": "compliance",
          "chapter": "ch65",
          "question": "A payment is made without SCA where SCA was required, and the payer later disputes it as unauthorised. What is the general liability consequence for the payer's bank?",
          "options": [
            "The payer always bears the loss.",
            "The payee always bears the loss.",
            "The bank that failed to apply SCA generally bears the loss, since it did not meet the authentication requirement.",
            "Nobody bears the loss; the payment is void."
          ],
          "answer": 2,
          "explanation": "PSD2 links liability to SCA compliance: where the bank failed to require SCA, it generally bears the loss for the unauthorised transaction. This incentivises proper authentication. The payer's liability is limited where SCA was not applied as required.",
          "why_wrong": [
            "The payer's liability is limited when SCA was not applied.",
            "The payee is not automatically liable for the payer bank's SCA failure.",
            "",
            "The loss must be allocated; it does not simply disappear."
          ]
        },
        {
          "id": "px-14-05",
          "domain": "compliance",
          "chapter": "ch65",
          "question": "PSD3 and the Payment Services Regulation aim to build on PSD2. Which direction of change best characterises this evolution?",
          "options": [
            "Removing all authentication requirements.",
            "Banning third-party providers.",
            "Strengthening fraud prevention, improving open banking access, clarifying liability and harmonising rules more directly across member states.",
            "Making all payments anonymous."
          ],
          "answer": 2,
          "explanation": "The PSD3 package aims to address PSD2 gaps: stronger fraud measures, better open banking functioning, clearer rules on liability and data sharing, and more direct harmonisation through a regulation. The direction is refinement and strengthening, not deregulation or bans.",
          "why_wrong": [
            "Authentication requirements are strengthened, not removed.",
            "Third-party providers remain part of the framework.",
            "",
            "Anonymity contradicts anti-fraud and AML objectives."
          ]
        },
        {
          "id": "px-14-06",
          "domain": "compliance",
          "chapter": "ch65",
          "question": "A customer uses a payment initiation service and the payment goes wrong. Who is primarily responsible to the customer for the payment execution?",
          "options": [
            "Nobody, because a third party was involved.",
            "The account-servicing bank remains responsible for correct execution, with defined redress and liability allocation between the parties.",
            "Only the third-party provider, in all cases.",
            "The customer, for choosing the service."
          ],
          "answer": 1,
          "explanation": "PSD2 preserves the account-servicing bank's responsibility for payment execution to its customer, while defining how liability is allocated when a third-party provider is involved. The customer should not be left without redress because a third party initiated the payment. The parties settle liability between themselves under the framework.",
          "why_wrong": [
            "The customer retains redress rights despite third-party involvement.",
            "",
            "The provider has duties, but the bank's execution responsibility to its customer remains.",
            "Choosing a lawful service does not remove the customer's rights."
          ]
        },
        {
          "id": "px-14-07",
          "domain": "compliance",
          "chapter": "ch65",
          "question": "An e-commerce merchant wants an SCA exemption for low-value transactions. What must it understand about exemptions?",
          "options": [
            "Exemptions are defined in the regulatory technical standards, carry conditions and limits, and the bank may still apply SCA based on risk.",
            "Exemptions apply automatically to all transactions.",
            "Exemptions remove all fraud liability.",
            "Exemptions are granted by the merchant itself."
          ],
          "answer": 0,
          "explanation": "SCA exemptions, such as for low-value or low-risk transactions, are defined in the technical standards with conditions, thresholds and cumulative limits. The bank applies risk-based decisions and may still challenge a transaction. Exemptions are a risk-based tool, not a blanket waiver.",
          "why_wrong": [
            "",
            "Exemptions have defined conditions and do not apply to everything.",
            "Exemptions do not remove liability; risk-based decisions still apply.",
            "Exemptions are defined by regulation, not self-granted by merchants."
          ]
        },
        {
          "id": "px-14-08",
          "domain": "apis",
          "chapter": "ch80",
          "question": "A bank's open banking API returns errors that reveal internal system details. Why is this a problem?",
          "options": [
            "It is helpful and should be encouraged.",
            "Error messages never matter.",
            "Internal details are required by PSD2.",
            "It leaks implementation details that aid attackers and breaches good API security practice, while confusing third-party developers."
          ],
          "answer": 3,
          "explanation": "API error responses should be clear enough for developers to act on, without exposing internal architecture, stack traces or sensitive data. Leaking internals aids attackers and creates security risk. Good API design balances usability with security.",
          "why_wrong": [
            "Leaking internals is a security risk, not helpful.",
            "Error design affects security and developer experience.",
            "PSD2 requires secure interfaces, not internal detail disclosure.",
            ""
          ]
        },
        {
          "id": "px-14-09",
          "domain": "compliance",
          "chapter": "ch86",
          "question": "A bank detects a pattern of fraud through a specific third-party provider. What should it do?",
          "options": [
            "Block all third-party access permanently without process.",
            "Ignore the pattern.",
            "Follow the regulatory process for addressing the risk, which may include reporting, investigation and proportionate measures, while preserving lawful access.",
            "Charge the provider a fine directly."
          ],
          "answer": 2,
          "explanation": "Fraud concerns must be handled through the defined regulatory process, with evidence, reporting and proportionate action. Blanket blocking without process would breach open banking duties, while ignoring fraud would breach security duties. The framework balances access with risk management.",
          "why_wrong": [
            "Permanent blanket blocking without process breaches the access framework.",
            "Ignoring a fraud pattern breaches security duties.",
            "",
            "Fines are a regulatory matter, not a bank-to-provider charge."
          ]
        },
        {
          "id": "px-14-10",
          "domain": "compliance",
          "chapter": "ch65",
          "question": "A customer revokes consent for an account information service. What must the provider do?",
          "options": [
            "Keep accessing the account indefinitely.",
            "Access the account more frequently to use up the consent.",
            "Stop accessing the account and handle the customer's data per the consent withdrawal and data protection duties.",
            "Sell the data before stopping."
          ],
          "answer": 2,
          "explanation": "Consent withdrawal ends the lawful basis for continued access. The provider must stop accessing the account and handle stored data according to data protection duties, including deletion where required. Continued access after revocation would be unlawful.",
          "why_wrong": [
            "Access after revocation is unlawful.",
            "Accelerated access after revocation compounds the breach.",
            "",
            "Selling customer data would breach data protection law."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-15",
        "title": "Payments Expert Test 15: FEMA and Cross-Border Regulation",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-15-01",
          "domain": "compliance",
          "chapter": "ch33",
          "question": "A resident Indian wants to send funds abroad for education. Under FEMA, what is the fundamental requirement for the transaction?",
          "options": [
            "No requirement; foreign exchange is unregulated.",
            "Only cash may be used.",
            "Only the government may send funds abroad.",
            "The transaction must be permitted under FEMA and conducted through an authorised dealer, with applicable documentation and purpose codes."
          ],
          "answer": 3,
          "explanation": "FEMA regulates foreign exchange transactions in India. Permitted current account transactions, such as education payments, must go through authorised dealers with proper documentation and purpose classification. The framework balances liberalisation with control and reporting.",
          "why_wrong": [
            "Foreign exchange in India is regulated under FEMA.",
            "Electronic transfers through authorised dealers are the normal route.",
            "Residents may send funds abroad for permitted purposes.",
            ""
          ]
        },
        {
          "id": "px-15-02",
          "domain": "compliance",
          "chapter": "ch33",
          "question": "Why do authorised dealers collect purpose codes for cross-border payments from India?",
          "options": [
            "To classify the transaction under FEMA, support regulatory reporting and ensure the payment matches a permitted purpose.",
            "For decoration on the payment message.",
            "To set the exchange rate.",
            "To delay the payment."
          ],
          "answer": 0,
          "explanation": "Purpose codes classify the economic nature of the transaction, such as education, travel or imports. Classification supports FEMA compliance, balance of payments reporting and monitoring. Incorrect purpose coding can misrepresent the transaction and breach reporting duties.",
          "why_wrong": [
            "",
            "Purpose codes drive compliance and reporting.",
            "Exchange rates are set by markets and dealer pricing, not purpose codes.",
            "Purpose coding supports, rather than delays, compliant processing."
          ]
        },
        {
          "id": "px-15-03",
          "domain": "compliance",
          "chapter": "ch33",
          "question": "A customer asks the bank to split a large outward remittance into smaller amounts to avoid documentation. What should the bank do?",
          "options": [
            "Agree, since smaller payments are easier.",
            "Split it but charge extra.",
            "Suggest using a different bank.",
            "Refuse and explain that structuring to evade requirements is not permitted, and apply the correct process for the full amount."
          ],
          "answer": 3,
          "explanation": "Splitting transactions to evade thresholds or documentation is structuring, a serious compliance concern. The bank must apply the correct requirements to the substance of the transaction and refuse to facilitate evasion. Staff must recognise and escalate such requests.",
          "why_wrong": [
            "Facilitating evasion would breach compliance duties.",
            "Charging extra does not make evasion lawful.",
            "Referring the customer elsewhere does not discharge the bank's duties.",
            ""
          ]
        },
        {
          "id": "px-15-04",
          "domain": "compliance",
          "chapter": "ch86",
          "question": "A cross-border payment from India is for a purpose that requires prior approval. The customer asks the bank to send it anyway. What is the correct response?",
          "options": [
            "Send it and seek approval later.",
            "Decline to send until the required approval is obtained, and explain the requirement.",
            "Send it through a different corridor to avoid approval.",
            "Send it in a different currency to avoid approval."
          ],
          "answer": 1,
          "explanation": "Where prior approval is required, the payment cannot lawfully proceed without it. The bank must decline until approval is in place and help the customer understand the process. Routing or currency changes do not remove the approval requirement.",
          "why_wrong": [
            "Sending before approval breaches the requirement.",
            "",
            "Changing corridor does not change the regulatory requirement.",
            "Currency choice does not remove the approval duty."
          ]
        },
        {
          "id": "px-15-05",
          "domain": "compliance",
          "chapter": "ch33",
          "question": "An Indian exporter receives payment from abroad. Why must the bank monitor the realisation of export proceeds?",
          "options": [
            "Export proceeds need no monitoring.",
            "FEMA requires exporters to realise and repatriate proceeds within prescribed timelines, and banks must monitor compliance.",
            "Monitoring is only for imports.",
            "Exporters may keep proceeds abroad indefinitely without consequence."
          ],
          "answer": 1,
          "explanation": "FEMA and RBI directions require export proceeds to be realised and repatriated within defined periods. Authorised dealers monitor export transactions and follow up on unrealised proceeds. This supports the integrity of the foreign exchange framework.",
          "why_wrong": [
            "Export realisation is actively monitored under FEMA.",
            "",
            "Both exports and imports are monitored in their respective ways.",
            "Indefinite retention abroad would breach repatriation requirements."
          ]
        },
        {
          "id": "px-15-06",
          "domain": "compliance",
          "chapter": "ch94",
          "question": "A payment involves both Indian FEMA requirements and the destination country's exchange controls. What must the bank consider?",
          "options": [
            "Both regimes: the payment must comply with Indian requirements and with the destination country's rules where they apply.",
            "Only Indian requirements matter.",
            "Only the destination country's rules matter.",
            "Neither regime applies to electronic payments."
          ],
          "answer": 0,
          "explanation": "Cross-border payments can be subject to the rules of multiple jurisdictions. The bank must satisfy its home regime and be alert to destination requirements that affect the payment's completion. Ignoring either side risks blocks, returns or regulatory breaches.",
          "why_wrong": [
            "",
            "Destination requirements can affect completion and must be considered.",
            "Home regime duties cannot be ignored.",
            "Electronic payments are fully within regulatory scope."
          ]
        },
        {
          "id": "px-15-07",
          "domain": "compliance",
          "chapter": "ch33",
          "question": "A customer provides documents for an outward remittance that appear inconsistent with the stated purpose. What should the bank do?",
          "options": [
            "Process the payment and ignore the inconsistency.",
            "Alter the documents to match the purpose.",
            "Cancel the customer's account immediately.",
            "Query the customer, seek clarification or additional evidence, and escalate if the concern is not resolved."
          ],
          "answer": 3,
          "explanation": "Inconsistent documentation is a red flag that must be resolved before the payment proceeds. The bank should seek clarification and evidence, and escalate under its AML and FEMA procedures if concerns remain. Processing despite inconsistency would breach due diligence duties.",
          "why_wrong": [
            "Ignoring inconsistency breaches due diligence.",
            "Altering documents is a serious offence.",
            "Immediate account closure is disproportionate before investigation.",
            ""
          ]
        },
        {
          "id": "px-15-08",
          "domain": "compliance",
          "chapter": "ch86",
          "question": "Why must authorised dealers retain records of foreign exchange transactions?",
          "options": [
            "To evidence compliance, support regulatory inspection and audit, and enable investigation of suspicious activity.",
            "For no reason; records can be discarded immediately.",
            "To fill office storage.",
            "Only for marketing analysis."
          ],
          "answer": 0,
          "explanation": "Record retention supports regulatory supervision, audit and investigation. FEMA and AML frameworks require records to be kept for defined periods so transactions can be reconstructed and examined. Discarding records destroys the evidence of compliance.",
          "why_wrong": [
            "",
            "Record retention is a regulatory requirement.",
            "Storage is incidental; compliance evidence is the purpose.",
            "Records serve compliance, not marketing."
          ]
        },
        {
          "id": "px-15-09",
          "domain": "compliance",
          "chapter": "ch33",
          "question": "A fintech wants to offer cross-border remittances from India. What is the key regulatory point it must address?",
          "options": [
            "It needs no regulatory consideration.",
            "It can operate entirely outside FEMA.",
            "It must operate within the FEMA framework, typically through or as an authorised entity, with proper licensing, documentation and reporting.",
            "Only its website design matters."
          ],
          "answer": 2,
          "explanation": "Cross-border remittance from India is a regulated activity under FEMA. Providers must have the right authorisation or partner with authorised dealers, and must meet documentation, reporting and AML requirements. Operating outside the framework would be unlawful.",
          "why_wrong": [
            "Cross-border remittance is regulated under FEMA.",
            "No provider can operate outside the FEMA framework.",
            "",
            "Website design does not determine regulatory status."
          ]
        },
        {
          "id": "px-15-10",
          "domain": "compliance",
          "chapter": "ch33",
          "question": "A BA is specifying FEMA purpose code validation. Which design is most effective?",
          "options": [
            "A governed list of purpose codes, with the code required, validated against the transaction type and supporting documents, and exceptions routed for review.",
            "Free text purpose with no validation.",
            "A single purpose code for all payments.",
            "No purpose code at all."
          ],
          "answer": 0,
          "explanation": "Purpose codes must be accurate and consistent for reporting and compliance. A governed list with validation against transaction type and documents, plus exception handling, ensures accuracy. Free text or a single code destroys the classification value.",
          "why_wrong": [
            "",
            "Free text defeats classification and reporting.",
            "A single code misclassifies most transactions.",
            "Omitting purpose codes breaches reporting requirements."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-16",
        "title": "Payments Expert Test 16: GDPR for Payment Data",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-16-01",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A bank processes payment messages containing names, addresses and account numbers. Why is this personal data under GDPR?",
          "options": [
            "It is not personal data because it is financial.",
            "Only names count as personal data.",
            "It identifies or can identify individuals, directly or indirectly, so GDPR applies to its processing.",
            "Account numbers are never personal data."
          ],
          "answer": 2,
          "explanation": "Personal data is any information relating to an identified or identifiable person. Payment data routinely identifies payers and beneficiaries, so it falls squarely within GDPR. Financial context does not remove data protection duties.",
          "why_wrong": [
            "Financial data about individuals is personal data.",
            "Addresses and account numbers can also identify individuals.",
            "",
            "An account number linked to a person is personal data."
          ]
        },
        {
          "id": "px-16-02",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A customer asks for all their payment data to be deleted immediately. The bank is subject to AML record retention duties. How should the bank respond?",
          "options": [
            "Delete everything immediately with no consideration.",
            "Refuse all deletion without explanation.",
            "Delete the data and recreate it later.",
            "Explain that some data must be retained for legal duties, delete what is not required, and document the decision."
          ],
          "answer": 3,
          "explanation": "The right to erasure is not absolute; it must be balanced against legal retention duties such as AML record keeping. The bank must retain what the law requires, delete what it does not need, and explain the position transparently. Documentation proves the balancing was done properly.",
          "why_wrong": [
            "Immediate total deletion would breach retention duties.",
            "A bare refusal without explanation breaches transparency duties.",
            "Deleting and recreating data defeats the purpose and the audit trail.",
            ""
          ]
        },
        {
          "id": "px-16-03",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A payment processor in a third country will process EU payment data. What must the bank ensure before the transfer?",
          "options": [
            "Nothing; data can flow freely anywhere.",
            "Only that the processor is cheap.",
            "An appropriate transfer mechanism and safeguards under GDPR, such as an adequacy decision or standard contractual clauses with assessments.",
            "That the data is sent by email."
          ],
          "answer": 2,
          "explanation": "GDPR restricts transfers of personal data outside the EEA unless an appropriate mechanism and safeguards are in place. The bank must assess the transfer, use an approved mechanism and ensure the processor provides adequate protection. Cost alone cannot justify an unlawful transfer.",
          "why_wrong": [
            "International transfers are restricted under GDPR.",
            "Cost does not satisfy transfer requirements.",
            "",
            "Email transfer does not provide the required safeguards."
          ]
        },
        {
          "id": "px-16-04",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A bank wants to use payment transaction data for a new marketing analytics product. What GDPR principle is most directly engaged?",
          "options": [
            "Storage limitation only.",
            "Accuracy only.",
            "No principle applies to analytics.",
            "Purpose limitation: data collected for payment processing cannot be freely reused for unrelated marketing."
          ],
          "answer": 3,
          "explanation": "Purpose limitation requires data to be used for the purposes for which it was collected, or compatible purposes with a lawful basis. Repurposing payment data for marketing analytics needs a fresh assessment of lawful basis, compatibility and transparency. Banks cannot simply reuse payment data for any new purpose.",
          "why_wrong": [
            "Storage limitation concerns retention periods, not reuse purpose.",
            "Accuracy concerns correctness, not purpose.",
            "Analytics using personal data is fully within GDPR scope.",
            ""
          ]
        },
        {
          "id": "px-16-05",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A data breach exposes payment messages containing customer details. What is the bank's immediate priority under GDPR?",
          "options": [
            "Hide the breach from everyone.",
            "Contain the breach, assess the risk to individuals, notify the supervisory authority within the required timeframe where required, and inform affected individuals where the risk is high.",
            "Wait a year before deciding.",
            "Blame the customer."
          ],
          "answer": 1,
          "explanation": "GDPR requires prompt breach response: containment, risk assessment, authority notification where required within the set timeframe, and individual notification where there is high risk. Hiding a breach compounds the harm and the regulatory consequences. Documented, timely action is essential.",
          "why_wrong": [
            "Hiding a breach breaches notification duties.",
            "",
            "Delay beyond the required timeframe breaches GDPR.",
            "Customers are the victims, not the cause."
          ]
        },
        {
          "id": "px-16-06",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A bank's fraud team wants to keep payment data indefinitely for future analysis. What principle limits this?",
          "options": [
            "Storage limitation: personal data must be kept only as long as necessary for the purposes for which it is processed.",
            "No principle limits retention.",
            "Integrity only.",
            "Confidentiality only."
          ],
          "answer": 0,
          "explanation": "Storage limitation requires defined retention periods tied to purpose and legal duties. Indefinite retention for speculative future analysis breaches the principle. The bank must set retention schedules, justify them and delete or anonymise data when the period ends.",
          "why_wrong": [
            "",
            "Storage limitation directly limits retention.",
            "Integrity concerns security and accuracy, not retention length.",
            "Confidentiality concerns protection, not retention length."
          ]
        },
        {
          "id": "px-16-07",
          "domain": "architecture",
          "chapter": "ch81",
          "question": "A payment hub logs full payment messages including personal data for debugging. What should the design do?",
          "options": [
            "Log everything forever in plain text.",
            "Minimise personal data in logs, mask or pseudonymise where possible, control access and set retention.",
            "Disable all logging.",
            "Publish logs publicly."
          ],
          "answer": 1,
          "explanation": "Data minimisation applies to logs as much as to databases. Logs should carry only the data needed for debugging, with masking and access controls, and defined retention. Full plain-text logging of payment messages creates a large, poorly controlled personal data store.",
          "why_wrong": [
            "Unlimited plain-text logging breaches minimisation and security.",
            "",
            "Disabling logging removes the ability to diagnose and audit.",
            "Public logs would be a serious breach."
          ]
        },
        {
          "id": "px-16-08",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A customer exercises their right of access and asks for their payment data. What must the bank provide?",
          "options": [
            "Nothing, because payment data is exempt.",
            "Only data from the last week.",
            "A copy of their personal data and information about processing, within the required timeframe, subject to lawful exemptions.",
            "Only data the bank chooses to share."
          ],
          "answer": 2,
          "explanation": "The right of access lets individuals obtain their personal data and information about how it is processed. Banks must respond within the required timeframe, subject to narrow exemptions and third-party protections. Payment data is not exempt from access rights.",
          "why_wrong": [
            "Payment data is not exempt from access rights.",
            "Access covers the personal data held, not only one week.",
            "",
            "The bank cannot arbitrarily choose what to disclose."
          ]
        },
        {
          "id": "px-16-09",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A bank engages a cloud provider to host payment data. What GDPR role does the provider normally take?",
          "options": [
            "The provider becomes the controller of all data.",
            "The provider acts as a processor, processing data on the bank's instructions under a contract meeting GDPR requirements.",
            "The provider has no GDPR duties.",
            "The bank loses all responsibility."
          ],
          "answer": 1,
          "explanation": "A hosting provider that processes data on the bank's behalf is normally a processor. GDPR requires a contract covering instructions, security, sub-processors, assistance and deletion. The bank as controller remains responsible for compliance and must oversee the processor.",
          "why_wrong": [
            "The bank remains controller; the provider does not take over that role.",
            "",
            "Processors have defined GDPR duties.",
            "Engaging a processor does not remove the controller's responsibility."
          ]
        },
        {
          "id": "px-16-10",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A payment product collects more customer data than needed, just in case it proves useful later. What principle does this breach?",
          "options": [
            "Data minimisation: collect only what is adequate, relevant and necessary for the purpose.",
            "Fairness only.",
            "Transparency only.",
            "No principle; over-collection is encouraged."
          ],
          "answer": 0,
          "explanation": "Data minimisation requires collection to be limited to what is necessary for the stated purpose. Collecting extra data speculatively increases breach impact and breaches the principle. Product design must justify each data element collected.",
          "why_wrong": [
            "",
            "Fairness is relevant but minimisation is the directly engaged principle.",
            "Transparency concerns informing individuals, not collection volume.",
            "Over-collection is discouraged, not encouraged."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-17",
        "title": "Payments Expert Test 17: Operational Resilience and Regulatory Expectations",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-17-01",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A bank's payment hub fails for four hours. Under operational resilience expectations, what matters most in the response?",
          "options": [
            "Blaming the vendor immediately.",
            "Waiting for the failure to fix itself.",
            "Restoring the important business service within the impact tolerance, communicating with customers and regulators, and learning from the incident.",
            "Hiding the outage from customers."
          ],
          "answer": 2,
          "explanation": "Operational resilience focuses on the ability to keep important business services running within impact tolerances during disruption. Response must prioritise restoration, clear communication and honest incident learning. Blame and concealment do not restore service or trust.",
          "why_wrong": [
            "Blame does not restore the service.",
            "Passive waiting prolongs the outage.",
            "",
            "Concealment breaches communication expectations and trust."
          ]
        },
        {
          "id": "px-17-02",
          "domain": "operations",
          "chapter": "ch87",
          "question": "What is an impact tolerance in operational resilience terms?",
          "options": [
            "The maximum profit a bank will accept.",
            "The maximum tolerable disruption to an important business service, in terms such as duration and volume, before harm becomes unacceptable.",
            "The number of staff allowed on holiday.",
            "A marketing target."
          ],
          "answer": 1,
          "explanation": "Impact tolerance expresses how much disruption an important service can absorb before the harm to customers or the system becomes unacceptable. It is set by the board and drives resilience investment and testing. Services must be able to remain within tolerance under severe but plausible scenarios.",
          "why_wrong": [
            "Impact tolerance concerns service disruption, not profit.",
            "",
            "Staffing is not the measure of impact tolerance.",
            "It is a resilience measure, not a marketing target."
          ]
        },
        {
          "id": "px-17-03",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A bank outsources its payment processing to a third-party provider. Who remains accountable for resilience under regulatory expectations?",
          "options": [
            "Only the provider.",
            "Nobody, because outsourcing transfers all accountability.",
            "The bank remains accountable for its important business services, including those delivered through third parties.",
            "The regulator."
          ],
          "answer": 2,
          "explanation": "Outsourcing does not transfer regulatory accountability. The bank must oversee its providers, ensure resilience, maintain exit plans and be able to evidence control. The provider has contractual duties, but the bank answers to the regulator for the service.",
          "why_wrong": [
            "The provider has duties, but the bank remains accountable.",
            "Outsourcing never transfers regulatory accountability.",
            "",
            "The regulator supervises; it does not operate the service."
          ]
        },
        {
          "id": "px-17-04",
          "domain": "operations",
          "chapter": "ch87",
          "question": "A bank tests its disaster recovery plan once a year with a tabletop exercise only. What is the weakness?",
          "options": [
            "Tabletop exercises are the only test needed.",
            "Annual testing is too frequent.",
            "Tabletop exercises do not prove systems can actually recover; live recovery testing is needed to validate recovery times and data integrity.",
            "Disaster recovery plans never need testing."
          ],
          "answer": 2,
          "explanation": "Tabletop exercises test decision-making and communication, but only live recovery tests prove that systems, data and people can actually restore service within tolerance. Untested recovery assumptions fail under real pressure. A testing programme must include realistic technical recovery tests.",
          "why_wrong": [
            "Tabletop alone cannot prove technical recovery.",
            "Annual testing is a minimum, not excessive.",
            "",
            "Untested plans are unreliable."
          ]
        },
        {
          "id": "px-17-05",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "Under DORA-style expectations, what must a financial entity do about ICT third-party risk?",
          "options": [
            "Ignore third-party risk.",
            "Trust all providers without checks.",
            "Maintain a register of ICT providers, assess concentration risk, ensure contracts cover resilience and audit rights, and test exit arrangements.",
            "Ban all third-party providers."
          ],
          "answer": 2,
          "explanation": "DORA-style frameworks require systematic management of ICT third-party risk: registers, due diligence, contractual protections, concentration monitoring and exit planning. This reflects the reality that critical services often depend on a small number of providers. Trust without oversight is not acceptable.",
          "why_wrong": [
            "Ignoring third-party risk breaches resilience expectations.",
            "Trust without checks is not a control.",
            "",
            "Banning providers is impractical and not required."
          ]
        },
        {
          "id": "px-17-06",
          "domain": "operations",
          "chapter": "ch87",
          "question": "A payment service depends on a single data centre. What is the core resilience concern?",
          "options": [
            "A single point of failure: one incident can take down the entire service with no alternate site to fail over to.",
            "There is no concern.",
            "Data centres never fail.",
            "Single sites are always faster."
          ],
          "answer": 0,
          "explanation": "A single site creates a single point of failure for the service. Fire, power loss or network failure at that site can halt all payments. Resilience design requires redundancy, geographic separation and tested failover so the service survives a site loss.",
          "why_wrong": [
            "",
            "A single site is a classic single point of failure.",
            "Data centres do fail, from power, network and other causes.",
            "Speed does not compensate for the absence of failover."
          ]
        },
        {
          "id": "px-17-07",
          "domain": "operations",
          "chapter": "ch87",
          "question": "During an incident, a bank's status page says all systems are normal while payments are failing. What has gone wrong?",
          "options": [
            "Incident communication has failed: monitoring, detection or escalation did not surface the true customer impact.",
            "Nothing; status pages are decorative.",
            "Customers are mistaken.",
            "Status pages must always say normal."
          ],
          "answer": 0,
          "explanation": "Status communication must reflect actual customer impact, driven by effective monitoring and incident detection. A green status during a real outage shows a gap in observability or in the incident process. Accurate, timely communication is a resilience requirement, not a courtesy.",
          "why_wrong": [
            "",
            "Status pages must reflect real service state.",
            "Customer reports of failure must be investigated, not dismissed.",
            "Status pages must be accurate, not permanently green."
          ]
        },
        {
          "id": "px-17-08",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A bank must report a major ICT incident to its regulator. What determines whether an incident is reportable?",
          "options": [
            "Defined criteria such as duration, affected customers, financial impact and geographic spread, per the regulatory framework.",
            "Whether the bank feels like reporting.",
            "Whether the media notices.",
            "Whether the CEO is on holiday."
          ],
          "answer": 0,
          "explanation": "Incident reporting frameworks define thresholds and criteria for reportability, so banks assess each incident against objective measures. This ensures consistent, timely reporting of significant incidents. Discretion based on embarrassment or media attention is not the standard.",
          "why_wrong": [
            "",
            "Reporting is governed by defined criteria, not preference.",
            "Media attention does not determine reportability.",
            "Executive availability is irrelevant to reporting duties."
          ]
        },
        {
          "id": "px-17-09",
          "domain": "operations",
          "chapter": "ch87",
          "question": "A bank's resilience programme focuses only on technology recovery. What is missing?",
          "options": [
            "Nothing; technology is all that matters.",
            "People, processes, third parties, data and communications: resilience is end to end across the business service.",
            "Only marketing.",
            "Only the building."
          ],
          "answer": 1,
          "explanation": "Important business services depend on technology, people, processes, data and third parties together. A technology-only programme misses staffing, manual workarounds, provider failures and communication breakdowns. Resilience must be mapped and tested end to end.",
          "why_wrong": [
            "Technology alone cannot deliver a business service.",
            "",
            "Marketing is not the missing element.",
            "The building is only one dependency among many."
          ]
        },
        {
          "id": "px-17-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is writing a resilience requirement for a payment service. Which requirement is most precise?",
          "options": [
            "The service must recover within its agreed impact tolerance under the defined severe scenarios, with no loss of committed payment data, as proven by annual live recovery tests.",
            "The service should be resilient.",
            "The service should never fail.",
            "The service should be modern."
          ],
          "answer": 0,
          "explanation": "Precise resilience requirements name the tolerance, the scenarios, the data integrity standard and the proof method. This lets architects design to the requirement and testers verify it. Vague aspirations like resilient or never fail cannot be designed or tested.",
          "why_wrong": [
            "",
            "Resilient without measures cannot be verified.",
            "Never fail is unachievable; tolerance-based recovery is the realistic standard.",
            "Modern does not define resilience."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-18",
        "title": "Payments Expert Test 18: Payment Hub Design and State Machines",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-18-01",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A payment hub models each payment as a state machine. Why is this design valuable?",
          "options": [
            "It makes diagrams look impressive.",
            "It removes the need for a database.",
            "It guarantees payments never fail.",
            "It defines the allowed states and transitions explicitly, preventing impossible states and making behaviour predictable and auditable."
          ],
          "answer": 3,
          "explanation": "A state machine makes the payment lifecycle explicit: which states exist, which transitions are allowed and what triggers each one. This prevents invalid states, such as a payment being both settled and rejected, and makes the system testable and auditable. Implicit state scattered across flags invites errors.",
          "why_wrong": [
            "Diagrams are a byproduct; explicit lifecycle control is the value.",
            "State machines need persistent storage; they do not replace it.",
            "State machines manage failure states; they do not prevent failure.",
            ""
          ]
        },
        {
          "id": "px-18-02",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A payment is in state SETTLED. A late status message arrives suggesting it should be REJECTED. What should the state machine do?",
          "options": [
            "Reject the invalid transition, since settled is a terminal state, and raise an exception for investigation.",
            "Allow the transition and mark it rejected.",
            "Delete the payment.",
            "Create a second payment record."
          ],
          "answer": 0,
          "explanation": "Terminal states such as settled must not be overwritten by late or stale messages. The state machine must reject the invalid transition and surface the inconsistency for investigation. Allowing it would corrupt the payment record and reconciliation.",
          "why_wrong": [
            "",
            "Overwriting a terminal state corrupts the record.",
            "Deleting the payment destroys the audit trail.",
            "A second record creates duplication and reconciliation breaks."
          ]
        },
        {
          "id": "px-18-03",
          "domain": "architecture",
          "chapter": "ch48",
          "question": "A hub processes payments from many channels. Why should channel adapters be separated from core payment processing?",
          "options": [
            "Separation is unnecessary.",
            "So channels can bypass core controls.",
            "So each channel can be added or changed without touching core logic, and core rules apply consistently regardless of channel.",
            "So core logic can be duplicated per channel."
          ],
          "answer": 2,
          "explanation": "Adapters translate channel-specific formats into a common internal model, while core processing applies shared validation, routing and state rules. This separation lets new channels be added cheaply and ensures consistent control. Duplicating core logic per channel creates drift and gaps.",
          "why_wrong": [
            "Separation is a core hub design principle.",
            "Adapters must feed core controls, not bypass them.",
            "",
            "Duplication creates inconsistency; sharing is the goal."
          ]
        },
        {
          "id": "px-18-04",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A payment fails validation in the hub. Where should the failure be recorded?",
          "options": [
            "Nowhere; failed payments leave no trace.",
            "Only in a developer's notebook.",
            "Only in the customer's email.",
            "In the payment record with the failure reason, state and timestamp, so it is visible, auditable and actionable."
          ],
          "answer": 3,
          "explanation": "Every payment attempt, including failures, must leave an auditable record. The record shows what was attempted, why it failed and when, enabling customer communication, retry decisions and root cause analysis. Invisible failures cannot be managed or explained.",
          "why_wrong": [
            "Failed payments must leave an audit trail.",
            "Personal notebooks are not auditable system records.",
            "Email alone is not a system record.",
            ""
          ]
        },
        {
          "id": "px-18-05",
          "domain": "architecture",
          "chapter": "ch79",
          "question": "A hub must handle a downstream system outage without losing payments. Which design best achieves this?",
          "options": [
            "Drop payments during the outage.",
            "Tell customers to resend everything.",
            "Persist payments durably, queue them for the downstream system and retry with backoff, preserving order and state.",
            "Process payments in memory only."
          ],
          "answer": 2,
          "explanation": "Durable persistence plus queuing ensures payments survive outages and are delivered when the downstream system recovers. Retry with backoff avoids overwhelming the recovering system. In-memory-only processing would lose payments on failure.",
          "why_wrong": [
            "Dropping payments loses customer instructions.",
            "Forcing mass resends creates duplicates and customer harm.",
            "",
            "In-memory processing loses data on crash."
          ]
        },
        {
          "id": "px-18-06",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "Two updates for the same payment arrive concurrently: a settlement confirmation and a cancellation request. What must the hub ensure?",
          "options": [
            "That both are applied in any order.",
            "That the cancellation always wins.",
            "That updates are applied atomically with proper concurrency control, so the final state reflects one consistent outcome.",
            "That the settlement always wins."
          ],
          "answer": 2,
          "explanation": "Concurrent updates to the same payment must be serialised with locking or optimistic concurrency so the state machine transitions consistently. Applying both in arbitrary order can produce impossible states or lost updates. The correct outcome depends on timing and business rules, applied atomically.",
          "why_wrong": [
            "Arbitrary order can produce inconsistent states.",
            "A blanket rule ignores timing and finality rules.",
            "",
            "A blanket rule ignores valid cancellation windows."
          ]
        },
        {
          "id": "px-18-07",
          "domain": "architecture",
          "chapter": "ch48",
          "question": "A bank is consolidating several payment silos into one hub. What is the biggest risk of a big-bang migration?",
          "options": [
            "Too much success.",
            "Hubs are always risk-free.",
            "Silos are always better.",
            "A single cutover failure affects all payment types at once, with no fallback to the old systems."
          ],
          "answer": 3,
          "explanation": "Big-bang migration concentrates risk: a failure at cutover impacts every payment type simultaneously. Phased migration by channel, product or customer segment limits blast radius and allows learning. Fallback planning is essential for any cutover approach.",
          "why_wrong": [
            "Big-bang risk is concentration of failure, not success.",
            "Hub migrations carry significant risk that must be managed.",
            "Silos have their own costs; the question is migration risk.",
            ""
          ]
        },
        {
          "id": "px-18-08",
          "domain": "architecture",
          "chapter": "ch79",
          "question": "A hub's observability design includes metrics, logs and traces. Why are all three needed?",
          "options": [
            "They are redundant; one is enough.",
            "Only logs matter.",
            "Only metrics matter.",
            "Metrics show trends and alerts, logs show what happened, and traces show how a single payment flowed across services."
          ],
          "answer": 3,
          "explanation": "Metrics aggregate health and performance, logs record events in detail, and distributed traces follow one payment across services. Together they let teams detect problems, diagnose causes and trace individual payments. Each view answers questions the others cannot.",
          "why_wrong": [
            "Each observability pillar answers different questions.",
            "Logs alone cannot show trends or cross-service flow.",
            "Metrics alone cannot explain an individual payment failure.",
            ""
          ]
        },
        {
          "id": "px-18-09",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A payment stays in PENDING for hours with no update. What should the hub do?",
          "options": [
            "Detect the stuck payment through ageing alerts, investigate the cause and apply the defined timeout or escalation handling.",
            "Leave it forever.",
            "Delete it silently.",
            "Settle it automatically without confirmation."
          ],
          "answer": 0,
          "explanation": "Stuck payments indicate a downstream failure, a lost message or a processing bug. Ageing detection and alerts surface them before customers complain, and defined timeout handling resolves them consistently. Leaving them indefinitely breaches service expectations.",
          "why_wrong": [
            "",
            "Stuck payments must be detected and resolved.",
            "Silent deletion destroys the record and the instruction.",
            "Automatic settlement without confirmation risks incorrect payment."
          ]
        },
        {
          "id": "px-18-10",
          "domain": "architecture",
          "chapter": "ch48",
          "question": "A hub must support a new payment rail. What is the cleanest way to add it?",
          "options": [
            "Rewrite the entire hub.",
            "Build a separate silo with its own core logic.",
            "Add a rail adapter and configuration for routing, formats and cutoffs, reusing core validation, state and reconciliation.",
            "Hardcode the rail into every service."
          ],
          "answer": 2,
          "explanation": "A hub's value is reuse: core processing stays common while rail-specific concerns live in adapters and configuration. Adding a rail should mean new adapter, mapping, routing rules and tests, not a rewrite or a new silo. This keeps behaviour consistent and maintenance manageable.",
          "why_wrong": [
            "A rewrite is disproportionate for adding a rail.",
            "A new silo defeats the purpose of the hub.",
            "",
            "Hardcoding creates brittle, unmaintainable coupling."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-19",
        "title": "Payments Expert Test 19: Idempotency and Duplicate Handling",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-19-01",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A client retries a payment API call because the first response was lost. The API is idempotent. What should happen?",
          "options": [
            "The payment is executed twice.",
            "The retry is rejected as an error.",
            "The retry returns the original result without executing the payment again, using the idempotency key.",
            "The original payment is cancelled."
          ],
          "answer": 2,
          "explanation": "Idempotency means repeating the same request with the same key produces the same result without duplicate effect. The server recognises the key and returns the stored original outcome. This makes retries safe, which is essential in unreliable networks.",
          "why_wrong": [
            "Duplicate execution is exactly what idempotency prevents.",
            "A retry with the same key is expected, not an error.",
            "",
            "Cancellation is a separate operation, not an idempotency outcome."
          ]
        },
        {
          "id": "px-19-02",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A client sends the same idempotency key with different payment details. What should the API do?",
          "options": [
            "Execute the new details silently.",
            "Reject the request as a key conflict, since the same key must always represent the same request.",
            "Execute both versions.",
            "Ignore the key entirely."
          ],
          "answer": 1,
          "explanation": "An idempotency key is bound to the original request content. Reusing it with different details signals a client bug or misuse, and executing the new details would corrupt the idempotency guarantee. The API must reject with a clear conflict error.",
          "why_wrong": [
            "Silent execution with different details breaks the idempotency contract.",
            "",
            "Executing both creates a duplicate.",
            "Ignoring the key removes duplicate protection."
          ]
        },
        {
          "id": "px-19-03",
          "domain": "operations",
          "chapter": "ch68",
          "question": "A batch file is uploaded twice by mistake. What control should catch this before payments are duplicated?",
          "options": [
            "No control; duplicates are expected.",
            "File-level duplicate detection using file hash or control totals, plus instruction-level duplicate checks.",
            "Manual review of every file.",
            "Trusting the uploader."
          ],
          "answer": 1,
          "explanation": "Duplicate file detection compares the file hash, name, control totals or instruction identifications against recently processed files. Combined with instruction-level checks, this catches both whole-file and partial duplicates. Relying on trust or manual review alone is unreliable at volume.",
          "why_wrong": [
            "Duplicates must be controlled, not expected.",
            "",
            "Manual review does not scale and misses duplicates.",
            "Trust is not a control."
          ]
        },
        {
          "id": "px-19-04",
          "domain": "architecture",
          "chapter": "ch79",
          "question": "A payment service processes the same message twice because of a redelivery from the message queue. What design prevents double posting?",
          "options": [
            "Idempotent consumers that check whether the message was already processed, using a unique message identifier and a processed-record store.",
            "Processing messages as fast as possible.",
            "Deleting messages immediately.",
            "Using only one server."
          ],
          "answer": 0,
          "explanation": "Message queues offer at-least-once delivery, so consumers must tolerate redelivery. An idempotent consumer records processed message identifiers and skips duplicates, ensuring each message's effect happens once. This is a fundamental pattern for reliable payment processing.",
          "why_wrong": [
            "",
            "Speed does not prevent duplicate processing.",
            "Deleting messages before processing risks loss.",
            "A single server does not prevent redelivery duplicates."
          ]
        },
        {
          "id": "px-19-05",
          "domain": "operations",
          "chapter": "ch44",
          "question": "A duplicate payment is discovered after both copies settled. What is the correct recovery path?",
          "options": [
            "Do nothing and hope the beneficiary returns it.",
            "Investigate immediately, contact the beneficiary bank through the recall or return process, inform the customer and fix the control that allowed the duplicate.",
            "Debit the beneficiary account directly.",
            "Write off the loss without investigation."
          ],
          "answer": 1,
          "explanation": "Duplicate settlement requires prompt investigation, a recall or return request through the proper channels, customer communication and a control fix to prevent recurrence. Doing nothing or debiting directly would breach rules and trust. The control fix is as important as the recovery.",
          "why_wrong": [
            "Hope is not a recovery process.",
            "",
            "Direct debiting of another bank's customer is not permitted.",
            "Writing off without investigation hides the control failure."
          ]
        },
        {
          "id": "px-19-06",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "How long should idempotency keys be retained?",
          "options": [
            "They can be discarded immediately after the response.",
            "Forever, with no limit.",
            "Only for one second.",
            "Long enough to cover the realistic retry window, including client retries and reconciliation, per the API contract."
          ],
          "answer": 3,
          "explanation": "Keys must be retained for the period during which a client might legitimately retry, which can extend beyond the initial call into reconciliation windows. The retention period should be defined in the API contract. Discarding keys immediately defeats their purpose.",
          "why_wrong": [
            "Immediate discard removes retry protection.",
            "Indefinite retention is wasteful; a defined window is the right design.",
            "One second is far too short for realistic retries.",
            ""
          ]
        },
        {
          "id": "px-19-07",
          "domain": "operations",
          "chapter": "ch68",
          "question": "Two payments have the same amount, beneficiary and value date but different references and different underlying invoices. Are they duplicates?",
          "options": [
            "Yes, always.",
            "No, duplicates never share amounts.",
            "Yes, and both must be blocked.",
            "Not necessarily; genuine repeat payments can share amount and beneficiary, so duplicate detection must use references and business context, not amount alone."
          ],
          "answer": 3,
          "explanation": "Amount, beneficiary and date alone cannot prove duplication: regular payments such as rent or subscriptions repeat identically. Duplicate detection must weigh instruction references, remittance data and submission patterns. Over-aggressive blocking harms legitimate payments.",
          "why_wrong": [
            "Identical amounts do not prove duplication.",
            "Duplicates often share amounts; the point is that legitimate payments can too.",
            "Blocking both would harm legitimate payments.",
            ""
          ]
        },
        {
          "id": "px-19-08",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A payment API returns a timeout with no result. The client retries with the same idempotency key while the original is still processing. What should the API return?",
          "options": [
            "A duplicate execution.",
            "An error telling the client to use a new key.",
            "A success response for a payment that never ran.",
            "An indication that the original request is still in progress, or the original result once it completes, without duplicate execution."
          ],
          "answer": 3,
          "explanation": "The idempotency record should reflect the in-progress state. The retry must wait for or receive the original outcome, not trigger a second execution. Telling the client to use a new key would defeat idempotency and risk duplication.",
          "why_wrong": [
            "Duplicate execution breaks the idempotency guarantee.",
            "A new key would create a second payment.",
            "A false success misrepresents the payment state.",
            ""
          ]
        },
        {
          "id": "px-19-09",
          "domain": "operations",
          "chapter": "ch44",
          "question": "A bank's duplicate detection flags a payment for manual review. The reviewer is under time pressure. What is the safe action?",
          "options": [
            "Release it without checking to save time.",
            "Reject it without checking.",
            "Ask the customer to resend.",
            "Check the evidence: references, submission history and original payment state, before releasing or rejecting."
          ],
          "answer": 3,
          "explanation": "Manual review exists to apply judgment to ambiguous cases. The reviewer must examine the evidence and make a reasoned decision, documenting it. Releasing or rejecting without checking either risks duplication or harms a legitimate payment.",
          "why_wrong": [
            "Releasing unchecked risks a duplicate payment.",
            "Rejecting unchecked harms a possibly legitimate payment.",
            "Resending adds another payment to an already ambiguous situation.",
            ""
          ]
        },
        {
          "id": "px-19-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is specifying duplicate controls for a new channel. Which requirement is most complete?",
          "options": [
            "The system must detect duplicates at file, batch and instruction level using defined keys, hold suspected duplicates for review, log decisions and report duplicate rates.",
            "The system should avoid duplicates.",
            "The system should trust the channel.",
            "Duplicates are impossible, so no requirement is needed."
          ],
          "answer": 0,
          "explanation": "Complete duplicate requirements cover every level of submission, define the detection keys, specify holding and review behaviour, require logging and demand reporting. This gives developers a buildable specification and testers verifiable criteria. A vague aspiration cannot be implemented.",
          "why_wrong": [
            "",
            "Avoid duplicates is too vague to implement or test.",
            "Trust is not a control.",
            "Duplicates are a real risk that must be specified against."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-20",
        "title": "Payments Expert Test 20: Resilience Patterns and Failure Design",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-20-01",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A payment service calls a downstream system that is slow to respond. Why is a timeout essential on the call?",
          "options": [
            "Timeouts are optional decoration.",
            "Without a timeout, threads and connections pile up waiting, exhausting resources and cascading the failure to the caller.",
            "Timeouts make the downstream system faster.",
            "Timeouts prevent all errors."
          ],
          "answer": 1,
          "explanation": "A call without a timeout can wait indefinitely, holding resources that other requests need. As more requests pile up, the calling service exhausts its capacity and fails too, cascading the outage. Timeouts bound the wait and let the caller fail fast and recover.",
          "why_wrong": [
            "Timeouts are a critical resilience control.",
            "",
            "Timeouts bound waiting; they do not speed up the downstream system.",
            "Timeouts manage failure; they do not prevent it."
          ]
        },
        {
          "id": "px-20-02",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A downstream system is failing. A circuit breaker opens. What does this achieve?",
          "options": [
            "It stops sending requests to the failing system, letting it recover, and returns fast failures instead of piling up load.",
            "It makes the downstream system work again.",
            "It deletes all queued payments.",
            "It hides the failure from monitoring."
          ],
          "answer": 0,
          "explanation": "A circuit breaker detects repeated failures and stops calling the failing dependency, preventing overload during recovery. Callers fail fast rather than waiting, and the breaker periodically probes for recovery. This pattern contains failures instead of amplifying them.",
          "why_wrong": [
            "",
            "The breaker protects the dependency; it does not fix it.",
            "Queued payments must be preserved, not deleted.",
            "Breaker state must be visible in monitoring."
          ]
        },
        {
          "id": "px-20-03",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A service retries a failed call immediately in a tight loop. What is the danger?",
          "options": [
            "No danger; retries are always safe.",
            "Retries always succeed.",
            "Retry storms: the retries add load to an already struggling system, worsening the outage.",
            "Retries use no resources."
          ],
          "answer": 2,
          "explanation": "Immediate, unbounded retries multiply the load on a failing system exactly when it can least handle it. Backoff, jitter and retry limits spread retries over time and bound the load. Retries must be designed as a controlled pattern, not an uncontrolled loop.",
          "why_wrong": [
            "Uncontrolled retries are a well-known failure amplifier.",
            "Retries against a failing system often fail again.",
            "",
            "Retries consume connections, threads and downstream capacity."
          ]
        },
        {
          "id": "px-20-04",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "Why should retries use exponential backoff with jitter?",
          "options": [
            "To make retries slower for no reason.",
            "To guarantee success.",
            "To confuse monitoring.",
            "Backoff spaces retries out as failures persist, and jitter prevents many clients retrying at the same instant."
          ],
          "answer": 3,
          "explanation": "Exponential backoff increases the wait between retries, giving the downstream system time to recover. Jitter randomises the wait so synchronised clients do not retry in a thundering herd. Together they make retries safe at scale.",
          "why_wrong": [
            "Spacing retries protects the recovering system.",
            "Backoff improves the chance of recovery; it cannot guarantee success.",
            "Jitter improves behaviour; it does not confuse monitoring.",
            ""
          ]
        },
        {
          "id": "px-20-05",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A payment service uses bulkheads to isolate dependencies. What does this mean?",
          "options": [
            "The service runs on a ship.",
            "All dependencies share one pool.",
            "Bulkheads remove the need for timeouts.",
            "Resources such as thread pools are partitioned per dependency, so one slow dependency cannot consume all capacity."
          ],
          "answer": 3,
          "explanation": "Bulkheads, borrowed from ship design, partition resources so a failure in one compartment does not flood the whole vessel. In software, separate thread pools or connection pools per dependency contain the blast radius of a slow or failing dependency. Other dependencies keep working.",
          "why_wrong": [
            "The term is an analogy; the service does not run on a ship.",
            "Sharing one pool is the opposite of bulkheading.",
            "Bulkheads complement timeouts; they do not replace them.",
            ""
          ]
        },
        {
          "id": "px-20-06",
          "domain": "architecture",
          "chapter": "ch46",
          "question": "A real-time payment service degrades gracefully when a non-critical feature fails. What does graceful degradation mean here?",
          "options": [
            "The whole service shuts down.",
            "All features fail together.",
            "Errors are hidden from users.",
            "Core payment processing continues while the non-critical feature is temporarily disabled, with clear user communication."
          ],
          "answer": 3,
          "explanation": "Graceful degradation prioritises the core service: payments keep flowing while secondary features, such as rich notifications or analytics, are temporarily shed. Users are told what is unavailable. This trade-off preserves the most important capability during partial failure.",
          "why_wrong": [
            "Shutdown is the opposite of graceful degradation.",
            "Isolating failure to non-critical features is the point.",
            "Users must be told what is degraded.",
            ""
          ]
        },
        {
          "id": "px-20-07",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A service fails over to a standby site. What must be true about the data for failover to be safe?",
          "options": [
            "Data does not matter.",
            "The standby can start empty.",
            "Failover always loses data acceptably.",
            "The standby must hold a consistent, sufficiently current copy of payment state, with no committed payment lost or duplicated."
          ],
          "answer": 3,
          "explanation": "Failover safety depends on data replication: the standby must reflect committed payment states accurately. Losing committed payments or duplicating them during failover breaks reconciliation and customer trust. Replication lag and consistency must be understood and tested.",
          "why_wrong": [
            "Payment state data is central to safe failover.",
            "An empty standby would lose all in-flight payments.",
            "Data loss on failover is not acceptable for committed payments.",
            ""
          ]
        },
        {
          "id": "px-20-08",
          "domain": "architecture",
          "chapter": "ch79",
          "question": "A team runs chaos engineering exercises on its payment platform. What is the purpose?",
          "options": [
            "To deliberately inject controlled failures in safe environments to prove resilience patterns work before a real incident.",
            "To break production for fun.",
            "To avoid all testing.",
            "To replace monitoring."
          ],
          "answer": 0,
          "explanation": "Chaos engineering tests resilience hypotheses by injecting failures such as latency, dependency loss or resource pressure in controlled conditions. Finding weaknesses in testing is far cheaper than finding them during a real outage. Exercises must be bounded and safe.",
          "why_wrong": [
            "",
            "Chaos exercises are controlled and purposeful, not destructive fun.",
            "Chaos engineering is a form of testing, not its replacement.",
            "It complements monitoring; it does not replace it."
          ]
        },
        {
          "id": "px-20-09",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A payment service is deployed as a single instance with no redundancy. What is the resilience assessment?",
          "options": [
            "Fully resilient.",
            "A single point of failure: any host, deployment or process failure takes down the service.",
            "Redundancy is never needed.",
            "Single instances are faster and therefore more resilient."
          ],
          "answer": 1,
          "explanation": "A single instance has no capacity to survive host failure, bad deployment or process crash. Resilience requires redundant instances, health checking and load balancing so the service survives individual failures. Speed does not compensate for the absence of redundancy.",
          "why_wrong": [
            "A single instance is the opposite of resilient.",
            "",
            "Redundancy is fundamental to availability.",
            "Speed and resilience are different properties."
          ]
        },
        {
          "id": "px-20-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is writing failure requirements for a payment API. Which set is most complete?",
          "options": [
            "The API should work.",
            "The API should never fail.",
            "Timeouts, retry and idempotency behaviour, circuit breaker expectations, error codes, degraded-mode behaviour and recovery objectives, all testable.",
            "Failure handling is the vendor's problem."
          ],
          "answer": 2,
          "explanation": "Complete failure requirements cover every resilience pattern the API must exhibit, with testable measures. Developers can build to them and testers can verify each behaviour under injected failure. Vague aspirations leave failure handling to chance.",
          "why_wrong": [
            "Should work is not a testable failure requirement.",
            "Never fail is unachievable; managed failure is the goal.",
            "",
            "Failure handling must be specified regardless of vendor."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-21",
        "title": "Payments Expert Test 21: API Design for Payment Initiation",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-21-01",
          "domain": "apis",
          "chapter": "ch80",
          "question": "A payment initiation API uses POST to create a payment. Why is POST the right method rather than GET?",
          "options": [
            "GET is faster.",
            "POST is for creating resources with side effects, while GET must be safe and have no side effects; a payment must never be triggered by a GET.",
            "POST and GET are identical.",
            "GET cannot carry any data."
          ],
          "answer": 1,
          "explanation": "HTTP semantics matter: GET requests must be safe and idempotent, and may be retried, cached or prefetched. A payment creation has side effects and must use POST. Using GET for payments would risk accidental execution by crawlers, caches or retries.",
          "why_wrong": [
            "Speed does not override HTTP safety semantics.",
            "",
            "POST and GET have different semantics for side effects.",
            "GET can carry query data; the issue is safety semantics."
          ]
        },
        {
          "id": "px-21-02",
          "domain": "apis",
          "chapter": "ch80",
          "question": "A payment API returns 200 OK for a payment that was rejected by validation. What is wrong?",
          "options": [
            "Nothing; 200 means the server responded.",
            "APIs must always return 200.",
            "The status code misleads clients: validation failures should return a 4xx error so clients can handle them correctly.",
            "Status codes are decorative."
          ],
          "answer": 2,
          "explanation": "HTTP status codes are part of the API contract. A 200 signals success, so returning it for a rejection misleads clients, breaks error handling and corrupts monitoring. Validation failures belong in the 4xx range with a structured error body.",
          "why_wrong": [
            "A response is not the same as success; the code must reflect the outcome.",
            "APIs must use status codes meaningfully.",
            "",
            "Status codes drive client behaviour and monitoring."
          ]
        },
        {
          "id": "px-21-03",
          "domain": "apis",
          "chapter": "ch80",
          "question": "A payment API needs versioning. Which approach best protects existing clients when a breaking change is needed?",
          "options": [
            "Change the existing endpoints silently.",
            "Break all clients at once.",
            "Introduce a new versioned endpoint, keep the old version running for a defined deprecation period and communicate the migration path.",
            "Never change the API."
          ],
          "answer": 2,
          "explanation": "Versioning with a deprecation period lets existing clients keep working while they migrate. Silent breaking changes disrupt clients without warning and damage trust. A clear migration path and timeline are part of professional API management.",
          "why_wrong": [
            "Silent changes break clients without warning.",
            "Breaking all clients at once is unacceptable.",
            "",
            "APIs must evolve; freezing them prevents improvement."
          ]
        },
        {
          "id": "px-21-04",
          "domain": "apis",
          "chapter": "ch80",
          "question": "A payment API accepts requests without authentication in a test environment that mirrors production data. What is the risk?",
          "options": [
            "Unauthenticated access to production-like data exposes sensitive payment information and allows unauthorised initiation.",
            "No risk in test environments.",
            "Test environments are always isolated.",
            "Authentication is only needed in production."
          ],
          "answer": 0,
          "explanation": "Test environments holding real or production-like data need the same access controls as production. Unauthenticated APIs invite data exposure and unauthorised actions. Security must follow the data, not the environment label.",
          "why_wrong": [
            "",
            "Test data exposure is a real risk.",
            "Isolation cannot be assumed; controls must be verified.",
            "Authentication is needed wherever sensitive data or actions exist."
          ]
        },
        {
          "id": "px-21-05",
          "domain": "apis",
          "chapter": "ch80",
          "question": "A client polls a payment status endpoint every second for hours. What should the API design offer instead?",
          "options": [
            "Webhooks or event notifications that push status changes to the client, reducing load and latency.",
            "Nothing; polling is ideal.",
            "Slower polling only.",
            "No status information at all."
          ],
          "answer": 0,
          "explanation": "Polling at high frequency wastes resources and still delivers stale information between polls. Webhooks push status changes as they happen, giving faster updates with far less load. Polling can remain as a fallback, but push notification is the scalable design.",
          "why_wrong": [
            "",
            "High-frequency polling wastes resources and adds latency.",
            "Slower polling increases latency without solving the load problem.",
            "Status information is essential; the delivery method is the issue."
          ]
        },
        {
          "id": "px-21-06",
          "domain": "apis",
          "chapter": "ch80",
          "question": "A webhook delivers a payment status update, but the receiving system is down. What must the webhook design handle?",
          "options": [
            "Retries with backoff, durable event storage and a way for the receiver to reconcile missed events.",
            "Nothing; lost webhooks do not matter.",
            "Sending each event only once with no retry.",
            "Deleting the event."
          ],
          "answer": 0,
          "explanation": "Webhooks are delivered over unreliable networks to systems that may be down. Reliable design requires durable events, retries with backoff and a reconciliation mechanism such as a status query API. Fire-and-forget delivery loses critical status updates.",
          "why_wrong": [
            "",
            "Lost status updates break the receiver's payment state.",
            "Single delivery with no retry is unreliable.",
            "Deleting events destroys the notification."
          ]
        },
        {
          "id": "px-21-07",
          "domain": "apis",
          "chapter": "ch80",
          "question": "A payment API error response includes only the text Error. What is missing?",
          "options": [
            "Nothing; Error is sufficient.",
            "A stack trace.",
            "A structured error with a code, a clear message, the field or reason involved and guidance on how to fix it.",
            "The server's internal IP address."
          ],
          "answer": 2,
          "explanation": "Developers need structured, actionable errors: a stable code for programmatic handling, a human-readable message, the affected field and remediation guidance. A bare Error forces guesswork and support calls. Good errors are a core part of API usability.",
          "why_wrong": [
            "A bare Error gives developers nothing to act on.",
            "Stack traces leak internals and do not help clients.",
            "",
            "Internal addresses are sensitive and unhelpful."
          ]
        },
        {
          "id": "px-21-08",
          "domain": "apis",
          "chapter": "ch26",
          "question": "An API uses OAuth 2.0 with short-lived access tokens. Why are short lifetimes preferred for payment APIs?",
          "options": [
            "To annoy developers.",
            "Short tokens are easier to guess.",
            "To limit the damage if a token is stolen, since the token stops working quickly, while refresh flows obtain new tokens securely.",
            "Long tokens are illegal."
          ],
          "answer": 2,
          "explanation": "Short-lived tokens bound the exposure window after theft or leakage. Refresh tokens and secure re-authentication let legitimate clients continue without long-lived credentials sitting in the wild. This is a standard defence-in-depth practice for sensitive APIs.",
          "why_wrong": [
            "Short lifetimes are a security control, not an annoyance.",
            "Token length and lifetime are different properties.",
            "",
            "Long tokens are not illegal, but short ones are safer."
          ]
        },
        {
          "id": "px-21-09",
          "domain": "apis",
          "chapter": "ch80",
          "question": "A payment API must support a corporate client sending thousands of payments. What design best serves this need?",
          "options": [
            "Bulk initiation with clear limits, asynchronous processing, per-item status and idempotency, plus published rate limits.",
            "One payment per call with no batching, no rate limit communication.",
            "A single call with unlimited size.",
            "Manual entry only."
          ],
          "answer": 0,
          "explanation": "Bulk initiation with asynchronous processing handles volume efficiently: the client submits a batch, the API processes items and reports per-item status. Published limits and idempotency make the integration predictable and safe. Unlimited single calls and manual entry do not scale.",
          "why_wrong": [
            "",
            "Unbatched calls at volume are slow and fragile.",
            "Unlimited calls risk timeouts and resource exhaustion.",
            "Manual entry cannot handle thousands of payments."
          ]
        },
        {
          "id": "px-21-10",
          "domain": "apis",
          "chapter": "ch80",
          "question": "A BA is reviewing an API specification for payment initiation. Which element is most critical for safe integration?",
          "options": [
            "The colour scheme of the documentation.",
            "The length of the document.",
            "The number of examples.",
            "The complete contract: endpoints, request and response schemas, error codes, idempotency, authentication, versioning and status semantics."
          ],
          "answer": 3,
          "explanation": "Safe integration depends on a complete, precise contract covering every behaviour a client must handle. Missing error semantics or idempotency rules lead to incorrect implementations and duplicate payments. Documentation quality is measured by completeness and precision, not appearance.",
          "why_wrong": [
            "Appearance does not determine integration safety.",
            "Length alone does not guarantee completeness.",
            "Examples help but do not replace the contract.",
            ""
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-22",
        "title": "Payments Expert Test 22: Multi-Leg Investigations and Case Management",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-22-01",
          "domain": "operations",
          "chapter": "ch75",
          "question": "A cross-border payment passes through three banks and the beneficiary claims non-receipt. Where should the investigation start?",
          "options": [
            "By blaming the last bank.",
            "By refunding immediately without tracing.",
            "By asking the beneficiary to wait indefinitely.",
            "By tracing the payment leg by leg from the payer bank, confirming each hop's status and the final credit position."
          ],
          "answer": 3,
          "explanation": "Multi-leg investigations must follow the chain systematically, confirming each bank's handling and the current location of the funds. Starting with blame or an unexamined refund risks paying twice or missing the real failure point. A leg-by-leg trace produces evidence for each step.",
          "why_wrong": [
            "Blame without evidence does not locate the funds.",
            "Refunding without tracing risks double payment.",
            "Indefinite waiting abandons the customer.",
            ""
          ]
        },
        {
          "id": "px-22-02",
          "domain": "operations",
          "chapter": "ch73",
          "question": "An investigation case involves several banks and takes weeks. What case management practice keeps it on track?",
          "options": [
            "A single case record with the payment references, each bank's response, deadlines, owner and next action, updated at every step.",
            "No tracking; rely on memory.",
            "A new case for every message.",
            "Verbal updates only."
          ],
          "answer": 0,
          "explanation": "Complex investigations need one authoritative case record that holds the full history, the evidence from each bank, the owner and the next action. This prevents duplicated work, lost messages and missed deadlines. Fragmented or verbal tracking loses the thread.",
          "why_wrong": [
            "",
            "Memory cannot track multi-week, multi-bank cases.",
            "Multiple cases fragment the history.",
            "Verbal updates leave no auditable record."
          ]
        },
        {
          "id": "px-22-03",
          "domain": "operations",
          "chapter": "ch75",
          "question": "A bank in the chain does not respond to an investigation query. What should the investigating bank do?",
          "options": [
            "Escalate through defined channels, set deadlines, document the non-response and keep the customer informed of progress.",
            "Give up after one message.",
            "Send the payment again.",
            "Close the case as resolved."
          ],
          "answer": 0,
          "explanation": "Non-response is a common investigation obstacle that must be managed through escalation, deadlines and documentation. The customer must be kept informed even when the news is that the bank is still waiting. Giving up or closing the case abandons the investigation.",
          "why_wrong": [
            "",
            "One message is not a sufficient investigation effort.",
            "Resending creates duplicate risk.",
            "Closing an unresolved case misrepresents the position."
          ]
        },
        {
          "id": "px-22-04",
          "domain": "operations",
          "chapter": "ch73",
          "question": "Two investigation cases are opened for the same payment by different channels. What is the correct handling?",
          "options": [
            "Run both independently.",
            "Delete both.",
            "Ignore the second case.",
            "Link or merge them into one case so all evidence and actions are visible in one place and the customer gets one consistent answer."
          ],
          "answer": 3,
          "explanation": "Duplicate cases cause duplicated queries to counterparties, inconsistent customer answers and wasted effort. Linking or merging preserves all evidence under one case with one owner. The customer receives a single, coherent update.",
          "why_wrong": [
            "Independent cases duplicate work and risk inconsistent answers.",
            "Deleting cases destroys evidence and history.",
            "Ignoring a case leaves a customer query unanswered.",
            ""
          ]
        },
        {
          "id": "px-22-05",
          "domain": "operations",
          "chapter": "ch75",
          "question": "An investigation reveals the payment was credited to the wrong account due to an intermediary's error. Who should bear the cost of recovery?",
          "options": [
            "Always the payer.",
            "Always the beneficiary bank.",
            "Nobody; the loss is shared equally by all banks.",
            "The party whose error caused the misdirection normally bears the recovery responsibility, under the applicable scheme and legal framework."
          ],
          "answer": 3,
          "explanation": "Responsibility for errors follows the cause: the bank that made the error normally bears the duty to recover and any resulting cost, subject to scheme rules and agreements. Automatic allocation to the payer or the beneficiary bank ignores the facts. The investigation evidence determines the allocation.",
          "why_wrong": [
            "The payer did not cause the intermediary's error.",
            "The beneficiary bank is not automatically responsible for an intermediary's error.",
            "Equal sharing ignores the actual cause.",
            ""
          ]
        },
        {
          "id": "px-22-06",
          "domain": "operations",
          "chapter": "ch73",
          "question": "A customer is told an investigation will take five days, but it takes fifteen with no updates. What has failed?",
          "options": [
            "Nothing; investigations always take longer.",
            "Expectation management: the bank must update the customer when timelines slip and explain the reason and the next step.",
            "The customer, for expecting updates.",
            "The payment system, for being slow."
          ],
          "answer": 1,
          "explanation": "Customers accept that complex investigations take time, but they must be kept informed when promised timelines slip. Proactive updates with reasons and next steps maintain trust even when the outcome is delayed. Silence breeds complaints and escalation.",
          "why_wrong": [
            "Longer timelines without updates breach service expectations.",
            "",
            "Customers are entitled to updates on their own cases.",
            "The system may be slow, but communication is the bank's duty."
          ]
        },
        {
          "id": "px-22-07",
          "domain": "operations",
          "chapter": "ch75",
          "question": "An investigation query uses the wrong payment reference. What is the likely result?",
          "options": [
            "The query will fail to match, causing delay while the correct reference is established.",
            "The receiving bank will guess the correct payment.",
            "The payment will be refunded automatically.",
            "References do not matter in investigations."
          ],
          "answer": 0,
          "explanation": "Investigation queries match on references such as the transaction identification. A wrong reference means the receiving bank cannot find the payment, so the query stalls until corrected. Reference accuracy is as important in investigations as in the original payment.",
          "why_wrong": [
            "",
            "Banks cannot guess which payment a query concerns.",
            "A failed match does not trigger a refund.",
            "References are the key to matching queries to payments."
          ]
        },
        {
          "id": "px-22-08",
          "domain": "operations",
          "chapter": "ch73",
          "question": "A bank measures investigation performance. Which metric best reflects customer experience?",
          "options": [
            "The number of investigation staff.",
            "The number of desks in the office.",
            "Time to first substantive update, time to resolution and the share of cases resolved without the customer chasing.",
            "The volume of messages sent."
          ],
          "answer": 2,
          "explanation": "Customers experience investigations through communication speed, resolution time and whether they must chase. Metrics on first update, resolution time and chase rates directly reflect that experience. Staff numbers and message volumes do not measure outcomes.",
          "why_wrong": [
            "Staff numbers do not measure customer experience.",
            "Office furniture is irrelevant.",
            "",
            "Message volume measures activity, not outcomes."
          ]
        },
        {
          "id": "px-22-09",
          "domain": "operations",
          "chapter": "ch75",
          "question": "A payment investigation involves a suspected fraud. What additional handling is required?",
          "options": [
            "Treat it exactly like a routine delay.",
            "Tell the suspected fraudster everything.",
            "Apply fraud procedures: preserve evidence, restrict information appropriately, escalate to fraud teams and consider reporting duties.",
            "Delete the evidence to protect privacy."
          ],
          "answer": 2,
          "explanation": "Suspected fraud triggers specialist handling: evidence preservation, careful information sharing, fraud team involvement and potential reporting. Routine delay handling would miss the risk and could compromise recovery or investigation. The case must be flagged and routed correctly from the moment fraud is suspected.",
          "why_wrong": [
            "Fraud cases need specialist handling, not routine handling.",
            "Sharing everything with a suspect compromises the investigation.",
            "",
            "Deleting evidence destroys the investigation."
          ]
        },
        {
          "id": "px-22-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is specifying case management for payment investigations. Which requirement is most valuable?",
          "options": [
            "Cases should be handled quickly.",
            "Cases should be stored on paper.",
            "Each case must link to the payment record, hold all counterpart messages, enforce SLA timers with escalation, and produce a complete audit trail.",
            "Cases need no SLA."
          ],
          "answer": 2,
          "explanation": "Valuable case requirements link the case to the payment, preserve all evidence, enforce service levels with escalation and guarantee an audit trail. This makes investigations manageable, measurable and auditable. A vague speed aspiration cannot be built or tested.",
          "why_wrong": [
            "Quickly without measures cannot be implemented.",
            "Paper storage defeats searchability and audit.",
            "",
            "SLAs are essential for managing investigation timeliness."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-23",
        "title": "Payments Expert Test 23: Nostro Breaks and Reconciliation Depth",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-23-01",
          "domain": "operations",
          "chapter": "ch40",
          "question": "A nostro account statement shows a debit the bank's ledger does not expect. What is this called and what is the first step?",
          "options": [
            "A profit; record it as income.",
            "A rounding error; ignore it.",
            "A break; investigate by matching the statement entry to ledger records, payment references and value dates.",
            "A bonus; distribute it to staff."
          ],
          "answer": 2,
          "explanation": "A break is a difference between the nostro statement and the bank's own records. The first step is investigation: matching the entry against payments, charges, value dates and references to find the cause. Ignoring or misrecording a break hides a real funds difference.",
          "why_wrong": [
            "An unexpected debit is not income.",
            "Unexplained differences must be investigated, not dismissed.",
            "",
            "Statement differences are not distributable funds."
          ]
        },
        {
          "id": "px-23-02",
          "domain": "operations",
          "chapter": "ch71",
          "question": "A nostro break is caused by a value date difference: the statement shows a payment one day earlier than the ledger. What is the correct treatment?",
          "options": [
            "Recognise it as a timing break, track it until the dates align, and confirm it clears without a real funds difference.",
            "Write off the amount immediately.",
            "Delete the ledger entry.",
            "Charge the customer twice."
          ],
          "answer": 0,
          "explanation": "Timing breaks arise when the same transaction is recorded on different dates in the two records. They should clear as the dates align, but must be tracked until they do, in case the difference is real. Writing off a timing difference creates a false loss.",
          "why_wrong": [
            "",
            "Timing breaks clear naturally; write-off is premature.",
            "Deleting the entry destroys the record.",
            "Double charging compounds the error."
          ]
        },
        {
          "id": "px-23-03",
          "domain": "operations",
          "chapter": "ch40",
          "question": "A nostro account has an ageing break that has been open for 90 days. What does this indicate?",
          "options": [
            "Excellent reconciliation.",
            "Normal practice for all breaks.",
            "The break will resolve itself.",
            "A control failure: breaks must be investigated and resolved promptly, and ageing breaks signal unresolved funds differences or process gaps."
          ],
          "answer": 3,
          "explanation": "Breaks should be resolved within defined timeframes. A 90-day-old break means the difference has not been explained, which may hide a loss, a misdirected payment or a process failure. Ageing breaks require escalation and root cause action.",
          "why_wrong": [
            "Ageing breaks indicate poor, not excellent, reconciliation.",
            "Prompt resolution is the standard; 90 days is not normal.",
            "Old breaks rarely resolve without action.",
            ""
          ]
        },
        {
          "id": "px-23-04",
          "domain": "operations",
          "chapter": "ch40",
          "question": "Why is daily nostro reconciliation important, rather than monthly?",
          "options": [
            "Daily reconciliation is a waste of time.",
            "Daily matching catches breaks while evidence is fresh, counterparties can still act and losses can still be recovered.",
            "Monthly reconciliation catches everything.",
            "Daily reconciliation is only for show."
          ],
          "answer": 1,
          "explanation": "The sooner a break is found, the fresher the evidence, the more responsive the counterparty and the better the chance of recovery. Monthly reconciliation lets breaks age, evidence decay and losses harden. Daily reconciliation is a core operational control.",
          "why_wrong": [
            "Daily reconciliation is a key control, not a waste.",
            "",
            "Monthly cycles let breaks age for weeks.",
            "Daily reconciliation produces real control value."
          ]
        },
        {
          "id": "px-23-05",
          "domain": "operations",
          "chapter": "ch71",
          "question": "A nostro break is caused by an unadvised charge deducted by the correspondent bank. How should it be resolved?",
          "options": [
            "Accept the charge without question.",
            "Deduct the same amount from a customer.",
            "Hide the charge in a suspense account forever.",
            "Query the charge with the correspondent, verify it against the agreement and charges schedule, and record the outcome."
          ],
          "answer": 3,
          "explanation": "Charges must match the agreed schedule and the services provided. An unadvised or incorrect charge should be queried with evidence, and the resolution recorded. Accepting charges without verification wastes money and hides billing errors.",
          "why_wrong": [
            "Charges must be verified against agreements.",
            "Passing an unverified charge to a customer is wrong.",
            "Suspense accounts are temporary; breaks must be resolved.",
            ""
          ]
        },
        {
          "id": "px-23-06",
          "domain": "operations",
          "chapter": "ch40",
          "question": "A reconciliation system auto-matches 95 percent of nostro entries. What should happen to the remaining 5 percent?",
          "options": [
            "They are ignored.",
            "They are written off automatically.",
            "They are queued for manual investigation with prioritisation by value and age, and root causes are tracked.",
            "They are matched randomly."
          ],
          "answer": 2,
          "explanation": "Unmatched entries are the exceptions that need human judgment. They must be queued, prioritised and investigated, with root causes recorded to improve matching rules. Ignoring or auto-writing them off defeats the purpose of reconciliation.",
          "why_wrong": [
            "Unmatched entries need investigation, not ignorance.",
            "Automatic write-off hides real differences.",
            "",
            "Random matching creates false reconciliation."
          ]
        },
        {
          "id": "px-23-07",
          "domain": "operations",
          "chapter": "ch90",
          "question": "A bank's ledger and nostro statement agree in total but individual entries differ. What does this suggest?",
          "options": [
            "Perfect reconciliation.",
            "Offsetting breaks: two or more errors cancel in total while individual entries are wrong, so entry-level matching is essential.",
            "No investigation is needed.",
            "Totals are the only thing that matters."
          ],
          "answer": 1,
          "explanation": "Agreement in total can hide offsetting errors: an overstatement and an understatement that cancel. Entry-level matching is required to detect these. Total-only reconciliation gives false comfort while individual payments are wrong.",
          "why_wrong": [
            "Total agreement can hide entry-level errors.",
            "",
            "Entry-level differences need investigation.",
            "Entry-level accuracy matters for customers and audit."
          ]
        },
        {
          "id": "px-23-08",
          "domain": "operations",
          "chapter": "ch40",
          "question": "A suspense account holds unreconciled payment items. What is the correct discipline for suspense accounts?",
          "options": [
            "Let items accumulate indefinitely.",
            "Clear items promptly, age and escalate old items, and never use suspense as a permanent home for unexplained differences.",
            "Use suspense to hide losses.",
            "Post all payments to suspense."
          ],
          "answer": 1,
          "explanation": "Suspense accounts are temporary holding places for items awaiting resolution. Discipline requires prompt clearing, ageing review and escalation, so unexplained items do not accumulate. Using suspense to hide losses is a serious control failure.",
          "why_wrong": [
            "Indefinite accumulation hides unresolved differences.",
            "",
            "Hiding losses in suspense is a control breach.",
            "Only exceptional items belong in suspense."
          ]
        },
        {
          "id": "px-23-09",
          "domain": "operations",
          "chapter": "ch40",
          "question": "A nostro statement arrives late, delaying reconciliation. What is the operational risk?",
          "options": [
            "No risk.",
            "Late statements improve accuracy.",
            "Reconciliation becomes unnecessary.",
            "Breaks go undetected longer, funding decisions use stale balances and recovery windows narrow."
          ],
          "answer": 3,
          "explanation": "Timely statements are the input to timely reconciliation. Late statements delay break detection, leave funding decisions based on stale data and shrink the window for recovery or correction. Statement timeliness must be monitored and escalated with the correspondent.",
          "why_wrong": [
            "Late statements delay a critical control.",
            "Lateness does not improve accuracy.",
            "Reconciliation remains necessary regardless of timing.",
            ""
          ]
        },
        {
          "id": "px-23-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is specifying auto-matching rules for nostro reconciliation. Which rule design is safest?",
          "options": [
            "Match on a combination of amount, value date, reference and counterparty, with tolerances defined and all auto-matches logged and reversible.",
            "Match on amount alone.",
            "Match randomly to save time.",
            "Match only on the first character of the reference."
          ],
          "answer": 0,
          "explanation": "Safe auto-matching uses multiple fields so false matches are unlikely, defines tolerances explicitly and logs every match for audit and reversal. Single-field matching creates false matches that hide real breaks. The design must balance automation with accuracy.",
          "why_wrong": [
            "",
            "Amount alone produces false matches.",
            "Random matching is not reconciliation.",
            "One character is far too weak a match key."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-24",
        "title": "Payments Expert Test 24: Timeout, Reversal and Uncertainty Design",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-24-01",
          "domain": "operations",
          "chapter": "ch72",
          "question": "A payment request times out. The system cannot tell whether the downstream system processed it. What state should the payment be given?",
          "options": [
            "Failed, definitively.",
            "Settled, definitively.",
            "Deleted.",
            "Uncertain or unknown, pending investigation, with duplicate resends blocked."
          ],
          "answer": 3,
          "explanation": "Timeout means unknown: the request may have been processed, may have failed or may still be processing. Marking it definitively failed or settled would misrepresent reality. An uncertain state with investigation and duplicate protection is the only honest handling.",
          "why_wrong": [
            "Timeout does not prove failure.",
            "Timeout does not prove settlement.",
            "Deleting destroys the record and the ability to resolve.",
            ""
          ]
        },
        {
          "id": "px-24-02",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A system automatically reverses a payment after a timeout. What is the danger if the original payment had in fact settled?",
          "options": [
            "No danger.",
            "The reversal creates a second, incorrect funds movement, potentially taking money the beneficiary is entitled to keep.",
            "Reversals always succeed safely.",
            "The beneficiary will not notice."
          ],
          "answer": 1,
          "explanation": "Reversal is itself a funds movement. If the original settled correctly, an automatic reversal wrongly removes funds from the beneficiary. Reversals must only follow confirmed knowledge of the original outcome, not assumptions from a timeout.",
          "why_wrong": [
            "An incorrect reversal is a real funds error.",
            "",
            "Reversals need confirmation of the original state.",
            "Beneficiaries notice missing funds and will dispute."
          ]
        },
        {
          "id": "px-24-03",
          "domain": "operations",
          "chapter": "ch72",
          "question": "A payment is debited from the payer but the credit to the beneficiary is uncertain. What must the bank avoid telling the customer?",
          "options": [
            "That the payment is being investigated.",
            "That the bank is working on it.",
            "That the payment has definitely succeeded or definitely failed, when the outcome is not yet known.",
            "The expected resolution time."
          ],
          "answer": 2,
          "explanation": "Customer communication during uncertainty must be honest: the bank is investigating and will confirm the outcome. Stating a definite outcome that is not yet known misleads the customer and may cause them to act on false information. Honest uncertainty is better than false certainty.",
          "why_wrong": [
            "Stating that investigation is underway is honest and appropriate.",
            "Saying the bank is working on it is honest.",
            "",
            "An expected time is helpful if given honestly."
          ]
        },
        {
          "id": "px-24-04",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "What is a compensating transaction in payment processing?",
          "options": [
            "A payment that compensates staff.",
            "A duplicate payment.",
            "A new transaction that offsets the effect of an earlier one, used when the original cannot simply be undone.",
            "A marketing payment."
          ],
          "answer": 2,
          "explanation": "Many payment effects cannot be undone by deleting a record: funds have moved and records are auditable. A compensating transaction, such as a return or a correcting payment, offsets the effect while preserving the full history. This is the standard pattern for correction in financial systems.",
          "why_wrong": [
            "Compensation here means offsetting a transaction, not paying staff.",
            "A compensating transaction is deliberate and linked, not a duplicate.",
            "",
            "It is a correction mechanism, not marketing."
          ]
        },
        {
          "id": "px-24-05",
          "domain": "operations",
          "chapter": "ch72",
          "question": "A reversal request arrives for a payment that was already returned. What should the system do?",
          "options": [
            "Reverse it again.",
            "Detect that the payment is already in a returned state and reject the duplicate reversal, logging the attempt.",
            "Create a new payment.",
            "Ignore the payment state entirely."
          ],
          "answer": 1,
          "explanation": "State awareness prevents double reversals. The system must check the current state and reject a reversal that has already been applied, while logging the attempt for audit. Blindly reversing again would double-remove funds.",
          "why_wrong": [
            "A second reversal would double-remove funds.",
            "",
            "A new payment is not the response to a duplicate reversal.",
            "Payment state must govern reversal handling."
          ]
        },
        {
          "id": "px-24-06",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A distributed payment flow has no single transaction spanning all systems. How is consistency achieved?",
          "options": [
            "It cannot be achieved.",
            "Through patterns such as sagas with compensating actions, idempotent operations and reconciliation that detects and corrects divergence.",
            "By hoping all systems agree.",
            "By using one giant database for everything."
          ],
          "answer": 1,
          "explanation": "Distributed flows achieve eventual consistency through explicit design: sagas coordinate steps with compensating actions on failure, idempotency prevents duplicate effects and reconciliation catches divergence. Hoping for agreement is not a design. A single database is rarely feasible across independent systems.",
          "why_wrong": [
            "Consistency is achievable through explicit patterns.",
            "",
            "Hope is not a consistency mechanism.",
            "Independent systems cannot share one database in practice."
          ]
        },
        {
          "id": "px-24-07",
          "domain": "operations",
          "chapter": "ch72",
          "question": "A timeout occurs during a card authorisation. The cardholder was not charged, but the merchant believes the sale completed. What resolves the dispute?",
          "options": [
            "The merchant's belief alone.",
            "The authorisation and clearing records, which show whether an authorisation was approved and whether a clearing record followed.",
            "The cardholder's word alone.",
            "Deleting all records."
          ],
          "answer": 1,
          "explanation": "Authorisation and clearing records are the evidence of what happened. If no authorisation was approved, no charge exists regardless of the merchant's belief. If an authorisation exists without clearing, the hold will expire under scheme rules. Records, not beliefs, resolve the dispute.",
          "why_wrong": [
            "Belief does not create a charge.",
            "",
            "The cardholder's word needs corroboration from records.",
            "Deleting records destroys the evidence."
          ]
        },
        {
          "id": "px-24-08",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "Why should timeout values differ between a user-facing payment request and a back-office batch job?",
          "options": [
            "They should always be identical.",
            "Batch jobs never need timeouts.",
            "User-facing requests need short timeouts for responsiveness, while batch jobs can tolerate longer waits; one value fits neither well.",
            "User requests never need timeouts."
          ],
          "answer": 2,
          "explanation": "Timeout design must reflect the caller's needs: users cannot wait indefinitely, so interactive timeouts are short, while batch jobs processing large volumes need longer windows. A single timeout value either frustrates users or aborts legitimate batch work. Context-appropriate timeouts are a design requirement.",
          "why_wrong": [
            "Identical timeouts fit neither context well.",
            "Batch jobs need timeouts to detect hangs.",
            "",
            "User requests need timeouts to stay responsive."
          ]
        },
        {
          "id": "px-24-09",
          "domain": "operations",
          "chapter": "ch72",
          "question": "An uncertain payment is resolved as settled after investigation. What must happen to the customer communication?",
          "options": [
            "The customer must be told the confirmed outcome, the payment state updated and any temporary holds or blocks released.",
            "Nothing; the customer will guess.",
            "The customer must be told it failed.",
            "The payment must be reversed anyway."
          ],
          "answer": 0,
          "explanation": "Resolution of uncertainty must close the loop: the customer learns the confirmed outcome, the system reflects the true state and any protective holds are released. Leaving the customer in uncertainty after resolution is a service failure.",
          "why_wrong": [
            "",
            "Customers must be told the confirmed outcome.",
            "Telling the customer it failed would be false.",
            "Reversing a correctly settled payment would be wrong."
          ]
        },
        {
          "id": "px-24-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is specifying timeout handling for a payment integration. Which requirement is most robust?",
          "options": [
            "On timeout, assume success.",
            "On timeout, delete the request.",
            "On timeout, mark uncertain, block duplicates, trigger automated status checks, escalate unresolved cases within a defined time and log every step.",
            "On timeout, retry forever."
          ],
          "answer": 2,
          "explanation": "Robust timeout handling covers state, duplicate protection, automated resolution, escalation and audit. Each element addresses a specific failure mode of naive timeout handling. The specification is testable because each behaviour can be verified under injected timeouts.",
          "why_wrong": [
            "Assuming success risks false confirmation.",
            "Deletion destroys the record.",
            "",
            "Infinite retry creates load and duplicate risk."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-25",
        "title": "Payments Expert Test 25: Settlement Design and Failure Modes",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-25-01",
          "domain": "clearing",
          "chapter": "ch77",
          "question": "A deferred net settlement system nets payments and settles the net amount at the end of the cycle. What is the main risk if a participant defaults before settlement?",
          "options": [
            "No risk, because netting removes all risk.",
            "Other participants face exposures from the defaulting participant's net position, and the settlement may need to be unwound or covered.",
            "Netting guarantees payment.",
            "Default is impossible in net systems."
          ],
          "answer": 1,
          "explanation": "Netting reduces the value settled but creates inter-participant exposures until settlement occurs. If a participant defaults with a net debit, others may not receive expected funds and the net may need recalculation. Collateral, limits and default funds mitigate this risk.",
          "why_wrong": [
            "Netting reduces settlement value but creates pre-settlement exposure.",
            "",
            "Netting does not guarantee payment on default.",
            "Default is possible and must be planned for."
          ]
        },
        {
          "id": "px-25-02",
          "domain": "clearing",
          "chapter": "ch77",
          "question": "What is delivery versus payment (DvP) in settlement design?",
          "options": [
            "Paying before delivery with no link.",
            "A mechanism ensuring the asset transfer and the payment happen together, so neither side is exposed to the other defaulting mid-settlement.",
            "Paying in cash only.",
            "A type of card payment."
          ],
          "answer": 1,
          "explanation": "DvP links the two legs of a securities settlement so the asset moves if and only if the payment moves. This eliminates principal risk: the risk of delivering the asset without receiving payment, or vice versa. It is a fundamental protection in securities settlement design.",
          "why_wrong": [
            "Unlinked payment before delivery creates principal risk.",
            "",
            "DvP is about linking legs, not cash.",
            "DvP applies to securities settlement, not card payments."
          ]
        },
        {
          "id": "px-25-03",
          "domain": "clearing",
          "chapter": "ch77",
          "question": "A settlement system fails partway through a settlement cycle. What design feature best protects participants?",
          "options": [
            "No protection is possible.",
            "Atomic settlement: the cycle either completes fully or is rolled back to a defined state, with clear recovery procedures.",
            "Partial settlement with no records.",
            "Manual re-entry of all payments."
          ],
          "answer": 1,
          "explanation": "Atomicity ensures a settlement cycle is all or nothing from the participants' perspective, or that partial results are defined and recoverable. Clear recovery procedures, including re-running or unwinding, restore a known state. Undefined partial settlement leaves participants unsure of their positions.",
          "why_wrong": [
            "Atomicity and recovery procedures provide protection.",
            "",
            "Unrecorded partial settlement creates chaos.",
            "Manual re-entry is slow and error-prone."
          ]
        },
        {
          "id": "px-25-04",
          "domain": "clearing",
          "chapter": "ch88",
          "question": "A central counterparty (CCP) stands between buyers and sellers. What risk does it primarily manage?",
          "options": [
            "It removes all market risk.",
            "It manages only operational risk.",
            "It removes the need for any collateral.",
            "Counterparty credit risk, by guaranteeing settlement through novation, margin and default funds, subject to its own risk management."
          ],
          "answer": 3,
          "explanation": "A CCP becomes the buyer to every seller and the seller to every buyer, concentrating counterparty risk and managing it through margin, default funds and strict membership rules. This reduces bilateral exposures but concentrates risk in the CCP itself, which must be robustly managed.",
          "why_wrong": [
            "Market risk remains; the CCP manages counterparty risk.",
            "The CCP's primary role is counterparty credit risk.",
            "Margin and collateral are central to CCP risk management.",
            ""
          ]
        },
        {
          "id": "px-25-05",
          "domain": "clearing",
          "chapter": "ch77",
          "question": "A payment settles in commercial bank money rather than central bank money. What additional risk does the receiver bear?",
          "options": [
            "No additional risk.",
            "The receiver bears no risk at all.",
            "Credit risk on the settlement bank: if that bank fails, the settlement asset may lose value.",
            "Only currency risk."
          ],
          "answer": 2,
          "explanation": "Commercial bank money is a claim on a commercial bank, which carries credit risk. Central bank money is a claim on the central bank and is the lowest-risk settlement asset. The choice of settlement asset is therefore a risk decision, not merely an operational one.",
          "why_wrong": [
            "Commercial bank money carries bank credit risk.",
            "The receiver bears the settlement bank's credit risk.",
            "",
            "Credit risk, not only currency risk, is the key difference."
          ]
        },
        {
          "id": "px-25-06",
          "domain": "clearing",
          "chapter": "ch77",
          "question": "A settlement fails because the delivering participant lacks the securities. What is this called and what happens next?",
          "options": [
            "A fail; the settlement is retried, penalties or buy-in procedures may apply under the system rules, and the counterparty is affected.",
            "A success; nothing happens.",
            "A refund; the buyer is paid double.",
            "A holiday; the market closes."
          ],
          "answer": 0,
          "explanation": "A settlement fail occurs when one leg cannot be delivered, often due to missing securities or funds. Systems retry fails, apply penalties or buy-in rules and manage the counterparty impact. Persistent fails signal operational or liquidity problems that need attention.",
          "why_wrong": [
            "",
            "A fail is not a success.",
            "A fail does not pay the buyer double.",
            "A fail does not close the market."
          ]
        },
        {
          "id": "px-25-07",
          "domain": "clearing",
          "chapter": "ch88",
          "question": "Why do settlement systems impose cutoffs and deadlines?",
          "options": [
            "To inconvenience participants.",
            "Cutoffs have no purpose.",
            "To create a predictable timetable for funding, processing and finality, so participants can plan liquidity and the system can complete cycles on time.",
            "To reduce the number of payments."
          ],
          "answer": 2,
          "explanation": "Cutoffs structure the settlement day: they define when instructions must arrive, when funding must be in place and when finality occurs. Predictable timetables let participants manage liquidity and let the system guarantee completion. Without cutoffs, cycles could drift indefinitely.",
          "why_wrong": [
            "Cutoffs serve planning and finality, not inconvenience.",
            "Cutoffs are essential timetable controls.",
            "",
            "Cutoffs sequence payments; they do not aim to reduce volume."
          ]
        },
        {
          "id": "px-25-08",
          "domain": "clearing",
          "chapter": "ch77",
          "question": "A bank's settlement account is funded late, causing its payments to fail. What is the root control failure?",
          "options": [
            "The payment system.",
            "Liquidity and funding management: the bank did not ensure funds were available by the required time.",
            "The customers.",
            "The calendar."
          ],
          "answer": 1,
          "explanation": "Funding the settlement account on time is the bank's responsibility. Late funding causes settlement failures that affect counterparties and customers. The control failure lies in forecasting, funding execution or escalation, not in the system or the customers.",
          "why_wrong": [
            "The system operated as designed; funding was late.",
            "",
            "Customers are not responsible for the bank's settlement funding.",
            "The calendar is known in advance; planning must account for it."
          ]
        },
        {
          "id": "px-25-09",
          "domain": "clearing",
          "chapter": "ch77",
          "question": "A settlement design uses prefunding for all participants. What trade-off does this create?",
          "options": [
            "No trade-off.",
            "Higher risk and lower liquidity.",
            "Lower settlement risk, since funds are in place before settlement, at the cost of higher liquidity tied up by participants.",
            "Prefunding removes the need for accounts."
          ],
          "answer": 2,
          "explanation": "Prefunding eliminates the risk that a participant cannot pay at settlement time, because funds are already held. The cost is liquidity: participants must tie up funds in advance, which could otherwise be used elsewhere. Settlement design constantly balances risk against liquidity cost.",
          "why_wrong": [
            "Prefunding trades liquidity cost for risk reduction.",
            "Prefunding lowers risk and raises liquidity cost.",
            "",
            "Prefunding requires accounts to hold the funds."
          ]
        },
        {
          "id": "px-25-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is documenting settlement failure handling. Which requirement best serves operations?",
          "options": [
            "Failures should not happen.",
            "On settlement failure, the system must identify the failing leg, notify operations with the cause, apply the defined retry or unwind procedure and update participant positions consistently.",
            "Failures should be hidden.",
            "Operations should guess the cause."
          ],
          "answer": 1,
          "explanation": "Failure handling requirements must name the detection, notification, procedure and position update steps. This gives operations a defined playbook and gives developers testable behaviour. Hoping failures do not happen is not a design.",
          "why_wrong": [
            "Failures will happen; handling must be specified.",
            "",
            "Hiding failures leaves positions wrong.",
            "Guessing is not an operational procedure."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-26",
        "title": "Payments Expert Test 26: Correspondent Banking Depth",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-26-01",
          "domain": "crossborder",
          "chapter": "ch94",
          "question": "A bank has no branch in the destination country. How does correspondent banking let it pay beneficiaries there?",
          "options": [
            "It cannot pay at all.",
            "It sends cash by courier.",
            "It asks the beneficiary to collect funds in person.",
            "It holds a nostro account with a correspondent bank in that country, which pays the beneficiary from the account on its instructions."
          ],
          "answer": 3,
          "explanation": "Correspondent banking uses accounts held with banks in other countries: the nostro account. The respondent bank instructs its correspondent to pay the beneficiary, and the correspondent debits the nostro account. This network of accounts is the backbone of cross-border payments.",
          "why_wrong": [
            "Correspondent banking exists precisely to enable such payments.",
            "Courier cash is not the correspondent banking model.",
            "In-person collection is not how correspondent payments work.",
            ""
          ]
        },
        {
          "id": "px-26-02",
          "domain": "crossborder",
          "chapter": "ch13",
          "question": "What is the difference between a nostro and a vostro account?",
          "options": [
            "They are the same account with different names.",
            "Nostro is our account with you, viewed from our side; vostro is your account with us, viewed from our side. They are two views of the same relationship.",
            "Nostro is for cards, vostro is for cash.",
            "Nostro accounts hold no funds."
          ],
          "answer": 1,
          "explanation": "Nostro and vostro describe the same account from opposite perspectives. From Bank A's view, its account with Bank B is a nostro account; from Bank B's view, that same account is a vostro account. The terms clarify whose books are being described.",
          "why_wrong": [
            "The terms describe perspective, not different accounts.",
            "",
            "Both terms apply to correspondent accounts generally.",
            "Nostro accounts hold real balances."
          ]
        },
        {
          "id": "px-26-03",
          "domain": "crossborder",
          "chapter": "ch94",
          "question": "A correspondent bank terminates a respondent bank's account due to de-risking. What is the respondent bank's immediate problem?",
          "options": [
            "Loss of a payment corridor: it must find an alternative correspondent, re-establish compliance checks and reroute payments, which takes time.",
            "No problem; accounts are easily replaced.",
            "It gains extra liquidity.",
            "Its customers are unaffected."
          ],
          "answer": 0,
          "explanation": "De-risking removes correspondent relationships, cutting off payment corridors. Finding a replacement correspondent requires due diligence, agreement, account setup and testing, during which payments to that corridor are disrupted. This is a significant operational and strategic risk.",
          "why_wrong": [
            "",
            "Replacement correspondents take time to establish.",
            "Losing an account reduces capability; it does not add liquidity.",
            "Customers depending on that corridor are directly affected."
          ]
        },
        {
          "id": "px-26-04",
          "domain": "compliance",
          "chapter": "ch94",
          "question": "Why do correspondent banks conduct due diligence on respondent banks?",
          "options": [
            "For curiosity.",
            "To manage AML, sanctions and reputational risk, since the correspondent's account can be used to move funds on behalf of the respondent's customers.",
            "Due diligence is optional.",
            "To set exchange rates."
          ],
          "answer": 1,
          "explanation": "A correspondent account gives the respondent access to the correspondent's payment infrastructure. The correspondent must understand the respondent's controls, customer base and risk profile to avoid facilitating illicit flows. Due diligence is a regulatory expectation, not a courtesy.",
          "why_wrong": [
            "Due diligence manages real financial crime risk.",
            "",
            "Due diligence is a regulatory expectation.",
            "Exchange rates are unrelated to due diligence."
          ]
        },
        {
          "id": "px-26-05",
          "domain": "crossborder",
          "chapter": "ch14",
          "question": "A payment uses the serial method through two correspondents. What happens to the payment instruction at each hop?",
          "options": [
            "It is discarded.",
            "It is converted to a cheque.",
            "Only the first bank sees it.",
            "Each bank receives the instruction, processes it, deducts any charges as permitted and forwards it to the next bank."
          ],
          "answer": 3,
          "explanation": "In serial processing, the instruction and funds travel together through each bank in sequence. Each bank processes, screens and forwards the payment, deducting charges transparently where permitted. Every hop sees the full instruction and must handle it correctly.",
          "why_wrong": [
            "The instruction must be forwarded, not discarded.",
            "Serial payments remain electronic.",
            "Every bank in the serial chain processes the instruction.",
            ""
          ]
        },
        {
          "id": "px-26-06",
          "domain": "crossborder",
          "chapter": "ch14",
          "question": "Why might a bank prefer the cover method over the serial method for a payment?",
          "options": [
            "Cover is always slower.",
            "Cover sends the instruction directly to the beneficiary bank while funds move separately, which can be faster and keeps the instruction data intact.",
            "Cover removes all compliance duties.",
            "Cover payments need no accounts."
          ],
          "answer": 1,
          "explanation": "Cover handling separates the instruction route from the funds route. The beneficiary bank receives the full instruction directly, which can speed up crediting and preserve data quality. The funds move through correspondent accounts under a separate cover message. Both methods remain subject to compliance duties.",
          "why_wrong": [
            "Cover can be faster for the instruction leg.",
            "",
            "Compliance duties apply to cover payments as well.",
            "Cover payments depend on correspondent accounts for the funds leg."
          ]
        },
        {
          "id": "px-26-07",
          "domain": "operations",
          "chapter": "ch13",
          "question": "A nostro account balance falls below the agreed minimum. What should the bank do?",
          "options": [
            "Ignore it.",
            "Close the account.",
            "Fund the account promptly, review the funding forecast and consider whether the minimum or the funding pattern needs adjustment.",
            "Overdraw it further."
          ],
          "answer": 2,
          "explanation": "Minimum balances ensure the correspondent can execute payments without delay. A breach must be funded promptly and the cause reviewed: forecasting, unexpected outflows or an unrealistic minimum. Ignoring it risks rejected payments and correspondent action.",
          "why_wrong": [
            "Ignoring a minimum breach risks payment failures.",
            "Closing the account removes the corridor entirely.",
            "",
            "Further overdrawing worsens the position."
          ]
        },
        {
          "id": "px-26-08",
          "domain": "crossborder",
          "chapter": "ch94",
          "question": "A correspondent charges fees that the respondent disputes. What evidence should the respondent gather first?",
          "options": [
            "The account agreement, the fee schedule, the statements showing the charges and the payment records to which they relate.",
            "None; disputes need no evidence.",
            "The correspondent's marketing material.",
            "Customer complaints only."
          ],
          "answer": 0,
          "explanation": "Fee disputes are resolved against the agreement and the schedule: what was agreed, what was charged and what service was provided. Statements and payment records link charges to activity. Without this evidence, the dispute cannot be assessed or resolved.",
          "why_wrong": [
            "",
            "Evidence is essential to any fee dispute.",
            "Marketing material does not define fees.",
            "Customer complaints alone do not prove a fee error."
          ]
        },
        {
          "id": "px-26-09",
          "domain": "crossborder",
          "chapter": "ch94",
          "question": "A respondent bank's payments are repeatedly delayed by its correspondent's screening. What is the most constructive response?",
          "options": [
            "Send payments without data to avoid screening.",
            "Engage the correspondent to understand the screening triggers, improve data quality and agree on handling for time-sensitive payments.",
            "Stop all cross-border payments.",
            "Change correspondents daily."
          ],
          "answer": 1,
          "explanation": "Screening delays often stem from data quality issues that the respondent can fix, such as incomplete addresses or ambiguous names. Constructive engagement with the correspondent identifies triggers and improves straight-through rates. Evading screening or abandoning corridors harms customers and compliance.",
          "why_wrong": [
            "Removing data worsens screening, not improves it.",
            "",
            "Stopping payments abandons customers.",
            "Frequent switching disrupts operations and relationships."
          ]
        },
        {
          "id": "px-26-10",
          "domain": "crossborder",
          "chapter": "ch13",
          "question": "A bank is selecting a new correspondent for a key corridor. Which factor is most important?",
          "options": [
            "The correspondent's office decor.",
            "The correspondent's advertising budget.",
            "The correspondent's size alone.",
            "The correspondent's network reach, service quality, compliance standards, cutoffs, liquidity support and fee transparency for that corridor."
          ],
          "answer": 3,
          "explanation": "Correspondent selection must weigh operational capability for the specific corridor: reach, cutoffs, service levels, compliance strength and transparent pricing. Size alone does not guarantee good service on a particular corridor. Due diligence must test the factors that affect payment outcomes.",
          "why_wrong": [
            "Office appearance is irrelevant to payment service.",
            "Advertising does not determine service quality.",
            "Size alone does not ensure corridor performance.",
            ""
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-27",
        "title": "Payments Expert Test 27: Card Scheme Depth: EMV and Tokenisation",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-27-01",
          "domain": "cards",
          "chapter": "ch63",
          "question": "An EMV chip card is inserted at a terminal. What does the chip do that a magnetic stripe cannot?",
          "options": [
            "It stores the cardholder's photo.",
            "It prints a receipt.",
            "It sets the exchange rate.",
            "It generates a unique cryptogram for the transaction, proving the card is genuine and the transaction data has not been altered."
          ],
          "answer": 3,
          "explanation": "EMV chips perform cryptographic processing: they generate a transaction-specific cryptogram that the issuer can verify. This dynamic authentication defeats cloning, which is the magnetic stripe's weakness. The chip also supports offline data authentication and cardholder verification.",
          "why_wrong": [
            "The chip's value is cryptographic, not photographic.",
            "Receipt printing is a terminal function.",
            "Exchange rates are unrelated to chip processing.",
            ""
          ]
        },
        {
          "id": "px-27-02",
          "domain": "cards",
          "chapter": "ch63",
          "question": "A card transaction is declined offline by the chip. What does this mean?",
          "options": [
            "The issuer declined it online.",
            "The card is fake.",
            "The chip and terminal decided to decline without contacting the issuer, based on risk parameters and card settings.",
            "The terminal is broken."
          ],
          "answer": 2,
          "explanation": "EMV supports offline processing: the chip and terminal apply risk management rules, such as floor limits and velocity checks, and can decline without issuer contact. Offline declines protect against risk when connectivity is unavailable. They do not prove the card is fake or the terminal is broken.",
          "why_wrong": [
            "Offline means the issuer was not contacted.",
            "Offline declines are normal risk decisions, not proof of fakery.",
            "",
            "Offline decline is a designed behaviour, not a fault."
          ]
        },
        {
          "id": "px-27-03",
          "domain": "cards",
          "chapter": "ch63",
          "question": "A merchant stores card numbers in plain text in its database. What is the core problem?",
          "options": [
            "No problem; storage is free.",
            "Storage is required by schemes.",
            "Plain text is more secure than encryption.",
            "Plain-text storage breaches PCI DSS, exposes cardholders to fraud if breached and creates major liability for the merchant."
          ],
          "answer": 3,
          "explanation": "Card numbers are sensitive data that must be protected under PCI DSS. Plain-text storage means a single breach exposes every stored card, enabling fraud at scale. Merchants must tokenise or encrypt, minimise storage and meet PCI DSS requirements.",
          "why_wrong": [
            "Plain-text storage is a serious security breach.",
            "Schemes require protection, not plain-text storage.",
            "Plain text is the least secure storage option.",
            ""
          ]
        },
        {
          "id": "px-27-04",
          "domain": "cards",
          "chapter": "ch63",
          "question": "How does network tokenisation differ from simply encrypting a card number?",
          "options": [
            "Tokenisation replaces the card number with a token that is useless if stolen, while encryption merely obscures the number until decrypted.",
            "They are identical.",
            "Tokenisation is less secure.",
            "Encryption replaces the number permanently."
          ],
          "answer": 0,
          "explanation": "A token is a substitute value with no intrinsic meaning: stealing it does not reveal the card number, and tokens can be domain-restricted to one merchant or channel. Encryption protects data in transit or at rest but the original number still exists when decrypted. Tokenisation reduces the scope of sensitive data handling.",
          "why_wrong": [
            "",
            "Tokenisation and encryption are different controls.",
            "Tokenisation reduces breach impact more effectively.",
            "Encryption is reversible; tokenisation substitutes the value."
          ]
        },
        {
          "id": "px-27-05",
          "domain": "cards",
          "chapter": "ch63",
          "question": "A customer's card is replaced after loss. Their tokenised wallet payments keep working. Why?",
          "options": [
            "Because the wallet ignores the loss.",
            "Because tokens never expire.",
            "Because the old card still works.",
            "Because the token is linked to the account and can be updated to the new card without the merchant needing new details."
          ],
          "answer": 3,
          "explanation": "Tokens are mapped to the underlying account through the token service. When a card is replaced, the token mapping can be updated so existing tokens continue to work. This lifecycle management is a key benefit of tokenisation for both customers and merchants.",
          "why_wrong": [
            "The wallet follows the token lifecycle, not ignorance.",
            "Tokens have lifecycle rules; continuity comes from mapping updates.",
            "The old card is blocked; the token mapping is what continues.",
            ""
          ]
        },
        {
          "id": "px-27-06",
          "domain": "cards",
          "chapter": "ch31",
          "question": "A contactless transaction exceeds the cardholder verification limit. What normally happens?",
          "options": [
            "The transaction is always approved.",
            "Cardholder verification, such as a PIN or device authentication, is required, or the transaction is declined.",
            "The limit is ignored.",
            "The merchant pays a fine immediately."
          ],
          "answer": 1,
          "explanation": "Contactless limits balance convenience with risk: above the limit, verification is required to confirm the cardholder is present. The terminal will request PIN entry or the transaction will be declined. This control limits the impact of a lost or stolen card used contactlessly.",
          "why_wrong": [
            "Above-limit contactless transactions need verification.",
            "",
            "Limits are enforced by the terminal and card.",
            "Fines are not the immediate consequence; verification is."
          ]
        },
        {
          "id": "px-27-07",
          "domain": "cards",
          "chapter": "ch63",
          "question": "An issuer receives an EMV cryptogram it cannot validate. What should it do?",
          "options": [
            "Approve the transaction anyway.",
            "Approve it and investigate later.",
            "Decline the transaction, since failed cryptogram validation means the card or data cannot be trusted.",
            "Ask the merchant to guess."
          ],
          "answer": 2,
          "explanation": "Cryptogram validation proves the card is genuine and the transaction data is intact. Failure means either the card is counterfeit, the data was altered or keys are wrong. Approving despite failed validation would accept an untrusted transaction. Decline is the safe response, with investigation into the cause.",
          "why_wrong": [
            "Approving an unvalidated transaction accepts unknown risk.",
            "Investigation after approval leaves the loss already incurred.",
            "",
            "The merchant cannot resolve a cryptographic failure."
          ]
        },
        {
          "id": "px-27-08",
          "domain": "cards",
          "chapter": "ch63",
          "question": "A merchant's terminal supports both chip and magnetic stripe fallback. Why do schemes discourage routine fallback?",
          "options": [
            "Fallback is faster.",
            "Fallback is more secure.",
            "Fallback is required for all transactions.",
            "Fallback bypasses chip security, so routine fallback reintroduces cloning risk and may shift liability to the party that allowed it."
          ],
          "answer": 3,
          "explanation": "Fallback exists for genuine chip failures, but routine use defeats EMV security by allowing stripe transactions that can be cloned. Liability rules often place the cost of fallback fraud on the party that permitted it. Fallback rates must be monitored and controlled.",
          "why_wrong": [
            "Fallback is a security downgrade, not a speed feature.",
            "Stripe transactions are less secure than chip.",
            "Fallback is an exception path, not the normal route.",
            ""
          ]
        },
        {
          "id": "px-27-09",
          "domain": "cards",
          "chapter": "ch63",
          "question": "A token is restricted to a single merchant. What happens if it is stolen and used at a different merchant?",
          "options": [
            "It works everywhere.",
            "It is declined, because the token is only valid in its designated domain.",
            "It works but with a warning.",
            "It reveals the card number."
          ],
          "answer": 1,
          "explanation": "Domain restriction binds a token to a specific merchant, channel or device. Use outside that domain is declined, so a stolen token has little value to a thief. This is a core security advantage of tokenisation over raw card numbers, which work anywhere.",
          "why_wrong": [
            "Domain restriction prevents use elsewhere.",
            "",
            "Out-of-domain use is declined, not warned through.",
            "Tokens do not reveal the underlying card number."
          ]
        },
        {
          "id": "px-27-10",
          "domain": "cards",
          "chapter": "ch63",
          "question": "A BA is specifying EMV terminal behaviour. Which requirement is most precise?",
          "options": [
            "The terminal must attempt chip processing first, apply the defined fallback rules, request cardholder verification per the card and transaction parameters, and log the outcome with the cryptogram result.",
            "Terminals should accept cards.",
            "Terminals should be fast.",
            "Terminals should look modern."
          ],
          "answer": 0,
          "explanation": "Precise terminal requirements cover the processing priority, fallback rules, verification logic and logging. Each element is testable and reflects scheme and EMV specifications. Vague acceptance or speed goals cannot be verified.",
          "why_wrong": [
            "",
            "Accept cards is too vague to implement.",
            "Speed alone does not define correct EMV behaviour.",
            "Appearance does not define terminal behaviour."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-28",
        "title": "Payments Expert Test 28: 3D Secure, 3RI and Authentication",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-28-01",
          "domain": "cards",
          "chapter": "ch22",
          "question": "A customer pays online and is asked to authenticate in their banking app. What is 3D Secure achieving here?",
          "options": [
            "Delaying the payment for fun.",
            "Charging the customer extra.",
            "Authenticating the cardholder with the issuer during the transaction, reducing fraud and supporting SCA.",
            "Sharing the password with the merchant."
          ],
          "answer": 2,
          "explanation": "3D Secure adds an authentication step where the issuer verifies the cardholder, often through the banking app or a one-time code. This reduces fraudulent use of stolen card details and satisfies strong customer authentication requirements. The merchant never sees the authentication credentials.",
          "why_wrong": [
            "Authentication protects against fraud; it is not a delay tactic.",
            "3D Secure does not add a customer charge.",
            "",
            "Credentials stay with the issuer; the merchant does not receive them."
          ]
        },
        {
          "id": "px-28-02",
          "domain": "cards",
          "chapter": "ch22",
          "question": "A transaction goes through 3D Secure with a frictionless flow and no challenge. What does this mean?",
          "options": [
            "No authentication happened.",
            "The merchant bypassed security.",
            "The card is not enrolled.",
            "The issuer assessed the risk using transaction data and allowed the payment without an interactive challenge."
          ],
          "answer": 3,
          "explanation": "Frictionless flow means the issuer's risk assessment, using device, behavioural and transaction data, concluded the risk was low enough to approve without challenging the cardholder. Authentication still occurred through the risk-based decision. Challenging every transaction would harm legitimate customers unnecessarily.",
          "why_wrong": [
            "Risk-based authentication did occur; it was not interactive.",
            "The issuer, not the merchant, decides the flow.",
            "Non-enrolled cards follow a different path.",
            ""
          ]
        },
        {
          "id": "px-28-03",
          "domain": "cards",
          "chapter": "ch34",
          "question": "A subscription merchant charges a card monthly without the customer being present. Which 3D Secure flow supports this?",
          "options": [
            "Standard customer-present challenge every month.",
            "3RI, or 3D Secure Requestor Initiated, which authenticates merchant-initiated transactions using the original authentication context.",
            "No authentication is ever needed.",
            "Magnetic stripe fallback."
          ],
          "answer": 1,
          "explanation": "3RI allows merchants to request authentication for transactions where the cardholder is not present, such as recurring charges, building on the original cardholder authentication. This supports SCA for merchant-initiated transactions without requiring the customer to be present each time. It is designed for the recurring and instalment use cases.",
          "why_wrong": [
            "Monthly challenges would fail since the customer is not present.",
            "",
            "Merchant-initiated transactions still need an authentication framework.",
            "Stripe fallback is unrelated to online recurring authentication."
          ]
        },
        {
          "id": "px-28-04",
          "domain": "cards",
          "chapter": "ch34",
          "question": "A merchant stores a card for future purchases. What must happen at the time of storage?",
          "options": [
            "Nothing; storage needs no authentication.",
            "The merchant can store any card it sees.",
            "The cardholder must authenticate and agree to the storage and future use, establishing the basis for later merchant-initiated transactions.",
            "The issuer must be bypassed."
          ],
          "answer": 2,
          "explanation": "Storing a card for future use requires cardholder authentication and agreement at setup. This initial authentication establishes the mandate for later merchant-initiated transactions. Storing cards without consent and authentication would enable unauthorised future charges.",
          "why_wrong": [
            "Storage requires authentication and agreement.",
            "Storing cards without consent is not permitted.",
            "",
            "The issuer is central to the authentication."
          ]
        },
        {
          "id": "px-28-05",
          "domain": "cards",
          "chapter": "ch22",
          "question": "An issuer's 3D Secure challenge fails because the cardholder's phone is offline. What is the correct outcome?",
          "options": [
            "Approve the transaction anyway.",
            "Share the code by email to anyone.",
            "The authentication cannot complete, so the transaction should be declined or the customer offered an alternative authentication method.",
            "Let the merchant approve it."
          ],
          "answer": 2,
          "explanation": "If the cardholder cannot authenticate, the issuer cannot confirm their identity and must not approve on trust. The transaction is declined or an alternative SCA method is offered. Approving without authentication defeats the purpose of 3D Secure.",
          "why_wrong": [
            "Approval without authentication accepts fraud risk.",
            "Sharing codes insecurely defeats authentication.",
            "",
            "The merchant cannot authenticate on the issuer's behalf."
          ]
        },
        {
          "id": "px-28-06",
          "domain": "cards",
          "chapter": "ch22",
          "question": "A merchant sees high 3D Secure abandonment. What is the most likely cause to investigate first?",
          "options": [
            "Customers love challenges.",
            "A poor challenge experience, such as slow loading, confusing prompts or unsupported devices, causing customers to give up.",
            "Too few challenges.",
            "The products are too cheap."
          ],
          "answer": 1,
          "explanation": "Abandonment during authentication usually reflects friction: slow challenge screens, unclear instructions or device problems. Investigating the challenge experience, including mobile flows and issuer performance, finds fixable causes. More challenges would worsen abandonment.",
          "why_wrong": [
            "Customers abandon because of friction, not enjoyment.",
            "",
            "More challenges increase abandonment.",
            "Pricing does not explain authentication abandonment."
          ]
        },
        {
          "id": "px-28-07",
          "domain": "cards",
          "chapter": "ch22",
          "question": "How does 3D Secure 2 differ most importantly from the original 3D Secure?",
          "options": [
            "It removes authentication entirely.",
            "It only works on desktop.",
            "It requires paper signatures.",
            "It supports risk-based authentication with rich data exchange, native mobile flows and frictionless decisions, improving both security and experience."
          ],
          "answer": 3,
          "explanation": "3D Secure 2 exchanges far more transaction and device data with the issuer, enabling risk-based decisions and frictionless flows for low-risk transactions. It also supports native mobile app experiences rather than only browser redirects. The original version relied heavily on static passwords and pop-ups.",
          "why_wrong": [
            "3D Secure 2 strengthens, not removes, authentication.",
            "Mobile support is a key improvement in version 2.",
            "Paper signatures play no role.",
            ""
          ]
        },
        {
          "id": "px-28-08",
          "domain": "cards",
          "chapter": "ch34",
          "question": "A recurring payment amount changes from the originally agreed amount. What should the merchant do?",
          "options": [
            "Charge the new amount silently.",
            "Cancel the subscription without telling the customer.",
            "Notify the cardholder of the change and, where required, obtain fresh authentication or agreement for the new amount.",
            "Charge the old amount forever."
          ],
          "answer": 2,
          "explanation": "Changes to recurring amounts must be transparent to the cardholder, who agreed to the original terms. Depending on the scheme and regulatory rules, fresh authentication or explicit agreement may be required. Silent changes breach trust and may breach scheme rules.",
          "why_wrong": [
            "Silent amount changes breach transparency and agreement.",
            "Cancellation without notice harms the customer.",
            "",
            "Charging the old amount ignores the legitimate change."
          ]
        },
        {
          "id": "px-28-09",
          "domain": "cards",
          "chapter": "ch22",
          "question": "An authentication succeeds but the subsequent authorisation is declined. What does this tell the merchant?",
          "options": [
            "Authentication guarantees authorisation.",
            "Authentication and authorisation are separate: the cardholder was verified, but the issuer declined the transaction for another reason, such as funds or risk.",
            "The authentication was fake.",
            "The merchant made an error."
          ],
          "answer": 1,
          "explanation": "3D Secure authenticates identity; authorisation decides whether the transaction can proceed based on funds, limits and risk. A successful authentication followed by a decline means identity was confirmed but the transaction itself was not approved. The merchant must handle the decline, not assume the sale completed.",
          "why_wrong": [
            "Authentication does not guarantee authorisation.",
            "",
            "The authentication was real; the decline has a separate cause.",
            "The decline is an issuer decision, not necessarily a merchant error."
          ]
        },
        {
          "id": "px-28-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is specifying 3D Secure handling for a checkout. Which requirement best balances security and conversion?",
          "options": [
            "Support risk-based flows, handle frictionless, challenge and error outcomes explicitly, provide clear customer messaging and log authentication results for analysis.",
            "Challenge every transaction with the longest flow.",
            "Disable 3D Secure entirely.",
            "Challenge only high-value transactions and ignore the rest."
          ],
          "answer": 0,
          "explanation": "Balanced 3D Secure design supports all flow outcomes, communicates clearly with customers and captures data for optimisation. Risk-based handling challenges only where needed, preserving conversion while meeting SCA. Disabling security or challenging everything both fail the balance.",
          "why_wrong": [
            "",
            "Challenging everything harms conversion unnecessarily.",
            "Disabling 3D Secure breaches SCA and increases fraud.",
            "Ignoring low-value transactions misses fraud and compliance needs."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-29",
        "title": "Payments Expert Test 29: Chargeback Rules and Dispute Strategy",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-29-01",
          "domain": "cards",
          "chapter": "ch78",
          "question": "A cardholder disputes a transaction they do not recognise. What is the chargeback process designed to do?",
          "options": [
            "Punish the merchant automatically.",
            "Delete the transaction record.",
            "Let the issuer reverse the transaction through the scheme rules while the dispute is investigated, protecting the cardholder.",
            "Charge the cardholder a fee."
          ],
          "answer": 2,
          "explanation": "Chargebacks give issuers a defined route to reverse transactions that breach scheme rules, such as unauthorised or unfulfilled transactions. The process includes evidence, representment and time limits, balancing cardholder protection with merchant rights. It is a structured dispute mechanism, not automatic punishment.",
          "why_wrong": [
            "Chargebacks follow evidence and rules, not automatic punishment.",
            "The transaction record is preserved for the dispute.",
            "",
            "Cardholders are not charged a fee for raising a genuine dispute."
          ]
        },
        {
          "id": "px-29-02",
          "domain": "cards",
          "chapter": "ch78",
          "question": "A merchant receives a chargeback for a delivery the customer signed for. What should the merchant do?",
          "options": [
            "Represent the chargeback with compelling evidence, such as delivery proof and the transaction record, within the scheme deadline.",
            "Ignore it.",
            "Charge the customer again without process.",
            "Close the business."
          ],
          "answer": 0,
          "explanation": "Representment lets the merchant challenge a chargeback with evidence that the transaction was valid. Delivery proof, communication records and authentication evidence support the merchant's case. Missing the deadline forfeits the right to represent, so timely action matters.",
          "why_wrong": [
            "",
            "Ignoring a chargeback forfeits the merchant's case.",
            "Recharging without process breaches scheme rules.",
            "Closure is not the response to one dispute."
          ]
        },
        {
          "id": "px-29-03",
          "domain": "cards",
          "chapter": "ch78",
          "question": "Why do chargeback reason codes matter?",
          "options": [
            "They are decorative.",
            "They define the dispute type, the evidence required and the handling rules, so each party knows what must be proved.",
            "They set the refund amount.",
            "They identify the cardholder's address."
          ],
          "answer": 1,
          "explanation": "Reason codes categorise disputes: fraud, processing error, consumer dispute and others. Each code carries specific rules on time limits, evidence and representment rights. Correct coding ensures the dispute is handled under the right rules with the right evidence.",
          "why_wrong": [
            "Reason codes drive dispute handling.",
            "",
            "The amount comes from the transaction, not the code.",
            "Reason codes describe the dispute, not the address."
          ]
        },
        {
          "id": "px-29-04",
          "domain": "cards",
          "chapter": "ch78",
          "question": "A merchant's chargeback ratio rises sharply. What is the strategic risk?",
          "options": [
            "No risk; ratios do not matter.",
            "Scheme monitoring programmes, fines, higher processing costs and potential loss of card acceptance if ratios stay excessive.",
            "The merchant earns a bonus.",
            "Only the issuer is affected."
          ],
          "answer": 1,
          "explanation": "Schemes monitor chargeback ratios as a health indicator. Excessive ratios trigger monitoring programmes, remediation requirements, fines and, in extreme cases, termination of acceptance. Managing the root causes of disputes is therefore a strategic priority, not just an operational task.",
          "why_wrong": [
            "Ratios are actively monitored by schemes.",
            "",
            "High ratios bring penalties, not bonuses.",
            "The merchant bears the direct consequences."
          ]
        },
        {
          "id": "px-29-05",
          "domain": "cards",
          "chapter": "ch22",
          "question": "A transaction was authenticated with 3D Secure and the cardholder later claims fraud. How does authentication affect the dispute?",
          "options": [
            "It has no effect.",
            "It guarantees the merchant loses.",
            "Successful authentication generally shifts liability for fraud chargebacks to the issuer, subject to scheme rules, since the cardholder was verified.",
            "It removes the cardholder's right to dispute."
          ],
          "answer": 2,
          "explanation": "Liability shift is a key benefit of 3D Secure: where the issuer authenticated the cardholder, the issuer generally bears fraud chargeback liability. This incentivises issuers to authenticate well and merchants to use 3D Secure. Scheme rules define the exact conditions.",
          "why_wrong": [
            "Authentication materially affects fraud liability.",
            "Liability shift generally protects the merchant for fraud disputes.",
            "",
            "The cardholder can still dispute; liability allocation is between the banks."
          ]
        },
        {
          "id": "px-29-06",
          "domain": "cards",
          "chapter": "ch78",
          "question": "A customer says goods never arrived, but the merchant has no tracking evidence. What is the merchant's position?",
          "options": [
            "Strong, because the customer is lying.",
            "Irrelevant, because evidence does not matter.",
            "Strong, because merchants always win.",
            "Weak, because without delivery evidence the merchant cannot rebut the non-receipt claim under the scheme rules."
          ],
          "answer": 3,
          "explanation": "Non-receipt disputes turn on evidence of delivery. Without tracking or delivery proof, the merchant cannot demonstrate fulfilment and will likely lose the representment. Keeping delivery evidence is therefore essential for merchants selling physical goods.",
          "why_wrong": [
            "Assertions without evidence do not win disputes.",
            "Evidence is decisive in chargeback handling.",
            "Merchants win only with evidence.",
            ""
          ]
        },
        {
          "id": "px-29-07",
          "domain": "cards",
          "chapter": "ch78",
          "question": "A chargeback is raised after the scheme time limit for that reason code. What should happen?",
          "options": [
            "It is processed anyway.",
            "The merchant must pay double.",
            "Time limits do not exist.",
            "It is invalid under the scheme rules and should be rejected as time-barred, subject to the specific code and circumstances."
          ],
          "answer": 3,
          "explanation": "Scheme time limits give finality: disputes must be raised within defined periods for each reason code. Late chargebacks can be rejected as time-barred. This protects merchants from indefinite exposure while giving cardholders a fair window to dispute.",
          "why_wrong": [
            "Time-barred chargebacks are invalid.",
            "Lateness does not double the merchant's liability.",
            "Time limits are a core part of scheme rules.",
            ""
          ]
        },
        {
          "id": "px-29-08",
          "domain": "cards",
          "chapter": "ch78",
          "question": "A merchant wants to reduce friendly fraud, where customers dispute legitimate purchases. What is the most effective approach?",
          "options": [
            "Refuse all refunds.",
            "Hide the merchant name.",
            "Charge customers extra for disputing.",
            "Clear billing descriptors, good customer service, delivery evidence, authentication and easy refund routes so customers resolve issues directly instead of charging back."
          ],
          "answer": 3,
          "explanation": "Friendly fraud often stems from confusion or poor service: unrecognised descriptors, slow refunds or hard-to-reach support. Clear descriptors, responsive service and easy refunds give customers a better path than chargebacks. Prevention through transparency beats fighting disputes after the fact.",
          "why_wrong": [
            "Refusing refunds drives more chargebacks.",
            "Hiding the merchant name increases confusion and disputes.",
            "Charging for disputes breaches scheme rules and trust.",
            ""
          ]
        },
        {
          "id": "px-29-09",
          "domain": "cards",
          "chapter": "ch78",
          "question": "An issuer and acquirer disagree after representment. What is the next stage in the scheme dispute process?",
          "options": [
            "The dispute ends automatically.",
            "The merchant decides.",
            "The cardholder decides.",
            "Pre-arbitration and, if unresolved, arbitration by the scheme, which makes a binding decision under the scheme rules."
          ],
          "answer": 3,
          "explanation": "Scheme dispute processes escalate from chargeback to representment, then pre-arbitration and finally arbitration. The scheme acts as arbiter and its decision is binding on the parties. This structured escalation ensures disputes reach a final resolution.",
          "why_wrong": [
            "Disputes escalate rather than ending automatically.",
            "The merchant is a party, not the arbiter.",
            "The cardholder is a party, not the arbiter.",
            ""
          ]
        },
        {
          "id": "px-29-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is specifying dispute case handling for an acquirer. Which requirement is most valuable?",
          "options": [
            "Each dispute must carry the reason code, deadline timers with alerts, evidence checklists per code, representment workflow and outcome tracking for reporting.",
            "Disputes should be handled somehow.",
            "Disputes need no deadlines.",
            "Evidence is optional."
          ],
          "answer": 0,
          "explanation": "Dispute handling needs structure: reason codes drive the rules, deadlines drive urgency, evidence checklists ensure complete representment and outcome tracking supports reporting and improvement. Without these, deadlines are missed and cases are lost. The specification must be operational, not aspirational.",
          "why_wrong": [
            "",
            "Somehow is not a specification.",
            "Deadlines are critical in dispute handling.",
            "Evidence is essential to representment."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "px-30",
        "title": "Payments Expert Test 30: Expert Judgment: Design Trade-offs and Regulatory Edge Cases",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "px-30-01",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A payment platform must choose between immediate consistency and higher availability during a network partition. What is the fundamental trade-off?",
          "options": [
            "Under a partition, the system must choose between refusing requests to stay consistent or accepting them and reconciling later, per the CAP theorem.",
            "There is no trade-off; both are always achievable.",
            "Partitions never happen.",
            "Availability is always more important than consistency for payments."
          ],
          "answer": 0,
          "explanation": "The CAP theorem states that during a network partition, a distributed system must choose between consistency and availability. For payments, the choice is nuanced: critical funds movements favour consistency, while informational features may favour availability. The design must make this choice explicitly per function.",
          "why_wrong": [
            "",
            "The trade-off is fundamental to distributed systems.",
            "Partitions are a real failure mode that must be designed for.",
            "Consistency is often more important for funds movements."
          ]
        },
        {
          "id": "px-30-02",
          "domain": "compliance",
          "chapter": "ch86",
          "question": "A sanctions list update arrives mid-day. Payments already in flight were screened against the old list. What should the bank do?",
          "options": [
            "Assess whether in-flight payments need rescreening against the new list, following the sanctions policy, and hold any that now match.",
            "Nothing; old screening is good enough.",
            "Cancel all payments for the day.",
            "Apply the new list only tomorrow."
          ],
          "answer": 0,
          "explanation": "Sanctions duties apply to the current list. The bank's policy must define how list updates affect in-flight payments, including rescreening where required. Ignoring the update risks processing a newly sanctioned payment. Cancelling everything is disproportionate.",
          "why_wrong": [
            "",
            "Old-list screening may miss newly listed parties.",
            "Blanket cancellation is disproportionate.",
            "Sanctions duties apply from the update, not from tomorrow."
          ]
        },
        {
          "id": "px-30-03",
          "domain": "operations",
          "chapter": "ch72",
          "question": "A multi-leg payment fails on the final leg after earlier legs settled. What is the hardest part of resolving it?",
          "options": [
            "Finding the payment.",
            "Telling the customer.",
            "Writing a report.",
            "Unwinding or completing the settled legs consistently, since each leg is final in its own system and no single rollback exists."
          ],
          "answer": 3,
          "explanation": "Each settled leg is final under its own system's rules, so there is no global undo. Resolution requires compensating transactions, returns or new instructions coordinated across banks, each with its own rules and timelines. This coordination, not finding the payment, is the hard problem.",
          "why_wrong": [
            "Finding the payment is straightforward with references.",
            "Customer communication matters but is not the hardest part.",
            "Reporting follows resolution; it is not the core difficulty.",
            ""
          ]
        },
        {
          "id": "px-30-04",
          "domain": "architecture",
          "chapter": "ch80",
          "question": "A bank must expose payment APIs to third parties while protecting customer data. What design principle best balances openness and security?",
          "options": [
            "Least privilege: each caller gets only the scopes and data it needs, with strong authentication, consent checks and audit logging.",
            "Expose all data to all callers.",
            "Expose nothing.",
            "Trust all callers completely."
          ],
          "answer": 0,
          "explanation": "Least privilege limits each integration to the minimum access it needs, reducing the blast radius of compromise. Combined with strong authentication, consent enforcement and logging, it enables open banking without exposing all data to all parties. Openness and security are balanced through granular control.",
          "why_wrong": [
            "",
            "Unrestricted exposure breaches data protection and security.",
            "Exposing nothing defeats open banking.",
            "Blind trust is not a security design."
          ]
        },
        {
          "id": "px-30-05",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A regulator asks for payment data that includes another customer's personal data. What must the bank consider?",
          "options": [
            "Send everything without review.",
            "Refuse all regulatory requests.",
            "Send the data to the media as well.",
            "The lawful basis for disclosure, data minimisation, the regulator's powers and whether third-party data can be redacted or must be included."
          ],
          "answer": 3,
          "explanation": "Regulatory disclosure must be lawful, proportionate and minimal. The bank must check the regulator's authority, disclose only what is required and protect third-party data where possible. Blind disclosure breaches data protection; blanket refusal breaches regulatory duties.",
          "why_wrong": [
            "Unreviewed disclosure risks breaching data protection.",
            "Lawful regulatory requests must be honoured.",
            "Media disclosure would be a serious breach.",
            ""
          ]
        },
        {
          "id": "px-30-06",
          "domain": "operations",
          "chapter": "ch77",
          "question": "A settlement system must choose between gross and net settlement for a new product. What is the key decision factor?",
          "options": [
            "Which sounds more modern.",
            "Gross is always better.",
            "The balance between settlement risk, liquidity cost, volume, value profile and participant needs for that product.",
            "Net is always better."
          ],
          "answer": 2,
          "explanation": "Settlement model choice is a risk and cost trade-off. Gross settlement reduces risk but demands more liquidity; net settlement saves liquidity but creates pre-settlement exposure. The right choice depends on the product's values, volumes, urgency and risk appetite. No model is universally better.",
          "why_wrong": [
            "Modernity is not a settlement design criterion.",
            "Gross is not always better; liquidity cost matters.",
            "",
            "Net is not always better; risk matters."
          ]
        },
        {
          "id": "px-30-07",
          "domain": "architecture",
          "chapter": "ch46",
          "question": "A real-time payment system faces a choice: add a fraud check that adds latency, or skip it for speed. What is the expert approach?",
          "options": [
            "Skip the check for speed.",
            "Run the check within the latency budget using optimised real-time scoring, and design fallback behaviour if the check times out.",
            "Add the check with no latency limit.",
            "Remove all checks."
          ],
          "answer": 1,
          "explanation": "Fraud checks and speed must coexist in real-time payments. The expert approach engineers the check to fit the latency budget through optimisation, caching and async enrichment, with defined behaviour on timeout. Skipping checks trades fraud losses for speed, which is a poor bargain.",
          "why_wrong": [
            "Skipping fraud checks invites losses.",
            "",
            "Unbounded latency breaks the real-time promise.",
            "Removing checks removes essential protection."
          ]
        },
        {
          "id": "px-30-08",
          "domain": "compliance",
          "chapter": "ch86",
          "question": "A payment is lawful in the sending country but appears to breach the receiving country's rules. What should the bank do?",
          "options": [
            "Hold the payment, seek advice on the receiving country's requirements and do not proceed until the position is clear.",
            "Send it anyway.",
            "Change the payment details to hide the issue.",
            "Send it through a third country to evade the rules."
          ],
          "answer": 0,
          "explanation": "Cross-border payments must respect the rules of each jurisdiction they touch. Where the receiving country's position is unclear or adverse, the bank must pause and obtain advice rather than proceed or evade. Evasion through routing or altered details would compound the breach.",
          "why_wrong": [
            "",
            "Sending despite a likely breach is not acceptable.",
            "Hiding the issue breaches transparency and compliance.",
            "Routing to evade rules is itself a breach."
          ]
        },
        {
          "id": "px-30-09",
          "domain": "operations",
          "chapter": "ch73",
          "question": "An investigation reveals a systemic error affecting hundreds of payments. What is the right response?",
          "options": [
            "Stop the error at source, identify the full affected population, remediate each case, inform affected customers and fix the root cause.",
            "Fix one payment and move on.",
            "Hide the scale of the error.",
            "Blame the customers."
          ],
          "answer": 0,
          "explanation": "Systemic errors demand systemic responses: containment, full population identification, remediation, customer communication and root cause fixing. Fixing one case leaves hundreds harmed. Transparency and thoroughness protect customers and meet regulatory expectations.",
          "why_wrong": [
            "",
            "One fix leaves the systemic problem in place.",
            "Hiding scale breaches duties to customers and regulators.",
            "Customers did not cause the systemic error."
          ]
        },
        {
          "id": "px-30-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A senior BA must recommend build versus buy for a payment hub. What is the most important input to the decision?",
          "options": [
            "The vendor's sales presentation.",
            "A structured assessment of functional fit, total cost, time to value, control, differentiation, risk and exit options against the bank's strategy.",
            "The cheapest option always.",
            "The newest technology always."
          ],
          "answer": 1,
          "explanation": "Build versus buy is a strategic decision requiring structured assessment across fit, cost, speed, control, differentiation and risk. Sales presentations, price alone or novelty alone cannot support the decision. The assessment must be documented and tied to the bank's strategy and capabilities.",
          "why_wrong": [
            "Sales material is not an objective assessment.",
            "",
            "Cheapest rarely means best value or lowest risk.",
            "Novelty does not guarantee fit or value."
          ]
        }
      ]
    }
  ]
};
