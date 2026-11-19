// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadCatalog } from '@/content/load-catalog';
import { buildServices } from '@/app/composition';
import type { Services } from '@/app/composition';
import { makeQuestion, makeRawCatalog } from '@/testing/fixtures';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import type { SqlExecutor } from '@/persistence';
import { CorruptAttemptError, InvalidExamInputError, KnowledgeNotAllowedError, PracticeSession } from './index';
import type { PlannedQuestion } from './index';

const T0 = Date.UTC(2026, 5, 15, 12, 0, 0);
const LIMIT = 60_000;
let clock = T0;
let services: Services;
let executor: SqlExecutor;
let idN = 0;
const onSubmitted = vi.fn(async () => {});

const plan: PlannedQuestion[] = ['r4', 'r2', 'r9', 'r0', 'r6'].map((questionId, i) => ({
  questionId,
  optionOrder: i % 2 === 0 ? ['E', 'D', 'C', 'B', 'A'] : ['A', 'B', 'C', 'D', 'E'],
}));

const input = (over: Partial<Parameters<typeof PracticeSession.startExam>[1]> = {}) => ({
  kind: 'checkpoint' as const, topicId: null, groupIndex: 0, plan, limitMs: LIMIT, ...over,
});

beforeEach(async () => {
  clock = T0;
  idN = 0;
  onSubmitted.mockClear();
  const raw = makeRawCatalog();
  const options = [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }, { key: 'C', text: 'c' }, { key: 'D', text: 'd' }, { key: 'E', text: 'e' }];
  raw.questions = Array.from({ length: 10 }, (_, i) =>
    makeQuestion({ id: `r${i}`, topicId: 'cloud-concepts', options, correct: ['A'] }));
  executor = await createNodeSqliteExecutor();
  services = buildServices({
    executor, catalog: loadCatalog(raw), now: () => clock,
    newId: () => `id-${++idN}`,
  });
});

describe('PracticeSession.startExam', () => {
  it('persists a checkpoint attempt: plan order and options, run clock, no review, plannedCount', async () => {
    const s = await PracticeSession.startExam(services, input({ groupIndex: 2 }), onSubmitted);
    expect(s.kind).toBe('checkpoint');
    expect(s.allowReview).toBe(false);
    expect(s.remainingMs).toBe(LIMIT);
    const found = (await services.repos.attempts.findInProgress())!;
    expect(found.attempt).toMatchObject({
      kind: 'checkpoint', topicId: null, groupIndex: 2, plannedCount: plan.length,
      reviewAllowed: false, status: 'in_progress', startedAt: T0,
    });
    expect(found.attempt.clock).toMatchObject({ mode: 'run', onHidden: 'run', onReport: 'run', limitMs: LIMIT, deadlineAt: T0 + LIMIT });
    const rows = [...found.questions].sort((a, b) => a.position - b.position);
    expect(rows.map((r) => r.questionId)).toEqual(plan.map((p) => p.questionId));
    expect(rows.map((r) => r.optionOrder)).toEqual(plan.map((p) => p.optionOrder));
  });

  it('does not touch practice_last_options', async () => {
    await PracticeSession.startExam(services, input(), onSubmitted);
    expect(await services.repos.settings.get('practice_last_options')).toBeNull();
  });

  it('supports a Capstone practice exam with its topic id', async () => {
    const s = await PracticeSession.startExam(services, input({ kind: 'practice', topicId: 'capstone', groupIndex: null }), onSubmitted);
    expect(s.kind).toBe('practice');
    expect(s.topicId).toBe('capstone');
    expect(s.allowReview).toBe(false);
  });

  it('refuses knowledge review', async () => {
    const s = await PracticeSession.startExam(services, input(), onSubmitted);
    expect(() => s.openKnowledge()).toThrow(KnowledgeNotAllowedError);
    expect(s.knowledgeOpen).toBe(false);
  });

  it('auto-submits on timeout and grades unanswered questions wrong', async () => {
    const s = await PracticeSession.startExam(services, input(), onSubmitted);
    await s.select(0, ['A']);
    await s.select(1, ['A']);
    await s.select(2, ['A']);
    await s.select(3, ['A']);
    clock = T0 + LIMIT - 1000;
    await s.tick(1000);
    expect(s.submitted).toBe(false);
    expect(s.remainingMs).toBe(1000);
    clock = T0 + LIMIT;
    await s.tick(1000);
    expect(s.submitted).toBe(true);
    expect(s.submitReason).toBe('timeout');
    expect(s.result).toMatchObject({ correct: 4, total: 5, scorePct: 80, passed: true });
    expect(s.result!.items[4]).toMatchObject({ selected: [], isCorrect: false });
    expect(onSubmitted).toHaveBeenCalled();
  });

  it('counts unanswered questions as wrong for the pass mark', async () => {
    const s = await PracticeSession.startExam(services, input(), onSubmitted);
    await s.select(0, ['A']);
    await s.select(1, ['A']);
    await s.select(2, ['A']);
    clock = T0 + LIMIT + 5;
    await s.tick(1000);
    expect(s.submitReason).toBe('timeout');
    expect(s.result).toMatchObject({ correct: 3, total: 5, scorePct: 60, passed: false });
  });
});

