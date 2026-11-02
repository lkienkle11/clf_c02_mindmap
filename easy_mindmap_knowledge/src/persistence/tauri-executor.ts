import Database from '@tauri-apps/plugin-sql';
import type { SqlExecutor } from './sql-executor';

export async function createTauriExecutor(): Promise<SqlExecutor> {
  const db = await Database.load('sqlite:mindmap.db');
  return {
    async execute(sql, params) {
      await db.execute(sql, params);
    },
    select<T>(sql: string, params?: unknown[]) {
      return db.select<T[]>(sql, params);
    },
  };
}
