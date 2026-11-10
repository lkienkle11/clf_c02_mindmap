import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PNG_BYTES, JPEG_BYTES } from '@/testing/report-env';
import { makeReportSeed, makeReportsScreenEnv } from '@/testing/reports-screen-env';
import type { ReportsScreenEnv } from '@/testing/reports-screen-env';
import { ExportFolderInaccessibleError, exportReports, syncReports } from './export-reports';

const DIR = '/out';
let env: ReportsScreenEnv;
const file = (rel: string) => env.storage.files.get(`${DIR}/${rel}`);
const edit = (id: string, patch: object) => {
  const cur = JSON.parse(file(`${id}.json`) as string) as object;
  env.storage.files.set(`${DIR}/${id}.json`, JSON.stringify({ ...cur, ...patch }));
};
const status = async (id: string) => (await env.services.repos.reports.get(id))?.status;

beforeEach(async () => {
  env = await makeReportsScreenEnv([
    makeReportSeed({ id: 'r1', questionId: 'q1', type: 'question', imageBytes: [PNG_BYTES, JPEG_BYTES] }),
    makeReportSeed({ id: 'r2', createdAt: 2_000 }),
  ]);
});
afterEach(() => vi.restoreAllMocks());

describe('exportReports', () => {
  it('writes the README, the index, one JSON per report and its images with their extensions, only under dir', async () => {
    await exportReports(env.services, DIR);
    expect(file('README.md')).toContain('"status": "handled"');
    expect(JSON.parse(file('index.json') as string)).toHaveLength(2);
    const r1 = JSON.parse(file('r1.json') as string) as { images: string[]; refs: { questionId: string } };
    expect(r1.refs.questionId).toBe('q1');
    expect(r1.images).toEqual(['images/r1-0.png', 'images/r1-1.jpg']);
    expect(file('images/r1-0.png')).toEqual(PNG_BYTES);
    expect(file('images/r1-1.jpg')).toEqual(JPEG_BYTES);
    expect(JSON.parse(file('r2.json') as string)).toMatchObject({ id: 'r2', images: [] });
    const written = [...env.storage.files.keys()].filter((k) => !k.startsWith('/app-data/report-images/'));
    expect(written.every((k) => k.startsWith(`${DIR}/`))).toBe(true);
  });

  it('syncs before writing so an agent edit is not overwritten by an export', async () => {
    await exportReports(env.services, DIR);
    edit('r1', { status: 'handled', statusUpdatedAt: 9_000 });
    expect(await exportReports(env.services, DIR)).toEqual({ updatedDb: 1 });
    expect(JSON.parse(file('r1.json') as string)).toMatchObject({ status: 'handled', statusUpdatedAt: 9_000 });
    expect(await status('r1')).toBe('handled');
  });

  it('writes index.json last: a failed image copy leaves no index', async () => {
    env.storage.failNext('writeBytes');
    await expect(exportReports(env.services, DIR)).rejects.toThrow();
    expect(file('index.json')).toBeUndefined();
    expect(await status('r1')).toBe('new');
  });

  it('rejects when the folder is not writable and leaves the database unchanged', async () => {
    env.storage.failNext('writeText');
    await expect(exportReports(env.services, DIR)).rejects.toThrow();
    expect(await status('r1')).toBe('new');
    expect((await env.services.repos.reports.get('r1'))?.statusUpdatedAt).toBe(1_000);
  });
});

