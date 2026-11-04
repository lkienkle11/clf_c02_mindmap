import type { Lesson, Topic } from '@/content/types';
import type { AttemptRow } from '@/persistence/records';

export type TopicStatus = 'done' | 'current' | 'locked';

/** Topics with at least one submitted, passed practice attempt. Review attempts never count. */
export function completedTopicIds(attempts: AttemptRow[]): Set<string> {
  const done = new Set<string>();
  for (const a of attempts) {
    if (a.kind === 'practice' && a.status === 'submitted' && a.passed === true && a.topicId !== null) {
      done.add(a.topicId);
    }
  }
  return done;
}

/**
 * done if completed; current = first not-done topic (by order) provided `gateOpen(topicId)` is true;
 * every other not-done topic is locked. A closed gate leaves no current topic. The gate rule itself
 * (checkpoint groups) lives outside this feature and is injected.
 */
export function topicStatuses(
  topics: Topic[],
  completed: Set<string>,
  gateOpen: (topicId: string) => boolean,
): Map<string, TopicStatus> {
  const result = new Map<string, TopicStatus>();
  let currentTaken = false;
  for (const t of [...topics].sort((a, b) => a.order - b.order)) {
    if (completed.has(t.id)) {
      result.set(t.id, 'done');
    } else if (!currentTaken) {
      currentTaken = true;
      result.set(t.id, gateOpen(t.id) ? 'current' : 'locked');
    } else {
      result.set(t.id, 'locked');
    }
  }
  return result;
}

/**
 * Every REQUIRED lesson is read (ruling R17). Vacuously true for a topic with no lessons or only
 * optional ones, so a topic whose lessons are not written yet can still be practised.
 */
export function practiceUnlocked(lessons: Lesson[], readIds: Set<string>): boolean {
  return lessons.every((l) => !l.required || readIds.has(l.id));
}

/** First (by order) required lesson not yet read, else null. */
export function currentLesson(lessons: Lesson[], readIds: Set<string>): Lesson | null {
  return (
    [...lessons]
      .sort((a, b) => a.order - b.order)
      .find((l) => l.required && !readIds.has(l.id)) ?? null
  );
}
