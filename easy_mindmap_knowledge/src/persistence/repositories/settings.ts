import type { SqlExecutor } from '../sql-executor';

export function createSettingsRepo(db: SqlExecutor) {
  return {
    async get(key: string): Promise<string | null> {
      const rows = await db.select<{ value: string }>('SELECT value FROM settings WHERE key = $1', [key]);
      return rows[0]?.value ?? null;
    },
    async set(key: string, value: string): Promise<void> {
      await db.execute(
        'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [key, value],
      );
    },
  };
}
export type SettingsRepo = ReturnType<typeof createSettingsRepo>;
