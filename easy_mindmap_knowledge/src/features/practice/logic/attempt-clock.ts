import type { ClockState, HiddenPolicy } from '@/persistence/records';

export type { ClockState };

export function startClock(
  limitMs: number | null,
  mode: 'freeze' | 'run',
  now: number,
  onHidden: HiddenPolicy,
  onReport: HiddenPolicy = 'freeze',
): ClockState {
  if (limitMs === null) return { mode, onHidden, onReport, limitMs: null, remainingMs: null, deadlineAt: null };
  return {
    mode,
    onHidden,
    onReport,
    limitMs,
    remainingMs: limitMs,
    deadlineAt: mode === 'run' ? now + limitMs : null,
  };
}

export function advanceFreeze(state: ClockState, elapsedMs: number): ClockState {
  if (state.mode !== 'freeze' || state.remainingMs === null) return state;
  return { ...state, remainingMs: Math.max(0, state.remainingMs - Math.max(0, elapsedMs)) };
}

export function remainingAt(state: ClockState, now: number): number | null {
  if (state.limitMs === null) return null;
  if (state.mode === 'freeze') return state.remainingMs;
  if (state.deadlineAt === null) return state.remainingMs;
  // Clamp to limitMs so a backwards machine clock can never grant extra time.
  return Math.min(state.limitMs, Math.max(0, state.deadlineAt - now));
}

export function isExpired(state: ClockState, now: number): boolean {
  const remaining = remainingAt(state, now);
  return remaining !== null && remaining <= 0;
}

export function resolveOnResume(
  state: ClockState,
  now: number,
  _savedAt: number,
): { state: ClockState; autoSubmit: boolean } {
  if (state.limitMs === null) return { state, autoSubmit: false };
  if (state.mode === 'freeze') return { state, autoSubmit: state.remainingMs === 0 };
  const remaining = remainingAt(state, now);
  return { state: { ...state, remainingMs: remaining }, autoSubmit: remaining !== null && remaining <= 0 };
}

export function settleHidden(state: ClockState, hiddenMs: number): ClockState {
  if (state.limitMs === null) return state;
  const hidden = Math.max(0, hiddenMs);
  if (state.mode === 'run' && state.onHidden === 'freeze' && state.deadlineAt !== null) {
    return { ...state, deadlineAt: state.deadlineAt + hidden };
  }
  if (state.mode === 'freeze' && state.onHidden === 'run' && state.remainingMs !== null) {
    return { ...state, remainingMs: Math.max(0, state.remainingMs - hidden) };
  }
  return state;
}

/**
 * Time the clock must NOT charge because a report dialog was open for `elapsedMs` of visible time. A freeze
 * clock only counts ticks, so skipping the charge is enough and the state is unchanged. A run clock follows a
 * deadline, so the deadline moves later by the same amount. Hidden-window time is never routed through here:
 * it is governed only by `settleHidden` and `onHidden`.
 */
export function pauseForReport(state: ClockState, elapsedMs: number): ClockState {
  if (state.limitMs === null) return state;
  const paused = Math.max(0, elapsedMs);
  if (state.mode === 'run' && state.deadlineAt !== null) return { ...state, deadlineAt: state.deadlineAt + paused };
  return state;
}
