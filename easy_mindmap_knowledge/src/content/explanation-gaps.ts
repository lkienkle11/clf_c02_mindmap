import type { Question } from './types';

/** Internal authoring words that must never reach a learner-facing explanation or note. */
const INTERNAL_WORDING = /\bkeyed\b|\banswer key\b/i;

/**
 * References to option letters. The learner never sees the letters because options are shuffled
 * and shown by text, so a letter in an explanation or note points at nothing.
 * Matches "(C)", "(A, B)", "option A", "answer C", "choice D", "are B and D", "A and C are correct".
 */
const LETTER = '[A-F]';
const LETTER_LIST = `${LETTER}(?:\\s*(?:,|and|or|&)\\s*${LETTER})*`;
const LETTER_REFERENCE = new RegExp(
  [
    `\\(\\s*${LETTER_LIST}\\s*\\)`,
    `\\b(?:[Oo]ptions?|[Aa]nswers?|[Cc]hoices?)\\s+${LETTER}\\b`,
    `\\b(?:are|is|be)\\s+${LETTER}(?:,\\s*${LETTER})*,?\\s+(?:and|or|&)\\s+${LETTER}\\b`,
    `\\b${LETTER}\\s+(?:and|or|&)\\s+${LETTER}\\s+(?:are|is)\\s+(?:both\\s+)?(?:the\\s+)?(?:correct|right|wrong|incorrect)\\b`,
  ].join('|'),
);

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
    if (learnerText.some((t) => INTERNAL_WORDING.test(t) || LETTER_REFERENCE.test(t))) gaps.internalWording.push(q.id);
  }
  return gaps;
}
