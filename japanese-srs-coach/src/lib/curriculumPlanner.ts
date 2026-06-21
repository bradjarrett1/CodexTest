import curriculumJson from '../data/curriculum/japaneseCurriculum.v1.json';
import type { AssessmentResult, CurriculumData, CurriculumModule, CurriculumPhase, LearnerProfile } from './types';

export const curriculum = curriculumJson as CurriculumData;
export const allCurriculumModules = curriculum.phases.flatMap((phase) => phase.modules);

export interface CurriculumView {
  currentPhase: CurriculumPhase;
  currentModule: CurriculumModule;
  upcomingModules: CurriculumModule[];
  lockedModules: CurriculumModule[];
  reason: string;
}

export const getCurriculumModule = (moduleId: string): CurriculumModule | undefined =>
  allCurriculumModules.find((module) => module.moduleId === moduleId);

export const planCurriculum = (
  profile: LearnerProfile,
  assessment?: AssessmentResult | null,
): CurriculumView => {
  const requestedId = assessment?.recommendedCurriculumStep ?? profile.currentCurriculumStep;
  const currentIndex = Math.max(0, allCurriculumModules.findIndex((module) => module.moduleId === requestedId));
  const currentModule = allCurriculumModules[currentIndex];
  const currentPhase = curriculum.phases.find((phase) => phase.modules.some((module) => module.moduleId === currentModule.moduleId))
    ?? curriculum.phases[0];
  const priorities = assessment?.curriculumPriorities ?? profile.curriculumPriorities ?? [];
  return {
    currentPhase,
    currentModule,
    upcomingModules: allCurriculumModules.slice(currentIndex + 1, currentIndex + 3),
    lockedModules: allCurriculumModules.slice(currentIndex + 3),
    reason: priorities.length
      ? `This step reinforces your current priorities: ${priorities.join(', ')}.`
      : `This step builds the prerequisite skills for ${allCurriculumModules[currentIndex + 1]?.title ?? 'independent beginner conversation'}.`,
  };
};
