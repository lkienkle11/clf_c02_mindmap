/** Cuts `s` to at most `max` characters, ending in an ellipsis when something was removed. */
export function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, Math.max(1, max - 1)).trimEnd()}…`;
}

/** Splits a label into at most two lines, breaking at the space closest to the middle. */
export function splitTwo(s: string): string[] {
  const mid = s.length / 2;
  let best = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  }
  return best < 0 ? [s] : [s.slice(0, best), s.slice(best + 1)];
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max);
}
