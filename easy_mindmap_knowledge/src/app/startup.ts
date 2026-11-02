// Plain DOM (no Svelte): these screens must work before, and without, the app mounting.
import { createI18n } from '@/i18n/i18n.svelte';
import type { Locale } from '@/i18n/i18n.svelte';

export interface StartupOptions {
  target: HTMLElement;
  /** Usually `navigator.language`; picks the language of the error screen (the saved one is unknown yet). */
  language: string;
  /** Creates services, loads state and mounts the app into `target` (replacing the loading screen). */
  boot: () => Promise<void>;
  reload: () => void;
}

const systemLocale = (language: string): Locale => (language.toLowerCase().startsWith('vi') ? 'vi' : 'en');

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Neutral, bilingual: the saved language is only known once the database has loaded. */
export function showLoading(target: HTMLElement): void {
  const box = el('main', 'flex min-h-dvh items-center justify-center p-6 text-muted-foreground');
  box.setAttribute('role', 'status');
  box.append(el('span', '', createI18n('en').t('common.loading')), el('span', 'px-2', '·'));
  const vi = el('span', '', createI18n('vi').t('common.loading'));
  vi.lang = 'vi';
  box.append(vi);
  target.replaceChildren(box);
}

export function showStartupError(target: HTMLElement, error: unknown, language: string, reload: () => void): void {
  const locale = systemLocale(language);
  const i18n = createI18n(locale);
  const box = el('main', 'mx-auto flex max-w-xl flex-col items-start gap-4 p-6');
  box.setAttribute('role', 'alert');
  box.lang = locale;
  const button = el('button', [
    'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg px-4 py-2 font-medium',
    'bg-primary text-primary-foreground hover:bg-primary-hover',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  ].join(' '), i18n.t('app.reload'));
  button.type = 'button';
  button.addEventListener('click', () => reload());
  const details = el('details', 'w-full text-sm text-muted-foreground');
  const raw = el('pre', 'mt-2 whitespace-pre-wrap break-words', error instanceof Error ? error.message : String(error));
  raw.lang = 'en';
  details.append(el('summary', 'cursor-pointer', i18n.t('app.loadErrorDetails')), raw);
  box.append(
    el('h1', 'text-2xl font-semibold', i18n.t('app.loadError')),
    el('p', '', i18n.t('app.loadErrorHint')),
    button,
    details,
  );
  target.replaceChildren(box);
}

/** Paints the loading screen first, then boots; any failure becomes a readable, recoverable screen. */
export async function startApp(o: StartupOptions): Promise<void> {
  showLoading(o.target);
  try {
    await o.boot();
  } catch (err) {
    console.error(err);
    showStartupError(o.target, err, o.language, o.reload);
  }
}
