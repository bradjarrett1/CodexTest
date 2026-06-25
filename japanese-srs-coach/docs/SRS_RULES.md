# SRS Rules v1

V1 is deliberately deterministic and explainable.

| Result | Next interval | Priority |
|---|---:|---:|
| Wrong or skipped | retry later this session and tomorrow | 5 |
| Partial | retry the prompt and review tomorrow | 4 |
| Correct after retry | 2 days | 3 |
| Correct on first attempt | 5 days | 2 |
| At least 5 correct with 85%+ accuracy | 14 days or twice the prior interval | 1 |

Advanced-early items have no automatic due date unless promoted into the active curriculum.

Accuracy is `times_correct / times_seen`, rounded to a whole percent. Partial and wrong attempts count as seen but not correct. Skipped counts as wrong.

## Familiarity

Evaluate from the highest qualifying tier downward:

- pro: 15+ seen and 95%+
- great: 10+ seen and 85–94%
- good: 7+ seen and 75–84%
- well: 5+ seen and 60–74%
- fairly well: 3+ seen and 40–59%
- low: every other case, including 0–2 seen or below 40%

Familiarity describes evidence accumulated so far. The next-due calculation still reacts to the latest attempt, so a familiar item that fails receives high priority.
