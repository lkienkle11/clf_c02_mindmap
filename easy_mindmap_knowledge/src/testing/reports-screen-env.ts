// Test-only: services with a real in-memory SQLite reports repository and an in-memory ReportStorage.
import { AppState } from '@/app/app-state.svelte';
import type { Services } from '@/app/composition';
import { createReportsRepo } from '@/persistence/repositories/reports';
import type { ReportRow } from '@/persistence';
import { createFakeReportStorage } from './fake-report-storage';
import type { FakeReportStorage } from './fake-report-storage';
import { createNodeSqliteExecutor } from './node-sqlite-executor';
import { makePracticeEnv } from './practice-env';

export type ReportSeed = Omit<ReportRow, 'images'> & {
  /** Image files to store; each becomes a relative path on the report. */
  imageBytes?: Uint8Array[];
  /** Extra image paths that have no file in storage (a missing screenshot). */
  missingImages?: string[];
};

export const makeReportSeed = (over: Partial<ReportSeed> = {}): ReportSeed => ({
  id: 'r1', type: 'system', status: 'new', createdAt: 1_000, statusUpdatedAt: 1_000, body: 'something broke',
  appVersion: '1.0.0', locale: 'en', sourceScreen: null, questionId: null, lessonId: null, attemptId: null,
  position: null, optionOrder: null, selected: null, isCorrect: null, ...over,
});

export interface ReportsScreenEnv {
  services: Services;
  appState: AppState;
  storage: FakeReportStorage;
  /** Wall clock used by `services.now`; tests move it to check `statusUpdatedAt`. */
  clock: { now: number };
}

export async function makeReportsScreenEnv(seeds: ReportSeed[] = [], o: { now?: number } = {}): Promise<ReportsScreenEnv> {
  const base = await makePracticeEnv();
  const storage = createFakeReportStorage();
  const reports = createReportsRepo(await createNodeSqliteExecutor());
  for (const { imageBytes = [], missingImages = [], ...row } of seeds) {
    const paths: string[] = [];
    for (const [i, bytes] of imageBytes.entries()) paths.push(await storage.saveImage(row.id, i, bytes));
    await reports.create(row, [...paths, ...missingImages]);
  }
  const clock = { now: o.now ?? 5_000_000 };
  const services: Services = { ...base.services, now: () => clock.now, reportStorage: storage, repos: { ...base.services.repos, reports } };
  const appState = new AppState(services);
  await appState.refresh();
  return { services, appState, storage, clock };
}
