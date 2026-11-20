import { describe, expect, it } from 'vitest';
import { addSizes } from './add-sizes.mjs';

describe('addSizes', () => {
  it('adds the matching asset size for every platform key', () => {
    const latest = {
      version: '0.1.1',
      notes: 'Release notes',
      pub_date: '2026-11-20T00:00:00Z',
      platforms: {
        'darwin-aarch64': { signature: 'mac-signature', url: 'https://github.com/o/r/releases/download/v0.1.1/app.tar.gz' },
        'windows-x86_64': { signature: 'win-signature', url: 'https://github.com/o/r/releases/download/v0.1.1/setup.exe' },
      },
    };

    expect(addSizes(latest, [
      { name: 'setup.exe', size: 456 },
      { name: 'unrelated.zip', size: 999 },
      { name: 'app.tar.gz', size: 123 },
    ])).toEqual({ ...latest, sizes: { 'darwin-aarch64': 123, 'windows-x86_64': 456 } });
  });

  it('decodes the final URL path segment before matching an asset name', () => {
    const latest = {
      platforms: {
        'darwin-aarch64': { url: 'https://example.com/releases/AWS%20Mindmap.app.tar.gz?download=1#asset' },
      },
    };

    expect(addSizes(latest, [{ name: 'AWS Mindmap.app.tar.gz', size: 321 }]))
      .toEqual({ ...latest, sizes: { 'darwin-aarch64': 321 } });
  });

  it('throws an Error naming the platform when its asset is missing', () => {
    const latest = { platforms: { 'windows-x86_64': { url: 'https://example.com/setup.exe' } } };

    expect(() => addSizes(latest, [])).toThrow(Error);
    expect(() => addSizes(latest, [])).toThrow('windows-x86_64');
  });

  it('returns a copy without mutating the input object', () => {
    const latest = {
      version: '0.1.1',
      platforms: { 'darwin-aarch64': { url: 'https://example.com/app.tar.gz' } },
      sizes: { previous: 999 },
    };
    const before = structuredClone(latest);

    const result = addSizes(latest, [{ name: 'app.tar.gz', size: 123 }]);

    expect(result).not.toBe(latest);
    expect(latest).toEqual(before);
    expect(result).toEqual({ ...before, sizes: { 'darwin-aarch64': 123 } });
  });
});
