// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAttemptsRepo } from '@/persistence';
import type { AttemptQuestionRow, AttemptRow, AttemptsRepo, SqlExecutor } from '@/persistence';
import { makeQuestion } from '@/testing/fixtures';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import { reconcileAnswers } from './answers-reconcile';

let db: SqlExecutor;
let repo: AttemptsRepo;

beforeEach(async () => {
  db = await createNodeSqliteExecutor();
  repo = createAttemptsRepo(db);
});

const attempt = (id = 'a1'): AttemptRow => ({
  id,
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
  plannedCount: null,
});

const questions = (attemptId = 'a1'): AttemptQuestionRow[] => [
  { attemptId, position: 0, questionId: 'q1', optionOrder: ['B', 'A'], selected: ['A'], isCorrect: true },
  { attemptId, position: 1, questionId: 'q2', optionOrder: ['A', 'B'], selected: ['A'], isCorrect: true },
];

describe('reconcileAnswers', () => {
  it('flips an old tick when the bank answer changed, and recomputes score and passed', async () => {
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 100, passed: true }, questions());
    const catalog = { questions: [makeQuestion({ id: 'q1', correct: ['B'] }), makeQuestion({ id: 'q2' })] };

    expect(await reconcileAnswers({ attempts: repo, catalog })).toEqual({ attempts: 1, answers: 1 });

    expect(await db.select('SELECT position, selected, is_correct FROM attempt_questions ORDER BY position')).toEqual([
      { position: 0, selected: '["A"]', is_correct: 0 },
      { position: 1, selected: '["A"]', is_correct: 1 },
    ]);
    expect(await db.select('SELECT status, submitted_at, score_pct, passed FROM attempts')).toEqual([
      { status: 'submitted', submitted_at: 2000, score_pct: 50, passed: 0 },
    ]);
  });

  it('running it again changes nothing', async () => {
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 100, passed: true }, questions());
    const catalog = { questions: [makeQuestion({ id: 'q1', correct: ['B'] }), makeQuestion({ id: 'q2' })] };

    expect(await reconcileAnswers({ attempts: repo, catalog })).toEqual({ attempts: 1, answers: 1 });
    const attemptsAfterFirst = await db.select('SELECT * FROM attempts ORDER BY id');
    const questionsAfterFirst = await db.select('SELECT * FROM attempt_questions ORDER BY attempt_id, position');
    expect(attemptsAfterFirst).toEqual([expect.objectContaining({ score_pct: 50, passed: 0 })]);
    expect(questionsAfterFirst).toEqual([
      expect.objectContaining({ position: 0, is_correct: 0 }),
      expect.objectContaining({ position: 1, is_correct: 1 }),
    ]);

    expect(await reconcileAnswers({ attempts: repo, catalog })).toEqual({ attempts: 0, answers: 0 });

    expect(await db.select('SELECT * FROM attempts ORDER BY id')).toEqual(attemptsAfterFirst);
    expect(await db.select('SELECT * FROM attempt_questions ORDER BY attempt_id, position')).toEqual(questionsAfterFirst);
  });

  it('an unchanged bank changes nothing', async () => {
    const rows = questions();
    rows[1].selected = ['B'];
    rows[1].isCorrect = false;
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 50, passed: false }, rows);
    const catalog = { questions: [makeQuestion({ id: 'q1' }), makeQuestion({ id: 'q2' })] };
    const attemptsBefore = await db.select('SELECT * FROM attempts ORDER BY id');
    const questionsBefore = await db.select('SELECT * FROM attempt_questions ORDER BY attempt_id, position');

    expect(await reconcileAnswers({ attempts: repo, catalog })).toEqual({ attempts: 0, answers: 0 });

    expect(await db.select('SELECT * FROM attempts ORDER BY id')).toEqual(attemptsBefore);
    expect(await db.select('SELECT * FROM attempt_questions ORDER BY attempt_id, position')).toEqual(questionsBefore);
  });

  it('a question that is no longer in the bank keeps its stored grade and does not throw', async () => {
    const rows = questions();
    rows[1].isCorrect = false;
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 50, passed: false }, rows);
    const catalog = { questions: [makeQuestion({ id: 'q2' })] };

    expect(await reconcileAnswers({ attempts: repo, catalog })).toEqual({ attempts: 1, answers: 1 });

    expect(await db.select('SELECT question_id, is_correct FROM attempt_questions ORDER BY position')).toEqual([
      { question_id: 'q1', is_correct: 1 },
      { question_id: 'q2', is_correct: 1 },
    ]);
    expect(await db.select('SELECT score_pct, passed FROM attempts')).toEqual([{ score_pct: 100, passed: 1 }]);
  });

  it('leaves an in-progress attempt untouched', async () => {
    await repo.create(attempt('active'), questions('active'));
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 100, passed: true }, questions());
    const attemptsBefore = await db.select("SELECT * FROM attempts WHERE id = 'active'");
    const questionsBefore = await db.select("SELECT * FROM attempt_questions WHERE attempt_id = 'active' ORDER BY position");
    const catalog = { questions: [makeQuestion({ id: 'q1', correct: ['B'] }), makeQuestion({ id: 'q2' })] };

    expect(await reconcileAnswers({ attempts: repo, catalog })).toEqual({ attempts: 1, answers: 1 });

    expect(await db.select("SELECT * FROM attempts WHERE id = 'active'")).toEqual(attemptsBefore);
    expect(await db.select("SELECT * FROM attempt_questions WHERE attempt_id = 'active' ORDER BY position")).toEqual(questionsBefore);
    expect(await db.select("SELECT score_pct, passed FROM attempts WHERE id = 'a1'")).toEqual([{ score_pct: 50, passed: 0 }]);
  });

  it('recomputes passed for a checkpoint attempt', async () => {
    const fallingRows: AttemptQuestionRow[] = Array.from({ length: 5 }, (_, position) => ({
      attemptId: 'falls',
      position,
      questionId: `q${position + 1}`,
      optionOrder: ['B', 'A'],
      selected: ['A'],
      isCorrect: position === 4 ? null : true,
    }));
    const risingRows = fallingRows.map((row) => ({
      ...row,
      attemptId: 'rises',
      selected: row.position === 0 ? ['B'] : ['A'],
      isCorrect: row.position === 0 ? false : row.isCorrect,
    }));
    await repo.create({
      ...attempt('falls'), kind: 'checkpoint', groupIndex: 0, plannedCount: 5,
      status: 'submitted', submittedAt: 2000, scorePct: 80, passed: true,
    }, fallingRows);
    await repo.create({
      ...attempt('rises'), kind: 'checkpoint', groupIndex: 0, plannedCount: 5,
      status: 'submitted', submittedAt: 2000, scorePct: 60, passed: false,
    }, risingRows);
    const catalog = {
      questions: Array.from({ length: 5 }, (_, position) => makeQuestion({
        id: `q${position + 1}`, correct: position === 0 ? ['B'] : ['A'],
      })),
    };

    expect(await reconcileAnswers({ attempts: repo, catalog })).toEqual({ attempts: 2, answers: 2 });

    expect(await db.select('SELECT id, score_pct, passed FROM attempts ORDER BY id')).toEqual([
      { id: 'falls', score_pct: 60, passed: 0 },
      { id: 'rises', score_pct: 80, passed: 1 },
    ]);
    expect(await db.select('SELECT attempt_id, position, is_correct FROM attempt_questions WHERE position IN (0, 4) ORDER BY attempt_id, position')).toEqual([
      { attempt_id: 'falls', position: 0, is_correct: 0 },
      { attempt_id: 'falls', position: 4, is_correct: null },
      { attempt_id: 'rises', position: 0, is_correct: 1 },
      { attempt_id: 'rises', position: 4, is_correct: null },
    ]);
  });

  it('re-grades several attempts in one run', async () => {
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 100, passed: true }, questions());
    const rows = questions('a2');
    rows[0].selected = ['B'];
    rows[0].isCorrect = false;
    rows[1].isCorrect = false;
    await repo.create({ ...attempt('a2'), status: 'submitted', submittedAt: 2000, scorePct: 0, passed: false }, rows);
    const catalog = { questions: [makeQuestion({ id: 'q1', correct: ['B'] }), makeQuestion({ id: 'q2' })] };

    expect(await reconcileAnswers({ attempts: repo, catalog })).toEqual({ attempts: 2, answers: 3 });

    expect(await db.select('SELECT id, score_pct, passed FROM attempts ORDER BY id')).toEqual([
      { id: 'a1', score_pct: 50, passed: 0 },
      { id: 'a2', score_pct: 100, passed: 1 },
    ]);
    expect(await db.select('SELECT attempt_id, position, is_correct FROM attempt_questions ORDER BY attempt_id, position')).toEqual([
      { attempt_id: 'a1', position: 0, is_correct: 0 },
      { attempt_id: 'a1', position: 1, is_correct: 1 },
      { attempt_id: 'a2', position: 0, is_correct: 1 },
      { attempt_id: 'a2', position: 1, is_correct: 1 },
    ]);
  });

  it('calls beforeWrite once, and only when something will change', async () => {
    for (const id of ['a1', 'a2']) {
      await repo.create({ ...attempt(id), status: 'submitted', submittedAt: 2000, scorePct: 100, passed: true }, questions(id));
    }
    const attemptsBefore = await db.select('SELECT * FROM attempts ORDER BY id');
    const questionsBefore = await db.select('SELECT * FROM attempt_questions ORDER BY attempt_id, position');
    const beforeWrite = vi.fn(async () => {
      await Promise.resolve();
      expect(await db.select('SELECT * FROM attempts ORDER BY id')).toEqual(attemptsBefore);
      expect(await db.select('SELECT * FROM attempt_questions ORDER BY attempt_id, position')).toEqual(questionsBefore);
    });
    const unchanged = { questions: [makeQuestion({ id: 'q1' }), makeQuestion({ id: 'q2' })] };

    expect(await reconcileAnswers({ attempts: repo, catalog: unchanged, beforeWrite })).toEqual({ attempts: 0, answers: 0 });
    expect(beforeWrite).not.toHaveBeenCalled();

    const changed = { questions: [makeQuestion({ id: 'q1', correct: ['B'] }), makeQuestion({ id: 'q2' })] };
    expect(await reconcileAnswers({ attempts: repo, catalog: changed, beforeWrite })).toEqual({ attempts: 2, answers: 2 });
    expect(beforeWrite).toHaveBeenCalledTimes(1);
    expect(await db.select('SELECT id, score_pct, passed FROM attempts ORDER BY id')).toEqual([
      { id: 'a1', score_pct: 50, passed: 0 },
      { id: 'a2', score_pct: 50, passed: 0 },
    ]);
  });

  it('a failing beforeWrite writes nothing and rethrows', async () => {
    for (const id of ['a1', 'a2']) {
      await repo.create({ ...attempt(id), status: 'submitted', submittedAt: 2000, scorePct: 100, passed: true }, questions(id));
    }
    const attemptsBefore = await db.select('SELECT * FROM attempts ORDER BY id');
    const questionsBefore = await db.select('SELECT * FROM attempt_questions ORDER BY attempt_id, position');
    const error = new Error('backup failed');
    const beforeWrite = vi.fn(async () => { throw error; });
    const catalog = { questions: [makeQuestion({ id: 'q1', correct: ['B'] }), makeQuestion({ id: 'q2' })] };

    await expect(reconcileAnswers({ attempts: repo, catalog, beforeWrite })).rejects.toBe(error);

    expect(beforeWrite).toHaveBeenCalledTimes(1);
    expect(await db.select('SELECT * FROM attempts ORDER BY id')).toEqual(attemptsBefore);
    expect(await db.select('SELECT * FROM attempt_questions ORDER BY attempt_id, position')).toEqual(questionsBefore);
  });

  it('a multiple-answer question is graded as a set', async () => {
    const rows = questions().slice(0, 1);
    rows[0].selected = ['B', 'A'];
    rows[0].isCorrect = false;
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 0, passed: false }, rows);
    const catalog = { questions: [makeQuestion({ correct: ['A', 'B'], multi: true })] };

    expect(await reconcileAnswers({ attempts: repo, catalog })).toEqual({ attempts: 1, answers: 1 });

    expect(await db.select('SELECT selected, is_correct FROM attempt_questions')).toEqual([
      { selected: '["B","A"]', is_correct: 1 },
    ]);
    expect(await db.select('SELECT score_pct, passed FROM attempts')).toEqual([{ score_pct: 100, passed: 1 }]);
  });

  it('repairs an attempt whose grades were updated but whose score was not (interrupted write)', async () => {
    const rows = questions();
    rows[0].isCorrect = false;
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 100, passed: true }, rows);
    const catalog = { questions: [makeQuestion({ id: 'q1', correct: ['B'] }), makeQuestion({ id: 'q2' })] };

    expect(await reconcileAnswers({ attempts: repo, catalog })).toEqual({ attempts: 1, answers: 0 });

    expect(await db.select('SELECT score_pct, passed FROM attempts')).toEqual([{ score_pct: 50, passed: 0 }]);
  });

  it('repairs a stale score even when the bank did not change', async () => {
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 50, passed: false }, questions());
    const catalog = { questions: [makeQuestion({ id: 'q1' }), makeQuestion({ id: 'q2' })] };

    expect(await reconcileAnswers({ attempts: repo, catalog })).toEqual({ attempts: 1, answers: 0 });

    expect(await db.select('SELECT score_pct, passed FROM attempts')).toEqual([{ score_pct: 100, passed: 1 }]);
  });

  it('skips a submitted attempt that has no answer rows', async () => {
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 100, passed: true }, []);
    const catalog = { questions: [makeQuestion({ id: 'q1' }), makeQuestion({ id: 'q2' })] };
    const attemptsBefore = await db.select('SELECT * FROM attempts ORDER BY id');

    expect(await reconcileAnswers({ attempts: repo, catalog })).toEqual({ attempts: 0, answers: 0 });

    expect(await db.select('SELECT * FROM attempts ORDER BY id')).toEqual(attemptsBefore);
  });

  it('calls beforeWrite before a score-only repair', async () => {
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 50, passed: false }, questions());
    const catalog = { questions: [makeQuestion({ id: 'q1' }), makeQuestion({ id: 'q2' })] };
    const beforeWrite = vi.fn(async () => {
      expect(await db.select('SELECT score_pct, passed FROM attempts')).toEqual([{ score_pct: 50, passed: 0 }]);
    });

    await reconcileAnswers({ attempts: repo, catalog, beforeWrite });

    expect(beforeWrite).toHaveBeenCalledTimes(1);
    expect(await db.select('SELECT score_pct, passed FROM attempts')).toEqual([{ score_pct: 100, passed: 1 }]);
  });

  it('writes changed grades even when the score stays the same', async () => {
    const rows = questions();
    rows[1].selected = ['B'];
    rows[1].isCorrect = false;
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 50, passed: false }, rows);
    const catalog = { questions: [makeQuestion({ id: 'q1', correct: ['B'] }), makeQuestion({ id: 'q2', correct: ['B'] })] };

    expect(await reconcileAnswers({ attempts: repo, catalog })).toEqual({ attempts: 1, answers: 2 });

    expect(await db.select('SELECT position, is_correct FROM attempt_questions ORDER BY position')).toEqual([
      expect.objectContaining({ position: 0, is_correct: 0 }),
      expect.objectContaining({ position: 1, is_correct: 1 }),
    ]);
    expect(await db.select('SELECT score_pct, passed FROM attempts')).toEqual([{ score_pct: 50, passed: 0 }]);
  });

  it('repairs a stale passed flag when the score is already right', async () => {
    const rows: AttemptQuestionRow[] = Array.from({ length: 5 }, (_, position) => ({
      attemptId: 'a1',
      position,
      questionId: `q${position + 1}`,
      optionOrder: ['A', 'B'],
      selected: ['A'],
      isCorrect: position !== 4,
    }));
    await repo.create({ ...attempt(), status: 'submitted', submittedAt: 2000, scorePct: 80, passed: false }, rows);
    const catalog = {
      questions: Array.from({ length: 5 }, (_, position) => makeQuestion({
        id: `q${position + 1}`, correct: position === 4 ? ['B'] : ['A'],
      })),
    };

    expect(await reconcileAnswers({ attempts: repo, catalog })).toEqual({ attempts: 1, answers: 0 });

    expect(await db.select('SELECT score_pct, passed FROM attempts')).toEqual([{ score_pct: 80, passed: 1 }]);
  });
});
