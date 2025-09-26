import { useCallback, useEffect, useRef, useState } from 'react';

interface AmbientAudioControls {
  currentTrack: string | null;
  isReady: boolean;
  setTrack: (trackId: string, volume: number) => Promise<void>;
  setVolume: (volume: number) => void;
  stop: () => void;
  pause: () => void;
  resume: () => Promise<void>;
}

const createNoiseBuffer = (context: AudioContext, seconds = 2) => {
  const buffer = context.createBuffer(2, context.sampleRate * seconds, context.sampleRate);
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.4;
    }
  }
  return buffer;
};

const startGentleHum = (context: AudioContext, gain: GainNode) => {
  const low = context.createOscillator();
  low.type = 'sine';
  low.frequency.value = 110;

  const high = context.createOscillator();
  high.type = 'sine';
  high.frequency.value = 220;
  high.detune.value = 15;

  const lfo = context.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.15;

  const lfoGain = context.createGain();
  lfoGain.gain.value = 0.3;
  lfo.connect(lfoGain).connect(gain.gain);

  low.connect(gain);
  high.connect(gain);

  low.start();
  high.start();
  lfo.start();

  return [low, high, lfo];
};

const startOceanicBreeze = (context: AudioContext, gain: GainNode) => {
  const bufferSource = context.createBufferSource();
  bufferSource.buffer = createNoiseBuffer(context, 4);
  bufferSource.loop = true;

  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 600;
  filter.Q.value = 0.7;

  const lfo = context.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.08;

  const lfoGain = context.createGain();
  lfoGain.gain.value = 300;
  lfo.connect(lfoGain).connect(filter.frequency);

  bufferSource.connect(filter).connect(gain);
  bufferSource.start();
  lfo.start();

  return [bufferSource, lfo];
};

const startCelestialChoir = (context: AudioContext, gain: GainNode) => {
  const frequencies = [261.63, 329.63, 392.0];
  const oscillators = frequencies.map((frequency, index) => {
    const osc = context.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = frequency;
    osc.detune.value = index * 2;
    osc.connect(gain);
    osc.start();
    return osc;
  });

  const lfo = context.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.12;

  const lfoGain = context.createGain();
  lfoGain.gain.value = 0.25;
  lfo.connect(lfoGain).connect(gain.gain);
  lfo.start();

  return [...oscillators, lfo];
};

const trackStarters: Record<string, (context: AudioContext, gain: GainNode) => AudioScheduledSourceNode[] | AudioNode[]> = {
  'gentle-hum': startGentleHum,
  'oceanic-breeze': startOceanicBreeze,
  'celestial-choir': startCelestialChoir,
};

export const useAmbientAudio = (): AmbientAudioControls => {
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourcesRef = useRef<(AudioScheduledSourceNode | AudioNode)[]>([]);
  const trackRef = useRef<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const ensureContext = useCallback(async () => {
    if (!contextRef.current) {
      const context = new AudioContext();
      const gain = context.createGain();
      gain.gain.value = 0.6;
      gain.connect(context.destination);
      contextRef.current = context;
      gainRef.current = gain;
      setIsReady(true);
    }
    const context = contextRef.current!;
    if (context.state === 'suspended') {
      await context.resume();
    }
    return context;
  }, []);

  const stop = useCallback(() => {
    sourcesRef.current.forEach((node) => {
      if ('stop' in node && typeof node.stop === 'function') {
        try {
          node.stop();
        } catch (error) {
          // ignore cleanup errors
        }
      }
      if ('disconnect' in node && typeof node.disconnect === 'function') {
        try {
          node.disconnect();
        } catch (error) {
          // ignore cleanup errors
        }
      }
    });
    sourcesRef.current = [];
    trackRef.current = null;
  }, []);

  const setTrack = useCallback<AmbientAudioControls['setTrack']>(
    async (trackId, volume) => {
      if (trackId === 'silence') {
        stop();
        return;
      }
      const context = await ensureContext();
      const gain = gainRef.current;
      if (!gain) {
        return;
      }
      stop();
      const starter = trackStarters[trackId];
      if (starter) {
        sourcesRef.current = starter(context, gain);
        trackRef.current = trackId;
        gain.gain.value = volume;
      }
    },
    [ensureContext, stop],
  );

  const setVolume = useCallback<AmbientAudioControls['setVolume']>((volume) => {
    const gain = gainRef.current;
    if (gain) {
      gain.gain.linearRampToValueAtTime(volume, gain.context.currentTime + 0.2);
    }
  }, []);

  const pause = useCallback(() => {
    const context = contextRef.current;
    if (context && context.state === 'running') {
      context.suspend().catch(() => undefined);
    }
  }, []);

  const resume = useCallback(async () => {
    const context = contextRef.current;
    if (context && context.state !== 'running') {
      await context.resume();
    }
  }, []);

  useEffect(() => () => {
    stop();
    if (contextRef.current) {
      contextRef.current.close().catch(() => undefined);
      contextRef.current = null;
    }
  }, [stop]);

  return {
    currentTrack: trackRef.current,
    isReady,
    setTrack,
    setVolume,
    stop,
    pause,
    resume,
  };
};
