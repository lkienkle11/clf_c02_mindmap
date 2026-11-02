import type { AttemptRow } from '@/persistence/records';

export interface ScorePoint {
  attemptId: string;
  at: number;
  scorePct: number;
  kind: 'practice' | 'review';
  topicId: string | null;
}

export function scoreSeries(attempts: AttemptRow[]): ScorePoint[] {
  const points: ScorePoint[] = [];
  for (const a of attempts) {
    if (a.status !== 'submitted' || a.submittedAt === null || a.scorePct === null) continue;
    points.push({
      attemptId: a.id,
      at: a.submittedAt,
      scorePct: a.scorePct,
      kind: a.kind,
      topicId: a.topicId,
    });
  }
  return points.sort(
    (x, y) => x.at - y.at || (x.attemptId < y.attemptId ? -1 : x.attemptId > y.attemptId ? 1 : 0),
  );
}

export function weakTopics(
  attempts: AttemptRow[],
  limit: number,
): { topicId: string; avgPct: number }[] {
  if (limit <= 0) return [];
  const acc = new Map<string, { sum: number; n: number }>();
  for (const a of attempts) {
    if (a.kind !== 'practice' || a.status !== 'submitted') continue;
    if (a.topicId === null || a.scorePct === null) continue;
    const cur = acc.get(a.topicId) ?? { sum: 0, n: 0 };
    cur.sum += a.scorePct;
    cur.n += 1;
    acc.set(a.topicId, cur);
  }
  return [...acc.entries()]
    .map(([topicId, { sum, n }]) => ({ topicId, avgPct: sum / n }))
    .sort((x, y) => x.avgPct - y.avgPct || (x.topicId < y.topicId ? -1 : x.topicId > y.topicId ? 1 : 0))
    .slice(0, limit);
}

export function mostMissed(
  rows: { questionId: string; isCorrect: boolean }[],
  limit: number,
): { questionId: string; misses: number; seen: number }[] {
  if (limit <= 0) return [];
  const acc = new Map<string, { misses: number; seen: number }>();
  for (const r of rows) {
    const cur = acc.get(r.questionId) ?? { misses: 0, seen: 0 };
    cur.seen += 1;
    if (!r.isCorrect) cur.misses += 1;
    acc.set(r.questionId, cur);
  }
  return [...acc.entries()]
    .filter(([, v]) => v.misses > 0)
    .map(([questionId, v]) => ({ questionId, ...v }))
    .sort(
      (x, y) =>
        y.misses - x.misses ||
        y.misses / y.seen - x.misses / x.seen ||
        (x.questionId < y.questionId ? -1 : x.questionId > y.questionId ? 1 : 0),
    )
    .slice(0, limit);
}
