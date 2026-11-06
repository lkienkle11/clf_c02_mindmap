// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { SettingsRepo } from '@/persistence';
import { loadExamOptions, saveExamOptions } from './options';

const memory = (initial?: string): SettingsRepo & { store: Map<string, string> } => {
  const store = new Map<string, string>(initial === undefined ? [] : [['exam_last_options', initial]]);
  return { store, get: async (k) => store.get(k) ?? null, set: async (k, v) => { store.set(k, v); } };
};

describe('exam options', () => {
  it('defaults to no extra time', async () => {
    expect(await loadExamOptions(memory())).toEqual({ extraTime: false });
  });
  it('round-trips', async () => {
    const s = memory();
    await saveExamOptions(s, { extraTime: true });
    expect(s.store.has('exam_last_options')).toBe(true);
    expect(await loadExamOptions(s)).toEqual({ extraTime: true });
  });
  it.each(['not json', '[]', 'null', '{"extraTime":"yes"}', '{}', '5'])('falls back to default for corrupt value %s', async (raw) => {
    expect(await loadExamOptions(memory(raw))).toEqual({ extraTime: false });
  });
});
