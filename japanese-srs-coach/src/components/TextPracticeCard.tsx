import { FormEvent, useEffect, useMemo, useState } from 'react';
import { answerSimilarity, normalizeAnswer } from '../lib/learnedItems';
import { srsApi } from '../lib/srsApi';
import type { Attempt, LearnedItem } from '../lib/types';
import { FourPartLedger } from './FourPartLedger';

export function TextPracticeCard({ onDataChanged }: { onDataChanged: () => void }) {
  const [items, setItems] = useState<LearnedItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ result: Attempt['result']; message: string } | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const current = items[index];

  useEffect(() => {
    srsApi.getDueItems().then(setItems).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load practice items.')).finally(() => setLoading(false));
  }, []);

  const prompt = useMemo(() => current ? `Give the Japanese for “${current.english}” using Romaji.` : '', [current]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!current || !answer.trim()) return;
    const exact = normalizeAnswer(answer) === normalizeAnswer(current.romaji);
    const similarity = answerSimilarity(answer, current.romaji);
    const result: Attempt['result'] = exact ? 'correct' : similarity >= 0.7 ? 'partial' : 'wrong';
    const message = result === 'correct'
      ? `Correct. ${current.explanation}`
      : result === 'partial'
        ? `Very close. Focus on the smallest sound or spelling difference: ${current.romaji}. ${current.mnemonic}`
        : `Not yet. The answer is ${current.romaji}. ${current.mnemonic}`;
    const attempt: Attempt = {
      attemptId: crypto.randomUUID(), learnerId: import.meta.env.VITE_LEARNER_ID || 'learner-demo-001',
      conceptIds: [current.conceptId], promptEnglish: prompt, expectedAnswers: [current.romaji],
      userTranscript: answer, normalizedUserAnswer: normalizeAnswer(answer), result,
      mistakeTypes: result === 'correct' ? [] : ['recall_or_form'], feedbackGiven: message,
      retryRequired: result !== 'correct', timestamp: new Date().toISOString(),
    };
    try {
      await srsApi.logAttempt(attempt);
      await srsApi.updateLearnedItemStats(current.conceptId, { result, correctedAfterRetry: retrying && result === 'correct' });
      setFeedback({ result, message });
      setRetrying(result !== 'correct');
      setAnswer('');
      onDataChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save this attempt.');
    }
  };

  const next = () => {
    setIndex((currentIndex) => currentIndex + 1);
    setFeedback(null);
    setRetrying(false);
    setAnswer('');
  };

  return (
    <article className="panel practice-card">
      <p className="eyebrow">Quiet mode</p>
      <h2>Text practice</h2>
      {loading && <p>Loading one focused prompt…</p>}
      {!loading && !current && <p className="empty-state">No more due items. Review the Learned tab or return later.</p>}
      {current && (
        <>
          <div className="practice-progress"><span>Due item {index + 1} of {items.length}</span><span>{current.category}</span></div>
          <form className="stack" onSubmit={submit}>
            <label htmlFor="text-practice-answer"><strong>{prompt}</strong></label>
            <input id="text-practice-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Type your answer in Romaji" autoComplete="off" />
            <button className="button button--primary" disabled={!answer.trim()}>Check answer</button>
          </form>
          {feedback && (
            <div className={`drill-feedback drill-feedback--${feedback.result}`} aria-live="polite">
              <strong>{feedback.result.toUpperCase()}</strong><p>{feedback.message}</p>
              <FourPartLedger item={current} compact />
              {feedback.result === 'correct' ? <button className="button button--secondary" onClick={next}>Next due item</button> : <p><strong>Try the same prompt again.</strong></p>}
            </div>
          )}
        </>
      )}
      {error && <p className="error-message" role="alert">{error}</p>}
    </article>
  );
}
