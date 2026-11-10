import { toBlob } from 'html-to-image';

/** Renders a DOM element to an image. A null result means the render produced nothing. */
export type Renderer = (el: HTMLElement) => Promise<Blob | null>;

/** The frame could not be rendered to an image. The original failure is kept as `cause`. */
export class CaptureError extends Error {
  constructor(cause: unknown) {
    super('Screenshot capture failed', { cause });
    this.name = 'CaptureError';
  }
}

/** Leaves out anything marked data-report-ignore (the report dialog itself) and its children. */
export function captureFilter(node: Node): boolean {
  return !(node instanceof HTMLElement && node.dataset.reportIgnore !== undefined);
}

const defaultRenderer: Renderer = (el) => toBlob(el, { pixelRatio: 1, filter: captureFilter });

/** Renders `el` to a PNG and returns its bytes. Any failure, including an empty image, throws CaptureError. */
export async function captureFrame(el: HTMLElement, render: Renderer = defaultRenderer): Promise<Uint8Array> {
  try {
    const blob = await render(el);
    if (!blob || blob.size === 0) throw new Error('renderer returned no image');
    return new Uint8Array(await blob.arrayBuffer());
  } catch (cause) {
    throw new CaptureError(cause);
  }
}
