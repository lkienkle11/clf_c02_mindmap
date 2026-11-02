<script lang="ts">
  import { setI18n } from '@/i18n/i18n.svelte';
  import type { I18n } from '@/i18n/i18n.svelte';
  import { LessonScreen } from '@/features/lesson';
  import { TreeScreen } from '@/features/mindmap';
  import type { AppState } from './app-state.svelte';
  import type { Services } from './composition';
  import { openExternal } from './external-link';

  // Feature screens (Tasks 14-17) receive `services` and `appState` as props from here.
  let { services, appState, i18n }: { services: Services; appState: AppState; i18n: I18n } = $props();

  // Safe: `i18n` is a long-lived instance created once in main.ts and never swapped for another one;
  // its `locale` is a rune inside the instance, so language changes stay reactive without re-reading the prop.
  // svelte-ignore state_referenced_locally
  setI18n(i18n);
</script>

<main>
  {#if appState.view === 'tree'}
    <TreeScreen {services} {appState} />
  {:else if appState.view === 'lesson'}
    <LessonScreen {services} {appState} {openExternal} />
  {:else}
    <!-- replaced in Tasks 15-17: one real screen per view -->
    <div class="p-6">
      <h1 class="text-2xl font-semibold">{i18n.t(`nav.${appState.view}`)}</h1>
    </div>
  {/if}
</main>
