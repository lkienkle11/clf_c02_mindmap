import { describe, expect, it, vi } from 'vitest';
import { toBlob } from 'html-to-image';
import { CaptureError, captureFilter, captureFrame } from './capture';
import type { Renderer } from './capture';

vi.mock('html-to-image', () => ({ toBlob: vi.fn() }));

/** Resolves to the error that `p` rejects with; fails the test if `p` resolves. */
async function rejection(p: Promise<unknown>): Promise<unknown> {
  try {
    await p;
  } catch (e) {
    return e;
  }
  throw new Error('expected the promise to reject');
}

describe('captureFrame with an injected renderer', () => {
  it('returns the bytes of the blob the renderer produced', async () => {
    const el = document.createElement('div');
    const render: Renderer = async () => new Blob([new Uint8Array([7, 8, 9])], { type: 'image/png' });
    await expect(captureFrame(el, render)).resolves.toEqual(new Uint8Array([7, 8, 9]));
  });

  it('hands the element to the renderer', async () => {
    const el = document.createElement('div');
    const render = vi.fn<Renderer>(async () => new Blob([new Uint8Array([1])]));
    await captureFrame(el, render);
    expect(render).toHaveBeenCalledWith(el);
  });

  it('wraps a rejected render in CaptureError and keeps the original as cause', async () => {
    const original = new Error('webview refused');
    const render: Renderer = () => Promise.reject(original);
    const err = await rejection(captureFrame(document.createElement('div'), render));
    expect(err).toBeInstanceOf(CaptureError);
    expect((err as CaptureError).cause).toBe(original);
  });

  it('throws CaptureError when the renderer returns null', async () => {
    const render: Renderer = async () => null;
    const err = await rejection(captureFrame(document.createElement('div'), render));
    expect(err).toBeInstanceOf(CaptureError);
  });

  it('throws CaptureError when the renderer returns an empty blob', async () => {
    const render: Renderer = async () => new Blob([]);
    const err = await rejection(captureFrame(document.createElement('div'), render));
    expect(err).toBeInstanceOf(CaptureError);
  });
});

describe('captureFilter', () => {
  it('excludes an element marked data-report-ignore', () => {
    const dialog = document.createElement('div');
    dialog.setAttribute('data-report-ignore', '');
    expect(captureFilter(dialog)).toBe(false);
  });

  it('keeps a normal element', () => {
    expect(captureFilter(document.createElement('section'))).toBe(true);
  });

  it('keeps a text node', () => {
    expect(captureFilter(document.createTextNode('Question 12'))).toBe(true);
  });
});

describe('default renderer', () => {
  it('calls html-to-image at pixelRatio 1 with captureFilter', async () => {
    vi.mocked(toBlob).mockResolvedValueOnce(new Blob([new Uint8Array([1])]));
    const el = document.createElement('div');
    await captureFrame(el);
    expect(toBlob).toHaveBeenCalledWith(el, { pixelRatio: 1, filter: captureFilter });
  });
});
