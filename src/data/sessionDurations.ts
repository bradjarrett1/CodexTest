export interface SessionDurationOption {
  id: string;
  label: string;
  seconds: number;
}

export const sessionDurationOptions: SessionDurationOption[] = [
  { id: '2min', label: '2 min', seconds: 2 * 60 },
  { id: '5min', label: '5 min', seconds: 5 * 60 },
  { id: '7min', label: '7 min', seconds: 7 * 60 },
  { id: '10min', label: '10 min', seconds: 10 * 60 },
  { id: '15min', label: '15 min', seconds: 15 * 60 },
];
