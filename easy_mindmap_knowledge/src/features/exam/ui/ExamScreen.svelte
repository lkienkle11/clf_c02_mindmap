<script lang="ts">
  import { untrack } from 'svelte';
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import { PracticeResult, PracticeSessionView } from '@/features/practice';
  import type { PracticeSession } from '@/features/practice';
  import ExamBreakdown from './ExamBreakdown.svelte';
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

  const i18n = getI18n();

  // `chosen` overrides the prop once this screen starts or resets a session itself.
  let chosen = $state.raw<{ session: PracticeSession | null } | null>(null);
  const session = $derived(chosen ? chosen.session : initialSession);
  const timedOut = $derived(session?.submitReason === 'timeout');

  // Whether the group already had a passed exam when the CURRENT session began: only a first pass unlocks the next group.
  const passedGroupBefore = (): boolean => groupIndex !== null && appState.passedGroups.has(groupIndex);
  let passedBefore = $state(untrack(passedGroupBefore));
  const notice = $derived(
    groupIndex !== null && session?.result?.passed === true && !passedBefore ? i18n.t('exam.result.groupUnlocked') : undefined,
  );

  function started(s: PracticeSession): void {
    passedBefore = passedGroupBefore();
    chosen = { session: s };
  }
</script>

{#if !session}
  <ExamSetup {services} {appState} {groupIndex} onstarted={started} />
{:else if session.submitted && session.result}
  <PracticeResult
    {services}
    result={session.result}
    {timedOut}
    mode="exam"
    {notice}
    onback={() => appState.open({ view: 'tree' })}
    canRetry
    onretry={() => (chosen = { session: null })}
  />
  <div class="mx-auto max-w-3xl px-6 pb-6">
    <ExamBreakdown {services} items={session.result.items} />
  </div>
{:else}
  {#key session.attemptId}
    <PracticeSessionView {services} {appState} {session} hideKnowledge />
  {/key}
{/if}
