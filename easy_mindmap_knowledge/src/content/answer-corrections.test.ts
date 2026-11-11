// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { makeQuestion } from '@/testing/fixtures';
import { validateCorrections } from './answer-corrections';
import { loadBundledCatalog } from './bundled';

const bankWith = (correct: string[]) => [
  makeQuestion({
    id: 'q1',
    correct,
    options: [{ key: 'A', text: 'EC2' }, { key: 'B', text: 'S3' }, { key: 'C', text: 'RDS' }],
    multi: correct.length > 1,
  }),
];

const validEntry = {
  questionId: 'q1',
  oldCorrect: ['A'],
  newCorrect: ['B'],
  reason: 'The official S3 FAQ names S3 as the answer.',
  sources: ['https://aws.amazon.com/s3/faqs/'],
  confidence: 'high',
  approvedOn: '2026-11-10',
};

const withEntry = (over: Record<string, unknown>) => [{ ...validEntry, ...over }];

const expectError = (errors: string[], pattern: RegExp) =>
  expect(errors).toEqual(expect.arrayContaining([expect.stringMatching(pattern)]));

describe('validateCorrections', () => {
  it('a valid log returns no errors', () => {
    expect(validateCorrections([validEntry], bankWith(['B']))).toEqual([]);
  });

  it('rejects a log that is not an array', () => {
    const errors = validateCorrections(validEntry, bankWith(['B']));
    expect(errors).toHaveLength(1);
    expectError(errors, /array/);
  });

  it('rejects an unknown questionId', () => {
    expectError(validateCorrections(withEntry({ questionId: 'q-missing' }), bankWith(['B'])), /entry 0\b.*q-missing/);
  });

  it('rejects a bank answer that differs from newCorrect', () => {
    expectError(validateCorrections([validEntry], bankWith(['A'])), /entry 0\b.*newCorrect/);
  });

  it('rejects oldCorrect equal to newCorrect (order ignored)', () => {
    const log = withEntry({ oldCorrect: ['B', 'A'], newCorrect: ['A', 'B'] });
    expectError(validateCorrections(log, bankWith(['A', 'B'])), /entry 0\b.*oldCorrect/);
  });

  it('rejects empty sources', () => {
    expectError(validateCorrections(withEntry({ sources: [] }), bankWith(['B'])), /entry 0\b.*sources/);
  });

  it('rejects a source that does not start with https://', () => {
    const log = withEntry({ sources: ['http://aws.amazon.com/s3/faqs/'] });
    expectError(validateCorrections(log, bankWith(['B'])), /entry 0\b.*https:\/\//);
  });

  it('rejects a duplicate questionId', () => {
    expectError(validateCorrections([validEntry, validEntry], bankWith(['B'])), /entry 1\b.*duplicate/);
  });

  it('rejects a confidence outside high, medium, low', () => {
    expectError(validateCorrections(withEntry({ confidence: 'certain' }), bankWith(['B'])), /entry 0\b.*confidence/);
  });

  it('rejects an approvedOn that is not YYYY-MM-DD', () => {
    expectError(validateCorrections(withEntry({ approvedOn: '10/11/2026' }), bankWith(['B'])), /entry 0\b.*approvedOn/);
  });

  it('rejects duplicate keys inside newCorrect', () => {
    expectError(validateCorrections(withEntry({ newCorrect: ['B', 'B'] }), bankWith(['B'])), /entry 0\b.*newCorrect.*duplicate|entry 0\b.*duplicate.*newCorrect/);
  });

  it('rejects duplicate keys inside oldCorrect', () => {
    expectError(validateCorrections(withEntry({ oldCorrect: ['A', 'A'], newCorrect: ['B'] }), bankWith(['B'])), /entry 0\b.*oldCorrect.*duplicate|entry 0\b.*duplicate.*oldCorrect/);
  });

  it('rejects a newCorrect key that is not an option of the question', () => {
    expectError(validateCorrections(withEntry({ newCorrect: ['D'] }), bankWith(['D'])), /entry 0\b.*not an option/);
  });

  it('accepts the same answer set in a different order as equal', () => {
    const log = withEntry({ oldCorrect: ['A'], newCorrect: ['A', 'B'] });
    expect(validateCorrections(log, bankWith(['B', 'A']))).toEqual([]);
  });

  it('the real corrections log is valid against the bundled bank', () => {
    const parsed: unknown = JSON.parse(
      readFileSync(resolve(__dirname, '../../content/review/answer-corrections.json'), 'utf8'),
    );
    const catalog = loadBundledCatalog();
    expect(validateCorrections(parsed, catalog.questions)).toEqual([]);
  });
});
