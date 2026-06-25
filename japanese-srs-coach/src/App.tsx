import { useCallback, useEffect, useState } from 'react';
import { CurriculumPanel } from './components/CurriculumPanel';
import { DebugPanel } from './components/DebugPanel';
import { HomeScreen } from './components/HomeScreen';
import { LearnedItemsPage } from './components/LearnedItemsPage';
import { SettingsPanel } from './components/SettingsPanel';
import { TextPracticeCard } from './components/TextPracticeCard';
import { VoicePracticeCard } from './components/VoicePracticeCard';
import { srsApi } from './lib/srsApi';
import type { LearnedItem, LearnerProfile, SessionSummary } from './lib/types';

type Tab = 'home' | 'practice' | 'learned' | 'curriculum' | 'debug';
const tabs: Array<{ id: Tab; label: string; icon: string }> = [
  { id: 'home', label: 'Home', icon: '⌂' }, { id: 'practice', label: 'Practice', icon: '●' },
  { id: 'learned', label: 'Learned', icon: '✓' }, { id: 'curriculum', label: 'Curriculum', icon: '◇' },
  { id: 'debug', label: 'Debug', icon: '⋯' },
];

const defaultProfile: LearnerProfile = {
  learnerId: 'learner-demo-001', displayName: 'Japanese Learner', currentEstimatedLevel: 'Absolute beginner',
  romajiRequired: true, kanaKnowledgeLevel: 'none', kanjiKnowledgeLevel: 'none', speakingConfidence: 2,
  listeningConfidence: 2, grammarConfidence: 1, preferredSessionLengthMinutes: 10,
  currentCurriculumStep: 'phase-0-orientation', longTermGoal: 'Everyday Japanese conversation',
  knownConstraints: ['Always show Romaji and English'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

const tabFromHash = (): Tab => {
  const value = window.location.hash.replace('#/', '') as Tab;
  return tabs.some((tab) => tab.id === value) ? value : 'home';
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(tabFromHash);
  const [profile, setProfile] = useState<LearnerProfile>(defaultProfile);
  const [dueItems, setDueItems] = useState<LearnedItem[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [nextProfile, nextDue, nextSummary] = await Promise.all([
        srsApi.getLearnerProfile(), srsApi.getDueItems(), srsApi.getSessionSummary(),
      ]);
      setProfile(nextProfile); setDueItems(nextDue); setSummary(nextSummary);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not load learner data.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    const onHashChange = () => setActiveTab(tabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (tab: string) => { window.location.hash = `/${tab}`; };

  return (
    <div className="app-shell">
      <main className="app-main">
        {error && <p className="error-message global-error" role="alert">{error}</p>}
        {activeTab === 'home' && <HomeScreen profile={profile} dueItems={dueItems} summary={summary} loading={loading} navigate={navigate} refresh={refresh} />}
        {activeTab === 'practice' && <section className="screen"><header className="screen-header"><p className="eyebrow">One prompt at a time</p><h1>Practice</h1><p>Voice and text share the same focused SRS structure.</p></header><div className="practice-grid"><VoicePracticeCard currentItem={dueItems[0]} /><TextPracticeCard onDataChanged={refresh} /></div></section>}
        {activeTab === 'learned' && <LearnedItemsPage />}
        {activeTab === 'curriculum' && <CurriculumPanel profile={profile} />}
        {activeTab === 'debug' && <section className="screen"><header className="screen-header"><p className="eyebrow">Developer tools</p><h1>Debug</h1><p>Inspect the active data adapter and future integrations.</p></header><DebugPanel /><SettingsPanel /></section>}
      </main>
      <nav className="bottom-nav" aria-label="Primary navigation">
        {tabs.map((tab) => <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} aria-current={activeTab === tab.id ? 'page' : undefined} onClick={() => navigate(tab.id)}><span aria-hidden="true">{tab.icon}</span><small>{tab.label}</small></button>)}
      </nav>
    </div>
  );
}
