import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/svelte';
import { makePracticeEnv } from '@/testing/practice-env';
import { makeQuestion, makeRawCatalog } from '@/testing/fixtures';
import { renderWithI18n } from '@/testing/render-with-i18n';
import type { SubmitResult } from '@/features/practice';
import ExamBreakdown from './ExamBreakdown.svelte';

const item = (questionId: string, isCorrect: boolean): SubmitResult['items'][number] => ({
  questionId, selected: isCorrect ? ['A'] : ['B'], correct: ['A'], isCorrect,
});

async function mount(items: SubmitResult['items']) {
  const raw = makeRawCatalog();
  raw.questions = [
    makeQuestion({ id: 'c1', topicId: 'cloud-concepts' }),
    makeQuestion({ id: 'c2', topicId: 'cloud-concepts' }),
    makeQuestion({ id: 'g1', topicId: 'global-infrastructure' }),
    makeQuestion({ id: 'p1', topicId: 'compute' }),
    makeQuestion({ id: 'u1', topicId: null }),
  ];
  const env = await makePracticeEnv({ rawCatalog: raw });
  renderWithI18n(ExamBreakdown, { services: env.services, items });
}

function bodyRows(): HTMLElement[] {
  return within(screen.getByRole('table')).getAllByRole('row').slice(1);
}

describe('ExamBreakdown', () => {
  it('shows one row per topic with its own correct and total counts, in topic order', async () => {
    await mount([item('c1', true), item('c2', false), item('g1', false), item('p1', true)]);
    const rows = bodyRows();
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByRole('rowheader', { name: 'cloud-concepts' })).toBeInTheDocument();
    expect(within(rows[0]).getByText('1 of 2 correct')).toBeInTheDocument();
    expect(within(rows[1]).getByRole('rowheader', { name: 'global-infrastructure' })).toBeInTheDocument();
    expect(within(rows[1]).getByText('0 of 1 correct')).toBeInTheDocument();
    expect(within(rows[2]).getByRole('rowheader', { name: 'compute' })).toBeInTheDocument();
    expect(within(rows[2]).getByText('1 of 1 correct')).toBeInTheDocument();
  });

  it('row correct counts add up to the correct answers on topic questions; unassigned questions get no row', async () => {
    await mount([item('c1', true), item('c2', true), item('g1', false), item('p1', false), item('u1', true)]);
    const correctShown = bodyRows().reduce((sum, row) => {
      const match = /^(\d+) of \d+ correct$/.exec(within(row).getAllByRole('cell')[0].textContent ?? '');
      return sum + Number(match?.[1] ?? NaN);
    }, 0);
    expect(correctShown).toBe(2);
    expect(bodyRows()).toHaveLength(3);
    expect(screen.queryByText(/u1|unassigned/i)).not.toBeInTheDocument();
  });
});
