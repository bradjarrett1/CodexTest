export type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'hold2';

export interface SessionConfig {
  phaseDurationSeconds: number;
  sessionDurationSeconds: number;
}

export interface BreathingSessionState {
  running: boolean;
  paused: boolean;
  completed: boolean;
  currentPhase: BreathingPhase;
  phaseElapsed: number;
  phaseDuration: number;
  phaseRemaining: number;
  sessionRemaining: number;
  totalDuration: number;
  cyclesCompleted: number;
}

export interface EnvironmentOption {
  id: string;
  name: string;
  description: string;
  background: string;
  overlay?: string;
}

export interface AmbientTrackOption {
  id: string;
  name: string;
  description: string;
}
