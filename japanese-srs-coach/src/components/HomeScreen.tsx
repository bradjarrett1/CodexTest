import type { LearnedItem, LearnerProfile, SessionSummary } from '../lib/types';
import { AssessmentPanel } from './AssessmentPanel';
import { DueItemsPanel } from './DueItemsPanel';
import { SessionSummaryPanel } from './SessionSummaryPanel';

export function HomeScreen({
  profile, dueItems, summary, loading, navigate, refresh,
}: {
  profile: LearnerProfile;
  dueItems: LearnedItem[];
  summary: SessionSummary | null;
  loading: boolean;
  navigate: (tab: string) => void;
  refresh: () => void;
}) {
  return (
    <section className="screen home-screen">
      <header className="hero">
        <p className="eyebrow">Focused Japanese, one step at a time</p>
        <h1>Japanese SRS Coach</h1>
        <p>Practice speaking first, keep Romaji visible, and review what matters before adding more.</p>
        <div className="hero-actions">
          <button className="button button--primary button--large" onClick={() => navigate('practice')}>Start voice practice</button>
          <button className="button button--secondary" onClick={() => navigate('practice')}>Start text practice</button>
        </div>
      </header>
      <DueItemsPanel items={dueItems} loading={loading} />
      <section className="panel current-step">
        <p className="eyebrow">Current curriculum step</p>
        <h2>{profile.currentCurriculumStep}</h2>
        <p>{profile.currentEstimatedLevel} · {profile.preferredSessionLengthMinutes}-minute sessions</p>
        <button className="button button--text" onClick={() => navigate('curriculum')}>See the learning path</button>
      </section>
      <AssessmentPanel profile={profile} onCompleted={refresh} />
      <SessionSummaryPanel summary={summary} />
      <button className="learned-link" onClick={() => navigate('learned')}><span>Open your learned-items library</span><span aria-hidden="true">→</span></button>
    </section>
  );
}
