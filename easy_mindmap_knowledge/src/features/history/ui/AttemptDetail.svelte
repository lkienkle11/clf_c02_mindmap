<script lang="ts">
  import type { Services } from '@/app/composition';
  import { OptionReview, ResultSearchBar, filterResultItems, hidesAnswers } from '@/features/practice';
  import type { ResultVerdict } from '@/features/practice';
  import { ReportButton } from '@/features/report';
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { AttemptQuestionRow, AttemptRow } from '@/persistence';
  import Modal from '@/ui/Modal.svelte';
  import Button from '@/ui/Button.svelte';
  import { cn } from '@/ui/cn';
  import { formatDateTime, formatPct } from './format';

  interface Props {
    services: Services;
    attempt: AttemptRow;
    rows: AttemptQuestionRow[];
    onclose: () => void;
  }

  let { services, attempt, rows, onclose }: Props = $props();

  const i18n = getI18n();
  const locale = $derived(i18n.locale);
  const questions = $derived(new Map(services.catalog.questions.map((q) => [q.id, q])));
  const topicTitle = $derived(
    attempt.kind === 'checkpoint' && attempt.groupIndex !== null
      ? i18n.t('history.checkpointName', { group: attempt.groupIndex })
      : attempt.topicId
        ? (services.catalog.topics.find((t) => t.id === attempt.topicId)?.title[locale] ?? attempt.topicId)
        : i18n.t('history.mixed'),
  );
  // Everything under the title (score, search, questions) is what an attempt report screenshots.
  let content: HTMLElement | null = null;
  const trackContent = (node: HTMLElement) => {
    content = node;
    return () => (content = null);
  };
  let query = $state('');
  let verdict = $state<ResultVerdict>('all');
  // The numbers (1-based, as shown) of the questions that pass the search and the filter.
  const visible = $derived(
    new Set(
      filterResultItems(
        rows.map((row) => {
          const q = questions.get(row.questionId);
          return { number: row.position + 1, isCorrect: row.isCorrect === true, title: q?.text ?? row.questionId, optionTexts: q?.options.map((o) => o.text) ?? [] };
        }),
        query,
        verdict,
      ),
    ),
  );
  // Each <li> is a plain block holding the whole question (text, mark, options); it is the screenshot target.
  const frames: Record<number, HTMLElement | undefined> = {};
  const frame = (position: number) => (node: HTMLElement) => {
    frames[position] = node;
    return () => delete frames[position];
  };
  const title = $derived(
    i18n.t('history.detail.title', { topic: topicTitle, date: formatDateTime(attempt.submittedAt ?? attempt.startedAt, locale) }),
  );
</script>

<Modal open {title} {onclose} closeOnBackdrop>
  <div {@attach trackContent}>
  {#if attempt.scorePct !== null}
    <p class="mb-3 font-semibold tabular-nums">{i18n.t('history.detail.score', { score: formatPct(attempt.scorePct, locale) })}</p>
  {/if}
  {#if rows.length === 0}
    <p>{i18n.t('history.detail.noQuestions')}</p>
  {:else}
    <div class="mb-3">
      <ResultSearchBar bind:query bind:verdict shown={visible.size} total={rows.length} />
    </div>
    <ol class="flex flex-col gap-3">
      {#each rows as row (row.position)}
        {#if visible.has(row.position + 1)}
        {@const q = questions.get(row.questionId)}
        {@const ok = row.isCorrect === true}
        <li data-question={row.questionId} class="flex flex-col gap-1 rounded-lg border border-border-subtle p-3" {@attach frame(row.position)}>
          <p class="text-sm text-muted-foreground">{i18n.t('practice.result.question', { n: row.position + 1 })}</p>
          <p lang="en" class="font-medium">{q?.text ?? row.questionId}</p>
          <p class={cn('font-semibold', ok ? 'text-leaf-done-ink' : 'text-danger')}>
            {ok ? `✓ ${i18n.t('practice.result.correct')}` : `✗ ${i18n.t('practice.result.incorrect')}`}
          </p>
          <OptionReview question={q} selected={row.selected} optionOrder={row.optionOrder} hideAnswers={hidesAnswers(row.selected, attempt.unansweredDisplay)} />
          <ReportButton
            {services}
            class="self-end"
            context={{
              type: 'question',
              questionId: row.questionId,
              sourceScreen: 'history',
              attempt: { attemptId: row.attemptId, position: row.position, optionOrder: [...row.optionOrder], selected: [...row.selected], isCorrect: row.isCorrect },
            }}
            captureTarget={() => frames[row.position] ?? null}
          />
        </li>
        {/if}
      {/each}
    </ol>
  {/if}
  </div>
  <div class="mt-4 flex flex-wrap justify-end gap-3">
    <ReportButton
      {services}
      context={{ type: 'attempt', attemptId: attempt.id, sourceScreen: 'history' }}
      captureTarget={() => content}
    />
    <Button variant="secondary" onclick={onclose}>{i18n.t('common.close')}</Button>
  </div>
</Modal>
