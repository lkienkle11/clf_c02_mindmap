import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { loadCatalog } from '@/content/load-catalog';
import { buildServices } from '@/app/composition';
import { makeRawCatalog, TOPIC_IDS } from '@/testing/fixtures';
import { renderWithI18n } from '@/testing/render-with-i18n';
import type { TopicReviewSummary } from '../logic/review-summary';
import DailyReviewModal from './DailyReviewModal.svelte';

const services = buildServices({
  executor: { execute: async () => {}, select: async () => [] },
  catalog: loadCatalog(makeRawCatalog()),
  now: () => 0,
});

/** Topic i: i+2 cards due, 7-i days overdue; the first two are urgent. */
function sums(n: number): TopicReviewSummary[] {
  return TOPIC_IDS.slice(0, n).map((topicId, i) => ({
    topicId, dueCount: i + 2, daysOverdue: 7 - i, urgency: i < 2 ? 'urgent' : 'soon',
  }));
}

function mount(over: Record<string, unknown> = {}) {
  const fns = { onstart: vi.fn(), onlater: vi.fn(), ondismiss: vi.fn() };
  renderWithI18n(DailyReviewModal, { services, summaries: sums(3), variant: 'daily', ...fns, ...over });
  return fns;
}

describe('DailyReviewModal', () => {
  it('summarises topics and cards due in one line', () => {
    mount({ summaries: sums(3) }); // 2 + 3 + 4 cards
    expect(screen.getByText('3 topics · 9 cards due')).toBeInTheDocument();
  });

  it('uses singular wording for one topic and one card', () => {
    mount({ summaries: [{ topicId: 'compute', dueCount: 1, daysOverdue: 1, urgency: 'soon' }] });
    expect(screen.getByText('1 topic · 1 card due')).toBeInTheDocument();
    expect(screen.getByText('1 day since last review')).toBeInTheDocument();
  });

  it('shows urgency with an icon and a word, plus days and due count, per topic in the given order', () => {
    mount({ summaries: sums(3) });
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByText('cloud-concepts')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Urgent')).toBeInTheDocument();
    expect(rows[0]).toHaveTextContent('🔴');
    expect(within(rows[0]).getByText('7 days since last review')).toBeInTheDocument();
    expect(within(rows[0]).getByText('2 cards due')).toBeInTheDocument();
    expect(within(rows[2]).getByText('Review soon')).toBeInTheDocument();
    expect(rows[2]).toHaveTextContent('🟡');
    expect(within(rows[2]).getByText('compute')).toBeInTheDocument();
  });

  it('says "Due today" when nothing is overdue by a full day', () => {
    mount({ summaries: [{ topicId: 'compute', dueCount: 2, daysOverdue: 0, urgency: 'soon' }] });
    expect(screen.getByText('Due today')).toBeInTheDocument();
  });

  it('shows the first 5 topics and expands the rest behind a disclosure', async () => {
    mount({ summaries: sums(7) });
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    const more = screen.getByRole('button', { name: '+ 2 more topics' });
    expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
    expect(screen.getByRole('button', { name: 'Show fewer topics' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('has no disclosure when 5 topics or fewer', () => {
    mount({ summaries: sums(5) });
    expect(screen.queryByRole('button', { name: /more topic/ })).not.toBeInTheDocument();
  });

  it('starts the Full review by default', async () => {
    const { onstart } = mount();
    expect(screen.getByRole('radio', { name: /Full/ })).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Start now' }));
    expect(onstart).toHaveBeenCalledWith({ kind: 'full' });
  });

  it('starts a Quick review', async () => {
    const { onstart } = mount();
    await userEvent.click(screen.getByRole('radio', { name: /Quick/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Start now' }));
    expect(onstart).toHaveBeenCalledWith({ kind: 'quick' });
  });

  it('Custom needs at least one ticked topic and passes the ticked ids in list order', async () => {
    const { onstart } = mount({ summaries: sums(4) });
    await userEvent.click(screen.getByRole('radio', { name: /Custom/ }));
    const start = screen.getByRole('button', { name: 'Start now' });
    expect(start).toBeDisabled();
    expect(screen.getByText('Tick at least one topic to start.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: 'compute' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'global-infrastructure' }));
    expect(start).toBeEnabled();
    expect(screen.queryByText('Tick at least one topic to start.')).not.toBeInTheDocument();
    await userEvent.click(start);
    expect(onstart).toHaveBeenCalledWith({ kind: 'custom', topicIds: ['global-infrastructure', 'compute'] });
  });

  it('ticking a topic switches to Custom, and unticking everything disables Start again', async () => {
    mount({ summaries: sums(2) });
    await userEvent.click(screen.getByRole('checkbox', { name: 'cloud-concepts' }));
    expect(screen.getByRole('radio', { name: /Custom/ })).toBeChecked();
    await userEvent.click(screen.getByRole('checkbox', { name: 'cloud-concepts' }));
    expect(screen.getByRole('button', { name: 'Start now' })).toBeDisabled();
  });

  it('daily variant offers Don\'t ask today; manual variant does not', async () => {
    const daily = mount({ variant: 'daily' });
    await userEvent.click(screen.getByRole('button', { name: "Don't ask today" }));
    expect(daily.ondismiss).toHaveBeenCalledTimes(1);
  });

  it('manual variant has no Don\'t ask today', () => {
    mount({ variant: 'manual' });
    expect(screen.queryByRole('button', { name: "Don't ask today" })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Review now' })).toBeInTheDocument();
  });

  it('Later and Escape both call onlater', async () => {
    const { onlater } = mount();
    await userEvent.click(screen.getByRole('button', { name: 'Later' }));
    expect(onlater).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Escape}');
    expect(onlater).toHaveBeenCalledTimes(2);
  });
});
