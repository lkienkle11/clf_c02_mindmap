import { describe, expect, it } from 'vitest';
import { badgeKey, optionState } from './option-state';

describe('optionState', () => {
  it('single answer: the picked correct option is right, the picked wrong option is wrong', () => {
    expect(optionState(['B'], ['B'], 'B')).toBe('right');
    expect(optionState(['B'], ['C'], 'C')).toBe('wrong');
  });

  it('single answer: the unpicked correct option is missed, an unpicked wrong option is none', () => {
    expect(optionState(['B'], ['C'], 'B')).toBe('missed');
    expect(optionState(['B'], ['C'], 'A')).toBe('none');
  });

  it('single answer with nothing picked: the correct option is missed, the others are none', () => {
    expect(optionState(['B'], [], 'B')).toBe('missed');
    expect(optionState(['B'], [], 'A')).toBe('none');
  });

  it('multi answer: each option gets its own state', () => {
    const correct = ['A', 'B'];
    const selected = ['A', 'C'];
    expect(optionState(correct, selected, 'A')).toBe('right');
    expect(optionState(correct, selected, 'B')).toBe('missed');
    expect(optionState(correct, selected, 'C')).toBe('wrong');
    expect(optionState(correct, selected, 'D')).toBe('none');
  });
});

describe('badgeKey', () => {
  it('right and wrong join the picked badge with the correct or wrong badge', () => {
    expect(badgeKey('right')).toEqual(['practice.result.badge.picked', 'practice.result.badge.correct']);
    expect(badgeKey('wrong')).toEqual(['practice.result.badge.picked', 'practice.result.badge.wrong']);
  });

  it('missed is the single missed badge', () => {
    expect(badgeKey('missed')).toEqual(['practice.result.badge.missed']);
  });
});
