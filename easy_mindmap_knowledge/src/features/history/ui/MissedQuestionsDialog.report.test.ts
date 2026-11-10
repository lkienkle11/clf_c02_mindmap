import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makeReportEnv } from '@/testing/report-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import type { MissedDetail } from '../logic/history-stats';
import MissedQuestionsDialog from './MissedQuestionsDialog.svelte';

const detail = (questionId: string, over: Partial<MissedDetail> = {}): MissedDetail => ({
  questionId, topicId: 'compute', misses: 2, seen: 3,
  latestWrong: { attemptId: 'a1', position: 4, at: 1, selected: ['B'], optionOrder: ['B', 'A', 'C', 'D'] },
  distinctWrongAnswers: 1, ...over,
});
const entry = (id: string) => document.querySelector(`li[data-question="${id}"]`) as HTMLElement;

async function mount(items: MissedDetail[]) {
  const env = await makeReportEnv();
  renderWithI18n(MissedQuestionsDialog, { items, services: env.services, initialTopicId: null, onclose: () => {} });
  return env;
}

async function submitFrom(id: string) {
  await userEvent.click(within(entry(id)).getByRole('button', { name: 'Report' }));
  expect(screen.getByRole('dialog', { name: 'Report wrong question' })).toBeInTheDocument();
  await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'issue' } });
  await userEvent.click(screen.getByRole('button', { name: 'Submit report' }));
}

describe('MissedQuestionsDialog report buttons', () => {
  it('has one Report button per question', async () => {
    await mount([detail('q1'), detail('q2'), detail('q3')]);
    expect(screen.getAllByRole('button', { name: 'Report' })).toHaveLength(3);
  });

  it('reports with the latest wrong attempt references', async () => {
    const env = await mount([detail('q1')]);
    await submitFrom('q1');
    await waitFor(() => expect(env.created).toHaveLength(1));
    expect(env.created[0].row).toMatchObject({ type: 'question', questionId: 'q1', sourceScreen: 'missed' });
    expect(env.created[0].row.attemptId).toBe('a1');
    expect(env.created[0].row.position).toBe(4);
    expect(env.created[0].row.selected).toEqual(['B']);
    expect(env.created[0].row.optionOrder).toEqual(['B', 'A', 'C', 'D']);
    expect(env.created[0].row.isCorrect).toBe(false);
  });

  it('omits the attempt references when the attempt id is not available', async () => {
    const env = await mount([detail('q2', { latestWrong: { attemptId: '', position: 0, at: 1, selected: ['B'], optionOrder: ['B', 'A'] } })]);
    await submitFrom('q2');
    await waitFor(() => expect(env.created).toHaveLength(1));
    expect(env.created[0].row).toMatchObject({ questionId: 'q2', sourceScreen: 'missed', attemptId: null, position: null, selected: null });
  });
});
