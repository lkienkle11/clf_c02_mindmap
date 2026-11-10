<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { ReportRow } from '@/persistence';
  import Button from '@/ui/Button.svelte';
  import { cn } from '@/ui/cn';
  import { excerpt } from '../logic/report-query';
  import { formatDateTime } from './format';
  import { STATUS_KEY, TYPE_KEY } from './labels';

  interface Props {
    items: ReportRow[];
    /** Why the list is empty: no report exists at all, or the filters match none. */
    emptyKey: 'report.list.none' | 'report.list.empty';
    page: number;
    pages: number;
    selectedId: string | null;
    onselect: (report: ReportRow) => void;
    onpage: (page: number) => void;
  }

  let { items, emptyKey, page, pages, selectedId, onselect, onpage }: Props = $props();

  const i18n = getI18n();
  const referenceOf = (r: ReportRow): string | null => r.questionId ?? r.lessonId ?? r.attemptId;
</script>

<div class="flex flex-col gap-3">
  {#if items.length === 0}
    <p role="status" class="text-muted-foreground">{i18n.t(emptyKey)}</p>
  {:else}
    <ul aria-label={i18n.t('report.list.label')} class="flex flex-col gap-2">
      {#each items as report (report.id)}
        {@const reference = referenceOf(report)}
        <li>
          <button
            type="button"
            aria-current={report.id === selectedId ? 'true' : undefined}
            class={cn(
              'flex min-h-11 w-full cursor-pointer flex-col gap-1 rounded-lg border p-3 text-left transition-colors hover:bg-muted',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
              report.id === selectedId ? 'border-primary bg-muted' : 'border-border-subtle bg-surface',
            )}
            onclick={() => onselect(report)}
          >
            <span class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span class="font-medium text-foreground">{i18n.t(TYPE_KEY[report.type])}</span>
              <span class={cn('rounded-full px-2', report.status === 'new' ? 'bg-leaf-review-soft text-leaf-review-ink' : 'bg-leaf-done-soft text-leaf-done-ink')}>{i18n.t(STATUS_KEY[report.status])}</span>
              <time datetime={new Date(report.createdAt).toISOString()}>{formatDateTime(report.createdAt, i18n.locale)}</time>
              {#if reference}<span class="font-mono">{reference}</span>{/if}
            </span>
            <span class="break-words">{excerpt(report.body, 100)}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
  <div class="flex items-center gap-2">
    <Button variant="secondary" disabled={page <= 1} onclick={() => onpage(page - 1)}>{i18n.t('report.prev')}</Button>
    <span class="text-sm tabular-nums text-muted-foreground" aria-live="polite">{i18n.t('report.page', { page: pages === 0 ? 0 : page, pages })}</span>
    <Button variant="secondary" disabled={page >= pages} onclick={() => onpage(page + 1)}>{i18n.t('report.next')}</Button>
  </div>
</div>
