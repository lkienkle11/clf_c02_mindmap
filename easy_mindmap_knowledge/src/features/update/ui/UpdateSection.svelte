<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import Modal from '@/ui/Modal.svelte';
  import { formatMegabytes } from '../logic/format';
  import type { UpdateController } from '../logic/update-controller.svelte';

  interface Props {
    controller: UpdateController;
  }

  let { controller }: Props = $props();

  const i18n = getI18n();
  const headingId = $props.id();
  let confirming = $state(false);

  const info = $derived(controller.info);
  const size = $derived(info?.sizeBytes != null ? formatMegabytes(info.sizeBytes) : null);
  const percent = $derived(controller.percent);
  const progress = $derived(controller.progress);

  /** The visible words that name the progress bar; null before the first chunk arrives. */
  const downloadText = $derived(
    percent !== null
      ? i18n.t('update.downloading', { percent })
      : progress !== null
        ? i18n.t('update.downloadingBytesNoTotal', { done: formatMegabytes(progress.downloaded) })
        : null,
  );
  const bytesText = $derived(
    progress !== null && progress.total !== null
      ? i18n.t('update.downloadingBytes', {
          done: formatMegabytes(progress.downloaded),
          total: formatMegabytes(progress.total),
        })
      : null,
  );

  const errorKey = $derived(
    controller.errorStage === 'download'
      ? 'update.downloadFailed'
      : controller.errorStage === 'install'
        ? 'update.installFailed'
        : 'update.checkFailed',
  );

  function retry(): void {
    if (controller.errorStage === 'download') void controller.download();
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
    <Button class="self-start" onclick={() => controller.download()}>
      {size !== null ? i18n.t('update.download', { size }) : i18n.t('update.downloadNoSize')}
    </Button>
  {:else if controller.status === 'downloading'}
    <div class="flex flex-col gap-1">
      {#if downloadText}
        <p id="{headingId}-progress">{downloadText}</p>
      {/if}
      <progress
        class="h-2 w-full accent-primary"
        max="100"
        value={percent ?? undefined}
        aria-valuenow={percent ?? undefined}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-labelledby={downloadText ? `${headingId}-progress` : undefined}
        aria-label={downloadText ? undefined : i18n.t('update.heading')}
      ></progress>
      {#if bytesText}
        <p class="text-sm text-muted-foreground">{bytesText}</p>
      {/if}
    </div>
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
  {#snippet footer()}
    <div class="flex flex-wrap justify-end gap-3">
      <Button variant="secondary" onclick={() => (confirming = false)}>{i18n.t('update.modal.later')}</Button>
      <Button onclick={install}>{i18n.t('update.modal.confirm')}</Button>
    </div>
  {/snippet}
</Modal>
