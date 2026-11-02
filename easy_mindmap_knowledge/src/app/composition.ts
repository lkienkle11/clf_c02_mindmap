// The ONLY place where concrete implementations are chosen.
import { loadBundledCatalog } from '@/content/bundled';
import type { Catalog } from '@/content/types';
import {
  createAttemptsRepo,
  createLessonProgressRepo,
  createQuestionStatsRepo,
  createSettingsRepo,
  createTauriExecutor,
} from '@/persistence';
import type {
  AttemptsRepo,
  LessonProgressRepo,
  QuestionStatsRepo,
  SettingsRepo,
  SqlExecutor,
} from '@/persistence';
import { LeitnerScheduler } from '@/features/review';
import type { RebuildDeps, ReviewScheduler } from '@/features/review';

export interface Services {
  catalog: Catalog;
  executor: SqlExecutor;
  scheduler: ReviewScheduler;
  repos: {
    lessonProgress: LessonProgressRepo;
    attempts: AttemptsRepo;
    questionStats: QuestionStatsRepo;
    settings: SettingsRepo;
  };
  rebuildDeps: RebuildDeps;
  now(): number;
  newId(): string;
}

/** Pure wiring shared by the real app and the tests. */
export function buildServices(parts: {
  executor: SqlExecutor;
  catalog: Catalog;
  now?: () => number;
  newId?: () => string;
}): Services {
  const { executor, catalog } = parts;
  const scheduler = new LeitnerScheduler();
  const questionTopics = new Map(catalog.questions.map((q) => [q.id, q.topicId]));
  return {
    catalog,
    executor,
    scheduler,
    repos: {
      lessonProgress: createLessonProgressRepo(executor),
      attempts: createAttemptsRepo(executor),
      questionStats: createQuestionStatsRepo(executor),
      settings: createSettingsRepo(executor),
    },
    rebuildDeps: { executor, scheduler, topicOf: (id) => questionTopics.get(id) ?? null },
    now: parts.now ?? (() => Date.now()),
    newId: parts.newId ?? (() => crypto.randomUUID()),
  };
}

export async function createServices(): Promise<Services> {
  return buildServices({ executor: await createTauriExecutor(), catalog: loadBundledCatalog() });
}
