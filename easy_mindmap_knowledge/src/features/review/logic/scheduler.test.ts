import { describe, expect, it } from 'vitest';
import { LeitnerScheduler } from './scheduler';
import type { QuestionStat } from '@/persistence/records';

const DAY = 86_400_000;
const ref = { questionId: 'q1', topicId: 't1' };
const s = new LeitnerScheduler();

describe('LeitnerScheduler', () => {
  it('new correct question goes to box 1, due in 3 days', () => {
    const r = s.next(null, true, 1000, ref);
    expect(r).toMatchObject({
      questionId: 'q1', topicId: 't1', box: 1, dueAt: 1000 + 3 * DAY,
      timesSeen: 1, timesCorrect: 1, lastSeenAt: 1000, lastCorrect: true,
    });
  });
  it('new wrong question stays in box 0, due in 1 day', () => {
    const r = s.next(null, false, 1000, ref);
    expect(r).toMatchObject({ box: 0, dueAt: 1000 + DAY, timesSeen: 1, timesCorrect: 0, lastCorrect: false });
  });
  it('box 5 stays at 5 when correct', () => {
    const prev: QuestionStat = { ...ref, box: 5, dueAt: 0, timesSeen: 9, timesCorrect: 9, lastSeenAt: 0, lastCorrect: true };
    const r = s.next(prev, true, 5000, ref);
    expect(r.box).toBe(5);
    expect(r.dueAt).toBe(5000 + 60 * DAY);
    expect(r.timesSeen).toBe(10);
  });
  it('correct at box 3 then wrong drops to box 0, due in 1 day', () => {
    const prev: QuestionStat = { ...ref, box: 3, dueAt: 0, timesSeen: 3, timesCorrect: 3, lastSeenAt: 0, lastCorrect: true };
    const up = s.next(prev, true, 100, ref);
    expect(up.box).toBe(4);
    const down = s.next(up, false, 200, ref);
    expect(down).toMatchObject({ box: 0, dueAt: 200 + DAY, timesSeen: 5, timesCorrect: 4 });
  });
});
