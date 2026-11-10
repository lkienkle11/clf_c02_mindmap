import { describe, expect, it } from 'vitest';
import { filterMissed, paginate } from './missed-filter';
import type { MissedDetail } from './history-stats';

const item = (questionId: string, topicId: string | null): MissedDetail => ({
  questionId,
  topicId,
  misses: 1,
  seen: 1,
  latestWrong: { attemptId: 'a', position: 0, at: 1, selected: ['A'], optionOrder: ['A'] },
  distinctWrongAnswers: 1,
});
const texts: Record<string, string> = { q1: 'What is an EC2 instance?', q2: 'Which S3 class is cheapest?', q3: 'Name the ec2 pricing model' };
const textOf = (id: string) => texts[id] ?? id;
const items = [item('q1', 'compute'), item('q2', 'storage'), item('q3', 'compute')];

describe('filterMissed', () => {
  it('returns everything for an empty query and no topic', () => {
    expect(filterMissed(items, '', null, textOf)).toEqual(items);
    expect(filterMissed(items, '   ', null, textOf)).toEqual(items);
  });

  it('matches a case-insensitive substring of the question text', () => {
    expect(filterMissed(items, 'EC2', null, textOf).map((i) => i.questionId)).toEqual(['q1', 'q3']);
    expect(filterMissed(items, ' cheapest', null, textOf).map((i) => i.questionId)).toEqual(['q2']);
  });

  it('filters by topic, combined with the query', () => {
    expect(filterMissed(items, '', 'storage', textOf).map((i) => i.questionId)).toEqual(['q2']);
    expect(filterMissed(items, 'ec2', 'storage', textOf)).toEqual([]);
  });

  it('searches the id when the text is unknown', () => {
    expect(filterMissed([item('gone', null)], 'gon', null, textOf)).toHaveLength(1);
  });
});

describe('paginate', () => {
  const list = Array.from({ length: 12 }, (_, i) => i + 1);

  it('slices a page and counts the pages', () => {
    expect(paginate(list, 1, 5)).toEqual({ items: [1, 2, 3, 4, 5], page: 1, pages: 3 });
    expect(paginate(list, 3, 5)).toEqual({ items: [11, 12], page: 3, pages: 3 });
  });

  it('clamps the page into range', () => {
    expect(paginate(list, 0, 5).page).toBe(1);
    expect(paginate(list, 9, 5)).toEqual({ items: [11, 12], page: 3, pages: 3 });
  });

  it('has 0 pages and page 1 for no items', () => {
    expect(paginate([], 4, 5)).toEqual({ items: [], page: 1, pages: 0 });
  });
});
