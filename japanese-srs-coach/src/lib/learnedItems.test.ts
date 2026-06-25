import { describe, expect, it } from 'vitest';
import { calculateAccuracy, calculateFamiliarity, groupLearnedItemsByCategory, searchLearnedItems, sortByMostRecent } from './learnedItems';
import type { LearnedItem } from './types';

const item = (overrides: Partial<LearnedItem>): LearnedItem => ({
  conceptId: 'one', type: 'vocab', romaji: 'mizu', kana: 'みず', fullJapanese: '水', english: 'water',
  explanation: '', mnemonic: '', category: 'Drinks', tags: ['drink'], learnedAt: '2026-01-01T00:00:00Z',
  lastReviewedAt: null, status: 'learning', timesSeen: 1, timesCorrect: 1, timesWrong: 0, timesPartial: 0,
  lastResult: 'correct', accuracyPercent: 100, familiarityLevel: 'low', srsPriority: 2,
  nextDue: null, isDue: false, ...overrides,
});

describe('learned item helpers', () => {
  it('calculates accuracy and every familiarity boundary', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
    expect(calculateAccuracy(7, 5)).toBe(71);
    expect(calculateFamiliarity(2, 100)).toBe('low');
    expect(calculateFamiliarity(3, 40)).toBe('fairly well');
    expect(calculateFamiliarity(5, 60)).toBe('well');
    expect(calculateFamiliarity(7, 75)).toBe('good');
    expect(calculateFamiliarity(10, 85)).toBe('great');
    expect(calculateFamiliarity(15, 95)).toBe('pro');
  });

  it('searches every ledger/category/tag/type field and filters type', () => {
    const grammar = item({ conceptId: 'two', type: 'grammar', romaji: 'wa', kana: 'は', fullJapanese: 'は（助詞）', english: 'topic marker', category: 'Particles', tags: ['topic'] });
    const items = [item({}), grammar];
    expect(searchLearnedItems(items, '水', 'all')).toHaveLength(1);
    expect(searchLearnedItems(items, 'particles', 'all')).toEqual([grammar]);
    expect(searchLearnedItems(items, 'topic', 'grammar')).toEqual([grammar]);
    expect(searchLearnedItems(items, '', 'vocab')).toHaveLength(1);
  });

  it('sorts recent first and groups in canonical order', () => {
    const weather = item({ conceptId: 'weather', category: 'Weather', learnedAt: '2026-03-01T00:00:00Z' });
    const drinks = item({ conceptId: 'drink', category: 'Drinks', learnedAt: '2026-02-01T00:00:00Z' });
    expect(sortByMostRecent([drinks, weather])[0].conceptId).toBe('weather');
    expect(Object.keys(groupLearnedItemsByCategory([weather, drinks]))).toEqual(['Drinks', 'Weather']);
  });
});
