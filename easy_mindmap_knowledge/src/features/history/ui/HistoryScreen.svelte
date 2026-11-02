<script lang="ts">
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { AttemptQuestionRow, AttemptRow } from '@/persistence';
  import Button from '@/ui/Button.svelte';
  import { mostMissed, scoreSeries, weakTopics } from '../logic/history-stats';
  import AttemptDetail from './AttemptDetail.svelte';
  import AttemptsTable from './AttemptsTable.svelte';
  import Insights from './Insights.svelte';
  import ScoreChart from './ScoreChart.svelte';

  interface Props {
    services: Services;
    appState: AppState;
  }

  let { services, appState }: Props = $props();

  const i18n = getI18n();
  const BATCH = 8;

  let status = $state<'loading' | 'ready' | 'error'>('loading');
  let rowsByAttempt = $state.raw(new Map<string, AttemptQuestionRow[]>());
  let selected = $state.raw<AttemptRow | null>(null);
  let loadSeq = 0;

  async function load(list: AttemptRow[]): Promise<void> {
    const seq = ++loadSeq;
    status = 'loading';
    try {
      const next = new Map<string, AttemptQuestionRow[]>();
      for (let i = 0; i < list.length; i += BATCH) {
        const batch = list.slice(i, i + BATCH);
        const got = await Promise.all(batch.map((a) => services.repos.attempts.questionsOf(a.id)));
        batch.forEach((a, j) => next.set(a.id, got[j]));
      }
      if (seq !== loadSeq) return;
      rowsByAttempt = next;
      status = 'ready';
    } catch (e) {
      console.error('Could not load the history', e);
      if (seq === loadSeq) status = 'error';
    }
  }

  $effect(() => {
    void load(appState.submittedAttempts);
  });

  const filterTopic = $derived(appState.route.view === 'history' ? (appState.route.topicId ?? null) : null);
  const topicById = $derived(new Map(services.catalog.topics.map((t) => [t.id, t])));
  const questionById = $derived(new Map(services.catalog.questions.map((q) => [q.id, q])));
  const topicName = (id: string | null): string =>
    id === null ? i18n.t('history.mixed') : (topicById.get(id)?.title[i18n.locale] ?? id);
  const questionText = (id: string): string => questionById.get(id)?.text ?? id;

  const shown = $derived(
    appState.submittedAttempts.filter((a) => a.status === 'submitted' && (filterTopic === null || a.topicId === filterTopic)),
  );
  const newestFirst = $derived([...shown].sort((x, y) => (y.submittedAt ?? 0) - (x.submittedAt ?? 0) || (x.id < y.id ? 1 : -1)));
  const points = $derived(scoreSeries(shown));
  const weak = $derived(filterTopic === null ? weakTopics(shown, 5) : null);
  const missed = $derived(
    mostMissed(
      shown.flatMap((a) => rowsByAttempt.get(a.id) ?? []).map((r) => ({ questionId: r.questionId, isCorrect: r.isCorrect === true })),
      5,
    ),
  );
</script>

<section class="mx-auto flex max-w-4xl flex-col gap-6 p-4">
  <h1 class="text-2xl font-semibold">{i18n.t('history.title')}</h1>

  {#if filterTopic !== null}
    <div class="flex">
      <span class="inline-flex items-center gap-1 rounded-full bg-leaf-next-soft py-0.5 pl-3 text-leaf-next-ink">
        {i18n.t('history.filter.topic', { topic: topicName(filterTopic) })}
        <button
          type="button"
          aria-label={i18n.t('history.filter.remove', { topic: topicName(filterTopic) })}
          class="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full hover:bg-leaf-next/20 focus-visible:outline-2 focus-visible:outline-ring"
          onclick={() => appState.open({ view: 'history' })}
        ><span aria-hidden="true">✕</span></button>
      </span>
    </div>
  {/if}

  {#if status === 'loading'}
    <p role="status" class="text-muted-foreground">{i18n.t('common.loading')}</p>
  {:else if status === 'error'}
    <div role="alert" class="flex flex-col items-start gap-3">
      <p class="font-medium text-danger">{i18n.t('history.loadFailed')}</p>
      <Button variant="secondary" onclick={() => load(appState.submittedAttempts)}>{i18n.t('common.retry')}</Button>
    </div>
  {:else if shown.length === 0}
    <div class="flex flex-col items-start gap-3">
      <p class="text-lg font-medium">{i18n.t('history.empty')}</p>
      <p class="text-muted-foreground">{i18n.t('history.emptyHint')}</p>
      <Button onclick={() => appState.open({ view: 'tree' })}>{i18n.t('history.goToMap')}</Button>
    </div>
  {:else}
    <ScoreChart {points} {topicName} />
    <AttemptsTable attempts={newestFirst} {topicName} onopen={(a) => (selected = a)} />
    <Insights {weak} {missed} {topicName} {questionText} />
  {/if}
</section>

{#if selected}
  <AttemptDetail {services} attempt={selected} rows={rowsByAttempt.get(selected.id) ?? []} onclose={() => (selected = null)} />
{/if}
