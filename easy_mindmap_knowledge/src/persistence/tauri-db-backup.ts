import { appConfigDir, join } from '@tauri-apps/api/path';
import { createDbBackup } from './db-backup';
import type { SqlExecutor } from './sql-executor';

export function createTauriDbBackup(executor: SqlExecutor): () => Promise<void> {
  return createDbBackup(executor, {
    resolvePath: async (fileName) => join(await appConfigDir(), fileName),
    now: () => Date.now(),
  });
}
