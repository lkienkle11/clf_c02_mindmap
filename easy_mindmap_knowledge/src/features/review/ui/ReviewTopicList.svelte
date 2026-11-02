<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import { cn } from '@/ui/cn';
  import type { TopicReviewSummary, Urgency } from '../logic/review-summary';
  import { countText } from './plural';

  interface Props {
    summaries: TopicReviewSummary[];
    titleOf: (topicId: string) => string;
    /** Topic ids ticked for a Custom review. */
    ticked: string[];
    /** Fires when a checkbox is toggled (ticking is a clear wish for a Custom review). */
    ontoggle?: () => void;
    /** How many rows show before the rest hide behind the disclosure. */
    limit?: number;
  }

  let { summaries, titleOf, ticked = $bindable(), ontoggle, limit = 5 }: Props = $props();

  const i18n = getI18n();
  const uid = $props.id();
  let expanded = $state(false);
  const shown = $derived(expanded ? summaries : summaries.slice(0, limit));
  const hidden = $derived(summaries.length - limit);

  // Icon AND word, so the level never relies on colour alone.
  const urgency: Record<Urgency, { icon: string; key: string; tone: string }> = {
    urgent: { icon: '🔴', key: 'review.urgent', tone: 'text-danger' },
    soon: { icon: '🟡', key: 'review.soon', tone: 'text-leaf-review-ink' },
  };

  const since = (days: number): string => (days === 0 ? i18n.t('review.dueToday') : countText(i18n, 'review.sinceReview', days));
</script>

<ul id="{uid}-list" aria-label={i18n.t('review.topicsLegend')} class="flex flex-col gap-2">
  {#each shown as s (s.topicId)}
    {@const level = urgency[s.urgency]}
    <li>
      <label class="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-border-subtle p-3 has-[:checked]:border-primary">
        <input type="checkbox" class="mt-1 size-5 shrink-0 accent-primary" value={s.topicId} bind:group={ticked} onchange={() => ontoggle?.()} aria-labelledby="{uid}-{s.topicId}" />
        <span class="flex min-w-0 flex-1 flex-col gap-0.5">
          <span id="{uid}-{s.topicId}" class="font-medium">{titleOf(s.topicId)}</span>
          <span class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm">
            <span class={cn('inline-flex items-center gap-1 font-medium', level.tone)}>
              <span aria-hidden="true">{level.icon}</span><span>{i18n.t(level.key)}</span>
            </span>
            <span class="text-muted-foreground">{since(s.daysOverdue)}</span>
            <span class="text-muted-foreground">{countText(i18n, 'review.cardsDue', s.dueCount)}</span>
          </span>
        </span>
      </label>
    </li>
  {/each}
</ul>

{#if hidden > 0}
  <Button variant="ghost" class="mt-2" aria-expanded={expanded} aria-controls="{uid}-list" onclick={() => (expanded = !expanded)}>
    {expanded ? i18n.t('review.fewerTopics') : countText(i18n, 'review.moreTopics', hidden)}
  </Button>
{/if}
