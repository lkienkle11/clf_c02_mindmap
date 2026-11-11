/* WARNING: this script regenerates content/questions/imported.json and content/review/import-exclusions.md from the card deck. After the audit the question bank is maintained by hand: answers were corrected (content/review/answer-corrections.json), options and stems were repaired, seven retired or skipped questions were restored, and the exclusions file has audit sections. Do NOT re-run this script over the current files: it would overwrite all of that and drop the restored cards again. Apply answer corrections with scripts/audit/apply-corrections.ts instead. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildImported } from './build-imported';
import type { DuplicateCard, MismatchedCard, SkippedCard } from './parse-cards';
import { parseCardsDetailed } from './parse-cards';
import { stableQuestionId } from './stable-id';

const here = (rel: string) => fileURLToPath(new URL(rel, import.meta.url));

export interface BuildPaths {
  sourcePath: string;
  outPath: string;
  samplePath: string;
  exclusionsPath: string;
}

export const DEFAULT_PATHS: BuildPaths = {
  sourcePath: here('../../../export_cards_to_knowt/results/questions.txt'),
  outPath: here('../../content/questions/imported.json'),
  samplePath: here('../../content/review/topic-assignment-sample.md'),
  exclusionsPath: here('../../content/review/import-exclusions.md'),
};

const SAMPLE_SIZE = 30;
const SEED = 20261102;

// mulberry32: small deterministic PRNG so the review sample is reproducible.
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function write(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

const snippet = (t: string): string => (t.length > 80 ? t.slice(0, 80) : t).replace(/\|/g, '\\|');

function writeExclusions(
  path: string,
  skipped: SkippedCard[],
  duplicates: DuplicateCard[],
  mismatched: MismatchedCard[],
): void {
  const lines = [
    '# Import exclusions',
    '',
    `Skipped (no answer): ${skipped.length}. Duplicates dropped: ${duplicates.length}. Mismatched multi flag (excluded): ${mismatched.length}.`,
    '',
    '| card | id | text (first 80 chars) | reason |',
    '| --- | --- | --- | --- |',
  ];
  for (const m of mismatched) {
    lines.push(`| card ${m.cardNumber} | ${stableQuestionId(m.card)} | ${snippet(m.card.text)} | excluded: ${m.reason} |`);
  }
  for (const k of skipped) {
    lines.push(`| card ${k.cardNumber} | n/a | ${snippet(k.text)} | skipped: ${k.reason} |`);
  }
  for (const d of duplicates) {
    lines.push(`| card ${d.cardNumber} | ${stableQuestionId(d.card)} | ${snippet(d.card.text)} | duplicate of card ${d.duplicateOf} |`);
  }
  lines.push('');
  write(path, lines.join('\n'));
}

export function runBuild(paths: BuildPaths = DEFAULT_PATHS): number {
  const { cards, skipped, duplicates, mismatched } = parseCardsDetailed(readFileSync(paths.sourcePath, 'utf8'));
  const questions = buildImported(cards);
  write(paths.outPath, JSON.stringify(questions, null, 2) + '\n');
  const list = (name: string, items: { cardNumber: number }[]) =>
    console.log(`${name}: ${items.length}${items.length ? ` (cards ${items.map((i) => i.cardNumber).join(', ')})` : ''}`);
  list('skipped (no answer)', skipped);
  list('duplicates dropped', duplicates);
  list('mismatched (excluded)', mismatched.map((m) => ({ cardNumber: m.cardNumber })));
  for (const m of mismatched) console.log(`  card ${m.cardNumber} id ${stableQuestionId(m.card)}`);
  writeExclusions(paths.exclusionsPath, skipped, duplicates, mismatched);

  const rand = rng(SEED);
  const pool = [...questions];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const lines = [
    '# Topic assignment sample',
    '',
    `${SAMPLE_SIZE} cards chosen with fixed seed ${SEED}. Review is non-blocking.`,
    '',
  ];
  for (const q of pool.slice(0, SAMPLE_SIZE)) {
    lines.push(`### ${q.id}`, '', q.text, '', `Topic: ${q.topicId ?? 'Tổng hợp (null)'}`, '');
  }
  write(paths.samplePath, lines.join('\n'));
  return questions.length;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log(`wrote ${runBuild()} questions`);
}
