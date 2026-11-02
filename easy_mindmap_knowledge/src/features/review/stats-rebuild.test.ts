// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import { createAttemptsRepo, createQuestionStatsRepo } from '@/persistence';
import type { AttemptRow, SqlExecutor } from '@/persistence';
import { LeitnerScheduler, reconcileStats, rebuildStatsFor } from './index';

const DAY = 86_400_000;
let db: SqlExecutor;
let deps: Parameters<typeof rebuildStatsFor>[0];
beforeEach(async () => {
  db = await createNodeSqliteExecutor();
  deps = { executor: db, scheduler: new LeitnerScheduler(), topicOf: (id) => (id.startsWith('q') ? 'topic-1' : null) };
});

async function submit(
  id: string, at: number, answers: Record<string, boolean>, kind: AttemptRow['kind'] = 'practice',
) {
  const repo = createAttemptsRepo(db);
  const qs = Object.keys(answers).map((questionId, position) => ({
    attemptId: id, position, questionId, optionOrder: ['A', 'B'], selected: ['A'], isCorrect: null,
  }));
  await repo.create(
    {
      id, kind, topicId: 't', status: 'in_progress', startedAt: at - 10, submittedAt: null, submitReason: null,
      reviewAllowed: true, clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null },
      heartbeatAt: null, scorePct: null, passed: null,
    },
    qs,
  );
  await repo.markSubmitted(id, {
    scorePct: 50, passed: false, reason: 'manual', at,
    grades: qs.map((q) => ({ position: q.position, isCorrect: answers[q.questionId], selected: q.selected })),
  });
}
const stats = () => createQuestionStatsRepo(db);

describe('rebuildStatsFor', () => {
  it('replays three attempts in submitted_at order', async () => {
    await submit('a2', 2000, { q1: false });
    await submit('a1', 1000, { q1: true });
    await submit('a3', 3000, { q1: true });
    await rebuildStatsFor(deps, ['q1']);
    expect(await stats().get('q1')).toEqual({
      questionId: 'q1', topicId: 'topic-1', box: 1, dueAt: 3000 + 3 * DAY,
      timesSeen: 3, timesCorrect: 2, lastSeenAt: 3000, lastCorrect: true,
    });
  });
  it('question absent from history gets no stats row', async () => {
    await rebuildStatsFor(deps, ['qX']);
    expect(await stats().get('qX')).toBeNull();
  });
  it('removes a stale row when history is gone', async () => {
    await stats().upsert({
      questionId: 'q9', topicId: null, box: 2, dueAt: 1, timesSeen: 4, timesCorrect: 4, lastSeenAt: 1, lastCorrect: true,
    });
    await rebuildStatsFor(deps, ['q9']);
    expect(await stats().get('q9')).toBeNull();
  });
  it('counts review attempts and ignores in-progress / ungraded', async () => {
    await submit('r1', 1000, { q1: true }, 'review');
    const repo = createAttemptsRepo(db);
    await repo.create(
      {
        id: 'ip', kind: 'practice', topicId: 't', status: 'in_progress', startedAt: 5, submittedAt: null,
        submitReason: null, reviewAllowed: true,
        clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null },
        heartbeatAt: null, scorePct: null, passed: null,
      },
      [{ attemptId: 'ip', position: 0, questionId: 'q1', optionOrder: ['A'], selected: ['A'], isCorrect: null }],
    );
    await rebuildStatsFor(deps, ['q1']);
    expect((await stats().get('q1'))?.timesSeen).toBe(1);
  });
  it('is deterministic when submitted_at ties (attempt id breaks the tie)', async () => {
    await submit('b2', 1000, { q1: false });
    await submit('b1', 1000, { q1: true });
    await rebuildStatsFor(deps, ['q1']);
    const first = await stats().get('q1');
    await rebuildStatsFor(deps, ['q1']);
    expect(await stats().get('q1')).toEqual(first);
    // b1 (correct) then b2 (wrong) => box 0
    expect(first).toMatchObject({ box: 0, lastCorrect: false, timesSeen: 2 });
  });
});

describe('reconcileStats (crash safety)', () => {
  it('rebuilds stats missing after a crash, and is idempotent', async () => {
    await submit('a1', 1000, { q1: true, q2: false });
    await submit('a2', 2000, { q1: true });
    expect(await stats().listAll()).toEqual([]); // crashed before rebuild
    await reconcileStats(deps);
    const first = await stats().listAll();
    expect(first).toHaveLength(2);
    expect(first.find((s) => s.questionId === 'q1')).toMatchObject({ box: 2, timesSeen: 2, timesCorrect: 2 });
    expect(first.find((s) => s.questionId === 'q2')).toMatchObject({ box: 0, timesSeen: 1, timesCorrect: 0 });
    await reconcileStats(deps);
    expect(await stats().listAll()).toEqual(first);
  });
  it('clears stats rows with no submitted history', async () => {
    await submit('a1', 1000, { q1: true });
    await stats().upsert({
      questionId: 'ghost', topicId: null, box: 3, dueAt: 1, timesSeen: 3, timesCorrect: 3, lastSeenAt: 1, lastCorrect: true,
    });
    await reconcileStats(deps);
    expect((await stats().listAll()).map((s) => s.questionId)).toEqual(['q1']);
  });
});
