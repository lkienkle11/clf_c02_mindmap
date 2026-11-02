export const MAX_LIMIT_MS = 3 * 60 * 60 * 1000;

/** mm:ss, rounding up so the display never shows 00:00 while time remains. Minutes may exceed 59. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

/** Minutes + seconds from the number inputs (null when empty) to a limit in ms, or null when invalid. */
export function limitFromParts(minutes: number | null, seconds: number | null): number | null {
  if (minutes === null || seconds === null) return null;
  if (!Number.isInteger(minutes) || !Number.isInteger(seconds) || minutes < 0 || seconds < 0) return null;
  const ms = (minutes * 60 + seconds) * 1000;
  return ms >= 1000 && ms <= MAX_LIMIT_MS ? ms : null;
}
