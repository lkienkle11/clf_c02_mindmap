// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadCatalog } from '@/content/load-catalog';
import { makeRawCatalog, makeQuestion } from '@/testing/fixtures';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import type { AttemptRow, QuestionStat } from '@/persistence';
import { buildReviewPlan, localDateString } from '@/features/review';
import { makeRng } from '@/random/seeded-random';
import { notifyReportSubmitted } from '@/features/report';
import { buildServices } from './composition';
import type { Services } from './composition';
import { AppState, SETTING_BUTTON_HIDDEN_DATE, SETTING_PROMPT_DATE } from './app-state.svelte';

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
  clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null, onHidden: 'freeze', onReport: 'freeze' },
  heartbeatAt: null, scorePct: 90, passed: true, groupIndex: null, plannedCount: null, ...over,
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

  /** load() rebuilds stats from history, so the attempt itself must be old enough for its questions to be due. */
  async function passTopic1Long() {
    await services.repos.attempts.create(
      attempt({ startedAt: NOW - 10 * DAY, submittedAt: NOW - 10 * DAY + 1000 }), [question('a1', 'q-cloud', true)]);
  }

  it('refresh after passed practice and due stat advances the tree', async () => {
    await state.load();
    await passTopic1();
    await state.refresh();
    expect(state.dailyPromptVisible).toBe(false); // refresh never shows the prompt
    expect(state.statuses.get('cloud-concepts')).toBe('done');
    expect(state.statuses.get('global-infrastructure')).toBe('current');
    expect(state.completed.has('cloud-concepts')).toBe(true);
    expect(state.summaries.length).toBeGreaterThan(0);
    expect(state.submittedAttempts).toHaveLength(1);
  });

  it('refresh fills passedGroups from a submitted passed checkpoint only', async () => {
    await state.load();
    expect(state.passedGroups.size).toBe(0);
    await services.repos.attempts.create(
      attempt({ id: 'cp1', kind: 'checkpoint', topicId: null, groupIndex: 1, plannedCount: 30 }), []);
    await services.repos.attempts.create(
      attempt({ id: 'cp2', kind: 'checkpoint', topicId: null, groupIndex: 2, plannedCount: 30, passed: false, scorePct: 40 }), []);
    await state.refresh();
    expect([...state.passedGroups]).toEqual([1]);
    expect(state.completed.size).toBe(0);
  });

  it('hides the prompt when it was already shown today', async () => {
    await passTopic1Long();
    await services.repos.settings.set('review_prompt_last_shown_date', localDateString(NOW));
    await state.load();
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

  it('refresh() loads the number of new reports, and refreshReportCount() updates just that', async () => {
    const report = (id: string, status: 'new' | 'handled') => ({
      id, type: 'system' as const, status, createdAt: 1, statusUpdatedAt: 1, body: 'b', appVersion: '1', locale: 'en' as const,
      sourceScreen: null, questionId: null, lessonId: null, attemptId: null, position: null, optionOrder: null, selected: null, isCorrect: null,
    });
    expect(state.newReportCount).toBe(0);
    await services.repos.reports.create(report('n1', 'new'), []);
    await services.repos.reports.create(report('n2', 'new'), []);
    await services.repos.reports.create(report('h1', 'handled'), []);
    await state.refresh();
    expect(state.newReportCount).toBe(2);
    await services.repos.reports.setStatus('n1', 'handled', 5);
    await state.refreshReportCount();
    expect(state.newReportCount).toBe(1);
  });

  it('updates the new-report count by itself when a report is submitted', async () => {
    expect(state.newReportCount).toBe(0);
    await services.repos.reports.create({
      id: 'n1', type: 'system', status: 'new', createdAt: 1, statusUpdatedAt: 1, body: 'b', appVersion: '1', locale: 'en',
      sourceScreen: null, questionId: null, lessonId: null, attemptId: null, position: null, optionOrder: null, selected: null, isCorrect: null,
    }, []);
    notifyReportSubmitted();
    await vi.waitFor(() => expect(state.newReportCount).toBe(1));
  });

  it('a failing report count never breaks refresh and keeps the last known count', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    services.repos.reports.counts = async () => {
      throw new Error('db locked');
    };
    await expect(state.refresh()).resolves.toBeUndefined();
    expect(state.newReportCount).toBe(0);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('open() sets a typed route and derives view', () => {
    expect(state.route).toEqual({ view: 'tree' });
    state.open({ view: 'history' });
    expect(state.view).toBe('history');
    state.open({ view: 'reports' });
    expect(state.view).toBe('reports');
    state.open({ view: 'lesson', topicId: 'compute', lessonId: 'compute-ec2' });
    expect(state.view).toBe('lesson');
    expect(state.route).toEqual({ view: 'lesson', topicId: 'compute', lessonId: 'compute-ec2' });
    // @ts-expect-error a lesson route requires topicId and lessonId
    state.open({ view: 'lesson' });
  });

  it('overlapping refreshes: only the most recent call applies its result', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const real = services.repos.attempts.listSubmitted.bind(services.repos.attempts);
    let calls = 0;
    // First call reads an empty DB but is held back; the second sees the passed attempt.
    services.repos.attempts.listSubmitted = async () => {
      calls += 1;
      if (calls === 1) {
        const stale = await real();
        await gate;
        return stale;
      }
      return real();
    };
    const first = state.refresh();
    await Promise.resolve();
    await services.repos.attempts.create(attempt({}), [question('a1', 'q-cloud', true)]);
    const second = state.refresh();
    await second;
    expect(state.statuses.get('cloud-concepts')).toBe('done');
    release();
    await first;
    expect(calls).toBe(2);
    expect(state.statuses.get('cloud-concepts')).toBe('done');
    expect(state.submittedAttempts).toHaveLength(1);
  });

  describe('daily prompt and review button', () => {
    let today = NOW;
    beforeEach(() => {
      today = NOW;
      services.now = () => today;
    });

    it('load() with due summaries shows the prompt once and persists today', async () => {
      await passTopic1Long();
      await state.load();
      expect(state.dailyPromptVisible).toBe(true);
      expect(await services.repos.settings.get(SETTING_PROMPT_DATE)).toBe(localDateString(NOW));
      await state.load();
      expect(state.dailyPromptVisible).toBe(true); // load never flips it back
      const fresh = new AppState(services);
      await fresh.load();
      expect(fresh.dailyPromptVisible).toBe(false);
    });

    it('refresh() never flips the prompt either way; dismissDailyPrompt closes it', async () => {
      await passTopic1Long();
      await state.load();
      await state.refresh();
      expect(state.dailyPromptVisible).toBe(true);
      state.dismissDailyPrompt();
      expect(state.dailyPromptVisible).toBe(false);
      await state.refresh();
      expect(state.dailyPromptVisible).toBe(false);
    });

    it('next day shows the prompt again', async () => {
      await passTopic1Long();
      await state.load();
      today = NOW + 2 * DAY;
      const fresh = new AppState(services);
      await fresh.load();
      expect(fresh.dailyPromptVisible).toBe(true);
    });

    describe('settings failures', () => {
      afterEach(() => vi.restoreAllMocks());

      it('failing settings.set: load resolves, locale returned, no prompt', async () => {
        await passTopic1Long();
        await services.repos.settings.set('locale', 'en');
        const err = vi.spyOn(console, 'error').mockImplementation(() => {});
        const real = services.repos.settings.set.bind(services.repos.settings);
        services.repos.settings.set = async (k, v) => {
          if (k === SETTING_PROMPT_DATE) throw new Error('disk full');
          return real(k, v);
        };
        expect(await state.load()).toBe('en');
        expect(state.dailyPromptVisible).toBe(false);
        expect(err).toHaveBeenCalled();
      });

      it('failing settings.get of the prompt key: no prompt, load resolves', async () => {
        await passTopic1Long();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const real = services.repos.settings.get.bind(services.repos.settings);
        services.repos.settings.get = async (k) => {
          if (k === SETTING_PROMPT_DATE) throw new Error('read fail');
          return real(k);
        };
        await state.load();
        expect(state.dailyPromptVisible).toBe(false);
      });

      it('failing settings.get of the button key: refresh resolves, button stays visible', async () => {
        await passTopic1Long();
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const real = services.repos.settings.get.bind(services.repos.settings);
        services.repos.settings.get = async (k) => {
          if (k === SETTING_BUTTON_HIDDEN_DATE) throw new Error('read fail');
          return real(k);
        };
        await state.load();
        expect(state.reviewButtonHidden).toBe(false);
        expect(state.reviewButtonVisible).toBe(true);
      });

      it('persists the date BEFORE showing the prompt', async () => {
        await passTopic1Long();
        const real = services.repos.settings.set.bind(services.repos.settings);
        const seen: boolean[] = [];
        services.repos.settings.set = async (k, v) => {
          if (k === SETTING_PROMPT_DATE) seen.push(state.dailyPromptVisible);
          return real(k, v);
        };
        await state.load();
        expect(seen).toEqual([false]);
        expect(state.dailyPromptVisible).toBe(true);
      });

      it('hideReviewButtonToday still rejects when the write fails and does not hide', async () => {
        await passTopic1Long();
        await state.load();
        services.repos.settings.set = async () => { throw new Error('disk full'); };
        await expect(state.hideReviewButtonToday()).rejects.toThrow('disk full');
        expect(state.reviewButtonHidden).toBe(false);
      });
    });

    it('no summaries: never shows the prompt and writes nothing', async () => {
      await state.load();
      expect(state.dailyPromptVisible).toBe(false);
      expect(await services.repos.settings.get(SETTING_PROMPT_DATE)).toBeNull();
      expect(state.reviewButtonVisible).toBe(true); // always present (spec 5.1); disabled when nothing is due
    });

    it('hideReviewButtonToday hides the button until the next day', async () => {
      await passTopic1Long();
      await state.load();
      expect(state.reviewButtonVisible).toBe(true);
      await state.hideReviewButtonToday();
      expect(await services.repos.settings.get(SETTING_BUTTON_HIDDEN_DATE)).toBe(localDateString(NOW));
      expect(state.reviewButtonHidden).toBe(true);
      expect(state.reviewButtonVisible).toBe(false);
      await state.refresh();
      expect(state.reviewButtonVisible).toBe(false);
      today = NOW + DAY;
      await state.refresh();
      expect(state.reviewButtonHidden).toBe(false);
      expect(state.reviewButtonVisible).toBe(true);
    });

    it('planReview matches buildReviewPlan over the loaded stats', async () => {
      await passTopic1Long();
      await state.load();
      expect(state.stats).toHaveLength(1);
      const plan = state.planReview({ kind: 'full' });
      const expected = buildReviewPlan({
        stats: state.stats, completed: state.completed, mode: { kind: 'full' }, now: NOW,
        rng: makeRng(NOW % 0x100000000),
      });
      expect(plan).toEqual(expected);
      expect(plan.total).toBeGreaterThan(0);
    });
  });
});

describe('AppState review run slot', () => {
  it('starts empty and holds a run for the review route', () => {
    const fresh = new AppState(services);
    expect(fresh.reviewRun).toBeNull();
    const run = {} as unknown as NonNullable<AppState['reviewRun']>;
    fresh.reviewRun = run;
    expect(fresh.reviewRun).toBe(run);
    fresh.reviewRun = null;
    expect(fresh.reviewRun).toBeNull();
  });
});
