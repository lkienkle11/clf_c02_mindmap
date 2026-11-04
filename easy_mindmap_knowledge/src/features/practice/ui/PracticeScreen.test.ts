import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makePracticeEnv } from '@/testing/practice-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { DEFAULT_PRACTICE_OPTIONS, PracticeSession } from '../index';
import type { AttemptRow } from '@/persistence';
import type { Services } from '@/app/composition';
import PracticeScreen from './PracticeScreen.svelte';

const passedAttempt = (topicId: string): AttemptRow => ({
  id: `p-${topicId}`, kind: 'practice', topicId, status: 'submitted', startedAt: 0, submittedAt: 1, submitReason: 'manual',
  reviewAllowed: false, clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null, onHidden: 'freeze' },
  heartbeatAt: null, scorePct: 100, passed: true, groupIndex: null, plannedCount: null,
});

async function passedSession(services: Services, topicId: string, refresh: () => Promise<void>) {
  const s = await PracticeSession.start(services, topicId, DEFAULT_PRACTICE_OPTIONS, refresh);
  const byId = new Map(services.catalog.questions.map((q) => [q.id, q]));
  for (const q of s.questions) await s.select(q.position, byId.get(q.questionId)!.correct);
  return s;
}

describe('PracticeScreen', () => {
  it('walks setup, session and result, then Try again returns to setup', async () => {
    const env = await makePracticeEnv();
    env.appState.open({ view: 'practice', topicId: 'compute' });
    renderWithI18n(PracticeScreen, { services: env.services, appState: env.appState, topicId: 'compute' });
    await userEvent.click(await screen.findByRole('button', { name: 'Start' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Submit' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Submit' }));
    expect(await screen.findByRole('heading', { name: 'Result' })).toBeInTheDocument();
    expect(screen.queryByText("Time's up, submitted automatically")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  it('Back to the map opens the tree', async () => {
    const env = await makePracticeEnv();
    const session = await PracticeSession.start(env.services, 'compute', DEFAULT_PRACTICE_OPTIONS, () => env.appState.refresh());
    await session.submit('manual');
    env.appState.open({ view: 'practice', topicId: 'compute' });
    renderWithI18n(PracticeScreen, { services: env.services, appState: env.appState, topicId: 'compute', initialSession: session });
    await userEvent.click(await screen.findByRole('button', { name: 'Back to the map' }));
    expect(env.appState.route).toEqual({ view: 'tree' });
  });

  it('accepts an already-created session (after resume)', async () => {
    const env = await makePracticeEnv();
    const session = await PracticeSession.start(env.services, 'compute', DEFAULT_PRACTICE_OPTIONS, () => env.appState.refresh());
    renderWithI18n(PracticeScreen, { services: env.services, appState: env.appState, topicId: 'compute', initialSession: session });
    expect(await screen.findByRole('navigation', { name: 'Questions' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start' })).not.toBeInTheDocument();
  });

  it('shows the automatic-submit message after a session that was submitted by timeout', async () => {
    const env = await makePracticeEnv();
    const session = await PracticeSession.start(env.services, 'compute', DEFAULT_PRACTICE_OPTIONS, () => env.appState.refresh());
    await session.submit('timeout');
    renderWithI18n(PracticeScreen, { services: env.services, appState: env.appState, topicId: 'compute', initialSession: session });
    expect(await screen.findByText("Time's up, submitted automatically")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Result' })).toHaveFocus());
  });

  it('says the next topic unlocked only on the first pass of a non-final topic', async () => {
    const env = await makePracticeEnv();
    const s = await passedSession(env.services, 'compute', () => env.appState.refresh());
    env.appState.open({ view: 'practice', topicId: 'compute' });
    renderWithI18n(PracticeScreen, { services: env.services, appState: env.appState, topicId: 'compute', initialSession: s });
    await s.submit('manual');
    expect(await screen.findByText('Passed!')).toBeInTheDocument();
    expect(screen.getByText('Next topic unlocked')).toBeInTheDocument();
  });

  it('a redo of a finished topic passes without the unlock line', async () => {
    const env = await makePracticeEnv({ submitted: [passedAttempt('compute')] });
    const s = await passedSession(env.services, 'compute', () => env.appState.refresh());
    renderWithI18n(PracticeScreen, { services: env.services, appState: env.appState, topicId: 'compute', initialSession: s });
    await s.submit('manual');
    expect(await screen.findByText('Passed!')).toBeInTheDocument();
    expect(screen.queryByText('Next topic unlocked')).not.toBeInTheDocument();
  });

  it('passing Capstone (the last topic) never says a topic unlocked', async () => {
    const env = await makePracticeEnv();
    const s = await passedSession(env.services, 'capstone', () => env.appState.refresh());
    renderWithI18n(PracticeScreen, { services: env.services, appState: env.appState, topicId: 'capstone', initialSession: s });
    await s.submit('manual');
    expect(await screen.findByText('Passed!')).toBeInTheDocument();
    expect(screen.queryByText('Next topic unlocked')).not.toBeInTheDocument();
  });
});
