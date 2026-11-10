// Test-only: services with an in-memory ReportStorage and a spy on reports.create (jsdom cannot host node:sqlite).
import type { Services } from '@/app/composition';
import type { ReportRow } from '@/persistence';
import { makePracticeEnv } from './practice-env';
import { createFakeReportStorage } from './fake-report-storage';
import type { FakeReportStorage } from './fake-report-storage';

export interface ReportEnv {
  services: Services;
  storage: FakeReportStorage;
  /** Every report row passed to reports.create, with its image paths. */
  created: { row: Omit<ReportRow, 'images'>; paths: string[] }[];
  /** Makes the next reports.create reject once. */
  failCreateOnce(): void;
  /** How many times reports.create was called, including failed and held calls. */
  createCalls(): number;
  /** Makes the next reports.create wait until `release()` (it then succeeds) or `fail()` (it then rejects). */
  holdCreate(): { release(): void; fail(): void };
}

export async function makeReportEnv(): Promise<ReportEnv> {
  const base = await makePracticeEnv();
  const storage = createFakeReportStorage();
  const created: ReportEnv['created'] = [];
  let failCreate = false;
  let calls = 0;
  let held: Promise<void> | null = null;
  const services: Services = {
    ...base.services,
    reportStorage: storage,
    repos: {
      ...base.services.repos,
      reports: {
        ...base.services.repos.reports,
        create: async (row, paths) => {
          calls++;
          if (held) {
            const wait = held;
            held = null;
            await wait;
          }
          if (failCreate) {
            failCreate = false;
            throw new Error('create failed');
          }
          created.push({ row, paths });
        },
      },
    },
  };
  return {
    services,
    storage,
    created,
    failCreateOnce: () => void (failCreate = true),
    createCalls: () => calls,
    holdCreate() {
      let settle!: (ok: boolean) => void;
      held = new Promise<void>((resolve, reject) => {
        settle = (ok) => (ok ? resolve() : reject(new Error('create failed')));
      });
      return { release: () => settle(true), fail: () => settle(false) };
    },
  };
}

/** Bytes that start with the PNG signature. */
export const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
/** Bytes that start with the JPEG signature. */
export const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
