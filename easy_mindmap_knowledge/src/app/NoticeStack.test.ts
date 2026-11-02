import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithI18n } from '@/testing/render-with-i18n';
import NoticeStack from './NoticeStack.svelte';

describe('NoticeStack', () => {
  it('stacks several notices in ONE fixed bottom-right container, each closable', async () => {
    const closeA = vi.fn();
    const closeB = vi.fn();
    renderWithI18n(NoticeStack, {
      notices: [
        { id: 'review', text: 'Nothing to review right now', onclose: closeA },
        { id: 'resume', text: 'The unfinished attempt could not be restored.', onclose: closeB },
      ],
    });
    const stack = screen.getByTestId('notices');
    expect(stack.className).toMatch(/\bfixed\b/);
    expect(stack.className).toMatch(/\bflex-col\b/);
    const items = within(stack).getAllByRole('status');
    expect(items).toHaveLength(2);
    for (const item of items) expect(item.className).not.toMatch(/\bfixed\b/); // only the stack is positioned
    await userEvent.click(within(items[1]).getByRole('button', { name: 'Close' }));
    expect(closeB).toHaveBeenCalledOnce();
    expect(closeA).not.toHaveBeenCalled();
  });

  it('renders nothing without notices', () => {
    renderWithI18n(NoticeStack, { notices: [] });
    expect(screen.queryByTestId('notices')).not.toBeInTheDocument();
  });
});
