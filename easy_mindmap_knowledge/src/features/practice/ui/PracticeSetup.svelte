<script lang="ts">
  import { untrack } from 'svelte';
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import { buildPool, practiceCount } from '../logic/pick-questions';
  import { NoQuestionsError } from '../errors';
  import { loadLastOptions } from '../options';
  import { PracticeSession } from '../session.svelte';
  import { limitFromParts } from './time';

  interface Props {
    services: Services;
    appState: AppState;
    topicId: string;
    onstarted: (session: PracticeSession) => void;
  }

  let { services, appState, topicId, onstarted }: Props = $props();

  const i18n = getI18n();
  const topic = $derived(services.catalog.topic(topicId));
  const count = $derived(Math.min(practiceCount(topicId), buildPool(services.catalog, topicId).length));

  let review = $state<'allow' | 'deny'>('deny');
  let timeMode = $state<'set' | 'none'>('none');
  let clock = $state<'freeze' | 'run'>('freeze');
  let minutes = $state<number | null>(10);
  let seconds = $state<number | null>(0);
  let loaded = $state(false);
  let busy = $state(false);
  let message = $state<string | null>(null);

  $effect(() => {
    let cancelled = false;
    loadLastOptions(untrack(() => services.repos.settings))
      .catch(() => null)
      .then((o) => {
        if (cancelled) return;
        if (o) {
          review = o.allowReview ? 'allow' : 'deny';
          clock = o.clockMode;
          if (o.limitMs !== null) {
            timeMode = 'set';
            const total = Math.round(o.limitMs / 1000);
            minutes = Math.floor(total / 60);
            seconds = total % 60;
          }
        }
        loaded = true;
      });
    return () => { cancelled = true; };
  });

  const limitMs = $derived(timeMode === 'set' ? limitFromParts(minutes, seconds) : null);
  const timeInvalid = $derived(timeMode === 'set' && limitMs === null);
  const errorId = 'practice-time-error';

  async function start(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    if (busy || timeInvalid) return;
    busy = true;
    message = null;
    try {
      const session = await PracticeSession.start(
        services,
        topicId,
        { allowReview: review === 'allow', limitMs, clockMode: clock },
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
  <header>
    <h1 class="text-2xl font-semibold">{i18n.t('nav.practice')}: {topic.title[i18n.locale]}</h1>
    <p class="text-muted-foreground">{i18n.t('practice.questionCount', { count })}</p>
  </header>

  <fieldset class="flex flex-col gap-1">
    <legend class="mb-1 text-lg font-medium">{i18n.t('practice.setup.reviewLegend')}</legend>
    <label class={radio}><input class="size-5" type="radio" name="review" value="allow" bind:group={review} />{i18n.t('practice.setup.reviewAllow')}</label>
    <label class={radio}><input class="size-5" type="radio" name="review" value="deny" bind:group={review} />{i18n.t('practice.setup.reviewDeny')}</label>
  </fieldset>

  <fieldset class="flex flex-col gap-1">
    <legend class="mb-1 text-lg font-medium">{i18n.t('practice.setup.timeLegend')}</legend>
    <label class={radio}><input class="size-5" type="radio" name="time" value="set" bind:group={timeMode} />{i18n.t('practice.setup.timeSet')}</label>
    {#if timeMode === 'set'}
      <div class="flex flex-wrap items-center gap-4 pl-10">
        <label class="flex items-center gap-2">
          {i18n.t('practice.setup.minutes')}
          <input class={field} type="number" min="0" max="180" step="1" bind:value={minutes} aria-invalid={timeInvalid} aria-describedby={timeInvalid ? errorId : undefined} />
        </label>
        <label class="flex items-center gap-2">
          {i18n.t('practice.setup.seconds')}
          <input class={field} type="number" min="0" step="1" bind:value={seconds} aria-invalid={timeInvalid} aria-describedby={timeInvalid ? errorId : undefined} />
        </label>
      </div>
      {#if timeInvalid}
        <p id={errorId} class="pl-10 text-danger">{i18n.t('practice.setup.timeError')}</p>
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
  {/if}

  {#if message}
    <p role="alert" class="rounded-lg border border-danger p-3 text-danger">{message}</p>
  {/if}

  <div>
    <Button type="submit" disabled={!loaded || busy || timeInvalid} aria-describedby={timeInvalid ? errorId : undefined}>
      {i18n.t('practice.setup.start')}
    </Button>
  </div>
</form>
