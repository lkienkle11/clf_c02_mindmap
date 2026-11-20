export type BuildChannel = 'production' | 'development';

/** 'production' only when the build sets VITE_APP_CHANNEL to exactly "production". */
export function getBuildChannel(): BuildChannel {
  return import.meta.env.VITE_APP_CHANNEL === 'production' ? 'production' : 'development';
}
