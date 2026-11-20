import { describe, expect, it } from 'vitest';
import changelog from '../../../../CHANGELOG.md?raw';
import { entriesUpTo, parseChangelog, parseNotes, pickNotes, sortNewestFirst } from './changelog';

describe('parseNotes', () => {
  it('reads both languages', () => {
    expect(parseNotes('### English\n- First change\n- Second change\n### Tiếng Việt\n- Thay đổi')).toEqual({
      en: ['First change', 'Second change'],
      vi: ['Thay đổi'],
    });
  });

  it('returns empty lists for null, empty string and text without headings', () => {
    for (const text of [null, undefined, '', '- Unlabelled note', 'Unparsable text']) {
      expect(parseNotes(text)).toEqual({ en: [], vi: [] });
    }
    expect(parseNotes('### English\nNot a bullet\n### Other\n- Ignore')).toEqual({ en: [], vi: [] });
  });

  it('handles CRLF and blank lines between bullets', () => {
    expect(parseNotes('### English\r\n\r\n- One\r\n\r\n- Two\r\n### Tiếng Việt\r\n\r\n- Một\r\n')).toEqual({
      en: ['One', 'Two'],
      vi: ['Một'],
    });
  });
});

describe('pickNotes', () => {
  it('uses the chosen language', () => {
    const notes = { en: ['English'], vi: ['Tiếng Việt'] };
    expect(pickNotes(notes, 'en')).toEqual(['English']);
    expect(pickNotes(notes, 'vi')).toEqual(['Tiếng Việt']);
  });

  it('falls back to Vietnamese then English then empty', () => {
    expect(pickNotes({ en: [], vi: ['Tiếng Việt'] }, 'en')).toEqual(['Tiếng Việt']);
    expect(pickNotes({ en: ['English'], vi: [] }, 'vi')).toEqual(['English']);
    expect(pickNotes({ en: [], vi: [] }, 'en')).toEqual([]);
    expect(pickNotes({ en: [], vi: [] }, 'vi')).toEqual([]);
  });
});

describe('parseChangelog', () => {
  it('returns every version in file order', () => {
    expect(parseChangelog('# Changelog\r\n- Ignore preamble\r\n## 1.10.0\r\n### English\r\n- New\r\n### Tiếng Việt\r\n- Mới\r\n## 1.2.0\r\n### English\r\n- Older\r\n## 2.0.0\r\n')).toEqual([
      { version: '1.10.0', notes: { en: ['New'], vi: ['Mới'] } },
      { version: '1.2.0', notes: { en: ['Older'], vi: [] } },
      { version: '2.0.0', notes: { en: [], vi: [] } },
    ]);
    expect(parseChangelog('No versions')).toEqual([]);
  });

  it('the real CHANGELOG.md parses with both languages non-empty for every version', () => {
    const entries = parseChangelog(changelog);
    const headings = [...changelog.matchAll(/^## (\d+\.\d+\.\d+)\s*$/gm)].map((match) => match[1]);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries.map((entry) => entry.version)).toEqual(headings);
    for (const entry of entries) {
      expect(entry.notes.en.length).toBeGreaterThan(0);
      expect(entry.notes.vi.length).toBeGreaterThan(0);
    }
  });
});

describe('entriesUpTo', () => {
  it('hides versions newer than the installed one', () => {
    const entries = ['2.0.0', '1.10.0', '1.2.10', '1.2.9', '1.2.2', '1.1.99', '0.99.99'].map((version) => ({
      version,
      notes: { en: [version], vi: [] },
    }));
    expect(entriesUpTo(entries, '1.2.9').map((entry) => entry.version)).toEqual(['1.2.9', '1.2.2', '1.1.99', '0.99.99']);
    expect(entriesUpTo(entries, '1.10.0').map((entry) => entry.version)).toEqual(['1.10.0', '1.2.10', '1.2.9', '1.2.2', '1.1.99', '0.99.99']);
    expect(entriesUpTo(entries, '0.0.0')).toEqual([]);
  });
});

describe('sortNewestFirst', () => {
  it('orders entries by numeric major, minor, patch, newest first', () => {
    const notes = { en: [], vi: [] };
    const entries = ['0.1.0', '0.10.0', '0.2.0', '1.0.0'].map((version) => ({ version, notes }));
    expect(sortNewestFirst(entries).map((e) => e.version)).toEqual(['1.0.0', '0.10.0', '0.2.0', '0.1.0']);
  });
});
