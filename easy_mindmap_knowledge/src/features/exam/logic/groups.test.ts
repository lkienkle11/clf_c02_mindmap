import { describe, expect, it } from 'vitest';
import { loadBundledCatalog } from '@/content/bundled';
import type { Topic } from '@/content/types';
import { CHECKPOINT_GROUP_SIZE, checkpointGroups, gateBefore } from './groups';

const realTopics = loadBundledCatalog().topics;

function topic(id: string, order: number, tier: Topic['tier'] = 'core'): Topic {
  return { id, order, tier, title: { en: id, vi: id }, lessonIds: [] };
}

const synthetic: Topic[] = [
  topic('t7', 7),
  topic('t1', 1),
  topic('t4', 4),
  topic('t2', 2),
  topic('cap', 8, 'capstone'),
  topic('t3', 3),
  topic('t5', 5),
  topic('t6', 6),
];

describe('checkpoint groups', () => {
  it('uses groups of three topics', () => {
    expect(CHECKPOINT_GROUP_SIZE).toBe(3);
  });

  it('splits the real catalog into four groups with the expected topics', () => {
    const groups = checkpointGroups(realTopics);
    expect(groups.map((g) => g.index)).toEqual([1, 2, 3, 4]);
    expect(new Set(groups[0].topicIds)).toEqual(new Set(['cloud-concepts', 'global-infrastructure', 'compute']));
    expect(new Set(groups[1].topicIds)).toEqual(new Set(['storage', 'networking', 'databases']));
    expect(new Set(groups[2].topicIds)).toEqual(new Set(['deploy-operate', 'shared-responsibility', 'iam-security']));
    expect(new Set(groups[3].topicIds)).toEqual(new Set(['pricing-billing', 'migration-caf', 'support-ai-other']));
  });

  it('never places the capstone topic in a group', () => {
    const allIds = checkpointGroups(realTopics).flatMap((g) => g.topicIds);
    expect(allIds).not.toContain('capstone');
  });

  it('chunks synthetic topics by order into groups of 3, 3 and 1, covering each id once', () => {
    const groups = checkpointGroups(synthetic);
    expect(groups.map((g) => g.topicIds.length)).toEqual([3, 3, 1]);
    expect(groups.map((g) => g.index)).toEqual([1, 2, 3]);
    expect(groups[0].topicIds).toEqual(['t1', 't2', 't3']);
    expect(groups[1].topicIds).toEqual(['t4', 't5', 't6']);
    expect(groups[2].topicIds).toEqual(['t7']);
    const all = groups.flatMap((g) => g.topicIds);
    expect(all.sort()).toEqual(['t1', 't2', 't3', 't4', 't5', 't6', 't7']);
  });

  it('gates the first topic of group 2 on group 1', () => {
    expect(gateBefore(realTopics, 'storage')?.index).toBe(1);
    expect(gateBefore(synthetic, 't4')?.index).toBe(1);
  });

  it('returns null for a topic that is not the first of its group', () => {
    expect(gateBefore(realTopics, 'networking')).toBeNull();
  });

  it('returns null for the first topic of group 1', () => {
    expect(gateBefore(realTopics, 'cloud-concepts')).toBeNull();
  });

  it('gates the capstone on the last group', () => {
    expect(gateBefore(realTopics, 'capstone')?.index).toBe(4);
  });
});
