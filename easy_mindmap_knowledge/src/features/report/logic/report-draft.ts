import type { ReportRow } from '@/persistence/records';

export const MAX_BODY = 1500;
export const MAX_SYSTEM_IMAGES = 3;
/** Question and lesson reports take at most one screenshot. */
const MAX_CONTEXT_IMAGES = 1;

export type ReportContext =
  | {
      type: 'question';
      questionId: string;
      sourceScreen: string;
      attempt?: {
        attemptId: string;
        position: number;
        optionOrder: string[];
        selected: string[];
        isCorrect: boolean | null;
      };
    }
  | { type: 'lesson'; lessonId: string; sourceScreen: string }
  | { type: 'attempt'; attemptId: string; sourceScreen: string }
  | { type: 'system' };

export interface ReportDraft {
  context: ReportContext;
  body: string;
  images: Uint8Array[];
}

export type DraftProblem = 'empty' | 'tooLong' | 'tooManyImages';
export type DraftValidation = { ok: true } | { ok: false; reason: DraftProblem };

/** A delimiter run: `**` (bold) or `_` (italic). It may open a pair, close one, or both. */
interface Delimiter {
  char: '*' | '_';
  start: number;
  length: number;
  canOpen: boolean;
  canClose: boolean;
}

const SPACE = /\s/u;
const WORD = /[\p{L}\p{N}_]/u;

/** A missing neighbour (start or end of the text) counts as whitespace. */
const isInk = (c: string | undefined): boolean => c !== undefined && !SPACE.test(c);
const isWord = (c: string | undefined): boolean => c !== undefined && WORD.test(c);

/** Decides whether the run `chars[start .. start + length)` can open and/or close a pair. */
function delimiterAt(chars: string[], start: number, length: number): Delimiter {
  const char = chars[start] as '*' | '_';
  const before = start > 0 ? chars[start - 1] : undefined;
  const after = start + length < chars.length ? chars[start + length] : undefined;
  if (char === '*') {
    return { char, start, length, canOpen: isInk(after), canClose: isInk(before) };
  }
  return {
    char,
    start,
    length,
    canOpen: isInk(after) && !isWord(before),
    canClose: isInk(before) && !isWord(after),
  };
}

/**
 * Marks the delimiter runs of every matched pair, in one left-to-right pass over the original text.
 * A run that can close takes the nearest open run of its kind, and the open runs between them are
 * dropped (they stay text), so pairs never cross. A run that cannot close opens if it can. A line
 * break drops every open run. Each run is pushed and popped at most once, so the pass is linear.
 */
function markPairs(chars: string[]): boolean[] {
  const marked = new Array<boolean>(chars.length).fill(false);
  const stack: Delimiter[] = [];
  const open: Record<'*' | '_', number> = { '*': 0, _: 0 };
  let i = 0;
  while (i < chars.length) {
    const c = chars[i];
    if (c === '\n') {
      stack.length = 0;
      open['*'] = 0;
      open._ = 0;
      i++;
    } else if (c === '*' || c === '_') {
      let end = i;
      while (end < chars.length && chars[end] === c) end++;
      const length = end - i;
      if (c === '*' ? length === 2 : length === 1) {
        const run = delimiterAt(chars, i, length);
        if (run.canClose && open[c] > 0) {
          let k = stack.length - 1;
          while (stack[k].char !== c) k--;
          const opener = stack[k];
          while (stack.length > k) open[stack.pop()!.char]--;
          for (let p = opener.start; p < opener.start + opener.length; p++) marked[p] = true;
          for (let p = i; p < end; p++) marked[p] = true;
        } else if (run.canOpen) {
          stack.push(run);
          open[c]++;
        }
      }
      i = end;
    } else {
      i++;
    }
  }
  return marked;
}

