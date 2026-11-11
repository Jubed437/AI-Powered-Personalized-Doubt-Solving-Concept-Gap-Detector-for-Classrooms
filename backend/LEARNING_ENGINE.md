# MongoDB Knowledge Graph, Mastery, and Adaptive Practice

## Database setup

Install MongoDB Community Server locally, or create an Atlas cluster. Set the backend environment in `backend/.env`:

```text
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=knowra
```

For Atlas, use the connection string provided by Atlas and replace its password placeholder. Add your client IP to the Atlas project's Network Access list and create a database user with database access. Then from the backend directory run `npm install` and `npm run dev`. The backend verifies the connection, creates indexes, and seeds eight DSA concepts and two curated multiple-choice questions per concept before listening.

Collections are created automatically: `students`, `concepts`, `practiceQuestions`, `practiceSessions`, and `doubts`. Prerequisite edges are stored on each concept document. Practice attempts are embedded in their session document, so saving an answer and advancing the current question happen atomically in one MongoDB document update. Mastery is deterministically recalculated from those saved attempts.

## Knowledge graph and mastery API

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/concepts/graph?studentId=maya-01` | Concept nodes, mastery state, and prerequisite edges |
| `GET` | `/api/students/:studentId/mastery` | Per-concept scores and assessment state |
| `POST` | `/api/practice/sessions` | Start an adaptive session |
| `POST` | `/api/practice/sessions/:sessionId/attempts` | Grade an answer, record evidence, update mastery, and return the next question |

Start a practice session:

```json
{
  "studentId": "maya-01",
  "displayName": "Maya Patel"
}
```

Submit the selected option:

```json
{
  "studentId": "maya-01",
  "questionId": "arrays-indexing-1",
  "answerOptionId": "a"
}
```

Answer keys are kept in MongoDB and are not included in the student question response. Each attempt is atomically appended to its session only if its question is still the active one; duplicate or stale submissions are rejected.

## MVP mastery algorithm

- A new student-concept pair starts at score `0.5` with zero evidence; the UI labels this **Not assessed**, not as a gap.
- Correct answers add `0.08`, `0.12`, or `0.16` for difficulty 1, 2, or 3. Incorrect answers subtract `0.07`.
- Scores are clamped to `[0, 1]`.
- “Mastered” requires both a score of at least `0.80` and at least three correct attempts. An AI doubt or explanation does not change mastery.
- A concept with evidence and mastery below `0.70` is labeled `needs_review`; concepts without evidence remain `not_assessed`.
- Objective multiple-choice answers are graded deterministically. Free-text AI grading is intentionally not included.

## Adaptive question selection

The selector starts new learners with foundational concepts. Once evidence exists, it identifies concepts below `0.70`, expands their prerequisites, and prioritizes lower mastery, prerequisite depth, and older evidence. It selects a question near the target concept's difficulty and does not repeat a question within the same session. Once a learner has no weak concepts, practice continues with non-mastered concepts or available review items.

The algorithm is deterministic and explainable; it is appropriate for a prototype and can be evaluated against a curated question bank. Do not describe it as a trained ML model. Bayesian Knowledge Tracing or IRT should only replace it after sufficient labeled attempt data has been collected and calibrated.

## Prototype security limitation

Authentication and class/teacher authorization are not implemented in the starter project. `studentId` is currently a client-supplied prototype identifier, not proof of identity. Run this only as a local/demo prototype; before deploying with real students, add login, ownership checks, teacher/class authorization, rate limiting, and data retention controls.

## Verification

Run `npm test` for deterministic tests covering mastery bounds and thresholds, adaptive selection, no-repeat behavior, and the AI workflow. These tests do not require a live MongoDB server. To exercise persistence and practice APIs, configure `MONGODB_URI` and start the backend.
