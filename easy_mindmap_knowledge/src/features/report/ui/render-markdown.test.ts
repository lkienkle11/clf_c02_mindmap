import { describe, expect, it } from 'vitest';
import { renderReportMarkdown } from './render-markdown';

describe('renderReportMarkdown', () => {
  it('renders bold, italic, lists and line breaks', () => {
    const html = renderReportMarkdown('**bold** and *italic*\n\n- one\n- two\n\nline a\nline b');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
    expect(html).toContain('<li>one</li>');
    expect(html).toContain('line a<br>line b');
  });
  it('escapes raw HTML so a script becomes text', () => {
    const html = renderReportMarkdown('<script>alert(1)</script>\n\nhi <img src=x onerror=alert(1)> there');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
  });
  it('turns links into their plain text', () => {
    const html = renderReportMarkdown('see [the docs](https://example.com) or https://example.org now');
    expect(html).not.toContain('<a');
    expect(html).not.toContain('href');
    expect(html).toContain('the docs');
    expect(html).toContain('https://example.org');
  });
  it('turns images into their alt text', () => {
    const html = renderReportMarkdown('![a cat](https://example.com/cat.png)');
    expect(html).not.toContain('<img');
    expect(html).toContain('a cat');
  });
});

// ---------------------------------------------------------------------------------------------
// Hostile input. The output is parsed into a <template> (inert: nothing runs, nothing loads) and
// checked structurally: only the elements below may appear, and only the listed attributes.
// ---------------------------------------------------------------------------------------------
const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'em', 'del', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
]);
const ALLOWED_ATTRS: Record<string, string[]> = { ol: ['start'], th: ['align'], td: ['align'] };
const FORBIDDEN = '[onerror],[onload],[onclick],[onmouseover],[ontoggle],script,iframe,style,img,svg,a,object,embed,textarea,input,link,meta,form,details';

function parse(html: string): HTMLTemplateElement {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  return tpl;
}

function violations(html: string): string[] {
  const out: string[] = [];
  const tpl = parse(html);
  if (tpl.content.querySelector(FORBIDDEN)) out.push('forbidden element or attribute');
  for (const el of tpl.content.querySelectorAll('*')) {
    const tag = el.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) out.push(`element <${tag}>`);
    for (const attr of el.getAttributeNames()) {
      if (!(ALLOWED_ATTRS[tag] ?? []).includes(attr)) out.push(`attribute ${attr} on <${tag}>`);
    }
  }
  return out;
}

const HOSTILE: string[] = [
  // the reviewer's reproductions
  'x <script><img src=x onerror=alert(1) </script>',
  'x <pre><img src=x onerror=alert(1) </pre>',
  'x <script><svg onload=alert(1)',
  '<<script>script>alert(1)<</script>/script>',
  // raw-block tags, open / closed / unclosed
  '<style><img src=x onerror=alert(1)></style>', 'a <style><img src=x onerror=alert(1)>', 'a <style>',
  '<textarea><img src=x onerror=alert(1)></textarea>', 'a <textarea><img src=x onerror=alert(1)>', 'a <textarea>',
  '<pre><img src=x onerror=alert(1)></pre>', 'a <pre><img src=x onerror=alert(1)>', 'a <pre>',
  '<script>alert(1)</script>', 'a <script>alert(1)', 'a <script>',
  '<iframe src="javascript:alert(1)"></iframe>', 'a <iframe src=javascript:alert(1)>', 'a <iframe',
  '<svg onload=alert(1)>', 'a <svg onload=alert(1)></svg>', 'a <svg/onload=alert(1)',
  '<img src=x onerror=alert(1)>', 'a <img src=x onerror=alert(1)', 'a <img src=x onerror=alert(1)//',
  '<div onclick=alert(1)>x</div>', 'a <div onclick=alert(1)>x',
  '<details open ontoggle=alert(1)>x</details>', '<object data="javascript:alert(1)"></object>', '<embed src="javascript:alert(1)">',
  // comments
  '<!-- <img src=x onerror=alert(1)> -->', 'a <!-- <script>alert(1)</script>', '<!--', '<!-- --><img src=x onerror=1>',
  // links, autolinks, references, images
  '<a href="javascript:alert(1)">x</a>', '[x](javascript:alert(1))', '[x](<javascript:alert(1)>)', '<javascript:alert(1)>',
  '<https://example.com>', 'https://example.com/?a=1&b="onmouseover="alert(1)', 'www.example.com/"onmouseover="alert(1)',
  '[ref]\n\n[ref]: javascript:alert(1)', '[ref][ref]\n\n[ref]: javascript:alert(1) "t"', '[ref]\n\n[ref]: <x" onerror="alert(1)>',
  '![a](data:text/html,<script>alert(1)</script>)', '![a" onerror="alert(1)](x)', '![a](x "t\\" onerror=\\"alert(1)")',
  '[x](http://a "t\\" onmouseover=\\"alert(1)")', '[<img src=x onerror=alert(1)>](http://a)', '[![a](x)](y)',
  // entities
  '&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;', '&#60;img src=x onerror=alert(1)&#62;', '&lt;script&gt;alert(1)&lt;/script&gt;', '&#0;&#xD800;&#1114112;<script>',
  // code
  '```html\n<script>alert(1)</script>\n```', '```"><img src=x onerror=alert(1)>\n<script>\n```', '~~~\n<img src=x onerror=1>\n~~~',
  '`<img src=x onerror=alert(1)>`', '``<script>`</script>``', '    <script>alert(1)</script>',
  // nesting and block containers
  '**<script>**<img src=x onerror=1>', '*<img src=x onerror=1>* ~~<svg onload=1>~~', '__<style>__ _<textarea>_',
  '# <img src=x onerror=1>', '> <svg onload=1>', '> <script>\n> alert(1)', '- <img src=x onerror=1>\n- <script>',
  '- [x] <img src=x onerror=1>', '1. <pre>\n2. <img src=x onerror=1>', '| a | b |\n|---|:-:|\n| <img src=x onerror=1> | <script> |',
  '---\n<script>alert(1)</script>', 'line<br>\n<img src=x onerror=1>', 'a\\<script>alert(1)</script>', '<<img src=x onerror=1>',
];