/**
 * Visible length of a report body. The body is stored as markdown in a subset that approximates
 * CommonMark for these constructs: bold `**x**`, italic `_x_`, `- ` and `N. ` list items, and line
 * breaks. There is no escape syntax. A marker counts as zero only when it forms a pair; any other
 * `*` or `_` is ordinary text and counts.
 *
 * Rules, applied in this order:
 * 1. Normalise to NFC and line endings to `\n`. Each line break counts as 1.
 * 2. Remove a `- ` or `N. ` list marker at the start of a line (after optional spaces or tabs).
 * 3. Delimiter runs: exactly two `*` (`**`) or exactly one `_` (`_`). Any other run (`*`, `***`,
 *    `__`, `____`) is text and never pairs.
 * 4. Opening: `**` opens when the next character is not whitespace. `_` opens when the next
 *    character is not whitespace and the previous character is not a letter, digit or `_`.
 *    Closing: `**` closes when the previous character is not whitespace. `_` closes when the
 *    previous character is not whitespace and the next character is not a letter, digit or `_`.
 *    A missing neighbour counts as whitespace, and is not a letter, digit or `_`.
 * 5. Pairing: one left-to-right pass over the original text. A run that closes takes the nearest
 *    open run of its kind; open runs between the two are dropped and stay text, so pairs never
 *    cross. A run that cannot close opens if it can. A line break drops every open run, so pairs
 *    never span lines. `**_x_**` and `_**x**_` nest; `snake_case`, `AWS_S3` and `s3_bucket` keep
 *    their underscores.
 * 6. Remove the runs of matched pairs. Trim whitespace at both ends (blank lines included).
 *    Interior spaces count.
 * 7. Count code points (`Array.from`), so one emoji is 1.
 *
 * Known limits: a run of three asterisks (`***x***`) is text, not emphasis. CommonMark's rule of
 * three is not applied, so `**a****b**` is 6 here.
 */
export function visibleLength(markdown: string): number {
  const text = markdown
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/^[ \t]*(?:-|\d+\.) /gm, '');
  const chars = Array.from(text);
  const marked = markPairs(chars);
  const kept = chars.filter((_, i) => !marked[i]).join('');
  return Array.from(kept.trim()).length;
}

/** Checks the body and screenshot count. The body is checked first, so `empty` wins over the others. */
export function validateDraft(d: ReportDraft): DraftValidation {
  const length = visibleLength(d.body);
  if (length === 0) return { ok: false, reason: 'empty' };
  if (length > MAX_BODY) return { ok: false, reason: 'tooLong' };
  const imageLimit = d.context.type === 'system' ? MAX_SYSTEM_IMAGES : MAX_CONTEXT_IMAGES;
  if (d.images.length > imageLimit) return { ok: false, reason: 'tooManyImages' };
  return { ok: true };
}

/**
 * Builds the database row for a valid draft (the caller validates first). Fields that the
 * context does not carry are null. Option arrays are copied, so later changes to the draft do not reach the row.
 */
export function buildReportRow(
  d: ReportDraft,
  meta: { id: string; now: number; appVersion: string; locale: ReportRow['locale'] },
): Omit<ReportRow, 'images'> {
  const common = {
    id: meta.id,
    status: 'new' as const,
    createdAt: meta.now,
    statusUpdatedAt: meta.now,
    body: d.body,
    appVersion: meta.appVersion,
    locale: meta.locale,
  };
  const ctx = d.context;
  switch (ctx.type) {
    case 'question':
      return {
        ...common,
        type: 'question',
        sourceScreen: ctx.sourceScreen,
        questionId: ctx.questionId,
        lessonId: null,
        attemptId: ctx.attempt?.attemptId ?? null,
        position: ctx.attempt?.position ?? null,
        optionOrder: ctx.attempt ? [...ctx.attempt.optionOrder] : null,
        selected: ctx.attempt ? [...ctx.attempt.selected] : null,
        isCorrect: ctx.attempt?.isCorrect ?? null,
      };
    case 'lesson':
      return {
        ...common,
        type: 'lesson',
        sourceScreen: ctx.sourceScreen,
        questionId: null,
        lessonId: ctx.lessonId,
        attemptId: null,
        position: null,
        optionOrder: null,
        selected: null,
        isCorrect: null,
      };
    case 'attempt':
      return {
        ...common,
        type: 'attempt',
        sourceScreen: ctx.sourceScreen,
        questionId: null,
        lessonId: null,
        attemptId: ctx.attemptId,
        position: null,
        optionOrder: null,
        selected: null,
        isCorrect: null,
      };
    case 'system':
      return {
        ...common,
        type: 'system',
        sourceScreen: null,
        questionId: null,
        lessonId: null,
        attemptId: null,
        position: null,
        optionOrder: null,
        selected: null,
        isCorrect: null,
      };
  }
}
