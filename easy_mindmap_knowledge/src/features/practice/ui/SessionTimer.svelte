<script lang="ts">
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { PracticeSession } from '../session.svelte';
  import { formatClock } from './time';

  interface Props {
    services: Services;
    session: PracticeSession;
    /** 'submit' when the time ran out and saving the attempt failed; 'clock' when saving the clock failed. */
    onerror: (what: 'submit' | 'clock') => void;
  }

  let { services, session, onerror }: Props = $props();

  const i18n = getI18n();
  const remainingMs = $derived(session.remainingMs);
  const timed = $derived(remainingMs !== null);
  let announcement = $state('');
  let previousSeconds: number | null = null;
  // Non-reactive: the interval's previous-tick mark (lifted so the visibility handler can reset it) and the hidden mark.
  let last = 0;
  let hiddenAt: number | null = null;

  function reportError() {
    // Time is up => the failing step was the automatic submit, not the clock save.
    onerror(session.remainingMs !== null && session.remainingMs <= 0 ? 'submit' : 'clock');
  }

  // Hidden time is settled by the session according to the tab-switch policy; the interval skips ticks meanwhile.
  function onvisibilitychange() {
    if (!timed || session.submitted) return;
    if (document.visibilityState === 'hidden') {
      hiddenAt ??= services.now();
      return;
    }
    if (hiddenAt === null) return;
    const now = services.now();
    const hiddenMs = Math.max(0, now - hiddenAt);
    hiddenAt = null;
    last = now;
    session.settleHidden(hiddenMs).catch(reportError);
  }

  // One interval; each tick reports the REAL time since the previous tick (timers can fire late).
  $effect(() => {
    if (!timed || session.submitted) return;
    last = services.now();
    let inFlight = false;
    const id = setInterval(() => {
      if (inFlight || document.visibilityState === 'hidden') return;
      const now = services.now();
      const elapsed = now - last;
      last = now;
      inFlight = true;
      session
        .tick(elapsed)
        .catch(reportError)
        .finally(() => { inFlight = false; });
    }, 1000);
    return () => clearInterval(id);
  });

  // Polite announcement only when crossing 5 min, 1 min and 10 s; the visible timer stays aria-live off.
  $effect(() => {
    if (remainingMs === null) return;
    const seconds = Math.ceil(remainingMs / 1000);
    const marks: [number, string][] = [[300, 'm5'], [60, 'm1'], [10, 's10']];
    if (previousSeconds !== null) {
      for (const [at, key] of marks) {
        if (previousSeconds > at && seconds <= at) announcement = i18n.t(`practice.announce.${key}`);
      }
    }
    previousSeconds = seconds;
  });
</script>

<svelte:document {onvisibilitychange} />

{#if remainingMs !== null}
  <p class="text-lg font-semibold tabular-nums">
    <span class="sr-only">{i18n.t('practice.timerLabel')}: </span>
    <span role="timer" aria-live="off">{formatClock(remainingMs)}</span>
  </p>
{/if}
<p class="sr-only" role="status" aria-live="polite" data-testid="timer-announcement">{announcement}</p>
