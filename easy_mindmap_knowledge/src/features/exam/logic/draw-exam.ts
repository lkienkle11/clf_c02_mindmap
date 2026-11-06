import type { Catalog, Question } from '@/content/types';
import { shuffle } from '@/random/seeded-random';
import { allocate } from './allocate';
import { CAPSTONE_QUESTION_DOMAIN, DOMAIN_OF_TOPIC, DOMAIN_WEIGHTS } from './domains';
import type { DomainId } from './domains';
import { EXAM_QUESTION_COUNT } from './exam-config';
import type { CheckpointGroup } from './groups';

/** Submitted-attempt history: which questions were ever answered, and how often each was answered wrong. */
export interface AnswerHistory {
  seen: Set<string>;
  misses: Map<string, number>;
}

export function historyOf(rows: { questionId: string; isCorrect: boolean }[]): AnswerHistory {
  const seen = new Set<string>();
  const misses = new Map<string, number>();
  for (const row of rows) {
    seen.add(row.questionId);
    if (!row.isCorrect) misses.set(row.questionId, (misses.get(row.questionId) ?? 0) + 1);
  }
  return { seen, misses };
}

/**
 * Up to `n` questions from one bucket, in priority order: unseen, then seen-wrong (most misses first),
 * then seen-right. Within a priority level the order is random.
 */
export function drawBucket(pool: Question[], n: number, history: AnswerHistory, rng: () => number): Question[] {
  const unseen = shuffle(pool.filter((q) => !history.seen.has(q.id)), rng);
  const wrong = shuffle(pool.filter((q) => history.seen.has(q.id) && history.misses.has(q.id)), rng).sort(
    (a, b) => (history.misses.get(b.id) ?? 0) - (history.misses.get(a.id) ?? 0),
  );
  const right = shuffle(pool.filter((q) => history.seen.has(q.id) && !history.misses.has(q.id)), rng);
  return [...unseen, ...wrong, ...right].slice(0, Math.max(0, n));
}

/** Checkpoint exam: up to 65 questions over the group's topics, split by pool size, each topic at least one. */
export function drawCheckpoint(
  catalog: Catalog,
  group: CheckpointGroup,
  history: AnswerHistory,
  rng: () => number,
): Question[] {
  const buckets = group.topicIds.map((id) => catalog.questionsOf(id));
  const sizes = Object.fromEntries(group.topicIds.map((id, i) => [id, buckets[i].length]));
  const counts = allocate(sizes, sizes, EXAM_QUESTION_COUNT, 1);
  const drawn = group.topicIds.flatMap((id, i) => drawBucket(buckets[i], counts[id], history, rng));
  return shuffle(drawn, rng);
}

const DOMAINS = Object.keys(DOMAIN_WEIGHTS) as DomainId[];

/**
 * Capstone exam: 65 questions split across the exam domains by weight. Questions without a domain
 * (no topic, or an unmapped one that is not a known authored Capstone question) are used only when the domains together cannot supply 65.
 */
export function drawCapstone(catalog: Catalog, history: AnswerHistory, rng: () => number): Question[] {
  const pools: Record<DomainId, Question[]> = { concepts: [], security: [], technology: [], billing: [] };
  const unassigned: Question[] = [];
  for (const q of catalog.questions) {
    const domain: DomainId | undefined = q.topicId === null ? undefined : (DOMAIN_OF_TOPIC[q.topicId] ?? CAPSTONE_QUESTION_DOMAIN[q.id]);
    if (domain === undefined) unassigned.push(q);
    else pools[domain].push(q);
  }
  const sizes = Object.fromEntries(DOMAINS.map((d) => [d, pools[d].length]));
  const counts = allocate(DOMAIN_WEIGHTS, sizes, EXAM_QUESTION_COUNT);
  const drawn = DOMAINS.flatMap((d) => drawBucket(pools[d], counts[d], history, rng));
  const short = EXAM_QUESTION_COUNT - drawn.length;
  if (short > 0) drawn.push(...drawBucket(unassigned, short, history, rng));
  return shuffle(drawn, rng);
}
