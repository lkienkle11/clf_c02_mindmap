<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Question } from '@/content/types';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import { cn } from '@/ui/cn';
  import OptionReview from './OptionReview.svelte';
  import type { SubmitResult } from '../session.svelte';

  interface Props {
    services: Services;
    result: SubmitResult;
    onback: () => void;
    timedOut?: boolean;
    canRetry?: boolean;
    onretry?: () => void;
    /** True when this pass completed the topic for the first time and opened the next one. */
    unlocked?: boolean;
    /** 'review' shows the score and breakdown only: no pass mark, no unlock wording, no retry. */
    mode?: 'practice' | 'review';
    /** Replaces the default buttons (e.g. the review screen's next-batch / stop actions). */
    actions?: Snippet;
  }

  let { services, result, onback, timedOut = false, canRetry = false, onretry, unlocked = false, mode = 'practice', actions }: Props = $props();
  const isReview = $derived(mode === 'review');

  const i18n = getI18n();
  const questions = $derived(new Map(services.catalog.questions.map((q) => [q.id, q])));

  /** Item explanation is the fallback only when the catalog question lacks one. */
  const explained = (q: Question, fallback?: string): Question => (q.explanation || fallback === undefined ? q : { ...q, explanation: fallback });

  // Screen readers land on the result when it appears.
  const focusOnMount = (node: HTMLElement) => node.focus();
</script>

<div class="mx-auto flex max-w-3xl flex-col gap-6 p-6">
  <header class="flex flex-col items-start gap-2">
    <h1 tabindex="-1" class="text-2xl font-semibold focus:outline-none" {@attach focusOnMount}>{i18n.t(isReview ? 'review.result.title' : 'practice.result.title')}</h1>
    {#if timedOut && !isReview}
      <p role="status" class="rounded-lg bg-muted p-3 font-medium">{i18n.t('practice.timeUp')}</p>
    {/if}
    <p class="text-6xl font-bold tabular-nums">{result.scorePct}%</p>
    <p class="text-lg">{i18n.t('practice.result.correctCount', { correct: result.correct, total: result.total })}</p>
    {#if !isReview}
      <p class={cn('text-lg font-semibold', result.passed ? 'text-leaf-done-ink' : 'text-danger')}>
        {i18n.t(result.passed ? 'quiz.passed' : 'quiz.failed')}
      </p>
      {#if result.passed && unlocked}
        <p class="font-medium text-leaf-done-ink">{i18n.t('quiz.unlocked')}</p>
      {/if}
      <p class="text-muted-foreground">{i18n.t('practice.result.threshold')}</p>
    {/if}
  </header>

  <section aria-labelledby="breakdown-title">
    <h2 id="breakdown-title" class="mb-3 text-xl font-semibold">{i18n.t('practice.result.breakdown')}</h2>
    <ol class="flex flex-col gap-4">
      {#each result.items as item, i (item.questionId)}
        {@const q = questions.get(item.questionId)}
        <li data-question={item.questionId} class="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface p-4">
          <p class="text-sm text-muted-foreground">{i18n.t('practice.result.question', { n: i + 1 })}</p>
          <p lang="en" class="font-medium">{q?.text ?? item.questionId}</p>
          <p class={cn('font-semibold', item.isCorrect ? 'text-leaf-done-ink' : 'text-danger')}>
            {item.isCorrect ? `✓ ${i18n.t('practice.result.correct')}` : `✗ ${i18n.t('practice.result.incorrect')}`}
          </p>
          {#if q}
            <OptionReview question={explained(q, item.explanation)} selected={item.selected} optionOrder={item.optionOrder} />
          {:else}
            <p class="text-sm text-muted-foreground">{item.explanation ?? ''}</p>
          {/if}
        </li>
      {/each}
    </ol>
  </section>

  <div class="flex flex-wrap gap-3">
    {#if actions}
      {@render actions()}
    {:else}
      <Button onclick={onback}>{i18n.t('practice.result.backToMap')}</Button>
      {#if canRetry && onretry}
        <Button variant="secondary" onclick={onretry}>{i18n.t('practice.result.tryAgain')}</Button>
      {/if}
    {/if}
  </div>
</div>
