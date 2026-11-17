/* Payment Failure Investigation Lab.
   Seven deterministic cases, one per failure type. All data is synthetic
   and for education only.
   Scoring per case: each evidence item examined once earns 5 points
   (4 items, 20 points max); each correct decision earns 20 points.
   Total per case is 60 points. Best score is saved in this browser only. */
(function(){
  "use strict";
  var FEATURE_ID = "investigation-lab";
  var TOTAL = 60;
  var EVIDENCE_POINTS = 5;
  var DECISION_POINTS = 20;

  var CASES = [
    {
      id: "validation", code: "LAB-01", title: "Validation failure: rejected pacs.008",
      difficulty: "Easy", tagClass: "",
      symptom: "A pacs.008 is rejected at validation before it reaches screening or clearing.",
      amount: "EUR 18,400.00",
      scenario: "A corporate customer sent a pacs.008 credit transfer. The payment never left validation. Your job is to find which field failed, why the instruction cannot proceed as it stands, and what to do with it.",
      txn: [
        ["Reference", "LAB-01-2026-0201"],
        ["EndToEndId", "ALDER-2026-1106-0201"],
        ["UETR", "e1a2b3c4-5d6e-4f70-8a91-2b3c4d5e6f70"],
        ["Amount", "EUR 18,400.00"],
        ["Debtor", "Alder Consulting BV, Rotterdam, Netherlands"],
        ["Creditor", "Fournier et Cie SARL, Lille, France"],
        ["Rail", "SEPA Credit Transfer, pacs.008"],
        ["Status", "RJCT, rejected at validation"],
        ["Value date", "06 Nov 2026"]
      ],
      timeline: [
        {time: "08:10:02", title: "Instruction received", desc: "pacs.008 received from Alder Consulting BV for EUR 18,400.00.", cls: ""},
        {time: "08:10:04", title: "Format check passed", desc: "Message structure and character set are valid.", cls: ""},
        {time: "08:10:05", title: "Field validation failed", desc: "Creditor account IBAN fails the check-digit validation. Instruction rejected.", cls: "bad"},
        {time: "08:10:05", title: "Status set to RJCT", desc: "No debit posted. No onward instruction sent to clearing.", cls: "warn"},
        {time: "08:25:00", title: "Debtor enquiry", desc: "Debtor asks why the supplier has not been paid.", cls: "warn"}
      ],
      logs: [
        "08:10:02 INFO  OPS-GW  pacs.008 received  EndToEndId=ALDER-2026-1106-0201",
        "08:10:04 INFO  VALID   message structure OK  charset OK",
        "08:10:05 ERROR VALID   IBAN check-digit failure  field=creditor account  IBAN=FR1420041010050500013M0260*",
        "08:10:05 ERROR VALID   rejection code=BE01  reason=inconsistent with end customer",
        "08:10:05 INFO  OPS     status=RJCT  debit=not posted  onward instruction=not sent",
        "08:10:05 INFO  OPS     case opened  case=VAL-2026-1044  action=repair required"
      ],
      evidence: [
        {id: "validation-report", label: "Open validation report", fact: "Validation report: every field passed except the creditor account IBAN, which fails the check-digit (mod-97) validation. The IBAN as submitted cannot be a valid account number. Note: the last characters shown in the log are illustrative, the failure is in the check digits."},
        {id: "debtor-account", label: "Check debtor account", fact: "Debtor account check: the debtor account is open and in good standing, with sufficient funds for EUR 18,400.00. The fault is not on the debtor side."},
        {id: "creditor-details", label: "Compare creditor details", fact: "Creditor details check: the creditor name, address and the invoice on file all match. Only the IBAN differs from the account number on the creditor invoice, by two transposed characters."},
        {id: "clearing-check", label: "Check clearing status", fact: "Clearing check: the instruction never reached clearing. There is no clearing record and no pacs.002, because the rejection happened at validation inside the bank."}
      ],
      decisions: [
        {id: "d1", q: "What is the most likely root cause of this failure?",
         options: [
          {t: "The creditor IBAN fails check-digit validation", correct: true, why: "Correct. The validation report shows the creditor IBAN fails the check-digit validation, so the account number cannot be valid."},
          {t: "The debtor account has insufficient funds", correct: false, why: "Wrong. The debtor account is open and holds sufficient funds. No debit was even attempted, the failure is in the creditor IBAN."},
          {t: "The payment was blocked by sanctions screening", correct: false, why: "Wrong. The instruction never reached screening. It was rejected at validation, before screening runs."},
          {t: "The clearing system rejected the payment", correct: false, why: "Wrong. Clearing never saw this instruction. The rejection happened at validation inside the bank, with no pacs.002."}
         ]},
        {id: "d2", q: "What is the appropriate next step?",
         options: [
          {t: "Correct the IBAN with the originator and resubmit as a new instruction", correct: true, why: "Correct. The IBAN must be corrected at source, then a new instruction with a new reference is sent. The rejected instruction stays RJCT."},
          {t: "Retry the same instruction unchanged", correct: false, why: "Wrong. The same IBAN fails the same check-digit validation every time. Retrying changes nothing."},
          {t: "Send the payment to clearing manually to bypass validation", correct: false, why: "Wrong. Validation exists to stop invalid instructions. Bypassing it would send an unpayable instruction to clearing."},
          {t: "Cancel the payment and close the case", correct: false, why: "Wrong. The underlying obligation still exists. The supplier still needs to be paid with the corrected IBAN."}
         ]}
      ],
      reference: {
        cause: "The creditor IBAN fails check-digit validation, so the pacs.008 is rejected at validation with reason code BE01.",
        nextStep: "Correct the IBAN with the originator and resubmit as a new instruction with a new reference.",
        explanation: "Validation checks the instruction before anything else happens. A failed IBAN check digit means the account number cannot be valid, so the instruction cannot proceed. The debtor account, the screening check and clearing are all ruled out by the evidence: the debtor account is in good standing, screening never ran, and clearing never received the instruction. The fix must happen at the source, because only the originator can confirm the correct IBAN, and the corrected payment needs a new reference so it is not confused with the rejected one."
      }
    },
    {
      id: "account", code: "LAB-02", title: "Account checks failure: closed debtor account",
      difficulty: "Easy", tagClass: "",
      symptom: "A payment fails at debtor account validation. The account cannot be debited.",
      amount: "GBP 27,600.00",
      scenario: "A standing payment instruction was submitted for a regular supplier payment. It failed at the debtor account check. Your job is to find out why the account cannot be debited and what to do instead of retrying it.",
      txn: [
        ["Reference", "LAB-02-2026-0202"],
        ["EndToEndId", "BRACKEN-2026-1106-0202"],
        ["UETR", "f2b3c4d5-6e7f-4a81-9b02-3c4d5e6f7a81"],
        ["Amount", "GBP 27,600.00"],
        ["Debtor", "Brackenfield Holdings Ltd, Leeds, United Kingdom"],
        ["Creditor", "Cedar Logistics Ltd, Manchester, United Kingdom"],
        ["Rail", "Faster Payments, pacs.008"],
        ["Status", "RJCT, rejected at account validation"],
        ["Value date", "06 Nov 2026"]
      ],
      timeline: [
        {time: "09:30:11", title: "Instruction received", desc: "Payment instruction received for GBP 27,600.00 from Brackenfield Holdings Ltd.", cls: ""},
        {time: "09:30:12", title: "Format validation passed", desc: "Message format and fields are valid.", cls: ""},
        {time: "09:30:13", title: "Debtor account check failed", desc: "Debtor account is closed. Debit cannot be posted.", cls: "bad"},
        {time: "09:30:13", title: "Status set to RJCT", desc: "No debit posted. No onward instruction sent.", cls: "warn"},
        {time: "09:48:00", title: "Creditor enquiry", desc: "Creditor asks why the regular payment has not arrived.", cls: "warn"}
      ],
      logs: [
        "09:30:11 INFO  OPS-GW  instruction received  EndToEndId=BRACKEN-2026-1106-0202",
        "09:30:12 INFO  VALID   format and fields OK",
        "09:30:13 ERROR ACCT    debtor account closed  acct=GB29NWBK60161331926819  status=CLOSED",
        "09:30:13 ERROR ACCT    debit refused  reason=AC04  closed account",
        "09:30:13 INFO  OPS     status=RJCT  debit=not posted  onward instruction=not sent",
        "09:30:13 INFO  OPS     case opened  case=ACC-2026-2207  action=debtor contact required"
      ],
      evidence: [
        {id: "account-status", label: "Check debtor account status", fact: "Account status: the debtor account was closed on 28 Oct 2026 after the customer moved its operating account to a new sort code. The account record shows status CLOSED, so no debit can be posted against it."},
        {id: "validation-report", label: "Open validation report", fact: "Validation report: the instruction format, amount, currency and creditor details are all valid. The only failure is the debtor account check."},
        {id: "funds-check", label: "Check available funds", fact: "Funds check: no funds check could run, because the account is closed. This is not an insufficient funds case. The new operating account, which the customer opened on 28 Oct 2026, holds sufficient funds."},
        {id: "creditor-account", label: "Check creditor account", fact: "Creditor account check: the creditor account is open and valid. The fault is entirely on the debtor side."}
      ],
      decisions: [
        {id: "d1", q: "What is the most likely root cause of this failure?",
         options: [
          {t: "The debtor account is closed", correct: true, why: "Correct. The account status record shows the debtor account closed on 28 Oct 2026, and the debit was refused with reason AC04."},
          {t: "The debtor account has insufficient funds", correct: false, why: "Wrong. No funds check ran, because the account is closed. The customer has sufficient funds in its new operating account."},
          {t: "The creditor account is closed", correct: false, why: "Wrong. The creditor account is open and valid. The failure is on the debtor account."},
          {t: "The payment was rejected at clearing", correct: false, why: "Wrong. Clearing never saw the instruction. It was rejected at the debtor account check inside the bank."}
         ]},
        {id: "d2", q: "What is the appropriate next step?",
         options: [
          {t: "Contact the debtor to confirm the correct debit account; do not retry against the closed account", correct: true, why: "Correct. Only the debtor can confirm which account should be debited now. Retrying the closed account will fail again."},
          {t: "Retry the payment against the same debtor account", correct: false, why: "Wrong. The account is closed. Every retry against it will be refused with the same result."},
          {t: "Debit the creditor account instead", correct: false, why: "Wrong. The creditor is the recipient, not the payer. Debiting the creditor would take money from the wrong party."},
          {t: "Hold the payment and wait for the account to reopen", correct: false, why: "Wrong. A closed account does not reopen on its own. The debtor must confirm the replacement account."}
         ]}
      ],
      reference: {
        cause: "The debtor account is closed, so the debit is refused at the account check with reason code AC04.",
        nextStep: "Contact the debtor to confirm the correct debit account, then create a new instruction against that account. Do not retry against the closed account.",
        explanation: "The account check runs before any money moves. A closed account cannot be debited, whatever the balance was before closure. The evidence rules out the other options: the instruction format is valid, the creditor account is open, and no funds check could run on a closed account. Retrying the same account, waiting for it to reopen, or debiting the creditor would all fail or take money from the wrong party. The only fix is a confirmed replacement debit account from the debtor."
      }
    },
    {
      id: "screening", code: "LAB-03", title: "Screening hold: possible sanctions name match",
      difficulty: "Medium", tagClass: "amber",
      symptom: "A payment is held after sanctions screening returns a possible name match.",
      amount: "USD 63,900.00",
      scenario: "A cross-border payment reached screening and stopped. The funds are held and the creditor has not been paid. Your job is to work out what the screening result really means and who must decide what happens next.",
      txn: [
        ["Reference", "LAB-03-2026-0203"],
        ["EndToEndId", "HARLAND-2026-1106-0203"],
        ["UETR", "a3c4d5e6-7f80-4b92-ac13-4d5e6f7a8b92"],
        ["Amount", "USD 63,900.00"],
        ["Debtor", "Harland Exports Ltd, Bristol, United Kingdom"],
        ["Creditor", "Meridian Trading LLC, Dubai, United Arab Emirates"],
        ["Rail", "SWIFT gpi correspondent banking, pacs.008"],
        ["Status", "ACSP, held after screening"],
        ["Value date", "06 Nov 2026"]
      ],
      timeline: [
        {time: "10:05:22", title: "Instruction received", desc: "pacs.008 received from Harland Exports Ltd for USD 63,900.00.", cls: ""},
        {time: "10:05:25", title: "Validation passed", desc: "Format, fields and accounts all passed validation.", cls: ""},
        {time: "10:05:26", title: "Debtor account debited", desc: "USD 63,900.00 debited and held in the settlement account.", cls: ""},
        {time: "10:05:29", title: "Screening hit", desc: "Possible name match on the creditor name. Payment held automatically.", cls: "bad"},
        {time: "10:05:30", title: "Case opened", desc: "Case SCR-2026-9031 opened in the compliance review queue.", cls: "warn"},
        {time: "10:40:00", title: "Debtor enquiry", desc: "Debtor asks why the supplier has not been paid.", cls: "warn"}
      ],
      logs: [
        "10:05:22 INFO  OPS-GW  pacs.008 received  EndToEndId=HARLAND-2026-1106-0203",
        "10:05:25 INFO  VALID   all checks passed",
        "10:05:26 INFO  LEDGER  debit posted  acct=GB29NWBK60161331926819  USD 63900.00  held in settlement account",
        "10:05:29 WARN  SCREEN  possible match  list=consolidated sanctions  score=81  field=creditor name",
        "10:05:29 WARN  SCREEN  match type=name similarity only  confirmed=false",
        "10:05:30 INFO  OPS     status=ACSP  hold=SCREENING_REVIEW  onward instruction=not sent",
        "10:05:30 INFO  OPS     case opened  case=SCR-2026-9031  queue=compliance review"
      ],
      evidence: [
        {id: "screening-result", label: "Query screening result", fact: "Screening result: a possible name match against a sanctions list entry, score 81, on the creditor name only. It is a similarity match, not a confirmed match. No other field matched, and the creditor address and registration details do not match the listed entry."},
        {id: "ledger", label: "Check ledger", fact: "Ledger finding: the debtor account was debited USD 63,900.00 and the funds are held in the settlement account. No onward credit has been posted, so the money has not left the bank."},
        {id: "payment-details", label: "Review payment details", fact: "Payment details finding: the instruction is complete and valid. Amount, currency, debtor and creditor accounts and value date are all consistent. The hold is caused by the screening result, not by the payment data."},
        {id: "correspondent", label: "Check correspondent status", fact: "Correspondent check: the correspondent bank has not received this payment. No onward instruction was sent, because the payment was held before clearing."}
      ],
      decisions: [
        {id: "d1", q: "What is the most likely root cause of this failure?",
         options: [
          {t: "A name match against a sanctions list that needs manual review", correct: true, why: "Correct. Screening returned a possible name match, score 81, on the creditor name only. It is a similarity match, not a confirmed match, so a person must review it."},
          {t: "The creditor is confirmed to be on a sanctions list", correct: false, why: "Wrong. The match is possible, not confirmed. The address and registration details do not match the listed entry. Only compliance can confirm a match."},
          {t: "The debtor account has insufficient funds", correct: false, why: "Wrong. The debtor account was debited in full and the funds are held in the settlement account."},
          {t: "The payment details are invalid", correct: false, why: "Wrong. Validation passed and the payment details are complete and consistent. The hold is the screening result."}
         ]},
        {id: "d2", q: "What is the appropriate next step?",
         options: [
          {t: "Escalate to compliance with the match details; do not release or cancel unilaterally", correct: true, why: "Correct. A possible sanctions match must be reviewed by compliance. Only compliance can clear or confirm it, and the payment must stay held until then."},
          {t: "Release the payment so the supplier is paid on time", correct: false, why: "Wrong. Releasing a payment with an unresolved possible sanctions match could breach sanctions controls."},
          {t: "Cancel the payment and return the funds to the debtor", correct: false, why: "Wrong. The match is only possible, not confirmed. Cancelling now would end a payment that may be perfectly legitimate."},
          {t: "Ask the debtor to send the payment again with a different creditor name", correct: false, why: "Wrong. Changing the creditor name to avoid screening is not acceptable, and a second instruction would hit the same check."}
         ]}
      ],
      reference: {
        cause: "A possible name match against a sanctions list entry, score 81 on the creditor name only, which needs a manual compliance review. It is a similarity match, not a confirmed match.",
        nextStep: "Escalate to compliance with the match details and case reference SCR-2026-9031. Keep the payment held and do not release or cancel it unilaterally.",
        explanation: "Screening flags possible matches for human review; it does not decide them. The score, the matched field and the non-matching address and registration details all point to a similarity match that needs a person to decide. The funds are safe in the settlement account, so there is no urgency that justifies releasing the payment, and cancelling it would harm a possibly legitimate payment. Only compliance can clear the match and let the payment proceed, or confirm it and decide the next step."
      }
    },
    {
      id: "orchestration", code: "LAB-04", title: "Orchestration failure: wrong clearing channel",
      difficulty: "Medium", tagClass: "amber",
      symptom: "A same-day EUR payment was sent to a next-day batch instead of the instant rail.",
      amount: "EUR 85,000.00",
      scenario: "A customer paid for same-day value, but the payment went into a next-day batch and will miss the deadline. Your job is to find where the routing decision went wrong and what can still be done about the instruction.",
      txn: [
        ["Reference", "LAB-04-2026-0204"],
        ["EndToEndId", "KESWICK-2026-1106-0204"],
        ["UETR", "b4d5e6f7-8091-4ca3-bd24-5e6f7a8b9ca3"],
        ["Amount", "EUR 85,000.00"],
        ["Debtor", "Keswick Manufacturing GmbH, Stuttgart, Germany"],
        ["Creditor", "Vega Components SpA, Milan, Italy"],
        ["Rail", "SEPA Credit Transfer batch (next-day), should have been instant"],
        ["Status", "ACSP, accepted, settlement in process, wrong channel"],
        ["Value date", "06 Nov 2026, same-day requested"]
      ],
      timeline: [
        {time: "11:12:40", title: "Instruction received", desc: "pacs.008 received for EUR 85,000.00 with same-day value requested.", cls: ""},
        {time: "11:12:42", title: "Validation and screening passed", desc: "All checks passed. Payment sent to the orchestration layer.", cls: ""},
        {time: "11:12:43", title: "Wrong rail selected", desc: "Orchestration selected the next-day SEPA batch channel instead of the instant rail.", cls: "bad"},
        {time: "11:12:45", title: "Payment queued in batch", desc: "Instruction queued for the next-day batch. Same-day value is no longer possible on this instruction.", cls: "warn"},
        {time: "11:30:00", title: "Debtor enquiry", desc: "Debtor asks why the same-day payment has not arrived.", cls: "warn"}
      ],
      logs: [
        "11:12:40 INFO  OPS-GW  pacs.008 received  EndToEndId=KESWICK-2026-1106-0204  value-date=same-day",
        "11:12:42 INFO  VALID   all checks passed  screening=clear",
        "11:12:43 WARN  ORCH    rail selected=SEPA batch next-day  expected=instant rail",
        "11:12:43 WARN  ORCH    rule matched=ROUTE-EUR-STD  rule should have matched=ROUTE-EUR-SAMEDAY",
        "11:12:45 INFO  CLEAR   instruction queued in next-day batch  batch=BATCH-2026-1107-01",
        "11:12:45 INFO  OPS     status=ACSP  channel=next-day batch  same-day value=no longer possible"
      ],
      evidence: [
        {id: "routing-decision", label: "Inspect routing decision", fact: "Routing decision: the orchestration layer matched rule ROUTE-EUR-STD, which sends EUR payments to the next-day batch. The instruction requested same-day value, which should have matched rule ROUTE-EUR-SAMEDAY and the instant rail."},
        {id: "instruction", label: "Review original instruction", fact: "Original instruction: same-day value was clearly requested, the amount and currency are eligible for the instant rail, and the cut-off had not passed. The instruction itself is correct."},
        {id: "batch-status", label: "Check batch status", fact: "Batch status: the instruction sits in batch BATCH-2026-1107-01, queued for next-day settlement. It has not settled and no funds have reached the creditor."},
        {id: "rule-change", label: "Check recent rule changes", fact: "Rule history: rule ROUTE-EUR-SAMEDAY was edited on 04 Nov 2026 and its value-date condition was narrowed, so same-day instructions now fall through to the standard rule. The change was not tested against same-day cases."}
      ],
      decisions: [
        {id: "d1", q: "What is the most likely root cause of this failure?",
         options: [
          {t: "The orchestration layer selected the wrong rail for the currency and value date", correct: true, why: "Correct. The orchestration layer matched the standard next-day rule instead of the same-day rule, so a same-day EUR payment went to the next-day batch."},
          {t: "The creditor account is incorrect", correct: false, why: "Wrong. The creditor account is valid and was never the problem. The payment is in the wrong channel, not rejected for an account error."},
          {t: "The payment was rejected at clearing", correct: false, why: "Wrong. Clearing accepted the instruction into the batch. The fault is the channel choice made before clearing."},
          {t: "The debtor requested next-day value", correct: false, why: "Wrong. The instruction clearly requested same-day value. The debtor asked for the faster service and did not get it."}
         ]},
        {id: "d2", q: "What is the appropriate next step?",
         options: [
          {t: "Correct the routing rule and re-route the instruction; check whether the original can be recalled", correct: true, why: "Correct. Fix the rule so it does not happen again, and check whether the queued instruction can be recalled from the batch so a corrected same-day instruction can be sent."},
          {t: "Leave the payment in the next-day batch and say nothing", correct: false, why: "Wrong. The customer paid for same-day value and will miss its deadline. The error needs action and an honest update."},
          {t: "Retry the same instruction through the same orchestration layer", correct: false, why: "Wrong. The same rule would route it to the next-day batch again, and could create a duplicate payment."},
          {t: "Cancel the creditor account", correct: false, why: "Wrong. The creditor account is valid. Cancelling it would not fix the routing rule or the queued instruction."}
         ]}
      ],
      reference: {
        cause: "The orchestration layer selected the wrong rail: a same-day EUR payment was matched to the standard next-day batch rule instead of the same-day instant rail rule.",
        nextStep: "Correct the routing rule, check whether the original instruction can be recalled from the batch, and re-route a corrected instruction. Tell the debtor what happened.",
        explanation: "The instruction was correct and eligible for same-day value, and the cut-off had not passed, so the fault is in the routing decision, not the payment data. A rule edit on 04 Nov 2026 narrowed the same-day condition, which explains why same-day instructions now fall through to the standard rule. Fixing the rule stops the next payment going wrong, but the queued instruction still needs handling: check whether it can be recalled from the batch before sending a corrected instruction, or the creditor could be paid twice."
      }
    },
    {
      id: "routing", code: "LAB-05", title: "Routing failure: wrong intermediary bank",
      difficulty: "Hard", tagClass: "red",
      symptom: "A cross-border USD payment went to the wrong intermediary bank.",
      amount: "USD 142,500.00",
      scenario: "A cross-border payment was sent through an intermediary that should no longer be used for this corridor. Your job is to find which routing entry sent it there and confirm whether the money settled at the wrong bank.",
      txn: [
        ["Reference", "LAB-05-2026-0205"],
        ["EndToEndId", "THORNHILL-2026-1106-0205"],
        ["UETR", "c5e6f7a8-9102-4db4-ce35-6f7a8b9c0db4"],
        ["Amount", "USD 142,500.00"],
        ["Debtor", "Thornhill Commodities Ltd, London, United Kingdom"],
        ["Creditor", "Pacific Rim Foods Inc, Seattle, United States"],
        ["Rail", "SWIFT gpi correspondent banking, MT103 / pacs.008"],
        ["Status", "ACSP, sent to wrong intermediary, settlement unconfirmed"],
        ["Value date", "06 Nov 2026"]
      ],
      timeline: [
        {time: "12:20:15", title: "Instruction received", desc: "pacs.008 received for USD 142,500.00 to a United States creditor.", cls: ""},
        {time: "12:20:18", title: "Validation and screening passed", desc: "All checks passed. Payment sent to the routing layer.", cls: ""},
        {time: "12:20:19", title: "Intermediary selected", desc: "Routing table selected intermediary BIC OLDXUS33, which was replaced in March 2026.", cls: "bad"},
        {time: "12:20:22", title: "Instruction sent onward", desc: "MT103 sent to the old intermediary. Settlement at the intended bank is unconfirmed.", cls: "warn"},
        {time: "12:55:00", title: "Creditor enquiry", desc: "Creditor reports the payment has not arrived.", cls: "warn"}
      ],
      logs: [
        "12:20:15 INFO  OPS-GW  pacs.008 received  EndToEndId=THORNHILL-2026-1106-0205",
        "12:20:18 INFO  VALID   all checks passed  screening=clear",
        "12:20:19 WARN  ROUTE   intermediary selected BIC=OLDXUS33  corridor=GBP-USD",
        "12:20:19 WARN  ROUTE   routing table entry last updated=14 Jan 2026  replacement BIC=NEWXUS33 effective Mar 2026",
        "12:20:22 INFO  SWIFT   MT103 sent  intermediary=OLDXUS33  UETR=c5e6f7a8-9102-4db4-ce35-6f7a8b9c0db4",
        "12:20:22 INFO  OPS     status=ACSP  settlement at intended bank=unconfirmed"
      ],
      evidence: [
        {id: "routing-table", label: "Inspect routing table", fact: "Routing table: the GBP to USD corridor entry still lists intermediary BIC OLDXUS33 and was last updated on 14 Jan 2026. The replacement intermediary BIC NEWXUS33 took effect in March 2026 but was never entered for this corridor."},
        {id: "mt103", label: "Review MT103 sent", fact: "MT103 review: the message was sent to OLDXUS33, the old intermediary. The creditor details, amount and currency on the message are correct. Only the intermediary is wrong."},
        {id: "settlement-check", label: "Check settlement status", fact: "Settlement check: no settlement confirmation has been received from the intended bank, and the new intermediary NEWXUS33 has no record of this payment. The payment has not settled at the intended bank."},
        {id: "intermediary-reply", label: "Check intermediary reply", fact: "Intermediary reply: the old intermediary acknowledges receipt of the MT103 but has not confirmed onward settlement. The funds position with that bank must be confirmed before any further action."}
      ],
      decisions: [
        {id: "d1", q: "What is the most likely root cause of this failure?",
         options: [
          {t: "An outdated correspondent BIC in the routing table", correct: true, why: "Correct. The routing table still lists the old intermediary BIC OLDXUS33, replaced by NEWXUS33 in March 2026, and the payment was sent to the old bank."},
          {t: "The creditor account is incorrect", correct: false, why: "Wrong. The creditor details on the MT103 are correct. The fault is the intermediary the payment was sent through."},
          {t: "The payment was blocked by sanctions screening", correct: false, why: "Wrong. Screening passed before routing. The payment was sent onward, to the wrong intermediary."},
          {t: "The debtor account has insufficient funds", correct: false, why: "Wrong. The debtor account was debited in full and the instruction was sent onward. Funds are not the problem."}
         ]},
        {id: "d2", q: "What is the appropriate next step?",
         options: [
          {t: "Update the routing table and re-route; confirm the payment did not settle at the wrong bank", correct: true, why: "Correct. Fix the routing entry first, then confirm with the old intermediary whether the funds settled there or can be returned, before sending a corrected instruction."},
          {t: "Send the payment again to the same intermediary", correct: false, why: "Wrong. The intermediary is outdated. Sending it again would repeat the same routing error and could pay twice."},
          {t: "Tell the creditor the payment has settled", correct: false, why: "Wrong. Settlement at the intended bank is unconfirmed. Saying it settled would mislead the creditor."},
          {t: "Change the creditor account details", correct: false, why: "Wrong. The creditor details are correct. Changing them does not fix the routing table or recover the misrouted payment."}
         ]}
      ],
      reference: {
        cause: "An outdated correspondent BIC in the routing table: the GBP to USD corridor still listed OLDXUS33, replaced by NEWXUS33 in March 2026.",
        nextStep: "Update the routing table to NEWXUS33, confirm with the old intermediary whether the payment settled there or can be returned, then re-route a corrected instruction.",
        explanation: "The payment data is correct and screening passed, so the fault is the routing entry, which had not been updated since January 2026. Because the MT103 was actually sent to the old intermediary, the first job is to establish the funds position there: if it settled, recovery is needed; if it is still held, it may be returnable. Only after that position is confirmed should a corrected instruction be sent, or the creditor could be paid twice. Updating the table stops the next payment on this corridor going to the wrong bank."
      }
    },
    {
      id: "clearing", code: "LAB-06", title: "Clearing failure: SEPA rejection AC01",
      difficulty: "Medium", tagClass: "amber",
      symptom: "A SEPA credit transfer is rejected at clearing with reason code AC01.",
      amount: "EUR 120,000.00",
      scenario: "A large SEPA credit transfer was rejected at clearing. The clearing system sent back a pacs.002 with a rejection reason code. Your job is to read the rejection, find the exact fault, and choose the repair that gets the payment to the creditor.",
      txn: [
        ["Reference", "LAB-06-2026-0206"],
        ["EndToEndId", "BAVARIA-2026-1106-0206"],
        ["UETR", "d6f7a8b9-a213-4ec5-df46-7a8b9c0d1ec5"],
        ["Amount", "EUR 120,000.00"],
        ["Debtor", "Bavaria Maschinen GmbH, Munich, Germany"],
        ["Creditor", "Atelier Durand SARL, Lyon, France"],
        ["Rail", "SEPA Credit Transfer, pacs.008, pacs.002 rejection"],
        ["Status", "RJCT, rejected at clearing, reason code AC01"],
        ["Value date", "06 Nov 2026"]
      ],
      timeline: [
        {time: "13:20:03", title: "Instruction received", desc: "pacs.008 received from Bavaria Maschinen GmbH for EUR 120,000.00.", cls: ""},
        {time: "13:20:06", title: "Validation and screening passed", desc: "Format checks and screening both passed. Payment sent to clearing.", cls: ""},
        {time: "13:21:40", title: "Clearing rejection", desc: "pacs.002 received from clearing with status RJCT and reason code AC01.", cls: "bad"},
        {time: "13:21:41", title: "Funds not settled", desc: "No settlement took place. The debtor account was not finally debited for settlement.", cls: "warn"},
        {time: "13:35:00", title: "Debtor enquiry", desc: "Debtor asks why the supplier has not been paid and whether to send it again.", cls: "warn"}
      ],
      logs: [
        "13:20:03 INFO  OPS-GW  pacs.008 received  EndToEndId=BAVARIA-2026-1106-0206",
        "13:20:06 INFO  VALID   all checks passed  screening=clear",
        "13:20:09 INFO  CLEAR   instruction sent to clearing  scheme=SEPA",
        "13:21:40 ERROR CLEAR   pacs.002 received  status=RJCT  reason=AC01",
        "13:21:40 ERROR CLEAR   reason text=incorrect account number  field=creditor account",
        "13:21:41 INFO  LEDGER  settlement not posted  funds remain with debtor bank",
        "13:21:41 INFO  OPS     case opened  case=CLR-2026-5521  action=repair required"
      ],
      evidence: [
        {id: "pacs002", label: "Read pacs.002 rejection", fact: "pacs.002 finding: status RJCT, reason code AC01, reason text incorrect account number. The rejection came from clearing and names the creditor account as the fault."},
        {id: "account-check", label: "Validate creditor account", fact: "Account check: the creditor account number fails the clearing account check. One character differs from the account number on the creditor invoice. The rest of the instruction is valid."},
        {id: "ledger", label: "Check ledger", fact: "Ledger finding: no settlement was posted and the funds did not leave the debtor bank. The payment can be repaired and resubmitted without recovering money first."},
        {id: "creditor-confirm", label: "Contact creditor", fact: "Creditor confirmation: Atelier Durand confirms the account number on the instruction has a transposed digit. They provide the corrected account number in writing."}
      ],
      decisions: [
        {id: "d1", q: "What is the most likely root cause of this failure?",
         options: [
          {t: "The creditor account number is incorrect (AC01)", correct: true, why: "Correct. The pacs.002 gives reason code AC01, incorrect account number, and names the creditor account as the fault."},
          {t: "The debtor account has insufficient funds", correct: false, why: "Wrong. Insufficient funds is a different reason code. This rejection is AC01, and no settlement was attempted."},
          {t: "The payment was blocked by sanctions screening", correct: false, why: "Wrong. Screening passed before clearing. The rejection came from clearing, not from screening."},
          {t: "The payment is a duplicate instruction", correct: false, why: "Wrong. There is no duplicate here. The pacs.002 gives AC01, not a duplicate reason."}
         ]},
        {id: "d2", q: "What is the appropriate next step?",
         options: [
          {t: "Repair the creditor account details and resubmit as a new instruction", correct: true, why: "Correct. Fix the account number with the creditor, then send a new instruction with the corrected details and a new reference."},
          {t: "Retry the same instruction unchanged", correct: false, why: "Wrong. The same instruction carries the same incorrect account number and would be rejected again with AC01."},
          {t: "Cancel the payment and do nothing", correct: false, why: "Wrong. The underlying obligation still exists. The supplier still needs to be paid with corrected details."},
          {t: "Change the amount and resubmit", correct: false, why: "Wrong. The amount is not the fault. Changing it does not fix the account number and would pay the wrong amount."}
         ]}
      ],
      reference: {
        cause: "The creditor account number is incorrect. Clearing rejected the SEPA credit transfer with pacs.002 status RJCT and reason code AC01.",
        nextStep: "Repair the creditor account details with the creditor and resubmit as a new instruction with a new reference.",
        explanation: "The pacs.002 is the deciding evidence: it names the fault exactly, AC01 incorrect account number, on the creditor account. The ledger confirms no settlement happened, so there is nothing to recover, and the creditor confirms the transposed digit, so the repair is known. Retrying the same instruction would fail again with the same code, and changing the amount would not fix the account number. A new instruction is needed because the rejected one stays RJCT and must not be reused."
      }
    },
    {
      id: "settlement", code: "LAB-07", title: "Settlement failure: insufficient nostro liquidity",
      difficulty: "Hard", tagClass: "red",
      symptom: "A payment fails at settlement because the nostro account lacks liquidity at the settlement window.",
      amount: "USD 250,000.00",
      scenario: "A large USD payment cleared successfully but failed at the settlement window. Your job is to find why settlement could not complete and what to do with the payment now.",
      txn: [
        ["Reference", "LAB-07-2026-0207"],
        ["EndToEndId", "WESTFIELD-2026-1106-0207"],
        ["UETR", "e7a8b9c0-b324-4fd6-e057-8b9c0d1e2fd6"],
        ["Amount", "USD 250,000.00"],
        ["Debtor", "Westfield Capital Ltd, London, United Kingdom"],
        ["Creditor", "Harbor Point Trading LLC, New York, United States"],
        ["Rail", "SWIFT gpi correspondent banking, pacs.008"],
        ["Status", "RJCT, failed at settlement, insufficient liquidity"],
        ["Value date", "06 Nov 2026"]
      ],
      timeline: [
        {time: "14:00:10", title: "Instruction received", desc: "pacs.008 received for USD 250,000.00 to a United States creditor.", cls: ""},
        {time: "14:00:14", title: "Validation and screening passed", desc: "All checks passed. Payment sent to clearing.", cls: ""},
        {time: "14:05:30", title: "Clearing accepted", desc: "Clearing accepted the instruction. Settlement queued for the 14:30 window.", cls: ""},
        {time: "14:30:02", title: "Settlement window opened", desc: "Settlement window opened. Nostro account balance checked.", cls: "warn"},
        {time: "14:30:05", title: "Settlement failed", desc: "Nostro account balance USD 41,200.00, below the USD 250,000.00 needed. Settlement failed.", cls: "bad"},
        {time: "14:45:00", title: "Treasury alert", desc: "Treasury alerted: nostro account needs funding before the next window.", cls: "warn"}
      ],
      logs: [
        "14:00:10 INFO  OPS-GW  pacs.008 received  EndToEndId=WESTFIELD-2026-1106-0207",
        "14:00:14 INFO  VALID   all checks passed  screening=clear",
        "14:05:30 INFO  CLEAR   clearing accepted  settlement queued  window=14:30",
        "14:30:02 INFO  SETTLE  settlement window opened  nostro acct=US-NOSTRO-01",
        "14:30:05 ERROR SETTLE  insufficient liquidity  balance=USD 41200.00  required=USD 250000.00",
        "14:30:05 ERROR SETTLE  settlement failed  status=RJCT  no onward credit posted",
        "14:45:00 INFO  OPS     case opened  case=SET-2026-3318  action=treasury funding required"
      ],
      evidence: [
        {id: "nostro-balance", label: "Check nostro balance", fact: "Nostro balance: the USD nostro account held USD 41,200.00 at the 14:30 settlement window, against USD 250,000.00 needed for this payment. The shortfall is USD 208,800.00."},
        {id: "clearing-status", label: "Check clearing status", fact: "Clearing status: clearing accepted the instruction. The payment data, accounts and screening are all valid. The failure happened after clearing, at settlement."},
        {id: "settlement-queue", label: "Review settlement queue", fact: "Settlement queue: three other USD payments totalling USD 190,000.00 settled from the same nostro account earlier in the day, which reduced the balance before this payment reached its window."},
        {id: "treasury-forecast", label: "Check treasury forecast", fact: "Treasury forecast: an incoming USD receipt of USD 300,000.00 is expected before the next settlement window at 16:30, which would cover this payment in full."}
      ],
      decisions: [
        {id: "d1", q: "What is the most likely root cause of this failure?",
         options: [
          {t: "Insufficient liquidity in the settlement (nostro) account at the settlement window", correct: true, why: "Correct. The nostro account held USD 41,200.00 against USD 250,000.00 needed, so settlement could not complete at the 14:30 window."},
          {t: "The creditor account is incorrect", correct: false, why: "Wrong. The creditor account is valid and clearing accepted the instruction. The failure is the nostro balance, not the account details."},
          {t: "The payment was blocked by sanctions screening", correct: false, why: "Wrong. Screening passed before clearing. The payment failed at settlement, after clearing had accepted it."},
          {t: "The payment was rejected at clearing", correct: false, why: "Wrong. Clearing accepted the instruction and queued it for settlement. The rejection happened at the settlement window."}
         ]},
        {id: "d2", q: "What is the appropriate next step?",
         options: [
          {t: "Fund the account or queue the payment for the next settlement window; do not keep retrying against an unfunded account", correct: true, why: "Correct. Settlement needs the funds in place first. Fund the nostro account, or queue the payment for the 16:30 window when the expected receipt arrives."},
          {t: "Keep retrying settlement every few minutes", correct: false, why: "Wrong. Retrying against the same unfunded account will fail again and again. The balance does not change by retrying."},
          {t: "Cancel the payment and tell the debtor it cannot be paid", correct: false, why: "Wrong. The payment is valid and funding is expected before the next window. Cancelling a payable instruction is not the answer."},
          {t: "Change the creditor to a different bank", correct: false, why: "Wrong. The creditor is correct. Changing the creditor does not put funds in the nostro account."}
         ]}
      ],
      reference: {
        cause: "Insufficient liquidity in the settlement (nostro) account at the settlement window: USD 41,200.00 available against USD 250,000.00 required.",
        nextStep: "Fund the nostro account or queue the payment for the next settlement window at 16:30, when the expected USD 300,000.00 receipt should cover it. Do not keep retrying against an unfunded account.",
        explanation: "Clearing accepted the instruction, so the payment data, accounts and screening are all ruled out. The settlement log gives the exact numbers: a USD 208,800.00 shortfall at the 14:30 window, after earlier USD payments reduced the balance. Retrying changes nothing until the balance changes, so the fix is funding or waiting for the next window, when the forecast receipt covers the payment. The payment stays queued, not cancelled, because it is valid and payable once funded."
      }
    }
  ];

  var state = null;

  /* Lab gate (17 Nov 2026; mirrors the apps' EntryAccessRules):
     the first 2 cases in catalogue order are free samples. The
     rest open only with the Investigation Lab product, Practice
     Experiences, or the Integrated Course, or for admins. Until
     the entitlement check resolves, cases past the first 2 stay
     locked (fail closed). A locked case shows its teaser plus
     the unlock card, never its scenario, evidence or decisions. */
  var LAB_FREE_COUNT = 2;
  var labHasAccess = false;
  var labOpenLocked = null;
  function labCaseLocked(index){
    if(index < LAB_FREE_COUNT) return false;
    return !labHasAccess;
  }
  function labSyncAccess(){
    try {
      if(typeof paHasInvestigationLabAccess === "function") labHasAccess = !!paHasInvestigationLabAccess();
    } catch(e){ labHasAccess = false; }
  }
  /* Locked lab card: the case code, title, difficulty and the
     card teaser (symptom and amount, already visible on the case
     card), plus the unlock card. No scenario, transaction record,
     timeline, logs, evidence, decisions or reference solution. */
  function renderLockedLab(c){
    state = null;
    labOpenLocked = c;
    var panel = $("casePanel");
    panel.classList.add("is-locked");
    $("caseList").style.display = "";
    panel.style.display = "block";
    var box = $("caseLocked");
    box.innerHTML =
      '<article class="pf-card"><span class="pf-tag">' + esc(c.difficulty) + '</span> <span class="pf-tag">Locked</span>' +
      '<h3>' + esc(c.code) + ": " + esc(c.title) + '</h3>' +
      '<p>' + esc(c.symptom) + '</p>' +
      '<p><b>' + esc(c.amount) + '</b></p>' +
      '<p>This investigation case is part of the Investigation Lab: all 7 investigation cases for <s>Rs. 749</s> <b>Rs. 499</b>, with 1 year of access. The Integrated Course includes the Investigation Lab too.</p>' +
      '<div class="pf-btnrow"><a class="pf-btn" href="payment?bundle=investigation-lab">Go to checkout</a> <a class="pf-btn secondary" href="payment?bundle=integrated">See the Integrated Course</a></div></article>';
    panel.scrollIntoView({behavior: "smooth", block: "start"});
  }
  /* Locked markers on the case cards, shown only once the
     entitlement check has resolved, so buyers never see a false
     Locked tag. Clicks fail closed from the start regardless. */
  function labSyncCardMarkers(){
    document.querySelectorAll("[data-case-open]").forEach(function(btn){
      var c = caseById(btn.getAttribute("data-case-open"));
      if(!c) return;
      var article = btn.closest("article");
      if(!article) return;
      var marker = article.querySelector("[data-lab-locked]");
      var locked = labCaseLocked(CASES.indexOf(c));
      if(locked && !marker){
        var tag = document.createElement("span");
        tag.className = "pf-tag";
        tag.setAttribute("data-lab-locked", "1");
        tag.textContent = "Locked";
        var first = article.querySelector(".pf-tag");
        if(first && first.nextSibling) article.insertBefore(tag, first.nextSibling);
        else article.insertBefore(tag, article.firstChild);
      } else if(!locked && marker){
        marker.parentNode.removeChild(marker);
      }
    });
  }

  function caseById(id){
    for(var i = 0; i < CASES.length; i++){ if(CASES[i].id === id) return CASES[i]; }
    return null;
  }
  function freshState(c){
    return { c: c, score: 0, evidenceUsed: {}, decisionsAnswered: {}, correctCount: 0, decisionsDone: 0 };
  }
  function $(id){ return document.getElementById(id); }
  function esc(s){ return window.PFFeatures.esc(s); }

  function updateScore(){
    if(!state) return;
    window.PFFeatures.renderScoreBar("scoreBar", state.score, TOTAL);
    var t = $("scoreText");
    if(t) t.textContent = "Score " + state.score + " of " + TOTAL + " points. Evidence items earn 5 points each, correct decisions earn 20 points each.";
    window.PFFeatures.recordScore(FEATURE_ID, state.score, TOTAL, state.c.id);
    refreshBestScores();
  }

  function refreshBestScores(){
    var best = window.PFFeatures.getScore(FEATURE_ID);
    var overall = $("overallBest");
    if(overall) overall.textContent = best ? ("Best score: " + best.best + " / " + best.bestTotal) : "Best score: not attempted yet";
    CASES.forEach(function(c){
      var el = $("best-" + c.id);
      if(!el) return;
      if(best && best.label === c.id) el.textContent = "Best: " + best.best + " / " + best.bestTotal;
      else el.textContent = "Best: not attempted yet";
    });
  }

  function renderCase(c){
    state = freshState(c);
    labOpenLocked = null;
    var panel = $("casePanel");
    panel.classList.remove("is-locked");
    var lockedBox = $("caseLocked");
    if(lockedBox) lockedBox.innerHTML = "";
    $("caseList").style.display = "";
    panel.style.display = "block";
    $("cTitle").textContent = c.code + ": " + c.title;
    $("cScenario").textContent = c.scenario;
    var rows = "";
    c.txn.forEach(function(row){
      rows += "<tr><td><b>" + esc(row[0]) + "</b></td><td class=\"wrap\">" + esc(row[1]) + "</td></tr>";
    });
    $("cTxn").innerHTML = rows;
    var tl = "";
    c.timeline.forEach(function(ev){
      var cls = ev.cls ? " class=\"" + ev.cls + "\"" : "";
      tl += "<li" + cls + "><b>" + esc(ev.time) + " - " + esc(ev.title) + "</b><span>" + esc(ev.desc) + "</span></li>";
    });
    $("cTimeline").innerHTML = tl;
    $("cLog").textContent = c.logs.join("\n");
    var evHtml = "";
    c.evidence.forEach(function(ev){
      evHtml += '<button type="button" class="pf-btn secondary" data-evidence="' + ev.id + '">' + esc(ev.label) + '</button>';
    });
    $("cEvidence").innerHTML = evHtml;
    $("evidenceFinding").style.display = "none";
    $("evidenceFinding").innerHTML = "";
    var dec = "";
    c.decisions.forEach(function(d, di){
      dec += '<div class="pf-card" style="margin:12px 0"><h3>' + (di === 0 ? "Decision 1: root cause" : "Decision 2: next step") + '</h3><p><b>' + esc(d.q) + '</b></p><div class="pf-btnrow" data-decision="' + d.id + '">';
      d.options.forEach(function(opt, oi){
        dec += '<button type="button" class="pf-btn secondary" data-decision="' + d.id + '" data-option="' + oi + '">' + esc(opt.t) + '</button>';
      });
      dec += '</div><div class="pf-fb" id="fb-' + d.id + '" style="display:none"></div></div>';
    });
    $("cDecisions").innerHTML = dec;
    $("cReference").style.display = "none";
    $("cReference").innerHTML = "";
    $("casePanel").scrollIntoView({behavior: "smooth", block: "start"});
    updateScore();
  }

  function onEvidenceClick(btn){
    if(!state){ window.PFFeatures.showFeedback("evidenceFinding", "warn", "Open a case first, then reveal the evidence."); return; }
    var evId = btn.getAttribute("data-evidence");
    var ev = null;
    state.c.evidence.forEach(function(e){ if(e.id === evId) ev = e; });
    if(!ev) return;
    if(state.evidenceUsed[evId]){
      window.PFFeatures.showFeedback("evidenceFinding", "warn", "Already examined: " + esc(ev.fact));
      return;
    }
    state.evidenceUsed[evId] = true;
    state.score += EVIDENCE_POINTS;
    btn.disabled = true;
    window.PFFeatures.showFeedback("evidenceFinding", "ok", "<b>" + esc(ev.label) + " (+5 points).</b> " + esc(ev.fact));
    updateScore();
  }

  function onDecisionClick(btn){
    if(!state){ window.PFFeatures.showFeedback("evidenceFinding", "warn", "Open a case first, then answer the decisions."); return; }
    var dId = btn.getAttribute("data-decision");
    var oIdx = parseInt(btn.getAttribute("data-option"), 10);
    if(state.decisionsAnswered[dId]){
      window.PFFeatures.showFeedback("fb-" + dId, "warn", "This decision is already answered. Reset the case to try it again.");
      return;
    }
    var dec = null;
    state.c.decisions.forEach(function(d){ if(d.id === dId) dec = d; });
    if(!dec || !dec.options[oIdx]) return;
    var opt = dec.options[oIdx];
    state.decisionsAnswered[dId] = true;
    state.decisionsDone += 1;
    if(opt.correct){ state.score += DECISION_POINTS; state.correctCount += 1; }
    var row = btn.parentElement;
    if(row){
      var all = row.querySelectorAll("button");
      all.forEach(function(b){ b.disabled = true; });
    }
    var kind = opt.correct ? "ok" : "err";
    var head = opt.correct ? "Correct (+20 points). " : "Not correct (0 points). ";
    window.PFFeatures.showFeedback("fb-" + dId, kind, "<b>" + head + "</b>" + esc(opt.why));
    updateScore();
    if(state.decisionsDone >= state.c.decisions.length) showReference();
  }

  function showReference(){
    if(!state) return;
    var r = state.c.reference;
    var box = $("cReference");
    var html = "<h3>Reference solution</h3>" +
      "<p><b>True root cause:</b> " + esc(r.cause) + "</p>" +
      "<p><b>Correct next step:</b> " + esc(r.nextStep) + "</p>" +
      "<p><b>Why this is right:</b> " + esc(r.explanation) + "</p>" +
      "<p>Your answers: " + state.correctCount + " of " + state.c.decisions.length + " correct. Final score for this case: <b>" + state.score + " / " + TOTAL + "</b>.</p>";
    box.innerHTML = html;
    box.style.display = "block";
    box.scrollIntoView({behavior: "smooth", block: "center"});
  }

  function resetCase(){
    if(!state){ window.PFFeatures.showFeedback("evidenceFinding", "warn", "Open a case first. There is nothing to reset yet."); return; }
    var c = state.c;
    renderCase(c);
    window.PFFeatures.showFeedback("evidenceFinding", "ok", "Case reset. Evidence and decisions are ready again.");
  }

  document.addEventListener("DOMContentLoaded", function(){
    refreshBestScores();
    /* Entitlement resolves async: refresh the card markers and
       unlock an open locked case once the true state lands. Until
       then, cases past the first 2 open locked. */
    if(typeof paGateState === "function"){
      paGateState().then(function(){
        labSyncAccess();
        labSyncCardMarkers();
        if(labOpenLocked && !labCaseLocked(CASES.indexOf(labOpenLocked))){
          var c = labOpenLocked;
          renderCase(c);
        }
      });
    }
    var cards = document.querySelectorAll("[data-case-open]");
    cards.forEach(function(card){
      card.addEventListener("click", function(){
        var c = caseById(card.getAttribute("data-case-open"));
        if(!c) return;
        labSyncAccess();
        if(labCaseLocked(CASES.indexOf(c))) renderLockedLab(c);
        else renderCase(c);
      });
    });
    var panel = $("casePanel");
    if(panel){
      panel.addEventListener("click", function(e){
        var t = e.target;
        if(!t || t.tagName !== "BUTTON") return;
        if(t.getAttribute("data-evidence")) onEvidenceClick(t);
        else if(t.getAttribute("data-option") !== null) onDecisionClick(t);
        else if(t.id === "resetBtn") resetCase();
        else if(t.id === "backBtn"){
          $("casePanel").style.display = "none";
          $("casePanel").classList.remove("is-locked");
          labOpenLocked = null;
          $("caseList").scrollIntoView({behavior: "smooth", block: "start"});
        }
      });
    }
    var resetAll = $("resetAllBtn");
    if(resetAll){
      resetAll.addEventListener("click", function(){
        if(confirm("Reset your Investigation Lab progress in this browser?")){
          window.PFFeatures.resetFeature(FEATURE_ID);
          if(state) renderCase(state.c);
          refreshBestScores();
        }
      });
    }
  });
})();
