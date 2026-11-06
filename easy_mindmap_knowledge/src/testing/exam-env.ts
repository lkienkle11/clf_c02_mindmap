// Test-only: in-memory env whose catalog is big enough to draw a checkpoint exam for group 1.
import { makePracticeEnv } from '@/testing/practice-env';
import type { PracticeEnvOptions } from '@/testing/practice-env';
import { makeQuestion, makeRawCatalog } from '@/testing/fixtures';

const GROUP1 = ['cloud-concepts', 'global-infrastructure', 'compute'] as const;

export function makeExamRawCatalog() {
  const raw = makeRawCatalog();
  raw.questions = Array.from({ length: 15 }, (_, i) => makeQuestion({ id: `e${i}`, topicId: GROUP1[i % 3] }));
  return raw;
}

export async function makeExamEnv(completed: string[], o: PracticeEnvOptions = {}) {
  const env = await makePracticeEnv({ rawCatalog: makeExamRawCatalog(), ...o });
  env.appState.completed = new Set(completed);
  return env;
}
