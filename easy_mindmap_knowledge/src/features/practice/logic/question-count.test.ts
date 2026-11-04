import { describe, expect, it } from 'vitest';
import { MIN_PRACTICE_QUESTIONS, quickCounts, validateQuestionCount } from './question-count';

describe('validateQuestionCount', () => {
  it('rejects values that are not integers', () => {
    expect(validateQuestionCount('', 50)).toEqual({ ok: false, reason: 'notInteger' });
    expect(validateQuestionCount(10.5, 50)).toEqual({ ok: false, reason: 'notInteger' });
    expect(validateQuestionCount(Number.NaN, 50)).toEqual({ ok: false, reason: 'notInteger' });
    expect(validateQuestionCount(null, 50)).toEqual({ ok: false, reason: 'notInteger' });
  });

  it('rejects counts below the minimum', () => {
    expect(validateQuestionCount(9, 50)).toEqual({ ok: false, reason: 'tooFew' });
  });

  it('rejects counts above the pool size', () => {
    expect(validateQuestionCount(51, 50)).toEqual({ ok: false, reason: 'tooMany' });
  });

  it('accepts the minimum and the pool size as bounds', () => {
    expect(validateQuestionCount(10, 10)).toEqual({ ok: true, count: 10 });
    expect(validateQuestionCount(50, 50)).toEqual({ ok: true, count: 50 });
  });

  it('uses 10 as the minimum', () => {
    expect(MIN_PRACTICE_QUESTIONS).toBe(10);
  });
});

describe('quickCounts', () => {
  it('offers 10, 20 and all for a pool of 26', () => {
    expect(quickCounts(26)).toEqual([10, 20, 'all']);
  });

  it('offers 10, 20, 50 and all for a pool of 113', () => {
    expect(quickCounts(113)).toEqual([10, 20, 50, 'all']);
  });

  it('offers only 10 for a pool of exactly 10', () => {
    expect(quickCounts(10)).toEqual([10]);
  });
});
