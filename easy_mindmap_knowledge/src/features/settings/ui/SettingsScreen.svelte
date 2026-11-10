<script lang="ts">
  import { version } from '../../../../package.json';
  import type { AppState } from '@/app/app-state.svelte';
  import { SETTING_LOCALE } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { ReportButton } from '@/features/report';
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { Locale } from '@/i18n/i18n.svelte';

  interface Props {
    services: Services;
    appState: AppState;
  }

  let { services }: Props = $props();

  const i18n = getI18n();
  // Native names are never translated.
  const languages: { value: Locale; name: string }[] = [
    { value: 'en', name: 'English' },
    { value: 'vi', name: 'Tiếng Việt' },
  ];
  let failed = $state(false);
  let seq = 0;

  async function choose(value: Locale): Promise<void> {
    const previous = i18n.locale;
    if (value === previous) return;
    const mine = ++seq;
    failed = false;
    i18n.setLocale(value);
    try {
      await services.repos.settings.set(SETTING_LOCALE, value);
    } catch (e) {
      console.error('Could not save the language', e);
      if (mine !== seq) return;
      i18n.setLocale(previous);
      failed = true;
    }
  }
</script>

<section class="mx-auto flex max-w-2xl flex-col gap-6 p-4">
  <h1 class="text-2xl font-semibold">{i18n.t('nav.settings')}</h1>

  <fieldset role="radiogroup" class="flex flex-col gap-2">
    <legend class="mb-2 text-lg font-semibold">{i18n.t('settings.language')}</legend>
    {#each languages as lang (lang.value)}
      <label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border-subtle bg-surface px-3">
        <input
          type="radio"
          name="locale"
          value={lang.value}
          checked={i18n.locale === lang.value}
          class="size-5 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onchange={() => choose(lang.value)}
        />
        <span lang={lang.value}>{lang.name}</span>
      </label>
    {/each}
  </fieldset>

  {#if failed}
    <p role="alert" class="font-medium text-danger">{i18n.t('settings.saveFailed')}</p>
  {/if}

  <ReportButton {services} context={{ type: 'system' }} class="self-start" />

  <p class="text-sm text-muted-foreground">{i18n.t('settings.version', { version })}</p>
</section>
