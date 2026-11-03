import { describe, expect, it } from 'vitest';
import { advanceFreeze, isExpired, remainingAt, resolveOnResume, settleHidden, startClock } from './attempt-clock';

describe('attempt clock', () => {
  it('startClock carries onHidden', () => {
    expect(startClock(60_000, 'freeze', 0, 'run').onHidden).toBe('run');
    expect(startClock(60_000, 'run', 0, 'freeze').onHidden).toBe('freeze');
    expect(startClock(null, 'run', 0, 'run').onHidden).toBe('run');
  });

  it('no limit: remainingAt null and never expired', () => {
    const s = startClock(null, 'freeze', 0, 'freeze');
    expect(remainingAt(s, 1_000_000)).toBeNull();
    expect(isExpired(s, 1_000_000)).toBe(false);
    expect(isExpired(startClock(null, 'run', 0, 'freeze'), 5)).toBe(false);
  });

  it('freeze subtracts elapsed and never goes below 0', () => {
    const s = startClock(60_000, 'freeze', 0, 'freeze');
    const a = advanceFreeze(s, 10_000);
    expect(remainingAt(a, 999)).toBe(50_000);
    const b = advanceFreeze(a, 100_000);
    expect(b.remainingMs).toBe(0);
    expect(isExpired(b, 0)).toBe(true);
  });

  it('advanceFreeze does nothing in run mode', () => {
    const s = startClock(60_000, 'run', 0, 'freeze');
    expect(advanceFreeze(s, 10_000)).toEqual(s);
  });

  it('run sets a deadline from now', () => {
    const s = startClock(300_000, 'run', 1000, 'freeze');
    expect(s.deadlineAt).toBe(301_000);
    expect(remainingAt(s, 1000 + 299_000)).toBe(1000);
    expect(remainingAt(s, 1000 + 400_000)).toBe(0);
    expect(isExpired(s, 301_000)).toBe(true);
    expect(isExpired(s, 300_999)).toBe(false);
  });

  it('run past deadline on resume auto-submits', () => {
    const s = startClock(300_000, 'run', 0, 'freeze');
    const r = resolveOnResume(s, 400_000, 100_000);
    expect(r.autoSubmit).toBe(true);
  });

  it('run before deadline on resume does not auto-submit', () => {
    const s = startClock(300_000, 'run', 0, 'freeze');
    const r = resolveOnResume(s, 200_000, 100_000);
    expect(r.autoSubmit).toBe(false);
    expect(r.state.deadlineAt).toBe(300_000);
  });

  it('clock moved backwards does not throw and remaining <= limit', () => {
    const s = startClock(300_000, 'run', 1_000_000, 'freeze');
    const r = resolveOnResume(s, 10, 1_200_000);
    expect(r.autoSubmit).toBe(false);
    expect(r.state.deadlineAt).toBe(s.deadlineAt);
    expect(remainingAt(r.state, 10)).toBeLessThanOrEqual(300_000);
    expect(remainingAt(r.state, 10)).toBe(300_000);
  });

  it('freeze resume keeps remaining and only auto-submits at 0', () => {
    const s = advanceFreeze(startClock(60_000, 'freeze', 0, 'freeze'), 20_000);
    const r = resolveOnResume(s, 9_999_999, 5);
    expect(r.autoSubmit).toBe(false);
    expect(remainingAt(r.state, 0)).toBe(40_000);
    const z = advanceFreeze(s, 40_000);
    expect(resolveOnResume(z, 1, 0).autoSubmit).toBe(true);
  });

  it('no limit resume never auto-submits', () => {
    const r = resolveOnResume(startClock(null, 'run', 0, 'freeze'), 1e12, 0);
    expect(r.autoSubmit).toBe(false);
  });
});

describe('settleHidden', () => {
  const runFreeze = { ...startClock(600_000, 'run', 400_000, 'freeze') };
  it('run + freeze: deadlineAt moves later by hiddenMs', () => {
    expect(settleHidden(runFreeze, 5000).deadlineAt).toBe(1_005_000);
  });
  it('run + run: unchanged', () => {
    const s = startClock(600_000, 'run', 0, 'run');
    expect(settleHidden(s, 5000)).toEqual(s);
  });
  it('freeze + run: remainingMs drops by hiddenMs with no 3s cap', () => {
    const s = startClock(100_000, 'freeze', 0, 'run');
    expect(settleHidden(s, 40_000).remainingMs).toBe(60_000);
  });
  it('freeze + run clamps at 0', () => {
    const s = startClock(100_000, 'freeze', 0, 'run');
    expect(settleHidden(s, 200_000).remainingMs).toBe(0);
  });
  it('freeze + freeze: unchanged', () => {
    const s = startClock(100_000, 'freeze', 0, 'freeze');
    expect(settleHidden(s, 40_000)).toEqual(s);
  });
  it('negative hiddenMs is treated as 0', () => {
    expect(settleHidden(runFreeze, -5000)).toEqual(runFreeze);
    const s = startClock(100_000, 'freeze', 0, 'run');
    expect(settleHidden(s, -5000)).toEqual(s);
  });
  it('untimed (limitMs null) is returned as is', () => {
    const s = startClock(null, 'run', 0, 'freeze');
    expect(settleHidden(s, 5000)).toBe(s);
  });
});
