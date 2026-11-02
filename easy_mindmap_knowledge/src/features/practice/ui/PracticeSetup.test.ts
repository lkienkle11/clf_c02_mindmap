import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makePracticeEnv } from '@/testing/practice-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { loadLastOptions } from '../options';
import { PracticeSession } from '../index';
import PracticeSetup from './PracticeSetup.svelte';

async function mount(topicId = 'compute', seed: string | null = null) {
  const env = await makePracticeEnv();
  if (seed) env.store.set('practice_last_options', seed);
  const onstarted = vi.fn();
  renderWithI18n(PracticeSetup, { services: env.services, appState: env.appState, topicId, onstarted });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Start' })).toBeEnabled());
  return { ...env, onstarted };
}

describe('PracticeSetup', () => {
  it('shows the topic, the question count and the three pairs of choices', async () => {
    await mount();
    expect(screen.getByRole('heading', { name: /compute/ })).toBeInTheDocument();
    expect(screen.getByText('3 questions')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Reviewing knowledge during the attempt' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Allow reviewing knowledge' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Do not allow reviewing knowledge' })).toBeChecked();
    expect(screen.getByRole('group', { name: 'Time limit' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'No time limit' })).toBeChecked();
  });

  it('shows the clock-mode pair only when a time is set', async () => {
    await mount();
    expect(screen.queryByRole('group', { name: 'If the app has a problem' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'Set a time' }));
    expect(screen.getByRole('group', { name: 'If the app has a problem' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'The clock stands still' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'No time limit' }));
    expect(screen.queryByRole('group', { name: 'If the app has a problem' })).not.toBeInTheDocument();
  });

  it('blocks Start on an invalid time and links the error', async () => {
    await mount();
    await userEvent.click(screen.getByRole('radio', { name: 'Set a time' }));
    const minutes = screen.getByRole('spinbutton', { name: 'Minutes' });
    const seconds = screen.getByRole('spinbutton', { name: 'Seconds' });
    await userEvent.clear(minutes);
    await userEvent.type(minutes, '0');
    await userEvent.clear(seconds);
    await userEvent.type(seconds, '0');
    const start = screen.getByRole('button', { name: 'Start' });
    expect(start).toBeDisabled();
    const error = screen.getByText(/between 1 second and 3 hours/);
    expect(error).toHaveAttribute('role', 'alert');
    expect(minutes).toHaveAttribute('aria-invalid', 'true');
    expect(minutes.getAttribute('aria-describedby')).toContain(error.id);
    expect(start.getAttribute('aria-describedby')).toContain(error.id);
    await userEvent.clear(minutes);
    await userEvent.type(minutes, '181');
    expect(start).toBeDisabled();
    await userEvent.clear(minutes);
    await userEvent.type(minutes, '1.5');
    expect(start).toBeDisabled();
    await userEvent.clear(minutes);
    await userEvent.type(minutes, '3');
    expect(start).toBeEnabled();
    expect(screen.queryByText(/between 1 second and 3 hours/)).not.toBeInTheDocument();
  });

  it('starts a session with the chosen options and persists them', async () => {
    const { services, onstarted } = await mount();
    await userEvent.click(screen.getByRole('radio', { name: 'Allow reviewing knowledge' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Set a time' }));
    const minutes = screen.getByRole('spinbutton', { name: 'Minutes' });
    await userEvent.clear(minutes);
    await userEvent.type(minutes, '2');
    const seconds = screen.getByRole('spinbutton', { name: 'Seconds' });
    await userEvent.clear(seconds);
    await userEvent.type(seconds, '30');
    await userEvent.click(screen.getByRole('radio', { name: 'The clock keeps running' }));
    await userEvent.click(screen.getByRole('button', { name: 'Start' }));
    await waitFor(() => expect(onstarted).toHaveBeenCalledTimes(1));
    const session = onstarted.mock.calls[0][0] as PracticeSession;
    expect(session).toBeInstanceOf(PracticeSession);
    expect(session.allowReview).toBe(true);
    expect(await loadLastOptions(services.repos.settings)).toEqual({ allowReview: true, limitMs: 150_000, clockMode: 'run' });
  });

  it('starts from the last saved options', async () => {
    await mount('compute', JSON.stringify({ allowReview: true, limitMs: 90_000, clockMode: 'run' }));
    expect(screen.getByRole('radio', { name: 'Allow reviewing knowledge' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Set a time' })).toBeChecked();
    expect(screen.getByRole('spinbutton', { name: 'Minutes' })).toHaveValue(1);
    expect(screen.getByRole('spinbutton', { name: 'Seconds' })).toHaveValue(30);
    expect(screen.getByRole('radio', { name: 'The clock keeps running' })).toBeChecked();
  });

  it('shows a clear message and does not navigate when the topic has no questions', async () => {
    const { onstarted } = await mount('storage');
    await userEvent.click(screen.getByRole('button', { name: 'Start' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('no questions yet');
    expect(onstarted).not.toHaveBeenCalled();
  });

  it('shows an alert and stays when starting fails for another reason', async () => {
    const env = await makePracticeEnv();
    env.services.repos.attempts.create = async () => { throw new Error('disk'); };
    const onstarted = vi.fn();
    renderWithI18n(PracticeSetup, { services: env.services, appState: env.appState, topicId: 'compute', onstarted });
    await userEvent.click(await screen.findByRole('button', { name: 'Start' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not start');
    expect(onstarted).not.toHaveBeenCalled();
  });
});
