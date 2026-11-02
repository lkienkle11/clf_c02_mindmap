import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import Button from './Button.svelte';

const label = (t: string) => createRawSnippet(() => ({ render: () => `<span>${t}</span>` }));

describe('Button', () => {
  it('renders variant classes', () => {
    render(Button, { variant: 'secondary', children: label('Go') });
    const b = screen.getByRole('button', { name: 'Go' });
    expect(b.className).toContain('border');
    expect(b.className).not.toContain('bg-primary ');
  });
  it('defaults to primary', () => {
    render(Button, { children: label('Go') });
    expect(screen.getByRole('button').className).toContain('bg-primary');
  });
  it('respects disabled', async () => {
    const onclick = vi.fn();
    render(Button, { disabled: true, onclick, children: label('Go') });
    const b = screen.getByRole('button');
    expect(b).toBeDisabled();
    await userEvent.click(b);
    expect(onclick).not.toHaveBeenCalled();
  });
});
