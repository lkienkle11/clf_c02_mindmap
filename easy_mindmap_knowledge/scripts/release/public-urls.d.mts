export function usePublicUrls<T extends { platforms: Record<string, { url: string }> }>(
  latest: T,
  assets: { name: string; apiUrl?: string }[],
  repo: string,
  tag: string,
): T;
