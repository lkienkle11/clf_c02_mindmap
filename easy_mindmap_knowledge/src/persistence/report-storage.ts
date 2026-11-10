/** File access for the Report feature. The only seam to the file system and the native folder picker. */
export interface ReportStorage {
  /**
   * Stores an image under the app data dir and returns its relative path, e.g. `report-images/<reportId>-<idx>.png`.
   * The extension follows the bytes' signature (`jpg` for JPEG, otherwise `png`), see imageExtension.
   */
  saveImage(reportId: string, idx: number, bytes: Uint8Array): Promise<string>;
  readImage(relPath: string): Promise<Uint8Array>;
  defaultExportDir(): Promise<string>;
  /** Native folder picker; null when cancelled. */
  pickExportDir(): Promise<string | null>;
  writeText(dir: string, rel: string, text: string): Promise<void>;
  writeBytes(dir: string, rel: string, bytes: Uint8Array): Promise<void>;
  /** null when the file does not exist. */
  readText(dir: string, rel: string): Promise<string | null>;
}

export const IMAGE_DIR = 'report-images';

/** Throws unless `rel` is a non-empty relative path with no `..` segment, no leading slash, no drive letter. */
export function assertSafeRel(rel: string): void {
  const bad = (): never => {
    throw new Error(`unsafe report path: ${JSON.stringify(rel)}`);
  };
  if (typeof rel !== 'string' || rel.length === 0 || rel.includes('\0')) bad();
  if (rel.startsWith('/') || rel.startsWith('\\') || /^[A-Za-z]:/.test(rel)) bad();
  if (rel.split(/[\\/]+/).some((seg) => seg === '..')) bad();
}

/** `jpg` when the bytes start with the JPEG signature, otherwise `png` (screenshots are PNG). */
export function imageExtension(bytes: Uint8Array): 'png' | 'jpg' {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff ? 'jpg' : 'png';
}

/** The relative image path for a report image; the id must be a single safe path segment. */
export function imageRelPath(reportId: string, idx: number, bytes?: Uint8Array): string {
  if (!/^[A-Za-z0-9_-]+$/.test(reportId) || !Number.isInteger(idx) || idx < 0) {
    throw new Error(`unsafe report image id: ${JSON.stringify(reportId)}/${idx}`);
  }
  return `${IMAGE_DIR}/${reportId}-${idx}.${bytes ? imageExtension(bytes) : 'png'}`;
}

/** Used by buildServices until the real storage is wired in. */
export function createUnavailableReportStorage(): ReportStorage {
  const fail = (): Promise<never> => Promise.reject(new Error('report storage unavailable'));
  return {
    saveImage: fail,
    readImage: fail,
    defaultExportDir: fail,
    pickExportDir: fail,
    writeText: fail,
    writeBytes: fail,
    readText: fail,
  };
}
