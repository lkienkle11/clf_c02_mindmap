import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const suffixes = {
  'darwin-aarch64': '_universal.app.tar.gz',
  'darwin-x86_64': '_universal.app.tar.gz',
  'windows-x86_64': '_x64-setup.exe',
  'linux-x86_64': '_amd64.deb',
};

export function buildLatest({ version, repo, tag, assets, sigs }) {
  const platforms = {};
  for (const [platform, suffix] of Object.entries(suffixes)) {
    const matches = assets.filter(asset => asset.name.endsWith(suffix));
    if (matches.length === 0) throw new Error(`Missing asset for platform ${platform}`);
    if (matches.length > 1) throw new Error(`Multiple assets for platform ${platform}`);
    const { name } = matches[0];
    const signature = sigs[name]?.trim();
    if (!signature) throw new Error(`Missing signature for platform ${platform}`);
    platforms[platform] = {
      signature,
      url: `https://github.com/${repo}/releases/download/${tag}/${encodeURIComponent(name)}`,
    };
  }
  return { version, notes: '', pub_date: new Date().toISOString(), platforms };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args.length !== 6) {
    console.error('Usage: node scripts/release/build-latest.mjs <assets.json> <sigs-dir> <version> <owner/repo> <tag> <out latest.json>');
    process.exit(1);
  }
  const [assetsPath, sigsDir, version, repo, tag, outPath] = args;
  const parsed = JSON.parse(readFileSync(assetsPath, 'utf8'));
  const assets = Array.isArray(parsed) ? parsed : parsed.assets;
  const sigs = {};
  for (const { name } of assets) {
    if (!Object.values(suffixes).some(suffix => name.endsWith(suffix))) continue;
    try {
      sigs[name] = readFileSync(join(sigsDir, `${name}.sig`), 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  const result = buildLatest({ version, repo, tag, assets, sigs });
  writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
}
