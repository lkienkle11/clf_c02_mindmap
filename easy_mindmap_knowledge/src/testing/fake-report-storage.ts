// Test-only in-memory ReportStorage. Nothing outside tests may import this module.
import { assertSafeRel, imageRelPath } from '@/persistence/report-storage';
import type { ReportStorage } from '@/persistence/report-storage';

export type ReportStorageOp = keyof ReportStorage;

export interface FakeReportStorage extends ReportStorage {
  /** Keyed by `<dir>/<rel>`; image files are keyed `<appDataDir>/<rel>`. */
  files: Map<string, Uint8Array | string>;
  /** What pickExportDir resolves to; null simulates cancelling. */
  pickedDir: string | null;
  /** Makes the next call of `op` reject once. */
  failNext(op: ReportStorageOp): void;
  /** Makes every call of `op` reject (like a folder the app may no longer access). */
  failAlways(op: ReportStorageOp): void;
}

const APP_DATA = '/app-data';

export function createFakeReportStorage(): FakeReportStorage {
  const files = new Map<string, Uint8Array | string>();
  const failing = new Set<ReportStorageOp>();
  const alwaysFailing = new Set<ReportStorageOp>();
  const guard = (op: ReportStorageOp): void => {
    if (alwaysFailing.has(op) || failing.delete(op)) throw new Error(`fake report storage: ${op} failed`);
  };
  const s: FakeReportStorage = {
    files,
    pickedDir: null,
    failNext: (op) => void failing.add(op),
    failAlways: (op) => void alwaysFailing.add(op),
    async saveImage(reportId, idx, bytes) {
      guard('saveImage');
      const rel = imageRelPath(reportId, idx, bytes);
      files.set(`${APP_DATA}/${rel}`, bytes);
      return rel;
    },
    async readImage(relPath) {
      guard('readImage');
      assertSafeRel(relPath);
      const f = files.get(`${APP_DATA}/${relPath}`);
      if (!(f instanceof Uint8Array)) throw new Error(`no such image: ${relPath}`);
      return f;
    },
    async defaultExportDir() {
      guard('defaultExportDir');
      return `${APP_DATA}/reports`;
    },
    async pickExportDir() {
      guard('pickExportDir');
      return s.pickedDir;
    },
    async writeText(dir, rel, text) {
      guard('writeText');
      assertSafeRel(rel);
      files.set(`${dir}/${rel}`, text);
    },
    async writeBytes(dir, rel, bytes) {
      guard('writeBytes');
      assertSafeRel(rel);
      files.set(`${dir}/${rel}`, bytes);
    },
    async readText(dir, rel) {
      guard('readText');
      assertSafeRel(rel);
      const f = files.get(`${dir}/${rel}`);
      return typeof f === 'string' ? f : null;
    },
  };
  return s;
}
