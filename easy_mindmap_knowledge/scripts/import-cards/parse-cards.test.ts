// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseCards, parseCardsDetailed } from './parse-cards';
import { stableQuestionId } from './stable-id';
import { isOrderDependent } from './order-dependent';

const SAMPLE = `A company plans to use an Amazon Snowball Edge device to transfer files to the AWS Cloud. Which activities are available at no cost?
A. Use of the Snowball Edge appliance for a 10-day period
B. The transfer of data out of Amazon S3 and to the Snowball Edge appliance
C. The transfer of data from the Snowball Edge appliance into Amazon S3
D. Daily use of the Snowball Edge appliance after 10 days
---
C. The transfer of data from the Snowball Edge appliance into Amazon S3
===
Which of the following are benefits of using AWS Trusted Advisor? (Choose two.)
A. Providing high-performance container orchestration
B. Creating and rotating encryption keys
C. Detecting underutilized resources to save costs
D. Improving security by proactively monitoring the AWS environment
E. Implementing enforced tagging across AWS resources
---
C. Detecting underutilized resources to save costs
D. Improving security by proactively monitoring the AWS environment
===
Which AWS service automates infrastructure deployment?
A. Amazon CloudWatch
B. AWS Config
C. AWS Trusted Advisor
D. AWS CloudFormation
---
D. AWS CloudFormation
===
`;

const realPath = fileURLToPath(
  new URL('../../../export_cards_to_knowt/results/questions.txt', import.meta.url),
);

describe('parseCards (sample)', () => {
  const cards = parseCards(SAMPLE);

  it('parses 3 cards', () => {
    expect(cards).toHaveLength(3);
    expect(cards[0].correctKeys).toEqual(['C']);
    expect(cards[0].multi).toBe(false);
    expect(cards[0].options).toHaveLength(4);
  });

  it('flags multi-answer cards', () => {
    expect(cards[1].multi).toBe(true);
    expect(cards[1].correctKeys).toEqual(['C', 'D']);
  });

  it('gives the same result for CRLF input', () => {
    expect(parseCards(SAMPLE.replace(/\n/g, '\r\n'))).toEqual(cards);
  });

  it('gives the same correctKeys when answer lines are reordered', () => {
    const swapped = SAMPLE.replace(
      'C. Detecting underutilized resources to save costs\nD. Improving security by proactively monitoring the AWS environment\n===',
      'D. Improving security by proactively monitoring the AWS environment\nC. Detecting underutilized resources to save costs\n===',
    );
    expect(parseCards(swapped)[1].correctKeys).toEqual(['C', 'D']);
  });

  it('throws with the card number when an answer matches no option', () => {
    const bad = SAMPLE.replace('D. AWS CloudFormation\n===', 'D. Something else\n===');
    expect(() => parseCards(bad)).toThrow(/card 3/i);
  });
});

describe('parseCards (real file)', () => {
  const { cards, skipped, duplicates, mismatched } = parseCardsDetailed(readFileSync(realPath, 'utf8'));

  it('has 668 cards, 80 multi, skips 116 and 271, drops 2 duplicates, 1 mismatched', () => {
    expect(cards).toHaveLength(668);
    expect(cards.filter((c) => c.multi)).toHaveLength(80);
    expect(mismatched).toHaveLength(1);
    expect(mismatched[0].reason).toMatch(/multi/i);
    expect(skipped.map((s) => s.cardNumber)).toEqual([116, 271]);
    expect(duplicates).toHaveLength(2);
    for (const d of duplicates) expect(d.duplicateOf).toBeLessThan(d.cardNumber);
    expect(parseCards(readFileSync(realPath, 'utf8'))).toEqual(cards);
  });

  it('every card has valid correct keys', () => {
    for (const c of cards) {
      expect(c.correctKeys.length).toBeGreaterThanOrEqual(1);
      for (const k of c.correctKeys) expect(c.options.map((o) => o.key)).toContain(k);
    }
  });

  it('stable ids are unique and repeatable', () => {
    const ids = cards.map(stableQuestionId);
    expect(new Set(ids).size).toBe(668);
    expect(cards.map(stableQuestionId)).toEqual(ids);
    expect(ids[0]).toMatch(/^q_[0-9a-f]{12}$/);
  });
});

describe('dedupe', () => {
  const card = (opt: string) => `Q one?\nA. ${opt}\nB. other\n---\nA. ${opt}\n`;
  it('drops exact duplicates and reports them', () => {
    const r = parseCardsDetailed([card('x'), card('x')].join('===\n'));
    expect(r.cards).toHaveLength(1);
    expect(r.duplicates).toEqual([expect.objectContaining({ cardNumber: 2, duplicateOf: 1 })]);
  });
  it('keeps same text with different options, with distinct ids', () => {
    const r = parseCardsDetailed([card('x'), card('y')].join('===\n'));
    expect(r.cards).toHaveLength(2);
    expect(r.duplicates).toEqual([]);
    expect(stableQuestionId(r.cards[0])).not.toBe(stableQuestionId(r.cards[1]));
  });
});

describe('stableQuestionId', () => {
  it('differs for same text with different options', () => {
    const a = { text: 'Q?', options: [{ key: 'A', text: 'x' }], correctKeys: ['A'], multi: false };
    const b = { ...a, options: [{ key: 'A', text: 'y' }] };
    expect(stableQuestionId(a)).not.toBe(stableQuestionId(b));
  });
});

describe('isOrderDependent', () => {
  it('detects positional options', () => {
    expect(isOrderDependent(['A', 'All of the above'])).toBe(true);
    expect(isOrderDependent(['Both A and B', 'x'])).toBe(true);
    expect(isOrderDependent(['Amazon S3', 'Amazon EC2'])).toBe(false);
  });
});

describe('mismatched multi flag', () => {
  it('reports a Choose-two card with one key and excludes it from cards', () => {
    const raw = 'Pick? (Choose two.)\nA. a\nB. b\nC. c\n---\nA. a\n===\nOk?\nA. a\nB. b\n---\nA. a\n';
    const r = parseCardsDetailed(raw);
    expect(r.cards).toHaveLength(1);
    expect(r.mismatched).toEqual([expect.objectContaining({ cardNumber: 1, reason: expect.stringContaining('multi') })]);
    expect(parseCards(raw)).toHaveLength(1);
  });
});

describe('html entity decoding', () => {
  const one = (q: string, a: string) => parseCards(`${q}\nA. ${a}\nB. other\n---\nA. ${a}\n`)[0];
  it('decodes named and numeric entities', () => {
    const c = one('A company&apos;s &quot;app&quot; &lt;x&gt; &#39;y&#39; &#x41;', 'R&amp;D');
    expect(c.text).toBe(`A company's "app" <x> 'y' A`);
    expect(c.options[0].text).toBe('R&D');
  });
  it('does not double-decode &amp;', () => {
    expect(one('a &amp;lt; b', 'x').text).toBe('a &lt; b');
  });
  it('leaves plain apostrophes unchanged', () => {
    expect(one("company's", 'x').text).toBe("company's");
  });
});
