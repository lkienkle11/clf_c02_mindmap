import type { Catalog, Lesson, Question, Topic } from './types';

const TOPIC_COUNT = 13;
const TIERS = ['introduction', 'core', 'advanced', 'capstone'];

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNonEmpty = (v: unknown): v is string => isStr(v) && v.length > 0;

function checkLocalized(v: unknown, what: string, field: string): void {
  if (!isObj(v) || !isNonEmpty(v.en) || !isNonEmpty(v.vi)) {
    throw new Error(`${what} ${field} must have non-empty en and vi strings`);
  }
}

function checkTopicShape(t: unknown, i: number): void {
  if (!isObj(t) || !isNonEmpty(t.id)) throw new Error(`topic #${i} must have a string id`);
  const what = `topic ${t.id}`;
  if (!isStr(t.tier) || !TIERS.includes(t.tier)) throw new Error(`${what} has invalid tier: ${String(t.tier)}`);
  if (typeof t.order !== 'number') throw new Error(`${what} order must be a number`);
  checkLocalized(t.title, what, 'title');
  if (!Array.isArray(t.lessonIds) || !t.lessonIds.every(isStr)) {
    throw new Error(`${what} lessonIds must be an array of strings`);
  }
}

function checkLessonShape(l: unknown, i: number): void {
  if (!isObj(l) || !isNonEmpty(l.id)) throw new Error(`lesson #${i} must have a string id`);
  const what = `lesson ${l.id}`;
  if (!isNonEmpty(l.topicId)) throw new Error(`${what} must have a string topicId`);
  if (typeof l.order !== 'number') throw new Error(`${what} order must be a number`);
  checkLocalized(l.title, what, 'title');
  checkLocalized(l.body, what, 'body');
}

function checkQuestionShape(q: unknown, i: number): void {
  if (!isObj(q) || !isNonEmpty(q.id)) throw new Error(`question #${i} must have a string id`);
  const what = `question ${q.id}`;
  if (!isNonEmpty(q.text)) throw new Error(`${what} text must be a non-empty string`);
  if (!Array.isArray(q.options)) throw new Error(`${what} options must be an array`);
  for (const o of q.options) {
    if (!isObj(o) || !isStr(o.key) || !isStr(o.text)) {
      throw new Error(`${what} has a malformed option (needs string key and text)`);
    }
  }
  if (!Array.isArray(q.correct) || !q.correct.every(isStr)) throw new Error(`${what} correct must be an array of strings`);
  if (q.source !== 'imported' && q.source !== 'authored') throw new Error(`${what} has invalid source: ${String(q.source)}`);
  if (q.topicId !== null && !isStr(q.topicId)) throw new Error(`${what} topicId must be a string or null`);
}

function asArray<T>(value: unknown, name: string): T[] {
  if (!Array.isArray(value)) throw new Error(`catalog ${name} must be an array`);
  return value as T[];
}

function assertUnique(kind: string, ids: string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) throw new Error(`duplicate ${kind} id: ${id}`);
    seen.add(id);
  }
}

function validateTopics(topics: Topic[], lessons: Lesson[]): void {
  const lessonById = new Map(lessons.map((l) => [l.id, l]));
  assertUnique('topic', topics.map((t) => t.id));
  const orders = topics.map((t) => t.order).sort((a, b) => a - b);
  const contiguous = orders.length === TOPIC_COUNT && orders.every((o, i) => o === i + 1);
  if (!contiguous) {
    throw new Error(`topic order must be contiguous 1..${TOPIC_COUNT}, got [${orders.join(', ')}]`);
  }
  for (const t of topics) {
    for (const lid of t.lessonIds) {
      const lesson = lessonById.get(lid);
      if (!lesson) throw new Error(`topic ${t.id} references unknown lesson: ${lid}`);
      if (lesson.topicId !== t.id) {
        throw new Error(`lesson ${lid} belongs to topic ${lesson.topicId}, not ${t.id}`);
      }
    }
    checkLessonIdsMatch(t, lessons.filter((l) => l.topicId === t.id));
  }
}

