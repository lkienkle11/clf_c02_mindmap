import { describe, expect, it } from 'vitest';
import { loadBundledCatalog } from '@/content/bundled';
import { DOMAIN_OF_TOPIC, DOMAIN_WEIGHTS } from './domains';

describe('exam domains', () => {
  it('maps every non-capstone topic of the real catalog to a domain', () => {
    const topics = loadBundledCatalog().topics.filter((t) => t.tier !== 'capstone');
    expect(topics.length).toBe(12);
    for (const topic of topics) {
      expect(DOMAIN_OF_TOPIC[topic.id], topic.id).toBeDefined();
    }
  });

  it('has domain weights that sum to 100', () => {
    const sum = Object.values(DOMAIN_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it('uses the spec weights 24/30/34/12', () => {
    expect(DOMAIN_WEIGHTS).toEqual({ concepts: 24, security: 30, technology: 34, billing: 12 });
  });
});
