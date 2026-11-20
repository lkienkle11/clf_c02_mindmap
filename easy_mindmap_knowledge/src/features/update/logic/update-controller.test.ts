import { describe, expect, it } from 'vitest';
import { makeFakeUpdater } from '@/testing/fake-updater';
import { UpdateController } from './update-controller.svelte';

const UPDATE = { version: '1.2.0', sizeBytes: 1000 };
const CHUNKS = [
  { downloaded: 0, total: 1000 },
  { downloaded: 500, total: 1000 },
  { downloaded: 1000, total: 1000 },
];

describe('UpdateController.check', () => {
  it('becomes available with the info when an update exists', async () => {
    const c = new UpdateController(makeFakeUpdater({ update: UPDATE }));
    await c.check();
    expect(c.status).toBe('available');
    expect(c.info).toEqual(UPDATE);
  });

  it('becomes upToDate when there is no update', async () => {
    const c = new UpdateController(makeFakeUpdater({ update: null }));
    await c.check();
    expect(c.status).toBe('upToDate');
  });

  it('returns to idle without an error stage when a silent check fails', async () => {
    const c = new UpdateController(makeFakeUpdater({ failCheck: true }));
    await c.check({ silent: true });
    expect(c.status).toBe('idle');
    expect(c.errorStage).toBeNull();
  });

  it('sets the error status and the check stage when a non-silent check fails', async () => {
    const c = new UpdateController(makeFakeUpdater({ failCheck: true }));
    await c.check();
    expect(c.status).toBe('error');
    expect(c.errorStage).toBe('check');
  });

  it('does not call the port while downloading', async () => {
    const port = makeFakeUpdater({ update: UPDATE });
    const c = new UpdateController(port);
    await c.check();
    const pending = c.download();
    expect(c.status).toBe('downloading');
    await c.check();
    await pending;
    expect(port.calls.filter((x) => x === 'check')).toHaveLength(1);
  });

  it('ignores a stale check that resolves after the update is ready', async () => {
    const resolvers: ((v: typeof UPDATE | null) => void)[] = [];
    const port = {
      ...makeFakeUpdater({ update: UPDATE }),
      check: () => new Promise<typeof UPDATE | null>((r) => { resolvers.push(r); }),
    };
    const c = new UpdateController(port);
    const checkA = c.check();
    const checkB = c.check();
    resolvers[1](UPDATE);
    await checkB;
    await c.download();
    expect(c.status).toBe('ready');
    resolvers[0](null);
    await checkA;
    expect(c.status).toBe('ready');
    expect(c.info).toEqual(UPDATE);
    await c.install();
    expect(c.status).toBe('installing');
  });

  it('does not call the port when the download is ready', async () => {
    const port = makeFakeUpdater({ update: UPDATE });
    const c = new UpdateController(port);
    await c.check();
    await c.download();
    expect(c.status).toBe('ready');
    await c.check();
    expect(c.status).toBe('ready');
    expect(port.calls.filter((x) => x === 'check')).toHaveLength(1);
  });
});

describe('UpdateController.download', () => {
  it('follows the chunks as percent and ends ready', async () => {
    const seen: (number | null)[] = [];
    const port = makeFakeUpdater({ update: UPDATE, chunks: CHUNKS });
    const c = new UpdateController(port);
    await c.check();
    const original = port.download.bind(port);
    port.download = (onProgress) => original((p) => { onProgress(p); seen.push(c.percent); });
    await c.download();
    expect(seen).toEqual([0, 50, 100]);
    expect(c.status).toBe('ready');
    expect(c.percent).toBe(100);
  });

  it('keeps percent null when the total is unknown', async () => {
    const chunks = [{ downloaded: 0, total: null }, { downloaded: 400, total: null }];
    const port = makeFakeUpdater({ update: UPDATE, chunks });
    const c = new UpdateController(port);
    await c.check();
    const seen: (number | null)[] = [];
    const original = port.download.bind(port);
    port.download = (onProgress) => original((p) => { onProgress(p); seen.push(c.percent); });
    await c.download();
    expect(seen).toEqual([null, null]);
    expect(c.percent).toBeNull();
    expect(c.status).toBe('ready');
  });

  it('sets the download error stage on failure and succeeds when retried', async () => {
    const port = makeFakeUpdater({ update: UPDATE, chunks: CHUNKS, failDownload: true });
    const c = new UpdateController(port);
    await c.check();
    await c.download();
    expect(c.status).toBe('error');
    expect(c.errorStage).toBe('download');
    port.failDownload = false;
    await c.download();
    expect(c.status).toBe('ready');
    expect(c.errorStage).toBeNull();
  });

  it('is ignored before an update is available', async () => {
    const port = makeFakeUpdater({ update: UPDATE });
    const c = new UpdateController(port);
    await c.download();
    expect(c.status).toBe('idle');
    expect(port.calls).not.toContain('download');
  });
});

describe('UpdateController.install', () => {
  it('moves to installing and calls the port once when ready', async () => {
    const port = makeFakeUpdater({ update: UPDATE });
    const c = new UpdateController(port);
    await c.check();
    await c.download();
    await c.install();
    expect(c.status).toBe('installing');
    expect(port.calls.filter((x) => x === 'install')).toHaveLength(1);
  });

  it('is ignored before the download is ready', async () => {
    const port = makeFakeUpdater({ update: UPDATE });
    const c = new UpdateController(port);
    await c.check();
    await c.install();
    expect(c.status).toBe('available');
    expect(port.calls).not.toContain('install');
  });

  it('sets the install error stage when installing fails', async () => {
    const c = new UpdateController(makeFakeUpdater({ update: UPDATE, failInstall: true }));
    await c.check();
    await c.download();
    await c.install();
    expect(c.status).toBe('error');
    expect(c.errorStage).toBe('install');
  });
});
