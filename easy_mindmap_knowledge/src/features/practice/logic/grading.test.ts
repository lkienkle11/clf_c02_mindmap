import { describe, expect, it } from 'vitest';
import { gradeQuestion, passes } from './grading';

describe('passes', () => {
  it('uses inclusive 80% with integer math', () => {
    expect(passes(8, 10)).toBe(true);
    expect(passes(7, 10)).toBe(false);
    expect(passes(0, 0)).toBe(false);
    expect(passes(24, 30)).toBe(true);
    expect(passes(23, 30)).toBe(false);
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
