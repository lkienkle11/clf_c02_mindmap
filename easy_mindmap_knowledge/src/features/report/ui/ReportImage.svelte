<script lang="ts">
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import { bytesToDataUrl } from './data-url';

  interface Props {
    services: Services;
    /** Path relative to the app data folder, as stored on the report. */
    path: string;
    /** 1-based, for the alt text. */
    n: number;
  }

  let { services, path, n }: Props = $props();

  const i18n = getI18n();
  // The CSP allows `data:` images only; the type comes from the file bytes, never from the file name.
  const src = $derived(services.reportStorage.readImage(path).then(bytesToDataUrl));
</script>

{#await src}
  <p class="text-sm text-muted-foreground">{i18n.t('common.loading')}</p>
{:then url}
  <img src={url} alt={i18n.t('report.detail.imageAlt', { n })} class="max-h-96 max-w-full rounded-lg border border-border-subtle object-contain" />
{:catch}
  <p class="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">{i18n.t('report.detail.imageMissing', { n })}</p>
{/await}
