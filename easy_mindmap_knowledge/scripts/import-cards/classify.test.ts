// @vitest-environment node
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import type { RawCard } from './parse-cards';
import { parseCards, parseCardsDetailed } from './parse-cards';
import { classifyCard } from './classify';
import { TOPIC_RULES } from './topic-rules';
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
  it('answer-option matches count double: user deleted resources -> CloudTrail -> deploy-operate', () => {
    const c = card('An administrator observed that multiple AWS resources were deleted yesterday. Which AWS service will help identify the cause and determine which user deleted the resources?', ['AWS CloudTrail', 'Amazon Inspector', 'Amazon GuardDuty', 'AWS Trusted Advisor'], ['A']);
    expect(classifyCard(c)).toBe('deploy-operate');
  });
  it('repeatable test environments -> CloudFormation -> deploy-operate', () => {
    const c = card('A development team wants to deploy multiple test environments for an application in a fast, repeatable manner. Which AWS service should the team use?', ['Amazon EC2', 'AWS CloudFormation', 'Amazon QuickSight', 'Amazon Elastic Container Service (Amazon ECS)'], ['B']);
    expect(classifyCard(c)).toBe('deploy-operate');
  });
  it('Snowball for remote data -> storage', () => {
    const c = card('A team of researchers is going to collect data at remote locations around the world. Many locations do not have internet connectivity. The team needs to capture the data in the field, and transfer it to the AWS Cloud later. Which AWS service will support these requirements?', ['AWS Outposts', 'AWS Transfer Family', 'AWS Snow Family', 'AWS Migration Hub'], ['C']);
    expect(classifyCard(c)).toBe('storage');
  });
  it('CloudFront global latency -> networking', () => {
    const c = card('A company serves users all over the world and wants low latency in many Regions. Which service caches content?', ['Amazon CloudFront', 'AWS Lambda', 'Amazon EBS'], ['A']);
    expect(classifyCard(c)).toBe('networking');
  });
  it('security groups and network ACLs (Choose two) -> networking', () => {
    const c = card('Which services can be used to block network traffic to an instance? (Choose two.)', ['Security groups', 'Network ACLs', 'AWS Shield', 'AWS Artifact'], ['A', 'B']);
    expect(classifyCard(c)).toBe('networking');
  });
  it('never assigns capstone', () => {
    expect(TOPIC_RULES.map((r) => r.topicId)).not.toContain('capstone');
    expect(TOPIC_RULES).toHaveLength(12);
  });
  it('a keyword inside a longer word does not match', () => {
    expect(classifyCard(card('Which Reconnect process is used by the Subnetwork team?', ['x', 'y']))).toBeNull();
    expect(classifyCard(card('Please translate the company forecast.', ['x', 'y']))).toBeNull();
  });
  it('Amazon Connect is case-sensitive; generic lowercase connect does not match', () => {
    expect(classifyCard(card('Which service provides a contact center? ', ['Amazon Connect', 'x'], ['A']))).toBe('support-ai-other');
    expect(classifyCard(card('How do I connect to it?', ['x', 'y']))).toBeNull();
  });
  it('is case-insensitive where intended', () => {
    expect(classifyCard(card('which amazon s3 BUCKET?', ['x', 'y']))).toBe('storage');
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
    const exclusions = join(dir, 'r', 'import-exclusions.md');
    const n = runBuild({ sourcePath: SRC, outPath: out, samplePath: sample, exclusionsPath: exclusions });
    const parsed = JSON.parse(readFileSync(out, 'utf8'));
    expect(parsed).toHaveLength(n);
    expect(n).toBe(668);
    const detailed = parseCardsDetailed(readFileSync(SRC, 'utf8'));
    expect(detailed.mismatched).toHaveLength(1);
    const ex = readFileSync(exclusions, 'utf8');
    expect(ex).toContain(`card ${detailed.mismatched[0].cardNumber}`);
    expect(ex).toContain('q_0b455edc2810');
    expect(ex).toContain('Cloud Adoption Framework');
    expect(ex).toMatch(/duplicate/i);
    expect(ex).toMatch(/no correct answer/i);
    const strings = parsed.flatMap((q: { text: string; options: { text: string }[] }) => [q.text, ...q.options.map((o) => o.text)]);
    expect(strings.filter((s: string) => /&[a-z#0-9]+;/i.test(s))).toEqual([]);
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
    runBuild({ sourcePath: SRC, outPath: join(dir, 'a.json'), samplePath: join(dir, 'a.md'), exclusionsPath: join(dir, 'a-ex.md') });
    runBuild({ sourcePath: SRC, outPath: join(dir, 'b.json'), samplePath: join(dir, 'b.md'), exclusionsPath: join(dir, 'b-ex.md') });
    expect(readFileSync(join(dir, 'a.md'), 'utf8')).toBe(readFileSync(join(dir, 'b.md'), 'utf8'));
    expect(readFileSync(join(dir, 'a.json'), 'utf8')).toBe(readFileSync(join(dir, 'b.json'), 'utf8'));
  });
});

describe('generated bank', () => {
  it('is accepted by loadCatalog with topics.json', () => {
    const read = (rel: string) => JSON.parse(readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8'));
    const cat = loadCatalog({
      // Lessons are out of scope here (bundled-content.test.ts covers them), so drop lesson references.
      topics: read('../../content/topics.json').map((t: { lessonIds: string[] }) => ({ ...t, lessonIds: [] })),
      lessons: [],
      questions: read('../../content/questions/imported.json'),
    });
    expect(cat.questions.length).toBeGreaterThan(600);
  });
});
