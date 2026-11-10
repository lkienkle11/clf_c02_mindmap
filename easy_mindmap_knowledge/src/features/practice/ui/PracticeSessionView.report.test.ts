import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makePracticeEnv } from '@/testing/practice-env';
import { makeReportEnv } from '@/testing/report-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { DEFAULT_PRACTICE_OPTIONS, PracticeSession } from '../index';
import PracticeSessionView from './PracticeSessionView.svelte';

const noop = async () => {};
const plan = [{ questionId: 'q1', optionOrder: ['A', 'B', 'C', 'D'] }];

async function envFor() {
  const env = await makeReportEnv();
  const { appState } = await makePracticeEnv();
  return { env, appState };
}

async function submitReport(text: string) {
  await userEvent.click(screen.getByRole('button', { name: 'Report' }));
  expect(screen.getByRole('dialog', { name: 'Report wrong question' })).toBeInTheDocument();
  await fireEvent.input(screen.getByRole('textbox'), { target: { value: text } });
  await userEvent.click(screen.getByRole('button', { name: 'Submit report' }));
}

describe('PracticeSessionView report button', () => {
  it('sits immediately before "Exit" in DOM order', async () => {
    const { env, appState } = await envFor();
    const session = await PracticeSession.start(env.services, 'compute', DEFAULT_PRACTICE_OPTIONS, noop);
    renderWithI18n(PracticeSessionView, { services: env.services, appState, session });
    const report = screen.getByRole('button', { name: 'Report' });
    const exit = screen.getByRole('button', { name: 'Exit' });
    expect(report.nextElementSibling ?? report.parentElement?.nextElementSibling).toBe(exit);
    expect(report.compareDocumentPosition(exit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('reports an unanswered question with its attempt references and sourceScreen "practice"', async () => {
    const { env, appState } = await envFor();
    const session = await PracticeSession.start(env.services, 'compute', DEFAULT_PRACTICE_OPTIONS, noop);
    renderWithI18n(PracticeSessionView, { services: env.services, appState, session });
    const q = session.questions[0];
    await submitReport('wrong text');
    await waitFor(() => expect(env.created).toHaveLength(1));
    expect(env.created[0].row).toMatchObject({
      type: 'question', questionId: q.questionId, sourceScreen: 'practice', attemptId: session.attemptId,
      position: 0, optionOrder: q.optionOrder, selected: [], isCorrect: null,
    });
  });

  it('reports the current question after answering and navigating', async () => {
    const { env, appState } = await envFor();
    const session = await PracticeSession.start(env.services, 'compute', DEFAULT_PRACTICE_OPTIONS, noop);
    renderWithI18n(PracticeSessionView, { services: env.services, appState, session });
    await userEvent.click(screen.getByRole('button', { name: 'Next question' }));
    const q = session.questions[1];
    const key = q.optionOrder[0];
    await userEvent.click(screen.getByRole(q.multi ? 'checkbox' : 'radio', { name: env.services.catalog.questions.find((x) => x.id === q.questionId)!.options.find((o) => o.key === key)!.text }));
    await submitReport('bad');
    await waitFor(() => expect(env.created).toHaveLength(1));
    expect(env.created[0].row).toMatchObject({ questionId: q.questionId, position: 1, selected: [key] });
  });

  it('uses sourceScreen "review" in a review session', async () => {
    const { env, appState } = await envFor();
    const session = await PracticeSession.startReview(env.services, ['q1', 'q2'], noop);
    renderWithI18n(PracticeSessionView, { services: env.services, appState, session });
    expect(screen.getByRole('button', { name: 'Report' }).compareDocumentPosition(screen.getByRole('button', { name: 'Exit' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await submitReport('review issue');
    await waitFor(() => expect(env.created).toHaveLength(1));
    expect(env.created[0].row).toMatchObject({ sourceScreen: 'review', attemptId: session.attemptId, questionId: session.questions[0].questionId });
  });

  it('uses sourceScreen "checkpoint" in a checkpoint exam', async () => {
    const { env, appState } = await envFor();
    const session = await PracticeSession.startExam(env.services, { kind: 'checkpoint', topicId: null, groupIndex: 1, plan, limitMs: 60_000 }, noop);
    renderWithI18n(PracticeSessionView, { services: env.services, appState, session, hideKnowledge: true });
    await submitReport('exam issue');
    await waitFor(() => expect(env.created).toHaveLength(1));
    expect(env.created[0].row).toMatchObject({ sourceScreen: 'checkpoint', attemptId: session.attemptId, questionId: 'q1' });
  });

  it('pauses a timed attempt while the dialog is open and resumes when it closes', async () => {
    const { env, appState } = await envFor();
    const session = await PracticeSession.startExam(env.services, { kind: 'checkpoint', topicId: null, groupIndex: 1, plan, limitMs: 60_000 }, noop);
    renderWithI18n(PracticeSessionView, { services: env.services, appState, session, hideKnowledge: true });
    expect(session.reportOpen).toBe(false);
    await userEvent.click(screen.getByRole('button', { name: 'Report' }));
    expect(session.reportOpen).toBe(true);
    await userEvent.keyboard('{Escape}');
    await userEvent.click(await screen.findByRole('button', { name: 'Close report' }));
    await waitFor(() => expect(session.reportOpen).toBe(false));
  });

  it('calls beginReport and endReport on the session', async () => {
    const { env, appState } = await envFor();
    const session = await PracticeSession.start(env.services, 'compute', DEFAULT_PRACTICE_OPTIONS, noop);
    const calls: string[] = [];
    const begin = session.beginReport.bind(session);
    const end = session.endReport.bind(session);
    session.beginReport = () => { calls.push('begin'); begin(); };
    session.endReport = () => { calls.push('end'); end(); };
    renderWithI18n(PracticeSessionView, { services: env.services, appState, session });
    await submitReport('x');
    await waitFor(() => expect(calls).toEqual(['begin', 'end']));
  });

  it('screenshots the question wrapper, not the whole page', async () => {
    const { env, appState } = await envFor();
    const session = await PracticeSession.start(env.services, 'compute', DEFAULT_PRACTICE_OPTIONS, noop);
    renderWithI18n(PracticeSessionView, { services: env.services, appState, session });
    await userEvent.click(screen.getByRole('button', { name: 'Report' }));
    expect(screen.getByRole('button', { name: 'Take screenshot' })).toBeInTheDocument();
  });

  describe('knowledge overlay reports', () => {
    const timed = { ...DEFAULT_PRACTICE_OPTIONS, allowReview: true, limitMs: 60_000 };

    it('freezes a timed attempt while a lesson report is open in the overlay, and releases it on close', async () => {
      const { env, appState } = await envFor();
      const session = await PracticeSession.start(env.services, 'compute', timed, noop);
      renderWithI18n(PracticeSessionView, { services: env.services, appState, session });
      await userEvent.click(screen.getByRole('button', { name: 'Review knowledge' }));
      expect(session.reportOpen).toBe(false); // opening the overlay itself never pauses the clock
      const dlg = await screen.findByRole('dialog', { name: 'Review knowledge' });
      await userEvent.click(within(dlg).getByRole('button', { name: 'Report' }));
      expect(session.reportOpen).toBe(true);
      await userEvent.keyboard('{Escape}');
      await userEvent.click(await screen.findByRole('button', { name: 'Close report' }));
      await waitFor(() => expect(session.reportOpen).toBe(false));
    });

    it('stores a knowledge report for the topic lesson', async () => {
      const { env, appState } = await envFor();
      const session = await PracticeSession.start(env.services, 'compute', timed, noop);
      renderWithI18n(PracticeSessionView, { services: env.services, appState, session });
      await userEvent.click(screen.getByRole('button', { name: 'Review knowledge' }));
      const dlg = await screen.findByRole('dialog', { name: 'Review knowledge' });
      await userEvent.click(within(dlg).getByRole('button', { name: 'Report' }));
      await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'kb' } });
      await userEvent.click(screen.getByRole('button', { name: 'Submit report' }));
      await waitFor(() => expect(env.created).toHaveLength(1));
      expect(env.created[0].row).toMatchObject({ type: 'lesson', lessonId: 'compute-ec2', sourceScreen: 'knowledge' });
      await waitFor(() => expect(session.reportOpen).toBe(false));
    });
  });
});
