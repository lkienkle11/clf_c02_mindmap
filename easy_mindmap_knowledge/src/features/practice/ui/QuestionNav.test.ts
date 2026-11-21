import { describe, expect, it } from 'vitest';
import { renderWithI18n } from '@/testing/render-with-i18n';
import type { SessionQuestion } from '../session.svelte';
import QuestionNav from './QuestionNav.svelte';

const questions: SessionQuestion[] = [
  { position: 0, questionId: 'q1', optionOrder: [], multi: false, selected: ['A'], unscored: false },
  { position: 1, questionId: 'q2', optionOrder: [], multi: false, selected: [], unscored: false },
];

function renderNav() {
  return renderWithI18n(QuestionNav, { questions, index: 0, ongo: () => {} });
}

describe('QuestionNav', () => {
  it('answered cell contains only its number', () => {
    const { getAllByRole } = renderNav();

    expect(getAllByRole('button')[0].textContent?.trim()).toBe('1');
  });

  it('answered and unanswered cells have identical size class tokens', () => {
    const { getAllByRole } = renderNav();
    const sizeClasses = ['min-h-11', 'min-w-11', 'px-2', 'text-base'];
    const cells = getAllByRole('button');

    expect(sizeClasses.map((token) => cells[0].classList.contains(token))).toEqual([true, true, true, true]);
    expect(sizeClasses.map((token) => cells[1].classList.contains(token))).toEqual([true, true, true, true]);
  });

  it('aria-label still says answered and unanswered', () => {
    const { getAllByRole } = renderNav();
    const cells = getAllByRole('button');

    expect(cells[0].getAttribute('aria-label')).toMatch(/answered/i);
    expect(cells[1].getAttribute('aria-label')).toMatch(/unanswered/i);
  });
});
