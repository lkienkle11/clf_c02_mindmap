import { openUrl } from '@tauri-apps/plugin-opener';

const ALLOWED_PREFIX = 'https://www.youtube.com/results?';

/** True only for YouTube search URLs; the single external destination the app may open. */
export function isAllowedExternalUrl(url: string): boolean {
  return url.startsWith(ALLOWED_PREFIX);
}

export type OpenExternal = (url: string) => Promise<void>;

/** Opens an allowlisted URL in the system browser; anything else throws. */
export const openExternal: OpenExternal = async (url) => {
  if (!isAllowedExternalUrl(url)) throw new Error(`External URL not allowed: ${url}`);
  await openUrl(url);
};
