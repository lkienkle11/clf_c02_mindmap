import { describe, expect, it } from 'vitest';
import { formatMegabytes, percentDone } from './format';

describe('formatMegabytes', () => {
  it('shows bytes in megabytes with one decimal place', () => {
    expect(formatMegabytes(12_900_000)).toBe('12.3 MB');
  });

  it('never shows less than 0.1 MB', () => {
    expect(formatMegabytes(1)).toBe('0.1 MB');
  });
});

describe('percentDone', () => {
  it('returns the downloaded share of the total as an integer percent', () => {
    expect(percentDone(50, 200)).toBe(25);
  });

  it('clamps to 100 when downloaded exceeds the total', () => {
    expect(percentDone(300, 200)).toBe(100);
  });

  it('clamps to 0 when downloaded is negative', () => {
    expect(percentDone(-5, 200)).toBe(0);
  });

  it('returns null when the total is unknown', () => {
    expect(percentDone(5, null)).toBeNull();
  });

  it('returns null when the total is zero', () => {
    expect(percentDone(5, 0)).toBeNull();
  });

  it('returns null when the total is negative', () => {
    expect(percentDone(5, -10)).toBeNull();
  });
});
