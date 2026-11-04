import { describe, expect, it } from 'vitest';
import { makeLesson, makeTopic } from '@/testing/fixtures';
import { layoutTree } from './tree-layout';
import { topicStatuses } from './topic-status';
import { stopLeafId, waterPath } from './water-path';

const ts = [1, 2, 3].map((o) =>
  makeTopic({ order: o, lessonIds: [`t${o}-a`, `t${o}-b`] }),
);
const lessons = (topicId: string, required: boolean[]) =>
  required.map((r, i) => makeLesson({ id: `${topicId}-l${i}`, topicId, order: i + 1, required: r }));

function run(done: string[], expanded: string | null, stop: string | null) {
  const statuses = topicStatuses(ts, new Set(done), () => true);
  const current = [...statuses].find(([, s]) => s === 'current')?.[0] ?? null;
  const layout = layoutTree(ts, { expandedTopicId: expanded });
  return { layout, ...waterPath(layout, { statuses, currentTopicId: current, stopLeafId: stop }) };
}

describe('stopLeafId', () => {
  it('is the first unread required lesson', () => {
    const ls = lessons('x', [true, true]);
    expect(stopLeafId(ls, new Set())).toBe('x-l0');
    expect(stopLeafId(ls, new Set(['x-l0']))).toBe('x-l1');
  });
  it('skips optional lessons and falls back to practice', () => {
    const ls = lessons('x', [false, true]);
    expect(stopLeafId(ls, new Set())).toBe('x-l1');
    expect(stopLeafId(ls, new Set(['x-l1']))).toBe('practice');
    expect(stopLeafId([], new Set())).toBe('practice');
  });
});

describe('waterPath', () => {
  it('no progress: head sits on the first lesson of the expanded current topic', () => {
    const { layout, segments, head } = run([], ts[0].id, ts[0].lessonIds[0]);
    const b = layout.branches[0];
    expect(head).toEqual({ x: b.leaves[0].x, y: b.y });
    expect(segments).toContainEqual({ x1: layout.trunk.x, y1: layout.trunk.y1, x2: layout.trunk.x, y2: b.y, tone: 'next' });
    expect(segments).toContainEqual({ x1: layout.trunk.x, y1: b.y, x2: b.near, y2: b.y, tone: 'next' });
    expect(segments).toContainEqual({ x1: b.far, y1: b.y, x2: b.leaves[0].x, y2: b.y, tone: 'next' });
  });

  it('all required read: head sits on the practice leaf', () => {
    const { layout, head } = run([], ts[0].id, 'practice');
    const b = layout.branches[0];
    expect(head).toEqual({ x: b.leaves[2].x, y: b.y });
    expect(b.leaves[2].id).toBe('practice');
  });

  it('current topic collapsed: head at the near edge, no spine', () => {
    const { layout, head, segments } = run([], null, 'x');
    const b = layout.branches[0];
    expect(head).toEqual({ x: b.near, y: b.y });
    expect(segments.some((s) => s.x1 === b.far)).toBe(false);
  });

  it('stop leaf not found in the layout falls back to the near edge', () => {
    const { layout, head } = run([], ts[0].id, 'missing');
    expect(head).toEqual({ x: layout.branches[0].near, y: layout.branches[0].y });
  });

  it('done topic: branch wet done, trunk done above, head in the next topic', () => {
    const { layout, segments, head } = run([ts[0].id], ts[1].id, ts[1].lessonIds[0]);
    const [b1, b2] = layout.branches;
    expect(segments).toContainEqual({ x1: layout.trunk.x, y1: b1.y, x2: b1.near, y2: b1.y, tone: 'done' });
    expect(segments).toContainEqual({ x1: layout.trunk.x, y1: layout.trunk.y1, x2: layout.trunk.x, y2: b1.y, tone: 'done' });
    expect(segments).toContainEqual({ x1: layout.trunk.x, y1: b1.y, x2: layout.trunk.x, y2: b2.y, tone: 'next' });
    expect(head).toEqual({ x: b2.leaves[0].x, y: b2.y });
  });

  it('locked topics contribute no segments', () => {
    const { layout, segments } = run([], ts[0].id, ts[0].lessonIds[0]);
    const lockedYs = layout.branches.slice(1).map((b) => b.y);
    for (const s of segments) {
      for (const y of lockedYs) expect(s.y1 === y && s.y2 === y).toBe(false);
      expect(Math.max(s.y1, s.y2)).toBeLessThanOrEqual(layout.branches[0].y);
    }
  });

  it('all done: trunk fully wet done and head is null', () => {
    const { layout, segments, head } = run(ts.map((t) => t.id), null, null);
    expect(head).toBeNull();
    expect(segments).toContainEqual({ x1: layout.trunk.x, y1: layout.trunk.y1, x2: layout.trunk.x, y2: layout.trunk.y2, tone: 'done' });
    expect(segments.every((s) => s.tone === 'done')).toBe(true);
    expect(segments.filter((s) => s.y1 === s.y2)).toHaveLength(3);
  });

  it('is deterministic', () => {
    expect(run([ts[0].id], ts[1].id, 'practice')).toEqual(run([ts[0].id], ts[1].id, 'practice'));
  });
});
