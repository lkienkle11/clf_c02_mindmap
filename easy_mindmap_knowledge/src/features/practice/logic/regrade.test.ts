import { describe, it, expect } from 'vitest';
import { attemptScore, regradeAnswers } from './regrade';
import type { StoredAnswer } from './regrade';

describe('regradeAnswers', () => {
  it('returns only the answers whose live grade differs from the stored grade', () => {
    const rows: StoredAnswer[] = [
      { attemptId: 'attempt-1', position: 0, questionId: 'unchanged-right', selected: ['C', 'B'], isCorrect: true },
      { attemptId: 'attempt-1', position: 1, questionId: 'unchanged-wrong', selected: [], isCorrect: false },
      { attemptId: 'attempt-1', position: 2, questionId: 'now-wrong', selected: ['A'], isCorrect: true },
      { attemptId: 'attempt-2', position: 0, questionId: 'now-right', selected: ['B'], isCorrect: false },
    ];
    const bank: Record<string, readonly string[]> = {
      'unchanged-right': ['B', 'C'],
      'unchanged-wrong': ['B'],
      'now-wrong': ['B'],
      'now-right': ['B'],
    };

    expect(regradeAnswers(rows, (id) => bank[id] ?? null)).toEqual([
      { attemptId: 'attempt-1', position: 2, isCorrect: false },
      { attemptId: 'attempt-2', position: 0, isCorrect: true },
    ]);
  });

  it('flips a stored wrong grade to right when the bank answer now matches the selection', () => {
    const rows: StoredAnswer[] = [
      { attemptId: 'attempt-1', position: 3, questionId: 'question-1', selected: ['B'], isCorrect: false },
    ];

    expect(regradeAnswers(rows, () => ['B'])).toEqual([
      { attemptId: 'attempt-1', position: 3, isCorrect: true },
    ]);
  });

  it('skips answers that were never graded (isCorrect null)', () => {
    const rows: StoredAnswer[] = [
      { attemptId: 'attempt-1', position: 0, questionId: 'question-1', selected: ['B'], isCorrect: null },
    ];

    expect(regradeAnswers(rows, () => ['B'])).toEqual([]);
  });

  it('skips answers whose question is no longer in the bank', () => {
    const rows: StoredAnswer[] = [
      { attemptId: 'attempt-1', position: 0, questionId: 'removed', selected: ['B'], isCorrect: true },
    ];

    expect(regradeAnswers(rows, () => null)).toEqual([]);
  });

  it('a question changed from single to multiple answers grades a one-key selection wrong', () => {
    const rows: StoredAnswer[] = [
      { attemptId: 'attempt-1', position: 0, questionId: 'question-1', selected: ['B'], isCorrect: true },
    ];

    expect(regradeAnswers(rows, () => ['B', 'C'])).toEqual([
      { attemptId: 'attempt-1', position: 0, isCorrect: false },
    ]);
  });

  it('a question changed from multiple to single answer grades a two-key selection wrong', () => {
    const rows: StoredAnswer[] = [
      { attemptId: 'attempt-1', position: 0, questionId: 'question-1', selected: ['B', 'C'], isCorrect: true },
    ];

    expect(regradeAnswers(rows, () => ['B'])).toEqual([
      { attemptId: 'attempt-1', position: 0, isCorrect: false },
    ]);
  });
});

describe('attemptScore', () => {
  it('attemptScore rounds to the nearest whole percent', () => {
    expect(attemptScore(1, 3).scorePct).toBe(33);
    expect(attemptScore(2, 3).scorePct).toBe(67);
  });

  it('attemptScore passes at exactly 80 percent and not below', () => {
    expect(attemptScore(4, 5)).toEqual({ scorePct: 80, passed: true });
    expect(attemptScore(3, 4)).toEqual({ scorePct: 75, passed: false });
  });

  it('attemptScore of an empty attempt is 0 and not passed', () => {
    expect(attemptScore(0, 0)).toEqual({ scorePct: 0, passed: false });
  });
});
