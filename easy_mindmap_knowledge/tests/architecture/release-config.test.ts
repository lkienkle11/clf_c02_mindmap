// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(__dirname, '../..');

describe('Tauri capability', () => {
  const cap = JSON.parse(readFileSync(join(root, 'src-tauri', 'capabilities', 'default.json'), 'utf8')) as {
    permissions: (string | { identifier: string; allow?: { url: string }[] })[];
  };

  it('does not grant the broad opener:default set', () => {
    expect(cap.permissions).not.toContain('opener:default');
    expect(cap.permissions.filter((p) => typeof p === 'string' && p.startsWith('opener:'))).toEqual([]);
  });

  it('allows opening only YouTube search results and AWS documentation pages', () => {
    const opener = cap.permissions.filter((p) => typeof p === 'object' && p.identifier.startsWith('opener:'));
    expect(opener).toEqual([
      {
        identifier: 'opener:allow-open-url',
        allow: [
          { url: 'https://www.youtube.com/results*' },
          { url: 'https://docs.aws.amazon.com/*' },
          { url: 'https://aws.amazon.com/*' },
        ],
      },
    ]);
  });
});

describe('CI workflow (.github/workflows/mindmap-build.yml)', () => {
  const yml = readFileSync(join(root, '..', '.github', 'workflows', 'mindmap-build.yml'), 'utf8');

  it('keeps the honest NOT-VERIFIED header', () => {
    expect(yml.split('\n')[0]).toMatch(/NOT been run/);
  });
  it('has read-only top-level permissions', () => {
    expect(yml).toMatch(/^permissions:\n {2}contents: read$/m);
  });
  it('cancels superseded runs of the same ref', () => {
    expect(yml).toMatch(/^concurrency:\n {2}group: .*\$\{\{ github\.ref \}\}.*\n {2}cancel-in-progress: true$/m);
  });
  it('runs push only on main (pull requests cover branches)', () => {
    expect(yml).toMatch(/^ {2}push:\n {4}branches: \[main\]$/m);
  });
  it('installs the Linux packages Tauri needs, including libxdo-dev and libssl-dev', () => {
    const line = yml.split('\n').find((l) => l.includes('apt-get install')) ?? '';
    for (const pkg of ['libwebkit2gtk-4.1-dev', 'libxdo-dev', 'libssl-dev', 'librsvg2-dev']) expect(line).toContain(pkg);
  });
});