describe('Capstone scored questions', () => {
  async function startCapstone() {
    const raw = makeRawCatalog();
    raw.questions = Array.from({ length: 65 }, (_, i) => makeQuestion({ id: `exam-${i}`, correct: ['A'] }));
    const examServices = buildServices({ executor, catalog: loadCatalog(raw), now: () => clock, newId: () => `id-${++idN}` });
    const examPlan = raw.questions.map((q) => ({ questionId: q.id, optionOrder: ['A', 'B'] }));
    const session = await PracticeSession.startExam(examServices, input({
      kind: 'practice', topicId: 'capstone-exam-1', groupIndex: null, plan: examPlan,
      unscoredIds: new Set(raw.questions.slice(50).map((q) => q.id)),
    }), onSubmitted);
    return { session, examServices };
  }

  it.each([
    { correct: 35, scorePct: 70, passed: true },
    { correct: 34, scorePct: 68, passed: false },
  ])('grades $correct/50 scored correct with all 15 unscored wrong', async ({ correct, scorePct, passed }) => {
    const { session, examServices } = await startCapstone();
    const found = (await examServices.repos.attempts.findInProgress())!;
    expect(found.questions.filter((q) => q.unscored)).toHaveLength(15);
    for (let i = 0; i < 65; i++) await session.select(i, i < correct ? ['A'] : ['B']);
    const result = await session.submit('manual');
    expect(result).toMatchObject({ correct, total: 50, scorePct, passed });
    expect(result.items).toHaveLength(65);
    expect(result.items.slice(50)).toEqual(Array.from({ length: 15 }, () => expect.objectContaining({ unscored: true, isCorrect: false })));
    const stored = await examServices.repos.attempts.questionsOf(session.attemptId);
    expect(stored.map((q) => q.isCorrect)).toEqual(Array.from({ length: 65 }, (_, i) => i < correct));
    expect(await examServices.repos.attempts.listSubmitted()).toEqual([expect.objectContaining({ scorePct, passed })]);
  });

  it('counts unanswered scored questions wrong and ignores correct unscored answers in the score', async () => {
    const { session } = await startCapstone();
    for (let i = 0; i < 34; i++) await session.select(i, ['A']);
    for (let i = 50; i < 65; i++) await session.select(i, ['A']);
    const result = await session.submit('manual');
    expect(result).toMatchObject({ correct: 34, total: 50, scorePct: 68, passed: false });
    expect(result.items.slice(34, 50)).toEqual(Array.from({ length: 16 }, () => expect.objectContaining({ selected: [], isCorrect: false, unscored: false })));
    expect(result.items.slice(50)).toEqual(Array.from({ length: 15 }, () => expect.objectContaining({ isCorrect: true, unscored: true })));
  });

  it('resumes stored unscored rows and preserves a 35/50 passing score', async () => {
    const { session, examServices } = await startCapstone();
    for (let i = 0; i < 65; i++) await session.select(i, i < 35 ? ['A'] : ['B']);
    const found = (await examServices.repos.attempts.findInProgress())!;
    const { session: resumed } = await PracticeSession.resume(examServices, found, onSubmitted);
    const result = await resumed.submit('manual');
    expect(result).toMatchObject({ correct: 35, total: 50, scorePct: 70, passed: true });
    expect(result.items.map((q) => q.unscored)).toEqual(Array.from({ length: 65 }, (_, i) => i >= 50));
  });
});

