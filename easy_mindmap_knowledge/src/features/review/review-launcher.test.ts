import { describe, expect, it } from 'vitest';
import { makeReviewEnv } from '@/testing/review-env';
import { ReviewLauncher } from './review-launcher.svelte';

describe('ReviewLauncher', () => {
  it('start() plans, creates a run, stores it and opens the review route', async () => {
    const env = await makeReviewEnv();
    const launcher = new ReviewLauncher(env.services, env.appState);
    await launcher.start({ kind: 'full' });
    expect(env.appState.route).toEqual({ view: 'review' });
    expect(env.appState.reviewRun?.batchCount).toBe(2);
    expect(env.created).toHaveLength(1);
    expect(launcher.notice).toBeNull();
  });

  it('an empty plan shows a notice and does not navigate or create anything', async () => {
    const env = await makeReviewEnv();
    env.appState.stats = []; // the summaries still say "due", but the plan has nothing
    const launcher = new ReviewLauncher(env.services, env.appState);
    await launcher.start({ kind: 'full' });
    expect(launcher.notice).toBe('empty');
    expect(env.appState.route).toEqual({ view: 'tree' });
    expect(env.appState.reviewRun).toBeNull();
    expect(env.created).toEqual([]);
  });

  it('a failing start maps to a notice, not the raw error, and does not navigate', async () => {
    const env = await makeReviewEnv({ failCreate: true });
    const launcher = new ReviewLauncher(env.services, env.appState);
    await launcher.start({ kind: 'full' });
    expect(launcher.notice).toBe('startFailed');
    expect(env.appState.route).toEqual({ view: 'tree' });
    expect(env.appState.reviewRun).toBeNull();
  });

  it('ignores a second start while one is in flight', async () => {
    const env = await makeReviewEnv();
    const launcher = new ReviewLauncher(env.services, env.appState);
    await Promise.all([launcher.start({ kind: 'full' }), launcher.start({ kind: 'full' })]);
    expect(env.created).toHaveLength(1);
  });

  it('dismissToday() hides the button; a failed save keeps going with a notice', async () => {
    const ok = await makeReviewEnv();
    const l1 = new ReviewLauncher(ok.services, ok.appState);
    await l1.dismissToday();
    expect(ok.appState.reviewButtonHidden).toBe(true);
    expect(l1.notice).toBeNull();
    const bad = await makeReviewEnv({ failSettingKey: 'review_button_hidden_date' });
    const l2 = new ReviewLauncher(bad.services, bad.appState);
    await l2.dismissToday();
    expect(bad.appState.reviewButtonHidden).toBe(false);
    expect(l2.notice).toBe('hideFailed');
  });
});
