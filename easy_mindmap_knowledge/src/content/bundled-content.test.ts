import { describe, expect, it } from 'vitest';
import { loadBundledCatalog } from './bundled';
import { findGaps } from './explanation-gaps';
import { isAllowedExternalUrl } from '@/features/lesson/ui/external-url';
import type { Lesson, Topic } from './types';

// Checks on the real content/ folder. Every topic listed here has lessons and authored questions,
// and the same content contract applies to all of them. Add a topic here when its content lands.
const CONTENT_TOPICS = ['cloud-concepts', 'global-infrastructure', 'compute', 'storage', 'networking', 'databases', 'deploy-operate', 'shared-responsibility', 'iam-security', 'pricing-billing', 'migration-caf', 'support-ai-other', 'capstone'];
// Topics whose lessons were expanded: 8-14 lessons, at least 1 optional, and every optional lesson has a videoQuery.
// A content task adds its topic id here when that topic's lessons land. Empty until then, so every
// topic keeps the legacy rule (4-5 lessons, exactly 1 optional with a videoQuery).
const EXPANDED_TOPICS: string[] = ['cloud-concepts', 'global-infrastructure', 'compute', 'storage', 'networking', 'databases', 'deploy-operate'];
const CAPSTONE_TOPIC = 'capstone';
const AUTHORED_PER_TOPIC = 10;
const CHOOSE_TWO_PER_TOPIC = 3;
/** Largest share of the single-answer questions of one topic that may use the same correct key. */
const MAX_KEY_SHARE = 0.35;
const FORBIDDEN_OPTION = /all of the above|none of the above|both [A-F] and [A-F]/i;
const LINK = /\]\((\S+?)\)/g;

