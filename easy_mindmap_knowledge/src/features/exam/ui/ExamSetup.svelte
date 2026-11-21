<script lang="ts">
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { PracticeSession } from '@/features/practice';
  import { passThresholdPct } from '@/features/practice';
  import { HELP_USES } from '@/features/practice';
  import Button from '@/ui/Button.svelte';
  import StickyActionBar from '@/ui/StickyActionBar.svelte';
  import { ExamNotAvailableError } from '../errors';
  import { CAPSTONE_SCORED_COUNT, CAPSTONE_UNSCORED_COUNT, EXAM_MINUTES, EXAM_MINUTES_EXTRA, EXAM_QUESTION_COUNT } from '../logic/exam-config';
  import { checkpointState } from '../logic/gates';
  import { checkpointGroups } from '../logic/groups';
  import { loadExamOptions } from '../options';
  import { startCapstoneExam, startCheckpoint } from '../start-exam';

  interface Props {
    services: Services;
    appState: AppState;
    /** Exactly one of groupIndex and capstoneTopicId is non-null. */
    groupIndex: number | null;
    capstoneTopicId: string | null;
    onstarted: (session: PracticeSession) => void;
  }

  let { services, appState, groupIndex, capstoneTopicId, onstarted }: Props = $props();

  const i18n = getI18n();
  let extraTime = $state(false);
  let help = $state(false);
  let loaded = $state(false);
  let busy = $state(false);
  let message = $state<string | null>(null);

  const group = $derived(groupIndex === null ? undefined : checkpointGroups(services.catalog.topics).find((g) => g.index === groupIndex));
  const minutes = $derived(extraTime ? EXAM_MINUTES_EXTRA : EXAM_MINUTES);
  const threshold = $derived(passThresholdPct(capstoneTopicId));

  // The reason the exam cannot start yet, or null when it can.
  const lockedReason = $derived.by(() => {
    if (capstoneTopicId !== null) {
      const status = appState.statuses.get(capstoneTopicId);
      return status === 'current' || status === 'done' ? null : i18n.t(capstoneTopicId === 'capstone-exam-1' ? 'exam.setup.lockedExam1' : 'exam.setup.lockedExam2');
    }
    if (!group) return i18n.t('exam.setup.notAvailable');
    if (checkpointState(group, appState.completed, appState.passedGroups) !== 'locked') return null;
    const missing = group.topicIds
      .filter((id) => !appState.completed.has(id))
      .map((id) => services.catalog.topic(id).title[i18n.locale]);
    return i18n.t('exam.setup.lockedGroup', { topics: missing.join(', ') });
  });
  const alreadyPassed = $derived(capstoneTopicId !== null ? appState.completed.has(capstoneTopicId) : group !== undefined && appState.passedGroups.has(group.index));

  $effect(() => {
    let cancelled = false;
    loadExamOptions(services.repos.settings)
      .catch(() => null)
      .then((o) => {
        if (cancelled) return;
        if (o) extraTime = o.extraTime;
        loaded = true;
      });
    return () => { cancelled = true; };
  });

  async function start(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    if (busy || lockedReason !== null) return;
    busy = true;
    message = null;
    try {
      const options = { extraTime };
      const refresh = () => appState.refresh();
      if (groupIndex === null && capstoneTopicId !== 'capstone-exam-1' && capstoneTopicId !== 'capstone-exam-2') {
        throw new ExamNotAvailableError('unknown capstone exam');
      }
      const session = groupIndex === null
        ? await startCapstoneExam(services, capstoneTopicId as 'capstone-exam-1' | 'capstone-exam-2', options, refresh)
        : await startCheckpoint(services, groupIndex, options, refresh, help);
      onstarted(session);
    } catch (error) {
      message = i18n.t(error instanceof ExamNotAvailableError ? 'exam.setup.notAvailable' : 'exam.setup.startFailed');
    } finally {
      busy = false;
    }
  }

  const reasonId = 'exam-locked-reason';
</script>

<form class="mx-auto flex max-w-2xl flex-col gap-6 p-6 pb-24" onsubmit={start}>
  <div>
    <Button variant="ghost" onclick={() => appState.open({ view: 'tree' })}><span aria-hidden="true">←</span> {i18n.t('exam.setup.back')}</Button>
  </div>
  <header>
    <h1 class="text-2xl font-semibold">
      {capstoneTopicId !== null ? services.catalog.topic(capstoneTopicId).title[i18n.locale] : i18n.t('exam.setup.checkpointTitle', { n: groupIndex! })}
    </h1>
  </header>

  <section aria-labelledby="exam-rules-title" class="flex flex-col gap-2">
    <h2 id="exam-rules-title" class="text-lg font-medium">{i18n.t('exam.setup.rulesLegend')}</h2>
    <ul class="list-disc pl-6">
      <li>{capstoneTopicId !== null
        ? i18n.t('exam.setup.ruleCapstoneQuestions', { count: EXAM_QUESTION_COUNT, unscored: CAPSTONE_UNSCORED_COUNT })
        : i18n.t('exam.setup.ruleQuestions', { count: EXAM_QUESTION_COUNT })}</li>
      <li>{i18n.t('exam.setup.ruleTime', { minutes })}</li>
      {#if capstoneTopicId !== null}
        <li>{i18n.t('exam.setup.capstonePassMark', { threshold, count: CAPSTONE_SCORED_COUNT, correct: Math.ceil(threshold * CAPSTONE_SCORED_COUNT / 100) })}</li>
      {/if}
      <li>{i18n.t('exam.setup.ruleNoReview')}</li>
      <li>{capstoneTopicId === null && help ? i18n.t('exam.setup.ruleAnswersHelp', { max: HELP_USES }) : i18n.t('exam.setup.ruleAnswers')}</li>
      <li>{i18n.t('exam.setup.ruleOneSitting')}</li>
    </ul>
  </section>

  <label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-1 hover:bg-muted">
    <input class="size-5" type="checkbox" bind:checked={extraTime} />{i18n.t('exam.setup.extraTime')}
  </label>

  {#if capstoneTopicId === null}
    <label class="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-1 hover:bg-muted">
      <input class="size-5" type="checkbox" bind:checked={help} />
      <span>{i18n.t('exam.setup.help')} <span class="text-sm text-muted-foreground">{i18n.t('exam.setup.helpHint', { max: HELP_USES })}</span></span>
    </label>
  {/if}

  {#if lockedReason}
    <p id={reasonId} class="rounded-lg border border-border p-3 text-muted-foreground">{lockedReason}</p>
  {:else if alreadyPassed}
    <p class="text-leaf-done-ink">{i18n.t(capstoneTopicId !== null ? 'exam.setup.examPassed' : 'exam.setup.passed')}</p>
  {/if}

  {#if message}
    <p role="alert" class="rounded-lg border border-danger p-3 text-danger">{message}</p>
  {/if}

  <StickyActionBar>
    <Button type="submit" disabled={!loaded || busy || lockedReason !== null} aria-describedby={lockedReason ? reasonId : undefined}>
      {i18n.t('exam.setup.start')}
    </Button>
  </StickyActionBar>
</form>
