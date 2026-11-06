import type { AttemptRow } from '@/persistence/records';
import type { Topic } from '@/content/types';
import { gateBefore } from './groups';
import type { CheckpointGroup } from './groups';

export type CheckpointState = 'locked' | 'available' | 'passed';

/** Groups with at least one submitted, passed checkpoint attempt. */
export function passedCheckpointGroups(attempts: AttemptRow[]): Set<number> {
  const passed = new Set<number>();
  for (const a of attempts) {
    if (
      a.kind === 'checkpoint' &&
      a.status === 'submitted' &&
      a.passed === true &&
      a.groupIndex !== null
    ) {
      passed.add(a.groupIndex);
    }
  }
  return passed;
}

/** locked until every topic of the group is completed; then available; passed once the exam is passed. */
export function checkpointState(
  group: CheckpointGroup,
  completed: Set<string>,
  passed: Set<number>,
): CheckpointState {
  if (!group.topicIds.every((id) => completed.has(id))) return 'locked';
  return passed.has(group.index) ? 'passed' : 'available';
}

/** A topic is open when no checkpoint gate precedes it, or the gating group has been passed. */
export function isGateOpen(topics: Topic[], passed: Set<number>): (topicId: string) => boolean {
  return (topicId) => {
    const gate = gateBefore(topics, topicId);
    return gate === null || passed.has(gate.index);
  };
}
