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
    controller: UpdateController;
  }

  let { controller }: Props = $props();

  const i18n = getI18n();
  const headingId = $props.id();
  let confirming = $state(false);

  const info = $derived(controller.info);
  const size = $derived(info?.sizeBytes != null ? formatMegabytes(info.sizeBytes) : null);
  const hasNotes = $derived(pickNotes(parseNotes(info?.notes), i18n.locale).length > 0);

  const errorKey = $derived(
    controller.errorStage === 'download'
      ? 'update.downloadFailed'
      : controller.errorStage === 'install'
        ? 'update.installFailed'
        : 'update.checkFailed',
  );

  function retry(): void {
    if (controller.errorStage === 'download') void controller.download();
    else if (controller.errorStage === 'install') void controller.install();
    else void controller.check();
  }

  function install(): void {
    confirming = false;
    void controller.install();
  }
</script>

<section class="flex flex-col gap-3" aria-labelledby={headingId}>
  <h2 id={headingId} class="text-lg font-semibold">{i18n.t('update.heading')}</h2>

  {#if controller.status === 'checking'}
    <p role="status" class="text-sm text-muted-foreground">{i18n.t('update.checking')}</p>
  {:else if controller.status === 'upToDate'}
    <p role="status" class="text-sm text-muted-foreground">{i18n.t('update.upToDate')}</p>
  {:else if controller.status === 'available' && info}
    <p>{i18n.t('update.available', { version: info.version })}</p>
    {#if hasNotes}
      <div class="flex flex-col gap-1">
        <h3 class="text-sm font-semibold">{i18n.t('update.notes.heading')}</h3>
        <UpdateNotes notes={info.notes} />
      </div>
    {/if}
    <Button class="self-start" onclick={() => controller.download()}>
      {size !== null ? i18n.t('update.download', { size }) : i18n.t('update.downloadNoSize')}
    </Button>
  {:else if controller.status === 'downloading'}
    <UpdateProgress {controller} {headingId} />
  {:else if controller.status === 'ready'}
    <Button class="self-start" onclick={() => (confirming = true)}>{i18n.t('update.install')}</Button>
  {:else if controller.status === 'installing'}
    <div class="flex flex-col gap-2">
      <Button class="self-start" disabled>{i18n.t('update.installing')}</Button>
      <progress class="h-2 w-full accent-primary" max="100" aria-label={i18n.t('update.installing')}></progress>
    </div>
  {:else if controller.status === 'error'}
    <p role="alert" class="font-medium text-danger">{i18n.t(errorKey)}</p>
    <Button variant="secondary" class="self-start" onclick={retry}>{i18n.t('update.retry')}</Button>
  {/if}
</section>

<Modal open={confirming} title={i18n.t('update.modal.title')} onclose={() => (confirming = false)}>
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
  {#snippet footer()}
    <div class="flex flex-wrap justify-end gap-3">
      <Button variant="secondary" onclick={() => (confirming = false)}>{i18n.t('update.modal.later')}</Button>
      <Button onclick={install}>{i18n.t('update.modal.confirm')}</Button>
    </div>
  {/snippet}
</Modal>
