import { Marked } from 'marked';

// A report body is user input, so the output must contain only markup this file decides on.
//
// Every marked renderer method either builds a fixed template around child output (strong, em, del,
// p, h1-h6, ul/ol/li, blockquote, table parts, hr, br, codespan) or emits text taken from a token. The
// token-text emitters are the dangerous ones, and all of them are overridden below:
//   html      raw HTML, block and inline
//   text      marked trusts `escaped: true` and returns the text verbatim; the lexer sets that flag for
//             any text that follows an inline <script>, <pre>, <style> or <textarea> tag
//   code      same `escaped` trust for fenced and indented code
//   link, image, checkbox   would emit <a>, <img>, <input>
// Everything else is escaped by marked itself (codespan, heading depth and list start are numbers).
// Tests parse the output of hostile and random input and allow only the elements listed in the test.

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Like escapeHtml, but an ampersand that already starts a character reference stays one (as marked does for text). */
const AMPERSAND_NOT_ENTITY = /&(?!(?:#\d+|#[xX][0-9a-fA-F]+|[A-Za-z][A-Za-z0-9]*);)/g;
const escapeText = (s: string): string =>
  s.replace(AMPERSAND_NOT_ENTITY, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const marked = new Marked({
  gfm: true,
  breaks: true,
  async: false,
  renderer: {
    html: ({ text }) => escapeHtml(text),
    // Ignores `escaped` on purpose: text is always escaped here, tokens with children are rendered through them.
    text(token) {
      return 'tokens' in token && token.tokens ? this.parser.parseInline(token.tokens) : escapeText(token.text);
    },
    code: ({ text }) => `<pre><code>${escapeHtml(text.replace(/\n$/, ''))}\n</code></pre>\n`,
    link({ tokens }) {
      return this.parser.parseInline(tokens);
    },
    image: ({ text }) => escapeText(text),
    checkbox: ({ checked }) => (checked ? '[x] ' : '[ ] '),
  },
});

/** Markdown to an HTML string that is safe to hand to {@html}. */
export function renderReportMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false });
}
