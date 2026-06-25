import { describe, expect, it } from 'vitest';
import { planCurriculum } from './curriculumPlanner';
import type { LearnerProfile } from './types';

const profile: LearnerProfile = {
  learnerId: 'l1', displayName: 'Learner', currentEstimatedLevel: 'Absolute beginner', romajiRequired: true,
  kanaKnowledgeLevel: 'none', kanjiKnowledgeLevel: 'none', speakingConfidence: 1, listeningConfidence: 1,
  grammarConfidence: 1, preferredSessionLengthMinutes: 10, currentCurriculumStep: 'phase-0-orientation',
  longTermGoal: 'Conversation', knownConstraints: [], createdAt: '', updatedAt: '',
};

describe('curriculum planner', () => {
  it('returns current, upcoming, and locked modules in prerequisite order', () => {
    const view = planCurriculum(profile);
    expect(view.currentModule.moduleId).toBe('phase-0-orientation');
    expect(view.upcomingModules[0].moduleId).toBe('phase-0-greetings');
    expect(view.lockedModules.length).toBeGreaterThan(0);
  });
});
