import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LearnedItemCard } from './LearnedItemCard';
import type { LearnedItem } from '../lib/types';

const learnedItem: LearnedItem = {
  conceptId: 'ame', type: 'vocab', romaji: 'ame', kana: 'あめ', fullJapanese: '雨', english: 'rain',
  explanation: 'Rain.', mnemonic: 'Ah-meh.', category: 'Weather', tags: ['weather'],
  learnedAt: '2026-06-20T12:00:00Z', lastReviewedAt: '2026-06-20T13:00:00Z', status: 'review',
  timesSeen: 7, timesCorrect: 6, timesWrong: 1, timesPartial: 0, lastResult: 'correct',
  accuracyPercent: 86, familiarityLevel: 'good', srsPriority: 2, nextDue: null, isDue: false,
};

describe('LearnedItemCard', () => {
  it('renders the exact four-part ledger, familiarity, and stats', () => {
    render(<LearnedItemCard item={learnedItem} />);
    const ledger = screen.getByLabelText('Four-part Japanese learning ledger');
    expect(within(ledger).getByText('ame')).toBeInTheDocument();
    expect(within(ledger).getByText('あめ')).toBeInTheDocument();
    expect(within(ledger).getByText('雨')).toBeInTheDocument();
    expect(within(ledger).getByText('rain')).toBeInTheDocument();
    expect(screen.getAllByText('good').length).toBeGreaterThan(0);
    expect(screen.getByText('86%')).toBeInTheDocument();
  });
});
