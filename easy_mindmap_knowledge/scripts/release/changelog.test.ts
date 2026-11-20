import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractSection } from './changelog.mjs';

const notes = '### English\n- Announce updates.\n\n### Tiếng Việt\n- Thông báo cập nhật.';

describe('extractSection', () => {
  it('returns the English then Vietnamese block of the requested version', () => {
    const text = `# Changelog\n\n## 0.1.2\n\n${notes}\n\n## 0.1.1\n### English\n- Older release.\n### Tiếng Việt\n- Bản cũ.\n`;

    expect(extractSection(text, '0.1.2')).toBe(notes);
  });

  it('throws naming the version when it has no section', () => {
    expect(() => extractSection(`## 0.1.1\n${notes}`, '0.1.2')).toThrow('0.1.2');
  });

  it('throws when the Vietnamese heading is missing', () => {
    expect(() => extractSection('## 0.1.2\n### English\n- Update.', '0.1.2')).toThrow('0.1.2');
  });

  it('throws when the English heading is missing', () => {
    expect(() => extractSection('## 0.1.2\n### Tiếng Việt\n- Cập nhật.', '0.1.2')).toThrow('0.1.2');
  });

  it.each([
    '### English\n\n### Tiếng Việt\n- Cập nhật.',
    '### English\n- Update.\n\n### Tiếng Việt\n',
    '### English\nDescription only.\n### Tiếng Việt\n- Cập nhật.',
    '### English\n- Update.\n### Tiếng Việt\n- ',
  ])('throws when a language has no bullet: %s', (body) => {
    expect(() => extractSection(`## 0.1.2\n${body}`, '0.1.2')).toThrow('0.1.2');
  });

  it('accepts CRLF line endings', () => {
    expect(extractSection(`## 0.1.2\n${notes}\n`.replace(/\n/g, '\r\n'), '0.1.2')).toBe(notes);
  });

  it('does not match 0.1.2 inside 10.1.2 or a prefix like 0.1.20', () => {
    const others = `## 10.1.2\n${notes}\n## 0.1.20\n${notes}`;
    expect(() => extractSection(others, '0.1.2')).toThrow('0.1.2');
    expect(extractSection(`${others}\n## 0.1.2\n${notes}`, '0.1.2')).toBe(notes);
  });

  it('the real CHANGELOG.md has a valid section for every listed version', () => {
    const text = readFileSync(resolve(__dirname, '../../CHANGELOG.md'), 'utf8');
    const versions = [...text.matchAll(/^## (.+)$/gm)].map(match => match[1]);

    expect(versions).toEqual(['0.2.3', '0.2.2', '0.2.1', '0.2.0', '0.1.1', '0.1.0']);
    for (const version of versions) {
      expect(extractSection(text, version)).toMatch(/^### English\n/);
    }
  });
});
