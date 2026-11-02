// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname, sep } from 'node:path';

const root = resolve(__dirname, '../..');
const src = join(root, 'src');
const features = join(src, 'features');

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const isTest = (f: string) => /\.test\.ts$/.test(f);

interface Imp {
  spec: string;
  typeOnly: boolean;
}

function importsOf(file: string): Imp[] {
  return importsFromCode(readFileSync(file, 'utf8'));
}

function resolveSpec(file: string, spec: string): string | null {
  if (spec.startsWith('@/')) return join(src, spec.slice(2));
  if (spec.startsWith('.')) return resolve(dirname(file), spec);
  return null;
}

describe('architecture boundaries', () => {
  it('logic folders import no svelte, tauri or persistence', () => {
    expect(existsSync(features), 'src/features must exist').toBe(true);
    const logicFiles = walk(features).filter(
      (f) => f.includes(`${sep}logic${sep}`) && f.endsWith('.ts') && !isTest(f),
    );
    const violations: string[] = [];
    for (const f of logicFiles) {
      for (const { spec, typeOnly } of importsOf(f)) {
        const bad =
          /^(svelte|@tauri-apps)/.test(spec) ||
          (/persistence\//.test(spec) && !(typeOnly && /persistence\/records$/.test(spec)));
        if (bad) violations.push(`${relative(root, f)} -> ${spec}`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('features import other features only through index', () => {
    expect(existsSync(features), 'src/features must exist').toBe(true);
    const violations: string[] = [];
    for (const f of walk(features).filter((p) => /\.(ts|svelte)$/.test(p))) {
      const own = relative(features, f).split(sep)[0];
      const scripts = f.endsWith('.svelte')
        ? [...readFileSync(f, 'utf8').matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n')
        : null;
      const imps = scripts === null ? importsOf(f) : importsFromCode(scripts);
      for (const { spec } of imps) {
        const target = resolveSpec(f, spec);
        if (!target) continue;
        const rel = relative(features, target);
        if (rel.startsWith('..')) continue;
        const parts = rel.split(sep);
        if (parts[0] === own) continue;
        if (!(parts.length === 1 || (parts.length === 2 && parts[1] === 'index'))) {
          violations.push(`${relative(root, f)} -> ${spec}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('testing/ is imported only by test files', () => {
    const testingDir = join(src, 'testing');
    const violations: string[] = [];
    const files = [...walk(src), ...walk(join(root, 'tests'))].filter((p) => /\.(ts|svelte)$/.test(p));
    for (const f of files) {
      if (isTest(f) || f.startsWith(testingDir + sep)) continue;
      for (const { spec } of importsOf(f)) {
        const target = resolveSpec(f, spec);
        if (target && (target === testingDir || target.startsWith(testingDir + sep))) {
          violations.push(`${relative(root, f)} -> ${spec}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});

function importsFromCode(code: string): Imp[] {
  const out: Imp[] = [];
  for (const m of code.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    out.push({ spec: m[1], typeOnly: false });
  }
  const re = /(?:^|\n)\s*(import|export)\s+(type\s+)?([^'";]*?\sfrom\s+)?['"]([^'"]+)['"]/g;
  for (const m of code.matchAll(re)) {
    if (m[1] === 'export' && !m[3]) continue;
    out.push({ spec: m[4], typeOnly: !!m[2] });
  }
  return out;
}
