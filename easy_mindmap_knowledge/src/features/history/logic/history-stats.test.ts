import { describe, expect, it } from 'vitest';
import type { AttemptRow } from '@/persistence/records';
import { mostMissed, scoreSeries, weakTopics } from './history-stats';

function attempt(p: Partial<AttemptRow> & { id: string }): AttemptRow {
  return {
    kind: 'practice',
    topicId: 't1',
    status: 'submitted',
    startedAt: 0,
    submittedAt: 100,
    submitReason: 'manual',
    reviewAllowed: true,
    clock: {} as AttemptRow['clock'],
    heartbeatAt: null,
    scorePct: 50,
    passed: false,
    ...p,
  };
}

describe('scoreSeries', () => {
  it('orders submitted attempts by time', () => {
    const out = scoreSeries([
      attempt({ id: 'c', submittedAt: 300, scorePct: 90 }),
      attempt({ id: 'a', submittedAt: 100, scorePct: 40 }),
      attempt({ id: 'b', submittedAt: 200, scorePct: 70, kind: 'review', topicId: null }),
    ]);
    expect(out).toEqual([
      { attemptId: 'a', at: 100, scorePct: 40, kind: 'practice', topicId: 't1' },
      { attemptId: 'b', at: 200, scorePct: 70, kind: 'review', topicId: null },
      { attemptId: 'c', at: 300, scorePct: 90, kind: 'practice', topicId: 't1' },
    ]);
  });
  it('drops in_progress and null-score attempts', () => {
    const out = scoreSeries([
      attempt({ id: 'a', status: 'in_progress', submittedAt: null, scorePct: null }),
      attempt({ id: 'b', scorePct: null }),
      attempt({ id: 'c' }),
    ]);
    expect(out.map((x) => x.attemptId)).toEqual(['c']);
  });
  it('breaks time ties by id and handles empty', () => {
    const out = scoreSeries([attempt({ id: 'b' }), attempt({ id: 'a' })]);
    expect(out.map((x) => x.attemptId)).toEqual(['a', 'b']);
    expect(scoreSeries([])).toEqual([]);
  });
});

describe('weakTopics', () => {
  const rows = [
    attempt({ id: '1', topicId: 'hi', scorePct: 90 }),
    attempt({ id: '2', topicId: 'lo', scorePct: 20 }),
    attempt({ id: '3', topicId: 'lo', scorePct: 40 }),
    attempt({ id: '4', topicId: 'mid', scorePct: 60 }),
  ];
  it('sorts lowest average first and respects limit', () => {
    expect(weakTopics(rows, 2)).toEqual([
      { topicId: 'lo', avgPct: 30 },
      { topicId: 'mid', avgPct: 60 },
    ]);
  });
  it('limit 0 or negative gives empty; empty input gives empty', () => {
    expect(weakTopics(rows, 0)).toEqual([]);
    expect(weakTopics(rows, -1)).toEqual([]);
    expect(weakTopics([], 5)).toEqual([]);
  });
  it('breaks ties by topicId', () => {
    const out = weakTopics(
      [attempt({ id: '1', topicId: 'b', scorePct: 50 }), attempt({ id: '2', topicId: 'a', scorePct: 50 })],
      5,
    );
    expect(out.map((x) => x.topicId)).toEqual(['a', 'b']);
  });
  it('excludes review, in_progress, null topic and null score', () => {
    const out = weakTopics(
      [
        attempt({ id: '1', kind: 'review', topicId: 'r', scorePct: 0 }),
        attempt({ id: '2', topicId: null, scorePct: 0 }),
        attempt({ id: '3', topicId: 'n', scorePct: null }),
        attempt({ id: '4', topicId: 'p', status: 'in_progress', submittedAt: null, scorePct: 0 }),
        attempt({ id: '5', topicId: 'ok', scorePct: 80 }),
      ],
      5,
    );
    expect(out).toEqual([{ topicId: 'ok', avgPct: 80 }]);
  });
});

describe('mostMissed', () => {
  const rows = [
    { questionId: 'q1', isCorrect: false },
    { questionId: 'q1', isCorrect: true },
    { questionId: 'q1', isCorrect: false },
    { questionId: 'q2', isCorrect: true },
    { questionId: 'q3', isCorrect: false },
  ];
  it('counts misses/seen, drops zero-miss, sorts misses desc', () => {
    expect(mostMissed(rows, 10)).toEqual([
      { questionId: 'q1', misses: 2, seen: 3 },
      { questionId: 'q3', misses: 1, seen: 1 },
    ]);
  });
  it('respects limit; 0 and empty give empty', () => {
    expect(mostMissed(rows, 1)).toHaveLength(1);
    expect(mostMissed(rows, 0)).toEqual([]);
    expect(mostMissed([], 3)).toEqual([]);
  });
  it('ties: miss rate desc then id asc', () => {
    const out = mostMissed(
      [
        { questionId: 'b', isCorrect: false },
        { questionId: 'a', isCorrect: false },
        { questionId: 'c', isCorrect: false },
        { questionId: 'c', isCorrect: true },
      ],
      10,
    );
    expect(out.map((x) => x.questionId)).toEqual(['a', 'b', 'c']);
  });
});
