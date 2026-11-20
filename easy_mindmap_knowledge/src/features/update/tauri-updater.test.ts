// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { DownloadProgress } from './logic/updater-port';
import { createTauriUpdater } from './tauri-updater';

type Ev = { event: 'Started'; data: { contentLength?: number } } | { event: 'Progress'; data: { chunkLength: number } } | { event: 'Finished' };

function fakeUpdate(rawJson: Record<string, unknown>, calls: string[] = [], events: Ev[] = []) {
  return {
    version: '2.0.0',
    rawJson,
    download: async (cb?: (e: Ev) => void) => {
      calls.push('download');
      events.forEach((e) => cb?.(e));
    },
    install: async () => { calls.push('install'); },
  };
}

const MAC_ARM = 'Mozilla/5.0 (Macintosh; arm64 Mac OS X 14_0) AppleWebKit/605.1.15';
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15';
const WIN = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edg/120.0';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function make(update: any, extra: { calls?: string[]; userAgent?: string } = {}) {
  const calls = extra.calls ?? [];
  return createTauriUpdater({
    check: (async () => update) as never,
    relaunch: (async () => { calls.push('relaunch'); }) as never,
    userAgent: extra.userAgent ?? WIN,
  });
}

describe('createTauriUpdater.check', () => {
  it('returns null when there is no update', async () => {
    expect(await make(null).check()).toBeNull();
  });

  it('reads the size for the running platform from rawJson.sizes', async () => {
    const raw = { sizes: { 'windows-x86_64': 5000, 'darwin-aarch64': 7000 } };
    expect(await make(fakeUpdate(raw)).check()).toEqual({ version: '2.0.0', sizeBytes: 5000 });
    expect(await make(fakeUpdate(raw), { userAgent: MAC_ARM }).check()).toEqual({ version: '2.0.0', sizeBytes: 7000 });
  });

  it('uses the largest darwin size when the architecture cannot be told', async () => {
    const raw = { sizes: { 'darwin-aarch64': 7000, 'darwin-x86_64': 8000 } };
    expect((await make(fakeUpdate(raw), { userAgent: MAC }).check())?.sizeBytes).toBe(8000);
  });

  it('gives null without sizes, without a matching platform or with a bad value', async () => {
    expect((await make(fakeUpdate({})).check())?.sizeBytes).toBeNull();
    expect((await make(fakeUpdate({ sizes: { 'darwin-aarch64': 7000 } })).check())?.sizeBytes).toBeNull();
    expect((await make(fakeUpdate({ sizes: { 'windows-x86_64': 'big' } })).check())?.sizeBytes).toBeNull();
  });

  it('rejects when check throws', async () => {
    const port = createTauriUpdater({ check: (async () => { throw new Error('offline'); }) as never, relaunch: (async () => {}) as never });
    await expect(port.check()).rejects.toThrow('offline');
  });
});

describe('createTauriUpdater.download', () => {
  it('maps Started, Progress and Finished to accumulated progress', async () => {
    const events: Ev[] = [
      { event: 'Started', data: { contentLength: 1000 } },
      { event: 'Progress', data: { chunkLength: 400 } },
      { event: 'Progress', data: { chunkLength: 600 } },
      { event: 'Finished' },
    ];
    const port = make(fakeUpdate({}, [], events));
    await port.check();
    const seen: DownloadProgress[] = [];
    await port.download((p) => seen.push(p));
    expect(seen).toEqual([
      { downloaded: 0, total: 1000 },
      { downloaded: 400, total: 1000 },
      { downloaded: 1000, total: 1000 },
    ]);
  });
});

describe('createTauriUpdater.install', () => {
  it('installs, then relaunches once, in that order', async () => {
    const calls: string[] = [];
    const port = make(fakeUpdate({}, calls), { calls });
    await port.check();
    await port.install();
    expect(calls).toEqual(['install', 'relaunch']);
  });
});
