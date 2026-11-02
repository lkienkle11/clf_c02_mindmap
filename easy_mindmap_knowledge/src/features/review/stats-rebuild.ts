import { createQuestionStatsRepo } from '@/persistence';
import type { QuestionStat, SqlExecutor } from '@/persistence';
import type { ReviewScheduler } from './logic/scheduler';

export interface RebuildDeps {
  executor: SqlExecutor;
  scheduler: ReviewScheduler;
  /** Topic of a question, from the catalog (attempt_questions does not store it). */
  topicOf: (questionId: string) => string | null;
}

interface AnswerRow {
  submitted_at: number;
  is_correct: number;
}

/**
 * question_stats is a cache derived from submitted attempts. Rebuilding replays the
 * full history, so it is a pure function of history and safe to repeat after a crash.
 */
export async function rebuildStatsFor(deps: RebuildDeps, questionIds: string[]): Promise<void> {
  const { executor, scheduler, topicOf } = deps;
  const repo = createQuestionStatsRepo(executor);
  for (const questionId of new Set(questionIds)) {
    const rows = await executor.select<AnswerRow>(
      `SELECT a.submitted_at AS submitted_at, aq.is_correct AS is_correct
         FROM attempt_questions aq
         JOIN attempts a ON a.id = aq.attempt_id
        WHERE aq.question_id = $1 AND a.status = 'submitted' AND aq.is_correct IS NOT NULL
        ORDER BY a.submitted_at ASC, a.id ASC, aq.position ASC`,
      [questionId],
    );
    if (rows.length === 0) {
      await executor.execute('DELETE FROM question_stats WHERE question_id = $1', [questionId]);
      continue;
    }
    const ref = { questionId, topicId: topicOf(questionId) };
    let stat: QuestionStat | null = null;
    for (const r of rows) stat = scheduler.next(stat, r.is_correct === 1, r.submitted_at, ref);
    if (stat) await repo.upsert(stat);
  }
}

/** Rebuild every question seen in a submitted attempt; drop stats rows with no history. */
export async function reconcileStats(deps: RebuildDeps): Promise<void> {
  const seen = await deps.executor.select<{ question_id: string }>(
    `SELECT DISTINCT aq.question_id AS question_id
       FROM attempt_questions aq JOIN attempts a ON a.id = aq.attempt_id
      WHERE a.status = 'submitted' AND aq.is_correct IS NOT NULL`,
  );
  const stale = await deps.executor.select<{ question_id: string }>('SELECT question_id FROM question_stats');
  const ids = new Set([...seen.map((r) => r.question_id), ...stale.map((r) => r.question_id)]);
  await rebuildStatsFor(deps, [...ids]);
}
