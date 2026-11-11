import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Question } from '../../src/content/types';
import type { RawCard } from '../import-cards/parse-cards';
import { parseCardsDetailed } from '../import-cards/parse-cards';
import { stableQuestionId } from '../import-cards/stable-id';

const COUNT_WORDS: Record<string, number> = { two: 2, three: 3, four: 4, '2': 2, '3': 3, '4': 4 };
const COUNT_ASK = /\b(?:choose|select)\s+(two|three|four|[234])\b/i;

/** The number of answers the question text asks for ("Choose two", "Select three", "choose 2"), or null when it asks for none. Words two, three, four and digits 2, 3, 4; case-insensitive; after "choose" or "select". */
export function expectedAnswerCount(text: string): number | null {
  const m = COUNT_ASK.exec(text);
  return m ? COUNT_WORDS[m[1].toLowerCase()] : null;
}

export interface AnswerCountFinding {
  questionId: string;
  kind: 'count-mismatch' | 'source-differs-from-bank';
  textSaysCount: number | null;
  sourceCorrect: string[];
  bankCorrect: string[];
}

const sameSet = (a: readonly string[], b: readonly string[]): boolean => {
  const x = new Set(a);
  const y = new Set(b);
  return x.size === y.size && [...x].every((k) => y.has(k));
};

/** For each card whose stableQuestionId is in the bank: 'count-mismatch' when expectedAnswerCount(card.text) is not null and differs from card.correctKeys.length; 'source-differs-from-bank' when the card's correctKeys and the bank question's correct differ as sets (order ignored). A card can produce both. Cards that are not in the bank are skipped. */
export function findAnswerCountMismatches(cards: RawCard[], bank: Question[]): AnswerCountFinding[] {
  const byId = new Map(bank.map((q) => [q.id, q]));
  const findings: AnswerCountFinding[] = [];
  for (const card of cards) {
    const questionId = stableQuestionId(card);
    const q = byId.get(questionId);
    if (!q) continue;
    const textSaysCount = expectedAnswerCount(card.text);
    const sourceCorrect = [...card.correctKeys];
    const bankCorrect = [...q.correct];
    if (textSaysCount !== null && textSaysCount !== card.correctKeys.length) {
      findings.push({ questionId, kind: 'count-mismatch', textSaysCount, sourceCorrect, bankCorrect });
    }
    if (!sameSet(card.correctKeys, q.correct)) {
      findings.push({ questionId, kind: 'source-differs-from-bank', textSaysCount, sourceCorrect, bankCorrect });
    }
  }
  return findings;
}

function main(argv: string[]): void {
  const [questionsPath, bankPath, outPath] = argv;
  const { cards, skipped, duplicates, mismatched } = parseCardsDetailed(readFileSync(questionsPath, 'utf8'));
  const bank = JSON.parse(readFileSync(bankPath, 'utf8')) as Question[];
  const report = {
    checked: cards.length,
    findings: findAnswerCountMismatches(cards, bank),
    excluded: { skipped, mismatched, duplicates: duplicates.length },
  };
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
