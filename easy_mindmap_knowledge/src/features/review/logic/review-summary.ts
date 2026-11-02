import type { QuestionStat } from '@/persistence/records';

export type Urgency = 'urgent' | 'soon';

export interface TopicReviewSummary {
  topicId: string;
  dueCount: number;
  daysOverdue: number;
  urgency: Urgency;
}

export const DAY_MS = 86_400_000;
/** A topic is urgent once its oldest due question is this many days overdue. */
export const URGENT_DAYS = 3;

export function reviewSummaries(stats: QuestionStat[], completed: Set<string>, now: number): TopicReviewSummary[] {
  const byTopic = new Map<string, { count: number; earliest: number }>();
  for (const s of stats) {
    if (s.topicId === null || !completed.has(s.topicId) || s.dueAt > now) continue;
    const cur = byTopic.get(s.topicId);
    if (cur) {
      cur.count += 1;
      cur.earliest = Math.min(cur.earliest, s.dueAt);
    } else {
      byTopic.set(s.topicId, { count: 1, earliest: s.dueAt });
    }
  }
  const out: TopicReviewSummary[] = [];
  for (const [topicId, { count, earliest }] of byTopic) {
    const daysOverdue = Math.max(0, Math.floor((now - earliest) / DAY_MS));
    out.push({ topicId, dueCount: count, daysOverdue, urgency: daysOverdue >= URGENT_DAYS ? 'urgent' : 'soon' });
  }
  return out.sort((a, b) => b.daysOverdue - a.daysOverdue || (a.topicId < b.topicId ? -1 : a.topicId > b.topicId ? 1 : 0));
}
