// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import { createAttemptsRepo, createQuestionStatsRepo } from '@/persistence';
import type { AttemptRow, QuestionStat, SqlExecutor } from '@/persistence';
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
      reviewAllowed: true, clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null, onHidden: 'freeze' },
      heartbeatAt: null, scorePct: null, passed: null, groupIndex: null, plannedCount: null,
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
        clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null, onHidden: 'freeze' },
        heartbeatAt: null, scorePct: null, passed: null, groupIndex: null, plannedCount: null,
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

/** Wraps the db to count statements made by reconcile. */
function counting() {
  const log = { selects: [] as string[], executes: [] as string[] };
  const executor: SqlExecutor = {
    select: (q, p) => { log.selects.push(q); return db.select(q, p); },
    execute: (q, p) => { log.executes.push(q); return db.execute(q, p); },
  };
  return { log, deps: { ...deps, executor } };
}

describe('reconcileStats (one replay, minimal writes)', () => {
  it('replays the whole history with ONE ordered select plus one read of the current stats', async () => {
    await submit('a1', 1000, { q1: true, q2: false, q3: true });
    await submit('a2', 2000, { q1: true, q3: false });
    const { log, deps: d } = counting();
    await reconcileStats(d);
    expect(log.selects).toHaveLength(2);
    expect(log.executes).toHaveLength(3); // three new rows, nothing else
  });

  it('writes nothing when the stats already match the history', async () => {
    await submit('a1', 1000, { q1: true, q2: false });
    await reconcileStats(deps);
    const { log, deps: d } = counting();
    await reconcileStats(d);
    expect(log.executes).toEqual([]);
  });

  it('matches rebuildStatsFor exactly', async () => {
    await submit('a1', 1000, { q1: true, q2: false });
    await submit('a2', 1000, { q2: true, q1: false }); // tie on submitted_at: attempt id decides
    await submit('a3', 5000, { q1: true }, 'review');
    await reconcileStats(deps);
    const viaReconcile = await stats().listAll();
    await db.execute('DELETE FROM question_stats');
    await rebuildStatsFor(deps, ['q1', 'q2']);
    expect(await stats().listAll()).toEqual(viaReconcile);
  });

  it('repairs a partial crash: one question rebuilt, another left with a stale box, a third missing', async () => {
    await submit('a1', 1000, { q1: true, q2: true, q3: true });
    await reconcileStats(deps);
    // A later attempt was committed, then the app died after rebuilding only q1.
    await submit('a2', 2000, { q1: false, q2: false, q3: true });
    await rebuildStatsFor(deps, ['q1']);
    await db.execute('UPDATE question_stats SET box = 5 WHERE question_id = $1', ['q2']); // stale/corrupt box
    await db.execute('DELETE FROM question_stats WHERE question_id = $1', ['q3']);
    const { log, deps: d } = counting();
    await reconcileStats(d);
    expect(log.executes).toHaveLength(2); // q2 and q3 only; q1 was already right
    const repaired = await stats().listAll();
    await db.execute('DELETE FROM question_stats');
    await rebuildStatsFor(deps, ['q1', 'q2', 'q3']);
    expect(repaired).toEqual(await stats().listAll());
    expect(repaired.find((s) => s.questionId === 'q2')).toMatchObject({ box: 0, timesSeen: 2, lastCorrect: false });
  });

  it('keeps a question whose topic is unknown (null topic) with topicId null', async () => {
    await submit('a1', 1000, { x1: true }); // topicOf('x1') === null in these deps
    await reconcileStats(deps);
    const expected: QuestionStat = {
      questionId: 'x1', topicId: null, box: 1, dueAt: 1000 + 3 * DAY, timesSeen: 1, timesCorrect: 1, lastSeenAt: 1000, lastCorrect: true,
    };
    expect(await stats().listAll()).toEqual([expected]);
  });

  it('updates the stored topic when the catalog moved a question to another topic', async () => {
    await submit('a1', 1000, { q1: true });
    await reconcileStats(deps);
    await reconcileStats({ ...deps, topicOf: () => 'topic-2' });
    expect((await stats().get('q1'))?.topicId).toBe('topic-2');
  });

  it('ignores orphan question rows whose attempt row is gone', async () => {
    await submit('a1', 1000, { q1: true });
    await db.execute("DELETE FROM attempts WHERE id = 'a1'");
    await reconcileStats(deps);
    expect(await stats().listAll()).toEqual([]);
  });
});
