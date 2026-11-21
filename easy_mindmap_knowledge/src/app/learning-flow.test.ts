// Whole-flow integration: the real App, AppState, PracticeSession and SQL repositories on an in-memory
// node:sqlite database (it runs fine under jsdom). Only the catalog is a small fixture.
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { loadCatalog } from '@/content/load-catalog';
import type { Lesson, Question } from '@/content/types';
import { createI18n } from '@/i18n/i18n.svelte';
import { makeLesson, makeRawCatalog, TOPIC_IDS } from '@/testing/fixtures';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import { DOMAIN_OF_TOPIC, startCapstoneExam, startCheckpoint } from '@/features/exam';
import { PracticeSession } from '@/features/practice';
import { AppState } from './app-state.svelte';
import { buildServices } from './composition';
import type { Services } from './composition';
import App from './App.svelte';

const DAY = 86_400_000;
const T0 = Date.UTC(2026, 10, 2, 9, 0, 0);
const RIGHT = 'Right answer';

/** topic 1 (cloud-concepts): 1 required + 1 optional lesson, 10 questions; topics 2..12: 2 questions, NO lessons; capstone: none. */
function flowCatalog() {
  const raw = makeRawCatalog();
  const lessons: Lesson[] = [
    makeLesson({ id: 'cc-intro', topicId: 'cloud-concepts', order: 1, required: true, title: { en: 'Cloud intro', vi: 'Giới thiệu' } }),
    makeLesson({ id: 'cc-video', topicId: 'cloud-concepts', order: 2, required: false, title: { en: 'Cloud video', vi: 'Video' } }),
  ];
  raw.lessons = lessons;
  raw.topics = raw.topics.map((t) => ({ ...t, lessonIds: t.id === 'cloud-concepts' ? ['cc-intro', 'cc-video'] : [] }));
  const question = (topicId: string, i: number): Question => ({
    id: `${topicId}-q${i}`, topicId, text: `${topicId} question ${i}?`,
    options: [{ key: 'A', text: RIGHT }, { key: 'B', text: 'Wrong answer' }],
    correct: ['A'], multi: false, orderDependent: false, source: 'authored',
  });
  raw.questions = TOPIC_IDS.filter((id) => id !== 'capstone').flatMap((topicId) =>
    Array.from({ length: topicId === 'cloud-concepts' ? 10 : 2 }, (_, i) => question(topicId, i)));
  return loadCatalog(raw);
}

async function makeEnv(at: number = T0, executor?: Awaited<ReturnType<typeof createNodeSqliteExecutor>>) {
  const clock = { now: at };
  let n = 0;
  const services = buildServices({
    executor: executor ?? (await createNodeSqliteExecutor()),
    catalog: flowCatalog(),
    now: () => clock.now,
    newId: () => `att-${at}-${++n}`,
  });
  const appState = new AppState(services);
  await appState.load();
  return { services, appState, clock };
}

const practiceLeaf = () => screen.getByRole('button', { name: /^Practice/ });

/** Clicks the expanded topic's Practice leaf, answers every question correctly and submits. */
async function passCurrentTopicViaUi(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(practiceLeaf());
  const start = await screen.findByRole('button', { name: 'Start' });
  await waitFor(() => expect(start).toBeEnabled());
  await user.click(start);
  await screen.findByRole('button', { name: 'Exit' });
  for (;;) {
    await user.click(screen.getByLabelText(RIGHT));
    const next = screen.getByRole('button', { name: 'Next question' });
    if (next.hasAttribute('disabled')) break;
    await user.click(next);
  }
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('100%')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Back to the map' }));
  await screen.findByRole('heading', { name: 'Mindmap' });
}

async function passCheckpoint(services: Services, appState: AppState, groupIndex: number): Promise<void> {
  await services.repos.attempts.create({
    id: `cp-${groupIndex}`, kind: 'checkpoint', topicId: null, status: 'submitted', startedAt: T0, submittedAt: T0 + 1,
    submitReason: 'manual', reviewAllowed: true,
    clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null, onHidden: 'freeze', onReport: 'freeze' },
    heartbeatAt: null, scorePct: 90, passed: true, groupIndex, plannedCount: 30, unansweredDisplay: 'reveal', helpMode: 'off',
  }, []);
  await appState.refresh();
}

