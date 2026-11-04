// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadCatalog } from '@/content/load-catalog';
import { buildServices } from '@/app/composition';
import type { Services } from '@/app/composition';
import { makeQuestion, makeRawCatalog } from '@/testing/fixtures';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import { AttemptMissingError } from '@/persistence';
import type { SqlExecutor } from '@/persistence';
import {
  CorruptAttemptError, DEFAULT_PRACTICE_OPTIONS, FREEZE_MAX_TICK_MS, KnowledgeNotAllowedError, NoQuestionsError, PracticeSession,
  loadLastOptions, saveLastOptions,
} from './index';
import type { PracticeOptions } from './index';

const NOW = Date.UTC(2026, 5, 15, 12, 0, 0);
let clock = NOW;
let services: Services;
let db: SqlExecutor;
let executes: string[];
let gate: Promise<void> | null = null;
let gateHit: (() => void) | null = null;
let failSql: string | null = null;
let idN = 0;
const onSubmitted = vi.fn(async () => {});

function qs(topicId: string | null, n: number, prefix: string, multi = false) {
  return Array.from({ length: n }, (_, i) =>
    makeQuestion({
      id: `${prefix}${i}`, topicId,
      options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }, { key: 'C', text: 'c' }],
      correct: multi ? ['A', 'B'] : ['A'], multi, explanation: `why ${prefix}${i}`,
    }));
}

async function setup() {
  const raw = makeRawCatalog();
  raw.questions = [...qs('compute', 12, 'c'), ...qs('storage', 4, 's'), ...qs('networking', 12, 'n', true), ...qs(null, 40, 'x')];
  const base = await createNodeSqliteExecutor();
  executes = [];
  gate = null; gateHit = null; failSql = null;
  db = {
    select: (sql, params) => base.select(sql, params),
    execute: async (sql, params) => {
      if (failSql && sql.includes(failSql)) throw new Error('injected');
      if (gate && sql.includes("SET status = 'submitted'")) { gateHit?.(); await gate; }
      executes.push(sql);
      return base.execute(sql, params);
    },
  };
  services = buildServices({ executor: db, catalog: loadCatalog(raw), now: () => clock, newId: () => `id-${++idN}` });
}

beforeEach(async () => {
  clock = NOW; idN = 0; onSubmitted.mockClear(); onSubmitted.mockResolvedValue(undefined);
  await setup();
});

const opts = (o: Partial<PracticeOptions> = {}): PracticeOptions => ({ ...DEFAULT_PRACTICE_OPTIONS, ...o });
const start = (topic = 'compute', o: Partial<PracticeOptions> = {}) =>
  PracticeSession.start(services, topic, opts(o), onSubmitted);

/** Answers the first n questions correctly (A) and the rest wrongly (B). */
async function answer(s: PracticeSession, correctCount: number) {
  for (const q of s.questions) {
    await s.select(q.position, q.position < correctCount ? ['A'] : ['B']);
  }
}

describe('start', () => {
  it('stores 10 questions with optionOrder, selected [] and isCorrect null', async () => {
    const s = await start();
    expect(s.attemptId).toBe('id-1');
    const found = await services.repos.attempts.findInProgress();
    expect(found!.attempt).toMatchObject({ kind: 'practice', topicId: 'compute', reviewAllowed: false, status: 'in_progress' });
    expect(found!.questions).toHaveLength(10);
    for (const q of found!.questions) {
      expect([...q.optionOrder].sort()).toEqual(['A', 'B', 'C']);
      expect(q.selected).toEqual([]);
      expect(q.isCorrect).toBeNull();
    }
    expect(s.questions.map((q) => q.questionId)).toEqual(found!.questions.map((q) => q.questionId));
  });
  it('capstone uses 10 like every topic', async () => {
    const s = await start('capstone');
    expect(s.questions).toHaveLength(10);
  });
  it('pool smaller than count uses all', async () => {
    expect((await start('storage')).questions).toHaveLength(4);
  });
  it('empty pool throws NoQuestionsError and creates nothing', async () => {
    await expect(start('databases')).rejects.toBeInstanceOf(NoQuestionsError);
    expect(await services.repos.attempts.findInProgress()).toBeNull();
  });
  it('marks multi questions and saves last options', async () => {
    const s = await start('networking', { allowReview: true, limitMs: 60000, clockMode: 'run', onHidden: 'freeze' });
    expect(s.questions.every((q) => q.multi)).toBe(true);
    expect(s.allowReview).toBe(true);
    expect(await loadLastOptions(services.repos.settings)).toEqual({ allowReview: true, limitMs: 60000, clockMode: 'run', onHidden: 'freeze' });
  });
});