describe('PracticeSession.resume for exams', () => {
  it('restores a running checkpoint with the remaining time', async () => {
    const s = await PracticeSession.startExam(services, input({ groupIndex: 1 }), onSubmitted);
    await s.select(0, ['A']);
    clock = T0 + 20_000;
    const found = (await services.repos.attempts.findInProgress())!;
    const { session, autoSubmit } = await PracticeSession.resume(services, found, onSubmitted);
    expect(autoSubmit).toBe(false);
    expect(session.kind).toBe('checkpoint');
    expect(session.allowReview).toBe(false);
    expect(session.remainingMs).toBe(LIMIT - 20_000);
    expect(session.questions.map((q) => q.questionId)).toEqual(plan.map((p) => p.questionId));
    expect(session.questions[0]!.selected).toEqual(['A']);
  });

  it('flags autoSubmit once the deadline passed; submit(timeout) stores only answered questions as right', async () => {
    const s = await PracticeSession.startExam(services, input(), onSubmitted);
    await s.select(0, ['A']);
    await s.select(1, ['A']);
    await s.select(2, ['A']);
    await s.select(3, ['A']);
    clock = T0 + LIMIT + 10_000;
    const found = (await services.repos.attempts.findInProgress())!;
    const { session, autoSubmit } = await PracticeSession.resume(services, found, onSubmitted);
    expect(autoSubmit).toBe(true);
    await session.submit('timeout');
    expect(await services.repos.attempts.findInProgress()).toBeNull();
    const [stored] = await services.repos.attempts.listSubmitted();
    expect(stored).toMatchObject({ id: found.attempt.id, status: 'submitted', submitReason: 'timeout', kind: 'checkpoint', passed: true, scorePct: 80 });
  });

  it('a timed-out checkpoint with too few right answers is stored as not passed', async () => {
    const s = await PracticeSession.startExam(services, input(), onSubmitted);
    await s.select(0, ['A']);
    await s.select(1, ['A']);
    clock = T0 + LIMIT + 1;
    const found = (await services.repos.attempts.findInProgress())!;
    const { session, autoSubmit } = await PracticeSession.resume(services, found, onSubmitted);
    expect(autoSubmit).toBe(true);
    await session.submit('timeout');
    const [stored] = await services.repos.attempts.listSubmitted();
    expect(stored).toMatchObject({ status: 'submitted', passed: false, scorePct: 40 });
  });

  it('rejects a checkpoint attempt without a group index', async () => {
    // The DB CHECK constraint already forbids this row, so hand resume a tampered in-memory copy.
    await PracticeSession.startExam(services, input(), onSubmitted);
    const found = (await services.repos.attempts.findInProgress())!;
    const tampered = { attempt: { ...found.attempt, groupIndex: null }, questions: found.questions };
    await expect(PracticeSession.resume(services, tampered, onSubmitted)).rejects.toBeInstanceOf(CorruptAttemptError);
  });

  it('rejects a partial checkpoint (fewer rows than plannedCount)', async () => {
    await PracticeSession.startExam(services, input(), onSubmitted);
    const found = (await services.repos.attempts.findInProgress())!;
    const partial = { attempt: found.attempt, questions: found.questions.slice(0, 3) };
    await expect(PracticeSession.resume(services, partial, onSubmitted)).rejects.toThrow(/partial/);
  });

  it('rejects a partial Capstone attempt through the same check', async () => {
    await PracticeSession.startExam(services, input({ kind: 'practice', topicId: 'capstone', groupIndex: null }), onSubmitted);
    const found = (await services.repos.attempts.findInProgress())!;
    const partial = { attempt: found.attempt, questions: found.questions.slice(0, 3) };
    await expect(PracticeSession.resume(services, partial, onSubmitted)).rejects.toThrow(/partial/);
  });

  it('resumes a full Capstone attempt', async () => {
    await PracticeSession.startExam(services, input({ kind: 'practice', topicId: 'capstone', groupIndex: null }), onSubmitted);
    const found = (await services.repos.attempts.findInProgress())!;
    const { session } = await PracticeSession.resume(services, found, onSubmitted);
    expect(session.kind).toBe('practice');
    expect(session.topicId).toBe('capstone');
  });
});

describe('PracticeSession.exit for exams', () => {
  it('deletes the checkpoint attempt', async () => {
    const s = await PracticeSession.startExam(services, input(), onSubmitted);
    await s.select(0, ['A']);
    await s.exit();
    expect(await services.repos.attempts.findInProgress()).toBeNull();
    expect(await services.repos.attempts.exists(s.attemptId)).toBe(false);
    expect(await services.repos.attempts.listSubmitted()).toEqual([]);
  });
});

describe('PracticeSession.startExam input validation', () => {
  const cases: [string, Partial<Parameters<typeof PracticeSession.startExam>[1]>][] = [
    ['checkpoint without a group index', { kind: 'checkpoint', topicId: null, groupIndex: null }],
    ['practice with a group index', { kind: 'practice', topicId: 'capstone', groupIndex: 1 }],
    ['practice without a topic', { kind: 'practice', topicId: null, groupIndex: null }],
  ];
  for (const [name, over] of cases) {
    it(`rejects ${name} before writing anything`, async () => {
      await expect(PracticeSession.startExam(services, input(over), onSubmitted)).rejects.toBeInstanceOf(InvalidExamInputError);
      expect(await services.repos.attempts.findInProgress()).toBeNull();
      const rows = await executor.select<{ n: number }>('SELECT COUNT(*) AS n FROM attempt_questions');
      expect(Number(rows[0]!.n)).toBe(0);
    });
  }
});
