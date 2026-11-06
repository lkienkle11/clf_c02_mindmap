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

async function mount(result: SubmitResult, timedOut = false, extra: Record<string, unknown> = {}) {
  const env = await makePracticeEnv();
  const onback = vi.fn();
  const onretry = vi.fn();
  renderWithI18n(PracticeResult, { services: env.services, result, timedOut, canRetry: true, onback, onretry, ...extra });
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
    expect(screen.getByText('Passed!')).toBeInTheDocument();
    expect(screen.queryByText(/unlocked/)).not.toBeInTheDocument();
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
    expect(first.getAllByText(/✓/)[0]).toHaveTextContent('Correct');
    expect(first.getByText('Because alpha.')).toBeInTheDocument();
    const second = within(rows[1]);
    expect(second.getAllByText(/✗/)[0]).toHaveTextContent('Incorrect');
    expect(second.getAllByRole('listitem')).toHaveLength(4);
    expect(within(rows[2]).getByText('No answer')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Correct answer')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Charlie')).toBeInTheDocument();
  });

  it('shows no empty paragraph for a question missing from the catalog', async () => {
    await mount({
      scorePct: 0,
      correct: 0,
      total: 2,
      passed: false,
      items: [
        { questionId: 'gone-1', selected: [], correct: ['A'], isCorrect: false },
        { questionId: 'gone-2', selected: ['B'], correct: ['A'], isCorrect: false, explanation: 'Kept note.' },
      ],
    });
    const [bare, noted] = screen.getAllByRole('listitem').filter((li) => li.getAttribute('data-question'));
    expect(within(bare).getByText('No answer')).toBeInTheDocument();
    expect(Array.from(bare.querySelectorAll('p')).filter((p) => p.textContent?.trim() === '')).toHaveLength(0);
    expect(within(noted).getByText('Kept note.')).toBeInTheDocument();
    expect(within(noted).queryByText('No answer')).not.toBeInTheDocument();
  });

  it('lists every option of each item with badges', async () => {
    await mount({ scorePct: 33, correct: 1, total: 3, passed: false, items: [{ ...items[1], optionOrder: ['D', 'C', 'B', 'A'] }] });
    const opts = Array.from(document.querySelectorAll('li[data-option]')) as HTMLElement[];
    expect(opts.map((o) => o.dataset.option)).toEqual(['D', 'C', 'B', 'A']);
    expect(within(opts[1]).getByText('Your answer · Incorrect')).toBeInTheDocument();
    expect(within(opts[3]).getByText('Your answer · Correct')).toBeInTheDocument();
    expect(within(opts[2]).getByText('Correct answer')).toBeInTheDocument();
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

  it('adds the unlock line only when this pass unlocked the next topic', async () => {
    await mount({ scorePct: 90, correct: 9, total: 10, passed: true, items }, false, { unlocked: true });
    expect(screen.getByText('Passed!')).toBeInTheDocument();
    expect(screen.getByText('Next topic unlocked')).toBeInTheDocument();
  });

  it('marks the English question content with lang="en" (the UI may be Vietnamese)', async () => {
    await mount({ scorePct: 33, correct: 1, total: 3, passed: false, items });
    const row = screen.getAllByRole('listitem').filter((li) => li.getAttribute('data-question'))[0];
    expect(within(row).getByText('Pick the first?').closest('[lang="en"]')).not.toBeNull();
    expect(within(row).getByText('Because alpha.').closest('[lang="en"]')).not.toBeNull();
    expect(within(row).getAllByText('Alpha')[0].closest('[lang="en"]')).not.toBeNull();
    expect(within(row).getByText('Options').closest('[lang="en"]')).toBeNull();
  });
});

describe('PracticeResult in exam mode', () => {
  it('uses the exam title, the 80% pass line, and never the unlock line', async () => {
    await mount({ scorePct: 90, correct: 9, total: 10, passed: true, items }, false, { mode: 'exam', unlocked: true });
    expect(screen.getByRole('heading', { level: 1, name: 'Exam result' })).toBeInTheDocument();
    expect(screen.getByText('Passed!')).toBeInTheDocument();
    expect(screen.getByText('Pass mark: 80% or higher')).toBeInTheDocument();
    expect(screen.queryByText('Next topic unlocked')).not.toBeInTheDocument();
  });

  it('shows "not passed" at 79%', async () => {
    await mount({ scorePct: 79, correct: 79, total: 100, passed: false, items }, false, { mode: 'exam' });
    expect(screen.getByText('Not yet. Review and try again')).toBeInTheDocument();
    expect(screen.queryByText('Passed!')).not.toBeInTheDocument();
  });

  it('shows "passed" at 80%', async () => {
    await mount({ scorePct: 80, correct: 80, total: 100, passed: true, items }, false, { mode: 'exam' });
    expect(screen.getByText('Passed!')).toBeInTheDocument();
    expect(screen.queryByText('Not yet. Review and try again')).not.toBeInTheDocument();
  });

  it('keeps the retry button, which calls the retry callback supplied by the caller', async () => {
    const { onretry } = await mount({ scorePct: 33, correct: 1, total: 3, passed: false, items }, false, { mode: 'exam' });
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onretry).toHaveBeenCalledTimes(1);
  });
});

describe('PracticeResult notice', () => {
  it('shows the notice as a status line under the pass line', async () => {
    await mount({ scorePct: 90, correct: 9, total: 10, passed: true, items }, false, { mode: 'exam', notice: 'Next group unlocked' });
    expect(screen.getByRole('status')).toHaveTextContent('Next group unlocked');
  });

  it('shows no status line without a notice', async () => {
    await mount({ scorePct: 90, correct: 9, total: 10, passed: true, items });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
