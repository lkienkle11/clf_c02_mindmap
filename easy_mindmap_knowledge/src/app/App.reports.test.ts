import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { createI18n } from '@/i18n/i18n.svelte';
import { makeReportSeed, makeReportsScreenEnv } from '@/testing/reports-screen-env';
import App from './App.svelte';

describe('App reports route', () => {
  it('opens the Reports screen from the tab, and marking a report handled lowers the tab badge', async () => {
    const env = await makeReportsScreenEnv([
      makeReportSeed({ id: 'a', body: 'first report', createdAt: 2_000 }),
      makeReportSeed({ id: 'b', body: 'second report', createdAt: 1_000 }),
    ]);
    render(App, { services: env.services, appState: env.appState, i18n: createI18n('en') });
    await userEvent.click(screen.getByRole('button', { name: 'Reports, 2 new' }));
    expect(await screen.findByRole('heading', { name: 'Reports' })).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('button', { name: /first report/ }));
    const detail = await screen.findByRole('region', { name: 'Report details' });
    await userEvent.click(within(detail).getByRole('button', { name: 'Mark as handled' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Reports, 1 new' })).toBeInTheDocument());
  });
});
