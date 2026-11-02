<script lang="ts">
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import Modal from '@/ui/Modal.svelte';
  import type { ReviewMode } from '../logic/build-review-plan';
  import type { TopicReviewSummary } from '../logic/review-summary';
  import ReviewModeChoice from './ReviewModeChoice.svelte';
  import type { Length } from './ReviewModeChoice.svelte';
  import ReviewTopicList from './ReviewTopicList.svelte';
  import { countText } from './plural';

  interface Props {
    services: Services;
    /** Already sorted by how much is forgotten. */
    summaries: TopicReviewSummary[];
    /** 'daily' is the once-a-day prompt; 'manual' is opened from the Review button. */
    variant: 'daily' | 'manual';
    onstart: (mode: ReviewMode) => void;
    onlater: () => void;
    /** "Don't ask today"; only offered in the daily variant. */
    ondismiss?: () => void;
  }

  let { services, summaries, variant, onstart, onlater, ondismiss }: Props = $props();

  const i18n = getI18n();
  let length = $state<Length>('full');
  let ticked = $state<string[]>([]);

  const totalCards = $derived(summaries.reduce((n, s) => n + s.dueCount, 0));
  const needsTicks = $derived(length === 'custom' && ticked.length === 0);
  const hintId = $props.id();

  function start(): void {
    if (length === 'custom') {
      const chosen = new Set(ticked);
      onstart({ kind: 'custom', topicIds: summaries.map((s) => s.topicId).filter((id) => chosen.has(id)) });
    } else {
      onstart({ kind: length });
    }
  }
</script>

<Modal open title={i18n.t(variant === 'daily' ? 'review.dailyTitle' : 'review.manualTitle')} onclose={onlater}>
  <div class="flex flex-col gap-4">
    <p class="font-medium">{countText(i18n, 'review.topicsCount', summaries.length)} · {countText(i18n, 'review.cardsDue', totalCards)}</p>
    <ReviewTopicList {summaries} titleOf={(id) => services.catalog.topic(id).title[i18n.locale]} bind:ticked ontoggle={() => (length = 'custom')} />
    <ReviewModeChoice bind:value={length} />
    {#if needsTicks}
      <p id={hintId} class="text-sm text-muted-foreground">{i18n.t('review.customHint')}</p>
    {/if}
    <div class="flex flex-wrap justify-end gap-3">
      {#if variant === 'daily' && ondismiss}
        <Button variant="ghost" class="mr-auto" onclick={ondismiss}>{i18n.t('review.dismissToday')}</Button>
      {/if}
      <Button variant="secondary" onclick={onlater}>{i18n.t('review.later')}</Button>
      <Button disabled={needsTicks} aria-describedby={needsTicks ? hintId : undefined} onclick={start}>{i18n.t('review.start')}</Button>
    </div>
  </div>
</Modal>
