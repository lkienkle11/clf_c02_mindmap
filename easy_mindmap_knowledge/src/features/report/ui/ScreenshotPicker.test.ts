import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { PNG_BYTES } from '@/testing/report-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import { CaptureError } from '../capture';
import ScreenshotPicker from './ScreenshotPicker.svelte';

function mount(over: Record<string, unknown> = {}) {
  const el = document.createElement('div');
  const target = vi.fn(() => el as HTMLElement | null);
  const capture = vi.fn(async (_el: HTMLElement) => PNG_BYTES);
  const view = renderWithI18n(ScreenshotPicker, { target, capture, image: null, ...over });
  return { el, target, capture, unmount: view.unmount };
}

describe('ScreenshotPicker', () => {
  it('offers a capture button and no thumbnail at first', () => {
    mount();
    expect(screen.getByRole('button', { name: 'Take screenshot' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
  });
  it('captures the target element and shows a data: URL thumbnail with delete and retake', async () => {
    const { el, capture } = mount();
    await userEvent.click(screen.getByRole('button', { name: 'Take screenshot' }));
    const img = await screen.findByRole('img', { name: 'Screenshot preview' });
    expect(capture).toHaveBeenCalledWith(el);
    expect(img.getAttribute('src')).toMatch(/^data:image\/png;base64,/);
    expect(screen.getByRole('button', { name: 'Retake' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove screenshot' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Take screenshot' })).toBeNull();
  });
  it('retake captures again; delete returns to the capture button', async () => {
    const { capture } = mount({ image: PNG_BYTES });
    await userEvent.click(screen.getByRole('button', { name: 'Retake' }));
    await waitFor(() => expect(capture).toHaveBeenCalledTimes(1));
    await userEvent.click(screen.getByRole('button', { name: 'Remove screenshot' }));
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByRole('button', { name: 'Take screenshot' })).toBeInTheDocument();
  });
  it('shows an inline alert when capture fails, and the picker keeps working', async () => {
    const capture = vi.fn().mockRejectedValueOnce(new CaptureError(new Error('boom'))).mockResolvedValue(PNG_BYTES);
    mount({ capture });
    await userEvent.click(screen.getByRole('button', { name: 'Take screenshot' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/still submit/i);
    expect(screen.queryByRole('img')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Take screenshot' }));
    expect(await screen.findByRole('img')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('shows the alert when the target is gone', async () => {
    mount({ target: () => null });
    await userEvent.click(screen.getByRole('button', { name: 'Take screenshot' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('moves focus to Retake after a capture and back to the capture button after Remove', async () => {
    mount();
    await userEvent.click(screen.getByRole('button', { name: 'Take screenshot' }));
    const retake = await screen.findByRole('button', { name: 'Retake' });
    await waitFor(() => expect(document.activeElement).toBe(retake));
    await userEvent.click(screen.getByRole('button', { name: 'Remove screenshot' }));
    const take = await screen.findByRole('button', { name: 'Take screenshot' });
    await waitFor(() => expect(document.activeElement).toBe(take));
  });
  it('keeps focus on the capture button when the capture fails', async () => {
    mount({ capture: vi.fn().mockRejectedValue(new CaptureError(new Error('boom'))) });
    await userEvent.click(screen.getByRole('button', { name: 'Take screenshot' }));
    await screen.findByRole('alert');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Take screenshot' }));
  });
  it('ignores a capture that finishes after the picker is gone', async () => {
    let finish!: (b: Uint8Array) => void;
    const capture = vi.fn(() => new Promise<Uint8Array>((r) => (finish = r)));
    const { unmount } = mount({ capture });
    await userEvent.click(screen.getByRole('button', { name: 'Take screenshot' }));
    unmount();
    finish(PNG_BYTES);
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByRole('img')).toBeNull();
  });
});