const catalog = loadBundledCatalog();
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
const links = (s: string) => [...s.matchAll(LINK)].map((m) => m[1]);
const SOURCE_HOSTS = ['docs.aws.amazon.com', 'aws.amazon.com'];
const KEY_POINTS = { en: /^## Key points\s*$/m, vi: /^## Ý chính\s*$/m };

/** Ids of the topics that declare lessons, in topic order. */
const topicsWithLessons = (topics: Topic[]) => topics.filter((t) => t.lessonIds.length > 0).map((t) => t.id);

/**
 * Prose words of a lesson body, counted the same way for every lesson: the Sources section is
 * dropped, link targets are dropped (link text kept), table rule lines are dropped, and only
 * tokens with a letter or digit count (so pipes, `-` bullets and `##` do not).
 */
function proseWords(body: string): number {
  const withoutSources = body.replace(/^## (Sources|Nguồn)\s*$[\s\S]*$/m, '');
  return withoutSources
    .replace(/\]\([^)]*\)/g, ']')
    .split('\n')
    .filter((line) => !/^\s*\|?[\s|:-]+\|?\s*$/.test(line))
    .join('\n')
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** The text after the last `## ` heading, if that heading is a Sources heading. */
function sourcesSection(body: string): string | null {
  const parts = body.split(/^## /m);
  const last = parts[parts.length - 1];
  return /^(Sources|Nguồn)\s*$/m.test(last.split('\n')[0]) ? last : null;
}

describe('loadBundledCatalog (real content folder)', () => {
  it('loads 13 topics without throwing', () => {
    expect(catalog.topics).toHaveLength(13);
  });

  it('runs the content contract on every topic that has lessons (CONTENT_TOPICS has not drifted)', () => {
    expect(topicsWithLessons(catalog.topics)).toEqual(CONTENT_TOPICS);
  });

  it('the drift guard catches a topic with lessons that is missing from CONTENT_TOPICS', () => {
    const extra = { ...catalog.topics[catalog.topics.length - 1], id: 'not-listed', lessonIds: ['x'] };
    expect(topicsWithLessons([...catalog.topics, extra])).not.toEqual(CONTENT_TOPICS);
  });

  it('has unique lesson and question ids', () => {
    const lessonIds = catalog.lessons.map((l) => l.id);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
    const qIds = catalog.questions.map((q) => q.id);
    expect(new Set(qIds).size).toBe(qIds.length);
  });

  describe.each(CONTENT_TOPICS)('topic %s lessons', (topicId) => {
    const lessons = catalog.lessonsOf(topicId);
    const required = lessons.filter((l) => l.required);
    const optional = lessons.filter((l) => !l.required);
    const expanded = EXPANDED_TOPICS.includes(topicId);
    const isCapstone = topicId === CAPSTONE_TOPIC;
    const [min, max] = isCapstone ? [5, 8] : expanded ? [8, 14] : [4, 5];
    const optionalRule = expanded
      ? 'at least 1 optional, every optional with a videoQuery'
      : isCapstone
        ? 'at least 1 optional with a videoQuery'
        : 'exactly 1 optional with a videoQuery';

    it(`has ${min}-${max} lessons, at least 3 required and ${optionalRule}`, () => {
      expect(lessons.length).toBeGreaterThanOrEqual(min);
      expect(lessons.length).toBeLessThanOrEqual(max);
      expect(required.length).toBeGreaterThanOrEqual(3);
      if (expanded) {
        expect(optional.length).toBeGreaterThanOrEqual(1);
        for (const l of optional) expect(l.videoQuery?.trim(), l.id).toBeTruthy();
      } else if (isCapstone) {
        expect(optional.some((l) => l.videoQuery?.trim())).toBe(true);
      } else {
        expect(optional).toHaveLength(1);
        expect(optional[0].videoQuery?.trim()).toBeTruthy();
      }
    });

    it('lists lessonIds in lesson file order', () => {
      expect(catalog.topic(topicId).lessonIds).toEqual(lessons.map((l) => l.id));
      expect(lessons.map((l) => l.order)).toEqual(lessons.map((_, i) => i + 1));
    });

    it.each(lessons.map((l) => [l.id, l] as [string, Lesson]))('%s has bilingual text with no h1', (_id, l) => {
      for (const lang of ['en', 'vi'] as const) {
        expect(l.title[lang].trim()).not.toBe('');
        expect(l.body[lang].trim()).not.toBe('');
        expect(l.body[lang]).not.toMatch(/^# /m);
        for (const url of links(l.body[lang])) expect(isAllowedExternalUrl(url), url).toBe(true);
      }
    });

    it.each(required.map((l) => [l.id, l] as [string, Lesson]))('%s ends with an allowed Sources list and has a sane length', (_id, l) => {
      for (const lang of ['en', 'vi'] as const) {
        const src = sourcesSection(l.body[lang]);
        expect(src, `${lang} Sources section`).not.toBeNull();
        const urls = links(src!);
        expect(urls.length).toBeGreaterThanOrEqual(1);
        expect(urls.length).toBeLessThanOrEqual(3);
        for (const url of urls) {
          expect(isAllowedExternalUrl(url), url).toBe(true);
          expect(SOURCE_HOSTS, url).toContain(new URL(url).hostname);
        }
        expect(l.body[lang], `${lang} Key points heading`).toMatch(KEY_POINTS[lang]);
      }
      const n = proseWords(l.body.en);
      expect(n, 'EN prose words').toBeGreaterThanOrEqual(250);
      expect(n, 'EN prose words').toBeLessThanOrEqual(900);
    });
  });

  describe.each(CONTENT_TOPICS)('topic %s authored questions', (topicId) => {
    const authored = catalog.questionsOf(topicId).filter((q) => q.source === 'authored');

    it(`has ${AUTHORED_PER_TOPIC} authored questions with ids auth-<topic>-NN and ${CHOOSE_TWO_PER_TOPIC} choose-two`, () => {
      expect(authored).toHaveLength(AUTHORED_PER_TOPIC);
      expect(authored.map((q) => q.id)).toEqual(
        authored.map((_, i) => `auth-${topicId}-${String(i + 1).padStart(2, '0')}`),
      );
      for (const q of authored) expect(q.topicId, q.id).toBe(topicId);
      expect(authored.filter((q) => q.multi)).toHaveLength(CHOOSE_TWO_PER_TOPIC);
    });

    it('every question is well formed', () => {
      for (const q of authored) {
        expect(q.explanation?.trim(), q.id).toBeTruthy();
        expect(q.orderDependent, q.id).toBe(false);
        const keys = q.options.map((o) => o.key);
        expect(new Set(keys).size, q.id).toBe(keys.length);
        expect(keys.length, q.id).toBe(q.multi ? 5 : 4);
        for (const k of q.correct) expect(keys, q.id).toContain(k);
        expect(q.multi, q.id).toBe(q.correct.length === 2);
        expect(q.correct.length === 1 || q.correct.length === 2, q.id).toBe(true);
        expect(q.text.includes('(Choose two.)'), q.id).toBe(q.multi);
        for (const o of q.options) expect(o.text, q.id).not.toMatch(FORBIDDEN_OPTION);
        const texts = q.options.map((o) => norm(o.text));
        expect(new Set(texts).size, `${q.id} duplicate option text`).toBe(texts.length);
      }
    });

    it('spreads correct answer positions (no answer-position bias)', () => {
      const single = authored.filter((q) => !q.multi);
      const counts = new Map<string, number>();
      for (const q of single) counts.set(q.correct[0], (counts.get(q.correct[0]) ?? 0) + 1);
      for (const [key, n] of counts) expect(n / single.length, `share of key ${key}`).toBeLessThanOrEqual(MAX_KEY_SHARE);
      const multi = authored.filter((q) => q.multi);
      const pairs = new Set(multi.map((q) => [...q.correct].sort().join('+')));
      expect(pairs.size, 'distinct choose-two pairs').toBe(multi.length);
    });
  });

  it('authored questions do not duplicate any other question text', () => {
    const authored = catalog.questions.filter((q) => q.source === 'authored');
    const others = new Map<string, string>();
    for (const q of catalog.questions) {
      if (q.source === 'imported') others.set(norm(q.text), q.id);
    }
    const seen = new Set<string>();
    for (const q of authored) {
      const t = norm(q.text);
      expect(others.get(t), q.id).toBeUndefined();
      expect(seen.has(t), q.id).toBe(false);
      seen.add(t);
    }
  });

  it('authored ids are unique and do not collide with imported ids', () => {
    const imported = new Set(catalog.questions.filter((q) => q.source === 'imported').map((q) => q.id));
    const ids = catalog.questions.filter((q) => q.source === 'authored').map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(imported.has(id)).toBe(false);
  });
});

describe('Capstone lessons match the official exam (real content folder)', () => {
  const lesson = (id: string) => {
    const found = catalog.lessons.find((l) => l.id === id);
    if (!found) throw new Error(`lesson ${id} is missing`);
    return found;
  };
  const capstone = catalog.lessonsOf('capstone');

  it('the exam-format lesson states the 90-minute exam and the ESL accommodation, with no 30-question exam', () => {
    const en = lesson('capstone-exam-format').body.en;
    expect(en).toContain('90 minutes');
    expect(en).toContain('ESL');
    expect(en).not.toContain('30 questions');
  });

  it('the Vietnamese exam-format lesson does not say 30 câu', () => {
    expect(lesson('capstone-exam-format').body.vi).not.toContain('30 câu');
  });

  it('the exam-format lesson does not claim review is impossible during the attempt', () => {
    expect(lesson('capstone-exam-format').body.en.toLowerCase()).not.toContain('cannot review earlier answers');
    expect(lesson('capstone-exam-format').body.vi.toLowerCase()).not.toContain('không thể xem lại câu đã trả lời');
  });

  it('the Vietnamese Capstone lessons use the project term "bài kiểm tra mốc", not "bài thi checkpoint"', () => {
    for (const l of capstone) expect(l.body.vi.toLowerCase(), l.id).not.toContain('bài thi checkpoint');
  });

  it('the Capstone has 6 lessons in topic order and ends with the optional further-learning lesson', () => {
    expect(catalog.topic('capstone').lessonIds).toEqual([
      'capstone-exam-format',
      'capstone-domains',
      'capstone-answering',
      'capstone-final-review',
      'capstone-exam-registration',
      'capstone-further',
    ]);
    expect(capstone).toHaveLength(6);
    const last = capstone[capstone.length - 1];
    expect(last.id).toBe('capstone-further');
    expect(last.required).toBe(false);
  });

  it('the registration lesson is required and covers the ESL +30 MINUTES accommodation', () => {
    const reg = lesson('capstone-exam-registration');
    expect(reg.required).toBe(true);
    expect(reg.body.en).toContain('ESL +30 MINUTES');
    expect(reg.body.vi).toContain('ESL +30 MINUTES');
  });
});

describe('explanations (real content folder)', () => {
  const gaps = findGaps(catalog.questions);

  it('every question has a non-empty explanation', () => {
    expect(gaps.missingExplanation, 'question ids without an explanation').toEqual([]);
  });

  it('every question has a non-empty optionNotes entry for each option and no note for a non-option key', () => {
    expect(
      [...gaps.missingNotes, ...gaps.extraNoteKeys],
      'id:KEY pairs with a missing note or a note for a non-option key',
    ).toEqual([]);
  });

  it('no learner-facing explanation or note uses internal wording (keyed, answer key)', () => {
    expect(gaps.internalWording, 'question ids with internal wording in an explanation or note').toEqual([]);
  });
});
