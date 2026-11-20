export function addSizes<T extends { platforms: Record<string, { url: string }> }>(
  latest: T,
  assets: { name: string; size: number }[],
): Omit<T, 'sizes'> & { sizes: Record<string, number> };
