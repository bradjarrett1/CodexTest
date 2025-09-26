import type { BreathingSessionState, EnvironmentOption } from '../types';
import { BreathingAnimation } from './BreathingAnimation';
import { SessionControls } from './SessionControls';
import { formatTime } from '../utils/time';

interface SessionScreenProps {
  environment: EnvironmentOption;
  sessionState: BreathingSessionState;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

const phaseDescriptions: Record<BreathingSessionState['currentPhase'], string> = {
  inhale: 'Breathe in smoothly, letting the air fill your lungs.',
  hold: 'Hold gently and soften your shoulders.',
  exhale: 'Release the breath slowly and evenly.',
  hold2: 'Rest in the stillness before the next inhale.',
};

export const SessionScreen = ({ environment, sessionState, onPause, onResume, onStop }: SessionScreenProps) => {
  const progress = sessionState.totalDuration
    ? 1 - sessionState.sessionRemaining / sessionState.totalDuration
    : 0;

  return (
    <section className="session-screen" style={{ background: environment.background }}>
      <div className="session-screen__overlay" />
      <div className="session-screen__content">
        <header className="session-screen__header">
          <div className="session-screen__timer">
            <span className="session-screen__timer-label">Time remaining</span>
            <span className="session-screen__timer-value">{formatTime(sessionState.sessionRemaining)}</span>
          </div>
          <div className="session-screen__phase">
            <span className="session-screen__phase-label">Current phase</span>
            <span className="session-screen__phase-value">{sessionState.currentPhase}</span>
          </div>
        </header>

        <BreathingAnimation
          phase={sessionState.currentPhase}
          phaseDuration={sessionState.phaseDuration}
          phaseRemaining={sessionState.phaseRemaining}
        />

        <p className="session-screen__description">{phaseDescriptions[sessionState.currentPhase]}</p>

        <div className="session-progress">
          <div className="session-progress__bar">
            <div className="session-progress__fill" style={{ width: `${Math.min(progress, 1) * 100}%` }} />
          </div>
          <span className="session-progress__cycles">Cycles completed: {sessionState.cyclesCompleted}</span>
        </div>

        {sessionState.completed && (
          <div className="session-complete">
            <h2>Session complete</h2>
            <p>Take a moment to notice how you feel. You completed {sessionState.cyclesCompleted} full breathing cycles.</p>
          </div>
        )}

        <SessionControls
          running={sessionState.running}
          paused={sessionState.paused}
          completed={sessionState.completed}
          onPause={onPause}
          onResume={onResume}
          onStop={onStop}
        />
      </div>
    </section>
  );
};
