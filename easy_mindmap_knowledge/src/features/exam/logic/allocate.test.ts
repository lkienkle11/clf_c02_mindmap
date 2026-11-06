import { describe, expect, it } from 'vitest';
import { allocate } from './allocate';

const DOMAIN_WEIGHTS = { concepts: 24, security: 30, technology: 34, billing: 12 };
const BIG = 100;
const BIG_DOMAIN_CAPS = { concepts: BIG, security: BIG, technology: BIG, billing: BIG };

function sumOf(values: Record<string, number>): number {
  return Object.values(values).reduce((a, b) => a + b, 0);
}

describe('allocate', () => {
  it('splits 65 questions over the domain weights with big caps', () => {
    expect(allocate(DOMAIN_WEIGHTS, BIG_DOMAIN_CAPS, 65)).toEqual({
      concepts: 16,
      security: 19,
      technology: 22,
      billing: 8,
    });
  });

  it('caps billing at 5 and still sums to 65, redistributing the excess by weight', () => {
    const caps = { ...BIG_DOMAIN_CAPS, billing: 5 };
    const result = allocate(DOMAIN_WEIGHTS, caps, 65);
    expect(result).toEqual({ concepts: 16, security: 21, technology: 23, billing: 5 });
    expect(sumOf(result)).toBe(65);
  });

  it('gives every bucket its cap when total exceeds the sum of caps', () => {
    expect(allocate({ a: 1, b: 2, c: 3 }, { a: 3, b: 5, c: 7 }, 100)).toEqual({ a: 3, b: 5, c: 7 });
  });

  it('splits 65 over checkpoint pool sizes with minEach 1 and every bucket at least 1', () => {
    const pools = { a: 153, b: 176, c: 212 };
    const result = allocate(pools, pools, 65, 1);
    expect(result).toEqual({ a: 19, b: 21, c: 25 });
    expect(sumOf(result)).toBe(65);
    for (const key of Object.keys(result)) {
      expect(result[key]).toBeGreaterThanOrEqual(1);
      expect(result[key]).toBeLessThanOrEqual(pools[key as keyof typeof pools]);
    }
  });

  it('gives a zero-weight bucket nothing while weighted buckets can absorb the total', () => {
    expect(allocate({ a: 1, b: 0, c: 1 }, { a: 10, b: 10, c: 10 }, 10)).toEqual({ a: 5, b: 0, c: 5 });
  });

  it('gives a zero-weight bucket only what is needed to reach the total', () => {
    expect(allocate({ a: 1, b: 0 }, { a: 3, b: 10 }, 5)).toEqual({ a: 3, b: 2 });
  });

  it('is deterministic and breaks exact ties by key order', () => {
    const weights = { a: 1, b: 1, c: 1 };
    const caps = { a: 10, b: 10, c: 10 };
    const first = allocate(weights, caps, 1);
    expect(first).toEqual({ a: 1, b: 0, c: 0 });
    expect(allocate(weights, caps, 1)).toEqual(first);
  });

  it('breaks exact fractional ties by key order even when float noise would disagree', () => {
    // 40 * 27 / 70 and 40 * 13 / 70 both leave 30/70 over; b (earlier key) takes the last unit.
    expect(allocate({ a: 18, b: 27, c: 12, d: 13 }, { a: 100, b: 100, c: 100, d: 100 }, 40)).toEqual({
      a: 10,
      b: 16,
      c: 7,
      d: 7,
    });
  });

  it('moves the share of a capped bucket to the buckets that still have room', () => {
    expect(allocate({ a: 1, b: 1 }, { a: 2, b: 10 }, 10)).toEqual({ a: 2, b: 8 });
  });

  it('gives minEach to as many buckets as the total allows, in key order when it cannot cover all', () => {
    const result = allocate({ a: 1, b: 1, c: 1 }, { a: 10, b: 10, c: 10 }, 2, 1);
    expect(result).toEqual({ a: 1, b: 1, c: 0 });
    expect(sumOf(result)).toBe(2);
  });

  it('applies minEach only to buckets whose cap is at least minEach', () => {
    expect(allocate({ a: 1, b: 1, c: 1 }, { a: 0, b: 10, c: 10 }, 4, 1)).toEqual({ a: 0, b: 2, c: 2 });
  });

  it('returns zeros for total 0 and zero for buckets with zero cap', () => {
    expect(allocate({ a: 1, b: 1 }, { a: 5, b: 5 }, 0)).toEqual({ a: 0, b: 0 });
    expect(allocate({ a: 1, b: 1 }, { a: 0, b: 5 }, 3)).toEqual({ a: 0, b: 3 });
  });

  it('treats a key missing from weights as weight 0', () => {
    expect(allocate({ a: 1 }, { a: 5, b: 5 }, 3)).toEqual({ a: 3, b: 0 });
  });

  it('treats negative or NaN weights as zero', () => {
    expect(allocate({ a: -1, b: 1 }, { a: 10, b: 10 }, 4)).toEqual({ a: 0, b: 4 });
    expect(allocate({ a: Number.NaN, b: 1 }, { a: 10, b: 10 }, 4)).toEqual({ a: 0, b: 4 });
  });

  it('keeps the sum at min(total, sum of caps) and every bucket within 0..cap across many inputs', () => {
    interface Scenario {
      weights: Record<string, number>;
      caps: Record<string, number>;
      minEach: number;
    }
    const scenarios: Scenario[] = [
      { weights: DOMAIN_WEIGHTS, caps: { concepts: 40, security: 40, technology: 40, billing: 9 }, minEach: 0 },
      { weights: { a: 153, b: 176, c: 212 }, caps: { a: 153, b: 176, c: 212 }, minEach: 1 },
      { weights: { a: 0, b: 3, c: 0 }, caps: { a: 4, b: 2, c: 9 }, minEach: 0 },
      { weights: { a: 5, b: 1, c: 2 }, caps: { a: 0, b: 7, c: 3 }, minEach: 2 },
      { weights: { a: 0, b: 0 }, caps: { a: 6, b: 4 }, minEach: 0 },
    ];
    for (const { weights, caps, minEach } of scenarios) {
      const capSum = sumOf(caps);
      for (const total of [0, 1, 2, 7, 33, 65, 300]) {
        const label = `total=${total} caps=${JSON.stringify(caps)} minEach=${minEach}`;
        const result = allocate(weights, caps, total, minEach);
        expect(sumOf(result), label).toBe(Math.min(total, capSum));
        for (const key of Object.keys(caps)) {
          expect(Number.isInteger(result[key]), `${key} ${label}`).toBe(true);
          expect(result[key], `${key} ${label}`).toBeGreaterThanOrEqual(0);
          expect(result[key], `${key} ${label}`).toBeLessThanOrEqual(caps[key]);
        }
      }
    }
  });
});
