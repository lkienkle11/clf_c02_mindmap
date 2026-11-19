import { describe, expect, it } from 'vitest';
import { CAPSTONE_EXAM_TOPIC_IDS, isCapstoneExamTopic } from './capstone-exams';

describe('Capstone exam topics', () => {
  it('declares the two exam topics in order', () => {
    expect(CAPSTONE_EXAM_TOPIC_IDS).toEqual(['capstone-exam-1', 'capstone-exam-2']);
  });
  it.each([
    ['capstone-exam-1', true], ['capstone-exam-2', true],
    ['capstone', false], ['compute', false], [null, false],
  ] as const)('recognizes %s as exam: %s', (id, expected) => {
    expect(isCapstoneExamTopic(id)).toBe(expected);
  });
});
