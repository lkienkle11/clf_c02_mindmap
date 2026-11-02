import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, within, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makePracticeEnv } from '@/testing/practice-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { DEFAULT_PRACTICE_OPTIONS, PracticeSession } from '../index';
import type { PracticeOptions } from '../index';
import PracticeSessionView from './PracticeSessionView.svelte';

type Env = Awaited<ReturnType<typeof makePracticeEnv>>;

async function mount(options: Partial<PracticeOptions> = {}, envOpts: Parameters<typeof makePracticeEnv>[0] = {}) {
  const env = await makePracticeEnv(envOpts);
  const session = await PracticeSession.start(env.services, 'compute', { ...DEFAULT_PRACTICE_OPTIONS, ...options }, () => env.appState.refresh());
  const onmanual = vi.fn();
  renderWithI18n(PracticeSessionView, { services: env.services, appState: env.appState, session, onmanual });
  return { ...env, session, onmanual };
}

const labelsOf = (group: HTMLElement, role: 'radio' | 'checkbox') => within(group).getAllByRole(role).map((el) => el.closest('label')?.textContent?.trim());
const textOf = (env: Env, id: string, key: string) => env.services.catalog.questions.find((q) => q.id === id)!.options.find((o) => o.key === key)!.text;

afterEach(() => vi.useRealTimers());

