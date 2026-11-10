import type { Locale } from '@/i18n/i18n.svelte';

export function formatDateTime(at: number, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(at);
}
