import { describe, expect, it } from 'vitest';
import { buildReportQuery, emptyFilters, excerpt } from './report-query';

describe('buildReportQuery', () => {
  it('leaves every filter out when none is set', () => {
    expect(buildReportQuery(emptyFilters(), 1, 10)).toEqual({ page: 1, pageSize: 10 });
  });
  it('maps type, status and trimmed text', () => {
    const q = buildReportQuery({ ...emptyFilters(), type: 'lesson', status: 'new', text: '  Crash ' }, 3, 10);
    expect(q).toEqual({ type: 'lesson', status: 'new', text: 'Crash', page: 3, pageSize: 10 });
  });
  it('turns the date range into the local start of the first day and the last millisecond of the last day', () => {
    const q = buildReportQuery({ ...emptyFilters(), from: '2026-03-05', to: '2026-03-06' }, 1, 10);
    expect(q.fromMs).toBe(new Date(2026, 2, 5).getTime());
    expect(q.toMs).toBe(new Date(2026, 2, 7).getTime() - 1);
  });
  it('ignores a date that is not a calendar date', () => {
    expect(buildReportQuery({ ...emptyFilters(), from: 'x', to: '2026-13-40' }, 1, 10)).toEqual({ page: 1, pageSize: 10 });
  });
});

describe('excerpt', () => {
  it('keeps a short body as it is', () => {
    expect(excerpt('short body', 100)).toBe('short body');
  });
  it('collapses line breaks and cuts at 100 characters with an ellipsis', () => {
    const out = excerpt(`line one\n\nline two ${'x'.repeat(200)}`, 100);
    expect(out.startsWith('line one line two ')).toBe(true);
    expect(Array.from(out)).toHaveLength(101);
    expect(out.endsWith('…')).toBe(true);
  });
  it('does not cut a character in half', () => {
    const out = excerpt('😀'.repeat(150), 100);
    expect(Array.from(out).slice(0, 100).every((c) => c === '😀')).toBe(true);
  });
});
