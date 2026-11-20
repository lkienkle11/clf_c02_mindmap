import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/**
 * tauri-action writes api.github.com asset URLs into latest.json while the release is a draft. Those URLs are
 * rate limited to 60 requests per hour per IP for clients without a token, so the app's download fails.
 * Public download URLs (github.com/<repo>/releases/download/<tag>/<name>) have no such limit.
 */
export function usePublicUrls(latest, assets, repo, tag) {
  const platforms = {};
  for (const [platform, entry] of Object.entries(latest.platforms)) {
    const name = decodeURIComponent(new URL(entry.url).pathname.split('/').pop());
    const asset = assets.find(a => a.name === name || (a.apiUrl && a.apiUrl === entry.url));
    if (!asset) throw new Error(`Missing asset for platform ${platform}`);
    platforms[platform] = {
      ...entry,
      url: `https://github.com/${repo}/releases/download/${tag}/${encodeURIComponent(asset.name)}`,
    };
  }
  return { ...latest, platforms };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [latestPath, assetsPath, repo, tag] = process.argv.slice(2);
  if (!latestPath || !assetsPath || !repo || !tag) {
    console.error('Usage: public-urls.mjs <latest.json> <assets.json> <owner/repo> <tag>');
    process.exit(1);
  }
  const latest = JSON.parse(readFileSync(latestPath, 'utf8'));
  const assets = JSON.parse(readFileSync(assetsPath, 'utf8'));
  const result = usePublicUrls(latest, Array.isArray(assets) ? assets : assets.assets, repo, tag);
  writeFileSync(latestPath, JSON.stringify(result, null, 2) + '\n');
}
