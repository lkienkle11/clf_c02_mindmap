import type { UnansweredDisplay } from '@/persistence/records';

/** True when a result must show the options only: the question was left unanswered and the attempt chose 'answersOnly'. */
export function hidesAnswers(selected: readonly string[], display: UnansweredDisplay): boolean {
  return selected.length === 0 && display === 'answersOnly';
}