describe('options persistence', () => {
  it('defaults, round trip, invalid json and wrong shape', async () => {
    const st = services.repos.settings;
    expect(await loadLastOptions(st)).toEqual(DEFAULT_PRACTICE_OPTIONS);
    await saveLastOptions(st, { allowReview: true, limitMs: 1000, clockMode: 'run', onHidden: 'freeze' });
    expect(await loadLastOptions(st)).toEqual({ allowReview: true, limitMs: 1000, clockMode: 'run', onHidden: 'freeze' });
    await st.set('practice_last_options', '{nope');
    expect(await loadLastOptions(st)).toEqual(DEFAULT_PRACTICE_OPTIONS);
    await st.set('practice_last_options', JSON.stringify({ allowReview: 'x', limitMs: 1, clockMode: 'freeze', onHidden: 'freeze' }));
    expect(await loadLastOptions(st)).toEqual(DEFAULT_PRACTICE_OPTIONS);
    await st.set('practice_last_options', 'null');
    expect(await loadLastOptions(st)).toEqual(DEFAULT_PRACTICE_OPTIONS);
  });
});

describe('resume', () => {
  it('reproduces order, optionOrder and selected after a simulated crash', async () => {
    const s = await start('compute', { limitMs: 600000 });
    await s.select(0, ['B']);
    await s.select(3, ['C']);
    const found = (await services.repos.attempts.findInProgress())!;
    const { session, autoSubmit } = await PracticeSession.resume(services, found, onSubmitted);
    expect(autoSubmit).toBe(false);
    expect(session.attemptId).toBe(s.attemptId);
    expect(session.questions.map((q) => q.questionId)).toEqual(s.questions.map((q) => q.questionId));
    expect(session.questions.map((q) => q.optionOrder)).toEqual(s.questions.map((q) => q.optionOrder));
    expect(session.questions[0].selected).toEqual(['B']);
    expect(session.questions[3].selected).toEqual(['C']);
    expect(session.remainingMs).toBe(600000);
  });
  it('throws CorruptAttemptError for zero, unknown or partial questions', async () => {
    await start();
    const found = (await services.repos.attempts.findInProgress())!;
    await expect(PracticeSession.resume(services, { ...found, questions: [] }, onSubmitted)).rejects.toBeInstanceOf(CorruptAttemptError);
    const unknown = { ...found, questions: found.questions.map((q, i) => (i === 0 ? { ...q, questionId: 'ghost' } : q)) };
    await expect(PracticeSession.resume(services, unknown, onSubmitted)).rejects.toBeInstanceOf(CorruptAttemptError);
    const partial = { ...found, questions: found.questions.slice(0, 3) };
    await expect(PracticeSession.resume(services, partial, onSubmitted)).rejects.toBeInstanceOf(CorruptAttemptError);
  });
  it('accepts a small pool where fewer than the count exist', async () => {
    await start('storage');
    const found = (await services.repos.attempts.findInProgress())!;
    await expect(PracticeSession.resume(services, found, onSubmitted)).resolves.toBeDefined();
  });
  it('run clock past deadline => autoSubmit, timeout grades only answered', async () => {
    const s = await start('compute', { limitMs: 60000, clockMode: 'run', onHidden: 'freeze' });
    await s.select(0, ['A']);
    clock = NOW + 120000;
    const found = (await services.repos.attempts.findInProgress())!;
    const { session, autoSubmit } = await PracticeSession.resume(services, found, onSubmitted);
    expect(autoSubmit).toBe(true);
    const r = await session.submit('timeout');
    expect(r.correct).toBe(1);
    expect(r.total).toBe(10);
    expect((await services.repos.attempts.listSubmitted())[0].submitReason).toBe('timeout');
  });
  it('freeze with 0 remaining => autoSubmit', async () => {
    const s = await start('compute', { limitMs: 1000 });
    await s.tick(10); // not enough to expire
    const found = (await services.repos.attempts.findInProgress())!;
    const zero = { ...found, attempt: { ...found.attempt, clock: { ...found.attempt.clock, remainingMs: 0 } } };
    expect((await PracticeSession.resume(services, zero, onSubmitted)).autoSubmit).toBe(true);
  });
});

