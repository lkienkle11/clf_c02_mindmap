import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithI18n } from '@/testing/render-with-i18n';
import Insights from './Insights.svelte';

const weak = [{ topicId: 'storage', avgPct: 40 }];

function mount(over: Record<string, unknown> = {}) {
  const onopen = vi.fn();
  const view = renderWithI18n(Insights, { weak, missedCount: 3, topicName: (id: string | null) => id ?? '', onopen, ...over });
  return { onopen, ...view };
}

describe('Insights', () => {
  it('stacks its sections in one column, not side by side', () => {
    const { container } = mount();
    expect(container.querySelector('[class*="grid-cols"], [class*="md:grid"]')).toBeNull();
  });

  it('lists the weak topics, then the most-missed section with the count on its button', async () => {
    const { onopen } = mount();
    const weakRegion = screen.getByRole('region', { name: 'Topics needing attention' });
    expect(within(weakRegion).getByText('storage')).toBeInTheDocument();
    const missed = screen.getByRole('region', { name: 'Most-missed questions' });
    const button = within(missed).getByRole('button', { name: 'View most-missed questions (3)' });
    expect(weakRegion.compareDocumentPosition(missed) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    await userEvent.click(button);
    expect(onopen).toHaveBeenCalledTimes(1);
  });

  it('no longer lists missed questions inline', () => {
    mount();
    expect(screen.queryByText(/Missed \d+ out of \d+/)).not.toBeInTheDocument();
  });

  it('hides the weak-topics section when weak is null', () => {
    mount({ weak: null });
    expect(screen.queryByRole('region', { name: 'Topics needing attention' })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Most-missed questions' })).toBeInTheDocument();
  });

  it('shows the empty message and no button when nothing was missed', () => {
    mount({ missedCount: 0 });
    expect(screen.getByText('No missed questions. Nice work.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
