import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/svelte';
import { renderWithI18n } from '@/testing/render-with-i18n';
import UpdateNotes from './UpdateNotes.svelte';

const NOTES = '### English\n- Faster start\n### Tiếng Việt\n- Khởi động nhanh hơn\n';

describe('UpdateNotes', () => {
  it('shows the chosen language and falls back to Vietnamese', () => {
    renderWithI18n(UpdateNotes, { notes: NOTES }, 'en');
    expect(screen.getByText('Faster start')).toBeInTheDocument();
  });

  it('falls back to Vietnamese when the chosen language has no notes', () => {
    renderWithI18n(UpdateNotes, { notes: '### Tiếng Việt\n- Khởi động nhanh hơn\n' }, 'en');
    expect(screen.getByText('Khởi động nhanh hơn')).toBeInTheDocument();
    expect(screen.queryByText('Faster start')).toBeNull();
  });

  it('renders nothing for null notes', () => {
    renderWithI18n(UpdateNotes, { notes: null }, 'en');
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.queryByText("What's new")).toBeNull();
  });

  it('renders repeated identical bullets', () => {
    renderWithI18n(UpdateNotes, { notes: '### English\n- Faster start\n- Faster start\n' }, 'en');
    expect(screen.getAllByText('Faster start')).toHaveLength(2);
  });

  it.each([
    ['en', "What's new"],
    ['vi', 'Có gì mới'],
  ] as const)('puts the list in a scroll region reachable by keyboard (%s)', (locale, name) => {
    renderWithI18n(UpdateNotes, { notes: NOTES }, locale);
    const region = screen.getByRole('region', { name });
    expect(region).toHaveAttribute('tabindex', '0');
    expect(region.className).toContain('overflow-y-auto');
    expect(region.className).toMatch(/max-h-/);
    expect(region).toContainElement(screen.getByRole('list'));
  });
});
