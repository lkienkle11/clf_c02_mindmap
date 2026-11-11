<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { ResultVerdict } from '../logic/result-filter';

  interface Props {
    query: string;
    verdict: ResultVerdict;
    /** How many questions pass the search and the filter, out of `total`. */
    shown: number;
    total: number;
  }

  let { query = $bindable(), verdict = $bindable(), shown, total }: Props = $props();

  const i18n = getI18n();
  const uid = $props.id();
  const control =
    'min-h-11 rounded-lg border border-border bg-surface px-3 text-surface-foreground focus-visible:outline-2 focus-visible:outline-ring';
</script>

<div class="flex flex-col gap-2">
  <form class="flex flex-wrap items-end gap-3" onsubmit={(e) => e.preventDefault()}>
    <div class="flex min-w-48 flex-1 flex-col gap-1">
      <label for="{uid}-search" class="text-sm font-medium">{i18n.t('practice.result.search.label')}</label>
      <input
        id="{uid}-search"
        type="search"
        class={control}
        placeholder={i18n.t('practice.result.search.placeholder')}
        bind:value={query}
      />
    </div>
    <div class="flex flex-col gap-1">
      <label for="{uid}-verdict" class="text-sm font-medium">{i18n.t('practice.result.filter.label')}</label>
      <select id="{uid}-verdict" class={control} bind:value={verdict}>
        <option value="all">{i18n.t('practice.result.filter.all')}</option>
        <option value="correct">{i18n.t('practice.result.filter.correct')}</option>
        <option value="wrong">{i18n.t('practice.result.filter.wrong')}</option>
      </select>
    </div>
  </form>
  <p aria-live="polite" class="text-sm text-muted-foreground tabular-nums">
    {i18n.t('practice.result.search.count', { shown, total })}
  </p>
  {#if shown === 0 && total > 0}
    <p class="rounded-lg border border-border-subtle p-3 text-muted-foreground">{i18n.t('practice.result.search.empty')}</p>
  {/if}
</div>
