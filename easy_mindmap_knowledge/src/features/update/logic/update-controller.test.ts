import { describe, expect, it, vi } from 'vitest';
import { makeFakeUpdater } from '@/testing/fake-updater';
import { UpdateController } from './update-controller.svelte';

const UPDATE = { version: '1.2.0', sizeBytes: 1000, notes: null };
const CHUNKS = [
  { downloaded: 0, total: 1000 },
  { downloaded: 500, total: 1000 },
  { downloaded: 1000, total: 1000 },
];

function memoryPromptStore(initial: string | null = null) {
  let value = initial;
  return {
    get: async () => value,
    set: async (version: string) => { value = version; },
  };
}

describe('UpdateController pending updates', () => {
  it('hasUpdate follows available, downloading, ready and installing states', async () => {
    const c = new UpdateController(makeFakeUpdater({ update: UPDATE }));
    expect(c.hasUpdate).toBe(false);
    await c.check();
    expect(c.hasUpdate).toBe(true);
    const downloading = c.download();
    expect(c.status).toBe('downloading');
    expect(c.hasUpdate).toBe(true);
    await downloading;
    expect(c.status).toBe('ready');
    expect(c.hasUpdate).toBe(true);
    await c.install();
    expect(c.status).toBe('installing');
    expect(c.hasUpdate).toBe(true);
  });

  it.each(['download', 'install'] as const)('hasUpdate stays true after a %s error', async (stage) => {
    const c = new UpdateController(makeFakeUpdater({
      update: UPDATE, failDownload: stage === 'download', failInstall: stage === 'install',
    }));
    await c.check();
    await c.download();
    if (stage === 'install') await c.install();
    expect(c.errorStage).toBe(stage);
    expect(c.hasUpdate).toBe(true);
  });

  it('hasUpdate is false when up to date or after a check error', async () => {
    const current = new UpdateController(makeFakeUpdater());
    await current.check();
    expect(current.status).toBe('upToDate');
    expect(current.hasUpdate).toBe(false);
    const failed = new UpdateController(makeFakeUpdater({ failCheck: true }));
    await failed.check();
    expect(failed.hasUpdate).toBe(false);
  });

  it('promptable is false until the postponed version has been read', async () => {
    let finishRead!: (value: string | null) => void;
    const c = new UpdateController(makeFakeUpdater({ update: UPDATE }), {
      get: () => new Promise((resolve) => { finishRead = resolve; }),
      set: async () => {},
    });
    await c.checkAtStart();
    expect(c.postponedVersion).toBeUndefined();
    expect(c.promptable).toBe(false);
    const reading = c.loadPostponed();
    expect(c.promptable).toBe(false);
    finishRead(null);
    await reading;
    expect(c.postponedVersion).toBeNull();
    expect(c.promptable).toBe(true);
    await c.download();
    expect(c.promptable).toBe(false);
  });

  it('promptable is false for a postponed version and true again for a newer one', async () => {
    for (const [version, promptable] of [['1.2.0', false], ['1.3.0', true]] as const) {
      const c = new UpdateController(makeFakeUpdater({ update: { ...UPDATE, version } }), memoryPromptStore('1.2.0'));
      await c.loadPostponed();
      await c.checkAtStart();
      expect(c.promptable).toBe(promptable);
    }
  });

  it('postpone stores the version and clears promptable', async () => {
    const store = memoryPromptStore();
    const c = new UpdateController(makeFakeUpdater({ update: UPDATE }), store);
    await c.loadPostponed();
    await c.checkAtStart();
    await c.postpone();
    expect(await store.get()).toBe('1.2.0');
    expect(c.postponedVersion).toBe('1.2.0');
    expect(c.promptable).toBe(false);
  });

  it('a failing store write still stops promptable for this run', async () => {
    const failure = new Error('write failed');
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const c = new UpdateController(makeFakeUpdater({ update: UPDATE }), {
        get: async () => null,
        set: async () => { throw failure; },
      });
      await c.loadPostponed();
      await c.checkAtStart();
      await expect(c.postpone()).resolves.toBeUndefined();
      expect(c.postponedVersion).toBe('1.2.0');
      expect(c.promptable).toBe(false);
      expect(logged).toHaveBeenCalledWith(expect.any(String), failure);
    } finally {
      logged.mockRestore();
    }
  });

  it('a failing store read keeps promptable false', async () => {
    const failure = new Error('read failed');
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const c = new UpdateController(makeFakeUpdater({ update: UPDATE }), {
        get: async () => { throw failure; },
        set: async () => {},
      });
      await expect(c.loadPostponed()).resolves.toBeUndefined();
      await c.checkAtStart();
      expect(c.postponedVersion).toBeUndefined();
      expect(c.promptable).toBe(false);
      expect(logged).toHaveBeenCalledWith(expect.any(String), failure);
    } finally {
      logged.mockRestore();
    }
  });

  it('updateNow downloads then installs', async () => {
    const port = makeFakeUpdater({ update: UPDATE });
    const c = new UpdateController(port);
    await c.check();
    await c.updateNow();
    expect(port.calls).toEqual(['check', 'download', 'install']);
    expect(c.status).toBe('installing');
  });

  it('updateNow stops after a download error and does not call install', async () => {
    const port = makeFakeUpdater({ update: UPDATE, failDownload: true });
    const c = new UpdateController(port);
    await c.check();
    await c.updateNow();
    expect(c.errorStage).toBe('download');
    expect(port.calls).toEqual(['check', 'download']);
  });
});

