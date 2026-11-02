import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import Modal from './Modal.svelte';

const body = createRawSnippet(() => ({
  render: () => `<div><button>First</button><button>Last</button></div>`,
}));

describe('Modal', () => {
  it('renders dialog when open, not when closed', () => {
    const { unmount } = render(Modal, { open: true, title: 'Hi', onclose: () => {}, children: body });
    const d = screen.getByRole('dialog');
    expect(d).toHaveAttribute('aria-modal', 'true');
    expect(d).toHaveAccessibleName('Hi');
    unmount();
    render(Modal, { open: false, title: 'Hi', onclose: () => {}, children: body });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('calls onclose on Escape', async () => {
    const onclose = vi.fn();
    render(Modal, { open: true, title: 'Hi', onclose, children: body });
    await userEvent.keyboard('{Escape}');
    expect(onclose).toHaveBeenCalledTimes(1);
  });
  it('moves focus inside on open', async () => {
    render(Modal, { open: true, title: 'Hi', onclose: () => {}, children: body });
    await waitFor(() => expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true));
  });
  it('traps Tab and returns focus to opener on close', async () => {
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const { rerender } = render(Modal, { open: true, title: 'Hi', onclose: () => {}, children: body });
    const dlg = screen.getByRole('dialog');
    await waitFor(() => expect(dlg.contains(document.activeElement)).toBe(true));
    const last = screen.getByText('Last');
    last.focus();
    await userEvent.tab();
    expect(dlg.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(opener);
    await userEvent.tab({ shift: true });
    expect(dlg.contains(document.activeElement)).toBe(true);
    await rerender({ open: false });
    await waitFor(() => expect(document.activeElement).toBe(opener));
    opener.remove();
  });
  it('backdrop click closes only when enabled', async () => {
    const onclose = vi.fn();
    render(Modal, { open: true, title: 'Hi', onclose, closeOnBackdrop: true, children: body });
    await userEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onclose).toHaveBeenCalledTimes(1);
  });
});
