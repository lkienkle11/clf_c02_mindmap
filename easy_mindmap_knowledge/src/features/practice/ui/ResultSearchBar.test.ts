import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/svelte';
import { renderWithI18n } from '@/testing/render-with-i18n';
import ResultSearchBar from './ResultSearchBar.svelte';

describe('ResultSearchBar', () => {
  it('has a labelled search input, a labelled filter with three options and a live count', () => {
    renderWithI18n(ResultSearchBar, { query: '', verdict: 'all', shown: 3, total: 10 });
    expect(screen.getByRole('searchbox', { name: 'Search questions' })).toHaveAttribute('placeholder', 'Question number, title or answer');
    const filter = screen.getByRole('combobox', { name: 'Show' });
    expect(Array.from(filter.querySelectorAll('option')).map((o) => o.textContent)).toEqual(['All', 'Correct only', 'Wrong or unanswered']);
    expect(screen.getByText('3 / 10 questions')).toHaveAttribute('aria-live', 'polite');
  });

  it('shows the empty message only when nothing matches', () => {
    const { unmount } = renderWithI18n(ResultSearchBar, { query: 'zzz', verdict: 'all', shown: 0, total: 10 });
    expect(screen.getByText('No question matches.')).toBeInTheDocument();
    unmount();
    renderWithI18n(ResultSearchBar, { query: '', verdict: 'all', shown: 10, total: 10 });
    expect(screen.queryByText('No question matches.')).not.toBeInTheDocument();
  });

  it('is in Vietnamese', () => {
    renderWithI18n(ResultSearchBar, { query: '', verdict: 'all', shown: 2, total: 5 }, 'vi');
    expect(screen.getByRole('searchbox', { name: 'Tìm câu hỏi' })).toBeInTheDocument();
    expect(screen.getByText('2 / 5 câu')).toBeInTheDocument();
  });
});
