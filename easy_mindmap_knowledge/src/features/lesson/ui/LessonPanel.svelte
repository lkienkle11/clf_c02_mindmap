<script lang="ts">
  import type { Attachment } from 'svelte/attachments';
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import type { Lesson } from '@/content/types';
  import { getI18n } from '@/i18n/i18n.svelte';
  import { ReportButton } from '@/features/report';
  import Badge from '@/ui/Badge.svelte';
  import Button from '@/ui/Button.svelte';
  import { isAllowedExternalUrl } from './external-url';
  import { renderLessonBody } from './markdown';

  interface Props {
    services: Services;
    appState: AppState;
    lesson: Lesson;
    /** Allowlisted opener (YouTube search only). Rejects for anything else. */
    openExternal: (url: string) => Promise<void>;
    /** Injected by the app layer: whether the topic's practice is unlocked (every required lesson read). */
    canPractice: (topicId: string) => boolean;
  }

  let { services, appState, lesson, openExternal, canPractice }: Props = $props();

  const i18n = getI18n();
  const locale = $derived(i18n.locale);
  const siblings = $derived([...services.catalog.lessonsOf(lesson.topicId)].sort((a, b) => a.order - b.order));
  const index = $derived(siblings.findIndex((l) => l.id === lesson.id));
  const previous = $derived(index > 0 ? siblings[index - 1] : null);
  const next = $derived(index >= 0 && index < siblings.length - 1 ? siblings[index + 1] : null);
  const isRead = $derived(appState.readIds.has(lesson.id));
  const practiceLocked = $derived(!canPractice(lesson.topicId));
  const html = $derived(withoutDeadLinks(renderLessonBody(lesson.body[locale])));
  /**
   * Screenshot target: the header + body wrapper, a plain block that grows with its content. It is never the
   * scrolling panel (html-to-image sizes from clientWidth/clientHeight, so a scroller would be cut) and it
   * excludes the report dialog itself.
   */
  let content: HTMLElement | undefined;
  const keepContent: Attachment<HTMLElement> = (node) => {
    content = node;
    return () => (content = undefined);
  };
  let saving = $state(false);
  let error = $state<string | null>(null);

  /** Links that may not be opened become plain text, so the body never contains a dead link. */
  function withoutDeadLinks(source: string): string {
    const doc = new DOMParser().parseFromString(source, 'text/html');
    for (const a of doc.querySelectorAll('a')) {
      if (!isAllowedExternalUrl(a.getAttribute('href') ?? '')) a.replaceWith(...a.childNodes);
    }
    return doc.body.innerHTML;
  }

  async function open(url: string): Promise<void> {
    error = null;
    try {
      await openExternal(url);
    } catch {
      error = i18n.t('lesson.openFailed');
    }
  }

  async function complete(): Promise<void> {
    if (saving) return;
    saving = true;
    error = null;
    try {
      await services.repos.lessonProgress.markRead(lesson.id, services.now());
      await appState.refresh();
    } catch {
      error = i18n.t('lesson.completeFailed');
    } finally {
      saving = false;
    }
  }

  function go(target: Lesson | null): void {
    if (target) appState.open({ view: 'lesson', topicId: target.topicId, lessonId: target.id });
  }

  function openPractice(): void {
    if (practiceLocked) return;
    appState.open({ view: 'practice', topicId: lesson.topicId });
  }

  /** Lesson bodies must never navigate the webview: allowed links go through the injected opener, all else is blocked. */
  const interceptLinks: Attachment<HTMLElement> = (node) => {
    const find = (e: MouseEvent): HTMLAnchorElement | null => (e.target instanceof Element ? e.target.closest('a') : null);
    const onclick = (e: MouseEvent): void => {
      const link = find(e);
      if (!link) return;
      e.preventDefault();
      const plain = e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey;
      const href = link.getAttribute('href') ?? '';
      if (plain && isAllowedExternalUrl(href)) void open(href);
    };
    const onauxclick = (e: MouseEvent): void => {
      if (find(e)) e.preventDefault();
    };
    node.addEventListener('click', onclick);
    node.addEventListener('auxclick', onauxclick);
    return () => {
      node.removeEventListener('click', onclick);
      node.removeEventListener('auxclick', onauxclick);
    };
  };

  function openVideo(): void {
    if (lesson.videoQuery) void open(`https://www.youtube.com/results?search_query=${encodeURIComponent(lesson.videoQuery)}`);
  }
</script>

