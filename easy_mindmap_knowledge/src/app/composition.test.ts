// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { loadCatalog } from '@/content/load-catalog';
import { makeRawCatalog } from '@/testing/fixtures';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import { makeFakeUpdater } from '@/testing/fake-updater';
import { buildServices } from './composition';
import { UpdateController } from '@/features/update';

async function seedSubmitted(services: ReturnType<typeof buildServices>) {
  const a = services.repos.attempts;
  await a.create(
    {
      id: 'a1', kind: 'practice', topicId: 'compute', status: 'in_progress', startedAt: 1, submittedAt: null,
      submitReason: null, reviewAllowed: false, clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null, onHidden: 'freeze', onReport: 'freeze' },
      heartbeatAt: null, scorePct: null, passed: null, groupIndex: null, plannedCount: null, unansweredDisplay: 'reveal', helpMode: 'off',
    },
    [{ attemptId: 'a1', position: 0, questionId: 'q1', optionOrder: ['A', 'B'], selected: ['A'], isCorrect: null, unscored: false, revealed: false, eliminated: [] }],
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

describe('buildServices.updates', () => {
  it('loads and persists postponed versions through settings', async () => {
    const executor = await createNodeSqliteExecutor();
    const catalog = loadCatalog(makeRawCatalog());
    const services = buildServices({ executor, catalog, updater: makeFakeUpdater({
      update: { version: '2.0.0', sizeBytes: null, notes: null },
    }) });
    await services.repos.settings.set('update_prompt_postponed_version', '1.2.0');
    await services.updates!.loadPostponed();
    expect(services.updates!.postponedVersion).toBe('1.2.0');
    await services.updates!.checkAtStart();
    expect(services.updates!.promptable).toBe(true);
    await services.updates!.postpone();
    expect(await services.repos.settings.get('update_prompt_postponed_version')).toBe('2.0.0');

    const restarted = buildServices({ executor, catalog, updater: makeFakeUpdater({
      update: { version: '2.0.0', sizeBytes: null, notes: null },
    }) });
    await restarted.updates!.loadPostponed();
    await restarted.updates!.checkAtStart();
    expect(restarted.updates!.promptable).toBe(false);
  });

  it('is null without an updater, as in development and in most tests', async () => {
    const services = buildServices({ executor: await createNodeSqliteExecutor(), catalog: loadCatalog(makeRawCatalog()) });
    expect(services.updates).toBeNull();
  });

  it('is an UpdateController over the given updater', async () => {
    const fake = makeFakeUpdater({ update: { version: '2.0.0', sizeBytes: null, notes: null } });
    const services = buildServices({ executor: await createNodeSqliteExecutor(), catalog: loadCatalog(makeRawCatalog()), updater: fake });
    expect(services.updates).toBeInstanceOf(UpdateController);
    await services.updates?.check();
    expect(services.updates?.info?.version).toBe('2.0.0');
  });
});
