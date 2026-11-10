import { visibleLength } from '../logic/report-draft';

export type Format = 'bold' | 'italic' | 'list';

/** The new text and the selection to restore. */
export interface Edit {
  value: string;
  start: number;
  end: number;
}

const MARKER = { bold: '**', italic: '_' } as const;
const LIST_PREFIX = '- ';
const SPACE = /\s/u;

/** Wraps the trimmed text of one line in the marker, or unwraps it when it is already wrapped. */
function toggleLine(line: string, marker: string): string {
  const lead = line.length - line.trimStart().length;
  const text = line.trim();
  if (text === '') return line;
  const trail = line.slice(lead + text.length);
  const wrapped = text.length > marker.length * 2 && text.startsWith(marker) && text.endsWith(marker);
  const inner = wrapped ? text.slice(marker.length, text.length - marker.length) : `${marker}${text}${marker}`;
  return line.slice(0, lead) + inner + trail;
}

/** The selection, or the non-space run around the caret when nothing is selected. Null if there is nothing. */
function target(value: string, start: number, end: number): [number, number] | null {
  let s = start;
  let e = end;
  if (s === e) {
    while (s > 0 && !SPACE.test(value[s - 1])) s--;
    while (e < value.length && !SPACE.test(value[e])) e++;
  }
  while (s < e && SPACE.test(value[s])) s++;
  while (e > s && SPACE.test(value[e - 1])) e--;
  return s < e ? [s, e] : null;
}

function formatInline(value: string, start: number, end: number, marker: string): Edit | null {
  const range = target(value, start, end);
  if (!range) return null;
  const [s, e] = range;
  const block = value
    .slice(s, e)
    .split('\n')
    .map((line) => toggleLine(line, marker))
    .join('\n');
  return { value: value.slice(0, s) + block + value.slice(e), start: s, end: s + block.length };
}

function formatList(value: string, start: number, end: number): Edit {
  const first = start === 0 ? 0 : value.lastIndexOf('\n', start - 1) + 1;
  const stop = end > start && value[end - 1] === '\n' ? end - 1 : end;
  const nl = value.indexOf('\n', stop);
  const last = nl === -1 ? value.length : nl;
  const lines = value.slice(first, last).split('\n');
  const filled = lines.filter((l) => l.trim() !== '');
  const allListed = filled.length > 0 && filled.every((l) => l.startsWith(LIST_PREFIX));
  const block = lines
    .map((l) => {
      if (l.trim() === '') return l;
      if (allListed) return l.slice(LIST_PREFIX.length);
      return l.startsWith(LIST_PREFIX) ? l : LIST_PREFIX + l;
    })
    .join('\n');
  return { value: value.slice(0, first) + block + value.slice(last), start: first, end: first + block.length };
}

/**
 * The text after applying a toolbar action to the selection `[start, end)`, or null when it would change
 * nothing useful. Bold is `**x**`, italic `_x_`, a list item `- x`, one wrapped line at a time (pairs never
 * span lines). The result is accepted only if its visible length equals the original's: that proves the
 * markers form pairs (or a list prefix) that visibleLength ignores, without repeating its rules here.
 */
export function applyFormat(value: string, start: number, end: number, kind: Format): Edit | null {
  const edit = kind === 'list' ? formatList(value, start, end) : formatInline(value, start, end, MARKER[kind]);
  if (!edit || edit.value === value) return null;
  return visibleLength(edit.value) === visibleLength(value) ? edit : null;
}
