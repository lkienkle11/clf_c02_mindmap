<script lang="ts">
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import { CorruptAttemptError } from '../errors';
  import { PracticeSession } from '../session.svelte';
  import ResumePrompt from './ResumePrompt.svelte';

  interface Props {
    services: Services;
    appState: AppState;
    /** Receives the restored session (already submitted when its time ran out while the app was closed). */
    onresumed: (session: PracticeSession) => void;
    /** Attempt id of the session currently on screen; its in-progress row is not "unfinished". */
    activeAttemptId?: string | null;
  }

  let { services, appState, onresumed, activeAttemptId = null }: Props = $props();

  const i18n = getI18n();
  const found = $derived(appState.resumeAttempt?.attempt.id === activeAttemptId ? null : appState.resumeAttempt);
  const open = $derived(found !== null && appState.view !== 'practice' && appState.view !== 'review');
  let busy = $state(false);
  let notice = $state<string | null>(null);

  async function discard(attemptId: string): Promise<void> {
    await services.repos.attempts.discard(attemptId);
    await appState.refresh();
  }

  async function resume(): Promise<void> {
    if (!found || busy) return;
    busy = true;
    notice = null;
    try {
      const { session, autoSubmit } = await PracticeSession.resume(services, found, () => appState.refresh());
      if (autoSubmit) {
        // The result is exposed before any follow-up failure, so a late error must not block the result.
        await session.submit('timeout').catch(() => {});
        if (!session.submitted) throw new Error('submit failed');
      }
      // The row is now owned by a live session, so it must not be offered again.
      appState.resumeAttempt = null;
      onresumed(session);
    } catch (e) {
      if (e instanceof CorruptAttemptError) {
        try {
          await discard(found.attempt.id);
          notice = i18n.t('practice.resume.corrupt');
        } catch {
          notice = i18n.t('practice.resume.failed');
        }
      } else {
        notice = i18n.t('practice.resume.failed');
      }
    } finally {
      busy = false;
    }
  }

  async function discardClicked(): Promise<void> {
    if (!found || busy) return;
    busy = true;
    notice = null;
    try {
      await discard(found.attempt.id);
    } catch {
      notice = i18n.t('practice.resume.failed');
    } finally {
      busy = false;
    }
  }
</script>

<ResumePrompt {open} {busy} oncontinue={resume} ondiscard={discardClicked} />

{#if notice}
  <div role="status" class="fixed right-4 bottom-4 z-40 flex max-w-sm items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-lg">
    <p>{notice}</p>
    <Button variant="ghost" onclick={() => (notice = null)}>{i18n.t('common.close')}</Button>
  </div>
{/if}
