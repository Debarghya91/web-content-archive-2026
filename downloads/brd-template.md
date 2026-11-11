# Business Requirement Document (BRD) Template for a Payments Change

> How to use this template: replace every bracketed placeholder such as [Project name] with your own detail, and delete the worked example text only after you have written your own. The worked example throughout this template is an MT103 to pacs.008 migration, so you can see what good looks like in each section. Keep this document in version control with the project. When a requirement changes, update the version table below and the linked interface mapping and test scenarios in the same change.

## Document control

| Field | Detail |
|---|---|
| Project name | [Project name, for example MT103 to pacs.008 migration for euro cross-border customer payments] |
| Document title | Business Requirement Document |
| Version | [0.1 draft, 1.0 approved] |
| Date | [YYYY-MM-DD] |
| Author (Business Analyst) | [Name, team] |
| Product Owner | [Name] |
| Status | [Draft / In review / Approved] |

### Version history

| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | [YYYY-MM-DD] | [Name] | First draft for review |
| 1.0 | [YYYY-MM-DD] | [Name] | Approved by [approver names] |

### Worked example

Project: Migrate outbound euro cross-border customer payments from SWIFT MT103 to ISO 20022 pacs.008.001.10 on the bank's payment hub, for the TARGET2 and correspondent banking routes. Go-live is planned in two waves, low-value payments first, then high-value payments.

## 1. Purpose

State the business problem, why it must be solved now, and what success looks like. One paragraph of problem, one paragraph of outcome. Do not describe the solution here, describe the need.

### Worked example

The bank still sends outbound euro cross-border customer payments as SWIFT MT103 messages. The MT standard is being retired for cross-border payments under the SWIFT ISO 20022 migration, and correspondent banks will stop accepting MT103 for these payments after the migration deadline. If the bank does not migrate, outbound euro customer payments will be rejected by correspondents, customer payments will fail, and the bank will face manual repair work on every payment. Success means every outbound euro cross-border customer payment leaves the bank as a validated pacs.008.001.10 message, is accepted by the receiving bank on first submission, and settles on the requested value date, with no increase in the rejection rate after go-live.

## 2. Scope

### 2.1 In scope

List exactly what the change covers: products, currencies, corridors, channels, message types, and systems. If it is not listed here, it is not in scope.

### Worked example

- Outbound euro cross-border customer payments sent as pacs.008.001.10.
- The payment hub, the core banking interface, and the SWIFT gpi tracking interface.
- MT103 to pacs.008 field mapping for fields :20:, :23B:, :32A:, :50a:, :52A:, :53a:, :57A:, :59:, :70:, :71A: and :72:.
- Structured debtor and creditor names and addresses, as required by the ISO 20022 migration rules.
- Rejection handling for pacs.002 RJCT, with reason codes AC01, AC04, BE01, RC01, RR04, DT01, TM01 and AM05.
- Operations training and updated procedure notes for the payment operations team.

### 2.2 Out of scope

List what is explicitly excluded, so nobody assumes it is included.

### Worked example

- Inbound customer payments (MT103 received from other banks) are out of scope and stay on the existing process until a later phase.
- MT202 and pacs.009 bank-to-bank payments are out of scope.
- Changes to pricing, cut-off times, or customer fees are out of scope.
- The sanctions screening engine is out of scope, except for the interface that passes screening results to the hub.
- Any change to the customer front-end or online banking screens is out of scope.

### 2.3 Assumptions and dependencies

| ID | Assumption or dependency | Impact if wrong |
|---|---|---|
| A-01 | [For example: the SWIFT BIC directory is available to the hub daily] | [For example: BIC validation falls back to format checks only] |
| D-01 | [For example: the correspondent bank accepts pacs.008.001.10 from the test date] | [For example: end-to-end testing slips by the test window] |

### Worked example

Assumption A-01: the correspondent bank accepts pacs.008.001.10 in the test environment from the start of system integration testing. If that date slips, end-to-end testing slips by the same number of days, and go-live moves. Dependency D-01: the payment hub vendor delivers the pacs.008 mapping release before build starts. If it slips, the mapping work in section 7 cannot start.

## 3. Stakeholders and approvers

