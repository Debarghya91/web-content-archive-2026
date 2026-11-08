/* Mission Control: payment operations simulation.
   Four deterministic missions. All data is synthetic and for education only.
   Scoring: each investigation tool used once earns 5 points; each correct
   decision earns 20 points. Total per mission is 60 points. */
(function(){
  "use strict";
  var FEATURE_ID = "mission-control";
  var TOTAL = 60;
  var TOOL_POINTS = 5;
  var DECISION_POINTS = 20;

  var MISSIONS = [
    {
      id: "a", code: "MC-A", title: "Payment stuck in processing",
      difficulty: "Medium", tagClass: "amber",
      summary: "USD 48,250 from a London corporate to a Singapore supplier, held after screening.",
      scenario: "A corporate payment left the debtor account and reached screening, then stopped. The debtor is asking where the money is. Your job is to find out why it stopped, keep the funds safe, and take the correct next step. Do not release a payment you have not cleared, and do not cancel a payment that may only need a review.",
      txn: [
        ["Reference", "MC-A-2026-0147"],
        ["EndToEndId", "MERIDIAN-2026-1106-0147"],
        ["UETR", "a41f2c90-7b3e-4d18-9c52-1e8f6a3d0471"],
        ["Amount", "USD 48,250.00"],
        ["Debtor", "Meridian Trading Ltd, London, United Kingdom"],
        ["Creditor", "Tan and Lee Supplies Pte Ltd, Singapore"],
        ["Rail", "SWIFT gpi correspondent banking, pacs.008"],
        ["Status", "ACSP, held after screening"],
        ["Value date", "06 Nov 2026"]
      ],
      flow: [
        {label: "Initiated", sub: "Instruction received", state: "done"},
        {label: "Validated", sub: "Format and fields OK", state: "done"},
        {label: "Screened", sub: "Name match found", state: "failed"},
        {label: "Cleared", sub: "Not reached", state: ""},
        {label: "Settled", sub: "Not reached", state: ""}
      ],
      timeline: [
        {time: "09:02:11", title: "Instruction received", desc: "pacs.008 received from Meridian Trading Ltd for USD 48,250.00.", cls: ""},
        {time: "09:02:14", title: "Validation passed", desc: "Format, currency, amount and account structure all passed validation.", cls: ""},
        {time: "09:02:19", title: "Debtor account debited", desc: "USD 48,250.00 debited and held in the settlement account. No onward credit yet.", cls: ""},
        {time: "09:02:22", title: "Screening hit", desc: "Screening returned a possible name match on the creditor. Payment held automatically.", cls: "bad"},
        {time: "09:02:23", title: "Status set to held", desc: "Payment status ACSP with a screening hold. No instruction sent to the correspondent bank.", cls: "warn"},
        {time: "09:41:00", title: "Debtor enquiry", desc: "Debtor asks why the supplier has not been paid. No update sent yet.", cls: "warn"}
      ],
      logs: [
        "09:02:11 INFO  OPS-GW  pacs.008 received  EndToEndId=MERIDIAN-2026-1106-0147",
        "09:02:14 INFO  VALID   all checks passed  amount=USD 48250.00",
        "09:02:19 INFO  LEDGER  debit posted  acct=GB29NWBK60161331926819  USD 48250.00",
        "09:02:22 WARN  SCREEN  possible match  list=consolidated sanctions  score=87  field=creditor name",
        "09:02:22 WARN  SCREEN  match type=name similarity only  confirmed=false",
        "09:02:23 INFO  OPS     status=ACSP  hold=SCREENING_REVIEW  onward instruction=not sent",
        "09:02:23 INFO  OPS     case opened  case=SCR-2026-8814  queue=compliance review",
        "09:41:00 INFO  OPS     debtor enquiry logged  channel=online banking"
      ],
      tools: [
        {id: "ledger", label: "Check ledger", finding: "Ledger finding: the debtor account was debited USD 48,250.00 and the funds are held in the settlement account. No onward credit has been posted, so the money has not left the bank."},
        {id: "screening", label: "Query screening", finding: "Screening finding: a possible name match against a sanctions list entry, score 87, on the creditor name only. It is a similarity match, not a confirmed match. It needs a manual compliance review."},
        {id: "details", label: "Review payment details", finding: "Payment details finding: the instruction itself is complete and valid. Amount, currency, debtor and creditor accounts and value date are all consistent. The problem is the screening hold, not the payment data."},
        {id: "correspondent", label: "Call correspondent", finding: "Correspondent finding: the correspondent bank has not received this payment. No onward instruction was sent, because the payment was held before clearing."}
      ],
      decisions: [
        {id: "d1", q: "The screening system flagged a possible name match. What should you do first?",
         options: [
          {t: "Release the payment immediately so the supplier is paid on time", correct: false, why: "Wrong. A possible sanctions match must be reviewed before any release. Releasing it could breach sanctions controls."},
          {t: "Escalate to compliance with the match details and case reference", correct: true, why: "Correct. A possible match needs a manual compliance review. Escalate with the match score, the matched field and case SCR-2026-8814."},
          {t: "Cancel the payment and return the funds to the debtor", correct: false, why: "Wrong. The match is only possible, not confirmed. Cancelling now would end a payment that may be perfectly legitimate."},
          {t: "Ask the debtor to send the payment again", correct: false, why: "Wrong. A second instruction would hit the same screening check and could create a duplicate."}
         ]},
        {id: "d2", q: "While compliance reviews the match, what do you tell the debtor?",
         options: [
          {t: "Tell them the payment has settled", correct: false, why: "Wrong. The payment has not settled. Saying it has would mislead the debtor and the supplier."},
          {t: "Explain it is held for a routine compliance review, with no action needed from them yet", correct: true, why: "Correct. Be honest that it is held for review, give the case reference, and say you will update them after the review."},
          {t: "Tell them the creditor is on a sanctions list", correct: false, why: "Wrong. The match is not confirmed. Never state a sanctions finding as fact before compliance confirms it."},
          {t: "Say nothing until the review finishes", correct: false, why: "Wrong. The debtor has already asked. Silence leaves them to chase the supplier or send a duplicate."}
         ]}
      ],
      outcomeGood: "Resolution: the payment stays held in the settlement account and case SCR-2026-8814 goes to compliance with the match score, matched field and payment details. Compliance will confirm or clear the match. If cleared, the payment proceeds to the correspondent bank. If confirmed, compliance decides the next step. No money was released without review and no duplicate was created.",
      outcomePartial: "Resolution: the payment stays held, but one of your choices weakened the handling. Review the explanations above: a screening hold needs a compliance review, and the debtor needs an honest update with the case reference. The funds are still safe in the settlement account.",
      outcomePoor: "Resolution: the handling went wrong. Releasing a payment with an unresolved screening match, or cancelling it before review, creates compliance risk or harms a legitimate payment. The correct path is to escalate to compliance with the match details and keep the debtor informed while the review runs."
    },
    {
      id: "b", code: "MC-B", title: "Duplicate payment submission",
      difficulty: "Easy", tagClass: "",
      summary: "The same EndToEndId submitted twice within minutes after a slow response.",
      scenario: "A payment was submitted, the response was slow, and the sending system tried again. Now there are two instructions with the same EndToEndId. One of them may already have settled. Your job is to work out which instruction is real, which is the duplicate, and stop the second one from moving money twice.",
      txn: [
        ["Reference", "MC-B-2026-0152"],
        ["EndToEndId", "NORTHGATE-2026-1106-0093"],
        ["UETR", "b7c2e145-9a41-4f06-8d73-2f5a9c1e8830"],
        ["Amount", "EUR 32,150.00"],
        ["Debtor", "Northgate Retail BV, Amsterdam, Netherlands"],
        ["Creditor", "Iberia Logistics SL, Madrid, Spain"],
        ["Rail", "SEPA Credit Transfer, pacs.008"],
        ["Status", "First instruction ACCP, settled. Second instruction held as suspected duplicate"],
        ["Value date", "06 Nov 2026"]
      ],
      flow: [
        {label: "Initiated", sub: "Submitted twice", state: "done"},
        {label: "Validated", sub: "Duplicate detected", state: "failed"},
        {label: "Screened", sub: "First instruction passed", state: "done"},
        {label: "Cleared", sub: "First instruction cleared", state: "done"},
        {label: "Settled", sub: "First instruction settled", state: "done"}
      ],
      timeline: [
        {time: "09:14:02", title: "First submission", desc: "Instruction 1 received with EndToEndId NORTHGATE-2026-1106-0093 for EUR 32,150.00.", cls: ""},
        {time: "09:14:47", title: "Slow response", desc: "No response returned within 45 seconds. The sending system timed out waiting.", cls: "warn"},
        {time: "09:15:31", title: "Second submission", desc: "Instruction 2 received. Same EndToEndId, same amount, same creditor.", cls: "bad"},
        {time: "09:15:58", title: "First instruction settled", desc: "Instruction 1 settled. Status ACCP. Creditor account credited EUR 32,150.00.", cls: ""},
        {time: "09:16:05", title: "Duplicate detected", desc: "Duplicate check matched instruction 2 to instruction 1 on EndToEndId. Instruction 2 held.", cls: "warn"}
      ],
      logs: [
        "09:14:02 INFO  OPS-GW  pacs.008 received  EndToEndId=NORTHGATE-2026-1106-0093  seq=1",
        "09:14:47 WARN  OPS-GW  response timeout  wait=45s  seq=1  status=unknown to sender",
        "09:15:31 INFO  OPS-GW  pacs.008 received  EndToEndId=NORTHGATE-2026-1106-0093  seq=2",
        "09:15:58 INFO  CLEAR   instruction 1 settled  status=ACCP  EUR 32150.00",
        "09:16:05 WARN  DUPCHK  duplicate EndToEndId  seq=2 matches seq=1  amount and creditor identical",
        "09:16:05 INFO  OPS     instruction 2 held  reason=SUSPECTED_DUPLICATE  no debit posted for seq=2"
      ],
      tools: [
        {id: "compare", label: "Compare EndToEndId", finding: "Comparison finding: both instructions carry the identical EndToEndId NORTHGATE-2026-1106-0093, the same amount EUR 32,150.00 and the same creditor. They are the same instruction submitted twice."},
        {id: "settlement", label: "Check settlement status", finding: "Settlement finding: instruction 1 settled at 09:15:58 with status ACCP. The creditor was credited EUR 32,150.00. Instruction 2 has not settled."},
        {id: "ledger", label: "Check ledger", finding: "Ledger finding: only one debit of EUR 32,150.00 was posted, for instruction 1. No debit was posted for instruction 2, so no money has moved twice."},
        {id: "clearing", label: "Query clearing", finding: "Clearing finding: clearing holds one settled record for this EndToEndId. There is no second clearing record, which confirms instruction 2 is a duplicate of an already settled payment."}
      ],
      decisions: [
        {id: "d1", q: "How do you prove the second instruction is a duplicate?",
         options: [
          {t: "Compare the EndToEndId on both instructions", correct: true, why: "Correct. The EndToEndId is the unique reference for the instruction. An identical EndToEndId with the same amount and creditor identifies the duplicate."},
          {t: "Compare the amount only", correct: false, why: "Wrong. Two genuine payments can have the same amount. Amount alone does not prove a duplicate."},
          {t: "Compare the value date only", correct: false, why: "Wrong. Many payments share a value date. It does not identify a specific instruction."},
          {t: "Check the creditor name only", correct: false, why: "Wrong. The same creditor can receive many payments. You need the instruction reference, the EndToEndId."}
         ]},
        {id: "d2", q: "What should happen to the second instruction?",
         options: [
          {t: "Reject the second instruction and keep the first one settled", correct: true, why: "Correct. The first instruction already settled and the creditor was paid. Reject the duplicate so the money does not move twice."},
          {t: "Process both instructions", correct: false, why: "Wrong. Processing both would pay the creditor twice for one underlying obligation."},
          {t: "Cancel both instructions and ask the debtor to resend", correct: false, why: "Wrong. The first instruction already settled. Cancelling it after settlement does not undo the payment."},
          {t: "Hold both instructions until the debtor replies", correct: false, why: "Wrong. The first instruction is already settled, so there is nothing to hold. Only the duplicate needs action."}
         ]}
      ],
      outcomeGood: "Resolution: instruction 2 is rejected as a duplicate of instruction 1, which already settled with status ACCP. The creditor was paid once, EUR 32,150.00. The duplicate is recorded with reason DUPLICATE_ENDTOENDID, and the debtor is told the retry after the slow response caused the duplicate, so no new payment is needed.",
      outcomePartial: "Resolution: the duplicate was identified, but one choice weakened the handling. The first instruction settled, so the only safe action is to reject the second instruction. Review the explanations above before closing the case.",
      outcomePoor: "Resolution: the handling went wrong. Processing both instructions would pay the creditor twice. The correct path is to identify the duplicate by EndToEndId and reject the second instruction, keeping the settled first instruction as it is."
    },
    {
      id: "c", code: "MC-C", title: "Clearing rejection",
      difficulty: "Medium", tagClass: "amber",
      summary: "A EUR 120,000 SEPA credit transfer rejected at clearing with a pacs.002 rejection.",
      scenario: "A large SEPA credit transfer was rejected at clearing. The clearing system sent back a pacs.002 with a rejection reason code. Your job is to read the rejection, find the exact fault, and choose the repair that gets the payment to the creditor without repeating the same error.",
      txn: [
        ["Reference", "MC-C-2026-0161"],
        ["EndToEndId", "BAVARIA-2026-1106-0218"],
        ["UETR", "c93d481a-2e67-4a35-b410-8d4f2e6a1957"],
        ["Amount", "EUR 120,000.00"],
        ["Debtor", "Bavaria Maschinen GmbH, Munich, Germany"],
        ["Creditor", "Atelier Durand SARL, Lyon, France"],
        ["Rail", "SEPA Credit Transfer, pacs.008, pacs.002 rejection"],
        ["Status", "RJCT, rejected at clearing, reason code AC01"],
        ["Value date", "06 Nov 2026"]
      ],
      flow: [
        {label: "Initiated", sub: "Instruction received", state: "done"},
        {label: "Validated", sub: "Format and fields OK", state: "done"},
        {label: "Screened", sub: "Screening passed", state: "done"},
        {label: "Cleared", sub: "Rejected, AC01", state: "failed"},
        {label: "Settled", sub: "Not reached", state: ""}
      ],
      timeline: [
        {time: "10:20:03", title: "Instruction received", desc: "pacs.008 received from Bavaria Maschinen GmbH for EUR 120,000.00.", cls: ""},
        {time: "10:20:06", title: "Validation and screening passed", desc: "Format checks and screening both passed. Payment sent to clearing.", cls: ""},
        {time: "10:21:40", title: "Clearing rejection", desc: "pacs.002 received from clearing with status RJCT and reason code AC01.", cls: "bad"},
        {time: "10:21:41", title: "Funds returned", desc: "No settlement took place. The debtor account was not finally debited for settlement.", cls: "warn"},
        {time: "10:35:00", title: "Debtor enquiry", desc: "Debtor asks why the supplier has not been paid and whether to send it again.", cls: "warn"}
      ],
      logs: [
        "10:20:03 INFO  OPS-GW  pacs.008 received  EndToEndId=BAVARIA-2026-1106-0218",
        "10:20:06 INFO  VALID   all checks passed  screening=clear",
        "10:20:09 INFO  CLEAR   instruction sent to clearing  scheme=SEPA",
        "10:21:40 ERROR CLEAR   pacs.002 received  status=RJCT  reason=AC01",
        "10:21:40 ERROR CLEAR   reason text=incorrect account number  field=creditor account",
        "10:21:41 INFO  LEDGER  settlement not posted  funds remain with debtor bank",
        "10:21:41 INFO  OPS     case opened  case=CLR-2026-5520  action=repair required"
      ],
      tools: [
        {id: "pacs002", label: "Read pacs.002", finding: "pacs.002 finding: status RJCT, reason code AC01, reason text incorrect account number. The rejection came from clearing and names the creditor account as the fault."},
        {id: "account", label: "Validate creditor account", finding: "Account check finding: the creditor account number fails the clearing account check. One character differs from the account number on the creditor invoice. The rest of the instruction is valid."},
        {id: "ledger", label: "Check ledger", finding: "Ledger finding: no settlement was posted and the funds did not leave the debtor bank. The payment can be repaired and resubmitted without recovering money first."},
        {id: "creditor", label: "Contact creditor", finding: "Creditor finding: Atelier Durand confirms the account number on the instruction has a transposed digit. They provide the corrected account number in writing."}
      ],
      decisions: [
        {id: "d1", q: "What does reason code AC01 mean in this rejection?",
         options: [
          {t: "Incorrect account number", correct: true, why: "Correct. AC01 means the account number is incorrect. The pacs.002 names the creditor account as the fault."},
          {t: "Insufficient funds", correct: false, why: "Wrong. Insufficient funds is a different reason code. This rejection is AC01, incorrect account number."},
          {t: "Payment blocked by sanctions screening", correct: false, why: "Wrong. Screening passed before clearing. The rejection came from clearing, not from screening."},
          {t: "Duplicate instruction", correct: false, why: "Wrong. There is no duplicate here. The pacs.002 gives AC01, not a duplicate reason."}
         ]},
        {id: "d2", q: "What is the correct next step for this rejected payment?",
         options: [
          {t: "Retry the same instruction unchanged", correct: false, why: "Wrong. The same instruction carries the same incorrect account number and would be rejected again."},
          {t: "Repair the account details with the creditor and resubmit as a new instruction", correct: true, why: "Correct. Fix the account number with the creditor, then send a new instruction with the corrected details and a new reference."},
          {t: "Cancel the payment and do nothing", correct: false, why: "Wrong. The underlying obligation still exists. The supplier still needs to be paid with corrected details."},
          {t: "Change the amount and resubmit", correct: false, why: "Wrong. The amount is not the fault. Changing it does not fix the account number and would pay the wrong amount."}
         ]}
      ],
      outcomeGood: "Resolution: the creditor confirms the corrected account number, and a new instruction is created with the corrected details and a new reference. The rejected instruction stays RJCT and is not retried. The debtor is told the original payment was rejected for AC01 and the corrected payment is on its way.",
      outcomePartial: "Resolution: the rejection was read correctly, but one choice weakened the handling. Retrying the same instruction would fail again with AC01. The fix is to repair the account details with the creditor and resubmit as a new instruction.",
      outcomePoor: "Resolution: the handling went wrong. The rejection reason is AC01, incorrect account number, and the only fix is to repair the account details with the creditor and resubmit as a new instruction. Retrying the same instruction unchanged would be rejected again."
    },
    {
      id: "d", code: "MC-D", title: "API timeout",
      difficulty: "Hard", tagClass: "red",
      summary: "A payment API call timed out after 30 seconds with no response.",
      scenario: "A payment was submitted through the payments API. The POST call timed out after 30 seconds and returned no response. The payment may have been accepted, or it may never have arrived. Your job is to find out what actually happened before you do anything that could create a duplicate.",
      txn: [
        ["Reference", "MC-D-2026-0173"],
        ["EndToEndId", "HARBOUR-2026-1106-0331"],
        ["UETR", "d51a8f63-4c90-4e82-a127-6b3e9d5c0248"],
        ["Amount", "USD 9,850.00"],
        ["Debtor", "Harbour Freight Ltd, Felixstowe, United Kingdom"],
        ["Creditor", "Nordwind Spedition GmbH, Hamburg, Germany"],
        ["Rail", "API initiated payment, pacs.008, idempotency key IDM-2026-1106-8841"],
        ["Status", "Unknown, POST timed out after 30 seconds, no response received"],
        ["Value date", "06 Nov 2026"]
      ],
      flow: [
        {label: "Initiated", sub: "POST sent, no response", state: "active"},
        {label: "Validated", sub: "State unknown", state: ""},
        {label: "Screened", sub: "State unknown", state: ""},
        {label: "Cleared", sub: "State unknown", state: ""},
        {label: "Settled", sub: "State unknown", state: ""}
      ],
      timeline: [
        {time: "11:05:00", title: "POST submitted", desc: "Payment POST sent with idempotency key IDM-2026-1106-8841 for USD 9,850.00.", cls: ""},
        {time: "11:05:30", title: "Timeout", desc: "No response after 30 seconds. The client timed out. Payment state is unknown.", cls: "bad"},
        {time: "11:05:31", title: "No settlement seen", desc: "No settlement record and no ledger posting are visible yet. That proves nothing on its own.", cls: "warn"},
        {time: "11:06:10", title: "Operator alert", desc: "Operations alerted: a payment may or may not have been accepted. Do not retry blindly.", cls: "warn"}
      ],
      logs: [
        "11:05:00 INFO  API-GW  POST /payments received  idempotency-key=IDM-2026-1106-8841",
        "11:05:01 INFO  API-GW  request forwarded to payment engine  EndToEndId=HARBOUR-2026-1106-0331",
        "11:05:30 ERROR API-GW  client timeout  wait=30s  response=none  state=unknown",
        "11:05:30 WARN  API-GW  payment may or may not have been accepted  do not retry POST blindly",
        "11:05:31 INFO  LEDGER  no posting found yet for EndToEndId HARBOUR-2026-1106-0331",
        "11:06:10 INFO  OPS     case opened  case=API-2026-7731  action=status check required"
      ],
      tools: [
        {id: "status", label: "Check status with GET and idempotency key", finding: "Status check finding: a GET using idempotency key IDM-2026-1106-8841 returns the payment as accepted, status ACCP, reference MC-D-2026-0173. The POST did reach the payment engine before the timeout. Do not send the POST again."},
        {id: "apilogs", label: "Check API logs", finding: "API log finding: the POST was received and forwarded to the payment engine at 11:05:01, but the response was lost when the client timed out at 11:05:30. The timeout was in the response path, not in the payment engine."},
        {id: "ledger", label: "Check ledger", finding: "Ledger finding: no posting is visible yet for this EndToEndId. That alone does not prove the payment failed, because settlement posting can lag acceptance. The status check is the deciding evidence."},
        {id: "idempotency", label: "Check idempotency key record", finding: "Idempotency finding: key IDM-2026-1106-8841 is recorded against this payment. Replaying the same key would return the original result instead of creating a second payment, but only if the same key is used. A fresh POST without the key would risk a duplicate."}
      ],
      decisions: [
        {id: "d1", q: "The POST timed out with no response. What is your first step?",
         options: [
          {t: "Retry the POST immediately", correct: false, why: "Wrong. The first POST may already have been accepted. A blind retry risks creating a duplicate payment."},
          {t: "Check the payment status with a GET using the idempotency key", correct: true, why: "Correct. The state is unknown, so check first. A GET with the idempotency key tells you whether the payment was accepted, without creating anything new."},
          {t: "Assume the payment failed and send a new payment", correct: false, why: "Wrong. You do not know it failed. Sending a new payment before checking could pay the creditor twice."},
          {t: "Cancel the payment and start again", correct: false, why: "Wrong. You cannot cancel a payment whose state you do not know. Check the status first."}
         ]},
        {id: "d2", q: "The status check shows the payment was accepted with status ACCP. What now?",
         options: [
          {t: "Send the POST again to be safe", correct: false, why: "Wrong. The payment is already accepted. Another POST risks a duplicate, even with the same details."},
          {t: "Confirm the payment to the debtor, monitor settlement, and send no duplicate POST", correct: true, why: "Correct. The payment exists and is accepted. Confirm it, watch it move through settlement, and do not submit it again."},
          {t: "Tell the debtor the payment failed", correct: false, why: "Wrong. The status check shows ACCP, accepted. Telling the debtor it failed is incorrect and could trigger a duplicate from their side."},
          {t: "Delete the idempotency key record", correct: false, why: "Wrong. The key record is what protects against a duplicate replay. Leave it in place."}
         ]}
      ],
      outcomeGood: "Resolution: the GET status check with idempotency key IDM-2026-1106-8841 shows the payment was accepted, status ACCP, before the timeout. No duplicate POST is sent. The debtor is told the payment was accepted and the timeout was in the response path only. The payment is monitored through settlement as normal.",
      outcomePartial: "Resolution: the state was checked, but one choice weakened the handling. A blind retry after a timeout risks a duplicate. The safe rule is always check status with the idempotency key first, then act on what the check shows.",
      outcomePoor: "Resolution: the handling went wrong. Retrying the POST blindly after a timeout risks a duplicate payment, because the first POST may already have been accepted. The correct path is to check status with a GET using the idempotency key before doing anything else."
    }
  ];

  var state = null;

  function missionById(id){
    for(var i = 0; i < MISSIONS.length; i++){ if(MISSIONS[i].id === id) return MISSIONS[i]; }
    return null;
  }
  function freshState(mission){
    return { mission: mission, score: 0, toolsUsed: {}, decisionsAnswered: {}, correctCount: 0, decisionsDone: 0 };
  }
  function $(id){ return document.getElementById(id); }
  function esc(s){ return window.PFFeatures.esc(s); }

  function updateScore(){
    if(!state) return;
    window.PFFeatures.renderScoreBar("scoreBar", state.score, TOTAL);
    var t = $("scoreText");
    if(t) t.textContent = "Score " + state.score + " of " + TOTAL + " points. Tools earn 5 points each, correct decisions earn 20 points each.";
    window.PFFeatures.recordScore(FEATURE_ID, state.score, TOTAL, state.mission.id);
    refreshBestScores();
  }

  function refreshBestScores(){
    var best = window.PFFeatures.getScore(FEATURE_ID);
    var overall = $("overallBest");
    if(overall) overall.textContent = best ? ("Best score: " + best.best + " / " + best.bestTotal) : "Best score: not attempted yet";
    MISSIONS.forEach(function(m){
      var el = $("best-" + m.id);
      if(!el) return;
      if(best && best.label === m.id) el.textContent = "Best: " + best.best + " / " + best.bestTotal;
      else if(best) el.textContent = "Best on this mission: not recorded in this session. Overall best: " + best.best + " / " + best.bestTotal;
      else el.textContent = "Best: not attempted yet";
    });
  }

  function renderFlow(mission){
    var html = "";
    mission.flow.forEach(function(step, i){
      if(i > 0) html += '<div class="arrow" aria-hidden="true">&rarr;</div>';
      var cls = step.state ? " " + step.state : "";
      html += '<div class="node' + cls + '"><b>' + esc(step.label) + '</b><span>' + esc(step.sub) + '</span></div>';
    });
    $("mFlow").innerHTML = html;
  }

  function renderMission(mission){
    state = freshState(mission);
    $("dashboard").style.display = "";
    $("missionPanel").style.display = "block";
    $("mTitle").textContent = mission.code + ": " + mission.title;
    $("mScenario").textContent = mission.scenario;
    var rows = "";
    mission.txn.forEach(function(row){
      rows += "<tr><td><b>" + esc(row[0]) + "</b></td><td class=\"wrap\">" + esc(row[1]) + "</td></tr>";
    });
    $("mTxn").innerHTML = rows;
    renderFlow(mission);
    var tl = "";
    mission.timeline.forEach(function(ev){
      var cls = ev.cls ? " class=\"" + ev.cls + "\"" : "";
      tl += "<li" + cls + "><b>" + esc(ev.time) + " - " + esc(ev.title) + "</b><span>" + esc(ev.desc) + "</span></li>";
    });
    $("mTimeline").innerHTML = tl;
    $("mLog").textContent = mission.logs.join("\n");
    var tools = "";
    mission.tools.forEach(function(tool){
      tools += '<button type="button" class="pf-btn secondary" data-tool="' + tool.id + '">' + esc(tool.label) + '</button>';
    });
    $("mTools").innerHTML = tools;
    $("toolFinding").style.display = "none";
    $("toolFinding").innerHTML = "";
    var dec = "";
    mission.decisions.forEach(function(d, di){
      dec += '<div class="pf-card" style="margin:12px 0"><h3>Decision ' + (di + 1) + '</h3><p><b>' + esc(d.q) + '</b></p><div class="pf-btnrow" data-decision="' + d.id + '">';
      d.options.forEach(function(opt, oi){
        dec += '<button type="button" class="pf-btn secondary" data-decision="' + d.id + '" data-option="' + oi + '">' + esc(opt.t) + '</button>';
      });
      dec += '</div><div class="pf-fb" id="fb-' + d.id + '" style="display:none"></div></div>';
    });
    $("mDecisions").innerHTML = dec;
    $("mOutcome").style.display = "none";
    $("mOutcome").innerHTML = "";
    $("missionPanel").scrollIntoView({behavior: "smooth", block: "start"});
    updateScore();
  }

  function onToolClick(btn){
    if(!state){ window.PFFeatures.showFeedback("toolFinding", "warn", "Select a mission first, then use the investigation tools."); return; }
    var toolId = btn.getAttribute("data-tool");
    var tool = null;
    state.mission.tools.forEach(function(t){ if(t.id === toolId) tool = t; });
    if(!tool) return;
    if(state.toolsUsed[toolId]){
      window.PFFeatures.showFeedback("toolFinding", "warn", "Already checked: " + esc(tool.finding));
      return;
    }
    state.toolsUsed[toolId] = true;
    state.score += TOOL_POINTS;
    btn.disabled = true;
    window.PFFeatures.showFeedback("toolFinding", "ok", "<b>" + esc(tool.label) + " (+5 points).</b> " + esc(tool.finding));
    updateScore();
  }

  function onDecisionClick(btn){
    if(!state){ window.PFFeatures.showFeedback("toolFinding", "warn", "Select a mission first, then answer the decision points."); return; }
    var dId = btn.getAttribute("data-decision");
    var oIdx = parseInt(btn.getAttribute("data-option"), 10);
    if(state.decisionsAnswered[dId]){
      window.PFFeatures.showFeedback("fb-" + dId, "warn", "This decision is already answered. Reset the mission to try it again.");
      return;
    }
    var dec = null;
    state.mission.decisions.forEach(function(d){ if(d.id === dId) dec = d; });
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
    if(state.decisionsDone >= state.mission.decisions.length) showOutcome();
  }

  function showOutcome(){
    if(!state) return;
    var text;
    if(state.correctCount === state.mission.decisions.length) text = state.mission.outcomeGood;
    else if(state.correctCount === 1) text = state.mission.outcomePartial;
    else text = state.mission.outcomePoor;
    var box = $("mOutcome");
    box.innerHTML = "<b>Scenario outcome.</b> " + esc(text) + " Final score for this mission: <b>" + state.score + " / " + TOTAL + "</b>.";
    box.style.display = "block";
    box.scrollIntoView({behavior: "smooth", block: "center"});
  }

  function resetMission(){
    if(!state){ window.PFFeatures.showFeedback("toolFinding", "warn", "Select a mission first. There is nothing to reset yet."); return; }
    var m = state.mission;
    renderMission(m);
    window.PFFeatures.showFeedback("toolFinding", "ok", "Mission reset. Investigation tools and decisions are ready again.");
  }

  document.addEventListener("DOMContentLoaded", function(){
    refreshBestScores();
    var cards = document.querySelectorAll("[data-mission-open]");
    cards.forEach(function(card){
      card.addEventListener("click", function(){
        var m = missionById(card.getAttribute("data-mission-open"));
        if(m) renderMission(m);
      });
    });
    var panel = $("missionPanel");
    if(panel){
      panel.addEventListener("click", function(e){
        var t = e.target;
        if(!t || t.tagName !== "BUTTON") return;
        if(t.getAttribute("data-tool")) onToolClick(t);
        else if(t.getAttribute("data-option") !== null) onDecisionClick(t);
        else if(t.id === "resetBtn") resetMission();
        else if(t.id === "backBtn"){
          $("missionPanel").style.display = "none";
          $("dashboard").scrollIntoView({behavior: "smooth", block: "start"});
        }
      });
    }
    var resetAll = $("resetAllBtn");
    if(resetAll){
      resetAll.addEventListener("click", function(){
        if(confirm("Reset your Mission Control progress in this browser?")){
          window.PFFeatures.resetFeature(FEATURE_ID);
          if(state) renderMission(state.mission);
          refreshBestScores();
        }
      });
    }
  });
})();
