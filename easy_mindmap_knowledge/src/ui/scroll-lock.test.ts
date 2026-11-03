import { describe, it, expect, afterEach, vi } from 'vitest';
import { lockScroll } from './scroll-lock';

const root = document.documentElement;

afterEach(() => {
  vi.restoreAllMocks();
  root.style.overflow = '';
  root.style.paddingRight = '';
});

describe('lockScroll', () => {
  it('locks and restores', () => {
    const before = root.style.overflow;
    const un = lockScroll();
    expect(root.style.overflow).toBe('hidden');
    un();
    expect(root.style.overflow).toBe(before);
  });
  it('restores pre-existing inline values', () => {
    root.style.overflow = 'scroll';
    root.style.paddingRight = '3px';
    const un = lockScroll();
    un();
    expect(root.style.overflow).toBe('scroll');
    expect(root.style.paddingRight).toBe('3px');
  });
  it('nested locks', () => {
    const a = lockScroll();
    const b = lockScroll();
    a();
    expect(root.style.overflow).toBe('hidden');
    b();
    expect(root.style.overflow).toBe('');
  });
  it('unlock is idempotent', () => {
    const a = lockScroll();
    const b = lockScroll();
    b();
    b();
    expect(root.style.overflow).toBe('hidden');
    a();
    expect(root.style.overflow).toBe('');
  });
  it('compensates scrollbar', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1015);
    vi.spyOn(root, 'clientWidth', 'get').mockReturnValue(1000);
    const un = lockScroll();
    expect(root.style.paddingRight).toBe('15px');
    un();
    expect(root.style.paddingRight).toBe('');
  });
});