describe('select', () => {
  it('persists immediately; single truncates, multi keeps all', async () => {
    const s = await start('compute');
    await s.select(0, ['A', 'B']);
    expect(s.questions[0].selected).toEqual(['A']);
    expect((await services.repos.attempts.questionsOf(s.attemptId))[0].selected).toEqual(['A']);
    const m = await start('networking');
    await m.select(1, ['A', 'B']);
    expect((await services.repos.attempts.questionsOf(m.attemptId))[1].selected).toEqual(['A', 'B']);
  });
  it('rejects when saveAnswer fails', async () => {
    const s = await start();
    const spy = vi.spyOn(services.repos.attempts, 'saveAnswer').mockRejectedValueOnce(new Error('disk'));
    await expect(s.select(0, ['A'])).rejects.toThrow('disk');
  });
  it('goTo clamps to range', async () => {
    const s = await start();
    s.goTo(4); expect(s.index).toBe(4);
    s.goTo(99); expect(s.index).toBe(4);
    s.goTo(-1); expect(s.index).toBe(4);
  });
});

describe('submit', () => {
  it('8/10 => passed, scorePct 80, attempt submitted, stats boxes', async () => {
    const s = await start();
    await answer(s, 8);
    const r = await s.submit('manual');
    expect(r).toMatchObject({ scorePct: 80, correct: 8, total: 10, passed: true });
    expect(r.items).toHaveLength(10);
    expect(r.items[0]).toMatchObject({ selected: ['A'], correct: ['A'], isCorrect: true });
    expect(r.items[0].explanation).toMatch(/^why/);
    expect(r.items.map((i) => i.optionOrder)).toEqual(s.questions.map((q) => [...q.optionOrder]));
    expect(s.submitted).toBe(true);
    expect(s.result).toBe(r);
    expect(await services.repos.attempts.findInProgress()).toBeNull();
    const stats = await services.repos.questionStats.listAll();
    expect(stats).toHaveLength(10);
    const byId = new Map(stats.map((x) => [x.questionId, x]));
    for (const it of r.items.filter((i) => i.isCorrect)) expect(byId.get(it.questionId)!.box).toBe(1);
    expect(onSubmitted).toHaveBeenCalledTimes(1);
  });
  it('7/10 => not passed', async () => {
    const s = await start();
    await answer(s, 7);
    const r = await s.submit('manual');
    expect(r).toMatchObject({ scorePct: 70, passed: false });
  });
  it('passed uses exact rule not rounded pct (79.5% would round up)', async () => {
    // 4/5 style exactness: 0 total => 0, unanswered => wrong
    const s = await start('storage'); // 4 questions
    await s.select(0, ['A']); await s.select(1, ['A']); await s.select(2, ['A']);
    const r = await s.submit('manual');
    expect(r).toMatchObject({ correct: 3, total: 4, scorePct: 75, passed: false });
  });
  it('double submit => one DB write set and same result', async () => {
    const s = await start();
    await answer(s, 8);
    const r1 = await s.submit('manual');
    const before = executes.length;
    const r2 = await s.submit('timeout');
    expect(r2).toBe(r1);
    expect(executes.length).toBe(before);
    expect(onSubmitted).toHaveBeenCalledTimes(1);
  });
  it('concurrent submits share one run', async () => {
    const s = await start();
    const [a, b] = await Promise.all([s.submit('manual'), s.submit('manual')]);
    expect(a).toBe(b);
    expect(onSubmitted).toHaveBeenCalledTimes(1);
  });
  it('onSubmitted failure keeps result and submitted attempt, then rethrows', async () => {
    const s = await start();
    await answer(s, 8);
    onSubmitted.mockRejectedValueOnce(new Error('refresh failed'));
    await expect(s.submit('manual')).rejects.toThrow('refresh failed');
    expect(s.result).toMatchObject({ correct: 8, passed: true });
    expect(s.submitted).toBe(true);
    expect((await services.repos.attempts.listSubmitted())).toHaveLength(1);
    const again = await s.submit('manual');
    expect(again).toBe(s.result);
  });
  it('mutators are ignored after submit', async () => {
    const s = await start();
    await s.submit('manual');
    await s.select(0, ['A']);
    expect(s.questions[0].selected).toEqual([]);
  });
});

