import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@/content/load-catalog';
import { loadBundledCatalog } from '@/content/bundled';
import type { Catalog, Question } from '@/content/types';
import { makeQuestion, makeTopics } from '@/testing/fixtures';
import { makeRng } from '@/random/seeded-random';
import { allocate } from './allocate';
import { DOMAIN_OF_TOPIC } from './domains';
import type { CheckpointGroup } from './groups';
import { drawBucket, drawCapstone, drawCheckpoint, historyOf } from './draw-exam';

const qs = (topicId: string | null, n: number, prefix: string): Question[] =>
  Array.from({ length: n }, (_, i) => makeQuestion({ id: `${prefix}${i}`, topicId }));

const catalogOf = (questions: Question[]): Catalog =>
  loadCatalog({ topics: makeTopics(), lessons: [], questions });

const ids = (list: Question[]) => list.map((q) => q.id);

/** `times` graded answers for one question. */
const answers = (questionId: string, isCorrect: boolean, times = 1) =>
  Array.from({ length: times }, () => ({ questionId, isCorrect }));

/** Ids `prefix${from}` .. `prefix${to - 1}`, matching `qs`. */
const range = (prefix: string, from: number, to: number): string[] =>
  Array.from({ length: to - from }, (_, i) => `${prefix}${from + i}`);

describe('historyOf', () => {
  it('marks every answered question seen and counts wrong answers as misses', () => {
    const h = historyOf([
      { questionId: 'q1', isCorrect: false },
      { questionId: 'q1', isCorrect: false },
      { questionId: 'q2', isCorrect: true },
    ]);
    expect(h.seen).toEqual(new Set(['q1', 'q2']));
    expect(h.misses).toEqual(new Map([['q1', 2]]));
  });
});

describe('drawBucket', () => {
  it('draws unseen questions first when they cover n', () => {
    const pool = qs('compute', 6, 'q');
    const history = historyOf([
      { questionId: 'q0', isCorrect: true },
      { questionId: 'q1', isCorrect: true },
      { questionId: 'q2', isCorrect: false },
    ]);
    const drawn = drawBucket(pool, 3, history, makeRng(5));
    expect(new Set(ids(drawn))).toEqual(new Set(['q3', 'q4', 'q5']));
  });

  it('after the unseen ones, appends seen-wrong by misses descending, and only then seen-right', () => {
    const pool = qs('compute', 5, 'w');
    const history = historyOf([
      { questionId: 'w0', isCorrect: true },
      { questionId: 'w1', isCorrect: false },
      { questionId: 'w2', isCorrect: true },
      { questionId: 'w3', isCorrect: false },
      { questionId: 'w4', isCorrect: false },
      { questionId: 'w4', isCorrect: false },
    ]);
    expect(ids(drawBucket(pool, 1, history, makeRng(9)))).toEqual(['w4']);
    expect(new Set(ids(drawBucket(pool, 3, history, makeRng(9))))).toEqual(new Set(['w4', 'w1', 'w3']));
  });

  it('never returns duplicates and returns min(n, pool.length)', () => {
    const small = qs('compute', 4, 's');
    expect(drawBucket(small, 10, historyOf([]), makeRng(1))).toHaveLength(4);
    const big = qs('compute', 50, 'b');
    const drawn = drawBucket(big, 10, historyOf([]), makeRng(2));
    expect(drawn).toHaveLength(10);
    expect(new Set(ids(drawn)).size).toBe(10);
  });

  it('returns [] for n = 0', () => {
    expect(drawBucket(qs('compute', 4, 's'), 0, historyOf([]), makeRng(1))).toEqual([]);
  });

  it('mixes the tiers at n = 4: two unseen, then the seen-wrong one, then a seen-right one (the extra right is a candidate too)', () => {
    const pool = ['u1', 'u2', 'w1', 'r1', 'r2'].map((id) => makeQuestion({ id, topicId: 'compute' }));
    const history = historyOf([
      ...answers('w1', false),
      ...answers('r1', true),
      ...answers('r2', true),
    ]);
    const drawn = ids(drawBucket(pool, 4, history, makeRng(13)));
    expect(new Set(drawn.slice(0, 2))).toEqual(new Set(['u1', 'u2']));
    expect(drawn[2]).toBe('w1');
    expect(['r1', 'r2']).toContain(drawn[3]);
  });

  it('orders seen-wrong questions by miss count beyond n = 1, and keeps seen-right out while they last', () => {
    const pool = ['wA', 'wB', 'wC', 'wD', 'rX'].map((id) => makeQuestion({ id, topicId: 'compute' }));
    const history = historyOf([
      ...answers('wA', false, 1),
      ...answers('wB', false, 3),
      ...answers('wC', false, 2),
      ...answers('wD', false, 1),
      ...answers('rX', true),
    ]);
    const drawn = ids(drawBucket(pool, 4, history, makeRng(17)));
    expect(drawn.slice(0, 2)).toEqual(['wB', 'wC']);
    expect(new Set(drawn.slice(2))).toEqual(new Set(['wA', 'wD']));
  });
});

