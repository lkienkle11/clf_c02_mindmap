// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { createNodeSqliteExecutor, translatePlaceholders } from '@/testing/node-sqlite-executor';
import type { SqlExecutor } from '../sql-executor';
import type { AttemptQuestionRow, AttemptRow, QuestionStat } from '../records';
import { createLessonProgressRepo } from './lesson-progress';
import { createAttemptsRepo } from './attempts';
import { createQuestionStatsRepo } from './question-stats';
import { createSettingsRepo } from './settings';

let db: SqlExecutor;
beforeEach(async () => {
  db = await createNodeSqliteExecutor();
});

const attempt = (over: Partial<AttemptRow> = {}): AttemptRow => ({
  id: 'a1',
  kind: 'practice',
  topicId: 't1',
  status: 'in_progress',
  startedAt: 1000,
  submittedAt: null,
  submitReason: null,
  reviewAllowed: true,
  clock: { mode: 'freeze', limitMs: 600000, remainingMs: 590000, deadlineAt: null },
  heartbeatAt: 1500,
  scorePct: null,
  passed: null,
  ...over,
});
const questions = (attemptId = 'a1'): AttemptQuestionRow[] => [
  { attemptId, position: 0, questionId: 'q1', optionOrder: ['B', 'A', 'C'], selected: [], isCorrect: null },
  { attemptId, position: 1, questionId: 'q2', optionOrder: ['D', 'C', 'A', 'B'], selected: ['A'], isCorrect: null },
];

describe('translatePlaceholders', () => {
  it('maps $n to numbered ? params', () => {
    expect(translatePlaceholders('SELECT * FROM t WHERE a = $1 AND b = $2')).toBe(
      'SELECT * FROM t WHERE a = ?1 AND b = ?2',
    );
  });
  it('lets repositories use $n against node:sqlite', async () => {
    await db.execute('INSERT INTO settings (key, value) VALUES ($1, $2)', ['k', 'v']);
    expect(await db.select('SELECT value FROM settings WHERE key = $1', ['k'])).toEqual([{ value: 'v' }]);
  });
});

describe('migration', () => {
  it('can run twice without error', async () => {
    const { readFileSync } = await import('node:fs');
    const sql = readFileSync('src-tauri/migrations/0001_init.sql', 'utf8');
    await expect(db.execute(sql)).resolves.toBeUndefined();
  });
});

describe('lessonProgress', () => {
  it('markRead twice is fine and readIds lists ids', async () => {
    const repo = createLessonProgressRepo(db);
    await repo.markRead('l1', 10);
    await repo.markRead('l1', 20);
    await repo.markRead('l2', 30);
    expect(await repo.readIds()).toEqual(new Set(['l1', 'l2']));
  });
});

