<script lang="ts">
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import LessonPanel from './LessonPanel.svelte';

  interface Props {
    services: Services;
    appState: AppState;
    openExternal: (url: string) => Promise<void>;
  }

  let { services, appState, openExternal }: Props = $props();

  // Only unlocked topics (done or current) may open lessons; anything else goes back to the tree.
  const lesson = $derived.by(() => {
    const route = appState.route;
    if (route.view !== 'lesson') return null;
    const status = appState.statuses.get(route.topicId);
    if (status === undefined || status === 'locked') return null;
    return services.catalog.lessonsOf(route.topicId).find((l) => l.id === route.lessonId) ?? null;
  });

  $effect(() => {
    if (appState.route.view === 'lesson' && lesson === null) appState.open({ view: 'tree' });
  });
</script>

{#if lesson}
  {#key lesson.id}
    <LessonPanel {services} {appState} {lesson} {openExternal} />
  {/key}
{/if}
