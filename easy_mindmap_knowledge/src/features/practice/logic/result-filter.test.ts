import { describe, expect, it } from 'vitest';
import { filterResultItems } from './result-filter';
import type { ResultFilterItem } from './result-filter';

const items: ResultFilterItem[] = [
  { number: 1, isCorrect: true, title: 'Which service stores objects?', optionTexts: ['Amazon S3', 'Amazon EC2'] },
  { number: 2, isCorrect: false, title: 'Chọn dịch vụ cơ sở dữ liệu', optionTexts: ['Đáp án Aurora', 'Lambda'] },
  { number: 34, isCorrect: false, title: 'What is a Region?', optionTexts: ['A group of data centers', 'A CDN edge'] },
  { number: 35, isCorrect: true, title: 'Name the pricing model with 34 percent saving', optionTexts: ['Savings Plans', 'On-Demand'] },
];

describe('filterResultItems', () => {
  it('returns every number for an empty or whitespace-only query and the all filter', () => {
    expect(filterResultItems(items, '', 'all')).toEqual([1, 2, 34, 35]);
    expect(filterResultItems(items, '   ', 'all')).toEqual([1, 2, 34, 35]);
  });

  it('a number query matches that question number and any title or option containing the digits', () => {
    expect(filterResultItems(items, '34', 'all')).toEqual([34, 35]);
    expect(filterResultItems(items, '2', 'all')).toEqual([1, 2]);
  });

  it('a number that matches nothing returns an empty list', () => {
    expect(filterResultItems(items, '99', 'all')).toEqual([]);
  });

  it('matches the title, case-insensitively', () => {
    expect(filterResultItems(items, 'REGION', 'all')).toEqual([34]);
  });

  it('matches option text', () => {
    expect(filterResultItems(items, 'lambda', 'all')).toEqual([2]);
    expect(filterResultItems(items, 'savings', 'all')).toEqual([35]);
  });

  it('ignores diacritics in both the query and the text', () => {
    expect(filterResultItems(items, 'dap an', 'all')).toEqual([2]);
    expect(filterResultItems(items, 'cơ sở dữ liệu', 'all')).toEqual([2]);
    expect(filterResultItems(items, 'co so du lieu', 'all')).toEqual([2]);
  });

  it('filters by verdict; wrong includes unanswered (isCorrect false)', () => {
    expect(filterResultItems(items, '', 'correct')).toEqual([1, 35]);
    expect(filterResultItems(items, '', 'wrong')).toEqual([2, 34]);
  });

  it('combines the verdict and the query', () => {
    expect(filterResultItems(items, '34', 'wrong')).toEqual([34]);
    expect(filterResultItems(items, '34', 'correct')).toEqual([35]);
    expect(filterResultItems(items, 'region', 'correct')).toEqual([]);
  });
});
