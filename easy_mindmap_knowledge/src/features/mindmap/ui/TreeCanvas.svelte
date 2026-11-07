<script lang="ts">
  import { onMount } from 'svelte';
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { checkpointGroups, checkpointState, gateBefore } from '@/features/exam';
  import { buildPool } from '@/features/practice';
  import { getI18n } from '@/i18n/i18n.svelte';
  import { layoutTree } from '../logic/tree-layout';
  import { stopLeafId, waterPath } from '../logic/water-path';
  import CheckpointNode from './CheckpointNode.svelte';
  import { recallTreeScroll, rememberTreeScroll } from './scroll-memory';
  import TopicBranch from './TopicBranch.svelte';
  import TrunkWater from './TrunkWater.svelte';

  interface Props {
    services: Services;
    appState: AppState;
    expandedTopicId: string | null;
    ontoggle: (topicId: string) => void;
    onexpand: (topicId: string) => void;
  }

  let { services, appState, expandedTopicId, ontoggle, onexpand }: Props = $props();

  const i18n = getI18n();
  const catalog = $derived(services.catalog);
  const topics = $derived([...catalog.topics].sort((a, b) => a.order - b.order));
  const groups = $derived(checkpointGroups(topics));
  const layout = $derived(
    layoutTree(topics, {
      expandedTopicId,
      checkpoints: groups.map((g) => ({ index: g.index, afterTopicId: g.topicIds[g.topicIds.length - 1] })),
    }),
  );
  const groupByIndex = $derived(new Map(groups.map((g) => [g.index, g])));
  // Group whose unpassed (but finished) checkpoint is what keeps this topic locked.
  function pendingGate(topicId: string): number | null {
    const gate = gateBefore(topics, topicId);
    if (!gate || appState.statuses.get(topicId) !== 'locked') return null;
    return checkpointState(gate, appState.completed, appState.passedGroups) === 'available' ? gate.index : null;
  }
  const currentTopicId = $derived(topics.find((t) => appState.statuses.get(t.id) === 'current')?.id ?? null);
  const water = $derived(
    waterPath(layout, {
      statuses: appState.statuses,
      currentTopicId,
      stopLeafId: currentTopicId ? stopLeafId(catalog.lessonsOf(currentTopicId), appState.readIds) : null,
    }),
  );
  // The practice pool decides, so Capstone (no own questions, pools every topic) counts as practisable.
  const withQuestions = $derived(new Set(topics.filter((t) => buildPool(catalog, t.id).length > 0).map((t) => t.id)));
  const summaryById = $derived(new Map(appState.summaries.map((s) => [s.topicId, s])));
  const topicById = $derived(new Map(topics.map((t, i) => [t.id, { topic: t, prev: i > 0 ? topics[i - 1] : null }])));

  let scroller = $state<HTMLDivElement>();

  /** Horizontal centre of what the learner is working on; the trunk when there is no current topic. */
  function focusX(): number {
    const branch = layout.branches.find((b) => b.topicId === currentTopicId);
    if (!branch) return layout.trunk.x;
    const xs = [branch.node.left, branch.node.right, ...branch.leaves.map((l) => l.x)];
    return (Math.min(...xs) + Math.max(...xs)) / 2;
  }

  // The canvas remounts on every tab switch. Centre on the current topic only the first time it opens
  // after app start; afterwards put the view back exactly where the learner left it.
  // The position is recorded as the learner scrolls rather than on teardown: by then Svelte has already
  // detached the element, so its scrollLeft would read 0.
  onMount(() => {
    if (!scroller) return;
    const el = scroller;
    const saved = recallTreeScroll();
    if (saved) {
      el.scrollLeft = saved.left;
      window.scrollTo({ top: saved.top });
    } else {
      el.scrollLeft = Math.max(0, focusX() - el.clientWidth / 2);
    }
    rememberTreeScroll({ left: el.scrollLeft, top: window.scrollY });
    const record = () => rememberTreeScroll({ left: el.scrollLeft, top: window.scrollY });
    el.addEventListener('scroll', record, { passive: true });
    window.addEventListener('scroll', record, { passive: true });
    return () => {
      el.removeEventListener('scroll', record);
      window.removeEventListener('scroll', record);
    };
  });

  const DRAG_THRESHOLD = 4;
  let drag: { x: number; left: number; moved: boolean } | null = null;
  let dragging = $state(false);

  function onpointerdown(e: PointerEvent): void {
    if (e.button !== 0 || !scroller) return;
    if ((e.target as Element).closest('button, a, [role="button"], [tabindex]')) return;
    drag = { x: e.clientX, left: scroller.scrollLeft, moved: false };
  }

  function onpointermove(e: PointerEvent): void {
    if (!drag || !scroller) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) < DRAG_THRESHOLD) return;
    if (!drag.moved) {
      drag.moved = true;
      dragging = true;
      scroller.setPointerCapture(e.pointerId);
    }
    scroller.scrollLeft = drag.left - dx;
  }

  function endDrag(): void {
    drag = null;
    dragging = false;
  }

  function openLesson(topicId: string, lessonId: string): void {
    appState.open({ view: 'lesson', topicId, lessonId });
  }

  function openCheckpoint(groupIndex: number): void {
    appState.open({ view: 'checkpoint', groupIndex });
  }

  function openHistory(topicId: string): void {
    appState.open({ view: 'history', topicId });
  }

  function openPractice(topicId: string): void {
    appState.open({ view: 'practice', topicId });
  }
