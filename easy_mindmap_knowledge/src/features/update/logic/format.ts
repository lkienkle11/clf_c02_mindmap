const BYTES_PER_MEGABYTE = 1_048_576;
const MIN_SHOWN_MEGABYTES = 0.1;

export function formatMegabytes(bytes: number): string {
  const megabytes = Math.max(bytes / BYTES_PER_MEGABYTE, MIN_SHOWN_MEGABYTES);
  return `${megabytes.toFixed(1)} MB`;
}

export function percentDone(downloaded: number, total: number | null): number | null {
  if (total === null || total <= 0) return null;
  const percent = Math.floor((downloaded / total) * 100);
  return Math.min(100, Math.max(0, percent));
}
