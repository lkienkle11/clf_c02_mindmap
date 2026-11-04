import type { Catalog, Question } from '@/content/types';
import { shuffle } from '@/random/seeded-random';

export const CAPSTONE_TOPIC_ID = 'capstone';

export interface PlannedQuestion {
  questionId: string;
  /** Option keys in display order. */
  optionOrder: string[];
}

export function practiceCount(_topicId: string): number {
  return 10;
}

export function buildPool(catalog: Catalog, topicId: string): Question[] {
  return topicId === CAPSTONE_TOPIC_ID ? [...catalog.questions] : catalog.questionsOf(topicId);
}

/** Shuffles the questions and each option order (kept for `orderDependent`). Does not slice. */
export function planQuestions(questions: Question[], rng: () => number): PlannedQuestion[] {
  return shuffle(questions, rng).map((q) => {
    const keys = q.options.map((o) => o.key);
    return { questionId: q.id, optionOrder: q.orderDependent ? keys : shuffle(keys, rng) };
  });
}

export function planAttempt(pool: Question[], count: number, rng: () => number): PlannedQuestion[] {
  return planQuestions(shuffle(pool, rng).slice(0, Math.max(0, count)), rng);
}