describe('drawCheckpoint', () => {
  const group: CheckpointGroup = { index: 1, topicIds: ['compute', 'storage', 'networking'] };
  const groupCatalog = (sizes: [number, number, number]) =>
    catalogOf([
      ...qs('compute', sizes[0], 'c'),
      ...qs('storage', sizes[1], 's'),
      ...qs('networking', sizes[2], 'n'),
      ...qs('databases', 30, 'd'),
    ]);

  it('returns 65 distinct questions split by allocate(sizes, sizes, 65, minEach 1)', () => {
    const catalog = groupCatalog([30, 20, 25]);
    const drawn = drawCheckpoint(catalog, group, historyOf([]), makeRng(3));
    expect(drawn).toHaveLength(65);
    expect(new Set(ids(drawn)).size).toBe(65);
    const sizes = { compute: 30, storage: 20, networking: 25 };
    const expected = allocate(sizes, sizes, 65, 1);
    const counted = Object.fromEntries(
      group.topicIds.map((t) => [t, drawn.filter((q) => q.topicId === t).length]),
    );
    expect(counted).toEqual(expected);
  });

  it('only draws from the group topics', () => {
    const drawn = drawCheckpoint(groupCatalog([30, 20, 25]), group, historyOf([]), makeRng(4));
    expect(drawn.every((q) => group.topicIds.includes(q.topicId ?? ''))).toBe(true);
  });

  it('returns the list shuffled, not grouped by topic', () => {
    const drawn = drawCheckpoint(groupCatalog([30, 20, 25]), group, historyOf([]), makeRng(11));
    const changes = drawn.slice(1).filter((q, i) => q.topicId !== drawn[i].topicId).length;
    expect(changes).toBeGreaterThan(2);
  });

  it('returns every question of a group whose pools total 40', () => {
    const catalog = groupCatalog([10, 15, 15]);
    const drawn = drawCheckpoint(catalog, group, historyOf([]), makeRng(6));
    expect(drawn).toHaveLength(40);
    expect(new Set(ids(drawn)).size).toBe(40);
  });

  it('with history, draws every unseen and seen-wrong question and leaves out the seen-right ones', () => {
    // Pools 30/20/25 allocate 26/17/22 (see the split test), so the questions past each allocation are seen-right.
    const catalog = groupCatalog([30, 20, 25]);
    const seenRight = [...range('c', 26, 30), ...range('s', 17, 20), ...range('n', 22, 25)];
    const seenWrong = ['c0', 's0', 'n0'];
    const unseen = [...range('c', 0, 30), ...range('s', 0, 20), ...range('n', 0, 25)].filter(
      (id) => !seenRight.includes(id) && !seenWrong.includes(id),
    );
    const history = historyOf([
      ...seenRight.flatMap((id) => answers(id, true)),
      ...seenWrong.flatMap((id) => answers(id, false)),
    ]);
    const drawnList = drawCheckpoint(catalog, group, history, makeRng(21));
    const drawn = new Set(ids(drawnList));
    expect(drawnList).toHaveLength(65);
    expect(unseen.filter((id) => !drawn.has(id))).toEqual([]);
    expect(seenWrong.filter((id) => !drawn.has(id))).toEqual([]);
    expect(seenRight.filter((id) => drawn.has(id))).toEqual([]);
  });
});

