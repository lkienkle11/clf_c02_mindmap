// Pure service-name matching shared by scripts/content/measure-coverage.ts and the coverage guard test.

export interface ServiceEntry {
  name: string;
  aliases: string[];
  topicId: string;
  active: boolean;
}

export interface QuestionLike {
  text: string;
  options: { text: string }[];
}

const NON_WORD = /[^\p{L}\p{N}]+/gu;
// "Amazon S3", "AWS Well-Architected Framework", "AWS re:Post": a prefix, then capitalized words.
// The name ends at the first lowercase word or punctuation, so "Which Amazon S3 storage class" gives "Amazon S3".
const SERVICE_NAME = /\b(?:Amazon|AWS)(?:\s+(?:[A-Z0-9][A-Za-z0-9+-]*|re:Post))+/g;

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Lower case, with every run of non-letter, non-digit characters (spaces, hyphens, colons, apostrophes) as one space. */
export function normalizeForMatch(s: string): string {
  return s.toLowerCase().replace(NON_WORD, ' ').trim();
}

/** True when `term` appears in `text` as whole words, with an optional plural (s or es) on its last word. */
export function mentions(text: string, term: string): boolean {
  const t = normalizeForMatch(term);
  if (t === '') return false;
  return new RegExp(`(?:^| )${escapeRegExp(t)}(?:es|s)?(?= |$)`).test(normalizeForMatch(text));
}

export function serviceMentioned(text: string, service: Pick<ServiceEntry, 'name' | 'aliases'>): boolean {
  return [service.name, ...service.aliases].some((term) => mentions(text, term));
}

// The trailing Sources (EN) or Nguồn (VI) section, same rule as proseWords in bundled-content.test.ts.
const SOURCES_SECTION = /^## (?:Sources|Nguồn)\s*$[\s\S]*$/m;

/**
 * Lesson body prose for matching: the trailing Sources section is dropped (a service named only in a
 * reading list does not count as taught), and link targets (URLs) are dropped with the link text kept.
 */
export function lessonProse(body: string): string {
  return body.replace(SOURCES_SECTION, '').replace(/\]\([^)]*\)/g, ']');
}

/** Lesson file text without its front matter block. */
export function lessonBody(fileText: string): string {
  return fileText.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

export function extractServiceNames(text: string): string[] {
  return [...text.matchAll(SERVICE_NAME)].map((m) => m[0].replace(/\s+/g, ' '));
}

/**
 * Amazon/AWS service names found in the questions (text and options) that no lesson body mentions.
 * Each question counts once per name. Sorted by question count (highest first), then by name.
 */
export function uncoveredServices(
  questions: QuestionLike[],
  lessonBodies: string[],
): { name: string; count: number }[] {
  const counts = new Map<string, { name: string; count: number }>();
  for (const q of questions) {
    const seen = new Map<string, string>();
    for (const part of [q.text, ...q.options.map((o) => o.text)]) {
      for (const name of extractServiceNames(part)) seen.set(normalizeForMatch(name), name);
    }
    for (const [key, name] of seen) {
      const entry = counts.get(key) ?? { name, count: 0 };
      entry.count += 1;
      counts.set(key, entry);
    }
  }
  const prose = lessonBodies.map(lessonProse);
  return [...counts.values()]
    .filter(({ name }) => !prose.some((body) => mentions(body, name)))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Active services that no lesson body of their own topic mentions (by name or any alias). */
export function findMissingServices(
  services: ServiceEntry[],
  bodiesByTopic: Record<string, string[]>,
): ServiceEntry[] {
  return services
    .filter((s) => s.active)
    .filter((s) => {
      const bodies = (bodiesByTopic[s.topicId] ?? []).map(lessonProse);
      return !bodies.some((body) => serviceMentioned(body, s));
    });
}
