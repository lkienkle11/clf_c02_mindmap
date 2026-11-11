import { describe, expect, it } from 'vitest';
import type { AttemptRow } from '@/persistence/records';
import { loadBundledCatalog } from '@/content/bundled';
import { checkpointState, isGateOpen, passedCheckpointGroups } from './gates';

const attempt = (over: Partial<AttemptRow>): AttemptRow => ({
  id: 'a',
  kind: 'checkpoint',
  topicId: null,
  status: 'submitted',
  startedAt: 0,
  submittedAt: 1,
  submitReason: 'manual',
  reviewAllowed: true,
  clock: {} as AttemptRow['clock'],
  heartbeatAt: null,
  scorePct: 80,
  passed: true,
  groupIndex: 1,
  plannedCount: 30, unansweredDisplay: 'reveal',
  ...over,
});

describe('passedCheckpointGroups', () => {
  it('collects groups of submitted passed checkpoint attempts', () => {
    const set = passedCheckpointGroups([
      attempt({ id: '1', groupIndex: 1 }),
      attempt({ id: '2', groupIndex: 3 }),
    ]);
    expect([...set].sort()).toEqual([1, 3]);
  });
  it('ignores failed, in-progress and ungraded attempts', () => {
    const set = passedCheckpointGroups([
      attempt({ id: '1', passed: false, scorePct: 40 }),
      attempt({ id: '2', status: 'in_progress', passed: null, submittedAt: null, scorePct: null }),
      attempt({ id: '3', passed: null }),
    ]);
    expect(set.size).toBe(0);
  });
  it('ignores practice and review attempts and null groupIndex', () => {
    const set = passedCheckpointGroups([
      attempt({ id: '1', kind: 'practice', topicId: 't1' }),
      attempt({ id: '2', kind: 'review' }),
      attempt({ id: '3', groupIndex: null }),
    ]);
    expect(set.size).toBe(0);
  });
});

describe('checkpointState', () => {
  const group = { index: 2, topicIds: ['a', 'b', 'c'] };
  it('is locked until every topic of the group is completed', () => {
    expect(checkpointState(group, new Set(), new Set())).toBe('locked');
    expect(checkpointState(group, new Set(['a', 'b']), new Set())).toBe('locked');
  });
  it('is available once every topic is completed', () => {
    expect(checkpointState(group, new Set(['a', 'b', 'c']), new Set())).toBe('available');
    expect(checkpointState(group, new Set(['a', 'b', 'c']), new Set([1]))).toBe('available');
  });
  it('is passed when the group is passed', () => {
    expect(checkpointState(group, new Set(['a', 'b', 'c']), new Set([2]))).toBe('passed');
  });
});

describe('isGateOpen', () => {
  const topics = loadBundledCatalog().topics;
  it('opens topics that no gate precedes', () => {
    const open = isGateOpen(topics, new Set());
    expect(open('cloud-concepts')).toBe(true);
    expect(open('global-infrastructure')).toBe(true);
    expect(open('networking')).toBe(true);
  });
  it('closes the first topic of each later group until the previous group is passed', () => {
    expect(isGateOpen(topics, new Set())('storage')).toBe(false);
    expect(isGateOpen(topics, new Set([1]))('storage')).toBe(true);
    expect(isGateOpen(topics, new Set([1]))('deploy-operate')).toBe(false);
  });
  it('closes the capstone until the last group is passed', () => {
    expect(isGateOpen(topics, new Set([1, 2, 3]))('capstone')).toBe(false);
    expect(isGateOpen(topics, new Set([1, 2, 3, 4]))('capstone')).toBe(true);
  });
});
