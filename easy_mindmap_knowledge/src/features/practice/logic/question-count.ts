export const MIN_PRACTICE_QUESTIONS = 10;
export const DEFAULT_QUESTION_COUNT = 10;

export type QuestionCountReason = 'notInteger' | 'tooFew' | 'tooMany';
export type QuestionCountResult = { ok: true; count: number } | { ok: false; reason: QuestionCountReason };

/** Checks a requested question count against the number of questions it can be drawn from. */
export function validateQuestionCount(value: unknown, poolSize: number): QuestionCountResult {
  if (typeof value !== 'number' || !Number.isInteger(value)) return { ok: false, reason: 'notInteger' };
  if (value < MIN_PRACTICE_QUESTIONS) return { ok: false, reason: 'tooFew' };
  if (value > poolSize) return { ok: false, reason: 'tooMany' };
  return { ok: true, count: value };
}

/** Quick-pick counts: 10 always, 20 and 50 while below the pool size, and 'all' when the pool is larger than 10. */
export function quickCounts(poolSize: number): (number | 'all')[] {
  const counts: (number | 'all')[] = [MIN_PRACTICE_QUESTIONS];
  for (const n of [20, 50]) {
    if (n < poolSize) counts.push(n);
  }
  if (poolSize > MIN_PRACTICE_QUESTIONS) counts.push('all');
  return counts;
}
