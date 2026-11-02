import { describe, expect, it } from 'vitest';
import type { QuestionStat } from '@/persistence/records';
import { reviewSummaries } from './review-summary';

const DAY = 86_400_000;
const NOW = 100 * DAY;

function stat(id: string, topicId: string | null, dueAt: number, extra: Partial<QuestionStat> = {}): QuestionStat {
  return { questionId: id, topicId, box: 1, dueAt, timesSeen: 1, timesCorrect: 0, lastSeenAt: 0, lastCorrect: true, ...extra };
}

describe('reviewSummaries', () => {
  it('is empty when nothing is due', () => {
    expect(reviewSummaries([stat('q1', 't1', NOW + 1)], new Set(['t1']), NOW)).toEqual([]);
  });
  it('ignores topics not completed', () => {
    expect(reviewSummaries([stat('q1', 't2', NOW - DAY)], new Set(['t1']), NOW)).toEqual([]);
  });
  it('ignores null-topic stats', () => {
    expect(reviewSummaries([stat('q1', null, NOW - DAY)], new Set(['t1']), NOW)).toEqual([]);
  });
  it('counts due, computes overdue/urgency and sorts', () => {
    const stats = [
      stat('a', 't1', NOW - 1000),
      stat('b', 't2', NOW - 5 * DAY - 10),
      stat('c', 't2', NOW - 2 * DAY),
      stat('d', 't3', NOW - 3 * DAY),
    ];
    const s = reviewSummaries(stats, new Set(['t1', 't2', 't3']), NOW);
    expect(s).toEqual([
      { topicId: 't2', dueCount: 2, daysOverdue: 5, urgency: 'urgent' },
      { topicId: 't3', dueCount: 1, daysOverdue: 3, urgency: 'urgent' },
      { topicId: 't1', dueCount: 1, daysOverdue: 0, urgency: 'soon' },
    ]);
  });
});
