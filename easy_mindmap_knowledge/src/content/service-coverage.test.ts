import { describe, expect, it } from 'vitest';
import serviceCoverage from '../../content/review/service-coverage.json';
import { loadBundledCatalog } from './bundled';
import { findMissingServices, normalizeForMatch, type ServiceEntry } from '../../scripts/content/coverage';

// Service-coverage guard: every service listed in content/review/service-coverage.json with
// "active": true must be named in an EN lesson of its topic (by name or any alias). Entries stay
// inactive until their topic's content batch lands, so the suite stays green until then.
const catalog = loadBundledCatalog();
const topicIds = new Set(catalog.topics.map((t) => t.id));
const services: ServiceEntry[] = serviceCoverage.services;
const bodiesByTopic: Record<string, string[]> = Object.fromEntries(
  catalog.topics.map((t) => [t.id, catalog.lessonsOf(t.id).map((l) => l.body.en)]),
);

const uncovered = (list: ServiceEntry[], bodies: Record<string, string[]>) =>
  findMissingServices(list, bodies).map((s) => `${s.topicId}: ${s.name}`);

describe('service-coverage.json shape', () => {
  it('every entry has a name, string aliases, a real topicId and a boolean active flag', () => {
    for (const s of services) {
      expect(s.name.trim(), s.name).not.toBe('');
      expect(Array.isArray(s.aliases), s.name).toBe(true);
      for (const a of s.aliases) expect(a.trim(), `${s.name} alias`).not.toBe('');
      expect(topicIds.has(s.topicId), `${s.name} topicId ${s.topicId}`).toBe(true);
      expect(typeof s.active, `${s.name} active`).toBe('boolean');
    }
  });

  it('has no duplicate service names (case and hyphen/space insensitive)', () => {
    const names = services.map((s) => normalizeForMatch(s.name));
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('service coverage (real lessons)', () => {
  it('every active service is named in an EN lesson of its topic', () => {
    expect(uncovered(services, bodiesByTopic)).toEqual([]);
  });
});

describe('service coverage guard (fixture)', () => {
  const fixtureServices: ServiceEntry[] = [
    { name: 'AWS Transit Gateway', aliases: ['AWS Transit Gateways'], topicId: 'networking', active: true },
    { name: 'Snowmobile', aliases: [], topicId: 'storage', active: true },
    { name: 'AWS Client VPN', aliases: [], topicId: 'networking', active: false },
  ];
  const fixtureBodies = {
    networking: ['Use the AWS Transit Gateway to join VPCs.'],
    storage: ['Snowball Edge moves data offline.'],
  };

  it('reports an active service that no lesson of its topic names', () => {
    expect(uncovered(fixtureServices, fixtureBodies)).toEqual(['storage: Snowmobile']);
  });

  it('the guard assertion fails when a listed service is missing from the lessons', () => {
    expect(() => expect(uncovered(fixtureServices, fixtureBodies)).toEqual([])).toThrow();
  });

  it('a match by alias or by name passes, and inactive entries are skipped', () => {
    expect(uncovered(fixtureServices, { ...fixtureBodies, storage: ['A Snowmobile is a truck.'] })).toEqual([]);
    expect(uncovered([fixtureServices[0]], { networking: ['AWS Transit Gateways are regional.'] })).toEqual([]);
    expect(uncovered([fixtureServices[2]], { networking: [] })).toEqual([]);
  });
});
