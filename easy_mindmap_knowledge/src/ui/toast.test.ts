import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TOAST_MS, toasts } from './toast.svelte';

describe('toasts', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    toasts.clear();
    vi.useRealTimers();
  });

  it('shows a toast and removes it after TOAST_MS', () => {
    toasts.show('toast.reportSent');
    expect(toasts.items.map((t) => t.key)).toEqual(['toast.reportSent']);
    vi.advanceTimersByTime(TOAST_MS);
    expect(toasts.items).toEqual([]);
  });

  it('dismisses one toast by id', () => {
    toasts.show('a');
    toasts.show('b');
    toasts.dismiss(toasts.items[0].id);
    expect(toasts.items.map((t) => t.key)).toEqual(['b']);
  });
});
