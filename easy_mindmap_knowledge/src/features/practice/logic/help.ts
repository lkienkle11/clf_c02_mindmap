import { shuffle } from '@/random/seeded-random';

export const HELP_USES = 3;
export type HelpMode = 'off' | 'reveal' | 'powers';
export type HelpQuestion = { revealed: boolean; eliminated: readonly string[] };
export type HelpRefusal = 'off' | 'noneLeft' | 'revealed' | 'noWrong' | 'already';

export function usesLeft(questions: readonly HelpQuestion[]): { reveal: number; eliminate: number } {
  return {
    reveal: HELP_USES - questions.filter((question) => question.revealed).length,
    eliminate: HELP_USES - questions.filter((question) => question.eliminated.length > 0).length,
  };
}

export function revealCheck(mode: HelpMode, item: HelpQuestion, all: readonly HelpQuestion[]): null | HelpRefusal {
  if (mode === 'off') return 'off';
  if (item.revealed) return 'already';
  if (mode === 'powers' && usesLeft(all).reveal <= 0) return 'noneLeft';
  return null;
}

export function eliminateCheck(
  mode: HelpMode,
  item: HelpQuestion,
  all: readonly HelpQuestion[],
  wrongCount: number,
): null | HelpRefusal {
  if (mode !== 'powers') return 'off';
  if (item.revealed) return 'revealed';
  if (item.eliminated.length > 0) return 'already';
  if (wrongCount <= 0) return 'noWrong';
  if (usesLeft(all).eliminate <= 0) return 'noneLeft';
  return null;
}

export function pickEliminations(optionKeys: readonly string[], correct: readonly string[], rng: () => number): string[] {
  const correctKeys = new Set(correct);
  return shuffle(optionKeys.filter((key) => !correctKeys.has(key)), rng).slice(0, 2);
}