describe('clock', () => {
  it('freeze: tick past remaining => exactly one timeout submit', async () => {
    const s = await start('compute', { limitMs: 3000 });
    await answer(s, 10);
    await s.tick(1000);
    expect(s.remainingMs).toBe(2000);
    await Promise.all([s.tick(5000), s.tick(1000), s.tick(1000)]);
    for (let i = 0; i < 5; i++) await s.tick(1000);
    expect(onSubmitted).toHaveBeenCalledTimes(1);
    expect(s.result!.correct).toBe(10);
    const list = await services.repos.attempts.listSubmitted();
    expect(list).toHaveLength(1);
    expect(list[0].submitReason).toBe('timeout');
    expect(s.remainingMs).toBe(0);
  });
  it('run: derives remaining from services.now()', async () => {
    const s = await start('compute', { limitMs: 60000, clockMode: 'run', onHidden: 'freeze' });
    clock = NOW + 20000;
    await s.tick(100);
    expect(s.remainingMs).toBe(40000);
    clock = NOW + 61000;
    await s.tick(100);
    expect(s.submitted).toBe(true);
    expect((await services.repos.attempts.listSubmitted())[0].submitReason).toBe('timeout');
  });
  it('no limit: remainingMs null and ticks are harmless', async () => {
    const s = await start();
    expect(s.remainingMs).toBeNull();
    await s.tick(10000);
    expect(s.submitted).toBe(false);
  });
  it('persists the clock at most every 5s of accumulated ticks; flushClock forces it', async () => {
    const s = await start('compute', { limitMs: 600000 });
    const spy = vi.spyOn(services.repos.attempts, 'saveClock');
    for (let i = 0; i < 4; i++) await s.tick(1000);
    expect(spy).not.toHaveBeenCalled();
    clock = NOW + 4000;
    await s.tick(1000);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(s.attemptId, expect.objectContaining({ remainingMs: 595000 }), NOW + 4000);
    await s.tick(1000);
    expect(spy).toHaveBeenCalledTimes(1);
    await s.flushClock();
    expect(spy).toHaveBeenCalledTimes(2);
    const row = (await services.repos.attempts.findInProgress())!;
    expect(row.attempt.clock.remainingMs).toBe(594000);
    expect(row.attempt.heartbeatAt).toBe(NOW + 4000);
  });
});

describe('knowledge', () => {
  it('throws when not allowed', async () => {
    const s = await start();
    expect(() => s.openKnowledge()).toThrow(KnowledgeNotAllowedError);
    expect(s.knowledgeOpen).toBe(false);
  });
  it('clock keeps advancing while open', async () => {
    const s = await start('compute', { allowReview: true, limitMs: 100000 });
    s.openKnowledge();
    expect(s.knowledgeOpen).toBe(true);
    await s.tick(1000);
    expect(s.remainingMs).toBe(99000);
    s.closeKnowledge();
    expect(s.knowledgeOpen).toBe(false);
  });
});

