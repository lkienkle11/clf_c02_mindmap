import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makeAttempt, makeRow } from '@/testing/history-env';
import { makeReportEnv } from '@/testing/report-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import AttemptDetail from './AttemptDetail.svelte';

const rows = [
  makeRow('a2', 0, { questionId: 'q1', optionOrder: ['B', 'A', 'C', 'D'], selected: ['B'], isCorrect: false }),
  makeRow('a2', 1, { questionId: 'q2', optionOrder: ['D', 'C', 'B', 'A'], selected: ['A', 'B'], isCorrect: true }),
  makeRow('a2', 2, { questionId: 'q3', selected: [], isCorrect: false }),
];
const entry = (id: string) => document.querySelector(`li[data-question="${id}"]`) as HTMLElement;

async function mount() {
  const env = await makeReportEnv();
  renderWithI18n(AttemptDetail, { services: env.services, attempt: makeAttempt('a2', { scorePct: 33, passed: false }), rows, onclose: () => {} });
  return env;
}

describe('AttemptDetail report buttons', () => {
  it('has one Report button per question', async () => {
    await mount();
    expect(screen.getAllByRole('button', { name: 'Report' })).toHaveLength(3);
    for (const id of ['q1', 'q2', 'q3']) expect(within(entry(id)).getAllByRole('button', { name: 'Report' })).toHaveLength(1);
  });

  it.each([
    ['q1', 0, ['B'], false, ['B', 'A', 'C', 'D']],
    ['q2', 1, ['A', 'B'], true, ['D', 'C', 'B', 'A']],
    ['q3', 2, [], false, ['A', 'B', 'C', 'D']],
  ] as const)('reports %s with its attempt references', async (id, position, selected, isCorrect, optionOrder) => {
    const env = await mount();
    await userEvent.click(within(entry(id)).getByRole('button', { name: 'Report' }));
    expect(screen.getByRole('dialog', { name: 'Report wrong question' })).toBeInTheDocument();
    await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'issue' } });
    await userEvent.click(screen.getByRole('button', { name: 'Submit report' }));
    await waitFor(() => expect(env.created).toHaveLength(1));
    expect(env.created[0].row).toMatchObject({
      type: 'question', questionId: id, sourceScreen: 'history', attemptId: 'a2', position, selected, isCorrect, optionOrder,
    });
  });
});
