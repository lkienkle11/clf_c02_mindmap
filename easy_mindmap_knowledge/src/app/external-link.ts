import { openUrl } from '@tauri-apps/plugin-opener';
import { isAllowedExternalUrl } from '@/features/lesson';

export { isAllowedExternalUrl };

export type OpenExternal = (url: string) => Promise<void>;

/** Opens an allowlisted URL in the system browser; anything else throws. */
export const openExternal: OpenExternal = async (url) => {
  if (!isAllowedExternalUrl(url)) throw new Error(`External URL not allowed: ${url}`);
  await openUrl(url);
};
