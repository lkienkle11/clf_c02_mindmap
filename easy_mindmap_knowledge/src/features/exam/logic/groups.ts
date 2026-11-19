import type { Topic } from '@/content/types';
import { isCapstoneExamTopic } from '@/content/capstone-exams';

/** Number of topics in one checkpoint group. */
export const CHECKPOINT_GROUP_SIZE = 3;

export interface CheckpointGroup {
  /** 1-based group number. */
  index: number;
  topicIds: string[];
}

/**
 * Splits topics other than the summary and exams, sorted by `order`, into checkpoint groups.
 * The last group may hold fewer than CHECKPOINT_GROUP_SIZE topics.
 */
export function checkpointGroups(topics: Topic[]): CheckpointGroup[] {
  const ordered = topics
    .filter((t) => t.tier !== 'capstone' && t.tier !== 'exam')
    .slice()
    .sort((a, b) => a.order - b.order);
  const groups: CheckpointGroup[] = [];
  for (let i = 0; i < ordered.length; i += CHECKPOINT_GROUP_SIZE) {
    groups.push({
      index: groups.length + 1,
      topicIds: ordered.slice(i, i + CHECKPOINT_GROUP_SIZE).map((t) => t.id),
    });
  }
  return groups;
}

/**
 * The checkpoint group that must be passed before `topicId` opens.
 * - First topic of group n > 1: group n - 1.
 * - Capstone exam 1: the last group. Exam 2 and the summary have no checkpoint gate.
 * - Otherwise: null.
 */
export function gateBefore(topics: Topic[], topicId: string): CheckpointGroup | null {
  const groups = checkpointGroups(topics);
  if (isCapstoneExamTopic(topicId)) {
    return topicId === 'capstone-exam-1' ? groups[groups.length - 1] ?? null : null;
  }
  for (const group of groups) {
    if (group.topicIds[0] === topicId && group.index > 1) {
      return groups[group.index - 2];
    }
  }
  return null;
}
