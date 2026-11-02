import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ProgressBar from './ProgressBar.svelte';

describe('ProgressBar', () => {
  it('exposes aria values', () => {
    render(ProgressBar, { value: 42, label: 'Tiến độ' });
    const p = screen.getByRole('progressbar', { name: 'Tiến độ' });
    expect(p).toHaveAttribute('aria-valuenow', '42');
    expect(p).toHaveAttribute('aria-valuemin', '0');
    expect(p).toHaveAttribute('aria-valuemax', '100');
  });
  it('clamps', () => {
    render(ProgressBar, { value: 150 });
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
