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
});

describe('topicStatuses', () => {
  it('no attempts: first current, rest locked', () => {
    const m = topicStatuses(topics, new Set());
    expect([m.get('t1'), m.get('t2'), m.get('t3')]).toEqual(['current', 'locked', 'locked']);
  });
  it('topic 1 done: t2 current', () => {
    const m = topicStatuses(topics, completedTopicIds([attempt({})]));
    expect([m.get('t1'), m.get('t2'), m.get('t3')]).toEqual(['done', 'current', 'locked']);
  });
  it('odd data: t2 done but t1 not => t1 current, t2 done', () => {
    const m = topicStatuses(topics, new Set(['t2']));
    expect([m.get('t1'), m.get('t2'), m.get('t3')]).toEqual(['current', 'done', 'locked']);
  });
  it('sorts topics by order', () => {
    const m = topicStatuses([topics[2], topics[0], topics[1]], new Set(['t1']));
    expect([m.get('t1'), m.get('t2'), m.get('t3')]).toEqual(['done', 'current', 'locked']);
  });
  it('unknown topic ids in completed are ignored', () => {
    const m = topicStatuses(topics, completedTopicIds([attempt({ topicId: 'zzz' })]));
    expect(m.size).toBe(3);
    expect(m.get('t1')).toBe('current');
  });
  it('all done: no current', () => {
    const m = topicStatuses(topics, new Set(['t1', 't2', 't3']));
    expect([...m.values()]).toEqual(['done', 'done', 'done']);
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
