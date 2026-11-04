import type { AttemptQuestionRow, AttemptRow } from '@/persistence/records';

export interface ScorePoint {
  attemptId: string;
  at: number;
  scorePct: number;
  kind: AttemptRow['kind'];
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

export interface MissedDetail {
  questionId: string;
  topicId: string | null;
  misses: number;
  seen: number;
  latestWrong: { attemptId: string; at: number; selected: string[]; optionOrder: string[] };
  distinctWrongAnswers: number;
}

export function missedDetails(
  attempts: AttemptRow[],
  rowsByAttempt: Map<string, AttemptQuestionRow[]>,
  topicOf: (questionId: string) => string | null,
): MissedDetail[] {
  interface Acc {
    misses: number;
    seen: number;
    latest: MissedDetail['latestWrong'] | null;
    answers: Set<string>;
  }
  const acc = new Map<string, Acc>();
  for (const a of attempts) {
    if (a.status !== 'submitted') continue;
    const at = a.submittedAt ?? 0;
    for (const r of rowsByAttempt.get(a.id) ?? []) {
      const cur = acc.get(r.questionId) ?? { misses: 0, seen: 0, latest: null, answers: new Set() };
      cur.seen += 1;
      if (r.isCorrect !== true) {
        cur.misses += 1;
        cur.answers.add([...r.selected].sort().join('\u0000'));
        const l = cur.latest;
        if (l === null || at > l.at || (at === l.at && a.id > l.attemptId)) {
          cur.latest = {
            attemptId: a.id,
            at,
            selected: [...r.selected],
            optionOrder: [...r.optionOrder],
          };
        }
      }
      acc.set(r.questionId, cur);
    }
  }
  const out: MissedDetail[] = [];
  for (const [questionId, v] of acc) {
    if (v.misses === 0 || v.latest === null) continue;
    out.push({
      questionId,
      topicId: topicOf(questionId),
      misses: v.misses,
      seen: v.seen,
      latestWrong: v.latest,
      distinctWrongAnswers: v.answers.size,
    });
  }
  return out.sort(
    (x, y) =>
      y.misses - x.misses ||
      y.misses / y.seen - x.misses / x.seen ||
      (x.questionId < y.questionId ? -1 : x.questionId > y.questionId ? 1 : 0),
  );
}
