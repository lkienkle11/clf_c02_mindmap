import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { AppState } from '@/app/app-state.svelte';
import { makeHistoryEnv } from '@/testing/history-env';
import { makePracticeEnv } from '@/testing/practice-env';
import { makeReportEnv, PNG_BYTES } from '@/testing/report-env';
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
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { i18n, store } = await mount({ failSettingKey: 'locale' });
    await userEvent.click(screen.getByRole('radio', { name: 'Tiếng Việt' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save your language. It was changed back.');
    expect(logged).toHaveBeenCalledWith('Could not save the language', expect.any(Error));
    logged.mockRestore();
    expect(i18n.locale).toBe('en');
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
    expect(store.has('locale')).toBe(false);
  });
});

describe('SettingsScreen system report', () => {
  const png = (name: string) => new File([PNG_BYTES], name, { type: 'image/png' });

  async function mountWithReports() {
    const env = await makeReportEnv();
    const { appState } = await makePracticeEnv();
    renderWithI18n(SettingsScreen, { services: env.services, appState }, 'vi');
    return env;
  }

  it('puts a "Báo cáo" button below the Language section, outside its fieldset', async () => {
    await mountWithReports();
    const group = screen.getByRole('radiogroup', { name: 'Ngôn ngữ' });
    const report = screen.getByRole('button', { name: 'Báo cáo' });
    expect(group.compareDocumentPosition(report) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(report.closest('fieldset')).toBeNull();
  });

  it('opens the "Báo cáo hệ thống" dialog with the image upload and no capture button', async () => {
    await mountWithReports();
    await userEvent.click(screen.getByRole('button', { name: 'Báo cáo' }));
    const dialog = screen.getByRole('dialog', { name: 'Báo cáo hệ thống' });
    expect(within(dialog).getByLabelText(/Tải ảnh lên/)).toHaveAttribute('type', 'file');
    expect(within(dialog).queryByRole('button', { name: 'Chụp màn hình' })).toBeNull();
  });

  it('stores a system report with its 2 image paths and no question or lesson ids', async () => {
    const env = await mountWithReports();
    await userEvent.click(screen.getByRole('button', { name: 'Báo cáo' }));
    await fireEvent.input(screen.getByRole('textbox'), { target: { value: 'Nút lưu bị lỗi' } });
    await fireEvent.change(screen.getByLabelText(/Tải ảnh lên/), { target: { files: [png('1.png'), png('2.png')] } });
    await waitFor(() => expect(screen.getAllByRole('img')).toHaveLength(2));
    await userEvent.click(screen.getByRole('button', { name: 'Nộp báo cáo' }));
    await waitFor(() => expect(env.created).toHaveLength(1));
    expect(env.created[0].row).toMatchObject({ type: 'system', questionId: null, lessonId: null, body: 'Nút lưu bị lỗi' });
    expect(env.created[0].paths).toHaveLength(2);
  });
});
