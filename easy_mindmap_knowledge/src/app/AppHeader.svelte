<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import { ReviewButton } from '@/features/review';
  import type { ReviewMode } from '@/features/review';
  import { cn } from '@/ui/cn';
  import type { AppState, Route, View } from './app-state.svelte';
  import type { Services } from './composition';

  interface Props {
    services: Services;
    appState: AppState;
    onreview: (mode: ReviewMode) => void;
  }

  let { services, appState, onreview }: Props = $props();

  const i18n = getI18n();
  const items: { view: 'tree' | 'history' | 'reports' | 'settings'; label: string; route: Route }[] = [
    { view: 'tree', label: 'nav.tree', route: { view: 'tree' } },
    { view: 'history', label: 'nav.history', route: { view: 'history' } },
    { view: 'reports', label: 'report.tab', route: { view: 'reports' } },
    { view: 'settings', label: 'nav.settings', route: { view: 'settings' } },
  ];
  // A lesson belongs to the mindmap section.
  const section = $derived<View>(appState.view === 'lesson' ? 'tree' : appState.view);
  // Hidden mid-attempt so the only way out of a session is its own Exit.
  const hidden = $derived(appState.view === 'practice' || appState.view === 'review' || appState.view === 'checkpoint');
</script>

{#if !hidden}
  <header class="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle bg-surface px-4 py-2">
    <span class="text-lg font-semibold">{i18n.t('app.title')}</span>
    <nav aria-label={i18n.t('nav.main')} class="flex flex-wrap items-center gap-1">
      {#each items as item (item.view)}
        {@const current = section === item.view}
        <button
          type="button"
          aria-current={current ? 'page' : undefined}
          class={cn(
            'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg px-4 font-medium transition-colors',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            current ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted',
          )}
          onclick={() => appState.open(item.route)}
        >{i18n.t(item.label)}{#if item.view === 'reports' && appState.newReportCount > 0}<span class="sr-only">, {i18n.t('report.tab.new', { n: appState.newReportCount })}</span><span
              aria-hidden="true"
              class="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-danger px-1.5 text-sm font-semibold text-danger-foreground"
            >{appState.newReportCount}</span>{/if}</button>
      {/each}
      <ReviewButton {services} {appState} onstart={onreview} />
    </nav>
  </header>
{/if}
