interface SpeechToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const SpeechToggle = ({ enabled, onToggle }: SpeechToggleProps) => (
  <div className="panel-section">
    <div className="section-heading">
      <h3>Guided prompts</h3>
      <p className="section-subtitle">Hear gentle spoken cues for each breathing phase.</p>
    </div>
    <label className="toggle-control">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(event) => onToggle(event.target.checked)}
      />
      <span>{enabled ? 'Spoken prompts enabled' : 'Muted'}</span>
    </label>
  </div>
);
