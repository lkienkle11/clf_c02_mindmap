import { describe, expect, it } from 'vitest';
import { loadBundledCatalog } from './bundled';
import type { Question } from './types';

// Near-duplicate guard for authored questions. The Capstone practice draws from the whole bank, so two
// authored questions that ask the same thing can appear in one attempt. Exact-text duplicates are caught in
// bundled-content.test.ts; this file catches paraphrases with token-set (Jaccard) similarity.
//
// A pair is flagged when any rule holds (calibrated on the bank; see content-b4-report.md, fix round):
//  - the stems are very similar;
//  - the stems are related and the correct answers are largely the same;
//  - the stems are related, the option lists overlap and the answers share some words.

/** Words that carry no topic meaning, including question-template words such as "statements ... correct". */
const STOPWORDS = new Set(
  ('a an the and or of to in on for with by from at as is are be it its this that which what who how does do ' +
    'should can will must would could their they them company aws amazon choose two all one each if into use using ' +
    'than then there these those was were has have not no only so such any after before when while statement ' +
    'correct following true').split(' '),
);

const STEM_ALONE = 0.5;
const STEM_WITH_ANSWER = 0.12;
const ANSWER_SAME = 0.5;
const STEM_WITH_OPTIONS = 0.25;
const OPTIONS_OVERLAP = 0.25;
const ANSWER_SOME = 0.1;

/**
 * Pairs in topics outside the current change that the guard flags, kept visible here instead of hidden by
 * looser thresholds. Each entry was reviewed and reported; remove it once the questions are rewritten.
 */
const REVIEWED_PAIRS = new Map<string, string>([
  ['auth-storage-04|auth-storage-10', 'both answer Amazon EBS, but one is a scenario and the other a recall list'],
]);

const singular = (w: string) => w.replace(/ies$/, 'y').replace(/([^s])s$/, '$1');

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w && !STOPWORDS.has(w))
      .map(singular),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

const answerText = (q: Question) => q.correct.map((k) => q.options.find((o) => o.key === k)?.text ?? '').join(' ');
const optionText = (q: Question) => q.options.map((o) => o.text).join(' ');

interface Similarity {
  stem: number;
  answer: number;
  options: number;
}

function similarity(a: Question, b: Question): Similarity {
  return {
    stem: jaccard(tokens(a.text), tokens(b.text)),
    answer: jaccard(tokens(answerText(a)), tokens(answerText(b))),
    options: jaccard(tokens(optionText(a)), tokens(optionText(b))),
  };
}

function isNearDuplicate(s: Similarity): boolean {
  return (
    s.stem >= STEM_ALONE ||
    (s.stem >= STEM_WITH_ANSWER && s.answer >= ANSWER_SAME) ||
    (s.stem >= STEM_WITH_OPTIONS && s.options >= OPTIONS_OVERLAP && s.answer >= ANSWER_SOME)
  );
}

const q = (id: string, text: string, options: string[], correct: string[]): Question => ({
  id,
  topicId: 'x',
  text,
  options: options.map((t, i) => ({ key: 'ABCDE'[i], text: t })),
  correct,
  multi: correct.length === 2,
  orderDependent: false,
  explanation: 'x',
  source: 'authored',
});

describe('authored near-duplicate guard', () => {
  it('flags a paraphrase with the same answer and ignores an unrelated question', () => {
    const a = q('a', 'A company moves its MySQL database from Amazon EC2 to Amazon RDS. Which task does AWS now handle?',
      ['Patching the database engine', 'Designing tables', 'Writing queries', 'Choosing users'], ['A']);
    const b = q('b', 'After moving a self-managed MySQL database from EC2 to Amazon RDS, which task does AWS handle?',
      ['Writing queries', 'Patching the database engine and OS', 'Choosing users', 'Designing tables'], ['B']);
    const c = q('c', 'Which AWS service converts text into lifelike speech?', ['Amazon Polly', 'Amazon Lex', 'Amazon Rekognition', 'Amazon Translate'], ['A']);
    expect(isNearDuplicate(similarity(a, b))).toBe(true);
    expect(isNearDuplicate(similarity(a, c))).toBe(false);
  });

  it('no two authored questions in the bank are near-duplicates (except reviewed pairs)', () => {
    const authored = loadBundledCatalog().questions.filter((x) => x.source === 'authored');
    const flagged: string[] = [];
    for (let i = 0; i < authored.length; i += 1) {
      for (let j = i + 1; j < authored.length; j += 1) {
        const [a, b] = [authored[i], authored[j]].sort((x, y) => (x.id < y.id ? -1 : 1));
        const s = similarity(a, b);
        if (isNearDuplicate(s)) {
          flagged.push(`${a.id}|${b.id} stem ${s.stem.toFixed(2)} answer ${s.answer.toFixed(2)} options ${s.options.toFixed(2)}`);
        }
      }
    }
    const unexpected = flagged.filter((f) => !REVIEWED_PAIRS.has(f.split(' ')[0]));
    expect(unexpected).toEqual([]);
    // A reviewed pair that no longer trips the guard must be removed from the list.
    for (const pair of REVIEWED_PAIRS.keys()) expect(flagged.map((f) => f.split(' ')[0]), pair).toContain(pair);
  });
});
