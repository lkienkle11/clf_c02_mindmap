<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { AttemptRow } from '@/persistence';
  import { cn } from '@/ui/cn';
  import { formatDateTime, formatPct } from './format';

  interface Props {
    /** Already in display order. */
    attempts: AttemptRow[];
    topicName: (topicId: string | null) => string;
    onopen: (attempt: AttemptRow) => void;
  }

  let { attempts, topicName, onopen }: Props = $props();

  const i18n = getI18n();
  const locale = $derived(i18n.locale);
</script>

<div class="overflow-x-auto">
  <table aria-label={i18n.t('history.attempts.title')} class="w-full text-left text-sm">
    <thead>
      <tr class="border-b border-border">
        <th scope="col" class="px-2 py-2">{i18n.t('history.col.date')}</th>
        <th scope="col" class="px-2 py-2">{i18n.t('history.col.topic')}</th>
        <th scope="col" class="px-2 py-2">{i18n.t('history.col.mode')}</th>
        <th scope="col" class="px-2 py-2">{i18n.t('history.col.score')}</th>
        <th scope="col" class="px-2 py-2">{i18n.t('history.col.result')}</th>
      </tr>
    </thead>
    <tbody>
      {#each attempts as a (a.id)}
        <tr class="border-b border-border-subtle">
          <td class="px-2 py-1">
            <button
              type="button"
              class="min-h-11 cursor-pointer rounded-lg px-2 text-left font-medium text-primary underline hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              onclick={() => onopen(a)}
            >{formatDateTime(a.submittedAt ?? a.startedAt, locale)}</button>
          </td>
          <td class="px-2 py-1">
            {a.kind === 'checkpoint' && a.groupIndex !== null
              ? i18n.t('history.checkpointName', { group: a.groupIndex })
              : topicName(a.topicId)}
          </td>
          <td class="px-2 py-1">{i18n.t(`history.kind.${a.kind}`)}</td>
          <td class="px-2 py-1 tabular-nums">{a.scorePct === null ? '' : formatPct(a.scorePct, locale)}</td>
          <td class={cn('px-2 py-1 font-medium', a.passed ? 'text-leaf-done-ink' : 'text-danger')}>
            {#if a.kind === 'practice' || a.kind === 'checkpoint'}{a.passed ? `✓ ${i18n.t('history.passed')}` : `✗ ${i18n.t('history.failed')}`}{/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