| Role | Name | Responsibility | Approval needed |
|---|---|---|---|
| Business sponsor | [Name] | Owns the business case and the go-live decision | Yes, go-live |
| Product Owner | [Name] | Owns the requirements and priority | Yes, requirements |
| Business Analyst | [Name] | Writes this BRD and the field mapping | No, author |
| Payment operations lead | [Name] | Owns the to-be operating procedure | Yes, operations |
| Engineering lead | [Name] | Owns the build and the interface | Yes, technical design |
| Compliance | [Name] | Clears sanctions and regulatory reporting | Yes, compliance |
| Counterparty bank contact | [Name] | Confirms the interface and test plan | Yes, interface |

### Worked example

Business sponsor: Head of Transaction Banking. Product Owner: Senior Product Manager, Cross-Border Payments. Payment operations lead: Head of Payment Operations. Compliance: Financial Crime Compliance Manager, who must clear the structured address and sanctions screening approach before build. Counterparty bank contact: the correspondent banking relationship manager at the main euro correspondent.

## 4. As-is process

Describe how the payment works today, step by step, with the systems and the manual steps. Include the pain points with evidence, not opinion.

### Worked example

1. A customer submits a euro cross-border payment instruction through online banking or a branch.
2. The core banking system captures the instruction and sends an MT103 to the payment hub.
3. The hub validates the MT103, checks the BIC in :57A: and the account in :59:, and releases it to SWIFT.
4. If the receiving bank rejects the payment, operations receives a return or a pacs.002 equivalent, reads the reason code, and contacts the customer by phone or email.
5. Operations re-keys the corrected payment manually.

Pain points: the MT103 carries the beneficiary name in free text in :59:, so name mismatches cause BE01 returns on about 2 in every 100 payments. The remittance field :70: is limited to 4 lines of 35 characters, so invoice references are truncated. Operations spends an estimated 40 minutes per returned payment on manual repair and customer contact.

## 5. To-be process

Describe how the payment will work after the change, step by step, and what changes for the customer, operations, and engineering. Call out what stays the same.

### Worked example

1. A customer submits a euro cross-border payment instruction as today. The front-end does not change.
2. The core banking system sends the instruction to the payment hub in the new ISO 20022 format.
3. The hub builds a pacs.008.001.10 message with structured debtor and creditor names and addresses, a validated BIC in DbtrAgt and CdtrAgt, and the instructed amount in InstdAmt with Ccy EUR.
4. The hub validates the pacs.008 before release: mandatory elements present, BIC format checked, amount format checked, settlement date checked against the TARGET2 calendar, and the 17:00 CET customer-payment cut-off applied.
5. The hub sends the pacs.008 to SWIFT and tracks it on SWIFT gpi.
6. If the receiving bank rejects the payment, the hub receives a pacs.002 RJCT, maps the reason code to the operations work queue, and operations follows the routing decision tree for that code.

What changes: the message format, the structured address, the pre-release validation, and the rejection handling. What stays the same: the customer journey, the cut-off times, the pricing, and the operations team that handles returns.

## 6. Functional requirements

Number every requirement BR-01 onward. Each requirement must be testable: it states what the system must do, not how it must do it. Give the priority (Must, Should, Could) and the source (stakeholder or regulation).

| ID | Requirement | Priority | Source |
|---|---|---|---|
| BR-01 | [Requirement in testable form] | Must | [Source] |
| BR-02 | [Requirement in testable form] | Must | [Source] |

### Worked example

