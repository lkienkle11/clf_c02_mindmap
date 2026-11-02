import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { AttemptQuestionRow, AttemptRow } from '@/persistence';
import { createI18n } from '@/i18n/i18n.svelte';
import { makeReviewEnv } from '@/testing/review-env';
import App from './App.svelte';

type Env = Awaited<ReturnType<typeof makeReviewEnv>>;

async function mount(over: Parameters<typeof makeReviewEnv>[0] = {}) {
  const env = await makeReviewEnv(over);
  await env.appState.load();
  render(App, { services: env.services, appState: env.appState, i18n: createI18n('en') });
  return env;
}

const dailyDialog = () => screen.findByRole('dialog', { name: 'Time to review' });

describe('App daily review wiring', () => {
  it('shows no modal and no button when nothing is due', async () => {
    await mount({ due: {}, completedOnly: ['compute'] });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Review \(/ })).not.toBeInTheDocument();
  });

  it('shows no modal when the due topic is not completed', async () => {
    await mount({ due: { compute: 4 }, notCompleted: ['compute'] });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Review \(/ })).not.toBeInTheDocument();
  });

  it('shows the daily modal over the tree only when the prompt is due, saving the date at once', async () => {
    const env = await mount();
    const dlg = await dailyDialog();
    expect(within(dlg).getByText('2 topics · 23 cards due')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Mindmap' })).toBeInTheDocument();
    expect(env.store.get('review_prompt_last_shown_date')).toBeTruthy();
  });

  it('does not show it again on a second launch the same day', async () => {
    const first = await mount();
    await dailyDialog();
    const again = await makeReviewEnv();
    again.store.set('review_prompt_last_shown_date', first.store.get('review_prompt_last_shown_date')!);
    await again.appState.load();
    expect(again.appState.dailyPromptVisible).toBe(false);
  });

  it('Later closes the modal and keeps the Review button', async () => {
    const env = await mount();
    await userEvent.click(within(await dailyDialog()).getByRole('button', { name: 'Later' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review (23)' })).toBeInTheDocument();
    expect(env.appState.route).toEqual({ view: 'tree' });
  });

  it('Don\'t ask today closes the modal and hides the button for the day', async () => {
    const env = await mount();
    await userEvent.click(within(await dailyDialog()).getByRole('button', { name: "Don't ask today" }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /^Review \(/ })).not.toBeInTheDocument();
    expect(env.store.get('review_button_hidden_date')).toBeTruthy();
  });

  it('Don\'t ask today still closes the modal when saving fails, and says so', async () => {
    await mount({ failSettingKey: 'review_button_hidden_date' });
    await userEvent.click(within(await dailyDialog()).getByRole('button', { name: "Don't ask today" }));
    expect(await screen.findByText('Could not save your choice. The Review button stays for today.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review (23)' })).toBeInTheDocument();
  });

  it('Start now creates a run, closes the prompt and opens the review screen', async () => {
    const env = await mount();
    await userEvent.click(within(await dailyDialog()).getByRole('button', { name: 'Start now' }));
    await waitFor(() => expect(env.appState.route).toEqual({ view: 'review' }));
    expect(env.appState.reviewRun).not.toBeNull();
    expect(env.appState.dailyPromptVisible).toBe(false);
    expect(await screen.findByText('Batch 1 of 2')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('a start that fails shows a friendly message and stays on the tree', async () => {
    const env = await mount({ failCreate: true });
    await userEvent.click(within(await dailyDialog()).getByRole('button', { name: 'Start now' }));
    expect(await screen.findByText('Could not start the review. Please try again.')).toBeInTheDocument();
    expect(screen.queryByText(/disk full/)).not.toBeInTheDocument();
    expect(env.appState.route).toEqual({ view: 'tree' });
  });

  it('an empty plan shows a notice and stays on the tree', async () => {
    const env = await mount();
    env.appState.stats = [];
    await userEvent.click(within(await dailyDialog()).getByRole('button', { name: 'Start now' }));
    expect(await screen.findByText('Nothing to review right now')).toBeInTheDocument();
    expect(env.appState.route).toEqual({ view: 'tree' });
  });

  it('the Review button starts a review without any daily modal (manual variant)', async () => {
    const env = await mount();
    await userEvent.click(within(await dailyDialog()).getByRole('button', { name: 'Later' }));
    await userEvent.click(screen.getByRole('button', { name: 'Review (23)' }));
    const manual = await screen.findByRole('dialog', { name: 'Review now' });
    expect(within(manual).queryByRole('button', { name: "Don't ask today" })).not.toBeInTheDocument();
    await userEvent.click(within(manual).getByRole('button', { name: 'Start now' }));
    await waitFor(() => expect(env.appState.route).toEqual({ view: 'review' }));
  });
});

describe('App resume of a review attempt', () => {
  const attempt: AttemptRow = {
    id: 'old-review', kind: 'review', topicId: null, status: 'in_progress', startedAt: 0, submittedAt: null,
    submitReason: null, reviewAllowed: true, clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null },
    heartbeatAt: null, scorePct: null, passed: null,
  };
  const rows = (ids: string[]): AttemptQuestionRow[] =>
    ids.map((questionId, position) => ({ attemptId: 'old-review', position, questionId, optionOrder: ['A', 'B'], selected: [], isCorrect: null }));

  async function mountResume(): Promise<Env> {
    const env = await makeReviewEnv({ due: { compute: 3 }, inProgress: { attempt, questions: rows(['compute-0', 'compute-1']) } });
    await env.appState.load();
    render(App, { services: env.services, appState: env.appState, i18n: createI18n('en') });
    return env;
  }

  it('offers only the resume prompt (never the daily modal on top of it)', async () => {
    await mountResume();
    expect(await screen.findByRole('dialog', { name: 'Unfinished attempt' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Time to review' })).not.toBeInTheDocument();
  });

  it('Continue opens the review screen with a one-batch run, not the practice screen', async () => {
    const env = await mountResume();
    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(env.appState.route).toEqual({ view: 'review' }));
    expect(env.appState.reviewRun?.session.attemptId).toBe('old-review');
    expect(env.appState.reviewRun?.batchCount).toBe(1);
    expect(await screen.findByText('Batch 1 of 1')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
