import { describe, expect, it } from 'vitest';
import { localDateString, shouldShowDailyPrompt } from './prompt-gate';
import type { TopicReviewSummary } from './review-summary';

const sum: TopicReviewSummary[] = [{ topicId: 't1', dueCount: 1, daysOverdue: 0, urgency: 'soon' }];

describe('shouldShowDailyPrompt', () => {
  it('false with no summaries', () => {
    expect(shouldShowDailyPrompt({ summaries: [], lastShownDate: null, today: '2026-01-05' })).toBe(false);
  });
  it('true when never shown', () => {
    expect(shouldShowDailyPrompt({ summaries: sum, lastShownDate: null, today: '2026-01-05' })).toBe(true);
  });
  it('false when already shown today, true next day', () => {
    expect(shouldShowDailyPrompt({ summaries: sum, lastShownDate: '2026-01-05', today: '2026-01-05' })).toBe(false);
    expect(shouldShowDailyPrompt({ summaries: sum, lastShownDate: '2026-01-05', today: '2026-01-06' })).toBe(true);
  });
});

describe('localDateString', () => {
  it('zero-pads month and day', () => {
    expect(localDateString(new Date(2026, 0, 5, 12).getTime())).toBe('2026-01-05');
    expect(localDateString(new Date(2026, 10, 25, 12).getTime())).toBe('2026-11-25');
  });
});