describe('PracticeSessionView', () => {
  it('renders the question text and options in the session optionOrder', async () => {
    const env = await mount();
    const q = env.session.questions[0];
    const group = screen.getByRole(q.multi ? 'group' : 'radiogroup');
    expect(labelsOf(group, q.multi ? 'checkbox' : 'radio')).toEqual(q.optionOrder.map((k) => textOf(env, q.questionId, k)));
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('uses radios for single and checkboxes with a hint for multi answers', async () => {
    const env = await mount();
    const multiPos = env.session.questions.findIndex((q) => q.multi);
    const singlePos = env.session.questions.findIndex((q) => !q.multi);
    env.session.goTo(singlePos);
    expect(await screen.findAllByRole('radio')).toHaveLength(4);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByText('Choose 2')).not.toBeInTheDocument();
    env.session.goTo(multiPos);
    expect(await screen.findAllByRole('checkbox')).toHaveLength(4);
    expect(screen.getByText('Choose 2')).toBeInTheDocument();
  });

  it('selecting calls session.select, persists, and survives navigating away and back', async () => {
    const env = await mount();
    const q = env.session.questions[0];
    const key = q.optionOrder[1];
    await userEvent.click(screen.getByRole('radio', { name: textOf(env, q.questionId, key) }));
    expect(env.saved).toEqual([{ position: 0, selected: q.multi ? [key] : [key] }]);
    await userEvent.click(screen.getByRole('button', { name: 'Next question' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous question' }));
    const again = q.multi ? 'checkbox' : 'radio';
    expect(screen.getByRole(again, { name: textOf(env, q.questionId, key) })).toBeChecked();
  });

  it('supports several checkboxes on a multi-answer question', async () => {
    const env = await mount();
    const pos = env.session.questions.findIndex((q) => q.multi);
    env.session.goTo(pos);
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Alpha' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Bravo' }));
    expect([...env.session.questions[pos].selected].sort()).toEqual(['A', 'B']);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Alpha' }));
    expect(env.session.questions[pos].selected).toEqual(['B']);
  });

  it('shows an inline alert and reverts the control when saving fails', async () => {
    const env = await mount({}, { failSaveAnswer: true });
    const q = env.session.questions[0];
    const name = textOf(env, q.questionId, q.optionOrder[0]);
    await userEvent.click(screen.getByRole(q.multi ? 'checkbox' : 'radio', { name }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save your answer');
    expect(screen.getByRole(q.multi ? 'checkbox' : 'radio', { name })).not.toBeChecked();
    expect(env.session.questions[0].selected).toEqual([]);
  });

  it('the navigator names answered state, marks the current question and jumps', async () => {
    const env = await mount();
    const nav = screen.getByRole('navigation', { name: 'Questions' });
    expect(within(nav).getAllByRole('button')).toHaveLength(3);
    expect(within(nav).getByRole('button', { name: /^Question 1, unanswered/ })).toHaveAttribute('aria-current', 'step');
    const q = env.session.questions[0];
    await userEvent.click(screen.getByRole(q.multi ? 'checkbox' : 'radio', { name: textOf(env, q.questionId, q.optionOrder[0]) }));
    expect(within(nav).getByRole('button', { name: /^Question 1, answered/ })).toBeInTheDocument();
    await userEvent.click(within(nav).getByRole('button', { name: /^Question 3/ }));
    expect(env.session.index).toBe(2);
    expect(within(nav).getByRole('button', { name: /^Question 3, unanswered/ })).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText('3/3')).toBeInTheDocument();
  });

  it('disables Review knowledge with a visible reason when it is not allowed', async () => {
    await mount({ allowReview: false });
    const btn = screen.getByRole('button', { name: /Review knowledge/ });
    expect(btn).toBeDisabled();
    expect(screen.getByText('Not allowed in this attempt')).toBeVisible();
    expect(btn.getAttribute('aria-describedby')).toBeTruthy();
  });

  it('opens a read-only knowledge overlay when allowed, without marking anything read', async () => {
    const env = await mount({ allowReview: true });
    await userEvent.click(screen.getByRole('button', { name: 'Review knowledge' }));
    const dlg = await screen.findByRole('dialog', { name: 'Review knowledge' });
    expect(env.session.knowledgeOpen).toBe(true);
    expect(within(dlg).getByText('EC2 basics')).toBeInTheDocument();
    expect(within(dlg).getByText('servers')).toBeInTheDocument();
    expect(within(dlg).queryByRole('link')).not.toBeInTheDocument();
    expect(within(dlg).getByText('The clock keeps running while you review.')).toBeInTheDocument();
    expect(within(dlg).queryByRole('button', { name: /complete/i })).not.toBeInTheDocument();
    await userEvent.click(within(dlg).getByRole('button', { name: 'Back to the questions' }));
    expect(env.session.knowledgeOpen).toBe(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(env.markReadCalls).toEqual([]);
  });

  it('Submit asks for confirmation and states how many questions are unanswered', async () => {
    const env = await mount();
    const q = env.session.questions[0];
    await userEvent.click(screen.getByRole(q.multi ? 'checkbox' : 'radio', { name: textOf(env, q.questionId, q.optionOrder[0]) }));
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    const dlg = await screen.findByRole('dialog', { name: 'Submit your answers?' });
    expect(within(dlg).getByText('You have 2 unanswered questions.')).toBeInTheDocument();
    await userEvent.click(within(dlg).getByRole('button', { name: 'Cancel' }));
    expect(env.session.submitted).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(env.session.submitted).toBe(true));
    expect(env.onmanual).toHaveBeenCalled();
  });

  it('Exit asks for confirmation; cancel keeps the attempt, confirm discards and goes to the tree', async () => {
    const env = await mount();
    await userEvent.click(screen.getByRole('button', { name: 'Exit' }));
    const dlg = await screen.findByRole('dialog', { name: 'Exit this attempt?' });
    expect(within(dlg).getByText(/will be discarded/)).toBeInTheDocument();
    await userEvent.click(within(dlg).getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(env.discarded).toEqual([]);
    env.appState.open({ view: 'practice', topicId: 'compute' });
    await userEvent.click(screen.getByRole('button', { name: 'Exit' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Exit and discard' }));
    await waitFor(() => expect(env.appState.route).toEqual({ view: 'tree' }));
    expect(env.discarded).toEqual([env.session.attemptId]);
  });

  it('shows no countdown without a limit', async () => {
    await mount();
    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });

  it('ticks with the real elapsed time, formats mm:ss and announces only at milestones', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    vi.setSystemTime(1_000_000);
    const env = await mount({ limitMs: 320_000 }, { now: () => Date.now() });
    const spy = vi.spyOn(env.session, 'tick');
    const timer = screen.getByRole('timer');
    expect(timer).toHaveAttribute('aria-live', 'off');
    expect(timer).toHaveTextContent('05:20');
    await vi.advanceTimersByTimeAsync(1000);
    expect(spy).toHaveBeenLastCalledWith(1000);
    expect(timer).toHaveTextContent('05:19');
    expect(screen.getByTestId('timer-announcement')).toHaveTextContent('');
    // Simulate a late interval: the clock jumps 2.5 s but only one tick fires.
    vi.setSystemTime(Date.now() + 1500);
    await vi.advanceTimersByTimeAsync(1000);
    expect(spy).toHaveBeenLastCalledWith(2500);
    await vi.advanceTimersByTimeAsync(20_000);
    expect(screen.getByTestId('timer-announcement')).toHaveTextContent('5 minutes left');
  });

  it('auto-submits on timeout without a manual submit', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    vi.setSystemTime(1_000_000);
    const env = await mount({ limitMs: 3000 }, { now: () => Date.now() });
    await vi.advanceTimersByTimeAsync(3000);
    expect(env.session.submitted).toBe(true);
    expect(env.session.result).not.toBeNull();
    expect(env.onmanual).not.toHaveBeenCalled();
  });
});
