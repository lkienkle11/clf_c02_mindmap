import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function extractSection(text, version) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const start = lines.indexOf(`## ${version}`);
  const invalid = () => new Error(`Missing or invalid changelog section for ${version}`);
  if (start === -1) throw invalid();

  const next = lines.findIndex((line, index) => index > start && line.startsWith('## '));
  const section = lines.slice(start + 1, next === -1 ? undefined : next);
  const headings = section.flatMap((line, index) => line.startsWith('### ') ? [index] : []);
  if (headings.length !== 2
    || section[headings[0]] !== '### English'
    || section[headings[1]] !== '### Tiếng Việt') {
    throw invalid();
  }

  const english = section.slice(headings[0] + 1, headings[1]);
  const vietnamese = section.slice(headings[1] + 1);
  if (![english, vietnamese].every(block => block.some(line => /^- \S/.test(line)))) {
    throw invalid();
  }
  return section.slice(headings[0]).join('\n').trim();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [version, changelogPath, latestPath, notesPath] = process.argv.slice(2);
  const notes = extractSection(readFileSync(changelogPath, 'utf8'), version);
  const latest = JSON.parse(readFileSync(latestPath, 'utf8'));
  writeFileSync(notesPath, notes);
  writeFileSync(latestPath, JSON.stringify({ ...latest, notes }, null, 2) + '\n');
}
