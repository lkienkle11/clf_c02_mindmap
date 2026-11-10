import { gradeQuestion, passes } from './grading';

export interface StoredAnswer {
  attemptId: string;
  position: number;
  questionId: string;
  selected: string[];
  isCorrect: boolean | null;
}

/** Only the answers whose live grade differs from the stored grade. `correctOf` returns null when the question is no longer in the bank. */
export function regradeAnswers(
  rows: StoredAnswer[],
  correctOf: (questionId: string) => readonly string[] | null,
): { attemptId: string; position: number; isCorrect: boolean }[] {
  const changes: { attemptId: string; position: number; isCorrect: boolean }[] = [];
  for (const row of rows) {
    if (row.isCorrect === null) continue;
    const correct = correctOf(row.questionId);
    if (correct === null) continue;
    const isCorrect = gradeQuestion(correct, row.selected);
    if (isCorrect !== row.isCorrect) {
      changes.push({ attemptId: row.attemptId, position: row.position, isCorrect });
    }
  }
  return changes;
}

/** Same scoring the quiz uses when an attempt is submitted. */
export function attemptScore(correctCount: number, total: number): { scorePct: number; passed: boolean } {
  return {
    scorePct: total === 0 ? 0 : Math.round((correctCount * 100) / total),
    passed: passes(correctCount, total),
  };
}
