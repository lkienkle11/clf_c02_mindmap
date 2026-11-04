import { describe, expect, it } from 'vitest';
import { EXAM_MIN_QUESTIONS, EXAM_MINUTES, EXAM_MINUTES_EXTRA, EXAM_QUESTION_COUNT, examLimitMs } from './exam-config';

describe('exam config', () => {
  it('exposes the exam constants', () => {
    expect(EXAM_QUESTION_COUNT).toBe(65);
    expect(EXAM_MINUTES).toBe(90);
    expect(EXAM_MINUTES_EXTRA).toBe(120);
    expect(EXAM_MIN_QUESTIONS).toBe(10);
  });

  it('full exam limits match the minutes', () => {
    expect(examLimitMs(65, false)).toBe(5_400_000);
    expect(examLimitMs(65, true)).toBe(7_200_000);
  });

  it('scales proportionally and rounds up to whole seconds', () => {
    expect(examLimitMs(20, false)).toBe(1_662_000);
    expect(examLimitMs(20, true)).toBe(Math.ceil((20 * 7200) / 65) * 1000);
  });

  it('always returns a multiple of 1000 ms', () => {
    for (const count of [10, 20, 33, 47, 64, 65]) {
      for (const extra of [false, true]) {
        expect(examLimitMs(count, extra) % 1000).toBe(0);
      }
    }
  });
});
