interface PaceSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const PaceSlider = ({ value, onChange, min = 3, max = 8 }: PaceSliderProps) => (
  <div className="panel-section">
    <div className="section-heading">
      <h3>Breathing pace</h3>
      <p className="section-subtitle">Set how many seconds you want to spend in each phase.</p>
    </div>
    <div className="pace-slider__control">
      <input
        type="range"
        min={min}
        max={max}
        step={0.5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="pace-slider__value">
        <span>{value.toFixed(1)} seconds</span>
        <span className="pace-slider__hint">per inhale • hold • exhale • hold</span>
      </div>
    </div>
  </div>
);
