export type ResultVerdict = 'all' | 'correct' | 'wrong';

/** What a result list searches: never the explanation or the option notes. */
export interface ResultFilterItem {
  /** The 1-based question number shown to the learner. */
  number: number;
  isCorrect: boolean;
  title: string;
  optionTexts: string[];
}

/** Lower-case, accent-free text, so "dap an" finds "Đáp án". */
const fold = (text: string): string =>
  text.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/gi, 'd').toLowerCase();

/**
 * The question numbers that pass the verdict and the query, in the given order. A query matches an item when it
 * equals the question number, or when the title or any option text contains it. A blank query matches everything;
 * `wrong` includes unanswered questions (they are graded wrong).
 */
export function filterResultItems(items: readonly ResultFilterItem[], query: string, verdict: ResultVerdict): number[] {
  const needle = fold(query).trim();
  const asNumber = /^\d+$/.test(needle) ? Number(needle) : null;
  return items
    .filter((item) => {
      if (verdict === 'correct' && !item.isCorrect) return false;
      if (verdict === 'wrong' && item.isCorrect) return false;
      if (needle === '') return true;
      if (asNumber !== null && item.number === asNumber) return true;
      return fold(item.title).includes(needle) || item.optionTexts.some((t) => fold(t).includes(needle));
    })
    .map((item) => item.number);
}
