import type { DownloadProgress, UpdateInfo, UpdaterPort } from './updater-port';
import { percentDone } from './format';
import type { PromptStore } from './prompt-store';

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
  hasUpdate = $derived(
    this.status === 'available' || this.status === 'downloading' || this.status === 'ready' ||
    this.status === 'installing' ||
    (this.status === 'error' && (this.errorStage === 'download' || this.errorStage === 'install')),
  );
  postponedVersion = $state<string | null | undefined>(undefined);
  promptVersion = $state<string | null>(null);
  promptable = $derived(
    this.status === 'available' && this.info !== null && this.postponedVersion !== undefined &&
    this.info.version !== this.postponedVersion && this.info.version === this.promptVersion,
  );

  private readonly port: UpdaterPort;
  private readonly store?: PromptStore;
  private inflightCheck: Promise<void> | null = null;
  /** Whether the request in flight stays quiet on failure; a non-silent caller joining it turns this off. */
  private inflightSilent = false;

  constructor(port: UpdaterPort, store?: PromptStore) {
    this.port = port;
    this.store = store;
  }

  async loadPostponed(): Promise<void> {
    try {
      this.postponedVersion = (await this.store?.get()) ?? null;
    } catch (e) {
      console.error('Could not load the postponed update version', e);
    }
  }

  async postpone(): Promise<void> {
    if (!this.info) return;
    const version = this.info.version;
    this.postponedVersion = version;
    try {
      await this.store?.set(version);
    } catch (e) {
      console.error('Could not store the postponed update version', e);
    }
  }

  async updateNow(): Promise<void> {
    await this.download();
    if (this.status === 'ready') await this.install();
  }

  async checkAtStart(): Promise<void> {
    await this.check({ silent: true });
    if (this.status === 'available' && this.info) this.promptVersion = this.info.version;
  }

  startRechecks(
    intervalMs = 6 * 60 * 60 * 1000,
    schedule: (fn: () => void, ms: number) => () => void = (fn, ms) => {
      const id = setInterval(fn, ms);
      return () => clearInterval(id);
    },
  ): () => void {
    return schedule(() => { void this.check({ silent: true }); }, intervalMs);
  }

  /**
   * Overlapping checks share one request, so they cannot overwrite each other's result. The request is silent
   * only while every caller asked for silence. An install error is left alone so the downloaded update stays installable.
   */
  check(opts: { silent?: boolean } = {}): Promise<void> {
    const keepsDownload = this.status === 'error' && this.errorStage === 'install';
    if (keepsDownload || this.status === 'downloading' || this.status === 'ready' || this.status === 'installing') {
      return Promise.resolve();
    }
    if (opts.silent && (this.status === 'available' || (this.status === 'error' && this.errorStage !== 'check'))) {
      return Promise.resolve();
    }
    if (this.inflightCheck) {
      if (!opts.silent) {
        this.inflightSilent = false;
        if (this.status === 'upToDate') this.status = 'checking';
      }
      return this.inflightCheck;
    }
    this.inflightSilent = opts.silent ?? false;
    this.inflightCheck = this.runCheck(this.inflightSilent && this.status === 'upToDate').finally(() => {
      this.inflightCheck = null;
    });
    return this.inflightCheck;
  }

  private async runCheck(keepStatus: boolean): Promise<void> {
    if (!keepStatus) {
      this.status = 'checking';
      this.errorStage = null;
    }
    // Quiet re-checks retain upToDate; a manual caller joining promotes them to checking.
    const isCurrent = () => this.status === (keepStatus && this.inflightSilent ? 'upToDate' : 'checking');
    try {
      const found = await this.port.check();
      // A newer check may already have moved on (available, downloading, ready...): drop this stale result.
      if (!isCurrent()) return;
      this.info = found;
      this.status = found ? 'available' : 'upToDate';
    } catch (e) {
      if (!isCurrent()) return;
      if (this.inflightSilent) {
        if (!keepStatus) this.status = 'idle';
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