describe('exit', () => {
  it('discards the attempt with no history or stats and then ignores mutators', async () => {
    const s = await start();
    await answer(s, 3);
    await s.exit();
    expect(await services.repos.attempts.findInProgress()).toBeNull();
    expect(await db.select('SELECT * FROM attempt_questions')).toEqual([]);
    expect(await services.repos.questionStats.listAll()).toEqual([]);
    await s.select(0, ['A']);
    await s.tick(1000);
    await s.flushClock();
    expect(await db.select('SELECT * FROM attempt_questions')).toEqual([]);
    expect(onSubmitted).not.toHaveBeenCalled();
  });
});

describe('exit retry (final review I4)', () => {
  it('a rejected discard can be retried and then succeeds', async () => {
    const s = await start();
    await answer(s, 2);
    failSql = 'DELETE FROM attempts';
    await expect(s.exit()).rejects.toThrow('injected');
    expect(await services.repos.attempts.findInProgress()).not.toBeNull();
    failSql = null;
    await s.exit();
    expect(await services.repos.attempts.findInProgress()).toBeNull();
    expect(await db.select('SELECT * FROM attempt_questions')).toEqual([]);
  });

  it('after a failed exit the attempt stays usable: select saves and submit is accepted', async () => {
    const s = await start();
    failSql = 'DELETE FROM attempts';
    await expect(s.exit()).rejects.toThrow('injected');
    failSql = null;
    await answer(s, 10);
    expect((await services.repos.attempts.questionsOf(s.attemptId))[0].selected).toEqual(['A']);
    const r = await s.submit('manual');
    expect(r.passed).toBe(true);
    expect(await services.repos.attempts.listSubmitted()).toHaveLength(1);
  });

  it('a failed submit, then a failed exit, still lets the user submit', async () => {
    const s = await start();
    await answer(s, 10);
    failSql = 'UPDATE attempts SET status';
    await expect(s.submit('manual')).rejects.toThrow('injected');
    failSql = 'DELETE FROM attempts';
    await expect(s.exit()).rejects.toThrow('injected');
    failSql = null;
    expect(s.submitReason).toBeNull();
    await expect(s.submit('manual')).resolves.toMatchObject({ passed: true });
  });
});

describe('missing attempt (R18)', () => {
  it('markSubmitted on a deleted attempt rejects with AttemptMissingError and writes no history', async () => {
    const s = await start();
    await services.repos.attempts.discard(s.attemptId);
    await expect(
      services.repos.attempts.markSubmitted(s.attemptId, { scorePct: 100, passed: true, reason: 'manual', at: 1, grades: [] }),
    ).rejects.toBeInstanceOf(AttemptMissingError);
    expect(await services.repos.attempts.listSubmitted()).toEqual([]);
  });

  it('submit after a half-failed discard rejects, reports no result, and stays retryable', async () => {
    const s = await start();
    await answer(s, 10);
    failSql = 'DELETE FROM attempt_questions';
    await expect(s.exit()).rejects.toThrow();
    failSql = null;
    await expect(s.submit('manual')).rejects.toThrow('exited');
    expect(s.result).toBeNull();
    expect(s.submitted).toBe(false);
    expect(s.submitReason).toBeNull();
    expect(await services.repos.attempts.listSubmitted()).toEqual([]);
  });

  it('submit when the attempt row vanished rejects with AttemptMissingError and stays retryable', async () => {
    const s = await start();
    await answer(s, 10);
    await services.repos.attempts.discard(s.attemptId);
    await expect(s.submit('manual')).rejects.toBeInstanceOf(AttemptMissingError);
    expect(s.result).toBeNull();
    expect(s.submitted).toBe(false);
    expect(s.submitReason).toBeNull();
    expect(await services.repos.attempts.listSubmitted()).toEqual([]);
  });

  it('exit half-failure closes the session; a full failure leaves it answerable and retryable', async () => {
    const half = await start();
    failSql = 'DELETE FROM attempt_questions';
    await expect(half.exit()).rejects.toBeInstanceOf(AttemptMissingError);
    failSql = null;
    await half.select(0, ['A']);
    expect(half.questions[0].selected).toEqual([]);
    await expect(half.submit('manual')).rejects.toThrow('exited');
    await half.exit(); // retry cleans up the orphan question rows
    expect(await db.select('SELECT * FROM attempt_questions')).toEqual([]);

    const full = await start('storage');
    failSql = 'DELETE FROM attempts';
    await expect(full.exit()).rejects.toThrow('injected');
    failSql = null;
    await full.select(0, ['A']);
    expect(full.questions[0].selected).toEqual(['A']);
  });
});

