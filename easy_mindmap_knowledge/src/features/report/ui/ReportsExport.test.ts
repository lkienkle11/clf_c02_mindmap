import { afterEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { makeReportSeed, makeReportsScreenEnv } from '@/testing/reports-screen-env';
import type { ReportsScreenEnv } from '@/testing/reports-screen-env';
import { SETTING_EXPORT_DIR } from '../export-reports';
import ReportsScreen from './ReportsScreen.svelte';

let env: ReportsScreenEnv;
const DEFAULT_DIR = '/app-data/reports';

async function mount(prepare?: (e: ReportsScreenEnv) => Promise<void>) {
  env = await makeReportsScreenEnv([makeReportSeed({ id: 'r1', body: 'First report' }), makeReportSeed({ id: 'r2', body: 'Second report' })]);
  await prepare?.(env);
  return renderWithI18n(ReportsScreen, { services: env.services, appState: env.appState });
}
const exportButton = () => screen.getByRole('button', { name: /^Export/ });
const status = async (id: string) => (await env.services.repos.reports.get(id))?.status;

afterEach(() => vi.restoreAllMocks());

describe('Reports screen count', () => {
  it('refreshes a stale header count when it opens', async () => {
    await mount(async (e) => {
      await e.services.repos.reports.setStatus('r1', 'handled', 9_000_000);
    });
    await waitFor(() => expect(env.appState.newReportCount).toBe(1));
  });
});

describe('Reports export bar', () => {
  it('shows the default folder and exports there, remembering it', async () => {
    await mount();
    expect(await screen.findByText(DEFAULT_DIR)).toBeInTheDocument();
    await userEvent.click(exportButton());
    await waitFor(() => expect(env.storage.files.has(`${DEFAULT_DIR}/r1.json`)).toBe(true));
    expect(env.storage.files.get(`${DEFAULT_DIR}/README.md`)).toContain('"status": "handled"');
    await waitFor(async () => expect(await env.services.repos.settings.get(SETTING_EXPORT_DIR)).toBe(DEFAULT_DIR));
  });

  it('exports to a picked folder, and keeps the old folder when the picker is cancelled', async () => {
    await mount();
    await screen.findByText(DEFAULT_DIR);
    env.storage.pickedDir = '/picked';
    await userEvent.click(screen.getByRole('button', { name: 'Choose folder' }));
    expect(await screen.findByText('/picked')).toBeInTheDocument();
    env.storage.pickedDir = null;
    await userEvent.click(screen.getByRole('button', { name: 'Choose folder' }));
    expect(screen.getByText('/picked')).toBeInTheDocument();
    await userEvent.click(exportButton());
    await waitFor(() => expect(env.storage.files.has('/picked/r2.json')).toBe(true));
  });

  it('does not sync on open when nothing was ever exported', async () => {
    await mount();
    await screen.findByText(DEFAULT_DIR);
    expect(env.storage.files.has(`${DEFAULT_DIR}/r1.json`)).toBe(false);
    expect(await status('r1')).toBe('new');
  });

  it('applies an agent edit on open and refreshes the list, summary and header badge', async () => {
    await mount(async (e) => {
      const { exportReports } = await import('../export-reports');
      await exportReports(e.services, '/out');
      await e.services.repos.settings.set(SETTING_EXPORT_DIR, '/out');
      const cur = JSON.parse(e.storage.files.get('/out/r1.json') as string) as object;
      e.storage.files.set('/out/r1.json', JSON.stringify({ ...cur, status: 'handled', statusUpdatedAt: 9_000_000 }));
      await e.appState.refreshReportCount();
    });
    expect(env.appState.newReportCount).toBe(2);
    expect(await screen.findByText('/out')).toBeInTheDocument();
    await waitFor(() => expect(env.appState.newReportCount).toBe(1));
    expect(await status('r1')).toBe('handled');
    const summary = await screen.findByRole('region', { name: 'Summary' });
    await waitFor(() => expect(summary.textContent).toMatch(/Handled\s*1/));
    expect(screen.getByRole('button', { name: /First report/ })).toHaveTextContent('Handled');
  });

  it('shows a dismissible alert when the export fails and leaves the database unchanged', async () => {
    await mount();
    await screen.findByText(DEFAULT_DIR);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    env.storage.failNext('writeText');
    await userEvent.click(exportButton());
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Could not export the reports');
    expect(await status('r1')).toBe('new');
    expect(await env.services.repos.settings.get(SETTING_EXPORT_DIR)).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('tells the user to choose the folder again when the remembered folder cannot be read on open', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mount(async (e) => {
      await e.services.repos.settings.set(SETTING_EXPORT_DIR, '/gone');
      e.storage.failAlways('readText');
    });
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Choose the folder again');
    expect(await status('r1')).toBe('new');
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the same message when an export hits an unreadable folder', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await mount();
    await screen.findByText(DEFAULT_DIR);
    env.storage.failAlways('readText');
    await userEvent.click(exportButton());
    expect(await screen.findByRole('alert')).toHaveTextContent('Choose the folder again');
  });

  it('shows a status the sync changed in the open detail pane', async () => {
    await mount(async (e) => {
      const { exportReports } = await import('../export-reports');
      await exportReports(e.services, '/out');
      await e.services.repos.settings.set(SETTING_EXPORT_DIR, '/out');
    });
    await userEvent.click(await screen.findByRole('button', { name: /First report/ }));
    expect(screen.getByRole('button', { name: 'Mark as handled' })).toBeInTheDocument();
    const cur = JSON.parse(env.storage.files.get('/out/r1.json') as string) as object;
    env.storage.files.set('/out/r1.json', JSON.stringify({ ...cur, status: 'handled', statusUpdatedAt: 9_000_000 }));
    await userEvent.click(exportButton());
    await waitFor(async () => expect(await status('r1')).toBe('handled'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Reopen' })).toBeInTheDocument());
  });

  it('disables the button while an export runs', async () => {
    await mount();
    await screen.findByText(DEFAULT_DIR);
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => (release = r));
    const write = env.storage.writeText.bind(env.storage);
    env.storage.writeText = async (...a) => {
      await gate;
      return write(...a);
    };
    await userEvent.click(exportButton());
    await waitFor(() => expect(exportButton()).toBeDisabled());
    release();
    await waitFor(() => expect(exportButton()).toBeEnabled());
  });
});
