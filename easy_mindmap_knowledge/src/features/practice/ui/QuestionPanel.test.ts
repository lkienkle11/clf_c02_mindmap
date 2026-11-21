import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import type { Locale } from '@/i18n/i18n.svelte';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { makeQuestion } from '@/testing/fixtures';
import type { PracticeSession, SessionQuestion } from '../session.svelte';
import QuestionPanel from './QuestionPanel.svelte';

const KEYS = ['A', 'B', 'C', 'D'];
const options = KEYS.map((k) => ({ key: k, text: `Opt ${k}` }));

function sessionItem(over: Partial<SessionQuestion>): SessionQuestion {
  return { position: 1, questionId: 'q1', optionOrder: KEYS, multi: false, selected: [], unscored: false, revealed: false, eliminated: [], ...over };
}

function renderPanel(over: Partial<SessionQuestion>, question = makeQuestion({ options, correct: ['A'] }), locale: Locale = 'en') {
  const select = vi.fn().mockResolvedValue(undefined);
  const session = { select, questions: [] } as unknown as PracticeSession;
  const view = renderWithI18n(QuestionPanel, { session, item: sessionItem(over), question, onfailed: vi.fn() }, locale);
  return { select, ...view };
}

const input = (key: string): HTMLInputElement => document.querySelector<HTMLInputElement>(`input[value="${key}"]`)!;
const rowOf = (key: string): HTMLElement => input(key).closest('label') as HTMLElement;

describe('QuestionPanel reveal and eliminate', () => {
  it('a revealed question marks correct options green with the correct badge', () => {
    renderPanel({ revealed: true, selected: [] });
    expect(rowOf('A').className).toContain('border-leaf-done');
    expect(within(rowOf('A')).getByText('Correct answer')).toBeInTheDocument();
    expect(rowOf('B').className).not.toContain('border-leaf-done');
  });

  it('a revealed question marks a picked wrong option red with the wrong badge', () => {
    renderPanel({ revealed: true, selected: ['B'] });
    expect(rowOf('B').className).toContain('border-danger');
    expect(within(rowOf('B')).getByText('Your answer · Incorrect')).toBeInTheDocument();
  });

  it('the explanation appears only when revealed', () => {
    const question = makeQuestion({ options, correct: ['A'], explanation: 'Because A.' });
    const hidden = renderPanel({ revealed: false }, question);
    expect(screen.queryByText('Because A.')).not.toBeInTheDocument();
    expect(screen.queryByText('Explanation')).not.toBeInTheDocument();
    hidden.unmount();
    renderPanel({ revealed: true }, question);
    expect(screen.getByText('Because A.')).toBeInTheDocument();
    expect(screen.getByText('Explanation')).toBeInTheDocument();
  });

  it('inputs stay enabled after reveal and changing the answer calls session.select', async () => {
    const { select } = renderPanel({ revealed: true, selected: ['A'] });
    const radioB = screen.getByRole('radio', { name: 'Opt B' });
    expect(radioB).toBeEnabled();
    await userEvent.click(radioB);
    expect(select).toHaveBeenCalledWith(1, ['B']);
  });

  it('eliminated options are disabled, struck through and carry the hidden "Đã loại" text', () => {
    renderPanel({ eliminated: ['B'] }, undefined, 'vi');
    expect(input('B')).toBeDisabled();
    expect(input('A')).toBeEnabled();
    expect(rowOf('B').className).toContain('line-through');
    expect(rowOf('B').className).toContain('opacity-60');
    expect(within(rowOf('B')).getByText('Đã loại')).toBeInTheDocument();
    expect(within(rowOf('A')).queryByText('Đã loại')).not.toBeInTheDocument();
  });

  it('a not revealed question shows no badges and no explanation', () => {
    const question = makeQuestion({ options, correct: ['A'], explanation: 'Because A.' });
    renderPanel({ revealed: false, selected: ['A'] }, question);
    expect(screen.queryByText('Your answer · Correct')).not.toBeInTheDocument();
    expect(screen.queryByText('Correct answer')).not.toBeInTheDocument();
    expect(screen.queryByText('Because A.')).not.toBeInTheDocument();
    expect(screen.queryByText('Explanation')).not.toBeInTheDocument();
    expect(screen.queryByText('No explanation for this question yet')).not.toBeInTheDocument();
    expect(rowOf('A').className).not.toContain('border-leaf-done');
  });

  it('reveal does not change the number of option rows', () => {
    const hidden = renderPanel({ revealed: false, selected: ['A'] });
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    hidden.unmount();
    renderPanel({ revealed: true, selected: ['A'] });
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });

  it('a revealed question without explanation shows the no-explanation text', () => {
    renderPanel({ revealed: true, selected: ['B'] });
    expect(screen.getByText('No explanation for this question yet')).toBeInTheDocument();
  });

  it('option rows stay lang en and the eliminated label uses the interface language', () => {
    renderPanel({ eliminated: ['B'] }, undefined, 'vi');
    for (const key of KEYS) {
      const spans = Array.from(rowOf(key).children).filter((c): c is HTMLElement => c.tagName === 'SPAN');
      expect(spans.length).toBeGreaterThan(0);
      for (const span of spans) expect(span).toHaveAttribute('lang', 'en');
    }
    expect(within(rowOf('B')).getByText('Đã loại')).toHaveAttribute('lang', 'vi');
  });
});
