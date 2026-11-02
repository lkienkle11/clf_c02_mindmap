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

interface HistoryRow extends AnswerRow {
  question_id: string;
}

const sameStat = (a: QuestionStat, b: QuestionStat): boolean =>
  a.topicId === b.topicId && a.box === b.box && a.dueAt === b.dueAt && a.timesSeen === b.timesSeen &&
  a.timesCorrect === b.timesCorrect && a.lastSeenAt === b.lastSeenAt && a.lastCorrect === b.lastCorrect;

/**
 * Startup repair: replay ALL graded answers with one ordered query, fold them per question in memory,
 * then write only the rows that differ from the stored cache (and delete rows with no history).
 * Same result as rebuildStatsFor over every question; repeating it is safe after a crash.
 */
export async function reconcileStats(deps: RebuildDeps): Promise<void> {
  const { executor, scheduler, topicOf } = deps;
  const history = await executor.select<HistoryRow>(
    `SELECT aq.question_id AS question_id, a.submitted_at AS submitted_at, aq.is_correct AS is_correct
       FROM attempt_questions aq
       JOIN attempts a ON a.id = aq.attempt_id
      WHERE a.status = 'submitted' AND aq.is_correct IS NOT NULL
      ORDER BY a.submitted_at ASC, a.id ASC, aq.position ASC`,
  );
  const repo = createQuestionStatsRepo(executor);
  const current = new Map((await repo.listAll()).map((s) => [s.questionId, s]));

  const replayed = new Map<string, QuestionStat>();
  for (const r of history) {
    const prev = replayed.get(r.question_id) ?? null;
    const ref = { questionId: r.question_id, topicId: topicOf(r.question_id) };
    replayed.set(r.question_id, scheduler.next(prev, r.is_correct === 1, r.submitted_at, ref));
  }

  for (const [questionId, stat] of replayed) {
    const stored = current.get(questionId);
    if (!stored || !sameStat(stored, stat)) await repo.upsert(stat);
  }
  for (const questionId of current.keys()) {
    if (!replayed.has(questionId)) {
      await executor.execute('DELETE FROM question_stats WHERE question_id = $1', [questionId]);
    }
  }
}
