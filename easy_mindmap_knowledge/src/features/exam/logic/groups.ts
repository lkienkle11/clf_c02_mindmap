import type { Topic } from '@/content/types';

/** Number of topics in one checkpoint group. */
export const CHECKPOINT_GROUP_SIZE = 3;

export interface CheckpointGroup {
  /** 1-based group number. */
  index: number;
  topicIds: string[];
}

/**
 * Splits the non-capstone topics, sorted by `order`, into checkpoint groups.
 * The last group may hold fewer than CHECKPOINT_GROUP_SIZE topics.
 */
export function checkpointGroups(topics: Topic[]): CheckpointGroup[] {
  const ordered = topics
    .filter((t) => t.tier !== 'capstone')
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
 * - Capstone: the last group.
 * - Otherwise: null.
 */
export function gateBefore(topics: Topic[], topicId: string): CheckpointGroup | null {
  const groups = checkpointGroups(topics);
  if (topics.find((t) => t.id === topicId)?.tier === 'capstone') {
    return groups[groups.length - 1] ?? null;
  }
  for (const group of groups) {
    if (group.topicIds[0] === topicId && group.index > 1) {
      return groups[group.index - 2];
    }
  }
  return null;
}
