import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithI18n } from '@/testing/render-with-i18n';
import type { ScorePoint } from '../index';
import ScoreChart from './ScoreChart.svelte';

const D = Date.UTC(2026, 5, 1, 12);
const points: ScorePoint[] = [
  { attemptId: 'a1', at: D, scorePct: 90, kind: 'practice', topicId: 'compute' },
  { attemptId: 'a2', at: D + 1000, scorePct: 55, kind: 'practice', topicId: 'storage' },
  { attemptId: 'a3', at: D + 2000, scorePct: 70, kind: 'review', topicId: null },
];
const topicName = (id: string | null) => id ?? 'Mixed review';

const mount = (locale: 'en' | 'vi' = 'en') => renderWithI18n(ScoreChart, { points, topicName }, locale);

describe('ScoreChart', () => {
  it('draws one marker per attempt, with a different shape for review', () => {
    mount();
    const markers = screen.getAllByTestId('score-marker');
    expect(markers).toHaveLength(3);
    expect(markers.map((m) => m.getAttribute('data-kind'))).toEqual(['practice', 'practice', 'review']);
    expect(markers[0].tagName).toBe('circle');
    expect(markers[2].tagName).not.toBe('circle');
  });

  it('draws a dashed line at 80% and labels it', () => {
    mount();
    const line = screen.getByTestId('threshold-line');
    expect(line).toHaveAttribute('stroke-dasharray');
    const y80 = Number(line.getAttribute('y1'));
    const [first] = screen.getAllByTestId('score-marker');
    // 90% sits above (smaller y than) the 80% line
    expect(Number(first.getAttribute('cy'))).toBeLessThan(y80);
    expect(screen.getByText('Pass mark 80%')).toBeInTheDocument();
  });

  it('describes itself for screen readers', () => {
    mount();
    expect(screen.getByRole('img', { name: /3 attempts.*latest 70%.*best 90%/ })).toBeInTheDocument();
  });

  it('offers the same data as a table', async () => {
    mount();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Show as table' }));
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(4);
    expect(within(table).getByText('55%')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Hide table' }));
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('uses the current language', () => {
    mount('vi');
    expect(screen.getByRole('img', { name: /3 lượt.*mới nhất 70%.*cao nhất 90%/ })).toBeInTheDocument();
  });
});
