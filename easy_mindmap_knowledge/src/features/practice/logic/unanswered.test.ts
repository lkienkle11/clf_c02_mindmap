import { describe, expect, it } from 'vitest';
import { hidesAnswers } from './unanswered';

describe('hidesAnswers', () => {
  it('hides only when nothing was selected and the choice is answersOnly', () => {
    expect(hidesAnswers([], 'answersOnly')).toBe(true);
    expect(hidesAnswers([], 'reveal')).toBe(false);
    expect(hidesAnswers(['A'], 'answersOnly')).toBe(false);
    expect(hidesAnswers(['A'], 'reveal')).toBe(false);
  });
});
