/** Set comparison, order ignored. An empty selection is always wrong. */
export function gradeQuestion(correct: readonly string[], selected: readonly string[]): boolean {
  if (selected.length === 0) return false;
  const want = new Set(correct);
  const got = new Set(selected);
  if (want.size !== got.size) return false;
  for (const k of want) if (!got.has(k)) return false;
  return true;
}

/** Inclusive threshold, default 80%, integer math. */
export function passes(correctCount: number, total: number, thresholdPct: number = 80): boolean {
  return total > 0 && correctCount * 100 >= thresholdPct * total;
}
import { isCapstoneExamTopic } from '@/content/capstone-exams';

export function passThresholdPct(topicId: string | null): 70 | 80 {
  return isCapstoneExamTopic(topicId) ? 70 : 80;
}

