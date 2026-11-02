export interface RawCard {
  text: string;
  options: { key: string; text: string }[];
  correctKeys: string[];
  multi: boolean;
}

const NO_ANSWER = '(No correct answer marked in the source document)';

const OPTION_LINE = /^([A-F])\.\s*(.*)$/;

const clean = (s: string): string => s.replace(/\s+/g, ' ').trim();

function parseCard(block: string, n: number): RawCard {
  const lines = block.split('\n').map((l) => l.trim());
  const sep = lines.indexOf('---');
  if (sep < 0) throw new Error(`card ${n}: missing '---' separator`);

  const textParts: string[] = [];
  const options: { key: string; text: string }[] = [];
  for (const line of lines.slice(0, sep)) {
    if (!line) continue;
    const m = OPTION_LINE.exec(line);
    if (m) options.push({ key: m[1], text: clean(m[2]) });
    else if (options.length === 0) textParts.push(line);
    else options[options.length - 1].text = clean(`${options[options.length - 1].text} ${line}`);
  }
  const text = clean(textParts.join(' '));
  if (!text) throw new Error(`card ${n}: empty question text`);
  if (options.length === 0) throw new Error(`card ${n}: no options`);

  const keys = new Set<string>();
  for (const line of lines.slice(sep + 1)) {
    if (!line) continue;
    const m = OPTION_LINE.exec(line);
    const answerText = clean(m ? m[2] : line);
    const matches = options.filter((o) => o.text === answerText && (!m || o.key === m[1]));
    if (matches.length !== 1) {
      throw new Error(`card ${n}: answer "${line}" matches ${matches.length} options`);
    }
    keys.add(matches[0].key);
  }
  if (keys.size === 0) throw new Error(`card ${n}: no correct answer`);

  const correctKeys = [...keys].sort();
  const multi = /\(choose two/i.test(text) || correctKeys.length > 1;
  return { text, options, correctKeys, multi };
}

export interface SkippedCard {
  cardNumber: number;
  reason: string;
}

export interface DuplicateCard {
  cardNumber: number;
  duplicateOf: number;
}

const fingerprint = (c: RawCard): string =>
  JSON.stringify([c.text, c.options.map((o) => [o.key, o.text]), c.correctKeys]);

export function parseCardsDetailed(raw: string): {
  cards: RawCard[];
  skipped: SkippedCard[];
  duplicates: DuplicateCard[];
} {
  const cards: RawCard[] = [];
  const skipped: SkippedCard[] = [];
  const duplicates: DuplicateCard[] = [];
  const seen = new Map<string, number>();
  raw
    .replace(/\r\n?/g, '\n')
    .split(/^===[ \t]*$/m)
    .filter((b) => b.trim() !== '')
    .forEach((block, i) => {
      const n = i + 1;
      if (block.split('\n').some((l) => l.trim() === NO_ANSWER)) {
        skipped.push({ cardNumber: n, reason: 'no correct answer marked in source' });
      } else {
        const card = parseCard(block, n);
        const first = seen.get(fingerprint(card));
        if (first !== undefined) {
          duplicates.push({ cardNumber: n, duplicateOf: first });
        } else {
          seen.set(fingerprint(card), n);
          cards.push(card);
        }
      }
    });
  return { cards, skipped, duplicates };
}

export function parseCards(raw: string): RawCard[] {
  return parseCardsDetailed(raw).cards;
}
