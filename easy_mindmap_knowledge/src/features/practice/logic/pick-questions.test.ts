import { describe, expect, it } from 'vitest';
import { makeQuestion } from '@/testing/fixtures';
import type { Catalog, Question } from '@/content/types';
import { buildPool, planAttempt, planQuestions, practiceCount } from './pick-questions';
import { makeRng } from '@/random/seeded-random';

const qs = (n: number, over: Partial<Question> = {}) =>
  Array.from({ length: n }, (_, i) =>
    makeQuestion({
      id: `q${i}`,
      options: ['A', 'B', 'C', 'D', 'E'].map((k) => ({ key: k, text: k })),
      ...over,
    }));

describe('practiceCount', () => {
  it('is 10 for every topic, capstone included', () => {
    expect(practiceCount('capstone')).toBe(10);
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

describe('planQuestions', () => {
  it('plans every question once, in a shuffled order, without slicing', () => {
    const pool = qs(20);
    const plan = planQuestions(pool, makeRng(4));
    expect(plan.map((p) => p.questionId).sort()).toEqual(pool.map((q) => q.id).sort());
    expect(plan.map((p) => p.questionId)).not.toEqual(pool.map((q) => q.id));
  });
  it('keeps option order for orderDependent questions', () => {
    const pool = qs(5, { orderDependent: true });
    for (let seed = 0; seed < 10; seed++) {
      for (const p of planQuestions(pool, makeRng(seed))) {
        expect(p.optionOrder).toEqual(['A', 'B', 'C', 'D', 'E']);
      }
    }
  });
  it('returns [] for an empty list', () => {
    expect(planQuestions([], makeRng(1))).toEqual([]);
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
