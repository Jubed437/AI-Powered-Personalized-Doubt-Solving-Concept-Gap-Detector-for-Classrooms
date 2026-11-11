# AI Architecture, Prompts, and Evaluation

## Implemented scope

The backend runs LangGraph.js in-process with Express. MongoDB persists doubts, the DSA concept catalog, and learning sessions. Groq is the first provider through a small provider adapter that calls its OpenAI-compatible chat-completions API. The provider key stays in the backend environment; it is never sent to the browser. The current concept catalog is a small, editable DSA seed, not a complete curriculum.

The workflow in `src/ai/workflow.js` is:

1. Extract candidate concepts using a versioned prompt and the known catalog.
2. Resolve proposed IDs against the catalog and build a prerequisite list with deterministic graph traversal.
3. Generate an explanation grounded in the matched concepts and prerequisite descriptions.
4. Validate IDs, confidence ranges, text limits, response shape, and practice recommendation scope.
5. Retry once when structured output is invalid; return an explicit error if it remains invalid.

LangGraph state is temporary request state. The model cannot assign mastery or mutate student records. Quiz attempt evidence is saved by the practice engine; prerequisite concepts from a doubt are still presented as concepts to review, not confirmed student weaknesses.

## Provider configuration

Copy `.env.example` to `.env` in the backend directory, then configure:

| Variable | Purpose | Default |
|---|---|---|
| `AI_PROVIDER` | Provider adapter | `groq` |
| `GROQ_API_KEY` | Server-side Groq API key | Required |
| `GROQ_MODEL` | Inference model | `llama-3.3-70b-versatile` |
| `AI_TIMEOUT_MS` | Per-call timeout | `20000` |

If the key is missing or provider fails, `/api/doubts` returns a structured non-success response. The application does not fabricate an answer.

## Prompt design

Prompt templates live in `src/ai/prompts.js`; `PROMPT_VERSION` is included in API output and provider metadata.

- **Concept-analysis prompt:** treats student text as untrusted data; selects only catalog IDs; emits confidence, evidence, and unknown terms.
- **Tutor prompt:** uses resolved concepts and prerequisite context; avoids mastery claims; returns a short structured explanation and scoped practice recommendations.
- **Repair:** validation messages are added to the explanation prompt for one bounded retry.

The application validates model output independently of prompt instructions. Unknown concept IDs, out-of-range confidence, malformed shape, oversized lists, or recommendations outside the approved concept context are rejected.

## API shape

`POST /api/doubts` accepts:

```json
{
  "studentName": "Maya Patel",
  "subject": "Data Structures and Algorithms",
  "topic": "Searching",
  "doubt": "Why do we update low to mid + 1 in binary search?"
}
```

The success response retains the existing doubt-feed fields and adds `concepts`, `prerequisiteReview`, `explanation`, `unknownTerms`, `promptVersion`, and provider metadata. Errors include a stable `code` and a safe message.

## Evaluation

The labeled smoke dataset is in `evaluation/cases.json`. Run it against the configured live model:

```powershell
npm run evaluate:ai
```

The report includes concept-mapping micro precision, recall, F1, valid response rate, average latency, p95 latency, and per-case predictions. The command exits non-zero if any response is invalid or aggregate concept F1 is below 0.70. This small seed set is a development check, not evidence of educational impact; have a subject expert expand and verify the labels before reporting results.

Run deterministic tests without an API key:

```powershell
npm test
```

Tests cover graph traversal, output validation, prompt safeguards, workflow output, bounded retry/failure, and metric calculation. The live evaluation is separate because it incurs provider latency/cost and depends on a configured API key.

## Next production steps

- Replace the in-code concept seed with versioned database tables and reviewed curriculum content.
- Persist doubts, model metadata, and quiz attempts transactionally.
- Add authentication, student/class authorization, rate limiting, request-id logging, and retention controls before classroom deployment.
- Connect prerequisite review to real mastery evidence only after quiz attempts are stored. Do not treat question text or an AI explanation as proof of mastery.
- Expand the labeled evaluation set, use expert ratings for explanation correctness/grounding, and report confidence intervals and subgroup performance where ethically and institutionally appropriate.
