import type { SqlExecutor } from './sql-executor';

export interface DbBackupDeps {
  /** Full path for a backup file with this name. The folder must exist once this resolves. */
  resolvePath: (fileName: string) => Promise<string>;
  now: () => number;
}

/** `mindmap-before-regrade-<ISO time with ':' and '.' replaced by '-'>.db`, for example mindmap-before-regrade-2026-11-11T00-15-00-123Z.db */
export function backupFileName(nowMs: number): string {
  return `mindmap-before-regrade-${new Date(nowMs).toISOString().replace(/[:.]/g, '-')}.db`;
}

/** Writes a copy of the database to resolvePath(backupFileName(now())) using `VACUUM INTO $1`. Any error propagates. */
export function createDbBackup(executor: SqlExecutor, deps: DbBackupDeps): () => Promise<void> {
  return async () => {
    const path = await deps.resolvePath(backupFileName(deps.now()));
    await executor.execute('VACUUM INTO $1', [path]);
  };
}
