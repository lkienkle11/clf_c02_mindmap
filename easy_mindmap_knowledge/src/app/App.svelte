<script lang="ts">
  import { setI18n } from '@/i18n/i18n.svelte';
  import type { I18n } from '@/i18n/i18n.svelte';
  import { LessonScreen } from '@/features/lesson';
  import { TreeScreen, practiceUnlocked } from '@/features/mindmap';
  import { ExamScreen, checkpointGroups } from '@/features/exam';
  import { HistoryScreen } from '@/features/history';
  import { PracticeScreen, ResumeGate } from '@/features/practice';
  import type { PracticeSession } from '@/features/practice';
  import { ReviewLauncher, ReviewPrompts, ReviewRun, ReviewScreen } from '@/features/review';
  import { SettingsScreen } from '@/features/settings';
  import AppHeader from './AppHeader.svelte';
  import NoticeStack from './NoticeStack.svelte';
  import type { Notice } from './NoticeStack.svelte';
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
    if (appState.view !== 'practice' && appState.view !== 'checkpoint') resumed = null;
  });

  // The webview's <html lang> follows the chosen UI language (screen readers, hyphenation, fonts).
  $effect(() => {
    document.documentElement.lang = i18n.locale;
  });

  const reviewNoticeKeys = {
    empty: 'review.empty',
    startFailed: 'review.startFailed',
    hideFailed: 'review.hideFailed',
  } as const;
  let resumeNotice = $state<string | null>(null);
  const notices = $derived<Notice[]>([
    ...(launcher.notice
      ? [{ id: 'review', text: i18n.t(reviewNoticeKeys[launcher.notice]), onclose: () => launcher.clearNotice() }]
      : []),
    ...(resumeNotice ? [{ id: 'resume', text: resumeNotice, onclose: () => (resumeNotice = null) }] : []),
  ]);

  /** The checkpoint group this topic closes (when it is the group's last topic), or null. */
  function checkpointAfter(topicId: string): number | null {
    return checkpointGroups(services.catalog.topics).find((g) => g.topicIds.at(-1) === topicId)?.index ?? null;
  }

  function onresumed(session: PracticeSession): void {
    if (session.kind === 'review') {
      appState.reviewRun = ReviewRun.adoptSingle(session);
      appState.open({ view: 'review' });
      return;
    }
    resumed = session;
    if (session.kind === 'checkpoint' && session.groupIndex !== null) {
      appState.open({ view: 'checkpoint', groupIndex: session.groupIndex });
      return;
    }
    appState.open({ view: 'practice', topicId: session.topicId ?? '' });
  }
</script>

<AppHeader {services} {appState} onreview={(mode) => launcher.start(mode)} />
<main>
  {#if appState.view === 'tree'}
    <TreeScreen {services} {appState} />
  {:else if appState.view === 'lesson'}
    <LessonScreen
      {services}
      {appState}
      {openExternal}
      canPractice={(topicId) => practiceUnlocked(services.catalog.lessonsOf(topicId), appState.readIds)}
    />
  {:else if appState.route.view === 'checkpoint'}
    {#key appState.route.groupIndex}
      <ExamScreen {services} {appState} groupIndex={appState.route.groupIndex} initialSession={resumed} />
    {/key}
  {:else if appState.route.view === 'practice' && appState.route.topicId === 'capstone'}
    <ExamScreen {services} {appState} groupIndex={null} initialSession={resumed} />
  {:else if appState.route.view === 'practice'}
    {#key appState.route.topicId}
      <PracticeScreen {services} {appState} topicId={appState.route.topicId} checkpointAfter={checkpointAfter(appState.route.topicId)} initialSession={resumed} />
    {/key}
  {:else if appState.view === 'review'}
    <ReviewScreen {services} {appState} />
  {:else if appState.view === 'history'}
    <HistoryScreen {services} {appState} />
  {:else}
    <SettingsScreen {services} {appState} />
  {/if}
  <ReviewPrompts {services} {appState} {launcher} />
  <ResumeGate {services} {appState} {onresumed} activeAttemptId={resumed?.attemptId ?? null} onnotice={(text) => (resumeNotice = text)} />
  <NoticeStack {notices} />
</main>
