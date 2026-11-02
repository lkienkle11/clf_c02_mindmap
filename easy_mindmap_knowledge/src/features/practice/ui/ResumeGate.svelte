<script lang="ts">
  import type { AppState } from '@/app/app-state.svelte';
  import type { Services } from '@/app/composition';
  import { getI18n } from '@/i18n/i18n.svelte';
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
    /** A message for the app's shared notice stack (null clears it); the gate does not position notices itself. */
    onnotice: (text: string | null) => void;
  }

  let { services, appState, onresumed, activeAttemptId = null, onnotice }: Props = $props();

  const i18n = getI18n();
  const found = $derived(appState.resumeAttempt?.attempt.id === activeAttemptId ? null : appState.resumeAttempt);
  const open = $derived(found !== null && appState.view !== 'practice' && appState.view !== 'review');
  let busy = $state(false);

  async function discard(attemptId: string): Promise<void> {
    await services.repos.attempts.discard(attemptId);
    await appState.refresh();
  }

  async function resume(): Promise<void> {
    if (!found || busy) return;
    busy = true;
    onnotice(null);
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
          onnotice(i18n.t('practice.resume.corrupt'));
        } catch {
          onnotice(i18n.t('practice.resume.failed'));
        }
      } else {
        onnotice(i18n.t('practice.resume.failed'));
      }
    } finally {
      busy = false;
    }
  }

  async function discardClicked(): Promise<void> {
    if (!found || busy) return;
    busy = true;
    onnotice(null);
    try {
      await discard(found.attempt.id);
    } catch {
      onnotice(i18n.t('practice.resume.failed'));
    } finally {
      busy = false;
    }
  }
</script>

<ResumePrompt {open} {busy} oncontinue={resume} ondiscard={discardClicked} />

