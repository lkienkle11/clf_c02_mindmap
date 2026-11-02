// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadCatalog } from '@/content/load-catalog';
import { buildServices } from '@/app/composition';
import type { Services } from '@/app/composition';
import { NoQuestionsError, PracticeSession } from '@/features/practice';
import { makeQuestion, makeRawCatalog } from '@/testing/fixtures';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import { ReviewRun } from './index';

const NOW = Date.UTC(2026, 5, 15, 12, 0, 0);
let services: Services;
let idN = 0;
const onSubmitted = vi.fn(async () => {});
const all = Array.from({ length: 40 }, (_, i) => `r${i}`);
const plan = { batches: [all.slice(0, 15), all.slice(15, 30), all.slice(30)], total: 40 };

beforeEach(async () => {
  idN = 0;
  onSubmitted.mockClear();
  const raw = makeRawCatalog();
  raw.questions = all.map((id) => makeQuestion({ id, topicId: 'cloud-concepts' }));
  services = buildServices({
    executor: await createNodeSqliteExecutor(), catalog: loadCatalog(raw), now: () => NOW,
    newId: () => `id-${++idN}`,
  });
});

async function finish(run: ReviewRun) {
  for (const q of run.session.questions) await run.session.select(q.position, ['A']);
  await run.session.submit('manual');
}

describe('ReviewRun', () => {
  it('rejects an empty plan', async () => {
    await expect(ReviewRun.start(services, { batches: [], total: 0 }, onSubmitted)).rejects.toBeInstanceOf(NoQuestionsError);
  });

  it('walks 15/15/10 batches', async () => {
    const run = await ReviewRun.start(services, plan, onSubmitted);
    expect(run.batchCount).toBe(3);
    expect(run.batchIndex).toBe(0);
    expect(run.remainingAfterCurrent).toBe(25);
    expect(run.finished).toBe(false);
    await expect(run.nextBatch()).rejects.toThrow();
    await finish(run);
    expect(run.answeredSoFar).toBe(15);
    expect(run.results).toHaveLength(1);
    await run.nextBatch();
    expect(run.batchIndex).toBe(1);
    expect(run.remainingAfterCurrent).toBe(10);
    expect(run.session.questions.map((q) => q.questionId)).toEqual(plan.batches[1]);
    await finish(run);
    await run.nextBatch();
    expect(run.remainingAfterCurrent).toBe(0);
    expect(run.finished).toBe(false);
    await finish(run);
    expect(run.finished).toBe(true);
    expect(run.answeredSoFar).toBe(40);
    expect(run.results).toHaveLength(3);
    await expect(run.nextBatch()).rejects.toThrow();
  });

  it('stop() after batch 1 keeps its stats and leaves nothing in progress', async () => {
    const run = await ReviewRun.start(services, plan, onSubmitted);
    await finish(run);
    await run.nextBatch();
    await run.session.select(0, ['A']);
    await run.stop();
    expect(await services.repos.attempts.findInProgress()).toBeNull();
    expect(await services.repos.attempts.listSubmitted()).toHaveLength(1);
    expect(await services.repos.questionStats.get('r0')).not.toBeNull();
    expect(await services.repos.questionStats.get('r15')).toBeNull();
    await run.nextBatch(); // no-op after stop
    expect(run.batchIndex).toBe(1);
    await run.stop();
  });

  it('stop() on a submitted current batch discards nothing', async () => {
    const run = await ReviewRun.start(services, plan, onSubmitted);
    await finish(run);
    await run.stop();
    expect(await services.repos.attempts.listSubmitted()).toHaveLength(1);
  });

  it('stop() mid first batch discards it', async () => {
    const run = await ReviewRun.start(services, plan, onSubmitted);
    await run.stop();
    expect(await services.repos.attempts.findInProgress()).toBeNull();
    expect(await services.repos.attempts.listSubmitted()).toHaveLength(0);
  });

  it('adoptSingle wraps a resumed review attempt', async () => {
    const s = await PracticeSession.startReview(services, all.slice(0, 5), onSubmitted);
    const found = (await services.repos.attempts.findInProgress())!;
    const { session } = await PracticeSession.resume(services, found, onSubmitted);
    void s;
    const run = ReviewRun.adoptSingle(session);
    expect(run.batchCount).toBe(1);
    expect(run.remainingAfterCurrent).toBe(0);
    expect(run.finished).toBe(false);
    await finish(run);
    expect(run.finished).toBe(true);
    expect(run.results).toHaveLength(1);
  });
});
