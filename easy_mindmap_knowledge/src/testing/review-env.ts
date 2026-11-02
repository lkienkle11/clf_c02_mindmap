// Test-only: in-memory env with completed topics and due questions for the review UI tests.
import type { AttemptRow, QuestionStat } from '@/persistence';
import { makeLesson, makeQuestion, makeRawCatalog } from './fixtures';
import type { RawCatalog } from './fixtures';
import { makePracticeEnv } from './practice-env';
import type { PracticeEnvOptions } from './practice-env';

export const DAY = 86_400_000;
export const NOW = 10 * DAY;

const options = [{ key: 'A', text: 'Alpha' }, { key: 'B', text: 'Bravo' }];

export interface ReviewEnvOptions extends Omit<PracticeEnvOptions, 'rawCatalog' | 'stats' | 'submitted'> {
  /** Questions per topic id; every listed topic is completed and all its questions are due. */
  due?: Record<string, number>;
  /** Completed topics that have no due question. */
  completedOnly?: string[];
  /** Topics with due questions whose practice was never passed. */
  notCompleted?: string[];
}

export function reviewRawCatalog(due: Record<string, number>): RawCatalog {
  const raw = makeRawCatalog();
  raw.lessons = [
    makeLesson({ id: 'compute-ec2', topicId: 'compute', title: { en: 'EC2 basics', vi: 'EC2' } }),
    makeLesson({ id: 'storage-s3', topicId: 'storage', title: { en: 'S3 buckets', vi: 'S3' } }),
  ];
  raw.topics[2] = { ...raw.topics[2], lessonIds: ['compute-ec2'] };
  raw.topics[3] = { ...raw.topics[3], lessonIds: ['storage-s3'] };
  raw.questions = [makeQuestion({ id: 'qnull', topicId: null, text: 'Cross-topic question' })];
  for (const [topicId, n] of Object.entries(due)) {
    for (let i = 0; i < n; i++) {
      raw.questions.push(makeQuestion({ id: `${topicId}-${i}`, topicId, text: `${topicId} question ${i}`, options, correct: ['A'] }));
    }
  }
  return raw;
}

const passed = (topicId: string): AttemptRow => ({
  id: `done-${topicId}`, kind: 'practice', topicId, status: 'submitted', startedAt: 0, submittedAt: 1,
  submitReason: 'manual', reviewAllowed: true,
  clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null },
  heartbeatAt: null, scorePct: 90, passed: true,
});

export async function makeReviewEnv(o: ReviewEnvOptions = {}) {
  const due = o.due ?? { compute: 20, storage: 3 };
  const rawCatalog = reviewRawCatalog(due);
  const stats: QuestionStat[] = Object.entries(due).flatMap(([topicId, n]) =>
    Array.from({ length: n }, (_, i): QuestionStat => ({
      questionId: `${topicId}-${i}`, topicId, box: 1, dueAt: 0, timesSeen: 1, timesCorrect: 0, lastSeenAt: 0, lastCorrect: false,
    })));
  const submitted = [...Object.keys(due), ...(o.completedOnly ?? [])]
    .filter((t) => !(o.notCompleted ?? []).includes(t)).map(passed);
  return makePracticeEnv({ now: () => NOW, ...o, rawCatalog, stats, submitted });
}
