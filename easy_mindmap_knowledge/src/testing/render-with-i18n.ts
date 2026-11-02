import { render } from '@testing-library/svelte';
import type { Component } from 'svelte';
import { createI18n } from '@/i18n/i18n.svelte';
import type { Locale } from '@/i18n/i18n.svelte';
import I18nHost from './I18nHost.svelte';

/** Test-only: renders `component` inside an i18n context. */
export function renderWithI18n(component: Component<any>, props: Record<string, unknown>, locale: Locale = 'en') {
  const i18n = createI18n(locale);
  return { i18n, ...render(I18nHost, { props: { i18n, component, props } }) };
}