| ID | Requirement | Priority | Source |
|---|---|---|---|
| BR-01 | The hub must generate a pacs.008.001.10 message for every outbound euro cross-border customer payment, with GrpHdr, PmtInf and CdtTrfTxInf present. | Must | SWIFT ISO 20022 migration |
| BR-02 | The hub must map MT103 field :20: to PmtId InstrId and EndToEndId, preserving the original reference without truncation. | Must | Product Owner |
| BR-03 | The hub must map MT103 field :32A: to InstdAmt with Ccy EUR and IntrBkSttlmDt, converting the YYMMDD date to YYYY-MM-DD and the comma decimal amount to a decimal point amount. | Must | Product Owner |
| BR-04 | The hub must reject a payment before release when DbtrAgt, CdtrAgt, DbtrAcct, CdtrAcct, InstdAmt, InstrId or EndToEndId is missing, and must log the missing element. | Must | Payment operations lead |
| BR-05 | The hub must validate every BIC in DbtrAgt and CdtrAgt as 8 or 11 characters in the pattern 4-letter bank code, 2-letter country code, 2-character location code, optional 3-character branch code, and must reject the payment with RC01 when the BIC is invalid. | Must | Payment operations lead |
| BR-06 | The hub must check the settlement date against the TARGET2 calendar (weekends, 1 January, Good Friday, Easter Monday, 1 May, 25 December, 26 December) and must reject the payment with DT01 when the date is not a TARGET2 business day. | Must | Payment operations lead |
| BR-07 | The hub must apply the 17:00 CET customer-payment cut-off: a payment created after 17:00 CET must be value-dated to the next TARGET2 business day, and must be rejected with TM01 when same-day settlement was requested after cut-off. | Must | Payment operations lead |
| BR-08 | The hub must carry the structured creditor name and address in Cdtr and CdtrAcct, and must not truncate the creditor name below 70 characters without raising a warning to operations. | Must | Compliance |
| BR-09 | The hub must map the MT103 :70: remittance information to RmtInf Ustrd, up to 140 characters, and must log a truncation warning when the source text is longer than 140 characters. | Should | Product Owner |
| BR-10 | The hub must map the MT103 :71A: charges instruction to ChrgBr, using BEN, OUR or SHA without change. | Must | Product Owner |
| BR-11 | On a pacs.002 RJCT, the hub must display the reason code, the field that caused the rejection, and the next action from the routing decision tree in the operations work queue. | Must | Payment operations lead |
| BR-12 | The hub must detect a duplicate payment on InstrId and EndToEndId plus amount and value date, and must block the duplicate with AM05 before release. | Must | Payment operations lead |

## 7. Message and field mapping

Give the full mapping in the companion spreadsheet `iso20022-interface-mapping.csv`. Summarise the mapping rules here: which fields map one to one, which need conversion, which are dropped, and where truncation can happen.

### Worked example

- One-to-one mappings: :20: to InstrId and EndToEndId, :71A: to ChrgBr, :59: account to CdtrAcct IBAN.
- Conversion mappings: :32A: date YYMMDD to IntrBkSttlmDt YYYY-MM-DD, :32A: amount with comma decimal to InstdAmt with decimal point, :50K: free-text name and address to structured Dbtr name and postal address.
- Dropped fields: :72: sender-to-receiver information is not carried in pacs.008 unless it maps to a structured instruction field, and any text that does not fit must be logged, not silently dropped.
- Truncation risks: :59: beneficiary name is limited to 35 characters per line in MT103 and 70 characters in Cdtr Nm in pacs.008, so a name that spans two MT lines must be joined and checked; :70: remittance is 4 lines of 35 characters in MT103 and 140 characters in RmtInf Ustrd, so longer text must raise a warning.
- The full row-by-row mapping, with XPath, data type, maximum length, mandatory or optional status, and truncation risk, is in `iso20022-interface-mapping.csv`.

## 8. Non-functional requirements

| ID | Area | Requirement |
|---|---|---|
| NFR-01 | Performance | [For example: the hub must validate and release a pacs.008 within 5 seconds of receipt, at peak volume] |
| NFR-02 | Availability | [For example: the hub must be available during TARGET2 operating hours, with no planned outage on a business day] |
| NFR-03 | Security | [For example: payment data must be encrypted in transit and at rest, and access must be role based] |
| NFR-04 | Audit | [For example: every validation, rejection and re-release must be logged with the instruction ID, timestamp and user] |
| NFR-05 | Usability | [For example: the operations work queue must show the reason code and the next action without opening the raw message] |

### Worked example

| ID | Area | Requirement |
|---|---|---|
| NFR-01 | Performance | The hub must validate and release a pacs.008 within 5 seconds of receipt at a peak of 500 payments per hour. |
| NFR-02 | Availability | The hub must be available from 07:00 to 18:00 CET on TARGET2 business days. No planned change is allowed on a TARGET2 business day without operations approval. |
| NFR-03 | Security | Payment data must be encrypted in transit and at rest. Only the operations and engineering roles may view full account numbers. |
| NFR-04 | Audit | Every validation failure, rejection, duplicate block and re-release must be logged with the instruction ID, the timestamp, the reason code and the user who acted. |
| NFR-05 | Usability | The operations work queue must show the reason code, the field at fault and the next action, so an operator can act without opening the raw XML. |

