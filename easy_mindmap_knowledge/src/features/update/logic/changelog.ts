export type LocalizedNotes = { en: string[]; vi: string[] };

export type ChangelogEntry = { version: string; notes: LocalizedNotes };

export function parseNotes(text: string | null | undefined): LocalizedNotes {
  const notes: LocalizedNotes = { en: [], vi: [] };
  let locale: 'en' | 'vi' | null = null;
  for (const line of (text ?? '').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed === '### English') locale = 'en';
    else if (trimmed === '### Tiếng Việt') locale = 'vi';
    else if (trimmed.startsWith('#')) locale = null;
    else if (locale && trimmed.startsWith('- ')) {
      const bullet = trimmed.slice(2).trim();
      if (bullet) notes[locale].push(bullet);
    }
  }
  return notes;
}

export function parseChangelog(text: string): ChangelogEntry[] {
  const headings = [...text.matchAll(/^## (\d+\.\d+\.\d+)[ \t]*\r?$/gm)];
  return headings.map((heading, index) => ({
    version: heading[1],
    notes: parseNotes(text.slice(heading.index + heading[0].length, headings[index + 1]?.index)),
  }));
}

export function pickNotes(notes: LocalizedNotes, locale: 'en' | 'vi'): string[] {
  if (notes[locale].length) return notes[locale];
  if (notes.vi.length) return notes.vi;
  return notes.en;
}

export function entriesUpTo(entries: ChangelogEntry[], installedVersion: string): ChangelogEntry[] {
  const installed = installedVersion.split('.').map(Number);
  return entries.filter((entry) => {
    const version = entry.version.split('.').map(Number);
    for (let index = 0; index < 3; index++) {
      if (version[index] !== installed[index]) return version[index] < installed[index];
    }
    return true;
  });
}
