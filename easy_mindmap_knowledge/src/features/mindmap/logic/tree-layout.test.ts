import { describe, expect, it } from 'vitest';
import { makeTopic } from '@/testing/fixtures';
import { CHECKPOINT_GAP, layoutTree } from './tree-layout';

const topics = (lessonCounts: number[]) =>
  lessonCounts.map((n, i) =>
    makeTopic({ order: i + 1, lessonIds: Array.from({ length: n }, (_, k) => `t${i + 1}-l${k + 1}`) }),
  );

describe('layoutTree', () => {
  it('alternates sides starting left, ordered by topic order', () => {
    const shuffled = topics([1, 1, 1, 1]).reverse();
    const l = layoutTree(shuffled, { expandedTopicId: null });
    expect(l.branches.map((b) => b.side)).toEqual(['left', 'right', 'left', 'right']);
    expect(l.branches.map((b) => b.topicId)).toEqual(['cloud-concepts', 'global-infrastructure', 'compute', 'storage']);
    const ys = l.branches.map((b) => b.y);
    expect(ys).toEqual([...ys].sort((a, b) => a - b));
    expect(new Set(ys).size).toBe(4);
  });

  it('places nodes 190 from the trunk with near/far edges', () => {
    const l = layoutTree(topics([1, 1]), { expandedTopicId: null });
    const [a, b] = l.branches;
    expect(a.node.cx).toBe(l.trunk.x - 190);
    expect(a.near).toBe(a.node.right);
    expect(a.far).toBe(a.node.left);
    expect(b.node.cx).toBe(l.trunk.x + 190);
    expect(b.near).toBe(b.node.left);
    expect(b.far).toBe(b.node.right);
  });

  it('only the expanded branch has leaves, ending with practice', () => {
    const ts = topics([2, 3, 1]);
    const l = layoutTree(ts, { expandedTopicId: ts[1].id });
    expect(l.branches[0].leaves).toEqual([]);
    expect(l.branches[2].leaves).toEqual([]);
    const leaves = l.branches[1].leaves;
    expect(leaves.map((x) => x.id)).toEqual(['t2-l1', 't2-l2', 't2-l3', 'practice']);
    expect(leaves.map((x) => x.kind)).toEqual(['lesson', 'lesson', 'lesson', 'practice']);
    expect(leaves.map((x) => x.index)).toEqual([0, 1, 2, 3]);
  });

  it('alternates leaf sides above/below starting above, 62 off the spine', () => {
    const ts = topics([3]);
    const b = layoutTree(ts, { expandedTopicId: ts[0].id }).branches[0];
    expect(b.leaves.map((x) => x.side)).toEqual(['above', 'below', 'above', 'below']);
    expect(b.leaves.map((x) => x.y - b.y)).toEqual([-62, 62, -62, 62]);
  });

  it('spaces leaves exactly 62 apart, outward from the far edge', () => {
    const ts = topics([3, 3]);
    const l = layoutTree(ts, { expandedTopicId: ts[0].id });
    const left = l.branches[0];
    expect(left.leaves[0].x).toBe(left.far - 45);
    left.leaves.forEach((x, i) => i > 0 && expect(left.leaves[i - 1].x - x.x).toBe(62));
    const r = layoutTree(ts, { expandedTopicId: ts[1].id }).branches[1];
    expect(r.leaves[0].x).toBe(r.far + 45);
    r.leaves.forEach((x, i) => i > 0 && expect(x.x - r.leaves[i - 1].x).toBe(62));
  });

  it('keeps the worst-case branch inside the canvas on both sides', () => {
    const ts = topics([5, 5, 2]);
    for (const t of ts.slice(0, 2)) {
      const l = layoutTree(ts, { expandedTopicId: t.id });
      const b = l.branches.find((x) => x.topicId === t.id)!;
      for (const leaf of b.leaves) {
        expect(leaf.x).toBeGreaterThanOrEqual(0);
        expect(leaf.x).toBeLessThanOrEqual(l.width);
      }
      expect(Math.min(...b.leaves.map((x) => x.x))).toBeGreaterThan(0);
      expect(Math.max(...b.leaves.map((x) => x.x))).toBeLessThan(l.width);
    }
  });

  it('grows the canvas when a topic has more lessons', () => {
    const small = layoutTree(topics([1, 1]), { expandedTopicId: null });
    const big = layoutTree(topics([1, 6]), { expandedTopicId: null });
    expect(big.width).toBeGreaterThan(small.width);
    expect(big.width).toBe(2 * big.trunk.x);
    expect(big.trunk.x).toBe(190 + 85 + 45 + 62 * 6 + 60);
  });

  it('emits one tier mark per tier, 60 above the tier first topic', () => {
    const l = layoutTree(topics([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]), { expandedTopicId: null });
    expect(l.tierMarks.map((m) => m.tier)).toEqual(['introduction', 'core', 'advanced', 'capstone']);
    const firstOf = (id: string) => l.branches.find((b) => b.topicId === id)!.y;
    expect(l.tierMarks[0].y).toBe(firstOf('cloud-concepts') - 60);
    expect(l.tierMarks[1].y).toBe(firstOf('compute') - 60);
    expect(l.trunk.y1).toBe(l.tierMarks[0].y);
    expect(l.trunk.y2).toBeGreaterThan(l.branches[12].y);
    expect(l.height).toBeGreaterThan(l.trunk.y2);
  });

  it('adds room around the expanded topic', () => {
    const ts = topics([1, 1, 1]);
    const flat = layoutTree(ts, { expandedTopicId: null });
    const open = layoutTree(ts, { expandedTopicId: ts[1].id });
    expect(flat.branches[1].y - flat.branches[0].y).toBe(100);
    expect(open.branches[2].y - open.branches[0].y - 200).toBe(90);
  });

  it('is deterministic', () => {
    const ts = topics([2, 2]);
    expect(layoutTree(ts, { expandedTopicId: ts[0].id })).toEqual(layoutTree(ts, { expandedTopicId: ts[0].id }));
  });

  describe('checkpoints', () => {
    const thirteen = () => topics(Array(13).fill(1));
    const cps = (ts: ReturnType<typeof thirteen>) =>
      [3, 6, 9, 12].map((n, k) => ({ index: k + 1, afterTopicId: ts[n - 1].id }));

    it('defaults to none and keeps the geometry', () => {
      const ts = thirteen();
      const plain = layoutTree(ts, { expandedTopicId: null });
      expect(plain.checkpoints).toEqual([]);
      expect(layoutTree(ts, { expandedTopicId: null, checkpoints: [] })).toEqual(plain);
    });

    it('places 4 checkpoints on the trunk, each strictly between its branch and the next', () => {
      const ts = thirteen();
      const l = layoutTree(ts, { expandedTopicId: null, checkpoints: cps(ts) });
      expect(l.checkpoints.map((c) => c.groupIndex)).toEqual([1, 2, 3, 4]);
      [3, 6, 9, 12].forEach((n, k) => {
        const c = l.checkpoints[k];
        expect(c.afterTopicId).toBe(ts[n - 1].id);
        expect(c.y).toBeGreaterThan(l.branches[n - 1].y);
        expect(c.y).toBeLessThan(l.branches[n].y);
      });
    });

    it('shifts later branches by CHECKPOINT_GAP per preceding checkpoint and leaves earlier ones alone', () => {
      const ts = thirteen();
      const plain = layoutTree(ts, { expandedTopicId: null });
      const l = layoutTree(ts, { expandedTopicId: null, checkpoints: cps(ts) });
      expect(CHECKPOINT_GAP).toBe(70);
      l.branches.forEach((b, i) => {
        expect(b.y - plain.branches[i].y).toBe(CHECKPOINT_GAP * Math.floor(i / 3));
      });
      expect(l.height).toBe(plain.height + 4 * CHECKPOINT_GAP);
    });

    it('keeps the checkpoint clear of the tier mark of the next topic', () => {
      const ts = thirteen();
      const l = layoutTree(ts, { expandedTopicId: null, checkpoints: cps(ts) });
      for (const m of l.tierMarks) {
        for (const c of l.checkpoints) {
          if (Math.abs(c.y - m.y) < 100) expect(Math.abs(c.y - m.y)).toBeGreaterThanOrEqual(22 + 16);
        }
      }
    });
  });
});
