import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/svelte';
import { renderWithI18n } from '@/testing/render-with-i18n';
import WhatsNew from './WhatsNew.svelte';

const entry = (version: string, en: string, vi: string) =>
  `## ${version}\n\n### English\n- ${en}\n\n### Tiếng Việt\n- ${vi}\n\n`;
const CHANGELOG =
  '# Changelog\n\n' + entry('0.3.0', 'Three', 'Ba') + entry('0.2.0', 'Two', 'Hai') + entry('0.1.0', 'One', 'Một');

describe('WhatsNew', () => {
  it('lists only versions up to the installed one, newest first', () => {
    const { container } = renderWithI18n(WhatsNew, { installedVersion: '0.2.0', changelog: CHANGELOG });
    expect(screen.getByRole('heading', { name: 'Release history' })).toBeInTheDocument();
    const sections = [...container.querySelectorAll('details')];
    expect(sections.map((d) => d.querySelector('summary')?.textContent?.trim())).toEqual([
      'Version 0.2.0',
      'Version 0.1.0',
    ]);
    expect(sections.map((d) => d.open)).toEqual([true, false]);
    expect(screen.queryByText('Version 0.3.0')).toBeNull();
  });

  it('shows the chosen language', () => {
    renderWithI18n(WhatsNew, { installedVersion: '0.3.0', changelog: CHANGELOG }, 'vi');
    expect(screen.getByText('Phiên bản 0.3.0')).toBeInTheDocument();
    expect(screen.getByText('Ba')).toBeInTheDocument();
    expect(screen.queryByText('Three')).toBeNull();
  });

  it('shows nothing when the changelog is empty', () => {
    const { container } = renderWithI18n(WhatsNew, { installedVersion: '0.3.0', changelog: '' });
    expect(screen.queryByRole('heading', { name: 'Release history' })).toBeNull();
    expect(container.querySelector('details')).toBeNull();
  });
});
