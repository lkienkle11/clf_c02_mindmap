<script lang="ts">
  import { practiceUnlocked } from '../logic/topic-status';
  import type { TopicStatus } from '../logic/topic-status';
  import type { Branch } from '../logic/tree-layout';
  import type { Lesson, Topic } from '@/content/types';
  import type { TopicReviewSummary } from '@/features/review';
  import { getI18n } from '@/i18n/i18n.svelte';
  import LeafNode from './LeafNode.svelte';
  import TopicMenu from './TopicMenu.svelte';
  import { clamp, splitTwo } from './text';

  interface Props {
    branch: Branch;
    topic: Topic;
    status: TopicStatus;
    /** Title of the topic before this one; the lockedHint names it. */
    prevTitle: string | null;
    lessons: Lesson[];
    readIds: Set<string>;
    /** Due-for-review summary; the badge only shows on a done topic. */
    review: TopicReviewSummary | null;
    hasQuestions: boolean;
    expanded: boolean;
    canvasWidth: number;
    trunkX: number;
    ontoggle: (topicId: string) => void;
    onopenlesson: (topicId: string, lessonId: string) => void;
    onopenpractice: (topicId: string) => void;
    onexpand: (topicId: string) => void;
    onopenhistory: (topicId: string) => void;
  }

  let { branch, topic, status, prevTitle, lessons, readIds, review, hasQuestions, expanded, canvasWidth, trunkX, ontoggle, onopenlesson, onopenpractice, onexpand, onopenhistory }: Props = $props();

  const i18n = getI18n();
  const locale = $derived(i18n.locale);
  const title = $derived(topic.title[locale]);
  const locked = $derived(status === 'locked');
  const readCount = $derived(lessons.filter((l) => readIds.has(l.id)).length);
  const badge = $derived(i18n.t('mindmap.lessonsRead', { read: readCount, total: lessons.length }));
  const hint = $derived(i18n.t('mindmap.lockedHint', { topic: prevTitle ?? title }));
  const statusText = $derived(i18n.t(status === 'done' ? 'mindmap.status.done' : status === 'current' ? 'mindmap.status.next' : 'mindmap.status.locked'));
  const reviewText = $derived.by(() => {
    if (status !== 'done' || !review) return null;
    const days = review.daysOverdue;
    return days === 0 ? i18n.t('review.badgeToday') : i18n.t(days === 1 ? 'review.badge.one' : 'review.badge', { count: days });
  });
  // Honest note for a topic whose lessons are not written yet (ruling R17): it is practisable anyway.
  const lessonsNote = $derived(lessons.length === 0 ? i18n.t('mindmap.lessonsLater') : null);
  const ariaLabel = $derived(
    locked
      ? `${title}. ${hint}`
      : `${title}, ${statusText}, ${lessonsNote ?? badge}${reviewText ? `, ${reviewText}` : ''}`,
  );

  const icons: Record<TopicStatus, string> = { done: '✓', current: '▶', locked: '🔒' };
  const nodeTones: Record<TopicStatus, string> = {
    done: 'fill-leaf-done-soft stroke-leaf-done',
    current: 'fill-leaf-next-soft stroke-leaf-next',
    locked: 'fill-leaf-locked-soft stroke-border',
  };
  const textTones: Record<TopicStatus, string> = {
    done: 'fill-leaf-done-ink',
    current: 'fill-leaf-next-ink',
    locked: 'fill-leaf-locked-ink',
  };
  const dotTones: Record<TopicStatus, string> = {
    done: 'fill-leaf-done',
    current: 'fill-leaf-next',
    locked: 'fill-leaf-locked',
  };

  const { node } = $derived(branch);
  const lines = $derived(title.length > 20 ? splitTwo(title) : [title]);
  const hintLines = $derived(splitTwo(hint));
  const hintW = $derived(Math.max(...hintLines.map((l) => l.length)) * 5.8 + 20);
  const hintX = $derived(clamp(node.cx, 4 + hintW / 2, canvasWidth - 4 - hintW / 2));

  function activate(): void {
    if (!locked) ontoggle(topic.id);
  }

  function onkeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  }

  const lessonById = $derived(new Map(lessons.map((l) => [l.id, l])));
  const practiceReason = $derived(
    !hasQuestions
      ? i18n.t('mindmap.noQuestions')
      : !practiceUnlocked(lessons, readIds)
        ? i18n.t('mindmap.practiceLockedLessons')
        : undefined,
  );
  // A finished topic may always be redone (when it has questions); the lesson gate only applies to the first run.
  const redoReason = $derived(status === 'done' && hasQuestions ? undefined : practiceReason);
  const practiceName = $derived(i18n.t('nav.practice'));
  const stopId = $derived(lessons.find((l) => l.required && !readIds.has(l.id))?.id ?? 'practice');
</script>

