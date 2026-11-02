import type { SqlExecutor } from '../sql-executor';
import type { QuestionStat } from '../records';

interface Row {
  question_id: string;
  topic_id: string | null;
  box: number;
  due_at: number;
  times_seen: number;
  times_correct: number;
  last_seen_at: number;
  last_correct: number;
}

const toStat = (r: Row): QuestionStat => ({
  questionId: r.question_id,
  topicId: r.topic_id,
  box: r.box,
  dueAt: r.due_at,
  timesSeen: r.times_seen,
  timesCorrect: r.times_correct,
  lastSeenAt: r.last_seen_at,
  lastCorrect: r.last_correct === 1,
});

export function createQuestionStatsRepo(db: SqlExecutor) {
  return {
    async get(questionId: string): Promise<QuestionStat | null> {
      const rows = await db.select<Row>('SELECT * FROM question_stats WHERE question_id = $1', [questionId]);
      return rows[0] ? toStat(rows[0]) : null;
    },
    async upsert(s: QuestionStat): Promise<void> {
      await db.execute(
        `INSERT INTO question_stats
           (question_id, topic_id, box, due_at, times_seen, times_correct, last_seen_at, last_correct)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT(question_id) DO UPDATE SET
           topic_id = excluded.topic_id, box = excluded.box, due_at = excluded.due_at,
           times_seen = excluded.times_seen, times_correct = excluded.times_correct,
           last_seen_at = excluded.last_seen_at, last_correct = excluded.last_correct`,
        [s.questionId, s.topicId, s.box, s.dueAt, s.timesSeen, s.timesCorrect, s.lastSeenAt, s.lastCorrect ? 1 : 0],
      );
    },
    async listAll(): Promise<QuestionStat[]> {
      const rows = await db.select<Row>('SELECT * FROM question_stats ORDER BY question_id');
      return rows.map(toStat);
    },
  };
}
export type QuestionStatsRepo = ReturnType<typeof createQuestionStatsRepo>;
