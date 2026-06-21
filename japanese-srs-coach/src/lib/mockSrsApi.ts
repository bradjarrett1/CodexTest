import vocabularyJson from '../data/curriculum/coreVocabulary.v1.json';
import grammarJson from '../data/curriculum/beginnerGrammarMap.v1.json';
import { assertFourPartLedger, groupLearnedItemsByCategory } from './learnedItems';
import { createSrsState, getLearningStatus, isStateDue, scheduleSrsAttempt } from './srsScheduler';
import type {
  AssessmentResult,
  Attempt,
  Concept,
  ConceptType,
  LearnedItem,
  LearnedItemStatsUpdate,
  LearnerProfile,
  SessionSummary,
  SrsState,
} from './types';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface SeedConcept {
  conceptId: string;
  type: ConceptType;
  romaji: string;
  kana: string;
  fullJapanese: string;
  english: string;
  explanation: string;
  mnemonic: string;
  category: string;
  tags: string[];
}

interface MockSnapshot {
  version: 1;
  profile: LearnerProfile;
  concepts: Record<string, Concept>;
  srsStates: Record<string, SrsState>;
  attempts: Attempt[];
  sessions: SessionSummary[];
  assessmentResult: AssessmentResult | null;
}

const STORAGE_KEY = 'japanese-srs-coach:mock-db:v1';
const seedConcepts = [...vocabularyJson, ...grammarJson] as SeedConcept[];

const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const buildSeedSnapshot = (learnerId: string): MockSnapshot => {
  const concepts: Record<string, Concept> = {};
  const srsStates: Record<string, SrsState> = {};
  seedConcepts.forEach((seed, index) => {
    const timesSeen = index % 6 === 0 ? 15 : (index % 5) + 1;
    const timesCorrect = index % 6 === 0 ? 15 : Math.max(0, timesSeen - (index % 3));
    const timesWrong = Math.max(0, timesSeen - timesCorrect - (index % 2));
    const timesPartial = Math.max(0, timesSeen - timesCorrect - timesWrong);
    const base = createSrsState(seed.conceptId, learnerId);
    const accuracyPercent = timesSeen ? Math.round((timesCorrect / timesSeen) * 100) : 0;
    const state: SrsState = {
      ...base,
      lastSeen: daysAgo(index % 8),
      nextDue: index % 3 === 0 ? daysAgo(0) : daysAgo(-((index % 5) + 1)),
      intervalDays: (index % 5) + 1,
      correctCount: timesCorrect,
      wrongCount: timesWrong,
      partialCount: timesPartial,
      timesSeen,
      timesCorrect,
      timesWrong,
      timesPartial,
      priority: index % 3 === 0 ? 4 : 2,
      isDue: index % 3 === 0,
      lastResult: timesWrong > 0 ? 'wrong' : 'correct',
      accuracyPercent,
      familiarityLevel: timesSeen >= 15 && accuracyPercent >= 95 ? 'pro' : timesSeen >= 7 && accuracyPercent >= 75 ? 'good' : timesSeen >= 5 && accuracyPercent >= 60 ? 'well' : timesSeen >= 3 && accuracyPercent >= 40 ? 'fairly well' : 'low',
    };
    srsStates[seed.conceptId] = state;
    concepts[seed.conceptId] = {
      ...seed,
      examples: [{ romaji: seed.romaji, kana: seed.kana, fullJapanese: seed.fullJapanese, english: seed.english }],
      difficultyLevel: Math.min(5, 1 + Math.floor(index / 6)),
      introducedAt: daysAgo(35 - index),
      learnedAt: daysAgo(index),
      lastReviewedAt: state.lastSeen,
      status: getLearningStatus(state),
      timesSeen,
      timesCorrect,
      timesWrong,
      timesPartial,
      lastResult: state.lastResult,
      accuracyPercent,
      familiarityLevel: state.familiarityLevel,
      srsPriority: state.priority,
      nextDue: state.nextDue,
      isDue: state.isDue,
    };
  });
  const now = new Date().toISOString();
  return {
    version: 1,
    profile: {
      learnerId,
      displayName: 'Japanese Learner',
      currentEstimatedLevel: 'Absolute beginner',
      romajiRequired: true,
      kanaKnowledgeLevel: 'none',
      kanjiKnowledgeLevel: 'none',
      speakingConfidence: 2,
      listeningConfidence: 2,
      grammarConfidence: 1,
      preferredSessionLengthMinutes: 10,
      currentCurriculumStep: 'phase-0-orientation',
      longTermGoal: 'Hold comfortable everyday conversations in Japanese.',
      knownConstraints: ['Always show Romaji and English', 'Introduce only a few new concepts per session'],
      assessmentStatus: 'not_started',
      createdAt: now,
      updatedAt: now,
    },
    concepts,
    srsStates,
    attempts: [],
    sessions: [{
      sessionId: 'session-seed', learnerId, startedAt: daysAgo(2), endedAt: daysAgo(2),
      conceptsReviewed: ['vocab-mizu', 'vocab-ocha'], conceptsIntroduced: ['vocab-kouhii'],
      mistakes: ['Long vowel timing in kouhii'], wins: ['Remembered mizu without a hint'],
      nextSessionPlan: ['Review drinks', 'Practice one o-particle sentence'], advancedConceptsDeferred: [],
      notes: 'Short first review with good focus.',
    }],
    assessmentResult: null,
  };
};

