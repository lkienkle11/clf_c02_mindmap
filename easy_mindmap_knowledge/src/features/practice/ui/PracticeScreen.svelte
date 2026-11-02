<script lang="ts">
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import type { PracticeSession } from '../session.svelte';
  import PracticeResult from './PracticeResult.svelte';
  import PracticeSessionView from './PracticeSessionView.svelte';
  import PracticeSetup from './PracticeSetup.svelte';

  interface Props {
    services: Services;
    appState: AppState;
    topicId: string;
    /** A session created elsewhere, e.g. restored by the resume prompt. */
    initialSession?: PracticeSession | null;
  }

  let { services, appState, topicId, initialSession = null }: Props = $props();

  // `chosen` overrides the prop once this screen starts or resets a session itself.
  let chosen = $state.raw<{ session: PracticeSession | null; manual: boolean } | null>(null);
  const session = $derived(chosen ? chosen.session : initialSession);
  // Without a manual submit, a submitted session ended by the clock (or by auto-submit on resume).
  const timedOut = $derived(session?.submitted === true && !chosen?.manual);
  const canRetry = $derived(services.catalog.topics.some((t) => t.id === topicId));
</script>

{#if !session}
  <PracticeSetup {services} {appState} {topicId} onstarted={(s) => (chosen = { session: s, manual: false })} />
{:else if session.submitted && session.result}
  <PracticeResult
    {services}
    result={session.result}
    {timedOut}
    {canRetry}
    onback={() => appState.open({ view: 'tree' })}
    onretry={() => (chosen = { session: null, manual: false })}
  />
{:else}
  {#key session.attemptId}
    <PracticeSessionView {services} {appState} {session} onmanual={() => (chosen = { session, manual: true })} />
  {/key}
{/if}
