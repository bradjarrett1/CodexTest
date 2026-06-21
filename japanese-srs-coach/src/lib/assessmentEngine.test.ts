import { describe, expect, it } from 'vitest';
import { evaluateAssessmentAnswer, startAssessment, submitAssessmentAnswer } from './assessmentEngine';

describe('assessment engine', () => {
  it('accepts normalized answers and recognizes close partial answers', () => {
    expect(evaluateAssessmentAnswer('  OHAYOU   GOZAIMASU! ', ['ohayou gozaimasu'])).toBe('correct');
    expect(evaluateAssessmentAnswer('ohayo gozaimas', ['ohayou gozaimasu'])).toBe('partial');
  });

  it('stops early after two foundational failures', () => {
    let state = startAssessment();
    const first = submitAssessmentAnswer(state, 'no idea', 'learner');
    state = first.state;
    const second = submitAssessmentAnswer(state, 'still no idea', 'learner');
    expect(second.state.status).toBe('completed');
    expect(second.result).toMatchObject({ estimatedLevel: 'Absolute beginner', stoppedEarly: true, recommendedCurriculumStep: 'phase-0-orientation' });
  });
});
