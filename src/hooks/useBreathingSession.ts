import { useCallback, useEffect, useRef, useState } from 'react';
import type { BreathingPhase, BreathingSessionState, SessionConfig } from '../types';

const phaseOrder: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'hold2'];

const getNextPhase = (current: BreathingPhase): BreathingPhase => {
  const index = phaseOrder.indexOf(current);
  const nextIndex = (index + 1) % phaseOrder.length;
  return phaseOrder[nextIndex];
};

const createInitialState = (): BreathingSessionState => ({
  running: false,
  paused: false,
  completed: false,
  currentPhase: 'inhale',
  phaseElapsed: 0,
  phaseDuration: 4,
  phaseRemaining: 4,
  sessionRemaining: 0,
  totalDuration: 0,
  cyclesCompleted: 0,
});

interface StartPayload extends SessionConfig {}

export const useBreathingSession = () => {
  const [state, setState] = useState<BreathingSessionState>(createInitialState);
  const configRef = useRef<SessionConfig | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  const startSession = useCallback(({ phaseDurationSeconds, sessionDurationSeconds }: StartPayload) => {
    configRef.current = { phaseDurationSeconds, sessionDurationSeconds };
    setState({
      running: true,
      paused: false,
      completed: false,
      currentPhase: 'inhale',
      phaseElapsed: 0,
      phaseDuration: phaseDurationSeconds,
      phaseRemaining: phaseDurationSeconds,
      sessionRemaining: sessionDurationSeconds,
      totalDuration: sessionDurationSeconds,
      cyclesCompleted: 0,
    });
  }, []);

  const pauseSession = useCallback(() => {
    setState((prev) => {
      if (!prev.running || prev.paused) {
        return prev;
      }
      return { ...prev, paused: true };
    });
  }, []);

  const resumeSession = useCallback(() => {
    setState((prev) => {
      if (!prev.running || !prev.paused) {
        return prev;
      }
      return { ...prev, paused: false };
    });
  }, []);

  const stopSession = useCallback(() => {
    setState((prev) => {
      const totalDuration = configRef.current?.sessionDurationSeconds ?? prev.totalDuration;
      const phaseDuration = configRef.current?.phaseDurationSeconds ?? prev.phaseDuration;
      return {
        ...createInitialState(),
        phaseDuration,
        phaseRemaining: phaseDuration,
        totalDuration,
      };
    });
    configRef.current = null;
  }, []);

  useEffect(() => {
    if (!state.running || state.paused) {
      lastTimestampRef.current = null;
      return;
    }

    let animationFrame: number;

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const delta = (timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      setState((prev) => {
        const config = configRef.current;
        if (!config) {
          return prev;
        }
        if (!prev.running || prev.paused) {
          return prev;
        }

        let phaseElapsed = prev.phaseElapsed + delta;
        const phaseDuration = config.phaseDurationSeconds;
        let sessionRemaining = Math.max(prev.sessionRemaining - delta, 0);
        let currentPhase = prev.currentPhase;
        let cyclesCompleted = prev.cyclesCompleted;
        let running: boolean = prev.running;
        let completed = prev.completed;
        let paused = prev.paused;

        const advancePhase = () => {
          const next = getNextPhase(currentPhase);
          if (next === 'inhale') {
            cyclesCompleted += 1;
          }
          currentPhase = next;
          phaseElapsed = 0;
        };

        while (phaseElapsed >= phaseDuration && running) {
          phaseElapsed -= phaseDuration;
          advancePhase();
        }

        if (sessionRemaining <= 0.05) {
          running = false;
          completed = true;
          paused = false;
          sessionRemaining = 0;
          phaseElapsed = phaseDuration;
        }

        const phaseRemaining = Math.max(phaseDuration - phaseElapsed, 0);

        return {
          running,
          paused,
          completed,
          currentPhase,
          phaseElapsed: Math.min(phaseElapsed, phaseDuration),
          phaseDuration,
          phaseRemaining,
          sessionRemaining,
          totalDuration: prev.totalDuration || config.sessionDurationSeconds,
          cyclesCompleted,
        };
      });

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [state.running, state.paused]);

  return {
    state,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
  };
};
