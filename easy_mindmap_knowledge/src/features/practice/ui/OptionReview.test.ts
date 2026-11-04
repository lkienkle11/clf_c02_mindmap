import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/svelte';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { makeQuestion } from '@/testing/fixtures';
import OptionReview from './OptionReview.svelte';

const options = ['A', 'B', 'C', 'D'].map((k) => ({ key: k, text: `Opt ${k}` }));
const notes = { A: 'note A', B: 'note B', C: 'note C', D: 'note D' };
const rows = () => Array.from(document.querySelectorAll('li[data-option]')) as HTMLElement[];
const row = (k: string) => within(document.querySelector(`li[data-option="${k}"]`) as HTMLElement);

describe('OptionReview', () => {
  it('single answer, wrong pick: lists all options, badges, and notes only under picked/correct', () => {
    const question = makeQuestion({ options, correct: ['B'], optionNotes: notes });
    renderWithI18n(OptionReview, { question, selected: ['C'] });
    expect(rows()).toHaveLength(4);
    expect(row('C').getByText('Your answer · Incorrect')).toBeInTheDocument();
    expect(row('B').getByText('Correct answer')).toBeInTheDocument();
    expect(row('C').getByText('note C')).toBeInTheDocument();
    expect(row('B').getByText('note B')).toBeInTheDocument();
    expect(screen.queryByText('note A')).not.toBeInTheDocument();
    expect(screen.queryByText('note D')).not.toBeInTheDocument();
  });

  it('multi answer: picked-correct, picked-wrong and missed badges', () => {
    const question = makeQuestion({ options, correct: ['A', 'B'], multi: true });
    renderWithI18n(OptionReview, { question, selected: ['A', 'C'] });
    expect(row('A').getByText('Your answer · Correct')).toBeInTheDocument();
    expect(row('C').getByText('Your answer · Incorrect')).toBeInTheDocument();
    expect(row('B').getByText('Correct answer')).toBeInTheDocument();
    expect(row('D').queryByText(/answer/i)).not.toBeInTheDocument();
  });

  it('follows optionOrder', () => {
    const question = makeQuestion({ options, correct: ['A'] });
    renderWithI18n(OptionReview, { question, selected: [], optionOrder: ['C', 'A', 'B', 'D'] });
    expect(rows().map((r) => r.dataset.option)).toEqual(['C', 'A', 'B', 'D']);
  });

  it('appends keys missing from optionOrder', () => {
    const question = makeQuestion({ options, correct: ['A'] });
    renderWithI18n(OptionReview, { question, selected: [], optionOrder: ['C', 'A'] });
    expect(rows().map((r) => r.dataset.option)).toEqual(['C', 'A', 'B', 'D']);
  });

  it('hides the Explanation heading without explanation, shows it with one', () => {
    const q = makeQuestion({ options, correct: ['A'] });
    const { unmount } = renderWithI18n(OptionReview, { question: q, selected: ['A'] });
    expect(screen.queryByText('Explanation')).not.toBeInTheDocument();
    unmount();
    renderWithI18n(OptionReview, { question: { ...q, explanation: 'Because.' }, selected: ['A'] });
    expect(screen.getByText('Explanation')).toBeInTheDocument();
    expect(screen.getByText('Because.')).toBeInTheDocument();
  });

  it('shows No answer only when nothing is picked', () => {
    const question = makeQuestion({ options, correct: ['A'] });
    const { unmount } = renderWithI18n(OptionReview, { question, selected: [] });
    expect(screen.getByText('No answer')).toBeInTheDocument();
    unmount();
    renderWithI18n(OptionReview, { question, selected: ['A'] });
    expect(screen.queryByText('No answer')).not.toBeInTheDocument();
  });

  it('renders nothing for an unknown question', () => {
    renderWithI18n(OptionReview, { question: undefined, selected: [] });
    expect(rows()).toHaveLength(0);
  });
});
