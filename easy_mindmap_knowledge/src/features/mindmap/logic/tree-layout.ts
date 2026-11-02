import type { Tier, Topic } from '@/content/types';

export const NODE_W = 170;
export const NODE_H = 38;
export const BRANCH_OFFSET = 190;
export const LEAF_GAP = 62;
const LEAF_LEAD = 45;
const SIDE_MARGIN = 60;
const ROW_GAP = 100;
const EXPANDED_EXTRA = 45; // added before AND after the expanded topic (90 total)
const TIER_MARK_LIFT = 60;
const TOP = 40;

export interface Leaf {
  /** lessonId, or 'practice' for the last leaf. */
  id: string;
  kind: 'lesson' | 'practice';
  x: number;
  y: number;
  side: 'above' | 'below';
  index: number;
}

export interface Branch {
  topicId: string;
  side: 'left' | 'right';
  y: number;
  node: { cx: number; left: number; right: number; w: 170; h: 38 };
  /** x of the node edge facing the trunk. */
  near: number;
  /** x of the node edge facing away from the trunk (start of the fishbone spine). */
  far: number;
  leaves: Leaf[];
}

export interface TreeLayout {
  width: number;
  height: number;
  trunk: { x: number; y1: number; y2: number };
  tierMarks: { tier: Tier; y: number }[];
  branches: Branch[];
}

/** Pure geometry. Leaves exist only for `expandedTopicId`; their ids come from `topic.lessonIds`. */
export function layoutTree(topics: Topic[], opts: { expandedTopicId: string | null }): TreeLayout {
  const sorted = [...topics].sort((a, b) => a.order - b.order);
  const maxLeaves = sorted.reduce((m, t) => Math.max(m, t.lessonIds.length + 1), 1);
  const trunkX = BRANCH_OFFSET + NODE_W / 2 + LEAF_LEAD + LEAF_GAP * (maxLeaves - 1) + SIDE_MARGIN;

  const tierMarks: { tier: Tier; y: number }[] = [];
  const seenTiers = new Set<Tier>();
  const branches: Branch[] = [];
  let y = TOP + TIER_MARK_LIFT;
  let prevExpanded = false;

  sorted.forEach((topic, i) => {
    const expanded = topic.id === opts.expandedTopicId;
    if (i > 0) y += ROW_GAP + (prevExpanded || expanded ? EXPANDED_EXTRA : 0);
    prevExpanded = expanded;
    if (!seenTiers.has(topic.tier)) {
      seenTiers.add(topic.tier);
      tierMarks.push({ tier: topic.tier, y: y - TIER_MARK_LIFT });
    }
    const side = i % 2 === 0 ? 'left' : 'right';
    const dir = side === 'left' ? -1 : 1;
    const cx = trunkX + dir * BRANCH_OFFSET;
    const left = cx - NODE_W / 2;
    const right = cx + NODE_W / 2;
    const near = side === 'left' ? right : left;
    const far = side === 'left' ? left : right;
    const ids = expanded ? [...topic.lessonIds.map((id) => ({ id, kind: 'lesson' as const })), { id: 'practice', kind: 'practice' as const }] : [];
    const leaves: Leaf[] = ids.map((l, index) => {
      const above = index % 2 === 0;
      return {
        id: l.id,
        kind: l.kind,
        x: far + dir * (LEAF_LEAD + LEAF_GAP * index),
        y: above ? y - LEAF_GAP : y + LEAF_GAP,
        side: above ? 'above' : 'below',
        index,
      };
    });
    branches.push({ topicId: topic.id, side, y, node: { cx, left, right, w: 170, h: 38 }, near, far, leaves });
  });

  const lastY = branches.length ? branches[branches.length - 1].y : TOP;
  const lastExpanded = branches.length > 0 && branches[branches.length - 1].leaves.length > 0;
  const bottom = lastY + (lastExpanded ? 100 : 60);
  return {
    width: 2 * trunkX,
    height: bottom + 40,
    trunk: { x: trunkX, y1: tierMarks.length ? tierMarks[0].y : TOP, y2: bottom },
    tierMarks,
    branches,
  };
}