async function passWithSession(services: Services, appState: AppState, topicId: string): Promise<void> {
  const s = await PracticeSession.start(services, topicId, { allowReview: false, limitMs: null, clockMode: 'freeze', onHidden: 'freeze', onReport: 'freeze', unansweredDisplay: 'reveal' as const, questionCount: 10 }, () => appState.refresh());
  const byId = new Map(services.catalog.questions.map((q) => [q.id, q]));
  for (const q of s.questions) await s.select(q.position, byId.get(q.questionId)!.correct);
  const result = await s.submit('manual');
  expect(result.passed).toBe(true);
}

describe('learning flow (ruling R17: topics without lessons can be practised)', () => {
  it('lessons -> practice -> a lesson-less topic -> ... -> capstone with the pooled questions', async () => {
    const { services, appState } = await makeEnv();
    const user = userEvent.setup();
    render(App, { services, appState, i18n: createI18n('en') });

    // Topic 1: practice is locked until its required lesson is read; the optional one is not needed.
    expect(appState.statuses.get('cloud-concepts')).toBe('current');
    expect(practiceLeaf()).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Read all required lessons first')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Cloud intro/ }));
    await user.click(await screen.findByRole('button', { name: 'Complete lesson' }));
    await waitFor(() => expect(appState.readIds.has('cc-intro')).toBe(true));
    await user.click(screen.getByRole('button', { name: /Back to the mindmap/ }));
    await waitFor(() => expect(practiceLeaf()).not.toHaveAttribute('aria-disabled', 'true'));

    await passCurrentTopicViaUi(user);
    expect(appState.statuses.get('cloud-concepts')).toBe('done');

    // Topic 2 has questions but no lessons: it is current, practisable and says lessons come later.
    expect(appState.statuses.get('global-infrastructure')).toBe('current');
    expect(screen.getByText('Lessons for this topic are coming in a later update')).toBeInTheDocument();
    expect(practiceLeaf()).not.toHaveAttribute('aria-disabled', 'true');
    await passCurrentTopicViaUi(user);
    expect(appState.statuses.get('global-infrastructure')).toBe('done');

    // Topics 3..12 the same way (service level; the UI path is proven above).
    // After each group's last topic the next group stays locked until that group's checkpoint is passed.
    for (const [i, topicId] of TOPIC_IDS.slice(2, 12).entries()) {
      const position = i + 3;
      expect(appState.statuses.get(topicId)).toBe('current');
      await passWithSession(services, appState, topicId);
      if (position % 3 === 0) {
        const next = TOPIC_IDS[position];
        // The summary has no checkpoint gate; this fixture omits the exam topics.
        if (next !== 'capstone') {
          expect(appState.statuses.get(next)).toBe('locked');
          await passCheckpoint(services, appState, position / 3);
        }
        expect(appState.statuses.get(next)).toBe('current');
      }
    }

    // Starting a Capstone exam is covered by the end-to-end flow test, which uses the real exam topics.
  }, 30_000);

  it('the last lesson of a topic offers Practice: locked until every required lesson is read, then it opens the topic practice', async () => {
    const { services, appState } = await makeEnv();
    const user = userEvent.setup();
    render(App, { services, appState, i18n: createI18n('en') });
    appState.open({ view: 'lesson', topicId: 'cloud-concepts', lessonId: 'cc-video' });
    const practice = await screen.findByRole('button', { name: 'Practice' });
    expect(practice).toBeDisabled();
    expect(screen.getByText('Read all required lessons first')).toBeInTheDocument();
    await services.repos.lessonProgress.markRead('cc-intro', T0);
    await appState.refresh();
    await waitFor(() => expect(practice).toBeEnabled());
    await user.click(practice);
    expect(appState.route).toEqual({ view: 'practice', topicId: 'cloud-concepts' });
  });

  it('a passed practice whose questions fall due yields a review summary and the daily modal on the next load()', async () => {
    const first = await makeEnv(T0);
    await first.services.repos.lessonProgress.markRead('cc-intro', T0);
    await first.appState.refresh();
    await passWithSession(first.services, first.appState, 'cloud-concepts');
    expect(first.appState.summaries).toEqual([]); // all correct: box 1, due in 3 days

    // Throw the stats cache away: load() must rebuild it from the old submitted attempt (reconcile).
    await first.services.executor.execute('DELETE FROM question_stats');

    // Four days later, a fresh start on the same database.
    const later = await makeEnv(T0 + 4 * DAY, first.services.executor);
    expect(later.appState.stats).toHaveLength(10);
    expect(later.appState.summaries).toEqual([
      expect.objectContaining({ topicId: 'cloud-concepts', dueCount: 10 }),
    ]);
    expect(later.appState.dailyPromptVisible).toBe(true);
    render(App, { services: later.services, appState: later.appState, i18n: createI18n('en') });
    expect(await screen.findByRole('dialog', { name: 'Time to review' })).toBeInTheDocument();
  });
});

