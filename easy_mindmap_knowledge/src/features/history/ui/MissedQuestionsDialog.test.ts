import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { makePracticeEnv } from '@/testing/practice-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import type { MissedDetail } from '../logic/history-stats';
import MissedQuestionsDialog from './MissedQuestionsDialog.svelte';

const detail = (questionId: string, over: Partial<MissedDetail> = {}): MissedDetail => ({
  questionId,
  topicId: 'compute',
  misses: 2,
  seen: 3,
  latestWrong: { attemptId: 'a1', at: 1, selected: ['B'], optionOrder: ['B', 'A', 'C', 'D'] },
  distinctWrongAnswers: 1,
  ...over,
});

/** q1 (in the catalog, compute), q2 (storage), then 10 ids that are not in the catalog. */
const twelve = (): MissedDetail[] => [
  detail('q1'),
  detail('q2', { topicId: 'storage', distinctWrongAnswers: 3 }),
  ...Array.from({ length: 10 }, (_, i) => detail(`gone-${String(i + 3).padStart(2, '0')}`, { topicId: null })),
];

async function mount(over: Record<string, unknown> = {}) {
  const env = await makePracticeEnv();
  const onclose = vi.fn();
  renderWithI18n(MissedQuestionsDialog, { items: twelve(), services: env.services, initialTopicId: null, onclose, ...over });
  return { onclose };
}

const entries = () => within(screen.getByRole('dialog')).queryAllByRole('listitem').filter((li) => li.hasAttribute('data-question'));
const ids = () => entries().map((li) => li.getAttribute('data-question'));
const pageText = () => screen.getByText(/^Page /).textContent;

describe('MissedQuestionsDialog', () => {
  it('is a dialog with the dialog title, five entries per page and Page 1/3', async () => {
    await mount();
    expect(screen.getByRole('dialog', { name: 'Most-missed questions' })).toBeInTheDocument();
    expect(entries()).toHaveLength(5);
    expect(ids()).toEqual(['q1', 'q2', 'gone-03', 'gone-04', 'gone-05']);
    expect(pageText()).toBe('Page 1/3');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
  });

  it('goes to the next page (items 6-10), then the last (11-12), and back', async () => {
    await mount();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(ids()).toEqual(['gone-06', 'gone-07', 'gone-08', 'gone-09', 'gone-10']);
    expect(pageText()).toBe('Page 2/3');
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(ids()).toEqual(['gone-11', 'gone-12']);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(pageText()).toBe('Page 2/3');
  });

  it('shows the question, topic, miss stat and the latest wrong answer with its badges', async () => {
    await mount();
    const [first, second] = entries();
    expect(within(first).getByText('Pick the first?')).toHaveAttribute('lang', 'en');
    expect(within(first).getByText('compute')).toBeInTheDocument();
    expect(within(first).getByText('Missed 2 out of 3')).toBeInTheDocument();
    expect(within(first).queryByText(/other wrong answers/)).not.toBeInTheDocument();
    // latest wrong answer: picked B (stored order B, A, C, D), correct A
    expect(Array.from(first.querySelectorAll('li[data-option]')).map((li) => (li as HTMLElement).dataset.option)).toEqual(['B', 'A', 'C', 'D']);
    expect(within(first.querySelector('li[data-option="B"]') as HTMLElement).getByText('Your answer · Incorrect')).toBeInTheDocument();
    expect(within(first.querySelector('li[data-option="A"]') as HTMLElement).getByText('Correct answer')).toBeInTheDocument();
    expect(within(second).getByText('2 other wrong answers')).toBeInTheDocument();
  });

  it('shows the question id and no options for a question missing from the catalog', async () => {
    await mount();
    const gone = entries()[2];
    expect(within(gone).getByText('gone-03')).toBeInTheDocument();
    expect(gone.querySelectorAll('li[data-option]')).toHaveLength(0);
  });

  it('searches the question text case-insensitively and returns to page 1', async () => {
    await mount();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search questions' }), 'PICK THE');
    expect(ids()).toEqual(['q1']);
    expect(pageText()).toBe('Page 1/1');
  });

  it('filters by topic (all topics plus only those with misses) and returns to page 1', async () => {
    await mount();
    const select = screen.getByRole('combobox', { name: 'Topic' });
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual(['All topics', 'compute', 'storage']);
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await userEvent.selectOptions(select, 'storage');
    expect(ids()).toEqual(['q2']);
    expect(pageText()).toBe('Page 1/1');
  });

  it('starts on the topic it is given', async () => {
    await mount({ initialTopicId: 'storage' });
    expect(screen.getByRole('combobox', { name: 'Topic' })).toHaveValue('storage');
    expect(ids()).toEqual(['q2']);
  });

  it('says so, shows 0/0 and disables both buttons when nothing matches', async () => {
    await mount();
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search questions' }), 'zzz');
    expect(entries()).toHaveLength(0);
    expect(screen.getByText('No question matches your filters.')).toBeInTheDocument();
    expect(pageText()).toBe('Page 0/0');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('closes from the Close button', async () => {
    const { onclose } = await mount();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onclose).toHaveBeenCalled();
  });
});
