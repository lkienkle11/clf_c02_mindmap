<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { ReportFilters } from '../logic/report-query';
  import { REPORT_STATUSES, REPORT_TYPES, STATUS_KEY, TYPE_KEY } from './labels';

  interface Props {
    filters: ReportFilters;
    onchange: (next: ReportFilters) => void;
  }

  let { filters, onchange }: Props = $props();

  const i18n = getI18n();
  const uid = $props.id();
  const rangeInvalid = $derived(filters.from !== '' && filters.to !== '' && filters.from > filters.to);
  const control =
    'min-h-11 rounded-lg border border-border bg-surface px-3 text-surface-foreground focus-visible:outline-2 focus-visible:outline-ring';
</script>

<form class="flex flex-wrap items-end gap-3" onsubmit={(e) => e.preventDefault()}>
  <div class="flex flex-col gap-1">
    <label for="{uid}-type" class="text-sm font-medium">{i18n.t('report.filter.type')}</label>
    <select
      id="{uid}-type"
      class={control}
      value={filters.type}
      onchange={(e) => onchange({ ...filters, type: e.currentTarget.value as ReportFilters['type'] })}
    >
      <option value="">{i18n.t('report.filter.all')}</option>
      {#each REPORT_TYPES as t (t)}
        <option value={t}>{i18n.t(TYPE_KEY[t])}</option>
      {/each}
    </select>
  </div>
  <div class="flex flex-col gap-1">
    <label for="{uid}-status" class="text-sm font-medium">{i18n.t('report.filter.status')}</label>
    <select
      id="{uid}-status"
      class={control}
      value={filters.status}
      onchange={(e) => onchange({ ...filters, status: e.currentTarget.value as ReportFilters['status'] })}
    >
      <option value="">{i18n.t('report.filter.all')}</option>
      {#each REPORT_STATUSES as s (s)}
        <option value={s}>{i18n.t(STATUS_KEY[s])}</option>
      {/each}
    </select>
  </div>
  <div class="flex flex-col gap-1">
    <label for="{uid}-from" class="text-sm font-medium">{i18n.t('report.filter.from')}</label>
    <input id="{uid}-from" type="date" class={control} aria-describedby={rangeInvalid ? `${uid}-range` : undefined} value={filters.from} onchange={(e) => onchange({ ...filters, from: e.currentTarget.value })} />
  </div>
  <div class="flex flex-col gap-1">
    <label for="{uid}-to" class="text-sm font-medium">{i18n.t('report.filter.to')}</label>
    <input id="{uid}-to" type="date" class={control} aria-describedby={rangeInvalid ? `${uid}-range` : undefined} value={filters.to} onchange={(e) => onchange({ ...filters, to: e.currentTarget.value })} />
  </div>
  <div class="flex min-w-48 flex-1 flex-col gap-1">
    <label for="{uid}-text" class="text-sm font-medium">{i18n.t('report.filter.search')}</label>
    <input id="{uid}-text" type="search" class={control} value={filters.text} oninput={(e) => onchange({ ...filters, text: e.currentTarget.value })} />
  </div>
  {#if rangeInvalid}
    <p id="{uid}-range" role="status" class="basis-full text-sm font-medium text-danger">{i18n.t('report.filter.rangeInvalid')}</p>
  {/if}
</form>
