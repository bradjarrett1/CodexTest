import { calculateAccuracy, calculateFamiliarity } from './learnedItems';
import type { AttemptResult, ConceptType, LearningStatus, SrsState } from './types';

const addDays = (iso: string, days: number): string => {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
};

export const createSrsState = (conceptId: string, learnerId: string): SrsState => ({
  conceptId,
  learnerId,
  lastSeen: null,
  nextDue: new Date().toISOString(),
  intervalDays: 0,
  ease: 2.5,
  correctCount: 0,
  wrongCount: 0,
  partialCount: 0,
  timesSeen: 0,
  timesCorrect: 0,
  timesWrong: 0,
  timesPartial: 0,
  priority: 3,
  isDue: true,
  lastResult: null,
  accuracyPercent: 0,
  familiarityLevel: 'low',
});

export interface ScheduleOptions {
  now?: string;
  correctedAfterRetry?: boolean;
  conceptType?: ConceptType;
}

export const scheduleSrsAttempt = (
  current: SrsState,
  result: AttemptResult,
  options: ScheduleOptions = {},
): SrsState => {
  const now = options.now ?? new Date().toISOString();
  const treatedResult = result === 'skipped' ? 'wrong' : result;
  const timesSeen = current.timesSeen + 1;
  const timesCorrect = current.timesCorrect + (treatedResult === 'correct' ? 1 : 0);
  const timesWrong = current.timesWrong + (treatedResult === 'wrong' ? 1 : 0);
  const timesPartial = current.timesPartial + (treatedResult === 'partial' ? 1 : 0);
  const accuracyPercent = calculateAccuracy(timesSeen, timesCorrect);
  const familiarityLevel = calculateFamiliarity(timesSeen, accuracyPercent);

  if (options.conceptType === 'advanced_early') {
    return {
      ...current,
      lastSeen: now,
      nextDue: null,
      intervalDays: 0,
      timesSeen,
      timesCorrect,
      timesWrong,
      timesPartial,
      correctCount: timesCorrect,
      wrongCount: timesWrong,
      partialCount: timesPartial,
      priority: 1,
      isDue: false,
      lastResult: result,
      accuracyPercent,
      familiarityLevel,
    };
  }

  let intervalDays = 1;
  let priority = 4;
  let isDue = false;
  if (treatedResult === 'wrong') {
    priority = 5;
    isDue = true;
  } else if (treatedResult === 'partial') {
    priority = 4;
  } else if (timesCorrect >= 5 && accuracyPercent >= 85) {
    intervalDays = Math.max(14, current.intervalDays * 2 || 14);
    priority = 1;
  } else if (options.correctedAfterRetry) {
    intervalDays = 2;
    priority = 3;
  } else {
    intervalDays = 5;
    priority = 2;
  }

  return {
    ...current,
    lastSeen: now,
    nextDue: addDays(now, intervalDays),
    intervalDays,
    ease: Math.max(1.3, current.ease + (treatedResult === 'correct' ? 0.05 : treatedResult === 'partial' ? -0.1 : -0.2)),
    correctCount: timesCorrect,
    wrongCount: timesWrong,
    partialCount: timesPartial,
    timesSeen,
    timesCorrect,
    timesWrong,
    timesPartial,
    priority,
    isDue,
    lastResult: result,
    accuracyPercent,
    familiarityLevel,
  };
};

export const getLearningStatus = (state: SrsState): LearningStatus => {
  if (state.timesSeen === 0) return 'new';
  if (state.timesSeen >= 15 && state.accuracyPercent >= 95) return 'mastered';
  if (state.timesSeen >= 7 && state.accuracyPercent >= 75) return 'familiar';
  if (state.timesSeen >= 3 && state.accuracyPercent >= 60) return 'review';
  return 'learning';
};

export const isStateDue = (state: SrsState, now = new Date()): boolean =>
  state.isDue || Boolean(state.nextDue && Date.parse(state.nextDue) <= now.getTime());
