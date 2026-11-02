export interface ClockState {
  mode: 'freeze' | 'run';
  limitMs: number | null;
  remainingMs: number | null;
  deadlineAt: number | null;
}
