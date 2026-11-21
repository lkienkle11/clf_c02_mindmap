// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { loadCatalog } from '@/content/load-catalog';
import { buildServices } from '@/app/composition';
import type { Services } from '@/app/composition';
import { makeQuestion, makeRawCatalog } from '@/testing/fixtures';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import type { SqlExecutor } from '@/persistence';
import { DEFAULT_PRACTICE_OPTIONS, PracticeSession } from './index';

const NOW = Date.UTC(2026, 5, 15, 12, 0, 0);
let services: Services;
let db: SqlExecutor;
let idN = 0;
const onSubmitted = async () => {};

function makeQuestions() {
  const raw = makeRawCatalog();
  raw.questions = Array.from({ length: 10 }, (_, i) => makeQuestion({
    id: `help-${i}`,
    topicId: 'compute',
    options: [{ key: 'A', text: 'Correct' }, { key: 'B', text: 'Wrong one' }, { key: 'C', text: 'Wrong two' }],
    correct: ['A'],
  }));
  return raw;
}

beforeEach(async () => {
  db = await createNodeSqliteExecutor();
  services = buildServices({ executor: db, catalog: loadCatalog(makeQuestions()), now: () => NOW, newId: () => `help-attempt-${++idN}` });
  idN = 0;
});

const practiceOptions = (showAnswer: boolean) => ({ ...DEFAULT_PRACTICE_OPTIONS, questionCount: 10, showAnswer });
const examPlan = Array.from({ length: 5 }, (_, i) => ({ questionId: `help-${i}`, optionOrder: ['A', 'B', 'C'] }));

describe('help flow', () => {
  it('grades a corrected answer as correct after revealing it', async () => {
    const session = await PracticeSession.start(services, 'compute', practiceOptions(true), onSubmitted);
    await session.reveal(0);
    await session.select(0, ['B']);
    await session.select(0, ['A']);
    const result = await session.submit('manual');

    expect(session.questions[0].revealed).toBe(true);
    expect(result.items[0]).toMatchObject({ selected: ['A'], correct: ['A'], isCorrect: true });
  });

  it('keeps the score identical with and without reveals for the same final selections', async () => {
    const withReveal = await PracticeSession.start(services, 'compute', practiceOptions(true), onSubmitted);
    const withoutReveal = await PracticeSession.start(services, 'compute', practiceOptions(false), onSubmitted);
    for (let position = 0; position < 10; position += 1) {
      if (position === 0) await withReveal.reveal(position);
      const answer = position < 3 ? ['A'] : ['B'];
      await withReveal.select(position, answer);
      await withoutReveal.select(position, answer);
    }

    expect(await withReveal.submit('manual')).toMatchObject({ scorePct: 30 });
    expect(await withoutReveal.submit('manual')).toMatchObject({ scorePct: 30 });
  });

  it('refuses a fourth reveal after resuming three stored checkpoint reveals', async () => {
    const session = await PracticeSession.startExam(services, {
      kind: 'checkpoint', topicId: null, groupIndex: 0, plan: examPlan, limitMs: 60_000, help: true,
    }, onSubmitted);
    await session.reveal(0);
    await session.reveal(1);
    await session.reveal(2);
    const found = await services.repos.attempts.findInProgress();
    const { session: resumed } = await PracticeSession.resume(services, found!, onSubmitted);

    await resumed.reveal(3);
    const stored = await services.repos.attempts.questionsOf(resumed.attemptId);
    expect(stored.slice(0, 3).every((q) => q.revealed)).toBe(true);
    expect(stored[3].revealed).toBe(false);
    expect(resumed.questions[3].revealed).toBe(false);
    expect(resumed.helpLeft.reveal).toBe(0);
  });

  it('resumes rows with migration defaults as having no help used', async () => {
    const id = 'pre-help-attempt';
    await db.execute(
      `INSERT INTO attempts
       (id, kind, topic_id, status, started_at, review_allowed, time_limit_ms, clock_mode, remaining_ms,
        deadline_at, heartbeat_at, clock_on_hidden, group_index, planned_count, clock_on_report, unanswered_display)
       VALUES ($1, 'practice', 'compute', 'in_progress', $2, 0, NULL, 'freeze', NULL, NULL, $2, 'freeze', NULL, 1, 'freeze', 'reveal')`,
      [id, NOW],
    );
    await db.execute(
      `INSERT INTO attempt_questions (attempt_id, position, question_id, option_order, selected, is_correct, unscored)
       VALUES ($1, 0, 'help-0', '["A","B","C"]', '[]', NULL, 0)`,
      [id],
    );
    const found = await services.repos.attempts.findInProgress();
    const { session } = await PracticeSession.resume(services, found!, onSubmitted);

    expect(session.helpMode).toBe('off');
    expect(session.questions[0]).toMatchObject({ revealed: false, eliminated: [] });
  });

  it.each([false, true])('offers no help in a Capstone attempt when help option is %s', async (help) => {
    const session = await PracticeSession.startExam(services, {
      kind: 'practice', topicId: 'capstone-exam-1', groupIndex: null, plan: examPlan, limitMs: 60_000, help,
    }, onSubmitted);

    await session.reveal(0);
    await session.eliminate(1);
    expect(session.helpMode).toBe('off');
    expect(session.questions[0].revealed).toBe(false);
    expect(session.questions[1].eliminated).toEqual([]);
  });
});
