import { describe, expect, it } from 'vitest';
import { makeRng, shuffle } from './seeded-random';

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

describe('makeRng reference values', () => {
  it('matches the published mulberry32 sequence for seed 42', () => {
    const r = makeRng(42);
    expect([r(), r(), r()]).toEqual([0.6011037519201636, 0.44829055899754167, 0.8524657934904099]);
  });
  it('uses the seed as an unsigned 32-bit integer', () => {
    expect(makeRng(2 ** 32 + 42)()).toBe(makeRng(42)());
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
