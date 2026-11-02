import type { SqlExecutor } from '../sql-executor';
import type { AttemptQuestionRow, AttemptRow, ClockState } from '../records';

interface AttemptDb {
  id: string;
  kind: AttemptRow['kind'];
  topic_id: string | null;
  status: AttemptRow['status'];
  started_at: number;
  submitted_at: number | null;
  submit_reason: AttemptRow['submitReason'];
  review_allowed: number;
  time_limit_ms: number | null;
  clock_mode: ClockState['mode'];
  remaining_ms: number | null;
  deadline_at: number | null;
  heartbeat_at: number | null;
  score_pct: number | null;
  passed: number | null;
}

interface QuestionDb {
  attempt_id: string;
  position: number;
  question_id: string;
  option_order: string;
  selected: string;
  is_correct: number | null;
}

const bool = (v: number | null): boolean | null => (v === null ? null : v === 1);

const toAttempt = (r: AttemptDb): AttemptRow => ({
  id: r.id,
  kind: r.kind,
  topicId: r.topic_id,
  status: r.status,
  startedAt: r.started_at,
  submittedAt: r.submitted_at,
  submitReason: r.submit_reason,
  reviewAllowed: r.review_allowed === 1,
  clock: { mode: r.clock_mode, limitMs: r.time_limit_ms, remainingMs: r.remaining_ms, deadlineAt: r.deadline_at },
  heartbeatAt: r.heartbeat_at,
  scorePct: r.score_pct,
  passed: bool(r.passed),
});

const toQuestion = (r: QuestionDb): AttemptQuestionRow => ({
  attemptId: r.attempt_id,
  position: r.position,
  questionId: r.question_id,
  optionOrder: JSON.parse(r.option_order) as string[],
  selected: JSON.parse(r.selected) as string[],
  isCorrect: bool(r.is_correct),
});

export interface SubmitInput {
  scorePct: number;
  passed: boolean;
  reason: 'manual' | 'timeout';
  at: number;
  grades: { position: number; isCorrect: boolean }[];
}

export function createAttemptsRepo(db: SqlExecutor) {
  async function questionsOf(attemptId: string): Promise<AttemptQuestionRow[]> {
    const rows = await db.select<QuestionDb>(
      'SELECT * FROM attempt_questions WHERE attempt_id = $1 ORDER BY position',
      [attemptId],
    );
    return rows.map(toQuestion);
  }

  return {
    questionsOf,

    async create(a: AttemptRow, questions: AttemptQuestionRow[]): Promise<void> {
      await db.execute(
        `INSERT INTO attempts
           (id, kind, topic_id, status, started_at, submitted_at, submit_reason, review_allowed,
            time_limit_ms, clock_mode, remaining_ms, deadline_at, heartbeat_at, score_pct, passed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          a.id, a.kind, a.topicId, a.status, a.startedAt, a.submittedAt, a.submitReason,
          a.reviewAllowed ? 1 : 0, a.clock.limitMs, a.clock.mode, a.clock.remainingMs, a.clock.deadlineAt,
          a.heartbeatAt, a.scorePct, a.passed === null ? null : a.passed ? 1 : 0,
        ],
      );
      for (const q of questions) {
        await db.execute(
          `INSERT INTO attempt_questions (attempt_id, position, question_id, option_order, selected, is_correct)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            a.id, q.position, q.questionId, JSON.stringify(q.optionOrder), JSON.stringify(q.selected),
            q.isCorrect === null ? null : q.isCorrect ? 1 : 0,
          ],
        );
      }
    },

    async saveAnswer(attemptId: string, position: number, selected: string[]): Promise<void> {
      await db.execute('UPDATE attempt_questions SET selected = $1 WHERE attempt_id = $2 AND position = $3', [
        JSON.stringify(selected), attemptId, position,
      ]);
    },

    async saveClock(attemptId: string, clock: ClockState, heartbeatAt: number | null): Promise<void> {
      await db.execute(
        `UPDATE attempts SET clock_mode = $1, time_limit_ms = $2, remaining_ms = $3, deadline_at = $4,
           heartbeat_at = $5 WHERE id = $6`,
        [clock.mode, clock.limitMs, clock.remainingMs, clock.deadlineAt, heartbeatAt, attemptId],
      );
    },

    /** Grades first, attempt row LAST, so a crash midway leaves it in_progress. */
    async markSubmitted(attemptId: string, s: SubmitInput): Promise<void> {
      for (const g of s.grades) {
        await db.execute('UPDATE attempt_questions SET is_correct = $1 WHERE attempt_id = $2 AND position = $3', [
          g.isCorrect ? 1 : 0, attemptId, g.position,
        ]);
      }
      await db.execute(
        `UPDATE attempts SET status = 'submitted', submitted_at = $1, submit_reason = $2,
           score_pct = $3, passed = $4 WHERE id = $5`,
        [s.at, s.reason, s.scorePct, s.passed ? 1 : 0, attemptId],
      );
    },

    async findInProgress(): Promise<{ attempt: AttemptRow; questions: AttemptQuestionRow[] } | null> {
      const rows = await db.select<AttemptDb>(
        "SELECT * FROM attempts WHERE status = 'in_progress' ORDER BY started_at DESC LIMIT 1",
      );
      if (!rows[0]) return null;
      return { attempt: toAttempt(rows[0]), questions: await questionsOf(rows[0].id) };
    },

    async discard(attemptId: string): Promise<void> {
      await db.execute('DELETE FROM attempt_questions WHERE attempt_id = $1', [attemptId]);
      await db.execute('DELETE FROM attempts WHERE id = $1', [attemptId]);
    },

    async listSubmitted(): Promise<AttemptRow[]> {
      const rows = await db.select<AttemptDb>(
        "SELECT * FROM attempts WHERE status = 'submitted' ORDER BY submitted_at, id",
      );
      return rows.map(toAttempt);
    },
  };
}
export type AttemptsRepo = ReturnType<typeof createAttemptsRepo>;
