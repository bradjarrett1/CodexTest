import rubricJson from '../data/curriculum/assessmentRubric.v1.json';
import { answerSimilarity, normalizeAnswer } from './learnedItems';
import type {
  AssessmentQuestion,
  AssessmentResult,
  AssessmentState,
  EstimatedLevel,
} from './types';

const questions = rubricJson.questions as AssessmentQuestion[];

export const assessmentQuestions = questions;

export const createAssessmentState = (): AssessmentState => ({
  status: 'not_started',
  currentQuestionIndex: 0,
  answers: [],
  consecutiveFoundationalFailures: 0,
  startedAt: null,
});

export const startAssessment = (): AssessmentState => ({
  ...createAssessmentState(),
  status: 'in_progress',
  startedAt: new Date().toISOString(),
});

export const getCurrentAssessmentQuestion = (state: AssessmentState): AssessmentQuestion | null =>
  state.status === 'in_progress' ? questions[state.currentQuestionIndex] ?? null : null;

export const evaluateAssessmentAnswer = (
  answer: string,
  acceptedAnswers: string[],
): 'correct' | 'partial' | 'wrong' => {
  const normalized = normalizeAnswer(answer);
  if (!normalized) return 'wrong';
  if (acceptedAnswers.some((expected) => normalizeAnswer(expected) === normalized)) return 'correct';
  return acceptedAnswers.some((expected) => answerSimilarity(answer, expected) >= 0.7) ? 'partial' : 'wrong';
};

const scoreToLevel = (score: number): EstimatedLevel => {
  if (score <= 4) return 'Absolute beginner';
  if (score <= 8) return 'Beginner with memorized phrases';
  if (score <= 12) return 'Early A1-style beginner';
  if (score <= 16) return 'Late A1-style beginner';
  return 'Early A2-style learner';
};

const recommendedSteps: Record<EstimatedLevel, string> = {
  'Absolute beginner': 'phase-0-orientation',
  'Beginner with memorized phrases': 'phase-0-greetings',
  'Early A1-style beginner': 'phase-1-identity',
  'Late A1-style beginner': 'phase-2-actions',
  'Early A2-style learner': 'phase-3-plans',
};

export const buildAssessmentResult = (
  state: AssessmentState,
  learnerId: string,
  stoppedEarly = false,
): AssessmentResult => {
  const score = state.answers.reduce((total, answer) => total + (answer.result === 'correct' ? 2 : answer.result === 'partial' ? 1 : 0), 0);
  const estimatedLevel = stoppedEarly ? 'Absolute beginner' : scoreToLevel(score);
  const strengths = state.answers
    .filter((answer) => answer.result === 'correct')
    .map((answer) => questions.find((question) => question.questionId === answer.questionId)?.competency ?? answer.questionId);
  const weaknesses = state.answers
    .filter((answer) => answer.result !== 'correct')
    .map((answer) => questions.find((question) => question.questionId === answer.questionId)?.competency ?? answer.questionId);
  return {
    learnerId,
    estimatedLevel,
    score,
    maxScore: questions.length * 2,
    strengths: [...new Set(strengths)],
    weaknesses: [...new Set(weaknesses)],
    curriculumPriorities: [...new Set(weaknesses)].slice(0, 3),
    recommendedCurriculumStep: recommendedSteps[estimatedLevel],
    stoppedEarly,
    completedAt: new Date().toISOString(),
  };
};

export interface AssessmentSubmission {
  state: AssessmentState;
  result: AssessmentResult | null;
  answerResult: 'correct' | 'partial' | 'wrong';
}

export const submitAssessmentAnswer = (
  state: AssessmentState,
  answer: string,
  learnerId: string,
): AssessmentSubmission => {
  const question = getCurrentAssessmentQuestion(state);
  if (!question) throw new Error('No active assessment question.');
  const answerResult = evaluateAssessmentAnswer(answer, question.acceptedAnswers);
  const foundationalFailure = question.difficulty === 1 && answerResult === 'wrong';
  const consecutiveFoundationalFailures = foundationalFailure
    ? state.consecutiveFoundationalFailures + 1
    : answerResult === 'correct'
      ? 0
      : state.consecutiveFoundationalFailures;
  const nextState: AssessmentState = {
    ...state,
    answers: [...state.answers, { questionId: question.questionId, userAnswer: answer, result: answerResult }],
    currentQuestionIndex: state.currentQuestionIndex + 1,
    consecutiveFoundationalFailures,
  };
  const stoppedEarly = consecutiveFoundationalFailures >= 2 && state.currentQuestionIndex < 3;
  const completed = stoppedEarly || nextState.currentQuestionIndex >= questions.length;
  if (!completed) return { state: nextState, result: null, answerResult };
  const completedState = { ...nextState, status: 'completed' as const };
  return { state: completedState, result: buildAssessmentResult(completedState, learnerId, stoppedEarly), answerResult };
};

const ASSESSMENT_STORAGE_KEY = 'japanese-srs-coach:assessment-state:v1';

export const loadAssessmentState = (): AssessmentState => {
  try {
    const stored = localStorage.getItem(ASSESSMENT_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as AssessmentState) : createAssessmentState();
  } catch {
    return createAssessmentState();
  }
};

export const persistAssessmentState = (state: AssessmentState): void => {
  try {
    localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable in private browsing; the active React state still works.
  }
};
