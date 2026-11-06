import { describe, expect, it } from 'vitest';
import type { Lesson, Topic } from '@/content/types';
import type { AttemptRow } from '@/persistence/records';
import { completedTopicIds, currentLesson, practiceUnlocked, topicStatuses } from './topic-status';

const topic = (id: string, order: number): Topic => ({
  id,
  order,
  tier: 'core',
  title: { en: id, vi: id },
  lessonIds: []
});

const lesson = (id: string, order: number, required: boolean): Lesson => ({
  id,
  topicId: 't1',
  order,
  required,
  title: { en: id, vi: id },
  body: { en: '', vi: '' }
});

const attempt = (over: Partial<AttemptRow>): AttemptRow => ({
  id: 'a',
  kind: 'practice',
  topicId: 't1',
  status: 'submitted',
  startedAt: 0,
  submittedAt: 1,
  submitReason: 'manual',
  reviewAllowed: true,
  clock: {} as AttemptRow['clock'],
  heartbeatAt: null,
  scorePct: 80,
  passed: true,
  groupIndex: null,
  plannedCount: null,
  ...over
});

const topics = [topic('t1', 1), topic('t2', 2), topic('t3', 3)];

describe('completedTopicIds', () => {
  it('counts submitted passed practice attempts', () => {
    expect([...completedTopicIds([attempt({})])]).toEqual(['t1']);
  });
  it('ignores review attempts', () => {
    expect(completedTopicIds([attempt({ kind: 'review', scorePct: 100 })]).size).toBe(0);
  });
  it('ignores in_progress and failed attempts', () => {
    const set = completedTopicIds([
      attempt({ status: 'in_progress', passed: null }),
      attempt({ passed: false, scorePct: 50 }),
      attempt({ passed: null })
    ]);
    expect(set.size).toBe(0);
  });
  it('ignores attempts with null topicId', () => {
    expect(completedTopicIds([attempt({ topicId: null })]).size).toBe(0);
  });
  it('ignores a passed checkpoint attempt', () => {
    const cp = attempt({ kind: 'checkpoint', topicId: null, groupIndex: 1, plannedCount: 30 });
    expect(completedTopicIds([cp]).size).toBe(0);
    expect(completedTopicIds([attempt({ kind: 'checkpoint', topicId: 't1', groupIndex: 1 })]).size).toBe(0);
  });
});

describe('topicStatuses', () => {
  it('no attempts: first current, rest locked', () => {
    const m = topicStatuses(topics, new Set(), () => true);
    expect([m.get('t1'), m.get('t2'), m.get('t3')]).toEqual(['current', 'locked', 'locked']);
  });
  it('topic 1 done: t2 current', () => {
    const m = topicStatuses(topics, completedTopicIds([attempt({})]), () => true);
    expect([m.get('t1'), m.get('t2'), m.get('t3')]).toEqual(['done', 'current', 'locked']);
  });
  it('odd data: t2 done but t1 not => t1 current, t2 done', () => {
    const m = topicStatuses(topics, new Set(['t2']), () => true);
    expect([m.get('t1'), m.get('t2'), m.get('t3')]).toEqual(['current', 'done', 'locked']);
  });
  it('sorts topics by order', () => {
    const m = topicStatuses([topics[2], topics[0], topics[1]], new Set(['t1']), () => true);
    expect([m.get('t1'), m.get('t2'), m.get('t3')]).toEqual(['done', 'current', 'locked']);
  });
  it('unknown topic ids in completed are ignored', () => {
    const m = topicStatuses(topics, completedTopicIds([attempt({ topicId: 'zzz' })]), () => true);
    expect(m.size).toBe(3);
    expect(m.get('t1')).toBe('current');
  });
  it('all done: no current', () => {
    const m = topicStatuses(topics, new Set(['t1', 't2', 't3']), () => true);
    expect([...m.values()]).toEqual(['done', 'done', 'done']);
  });
});

describe('topicStatuses injected gate', () => {
  // t4 opens a new group and cap is the capstone; each is guarded by its own flag in the predicate.
  const list = [topic('t1', 1), topic('t2', 2), topic('t3', 3), topic('t4', 4), topic('cap', 5)];
  const gate = (open: { t4: boolean; cap: boolean }) => (id: string) =>
    id === 't4' ? open.t4 : id === 'cap' ? open.cap : true;
  const statuses = (m: Map<string, string>) => list.map((t) => m.get(t.id));

  it('locks t4 and leaves no current topic while its gate is closed', () => {
    const m = topicStatuses(list, new Set(['t1', 't2', 't3']), gate({ t4: false, cap: false }));
    expect(statuses(m)).toEqual(['done', 'done', 'done', 'locked', 'locked']);
    expect([...m.values()]).not.toContain('current');
  });
  it('makes t4 current once its gate opens', () => {
    const m = topicStatuses(list, new Set(['t1', 't2', 't3']), gate({ t4: true, cap: false }));
    expect(statuses(m)).toEqual(['done', 'done', 'done', 'current', 'locked']);
  });
  it('does not consult the gate for an open topic inside a group', () => {
    const m = topicStatuses(list, new Set(['t1']), () => false);
    expect(m.get('t2')).toBe('locked');
    const open = topicStatuses(list, new Set(['t1']), gate({ t4: false, cap: false }));
    expect(open.get('t2')).toBe('current');
  });
  it('keeps the capstone locked until its gate opens', () => {
    const done = new Set(['t1', 't2', 't3', 't4']);
    const closed = topicStatuses(list, done, gate({ t4: false, cap: false }));
    expect(closed.get('cap')).toBe('locked');
    expect([...closed.values()]).not.toContain('current');
    expect(topicStatuses(list, done, gate({ t4: false, cap: true })).get('cap')).toBe('current');
  });
});

describe('practiceUnlocked', () => {
  const ls = [lesson('l1', 1, true), lesson('l2', 2, true), lesson('v', 3, false)];
  it('false while a required lesson is unread', () => {
    expect(practiceUnlocked(ls, new Set(['l1']))).toBe(false);
  });
  it('true when only optional lessons are unread', () => {
    expect(practiceUnlocked(ls, new Set(['l1', 'l2']))).toBe(true);
  });
  // Ruling R17: practice unlocks when EVERY REQUIRED lesson is read, vacuously true without lessons.
  it('true when the topic has no lessons at all', () => {
    expect(practiceUnlocked([], new Set())).toBe(true);
  });
  it('true when the topic has only optional lessons, even unread', () => {
    expect(practiceUnlocked([lesson('v1', 1, false), lesson('v2', 2, false)], new Set())).toBe(true);
  });
  it('false with a single unread required lesson', () => {
    expect(practiceUnlocked([lesson('only', 1, true)], new Set())).toBe(false);
  });
});

describe('currentLesson', () => {
  const ls = [lesson('l2', 2, true), lesson('v', 3, false), lesson('l1', 1, true)];
  it('first unread required lesson by order', () => {
    expect(currentLesson(ls, new Set())?.id).toBe('l1');
    expect(currentLesson(ls, new Set(['l1']))?.id).toBe('l2');
  });
  it('null when all required are read', () => {
    expect(currentLesson(ls, new Set(['l1', 'l2']))).toBeNull();
  });
});
