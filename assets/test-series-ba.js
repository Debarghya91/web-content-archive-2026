// Business Analyst Test Series: 30 tests x 10 questions = 300 questions.
// Topics in order, foundations to advanced:
// 1. Requirements Foundations
// 2. Requirements Elicitation Techniques
// 3. Requirements Documentation
// 4. User Stories and Acceptance Criteria
// 5. Stakeholder Analysis and Management
// 6. Agile and Scrum Ways of Working
// 7. Process Analysis and Process Mapping
// 8. Data Analysis and SQL Basics
// 9. UAT Planning and Execution
// 10. Traceability and Coverage
// 11. Prioritisation Techniques
// 12. Workshops and Interviews
// 13. BRD, FRD and Use Cases
// 14. Change Control
// 15. Estimation Techniques
// 16. Definition of Done and Definition of Ready
// 17. Backlog Refinement
// 18. Non-Functional Requirements
// 19. RACI and Accountability
// 20. Swimlane and Flow Diagrams
// 21. Gap Analysis
// 22. Root Cause Analysis
// 23. BA Tools and Jira Hygiene
// 24. Advanced Requirements: Ambiguity and Conflict
// 25. Advanced Stakeholder and Negotiation Scenarios
// 26. Advanced Agile Delivery Scenarios
// 27. Advanced Process Improvement Scenarios
// 28. Advanced Data and Reporting Scenarios
// 29. Advanced UAT and Release Scenarios
// 30. Applied BA Capstone Scenarios
window.PA_TEST_SERIES_BA = {
  "series_id": "ba",
  "series_title": "Business Analyst Test Series",
  "tests": [
    {
      "mode": "test",
      "test": {
        "id": "ba-01",
        "title": "BA Test 1: Requirements Foundations",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-01-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A stakeholder says the new system must be fast and user friendly. What should the BA do first?",
          "options": [
            "Ask what fast and user friendly mean in measurable terms",
            "Assume industry standard response times apply",
            "Defer the requirement until testing begins",
            "Record the words exactly and pass them to developers"
          ],
          "answer": 0,
          "explanation": "Vague qualities cannot be built or tested until they are measurable. The BA must turn them into specific, testable criteria with the stakeholder. Recording vague words unchanged leaves the team guessing.",
          "why_wrong": [
            "",
            "Assuming standards may not match what this stakeholder actually needs.",
            "Waiting until testing is far too late to clarify a requirement.",
            "Passing vague words on leaves developers to guess what the stakeholder meant."
          ]
        },
        {
          "id": "ba-01-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A business user asks for a new report. What is the best first question for the BA?",
          "options": [
            "What colour should the report header be?",
            "What decision will this report support?",
            "Which tool should generate the report?",
            "Who else wants a copy of the report?"
          ],
          "answer": 1,
          "explanation": "Understanding the decision the report supports reveals the real need, the right data, and the right format. Starting with presentation or tooling skips the purpose. Purpose-first questioning avoids building reports nobody uses.",
          "why_wrong": [
            "Header colour is a cosmetic detail that says nothing about the report purpose.",
            "",
            "Tool choice comes after the need and content are understood.",
            "Distribution matters later, but purpose must come first."
          ]
        },
        {
          "id": "ba-01-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Which of these is a well-written functional requirement?",
          "options": [
            "Users should be happy with the system",
            "The system should be easy to use",
            "The system must display an error message when a mandatory field is left blank",
            "The system must be modern and robust"
          ],
          "answer": 2,
          "explanation": "A good functional requirement states a specific behaviour that can be built and tested. The error message requirement names the trigger and the response. The other options are vague and untestable.",
          "why_wrong": [
            "User happiness is an outcome, not a system behaviour.",
            "Easy to use is subjective and cannot be tested as written.",
            "",
            "Modern and robust are vague qualities with no testable meaning."
          ]
        },
        {
          "id": "ba-01-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A requirement says the system must support all users. Why is this a problem?",
          "options": [
            "It uses the word must instead of should",
            "It belongs in a user story, not a requirement",
            "It is too short to be a requirement",
            "It does not say who the users are or what support means"
          ],
          "answer": 3,
          "explanation": "All users is undefined, and support is undefined, so the requirement cannot be designed, estimated, or tested. Good requirements name the actor and the behaviour. Length and wording style are not the real issue.",
          "why_wrong": [
            "Must versus should is about priority, not the core ambiguity here.",
            "The problem is ambiguity, not the document it sits in.",
            "Short requirements can be fine if they are specific and testable.",
            ""
          ]
        },
        {
          "id": "ba-01-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Two stakeholders give conflicting requirements for the same screen. What should the BA do first?",
          "options": [
            "Bring both stakeholders together to agree on one outcome",
            "Record both and leave the conflict for developers",
            "Pick the requirement from the more senior stakeholder",
            "Build both versions and let users choose"
          ],
          "answer": 0,
          "explanation": "Conflicts must be resolved with the stakeholders who own the need, before build starts. A facilitated discussion surfaces the underlying goals and reaches one agreed requirement. Picking sides or deferring the conflict guarantees rework.",
          "why_wrong": [
            "",
            "Leaving the conflict for developers pushes a business decision onto the wrong people.",
            "Seniority does not make a requirement correct for the business need.",
            "Building two versions wastes effort and still leaves the conflict unresolved."
          ]
        },
        {
          "id": "ba-01-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What does it mean for a requirement to be testable?",
          "options": [
            "A tester has read it",
            "It can be verified by an observable result",
            "It is written in technical language",
            "It has been approved by the project manager"
          ],
          "answer": 1,
          "explanation": "A testable requirement describes an observable outcome, so a tester can check whether it is met. Reading, technical language, and approval do not make something verifiable. Testability is about observable evidence.",
          "why_wrong": [
            "A tester reading a requirement does not make it verifiable.",
            "",
            "Technical language can still describe something unobservable.",
            "Approval is governance, not evidence the requirement can be verified."
          ]
        },
        {
          "id": "ba-01-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A stakeholder keeps adding new wishes during every meeting. What is the BA's best response?",
          "options": [
            "Tell the stakeholder to raise wishes only by email",
            "Add every wish to the scope immediately",
            "Capture each wish, assess its impact, and agree priority with the owner",
            "Refuse to discuss anything not in the original scope"
          ],
          "answer": 2,
          "explanation": "New wishes must be captured so nothing is lost, then assessed for impact and prioritised by the product owner. Blindly adding them causes scope creep, while refusing them damages trust. Controlled capture plus prioritisation keeps scope honest.",
          "why_wrong": [
            "Restricting the channel does not solve the prioritisation problem.",
            "Adding everything immediately causes uncontrolled scope creep.",
            "",
            "Refusing discussion shuts down legitimate needs and harms the relationship."
          ]
        },
        {
          "id": "ba-01-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Which requirement characteristic means it can be traced to a business need?",
          "options": [
            "Feasible",
            "Unambiguous",
            "Atomic",
            "Traceable"
          ],
          "answer": 3,
          "explanation": "Traceability links each requirement back to its source need and forward to design, build, and test. Atomic means one need per requirement, feasible means achievable, and unambiguous means one interpretation. Only traceable describes the link to the business need.",
          "why_wrong": [
            "Feasible means the requirement can realistically be delivered.",
            "Unambiguous means it has only one reasonable interpretation.",
            "Atomic means a requirement covers a single need, not its link to a source.",
            ""
          ]
        },
        {
          "id": "ba-01-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A developer says a requirement is impossible to build as written. What should the BA do?",
          "options": [
            "Work with the developer and stakeholder to find an achievable alternative",
            "Escalate to senior management immediately",
            "Tell the developer to try harder",
            "Remove the requirement from the document"
          ],
          "answer": 0,
          "explanation": "Feasibility problems are solved by bringing the technical constraint and the business need together to find an alternative that still meets the goal. Removing the requirement or escalating first skips the collaborative step. The BA bridges business and technology.",
          "why_wrong": [
            "",
            "Escalation is premature before the team has tried to solve it together.",
            "Telling the developer to try harder ignores a genuine technical constraint.",
            "Removing the requirement drops the business need without discussion."
          ]
        },
        {
          "id": "ba-01-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Why should requirements be reviewed by both business and technical reviewers?",
          "options": [
            "To increase the number of meetings",
            "Business reviewers check the need, technical reviewers check feasibility",
            "To delay sign-off until everyone agrees",
            "Only technical reviewers can spot grammar errors"
          ],
          "answer": 1,
          "explanation": "Business reviewers confirm the requirement solves the right problem, and technical reviewers confirm it can be built within constraints. Both perspectives catch different defects early. Review is about quality, not headcount or delay.",
          "why_wrong": [
            "More meetings is not a goal; review quality is.",
            "",
            "Review aims for early defect detection, not deliberate delay.",
            "Grammar checks are not the main purpose of technical review."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-02",
        "title": "BA Test 2: Requirements Elicitation Techniques",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-02-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA needs to understand how claims handlers really process claims today. Which technique is most direct?",
          "options": [
            "Reading the policy manual only",
            "Observing handlers doing the work",
            "Sending a survey to all staff",
            "Reviewing last year's project plan"
          ],
          "answer": 1,
          "explanation": "Observation shows the real process, including workarounds that documents never mention. Manuals describe the intended process, not the lived one. Watching the work is the most direct way to learn actual practice.",
          "why_wrong": [
            "The manual describes intended practice, which often differs from real practice.",
            "",
            "Surveys capture opinions at scale but miss the detail of real work.",
            "An old project plan says nothing about how claims are handled today."
          ]
        },
        {
          "id": "ba-02-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "When is a questionnaire the best elicitation technique?",
          "options": [
            "When the BA needs to see a task performed",
            "When deep discussion of a complex process is needed",
            "When input is needed from a large, dispersed group quickly",
            "When two stakeholders strongly disagree"
          ],
          "answer": 2,
          "explanation": "Questionnaires scale well across many people in different locations and produce comparable answers fast. Deep discussion, conflict resolution, and task observation all need richer, interactive techniques. Use the tool that fits the situation.",
          "why_wrong": [
            "Seeing a task performed requires observation, not a questionnaire.",
            "Complex processes need interactive discussion, not fixed questions.",
            "",
            "Disagreement needs facilitated conversation, not a form."
          ]
        },
        {
          "id": "ba-02-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A stakeholder gives short, guarded answers in an interview. What should the BA do?",
          "options": [
            "End the interview early",
            "Fill the silence by answering for them",
            "Ask only closed yes-or-no questions",
            "Ask open questions and allow silence after asking"
          ],
          "answer": 3,
          "explanation": "Open questions invite fuller answers, and comfortable silence gives the stakeholder space to think and expand. Closed questions narrow the conversation further. Answering for the stakeholder puts the BA's words in their mouth.",
          "why_wrong": [
            "Ending early loses the chance to build rapport and gather needs.",
            "Answering for them records the BA's assumptions, not the stakeholder's needs.",
            "Closed questions produce even shorter answers.",
            ""
          ]
        },
        {
          "id": "ba-02-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is the main benefit of prototyping during elicitation?",
          "options": [
            "It lets stakeholders react to something concrete early",
            "It guarantees the final design",
            "It removes the need for testing",
            "It replaces the need for requirements"
          ],
          "answer": 0,
          "explanation": "A prototype turns abstract ideas into something stakeholders can see and touch, which surfaces misunderstandings early when they are cheap to fix. It does not replace requirements, guarantee design, or remove testing. Its value is early concrete feedback.",
          "why_wrong": [
            "",
            "A prototype is a draft for discussion, not a guaranteed final design.",
            "Testing is still needed whatever the prototype showed.",
            "Prototypes support requirements; they do not replace them."
          ]
        },
        {
          "id": "ba-02-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA is eliciting requirements from a group with very different views. Which technique helps build shared agreement?",
          "options": [
            "Reading existing documents",
            "A facilitated workshop",
            "An anonymous survey",
            "One-to-one emails"
          ],
          "answer": 1,
          "explanation": "A facilitated workshop brings different views into one room where the BA can surface differences, guide discussion, and drive toward agreement. Surveys, emails, and documents do not create shared understanding in real time. Facilitation is the key skill here.",
          "why_wrong": [
            "Documents reflect past decisions, not a path to new agreement.",
            "",
            "Surveys collect views but do not resolve differences between them.",
            "Emails keep views separate and slow down agreement."
          ]
        },
        {
          "id": "ba-02-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What should a BA do immediately after an elicitation interview?",
          "options": [
            "Delete notes that contradict other stakeholders",
            "Wait until all interviews are done before writing anything",
            "Write up notes and confirm them with the interviewee",
            "Share raw notes with the whole project team"
          ],
          "answer": 2,
          "explanation": "Writing up promptly while memory is fresh, then confirming with the interviewee, catches misunderstandings early. Waiting risks forgetting detail, sharing raw notes risks misinterpretation, and deleting contradictions hides real conflicts. Confirm early and often.",
          "why_wrong": [
            "Contradictions must be surfaced and resolved, not deleted.",
            "Waiting lets memory fade and errors creep into the record.",
            "",
            "Raw notes may contain half-formed ideas that mislead the wider team."
          ]
        },
        {
          "id": "ba-02-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A stakeholder says, 'Just build what the old system does.' What is the risk if the BA accepts this?",
          "options": [
            "The project will finish too early",
            "Stakeholders will be too happy",
            "The new system will be too fast",
            "Old inefficiencies and workarounds get copied into the new system"
          ],
          "answer": 3,
          "explanation": "Replicating the old system without analysis copies its inefficiencies, obsolete steps, and workarounds into the new build. The BA must understand which behaviours are still needed and which should improve. Like-for-like is rarely the right goal.",
          "why_wrong": [
            "Copying old behaviour does not make a project finish early.",
            "Stakeholder satisfaction is not the risk here.",
            "Speed is not the risk of copying an old system.",
            ""
          ]
        },
        {
          "id": "ba-02-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Which question is most likely to uncover an unstated assumption?",
          "options": [
            "What happens when this step fails?",
            "How many users are there?",
            "What is your job title?",
            "Do you like the current system?"
          ],
          "answer": 0,
          "explanation": "Asking about failure paths exposes assumptions about what always works, what never happens, and what happens when it does. Preference, headcount, and title questions gather facts but rarely surface hidden assumptions. Edge cases reveal the gaps.",
          "why_wrong": [
            "",
            "User counts are useful facts but do not expose assumptions.",
            "A job title does not reveal assumptions about the process.",
            "Liking a system reveals preference, not hidden assumptions."
          ]
        },
        {
          "id": "ba-02-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA inherits a project with no documented requirements. What is the best first step?",
          "options": [
            "Copy requirements from a similar past project",
            "Start building from the existing code",
            "Interview key users and review the current system together",
            "Ask the sponsor to write the requirements"
          ],
          "answer": 2,
          "explanation": "Talking to key users while reviewing the current system rebuilds understanding of both the need and the reality. Building from code alone misses intent, sponsors rarely write usable requirements, and copied requirements describe a different context. Ground truth comes from users plus the system.",
          "why_wrong": [
            "Another project's requirements describe different needs and constraints.",
            "Code shows what the system does, not why or what users actually need.",
            "",
            "Sponsors own the vision, but writing detailed requirements is the BA's job."
          ]
        },
        {
          "id": "ba-02-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Why should a BA avoid leading questions during elicitation?",
          "options": [
            "They are always closed questions",
            "Stakeholders dislike long questions",
            "They take too long to ask",
            "They push the stakeholder toward the BA's preferred answer"
          ],
          "answer": 3,
          "explanation": "A leading question suggests the answer the BA expects, so the response reflects the BA's bias rather than the stakeholder's real need. Good elicitation uses neutral, open questions. The risk is biased requirements, not question length.",
          "why_wrong": [
            "Leading questions can be open or closed; the bias is the issue.",
            "Stakeholder preference about length is not the core risk.",
            "Length is not the problem with leading questions.",
            ""
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-03",
        "title": "BA Test 3: Requirements Documentation",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-03-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A requirement document is 200 pages long and nobody reads it. What is the most likely problem?",
          "options": [
            "It lacks a cover page",
            "It was not printed",
            "It contains too much detail for its audience",
            "It was written in the wrong font"
          ],
          "answer": 2,
          "explanation": "Documentation must fit its audience and purpose; a huge document that nobody reads fails as a communication tool. The fix is to structure it for readers, with summaries, clear sections, and the right level of detail. Format and printing are not the issue.",
          "why_wrong": [
            "A cover page does not make 200 pages readable.",
            "Printing does not solve a readability problem.",
            "",
            "Font choice does not explain why nobody reads a document."
          ]
        },
        {
          "id": "ba-03-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What belongs in a requirements document version history?",
          "options": [
            "The full text of every requirement",
            "Meeting room booking details",
            "The names of everyone who might read it",
            "Version number, date, author, and summary of changes"
          ],
          "answer": 3,
          "explanation": "Version history lets readers see what changed, when, and by whom, so they can trust they are reading the current version. It is a change log, not a reader list or a repeat of the content. Good version control prevents work on outdated requirements.",
          "why_wrong": [
            "Repeating full requirement text in the history duplicates the document.",
            "Room bookings are irrelevant to document control.",
            "A reader list is not version history.",
            ""
          ]
        },
        {
          "id": "ba-03-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA writes: 'The system shall process payments quickly.' Why would a reviewer reject this?",
          "options": [
            "Quickly is not measurable or testable",
            "It is too specific",
            "It mentions payments",
            "It uses the word shall"
          ],
          "answer": 0,
          "explanation": "Quickly has no agreed measure, so nobody can tell whether the requirement is met. A reviewer would ask for a specific time bound, such as a response time in seconds under stated conditions. Shall is standard requirement language, and specificity is a virtue.",
          "why_wrong": [
            "",
            "The statement is vague, not too specific.",
            "Mentioning payments is appropriate for a payments system.",
            "Shall is normal, precise language for a mandatory requirement."
          ]
        },
        {
          "id": "ba-03-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Which practice best keeps requirements consistent across a long document?",
          "options": [
            "Letting each author invent their own terms",
            "Using the same term for the same concept throughout",
            "Writing each section in a different style",
            "Avoiding all diagrams"
          ],
          "answer": 1,
          "explanation": "A shared glossary and consistent terminology prevent the same concept being called different things in different sections, which causes confusion and defects. Consistent terms are a basic quality control. Different styles and invented terms create ambiguity.",
          "why_wrong": [
            "Invented terms per author guarantee inconsistency.",
            "",
            "Mixed styles make a document harder to follow and review.",
            "Diagrams aid understanding; avoiding them does not help consistency."
          ]
        },
        {
          "id": "ba-03-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A stakeholder approves requirements verbally in a corridor chat. What should the BA do?",
          "options": [
            "Ask the stakeholder to approve again in six months",
            "Treat it as formal approval",
            "Record the agreement in writing and get it confirmed",
            "Ignore it until a meeting is held"
          ],
          "answer": 2,
          "explanation": "Verbal agreement must be captured in writing and confirmed, so there is a shared record both sides accept. Corridor approval without a record leads to disputes about what was agreed. Written confirmation protects everyone.",
          "why_wrong": [
            "Waiting six months lets the agreement go stale and forgotten.",
            "Unrecorded verbal approval leaves no evidence of what was agreed.",
            "",
            "Ignoring genuine agreement wastes progress; capture it instead."
          ]
        },
        {
          "id": "ba-03-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is the purpose of a glossary in a requirements document?",
          "options": [
            "To list every person on the project",
            "To replace the requirements themselves",
            "To impress senior managers",
            "To define terms so all readers share one meaning"
          ],
          "answer": 3,
          "explanation": "A glossary fixes one agreed meaning per term, so business, technical, and test readers interpret the document the same way. It prevents costly misunderstandings from overloaded words. It is a shared language tool, not decoration.",
          "why_wrong": [
            "A people list belongs elsewhere, not in a glossary.",
            "A glossary supports requirements; it cannot replace them.",
            "A glossary serves clarity, not impression.",
            ""
          ]
        },
        {
          "id": "ba-03-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A requirement has been changed after sign-off. What must the BA update?",
          "options": [
            "The requirement, its version history, and any linked design and test items",
            "Only the document cover page",
            "Nothing, since it was already signed off",
            "Only the requirement itself"
          ],
          "answer": 0,
          "explanation": "A post-sign-off change affects traceability, so the requirement, its history, and every linked artefact must be updated and re-agreed. Updating only the text leaves design and tests pointing at the old version. Change control keeps the chain consistent.",
          "why_wrong": [
            "",
            "The cover page alone does not record the change properly.",
            "Signed-off requirements can change, but only through controlled change.",
            "Updating only the text leaves linked artefacts stale."
          ]
        },
        {
          "id": "ba-03-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Which statement about requirement IDs is correct?",
          "options": [
            "IDs are optional decoration",
            "Each requirement needs a stable, unique ID for traceability",
            "IDs should change every time the text is edited",
            "Only high-priority requirements need IDs"
          ],
          "answer": 1,
          "explanation": "Stable unique IDs let design, code, and tests reference requirements precisely, which is the backbone of traceability. Changing IDs on edit breaks every reference. Every requirement needs an ID, not just important ones.",
          "why_wrong": [
            "IDs enable traceability; they are not decoration.",
            "",
            "Changing IDs on edit breaks all existing references.",
            "All requirements need IDs so all can be traced and tested."
          ]
        },
        {
          "id": "ba-03-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA finds two requirements that contradict each other. What should happen before sign-off?",
          "options": [
            "Delete both requirements",
            "Keep both and note that one is wrong",
            "Sign off and let testers find the conflict",
            "Resolve the contradiction with stakeholders and record the agreed version"
          ],
          "answer": 3,
          "explanation": "Contradictions must be resolved before sign-off, because building from conflicting requirements guarantees rework and failed tests. The BA facilitates agreement and records the single agreed version. Sign-off on a known contradiction is negligent.",
          "why_wrong": [
            "Deleting both may remove a genuine business need.",
            "Keeping a known wrong requirement invites the team to build it.",
            "Letting testers find it wastes build effort and delays the fix.",
            ""
          ]
        },
        {
          "id": "ba-03-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is the best structure for a requirements section that different teams will read?",
          "options": [
            "Short numbered requirements grouped by feature, with a summary up front",
            "Requirements hidden inside meeting minutes",
            "A single diagram with no text",
            "One long paragraph covering everything"
          ],
          "answer": 0,
          "explanation": "Grouped, numbered requirements with a summary let each reader find their part quickly and reference it precisely. Long paragraphs bury detail, minutes are hard to search, and a diagram alone cannot carry full requirements. Structure serves the reader.",
          "why_wrong": [
            "",
            "Meeting minutes are a poor home for requirements readers must find.",
            "A diagram alone cannot express conditions, rules, and exceptions fully.",
            "A long paragraph buries individual requirements and blocks referencing."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-04",
        "title": "BA Test 4: User Stories and Acceptance Criteria",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-04-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Which user story follows the standard 'As a... I want... so that...' format?",
          "options": [
            "The system must support password resets",
            "Password reset: high priority",
            "Build a login page",
            "As a customer, I want to reset my password, so that I can regain access to my account"
          ],
          "answer": 3,
          "explanation": "The standard format names the user, the capability, and the benefit, which keeps the story focused on value. A bare task or system statement loses the user and the reason. The benefit clause is what justifies the work.",
          "why_wrong": [
            "A system statement loses the user perspective and the reason.",
            "A label with a priority is not a user story.",
            "A bare task names no user and no benefit.",
            ""
          ]
        },
        {
          "id": "ba-04-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A story says: 'As a user, I want a dashboard.' What is missing?",
          "options": [
            "A specific user type and the benefit or purpose",
            "A technical design",
            "A test plan",
            "The story is complete as written"
          ],
          "answer": 0,
          "explanation": "User is too generic, and no benefit explains why the dashboard matters, so the team cannot judge scope or success. Specifying who and why focuses the story. Technical design and test plans come later, from the story.",
          "why_wrong": [
            "",
            "Technical design is a solution detail, not the missing story element.",
            "A test plan follows from the story; it is not part of it.",
            "The story is vague about who benefits and why it matters."
          ]
        },
        {
          "id": "ba-04-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What do acceptance criteria define?",
          "options": [
            "How the code will be written",
            "The conditions under which the story is considered done",
            "The order stories are built in",
            "The cost of building the story"
          ],
          "answer": 1,
          "explanation": "Acceptance criteria state the observable conditions that must hold for the story to be accepted, giving developers and testers a shared definition of done. They do not dictate implementation, ordering, or cost. They are the testable contract for the story.",
          "why_wrong": [
            "Implementation detail is for the team, not the acceptance criteria.",
            "",
            "Ordering is prioritisation, not acceptance criteria.",
            "Cost is an estimation concern, not an acceptance condition."
          ]
        },
        {
          "id": "ba-04-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Which acceptance criterion is best written?",
          "options": [
            "Users must be satisfied with login",
            "The page should look nice",
            "Given a valid username and password, when the user clicks Sign in, then the dashboard loads within 3 seconds",
            "The login must be good"
          ],
          "answer": 2,
          "explanation": "The Given-When-Then form states a precondition, an action, and a measurable outcome, so it can be tested directly. Vague criteria about looks, goodness, or satisfaction cannot be verified. Measurable outcomes make criteria useful.",
          "why_wrong": [
            "Satisfaction is an outcome measure, not an acceptance condition.",
            "Looking nice is subjective and untestable.",
            "",
            "Good is vague and gives testers nothing to verify."
          ]
        },
        {
          "id": "ba-04-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A story is too large to complete in one sprint. What should the team do?",
          "options": [
            "Start it and carry it over indefinitely",
            "Reduce its acceptance criteria to nothing",
            "Extend the sprint until it fits",
            "Split it into smaller stories, each delivering value"
          ],
          "answer": 3,
          "explanation": "Splitting a large story into smaller, valuable slices keeps work shippable within a sprint and gives feedback sooner. Extending sprints breaks cadence, carrying over hides the problem, and gutting criteria destroys value. Split by value, not by task.",
          "why_wrong": [
            "Carrying work over repeatedly hides that the story was never sized right.",
            "Removing criteria means delivering something nobody can accept.",
            "Extending the sprint breaks the team's delivery cadence.",
            ""
          ]
        },
        {
          "id": "ba-04-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What does INVEST say a good user story should be?",
          "options": [
            "Independent, Negotiable, Valuable, Estimable, Small, Testable",
            "Important, New, Verified, Exact, Simple, Timely",
            "Internal, Named, Validated, Estimated, Sized, Tracked",
            "Initial, Normal, Visible, Easy, Short, True"
          ],
          "answer": 0,
          "explanation": "INVEST is the standard checklist: Independent, Negotiable, Valuable, Estimable, Small, and Testable. Each quality keeps stories flexible, valuable, and workable. The other lists are invented and do not match the established mnemonic.",
          "why_wrong": [
            "",
            "None of these words is part of INVEST: Important is not Independent, and the rest of the list is invented.",
            "This list swaps in process words like Tracked and Internal, and it misses Negotiable and Valuable, which are core INVEST qualities.",
            "Only the initials match loosely; Normal, Easy and True are not INVEST qualities, and the list misses Negotiable and Estimable."
          ]
        },
        {
          "id": "ba-04-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A developer asks what should happen when a user enters an invalid email address. Where should that answer live?",
          "options": [
            "Only in the developer's head",
            "In the story's acceptance criteria",
            "In the project budget",
            "In a separate email nobody files"
          ],
          "answer": 1,
          "explanation": "Edge cases and validation behaviour belong in the acceptance criteria, where developers and testers both see them and can verify them. Keeping the answer in one person's head or in an unfiled email guarantees inconsistency. Criteria are the shared contract.",
          "why_wrong": [
            "An answer in one person's head is invisible to testers and reviewers.",
            "",
            "The budget has nothing to do with validation behaviour.",
            "An unfiled email will be lost and cannot be referenced."
          ]
        },
        {
          "id": "ba-04-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Who owns the acceptance criteria for a story?",
          "options": [
            "Nobody, they write themselves",
            "The tester alone",
            "The product owner, with input from the team",
            "The project manager alone"
          ],
          "answer": 2,
          "explanation": "The product owner owns acceptance, since they accept the work, but criteria are shaped with developers and testers who know what is feasible and verifiable. Ownership by one silo produces criteria the rest of the team cannot use. Collaboration produces better criteria.",
          "why_wrong": [
            "Criteria need an owner and collaboration to exist at all.",
            "Testers contribute, but acceptance is the product owner's decision.",
            "",
            "The project manager coordinates delivery; they do not own acceptance."
          ]
        },
        {
          "id": "ba-04-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A story has no acceptance criteria at sprint planning. What should happen?",
          "options": [
            "Start building and define criteria later",
            "Clarify and agree criteria before the story is pulled into the sprint",
            "Let the tester invent criteria during testing",
            "Skip acceptance for this story"
          ],
          "answer": 1,
          "explanation": "A story without acceptance criteria is not ready, because the team cannot know when it is done. Criteria must be agreed before commitment. Building blind, inventing criteria late, or skipping acceptance all produce disputed outcomes.",
          "why_wrong": [
            "Building without criteria means the team cannot tell when the story is done.",
            "",
            "Criteria invented during testing were never agreed with the product owner.",
            "Skipping acceptance removes the quality gate entirely."
          ]
        },
        {
          "id": "ba-04-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Which story is written from the right perspective?",
          "options": [
            "As a server, I want more memory",
            "As a database, I want to store records",
            "As a branch manager, I want to see daily totals, so that I can reconcile the day's takings",
            "As a developer, I want to use a new framework"
          ],
          "answer": 2,
          "explanation": "User stories express value from the perspective of a person who benefits, here the branch manager reconciling takings. Databases, servers, and frameworks are technical concerns, not user value. The user perspective keeps the team focused on outcomes.",
          "why_wrong": [
            "A server is infrastructure, not a user.",
            "A database is a component, not a user who gains value.",
            "",
            "A framework preference is a technical choice, not user value."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-05",
        "title": "BA Test 5: Stakeholder Analysis and Management",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-05-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What does a power and interest grid help a BA decide?",
          "options": [
            "How to engage each stakeholder based on their influence and concern",
            "Which stakeholders to exclude from the project",
            "The order of project phases",
            "How much each stakeholder is paid"
          ],
          "answer": 0,
          "explanation": "The grid maps influence against interest so the BA can tailor engagement: manage closely, keep satisfied, keep informed, or monitor. It is an engagement tool, not a pay scale or an exclusion list. Tailored engagement saves time and prevents surprises.",
          "why_wrong": [
            "",
            "The grid guides engagement; it does not justify excluding stakeholders.",
            "Phase ordering is planning, not stakeholder analysis.",
            "Pay has nothing to do with stakeholder analysis."
          ]
        },
        {
          "id": "ba-05-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A high-power, low-interest stakeholder is identified. What is the right engagement approach?",
          "options": [
            "Ignore them until go-live",
            "Keep them satisfied with concise updates on key decisions",
            "Send them every detailed document",
            "Ask them to attend daily stand-ups"
          ],
          "answer": 1,
          "explanation": "High-power, low-interest stakeholders need to stay satisfied without being burdened: short updates on decisions that affect them. Ignoring them risks a late veto, while flooding them with detail wastes their time and yours. Concise and relevant wins.",
          "why_wrong": [
            "Ignoring a powerful stakeholder risks a surprise objection late in the project.",
            "",
            "Flooding a low-interest stakeholder with detail wastes everyone's time.",
            "Daily stand-ups are for the delivery team, not for this stakeholder group."
          ]
        },
        {
          "id": "ba-05-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A key stakeholder has not responded to three emails about a decision. What should the BA do?",
          "options": [
            "Send the same email a fourth time",
            "Assume silence means agreement",
            "Try another channel, such as a brief meeting or call, and escalate if needed",
            "Make the decision without them and never tell them"
          ],
          "answer": 2,
          "explanation": "Silence is not agreement, and repeating the same failed channel rarely works. A different channel, a short meeting, or a call often unblocks the decision, and escalation is appropriate if it stays blocked. The BA must actively unblock decisions.",
          "why_wrong": [
            "Repeating the same failed channel is unlikely to get a response.",
            "Silence is not agreement and must never be treated as approval.",
            "",
            "Deciding without informing a key stakeholder breaks trust and governance."
          ]
        },
        {
          "id": "ba-05-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Why should stakeholder analysis be revisited during a project?",
          "options": [
            "Because stakeholders enjoy being analysed",
            "It should never be revisited once done",
            "Because the grid looks good in reports",
            "Influence, interest, and people change over time"
          ],
          "answer": 3,
          "explanation": "People join and leave, priorities shift, and influence changes as a project evolves, so a one-time analysis goes stale. Revisiting it keeps engagement matched to reality. Static analysis misses new stakeholders and changed attitudes.",
          "why_wrong": [
            "Stakeholder enjoyment is not the purpose of the analysis.",
            "Never revisiting leaves the team working from an outdated picture.",
            "Report appearance is not a reason to revisit analysis.",
            ""
          ]
        },
        {
          "id": "ba-05-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A stakeholder openly opposes the project in a meeting. What is the BA's best first move?",
          "options": [
            "Listen to their concern, acknowledge it, and explore the reason behind it",
            "Exclude them from future meetings",
            "Report them to their manager immediately",
            "Argue with them in front of everyone"
          ],
          "answer": 0,
          "explanation": "Opposition usually signals a real concern, a risk, or a missed need, and listening surfaces it. Acknowledging the concern and exploring its cause turns resistance into useful input. Arguing, excluding, or reporting escalates without learning anything.",
          "why_wrong": [
            "",
            "Excluding a critic hides the concern instead of addressing it.",
            "Reporting first skips the chance to understand and resolve the concern.",
            "Public argument entrenches opposition and damages the meeting."
          ]
        },
        {
          "id": "ba-05-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Who is a stakeholder?",
          "options": [
            "Only the project sponsor",
            "Anyone affected by, or able to affect, the project outcome",
            "Only people who attend meetings",
            "Only the delivery team"
          ],
          "answer": 1,
          "explanation": "Stakeholders include anyone impacted by the change or able to influence it: users, sponsors, regulators, support teams, and more. Limiting the definition to sponsors, attendees, or the team misses people whose needs or resistance will surface later.",
          "why_wrong": [
            "The sponsor is one stakeholder among many.",
            "",
            "People who never attend meetings can still be heavily affected.",
            "The delivery team is only one stakeholder group."
          ]
        },
        {
          "id": "ba-05-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA discovers an affected team was never consulted. What should happen?",
          "options": [
            "Blame the project manager and move on",
            "Proceed and tell them at go-live",
            "Engage them promptly, understand their needs, and assess the impact",
            "Ask them to adapt without discussion"
          ],
          "answer": 2,
          "explanation": "A missed stakeholder group must be engaged as soon as the gap is found, so their needs and the impact on them are understood before decisions harden. Telling them at go-live invites resistance and rework. Early engagement is always cheaper than late discovery.",
          "why_wrong": [
            "Blame does not fix the gap; engagement does.",
            "Telling an affected team at go-live invites resistance and rework.",
            "",
            "Asking a team to adapt without discussion ignores their legitimate needs."
          ]
        },
        {
          "id": "ba-05-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is the main purpose of a stakeholder communication plan?",
          "options": [
            "To reduce all communication to email",
            "To keep stakeholders away from the team",
            "To send the same message to everyone",
            "To define who needs what information, when, and through which channel"
          ],
          "answer": 3,
          "explanation": "A communication plan matches message, audience, timing, and channel, so each stakeholder gets what they need without overload or gaps. One identical message for all ignores different needs. Planned communication prevents surprises.",
          "why_wrong": [
            "Restricting everything to email ignores better channels for some messages.",
            "Keeping stakeholders away is the opposite of good engagement.",
            "One message for everyone ignores different stakeholder needs.",
            ""
          ]
        },
        {
          "id": "ba-05-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Two stakeholder groups want opposite outcomes from the same feature. What should the BA focus on first?",
          "options": [
            "The underlying business goals each group is trying to achieve",
            "The cheapest option",
            "The option that is fastest to build",
            "The group with the louder voice"
          ],
          "answer": 0,
          "explanation": "Opposite positions often hide compatible goals, and understanding the goals opens room for a solution both groups accept. Loudness, cost, and speed are secondary to the real need. Goal-first analysis resolves conflict at its root.",
          "why_wrong": [
            "",
            "Cheapest may serve neither group's real goal.",
            "Fastest to build may deliver the wrong outcome.",
            "Loudness is not a measure of business value."
          ]
        },
        {
          "id": "ba-05-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A sponsor asks the BA to keep a major scope change quiet from the delivery team. What should the BA do?",
          "options": [
            "Agree and hide the change",
            "Explain that the team needs the information to deliver correctly, and agree how to communicate it",
            "Tell the team secretly without the sponsor knowing",
            "Ignore the change entirely"
          ],
          "answer": 1,
          "explanation": "Hiding a scope change from the team guarantees they build the wrong thing. The BA should explain the delivery risk and agree a proper communication route with the sponsor. Transparency with a plan protects both the sponsor and the team.",
          "why_wrong": [
            "Hiding the change guarantees the team builds against outdated scope.",
            "",
            "Secret disclosure breaks trust with the sponsor and creates confusion.",
            "Ignoring a major change leaves scope, plan, and delivery misaligned."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-06",
        "title": "BA Test 6: Agile and Scrum Ways of Working",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-06-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is the main purpose of a sprint review?",
          "options": [
            "To approve the project budget",
            "To inspect the increment and gather feedback from stakeholders",
            "To assign blame for unfinished work",
            "To plan the next three months in detail"
          ],
          "answer": 1,
          "explanation": "The sprint review inspects the working increment with stakeholders and adapts the backlog based on their feedback. It is a working session about the product, not a blame, planning, or budget meeting. Feedback drives the next priorities.",
          "why_wrong": [
            "Budget approval is not part of a sprint review.",
            "",
            "Blame has no place in a review; the focus is the product and feedback.",
            "Detailed long-range planning is not the review's purpose."
          ]
        },
        {
          "id": "ba-06-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "During a sprint, the product owner wants to add an urgent story. What should happen?",
          "options": [
            "Extend the sprint by a week",
            "Add it silently without telling the team",
            "Discuss it with the team, assess impact, and agree whether to swap something out",
            "Refuse all mid-sprint changes outright"
          ],
          "answer": 2,
          "explanation": "Mid-sprint change is a negotiation: the team assesses impact on the sprint goal and agrees what, if anything, comes out. Silent addition overloads the sprint, blanket refusal ignores genuine urgency, and extending the sprint breaks cadence. Agreed swaps keep the sprint honest.",
          "why_wrong": [
            "Extending the sprint breaks the team's delivery cadence.",
            "Silent addition overloads the sprint without the team's knowledge.",
            "",
            "Blanket refusal ignores genuinely urgent business needs."
          ]
        },
        {
          "id": "ba-06-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What happens in a sprint retrospective?",
          "options": [
            "The product owner reprioritises the backlog",
            "The team estimates the next sprint's stories",
            "The team demos new features to stakeholders",
            "The team reflects on how it worked and agrees improvements"
          ],
          "answer": 3,
          "explanation": "The retrospective is the team's own inspection of its process, relationships, and tools, ending in agreed improvements. Demos belong to the review, prioritisation to refinement, and estimation to planning. Reflection improves how the team works.",
          "why_wrong": [
            "Backlog prioritisation is the product owner's ongoing work, not the retrospective.",
            "Estimation happens in planning and refinement, not the retrospective.",
            "Demos to stakeholders happen in the sprint review, not the retrospective.",
            ""
          ]
        },
        {
          "id": "ba-06-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A daily stand-up is running for 45 minutes with detailed problem solving. What should change?",
          "options": [
            "Keep the stand-up short and move detailed discussion to a follow-up",
            "Make the stand-up even longer",
            "Only the Scrum Master should speak",
            "Cancel stand-ups entirely"
          ],
          "answer": 0,
          "explanation": "The stand-up is a short synchronisation point; detailed problem solving should move to a smaller follow-up so the whole team is not held hostage. Cancelling loses synchronisation, and lengthening wastes more time. Short sync plus focused follow-up is the pattern.",
          "why_wrong": [
            "",
            "A longer stand-up wastes more of the team's time.",
            "Only one person speaking defeats the purpose of team synchronisation.",
            "Cancelling removes the team's daily synchronisation."
          ]
        },
        {
          "id": "ba-06-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Who is accountable for maximising the value of the product?",
          "options": [
            "The Scrum Master",
            "The product owner",
            "The BA",
            "The development team as a whole"
          ],
          "answer": 1,
          "explanation": "The product owner owns the backlog and its ordering, which is how value is maximised. The Scrum Master serves the team's effectiveness, the BA supports analysis, and the team builds the increment. Value accountability sits with the product owner.",
          "why_wrong": [
            "The Scrum Master serves the team and process, not product value decisions.",
            "",
            "The BA supports analysis but does not own value decisions.",
            "The team builds the product; ordering for value is the product owner's job."
          ]
        },
        {
          "id": "ba-06-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is a sprint backlog?",
          "options": [
            "A record of past sprint failures",
            "A list of everything the product will ever need",
            "The set of items the team committed to for the sprint, plus a plan to deliver them",
            "The product owner's private wish list"
          ],
          "answer": 2,
          "explanation": "The sprint backlog is the sprint goal, the selected items, and the team's plan for delivering them. The full product wish list is the product backlog. The sprint backlog is the team's working commitment for one sprint.",
          "why_wrong": [
            "Past failures are retrospective material, not the sprint backlog.",
            "Everything the product will ever need is the product backlog, not the sprint backlog.",
            "",
            "The sprint backlog is the team's shared plan, not a private list."
          ]
        },
        {
          "id": "ba-06-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A team keeps carrying unfinished stories over every sprint. What is the most likely root cause?",
          "options": [
            "Sprints are too short by design",
            "The product owner attends too many meetings",
            "The team is lazy",
            "Stories are too large or not ready when pulled in"
          ],
          "answer": 3,
          "explanation": "Repeated carry-over usually means stories are too big, unclear, or dependent, so they cannot finish within a sprint. Sizing and readiness problems are the common cause. Blaming effort or sprint length misses the systemic issue.",
          "why_wrong": [
            "Sprint length is a fixed cadence; the work must be sized to fit it.",
            "The product owner's meeting load does not explain repeated carry-over.",
            "Blaming the team ignores the systemic sizing and readiness causes.",
            ""
          ]
        },
        {
          "id": "ba-06-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "In Scrum, what is the sprint goal used for?",
          "options": [
            "To give the sprint a single coherent objective the team works toward",
            "To list every task in the sprint",
            "To measure individual performance",
            "To replace the product backlog"
          ],
          "answer": 0,
          "explanation": "The sprint goal gives the sprint coherence and purpose, helping the team make trade-offs when things change. It is an objective, not a task list, a performance measure, or a backlog replacement. One clear goal focuses the team.",
          "why_wrong": [
            "",
            "Task lists live in the sprint backlog plan, not the goal.",
            "The sprint goal is a team objective, not an individual measure.",
            "The product backlog still exists; the goal does not replace it."
          ]
        },
        {
          "id": "ba-06-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA is asked to write all requirements up front for a six-month Agile project. What is the best response?",
          "options": [
            "Write requirements only after the build is finished",
            "Write everything in detail before any build starts",
            "Agree the vision and high-level scope, then detail requirements just in time",
            "Refuse to write any requirements"
          ],
          "answer": 2,
          "explanation": "Agile analysis works just in time: enough up-front clarity on vision and scope, with detail emerging as items near development. Full up-front specification wastes effort on things that will change. Just-in-time detail keeps requirements fresh and relevant.",
          "why_wrong": [
            "Writing requirements after the build defeats their purpose.",
            "Full up-front detail wastes effort and goes stale as learning happens.",
            "",
            "Refusing to write requirements leaves the team without needed clarity."
          ]
        },
        {
          "id": "ba-06-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What does velocity measure?",
          "options": [
            "The speed of the production system",
            "How quickly stakeholders reply to emails",
            "How fast individual developers type",
            "The amount of work a team completes per sprint, used for forecasting"
          ],
          "answer": 3,
          "explanation": "Velocity is the completed work per sprint, averaged over recent sprints, and used to forecast what the team can likely deliver. It is a team-level planning aid, not an individual measure or a system metric. It must never be used to compare teams.",
          "why_wrong": [
            "System speed is a performance measure, not team velocity.",
            "Stakeholder reply speed is unrelated to delivery velocity.",
            "Typing speed has nothing to do with velocity.",
            ""
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-07",
        "title": "BA Test 7: Process Analysis and Process Mapping",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-07-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA maps the current process before designing the future one. Why is the current-state map valuable?",
          "options": [
            "It replaces stakeholder interviews",
            "It fills the document nicely",
            "It reveals waste, handoffs, and pain points that the future state must address",
            "It proves the old process was perfect"
          ],
          "answer": 2,
          "explanation": "A current-state map makes the real process visible, exposing delays, rework, and unnecessary handoffs that the future design must fix. Without it, the team designs from assumptions. Evidence of today's pain grounds tomorrow's design.",
          "why_wrong": [
            "Mapping complements interviews; it does not replace them.",
            "Filling a document is not the purpose of process mapping.",
            "",
            "Current-state maps usually expose problems; they rarely prove perfection."
          ]
        },
        {
          "id": "ba-07-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "In a process map, what does a diamond shape represent?",
          "options": [
            "A document output",
            "The end of the process",
            "The start of the process",
            "A decision point with alternative paths"
          ],
          "answer": 3,
          "explanation": "The diamond is the standard flowchart symbol for a decision or branch, where the path taken depends on a condition. Start and end use rounded shapes, and documents have their own symbol. Knowing the symbols keeps maps readable for everyone.",
          "why_wrong": [
            "A document output has its own distinct symbol.",
            "The end of the process uses a rounded shape, not a diamond.",
            "Start and end points use rounded or oval shapes, not diamonds.",
            ""
          ]
        },
        {
          "id": "ba-07-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A process has eight handoffs between teams and frequent delays. What should the BA examine first?",
          "options": [
            "Each handoff for waiting time, rework, and unclear ownership",
            "The job titles of everyone involved",
            "The history of the building where the teams sit",
            "The colour scheme of the process map"
          ],
          "answer": 0,
          "explanation": "Handoffs are where work waits, gets lost, and gets reworked, so they are the first place to look for delay causes. Waiting time, rework, and ownership gaps at handoffs explain most process delays. Map cosmetics and titles do not.",
          "why_wrong": [
            "",
            "Job titles do not reveal why handoffs cause delay.",
            "Building history is irrelevant to process performance.",
            "Map colours do not explain process delays."
          ]
        },
        {
          "id": "ba-07-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is a bottleneck in a process?",
          "options": [
            "A step that everyone enjoys",
            "A step whose limited capacity slows the whole process",
            "The first step of any process",
            "A step with no documentation"
          ],
          "answer": 1,
          "explanation": "A bottleneck is the constraint that limits overall throughput: work piles up before it because it cannot keep pace. Finding and easing the bottleneck improves the whole process. It is defined by capacity, not enjoyment or position.",
          "why_wrong": [
            "Enjoyment does not define a bottleneck.",
            "",
            "The first step is only a bottleneck if its capacity constrains the process.",
            "Missing documentation is a different problem from a capacity constraint."
          ]
        },
        {
          "id": "ba-07-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA is mapping a process and finds two teams doing the same check. What is this an example of?",
          "options": [
            "Process automation",
            "Good control design",
            "Duplication and waste",
            "Necessary segregation of duties"
          ],
          "answer": 2,
          "explanation": "The same check done twice by different teams is duplicated effort and waste, unless a genuine control reason requires it. The BA should challenge whether both checks add value. Segregation of duties means different people doing different parts, not repeating the same check.",
          "why_wrong": [
            "Automation is about tools doing work, not duplicated manual checks.",
            "Repeating the same check is waste, not good control design.",
            "",
            "Segregation of duties splits different tasks; it does not duplicate one check."
          ]
        },
        {
          "id": "ba-07-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "When mapping a process, what should the BA capture at each step?",
          "options": [
            "Only the system used",
            "Only the step duration",
            "Only the step name",
            "The step, who does it, inputs, outputs, and systems used"
          ],
          "answer": 3,
          "explanation": "A useful process map captures who performs each step, what goes in and out, and which systems support it, so the team can analyse handoffs, dependencies, and automation options. Step names alone cannot support analysis. Rich detail makes the map a working tool.",
          "why_wrong": [
            "Systems alone miss the people, inputs, and outputs.",
            "Duration alone misses the who, what, and how of each step.",
            "A step name alone gives no basis for analysis.",
            ""
          ]
        },
        {
          "id": "ba-07-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A future-state process removes three manual checks. What must the BA verify before recommending this?",
          "options": [
            "That the control purpose of each check is still met another way",
            "That staff prefer fewer checks",
            "That the change saves paper",
            "That the map looks simpler"
          ],
          "answer": 0,
          "explanation": "Checks exist for control purposes such as accuracy, fraud prevention, or compliance, and removing them without an alternative control creates risk. The BA must confirm each control purpose is preserved. Simpler maps and staff preference do not justify removing controls.",
          "why_wrong": [
            "",
            "Staff preference is not a control justification.",
            "Saving paper is not the test for removing a control.",
            "A simpler-looking map does not prove controls are preserved."
          ]
        },
        {
          "id": "ba-07-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is the difference between value-added and non-value-added steps?",
          "options": [
            "Value-added steps use expensive systems",
            "Value-added steps change the product in a way the customer cares about; non-value-added steps do not",
            "Non-value-added steps are always illegal",
            "There is no difference"
          ],
          "answer": 1,
          "explanation": "Value-added work transforms the product or service in a way the customer would pay for; non-value-added work adds cost or delay without that benefit. The distinction guides improvement effort toward what matters. Cost and legality do not define the split.",
          "why_wrong": [
            "Expensive systems do not make a step value-added.",
            "",
            "Non-value-added steps are usually legal; they are simply wasteful.",
            "The distinction is fundamental to process improvement."
          ]
        },
        {
          "id": "ba-07-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A process map is validated with the people who do the work. Why is this step essential?",
          "options": [
            "It assigns blame for delays",
            "It is required for the map to print correctly",
            "It makes the map longer",
            "It confirms the map reflects reality, including informal steps"
          ],
          "answer": 3,
          "explanation": "Only the people doing the work can confirm whether the map matches reality, including undocumented steps and workarounds. Unvalidated maps reflect the BA's assumptions. Validation turns a draft into a trustworthy picture of the process.",
          "why_wrong": [
            "Validation seeks truth about the process, not blame.",
            "Printing has nothing to do with validation.",
            "Validation is about accuracy, not length.",
            ""
          ]
        },
        {
          "id": "ba-07-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Which measure best shows whether a process improvement worked?",
          "options": [
            "Before-and-after comparison of cycle time, error rate, or cost",
            "How many people liked the new map",
            "The size of the project team",
            "The number of meetings held about it"
          ],
          "answer": 0,
          "explanation": "Improvement must be shown with comparable before-and-after measures such as cycle time, errors, or cost. Meetings, popularity, and team size are not outcome measures. Evidence of improvement comes from the numbers that mattered in the first place.",
          "why_wrong": [
            "",
            "Liking a map is not evidence the process improved.",
            "Team size says nothing about process performance.",
            "Meeting counts measure activity, not improvement."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-08",
        "title": "BA Test 8: Data Analysis and SQL Basics",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-08-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA wants all rows from a customers table where the country is India. Which SQL clause is used?",
          "options": [
            "SELECT * FROM customers ORDER BY country",
            "SELECT * FROM customers GROUP BY country",
            "SELECT country FROM customers",
            "SELECT * FROM customers WHERE country = 'India'"
          ],
          "answer": 3,
          "explanation": "The WHERE clause filters rows by a condition, here country equals India. SELECT alone returns all rows, ORDER BY sorts, and GROUP BY aggregates. Filtering is the job of WHERE.",
          "why_wrong": [
            "ORDER BY sorts rows; it does not filter them.",
            "GROUP BY aggregates rows; it does not filter by country.",
            "This selects a column but filters nothing.",
            ""
          ]
        },
        {
          "id": "ba-08-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What does COUNT(*) return in SQL?",
          "options": [
            "The number of rows matching the query",
            "The average of a column",
            "The largest value in a column",
            "The sum of all values"
          ],
          "answer": 0,
          "explanation": "COUNT(*) counts rows, which is the basic way to size a result set or check how many records meet a condition. SUM totals values, AVG averages them, and MAX finds the largest. Counting rows is the most common BA sanity check.",
          "why_wrong": [
            "",
            "Averaging is the job of AVG, not COUNT.",
            "Finding the largest value is the job of MAX, not COUNT.",
            "Summing values is the job of SUM, not COUNT."
          ]
        },
        {
          "id": "ba-08-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A report shows total sales of 10 million, but the BA suspects duplicate rows. What should the BA check first?",
          "options": [
            "The report font size",
            "Whether the join creates duplicate rows for the same sale",
            "The colour of the report header",
            "Whether the report was emailed"
          ],
          "answer": 1,
          "explanation": "Joins that match one row to many can duplicate rows and inflate totals, which is the classic cause of overstated aggregates. Checking the join grain before anything else finds the problem fast. Presentation details cannot explain inflated totals.",
          "why_wrong": [
            "Font size cannot inflate a sales total.",
            "",
            "Header colour cannot affect report numbers.",
            "Email delivery does not change the report's contents."
          ]
        },
        {
          "id": "ba-08-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What does a JOIN do in SQL?",
          "options": [
            "Creates a new database",
            "Deletes rows from a table",
            "Combines rows from two tables based on a related column",
            "Sorts rows alphabetically"
          ],
          "answer": 2,
          "explanation": "A JOIN combines rows from two tables where a related column matches, such as orders joined to customers on customer ID. It does not delete, sort, or create databases. Joining is how related data is brought together for analysis.",
          "why_wrong": [
            "Creating a database is a different command entirely.",
            "Deleting rows is the job of DELETE, not JOIN.",
            "",
            "Sorting is the job of ORDER BY, not JOIN."
          ]
        },
        {
          "id": "ba-08-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA finds null values in a mandatory field. What does this indicate?",
          "options": [
            "Nulls are always acceptable",
            "The database is running fast",
            "The data is perfect",
            "A data quality or validation problem that needs investigation"
          ],
          "answer": 3,
          "explanation": "A mandatory field should never be empty, so nulls there signal missing validation, a broken load, or an upstream process gap. The BA must investigate the cause and the business impact. Nulls in mandatory fields are a data quality defect.",
          "why_wrong": [
            "Nulls are acceptable only where a field is genuinely optional.",
            "Database speed has nothing to do with null values.",
            "Nulls in a mandatory field are a defect, not perfection.",
            ""
          ]
        },
        {
          "id": "ba-08-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Which SQL statement sorts results from highest to lowest sales value?",
          "options": [
            "ORDER BY sales DESC",
            "GROUP BY sales",
            "WHERE sales > 0",
            "ORDER BY sales ASC"
          ],
          "answer": 0,
          "explanation": "ORDER BY with DESC sorts descending, highest first. ASC sorts ascending, GROUP BY aggregates, and WHERE filters. Sorting direction matters when the BA needs top or bottom records first.",
          "why_wrong": [
            "",
            "GROUP BY aggregates rows; it does not sort them.",
            "WHERE filters rows; it does not sort them.",
            "ASC sorts lowest first, the opposite of what is asked."
          ]
        },
        {
          "id": "ba-08-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA compares two data sources and finds the same customer with different addresses. What is the first step?",
          "options": [
            "Pick one address at random",
            "Identify which source is authoritative and why the records differ",
            "Delete both records",
            "Ignore it, since addresses change often"
          ],
          "answer": 1,
          "explanation": "Conflicting records require establishing the system of record and understanding why the difference exists, such as timing, manual entry, or a failed sync. Random choice and deletion destroy information. Authoritative-source analysis resolves the conflict properly.",
          "why_wrong": [
            "Random choice may pick the wrong address and hides the cause.",
            "",
            "Deleting both records destroys information and solves nothing.",
            "Ignoring the conflict lets downstream processes use wrong data."
          ]
        },
        {
          "id": "ba-08-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is a primary key?",
          "options": [
            "A password for the database",
            "The first column in a table",
            "A column or set of columns that uniquely identifies each row",
            "The largest column in a table"
          ],
          "answer": 2,
          "explanation": "A primary key uniquely identifies each row, so every record can be referenced precisely and joins work correctly. It is defined by uniqueness, not by position or size. Understanding keys is essential for reading data models.",
          "why_wrong": [
            "A primary key is a data concept, not a password.",
            "Position in the table does not define a primary key.",
            "",
            "Size does not define a primary key."
          ]
        },
        {
          "id": "ba-08-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA is asked for average order value by region. Which SQL pattern is needed?",
          "options": [
            "SELECT AVG(order_value) FROM orders",
            "SELECT region, AVG(order_value) FROM orders GROUP BY region",
            "SELECT * FROM orders WHERE region = 'all'",
            "SELECT COUNT(*) FROM orders"
          ],
          "answer": 1,
          "explanation": "Averages by region need GROUP BY region with AVG, so each region gets its own average. A bare AVG gives one overall average, and COUNT gives row counts. Grouping is how breakdowns are produced.",
          "why_wrong": [
            "This gives one overall average, not one per region.",
            "",
            "There is no region called all; this filters instead of grouping.",
            "COUNT gives row counts, not average values."
          ]
        },
        {
          "id": "ba-08-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Why should a BA profile data before writing migration requirements?",
          "options": [
            "Profiling is never needed",
            "To delay the migration",
            "To understand data quality, volumes, and patterns that the migration must handle",
            "To impress the technical team"
          ],
          "answer": 2,
          "explanation": "Data profiling reveals quality issues, volumes, duplicates, and value patterns that shape migration rules, cleansing needs, and testing. Without it, requirements assume clean data that may not exist. Profiling turns assumptions into evidence.",
          "why_wrong": [
            "Profiling is essential; skipping it risks failed migrations.",
            "Profiling informs the migration; it is not a delaying tactic.",
            "",
            "Profiling serves the migration design, not appearances."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-09",
        "title": "BA Test 9: UAT Planning and Execution",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-09-01",
          "domain": "professional",
          "chapter": "ch42",
          "question": "What is the main purpose of user acceptance testing?",
          "options": [
            "To confirm the system meets business needs before go-live",
            "To test server performance under load",
            "To train new developers",
            "To find every possible bug in the code"
          ],
          "answer": 0,
          "explanation": "UAT is the business's verification that the system supports their needs and is fit for use. Finding every code bug is system testing's job, load testing covers performance, and training is separate. UAT answers the question: does this work for the business?",
          "why_wrong": [
            "",
            "Load testing is a separate, technical test type.",
            "Training developers is not a testing activity.",
            "Finding every code bug is the focus of earlier test phases."
          ]
        },
        {
          "id": "ba-09-02",
          "domain": "professional",
          "chapter": "ch42",
          "question": "Who should execute UAT test cases?",
          "options": [
            "Only the developers who built the system",
            "Business users or their representatives",
            "Only the project manager",
            "External auditors only"
          ],
          "answer": 1,
          "explanation": "UAT must be performed by the people who will use the system, or their representatives, because they judge fitness for business use. Developers testing their own work cannot provide independent business acceptance. Business ownership is what makes UAT meaningful.",
          "why_wrong": [
            "Developers cannot independently accept their own work for the business.",
            "",
            "The project manager coordinates; they do not represent business users.",
            "Auditors check controls; they do not accept business fitness."
          ]
        },
        {
          "id": "ba-09-03",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A UAT tester finds a defect. What is the most important thing to record?",
          "options": [
            "The tester's lunch break time",
            "The tester's opinion of the developer",
            "Steps to reproduce, expected result, and actual result",
            "The colour of the screen"
          ],
          "answer": 2,
          "explanation": "A defect report needs reproducible steps plus expected and actual results, so developers can recreate and fix it. Opinions, colours, and break times do not help. Clear reproduction steps are the difference between a fixed defect and a rejected one.",
          "why_wrong": [
            "Break times have no place in a defect report.",
            "Opinions about people do not help fix a defect.",
            "",
            "Screen colour is irrelevant unless it is the defect itself."
          ]
        },
        {
          "id": "ba-09-04",
          "domain": "professional",
          "chapter": "ch42",
          "question": "What is an entry criterion for UAT?",
          "options": [
            "A reason to cancel UAT",
            "A test case that always passes",
            "The last day of UAT",
            "A condition that must be met before UAT can start"
          ],
          "answer": 3,
          "explanation": "Entry criteria are preconditions for starting UAT, such as system testing complete and test data ready. They protect UAT time from being wasted on an unready build. Exit criteria, by contrast, define when UAT can finish.",
          "why_wrong": [
            "Entry criteria gate the start; they are not cancellation reasons.",
            "A test case that always passes proves nothing about readiness.",
            "The last day of UAT relates to exit, not entry.",
            ""
          ]
        },
        {
          "id": "ba-09-05",
          "domain": "professional",
          "chapter": "ch42",
          "question": "UAT is about to start but test data is incomplete. What should the BA do?",
          "options": [
            "Flag the entry criterion gap and arrange data before testing begins",
            "Cancel the project",
            "Ask testers to invent data as they go",
            "Start anyway and hope data appears"
          ],
          "answer": 0,
          "explanation": "Test data is a readiness precondition, and starting without it wastes tester time and produces unreliable results. The BA should surface the gap and get data arranged. Hoping or inventing data undermines the whole exercise.",
          "why_wrong": [
            "",
            "Cancelling the project is a wild overreaction to a fixable gap.",
            "Invented data produces results that cannot be trusted.",
            "Starting without data wastes tester time on blocked tests."
          ]
        },
        {
          "id": "ba-09-06",
          "domain": "professional",
          "chapter": "ch42",
          "question": "What should a UAT test case be based on?",
          "options": [
            "The developer's favourite features",
            "Business requirements and real business scenarios",
            "Random guesses",
            "The project plan dates"
          ],
          "answer": 1,
          "explanation": "UAT cases must trace to requirements and reflect real business scenarios, including normal flows and exceptions. Favourite features, guesses, and plan dates do not represent business need. Requirement-based cases prove the business need is met.",
          "why_wrong": [
            "Developer preferences do not represent business need.",
            "",
            "Random guesses cannot prove requirements are met.",
            "Plan dates are scheduling facts, not test basis."
          ]
        },
        {
          "id": "ba-09-07",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A defect is found in UAT that blocks all testing. How should it be classified?",
          "options": [
            "Not a defect",
            "Low severity, fix later",
            "Critical or blocker severity, fix urgently",
            "Cosmetic"
          ],
          "answer": 2,
          "explanation": "A defect that blocks all testing is critical or a blocker, because no further verification can proceed until it is fixed. Severity reflects business impact, and total blockage is the highest impact. Low or cosmetic classifications would hide the urgency.",
          "why_wrong": [
            "A defect blocking all testing is very much a defect.",
            "Low severity understates a defect that stops all testing.",
            "",
            "Cosmetic defects are minor presentation issues, not blockers."
          ]
        },
        {
          "id": "ba-09-08",
          "domain": "professional",
          "chapter": "ch42",
          "question": "What does UAT sign-off mean?",
          "options": [
            "All defects ever found are fixed",
            "Developers approve their own work",
            "Testing will never be needed again",
            "The business accepts the system as fit for its purpose"
          ],
          "answer": 3,
          "explanation": "Sign-off is the business's formal acceptance that the system meets its needs and is ready for use, subject to any agreed known issues. It does not mean perfection or the end of all testing. It is a business decision, not a developer one.",
          "why_wrong": [
            "Sign-off can happen with agreed known issues outstanding.",
            "Developers do not sign off business acceptance.",
            "Future changes will still need testing after sign-off.",
            ""
          ]
        },
        {
          "id": "ba-09-09",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A business user says UAT is a waste of time because system testing passed. What is the best reply?",
          "options": [
            "Explain that system testing checks the build, while UAT checks fitness for real business use",
            "Threaten the user with escalation",
            "Run UAT without business users",
            "Agree and skip UAT"
          ],
          "answer": 0,
          "explanation": "System testing verifies the build against specifications; UAT verifies the system against real business needs in business hands. Both are needed because they answer different questions. Skipping UAT removes the business's own check.",
          "why_wrong": [
            "",
            "Threats do not build understanding or cooperation.",
            "UAT without business users is not user acceptance testing.",
            "Skipping UAT removes the business acceptance check entirely."
          ]
        },
        {
          "id": "ba-09-10",
          "domain": "professional",
          "chapter": "ch42",
          "question": "What is regression testing in the context of a UAT cycle?",
          "options": [
            "Testing without any test cases",
            "Testing that previously working functions still work after a fix",
            "Testing only new features",
            "Testing performed by managers"
          ],
          "answer": 1,
          "explanation": "Regression testing re-checks previously working functions after changes, to catch defects introduced by fixes. Testing only new features misses breakage in existing ones. Regression protects what already worked.",
          "why_wrong": [
            "Regression testing uses test cases, like any structured testing.",
            "",
            "New-feature testing alone misses breakage in existing functions.",
            "Who performs the testing does not define regression testing."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-10",
        "title": "BA Test 10: Traceability and Coverage",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-10-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is a requirements traceability matrix?",
          "options": [
            "A budget spreadsheet",
            "A table linking requirements to design, build, and test items",
            "A chart of team holidays",
            "A list of project risks"
          ],
          "answer": 1,
          "explanation": "A traceability matrix maps each requirement forward to design and test artefacts and backward to its source need, showing coverage and impact. It is the central control for proving nothing is missed and nothing unrequested is built. Holidays, risks, and budgets are different artefacts.",
          "why_wrong": [
            "Budgets belong in financial tracking, not a traceability matrix.",
            "",
            "Team holidays belong in a resource plan, not a traceability matrix.",
            "Risks belong in a risk log, not a traceability matrix."
          ]
        },
        {
          "id": "ba-10-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A requirement has no linked test case. What does this mean?",
          "options": [
            "The requirement has been deleted",
            "The requirement is definitely working",
            "The requirement may be untested, which is a coverage gap",
            "The requirement is unimportant"
          ],
          "answer": 2,
          "explanation": "No linked test means no evidence the requirement was verified, which is a coverage gap that must be closed or explicitly accepted. It says nothing about whether the requirement works or matters. Traceability exposes exactly this kind of gap.",
          "why_wrong": [
            "Deletion would remove the requirement, not just its test link.",
            "Without a test, there is no evidence the requirement works.",
            "",
            "Importance is not shown by the absence of a test link."
          ]
        },
        {
          "id": "ba-10-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A test case exists with no linked requirement. What should the BA check?",
          "options": [
            "The tester's spelling",
            "The test execution date",
            "The test environment colour scheme",
            "Whether the test is testing unrequested scope or a missing requirement"
          ],
          "answer": 3,
          "explanation": "An orphan test may be testing gold-plated scope nobody asked for, or it may reveal a genuine requirement that was never documented. Either way, the BA must investigate and resolve the mismatch. Traceability works in both directions.",
          "why_wrong": [
            "Spelling does not explain an unlinked test case.",
            "Execution dates do not explain missing requirement links.",
            "Environment appearance is irrelevant to traceability.",
            ""
          ]
        },
        {
          "id": "ba-10-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A stakeholder asks to change one requirement late in the project. How does traceability help?",
          "options": [
            "It shows every design, code, and test item affected by the change",
            "It automatically rewrites the requirement",
            "It hides the change from the team",
            "It prevents all changes"
          ],
          "answer": 0,
          "explanation": "Traceability lets the BA perform impact analysis: every linked artefact is visible, so the cost and risk of the change can be assessed honestly. It does not prevent change or rewrite anything automatically. Informed change decisions depend on visible impact.",
          "why_wrong": [
            "",
            "Traceability shows links; it does not rewrite content.",
            "Hiding changes is the opposite of what traceability is for.",
            "Traceability informs change decisions; it does not prevent change."
          ]
        },
        {
          "id": "ba-10-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What does forward traceability mean?",
          "options": [
            "Tracing requirements back to their source",
            "Tracing requirements forward to design, build, and test",
            "Tracing defects back to developers",
            "Tracing the project timeline"
          ],
          "answer": 1,
          "explanation": "Forward traceability follows a requirement from its source into design, build, and test, proving it was delivered and verified. Backward traceability goes the other way, to the originating need. Both directions together give full coverage.",
          "why_wrong": [
            "Tracing back to the source is backward traceability.",
            "",
            "Defect-to-developer tracing is not requirements traceability.",
            "Timeline tracing is schedule tracking, not traceability."
          ]
        },
        {
          "id": "ba-10-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Why is backward traceability important?",
          "options": [
            "It speeds up coding",
            "It replaces testing",
            "It proves every requirement has a genuine business source",
            "It makes documents longer"
          ],
          "answer": 2,
          "explanation": "Backward traceability links each requirement to the business need or stakeholder that asked for it, exposing gold plating and unjustified scope. If a requirement has no source, it should be challenged. It is a scope control, not a document-length or speed tool.",
          "why_wrong": [
            "Traceability does not speed up coding directly.",
            "Traceability supports testing; it never replaces it.",
            "",
            "Length is not the purpose of traceability."
          ]
        },
        {
          "id": "ba-10-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A project has 100 requirements and 60 have linked tests. What is the test coverage?",
          "options": [
            "40 percent",
            "It cannot be calculated",
            "100 percent",
            "60 percent"
          ],
          "answer": 3,
          "explanation": "Coverage is the share of requirements with linked tests: 60 of 100 is 60 percent. The remaining 40 percent is a gap to close or accept knowingly. Coverage figures make the gap visible and discussable.",
          "why_wrong": [
            "40 percent is the gap, not the coverage.",
            "Coverage is a simple ratio and can be calculated directly.",
            "100 percent would require all 100 requirements to have tests.",
            ""
          ]
        },
        {
          "id": "ba-10-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "When should traceability links be created?",
          "options": [
            "As artefacts are created, throughout the lifecycle",
            "Only when an audit is announced",
            "Never, they waste time",
            "Only at the end of the project"
          ],
          "answer": 0,
          "explanation": "Links created as work happens stay accurate and cheap; reconstructing them at the end is expensive and error-prone. Continuous traceability supports impact analysis at any point. Waiting for an audit defeats the purpose.",
          "why_wrong": [
            "",
            "Audit-driven traceability is too late to help delivery decisions.",
            "Traceability saves time on impact analysis and coverage checks.",
            "End-of-project reconstruction is expensive and unreliable."
          ]
        },
        {
          "id": "ba-10-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A design document references requirement REQ-042, but REQ-042 does not exist. What is this?",
          "options": [
            "A sign the design is complete",
            "A performance issue",
            "A broken traceability link that must be fixed",
            "Normal practice"
          ],
          "answer": 2,
          "explanation": "A reference to a non-existent requirement is a broken link: either the requirement was deleted without updating dependents, or the reference is wrong. Either way it must be investigated and fixed. Broken links undermine trust in the whole matrix.",
          "why_wrong": [
            "A broken reference is a gap, not a sign of completeness.",
            "This is a documentation defect, not a performance issue.",
            "",
            "Dangling references are a defect, not normal practice."
          ]
        },
        {
          "id": "ba-10-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Which artefact best proves that all in-scope requirements were tested?",
          "options": [
            "A project status report",
            "A meeting attendance list",
            "A signed budget approval",
            "A completed traceability matrix with test links for every requirement"
          ],
          "answer": 3,
          "explanation": "A complete matrix showing every requirement linked to executed tests is direct evidence of coverage. Status reports summarise, attendance lists prove presence, and budget approval proves funding. Only the matrix proves requirement-by-requirement test coverage.",
          "why_wrong": [
            "A status report summarises; it does not prove per-requirement coverage.",
            "Attendance proves who was present, not what was tested.",
            "Budget approval proves funding, not test coverage.",
            ""
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-11",
        "title": "BA Test 11: Prioritisation Techniques",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-11-01",
          "domain": "professional",
          "chapter": "ch45",
          "question": "In MoSCoW prioritisation, what does the W stand for?",
          "options": [
            "Waiting",
            "Wanted",
            "Won't have this time",
            "Working"
          ],
          "answer": 2,
          "explanation": "MoSCoW stands for Must have, Should have, Could have, and Won't have this time. The W category explicitly records what is out of scope for now, which prevents it creeping back silently. Explicit exclusion is as valuable as inclusion.",
          "why_wrong": [
            "Waiting is not part of the MoSCoW mnemonic.",
            "Wanted is not part of the MoSCoW mnemonic.",
            "",
            "Working is not part of the MoSCoW mnemonic."
          ]
        },
        {
          "id": "ba-11-02",
          "domain": "professional",
          "chapter": "ch45",
          "question": "A stakeholder labels every requirement as Must have. What should the BA do?",
          "options": [
            "Label them all Could have instead",
            "Remove half at random",
            "Accept all as Must have",
            "Facilitate a trade-off discussion using value, risk, and dependency criteria"
          ],
          "answer": 3,
          "explanation": "When everything is a Must, nothing is prioritised, so the BA must facilitate honest trade-offs against value, risk, and dependencies. Forcing a ranking reveals true priorities. Accepting all as Must guarantees an undeliverable scope.",
          "why_wrong": [
            "Relabelling everything Could have is just as unhelpful.",
            "Random removal ignores business value entirely.",
            "Accepting all as Must leaves the team with no usable priority order.",
            ""
          ]
        },
        {
          "id": "ba-11-03",
          "domain": "professional",
          "chapter": "ch45",
          "question": "Two features have equal business value, but one unblocks three other features. Which should come first?",
          "options": [
            "The one that unblocks the others",
            "The one requested most recently",
            "Neither, build both at once",
            "The one that is easiest to demo"
          ],
          "answer": 0,
          "explanation": "Dependencies matter: the unblocking feature enables three others, so sequencing it first maximises flow and reduces idle time. Demo appeal and recency are poor sequencing criteria. Dependency-aware ordering keeps the pipeline moving.",
          "why_wrong": [
            "",
            "Recency is not a sequencing criterion.",
            "Building both at once ignores the dependency and risks rework.",
            "Demo appeal does not reflect delivery logic."
          ]
        },
        {
          "id": "ba-11-04",
          "domain": "professional",
          "chapter": "ch45",
          "question": "What is the Kano model's basic category?",
          "options": [
            "Features that cost the most",
            "Features customers do not notice until missing, when they cause dissatisfaction",
            "Features that delight customers unexpectedly",
            "Features nobody wants"
          ],
          "answer": 1,
          "explanation": "Basic or must-be features are expected: their absence dissatisfies, but their presence earns no praise. Delighters are the unexpected extras. Kano helps the BA separate expected basics from differentiators when prioritising.",
          "why_wrong": [
            "Cost does not define a Kano category.",
            "",
            "Unexpected delight describes performance or delighter features, not basics.",
            "Unwanted features are not a Kano category."
          ]
        },
        {
          "id": "ba-11-05",
          "domain": "professional",
          "chapter": "ch45",
          "question": "A feature is high value but high risk. How should it be prioritised?",
          "options": [
            "Do it without any analysis",
            "Always do it last",
            "Consider doing it early to learn and reduce risk, if value justifies it",
            "Never do it"
          ],
          "answer": 2,
          "explanation": "High-value, high-risk work often benefits from early delivery or a spike, because learning comes sooner and risk is retired while options remain open. Deferring it to the end concentrates risk where it can do most damage. Risk reduction is itself valuable.",
          "why_wrong": [
            "Skipping analysis on risky work increases the risk, not the value.",
            "Doing it last concentrates risk at the point of least flexibility.",
            "",
            "Avoiding high-value work entirely wastes opportunity."
          ]
        },
        {
          "id": "ba-11-06",
          "domain": "professional",
          "chapter": "ch45",
          "question": "What is weighted shortest job first (WSJF) based on?",
          "options": [
            "Team preference divided by effort",
            "Stakeholder seniority",
            "Alphabetical order of feature names",
            "Cost of delay divided by job size"
          ],
          "answer": 3,
          "explanation": "WSJF divides cost of delay by job duration, prioritising work that delivers the most value per unit of time. It combines urgency, value, and risk reduction with size. It is an economic ordering, not a preference or seniority vote.",
          "why_wrong": [
            "Team preference is not the WSJF input.",
            "Seniority plays no part in WSJF.",
            "Alphabetical order is arbitrary and unrelated to value.",
            ""
          ]
        },
        {
          "id": "ba-11-07",
          "domain": "professional",
          "chapter": "ch45",
          "question": "A regulatory requirement and a nice-to-have feature compete for the same sprint. Which wins?",
          "options": [
            "The regulatory requirement, because non-compliance carries penalties and risk",
            "Whichever the team prefers to build",
            "Neither, skip the sprint",
            "The nice-to-have, because users like it"
          ],
          "answer": 0,
          "explanation": "Regulatory requirements carry legal and financial consequences with fixed deadlines, so they outrank discretionary features. User preference and team preference do not override compliance obligations. Compliance deadlines are not negotiable in the same way.",
          "why_wrong": [
            "",
            "Team preference does not override regulatory risk.",
            "Skipping the sprint solves nothing and wastes capacity.",
            "User liking does not outweigh a compliance obligation."
          ]
        },
        {
          "id": "ba-11-08",
          "domain": "professional",
          "chapter": "ch45",
          "question": "Why should prioritisation be revisited regularly?",
          "options": [
            "Because priorities never change",
            "Because value, risk, and business context change as the project learns",
            "Because stakeholders enjoy reprioritising",
            "It should never be revisited"
          ],
          "answer": 1,
          "explanation": "New learning, market shifts, and changing constraints alter what matters most, so a fixed priority order goes stale. Regular reprioritisation keeps effort on the highest current value. Static priorities ignore reality.",
          "why_wrong": [
            "Priorities change constantly in real projects.",
            "",
            "Enjoyment is not the reason; changing value is.",
            "Never revisiting leaves the team building stale priorities."
          ]
        },
        {
          "id": "ba-11-09",
          "domain": "professional",
          "chapter": "ch45",
          "question": "A product owner prioritises by gut feel alone. What should the BA suggest?",
          "options": [
            "Let the loudest stakeholder decide",
            "Prioritise alphabetically",
            "Continue with gut feel only",
            "Use explicit criteria such as value, cost, risk, and dependencies, and record the reasoning"
          ],
          "answer": 3,
          "explanation": "Explicit criteria make prioritisation transparent, challengeable, and consistent, and recording the reasoning lets future decisions be understood. Gut feel alone is opaque and inconsistent. Criteria turn opinion into a defensible decision.",
          "why_wrong": [
            "Loudness is not a value criterion.",
            "Alphabetical order ignores value entirely.",
            "Gut feel alone is opaque and hard to challenge or explain.",
            ""
          ]
        },
        {
          "id": "ba-11-10",
          "domain": "professional",
          "chapter": "ch45",
          "question": "What is the main risk of prioritising only by development cost?",
          "options": [
            "High-value features may be deferred even when they justify their cost",
            "The team works too fast",
            "Stakeholders get too much value",
            "Cheap features get built first"
          ],
          "answer": 0,
          "explanation": "Cost-only ordering ignores value, so expensive but high-return features lose to cheap low-value ones. Prioritisation must weigh value against cost, not cost alone. The goal is return on investment, not minimum spend.",
          "why_wrong": [
            "",
            "Working fast is not a risk of cost-based ordering.",
            "Too much value is not a plausible risk here.",
            "Cheap-first is the mechanism, not the risk itself."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-12",
        "title": "BA Test 12: Workshops and Interviews",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-12-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What should a BA send before a requirements workshop?",
          "options": [
            "Only the room booking",
            "The final requirements document",
            "Nothing, surprise is good",
            "An agenda, objectives, and any pre-reading"
          ],
          "answer": 3,
          "explanation": "An agenda with objectives and pre-reading lets participants arrive prepared, so workshop time is spent deciding rather than briefing. Surprise wastes the session on orientation. Preparation is the facilitator's responsibility.",
          "why_wrong": [
            "A room booking alone does not prepare participants.",
            "Final requirements cannot exist before the workshop that creates them.",
            "Surprise wastes workshop time on orientation.",
            ""
          ]
        },
        {
          "id": "ba-12-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "One participant dominates a workshop while others stay silent. What should the facilitator do?",
          "options": [
            "Invite quieter participants in directly and manage airtime",
            "End the workshop early",
            "Ask the dominant person to leave permanently",
            "Let the dominant person continue"
          ],
          "answer": 0,
          "explanation": "Facilitation means balancing voices: drawing out quieter participants and gently limiting dominant ones, so all perspectives shape the outcome. Letting one voice dominate produces one-sided requirements. Active airtime management is core facilitation.",
          "why_wrong": [
            "",
            "Ending early wastes the session and the preparation.",
            "Permanent removal is disproportionate; facilitation manages behaviour first.",
            "Letting one voice dominate produces one-sided requirements."
          ]
        },
        {
          "id": "ba-12-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A workshop runs out of time with key decisions unmade. What should the BA do?",
          "options": [
            "Invent the decisions afterwards",
            "Record what was agreed, what is open, and schedule a focused follow-up",
            "Pretend all decisions were made",
            "Blame the participants"
          ],
          "answer": 1,
          "explanation": "Honest recording of agreed versus open items, plus a focused follow-up, keeps momentum without fabricating agreement. Inventing decisions creates false requirements. Transparency about open items is professional discipline.",
          "why_wrong": [
            "Invented decisions are false requirements.",
            "",
            "Pretending decisions were made creates false confidence.",
            "Blame does not produce the missing decisions."
          ]
        },
        {
          "id": "ba-12-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Why should workshop outputs be captured visibly during the session?",
          "options": [
            "To use up flipchart paper",
            "To decorate the room",
            "So participants can correct misunderstandings in real time",
            "To avoid writing a summary later"
          ],
          "answer": 2,
          "explanation": "Visible capture on a board or screen lets participants see what is being recorded and correct it immediately, building shared ownership. Private notes reviewed later lose that real-time correction. Shared visibility creates shared agreement.",
          "why_wrong": [
            "Paper use is not a goal.",
            "Decoration is not the purpose of visible capture.",
            "",
            "A summary is still needed; visible capture improves accuracy, not effort."
          ]
        },
        {
          "id": "ba-12-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is the best way to open an elicitation interview?",
          "options": [
            "Read a long disclaimer for ten minutes",
            "Ask the interviewee to sign a contract",
            "Start with the hardest question immediately",
            "Explain the purpose, how the input will be used, and build rapport"
          ],
          "answer": 3,
          "explanation": "A clear purpose, an explanation of how input will be used, and a moment of rapport put the interviewee at ease and focus the conversation. Hard-first questions and long disclaimers create tension. Good openings earn good answers.",
          "why_wrong": [
            "A ten-minute disclaimer wastes the interviewee's time and patience.",
            "A contract is unnecessary and intimidating for an elicitation interview.",
            "Hard-first questions put the interviewee on the defensive.",
            ""
          ]
        },
        {
          "id": "ba-12-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "An interviewee keeps going off topic. What should the BA do?",
          "options": [
            "Acknowledge the point, park it visibly, and steer back to the agenda",
            "Interrupt rudely and move on",
            "End the interview",
            "Let them talk indefinitely"
          ],
          "answer": 0,
          "explanation": "Parking off-topic points visibly respects the interviewee's contribution while protecting the agenda. The parked item can be revisited later if relevant. Rudeness and indefinite drift both damage the interview's value.",
          "why_wrong": [
            "",
            "Rude interruption damages rapport and future cooperation.",
            "Ending the interview loses the remaining elicitation opportunity.",
            "Indefinite drift wastes the interview time."
          ]
        },
        {
          "id": "ba-12-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is a parking lot in a workshop?",
          "options": [
            "A place to leave cars",
            "A visible list of off-topic items to handle later",
            "A break area",
            "A list of people who arrived late"
          ],
          "answer": 1,
          "explanation": "A parking lot captures valuable but off-topic items visibly, so they are not lost and do not derail the session. It is a facilitation device for focus with respect. The items are reviewed at the end or in a follow-up.",
          "why_wrong": [
            "This is a facilitation term, not a literal car park.",
            "",
            "A break area serves a different purpose.",
            "Late arrivals are not what a parking lot records."
          ]
        },
        {
          "id": "ba-12-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "After a workshop, what must the BA circulate promptly?",
          "options": [
            "A list of everyone who spoke",
            "Photos of the room",
            "Agreed decisions, actions with owners and dates, and open items",
            "The catering menu"
          ],
          "answer": 2,
          "explanation": "Prompt circulation of decisions, owned actions, and open items locks in agreement while memory is fresh and gives everyone a chance to correct the record. Photos and menus do not advance the work. The output document is the workshop's real product.",
          "why_wrong": [
            "A speaker list records participation, not decisions.",
            "Room photos do not record decisions or actions.",
            "",
            "The catering menu is irrelevant to workshop outcomes."
          ]
        },
        {
          "id": "ba-12-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A workshop includes both senior managers and front-line users. What facilitation risk must the BA manage?",
          "options": [
            "The room being too large",
            "Junior staff holding back in front of senior managers",
            "Too much coffee",
            "The workshop finishing early"
          ],
          "answer": 1,
          "explanation": "Hierarchy suppresses candour: front-line users may withhold real problems when their managers are present. The BA must create safety through techniques such as anonymous input, small groups, or separate sessions. Mixed-hierarchy sessions need deliberate design.",
          "why_wrong": [
            "Room size is a logistics detail, not the key facilitation risk.",
            "",
            "Coffee is not a facilitation risk.",
            "Finishing early is rarely the problem in mixed-hierarchy workshops."
          ]
        },
        {
          "id": "ba-12-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Which interview question is open-ended?",
          "options": [
            "Do you approve this design?",
            "Did the system fail yesterday?",
            "Walk me through what happens when a claim arrives",
            "Is the report ready?"
          ],
          "answer": 2,
          "explanation": "Walk me through invites a narrative answer in the interviewee's own words, revealing process detail and context. Yes-or-no questions close the conversation down. Open questions are the BA's main tool for discovery.",
          "why_wrong": [
            "This asks for approval, so it invites only a yes or no, and it closes the conversation instead of opening it.",
            "This asks about one past fact, so the answer is yes or no, with no room for the interviewee to explain what happened.",
            "",
            "This is a status check with a yes or no answer; it reveals nothing about the process behind the report."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-13",
        "title": "BA Test 13: BRD, FRD and Use Cases",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-13-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is the primary focus of a Business Requirements Document?",
          "options": [
            "The business problem, goals, and what the business needs",
            "Server configuration",
            "Test execution results",
            "Technical design and code structure"
          ],
          "answer": 0,
          "explanation": "A BRD describes the business need: the problem, objectives, scope, and business requirements, in business language. Technical design belongs in design documents, and test results in test reports. The BRD is the business's statement of need.",
          "why_wrong": [
            "",
            "Server configuration is a technical detail, not a business requirement.",
            "Test results belong in test reports, not the BRD.",
            "Technical design belongs in design documents, not the BRD."
          ]
        },
        {
          "id": "ba-13-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "How does a Functional Requirements Document differ from a BRD?",
          "options": [
            "It is shorter",
            "It specifies system behaviour in detail: functions, inputs, outputs, and rules",
            "It has no requirements",
            "It is written only by developers"
          ],
          "answer": 1,
          "explanation": "The FRD translates business needs into detailed system behaviour: what the system must do, its inputs and outputs, and the rules it must apply. The BRD states the need; the FRD states the system response. Length and authorship do not define the difference.",
          "why_wrong": [
            "Length does not define the difference between BRD and FRD.",
            "",
            "The FRD is full of requirements, expressed as system behaviour.",
            "The FRD is usually written by the BA, not only by developers."
          ]
        },
        {
          "id": "ba-13-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "In a use case, what is an actor?",
          "options": [
            "A test environment",
            "A person who writes the use case",
            "A role that interacts with the system to achieve a goal",
            "A database table"
          ],
          "answer": 2,
          "explanation": "An actor is a role, person, or external system that interacts with the system to achieve a goal. Actors are defined by their role, not by individual names. The actor-goal framing keeps use cases focused on outcomes.",
          "why_wrong": [
            "A test environment is infrastructure, not an actor.",
            "The author is not the actor; the actor interacts with the system.",
            "",
            "A database table is internal; actors are external to the system."
          ]
        },
        {
          "id": "ba-13-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What does the main success scenario of a use case describe?",
          "options": [
            "The system failure modes",
            "The project timeline",
            "Every possible error",
            "The normal path where the actor achieves the goal without exceptions"
          ],
          "answer": 3,
          "explanation": "The main success scenario is the happy path: the steps when everything goes as expected and the goal is achieved. Exceptions and alternatives are documented separately as extensions. Separating the normal path from exceptions keeps the use case readable.",
          "why_wrong": [
            "Failure modes belong in extensions and non-functional requirements.",
            "The timeline is a project artefact, not a use case element.",
            "Errors belong in extensions, not the main success scenario.",
            ""
          ]
        },
        {
          "id": "ba-13-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What are extensions in a use case?",
          "options": [
            "Alternative and exception flows that branch from the main scenario",
            "Extra actors",
            "Longer document titles",
            "Additional pages added later"
          ],
          "answer": 0,
          "explanation": "Extensions describe what happens when the main path deviates: errors, alternatives, and edge cases, each tied to the step where it branches. They are essential for complete requirements. Without extensions, only the happy path is specified.",
          "why_wrong": [
            "",
            "Extra actors are separate use case elements, not extensions.",
            "Titles have nothing to do with extensions.",
            "Extensions are flows, not added pages."
          ]
        },
        {
          "id": "ba-13-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is a precondition in a use case?",
          "options": [
            "A type of test data",
            "A condition that must be true before the use case starts",
            "A condition checked after the use case ends",
            "A requirement for the project manager"
          ],
          "answer": 1,
          "explanation": "Preconditions state what must already be true for the use case to begin, such as the user being logged in. Postconditions state what is true when it ends. Getting preconditions right prevents misunderstandings about starting state.",
          "why_wrong": [
            "Test data is a separate concern from use case preconditions.",
            "",
            "Conditions checked after the use case are postconditions.",
            "Preconditions describe system state, not project roles."
          ]
        },
        {
          "id": "ba-13-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BRD and an FRD contradict each other on one rule. What should the BA do?",
          "options": [
            "Delete the BRD",
            "Leave both and let developers guess",
            "Resolve the conflict with stakeholders and align both documents",
            "Delete the FRD"
          ],
          "answer": 2,
          "explanation": "Conflicting documents guarantee conflicting builds, so the BA must resolve the contradiction with the business and update both documents to one agreed truth. Deleting a document removes needed detail. Alignment is the BA's job.",
          "why_wrong": [
            "Deleting the BRD removes the business statement of need.",
            "Leaving a contradiction forces developers to guess the business intent.",
            "",
            "Deleting the FRD removes the detailed system specification."
          ]
        },
        {
          "id": "ba-13-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "When is a use case diagram most useful?",
          "options": [
            "To show database tables",
            "To show the project budget",
            "To show code structure",
            "To show the scope of a system: its actors and their goals at a glance"
          ],
          "answer": 3,
          "explanation": "A use case diagram gives a one-page view of system scope: who interacts with the system and what goals they pursue. It is a scoping and communication tool, not a code, database, or budget view. The diagram complements the written use cases.",
          "why_wrong": [
            "Database tables belong in data models, not use case diagrams.",
            "Budgets belong in financial documents, not use case diagrams.",
            "Code structure is shown in design diagrams, not use case diagrams.",
            ""
          ]
        },
        {
          "id": "ba-13-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A use case step says 'The system processes the request.' Why is this weak?",
          "options": [
            "It hides what processing means: rules, validations, and outcomes",
            "It uses the word system",
            "It is written in present tense",
            "It is too long"
          ],
          "answer": 0,
          "explanation": "Processes the request is a black box that hides the rules, validations, and outcomes the team must build and test. Good use case steps name the specific action and result. Vague verbs are a common requirements defect.",
          "why_wrong": [
            "",
            "Naming the system as the actor is normal in use cases.",
            "Present tense is the standard style for use case steps.",
            "Length is not the problem; vagueness is."
          ]
        },
        {
          "id": "ba-13-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Who should sign off a BRD?",
          "options": [
            "Only the developers",
            "The business sponsor or accountable business owner",
            "Only the testers",
            "Nobody, BRDs need no approval"
          ],
          "answer": 1,
          "explanation": "The BRD states the business need, so the accountable business owner must approve it, confirming it represents what the business wants. Developers and testers review it, but business ownership sits with the sponsor. Sign-off is a business commitment.",
          "why_wrong": [
            "Developers review the BRD but do not own the business need.",
            "",
            "Testers review the BRD but do not own the business need.",
            "Unapproved requirements have no agreed baseline."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-14",
        "title": "BA Test 14: Change Control",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-14-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A stakeholder asks for a change after requirements sign-off. What is the first step?",
          "options": [
            "Build it immediately",
            "Record the change request and assess its impact",
            "Refuse all post-sign-off changes",
            "Ignore the request"
          ],
          "answer": 1,
          "explanation": "Every post-baseline change must be recorded and impact-assessed for scope, cost, schedule, and risk before a decision is made. Building immediately bypasses control, and refusing outright ignores legitimate needs. Controlled assessment enables informed decisions.",
          "why_wrong": [
            "Building immediately bypasses impact assessment and control.",
            "",
            "Refusing all changes ignores legitimate evolving needs.",
            "Ignoring a request leaves the stakeholder unheard and the need unaddressed."
          ]
        },
        {
          "id": "ba-14-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is scope creep?",
          "options": [
            "A type of risk register",
            "Planned scope growth agreed through change control",
            "Uncontrolled expansion of scope without proper assessment or approval",
            "A planned project phase"
          ],
          "answer": 2,
          "explanation": "Scope creep is the gradual, uncontrolled addition of work beyond the agreed baseline, without impact assessment or approval. Agreed growth through change control is legitimate scope change, not creep. Creep erodes schedule, budget, and quality.",
          "why_wrong": [
            "A risk register is a different artefact.",
            "Agreed growth through control is legitimate change, not creep.",
            "",
            "Scope creep is not a project phase."
          ]
        },
        {
          "id": "ba-14-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Who typically approves a significant change request?",
          "options": [
            "The newest team member",
            "Nobody, changes need no approval",
            "The BA alone",
            "A change control board or the accountable sponsor"
          ],
          "answer": 3,
          "explanation": "Significant changes need approval from a change authority such as a change control board or the sponsor, who can weigh cost, benefit, and risk against the baseline. The BA analyses and recommends but does not approve their own analysis. Approval authority matches impact.",
          "why_wrong": [
            "Seniority and accountability matter for change approval.",
            "Unapproved significant changes undermine the baseline.",
            "The BA analyses change; approval sits with the accountable authority.",
            ""
          ]
        },
        {
          "id": "ba-14-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What should an impact assessment for a change request cover?",
          "options": [
            "Scope, cost, schedule, risk, and affected artefacts",
            "Only the schedule",
            "Only the stakeholder's feelings",
            "Only the cost"
          ],
          "answer": 0,
          "explanation": "A proper impact assessment covers scope, cost, time, risk, and every affected requirement, design, and test artefact, so the approver decides with full information. Single-dimension assessment hides trade-offs. Completeness prevents nasty surprises.",
          "why_wrong": [
            "",
            "Schedule alone hides cost, scope, and risk effects.",
            "Feelings matter for engagement but are not an impact assessment.",
            "Cost alone hides schedule, scope, and risk effects."
          ]
        },
        {
          "id": "ba-14-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A change is approved. What must the BA update?",
          "options": [
            "Nothing, approval is enough",
            "The baseline documents, traceability, and affected plans",
            "Only the change log title",
            "Only the project chat message"
          ],
          "answer": 1,
          "explanation": "An approved change must flow into the baseline documents, traceability links, and affected plans, or the team keeps working from outdated artefacts. Approval without updating the baseline is an empty gesture. The baseline must always reflect the agreed truth.",
          "why_wrong": [
            "Approval without updating documents leaves the team on the old baseline.",
            "",
            "A log title alone does not update the affected artefacts.",
            "A chat message is not a controlled baseline update."
          ]
        },
        {
          "id": "ba-14-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A developer implements a small change without telling anyone. What is the risk?",
          "options": [
            "The project will finish early",
            "No risk, small changes never matter",
            "Untested, undocumented change that breaks traceability and may conflict with other work",
            "The change will always be perfect"
          ],
          "answer": 2,
          "explanation": "Undocumented changes, however small, break traceability, skip testing, and can conflict with other work or expectations. Small is not the same as safe. Change control exists precisely to catch these.",
          "why_wrong": [
            "Hidden change does not reliably shorten a project.",
            "Small changes can have large knock-on effects.",
            "",
            "Unreviewed change is not guaranteed to be correct."
          ]
        },
        {
          "id": "ba-14-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is a change log used for?",
          "options": [
            "To list team birthdays",
            "To track office supplies",
            "To record meeting room bookings",
            "To record every change request, its status, and its decision"
          ],
          "answer": 3,
          "explanation": "A change log is the single record of all change requests, their assessment, status, and decisions, giving the project an audit trail. It prevents requests being lost or decided twice. Without a log, change history is hearsay.",
          "why_wrong": [
            "Birthdays belong elsewhere, not in a change log.",
            "Office supplies are unrelated to change control.",
            "Room bookings are unrelated to change control.",
            ""
          ]
        },
        {
          "id": "ba-14-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A change request is rejected. What should happen?",
          "options": [
            "Record the rejection and reason, and inform the requester",
            "Delete the request as if it never existed",
            "Punish the requester",
            "Build it anyway"
          ],
          "answer": 0,
          "explanation": "Rejected requests must be recorded with their reasons and communicated to the requester, so the decision is understood and the request is not raised again blindly. Deleting the record loses the audit trail. Respectful closure matters.",
          "why_wrong": [
            "",
            "Deleting the record destroys the audit trail.",
            "Punishment is never an appropriate response to a change request.",
            "Building a rejected change defies the change authority."
          ]
        },
        {
          "id": "ba-14-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is the difference between a change request and a defect?",
          "options": [
            "A change request is always urgent",
            "There is no difference",
            "A defect is a failure to meet an agreed requirement; a change request asks to alter the agreed baseline",
            "A defect is always more expensive"
          ],
          "answer": 2,
          "explanation": "Defects mean the delivered work does not match the agreed requirement, while change requests propose altering the requirement itself. The distinction matters because defects are fixed under warranty or quality processes, while changes go through change control. Mixing them up misroutes the work.",
          "why_wrong": [
            "Urgency does not define the difference.",
            "The distinction drives different handling routes.",
            "",
            "Cost does not define the difference."
          ]
        },
        {
          "id": "ba-14-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "An emergency fix is needed in production. How should change control handle it?",
          "options": [
            "Wait for the next monthly board meeting",
            "Never fix production issues",
            "Skip all control forever",
            "Use an expedited emergency route, then record and review it retrospectively"
          ],
          "answer": 3,
          "explanation": "Emergencies need an expedited route that allows fast action with retrospective recording and review, balancing speed with control. Skipping control entirely loses the audit trail, and waiting for a monthly board leaves production broken. Emergency process is still process.",
          "why_wrong": [
            "Waiting a month leaves a production problem unfixed.",
            "Production issues must be fixed; the question is how, not whether.",
            "Skipping control entirely loses the audit trail.",
            ""
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-15",
        "title": "BA Test 15: Estimation Techniques",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-15-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is story point estimation based on?",
          "options": [
            "The calendar date",
            "Exact hours of work",
            "Relative size and complexity compared to other stories",
            "The number of developers"
          ],
          "answer": 2,
          "explanation": "Story points express relative size: how big and complex this story is compared to stories the team already knows. They are deliberately not hours, because hours vary by person. Relative sizing is faster and more stable than absolute guessing.",
          "why_wrong": [
            "Calendar dates have nothing to do with story points.",
            "Story points are relative, not exact hours.",
            "",
            "Team size does not define a story's points."
          ]
        },
        {
          "id": "ba-15-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "In planning poker, why do team members reveal estimates simultaneously?",
          "options": [
            "To make the game more fun",
            "To hide estimates from the product owner",
            "To save time",
            "To avoid anchoring on the first estimate spoken"
          ],
          "answer": 3,
          "explanation": "Simultaneous reveal prevents anchoring, where the first number spoken biases everyone else's judgement. Independent estimates surface genuine disagreement, which the team then discusses. Anchoring is a well-known estimation bias.",
          "why_wrong": [
            "Fun is not the purpose of the technique.",
            "Estimates are shared openly with the product owner.",
            "Saving time is a side benefit, not the main reason.",
            ""
          ]
        },
        {
          "id": "ba-15-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A team estimates a story at 21 points, far larger than anything they have done. What should they consider?",
          "options": [
            "Splitting the story into smaller, better-understood pieces",
            "Reducing the estimate to 3 points",
            "Skipping estimation for this story",
            "Accept it and start immediately"
          ],
          "answer": 0,
          "explanation": "Very large estimates signal poor understanding or excessive size, and splitting produces smaller pieces the team can estimate and deliver with confidence. Accepting a huge estimate hides uncertainty. Splitting is the standard response to oversized stories.",
          "why_wrong": [
            "",
            "Arbitrarily reducing the number does not reduce the work.",
            "Skipping estimation leaves the team blind about size.",
            "Accepting a huge estimate hides the uncertainty behind it."
          ]
        },
        {
          "id": "ba-15-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is the cone of uncertainty?",
          "options": [
            "A meeting room shape",
            "The idea that estimates are least accurate early and improve as more is learned",
            "A type of chart for bugs",
            "A risk that never changes"
          ],
          "answer": 1,
          "explanation": "The cone of uncertainty shows that early estimates carry wide error ranges, which narrow as the team learns more about the work. It warns against treating early estimates as commitments. Re-estimation as knowledge grows is expected, not failure.",
          "why_wrong": [
            "It is an estimation concept, not a room shape.",
            "",
            "It concerns estimate accuracy, not bug charts.",
            "Uncertainty changes as learning happens; that is the point."
          ]
        },
        {
          "id": "ba-15-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A manager asks a BA for a single exact delivery date nine months out. What is the honest response?",
          "options": [
            "Guess a date and never revisit it",
            "Give an exact date with false confidence",
            "Give a range with stated assumptions, and explain it will narrow as work progresses",
            "Refuse to answer"
          ],
          "answer": 2,
          "explanation": "Honest estimation at long range means a range with explicit assumptions, plus a commitment to refine as knowledge grows. False precision misleads stakeholders and creates impossible commitments. Ranges with assumptions are professional, not evasive.",
          "why_wrong": [
            "An unrevised guess becomes a false commitment.",
            "False precision misleads stakeholders and creates impossible commitments.",
            "",
            "Refusing to answer helps nobody; a ranged estimate does."
          ]
        },
        {
          "id": "ba-15-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What does three-point estimation use?",
          "options": [
            "Three developers' guesses only",
            "Three random numbers",
            "Past, present, and future dates",
            "Optimistic, most likely, and pessimistic estimates"
          ],
          "answer": 3,
          "explanation": "Three-point estimation combines optimistic, most likely, and pessimistic figures, often weighted toward the most likely, to produce an expected value that reflects uncertainty. It surfaces the range explicitly. Random numbers and single guesses do not.",
          "why_wrong": [
            "It uses three scenarios, not three people's single guesses.",
            "Random numbers carry no information about the work.",
            "Dates are not the three points; scenarios are.",
            ""
          ]
        },
        {
          "id": "ba-15-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Why should estimates be given by the people doing the work?",
          "options": [
            "Because the doers understand the work, its risks, and its unknowns best",
            "Because estimates must be secret",
            "Because BAs cannot estimate",
            "Because managers are too busy"
          ],
          "answer": 0,
          "explanation": "The people closest to the work have the best knowledge of its complexity and risks, and owning the estimate builds commitment to it. Imposed estimates from afar are usually wrong and resented. Estimation is a team activity, not a management decree.",
          "why_wrong": [
            "",
            "Estimates should be transparent, not secret.",
            "BAs can estimate analysis work; the point is who knows the work best.",
            "Manager busyness is not the reason; knowledge is."
          ]
        },
        {
          "id": "ba-15-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A team consistently delivers half its estimated velocity. What should happen?",
          "options": [
            "Double the estimates",
            "Investigate why: sizing, interruptions, unclear stories, or hidden work",
            "Halve the sprint length",
            "Blame the team publicly"
          ],
          "answer": 1,
          "explanation": "A persistent velocity gap signals a systemic cause: oversized stories, interruptions, unclear requirements, or unplanned work. Investigating the cause fixes the system; manipulating numbers hides it. Velocity problems are diagnostic, not moral.",
          "why_wrong": [
            "Doubling estimates games the number without fixing the cause.",
            "",
            "Halving sprint length does not address the underlying cause.",
            "Blame does not diagnose or fix a systemic gap."
          ]
        },
        {
          "id": "ba-15-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is analogous estimation?",
          "options": [
            "Estimating by copying another team's numbers",
            "Estimating without any data",
            "Estimating using only gut feel",
            "Estimating by comparing with similar past work"
          ],
          "answer": 3,
          "explanation": "Analogous estimation compares new work with similar completed work and adjusts for differences. It is fast and grounded when good history exists. Copying unrelated numbers, using no data, or pure gut feel are not analogous estimation.",
          "why_wrong": [
            "Copying another team's numbers ignores context differences.",
            "Analogous estimation uses past data; it is not data-free.",
            "Gut feel alone is not analogous estimation.",
            ""
          ]
        },
        {
          "id": "ba-15-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "An estimate and a commitment are different. What makes a commitment?",
          "options": [
            "A promise to deliver by a date, made with understood scope, risk, and capacity",
            "A number written in a spreadsheet",
            "Any guess shared in a meeting",
            "A larger number"
          ],
          "answer": 0,
          "explanation": "A commitment is a promise grounded in understood scope, assessed risk, and available capacity, made by the people who will deliver it. An estimate is a forecast. Confusing the two turns forecasts into false promises.",
          "why_wrong": [
            "",
            "Writing a number down does not make it a promise.",
            "A casual guess is not a commitment.",
            "Size does not turn an estimate into a commitment."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-16",
        "title": "BA Test 16: Definition of Done and Definition of Ready",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-16-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What does the Definition of Done describe?",
          "options": [
            "The project end date",
            "When the sprint starts",
            "When a story is first written",
            "The shared checklist that must be true before work is called complete"
          ],
          "answer": 3,
          "explanation": "The Definition of Done is the team's shared quality checklist: code reviewed, tested, documented, and accepted, as agreed. Without it, done means different things to different people. A shared definition prevents half-finished work being called complete.",
          "why_wrong": [
            "The project end date is a schedule fact, not a quality checklist.",
            "Sprint start is a calendar event, not a completion standard.",
            "Writing a story is the start, not the Definition of Done.",
            ""
          ]
        },
        {
          "id": "ba-16-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A developer says a story is done, but it has not been tested. Under a good Definition of Done, is it done?",
          "options": [
            "No, testing is part of done",
            "Yes, if the developer is confident",
            "It depends on the developer's mood",
            "Yes, coding is enough"
          ],
          "answer": 0,
          "explanation": "Done includes testing and acceptance, not just coding. Calling untested work done hides quality risk and inflates progress. The Definition of Done exists precisely to prevent this misunderstanding.",
          "why_wrong": [
            "",
            "Confidence is not evidence; testing is.",
            "Mood is not a completion criterion.",
            "Coding alone is not done under any serious definition."
          ]
        },
        {
          "id": "ba-16-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What does the Definition of Ready describe?",
          "options": [
            "When a project is finished",
            "The criteria a story must meet before the team pulls it into a sprint",
            "When a developer is ready to go home",
            "The release date"
          ],
          "answer": 1,
          "explanation": "The Definition of Ready sets the entry bar for sprint work: clear story, agreed acceptance criteria, dependencies known, and estimated. Pulling unready work into a sprint causes mid-sprint discovery and delay. Ready protects the sprint.",
          "why_wrong": [
            "Project finish is unrelated to story readiness.",
            "",
            "Going home is not a readiness criterion.",
            "The release date is a schedule fact, not a readiness standard."
          ]
        },
        {
          "id": "ba-16-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A story meets the Definition of Ready but has no acceptance criteria. Is it ready?",
          "options": [
            "Yes, if the team is experienced",
            "Yes, criteria are optional",
            "No, acceptance criteria are a core readiness item",
            "Yes, if the story is small"
          ],
          "answer": 2,
          "explanation": "Acceptance criteria are essential to readiness, because without them the team cannot know when the story is complete or how to test it. Size and experience do not substitute for agreed criteria. Ready means the team can start with confidence.",
          "why_wrong": [
            "Experience does not replace agreed acceptance conditions.",
            "Criteria are not optional; they define completion.",
            "",
            "Small stories still need to know when they are done."
          ]
        },
        {
          "id": "ba-16-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Who owns the Definition of Done?",
          "options": [
            "The customer alone",
            "The BA alone",
            "The project manager alone",
            "The whole Scrum team, agreed together"
          ],
          "answer": 3,
          "explanation": "The Definition of Done is a team agreement covering development, testing, and acceptance, so the whole team owns it. Single-role ownership produces a definition others ignore. Shared ownership means shared accountability for quality.",
          "why_wrong": [
            "The customer gives input, but the team owns its working agreement.",
            "The BA contributes, but does not own the team's definition alone.",
            "The project manager does not unilaterally define team quality standards.",
            ""
          ]
        },
        {
          "id": "ba-16-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A team keeps discovering undone work after claiming stories are done. What should they do?",
          "options": [
            "Review and strengthen the Definition of Done, and apply it consistently",
            "Hide the undone work",
            "Work longer hours",
            "Stop using a Definition of Done"
          ],
          "answer": 0,
          "explanation": "Repeated undiscovered undone work means the definition is weak or unenforced. The team should revisit it, add the missing checks, and hold each other to it. Abandoning the definition removes the only standard that catches the gap.",
          "why_wrong": [
            "",
            "Hiding undone work guarantees it surfaces later, worse.",
            "Longer hours do not fix a missing quality standard.",
            "Abandoning the definition removes the standard that catches gaps."
          ]
        },
        {
          "id": "ba-16-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Which item belongs in a Definition of Done?",
          "options": [
            "Story written on a card",
            "Code reviewed, tests passed, documentation updated, accepted by the product owner",
            "Sprint planning attended",
            "Daily stand-up held"
          ],
          "answer": 1,
          "explanation": "Done covers the quality gates for the work itself: review, testing, documentation, and acceptance. Meetings and card-writing are process activities, not completion evidence. The definition must describe the state of the work, not attendance.",
          "why_wrong": [
            "Writing a card is the start of work, not its completion.",
            "",
            "Attending planning is a process activity, not completion evidence.",
            "Holding stand-ups is a process activity, not completion evidence."
          ]
        },
        {
          "id": "ba-16-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A story is done except for documentation. The Definition of Done includes documentation. What is the story's status?",
          "options": [
            "Done, documentation can wait forever",
            "Done, documentation does not matter",
            "Not done, until documentation is complete",
            "Done, if nobody notices"
          ],
          "answer": 2,
          "explanation": "If documentation is in the agreed definition, the story is not done until it is written. Exceptions made quietly erode the standard for everything else. The definition only works when it is applied without silent exceptions.",
          "why_wrong": [
            "Deferring documentation forever means it never happens.",
            "Documentation in the definition is part of done, not optional.",
            "",
            "Done is a standard, not a matter of being noticed."
          ]
        },
        {
          "id": "ba-16-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "How does a Definition of Ready help sprint planning?",
          "options": [
            "It makes planning longer",
            "It ensures only well-understood, estimated work is selected, so planning is realistic",
            "It removes the need for planning",
            "It lets the team skip estimation"
          ],
          "answer": 1,
          "explanation": "Ready criteria filter out half-baked stories before planning, so the team commits to work it understands and can estimate. Planning becomes a selection and confirmation exercise rather than a discovery session. Readiness makes commitments realistic.",
          "why_wrong": [
            "Ready criteria make planning more focused, not longer.",
            "",
            "Planning is still needed; readiness improves it.",
            "Estimation is part of readiness; it is not skipped."
          ]
        },
        {
          "id": "ba-16-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Should the Definition of Done change over time?",
          "options": [
            "Only once a year",
            "Never, it is fixed forever",
            "Yes, it should strengthen as the team matures and quality expectations rise",
            "Only if the customer complains"
          ],
          "answer": 2,
          "explanation": "As teams mature, they add stronger quality practices such as automation or performance checks to the definition, raising the bar deliberately. A frozen definition stops improvement. Evolution of done reflects growing capability.",
          "why_wrong": [
            "Annual change is arbitrary; improvement should happen when the team is ready.",
            "A frozen definition blocks continuous improvement.",
            "",
            "Waiting for complaints is reactive; teams should raise the bar proactively."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-17",
        "title": "BA Test 17: Backlog Refinement",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-17-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is the purpose of backlog refinement?",
          "options": [
            "To clarify, split, estimate, and order upcoming items so they are ready for planning",
            "To assign blame for delays",
            "To write code",
            "To delete the backlog"
          ],
          "answer": 0,
          "explanation": "Refinement prepares upcoming backlog items: adding detail, splitting large items, estimating, and ordering them, so sprint planning can select ready work. It is ongoing preparation, not deletion, blame, or coding. Good refinement makes planning smooth.",
          "why_wrong": [
            "",
            "Blame is not a refinement activity.",
            "Coding happens in the sprint, not in refinement.",
            "Refinement prepares the backlog; it does not delete it."
          ]
        },
        {
          "id": "ba-17-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "How far ahead should refinement typically look?",
          "options": [
            "Only the current sprint",
            "One to three sprints ahead",
            "The entire five-year roadmap in full detail",
            "Never look ahead"
          ],
          "answer": 1,
          "explanation": "Refining one to three sprints ahead keeps upcoming work ready without wasting effort detailing items that may change or drop. Current-sprint-only refinement leaves planning starved, and full-roadmap detail goes stale. Just enough, just in time.",
          "why_wrong": [
            "Current-sprint-only refinement leaves future planning unprepared.",
            "",
            "Full detail on a five-year roadmap wastes effort on work that will change.",
            "Never looking ahead guarantees unready work at planning."
          ]
        },
        {
          "id": "ba-17-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "During refinement, the team discovers a story depends on another team. What should happen?",
          "options": [
            "Build the story without the dependency",
            "Ignore the dependency",
            "Record the dependency and plan how and when it will be resolved",
            "Cancel the story"
          ],
          "answer": 2,
          "explanation": "Dependencies found in refinement must be recorded with an owner and a resolution plan, so they do not ambush the sprint. Ignoring them guarantees mid-sprint blockage. Early visibility is the whole point of refinement.",
          "why_wrong": [
            "Building without a needed dependency produces incomplete work.",
            "Ignoring a known dependency guarantees a mid-sprint surprise.",
            "",
            "Cancellation is premature; the dependency may be resolvable."
          ]
        },
        {
          "id": "ba-17-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A backlog item has been refined three times and is still unclear. What should the BA do?",
          "options": [
            "Force it into the next sprint",
            "Delete it silently",
            "Keep refining it forever",
            "Run a focused discovery session or spike to resolve the unknowns"
          ],
          "answer": 3,
          "explanation": "Repeated refinement without progress signals missing knowledge, which a focused spike or discovery session can resolve. Endless refinement and forced inclusion both waste effort. Timeboxed investigation breaks the deadlock.",
          "why_wrong": [
            "Forcing unclear work into a sprint guarantees mid-sprint discovery.",
            "Silent deletion loses potentially valuable work.",
            "Endless refinement without new information solves nothing.",
            ""
          ]
        },
        {
          "id": "ba-17-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Who should attend backlog refinement?",
          "options": [
            "The product owner and the delivery team, with the BA facilitating analysis",
            "Only senior managers",
            "Nobody, it is a solo activity",
            "Only the product owner"
          ],
          "answer": 0,
          "explanation": "Refinement needs the product owner for value and priority decisions and the team for feasibility, splitting, and estimation, with the BA supporting analysis. Solo refinement misses the technical perspective. Collaboration produces ready items.",
          "why_wrong": [
            "",
            "Senior managers do not do the delivery work being refined.",
            "Refinement is collaborative, not solo.",
            "The product owner alone cannot assess feasibility or estimate."
          ]
        },
        {
          "id": "ba-17-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is a spike in Agile?",
          "options": [
            "A sharp increase in bugs",
            "A timeboxed investigation to reduce uncertainty before committing to work",
            "A type of sprint review",
            "A stakeholder complaint"
          ],
          "answer": 1,
          "explanation": "A spike is a small, timeboxed piece of research or prototyping that answers a question blocking estimation or design. It reduces uncertainty so the team can commit with confidence. Spikes produce knowledge, not shippable features.",
          "why_wrong": [
            "A bug increase is a quality problem, not a spike.",
            "",
            "A sprint review inspects the increment; a spike investigates unknowns.",
            "A complaint is feedback, not a spike."
          ]
        },
        {
          "id": "ba-17-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A refined story grows from 3 points to 13 points after discussion. What does this tell the team?",
          "options": [
            "The story should be abandoned",
            "The team is getting worse",
            "Refinement surfaced hidden complexity that was previously invisible",
            "Estimation is pointless"
          ],
          "answer": 2,
          "explanation": "Growth during refinement means discussion revealed real complexity, dependencies, or edge cases that the first estimate missed. That is refinement working as intended. The team can now split or reprioritise with open eyes.",
          "why_wrong": [
            "Abandonment is premature; splitting or reprioritising are the options.",
            "Growing estimates reflect revealed complexity, not declining skill.",
            "",
            "Estimation surfaced the truth; that proves its value."
          ]
        },
        {
          "id": "ba-17-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What should happen to backlog items that are no longer needed?",
          "options": [
            "Hide them at the bottom",
            "Build them anyway",
            "Keep them forever just in case",
            "Remove them, with the product owner's agreement, to keep the backlog honest"
          ],
          "answer": 3,
          "explanation": "Dead items clutter the backlog, distort forecasting, and waste refinement effort. Removing them with the product owner's agreement keeps the backlog a true picture of future work. Pruning is healthy backlog hygiene.",
          "why_wrong": [
            "Hiding items leaves them to confuse future planning.",
            "Building unneeded work wastes capacity.",
            "Keeping dead items clutters the backlog and distorts forecasts.",
            ""
          ]
        },
        {
          "id": "ba-17-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Refinement sessions keep turning into detailed design meetings. What should change?",
          "options": [
            "Keep refinement focused on what and why, and move detailed design to the sprint or a separate session",
            "Cancel refinement",
            "Invite more people",
            "Let them continue as design meetings"
          ],
          "answer": 0,
          "explanation": "Refinement clarifies the what and why to the level needed for estimation and readiness; detailed design belongs in the sprint or a dedicated session. Design-heavy refinement burns the whole team's time prematurely. Focus keeps refinement efficient.",
          "why_wrong": [
            "",
            "Cancelling refinement leaves planning unprepared.",
            "More people makes unfocused sessions worse, not better.",
            "Design-heavy refinement wastes the whole team's time on premature detail."
          ]
        },
        {
          "id": "ba-17-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is the relationship between refinement and sprint planning?",
          "options": [
            "They are the same meeting",
            "Refinement prepares items; planning selects from prepared items and commits",
            "Refinement replaces planning",
            "Planning replaces refinement"
          ],
          "answer": 1,
          "explanation": "Refinement is ongoing preparation; sprint planning is the selection and commitment event that draws on prepared items. Neither replaces the other. Good refinement makes planning short and confident.",
          "why_wrong": [
            "They serve different purposes at different times.",
            "",
            "Refinement prepares; it does not commit the sprint.",
            "Planning selects; it cannot prepare items from scratch."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-18",
        "title": "BA Test 18: Non-Functional Requirements",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-18-01",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Which of these is a non-functional requirement?",
          "options": [
            "The system must let users transfer funds",
            "The system must respond within 2 seconds for 95 percent of requests",
            "The system must show an account balance",
            "The system must send a confirmation email"
          ],
          "answer": 1,
          "explanation": "Non-functional requirements describe qualities: performance, reliability, security, usability. A response-time target is a classic performance NFR. The other options describe functions the system performs. Qualities constrain how well functions work.",
          "why_wrong": [
            "Transferring funds is a function, not a quality.",
            "",
            "Showing a balance is a function, not a quality.",
            "Sending an email is a function, not a quality."
          ]
        },
        {
          "id": "ba-18-02",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A stakeholder says the system must be secure. What should the BA do?",
          "options": [
            "Leave security to developers without requirements",
            "Record secure as the requirement",
            "Elicit specific security needs: authentication, authorisation, encryption, audit",
            "Assume default security is enough"
          ],
          "answer": 2,
          "explanation": "Secure is too vague to build or test, so the BA must break it into specific, verifiable security requirements covering authentication, authorisation, data protection, and audit. Defaults and assumptions leave gaps. Specificity makes security testable.",
          "why_wrong": [
            "Leaving security unspecified guarantees gaps.",
            "Secure alone cannot be built or tested.",
            "",
            "Defaults may not match this system's risk profile."
          ]
        },
        {
          "id": "ba-18-03",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What does availability of 99.9 percent mean?",
          "options": [
            "The system never fails",
            "The system has 999 users",
            "The system is fast",
            "The system may be unavailable for about 8.8 hours per year"
          ],
          "answer": 3,
          "explanation": "Availability percentages translate to allowed downtime: 99.9 percent permits roughly 8.8 hours of downtime a year. It is a reliability target, not a speed or user-count measure. Understanding the arithmetic prevents unrealistic promises.",
          "why_wrong": [
            "99.9 percent explicitly allows some downtime.",
            "User counts are unrelated to availability percentages.",
            "Speed is performance, not availability.",
            ""
          ]
        },
        {
          "id": "ba-18-04",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Which NFR category covers how quickly new users can learn the system?",
          "options": [
            "Usability",
            "Scalability",
            "Maintainability",
            "Performance"
          ],
          "answer": 0,
          "explanation": "Usability covers learnability, ease of use, and user satisfaction, including how quickly new users become productive. Performance is speed, scalability is growth capacity, and maintainability is ease of change. Learnability sits squarely in usability.",
          "why_wrong": [
            "",
            "Scalability covers handling growth, not learnability.",
            "Maintainability covers ease of changing the system, not learning it.",
            "Performance covers speed and throughput, not learnability."
          ]
        },
        {
          "id": "ba-18-05",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A system must handle ten times its current transaction volume next year. Which NFR is this?",
          "options": [
            "Usability",
            "Scalability",
            "Portability",
            "Auditability"
          ],
          "answer": 1,
          "explanation": "Scalability is the ability to handle growth in volume, users, or data without redesign or failure. A tenfold volume increase is a scalability requirement. Usability, portability, and auditability address different qualities.",
          "why_wrong": [
            "Usability concerns ease of use, not volume growth.",
            "",
            "Portability concerns running in different environments.",
            "Auditability concerns traceable records, not volume growth."
          ]
        },
        {
          "id": "ba-18-06",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Why are NFRs often discovered late, and what is the cost?",
          "options": [
            "Late NFRs improve the design",
            "They are unimportant, so late discovery costs nothing",
            "They are assumed rather than stated, and late discovery forces expensive rework",
            "They are always discovered early"
          ],
          "answer": 2,
          "explanation": "NFRs are often left implicit because stakeholders assume qualities such as speed and security, and retrofitting them into a built system is expensive or impossible. Early elicitation of NFRs is cheap insurance. Assumed qualities are the most dangerous requirements.",
          "why_wrong": [
            "Late NFRs force rework; they do not improve the design.",
            "NFRs are critical; late discovery is expensive.",
            "",
            "NFRs are frequently discovered late in practice."
          ]
        },
        {
          "id": "ba-18-07",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Which NFR statement is testable?",
          "options": [
            "The system must be good quality",
            "The system must satisfy users",
            "The system must be reliable",
            "The system must recover from a server failure within 5 minutes with no data loss"
          ],
          "answer": 3,
          "explanation": "A recovery time bound with a no-data-loss condition can be tested by simulating failure. Reliable, good quality, and satisfying are unmeasurable as written. Testable NFRs need numbers, conditions, and observable outcomes.",
          "why_wrong": [
            "Good quality is vague without criteria.",
            "Satisfying users is an outcome, not a testable requirement.",
            "Reliable is vague without a measure.",
            ""
          ]
        },
        {
          "id": "ba-18-08",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What is the difference between a constraint and an NFR?",
          "options": [
            "A constraint is a fixed limitation, such as must use the existing database, while an NFR is a quality target",
            "A constraint is always about cost",
            "An NFR is always about cost",
            "There is no difference"
          ],
          "answer": 0,
          "explanation": "Constraints are imposed limits on the solution, such as mandated technology or regulation, while NFRs are quality targets the solution must achieve. Both shape design, but they are different kinds of requirement. Naming them correctly keeps analysis honest.",
          "why_wrong": [
            "",
            "Constraints cover technology, regulation, and more, not just cost.",
            "NFRs cover many qualities, not just cost.",
            "The distinction matters for design and trade-offs."
          ]
        },
        {
          "id": "ba-18-09",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Accessibility requirements belong to which category?",
          "options": [
            "Capacity",
            "Performance",
            "Usability, including inclusive design for users with disabilities",
            "Security"
          ],
          "answer": 2,
          "explanation": "Accessibility is part of usability: the system must be usable by people with disabilities, such as screen reader support and keyboard navigation. It is often also a legal obligation. Treating it as a usability NFR ensures it is specified and tested.",
          "why_wrong": [
            "Capacity concerns volume, not accessibility.",
            "Performance is about speed, not accessibility.",
            "",
            "Security concerns protection, not accessibility."
          ]
        },
        {
          "id": "ba-18-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA is writing NFRs for a payments system. Which area must not be missed?",
          "options": [
            "The colour of the login page",
            "The brand of office chairs",
            "The office layout",
            "Data integrity, audit trails, and recovery after failure"
          ],
          "answer": 3,
          "explanation": "Payments systems demand integrity, complete audit trails, and reliable recovery, because money movement errors and missing evidence carry serious consequences. These NFRs are core to trust in the system. Office and cosmetic details are not requirements.",
          "why_wrong": [
            "Page colour is a cosmetic detail, not a core NFR.",
            "Office furniture is not a system requirement.",
            "Office layout is not a system requirement.",
            ""
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-19",
        "title": "BA Test 19: RACI and Accountability",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-19-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "In RACI, what does the A stand for?",
          "options": [
            "Analyst",
            "Assistant",
            "Accountable: the one person answerable for the outcome",
            "Approver of expenses only"
          ],
          "answer": 2,
          "explanation": "Accountable means the single person answerable for the outcome, who owns the decision and the result. There should be exactly one A per activity. Assistants, expense approvers, and analysts are different roles.",
          "why_wrong": [
            "Analyst is a job title, not a RACI letter.",
            "Assistant is not part of the RACI mnemonic.",
            "",
            "Accountability covers the whole outcome, not just expenses."
          ]
        },
        {
          "id": "ba-19-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is the difference between Responsible and Accountable?",
          "options": [
            "Responsible is senior to Accountable",
            "Accountable does the work",
            "There is no difference",
            "Responsible does the work; Accountable owns the outcome and answers for it"
          ],
          "answer": 3,
          "explanation": "Responsible people perform the task, while the single Accountable person owns the result and is answerable if it fails. One activity can have many Responsible people but only one Accountable person. The split prevents diffusion of ownership.",
          "why_wrong": [
            "Accountable is the ownership role; Responsible performs the work.",
            "Doing the work is the Responsible role.",
            "The distinction is the core of RACI.",
            ""
          ]
        },
        {
          "id": "ba-19-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A RACI chart shows three people Accountable for one activity. What is the problem?",
          "options": [
            "Accountability is diffused, so nobody truly owns the outcome",
            "The chart is too colourful",
            "Three is the required number",
            "No problem, more accountability is better"
          ],
          "answer": 0,
          "explanation": "Multiple Accountable people means each assumes another owns the outcome, so decisions stall and failures have no clear owner. The RACI rule is exactly one A per activity. Diffused accountability is no accountability.",
          "why_wrong": [
            "",
            "Colour is irrelevant to RACI correctness.",
            "The rule is exactly one A, not three.",
            "More Accountable people weakens ownership, not strengthens it."
          ]
        },
        {
          "id": "ba-19-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "In RACI, who is Consulted?",
          "options": [
            "People informed after the fact",
            "People whose input is sought before a decision or action",
            "People who do the work",
            "People who approve the budget"
          ],
          "answer": 1,
          "explanation": "Consulted people give input before the work or decision, in a two-way exchange. Informed people are told afterwards, in a one-way communication. The distinction controls who must be heard versus who must be told.",
          "why_wrong": [
            "People told after the fact are Informed, not Consulted.",
            "",
            "People doing the work are Responsible.",
            "Budget approval is not the Consulted role."
          ]
        },
        {
          "id": "ba-19-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "An activity has no Responsible person assigned. What will happen?",
          "options": [
            "The activity is unnecessary",
            "The work will do itself",
            "The work will not get done, or will be done inconsistently",
            "The Accountable person automatically does it"
          ],
          "answer": 2,
          "explanation": "No Responsible person means nobody is tasked with doing the work, so it stalls or happens ad hoc. RACI gaps are exactly what the chart is meant to expose. Every activity needs at least one R.",
          "why_wrong": [
            "Missing assignment does not prove the activity is unnecessary.",
            "Work does not do itself without an owner.",
            "",
            "The Accountable person owns the outcome; they may not do the work."
          ]
        },
        {
          "id": "ba-19-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "When should a RACI chart be created?",
          "options": [
            "Only during an audit",
            "Never",
            "After the project ends",
            "Early, when roles and activities are being defined, and updated as they change"
          ],
          "answer": 3,
          "explanation": "RACI works best when agreed early, while roles are being set up, so everyone knows their part before work starts. Late RACI cannot prevent the confusion it exists to avoid. It should be revisited as roles change.",
          "why_wrong": [
            "Audit-time RACI is too late to help the team.",
            "RACI prevents ownership gaps; skipping it invites them.",
            "Post-project RACI cannot prevent confusion during delivery.",
            ""
          ]
        },
        {
          "id": "ba-19-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A stakeholder is marked Informed for UAT sign-off but expects to approve it. What is the issue?",
          "options": [
            "A mismatch between the chart and the stakeholder's expectation of authority",
            "The chart has too many letters",
            "UAT needs no sign-off",
            "No issue"
          ],
          "answer": 0,
          "explanation": "The stakeholder expects decision authority while the chart gives them notification only, which is a governance mismatch that will surface as conflict at sign-off. RACI must reflect real authority, agreed with those named. Expectation gaps must be resolved early.",
          "why_wrong": [
            "",
            "The number of letters is not the issue.",
            "UAT sign-off is a real decision needing clear ownership.",
            "The mismatch will cause conflict at sign-off."
          ]
        },
        {
          "id": "ba-19-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What does RACI help prevent?",
          "options": [
            "All project risks",
            "Confusion about who does what, who decides, and who must be told",
            "Technical defects",
            "Budget overruns only"
          ],
          "answer": 1,
          "explanation": "RACI clarifies ownership of work, decisions, input, and communication, preventing the gaps and overlaps that cause delay and conflict. It does not prevent technical defects or all risks. Its value is role clarity.",
          "why_wrong": [
            "RACI addresses role clarity, not all risks.",
            "",
            "Technical defects need engineering practices, not RACI.",
            "RACI helps more than budget; it clarifies all ownership."
          ]
        },
        {
          "id": "ba-19-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA is assigned Responsible for writing requirements and Accountable for approving them. Why is this questionable?",
          "options": [
            "BAs should never write requirements",
            "Approval is not needed",
            "It is ideal",
            "The same person writing and approving removes independent challenge"
          ],
          "answer": 3,
          "explanation": "Separating authorship from approval provides independent challenge, which catches errors and bias. One person approving their own work removes that check. Governance usually requires approval by the business owner, not the author.",
          "why_wrong": [
            "Writing requirements is core BA work.",
            "Approval is a needed governance step.",
            "Self-approval removes the independent check.",
            ""
          ]
        },
        {
          "id": "ba-19-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "How detailed should RACI activities be?",
          "options": [
            "At the level of key activities and decisions, not every tiny task",
            "One row per email sent",
            "One row per minute of work",
            "One row for the whole project"
          ],
          "answer": 0,
          "explanation": "RACI works at the level of meaningful activities and decisions, where ownership genuinely matters. Whole-project rows are too coarse, and per-email rows are unusable noise. The right grain makes the chart a working tool.",
          "why_wrong": [
            "",
            "Per-email rows make the chart unusable.",
            "Per-minute rows are absurdly fine-grained.",
            "One row for a whole project hides all ownership detail."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-20",
        "title": "BA Test 20: Swimlane and Flow Diagrams",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-20-01",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What does each lane in a swimlane diagram represent?",
          "options": [
            "A project phase",
            "A document type",
            "A time period",
            "A role, team, or system responsible for the steps in that lane"
          ],
          "answer": 3,
          "explanation": "Lanes group steps by who performs them: a role, team, department, or system. This makes handoffs visible wherever the flow crosses a lane boundary. Lanes are about ownership, not time or document type.",
          "why_wrong": [
            "Phases are a different grouping; lanes are ownership.",
            "Document types are not lane definitions.",
            "Time periods are not what lanes represent.",
            ""
          ]
        },
        {
          "id": "ba-20-02",
          "domain": "professional",
          "chapter": "ch28",
          "question": "Why are swimlane diagrams useful for process analysis?",
          "options": [
            "They expose handoffs, ownership gaps, and cross-team delays",
            "They replace all documentation",
            "They show the organisation chart",
            "They look impressive"
          ],
          "answer": 0,
          "explanation": "By showing who does each step, swimlane diagrams make handoffs and ownership visible, which is where delays and gaps hide. Their value is analytical, not decorative. They complement, not replace, other documentation.",
          "why_wrong": [
            "",
            "Diagrams complement documentation; they do not replace it.",
            "An organisation chart shows reporting lines, not process flow.",
            "Appearance is not the analytical value."
          ]
        },
        {
          "id": "ba-20-03",
          "domain": "professional",
          "chapter": "ch28",
          "question": "In a flowchart, what does a rectangle represent?",
          "options": [
            "A decision",
            "A process step or activity",
            "The start",
            "A data store"
          ],
          "answer": 1,
          "explanation": "The rectangle is the standard symbol for a process step or activity. Diamonds are decisions, rounded shapes are start and end, and data stores have their own symbols. Consistent symbols keep diagrams readable.",
          "why_wrong": [
            "Decisions use diamonds, not rectangles.",
            "",
            "Start uses a rounded shape, not a rectangle.",
            "Data stores use a distinct symbol, not a rectangle."
          ]
        },
        {
          "id": "ba-20-04",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A flow crosses lane boundaries six times for a simple request. What should the BA suspect?",
          "options": [
            "Six crossings is always ideal",
            "Excellent design",
            "Excessive handoffs causing delay and error risk",
            "The diagram is wrong by definition"
          ],
          "answer": 2,
          "explanation": "Frequent lane crossings mean many handoffs, each adding wait time, communication cost, and error risk. For a simple request, six crossings suggest the process can be simplified. Handoff count is a key improvement signal.",
          "why_wrong": [
            "There is no ideal fixed number of crossings.",
            "Many handoffs for a simple request is a smell, not excellence.",
            "",
            "The diagram may be accurate; the process itself is the problem."
          ]
        },
        {
          "id": "ba-20-05",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What should a BA do when a diagram step has no clear owner?",
          "options": [
            "Delete the step",
            "Assign it to everyone",
            "Leave it unowned",
            "Assign an owner with stakeholders, since unowned steps get missed"
          ],
          "answer": 3,
          "explanation": "Unowned steps are routinely skipped, because everyone assumes someone else handles them. The BA must get an owner agreed with stakeholders. Assigning to everyone is the same as assigning to nobody.",
          "why_wrong": [
            "Deleting a needed step removes real work.",
            "Assigning to everyone diffuses ownership to nobody.",
            "Unowned steps get missed in practice.",
            ""
          ]
        },
        {
          "id": "ba-20-06",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A diagram shows a decision with only one outgoing path. What is wrong?",
          "options": [
            "A decision must show all outcomes, including the alternative path",
            "Decisions should not appear in diagrams",
            "One path is more efficient",
            "Nothing, decisions can have one path"
          ],
          "answer": 0,
          "explanation": "A decision implies a choice, so every outcome needs a path, including the no, reject, or exception branch. A single path hides what happens in the other case. Complete branching is essential for correct implementation.",
          "why_wrong": [
            "",
            "Decisions belong in diagrams; they must be complete.",
            "Efficiency does not justify hiding an outcome.",
            "A one-path decision hides the alternative outcome."
          ]
        },
        {
          "id": "ba-20-07",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What is the best level of detail for a swimlane diagram used in a stakeholder workshop?",
          "options": [
            "Every keystroke",
            "Key steps and decisions at a level stakeholders can validate",
            "Only the start and end",
            "No steps at all"
          ],
          "answer": 1,
          "explanation": "Workshop diagrams need enough detail for stakeholders to recognise and correct the process, without drowning them in keystroke-level minutiae. The right level supports validation and discussion. Too little detail cannot be validated.",
          "why_wrong": [
            "Keystroke detail overwhelms a workshop.",
            "",
            "Start and end alone cannot be validated as a process.",
            "A diagram with no steps shows nothing."
          ]
        },
        {
          "id": "ba-20-08",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A process diagram and the written procedure disagree. What should the BA do?",
          "options": [
            "Ignore the difference",
            "Trust the diagram always",
            "Investigate with the process owners and align both to the agreed truth",
            "Trust the procedure always"
          ],
          "answer": 2,
          "explanation": "Disagreement between artefacts means at least one is wrong, and the BA must establish the agreed truth with process owners and fix both. Blindly trusting either artefact perpetuates the error. Alignment is the BA's responsibility.",
          "why_wrong": [
            "Ignoring the difference leaves the team working from conflicting sources.",
            "Diagrams can be wrong too; neither artefact wins by default.",
            "",
            "Procedures can be outdated; neither artefact wins by default."
          ]
        },
        {
          "id": "ba-20-09",
          "domain": "professional",
          "chapter": "ch28",
          "question": "What does an arrow in a flow diagram show?",
          "options": [
            "Decoration",
            "The direction of flow from one step to the next",
            "Ownership",
            "Time elapsed"
          ],
          "answer": 1,
          "explanation": "Arrows show sequence and direction: which step follows which. They are the flow's backbone, not decoration. Ownership is shown by lanes, and time is shown by annotations, not arrows.",
          "why_wrong": [
            "Arrows carry meaning; they are not decoration.",
            "",
            "Ownership is shown by lanes, not arrows.",
            "Arrows show sequence, not elapsed time."
          ]
        },
        {
          "id": "ba-20-10",
          "domain": "professional",
          "chapter": "ch28",
          "question": "A BA adds timings to each step of a swimlane diagram. What analysis does this enable?",
          "options": [
            "Budget approval",
            "Colour analysis",
            "Finding where time is spent: value-added work versus waiting",
            "Staff performance reviews"
          ],
          "answer": 2,
          "explanation": "Step timings separate processing time from waiting time, revealing where the process actually spends its elapsed time. Waiting usually dominates, which points improvement at queues and handoffs. Timing turns a picture into evidence.",
          "why_wrong": [
            "Budget approval is not the purpose of step timings.",
            "Colour analysis is not a process technique.",
            "",
            "Timings analyse the process, not individual performance."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-21",
        "title": "BA Test 21: Gap Analysis",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-21-01",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What is gap analysis?",
          "options": [
            "Comparing the current state with the desired future state to identify what must change",
            "Counting project defects",
            "Measuring team happiness",
            "Listing stakeholder names"
          ],
          "answer": 0,
          "explanation": "Gap analysis compares where the organisation is today with where it needs to be, and the difference defines the change required. It is the bridge between current-state understanding and future-state design. Defects, happiness, and names are different analyses.",
          "why_wrong": [
            "",
            "Defect counting is quality analysis, not gap analysis.",
            "Happiness measurement is a different exercise.",
            "Listing names is stakeholder identification, not gap analysis."
          ]
        },
        {
          "id": "ba-21-02",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A gap analysis finds the current system already meets a future need. What should happen?",
          "options": [
            "Rebuild it anyway",
            "Record it as no gap and focus effort elsewhere",
            "Ignore the finding",
            "Add extra features to it"
          ],
          "answer": 1,
          "explanation": "A no-gap finding is valuable: it prevents wasted rebuild effort and focuses resources on real gaps. Recording it explicitly keeps the analysis honest and auditable. Rebuilding working capability wastes money.",
          "why_wrong": [
            "Rebuilding working capability wastes effort and introduces risk.",
            "",
            "Ignoring a no-gap finding invites redundant work later.",
            "Adding features to a satisfied need is gold plating."
          ]
        },
        {
          "id": "ba-21-03",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Which dimensions should a gap analysis typically cover?",
          "options": [
            "Only the office location",
            "Only technology",
            "People, process, technology, and data",
            "Only the budget"
          ],
          "answer": 2,
          "explanation": "Gaps appear across people, skills, processes, technology, and data, and a technology-only view misses the human and process changes that determine success. A complete gap analysis covers all dimensions of the change. Narrow analysis produces narrow solutions.",
          "why_wrong": [
            "Location is not a gap analysis dimension.",
            "Technology-only analysis misses people, process, and data gaps.",
            "",
            "Budget alone does not describe capability gaps."
          ]
        },
        {
          "id": "ba-21-04",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A future-state design requires skills the team does not have. What gap is this?",
          "options": [
            "A budget gap only",
            "No gap at all",
            "A technology gap",
            "A capability or skills gap"
          ],
          "answer": 3,
          "explanation": "Missing skills are a capability gap, which must be closed by hiring, training, or partnering. Calling it a technology or budget gap misdiagnoses the fix. Naming the gap correctly determines the right closing action.",
          "why_wrong": [
            "Budget may fund the fix, but the gap itself is skills.",
            "Missing required skills is a real gap.",
            "Skills are a people capability issue, not a technology gap.",
            ""
          ]
        },
        {
          "id": "ba-21-05",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What should each identified gap lead to?",
          "options": [
            "A defined action to close it, with an owner",
            "A longer document",
            "Nothing, gaps close themselves",
            "A complaint"
          ],
          "answer": 0,
          "explanation": "Every gap needs a closing action with an owner, or the analysis is just a list of problems. Actions turn analysis into change. Gaps without owners persist.",
          "why_wrong": [
            "",
            "Document length does not close gaps.",
            "Gaps persist unless someone acts to close them.",
            "Complaints do not close gaps."
          ]
        },
        {
          "id": "ba-21-06",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA performs gap analysis before understanding the current state properly. What is the risk?",
          "options": [
            "No risk",
            "Gaps are guessed, so actions target the wrong problems",
            "The analysis finishes too quickly",
            "Stakeholders will be too pleased"
          ],
          "answer": 1,
          "explanation": "Gap analysis is only as good as its current-state evidence; without it, gaps are assumptions and closing actions may target non-problems while real gaps are missed. Evidence first, analysis second. Guessed gaps waste investment.",
          "why_wrong": [
            "Guessed gaps lead to wrong actions; the risk is real.",
            "",
            "Finishing quickly on bad evidence is not a benefit.",
            "Stakeholder pleasure is not the risk."
          ]
        },
        {
          "id": "ba-21-07",
          "domain": "professional",
          "chapter": "ch84",
          "question": "How should gaps be prioritised?",
          "options": [
            "Randomly",
            "Alphabetically",
            "By business impact and urgency of closing them",
            "By which is easiest to describe"
          ],
          "answer": 2,
          "explanation": "Gaps that block strategic goals or carry high risk must close first, so prioritisation follows impact and urgency. Alphabetical and random orders ignore value. Impact-based ordering focuses scarce change capacity.",
          "why_wrong": [
            "Random order ignores value and risk.",
            "Alphabetical order ignores business impact.",
            "",
            "Ease of description is not a priority criterion."
          ]
        },
        {
          "id": "ba-21-08",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A gap analysis is presented as a single red, amber, green heatmap. What is its main value?",
          "options": [
            "It replaces the detailed analysis",
            "It looks good in a frame",
            "It hides detail",
            "It communicates the scale and severity of gaps at a glance to decision makers"
          ],
          "answer": 3,
          "explanation": "A heatmap summarises severity visually so leaders grasp where the biggest gaps sit and can direct attention and funding. It summarises the detailed analysis; it does not replace it. Visual summary aids decision-making.",
          "why_wrong": [
            "The summary complements detailed analysis; it does not replace it.",
            "Appearance is not the value; communication is.",
            "A good heatmap summarises; it should not hide needed detail.",
            ""
          ]
        },
        {
          "id": "ba-21-09",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What is the difference between a gap and a risk?",
          "options": [
            "A gap is a known shortfall against a desired state; a risk is an uncertain future event",
            "A gap is always worse",
            "A risk is always worse",
            "There is no difference"
          ],
          "answer": 0,
          "explanation": "Gaps are present-tense shortfalls that definitely exist; risks are uncertain events that might happen. The distinction drives different responses: closing actions versus mitigation plans. Conflating them muddles both.",
          "why_wrong": [
            "",
            "Severity depends on the specific case: a small gap can matter less than a large risk, so always worse cannot hold.",
            "The same logic fails in reverse: a minor risk can matter less than a major gap, so neither category is always worse.",
            "The distinction drives different management responses."
          ]
        },
        {
          "id": "ba-21-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "After gap-closing actions are taken, what should the BA do?",
          "options": [
            "Assume the gaps are closed",
            "Re-assess to verify each gap is actually closed",
            "Delete the gap analysis",
            "Start a new gap analysis from scratch immediately"
          ],
          "answer": 1,
          "explanation": "Closure must be verified by re-assessment against the same criteria, because actions do not always achieve their intent. Assuming closure leaves gaps open invisibly. Verification completes the gap analysis cycle.",
          "why_wrong": [
            "Assumption is not evidence of closure.",
            "",
            "Deleting the analysis destroys the audit trail.",
            "A fresh analysis is wasteful before verifying the current actions."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-22",
        "title": "BA Test 22: Root Cause Analysis",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-22-01",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What is the goal of root cause analysis?",
          "options": [
            "To find someone to blame",
            "To find the underlying cause of a problem so it does not recur",
            "To describe symptoms in detail",
            "To close the incident quickly"
          ],
          "answer": 1,
          "explanation": "Root cause analysis looks past symptoms to the underlying cause, so fixes prevent recurrence rather than just treating the visible problem. Blame and speed are not the goal. Lasting fixes require true causes.",
          "why_wrong": [
            "Blame prevents honest analysis and learning.",
            "",
            "Describing symptoms is the starting point, not the goal.",
            "Quick closure without a true fix guarantees recurrence."
          ]
        },
        {
          "id": "ba-22-02",
          "domain": "professional",
          "chapter": "ch84",
          "question": "In the Five Whys technique, what does each why do?",
          "options": [
            "Delay the fix",
            "Blame a different person",
            "Drill one layer deeper into the cause chain",
            "Add a new symptom"
          ],
          "answer": 2,
          "explanation": "Each why asks why the previous answer happened, peeling back layers of cause until the root is reached. Five is a guide, not a magic number. The technique turns a symptom into a causal chain.",
          "why_wrong": [
            "Structured drilling speeds a lasting fix; it does not delay it.",
            "Five Whys seeks causes, not people to blame.",
            "",
            "Whys drill into causes, not symptoms."
          ]
        },
        {
          "id": "ba-22-03",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A fishbone diagram is used to do what?",
          "options": [
            "Draw organisational charts",
            "Track project timelines",
            "Plan a menu",
            "Group potential causes of a problem into categories for structured brainstorming"
          ],
          "answer": 3,
          "explanation": "The fishbone or Ishikawa diagram organises possible causes under categories such as people, process, technology, and environment, so the team explores causes systematically rather than fixating on one theory. Structured brainstorming beats single-cause guessing.",
          "why_wrong": [
            "Organisation charts show reporting lines, not causes.",
            "Timelines are shown in schedules, not fishbone diagrams.",
            "Fishbone diagrams analyse causes, not menus.",
            ""
          ]
        },
        {
          "id": "ba-22-04",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A team fixes a symptom and the problem returns a week later. What does this show?",
          "options": [
            "The root cause was not addressed",
            "Problems always return",
            "The team worked too fast",
            "The fix was perfect"
          ],
          "answer": 0,
          "explanation": "Recurrence after a fix is the classic sign that only the symptom was treated while the underlying cause remained. Lasting fixes target roots. Recurrence is evidence, not bad luck.",
          "why_wrong": [
            "",
            "Problems return when causes remain, not by fate.",
            "Speed is not the issue; targeting the wrong layer is.",
            "A perfect fix would prevent recurrence."
          ]
        },
        {
          "id": "ba-22-05",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What is the first step in a structured root cause analysis?",
          "options": [
            "Jump to a solution",
            "Define the problem clearly with evidence of what happened",
            "Assign blame",
            "Write the final report"
          ],
          "answer": 1,
          "explanation": "A clear, evidence-based problem definition anchors the whole analysis; without it, the team analyses different problems. What happened, when, and with what impact must be agreed first. Definition precedes diagnosis.",
          "why_wrong": [
            "Jumping to solutions skips understanding the problem.",
            "",
            "Blame has no place in root cause analysis.",
            "The report comes last, after analysis."
          ]
        },
        {
          "id": "ba-22-06",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A root cause analysis concludes the cause was human error. What should the team ask next?",
          "options": [
            "How to hide the error",
            "Who made the error, so they can be punished",
            "Why the process allowed the error to happen and go undetected",
            "Nothing, human error is the final answer"
          ],
          "answer": 2,
          "explanation": "Human error is rarely a root cause; the deeper question is why the process, training, tools, or checks allowed the error and failed to catch it. Stopping at human error guarantees repetition by the next person. Systemic causes need systemic fixes.",
          "why_wrong": [
            "Hiding errors prevents learning and guarantees recurrence.",
            "Punishment does not fix the system that allowed the error.",
            "",
            "Human error is a starting point for deeper questioning, not a conclusion."
          ]
        },
        {
          "id": "ba-22-07",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Why should root cause analysis be evidence-based rather than opinion-based?",
          "options": [
            "Evidence takes longer",
            "Opinions are faster and better",
            "Opinions are always wrong",
            "Evidence distinguishes real causes from plausible stories"
          ],
          "answer": 3,
          "explanation": "Plausible stories feel convincing but are often wrong; data, logs, and timelines test each theory against facts. Evidence-based analysis produces fixes that work. Opinion-based analysis produces confident mistakes.",
          "why_wrong": [
            "Evidence takes effort, but it prevents wrong fixes.",
            "Speed without accuracy produces wrong fixes.",
            "Opinions can be right, but they must be tested against evidence.",
            ""
          ]
        },
        {
          "id": "ba-22-08",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A problem has three contributing causes. What should the corrective action address?",
          "options": [
            "All contributing causes that are within control, prioritised by impact",
            "None of them",
            "Only the cause that is cheapest",
            "Only the easiest cause"
          ],
          "answer": 0,
          "explanation": "Real problems usually have multiple contributing causes, and fixing only the easiest leaves the others to cause recurrence. Actions should cover the controllable causes, prioritised by impact. Partial fixes give partial results.",
          "why_wrong": [
            "",
            "Fixing none guarantees recurrence.",
            "Cheapest is not the same as most impactful.",
            "Fixing only the easiest cause leaves the others active."
          ]
        },
        {
          "id": "ba-22-09",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What should happen after a corrective action is implemented?",
          "options": [
            "Delete the evidence",
            "Assume it worked",
            "Monitor to verify the problem does not recur",
            "Close the analysis immediately"
          ],
          "answer": 2,
          "explanation": "Corrective actions must be verified by monitoring over time, because an action that looks right may not work in practice. Verification closes the loop. Assuming success without evidence repeats the original mistake.",
          "why_wrong": [
            "Evidence must be kept for audit and learning.",
            "Assumption is not verification.",
            "",
            "Immediate closure skips the verification step."
          ]
        },
        {
          "id": "ba-22-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA uses root cause analysis on a recurring data quality issue. Which evidence is most useful?",
          "options": [
            "The colour of the dashboard",
            "The number of meetings held",
            "Opinions about the data team",
            "Examples of bad records, their source, and the process that created them"
          ],
          "answer": 3,
          "explanation": "Bad record examples traced to their source and creation process show exactly where quality breaks down. Opinions and meeting counts cannot diagnose a data defect. Concrete examples ground the analysis in fact.",
          "why_wrong": [
            "Dashboard colour is irrelevant to data quality.",
            "Meeting counts say nothing about data quality causes.",
            "Opinions about people do not diagnose data defects.",
            ""
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-23",
        "title": "BA Test 23: BA Tools and Jira Hygiene",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-23-01",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A Jira ticket has no description, no acceptance criteria, and no assignee. What is the problem?",
          "options": [
            "Jira tickets never need descriptions",
            "No problem, tickets are self-explanatory",
            "Nobody can tell what is needed, when it is done, or who is doing it",
            "The ticket is too colourful"
          ],
          "answer": 2,
          "explanation": "A ticket without description, criteria, and owner is unactionable: the team cannot start it, test it, or know who owns it. Ticket hygiene is basic delivery discipline. Empty tickets waste everyone's time.",
          "why_wrong": [
            "Descriptions are essential for shared understanding.",
            "Tickets are not self-explanatory without content.",
            "",
            "Colour is irrelevant to ticket quality."
          ]
        },
        {
          "id": "ba-23-02",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What is the best practice for Jira ticket status updates?",
          "options": [
            "Update all tickets at month end",
            "Never move tickets",
            "Leave tickets in To Do forever",
            "Move tickets promptly as work progresses so the board reflects reality"
          ],
          "answer": 3,
          "explanation": "A board that reflects reality lets the team, product owner, and stakeholders see true progress and spot blockages. Stale statuses make the board a fiction. Prompt updates are a team habit, not admin overhead.",
          "why_wrong": [
            "Month-end updates leave the board wrong for weeks.",
            "Never moving tickets hides all progress.",
            "Stale statuses make the board useless.",
            ""
          ]
        },
        {
          "id": "ba-23-03",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A ticket has been In Progress for three weeks with no comments. What should the BA do?",
          "options": [
            "Ask the assignee for a status update and record blockers or progress",
            "Close it silently",
            "Reassign it randomly",
            "Ignore it"
          ],
          "answer": 0,
          "explanation": "A stale In Progress ticket usually hides a blocker, a forgotten task, or work happening elsewhere. Asking surfaces the truth and gets the record current. Ignoring or silently closing it hides the problem.",
          "why_wrong": [
            "",
            "Silent closure loses the work and its history.",
            "Random reassignment does not resolve the underlying issue.",
            "Ignoring a stale ticket lets blockers persist unseen."
          ]
        },
        {
          "id": "ba-23-04",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Why should related Jira tickets be linked?",
          "options": [
            "To make the ticket count higher",
            "To show dependencies and relationships so impact and sequencing are visible",
            "Linking is decorative",
            "To confuse new joiners"
          ],
          "answer": 1,
          "explanation": "Links make dependencies, duplicates, and parent-child relationships visible, so the team can sequence work and assess impact. Unlinked tickets hide the web of relationships. Linking is traceability in miniature.",
          "why_wrong": [
            "Ticket counts are not improved by linking.",
            "",
            "Linking carries real information about relationships.",
            "Linking clarifies relationships; it does not confuse."
          ]
        },
        {
          "id": "ba-23-05",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA stores requirements only in chat messages. What is the risk?",
          "options": [
            "Chat messages are legally binding",
            "No risk, chat is permanent",
            "Requirements get buried, lost, and cannot be versioned or traced",
            "Chat is the best requirements tool"
          ],
          "answer": 2,
          "explanation": "Chat is ephemeral and unsearchable as a system of record: decisions scroll away, versions are unclear, and traceability is impossible. Requirements belong in a managed tool with versioning. Chat is for discussion, not record.",
          "why_wrong": [
            "Chat messages are a poor basis for a binding record.",
            "Chat history is hard to search and easy to lose.",
            "",
            "Chat lacks versioning, structure, and traceability."
          ]
        },
        {
          "id": "ba-23-06",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What makes a good Jira ticket title?",
          "options": [
            "A title in code only",
            "No title at all",
            "A vague title like 'Fix stuff'",
            "A clear, specific summary of the outcome, such as 'Allow users to export monthly statements as PDF'"
          ],
          "answer": 3,
          "explanation": "A specific outcome-focused title lets anyone scanning the board understand the work without opening the ticket. Vague titles force everyone to dig for meaning. Titles are the board's headline; they must carry meaning.",
          "why_wrong": [
            "Code-only titles exclude non-technical readers.",
            "A ticket without a title cannot be understood at all.",
            "Vague titles force everyone to open the ticket to understand it.",
            ""
          ]
        },
        {
          "id": "ba-23-07",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A team uses labels inconsistently in Jira. What is the consequence?",
          "options": [
            "Filtering and reporting by label becomes unreliable",
            "Jira runs faster",
            "Tickets auto-close",
            "No consequence"
          ],
          "answer": 0,
          "explanation": "Labels only work as a reporting and filtering device when applied consistently; inconsistent labelling makes label-based views misleading. Agreed label conventions are part of tool hygiene. Inconsistent data produces unreliable reports.",
          "why_wrong": [
            "",
            "Labels do not affect Jira's speed.",
            "Labels do not auto-close tickets.",
            "Inconsistent labels undermine filtering and reporting."
          ]
        },
        {
          "id": "ba-23-08",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What should a BA do before closing a ticket as Done?",
          "options": [
            "Close it as soon as code is written",
            "Verify acceptance criteria are met and evidence is attached or linked",
            "Close it without checking",
            "Ask the reporter to close it blindly"
          ],
          "answer": 1,
          "explanation": "Done means acceptance criteria are met, with evidence the team can see. Closing on code alone or without checking inflates progress and hides unfinished work. Verification protects the meaning of Done.",
          "why_wrong": [
            "Code written is not the same as criteria met.",
            "",
            "Closing without checking hides unfinished work.",
            "Blind closure by the reporter is not verification."
          ]
        },
        {
          "id": "ba-23-09",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Why should comments on a ticket record decisions, not just status?",
          "options": [
            "Comments should be empty",
            "Decisions belong only in meetings",
            "Status is enough",
            "Decisions explain why, so future readers understand the reasoning without re-asking"
          ],
          "answer": 3,
          "explanation": "A ticket's comment history is its memory: recording decisions and reasoning lets future readers, auditors, and new joiners understand why things are as they are. Status-only comments leave the reasoning invisible. The why matters as much as the what.",
          "why_wrong": [
            "Empty comments waste the ticket's role as a record.",
            "Decisions made in meetings must be recorded where the work lives.",
            "Status alone leaves reasoning invisible.",
            ""
          ]
        },
        {
          "id": "ba-23-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A board has 200 tickets in the backlog with no ordering. What should happen?",
          "options": [
            "Order the backlog by value and priority with the product owner, and remove dead items",
            "Build them in creation order",
            "Delete all 200",
            "Leave them unordered"
          ],
          "answer": 0,
          "explanation": "An unordered backlog cannot guide planning, so the product owner and BA must order it by value, refine the top, and prune dead items. Creation order is arbitrary, and mass deletion loses real work. Ordering turns a pile into a plan.",
          "why_wrong": [
            "",
            "Creation order has no relationship to value.",
            "Mass deletion would destroy genuine future work.",
            "An unordered backlog cannot guide sprint planning."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-24",
        "title": "BA Test 24: Advanced Requirements - Ambiguity and Conflict",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-24-01",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A requirement says the report must be generated on demand and automatically every morning. A stakeholder calls this contradictory. What should the BA clarify?",
          "options": [
            "That one of them must be deleted",
            "That the requirement is wrong",
            "That reports cannot be automated",
            "That both triggers can coexist: manual on demand plus a scheduled run"
          ],
          "answer": 3,
          "explanation": "Two triggers are not contradictory: the same report can run on demand and on schedule. The BA's job is to surface the apparent conflict, confirm both triggers are genuinely wanted, and specify each clearly. Apparent contradictions often dissolve on inspection.",
          "why_wrong": [
            "Deleting a wanted trigger removes real functionality.",
            "The requirement is not wrong; it needs clearer expression.",
            "Scheduled reporting is a standard capability.",
            ""
          ]
        },
        {
          "id": "ba-24-02",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Two departments define 'customer' differently in their requirements. What is the BA's priority?",
          "options": [
            "Agree a shared definition, or explicitly define both with distinct terms",
            "Let each team use its own meaning",
            "Remove the word customer from all documents",
            "Pick one definition silently"
          ],
          "answer": 0,
          "explanation": "One word with two meanings is a defect factory: designs, data models, and tests will diverge. The BA must get an agreed shared definition or distinct terms for each meaning, recorded in the glossary. Silent divergence guarantees integration defects.",
          "why_wrong": [
            "",
            "Parallel meanings guarantee confusion at integration points.",
            "Removing the word does not resolve the underlying concept clash.",
            "Silent choice leaves one department building to the wrong meaning."
          ]
        },
        {
          "id": "ba-24-03",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A stakeholder insists on a solution: 'Build a chatbot.' What should the BA explore first?",
          "options": [
            "Which chatbot vendor to use",
            "The underlying problem the chatbot is meant to solve",
            "The chatbot's colour scheme",
            "The chatbot's name"
          ],
          "answer": 1,
          "explanation": "Solution-first requests hide the real problem, and a chatbot may not be the best answer to it. The BA explores the underlying need, such as reducing call volume or speeding answers, then evaluates options. Problem-first analysis prevents expensive wrong solutions.",
          "why_wrong": [
            "Vendor choice is premature before the problem is understood.",
            "",
            "Cosmetics are irrelevant before the need is clear.",
            "Naming is irrelevant before the need is clear."
          ]
        },
        {
          "id": "ba-24-04",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A requirement uses the word 'etc.' at the end of a list. Why is this a defect?",
          "options": [
            "It is grammatically wrong",
            "It is good shorthand",
            "It leaves the list open-ended, so scope and testing are undefined",
            "It saves space"
          ],
          "answer": 2,
          "explanation": "Etc. means the list is incomplete, so nobody knows what else is included, and testers cannot verify completeness. Requirements need closed, explicit lists. Shorthand that hides scope is a defect, not efficiency.",
          "why_wrong": [
            "Grammar is not the issue; undefined scope is.",
            "Shorthand that hides scope is a defect, not good practice.",
            "",
            "Saving space at the cost of clarity is a false economy."
          ]
        },
        {
          "id": "ba-24-05",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A senior stakeholder and a front-line user disagree about a workflow. The user does the work daily. How should the BA weigh the inputs?",
          "options": [
            "Always follow the user",
            "Ignore both and decide alone",
            "Always follow the senior stakeholder",
            "Test both views against evidence: observation, data, and the business goal"
          ],
          "answer": 3,
          "explanation": "Neither seniority nor proximity alone decides; evidence does. The BA observes the work, checks the data, and measures both proposals against the business goal. Evidence-based resolution respects both parties and produces the better workflow.",
          "why_wrong": [
            "Proximity is valuable but must still be tested against evidence.",
            "Deciding alone without evidence ignores both inputs.",
            "Seniority does not guarantee the better workflow design.",
            ""
          ]
        },
        {
          "id": "ba-24-06",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A requirement is ambiguous and the BA cannot reach the stakeholder. What is the best action?",
          "options": [
            "Record the assumption explicitly, flag it as a risk, and seek confirmation urgently",
            "Delete the requirement",
            "Wait indefinitely without recording anything",
            "Guess and build"
          ],
          "answer": 0,
          "explanation": "When confirmation is unavailable, an explicit, flagged assumption keeps work moving while making the risk visible and the rework cost understood. Silent guessing hides risk. Assumptions must be visible, owned, and chased.",
          "why_wrong": [
            "",
            "Deleting a needed requirement loses the business need.",
            "Waiting without recording leaves the gap invisible.",
            "Silent guessing hides risk and causes surprise rework."
          ]
        },
        {
          "id": "ba-24-07",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A stakeholder says: 'The system should handle exceptions gracefully.' What must the BA pin down?",
          "options": [
            "The font of error messages",
            "Which exceptions, what graceful means for each, and what the user sees and can do",
            "The server brand",
            "The project budget"
          ],
          "answer": 1,
          "explanation": "Gracefully is meaningless until the BA specifies each exception type, the system response, the user message, and the recovery path. Exception handling is where vague requirements cause the most production pain. Specificity here prevents support chaos.",
          "why_wrong": [
            "Font choice does not define exception handling.",
            "",
            "Server brand is unrelated to exception behaviour.",
            "Budget does not define exception behaviour."
          ]
        },
        {
          "id": "ba-24-08",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Two requirements overlap by 80 percent. What should the BA do?",
          "options": [
            "Duplicate the overlap in both",
            "Keep both as written",
            "Merge or refactor them so each requirement covers distinct ground, with links between them",
            "Delete the shorter one without checking"
          ],
          "answer": 2,
          "explanation": "Overlapping requirements drift apart over time, causing contradictions and double testing. Refactoring them into distinct, linked requirements keeps one source of truth per need. Overlap is a maintainability defect.",
          "why_wrong": [
            "Duplication multiplies the maintenance burden.",
            "Keeping overlapping requirements invites future contradiction.",
            "",
            "Deleting without checking may remove unique content in the shorter one."
          ]
        },
        {
          "id": "ba-24-09",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA finds a requirement that cannot be satisfied together with another requirement. What is this called?",
          "options": [
            "A feature",
            "A requirements conflict, requiring resolution before build",
            "A nice-to-have",
            "A test case"
          ],
          "answer": 1,
          "explanation": "Mutually unsatisfiable requirements are a conflict that must be resolved with stakeholders before build, because building from them guarantees failure of one or the other. Naming it as a conflict triggers the resolution process. Conflicts do not resolve themselves.",
          "why_wrong": [
            "A conflict is a defect, not a feature.",
            "",
            "A conflict is not a nice-to-have; it blocks delivery.",
            "A test case verifies requirements; it is not the conflict itself."
          ]
        },
        {
          "id": "ba-24-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A stakeholder approves requirements they clearly have not read. What should the BA do?",
          "options": [
            "Rewrite the requirements in secret",
            "Accept the approval gratefully",
            "Walk them through the key decisions and risks, and confirm understanding before relying on the approval",
            "Refuse the approval angrily"
          ],
          "answer": 2,
          "explanation": "Rubber-stamp approval is a risk: the stakeholder has not truly committed, and disputes will surface later. A focused walkthrough of key decisions secures genuine understanding and commitment. The BA protects the project by making approval meaningful.",
          "why_wrong": [
            "Secret rewrites destroy trust and traceability.",
            "Grateful acceptance of an unread approval stores up future disputes.",
            "",
            "Anger damages the relationship without improving understanding."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-25",
        "title": "BA Test 25: Advanced Stakeholder and Negotiation Scenarios",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-25-01",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A powerful stakeholder demands a feature that would harm another team's workflow. What is the BA's best approach?",
          "options": [
            "Surface the impact with evidence, and facilitate a decision that weighs both needs",
            "Refuse the stakeholder outright",
            "Build it in secret",
            "Build it without telling the other team"
          ],
          "answer": 0,
          "explanation": "The BA's role is to make the trade-off visible with evidence and facilitate an informed decision, not to take sides silently or refuse outright. Decision makers need the full impact picture. Facilitated trade-offs produce defensible outcomes.",
          "why_wrong": [
            "",
            "Outright refusal without discussion ignores the stakeholder's legitimate need.",
            "Secret building destroys trust and governance.",
            "Hiding impact from the affected team guarantees conflict later."
          ]
        },
        {
          "id": "ba-25-02",
          "domain": "professional",
          "chapter": "ch84",
          "question": "In negotiation, what is the value of understanding the other party's interests rather than just their position?",
          "options": [
            "No value",
            "Interests reveal what they truly need, opening options that positions hide",
            "Positions are always the same as interests",
            "Interests are irrelevant"
          ],
          "answer": 1,
          "explanation": "Positions are stated demands; interests are the underlying needs. Focusing on interests opens creative options that satisfy both sides, while position bargaining produces winners and losers. Interest-based negotiation is the foundation of durable agreement.",
          "why_wrong": [
            "Understanding interests is the key to durable agreement.",
            "",
            "Positions and interests often differ sharply.",
            "Interests are the core of effective negotiation."
          ]
        },
        {
          "id": "ba-25-03",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A negotiation reaches deadlock over a single feature. What technique can break it?",
          "options": [
            "Decide by coin toss",
            "Shout louder",
            "Trade across issues: give ground on one item in exchange for movement on another",
            "Walk out permanently"
          ],
          "answer": 2,
          "explanation": "Trading across issues expands the negotiation beyond a single point, letting each side gain on what it values most. Single-issue deadlock rarely breaks by force. Package deals create movement where single points cannot.",
          "why_wrong": [
            "A coin toss ignores value and produces arbitrary outcomes.",
            "Volume does not resolve deadlock.",
            "",
            "Walking out ends the negotiation without agreement."
          ]
        },
        {
          "id": "ba-25-04",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A stakeholder agrees in a meeting but reverses the decision by email the next day. What should the BA do?",
          "options": [
            "Ignore the email",
            "Complain to the stakeholder's manager first",
            "Accept the reversal silently",
            "Raise the change openly, understand the reason, and re-agree the decision with all affected parties"
          ],
          "answer": 3,
          "explanation": "Reversals happen when new information or pressure emerges; the BA must surface the change, understand the reason, and re-secure agreement transparently. Silent acceptance leaves the team working to a superseded decision. Open re-agreement protects everyone.",
          "why_wrong": [
            "Ignoring the email leaves two conflicting decisions in play.",
            "Escalating before understanding the reason damages trust.",
            "Silent acceptance leaves the team on a superseded decision.",
            ""
          ]
        },
        {
          "id": "ba-25-05",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What is a BATNA in negotiation?",
          "options": [
            "The best alternative if no agreement is reached",
            "A meeting agenda",
            "A stakeholder map",
            "A type of contract"
          ],
          "answer": 0,
          "explanation": "BATNA, the Best Alternative To a Negotiated Agreement, is the fallback if talks fail. Knowing it gives the negotiator confidence and a walk-away point. Negotiating without a BATNA means accepting any terms.",
          "why_wrong": [
            "",
            "An agenda structures a meeting; it is not a BATNA.",
            "A stakeholder map shows relationships; it is not a BATNA.",
            "A BATNA is a fallback option, not a contract."
          ]
        },
        {
          "id": "ba-25-06",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA must deliver bad news: a promised feature cannot be delivered on time. What is the best approach?",
          "options": [
            "Hide it until the deadline passes",
            "Tell stakeholders early, with the reason, the impact, and options",
            "Blame another team",
            "Announce it with no options"
          ],
          "answer": 1,
          "explanation": "Early, honest bad news with reasons, impact, and options preserves trust and leaves room to respond. Late surprises destroy credibility. Options turn bad news into a decision, not just a disappointment.",
          "why_wrong": [
            "Hiding bad news until the deadline destroys trust.",
            "",
            "Blame avoids ownership and solves nothing.",
            "News without options leaves stakeholders helpless."
          ]
        },
        {
          "id": "ba-25-07",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A stakeholder group feels unheard and disengages from the project. What is the best recovery step?",
          "options": [
            "Replace them with another group",
            "Proceed without them",
            "Meet them, listen to their concerns, and show concretely how their input shapes the work",
            "Send more emails"
          ],
          "answer": 2,
          "explanation": "Disengagement from feeling unheard is repaired by genuine listening and visible evidence that input matters. More emails and replacement deepen the alienation. Demonstrated influence rebuilds engagement.",
          "why_wrong": [
            "Replacing stakeholders ignores their legitimate stake.",
            "Proceeding without an affected group stores up resistance.",
            "",
            "More emails do not repair feeling unheard."
          ]
        },
        {
          "id": "ba-25-08",
          "domain": "professional",
          "chapter": "ch84",
          "question": "When presenting a recommendation to senior stakeholders, what matters most?",
          "options": [
            "Fancy animations",
            "Technical jargon",
            "The number of slides",
            "A clear recommendation, the evidence behind it, and the trade-offs"
          ],
          "answer": 3,
          "explanation": "Senior stakeholders need a clear recommendation grounded in evidence, with trade-offs stated honestly, so they can decide. Slide count, animations, and jargon obscure the decision. Clarity and honesty earn trust.",
          "why_wrong": [
            "Animations distract from the recommendation.",
            "Jargon obscures meaning for business decision makers.",
            "Slide count does not improve decisions.",
            ""
          ]
        },
        {
          "id": "ba-25-09",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A stakeholder asks the BA to misrepresent progress to a steering committee. What should the BA do?",
          "options": [
            "Decline, and present an honest picture with a recovery plan",
            "Exaggerate progress even further",
            "Skip the steering committee",
            "Agree, to keep the stakeholder happy"
          ],
          "answer": 0,
          "explanation": "Misrepresenting progress is dishonest and destroys trust when reality surfaces, as it always does. The BA must present the honest position with a credible recovery plan. Integrity is non-negotiable for a BA.",
          "why_wrong": [
            "",
            "Further exaggeration deepens the deception.",
            "Skipping governance hides the problem, not solves it.",
            "Agreeing to mislead a governance body is dishonest."
          ]
        },
        {
          "id": "ba-25-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Two sponsors give the BA contradictory instructions. What should the BA do?",
          "options": [
            "Follow the one who spoke last",
            "Surface the contradiction to both and get a single agreed direction",
            "Follow the louder one",
            "Do nothing and hope it resolves"
          ],
          "answer": 1,
          "explanation": "Contradictory sponsor instructions must be surfaced to both sponsors for a single agreed direction; the BA cannot resolve a governance conflict alone. Following the last or loudest voice invites reversal. Escalation with evidence is the professional route.",
          "why_wrong": [
            "Recency is not authority.",
            "",
            "Volume is not authority.",
            "Hoping resolves nothing; the contradiction will surface in delivery."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-26",
        "title": "BA Test 26: Advanced Agile Delivery Scenarios",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-26-01",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A team delivers every sprint but stakeholders say the product is not improving. What is the likely cause?",
          "options": [
            "The team is too fast",
            "The backlog order does not reflect real user value, so effort goes to low-impact work",
            "Sprints are too short",
            "The team needs more members"
          ],
          "answer": 1,
          "explanation": "Delivery velocity without value impact means prioritisation is wrong: the team builds efficiently but builds the wrong things. The fix is value-based ordering grounded in user evidence. Speed and team size do not fix wrong priorities.",
          "why_wrong": [
            "Speed is not the problem when the wrong work is delivered fast.",
            "",
            "Sprint length does not explain low value impact.",
            "More members building low-value work does not help."
          ]
        },
        {
          "id": "ba-26-02",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A product owner is unavailable for most of the sprint. What is the impact on the BA?",
          "options": [
            "The sprint should be cancelled immediately",
            "No impact",
            "Decisions stall, so the BA must surface the risk, prepare decision packs, and secure agreed decision windows",
            "The BA should make all product decisions alone"
          ],
          "answer": 2,
          "explanation": "An absent product owner blocks decisions, so the BA must make the risk visible, prepare concise decision material, and agree fixed windows for decisions. Making product decisions alone exceeds the BA's authority. Structured access beats hoping for availability.",
          "why_wrong": [
            "Cancellation is premature before trying structured decision windows.",
            "An absent product owner blocks decisions; the impact is real.",
            "",
            "Product decisions belong to the product owner, not the BA."
          ]
        },
        {
          "id": "ba-26-03",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Technical debt is slowing every sprint. What should the BA advocate?",
          "options": [
            "Stop all feature work forever",
            "Hide it from stakeholders",
            "Ignore it and keep adding features",
            "Make the cost visible and agree dedicated capacity to reduce it alongside feature work"
          ],
          "answer": 3,
          "explanation": "Technical debt must be made visible in business terms, such as slower delivery and higher defect rates, with agreed capacity to pay it down. Ignoring it compounds the slowdown. Balanced allocation protects long-term velocity.",
          "why_wrong": [
            "Stopping all features forever is disproportionate.",
            "Hiding debt prevents the resourcing decision it needs.",
            "Ignoring debt makes every future sprint slower.",
            ""
          ]
        },
        {
          "id": "ba-26-04",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A sprint goal becomes irrelevant mid-sprint due to a market change. What should the team do?",
          "options": [
            "Discuss with the product owner whether to adapt the goal or cancel the sprint",
            "Pretend nothing changed",
            "Extend the sprint",
            "Continue regardless"
          ],
          "answer": 0,
          "explanation": "When the sprint goal loses relevance, the product owner and team must decide together whether to adapt or cancel, since only the product owner can cancel a sprint. Continuing regardless wastes the sprint on obsolete work. Adaptation is Agile's strength.",
          "why_wrong": [
            "",
            "Pretending wastes effort on work nobody needs.",
            "Extending the sprint does not fix an obsolete goal.",
            "Continuing on an obsolete goal wastes the sprint."
          ]
        },
        {
          "id": "ba-26-05",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Two teams depend on each other's unfinished work. What coordination practice helps most?",
          "options": [
            "Each team works in isolation",
            "Joint planning, visible dependency tracking, and agreed interface contracts",
            "More status meetings with no agenda",
            "Merging the teams permanently"
          ],
          "answer": 1,
          "explanation": "Cross-team dependencies need joint planning, a visible dependency board, and agreed interfaces so each team can work against a stable contract. Isolation guarantees integration surprises. Structured coordination beats meeting volume.",
          "why_wrong": [
            "Isolation guarantees integration surprises.",
            "",
            "Agenda-free meetings add noise, not coordination.",
            "Merging teams is a major change; coordination practices come first."
          ]
        },
        {
          "id": "ba-26-06",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A release contains a feature nobody asked for. What failed?",
          "options": [
            "The office network",
            "Testing",
            "Backlog governance: unrequested scope entered without product owner approval",
            "The build pipeline"
          ],
          "answer": 2,
          "explanation": "Unrequested scope in a release means backlog control failed: work entered without product owner prioritisation. This is gold plating, and it consumes capacity that should serve real needs. Governance, not testing, is the failed control.",
          "why_wrong": [
            "The network is unrelated to scope control.",
            "Testing verifies what was built; it does not authorise scope.",
            "",
            "The pipeline delivers; it does not decide scope."
          ]
        },
        {
          "id": "ba-26-07",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Stakeholders complain that demos show unfinished work. What should the BA clarify?",
          "options": [
            "That demos must show only polished products",
            "That stakeholders should not attend",
            "That demos should be cancelled",
            "That sprint reviews inspect working increments and gather feedback, and unfinished items should be framed honestly"
          ],
          "answer": 3,
          "explanation": "Sprint reviews are working sessions on the increment, including honest framing of what is done and what is in progress. Setting that expectation prevents demo disappointment. Hiding unfinished work removes the feedback the review exists to gather.",
          "why_wrong": [
            "Polished-only demos hide progress and delay feedback.",
            "Excluding stakeholders defeats the review's purpose.",
            "Cancelling reviews removes the feedback loop.",
            ""
          ]
        },
        {
          "id": "ba-26-08",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A team measures success only by story points delivered. What is the risk?",
          "options": [
            "The team optimises points over outcomes, inflating estimates and ignoring value",
            "Points are too accurate",
            "The team will deliver too much value",
            "No risk, points are the goal"
          ],
          "answer": 0,
          "explanation": "Points measure output, not outcomes; rewarding points incentivises inflated estimates and high-point, low-value work. Success must be measured by outcomes delivered. Goodhart's law applies: a measure turned into a target stops being useful.",
          "why_wrong": [
            "",
            "Points are relative estimates, not precise measures.",
            "Point-chasing delivers output, not necessarily value.",
            "Points are a planning aid, not the goal."
          ]
        },
        {
          "id": "ba-26-09",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA supports three teams sharing one product backlog. What is the key discipline?",
          "options": [
            "No backlog at all",
            "Let each team order its own copy",
            "One ordered backlog, with items clearly allocated and dependencies visible",
            "Three separate backlogs"
          ],
          "answer": 2,
          "explanation": "One product needs one ordered backlog, so priorities are coherent across teams and dependencies are visible. Separate copies diverge and create conflicting priorities. Single-backlog discipline is essential for scaled delivery.",
          "why_wrong": [
            "No backlog means no shared plan at all.",
            "Separate orderings create conflicting priorities.",
            "",
            "Three backlogs fragment the product view."
          ]
        },
        {
          "id": "ba-26-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A retrospective produces ten improvement actions but none get done. What should change?",
          "options": [
            "Stop holding retrospectives",
            "Produce twenty actions next time",
            "Hold more retrospectives",
            "Pick one or two actions, give them owners, and track them in the next sprint"
          ],
          "answer": 3,
          "explanation": "Ten ownerless actions are a wish list; one or two owned, tracked actions actually improve the team. Retrospective value comes from follow-through, not volume. Fewer, owned actions beat many ignored ones.",
          "why_wrong": [
            "Stopping retrospectives removes the improvement loop.",
            "More actions without ownership worsens the problem.",
            "More retrospectives without follow-through add no value.",
            ""
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-27",
        "title": "BA Test 27: Advanced Process Improvement Scenarios",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-27-01",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A process improvement saves time but increases errors. How should the BA judge it?",
          "options": [
            "Ignore the errors",
            "Success, time saved is all that matters",
            "A failure overall: improvement must be judged on quality, cost, and time together",
            "Success, errors are someone else's problem"
          ],
          "answer": 2,
          "explanation": "Process improvement must balance time, cost, and quality; trading speed for errors is not improvement. The BA judges the whole outcome against the original goals. Single-metric success stories hide real damage.",
          "why_wrong": [
            "Ignoring errors lets the damage continue.",
            "Time alone ignores the quality damage.",
            "",
            "Errors created by the change are the change's responsibility."
          ]
        },
        {
          "id": "ba-27-02",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Staff revert to the old process weeks after a new one launches. What was most likely missed?",
          "options": [
            "A bigger launch party",
            "More process maps",
            "A longer launch email",
            "Change management: training, support, and addressing why the old way persisted"
          ],
          "answer": 3,
          "explanation": "Reversion signals that adoption was not managed: people were not trained, supported, or convinced, or the old way solved a problem the new one does not. Sustainable change needs change management, not just a new map. Adoption is a people outcome.",
          "why_wrong": [
            "A party does not sustain new ways of working.",
            "More maps do not address adoption.",
            "A longer email does not change behaviour.",
            ""
          ]
        },
        {
          "id": "ba-27-03",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA proposes automating a broken process. What is the risk?",
          "options": [
            "Automating a broken process makes the brokenness faster and harder to fix",
            "Automation is always cheap",
            "Staff will love it",
            "No risk, automation fixes everything"
          ],
          "answer": 0,
          "explanation": "Automating a flawed process amplifies its flaws at machine speed and embeds them in code, making them harder to change. Fix the process first, then automate the fixed version. Automation multiplies whatever it is given, good or bad.",
          "why_wrong": [
            "",
            "Automation has real costs, especially when rework follows.",
            "Staff rarely love a faster broken process.",
            "Automation amplifies flaws; it does not fix them."
          ]
        },
        {
          "id": "ba-27-04",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What is the difference between process improvement and process reengineering?",
          "options": [
            "There is no difference",
            "Improvement refines the existing process; reengineering redesigns it from scratch",
            "Reengineering is slower",
            "Improvement is only for small teams"
          ],
          "answer": 1,
          "explanation": "Incremental improvement tunes the current process, while reengineering questions its foundations and redesigns it radically. The choice depends on how broken the current process is and how much disruption is acceptable. Different situations need different approaches.",
          "why_wrong": [
            "The approaches differ in depth and disruption.",
            "",
            "Reengineering is usually more disruptive, not simply slower.",
            "Improvement applies to teams of any size."
          ]
        },
        {
          "id": "ba-27-05",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A process has long waiting times between steps but each step is fast. Where should improvement focus?",
          "options": [
            "Removing all measurement",
            "Making the fast steps faster",
            "Reducing waiting: queues, batching, and handoff delays",
            "Adding more steps"
          ],
          "answer": 2,
          "explanation": "When waiting dominates elapsed time, the improvement lever is queues, batch sizes, and handoffs, not step speed. Optimising fast steps yields negligible gains. Measure first, then attack the dominant delay.",
          "why_wrong": [
            "Removing measurement blinds the improvement effort.",
            "Faster fast steps barely dent total elapsed time.",
            "",
            "More steps add more waiting, not less."
          ]
        },
        {
          "id": "ba-27-06",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA measures a process only by average handling time. What is missed?",
          "options": [
            "The average is always wrong",
            "Averages are illegal",
            "Nothing, averages tell all",
            "Variation: the worst cases, outliers, and the experience of the slowest customers"
          ],
          "answer": 3,
          "explanation": "Averages hide variation: a good average can conceal terrible worst cases that damage customers. Percentiles and distributions reveal the real experience. Measuring variation is essential for honest process analysis.",
          "why_wrong": [
            "Averages can be correct yet still misleading alone.",
            "Averages are legal; they are just insufficient alone.",
            "Averages hide the distribution and the worst cases.",
            ""
          ]
        },
        {
          "id": "ba-27-07",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A new process works in the pilot team but fails when rolled out widely. What should the BA examine?",
          "options": [
            "Differences between pilot and rollout contexts: volume, skills, systems, and local variation",
            "The colour of the rollout slides",
            "Nothing, pilots always scale",
            "The pilot team's luck"
          ],
          "answer": 0,
          "explanation": "Pilots run in controlled conditions; rollout exposes volume, skill, system, and local differences that the pilot never tested. Scaling requires examining those contextual gaps. Pilots prove a concept, not universal readiness.",
          "why_wrong": [
            "",
            "Slide colours do not affect process rollout.",
            "Pilots do not always scale; context differences matter.",
            "Luck does not explain systematic rollout failure."
          ]
        },
        {
          "id": "ba-27-08",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What is a control point in a process?",
          "options": [
            "A place where the process stops forever",
            "A check that verifies quality or compliance before work proceeds",
            "A coffee break",
            "The start of the process"
          ],
          "answer": 1,
          "explanation": "Control points are checks embedded in the process that verify accuracy, completeness, or compliance before work moves on, catching errors early. They are deliberate quality gates. Removing them without replacement increases risk.",
          "why_wrong": [
            "Control points check work; they do not stop the process permanently.",
            "",
            "A break is not a control point.",
            "The start is not a control point."
          ]
        },
        {
          "id": "ba-27-09",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA removes a control point to speed up a process. What must be true for this to be safe?",
          "options": [
            "The control was boring",
            "Nobody noticed the control",
            "Nothing, speed is always safe",
            "The risk the control managed is accepted, or managed another way, with the owner's agreement"
          ],
          "answer": 3,
          "explanation": "Controls exist to manage risk, so removing one requires the risk owner to accept the residual risk or agree an alternative control. Unilateral removal transfers risk silently. Control changes are risk decisions, not speed tweaks.",
          "why_wrong": [
            "Boredom is not a risk justification.",
            "Unnoticed controls still manage real risk.",
            "Speed without risk assessment is unsafe.",
            ""
          ]
        },
        {
          "id": "ba-27-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "How should a BA prove a process change delivered its promised benefit?",
          "options": [
            "By comparing agreed baseline measures with post-change measures over a fair period",
            "By counting meetings",
            "By asking the project sponsor to guess",
            "By asserting it loudly"
          ],
          "answer": 0,
          "explanation": "Benefit proof needs a baseline, agreed measures, and a fair post-change comparison period. Assertion, meeting counts, and guesses are not evidence. Measurement discipline is what separates improvement from storytelling.",
          "why_wrong": [
            "",
            "Meetings measure activity, not benefit.",
            "Guessing is not measurement.",
            "Assertion is not evidence."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-28",
        "title": "BA Test 28: Advanced Data and Reporting Scenarios",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-28-01",
          "domain": "professional",
          "chapter": "ch84",
          "question": "Two reports show different revenue figures for the same month. What is the BA's first step?",
          "options": [
            "Delete one report",
            "Average the two figures",
            "Pick the higher figure",
            "Compare definitions, filters, timing, and sources behind each report"
          ],
          "answer": 3,
          "explanation": "Different figures usually mean different definitions, cut-off times, filters, or sources. Reconciling those inputs explains the gap and identifies the correct figure. Picking, deleting, or averaging hides the real difference.",
          "why_wrong": [
            "Deleting a report destroys evidence of the difference.",
            "Averaging two differently-defined figures is meaningless.",
            "Picking the higher figure is arbitrary and may be wrong.",
            ""
          ]
        },
        {
          "id": "ba-28-02",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A dashboard shows a sudden spike in failed transactions. What should the BA check before alarming stakeholders?",
          "options": [
            "Whether the spike is real: data load timing, definition changes, or a known incident",
            "The dashboard colours",
            "Whether anyone else noticed",
            "Nothing, alarm everyone immediately"
          ],
          "answer": 0,
          "explanation": "Spikes can be artefacts of late loads, definition changes, or duplicate data, so the BA verifies the signal before escalating. False alarms erode credibility. Verify first, then escalate with facts.",
          "why_wrong": [
            "",
            "Colours do not explain a data spike.",
            "Others noticing does not verify the spike.",
            "Immediate alarm on an unverified spike risks a false alarm."
          ]
        },
        {
          "id": "ba-28-03",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A stakeholder wants a report with fifty columns. What should the BA do?",
          "options": [
            "Build it exactly as asked",
            "Understand which decisions the report supports and design it around those, challenging excess columns",
            "Refuse to build any report",
            "Build fifty separate reports"
          ],
          "answer": 1,
          "explanation": "Fifty columns usually signal an unclear purpose; the BA must understand the decisions the report supports and design a focused report around them. Building everything asked for produces an unusable report. Purpose-driven design beats column count.",
          "why_wrong": [
            "Building exactly as asked produces an unusable fifty-column report.",
            "",
            "Refusal ignores a genuine reporting need.",
            "Fifty reports multiply the problem."
          ]
        },
        {
          "id": "ba-28-04",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What is a data dictionary?",
          "options": [
            "A list of report titles",
            "A list of database passwords",
            "A definition of each data element: meaning, format, source, and rules",
            "A spell checker"
          ],
          "answer": 2,
          "explanation": "A data dictionary defines each element's meaning, format, source, and validation rules, so everyone interprets data the same way. It is the shared language for data. Without it, the same field means different things to different teams.",
          "why_wrong": [
            "Report titles do not define data elements.",
            "Passwords have nothing to do with a data dictionary.",
            "",
            "A spell checker checks language, not data definitions."
          ]
        },
        {
          "id": "ba-28-05",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A migration maps old status codes to new ones, but two old codes map to one new code. What is the risk?",
          "options": [
            "The migration runs faster",
            "The new system looks cleaner",
            "No risk",
            "Loss of distinction: history and reporting can no longer tell the two cases apart"
          ],
          "answer": 3,
          "explanation": "Many-to-one mapping destroys information: the distinction between the two old statuses is lost forever in the new system. The BA must confirm the business accepts that loss or preserve the distinction. Mapping decisions are data decisions.",
          "why_wrong": [
            "Speed is not the concern; information loss is.",
            "A cleaner look does not justify lost distinctions.",
            "Information loss is a real risk of many-to-one mapping.",
            ""
          ]
        },
        {
          "id": "ba-28-06",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA writes a requirement for a field to be mandatory. What else must be specified?",
          "options": [
            "Validation rules, error handling, and what happens to existing records without the field",
            "The field's colour",
            "The developer's name",
            "Nothing"
          ],
          "answer": 0,
          "explanation": "Mandatory is incomplete without validation rules, the user-facing error, and the treatment of legacy records that lack the field. Each gap becomes a defect or a migration failure. Complete field requirements cover behaviour and history.",
          "why_wrong": [
            "",
            "Field colour does not define mandatory behaviour.",
            "The developer's name is irrelevant to the requirement.",
            "Mandatory alone leaves validation, errors, and legacy data undefined."
          ]
        },
        {
          "id": "ba-28-07",
          "domain": "professional",
          "chapter": "ch84",
          "question": "What does data lineage show?",
          "options": [
            "The age of the database",
            "Where data comes from, how it transforms, and where it is used",
            "The number of users",
            "The server location"
          ],
          "answer": 1,
          "explanation": "Lineage traces data from source through transformations to its uses, so impact analysis and defect tracing are possible. When a source changes, lineage shows everything affected. It is traceability for data.",
          "why_wrong": [
            "Database age is not lineage.",
            "",
            "User counts are not lineage.",
            "Server location is infrastructure, not lineage."
          ]
        },
        {
          "id": "ba-28-08",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A report is correct but stakeholders do not use it. What is the most likely cause?",
          "options": [
            "The data is too fresh",
            "The report is too accurate",
            "It does not answer the questions stakeholders actually have, or it is hard to find and read",
            "Reports are never used"
          ],
          "answer": 2,
          "explanation": "Unused correct reports usually miss the real question, arrive too late, or are buried and unreadable. Usefulness depends on relevance, timing, and presentation, not just accuracy. The BA must revisit the report's purpose with its audience.",
          "why_wrong": [
            "Fresh data is a benefit, not a cause of non-use.",
            "Accuracy does not cause non-use.",
            "",
            "Many reports are heavily used when they answer real questions."
          ]
        },
        {
          "id": "ba-28-09",
          "domain": "professional",
          "chapter": "ch84",
          "question": "When specifying a calculated field, what must the BA define?",
          "options": [
            "Only the field name",
            "The formula, inputs, rounding, edge cases, and handling of missing values",
            "Only the display colour",
            "Only the font size"
          ],
          "answer": 1,
          "explanation": "Calculated fields need the full formula, its inputs, rounding rules, edge cases, and null handling, or different implementations will produce different results. Precision in calculation specs prevents reconciliation disputes. Every assumption must be explicit.",
          "why_wrong": [
            "A name alone does not define a calculation.",
            "",
            "Display colour does not define a calculation.",
            "Font size does not define a calculation."
          ]
        },
        {
          "id": "ba-28-10",
          "domain": "professional",
          "chapter": "ch84",
          "question": "A BA finds personal data in a test environment copied from production. What should happen?",
          "options": [
            "Share it with the team",
            "Nothing, test data is harmless",
            "Raise it immediately: production personal data in test environments is a privacy and compliance risk",
            "Use it for more testing"
          ],
          "answer": 2,
          "explanation": "Real personal data in test environments exposes it to people and controls that production data rules do not cover, creating privacy and regulatory risk. It must be raised, removed or masked, and replaced with proper test data. Data protection applies everywhere data lives.",
          "why_wrong": [
            "Sharing it widens the breach.",
            "Personal data in test is a real compliance risk.",
            "",
            "Using it further increases the exposure."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-29",
        "title": "BA Test 29: Advanced UAT and Release Scenarios",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-29-01",
          "domain": "professional",
          "chapter": "ch42",
          "question": "UAT finds a defect in a feature the business rarely uses, two days before go-live. What should drive the decision?",
          "options": [
            "Risk assessment: impact, workaround, and the risk of a late fix versus deferral",
            "Always defer all defects",
            "Cancel go-live for any defect",
            "Fix everything regardless of impact"
          ],
          "answer": 0,
          "explanation": "Late defects need risk-based triage: business impact, available workaround, and the risk that a rushed fix breaks something else. Blanket fix-all or defer-all rules ignore context. Informed risk decisions protect go-live quality.",
          "why_wrong": [
            "",
            "Blanket deferral ignores defects that genuinely block the business.",
            "Cancelling for any defect is disproportionate.",
            "Fixing everything regardless ignores the risk of rushed late changes."
          ]
        },
        {
          "id": "ba-29-02",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A UAT tester reports a defect that is actually the specified behaviour. What should happen?",
          "options": [
            "Fix the system to match the tester's expectation",
            "Explain the specified behaviour, record the query, and raise a change request if the business wants different behaviour",
            "Ignore the tester",
            "Blame the tester"
          ],
          "answer": 1,
          "explanation": "Behaviour that matches the specification is not a defect, but the tester's expectation signals a possible requirements gap. The BA explains, records, and routes any desired change through change control. Treating it as a defect wastes fix effort.",
          "why_wrong": [
            "Changing specified behaviour without control bypasses governance.",
            "",
            "Ignoring the tester loses a possible requirements insight.",
            "Blame discourages testers from raising genuine issues."
          ]
        },
        {
          "id": "ba-29-03",
          "domain": "professional",
          "chapter": "ch42",
          "question": "What is a UAT exit criterion?",
          "options": [
            "The UAT tester's lunch time",
            "A condition that must be met before UAT starts",
            "A condition that must be met before UAT is considered complete, such as pass rate and no open critical defects",
            "A reason to start UAT early"
          ],
          "answer": 2,
          "explanation": "Exit criteria define when UAT can finish: test coverage achieved, pass thresholds met, and no unresolved critical or high defects. They prevent premature sign-off. Entry criteria gate the start; exit criteria gate the finish.",
          "why_wrong": [
            "Lunch times are not exit criteria.",
            "Start conditions are entry criteria, not exit criteria.",
            "",
            "Starting early is not an exit criterion."
          ]
        },
        {
          "id": "ba-29-04",
          "domain": "professional",
          "chapter": "ch42",
          "question": "Go-live is approved with three known medium defects. What must exist for each?",
          "options": [
            "A promise to fix them someday",
            "Silence",
            "Nothing, medium defects do not matter",
            "A documented workaround, an owner, and an agreed fix plan"
          ],
          "answer": 3,
          "explanation": "Known defects carried into production need a workaround users can follow, an owner, and a dated fix plan, or they become permanent production pain. Vague promises are not a plan. Documented acceptance is what makes go-live with defects responsible.",
          "why_wrong": [
            "A vague promise is not a fix plan.",
            "Silence leaves users to discover the defects unaided.",
            "Medium defects still affect users and need workarounds.",
            ""
          ]
        },
        {
          "id": "ba-29-05",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A release breaks a previously working feature. What does this indicate?",
          "options": [
            "A regression: insufficient regression testing before release",
            "The feature was unimportant",
            "Users are testing wrong",
            "Good testing"
          ],
          "answer": 0,
          "explanation": "Breaking existing functionality is a regression, and its escape indicates regression coverage or execution gaps before release. The fix is stronger regression discipline, not blaming users. Regressions erode trust in every release.",
          "why_wrong": [
            "",
            "Importance does not excuse breaking working functionality.",
            "Users did not break the feature; the release did.",
            "Good testing would have caught the regression."
          ]
        },
        {
          "id": "ba-29-06",
          "domain": "professional",
          "chapter": "ch42",
          "question": "What is a rollback plan?",
          "options": [
            "A plan to roll out more features",
            "A tested procedure to return to the previous working version if the release fails",
            "A plan to delay the release",
            "A meeting agenda"
          ],
          "answer": 1,
          "explanation": "A rollback plan is the tested route back to the last good version when a release fails in production, limiting damage and downtime. Untested rollback is hope, not a plan. Every significant release needs one.",
          "why_wrong": [
            "Rolling out more features is the opposite of rollback.",
            "",
            "Delay is a schedule decision, not a rollback procedure.",
            "An agenda does not restore a working version."
          ]
        },
        {
          "id": "ba-29-07",
          "domain": "professional",
          "chapter": "ch42",
          "question": "UAT testers are pulled away to their day jobs mid-cycle. What should the BA do?",
          "options": [
            "Cancel UAT",
            "Accept the delay silently",
            "Escalate the resourcing risk with impact on dates, and agree protected tester time or revised dates",
            "Do the testing alone without business input"
          ],
          "answer": 2,
          "explanation": "Tester availability is a resourcing commitment, and losing it mid-cycle threatens dates and quality. The BA must surface the impact and secure either protected time or revised dates. Silent acceptance guarantees a late, rushed UAT.",
          "why_wrong": [
            "Cancelling UAT removes the business acceptance check.",
            "Silent acceptance guarantees delay and rushed testing.",
            "",
            "Testing without business users is not user acceptance."
          ]
        },
        {
          "id": "ba-29-08",
          "domain": "professional",
          "chapter": "ch42",
          "question": "What should a release note communicate to users?",
          "options": [
            "The developers' names only",
            "Nothing, users will discover changes",
            "Internal code details",
            "What changed, what is new, known issues with workarounds, and who to contact"
          ],
          "answer": 3,
          "explanation": "Release notes are user-facing: what changed, what is new, known issues and workarounds, and support contacts. Internal code detail belongs elsewhere. Good release notes reduce support calls and build confidence.",
          "why_wrong": [
            "Names alone do not explain the change.",
            "Undiscovered changes surprise and confuse users.",
            "Code details are meaningless to business users.",
            ""
          ]
        },
        {
          "id": "ba-29-09",
          "domain": "professional",
          "chapter": "ch42",
          "question": "A defect is marked fixed but fails retest. What should happen?",
          "options": [
            "Reopen it with evidence from the failed retest and return it to development",
            "Delete it",
            "Ignore the retest",
            "Close it anyway"
          ],
          "answer": 0,
          "explanation": "A failed retest means the fix did not work or was incomplete, so the defect reopens with retest evidence for the developer. Closing it anyway hides a live defect. The defect lifecycle exists to track reality, not to manufacture green status.",
          "why_wrong": [
            "",
            "Deleting it destroys the defect history.",
            "Ignoring retest results defeats the purpose of testing.",
            "Closing a failed defect hides a live problem."
          ]
        },
        {
          "id": "ba-29-10",
          "domain": "professional",
          "chapter": "ch42",
          "question": "What is hypercare after go-live?",
          "options": [
            "A holiday for the team",
            "A period of heightened support and monitoring immediately after release to catch and fix issues fast",
            "A second go-live",
            "A marketing campaign"
          ],
          "answer": 1,
          "explanation": "Hypercare is the intensive support window after go-live, with extra monitoring, rapid response, and daily issue review, because early production issues need fast handling. It protects users during the highest-risk period. Planning hypercare is part of release readiness.",
          "why_wrong": [
            "Hypercare is intensive work, not a holiday.",
            "",
            "It follows go-live; it is not a second one.",
            "It is a support activity, not marketing."
          ]
        }
      ]
    },
    {
      "mode": "test",
      "test": {
        "id": "ba-30",
        "title": "BA Test 30: Applied BA Capstone Scenarios",
        "duration_minutes": 0,
        "pass_mark_percent": 80
      },
      "questions": [
        {
          "id": "ba-30-01",
          "domain": "professional",
          "chapter": "ch29",
          "question": "A sponsor says: 'We need a new system in three months, requirements to follow.' What should the BA do first?",
          "options": [
            "Start building immediately",
            "Facilitate a scoping session to agree goals, scope, constraints, and the requirements approach",
            "Refuse the project",
            "Write all requirements alone in a week"
          ],
          "answer": 1,
          "explanation": "A fixed date without requirements needs urgent scoping: agreed goals, boundaries, constraints, and a plan for just-in-time requirements. Building blind or refusing outright both fail. Scoping turns a vague mandate into a workable plan.",
          "why_wrong": [
            "Building without scope guarantees the wrong system.",
            "",
            "Refusal wastes the chance to shape the work properly.",
            "Solo requirements in a week lack stakeholder ownership."
          ]
        },
        {
          "id": "ba-30-02",
          "domain": "professional",
          "chapter": "ch29",
          "question": "A project has no traceability, vague requirements, and stakeholders who disagree. What should the BA tackle first?",
          "options": [
            "Hire more BAs",
            "Buy a new tool",
            "Stabilise the baseline: agree scope and key requirements with stakeholders, then build traceability from there",
            "Write a longer document"
          ],
          "answer": 2,
          "explanation": "The foundation is agreed scope and requirements; traceability and tooling follow from a stable baseline. Tools and headcount cannot fix disagreement. Stabilising the baseline first makes every later control meaningful.",
          "why_wrong": [
            "More BAs without agreement multiply the confusion.",
            "A tool cannot fix disagreement or vague requirements.",
            "",
            "A longer document does not create agreement."
          ]
        },
        {
          "id": "ba-30-03",
          "domain": "professional",
          "chapter": "ch29",
          "question": "A BA joins a failing project mid-flight. What is the most valuable first action?",
          "options": [
            "Blame the previous BA",
            "Change all the processes immediately",
            "Rewrite all documents",
            "Listen: review the current state, talk to stakeholders, and find the real blockers before acting"
          ],
          "answer": 3,
          "explanation": "Joining mid-flight requires diagnosis before prescription: understanding the current state, stakeholder views, and true blockers prevents fixing the wrong things. Immediate rewrites and process changes destroy context. Listen first, then act on evidence.",
          "why_wrong": [
            "Blame destroys trust and teaches nothing.",
            "Immediate process change without diagnosis causes more disruption.",
            "Rewriting documents before understanding wastes effort.",
            ""
          ]
        },
        {
          "id": "ba-30-04",
          "domain": "professional",
          "chapter": "ch29",
          "question": "A business case promises savings that depend on headcount reduction. What should the BA verify?",
          "options": [
            "Whether the savings are realistic, how they will be realised, and what happens if they are not",
            "The font of the business case",
            "The sponsor's enthusiasm",
            "Nothing, savings are guaranteed"
          ],
          "answer": 0,
          "explanation": "Benefit claims must be challenged: are the savings realistic, what mechanism realises them, and what is the fallback if they do not materialise? Unchallenged benefit claims produce failed business cases. The BA tests the logic, not the enthusiasm.",
          "why_wrong": [
            "",
            "Font does not validate a benefit claim.",
            "Enthusiasm is not evidence of realisable savings.",
            "Savings are never guaranteed; they must be evidenced."
          ]
        },
        {
          "id": "ba-30-05",
          "domain": "professional",
          "chapter": "ch29",
          "question": "A solution is built exactly to specification but users reject it. What went wrong?",
          "options": [
            "The users are wrong",
            "The specification captured the stated ask but not the real need, or users were not involved in validating it",
            "The developers failed",
            "Testing failed"
          ],
          "answer": 1,
          "explanation": "Building to a specification that misses the real need produces a correct but useless solution. User involvement, prototypes, and validation catch this early. Specification compliance is not the same as fitness for use.",
          "why_wrong": [
            "User rejection signals a requirements failure, not user error.",
            "",
            "Developers built what was specified; the gap is upstream.",
            "Testing verifies the specification; it cannot fix a wrong one."
          ]
        },
        {
          "id": "ba-30-06",
          "domain": "professional",
          "chapter": "ch29",
          "question": "A BA must choose between documenting everything and delivering analysis just in time. What guides the choice?",
          "options": [
            "Always document everything",
            "Personal preference",
            "Project context: risk, regulation, team proximity, and rate of change",
            "The longest document wins"
          ],
          "answer": 2,
          "explanation": "Documentation depth is a context decision: regulated, high-risk, distributed work needs more formality, while co-located, fast-changing work needs lighter just-in-time analysis. Context, not habit, should drive the choice. Fit the practice to the situation.",
          "why_wrong": [
            "Always documenting everything wastes effort on stable, low-risk work.",
            "Preference is not a professional basis for the choice.",
            "",
            "Length does not equal value."
          ]
        },
        {
          "id": "ba-30-07",
          "domain": "professional",
          "chapter": "ch29",
          "question": "A change programme affects five departments with different readiness levels. What should the BA recommend?",
          "options": [
            "Roll out to the least ready first",
            "Skip readiness assessment",
            "One identical rollout for all",
            "A phased approach tailored to each department's readiness, with shared core standards"
          ],
          "answer": 3,
          "explanation": "Different readiness levels need a phased, tailored rollout that respects local context while holding shared standards. Identical rollout ignores readiness gaps, and least-ready-first maximises failure risk. Phasing manages risk and builds on early wins.",
          "why_wrong": [
            "Least-ready-first maximises the risk of early failure.",
            "Skipping readiness assessment flies blind.",
            "Identical rollout ignores real readiness differences.",
            ""
          ]
        },
        {
          "id": "ba-30-08",
          "domain": "professional",
          "chapter": "ch29",
          "question": "A BA's analysis shows the proposed solution will not deliver the promised benefit. What should the BA do?",
          "options": [
            "Present the evidence honestly to the sponsor with alternative options",
            "Exaggerate the benefit further",
            "Resign",
            "Hide the finding to protect the project"
          ],
          "answer": 0,
          "explanation": "The BA's duty is honest, evidence-based advice, even when it is unwelcome. Presenting the finding with alternatives lets the sponsor decide with full information. Hiding it wastes investment and destroys trust when reality arrives.",
          "why_wrong": [
            "",
            "Exaggeration deepens the eventual failure.",
            "Resigning avoids the professional duty to advise honestly.",
            "Hiding evidence wastes investment and destroys trust."
          ]
        },
        {
          "id": "ba-30-09",
          "domain": "professional",
          "chapter": "ch29",
          "question": "What is the BA's most important deliverable on any project?",
          "options": [
            "The longest meeting",
            "The thickest document",
            "Shared understanding between business and delivery teams about what is needed and why",
            "The most diagrams"
          ],
          "answer": 2,
          "explanation": "Documents and diagrams are means to an end; the real deliverable is shared understanding that lets the team build the right thing. Without it, artefacts are shelfware. The BA's craft serves understanding, not paper.",
          "why_wrong": [
            "Meeting length measures time, not understanding.",
            "Thickness measures volume, not understanding.",
            "",
            "Diagram count measures output, not understanding."
          ]
        },
        {
          "id": "ba-30-10",
          "domain": "professional",
          "chapter": "ch29",
          "question": "A project ends successfully. What should the BA do to capture learning?",
          "options": [
            "Delete all project files",
            "Take all the credit",
            "Move on immediately",
            "Contribute to a lessons-learned review, recording what worked, what did not, and what to repeat"
          ],
          "answer": 3,
          "explanation": "Lessons learned turn one project's experience into organisational knowledge, recording successes to repeat and mistakes to avoid. Moving on without capture wastes the learning. Retrospectives at project end close the loop.",
          "why_wrong": [
            "Deleting files destroys the project record.",
            "Credit-taking is unprofessional and teaches nothing.",
            "Moving on without capture wastes the learning.",
            ""
          ]
        }
      ]
    }
  ]
};
