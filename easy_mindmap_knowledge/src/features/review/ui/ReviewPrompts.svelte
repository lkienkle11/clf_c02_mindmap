<script lang="ts">
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import type { ReviewLauncher } from '../review-launcher.svelte';
  import DailyReviewModal from './DailyReviewModal.svelte';

  interface Props {
    services: Services;
    appState: AppState;
    launcher: ReviewLauncher;
  }

  let { services, appState, launcher }: Props = $props();

  // Wait for the unfinished-attempt prompt, and never cover a session the user has just resumed.
  const dailyOpen = $derived(
    appState.dailyPromptVisible && appState.view === 'tree' && appState.resumeAttempt === null && appState.summaries.length > 0,
  );
</script>

{#if dailyOpen}
  <DailyReviewModal
    {services}
    summaries={appState.summaries}
    variant="daily"
    onstart={(mode) => {
      appState.dismissDailyPrompt();
      void launcher.start(mode);
    }}
    onlater={() => appState.dismissDailyPrompt()}
    ondismiss={() => {
      appState.dismissDailyPrompt();
      void launcher.dismissToday();
    }}
  />
{/if}

