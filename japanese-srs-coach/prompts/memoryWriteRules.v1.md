# Memory Write Rules v1

## Required concept ledger

Every vocabulary, phrase, grammar, pronunciation, kana, kanji, side-question, or deferred concept must preserve:

1. Romaji
2. Hiragana/Katakana
3. Full Japanese
4. English

Reject incomplete concept writes. Never create a duplicate when the same normalized concept or `concept_id` exists.

## Record separation

- Store what an item **is** in Concepts.
- Store how the learner **knows it** in SRS_State.
- Log every attempt separately in Attempts.
- Preserve side questions in Side_Questions.
- Store premature advanced concepts in Deferred_Advanced_Concepts and use type `advanced_early`.
- Failed concepts update SRS state and become early review candidates.
- Every learned concept must be returned by the Learned Items query.
- Grammar concepts require an explanation and at least one four-part example sentence.
