import type { TopicReviewSummary } from './review-summary';

/** Local calendar date as YYYY-MM-DD. */
export function localDateString(now: number): string {
  const d = new Date(now);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function shouldShowDailyPrompt(input: {
  summaries: TopicReviewSummary[];
  lastShownDate: string | null;
  today: string;
}): boolean {
  return input.summaries.length > 0 && input.lastShownDate !== input.today;
}
