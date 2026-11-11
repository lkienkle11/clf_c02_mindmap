// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import type { SqlExecutor } from '../sql-executor';
import type { AttemptQuestionRow, AttemptRow } from '../records';
import { createAttemptsRepo } from './attempts';

let db: SqlExecutor;
let repo: ReturnType<typeof createAttemptsRepo>;

beforeEach(async () => {
  db = await createNodeSqliteExecutor();
  repo = createAttemptsRepo(db);
});

const attempt = (): AttemptRow => ({
  id: 'a1',
  kind: 'practice',
  topicId: 't1',
  status: 'in_progress',
  startedAt: 1000,
  submittedAt: null,
  submitReason: null,
  reviewAllowed: true,
  clock: { mode: 'freeze', limitMs: 600000, remainingMs: 590000, deadlineAt: null, onHidden: 'freeze', onReport: 'freeze' },
  heartbeatAt: 1500,
  scorePct: null,
  passed: null,
  groupIndex: null,
  plannedCount: null, unansweredDisplay: 'reveal',
});

const questions = (): AttemptQuestionRow[] => [
  { attemptId: 'a1', position: 0, questionId: 'q1', optionOrder: ['B', 'A', 'C'], selected: [], isCorrect: null },
  { attemptId: 'a1', position: 1, questionId: 'q2', optionOrder: ['D', 'C', 'A', 'B'], selected: ['A'], isCorrect: null },
];

describe('attempts.applyRegrade', () => {
  it('updates the grades, score and passed of a submitted attempt', async () => {
    const rows = questions();
    rows[0].isCorrect = false;
    rows[1].isCorrect = true;
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 50, passed: false }, rows);

    await repo.applyRegrade([{
      attemptId: 'a1',
      grades: [{ position: 0, isCorrect: true }, { position: 1, isCorrect: false }],
      scorePct: 75,
      passed: true,
    }]);

    expect(await db.select('SELECT position, is_correct FROM attempt_questions ORDER BY position')).toEqual([
      { position: 0, is_correct: 1 },
      { position: 1, is_correct: 0 },
    ]);
    expect(await db.select('SELECT status, submitted_at, score_pct, passed FROM attempts')).toEqual([
      { status: 'submitted', submitted_at: 2000, score_pct: 75, passed: 1 },
    ]);
  });

  it('only changes the listed positions', async () => {
    const rows = questions();
    rows[0].isCorrect = false;
    rows[1].isCorrect = false;
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 50, passed: false }, rows);

    await repo.applyRegrade([{
      attemptId: 'a1', grades: [{ position: 0, isCorrect: true }], scorePct: 75, passed: true,
    }]);

    expect(await db.select('SELECT position, is_correct FROM attempt_questions ORDER BY position')).toEqual([
      { position: 0, is_correct: 1 },
      { position: 1, is_correct: 0 },
    ]);
  });

  it('never changes the selected answers', async () => {
    const rows = questions();
    rows[0].selected = ['B', 'C'];
    rows[0].isCorrect = false;
    rows[1].isCorrect = true;
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 50, passed: false }, rows);

    await repo.applyRegrade([{
      attemptId: 'a1',
      grades: [{ position: 0, isCorrect: true }, { position: 1, isCorrect: false }],
      scorePct: 75,
      passed: true,
    }]);

    expect(await db.select('SELECT position, selected FROM attempt_questions ORDER BY position')).toEqual([
      { position: 0, selected: '["B","C"]' },
      { position: 1, selected: '["A"]' },
    ]);
  });

  it('leaves an in-progress attempt untouched', async () => {
    const rows = questions();
    rows[0].isCorrect = false;
    await repo.create(attempt(), rows);
    const attemptsBefore = await db.select('SELECT * FROM attempts ORDER BY id');
    const questionsBefore = await db.select('SELECT * FROM attempt_questions ORDER BY attempt_id, position');

    await repo.applyRegrade([{
      attemptId: 'a1',
      grades: [{ position: 0, isCorrect: true }, { position: 1, isCorrect: false }],
      scorePct: 100,
      passed: true,
    }]);

    expect(await db.select('SELECT * FROM attempts ORDER BY id')).toEqual(attemptsBefore);
    expect(await db.select('SELECT * FROM attempt_questions ORDER BY attempt_id, position')).toEqual(questionsBefore);
  });

  it('skips a change for an attempt that does not exist', async () => {
    await expect(repo.applyRegrade([{
      attemptId: 'missing', grades: [{ position: 0, isCorrect: true }], scorePct: 100, passed: true,
    }])).resolves.toBeUndefined();

    expect(await db.select('SELECT * FROM attempts')).toEqual([]);
    expect(await db.select('SELECT * FROM attempt_questions')).toEqual([]);
  });

  it('applying the same change twice gives the same rows', async () => {
    const rows = questions();
    rows[0].isCorrect = true;
    rows[1].isCorrect = false;
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 50, passed: false }, rows);
    const change = {
      attemptId: 'a1',
      grades: [{ position: 0, isCorrect: false }, { position: 1, isCorrect: true }],
      scorePct: 25,
      passed: false,
    };

    await repo.applyRegrade([change]);
    const attemptsAfterFirst = await db.select('SELECT * FROM attempts ORDER BY id');
    const questionsAfterFirst = await db.select('SELECT * FROM attempt_questions ORDER BY attempt_id, position');
    expect(attemptsAfterFirst).toEqual([expect.objectContaining({ score_pct: 25, passed: 0 })]);
    expect(questionsAfterFirst).toEqual([
      expect.objectContaining({ position: 0, is_correct: 0 }),
      expect.objectContaining({ position: 1, is_correct: 1 }),
    ]);

    await repo.applyRegrade([change]);

    expect(await db.select('SELECT * FROM attempts ORDER BY id')).toEqual(attemptsAfterFirst);
    expect(await db.select('SELECT * FROM attempt_questions ORDER BY attempt_id, position')).toEqual(questionsAfterFirst);
  });

  it('an empty list changes nothing', async () => {
    const rows = questions();
    rows[0].isCorrect = true;
    rows[1].isCorrect = false;
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 50, passed: false }, rows);
    const attemptsBefore = await db.select('SELECT * FROM attempts ORDER BY id');
    const questionsBefore = await db.select('SELECT * FROM attempt_questions ORDER BY attempt_id, position');

    await repo.applyRegrade([]);

    expect(await db.select('SELECT * FROM attempts ORDER BY id')).toEqual(attemptsBefore);
    expect(await db.select('SELECT * FROM attempt_questions ORDER BY attempt_id, position')).toEqual(questionsBefore);
  });
});
