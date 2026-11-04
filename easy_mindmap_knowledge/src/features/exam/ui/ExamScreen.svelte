<script lang="ts">
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { PracticeResult, PracticeSessionView } from '@/features/practice';
  import type { PracticeSession } from '@/features/practice';
  import ExamSetup from './ExamSetup.svelte';

  interface Props {
    services: Services;
    appState: AppState;
    /** The checkpoint group (1-based); null is the Capstone exam. */
    groupIndex: number | null;
    /** A session created elsewhere, e.g. restored by the resume prompt. */
    initialSession?: PracticeSession | null;
  }

  let { services, appState, groupIndex, initialSession = null }: Props = $props();

  // `chosen` overrides the prop once this screen starts or resets a session itself.
  let chosen = $state.raw<{ session: PracticeSession | null } | null>(null);
  const session = $derived(chosen ? chosen.session : initialSession);
  const timedOut = $derived(session?.submitReason === 'timeout');
</script>

{#if !session}
  <ExamSetup {services} {appState} {groupIndex} onstarted={(s) => (chosen = { session: s })} />
{:else if session.submitted && session.result}
  <PracticeResult
    {services}
    result={session.result}
    {timedOut}
    onback={() => appState.open({ view: 'tree' })}
    canRetry
    onretry={() => (chosen = { session: null })}
  />
{:else}
  {#key session.attemptId}
    <PracticeSessionView {services} {appState} {session} hideKnowledge />
  {/key}
{/if}
