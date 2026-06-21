# Make.com Webhooks

Create one Make scenario per operation. Every scenario starts with **Webhooks → Custom webhook**, performs Airtable actions, and ends with **Webhooks → Webhook response**.

## Common contract

Request:

```json
{
  "learnerId": "learner-demo-001",
  "requestId": "unique-uuid",
  "operationPayload": "varies by endpoint"
}
```

Success response:

```json
{ "ok": true, "data": {} }
```

Error response:

```json
{ "ok": false, "error": { "code": "NOT_FOUND", "message": "Readable explanation" } }
```

Use `requestId`, `attempt_id`, `session_id`, and `concept_id` to make retries idempotent.

## Scenarios

| Webhook | Input beyond common fields | Airtable action | Output data |
|---|---|---|---|
| Get learner profile | none | Search Learner_Profile by learner_id | LearnerProfile |
| Get due items | none | Search SRS_State where learner matches and due/priority qualifies; join Concepts | LearnedItem[] |
| Get learned items | none | Search learner SRS rows; join Concepts | LearnedItem[] |
| Get learned items by category | none | Same join, grouped by category | object of LearnedItem[] |
| Get learned item detail | `conceptId` | Find Concept and learner SRS row | LearnedItem or null |
| Log attempt | `attempt` | Search attempt_id, then create only if absent | Attempt |
| Upsert concept | `concept` | Search concept_id, then update or create | Concept |
| Update SRS state | `srsState` | Upsert by learner_id + concept_id | SrsState |
| Update learned item stats | `conceptId`, `stats` | Load SRS row, apply counters/schedule, update | SrsState |
| Get session summary | none | Search latest Sessions row by ended_at | SessionSummary or null |
| Save session summary | `summary` | Upsert by session_id | SessionSummary |
| Save assessment result | `result` | Update Learner_Profile assessment and curriculum fields | AssessmentResult |

### Example: log attempt

```json
{
  "learnerId": "learner-demo-001",
  "requestId": "0bc0c030-1111-4444-8888-21f9cf950000",
  "attempt": {
    "attemptId": "attempt-001",
    "conceptIds": ["vocab-mizu"],
    "promptEnglish": "Give the Japanese for water.",
    "expectedAnswers": ["mizu"],
    "userTranscript": "mizu",
    "normalizedUserAnswer": "mizu",
    "result": "correct",
    "mistakeTypes": [],
    "feedbackGiven": "Correct.",
    "retryRequired": false,
    "timestamp": "2026-06-20T20:00:00.000Z"
  }
}
```

Make must set `Content-Type: application/json` on the webhook response. Enable CORS for the PWA's deployed origin where Make configuration allows it.
