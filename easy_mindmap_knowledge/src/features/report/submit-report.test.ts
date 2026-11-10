// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { buildServices } from '@/app/composition';
import type { Services } from '@/app/composition';
import { loadCatalog } from '@/content/load-catalog';
import type { SqlExecutor } from '@/persistence';
import { makeRawCatalog } from '@/testing/fixtures';
import { createFakeReportStorage } from '@/testing/fake-report-storage';
import type { FakeReportStorage } from '@/testing/fake-report-storage';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import { MAX_BODY } from './logic/report-draft';
import type { DraftProblem, ReportDraft } from './logic/report-draft';
import { ReportInvalidError, ReportSaveError, submitReport } from './submit-report';

const APP_DATA = '/app-data';
const meta = { appVersion: '1.2.3', locale: 'en' as const };
const bytes = (b: number) => new Uint8Array([b]);

const questionDraft = (images: Uint8Array[], body = 'Wrong answer'): ReportDraft => ({
  context: { type: 'question', questionId: 'q1', sourceScreen: 'practice' },
  body,
  images,
});
const systemDraft = (images: Uint8Array[]): ReportDraft => ({
  context: { type: 'system' },
  body: 'Hello',
  images,
});

let db: SqlExecutor;
let storage: FakeReportStorage;

/** Real in-memory SQLite repos over the fake storage. Ids are report-1, report-2, ...; the clock is fixed at 5000. */
function build(executor: SqlExecutor): Services {
  let n = 0;
  return buildServices({
    executor,
    catalog: loadCatalog(makeRawCatalog()),
    now: () => 5000,
    newId: () => `report-${++n}`,
    reportStorage: storage,
  });
}

/** Resolves to the error that `p` rejects with; fails the test if `p` resolves. */
async function rejection(p: Promise<unknown>): Promise<unknown> {
  try {
    await p;
  } catch (e) {
    return e;
  }
  throw new Error('expected the promise to reject');
}

beforeEach(async () => {
  db = await createNodeSqliteExecutor();
  storage = createFakeReportStorage();
});

describe('submitReport', () => {
  it('a valid question draft with one image creates a new row and one stored file', async () => {
    const services = build(db);
    const id = await submitReport(services, questionDraft([bytes(7)]), meta);
    expect(id).toBe('report-1');
    const row = await services.repos.reports.get(id);
    expect(row).toMatchObject({
      id: 'report-1',
      type: 'question',
      status: 'new',
      questionId: 'q1',
      sourceScreen: 'practice',
      body: 'Wrong answer',
      appVersion: '1.2.3',
      locale: 'en',
      createdAt: 5000,
      statusUpdatedAt: 5000,
    });
    expect(row?.images).toEqual(['report-images/report-1-0.png']);
    expect([...storage.files.keys()]).toEqual([`${APP_DATA}/report-images/report-1-0.png`]);
    expect(storage.files.get(`${APP_DATA}/report-images/report-1-0.png`)).toEqual(bytes(7));
  });

  it.each<[DraftProblem, ReportDraft]>([
    ['empty', questionDraft([], ' \n\t ')],
    ['tooLong', questionDraft([], 'x'.repeat(MAX_BODY + 1))],
    ['tooManyImages', questionDraft([bytes(1), bytes(2)])],
  ])('an invalid draft (%s) throws ReportInvalidError with that reason and writes nothing', async (reason, draft) => {
    const services = build(db);
    const err = await rejection(submitReport(services, draft, meta));
    expect(err).toBeInstanceOf(ReportInvalidError);
    expect(err).toMatchObject({ reason });
    expect(storage.files.size).toBe(0);
    expect((await services.repos.reports.counts()).total).toBe(0);
  });

  it('a failed image save throws ReportSaveError (cause kept) and leaves no row and no file', async () => {
    const services = build(db);
    storage.failNext('saveImage');
    const err = await rejection(submitReport(services, questionDraft([bytes(1)]), meta));
    expect(err).toBeInstanceOf(ReportSaveError);
    expect(err).toMatchObject({ cause: expect.objectContaining({ message: 'fake report storage: saveImage failed' }) });
    expect(storage.files.size).toBe(0);
    expect((await services.repos.reports.counts()).total).toBe(0);
  });

  it('a failure while writing the row throws ReportSaveError and leaves no report row; a retry gets a fresh id', async () => {
    let failRowInsert = true;
    const flaky: SqlExecutor = {
      ...db,
      execute: async (sql, params) => {
        if (failRowInsert && sql.includes('INSERT INTO reports')) {
          failRowInsert = false;
          throw new Error('row insert failed');
        }
        return db.execute(sql, params);
      },
    };
    const services = build(flaky);
    const err = await rejection(submitReport(services, questionDraft([bytes(1)]), meta));
    expect(err).toBeInstanceOf(ReportSaveError);
    expect(await services.repos.reports.get('report-1')).toBeNull();
    expect((await services.repos.reports.counts()).total).toBe(0);
    const retry = await submitReport(services, questionDraft([bytes(2)]), meta);
    expect(retry).toBe('report-2');
    expect((await services.repos.reports.get(retry))?.images).toEqual(['report-images/report-2-0.png']);
  });

  it('two screenshots are saved and listed in order 0 then 1', async () => {
    const services = build(db);
    const id = await submitReport(services, systemDraft([bytes(1), bytes(2)]), meta);
    expect([...storage.files.keys()]).toEqual([
      `${APP_DATA}/report-images/${id}-0.png`,
      `${APP_DATA}/report-images/${id}-1.png`,
    ]);
    expect([...storage.files.values()]).toEqual([bytes(1), bytes(2)]);
    expect((await services.repos.reports.get(id))?.images).toEqual([
      `report-images/${id}-0.png`,
      `report-images/${id}-1.png`,
    ]);
  });
});
