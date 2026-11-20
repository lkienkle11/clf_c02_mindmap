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
