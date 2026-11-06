import type { Lesson } from '@/content/types';
import type { TreeLayout } from './tree-layout';
import { currentLesson } from './topic-status';
import type { TopicStatus } from './topic-status';

export interface WaterSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tone: 'done' | 'next';
}

export interface WaterPath {
  segments: WaterSegment[];
  head: { x: number; y: number } | null;
}

/** Id of the first unread required lesson, or 'practice' when none is left. */
export function stopLeafId(lessons: Lesson[], readIds: Set<string>): string {
  return currentLesson(lessons, readIds)?.id ?? 'practice';
}

export function waterPath(
  layout: TreeLayout,
  progress: {
    statuses: Map<string, TopicStatus>;
    currentTopicId: string | null;
    stopLeafId: string | null;
  },
): WaterPath {
  const { trunk, branches } = layout;
  const segments: WaterSegment[] = [];
  const seg = (x1: number, y1: number, x2: number, y2: number, tone: 'done' | 'next') =>
    segments.push({ x1, y1, x2, y2, tone });

  const curIdx = branches.findIndex((b) => b.topicId === progress.currentTopicId);
  if (curIdx < 0) {
    // No current topic: everything is done, or a checkpoint is pending and the water stops there.
    for (const b of branches) {
      if (progress.statuses.get(b.topicId) === 'done') seg(trunk.x, b.y, b.near, b.y, 'done');
    }
    if (branches.length === 0) return { segments, head: null };
    const lockedAhead = branches.some((b) => progress.statuses.get(b.topicId) === 'locked');
    if (!lockedAhead) {
      seg(trunk.x, trunk.y1, trunk.x, trunk.y2, 'done');
    } else {
      const lastDone = branches.filter((b) => progress.statuses.get(b.topicId) === 'done').pop();
      const checkpoint = lastDone && layout.checkpoints.find((c) => c.afterTopicId === lastDone.topicId);
      const stopY = checkpoint?.y ?? lastDone?.y;
      if (stopY !== undefined && stopY > trunk.y1) seg(trunk.x, trunk.y1, trunk.x, stopY, 'done');
    }
    return { segments, head: null };
  }

  const current = branches[curIdx];
  const prevY = curIdx > 0 ? branches[curIdx - 1].y : trunk.y1;
  if (prevY > trunk.y1) seg(trunk.x, trunk.y1, trunk.x, prevY, 'done');
  seg(trunk.x, prevY, trunk.x, current.y, 'next');

  for (const b of branches) {
    if (progress.statuses.get(b.topicId) === 'done') seg(trunk.x, b.y, b.near, b.y, 'done');
  }
  seg(trunk.x, current.y, current.near, current.y, 'next');

  const stop = progress.stopLeafId === null ? undefined : current.leaves.find((l) => l.id === progress.stopLeafId);
  if (!stop) return { segments, head: { x: current.near, y: current.y } };
  seg(current.far, current.y, stop.x, current.y, 'next');
  return { segments, head: { x: stop.x, y: current.y } };
}
