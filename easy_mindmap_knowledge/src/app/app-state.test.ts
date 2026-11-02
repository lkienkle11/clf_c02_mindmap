// @vitest-environment node
import { beforeEach, describe, expect, it } from 'vitest';
import { loadCatalog } from '@/content/load-catalog';
import { makeRawCatalog, makeQuestion } from '@/testing/fixtures';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import type { AttemptRow, QuestionStat } from '@/persistence';
import { localDateString } from '@/features/review';
import { buildServices } from './composition';
import type { Services } from './composition';
import { AppState } from './app-state.svelte';

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 5, 15, 12, 0, 0);
let services: Services;
let state: AppState;

beforeEach(async () => {
  const raw = makeRawCatalog();
  raw.questions.push(makeQuestion({ id: 'q-cloud', topicId: 'cloud-concepts' }));
  services = buildServices({
    executor: await createNodeSqliteExecutor(),
    catalog: loadCatalog(raw),
    now: () => NOW,
  });
  state = new AppState(services);
});

const attempt = (over: Partial<AttemptRow>): AttemptRow => ({
  id: 'a1', kind: 'practice', topicId: 'cloud-concepts', status: 'submitted', startedAt: NOW - DAY,
  submittedAt: NOW - DAY + 1000, submitReason: 'manual', reviewAllowed: true,
  clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null },
  heartbeatAt: null, scorePct: 90, passed: true, ...over,
});
const question = (attemptId: string, questionId: string, isCorrect: boolean | null) => ({
  attemptId, position: 0, questionId, optionOrder: ['A', 'B'], selected: ['A'], isCorrect,
});
const dueStat = (over: Partial<QuestionStat> = {}): QuestionStat => ({
  questionId: 'q-cloud', topicId: 'cloud-concepts', box: 1, dueAt: NOW - 2 * DAY, timesSeen: 1,
  timesCorrect: 1, lastSeenAt: NOW - 3 * DAY, lastCorrect: true, ...over,
});

describe('AppState', () => {
  it('empty DB: topic 1 current, rest locked, no prompt, no resume', async () => {
    await state.load();
    expect(state.statuses.get('cloud-concepts')).toBe('current');
    expect(state.statuses.get('global-infrastructure')).toBe('locked');
    expect(state.dailyPromptVisible).toBe(false);
    expect(state.resumeAttempt).toBeNull();
    expect(state.view).toBe('tree');
  });

  async function passTopic1() {
    await services.repos.attempts.create(attempt({}), [question('a1', 'q-cloud', true)]);
    await services.repos.questionStats.upsert(dueStat());
  }

  it('refresh after passed practice and due stat advances the tree and shows the prompt', async () => {
    await state.load();
    await passTopic1();
    await state.refresh();
    expect(state.statuses.get('cloud-concepts')).toBe('done');
    expect(state.statuses.get('global-infrastructure')).toBe('current');
    expect(state.completed.has('cloud-concepts')).toBe(true);
    expect(state.summaries.length).toBeGreaterThan(0);
    expect(state.dailyPromptVisible).toBe(true);
    expect(state.submittedAttempts).toHaveLength(1);
  });

  it('hides the prompt when it was already shown today', async () => {
    await passTopic1();
    await services.repos.settings.set('review_prompt_last_shown_date', localDateString(NOW));
    await state.refresh();
    expect(state.summaries.length).toBeGreaterThan(0);
    expect(state.dailyPromptVisible).toBe(false);
  });

  it('exposes an in-progress attempt as resumeAttempt', async () => {
    await services.repos.attempts.create(
      attempt({ id: 'a2', status: 'in_progress', submittedAt: null, submitReason: null, scorePct: null, passed: null }),
      [question('a2', 'q-cloud', null)],
    );
    await state.load();
    expect(state.resumeAttempt).not.toBeNull();
    expect(state.resumeAttempt?.attempt.id).toBe('a2');
  });

  it('load() reconciles stats from submitted attempts', async () => {
    await services.repos.attempts.create(attempt({}), [question('a1', 'q-cloud', true)]);
    expect(await services.repos.questionStats.get('q-cloud')).toBeNull();
    await state.load();
    expect(await services.repos.questionStats.get('q-cloud')).not.toBeNull();
  });

  it('load() returns the saved locale or null', async () => {
    expect(await state.load()).toBeNull();
    await services.repos.settings.set('locale', 'en');
    expect(await state.load()).toBe('en');
  });

  it('open() changes the view and params', () => {
    state.open('history');
    expect(state.view).toBe('history');
    state.open('lesson', { topicId: 'compute' });
    expect(state.viewParams).toEqual({ topicId: 'compute' });
  });
});
