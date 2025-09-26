import { useEffect, useRef } from 'react';
import type { BreathingPhase } from '../types';

const phasePrompts: Record<BreathingPhase, string> = {
  inhale: 'Inhale',
  hold: 'Hold',
  exhale: 'Exhale',
  hold2: 'Hold',
};

const speak = (message: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.rate = 0.85;
  utterance.pitch = 1.05;
  utterance.lang = 'en-US';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

export const useSpeechPrompts = (enabled: boolean, phase: BreathingPhase, paused: boolean) => {
  const previousPhase = useRef<BreathingPhase>(phase);

  useEffect(() => {
    if (!enabled || paused) {
      previousPhase.current = phase;
      return;
    }
    if (phase !== previousPhase.current) {
      const prompt = phasePrompts[phase];
      speak(prompt);
      previousPhase.current = phase;
    }
  }, [enabled, phase, paused]);
};

export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
