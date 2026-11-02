import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makePracticeEnv } from '@/testing/practice-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import type { SubmitResult } from '../index';
import PracticeResult from './PracticeResult.svelte';

const items: SubmitResult['items'] = [
  { questionId: 'q1', selected: ['A'], correct: ['A'], isCorrect: true, explanation: 'Because alpha.' },
  { questionId: 'q2', selected: ['C', 'A'], correct: ['B', 'A'], isCorrect: false },
  { questionId: 'q3', selected: [], correct: ['C'], isCorrect: false },
];

async function mount(result: SubmitResult, timedOut = false) {
  const env = await makePracticeEnv();
  const onback = vi.fn();
  const onretry = vi.fn();
  renderWithI18n(PracticeResult, { services: env.services, result, timedOut, canRetry: true, onback, onretry });
  return { onback, onretry };
}

describe('PracticeResult', () => {
  it('shows the score, the pass line and the threshold, and moves focus to the heading', async () => {
    await mount({ scorePct: 90, correct: 9, total: 10, passed: true, items });
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const heading = screen.getByRole('heading', { level: 1, name: 'Result' });
    expect(heading).toHaveFocus();
    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(screen.getByText('9 of 10 correct')).toBeInTheDocument();
    expect(screen.getByText('Passed! Next topic unlocked')).toBeInTheDocument();
    expect(screen.getByText('Pass mark: 80% or higher')).toBeInTheDocument();
  });

  it('shows the failing variant', async () => {
    await mount({ scorePct: 33, correct: 1, total: 3, passed: false, items });
    expect(screen.getByText('Not yet. Review and try again')).toBeInTheDocument();
    expect(screen.queryByText(/Passed!/)).not.toBeInTheDocument();
  });

  it('lists each question with mark and text, answers, and the explanation', async () => {
    await mount({ scorePct: 33, correct: 1, total: 3, passed: false, items });
    const rows = screen.getAllByRole('listitem').filter((li) => li.getAttribute('data-question'));
    expect(rows).toHaveLength(3);
    const first = within(rows[0]);
    expect(first.getByText('Pick the first?')).toBeInTheDocument();
    expect(first.getByText(/✓/)).toHaveTextContent('Correct');
    expect(first.getByText('Because alpha.')).toBeInTheDocument();
    const second = within(rows[1]);
    expect(second.getByText(/✗/)).toHaveTextContent('Incorrect');
    const lists = second.getAllByRole('list');
    expect(within(lists[0]).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Alpha', 'Charlie']);
    expect(within(lists[1]).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Alpha', 'Bravo']);
    expect(within(rows[2]).getByText('No answer')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Charlie')).toBeInTheDocument();
  });

  it('shows the automatic-submit message', async () => {
    await mount({ scorePct: 0, correct: 0, total: 3, passed: false, items }, true);
    expect(screen.getByText("Time's up, submitted automatically")).toBeInTheDocument();
  });

  it('offers back to the map and try again', async () => {
    const { onback, onretry } = await mount({ scorePct: 90, correct: 9, total: 10, passed: true, items });
    await userEvent.click(screen.getByRole('button', { name: 'Back to the map' }));
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onback).toHaveBeenCalledTimes(1);
    expect(onretry).toHaveBeenCalledTimes(1);
  });
});
