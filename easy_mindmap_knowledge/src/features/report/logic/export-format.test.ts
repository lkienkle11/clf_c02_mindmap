import { describe, expect, it } from 'vitest';
import type { ReportRow } from '@/persistence/records';
import { exportReadme, parseExportedStatus, toExportedReport } from './export-format';

const row: ReportRow = {
  id: 'r1', type: 'question', status: 'new', createdAt: 1, statusUpdatedAt: 2, body: 'b', appVersion: '1.0.0', locale: 'vi',
  sourceScreen: 'practice', questionId: 'q1', lessonId: null, attemptId: 'a1', position: 2, optionOrder: ['b', 'a'],
  selected: ['a'], isCorrect: false, images: ['report-images/r1-0.png', 'report-images/r1-1.jpg'],
};

describe('toExportedReport', () => {
  it('maps the row, groups the references and keeps the stored image extensions', () => {
    expect(toExportedReport(row)).toEqual({
      id: 'r1', type: 'question', status: 'new', createdAt: 1, statusUpdatedAt: 2, body: 'b', locale: 'vi', appVersion: '1.0.0',
      refs: { questionId: 'q1', lessonId: null, attemptId: 'a1', position: 2, optionOrder: ['b', 'a'], selected: ['a'], isCorrect: false, sourceScreen: 'practice' },
      images: ['images/r1-0.png', 'images/r1-1.jpg'],
    });
  });
});

describe('toExportedReport for an attempt report', () => {
  it('keeps the type and the attempt reference', () => {
    const exported = toExportedReport({
      ...row, type: 'attempt', sourceScreen: 'history', questionId: null, position: null, optionOrder: null, selected: null, isCorrect: null,
    });
    expect(exported.type).toBe('attempt');
    expect(exported.refs).toMatchObject({ attemptId: 'a1', questionId: null, sourceScreen: 'history' });
  });
});

describe('exportReadme', () => {
  it('tells agents the required step and where content lives', () => {
    const text = exportReadme();
    expect(text).toContain('"status": "handled"');
    expect(text).toContain('statusUpdatedAt');
    expect(text).toContain('content/questions');
    expect(text).toContain('content/lessons');
    expect(text).toContain('`attempt`');
    expect(text).toMatch(/next sync/);
  });
});

describe('parseExportedStatus', () => {
  const ok = JSON.stringify({ status: 'handled', statusUpdatedAt: 5 });
  it('reads status and time', () => {
    expect(parseExportedStatus(ok)).toEqual({ status: 'handled', statusUpdatedAt: 5 });
  });
  it('accepts the exact Date range limit and zero', () => {
    expect(parseExportedStatus('{"status":"new","statusUpdatedAt":8640000000000000}')?.statusUpdatedAt).toBe(8.64e15);
    expect(parseExportedStatus('{"status":"new","statusUpdatedAt":0}')?.statusUpdatedAt).toBe(0);
  });
  it('strips a leading byte order mark', () => {
    expect(parseExportedStatus(`\uFEFF${ok}`)).toEqual({ status: 'handled', statusUpdatedAt: 5 });
  });
  it.each([
    ['malformed JSON', '{nope'],
    ['an array', '[]'],
    ['null', 'null'],
    ['an unknown status', JSON.stringify({ status: 'done', statusUpdatedAt: 5 })],
    ['a string time', JSON.stringify({ status: 'new', statusUpdatedAt: '5' })],
    ['a negative time', JSON.stringify({ status: 'new', statusUpdatedAt: -1 })],
    ['a fractional time', JSON.stringify({ status: 'new', statusUpdatedAt: 1.5 })],
    ['a huge time', '{"status":"new","statusUpdatedAt":1e300}'],
    ['a time just past the Date range', '{"status":"new","statusUpdatedAt":8640000000000001}'],
    ['a time past the Date range', '{"status":"new","statusUpdatedAt":9007000000000000}'],
    ['an array status', JSON.stringify({ status: ['new'], statusUpdatedAt: 5 })],
    ['a numeric status', JSON.stringify({ status: 1, statusUpdatedAt: 5 })],
    ['an object status', JSON.stringify({ status: { a: 1 }, statusUpdatedAt: 5 })],
    ['a missing time', JSON.stringify({ status: 'new' })],
  ])('rejects %s', (_n, text) => {
    expect(parseExportedStatus(text)).toBeNull();
  });
});
