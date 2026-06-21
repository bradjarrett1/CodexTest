import { createMockSrsApi } from './mockSrsApi';
import type {
  ApiEnvelope,
  AssessmentResult,
  Attempt,
  Concept,
  LearnedItem,
  LearnedItemStatsUpdate,
  LearnerProfile,
  SessionSummary,
  SrsState,
} from './types';

export interface SrsApi {
  getLearnerProfile(): Promise<LearnerProfile>;
  getDueItems(): Promise<LearnedItem[]>;
  getLearnedItems(): Promise<LearnedItem[]>;
  getLearnedItemsByCategory(): Promise<Record<string, LearnedItem[]>>;
  getLearnedItemDetail(conceptId: string): Promise<LearnedItem | null>;
  logAttempt(attempt: Attempt): Promise<Attempt>;
  upsertConcept(concept: Concept): Promise<Concept>;
  updateSrsState(state: SrsState): Promise<SrsState>;
  updateLearnedItemStats(conceptId: string, stats: LearnedItemStatsUpdate): Promise<SrsState>;
  getSessionSummary(): Promise<SessionSummary | null>;
  saveSessionSummary(summary: SessionSummary): Promise<SessionSummary>;
  saveAssessmentResult(result: AssessmentResult): Promise<AssessmentResult>;
}

export type DataMode = 'mock' | 'webhook';

const endpointKeys = {
  getLearnerProfile: 'VITE_GET_LEARNER_PROFILE_URL',
  getDueItems: 'VITE_GET_DUE_ITEMS_URL',
  getLearnedItems: 'VITE_GET_LEARNED_ITEMS_URL',
  getLearnedItemsByCategory: 'VITE_GET_LEARNED_ITEMS_BY_CATEGORY_URL',
  getLearnedItemDetail: 'VITE_GET_LEARNED_ITEM_DETAIL_URL',
  logAttempt: 'VITE_LOG_ATTEMPT_URL',
  upsertConcept: 'VITE_UPSERT_CONCEPT_URL',
  updateSrsState: 'VITE_UPDATE_SRS_STATE_URL',
  updateLearnedItemStats: 'VITE_UPDATE_LEARNED_ITEM_STATS_URL',
  getSessionSummary: 'VITE_GET_SESSION_SUMMARY_URL',
  saveSessionSummary: 'VITE_SAVE_SESSION_SUMMARY_URL',
  saveAssessmentResult: 'VITE_SAVE_ASSESSMENT_RESULT_URL',
} as const;

type EndpointName = keyof typeof endpointKeys;

const createWebhookApi = (env: ImportMetaEnv, learnerId: string): SrsApi => {
  const post = async <T>(name: EndpointName, payload: Record<string, unknown> = {}): Promise<T> => {
    const envKey = endpointKeys[name];
    const url = env[envKey as keyof ImportMetaEnv];
    if (!url || typeof url !== 'string') throw new Error(`Webhook mode requires ${envKey}.`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learnerId, requestId: crypto.randomUUID(), ...payload }),
    });
    if (!response.ok) throw new Error(`${name} failed with HTTP ${response.status}.`);
    const envelope = await response.json() as ApiEnvelope<T>;
    if (!envelope.ok || envelope.data === undefined) throw new Error(envelope.error?.message ?? `${name} returned no data.`);
    return envelope.data;
  };
  return {
    getLearnerProfile: () => post('getLearnerProfile'),
    getDueItems: () => post('getDueItems'),
    getLearnedItems: () => post('getLearnedItems'),
    getLearnedItemsByCategory: () => post('getLearnedItemsByCategory'),
    getLearnedItemDetail: (conceptId) => post('getLearnedItemDetail', { conceptId }),
    logAttempt: (attempt) => post('logAttempt', { attempt }),
    upsertConcept: (concept) => post('upsertConcept', { concept }),
    updateSrsState: (srsState) => post('updateSrsState', { srsState }),
    updateLearnedItemStats: (conceptId, stats) => post('updateLearnedItemStats', { conceptId, stats }),
    getSessionSummary: () => post('getSessionSummary'),
    saveSessionSummary: (summary) => post('saveSessionSummary', { summary }),
    saveAssessmentResult: (result) => post('saveAssessmentResult', { result }),
  };
};

export const dataMode: DataMode = import.meta.env.VITE_DATA_MODE === 'webhook' ? 'webhook' : 'mock';
export const learnerId = import.meta.env.VITE_LEARNER_ID || 'learner-demo-001';

export const srsApi: SrsApi = dataMode === 'webhook'
  ? createWebhookApi(import.meta.env, learnerId)
  : createMockSrsApi(learnerId);

export const generateSessionSummary = (
  attempts: Attempt[],
  reviewedConceptIds: string[],
  startedAt: string,
): SessionSummary => {
  const correct = attempts.filter((attempt) => attempt.result === 'correct');
  const missed = attempts.filter((attempt) => attempt.result !== 'correct');
  return {
    sessionId: crypto.randomUUID(),
    learnerId,
    startedAt,
    endedAt: new Date().toISOString(),
    conceptsReviewed: [...new Set(reviewedConceptIds)],
    conceptsIntroduced: [],
    mistakes: missed.map((attempt) => attempt.feedbackGiven),
    wins: correct.map((attempt) => `Correct: ${attempt.promptEnglish}`),
    nextSessionPlan: missed.length ? ['Retry missed concepts first', 'Keep the next session focused'] : ['Continue with the next due items'],
    advancedConceptsDeferred: [],
    notes: `${attempts.length} attempt${attempts.length === 1 ? '' : 's'} completed.`,
  };
};
