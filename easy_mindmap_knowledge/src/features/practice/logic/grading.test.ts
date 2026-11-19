import { describe, expect, it } from 'vitest';
import { gradeQuestion, passes, passThresholdPct } from './grading';

describe('passThresholdPct', () => {
  it('uses 70% for both Capstone exams and 80% for other topics', () => {
    expect(passThresholdPct('capstone-exam-1')).toBe(70);
    expect(passThresholdPct('capstone-exam-2')).toBe(70);
    expect(passThresholdPct('compute')).toBe(80);
    expect(passThresholdPct('capstone')).toBe(80);
    expect(passThresholdPct(null)).toBe(80);
  });
});

describe('passes', () => {
  it('accepts an inclusive 70% threshold', () => {
    expect(passes(35, 50, 70)).toBe(true);
    expect(passes(34, 50, 70)).toBe(false);
    expect(passes(0, 0, 70)).toBe(false);
  });

  it('uses inclusive 80% with integer math', () => {
    expect(passes(8, 10)).toBe(true);
    expect(passes(7, 10)).toBe(false);
    expect(passes(0, 0)).toBe(false);
    expect(passes(24, 30)).toBe(true);
    expect(passes(23, 30)).toBe(false);
    expect(passes(40, 50)).toBe(true);
    expect(passes(39, 50)).toBe(false);
  });
});

describe('gradeQuestion', () => {
  it('compares as sets ignoring order', () => {
    expect(gradeQuestion(['C', 'D'], ['D', 'C'])).toBe(true);
    expect(gradeQuestion(['C', 'D'], ['C'])).toBe(false);
    expect(gradeQuestion(['A'], [])).toBe(false);
    expect(gradeQuestion(['A'], ['A', 'B'])).toBe(false);
  });
});
