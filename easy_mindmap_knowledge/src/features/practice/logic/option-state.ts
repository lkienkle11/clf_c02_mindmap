/** How one option is marked on the result screen. 'none' is a plain, unmarked option. */
export type OptionState = 'right' | 'wrong' | 'missed' | 'none';

/** A picked option is right or wrong; an unpicked correct option is missed; anything else is none. */
export function optionState(correct: readonly string[], selected: readonly string[], key: string): OptionState {
  const picked = selected.includes(key);
  const isCorrect = correct.includes(key);
  if (picked) return isCorrect ? 'right' : 'wrong';
  return isCorrect ? 'missed' : 'none';
}

/** i18n keys of a marked option's badge, joined with ' · ' by the caller. */
export function badgeKey(state: Exclude<OptionState, 'none'>): string[] {
  if (state === 'right') return ['practice.result.badge.picked', 'practice.result.badge.correct'];
  if (state === 'wrong') return ['practice.result.badge.picked', 'practice.result.badge.wrong'];
  return ['practice.result.badge.missed'];
}
