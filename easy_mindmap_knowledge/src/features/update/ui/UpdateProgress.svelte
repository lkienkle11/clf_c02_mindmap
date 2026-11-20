<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import { formatMegabytes } from '../logic/format';
  import type { UpdateController } from '../logic/update-controller.svelte';

  interface Props {
    controller: UpdateController;
    headingId: string;
  }

  let { controller, headingId }: Props = $props();

  const i18n = getI18n();
  const percent = $derived(controller.percent);
  const progress = $derived(controller.progress);

  /** The visible words that name the progress bar; null before the first chunk arrives. */
  const downloadText = $derived(
    percent !== null
      ? i18n.t('update.downloading', { percent })
      : progress !== null
        ? i18n.t('update.downloadingBytesNoTotal', { done: formatMegabytes(progress.downloaded) })
        : null,
  );
  const bytesText = $derived(
    progress !== null && progress.total !== null
      ? i18n.t('update.downloadingBytes', {
          done: formatMegabytes(progress.downloaded),
          total: formatMegabytes(progress.total),
        })
      : null,
  );
</script>

<div class="flex flex-col gap-1">
  {#if downloadText}
    <p id="{headingId}-progress">{downloadText}</p>
  {/if}
  <progress
    class="h-2 w-full accent-primary"
    max="100"
    value={percent ?? undefined}
    aria-valuenow={percent ?? undefined}
    aria-valuemin="0"
    aria-valuemax="100"
    aria-labelledby={downloadText ? `${headingId}-progress` : undefined}
    aria-label={downloadText ? undefined : i18n.t('update.heading')}
  ></progress>
  {#if bytesText}
    <p class="text-sm text-muted-foreground">{bytesText}</p>
  {/if}
</div>
