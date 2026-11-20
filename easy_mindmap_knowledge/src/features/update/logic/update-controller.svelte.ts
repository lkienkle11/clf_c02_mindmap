import type { DownloadProgress, UpdateInfo, UpdaterPort } from './updater-port';
import { percentDone } from './format';

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'upToDate'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'installing'
  | 'error';

type ErrorStage = 'check' | 'download' | 'install';

export class UpdateController {
  status = $state<UpdateStatus>('idle');
  info = $state.raw<UpdateInfo | null>(null);
  progress = $state.raw<DownloadProgress | null>(null);
  errorStage = $state<ErrorStage | null>(null);
  percent = $derived(this.progress ? percentDone(this.progress.downloaded, this.progress.total) : null);

  private readonly port: UpdaterPort;
  private inflightCheck: Promise<void> | null = null;

  constructor(port: UpdaterPort) {
    this.port = port;
  }

  /** Overlapping checks share one request, so they cannot overwrite each other's result. */
  check(opts: { silent?: boolean } = {}): Promise<void> {
    if (this.status === 'downloading' || this.status === 'ready' || this.status === 'installing') {
      return Promise.resolve();
    }
    this.inflightCheck ??= this.runCheck(opts).finally(() => {
      this.inflightCheck = null;
    });
    return this.inflightCheck;
  }

  private async runCheck(opts: { silent?: boolean }): Promise<void> {
    this.status = 'checking';
    this.errorStage = null;
    try {
      const found = await this.port.check();
      // A newer check may already have moved on (available, downloading, ready...): drop this stale result.
      if (this.status !== 'checking') return;
      this.info = found;
      this.status = found ? 'available' : 'upToDate';
    } catch (e) {
      if (this.status !== 'checking') return;
      if (opts.silent) {
        this.status = 'idle';
        return;
      }
      console.error('Could not check for updates', e);
      this.fail('check');
    }
  }

  async download(): Promise<void> {
    const canDownload = this.status === 'available' || (this.status === 'error' && this.errorStage === 'download');
    if (!canDownload) return;
    this.status = 'downloading';
    this.errorStage = null;
    this.progress = null;
    try {
      await this.port.download((p) => {
        this.progress = p;
      });
      this.status = 'ready';
    } catch (e) {
      console.error('Could not download the update', e);
      this.fail('download');
    }
  }

  async install(): Promise<void> {
    const canInstall = this.status === 'ready' || (this.status === 'error' && this.errorStage === 'install');
    if (!canInstall) return;
    this.status = 'installing';
    this.errorStage = null;
    try {
      await this.port.install();
    } catch (e) {
      console.error('Could not install the update', e);
      this.fail('install');
    }
  }

  private fail(stage: ErrorStage): void {
    this.errorStage = stage;
    this.status = 'error';
  }
}
