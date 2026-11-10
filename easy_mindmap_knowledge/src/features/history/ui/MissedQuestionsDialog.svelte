<script lang="ts">
  import type { Services } from '@/app/composition';
  import { OptionReview } from '@/features/practice';
  import { ReportButton } from '@/features/report';
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import Modal from '@/ui/Modal.svelte';
  import type { MissedDetail } from '../logic/history-stats';
  import { filterMissed, paginate } from '../logic/missed-filter';

  interface Props {
    items: MissedDetail[];
    services: Services;
    /** The topic the dialog starts on (the history route's filter); ignored when no item belongs to it. */
    initialTopicId: string | null;
    onclose: () => void;
  }

  let { items, services, initialTopicId, onclose }: Props = $props();

  const PAGE_SIZE = 5;
  const i18n = getI18n();
  const uid = $props.id();

  const questions = $derived(new Map(services.catalog.questions.map((q) => [q.id, q])));
  const textOf = (id: string): string => questions.get(id)?.text ?? id;
  const topicName = (id: string): string => services.catalog.topics.find((t) => t.id === id)?.title[i18n.locale] ?? id;
  /** Only the topics that have a missed question, in catalog order. */
  const topicChoices = $derived(
    services.catalog.topics.filter((t) => items.some((i) => i.topicId === t.id)).map((t) => ({ id: t.id, name: t.title[i18n.locale] })),
  );

  let query = $state('');
  let topicId = $state<string | null>(
    untrackedInitial(),
  );
  let page = $state(1);

  function untrackedInitial(): string | null {
    return initialTopicId !== null && items.some((i) => i.topicId === initialTopicId) ? initialTopicId : null;
  }

  // Each <li> is a plain block holding the whole entry; it is the screenshot target.
  const frames: Record<string, HTMLElement | undefined> = {};
  const frame = (id: string) => (node: HTMLElement) => {
    frames[id] = node;
    return () => delete frames[id];
  };

  const filtered = $derived(filterMissed(items, query, topicId, textOf));
  const view = $derived(paginate(filtered, page, PAGE_SIZE));
</script>

<Modal open title={i18n.t('history.missed.dialogTitle')} {onclose} closeOnBackdrop>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-3">
      <div class="flex min-w-0 flex-col gap-1">
        <label for="{uid}-search" class="text-sm font-medium">{i18n.t('history.missed.search')}</label>
        <input
          id="{uid}-search"
          type="search"
          value={query}
          oninput={(e) => {
            query = e.currentTarget.value;
            page = 1;
          }}
          class="min-h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-surface-foreground focus-visible:outline-2 focus-visible:outline-ring"
        />
      </div>
      <div class="flex min-w-0 flex-col gap-1">
        <label for="{uid}-topic" class="text-sm font-medium">{i18n.t('history.missed.topicFilter')}</label>
        <select
          id="{uid}-topic"
          value={topicId ?? ''}
          onchange={(e) => {
            topicId = e.currentTarget.value === '' ? null : e.currentTarget.value;
            page = 1;
          }}
          class="min-h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-surface-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <option value="">{i18n.t('history.missed.allTopics')}</option>
          {#each topicChoices as t (t.id)}
            <option value={t.id}>{t.name}</option>
          {/each}
        </select>
      </div>
    </div>

    {#if view.items.length === 0}
      <p role="status" class="text-muted-foreground">{i18n.t('history.missed.noMatch')}</p>
    {:else}
      <ol class="flex flex-col gap-3">
        {#each view.items as item (item.questionId)}
          <li data-question={item.questionId} class="flex flex-col gap-1 rounded-lg border border-border-subtle p-3" {@attach frame(item.questionId)}>
            <p lang="en" class="font-medium">{textOf(item.questionId)}</p>
            <p class="flex flex-wrap gap-x-2 text-sm text-muted-foreground">
              {#if item.topicId !== null}<span>{topicName(item.topicId)}</span><span aria-hidden="true">·</span>{/if}
              <span>{i18n.t('history.missed.stat', { misses: item.misses, seen: item.seen })}</span>
            </p>
            {#if item.distinctWrongAnswers > 1}
              <p class="text-sm text-muted-foreground">
                {item.distinctWrongAnswers === 2
                  ? i18n.t('history.missed.otherWrong.one')
                  : i18n.t('history.missed.otherWrong', { n: item.distinctWrongAnswers - 1 })}
              </p>
            {/if}
            <OptionReview
              question={questions.get(item.questionId)}
              selected={item.latestWrong.selected}
              optionOrder={item.latestWrong.optionOrder}
            />
            <ReportButton
              {services}
              class="self-end"
              context={{
                type: 'question',
                questionId: item.questionId,
                sourceScreen: 'missed',
                // The latest wrong attempt is the one shown above; without its id there is nothing to reference.
                ...(item.latestWrong.attemptId !== ''
                  ? {
                      attempt: {
                        attemptId: item.latestWrong.attemptId,
                        position: item.latestWrong.position,
                        optionOrder: [...item.latestWrong.optionOrder],
                        selected: [...item.latestWrong.selected],
                        isCorrect: false,
                      },
                    }
                  : {}),
              }}
              captureTarget={() => frames[item.questionId] ?? null}
            />
          </li>
        {/each}
      </ol>
    {/if}
  </div>

  {#snippet footer()}
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <Button variant="secondary" disabled={view.page <= 1} onclick={() => (page = view.page - 1)}>{i18n.t('history.missed.prev')}</Button>
        <span class="text-sm tabular-nums text-muted-foreground" aria-live="polite">{i18n.t('history.missed.page', { page: view.pages === 0 ? 0 : view.page, pages: view.pages })}</span>
        <Button variant="secondary" disabled={view.page >= view.pages} onclick={() => (page = view.page + 1)}>{i18n.t('history.missed.next')}</Button>
      </div>
      <Button variant="secondary" onclick={onclose}>{i18n.t('common.close')}</Button>
    </div>
  {/snippet}
</Modal>
