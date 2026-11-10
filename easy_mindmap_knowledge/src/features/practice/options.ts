import type { SettingsRepo } from '@/persistence';
import type { HiddenPolicy } from '@/persistence/records';
import { DEFAULT_QUESTION_COUNT, validateQuestionCount } from './logic/question-count';

export interface PracticeOptions {
  allowReview: boolean;
  limitMs: number | null;
  clockMode: 'freeze' | 'run';
  onHidden: HiddenPolicy;
  /** What the clock does while the report dialog is open during the attempt. */
  onReport: HiddenPolicy;
  /** Requested question count. The attempt draws at most the pool size, so a larger value is allowed here. */
  questionCount: number;
}

export const DEFAULT_PRACTICE_OPTIONS: PracticeOptions = {
  allowReview: false, limitMs: null, clockMode: 'freeze', onHidden: 'freeze', onReport: 'freeze', questionCount: DEFAULT_QUESTION_COUNT,
};

const KEY = 'practice_last_options';

function parse(raw: string | null): PracticeOptions {
  if (raw === null) return { ...DEFAULT_PRACTICE_OPTIONS };
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== 'object' || v === null) return { ...DEFAULT_PRACTICE_OPTIONS };
    const o = v as Record<string, unknown>;
    const limitOk = o.limitMs === null || (typeof o.limitMs === 'number' && Number.isFinite(o.limitMs) && o.limitMs > 0);
    const modeOk = o.clockMode === 'freeze' || o.clockMode === 'run';
    const hiddenOk = o.onHidden === undefined || o.onHidden === 'freeze' || o.onHidden === 'run';
    const reportOk = o.onReport === undefined || o.onReport === 'freeze' || o.onReport === 'run';
    // Options saved before the count existed have no questionCount and load as the default. The pool is unknown
    // here, so only the integer and minimum rules apply; start() clamps the count to the pool.
    const count = o.questionCount === undefined
      ? { ok: true as const, count: DEFAULT_QUESTION_COUNT }
      : validateQuestionCount(o.questionCount, Number.POSITIVE_INFINITY);
    if (typeof o.allowReview !== 'boolean' || !limitOk || !modeOk || !hiddenOk || !reportOk || !count.ok) return { ...DEFAULT_PRACTICE_OPTIONS };
    return {
      allowReview: o.allowReview, limitMs: o.limitMs as number | null, clockMode: o.clockMode as 'freeze' | 'run',
      onHidden: (o.onHidden ?? 'freeze') as HiddenPolicy, onReport: (o.onReport ?? 'freeze') as HiddenPolicy,
      questionCount: count.count,
    };
  } catch {
    return { ...DEFAULT_PRACTICE_OPTIONS };
  }
}

/** Never throws on bad stored data; storage read errors still reject. */
export async function loadLastOptions(settings: SettingsRepo): Promise<PracticeOptions> {
  return parse(await settings.get(KEY));
}

export async function saveLastOptions(settings: SettingsRepo, options: PracticeOptions): Promise<void> {
  await settings.set(KEY, JSON.stringify(options));
}