describe('attempts', () => {
  it('create inserts questions first: a failure midway leaves no in_progress attempt', async () => {
    let calls = 0;
    const flaky: SqlExecutor = {
      select: (sql, params) => db.select(sql, params),
      execute: async (sql, params) => {
        calls += 1;
        if (calls === 2) throw new Error('killed midway');
        return db.execute(sql, params);
      },
    };
    const repo = createAttemptsRepo(flaky);
    await expect(repo.create(attempt(), questions())).rejects.toThrow('killed midway');
    expect(await createAttemptsRepo(db).findInProgress()).toBeNull();
  });

  it('findInProgress breaks started_at ties by id DESC', async () => {
    const repo = createAttemptsRepo(db);
    await repo.create(attempt({ id: 'a1' }), questions('a1'));
    await repo.create(attempt({ id: 'a2' }), questions('a2'));
    expect((await repo.findInProgress())!.attempt.id).toBe('a2');
  });

  it('create then findInProgress restores everything exactly', async () => {
    const repo = createAttemptsRepo(db);
    await repo.create(attempt(), questions());
    const found = await repo.findInProgress();
    expect(found).not.toBeNull();
    expect(found!.attempt).toEqual(attempt());
    expect(found!.questions).toEqual(questions());
  });

  it('round-trips a run clock and null topic', async () => {
    const repo = createAttemptsRepo(db);
    const a = attempt({
      kind: 'review',
      topicId: null,
      reviewAllowed: false,
      clock: { mode: 'run', limitMs: null, remainingMs: null, deadlineAt: null },
      heartbeatAt: null,
    });
    await repo.create(a, questions());
    expect((await repo.findInProgress())!.attempt).toEqual(a);
  });

  it('findInProgress returns null when none', async () => {
    expect(await createAttemptsRepo(db).findInProgress()).toBeNull();
  });

  it('saveAnswer overwrites', async () => {
    const repo = createAttemptsRepo(db);
    await repo.create(attempt(), questions());
    await repo.saveAnswer('a1', 1, ['B', 'C']);
    await repo.saveAnswer('a1', 1, ['D']);
    const qs = await repo.questionsOf('a1');
    expect(qs[1].selected).toEqual(['D']);
    expect(qs[0].selected).toEqual([]);
  });

  it('saveClock persists clock and heartbeat', async () => {
    const repo = createAttemptsRepo(db);
    await repo.create(attempt(), questions());
    const clock = { mode: 'run' as const, limitMs: 1000, remainingMs: null, deadlineAt: 99999 };
    await repo.saveClock('a1', clock, 2222);
    const a = (await repo.findInProgress())!.attempt;
    expect(a.clock).toEqual(clock);
    expect(a.heartbeatAt).toBe(2222);
  });

  it('markSubmitted applies grades and updates the attempt', async () => {
    const repo = createAttemptsRepo(db);
    await repo.create(attempt(), questions());
    await repo.markSubmitted('a1', {
      scorePct: 50,
      passed: false,
      reason: 'timeout',
      at: 5000,
      grades: [
        { position: 0, isCorrect: true },
        { position: 1, isCorrect: false },
      ],
    });
    const qs = await repo.questionsOf('a1');
    expect(qs.map((q) => q.isCorrect)).toEqual([true, false]);
    const [row] = await repo.listSubmitted();
    expect(row).toMatchObject({
      id: 'a1',
      status: 'submitted',
      submittedAt: 5000,
      submitReason: 'timeout',
      scorePct: 50,
      passed: false,
    });
    expect(await repo.findInProgress()).toBeNull();
  });

  it('discard removes the attempt and all its questions', async () => {
    const repo = createAttemptsRepo(db);
    await repo.create(attempt(), questions());
    await repo.create(attempt({ id: 'a2' }), questions('a2'));
    await repo.discard('a1');
    expect(await db.select('SELECT * FROM attempts WHERE id = $1', ['a1'])).toEqual([]);
    expect(await db.select('SELECT * FROM attempt_questions WHERE attempt_id = $1', ['a1'])).toEqual([]);
    expect(await repo.questionsOf('a2')).toHaveLength(2);
  });

  it('listSubmitted excludes in_progress attempts', async () => {
    const repo = createAttemptsRepo(db);
    await repo.create(attempt({ id: 'a1' }), questions('a1'));
    await repo.create(attempt({ id: 'a2' }), questions('a2'));
    await repo.markSubmitted('a2', { scorePct: 100, passed: true, reason: 'manual', at: 9, grades: [] });
    const list = await repo.listSubmitted();
    expect(list.map((a) => a.id)).toEqual(['a2']);
    expect(list[0].passed).toBe(true);
  });
});

describe('questionStats', () => {
  const stat = (over: Partial<QuestionStat> = {}): QuestionStat => ({
    questionId: 'q1',
    topicId: 't1',
    box: 1,
    dueAt: 100,
    timesSeen: 1,
    timesCorrect: 1,
    lastSeenAt: 50,
    lastCorrect: true,
    ...over,
  });
  it('get returns null when missing', async () => {
    expect(await createQuestionStatsRepo(db).get('nope')).toBeNull();
  });
  it('upsert is idempotent and overwrites', async () => {
    const repo = createQuestionStatsRepo(db);
    await repo.upsert(stat());
    await repo.upsert(stat());
    expect(await repo.listAll()).toEqual([stat()]);
    await repo.upsert(stat({ box: 3, lastCorrect: false, topicId: null }));
    expect(await repo.get('q1')).toEqual(stat({ box: 3, lastCorrect: false, topicId: null }));
    expect(await repo.listAll()).toHaveLength(1);
  });
});

describe('settings', () => {
  it('round-trips and overwrites', async () => {
    const repo = createSettingsRepo(db);
    expect(await repo.get('language')).toBeNull();
    await repo.set('language', 'vi');
    await repo.set('language', 'en');
    await repo.set('review_prompt_last_shown_date', '2026-11-02');
    expect(await repo.get('language')).toBe('en');
    expect(await repo.get('review_prompt_last_shown_date')).toBe('2026-11-02');
  });
});
