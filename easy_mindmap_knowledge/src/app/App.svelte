<script lang="ts">
  import { setI18n } from '@/i18n/i18n.svelte';
  import type { I18n } from '@/i18n/i18n.svelte';
  import type { AppState } from './app-state.svelte';
  import type { Services } from './composition';

  // Feature screens (Tasks 14-17) receive `services` and `appState` as props from here.
  let { services, appState, i18n }: { services: Services; appState: AppState; i18n: I18n } = $props();

  // Safe: `i18n` is a long-lived instance created once in main.ts and never swapped for another one;
  // its `locale` is a rune inside the instance, so language changes stay reactive without re-reading the prop.
  // svelte-ignore state_referenced_locally
  setI18n(i18n);
</script>

<main class="p-6">
  <!-- replaced in Task 14..17: one real screen per view -->
  <h1 class="text-2xl font-semibold">{i18n.t(`nav.${appState.view}`)}</h1>
  <p>{i18n.t('app.topicCount', { count: services.catalog.topics.length })}</p>
</main>
