import type { EnvironmentOption } from '../types';

interface EnvironmentSelectorProps {
  environments: EnvironmentOption[];
  selectedId: string;
  onSelect: (environmentId: string) => void;
}

export const EnvironmentSelector = ({ environments, selectedId, onSelect }: EnvironmentSelectorProps) => (
  <div className="panel-section">
    <div className="section-heading">
      <h3>Background environments</h3>
      <p className="section-subtitle">Choose the scene that matches the mood you need today.</p>
    </div>
    <div className="environment-grid">
      {environments.map((environment) => {
        const isActive = selectedId === environment.id;
        return (
          <button
            key={environment.id}
            type="button"
            className={`environment-card ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(environment.id)}
            style={{ backgroundImage: environment.background }}
          >
            <div className="environment-card__overlay" />
            <span className="environment-card__title">{environment.name}</span>
            <span className="environment-card__description">{environment.description}</span>
          </button>
        );
      })}
    </div>
  </div>
);
