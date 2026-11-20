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

  constructor(port: UpdaterPort) {
    this.port = port;
  }

  async check(opts: { silent?: boolean } = {}): Promise<void> {
    if (this.status === 'downloading' || this.status === 'ready' || this.status === 'installing') return;
    this.status = 'checking';
    this.errorStage = null;
    try {
      const found = await this.port.check();
      this.info = found;
      this.status = found ? 'available' : 'upToDate';
    } catch (e) {
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
    if (this.status !== 'ready') return;
    this.status = 'installing';
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
