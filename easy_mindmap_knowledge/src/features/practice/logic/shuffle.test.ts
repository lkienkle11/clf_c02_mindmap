import { describe, expect, it } from 'vitest';
import { makeRng, shuffle } from './shuffle';

describe('makeRng', () => {
  it('is deterministic and in [0,1)', () => {
    const a = makeRng(42), b = makeRng(42);
    for (let i = 0; i < 20; i++) {
      const v = a();
      expect(v).toBe(b());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('shuffle', () => {
  it('does not mutate input and keeps elements', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const copy = [...input];
    const out = shuffle(input, makeRng(1));
    expect(input).toEqual(copy);
    expect([...out].sort()).toEqual(copy);
  });
  it('same seed same result, different seed different', () => {
    const items = Array.from({ length: 20 }, (_, i) => i);
    expect(shuffle(items, makeRng(5))).toEqual(shuffle(items, makeRng(5)));
    expect(shuffle(items, makeRng(5))).not.toEqual(shuffle(items, makeRng(6)));
  });
});
