// Test/preview-only in-memory services. Nothing outside tests and throw-away harnesses may import this module.
import { AppState } from '@/app/app-state.svelte';
import { buildServices } from '@/app/composition';
import type { Services } from '@/app/composition';
import type { Catalog } from '@/content/types';
import type { AttemptRow, SqlExecutor } from '@/persistence';

const unusedExecutor: SqlExecutor = { execute: async () => {}, select: async () => [] };

const passedAttempt = (topicId: string): AttemptRow => ({
  id: `a-${topicId}`, kind: 'practice', topicId, status: 'submitted', startedAt: 0, submittedAt: 1,
  submitReason: 'manual', reviewAllowed: true,
  clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null, onHidden: 'freeze' },
  heartbeatAt: null, scorePct: 90, passed: true, groupIndex: null, plannedCount: null,
});

export interface FakeSetup {
  catalog: Catalog;
  readIds?: string[];
  passedTopicIds?: string[];
  now?: number;
}

/** Services with real wiring but in-memory repos; `markRead` is a spy that also records the id. */
export async function makeFakeServices(setup: FakeSetup): Promise<{
  services: Services;
  appState: AppState;
  markReadCalls: { lessonId: string; at: number }[];
}> {
  const base = buildServices({ executor: unusedExecutor, catalog: setup.catalog, now: () => setup.now ?? 1000 });
  const read = new Set(setup.readIds ?? []);
  const markReadCalls: { lessonId: string; at: number }[] = [];
  const markRead = async (lessonId: string, at: number): Promise<void> => {
    markReadCalls.push({ lessonId, at });
    read.add(lessonId);
  };
  const attempts = (setup.passedTopicIds ?? []).map(passedAttempt);
  const services: Services = {
    ...base,
    repos: {
      ...base.repos,
      lessonProgress: { ...base.repos.lessonProgress, markRead, readIds: async () => new Set(read) },
      attempts: {
        ...base.repos.attempts,
        listSubmitted: async () => attempts,
        findInProgress: async () => null,
      },
      questionStats: { ...base.repos.questionStats, listAll: async () => [] },
      settings: { ...base.repos.settings, get: async () => null },
    },
  };
  const appState = new AppState(services);
  await appState.refresh();
  return { services, appState, markReadCalls };
}
