import type { SettingsRepo } from '@/persistence';
import type { HiddenPolicy } from '@/persistence/records';

export interface PracticeOptions {
  allowReview: boolean;
  limitMs: number | null;
  clockMode: 'freeze' | 'run';
  onHidden: HiddenPolicy;
}

export const DEFAULT_PRACTICE_OPTIONS: PracticeOptions = { allowReview: false, limitMs: null, clockMode: 'freeze', onHidden: 'freeze' };

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
    if (typeof o.allowReview !== 'boolean' || !limitOk || !modeOk || !hiddenOk) return { ...DEFAULT_PRACTICE_OPTIONS };
    return {
      allowReview: o.allowReview, limitMs: o.limitMs as number | null, clockMode: o.clockMode as 'freeze' | 'run',
      onHidden: (o.onHidden ?? 'freeze') as HiddenPolicy,
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
