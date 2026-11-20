import { describe, expect, it } from 'vitest';
import { usePublicUrls } from './public-urls.mjs';

const api = (id: number) => `https://api.github.com/repos/o/r/releases/assets/${id}`;

describe('usePublicUrls', () => {
  it('replaces draft API asset URLs with public download URLs for every platform', () => {
    const latest = {
      version: '0.2.1',
      platforms: {
        'darwin-aarch64': { signature: 'mac', url: api(1) },
        'windows-x86_64': { signature: 'win', url: api(2) },
      },
    };
    const assets = [
      { name: 'App_0.2.1_universal.app.tar.gz', apiUrl: api(1) },
      { name: 'App_0.2.1_x64-setup.exe', apiUrl: api(2) },
    ];

    expect(usePublicUrls(latest, assets, 'o/r', 'v0.2.1').platforms).toEqual({
      'darwin-aarch64': { signature: 'mac', url: 'https://github.com/o/r/releases/download/v0.2.1/App_0.2.1_universal.app.tar.gz' },
      'windows-x86_64': { signature: 'win', url: 'https://github.com/o/r/releases/download/v0.2.1/App_0.2.1_x64-setup.exe' },
    });
  });

  it('encodes unusual characters in the asset name', () => {
    const latest = { platforms: { 'linux-x86_64': { url: api(3) } } };
    const result = usePublicUrls(latest, [{ name: 'My App 1.0 #1.deb', apiUrl: api(3) }], 'o/r', 'v1.0.0');

    expect(result.platforms['linux-x86_64'].url).toBe('https://github.com/o/r/releases/download/v1.0.0/My%20App%201.0%20%231.deb');
  });

  it('keeps an already public URL and matches it by file name', () => {
    const url = 'https://github.com/o/r/releases/download/v1.0.0/setup.exe';
    const latest = { platforms: { 'windows-x86_64': { url } } };

    expect(usePublicUrls(latest, [{ name: 'setup.exe', apiUrl: api(4) }], 'o/r', 'v1.0.0').platforms['windows-x86_64'].url).toBe(url);
  });

  it('throws an Error naming the platform when no asset matches', () => {
    const latest = { platforms: { 'darwin-aarch64': { url: api(9) } } };

    expect(() => usePublicUrls(latest, [], 'o/r', 'v1.0.0')).toThrow('darwin-aarch64');
  });

  it('does not mutate its input and keeps the other fields', () => {
    const latest = { version: '1.0.0', notes: 'n', sizes: { x: 1 }, platforms: { 'linux-x86_64': { signature: 's', url: api(5) } } };
    const before = structuredClone(latest);

    const result = usePublicUrls(latest, [{ name: 'a.deb', apiUrl: api(5) }], 'o/r', 'v1.0.0');

    expect(latest).toEqual(before);
    expect(result).toMatchObject({ version: '1.0.0', notes: 'n', sizes: { x: 1 } });
  });
});
