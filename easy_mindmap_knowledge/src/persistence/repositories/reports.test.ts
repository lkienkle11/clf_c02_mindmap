// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import type { SqlExecutor } from '../sql-executor';
import type { ReportRow } from '../records';
import { createReportsRepo } from './reports';

let db: SqlExecutor;
beforeEach(async () => {
  db = await createNodeSqliteExecutor();
});

const base = (over: Partial<Omit<ReportRow, 'images'>> = {}): Omit<ReportRow, 'images'> => ({
  id: 'r1',
  type: 'system',
  status: 'new',
  createdAt: 1000,
  statusUpdatedAt: 1000,
  body: 'something broke',
  appVersion: '1.0.0',
  locale: 'en',
  sourceScreen: null,
  questionId: null,
  lessonId: null,
  attemptId: null,
  position: null,
  optionOrder: null,
  selected: null,
  isCorrect: null,
  ...over,
});

describe('reports repository', () => {
  it('round-trips a question report with arrays, nullable fields and ordered images', async () => {
    const repo = createReportsRepo(db);
    const row = base({
      id: 'q1', type: 'question', sourceScreen: 'practice', questionId: 'qq', attemptId: 'a1', position: 3,
      optionOrder: ['b', 'a', 'c'], selected: ['a'], isCorrect: false,
    });
    await repo.create(row, ['img/2.png', 'img/1.png']);
    expect(await repo.get('q1')).toEqual({ ...row, images: ['img/2.png', 'img/1.png'] });
    const sys = base({ id: 's1' });
    await repo.create(sys, []);
    expect(await repo.get('s1')).toEqual({ ...sys, images: [] });
    expect(await repo.get('nope')).toBeNull();
  });

  it('stores isCorrect true as well', async () => {
    const repo = createReportsRepo(db);
    await repo.create(base({ id: 'c', isCorrect: true }), []);
    expect((await repo.get('c'))?.isCorrect).toBe(true);
  });

  it('paginates newest first', async () => {
    const repo = createReportsRepo(db);
    for (let i = 1; i <= 25; i++) await repo.create(base({ id: `r${i}`, createdAt: i }), []);
    const p2 = await repo.list({ page: 2, pageSize: 10 });
    expect(p2.total).toBe(25);
    expect(p2.items.map((r) => r.id)).toEqual(Array.from({ length: 10 }, (_, i) => `r${15 - i}`));
    const p3 = await repo.list({ page: 3, pageSize: 10 });
    expect(p3.items).toHaveLength(5);
  });

  it('filters by type, status, date range and text (literal % and _)', async () => {
    const repo = createReportsRepo(db);
    await repo.create(base({ id: 'a', type: 'question', createdAt: 100, body: 'Hello World' }), ['x.png']);
    await repo.create(base({ id: 'b', type: 'lesson', createdAt: 200, body: 'only 50%_done here', status: 'handled' }), []);
    await repo.create(base({ id: 'c', type: 'system', createdAt: 300, body: '50xxdone' }), []);
    const ids = async (q: object) => (await repo.list({ page: 1, pageSize: 10, ...q })).items.map((r) => r.id);
    expect(await ids({ type: 'lesson' })).toEqual(['b']);
    expect(await ids({ status: 'new' })).toEqual(['c', 'a']);
    expect(await ids({ fromMs: 150, toMs: 250 })).toEqual(['b']);
    expect(await ids({ text: 'hello' })).toEqual(['a']);
    expect(await ids({ text: '50%_done' })).toEqual(['b']);
    expect((await repo.list({ page: 1, pageSize: 10, type: 'question' })).items[0].images).toEqual(['x.png']);
    expect((await repo.list({ page: 1, pageSize: 10, status: 'new' })).total).toBe(2);
  });

  it('matches text case-insensitively with Unicode folding (Vietnamese)', async () => {
    const repo = createReportsRepo(db);
    await repo.create(base({ id: 'vi', body: 'Đã lỗi' }), []);
    await repo.create(base({ id: 'other', createdAt: 2000, body: 'fine' }), []);
    for (const text of ['đã', 'ĐÃ', 'LỖI']) {
      const res = await repo.list({ page: 1, pageSize: 10, text });
      expect(res.items.map((r) => r.id), text).toEqual(['vi']);
      expect(res.total).toBe(1);
    }
  });

  it('paginates a text-filtered set newest first with images', async () => {
    const repo = createReportsRepo(db);
    for (let i = 1; i <= 25; i++) await repo.create(base({ id: `m${i}`, createdAt: i, body: `needle ${i}` }), [`i${i}.png`]);
    for (let i = 1; i <= 5; i++) await repo.create(base({ id: `x${i}`, createdAt: 100 + i, body: 'hay' }), []);
    const p2 = await repo.list({ page: 2, pageSize: 10, text: 'NEEDLE' });
    expect(p2.total).toBe(25);
    expect(p2.items.map((r) => r.id)).toEqual(Array.from({ length: 10 }, (_, i) => `m${15 - i}`));
    expect(p2.items[0].images).toEqual(['i15.png']);
  });

  it('setStatus updates status and timestamp', async () => {
    const repo = createReportsRepo(db);
    await repo.create(base(), []);
    await repo.setStatus('r1', 'handled', 5000);
    const r = await repo.get('r1');
    expect(r?.status).toBe('handled');
    expect(r?.statusUpdatedAt).toBe(5000);
  });

  it('counts total, new and by type; listAll returns everything', async () => {
    const repo = createReportsRepo(db);
    expect(await repo.counts()).toEqual({ total: 0, newCount: 0, byType: { question: 0, lesson: 0, system: 0, attempt: 0 } });
    await repo.create(base({ id: 'a', type: 'question', createdAt: 1 }), ['p.png']);
    await repo.create(base({ id: 'b', type: 'question', createdAt: 2, status: 'handled' }), []);
    await repo.create(base({ id: 'c', type: 'system', createdAt: 3 }), []);
    await repo.create(base({ id: 'd', type: 'attempt', createdAt: 4, sourceScreen: 'result', attemptId: 'a1' }), ['s.png']);
    expect(await repo.counts()).toEqual({ total: 4, newCount: 3, byType: { question: 2, lesson: 0, system: 1, attempt: 1 } });
    const all = await repo.listAll();
    expect(all.map((r) => r.id)).toEqual(['d', 'c', 'b', 'a']);
    expect(all[3].images).toEqual(['p.png']);
  });
});
