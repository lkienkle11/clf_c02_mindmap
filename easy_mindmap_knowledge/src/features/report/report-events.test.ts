import { describe, expect, it, vi } from 'vitest';
import { notifyReportSubmitted, onReportSubmitted } from './report-events';

describe('report events', () => {
  it('calls every listener on notify, and none after unsubscribing', () => {
    const a = vi.fn();
    const b = vi.fn();
    const offA = onReportSubmitted(a);
    const offB = onReportSubmitted(b);
    notifyReportSubmitted();
    expect([a.mock.calls.length, b.mock.calls.length]).toEqual([1, 1]);
    offA();
    notifyReportSubmitted();
    expect([a.mock.calls.length, b.mock.calls.length]).toEqual([1, 2]);
    offB();
  });

  it('keeps notifying the others when a listener throws', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const ok = vi.fn();
    const offBad = onReportSubmitted(() => {
      throw new Error('boom');
    });
    const offOk = onReportSubmitted(ok);
    notifyReportSubmitted();
    expect(ok).toHaveBeenCalledTimes(1);
    offBad();
    offOk();
    err.mockRestore();
  });
});
