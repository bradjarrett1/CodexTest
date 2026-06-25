# Logical Database Schema

## Tables

### Learner_Profile

One row per learner. Stores profile preferences, estimated level, curriculum step, assessment state, strengths, weaknesses, priorities, constraints, and timestamps.

### Concepts

One row per unique learning concept. Stores the immutable four-part ledger, type, explanation, mnemonic, examples, category, tags, difficulty, introduction date, learned date, and status.

### Attempts

Append-only attempt history keyed by `attempt_id`. Stores prompt, accepted answers, transcript, normalized answer, result, mistakes, feedback, retry flag, concept links, and timestamp.

### SRS_State

One row per learner/concept pair, uniquely keyed by `learner_id::concept_id`. Stores counters, last result, accuracy, familiarity, priority, interval, due date, and due flag.

### Sessions

One row per practice session containing reviewed/introduced concepts, mistakes, wins, next plan, deferred concepts, notes, and start/end timestamps.

### Curriculum_Modules

Versioned can-do modules with prerequisites, target concepts, drills, mastery criteria, estimated sessions, and lock dependency.

### Side_Questions

Questions raised outside the current lesson. Store the question, answer, linked concepts, asked date, and whether it should become a regular concept.

### Deferred_Advanced_Concepts

Premature advanced concepts with context, explanation, deferral reason, and reconsideration trigger. These do not enter routine review automatically.

## Learned Items view

Do not create a separate Learned_Items source table. A learned item is a view over `Concepts` joined to the current learner's `SRS_State`:

- Concepts says what the item is.
- SRS_State says how well the learner knows it.
- `concept_id` is the join key.

All timestamps are ISO 8601 UTC strings at the API boundary. Make converts Airtable dates back to this format.
