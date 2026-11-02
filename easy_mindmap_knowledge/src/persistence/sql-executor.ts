/**
 * Minimal SQL port. SQL strings use `$1, $2, ...` placeholders (the Tauri SQL
 * plugin's sqlite style). No transaction method: the plugin uses a connection
 * pool, so multi-call transactions are unreliable.
 */
export interface SqlExecutor {
  execute(sql: string, params?: unknown[]): Promise<void>;
  select<T>(sql: string, params?: unknown[]): Promise<T[]>;
}
