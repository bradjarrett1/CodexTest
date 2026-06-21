# Airtable Schema

Use Airtable field names in snake_case. Make maps them to the camelCase API models.

## Learner_Profile

| Field | Type |
|---|---|
| learner_id | Single line text, primary/unique |
| display_name | Single line text |
| current_estimated_level | Single select |
| romaji_required | Checkbox |
| kana_knowledge_level, kanji_knowledge_level | Single select |
| speaking_confidence, listening_confidence, grammar_confidence | Number |
| preferred_session_length_minutes | Number |
| current_curriculum_step | Single line text |
| long_term_goal | Long text |
| known_constraints | Long text/JSON |
| assessment_status | Single select |
| assessment_strengths, assessment_weaknesses, curriculum_priorities | Long text/JSON |
| assessment_completed_at, created_at, updated_at | Date with time |

## Concepts

`concept_id` (primary text), `type` (single select), `romaji`, `kana`, `full_japanese`, `english` (text), `explanation`, `mnemonic`, `examples` (long text/JSON), `category` (single select), `tags` (multiple select), `difficulty_level` (number), `introduced_at`, `learned_at`, `last_reviewed_at` (date/time), and `status` (single select).

The four ledger fields are required. Make rejects an upsert when any are blank.

## SRS_State

`srs_state_key` (primary formula: learner + concept), `concept_id` (link to Concepts), `learner_id` (link to Learner_Profile), `times_seen`, `times_correct`, `times_wrong`, `times_partial`, `correct_count`, `wrong_count`, `partial_count`, `interval_days`, `ease`, `priority`, `accuracy_percent` (numbers), `last_result`, `familiarity_level` (single select), `last_seen`, `last_reviewed_at`, `next_due` (date/time), and `is_due` (checkbox).

## Attempts

`attempt_id` (primary), `learner_id`, `concept_ids` (links), `prompt_english`, `expected_answers` (JSON), `user_transcript`, `normalized_user_answer`, `result`, `mistake_types` (JSON), `feedback_given`, `retry_required`, and `timestamp`.

## Sessions

`session_id` (primary), `learner_id`, `started_at`, `ended_at`, `concepts_reviewed`, `concepts_introduced`, `mistakes`, `wins`, `next_session_plan`, `advanced_concepts_deferred` (linked records or JSON), and `notes`.

## Curriculum_Modules

`module_id` (primary), `title`, `level`, `can_do_goal`, `prerequisites`, `target_concepts`, `sample_drills`, `mastery_criteria`, `estimated_sessions`, `locked_until`, and `curriculum_version`.

## Side_Questions

`side_question_id` (primary), `learner_id`, `question`, `answer`, `linked_concept_ids`, `asked_at`, and `promote_to_concept`.

## Deferred_Advanced_Concepts

`deferred_id` (primary), `learner_id`, `concept_id`, `context`, `deferral_reason`, `reconsider_after_module`, `created_at`, and `resolved_at`.

### Example Concept

```json
{
  "concept_id": "vocab-ame",
  "type": "vocab",
  "romaji": "ame",
  "kana": "あめ",
  "full_japanese": "雨",
  "english": "rain",
  "category": "Weather",
  "tags": ["weather", "noun"]
}
```

Create linked-record relationships after importing initial rows. Calculate familiarity in Make using the application thresholds so Airtable and the PWA remain consistent.
