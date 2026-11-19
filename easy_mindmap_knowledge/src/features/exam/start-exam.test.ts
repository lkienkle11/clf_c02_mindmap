// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { buildServices } from '@/app/composition';
import type { Services } from '@/app/composition';
import { loadBundledCatalog } from '@/content/bundled';
import { loadCatalog } from '@/content/load-catalog';
import type { Catalog } from '@/content/types';
import { makeQuestion, makeRawCatalog } from '@/testing/fixtures';
import { createNodeSqliteExecutor } from '@/testing/node-sqlite-executor';
import { CAPSTONE_QUESTION_DOMAIN, DOMAIN_OF_TOPIC } from './logic/domains';
import { examLimitMs, ExamNotAvailableError, loadExamOptions, startCapstoneExam, startCheckpoint } from './index';

let n = 0;
async function env(catalog: Catalog): Promise<Services> {
  n = 0;
  return buildServices({ executor: await createNodeSqliteExecutor(), catalog, now: () => 1_700_000_000_000 + n, newId: () => `id-${++n}` });
}
const noop = async () => {};

function smallCatalog(count: number): Catalog {
  const raw = makeRawCatalog();
  raw.questions = Array.from({ length: count }, (_, i) => makeQuestion({ id: `s${i}`, topicId: 'cloud-concepts' }));
  return loadCatalog(raw);
}

describe('startCheckpoint', () => {
  it('starts a 65-question checkpoint on the bundled catalog', async () => {
    const services = await env(loadBundledCatalog());
    const s = await startCheckpoint(services, 1, { extraTime: false }, noop);
    expect(s.kind).toBe('checkpoint');
    const found = (await services.repos.attempts.findInProgress())!;
    expect(found.questions).toHaveLength(65);
    expect(found.attempt.clock.limitMs).toBe(5_400_000);
    expect(found.attempt.clock.onReport).toBe('run');
    expect(found.attempt.kind).toBe('checkpoint');
    expect(found.attempt.groupIndex).toBe(1);
    expect(found.attempt.topicId).toBeNull();
    expect((await loadExamOptions(services.repos.settings))).toEqual({ extraTime: false });
  });

  it('gives 120 minutes with extra time and saves the option', async () => {
    const services = await env(loadBundledCatalog());
    await startCheckpoint(services, 1, { extraTime: true }, noop);
    expect((await services.repos.attempts.findInProgress())!.attempt.clock.limitMs).toBe(7_200_000);
    expect(await loadExamOptions(services.repos.settings)).toEqual({ extraTime: true });
  });

  it('draws unseen questions on a second start', async () => {
    const services = await env(loadBundledCatalog());
    const first = await startCheckpoint(services, 1, { extraTime: false }, noop);
    const firstIds = (await services.repos.attempts.findInProgress())!.questions.map((q) => q.questionId);
    for (let i = 0; i < firstIds.length; i++) await first.select(i, ['A']);
    await first.submit('manual');
    const second = await startCheckpoint(services, 1, { extraTime: false }, noop);
    expect(second.kind).toBe('checkpoint');
    const secondIds = (await services.repos.attempts.findInProgress())!.questions.map((q) => q.questionId);
    expect(secondIds).toHaveLength(65);
    expect(secondIds.filter((id) => firstIds.includes(id))).toEqual([]);
  });

  it('throws ExamNotAvailableError for too few questions and writes nothing', async () => {
    const services = await env(smallCatalog(7));
    await expect(startCheckpoint(services, 1, { extraTime: false }, noop)).rejects.toBeInstanceOf(ExamNotAvailableError);
    expect(await services.repos.attempts.findInProgress()).toBeNull();
  });

  it('throws ExamNotAvailableError for an unknown group', async () => {
    const services = await env(loadBundledCatalog());
    await expect(startCheckpoint(services, 99, { extraTime: false }, noop)).rejects.toBeInstanceOf(ExamNotAvailableError);
  });

  it('scales the limit for a smaller pool', async () => {
    const services = await env(smallCatalog(40));
    await startCheckpoint(services, 1, { extraTime: false }, noop);
    const found = (await services.repos.attempts.findInProgress())!;
    expect(found.questions).toHaveLength(40);
    expect(found.attempt.clock.limitMs).toBe(examLimitMs(40, false));
  });
});

describe('startCapstoneExam', () => {
  it('starts a 65-question Capstone exam', async () => {
    const catalog = loadBundledCatalog();
    const services = await env(catalog);
    await startCapstoneExam(services, 'capstone-exam-1', { extraTime: false }, noop);
    const found = (await services.repos.attempts.findInProgress())!;
    expect(found.attempt.kind).toBe('practice');
    expect(found.attempt.topicId).toBe('capstone-exam-1');
    expect(found.attempt.plannedCount).toBe(65);
    expect(found.attempt.groupIndex).toBeNull();
    expect(found.attempt.clock.limitMs).toBe(5_400_000);
    expect(found.attempt.clock.onReport).toBe('run');
    expect(found.questions).toHaveLength(65);
    const scored = found.questions.filter((q) => !q.unscored);
    const unscored = found.questions.filter((q) => q.unscored);
    expect(scored).toHaveLength(50);
    expect(unscored).toHaveLength(15);
    expect(unscored.map((q) => q.position)).not.toEqual(Array.from({ length: 15 }, (_, i) => 50 + i));
    const counts = { concepts: 0, security: 0, technology: 0, billing: 0 };
    for (const row of scored) {
      const q = catalog.questions.find((q) => q.id === row.questionId)!;
      const domain = DOMAIN_OF_TOPIC[q.topicId!] ?? CAPSTONE_QUESTION_DOMAIN[q.id];
      counts[domain]++;
    }
    expect(counts).toEqual({ concepts: 12, security: 15, technology: 17, billing: 6 });
  });

  it('gives the second Capstone exam 120 minutes with extra time', async () => {
    const services = await env(loadBundledCatalog());
    await startCapstoneExam(services, 'capstone-exam-2', { extraTime: true }, noop);
    const found = (await services.repos.attempts.findInProgress())!;
    expect(found.attempt.clock.limitMs).toBe(7_200_000);
    expect(found.attempt.topicId).toBe('capstone-exam-2');
    expect(await loadExamOptions(services.repos.settings)).toEqual({ extraTime: true });
  });

  it('throws ExamNotAvailableError for too few questions', async () => {
    const services = await env(smallCatalog(7));
    await expect(startCapstoneExam(services, 'capstone-exam-1', { extraTime: false }, noop)).rejects.toBeInstanceOf(ExamNotAvailableError);
  });
});