describe('UpdateController.check', () => {
  it('checkAtStart sets promptVersion only when an update is available', async () => {
    const port = makeFakeUpdater({ update: UPDATE });
    const c = new UpdateController(port);
    await c.loadPostponed();
    expect(c.promptVersion).toBeNull();
    await c.checkAtStart();
    expect(c.promptVersion).toBe('1.2.0');
    expect(c.promptable).toBe(true);
    for (const options of [{ update: null }, { failCheck: true }]) {
      const empty = new UpdateController(makeFakeUpdater(options));
      await empty.checkAtStart();
      expect(empty.promptVersion).toBeNull();
      expect(empty.promptable).toBe(false);
    }
  });

  it.each([false, true])('a manual re-check preserves the pending version and prompt state after postponing=%s', async (postpone) => {
    let update = UPDATE;
    const c = new UpdateController({ ...makeFakeUpdater(), check: async () => update });
    await c.loadPostponed();
    await c.checkAtStart();
    if (postpone) await c.postpone();
    update = { ...UPDATE, version: '1.3.0' };
    await c.check();
    expect(c.info?.version).toBe('1.2.0');
    expect(c.promptVersion).toBe('1.2.0');
    expect(c.promptable).toBe(!postpone);
    expect(c.hasUpdate).toBe(true);
  });

  it('a manual check while an update is pending does not call the port and keeps the status available', async () => {
    const options = { update: UPDATE as typeof UPDATE | null };
    const port = makeFakeUpdater(options);
    const c = new UpdateController(port);
    await c.check();
    options.update = null;

    await c.check();

    expect(port.calls).toEqual(['check']);
    expect(c.status).toBe('available');
    expect(c.info).toEqual(UPDATE);
  });

  it('a manual check while an update is pending keeps hasUpdate true throughout', async () => {
    const c = new UpdateController(makeFakeUpdater({ update: UPDATE }));
    await c.check();
    expect(c.hasUpdate).toBe(true);

    const pending = c.check();
    expect(c.hasUpdate).toBe(true);
    await pending;
    expect(c.hasUpdate).toBe(true);
  });

  it.each([null, UPDATE])('a silent re-check keeps upToDate while pending and applies %j', async (found) => {
    let finish!: (value: typeof UPDATE | null) => void;
    const port = makeFakeUpdater();
    const c = new UpdateController(port);
    await c.check();
    port.check = () => new Promise((resolve) => { finish = resolve; });
    const pending = c.check({ silent: true });
    expect(c.status).toBe('upToDate');
    finish(found);
    await pending;
    expect(c.status).toBe(found ? 'available' : 'upToDate');
    expect(c.info).toEqual(found);
    expect(c.promptable).toBe(false);
  });

  it('a silent re-check failure changes nothing', async () => {
    const options = { failCheck: false };
    const port = makeFakeUpdater(options);
    const c = new UpdateController(port);
    await c.check();
    options.failCheck = true;
    await c.check({ silent: true });
    expect(c.status).toBe('upToDate');
    expect(c.info).toBeNull();
    expect(c.errorStage).toBeNull();
  });

  it.each(['available', 'downloading', 'ready', 'installing', 'download', 'install'] as const)(
    'a silent re-check does nothing with a pending update in %s', async (stage) => {
      const port = makeFakeUpdater({ update: UPDATE, failDownload: stage === 'download', failInstall: stage === 'install' });
      const c = new UpdateController(port);
      await c.check();
      let downloading: Promise<void> | undefined;
      if (stage !== 'available') {
        downloading = c.download();
        if (stage !== 'downloading') await downloading;
      }
      if (stage === 'installing' || stage === 'install') await c.install();
      const status = c.status;
      const errorStage = c.errorStage;
      const pending = c.check({ silent: true });
      expect(c.status).toBe(status);
      expect(c.errorStage).toBe(errorStage);
      await pending;
      expect(c.info).toEqual(UPDATE);
      expect(port.calls.filter((call) => call === 'check')).toHaveLength(1);
      await downloading;
    },
  );

  it('a non-silent check still shows checking from upToDate', async () => {
    const port = makeFakeUpdater();
    const c = new UpdateController(port);
    await c.check();
    const pending = c.check();
    expect(c.status).toBe('checking');
    await pending;
    expect(c.status).toBe('upToDate');
  });

  it('startRechecks ticks silently every six hours and its stop function ends them', async () => {
    vi.useFakeTimers();
    try {
      const options = { failCheck: false };
      const port = makeFakeUpdater(options);
      const c = new UpdateController(port);
      await c.check();
      options.failCheck = true;
      const stop = c.startRechecks();
      await vi.advanceTimersByTimeAsync(6 * 60 * 60 * 1000 - 1);
      expect(port.calls).toEqual(['check']);
      await vi.advanceTimersByTimeAsync(1);
      expect(port.calls).toEqual(['check', 'check']);
      expect(c.status).toBe('upToDate');
      stop();
      await vi.advanceTimersByTimeAsync(6 * 60 * 60 * 1000);
      expect(port.calls).toEqual(['check', 'check']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('startRechecks accepts a scheduler and interval and returns its stop function', async () => {
    let tick!: () => void;
    let interval = 0;
    const stop = () => {};
    const port = makeFakeUpdater();
    const c = new UpdateController(port);
    const cancel = c.startRechecks(123, (fn, ms) => { tick = fn; interval = ms; return stop; });
    expect(interval).toBe(123);
    expect(cancel).toBe(stop);
    tick();
    await c.check({ silent: true });
    expect(c.status).toBe('upToDate');
    expect(port.calls).toEqual(['check']);
  });

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

  it('shares one request between overlapping checks and applies its result once', async () => {
    const resolvers: ((v: typeof UPDATE | null) => void)[] = [];
    const port = {
      ...makeFakeUpdater({ update: UPDATE }),
      check: () => new Promise<typeof UPDATE | null>((r) => { resolvers.push(r); }),
    };
    const c = new UpdateController(port);
    const checkA = c.check();
    const checkB = c.check();
    expect(resolvers).toHaveLength(1);
    resolvers[0](UPDATE);
    resolvers[1]?.(null);
    await Promise.all([checkA, checkB]);
    expect(c.status).toBe('available');
    expect(c.info).toEqual(UPDATE);
    await c.download();
    expect(c.status).toBe('ready');
    await c.check();
    expect(c.status).toBe('ready');
    expect(c.info).toEqual(UPDATE);
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

  it('retries the install of the already downloaded update after an install failure', async () => {
    const calls: string[] = [];
    let failNext = true;
    const c = new UpdateController({
      check: async () => UPDATE,
      download: async () => { calls.push('download'); },
      install: async () => {
        calls.push('install');
        if (failNext) {
          failNext = false;
          throw new Error('install failed');
        }
      },
    });
    await c.check();
    await c.download();
    await c.install();
    expect(c.status).toBe('error');
    expect(c.errorStage).toBe('install');
    await c.install();
    expect(c.status).toBe('installing');
    expect(calls).toEqual(['download', 'install', 'install']);
  });

  it('is ignored after a check or download failure', async () => {
    const port = makeFakeUpdater({ update: UPDATE, failDownload: true });
    const c = new UpdateController(port);
    await c.check();
    await c.download();
    expect(c.errorStage).toBe('download');
    await c.install();
    expect(c.status).toBe('error');
    expect(c.errorStage).toBe('download');
    expect(port.calls).not.toContain('install');
  });
});

describe('UpdateController.check after an install failure', () => {
  it('keeps the downloaded update installable: check() is ignored in the install error state', async () => {
    const port = makeFakeUpdater({ update: UPDATE, failInstall: true });
    const c = new UpdateController(port);
    await c.check();
    await c.download();
    await c.install();
    await c.check();
    expect(port.calls).toEqual(['check', 'download', 'install']);
    expect(c.status).toBe('error');
    expect(c.errorStage).toBe('install');
  });
});

describe('UpdateController.check silent flag when checks overlap', () => {
  /** A port whose check stays pending until the test settles it. */
  function deferredCheck() {
    let reject: (e: Error) => void = () => {};
    const port = {
      check: () => new Promise<null>((_, rej) => { reject = rej; }),
      download: async () => {},
      install: async () => {},
    };
    return { port, fail: () => reject(new Error('offline')) };
  }

  it('turns a silent check in flight into a non-silent one when a non-silent check joins it', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const d = deferredCheck();
    const c = new UpdateController(d.port);
    const start = c.check({ silent: true });
    const settings = c.check();
    d.fail();
    await Promise.all([start, settings]);
    expect(c.status).toBe('error');
    expect(c.errorStage).toBe('check');
    logged.mockRestore();
  });

  it('keeps a non-silent check in flight non-silent when a silent check joins it', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const d = deferredCheck();
    const c = new UpdateController(d.port);
    const settings = c.check();
    const start = c.check({ silent: true });
    d.fail();
    await Promise.all([settings, start]);
    expect(c.status).toBe('error');
    expect(c.errorStage).toBe('check');
    logged.mockRestore();
  });
});
