import { describe, expect, it } from 'vitest';
import { makeRng } from '@/random/seeded-random';
import {
  eliminateCheck,
  pickEliminations,
  revealCheck,
  usesLeft,
  type HelpQuestion,
} from './help';

const question = (revealed = false, eliminated: string[] = []): HelpQuestion => ({ revealed, eliminated });

describe('help rules', () => {
  it('usesLeft counts revealed and eliminated questions separately', () => {
    expect(usesLeft([question(true), question(false, ['a']), question(true, ['b'])])).toEqual({ reveal: 1, eliminate: 1 });
  });

  it('reveal is refused when mode is off', async () => {
    const { revealCheck } = await import('./help');
    expect(revealCheck('off', question(), [])).toBe('off');
  });

  it('reveal in reveal mode is unlimited', async () => {
    const { revealCheck } = await import('./help');
    expect(revealCheck('reveal', question(), [question(true), question(true), question(true)])).toBeNull();
  });

  it('reveal in powers mode is refused after 3 questions but free again on an already revealed one', async () => {
    const { revealCheck } = await import('./help');
    const all = [question(true), question(true), question(true)];
    expect(revealCheck('powers', question(), all)).toBe('noneLeft');
    expect(revealCheck('powers', all[0], all)).toBe('already');
  });

  it('eliminate is refused when mode is not powers', () => {
    expect(eliminateCheck('reveal', question(), [], 2)).toBe('off');
  });

  it('eliminate is refused on a revealed question', () => {
    expect(eliminateCheck('powers', question(true), [], 2)).toBe('revealed');
  });

  it('eliminate is refused after 3 questions', () => {
    expect(eliminateCheck('powers', question(), [question(false, ['a']), question(false, ['b']), question(false, ['c'])], 2)).toBe('noneLeft');
  });

  it('eliminate is refused when the question already has an elimination', () => {
    expect(eliminateCheck('powers', question(false, ['a']), [], 2)).toBe('already');
  });

  it('eliminate is refused when there are no wrong options', () => {
    expect(eliminateCheck('powers', question(), [], 0)).toBe('noWrong');
  });

  it('pickEliminations never returns a correct key', () => {
    expect(pickEliminations(['a', 'b', 'c'], ['a'], () => 0)).not.toContain('a');
  });

  it('pickEliminations returns min(2, wrong count) distinct keys', () => {
    expect(pickEliminations(['a', 'b', 'c', 'd'], ['a'], () => 0)).toHaveLength(2);
    expect(new Set(pickEliminations(['a', 'b'], ['a'], () => 0)).size).toBe(1);
  });

  it('pickEliminations is deterministic for a seeded rng', () => {
    const keys = ['a', 'b', 'c', 'd', 'e'];
    expect(pickEliminations(keys, ['a'], makeRng(42))).toEqual(pickEliminations(keys, ['a'], makeRng(42)));
  });
});
