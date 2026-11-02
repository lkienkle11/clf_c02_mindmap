import { describe, expect, it } from 'vitest';
import { makeQuestion } from '@/testing/fixtures';
import type { Catalog, Question } from '@/content/types';
import { buildPool, planAttempt, practiceCount } from './pick-questions';
import { makeRng } from './shuffle';

const qs = (n: number, over: Partial<Question> = {}) =>
  Array.from({ length: n }, (_, i) =>
    makeQuestion({
      id: `q${i}`,
      options: ['A', 'B', 'C', 'D', 'E'].map((k) => ({ key: k, text: k })),
      ...over,
    }));

describe('practiceCount', () => {
  it('is 30 for capstone, else 10', () => {
    expect(practiceCount('capstone')).toBe(30);
    expect(practiceCount('compute')).toBe(10);
  });
});

describe('buildPool', () => {
  const all = [
    makeQuestion({ id: 'a', topicId: 'compute' }),
    makeQuestion({ id: 'b', topicId: 'storage' }),
    makeQuestion({ id: 'c', topicId: null }),
  ];
  const catalog = {
    questions: all,
    questionsOf: (t: string) => all.filter((q) => q.topicId === t),
  } as unknown as Catalog;
  it('capstone includes everything incl. null topic', () => {
    expect(buildPool(catalog, 'capstone').map((q) => q.id)).toEqual(['a', 'b', 'c']);
  });
  it('topic uses questionsOf', () => {
    expect(buildPool(catalog, 'compute').map((q) => q.id)).toEqual(['a']);
  });
});

describe('planAttempt', () => {
  it('takes all of a small pool without repeats', () => {
    const plan = planAttempt(qs(4), 10, makeRng(1));
    expect(plan).toHaveLength(4);
    expect(new Set(plan.map((p) => p.questionId)).size).toBe(4);
  });
  it('returns [] for empty pool', () => {
    expect(planAttempt([], 10, makeRng(1))).toEqual([]);
  });
  it('picks count unique questions from a larger pool', () => {
    const plan = planAttempt(qs(50), 10, makeRng(3));
    expect(plan).toHaveLength(10);
    expect(new Set(plan.map((p) => p.questionId)).size).toBe(10);
  });
  it('is deterministic per seed and differs across seeds', () => {
    const pool = qs(50);
    expect(planAttempt(pool, 10, makeRng(7))).toEqual(planAttempt(pool, 10, makeRng(7)));
    expect(planAttempt(pool, 10, makeRng(7))).not.toEqual(planAttempt(pool, 10, makeRng(8)));
  });
  it('keeps option order for orderDependent questions', () => {
    const pool = qs(5, { orderDependent: true });
    for (let seed = 0; seed < 10; seed++) {
      for (const p of planAttempt(pool, 5, makeRng(seed))) {
        expect(p.optionOrder).toEqual(['A', 'B', 'C', 'D', 'E']);
      }
    }
  });
  it('shuffles options otherwise, keeping all keys', () => {
    const plan = planAttempt(qs(10), 10, makeRng(2));
    for (const p of plan) expect([...p.optionOrder].sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(plan.some((p) => p.optionOrder.join('') !== 'ABCDE')).toBe(true);
  });
});
