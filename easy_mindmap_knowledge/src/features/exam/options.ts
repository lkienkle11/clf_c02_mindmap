import type { SettingsRepo } from '@/persistence';

export interface ExamOptions {
  /** 120 minutes instead of 90 for a full-size exam. */
  extraTime: boolean;
}

export const DEFAULT_EXAM_OPTIONS: ExamOptions = { extraTime: false };

const KEY = 'exam_last_options';

function parse(raw: string | null): ExamOptions {
  if (raw === null) return { ...DEFAULT_EXAM_OPTIONS };
  try {
    const v: unknown = JSON.parse(raw);
    if (typeof v !== 'object' || v === null) return { ...DEFAULT_EXAM_OPTIONS };
    const { extraTime } = v as Record<string, unknown>;
    return typeof extraTime === 'boolean' ? { extraTime } : { ...DEFAULT_EXAM_OPTIONS };
  } catch {
    return { ...DEFAULT_EXAM_OPTIONS };
  }
}

/** Never throws on bad stored data; storage read errors still reject. */
export async function loadExamOptions(settings: SettingsRepo): Promise<ExamOptions> {
  return parse(await settings.get(KEY));
}

export async function saveExamOptions(settings: SettingsRepo, options: ExamOptions): Promise<void> {
  await settings.set(KEY, JSON.stringify({ extraTime: options.extraTime }));
}
