interface SessionControlsProps {
  running: boolean;
  paused: boolean;
  completed: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export const SessionControls = ({ running, paused, completed, onPause, onResume, onStop }: SessionControlsProps) => (
  <div className="session-controls">
    {!completed && running && !paused && (
      <button type="button" className="control-button" onClick={onPause}>
        Pause
      </button>
    )}
    {!completed && running && paused && (
      <button type="button" className="control-button" onClick={onResume}>
        Resume
      </button>
    )}
    <button type="button" className="control-button" onClick={onStop}>
      {completed ? 'Finish session' : 'Stop'}
    </button>
  </div>
);
