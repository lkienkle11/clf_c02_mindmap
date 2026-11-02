<script lang="ts">
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import { renderLessonBody } from '@/features/lesson';
  import Button from '@/ui/Button.svelte';
  import Modal from '@/ui/Modal.svelte';

  interface Props {
    services: Services;
    topicId: string | null;
    open: boolean;
    timeLeft: string | null;
    /** False for untimed reviews, where "the clock keeps running" would be untrue. */
    showClockNotice?: boolean;
    onclose: () => void;
  }

  let { services, topicId, open, timeLeft, showClockNotice = true, onclose }: Props = $props();

  const i18n = getI18n();
  const lessons = $derived(
    topicId === null ? [] : [...services.catalog.lessonsOf(topicId)].sort((a, b) => a.order - b.order),
  );

  const body =
    'space-y-3 leading-relaxed [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6';

  /** Read-only: links become plain text, nothing is marked read and no progress changes. */
  function plain(markdown: string): string {
    const doc = new DOMParser().parseFromString(renderLessonBody(markdown), 'text/html');
    for (const a of doc.querySelectorAll('a')) a.replaceWith(...a.childNodes);
    return doc.body.innerHTML;
  }
</script>

<Modal {open} title={i18n.t('practice.reviewKnowledge')} {onclose}>
  {#if showClockNotice}
    <p class="mb-4 rounded-lg bg-muted p-3 text-sm">
      {i18n.t('practice.reviewNotice')}{#if timeLeft} <strong class="tabular-nums">{timeLeft}</strong>{/if}
    </p>
  {/if}
  {#each lessons as lesson (lesson.id)}
    <article class="mb-6">
      <h3 class="mb-2 text-lg font-semibold">{lesson.title[i18n.locale]}</h3>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- bundled, trusted content; raw HTML is escaped by renderLessonBody -->
      <div class={body}>{@html plain(lesson.body[i18n.locale])}</div>
    </article>
  {:else}
    <p>{i18n.t('practice.reviewEmpty')}</p>
  {/each}
  <Button onclick={onclose}>{i18n.t('practice.reviewClose')}</Button>
</Modal>
