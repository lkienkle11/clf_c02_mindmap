import type { Question } from './types';

/** Internal authoring words that must never reach a learner-facing explanation or note. */
const INTERNAL_WORDING = /\bkeyed\b|\banswer key\b/i;

export interface ExplanationGaps {
  /** Ids of questions whose explanation is missing or blank. */
  missingExplanation: string[];
  /** "id:KEY" for every option that has no non-blank note. */
  missingNotes: string[];
  /** "id:KEY" for every note whose key is not one of the question's options. */
  extraNoteKeys: string[];
  /** Ids of questions whose explanation or any note contains internal wording. */
  internalWording: string[];
}

const isBlank = (s: string | undefined): boolean => s === undefined || s.trim() === '';

/** Lists every explanation and option-note gap in the questions, without stopping at the first one. */
export function findGaps(questions: Question[]): ExplanationGaps {
  const gaps: ExplanationGaps = { missingExplanation: [], missingNotes: [], extraNoteKeys: [], internalWording: [] };
  for (const q of questions) {
    if (isBlank(q.explanation)) gaps.missingExplanation.push(q.id);

    const notes = q.optionNotes ?? {};
    const optionKeys = new Set(q.options.map((o) => o.key));
    for (const o of q.options) {
      if (isBlank(notes[o.key])) gaps.missingNotes.push(`${q.id}:${o.key}`);
    }
    for (const key of Object.keys(notes)) {
      if (!optionKeys.has(key)) gaps.extraNoteKeys.push(`${q.id}:${key}`);
    }

    const learnerText = [q.explanation ?? '', ...Object.values(notes)];
    if (learnerText.some((t) => INTERNAL_WORDING.test(t))) gaps.internalWording.push(q.id);
  }
  return gaps;
}
