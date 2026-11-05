import { describe, expect, it } from 'vitest';
import { BRANCH_OFFSET, NODE_W } from '@/features/mindmap/logic/tree-layout';
import { CHECKPOINT_H, CHECKPOINT_LABEL_OFFSET, CHECKPOINT_RING, CHECKPOINT_W } from './checkpoint-node-size';

describe('checkpoint node size', () => {
  it('leaves at least 140px for the label (the Vietnamese label measures about 111px at 12px bold)', () => {
    expect(CHECKPOINT_W - CHECKPOINT_LABEL_OFFSET).toBeGreaterThanOrEqual(140);
  });

  it('keeps the 44px touch target height', () => {
    expect(CHECKPOINT_H).toBe(44);
  });

  it('stays clear of the branch nodes, including the focus ring', () => {
    const clearanceToBranch = BRANCH_OFFSET - NODE_W / 2;
    expect(CHECKPOINT_W / 2 + CHECKPOINT_RING).toBeLessThan(clearanceToBranch);
  });
});
