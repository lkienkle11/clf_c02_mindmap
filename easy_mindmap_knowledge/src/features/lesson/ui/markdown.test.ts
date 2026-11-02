import { describe, expect, it } from 'vitest';
import { renderLessonBody } from './markdown';

describe('renderLessonBody', () => {
  it('renders headings, lists, bold and code', () => {
    const html = renderLessonBody('# Title\n\n- one\n- two\n\n**bold** and `code`\n\n```\nblock\n```');
    expect(html).toContain('<h1>Title</h1>');
    expect(html).toContain('<li>one</li>');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<code>code</code>');
    expect(html).toContain('<pre><code>block');
  });

  it('renders GFM tables', () => {
    expect(renderLessonBody('|a|b|\n|-|-|\n|1|2|')).toContain('<table>');
  });

  it('escapes raw html', () => {
    const html = renderLessonBody('<script>alert(1)</script>\n\ntext <img src=x onerror=alert(1)>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
  });

  it('adds rel to links and never target', () => {
    const html = renderLessonBody('[AWS](https://aws.amazon.com)');
    expect(html).toContain('href="https://aws.amazon.com"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).not.toContain('target=');
  });

  it('returns an empty string for empty input', () => {
    expect(renderLessonBody('')).toBe('');
  });
});
