import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/svelte';
import { renderWithI18n } from '@/testing/render-with-i18n';
import type { ScorePoint } from '../index';
import ScoreChart from './ScoreChart.svelte';

const D = Date.UTC(2026, 5, 1, 12);
const points: ScorePoint[] = [
  { attemptId: 'a1', at: D, scorePct: 90, kind: 'practice', topicId: 'compute' },
  { attemptId: 'a2', at: D + 1000, scorePct: 55, kind: 'practice', topicId: 'storage' },
  { attemptId: 'a3', at: D + 2000, scorePct: 70, kind: 'review', topicId: null },
];

const mount = (locale: 'en' | 'vi' = 'en') => renderWithI18n(ScoreChart, { points }, locale);

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

  it('renders no data table and no table toggle', () => {
    mount();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('points to the attempts table below for the full data', () => {
    mount();
    expect(screen.getByText('Full data is in the attempts table below')).toBeInTheDocument();
  });

  it('uses the current language', () => {
    mount('vi');
    expect(screen.getByRole('img', { name: /3 lượt.*mới nhất 70%.*cao nhất 90%/ })).toBeInTheDocument();
  });
});
