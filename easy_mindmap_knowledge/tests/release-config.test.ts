// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(__dirname, '..');
const tauriDir = join(root, 'src-tauri');
const read = (...p: string[]) => JSON.parse(readFileSync(join(tauriDir, ...p), 'utf8'));

const ENDPOINT = 'https://github.com/lkienkle11/clf_c02_mindmap/releases/latest/download/latest.json';

// True when any key at any depth starts with the given prefix.
function hasKeyPrefix(value: unknown, prefix: string): boolean {
  if (Array.isArray(value)) return value.some((v) => hasKeyPrefix(v, prefix));
  if (value && typeof value === 'object') {
    return Object.entries(value).some(([k, v]) => k.startsWith(prefix) || hasKeyPrefix(v, prefix));
  }
  return false;
}

const PROD_ICONS = [
  'icons/32x32.png',
  'icons/128x128.png',
  'icons/128x128@2x.png',
  'icons/icon.icns',
  'icons/icon.ico'
];

describe('dev Tauri config', () => {
  const dev = read('tauri.conf.json');

  it('is the dev app with its own identifier', () => {
    expect(dev.identifier).toBe('app.awsclf.mindmap.dev');
    expect(dev.identifier.endsWith('.dev')).toBe(true);
    expect(dev.productName).toBe('AWS CLF-C02 Mindmap (Dev)');
    expect(dev.app.windows[0].title).toBe('AWS CLF-C02 Mindmap (Dev)');
  });

  it('lists the dev icons under icons-dev/ and every file exists', () => {
    expect(dev.bundle.icon.length).toBeGreaterThan(0);
    for (const icon of dev.bundle.icon as string[]) {
      expect(icon.startsWith('icons-dev/')).toBe(true);
      expect(existsSync(join(tauriDir, icon))).toBe(true);
    }
  });

  it('has no updater config and no updater artifacts', () => {
    expect(dev.plugins?.updater).toBeUndefined();
    expect(dev.bundle.createUpdaterArtifacts).toBeUndefined();
  });
});

describe('production Tauri overlay', () => {
  const prod = read('tauri.production.conf.json');

  it('restores the production identity', () => {
    expect(prod.identifier).toBe('app.awsclf.mindmap');
    expect(prod.productName).toBe('AWS CLF-C02 Mindmap');
    expect(prod.app.windows[0].title).toBe('AWS CLF-C02 Mindmap');
  });

  it('creates updater artifacts and installs per user on Windows', () => {
    expect(prod.bundle.createUpdaterArtifacts).toBe(true);
    expect(prod.bundle.targets).toEqual(['app', 'dmg', 'nsis', 'deb']);
    expect(prod.bundle.windows.nsis.installMode).toBe('currentUser');
  });

  it('configures the updater with a public key and one https endpoint', () => {
    const { pubkey, endpoints } = prod.plugins.updater;
    expect(typeof pubkey).toBe('string');
    expect(pubkey.length).toBeGreaterThan(0);
    expect(endpoints).toEqual([ENDPOINT]);
    expect(endpoints[0].startsWith('https://')).toBe(true);
  });

  it('lists the production icons explicitly and does not inherit the dev icons', () => {
    expect(prod.bundle.icon).toEqual(PROD_ICONS);
    for (const icon of prod.bundle.icon as string[]) {
      expect(icon.startsWith('icons/')).toBe(true);
      expect(existsSync(join(tauriDir, icon))).toBe(true);
    }
  });

  it('sets no dangerous option at any depth, in either config', () => {
    expect(hasKeyPrefix(prod, 'dangerous')).toBe(false);
    expect(hasKeyPrefix(read('tauri.conf.json'), 'dangerous')).toBe(false);
  });

  it('the dangerous-key helper catches a prefixed key and a nested array key', () => {
    expect(hasKeyPrefix({ plugins: { updater: { dangerousInsecureTransport: true } } }, 'dangerous')).toBe(true);
    expect(hasKeyPrefix({ a: [{ b: { dangerousX: 1 } }] }, 'dangerous')).toBe(true);
    expect(hasKeyPrefix({ plugins: { updater: { pubkey: 'x' } } }, 'dangerous')).toBe(false);
  });
});

describe('capability file', () => {
  it('grants the updater and process restart permissions', () => {
    const cap = read('capabilities', 'default.json') as { permissions: unknown[] };
    expect(cap.permissions).toContain('updater:default');
    expect(cap.permissions).toContain('process:allow-restart');
  });
});

