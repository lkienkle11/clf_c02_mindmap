import { describe, expect, it } from 'vitest';
import { MAX_LIMIT_MS, formatClock, limitFromParts } from './time';

describe('time helpers', () => {
  it('formats mm:ss rounding up', () => {
    expect(formatClock(320_000)).toBe('05:20');
    expect(formatClock(59_001)).toBe('01:00');
    expect(formatClock(0)).toBe('00:00');
    expect(formatClock(-5)).toBe('00:00');
    expect(formatClock(MAX_LIMIT_MS)).toBe('180:00');
  });
  it('validates limits between 1 s and 3 h in whole numbers', () => {
    expect(limitFromParts(0, 1)).toBe(1000);
    expect(limitFromParts(180, 0)).toBe(MAX_LIMIT_MS);
    expect(limitFromParts(0, 90)).toBe(90_000);
    expect(limitFromParts(0, 0)).toBeNull();
    expect(limitFromParts(180, 1)).toBeNull();
    expect(limitFromParts(1.5, 0)).toBeNull();
    expect(limitFromParts(-1, 30)).toBeNull();
    expect(limitFromParts(null, 5)).toBeNull();
  });
});
