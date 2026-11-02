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
import { LeitnerScheduler, rebuildStatsFor } from '@/features/review';
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
  /**
   * Re-derives question_stats for these questions from history. Injected so practice can trigger it
   * without importing the review feature (review depends on practice, never the other way round).
   */
  rebuildStats(questionIds: string[]): Promise<void>;
  now(): number;
  newId(): string;
}

/** Pure wiring shared by the real app and the tests. */
export function buildServices(parts: {
  executor: SqlExecutor;
  catalog: Catalog;
  now?: () => number;
  newId?: () => string;
  /** Test override; defaults to rebuildStatsFor over this executor and catalog. */
  rebuildStats?: (questionIds: string[]) => Promise<void>;
}): Services {
  const { executor, catalog } = parts;
  const scheduler = new LeitnerScheduler();
  const questionTopics = new Map(catalog.questions.map((q) => [q.id, q.topicId]));
  const rebuildDeps: RebuildDeps = { executor, scheduler, topicOf: (id) => questionTopics.get(id) ?? null };
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
    rebuildDeps,
    rebuildStats: parts.rebuildStats ?? ((ids) => rebuildStatsFor(rebuildDeps, ids)),
    now: parts.now ?? (() => Date.now()),
    newId: parts.newId ?? (() => crypto.randomUUID()),
  };
}

export async function createServices(): Promise<Services> {
  return buildServices({ executor: await createTauriExecutor(), catalog: loadBundledCatalog() });
}
