import { describe, expect, it } from 'vitest';
import { findGaps } from './explanation-gaps';
import type { Question } from './types';

const OPTIONS = [
  { key: 'A', text: 'a' },
  { key: 'B', text: 'b' },
  { key: 'C', text: 'c' },
  { key: 'D', text: 'd' },
];

function question(id: string, overrides: Partial<Question> = {}): Question {
  return {
    id,
    topicId: 'compute',
    text: `text of ${id}`,
    options: OPTIONS,
    correct: ['A'],
    multi: false,
    orderDependent: false,
    source: 'authored',
    explanation: 'Because of the rule.',
    optionNotes: { A: 'right', B: 'wrong', C: 'wrong', D: 'wrong' },
    ...overrides,
  };
}

const EMPTY = { missingExplanation: [], missingNotes: [], extraNoteKeys: [], internalWording: [] };

describe('findGaps', () => {
  it('reports nothing for a complete question', () => {
    expect(findGaps([question('ok')])).toEqual(EMPTY);
  });

  it('reports a question whose explanation is absent or blank', () => {
    const questions = [
      question('no-explanation', { explanation: undefined }),
      question('blank-explanation', { explanation: '   ' }),
    ];
    expect(findGaps(questions)).toEqual({ ...EMPTY, missingExplanation: ['no-explanation', 'blank-explanation'] });
  });

  it('reports every option key that has no note, including when optionNotes is absent', () => {
    const questions = [
      question('partial', { optionNotes: { A: 'right', B: 'wrong' } }),
      question('none', { optionNotes: undefined }),
    ];
    expect(findGaps(questions).missingNotes).toEqual(['partial:C', 'partial:D', 'none:A', 'none:B', 'none:C', 'none:D']);
  });

  it('treats a blank note as missing', () => {
    const questions = [question('blank-note', { optionNotes: { A: 'right', B: '  ', C: 'wrong', D: '' } })];
    expect(findGaps(questions).missingNotes).toEqual(['blank-note:B', 'blank-note:D']);
  });

  it('reports note keys that are not options', () => {
    const questions = [question('extra', { optionNotes: { A: 'right', B: 'w', C: 'w', D: 'w', E: 'stray' } })];
    expect(findGaps(questions)).toEqual({ ...EMPTY, extraNoteKeys: ['extra:E'] });
  });

  it('reports internal wording in the explanation or any note, once per question', () => {
    const questions = [
      question('in-explanation', { explanation: 'The keyed value is wrong.' }),
      question('in-note', { optionNotes: { A: 'right', B: 'This is the answer key option.', C: 'w', D: 'w' } }),
      question('in-both', { explanation: 'Keyed here.', optionNotes: { A: 'Answer key here.', B: 'w', C: 'w', D: 'w' } }),
    ];
    expect(findGaps(questions).internalWording).toEqual(['in-explanation', 'in-note', 'in-both']);
  });

  it('does not treat other key wording as internal', () => {
    const questions = [
      question('ok-wording', {
        explanation: 'Attach a key policy to the role and rotate encryption keys with key management.',
        optionNotes: { A: 'Use the key policy.', B: 'Keys are managed elsewhere.', C: 'the key component', D: 'w' },
      }),
    ];
    expect(findGaps(questions).internalWording).toEqual([]);
  });

  it('reports every offending question in one call', () => {
    const questions = [
      question('a', { explanation: '' }),
      question('b', { optionNotes: { A: 'x' } }),
      question('c', { explanation: 'keyed' }),
      question('d'),
    ];
    expect(findGaps(questions)).toEqual({
      missingExplanation: ['a'],
      missingNotes: ['b:B', 'b:C', 'b:D'],
      extraNoteKeys: [],
      internalWording: ['c'],
    });
  });
});
