import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makeReportEnv } from '@/testing/report-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import type { SubmitResult } from '../index';
import PracticeResult from './PracticeResult.svelte';

const items: SubmitResult['items'] = [
  { questionId: 'q1', selected: ['A'], correct: ['A'], isCorrect: true, optionOrder: ['A', 'B', 'C', 'D'] },
  { questionId: 'q2', selected: ['C', 'A'], correct: ['B', 'A'], isCorrect: false, optionOrder: ['D', 'C', 'B', 'A'] },
  { questionId: 'q3', selected: [], correct: ['C'], isCorrect: false, optionOrder: ['A', 'B', 'C', 'D'] },
];
const result: SubmitResult = { scorePct: 33, correct: 1, total: 3, passed: false, items };

async function mount() {
  const env = await makeReportEnv();
  renderWithI18n(PracticeResult, { services: env.services, result, attemptId: 'att-9', onback: () => {} });
  return env;
}
const entry = (id: string) => document.querySelector(`li[data-question="${id}"]`) as HTMLElement;

describe('PracticeResult report buttons', () => {
  it('has one Report button per question (correct, wrong and unanswered)', async () => {
    await mount();
    for (const id of ['q1', 'q2', 'q3']) expect(within(entry(id)).getAllByRole('button', { name: 'Report' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Report' })).toHaveLength(4);
  });

  it.each([
    ['q1', 0, ['A'], true, ['A', 'B', 'C', 'D']],
    ['q2', 1, ['C', 'A'], false, ['D', 'C', 'B', 'A']],
    ['q3', 2, [], false, ['A', 'B', 'C', 'D']],
  ] as const)('reports %s with its attempt references', async (id, position, selected, isCorrect, optionOrder) => {
    const env = await mount();
    await userEvent.click(within(entry(id)).getByRole('button', { name: 'Report' }));
    expect(screen.getByRole('dialog', { name: 'Report wrong question' })).toBeInTheDocument();
    await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'issue' } });
    await userEvent.click(screen.getByRole('button', { name: 'Submit report' }));
    await waitFor(() => expect(env.created).toHaveLength(1));
    expect(env.created[0].row).toMatchObject({
      type: 'question', questionId: id, sourceScreen: 'result', attemptId: 'att-9', position, selected, isCorrect, optionOrder,
    });
  });

  describe('attempt report button', () => {
    const bar = () => screen.getByRole('button', { name: 'Back to the map' }).parentElement as HTMLElement;

    it('sits in the bottom bar after Back to the map and Try again', async () => {
      const env = await makeReportEnv();
      renderWithI18n(PracticeResult, { services: env.services, result, attemptId: 'att-9', onback: () => {}, canRetry: true, onretry: () => {} });
      const buttons = within(bar()).getAllByRole('button').map((b) => b.textContent?.trim());
      expect(buttons).toEqual(['Back to the map', 'Try again', 'Report']);
    });

    it.each(['practice', 'exam', 'review'] as const)('is shown in %s mode and files an attempt report', async (mode) => {
      const env = await makeReportEnv();
      renderWithI18n(PracticeResult, { services: env.services, result, attemptId: 'att-9', onback: () => {}, mode });
      await userEvent.click(within(bar()).getByRole('button', { name: 'Report' }));
      expect(screen.getByRole('dialog', { name: 'Report attempt' })).toBeInTheDocument();
      await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'whole attempt issue' } });
      await userEvent.click(screen.getByRole('button', { name: 'Submit report' }));
      await waitFor(() => expect(env.created).toHaveLength(1));
      expect(env.created[0].row).toMatchObject({ type: 'attempt', attemptId: 'att-9', sourceScreen: 'result', questionId: null });
    });

    it('is also shown when the caller replaces the default buttons', async () => {
      const env = await makeReportEnv();
      const { createRawSnippet } = await import('svelte');
      const actions = createRawSnippet(() => ({ render: () => '<button type="button">Next batch</button>' }));
      renderWithI18n(PracticeResult, { services: env.services, result, attemptId: 'att-9', onback: () => {}, mode: 'review', actions });
      const barEl = screen.getByRole('button', { name: 'Next batch' }).parentElement as HTMLElement;
      expect(within(barEl).getByRole('button', { name: 'Report' })).toBeInTheDocument();
    });

    it('is not rendered without an attempt id', async () => {
      const env = await makeReportEnv();
      renderWithI18n(PracticeResult, { services: env.services, result, onback: () => {} });
      expect(within(bar()).queryByRole('button', { name: 'Report' })).not.toBeInTheDocument();
    });
  });
});