describe('release workflow shape', () => {
  const workflow = (name: string) => readFileSync(join(root, '..', '.github', 'workflows', name), 'utf8');
  const release = workflow('mindmap-release.yml');
  const finalize = release.slice(release.indexOf('\n  finalize:'));
  const countOf = (text: string, needle: string) => text.split(needle).length - 1;

  it('builds the platforms in parallel into one pre-created draft release', () => {
    expect(release).not.toMatch(/max-parallel/);
    expect(release).toMatch(/releaseId: \$\{\{ needs\.draft\.outputs\.release_id \}\}/);
    expect(release).toMatch(/uploadUpdaterJson: false/);
    expect(release).not.toMatch(/releaseDraft:/);
  });

  it('runs the tests once, in verify, not in every build job', () => {
    expect(countOf(release, 'npm test')).toBe(1);
    expect(countOf(release, 'npm run check')).toBe(1);
    expect(release.indexOf('npm test')).toBeLessThan(release.indexOf('\n  draft:'));
  });

  it('finalize builds latest.json from the assets, checks the platforms and publishes last', () => {
    const steps = ['build-latest.mjs', 'assert-platforms.mjs', 'add-sizes.mjs', 'changelog.mjs', 'gh release upload', '--draft=false'];
    const positions = steps.map((s) => finalize.indexOf(s));
    expect(positions.every((p) => p > -1)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(release).not.toMatch(/public-urls/);
  });

  it('keeps every action pinned by full SHA and the signing key in the tauri-action step only', () => {
    const uses = [...release.matchAll(/uses: ([^\s]+)/g)].map((m) => m[1]);
    expect(uses.length).toBeGreaterThan(0);
    expect(uses.every((u) => /@[0-9a-f]{40}$/.test(u))).toBe(true);
    const tauriStep = release.slice(release.indexOf('tauri-apps/tauri-action@'), release.indexOf('\n  finalize:'));
    expect(tauriStep).toContain('TAURI_SIGNING_PRIVATE_KEY:');
    expect(release.replace(tauriStep, '')).not.toContain('TAURI_SIGNING_PRIVATE_KEY');
  });

  it('a failed platform leaves a draft: builds do not stop each other, finalize needs all builds, and builds need the draft', () => {
    expect(release).toMatch(/fail-fast: false/);
    expect(release).toMatch(/\n  build:\n    needs: \[verify, draft\]/);
    expect(finalize).toMatch(/needs: build\b/);
  });

  it('the draft job only reuses a draft release of the tag and takes the id of a new one from the creation response', () => {
    expect(release).toMatch(/select\(\.tag_name == \\"\$TAG\\" and \.draft\)/);
    // The releases list lags a moment behind a creation (seen on v0.2.2), so the id must come from the POST itself.
    expect(release).toMatch(/gh api -X POST "repos\/\$GH_REPO\/releases"[^\n]*draft=true[^\n]*--jq \.id/);
    expect(release).not.toMatch(/gh release create/);
  });

  it('the pull request workflow builds Tauri only for native changes and tests once', () => {
    const pr = workflow('mindmap-build.yml');
    expect(pr).toMatch(/needs\.changes\.outputs\.native == 'true'/);
    expect(countOf(pr, 'npm test')).toBe(1);
  });

  it('the native-change check lists renames as a delete plus an add and builds when it cannot list files', () => {
    const pr = workflow('mindmap-build.yml');
    expect(pr).toContain('git diff --name-only --no-renames');
    expect(pr).toMatch(/\|\| \{ echo "native=true" >> "\$GITHUB_OUTPUT"; exit 0; \}/);
  });
});

describe('workflow time limits', () => {
  const workflow = (name: string) => readFileSync(join(root, '..', '.github', 'workflows', name), 'utf8');
  const jobBlock = (text: string, job: string) => {
    const start = text.indexOf(`\n  ${job}:`);
    const rest = text.slice(start + 1);
    const next = rest.slice(1).search(/\n  [a-z-]+:\n/);
    return next === -1 ? rest : rest.slice(0, next + 1);
  };

  it.each([
    ['mindmap-release.yml', 'build'],
    ['mindmap-build.yml', 'build'],
    ['mindmap-release.yml', 'verify'],
  ])('%s job %s has a time limit so a stuck step fails fast', (file, job) => {
    expect(jobBlock(workflow(file), job)).toMatch(/timeout-minutes: \d+/);
  });

  it.each(['mindmap-release.yml', 'mindmap-build.yml'])('%s installs the Linux packages with retries', (file) => {
    const lines = workflow(file).split('\n').filter((l) => l.includes('apt-get'));
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.every((l) => l.includes('Acquire::Retries=3'))).toBe(true);
  });
});
