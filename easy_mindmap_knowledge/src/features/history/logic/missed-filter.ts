import type { MissedDetail } from './history-stats';

/** Keeps the items whose question text contains `query` (case-insensitive) and, when set, whose topic matches. */
export function filterMissed(
  items: MissedDetail[],
  query: string,
  topicId: string | null,
  textOf: (questionId: string) => string,
): MissedDetail[] {
  const needle = query.trim().toLowerCase();
  return items.filter(
    (i) => (topicId === null || i.topicId === topicId) && (needle === '' || textOf(i.questionId).toLowerCase().includes(needle)),
  );
}

/** One page of `items`; `page` is clamped into range and `pages` is 0 when there is nothing to show. */
export function paginate<T>(items: T[], page: number, size: number): { items: T[]; page: number; pages: number } {
  const pages = Math.ceil(items.length / size);
  const at = Math.min(Math.max(1, Math.trunc(page) || 1), Math.max(1, pages));
  return { items: items.slice((at - 1) * size, at * size), page: at, pages };
}
