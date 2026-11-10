import { describe, expect, it } from 'vitest';
import type { SettingsRepo } from '@/persistence';
import { DEFAULT_PRACTICE_OPTIONS, loadLastOptions, saveLastOptions } from './options';

const repoWith = (raw: string | null): SettingsRepo =>
  ({ get: async () => raw, set: async () => {} }) as unknown as SettingsRepo;

describe('practice options', () => {
  it("legacy stored options without onHidden load with default 'freeze' and keep other fields", async () => {
    const raw = JSON.stringify({ allowReview: true, limitMs: 60000, clockMode: 'run' });
    expect(await loadLastOptions(repoWith(raw))).toEqual({
      allowReview: true, limitMs: 60000, clockMode: 'run', onHidden: 'freeze', onReport: 'freeze', questionCount: 10,
    });
  });

  it('stored options without questionCount load as 10 and keep the other fields', async () => {
    const raw = JSON.stringify({ allowReview: true, limitMs: 60000, clockMode: 'run', onHidden: 'run' });
    expect(await loadLastOptions(repoWith(raw))).toEqual({
      allowReview: true, limitMs: 60000, clockMode: 'run', onHidden: 'run', onReport: 'freeze', questionCount: 10,
    });
  });

  it('a stored questionCount is kept', async () => {
    const raw = JSON.stringify({ allowReview: false, limitMs: null, clockMode: 'freeze', onHidden: 'freeze', questionCount: 25 });
    expect((await loadLastOptions(repoWith(raw))).questionCount).toBe(25);
  });

  it('an invalid stored questionCount falls back to the default options', async () => {
    const raw = JSON.stringify({ allowReview: false, limitMs: null, clockMode: 'freeze', onHidden: 'freeze', questionCount: 3 });
    expect(await loadLastOptions(repoWith(raw))).toEqual(DEFAULT_PRACTICE_OPTIONS);
  });

  it('invalid onHidden value falls back to the default options', async () => {
    const raw = JSON.stringify({ allowReview: true, limitMs: 60000, clockMode: 'run', onHidden: 'pause' });
    expect(await loadLastOptions(repoWith(raw))).toEqual(DEFAULT_PRACTICE_OPTIONS);
  });

  it("options saved before onReport existed load it as 'freeze'", async () => {
    const raw = JSON.stringify({ allowReview: false, limitMs: 60000, clockMode: 'run', onHidden: 'run', questionCount: 12 });
    expect((await loadLastOptions(repoWith(raw))).onReport).toBe('freeze');
  });

  it('a stored onReport is kept', async () => {
    const raw = JSON.stringify({ allowReview: false, limitMs: null, clockMode: 'freeze', onHidden: 'freeze', onReport: 'run', questionCount: 10 });
    expect((await loadLastOptions(repoWith(raw))).onReport).toBe('run');
  });

  it('invalid onReport value falls back to the default options', async () => {
    const raw = JSON.stringify({ allowReview: false, limitMs: null, clockMode: 'freeze', onHidden: 'freeze', onReport: 'pause', questionCount: 10 });
    expect(await loadLastOptions(repoWith(raw))).toEqual(DEFAULT_PRACTICE_OPTIONS);
  });

  it("round trip keeps onHidden 'run' and onReport 'run'", async () => {
    let stored: string | null = null;
    const repo = { get: async () => stored, set: async (_k: string, v: string) => { stored = v; } } as unknown as SettingsRepo;
    const opts = {
      allowReview: false, limitMs: 1000, clockMode: 'freeze' as const, onHidden: 'run' as const, onReport: 'run' as const, questionCount: 20,
    };
    await saveLastOptions(repo, opts);
    expect(await loadLastOptions(repo)).toEqual(opts);
  });
});
