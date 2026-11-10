import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { JPEG_BYTES, PNG_BYTES } from '@/testing/report-env';
import { renderWithI18n } from '@/testing/render-with-i18n';
import ImageUpload from './ImageUpload.svelte';

const png = (name = 'a.png') => new File([PNG_BYTES], name, { type: 'image/png' });
const jpg = (name = 'a.jpg') => new File([JPEG_BYTES], name, { type: 'image/jpeg' });
const input = () => screen.getByLabelText(/Upload images/) as HTMLInputElement;
const upload = (...files: File[]) => fireEvent.change(input(), { target: { files } });
const mount = (images: Uint8Array[] = []) => renderWithI18n(ImageUpload, { images, max: 3 });

describe('ImageUpload', () => {
  it('has a labelled file input restricted to PNG and JPEG', () => {
    mount();
    expect(input()).toHaveAttribute('accept', 'image/png,image/jpeg');
    expect(input()).toHaveAttribute('type', 'file');
  });
  it('adds PNG and JPEG files as data: URL previews with a remove button each', async () => {
    mount();
    await upload(png(), jpg());
    await waitFor(() => expect(screen.getAllByRole('img')).toHaveLength(2));
    const imgs = screen.getAllByRole('img');
    expect(imgs[0].getAttribute('src')).toMatch(/^data:image\/png;base64,/);
    expect(imgs[1].getAttribute('src')).toMatch(/^data:image\/jpeg;base64,/);
    expect(screen.getByRole('button', { name: 'Remove image 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove image 2' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });
  it('rejects the 4th image with an alert and keeps the first three', async () => {
    mount();
    await upload(png('1.png'), png('2.png'), png('3.png'));
    await waitFor(() => expect(screen.getAllByRole('img')).toHaveLength(3));
    await upload(png('4.png'));
    expect(await screen.findByRole('alert')).toHaveTextContent('At most 3 images.');
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });
  it('accepts what fits and rejects the rest of a single oversized selection', async () => {
    mount();
    await upload(png('1.png'), png('2.png'), png('3.png'), png('4.png'), png('5.png'));
    expect(await screen.findByRole('alert')).toHaveTextContent('At most 3 images.');
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });
  it('rejects a non-image by type and by content', async () => {
    mount();
    await upload(new File(['hello'], 'a.txt', { type: 'text/plain' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Only PNG or JPEG images.');
    await upload(new File(['not really a png'], 'fake.png', { type: 'image/png' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Only PNG or JPEG images.'));
    expect(screen.queryByRole('img')).toBeNull();
  });
  it('rejects a file over 5 MB, accepts one of exactly 5 MB', async () => {
    mount();
    const exact = new Uint8Array(5 * 1024 * 1024);
    exact.set(PNG_BYTES);
    await upload(new File([exact], 'ok.png', { type: 'image/png' }));
    await screen.findByRole('img');
    const over = new Uint8Array(5 * 1024 * 1024 + 1);
    over.set(PNG_BYTES);
    await upload(new File([over], 'big.png', { type: 'image/png' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Each image can be at most 5 MB.');
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });
  it('removes an image and clears the alert on the next good upload', async () => {
    mount();
    await upload(png());
    await screen.findByRole('img');
    await userEvent.click(screen.getByRole('button', { name: 'Remove image 1' }));
    expect(screen.queryByRole('img')).toBeNull();
    await upload(new File(['x'], 'a.txt', { type: 'text/plain' }));
    await screen.findByRole('alert');
    await upload(png());
    await screen.findByRole('img');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('re-checks the limit after reading, so overlapping selections never exceed the maximum', async () => {
    mount();
    const slow = (name: string) => {
      let release!: () => void;
      const gate = new Promise<void>((r) => (release = r));
      const file = png(name);
      Object.defineProperty(file, 'arrayBuffer', { value: async () => (await gate, PNG_BYTES.slice().buffer) });
      return { file, release };
    };
    const a = [slow('1.png'), slow('2.png')];
    const b = [slow('3.png'), slow('4.png')];
    await upload(...a.map((x) => x.file));
    await upload(...b.map((x) => x.file));
    for (const x of [...a, ...b]) x.release();
    await waitFor(() => expect(screen.getAllByRole('img')).toHaveLength(3));
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByRole('alert')).toHaveTextContent('At most 3 images.');
  });
  it('moves focus to the file input after removing an image', async () => {
    mount();
    await upload(png());
    await userEvent.click(await screen.findByRole('button', { name: 'Remove image 1' }));
    expect(document.activeElement).toBe(input());
  });
});
