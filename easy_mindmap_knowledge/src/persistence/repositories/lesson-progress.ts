import type { SqlExecutor } from '../sql-executor';

export function createLessonProgressRepo(db: SqlExecutor) {
  return {
    async markRead(lessonId: string, at: number): Promise<void> {
      await db.execute(
        'INSERT INTO lesson_progress (lesson_id, read_at) VALUES ($1, $2) ON CONFLICT(lesson_id) DO NOTHING',
        [lessonId, at],
      );
    },
    async readIds(): Promise<Set<string>> {
      const rows = await db.select<{ lesson_id: string }>('SELECT lesson_id FROM lesson_progress');
      return new Set(rows.map((r) => r.lesson_id));
    },
  };
}
export type LessonProgressRepo = ReturnType<typeof createLessonProgressRepo>;
