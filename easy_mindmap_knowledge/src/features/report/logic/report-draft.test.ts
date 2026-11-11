// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  MAX_BODY,
  MAX_SYSTEM_IMAGES,
  buildReportRow,
  validateDraft,
  visibleLength,
} from './report-draft';
import type { ReportContext, ReportDraft } from './report-draft';

const image = () => new Uint8Array([1, 2, 3]);
const images = (n: number) => Array.from({ length: n }, image);

const questionContext: ReportContext = {
  type: 'question',
  questionId: 'q-42',
  sourceScreen: 'practice',
  attempt: {
    attemptId: 'att-7',
    position: 3,
    optionOrder: ['c', 'a', 'd', 'b'],
    selected: ['a'],
    isCorrect: false,
  },
};

const draftWith = (context: ReportContext, body: string, imageCount = 0): ReportDraft => ({
  context,
  body,
  images: images(imageCount),
});

describe('report-draft.ts source guard', () => {
  it('uses no regex lookbehind, which Safari 16.0 (WKWebView on macOS 13) cannot parse', () => {
    const source = readFileSync(join(__dirname, 'report-draft.ts'), 'utf8');
    expect(source.match(/\(\?<[=!]/g) ?? []).toEqual([]);
  });
});

describe('visibleLength', () => {
  it('counts bold and italic markers as zero characters (visible text "ab c" is 4)', () => {
    expect(visibleLength('**ab** _c_')).toBe(4);
  });

  it('removes a bold pair around text, including inside a word', () => {
    expect(visibleLength('**x**')).toBe(1);
    expect(visibleLength('a**b**c')).toBe(3);
  });

  it('removes an italic pair around text', () => {
    expect(visibleLength('_x_')).toBe(1);
    expect(visibleLength('a _x_ b')).toBe(5);
  });

  it('removes an italic pair nested in a bold pair', () => {
    expect(visibleLength('**_x_**')).toBe(1);
  });

  it('keeps an unpaired ** or _ visible', () => {
    expect(visibleLength('a ** b')).toBe(6);
    expect(visibleLength('**x')).toBe(3);
    expect(visibleLength('_')).toBe(1);
    expect(visibleLength('a _ b')).toBe(5);
    expect(visibleLength('_x')).toBe(2);
  });

  it('does not treat a marker followed by a space as an opening marker', () => {
    expect(visibleLength('** ab**')).toBe(7);
    expect(visibleLength('_ x_')).toBe(4);
  });

  it('keeps a run of two or more underscores visible', () => {
    expect(visibleLength('__x__')).toBe(5);
  });

  it('keeps underscores inside words visible (snake_case, AWS_S3, s3_bucket)', () => {
    expect(visibleLength('snake_case')).toBe(10);
    expect(visibleLength('AWS_S3 and s3_bucket')).toBe(20);
    expect(visibleLength('aws_access_key_id')).toBe(17);
  });

  it('does not pair an underscore that is followed by a letter', () => {
    expect(visibleLength('_x_y')).toBe(4);
    expect(visibleLength('x_y_')).toBe(4);
  });

  it('counts a lone asterisk as a visible character because the subset does not render it', () => {
    expect(visibleLength('a*b')).toBe(3);
  });

  it('counts each line break as one character, with CRLF and CR also as one', () => {
    expect(visibleLength('a\nb')).toBe(3);
    expect(visibleLength('a\r\nb')).toBe(3);
    expect(visibleLength('a\rb')).toBe(3);
  });

  it('removes a leading "- " or "1. " list marker from each line, not from the middle of a line', () => {
    expect(visibleLength('- one\n- two')).toBe(7);
    expect(visibleLength('1. one\n2. two')).toBe(7);
    expect(visibleLength('a - b')).toBe(5);
  });

  it('removes markers inside list items', () => {
    expect(visibleLength('- **bold** item')).toBe(9);
  });

  it('trims surrounding whitespace and blank lines', () => {
    expect(visibleLength('  \n ab \n ')).toBe(2);
  });

  it('is zero for empty and whitespace-only input', () => {
    expect(visibleLength('')).toBe(0);
    expect(visibleLength(' \n\t ')).toBe(0);
  });

  it('keeps unpaired markers visible, so "**__" is four characters and not empty', () => {
    expect(visibleLength('**__')).toBe(4);
  });

  it('counts code points, so a single emoji or Vietnamese letter is one character', () => {
    expect(visibleLength('😀')).toBe(1);
    expect(visibleLength('Đề')).toBe(2);
  });

  it('gives the same length for NFC and NFD Vietnamese text', () => {
    const nfc = 'Tiếng Việt'.normalize('NFC');
    const nfd = nfc.normalize('NFD');
    expect(nfd.length).toBeGreaterThan(nfc.length);
    expect(visibleLength(nfd)).toBe(visibleLength(nfc));
    expect(visibleLength(nfc)).toBe(10);
  });
});

describe('visibleLength pairing (judged on the original text in one pass)', () => {
  it('judges an italic pair next to a bold pair on the original text', () => {
    expect(visibleLength('**a**_b_')).toBe(2);
    expect(visibleLength('_a_**b**')).toBe(2);
  });

  it('pairs italic runs separated by a space, and keeps a run of two underscores as text', () => {
    expect(visibleLength('_a_ _b_')).toBe(3);
    expect(visibleLength('_a__b_')).toBe(4);
  });

  it('pairs bold runs separated by a space', () => {
    expect(visibleLength('**a** **b**')).toBe(3);
  });

  it('treats a run of four asterisks as text, so it does not close a bold pair', () => {
    expect(visibleLength('**a****b**')).toBe(6);
  });

  it('treats a run of three asterisks as text (known limit: not emphasis)', () => {
    expect(visibleLength('***x***')).toBe(7);
  });

  it('drops an open bold run that an italic closer passes over, so the pairs do not cross', () => {
    expect(visibleLength('_a**b_**')).toBe(6);
  });

  it('never pairs across a line break', () => {
    expect(visibleLength('**a\nb**')).toBe(7);
  });

  it('finishes a 20,000-character body of unclosed openers in under 200 ms', () => {
    for (const unit of [' **b', '-_a', ' **b_a-']) {
      const body = unit.repeat(Math.ceil(20_000 / unit.length));
      expect(body.length).toBeGreaterThanOrEqual(20_000);
      const started = performance.now();
      visibleLength(body);
      expect(performance.now() - started, unit).toBeLessThan(200);
    }
  });
});

describe('validateDraft body length', () => {
  it('accepts a body of exactly MAX_BODY visible characters', () => {
    expect(MAX_BODY).toBe(1500);
    expect(validateDraft(draftWith(questionContext, 'a'.repeat(1500)))).toEqual({ ok: true });
  });

  it('rejects a body one character over MAX_BODY as tooLong', () => {
    expect(validateDraft(draftWith(questionContext, 'a'.repeat(1501)))).toEqual({
      ok: false,
      reason: 'tooLong',
    });
  });

  it('does not count markdown markers toward the limit', () => {
    expect(validateDraft(draftWith(questionContext, `**${'a'.repeat(1500)}**`))).toEqual({ ok: true });
    expect(validateDraft(draftWith(questionContext, `**${'a'.repeat(1501)}**`))).toEqual({
      ok: false,
      reason: 'tooLong',
    });
  });

  it('counts a line break toward the limit', () => {
    expect(validateDraft(draftWith(questionContext, `${'a'.repeat(1499)}\nb`))).toEqual({
      ok: false,
      reason: 'tooLong',
    });
  });

  it('rejects an empty or whitespace-only body as empty', () => {
    expect(validateDraft(draftWith(questionContext, ''))).toEqual({ ok: false, reason: 'empty' });
    expect(validateDraft(draftWith(questionContext, ' \n\t  '))).toEqual({ ok: false, reason: 'empty' });
    expect(validateDraft(draftWith({ type: 'system' }, '   '))).toEqual({ ok: false, reason: 'empty' });
  });

  it('accepts a marker-only body, since unpaired markers are visible text', () => {
    expect(validateDraft(draftWith(questionContext, '**__'))).toEqual({ ok: true });
  });

  it('reports tooLong before tooManyImages when both apply', () => {
    expect(validateDraft(draftWith(questionContext, 'a'.repeat(1501), 2))).toEqual({
      ok: false,
      reason: 'tooLong',
    });
  });

  it('reports empty before tooManyImages when the body is empty', () => {
    expect(validateDraft(draftWith({ type: 'system' }, '  ', 4))).toEqual({ ok: false, reason: 'empty' });
  });
});

describe('validateDraft image count', () => {
  it('allows up to MAX_SYSTEM_IMAGES images on a system report', () => {
    expect(MAX_SYSTEM_IMAGES).toBe(3);
    expect(validateDraft(draftWith({ type: 'system' }, 'bug', 0))).toEqual({ ok: true });
    expect(validateDraft(draftWith({ type: 'system' }, 'bug', 3))).toEqual({ ok: true });
  });

  it('rejects 4 images on a system report as tooManyImages', () => {
    expect(validateDraft(draftWith({ type: 'system' }, 'bug', 4))).toEqual({
      ok: false,
      reason: 'tooManyImages',
    });
  });

  it('allows 0 or 1 image on a question report and rejects 2 or 3', () => {
    expect(validateDraft(draftWith(questionContext, 'wrong', 0))).toEqual({ ok: true });
    expect(validateDraft(draftWith(questionContext, 'wrong', 1))).toEqual({ ok: true });
    expect(validateDraft(draftWith(questionContext, 'wrong', 2))).toEqual({
      ok: false,
      reason: 'tooManyImages',
    });
    expect(validateDraft(draftWith(questionContext, 'wrong', 3))).toEqual({
      ok: false,
      reason: 'tooManyImages',
    });
  });

  it('allows 0 or 1 image on a lesson report and rejects 3', () => {
    const lesson: ReportContext = { type: 'lesson', lessonId: 'l-1', sourceScreen: 'lesson' };
    expect(validateDraft(draftWith(lesson, 'wrong', 0))).toEqual({ ok: true });
    expect(validateDraft(draftWith(lesson, 'wrong', 1))).toEqual({ ok: true });
    expect(validateDraft(draftWith(lesson, 'wrong', 3))).toEqual({
      ok: false,
      reason: 'tooManyImages',
    });
  });
});

describe('attempt report', () => {
  const attemptContext: ReportContext = { type: 'attempt', attemptId: 'att-1', sourceScreen: 'result' };

  it('allows 0 or 1 image and rejects 2', () => {
    expect(validateDraft(draftWith(attemptContext, 'wrong', 0))).toEqual({ ok: true });
    expect(validateDraft(draftWith(attemptContext, 'wrong', 1))).toEqual({ ok: true });
    expect(validateDraft(draftWith(attemptContext, 'wrong', 2))).toEqual({ ok: false, reason: 'tooManyImages' });
  });

  it('stores the attempt id and source screen and leaves every other reference null', () => {
    const row = buildReportRow(draftWith(attemptContext, 'x'), { id: 'rep-1', now: 5, appVersion: '0.1.0', locale: 'vi' });
    expect(row).toEqual({
      id: 'rep-1', type: 'attempt', status: 'new', createdAt: 5, statusUpdatedAt: 5, body: 'x', appVersion: '0.1.0', locale: 'vi',
      sourceScreen: 'result', questionId: null, lessonId: null, attemptId: 'att-1', position: null, optionOrder: null, selected: null, isCorrect: null,
    });
  });
});

describe('buildReportRow', () => {
  const meta = { id: 'rep-1', now: 1_700_000_000_000, appVersion: '0.1.0', locale: 'vi' as const };

  it('copies the question id and the attempt fields for a question draft', () => {
    const row = buildReportRow(draftWith(questionContext, 'Đáp án sai'), meta);
    expect(row).toEqual({
      id: 'rep-1',
      type: 'question',
      status: 'new',
      createdAt: meta.now,
      statusUpdatedAt: meta.now,
      body: 'Đáp án sai',
      appVersion: '0.1.0',
      locale: 'vi',
      sourceScreen: 'practice',
      questionId: 'q-42',
      lessonId: null,
      attemptId: 'att-7',
      position: 3,
      optionOrder: ['c', 'a', 'd', 'b'],
      selected: ['a'],
      isCorrect: false,
    });
  });

  it('stores copies of the option arrays, not references to the draft arrays', () => {
    const optionOrder = ['c', 'a'];
    const selected = ['a'];
    const context: ReportContext = {
      type: 'question',
      questionId: 'q-1',
      sourceScreen: 'practice',
      attempt: { attemptId: 'att-1', position: 1, optionOrder, selected, isCorrect: true },
    };
    const row = buildReportRow(draftWith(context, 'x'), meta);
    optionOrder.push('z');
    selected.push('z');
    expect(row.optionOrder).toEqual(['c', 'a']);
    expect(row.selected).toEqual(['a']);
  });

  it('leaves the attempt fields null for a question draft without an attempt', () => {
    const context: ReportContext = { type: 'question', questionId: 'q-9', sourceScreen: 'missed' };
    const row = buildReportRow(draftWith(context, 'x'), meta);
    expect(row).toMatchObject({
      type: 'question',
      questionId: 'q-9',
      lessonId: null,
      attemptId: null,
      position: null,
      optionOrder: null,
      selected: null,
      isCorrect: null,
    });
  });

  it('copies the lesson id and leaves the attempt fields null for a lesson draft', () => {
    const context: ReportContext = { type: 'lesson', lessonId: 'l-3', sourceScreen: 'overlay' };
    const row = buildReportRow(draftWith(context, 'x'), meta);
    expect(row).toEqual({
      id: 'rep-1',
      type: 'lesson',
      status: 'new',
      createdAt: meta.now,
      statusUpdatedAt: meta.now,
      body: 'x',
      appVersion: '0.1.0',
      locale: 'vi',
      sourceScreen: 'overlay',
      questionId: null,
      lessonId: 'l-3',
      attemptId: null,
      position: null,
      optionOrder: null,
      selected: null,
      isCorrect: null,
    });
  });

  it('has no source screen or references for a system draft', () => {
    const row = buildReportRow(draftWith({ type: 'system' }, 'bug'), meta);
    expect(row).toMatchObject({
      type: 'system',
      status: 'new',
      sourceScreen: null,
      questionId: null,
      lessonId: null,
      attemptId: null,
      position: null,
      optionOrder: null,
      selected: null,
      isCorrect: null,
    });
  });
});
