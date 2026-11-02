<script lang="ts">
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import { cn } from '@/ui/cn';
  import type { SubmitResult } from '../session.svelte';

  interface Props {
    services: Services;
    result: SubmitResult;
    timedOut: boolean;
    canRetry: boolean;
    onback: () => void;
    onretry: () => void;
  }

  let { services, result, timedOut, canRetry, onback, onretry }: Props = $props();

  const i18n = getI18n();
  const questions = $derived(new Map(services.catalog.questions.map((q) => [q.id, q])));

  const answerText = (questionId: string, keys: string[]): string =>
    keys.map((k) => questions.get(questionId)?.options.find((o) => o.key === k)?.text ?? k).join(', ');

  // Screen readers land on the result when it appears.
  const focusOnMount = (node: HTMLElement) => node.focus();
</script>

<div class="mx-auto flex max-w-3xl flex-col gap-6 p-6">
  <header class="flex flex-col items-start gap-2">
    <h2 tabindex="-1" class="text-2xl font-semibold focus:outline-none" {@attach focusOnMount}>{i18n.t('practice.result.title')}</h2>
    {#if timedOut}
      <p role="status" class="rounded-lg bg-muted p-3 font-medium">{i18n.t('practice.timeUp')}</p>
    {/if}
    <p class="text-6xl font-bold tabular-nums">{result.scorePct}%</p>
    <p class="text-lg">{i18n.t('practice.result.correctCount', { correct: result.correct, total: result.total })}</p>
    <p class={cn('text-lg font-semibold', result.passed ? 'text-leaf-done-ink' : 'text-danger')}>
      {i18n.t(result.passed ? 'quiz.passed' : 'quiz.failed')}
    </p>
    <p class="text-muted-foreground">{i18n.t('practice.result.threshold')}</p>
  </header>

  <section aria-labelledby="breakdown-title">
    <h3 id="breakdown-title" class="mb-3 text-xl font-semibold">{i18n.t('practice.result.breakdown')}</h3>
    <ol class="flex flex-col gap-4">
      {#each result.items as item, i (item.questionId)}
        {@const q = questions.get(item.questionId)}
        <li data-question={item.questionId} class="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface p-4">
          <p class="text-sm text-muted-foreground">{i18n.t('practice.result.question', { n: i + 1 })}</p>
          <p class="font-medium">{q?.text ?? item.questionId}</p>
          <p class={cn('font-semibold', item.isCorrect ? 'text-leaf-done-ink' : 'text-danger')}>
            {item.isCorrect ? `✓ ${i18n.t('practice.result.correct')}` : `✗ ${i18n.t('practice.result.incorrect')}`}
          </p>
          <dl class="grid gap-1">
            <div>
              <dt class="text-sm text-muted-foreground">{i18n.t('practice.result.yourAnswer')}</dt>
              <dd>{item.selected.length === 0 ? i18n.t('practice.result.noAnswer') : answerText(item.questionId, item.selected)}</dd>
            </div>
            <div>
              <dt class="text-sm text-muted-foreground">{i18n.t('practice.result.correctAnswer')}</dt>
              <dd>{answerText(item.questionId, item.correct)}</dd>
            </div>
            {#if item.explanation}
              <div>
                <dt class="text-sm text-muted-foreground">{i18n.t('practice.result.explanation')}</dt>
                <dd>{item.explanation}</dd>
              </div>
            {/if}
          </dl>
        </li>
      {/each}
    </ol>
  </section>

  <div class="flex flex-wrap gap-3">
    <Button onclick={onback}>{i18n.t('practice.result.backToMap')}</Button>
    {#if canRetry}
      <Button variant="secondary" onclick={onretry}>{i18n.t('practice.result.tryAgain')}</Button>
    {/if}
  </div>
</div>
