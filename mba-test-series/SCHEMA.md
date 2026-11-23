# MBA Test Series - Shared Mock JSON Schema

One file per mock: ~/workspace/mba-test-series/data/<EXAM>/<EXAM>-0N.json

{
 "exam": "CAT",
 "mock_id": "CAT-01",
 "title": "CAT Mock Test 01",
 "duration_minutes": 120,
 "marking": {"correct": 3, "wrong": -1, "unattempted": 0},
 "sections": [
   {"id": "VARC", "name": "Verbal Ability and Reading Comprehension", "question_count": 24, "time_limit_minutes": 40, "order": 1}
 ],
 "items": [
  {
   "id": "CAT-01-Q001",
   "section": "VARC",
   "type": "mcq",
   "set_id": null,
   "set_title": null,
   "passage": null,
   "question": "...",
   "diagram": null,
   "options": ["A", "B", "C", "D"],
   "correct_index": 0,
   "explanation": "...",
   "topic": "Reading Comprehension - Inference",
   "difficulty": "medium"
  }
 ]
}

## Field rules
- type: "mcq" (4 options, correct_index 0-3, for CAT/MAT/SNAP/CMAT; 5 options, correct_index 0-4, for XAT/IBSAT/GMAT/GRE/NMAT), "tita" (type-in answer, use "correct_answer": "12.5" instead of options/correct_index), "essay" (GRE/GMAT writing; use "correct_answer" for a model outline).
- Set-based questions (RC passages, DILR sets): the shared passage/diagram goes on the FIRST item of the set only. Later items in the same set carry set_id and null passage/diagram.
- diagram kinds: table {caption, headers, rows}, bar {caption, labels, series:[{name, values}]}, line {caption, labels, series}, pie {caption, labels, values}, text {caption, content}. Structured JSON only, never raster images.
- Every mcq/tita item MUST have a correct answer AND a detailed explanation (2-3+ sentences: why the answer is right, why the distractors are wrong where relevant). No question ships without both.
- All questions ORIGINAL. Never copy from real exam papers or other prep providers.
- Difficulty mix per mock roughly 25% easy, 50% medium, 25% hard unless the exam pattern dictates otherwise.
- Write each mock JSON to disk as soon as it is complete, before starting the next.
- Each exam folder also gets CALIBRATION.md: how difficulty was calibrated, the easy/medium/hard mix, and any question adjusted.

## Rules for all builders
- No em dashes. Brand "Payments Training Hub" only. No personal names. No exam-body logos or brand marks (interfaces in the style of each exam, never copied logos).
- Do not change any existing site page or price. Do not touch the 4 modified-unstaged free-kit files in the site repo. Never git add -A.
