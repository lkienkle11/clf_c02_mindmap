// Test-only builders. Nothing outside tests may import this module.
import type { Lesson, Question, Tier, Topic } from '@/content/types';

export const TOPIC_IDS = [
  'cloud-concepts', 'global-infrastructure', 'compute', 'storage', 'networking', 'databases',
  'deploy-operate', 'shared-responsibility', 'iam-security', 'pricing-billing', 'migration-caf',
  'support-ai-other', 'capstone',
] as const;

function tierOf(order: number): Tier {
  if (order <= 2) return 'introduction';
  if (order <= 7) return 'core';
  if (order <= 12) return 'advanced';
  return 'capstone';
}

export function makeTopic(over: Partial<Topic> & { order?: number } = {}): Topic {
  const order = over.order ?? 1;
  const id = over.id ?? TOPIC_IDS[order - 1] ?? `topic-${order}`;
  return { id, order, tier: tierOf(order), title: { en: id, vi: id }, lessonIds: [], ...over };
}

export function makeLesson(over: Partial<Lesson> = {}): Lesson {
  return {
    id: 'compute-ec2', topicId: 'compute', order: 1, required: true,
    title: { en: 'EC2', vi: 'EC2' }, body: { en: 'body', vi: 'nội dung' }, ...over,
  };
}

export function makeQuestion(over: Partial<Question> = {}): Question {
  return {
    id: 'q1', topicId: 'compute', text: 'Which service?',
    options: [{ key: 'A', text: 'EC2' }, { key: 'B', text: 'S3' }],
    correct: ['A'], multi: false, orderDependent: false, source: 'imported', ...over,
  };
}

export function makeTopics(): Topic[] {
  return TOPIC_IDS.map((_, i) => makeTopic({ order: i + 1 }));
}

export interface RawCatalog { topics: Topic[]; lessons: Lesson[]; questions: Question[] }

/** Small valid catalog: 13 topics, one lesson in compute, three questions. */
export function makeRawCatalog(): RawCatalog {
  const topics = makeTopics();
  topics[2] = { ...topics[2], lessonIds: ['compute-ec2'] };
  return {
    topics,
    lessons: [makeLesson()],
    questions: [
      makeQuestion({ id: 'q1' }),
      makeQuestion({ id: 'q2', topicId: 'storage' }),
      makeQuestion({ id: 'q3', topicId: null }),
    ],
  };
}
