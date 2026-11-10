import { expect, it } from 'vitest';
import type { Question } from '../../src/content/types';
import { makeQuestion } from '../../src/testing/fixtures';
import type { RawCard } from '../import-cards/parse-cards';
import { stableQuestionId } from '../import-cards/stable-id';
import { expectedAnswerCount, findAnswerCountMismatches } from './check-import-answers';

const OPTIONS = [
  { key: 'A', text: 'Lambda' },
  { key: 'B', text: 'EC2' },
  { key: 'C', text: 'S3' },
  { key: 'D', text: 'RDS' },
];

function card(over: Partial<RawCard> = {}): RawCard {
  return { text: 'Which service is serverless?', options: OPTIONS, correctKeys: ['A'], multi: false, ...over };
}

function bankFor(c: RawCard, over: Partial<Question> = {}): Question {
  return makeQuestion({ id: stableQuestionId(c), options: c.options, correct: c.correctKeys, multi: c.multi, ...over });
}

it('expectedAnswerCount reads two, three and numeric forms', () => {
  expect(expectedAnswerCount('Which services are serverless? (Choose two.)')).toBe(2);
  expect(expectedAnswerCount('Which services are serverless? (Choose THREE.)')).toBe(3);
  expect(expectedAnswerCount('Select 2 options')).toBe(2);
  expect(expectedAnswerCount('Which service?')).toBeNull();
});

it('a Choose-two card with three marked keys is reported as a count mismatch', () => {
  const c = card({ text: 'Which services are serverless? (Choose two.)', correctKeys: ['A', 'B', 'C'], multi: true });
  expect(findAnswerCountMismatches([c], [bankFor(c)])).toEqual([
    {
      questionId: stableQuestionId(c),
      kind: 'count-mismatch',
      textSaysCount: 2,
      sourceCorrect: ['A', 'B', 'C'],
      bankCorrect: ['A', 'B', 'C'],
    },
  ]);
});

it('a Choose-three card with two marked keys is reported as a count mismatch', () => {
  const c = card({ text: 'Which services are serverless? (Choose three.)', correctKeys: ['A', 'B'], multi: true });
  expect(findAnswerCountMismatches([c], [bankFor(c)])).toEqual([
    {
      questionId: stableQuestionId(c),
      kind: 'count-mismatch',
      textSaysCount: 3,
      sourceCorrect: ['A', 'B'],
      bankCorrect: ['A', 'B'],
    },
  ]);
});

it('a card whose source keys differ from the bank answer is reported', () => {
  const c = card({ correctKeys: ['B'] });
  expect(findAnswerCountMismatches([c], [bankFor(c, { correct: ['A'] })])).toEqual([
    {
      questionId: stableQuestionId(c),
      kind: 'source-differs-from-bank',
      textSaysCount: null,
      sourceCorrect: ['B'],
      bankCorrect: ['A'],
    },
  ]);
});

it('a clean card produces no finding', () => {
  const c = card({ text: 'Which two services are serverless? (Choose two.)', correctKeys: ['A', 'C'], multi: true });
  expect(findAnswerCountMismatches([c], [bankFor(c, { correct: ['C', 'A'] })])).toEqual([]);
});

it('cards that are not in the bank are skipped', () => {
  const inBank = card({ correctKeys: ['B'] });
  const notInBank = card({ text: 'Which three services? (Choose three.)', correctKeys: ['A', 'B'], multi: true });
  expect(findAnswerCountMismatches([inBank, notInBank], [bankFor(inBank, { correct: ['A'] })])).toEqual([
    {
      questionId: stableQuestionId(inBank),
      kind: 'source-differs-from-bank',
      textSaysCount: null,
      sourceCorrect: ['B'],
      bankCorrect: ['A'],
    },
  ]);
});
