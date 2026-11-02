import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Badge from './Badge.svelte';

describe('Badge', () => {
  it.each([['done', '✓'], ['next', '▶'], ['locked', '🔒']] as const)('%s shows symbol and text', (tone, sym) => {
    render(Badge, { tone, label: 'Label' });
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText(sym)).toBeInTheDocument();
  });
  it('review has text and no symbol', () => {
    const { container } = render(Badge, { tone: 'review', label: 'Ôn tập' });
    expect(screen.getByText('Ôn tập')).toBeInTheDocument();
    expect(container.querySelector('[data-symbol]')).toBeNull();
  });
});
