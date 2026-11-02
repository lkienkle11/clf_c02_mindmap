import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makeAttempt, makeRow } from '@/testing/history-env';
import { makePracticeEnv } from '@/testing/practice-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import AttemptDetail from './AttemptDetail.svelte';

const rows = [
  makeRow('a2', 0, { questionId: 'q1', optionOrder: ['B', 'A', 'C', 'D'], selected: ['B'], isCorrect: false }),
  makeRow('a2', 1, { questionId: 'q2', optionOrder: ['D', 'C', 'B', 'A'], selected: ['A', 'B'], isCorrect: true }),
  makeRow('a2', 2, { questionId: 'q3', selected: [], isCorrect: false }),
];

async function mount(over: Record<string, unknown> = {}) {
  const env = await makePracticeEnv();
  const onclose = vi.fn();
  const attempt = makeAttempt('a2', { scorePct: 33, passed: false });
  renderWithI18n(AttemptDetail, { services: env.services, attempt, rows, onclose, ...over });
  return { onclose };
}

describe('AttemptDetail', () => {
  it('lists every question with a mark by isCorrect and the answer texts', async () => {
    await mount();
    const dialog = screen.getByRole('dialog');
    const items = within(dialog).getAllByRole('listitem').filter((li) => li.getAttribute('data-question'));
    expect(items).toHaveLength(3);
    expect(within(items[0]).getByText(/✗/)).toHaveTextContent('Incorrect');
    expect(within(items[0]).getByText('Pick the first?')).toBeInTheDocument();
    const lists0 = within(items[0]).getAllByRole('list');
    expect(within(lists0[0]).getAllByRole('listitem').map((l) => l.textContent)).toEqual(['Bravo']);
    expect(within(lists0[1]).getAllByRole('listitem').map((l) => l.textContent)).toEqual(['Alpha']);
    expect(within(items[0]).getByText('Because alpha.')).toBeInTheDocument();
    expect(within(items[1]).getByText(/✓/)).toHaveTextContent('Correct');
    // the stored option order decides the order of the texts
    const lists1 = within(items[1]).getAllByRole('list');
    expect(within(lists1[0]).getAllByRole('listitem').map((l) => l.textContent)).toEqual(['Bravo', 'Alpha']);
  });

  it('shows "No answer" for an unanswered question', async () => {
    await mount();
    const items = screen.getAllByRole('listitem').filter((li) => li.getAttribute('data-question'));
    expect(within(items[2]).getByText('No answer')).toBeInTheDocument();
    expect(within(items[2]).getByText('Charlie')).toBeInTheDocument();
  });

  it('says so when no questions were recorded, and closes', async () => {
    const { onclose } = await mount({ rows: [] });
    expect(screen.getByText('No questions were recorded for this attempt.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onclose).toHaveBeenCalled();
  });

  it('marks the English question content with lang="en"', async () => {
    await mount();
    const item = within(screen.getByRole('dialog')).getAllByRole('listitem').filter((li) => li.getAttribute('data-question'))[0];
    expect(within(item).getByText('Pick the first?').closest('[lang="en"]')).not.toBeNull();
    expect(within(item).getByText('Your answer').closest('[lang="en"]')).toBeNull();
  });
});
