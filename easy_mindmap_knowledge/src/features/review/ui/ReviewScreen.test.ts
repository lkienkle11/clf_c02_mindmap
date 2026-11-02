import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makeReviewEnv } from '@/testing/review-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { ReviewRun } from '../index';
import type { ReviewPlan } from '../index';
import ReviewScreen from './ReviewScreen.svelte';

type Env = Awaited<ReturnType<typeof makeReviewEnv>>;

async function mount(plan?: ReviewPlan, env?: Env) {
  const e = env ?? (await makeReviewEnv());
  const run = await ReviewRun.start(e.services, plan ?? e.appState.planReview({ kind: 'full' }), () => e.appState.refresh());
  e.appState.reviewRun = run;
  e.appState.open({ view: 'review' });
  renderWithI18n(ReviewScreen, { services: e.services, appState: e.appState });
  return { env: e, run };
}

async function answerAll(run: ReviewRun) {
  for (const q of run.session.questions) await run.session.select(q.position, ['A']);
}

async function submitBatch(run: ReviewRun) {
  await answerAll(run);
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await userEvent.click(within(await screen.findByRole('dialog', { name: 'Submit your answers?' })).getByRole('button', { name: 'Submit' }));
  await screen.findByRole('heading', { name: 'Review result' });
}

describe('ReviewScreen', () => {
  it('shows the first batch with its progress and no timer', async () => {
    await mount();
    expect(await screen.findByRole('heading', { name: 'Review' })).toBeInTheDocument();
    expect(screen.getByText('Batch 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('1/15')).toBeInTheDocument();
    expect(screen.queryByText('Time left')).not.toBeInTheDocument();
  });

  it('walks batches: next batch (N left), then a finished run offers only the way back', async () => {
    const { env, run } = await mount();
    await submitBatch(run);
    expect(screen.getByText('15 of 15 correct')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Review next batch (8 left)' }));
    expect(await screen.findByText('Batch 2 of 2')).toBeInTheDocument();
    expect(screen.getByText('1/8')).toBeInTheDocument();
    await submitBatch(run);
    expect(run.finished).toBe(true);
    expect(screen.queryByRole('button', { name: /Review next batch/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Stop here' })).not.toBeInTheDocument();
    expect(screen.getByText('Questions reviewed so far: 23')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Back to the map' }));
    expect(env.appState.route).toEqual({ view: 'tree' });
    expect(env.appState.reviewRun).toBeNull();
  });

  it('never uses pass/fail or unlock wording and has no retry', async () => {
    const { run } = await mount();
    await submitBatch(run);
    expect(document.body).not.toHaveTextContent(/passed|not yet|unlock|pass mark|try again/i);
    expect(screen.getByText(/^\d+%$/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your answers' })).toBeInTheDocument();
  });

  it('Stop here keeps the finished batch, leaves nothing in progress and opens the tree', async () => {
    const { env, run } = await mount();
    const first = run.session.attemptId;
    await submitBatch(run);
    await userEvent.click(screen.getByRole('button', { name: 'Stop here' }));
    await waitFor(() => expect(env.appState.route).toEqual({ view: 'tree' }));
    expect(env.submittedIds).toEqual([first]);
    expect(env.discarded).toEqual([]);
    expect(env.appState.reviewRun).toBeNull();
    expect(run.stopped).toBe(true);
  });

  it('leaving an unfinished next batch discards only that batch', async () => {
    const { env, run } = await mount();
    const first = run.session.attemptId;
    await submitBatch(run);
    await userEvent.click(screen.getByRole('button', { name: 'Review next batch (8 left)' }));
    await screen.findByText('Batch 2 of 2');
    const second = run.session.attemptId;
    await userEvent.click(screen.getByRole('button', { name: 'Exit' }));
    const dlg = await screen.findByRole('dialog', { name: 'Leave this batch?' });
    expect(dlg).toHaveTextContent('Batches you already finished are kept.');
    await userEvent.click(within(dlg).getByRole('button', { name: 'Exit and discard' }));
    await waitFor(() => expect(env.appState.route).toEqual({ view: 'tree' }));
    expect(env.discarded).toEqual([second]);
    expect(env.submittedIds).toEqual([first]);
    expect(env.appState.reviewRun).toBeNull();
  });

  it('Review knowledge shows the lesson of the CURRENT question\'s topic', async () => {
    const { run } = await mount({ batches: [['storage-0', 'compute-0']], total: 2 });
    expect(run.session.index).toBe(0);
    await userEvent.click(await screen.findByRole('button', { name: 'Review knowledge' }));
    let dlg = await screen.findByRole('dialog', { name: 'Review knowledge' });
    expect(within(dlg).getByRole('heading', { name: 'S3 buckets' })).toBeInTheDocument();
    expect(within(dlg).queryByText('EC2 basics')).not.toBeInTheDocument();
    expect(within(dlg).queryByText(/clock keeps running/)).not.toBeInTheDocument();
    await userEvent.click(within(dlg).getByRole('button', { name: 'Back to the questions' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next question' }));
    await userEvent.click(screen.getByRole('button', { name: 'Review knowledge' }));
    dlg = await screen.findByRole('dialog', { name: 'Review knowledge' });
    expect(within(dlg).getByRole('heading', { name: 'EC2 basics' })).toBeInTheDocument();
    expect(within(dlg).queryByText('S3 buckets')).not.toBeInTheDocument();
  });

  it('disables Review knowledge with a reason for a question without a topic', async () => {
    await mount({ batches: [['qnull']], total: 1 });
    const btn = await screen.findByRole('button', { name: 'Review knowledge' });
    expect(btn).toBeDisabled();
    expect(screen.getByText('This question has no lesson to review.')).toBeInTheDocument();
  });

  it('sends the user back to the tree when there is no run', async () => {
    const env = await makeReviewEnv();
    env.appState.open({ view: 'review' });
    renderWithI18n(ReviewScreen, { services: env.services, appState: env.appState });
    await waitFor(() => expect(env.appState.route).toEqual({ view: 'tree' }));
  });

  it('shows the result of a restored, already submitted review attempt', async () => {
    const env = await makeReviewEnv();
    const run = await ReviewRun.start(env.services, { batches: [['compute-0', 'compute-1']], total: 2 }, async () => {});
    await run.session.submit('manual');
    const adopted = ReviewRun.adoptSingle(run.session);
    env.appState.reviewRun = adopted;
    env.appState.open({ view: 'review' });
    renderWithI18n(ReviewScreen, { services: env.services, appState: env.appState });
    expect(await screen.findByRole('heading', { name: 'Review result' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to the map' })).toBeInTheDocument();
  });
});
