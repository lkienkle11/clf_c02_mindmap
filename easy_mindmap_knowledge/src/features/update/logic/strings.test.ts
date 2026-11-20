import { describe, expect, it } from 'vitest';
import en from '../../../i18n/en.json';
import vi from '../../../i18n/vi.json';

const LOCALES: Record<string, Record<string, string>> = { en, vi };

/** Every update string key, with the placeholders its message must contain in each language. */
const UPDATE_KEYS: Record<string, string[]> = {
  'update.heading': [],
  'update.checking': [],
  'update.upToDate': [],
  'update.available': ['version'],
  'update.download': ['size'],
  'update.downloadNoSize': [],
  'update.downloading': ['percent'],
  'update.downloadingBytes': ['done', 'total'],
  'update.downloadingBytesNoTotal': ['done'],
  'update.install': [],
  'update.installing': [],
  'update.retry': [],
  'update.checkFailed': [],
  'update.downloadFailed': [],
  'update.installFailed': [],
  'update.modal.title': [],
  'update.modal.body': ['version', 'size'],
  'update.modal.bodyNoSize': ['version'],
  'update.modal.confirm': [],
  'update.modal.later': [],
  'update.notes.heading': [],
  'update.dot.label': [],
};

describe('update strings', () => {
  it.each(Object.keys(UPDATE_KEYS))('defines %s in both en and vi', (key) => {
    for (const [locale, messages] of Object.entries(LOCALES)) {
      expect(Object.keys(messages), locale).toContain(key);
    }
  });

  it.each(Object.entries(UPDATE_KEYS))(
    '%s has exactly its placeholders in both en and vi',
    (key, placeholders) => {
      for (const [locale, messages] of Object.entries(LOCALES)) {
        const found = [...(messages[key] ?? '').matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
        expect(found, `${locale} ${key}`).toEqual([...placeholders].sort());
      }
    },
  );
});

/** The exact wording the people using the app read, so a reworded string fails a test. */
const WORDING: [locale: string, key: string, text: string][] = [
  ['vi', 'update.modal.body', 'Đã có bản cập nhật {version} ({size}), cập nhật ngay?'],
  ['vi', 'update.modal.confirm', 'Cập nhật ngay'],
  ['vi', 'update.modal.later', 'Để sau'],
  ['vi', 'update.download', 'Tải bản cập nhật ({size})'],
  ['vi', 'update.install', 'Cài đặt bản cập nhật'],
  ['vi', 'update.installing', 'Đang cài đặt…'],
  ['vi', 'update.retry', 'Thử lại'],
  ['en', 'update.modal.confirm', 'Update now'],
  ['en', 'update.modal.later', 'Later'],
  ['en', 'update.download', 'Download update ({size})'],
  ['en', 'update.install', 'Install update'],
  ['vi', 'update.notes.heading', 'Có gì mới'],
  ['en', 'update.notes.heading', "What's new"],
  ['en', 'update.dot.label', 'Update available'],
  ['vi', 'update.dot.label', 'Có bản cập nhật'],
];

describe('update wording', () => {
  it.each(WORDING)('%s %s reads exactly as agreed', (locale, key, text) => {
    expect(LOCALES[locale][key]).toBe(text);
  });
});
