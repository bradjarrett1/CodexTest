import type { SessionDurationOption } from '../data/sessionDurations';

interface DurationSelectorProps {
  options: SessionDurationOption[];
  selectedSeconds: number;
  onSelect: (seconds: number) => void;
}

export const DurationSelector = ({ options, selectedSeconds, onSelect }: DurationSelectorProps) => (
  <div className="panel-section">
    <div className="section-heading">
      <h3>Session length</h3>
      <p className="section-subtitle">Pick how long you’d like to stay with your breath.</p>
    </div>
    <div className="duration-options">
      {options.map((option) => {
        const isActive = option.seconds === selectedSeconds;
        return (
          <button
            key={option.id}
            type="button"
            className={`duration-option ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(option.seconds)}
          >
            {option.label}
          </button>
        );
      })}
      <label className="duration-option duration-option--custom">
        <span>Custom</span>
        <input
          type="number"
          min={1}
          max={60}
          placeholder="Minutes"
          onChange={(event) => {
            const minutes = Number(event.target.value);
            if (Number.isFinite(minutes) && minutes > 0) {
              onSelect(minutes * 60);
            }
          }}
        />
      </label>
    </div>
  </div>
);
