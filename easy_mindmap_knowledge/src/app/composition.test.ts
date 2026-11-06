// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@/content/load-catalog';
import { makeRawCatalog } from '@/testing/fixtures';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import { buildServices } from './composition';

async function seedSubmitted(services: ReturnType<typeof buildServices>) {
  const a = services.repos.attempts;
  await a.create(
    {
      id: 'a1', kind: 'practice', topicId: 'compute', status: 'in_progress', startedAt: 1, submittedAt: null,
      submitReason: null, reviewAllowed: false, clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null, onHidden: 'freeze' },
      heartbeatAt: null, scorePct: null, passed: null, groupIndex: null, plannedCount: null,
    },
    [{ attemptId: 'a1', position: 0, questionId: 'q1', optionOrder: ['A', 'B'], selected: ['A'], isCorrect: null }],
  );
  await a.markSubmitted('a1', { scorePct: 100, passed: true, reason: 'manual', at: 1000, grades: [{ position: 0, isCorrect: true, selected: ['A'] }] });
}

describe('buildServices.rebuildStats', () => {
  it('is wired to rebuildStatsFor with the catalog topics by default', async () => {
    const services = buildServices({ executor: await createNodeSqliteExecutor(), catalog: loadCatalog(makeRawCatalog()) });
    await seedSubmitted(services);
    await services.rebuildStats(['q1']);
    expect(await services.repos.questionStats.get('q1')).toMatchObject({ topicId: 'compute', timesSeen: 1, box: 1 });
  });

  it('accepts an override for tests', async () => {
    const seen: string[][] = [];
    const services = buildServices({
      executor: await createNodeSqliteExecutor(),
      catalog: loadCatalog(makeRawCatalog()),
      rebuildStats: async (ids) => { seen.push(ids); },
    });
    await services.rebuildStats(['q1', 'q2']);
    expect(seen).toEqual([['q1', 'q2']]);
  });
});
