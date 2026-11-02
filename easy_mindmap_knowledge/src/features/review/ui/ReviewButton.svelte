<script lang="ts">
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import type { ReviewMode } from '../logic/build-review-plan';
  import DailyReviewModal from './DailyReviewModal.svelte';

  interface Props {
    services: Services;
    appState: AppState;
    onstart: (mode: ReviewMode) => void;
  }

  let { services, appState, onstart }: Props = $props();

  const i18n = getI18n();
  let open = $state(false);
  const reasonId = $props.id();
  const total = $derived(appState.summaries.reduce((n, s) => n + s.dueCount, 0));
</script>

<!-- Always on the main view (spec 5.1) unless hidden for today; with nothing due it is disabled and says why. -->
{#if appState.reviewButtonVisible}
  {#if appState.summaries.length > 0}
    <Button variant="secondary" onclick={() => (open = true)}>{i18n.t('review.button', { count: total })}</Button>
  {:else}
    <span class="inline-flex items-center gap-2">
      <Button variant="secondary" disabled aria-describedby={reasonId}>{i18n.t('nav.review')}</Button>
      <span id={reasonId} class="text-sm text-muted-foreground">{i18n.t('review.empty')}</span>
    </span>
  {/if}
{/if}

{#if open && appState.summaries.length > 0}
  <DailyReviewModal
    {services}
    summaries={appState.summaries}
    variant="manual"
    onstart={(mode) => {
      open = false;
      onstart(mode);
    }}
    onlater={() => (open = false)}
  />
{/if}
