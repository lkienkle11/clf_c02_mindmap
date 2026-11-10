import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { AnswerCorrection } from '../../src/content/answer-corrections';
import type { Question } from '../../src/content/types';

export interface ApplyResult { questions: Question[]; applied: string[] }

const sameSet = (a: readonly string[], b: readonly string[]): boolean => {
  const x = new Set(a);
  const y = new Set(b);
  return x.size === y.size && [...x].every((k) => y.has(k));
};

/** Applies the corrections whose questionId is in this bank: sets `correct` to newCorrect and `multi` to (newCorrect.length > 1); changes nothing else. Entries whose question is not in this bank are ignored (a caller checks that every entry was applied in exactly one file). Throws an Error naming the question when its current `correct` is not equal (as a set) to oldCorrect. Does not mutate its inputs. `applied` lists the ids that were changed. */
export function applyCorrections(bank: Question[], log: AnswerCorrection[]): ApplyResult {
  const questions = bank.map((q) => ({ ...q }));
  const indexById = new Map(questions.map((q, i) => [q.id, i]));
  const applied: string[] = [];
  for (const entry of log) {
    const i = indexById.get(entry.questionId);
    if (i === undefined) continue;
    const q = questions[i];
    if (!sameSet(q.correct, entry.oldCorrect)) {
      throw new Error(
        `question ${q.id}: bank answer [${q.correct.join(', ')}] does not match oldCorrect [${entry.oldCorrect.join(', ')}]`,
      );
    }
    questions[i] = { ...q, correct: [...entry.newCorrect], multi: entry.newCorrect.length > 1 };
    if (!applied.includes(q.id)) applied.push(q.id);
  }
  return { questions, applied };
}

/** Serialises `value` with the same indent and trailing newline as `sourceText` (detect the indent from the first indented line: tabs, or N spaces; default 2; a trailing newline only if the source had one). */
export function formatLikeSource(sourceText: string, value: unknown): string {
  const indented = /^([ \t]+)\S/m.exec(sourceText);
  const indent = indented ? (indented[1].startsWith('\t') ? '\t' : indented[1]) : 2;
  const body = JSON.stringify(value, null, indent);
  return sourceText.endsWith('\n') ? body + '\n' : body;
}

function main(argv: string[]): void {
  const [bankPath, logPath, outPath] = argv;
  const bankText = readFileSync(bankPath, 'utf8');
  const log = JSON.parse(readFileSync(logPath, 'utf8')) as AnswerCorrection[];
  const result = applyCorrections(JSON.parse(bankText) as Question[], log);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, formatLikeSource(bankText, result.questions));
  console.log(`applied ${result.applied.length} correction(s)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main(process.argv.slice(2));
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}
