<script lang="ts">
  import { setI18n } from '@/i18n/i18n.svelte';
  import type { I18n } from '@/i18n/i18n.svelte';
  import { LessonScreen } from '@/features/lesson';
  import { TreeScreen } from '@/features/mindmap';
  import { PracticeScreen, ResumeGate } from '@/features/practice';
  import type { PracticeSession } from '@/features/practice';
  import { ReviewButton, ReviewLauncher, ReviewPrompts, ReviewRun, ReviewScreen } from '@/features/review';
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

<main>
  {#if appState.view === 'tree'}
    <TreeScreen {services} {appState}>
      {#snippet actions()}
        <ReviewButton {services} {appState} onstart={(mode) => launcher.start(mode)} />
      {/snippet}
    </TreeScreen>
  {:else if appState.view === 'lesson'}
    <LessonScreen {services} {appState} {openExternal} />
  {:else if appState.route.view === 'practice'}
    {#key appState.route.topicId}
      <PracticeScreen {services} {appState} topicId={appState.route.topicId} initialSession={resumed} />
    {/key}
  {:else if appState.view === 'review'}
    <ReviewScreen {services} {appState} />
  {:else}
    <!-- replaced in Tasks 15-17: one real screen per view -->
    <div class="p-6">
      <h1 class="text-2xl font-semibold">{i18n.t(`nav.${appState.view}`)}</h1>
    </div>
  {/if}
  <ReviewPrompts {services} {appState} {launcher} />
  <ResumeGate {services} {appState} {onresumed} activeAttemptId={resumed?.attemptId ?? null} />
</main>
