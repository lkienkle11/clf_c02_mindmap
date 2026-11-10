<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import { REPORT_TYPES, STATUS_KEY, TYPE_KEY } from './labels';
  import type { ReportCounts } from './labels';

  let { counts }: { counts: ReportCounts } = $props();

  const i18n = getI18n();
  const uid = $props.id();
  const rows = $derived([
    { id: 'total', label: i18n.t('report.summary.total'), n: counts.total },
    ...REPORT_TYPES.map((t) => ({ id: t, label: i18n.t(TYPE_KEY[t]), n: counts.byType[t] })),
    { id: 'new', label: i18n.t(STATUS_KEY.new), n: counts.newCount },
    { id: 'handled', label: i18n.t(STATUS_KEY.handled), n: counts.total - counts.newCount },
  ]);
</script>

<section aria-labelledby="{uid}-title" class="flex flex-col gap-2">
  <h2 id="{uid}-title" class="text-lg font-semibold">{i18n.t('report.summary.title')}</h2>
  <dl class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
    {#each rows as row (row.id)}
      <div class="rounded-lg border border-border-subtle bg-surface p-3">
        <dt class="text-sm text-muted-foreground">{row.label}</dt>
        <dd class="text-xl font-semibold tabular-nums">{row.n}</dd>
      </div>
    {/each}
  </dl>
</section>
