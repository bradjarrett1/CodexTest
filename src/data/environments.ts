import type { EnvironmentOption } from '../types';

export const environments: EnvironmentOption[] = [
  {
    id: 'aurora-night',
    name: 'Aurora Night',
    description: 'Cool northern lights drifting across a starry sky.',
    background:
      'radial-gradient(circle at 20% 20%, rgba(79, 209, 197, 0.35), transparent 55%), linear-gradient(160deg, #0b0f2f 0%, #132644 35%, #0b1c33 75%, #040713 100%)',
  },
  {
    id: 'sunrise-bay',
    name: 'Sunrise Bay',
    description: 'Warm sunrise hues reflecting gently over calm water.',
    background:
      'radial-gradient(circle at 80% 10%, rgba(255, 188, 141, 0.5), transparent 60%), linear-gradient(180deg, #ff9966 0%, #ff5e62 35%, #2a1056 80%)',
  },
  {
    id: 'forest-canopy',
    name: 'Forest Canopy',
    description: 'Lush greens with sunbeams filtering through leaves.',
    background:
      'radial-gradient(circle at 30% 80%, rgba(126, 217, 87, 0.35), transparent 60%), linear-gradient(200deg, #0f3d2e 0%, #1b5e20 45%, #081c13 90%)',
  },
  {
    id: 'desert-dusk',
    name: 'Desert Dusk',
    description: 'Expansive twilight sky over tranquil dunes.',
    background:
      'radial-gradient(circle at 15% 30%, rgba(255, 221, 148, 0.4), transparent 60%), linear-gradient(160deg, #f6d365 0%, #fda085 35%, #533483 85%)',
  },
];
