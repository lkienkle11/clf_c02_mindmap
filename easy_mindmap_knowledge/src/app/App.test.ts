import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makePracticeEnv } from '@/testing/practice-env';
import { makeExamEnv } from '@/testing/exam-env';
import { loadCatalog } from '@/content/load-catalog';
import { makeRawCatalog } from '@/testing/fixtures';
import type { SqlExecutor } from '@/persistence';
import { createI18n } from '@/i18n/i18n.svelte';
import { buildServices } from './composition';
import { AppState } from './app-state.svelte';
import App from './App.svelte';

// In-memory executor: jsdom cannot host node:sqlite, so every query returns no rows.
const emptyExecutor: SqlExecutor = { execute: async () => {}, select: async () => [] };

describe('App shell', () => {
  it('mounts the tree for the default view and a placeholder for the others', async () => {
    const services = buildServices({ executor: emptyExecutor, catalog: loadCatalog(makeRawCatalog()), now: () => 0 });
    const appState = new AppState(services);
    await appState.load();
    render(App, { services, appState, i18n: createI18n('en') });
    expect(screen.getByRole('heading', { name: 'Mindmap' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^cloud-concepts/ })).toBeInTheDocument();
    appState.open({ view: 'history' });
    expect(await screen.findByRole('heading', { name: 'History' })).toBeInTheDocument();
  });

  it('keeps <html lang> in step with the chosen UI language', async () => {
    const services = buildServices({ executor: emptyExecutor, catalog: loadCatalog(makeRawCatalog()), now: () => 0 });
    const appState = new AppState(services);
    await appState.load();
    const i18n = createI18n('vi');
    render(App, { services, appState, i18n });
    await waitFor(() => expect(document.documentElement.lang).toBe('vi'));
    i18n.setLocale('en');
    await waitFor(() => expect(document.documentElement.lang).toBe('en'));
  });

  it('shows a resume notice in the shared bottom-right notice stack', async () => {
    const env = await makePracticeEnv({
      inProgress: {
        attempt: {
          id: 'bad', kind: 'practice', topicId: 'compute', status: 'in_progress', startedAt: 0, submittedAt: null,
          submitReason: null, reviewAllowed: false, clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null, onHidden: 'freeze', onReport: 'freeze' },
          heartbeatAt: null, scorePct: null, passed: null, groupIndex: null, plannedCount: null, unansweredDisplay: 'reveal' as const,
        },
        questions: [],
      },
    });
    await env.appState.refresh();
    render(App, { services: env.services, appState: env.appState, i18n: createI18n('en') });
    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    const notice = await screen.findByText(/could not be restored and was discarded/);
    expect(notice.closest('[data-testid="notices"]')).not.toBeNull();
  });

  it('mounts the practice screen for the practice route', async () => {
    const env = await makePracticeEnv();
    env.appState.open({ view: 'practice', topicId: 'compute' });
    render(App, { services: env.services, appState: env.appState, i18n: createI18n('en') });
    expect(await screen.findByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  it('routes the checkpoint view to the exam screen', async () => {
    const env = await makeExamEnv(['cloud-concepts', 'global-infrastructure', 'compute']);
    env.appState.open({ view: 'checkpoint', groupIndex: 1 });
    render(App, { services: env.services, appState: env.appState, i18n: createI18n('en') });
    expect(await screen.findByRole('heading', { name: 'Checkpoint 1' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument();
  });

  it('renders the exam screen for the Capstone practice route', async () => {
    const env = await makeExamEnv([]);
    env.appState.open({ view: 'practice', topicId: 'capstone' });
    render(App, { services: env.services, appState: env.appState, i18n: createI18n('en') });
    expect(await screen.findByRole('heading', { name: 'Capstone exam' })).toBeInTheDocument();
  });

  it('a resumed in-progress checkpoint opens the checkpoint route', async () => {
    const attempt = {
      id: 'cp', kind: 'checkpoint' as const, topicId: null, status: 'in_progress' as const, startedAt: 0, submittedAt: null,
      submitReason: null, reviewAllowed: false, clock: { mode: 'run' as const, limitMs: 5_400_000, remainingMs: null, deadlineAt: 5_400_000, onHidden: 'run' as const, onReport: 'run' as const },
      heartbeatAt: null, scorePct: null, passed: null, groupIndex: 1, plannedCount: 3, unansweredDisplay: 'reveal' as const,
    };
    const questions = ['e0', 'e1', 'e2'].map((questionId, position) => ({
      attemptId: 'cp', position, questionId, optionOrder: ['A', 'B', 'C', 'D'], selected: [], isCorrect: null,
    }));
    const env = await makeExamEnv([], { inProgress: { attempt, questions }, now: () => 1000 });
    await env.appState.refresh();
    render(App, { services: env.services, appState: env.appState, i18n: createI18n('en') });
    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(env.appState.route).toEqual({ view: 'checkpoint', groupIndex: 1 }));
    expect(await screen.findByRole('navigation', { name: 'Questions' })).toBeInTheDocument();
  });

  it('offers to resume an unfinished attempt on top of the tree and continues into the session', async () => {
    const { env } = await mountWithUnfinished();
    const dlg = await screen.findByRole('dialog', { name: 'Unfinished attempt' });
    expect(screen.getByRole('heading', { name: 'Mindmap' })).toBeInTheDocument();
    await userEvent.click(within(dlg).getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(env.appState.route).toEqual({ view: 'practice', topicId: 'compute' }));
    expect(await screen.findByRole('navigation', { name: 'Questions' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('resume then Exit leaves no prompt for the discarded attempt', async () => {
    const { env } = await mountWithUnfinished();
    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    const watch = watchForPrompt();
    await userEvent.click(await screen.findByRole('button', { name: 'Exit' }));
    await userEvent.click(within(await screen.findByRole('dialog', { name: 'Exit this attempt?' })).getByRole('button', { name: 'Exit and discard' }));
    await waitFor(() => expect(env.appState.route).toEqual({ view: 'tree' }));
    await new Promise((r) => setTimeout(r, 20));
    expect(watch.seen()).toBe(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(env.appState.resumeAttempt).toBeNull();
  });

  it('Discard never brings the prompt back', async () => {
    const { env } = await mountWithUnfinished();
    const watch = watchForPrompt(true);
    await userEvent.click(await screen.findByRole('button', { name: 'Discard' }));
    await waitFor(() => expect(env.discarded).toEqual(['old']));
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    watch.stop();
  });

  it('resume, submit, result, back to the tree shows no prompt', async () => {
    const { env } = await mountWithUnfinished();
    await userEvent.click(await screen.findByRole('button', { name: 'Continue' }));
    const watch = watchForPrompt();
    await userEvent.click(await screen.findByRole('button', { name: 'Submit' }));
    await userEvent.click(within(await screen.findByRole('dialog', { name: 'Submit your answers?' })).getByRole('button', { name: 'Submit' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Back to the map' }));
    await waitFor(() => expect(env.appState.route).toEqual({ view: 'tree' }));
    await new Promise((r) => setTimeout(r, 20));
    expect(watch.seen()).toBe(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

async function mountWithUnfinished() {
  const attempt = {
    id: 'old', kind: 'practice' as const, topicId: 'compute', status: 'in_progress' as const, startedAt: 0, submittedAt: null,
    submitReason: null, reviewAllowed: false, clock: { mode: 'freeze' as const, limitMs: null, remainingMs: null, deadlineAt: null, onHidden: 'freeze' as const, onReport: 'freeze' as const },
    heartbeatAt: null, scorePct: null, passed: null, groupIndex: null, plannedCount: null, unansweredDisplay: 'reveal' as const,
  };
  const questions = ['q1', 'q2', 'q3'].map((questionId, position) => ({
    attemptId: 'old', position, questionId, optionOrder: ['A', 'B', 'C', 'D'], selected: [], isCorrect: null,
  }));
  const env = await makePracticeEnv({ inProgress: { attempt, questions } });
  await env.appState.refresh();
  render(App, { services: env.services, appState: env.appState, i18n: createI18n('en') });
  return { env };
}

/** Records whether the resume prompt ever (re)appears; `allowCurrent` ignores one already on screen. */
function watchForPrompt(allowCurrent = false) {
  let seen = false;
  const check = () => {
    const open = [...document.querySelectorAll('[role="dialog"]')].some((d) => d.textContent?.includes('unfinished attempt'));
    if (open && !allowCurrent) seen = true;
    if (!open) allowCurrent = false;
  };
  const observer = new MutationObserver(check);
  observer.observe(document.body, { childList: true, subtree: true });
  return { seen: () => seen, stop: () => observer.disconnect() };
}
