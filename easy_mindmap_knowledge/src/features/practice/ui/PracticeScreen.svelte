<script lang="ts">
  import { untrack } from 'svelte';
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
  let chosen = $state.raw<{ session: PracticeSession | null } | null>(null);
  const session = $derived(chosen ? chosen.session : initialSession);
  const timedOut = $derived(session?.submitReason === 'timeout');
  const canRetry = $derived(services.catalog.topics.some((t) => t.id === topicId));

  // Whether the topic was already finished when the CURRENT session began: only a first pass of a
  // non-final topic unlocks the next one. Re-read each time this screen starts a new session.
  const isLastTopic = $derived(services.catalog.topics.at(-1)?.id === topicId);
  let doneBefore = $state(untrack(() => appState.completed.has(topicId)));
  const unlocked = $derived(!doneBefore && !isLastTopic);

  function started(s: PracticeSession): void {
    doneBefore = appState.completed.has(topicId);
    chosen = { session: s };
  }
</script>

{#if !session}
  <PracticeSetup {services} {appState} {topicId} onstarted={started} />
{:else if session.submitted && session.result}
  <PracticeResult
    {services}
    result={session.result}
    {timedOut}
    {canRetry}
    {unlocked}
    onback={() => appState.open({ view: 'tree' })}
    onretry={() => (chosen = { session: null })}
  />
{:else}
  {#key session.attemptId}
    <PracticeSessionView {services} {appState} {session} />
  {/key}
{/if}
