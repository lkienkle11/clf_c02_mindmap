import { describe, expect, it } from 'vitest';
import { loadBundledCatalog } from '@/content/bundled';
import { CAPSTONE_QUESTION_DOMAIN, DOMAIN_OF_TOPIC, DOMAIN_WEIGHTS } from './domains';

describe('exam domains', () => {
  it('maps every non-capstone topic of the real catalog to a domain', () => {
    const topics = loadBundledCatalog().topics.filter((t) => t.tier !== 'capstone');
    expect(topics.length).toBe(12);
    for (const topic of topics) {
      expect(DOMAIN_OF_TOPIC[topic.id], topic.id).toBeDefined();
    }
  });

  it('assigns every authored Capstone question a domain, and only those', () => {
    const authored = loadBundledCatalog()
      .questions.filter((q) => q.topicId === 'capstone')
      .map((q) => q.id)
      .sort();
    expect(authored).toHaveLength(10);
    expect(Object.keys(CAPSTONE_QUESTION_DOMAIN).sort()).toEqual(authored);
    for (const id of authored) expect(Object.keys(DOMAIN_WEIGHTS), id).toContain(CAPSTONE_QUESTION_DOMAIN[id]);
  });

  it('has domain weights that sum to 100', () => {
    const sum = Object.values(DOMAIN_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it('uses the spec weights 24/30/34/12', () => {
    expect(DOMAIN_WEIGHTS).toEqual({ concepts: 24, security: 30, technology: 34, billing: 12 });
  });
});
