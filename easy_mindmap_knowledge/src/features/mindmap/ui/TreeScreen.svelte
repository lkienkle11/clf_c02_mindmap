<script lang="ts">
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import TreeCanvas from './TreeCanvas.svelte';

  interface Props {
    services: Services;
    appState: AppState;
  }

  let { services, appState }: Props = $props();

  const i18n = getI18n();
  const currentTopicId = $derived(
    [...services.catalog.topics]
      .sort((a, b) => a.order - b.order)
      .find((t) => appState.statuses.get(t.id) === 'current')?.id ?? null,
  );
  // null = the user has not chosen yet, so the current topic is open by default.
  let choice = $state.raw<{ id: string | null } | null>(null);
  const expandedTopicId = $derived(choice ? choice.id : currentTopicId);

  function toggle(topicId: string): void {
    if (appState.statuses.get(topicId) === 'locked') return;
    choice = { id: expandedTopicId === topicId ? null : topicId };
  }
</script>

<section class="p-4">
  <h1 class="mb-4 text-2xl font-semibold">{i18n.t('nav.tree')}</h1>
  <TreeCanvas {services} {appState} {expandedTopicId} ontoggle={toggle} />
</section>
