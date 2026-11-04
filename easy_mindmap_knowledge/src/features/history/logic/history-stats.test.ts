import { describe, expect, it } from 'vitest';
import type { AttemptQuestionRow, AttemptRow } from '@/persistence/records';
import { missedDetails, mostMissed, scoreSeries, weakTopics } from './history-stats';

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

function qrow(p: Partial<AttemptQuestionRow> & { attemptId: string; questionId: string }): AttemptQuestionRow {
  return { position: 0, optionOrder: ['A', 'B', 'C'], selected: ['A'], isCorrect: false, ...p };
}

describe('missedDetails', () => {
  const topicOf = (q: string) => (q === 'q9' ? null : 't1');

  it('matches mostMissed counts and order, only questions with a miss', () => {
    const attempts = [attempt({ id: 'a1' }), attempt({ id: 'a2' })];
    const rows = new Map([
      ['a1', [
        qrow({ attemptId: 'a1', questionId: 'q1' }),
        qrow({ attemptId: 'a1', questionId: 'q2' }),
        qrow({ attemptId: 'a1', questionId: 'q3', isCorrect: true }),
      ]],
      ['a2', [
        qrow({ attemptId: 'a2', questionId: 'q1' }),
        qrow({ attemptId: 'a2', questionId: 'q2', isCorrect: true }),
        qrow({ attemptId: 'a2', questionId: 'q3', isCorrect: true }),
      ]],
    ]);
    const out = missedDetails(attempts, rows, topicOf);
    const flat = [...rows.values()].flat().map((r) => ({ questionId: r.questionId, isCorrect: r.isCorrect === true }));
    expect(out.map(({ questionId, misses, seen }) => ({ questionId, misses, seen }))).toEqual(
      mostMissed(flat, 10),
    );
    expect(out.map((d) => d.questionId)).toEqual(['q1', 'q2']);
    expect(out[0].topicId).toBe('t1');
  });

  it('picks the latest wrong row by submittedAt, ties by larger attempt id', () => {
    const attempts = [
      attempt({ id: 'a1', submittedAt: 300 }),
      attempt({ id: 'a2', submittedAt: 200 }),
      attempt({ id: 'a3', submittedAt: 300 }),
    ];
    const rows = new Map([
      ['a1', [qrow({ attemptId: 'a1', questionId: 'q1', selected: ['A'] })]],
      ['a2', [qrow({ attemptId: 'a2', questionId: 'q1', selected: ['B'] })]],
      ['a3', [qrow({ attemptId: 'a3', questionId: 'q1', selected: ['C'], optionOrder: ['C', 'A', 'B'] })]],
    ]);
    const [d] = missedDetails(attempts, rows, topicOf);
    expect(d.latestWrong).toEqual({ attemptId: 'a3', at: 300, selected: ['C'], optionOrder: ['C', 'A', 'B'] });
  });

  it('counts distinct wrong answers ignoring order', () => {
    const attempts = [attempt({ id: 'a1' }), attempt({ id: 'a2' }), attempt({ id: 'a3' })];
    const rows = new Map([
      ['a1', [qrow({ attemptId: 'a1', questionId: 'q1', selected: ['A', 'B'] })]],
      ['a2', [qrow({ attemptId: 'a2', questionId: 'q1', selected: ['B', 'A'] })]],
      ['a3', [qrow({ attemptId: 'a3', questionId: 'q1', selected: ['A'] })]],
    ]);
    expect(missedDetails(attempts, rows, topicOf)[0].distinctWrongAnswers).toBe(2);
    const two = missedDetails(attempts.slice(0, 2), rows, topicOf);
    expect(two[0].distinctWrongAnswers).toBe(1);
  });

  it('excludes questions answered only correctly', () => {
    const rows = new Map([['a1', [qrow({ attemptId: 'a1', questionId: 'q1', isCorrect: true })]]]);
    expect(missedDetails([attempt({ id: 'a1' })], rows, topicOf)).toEqual([]);
  });

  it('treats isCorrect null as a miss', () => {
    const rows = new Map([['a1', [qrow({ attemptId: 'a1', questionId: 'q9', isCorrect: null, selected: [] })]]]);
    const [d] = missedDetails([attempt({ id: 'a1' })], rows, topicOf);
    expect(d.misses).toBe(1);
    expect(d.topicId).toBeNull();
  });

  it('ignores in-progress attempts and rows of unknown attempts', () => {
    const attempts = [attempt({ id: 'a1', status: 'in_progress', submittedAt: null })];
    const rows = new Map([
      ['a1', [qrow({ attemptId: 'a1', questionId: 'q1' })]],
      ['zz', [qrow({ attemptId: 'zz', questionId: 'q1' })]],
    ]);
    expect(missedDetails(attempts, rows, topicOf)).toEqual([]);
  });

  it('does not mutate inputs', () => {
    const attempts = [attempt({ id: 'a1' })];
    const rows = new Map([['a1', [qrow({ attemptId: 'a1', questionId: 'q1', selected: ['B', 'A'] })]]]);
    const snap = JSON.stringify([attempts, [...rows]]);
    missedDetails(attempts, rows, topicOf);
    expect(JSON.stringify([attempts, [...rows]])).toBe(snap);
  });
});
