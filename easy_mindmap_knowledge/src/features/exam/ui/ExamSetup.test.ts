import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { loadExamOptions } from '../index';
import { makeExamEnv } from '@/testing/exam-env';
import ExamSetup from './ExamSetup.svelte';
import { loadBundledCatalog } from '@/content/bundled';
import type { PracticeSession } from '@/features/practice';

const GROUP1 = ['cloud-concepts', 'global-infrastructure', 'compute'];

describe('ExamSetup', () => {
  it('shows the help tick only for checkpoint setup', async () => {
    const env = await makeExamEnv(GROUP1);
    const view = renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: 1, capstoneTopicId: null, onstarted: () => {} });
    expect(screen.getByRole('checkbox', { name: /Use help powers/ })).toBeInTheDocument();
    view.unmount();
    const catalog = loadBundledCatalog();
    const capstone = await makeExamEnv([], { rawCatalog: { topics: catalog.topics, lessons: catalog.lessons, questions: catalog.questions } });
    renderWithI18n(ExamSetup, { services: capstone.services, appState: capstone.appState, groupIndex: null, capstoneTopicId: 'capstone-exam-1', onstarted: () => {} });
    expect(screen.queryByRole('checkbox', { name: /Use help powers/ })).not.toBeInTheDocument();
  });

  it('starts unchecked and does not remember help between mounts', async () => {
    const env = await makeExamEnv(GROUP1);
    const props = { services: env.services, appState: env.appState, groupIndex: 1, capstoneTopicId: null, onstarted: () => {} };
    const view = renderWithI18n(ExamSetup, props);
    const tick = screen.getByRole('checkbox', { name: /Use help powers/ });
    expect(tick).not.toBeChecked();
    await userEvent.click(tick);
    view.unmount();
    renderWithI18n(ExamSetup, props);
    expect(screen.getByRole('checkbox', { name: /Use help powers/ })).not.toBeChecked();
  });

  it('starts a checkpoint with help powers when ticked', async () => {
    const env = await makeExamEnv(GROUP1);
    let session: PracticeSession | null = null;
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: 1, capstoneTopicId: null, onstarted: (s: PracticeSession) => { session = s; } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Start exam' })).toBeEnabled());
    await userEvent.click(screen.getByRole('checkbox', { name: /Use help powers/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Start exam' }));
    await waitFor(() => expect(session).not.toBeNull());
    expect((session as unknown as PracticeSession).helpMode).toBe('powers');
  });

  it('switches the answers rule when help is ticked', async () => {
    const env = await makeExamEnv(GROUP1);
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: 1, capstoneTopicId: null, onstarted: () => {} });
    expect(screen.getByText('Answers and explanations are shown only after you submit.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: /Use help powers/ }));
    expect(screen.queryByText('Answers and explanations are shown only after you submit.')).not.toBeInTheDocument();
    expect(screen.getByText('Use help up to 3 times for each power; remaining answers and explanations are shown after you submit.')).toBeInTheDocument();
  });

  it('keeps the capstone setup rules unchanged', async () => {
    const catalog = loadBundledCatalog();
    const env = await makeExamEnv([], { rawCatalog: { topics: catalog.topics, lessons: catalog.lessons, questions: catalog.questions } });
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: null, capstoneTopicId: 'capstone-exam-1', onstarted: () => {} });
    expect(screen.getByText('Answers and explanations are shown only after you submit.')).toBeInTheDocument();
    expect(screen.queryByText(/Use help up to/)).not.toBeInTheDocument();
  });

  it('is locked and names the missing topics when the group is not completed', async () => {
    const env = await makeExamEnv(['cloud-concepts', 'global-infrastructure']);
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: 1, capstoneTopicId: null, onstarted: () => {} });
    expect(screen.getByRole('heading', { name: 'Checkpoint 1' })).toBeInTheDocument();
    expect(screen.getByText(/Complete all topics of this group first/)).toHaveTextContent('compute');
    expect(screen.getByRole('button', { name: 'Start exam' })).toBeDisabled();
  });

  it('is enabled when the group is completed and shows 90 then 120 minutes with extra time, saving the choice', async () => {
    const env = await makeExamEnv(GROUP1);
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: 1, capstoneTopicId: null, onstarted: () => {} });
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
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: 1, capstoneTopicId: null, onstarted: (s: unknown) => (started = s) });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Start exam' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Start exam' }));
    await waitFor(() => expect(started).not.toBeNull());
    expect(env.created).toHaveLength(1);
  });

  it('shows an alert when the exam cannot be started', async () => {
    const env = await makeExamEnv(GROUP1, { failCreate: true });
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: 1, capstoneTopicId: null, onstarted: () => {} });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Start exam' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Start exam' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not start the exam');
  });

  it.each([
    ['capstone-exam-1', 'Capstone - Exam 1', 'Pass checkpoint 4 first.'],
    ['capstone-exam-2', 'Capstone - Exam 2', 'Finish Capstone - Exam 1 first.'],
  ])('%s is disabled with its own gate reason', async (topicId, title, reason) => {
    const catalog = loadBundledCatalog();
    const env = await makeExamEnv([], { rawCatalog: { topics: catalog.topics, lessons: catalog.lessons, questions: catalog.questions } });
    env.appState.statuses = new Map([[topicId, 'locked']]);
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: null, capstoneTopicId: topicId, onstarted: () => {} });
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
    expect(screen.getByText(reason)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start exam' })).toBeDisabled();
  });

  it.each(['current', 'done'] as const)('exam 2 %s setup shows scored rules, duration and starts the selected topic', async (status) => {
    const catalog = loadBundledCatalog();
    const env = await makeExamEnv(status === 'done' ? ['capstone-exam-2'] : [], { rawCatalog: { topics: catalog.topics, lessons: catalog.lessons, questions: catalog.questions } });
    env.appState.statuses = new Map([['capstone-exam-2', status]]);
    let topic: string | null = null;
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: null, capstoneTopicId: 'capstone-exam-2', onstarted: (s: PracticeSession) => { topic = s.topicId; } });
    await waitFor(() => expect(within(document.body).getByRole('button', { name: 'Start exam' })).toBeEnabled());
    expect(screen.getByText('65 questions, including 15 that are not scored. You will not be told which questions are not scored.')).toBeInTheDocument();
    expect(screen.getByText('Pass mark: 70% of the 50 scored questions (35 of 50)')).toBeInTheDocument();
    expect(screen.getByText('Time limit: 90 minutes.')).toBeInTheDocument();
    if (status === 'done') expect(screen.getByText('You have already passed this exam. You can take it again.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: /Extra time/ }));
    expect(screen.getByText('Time limit: 120 minutes.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Start exam' }));
    await waitFor(() => expect(topic).toBe('capstone-exam-2'));
  });

  it('uses the localized exam topic title', async () => {
    const catalog = loadBundledCatalog();
    const env = await makeExamEnv([], { rawCatalog: { topics: catalog.topics, lessons: catalog.lessons, questions: catalog.questions } });
    renderWithI18n(ExamSetup, { services: env.services, appState: env.appState, groupIndex: null, capstoneTopicId: 'capstone-exam-1', onstarted: () => {} }, 'vi');
    expect(screen.getByRole('heading', { name: 'Capstone - Bài kiểm tra thứ nhất' })).toBeInTheDocument();
  });
});