describe('renderReportMarkdown with hostile input', () => {
  it.each(HOSTILE)('produces only intended markup for %j', (input) => {
    expect(violations(renderReportMarkdown(input))).toEqual([]);
  });

  it('keeps hostile source visible as text rather than dropping it', () => {
    const tpl = parse(renderReportMarkdown('x <script><img src=x onerror=alert(1) </script>'));
    expect(tpl.content.textContent).toContain('<script>');
    expect(tpl.content.textContent).toContain('<img src=x onerror=alert(1)');
  });

  it('survives 200 seeded random concatenations of hostile and benign fragments', () => {
    let seed = 0x2f6e2b1;
    const rand = () => {
      // mulberry32
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const pool = [...HOSTILE, '**bold**', '*it*', '- item', '1. one', '`code`', 'plain words', '> quote', '# head'];
    const seps = [' ', '\n', '\n\n', '', '  \n', '\t'];
    for (let n = 0; n < 200; n++) {
      const count = 2 + Math.floor(rand() * 5);
      let input = '';
      for (let i = 0; i < count; i++) input += pool[Math.floor(rand() * pool.length)] + seps[Math.floor(rand() * seps.length)];
      expect(violations(renderReportMarkdown(input)), JSON.stringify(input)).toEqual([]);
    }
  });

  it('still renders legitimate formatting, with the same visible text', () => {
    const md = '# Title\n\nSome **bold**, *italic* and `code` with ~~gone~~ & more.\n\n- one\n- two\n\n1. first\n2. second\n\n> quoted\n\n```\nfn()\n```\n\n| a | b |\n|---|---|\n| 1 | 2 |';
    const html = renderReportMarkdown(md);
    expect(violations(html)).toEqual([]);
    const tpl = parse(html);
    expect(tpl.content.querySelector('h1')?.textContent).toBe('Title');
    expect(tpl.content.querySelector('strong')?.textContent).toBe('bold');
    expect(tpl.content.querySelector('em')?.textContent).toBe('italic');
    expect(tpl.content.querySelector('p code')?.textContent).toBe('code');
    expect(tpl.content.querySelector('del')?.textContent).toBe('gone');
    expect([...tpl.content.querySelectorAll('ul li')].map((li) => li.textContent?.trim())).toEqual(['one', 'two']);
    expect([...tpl.content.querySelectorAll('ol li')].map((li) => li.textContent?.trim())).toEqual(['first', 'second']);
    expect(tpl.content.querySelector('blockquote')?.textContent?.trim()).toBe('quoted');
    expect(tpl.content.querySelector('pre code')?.textContent?.trim()).toBe('fn()');
    expect([...tpl.content.querySelectorAll('td')].map((td) => td.textContent)).toEqual(['1', '2']);
    expect(tpl.content.textContent).toContain('Some bold, italic and code with gone & more.');
  });
});
