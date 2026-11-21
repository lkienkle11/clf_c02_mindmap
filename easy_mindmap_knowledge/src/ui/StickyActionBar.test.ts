import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import StickyActionBar from './StickyActionBar.svelte';

const startButton = () =>
  createRawSnippet(() => ({ render: () => '<button type="button">Start</button>' }));

describe('StickyActionBar', () => {
  it('renders its children inside a fixed bottom container', () => {
    const { container } = render(StickyActionBar, { children: startButton() });
    const bar = container.querySelector('.fixed');
    expect(bar).not.toBeNull();
    expect(bar?.className).toContain('bottom-0');
    expect(within(bar as HTMLElement).getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });
});