## 9. Test scenarios

Give the full scenario list in the companion spreadsheet `test-harness-scenarios.csv`. Summarise the test approach here: test types, environments, entry and exit criteria, and who signs off testing.

### Worked example

Test types: happy path, missing mandatory field, invalid BIC, duplicate payment, closed account, cut-off breach, settlement date on a TARGET2 holiday, sanctions hit, amount limit breach, and character set violation. Each scenario states the input, the expected result, and the expected rejection or return code, and is owned by a named tester. Entry criteria: the interface mapping is signed off and the test environment has a TARGET2 calendar loaded. Exit criteria: every Must scenario passes, every defect is either fixed or accepted in writing by the Product Owner, and the rejection rate on the test set is at or below the current live rate. Test sign-off: Payment operations lead and Engineering lead.

## 10. Cutover and rollback plan

### 10.1 Cutover

List the cutover steps in order, with the owner and the time for each step. Include the freeze, the data migration, the verification checks, and the go or no-go decision point.

### Worked example

1. Friday 18:00 CET: freeze on payment hub changes. Owner: Engineering lead.
2. Saturday 09:00 CET: deploy the pacs.008 mapping release to production. Owner: Engineering lead.
3. Saturday 11:00 CET: run the smoke test set, 10 payments covering the happy path, an invalid BIC, and a TARGET2 holiday date. Owner: Payment operations lead.
4. Saturday 12:00 CET: go or no-go decision. Go requires all 10 smoke tests to pass and no open Must defect. Owner: Business sponsor.
5. Monday 07:00 CET: wave 1 go-live, low-value payments only, with operations watching the work queue for the first 4 hours. Owner: Payment operations lead.
6. Monday 14:00 CET: wave 1 review. If the rejection rate is at or below the current live rate, wave 2 (high-value payments) starts on Tuesday. Owner: Product Owner.

### 10.2 Rollback

State the trigger, the steps, the time to roll back, and what happens to payments already released.

### Worked example

Rollback trigger: the rejection rate in wave 1 is more than double the current live rate, or any payment settles on the wrong value date, or the hub cannot release payments for more than 30 minutes. Rollback steps: stop new pacs.008 releases, switch the hub back to MT103 generation using the previous release, and re-send any payment that was rejected in the pacs.008 wave as an MT103 with a new instruction ID. Time to roll back: under 2 hours. Payments that already settled as pacs.008 stay settled and are not recalled. The rollback decision is owned by the Business sponsor on the advice of the Engineering lead.

## 11. Risks and open questions

| ID | Risk or question | Impact | Mitigation or owner | Status |
|---|---|---|---|---|
| R-01 | [Risk in one line] | [High, Medium, Low] | [Mitigation] | Open |
| Q-01 | [Open question] | [What it blocks] | [Owner and due date] | Open |

### Worked example

| ID | Risk or question | Impact | Mitigation or owner | Status |
|---|---|---|---|---|
| R-01 | Correspondent bank test environment is late, so end-to-end testing slips. | High | Weekly check-in with the correspondent relationship manager; keep the MT103 route as fallback until testing passes. | Open |
| R-02 | Structured address data is incomplete in the core banking system, so Cdtr address fails validation. | Medium | Data quality check on the top 100 beneficiaries before build; default the address from the customer record where the instruction has none. | Open |
| R-03 | Operations is not ready for pacs.002 reason codes and treats every rejection as a system error. | Medium | Training on the routing decision tree before go-live; the work queue shows the next action for each code. | Open |
| Q-01 | Does the correspondent require the structured address in the hybrid or the fully structured form? | Blocks BR-08 | Product Owner to confirm with the correspondent by [date]. | Open |
| Q-02 | Is the 17:00 CET cut-off the hub cut-off or the correspondent cut-off for this corridor? | Blocks BR-07 | Engineering lead to confirm against the cut-off table by [date]. | Open |

## 12. Approval

| Approver | Role | Signature | Date |
|---|---|---|---|
| [Name] | Business sponsor | | |
| [Name] | Product Owner | | |
| [Name] | Payment operations lead | | |
| [Name] | Engineering lead | | |
| [Name] | Compliance | | |

Approval means the scope, the requirements in section 6, the mapping approach in section 7, and the cutover and rollback plan in section 10 are agreed. Any change after approval goes through the version history at the top of this document.
