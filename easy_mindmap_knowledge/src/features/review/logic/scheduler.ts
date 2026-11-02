import type { QuestionStat } from '@/persistence/records';

export interface ReviewScheduler {
  next(
    prev: QuestionStat | null,
    correct: boolean,
    now: number,
    ref: { questionId: string; topicId: string | null },
  ): QuestionStat;
}

const DAY_MS = 86_400_000;
const INTERVAL_DAYS = [1, 3, 7, 14, 30, 60] as const;
const MAX_BOX = INTERVAL_DAYS.length - 1;

export class LeitnerScheduler implements ReviewScheduler {
  next(
    prev: QuestionStat | null,
    correct: boolean,
    now: number,
    ref: { questionId: string; topicId: string | null },
  ): QuestionStat {
    const box = correct ? Math.min((prev?.box ?? 0) + 1, MAX_BOX) : 0;
    return {
      questionId: ref.questionId,
      topicId: ref.topicId,
      box,
      dueAt: now + INTERVAL_DAYS[box] * DAY_MS,
      timesSeen: (prev?.timesSeen ?? 0) + 1,
      timesCorrect: (prev?.timesCorrect ?? 0) + (correct ? 1 : 0),
      lastSeenAt: now,
      lastCorrect: correct,
    };
  }
}
