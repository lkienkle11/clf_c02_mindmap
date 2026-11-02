import { describe, expect, it } from 'vitest';
import { loadBundledCatalog } from './bundled';
import { isAllowedExternalUrl } from '@/features/lesson/ui/external-url';
import type { Lesson } from './types';

// Checks on the real content/ folder (Task 18 onward). Topics listed here have authored content.
const AUTHORED_TOPICS = ['cloud-concepts', 'global-infrastructure'];
const FORBIDDEN_OPTION = /all of the above|none of the above|both [A-F] and [A-F]/i;
const LINK = /\]\((\S+?)\)/g;

const catalog = loadBundledCatalog();
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
const words = (s: string) => s.split(/\s+/).filter((w) => /\w/.test(w)).length;
const links = (s: string) => [...s.matchAll(LINK)].map((m) => m[1]);

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

  it('has unique lesson and question ids', () => {
    const lessonIds = catalog.lessons.map((l) => l.id);
    expect(new Set(lessonIds).size).toBe(lessonIds.length);
    const qIds = catalog.questions.map((q) => q.id);
    expect(new Set(qIds).size).toBe(qIds.length);
  });

  describe.each(AUTHORED_TOPICS)('topic %s lessons', (topicId) => {
    const lessons = catalog.lessonsOf(topicId);
    const required = lessons.filter((l) => l.required);
    const optional = lessons.filter((l) => !l.required);

    it('has 4-5 lessons, at least 3 required and exactly 1 optional with a videoQuery', () => {
      expect(lessons.length).toBeGreaterThanOrEqual(4);
      expect(lessons.length).toBeLessThanOrEqual(5);
      expect(required.length).toBeGreaterThanOrEqual(3);
      expect(optional).toHaveLength(1);
      expect(optional[0].videoQuery?.trim()).toBeTruthy();
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
        for (const url of urls) expect(isAllowedExternalUrl(url), url).toBe(true);
      }
      const n = words(l.body.en);
      expect(n).toBeGreaterThanOrEqual(200);
      expect(n).toBeLessThanOrEqual(550);
    });
  });

  describe.each(AUTHORED_TOPICS)('topic %s authored questions', (topicId) => {
    const authored = catalog.questionsOf(topicId).filter((q) => q.source === 'authored');

    it('has 8-10 authored questions with ids auth-<topic>-NN and at least 2 multi-answer', () => {
      expect(authored.length).toBeGreaterThanOrEqual(8);
      expect(authored.length).toBeLessThanOrEqual(10);
      for (const q of authored) expect(q.id).toMatch(new RegExp(`^auth-${topicId}-\\d{2}$`));
      expect(authored.filter((q) => q.multi).length).toBeGreaterThanOrEqual(2);
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
      }
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