/** Clicks the expanded topic's Practice leaf, answers every question correctly and submits; stops on the result. */
async function submitAllRightUi(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(practiceLeaf());
  const start = await screen.findByRole('button', { name: 'Start' });
  await waitFor(() => expect(start).toBeEnabled());
  await user.click(start);
  await screen.findByRole('button', { name: 'Exit' });
  for (;;) {
    await user.click(screen.getByLabelText(RIGHT));
    const next = screen.getByRole('button', { name: 'Next question' });
    if (next.hasAttribute('disabled')) break;
    await user.click(next);
  }
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('100%')).toBeInTheDocument();
}

describe('checkpoint hints on the result screen', () => {
  it('a topic that closes a group says to take the checkpoint; the topics before it say the next topic unlocked', async () => {
    const { services, appState } = await makeEnv();
    const user = userEvent.setup();
    render(App, { services, appState, i18n: createI18n('en') });

    await user.click(screen.getByRole('button', { name: /^Cloud intro/ }));
    await user.click(await screen.findByRole('button', { name: 'Complete lesson' }));
    await waitFor(() => expect(appState.readIds.has('cc-intro')).toBe(true));
    await user.click(screen.getByRole('button', { name: /Back to the mindmap/ }));
    await waitFor(() => expect(practiceLeaf()).not.toHaveAttribute('aria-disabled', 'true'));

    // Topic 1 and topic 2 are not the last of group 1: the normal unlock line.
    await submitAllRightUi(user);
    expect(screen.getByText('Next topic unlocked')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to the map' }));
    await screen.findByRole('heading', { name: 'Mindmap' });

    await submitAllRightUi(user);
    expect(screen.getByText('Next topic unlocked')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to the map' }));
    await screen.findByRole('heading', { name: 'Mindmap' });

    // Topic 3 (compute) is the last topic of group 1: the checkpoint hint, no unlock line.
    await submitAllRightUi(user);
    expect(screen.getByText('Complete checkpoint 1 to unlock the next topics')).toBeInTheDocument();
    expect(screen.queryByText('Next topic unlocked')).not.toBeInTheDocument();
  }, 30_000);
});

describe('checkpoint flow (a real checkpoint attempt through PracticeSession)', () => {
  /** Topics 1-3 completed by real practice attempts; topic 4 is locked behind checkpoint 1. */
  async function groupOneDone() {
    const env = await makeEnv();
    for (const topicId of TOPIC_IDS.slice(0, 3)) await passWithSession(env.services, env.appState, topicId);
    expect(env.appState.passedGroups.size).toBe(0);
    expect(env.appState.statuses.get(TOPIC_IDS[2])).toBe('done');
    expect(env.appState.statuses.get(TOPIC_IDS[3])).toBe('locked');
    return env;
  }

  async function sitCheckpoint(env: Awaited<ReturnType<typeof makeEnv>>, answerRight: boolean) {
    const session = await startCheckpoint(env.services, 1, { extraTime: false }, () => env.appState.refresh());
    const byId = new Map(env.services.catalog.questions.map((q) => [q.id, q]));
    for (const q of session.questions) await session.select(q.position, answerRight ? byId.get(q.questionId)!.correct : ['B']);
    return session.submit('manual');
  }

  it('passing checkpoint 1 records the group and opens topic 4', async () => {
    const env = await groupOneDone();
    const result = await sitCheckpoint(env, true);
    expect(result.passed).toBe(true);
    await env.appState.refresh();
    expect(env.appState.passedGroups.has(1)).toBe(true);
    expect(env.appState.statuses.get(TOPIC_IDS[3])).toBe('current');
  });

  it('failing checkpoint 1 leaves topic 4 locked', async () => {
    const env = await groupOneDone();
    const result = await sitCheckpoint(env, false);
    expect(result.passed).toBe(false);
    await env.appState.refresh();
    expect(env.appState.passedGroups.has(1)).toBe(false);
    expect(env.appState.statuses.get(TOPIC_IDS[3])).toBe('locked');
  });
});

describe('Capstone learning flow with stored attempts and real exams', () => {
  function capstoneCatalog() {
    const raw = makeRawCatalog();
    raw.lessons = ['cap-l1', 'cap-l2'].map((id, i) =>
      makeLesson({ id, topicId: 'capstone', order: i + 1, required: true }));
    raw.topics = raw.topics.map((topic) => topic.id === 'capstone'
      ? { ...topic, order: 15, lessonIds: ['cap-l1', 'cap-l2'] }
      : { ...topic, lessonIds: [] });
    raw.topics.push(...(['capstone-exam-1', 'capstone-exam-2'] as const).map((id, i) => ({
      id, order: 13 + i, tier: 'exam' as const, lessonIds: [], title: { en: id, vi: id },
    })));
    raw.topics.sort((a, b) => a.order - b.order);
    raw.questions = Object.keys(DOMAIN_OF_TOPIC).flatMap((topicId) =>
      Array.from({ length: 8 }, (_, i): Question => ({
        id: `${topicId}-q${i}`, topicId, text: `${topicId} question ${i}?`,
        options: [{ key: 'A', text: RIGHT }, { key: 'B', text: 'Wrong answer' }],
        correct: ['A'], multi: false, orderDependent: false, source: 'authored',
      })));
    return loadCatalog(raw);
  }

  async function makeCapstoneEnv(executor?: Services['executor']) {
    let n = 0;
    const services = buildServices({
      executor: executor ?? await createNodeSqliteExecutor(), catalog: capstoneCatalog(),
      now: () => T0, newId: () => `cap-att-${++n}`,
    });
    const appState = new AppState(services);
    await appState.load();
    return { services, appState };
  }

  async function finishGroups(env: Awaited<ReturnType<typeof makeCapstoneEnv>>, checkpointFour = true) {
    for (const [i, topicId] of TOPIC_IDS.slice(0, 12).entries()) {
      await passWithSession(env.services, env.appState, topicId);
      if ((i + 1) % 3 === 0 && (i < 11 || checkpointFour)) {
        await passCheckpoint(env.services, env.appState, (i + 1) / 3);
      }
    }
  }

  async function storePass(env: Awaited<ReturnType<typeof makeCapstoneEnv>>, topicId: string) {
    await env.services.repos.attempts.create({
      id: `stored-${topicId}`, kind: 'practice', topicId, status: 'submitted',
      startedAt: T0, submittedAt: T0 + 1, submitReason: 'manual', reviewAllowed: false,
      clock: { mode: 'run', limitMs: 5_400_000, remainingMs: null, deadlineAt: T0 + 5_400_000, onHidden: 'run', onReport: 'run' },
      heartbeatAt: null, scorePct: 70, passed: true, groupIndex: null,
      plannedCount: 65, unansweredDisplay: 'reveal', helpMode: 'off',
    }, []);
    await env.appState.refresh();
  }

  async function submitExam(env: Awaited<ReturnType<typeof makeCapstoneEnv>>, topicId: 'capstone-exam-1' | 'capstone-exam-2', correctCount: number) {
    const session = await startCapstoneExam(env.services, topicId, { extraTime: false }, () => env.appState.refresh());
    const rows = await env.services.repos.attempts.questionsOf(session.attemptId);
    expect(rows).toHaveLength(65);
    expect(rows.filter((q) => q.unscored)).toHaveLength(15);
    const unscored = new Set(rows.filter((q) => q.unscored).map((q) => q.questionId));
    let scored = 0;
    for (const q of session.questions) {
      const right = !unscored.has(q.questionId) && scored++ < correctCount;
      await session.select(q.position, right ? ['A'] : ['B']);
    }
    return session.submit('manual');
  }

  it('unlocks exam 1, exam 2, then the lesson-only summary from stored passes', async () => {
    const env = await makeCapstoneEnv();
    await finishGroups(env);
    expect(env.appState.statuses.get('capstone-exam-1')).toBe('current');
    expect(env.appState.statuses.get('capstone-exam-2')).toBe('locked');
    expect(env.appState.statuses.get('capstone')).toBe('locked');
    await storePass(env, 'capstone-exam-1');
    expect(env.appState.statuses.get('capstone-exam-1')).toBe('done');
    expect(env.appState.statuses.get('capstone-exam-2')).toBe('current');
    expect(env.appState.statuses.get('capstone')).toBe('locked');
    await storePass(env, 'capstone-exam-2');
    expect(env.appState.statuses.get('capstone-exam-2')).toBe('done');
    expect(env.appState.statuses.get('capstone')).toBe('current');
    await env.services.repos.lessonProgress.markRead('cap-l1', T0);
    await env.appState.refresh();
    expect(env.appState.statuses.get('capstone')).toBe('current');
    await env.services.repos.lessonProgress.markRead('cap-l2', T0);
    await env.appState.refresh();
    expect(env.appState.statuses.get('capstone')).toBe('done');
  });

  it('keeps exam 1 locked until checkpoint 4 passes even with topics 10 to 12 done', async () => {
    const env = await makeCapstoneEnv();
    await finishGroups(env, false);
    for (const id of TOPIC_IDS.slice(9, 12)) expect(env.appState.statuses.get(id)).toBe('done');
    expect(env.appState.statuses.get('capstone-exam-1')).toBe('locked');
    await passCheckpoint(env.services, env.appState, 4);
    expect(env.appState.statuses.get('capstone-exam-1')).toBe('current');
  });

  it('ignores a legacy capstone pass before and after each exam gate', async () => {
    const env = await makeCapstoneEnv();
    await finishGroups(env, false);
    const before = new Map(env.appState.statuses);
    await storePass(env, 'capstone');
    expect(env.appState.statuses).toEqual(before);
    expect(env.appState.statuses.get('capstone-exam-1')).toBe('locked');
    expect(env.appState.statuses.get('capstone')).toBe('locked');
    await passCheckpoint(env.services, env.appState, 4);
    expect(env.appState.statuses.get('capstone-exam-1')).toBe('current');
    expect(env.appState.statuses.get('capstone-exam-2')).toBe('locked');
    expect(env.appState.statuses.get('capstone')).toBe('locked');
    await storePass(env, 'capstone-exam-1');
    expect(env.appState.statuses.get('capstone-exam-2')).toBe('current');
    expect(env.appState.statuses.get('capstone')).toBe('locked');
    await storePass(env, 'capstone-exam-2');
    expect(env.appState.statuses.get('capstone')).toBe('current');
    expect(env.appState.completed.has('capstone')).toBe(false);
  });

  it('passes at 35/50, preserves that pass on restart, and fails exam 2 at 34/50', async () => {
    const env = await makeCapstoneEnv();
    await finishGroups(env);
    expect(await submitExam(env, 'capstone-exam-1', 35)).toMatchObject({
      correct: 35, total: 50, scorePct: 70, passed: true,
    });
    await env.appState.refresh();
    expect(env.appState.statuses.get('capstone-exam-1')).toBe('done');
    expect(env.appState.statuses.get('capstone-exam-2')).toBe('current');

    const restarted = await makeCapstoneEnv(env.services.executor);
    expect(restarted.appState.statuses.get('capstone-exam-1')).toBe('done');
    expect(restarted.appState.statuses.get('capstone-exam-2')).toBe('current');
    expect(restarted.appState.submittedAttempts).toContainEqual(expect.objectContaining({
      topicId: 'capstone-exam-1', scorePct: 70, passed: true,
    }));

    expect(await submitExam(env, 'capstone-exam-2', 34)).toMatchObject({
      correct: 34, total: 50, scorePct: 68, passed: false,
    });
    await env.appState.refresh();
    expect(env.appState.statuses.get('capstone-exam-2')).toBe('current');
    expect(env.appState.statuses.get('capstone')).toBe('locked');
  });
});
