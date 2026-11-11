import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { makeExamEnv } from '@/testing/exam-env';
import type { AttemptRow } from '@/persistence';
import { makeQuestion, makeRawCatalog, makeTopics } from '@/testing/fixtures';
import { checkpointGroups } from '../logic/groups';
import { startCheckpoint } from '../start-exam';
import ExamScreen from './ExamScreen.svelte';

const GROUP1 = ['cloud-concepts', 'global-infrastructure', 'compute'];

/** A submitted, passed practice attempt: what makes a topic completed in the app's own state. */
const passedTopic = (topicId: string): AttemptRow => ({
  id: `p-${topicId}`, kind: 'practice', topicId, status: 'submitted', startedAt: 0, submittedAt: 1, submitReason: 'manual',
  reviewAllowed: false, clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null, onHidden: 'freeze', onReport: 'freeze' },
  heartbeatAt: null, scorePct: 100, passed: true, groupIndex: null, plannedCount: null, unansweredDisplay: 'reveal',
});

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

  it('shows the exam result after submitting and Try again returns to setup', async () => {
    await startExam();
    await userEvent.click(await screen.findByRole('button', { name: 'Submit' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Submit' }));
    expect(await screen.findByRole('heading', { name: 'Exam result' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('button', { name: 'Start exam' })).toBeInTheDocument();
  });

  it('the Start after Try again draws a new attempt with a new id', async () => {
    const env = await makeExamEnv(GROUP1, { submitted: GROUP1.map(passedTopic) });
    env.appState.open({ view: 'checkpoint', groupIndex: 1 });
    renderWithI18n(ExamScreen, { services: env.services, appState: env.appState, groupIndex: 1 });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Start exam' })).toBeEnabled());
    await userEvent.click(screen.getByRole('button', { name: 'Start exam' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Submit' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Submit' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    const start = await screen.findByRole('button', { name: 'Start exam' });
    await waitFor(() => expect(start).toBeEnabled());
    await userEvent.click(start);
    expect(await screen.findByRole('timer')).toBeInTheDocument();
    await waitFor(() => expect(env.created).toHaveLength(2));
    expect(env.created[1]).not.toBe(env.created[0]);
  });

  it('a first pass of a checkpoint shows the group unlock notice and the breakdown by topic', async () => {
    const env = await makeExamEnv(GROUP1);
    const s = await startCheckpoint(env.services, 1, { extraTime: false }, () => env.appState.refresh());
    const byId = new Map(env.services.catalog.questions.map((q) => [q.id, q]));
    for (const q of s.questions) await s.select(q.position, byId.get(q.questionId)!.correct);
    renderWithI18n(ExamScreen, { services: env.services, appState: env.appState, groupIndex: 1, initialSession: s });
    await s.submit('manual');
    expect(await screen.findByText('Passed!')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Next group unlocked');
    expect(screen.queryByText('Next topic unlocked')).not.toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'compute' })).toBeInTheDocument();
  });

  it('a retake of a checkpoint that was already passed shows no unlock notice', async () => {
    const env = await makeExamEnv(GROUP1);
    env.appState.passedGroups = new Set([1]);
    const s = await startCheckpoint(env.services, 1, { extraTime: false }, () => env.appState.refresh());
    const byId = new Map(env.services.catalog.questions.map((q) => [q.id, q]));
    for (const q of s.questions) await s.select(q.position, byId.get(q.questionId)!.correct);
    renderWithI18n(ExamScreen, { services: env.services, appState: env.appState, groupIndex: 1, initialSession: s });
    await s.submit('manual');
    expect(await screen.findByText('Passed!')).toBeInTheDocument();
    expect(screen.queryByText('Next group unlocked')).not.toBeInTheDocument();
  });

  it('the last group\'s first pass says the Capstone exam is unlocked, not the next group', async () => {
    const last = checkpointGroups(makeTopics()).at(-1)!;
    expect(last.index).toBe(4);
    const rawCatalog = makeRawCatalog();
    rawCatalog.questions = Array.from({ length: 15 }, (_, i) => makeQuestion({ id: `l${i}`, topicId: last.topicIds[i % last.topicIds.length] }));
    const env = await makeExamEnv(last.topicIds, { rawCatalog });
    const s = await startCheckpoint(env.services, last.index, { extraTime: false }, () => env.appState.refresh());
    const byId = new Map(env.services.catalog.questions.map((q) => [q.id, q]));
    for (const q of s.questions) await s.select(q.position, byId.get(q.questionId)!.correct);
    renderWithI18n(ExamScreen, { services: env.services, appState: env.appState, groupIndex: last.index, initialSession: s });
    await s.submit('manual');
    expect(await screen.findByText('Passed!')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Capstone exam unlocked');
    expect(screen.queryByText('Next group unlocked')).not.toBeInTheDocument();
  });
});
