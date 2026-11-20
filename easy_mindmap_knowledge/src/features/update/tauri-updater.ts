/**
 * Size lookup decision (Task 8 spike). The `Update` class of @tauri-apps/plugin-updater exposes
 * neither the download url nor the target key, only `rawJson` (the whole latest.json). So the
 * adapter picks the size by the platform key of the machine it runs on, using the webview
 * user agent (no extra package):
 *   latest.json top level: "sizes": { "<os>-<arch>": <bytes as a JSON number> }
 *   os   = "darwin" | "windows" | "linux"; arch = "aarch64" | "x86_64"
 *   example: "sizes": { "darwin-aarch64": 8123456, "darwin-x86_64": 8345678, "windows-x86_64": 5234567 }
 * The keys are the same platform keys Tauri uses in latest.json "platforms", and the number is the
 * byte size of that platform's updater artifact (the file at platforms[key].url).
 * On macOS the webview user agent never tells the architecture, so when several darwin-* entries
 * exist the largest one is shown (the size is only informational). Missing or invalid: null.
 */
import type { DownloadProgress, UpdateInfo, UpdaterPort } from './logic/updater-port';

type CheckFn = typeof import('@tauri-apps/plugin-updater').check;
type RelaunchFn = typeof import('@tauri-apps/plugin-process').relaunch;
type UpdateLike = NonNullable<Awaited<ReturnType<CheckFn>>>;

const CHECK_TIMEOUT_MS = 30_000;
const DOWNLOAD_TIMEOUT_MS = 600_000;

export interface TauriUpdaterDeps {
  check?: CheckFn;
  relaunch?: RelaunchFn;
  /** Test override; defaults to navigator.userAgent. */
  userAgent?: string;
}

function platformSize(rawJson: Record<string, unknown>, userAgent: string): number | null {
  const sizes = rawJson.sizes;
  if (typeof sizes !== 'object' || sizes === null) return null;
  const os = /Windows/i.test(userAgent) ? 'windows' : /Mac/i.test(userAgent) ? 'darwin' : /Linux/i.test(userAgent) ? 'linux' : null;
  if (os === null) return null;
  const arch = /arm64|aarch64/i.test(userAgent) ? 'aarch64' : /x64|x86_64|Win64|amd64/i.test(userAgent) ? 'x86_64' : null;
  const entries = Object.entries(sizes as Record<string, unknown>).filter(
    (e): e is [string, number] => e[0].startsWith(`${os}-`) && typeof e[1] === 'number' && Number.isFinite(e[1]),
  );
  const exact = entries.find(([k]) => k === `${os}-${arch}`);
  if (exact) return exact[1];
  return entries.length > 0 ? Math.max(...entries.map(([, n]) => n)) : null;
}

export function createTauriUpdater(deps: TauriUpdaterDeps = {}): UpdaterPort {
  // Dynamic imports: development builds never load the plugins.
  const check: CheckFn = deps.check ?? (async (o) => (await import('@tauri-apps/plugin-updater')).check(o));
  const relaunch: RelaunchFn = deps.relaunch ?? (async () => (await import('@tauri-apps/plugin-process')).relaunch());
  const userAgent = deps.userAgent ?? (typeof navigator === 'undefined' ? '' : navigator.userAgent);
  let current: UpdateLike | null = null;
  let busy = false;

  return {
    async check(): Promise<UpdateInfo | null> {
      const update = await check({ timeout: CHECK_TIMEOUT_MS });
      if (!busy) {
        try {
          await current?.close();
        } catch {
          // A failed release must not break the check.
        }
      }
      current = update;
      if (update === null) return null;
      return { version: update.version, sizeBytes: platformSize(update.rawJson, userAgent) };
    },
    async download(onProgress: (p: DownloadProgress) => void): Promise<void> {
      if (current === null) throw new Error('No update to download');
      let downloaded = 0;
      let total: number | null = null;
      busy = true;
      try {
        await current.download((e) => {
        if (e.event === 'Started') {
          total = e.data.contentLength ?? null;
          onProgress({ downloaded: 0, total });
        } else if (e.event === 'Progress') {
          downloaded += e.data.chunkLength;
          onProgress({ downloaded, total });
        }
      }, { timeout: DOWNLOAD_TIMEOUT_MS });
      } finally {
        busy = false;
      }
    },
    async install(): Promise<void> {
      if (current === null) throw new Error('No update to install');
      busy = true;
      try {
        await current.install();
        await relaunch();
      } finally {
        busy = false;
      }
    },
  };
}
