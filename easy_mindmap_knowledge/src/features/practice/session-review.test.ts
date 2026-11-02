// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadCatalog } from '@/content/load-catalog';
import { buildServices } from '@/app/composition';
import type { Services } from '@/app/composition';
import { completedTopicIds, topicStatuses } from '@/features/mindmap';
import { makeQuestion, makeRawCatalog } from '@/testing/fixtures';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import { NoQuestionsError, PracticeSession, loadLastOptions } from './index';

const NOW = Date.UTC(2026, 5, 15, 12, 0, 0);
let services: Services;
let idN = 0;
const onSubmitted = vi.fn(async () => {});

beforeEach(async () => {
  idN = 0;
  onSubmitted.mockClear();
  const raw = makeRawCatalog();
  const options = [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }, { key: 'C', text: 'c' }, { key: 'D', text: 'd' }, { key: 'E', text: 'e' }];
  raw.questions = Array.from({ length: 10 }, (_, i) =>
    makeQuestion({ id: `r${i}`, topicId: 'cloud-concepts', options, correct: ['A'], orderDependent: i === 0 }));
  services = buildServices({
    executor: await createNodeSqliteExecutor(), catalog: loadCatalog(raw), now: () => NOW,
    newId: () => `id-${++idN}`,
  });
});

const ids = ['r3', 'r1', 'r7', 'r0', 'r5'];

describe('PracticeSession.startReview', () => {
  it('persists a review attempt: topicId null, given order, shuffled options, no clock limit', async () => {
    const s = await PracticeSession.startReview(services, ids, onSubmitted);
    expect(s.kind).toBe('review');
    expect(s.topicId).toBeNull();
    expect(s.allowReview).toBe(true);
    expect(s.remainingMs).toBeNull();
    const found = await services.repos.attempts.findInProgress();
    expect(found!.attempt).toMatchObject({ kind: 'review', topicId: null, reviewAllowed: true, status: 'in_progress' });
    expect(found!.attempt.clock.limitMs).toBeNull();
    const rows = [...found!.questions].sort((a, b) => a.position - b.position);
    expect(rows.map((r) => r.questionId)).toEqual(ids);
    for (const r of rows) expect([...r.optionOrder].sort()).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(rows.find((r) => r.questionId === 'r0')!.optionOrder).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(rows.some((r) => r.questionId !== 'r0' && r.optionOrder.join('') !== 'ABCDE')).toBe(true);
  });

  it('does not touch practice_last_options', async () => {
    await PracticeSession.startReview(services, ids, onSubmitted);
    expect(await services.repos.settings.get('practice_last_options')).toBeNull();
    expect(await loadLastOptions(services.repos.settings)).toBeDefined();
  });

  it('rejects an empty list and unknown ids', async () => {
    await expect(PracticeSession.startReview(services, [], onSubmitted)).rejects.toBeInstanceOf(NoQuestionsError);
    await expect(PracticeSession.startReview(services, ['r1', 'nope'], onSubmitted)).rejects.toThrow(/nope/);
    expect(await services.repos.attempts.findInProgress()).toBeNull();
  });

  it('rejects duplicate ids', async () => {
    await expect(PracticeSession.startReview(services, ['r1', 'r2', 'r1'], onSubmitted)).rejects.toThrow(/duplicate.*r1/i);
    expect(await services.repos.attempts.findInProgress()).toBeNull();
  });

  it('resume restores order and selection', async () => {
    const s = await PracticeSession.startReview(services, ids, onSubmitted);
    await s.select(1, ['B']);
    const found = (await services.repos.attempts.findInProgress())!;
    const { session, autoSubmit } = await PracticeSession.resume(services, found, onSubmitted);
    expect(autoSubmit).toBe(false);
    expect(session.kind).toBe('review');
    expect(session.questions.map((q) => q.questionId)).toEqual(ids);
    expect(session.questions[1]!.selected).toEqual(['B']);
    expect(session.questions.map((q) => q.optionOrder)).toEqual(s.questions.map((q) => q.optionOrder));
  });

  it('submit rebuilds stats and never completes a topic', async () => {
    const s = await PracticeSession.startReview(services, ids, onSubmitted);
    for (const q of s.questions) await s.select(q.position, ['A']);
    const result = await s.submit('manual');
    expect(result.passed).toBe(true);
    expect(await services.repos.questionStats.get('r3')).not.toBeNull();
    expect(onSubmitted).toHaveBeenCalled();
    const submitted = await services.repos.attempts.listSubmitted();
    expect(submitted).toHaveLength(1);
    const completed = completedTopicIds(submitted);
    expect(completed.size).toBe(0);
    expect(topicStatuses(services.catalog.topics, completed).get('cloud-concepts')).toBe('current');
  });
});
