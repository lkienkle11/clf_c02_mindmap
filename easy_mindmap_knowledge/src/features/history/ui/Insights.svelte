<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import { formatPct } from './format';

  interface Props {
    /** Null hides the section (e.g. while one topic is filtered). */
    weak: { topicId: string; avgPct: number }[] | null;
    /** How many questions were missed at least once under the current filter. */
    missedCount: number;
    topicName: (topicId: string | null) => string;
    onopen: () => void;
  }

  let { weak, missedCount, topicName, onopen }: Props = $props();

  const i18n = getI18n();
  const locale = $derived(i18n.locale);
  const uid = $props.id();
</script>

<div class="flex flex-col gap-6">
  {#if weak}
    <section aria-labelledby="{uid}-weak" class="flex flex-col gap-2">
      <h2 id="{uid}-weak" class="text-xl font-semibold">{i18n.t('history.weak.title')}</h2>
      {#if weak.length === 0}
        <p class="text-muted-foreground">{i18n.t('history.weak.empty')}</p>
      {:else}
        <ul class="flex flex-col gap-2">
          {#each weak as w (w.topicId)}
            <li class="flex items-baseline justify-between gap-3 rounded-lg border border-border-subtle bg-surface p-3">
              <span class="font-medium">{topicName(w.topicId)}</span>
              <span class="text-sm tabular-nums text-muted-foreground">{i18n.t('history.weak.avg', { pct: formatPct(w.avgPct, locale) })}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  {/if}
  <section aria-labelledby="{uid}-missed" class="flex flex-col items-start gap-2">
    <h2 id="{uid}-missed" class="text-xl font-semibold">{i18n.t('history.missed.title')}</h2>
    {#if missedCount === 0}
      <p class="text-muted-foreground">{i18n.t('history.missed.empty')}</p>
    {:else}
      <Button variant="secondary" onclick={onopen}>{i18n.t('history.missed.open', { count: missedCount })}</Button>
    {/if}
  </section>
</div>
