import { planCurriculum } from '../lib/curriculumPlanner';
import type { LearnerProfile } from '../lib/types';

export function CurriculumPanel({ profile }: { profile: LearnerProfile }) {
  const view = planCurriculum(profile);
  return (
    <section className="screen" aria-labelledby="curriculum-title">
      <header className="screen-header">
        <p className="eyebrow">Slow, can-do progression</p>
        <h1 id="curriculum-title">Curriculum</h1>
        <p>Progress is based on tasks you can perform—not the number of words you have seen.</p>
      </header>
      <article className="panel current-module">
        <span className="phase-label">{view.currentPhase.title}</span>
        <h2>{view.currentModule.title}</h2>
        <p>{view.currentModule.canDoGoal}</p>
        <p className="callout"><strong>Why now:</strong> {view.reason}</p>
        <h3>Prerequisites</h3>
        <p>{view.currentModule.prerequisites.length ? view.currentModule.prerequisites.join(', ') : 'Start here—no prerequisites.'}</p>
        <h3>Mastery means</h3>
        <ul>{view.currentModule.masteryCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul>
        <small>Estimated: {view.currentModule.estimatedSessions} focused sessions</small>
      </article>
      <section className="panel">
        <h2>Coming next</h2>
        <div className="module-list">
          {view.upcomingModules.map((module) => <article key={module.moduleId}><span>Next</span><strong>{module.title}</strong><small>{module.canDoGoal}</small></article>)}
          {view.lockedModules.map((module) => <article className="module--locked" key={module.moduleId}><span aria-hidden="true">Locked</span><strong>{module.title}</strong><small>Unlock after {module.lockedUntil}</small></article>)}
        </div>
      </section>
    </section>
  );
}
