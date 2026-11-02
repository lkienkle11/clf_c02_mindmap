import { createContext } from 'svelte';
import en from './en.json';
import vi from './vi.json';

export type Locale = 'en' | 'vi';
export type Params = Record<string, string | number>;

export class I18n {
  locale = $state<Locale>('vi');
  messages: Record<Locale, Record<string, string>> = {
    en: { ...en },
    vi: { ...vi },
  };

  constructor(initial: Locale = 'vi') {
    this.locale = initial;
  }

  t(key: string, params?: Params): string {
    const template = this.messages[this.locale]?.[key];
    if (template === undefined) return key;
    if (!params) return template;
    return template.replace(/\{(\w+)\}/g, (m, name: string) =>
      name in params ? String(params[name]) : m,
    );
  }

  setLocale(l: Locale): void {
    this.locale = l;
  }
}

export function createI18n(initial: Locale = 'vi'): I18n {
  return new I18n(initial);
}

export const [getI18n, setI18n] = createContext<I18n>();
