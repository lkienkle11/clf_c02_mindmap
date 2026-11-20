<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import Modal from '@/ui/Modal.svelte';
  import { parseNotes, pickNotes } from '../logic/changelog';
  import { formatMegabytes } from '../logic/format';
  import type { UpdateController } from '../logic/update-controller.svelte';
  import UpdateNotes from './UpdateNotes.svelte';
  import UpdateProgress from './UpdateProgress.svelte';

  interface Props {
    controller: UpdateController | null;
    /** True while another prompt or a practice, review or checkpoint session has the user's attention. */
    blocked: boolean;
  }

  let { controller, blocked }: Props = $props();

  const i18n = getI18n();
  const headingId = $props.id();

  // The prompt appears at most once per app run: `started` is never reset, so it cannot reopen.
  let started = $state(false);
  let closed = $state(false);

  $effect(() => {
    if (!started && controller?.promptable && !blocked) started = true;
  });

  const info = $derived(controller?.info ?? null);
  const busy = $derived(controller?.status === 'downloading' || controller?.status === 'installing');
  // Hidden while another prompt or session takes over, but never mid-download or mid-install.
  const open = $derived(controller !== null && started && !closed && (!blocked || busy));
  const size = $derived(info?.sizeBytes != null ? formatMegabytes(info.sizeBytes) : null);
  const hasNotes = $derived(pickNotes(parseNotes(info?.notes), i18n.locale).length > 0);

  const errorKey = $derived(
    controller?.errorStage === 'download'
      ? 'update.downloadFailed'
      : controller?.errorStage === 'install'
        ? 'update.installFailed'
        : 'update.checkFailed',
  );

  function postponeAndClose(): void {
    void controller?.postpone();
    closed = true;
  }

  function onclose(): void {
    if (busy) return;
    if (controller?.status === 'available') postponeAndClose();
    else closed = true;
  }

  function retry(): void {
    if (!controller) return;
    // A retried download goes on to install, as the first click on the update button did.
    if (controller.errorStage === 'download') void controller.updateNow();
    else if (controller.errorStage === 'install') void controller.install();
    else void controller.check();
  }
</script>

{#if controller}

<Modal {open} title={i18n.t('update.modal.title')} {onclose}>
  {#if controller.status === 'error'}
    <p role="alert" class="font-medium text-danger">{i18n.t(errorKey)}</p>
  {:else if busy || controller.status === 'ready'}
    {#if controller.status === 'installing'}
      <p role="status">{i18n.t('update.installing')}</p>
      <progress class="h-2 w-full accent-primary" max="100" aria-label={i18n.t('update.installing')}></progress>
    {:else}
      <UpdateProgress {controller} {headingId} />
    {/if}
  {:else}
    <p>
      {size !== null && info
        ? i18n.t('update.modal.body', { version: info.version, size })
        : i18n.t('update.modal.bodyNoSize', { version: info?.version ?? '' })}
    </p>
    {#if hasNotes && info}
      <div class="mt-3 flex flex-col gap-1">
        <h3 class="text-sm font-semibold">{i18n.t('update.notes.heading')}</h3>
        <UpdateNotes notes={info.notes} />
      </div>
    {/if}
  {/if}
  {#snippet footer()}
    {#if controller.status === 'error'}
      <div class="flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onclick={() => (closed = true)}>{i18n.t('common.close')}</Button>
        <Button onclick={retry}>{i18n.t('update.retry')}</Button>
      </div>
    {:else if controller.status === 'available'}
      <div class="flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onclick={postponeAndClose}>{i18n.t('update.modal.later')}</Button>
        <Button onclick={() => controller?.updateNow()}>{i18n.t('update.modal.confirm')}</Button>
      </div>
    {/if}
  {/snippet}
</Modal>
{/if}
