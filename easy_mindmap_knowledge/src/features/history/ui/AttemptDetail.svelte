<script lang="ts">
  import type { Services } from '@/app/composition';
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
    attempt.topicId
      ? (services.catalog.topics.find((t) => t.id === attempt.topicId)?.title[locale] ?? attempt.topicId)
      : i18n.t('history.mixed'),
  );
  const title = $derived(
    i18n.t('history.detail.title', { topic: topicTitle, date: formatDateTime(attempt.submittedAt ?? attempt.startedAt, locale) }),
  );

  /** Option texts for the given keys, in the order the attempt showed the options. */
  function texts(questionId: string, keys: string[], order: string[]): string[] {
    const options = questions.get(questionId)?.options ?? [];
    const rank = (k: string): number => {
      const at = order.indexOf(k);
      return at === -1 ? order.length : at;
    };
    return [...keys].sort((a, b) => rank(a) - rank(b)).map((k) => options.find((o) => o.key === k)?.text ?? k);
  }
</script>

<Modal open {title} {onclose} closeOnBackdrop>
  {#if attempt.scorePct !== null}
    <p class="mb-3 font-semibold tabular-nums">{i18n.t('history.detail.score', { score: formatPct(attempt.scorePct, locale) })}</p>
  {/if}
  {#if rows.length === 0}
    <p>{i18n.t('history.detail.noQuestions')}</p>
  {:else}
    <ol class="flex flex-col gap-3">
      {#each rows as row (row.position)}
        {@const q = questions.get(row.questionId)}
        {@const ok = row.isCorrect === true}
        <li data-question={row.questionId} class="flex flex-col gap-1 rounded-lg border border-border-subtle p-3">
          <p class="text-sm text-muted-foreground">{i18n.t('practice.result.question', { n: row.position + 1 })}</p>
          <p class="font-medium">{q?.text ?? row.questionId}</p>
          <p class={cn('font-semibold', ok ? 'text-leaf-done-ink' : 'text-danger')}>
            {ok ? `✓ ${i18n.t('practice.result.correct')}` : `✗ ${i18n.t('practice.result.incorrect')}`}
          </p>
          <dl class="grid gap-1">
            <div>
              <dt class="text-sm text-muted-foreground">{i18n.t('practice.result.yourAnswer')}</dt>
              <dd>
                {#if row.selected.length === 0}
                  {i18n.t('practice.result.noAnswer')}
                {:else}
                  <ul>{#each texts(row.questionId, row.selected, row.optionOrder) as text (text)}<li>{text}</li>{/each}</ul>
                {/if}
              </dd>
            </div>
            <div>
              <dt class="text-sm text-muted-foreground">{i18n.t('practice.result.correctAnswer')}</dt>
              <dd><ul>{#each texts(row.questionId, q?.correct ?? [], row.optionOrder) as text (text)}<li>{text}</li>{/each}</ul></dd>
            </div>
            {#if q?.explanation}
              <div>
                <dt class="text-sm text-muted-foreground">{i18n.t('practice.result.explanation')}</dt>
                <dd>{q.explanation}</dd>
              </div>
            {/if}
          </dl>
        </li>
      {/each}
    </ol>
  {/if}
  <div class="mt-4 flex justify-end"><Button variant="secondary" onclick={onclose}>{i18n.t('common.close')}</Button></div>
</Modal>
