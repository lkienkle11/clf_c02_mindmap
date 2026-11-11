import type { Question } from './types';

export interface AnswerCorrection {
  questionId: string;
  oldCorrect: string[];
  newCorrect: string[];
  reason: string;
  sources: string[];
  confidence: 'high' | 'medium' | 'low';
  approvedOn: string; // YYYY-MM-DD
}

const CONFIDENCE: ReadonlySet<unknown> = new Set(['high', 'medium', 'low']);
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';
const isNonEmptyStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.length > 0 && v.every((s) => typeof s === 'string');

const sameSet = (a: readonly string[], b: readonly string[]): boolean => {
  const x = new Set(a);
  const y = new Set(b);
  return x.size === y.size && [...x].every((k) => y.has(k));
};

/** Returns human-readable error messages; an empty array means the log is valid. Pure: no file or network access. */
export function validateCorrections(log: unknown, questions: readonly Question[]): string[] {
  if (!Array.isArray(log)) return ['answer corrections log must be an array'];

  const errors: string[] = [];
  const bank = new Map(questions.map((q) => [q.id, q]));
  const firstIndexById = new Map<string, number>();

  log.forEach((raw: unknown, i) => {
    const at = `entry ${i}`;
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      errors.push(`${at}: must be an object`);
      return;
    }
    const e = raw as Record<string, unknown>;

    if (!isNonEmptyString(e.questionId)) errors.push(`${at}: questionId must be a non-empty string`);
    if (!isNonEmptyStringArray(e.oldCorrect)) errors.push(`${at}: oldCorrect must be a non-empty array of strings`);
    if (!isNonEmptyStringArray(e.newCorrect)) errors.push(`${at}: newCorrect must be a non-empty array of strings`);
    if (!isNonEmptyString(e.reason)) errors.push(`${at}: reason must be a non-empty string`);

    if (!Array.isArray(e.sources) || e.sources.length === 0) {
      errors.push(`${at}: sources must be a non-empty array of strings`);
    } else {
      for (const s of e.sources) {
        if (typeof s !== 'string' || !s.startsWith('https://')) {
          errors.push(`${at}: source ${JSON.stringify(s)} must be a string starting with https://`);
        }
      }
    }

    if (!CONFIDENCE.has(e.confidence)) errors.push(`${at}: confidence must be one of high, medium, low`);
    if (typeof e.approvedOn !== 'string' || !DATE.test(e.approvedOn)) {
      errors.push(`${at}: approvedOn must be YYYY-MM-DD`);
    }

    const id = e.questionId;
    if (isNonEmptyString(id)) {
      const first = firstIndexById.get(id);
      if (first !== undefined) errors.push(`${at}: questionId "${id}" duplicates entry ${first}`);
      else firstIndexById.set(id, i);

      const q = bank.get(id);
      if (!q) {
        errors.push(`${at}: questionId "${id}" is not in the question bank`);
      } else if (isNonEmptyStringArray(e.newCorrect) && !sameSet(q.correct, e.newCorrect)) {
        errors.push(
          `${at}: bank answer [${q.correct.join(', ')}] for "${id}" does not match newCorrect [${e.newCorrect.join(', ')}]`,
        );
      }
      if (q && isNonEmptyStringArray(e.newCorrect)) {
        const optionKeys = new Set(q.options.map((o) => o.key));
        for (const key of e.newCorrect) {
          if (!optionKeys.has(key)) errors.push(`${at}: newCorrect key "${key}" is not an option of "${id}"`);
        }
      }
    }

    for (const field of ['oldCorrect', 'newCorrect'] as const) {
      const keys = e[field];
      if (isNonEmptyStringArray(keys) && new Set(keys).size !== keys.length) {
        errors.push(`${at}: ${field} contains a duplicate key`);
      }
    }

    if (isNonEmptyStringArray(e.oldCorrect) && isNonEmptyStringArray(e.newCorrect) && sameSet(e.oldCorrect, e.newCorrect)) {
      errors.push(`${at}: oldCorrect equals newCorrect`);
    }
  });

  return errors;
}
