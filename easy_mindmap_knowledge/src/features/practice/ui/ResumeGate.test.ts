import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { AttemptQuestionRow, AttemptRow } from '@/persistence';
import { makePracticeEnv } from '@/testing/practice-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import ResumeGate from './ResumeGate.svelte';

const attempt = (over: Partial<AttemptRow> = {}): AttemptRow => ({
  id: 'old', kind: 'practice', topicId: 'compute', status: 'in_progress', startedAt: 0, submittedAt: null,
  submitReason: null, reviewAllowed: false, clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null, onHidden: 'freeze', onReport: 'freeze' },
  heartbeatAt: null, scorePct: null, passed: null, groupIndex: null, plannedCount: null, unansweredDisplay: 'reveal', ...over,
});
const rows = (ids = ['q1', 'q2', 'q3']): AttemptQuestionRow[] =>
  ids.map((questionId, position) => ({ attemptId: 'old', position, questionId, optionOrder: ['A', 'B', 'C', 'D'], selected: [], isCorrect: null }));

async function mount(found: { attempt: AttemptRow; questions: AttemptQuestionRow[] } | null) {
  const env = await makePracticeEnv({ inProgress: found });
  await env.appState.refresh();
  const onresumed = vi.fn();
  const onnotice = vi.fn();
  renderWithI18n(ResumeGate, { services: env.services, appState: env.appState, onresumed, onnotice });
  return { ...env, onresumed, onnotice };
}

describe('ResumeGate', () => {
  it('shows nothing without an unfinished attempt', async () => {
    await mount(null);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks whether to continue an unfinished attempt', async () => {
    await mount({ attempt: attempt(), questions: rows() });
    const dlg = await screen.findByRole('dialog', { name: 'Unfinished attempt' });
    expect(within(dlg).getByText('You have an unfinished attempt. Continue?')).toBeInTheDocument();
  });

  it('is hidden while a practice session is on screen', async () => {
    const env = await mount({ attempt: attempt(), questions: rows() });
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    env.appState.open({ view: 'practice', topicId: 'compute' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Continue resumes the session', async () => {
    const env = await mount({ attempt: attempt(), questions: rows() });
    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(env.onresumed).toHaveBeenCalledTimes(1));
    expect(env.onresumed.mock.calls[0][0].attemptId).toBe('old');
    expect(env.onresumed.mock.calls[0][0].submitted).toBe(false);
  });

  it('Continue submits immediately when the time already ran out', async () => {
    const expired = attempt({ clock: { mode: 'freeze', limitMs: 60_000, remainingMs: 0, deadlineAt: null, onHidden: 'freeze', onReport: 'freeze' } });
    const env = await mount({ attempt: expired, questions: rows() });
    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(env.onresumed).toHaveBeenCalledTimes(1));
    expect(env.onresumed.mock.calls[0][0].submitted).toBe(true);
  });

  it('discards a corrupt attempt and tells the user', async () => {
    const env = await mount({ attempt: attempt(), questions: rows([]) });
    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(env.onnotice).toHaveBeenLastCalledWith(expect.stringContaining('could not be restored and was discarded')));
    expect(env.discarded).toEqual(['old']);
    expect(env.onresumed).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Discard removes the attempt and refreshes', async () => {
    const env = await mount({ attempt: attempt(), questions: rows() });
    await userEvent.click(await screen.findByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(env.discarded).toEqual(['old']));
    await waitFor(() => expect(env.appState.resumeAttempt).toBeNull());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(env.onresumed).not.toHaveBeenCalled();
  });

  it('labels the discard action "Bỏ lượt này" in Vietnamese', async () => {
    const env = await makePracticeEnv({ inProgress: { attempt: attempt(), questions: rows() } });
    await env.appState.refresh();
    renderWithI18n(ResumeGate, { services: env.services, appState: env.appState, onresumed: vi.fn() }, 'vi');
    expect(await screen.findByRole('button', { name: 'Bỏ lượt này' })).toBeInTheDocument();
  });
});

describe('ResumeGate on the review screen', () => {
  it('stays hidden while a review screen is on screen', async () => {
    const env = await mount({ attempt: attempt({ kind: 'review', topicId: null }), questions: rows() });
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    env.appState.open({ view: 'review' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Continue on a review attempt hands the restored review session over', async () => {
    const env = await mount({ attempt: attempt({ kind: 'review', topicId: null, reviewAllowed: true }), questions: rows() });
    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(env.onresumed).toHaveBeenCalledTimes(1));
    expect(env.onresumed.mock.calls[0][0].kind).toBe('review');
  });
});
