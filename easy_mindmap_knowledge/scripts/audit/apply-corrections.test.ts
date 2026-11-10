// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import type { AnswerCorrection } from '../../src/content/answer-corrections';
import type { Question } from '../../src/content/types';
import { makeQuestion } from '../../src/testing/fixtures';
import { applyCorrections, formatLikeSource } from './apply-corrections';

function correction(over: Partial<AnswerCorrection> = {}): AnswerCorrection {
  return {
    questionId: 'q1',
    oldCorrect: ['A'],
    newCorrect: ['A', 'B'],
    reason: 'The source marks two answers.',
    sources: ['https://example.com/source'],
    confidence: 'high',
    approvedOn: '2026-11-10',
    ...over,
  };
}

it('changes correct and multi, and nothing else', () => {
  const bank: Question[] = [makeQuestion({ id: 'q1', correct: ['A'], multi: false }), makeQuestion({ id: 'q2', correct: ['B'] })];
  const result = applyCorrections(bank, [correction()]);
  expect(result.applied).toEqual(['q1']);
  expect(result.questions).toStrictEqual([{ ...bank[0], correct: ['A', 'B'], multi: true }, bank[1]]);
});

it('refuses a stale oldCorrect', () => {
  const bank: Question[] = [makeQuestion({ id: 'q1', correct: ['B'] })];
  expect(() => applyCorrections(bank, [correction({ oldCorrect: ['A'] })])).toThrowError(/q1/);
});

it('ignores log entries for questions that are not in this bank file and does not list them as applied', () => {
  const bank: Question[] = [makeQuestion({ id: 'q1', correct: ['A'] })];
  const log = [correction({ questionId: 'q9', oldCorrect: ['C'], newCorrect: ['D', 'A'] }), correction()];
  const result = applyCorrections(bank, log);
  expect(result.applied).toEqual(['q1']);
  expect(result.questions[0].correct).toEqual(['A', 'B']);
});

it('an empty log returns the bank unchanged', () => {
  const bank: Question[] = [makeQuestion({ id: 'q1' }), makeQuestion({ id: 'q2' })];
  const result = applyCorrections(bank, []);
  expect(result.questions).toStrictEqual(bank);
  expect(result.applied).toEqual([]);
});

it('does not mutate its inputs', () => {
  const bank: Question[] = [makeQuestion({ id: 'q1', correct: ['A'] })];
  const log = [correction()];
  const bankBefore = structuredClone(bank);
  const logBefore = structuredClone(log);
  applyCorrections(bank, log);
  expect(bank).toStrictEqual(bankBefore);
  expect(log).toStrictEqual(logBefore);
});

it('formatLikeSource keeps the indent and the trailing newline', () => {
  const value = { a: [1] };
  expect(formatLikeSource('{\n  "x": 1\n}\n', value)).toBe('{\n  "a": [\n    1\n  ]\n}\n');
  expect(formatLikeSource('{\n "x": 1\n}', value)).toBe('{\n "a": [\n  1\n ]\n}');
  expect(formatLikeSource('{\n\t"x": 1\n}\n', value)).toBe('{\n\t"a": [\n\t\t1\n\t]\n}\n');
});

it('a no-op round trip of every real bank file is byte-identical', () => {
  const dir = fileURLToPath(new URL('../../content/questions', import.meta.url));
  const files = [
    join(dir, 'imported.json'),
    ...readdirSync(join(dir, 'authored'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => join(dir, 'authored', f)),
  ];
  expect(files.length).toBeGreaterThan(1);
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    expect(formatLikeSource(text, JSON.parse(text)), file).toBe(text);
  }
});
