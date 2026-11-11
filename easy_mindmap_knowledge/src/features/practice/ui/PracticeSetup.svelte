<script lang="ts">
  import { untrack } from 'svelte';
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { UnansweredDisplay } from '@/persistence';
  import Button from '@/ui/Button.svelte';
  import { buildPool } from '../logic/pick-questions';
  import { MIN_PRACTICE_QUESTIONS, quickCounts, validateQuestionCount } from '../logic/question-count';
  import { NoQuestionsError } from '../errors';
  import { DEFAULT_PRACTICE_OPTIONS, loadLastOptions } from '../options';
  import { PracticeSession } from '../session.svelte';
  import { limitFromParts } from './time';

  interface Props {
    services: Services;
    appState: AppState;
    topicId: string;
    onstarted: (session: PracticeSession) => void;
  }

  let { services, appState, topicId, onstarted }: Props = $props();

  // Full CLF-C02 pace (65 questions in 90 minutes), used to suggest a time for the chosen count.
  const EXAM_QUESTIONS = 65;
  const EXAM_MINUTES = 90;

  const i18n = getI18n();
  const topic = $derived(services.catalog.topic(topicId));

  let review = $state<'allow' | 'deny'>('deny');
  let timeMode = $state<'set' | 'none'>('none');
  let clock = $state<'freeze' | 'run'>('freeze');
  let onHidden = $state<'freeze' | 'run'>('freeze');
  let onReport = $state<'freeze' | 'run'>('freeze');
  let unanswered = $state<UnansweredDisplay>('reveal');
  let questionInput = $state<number | null>(DEFAULT_PRACTICE_OPTIONS.questionCount);
  let minutes = $state<number | null>(10);
  let seconds = $state<number | null>(0);
  // Once true, the time is never pre-filled again: the user edited it, a saved limit was loaded, or it was pre-filled.
  let timeTouched = $state(false);
  let loaded = $state(false);
  let busy = $state(false);
  let message = $state<string | null>(null);

  const poolSize = $derived(buildPool(services.catalog, topicId).length);
  // A pool below the minimum cannot meet it, so the count is fixed to the whole pool and the control is hidden.
  const fixedCount = $derived(poolSize < MIN_PRACTICE_QUESTIONS);
  const countResult = $derived(fixedCount ? { ok: true as const, count: poolSize } : validateQuestionCount(questionInput, poolSize));
  const countInvalid = $derived(!countResult.ok);
  const chosenCount = $derived(countResult.ok ? countResult.count : null);
  const countErrorId = 'practice-count-error';
  const countMessage = $derived.by(() => {
    if (countResult.ok) return null;
    if (countResult.reason === 'tooFew') return i18n.t('practice.setup.countTooFew', { min: MIN_PRACTICE_QUESTIONS });
    if (countResult.reason === 'tooMany') return i18n.t('practice.setup.countTooMany', { max: poolSize });
    return i18n.t('practice.setup.countNotInteger');
  });

  $effect(() => {
    let cancelled = false;
    loadLastOptions(untrack(() => services.repos.settings))
      .catch(() => null)
      .then((o) => {
        if (cancelled) return;
        if (o) {
          review = o.allowReview ? 'allow' : 'deny';
          clock = o.clockMode;
          onHidden = o.onHidden;
          onReport = o.onReport;
          unanswered = o.unansweredDisplay;
          // A saved count larger than the pool is clamped to it.
          questionInput = Math.min(o.questionCount, poolSize);
          if (o.limitMs !== null) {
            timeMode = 'set';
            timeTouched = true;
            const total = Math.round(o.limitMs / 1000);
            minutes = Math.floor(total / 60);
            seconds = total % 60;
          }
        }
        loaded = true;
      });
    return () => { cancelled = true; };
  });

  /** Quick picks: 'all' means the whole pool. */
  function pick(option: number | 'all'): void {
    questionInput = option === 'all' ? poolSize : option;
  }

  /** Suggests a time once, when the user first switches to "Set a time", unless a time is already in play. */
  function prefillTime(): void {
    if (timeTouched || chosenCount === null) return;
    minutes = Math.ceil((chosenCount * EXAM_MINUTES) / EXAM_QUESTIONS);
    seconds = 0;
    timeTouched = true;
  }

  const limitMs = $derived(timeMode === 'set' ? limitFromParts(minutes, seconds) : null);
  const timeInvalid = $derived(timeMode === 'set' && limitMs === null);
  const errorId = 'practice-time-error';
  const startDescribedBy = $derived([timeInvalid ? errorId : null, countInvalid ? countErrorId : null].filter(Boolean).join(' ') || undefined);

  async function start(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    const count = chosenCount;
    if (busy || timeInvalid || count === null) return;
    busy = true;
    message = null;
    try {
      const session = await PracticeSession.start(
        services,
        topicId,
        // A pool below the minimum saves the minimum; the session clamps the draw to the pool.
        { allowReview: review === 'allow', limitMs, clockMode: clock, onHidden, onReport, unansweredDisplay: unanswered, questionCount: fixedCount ? MIN_PRACTICE_QUESTIONS : count },
        () => appState.refresh(),
      );
      onstarted(session);
    } catch (error) {
      message = i18n.t(error instanceof NoQuestionsError ? 'practice.setup.noQuestions' : 'practice.setup.startFailed');
    } finally {
      busy = false;
    }
  }

  const radio = 'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 py-1 hover:bg-muted';
  const field = 'min-h-11 w-24 rounded-lg border border-border bg-surface px-3 py-2 text-surface-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-danger';
