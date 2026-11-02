// @vitest-environment node
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import type { RawCard } from './parse-cards';
import { parseCards } from './parse-cards';
import { classifyCard } from './classify';
import { buildImported } from './build-imported';
import { runBuild } from './build';
import { loadCatalog } from '../../src/content/load-catalog';

const card = (text: string, opts: string[] = ['x', 'y'], correct = ['A']): RawCard => ({
  text,
  options: opts.map((t, i) => ({ key: 'ABCDEF'[i], text: t })),
  correctKeys: correct,
  multi: correct.length > 1,
});

describe('classifyCard', () => {
  it('assigns S3/Glacier cards to storage', () => {
    expect(classifyCard(card('Which Amazon S3 storage class is cheapest for archives?', ['S3 Standard', 'Amazon S3 Glacier Deep Archive']))).toBe('storage');
  });
  it('assigns Trusted Advisor + support plan to support-ai-other', () => {
    expect(classifyCard(card('Which AWS Support plan includes full AWS Trusted Advisor checks?', ['Basic', 'Business']))).toBe('support-ai-other');
  });
  it('returns null with no keyword', () => {
    expect(classifyCard(card('What colour is the sky?', ['Blue', 'Green']))).toBeNull();
  });
  it('returns null on a tie', () => {
    expect(classifyCard(card('Amazon S3 or Amazon EC2?', ['a', 'b']))).toBeNull();
  });
});

describe('buildImported', () => {
  const cards = [card('Amazon S3 question'), card('Amazon RDS question'), card('no keywords here')];
  it('preserves count, unique ids, mapped fields', () => {
    const qs = buildImported(cards);
    expect(qs).toHaveLength(3);
    expect(new Set(qs.map((q) => q.id)).size).toBe(3);
    expect(qs[0]).toMatchObject({ source: 'imported', topicId: 'storage', correct: ['A'], multi: false, orderDependent: false });
    expect(qs[2].topicId).toBeNull();
  });
  it('flags order-dependent options', () => {
    expect(buildImported([card('q', ['All of the above', 'x'])])[0].orderDependent).toBe(true);
  });
});

const SRC = fileURLToPath(new URL('../../../export_cards_to_knowt/results/questions.txt', import.meta.url));
const dirs: string[] = [];
afterAll(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

describe('runBuild', () => {
  it('writes json and sample into injected dirs and reads back', () => {
    const dir = mkdtempSync(join(tmpdir(), 'imp-'));
    dirs.push(dir);
    const out = join(dir, 'q', 'imported.json');
    const sample = join(dir, 'r', 'sample.md');
    const n = runBuild({ sourcePath: SRC, outPath: out, samplePath: sample });
    const parsed = JSON.parse(readFileSync(out, 'utf8'));
    expect(parsed).toHaveLength(n);
    expect(n).toBe(parseCards(readFileSync(SRC, 'utf8')).filter((c) => c.multi === c.correctKeys.length > 1).length);
    expect(new Set(parsed.map((q: { id: string }) => q.id)).size).toBe(n);
    expect(readFileSync(out, 'utf8').endsWith('\n')).toBe(true);
    expect(Object.keys(parsed[0])).toEqual(['id', 'topicId', 'text', 'options', 'correct', 'multi', 'orderDependent', 'source']);
    const md = readFileSync(sample, 'utf8');
    expect(md.match(/^### q_/gm)).toHaveLength(30);
    expect(existsSync(sample)).toBe(true);
  });
  it('is deterministic', () => {
    const dir = mkdtempSync(join(tmpdir(), 'imp-'));
    dirs.push(dir);
    runBuild({ sourcePath: SRC, outPath: join(dir, 'a.json'), samplePath: join(dir, 'a.md') });
    runBuild({ sourcePath: SRC, outPath: join(dir, 'b.json'), samplePath: join(dir, 'b.md') });
    expect(readFileSync(join(dir, 'a.md'), 'utf8')).toBe(readFileSync(join(dir, 'b.md'), 'utf8'));
    expect(readFileSync(join(dir, 'a.json'), 'utf8')).toBe(readFileSync(join(dir, 'b.json'), 'utf8'));
  });
});

describe('generated bank', () => {
  it('is accepted by loadCatalog with topics.json', () => {
    const read = (rel: string) => JSON.parse(readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8'));
    const cat = loadCatalog({
      topics: read('../../content/topics.json'),
      lessons: [],
      questions: read('../../content/questions/imported.json'),
    });
    expect(cat.questions.length).toBeGreaterThan(600);
  });
});
