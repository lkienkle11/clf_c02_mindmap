import { appDataDir, dirname, join } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { exists, mkdir, readFile, readTextFile, writeFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { assertSafeRel, imageRelPath } from './report-storage';
import type { ReportStorage } from './report-storage';

const EXPORT_DIR = 'reports';

async function ensureParent(path: string): Promise<void> {
  await mkdir(await dirname(path), { recursive: true });
}

export function createTauriReportStorage(): ReportStorage {
  return {
    async saveImage(reportId, idx, bytes) {
      const rel = imageRelPath(reportId, idx, bytes);
      const path = await join(await appDataDir(), rel);
      await ensureParent(path);
      await writeFile(path, bytes);
      return rel;
    },
    async readImage(relPath) {
      assertSafeRel(relPath);
      return readFile(await join(await appDataDir(), relPath));
    },
    defaultExportDir: async () => join(await appDataDir(), EXPORT_DIR),
    async pickExportDir() {
      const picked = await open({ directory: true, multiple: false, recursive: true });
      return typeof picked === 'string' ? picked : null;
    },
    async writeText(dir, rel, text) {
      assertSafeRel(rel);
      const path = await join(dir, rel);
      await ensureParent(path);
      await writeTextFile(path, text);
    },
    async writeBytes(dir, rel, bytes) {
      assertSafeRel(rel);
      const path = await join(dir, rel);
      await ensureParent(path);
      await writeFile(path, bytes);
    },
    async readText(dir, rel) {
      assertSafeRel(rel);
      const path = await join(dir, rel);
      if (!(await exists(path))) return null;
      return readTextFile(path);
    },
  };
}