/**
 * The tree draws leaves from `topic.lessonIds` while unlocking reads the lessons by topicId, so the two
 * must be the same list: same ids, same order (lesson `order`, i.e. the NN- file prefix).
 */
function checkLessonIdsMatch(t: Topic, own: Lesson[]): void {
  const sorted = [...own].sort((a, b) => a.order - b.order);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].order === sorted[i - 1].order) {
      throw new Error(`topic ${t.id} has lessons ${sorted[i - 1].id} and ${sorted[i].id} with the same order ${sorted[i].order}`);
    }
  }
  const expected = sorted.map((l) => l.id);
  const listed = new Set(t.lessonIds);
  const missing = expected.filter((id) => !listed.has(id));
  if (missing.length > 0) {
    throw new Error(`topic ${t.id} lessonIds is missing lesson(s) of this topic: ${missing.join(', ')}`);
  }
  assertUnique(`lessonIds entry in topic ${t.id}:`, t.lessonIds);
  if (t.lessonIds.join('\n') !== expected.join('\n')) {
    throw new Error(
      `topic ${t.id} lessonIds must follow the lesson order: expected [${expected.join(', ')}], got [${t.lessonIds.join(', ')}]`,
    );
  }
}

function validateQuestion(q: Question): void {
  // UI lists are keyed by option key or text; a duplicate would crash them, so reject it here.
  const seenKeys = new Set<string>();
  const seenTexts = new Set<string>();
  for (const o of q.options) {
    if (seenKeys.has(o.key)) throw new Error(`question ${q.id} has duplicate option key "${o.key}"`);
    if (seenTexts.has(o.text)) throw new Error(`question ${q.id} has duplicate option text "${o.text}"`);
    seenKeys.add(o.key);
    seenTexts.add(o.text);
  }
  const keys = new Set(q.options.map((o) => o.key));
  for (const k of q.correct) {
    if (!keys.has(k)) throw new Error(`question ${q.id} has correct key "${k}" not in options`);
  }
  if (q.multi !== q.correct.length > 1) {
    throw new Error(`question ${q.id} multi=${q.multi} does not match ${q.correct.length} correct key(s)`);
  }
}

export function loadCatalog(raw: { topics: unknown; lessons: unknown; questions: unknown }): Catalog {
  const topics = asArray<Topic>(raw.topics, 'topics');
  const lessons = asArray<Lesson>(raw.lessons, 'lessons');
  const questions = asArray<Question>(raw.questions, 'questions');

  topics.forEach(checkTopicShape);
  lessons.forEach(checkLessonShape);
  questions.forEach(checkQuestionShape);

  assertUnique('lesson', lessons.map((l) => l.id));
  assertUnique('question', questions.map((q) => q.id));
  const topicIds = new Set(topics.map((t) => t.id));
  for (const l of lessons) {
    if (!topicIds.has(l.topicId)) throw new Error(`lesson ${l.id} has unknown topic: ${l.topicId}`);
  }
  for (const q of questions) {
    if (q.topicId !== null && !topicIds.has(q.topicId)) throw new Error(`question ${q.id} has unknown topic: ${q.topicId}`);
  }
  validateTopics(topics, lessons);
  questions.forEach(validateQuestion);

  const sorted = [...topics].sort((a, b) => a.order - b.order);
  const byId = new Map(sorted.map((t) => [t.id, t]));
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

  return {
    topics: sorted,
    lessons: sortedLessons,
    questions,
    lessonsOf: (topicId) => sortedLessons.filter((l) => l.topicId === topicId),
    questionsOf: (topicId) => questions.filter((q) => q.topicId === topicId),
    topic(id) {
      const t = byId.get(id);
      if (!t) throw new Error(`unknown topic: ${id}`);
      return t;
    },
  };
}
