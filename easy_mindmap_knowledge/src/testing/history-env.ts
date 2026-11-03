// Test-only: in-memory services for history UI tests (jsdom cannot host node:sqlite).
import type { AttemptQuestionRow, AttemptRow } from '@/persistence';
import { makePracticeEnv } from './practice-env';

export const makeAttempt = (id: string, over: Partial<AttemptRow> = {}): AttemptRow => ({
  id, kind: 'practice', topicId: 'compute', status: 'submitted', startedAt: 0, submittedAt: 1,
  submitReason: 'manual', reviewAllowed: false,
  clock: { mode: 'freeze', limitMs: null, remainingMs: null, deadlineAt: null, onHidden: 'freeze' },
  heartbeatAt: null, scorePct: 50, passed: false, ...over,
});

export const makeRow = (attemptId: string, position: number, over: Partial<AttemptQuestionRow> = {}): AttemptQuestionRow => ({
  attemptId, position, questionId: 'q1', optionOrder: ['A', 'B', 'C', 'D'], selected: ['A'], isCorrect: true, ...over,
});

export interface HistoryEnvOptions {
  attempts?: AttemptRow[];
  rows?: Record<string, AttemptQuestionRow[]>;
  /** questionsOfMany rejects this many times before working. */
  failRowsTimes?: number;
  /** questionsOfMany waits for this promise (a slow load). */
  gate?: Promise<void>;
  failSettingKey?: string;
}

export async function makeHistoryEnv(o: HistoryEnvOptions = {}) {
  const env = await makePracticeEnv({ submitted: o.attempts ?? [], failSettingKey: o.failSettingKey });
  const state = { fails: o.failRowsTimes ?? 0, calls: 0, perAttemptCalls: 0, requested: [] as string[][] };
  env.services.repos.attempts = {
    ...env.services.repos.attempts,
    questionsOf: async (id: string) => {
      state.perAttemptCalls += 1;
      return o.rows?.[id] ?? [];
    },
    questionsOfMany: async (ids: string[]) => {
      state.calls += 1;
      state.requested.push([...ids]);
      if (o.gate) await o.gate;
      if (state.fails > 0) {
        state.fails -= 1;
        throw new Error('read failed');
      }
      return new Map(ids.map((id) => [id, o.rows?.[id] ?? []]));
    },
  };
  return { ...env, rowsState: state };
}
