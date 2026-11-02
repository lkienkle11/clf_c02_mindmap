import { describe, expect, it } from 'vitest';
import type { QuestionStat } from '@/persistence/records';
import { makeRng } from '@/features/practice';
import { buildReviewPlan } from './build-review-plan';

const DAY = 86_400_000;
const NOW = 100 * DAY;
const stat = (id: string, topicId: string | null, dueAt: number, extra: Partial<QuestionStat> = {}): QuestionStat => ({
  questionId: id, topicId, box: 1, dueAt, timesSeen: 1, timesCorrect: 0, lastSeenAt: 0, lastCorrect: true, ...extra,
});
const many = (topic: string, n: number, dueAt: number) =>
  Array.from({ length: n }, (_, i) => stat(`${topic}-${String(i).padStart(2, '0')}`, topic, dueAt));
const topicOf = (id: string) => id.split('-')[0];
const run = (stats: QuestionStat[], mode: Parameters<typeof buildReviewPlan>[0]['mode'], completed = ['t1', 't2', 't3'], seed = 1) =>
  buildReviewPlan({ stats, completed: new Set(completed), mode, now: NOW, rng: makeRng(seed) });

describe('buildReviewPlan', () => {
  it('returns empty plan when nothing is due', () => {
    expect(run([stat('t1-0', 't1', NOW + DAY)], { kind: 'full' })).toEqual({ batches: [], total: 0 });
  });
  it('full: 40 due over 3 topics => 15,15,10 and each topic >= 2', () => {
    const stats = [...many('t1', 20, NOW - DAY), ...many('t2', 18, NOW - DAY), ...many('t3', 2, NOW - DAY)];
    const plan = run(stats, { kind: 'full' });
    expect(plan.batches.map((b) => b.length)).toEqual([15, 15, 10]);
    expect(plan.total).toBe(40);
    const ids = plan.batches.flat();
    expect(new Set(ids).size).toBe(40);
    for (const t of ['t1', 't2', 't3']) expect(ids.filter((i) => topicOf(i) === t).length).toBeGreaterThanOrEqual(2);
  });
  it('full: topic with 1 due gets filled to 2 from not-yet-due', () => {
    const stats = [...many('t1', 10, NOW - DAY), stat('t2-00', 't2', NOW - DAY), stat('t2-01', 't2', NOW + DAY), stat('t2-02', 't2', NOW + DAY)];
    const ids = run(stats, { kind: 'full' }).batches.flat();
    expect(ids.filter((i) => topicOf(i) === 't2')).toHaveLength(2);
  });
  it('tops up to 8 with not-yet-due of same topics only', () => {
    const stats = [...many('t1', 3, NOW - DAY), stat('t1-90', 't1', NOW + DAY),
      ...Array.from({ length: 10 }, (_, i) => stat(`t1-f${i}`, 't1', NOW + DAY)), ...many('t2', 5, NOW + DAY)];
    const plan = run(stats, { kind: 'full' });
    expect(plan.total).toBe(8);
    expect(plan.batches.flat().every((i) => topicOf(i) === 't1')).toBe(true);
  });
  it('takes everything available when fewer than 8 exist', () => {
    const stats = [...many('t1', 3, NOW - DAY), stat('t1-x', 't1', NOW + DAY)];
    expect(run(stats, { kind: 'full' }).total).toBe(4);
  });
  it('quick: total <= 15', () => {
    const stats = [...many('t1', 20, NOW - 5 * DAY), ...many('t2', 20, NOW - DAY)];
    const plan = run(stats, { kind: 'quick' });
    expect(plan.total).toBe(15);
    expect(plan.batches).toHaveLength(1);
    expect(plan.batches.flat().every((i) => topicOf(i) === 't1')).toBe(true);
  });
  it('custom: only listed topics', () => {
    const stats = [...many('t1', 6, NOW - DAY), ...many('t2', 6, NOW - DAY), ...many('t3', 6, NOW - DAY)];
    const ids = run(stats, { kind: 'custom', topicIds: ['t2'] }).batches.flat();
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.every((i) => topicOf(i) === 't2')).toBe(true);
  });
  it('ignores topics not completed', () => {
    const ids = run(many('t9', 10, NOW - DAY), { kind: 'full' }).batches.flat();
    expect(ids).toEqual([]);
  });
  it('prioritises wrong answers then older lastSeenAt', () => {
    const stats = [
      stat('t1-a', 't1', NOW - DAY, { lastCorrect: true, lastSeenAt: 1 }),
      stat('t1-b', 't1', NOW - DAY, { lastCorrect: true, lastSeenAt: 5 }),
      stat('t1-c', 't1', NOW - DAY, { lastCorrect: false, lastSeenAt: 9 }),
      ...Array.from({ length: 20 }, (_, i) => stat(`t1-z${String(i).padStart(2, '0')}`, 't1', NOW - DAY, { lastSeenAt: 100 + i })),
    ];
    const ids = run(stats, { kind: 'quick' }).batches.flat();
    expect(ids).toHaveLength(15);
    expect(ids).toContain('t1-c');
    expect(ids).toContain('t1-a');
    expect(ids).toContain('t1-b');
  });
  it('is deterministic for the same seed', () => {
    const stats = [...many('t1', 20, NOW - DAY), ...many('t2', 20, NOW - DAY)];
    expect(run(stats, { kind: 'full' }, ['t1', 't2'], 7)).toEqual(run(stats, { kind: 'full' }, ['t1', 't2'], 7));
  });
});
