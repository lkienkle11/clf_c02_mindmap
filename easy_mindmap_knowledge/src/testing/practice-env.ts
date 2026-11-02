// Test-only: in-memory services for practice UI tests (jsdom cannot host node:sqlite).
import { AppState } from '@/app/app-state.svelte';
import { buildServices } from '@/app/composition';
import type { Services } from '@/app/composition';
import { loadCatalog } from '@/content/load-catalog';
import type { AttemptQuestionRow, AttemptRow, SqlExecutor } from '@/persistence';
import { makeLesson, makeQuestion, makeRawCatalog } from './fixtures';

const noopExecutor: SqlExecutor = { execute: async () => {}, select: async () => [] };

const opts = (key: string, text: string) => ({ key, text });

/** compute: q1 single, q2 multi (A+B), q3 single; one lesson. */
export function makePracticeRawCatalog() {
  const raw = makeRawCatalog();
  const options = [opts('A', 'Alpha'), opts('B', 'Bravo'), opts('C', 'Charlie'), opts('D', 'Delta')];
  raw.questions = [
    makeQuestion({ id: 'q1', topicId: 'compute', text: 'Pick the first?', options, correct: ['A'], explanation: 'Because alpha.' }),
    makeQuestion({ id: 'q2', topicId: 'compute', text: 'Choose TWO letters.', options, correct: ['A', 'B'], multi: true }),
    makeQuestion({ id: 'q3', topicId: 'compute', text: 'Pick the third?', options, correct: ['C'] }),
  ];
  raw.lessons = [makeLesson({ id: 'compute-ec2', title: { en: 'EC2 basics', vi: 'EC2' }, body: { en: 'About **servers**. [link](https://example.com)', vi: 'vi' } })];
  return raw;
}

export interface PracticeEnvOptions {
  now?: () => number;
  inProgress?: { attempt: AttemptRow; questions: AttemptQuestionRow[] } | null;
  failSaveAnswer?: boolean;
}

export async function makePracticeEnv(o: PracticeEnvOptions = {}) {
  const base = buildServices({
    executor: noopExecutor,
    catalog: loadCatalog(makePracticeRawCatalog()),
    now: o.now ?? (() => 1_000_000),
    newId: (() => { let n = 0; return () => `att-${++n}`; })(),
  });
  const store = new Map<string, string>();
  const discarded: string[] = [];
  const markReadCalls: string[] = [];
  const saved: { position: number; selected: string[] }[] = [];
  const state = { inProgress: o.inProgress ?? null, failSaveAnswer: o.failSaveAnswer ?? false };
  const services: Services = {
    ...base,
    repos: {
      ...base.repos,
      settings: { get: async (k) => store.get(k) ?? null, set: async (k, v) => { store.set(k, v); } },
      lessonProgress: { ...base.repos.lessonProgress, markRead: async (id) => { markReadCalls.push(id); }, readIds: async () => new Set() },
      questionStats: { ...base.repos.questionStats, listAll: async () => [] },
      attempts: {
        ...base.repos.attempts,
        listSubmitted: async () => [],
        findInProgress: async () => state.inProgress,
        discard: async (id) => { discarded.push(id); state.inProgress = null; },
        saveAnswer: async (_id, position, selected) => {
          if (state.failSaveAnswer) throw new Error('disk full');
          saved.push({ position, selected });
        },
      },
    },
  };
  const appState = new AppState(services);
  await appState.refresh();
  return { services, appState, store, discarded, markReadCalls, saved, state };
}
