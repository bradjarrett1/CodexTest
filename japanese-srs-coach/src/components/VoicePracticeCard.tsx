import { useEffect, useState } from 'react';
import { vapiClient, type TranscriptEvent, type VoiceCallStatus } from '../lib/vapiClient';
import type { LearnedItem } from '../lib/types';

export function VoicePracticeCard({ currentItem }: { currentItem?: LearnedItem }) {
  const [status, setStatus] = useState<VoiceCallStatus>(vapiClient.getStatus());
  const [transcript, setTranscript] = useState<TranscriptEvent[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const offStatus = vapiClient.on('status', setStatus);
    const offTranscript = vapiClient.on('transcript', (event) => setTranscript((current) => [...current, event]));
    const offError = vapiClient.on('error', (event) => setError(event.message));
    return () => { offStatus(); offTranscript(); offError(); };
  }, []);

  const active = status === 'active' || status === 'connecting';
  return (
    <article className="panel practice-card">
      <div className="panel__heading-row"><div><p className="eyebrow">Preferred mode</p><h2>Voice practice</h2></div><span className={`call-dot call-dot--${status}`}>{status}</span></div>
      <p><strong>Mode:</strong> Focused due-item review</p>
      <p><strong>Current concept:</strong> {currentItem ? `${currentItem.romaji} — ${currentItem.english}` : 'Waiting for a due item'}</p>
      <button className={`button ${active ? 'button--danger' : 'button--primary'} button--full`} onClick={() => active ? vapiClient.stop() : vapiClient.start()} disabled={status === 'stopping'}>
        {active ? 'Stop voice session' : 'Start voice session'}
      </button>
      <p className="integration-note">{vapiClient.isConfigured() ? 'Vapi credentials detected; the SDK adapter is the remaining connection step.' : 'Mock voice mode. Add Vapi credentials later without changing the UI.'}</p>
      <div className="transcript" aria-live="polite">
        <strong>Transcript</strong>
        {transcript.length ? transcript.map((line, index) => <p key={`${line.role}-${index}`}><span>{line.role}:</span> {line.text}</p>) : <p className="muted">Transcript events will appear here.</p>}
      </div>
      {error && <p className="error-message" role="alert">{error}</p>}
    </article>
  );
}
