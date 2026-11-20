export interface UpdateInfo {
  version: string;
  sizeBytes: number | null;
  notes: string | null;
}

export interface DownloadProgress {
  downloaded: number;
  total: number | null;
}

export interface UpdaterPort {
  /** Resolves to the newer release, or null when the app is already up to date. */
  check(): Promise<UpdateInfo | null>;
  /** Downloads the update found by the last check. */
  download(onProgress: (p: DownloadProgress) => void): Promise<void>;
  /** Installs the downloaded update and restarts the app. */
  install(): Promise<void>;
}
