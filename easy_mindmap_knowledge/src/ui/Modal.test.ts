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

  it('closes on Escape even when focus has fallen to body', async () => {
    const onclose = vi.fn();
    render(Modal, { open: true, title: 'Hi', onclose, children: body });
    await waitFor(() => expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true));
    (document.activeElement as HTMLElement).blur();
    expect(document.activeElement).toBe(document.body);
    await userEvent.keyboard('{Escape}');
    expect(onclose).toHaveBeenCalledTimes(1);
  });
  it('wraps Tab from the last focusable to the first and Shift+Tab from the first to the last', async () => {
    render(Modal, { open: true, title: 'Hi', onclose: () => {}, children: body });
    await waitFor(() => expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true));
    const first = screen.getByText('First');
    const last = screen.getByText('Last');
    last.focus();
    await userEvent.tab();
    expect(document.activeElement).toBe(first);
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(last);
  });
  it('pulls focus back in when Tab is pressed from body', async () => {
    render(Modal, { open: true, title: 'Hi', onclose: () => {}, children: body });
    await waitFor(() => expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true));
    (document.activeElement as HTMLElement).blur();
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByText('First'));
  });
  it('ignores the keyboard while closed', async () => {
    const onclose = vi.fn();
    render(Modal, { open: false, title: 'Hi', onclose, children: body });
    await userEvent.keyboard('{Escape}');
    expect(onclose).not.toHaveBeenCalled();
  });
  it('only the topmost of several open modals handles Escape', async () => {
    const lower = vi.fn();
    const upper = vi.fn();
    render(Modal, { open: true, title: 'Lower', onclose: lower, children: body });
    render(Modal, { open: true, title: 'Upper', onclose: upper, children: body });
    await userEvent.keyboard('{Escape}');
    expect(upper).toHaveBeenCalledTimes(1);
    expect(lower).not.toHaveBeenCalled();
  });
  it('locks page scroll while open and restores on close', async () => {
    const { rerender } = render(Modal, { open: true, title: 'Hi', onclose: () => {}, children: body });
    await waitFor(() => expect(document.documentElement.style.overflow).toBe('hidden'));
    await rerender({ open: false, title: 'Hi', onclose: () => {}, children: body });
    await waitFor(() => expect(document.documentElement.style.overflow).toBe(''));
  });
  it('two open modals keep the lock until both close', async () => {
    const a = render(Modal, { open: true, title: 'A', onclose: () => {}, children: body });
    const b = render(Modal, { open: true, title: 'B', onclose: () => {}, children: body });
    await waitFor(() => expect(document.documentElement.style.overflow).toBe('hidden'));
    await b.rerender({ open: false, title: 'B', onclose: () => {}, children: body });
    expect(document.documentElement.style.overflow).toBe('hidden');
    await a.rerender({ open: false, title: 'A', onclose: () => {}, children: body });
    await waitFor(() => expect(document.documentElement.style.overflow).toBe(''));
  });
});
