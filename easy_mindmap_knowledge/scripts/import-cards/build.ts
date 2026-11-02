import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildImported } from './build-imported';
import { parseCards } from './parse-cards';

const here = (rel: string) => fileURLToPath(new URL(rel, import.meta.url));

export interface BuildPaths {
  sourcePath: string;
  outPath: string;
  samplePath: string;
}

export const DEFAULT_PATHS: BuildPaths = {
  sourcePath: here('../../../export_cards_to_knowt/results/questions.txt'),
  outPath: here('../../content/questions/imported.json'),
  samplePath: here('../../content/review/topic-assignment-sample.md'),
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

export function runBuild(paths: BuildPaths = DEFAULT_PATHS): number {
  // Source defect guard: a card whose multi flag disagrees with its answer count
  // (e.g. "Choose two" with a single key marked) is incomplete and would be rejected
  // by loadCatalog, so it is left out of the bank rather than shipped mis-keyed.
  const cards = parseCards(readFileSync(paths.sourcePath, 'utf8')).filter(
    (c) => c.multi === c.correctKeys.length > 1,
  );
  const questions = buildImported(cards);
  write(paths.outPath, JSON.stringify(questions, null, 2) + '\n');

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
