import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { AppState } from '@/app/app-state.svelte';
import { makeHistoryEnv } from '@/testing/history-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import SettingsScreen from './SettingsScreen.svelte';

async function mount(o: Parameters<typeof makeHistoryEnv>[0] = {}) {
  const env = await makeHistoryEnv(o);
  const view = renderWithI18n(SettingsScreen, { services: env.services, appState: env.appState });
  return { ...env, ...view };
}

describe('SettingsScreen', () => {
  it('offers both languages by their own names, with the current one chosen', async () => {
    await mount();
    const group = screen.getByRole('radiogroup', { name: 'Language' });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Tiếng Việt' })).not.toBeChecked();
    expect(screen.getByText(/0\.1\.0/)).toBeInTheDocument();
  });

  it('switches the language at once and saves it', async () => {
    const { store, i18n, services } = await mount();
    await userEvent.click(screen.getByRole('radio', { name: 'Tiếng Việt' }));
    expect(i18n.locale).toBe('vi');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Cài đặt');
    expect(screen.getByRole('radiogroup', { name: 'Ngôn ngữ' })).toBeInTheDocument();
    await waitFor(() => expect(store.get('locale')).toBe('vi'));
    // reopening the app reads the saved language
    expect(await new AppState(services).load()).toBe('vi');
  });

  it('puts the language back and alerts when saving fails', async () => {
    const { i18n, store } = await mount({ failSettingKey: 'locale' });
    await userEvent.click(screen.getByRole('radio', { name: 'Tiếng Việt' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save your language. It was changed back.');
    expect(i18n.locale).toBe('en');
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
    expect(store.has('locale')).toBe(false);
  });
});
