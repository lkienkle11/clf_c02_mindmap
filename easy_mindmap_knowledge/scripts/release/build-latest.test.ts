import { describe, expect, it } from 'vitest';
import { buildLatest } from './build-latest.mjs';

const mac = 'AWS.CLF-C02.Mindmap_0.2.1_universal.app.tar.gz';
const win = 'AWS.CLF-C02.Mindmap_0.2.1_x64-setup.exe';
const linux = 'AWS.CLF-C02.Mindmap_0.2.1_amd64.deb';
const input = {
  version: '0.2.1',
  repo: 'owner/mindmap',
  tag: 'v0.2.1',
  assets: [mac, win, linux, `${mac}.sig`, 'AWS.CLF-C02.Mindmap_0.2.1_universal.dmg'].map(name => ({ name })),
  sigs: { [mac]: ' mac-signature\n', [win]: '\twin-signature ', [linux]: 'linux-signature\r\n' },
};

describe('buildLatest', () => {
  // Catches incorrect platform mapping, untrimmed signatures and extra entry fields.
  it('builds the four platform entries with public URLs and trimmed signatures', () => {
    const before = Date.now();
    const result = buildLatest(input);

    expect(result.platforms).toEqual({
      'darwin-aarch64': {
        signature: 'mac-signature',
        url: 'https://github.com/owner/mindmap/releases/download/v0.2.1/AWS.CLF-C02.Mindmap_0.2.1_universal.app.tar.gz',
      },
      'darwin-x86_64': {
        signature: 'mac-signature',
        url: 'https://github.com/owner/mindmap/releases/download/v0.2.1/AWS.CLF-C02.Mindmap_0.2.1_universal.app.tar.gz',
      },
      'windows-x86_64': {
        signature: 'win-signature',
        url: 'https://github.com/owner/mindmap/releases/download/v0.2.1/AWS.CLF-C02.Mindmap_0.2.1_x64-setup.exe',
      },
      'linux-x86_64': {
        signature: 'linux-signature',
        url: 'https://github.com/owner/mindmap/releases/download/v0.2.1/AWS.CLF-C02.Mindmap_0.2.1_amd64.deb',
      },
    });
    expect(Date.parse(result.pub_date)).toBeGreaterThanOrEqual(before);
    expect(Date.parse(result.pub_date)).toBeLessThanOrEqual(Date.now());
    expect(new Date(result.pub_date).toISOString()).toBe(result.pub_date);
  });

  // Catches raw asset names in URLs and matching against a URL instead of the name.
  it('encodes unusual characters in asset names', () => {
    const name = 'Mind map #1+%é_universal.app.tar.gz';
    const result = buildLatest({
      ...input,
      assets: [{ name }, { name: win }, { name: linux }],
      sigs: { ...input.sigs, [name]: 'signature' },
    });

    expect(result.platforms['darwin-aarch64'].url).toBe(
      'https://github.com/owner/mindmap/releases/download/v0.2.1/Mind%20map%20%231%2B%25%C3%A9_universal.app.tar.gz',
    );
  });

  // Catches silently omitted required platforms and accidental .sig/.dmg matches.
  it('throws naming the platform when its installer asset is missing', () => {
    for (const [name, platform] of [[mac, 'darwin-aarch64'], [win, 'windows-x86_64'], [linux, 'linux-x86_64']]) {
      const run = () => buildLatest({ ...input, assets: input.assets.filter(asset => asset.name !== name) });
      expect(run).toThrow(Error);
      expect(run).toThrow(platform);
    }
  });

  // Catches absent or whitespace-only signatures being published.
  it('throws naming the platform when its signature is missing', () => {
    for (const [name, platform] of [[mac, 'darwin-aarch64'], [win, 'windows-x86_64'], [linux, 'linux-x86_64']]) {
      const sigs: Record<string, string> = { ...input.sigs };
      delete sigs[name];
      expect(() => buildLatest({ ...input, sigs })).toThrow(platform);
      expect(() => buildLatest({ ...input, sigs: { ...input.sigs, [name]: ' \n' } })).toThrow(platform);
    }
  });

  // Catches choosing an arbitrary installer when multiple suffix matches exist.
  it('throws when two assets match one platform', () => {
    for (const [name, platform] of [[mac, 'darwin-aarch64'], [win, 'windows-x86_64'], [linux, 'linux-x86_64']]) {
      expect(() => buildLatest({ ...input, assets: [...input.assets, { name: `other_${name}` }] }))
        .toThrow(platform);
    }
  });

  // Catches hardcoded release metadata or unintended default notes.
  it('notes is an empty string and version, repo and tag are used', () => {
    const result = buildLatest({ ...input, version: '3.4.5', repo: 'another/project', tag: 'release-3.4.5' });

    expect(result.version).toBe('3.4.5');
    expect(result.notes).toBe('');
    expect(result.platforms['linux-x86_64'].url).toBe(
      'https://github.com/another/project/releases/download/release-3.4.5/AWS.CLF-C02.Mindmap_0.2.1_amd64.deb',
    );
  });
});
