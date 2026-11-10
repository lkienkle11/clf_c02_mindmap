import { describe, expect, it } from 'vitest';
import { pageCount } from './paginate';

describe('pageCount', () => {
  it('is 0 when there is nothing to show', () => {
    expect(pageCount(0, 10)).toBe(0);
  });
  it('rounds up', () => {
    expect(pageCount(1, 10)).toBe(1);
    expect(pageCount(10, 10)).toBe(1);
    expect(pageCount(11, 10)).toBe(2);
    expect(pageCount(41, 10)).toBe(5);
  });
});
