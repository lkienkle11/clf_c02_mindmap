<script lang="ts">
  import { setI18n } from '@/i18n/i18n.svelte';
  import type { I18n } from '@/i18n/i18n.svelte';
  import { LessonScreen } from '@/features/lesson';
  import { TreeScreen } from '@/features/mindmap';
  import { HistoryScreen } from '@/features/history';
  import { PracticeScreen, ResumeGate } from '@/features/practice';
  import type { PracticeSession } from '@/features/practice';
  import { ReviewLauncher, ReviewPrompts, ReviewRun, ReviewScreen } from '@/features/review';
  import { SettingsScreen } from '@/features/settings';
  import AppHeader from './AppHeader.svelte';
  import type { AppState } from './app-state.svelte';
  import type { Services } from './composition';
  import { openExternal } from './external-link';

  // Feature screens (Tasks 14-17) receive `services` and `appState` as props from here.
  let { services, appState, i18n }: { services: Services; appState: AppState; i18n: I18n } = $props();

  // Safe: `i18n` is a long-lived instance created once in main.ts and never swapped for another one;
  // its `locale` is a rune inside the instance, so language changes stay reactive without re-reading the prop.
  // svelte-ignore state_referenced_locally
  setI18n(i18n);

  // Safe: services and appState are long-lived and never swapped, like `i18n` above.
  // svelte-ignore state_referenced_locally
  const launcher = new ReviewLauncher(services, appState);

  // A session restored by the resume prompt; dropped as soon as the user leaves the practice screen.
  let resumed = $state.raw<PracticeSession | null>(null);
  $effect(() => {
    if (appState.view !== 'practice') resumed = null;
  });

  function onresumed(session: PracticeSession): void {
    if (session.kind === 'review') {
      appState.reviewRun = ReviewRun.adoptSingle(session);
      appState.open({ view: 'review' });
      return;
    }
    resumed = session;
    appState.open({ view: 'practice', topicId: session.topicId ?? '' });
  }
</script>

<AppHeader {services} {appState} onreview={(mode) => launcher.start(mode)} />
<main>
  {#if appState.view === 'tree'}
    <TreeScreen {services} {appState} />
  {:else if appState.view === 'lesson'}
    <LessonScreen {services} {appState} {openExternal} />
  {:else if appState.route.view === 'practice'}
    {#key appState.route.topicId}
      <PracticeScreen {services} {appState} topicId={appState.route.topicId} initialSession={resumed} />
    {/key}
  {:else if appState.view === 'review'}
    <ReviewScreen {services} {appState} />
  {:else if appState.view === 'history'}
    <HistoryScreen {services} {appState} />
  {:else}
    <SettingsScreen {services} {appState} />
  {/if}
  <ReviewPrompts {services} {appState} {launcher} />
  <ResumeGate {services} {appState} {onresumed} activeAttemptId={resumed?.attemptId ?? null} />
</main>
