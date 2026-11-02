<script lang="ts">
  import { getI18n } from '@/i18n/i18n.svelte';
  import Button from '@/ui/Button.svelte';
  import Modal from '@/ui/Modal.svelte';

  interface Props {
    open: boolean;
    busy: boolean;
    oncontinue: () => void;
    ondiscard: () => void;
  }

  let { open, busy, oncontinue, ondiscard }: Props = $props();

  const i18n = getI18n();
</script>

<!-- A choice is required, so Escape and the backdrop do nothing. -->
<Modal {open} title={i18n.t('practice.resume.title')} onclose={() => {}}>
  <p class="mb-5">{i18n.t('practice.resume.question')}</p>
  <div class="flex justify-end gap-3">
    <Button variant="secondary" disabled={busy} onclick={ondiscard}>{i18n.t('practice.resume.discard')}</Button>
    <Button disabled={busy} onclick={oncontinue}>{i18n.t('practice.resume.continue')}</Button>
  </div>
</Modal>
