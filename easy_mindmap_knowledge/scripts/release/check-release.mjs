import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSameVersions, isGreater, readVersions } from './versions.mjs';

export function checkRelease(tag, files, latestPublished) {
  assertSameVersions(files);
  const version = readVersions(files)[0];
  if (tag !== `v${version}`) throw new Error(`Tag ${tag} does not match the file version v${version}`);
  if (latestPublished !== null && !isGreater(version, latestPublished)) {
    throw new Error(`Version ${version} is not greater than the latest published version ${latestPublished}`);
  }
}

export function assertRealPubkey(overlayText) {
  const pubkey = JSON.parse(overlayText)?.plugins?.updater?.pubkey;
  if (typeof pubkey !== 'string' || pubkey.trim() === '' || pubkey.includes('REPLACE_WITH')) {
    throw new Error('plugins.updater.pubkey in tauri.production.conf.json is missing or still a placeholder; generate the signing key first');
  }
}

function latestPublishedVersion() {
  try {
    const tag = execFileSync('gh', ['release', 'view', '--json', 'tagName', '--jq', '.tagName'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    return tag.replace(/^v/, '');
  } catch (error) {
    const output = `${error.stderr ?? ''}${error.stdout ?? ''}`;
    if (/release not found/i.test(output)) return null;
    throw new Error(`Could not read the latest release: ${output.trim() || error.message}`);
  }
}

function main() {
  const read = relative => readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8');
  const files = {
    packageJson: read('../../package.json'),
    tauriConf: read('../../src-tauri/tauri.conf.json'),
    cargoToml: read('../../src-tauri/Cargo.toml'),
    cargoLock: read('../../src-tauri/Cargo.lock'),
  };
  const tag = process.env.GITHUB_REF_NAME;
  if (!tag) throw new Error('GITHUB_REF_NAME is not set');
  assertRealPubkey(read('../../src-tauri/tauri.production.conf.json'));
  checkRelease(tag, files, latestPublishedVersion());
  console.log(`Release check passed for ${tag}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
