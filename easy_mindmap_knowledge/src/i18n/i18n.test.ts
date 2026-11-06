// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { I18n, createI18n } from './i18n.svelte';
import en from './en.json';
import vi from './vi.json';

describe('I18n', () => {
  it('replaces {name} params', () => {
    const i = createI18n('en');
    i.messages.en['x'] = 'Got {n} of {m} {n}';
    expect(i.t('x', { n: 3, m: 'ten' })).toBe('Got 3 of ten 3');
  });
  it('returns the key when missing and never throws', () => {
    const i = new I18n('en');
    expect(i.t('no.such.key')).toBe('no.such.key');
  });
  it('switches locale', () => {
    const i = createI18n('en');
    expect(i.t('common.close')).toBe('Close');
    i.setLocale('vi');
    expect(i.locale).toBe('vi');
    expect(i.t('common.close')).toBe('Đóng');
  });
  it('interpolates real lockedHint', () => {
    const i = createI18n('vi');
    expect(i.t('mindmap.lockedHint', { topic: 'EC2' })).toBe('Cần đạt từ 80% trở lên ở EC2 để mở');
    expect(createI18n('en').t('mindmap.lockedHint', { topic: 'EC2' })).toBe('Score 80% or higher in EC2 to unlock');
  });
  it('en and vi have identical key sets', () => {
    expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort());
  });
});

/**
 * Keys built at runtime from a template, declared explicitly: `prefix` is the literal text before `${`.
 * A new template prefix in src fails the test below until it is listed here with its keys.
 */
const DYNAMIC: Record<string, string[]> = {
  'nav.': ['nav.tree', 'nav.history', 'nav.settings'],
  'history.kind.': ['history.kind.practice', 'history.kind.review', 'history.kind.checkpoint'],
  'mindmap.tier.': ['mindmap.tier.introduction', 'mindmap.tier.core', 'mindmap.tier.advanced', 'mindmap.tier.capstone'],
  'practice.announce.': ['practice.announce.m5', 'practice.announce.m1', 'practice.announce.s10'],
};

function sourceCode(): string {
  const walk = (d: string): string[] =>
    readdirSync(d).flatMap((n) => {
      const p = join(d, n);
      return statSync(p).isDirectory() ? walk(p) : [p];
    });
  return walk(join(process.cwd(), 'src'))
    .filter((f) => /\.(ts|svelte)$/.test(f) && !/\.test\.ts$/.test(f))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');
}

describe('i18n keys are all used', () => {
  const code = sourceCode();
  const literal = (k: string) => [`'${k}'`, `"${k}"`, `\`${k}\``].some((q) => code.includes(q));
  // countText(i18n, 'x', n) reads 'x.one' for exactly one.
  const used = (k: string) =>
    literal(k) || (k.endsWith('.one') && literal(k.slice(0, -4))) || Object.values(DYNAMIC).some((ks) => ks.includes(k));

  it('every key in en.json is referenced from src', () => {
    expect(Object.keys(en).filter((k) => !used(k))).toEqual([]);
  });

  it('every template-built key prefix in src is declared in DYNAMIC', () => {
    const prefixes = [...code.matchAll(/\bt\(\s*`([a-z][\w.]*\.)\$\{/g)].map((m) => m[1]);
    expect(prefixes.length).toBeGreaterThan(0);
    expect([...new Set(prefixes)].filter((p) => !(p in DYNAMIC))).toEqual([]);
  });

  it('every declared dynamic key exists', () => {
    expect(Object.values(DYNAMIC).flat().filter((k) => !(k in en))).toEqual([]);
  });
});
