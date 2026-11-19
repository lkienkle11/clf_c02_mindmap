<script lang="ts">
  import { untrack } from 'svelte';
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import { PracticeResult, PracticeSessionView, passThresholdPct } from '@/features/practice';
  import type { PracticeSession } from '@/features/practice';
  import ExamBreakdown from './ExamBreakdown.svelte';
  import ExamSetup from './ExamSetup.svelte';
  import { checkpointGroups } from '../logic/groups';
  import { CAPSTONE_SCORED_COUNT } from '../logic/exam-config';

  interface Props {
    services: Services;
    appState: AppState;
    /** Exactly one of groupIndex and capstoneTopicId is non-null. */
    groupIndex: number | null;
    capstoneTopicId: string | null;
    /** A session created elsewhere, e.g. restored by the resume prompt. */
    initialSession?: PracticeSession | null;
  }

  let { services, appState, groupIndex, capstoneTopicId, initialSession = null }: Props = $props();

  const i18n = getI18n();

  // `chosen` overrides the prop once this screen starts or resets a session itself.
  let chosen = $state.raw<{ session: PracticeSession | null } | null>(null);
  const session = $derived(chosen ? chosen.session : initialSession);
  const timedOut = $derived(session?.submitReason === 'timeout');

  // Whether the group already had a passed exam when the CURRENT session began: only a first pass unlocks the next group.
  const passedGroupBefore = (): boolean => capstoneTopicId !== null ? appState.completed.has(capstoneTopicId) : groupIndex !== null && appState.passedGroups.has(groupIndex);
  let passedBefore = $state(untrack(passedGroupBefore));
  // Passing the last group opens the Capstone exam rather than a next group.
  const opensCapstone = $derived(groupIndex !== null && groupIndex === checkpointGroups(services.catalog.topics).length);
  const notice = $derived(
    session?.result?.passed === true && !passedBefore
      ? capstoneTopicId !== null
        ? i18n.t(capstoneTopicId === 'capstone-exam-1' ? 'exam.result.exam2Unlocked' : 'exam.result.summaryUnlocked')
        : i18n.t(opensCapstone ? 'exam.result.capstoneUnlocked' : 'exam.result.groupUnlocked')
      : undefined,
  );
  const passMarkText = $derived(capstoneTopicId !== null
    ? i18n.t('exam.result.passMark', { threshold: passThresholdPct(capstoneTopicId), count: CAPSTONE_SCORED_COUNT })
    : undefined);

  function started(s: PracticeSession): void {
    passedBefore = passedGroupBefore();
    chosen = { session: s };
  }
</script>

{#if !session}
  <ExamSetup {services} {appState} {groupIndex} {capstoneTopicId} onstarted={started} />
{:else if session.submitted && session.result}
  <PracticeResult
    {services}
    attemptId={session.attemptId}
    result={session.result}
    {timedOut}
    mode="exam"
    {notice}
    {passMarkText}
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
