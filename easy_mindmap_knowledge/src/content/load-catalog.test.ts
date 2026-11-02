import { describe, expect, it } from 'vitest';
import { loadCatalog } from './load-catalog';
import { loadBundledCatalog } from './bundled';
import { makeLesson, makeQuestion, makeRawCatalog } from '@/testing/fixtures';

describe('loadCatalog', () => {
  it('loads a valid small catalog', () => {
    const c = loadCatalog(makeRawCatalog());
    expect(c.topics).toHaveLength(13);
    expect(c.topic('compute').order).toBe(3);
    expect(c.lessonsOf('compute').map((l) => l.id)).toEqual(['compute-ec2']);
    expect(c.questionsOf('compute').map((q) => q.id)).toEqual(['q1']);
  });

  it('keeps topicId null questions out of every topic', () => {
    const c = loadCatalog(makeRawCatalog());
    for (const t of c.topics) expect(c.questionsOf(t.id).map((q) => q.id)).not.toContain('q3');
    expect(c.questions.map((q) => q.id)).toContain('q3');
  });

  it('throws on unknown topic id lookup', () => {
    expect(() => loadCatalog(makeRawCatalog()).topic('nope')).toThrow(/unknown topic/);
  });

  it('rejects duplicate question ids', () => {
    const raw = makeRawCatalog();
    raw.questions.push(makeQuestion({ id: 'q1' }));
    expect(() => loadCatalog(raw)).toThrow(/duplicate/);
  });

  it('rejects duplicate lesson ids', () => {
    const raw = makeRawCatalog();
    raw.lessons.push(makeLesson());
    expect(() => loadCatalog(raw)).toThrow(/duplicate/);
  });

  it('rejects duplicate topic ids', () => {
    const raw = makeRawCatalog();
    raw.topics[1] = { ...raw.topics[1], id: 'cloud-concepts' };
    expect(() => loadCatalog(raw)).toThrow(/duplicate/);
  });

  it('rejects lessonIds pointing at a missing lesson', () => {
    const raw = makeRawCatalog();
    raw.topics[0] = { ...raw.topics[0], lessonIds: ['ghost'] };
    expect(() => loadCatalog(raw)).toThrow(/unknown lesson/);
  });

  it('rejects a correct key not in options', () => {
    const raw = makeRawCatalog();
    raw.questions[0] = makeQuestion({ id: 'q1', correct: ['Z'] });
    expect(() => loadCatalog(raw)).toThrow(/correct key/);
  });

  it('rejects multi that disagrees with correct.length', () => {
    const raw = makeRawCatalog();
    raw.questions[0] = makeQuestion({ id: 'q1', correct: ['A', 'B'], multi: false });
    expect(() => loadCatalog(raw)).toThrow(/multi/);
    raw.questions[0] = makeQuestion({ id: 'q1', correct: ['A'], multi: true });
    expect(() => loadCatalog(raw)).toThrow(/multi/);
  });

  it('accepts multi=true with two correct keys', () => {
    const raw = makeRawCatalog();
    raw.questions[0] = makeQuestion({ id: 'q1', correct: ['A', 'B'], multi: true });
    expect(() => loadCatalog(raw)).not.toThrow();
  });

  it('rejects non-contiguous topic order', () => {
    const raw = makeRawCatalog();
    raw.topics[12] = { ...raw.topics[12], order: 14 };
    expect(() => loadCatalog(raw)).toThrow(/order/);
  });

  it('rejects fewer than 13 topics', () => {
    const raw = makeRawCatalog();
    raw.topics.pop();
    expect(() => loadCatalog(raw)).toThrow(/order/);
  });

  it('returns topics sorted by order', () => {
    const raw = makeRawCatalog();
    raw.topics.reverse();
    expect(loadCatalog(raw).topics.map((t) => t.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });

  it('rejects non-array input', () => {
    expect(() => loadCatalog({ topics: {}, lessons: [], questions: [] })).toThrow(/topics/);
  });
});

describe('loadBundledCatalog', () => {
  // Enabled in Task 18, once lesson and question content exists in content/.
  it.skip('loads the real content folder', () => {
    const c = loadBundledCatalog();
    expect(c.topics).toHaveLength(13);
  });
});
