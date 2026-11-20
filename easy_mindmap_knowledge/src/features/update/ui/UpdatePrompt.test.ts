import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import { makeFakeUpdater } from '@/testing/fake-updater';
import type { FakeUpdaterOptions } from '@/testing/fake-updater';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { UpdateController } from '../logic/update-controller.svelte';
import type { DownloadProgress, UpdateInfo, UpdaterPort } from '../logic/updater-port';
import type { PromptStore } from '../logic/prompt-store';
import UpdatePrompt from './UpdatePrompt.svelte';

const INFO: UpdateInfo = { version: '1.2.0', sizeBytes: 12_897_484, notes: '### Tiếng Việt\n- Khởi động nhanh hơn\n' };

function memoryStore(): PromptStore & { saved: string | null } {
  const s = {
    saved: null as string | null,
    get: async () => s.saved,
    set: async (v: string | null) => {
      s.saved = v;
    },
  };
  return s as PromptStore & { saved: string | null };
}

async function setup(o: FakeUpdaterOptions = { update: INFO }, blocked = false) {
  const fake = makeFakeUpdater(o);
  const store = memoryStore();
  const controller = new UpdateController(fake, store);
  await controller.loadPostponed();
  await controller.check();
  // A getter over a reactive set lets a test flip `blocked` after the first render.
  const flags = new SvelteSet<string>(blocked ? ['blocked'] : []);
  const props = {
    controller,
    get blocked() {
      return flags.has('blocked');
    },
  };
  const view = renderWithI18n(UpdatePrompt, props, 'vi');
  await tick();
  return { fake, store, controller, setBlocked: (b: boolean) => (b ? flags.add('blocked') : flags.delete('blocked')), ...view };
}

describe('UpdatePrompt', () => {
  it('opens when promptable and not blocked, showing version, size and notes', async () => {
    await setup();
    expect(screen.getByRole('dialog', { name: 'Đã có bản cập nhật' })).toBeInTheDocument();
    expect(screen.getByText('Đã có bản cập nhật 1.2.0 (12.3 MB), cập nhật ngay?')).toBeInTheDocument();
    expect(screen.getByText('Có gì mới')).toBeInTheDocument();
    expect(screen.getByText('Khởi động nhanh hơn')).toBeInTheDocument();
  });

  it('does not open while blocked and opens when unblocked', async () => {
    const { setBlocked } = await setup({ update: INFO }, true);
    expect(screen.queryByRole('dialog')).toBeNull();
    setBlocked(false);
    await tick();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens only once per run even if the controller becomes available again', async () => {
    const { controller, store } = await setup();
    await userEvent.click(screen.getByRole('button', { name: 'Để sau' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    store.saved = null;
    controller.postponedVersion = null;
    await tick();
    expect(controller.promptable).toBe(true);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Để sau stores the version and closes', async () => {
    const { store, controller } = await setup();
    await userEvent.click(screen.getByRole('button', { name: 'Để sau' }));
    expect(store.saved).toBe('1.2.0');
    expect(controller.postponedVersion).toBe('1.2.0');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closing before download counts as postponing', async () => {
    const { store } = await setup();
    await userEvent.keyboard('{Escape}');
    expect(store.saved).toBe('1.2.0');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Cập nhật ngay shows the progress, then installing', async () => {
    let finish: () => void = () => {};
    let report: (p: DownloadProgress) => void = () => {};
    const port: UpdaterPort = {
      check: async () => INFO,
      download: (onProgress) => {
        report = onProgress;
        return new Promise<void>((r) => {
          finish = r;
        });
      },
      install: () => new Promise<void>(() => {}),
    };
    const controller = new UpdateController(port, memoryStore());
    await controller.loadPostponed();
    await controller.check();
    renderWithI18n(UpdatePrompt, { controller, blocked: false }, 'vi');
    await tick();
    await userEvent.click(screen.getByRole('button', { name: 'Cập nhật ngay' }));
    report({ downloaded: 3_145_728, total: 12_582_912 });
    await tick();
    expect(screen.getByText('Đang tải… 25%')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Để sau' })).toBeNull();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    finish();
    await vi.waitFor(() => expect(controller.status).toBe('installing'));
    expect(screen.getByText('Đang cài đặt…')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('a download error shows the message and a retry and does not postpone', async () => {
    const { fake, store, controller } = await setup({ update: INFO, failDownload: true });
    await userEvent.click(screen.getByRole('button', { name: 'Cập nhật ngay' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Tải không thành công. Hãy thử lại.');
    fake.failDownload = false;
    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(fake.calls.filter((c) => c === 'download')).toHaveLength(2);
    expect(controller.status).toBe('installing');
    expect(store.saved).toBeNull();
  });

  it('closing after an error only hides the prompt', async () => {
    const { store } = await setup({ update: INFO, failDownload: true });
    await userEvent.click(screen.getByRole('button', { name: 'Cập nhật ngay' }));
    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(store.saved).toBeNull();
  });

  it('renders nothing when there is no update', async () => {
    await setup({ update: null });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
