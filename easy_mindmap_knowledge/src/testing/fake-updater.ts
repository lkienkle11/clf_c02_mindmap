import type { DownloadProgress, UpdateInfo, UpdaterPort } from '@/features/update/logic/updater-port';

export interface FakeUpdaterOptions {
  update?: UpdateInfo | null;
  failCheck?: boolean;
  failDownload?: boolean;
  failInstall?: boolean;
  chunks?: DownloadProgress[];
}

/** failDownload stays writable so a test can make a retry succeed. */
export type FakeUpdater = UpdaterPort & { calls: string[]; failDownload: boolean };

export function makeFakeUpdater(o: FakeUpdaterOptions = {}): FakeUpdater {
  const calls: string[] = [];
  return {
    calls,
    failDownload: o.failDownload ?? false,
    async check() {
      calls.push('check');
      if (o.failCheck) throw new Error('check failed');
      return o.update ?? null;
    },
    async download(onProgress) {
      calls.push('download');
      if (this.failDownload) throw new Error('download failed');
      for (const chunk of o.chunks ?? []) onProgress(chunk);
    },
    async install() {
      calls.push('install');
      if (o.failInstall) throw new Error('install failed');
    },
  };
}
