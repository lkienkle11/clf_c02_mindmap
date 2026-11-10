export type ImageMime = 'image/png' | 'image/jpeg';

/** Reads the file signature, not the file name or the browser's guess. null when it is neither PNG nor JPEG. */
export function detectImageMime(bytes: Uint8Array): ImageMime | null {
  const [a, b, c, d] = bytes;
  if (bytes.length >= 8 && a === 0x89 && b === 0x50 && c === 0x4e && d === 0x47) return 'image/png';
  if (bytes.length >= 3 && a === 0xff && b === 0xd8 && c === 0xff) return 'image/jpeg';
  return null;
}

const CHUNK = 0x8000;

/**
 * A `data:` URL for showing bytes in an <img>. The CSP allows `img-src 'self' data:` but not `blob:`, so
 * previews use data: URLs; there is nothing to revoke. The type comes from the signature (PNG if unknown).
 */
export function bytesToDataUrl(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return `data:${detectImageMime(bytes) ?? 'image/png'};base64,${btoa(binary)}`;
}
