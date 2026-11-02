import { Marked } from 'marked';

// Content is bundled and trusted, but raw HTML is still escaped so a stray tag never executes.
const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const marked = new Marked({
  gfm: true,
  async: false,
  renderer: {
    html: ({ text }) => escapeHtml(text),
    link({ href, title, tokens }) {
      const label = this.parser.parseInline(tokens);
      const t = title ? ` title="${escapeHtml(title)}"` : '';
      return `<a href="${escapeHtml(href)}"${t} rel="noopener noreferrer">${label}</a>`;
    },
  },
});

export function renderLessonBody(markdown: string): string {
  return marked.parse(markdown, { async: false });
}
