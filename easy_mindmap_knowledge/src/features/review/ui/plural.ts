import type { I18n } from '@/i18n/i18n.svelte';

/** Picks `${key}.one` for exactly one, `${key}` otherwise; both receive `{count}`. */
export function countText(i18n: I18n, key: string, count: number): string {
  return i18n.t(count === 1 ? `${key}.one` : key, { count });
}
