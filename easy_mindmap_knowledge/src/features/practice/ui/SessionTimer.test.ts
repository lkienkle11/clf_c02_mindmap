import { afterEach, describe, expect, it, vi } from 'vitest';
import { makePracticeEnv } from '@/testing/practice-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { DEFAULT_PRACTICE_OPTIONS, PracticeSession } from '../index';
import type { PracticeOptions } from '../index';
import SessionTimer from './SessionTimer.svelte';

async function mount(options: Partial<PracticeOptions> = {}) {
  const env = await makePracticeEnv({ now: () => Date.now() });
  const session = await PracticeSession.start(env.services, 'compute', { ...DEFAULT_PRACTICE_OPTIONS, ...options }, () => env.appState.refresh());
  const tick = vi.spyOn(session, 'tick');
  const settle = vi.spyOn(session, 'settleHidden');
  const onerror = vi.fn();
  const { unmount } = renderWithI18n(SessionTimer, { services: env.services, session, onerror });
  return { session, tick, settle, onerror, unmount };
}

function setVisibility(state: 'hidden' | 'visible') {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => state });
  document.dispatchEvent(new Event('visibilitychange'));
}

function useClock() {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
  vi.setSystemTime(1_000_000);
}

afterEach(() => {
  vi.useRealTimers();
  setVisibility('visible');
});

describe('SessionTimer visibility tracking', () => {
  it('skips ticks while hidden', async () => {
    useClock();
    const { tick } = await mount({ limitMs: 600_000 });
    setVisibility('hidden');
    await vi.advanceTimersByTimeAsync(10_000);
    expect(tick).not.toHaveBeenCalled();
  });

  it('calls settleHidden once with the hidden duration on visible', async () => {
    useClock();
    const { settle } = await mount({ limitMs: 600_000 });
    setVisibility('hidden');
    vi.setSystemTime(Date.now() + 30_000);
    setVisibility('visible');
    expect(settle).toHaveBeenCalledTimes(1);
    expect(settle).toHaveBeenCalledWith(30_000);
  });

  it('excludes the hidden time from the next tick', async () => {
    useClock();
    const { tick } = await mount({ limitMs: 600_000 });
    setVisibility('hidden');
    vi.setSystemTime(Date.now() + 30_000);
    setVisibility('visible');
    await vi.advanceTimersByTimeAsync(1000);
    expect(tick).toHaveBeenLastCalledWith(1000);
  });

  it('does not move the hidden mark on a second hidden event', async () => {
    useClock();
    const { settle } = await mount({ limitMs: 600_000 });
    setVisibility('hidden');
    vi.setSystemTime(Date.now() + 10_000);
    setVisibility('hidden');
    vi.setSystemTime(Date.now() + 20_000);
    setVisibility('visible');
    expect(settle).toHaveBeenCalledWith(30_000);
  });

  it('gives hiddenMs 0 when the clock went backwards', async () => {
    useClock();
    const { settle } = await mount({ limitMs: 600_000 });
    setVisibility('hidden');
    vi.setSystemTime(Date.now() - 5000);
    setVisibility('visible');
    expect(settle).toHaveBeenCalledWith(0);
  });

  it('does nothing for an untimed session', async () => {
    useClock();
    const { tick, settle } = await mount();
    setVisibility('hidden');
    vi.setSystemTime(Date.now() + 30_000);
    setVisibility('visible');
    await vi.advanceTimersByTimeAsync(3000);
    expect(tick).not.toHaveBeenCalled();
    expect(settle).not.toHaveBeenCalled();
  });
});
