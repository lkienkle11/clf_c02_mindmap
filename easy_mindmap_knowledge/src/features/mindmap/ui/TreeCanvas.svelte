<script lang="ts">
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import { layoutTree } from '../logic/tree-layout';
  import { stopLeafId, waterPath } from '../logic/water-path';
  import TopicBranch from './TopicBranch.svelte';
  import TrunkWater from './TrunkWater.svelte';

  interface Props {
    services: Services;
    appState: AppState;
    expandedTopicId: string | null;
    ontoggle: (topicId: string) => void;
  }

  let { services, appState, expandedTopicId, ontoggle }: Props = $props();

  const i18n = getI18n();
  const catalog = $derived(services.catalog);
  const topics = $derived([...catalog.topics].sort((a, b) => a.order - b.order));
  const layout = $derived(layoutTree(topics, { expandedTopicId }));
  const currentTopicId = $derived(topics.find((t) => appState.statuses.get(t.id) === 'current')?.id ?? null);
  const water = $derived(
    waterPath(layout, {
      statuses: appState.statuses,
      currentTopicId,
      stopLeafId: currentTopicId ? stopLeafId(catalog.lessonsOf(currentTopicId), appState.readIds) : null,
    }),
  );
  const topicById = $derived(new Map(topics.map((t, i) => [t.id, { topic: t, prev: i > 0 ? topics[i - 1] : null }])));

  function openLesson(topicId: string, lessonId: string): void {
    appState.open({ view: 'lesson', topicId, lessonId });
  }

  function openPractice(topicId: string): void {
    appState.open({ view: 'practice', topicId });
  }
</script>

<div class="overflow-x-auto rounded-lg border border-border-subtle bg-surface">
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
          hasQuestions={catalog.questionsOf(branch.topicId).length > 0}
          expanded={branch.topicId === expandedTopicId}
          canvasWidth={layout.width}
          trunkX={layout.trunk.x}
          {ontoggle}
          onopenlesson={openLesson}
          onopenpractice={openPractice}
        />
      {/if}
    {/each}
  </svg>
</div>
