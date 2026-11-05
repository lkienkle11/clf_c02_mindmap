import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makeQuestion } from '@/testing/fixtures';
import { makePracticeEnv, makePracticeRawCatalog } from '@/testing/practice-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { loadLastOptions } from '../options';
import { PracticeSession } from '../index';
import PracticeSetup from './PracticeSetup.svelte';

type RawCatalog = ReturnType<typeof makePracticeRawCatalog>;

/** compute with `total` questions: the three from makePracticeRawCatalog, then fillers. */
function computeCatalog(total: number): RawCatalog {
  const raw = makePracticeRawCatalog();
  const options = [{ key: 'A', text: 'Alpha' }, { key: 'B', text: 'Bravo' }];
  for (let n = raw.questions.length + 1; n <= total; n++) {
    raw.questions.push(makeQuestion({ id: `f${n}`, topicId: 'compute', text: `Filler ${n}`, options, correct: ['A'] }));
  }
  return raw;
}

async function mount(topicId = 'compute', seed: string | null = null, rawCatalog?: RawCatalog) {
  const env = await makePracticeEnv({ rawCatalog });
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
    expect(await loadLastOptions(services.repos.settings)).toEqual({ allowReview: true, limitMs: 150_000, clockMode: 'run', onHidden: 'freeze', questionCount: 10 });
  });

  it('starts from the last saved options', async () => {
    await mount('compute', JSON.stringify({ allowReview: true, limitMs: 90_000, clockMode: 'run' }));
    expect(screen.getByRole('radio', { name: 'Allow reviewing knowledge' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Set a time' })).toBeChecked();
    expect(screen.getByRole('spinbutton', { name: 'Minutes' })).toHaveValue(1);
    expect(screen.getByRole('spinbutton', { name: 'Seconds' })).toHaveValue(30);
    expect(screen.getByRole('radio', { name: 'The clock keeps running' })).toBeChecked();
  });

  it('shows the hidden-policy pair only when a time is set, defaulting to freeze', async () => {
    await mount();
    const legend = 'When you switch tabs or minimize';
    expect(screen.queryByRole('group', { name: legend })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'Set a time' }));
    expect(screen.getByRole('group', { name: legend })).toBeInTheDocument();
    expect(screen.getByText(/Only applies while the window is hidden/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Freeze the time' })).toBeChecked();
    await userEvent.click(screen.getByRole('radio', { name: 'No time limit' }));
    expect(screen.queryByRole('group', { name: legend })).not.toBeInTheDocument();
  });

  it('choosing "keep running" starts the session with onHidden run and persists it', async () => {
    const { services, onstarted } = await mount();
    await userEvent.click(screen.getByRole('radio', { name: 'Set a time' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Let the time keep running' }));
    await userEvent.click(screen.getByRole('button', { name: 'Start' }));
    await waitFor(() => expect(onstarted).toHaveBeenCalledTimes(1));
    expect((await loadLastOptions(services.repos.settings))?.onHidden).toBe('run');
  });

  it('restores the previously saved onHidden', async () => {
    await mount('compute', JSON.stringify({ allowReview: false, limitMs: 90_000, clockMode: 'freeze', onHidden: 'run' }));
    expect(screen.getByRole('radio', { name: 'Let the time keep running' })).toBeChecked();
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

  it('Back to the map routes to the tree without touching saved options', async () => {
    const seed = JSON.stringify({ allowReview: true, limitMs: 90_000, clockMode: 'run' });
    const env = await mount('compute', seed);
    env.appState.open({ view: 'practice', topicId: 'compute' });
    await userEvent.click(screen.getByRole('radio', { name: 'No time limit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Back to the map' }));
    expect(env.appState.route).toEqual({ view: 'tree' });
    expect(env.store.get('practice_last_options')).toBe(seed);
    expect(env.created).toEqual([]);
    expect(env.onstarted).not.toHaveBeenCalled();
  });

  it('Back to the map speaks Vietnamese', async () => {
    const env = await makePracticeEnv();
    renderWithI18n(PracticeSetup, { services: env.services, appState: env.appState, topicId: 'compute', onstarted: vi.fn() }, 'vi');
    expect(screen.getByRole('button', { name: 'Về sơ đồ' })).toBeInTheDocument();
  });
});

describe('PracticeSetup question count', () => {
  const countInput = () => screen.getByRole('spinbutton', { name: 'Number of questions' });
  const start = () => screen.getByRole('button', { name: 'Start' });
  const minutes = () => screen.getByRole('spinbutton', { name: 'Minutes' });
  const seconds = () => screen.getByRole('spinbutton', { name: 'Seconds' });
  const savedOptions = (o: object) => JSON.stringify({ allowReview: false, limitMs: null, clockMode: 'freeze', onHidden: 'freeze', ...o });

  it('labels the count input and starts at 10', async () => {
    await mount('compute', null, computeCatalog(26));
    expect(countInput()).toHaveValue(10);
    expect(countInput()).toBeEnabled();
  });

  it('shows a too-few alert and disables Start for 9, then clears it at 10', async () => {
    await mount('compute', null, computeCatalog(26));
    await userEvent.clear(countInput());
    await userEvent.type(countInput(), '9');
    const error = screen.getByText(/at least 10 questions/);
    expect(error).toHaveAttribute('role', 'alert');
    expect(countInput()).toHaveAttribute('aria-invalid', 'true');
    expect(countInput().getAttribute('aria-describedby')).toContain(error.id);
    expect(start().getAttribute('aria-describedby')).toContain(error.id);
    expect(start()).toBeDisabled();
    await userEvent.clear(countInput());
    await userEvent.type(countInput(), '10');
    expect(screen.queryByText(/at least 10 questions/)).not.toBeInTheDocument();
    expect(countInput()).toHaveAttribute('aria-invalid', 'false');
    expect(start()).toBeEnabled();
  });

  it('shows a too-many alert for 1000 and names the pool size', async () => {
    await mount('compute', null, computeCatalog(26));
    await userEvent.clear(countInput());
    await userEvent.type(countInput(), '1000');
    const error = screen.getByText(/at most 26 questions/);
    expect(error).toHaveAttribute('role', 'alert');
    expect(countInput().getAttribute('aria-describedby')).toContain(error.id);
    expect(start()).toBeDisabled();
  });

  it('shows a whole-number alert for 1.5', async () => {
    await mount('compute', null, computeCatalog(26));
    await userEvent.clear(countInput());
    await userEvent.type(countInput(), '1.5');
    expect(screen.getByText(/whole number/)).toHaveAttribute('role', 'alert');
    expect(start()).toBeDisabled();
  });

  it('quick button 20 sets the input and the header; All sets the pool size', async () => {
    await mount('compute', null, computeCatalog(26));
    await userEvent.click(screen.getByRole('button', { name: '20 questions' }));
    expect(countInput()).toHaveValue(20);
    expect(screen.getByText('20 questions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'All questions' }));
    expect(countInput()).toHaveValue(26);
    expect(screen.getByText('26 questions')).toBeInTheDocument();
  });

  it('starting with 15 makes a session of 15 questions and saves 15', async () => {
    const { services, onstarted } = await mount('compute', null, computeCatalog(26));
    await userEvent.clear(countInput());
    await userEvent.type(countInput(), '15');
    await userEvent.click(start());
    await waitFor(() => expect(onstarted).toHaveBeenCalledTimes(1));
    expect((onstarted.mock.calls[0][0] as PracticeSession).questions).toHaveLength(15);
    expect((await loadLastOptions(services.repos.settings)).questionCount).toBe(15);
  });

  it('restores the saved count', async () => {
    await mount('compute', savedOptions({ questionCount: 20 }), computeCatalog(26));
    expect(countInput()).toHaveValue(20);
    expect(screen.getByText('20 questions')).toBeInTheDocument();
  });

  it('clamps a saved count that is larger than the pool', async () => {
    await mount('compute', savedOptions({ questionCount: 500 }), computeCatalog(26));
    expect(countInput()).toHaveValue(26);
    expect(screen.getByText('26 questions')).toBeInTheDocument();
    expect(start()).toBeEnabled();
  });

  it('hides the count control for a pool below the minimum and keeps Start enabled', async () => {
    const { onstarted } = await mount();
    expect(screen.getByText('3 questions')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton', { name: 'Number of questions' })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'All questions' })).not.toBeInTheDocument();
    await userEvent.click(start());
    await waitFor(() => expect(onstarted).toHaveBeenCalledTimes(1));
    expect((onstarted.mock.calls[0][0] as PracticeSession).questions).toHaveLength(3);
  });

  it('pre-fills the time from the chosen count the first time a time is set', async () => {
    await mount('compute', null, computeCatalog(26));
    await userEvent.click(screen.getByRole('radio', { name: 'Set a time' }));
    // ceil(10 x 90 / 65) = 14 minutes
    expect(minutes()).toHaveValue(14);
    expect(seconds()).toHaveValue(0);
  });

  it('uses the chosen count for the time pre-fill', async () => {
    await mount('compute', null, computeCatalog(26));
    await userEvent.clear(countInput());
    await userEvent.type(countInput(), '20');
    await userEvent.click(screen.getByRole('radio', { name: 'Set a time' }));
    // ceil(20 x 90 / 65) = 28 minutes
    expect(minutes()).toHaveValue(28);
  });

  it('does not pre-fill again once the user has edited the time', async () => {
    await mount('compute', null, computeCatalog(26));
    await userEvent.click(screen.getByRole('radio', { name: 'Set a time' }));
    expect(minutes()).toHaveValue(14);
    await userEvent.clear(minutes());
    await userEvent.type(minutes(), '2');
    await userEvent.click(screen.getByRole('radio', { name: 'No time limit' }));
    await userEvent.clear(countInput());
    await userEvent.type(countInput(), '20');
    await userEvent.click(screen.getByRole('radio', { name: 'Set a time' }));
    expect(minutes()).toHaveValue(2);
  });

  it('keeps a saved time limit instead of pre-filling', async () => {
    await mount('compute', savedOptions({ limitMs: 90_000, clockMode: 'run', questionCount: 20 }), computeCatalog(26));
    await userEvent.click(screen.getByRole('radio', { name: 'No time limit' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Set a time' }));
    expect(minutes()).toHaveValue(1);
    expect(seconds()).toHaveValue(30);
  });
});
