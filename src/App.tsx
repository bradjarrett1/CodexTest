import { useEffect, useMemo, useState } from 'react';
import { environments } from './data/environments';
import { ambientTracks } from './data/audioTracks';
import { sessionDurationOptions } from './data/sessionDurations';
import { EnvironmentSelector } from './components/EnvironmentSelector';
import { AudioTrackSelector } from './components/AudioTrackSelector';
import { PaceSlider } from './components/PaceSlider';
import { DurationSelector } from './components/DurationSelector';
import { SpeechToggle } from './components/SpeechToggle';
import { SessionScreen } from './components/SessionScreen';
import { useBreathingSession } from './hooks/useBreathingSession';
import { useAmbientAudio } from './audio/useAmbientAudio';
import { stopSpeech, useSpeechPrompts } from './hooks/useSpeechPrompts';
import './App.css';

const PHASE_DURATION_DEFAULT = 4;
const SESSION_DURATION_DEFAULT = sessionDurationOptions[1]?.seconds ?? 300;

export default function App() {
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(environments[0]?.id ?? 'aurora-night');
  const [selectedTrackId, setSelectedTrackId] = useState(ambientTracks[0]?.id ?? 'gentle-hum');
  const [volume, setVolume] = useState(0.45);
  const [phaseDuration, setPhaseDuration] = useState(PHASE_DURATION_DEFAULT);
  const [sessionDuration, setSessionDuration] = useState(SESSION_DURATION_DEFAULT);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  const { state: sessionState, startSession, pauseSession, resumeSession, stopSession } = useBreathingSession();
  const { setTrack, setVolume: setAmbientVolume, stop: stopAudio, pause: pauseAudio, resume: resumeAudio } = useAmbientAudio();

  const environment = useMemo(
    () => environments.find((item) => item.id === selectedEnvironmentId) ?? environments[0],
    [selectedEnvironmentId],
  );
  const isSessionActive = sessionState.running || sessionState.paused;

  useSpeechPrompts(speechEnabled && sessionState.running && !sessionState.completed, sessionState.currentPhase, sessionState.paused);

  useEffect(() => {
    if (sessionState.running && !sessionState.paused && !sessionState.completed) {
      setTrack(selectedTrackId, volume);
    }
    if (!sessionState.running && !sessionState.paused) {
      stopAudio();
    }
  }, [sessionState.running, sessionState.paused, sessionState.completed, selectedTrackId, stopAudio, setTrack, volume]);

  useEffect(() => {
    if (sessionState.running && !sessionState.paused && !sessionState.completed) {
      setAmbientVolume(volume);
    }
  }, [sessionState.running, sessionState.paused, sessionState.completed, setAmbientVolume, volume]);

  const handleStartSession = async () => {
    if (sessionDuration <= 0) {
      return;
    }
    startSession({
      phaseDurationSeconds: phaseDuration,
      sessionDurationSeconds: sessionDuration,
    });
    if (selectedTrackId !== 'silence') {
      await setTrack(selectedTrackId, volume);
    } else {
      stopAudio();
    }
  };

  const handlePause = () => {
    pauseSession();
    pauseAudio();
  };

  const handleResume = async () => {
    resumeSession();
    await resumeAudio();
  };

  const handleStop = () => {
    stopSession();
    stopAudio();
    stopSpeech();
  };

  return (
    <div className="app" style={{ ['--environment-gradient' as string]: environment.background }}>
      <div className="app__backdrop" />
      <main className="app__layout">
        <aside className="setup-panel">
          <header className="setup-header">
            <h1>Box Breathing Studio</h1>
            <p>Craft a calming breathing journey with immersive visuals, soundscapes, and guidance.</p>
          </header>

          <EnvironmentSelector
            environments={environments}
            selectedId={selectedEnvironmentId}
            onSelect={setSelectedEnvironmentId}
          />

          <AudioTrackSelector
            tracks={ambientTracks}
            selectedId={selectedTrackId}
            onSelect={setSelectedTrackId}
            volume={volume}
            onVolumeChange={setVolume}
          />

          <DurationSelector
            options={sessionDurationOptions}
            selectedSeconds={sessionDuration}
            onSelect={setSessionDuration}
          />

          <PaceSlider value={phaseDuration} onChange={setPhaseDuration} />

          <SpeechToggle enabled={speechEnabled} onToggle={setSpeechEnabled} />

          <button
            type="button"
            className="primary-start-button"
            onClick={handleStartSession}
            disabled={sessionState.running && !sessionState.paused}
          >
            {isSessionActive ? 'Restart session' : 'Begin breathing session'}
          </button>
        </aside>

        <section className="experience-preview">
          {!isSessionActive && (
            <div className="experience-preview__placeholder" style={{ background: environment.background }}>
              <div className="experience-preview__overlay" />
              <div className="experience-preview__content">
                <h2>{environment.name}</h2>
                <p>{environment.description}</p>
                <p className="experience-preview__hint">Press “Begin breathing session” when you are ready.</p>
              </div>
            </div>
          )}

          {(isSessionActive || sessionState.completed) && (
            <SessionScreen
              environment={environment}
              sessionState={sessionState}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
            />
          )}
        </section>
      </main>
    </div>
  );
}
