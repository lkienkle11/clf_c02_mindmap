<script lang="ts">
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import type { ReviewLauncher } from '../review-launcher.svelte';
  import DailyReviewModal from './DailyReviewModal.svelte';

  interface Props {
    services: Services;
    appState: AppState;
    launcher: ReviewLauncher;
  }

  let { services, appState, launcher }: Props = $props();

  const i18n = getI18n();
  // Wait for the unfinished-attempt prompt, and never cover a session the user has just resumed.
  const dailyOpen = $derived(
    appState.dailyPromptVisible && appState.view === 'tree' && appState.resumeAttempt === null && appState.summaries.length > 0,
  );
  const notices = {
    empty: 'review.empty',
    startFailed: 'review.startFailed',
    hideFailed: 'review.hideFailed',
  } as const;
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

{#if launcher.notice}
  <div role="status" class="fixed right-4 bottom-4 z-40 flex max-w-sm items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-lg">
    <p>{i18n.t(notices[launcher.notice])}</p>
    <Button variant="ghost" onclick={() => launcher.clearNotice()}>{i18n.t('common.close')}</Button>
  </div>
{/if}
