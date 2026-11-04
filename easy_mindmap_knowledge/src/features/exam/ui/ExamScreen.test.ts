import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { makeExamEnv } from '@/testing/exam-env';
import ExamScreen from './ExamScreen.svelte';

const GROUP1 = ['cloud-concepts', 'global-infrastructure', 'compute'];

async function startExam() {
  const env = await makeExamEnv(GROUP1);
  env.appState.open({ view: 'checkpoint', groupIndex: 1 });
  renderWithI18n(ExamScreen, { services: env.services, appState: env.appState, groupIndex: 1 });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Start exam' })).toBeEnabled());
  await userEvent.click(screen.getByRole('button', { name: 'Start exam' }));
  return env;
}

describe('ExamScreen', () => {
  it('starts into the session view with a timer and no Review knowledge button', async () => {
    await startExam();
    expect(await screen.findByRole('timer')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Review knowledge' })).not.toBeInTheDocument();
  });

  it('Exit asks for confirmation and abandons the attempt', async () => {
    const env = await startExam();
    await userEvent.click(await screen.findByRole('button', { name: 'Exit' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Exit and discard' }));
    await waitFor(() => expect(env.discarded).toEqual(['att-1']));
    expect(env.appState.route).toEqual({ view: 'tree' });
  });

  it('shows the result after submitting and Try again returns to setup', async () => {
    await startExam();
    await userEvent.click(await screen.findByRole('button', { name: 'Submit' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Submit' }));
    expect(await screen.findByRole('heading', { name: 'Result' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('button', { name: 'Start exam' })).toBeInTheDocument();
  });
});