<article class="mx-auto flex max-w-3xl flex-col gap-4 p-4">
  <div>
    <Button variant="ghost" onclick={() => appState.open({ view: 'tree' })}><span aria-hidden="true">←</span> {i18n.t('lesson.backToTree')}</Button>
  </div>

  <div {@attach keepContent} class="flex flex-col gap-4">
    <header class="flex flex-wrap items-center gap-3">
      <h1 class="text-2xl font-semibold">{lesson.title[locale]}</h1>
      {#if !lesson.required}<Badge tone="review" label={i18n.t('lesson.optional')} />{/if}
      {#if isRead}<Badge tone="done" label={i18n.t('lesson.completed')} />{/if}
    </header>

    <div data-lesson-body class="lesson-body rounded-lg border border-border-subtle bg-surface p-5 text-surface-foreground" {@attach interceptLinks}>
      <!-- eslint-disable-next-line svelte/no-at-html-tags -- bundled, trusted content; raw HTML is escaped by renderLessonBody -->
      {@html html}
    </div>
  </div>

  <div class="flex flex-wrap items-center justify-between gap-3">
    {#if lesson.videoQuery}
      <Button variant="secondary" onclick={openVideo}><span aria-hidden="true">▶</span> {i18n.t('lesson.openVideo')}</Button>
    {/if}
    <ReportButton class="ml-auto" {services} context={{ type: 'lesson', lessonId: lesson.id, sourceScreen: 'lesson' }} captureTarget={() => content ?? null} />
  </div>

  {#if error}
    <p role="alert" class="rounded-lg border border-danger bg-surface p-3 text-danger">{error}</p>
  {/if}

  <footer class="flex flex-wrap items-center justify-between gap-3">
    <Button variant="secondary" disabled={previous === null} onclick={() => go(previous)}><span aria-hidden="true">←</span> {i18n.t('lesson.previous')}</Button>
    {#if !isRead}
      <Button disabled={saving} onclick={complete}>{i18n.t('lesson.complete')}</Button>
    {/if}
    {#if next === null}
      <Button variant="secondary" disabled={practiceLocked} onclick={openPractice}>{i18n.t('nav.practice')} <span aria-hidden="true">→</span></Button>
    {:else}
      <Button variant="secondary" onclick={() => go(next)}>{i18n.t('lesson.next')} <span aria-hidden="true">→</span></Button>
    {/if}
  </footer>
  {#if next === null && practiceLocked}
    <p class="self-end text-sm text-muted-foreground">{i18n.t('mindmap.practiceLockedLessons')}</p>
  {/if}
</article>

<style>
  .lesson-body {
    line-height: 1.7;
  }
  .lesson-body :global(> * + *) {
    margin-top: 0.9rem;
  }
  .lesson-body :global(h1),
  .lesson-body :global(h2),
  .lesson-body :global(h3) {
    font-weight: 600;
    line-height: 1.3;
  }
  .lesson-body :global(h1) {
    font-size: 1.5rem;
  }
  .lesson-body :global(h2) {
    font-size: 1.25rem;
    margin-top: 1.5rem;
  }
  .lesson-body :global(h3) {
    font-size: 1.1rem;
    margin-top: 1.25rem;
  }
  .lesson-body :global(ul),
  .lesson-body :global(ol) {
    padding-left: 1.5rem;
  }
  .lesson-body :global(ul) {
    list-style: disc;
  }
  .lesson-body :global(ol) {
    list-style: decimal;
  }
  .lesson-body :global(li + li) {
    margin-top: 0.25rem;
  }
  .lesson-body :global(a) {
    color: var(--color-primary);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .lesson-body :global(a:focus-visible) {
    outline: 2px solid var(--color-ring);
    outline-offset: 2px;
  }
  .lesson-body :global(code) {
    background: var(--color-muted);
    border-radius: 0.25rem;
    padding: 0.1rem 0.35rem;
    font-size: 0.9em;
  }
  .lesson-body :global(pre) {
    background: var(--color-muted);
    border-radius: 0.5rem;
    padding: 0.9rem 1rem;
    overflow-x: auto;
  }
  .lesson-body :global(pre code) {
    background: transparent;
    padding: 0;
  }
  .lesson-body :global(blockquote) {
    border-left: 4px solid var(--color-border-subtle);
    padding-left: 1rem;
    color: var(--color-muted-foreground);
  }
  .lesson-body :global(table) {
    width: 100%;
    border-collapse: collapse;
  }
  .lesson-body :global(th),
  .lesson-body :global(td) {
    border: 1px solid var(--color-border-subtle);
    padding: 0.4rem 0.6rem;
    text-align: left;
  }
  .lesson-body :global(th) {
    background: var(--color-muted);
  }
</style>
