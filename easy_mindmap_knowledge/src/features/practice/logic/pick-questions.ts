import type { Catalog, Question } from '@/content/types';
import { shuffle } from './shuffle';

export const CAPSTONE_TOPIC_ID = 'capstone';

export interface PlannedQuestion {
  questionId: string;
  /** Option keys in display order. */
  optionOrder: string[];
}

export function practiceCount(topicId: string): number {
  return topicId === CAPSTONE_TOPIC_ID ? 30 : 10;
}

export function buildPool(catalog: Catalog, topicId: string): Question[] {
  return topicId === CAPSTONE_TOPIC_ID ? [...catalog.questions] : catalog.questionsOf(topicId);
}

export function planAttempt(pool: Question[], count: number, rng: () => number): PlannedQuestion[] {
  return shuffle(pool, rng)
    .slice(0, Math.max(0, count))
    .map((q) => {
      const keys = q.options.map((o) => o.key);
      return { questionId: q.id, optionOrder: q.orderDependent ? keys : shuffle(keys, rng) };
    });
}
