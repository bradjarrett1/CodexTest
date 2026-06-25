import { describe, expect, it } from 'vitest';
import { createSrsState, scheduleSrsAttempt } from './srsScheduler';

describe('SRS scheduler', () => {
  const now = '2026-06-20T12:00:00.000Z';

  it('schedules wrong, retried, and confident answers deterministically', () => {
    const base = createSrsState('c1', 'l1');
    expect(scheduleSrsAttempt(base, 'wrong', { now })).toMatchObject({ intervalDays: 1, priority: 5, isDue: true });
    expect(scheduleSrsAttempt(base, 'correct', { now, correctedAfterRetry: true })).toMatchObject({ intervalDays: 2, priority: 3 });
    expect(scheduleSrsAttempt(base, 'correct', { now })).toMatchObject({ intervalDays: 5, priority: 2 });
  });

  it('moves established performance to fourteen days and defers advanced items', () => {
    const established = { ...createSrsState('c1', 'l1'), timesSeen: 4, timesCorrect: 4, correctCount: 4, accuracyPercent: 100 };
    expect(scheduleSrsAttempt(established, 'correct', { now }).intervalDays).toBe(14);
    const advanced = scheduleSrsAttempt(createSrsState('a1', 'l1'), 'wrong', { now, conceptType: 'advanced_early' });
    expect(advanced).toMatchObject({ nextDue: null, isDue: false, priority: 1 });
  });
});
