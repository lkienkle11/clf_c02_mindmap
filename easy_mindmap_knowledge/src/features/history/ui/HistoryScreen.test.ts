import { describe, expect, it } from 'vitest';
import { screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makeAttempt, makeHistoryEnv, makeRow } from '@/testing/history-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import HistoryScreen from './HistoryScreen.svelte';

const D = Date.UTC(2026, 5, 1, 12);
const attempts = [
  makeAttempt('a1', { topicId: 'compute', scorePct: 90, passed: true, submittedAt: D }),
  makeAttempt('a2', { topicId: 'compute', scorePct: 50, passed: false, submittedAt: D + 1 * 3_600_000 }),
  makeAttempt('a3', { kind: 'review', topicId: null, scorePct: 70, passed: null, submittedAt: D + 2 * 3_600_000 }),
  makeAttempt('a4', { topicId: 'storage', scorePct: 40, passed: false, submittedAt: D + 3 * 3_600_000 }),
];
const rows = {
  a1: [makeRow('a1', 0, { questionId: 'q1' })],
  a2: [makeRow('a2', 0, { questionId: 'q1', selected: ['B'], isCorrect: false }), makeRow('a2', 1, { questionId: 'q2', selected: [], isCorrect: false })],
  a3: [makeRow('a3', 0, { questionId: 'q1', selected: ['C'], isCorrect: false })],
  a4: [makeRow('a4', 0, { questionId: 'q3', selected: ['A'], isCorrect: false })],
};
const when = (at: number) => new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(at);

async function mount(o: Parameters<typeof makeHistoryEnv>[0] = {}, route?: { view: 'history'; topicId?: string }) {
  const env = await makeHistoryEnv({ attempts, rows, ...o });
  await env.appState.refresh();
  if (route) env.appState.open(route);
  const view = renderWithI18n(HistoryScreen, { services: env.services, appState: env.appState });
  return { ...env, ...view };
}

describe('HistoryScreen', () => {
  it('shows a loading state until the question rows arrive', async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    await mount({ gate });
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
    release();
    expect(await screen.findByRole('table', { name: 'Attempts' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an empty state with a way back to the map', async () => {
    const { appState } = await mount({ attempts: [], rows: {} });
    expect(await screen.findByText('No attempts yet')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Go to the mindmap' }));
    expect(appState.route).toEqual({ view: 'tree' });
  });

  it('shows an error with Retry that loads again', async () => {
    const { rowsState } = await mount({ failRowsTimes: 1 });
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load your history.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('table', { name: 'Attempts' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(rowsState.calls).toBe(2);
  });

  it('fills the chart, table, weak topics and most-missed questions', async () => {
    await mount();
    const table = await screen.findByRole('table', { name: 'Attempts' });
    const body = within(table).getAllByRole('row').slice(1);
    expect(body).toHaveLength(4);
    // newest first
    expect(within(body[0]).getByRole('button', { name: when(D + 3 * 3_600_000) })).toBeInTheDocument();
    expect(within(body[0]).getByText('storage')).toBeInTheDocument();
    expect(within(body[0]).getByText('40%')).toBeInTheDocument();
    expect(within(body[0]).getByText('✗ Not passed')).toBeInTheDocument();
    expect(within(body[1]).getByText('Mixed review')).toBeInTheDocument();
    expect(within(body[1]).getByText('Review')).toBeInTheDocument();
    expect(within(body[1]).queryByText(/passed/i)).not.toBeInTheDocument();
    expect(within(body[3]).getByText('✓ Passed')).toBeInTheDocument();
    expect(screen.getAllByTestId('score-marker')).toHaveLength(4);

    const weak = screen.getByRole('region', { name: 'Topics needing attention' });
    const weakItems = within(weak).getAllByRole('listitem');
    expect(weakItems[0]).toHaveTextContent('storage');
    expect(weakItems[0]).toHaveTextContent('40%');
    expect(weakItems[1]).toHaveTextContent('compute');
    expect(weakItems[1]).toHaveTextContent('70%');

    const missed = screen.getByRole('region', { name: 'Most-missed questions' });
    const missedItems = within(missed).getAllByRole('listitem');
    expect(missedItems[0]).toHaveTextContent('Pick the first?');
    expect(missedItems[0]).toHaveTextContent('Missed 2 out of 3');
  });

  it('shows the attempts only once, as the one table on the screen', async () => {
    await mount({ attempts: attempts.slice(0, 3) });
    await screen.findByRole('table', { name: 'Attempts' });
    expect(screen.getAllByRole('table')).toHaveLength(1);
  });

  it('filters by topic with a chip that can be removed', async () => {
    const { appState } = await mount({}, { view: 'history', topicId: 'storage' });
    const table = await screen.findByRole('table', { name: 'Attempts' });
    expect(within(table).getAllByRole('row')).toHaveLength(2);
    expect(screen.getByText('Topic: storage')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove filter: storage' }));
    expect(appState.route).toEqual({ view: 'history' });
    await waitFor(() => expect(within(screen.getByRole('table', { name: 'Attempts' })).getAllByRole('row')).toHaveLength(5));
    expect(screen.queryByText('Topic: storage')).not.toBeInTheDocument();
  });

  it('opens the attempt detail from a row', async () => {
    await mount();
    await userEvent.click(await screen.findByRole('button', { name: when(D + 1 * 3_600_000) }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getAllByRole('listitem').filter((l) => l.getAttribute('data-question'))).toHaveLength(2);
    expect(within(dialog).getByText('No answer')).toBeInTheDocument();
  });

  it('loads the question rows of all shown attempts with ONE bulk call, never per attempt', async () => {
    const { rowsState } = await mount();
    await screen.findByRole('table', { name: 'Attempts' });
    expect(rowsState.calls).toBe(1);
    expect(rowsState.perAttemptCalls).toBe(0);
    expect([...rowsState.requested[0]].sort()).toEqual(['a1', 'a2', 'a3', 'a4']);
  });

  it('with a topic filter, loads only the rows of the attempts of that topic', async () => {
    const { rowsState, appState } = await mount({}, { view: 'history', topicId: 'storage' });
    await screen.findByRole('table', { name: 'Attempts' });
    expect(rowsState.requested).toEqual([['a4']]);
    appState.open({ view: 'history' });
    await waitFor(() => expect(rowsState.requested).toHaveLength(2));
    expect([...rowsState.requested[1]].sort()).toEqual(['a1', 'a2', 'a3']); // a4 is already loaded
  });
});
