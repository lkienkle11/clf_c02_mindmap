import { beforeEach, describe, expect, it, vi } from 'vitest';

const { open } = vi.hoisted(() => ({ open: vi.fn() }));
vi.mock('@tauri-apps/plugin-dialog', () => ({ open }));
vi.mock('@tauri-apps/api/path', () => ({ appDataDir: vi.fn(), dirname: vi.fn(), join: vi.fn() }));
vi.mock('@tauri-apps/plugin-fs', () => ({
  exists: vi.fn(), mkdir: vi.fn(), readFile: vi.fn(), readTextFile: vi.fn(), writeFile: vi.fn(), writeTextFile: vi.fn(),
}));

import { createTauriReportStorage } from './tauri-report-storage';

beforeEach(() => open.mockReset());

describe('createTauriReportStorage.pickExportDir', () => {
  it('asks for a recursive grant so images/ can be created under the picked folder', async () => {
    open.mockResolvedValue('/picked');
    expect(await createTauriReportStorage().pickExportDir()).toBe('/picked');
    expect(open).toHaveBeenCalledWith({ directory: true, multiple: false, recursive: true });
  });

  it('returns null when the picker is cancelled', async () => {
    open.mockResolvedValue(null);
    expect(await createTauriReportStorage().pickExportDir()).toBeNull();
  });
});
