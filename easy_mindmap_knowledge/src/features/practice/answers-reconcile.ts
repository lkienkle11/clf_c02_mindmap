import type { Catalog } from '@/content/types';
import type { AttemptsRepo } from '@/persistence';
import { attemptScore, regradeAnswers } from './logic/regrade';
import type { StoredAnswer } from './logic/regrade';

export interface ReconcileAnswersDeps {
  attempts: AttemptsRepo;
  /** Only the questions are read; a full Catalog also fits. */
  catalog: Pick<Catalog, 'questions'>;
  /** Awaited once, right before the first write, and only when something will change. If it throws, nothing is written and the error propagates. */
  beforeWrite?: () => Promise<void>;
}

export interface ReconcileAnswersResult {
  /** Attempts whose grades or score changed. */
  attempts: number;
  /** Individual answers whose grade changed. */
  answers: number;
}

export async function reconcileAnswers(deps: ReconcileAnswersDeps): Promise<ReconcileAnswersResult> {
  const { attempts, catalog, beforeWrite } = deps;
  const submitted = await attempts.listSubmitted();
  const rowsByAttempt = await attempts.questionsOfMany(submitted.map((attempt) => attempt.id));
  const correctById = new Map(catalog.questions.map((question) => [question.id, question.correct]));
  const stored: StoredAnswer[] = submitted.flatMap((attempt) => rowsByAttempt.get(attempt.id) ?? []);
  const changes = regradeAnswers(stored, (id) => correctById.get(id) ?? null);

  const changesByAttempt = new Map<string, { position: number; isCorrect: boolean }[]>();
  for (const change of changes) {
    let grades = changesByAttempt.get(change.attemptId);
    if (!grades) {
      grades = [];
      changesByAttempt.set(change.attemptId, grades);
    }
    grades.push({ position: change.position, isCorrect: change.isCorrect });
  }

  const inputs = submitted.flatMap((attempt) => {
    const rows = rowsByAttempt.get(attempt.id) ?? [];
    if (rows.length === 0) return [];
    const grades = changesByAttempt.get(attempt.id) ?? [];
    const gradeByPosition = new Map(grades.map((grade) => [grade.position, grade.isCorrect]));
    const correctCount = rows.filter((row) => (gradeByPosition.get(row.position) ?? row.isCorrect) === true).length;
    const score = attemptScore(correctCount, rows.length);
    if (grades.length === 0 && attempt.scorePct === score.scorePct && attempt.passed === score.passed) return [];
    return [{ attemptId: attempt.id, grades, ...score }];
  });
  if (inputs.length === 0) return { attempts: 0, answers: 0 };

  await beforeWrite?.();
  await attempts.applyRegrade(inputs);
  return { attempts: inputs.length, answers: changes.length };
}
