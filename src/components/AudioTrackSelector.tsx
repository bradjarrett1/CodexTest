import type { AmbientTrackOption } from '../types';

interface AudioTrackSelectorProps {
  tracks: AmbientTrackOption[];
  selectedId: string;
  onSelect: (trackId: string) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export const AudioTrackSelector = ({ tracks, selectedId, onSelect, volume, onVolumeChange }: AudioTrackSelectorProps) => (
  <div className="panel-section">
    <div className="section-heading">
      <h3>Ambient audio</h3>
      <p className="section-subtitle">Find a soundscape that helps you settle into the rhythm.</p>
    </div>
    <div className="audio-track-list">
      {tracks.map((track) => {
        const isActive = selectedId === track.id;
        return (
          <button
            key={track.id}
            type="button"
            className={`audio-track ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(track.id)}
          >
            <span className="audio-track__name">{track.name}</span>
            <span className="audio-track__description">{track.description}</span>
          </button>
        );
      })}
    </div>
    <label className="volume-slider" htmlFor="volume-control">
      Volume
      <input
        id="volume-control"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(event) => onVolumeChange(Number(event.target.value))}
      />
    </label>
  </div>
);
