<script lang="ts">
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import type { PracticeSession } from '../session.svelte';
  import { formatClock } from './time';

  interface Props {
    services: Services;
    session: PracticeSession;
    onerror: () => void;
  }

  let { services, session, onerror }: Props = $props();

  const i18n = getI18n();
  const remainingMs = $derived(session.remainingMs);
  const timed = $derived(remainingMs !== null);
  let announcement = $state('');
  let previousSeconds: number | null = null;

  // One interval; each tick reports the REAL time since the previous tick (timers can fire late).
  $effect(() => {
    if (!timed || session.submitted) return;
    let last = services.now();
    let inFlight = false;
    const id = setInterval(() => {
      if (inFlight) return;
      const now = services.now();
      const elapsed = now - last;
      last = now;
      inFlight = true;
      session
        .tick(elapsed)
        .catch(() => onerror())
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

{#if remainingMs !== null}
  <p class="text-lg font-semibold tabular-nums">
    <span class="sr-only">{i18n.t('practice.timerLabel')}: </span>
    <span role="timer" aria-live="off">{formatClock(remainingMs)}</span>
  </p>
{/if}
<p class="sr-only" role="status" aria-live="polite" data-testid="timer-announcement">{announcement}</p>
