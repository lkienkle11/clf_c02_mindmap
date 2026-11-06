<script lang="ts">
  import { tick } from 'svelte';
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import { AttemptMissingError } from '@/persistence';
  import Button from '@/ui/Button.svelte';
  import Modal from '@/ui/Modal.svelte';
  import type { PracticeSession } from '../session.svelte';
  import KnowledgeOverlay from './KnowledgeOverlay.svelte';
  import QuestionNav from './QuestionNav.svelte';
  import QuestionPanel from './QuestionPanel.svelte';
  import SessionTimer from './SessionTimer.svelte';
  import { formatClock } from './time';

  interface Props {
    services: Services;
    appState: AppState;
    session: PracticeSession;
    /** Exam mode has no knowledge review at all, so the button is not offered (not just disabled). */
    hideKnowledge?: boolean;
  }

  let { services, appState, session, hideKnowledge = false }: Props = $props();

  const i18n = getI18n();
  const questionsById = $derived(new Map(services.catalog.questions.map((q) => [q.id, q])));
  const total = $derived(session.questions.length);
  const current = $derived(session.questions[session.index]);
  const question = $derived(current ? questionsById.get(current.questionId) : undefined);
  const unanswered = $derived(session.questions.filter((q) => q.selected.length === 0).length);
  const isReview = $derived(session.kind === 'review');
  // A checkpoint exam has no topic; it is named by its group. The Capstone exam is titled by the Capstone topic.
  const title = $derived(
    isReview
      ? i18n.t('nav.review')
      : session.kind === 'checkpoint' && session.groupIndex !== null
        ? i18n.t('exam.setup.checkpointTitle', { n: session.groupIndex })
        : session.topicId === null
          ? i18n.t('nav.practice')
          : services.catalog.topic(session.topicId).title[i18n.locale],
  );
  // A review mixes topics, so "Review knowledge" follows the question on screen.
  const knowledgeTopicId = $derived(isReview ? (question?.topicId ?? null) : session.topicId);
  const canReviewKnowledge = $derived(session.allowReview && (!isReview || knowledgeTopicId !== null));
  const reviewReason = $derived(session.allowReview ? i18n.t('review.noLesson') : i18n.t('practice.reviewDisabled'));
  const timeLeft = $derived(session.remainingMs === null ? null : formatClock(session.remainingMs));

  let submitOpen = $state(false);
  let exitOpen = $state(false);
  let busy = $state(false);
  let alert = $state<string | null>(null);
  let announcement = $state('');
  let panel = $state<HTMLElement>();

  /** Navigate, tell screen readers which question this is, and move focus to its legend. */
  async function go(index: number): Promise<void> {
    session.goTo(index);
    announcement = i18n.t('practice.questionAnnounce', { current: session.index + 1, total });
    await tick();
    panel?.querySelector<HTMLElement>('legend')?.focus();
  }

  async function submit(): Promise<void> {
    if (busy) return;
    busy = true;
    submitOpen = false;
    alert = null;
    try {
      await session.submit('manual');
    } catch (e) {
      // A follow-up failure after a committed submit still shows the result; only report a real failure.
      if (!session.submitted) {
        alert = i18n.t(e instanceof AttemptMissingError ? 'practice.attemptMissing' : 'practice.submitFailed');
      }
    } finally {
      busy = false;
    }
  }

  async function exit(): Promise<void> {
    if (busy) return;
    busy = true;
    alert = null;
    try {
      await session.exit();
      exitOpen = false;
      // Refresh first: otherwise the stale in-progress row would flash the resume prompt on the tree.
      await appState.refresh().catch(() => {});
      appState.open({ view: 'tree' });
    } catch (e) {
      exitOpen = false;
      alert = i18n.t(e instanceof AttemptMissingError ? 'practice.exitPartial' : 'practice.exitFailed');
    } finally {
      busy = false;
    }
  }
</script>

<div class="mx-auto flex max-w-3xl flex-col gap-5 p-6">
  <header class="flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-xl font-semibold">{title}</h1>
    <p class="text-lg tabular-nums">{i18n.t('practice.progress', { current: session.index + 1, total })}</p>
    <SessionTimer {services} {session} onerror={(what) => (alert = i18n.t(what === 'submit' ? 'practice.timeoutSubmitFailed' : 'practice.tickFailed'))} />
  </header>

  {#if alert}
    <p role="alert" class="rounded-lg border border-danger p-3 text-danger">{alert}</p>
  {/if}

  <p class="sr-only" role="status" aria-live="polite" data-testid="question-announcement">{announcement}</p>

  <div bind:this={panel}>
    {#if current && question}
      {#key current.position}
        <QuestionPanel {session} item={current} {question} onfailed={() => (alert = i18n.t('practice.selectFailed'))} />
      {/key}
    {/if}
  </div>

  <div class="flex flex-wrap justify-between gap-3">
    <Button variant="secondary" disabled={session.index === 0} onclick={() => go(session.index - 1)}>{i18n.t('practice.previous')}</Button>
    <Button variant="secondary" disabled={session.index >= total - 1} onclick={() => go(session.index + 1)}>{i18n.t('practice.next')}</Button>
  </div>

  <QuestionNav questions={session.questions} index={session.index} ongo={go} />

  <div class="flex flex-wrap items-start gap-3 border-t border-border-subtle pt-4">
    {#if !hideKnowledge}
      <div class="flex flex-col gap-1">
        <Button variant="secondary" disabled={!canReviewKnowledge} aria-describedby={canReviewKnowledge ? undefined : 'review-reason'} onclick={() => session.openKnowledge()}>
          {i18n.t('practice.reviewKnowledge')}
        </Button>
        {#if !canReviewKnowledge}
          <p id="review-reason" class="text-sm text-muted-foreground">{reviewReason}</p>
        {/if}
      </div>
    {/if}
    <Button disabled={busy} onclick={() => (submitOpen = true)}>{i18n.t('practice.submit')}</Button>
    <Button variant="ghost" class="ml-auto" disabled={busy} onclick={() => (exitOpen = true)}>{i18n.t('practice.exit')}</Button>
  </div>
</div>

<KnowledgeOverlay {services} topicId={knowledgeTopicId} open={session.knowledgeOpen} {timeLeft} showClockNotice={!isReview} onclose={() => session.closeKnowledge()} />

<Modal open={submitOpen} title={i18n.t('practice.submitTitle')} onclose={() => (submitOpen = false)}>
  <p class="mb-5">
    {unanswered > 0 ? i18n.t('practice.submitUnanswered', { count: unanswered }) : i18n.t('practice.submitAllAnswered')}
  </p>
  <div class="flex justify-end gap-3">
    <Button variant="secondary" onclick={() => (submitOpen = false)}>{i18n.t('common.cancel')}</Button>
    <Button onclick={submit}>{i18n.t('practice.submit')}</Button>
  </div>
</Modal>

<Modal open={exitOpen} title={i18n.t(isReview ? 'review.exitTitle' : 'practice.exitTitle')} onclose={() => (exitOpen = false)}>
  <p class="mb-5">{i18n.t(isReview ? 'review.exitBody' : 'practice.exitBody')}</p>
  <div class="flex justify-end gap-3">
    <Button variant="secondary" onclick={() => (exitOpen = false)}>{i18n.t('common.cancel')}</Button>
    <Button class="bg-danger text-danger-foreground hover:bg-danger/90" disabled={busy} onclick={exit}>{i18n.t('practice.exitConfirm')}</Button>
  </div>
</Modal>