</script>

<form class="mx-auto flex max-w-2xl flex-col gap-6 p-6" onsubmit={start}>
  <!-- The header nav is hidden on the practice route, so the setup stage needs its own way back. -->
  <div>
    <Button variant="ghost" onclick={() => appState.open({ view: 'tree' })}><span aria-hidden="true">←</span> {i18n.t('practice.setup.back')}</Button>
  </div>
  <header>
    <h1 class="text-2xl font-semibold">{i18n.t('nav.practice')}: {topic.title[i18n.locale]}</h1>
    {#if chosenCount !== null}
      <p class="text-muted-foreground">{i18n.t('practice.questionCount', { count: chosenCount })}</p>
    {/if}
  </header>

  {#if !fixedCount}
    <div class="flex flex-col gap-3">
      <label class="flex flex-wrap items-center gap-3">
        <span class="text-lg font-medium">{i18n.t('practice.setup.countLabel')}</span>
        <input
          class={field}
          type="number"
          min={MIN_PRACTICE_QUESTIONS}
          max={poolSize}
          step="1"
          bind:value={questionInput}
          aria-invalid={countInvalid}
          aria-describedby={countInvalid ? countErrorId : undefined}
        />
      </label>
      <div role="group" aria-label={i18n.t('practice.setup.countQuick')} class="flex flex-wrap gap-2">
        {#each quickCounts(poolSize) as option (option)}
          <Button
            variant="secondary"
            aria-label={option === 'all' ? i18n.t('practice.setup.countAllLabel') : i18n.t('practice.questionCount', { count: option })}
            onclick={() => pick(option)}
          >
            {option === 'all' ? i18n.t('practice.setup.countAll') : option}
          </Button>
        {/each}
      </div>
      {#if countMessage}
        <p id={countErrorId} role="alert" class="text-danger">{countMessage}</p>
      {/if}
    </div>
  {/if}

  <fieldset class="flex flex-col gap-1">
    <legend class="mb-1 text-lg font-medium">{i18n.t('practice.setup.reviewLegend')}</legend>
    <label class={radio}><input class="size-5" type="radio" name="review" value="allow" bind:group={review} />{i18n.t('practice.setup.reviewAllow')}</label>
    <label class={radio}><input class="size-5" type="radio" name="review" value="deny" bind:group={review} />{i18n.t('practice.setup.reviewDeny')}</label>
  </fieldset>

  <fieldset class="flex flex-col gap-1">
    <legend class="mb-1 text-lg font-medium">{i18n.t('practice.setup.timeLegend')}</legend>
    <label class={radio}><input class="size-5" type="radio" name="time" value="set" bind:group={timeMode} onchange={prefillTime} />{i18n.t('practice.setup.timeSet')}</label>
    {#if timeMode === 'set'}
      <div class="flex flex-wrap items-center gap-4 pl-10">
        <label class="flex items-center gap-2">
          {i18n.t('practice.setup.minutes')}
          <input class={field} type="number" min="0" max="180" step="1" bind:value={minutes} oninput={() => (timeTouched = true)} aria-invalid={timeInvalid} aria-describedby={timeInvalid ? errorId : undefined} />
        </label>
        <label class="flex items-center gap-2">
          {i18n.t('practice.setup.seconds')}
          <input class={field} type="number" min="0" step="1" bind:value={seconds} oninput={() => (timeTouched = true)} aria-invalid={timeInvalid} aria-describedby={timeInvalid ? errorId : undefined} />
        </label>
      </div>
      {#if timeInvalid}
        <p id={errorId} role="alert" class="pl-10 text-danger">{i18n.t('practice.setup.timeError')}</p>
      {/if}
    {/if}
    <label class={radio}><input class="size-5" type="radio" name="time" value="none" bind:group={timeMode} />{i18n.t('practice.setup.timeNone')}</label>
  </fieldset>

  {#if timeMode === 'set'}
    <fieldset class="flex flex-col gap-1">
      <legend class="mb-1 text-lg font-medium">{i18n.t('practice.setup.clockLegend')}</legend>
      <label class={radio}><input class="size-5" type="radio" name="clock" value="freeze" bind:group={clock} />{i18n.t('practice.setup.clockFreeze')}</label>
      <label class={radio}><input class="size-5" type="radio" name="clock" value="run" bind:group={clock} />{i18n.t('practice.setup.clockRun')}</label>
    </fieldset>

    <fieldset class="flex flex-col gap-1">
      <legend class="mb-1 text-lg font-medium">{i18n.t('practice.setup.hiddenLegend')}</legend>
      <p class="mb-1 text-muted-foreground">{i18n.t('practice.setup.hiddenHint')}</p>
      <label class={radio}><input class="size-5" type="radio" name="hidden" value="freeze" bind:group={onHidden} />{i18n.t('practice.setup.hiddenFreeze')}</label>
      <label class={radio}><input class="size-5" type="radio" name="hidden" value="run" bind:group={onHidden} />{i18n.t('practice.setup.hiddenRun')}</label>
    </fieldset>

    <fieldset class="flex flex-col gap-1">
      <legend class="mb-1 text-lg font-medium">{i18n.t('practice.setup.reportLegend')}</legend>
      <p class="mb-1 text-muted-foreground">{i18n.t('practice.setup.reportHint')}</p>
      <label class={radio}><input class="size-5" type="radio" name="report" value="freeze" bind:group={onReport} />{i18n.t('practice.setup.reportFreeze')}</label>
      <label class={radio}><input class="size-5" type="radio" name="report" value="run" bind:group={onReport} />{i18n.t('practice.setup.reportRun')}</label>
    </fieldset>
  {/if}

  <fieldset class="flex flex-col gap-1">
    <legend class="mb-1 text-lg font-medium">{i18n.t('practice.setup.unansweredLegend')}</legend>
    <label class={radio}><input class="size-5" type="radio" name="unanswered" value="reveal" bind:group={unanswered} />{i18n.t('practice.setup.unansweredReveal')}</label>
    <label class={radio}><input class="size-5" type="radio" name="unanswered" value="answersOnly" bind:group={unanswered} />{i18n.t('practice.setup.unansweredAnswersOnly')}</label>
  </fieldset>

  {#if message}
    <p role="alert" class="rounded-lg border border-danger p-3 text-danger">{message}</p>
  {/if}

  <div>
    <Button type="submit" disabled={!loaded || busy || timeInvalid || countInvalid} aria-describedby={startDescribedBy}>
      {i18n.t('practice.setup.start')}
    </Button>
  </div>
</form>