describe('drawCapstone', () => {
  const domainTopic = { concepts: 'cloud-concepts', security: 'iam-security', technology: 'compute', billing: 'pricing-billing' } as const;
  const domainCount = (drawn: Question[], domain: string) =>
    drawn.filter((q) => q.topicId !== null && DOMAIN_OF_TOPIC[q.topicId] === domain).length;

  it('draws 16/19/22/8 per domain from big pools, distinct, never from unassigned questions', () => {
    const catalog = catalogOf([
      ...qs(domainTopic.concepts, 100, 'a'),
      ...qs(domainTopic.security, 100, 'b'),
      ...qs(domainTopic.technology, 100, 'c'),
      ...qs(domainTopic.billing, 100, 'd'),
      ...qs(null, 17, 'u'),
    ]);
    const drawn = drawCapstone(catalog, historyOf([]), makeRng(8));
    expect(drawn).toHaveLength(65);
    expect(new Set(ids(drawn)).size).toBe(65);
    expect(drawn.every((q) => q.topicId !== null)).toBe(true);
    expect(domainCount(drawn, 'concepts')).toBe(16);
    expect(domainCount(drawn, 'security')).toBe(19);
    expect(domainCount(drawn, 'technology')).toBe(22);
    expect(domainCount(drawn, 'billing')).toBe(8);
  });

  it('tops up from unassigned questions only when the domains cannot supply 65, never exceeding pools', () => {
    const catalog = catalogOf([
      ...qs(domainTopic.concepts, 5, 'a'),
      ...qs(domainTopic.security, 5, 'b'),
      ...qs(domainTopic.technology, 5, 'c'),
      ...qs(domainTopic.billing, 5, 'd'),
      ...qs(null, 50, 'u'),
    ]);
    const drawn = drawCapstone(catalog, historyOf([]), makeRng(12));
    expect(drawn).toHaveLength(65);
    expect(new Set(ids(drawn)).size).toBe(65);
    expect(drawn.filter((q) => q.topicId !== null)).toHaveLength(20);
    expect(drawn.filter((q) => q.topicId === null)).toHaveLength(45);
  });

  it('returns 65 questions on the real bundled catalog', () => {
    const drawn = drawCapstone(loadBundledCatalog(), historyOf([]), makeRng(7));
    expect(drawn).toHaveLength(65);
    expect(new Set(ids(drawn)).size).toBe(65);
  });

  it('with history, per domain draws every unseen and seen-wrong question and leaves out the seen-right ones', () => {
    // Domain pools of 30 allocate 16/19/22/8, so the questions past each allocation are seen-right.
    const perDomain = [
      { prefix: 'a', topic: domainTopic.concepts, count: 16 },
      { prefix: 'b', topic: domainTopic.security, count: 19 },
      { prefix: 'c', topic: domainTopic.technology, count: 22 },
      { prefix: 'd', topic: domainTopic.billing, count: 8 },
    ];
    const catalog = catalogOf([
      ...perDomain.flatMap(({ prefix, topic }) => qs(topic, 30, prefix)),
      ...qs(null, 10, 'u'),
    ]);
    const seenRight = perDomain.flatMap(({ prefix, count }) => range(prefix, count, 30));
    const seenWrong = perDomain.map(({ prefix }) => `${prefix}0`);
    const expected = perDomain.flatMap(({ prefix, count }) => range(prefix, 0, count));
    const history = historyOf([
      ...seenRight.flatMap((id) => answers(id, true)),
      ...seenWrong.flatMap((id) => answers(id, false)),
    ]);
    const drawn = drawCapstone(catalog, history, makeRng(19));
    const drawnIds = new Set(ids(drawn));
    expect(drawn).toHaveLength(65);
    expect(drawn.every((q) => q.topicId !== null)).toBe(true);
    expect(expected.filter((id) => !drawnIds.has(id))).toEqual([]);
    expect(seenWrong.filter((id) => !drawnIds.has(id))).toEqual([]);
    expect(seenRight.filter((id) => drawnIds.has(id))).toEqual([]);
  });
});