class MemoryStorage implements StorageLike {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const defaultStorage = (): StorageLike => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  } catch {
    // Fall back to memory when storage is unavailable.
  }
  return new MemoryStorage();
};

const toLearnedItem = (concept: Concept): LearnedItem => {
  const { examples: _examples, difficultyLevel: _difficulty, introducedAt: _introduced, ...item } = concept;
  return item;
};

export const createMockSrsApi = (learnerId = 'learner-demo-001', storage: StorageLike = defaultStorage()) => {
  const read = (): MockSnapshot => {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as MockSnapshot;
        if (parsed.version === 1) return parsed;
      } catch {
        // Replace corrupt mock data with a known-good seed.
      }
    }
    const seed = buildSeedSnapshot(learnerId);
    storage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  };
  const write = (snapshot: MockSnapshot) => storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  const syncConcept = (concept: Concept, state: SrsState): Concept => ({
    ...concept,
    lastReviewedAt: state.lastSeen,
    status: getLearningStatus(state),
    timesSeen: state.timesSeen,
    timesCorrect: state.timesCorrect,
    timesWrong: state.timesWrong,
    timesPartial: state.timesPartial,
    lastResult: state.lastResult,
    accuracyPercent: state.accuracyPercent,
    familiarityLevel: state.familiarityLevel,
    srsPriority: state.priority,
    nextDue: state.nextDue,
    isDue: state.isDue,
  });

  return {
    async getLearnerProfile() { return read().profile; },
    async getDueItems() {
      const snapshot = read();
      return Object.values(snapshot.concepts)
        .filter((concept) => isStateDue(snapshot.srsStates[concept.conceptId]))
        .sort((a, b) => b.srsPriority - a.srsPriority)
        .map(toLearnedItem);
    },
    async getLearnedItems() { return Object.values(read().concepts).map(toLearnedItem); },
    async getLearnedItemsByCategory() {
      return groupLearnedItemsByCategory(Object.values(read().concepts).map(toLearnedItem));
    },
    async getLearnedItemDetail(conceptId: string) {
      const concept = read().concepts[conceptId];
      return concept ? toLearnedItem(concept) : null;
    },
    async logAttempt(attempt: Attempt) {
      const snapshot = read();
      if (!snapshot.attempts.some((item) => item.attemptId === attempt.attemptId)) snapshot.attempts.push(attempt);
      write(snapshot);
      return attempt;
    },
    async upsertConcept(concept: Concept) {
      assertFourPartLedger(concept);
      const snapshot = read();
      snapshot.concepts[concept.conceptId] = concept;
      snapshot.srsStates[concept.conceptId] ??= createSrsState(concept.conceptId, learnerId);
      write(snapshot);
      return concept;
    },
    async updateSrsState(state: SrsState) {
      const snapshot = read();
      snapshot.srsStates[state.conceptId] = state;
      if (snapshot.concepts[state.conceptId]) snapshot.concepts[state.conceptId] = syncConcept(snapshot.concepts[state.conceptId], state);
      write(snapshot);
      return state;
    },
    async updateLearnedItemStats(conceptId: string, update: LearnedItemStatsUpdate) {
      const snapshot = read();
      const concept = snapshot.concepts[conceptId];
      if (!concept) throw new Error(`Unknown concept: ${conceptId}`);
      const current = snapshot.srsStates[conceptId] ?? createSrsState(conceptId, learnerId);
      const state = scheduleSrsAttempt(current, update.result, {
        now: update.occurredAt,
        correctedAfterRetry: update.correctedAfterRetry,
        conceptType: concept.type,
      });
      snapshot.srsStates[conceptId] = state;
      snapshot.concepts[conceptId] = syncConcept(concept, state);
      write(snapshot);
      return state;
    },
    async getSessionSummary() {
      const sessions = read().sessions;
      return sessions.length ? sessions[sessions.length - 1] : null;
    },
    async saveSessionSummary(summary: SessionSummary) {
      const snapshot = read();
      const index = snapshot.sessions.findIndex((item) => item.sessionId === summary.sessionId);
      if (index >= 0) snapshot.sessions[index] = summary; else snapshot.sessions.push(summary);
      write(snapshot);
      return summary;
    },
    async saveAssessmentResult(result: AssessmentResult) {
      const snapshot = read();
      snapshot.assessmentResult = result;
      snapshot.profile = {
        ...snapshot.profile,
        currentEstimatedLevel: result.estimatedLevel,
        currentCurriculumStep: result.recommendedCurriculumStep,
        assessmentStatus: 'completed',
        assessmentStrengths: result.strengths,
        assessmentWeaknesses: result.weaknesses,
        curriculumPriorities: result.curriculumPriorities,
        assessmentCompletedAt: result.completedAt,
        updatedAt: result.completedAt,
      };
      write(snapshot);
      return result;
    },
  };
};

export type MockSrsApi = ReturnType<typeof createMockSrsApi>;
