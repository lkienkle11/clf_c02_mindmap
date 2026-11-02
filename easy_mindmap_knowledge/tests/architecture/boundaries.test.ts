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

const stripExt = (p: string) => p.replace(/\.ts$/, '');

/**
 * Whitelist for files under src/features/<f>/logic/: relative imports inside the same logic folder,
 * `@/content/types`, `@/random/*`, and `import type` from `@/persistence/records`. Anything else
 * (packages, Svelte, Tauri, other features, other persistence modules) is a violation.
 */
function logicViolations(code: string, file: string): string[] {
  const at = file.lastIndexOf(`${sep}logic${sep}`);
  const logicRoot = at >= 0 ? file.slice(0, at + `${sep}logic`.length) : dirname(file);
  const allowed = ({ spec, typeOnly }: Imp): boolean => {
    const target = resolveSpec(file, spec);
    if (target === null) return false;
    const t = stripExt(target);
    if (t.startsWith(logicRoot + sep)) return true;
    if (t === join(src, 'content', 'types')) return true;
    if (t.startsWith(join(src, 'random') + sep)) return true;
    return typeOnly && t === join(src, 'persistence', 'records');
  };
  return importsFromCode(code).filter((i) => !allowed(i)).map((i) => i.spec);
}

const FIX = join(features, 'review', 'logic', 'fixture.ts');
const v = (code: string) => logicViolations(code, FIX);

describe('logicViolations fixtures (whitelist)', () => {
  it('flags a bare persistence barrel, aliased or relative', () => {
    expect(v(`import { x } from '../../../persistence';`)).toEqual(['../../../persistence']);
    expect(v(`import { x } from '@/persistence';`)).toEqual(['@/persistence']);
  });
  it('flags persistence subpaths', () => {
    expect(v(`import { x } from '@/persistence/repositories/x';`)).toHaveLength(1);
  });
  it('allows import type from persistence/records, by alias or relative path', () => {
    expect(v(`import type { T } from '../../../persistence/records';`)).toEqual([]);
    expect(v(`import type { T } from '@/persistence/records.ts';`)).toEqual([]);
  });
  it('flags a value import from persistence/records', () => {
    expect(v(`import { T } from '@/persistence/records';`)).toHaveLength(1);
  });
  it('allows the same logic folder, content/types and random', () => {
    expect(v(`import { a } from './review-summary';\nimport { b } from './deep/x';`)).toEqual([]);
    expect(v(`import type { Topic } from '@/content/types';`)).toEqual([]);
    expect(v(`import { shuffle } from '@/random/seeded-random';`)).toEqual([]);
  });
  it('flags packages, svelte, tauri, other features (even their index) and other src modules', () => {
    expect(v(`import { x } from 'svelte';`)).toEqual(['svelte']);
    expect(v(`import { x } from '@tauri-apps/api';`)).toEqual(['@tauri-apps/api']);
    expect(v(`import { clsx } from 'clsx';`)).toEqual(['clsx']);
    expect(v(`import { shuffle } from '@/features/practice';`)).toEqual(['@/features/practice']);
    expect(v(`import { x } from '../index';`)).toEqual(['../index']);
    expect(v(`import { x } from '../stats-rebuild';`)).toEqual(['../stats-rebuild']);
    expect(v(`import { x } from '@/content/load-catalog';`)).toEqual(['@/content/load-catalog']);
    expect(v(`import { x } from '@/i18n/i18n.svelte';`)).toHaveLength(1);
  });
  it('catches multi-line imports, export-from and dynamic imports', () => {
    expect(v(`import {\n  a,\n  b,\n} from '@/persistence/x';`)).toHaveLength(1);
    expect(v(`export { a } from '@/persistence';`)).toHaveLength(1);
    expect(v(`export * from '../../../persistence/records';`)).toHaveLength(1);
    expect(v(`const m = await import('@/features/review');`)).toHaveLength(1);
  });
  it('does not flag names that merely contain persistence inside the logic folder', () => {
    expect(v(`import { a } from './persistence-helpers';`)).toEqual([]);
  });
});