</script>

<div
  role="presentation"
  bind:this={scroller}
  class="overflow-x-auto rounded-lg border border-border-subtle bg-surface select-none {dragging ? 'cursor-grabbing' : 'cursor-grab'}"
  {onpointerdown}
  {onpointermove}
  onpointerup={endDrag}
  onpointercancel={endDrag}
>
  <svg
    role="group"
    aria-label={i18n.t('mindmap.treeLabel')}
    viewBox="0 0 {layout.width} {layout.height}"
    width={layout.width}
    height={layout.height}
    class="mx-auto block max-w-none font-sans"
  >
    <TrunkWater {layout} {water} />

    {#each layout.tierMarks as mark (mark.tier)}
      <rect x={layout.trunk.x - 70} y={mark.y - 16} width="140" height="32" rx="16" class="fill-tier" />
      <text x={layout.trunk.x} y={mark.y + 4} text-anchor="middle" font-size="11" font-weight="700" letter-spacing="1" class="fill-tier-foreground">
        {i18n.t(`mindmap.tier.${mark.tier}`).toUpperCase()}
      </text>
    {/each}

    {#each layout.branches as branch (branch.topicId)}
      {@const entry = topicById.get(branch.topicId)}
      {#if entry}
        <TopicBranch
          {branch}
          topic={entry.topic}
          status={appState.statuses.get(branch.topicId) ?? 'locked'}
          prevTitle={entry.prev ? entry.prev.title[i18n.locale] : null}
          lessons={catalog.lessonsOf(branch.topicId)}
          readIds={appState.readIds}
          review={summaryById.get(branch.topicId) ?? null}
          lockedByCheckpoint={pendingGate(branch.topicId)}
          hasQuestions={withQuestions.has(branch.topicId)}
          expanded={branch.topicId === expandedTopicId}
          canvasWidth={layout.width}
          trunkX={layout.trunk.x}
          {ontoggle}
          onopenlesson={openLesson}
          onopenpractice={openPractice}
          {onexpand}
          onopenhistory={openHistory}
        />
      {/if}
    {/each}

    {#each layout.checkpoints as cp (cp.groupIndex)}
      {@const group = groupByIndex.get(cp.groupIndex)}
      {#if group}
        <CheckpointNode
          groupIndex={cp.groupIndex}
          x={layout.trunk.x}
          y={cp.y}
          state={checkpointState(group, appState.completed, appState.passedGroups)}
          onopen={openCheckpoint}
        />
      {/if}
    {/each}
  </svg>
</div>
