import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { makeFakeUpdater } from '@/testing/fake-updater';
import type { FakeUpdaterOptions } from '@/testing/fake-updater';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { UpdateController } from '../logic/update-controller.svelte';
import type { DownloadProgress, UpdateInfo, UpdaterPort } from '../logic/updater-port';
import UpdateSection from './UpdateSection.svelte';

const BYTES_12_3_MB = 12_897_484;
const found = (sizeBytes: number | null): UpdateInfo => ({ version: '1.2.0', sizeBytes });

async function mount(o: FakeUpdaterOptions = {}) {
  const fake = makeFakeUpdater(o);
  const controller = new UpdateController(fake);
  await controller.check();
  const view = renderWithI18n(UpdateSection, { controller }, 'vi');
  return { fake, controller, ...view };
}

/** A port whose download stays open until the test lets it finish, so progress can be watched. */
function gatedUpdater(info: UpdateInfo) {
  let report: (p: DownloadProgress) => void = () => {};
  let finish: () => void = () => {};
  const port: UpdaterPort = {
    check: async () => info,
    download: (onProgress) => {
      report = onProgress;
      return new Promise<void>((resolve) => {
        finish = resolve;
      });
    },
    install: async () => {},
  };
  return { port, report: (p: DownloadProgress) => report(p), finish: () => finish() };
}

