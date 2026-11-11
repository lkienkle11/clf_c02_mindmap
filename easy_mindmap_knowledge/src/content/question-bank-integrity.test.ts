// Structural integrity checks for bundled question bank questions.
import { describe, expect, it } from 'vitest';
import { loadBundledCatalog } from './bundled';

const catalog = loadBundledCatalog();

describe('question bank integrity (real content folder)', () => {
  it('every question has at least one correct key and every correct key is one of its option keys', () => {
    const offenders: string[] = [];
    for (const q of catalog.questions) {
      const optionKeys = new Set(q.options.map((o) => o.key));
      const hasCorrect = q.correct.length > 0;
      const allCorrectInOptions = q.correct.every((k) => optionKeys.has(k));
      if (!hasCorrect || !allCorrectInOptions) {
        offenders.push(q.id);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('option keys are unique inside a question', () => {
    const offenders: string[] = [];
    for (const q of catalog.questions) {
      const keys = q.options.map((o) => o.key);
      if (new Set(keys).size !== keys.length) {
        offenders.push(q.id);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('multi is true exactly when more than one key is correct', () => {
    const offenders: string[] = [];
    for (const q of catalog.questions) {
      if (q.multi !== (q.correct.length > 1)) {
        offenders.push(q.id);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('correct keys are unique inside a question', () => {
    const offenders: string[] = [];
    for (const q of catalog.questions) {
      if (new Set(q.correct).size !== q.correct.length) {
        offenders.push(q.id);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('every question has at least two options', () => {
    const offenders: string[] = [];
    for (const q of catalog.questions) {
      if (q.options.length < 2) {
        offenders.push(q.id);
      }
    }
    expect(offenders).toEqual([]);
  });
});
