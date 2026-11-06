import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { loadExamOptions } from '../index';
import { makeExamEnv } from '@/testing/exam-env';
import ExamSetup from './ExamSetup.svelte';

const GROUP1 = ['cloud-concepts', 'global-infrastructure', 'compute'];

describe('ExamSetup', () => {
  it('is locked and names the missing topics when the group is not completed', async () => {
    const env = await makeExamEnv(['cloud-concepts', 'global-infrastructure']);
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: 1, onstarted: () => {} });
    expect(screen.getByRole('heading', { name: 'Checkpoint 1' })).toBeInTheDocument();
    expect(screen.getByText(/Complete all topics of this group first/)).toHaveTextContent('compute');
    expect(screen.getByRole('button', { name: 'Start exam' })).toBeDisabled();
  });

  it('is enabled when the group is completed and shows 90 then 120 minutes with extra time, saving the choice', async () => {
    const env = await makeExamEnv(GROUP1);
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: 1, onstarted: () => {} });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Start exam' })).toBeEnabled());
    expect(screen.getByText(/90 minutes/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: /Extra time/ }));
    expect(screen.getByText(/120 minutes/)).toBeInTheDocument();
    expect(screen.queryByText(/90 minutes/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Start exam' }));
    await waitFor(async () => expect(await loadExamOptions(env.services.repos.settings)).toEqual({ extraTime: true }));
  });

  it('start calls onstarted with a running exam session', async () => {
    const env = await makeExamEnv(GROUP1);
    let started: unknown = null;
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: 1, onstarted: (s: unknown) => (started = s) });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Start exam' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Start exam' }));
    await waitFor(() => expect(started).not.toBeNull());
    expect(env.created).toHaveLength(1);
  });

  it('shows an alert when the exam cannot be started', async () => {
    const env = await makeExamEnv(GROUP1, { failCreate: true });
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: 1, onstarted: () => {} });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Start exam' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Start exam' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not start the exam');
  });

  it('Capstone is disabled unless its topic is current or done', async () => {
    const env = await makeExamEnv([]);
    env.appState.statuses = new Map([['capstone', 'locked']]);
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: null, onstarted: () => {} });
    expect(screen.getByRole('heading', { name: 'Capstone exam' })).toBeInTheDocument();
    expect(screen.getByText(/Pass checkpoint 4/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start exam' })).toBeDisabled();
  });

  it('Capstone is enabled when its topic is current', async () => {
    const env = await makeExamEnv([]);
    env.appState.statuses = new Map([['capstone', 'current']]);
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: null, onstarted: () => {} });
    await waitFor(() => expect(within(document.body).getByRole('button', { name: 'Start exam' })).toBeEnabled());
  });
});
