import type { QuestionStat } from '@/persistence/records';
import { shuffle } from '@/random/seeded-random';
import { reviewSummaries } from './review-summary';

export type ReviewMode = { kind: 'full' } | { kind: 'quick' } | { kind: 'custom'; topicIds: string[] };

export interface ReviewPlan {
  batches: string[][];
  total: number;
}

export const BATCH_SIZE = 15;
export const MIN_TOTAL = 8;
const MIN_PER_TOPIC = 2;

const cmpStr = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Wrong answers first, then older lastSeenAt, then questionId. */
function byPriority(a: QuestionStat, b: QuestionStat): number {
  if (a.lastCorrect !== b.lastCorrect) return a.lastCorrect ? 1 : -1;
  return a.lastSeenAt - b.lastSeenAt || cmpStr(a.questionId, b.questionId);
}

export function buildReviewPlan(input: {
  stats: QuestionStat[];
  completed: Set<string>;
  mode: ReviewMode;
  now: number;
  rng: () => number;
}): ReviewPlan {
  const { stats, completed, mode, now, rng } = input;
  let summaries = reviewSummaries(stats, completed, now);
  if (mode.kind === 'custom') {
    const allowed = new Set(mode.topicIds);
    summaries = summaries.filter((s) => allowed.has(s.topicId));
  }
  if (summaries.length === 0) return { batches: [], total: 0 };

  const due = new Map<string, QuestionStat[]>();
  const notDue = new Map<string, QuestionStat[]>();
  for (const s of summaries) {
    due.set(s.topicId, []);
    notDue.set(s.topicId, []);
  }
  for (const s of stats) {
    if (s.topicId === null) continue;
    const target = (s.dueAt <= now ? due : notDue).get(s.topicId);
    target?.push(s);
  }
  for (const list of [...due.values(), ...notDue.values()]) list.sort(byPriority);

  const selected: string[] = [];
  const chosen = new Set<string>();
  const add = (s: QuestionStat) => {
    if (chosen.has(s.questionId)) return;
    chosen.add(s.questionId);
    selected.push(s.questionId);
  };

  if (mode.kind === 'quick') {
    for (const s of summaries) {
      for (const q of due.get(s.topicId) ?? []) {
        if (selected.length >= BATCH_SIZE) break;
        add(q);
      }
    }
  } else {
    for (const s of summaries) {
      const d = due.get(s.topicId) ?? [];
      d.forEach(add);
      let have = d.length;
      for (const q of notDue.get(s.topicId) ?? []) {
        if (have >= MIN_PER_TOPIC) break;
        add(q);
        have += 1;
      }
    }
  }

  if (selected.length < MIN_TOTAL) {
    outer: for (const s of summaries) {
      for (const q of notDue.get(s.topicId) ?? []) {
        if (selected.length >= MIN_TOTAL) break outer;
        add(q);
      }
    }
  }

  const ordered = shuffle(selected, rng);
  const batches: string[][] = [];
  for (let i = 0; i < ordered.length; i += BATCH_SIZE) batches.push(ordered.slice(i, i + BATCH_SIZE));
  return { batches, total: ordered.length };
}
