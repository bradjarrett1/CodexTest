import { useState } from 'react';
import { createSrsState } from '../lib/srsScheduler';
import { dataMode, generateSessionSummary, learnerId, srsApi } from '../lib/srsApi';
import type { Concept, SessionSummary } from '../lib/types';

export function DebugPanel() {
  const [output, setOutput] = useState<unknown>({ message: 'Choose an operation.' });
  const [loading, setLoading] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState<SessionSummary | null>(null);

  const run = async (name: string, operation: () => Promise<unknown>, mutates = false) => {
    if (mutates && dataMode === 'webhook' && !window.confirm(`${name} will write a deterministic debug record to Airtable. Continue?`)) return;
    setLoading(name);
    try { setOutput(await operation()); }
    catch (error) { setOutput({ error: error instanceof Error ? error.message : String(error) }); }
    finally { setLoading(''); }
  };

  const debugConcept = (): Concept => ({
    conceptId: 'debug-neko', type: 'vocab', romaji: 'neko', kana: 'ねこ', fullJapanese: '猫', english: 'cat',
    explanation: 'A common noun for cat.', mnemonic: 'Neko means cat.',
    examples: [{ romaji: 'neko', kana: 'ねこ', fullJapanese: '猫', english: 'cat' }], category: 'Animals', tags: ['debug'],
    difficultyLevel: 1, introducedAt: new Date().toISOString(), learnedAt: new Date().toISOString(), lastReviewedAt: null,
    status: 'new', timesSeen: 0, timesCorrect: 0, timesWrong: 0, timesPartial: 0, lastResult: null,
    accuracyPercent: 0, familiarityLevel: 'low', srsPriority: 3, nextDue: new Date().toISOString(), isDue: true,
  });

  const buttons: Array<[string, () => Promise<unknown>, boolean?]> = [
    ['getLearnerProfile', () => srsApi.getLearnerProfile()],
    ['getDueItems', () => srsApi.getDueItems()],
    ['getLearnedItems', () => srsApi.getLearnedItems()],
    ['getLearnedItemsByCategory', () => srsApi.getLearnedItemsByCategory()],
    ['getLearnedItemDetail', () => srsApi.getLearnedItemDetail('vocab-mizu')],
    ['logAttempt', () => srsApi.logAttempt({ attemptId: crypto.randomUUID(), learnerId, conceptIds: ['vocab-mizu'], promptEnglish: 'Give the Japanese for water.', expectedAnswers: ['mizu'], userTranscript: 'mizu', normalizedUserAnswer: 'mizu', result: 'correct', mistakeTypes: [], feedbackGiven: 'Correct.', retryRequired: false, timestamp: new Date().toISOString() }), true],
    ['upsertConcept', () => srsApi.upsertConcept(debugConcept()), true],
    ['updateSrsState', () => srsApi.updateSrsState(createSrsState('debug-neko', learnerId)), true],
    ['updateLearnedItemStats', () => srsApi.updateLearnedItemStats('vocab-mizu', { result: 'correct' }), true],
    ['getSessionSummary', () => srsApi.getSessionSummary()],
    ['generateSessionSummary', async () => { const summary = generateSessionSummary([], ['vocab-mizu'], new Date().toISOString()); setGeneratedSummary(summary); return summary; }],
    ['saveSessionSummary', () => srsApi.saveSessionSummary(generatedSummary ?? generateSessionSummary([], ['vocab-mizu'], new Date().toISOString())), true],
  ];

  return (
    <section className="panel">
      <p className="eyebrow">Integration workbench</p>
      <h2>API debug panel</h2>
      <p>Mode: <strong>{dataMode}</strong>. Mutation buttons use deterministic fixtures.</p>
      <div className="debug-buttons">{buttons.map(([name, operation, mutates]) => <button className="button button--secondary" key={name} disabled={Boolean(loading)} onClick={() => run(name, operation, mutates)}>{loading === name ? 'Running…' : name}</button>)}</div>
      <pre className="json-output" aria-live="polite">{JSON.stringify(output, null, 2)}</pre>
    </section>
  );
}
