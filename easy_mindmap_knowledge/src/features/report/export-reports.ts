import type { Services } from '@/app/composition';
import { exportReadme, exportedImageName, isSafeReportId, parseExportedStatus, toExportedReport } from './logic/export-format';
import type { StatusState } from './logic/reconcile';
import { reconcile } from './logic/reconcile';

export const SETTING_EXPORT_DIR = 'report_export_dir';

const json = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

/** The remembered export folder, or null when nothing has been exported yet. */
export const savedExportDir = (services: Services): Promise<string | null> => services.repos.settings.get(SETTING_EXPORT_DIR);

/** The folder to export to: the remembered one, else the storage default. */
export async function currentExportDir(services: Services): Promise<string> {
  return (await savedExportDir(services)) ?? (await services.reportStorage.defaultExportDir());
}

export const rememberExportDir = (services: Services, dir: string): Promise<void> => services.repos.settings.set(SETTING_EXPORT_DIR, dir);

/**
 * A file stamped later than now + this is untrusted and ignored (not clamped): otherwise a far-future time would
 * win every later sync against the app's own `now()` stamps and pin the status. 24h tolerates clock skew
 * between the machine that edited the file and this one.
 */
export const FUTURE_SKEW_MS = 24 * 60 * 60 * 1000;

/** Every report file in the folder failed to read (e.g. the app lost its access to it), as opposed to files being missing. */
export class ExportFolderInaccessibleError extends Error {
  constructor(readonly dir: string) {
    super(`Cannot read the report files in ${dir}`);
    this.name = 'ExportFolderInaccessibleError';
  }
}

/**
 * Syncs first (so a status an agent changed in a file is never overwritten), then writes README.md, one
 * `<id>.json` per report with its images under `images/`, and `index.json` LAST so a failed copy never leaves an
 * index listing missing files. Nothing is written outside `dir`.
 */
export async function exportReports(services: Services, dir: string): Promise<{ updatedDb: number }> {
  const { updatedDb } = await syncReports(services, dir);
  const storage = services.reportStorage;
  const rows = (await services.repos.reports.listAll()).filter((r) => isSafeReportId(r.id));
  await storage.writeText(dir, 'README.md', exportReadme());
  for (const r of rows) {
    for (const stored of r.images) await storage.writeBytes(dir, exportedImageName(stored), await storage.readImage(stored));
    await storage.writeText(dir, `${r.id}.json`, json(toExportedReport(r)));
  }
  await storage.writeText(
    dir,
    'index.json',
    json(rows.map((r) => ({ id: r.id, type: r.type, status: r.status, createdAt: r.createdAt, statusUpdatedAt: r.statusUpdatedAt, file: `${r.id}.json` }))),
  );
  return { updatedDb };
}

/**
 * Two-way status sync with the files in `dir`. File content is untrusted: only `status` and
 * `statusUpdatedAt` are taken, and file names come from the database ids alone.
 * `updatedDb` counts status changes; a newer file with the same status only advances the stored time.
 */
export async function syncReports(services: Services, dir: string): Promise<{ updatedDb: number; updatedFiles: number }> {
  const { reports } = services.repos;
  const rows = (await reports.listAll()).filter((r) => isSafeReportId(r.id));
  const limit = services.now() + FUTURE_SKEW_MS;
  const files = new Map<string, StatusState>();
  let failedReads = 0;
  for (const r of rows) {
    try {
      const text = await services.reportStorage.readText(dir, `${r.id}.json`);
      const parsed = text === null ? null : parseExportedStatus(text);
      if (parsed && parsed.statusUpdatedAt <= limit) files.set(r.id, parsed);
    } catch (e) {
      failedReads++;
      console.warn(`Skipped unreadable report file ${r.id}.json`, e);
    }
  }
  // One bad file is skipped; when every read threw, the folder itself is unusable and the caller must say so.
  if (rows.length > 0 && failedReads === rows.length) throw new ExportFolderInaccessibleError(dir);
  const { toDb, toFiles } = reconcile(rows, files);
  const byId = new Map(rows.map((r) => [r.id, r]));
  let updatedDb = 0;
  for (const c of toDb) {
    await reports.setStatus(c.id, c.status, c.at);
    if (byId.get(c.id)?.status !== c.status) updatedDb++;
  }
  for (const c of toFiles) {
    const row = byId.get(c.id);
    if (row) await services.reportStorage.writeText(dir, `${c.id}.json`, json(toExportedReport(row)));
  }
  return { updatedDb, updatedFiles: toFiles.length };
}
