export type ConceptType =
  | 'vocab'
  | 'grammar'
  | 'phrase'
  | 'pronunciation'
  | 'kana'
  | 'kanji'
  | 'side_question'
  | 'advanced_early';

export type LearningStatus = 'new' | 'learning' | 'review' | 'familiar' | 'mastered';
export type AttemptResult = 'correct' | 'partial' | 'wrong' | 'skipped';
export type FamiliarityLevel = 'low' | 'fairly well' | 'well' | 'good' | 'great' | 'pro';
export type EstimatedLevel =
  | 'Absolute beginner'
  | 'Beginner with memorized phrases'
  | 'Early A1-style beginner'
  | 'Late A1-style beginner'
  | 'Early A2-style learner';
export type KnowledgeLevel = 'none' | 'recognition' | 'basic' | 'functional';
export type ConfidenceRating = 1 | 2 | 3 | 4 | 5;

export interface FourPartLedger {
  romaji: string;
  kana: string;
  fullJapanese: string;
  english: string;
}

export interface ConceptExample extends FourPartLedger {}

export interface LearnerProfile {
  learnerId: string;
  displayName: string;
  currentEstimatedLevel: EstimatedLevel;
  romajiRequired: boolean;
  kanaKnowledgeLevel: KnowledgeLevel;
  kanjiKnowledgeLevel: KnowledgeLevel;
  speakingConfidence: ConfidenceRating;
  listeningConfidence: ConfidenceRating;
  grammarConfidence: ConfidenceRating;
  preferredSessionLengthMinutes: number;
  currentCurriculumStep: string;
  longTermGoal: string;
  knownConstraints: string[];
  assessmentStatus?: AssessmentStatus;
  assessmentStrengths?: string[];
  assessmentWeaknesses?: string[];
  curriculumPriorities?: string[];
  assessmentCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Concept extends FourPartLedger {
  conceptId: string;
  type: ConceptType;
  explanation: string;
  mnemonic: string;
  examples: ConceptExample[];
  category: string;
  tags: string[];
  difficultyLevel: number;
  introducedAt: string;
  learnedAt: string;
  lastReviewedAt: string | null;
  status: LearningStatus;
  timesSeen: number;
  timesCorrect: number;
  timesWrong: number;
  timesPartial: number;
  lastResult: AttemptResult | null;
  accuracyPercent: number;
  familiarityLevel: FamiliarityLevel;
  srsPriority: number;
  nextDue: string | null;
  isDue: boolean;
}

export type LearnedItem = Omit<Concept, 'examples' | 'difficultyLevel' | 'introducedAt'>;

export interface Attempt {
  attemptId: string;
  learnerId: string;
  conceptIds: string[];
  promptEnglish: string;
  expectedAnswers: string[];
  userTranscript: string;
  normalizedUserAnswer: string;
  result: AttemptResult;
  mistakeTypes: string[];
  feedbackGiven: string;
  retryRequired: boolean;
  timestamp: string;
}

export interface SrsState {
  conceptId: string;
  learnerId: string;
  lastSeen: string | null;
  nextDue: string | null;
  intervalDays: number;
  ease: number;
  correctCount: number;
  wrongCount: number;
  partialCount: number;
  timesSeen: number;
  timesCorrect: number;
  timesWrong: number;
  timesPartial: number;
  priority: number;
  isDue: boolean;
  lastResult: AttemptResult | null;
  accuracyPercent: number;
  familiarityLevel: FamiliarityLevel;
}

export interface SessionSummary {
  sessionId: string;
  learnerId: string;
  startedAt: string;
  endedAt: string;
  conceptsReviewed: string[];
  conceptsIntroduced: string[];
  mistakes: string[];
  wins: string[];
  nextSessionPlan: string[];
  advancedConceptsDeferred: string[];
  notes: string;
}

export interface CurriculumModule {
  moduleId: string;
  title: string;
  level: string;
  canDoGoal: string;
  prerequisites: string[];
  targetConcepts: string[];
  sampleDrills: Array<{ promptEnglish: string; expectedRomaji: string }>;
  masteryCriteria: string[];
  estimatedSessions: number;
  lockedUntil: string | null;
}

export interface CurriculumPhase {
  phaseId: string;
  title: string;
  description: string;
  modules: CurriculumModule[];
}

export interface CurriculumData {
  version: string;
  phases: CurriculumPhase[];
}

export type AssessmentStatus = 'not_started' | 'in_progress' | 'completed';
export type AssessmentCompetency =
  | 'greetings'
  | 'nouns'
  | 'verbs'
  | 'particles'
  | 'desire'
  | 'existence'
  | 'time'
  | 'sentence_order'
  | 'english_to_japanese'
  | 'japanese_to_english';

export interface AssessmentQuestion {
  questionId: string;
  competency: AssessmentCompetency;
  prompt: string;
  acceptedAnswers: string[];
  explanation: string;
  difficulty: number;
}

export interface AssessmentAnswer {
  questionId: string;
  userAnswer: string;
  result: Exclude<AttemptResult, 'skipped'>;
}

export interface AssessmentState {
  status: AssessmentStatus;
  currentQuestionIndex: number;
  answers: AssessmentAnswer[];
  consecutiveFoundationalFailures: number;
  startedAt: string | null;
}

export interface AssessmentResult {
  learnerId: string;
  estimatedLevel: EstimatedLevel;
  score: number;
  maxScore: number;
  strengths: string[];
  weaknesses: string[];
  curriculumPriorities: string[];
  recommendedCurriculumStep: string;
  stoppedEarly: boolean;
  completedAt: string;
}

export interface LearnedItemStatsUpdate {
  result: AttemptResult;
  occurredAt?: string;
  correctedAfterRetry?: boolean;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
}

export interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: ApiErrorPayload;
}
