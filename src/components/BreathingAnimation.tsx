import { useMemo } from 'react';
import type { BreathingPhase } from '../types';

interface BreathingAnimationProps {
  phase: BreathingPhase;
  phaseDuration: number;
  phaseRemaining: number;
}

const phaseStyles: Record<BreathingPhase, { label: string; scale: number; hue: number }> = {
  inhale: { label: 'Inhale', scale: 1.15, hue: 168 },
  hold: { label: 'Hold', scale: 1.2, hue: 196 },
  exhale: { label: 'Exhale', scale: 0.7, hue: 28 },
  hold2: { label: 'Hold', scale: 0.7, hue: 332 },
};

export const BreathingAnimation = ({ phase, phaseDuration, phaseRemaining }: BreathingAnimationProps) => {
  const style = useMemo(() => {
    const definition = phaseStyles[phase];
    return {
      transform: `scale(${definition.scale})`,
      transitionDuration: `${Math.max(phaseDuration, 0.1)}s`,
      boxShadow: `0 0 35px rgba(255, 255, 255, 0.28)`,
      background: `radial-gradient(circle at 50% 20%, rgba(255,255,255,0.35), rgba(255,255,255,0.08)), linear-gradient(180deg, hsla(${definition.hue}, 78%, 72%, 0.95) 0%, hsla(${definition.hue}, 78%, 48%, 0.9) 100%)`,
    };
  }, [phase, phaseDuration]);

  const progress = useMemo(() => {
    if (phaseDuration <= 0) {
      return 1;
    }
    return 1 - Math.min(phaseRemaining / phaseDuration, 1);
  }, [phaseRemaining, phaseDuration]);

  return (
    <div className="breathing-visual">
      <div className="breathing-box" style={style}>
        <div className="breathing-progress" style={{ transform: `scaleY(${progress})` }} />
      </div>
      <div className="breathing-phase-label">{phaseStyles[phase].label}</div>
      <div className="breathing-phase-time">{phaseRemaining.toFixed(1)}s</div>
    </div>
  );
};
