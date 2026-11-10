import { describe, expect, it } from 'vitest';
import { visibleLength } from '../logic/report-draft';
import { applyFormat } from './rich-text-edit';

describe('applyFormat bold and italic', () => {
  it('wraps the selection', () => {
    const r = applyFormat('say hello now', 4, 9, 'bold')!;
    expect(r.value).toBe('say **hello** now');
    expect(r.value.slice(r.start, r.end)).toBe('**hello**');
    expect(applyFormat('say hello now', 4, 9, 'italic')!.value).toBe('say _hello_ now');
  });
  it('keeps surrounding whitespace outside the markers', () => {
    expect(applyFormat('a  hi  b', 2, 6, 'bold')!.value).toBe('a  **hi**  b');
  });
  it('uses the word at the caret when nothing is selected', () => {
    expect(applyFormat('say hello now', 6, 6, 'bold')!.value).toBe('say **hello** now');
  });
  it('does nothing when there is nothing to wrap', () => {
    expect(applyFormat('a  b', 2, 2, 'bold')).toBeNull();
    expect(applyFormat('', 0, 0, 'italic')).toBeNull();
  });
  it('wraps each line of a multi-line selection on its own, since pairs never span lines', () => {
    expect(applyFormat('one\ntwo', 0, 7, 'bold')!.value).toBe('**one**\n**two**');
  });
  it('toggles an already wrapped selection off', () => {
    expect(applyFormat('a **hi** b', 2, 8, 'bold')!.value).toBe('a hi b');
    expect(applyFormat('a _hi_ b', 2, 6, 'italic')!.value).toBe('a hi b');
  });
  it('refuses an edit whose markers would not pair (inside a word for italic)', () => {
    expect(applyFormat('snakecase', 2, 5, 'italic')).toBeNull();
  });
  it('never changes the visible length', () => {
    const cases: [string, number, number, 'bold' | 'italic' | 'list'][] = [
      ['hello world', 0, 5, 'bold'],
      ['hello world', 6, 11, 'italic'],
      ['- a\n- b', 0, 7, 'list'],
      ['line\nother line', 0, 15, 'list'],
    ];
    for (const [text, s, e, kind] of cases) {
      const r = applyFormat(text, s, e, kind);
      if (r) expect(visibleLength(r.value)).toBe(visibleLength(text));
    }
  });
});

describe('applyFormat list', () => {
  it('prefixes the selected lines with "- "', () => {
    const r = applyFormat('a\nb\nc', 0, 3, 'list')!;
    expect(r.value).toBe('- a\n- b\nc');
  });
  it('prefixes the line at the caret', () => {
    expect(applyFormat('first\nsecond', 8, 8, 'list')!.value).toBe('first\n- second');
    expect(applyFormat('first', 0, 0, 'list')!.value).toBe('- first');
  });
  it('removes the prefix when every line already has it', () => {
    expect(applyFormat('- a\n- b', 0, 7, 'list')!.value).toBe('a\nb');
  });
  it('skips blank lines', () => {
    expect(applyFormat('a\n\nb', 0, 4, 'list')!.value).toBe('- a\n\n- b');
  });
  it('refuses to nest a numbered item, which would change the count', () => {
    expect(applyFormat('1. a', 0, 4, 'list')).toBeNull();
  });
});
