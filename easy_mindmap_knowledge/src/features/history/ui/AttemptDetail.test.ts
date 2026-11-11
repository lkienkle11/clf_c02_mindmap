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

/** The per-question list items of the dialog (the option items carry data-option instead). */
const recordedItems = () =>
  within(screen.getByRole('dialog')).getAllByRole('listitem').filter((li) => li.getAttribute('data-question'));
const optionKeys = (item: HTMLElement) =>
  Array.from(item.querySelectorAll('li[data-option]')).map((li) => (li as HTMLElement).dataset.option);
const optionOf = (item: HTMLElement, key: string) =>
  within(item.querySelector(`li[data-option="${key}"]`) as HTMLElement);

describe('AttemptDetail', () => {
  it('lists every option of each recorded question in the stored order, with picked and correct badges', async () => {
    await mount();
    const items = recordedItems();
    expect(items).toHaveLength(3);
    expect(within(items[0]).getByText('✗ Incorrect')).toBeInTheDocument();
    expect(within(items[0]).getByText('Pick the first?')).toBeInTheDocument();
    // q1: stored order B, A, C, D; picked B (wrong), correct A
    expect(optionKeys(items[0])).toEqual(['B', 'A', 'C', 'D']);
    expect(optionOf(items[0], 'B').getByText('Your answer · Incorrect')).toBeInTheDocument();
    expect(optionOf(items[0], 'A').getByText('Correct answer')).toBeInTheDocument();
    expect(optionOf(items[0], 'C').queryByText(/answer/i)).not.toBeInTheDocument();
    expect(within(items[0]).getByText('Because alpha.')).toBeInTheDocument();
    expect(within(items[1]).getByText('✓ Correct')).toBeInTheDocument();
    // q2: stored order D, C, B, A; picked A and B, both correct
    expect(optionKeys(items[1])).toEqual(['D', 'C', 'B', 'A']);
    expect(optionOf(items[1], 'A').getByText('Your answer · Correct')).toBeInTheDocument();
    expect(optionOf(items[1], 'B').getByText('Your answer · Correct')).toBeInTheDocument();
    expect(optionOf(items[1], 'C').queryByText(/answer/i)).not.toBeInTheDocument();
  });

  it('shows "No answer" and the correct option for an unanswered question', async () => {
    await mount();
    const items = recordedItems();
    expect(within(items[2]).getByText('No answer')).toBeInTheDocument();
    expect(optionKeys(items[2])).toEqual(['A', 'B', 'C', 'D']);
    expect(optionOf(items[2], 'C').getByText('Correct answer')).toBeInTheDocument();
  });

  it('shows the question id and no options when the question is missing from the catalog', async () => {
    await mount({ rows: [makeRow('a2', 0, { questionId: 'gone', selected: ['A'], isCorrect: false })] });
    const items = recordedItems();
    expect(items).toHaveLength(1);
    expect(within(items[0]).getByText('gone')).toBeInTheDocument();
    expect(within(items[0]).getByText('✗ Incorrect')).toBeInTheDocument();
    expect(optionKeys(items[0])).toEqual([]);
  });

  it('says so when no questions were recorded, and closes', async () => {
    const { onclose } = await mount({ rows: [] });
    expect(screen.getByText('No questions were recorded for this attempt.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onclose).toHaveBeenCalled();
  });

  it('marks the English question and option content with lang="en"', async () => {
    await mount();
    const item = recordedItems()[0];
    expect(within(item).getByText('Pick the first?').closest('[lang="en"]')).not.toBeNull();
    expect(within(item).getByText('Alpha').closest('[lang="en"]')).not.toBeNull();
  });

  it('follows the attempt\'s unansweredDisplay: answersOnly hides correct marking and explanation of unanswered questions only', async () => {
    const unanswered = [
      makeRow('a2', 0, { questionId: 'q1', selected: [], isCorrect: false }),
      makeRow('a2', 1, { questionId: 'q2', optionOrder: ['D', 'C', 'B', 'A'], selected: ['C'], isCorrect: false }),
    ];
    await mount({ rows: unanswered, attempt: makeAttempt('a2', { scorePct: 0, passed: false, unansweredDisplay: 'answersOnly' }) });
    const [first, second] = recordedItems();
    expect(within(first).queryByText('Correct answer')).not.toBeInTheDocument();
    expect(within(first).queryByText('Because alpha.')).not.toBeInTheDocument();
    expect(within(second).getAllByText('Correct answer').length).toBeGreaterThan(0);
  });

  it('shows the explanation of an unanswered question when the attempt is reveal', async () => {
    await mount({ rows: [makeRow('a2', 0, { questionId: 'q1', selected: [], isCorrect: false })] });
    expect(within(recordedItems()[0]).getByText('Because alpha.')).toBeInTheDocument();
  });
});