describe('UpdateSection', () => {
  it('shows the update heading and the found version', async () => {
    await mount({ update: found(null) });
    expect(screen.getByRole('heading', { name: 'Cập nhật' })).toBeInTheDocument();
    expect(screen.getByText('Đã có phiên bản 1.2.0.')).toBeInTheDocument();
  });

  it('says so when the app is up to date', async () => {
    await mount({ update: null });
    expect(screen.getByText('Bạn đang dùng bản mới nhất.')).toBeInTheDocument();
  });

  it('shows no size text when the size is unknown', async () => {
    await mount({ update: found(null) });
    const button = screen.getByRole('button', { name: 'Tải bản cập nhật' });
    expect(button).toHaveTextContent(/^Tải bản cập nhật$/);
    expect(screen.queryByText(/MB/)).toBeNull();
  });

  it('shows the download size in Vietnamese', async () => {
    await mount({ update: found(BYTES_12_3_MB) });
    expect(screen.getByRole('button', { name: 'Tải bản cập nhật (12.3 MB)' })).toBeInTheDocument();
  });

  it('shows a progress bar that follows the downloaded chunks', async () => {
    const gate = gatedUpdater(found(BYTES_12_3_MB));
    const controller = new UpdateController(gate.port);
    await controller.check();
    renderWithI18n(UpdateSection, { controller }, 'vi');
    await userEvent.click(screen.getByRole('button', { name: 'Tải bản cập nhật (12.3 MB)' }));

    gate.report({ downloaded: 3_145_728, total: 12_582_912 });
    await tick();
    const bar = screen.getByRole('progressbar', { name: 'Đang tải… 25%' });
    expect(bar).toHaveAttribute('aria-valuenow', '25');
    expect(screen.getByText('3.0 MB / 12.0 MB')).toBeInTheDocument();

    gate.report({ downloaded: 6_291_456, total: 12_582_912 });
    await tick();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
    gate.finish();
  });

  it('shows an indeterminate bar when the total size is unknown', async () => {
    const gate = gatedUpdater(found(null));
    const controller = new UpdateController(gate.port);
    await controller.check();
    renderWithI18n(UpdateSection, { controller }, 'vi');
    await userEvent.click(screen.getByRole('button', { name: 'Tải bản cập nhật' }));

    expect(screen.getByRole('progressbar')).not.toHaveAttribute('aria-valuenow');
    gate.report({ downloaded: 3_145_728, total: null });
    await tick();
    const bar = screen.getByRole('progressbar', { name: 'Đã tải 3.0 MB' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
    gate.finish();
  });

  it('opens a confirmation with the version and size after the download is ready', async () => {
    await mount({ update: found(BYTES_12_3_MB) });
    await userEvent.click(screen.getByRole('button', { name: 'Tải bản cập nhật (12.3 MB)' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cài đặt bản cập nhật' }));
    const dialog = screen.getByRole('dialog', { name: 'Đã có bản cập nhật' });
    expect(dialog).toHaveTextContent('Đã có bản cập nhật 1.2.0 (12.3 MB), cập nhật ngay?');
  });

  it('leaves the size out of the confirmation when it is unknown', async () => {
    await mount({ update: found(null) });
    await userEvent.click(screen.getByRole('button', { name: 'Tải bản cập nhật' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cài đặt bản cập nhật' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Đã có bản cập nhật 1.2.0, cập nhật ngay?');
  });

  it('closes the confirmation with "Để sau" and keeps the install button', async () => {
    const { controller } = await mount({ update: found(null) });
    await userEvent.click(screen.getByRole('button', { name: 'Tải bản cập nhật' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cài đặt bản cập nhật' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Để sau' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Cài đặt bản cập nhật' })).toBeInTheDocument();
    expect(controller.status).toBe('ready');
  });

  it('closes the confirmation with Escape and keeps the install button', async () => {
    const { controller } = await mount({ update: found(null) });
    await userEvent.click(screen.getByRole('button', { name: 'Tải bản cập nhật' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cài đặt bản cập nhật' }));
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Cài đặt bản cập nhật' })).toBeInTheDocument();
    expect(controller.status).toBe('ready');
  });

  it('installs when the person confirms with "Cập nhật ngay"', async () => {
    const { fake } = await mount({ update: found(null) });
    await userEvent.click(screen.getByRole('button', { name: 'Tải bản cập nhật' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cài đặt bản cập nhật' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cập nhật ngay' }));
    expect(fake.calls).toEqual(['check', 'download', 'install']);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows a disabled "Đang cài đặt…" with an indeterminate bar while installing', async () => {
    const controller = new UpdateController({
      check: async () => found(null),
      download: async () => {},
      install: () => new Promise<void>(() => {}),
    });
    await controller.check();
    renderWithI18n(UpdateSection, { controller }, 'vi');
    await userEvent.click(screen.getByRole('button', { name: 'Tải bản cập nhật' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cài đặt bản cập nhật' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cập nhật ngay' }));
    expect(screen.getByRole('button', { name: 'Đang cài đặt…' })).toBeDisabled();
    expect(screen.getByRole('progressbar', { name: 'Đang cài đặt…' })).not.toHaveAttribute('aria-valuenow');
  });

  it('alerts when the download fails and recovers with "Thử lại"', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { fake } = await mount({ update: found(null), failDownload: true });
    await userEvent.click(screen.getByRole('button', { name: 'Tải bản cập nhật' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Tải không thành công. Hãy thử lại.');
    fake.failDownload = false;
    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByRole('button', { name: 'Cài đặt bản cập nhật' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(fake.calls).toEqual(['check', 'download', 'download']);
    logged.mockRestore();
  });

  it('alerts when the check fails and "Thử lại" checks again', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { fake } = await mount({ failCheck: true });
    expect(screen.getByRole('alert')).toHaveTextContent('Không kiểm tra được bản cập nhật.');
    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(fake.calls).toEqual(['check', 'check']);
    logged.mockRestore();
  });

  it('alerts when the install fails and "Thử lại" installs the downloaded update again', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { fake } = await mount({ update: found(null), failInstall: true });
    await userEvent.click(screen.getByRole('button', { name: 'Tải bản cập nhật' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cài đặt bản cập nhật' }));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cập nhật ngay' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Không cài đặt được bản cập nhật.');
    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(fake.calls).toEqual(['check', 'download', 'install', 'install']);
    logged.mockRestore();
  });

  it('changes the confirmation text when the language switches while it is open', async () => {
    const { i18n } = await mount({ update: found(BYTES_12_3_MB) });
    await userEvent.click(screen.getByRole('button', { name: 'Tải bản cập nhật (12.3 MB)' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cài đặt bản cập nhật' }));
    expect(screen.getByRole('dialog', { name: 'Đã có bản cập nhật' })).toBeInTheDocument();
    i18n.setLocale('en');
    await tick();
    const dialog = screen.getByRole('dialog', { name: 'Update available' });
    expect(dialog).toHaveTextContent('Version 1.2.0 (12.3 MB) is ready. Update now?');
    expect(within(dialog).getByRole('button', { name: 'Later' })).toBeInTheDocument();
  });
});