describe('syncReports', () => {
  beforeEach(() => exportReports(env.services, DIR));

  it('does nothing when nothing changed', async () => {
    expect(await syncReports(env.services, DIR)).toEqual({ updatedDb: 0, updatedFiles: 0 });
  });

  it('applies an agent edit (handled with a newer time) to the database', async () => {
    edit('r1', { status: 'handled', statusUpdatedAt: 9_000 });
    expect(await syncReports(env.services, DIR)).toEqual({ updatedDb: 1, updatedFiles: 0 });
    const r = await env.services.repos.reports.get('r1');
    expect(r).toMatchObject({ status: 'handled', statusUpdatedAt: 9_000 });
    expect(await status('r2')).toBe('new');
  });

  it('rewrites the file when the database is newer', async () => {
    await env.services.repos.reports.setStatus('r2', 'handled', 8_000);
    expect(await syncReports(env.services, DIR)).toEqual({ updatedDb: 0, updatedFiles: 1 });
    expect(JSON.parse(file('r2.json') as string)).toMatchObject({ status: 'handled', statusUpdatedAt: 8_000 });
  });

  it('skips a malformed or missing file without throwing', async () => {
    env.storage.files.set(`${DIR}/r1.json`, '{not json');
    env.storage.files.delete(`${DIR}/r2.json`);
    expect(await syncReports(env.services, DIR)).toEqual({ updatedDb: 0, updatedFiles: 0 });
  });

  it('skips a file whose read fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    env.storage.failNext('readText');
    edit('r1', { status: 'handled', statusUpdatedAt: 9_000 });
    edit('r2', { status: 'handled', statusUpdatedAt: 9_000 });
    const r = await syncReports(env.services, DIR);
    expect(r.updatedDb).toBe(1);
  });

  it('throws ExportFolderInaccessibleError, changing nothing, when every read fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await exportReports(env.services, DIR);
    edit('r1', { status: 'handled', statusUpdatedAt: 9_000 });
    env.storage.failAlways('readText');
    await expect(syncReports(env.services, DIR)).rejects.toBeInstanceOf(ExportFolderInaccessibleError);
    expect(await status('r1')).toBe('new');
  });

  it('does not treat a folder with no files as inaccessible', async () => {
    expect(await syncReports(env.services, '/empty')).toEqual({ updatedDb: 0, updatedFiles: 0 });
  });

  it('ignores a file stamped more than a day in the future and keeps the in-app toggle across syncs', async () => {
    const now = env.clock.now;
    edit('r1', { status: 'handled', statusUpdatedAt: now + 2 * 24 * 3_600_000 });
    expect(await syncReports(env.services, DIR)).toEqual({ updatedDb: 0, updatedFiles: 0 });
    expect(await env.services.repos.reports.get('r1')).toMatchObject({ status: 'new', statusUpdatedAt: 1_000 });
    await env.services.repos.reports.setStatus('r2', 'handled', now);
    edit('r2', { status: 'new', statusUpdatedAt: now + 2 * 24 * 3_600_000 });
    await syncReports(env.services, DIR);
    await syncReports(env.services, DIR);
    expect(await status('r2')).toBe('handled');
  });

  it('applies a file stamped within the allowed skew', async () => {
    edit('r1', { status: 'handled', statusUpdatedAt: env.clock.now + 3_600_000 });
    expect(await syncReports(env.services, DIR)).toEqual({ updatedDb: 1, updatedFiles: 0 });
    expect(await status('r1')).toBe('handled');
  });

  it('adopts a newer time with the same status without rewriting the file or counting a status change', async () => {
    const before = file('r1.json');
    edit('r1', { statusUpdatedAt: 4_000 });
    const edited = file('r1.json');
    expect(await syncReports(env.services, DIR)).toEqual({ updatedDb: 0, updatedFiles: 0 });
    expect(await env.services.repos.reports.get('r1')).toMatchObject({ status: 'new', statusUpdatedAt: 4_000 });
    expect(file('r1.json')).toBe(edited);
    expect(edited).not.toBe(before);
  });

  it('accepts a file with a byte order mark', async () => {
    env.storage.files.set(`${DIR}/r1.json`, `\uFEFF${JSON.stringify({ status: 'handled', statusUpdatedAt: 9_000 })}`);
    expect(await syncReports(env.services, DIR)).toMatchObject({ updatedDb: 1 });
  });

  it('takes only status and time from a hostile file', async () => {
    const before = await env.services.repos.reports.listAll();
    env.storage.files.set(
      `${DIR}/r1.json`,
      '{"__proto__":{"status":"handled"},"id":"r2","body":"pwned","images":["../../etc/passwd"],"status":"handled","statusUpdatedAt":8600000,"extra":{"a":1}}',
    );
    env.storage.files.set(`${DIR}/r2.json`, JSON.stringify({ id: 'r1', status: 'handled', statusUpdatedAt: 1e300 }));
    env.storage.files.set(`${DIR}/ghost.json`, JSON.stringify({ id: 'ghost', status: 'handled', statusUpdatedAt: 9_000 }));
    await syncReports(env.services, DIR);
    const after = await env.services.repos.reports.listAll();
    const r1 = after.find((r) => r.id === 'r1');
    expect(r1).toEqual({ ...before.find((r) => r.id === 'r1'), status: 'handled', statusUpdatedAt: 8_600_000 });
    expect(after.find((r) => r.id === 'r2')).toEqual(before.find((r) => r.id === 'r2'));
    expect(after).toHaveLength(2);
    expect(({} as { status?: string }).status).toBeUndefined();
    expect(Object.keys(r1 ?? {}).sort()).toEqual(Object.keys(before[0]).sort());
    expect(r1?.body).toBe(before.find((r) => r.id === 'r1')?.body);
  });
});
