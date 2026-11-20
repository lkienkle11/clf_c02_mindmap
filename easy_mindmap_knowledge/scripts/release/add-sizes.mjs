import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function addSizes(latest, assets) {
  const sizes = {};
  for (const [platform, entry] of Object.entries(latest.platforms)) {
    const name = decodeURIComponent(new URL(entry.url).pathname.split('/').pop());
    const asset = assets.find(asset => asset.name === name);
    if (!asset) throw new Error(`Missing asset for platform ${platform}`);
    sizes[platform] = asset.size;
  }
  return { ...latest, sizes };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [latestPath, assetsPath] = process.argv.slice(2);
  const latest = JSON.parse(readFileSync(latestPath, 'utf8'));
  const assets = JSON.parse(readFileSync(assetsPath, 'utf8'));
  const result = addSizes(latest, Array.isArray(assets) ? assets : assets.assets);
  writeFileSync(latestPath, JSON.stringify(result, null, 2) + '\n');
}
