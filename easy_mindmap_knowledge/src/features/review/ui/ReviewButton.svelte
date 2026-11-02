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
  const total = $derived(appState.summaries.reduce((n, s) => n + s.dueCount, 0));
</script>

{#if appState.reviewButtonVisible}
  <Button variant="secondary" onclick={() => (open = true)}>{i18n.t('review.button', { count: total })}</Button>
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
