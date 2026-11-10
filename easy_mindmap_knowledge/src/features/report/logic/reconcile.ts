import type { ReportStatus } from '@/persistence/records';

export interface StatusState {
  status: ReportStatus;
  statusUpdatedAt: number;
}
export interface StatusChange {
  id: string;
  status: ReportStatus;
  at: number;
}

/**
 * Newer statusUpdatedAt wins; a tie keeps the database and writes nothing. A newer file with the SAME status
 * still goes to `toDb` (the database adopts the file's time; no file rewrite). Ids on only one side are skipped,
 * so a file can never create a report.
 */
export function reconcile(
  db: ({ id: string } & StatusState)[],
  files: Map<string, StatusState>,
): { toDb: StatusChange[]; toFiles: StatusChange[] } {
  const toDb: StatusChange[] = [];
  const toFiles: StatusChange[] = [];
  for (const row of db) {
    const file = files.get(row.id);
    if (!file) continue;
    if (file.statusUpdatedAt > row.statusUpdatedAt) {
      toDb.push({ id: row.id, status: file.status, at: file.statusUpdatedAt });
    } else if (file.statusUpdatedAt < row.statusUpdatedAt) {
      toFiles.push({ id: row.id, status: row.status, at: row.statusUpdatedAt });
    }
  }
  return { toDb, toFiles };
}
