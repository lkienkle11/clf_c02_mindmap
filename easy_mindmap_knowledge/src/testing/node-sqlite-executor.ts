import { DatabaseSync } from 'node:sqlite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { SqlExecutor } from '@/persistence/sql-executor';

const MIGRATIONS_DIR = join(process.cwd(), 'src-tauri', 'migrations');

/** Translate Tauri-style `$n` placeholders to SQLite numbered `?n`. */
export function translatePlaceholders(sql: string): string {
  return sql.replace(/\$(\d+)/g, '?$1');
}

type SqlValue = null | number | bigint | string;
const toParams = (params?: unknown[]) =>
  (params ?? []).map((p) => (p === undefined ? null : typeof p === 'boolean' ? (p ? 1 : 0) : p)) as SqlValue[];

export async function createNodeSqliteExecutor(): Promise<SqlExecutor> {
  const db = new DatabaseSync(':memory:');
  for (const f of readdirSync(MIGRATIONS_DIR).filter((n) => n.endsWith('.sql')).sort()) {
    db.exec(readFileSync(join(MIGRATIONS_DIR, f), 'utf8'));
  }
  return {
    async execute(sql, params) {
      if (!params || params.length === 0) db.exec(translatePlaceholders(sql));
      else db.prepare(translatePlaceholders(sql)).run(...toParams(params));
    },
    async select<T>(sql: string, params?: unknown[]) {
      return db.prepare(translatePlaceholders(sql)).all(...toParams(params)) as T[];
    },
  };
}
