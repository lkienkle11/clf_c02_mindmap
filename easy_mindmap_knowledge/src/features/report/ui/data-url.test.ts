import { describe, expect, it } from 'vitest';
import { JPEG_BYTES, PNG_BYTES } from '@/testing/report-env';
import { bytesToDataUrl, detectImageMime } from './data-url';

describe('detectImageMime', () => {
  it('reads PNG and JPEG signatures', () => {
    expect(detectImageMime(PNG_BYTES)).toBe('image/png');
    expect(detectImageMime(JPEG_BYTES)).toBe('image/jpeg');
  });
  it('rejects anything else, including short input', () => {
    expect(detectImageMime(new TextEncoder().encode('hello world'))).toBeNull();
    expect(detectImageMime(new Uint8Array([0x89, 0x50]))).toBeNull();
    expect(detectImageMime(new Uint8Array())).toBeNull();
  });
});

describe('bytesToDataUrl', () => {
  it('builds a data: URL with the detected type (PNG when unknown)', () => {
    expect(bytesToDataUrl(PNG_BYTES)).toBe(`data:image/png;base64,${btoa(String.fromCharCode(...PNG_BYTES))}`);
    expect(bytesToDataUrl(JPEG_BYTES).startsWith('data:image/jpeg;base64,')).toBe(true);
    expect(bytesToDataUrl(new Uint8Array([1])).startsWith('data:image/png;base64,')).toBe(true);
  });
  it('handles large input without overflowing the call stack', () => {
    const big = new Uint8Array(6 * 1024 * 1024);
    big.set(PNG_BYTES);
    const url = bytesToDataUrl(big);
    expect(url.length).toBeGreaterThan(8 * 1024 * 1024);
  });
});