/** Resolves an import target to a file: exact file, `.ts`, or a folder's `index.ts`. */
function toFile(target: string): string | null {
  for (const c of [target, `${target}.ts`, join(target, 'index.ts')]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

function scriptOf(file: string): string {
  const code = readFileSync(file, 'utf8');
  return file.endsWith('.svelte')
    ? [...code.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n')
    : code;
}

/** Runtime (value) import graph of src: type-only imports are erased at build time, so they never form cycles. */
function runtimeGraph(): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  for (const f of walk(src).filter((p) => /\.(ts|svelte)$/.test(p) && !isTest(p))) {
    const deps: string[] = [];
    for (const imp of importsFromCode(scriptOf(f))) {
      if (imp.typeOnly) continue;
      const target = resolveSpec(f, imp.spec);
      const file = target && toFile(target);
      if (file && /\.(ts|svelte)$/.test(file)) deps.push(file);
    }
    graph.set(f, deps);
  }
  return graph;
}

function reachable(graph: Map<string, string[]>, from: string): Set<string> {
  const seen = new Set<string>();
  const stack = [from];
  while (stack.length > 0) {
    const f = stack.pop()!;
    for (const d of graph.get(f) ?? []) {
      if (!seen.has(d)) {
        seen.add(d);
        stack.push(d);
      }
    }
  }
  return seen;
}

/** Pairs of features whose index modules reach each other at runtime (an import cycle). */
function featureCycles(graph: Map<string, string[]>, indexOf: Record<string, string>): string[] {
  const names = Object.keys(indexOf).sort();
  const reach = new Map(names.map((n) => [n, reachable(graph, indexOf[n])]));
  const out: string[] = [];
  for (const a of names) {
    for (const b of names) {
      if (a < b && reach.get(a)!.has(indexOf[b]) && reach.get(b)!.has(indexOf[a])) out.push(`${a} <-> ${b}`);
    }
  }
  return out;
}

describe('featureCycles fixtures', () => {
  const idx = { a: '/a/index.ts', b: '/b/index.ts', c: '/c/index.ts' };
  it('finds a direct cycle and an indirect one through another module', () => {
    const g = new Map([
      ['/a/index.ts', ['/a/x.ts']], ['/a/x.ts', ['/b/index.ts']],
      ['/b/index.ts', ['/app/state.ts']], ['/app/state.ts', ['/a/index.ts']],
    ]);
    expect(featureCycles(g, idx)).toEqual(['a <-> b']);
  });
  it('accepts a one-way dependency', () => {
    const g = new Map([['/a/index.ts', ['/b/index.ts']], ['/b/index.ts', ['/c/index.ts']]]);
    expect(featureCycles(g, idx)).toEqual([]);
  });
});

describe('architecture boundaries', () => {
  it('logic folders import only their own logic, content/types, random and persistence/records types', () => {
    expect(existsSync(features), 'src/features must exist').toBe(true);
    const logicFiles = walk(features).filter(
      (f) => f.includes(`${sep}logic${sep}`) && f.endsWith('.ts') && !isTest(f),
    );
    const violations: string[] = [];
    for (const f of logicFiles) {
      for (const spec of logicViolations(readFileSync(f, 'utf8'), f)) {
        violations.push(`${relative(root, f)} -> ${spec}`);
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

  it('src/random modules are pure: no imports at all', () => {
    const files = walk(join(src, 'random')).filter((f) => f.endsWith('.ts') && !isTest(f));
    expect(files.length).toBeGreaterThan(0);
    expect(files.flatMap((f) => importsOf(f).map((i) => `${relative(root, f)} -> ${i.spec}`))).toEqual([]);
  });

  it('feature index modules form no runtime import cycle (practice never reaches review)', () => {
    const indexOf = Object.fromEntries(
      readdirSync(features)
        .filter((n) => existsSync(join(features, n, 'index.ts')))
        .map((n) => [n, join(features, n, 'index.ts')]),
    );
    expect(Object.keys(indexOf)).toEqual(expect.arrayContaining(['practice', 'review']));
    const graph = runtimeGraph();
    expect(featureCycles(graph, indexOf)).toEqual([]);
    const fromPractice = reachable(graph, indexOf.practice);
    expect([...fromPractice].filter((f) => f.startsWith(join(features, 'review') + sep)).map((f) => relative(root, f))).toEqual([]);
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
