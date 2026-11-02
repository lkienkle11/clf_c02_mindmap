import { describe, it, expect } from 'vitest';
import { I18n, createI18n } from './i18n.svelte';
import en from './en.json';
import vi from './vi.json';

describe('I18n', () => {
  it('replaces {name} params', () => {
    const i = createI18n('en');
    i.messages.en['x'] = 'Got {n} of {m} {n}';
    expect(i.t('x', { n: 3, m: 'ten' })).toBe('Got 3 of ten 3');
  });
  it('returns the key when missing and never throws', () => {
    const i = new I18n('en');
    expect(i.t('no.such.key')).toBe('no.such.key');
  });
  it('switches locale', () => {
    const i = createI18n('en');
    expect(i.t('common.close')).toBe('Close');
    i.setLocale('vi');
    expect(i.locale).toBe('vi');
    expect(i.t('common.close')).toBe('Đóng');
  });
  it('interpolates real lockedHint', () => {
    const i = createI18n('vi');
    expect(i.t('mindmap.lockedHint', { topic: 'EC2' })).toBe('Cần đạt trên 80% ở EC2 để mở');
  });
  it('en and vi have identical key sets', () => {
    expect(Object.keys(vi).sort()).toEqual(Object.keys(en).sort());
  });
});
