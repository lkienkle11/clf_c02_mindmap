<script lang="ts">
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import { PracticeResult, PracticeSessionView } from '@/features/practice';
  import Button from '@/ui/Button.svelte';

  interface Props {
    services: Services;
    appState: AppState;
  }

  let { services, appState }: Props = $props();

  const i18n = getI18n();
  const run = $derived(appState.reviewRun);
  const session = $derived(run?.session);
  let busy = $state(false);
  let alert = $state<string | null>(null);

  // No run to show (e.g. the route was opened directly): go home.
  $effect(() => {
    if (!appState.reviewRun) appState.open({ view: 'tree' });
  });
  // Leaving the screen ends the run; nothing keeps a stale one around.
  $effect(() => {
    if (appState.view !== 'review') appState.reviewRun = null;
  });
  $effect(() => () => {
    appState.reviewRun = null;
  });

  async function next(): Promise<void> {
    if (!run || busy) return;
    busy = true;
    alert = null;
    try {
      await run.nextBatch();
    } catch {
      alert = i18n.t('review.nextFailed');
    } finally {
      busy = false;
    }
  }

  async function stop(): Promise<void> {
    if (!run || busy) return;
    busy = true;
    alert = null;
    try {
      await run.stop();
      // Refresh first so the badge and button reflect the batches already finished.
      await appState.refresh().catch(() => {});
      appState.open({ view: 'tree' });
    } catch {
      alert = i18n.t('review.stopFailed');
    } finally {
      busy = false;
    }
  }
</script>

{#if run && session}
  <div class="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-6 pt-6 text-sm text-muted-foreground">
    <p class="tabular-nums">{i18n.t('review.batchProgress', { current: run.batchIndex + 1, total: run.batchCount })}</p>
    {#if session.submitted}
      <p class="tabular-nums">{i18n.t('review.answeredSoFar', { count: run.answeredSoFar })}</p>
    {/if}
  </div>
  {#if alert}
    <p role="alert" class="mx-auto mt-3 max-w-3xl rounded-lg border border-danger p-3 text-danger">{alert}</p>
  {/if}
  {#key session.attemptId}
    {#if session.submitted && session.result}
      <PracticeResult {services} mode="review" result={session.result} onback={() => appState.open({ view: 'tree' })}>
        {#snippet actions()}
          {#if run.finished || run.remainingAfterCurrent === 0}
            <Button onclick={() => appState.open({ view: 'tree' })}>{i18n.t('practice.result.backToMap')}</Button>
          {:else}
            <Button disabled={busy} onclick={next}>{i18n.t('review.nextBatch', { count: run.remainingAfterCurrent })}</Button>
            <Button variant="secondary" disabled={busy} onclick={stop}>{i18n.t('review.stopHere')}</Button>
          {/if}
        {/snippet}
      </PracticeResult>
    {:else}
      <PracticeSessionView {services} {appState} {session} />
    {/if}
  {/key}
{/if}