describe('stats rebuild goes through Services (no practice -> review import)', () => {
  it('submit hands the attempt question ids to services.rebuildStats', async () => {
    const calls: string[][] = [];
    services = { ...services, rebuildStats: async (ids) => { calls.push(ids); } };
    const s = await start();
    await answer(s, 10);
    await s.submit('manual');
    expect(calls).toEqual([s.questions.map((q) => q.questionId)]);
    expect(await services.repos.questionStats.listAll()).toEqual([]); // only the injected function ran
  });

  it('exit after a committed submit hands the ids to services.rebuildStats again', async () => {
    const calls: string[][] = [];
    services = { ...services, rebuildStats: async (ids) => { calls.push(ids); } };
    const s = await start('compute', { limitMs: 1000 });
    await answer(s, 10);
    let release!: () => void;
    gate = new Promise<void>((r) => { release = r; });
    const hit = new Promise<void>((r) => { gateHit = r; });
    const ticking = s.tick(5000);
    await hit;
    const exiting = s.exit();
    release();
    await Promise.all([ticking, exiting]);
    expect(calls).toHaveLength(2);
    expect(calls[1]).toEqual(s.questions.map((q) => q.questionId));
  });
});

describe('settleHidden', () => {
  it('run + freeze: remaining unchanged after settleHidden(5000) while the deadline moved', async () => {
    const s = await start('compute', { limitMs: 60000, clockMode: 'run', onHidden: 'freeze' });
    clock = NOW + 20000;
    await s.tick(100);
    expect(s.remainingMs).toBe(40000);
    clock = NOW + 25000;
    await s.settleHidden(5000);
    expect(s.remainingMs).toBe(40000);
    const found = (await services.repos.attempts.findInProgress())!;
    expect(found.attempt.clock.deadlineAt).toBe(NOW + 65000);
  });
  it('freeze + run: remainingMs drops by hiddenMs', async () => {
    const s = await start('compute', { limitMs: 60000, clockMode: 'freeze', onHidden: 'run' });
    await s.settleHidden(5000);
    expect(s.remainingMs).toBe(55000);
  });
  it('freeze + freeze: remainingMs unchanged', async () => {
    const s = await start('compute', { limitMs: 60000, clockMode: 'freeze', onHidden: 'freeze' });
    await s.settleHidden(5000);
    expect(s.remainingMs).toBe(60000);
  });
  it('hidden longer than remaining with onHidden run => exactly one timeout submit', async () => {
    const s = await start('compute', { limitMs: 3000, clockMode: 'freeze', onHidden: 'run' });
    await s.settleHidden(10000);
    expect(s.submitted).toBe(true);
    expect(s.remainingMs).toBe(0);
    await s.settleHidden(10000);
    expect(onSubmitted).toHaveBeenCalledTimes(1);
    const list = await services.repos.attempts.listSubmitted();
    expect(list).toHaveLength(1);
    expect(list[0].submitReason).toBe('timeout');
  });
  it('untimed session: no-op and does not throw', async () => {
    const s = await start();
    const spy = vi.spyOn(services.repos.attempts, 'saveClock');
    await expect(s.settleHidden(5000)).resolves.toBeUndefined();
    expect(s.remainingMs).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });
  it('closed/exited session: no-op', async () => {
    const a = await start('compute', { limitMs: 60000, clockMode: 'freeze', onHidden: 'run' });
    await a.submit('manual');
    const spy = vi.spyOn(services.repos.attempts, 'saveClock');
    await a.settleHidden(5000);
    expect(spy).not.toHaveBeenCalled();
    const b = await start('compute', { limitMs: 60000, clockMode: 'freeze', onHidden: 'run' });
    await b.exit();
    await b.settleHidden(5000);
    expect(spy).not.toHaveBeenCalled();
    expect(b.remainingMs).toBe(60000);
  });
  it('saves the clock', async () => {
    const s = await start('compute', { limitMs: 60000, clockMode: 'freeze', onHidden: 'run' });
    const spy = vi.spyOn(services.repos.attempts, 'saveClock');
    await s.settleHidden(5000);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(s.attemptId, expect.objectContaining({ remainingMs: 55000 }), NOW);
  });
});

