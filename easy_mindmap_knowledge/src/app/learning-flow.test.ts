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
    clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null, onHidden: 'freeze' },
    heartbeatAt: null, scorePct: 90, passed: true, groupIndex, plannedCount: 30,
  }, []);
  await appState.refresh();
}

async function passWithSession(services: Services, appState: AppState, topicId: string): Promise<void> {
  const s = await PracticeSession.start(services, topicId, { allowReview: false, limitMs: null, clockMode: 'freeze', onHidden: 'freeze', questionCount: 10 }, () => appState.refresh());
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
        expect(appState.statuses.get(next)).toBe('locked');
        await passCheckpoint(services, appState, position / 3);
        expect(appState.statuses.get(next)).toBe('current');
      }
    }

    // Capstone: no own questions and no lessons, yet practisable with the pooled bank (32 -> 10 asked).
    await waitFor(() => expect(appState.statuses.get('capstone')).toBe('current'));
    expect(practiceLeaf()).not.toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByText('No questions yet')).not.toBeInTheDocument();
    await user.click(practiceLeaf());
    expect(await screen.findByText('10 questions')).toBeInTheDocument();
    const start = screen.getByRole('button', { name: 'Start' });
    await waitFor(() => expect(start).toBeEnabled());
    await user.click(start);
    expect(await screen.findByText('1/10')).toBeInTheDocument();
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
