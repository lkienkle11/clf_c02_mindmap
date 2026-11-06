export const EXAM_QUESTION_COUNT = 65;
export const EXAM_MINUTES = 90;
export const EXAM_MINUTES_EXTRA = 120;
export const EXAM_MIN_QUESTIONS = 10;

/**
 * Time limit in milliseconds for an exam of `questionCount` questions.
 * Scales the full-exam limit proportionally, rounded up to whole seconds.
 */
export function examLimitMs(questionCount: number, extraTime: boolean): number {
  const minutes = extraTime ? EXAM_MINUTES_EXTRA : EXAM_MINUTES;
  return Math.ceil((questionCount * minutes * 60) / EXAM_QUESTION_COUNT) * 1000;
}