describe('time source', () => {
  it('never reads Date.now inside the session', async () => {
    const spy = vi.spyOn(Date, 'now');
    const s = await start('compute', { limitMs: 60000, clockMode: 'run', onHidden: 'freeze' });
    await s.select(0, ['A']);
    await s.tick(6000);
    await s.submit('manual');
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('fix round 1', () => {
  it('failed save rolls back the in-memory selection, surfaces the error, and submit grades the old value', async () => {
    const s = await start();
    await s.select(0, ['A']);
    vi.spyOn(services.repos.attempts, 'saveAnswer').mockRejectedValueOnce(new Error('disk'));
    await expect(s.select(0, ['B'])).rejects.toThrow('disk');
    expect(s.questions[0].selected).toEqual(['A']);
    const r = await s.submit('manual');
    expect(r.items[0]).toMatchObject({ selected: ['A'], isCorrect: true });
    expect((await services.repos.attempts.questionsOf(s.attemptId))[0].selected).toEqual(['A']);
  });
  it('submit persists selected alongside is_correct', async () => {
    const s = await start();
    failSql = 'UPDATE attempt_questions SET selected';
    await expect(s.select(2, ['A'])).rejects.toThrow('injected');
    failSql = null;
    await s.select(1, ['B']);
    await s.submit('manual');
    const rows = await services.repos.attempts.questionsOf(s.attemptId);
    expect(rows[1]).toMatchObject({ selected: ['B'], isCorrect: false });
    expect(rows[2]).toMatchObject({ selected: [], isCorrect: false });
  });
  it('the exposed questions cannot be mutated by a component', async () => {
    const s = await start();
    const q = s.questions[0];
    expect(() => { (q.selected as string[]).push('A'); }).toThrow();
    expect(() => { (q as { selected: string[] }).selected = ['A']; }).toThrow();
    expect(s.questions[0].selected).toEqual([]);
  });
  it('exit during an in-flight timeout submit waits, then discards and exposes no result', async () => {
    const s = await start('compute', { limitMs: 1000 });
    await answer(s, 10);
    let release!: () => void;
    gate = new Promise<void>((r) => { release = r; });
    const hit = new Promise<void>((r) => { gateHit = r; });
    const ticking = s.tick(5000);
    await hit;
    const exiting = s.exit();
    release();
    await Promise.all([ticking, exiting]);
    expect(await services.repos.attempts.findInProgress()).toBeNull();
    expect(await services.repos.attempts.listSubmitted()).toEqual([]);
    expect(await db.select('SELECT * FROM attempt_questions')).toEqual([]);
    expect(await services.repos.questionStats.listAll()).toEqual([]);
    expect(s.result).toBeNull();
    expect(s.submitted).toBe(false);
    const n = executes.length;
    await s.tick(1000); await s.select(0, ['A']); await s.flushClock();
    await expect(s.submit('manual')).rejects.toThrow();
    expect(executes.length).toBe(n);
  });
  it('failed markSubmitted then exit then tick/submit => no further writes', async () => {
    const s = await start('compute', { limitMs: 100000 });
    failSql = 'UPDATE attempts SET status';
    await expect(s.submit('manual')).rejects.toThrow('injected');
    expect(s.submitted).toBe(false);
    failSql = null;
    await s.exit();
    const n = executes.length;
    await s.tick(1000);
    await expect(s.submit('manual')).rejects.toThrow();
    expect(executes.length).toBe(n);
    expect(await services.repos.attempts.findInProgress()).toBeNull();
    expect(await services.repos.attempts.listSubmitted()).toEqual([]);
  });
  it('resume rejects a position gap', async () => {
    await start();
    const found = (await services.repos.attempts.findInProgress())!;
    const gap = { ...found, questions: found.questions.map((q) => (q.position >= 5 ? { ...q, position: q.position + 1 } : q)) };
    await expect(PracticeSession.resume(services, gap, onSubmitted)).rejects.toBeInstanceOf(CorruptAttemptError);
    const dup = { ...found, questions: found.questions.map((q, i) => (i === 1 ? { ...q, position: 0 } : q)) };
    await expect(PracticeSession.resume(services, dup, onSubmitted)).rejects.toBeInstanceOf(CorruptAttemptError);
  });
  it('rebuildStatsFor rejection still calls onSubmitted, rethrows, and result stays cached', async () => {
    const s = await start();
    await answer(s, 8);
    failSql = 'INSERT INTO question_stats';
    await expect(s.submit('manual')).rejects.toThrow();
    failSql = null;
    expect(onSubmitted).toHaveBeenCalledTimes(1);
    expect(s.result).toMatchObject({ correct: 8 });
    expect(await s.submit('manual')).toBe(s.result);
    expect(onSubmitted).toHaveBeenCalledTimes(1);
  });
});

describe('fix round 1: frozen clock gaps and submit reason', () => {
  it('freeze: a 2.5 s gap is charged in full, a 2 h gap is capped at FREEZE_MAX_TICK_MS', async () => {
    expect(FREEZE_MAX_TICK_MS).toBe(3000);
    const s = await start('compute', { limitMs: 600000 });
    await s.tick(2500);
    expect(s.remainingMs).toBe(597500);
    await s.tick(2 * 60 * 60 * 1000);
    expect(s.remainingMs).toBe(597500 - 3000);
    expect(s.submitted).toBe(false);
  });
  it('freeze: the save throttle accumulates the capped amount too', async () => {
    const s = await start('compute', { limitMs: 600000 });
    const spy = vi.spyOn(services.repos.attempts, 'saveClock');
    await s.tick(7_200_000);
    expect(spy).not.toHaveBeenCalled(); // 3000 < 5000, an uncapped gap would have flushed
    await s.tick(7_200_000);
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it('run mode is unaffected by the cap', async () => {
    const s = await start('compute', { limitMs: 60000, clockMode: 'run', onHidden: 'freeze' });
    await s.tick(7_200_000);
    expect(s.remainingMs).toBe(60000);
    clock = NOW + 10000;
    await s.tick(7_200_000);
    expect(s.remainingMs).toBe(50000);
  });
  it('submitReason is null until a submit is requested and records the first request', async () => {
    const s = await start('compute', { limitMs: 60000 });
    expect(s.submitReason).toBeNull();
    await s.submit('manual');
    expect(s.submitReason).toBe('manual');
    await s.submit('timeout');
    expect(s.submitReason).toBe('manual');
  });
  it('a timeout in flight keeps the reason when a manual submit follows', async () => {
    const s = await start('compute', { limitMs: 60000 });
    let release!: () => void;
    gate = new Promise<void>((r) => { release = r; });
    const hit = new Promise<void>((r) => { gateHit = r; });
    const first = s.submit('timeout');
    await hit;
    const second = s.submit('manual');
    expect(s.submitReason).toBe('timeout');
    release();
    await Promise.all([first, second]);
    expect(s.submitReason).toBe('timeout');
  });
  it('a failed manual submit does not stick: a later timeout is reported as a timeout', async () => {
    const s = await start('compute', { limitMs: 60000 });
    failSql = "SET status = 'submitted'";
    await expect(s.submit('manual')).rejects.toThrow('injected');
    expect(s.submitReason).toBeNull();
    failSql = null;
    await s.submit('timeout');
    expect(s.submitReason).toBe('timeout');
  });
});