<circle cx={trunkX} cy={branch.y} r="7" class={dotTones[status]} aria-hidden="true" />
<!-- badge first so a locked topic's hover hint paints over it -->
{#if !expanded}
  <text x={node.cx} y={branch.y + node.h / 2 + 15} text-anchor="middle" font-size="10" class="fill-muted-foreground" aria-hidden="true">{badge}</text>
{/if}
{#if reviewText}
  <!-- below the lessons-read count when collapsed; the topic itself keeps its green colours -->
  {@const pillW = reviewText.length * 6.4 + 16}
  {@const pillY = branch.y + node.h / 2 + (expanded ? 8 : 22)}
  <g aria-hidden="true" data-testid="review-badge">
    <rect x={node.cx - pillW / 2} y={pillY} width={pillW} height="20" rx="10" class="fill-leaf-review-soft" />
    <text x={node.cx} y={pillY + 14} text-anchor="middle" font-size="11" font-weight="600" class="fill-leaf-review-ink">{reviewText}</text>
  </g>
{/if}
<g
  role="button"
  tabindex="0"
  aria-label={ariaLabel}
  aria-disabled={locked ? 'true' : undefined}
  aria-expanded={locked ? undefined : expanded}
  class={['group outline-none', locked ? 'cursor-not-allowed' : 'cursor-pointer']}
  onclick={activate}
  {onkeydown}
>
  <title>{locked ? hint : ariaLabel}</title>
  <rect
    x={node.left - 4}
    y={branch.y - node.h / 2 - 4}
    width={node.w + 8}
    height={node.h + 8}
    rx="14"
    class="fill-none stroke-ring opacity-0 group-focus-visible:opacity-100"
    stroke-width="2.5"
  />
  <rect x={node.left} y={branch.y - node.h / 2} width={node.w} height={node.h} rx="10" class={nodeTones[status]} stroke-width="2.5" />
  <text x={node.left + 17} y={branch.y + 5} text-anchor="middle" font-size="14" class={textTones[status]}>{icons[status]}</text>
  <text x={node.left + 32} y={lines.length > 1 ? branch.y - 2 : branch.y + 4} font-size={lines.length > 1 ? 11 : 12} font-weight="700" class={textTones[status]}>
    {#each lines as line, i (i)}
      <tspan x={node.left + 32} dy={i === 0 ? 0 : 13}>{line}</tspan>
    {/each}
  </text>
  {#if locked}
    <g class="pointer-events-none opacity-0 group-hover:opacity-100 group-focus:opacity-100" aria-hidden="true">
      <rect x={hintX - hintW / 2} y={branch.y + node.h / 2 + 6} width={hintW} height={hintLines.length * 13 + 12} rx="8" class="fill-surface stroke-border" stroke-width="1" />
      <text x={hintX} y={branch.y + node.h / 2 + 22} text-anchor="middle" font-size="11" class="fill-surface-foreground">
        {#each hintLines as line, i (i)}
          <tspan x={hintX} dy={i === 0 ? 0 : 13}>{line}</tspan>
        {/each}
      </text>
    </g>
  {/if}
</g>

{#if !locked}
  <!-- above the node, clear of the spine and the water; a sibling of the node button so it never toggles it -->
  <TopicMenu
    x={node.cx - 22}
    y={branch.y - node.h / 2 - 50}
    topicTitle={title}
    practiceReason={redoReason}
    onredo={() => onopenpractice(topic.id)}
    onlessons={() => onexpand(topic.id)}
    onhistory={() => onopenhistory(topic.id)}
  />
{/if}

{#each branch.leaves as leaf (leaf.id)}
  {#if leaf.kind === 'lesson'}
    {@const lesson = lessonById.get(leaf.id)}
    {#if lesson}
      {@const read = readIds.has(lesson.id)}
      {@const isCurrent = status === 'current' && lesson.id === stopId}
      {@const tone = read ? 'done' : isCurrent ? 'current' : 'todo'}
      {@const lessonTitle = lesson.title[locale]}
      {@const stateText = read ? i18n.t('mindmap.status.done') : isCurrent ? i18n.t('mindmap.status.next') : i18n.t('mindmap.status.unread')}
      <LeafNode
        x={leaf.x}
        y={leaf.y}
        spineY={branch.y}
        side={leaf.side}
        label={`${read ? '✓ ' : ''}${lesson.required ? '' : '▶ '}${lessonTitle}`}
        ariaLabel={`${lessonTitle}, ${lesson.required ? '' : `${i18n.t('mindmap.optional')}, `}${stateText}`}
        {tone}
        dashed={!lesson.required}
        {canvasWidth}
        onactivate={() => onopenlesson(topic.id, lesson.id)}
      />
    {/if}
  {:else}
    <LeafNode
      x={leaf.x}
      y={leaf.y}
      spineY={branch.y}
      side={leaf.side}
      label={practiceReason ? `🔒 ${practiceName}` : practiceName}
      ariaLabel={practiceReason ? `${practiceName}, ${practiceReason}` : practiceName}
      tone={status === 'current' && stopId === 'practice' ? 'current' : 'todo'}
      disabled={practiceReason !== undefined}
      reason={practiceReason ?? lessonsNote ?? undefined}
      {canvasWidth}
      onactivate={() => onopenpractice(topic.id)}
    />
  {/if}
{/each}

