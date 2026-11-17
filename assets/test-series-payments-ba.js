// Payments BA Test Series: 30 tests x 10 questions = 300 questions.
// Topics in order:
// 1. Payment Basics for a BA
// 2. Payment Lifecycle and States
// 3. India Rails: UPI, IMPS, NEFT, RTGS
// 4. US Rails: Fedwire, FedNow, ACH, CHIPS
// 5. Europe Rails: SEPA and T2
// 6. UK Rails: Faster Payments, CHAPS, BACS
// 7. SWIFT MT Messages Essentials
// 8. ISO 20022 Fundamentals
// 9. pacs.008 and Payment Messages
// 10. Correspondent Banking and Nostro Vostro
// 11. Charges, FX and Value Dating
// 12. Cutoffs, Calendars and Settlement Timing
// 13. Cards Lifecycle for a BA
// 14. Sanctions Screening Basics for a BA
// 15. AML, KYC and Fraud Basics for a BA
// 16. Clearing, Netting and Settlement Models
// 17. Reconciliation for a BA
// 18. Exceptions and Investigations Basics
// 19. Error Codes, Rejects and Returns
// 20. Field Mapping MT to MX Basics
// 21. Requirements for a Payments Migration
// 22. Mapping Documents and Data Analysis
// 23. API Specs for Payment Initiation
// 24. UAT for a Hub Go-Live
// 25. Test Data and Certification
// 26. Payment Hub Architecture for a BA
// 27. Advanced Exceptions and Multi-Leg Investigations
// 28. Migration Cutover and Parallel Run Scenarios
// 29. Reconciliation Breaks and Settlement Failures
// 30. End-to-End Applied Scenarios: BA in Action
window.PA_TEST_SERIES_PAYMENTS_BA = {
  "series_id": "payments-ba",
  "series_title": "Payments BA Test Series",
  "tests": [
    {
      "mode": "test",
      "test": {
        "id": "pb-01",
        "title": "Payments BA Test 1: Payment Basics for a BA",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-01-01",
          "domain": "foundations",
          "chapter": "ch1",
          "question": "A stakeholder asks what a payment fundamentally moves between a payer and a payee. What is the best BA answer?",
          "options": [
            "A physical bundle of cash in every case",
            "Only a message, with no change in value",
            "Value, by changing balances or claims between parties",
            "A loan agreement signed by both parties"
          ],
          "answer": 2,
          "explanation": "A payment moves value from payer to payee, usually by debiting one account and crediting another or by changing claims between banks. Messages carry the instructions, but settlement is what moves the value. A BA must keep the instruction and the value movement distinct when writing requirements.",
          "why_wrong": [
            "Most payments are electronic book entries, not physical cash movement.",
            "A message alone does not complete a payment; value must move or be committed through settlement.",
            "",
            "A payment instruction is not a loan agreement, even when credit is involved in the underlying trade."
          ]
        },
        {
          "id": "pb-01-02",
          "domain": "foundations",
          "chapter": "ch2",
          "question": "A client wants to pay a supplier once, on a fixed date, and keep control of the timing. Which instrument fits best?",
          "options": [
            "A direct debit mandate",
            "A standing order for a fixed amount",
            "A one-off credit transfer",
            "A cheque book for daily use"
          ],
          "answer": 2,
          "explanation": "A credit transfer is pushed by the payer for a single amount on a chosen date, so the payer keeps control of timing. Direct debits and standing orders are recurring pull or push arrangements. For a one-off supplier payment, a single credit transfer is the natural fit.",
          "why_wrong": [
            "A direct debit lets the payee pull funds under a mandate, which gives the payer less timing control.",
            "A standing order repeats on a schedule and suits regular fixed payments, not a single payment.",
            "",
            "A cheque is a paper instrument and is slower and harder to control than an electronic credit transfer."
          ]
        },
        {
          "id": "pb-01-03",
          "domain": "foundations",
          "chapter": "ch3",
          "question": "In a card payment at a shop, who is the acquirer?",
          "options": [
            "The bank that issued the card to the shopper",
            "The scheme that sets the card rules",
            "The customer buying the goods",
            "The bank or firm that serves the merchant and processes its card takings"
          ],
          "answer": 3,
          "explanation": "The acquirer serves the merchant, accepts card transactions on the merchant's behalf, and settles the funds to the merchant. The issuer serves the cardholder. The scheme sets the rules and brand, but it is not the merchant's bank.",
          "why_wrong": [
            "That describes the issuer, which gives the card to the cardholder and authorises spending.",
            "The scheme provides rules and the network, while acquiring is a separate merchant-serving role.",
            "The customer is the cardholder, not the acquirer.",
            ""
          ]
        },
        {
          "id": "pb-01-04",
          "domain": "foundations",
          "chapter": "ch2",
          "question": "A BA is documenting payment types for a new product. What is the key difference between a push payment and a pull payment?",
          "options": [
            "In a push payment the payer sends the funds; in a pull payment the payee collects them under an authorisation",
            "Push payments are always instant and pull payments are always slow",
            "Push payments use cards and pull payments use cash",
            "There is no difference; the terms mean the same thing"
          ],
          "answer": 0,
          "explanation": "In a push payment such as a credit transfer, the payer instructs their bank to send funds. In a pull payment such as a direct debit, the payee collects funds under a mandate the payer agreed. The direction of initiation is the defining difference.",
          "why_wrong": [
            "",
            "Speed depends on the rail and scheme, not on whether the payment is push or pull.",
            "Both push and pull payments can be electronic and neither is defined by card or cash.",
            "The terms describe opposite initiation directions, so they are not interchangeable."
          ]
        },
        {
          "id": "pb-01-05",
          "domain": "foundations",
          "chapter": "ch1",
          "question": "A product owner says clearing and settlement are the same step. What should the BA explain?",
          "options": [
            "Clearing exchanges and validates payment instructions; settlement moves the funds between banks",
            "Clearing moves funds and settlement only sends messages",
            "Both steps happen only for card payments",
            "Settlement happens before the payment is authorised"
          ],
          "answer": 0,
          "explanation": "Clearing is the exchange, sorting, and validation of payment instructions between banks. Settlement is the actual movement of funds, often through central bank accounts. Treating them as one step hides timing, risk, and reconciliation requirements.",
          "why_wrong": [
            "",
            "This reverses the two steps; clearing handles instructions and settlement handles funds.",
            "Clearing and settlement apply across credit transfers, direct debits, cards, and other payment types.",
            "Authorisation comes before clearing and settlement in the normal flow."
          ]
        },
        {
          "id": "pb-01-06",
          "domain": "foundations",
          "chapter": "ch3",
          "question": "A new joiner asks why banks use payment schemes. What is the main purpose of a scheme?",
          "options": [
            "To lend money to small businesses",
            "To provide common rules, standards, and operating procedures so different banks can interoperate",
            "To replace the need for bank accounts",
            "To set interest rates for the whole market"
          ],
          "answer": 1,
          "explanation": "A scheme gives participants shared rules, message standards, timelines, and dispute processes so a payment from one bank can reach another reliably. Without a scheme, every pair of banks would need a separate agreement. Interoperability through common rules is the core value.",
          "why_wrong": [
            "Lending is a banking product, not the purpose of a payment scheme.",
            "",
            "Schemes operate on top of accounts; they do not remove the need for them.",
            "Interest rates are set by central banks and markets, not by payment schemes."
          ]
        },
        {
          "id": "pb-01-07",
          "domain": "foundations",
          "chapter": "ch2",
          "question": "A business receives the same rent amount from a tenant every month. Which method gives the tenant a recurring push instruction they control?",
          "options": [
            "A direct debit mandate held by the landlord",
            "A standing order set up by the tenant",
            "A one-off card payment each month",
            "A cheque posted each month"
          ],
          "answer": 1,
          "explanation": "A standing order is a recurring instruction from the payer's account for a fixed amount on set dates, and the payer controls it. A direct debit is collected by the payee under a mandate. For fixed rent the tenant controls, a standing order fits.",
          "why_wrong": [
            "A direct debit is collected by the payee, so the tenant has less direct control of each collection.",
            "",
            "A manual card payment each month needs repeated action and is not a standing instruction.",
            "A cheque is manual, slow, and error prone for a regular monthly payment."
          ]
        },
        {
          "id": "pb-01-08",
          "domain": "foundations",
          "chapter": "ch1",
          "question": "A BA hears the term 'payment rail'. What does it mean in plain language?",
          "options": [
            "The physical track used to transport cash",
            "The mobile app a customer uses",
            "The fee charged on every payment",
            "The underlying system or network that carries a payment from payer bank to payee bank"
          ],
          "answer": 3,
          "explanation": "A rail is the infrastructure that carries payments, such as a real-time system, a batch clearing system, or a card network. The channel, such as a mobile app, sits on top of the rail. Choosing a rail affects speed, cost, hours, and data carried.",
          "why_wrong": [
            "Rails are electronic systems, not physical tracks for cash.",
            "The app is the customer channel; the rail is the back-end system that moves the payment.",
            "A fee is a charge for using a rail, not the rail itself.",
            ""
          ]
        },
        {
          "id": "pb-01-09",
          "domain": "foundations",
          "chapter": "ch69",
          "question": "A stakeholder asks what commercial bank money is. Which answer is most accurate?",
          "options": [
            "Notes and coins issued by the central bank",
            "Digital tokens with no bank behind them",
            "Only money held in a savings account",
            "Balances held in accounts at commercial banks that customers use to pay"
          ],
          "answer": 3,
          "explanation": "Commercial bank money is the balance in a bank account, a claim on the bank, used for most everyday electronic payments. Central bank money is cash and reserves held at the central bank. The distinction matters for settlement and risk analysis.",
          "why_wrong": [
            "Notes and coins are central bank money, not commercial bank money.",
            "A token with no bank behind it is a different form of money and is not a bank deposit.",
            "Current and other account balances also count, not only savings accounts.",
            ""
          ]
        },
        {
          "id": "pb-01-10",
          "domain": "foundations",
          "chapter": "ch3",
          "question": "A BA is mapping the parties in a cross-border payment. Which party holds the account of the payee's bank in the payee's country?",
          "options": [
            "The correspondent bank that provides account services in that market",
            "The payer's bank always holds it directly",
            "The payer themselves",
            "The card scheme"
          ],
          "answer": 0,
          "explanation": "When a bank has no branch in a market, it uses a correspondent bank there to hold accounts and make local payments on its behalf. That correspondent relationship makes cross-border reach possible. The payer and the scheme do not hold that account.",
          "why_wrong": [
            "",
            "Many banks have no branch or account in every market, so they rely on correspondents.",
            "The payer holds an account with their own bank, not the payee bank's settlement account.",
            "A card scheme does not hold bank settlement accounts for cross-border transfers."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-02",
        "title": "Payments BA Test 2: Payment Lifecycle and States",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-02-01",
          "domain": "foundations",
          "chapter": "ch4",
          "question": "A payment instruction arrives at a bank. What is the correct broad order of the main lifecycle stages?",
          "options": [
            "Settlement, initiation, authorisation, clearing",
            "Reconciliation, settlement, initiation, validation",
            "Initiation, validation, authorisation, clearing, settlement, reconciliation",
            "Authorisation, reconciliation, initiation, clearing"
          ],
          "answer": 2,
          "explanation": "A payment starts when it is initiated, then it is validated and authorised before it is cleared and settled, and finally reconciled. Each stage has its own checks and failure points. Writing requirements in this order keeps controls and status updates in the right place.",
          "why_wrong": [
            "Settlement cannot happen before the payment is initiated and authorised.",
            "Reconciliation is a post-settlement control, not the first stage.",
            "",
            "Authorisation cannot precede initiation, and reconciliation comes last."
          ]
        },
        {
          "id": "pb-02-02",
          "domain": "operations",
          "chapter": "ch68",
          "question": "A payment is stuck in a 'pending authorisation' state. What does this state most likely mean?",
          "options": [
            "The funds have already reached the payee",
            "The payment has been fully reconciled",
            "The payment has been rejected by the scheme",
            "The instruction is waiting for an approval or authentication step before it can proceed"
          ],
          "answer": 3,
          "explanation": "Pending authorisation means the flow is paused while an approval, second authoriser, or authentication step completes. The funds have not moved yet. A BA should specify timeouts and reminders for this state so payments do not sit forgotten.",
          "why_wrong": [
            "Funds reaching the payee would be a settled or completed state, not pending authorisation.",
            "Reconciliation happens after settlement, so it cannot describe a pre-authorisation hold.",
            "A rejected payment would show a failed or rejected state with a reason code.",
            ""
          ]
        },
        {
          "id": "pb-02-03",
          "domain": "operations",
          "chapter": "ch4",
          "question": "During validation, a payment fails because the payee account number has the wrong format. What should happen next in a well-designed flow?",
          "options": [
            "Reject it back to the originator promptly with a clear reason",
            "Send it anyway and let the payee bank fix it",
            "Hold it silently until the next business day",
            "Change the account number automatically to a guessed value"
          ],
          "answer": 0,
          "explanation": "A format failure should be rejected early with a clear reason so the originator can correct and resubmit. Sending invalid data downstream creates exceptions and failed settlements. Early rejection is cheaper and clearer than a later investigation.",
          "why_wrong": [
            "",
            "Sending invalid data forward creates downstream exceptions and misdirected payment risk.",
            "Silent holding hides the problem and delays correction.",
            "Guessing account details risks paying the wrong person and is never acceptable."
          ]
        },
        {
          "id": "pb-02-04",
          "domain": "operations",
          "chapter": "ch72",
          "question": "A BA is writing state requirements for a payment hub. Why must every state transition be defined with allowed next states?",
          "options": [
            "To make the screens look more detailed",
            "To avoid the need for any logging",
            "To slow the system down for safety",
            "To prevent impossible moves, such as a settled payment returning to initiation, and to support audit and recovery"
          ],
          "answer": 3,
          "explanation": "A state machine with allowed transitions prevents invalid moves and makes behaviour predictable after failures and retries. It also supports audit trails and safe recovery. Without it, payments can end in inconsistent states that are hard to explain or fix.",
          "why_wrong": [
            "State rules are about correct behaviour, not screen appearance.",
            "Logging is still required; state rules complement audit logs rather than replacing them.",
            "Well-defined transitions improve reliability; they do not exist to slow processing.",
            ""
          ]
        },
        {
          "id": "pb-02-05",
          "domain": "foundations",
          "chapter": "ch4",
          "question": "A customer submits a payment, then the system times out with no confirmation. What is the safest design principle for the retry?",
          "options": [
            "Always create a brand new payment on retry",
            "Ask the customer to pay twice and refund later",
            "Delete the original instruction and start over silently",
            "Use idempotency so a retry of the same instruction does not create a duplicate payment"
          ],
          "answer": 3,
          "explanation": "Idempotency means repeating the same request with the same key returns the original result instead of creating a second payment. Timeouts leave the outcome unknown, so safe retries are essential. Duplicate payments are costly and damage trust.",
          "why_wrong": [
            "Creating a new payment on every retry risks duplicate debits when the first attempt actually succeeded.",
            "Deliberate double payment followed by a refund is poor design and harms the customer.",
            "Silent deletion hides the audit trail and may lose a payment that already settled.",
            ""
          ]
        },
        {
          "id": "pb-02-06",
          "domain": "operations",
          "chapter": "ch68",
          "question": "A payment shows 'accepted by the scheme' but not 'settled'. What is the right interpretation?",
          "options": [
            "The payee has definitely received spendable funds",
            "The scheme has accepted the instruction, but final funds movement has not yet completed",
            "The payment has failed and must be resent",
            "The payer has not been debited yet in any case"
          ],
          "answer": 1,
          "explanation": "Scheme acceptance confirms the instruction passed scheme checks and entered processing. Settlement is a separate step that moves funds between banks. A BA must not report acceptance to customers as final receipt of funds.",
          "why_wrong": [
            "Spendable funds depend on settlement and payee bank crediting, not only scheme acceptance.",
            "",
            "Acceptance is a positive forward step, not a failure.",
            "Debit timing depends on the product and rail; acceptance alone does not prove the debit status."
          ]
        },
        {
          "id": "pb-02-07",
          "domain": "foundations",
          "chapter": "ch72",
          "question": "Which failure mode should a BA explicitly cover when a downstream system is unavailable during payment processing?",
          "options": [
            "Assume the downstream system never fails",
            "Queue, retry with limits, and park the payment in a recoverable state with alerts",
            "Drop the payment without a trace",
            "Tell the customer it succeeded anyway"
          ],
          "answer": 1,
          "explanation": "Outages are normal, so requirements must cover queuing, bounded retries, a visible held state, and operational alerts. This keeps payments recoverable and auditable. Assuming perfect availability leads to lost or duplicated payments.",
          "why_wrong": [
            "Every downstream system can fail; requirements must plan for it.",
            "",
            "Dropping payments destroys the audit trail and customer funds.",
            "False success messages mislead customers and create reconciliation breaks."
          ]
        },
        {
          "id": "pb-02-08",
          "domain": "operations",
          "chapter": "ch4",
          "question": "A payment needs two authorisers under a corporate mandate. The first authoriser approves it. What should the system do?",
          "options": [
            "Hold it as partially authorised until the second approval, or expiry, is recorded",
            "Release it immediately to the scheme",
            "Cancel it automatically",
            "Send it to the payee without recording the first approval"
          ],
          "answer": 0,
          "explanation": "Dual authorisation means the payment must wait for the second approval before release, with the first approval preserved in the audit trail. Expiry rules should handle approvals that never complete. Releasing early would breach the mandate.",
          "why_wrong": [
            "",
            "Early release would violate the dual-authorisation mandate.",
            "Cancellation after one valid approval would frustrate users and lose work.",
            "Every approval must be recorded; unrecorded approvals cannot be audited."
          ]
        },
        {
          "id": "pb-02-09",
          "domain": "operations",
          "chapter": "ch68",
          "question": "A BA is defining status messages for customers. Why should internal states not be shown verbatim to customers?",
          "options": [
            "Internal states are always wrong",
            "Customers should never see any status",
            "Internal states use technical wording that confuses customers; plain-language statuses with next steps are clearer",
            "Internal states are secret by law in all cases"
          ],
          "answer": 2,
          "explanation": "Internal states such as queue or enrichment codes mean little to customers. Mapping them to plain statuses with expected timing and next steps reduces calls and complaints. The internal detail stays available to operations and support.",
          "why_wrong": [
            "Internal states can be accurate; the issue is clarity, not correctness.",
            "Customers need clear status updates; hiding all status creates anxiety and calls.",
            "",
            "There is no universal law making every internal state secret; the reason is usability."
          ]
        },
        {
          "id": "pb-02-10",
          "domain": "foundations",
          "chapter": "ch4",
          "question": "What is the final control that confirms a settled payment matches the bank's books and the scheme or account statement?",
          "options": [
            "Reconciliation of the payment record to statements and ledger entries",
            "Customer feedback survey",
            "Deleting the payment record after settlement",
            "Asking the payee to confirm by phone every time"
          ],
          "answer": 0,
          "explanation": "Reconciliation compares internal records with external statements and ledger postings to confirm the payment settled as expected. Breaks are then investigated. It is the control that proves completeness and accuracy after settlement.",
          "why_wrong": [
            "",
            "Surveys measure satisfaction, not financial accuracy.",
            "Deleting records would destroy evidence and prevent investigation.",
            "Phone confirmation for every payment is impractical and is not a systematic control."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-03",
        "title": "Payments BA Test 3: India Rails - UPI, IMPS, NEFT, RTGS",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-03-01",
          "domain": "rails",
          "chapter": "ch9",
          "question": "A customer in India wants to pay a shop instantly from a mobile app using a virtual address. Which rail fits best?",
          "options": [
            "NEFT batch transfer",
            "RTGS",
            "UPI",
            "A paper cheque"
          ],
          "answer": 2,
          "explanation": "UPI supports instant mobile payments using virtual payment addresses, QR codes, and phone numbers. It is designed for everyday instant person-to-person and person-to-merchant payments. NEFT and RTGS serve different needs and channels.",
          "why_wrong": [
            "NEFT settles in batches and is not the instant mobile-first option for a shop payment.",
            "RTGS is for high-value transfers, not routine shop payments.",
            "",
            "A cheque is paper-based and slow compared with an instant mobile payment."
          ]
        },
        {
          "id": "pb-03-02",
          "domain": "rails",
          "chapter": "ch9",
          "question": "A business must move a very large amount in India with immediate final settlement during RTGS hours. Which rail should the BA recommend?",
          "options": [
            "RTGS",
            "IMPS",
            "UPI",
            "NEFT"
          ],
          "answer": 0,
          "explanation": "RTGS settles each payment individually in real time with finality, which suits high-value transfers. UPI and IMPS serve smaller instant payments, while NEFT settles in batches. For large-value final settlement, RTGS is the right rail.",
          "why_wrong": [
            "",
            "IMPS is instant but is aimed at retail-sized transfers, not high-value RTGS use.",
            "UPI is built for everyday instant payments, not large-value final settlement.",
            "NEFT uses batch settlement, so it does not give individual real-time finality."
          ]
        },
        {
          "id": "pb-03-03",
          "domain": "rails",
          "chapter": "ch9",
          "question": "A customer sends money late at night in India and needs it credited immediately to another bank. Which rail is designed for instant 24x7 retail transfers?",
          "options": [
            "IMPS",
            "NEFT only during daytime batches",
            "BACS",
            "SEPA Direct Debit"
          ],
          "answer": 0,
          "explanation": "IMPS provides immediate interbank retail transfers around the clock, including nights and holidays. It was designed for instant account-to-account payments at any time. NEFT batches, BACS, and SEPA Direct Debit do not offer the same instant Indian retail service.",
          "why_wrong": [
            "",
            "NEFT operates in batches on a schedule and is not the instant 24x7 retail option described.",
            "BACS is a UK batch system, not an Indian instant rail.",
            "SEPA Direct Debit is a European pull instrument, not an Indian instant rail."
          ]
        },
        {
          "id": "pb-03-04",
          "domain": "rails",
          "chapter": "ch9",
          "question": "A BA is comparing NEFT and RTGS for a requirements document. What is the core settlement difference?",
          "options": [
            "NEFT needs no bank account and RTGS needs two",
            "NEFT is instant and RTGS is batched",
            "Both settle only once a week",
            "NEFT settles in batches; RTGS settles each payment individually in real time"
          ],
          "answer": 3,
          "explanation": "NEFT processes payments in batches with deferred net settlement, while RTGS settles each instruction gross in real time. This difference drives timing, liquidity, and cutoff requirements. A BA must capture it when advising which rail fits a use case.",
          "why_wrong": [
            "Both require bank accounts; the difference is settlement timing and method.",
            "This reverses the two models; RTGS is the real-time gross system.",
            "Both systems operate far more frequently than weekly.",
            ""
          ]
        },
        {
          "id": "pb-03-05",
          "domain": "rails",
          "chapter": "ch9",
          "question": "A UPI payment shows as successful to the sender but the merchant says it never arrived. What should the BA specify as the first operational step?",
          "options": [
            "Tell the merchant to wait a month with no action",
            "Check the transaction status, reference IDs, and settlement or reconciliation records before concluding",
            "Ask the sender to pay again immediately",
            "Delete the transaction record"
          ],
          "answer": 1,
          "explanation": "Status and reference checks against switch, bank, and reconciliation records establish what actually happened before any refund or re-payment. Paying again risks duplication. A clear investigation path protects both sender and merchant.",
          "why_wrong": [
            "Waiting with no action leaves both parties uncertain and delays resolution.",
            "",
            "An immediate second payment risks a duplicate debit if the first payment later settles.",
            "Deleting the record would destroy the evidence needed to resolve the case."
          ]
        },
        {
          "id": "pb-03-06",
          "domain": "rails",
          "chapter": "ch33",
          "question": "A company wants to collect recurring loan repayments from customers across India through bank mandates. Which system is built for bulk recurring collections?",
          "options": [
            "RTGS",
            "NACH",
            "UPI QR at a shop",
            "Fedwire"
          ],
          "answer": 1,
          "explanation": "NACH supports bulk and recurring electronic collections and payments through mandates, including loan repayments. RTGS is for high-value single transfers, UPI QR suits point-of-sale payments, and Fedwire is a US system. Mandate-based bulk collection is the NACH use case.",
          "why_wrong": [
            "RTGS handles individual high-value transfers, not bulk mandate collections.",
            "",
            "A shop QR code is for single merchant payments, not recurring bulk collections.",
            "Fedwire is a US large-value system and does not serve Indian mandate collections."
          ]
        },
        {
          "id": "pb-03-07",
          "domain": "rails",
          "chapter": "ch9",
          "question": "A BA must explain why a NEFT payment sent just after a batch cutoff waits for the next batch. What is the reason?",
          "options": [
            "The bank lost the payment",
            "NEFT only works on Mondays",
            "NEFT processes in scheduled batches, so late instructions join the next batch",
            "The payee bank refused the payment"
          ],
          "answer": 2,
          "explanation": "NEFT groups instructions into batches processed on a schedule. An instruction arriving after a batch closes must wait for the following batch. Cutoff and batch rules must be visible to customers and operations so waits are expected.",
          "why_wrong": [
            "A wait for the next batch is normal batch behaviour, not a lost payment.",
            "NEFT operates on a regular schedule, not only on Mondays.",
            "",
            "No refusal is implied; the payment simply missed the batch window."
          ]
        },
        {
          "id": "pb-03-08",
          "domain": "rails",
          "chapter": "ch9",
          "question": "A product team wants UPI payments to work when the payee is identified by mobile number. What must the BA confirm in requirements?",
          "options": [
            "That any random number can receive money without registration",
            "That cash must be delivered to the phone",
            "That the payment can skip all validation",
            "That the mobile number is mapped to a valid UPI ID or bank account before the payment is sent"
          ],
          "answer": 3,
          "explanation": "A mobile number is only a convenient alias; it must resolve to a registered UPI ID and bank account. Requirements must cover lookup, confirmation of the payee name, and handling of unregistered numbers. Skipping validation would risk misdirected payments.",
          "why_wrong": [
            "Unregistered numbers cannot receive UPI payments; registration and mapping are required.",
            "UPI is an electronic account-to-account system, not a cash delivery service.",
            "Validation protects against misdirection and must not be skipped.",
            ""
          ]
        },
        {
          "id": "pb-03-09",
          "domain": "rails",
          "chapter": "ch33",
          "question": "A customer wants to pay electricity, gas, and broadband bills through one Indian platform. Which platform is designed for interoperable bill payments?",
          "options": [
            "BACS",
            "CHIPS",
            "T2",
            "BBPS"
          ],
          "answer": 3,
          "explanation": "The Bharat Bill Payment System (BBPS) provides interoperable bill payment for utilities and other billers through banks and agents. CHIPS, T2, and BACS are clearing or settlement systems in other markets. BBPS is the bill-payment platform for this need.",
          "why_wrong": [
            "BACS is a UK batch payment system, not an Indian bill platform.",
            "CHIPS is a US large-value clearing system, not an Indian bill platform.",
            "T2 is the European large-value settlement system, not a bill platform.",
            ""
          ]
        },
        {
          "id": "pb-03-10",
          "domain": "rails",
          "chapter": "ch9",
          "question": "A BA is writing channel guidance. When should a user choose IMPS over NEFT?",
          "options": [
            "When immediate credit at any hour matters more than batch timing",
            "When the payment can wait for the next batch",
            "When the amount is too large for instant rails",
            "When the payee has no bank account"
          ],
          "answer": 0,
          "explanation": "IMPS credits immediately at any hour, so it suits urgent retail payments outside batch schedules. NEFT suits payments that can wait for batch processing. Very large amounts and unbanked payees need different solutions.",
          "why_wrong": [
            "",
            "Payments that can wait suit NEFT batches; urgency points to IMPS.",
            "Very large amounts point to RTGS, not to IMPS.",
            "Both IMPS and NEFT need a bank account for the payee."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-04",
        "title": "Payments BA Test 4: US Rails - Fedwire, FedNow, ACH, CHIPS",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-04-01",
          "domain": "rails",
          "chapter": "ch10",
          "question": "A US bank must settle a high-value payment with immediate finality in central bank money. Which system fits?",
          "options": [
            "Fedwire Funds Service",
            "ACH batch",
            "A paper cheque",
            "A card authorisation"
          ],
          "answer": 0,
          "explanation": "Fedwire settles payments individually in real time in central bank money with finality. ACH is batched, cheques are paper-based, and card authorisation is not large-value settlement. For final high-value settlement, Fedwire is the fit.",
          "why_wrong": [
            "",
            "ACH processes in batches with deferred settlement, not individual real-time finality.",
            "A cheque is slow and does not give immediate central bank finality.",
            "Card authorisation reserves funds; it is not large-value interbank settlement."
          ]
        },
        {
          "id": "pb-04-02",
          "domain": "rails",
          "chapter": "ch10",
          "question": "A US employer pays salaries every two weeks in bulk through the bank. Which rail is normally used?",
          "options": [
            "Fedwire for each salary",
            "ACH",
            "FedNow for each salary individually",
            "CHIPS"
          ],
          "answer": 1,
          "explanation": "ACH is the US batch system for recurring bulk payments such as payroll and bill payments. Fedwire and CHIPS serve large-value transfers, while FedNow serves instant payments. Payroll batches are the classic ACH use case.",
          "why_wrong": [
            "Using Fedwire per salary would be costly and unnecessary for bulk payroll.",
            "",
            "FedNow is for instant payments, not the standard bulk payroll batch channel.",
            "CHIPS is a large-value private clearing system, not the payroll batch rail."
          ]
        },
        {
          "id": "pb-04-03",
          "domain": "rails",
          "chapter": "ch10",
          "question": "A customer wants a US payment that arrives in seconds, at any hour, every day of the year. Which service is designed for this?",
          "options": [
            "Fedwire during business hours",
            "FedNow Service",
            "ACH batch",
            "CHIPS end-of-day netting"
          ],
          "answer": 1,
          "explanation": "FedNow is the Federal Reserve instant payment service operating around the clock every day. Fedwire has operating hours, ACH is batched, and CHIPS nets large-value payments. For instant 24x7 payments, FedNow is the design fit.",
          "why_wrong": [
            "Fedwire operates within defined hours and is not the 24x7 instant retail service.",
            "",
            "ACH batches mean payments wait for batch processing.",
            "CHIPS nets large-value payments and is not the instant retail service."
          ]
        },
        {
          "id": "pb-04-04",
          "domain": "rails",
          "chapter": "ch92",
          "question": "A BA is documenting CHIPS. What best describes its role?",
          "options": [
            "A private-sector large-value clearing system that nets payments and settles through central bank accounts",
            "A retail card network",
            "A mobile wallet for consumers",
            "A cheque clearing house only"
          ],
          "answer": 0,
          "explanation": "CHIPS clears large-value US dollar payments among participating banks, using netting with final settlement through central bank accounts. It is a wholesale system, not a retail card or wallet service. A BA should place it alongside Fedwire in the large-value landscape.",
          "why_wrong": [
            "",
            "CHIPS is a wholesale large-value system, not a retail card network.",
            "CHIPS serves banks for large-value clearing, not consumers through a wallet.",
            "CHIPS handles electronic large-value payments, not only cheques."
          ]
        },
        {
          "id": "pb-04-05",
          "domain": "rails",
          "chapter": "ch10",
          "question": "An ACH debit is returned because the customer account has insufficient funds. What should the BA specify for the originator flow?",
          "options": [
            "Ignore the return and assume it paid",
            "Debit the customer again immediately without notice",
            "Handle the return code, notify the originator, and follow the allowed reinitiation and customer-contact rules",
            "Delete the original entry"
          ],
          "answer": 2,
          "explanation": "ACH returns carry reason codes and must be processed so the originator knows the payment failed. Reinitiation is restricted and customer contact matters. Ignoring returns or debiting without notice creates compliance and customer harm.",
          "why_wrong": [
            "Ignoring a return would misstate the payment as successful.",
            "Unrestricted re-debiting breaches ACH rules and harms customers.",
            "",
            "Deleting the entry would destroy the audit trail for the failed collection."
          ]
        },
        {
          "id": "pb-04-06",
          "domain": "rails",
          "chapter": "ch10",
          "question": "A corporate treasurer asks why Fedwire and FedNow are both needed. What is the clearest distinction for a BA to give?",
          "options": [
            "Fedwire is the established large-value real-time gross settlement service; FedNow is the newer instant payment service for fast everyday payments around the clock",
            "They are identical systems with different names",
            "FedNow only handles cheques",
            "Fedwire is for consumers and FedNow is for central banks only"
          ],
          "answer": 0,
          "explanation": "Fedwire serves high-value real-time gross settlement in central bank money during its operating hours. FedNow serves instant payments for a broad range of values around the clock. They complement each other rather than duplicate each other.",
          "why_wrong": [
            "",
            "The two services have different purposes, hours, and use cases.",
            "FedNow handles electronic instant payments, not cheques.",
            "Both services serve banks and their customers; neither is limited as described."
          ]
        },
        {
          "id": "pb-04-07",
          "domain": "rails",
          "chapter": "ch92",
          "question": "A US payment instruction uses a routing number. What is its purpose?",
          "options": [
            "To identify the individual customer account",
            "To encrypt the payment message",
            "To set the payment amount",
            "To identify the financial institution in the US payment system"
          ],
          "answer": 3,
          "explanation": "The ABA routing number identifies the bank or credit union, while the account number identifies the customer account at that institution. Both are needed to route a payment correctly. Confusing the two causes misrouting and returns.",
          "why_wrong": [
            "The account number identifies the customer account; the routing number identifies the institution.",
            "Routing numbers do not encrypt messages; they identify institutions.",
            "The amount is a separate field and is not set by the routing number.",
            ""
          ]
        },
        {
          "id": "pb-04-08",
          "domain": "rails",
          "chapter": "ch10",
          "question": "A same-day ACH payment is requested late in the day. What must the BA confirm about cutoffs?",
          "options": [
            "Same-day ACH has no cutoffs at all",
            "Cutoffs only apply to international payments",
            "All ACH payments settle instantly regardless of timing",
            "The submission must meet the same-day ACH processing window, or it will settle on a later schedule"
          ],
          "answer": 3,
          "explanation": "Same-day ACH has defined submission windows, and instructions missing a window settle later. Cutoff rules must be in requirements, customer guidance, and operations runbooks. Assuming instant settlement for all ACH creates failed expectations.",
          "why_wrong": [
            "Same-day ACH operates within windows; cutoffs always apply.",
            "Domestic batch systems also have cutoffs that affect settlement timing.",
            "Standard ACH is batched and deferred, not instant.",
            ""
          ]
        },
        {
          "id": "pb-04-09",
          "domain": "rails",
          "chapter": "ch10",
          "question": "A bank is choosing between Fedwire and CHIPS for a large US dollar payment. What factor most affects the choice in practice?",
          "options": [
            "The colour of the bank logo",
            "The length of the payment reference",
            "The customer's favourite branch",
            "Whether the payment suits gross real-time settlement or netted clearing, plus cost, timing, and counterparty arrangements"
          ],
          "answer": 3,
          "explanation": "Fedwire offers gross real-time settlement while CHIPS offers netted clearing with final settlement, and banks weigh liquidity, cost, timing, and relationships. The choice is a treasury and operations decision. Cosmetic factors play no part.",
          "why_wrong": [
            "Branding has no effect on settlement choice.",
            "Reference length does not drive the choice between gross and netted settlement.",
            "Branch preference does not determine wholesale settlement routing.",
            ""
          ]
        },
        {
          "id": "pb-04-10",
          "domain": "rails",
          "chapter": "ch10",
          "question": "A FedNow payment is sent but the receiver bank is unreachable at that moment. What behaviour should the BA expect the design to handle?",
          "options": [
            "The payment waits silently forever",
            "The payment is converted to a cheque automatically",
            "The payment is rejected or timed out promptly so the sender knows it did not complete",
            "The sender is charged twice"
          ],
          "answer": 2,
          "explanation": "Instant payment designs must give a fast definitive outcome: success, rejection, or timeout. A prompt failure lets the sender retry safely or choose another rail. Silent waiting and duplicate charging are unacceptable.",
          "why_wrong": [
            "Instant systems must resolve quickly; indefinite silent waits break the service promise.",
            "There is no automatic conversion to a cheque in instant payment design.",
            "",
            "A failed instant payment must not result in a double charge."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-05",
        "title": "Payments BA Test 5: Europe Rails - SEPA and T2",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-05-01",
          "domain": "rails",
          "chapter": "ch11",
          "question": "A company in France pays a supplier in Germany in euro from its euro account. Which scheme is the standard choice?",
          "options": [
            "Fedwire",
            "SEPA Credit Transfer",
            "UPI",
            "BACS"
          ],
          "answer": 1,
          "explanation": "SEPA Credit Transfer standardises euro credit transfers across SEPA countries using IBAN and ISO 20022. Fedwire and UPI serve other markets, and BACS is a UK batch system. For a euro payment within SEPA, SCT is the standard scheme.",
          "why_wrong": [
            "Fedwire is a US large-value system, not a European euro scheme.",
            "",
            "UPI is an Indian instant system, not a SEPA scheme.",
            "BACS is a UK batch system and does not serve euro SEPA payments."
          ]
        },
        {
          "id": "pb-05-02",
          "domain": "rails",
          "chapter": "ch11",
          "question": "What is T2 in the European payments landscape?",
          "options": [
            "A retail card scheme",
            "A mobile wallet",
            "The Eurosystem real-time gross settlement system for large-value euro payments",
            "A direct debit mandate form"
          ],
          "answer": 2,
          "explanation": "T2 is the Eurosystem platform for real-time gross settlement of large-value euro payments in central bank money. It replaced TARGET2 as the core large-value system. It is wholesale infrastructure, not a retail product.",
          "why_wrong": [
            "T2 is wholesale settlement infrastructure, not a retail card scheme.",
            "T2 is not a consumer wallet.",
            "",
            "A mandate form belongs to direct debit schemes, not to T2."
          ]
        },
        {
          "id": "pb-05-03",
          "domain": "rails",
          "chapter": "ch61",
          "question": "A SEPA Credit Transfer is sent with an incorrect IBAN. What is the most likely outcome?",
          "options": [
            "The payment is rejected or returned because the account cannot be identified or validated",
            "The payment is corrected automatically to any similar IBAN",
            "The payment is paid in cash to the payee",
            "The payment settles with no checks at all"
          ],
          "answer": 0,
          "explanation": "IBAN validation and account identification are core checks; an invalid IBAN leads to rejection or return with a reason. Automatic correction to a similar account would risk misdirection. Requirements must cover IBAN checks before release.",
          "why_wrong": [
            "",
            "Guessing a similar IBAN would risk paying the wrong person.",
            "SEPA credit transfers are account-to-account electronic payments, not cash payments.",
            "SEPA payments pass validation checks; unchecked settlement does not happen."
          ]
        },
        {
          "id": "pb-05-04",
          "domain": "rails",
          "chapter": "ch59",
          "question": "A customer needs a euro payment credited within seconds, day or night. Which SEPA-based service fits?",
          "options": [
            "SEPA Instant Credit Transfer (SCT Inst)",
            "SEPA Direct Debit",
            "A paper-based transfer",
            "T2 batch file at end of day"
          ],
          "answer": 0,
          "explanation": "SCT Inst is designed for instant euro credit transfers processed in seconds around the clock. Direct debit is a pull collection, paper is slow, and T2 serves large-value settlement. For instant euro payments, SCT Inst is the fit.",
          "why_wrong": [
            "",
            "Direct debit collects funds under a mandate; it is not an instant push payment.",
            "Paper transfers are slow and manual.",
            "T2 is a large-value gross settlement system, not the instant retail scheme."
          ]
        },
        {
          "id": "pb-05-05",
          "domain": "rails",
          "chapter": "ch62",
          "question": "A utility wants to collect monthly euro payments from customers across SEPA countries. What must it hold before collecting?",
          "options": [
            "A valid SEPA Direct Debit mandate from each customer",
            "Nothing; it can collect from any account",
            "A US routing number",
            "A cheque from each customer"
          ],
          "answer": 0,
          "explanation": "SEPA Direct Debit collections require a mandate authorising the creditor to collect from the debtor account. The mandate, its reference, and pre-notification rules protect debtors. Collecting without a mandate breaches scheme rules.",
          "why_wrong": [
            "",
            "Collections without authorisation would be unlawful and breach scheme rules.",
            "US routing numbers play no part in SEPA direct debits.",
            "Cheques are a separate paper instrument and do not authorise direct debit collections."
          ]
        },
        {
          "id": "pb-05-06",
          "domain": "rails",
          "chapter": "ch11",
          "question": "A BA is writing requirements for SEPA payments. Why is the IBAN central to the design?",
          "options": [
            "It is only a marketing reference",
            "It is the same as a card number",
            "It replaces the need for any amount field",
            "It uniquely identifies the payee account, including country and bank, in a standard format across SEPA"
          ],
          "answer": 3,
          "explanation": "The IBAN standardises account identification across countries with check digits, country code, and bank and account details. It enables straight-through processing across SEPA. Amount, remittance, and other fields remain separate requirements.",
          "why_wrong": [
            "The IBAN is a functional account identifier, not marketing text.",
            "A card number identifies a card account through a scheme, while an IBAN identifies a bank account.",
            "The amount remains a required field alongside the IBAN.",
            ""
          ]
        },
        {
          "id": "pb-05-07",
          "domain": "rails",
          "chapter": "ch56",
          "question": "TIPS is mentioned in a European architecture discussion. What does TIPS provide?",
          "options": [
            "Paper cheque imaging",
            "Only end-of-day batch clearing",
            "Credit card rewards",
            "Instant payment settlement in central bank money, around the clock"
          ],
          "answer": 3,
          "explanation": "TARGET Instant Payment Settlement (TIPS) settles instant payments in central bank money continuously, supporting SCT Inst. It operates around the clock. It is settlement infrastructure for instant payments, not a batch or card product.",
          "why_wrong": [
            "TIPS handles electronic instant settlement, not cheque imaging.",
            "TIPS settles instantly and continuously, not only at end of day.",
            "TIPS is settlement infrastructure, not a rewards programme.",
            ""
          ]
        },
        {
          "id": "pb-05-08",
          "domain": "rails",
          "chapter": "ch93",
          "question": "A SEPA payment is due on a day that is a bank holiday in the payee country but not in the payer country. What should the BA check first?",
          "options": [
            "Ignore calendars entirely",
            "Cancel all SEPA payments on holidays",
            "Assume the payment will always settle the same day",
            "The applicable scheme calendar and value dating rules for that payment type"
          ],
          "answer": 3,
          "explanation": "SEPA schemes use defined business-day calendars, and holidays affect processing and value dates. The BA must confirm which calendar applies and how the date rolls forward. Ignoring calendars causes missed value dates and customer complaints.",
          "why_wrong": [
            "Calendars directly affect settlement timing and must be considered.",
            "Holiday handling uses date rolling rules, not blanket cancellation.",
            "Same-day settlement cannot be assumed when a holiday intervenes.",
            ""
          ]
        },
        {
          "id": "pb-05-09",
          "domain": "rails",
          "chapter": "ch61",
          "question": "A corporate asks for structured remittance information on a SEPA credit transfer. Why does this matter to the payee?",
          "options": [
            "It makes the payment slower for no reason",
            "It lets the payee reconcile the payment automatically against invoices",
            "It hides the payer identity",
            "It removes the need for an IBAN"
          ],
          "answer": 1,
          "explanation": "Structured remittance data, such as invoice references in defined fields, supports automated reconciliation by the payee. Unstructured free text is harder to match. For corporates, good remittance data reduces manual work and breaks.",
          "why_wrong": [
            "Structured data improves automation; it does not exist to slow payments.",
            "",
            "Remittance data does not hide payer identity, which remains in party fields.",
            "The IBAN is still required to identify the account."
          ]
        },
        {
          "id": "pb-05-10",
          "domain": "rails",
          "chapter": "ch11",
          "question": "A BA must explain the difference between a SEPA scheme and a clearing and settlement mechanism (CSM). What is the distinction?",
          "options": [
            "They are the same thing",
            "The CSM sets the rules and the scheme moves the money",
            "The scheme sets the rules and standards; the CSM provides the infrastructure that clears and settles payments under those rules",
            "Neither has any rules"
          ],
          "answer": 2,
          "explanation": "Schemes define rulebooks, message standards, and timelines, while CSMs operate the technical clearing and settlement processing. Multiple CSMs can serve the same scheme. Keeping the two layers distinct helps in vendor and design discussions.",
          "why_wrong": [
            "The scheme and CSM are separate layers with different responsibilities.",
            "This reverses the roles; the scheme governs and the CSM processes.",
            "",
            "Both layers operate under rules; the scheme rulebook is central."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-06",
        "title": "Payments BA Test 6: UK Rails - Faster Payments, CHAPS, BACS",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-06-01",
          "domain": "rails",
          "chapter": "ch12",
          "question": "A UK customer sends money to a friend and expects it within seconds, day or night. Which rail is designed for this?",
          "options": [
            "BACS",
            "CHAPS",
            "A cheque",
            "Faster Payments"
          ],
          "answer": 3,
          "explanation": "Faster Payments provides near-instant account-to-account payments in the UK around the clock. BACS is a three-day batch cycle, CHAPS serves high-value same-day payments, and cheques are paper-based. For instant everyday payments, Faster Payments fits.",
          "why_wrong": [
            "BACS follows a multi-day batch cycle and is not instant.",
            "CHAPS is for high-value same-day payments, not routine instant transfers.",
            "A cheque is slow and manual compared with Faster Payments.",
            ""
          ]
        },
        {
          "id": "pb-06-02",
          "domain": "rails",
          "chapter": "ch12",
          "question": "A UK solicitor must complete a house purchase payment with same-day final settlement in central bank money. Which rail fits?",
          "options": [
            "Faster Payments",
            "CHAPS",
            "BACS Direct Credit",
            "A standing order"
          ],
          "answer": 1,
          "explanation": "CHAPS is the UK high-value same-day system settling in central bank money with finality, used for house purchases and other time-critical large payments. Faster Payments and BACS serve different values and timings. For guaranteed same-day finality on a large amount, CHAPS is the choice.",
          "why_wrong": [
            "Faster Payments has value limits and is built for everyday payments, not large house purchases.",
            "",
            "BACS takes days through its batch cycle and cannot guarantee same-day finality.",
            "A standing order is a recurring retail instruction, not a high-value settlement rail."
          ]
        },
        {
          "id": "pb-06-03",
          "domain": "rails",
          "chapter": "ch12",
          "question": "A UK employer pays monthly salaries in bulk and plans three working days ahead. Which system matches this cycle?",
          "options": [
            "BACS",
            "Faster Payments",
            "CHAPS",
            "SWIFT gpi"
          ],
          "answer": 0,
          "explanation": "BACS operates on a three-day cycle of submission, processing, and entry, which suits planned bulk salary and supplier payments. CHAPS and Faster Payments are same-day or instant. Payroll planned in advance is the classic BACS use case.",
          "why_wrong": [
            "",
            "Faster Payments is near-instant, not a planned three-day cycle.",
            "CHAPS is same-day high-value settlement, not a three-day bulk cycle.",
            "SWIFT gpi tracks cross-border payments and is not the UK bulk salary system."
          ]
        },
        {
          "id": "pb-06-04",
          "domain": "rails",
          "chapter": "ch91",
          "question": "A UK payment instruction includes a sort code and account number. What does the sort code identify?",
          "options": [
            "The individual customer",
            "The card scheme",
            "The payment amount",
            "The bank branch or institution holding the account"
          ],
          "answer": 3,
          "explanation": "The six-digit sort code identifies the bank and branch in the UK clearing system, while the account number identifies the customer account. Both are needed to route domestic payments correctly. Confusing them causes misrouting.",
          "why_wrong": [
            "The account number identifies the customer account; the sort code identifies the bank branch.",
            "The sort code is a bank identifier, not a card scheme code.",
            "The amount is a separate field.",
            ""
          ]
        },
        {
          "id": "pb-06-05",
          "domain": "rails",
          "chapter": "ch12",
          "question": "A Direct Debit collection in the UK fails because the mandate was cancelled. What should the BA specify?",
          "options": [
            "Collect again the next day anyway",
            "Ignore the cancellation and keep the mandate active",
            "Stop collections under the cancelled mandate, record the cancellation, and notify the originator",
            "Convert the collection to CHAPS"
          ],
          "answer": 2,
          "explanation": "A cancelled mandate ends the authority to collect, so further collections must stop and the cancellation must be recorded and communicated. Collecting after cancellation breaches the Direct Debit Guarantee and scheme rules. Clear mandate lifecycle handling is essential.",
          "why_wrong": [
            "Collecting after cancellation breaches the mandate and the Direct Debit Guarantee.",
            "Ignoring a cancellation would allow unlawful collections.",
            "",
            "CHAPS is a push high-value rail and cannot replace a cancelled pull mandate."
          ]
        },
        {
          "id": "pb-06-06",
          "domain": "rails",
          "chapter": "ch12",
          "question": "A Faster Payments payment is sent near midnight on a Sunday. What should the customer expect?",
          "options": [
            "It will wait until Monday morning because banks are closed",
            "It will need a cheque to complete",
            "It will be converted to BACS automatically",
            "It can arrive within seconds because Faster Payments operates around the clock"
          ],
          "answer": 3,
          "explanation": "Faster Payments operates continuously, including weekends and holidays, so payments can arrive in seconds at any time. Bank branch hours do not limit the rail. Customer guidance should set this expectation clearly.",
          "why_wrong": [
            "Faster Payments does not depend on branch opening hours.",
            "Cheques play no part in Faster Payments processing.",
            "There is no automatic conversion to the multi-day BACS cycle.",
            ""
          ]
        },
        {
          "id": "pb-06-07",
          "domain": "rails",
          "chapter": "ch91",
          "question": "A BA is comparing CHAPS and Faster Payments for a requirements document. What is the key practical difference?",
          "options": [
            "CHAPS is free and Faster Payments is always expensive",
            "Faster Payments only works for businesses",
            "CHAPS serves high-value time-critical payments with same-day finality; Faster Payments serves lower-value instant everyday payments",
            "CHAPS payments take three days"
          ],
          "answer": 2,
          "explanation": "CHAPS is designed for large, time-critical payments with settlement in central bank money, while Faster Payments is designed for fast everyday transfers. Value, timing guarantees, and cost differ accordingly. The BA must route each use case to the right rail.",
          "why_wrong": [
            "Pricing varies by bank and is not the defining difference between the rails.",
            "Faster Payments serves consumers and businesses alike.",
            "",
            "CHAPS is a same-day system, not a three-day system; that is BACS."
          ]
        },
        {
          "id": "pb-06-08",
          "domain": "rails",
          "chapter": "ch12",
          "question": "A BACS file is submitted one day late for a salary run. What is the likely consequence the BA must explain?",
          "options": [
            "Salaries arrive early",
            "Salaries arrive later than planned because the three-day cycle shifts",
            "Salaries are paid twice",
            "The file is processed by CHAPS at no extra cost"
          ],
          "answer": 1,
          "explanation": "BACS follows a fixed three-day cycle, so a late submission moves the entry date forward by the delay. Payroll teams must build in buffer and cutoff discipline. There is no automatic upgrade to a faster rail.",
          "why_wrong": [
            "A late submission cannot make salaries arrive early.",
            "",
            "A late file does not cause duplicate payment; it causes delay.",
            "BACS files are not automatically upgraded to CHAPS."
          ]
        },
        {
          "id": "pb-06-09",
          "domain": "rails",
          "chapter": "ch12",
          "question": "A customer is asked to confirm the payee name before a UK bank transfer. What is this check designed to prevent?",
          "options": [
            "Misdirected payments and impersonation fraud, by checking the name matches the account",
            "Slow internet connections",
            "High fees",
            "Currency conversion errors"
          ],
          "answer": 0,
          "explanation": "Confirmation of Payee checks that the name entered matches the name on the destination account, reducing misdirected payments and authorised push payment fraud. It is a pre-payment control. The BA should specify how match, close match, and no-match results are handled.",
          "why_wrong": [
            "",
            "Name checking does not address internet speed.",
            "Fees are unrelated to name matching.",
            "Domestic name checks do not handle currency conversion."
          ]
        },
        {
          "id": "pb-06-10",
          "domain": "rails",
          "chapter": "ch91",
          "question": "A UK bank is moving CHAPS payments to ISO 20022. What is the main data benefit the BA should highlight?",
          "options": [
            "Richer structured data, including remittance information and party details, improving automation and reconciliation",
            "Less data can be carried",
            "Payments become anonymous",
            "No validation is needed"
          ],
          "answer": 0,
          "explanation": "ISO 20022 carries richer structured data than the older formats, supporting better remittance detail, party identification, and straight-through processing. This improves reconciliation and compliance screening. Migration requirements must capture the new data fields.",
          "why_wrong": [
            "",
            "ISO 20022 carries more structured data, not less.",
            "ISO 20022 improves party identification; it does not make payments anonymous.",
            "Validation remains essential and becomes more detailed with richer data."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-07",
        "title": "Payments BA Test 7: SWIFT MT Messages Essentials",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-07-01",
          "domain": "messaging",
          "chapter": "ch5",
          "question": "A bank sends a single customer credit transfer via SWIFT using the MT format. Which message type is used?",
          "options": [
            "MT202",
            "MT950",
            "MT940",
            "MT103"
          ],
          "answer": 3,
          "explanation": "MT103 is the single customer credit transfer message, carrying payer, payee, amount, and remittance details. MT202 covers bank-to-bank transfers, while MT940 and MT950 are statement messages. A BA must know MT103 as the core customer payment message.",
          "why_wrong": [
            "MT202 is a bank-to-bank payment, not a customer credit transfer.",
            "MT950 is a statement message, not a payment instruction.",
            "MT940 is a customer statement message, not a payment instruction.",
            ""
          ]
        },
        {
          "id": "pb-07-02",
          "domain": "messaging",
          "chapter": "ch5",
          "question": "A bank needs to move its own funds to another bank via SWIFT MT. Which message type fits?",
          "options": [
            "MT202",
            "MT103",
            "MT101",
            "MT900"
          ],
          "answer": 0,
          "explanation": "MT202 is the general financial institution transfer used for bank-to-bank movement of funds, including cover payments. MT103 is for customer transfers, MT101 is a request for transfer, and MT900 is a debit confirmation. The distinction matters for charges and reporting.",
          "why_wrong": [
            "",
            "MT103 carries customer transfers, not bank own-funds transfers.",
            "MT101 requests a transfer; it does not itself move bank funds.",
            "MT900 confirms a debit; it is not the payment instruction itself."
          ]
        },
        {
          "id": "pb-07-03",
          "domain": "messaging",
          "chapter": "ch54",
          "question": "What is a BIC in SWIFT messaging?",
          "options": [
            "A standard code identifying a financial institution or branch",
            "A customer account number",
            "A currency code",
            "A payment amount field"
          ],
          "answer": 0,
          "explanation": "The Business Identifier Code (BIC) uniquely identifies a financial institution and optionally a branch in SWIFT messaging. It drives routing and identification. Account numbers, currency codes, and amounts are separate fields.",
          "why_wrong": [
            "",
            "Account numbers identify customer accounts; the BIC identifies the institution.",
            "Currency codes follow ISO 4217 and are separate from BICs.",
            "Amounts are carried in amount fields, not in the BIC."
          ]
        },
        {
          "id": "pb-07-04",
          "domain": "messaging",
          "chapter": "ch5",
          "question": "An MT103 carries field 70 for remittance information. Why does the BA care about this field?",
          "options": [
            "It sets the payment value date",
            "It helps the payee identify what the payment is for and reconcile it",
            "It identifies the sending bank",
            "It carries the exchange rate"
          ],
          "answer": 1,
          "explanation": "Field 70 carries remittance information such as invoice references that help the beneficiary apply the payment. Poor remittance data causes reconciliation breaks and queries. Requirements should specify what reference data originators must provide.",
          "why_wrong": [
            "Value date is carried in field 32A, not field 70.",
            "",
            "The sender is identified in the message header and sender fields, not field 70.",
            "Exchange rate details belong in other fields; field 70 is remittance information."
          ]
        },
        {
          "id": "pb-07-05",
          "domain": "messaging",
          "chapter": "ch5",
          "question": "A SWIFT message fails validation because a mandatory field is missing. What should the receiving system do?",
          "options": [
            "Process it anyway and guess the missing value",
            "Hold it for a month with no notice",
            "Forward it to the payee without checks",
            "Reject it with a clear error so the sender can correct and resend"
          ],
          "answer": 3,
          "explanation": "Missing mandatory data means the message cannot be processed safely, so it must be rejected with a clear error (a NACK). The sender then corrects and resends. Guessing values risks misdirected payments.",
          "why_wrong": [
            "Guessing mandatory data risks paying the wrong party or amount.",
            "Silent holding delays correction and hides the failure.",
            "Forwarding unchecked messages spreads the error downstream.",
            ""
          ]
        },
        {
          "id": "pb-07-06",
          "domain": "messaging",
          "chapter": "ch50",
          "question": "A corporate wants its bank to execute a payment instruction on its behalf using SWIFT. Which message does the corporate send as a request for transfer?",
          "options": [
            "MT202",
            "MT103",
            "MT101",
            "MT940"
          ],
          "answer": 2,
          "explanation": "MT101 is the request for transfer sent by a corporate or non-bank to its bank, instructing the bank to debit an account and make a payment. The bank then sends an MT103 or equivalent onward. MT101 sits at the corporate-to-bank edge.",
          "why_wrong": [
            "MT202 is a bank-to-bank transfer, not a corporate request.",
            "MT103 is the bank-to-bank customer credit transfer sent after the bank accepts the request.",
            "",
            "MT940 is a statement message sent by the bank to the customer."
          ]
        },
        {
          "id": "pb-07-07",
          "domain": "messaging",
          "chapter": "ch52",
          "question": "A bank sends its customer a statement of account movements via SWIFT MT. Which message type is used?",
          "options": [
            "MT103",
            "MT202",
            "MT101",
            "MT940"
          ],
          "answer": 3,
          "explanation": "MT940 is the customer statement message reporting account transactions and balances. MT950 is the statement for banks. Payment instructions and requests use different types. Statement messages feed reconciliation.",
          "why_wrong": [
            "MT103 is a payment instruction, not a statement.",
            "MT202 is a bank-to-bank payment, not a statement.",
            "MT101 is a request for transfer, not a statement.",
            ""
          ]
        },
        {
          "id": "pb-07-08",
          "domain": "messaging",
          "chapter": "ch5",
          "question": "An MT message uses structured fields with tags like 32A and 59. What does the tag structure provide?",
          "options": [
            "A defined position and format for each data item so systems can parse it reliably",
            "Decoration only",
            "Encryption of the whole message",
            "A way to hide the amount"
          ],
          "answer": 0,
          "explanation": "Tags define which field carries which data and in what format, enabling straight-through processing across banks. Without tags, systems could not reliably parse amounts, parties, and dates. Field definitions are central to mapping work.",
          "why_wrong": [
            "",
            "Tags are functional parsing markers, not decoration.",
            "Encryption is a transport and security matter, not the role of field tags.",
            "Tags make the amount explicit and machine-readable; they do not hide it."
          ]
        },
        {
          "id": "pb-07-09",
          "domain": "messaging",
          "chapter": "ch53",
          "question": "A BA is reviewing MT103 optional fields. Why should optional fields still be specified in requirements?",
          "options": [
            "Optional fields are never used",
            "Optional fields such as charges and regulatory reporting data affect processing, costs, and compliance when present",
            "Optional means the field is banned",
            "Optional fields cannot be validated"
          ],
          "answer": 1,
          "explanation": "Optional fields are used conditionally, and when present they drive charges handling, regulatory reporting, and party identification. Requirements must state when each field is expected, how it is validated, and how it maps onward. Ignoring them creates exceptions.",
          "why_wrong": [
            "Optional fields are widely used when the business case needs them.",
            "",
            "Optional means conditionally present, not banned.",
            "Optional fields can and should be validated when present."
          ]
        },
        {
          "id": "pb-07-10",
          "domain": "messaging",
          "chapter": "ch54",
          "question": "A new analyst thinks SWIFT moves money itself. What should the BA correct?",
          "options": [
            "SWIFT does move money directly between vaults",
            "SWIFT is only a card network",
            "SWIFT carries secure payment messages and instructions; settlement of funds happens through accounts and payment systems",
            "SWIFT replaces all bank accounts"
          ],
          "answer": 2,
          "explanation": "SWIFT is a messaging network that carries instructions securely between institutions. Funds move through correspondent accounts, central bank systems, and clearing systems. Keeping messaging and settlement distinct is fundamental to payments analysis.",
          "why_wrong": [
            "SWIFT does not physically move money; it moves instructions.",
            "SWIFT is a financial messaging network, not a card network.",
            "",
            "SWIFT messaging operates alongside bank accounts; it does not replace them."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-08",
        "title": "Payments BA Test 8: ISO 20022 Fundamentals",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-08-01",
          "domain": "messaging",
          "chapter": "ch6",
          "question": "What is ISO 20022 in payments?",
          "options": [
            "A single bank's internal format",
            "A card scheme rulebook",
            "A type of bank account",
            "A global standard for financial messaging using a shared data dictionary and structured XML-based messages"
          ],
          "answer": 3,
          "explanation": "ISO 20022 provides a common language for financial messages with a shared repository of data definitions and structured message formats. It supports richer data than older formats. Banks, schemes, and market infrastructures adopt it for interoperability.",
          "why_wrong": [
            "ISO 20022 is an open global standard, not one bank's format.",
            "It is a messaging standard, not a card scheme rulebook.",
            "It is a messaging standard, not an account type.",
            ""
          ]
        },
        {
          "id": "pb-08-02",
          "domain": "messaging",
          "chapter": "ch6",
          "question": "A message identifier reads 'pacs.008.001.08'. What does the 'pacs' part indicate?",
          "options": [
            "It is a pain initiation message",
            "It is a statement message",
            "It belongs to the payments clearing and settlement message family",
            "It is a securities message"
          ],
          "answer": 2,
          "explanation": "The pacs family covers payments clearing and settlement messages exchanged between financial institutions. Pain covers payment initiation, camt covers cash management, and other families cover other domains. The prefix tells the BA which business area the message serves.",
          "why_wrong": [
            "Pain is the initiation family; pacs is clearing and settlement.",
            "Statement messages belong to the camt family.",
            "",
            "Securities messages use other families; pacs is payments."
          ]
        },
        {
          "id": "pb-08-03",
          "domain": "messaging",
          "chapter": "ch6",
          "question": "Why does ISO 20022 improve on older MT formats for a BA writing requirements?",
          "options": [
            "It carries richer structured data with clear fields for parties, remittance, and purpose, improving automation",
            "It carries less data",
            "It removes the need for validation",
            "It works without any standards"
          ],
          "answer": 0,
          "explanation": "ISO 20022 messages use structured elements for names, addresses, remittance, and purpose codes, which systems can process without parsing free text. This improves straight-through processing, screening, and reconciliation. Requirements can specify each element precisely.",
          "why_wrong": [
            "",
            "ISO 20022 carries more structured data, not less.",
            "Validation remains essential and is more detailed with richer data.",
            "ISO 20022 is itself a standard; it does not remove standardisation."
          ]
        },
        {
          "id": "pb-08-04",
          "domain": "messaging",
          "chapter": "ch39",
          "question": "A corporate sends a payment initiation file to its bank in ISO 20022. Which message is used?",
          "options": [
            "pacs.008",
            "pacs.002",
            "camt.053",
            "pain.001"
          ],
          "answer": 3,
          "explanation": "pain.001 is the customer credit transfer initiation message sent by a customer to its bank. pacs.008 is the interbank credit transfer, camt.053 is a statement, and pacs.002 is a status report. The pain family sits at the customer-to-bank edge.",
          "why_wrong": [
            "pacs.008 is exchanged between banks, not sent by the corporate to initiate.",
            "pacs.002 reports status; it does not initiate a payment.",
            "camt.053 is a bank-to-customer statement.",
            ""
          ]
        },
        {
          "id": "pb-08-05",
          "domain": "messaging",
          "chapter": "ch6",
          "question": "A bank receives an ISO 20022 message that fails schema validation. What is the correct handling?",
          "options": [
            "Accept it and ignore the errors",
            "Change the data silently to fit the schema",
            "Reject it with a status report explaining the validation failure",
            "Forward it to the next bank unchanged"
          ],
          "answer": 2,
          "explanation": "Schema validation failures mean the message does not conform to the agreed structure, so it must be rejected with a clear status report. The sender corrects and resends. Accepting invalid messages breaks downstream processing and audit.",
          "why_wrong": [
            "Accepting invalid messages risks failed processing and bad data downstream.",
            "Silent data changes destroy integrity and auditability.",
            "",
            "Forwarding an invalid message spreads the defect to the next bank."
          ]
        },
        {
          "id": "pb-08-06",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "A BA sees a usage guideline for a CBPR+ message. What is its purpose?",
          "options": [
            "To define how a community of banks uses the base message, including mandatory fields and rules for that community",
            "To replace the ISO 20022 standard entirely",
            "To ban all optional fields",
            "To set foreign exchange rates"
          ],
          "answer": 0,
          "explanation": "Usage guidelines constrain the base ISO 20022 message for a specific community, stating which elements are required, which values are allowed, and which rules apply. CBPR+ guidelines govern cross-border payments on SWIFT. A BA must map to the guideline, not just the base message.",
          "why_wrong": [
            "",
            "Guidelines sit on top of the standard; they do not replace it.",
            "Guidelines define field usage; they do not ban all optional fields.",
            "Exchange rates are business data, not guideline content."
          ]
        },
        {
          "id": "pb-08-07",
          "domain": "messaging",
          "chapter": "ch6",
          "question": "Structured address data is required in a new ISO 20022 flow. Why is structured address data better than free-text address lines?",
          "options": [
            "It separates town, postcode, and country into defined elements that screening and routing systems can use reliably",
            "It is harder to read",
            "It hides the payee location",
            "It makes messages shorter in every case"
          ],
          "answer": 0,
          "explanation": "Structured addresses put each component in its own element, so sanctions screening, routing, and validation can use town, postcode, and country precisely. Free-text lines need parsing and vary widely. Structured data improves straight-through processing.",
          "why_wrong": [
            "",
            "Structured data is easier for systems to use reliably, even if it looks longer.",
            "Structured addresses make location data clearer, not hidden.",
            "Structured messages can be longer; the benefit is quality, not brevity."
          ]
        },
        {
          "id": "pb-08-08",
          "domain": "messaging",
          "chapter": "ch39",
          "question": "Which ISO 20022 message reports the status of a payment instruction back to the sender?",
          "options": [
            "pain.001",
            "camt.053",
            "pacs.008",
            "pacs.002"
          ],
          "answer": 3,
          "explanation": "pacs.002 is the payment status report used to accept or reject an instruction and to report processing status with reason codes. pain.001 initiates, pacs.008 carries the credit transfer, and camt.053 is a statement. Status reporting closes the feedback loop.",
          "why_wrong": [
            "pain.001 initiates a payment; it does not report its status.",
            "camt.053 reports account statements, not instruction status.",
            "pacs.008 carries the payment instruction itself.",
            ""
          ]
        },
        {
          "id": "pb-08-09",
          "domain": "messaging",
          "chapter": "ch6",
          "question": "A stakeholder asks whether ISO 20022 messages are only for cross-border payments. What is the correct answer?",
          "options": [
            "Yes, domestic payments can never use ISO 20022",
            "No, ISO 20022 is used for domestic, cross-border, high-value, instant, and many other payment types",
            "Yes, and only SWIFT uses it",
            "No, it is only for card payments"
          ],
          "answer": 1,
          "explanation": "ISO 20022 is adopted across domestic high-value systems, instant payment schemes, SEPA, and cross-border flows. Its use is broad and growing. A BA should expect it in most modern payment programmes.",
          "why_wrong": [
            "Many domestic systems have adopted ISO 20022.",
            "",
            "Many infrastructures beyond SWIFT use ISO 20022.",
            "Card authorisation uses different standards; ISO 20022 covers account-based payments broadly."
          ]
        },
        {
          "id": "pb-08-10",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "A message version changes from one release to another. What must the BA confirm before go-live?",
          "options": [
            "That old and new versions are always identical",
            "That the agreed version, schema, and usage guideline are implemented and tested end to end with counterparties",
            "That version numbers do not matter",
            "That testing can be skipped for a version change"
          ],
          "answer": 1,
          "explanation": "Message versions can add, change, or retire elements, so the exact version and guideline must be agreed and tested with all parties. Version mismatches cause rejections. A BA must track versions in requirements, mapping, and test plans.",
          "why_wrong": [
            "Versions can differ in elements and rules; they are not identical.",
            "",
            "Version numbers identify the exact schema and rules in force.",
            "Version changes need testing because they can break validation and mapping."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-09",
        "title": "Payments BA Test 9: pacs.008 and Payment Messages",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-09-01",
          "domain": "messaging",
          "chapter": "ch7",
          "question": "A bank sends a customer credit transfer to another bank in ISO 20022. Which message carries it?",
          "options": [
            "pain.001",
            "camt.053",
            "pacs.008",
            "pacs.004"
          ],
          "answer": 2,
          "explanation": "pacs.008 is the Financial Institution to Financial Institution Customer Credit Transfer, the ISO 20022 successor to MT103. pain.001 is customer initiation, camt.053 is a statement, and pacs.004 is a return. A BA must recognise pacs.008 as the core interbank customer payment message.",
          "why_wrong": [
            "pain.001 is sent by the customer to the bank, not between banks.",
            "camt.053 is a statement message.",
            "",
            "pacs.004 returns a payment; it does not carry the original transfer."
          ]
        },
        {
          "id": "pb-09-02",
          "domain": "messaging",
          "chapter": "ch7",
          "question": "In a pacs.008, what is the role of the debtor agent?",
          "options": [
            "The payee's bank",
            "The payee themselves",
            "The card scheme",
            "The bank that debits the payer's account and sends the payment onward"
          ],
          "answer": 3,
          "explanation": "The debtor agent is the payer's bank, which debits the debtor and initiates the interbank leg. The creditor agent serves the payee. Agent roles drive routing, charges, and settlement logic in requirements.",
          "why_wrong": [
            "The payee's bank is the creditor agent.",
            "The payee is the creditor, not the debtor agent.",
            "Card schemes do not act as debtor agents in pacs.008.",
            ""
          ]
        },
        {
          "id": "pb-09-03",
          "domain": "messaging",
          "chapter": "ch7",
          "question": "A pacs.008 carries a UETR. What is the UETR used for?",
          "options": [
            "To uniquely track the payment end to end across all banks and systems",
            "To set the exchange rate",
            "To identify the card number",
            "To replace the amount field"
          ],
          "answer": 0,
          "explanation": "The Unique End-to-End Transaction Reference (UETR) stays with the payment across every leg, enabling tracking through gpi and investigations. It does not set rates or amounts. Requirements must preserve the UETR through mapping and forwarding.",
          "why_wrong": [
            "",
            "Exchange rates are carried in separate elements, not in the UETR.",
            "Card numbers are unrelated to UETR tracking.",
            "The amount remains a separate field; the UETR is an identifier."
          ]
        },
        {
          "id": "pb-09-04",
          "domain": "messaging",
          "chapter": "ch60",
          "question": "A corporate file contains many credit transfer instructions in one pain.001. How should the bank acknowledge acceptance or rejection?",
          "options": [
            "With no response at all",
            "With a pain.002 status report covering the file, groups, or individual instructions as agreed",
            "With a phone call only",
            "With a new pain.001"
          ],
          "answer": 1,
          "explanation": "pain.002 is the customer payment status report that tells the corporate which groups or transactions were accepted or rejected, with reasons. This feedback loop is essential for straight-through processing. No response would leave the corporate blind.",
          "why_wrong": [
            "Silence leaves the corporate unable to know what was accepted.",
            "",
            "Phone calls do not scale and leave no structured audit trail.",
            "A new pain.001 would be another initiation, not a status report."
          ]
        },
        {
          "id": "pb-09-05",
          "domain": "messaging",
          "chapter": "ch7",
          "question": "A pacs.008 is rejected by the next bank for invalid creditor account details. Which message reports this back?",
          "options": [
            "pacs.004",
            "camt.053",
            "pacs.002",
            "pain.001"
          ],
          "answer": 2,
          "explanation": "pacs.002 reports acceptance or rejection of a payment instruction with reason codes. pacs.004 is used for returns after acceptance, camt.053 is a statement, and pain.001 initiates. The reject versus return distinction matters for handling and timing.",
          "why_wrong": [
            "pacs.004 is a return of an accepted payment, not a rejection report.",
            "camt.053 reports statements, not instruction rejections.",
            "",
            "pain.001 initiates payments; it does not report interbank rejections."
          ]
        },
        {
          "id": "pb-09-06",
          "domain": "messaging",
          "chapter": "ch7",
          "question": "A BA is mapping charge bearer options in pacs.008. What does the charge bearer element control?",
          "options": [
            "Who bears the transfer charges: debtor, creditor, or shared",
            "The payment currency",
            "The value date",
            "The payee name spelling"
          ],
          "answer": 0,
          "explanation": "The charge bearer indicates whether charges fall on the debtor (OUR), the creditor (BEN), or are shared (SHA). This affects the amount the payee receives and must be specified clearly. Currency, value date, and names are separate elements.",
          "why_wrong": [
            "",
            "Currency is carried in the amount elements, not the charge bearer.",
            "Value date is the settlement date element, not the charge bearer.",
            "Name spelling is a party identification matter, not a charges matter."
          ]
        },
        {
          "id": "pb-09-07",
          "domain": "messaging",
          "chapter": "ch39",
          "question": "A payment needs to be returned after it was accepted and settled. Which ISO 20022 message is used?",
          "options": [
            "pacs.002",
            "pacs.008",
            "pain.002",
            "pacs.004"
          ],
          "answer": 3,
          "explanation": "pacs.004 is the payment return message used to return funds for a previously accepted payment, with a return reason. pacs.002 reports status, pacs.008 is the original transfer, and pain.002 reports to the customer. Returns need their own message and reason handling.",
          "why_wrong": [
            "pacs.002 reports status and rejections, not returns of settled payments.",
            "pacs.008 is the original credit transfer.",
            "pain.002 is a customer status report, not an interbank return.",
            ""
          ]
        },
        {
          "id": "pb-09-08",
          "domain": "messaging",
          "chapter": "ch7",
          "question": "A pacs.008 carries both an instruction ID and an end-to-end ID. Why are both needed?",
          "options": [
            "They are duplicates with no difference",
            "Only one is ever used in practice",
            "One is for cards and one is for cash",
            "The instruction ID identifies the instruction between two parties, while the end-to-end ID stays constant across the whole payment chain"
          ],
          "answer": 3,
          "explanation": "The instruction ID is point-to-point and can change between legs, while the end-to-end ID is assigned by the originator and persists across the chain for reconciliation. Both support tracking and investigation. Requirements must preserve each correctly.",
          "why_wrong": [
            "The two IDs have different scopes and purposes.",
            "Both are used in practice for different tracking purposes.",
            "Both IDs serve account-based payment tracking, not cards or cash.",
            ""
          ]
        },
        {
          "id": "pb-09-09",
          "domain": "messaging",
          "chapter": "ch60",
          "question": "A pain.001 file fails a duplicate check because the same file was sent twice. What should the bank do?",
          "options": [
            "Process both files and pay twice",
            "Reject the duplicate and inform the corporate so no duplicate payment is created",
            "Delete the first file silently",
            "Pay half the amount from each file"
          ],
          "answer": 1,
          "explanation": "Duplicate detection protects against double payment when files are resent after timeouts or errors. The duplicate must be rejected with a clear status, not processed. Requirements must define duplicate keys and handling.",
          "why_wrong": [
            "Processing both files would duplicate every payment in the file.",
            "",
            "Deleting the original would lose valid instructions and the audit trail.",
            "Splitting amounts would corrupt every payment in the file."
          ]
        },
        {
          "id": "pb-09-10",
          "domain": "messaging",
          "chapter": "ch7",
          "question": "A BA must explain why pacs.008 carries purpose codes. What is their main benefit?",
          "options": [
            "They classify the payment purpose in a standard way for reporting, screening, and processing",
            "They make the message look longer",
            "They replace the amount",
            "They hide the payer"
          ],
          "answer": 0,
          "explanation": "Purpose codes give a standard classification of why a payment is made, supporting regulatory reporting, screening, and automated processing. Free-text purpose alone is hard to analyse consistently. Requirements should specify which codes are allowed for each product.",
          "why_wrong": [
            "",
            "Length is not the purpose; standard classification is.",
            "Purpose codes do not replace the amount field.",
            "Purpose codes do not hide party information."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-10",
        "title": "Payments BA Test 10: Correspondent Banking and Nostro Vostro",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-10-01",
          "domain": "crossborder",
          "chapter": "ch13",
          "question": "Bank A holds an account with Bank B in Bank B's country to make payments there. From Bank A's view, what is this account called?",
          "options": [
            "Vostro account",
            "Suspense account",
            "Nostro account",
            "Loan account"
          ],
          "answer": 2,
          "explanation": "A nostro account is 'our account with you': Bank A's account held at Bank B, seen from Bank A's perspective. The same account is a vostro account from Bank B's perspective. The two terms describe one account from opposite sides.",
          "why_wrong": [
            "Vostro is the same account seen from the account-holding bank's side, not from Bank A's side.",
            "A suspense account holds unclear items temporarily; it is not a correspondent account.",
            "",
            "A loan account records borrowing, not a correspondent settlement account."
          ]
        },
        {
          "id": "pb-10-02",
          "domain": "crossborder",
          "chapter": "ch13",
          "question": "Why do banks use correspondent banking for cross-border payments?",
          "options": [
            "To avoid all regulation",
            "To reach markets and currencies where they have no branch, using a local bank's accounts and clearing access",
            "To replace all payment messages",
            "To lend money to the payee"
          ],
          "answer": 1,
          "explanation": "Correspondent banks provide local accounts, clearing access, and currency services in markets where the sending bank has no presence. This extends reach without building branches everywhere. Regulation and messaging still apply.",
          "why_wrong": [
            "Correspondent banking is regulated and subject to due diligence.",
            "",
            "Messaging remains essential; correspondents provide accounts and access, not message replacement.",
            "Correspondent services are about payment reach, not lending to the payee."
          ]
        },
        {
          "id": "pb-10-03",
          "domain": "crossborder",
          "chapter": "ch14",
          "question": "In a serial cross-border payment, how do funds and instructions move?",
          "options": [
            "The payee collects cash directly",
            "Funds move first and instructions follow a week later",
            "Only one bank is involved",
            "Instructions and funds move together through each bank in the chain in sequence"
          ],
          "answer": 3,
          "explanation": "In the serial method, each bank in the chain receives the instruction and passes funds onward to the next bank in sequence. The payment instruction travels with the funds leg by leg. This contrasts with the cover method, where instruction and funds take different paths.",
          "why_wrong": [
            "Serial payments are account-based, not cash collections.",
            "Instructions and funds move together in sequence in the serial method.",
            "Serial payments involve a chain of banks.",
            ""
          ]
        },
        {
          "id": "pb-10-04",
          "domain": "crossborder",
          "chapter": "ch14",
          "question": "What is the key feature of a cover payment?",
          "options": [
            "No banks are involved",
            "The payment instruction goes directly to the payee bank while funds move separately through correspondent accounts",
            "The payer hand-delivers cash",
            "The payment is never settled"
          ],
          "answer": 1,
          "explanation": "In a cover payment, the instruction travels directly to the creditor bank while the funding moves through correspondent accounts via a separate cover message. This can speed the instruction and improve data. The BA must understand both legs to trace breaks.",
          "why_wrong": [
            "Multiple banks are involved in cover payments.",
            "",
            "Cover payments are electronic and account-based.",
            "Cover payments do settle; the funding leg provides the value."
          ]
        },
        {
          "id": "pb-10-05",
          "domain": "crossborder",
          "chapter": "ch13",
          "question": "A nostro account shows a lower balance than expected after a busy day. What is the most likely operational cause to investigate first?",
          "options": [
            "Payments settled, fees were charged, or expected incoming funds have not yet arrived",
            "The account was closed without notice",
            "The currency no longer exists",
            "All payments were duplicated"
          ],
          "answer": 0,
          "explanation": "Nostro balances move with outgoing settlements, incoming funds, fees, and value-date timing. Reconciliation compares expected versus actual movements to find breaks. Jumping to closure or duplication without evidence wastes investigation time.",
          "why_wrong": [
            "",
            "Closure without notice is rare and would be communicated; balance movement is normally explained by flows.",
            "Currency disappearance is not a realistic daily cause.",
            "Duplication is possible but should be evidenced by reconciliation, not assumed first."
          ]
        },
        {
          "id": "pb-10-06",
          "domain": "crossborder",
          "chapter": "ch13",
          "question": "A BA is writing requirements for nostro reconciliation. What is the main control?",
          "options": [
            "Ignore small differences forever",
            "Ask the payee to reconcile the bank's account",
            "Delete unmatched lines",
            "Match each nostro statement line to internal payment records and investigate breaks promptly"
          ],
          "answer": 3,
          "explanation": "Nostro reconciliation matches statement entries to internal records so missing, duplicate, or wrong-value items are found quickly. Breaks can mean failed settlements, wrong accounts, or fraud. Prompt investigation protects liquidity and customer payments.",
          "why_wrong": [
            "Small differences can signal systematic errors and must be tracked, not ignored.",
            "Nostro reconciliation is the bank's own control, not the payee's job.",
            "Deleting unmatched lines would hide breaks and destroy evidence.",
            ""
          ]
        },
        {
          "id": "pb-10-07",
          "domain": "crossborder",
          "chapter": "ch94",
          "question": "A cross-border payment passes through three intermediary banks. What risk does a long chain create for the BA to document?",
          "options": [
            "More points of delay, fee deduction, data loss, and investigation complexity",
            "No risk at all",
            "Faster settlement in every case",
            "No need for tracking"
          ],
          "answer": 0,
          "explanation": "Each intermediary adds processing time, potential charges, data handling, and a point of failure. Long chains make tracking and investigations harder. Requirements should cover tracking, charge transparency, and escalation paths.",
          "why_wrong": [
            "",
            "Every additional leg adds risk and complexity.",
            "Longer chains normally slow payments rather than speeding them.",
            "Tracking becomes more important, not less, as chains lengthen."
          ]
        },
        {
          "id": "pb-10-08",
          "domain": "crossborder",
          "chapter": "ch13",
          "question": "Before opening a correspondent relationship, what due diligence must a bank perform?",
          "options": [
            "None at all",
            "Only ask for a fee quote",
            "Only check the bank logo",
            "Know-your-customer and AML checks on the respondent bank, including ownership, controls, and risk profile"
          ],
          "answer": 3,
          "explanation": "Correspondent banking carries money-laundering and sanctions risk, so banks must assess the respondent's ownership, controls, and risk before and during the relationship. This is a regulatory expectation. Fee and branding checks do not replace due diligence.",
          "why_wrong": [
            "Due diligence is a regulatory requirement for correspondent relationships.",
            "Fees matter commercially but do not address financial crime risk.",
            "Branding checks provide no risk assurance.",
            ""
          ]
        },
        {
          "id": "pb-10-09",
          "domain": "crossborder",
          "chapter": "ch14",
          "question": "A payment uses the serial method but an intermediary deducts an unexpected fee. What is the consequence for the payee?",
          "options": [
            "The payee may receive less than the original amount unless charges were agreed as OUR",
            "The payee receives more than sent",
            "The payment is automatically doubled",
            "Fees never affect the payee"
          ],
          "answer": 0,
          "explanation": "Under shared or beneficiary charge arrangements, intermediaries may deduct fees, reducing the amount credited. OUR charging requires the sender to bear charges so the full amount arrives. Charge arrangements must be explicit in requirements and customer terms.",
          "why_wrong": [
            "",
            "Fee deductions reduce the credited amount; they do not increase it.",
            "Fees do not double payments.",
            "Fees directly affect the amount credited under SHA and BEN arrangements."
          ]
        },
        {
          "id": "pb-10-10",
          "domain": "crossborder",
          "chapter": "ch13",
          "question": "A BA hears the term 'de-risking' in correspondent banking. What does it usually mean?",
          "options": [
            "Banks taking on more risky relationships",
            "Banks removing all controls",
            "Banks exiting correspondent relationships judged too risky or unprofitable after risk assessment",
            "Banks merging with every correspondent"
          ],
          "answer": 2,
          "explanation": "De-risking is the exit from relationships where financial crime risk, compliance cost, or low profitability outweighs the business case. It can reduce payment reach for affected corridors. A BA should understand its impact on routing and customer options.",
          "why_wrong": [
            "De-risking reduces exposure; it does not add risky relationships.",
            "De-risking is driven by risk and control concerns, not by removing controls.",
            "",
            "Exit is the opposite of merging with every correspondent."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-11",
        "title": "Payments BA Test 11: Charges, FX and Value Dating",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-11-01",
          "domain": "crossborder",
          "chapter": "ch15",
          "question": "A sender chooses OUR charges for a cross-border payment. What does this mean for the payee?",
          "options": [
            "The payee pays all charges",
            "The sender bears the charges so the payee receives the full amount",
            "Charges are split equally by law",
            "No charges apply anywhere"
          ],
          "answer": 1,
          "explanation": "OUR means the debtor bears all transfer charges, so intermediaries should not deduct from the principal and the payee receives the full amount. SHA shares charges and BEN puts them on the payee. The charge option must be captured at initiation.",
          "why_wrong": [
            "Payee-pays-all is the BEN option, not OUR.",
            "",
            "Equal splitting is not the OUR model; OUR puts charges on the sender.",
            "Charges still apply; OUR only decides who bears them."
          ]
        },
        {
          "id": "pb-11-02",
          "domain": "crossborder",
          "chapter": "ch15",
          "question": "A payment is sent with SHA charges. What should the customer be told?",
          "options": [
            "The payee will always receive the exact sent amount",
            "No bank may charge anything",
            "The sender pays their own bank charges and the payee may bear intermediary and payee bank charges, so the credited amount may be less",
            "The sender pays the payee's bank charges too"
          ],
          "answer": 2,
          "explanation": "SHA means each side bears its own bank charges, and intermediaries may deduct their fees, so the credited amount can be less than sent. Customers must understand this before choosing. Transparency about SHA prevents disputes.",
          "why_wrong": [
            "Under SHA, deductions can reduce the credited amount.",
            "Banks may charge for their services under SHA.",
            "",
            "Sender-pays-all is OUR, not SHA."
          ]
        },
        {
          "id": "pb-11-03",
          "domain": "crossborder",
          "chapter": "ch15",
          "question": "A payment is converted from pounds to euro. What must the BA specify about the exchange rate?",
          "options": [
            "The rate can be decided a month later with no record",
            "The rate is always 1 to 1",
            "The rate source, timing, and how the applied rate is shown to the customer and recorded",
            "The customer never needs to see the rate"
          ],
          "answer": 2,
          "explanation": "FX requirements must state the rate source, when the rate is fixed, any spread or margin, and how the customer sees the applied rate. This supports transparency, reconciliation, and dispute handling. Undocumented rates create complaints and breaks.",
          "why_wrong": [
            "Rates must be fixed and recorded at execution, not decided later.",
            "Exchange rates vary by currency pair and market; they are not 1 to 1.",
            "",
            "Customers need to see the applied rate for transparency and checking."
          ]
        },
        {
          "id": "pb-11-04",
          "domain": "crossborder",
          "chapter": "ch15",
          "question": "What is value date in payments?",
          "options": [
            "The date the customer first thought about paying",
            "The date the bank statement is printed",
            "The date the message was typed",
            "The date on which funds are considered available or on which value is given for the payment"
          ],
          "answer": 3,
          "explanation": "The value date is the date funds become available or value is exchanged, which drives interest, liquidity, and reconciliation. It can differ from the processing or instruction date. Requirements must distinguish value date from other dates.",
          "why_wrong": [
            "Value date is a settlement concept, not a thought date.",
            "Statement printing date is unrelated to value dating.",
            "Typing date is an operational timestamp, not value date.",
            ""
          ]
        },
        {
          "id": "pb-11-05",
          "domain": "operations",
          "chapter": "ch76",
          "question": "A corporate treasurer complains that a payment credited a day later than expected. What should the BA check first?",
          "options": [
            "The colour of the payment screen",
            "The value date, cutoff, currency calendar, and rail timing for that payment",
            "The customer's shoe size",
            "The bank's advertising"
          ],
          "answer": 1,
          "explanation": "Late credit is usually explained by value-date rules, cutoff times, holidays, or rail timing. Checking these facts first gives a clear answer before escalating. Other factors are irrelevant to settlement timing.",
          "why_wrong": [
            "Screen appearance does not affect settlement timing.",
            "",
            "Personal details do not affect value dating.",
            "Advertising has no effect on payment timing."
          ]
        },
        {
          "id": "pb-11-06",
          "domain": "crossborder",
          "chapter": "ch15",
          "question": "A BA is documenting gpi tracking for a corporate client. What does gpi tracking provide?",
          "options": [
            "Visibility of payment status, route, and charges across banks, using the UETR",
            "A guarantee that every payment is free",
            "A replacement for bank accounts",
            "A loan to the payee"
          ],
          "answer": 0,
          "explanation": "SWIFT gpi gives end-to-end tracking of cross-border payments, showing status, confirmations, and deducted charges along the chain. It uses the UETR to link updates. This visibility helps corporates manage cash and queries.",
          "why_wrong": [
            "",
            "gpi improves visibility; it does not remove charges.",
            "gpi tracks payments; it does not replace accounts.",
            "gpi is a tracking service, not a lending product."
          ]
        },
        {
          "id": "pb-11-07",
          "domain": "crossborder",
          "chapter": "ch15",
          "question": "A payment is sent in US dollars but the payee account is in euro. Where does conversion normally happen?",
          "options": [
            "Nowhere; dollars are credited as euro at the same number",
            "By deleting the currency field",
            "By the payee at home with no record",
            "At an agreed point in the chain, with the conversion rate and charges disclosed under the applicable terms"
          ],
          "answer": 3,
          "explanation": "Currency conversion happens at a defined point, often at the payee bank or an intermediary, under agreed terms with a recorded rate. The credited euro amount reflects the conversion and any charges. Requirements must state who converts and how the rate is shown.",
          "why_wrong": [
            "Dollars cannot be credited as euro at the same number; conversion is required.",
            "Deleting the currency field would make the payment invalid.",
            "Conversion is a bank process with records, not a manual home task.",
            ""
          ]
        },
        {
          "id": "pb-11-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A client asks for a full breakdown of charges before sending a cross-border payment. What is the best BA response in requirements terms?",
          "options": [
            "Refuse to show any charges",
            "Specify upfront disclosure of the sending bank charges, the charge option, and a warning that intermediary charges may apply under SHA or BEN",
            "Promise the exact final credited amount in all cases",
            "Hide charges until after settlement"
          ],
          "answer": 1,
          "explanation": "Upfront disclosure of known charges plus a clear warning about possible intermediary deductions is honest and achievable. Exact final amounts cannot always be promised when intermediaries are involved. Transparency reduces disputes.",
          "why_wrong": [
            "Hiding charges harms trust and may breach disclosure expectations.",
            "",
            "Final credited amounts depend on intermediaries and cannot always be guaranteed.",
            "Hiding charges until after settlement is poor practice and creates complaints."
          ]
        },
        {
          "id": "pb-11-09",
          "domain": "crossborder",
          "chapter": "ch15",
          "question": "What is the main risk if a payment value date falls on a currency holiday?",
          "options": [
            "Settlement may roll to the next business day, changing when funds are available and how interest is calculated",
            "The payment is automatically doubled",
            "The currency is abolished",
            "The payment becomes a card payment"
          ],
          "answer": 0,
          "explanation": "Currency holidays mean settlement cannot occur in that currency that day, so value dates roll to the next valid business day under agreed conventions. This affects availability and interest. Calendar handling must be in requirements and customer messaging.",
          "why_wrong": [
            "",
            "Holidays cause date rolling, not duplication.",
            "Holidays do not abolish currencies.",
            "A holiday does not change the payment instrument type."
          ]
        },
        {
          "id": "pb-11-10",
          "domain": "crossborder",
          "chapter": "ch15",
          "question": "A BA sees a charge described as a 'lifting fee'. What does it most likely relate to?",
          "options": [
            "Lifting cash from a vault",
            "A fee for lifting a card limit",
            "A fee deducted by a bank in the payment chain for processing the transfer",
            "A penalty for using a mobile app"
          ],
          "answer": 2,
          "explanation": "In cross-border payments, intermediary or beneficiary banks may deduct processing fees from the transferred amount, sometimes called lifting fees. They affect the amount credited under SHA and BEN arrangements. Requirements and disclosures must account for them.",
          "why_wrong": [
            "The term relates to payment chain fees, not physical cash handling.",
            "Card limit fees are a different product matter.",
            "",
            "App usage penalties are unrelated to interbank fee deduction."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-12",
        "title": "Payments BA Test 12: Cutoffs, Calendars and Settlement Timing",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-12-01",
          "domain": "operations",
          "chapter": "ch18",
          "question": "A payment instruction arrives after the daily cutoff for its rail. What normally happens?",
          "options": [
            "It settles instantly anyway",
            "It is deleted",
            "It is processed in the next available cycle or business day",
            "It is converted to cash"
          ],
          "answer": 2,
          "explanation": "Cutoffs mark the last acceptance time for a processing cycle; late instructions wait for the next cycle or business day. Requirements must state cutoffs per rail, currency, and channel. Deletion or instant settlement would break scheme rules.",
          "why_wrong": [
            "Cutoffs exist precisely because late instructions cannot join the closed cycle.",
            "Payments are queued, not deleted, when they miss a cutoff.",
            "",
            "Late instructions are not converted to cash."
          ]
        },
        {
          "id": "pb-12-02",
          "domain": "operations",
          "chapter": "ch72",
          "question": "Why must a BA capture time zones when writing cutoff requirements for cross-border payments?",
          "options": [
            "Time zones do not matter",
            "Time zones only affect email",
            "All banks use the same local time",
            "Cutoffs are set in local times that differ by market, so the same moment can be inside one cutoff and outside another"
          ],
          "answer": 3,
          "explanation": "A cutoff stated in London time is a different moment in Tokyo or New York. Requirements must state the time zone for every cutoff and convert correctly in systems and guidance. Time-zone errors cause missed value dates.",
          "why_wrong": [
            "Time zones directly affect whether a cutoff is met.",
            "Time zones affect payment processing, not only email.",
            "Banks operate across many time zones.",
            ""
          ]
        },
        {
          "id": "pb-12-03",
          "domain": "clearing",
          "chapter": "ch18",
          "question": "A payment is described as 'same-day value'. What does this promise?",
          "options": [
            "Funds are given value on the same business day, subject to cutoff and calendar rules",
            "The message is sent the same day but funds may arrive weeks later",
            "The payment is free",
            "The payee is paid in cash the same day"
          ],
          "answer": 0,
          "explanation": "Same-day value means the value date is the current business day, so funds are available that day once settlement completes. Cutoffs and holidays still apply. A BA must not promise same-day value for instructions received after cutoff.",
          "why_wrong": [
            "",
            "Same-day value concerns funds availability, not only message sending.",
            "Value timing does not determine pricing.",
            "Same-day value is about account value, not cash delivery."
          ]
        },
        {
          "id": "pb-12-04",
          "domain": "operations",
          "chapter": "ch44",
          "question": "A bank holiday falls on the scheduled settlement day for a batch payment. What should operations expect?",
          "options": [
            "Settlement happens as normal because holidays do not matter",
            "The payment is paid twice the next day",
            "The payment is cancelled permanently",
            "Settlement rolls to the next business day under the scheme calendar rules"
          ],
          "answer": 3,
          "explanation": "Batch and settlement systems follow business-day calendars, so holidays push settlement to the next valid day. Requirements and customer communications must reflect holiday calendars. Cancellation or duplication would be incorrect handling.",
          "why_wrong": [
            "Holidays stop settlement in the affected market.",
            "Rolling changes timing, not the amount or count.",
            "Holiday rolling defers settlement; it does not cancel the payment.",
            ""
          ]
        },
        {
          "id": "pb-12-05",
          "domain": "operations",
          "chapter": "ch18",
          "question": "A BA is defining a future-dated payment feature. What is the key control?",
          "options": [
            "Release the payment immediately regardless of the date",
            "Store the instruction securely, validate it at release time, and release it on the requested date subject to funds and checks",
            "Delete the instruction until the date arrives",
            "Ask the customer to resubmit every day"
          ],
          "answer": 1,
          "explanation": "Future-dated payments must be warehoused, revalidated at release (funds, limits, sanctions, account status), and released on the requested date. Immediate release defeats the purpose. Revalidation catches changes since submission.",
          "why_wrong": [
            "Immediate release would ignore the requested future date.",
            "",
            "Deletion would lose the instruction entirely.",
            "Daily resubmission is poor design; warehousing handles the wait."
          ]
        },
        {
          "id": "pb-12-06",
          "domain": "operations",
          "chapter": "ch44",
          "question": "A payment hub must handle end-of-day processing. What should the BA specify for in-flight payments at day-end?",
          "options": [
            "Abandon them with no record",
            "Force all of them to settle instantly",
            "Define which states roll to the next day, which complete, and how statuses and value dates are handled",
            "Delete their audit trails"
          ],
          "answer": 2,
          "explanation": "Day-end boundaries need explicit rules for payments in each state so none are lost, duplicated, or mis-valued. Value dates, cutoffs, and reconciliation all depend on these rules. Abandoning or forcing settlement creates breaks.",
          "why_wrong": [
            "Abandoning payments would lose customer funds and records.",
            "Forcing settlement ignores cutoffs, liquidity, and scheme rules.",
            "",
            "Audit trails must be preserved across day boundaries."
          ]
        },
        {
          "id": "pb-12-07",
          "domain": "clearing",
          "chapter": "ch17",
          "question": "A clearing cycle closes at 15:00. A payment arrives at 15:05. What should the customer-facing status say?",
          "options": [
            "Received and scheduled for the next clearing cycle, with the expected date shown",
            "Paid",
            "Failed permanently",
            "No status at all"
          ],
          "answer": 0,
          "explanation": "The honest status is received and queued for the next cycle, with the expected processing date. Calling it paid would mislead, and calling it failed would cause unnecessary resubmission. Clear queue statuses reduce queries.",
          "why_wrong": [
            "",
            "Paid implies settlement, which has not happened yet.",
            "Missing a cycle is not a permanent failure.",
            "Customers need a status; silence creates calls and duplicate submissions."
          ]
        },
        {
          "id": "pb-12-08",
          "domain": "operations",
          "chapter": "ch72",
          "question": "A cross-border payment involves a currency with a weekend that differs from the sender market weekend. What must the BA check?",
          "options": [
            "Nothing; weekends are the same everywhere",
            "The currency and market calendars for every leg, because settlement days differ",
            "Only the sender market calendar",
            "Only the card scheme calendar"
          ],
          "answer": 1,
          "explanation": "Weekends and holidays differ by country and currency, so each leg needs its own calendar check. A payment can be ready in one market but unable to settle in another. Requirements must reference all applicable calendars.",
          "why_wrong": [
            "Weekends differ by market; assuming sameness causes missed dates.",
            "",
            "Sender-only calendars miss settlement constraints in other legs.",
            "Card calendars do not govern cross-border account payments."
          ]
        },
        {
          "id": "pb-12-09",
          "domain": "operations",
          "chapter": "ch44",
          "question": "A same-day payment misses its cutoff by two minutes. The customer demands same-day value anyway. What is the correct handling?",
          "options": [
            "Grant same-day value by backdating the value date",
            "Delete the payment",
            "Explain the cutoff, offer the next available value date, and record the instruction correctly",
            "Send the payment without any checks"
          ],
          "answer": 2,
          "explanation": "Cutoffs are binding operational rules; backdating value would misstate settlement and interest. The correct handling is transparent explanation plus the next valid value date. Exceptions need proper approval and audit, not silent backdating.",
          "why_wrong": [
            "Backdating misstates value and breaks controls.",
            "Deletion would lose a valid instruction.",
            "",
            "Skipping checks to meet a demand creates risk and exceptions."
          ]
        },
        {
          "id": "pb-12-10",
          "domain": "operations",
          "chapter": "ch18",
          "question": "What is 'T+1' settlement in plain language?",
          "options": [
            "Settlement one hour after the trade",
            "Settlement one business day after the transaction date",
            "Settlement one month later",
            "Settlement before the transaction"
          ],
          "answer": 1,
          "explanation": "T+1 means settlement occurs one business day after the transaction or trade date (T). The convention depends on business-day calendars. A BA must state whether T counts calendar or business days for each product.",
          "why_wrong": [
            "T+1 counts business days, not hours.",
            "",
            "One month would be a much longer convention.",
            "Settlement follows the transaction; it does not precede it."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-13",
        "title": "Payments BA Test 13: Cards Lifecycle for a BA",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-13-01",
          "domain": "cards",
          "chapter": "ch21",
          "question": "A customer taps a card at a terminal. What happens first in the card lifecycle?",
          "options": [
            "Settlement to the merchant",
            "Monthly statement printing",
            "Chargeback",
            "Authorisation: the issuer checks funds, limits, and fraud rules and approves or declines"
          ],
          "answer": 3,
          "explanation": "Authorisation is the real-time check at the point of sale: the issuer verifies the account, available funds or credit, and risk rules. Clearing and settlement follow later. Chargebacks and statements come much later in the lifecycle.",
          "why_wrong": [
            "Settlement happens after clearing, well after authorisation.",
            "Statements summarise past activity; they do not start a transaction.",
            "Chargebacks are post-settlement disputes, not the first step.",
            ""
          ]
        },
        {
          "id": "pb-13-02",
          "domain": "cards",
          "chapter": "ch21",
          "question": "After authorisation, what is clearing in card payments?",
          "options": [
            "The customer paying the bill",
            "The removal of the card from the wallet",
            "The exchange of transaction records between acquirer and issuer so amounts can be calculated and settled",
            "The printing of a receipt"
          ],
          "answer": 2,
          "explanation": "Clearing is the exchange and matching of authorised transaction data between acquirer and issuer, including fees and amounts. Settlement then moves funds. Clearing is the bridge between the sale and the money movement.",
          "why_wrong": [
            "Bill payment is the cardholder repaying the issuer, not interbank clearing.",
            "Wallet removal is unrelated to clearing.",
            "",
            "Receipt printing is a point-of-sale action, not clearing."
          ]
        },
        {
          "id": "pb-13-03",
          "domain": "cards",
          "chapter": "ch22",
          "question": "A customer disputes a card transaction they do not recognise. What process is started?",
          "options": [
            "A new authorisation",
            "A chargeback: the issuer raises a dispute through the scheme and the merchant can respond",
            "A refund issued by the card scheme directly",
            "A loan application"
          ],
          "answer": 1,
          "explanation": "A chargeback is the scheme dispute process where the issuer reverses the transaction amount and the acquirer and merchant can represent evidence. It follows scheme rules and timelines. It is distinct from a merchant refund.",
          "why_wrong": [
            "Authorisation starts a new purchase, not a dispute.",
            "",
            "The scheme governs the process; funds move through issuer and acquirer, not as a scheme refund.",
            "Disputes are not loan applications."
          ]
        },
        {
          "id": "pb-13-04",
          "domain": "cards",
          "chapter": "ch22",
          "question": "What does 3D Secure add to an online card payment?",
          "options": [
            "Free delivery",
            "A paper receipt",
            "A higher credit limit",
            "An extra authentication step where the cardholder verifies identity with the issuer"
          ],
          "answer": 3,
          "explanation": "3D Secure (such as Visa Secure or Mastercard Identity Check) adds issuer authentication for online payments, reducing fraud. It can use biometrics, one-time passcodes, or risk-based checks. Requirements must cover friction, fallback, and exemption handling.",
          "why_wrong": [
            "Delivery is a merchant matter, not an authentication feature.",
            "3D Secure is digital authentication, not paper.",
            "Authentication does not change credit limits.",
            ""
          ]
        },
        {
          "id": "pb-13-05",
          "domain": "cards",
          "chapter": "ch22",
          "question": "A mobile wallet stores a token instead of the real card number. What is the main benefit?",
          "options": [
            "The real card number is protected because merchants and devices use a token that is useless if stolen alone",
            "The real card number is shared with every merchant",
            "Payments become slower",
            "No authorisation is needed"
          ],
          "answer": 0,
          "explanation": "Tokenisation replaces the card number with a token linked to the device or merchant, so stolen tokens cannot easily be reused elsewhere. The real number stays with the issuer and token service. This reduces breach impact.",
          "why_wrong": [
            "",
            "Tokenisation prevents sharing the real number; that is its purpose.",
            "Tokenised payments remain fast at the point of sale.",
            "Authorisation is still required for tokenised payments."
          ]
        },
        {
          "id": "pb-13-06",
          "domain": "cards",
          "chapter": "ch31",
          "question": "What is interchange in card payments?",
          "options": [
            "The exchange rate for cash",
            "A fee paid by the customer to the scheme directly",
            "A fee paid by the acquirer to the issuer for each transaction, set under scheme rules",
            "A type of card design"
          ],
          "answer": 2,
          "explanation": "Interchange is the fee the merchant's acquirer pays to the cardholder's issuer, compensating the issuer for handling and risk. It is a major component of merchant costs. A BA documenting card economics must distinguish interchange from scheme and acquirer fees.",
          "why_wrong": [
            "Interchange is a card fee, not a cash exchange rate.",
            "Customers do not pay interchange directly to the scheme.",
            "",
            "Interchange is a fee flow, not a design choice."
          ]
        },
        {
          "id": "pb-13-07",
          "domain": "cards",
          "chapter": "ch21",
          "question": "A card payment is authorised but the merchant never clears it. What happens to the cardholder hold?",
          "options": [
            "It stays forever",
            "It is converted to a chargeback automatically",
            "The authorisation hold expires after a defined period and the funds become available again",
            "The card is cancelled"
          ],
          "answer": 2,
          "explanation": "Authorisation holds expire if no clearing record arrives within the scheme or issuer timeframe, releasing the held funds. Requirements must state hold durations and customer messaging. Expiry is normal; it is not a chargeback or cancellation.",
          "why_wrong": [
            "Holds expire; they do not stay forever.",
            "Expiry of a hold is not a dispute process.",
            "",
            "Non-clearing does not cancel the card."
          ]
        },
        {
          "id": "pb-13-08",
          "domain": "cards",
          "chapter": "ch63",
          "question": "A BA is documenting a card refund. How does a refund differ from a chargeback?",
          "options": [
            "They are identical",
            "A refund is initiated by the merchant returning funds; a chargeback is a scheme dispute raised by the issuer",
            "A refund is always slower",
            "A chargeback is initiated by the merchant"
          ],
          "answer": 1,
          "explanation": "A refund is a voluntary merchant action returning funds to the card, while a chargeback is a formal dispute through the scheme with evidence and timelines. Refunds are simpler and cheaper. Requirements must route each correctly.",
          "why_wrong": [
            "Refunds and chargebacks have different initiators, rules, and costs.",
            "",
            "Speed is not the defining difference.",
            "Chargebacks are raised by the issuer on behalf of the cardholder."
          ]
        },
        {
          "id": "pb-13-09",
          "domain": "cards",
          "chapter": "ch32",
          "question": "A merchant wants to accept contactless card payments in store. What must the BA confirm about the terminal?",
          "options": [
            "That it can print adverts",
            "That it supports contactless acceptance, scheme certification, and applicable transaction limits and verification rules",
            "That it needs no network connection",
            "That it accepts only cash"
          ],
          "answer": 1,
          "explanation": "Contactless acceptance needs certified terminals, scheme approval, and correct handling of limits and cardholder verification. Network connectivity is required for authorisation. Requirements must cover certification and limit behaviour.",
          "why_wrong": [
            "Advertising is irrelevant to payment acceptance.",
            "",
            "Terminals need connectivity to obtain authorisations.",
            "Contactless card acceptance is electronic, not cash-only."
          ]
        },
        {
          "id": "pb-13-10",
          "domain": "cards",
          "chapter": "ch21",
          "question": "A debit card purchase is declined for insufficient funds at the till. What should the customer-facing message do?",
          "options": [
            "Give a clear, discreet decline message and suggest an alternative payment method",
            "Show the full account balance to the shop",
            "Accuse the customer of fraud aloud",
            "Retry the card silently ten times"
          ],
          "answer": 0,
          "explanation": "Decline handling must be clear and discreet, protecting privacy while helping the customer choose another method. Showing balances or accusing fraud at the till is inappropriate. Silent retries waste time and can look suspicious.",
          "why_wrong": [
            "",
            "Balances are private and must not be shown to the merchant.",
            "Fraud accusations must never be made at the till without evidence.",
            "Silent repeated retries do not fix insufficient funds."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-14",
        "title": "Payments BA Test 14: Sanctions Screening Basics for a BA",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-14-01",
          "domain": "compliance",
          "chapter": "ch23",
          "question": "What is sanctions screening in payments?",
          "options": [
            "Checking payment parties and details against sanctions lists to detect prohibited persons, entities, or countries",
            "Checking spelling in payment messages",
            "Checking the payment amount only",
            "Checking the weather at the payee location"
          ],
          "answer": 0,
          "explanation": "Sanctions screening compares names, identifiers, and other payment data with lists issued by authorities such as the UN, EU, OFAC, and OFSI. Matches must be investigated before release. It is a legal obligation, not a spelling check.",
          "why_wrong": [
            "",
            "Spelling matters only because it affects name matching; screening itself is a list check.",
            "Amount checks do not detect sanctioned parties.",
            "Weather is irrelevant to sanctions compliance."
          ]
        },
        {
          "id": "pb-14-02",
          "domain": "compliance",
          "chapter": "ch23",
          "question": "A payment matches a sanctions list entry exactly. What must happen?",
          "options": [
            "Release it immediately to avoid delay",
            "Split it into smaller payments",
            "Change the payee name to avoid the match",
            "Block or reject it under the applicable sanctions regime and escalate to compliance; do not release it"
          ],
          "answer": 3,
          "explanation": "A true sanctions match requires blocking or rejection as the regime demands, with compliance escalation and reporting. Releasing, renaming, or splitting to evade screening is prohibited. A BA must specify hard-stop handling for true matches.",
          "why_wrong": [
            "Releasing a true match would breach sanctions law.",
            "Splitting to evade controls is a serious compliance breach.",
            "Altering names to evade screening is prohibited.",
            ""
          ]
        },
        {
          "id": "pb-14-03",
          "domain": "compliance",
          "chapter": "ch95",
          "question": "A payment generates a possible sanctions alert that turns out to be a different person with a similar name. What is this called?",
          "options": [
            "A true match",
            "A duplicate payment",
            "A settlement failure",
            "A false positive"
          ],
          "answer": 3,
          "explanation": "A false positive is an alert where the screened party is not actually the listed person, often due to similar names. Analysts clear false positives with documented reasoning. Distinguishing false positives from true matches is core screening work.",
          "why_wrong": [
            "A true match is the listed person themselves, not a namesake.",
            "Duplication concerns repeated payments, not name matches.",
            "Settlement failure concerns funds movement, not screening alerts.",
            ""
          ]
        },
        {
          "id": "pb-14-04",
          "domain": "compliance",
          "chapter": "ch23",
          "question": "Why should screening happen before a payment is released?",
          "options": [
            "To delay payments for fun",
            "Because screening after release is more accurate",
            "Because once funds are released to a sanctioned party they are hard to recover and the breach has occurred",
            "Because schemes require delays"
          ],
          "answer": 2,
          "explanation": "Pre-release screening prevents prohibited payments from leaving the bank. Post-release detection cannot undo the breach and recovery is difficult. Requirements must place screening gates before release for in-scope payments.",
          "why_wrong": [
            "Screening exists to prevent breaches, not to cause delay.",
            "Post-release screening is too late to prevent the breach.",
            "",
            "Schemes do not require delay for its own sake; the law requires prevention."
          ]
        },
        {
          "id": "pb-14-05",
          "domain": "compliance",
          "chapter": "ch95",
          "question": "A BA is specifying screening for ISO 20022 payments. Why does structured party data help screening?",
          "options": [
            "It gives screening engines clean name, address, and identifier fields to match accurately, reducing false positives",
            "It makes screening impossible",
            "It hides party details",
            "It removes the need for lists"
          ],
          "answer": 0,
          "explanation": "Structured data separates names, dates of birth, identifiers, and addresses so matching logic can compare like with like. Free-text fields increase false positives and missed matches. Data quality directly affects screening effectiveness.",
          "why_wrong": [
            "",
            "Structured data improves screening; it does not block it.",
            "Structured data makes party details clearer, not hidden.",
            "Lists remain essential; structured data improves matching against them."
          ]
        },
        {
          "id": "pb-14-06",
          "domain": "compliance",
          "chapter": "ch23",
          "question": "A payment is held for sanctions review. What should the customer be told?",
          "options": [
            "The full details of the sanctions list match",
            "That it has definitely been blocked forever",
            "That the payment is under review and may be delayed, without disclosing sensitive screening detail or tipping off",
            "Nothing at all, ever"
          ],
          "answer": 2,
          "explanation": "Customers need honest delay messaging, but screening detail must not be disclosed in ways that breach confidentiality or tipping-off rules. Compliance teams define approved wording. A BA must agree customer messaging with compliance.",
          "why_wrong": [
            "Disclosing match detail can breach confidentiality and tipping-off rules.",
            "Review may clear the payment; permanent blocking must not be assumed.",
            "",
            "Silence creates complaints and duplicate submissions; a review notice is needed."
          ]
        },
        {
          "id": "pb-14-07",
          "domain": "compliance",
          "chapter": "ch95",
          "question": "Sanctions lists are updated frequently. What must the BA specify for list management?",
          "options": [
            "Lists never need updating",
            "Timely ingestion of list updates, version control, and re-screening rules as agreed with compliance",
            "Manual retyping of lists once a year",
            "Use of any list found online without checks"
          ],
          "answer": 1,
          "explanation": "Sanctions lists change often, so systems must ingest updates promptly, track versions, and apply agreed re-screening. Stale lists cause missed matches and breaches. List management is a controlled operational process.",
          "why_wrong": [
            "Lists change frequently and stale lists create risk.",
            "",
            "Annual manual retyping is slow and error prone.",
            "Lists must come from trusted official sources under change control."
          ]
        },
        {
          "id": "pb-14-08",
          "domain": "compliance",
          "chapter": "ch23",
          "question": "A payment mentions a sanctioned country only in free-text remittance information. What should the design do?",
          "options": [
            "Ignore remittance text entirely",
            "Screen relevant free-text fields as well as structured fields, under compliance-approved rules",
            "Delete the remittance text",
            "Approve it because the payee name is clean"
          ],
          "answer": 1,
          "explanation": "Sanctions risk can hide in remittance and narrative fields, so screening scope must cover agreed text fields, not only names. Compliance defines which fields are screened and how alerts are handled. Ignoring text creates evasion risk.",
          "why_wrong": [
            "Ignoring text fields would miss risks hidden in narratives.",
            "",
            "Deleting data destroys evidence and does not address the risk.",
            "A clean payee name does not clear risk indicated elsewhere in the payment."
          ]
        },
        {
          "id": "pb-14-09",
          "domain": "compliance",
          "chapter": "ch95",
          "question": "An analyst clears a sanctions alert. What record must be kept?",
          "options": [
            "No record is needed",
            "The alert, the evidence checked, the rationale, the decision maker, and the timestamp",
            "Only the payment amount",
            "Only the analyst's first name"
          ],
          "answer": 1,
          "explanation": "Alert decisions must be auditable: what was checked, why it was cleared, who decided, and when. Regulators and auditors review this trail. Incomplete records make good decisions look unsupported.",
          "why_wrong": [
            "Unaudited clearances cannot be evidenced to regulators.",
            "",
            "Amount alone does not explain a screening decision.",
            "Identity alone does not record evidence or rationale."
          ]
        },
        {
          "id": "pb-14-10",
          "domain": "compliance",
          "chapter": "ch23",
          "question": "A BA is asked whether sanctions screening applies to domestic payments too. What is the correct answer?",
          "options": [
            "Never, only cross-border payments are screened",
            "Only card payments are screened",
            "Yes, screening scope is set by law and policy and commonly includes domestic payments where a listed party could be involved",
            "Only cash payments are screened"
          ],
          "answer": 2,
          "explanation": "Sanctions obligations can apply to domestic payments involving listed persons or entities, so screening scope is defined by regulation and bank policy, not by border alone. A BA must confirm scope with compliance for each product. Assuming domestic means exempt is dangerous.",
          "why_wrong": [
            "Domestic payments can involve listed parties and fall within scope.",
            "Account-based payments are screened too, not only cards.",
            "",
            "Electronic payments are screened; cash is a separate matter."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-15",
        "title": "Payments BA Test 15: AML, KYC and Fraud Basics for a BA",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-15-01",
          "domain": "compliance",
          "chapter": "ch24",
          "question": "What does KYC mean for a bank opening a new customer account?",
          "options": [
            "Keeping yearly coupons",
            "Knowing the customer's favourite colour",
            "Know Your Customer: verifying identity, understanding the relationship, and assessing risk before and during the relationship",
            "Keeping your cash"
          ],
          "answer": 2,
          "explanation": "KYC involves identifying and verifying the customer, understanding the purpose of the relationship, and assessing money-laundering risk. It is ongoing, not a one-time form. A BA must reflect KYC steps in onboarding requirements.",
          "why_wrong": [
            "KYC is a regulatory process, not a coupon scheme.",
            "Personal preferences are irrelevant to KYC.",
            "",
            "KYC is about identity and risk, not cash storage."
          ]
        },
        {
          "id": "pb-15-02",
          "domain": "compliance",
          "chapter": "ch24",
          "question": "A customer's payment pattern suddenly changes to large round-amount transfers to unrelated countries. What should happen?",
          "options": [
            "Flag it for AML monitoring review, as unusual patterns may indicate money laundering or fraud",
            "Ignore it because the customer is long-standing",
            "Increase the customer's limit automatically",
            "Close the account with no review"
          ],
          "answer": 0,
          "explanation": "Transaction monitoring detects unusual patterns for review by financial crime teams. Long-standing relationships do not remove the need to investigate change. Review, not automatic action, is the proportionate first step.",
          "why_wrong": [
            "",
            "Familiarity does not exempt unusual activity from review.",
            "Raising limits without review would increase risk.",
            "Closure without review is disproportionate; investigation comes first."
          ]
        },
        {
          "id": "pb-15-03",
          "domain": "compliance",
          "chapter": "ch24",
          "question": "What is the placement stage of money laundering?",
          "options": [
            "Introducing illicit funds into the financial system, for example by depositing cash",
            "Investing clean money in property",
            "Hiding ownership through layers of transactions",
            "Spending laundered money as if legitimate"
          ],
          "answer": 0,
          "explanation": "Placement is the first stage: getting criminal proceeds into the financial system. Layering then obscures the trail, and integration makes funds appear legitimate. A BA should understand the stages to support monitoring requirements.",
          "why_wrong": [
            "",
            "Property investment with clean money is not placement.",
            "Hiding ownership through layers is the layering stage.",
            "Spending as if legitimate is the integration stage."
          ]
        },
        {
          "id": "pb-15-04",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A staff member suspects money laundering and considers warning the customer that a report is being made. What rule applies?",
          "options": [
            "Warning the customer is encouraged",
            "Tipping off is prohibited: the customer must not be alerted that a suspicious activity report is being considered or filed",
            "The customer must approve the report first",
            "Reports are only verbal"
          ],
          "answer": 1,
          "explanation": "Tipping-off laws prohibit alerting a suspect that a report has been made or is under consideration, because it could prejudice an investigation. Staff must escalate through internal channels. A BA must never design customer messages that tip off.",
          "why_wrong": [
            "Warning the customer would breach tipping-off rules.",
            "",
            "Customer approval is not required and must not be sought.",
            "Reports follow formal internal and regulatory processes."
          ]
        },
        {
          "id": "pb-15-05",
          "domain": "compliance",
          "chapter": "ch24",
          "question": "A customer is tricked into sending money to a fraudster impersonating their bank. What type of fraud is this?",
          "options": [
            "Card skimming only",
            "No fraud occurred because the customer authorised it",
            "Cheque forgery only",
            "Authorised push payment (APP) fraud, where the victim is deceived into authorising the payment"
          ],
          "answer": 3,
          "explanation": "APP fraud deceives victims into authorising payments to accounts controlled by criminals, often through impersonation. Authorisation does not mean no fraud occurred. Requirements must cover warnings, confirmation checks, and victim support.",
          "why_wrong": [
            "Skimming copies card data; APP fraud deceives the victim into sending money.",
            "Deception means fraud occurred even though the victim authorised the transfer.",
            "Cheque forgery is a different method.",
            ""
          ]
        },
        {
          "id": "pb-15-06",
          "domain": "compliance",
          "chapter": "ch24",
          "question": "Why do banks apply transaction limits and step-up authentication for unusual payments?",
          "options": [
            "To annoy customers",
            "To increase fees",
            "To reduce fraud losses by adding friction when risk is higher, while keeping routine payments smooth",
            "To slow all payments equally"
          ],
          "answer": 2,
          "explanation": "Risk-based controls add checks where fraud risk is higher, such as new payees or large amounts, while low-risk payments stay fast. This balances security and experience. Blanket friction for every payment would harm customers unnecessarily.",
          "why_wrong": [
            "Controls exist to prevent fraud, not to annoy.",
            "Limits and authentication are risk controls, not fee mechanisms.",
            "",
            "Risk-based controls vary friction by risk; they do not slow everything equally."
          ]
        },
        {
          "id": "pb-15-07",
          "domain": "compliance",
          "chapter": "ch81",
          "question": "A BA is writing data requirements for payment records. Why must customer data be kept only as long as needed and protected?",
          "options": [
            "Data protection laws do not apply to banks",
            "Banks should keep all data forever without controls",
            "Privacy and data protection rules require lawful handling, minimisation, security, and retention limits for personal data",
            "Customer consent is never relevant"
          ],
          "answer": 2,
          "explanation": "Regulations such as GDPR require personal data to be processed lawfully, kept secure, minimised, and retained only as long as necessary or legally required. Payment data is sensitive and high-volume. Requirements must cover retention, access, and masking.",
          "why_wrong": [
            "Data protection laws apply strongly to banks.",
            "Indefinite uncontrolled retention breaches minimisation and retention rules.",
            "",
            "Consent and other lawful bases matter for data processing."
          ]
        },
        {
          "id": "pb-15-08",
          "domain": "compliance",
          "chapter": "ch24",
          "question": "A business customer has complex ownership through several companies. What must the bank establish under KYC?",
          "options": [
            "Only the name of the receptionist",
            "The ultimate beneficial owners who own or control the business, plus directors and controllers as required",
            "Nothing, because businesses are low risk",
            "Only the company logo"
          ],
          "answer": 1,
          "explanation": "Beneficial ownership checks identify the real people who own or control a legal entity, preventing anonymous misuse of company structures. This is a core KYC requirement for business customers. Superficial details do not satisfy it.",
          "why_wrong": [
            "Receptionist details do not establish ownership or control.",
            "",
            "Complex structures can be higher risk and need deeper checks.",
            "A logo provides no ownership information."
          ]
        },
        {
          "id": "pb-15-09",
          "domain": "compliance",
          "chapter": "ch24",
          "question": "A fraud team wants to block a payment in real time. What must the BA specify for the customer experience?",
          "options": [
            "No message at all",
            "Automatic account closure with no explanation",
            "A message accusing the customer of fraud",
            "A clear message explaining the payment is held for security checks, with a route to contact the bank"
          ],
          "answer": 3,
          "explanation": "Held payments need clear, neutral messaging and a contact route so genuine customers can resolve the hold quickly. Accusatory or silent handling damages trust and increases complaints. Security and service must be balanced.",
          "why_wrong": [
            "Silence leaves customers confused and likely to resubmit.",
            "Closure without explanation is disproportionate for a single held payment.",
            "Accusations without proven fraud are inappropriate and harmful.",
            ""
          ]
        },
        {
          "id": "pb-15-10",
          "domain": "compliance",
          "chapter": "ch95",
          "question": "A payment is flagged by both fraud and sanctions systems. How should the BA prioritise handling in requirements?",
          "options": [
            "Release it quickly to clear the queue",
            "Hold it, route it to the appropriate compliance and fraud queues with clear ownership, and do not release until cleared",
            "Delete both alerts",
            "Let the customer decide the outcome"
          ],
          "answer": 1,
          "explanation": "Dual-flagged payments carry combined risk and must be held with clear queue ownership and no release until each concern is resolved. Queue pressure never justifies releasing a risky payment. Requirements must define routing and escalation.",
          "why_wrong": [
            "Speed must not override financial crime controls.",
            "",
            "Deleting alerts would destroy the control trail.",
            "Customers cannot clear their own financial crime alerts."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-16",
        "title": "Payments BA Test 16: Clearing, Netting and Settlement Models",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-16-01",
          "domain": "clearing",
          "chapter": "ch17",
          "question": "Two banks exchange many payments in a day. Under bilateral netting, what is settled?",
          "options": [
            "The net difference between what each bank owes the other",
            "Every payment individually in full",
            "Nothing at all",
            "Only the largest payment"
          ],
          "answer": 0,
          "explanation": "Netting offsets mutual obligations so only the net amount moves, reducing liquidity needs and settlement volume. Gross settlement moves every payment in full. A BA must know which model applies to each system.",
          "why_wrong": [
            "",
            "Individual full settlement is the gross model, not netting.",
            "Netting still settles the net amount; it does not settle nothing.",
            "Netting considers all payments, not only the largest."
          ]
        },
        {
          "id": "pb-16-02",
          "domain": "clearing",
          "chapter": "ch18",
          "question": "What is real-time gross settlement (RTGS)?",
          "options": [
            "Settlement of net amounts once a week",
            "Settlement of each payment individually in real time with finality",
            "Settlement by cheque only",
            "Settlement with no finality"
          ],
          "answer": 1,
          "explanation": "RTGS settles each payment gross, in real time, with immediate finality in central bank money. It needs more liquidity than netting but removes settlement risk between participants. Large-value systems commonly use RTGS.",
          "why_wrong": [
            "Weekly net settlement is the opposite of RTGS.",
            "",
            "RTGS is electronic, not cheque-based.",
            "Finality is a defining feature of RTGS."
          ]
        },
        {
          "id": "pb-16-03",
          "domain": "clearing",
          "chapter": "ch17",
          "question": "A multilateral netting system calculates one net position per participant. What is the main benefit?",
          "options": [
            "More payments to settle",
            "No need for accounts",
            "Fewer and smaller settlement movements, reducing liquidity needs",
            "Slower processing by design"
          ],
          "answer": 2,
          "explanation": "Multilateral netting offsets obligations across all participants, so each participant settles one net position instead of many bilateral payments. This sharply reduces liquidity demand. The trade-off is dependence on the netting cycle completing.",
          "why_wrong": [
            "Netting reduces the number of settlements, not increases them.",
            "Accounts are still needed for net settlement.",
            "",
            "Netting is designed for efficiency, not deliberate slowness."
          ]
        },
        {
          "id": "pb-16-04",
          "domain": "clearing",
          "chapter": "ch18",
          "question": "What does settlement finality mean?",
          "options": [
            "The payment can be reversed at any time",
            "The payee has not been paid",
            "The payment is still pending",
            "The settlement is irrevocable and unconditional once completed under the system rules"
          ],
          "answer": 3,
          "explanation": "Finality means a settled payment cannot be unwound, giving certainty to the receiver and supporting downstream use of funds. The exact finality point is defined in system rules. A BA must identify finality points in every flow.",
          "why_wrong": [
            "Finality means irrevocable, not freely reversible.",
            "Final settlement means the receiver has good funds.",
            "Finality describes completed settlement, not a pending state.",
            ""
          ]
        },
        {
          "id": "pb-16-05",
          "domain": "clearing",
          "chapter": "ch20",
          "question": "A bank sends a payment before receiving the offsetting funds from another bank. What risk is it taking?",
          "options": [
            "No risk",
            "Settlement risk: the counterparty may fail to deliver, leaving the bank exposed",
            "Only reputational risk from slow screens",
            "Currency risk only"
          ],
          "answer": 1,
          "explanation": "Settlement risk arises when one leg settles before the other, exposing the bank if the counterparty defaults. Netting, delivery-versus-payment, and RTGS designs manage this risk. A BA must surface settlement risk in design discussions.",
          "why_wrong": [
            "Paying before receiving creates real exposure.",
            "",
            "The risk is financial exposure, not screen speed.",
            "Currency movement is separate; the core risk here is counterparty settlement failure."
          ]
        },
        {
          "id": "pb-16-06",
          "domain": "clearing",
          "chapter": "ch88",
          "question": "A clearing house sits between buyers and sellers in a market. What role does it play?",
          "options": [
            "It only prints statements",
            "It replaces all banks",
            "It lends to all customers",
            "It becomes the central counterparty, guaranteeing settlement and managing risk through margin and default rules"
          ],
          "answer": 3,
          "explanation": "A central counterparty interposes itself between parties, netting obligations and managing default risk. Margin and default funds protect the system. This model differs from bilateral settlement between banks.",
          "why_wrong": [
            "The clearing house manages risk and settlement, not only statements.",
            "Banks remain participants; the clearing house does not replace them.",
            "Lending to all customers is not the clearing house role.",
            ""
          ]
        },
        {
          "id": "pb-16-07",
          "domain": "clearing",
          "chapter": "ch19",
          "question": "Why does RTGS demand more intraday liquidity than deferred net settlement?",
          "options": [
            "It settles nothing",
            "It uses paper only",
            "Each payment needs funds available at the moment of settlement, with no offsetting from later incoming payments",
            "It settles once a year"
          ],
          "answer": 2,
          "explanation": "Gross real-time settlement requires funds for each payment as it arrives, while netting lets incoming and outgoing payments offset before settlement. Liquidity management, queues, and central bank facilities support RTGS. Requirements must cover funding and queue behaviour.",
          "why_wrong": [
            "RTGS settles every payment, which is why liquidity demand is high.",
            "RTGS is electronic.",
            "",
            "RTGS settles continuously during operating hours."
          ]
        },
        {
          "id": "pb-16-08",
          "domain": "clearing",
          "chapter": "ch89",
          "question": "A payment is queued in an RTGS system due to insufficient funds. What should the design provide?",
          "options": [
            "Queue visibility, prioritisation rules, and funding alerts so operations can act",
            "Silent deletion of the payment",
            "Automatic doubling of the payment",
            "No information to operations"
          ],
          "answer": 0,
          "explanation": "Queued payments need operational visibility, priority handling, and alerts so treasury can fund the account or reprioritise. Silent deletion or no information would cause missed settlements. Queue management is a core RTGS operations requirement.",
          "why_wrong": [
            "",
            "Deletion would lose a valid payment.",
            "Doubling would worsen the liquidity shortage.",
            "Operations need queue information to manage funding."
          ]
        },
        {
          "id": "pb-16-09",
          "domain": "clearing",
          "chapter": "ch17",
          "question": "A BA is comparing deferred net settlement with RTGS for a new product. When does deferred net settlement suit best?",
          "options": [
            "For urgent high-value payments needing immediate finality",
            "For high volumes of lower-value payments where liquidity efficiency and batch processing matter more than instant finality",
            "For payments that must never settle",
            "For single payments only"
          ],
          "answer": 1,
          "explanation": "Deferred net settlement suits bulk retail and batch flows where netting saves liquidity and cost. Urgent high-value payments need RTGS finality. Product design must match the settlement model to the use case.",
          "why_wrong": [
            "Urgent high-value payments need RTGS, not deferred netting.",
            "",
            "Deferred net settlement does settle, at the cycle time.",
            "Netting benefits grow with volume; it is not for single payments only."
          ]
        },
        {
          "id": "pb-16-10",
          "domain": "clearing",
          "chapter": "ch18",
          "question": "What happens if a participant in a netting system cannot meet its net settlement obligation?",
          "options": [
            "Nothing; the system ignores it",
            "All other payments are doubled",
            "Default procedures apply, which may include unwinding, guarantees, or loss sharing under system rules",
            "The system closes forever"
          ],
          "answer": 2,
          "explanation": "Netting systems have default rules to handle a participant shortfall, protecting other participants and system stability. Procedures, guarantees, and loss-sharing are defined in advance. A BA must understand that netting carries this dependency risk.",
          "why_wrong": [
            "Shortfalls trigger formal default procedures.",
            "Doubling other payments would worsen the problem.",
            "",
            "Systems are designed to survive a default through defined procedures."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-17",
        "title": "Payments BA Test 17: Reconciliation for a BA",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-17-01",
          "domain": "operations",
          "chapter": "ch40",
          "question": "What is the purpose of payment reconciliation?",
          "options": [
            "To design marketing campaigns",
            "To set payment fees",
            "To delete old records",
            "To confirm that internal records, bank statements, and ledger entries agree, and to surface breaks for investigation"
          ],
          "answer": 3,
          "explanation": "Reconciliation compares records from different sources to prove completeness and accuracy. Differences, or breaks, signal errors, missing settlements, or fraud. It is a core financial control, not a marketing or pricing activity.",
          "why_wrong": [
            "Reconciliation is a financial control, not marketing.",
            "Fees are a pricing matter, not the purpose of reconciliation.",
            "Deleting records would destroy the evidence reconciliation needs.",
            ""
          ]
        },
        {
          "id": "pb-17-02",
          "domain": "operations",
          "chapter": "ch71",
          "question": "A bank statement line has no matching internal payment record. What is this called?",
          "options": [
            "A matched item",
            "An unmatched or unreconciled item requiring investigation",
            "A completed payment",
            "A duplicate with no action needed"
          ],
          "answer": 1,
          "explanation": "Unmatched statement lines indicate funds moved without a corresponding internal record, or a timing or data difference. They must be investigated and aged until resolved. Treating them as complete would hide errors.",
          "why_wrong": [
            "Matched items agree across sources; this one does not.",
            "",
            "Completion requires agreement, which is missing here.",
            "Unmatched items need action; they are not safe to ignore."
          ]
        },
        {
          "id": "pb-17-03",
          "domain": "operations",
          "chapter": "ch40",
          "question": "A reconciliation break is caused by a timing difference: the payment settled after the statement cutoff. What is the correct handling?",
          "options": [
            "Write it off immediately",
            "Carry it as an explained timing item and confirm it matches in the next cycle",
            "Delete the payment record",
            "Ask the customer to pay again"
          ],
          "answer": 1,
          "explanation": "Timing breaks resolve when the next statement arrives, so they are tracked as timing items with an expected match date. Write-off is only for proven losses after investigation. Deletion and duplicate payment would create new breaks.",
          "why_wrong": [
            "Write-off is for proven losses, not timing differences.",
            "",
            "Deletion would prevent the expected match.",
            "A second payment would duplicate the original."
          ]
        },
        {
          "id": "pb-17-04",
          "domain": "operations",
          "chapter": "ch40",
          "question": "Why should reconciliation use unique references such as UETR or end-to-end ID?",
          "options": [
            "References make matching slower",
            "References are only decorative",
            "Unique references let systems match payments reliably across sources without guessing from amounts alone",
            "Amounts alone are always unique"
          ],
          "answer": 2,
          "explanation": "Amounts repeat often, so amount-only matching creates false matches. Unique references link the same payment across instructions, statements, and ledger entries. Requirements must preserve references through every system.",
          "why_wrong": [
            "Good references speed up and improve matching.",
            "References are functional matching keys.",
            "",
            "Many payments share the same amount, so amounts cannot identify payments alone."
          ]
        },
        {
          "id": "pb-17-05",
          "domain": "operations",
          "chapter": "ch71",
          "question": "A payment is recorded in the ledger twice with the same reference. What control should have prevented this?",
          "options": [
            "No control is possible",
            "Manual retyping of every entry",
            "Duplicate detection on the unique reference, blocking the second posting",
            "Deleting the ledger daily"
          ],
          "answer": 2,
          "explanation": "Duplicate checks on unique keys prevent the same payment posting twice, whether from retries, resends, or file duplication. This is a fundamental ledger control. Manual retyping and deletion would worsen accuracy.",
          "why_wrong": [
            "Duplicate detection is a standard and effective control.",
            "Manual retyping introduces errors; it does not prevent duplicates.",
            "",
            "Deleting the ledger would destroy all records."
          ]
        },
        {
          "id": "pb-17-06",
          "domain": "operations",
          "chapter": "ch40",
          "question": "A reconciliation report shows the same break ageing for 30 days with no owner. What is the BA concern?",
          "options": [
            "Ageing breaks without ownership signal weak controls and growing risk of loss or misstatement",
            "No concern; breaks resolve themselves",
            "Breaks should never be reported",
            "Ageing improves accuracy"
          ],
          "answer": 0,
          "explanation": "Breaks need owners, ageing buckets, escalation, and resolution deadlines. Stale breaks may hide errors, fraud, or customer impact. A BA should specify ownership and escalation in reconciliation requirements.",
          "why_wrong": [
            "",
            "Breaks do not resolve without investigation.",
            "Reporting breaks is essential for control.",
            "Ageing increases risk; it does not improve accuracy."
          ]
        },
        {
          "id": "pb-17-07",
          "domain": "operations",
          "chapter": "ch71",
          "question": "What is a suspense account used for in payment operations?",
          "options": [
            "To hide profits",
            "To hold unclear or unmatched items temporarily while they are investigated and correctly allocated",
            "To pay staff bonuses",
            "To store customer passwords"
          ],
          "answer": 1,
          "explanation": "Suspense accounts park items that cannot yet be allocated, keeping the ledger balanced while investigation proceeds. Items must clear promptly with proper authorisation. Suspense is a control tool, not a hiding place.",
          "why_wrong": [
            "Suspense accounts are transparent control accounts, not hiding places.",
            "",
            "Bonuses are paid through payroll, not suspense.",
            "Passwords must never be stored in ledger accounts."
          ]
        },
        {
          "id": "pb-17-08",
          "domain": "operations",
          "chapter": "ch40",
          "question": "A BA is specifying auto-matching rules. What is the risk of matching rules that are too loose?",
          "options": [
            "No risk at all",
            "Slower processing only",
            "False matches that hide real breaks and misstate positions",
            "Better accuracy in all cases"
          ],
          "answer": 2,
          "explanation": "Loose rules match items that only look similar, hiding genuine differences and creating false assurance. Rules need thresholds, tolerances, and manual review for near matches. Tight, evidenced rules protect control quality.",
          "why_wrong": [
            "False matches are a serious control risk.",
            "The risk is wrong matching, not only speed.",
            "",
            "Loose rules reduce accuracy by forcing incorrect matches."
          ]
        },
        {
          "id": "pb-17-09",
          "domain": "operations",
          "chapter": "ch40",
          "question": "A corporate customer reconciles incoming payments using remittance data. What happens when remittance data is missing?",
          "options": [
            "Reconciliation becomes automatic",
            "The amount is increased",
            "The payment is rejected automatically",
            "The customer must investigate manually, delaying cash application and increasing queries"
          ],
          "answer": 3,
          "explanation": "Without remittance references, the payee cannot match receipts to invoices automatically and must chase the payer or investigate manually. This is why remittance quality matters. Missing data does not reject the payment, but it breaks automation.",
          "why_wrong": [
            "Missing data breaks automation; it does not enable it.",
            "Missing data does not change the amount.",
            "Missing remittance data does not normally reject a payment.",
            ""
          ]
        },
        {
          "id": "pb-17-10",
          "domain": "operations",
          "chapter": "ch40",
          "question": "Reconciliation is performed daily. Why is daily frequency better than monthly for payments?",
          "options": [
            "It finds breaks quickly while evidence is fresh and funds can still be recovered or corrected",
            "It creates more work for no benefit",
            "It removes the need for investigation",
            "It guarantees no breaks occur"
          ],
          "answer": 0,
          "explanation": "Daily reconciliation shortens the time between an error and its detection, improving recovery chances and reducing customer impact. Monthly cycles let breaks age and compound. Frequency is a key control design choice.",
          "why_wrong": [
            "",
            "Early detection is a major benefit that outweighs the effort.",
            "Investigation is still needed; frequency only speeds detection.",
            "Reconciliation detects breaks; it does not prevent them all."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-18",
        "title": "Payments BA Test 18: Exceptions and Investigations Basics",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-18-01",
          "domain": "operations",
          "chapter": "ch41",
          "question": "A payment fails validation and lands in an exception queue. What is the first thing operations needs?",
          "options": [
            "No information at all",
            "The payment details, the failure reason, and the actions available: fix, retry, reject, or escalate",
            "Only the customer name",
            "A new payment instruction"
          ],
          "answer": 1,
          "explanation": "Exception handling needs the full payment context, a clear reason code, and defined actions with permissions. Without this, operators guess and errors multiply. Queue design is a core BA deliverable for payment operations.",
          "why_wrong": [
            "Operators cannot resolve exceptions without information.",
            "",
            "Name alone does not explain the failure or the fix.",
            "A new instruction is not needed; the existing one must be resolved."
          ]
        },
        {
          "id": "pb-18-02",
          "domain": "operations",
          "chapter": "ch73",
          "question": "A customer says a payment has not arrived. What is the correct first investigation step?",
          "options": [
            "Tell the customer to send it again immediately",
            "Refund without checking",
            "Trace the payment by reference, status, and tracking data to establish where it is in the chain",
            "Ignore the query for a week"
          ],
          "answer": 2,
          "explanation": "Tracing by UETR, references, and status establishes whether the payment is queued, settled, rejected, or lost. This evidence guides the next step. Immediate resending risks duplication, and blind refunds risk loss.",
          "why_wrong": [
            "Resending before tracing risks duplicate payment.",
            "Refunds need evidence that funds were not delivered.",
            "",
            "Ignoring queries damages trust and delays resolution."
          ]
        },
        {
          "id": "pb-18-03",
          "domain": "operations",
          "chapter": "ch41",
          "question": "What is a payment investigation case used for?",
          "options": [
            "To design new products",
            "To delete payment records",
            "To track a query about a payment, such as non-receipt or wrong amount, through to resolution with evidence and audit",
            "To set exchange rates"
          ],
          "answer": 2,
          "explanation": "Cases group the query, evidence, correspondence, and actions for one payment issue so it can be tracked, aged, and resolved. Case management prevents queries being lost in inboxes. A BA must specify case fields, SLAs, and escalation.",
          "why_wrong": [
            "Product design is separate from investigation tracking.",
            "Cases preserve records; they do not delete them.",
            "",
            "Exchange rates are set by markets and treasury, not cases."
          ]
        },
        {
          "id": "pb-18-04",
          "domain": "operations",
          "chapter": "ch41",
          "question": "A payment is sent to the wrong account due to a customer typing error. What is the realistic recovery path?",
          "options": [
            "The bank contacts the receiving bank to request return of funds, but recovery depends on the recipient and account status",
            "The bank can always reverse it instantly with no consent",
            "The funds are automatically returned by the scheme",
            "Nothing can ever be done"
          ],
          "answer": 0,
          "explanation": "Misdirected payments need interbank cooperation: the sending bank requests return, and the receiving bank contacts its customer. Recovery is not guaranteed, especially if funds were withdrawn. Prevention through confirmation checks matters more than cure.",
          "why_wrong": [
            "",
            "Banks cannot simply take funds back without process and, often, recipient consent.",
            "Schemes do not automatically reverse misdirected payments.",
            "Recovery is often possible through the interbank process, though not guaranteed."
          ]
        },
        {
          "id": "pb-18-05",
          "domain": "operations",
          "chapter": "ch16",
          "question": "A cross-border payment is delayed because an intermediary bank needs more information. What should the sending bank do?",
          "options": [
            "Do nothing and hope it clears",
            "Send a duplicate payment",
            "Respond promptly to the information request with the needed details, keeping the customer informed",
            "Cancel the payment without telling the customer"
          ],
          "answer": 2,
          "explanation": "Information requests from intermediaries pause processing until answered, so prompt response restores the flow. Customer updates manage expectations. Duplicates and silent cancellation worsen the situation.",
          "why_wrong": [
            "Silence leaves the payment stuck indefinitely.",
            "A duplicate would create a second payment while the first is still live.",
            "",
            "Cancellation without notice harms the customer and may breach duties."
          ]
        },
        {
          "id": "pb-18-06",
          "domain": "operations",
          "chapter": "ch73",
          "question": "Why do investigation cases need service level agreements (SLAs)?",
          "options": [
            "To make reports longer",
            "To delay resolution",
            "To avoid all customer contact",
            "To set expected response and resolution times, prioritise urgent cases, and escalate ageing cases"
          ],
          "answer": 3,
          "explanation": "SLAs give customers predictable timelines, help teams prioritise, and trigger escalation when cases age. Without SLAs, urgent cases wait behind routine ones. A BA should define SLAs by case type and severity.",
          "why_wrong": [
            "SLAs drive action; report length is irrelevant.",
            "SLAs speed resolution; they do not delay it.",
            "SLAs support customer communication, not avoidance.",
            ""
          ]
        },
        {
          "id": "pb-18-07",
          "domain": "operations",
          "chapter": "ch41",
          "question": "An exception queue shows 200 items with the same error code after a release. What does this pattern suggest?",
          "options": [
            "A systemic issue, such as a mapping or validation defect introduced by the release",
            "200 unrelated customer errors",
            "Normal daily volume with no cause",
            "Fraud by 200 customers"
          ],
          "answer": 0,
          "explanation": "A sudden spike in one error code after a change points to a systemic defect, not individual customer mistakes. Operations should escalate to technology and hold further releases. Pattern analysis is a key exception-management skill.",
          "why_wrong": [
            "",
            "Identical errors at scale after a release are rarely coincidental.",
            "A spike after a release is a signal, not normal volume.",
            "Mass fraud by 200 customers is far less likely than a system defect."
          ]
        },
        {
          "id": "pb-18-08",
          "domain": "operations",
          "chapter": "ch41",
          "question": "A payment exception requires a manual repair to a field. What control must apply?",
          "options": [
            "Anyone can change any field with no record",
            "Authorised repair with maker-checker control, reason, and full audit trail",
            "Repair by deleting the payment",
            "Repair without telling anyone"
          ],
          "answer": 1,
          "explanation": "Manual repairs change payment data, so they need authorisation, independent checking, a documented reason, and an audit trail. Uncontrolled edits risk fraud and errors. Maker-checker is a standard control for payment repairs.",
          "why_wrong": [
            "Uncontrolled edits are a fraud and error risk.",
            "",
            "Deletion destroys the payment and its history.",
            "Silent repairs cannot be audited or reviewed."
          ]
        },
        {
          "id": "pb-18-09",
          "domain": "operations",
          "chapter": "ch73",
          "question": "A customer query about a missing payment is resolved. What should the closure record include?",
          "options": [
            "Nothing",
            "A guess about what happened",
            "Only the date",
            "The outcome, the evidence, what was communicated to the customer, and who closed the case"
          ],
          "answer": 3,
          "explanation": "Closure records prove the issue was resolved, support audits, and help if the query reopens. Evidence and communication history matter. A bare date or guess provides no assurance.",
          "why_wrong": [
            "Empty closure records cannot evidence resolution.",
            "Guesses are not evidence and must not close cases.",
            "Date alone does not record outcome or evidence.",
            ""
          ]
        },
        {
          "id": "pb-18-10",
          "domain": "operations",
          "chapter": "ch41",
          "question": "A BA is designing exception dashboards. Which metric matters most for operations managers?",
          "options": [
            "The number of colours on the screen",
            "Queue volumes by error type, age, and SLA breach, so systemic issues and risks are visible",
            "The number of staff birthdays",
            "The office temperature"
          ],
          "answer": 1,
          "explanation": "Dashboards must show what is stuck, why, how old it is, and what is breaching SLA, so managers can act. Vanity metrics do not help. A BA should design dashboards around operational decisions.",
          "why_wrong": [
            "Screen colours do not drive operational decisions.",
            "",
            "Birthdays are irrelevant to exception management.",
            "Temperature does not affect payment queues."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-19",
        "title": "Payments BA Test 19: Error Codes, Rejects and Returns",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-19-01",
          "domain": "messaging",
          "chapter": "ch58",
          "question": "What is the difference between a reject and a return in ISO 20022 payments?",
          "options": [
            "There is no difference",
            "A reject refuses the instruction before acceptance; a return sends funds back after the payment was accepted",
            "A return happens before the payment is sent",
            "A reject always moves funds"
          ],
          "answer": 1,
          "explanation": "Rejection happens when the receiving bank or scheme refuses the instruction, so no settlement occurs. A return happens after acceptance and settlement, moving funds back with a return reason. The distinction drives handling, timing, and messaging.",
          "why_wrong": [
            "Reject and return are distinct stages with different fund movements.",
            "",
            "Returns follow acceptance; they cannot precede the payment.",
            "Rejection refuses the instruction; it does not move funds."
          ]
        },
        {
          "id": "pb-19-02",
          "domain": "operations",
          "chapter": "ch58",
          "question": "A payment is rejected with reason code for invalid creditor account. What should the originator do?",
          "options": [
            "Resend the identical payment repeatedly",
            "Change the amount and resend without checking",
            "Ignore the rejection",
            "Correct the account details with the payee and resubmit as a new instruction"
          ],
          "answer": 3,
          "explanation": "Invalid account rejections need corrected data from the payee before resubmission. Repeating the same error wastes cycles and can look suspicious. Requirements must route reason codes to clear originator actions.",
          "why_wrong": [
            "Repeating the same invalid instruction will reject again.",
            "Changing the amount does not fix an invalid account.",
            "Ignoring a rejection leaves the payee unpaid.",
            ""
          ]
        },
        {
          "id": "pb-19-03",
          "domain": "messaging",
          "chapter": "ch58",
          "question": "A pacs.002 reports status RJCT. What does this mean?",
          "options": [
            "The payment was accepted",
            "The payment instruction was rejected",
            "The payment is pending forever",
            "The payment was returned after settlement"
          ],
          "answer": 1,
          "explanation": "RJCT is the ISO 20022 status for rejection of an instruction. ACCP indicates acceptance. Status codes must be mapped to customer and operations messages so each outcome is handled correctly.",
          "why_wrong": [
            "Acceptance uses ACCP, not RJCT.",
            "",
            "RJCT is a final rejection outcome, not a pending state.",
            "Returns use pacs.004, not a pacs.002 RJCT status."
          ]
        },
        {
          "id": "pb-19-04",
          "domain": "operations",
          "chapter": "ch16",
          "question": "A payment is returned because the beneficiary account is closed. Who must be informed promptly?",
          "options": [
            "Nobody",
            "Only the scheme",
            "The originator, so they can contact the payee and arrange correct details or an alternative",
            "Only the receiving bank"
          ],
          "answer": 2,
          "explanation": "Returns mean the payee was not paid, so the originator needs prompt notice with the reason to take corrective action. Delayed notice causes missed obligations and duplicate attempts. Return notification is a core requirement.",
          "why_wrong": [
            "Silence leaves the originator believing the payee was paid.",
            "The scheme does not need originator notification; the originator does.",
            "",
            "The receiving bank already knows; the originator needs the news."
          ]
        },
        {
          "id": "pb-19-05",
          "domain": "messaging",
          "chapter": "ch58",
          "question": "Why must error and reason codes be standardised rather than free text only?",
          "options": [
            "Standard codes let systems route, report, and automate handling consistently across banks",
            "Free text is always better",
            "Codes make messages unreadable for no benefit",
            "Free text is required by all schemes"
          ],
          "answer": 0,
          "explanation": "Standard reason codes enable automated routing, consistent customer messages, reporting, and straight-through handling. Free text varies and cannot be processed reliably. Requirements should map every code to an action.",
          "why_wrong": [
            "",
            "Free text alone cannot drive reliable automation.",
            "Codes improve machine processing; human-readable text accompanies them.",
            "Schemes standardise codes precisely to avoid free-text variation."
          ]
        },
        {
          "id": "pb-19-06",
          "domain": "operations",
          "chapter": "ch58",
          "question": "A return arrives for a payment that was already reconciled as settled. What must operations do?",
          "options": [
            "Process the return, reverse the ledger entries as required, and notify the originator",
            "Ignore the return",
            "Delete the original payment record",
            "Keep the funds and the return"
          ],
          "answer": 0,
          "explanation": "Returns after settlement need ledger reversal, reconciliation updates, and originator notification. Ignoring them misstates positions. Deleting records destroys audit. Return handling must be a defined end-to-end flow.",
          "why_wrong": [
            "",
            "Ignoring a return misstates the ledger and customer position.",
            "Records must be preserved with reversal entries, not deleted.",
            "Keeping both would double-count funds."
          ]
        },
        {
          "id": "pb-19-07",
          "domain": "messaging",
          "chapter": "ch58",
          "question": "A BA sees reason code AC04 in a return. What does it generally indicate?",
          "options": [
            "Insufficient funds",
            "Duplicate payment",
            "Invalid currency",
            "Closed account"
          ],
          "answer": 3,
          "explanation": "AC04 is the ISO 20022 reason code for a closed account number. Other codes cover insufficient funds, invalid accounts, and duplicates. A BA should know common codes and where to find the full code list for each scheme.",
          "why_wrong": [
            "Insufficient funds uses a different reason code.",
            "Duplicates use a different reason code.",
            "Currency issues use different codes.",
            ""
          ]
        },
        {
          "id": "pb-19-08",
          "domain": "operations",
          "chapter": "ch16",
          "question": "A payment is rejected for a missing mandatory field. Where should this have been caught?",
          "options": [
            "Only at the final bank",
            "At the earliest validation point, ideally at initiation, so the originator can fix it immediately",
            "Never; missing fields do not matter",
            "Only after settlement"
          ],
          "answer": 1,
          "explanation": "Early validation at initiation or at the sending bank prevents invalid instructions entering the chain. Late detection wastes processing and delays correction. Requirements should push validation as early as possible.",
          "why_wrong": [
            "Waiting until the final bank wastes the whole chain's effort.",
            "",
            "Missing mandatory fields block processing and must be caught.",
            "Post-settlement detection is too late and costly."
          ]
        },
        {
          "id": "pb-19-09",
          "domain": "operations",
          "chapter": "ch58",
          "question": "A customer receives a return with no reason given. What is the BA issue?",
          "options": [
            "No issue; reasons are optional extras",
            "Reasons should never be shared",
            "Missing reasons prevent the customer acting correctly and generate queries; reason codes and plain-language explanations are required",
            "Customers prefer no information"
          ],
          "answer": 2,
          "explanation": "Reason codes plus plain-language explanations tell the originator what went wrong and what to do next. Missing reasons cause calls, wrong resubmissions, and complaints. Return messaging requirements must include reasons.",
          "why_wrong": [
            "Reasons are essential for corrective action.",
            "Reasons should be shared in appropriate plain language.",
            "",
            "Customers need reasons to act; silence frustrates them."
          ]
        },
        {
          "id": "pb-19-10",
          "domain": "operations",
          "chapter": "ch58",
          "question": "A duplicate payment is detected after settlement. What is the correct recovery route?",
          "options": [
            "Send another duplicate to balance it",
            "Ignore it and hope the payee returns it",
            "Raise a return or recall request through the interbank process and notify the originator, following scheme rules",
            "Debit the payee without any process"
          ],
          "answer": 2,
          "explanation": "Duplicate settlements need formal return or recall handling with scheme rules, evidence, and customer communication. Informal debits breach rules and trust. Requirements must define duplicate detection and recovery flows.",
          "why_wrong": [
            "Another duplicate worsens the overpayment.",
            "Hoping for voluntary return is not a control.",
            "",
            "Unauthorised debits breach rules and customer rights."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-20",
        "title": "Payments BA Test 20: Field Mapping MT to MX Basics",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-20-01",
          "domain": "messaging",
          "chapter": "ch8",
          "question": "What does MT to MX migration mean?",
          "options": [
            "Moving from paper to cash",
            "Moving banks to a new building",
            "Moving from cards to cheques",
            "Moving from SWIFT MT messages to ISO 20022 (MX) messages"
          ],
          "answer": 3,
          "explanation": "MT refers to SWIFT's legacy message types and MX refers to ISO 20022 XML messages. Migration moves cross-border and high-value flows to richer structured MX formats. Mapping documents translate fields between the two worlds.",
          "why_wrong": [
            "MT to MX is a messaging migration, not a cash move.",
            "It is a data and message change, not a premises move.",
            "It concerns interbank messaging, not cards or cheques.",
            ""
          ]
        },
        {
          "id": "pb-20-02",
          "domain": "messaging",
          "chapter": "ch38",
          "question": "An MT103 field 59 (beneficiary customer) maps to which pacs.008 concept?",
          "options": [
            "Creditor and creditor account elements",
            "Debtor agent",
            "Charge bearer",
            "Settlement date only"
          ],
          "answer": 0,
          "explanation": "Field 59 identifies the beneficiary, which in pacs.008 becomes the creditor party and creditor account elements with structured name and account data. Debtor agent is the payer bank. Mapping must preserve party identity accurately.",
          "why_wrong": [
            "",
            "Debtor agent is the payer's bank, not the beneficiary.",
            "Charge bearer is a separate charges element.",
            "Settlement date is a separate element; field 59 is party data."
          ]
        },
        {
          "id": "pb-20-03",
          "domain": "messaging",
          "chapter": "ch38",
          "question": "MT field 32A carries value date, currency, and amount. What must mapping preserve?",
          "options": [
            "Only the currency",
            "Only the date",
            "Only the amount rounded up",
            "All three: the value date, the currency code, and the exact amount"
          ],
          "answer": 3,
          "explanation": "Value date, currency, and amount together define the value to be settled. Dropping or altering any of them changes the payment. Mapping specifications must show each subfield mapped with format and validation rules.",
          "why_wrong": [
            "Currency alone does not define the payment value.",
            "Date alone does not define value.",
            "Rounding up changes the amount and breaks reconciliation.",
            ""
          ]
        },
        {
          "id": "pb-20-04",
          "domain": "messaging",
          "chapter": "ch8",
          "question": "An MT message carries an unstructured address in two free-text lines. How should it map to structured MX address elements?",
          "options": [
            "Copy both lines into the town field",
            "Parse and allocate components to the correct structured elements where possible, with rules for unparseable data and manual review",
            "Delete the address",
            "Put the whole address in the amount field"
          ],
          "answer": 1,
          "explanation": "Free-text addresses need parsing rules, fallbacks, and review handling to populate structured elements without losing or misplacing data. Blind copying corrupts screening and routing. Mapping specs must define parsing and exception rules.",
          "why_wrong": [
            "Putting all lines in one field corrupts structured data.",
            "",
            "Deleting addresses breaks screening and identification.",
            "Amounts and addresses are different elements and must never mix."
          ]
        },
        {
          "id": "pb-20-05",
          "domain": "messaging",
          "chapter": "ch38",
          "question": "A mapping document shows a source field with no target field. What must the BA do?",
          "options": [
            "Ignore it silently",
            "Record it as an unmapped field, agree with stakeholders whether data is dropped, carried elsewhere, or needs a target extension, and document the decision",
            "Delete the source system",
            "Invent a target field with no agreement"
          ],
          "answer": 1,
          "explanation": "Unmapped fields represent potential data loss, so each needs an explicit decision: drop with approval, carry in another element, or extend the target. Silent dropping hides loss. Mapping governance requires documented decisions.",
          "why_wrong": [
            "Silent ignoring hides data loss.",
            "",
            "Deleting the source system is not a mapping decision.",
            "Inventing fields without agreement breaks standards and counterparties."
          ]
        },
        {
          "id": "pb-20-06",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "Why must mapping rules cover character sets and field lengths?",
          "options": [
            "They do not matter",
            "Because longer fields are always better",
            "Because truncation or unsupported characters can corrupt names, references, and remittance data and cause rejections",
            "Because schemes never validate lengths"
          ],
          "answer": 2,
          "explanation": "Target fields have length and character rules; overlong or unsupported data truncates or rejects. Mapping must define trimming, transliteration, and rejection rules. Data quality failures here cause straight-through processing breaks.",
          "why_wrong": [
            "Lengths and character sets directly affect acceptance.",
            "Longer fields do not help if they exceed target limits.",
            "",
            "Schemes do validate lengths and character sets."
          ]
        },
        {
          "id": "pb-20-07",
          "domain": "messaging",
          "chapter": "ch8",
          "question": "During migration, a bank must support both MT and MX for a period. What is this called?",
          "options": [
            "Coexistence, where both formats are handled with translation between them",
            "Big bang only",
            "Shutdown",
            "Duplication by design"
          ],
          "answer": 0,
          "explanation": "Coexistence allows MT and MX to operate side by side while participants migrate at different speeds, using translation services. It reduces cutover risk. Requirements must cover translation rules, fallbacks, and end dates.",
          "why_wrong": [
            "",
            "Big bang means a single cutover, not parallel running.",
            "Shutdown is not a migration approach.",
            "Coexistence is controlled translation, not duplication."
          ]
        },
        {
          "id": "pb-20-08",
          "domain": "messaging",
          "chapter": "ch38",
          "question": "A mapping test shows the remittance reference is lost in translation. What is the impact?",
          "options": [
            "No impact",
            "The payee cannot reconcile automatically, causing queries and manual work",
            "The payment amount doubles",
            "The payment settles faster"
          ],
          "answer": 1,
          "explanation": "Remittance references link payments to invoices, so losing them breaks payee reconciliation and generates queries. Mapping tests must verify every business-critical field survives translation. Reference loss is a defect, not a minor issue.",
          "why_wrong": [
            "Reference loss directly harms reconciliation.",
            "",
            "Reference loss does not change the amount.",
            "Reference loss does not speed settlement."
          ]
        },
        {
          "id": "pb-20-09",
          "domain": "messaging",
          "chapter": "ch38",
          "question": "What is a data dictionary in mapping work?",
          "options": [
            "A list of staff names",
            "A novel about payments",
            "A defined catalogue of fields, meanings, formats, and allowed values used consistently across systems",
            "A list of office locations"
          ],
          "answer": 2,
          "explanation": "A data dictionary defines each field's meaning, format, length, and allowed values so mapping, development, and testing share one understanding. Without it, teams interpret fields differently. It is a core BA artefact.",
          "why_wrong": [
            "Staff lists are not data dictionaries.",
            "A dictionary is a technical catalogue, not a novel.",
            "",
            "Office locations are unrelated to field definitions."
          ]
        },
        {
          "id": "pb-20-10",
          "domain": "messaging",
          "chapter": "ch8",
          "question": "A BA is asked whether MT to MX mapping is only a technical task. What is the correct view?",
          "options": [
            "Yes, business input is never needed",
            "Yes, developers can guess business rules",
            "No, business rules for charges, parties, remittance, and exceptions must be agreed alongside technical mapping",
            "No, technical input is never needed"
          ],
          "answer": 2,
          "explanation": "Mapping decisions affect charges, party identification, compliance screening, and customer outcomes, so business and compliance input is essential. Purely technical mapping risks wrong business behaviour. Joint business and technical ownership is required.",
          "why_wrong": [
            "Business rules drive mapping choices; business input is essential.",
            "Guessing business rules causes wrong charges and handling.",
            "",
            "Technical input is also essential; both sides are needed."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-21",
        "title": "Payments BA Test 21: Requirements for a Payments Migration",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-21-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A bank is migrating payment flows to ISO 20022. What is the first requirements activity the BA should perform?",
          "options": [
            "Start coding immediately",
            "Discover the current flows, message types, volumes, counterparties, and pain points with stakeholders",
            "Buy new hardware",
            "Write test cases with no requirements"
          ],
          "answer": 1,
          "explanation": "Discovery establishes the as-is landscape: flows, messages, volumes, dependencies, and constraints. Without it, requirements miss scope and risks. Coding and testing follow discovery and analysis, not precede them.",
          "why_wrong": [
            "Coding without requirements builds the wrong solution.",
            "",
            "Hardware decisions follow design, not discovery.",
            "Test cases need requirements to test against."
          ]
        },
        {
          "id": "pb-21-02",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A stakeholder says the migration must support 'all payments'. What should the BA do?",
          "options": [
            "Accept the statement as complete scope",
            "Decompose 'all payments' into specific payment types, rails, currencies, channels, and volumes, and agree scope explicitly",
            "Assume it means one payment type",
            "Exclude cross-border payments silently"
          ],
          "answer": 1,
          "explanation": "Vague scope causes missed flows and late surprises. A BA must break scope into concrete payment types, rails, currencies, and channels with volumes and priorities. Explicit scope agreement protects the programme.",
          "why_wrong": [
            "Vague scope is not a requirement; it must be decomposed.",
            "",
            "Assuming one type would miss most of the scope.",
            "Silent exclusions create gaps discovered too late."
          ]
        },
        {
          "id": "pb-21-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A requirement states the system must be 'fast'. Why is this requirement inadequate?",
          "options": [
            "It is perfectly adequate",
            "Fast systems need no requirements",
            "Speed does not matter in payments",
            "It is untestable: it needs measurable targets for throughput, latency, and peak volumes"
          ],
          "answer": 3,
          "explanation": "Good requirements are measurable and testable. 'Fast' needs numbers: transactions per second, response times, and peak handling. Without measures, acceptance cannot be judged and performance issues surface in production.",
          "why_wrong": [
            "Unmeasurable requirements cannot be tested or accepted.",
            "Performance needs explicit requirements and testing.",
            "Speed and throughput matter greatly in payment processing.",
            ""
          ]
        },
        {
          "id": "pb-21-04",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A migration requirement affects sanctions screening. Who must review it?",
          "options": [
            "Only the developers",
            "Only marketing",
            "Compliance and financial crime teams, alongside operations and technology",
            "Nobody; screening is automatic"
          ],
          "answer": 2,
          "explanation": "Screening changes affect legal obligations, so compliance must review scope, data, and handling. Operations and technology confirm feasibility. Marketing review alone would miss the regulatory impact.",
          "why_wrong": [
            "Developers alone cannot approve compliance impact.",
            "Marketing cannot approve financial crime controls.",
            "",
            "Screening needs human governance; it is not automatic approval."
          ]
        },
        {
          "id": "pb-21-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA finds two stakeholders want conflicting cutoff behaviours. What is the right approach?",
          "options": [
            "Pick one silently",
            "Implement both at the same time",
            "Surface the conflict, gather evidence on scheme rules and customer impact, and facilitate a documented decision",
            "Ignore both stakeholders"
          ],
          "answer": 2,
          "explanation": "Conflicts need facilitated resolution with evidence and a recorded decision. Silent choices and dual implementations create inconsistency. A BA's role is to make trade-offs explicit and get agreement.",
          "why_wrong": [
            "Silent choices hide the conflict and lose buy-in.",
            "Conflicting behaviours cannot both be implemented.",
            "",
            "Ignoring stakeholders guarantees rework and resistance."
          ]
        },
        {
          "id": "pb-21-06",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What is traceability in requirements work?",
          "options": [
            "Tracking staff locations",
            "Counting words in documents",
            "Tracking parcel deliveries",
            "Linking each requirement to its business need, design, build, and test, so coverage and impact can be checked"
          ],
          "answer": 3,
          "explanation": "Traceability connects business needs to requirements, design, and tests, proving coverage and showing change impact. It is essential for regulated payment programmes. Without it, gaps and untested requirements hide.",
          "why_wrong": [
            "Traceability concerns requirements, not staff locations.",
            "Word counts do not prove coverage.",
            "Parcel tracking is unrelated.",
            ""
          ]
        },
        {
          "id": "pb-21-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A migration must handle in-flight payments at cutover. What requirement is essential?",
          "options": [
            "Rules for draining, migrating, or completing in-flight payments with no loss, duplication, or mis-valuation",
            "No requirement; in-flight payments can be abandoned",
            "A requirement to delete them",
            "A requirement to double them"
          ],
          "answer": 0,
          "explanation": "Payments in progress at cutover must complete safely under defined rules: drain the old system, migrate state, or finish in the new system with reconciliation. Abandonment or duplication would lose customer funds. Cutover requirements must cover every in-flight state.",
          "why_wrong": [
            "",
            "Abandoning payments would lose funds and trust.",
            "Deletion destroys payment records.",
            "Doubling creates duplicate payments."
          ]
        },
        {
          "id": "pb-21-08",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is writing acceptance criteria for a payment validation rule. What makes the criteria good?",
          "options": [
            "Vague wording with no examples",
            "Criteria written after go-live",
            "No criteria at all",
            "Specific conditions, example inputs, expected outcomes, and error handling for pass and fail cases"
          ],
          "answer": 3,
          "explanation": "Good acceptance criteria state given-when-then conditions with concrete examples for valid, invalid, and edge cases. They let developers build correctly and testers verify. Vague criteria cannot be accepted objectively.",
          "why_wrong": [
            "Vague wording cannot be tested.",
            "Criteria must exist before build and test, not after go-live.",
            "Missing criteria leave acceptance to opinion.",
            ""
          ]
        },
        {
          "id": "pb-21-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A change request arrives mid-migration to add a new currency. What should the BA do first?",
          "options": [
            "Assess impact on scope, design, testing, timelines, and risk, then seek governed approval",
            "Implement it immediately with no assessment",
            "Reject it without reading it",
            "Hide it from the programme board"
          ],
          "answer": 0,
          "explanation": "Change control requires impact assessment and approval so scope, cost, and risk stay managed. Immediate implementation without assessment causes overruns and defects. Rejection without reading misses genuine needs.",
          "why_wrong": [
            "",
            "Unassessed implementation creates scope creep and risk.",
            "Rejection without assessment may block a genuine need.",
            "Hiding changes breaks governance."
          ]
        },
        {
          "id": "pb-21-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Why should non-functional requirements cover resilience for a payment hub migration?",
          "options": [
            "Resilience does not matter",
            "Resilience only matters for websites",
            "Payment systems must survive failures without losing or duplicating payments, so recovery, availability, and failover targets are essential",
            "Failures never happen"
          ],
          "answer": 2,
          "explanation": "Payment hubs are critical infrastructure; outages must not lose payments or corrupt state. Requirements must set availability, recovery time, recovery point, and failover behaviour. Assuming no failures is unrealistic and dangerous.",
          "why_wrong": [
            "Resilience is critical for payment systems.",
            "Resilience matters for all critical payment systems, not only websites.",
            "",
            "Failures do happen and must be planned for."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-22",
        "title": "Payments BA Test 22: Mapping Documents and Data Analysis",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-22-01",
          "domain": "professional",
          "chapter": "ch38",
          "question": "A mapping document maps source field A to target field B. What else must it specify to be usable by developers?",
          "options": [
            "Nothing else",
            "Transformation rules, format, mandatory status, default values, validation, and handling of missing or invalid data",
            "Only the font size",
            "Only the author name"
          ],
          "answer": 1,
          "explanation": "Developers need transformation logic, formats, optionality, defaults, and error handling to implement mapping correctly. Field names alone leave too much to guesswork. Complete mapping specs reduce defects and rework.",
          "why_wrong": [
            "Field names alone do not define transformation or validation.",
            "",
            "Font size is irrelevant to implementation.",
            "Author name does not help implementation."
          ]
        },
        {
          "id": "pb-22-02",
          "domain": "messaging",
          "chapter": "ch38",
          "question": "A source system stores amounts as text with commas, such as '1,234.56'. What must mapping specify?",
          "options": [
            "Copy the text unchanged",
            "Parse the text to a numeric decimal amount in the target format, with rules for invalid formats",
            "Delete the commas and the decimal point",
            "Round to the nearest thousand"
          ],
          "answer": 1,
          "explanation": "Amount formats must be converted precisely to the target numeric type without losing value. Parsing rules must handle separators, decimals, and invalid inputs. Copying text or rounding corrupts amounts.",
          "why_wrong": [
            "Text with commas will fail numeric validation in the target.",
            "",
            "Deleting separators and decimals corrupts the amount.",
            "Rounding changes the payment value."
          ]
        },
        {
          "id": "pb-22-03",
          "domain": "professional",
          "chapter": "ch38",
          "question": "Data analysis shows 5 percent of source records have missing payee names. What should the BA do?",
          "options": [
            "Quantify the impact, agree handling rules (reject, repair, or default) with stakeholders, and track remediation",
            "Ignore the gap",
            "Invent names for the missing records",
            "Delete the analysis"
          ],
          "answer": 0,
          "explanation": "Data quality gaps need quantified impact and agreed handling: reject, queue for repair, or enrich from a trusted source. Inventing names is fraud-prone and wrong. Tracking remediation prevents recurrence.",
          "why_wrong": [
            "",
            "Ignoring a 5 percent gap guarantees exceptions at scale.",
            "Inventing payee names risks misdirected payments.",
            "Deleting analysis hides the problem."
          ]
        },
        {
          "id": "pb-22-04",
          "domain": "professional",
          "chapter": "ch38",
          "question": "A mapping uses a code list translation, such as country codes. What must the BA verify?",
          "options": [
            "That codes are never used",
            "That code lists never change",
            "That codes can be guessed",
            "That every source code has a defined target code, including handling for unknown or new codes"
          ],
          "answer": 3,
          "explanation": "Code translations need complete coverage plus fallback handling for unknown codes, or payments will reject or misroute. Code lists do change and need version control. Guessing codes causes errors.",
          "why_wrong": [
            "Codes are central to payment processing.",
            "Code lists change and need governance.",
            "Guessing codes causes misrouting and rejections.",
            ""
          ]
        },
        {
          "id": "pb-22-05",
          "domain": "professional",
          "chapter": "ch38",
          "question": "A target field is mandatory but the source field is optional. What mapping decision is needed?",
          "options": [
            "Leave it blank and hope",
            "Make the target optional without agreement",
            "Delete the target field",
            "Agree a rule: derive it, default it with approval, enrich it, or reject records lacking it"
          ],
          "answer": 3,
          "explanation": "Mandatory target fields need a defined source: derivation, approved default, enrichment, or rejection. Leaving blanks causes validation failures. The decision needs business approval because it affects data quality.",
          "why_wrong": [
            "Blank mandatory fields will fail validation.",
            "Changing optionality needs scheme and stakeholder agreement.",
            "Deleting a mandatory target breaks the standard.",
            ""
          ]
        },
        {
          "id": "pb-22-06",
          "domain": "professional",
          "chapter": "ch38",
          "question": "A BA is profiling payment data before migration. What does profiling reveal?",
          "options": [
            "Data patterns, value distributions, quality issues, and edge cases in the actual data",
            "Staff opinions only",
            "Future stock prices",
            "Office layouts"
          ],
          "answer": 0,
          "explanation": "Data profiling examines real values to find formats, ranges, duplicates, missing data, and outliers. It grounds mapping and validation in evidence rather than assumptions. Profiling prevents surprises at cutover.",
          "why_wrong": [
            "",
            "Profiling examines data, not opinions.",
            "Profiling does not predict markets.",
            "Profiling concerns data, not premises."
          ]
        },
        {
          "id": "pb-22-07",
          "domain": "messaging",
          "chapter": "ch67",
          "question": "A mapping must handle both structured and unstructured remittance data. What should the spec define?",
          "options": [
            "Only one format matters",
            "Truncate everything to one character",
            "Delete all remittance data",
            "Rules for preserving structured references, handling unstructured text, and combining or prioritising them in the target"
          ],
          "answer": 3,
          "explanation": "Remittance data comes in structured and unstructured forms, and the target must preserve what payees need for reconciliation. Rules must cover both forms, length limits, and priority. Deletion or severe truncation breaks reconciliation.",
          "why_wrong": [
            "Both formats occur in practice and need handling.",
            "One-character truncation destroys references.",
            "Deleting remittance data breaks reconciliation.",
            ""
          ]
        },
        {
          "id": "pb-22-08",
          "domain": "professional",
          "chapter": "ch38",
          "question": "Two source systems store dates in different formats. What must mapping specify?",
          "options": [
            "Keep both formats mixed in the target",
            "Ignore dates entirely",
            "A single target date format with conversion rules, time-zone handling, and invalid-date handling",
            "Guess the dates"
          ],
          "answer": 2,
          "explanation": "Date formats and time zones must be normalised to one target standard with explicit conversion and validation. Mixed formats cause parsing failures and wrong value dates. Guessing dates corrupts settlement timing.",
          "why_wrong": [
            "Mixed formats will fail target validation.",
            "Dates drive value and settlement; they cannot be ignored.",
            "",
            "Guessing dates causes wrong value dates."
          ]
        },
        {
          "id": "pb-22-09",
          "domain": "professional",
          "chapter": "ch38",
          "question": "A mapping document is version 1, but the target schema changes to version 2. What must the BA do?",
          "options": [
            "Keep using version 1 silently",
            "Delete the mapping document",
            "Impact-assess the schema change, update the mapping, re-test affected fields, and version-control the document",
            "Assume nothing changed"
          ],
          "answer": 2,
          "explanation": "Schema changes can add, remove, or alter fields, so mapping must be reassessed and retested. Version control keeps teams aligned. Silent continued use of stale mapping causes rejections.",
          "why_wrong": [
            "Stale mapping will mismatch the new schema.",
            "Deletion loses the mapping record.",
            "",
            "Schema changes can be significant and must be checked."
          ]
        },
        {
          "id": "pb-22-10",
          "domain": "professional",
          "chapter": "ch38",
          "question": "A stakeholder asks for a mapping sign-off. Who should sign off a payment mapping document?",
          "options": [
            "Only the BA",
            "Only the office manager",
            "Business owners, operations, compliance where relevant, and technology, each confirming their area",
            "Nobody needs to sign off"
          ],
          "answer": 2,
          "explanation": "Mapping affects business behaviour, operations, compliance, and technology, so each area must confirm its part. Single-person sign-off misses impacts. Joint sign-off creates shared accountability for go-live.",
          "why_wrong": [
            "The BA coordinates but cannot approve all impacts alone.",
            "Office management is not a mapping authority.",
            "",
            "Unsigned mapping leaves accountability unclear."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-23",
        "title": "Payments BA Test 23: API Specs for Payment Initiation",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-23-01",
          "domain": "apis",
          "chapter": "ch26",
          "question": "A third party wants to initiate payments via API. What is the first design concern for the BA?",
          "options": [
            "The colour of the API portal",
            "Authentication, authorisation, consent, and security controls before any payment can be initiated",
            "The number of pages in the spec",
            "The office location"
          ],
          "answer": 1,
          "explanation": "Payment initiation APIs move money, so strong authentication, consent, scopes, and fraud controls come first. Without them, the API is unsafe. Portal appearance and page counts are secondary.",
          "why_wrong": [
            "Portal appearance does not secure payments.",
            "",
            "Page count does not determine API safety.",
            "Office location is irrelevant to API design."
          ]
        },
        {
          "id": "pb-23-02",
          "domain": "apis",
          "chapter": "ch80",
          "question": "An API specification defines an endpoint to create a payment. What must it specify about duplicate requests?",
          "options": [
            "Duplicates are welcome",
            "Every retry must create a new payment",
            "Idempotency: a retry with the same idempotency key must not create a second payment",
            "No retry is ever allowed"
          ],
          "answer": 2,
          "explanation": "Network timeouts cause retries, so idempotency keys let the API return the original result instead of duplicating the payment. This is a fundamental payment API requirement. Without it, retries create duplicate debits.",
          "why_wrong": [
            "Duplicate payments are a serious defect.",
            "Creating new payments on retry causes duplication.",
            "",
            "Retries are necessary; they must be safe, not banned."
          ]
        },
        {
          "id": "pb-23-03",
          "domain": "apis",
          "chapter": "ch80",
          "question": "A payment initiation API returns HTTP 400. What does this generally mean?",
          "options": [
            "The request was invalid, such as missing or malformed fields, and was not processed",
            "The payment settled successfully",
            "The server crashed permanently",
            "The payment is pending"
          ],
          "answer": 0,
          "explanation": "HTTP 400 indicates a client request error: the API could not accept the request as sent. The response should include a clear error code and field-level detail. Settlement success uses a different response.",
          "why_wrong": [
            "",
            "Success uses a success status, not 400.",
            "A crash would normally produce a 5xx error, not 400.",
            "Pending status is a business state, not a 400 error."
          ]
        },
        {
          "id": "pb-23-04",
          "domain": "apis",
          "chapter": "ch26",
          "question": "A customer consents to a third party initiating one payment. What must the consent cover?",
          "options": [
            "Nothing specific",
            "Unlimited future payments",
            "The payee, amount, currency, and validity of that specific payment, so the third party cannot change it",
            "Access to all accounts forever"
          ],
          "answer": 2,
          "explanation": "Single-payment consent is bound to the specific payment details, preventing the third party altering payee or amount. Open-ended consent would be unsafe. Consent scope is a core open banking requirement.",
          "why_wrong": [
            "Vague consent cannot protect the customer.",
            "Single consent must not authorise unlimited payments.",
            "",
            "Single-payment consent must not grant permanent broad access."
          ]
        },
        {
          "id": "pb-23-05",
          "domain": "apis",
          "chapter": "ch80",
          "question": "An API spec must define error responses. What should each error include?",
          "options": [
            "Only a blank page",
            "The full database contents",
            "A stable error code, a human-readable message, and enough detail to fix the request without leaking sensitive data",
            "A random number only"
          ],
          "answer": 2,
          "explanation": "Good error responses let developers fix requests quickly: stable codes for handling, clear messages, and field detail. They must not leak sensitive data or internals. Error design is part of API quality.",
          "why_wrong": [
            "Blank responses give developers nothing to fix.",
            "Database contents would leak sensitive data.",
            "",
            "A random number alone cannot guide a fix."
          ]
        },
        {
          "id": "pb-23-06",
          "domain": "apis",
          "chapter": "ch80",
          "question": "A payment API needs versioning. Why?",
          "options": [
            "To confuse developers",
            "To charge more per version",
            "To avoid all documentation",
            "So changes can be introduced without breaking existing clients, with clear deprecation and migration paths"
          ],
          "answer": 3,
          "explanation": "Versioning lets the API evolve while existing integrations keep working until they migrate. Deprecation timelines and change logs protect clients. Unversioned breaking changes disrupt payment flows.",
          "why_wrong": [
            "Versioning exists to protect clients, not confuse them.",
            "Pricing is separate from versioning purpose.",
            "Versioning needs documentation, not less.",
            ""
          ]
        },
        {
          "id": "pb-23-07",
          "domain": "apis",
          "chapter": "ch26",
          "question": "A third-party provider asks for a customer's online banking password to initiate a payment. What is the correct response?",
          "options": [
            "Share the password",
            "Write the password in the API spec",
            "Email the password to the provider",
            "Refuse: authentication must use secure redirect or token-based flows, never password sharing"
          ],
          "answer": 3,
          "explanation": "Open banking and secure API models never require password sharing. Customers authenticate directly with their bank and grant scoped tokens. Password sharing enables fraud and breaches security rules.",
          "why_wrong": [
            "Sharing passwords enables account takeover.",
            "Passwords must never appear in specifications.",
            "Emailing passwords is insecure and prohibited.",
            ""
          ]
        },
        {
          "id": "pb-23-08",
          "domain": "apis",
          "chapter": "ch80",
          "question": "An API must handle a payment status query. What should the status response provide?",
          "options": [
            "Only 'maybe'",
            "The customer's full transaction history",
            "No information at all",
            "The current payment status, references, timestamps, and any reason information, in a consistent format"
          ],
          "answer": 3,
          "explanation": "Status queries need the current state, identifiers, timing, and reasons so callers can act and reconcile. Vague or excessive responses fail the need. Consistent status vocabularies matter across APIs.",
          "why_wrong": [
            "Vague statuses cannot drive action.",
            "Full history is excessive and a privacy risk for a status check.",
            "Status queries exist to provide information.",
            ""
          ]
        },
        {
          "id": "pb-23-09",
          "domain": "apis",
          "chapter": "ch80",
          "question": "A BA is specifying API rate limits. Why are they needed for payment APIs?",
          "options": [
            "To protect the service from overload and abuse while allowing legitimate volumes, with clear limits and error handling",
            "To stop all usage",
            "To increase latency for fun",
            "To ban all third parties"
          ],
          "answer": 0,
          "explanation": "Rate limits protect availability and fairness, preventing one client overwhelming the service. Limits must be documented with clear throttling responses. They support legitimate use, not block it.",
          "why_wrong": [
            "",
            "Limits manage load; they do not stop all usage.",
            "Limits protect performance; they do not add delay for fun.",
            "Limits govern all clients fairly; they do not ban third parties."
          ]
        },
        {
          "id": "pb-23-10",
          "domain": "apis",
          "chapter": "ch26",
          "question": "A payment initiation journey needs strong customer authentication (SCA). What does SCA require in principle?",
          "options": [
            "Only a password",
            "Two or more independent factors, such as knowledge, possession, and inherence, as required by regulation",
            "No authentication at all",
            "Only a username"
          ],
          "answer": 1,
          "explanation": "SCA requires at least two independent authentication factors so compromise of one factor alone does not enable payment. Regulation defines when SCA and exemptions apply. API and journey design must embed SCA correctly.",
          "why_wrong": [
            "A password alone is single-factor, not SCA.",
            "",
            "No authentication would be unsafe and non-compliant.",
            "A username alone is an identifier, not authentication."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-24",
        "title": "Payments BA Test 24: UAT for a Hub Go-Live",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-24-01",
          "domain": "professional",
          "chapter": "ch42",
          "question": "What is the purpose of UAT for a payment hub?",
          "options": [
            "To prove developers wrote code",
            "To delay go-live",
            "To confirm business users can complete real payment scenarios end to end and that the system meets agreed requirements before go-live",
            "To replace all other testing"
          ],
          "answer": 2,
          "explanation": "UAT validates the system against business needs using realistic scenarios, data, and users. It is the business acceptance gate before go-live. It complements, not replaces, system and integration testing.",
          "why_wrong": [
            "Code existence does not prove business fitness.",
            "UAT protects go-live quality; delay is not its purpose.",
            "",
            "UAT complements other test levels; it does not replace them."
          ]
        },
        {
          "id": "pb-24-02",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A UAT plan covers only happy-path payments. What is the risk?",
          "options": [
            "No risk",
            "Faster go-live with no downside",
            "Exceptions, rejections, returns, timeouts, and edge cases go untested and fail in production",
            "Better quality"
          ],
          "answer": 2,
          "explanation": "Payment systems spend much of their life handling exceptions. UAT must cover rejects, returns, duplicates, timeouts, and boundary cases. Happy-path-only testing gives false confidence.",
          "why_wrong": [
            "Untested exceptions are a major go-live risk.",
            "Skipping exception tests creates production failures.",
            "",
            "Narrow coverage reduces quality."
          ]
        },
        {
          "id": "pb-24-03",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A UAT tester finds a defect where a payment settles twice. How should it be classified?",
          "options": [
            "Cosmetic",
            "Ignore",
            "Critical or blocking, because duplicate settlement loses funds and must be fixed before go-live",
            "Enhancement for later"
          ],
          "answer": 2,
          "explanation": "Duplicate settlement is a financial integrity defect with direct customer and ledger impact. It must block go-live until fixed and retested. Severity classification must reflect financial impact, not convenience.",
          "why_wrong": [
            "Duplicate settlement is not cosmetic.",
            "Ignoring a funds defect would be negligent.",
            "",
            "It is a defect, not a future enhancement."
          ]
        },
        {
          "id": "pb-24-04",
          "domain": "professional",
          "chapter": "ch42",
          "question": "What should entry criteria for UAT include?",
          "options": [
            "No criteria at all",
            "A promise that no defects exist",
            "Only a meeting invite",
            "Stable build, completed system testing, test data, environments, and agreed test cases with business sign-off to start"
          ],
          "answer": 3,
          "explanation": "UAT entry criteria ensure the system is ready for business testing: stable code, prior test completion, data, and environment. Starting UAT on an unstable build wastes business time and hides real issues.",
          "why_wrong": [
            "Entry criteria protect UAT effectiveness.",
            "No system is defect-free; readiness is about stability and prior testing.",
            "A meeting invite does not prove readiness.",
            ""
          ]
        },
        {
          "id": "pb-24-05",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A UAT defect is fixed. What must happen before the test case is marked passed?",
          "options": [
            "Mark it passed immediately",
            "Retest the fix, plus regression test affected areas, with evidence recorded",
            "Delete the test case",
            "Assume the fix works"
          ],
          "answer": 1,
          "explanation": "Fixes need retesting to prove the defect is resolved, and regression testing to prove nothing else broke. Evidence supports acceptance. Assuming success without retest is a go-live risk.",
          "why_wrong": [
            "Passing without retest provides no evidence.",
            "",
            "Deleting test cases hides coverage gaps.",
            "Assumptions do not prove fixes."
          ]
        },
        {
          "id": "pb-24-06",
          "domain": "professional",
          "chapter": "ch42",
          "question": "Who should execute payment hub UAT?",
          "options": [
            "Business users and operations staff who will use the system, supported by testers and BAs",
            "Only developers",
            "Only marketing staff",
            "Nobody; UAT is optional"
          ],
          "answer": 0,
          "explanation": "UAT needs the people who understand business processes and will operate the hub: business users and operations. Developers support but cannot accept their own work. Business ownership makes acceptance meaningful.",
          "why_wrong": [
            "",
            "Developers cannot independently accept business fitness.",
            "Marketing staff do not operate payment hubs.",
            "UAT is a key acceptance gate, not optional."
          ]
        },
        {
          "id": "pb-24-07",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A UAT exit report shows 10 open high-severity defects. What is the correct go-live recommendation?",
          "options": [
            "Do not go live until defects are fixed or formally risk-accepted with mitigations by accountable owners",
            "Go live anyway and hope",
            "Hide the defects",
            "Go live and fix in production without telling users"
          ],
          "answer": 0,
          "explanation": "High-severity defects need fixing or formal risk acceptance with mitigations and owner accountability. Silent go-live gambles with customer funds. Exit criteria and governance protect the business.",
          "why_wrong": [
            "",
            "Hoping is not a control.",
            "Hiding defects breaks governance and trust.",
            "Silent production fixes hide risk from users and auditors."
          ]
        },
        {
          "id": "pb-24-08",
          "domain": "professional",
          "chapter": "ch42",
          "question": "Why must UAT use realistic payment volumes and data shapes?",
          "options": [
            "Realistic data is unnecessary",
            "Because small clean samples hide performance, data quality, and exception issues that appear at real scale",
            "Because testers prefer easy data",
            "Because production data can be copied without controls"
          ],
          "answer": 1,
          "explanation": "Realistic volumes, messy data, and edge cases reveal performance and handling issues that tiny clean samples miss. Test data must be realistic but properly controlled and masked. Scale testing matters for payment hubs.",
          "why_wrong": [
            "Unrealistic data gives false confidence.",
            "",
            "Tester preference does not set data needs.",
            "Production data needs masking and controls; it cannot be copied freely."
          ]
        },
        {
          "id": "pb-24-09",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A UAT scenario tests a payment that fails sanctions screening. What must the test prove?",
          "options": [
            "That the payment is released anyway",
            "That the customer sees screening details",
            "That screening can be switched off",
            "That the payment is held, routed correctly, audited, and not released until cleared"
          ],
          "answer": 3,
          "explanation": "Screening tests must prove holds, routing, audit, and non-release until clearance. Releasing held payments or disabling screening would breach controls. Customer messaging must follow approved wording.",
          "why_wrong": [
            "Held payments must not be released.",
            "Screening detail must not be disclosed to customers.",
            "Switching off screening is prohibited.",
            ""
          ]
        },
        {
          "id": "pb-24-10",
          "domain": "professional",
          "chapter": "ch42",
          "question": "What is a UAT traceability matrix used for?",
          "options": [
            "To list staff holidays",
            "To count testers",
            "To track office supplies",
            "To show which requirements are covered by which test cases and whether each passed, so gaps are visible"
          ],
          "answer": 3,
          "explanation": "Traceability matrices link requirements to test cases and results, proving coverage and exposing untested requirements. They support go-live decisions and audits. Without them, coverage claims are unverified.",
          "why_wrong": [
            "Traceability concerns requirements and tests, not holidays.",
            "Counting testers does not prove coverage.",
            "Office supplies are unrelated.",
            ""
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-25",
        "title": "Payments BA Test 25: Test Data and Certification",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-25-01",
          "domain": "professional",
          "chapter": "ch42",
          "question": "Why must payment test data avoid real customer details?",
          "options": [
            "Real data is always required",
            "Privacy and security rules require masked or synthetic data so real customer information is not exposed in test environments",
            "Test data does not matter",
            "Real data makes tests faster"
          ],
          "answer": 1,
          "explanation": "Test environments have weaker controls than production, so real customer data must not be copied into them. Masked or synthetic data protects privacy while supporting realistic testing. Data protection rules demand this.",
          "why_wrong": [
            "Real data in test environments breaches privacy and security.",
            "",
            "Test data quality directly affects test validity.",
            "Real data does not make tests faster; it makes them riskier."
          ]
        },
        {
          "id": "pb-25-02",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A test data set includes only valid payments. What is missing?",
          "options": [
            "Nothing",
            "More valid payments",
            "Invalid, boundary, duplicate, and exception cases that prove validation and error handling",
            "Marketing data"
          ],
          "answer": 2,
          "explanation": "Testing needs negative and edge cases: invalid accounts, missing fields, duplicates, limit breaches, and timeouts. Valid-only data cannot prove controls work. Comprehensive test data is a BA and tester joint responsibility.",
          "why_wrong": [
            "Valid-only data leaves controls untested.",
            "More valid data does not test error handling.",
            "",
            "Marketing data does not test payment controls."
          ]
        },
        {
          "id": "pb-25-03",
          "domain": "operations",
          "chapter": "ch83",
          "question": "What is scheme certification in payments?",
          "options": [
            "A marketing award",
            "A fee with no checks",
            "A staff training course only",
            "A formal process where a scheme verifies a participant meets its technical, operational, and security requirements before live connection"
          ],
          "answer": 3,
          "explanation": "Certification proves a bank or provider can connect, exchange messages, handle exceptions, and meet scheme rules safely. Schemes test connectivity, formats, and procedures before admitting participants. It protects the whole network.",
          "why_wrong": [
            "Certification is a technical and operational gate, not marketing.",
            "Certification involves rigorous testing, not only a fee.",
            "Training supports certification but is not the certification itself.",
            ""
          ]
        },
        {
          "id": "pb-25-04",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A certification test fails because a message uses the wrong version. What is the lesson?",
          "options": [
            "Versions do not matter",
            "The scheme is wrong",
            "Certification can be skipped",
            "Exact message versions, schemas, and usage guidelines must be agreed and implemented before certification"
          ],
          "answer": 3,
          "explanation": "Version mismatches cause validation failures and certification rejection. Programmes must lock versions early and test against scheme-provided specifications. Assuming version compatibility is a common failure.",
          "why_wrong": [
            "Versions define schemas and rules; they matter greatly.",
            "The participant must meet the scheme specification.",
            "Certification is required for live connection.",
            ""
          ]
        },
        {
          "id": "pb-25-05",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A BA is preparing test accounts for UAT. What must be true of the accounts?",
          "options": [
            "They must be dedicated test accounts with known balances, limits, and states covering the scenarios to be tested",
            "They must be real customer accounts",
            "They can be random with no setup",
            "They must have unlimited funds with no controls"
          ],
          "answer": 0,
          "explanation": "Test accounts need controlled setup: known balances for success and insufficient-funds cases, limits, mandates, and states. Random or real accounts cannot support repeatable testing. Setup is part of test preparation.",
          "why_wrong": [
            "",
            "Real customer accounts must not be used for testing.",
            "Random accounts cannot support planned scenarios.",
            "Unlimited funds would hide limit and funds checks."
          ]
        },
        {
          "id": "pb-25-06",
          "domain": "professional",
          "chapter": "ch42",
          "question": "Why should test data include payments in multiple currencies?",
          "options": [
            "Currencies do not affect processing",
            "Currency affects calendars, cutoffs, FX, validation, and settlement, so single-currency testing misses defects",
            "To make reports longer",
            "Only one currency is ever used"
          ],
          "answer": 1,
          "explanation": "Multi-currency testing exercises FX, calendars, and currency-specific validation that single-currency tests miss. Payment systems serve many currencies in production. Coverage must reflect that.",
          "why_wrong": [
            "Currency drives many processing rules.",
            "",
            "Coverage is about risk, not report length.",
            "Production systems handle multiple currencies."
          ]
        },
        {
          "id": "pb-25-07",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A test environment uses production-like volumes for a performance test. What is being verified?",
          "options": [
            "That the system handles peak throughput, latency, and queue behaviour without losing or delaying payments unacceptably",
            "Screen colours",
            "Staff punctuality",
            "Marketing reach"
          ],
          "answer": 0,
          "explanation": "Performance testing proves the hub meets throughput and response targets under realistic load. Payment peaks, such as salary days, stress queues and resources. Screen and staff matters are irrelevant.",
          "why_wrong": [
            "",
            "Performance testing concerns throughput and latency, not colours.",
            "Staff punctuality is unrelated.",
            "Marketing reach is unrelated to system performance."
          ]
        },
        {
          "id": "pb-25-08",
          "domain": "operations",
          "chapter": "ch83",
          "question": "A new participant fails certification twice. What should the programme do?",
          "options": [
            "Connect to live anyway",
            "Blame the scheme and stop testing",
            "Fix the gaps, retest in the certification environment, and only proceed when the scheme confirms readiness",
            "Skip certification for this participant"
          ],
          "answer": 2,
          "explanation": "Failed certification means the participant is not ready for live traffic. Fixes and retests must close the gaps. Live connection without certification risks network disruption and scheme penalties.",
          "why_wrong": [
            "Live connection without certification is not permitted.",
            "Blame does not fix gaps.",
            "",
            "Certification cannot be skipped for live participation."
          ]
        },
        {
          "id": "pb-25-09",
          "domain": "professional",
          "chapter": "ch42",
          "question": "Test data must cover a payment just below, at, and just above a limit. What technique is this?",
          "options": [
            "Random guessing",
            "No testing",
            "Happy-path testing only",
            "Boundary value testing, which checks behaviour at the edges of a rule"
          ],
          "answer": 3,
          "explanation": "Boundary testing probes the edges where defects cluster: just inside, exactly on, and just outside a limit. It proves limit enforcement precisely. Random or happy-path testing misses edge defects.",
          "why_wrong": [
            "Boundary testing is systematic, not random.",
            "Boundary cases need explicit tests.",
            "Happy-path testing avoids edges.",
            ""
          ]
        },
        {
          "id": "pb-25-10",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A BA must ensure test evidence is kept for audit. What should be retained?",
          "options": [
            "Nothing",
            "Only verbal assurances",
            "Test cases, results, defect records, approvals, and certification outcomes, linked to requirements",
            "Only screenshots of logins"
          ],
          "answer": 2,
          "explanation": "Audit evidence links requirements to tests, results, defects, and approvals, proving the system was verified before go-live. Verbal assurances cannot be audited. Evidence retention is a governance requirement for payment programmes.",
          "why_wrong": [
            "No evidence means no proof of testing.",
            "Verbal assurances are not auditable evidence.",
            "",
            "Login screenshots do not prove payment testing."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-26",
        "title": "Payments BA Test 26: Payment Hub Architecture for a BA",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-26-01",
          "domain": "architecture",
          "chapter": "ch25",
          "question": "What is a payment hub in plain language?",
          "options": [
            "A single bank branch",
            "A type of cheque",
            "A central platform that receives, validates, enriches, routes, and tracks payments across rails and channels",
            "A marketing website"
          ],
          "answer": 2,
          "explanation": "A hub centralises payment processing so channels and back-office systems connect once, while the hub handles validation, routing, and orchestration. It reduces point-to-point links and improves control. A BA must understand hub functions to write requirements.",
          "why_wrong": [
            "A hub is a central platform, not a branch.",
            "A hub is software infrastructure, not a paper instrument.",
            "",
            "A hub processes payments; it is not a marketing site."
          ]
        },
        {
          "id": "pb-26-02",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A hub must keep a payment's state consistent if a component fails mid-flow. What design feature supports this?",
          "options": [
            "No state tracking at all",
            "Deleting state on failure",
            "Persistent state with transactional updates and recovery, so the payment resumes from a known state",
            "Guessing the state on restart"
          ],
          "answer": 2,
          "explanation": "Durable state and transactional updates let the hub recover to a known point after failure without losing or duplicating payments. State must survive restarts. Deletion and guessing corrupt payment integrity.",
          "why_wrong": [
            "Without state tracking, recovery is impossible.",
            "Deleting state loses the payment.",
            "",
            "Guessing state risks duplication or loss."
          ]
        },
        {
          "id": "pb-26-03",
          "domain": "architecture",
          "chapter": "ch25",
          "question": "A hub routes payments by rail, currency, value, and cutoff. What is this function called?",
          "options": [
            "Payment routing, applying business rules to choose the best rail and path",
            "Random selection",
            "Printing",
            "Archiving"
          ],
          "answer": 0,
          "explanation": "Routing rules evaluate payment attributes against rail capabilities, costs, cutoffs, and priorities to select the path. Good routing improves speed, cost, and success rates. Random routing would misdirect payments.",
          "why_wrong": [
            "",
            "Routing follows rules, not randomness.",
            "Printing is unrelated to routing.",
            "Archiving stores completed records; it does not route live payments."
          ]
        },
        {
          "id": "pb-26-04",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A downstream system is slow to respond. What hub behaviour protects the payment flow?",
          "options": [
            "Timeouts, retries with limits, circuit breaking, and queueing so one slow system does not block all payments",
            "Wait forever with no timeout",
            "Delete all queued payments",
            "Send every payment twice"
          ],
          "answer": 0,
          "explanation": "Resilience patterns bound waiting, retry safely, isolate failing dependencies, and queue work for later. This keeps the hub responsive during partial outages. Infinite waits and duplication worsen failures.",
          "why_wrong": [
            "",
            "Infinite waits block processing and hide failures.",
            "Deletion loses payments.",
            "Duplication creates overpayments."
          ]
        },
        {
          "id": "pb-26-05",
          "domain": "architecture",
          "chapter": "ch48",
          "question": "A BA is documenting hub interfaces. Why should each interface define its contract explicitly?",
          "options": [
            "Contracts slow work for no benefit",
            "Only verbal agreements matter",
            "Interfaces need no definition",
            "Explicit contracts for messages, versions, errors, and SLAs let teams build and test independently and detect breaking changes"
          ],
          "answer": 3,
          "explanation": "Interface contracts define formats, versions, error handling, and performance so consumers and providers agree. They enable parallel work and safe change. Verbal agreements drift and break integrations.",
          "why_wrong": [
            "Contracts prevent rework; they do not slow work overall.",
            "Verbal agreements are not auditable or stable.",
            "Undefined interfaces cause integration failures.",
            ""
          ]
        },
        {
          "id": "pb-26-06",
          "domain": "architecture",
          "chapter": "ch79",
          "question": "A hub needs observability. What does this mean for operations?",
          "options": [
            "Only a logo on the dashboard",
            "Only annual reports",
            "No monitoring at all",
            "Logs, metrics, traces, and alerts that show payment health, bottlenecks, and failures in real time"
          ],
          "answer": 3,
          "explanation": "Observability gives operations real-time insight into throughput, errors, queues, and latencies, with alerts for anomalies. It supports fast incident response. Annual reports cannot support live operations.",
          "why_wrong": [
            "Logos do not provide operational insight.",
            "Annual reports are too slow for live payment operations.",
            "No monitoring leaves failures invisible.",
            ""
          ]
        },
        {
          "id": "pb-26-07",
          "domain": "architecture",
          "chapter": "ch25",
          "question": "A hub receives the same payment instruction twice from a channel. What must it do?",
          "options": [
            "Process both",
            "Delete the channel",
            "Detect the duplicate by reference or idempotency key and process only once, returning the original result",
            "Double the amount"
          ],
          "answer": 2,
          "explanation": "Duplicate detection at the hub boundary prevents double debits from retries and resends. Idempotency keys and reference checks are essential controls. Processing both would duplicate the payment.",
          "why_wrong": [
            "Processing both duplicates the payment.",
            "Deleting the channel does not fix duplicate handling.",
            "",
            "Doubling the amount corrupts the payment."
          ]
        },
        {
          "id": "pb-26-08",
          "domain": "architecture",
          "chapter": "ch47",
          "question": "A hub integrates with a core banking system using both real-time APIs and batch files. What must the BA clarify?",
          "options": [
            "Nothing; both work the same",
            "Which flows use real-time versus batch, with timing, reconciliation, and failure handling for each pattern",
            "That batch is always better",
            "That APIs are never used"
          ],
          "answer": 1,
          "explanation": "Real-time and batch patterns have different timing, consistency, and failure behaviour. Requirements must state which flow uses which pattern and how they reconcile. Assuming sameness causes timing and control gaps.",
          "why_wrong": [
            "Real-time and batch behave differently and need distinct rules.",
            "",
            "Neither pattern is always better; fit depends on the flow.",
            "APIs are widely used for real-time payment integration."
          ]
        },
        {
          "id": "pb-26-09",
          "domain": "architecture",
          "chapter": "ch68",
          "question": "A hub must scale for a salary-day peak. What design concern should the BA raise?",
          "options": [
            "Peak volumes do not matter",
            "Peaks can be ignored",
            "Only average volumes matter",
            "Capacity, throughput targets, queue sizing, and load testing for peak volumes"
          ],
          "answer": 3,
          "explanation": "Payment volumes spike on salary and month-end days, so capacity planning and load testing must use peak profiles. Average-only planning causes queues and missed cutoffs. Requirements must state peak targets.",
          "why_wrong": [
            "Peaks determine capacity needs.",
            "Ignoring peaks guarantees peak failures.",
            "Average volumes hide peak stress.",
            ""
          ]
        },
        {
          "id": "pb-26-10",
          "domain": "architecture",
          "chapter": "ch48",
          "question": "A hub upgrade requires zero payment loss. What release approach best supports this?",
          "options": [
            "Switch off the hub with no plan",
            "A controlled release with draining, version compatibility, rollback, and reconciliation checks",
            "Delete in-flight payments first",
            "Release without testing"
          ],
          "answer": 1,
          "explanation": "Safe releases drain or migrate in-flight work, keep versions compatible, allow rollback, and verify reconciliation after. Unplanned switch-offs lose payments. Release requirements are part of hub architecture.",
          "why_wrong": [
            "Unplanned switch-off loses in-flight payments.",
            "",
            "Deleting payments is never a release step.",
            "Untested releases risk production failures."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-27",
        "title": "Payments BA Test 27: Advanced Exceptions and Multi-Leg Investigations",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-27-01",
          "domain": "operations",
          "chapter": "ch75",
          "question": "A cross-border payment shows as settled by the sender bank but the payee bank has no record. What is the most likely investigation path?",
          "options": [
            "Assume the payee is lying",
            "Close the case with no evidence",
            "Send a duplicate immediately",
            "Trace the UETR and leg-by-leg confirmations to find where the chain breaks, then query the last confirming bank"
          ],
          "answer": 3,
          "explanation": "Leg-by-leg tracing with UETR and gpi confirmations locates the break: which bank last confirmed and which has no record. Targeted queries then resolve the gap. Duplicates and assumptions worsen the case.",
          "why_wrong": [
            "Assuming dishonesty without evidence is unprofessional and unhelpful.",
            "Cases need evidence, not closure without it.",
            "A duplicate risks double payment while the first is still in flight.",
            ""
          ]
        },
        {
          "id": "pb-27-02",
          "domain": "operations",
          "chapter": "ch75",
          "question": "An intermediary bank deducts a fee but provides no charge detail. What should the investigation request?",
          "options": [
            "Nothing",
            "Deletion of the charge record",
            "A new payment",
            "A breakdown of charges deducted, with references, so the sender can explain the shortfall to its customer"
          ],
          "answer": 3,
          "explanation": "Charge transparency requires intermediaries to account for deductions. The investigation should request the charge breakdown linked to the payment reference. Without it, the sender cannot explain or dispute the shortfall.",
          "why_wrong": [
            "Silence leaves the shortfall unexplained.",
            "Deleting records destroys evidence.",
            "A new payment does not explain the deduction.",
            ""
          ]
        },
        {
          "id": "pb-27-03",
          "domain": "operations",
          "chapter": "ch41",
          "question": "A payment is recalled after the payee has withdrawn the funds. What is the realistic outcome?",
          "options": [
            "Automatic recovery in all cases",
            "Recovery is uncertain and depends on the payee, the receiving bank, and legal process; prevention and fast recall improve chances",
            "The sender bank must pay twice",
            "The scheme always refunds the sender"
          ],
          "answer": 1,
          "explanation": "Once funds are withdrawn, recall depends on cooperation and legal routes; it is not guaranteed. Fast recall before withdrawal improves recovery. A BA must set realistic expectations and emphasise prevention.",
          "why_wrong": [
            "Withdrawn funds cannot always be recovered.",
            "",
            "Double payment is not the recovery route.",
            "Schemes do not guarantee refunds for withdrawn funds."
          ]
        },
        {
          "id": "pb-27-04",
          "domain": "operations",
          "chapter": "ch75",
          "question": "A multi-leg investigation involves three banks in different time zones. What case practice helps most?",
          "options": [
            "A single case record with references, status per leg, agreed response times, and written interbank messages",
            "Phone calls with no records",
            "Separate unlinked emails",
            "No tracking at all"
          ],
          "answer": 0,
          "explanation": "Complex investigations need one case with per-leg status, references, and written message trails so handoffs across time zones stay coherent. Unlinked emails lose context. Structured case management speeds resolution.",
          "why_wrong": [
            "",
            "Unrecorded calls leave no audit trail.",
            "Unlinked emails fragment the case.",
            "No tracking guarantees delays and lost queries."
          ]
        },
        {
          "id": "pb-27-05",
          "domain": "operations",
          "chapter": "ch16",
          "question": "A payment is stuck because the creditor agent requests beneficiary details that the debtor cannot provide. What is the next step?",
          "options": [
            "Fabricate the details",
            "Delete the payment",
            "Release it without the details",
            "Escalate to the originator and payee for correct details, hold the payment safely, and set a deadline after which it is returned if unresolved"
          ],
          "answer": 3,
          "explanation": "Missing beneficiary details block safe crediting, so the payment must be held while correct information is sought, with a deadline and return path. Fabrication and unsafe release risk misdirection. Clear escalation protects all parties.",
          "why_wrong": [
            "Fabricating details risks paying the wrong person.",
            "Deletion loses the payment and its audit trail.",
            "Release without required details risks misdirection and compliance breach.",
            ""
          ]
        },
        {
          "id": "pb-27-06",
          "domain": "operations",
          "chapter": "ch41",
          "question": "An investigation finds the same root cause affecting 50 payments. What should happen beyond fixing each case?",
          "options": [
            "Fix each case and stop",
            "Raise a problem record, fix the root cause, and check for other affected payments proactively",
            "Ignore the pattern",
            "Close all cases without fixing"
          ],
          "answer": 1,
          "explanation": "Repeat root causes need problem management: fix the underlying defect and sweep for other affected payments. Case-by-case fixes alone let the defect recur. Pattern analysis turns incidents into lasting fixes.",
          "why_wrong": [
            "Stopping at case fixes lets the defect recur.",
            "",
            "Ignoring patterns wastes the insight.",
            "Closing without fixing leaves customers affected."
          ]
        },
        {
          "id": "pb-27-07",
          "domain": "operations",
          "chapter": "ch75",
          "question": "A customer claims non-receipt but gpi shows the payment was credited to the payee bank. What should the bank do?",
          "options": [
            "Share the appropriate tracking evidence with the customer and ask the payee to check with their bank, offering to raise a query with the payee bank",
            "Insist the customer is wrong with no evidence",
            "Refund immediately without checking",
            "Ignore the gpi evidence"
          ],
          "answer": 0,
          "explanation": "Tracking evidence showing credit to the payee bank shifts the query to payee-bank allocation. The bank should explain the evidence, suggest payee-bank checks, and offer interbank follow-up. Blind refunds and dismissal both fail the customer.",
          "why_wrong": [
            "",
            "Dismissal without evidence damages trust.",
            "A refund before checking risks double payment.",
            "gpi evidence is key to locating the issue."
          ]
        },
        {
          "id": "pb-27-08",
          "domain": "operations",
          "chapter": "ch41",
          "question": "A payment timeout leaves the outcome unknown: it may or may not have settled. What is the safe investigation approach?",
          "options": [
            "Assume it failed and resend",
            "Assume it succeeded and tell the customer",
            "Check settlement, ledger, and counterparty records to establish the true outcome before any resend or reversal",
            "Delete the record and start over"
          ],
          "answer": 2,
          "explanation": "Unknown outcomes need evidence from settlement and ledger sources before action. Assuming failure risks duplication; assuming success risks a missing payment. Reconciliation of the timeout case must precede resend or reversal.",
          "why_wrong": [
            "Assuming failure and resending risks duplication.",
            "Assuming success risks leaving the payee unpaid.",
            "",
            "Deletion destroys the evidence needed to resolve the case."
          ]
        },
        {
          "id": "pb-27-09",
          "domain": "operations",
          "chapter": "ch75",
          "question": "An interbank query receives no response within the agreed time. What should the case handler do?",
          "options": [
            "Give up",
            "Send a duplicate payment",
            "Escalate with a chase message, record the delay, and inform the customer of the revised timeline",
            "Close the case as resolved"
          ],
          "answer": 2,
          "explanation": "Unanswered queries need chasing, escalation, and customer updates. Giving up or closing as resolved misrepresents the position. Case SLAs must define chase and escalation steps.",
          "why_wrong": [
            "Giving up abandons the customer query.",
            "A duplicate does not resolve the original query.",
            "",
            "Closing an unresolved case is false reporting."
          ]
        },
        {
          "id": "pb-27-10",
          "domain": "operations",
          "chapter": "ch41",
          "question": "A BA is designing investigation SLAs for high-value payments. What principle applies?",
          "options": [
            "All cases have the same priority",
            "High-value cases can wait longest",
            "Higher value, customer impact, and regulatory sensitivity justify faster SLAs and earlier escalation",
            "SLAs are unnecessary"
          ],
          "answer": 2,
          "explanation": "Prioritisation by value, impact, and sensitivity focuses effort where harm is greatest. Flat priorities let urgent cases wait. SLA design must reflect risk and customer impact.",
          "why_wrong": [
            "Flat priorities ignore risk differences.",
            "High-value cases need faster handling, not slower.",
            "",
            "SLAs are essential for predictable resolution."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-28",
        "title": "Payments BA Test 28: Migration Cutover and Parallel Run Scenarios",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-28-01",
          "domain": "professional",
          "chapter": "ch8",
          "question": "A migration plan uses parallel running of old and new systems. What is the main benefit?",
          "options": [
            "Double the cost with no benefit",
            "No testing is needed",
            "Outputs can be compared to prove the new system matches the old before full cutover",
            "Staff can ignore the new system"
          ],
          "answer": 2,
          "explanation": "Parallel running compares old and new outputs on the same inputs, revealing mapping and logic differences before the old system retires. It de-risks cutover. Cost is the trade-off, but the assurance is substantial.",
          "why_wrong": [
            "Comparison assurance is the benefit that justifies the cost.",
            "Parallel running is itself a form of testing and needs analysis.",
            "",
            "Staff must actively compare and resolve differences."
          ]
        },
        {
          "id": "pb-28-02",
          "domain": "professional",
          "chapter": "ch42",
          "question": "During parallel run, the new system produces a different charge total for the same payments. What must happen?",
          "options": [
            "Ignore the difference",
            "Go live with the difference",
            "Investigate the difference, determine which system is correct, fix the defect, and re-run the comparison",
            "Delete the comparison report"
          ],
          "answer": 2,
          "explanation": "Output differences are findings that must be explained: defect, rule change, or data difference. Each needs a decision and evidence. Ignoring charge differences risks customer and ledger impact at go-live.",
          "why_wrong": [
            "Ignoring differences hides defects.",
            "Going live with unexplained differences is unsafe.",
            "",
            "Deleting reports hides evidence."
          ]
        },
        {
          "id": "pb-28-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A cutover plan has no rollback step. What is the BA concern?",
          "options": [
            "No concern",
            "Failures never happen",
            "Rollback is never needed",
            "If the new system fails, there is no defined way to return to the old system safely, risking prolonged outage"
          ],
          "answer": 3,
          "explanation": "Rollback plans define triggers, steps, data handling, and decision owners for returning to the old system. Without them, failures become prolonged incidents. Every cutover needs a tested rollback or fallback.",
          "why_wrong": [
            "Missing rollback is a major cutover risk.",
            "Failures do happen and must be planned for.",
            "Rollback is a standard safety measure.",
            ""
          ]
        },
        {
          "id": "pb-28-04",
          "domain": "professional",
          "chapter": "ch68",
          "question": "Cutover is planned for a Friday evening before a salary Monday. What should the BA advise?",
          "options": [
            "Reconsider timing: cut over in a lower-risk window with support cover and time to fix issues before peak volumes",
            "Proceed; timing does not matter",
            "Cut over during the peak itself",
            "Cut over with no support"
          ],
          "answer": 0,
          "explanation": "Cutover timing must avoid peak volumes and provide a stabilisation window with full support. A salary Monday leaves no room to fix issues. Risk-based scheduling protects customers and operations.",
          "why_wrong": [
            "",
            "Timing directly affects cutover risk.",
            "Peak-time cutover maximises impact of any defect.",
            "Unsupported cutover leaves failures unhandled."
          ]
        },
        {
          "id": "pb-28-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A migration changes message formats. What must happen with counterparties before cutover?",
          "options": [
            "Nothing; they will adapt automatically",
            "Agree formats, versions, test schedules, and cutover dates with each counterparty and complete joint testing",
            "Surprise them on the day",
            "Assume they use the same system"
          ],
          "answer": 1,
          "explanation": "Counterparties must implement and test the new formats on an agreed timeline, or messages will reject at cutover. Joint testing and agreed dates are essential. Unilateral change breaks the chain.",
          "why_wrong": [
            "Counterparties need time to implement and test.",
            "",
            "Surprise changes cause mass rejections.",
            "Counterparties run diverse systems and need explicit agreement."
          ]
        },
        {
          "id": "pb-28-06",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A dress rehearsal for cutover reveals the runbook misses a reconciliation step. What is the value of the rehearsal?",
          "options": [
            "None",
            "It proves rehearsals are unnecessary",
            "It wasted time",
            "It found the gap safely before live cutover, so the runbook can be fixed and re-rehearsed"
          ],
          "answer": 3,
          "explanation": "Rehearsals surface runbook gaps, timing issues, and coordination problems in a safe environment. Finding a missing reconciliation step before go-live prevents a live control failure. Rehearsals are a key readiness activity.",
          "why_wrong": [
            "Finding gaps is exactly the rehearsal's value.",
            "The finding proves rehearsals are necessary.",
            "Rehearsal time prevents far costlier live failures.",
            ""
          ]
        },
        {
          "id": "pb-28-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "After cutover, operations report a spike in manual repairs. What should the programme do?",
          "options": [
            "Ignore it",
            "Triage the spike, identify the root cause, fix or work around it, and consider rollback criteria if it worsens",
            "Blame operations",
            "Increase manual staffing forever with no fix"
          ],
          "answer": 1,
          "explanation": "Post-cutover hypercare must triage spikes, find root causes, and act, with rollback criteria if thresholds breach. Blame and permanent manual workarounds do not fix defects. Structured hypercare protects the business.",
          "why_wrong": [
            "Ignoring spikes lets defects grow.",
            "",
            "Blame does not fix the cause.",
            "Staffing alone without a fix is unsustainable."
          ]
        },
        {
          "id": "pb-28-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A phased cutover migrates one payment type at a time. What is the advantage over big bang?",
          "options": [
            "Smaller blast radius: issues affect one payment type and lessons improve later phases",
            "More risk in every case",
            "No planning is needed",
            "All payment types migrate at once anyway"
          ],
          "answer": 0,
          "explanation": "Phasing limits the impact of defects to one scope slice and lets the team learn before the next phase. Big bang migrates everything at once with larger blast radius. Phasing needs careful dependency and coexistence planning.",
          "why_wrong": [
            "",
            "Phasing reduces blast radius; it does not increase risk in every case.",
            "Phasing needs more planning for coexistence and dependencies.",
            "Phasing deliberately staggers migration."
          ]
        },
        {
          "id": "pb-28-09",
          "domain": "professional",
          "chapter": "ch68",
          "question": "During cutover, the old system must stop accepting new payments at a defined point. What is this called?",
          "options": [
            "Chaos",
            "A duplicate run",
            "A holiday",
            "A freeze or drain point, after which new work goes only to the new system"
          ],
          "answer": 3,
          "explanation": "A freeze point stops new work entering the old system so in-flight work can drain and the new system takes over cleanly. Without it, work splits unpredictably. Cutover plans must define freeze, drain, and switch times.",
          "why_wrong": [
            "A freeze is a controlled step, not chaos.",
            "A freeze prevents duplication by directing work to one system.",
            "A freeze is an operational control point, not a holiday.",
            ""
          ]
        },
        {
          "id": "pb-28-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A go-live decision meeting reviews readiness. What evidence should the BA present?",
          "options": [
            "Optimism only",
            "A single screenshot",
            "Test results, defect status, counterparty readiness, runbooks, rollback plan, support cover, and open risks with owners",
            "No evidence at all"
          ],
          "answer": 2,
          "explanation": "Go-live decisions need evidence across testing, defects, counterparties, operations, and risk. Optimism and single screenshots cannot support a safe decision. A readiness checklist with owners makes the decision auditable.",
          "why_wrong": [
            "Optimism is not evidence.",
            "One screenshot cannot prove readiness.",
            "",
            "Decisions without evidence are unsafe."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-29",
        "title": "Payments BA Test 29: Reconciliation Breaks and Settlement Failures",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-29-01",
          "domain": "operations",
          "chapter": "ch77",
          "question": "A settlement file fails to arrive from a clearing system. What is the first operational action?",
          "options": [
            "Assume settlement happened",
            "Pay all customers again",
            "Delete the expected entries",
            "Confirm the failure with the clearing system, check for partial files, and follow the incident and contingency procedure"
          ],
          "answer": 3,
          "explanation": "Missing settlement files need confirmation, partial-file checks, and incident handling so positions are not assumed. Contingency procedures define manual or delayed processing. Assuming settlement misstates positions.",
          "why_wrong": [
            "Assumption without evidence misstates settlement.",
            "Repaying without evidence duplicates payments.",
            "Deleting expected entries hides the gap.",
            ""
          ]
        },
        {
          "id": "pb-29-02",
          "domain": "operations",
          "chapter": "ch40",
          "question": "A nostro break shows the bank statement has an entry for double the expected amount. What is the likely cause to check?",
          "options": [
            "The customer paid twice on purpose",
            "A duplicate settlement, a combined entry covering two payments, or an amount error in processing",
            "The statement is always wrong",
            "The ledger is always wrong"
          ],
          "answer": 1,
          "explanation": "Doubled entries often reflect duplicates, aggregated entries, or amount errors. Investigation compares statement detail with internal records and references. Blaming one source without evidence wastes time.",
          "why_wrong": [
            "Customer intent cannot be assumed from a statement entry.",
            "",
            "Statements can be correct; the cause needs evidence.",
            "Ledgers can be correct; the cause needs evidence."
          ]
        },
        {
          "id": "pb-29-03",
          "domain": "clearing",
          "chapter": "ch77",
          "question": "A participant fails to fund its net settlement obligation. What protects the other participants?",
          "options": [
            "Nothing at all",
            "Doubling the obligation",
            "Hope",
            "System default procedures, guarantees, collateral, or loss-sharing rules defined in advance"
          ],
          "answer": 3,
          "explanation": "Netting systems define default handling in advance: guarantees, collateral, and loss sharing protect survivors. These arrangements are part of system design and risk management. Hope is not a control.",
          "why_wrong": [
            "Default procedures exist precisely to protect participants.",
            "Doubling would worsen the shortfall.",
            "Hope does not cover settlement shortfalls.",
            ""
          ]
        },
        {
          "id": "pb-29-04",
          "domain": "operations",
          "chapter": "ch40",
          "question": "A reconciliation break is traced to an FX rate difference between systems. What is the fix?",
          "options": [
            "Ignore the difference",
            "Delete the FX entries",
            "Use a different rate every day",
            "Agree a single rate source and rounding rule, correct the entries, and fix the system using the wrong source"
          ],
          "answer": 3,
          "explanation": "FX breaks need one agreed rate source, timing, and rounding convention applied consistently. Entries are corrected and the faulty source fixed. Inconsistent rates cause perpetual breaks.",
          "why_wrong": [
            "Ignoring rate differences leaves breaks recurring.",
            "Deleting entries destroys the record.",
            "Daily rate changes without agreement worsen inconsistency.",
            ""
          ]
        },
        {
          "id": "pb-29-05",
          "domain": "operations",
          "chapter": "ch20",
          "question": "A payment settles but the ledger posting fails. What risk arises?",
          "options": [
            "The books misstate the position: funds moved but records do not reflect it, until the posting is recovered and reconciled",
            "No risk",
            "The payment is automatically reversed",
            "The customer is unaffected in all cases"
          ],
          "answer": 0,
          "explanation": "Settlement without posting creates a ledger gap that misstates balances and breaks reconciliation. Recovery must post correctly with audit, not duplicate. Posting failures need alerts and retry or manual recovery procedures.",
          "why_wrong": [
            "",
            "Unposted settlements misstate the books.",
            "Reversal is not automatic; recovery posting is needed.",
            "Customers can be affected through balances and statements."
          ]
        },
        {
          "id": "pb-29-06",
          "domain": "operations",
          "chapter": "ch40",
          "question": "A break ages past 60 days with no resolution. What governance action is required?",
          "options": [
            "Write it off silently",
            "Escalate to senior management, assess loss provisioning and control implications, and agree a resolution or approved write-off path",
            "Delete it from reports",
            "Reset the age to zero"
          ],
          "answer": 1,
          "explanation": "Long-aged breaks need senior escalation, loss assessment, and governed write-off approval if unrecoverable. Silent write-off, deletion, and age resets hide risk and breach controls. Ageing governance protects the bank.",
          "why_wrong": [
            "Silent write-off breaches controls.",
            "",
            "Deletion hides the break from oversight.",
            "Resetting age falsifies the report."
          ]
        },
        {
          "id": "pb-29-07",
          "domain": "clearing",
          "chapter": "ch77",
          "question": "A settlement system suffers an outage during the settlement window. What should the contingency plan cover?",
          "options": [
            "Nothing",
            "Permanent cancellation of all payments",
            "Extended windows, alternative settlement routes, communication to participants, and catch-up processing with reconciliation",
            "Ignoring the outage"
          ],
          "answer": 2,
          "explanation": "Contingency plans define how settlement completes after an outage: extended windows, fallbacks, communications, and catch-up with full reconciliation. Cancellation and ignorance would strand payments. Resilience planning is essential.",
          "why_wrong": [
            "Outages need contingency handling.",
            "Cancellation would strand valid payments.",
            "",
            "Ignoring outages leaves settlement incomplete."
          ]
        },
        {
          "id": "pb-29-08",
          "domain": "operations",
          "chapter": "ch40",
          "question": "Two payments with the same amount and date match incorrectly in reconciliation. What control prevents this?",
          "options": [
            "Amount-only matching",
            "No matching at all",
            "Matching on unique references plus amount and date, with manual review for ambiguous matches",
            "Matching on date only"
          ],
          "answer": 2,
          "explanation": "Unique references distinguish payments that share amount and date. Amount-only matching creates false matches. Controls must require reference matching and human review where references are missing or ambiguous.",
          "why_wrong": [
            "Amount-only matching causes the false match described.",
            "No matching removes the control entirely.",
            "",
            "Date-only matching is even weaker."
          ]
        },
        {
          "id": "pb-29-09",
          "domain": "operations",
          "chapter": "ch77",
          "question": "A liquidity shortfall delays RTGS settlement for several payments. What should treasury and operations do?",
          "options": [
            "Ignore the queue",
            "Cancel all queued payments",
            "Monitor the queue, fund the account, prioritise critical payments, and communicate revised timing to affected areas",
            "Double the payments to clear the queue"
          ],
          "answer": 2,
          "explanation": "Liquidity shortfalls need active queue management: funding, prioritisation, and communication. Cancellation and duplication worsen the position. Treasury and operations must coordinate under defined procedures.",
          "why_wrong": [
            "Ignoring queues lets delays grow.",
            "Cancellation abandons valid payments.",
            "",
            "Doubling worsens the liquidity shortage."
          ]
        },
        {
          "id": "pb-29-10",
          "domain": "operations",
          "chapter": "ch40",
          "question": "A BA is designing a break-resolution workflow. What must each break record include?",
          "options": [
            "The break type, age, owner, amount, references, investigation notes, and resolution with approval where needed",
            "Only the amount",
            "Only the date",
            "No detail at all"
          ],
          "answer": 0,
          "explanation": "Break records need full context for investigation, ageing, escalation, and audit. Amount or date alone cannot support resolution. Workflow design must capture ownership and evidence throughout.",
          "why_wrong": [
            "",
            "Amount alone does not explain or resolve a break.",
            "Date alone provides no investigation context.",
            "Detail is essential for control and audit."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "pb-30",
        "title": "Payments BA Test 30: End-to-End Applied Scenarios - BA in Action",
        "duration_minutes": 10,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "pb-30-01",
          "domain": "professional",
          "chapter": "ch29",
          "question": "A corporate client wants to migrate bulk salary payments from cheques to electronic transfers. What is the BA's first recommendation step?",
          "options": [
            "Analyse volumes, payee data quality, rail options, cutoffs, and reconciliation needs, then recommend a rail and file format with a migration plan",
            "Order more cheque books",
            "Send salaries by card",
            "Ignore payee data quality"
          ],
          "answer": 0,
          "explanation": "Migration advice needs evidence: volumes, data quality, rail fit, timing, and reconciliation. Cheques to electronic migration is a classic BA analysis task. Card payments and ignoring data quality would fail the need.",
          "why_wrong": [
            "",
            "More cheques continue the problem the client wants to solve.",
            "Cards are not the bulk salary rail.",
            "Payee data quality determines success or mass rejections."
          ]
        },
        {
          "id": "pb-30-02",
          "domain": "professional",
          "chapter": "ch29",
          "question": "A new instant payment product is proposed. The BA finds the fraud rules would block 30 percent of genuine payments. What should the BA do?",
          "options": [
            "Launch anyway",
            "Remove all fraud rules",
            "Raise the false-decline impact with fraud and product teams, tune rules with data, and agree risk appetite before launch",
            "Hide the finding"
          ],
          "answer": 2,
          "explanation": "High false declines harm customers and adoption, so fraud tuning must balance loss prevention with approval rates. Data-driven tuning and agreed risk appetite are needed. Launching blind or removing controls both fail.",
          "why_wrong": [
            "Launching with 30 percent false declines would harm customers.",
            "Removing controls invites fraud losses.",
            "",
            "Hiding findings breaks governance."
          ]
        },
        {
          "id": "pb-30-03",
          "domain": "messaging",
          "chapter": "ch29",
          "question": "A bank must support a new ISO 20022 version for cross-border payments in six months. What is the BA's critical path?",
          "options": [
            "Wait five months then start",
            "Impact-assess mapping, screening, reconciliation, and counterparties early, then sequence build, test, certification, and cutover with buffers",
            "Skip counterparty testing",
            "Assume no impact"
          ],
          "answer": 1,
          "explanation": "Version migration touches mapping, validation, screening, and counterparties, so early impact assessment and sequenced delivery with buffers are essential. Late starts and skipped testing cause failed cutovers.",
          "why_wrong": [
            "Late starts leave no time for testing and certification.",
            "",
            "Counterparty testing is essential for interbank changes.",
            "Version changes always need impact assessment."
          ]
        },
        {
          "id": "pb-30-04",
          "domain": "operations",
          "chapter": "ch29",
          "question": "A payment hub go-live is in two weeks and UAT shows the exception queue is unusable for operations. What should the BA recommend?",
          "options": [
            "Go live and train staff later",
            "Let customers handle exceptions",
            "Remove the exception queue",
            "Treat queue usability as a go-live blocker: fix the queue, retest with operations, and delay if needed rather than launching unworkable operations"
          ],
          "answer": 3,
          "explanation": "An unusable exception queue means operations cannot resolve failures, so go-live would strand payments. Fixing and retesting with operators is required, even if it delays launch. Removing the queue removes the control.",
          "why_wrong": [
            "Training cannot fix an unusable tool.",
            "Customers cannot operate internal exception queues.",
            "Removing the queue removes exception handling entirely.",
            ""
          ]
        },
        {
          "id": "pb-30-05",
          "domain": "professional",
          "chapter": "ch29",
          "question": "A stakeholder wants to add a payment feature that bypasses sanctions screening for speed. What is the BA response?",
          "options": [
            "Agree to bypass screening",
            "Bypass screening quietly",
            "Refuse the bypass, explain the legal obligation, and propose faster compliant screening designs instead",
            "Delay the discussion forever"
          ],
          "answer": 2,
          "explanation": "Sanctions screening is a legal obligation that cannot be bypassed for speed. The BA must refuse clearly and offer compliant alternatives, such as better data and faster screening. Quiet bypasses are serious breaches.",
          "why_wrong": [
            "Bypassing screening breaches the law.",
            "Quiet bypass is still a breach.",
            "",
            "Delay avoids the decision; a clear refusal with alternatives is needed."
          ]
        },
        {
          "id": "pb-30-06",
          "domain": "apis",
          "chapter": "ch29",
          "question": "A fintech partner wants API access to initiate payments for its users. What must the BA confirm before design starts?",
          "options": [
            "Only the partner logo",
            "Nothing; APIs need no governance",
            "Regulatory status, consent model, authentication, liability, limits, and support arrangements for the partnership",
            "That passwords will be shared"
          ],
          "answer": 2,
          "explanation": "Third-party initiation needs regulatory, consent, security, liability, and operational clarity before design. Logo and password sharing are irrelevant or prohibited. Governance first prevents unsafe integration.",
          "why_wrong": [
            "Branding does not establish regulatory or security fitness.",
            "APIs moving money need strong governance.",
            "",
            "Password sharing is prohibited."
          ]
        },
        {
          "id": "pb-30-07",
          "domain": "operations",
          "chapter": "ch29",
          "question": "A major incident stops all Faster Payments-style instant payments for an hour. What is the BA's role in the aftermath?",
          "options": [
            "Support the post-incident review: timeline, affected payments, customer impact, root cause, and actions to prevent recurrence",
            "No role",
            "Blame the vendor publicly",
            "Delete the incident record"
          ],
          "answer": 0,
          "explanation": "Post-incident reviews need business analysis: what happened, which payments were affected, customer impact, and preventive actions. BAs contribute process and requirements insight. Blame and deletion prevent learning.",
          "why_wrong": [
            "",
            "BAs play a key role in reviews and remediation.",
            "Blame without evidence prevents learning.",
            "Deleting records destroys learning and audit."
          ]
        },
        {
          "id": "pb-30-08",
          "domain": "professional",
          "chapter": "ch29",
          "question": "A programme has conflicting requirements from retail and corporate teams for one hub feature. How should the BA resolve it?",
          "options": [
            "Build two conflicting features",
            "Facilitate a decision with evidence on volumes, risk, and cost, documenting the agreed behaviour and any agreed variation by segment",
            "Pick the louder team silently",
            "Build neither"
          ],
          "answer": 1,
          "explanation": "Segment conflicts need facilitated decisions with evidence and documented outcomes, including justified segment variations. Silent choices and dual conflicting builds create inconsistency. Facilitation is core BA work.",
          "why_wrong": [
            "Conflicting features cannot coexist in one flow.",
            "",
            "Volume of voice is not evidence.",
            "Building neither fails both segments."
          ]
        },
        {
          "id": "pb-30-09",
          "domain": "compliance",
          "chapter": "ch29",
          "question": "A new payment corridor opens to a higher-risk country. What must the BA ensure is in place before launch?",
          "options": [
            "Nothing extra",
            "No monitoring at all",
            "Lower controls for speed",
            "Enhanced due diligence, screening, monitoring, limits, and staff training appropriate to the corridor risk"
          ],
          "answer": 3,
          "explanation": "Higher-risk corridors need proportionate enhanced controls: due diligence, screening tuning, monitoring, limits, and training. Lowering controls for speed invites financial crime risk. Risk-based design is a regulatory expectation.",
          "why_wrong": [
            "Higher risk needs enhanced controls, not nothing.",
            "Monitoring is essential for higher-risk corridors.",
            "Lower controls increase financial crime exposure.",
            ""
          ]
        },
        {
          "id": "pb-30-10",
          "domain": "professional",
          "chapter": "ch29",
          "question": "A BA is asked to summarise what makes a payments BA effective. Which summary is best?",
          "options": [
            "Knows only technology",
            "Avoids all detail",
            "Knows only stakeholder names",
            "Combines payments domain knowledge, requirements craft, stakeholder facilitation, data analysis, and control awareness to deliver safe, working payment change"
          ],
          "answer": 3,
          "explanation": "Effective payments BAs blend domain knowledge with analysis, facilitation, data skills, and control awareness. Technology-only or names-only knowledge cannot deliver safe payment change. Detail matters because payment errors move real money.",
          "why_wrong": [
            "Technology alone misses domain, process, and control needs.",
            "Avoiding detail causes payment defects.",
            "Names alone do not deliver change.",
            ""
          ]
        }
      ]
    }
  ]
};
